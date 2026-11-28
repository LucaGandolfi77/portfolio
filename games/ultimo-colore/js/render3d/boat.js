/* ============================================================
   Ultimo Colore — Patience, the boat (pure)
   ============================================================ */
import { builder, MAT } from './geom.js';

const BONES = [['root', null, [0, 0, 0]], ['hull', 'root', [0, 4, 0]], ['sail', 'hull', [0, 30, 14]], ['flag', 'hull', [0, 88, 14]]];

/** Where the four sit, bow first, and the dog's place at the prow: [x, y, z]. */
export const SEATS = [[0, 9, 33], [-6.5, 9, -6], [6.5, 9, -24], [-3, 9, -44]];
export const DOG_SEAT = [6, 10, 48];

function boat() {
  const b = builder(BONES);
  const L = 74, W = 27, N = 14;
  const section = (i) => {
    const t = (i / N) * 2 - 1;
    const half = W * Math.sqrt(Math.max(0, 1 - Math.abs(t) ** 2.4)) + 0.4;
    const top = 13 + 12 * t ** 4, z = t * L;
    return { z, out: [[half, top, z], [half * 0.86, 3, z], [0, -4 + 6 * t ** 4, z], [-half * 0.86, 3, z], [-half, top, z]], inner: [[half * 0.86, top - 0.6, z], [half * 0.7, 6, z], [-half * 0.7, 6, z], [-half * 0.86, top - 0.6, z]] };
  };
  const quad = (a, c, d, e) => [[a, c, d], [a, d, e]];
  for (let i = 0; i < N; i++) {
    const p = section(i), q = section(i + 1), mid = [0, 9, (p.z + q.z) / 2];
    const shade = i % 2 ? '#7a3e24' : '#6c3620';
    // each strip of planks is its own convex piece
    for (let k = 0; k < 4; k++) b.shape('hull', quad(p.out[k], q.out[k], q.out[k + 1], p.out[k + 1]), k % 3 ? '#4a2616' : shade, { middle: mid });
    b.sheet('hull', quad(p.inner[1], q.inner[1], q.inner[2], p.inner[2]), i % 2 ? '#a8784a' : '#96683e');
    for (const [o, n] of [[0, 0], [4, 3]]) {
      b.sheet('hull', quad(p.inner[n], q.inner[n], q.inner[o ? 2 : 1], p.inner[o ? 2 : 1]), '#8a5a34');
      b.sheet('hull', quad(p.out[o], q.out[o], q.inner[n], p.inner[n]), '#d8b078');
      b.tube('hull', p.out[o], q.out[o], 1.5, 1.5, '#e0bc84', { sides: 5, caps: false });
    }
  }
  for (const z of [-34, 8]) b.box('hull', [0, 9, z], [36, 2.4, 7], '#b8864e');
  b.tube('hull', [0, 4, 14], [0, 92, 14], 2, 1.4, '#3a2416', { sides: 7 });
  b.tube('sail', [0, 78, 14], [0, 80, -26], 1, 1, '#3a2416', { sides: 5 });
  b.tube('sail', [0, 28, 14], [0, 30, -30], 1, 1, '#3a2416', { sides: 5 });
  // a sail with a belly, patched
  const cols = 6, rows = 6;
  const at = (i, j) => {
    const u = i / cols, v = j / rows;
    return [Math.sin(u * Math.PI) * Math.sin(v * Math.PI * 0.85 + 0.2) * 13, 30 + v * 48 + (1 - v) * u * 2, 12 - u * (42 - v * 5)];
  };
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const colour = (i === 3 && j === 1) || (i === 1 && j === 4) ? '#c0a878' : j % 2 ? '#e8dcbc' : '#ded0ac';
      b.sheet('sail', [[at(i, j), at(i + 1, j), at(i + 1, j + 1)], [at(i, j), at(i + 1, j + 1), at(i, j + 1)]], colour);
    }
  }
  b.sheet('flag', [[[0, 91, 14], [0, 84, 14], [0, 87, -6]]], '#f08c2c');
  b.tube('hull', [0, 20, -70], [0, 34, -72], 0.9, 0.9, '#2a1c12', { sides: 5 });
  b.ball('hull', [0, 37.5, -72], [3.8, 4.6, 3.8], '#ffb84a', { rows: 5, cols: 8, mat: MAT.glow });
  b.tube('hull', [0, 41.4, -72], [0, 43.6, -72], 3.6, 0.8, '#2a2018', { sides: 8 });
  return b.build({ lantern: [0, 37.5, -72] });
}

let cache = null;
export function boatModel() {
  return (cache = cache || { ...boat(), pose: boatPose });
}

export function boatPose({ t = 0, amp = 0 }) {
  return {
    hull: { rz: Math.sin(t * 1.7) * 0.045, rx: Math.sin(t * 2.3) * 0.025 - 0.02 * amp },
    sail: { ry: Math.sin(t * 1.1) * 0.08, sx: 1 + Math.sin(t * 3.1) * 0.1 + amp * 0.2 },
    flag: { ry: Math.sin(t * 6) * 0.4 },
  };
}
