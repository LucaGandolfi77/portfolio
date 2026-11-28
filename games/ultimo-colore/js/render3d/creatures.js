/* ============================================================
   Ultimo Colore — the Faded, in 3D (pure)
   ------------------------------------------------------------
   pose(ctx): ctx = { t, amp (moving), anger 0…1 }.
   ============================================================ */
import { builder, MAT } from './geom.js';

const eyes = (b, bone, y, z, gap, r, color = '#f6ffd8') => { for (const s of [-1, 1]) b.ball(bone, [s * gap, y, z], r, color, { rows: 5, cols: 7, mat: MAT.glow }); };

function cocci() {
  const b = builder([['root', null, [0, 0, 0]], ['core', 'root', [0, 20, 0]], ['s1', 'core', [0, 26, 0]], ['s2', 'core', [0, 26, 0]], ['s3', 'core', [0, 26, 0]], ['s4', 'core', [0, 26, 0]]]);
  b.crystal('core', [0, 2, 0], [2, 62, -2], 17, '#46c878', { sides: 6, waist: 0.42 });
  b.crystal('core', [-4, 4, 4], [-30, 38, 6], 9, '#2f9e5a');
  b.crystal('core', [4, 4, 3], [29, 44, 0], 10, '#6ee09a');
  b.crystal('core', [-3, 6, -6], [-17, 52, -14], 8, '#3ab46a');
  b.crystal('core', [3, 3, -4], [20, 24, -20], 8, '#2a8a50');
  b.crystal('core', [0, 6, 8], [-12, 14, 24], 6, '#52d888');
  b.box('core', [0, 29.6, 15.4], [18, 7.4, 2], '#0c2a18');
  eyes(b, 'core', 29.8, 16.6, 4.6, 2.6);
  [[26, 34, 6], [-27, 22, -4], [8, 66, 4], [-6, 18, -28]].forEach(([x, y, z], i) => b.crystal(`s${i + 1}`, [x, y, z], [x * 1.18, y + 12, z * 1.18], 3.4, '#8ef0b8', { sides: 4 }));
  return b.build();
}
const cocciPose = ({ t, anger = 0 }) => ({
  root: { ty: 5 + Math.sin(t * 2.4) * 3.4, tx: anger * Math.sin(t * 38) * 1.4 },
  core: { ry: Math.sin(t * 0.9) * 0.22, rz: Math.sin(t * 1.9) * 0.06 },
  s1: { ry: t * 1.3 }, s2: { ry: t * -1.0 }, s3: { ry: t * 0.8, ty: Math.sin(t * 3) * 3 }, s4: { ry: t * 1.1 },
});

