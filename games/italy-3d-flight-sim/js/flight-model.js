/* Italy 3D Flight Sim — force-based flight model (pure logic)
 *
 * Units: SI. One world unit is one metre of height and of airspeed, the same
 * convention the HUD uses. The map itself is heavily compressed, so horizontal
 * travel is scaled (motionFactor) and air density uses a separate vertical
 * scale (ATMOS_METRES_PER_UNIT).
 *
 * Body frame (matches the Three.js meshes): right = +X, up = +Y, nose = -Z.
 * Rates: p = roll (right positive), q = pitch (nose up positive),
 * r = yaw (nose right positive).
 */

import { clamp } from '../../_kit/core.js';
import { WORLD } from './config.js';
import { terrainHeight } from './geo.js';

export const G = 9.81;
export const RHO0 = 1.225;
export const ATMOS_METRES_PER_UNIT = 10;
export const GEAR_HEIGHT = 1.5;

const CY_BETA = 0.7;
const STALL_BLEND = 0.12;
const ALPHA_NEG_STALL = -0.28;
const ELEVATOR_LOW = -0.2;
const SUBSTEPS = 2;
/* Horizontal motion over the compressed map is slowed: to half in flight, so that
 * turns fit between cities, and further near the ground, so that take-off and
 * landing rolls fit the runways. Airspeed and forces are not affected. */
export const CRUISE_MOTION = 0.5;
export const GROUND_MOTION = 0.2;
const GROUND_MOTION_BLEND = 50;
const AIRBORNE_HEIGHT = 6;

export const FLAPS = [
  { name: 'UP', lift: 0, drag: 0 },
  { name: '1', lift: 0.25, drag: 0.012 },
  { name: 'FULL', lift: 0.5, drag: 0.045 }
];
const GEAR_DRAG = 0.02;

export const motionFactor = height =>
  GROUND_MOTION + (CRUISE_MOTION - GROUND_MOTION) * smooth((height - 2) / GROUND_MOTION_BLEND);

/* ---------- small vector / quaternion helpers ---------- */
const v3 = (x, y, z) => ({ x, y, z });
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a, b) => v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
const scale = (a, k) => v3(a.x * k, a.y * k, a.z * k);
const length = a => Math.hypot(a.x, a.y, a.z);
function normalize(a, fallback) {
  const n = length(a);
  return n > 1e-6 ? scale(a, 1 / n) : fallback;
}

function qMul(a, b) {
  return {
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w
  };
}
function qNormalize(q) {
  const n = Math.hypot(q.w, q.x, q.y, q.z) || 1;
  return { w: q.w / n, x: q.x / n, y: q.y / n, z: q.z / n };
}
function qRotate(q, v) {
  const u = v3(q.x, q.y, q.z);
  const t = scale(cross(u, v), 2);
  const c = cross(u, t);
  return v3(v.x + q.w * t.x + c.x, v.y + q.w * t.y + c.y, v.z + q.w * t.z + c.z);
}
const axisQ = (x, y, z, angle) => {
  const s = Math.sin(angle / 2);
  return { w: Math.cos(angle / 2), x: x * s, y: y * s, z: z * s };
};

/* heading/pitch/roll <-> quaternion, in the renderer's 'YXZ' order */
export function quatFromAttitude(heading, pitch, roll) {
  return qMul(qMul(axisQ(0, 1, 0, -heading), axisQ(1, 0, 0, pitch)), axisQ(0, 0, 1, -roll));
}
export function attitudeFromQuat({ w, x, y, z }) {
  const m13 = 2 * (x * z + w * y);
  const m23 = 2 * (y * z - w * x);
  const m33 = 1 - 2 * (x * x + y * y);
  const m21 = 2 * (x * y + w * z);
  const m22 = 1 - 2 * (x * x + z * z);
  const heading = (-Math.atan2(m13, m33) + Math.PI * 2) % (Math.PI * 2);
  return { heading, pitch: Math.asin(-clamp(m23, -1, 1)), roll: -Math.atan2(m21, m22) };
}

/* ---------- aerodynamics ---------- */
export const hasAeroData = plane => !!plane.aero;

export function airDensity(y) {
  const h = Math.max(0, y) * ATMOS_METRES_PER_UNIT;
  if (h <= 11000) return RHO0 * Math.pow(1 - 0.0065 * h / 288.15, 4.256);
  return 0.3639 * Math.exp(-(h - 11000) / 6342);
}

export const stallAlpha = aero => (aero.clMax - aero.cl0) / aero.clAlpha;

const smooth = t => { const c = clamp(t, 0, 1); return c * c * (3 - 2 * c); };

/* 0 = attached flow, 1 = fully stalled */
export function stallFactor(aero, alpha) {
  if (alpha >= 0) return smooth((alpha - stallAlpha(aero)) / STALL_BLEND);
  return smooth((ALPHA_NEG_STALL - alpha) / STALL_BLEND);
}

