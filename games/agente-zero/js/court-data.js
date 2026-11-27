/* Agente Zero — court geometry shared by rules and renderer (pure) */

export const THREE_R = 6.75;
export const CORNER_X = 6.6;

/** Floor position at `angle` degrees from the centre line (+ = right) and `dist` metres. */
export function spotAt(angle, dist) {
  const a = (angle * Math.PI) / 180;
  return { x: Math.sin(a) * dist, y: -Math.cos(a) * dist };
}

export const distanceOf = (s) => Math.hypot(s.x, s.y);
export const angleOf = (s) => (Math.atan2(s.x, -s.y) * 180) / Math.PI;
export const isThree = (s) => distanceOf(s) >= THREE_R - 0.05 || Math.abs(s.x) >= CORNER_X - 0.05;

/** Zone id used by the statistics: near / mid / three / deep × left / centre / right. */
export function zoneOf(s) {
  const d = distanceOf(s);
  const range = d > 9 ? 'deep' : isThree(s) ? 'three' : d >= 4 ? 'mid' : 'near';
  const a = angleOf(s);
  const side = a < -30 ? 'l' : a > 30 ? 'r' : 'c';
  return `${range}-${side}`;
}

export const ZONES = ['near', 'mid', 'three', 'deep'].flatMap((r) => ['l', 'c', 'r'].map((s) => `${r}-${s}`));

/** Spots offered in Training and when the player leads in Z-E-R-O. */
export const PRACTICE_SPOTS = [
  { id: 'layup', ...spotAt(0, 2.4) },
  { id: 'left', ...spotAt(-45, 3.8) },
  { id: 'free', ...spotAt(0, 4.2) },
  { id: 'right', ...spotAt(45, 3.8) },
  { id: 'elbow-l', ...spotAt(-28, 5.4) },
  { id: 'elbow-r', ...spotAt(28, 5.4) },
  { id: 'corner-l', ...spotAt(-86, 6.7) },
  { id: 'wing-l', ...spotAt(-45, 6.85) },
  { id: 'top', ...spotAt(0, 6.85) },
  { id: 'wing-r', ...spotAt(45, 6.85) },
  { id: 'corner-r', ...spotAt(86, 6.7) },
  { id: 'deep', ...spotAt(0, 9.2) },
  { id: 'half', ...spotAt(0, 12.4) },
];

export const CONTEST_SPOTS = [
  spotAt(-86, 6.75), spotAt(-45, 6.85), spotAt(0, 6.85), spotAt(45, 6.85), spotAt(86, 6.75),
];