function granchio() {
  const legs = [['lL1', 1, 9], ['lR1', -1, 9], ['lL2', 1, -3], ['lR2', -1, -3], ['lL3', 1, -15], ['lR3', -1, -15]];
  const b = builder([['root', null, [0, 0, 0]], ['body', 'root', [0, 20, 0]], ['armL', 'body', [19, 19, 12]], ['armR', 'body', [-19, 19, 12]], ['jawL', 'armL', [31, 25, 25]], ['jawR', 'armR', [-31, 25, 25]],
    ...legs.map(([n, s, z]) => [n, 'root', [s * 20, 18, z]])]);
  b.ball('body', [0, 21, -2], [28, 15, 22], '#487c3e', { rows: 7, cols: 11 });
  b.ball('body', [0, 15, 0], [24, 9, 19], '#8a9a58', { rows: 5, cols: 10 });
  for (const [x, y, z, h] of [[0, 33, -4, 15], [-13, 30, 0, 11], [13, 30, -8, 12], [-6, 30, -15, 10], [8, 33, 6, 8], [-18, 26, -10, 9], [18, 26, 2, 9]]) {
    for (let k = 0; k < 4; k++) b.tube('body', [x + (k - 1.5) * 3, y - 3, z + (k % 2) * 3], [x + (k - 1.5) * 5.4, y + h - (k % 2) * 3, z + (k % 2) * 5 - 2], 2.1, 0, k % 2 ? '#a4d858' : '#78b444', { sides: 4 });
  }
  for (const s of [-1, 1]) {
    const side = s > 0 ? 'L' : 'R';
    b.tube('body', [s * 6, 27, 16], [s * 8, 37, 19], 1.8, 1.5, '#487c3e', { sides: 5 });
    b.ball('body', [s * 8, 39, 19.6], 3.6, '#ffe8a0', { rows: 6, cols: 8, mat: MAT.glow });
    b.ball('body', [s * 8, 39.2, 22.8], 1.2, '#20180c', { rows: 4, cols: 5 });
    b.tube(`arm${side}`, [s * 19, 19, 12], [s * 31, 25, 23], 4, 5, '#3c6a34', { sides: 6 });
    b.ball(`arm${side}`, [s * 33, 26, 27], [8.6, 7, 8], '#5c9a48', { rows: 6, cols: 8 });
    b.tube(`arm${side}`, [s * 31, 23.6, 31], [s * 27, 21, 45], 4.2, 0, '#d8e0a0', { sides: 5 });
    b.tube(`jaw${side}`, [s * 33, 29.6, 31], [s * 28, 29, 46], 4.6, 0, '#e8f0b4', { sides: 5 });
  }
  for (const [name, s, z] of legs) {
    b.tube(name, [s * 20, 18, z], [s * 37, 22, z + 2], 3.6, 2.8, '#3c6a34', { sides: 5 });
    b.tube(name, [s * 36, 22.6, z + 2], [s * 44, 0, z + 4], 2.8, 0.7, '#2c5028', { sides: 5 });
  }
  b.box('body', [0, 19, 20.4], [14, 2, 2], '#16300f');
  return b.build();
}
const granchioPose = ({ t, amp = 0, anger = 0 }) => {
  const step = t * (5 + amp * 8), k = 0.08 + amp * 0.28, clap = Math.max(0, Math.sin(t * (2.2 + anger * 6)));
  const pose = { body: { ty: Math.sin(t * 2) * 1.2 + Math.abs(Math.sin(step)) * 1.4 * amp, rz: Math.sin(step) * 0.04 * amp }, armL: { ry: -clap * 0.2, rx: -anger * 0.4 }, armR: { ry: clap * 0.2, rx: -anger * 0.4 }, jawL: { rx: -clap * 0.5 }, jawR: { rx: -clap * 0.5 } };
  ['lL1', 'lR1', 'lL2', 'lR2', 'lL3', 'lR3'].forEach((n, i) => { pose[n] = { rz: Math.sin(step + i * 2.1) * k * 0.6 * (i % 2 ? -1 : 1), ry: Math.cos(step + i * 2.1) * k }; });
  return pose;
};

function spenta() {
  const b = builder([['root', null, [0, 0, 0]], ['body', 'root', [0, 40, 0]], ['eye', 'body', [0, 40, 0]], ['r1', 'body', [-9, 20, 0]], ['r2', 'body', [0, 20, 6]], ['r3', 'body', [9, 20, -3]]]);
  const glass = '#9ab4a4', iron = '#34282a';
  b.tube('body', [0, 22, 0], [0, 30, 0], 11, 20, glass, { sides: 8 });
  b.tube('body', [0, 30, 0], [0, 50, 0], 20, 20, glass, { sides: 8 });
  b.tube('body', [0, 50, 0], [0, 58, 0], 20, 11, glass, { sides: 8 });
  for (const y of [22, 58]) b.tube('body', [0, y - 3, 0], [0, y + 3, 0], 13, 13, iron, { sides: 8 });
  b.tube('body', [0, 60, 0], [0, 67, 0], 6, 2, iron, { sides: 8 });
  b.tube('body', [0, 66, 0], [4, 74, 0], 1.2, 1.2, iron, { sides: 5 });
  for (let i = 0; i < 8; i++) {
    const q = (i / 8) * Math.PI * 2, x = Math.cos(q), z = Math.sin(q);
    for (const [a, c] of [[[11.4, 24], [20.4, 30]], [[20.4, 30], [20.4, 50]], [[20.4, 50], [11.4, 56]]]) b.tube('body', [x * a[0], a[1], z * a[0]], [x * c[0], c[1], z * c[0]], 0.9, 0.9, iron, { sides: 4, caps: false });
  }
  b.ball('body', [0, 40, 15.4], [11, 13, 5.4], '#101a16', { rows: 6, cols: 9 });
  b.shape('body', [[[9, 52, 19], [20, 44, 13], [10, 40, 20.6]], [[10, 40, 20.6], [18, 32, 14], [6, 34, 20]]], '#101a16', { flat: true });
  b.ball('eye', [-1, 40, 20.2], 3.6, '#c8ffd6', { rows: 5, cols: 8, mat: MAT.glow });
  [['r1', -9, 0, '#587a68'], ['r2', 0, 6, '#6a8a78'], ['r3', 9, -3, '#4a6458']].forEach(([n, x, z, c]) => {
    b.sheet(n, [[[x - 3.4, 20, z], [x + 3.4, 20, z], [x + 1, 8, z + 2]], [[x + 1, 8, z + 2], [x + 3.4, 20, z], [x + 5, 5, z + 1]], [[x + 1, 8, z + 2], [x + 5, 5, z + 1], [x - 2, -4, z]]], c);
  });
  return b.build();
}
const spentaPose = ({ t, anger = 0 }) => ({
  root: { ty: 6 + Math.sin(t * 1.9) * 4.5 },
  body: { rz: Math.sin(t * 1.3) * 0.16 + anger * Math.sin(t * 30) * 0.07, rx: Math.sin(t * 1.1) * 0.07 },
  eye: { tx: Math.sin(t * 0.9) * 3.4, s: 1 + Math.max(0, Math.sin(t * 7)) * 0.12 + anger * 0.35 },
  r1: { rz: Math.sin(t * 2.6) * 0.3, rx: Math.sin(t * 2) * 0.2 }, r2: { rz: Math.sin(t * 2.1 + 2) * 0.26, rx: Math.sin(t * 2.4 + 1) * 0.2 }, r3: { rz: Math.sin(t * 2.9 + 4) * 0.3 },
});

