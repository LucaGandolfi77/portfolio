/* Pure geometry helpers used by collision and rendering code */
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const len = (x, y) => Math.hypot(x, y);
export const reflect = (v, nx, ny, restitution = 0.55) => {
  const d = v.x * nx + v.y * ny;
  return { x:v.x - 2 * d * nx * restitution, y:v.y - 2 * d * ny * restitution };
};
export const circleHit = (a, ar, b, br) => dist(a, b) < ar + br;
export const lerp = (a, b, t) => a + (b - a) * t;
