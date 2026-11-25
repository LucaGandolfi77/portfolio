/* Slot Collect — deterministic PRNG (mulberry32) + daily challenge seed */

export function seededRandom(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dailySeed(date = new Date()) {
  return (date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()) >>> 0;
}

export function mixSeed(a, b) {
  let h = Math.imul(a ^ 0x9E3779B9, 0x85EBCA6B);
  h ^= Math.imul(b + 0x165667B1, 0xC2B2AE35);
  return h >>> 0;
}

export function pickWeighted(items, rng, weightOf) {
  const weights = items.map(weightOf);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r < 0) return items[i];
  }
  return items[items.length - 1];
}