const FRONDS = [[-17, 4], [17, 4], [-10, -14], [11, -14], [0, -18]];
function alga() {
  const bones = [['root', null, [0, 0, 0]], ['bulb', 'root', [0, 16, 0]]];
  FRONDS.forEach(([x, z], i) => bones.push([`a${i}`, 'root', [x, 4, z]], [`b${i}`, `a${i}`, [x * 1.7, 36, z * 1.4]]));
  const b = builder(bones);
  b.ball('bulb', [0, 20, 2], [22, 20, 19], '#2c6a34', { rows: 7, cols: 11 });
  b.ball('bulb', [0, 11, 6], [24, 11, 20], '#235428', { rows: 5, cols: 10 });
  for (let i = 0; i < 9; i++) {
    const x = (i - 4) * 4.6, z = 17 - Math.abs(i - 4) * 1.7;
    b.tube('bulb', [x, 33 - Math.abs(i - 4), z - 5], [x * 1.15, 17 + (i % 3) * 3, z + 5], 1.9, 0.4, i % 2 ? '#7ac86a' : '#4e9a46', { sides: 4 });
  }
  b.ball('bulb', [0, 22, 19.4], [14, 6.4, 3], '#0e2810', { rows: 5, cols: 9 });
  eyes(b, 'bulb', 22.6, 21.6, 6, 3, '#eaff9a');
  FRONDS.forEach(([x, z], i) => {
    const mid = [x * 1.7, 36, z * 1.4], tip = [x * 1.35 + (i % 2 ? 9 : -9), 66 + (i % 3) * 8, z * 1.1];
    b.tube(`a${i}`, [x, 4, z], mid, 6.4, 4.2, i % 2 ? '#2e7a40' : '#1e5a30', { sides: 6 });
    b.tube(`b${i}`, mid, tip, 4.3, 0.5, i % 2 ? '#46a054' : '#2e7a40', { sides: 6 });
    b.ball(`b${i}`, mid, 4.3, '#2e7a40', { rows: 4, cols: 6 });
  });
  return b.build();
}
const algaPose = ({ t, amp = 0, anger = 0 }) => {
  const pose = { root: { ty: Math.sin(t * 1.6) * 1.4 }, bulb: { s: 1 + Math.sin(t * 2.2) * 0.035, ry: Math.sin(t * 0.7) * 0.18 } };
  FRONDS.forEach((_, i) => {
    const w = t * (1.7 + amp * 3 + anger * 3) + i * 1.3;
    pose[`a${i}`] = { rz: Math.sin(w) * 0.16, rx: Math.cos(w * 0.8) * 0.13 + amp * 0.12 };
    pose[`b${i}`] = { rz: Math.sin(w - 1) * 0.38, rx: Math.cos(w * 0.8 - 1) * 0.26 + anger * 0.3 };
  });
  return pose;
};

