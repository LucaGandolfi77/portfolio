/* ============================================================
   Agente Zero — ball physics (pure, no DOM)
   ------------------------------------------------------------
   World in metres: x to the right, y toward the hoop, z up.
   The rim centre sits at (hoopX, 0, 3.05); the backboard face is
   the plane y = BOARD_Y behind it. A shot is simulated whole when
   it is released, at a fixed 240 Hz step, so the same release
   always gives the same result; the renderer plays the recorded
   path back.
   ============================================================ */

export const G = 9.81;
export const BALL_R = 0.12;
export const RIM = { r: 0.2286, z: 3.05, tube: 0.0095 };
export const BOARD_Y = RIM.r + 0.151;
export const BOARD = { half: 0.9, bottom: 2.9, top: 3.95 };
export const RELEASE_Z = 2.4;
export const STEP = 1 / 240;
export const FRAME = 1 / 60;

const DRAG = 0.0225;          // 0.5·ρ·Cd·A/m for a size-7 ball
const MAGNUS = 0.0045;        // lift per (rad/s · m/s)
const SPIN_DECAY = 0.25;      // per second
const I_RATIO = 2 / 3;        // I / (m r²) — hollow sphere
const SURF = {
  rim: { e: 0.56, mu: 0.28 },
  board: { e: 0.66, mu: 0.3 },
  floor: { e: 0.78, mu: 0.45 },
  hand: { e: 0.4, mu: 0.2 },
};

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);

/** Hoop x at absolute time t (seconds) for an env with an optional moving hoop. */
export function hoopX(env, t) {
  const m = env && env.moving;
  return m ? m.amp * Math.sin(m.freq * Math.PI * 2 * t + (m.phase || 0)) : 0;
}

/** Height of the defender's hand at absolute time t (null when there is none). */
export function handAt(env, t) {
  const d = env && env.defender;
  if (!d) return null;
  const ph = ((t + (d.phase || 0)) % d.period) / d.period;
  const jump = ph < 0.45 ? Math.sin((ph / 0.45) * Math.PI) : 0;
  return [d.x, d.y, 2.25 + jump * 1.05];
}

/** Bounce the ball (p, v, w) off a contact with outward normal n. Mutates. */
function bounce(b, n, s) {
  const vn = dot(b.v, n);
  if (vn >= 0) return false;
  // tangential velocity of the contact point, including spin
  const vt = sub(b.v, mul(n, vn));
  const u = add(vt, cross(b.w, mul(n, -BALL_R)));
  // normal impulse
  b.v = sub(b.v, mul(n, (1 + s.e) * vn));
  // friction impulse toward rolling, capped by Coulomb's law
  const k = 1 / (1 + 1 / I_RATIO);
  let jt = mul(u, -k);
  const cap = s.mu * (1 + s.e) * -vn;
  const lj = len(jt);
  if (lj > cap && lj > 0) jt = mul(jt, cap / lj);
  b.v = add(b.v, jt);
  b.w = add(b.w, mul(cross(n, jt), -1 / (I_RATIO * BALL_R)));
  return true;
}

/**
 * Simulates one shot.
 * @param {object} shot {p:[x,y,z], v:[x,y,z], w:[x,y,z], t0}
 * @param {object} env  {wind:[x,y], moving:{amp,freq,phase}, defender:{x,y,period,phase}}
 * @returns {{result, scored, touches, path, scoreAt, duration}}
 *   result: 'swish' | 'rim' | 'bank' | 'airball' | 'miss' | 'blocked'
 *   path: frames at 60 Hz {p, a (spin angle), hx (hoop x)} plus events
 */