export function liftCoefficient(aero, alpha, flaps = 0) {
  const s = stallFactor(aero, alpha);
  const attached = aero.cl0 + FLAPS[flaps].lift + aero.clAlpha * clamp(alpha, ALPHA_NEG_STALL, stallAlpha(aero));
  const plate = 0.9 * Math.sin(2 * alpha);
  return attached * (1 - s) + plate * s;
}

const inducedFactor = aero => 1 / (Math.PI * aero.aspect * aero.oswald);

export function engineThrust(aero, spool, speed, rho) {
  const sigma = rho / RHO0;
  if (aero.power) {
    const available = aero.power * aero.propEff / Math.max(speed, 1);
    return spool * Math.min(aero.staticThrust, available) * sigma;
  }
  return spool * aero.thrust * Math.pow(sigma, 0.8);
}

/* Drag rise near the aircraft's rated top speed, so level flight tops out there. */
function waveDrag(plane, speed) {
  const { aero, maxSpeed } = plane;
  const onset = maxSpeed * 0.8;
  if (speed <= onset) return 0;
  const q = 0.5 * RHO0 * maxSpeed * maxSpeed * aero.area;
  const cl = aero.mass * G / q;
  const atMax = engineThrust(aero, 1, maxSpeed, RHO0) / q - aero.cd0 - inducedFactor(aero) * cl * cl;
  const t = (speed - onset) / (maxSpeed - onset);
  return Math.max(0, atMax) * t * t;
}

export function dragCoefficient(plane, alpha, beta, speed, brake = false, flaps = 0, gearDown = false) {
  const { aero } = plane;
  const cl = liftCoefficient(aero, alpha, flaps);
  const sin = Math.sin(alpha);
  return aero.cd0 + inducedFactor(aero) * cl * cl
    + stallFactor(aero, alpha) * 1.8 * sin * sin
    + 0.3 * beta * beta + waveDrag(plane, speed) + (brake ? aero.brakeDrag : 0)
    + FLAPS[flaps].drag + (gearDown && aero.retractable ? GEAR_DRAG : 0);
}

/* Steady-state figures at sea level, used by tests and tuning. */
export function performance(plane, y = 0, flaps = 0) {
  const { aero } = plane;
  const rho = airDensity(y);
  const stallSpeed = Math.sqrt(2 * aero.mass * G / (rho * aero.area * (aero.clMax + FLAPS[flaps].lift)));
  let maxLevelSpeed = stallSpeed;
  for (let v = stallSpeed; v < plane.maxSpeed * 2; v += 0.25) {
    const q = 0.5 * rho * v * v * aero.area;
    const alpha = (aero.mass * G / q - aero.cl0) / aero.clAlpha;
    if (engineThrust(aero, 1, v, rho) >= q * dragCoefficient(plane, alpha, 0, v)) maxLevelSpeed = v;
  }
  return { stallSpeed, maxLevelSpeed };
}

export function levelAlpha(plane, speed, y, flaps = 0) {
  const { aero } = plane;
  const q = 0.5 * airDensity(y) * speed * speed * aero.area;
  const cl0 = aero.cl0 + FLAPS[flaps].lift;
  return clamp((aero.mass * G / Math.max(q, 1) - cl0) / aero.clAlpha, -0.1, stallAlpha(aero) * 0.9);
}

/* ---------- state ---------- */
/* Put the aircraft in trimmed level flight at its current position and heading. */
export function initRealState(state, plane, speed = plane.aero.cruise, { flaps = 0, gear = !plane.aero.retractable } = {}) {
  const alpha = levelAlpha(plane, speed, state.y, flaps);
  state.model = 'real';
  state.speed = speed;
  state.vx = Math.sin(state.heading) * speed;
  state.vy = 0;
  state.vz = -Math.cos(state.heading) * speed;
  state.pitch = alpha;
  state.roll = 0;
  state.quat = quatFromAttitude(state.heading, alpha, 0);
  state.p = 0; state.q = 0; state.r = 0;
  state.elev = 0; state.ail = 0; state.rud = 0;
  state.trim = alpha;
  state.spool = state.throttle;
  state.alpha = alpha; state.beta = 0; state.gLoad = 1;
  state.ias = speed * Math.sqrt(airDensity(state.y) / RHO0);
  state.verticalSpeed = 0;
  state.onGround = false;
  state.stallWarn = false;
  state.gearWarn = false;
  state.flaps = flaps;
  state.gear = gear;
  state.airborne = true;
  state.touchdown = null;
  return state;
}

