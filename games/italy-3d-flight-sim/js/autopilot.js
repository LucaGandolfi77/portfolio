/* Italy 3D Flight Sim — autopilot for the realistic model (pure logic)
 *
 * Holds heading (or steers to a target), altitude and airspeed by producing the
 * same stick and throttle inputs a pilot would.
 */

import { clamp } from '../../_kit/core.js';
import { angleDiff } from './airfields.js';
import { FLAPS, G, airDensity, elevatorFromAlpha, stallAlpha } from './flight-model.js';

export const ALT_STEP = 25;

export function createAutopilot(state, plane) {
  return {
    mode: 'hdg',
    heading: state.heading,
    altitude: Math.round(Math.max(state.y, state.ground + 40)),
    speed: clamp(state.speed, plane.stall * 1.4, plane.maxSpeed * 0.9),
    /* Set to a climb rate to override altitude hold, as a flare does. */
    verticalSpeed: null,
    bias: 0,
    power: state.throttle
  };
}

/* `target` is a world position used in 'nav' mode. */
export function stepAutopilot(ap, state, plane, dt, target = null) {
  if (ap.mode === 'nav' && target) {
    const dx = target.x - state.x, dz = target.z - state.z;
    if (Math.hypot(dx, dz) > 25) ap.heading = (Math.atan2(dx, -dz) + Math.PI * 2) % (Math.PI * 2);
  }

  const bankWanted = clamp(angleDiff(ap.heading, state.heading) * 1.4, -0.45, 0.45);
  const turn = clamp((bankWanted - state.roll) * 2.2 - state.p * 0.6, -1, 1);

  /* Altitude error sets a climb angle; the angle error sets the load factor; and
   * that load factor is flown by asking for the matching angle of attack. */
  const { aero } = plane;
  const speed = Math.max(state.speed, plane.stall * 0.8);
  const limit = speed * 0.12;
  const rateWanted = ap.verticalSpeed ?? clamp((ap.altitude - state.y) * 0.22, -limit, limit);
  const angle = Math.asin(clamp(state.vy / speed, -0.9, 0.9));
  const angleWanted = Math.asin(clamp(rateWanted / speed, -0.3, 0.3));
  const response = Math.min(1, aero.pitchFreq * 0.35);
  const turnRate = (angleWanted - angle) * response;
  const load = clamp((Math.cos(angle) + speed * turnRate / G) / Math.max(0.6, Math.cos(state.roll)), 0.4, Math.min(1.8, aero.gMax));
  const qS = 0.5 * airDensity(state.y) * speed * speed * aero.area;
  const alpha = (load * aero.mass * G / qS - aero.cl0 - FLAPS[state.flaps].lift) / aero.clAlpha;
  ap.bias = clamp(ap.bias + (angleWanted - angle) * 0.12 * dt, -0.12, 0.12);
  const wanted = clamp(alpha + ap.bias, -0.12, stallAlpha(aero) - 0.05);
  const pitch = elevatorFromAlpha(aero, state.trim, wanted);
  /* Move the trim after it, so little elevator is left when the pilot takes over. */
  const trim = clamp((wanted - state.trim) * 12, -1, 1);

  const speedError = (ap.speed - state.speed) / Math.max(ap.speed, 1);
  ap.power = clamp(ap.power + speedError * 0.5 * dt, 0, 1);
  const throttle = clamp(ap.power + speedError * 2, 0, 1);

  return { turn, pitch, yaw: 0, trim, throttle };
}