export function simulate(shot, env = {}, opts = {}) {
  const b = { p: [...shot.p], v: [...shot.v], w: [...(shot.w || [0, 0, 0])] };
  const t0 = shot.t0 || 0;
  const wind = env.wind || [0, 0];
  const maxT = opts.maxT ?? 4;
  const touches = { rim: 0, board: 0, floor: 0, hand: 0 };
  const events = [];
  const path = [];
  let t = 0, nextFrame = 0, angle = 0, scored = false, scoreAt = -1, prevZ = b.p[2];
  let floorAfter = -1, lastRim = -1, lastBoard = -1;
  const record = () => path.push({ p: [...b.p], a: angle, hx: hoopX(env, t0 + t) });
  record();
  nextFrame = FRAME;
  while (t < maxT) {
    const abs = t0 + t;
    const hx = hoopX(env, abs);
    // forces: gravity, drag, Magnus, wind (as relative air velocity)
    const air = sub(b.v, [wind[0], wind[1], 0]);
    const sp = len(air);
    let a = [0, 0, -G];
    a = add(a, mul(air, -DRAG * sp));
    a = add(a, mul(cross(b.w, air), MAGNUS));
    b.v = add(b.v, mul(a, STEP));
    b.p = add(b.p, mul(b.v, STEP));
    b.w = mul(b.w, 1 - SPIN_DECAY * STEP);
    angle += b.w[0] * STEP;

    // rim: closest point on the circle
    const c = [hx, 0, RIM.z];
    const d = sub(b.p, c);
    const dh = Math.hypot(d[0], d[1]);
    const q = dh > 1e-6 ? [c[0] + (d[0] / dh) * RIM.r, c[1] + (d[1] / dh) * RIM.r, RIM.z] : [c[0] + RIM.r, 0, RIM.z];
    const dq = sub(b.p, q);
    const lq = len(dq);
    if (lq < BALL_R + RIM.tube && lq > 1e-9) {
      const n = mul(dq, 1 / lq);
      b.p = add(q, mul(n, BALL_R + RIM.tube));
      if (bounce(b, n, SURF.rim)) {
        if (t - lastRim > 0.05) { touches.rim++; events.push({ t, kind: 'rim', speed: len(b.v) }); }
        lastRim = t;
      }
    }
    // backboard
    if (b.p[1] + BALL_R > BOARD_Y && b.p[1] < BOARD_Y + 0.1 && Math.abs(b.p[0] - hx) < BOARD.half && b.p[2] > BOARD.bottom && b.p[2] < BOARD.top) {
      b.p[1] = BOARD_Y - BALL_R;
      if (bounce(b, [0, -1, 0], SURF.board)) {
        if (t - lastBoard > 0.05) { touches.board++; events.push({ t, kind: 'board', speed: len(b.v) }); }
        lastBoard = t;
      }
    }
    // defender's hand
    const hand = handAt(env, abs);
    if (hand) {
      const dv = sub(b.p, hand);
      const l = len(dv);
      if (l < BALL_R + 0.11 && l > 1e-9) {
        const n = mul(dv, 1 / l);
        b.p = add(hand, mul(n, BALL_R + 0.11));
        if (bounce(b, n, SURF.hand) && !touches.hand) { touches.hand++; events.push({ t, kind: 'hand' }); }
      }
    }
    // floor
    if (b.p[2] < BALL_R) {
      b.p[2] = BALL_R;
      const sp0 = -b.v[2];
      if (bounce(b, [0, 0, 1], SURF.floor) && sp0 > 0.6) {
        touches.floor++;
        events.push({ t, kind: 'floor', speed: sp0 });
        if (floorAfter < 0) floorAfter = t;
      }
    }
    // score: crossing the rim plane downward inside the ring
    if (!scored && prevZ >= RIM.z && b.p[2] < RIM.z && b.v[2] < 0) {
      if (Math.hypot(b.p[0] - hx, b.p[1]) < RIM.r && !touches.floor && !touches.hand) {
        scored = true; scoreAt = t;
        events.push({ t, kind: 'score' });
      }
    }
    prevZ = b.p[2];
    t += STEP;
    if (t >= nextFrame - 1e-9) { record(); nextFrame += FRAME; }
    if (floorAfter >= 0 && t - floorAfter > (opts.tail ?? 1.2)) break;
  }
  let result;
  if (scored) result = touches.board ? 'bank' : touches.rim ? 'rim' : 'swish';
  else if (touches.hand) result = 'blocked';
  else if (!touches.rim && !touches.board) result = 'airball';
  else result = 'miss';
  return { result, scored, touches, events, path, scoreAt, duration: t };
}

