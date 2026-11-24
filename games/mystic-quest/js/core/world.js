/* Pure world generation and proximity helpers */
import { WORLD } from '../config.js';

export function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function layout(index) {
  const r = rng(3121 + index * 977);
  const stars = [];
  let guard = 0;
  while (stars.length < 3 && guard++ < 200) {
    const x = 42 + r() * (WORLD.w - 84), y = 70 + r() * (WORLD.h - 180);
    if (Math.hypot(x - WORLD.w / 2, y - WORLD.h / 2) < 110) continue;
    if (stars.some(s => Math.hypot(s.x - x, s.y - y) < 90)) continue;
    stars.push({ x, y, phase:r() * 7 });
  }
  return {
    stars,
    spirit:{ x:WORLD.w / 2 + (r() - 0.5) * 120, y:120 + r() * 80 },
    portal:{ x:WORLD.w / 2, y:48 }
  };
}

export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function nearestWithin(items, pos, radius, filter = () => true) {
  let best = null, bd = radius;
  items.forEach((item, i) => {
    if (!filter(item, i)) return;
    const d = distance(item, pos);
    if (d < bd) { bd = d; best = { item, index:i, distance:d }; }
  });
  return best;
}

export function clampToWorld(p, pad = 14) {
  return {
    x:Math.max(pad, Math.min(WORLD.w - pad, p.x)),
    y:Math.max(pad + 24, Math.min(WORLD.h - pad, p.y))
  };
}
