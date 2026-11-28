/* ============================================================
   Ultimo Colore — the expedition, in 3D (pure)
   ------------------------------------------------------------
   People drained of colour except their own, about 70 units
   tall. pose(ctx) walks them: ctx = { t, phase, amp, sit }.
   ============================================================ */
import { builder, MAT } from './geom.js';

const LOOK = {
  ilario: { coat: '#6a625c', dark: '#48423e', accent: '#f08c2c', skin: '#d8b49a', hair: '#a8a29c', legs: '#38322e' },
  nora: { coat: '#565870', dark: '#3c3e52', accent: '#f8c832', skin: '#e0b8a0', hair: '#38241a', legs: '#2c2a34' },
  tecla: { coat: '#807a76', dark: '#585452', accent: '#d83440', skin: '#dcc2b4', hair: '#8e8884', legs: '#3a3634' },
  bastiano: { coat: '#86703c', dark: '#5c4c2a', accent: '#d0a448', skin: '#d4ac90', hair: '#f0ece4', legs: '#40342a' },
};
export const HERO_IDS = Object.keys(LOOK);

const BONES = [
  ['root', null, [0, 0, 0]],
  ['hips', 'root', [0, 22, 0]],
  ['torso', 'hips', [0, 28, 0]],
  ['head', 'torso', [0, 44, 0]],
  ['armL', 'torso', [9.5, 40, 0]],
  ['armR', 'torso', [-9.5, 40, 0]],
  ['legL', 'root', [4.6, 22, 0]],
  ['legR', 'root', [-4.6, 22, 0]],
  ['prop', 'torso', [-15, 26, 5]],
  ['tail', 'torso', [0, 43, -7]],
];

/** A cloth end that tapers and waves: from the nape down the back. */
function streamer(b, x, top, long, wide, colour, lean) {
  const at = (k, side) => [x + lean * k + (side * wide * (1 - k * 0.55)) / 2, top - long * k, -9.4 - Math.sin(k * Math.PI) * 1.6 - k * 1.4];
  for (let i = 0; i < 3; i++) {
    const a = i / 3, c = (i + 1) / 3;
    b.sheet('tail', [[at(a, -1), at(a, 1), at(c, 1)], [at(a, -1), at(c, 1), at(c, i === 2 ? 0 : -1)]], colour);
  }
}

/** What each one carries on their back, which is mostly what we see walking north. */
function pack(b, wide, bag, roll) {
  b.ball('torso', [0, 33.5, -8.4 * wide], [6.6 * wide, 7.4, 4.4], bag, { rows: 5, cols: 8 });
  b.box('torso', [0, 36.4, -12.2 * wide], [8 * wide, 3.2, 1.2], '#34241a');
  b.tube('torso', [-8 * wide, 41.4, -9 * wide], [8 * wide, 41.4, -9 * wide], 2.7, 2.7, roll, { sides: 8 });
  for (const s of [-1, 1]) b.tube('torso', [s * 4.4 * wide, 41.4, -9 * wide], [s * 5 * wide, 41.4, -9 * wide], 3, 3, '#34241a', { sides: 8 });
}

function face(b, c) {
  b.ball('head', [0, 54, 0], [10.6, 11, 10.2], c.skin, { rows: 8, cols: 12, round: true });
  for (const x of [-3.9, 3.9]) {
    b.ball('head', [x, 54.6, 9.5], [1.35, 1.9, 1.1], '#1c120e', { rows: 4, cols: 6 });
    b.box('head', [x, 58.4, 9.4], [4.2, 1, 1.2], c.hair, { rot: [0, 0, x > 0 ? 0.12 : -0.12] });
  }
  b.ball('head', [0, 51.4, 10.2], [1.5, 1.7, 1.6], c.skin, { rows: 4, cols: 6, round: true });
}

