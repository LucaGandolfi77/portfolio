/* Small numeric helpers shared by the director and the tests. */
export const clamp = (v: number, lo = 0, hi = 1): number => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
/** Smooth start and stop (smootherstep). */
export const ease = (k: number): number => {
  const x = clamp(k);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
/** Deterministic pseudo-random in [0, 1) from any number. */
export const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** Shortest turn from angle a to angle b, radians. */
export const turn = (a: number, b: number, k: number): number => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
};
