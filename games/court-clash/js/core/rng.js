/* Deterministic RNG and daily seeds */

export function seededRandom(seed) {
  let s = (typeof seed === 'string' ? hashSeed(seed) : Number(seed) || 1) >>> 0;
  return function random() {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function hashSeed(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function dailyKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export function dailySeed(date = new Date()) { return hashSeed('nba-' + dailyKey(date)); }