function body(b, id, c, wide = 1) {
  for (const [bone, x] of [['legL', 4.6], ['legR', -4.6]]) {
    b.tube(bone, [x, 22, 0], [x, 4, 0], 3.9, 3, c.legs);
    b.ball(bone, [x, 2.8, 1.8], [3.9, 3.1, 5.4], '#2a1c14', { rows: 5, cols: 8 });
  }
  b.tube('hips', [0, 13.5, 0], [0, 29, 0], 13 * wide, 9 * wide, c.coat, { sides: 10, squash: 0.78 });
  b.tube('hips', [0, 13.5, 0], [0, 16, 0], 13.35 * wide, 12.9 * wide, c.dark, { sides: 10, squash: 0.78, caps: false });
  b.tube('hips', [0, 26.4, 0], [0, 29.4, 0], 9.8 * wide, 9.5 * wide, '#34241a', { sides: 10, squash: 0.8 });
  b.box('hips', [0, 27.9, 7.9 * wide], [3.4, 3, 1], '#d8b45a', { mat: MAT.metal });
  b.tube('torso', [0, 28.4, 0], [0, 42, 0], 9.2 * wide, 8.4 * wide, c.coat, { sides: 10, squash: 0.76 });
  b.ball('torso', [0, 41.2, 0], [9.6 * wide, 4.2, 7 * wide], c.coat, { rows: 5, cols: 10 });
  // lapels and buttons
  b.box('torso', [0, 36, 6.8 * wide], [4.6, 11, 1], c.accent, { rot: [-0.06, 0, 0] });
  for (const y of [20, 24, 32]) b.ball(y > 29 ? 'torso' : 'hips', [0, y, (y > 29 ? 7.5 : 12.4 - (y - 13) * 0.24) * wide * (y > 29 ? 1 : 0.8)], 1, '#e8d8a8', { rows: 3, cols: 5, mat: MAT.metal });
  for (const [bone, s] of [['armL', 1], ['armR', -1]]) {
    b.tube(bone, [s * 9.4 * wide, 40.5, 0], [s * 14.4 * wide, 27.5, 1], 4.1, 3.2, c.coat);
    b.tube(bone, [s * 13.8 * wide, 29, 0.9], [s * 14.8 * wide, 26.6, 1.1], 3.6, 3.6, c.dark);
    b.ball(bone, [s * 15 * wide, 24.8, 1.4], 2.8, c.skin, { rows: 5, cols: 8, round: true });
  }
  b.tube('torso', [0, 41.6, 0], [0, 45.6, 0], 7.4, 6.2, c.accent, { sides: 10, squash: 0.9 });
}

function ilario() {
  const c = LOOK.ilario, b = builder(BONES);
  body(b, 'ilario', c);
  face(b, c);
  b.ball('head', [0, 47.6, 6.2], [8.4, 5.4, 5.2], c.hair, { rows: 6, cols: 10 });
  b.ball('head', [0, 50, 10], [5.4, 1.4, 1.8], c.hair, { rows: 4, cols: 8 });
  b.ball('head', [0, 55, -3], [11.2, 10, 9.4], '#8a847e', { rows: 6, cols: 10 });
  b.tube('head', [0, 61.6, -0.5], [0, 62.8, -0.5], 15.6, 15, '#38302c', { sides: 12 });
  b.tube('head', [0, 62.4, -0.5], [0, 65.6, -0.5], 10.6, 10.2, c.accent, { sides: 12 });
  b.tube('head', [0, 65.4, -0.5], [-0.8, 73, -1.5], 10.2, 7.2, '#38302c', { sides: 12 });
  streamer(b, 6.4, 44, 17, 5.6, c.accent, 3.4);
  pack(b, 1, '#7a5632', '#b0a284');
  // the lantern on its pole
  b.tube('prop', [-16.4, 3, 5.5], [-15.2, 66, 5.5], 1.25, 1.25, '#4a3322', { sides: 6 });
  b.tube('prop', [-15.2, 65, 5.5], [-20.5, 68.5, 5.5], 0.9, 0.9, '#4a3322', { sides: 5 });
  b.ball('prop', [-20.8, 62.5, 5.5], [4.2, 5, 4.2], '#ffb84a', { rows: 6, cols: 8, mat: MAT.glow });
  b.tube('prop', [-20.8, 66.4, 5.5], [-20.8, 69, 5.5], 3.8, 1, '#2a2018', { sides: 8 });
  b.tube('prop', [-20.8, 57.4, 5.5], [-20.8, 58.8, 5.5], 2, 3.4, '#2a2018', { sides: 8 });
  return b.build({ lantern: [-20.8, 62.5, 5.5] });
}