/** Release point for a shooter standing at (x, y). */
export function releasePoint(x, y, jump = 0) {
  const dx = -x, dy = -y;
  const l = Math.hypot(dx, dy) || 1;
  return [x + (dx / l) * 0.3, y + (dy / l) * 0.3, RELEASE_Z + jump];
}

/** Launch angle (radians) used for a given horizontal distance. */
export function launchAngle(d) {
  // close shots need a higher arc to clear the front of the rim
  const deg = d < 4 ? Math.min(64, 50 + (4 - d) * 6) : Math.min(58, 50 + (d - 4) * 0.9);
  return (deg * Math.PI) / 180;
}

const BACKSPIN = 18; // rad/s, about 3 turns a second

/**
 * Speed that drops a ball with no wind through the rim centre from p.
 * Solved by bisection on the simulator itself, so drag and lift are included.
 */
export function idealShot(p, hx = 0) {
  const dx = hx - p[0], dy = -p[1];
  const d = Math.hypot(dx, dy);
  const ux = dx / d, uy = dy / d;
  const th = launchAngle(d);
  const h = RIM.z - p[2];
  const vNoDrag = Math.sqrt((G * d * d) / (2 * Math.cos(th) ** 2 * Math.max(0.2, d * Math.tan(th) - h)));
  const w = [BACKSPIN * uy, -BACKSPIN * ux, 0];
  // horizontal travel when the ball comes down through rim height
  const travel = (v) => {
    const b = { p: [...p], v: [v * Math.cos(th) * ux, v * Math.cos(th) * uy, v * Math.sin(th)], w: [...w] };
    let prev = b.p[2];
    for (let i = 0; i < 2400; i++) {
      const sp = len(b.v);
      let a = [0, 0, -G];
      a = add(a, mul(b.v, -DRAG * sp));
      a = add(a, mul(cross(b.w, b.v), MAGNUS));
      b.v = add(b.v, mul(a, STEP));
      b.p = add(b.p, mul(b.v, STEP));
      b.w = mul(b.w, 1 - SPIN_DECAY * STEP);
      if (b.v[2] < 0 && prev >= RIM.z && b.p[2] < RIM.z) return (b.p[0] - p[0]) * ux + (b.p[1] - p[1]) * uy;
      prev = b.p[2];
      if (b.p[2] < 0) return -1;
    }
    return -1;
  };
  let lo = vNoDrag * 0.9, hi = vNoDrag * 1.3;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (travel(mid) < d) lo = mid; else hi = mid;
  }
  const v = (lo + hi) / 2;
  return { speed: v, angle: th, dir: [ux, uy], w, distance: d };
}

/**
 * Builds the release state from an ideal shot and the player's error.
 * power 1 = perfect speed; aim = lateral angle in radians (+ = right);
 * side = side spin in rad/s.
 */
export function makeShot(p, ideal, { power = 1, aim = 0, side = 0 } = {}, t0 = 0) {
  const [ux, uy] = ideal.dir;
  const c = Math.cos(aim), s = Math.sin(aim);
  // rotating the direction clockwise seen from above moves the shot right
  const rx = ux * c + uy * s, ry = -ux * s + uy * c;
  const v = ideal.speed * power;
  const vh = v * Math.cos(ideal.angle);
  return {
    p: [...p],
    v: [vh * rx, vh * ry, v * Math.sin(ideal.angle)],
    w: [BACKSPIN * ry, -BACKSPIN * rx, side],
    t0,
  };
}

/** Linear interpolation of a recorded path at time t (seconds). */
export function sampleAt(path, t) {
  const f = t / FRAME;
  const i = Math.min(path.length - 1, Math.max(0, Math.floor(f)));
  const j = Math.min(path.length - 1, i + 1);
  const k = Math.min(1, Math.max(0, f - i));
  const a = path[i], b = path[j];
  return {
    p: [a.p[0] + (b.p[0] - a.p[0]) * k, a.p[1] + (b.p[1] - a.p[1]) * k, a.p[2] + (b.p[2] - a.p[2]) * k],
    a: a.a + (b.a - a.a) * k,
    hx: a.hx + (b.hx - a.hx) * k,
  };
}
