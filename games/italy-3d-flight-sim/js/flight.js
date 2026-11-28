/* Italy 3D Flight Sim — flight entry points and arcade model (pure logic).
 * The force-based realistic model lives in flight-model.js. */

import { clamp } from '../../_kit/core.js';
import { WORLD } from './config.js';
import { geoToWorld, terrainHeight } from './geo.js';
import { FLAPS, hasAeroData, initGroundState, initRealState, stepRealFlight } from './flight-model.js';
import { airfield, threshold } from './airfields.js';

export function airportPosition(airport) {
  return airfield(airport.code) || geoToWorld(airport.lon, airport.lat);
}

export function cycleFlaps(state) {
  if (state.model === 'real') state.flaps = (state.flaps + 1) % FLAPS.length;
  return state;
}

/* Retractable gear only, and never while the wheels carry the aircraft. */
export function toggleGear(state, plane) {
  if (state.model === 'real' && plane.aero.retractable && !state.onGround) state.gear = !state.gear;
  return state;
}

/* Put a realistic aircraft at the start of a runway. */
export function lineUp(state, plane, airport, end = 1) {
  const t = threshold(airfield(airport.code), end);
  return initGroundState(state, plane, t.x, t.z, t.heading);
}

export function runwayDirection(airport) {
  const a = airport.rwy * Math.PI / 180;
  return { x: Math.sin(a), z: -Math.cos(a) };
}

/* The model actually flown: craft without aerodynamic data are always arcade. */
export function flightModelFor(plane, wanted) {
  return wanted === 'real' && hasAeroData(plane) ? 'real' : 'arcade';
}

/* Switch model in mid-air, keeping position, heading and (roughly) speed. */
export function setStateModel(state, plane, wanted) {
  const model = flightModelFor(plane, wanted);
  if (state.model === model) return state;
  if (model === 'real') {
    state.y = Math.max(state.y, state.ground + 40);
    return initRealState(state, plane, clamp(state.speed, plane.stall * 1.35, plane.maxSpeed * 0.9));
  }
  state.model = 'arcade';
  state.pitch = clamp(state.pitch, -0.55, 0.55);
  return state;
}

/* Send a flying aircraft back up in level flight, e.g. after a landing. */
export function relaunch(state, plane, y) {
  state.y = y;
  if (state.model === 'real') return initRealState(state, plane);
  state.speed = plane.stall + 16;
  state.verticalSpeed = 0;
  return state;
}

export function createFlight(plane, airport, altitude = 220, wanted = 'arcade', onRunway = false) {
  const p = airportPosition(airport);
  const ground = terrainHeight(p.x, p.z);
  const state = {
    model: 'arcade',
    x: p.x, y: ground + altitude, z: p.z,
    heading: airport.rwy * Math.PI / 180,
    pitch: 0.04, roll: 0,
    speed: plane.stall + 35,
    verticalSpeed: 0,
    fuel: plane.fuel, throttle: 0.72,
    status: 'flying', boosting: false,
    stallWarn: false, fuelWarn: false, ground
  };
  if (flightModelFor(plane, wanted) === 'real') {
    if (onRunway) lineUp(state, plane, airport);
    else initRealState(state, plane);
  }
  return state;
}

/* Consumption is scaled so that a tank covers the long legs of the large map. */
export const FUEL_RATE = 0.1;

function burnFuel(state, plane, dt) {
  state.fuel = Math.max(0, state.fuel - plane.burn * FUEL_RATE * (0.3 + 0.7 * state.throttle) * (state.boosting ? 2.2 : 1) * dt);
  state.fuelWarn = state.fuel < plane.fuel * 0.18;
}

export function stepFlight(state, plane, input, dt) {
  if (state.status !== 'flying') return state;
  if (state.model === 'real') {
    stepRealFlight(state, plane, input, dt);
    burnFuel(state, plane, dt);
    return state;
  }
  const throttle = clamp(input.throttle ?? 0, 0, 1);
  state.throttle = throttle;
  const empty = state.fuel <= 0;
  state.boosting = !empty && !!input.boost && throttle > 0.05;
  const boost = state.boosting ? (plane.boost || 1.3) : 1;
  const target = empty ? 0 : plane.maxSpeed * throttle * boost;
  const accel = plane.accel * boost * (input.brake ? 3 : 1) * (empty ? 0.6 : 1);
  state.speed = Math.max(0, state.speed + clamp(target - state.speed, -accel * dt, accel * dt));

  const turn = clamp(input.turn || 0, -1, 1);
  const pitchInput = clamp(input.pitch || 0, -1, 1);
  state.heading = (state.heading + turn * plane.turn * dt + Math.PI * 2) % (Math.PI * 2);
  state.pitch = clamp(state.pitch + pitchInput * 0.9 * dt - state.pitch * 0.45 * dt, -0.55, 0.55);
  state.roll = state.roll + (turn * 0.5 - state.roll) * Math.min(1, dt * 5);

  const horizontal = state.speed * Math.cos(state.pitch);
  state.x += Math.sin(state.heading) * horizontal * dt;
  state.z -= Math.cos(state.heading) * horizontal * dt;
  state.x = clamp(state.x, -WORLD.width / 2 - 60, WORLD.width / 2 + 60);
  state.z = clamp(state.z, -WORLD.depth / 2 - 60, WORLD.depth / 2 + 60);

  state.stallWarn = state.speed < plane.stall && state.y > state.ground + 12;
  const sink = state.stallWarn ? (plane.stall - state.speed) * 1.7 : 0;
  state.verticalSpeed = state.speed * Math.sin(state.pitch) - sink;
  state.y += state.verticalSpeed * dt;

  state.ground = terrainHeight(state.x, state.z);
  if (state.y < state.ground + 1.5) {
    state.y = state.ground + 1.5;
    const impact = Math.max(0, -state.verticalSpeed);
    if (impact > 28 || state.speed > plane.landSpeed + 22) state.status = 'crashed';
    else { state.verticalSpeed = 0; state.pitch = Math.max(state.pitch, 0); }
  }
  burnFuel(state, plane, dt);
  return state;
}

export function landingCheck(state, plane, airport) {
  const p = airportPosition(airport);
  const dist = Math.hypot(state.x - p.x, state.z - p.z);
  if (dist > 70) return 'off';
  const agl = state.y - terrainHeight(p.x, p.z);
  if (agl > 22) return 'high';
  const r = runwayDirection(airport);
  // Either end of the runway will do.
  const align = Math.abs(Math.sin(state.heading) * r.x + -Math.cos(state.heading) * r.z);
  if (align < 0.78 && plane.kind !== 'heli') return 'angle';
  if (state.speed > plane.landSpeed) return 'fast';
  if (Math.abs(state.pitch) > 0.3 && plane.kind !== 'heli') return 'pitch';
  return 'ok';
}

export function checkLanding(state, plane, airports) {
  for (const airport of airports) {
    const result = landingCheck(state, plane, airport);
    if (result === 'ok') return { result, airport };
  }
  return { result: 'none', airport: null };
}

export function headingDegrees(heading) {
  return Math.round((heading * 180 / Math.PI) % 360 + 360) % 360;
}

export function distanceToAirport(state, airport) {
  const p = airportPosition(airport);
  return Math.hypot(state.x - p.x, state.z - p.z);
}