function nora() {
  const c = LOOK.nora, b = builder(BONES);
  body(b, 'nora', c, 0.9);
  face(b, c);
  b.ball('head', [0, 56.6, -3.4], [12.4, 11.6, 10.8], c.hair, { rows: 7, cols: 12 });
  b.ball('head', [-3.2, 63.4, 4.6], [9.4, 4.4, 6.6], c.hair, { rows: 5, cols: 10, rot: [0.2, 0, 0.25] });
  for (const s of [-1, 1]) b.ball('head', [s * 10, 51, 0], [3.2, 8, 5.4], c.hair, { rows: 5, cols: 7 });
  b.tube('tail', [0, 61, -12], [2, 40, -17], 4.6, 0.6, c.hair, { sides: 7 });
  b.ball('head', [0, 60.6, -12.2], 2.4, c.accent, { rows: 4, cols: 6 });
  streamer(b, -5, 43, 22, 5.2, c.accent, -4);
  streamer(b, 3.4, 43, 15, 4.2, c.accent, 3);
  for (const [bone, s] of [['armL', 1], ['armR', -1]]) {
    b.tube(bone, [s * 13.5, 23.6, 2], [s * 14, 25.6, 3.4], 1.1, 1.1, '#3a2418', { sides: 5 });
    b.crystal(bone, [s * 13.6, 23.6, 2], [s * 17.5, 9, 7], 2, '#e8ecf0', { sides: 4, waist: 0.18, mat: MAT.metal });
  }
  return b.build();
}

function tecla() {
  const c = LOOK.tecla, b = builder(BONES);
  body(b, 'tecla', c, 0.95);
  face(b, c);
  b.ball('head', [0, 57.4, -2.2], [11.8, 10.4, 10.6], c.hair, { rows: 7, cols: 12 });
  b.ball('head', [0, 63.4, 3.6], [8.6, 3.8, 6.4], c.hair, { rows: 5, cols: 9 });
  b.ball('head', [0, 68.4, -5.4], 5.2, c.hair, { rows: 6, cols: 9 });
  b.tube('head', [-7, 71.4, -5.4], [7, 67, -5.4], 0.7, 0.7, c.accent, { sides: 5 });
  for (const x of [-3.9, 3.9]) {
    for (const [dx, dy, w, h] of [[0, 2.7, 5.6, 0.34], [0, -2.7, 5.6, 0.34], [2.8, 0, 0.34, 5.4], [-2.8, 0, 0.34, 5.4]]) b.box('head', [x + dx, 54.5 + dy, 11.5], [w, h, 0.3], '#d8bc66', { mat: MAT.metal });
  }
  b.box('head', [0, 55.4, 11.5], [2.2, 0.34, 0.3], '#d8bc66', { mat: MAT.metal });
  b.tube('torso', [0, 34, 0], [0, 43.4, 0], 13.4, 7.6, c.accent, { sides: 10, squash: 0.74 });
  streamer(b, -2, 36, 16, 8, c.accent, -2.4);
  b.box('torso', [8.4, 27, -8], [6, 12, 3.4], '#6a4a2c', { rot: [0, 0.3, 0.16] });
  // brass dividers, taller than a rule
  b.tube('prop', [-16.5, 44, 5], [-19.6, 4, 5], 1.1, 0.45, '#d8bc66', { sides: 5, mat: MAT.metal });
  b.tube('prop', [-16.5, 44, 5], [-11.6, 5, 7], 1.1, 0.45, '#d8bc66', { sides: 5, mat: MAT.metal });
  b.ball('prop', [-16.5, 45.4, 5], 3, '#d8bc66', { rows: 5, cols: 8, mat: MAT.metal });
  b.ball('prop', [-16.5, 45.4, 7.6], 1.2, '#7ad8ff', { rows: 4, cols: 6, mat: MAT.glow });
  return b.build();
}

