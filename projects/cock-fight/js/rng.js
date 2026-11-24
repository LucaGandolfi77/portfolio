/* Cockpit Arena — deterministic RNG helpers */
export function seeded(seed) {
  let s = (seed >>> 0) || 1;
  return function () {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 1000000) / 1000000;
  };
}
export function dailySeed(date = new Date()) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}
export function pickWeighted(weights, rng = Math.random) {
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i; }
  return weights.length - 1;
}