/* Stand still on the ground, ready for a take-off roll. */
export function initGroundState(state, plane, x, z, heading) {
  state.x = x; state.z = z; state.heading = heading;
  state.throttle = 0;
  state.ground = terrainHeight(x, z);
  state.y = state.ground + GEAR_HEIGHT;
  initRealState(state, plane, plane.aero.cruise);
  Object.assign(state, {
    speed: 0, ias: 0, vx: 0, vy: 0, vz: 0, pitch: 0, roll: 0, spool: 0, alpha: 0, gLoad: 0,
    quat: quatFromAttitude(heading, 0, 0), flaps: 1, gear: true, onGround: true, airborne: false,
    trim: levelAlpha(plane, plane.stall * 1.35, state.y, 1)
  });
  return state;
}

/* The elevator commands angle of attack around the trimmed value; these two
 * functions are each other's inverse, for the model and the autopilot. */
const alphaCeiling = aero => stallAlpha(aero) + (aero.limiter ? -0.03 : 0.06);

export function alphaFromElevator(aero, trim, elevator) {
  return elevator >= 0
    ? trim + elevator * Math.max(0, alphaCeiling(aero) - trim)
    : trim + elevator * Math.max(0, trim - ELEVATOR_LOW);
}

export function elevatorFromAlpha(aero, trim, alpha) {
  const span = alpha >= trim ? alphaCeiling(aero) - trim : trim - ELEVATOR_LOW;
  return clamp((alpha - trim) / Math.max(span, 0.01), -1, 1);
}

const approach = (value, target, step) => value + clamp(target - value, -step, step);

function substep(state, plane, input, h) {
  const { aero } = plane;
  const weight = aero.mass * G;
  const empty = state.fuel <= 0;

  state.elev = approach(state.elev, clamp(input.pitch || 0, -1, 1), 3 * h);
  state.ail = approach(state.ail, clamp(input.turn || 0, -1, 1), 4 * h);
  state.rud = approach(state.rud, clamp(input.yaw || 0, -1, 1), 4 * h);
  state.trim = clamp(state.trim + clamp(input.trim || 0, -1, 1) * 0.06 * h, -0.1, stallAlpha(aero) * 0.9);
  const demand = empty ? 0 : state.throttle * (state.boosting ? plane.boost || 1.3 : 1);
  state.spool += (demand - state.spool) * Math.min(1, h / aero.spool);

  const rho = airDensity(state.y);
  const right = qRotate(state.quat, v3(1, 0, 0));
  const up = qRotate(state.quat, v3(0, 1, 0));
  const nose = qRotate(state.quat, v3(0, 0, -1));
  const vel = v3(state.vx, state.vy, state.vz);
  const speed = length(vel);
  const moving = speed > 2;
  const alpha = moving ? Math.atan2(-dot(vel, up), dot(vel, nose)) : 0;
  const beta = moving ? Math.asin(clamp(dot(vel, right) / speed, -1, 1)) : 0;

  const qS = 0.5 * rho * speed * speed * aero.area;
  const flaps = state.flaps;
  const cl0 = aero.cl0 + FLAPS[flaps].lift;
  const lift = qS * liftCoefficient(aero, alpha, flaps);
  const drag = qS * dragCoefficient(plane, alpha, beta, speed, input.brake, flaps, state.gear);
  const thrust = engineThrust(aero, state.spool, speed, rho);
  const along = normalize(vel, nose);
  const liftDir = normalize(cross(right, along), up);
  const sideDir = normalize(cross(along, liftDir), right);
  const side = -qS * CY_BETA * beta;

  const acc = v3(
    (nose.x * thrust + liftDir.x * lift - along.x * drag + sideDir.x * side) / aero.mass,
    (nose.y * thrust + liftDir.y * lift - along.y * drag + sideDir.y * side) / aero.mass - G,
    (nose.z * thrust + liftDir.z * lift - along.z * drag + sideDir.z * side) / aero.mass
  );

  /* How fast the flight path itself is rotating, in body axes. Damping acts
   * relative to this, so a steady turn or pull-up does not fight itself. */
  const pathRate = speed > 5 ? scale(cross(vel, acc), 1 / (speed * speed)) : v3(0, 0, 0);
  const qPath = dot(pathRate, right);
  const rPath = -dot(pathRate, up);

  const authority = clamp(speed / aero.cruise, 0.15, 1.2);
  const stalled = stallFactor(aero, alpha);

  let alphaCmd = alphaFromElevator(aero, state.trim, state.elev);
  if (qS > 1) {
    const gHigh = (aero.gMax * weight / qS - cl0) / aero.clAlpha;
    const gLow = (-0.4 * aero.gMax * weight / qS - cl0) / aero.clAlpha;
    alphaCmd = clamp(alphaCmd, Math.min(gLow, gHigh), gHigh);
  }

  const wp = aero.pitchFreq * authority;
  state.q += (wp * wp * (alphaCmd - alpha) - 1.5 * wp * (state.q - qPath) - (aero.limiter ? 0 : 1.2 * stalled)) * h;

  const wy = 2.2 * authority;
  const rudderBeta = -state.rud * 0.2;
  state.r += (wy * wy * (beta - rudderBeta) - 1.6 * wy * (state.r - rPath) - aero.adverseYaw * state.ail * authority) * h;

  let pCmd = state.ail * aero.rollRate * authority - 0.8 * beta * authority;
  /* Gentle wing leveller when the stick is centred and the bank is shallow. */
  if (Math.abs(input.turn || 0) < 0.05 && Math.abs(state.roll) < 0.8) pCmd -= 0.35 * state.roll;
  if (!aero.limiter && stalled > 0) pCmd += (beta > 0 ? -1 : 1) * 0.5 * stalled;
  state.p += (pCmd - state.p) * Math.min(1, 4 * Math.max(0.3, authority) * h);

  const wx = state.q, wyy = -state.r, wz = -state.p;
  const rate = Math.hypot(wx, wyy, wz);
  if (rate > 1e-8) {
    state.quat = qNormalize(qMul(state.quat, axisQ(wx / rate, wyy / rate, wz / rate, rate * h)));
  }

  state.vx += acc.x * h; state.vy += acc.y * h; state.vz += acc.z * h;
  const motion = motionFactor(state.y - state.ground - GEAR_HEIGHT);
  state.x += state.vx * motion * h; state.y += state.vy * h; state.z += state.vz * motion * h;

  state.alpha = alpha;
  state.beta = beta;
  state.gLoad = lift / weight;
  Object.assign(state, attitudeFromQuat(state.quat));
}