function bastiano() {
  const c = LOOK.bastiano, b = builder(BONES);
  body(b, 'bastiano', c, 1.25);
  face(b, c);
  b.ball('head', [0, 47, 6], [9.6, 8, 6], c.hair, { rows: 7, cols: 10 });
  b.ball('head', [0, 40.6, 8.4], [6, 5.6, 3.8], c.hair, { rows: 5, cols: 8 });
  b.ball('head', [0, 50.4, 10.1], [6.4, 1.8, 2], c.hair, { rows: 4, cols: 8 });
  for (const s of [-1, 1]) b.ball('head', [s * 9.8, 57, -1.5], [3.6, 5, 6], c.hair, { rows: 5, cols: 7 });
  b.ball('head', [0, 54, -6], [10.4, 8, 5.6], c.hair, { rows: 5, cols: 9 });
  pack(b, 1.25, '#6a4a2a', '#a85a3a');
  // the bell hammer
  b.tube('prop', [-18.5, 6, 6], [-18.5, 48, 6], 1.7, 1.7, '#4a3020', { sides: 6 });
  b.tube('prop', [-18.5, 60, 6], [-18.5, 46, 6], 4.2, 9.4, c.accent, { sides: 10, mat: MAT.metal });
  b.tube('prop', [-18.5, 46.4, 6], [-18.5, 44.6, 6], 10.2, 10.2, '#8a6a24', { sides: 10, mat: MAT.metal });
  b.ball('prop', [-18.5, 61.4, 6], 2.4, '#8a6a24', { rows: 4, cols: 6, mat: MAT.metal });
  return b.build({ size: 1.06 });
}

const BUILD = { ilario, nora, tecla, bastiano };
const cache = {};

export function heroModel(id) {
  if (!BUILD[id]) return null;
  if (!cache[id]) cache[id] = { ...BUILD[id](), pose: heroPose };
  return cache[id];
}

/** Walking, standing and breathing, or sitting in the boat. */
export function heroPose({ t = 0, phase = 0, amp = 0, sit = false }) {
  const breath = Math.sin(t * 2.1);
  if (sit) {
    return {
      root: { ty: -13 + breath * 0.25 },
      legL: { rx: -1.45, ry: 0.12 }, legR: { rx: -1.45, ry: -0.12 },
      torso: { rx: 0.05 + breath * 0.015 }, head: { ry: Math.sin(t * 0.6) * 0.35, rx: breath * 0.02 },
      armL: { rx: -0.55 }, armR: { rx: -0.25 }, prop: { rx: 0.1 }, tail: { rx: Math.sin(t * 3) * 0.12 },
    };
  }
  const s = Math.sin(phase), still = 1 - amp;
  const bob = Math.abs(Math.cos(phase)) * 2.4 * amp;
  return {
    root: { ty: bob },
    legL: { rx: s * 0.85 * amp, ty: Math.max(0, -Math.cos(phase)) * 2.2 * amp },
    legR: { rx: -s * 0.85 * amp, ty: Math.max(0, Math.cos(phase)) * 2.2 * amp },
    hips: { ry: s * 0.14 * amp, rx: 0.03 * amp },
    torso: { rx: 0.14 * amp + breath * 0.012 * still, ry: -s * 0.24 * amp, sy: 1 + breath * 0.012 * still },
    head: { rx: -0.08 * amp + breath * 0.02 * still, ry: s * 0.1 * amp + Math.sin(t * 0.55) * 0.42 * still, rz: Math.sin(t * 0.8) * 0.04 * still },
    armL: { rx: -s * 0.8 * amp, rz: 0.05 + breath * 0.025 * still },
    armR: { rx: s * 0.45 * amp - 0.1, rz: -0.05 - breath * 0.025 * still },
    // the pole is planted when standing and swings with the hand when walking
    prop: { rx: s * 0.2 * amp, rz: Math.sin(phase * 2) * 0.025 * amp },
    tail: { rx: 0.38 * amp + Math.sin(t * 7 + phase) * 0.14 * amp + Math.sin(t * 1.7) * 0.05, rz: Math.cos(t * 5) * 0.08 * amp },
  };
}