function airone() {
  const b = builder([['root', null, [0, 0, 0]], ['legL', 'root', [7, 54, -2]], ['legR', 'root', [-7, 54, -2]], ['body', 'root', [0, 62, 0]],
    ['wingL', 'body', [13, 70, 4]], ['wingR', 'body', [-13, 70, 4]], ['neck1', 'body', [0, 70, 20]], ['neck2', 'neck1', [0, 96, 38]], ['head', 'neck2', [0, 124, 24]]]);
  const g = '#3ec890', pale = '#8cf0c4', deep = '#1c8a60';
  for (const [bone, s] of [['legL', 1], ['legR', -1]]) {
    b.tube(bone, [s * 7, 56, -2], [s * 8, 28, -9], 2.6, 1.9, deep, { sides: 5, mat: MAT.glass });
    b.tube(bone, [s * 8, 28, -9], [s * 8, 1, -1], 1.9, 1.5, deep, { sides: 5, mat: MAT.glass });
    for (const [dx, dz] of [[-6, 9], [0, 12], [6, 9], [0, -8]]) b.tube(bone, [s * 8, 1.5, -1], [s * 8 + dx, 0.5, -1 + dz], 1.3, 0.2, deep, { sides: 4 });
  }
  b.ball('body', [0, 66, 0], [17, 17, 30], g, { rows: 5, cols: 7, mat: MAT.glass });
  b.crystal('body', [0, 68, -18], [0, 48, -64], 11, deep, { waist: 0.25 });
  b.crystal('body', [6, 72, -16], [16, 60, -56], 6, g, { waist: 0.25 });
  b.crystal('body', [-6, 72, -16], [-16, 60, -56], 6, g, { waist: 0.25 });
  for (const [bone, s] of [['wingL', 1], ['wingR', -1]]) {
    b.crystal(bone, [s * 13, 73, 12], [s * 26, 50, -42], 9, pale, { sides: 4, waist: 0.3 });
    b.crystal(bone, [s * 14, 68, 2], [s * 23, 38, -26], 6, g, { sides: 4, waist: 0.35 });
  }
  b.tube('neck1', [0, 68, 20], [0, 97, 38], 8.4, 5, g, { sides: 6, mat: MAT.glass });
  b.ball('neck2', [0, 97, 38], 5.4, g, { rows: 4, cols: 6, mat: MAT.glass });
  b.tube('neck2', [0, 96, 38], [0, 125, 24], 5.2, 4.2, g, { sides: 6, mat: MAT.glass });
  b.ball('head', [0, 128, 27], [7.6, 7.4, 11], pale, { rows: 5, cols: 7, mat: MAT.glass });
  b.crystal('head', [0, 127, 33], [0, 108, 72], 4.4, '#f0dc78', { sides: 4, waist: 0.15 });
  b.crystal('head', [0, 133, 22], [0, 146, -8], 3, pale, { sides: 4 });
  eyes(b, 'head', 130, 32.6, 5.6, 2.1, '#fff8c0');
  return b.build();
}
const aironePose = ({ t, amp = 0, anger = 0 }) => {
  const sway = Math.sin(t * 1.2), flap = Math.sin(t * (2 + anger * 6)) * (0.06 + anger * 0.35);
  return {
    body: { ty: Math.sin(t * 1.6) * 1.6 },
    legL: { rx: Math.sin(t * 5) * 0.35 * amp }, legR: { rx: -Math.sin(t * 5) * 0.35 * amp },
    neck1: { rx: sway * 0.1 + anger * 0.18, ry: Math.sin(t * 0.5) * 0.28 }, neck2: { rx: -sway * 0.14 }, head: { rx: sway * 0.07 + anger * 0.2, ry: Math.sin(t * 0.5 - 0.8) * 0.3 },
    wingL: { rz: flap + anger * 0.5 }, wingR: { rz: -flap - anger * 0.5 },
  };
};

