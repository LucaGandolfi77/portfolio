/* Italy Glight Sim — arcade flight model (pure logic, no browser APIs) */

import { clamp } from '../../_kit/core.js';
import { WORLD } from './config.js';
import { AIRPORTS_W, angleDiff, distance, normalizeAngle } from './map.js';

export const MAX_ALT = WORLD.maxAlt;

export function runwayVector(airport) {
  const a = airport.rwy * Math.PI / 180;
  return { x: Math.sin(a), y: -Math.cos(a) };
}

export function createFlight(plane, airport, alt = 90) {
  return {
    x: airport.x, y: airport.y,
    heading: airport.rwy * Math.PI / 180,
    speed: plane.stall + 22,
    alt,
    fuel: plane.fuel,
    throttle: 0.7,
    status: 'flying',
    boosting: false,
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
  const delta = clamp(target - state.speed, -accel * dt, accel * dt);
  state.speed = Math.max(0, state.speed + delta);

  const speedFactor = 0.4 + 0.6 * Math.min(1, state.speed / (plane.maxSpeed || 1));
  state.heading = normalizeAngle(state.heading + (input.turn || 0) * plane.turn * speedFactor * dt);
  state.x += Math.sin(state.heading) * state.speed * dt;
  state.y -= Math.cos(state.heading) * state.speed * dt;
  state.x = clamp(state.x, -30, WORLD.w + 30);
  state.y = clamp(state.y, -30, WORLD.h + 30);

  state.alt = clamp(state.alt + (input.pitch || 0) * plane.climb * dt, 0, MAX_ALT);
  state.stallWarn = state.speed < plane.stall && state.alt > 4;
  if (state.stallWarn) state.alt = Math.max(0, state.alt - (plane.stall - state.speed) * 1.6 * dt);
  if (state.alt <= 0 && state.speed > plane.landSpeed + 6) state.status = 'crashed';

  state.fuel = Math.max(0, state.fuel - plane.burn * (0.3 + 0.7 * throttle) * (state.boosting ? 2.2 : 1) * dt);
  state.fuelWarn = state.fuel < plane.fuel * 0.18;
  return state;
}

// Returns 'ok' or the reason a touchdown fails: 'off', 'high', 'angle', 'fast'.
export function landingCheck(state, plane, airport) {
  const v = runwayVector(airport);
  const dx = state.x - airport.x, dy = state.y - airport.y;
  const along = dx * v.x + dy * v.y;
  const across = Math.abs(dx * -v.y + dy * v.x);
  if (Math.abs(along) > 38 || across > 15) return 'off';
  if (state.alt > 16) return 'high';
  if (angleDiff(state.heading, airport.rwy * Math.PI / 180) > 0.44 && plane.kind !== 'heli') return 'angle';
  if (state.speed > plane.landSpeed) return 'fast';
  return 'ok';
}

export function checkLanding(state, plane) {
  for (const airport of AIRPORTS_W) {
    if (distance(state, airport) > 70) continue;
    const result = landingCheck(state, plane, airport);
    if (result === 'ok') return { result, airport };
  }
  return { result: 'none', airport: null };
}

export function headingDegrees(heading) {
  return Math.round(normalizeAngle(heading) * 180 / Math.PI) % 360;
}

// Rough conversion for the HUD: ~13 world units per "map kilometre".
export function toKm(worldUnits) {
  return Math.max(0, worldUnits / 13);
}