/* ---------- Ombra, the dog ---------- */

const DOG_BONES = [
  ['root', null, [0, 0, 0]],
  ['body', 'root', [0, 13, 0]],
  ['head', 'body', [0, 18, 10]],
  ['legFL', 'root', [5, 11, 8]], ['legFR', 'root', [-5, 11, 8]], ['legBL', 'root', [5, 11, -9]], ['legBR', 'root', [-5, 11, -9]],
  ['tail', 'body', [0, 16, -13]],
];

function dog() {
  const b = builder(DOG_BONES);
  const fur = '#3a302e', soft = '#524440';
  b.ball('body', [0, 14, -1], [8, 7.4, 14], fur, { rows: 7, cols: 10 });
  b.ball('body', [0, 14.6, 8], [7.4, 7.6, 6.6], fur, { rows: 6, cols: 9 });
  b.ball('body', [0, 11.6, 11.4], [4.4, 4.6, 3.4], soft, { rows: 5, cols: 7 });
  for (const [bone, x, z] of [['legFL', 5, 8], ['legFR', -5, 8], ['legBL', 5, -9], ['legBR', -5, -9]]) {
    b.tube(bone, [x, 12, z], [x, 2, z + 0.6], 2.9, 1.7, fur, { sides: 6 });
    b.ball(bone, [x, 1.5, z + 1.8], [2.2, 1.6, 3], soft, { rows: 4, cols: 6 });
  }
  b.ball('head', [0, 21.6, 13], [6.6, 6.4, 6.4], fur, { rows: 7, cols: 10 });
  b.tube('head', [0, 19.6, 17.4], [0, 18.8, 24], 3.4, 2.1, soft, { sides: 7 });
  b.ball('head', [0, 19.2, 24.4], 1.7, '#100c0c', { rows: 4, cols: 6 });
  for (const s of [-1, 1]) {
    b.tube('head', [s * 4, 25.6, 11.6], [s * 6.4, 34, 10], 2.8, 0, fur, { sides: 5 });
    b.ball('head', [s * 2.8, 23, 18.6], 1.35, '#ffd46a', { rows: 4, cols: 6, mat: MAT.glow });
  }
  b.tube('body', [0, 18.6, 9], [0, 16.6, 11.5], 6.2, 6.4, '#f08c2c', { sides: 9, caps: false });
  b.tube('tail', [0, 16, -13], [0, 25, -21], 2.6, 1.5, fur, { sides: 6 });
  b.tube('tail', [0, 24.4, -20.6], [0, 30, -20], 1.6, 0.2, soft, { sides: 6 });
  return b.build();
}

export function dogModel() {
  return (cache.dog = cache.dog || { ...dog(), pose: dogPose });
}

export function dogPose({ t = 0, phase = 0, amp = 0, sit = false }) {
  if (sit) return { body: { rx: -0.1 }, head: { ry: Math.sin(t * 0.8) * 0.4, rx: Math.sin(t * 2) * 0.04 }, legBL: { rx: -1.2 }, legBR: { rx: -1.2 }, tail: { ry: Math.sin(t * 6) * 0.35 } };
  const s = Math.sin(phase * 1.5) * 0.75 * amp;
  return {
    root: { ty: Math.abs(Math.cos(phase * 1.5)) * 1.8 * amp },
    legFL: { rx: s }, legBR: { rx: s }, legFR: { rx: -s }, legBL: { rx: -s },
    body: { rx: Math.sin(phase * 3) * 0.04 * amp },
    head: { rx: Math.sin(t * 2.4) * 0.05, ry: Math.sin(t * 0.7) * 0.4 * (1 - amp) },
    tail: { ry: Math.sin(t * 8) * 0.45, rx: -0.2 * amp },
  };
}
