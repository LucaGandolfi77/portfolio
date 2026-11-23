/* Italy 2D Flight Sim — side-view flight model (pure logic, no browser APIs) */

import { clamp } from '../../_kit/core.js';
import { WORLD } from './config.js';
import { AIRPORTS_W, normalizeAngle } from './map.js';

export const MAX_ALT = WORLD.maxAlt;

export function runwayVector(airport) {
  return { x: airport.dir || 1, y: 0 };
}

export function createFlight(plane, airport, alt = 90) {
  return {
    x: airport.x, y: WORLD.ground,
    heading: (airport.dir || 1) > 0 ? 0 : Math.PI,
    speed: plane.stall + 22,
    alt,
    fuel: plane.fuel,
    throttle: 0.7,
    status: 'flying',
    boosting: false,
    vz: 0,
    stallWarn: false,
    fuelWarn: false
  };
}

export function stepFlight(state, plane, input, dt) {
  if (state.status !== 'flying') return state;

  const throttle = clamp(input.throttle ?? 0, 0, 1);
  state.throttle = throttle;
  const empty = state.fuel <= 0;
  state.boosting = !empty && !!input.boost && throttle > 0.05;
  const boost = state.boosting ? (plane.boost || 1.3) : 1;
  const target = empty ? 0 : plane.maxSpeed * throttle * boost;
  const accel = plane.accel * boost * (input.brake ? 3.2 : 1) * (empty ? 0.6 : 1);
  state.speed = Math.max(0, state.speed + clamp(target - state.speed, -accel * dt, accel * dt));

  // In side view, steering turns the aircraft east or west along the route.
  const desired = input.turn > 0.05 ? 0 : input.turn < -0.05 ? Math.PI : state.heading;
  let diff = normalizeAngle(desired - state.heading);
  if (diff > Math.PI) diff -= Math.PI * 2;
  const turnStep = clamp(diff, -plane.turn * 1.7 * dt, plane.turn * 1.7 * dt);
  state.heading = normalizeAngle(state.heading + turnStep);

  state.x += Math.cos(state.heading) * state.speed * dt;
  if (state.x < 0 || state.x > WORLD.w) {
    state.x = clamp(state.x, 0, WORLD.w);
    state.speed *= 0.85;
  }

  state.vz = clamp(input.pitch || 0, -1, 1);
  state.alt = clamp(state.alt + state.vz * plane.climb * dt, 0, MAX_ALT);
  state.stallWarn = state.speed < plane.stall && state.alt > 4;
  if (state.stallWarn) state.alt = Math.max(0, state.alt - (plane.stall - state.speed) * 1.6 * dt);
  if (state.alt <= 0 && state.speed > plane.landSpeed + 6) state.status = 'crashed';

  state.fuel = Math.max(0, state.fuel - plane.burn * (0.3 + 0.7 * throttle) * (state.boosting ? 2.2 : 1) * dt);
  state.fuelWarn = state.fuel < plane.fuel * 0.18;
  return state;
}

// 'off', 'high', 'angle', 'fast' or 'ok' — landing strips face east or west.
export function landingCheck(state, plane, airport) {
  if (Math.abs(state.x - airport.x) > 28) return 'off';
  if (state.alt > 16) return 'high';
  if (Math.cos(state.heading) * (airport.dir || 1) < 0.7 && plane.kind !== 'heli') return 'angle';
  if (state.speed > plane.landSpeed) return 'fast';
  return 'ok';
}

export function checkLanding(state, plane) {
  for (const airport of AIRPORTS_W) {
    if (Math.abs(state.x - airport.x) > 60) continue;
    const result = landingCheck(state, plane, airport);
    if (result === 'ok') return { result, airport };
  }
  return { result: 'none', airport: null };
}

export function headingDegrees(heading) {
  return Math.round(normalizeAngle(heading) * 180 / Math.PI) % 360;
}

export function toKm(worldUnits) {
  return Math.max(0, worldUnits / 13);
}
