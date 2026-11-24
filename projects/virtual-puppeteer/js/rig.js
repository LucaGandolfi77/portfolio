/**
 * rig.js — matematica pura del puppet: landmark → posa e gesti (testabile in Node).
 */

export const clamp = (v, a, b) => Math.max(a, Math.min(b, Number(v) || 0));
export const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1);

export function distance(a, b) {
  return Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));
}

export function handMetrics(landmarks, width, height) {
  if (!landmarks || landmarks.length < 21) return null;
  const point = (index) => ({ x: landmarks[index].x * width, y: landmarks[index].y * height });
  const wrist = point(0), indexMCP = point(5), middleMCP = point(9);
  const thumbTip = point(4), indexTip = point(8);
  const palm = Math.max(1, distance(wrist, middleMCP));
  const mouth = distance(thumbTip, indexTip);
  return {
    x: (thumbTip.x + indexTip.x) / 2,
    y: (thumbTip.y + indexTip.y) / 2,
    palm,
    open: clamp((mouth / palm - 0.12) / 0.75, 0, 1),
    angle: Math.atan2(middleMCP.y - wrist.y, middleMCP.x - wrist.x) - Math.PI / 2,
    scale: clamp(palm * 0.62, 46, 200),
    leanX: clamp((indexTip.x - indexMCP.x) / palm, -1, 1),
    leanY: clamp((indexTip.y - indexMCP.y) / palm, -1, 1),
    gesture: detectGesture(landmarks)
  };
}

/** Rileva il gesto dalla configurazione delle dita. */
export function detectGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) return 'open';
  const point = (index) => ({ x: landmarks[index].x, y: landmarks[index].y });
  const wrist = point(0), palm = Math.max(1e-4, distance(wrist, point(9)));
  const tips = [4, 8, 12, 16, 20].map(point);
  const pips = [2, 6, 10, 14, 18].map(point);
  const extended = tips.map((tip, index) => distance(tip, wrist) > distance(pips[index], wrist) * 1.12);
  if (extended[1] && distance(tips[0], tips[1]) < palm * 0.42) return 'pinch';
  const count = extended.slice(1).filter(Boolean).length;
  if (count === 0) return 'fist';
  if (extended[1] && extended[2] && !extended[3] && !extended[4]) return 'peace';
  if (count >= 4) return 'open';
  return 'idle';
}

export function createRig() {
  return { x: 0, y: 0, angle: 0, scale: 80, open: 0, vx: 0, vy: 0, eyeVX: 0, eyeVY: 0, gesture: 'idle', hasTarget: false };
}

/** Spring-damped aggiornamento della posa. */
export function updateRig(state, target, dt = 1 / 60, stiffness = 14, damping = 0.78) {
  if (!target) return state;
  if (!state.hasTarget) {
    state.x = target.x; state.y = target.y; state.angle = target.angle;
    state.scale = target.scale; state.hasTarget = true;
    return state;
  }
  const step = clamp(dt, 0.001, 0.05) * stiffness;
  state.vx = (state.vx + (target.x - state.x) * step) * damping;
  state.vy = (state.vy + (target.y - state.y) * step) * damping;
  state.x += state.vx;
  state.y += state.vy;
  let difference = target.angle - state.angle;
  while (difference > Math.PI) difference -= Math.PI * 2;
  while (difference < -Math.PI) difference += Math.PI * 2;
  state.angle += difference * clamp(step * 0.6, 0, 1);
  state.scale = lerp(state.scale, target.scale, clamp(step * 0.5, 0, 1));
  state.open = lerp(state.open, target.open, clamp(step * 0.8, 0, 1));
  state.eyeVX = lerp(state.eyeVX, (target.leanX || 0) * 12, 0.2);
  state.eyeVY = lerp(state.eyeVY, (target.leanY || 0) * 12, 0.2);
  state.gesture = target.gesture || 'idle';
  return state;
}

export function tapRig(x, y, time, scale = 90) {
  return {
    x, y,
    angle: Math.sin(time / 700) * 0.18,
    scale,
    open: clamp((Math.sin(time / 320) + 1) / 2, 0, 1),
    leanX: Math.sin(time / 500) * 0.4,
    leanY: Math.cos(time / 600) * 0.3,
    gesture: 'open'
  };
}
