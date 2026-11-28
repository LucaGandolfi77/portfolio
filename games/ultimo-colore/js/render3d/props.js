/* ============================================================
   Ultimo Colore — things standing in the lagoon (pure)
   ============================================================ */
import { builder, MAT } from './geom.js';

const cache = new Map();
const keep = (key, make) => { if (!cache.has(key)) cache.set(key, make()); return cache.get(key); };

/** A lost lantern, bobbing over its supplies. */
export const lanternModel = () => keep('lantern', () => {
  const b = builder([['root', null, [0, 0, 0]], ['body', 'root', [0, 18, 0]]]);
  b.ball('body', [0, 18, 0], [8.4, 10.4, 8.4], '#ffac3c', { rows: 6, cols: 9, mat: MAT.glow });
  b.tube('body', [0, 27, 0], [0, 32, 0], 7, 2, '#2e2018');
  b.tube('body', [0, 6.4, 0], [0, 9.6, 0], 4.4, 6.6, '#2e2018');
  for (let i = 0; i < 4; i++) { const q = (i / 4) * Math.PI * 2 + 0.5; b.tube('body', [Math.cos(q) * 6, 9, Math.sin(q) * 6], [Math.cos(q) * 5.6, 28, Math.sin(q) * 5.6], 0.8, 0.8, '#2e2018', { sides: 4 }); }
  return { ...b.build(), pose: ({ t }) => ({ body: { ty: Math.sin(t * 2.6) * 3, ry: t * 0.9, rz: Math.sin(t * 1.7) * 0.1 } }) };
});

/** Crates and a rope across the bridge, `w` wide. */
export const barricadeModel = (w) => keep(`barricade${w}`, () => {
  const b = builder([['root', null, [0, 0, 0]]]);
  const n = Math.max(2, Math.floor((w - 18) / 30));
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + 12 + (i + 0.5) * ((w - 24) / n), s = 25 + (i % 2) * 5, turn = (i % 2 ? 0.2 : -0.14);
    b.box('root', [x, s / 2, 0], [s, s, s * 0.8], i % 2 ? '#a87840' : '#8a5e30', { rot: [0, turn, 0] });
    for (const y of [1.6, s - 1.6]) b.box('root', [x, y, 0], [s + 1.4, 3, s * 0.8 + 1.4], '#5a3a1c', { rot: [0, turn, 0] });
    if (i % 2) b.box('root', [x - 3, s + 7, -2], [15, 14, 13], '#946a38', { rot: [0, -0.5, 0] });
  }
  for (const s of [-1, 1]) b.tube('root', [s * (w / 2 - 2), 0, 12], [s * (w / 2 - 2), 40, 12], 2.4, 2, '#4a3018', { sides: 6 });
  for (let i = 0; i < 8; i++) {
    const at = (k) => { const u = k / 8; return [-w / 2 + 2 + u * (w - 4), 37 - Math.sin(u * Math.PI) * 11, 12]; };
    b.tube('root', at(i), at(i + 1), 1.2, 1.2, '#e0c894', { sides: 4, caps: false });
  }
  return { ...b.build(), pose: () => ({}) };
});

/** A curtain of reeds across a passage w × h. */
export const reedsModel = (w, h) => keep(`reeds${w}x${h}`, () => {
  const b = builder([['root', null, [0, 0, 0]], ...[0, 1, 2, 3].map((i) => [`g${i}`, 'root', [0, 0, 0]])]);
  let seed = 11;
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const n = Math.floor((w * 3) / 14);
  for (let i = 0; i < n; i++) {
    const row = i % 3, x = -w / 2 + ((Math.floor(i / 3) + row / 3) * 14) + r() * 6 + 3, z = h / 2 - row * (h / 3) - r() * 8;
    const tall = 28 + r() * 30, lean = (r() - 0.5) * 12;
    const colour = ['#7a9a38', '#94b04a', '#5e7c2c'][Math.floor(r() * 3)];
    b.tube(`g${i % 4}`, [x, -2, z], [x + lean, tall, z], 2.2, 0.3, colour, { sides: 4 });
    if (r() < 0.3) b.tube(`g${i % 4}`, [x + lean * 0.78, tall * 0.74, z], [x + lean * 0.96, tall * 0.96, z], 2.4, 2, '#7a4a24', { sides: 5 });
  }
  return { ...b.build(), pose: ({ t }) => Object.fromEntries([0, 1, 2, 3].map((i) => [`g${i}`, { rz: Math.sin(t * 1.5 + i * 1.7) * 0.02, rx: Math.cos(t * 1.1 + i) * 0.015 }])) };
});
