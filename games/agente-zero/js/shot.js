/* ============================================================
   Agente Zero — from a gesture to a release (pure)
   ------------------------------------------------------------
   The physics wants {power, aim, side}: power 1 is the perfect
   speed, aim is a lateral angle in radians. The player gives a
   swipe, a held meter, or the keyboard.
   ============================================================ */

/** Control sensitivity per difficulty: how much a gesture error costs. */
export const SENS = {
  easy: { power: 0.09, aim: 0.07, meter: 0.04 },
  normal: { power: 0.13, aim: 0.1, meter: 0.06 },
  hard: { power: 0.2, aim: 0.15, meter: 0.09 },
};

/** Swipe length (fraction of the screen height) for a perfect shot at distance d. */
export function idealSwipe(d) {
  return 0.17 + 0.024 * d;
}

/**
 * Turns a swipe into a release.
 * pts: [{x, y, t}] in CSS pixels, h: screen height, d: distance (m).
 * Returns null when the gesture is not a shot (too short or downward).
 */
export function fromSwipe(pts, h, d, diff = 'normal') {
  if (!pts || pts.length < 2) return null;
  const a = pts[0], b = pts[pts.length - 1];
  const dx = b.x - a.x, dy = b.y - a.y;
  const up = -dy / h;
  if (up < 0.06 || -dy < Math.abs(dx) * 0.6) return null;
  const s = SENS[diff] || SENS.normal;
  const ratio = up / idealSwipe(d);
  const power = 1 + (Math.min(1.9, ratio) - 1) * s.power;
  const aim = Math.atan2(dx, -dy) * s.aim;
  // curve: signed distance of the middle sample from the straight line
  const m = pts[Math.floor(pts.length / 2)];
  const L = Math.hypot(dx, dy) || 1;
  const curve = ((m.x - a.x) * dy - (m.y - a.y) * dx) / (L * L);
  const side = Math.max(-1, Math.min(1, curve * 4)) * 6;
  return { power, aim, side, ratio };
}

/** Triangle wave 0 → 1 → 0 with the given period (s). */
export function meterAt(t, period = 1.5) {
  const f = (((t / period) % 1) + 1) % 1;
  return f < 0.5 ? f * 2 : 2 - f * 2;
}

/** Aim swing for the held-meter mode, -1 … 1. */
export function swingAt(t, period = 2.6) {
  return Math.sin((t / period) * Math.PI * 2);
}

/** The green zone of the meter is centred on 0.5. */
export function fromMeter(m, swing, diff = 'normal') {
  const s = SENS[diff] || SENS.normal;
  return { power: 1 + (m - 0.5) * 2 * s.meter * 1.6, aim: swing * 0.03, side: 0 };
}

/** Width of the meter's green zone (fraction of the bar) that keeps |power-1| ≤ 0.01. */
export function greenZone(diff = 'normal') {
  const s = SENS[diff] || SENS.normal;
  return Math.min(0.5, 0.01 / (s.meter * 1.6));
}

/** A small, repeatable error for the computer's shots. skill 0…1. */
export function aiError(rng, skill, d) {
  const spread = (1 - skill) * 0.03 + 0.004 + d * 0.0012;
  const g = () => (rng() + rng() + rng() - 1.5) / 1.5;
  return { power: 1 + g() * spread, aim: g() * spread * 0.9, side: 0 };
}

/** Which way a shot missed, for the hint after a miss: {len, side}. */
export function judgeError({ power = 1, aim = 0 }) {
  return {
    len: power > 1.014 ? 'long' : power < 0.986 ? 'short' : '',
    side: aim > 0.022 ? 'right' : aim < -0.022 ? 'left' : '',
  };
}