function cervo() {
  const legs = [['lFL', 17, 24], ['lFR', -17, 24], ['lBL', 17, -30], ['lBR', -17, -30]];
  const b = builder([['root', null, [0, 0, 0]], ['body', 'root', [0, 66, 0]], ['neck', 'body', [0, 80, 28]], ['head', 'neck', [0, 116, 42]],
    ...legs.map(([n, x, z]) => [n, 'root', [x, 60, z]]), ['tail', 'body', [0, 76, -40]]]);
  const g = '#2cb674', pale = '#7cf4b8', deep = '#1c7a50', horn = '#c0ffe0';
  b.ball('body', [0, 68, -4], [25, 24, 44], g, { rows: 5, cols: 8, mat: MAT.glass });
  b.ball('body', [0, 70, 22], [24, 27, 22], '#3acc86', { rows: 5, cols: 7, mat: MAT.glass });
  for (const [x, y, z, tx, ty, tz] of [[0, 86, -8, 4, 112, -26], [12, 84, -20, 30, 100, -42], [-13, 84, 0, -34, 100, -10], [0, 84, -28, -5, 98, -54]]) b.crystal('body', [x, y, z], [tx, ty, tz], 8, pale);
  b.crystal('body', [0, 64, 38], [0, 40, 52], 10, pale, { waist: 0.25 });
  b.ball('body', [0, 62, 44.5], 5.6, '#eaffd0', { rows: 5, cols: 7, mat: MAT.glow });
  for (const [n, x, z] of legs) {
    b.tube(n, [x * 0.86, 66, z], [x * 1.18, 32, z + (z > 0 ? 6 : -9)], 10, 5, deep, { sides: 5, mat: MAT.glass });
    b.tube(n, [x * 1.18, 33, z + (z > 0 ? 6 : -9)], [x * 1.22, 5, z + 1], 5, 3.2, g, { sides: 5, mat: MAT.glass });
    b.tube(n, [x * 1.22, 7, z + 1], [x * 1.22, 0, z + 3], 3.6, 5.4, '#d8ffe8', { sides: 5, mat: MAT.glass });
  }
  b.crystal('tail', [0, 76, -40], [0, 92, -62], 7, pale);
  b.tube('neck', [0, 74, 26], [0, 117, 43], 17, 8.6, '#46d494', { sides: 6, mat: MAT.glass });
  b.ball('head', [0, 120, 46], [12.4, 12, 13], pale, { rows: 5, cols: 7, mat: MAT.glass });
  b.tube('head', [0, 117, 52], [0, 106, 72], 8, 3.6, g, { sides: 6, mat: MAT.glass });
  b.ball('head', [0, 105.6, 73], 3.4, deep, { rows: 4, cols: 6 });
  eyes(b, 'head', 122.6, 57.2, 7.4, 3, '#fbffd0');
  for (const s of [-1, 1]) {
    b.crystal('head', [s * 10, 126, 42], [s * 29, 133, 36], 4.4, g, { sides: 4 });
    const path = [[7, 129, 43], [22, 148, 36], [42, 161, 32], [50, 184, 26]];
    for (let i = 0; i < 3; i++) {
      const a = path[i], c = path[i + 1];
      b.tube('head', [s * a[0], a[1], a[2]], [s * c[0], c[1], c[2]], 3.8 - i * 0.9, 2.9 - i * 0.9, horn, { sides: 5, mat: MAT.glow });
    }
    for (const [a, c] of [[[22, 148, 36], [20, 176, 44]], [[42, 161, 32], [66, 166, 40]], [[33, 155, 34], [36, 175, 18]], [[14, 138, 40], [28, 138, 58]]]) b.tube('head', [s * a[0], a[1], a[2]], [s * c[0], c[1], c[2]], 2.4, 0.2, horn, { sides: 4, mat: MAT.glow });
  }
  return b.build();
}
const cervoPose = ({ t, amp = 0, anger = 0 }) => {
  const breath = Math.sin(t * 1.3), k = 0.4 * amp;
  return {
    body: { ty: breath * 1.6, s: 1 + breath * 0.012 },
    neck: { rx: breath * 0.05 + anger * 0.25, ry: Math.sin(t * 0.4) * 0.22 }, head: { rx: -breath * 0.04 + anger * 0.15, ry: Math.sin(t * 0.4 - 0.7) * 0.25 },
    lFL: { rx: Math.sin(t * 4) * k - Math.max(0, Math.sin(t * 0.7)) ** 6 * 0.5 }, lFR: { rx: -Math.sin(t * 4) * k }, lBL: { rx: -Math.sin(t * 4) * k }, lBR: { rx: Math.sin(t * 4) * k },
    tail: { ry: Math.sin(t * 2.6) * 0.3 },
  };
};

const BUILD = { cocci: [cocci, cocciPose, 0.9], granchio: [granchio, granchioPose, 0.9], spenta: [spenta, spentaPose, 0.95], alga: [alga, algaPose, 0.92], airone: [airone, aironePose, 1], cervo: [cervo, cervoPose, 0.98] };
export const CREATURE_IDS = Object.keys(BUILD);
const cache = {};

export function creatureModel(type) {
  const id = BUILD[type] ? type : 'cocci';
  if (!cache[id]) {
    const [make, pose, size] = BUILD[id];
    cache[id] = { ...make(), pose, size };
  }
  return cache[id];
}
