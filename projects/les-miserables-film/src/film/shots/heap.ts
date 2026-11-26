import { GROUND, barrel, wheel } from '../draw/scenery';
import { hash, line, mix, poly, rect, rgba } from '../draw/core';
import type { S } from './types';

/** The barricade, from x0 to x1, piled up to `top`. */
export function barricadeHeap(s: S, x0: number, x1: number, top: number, seed = 1, dawn = false): void {
  const c = s.ctx;
  const wood = dawn ? '#6a4638' : '#3c241c';
  const n = Math.round((x1 - x0) / 15);
  /* Paving stones at the bottom, furniture above. */
  for (let i = 0; i < n * 2; i++) {
    const x = x0 + hash(seed + i) * (x1 - x0);
    const edge = Math.min(1, Math.min(x - x0, x1 - x) / 120 + 0.25);
    const y = GROUND - Math.pow(hash(seed + i * 3), 1.4) * (GROUND - top) * edge;
    const r = 12 + hash(i * 5) * 24;
    poly(c, [[x - r, y + r * 0.5], [x - r * 0.7, y - r * 0.55], [x + r * 0.6, y - r * 0.7], [x + r, y + r * 0.35]], mix(i % 3 ? '#322a32' : wood, '#08050a', hash(i * 7) * 0.5));
    line(c, [[x - r * 0.7, y - r * 0.55], [x + r * 0.6, y - r * 0.7]], rgba(dawn ? '#ffd0a0' : '#ff8a48', 0.26), 2);
  }
  for (let i = 0; i < Math.round((x1 - x0) / 80); i++) {
    const x = x0 + 40 + hash(seed + i * 11) * (x1 - x0 - 80);
    const y = GROUND - 30 - hash(seed + i * 13) * (GROUND - top - 50);
    const a = (hash(seed + i * 17) - 0.5) * 2.6;
    const kind = i % 4;
    if (kind === 0) wheel(c, x, y, 38 + hash(i) * 22, a, wood);
    else if (kind === 1) barrel(c, x, y, 0.8, a, mix(wood, '#8a5a2a', 0.4));
    else if (kind === 2) {
      c.save();
      c.translate(x, y);
      c.rotate(a);
      rect(c, -32, -5, 64, 10, wood);
      for (const dx of [-30, 20]) rect(c, dx, 0, 9, 56, wood);
      rect(c, -32, -62, 9, 60, wood);
      rect(c, -32, -62, 40, 8, wood);
      c.restore();
    } else line(c, [[x - 80 * Math.cos(a), y - 80 * Math.sin(a)], [x + 80 * Math.cos(a), y + 80 * Math.sin(a)]], wood, 13);
  }
}