function groundContact(state, plane, input, h) {
  state.ground = terrainHeight(state.x, state.z);
  const floor = state.ground + GEAR_HEIGHT;
  if (state.y > floor) {
    state.onGround = false;
    if (state.y > floor + AIRBORNE_HEIGHT) state.airborne = true;
    return;
  }

  if (!state.onGround) {
    const sink = Math.max(0, -state.vy);
    const speed = Math.hypot(state.vx, state.vy, state.vz);
    if (sink > plane.aero.maxSink || speed > plane.landSpeed + 22 || !state.gear ||
        Math.abs(state.roll) > 0.4 || state.pitch < -0.25 || floor - state.y > 5) {
      state.status = 'crashed';
    } else if (state.airborne) {
      /* First contact after a flight: remember it so the landing can be graded. */
      state.airborne = false;
      state.touchdown = { x: state.x, z: state.z, heading: state.heading, sink, speed };
    }
  }
  state.y = floor;
  state.onGround = true;
  state.vy = Math.max(0, state.vy);

  /* Wheels: no sideways slip, rolling friction or brakes, nosewheel steering. */
  let roll = Math.hypot(state.vx, state.vz);
  roll = Math.max(0, roll - (input.brake ? 6 : 0.25) * h);
  const steer = clamp((input.yaw || 0) + (input.turn || 0), -1, 1);
  const heading = (state.heading + steer * 0.6 * Math.min(1, roll / 10) * h + Math.PI * 2) % (Math.PI * 2);
  const pitch = clamp(state.pitch, 0, 0.26);
  if (pitch !== state.pitch) state.q = 0;
  state.heading = heading;
  state.pitch = pitch;
  state.roll *= Math.exp(-6 * h);
  state.p = 0; state.r = 0;
  state.quat = quatFromAttitude(heading, pitch, state.roll);
  state.vx = Math.sin(heading) * roll;
  state.vz = -Math.cos(heading) * roll;
}

export function stepRealFlight(state, plane, input, dt) {
  state.throttle = clamp(input.throttle ?? 0, 0, 1);
  state.boosting = state.fuel > 0 && !!input.boost && state.throttle > 0.05;
  const h = dt / SUBSTEPS;
  for (let i = 0; i < SUBSTEPS && state.status === 'flying'; i++) {
    substep(state, plane, input, h);
    state.x = clamp(state.x, -WORLD.width / 2 - 60, WORLD.width / 2 + 60);
    state.z = clamp(state.z, -WORLD.depth / 2 - 60, WORLD.depth / 2 + 60);
    groundContact(state, plane, input, h);
  }
  state.speed = Math.hypot(state.vx, state.vy, state.vz);
  state.verticalSpeed = state.vy;
  state.ias = state.speed * Math.sqrt(airDensity(state.y) / RHO0);
  state.stallWarn = !state.onGround && state.y > state.ground + 4 &&
    (state.alpha > stallAlpha(plane.aero) - 0.045 || state.alpha < ALPHA_NEG_STALL);
  state.gearWarn = !state.gear && !state.onGround && state.y - state.ground < 60 &&
    state.vy < -0.5 && state.speed < plane.landSpeed + 30;
  return state;
}
