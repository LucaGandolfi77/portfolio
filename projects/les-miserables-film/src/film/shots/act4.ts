/* IX. The Barricade, X. The Sewer, XI. Javert, XII. Forgiveness, Epilogue. */
import { GROUND, X0, X1, bed, blanket, candlestick, chair, chandelier, clouds, ground, headstone, house, lamp, moon, paris, ridge, room, stars, sun, table, thread, tree, water, windowFrame, godray, flowers } from '../draw/scenery';
import { blobPath, ellipse, glow, hash, line, linear, rect, rgba, ramp, ease, lerp } from '../draw/core';
import { birds, bubbles, embers, flash, fog, motes, petals, rain, smoke, splashes } from '../draw/weather';
import { drawItem } from '../draw/puppet';
import { barricadeHeap } from './heap';
import { LIGHT, bareRoom, barricadeStreet, duskSky, nightSky, riverNight, salon, sewerSet, bishopRoom } from './sets';
import type { Actor, S, Shots } from './types';

function battleFront(s: S, smokeAmount = 0.3, wet = 0): void {
  s.layer(1.25, () => {
    smoke(s.ctx, s.time, -330, GROUND + 90, '#8a7478', smokeAmount, 10, 460);
    smoke(s.ctx, s.time + 5, 360, GROUND + 100, '#7a6468', smokeAmount * 0.9, 10, 520);
    embers(s.ctx, s.time, 0, GROUND + 80, 900, 620, 46);
    if (wet > 0) { rain(s.ctx, s.time, 200, wet); splashes(s.ctx, s.time, GROUND + 20, 18, 120); }
  });
}

function night(s: S, heapX0: number, heapX1: number, top: number, seed = 1): void {
  barricadeStreet(s);
  s.layer(0.8, () => { flash(s.ctx, s.time, 0, -40, 420, '#ffb060', 3.8, seed); barricadeHeap(s, heapX0, heapX1, top, seed); });
  s.layer(1, () => { const c = s.ctx; ellipse(c, -330, GROUND - 6, 42, 9, '#140a08'); for (let i = 0; i < 3; i++) line(c, [[-360 + i * 26, GROUND - 2], [-300 - i * 22, GROUND - 22]], '#3a1c10', 7); glow(c, -330, GROUND - 30, 340, '#ff7028', 0.4); embers(c, s.time, -330, GROUND - 16, 50, 180, 22); });
}

/** A heap of cobbles and furniture against the sky for the barricade's first shot. */
function crowd(s: S, y: number, color: string, count: number, seed: number): void {
  for (let i = 0; i < count; i++) {
    const x = -640 + (i * 1280) / count + hash(seed + i) * 50;
    const bob = Math.sin(s.time * 5 + i * 1.7) * 3;
    s.actor({ who: i % 3 === 0 ? 'student' : i % 3 === 1 ? 'worker' : 'woman', x: x + Math.sin(s.time * 0.6 + i) * 8, y: y + bob + hash(i) * 14, s: 0.46 + hash(i * 3) * 0.12, face: 1, pose: i % 4 === 0 ? 'raise' : 'walk', mood: 'angry', flat: color, marching: 0.7, seed: i, item: i % 7 === 0 ? 'torch' : undefined });
  }
}

function cemetery(s: S): void {
  const c = s.ctx;
  duskSky(s, '#5c7098', '#a8a8bc', '#e8d0c0');
  s.layer(0.08, () => { clouds(c, s.time, -270, '#d8d8e4', 0.6, 9, 9, 81); birds(c, s.time, -230, 5, '#38384c', 4); });
  s.layer(0.25, () => paris(c, 80, '#8890a8', '#fff0c8', 51, 0.55, true));
  s.layer(0.45, () => { ridge(c, 150, 90, '#5c7468', 51, 220); for (let i = 0; i < 18; i++) headstone(c, -850 + i * 100 + hash(i) * 40, 160 - hash(i * 3) * 30, 28, 52, '#8c909c', (hash(i * 5) - 0.5) * 0.16); });
  s.layer(0.7, () => { ground(c, 188, '#6a8460', '#283828'); for (const x of [-470, 450]) tree(c, x, 200, 480, '#2c2c30', '#6c9c70', x, s.time); for (const x of [-330, 290]) headstone(c, x, 210, 80, 140, '#a0a4b0', x * 0.0002); });
  s.layer(1, () => {
    ground(c, GROUND - 4, '#6c8c58', '#1c2c1c');
    headstone(c, 0, GROUND + 6, 190, 240, '#c0c0c4', -0.025);
    for (let i = 0; i < 4; i++) line(c, [[-56, -62 + i * 34], [-20, -66 + i * 34], [54 - i * 6, -63 + i * 34]], rgba('#50505c', 0.55 * (1 - s.on(1, 5, 1.5))), 2.4);
    for (let i = 0; i < 70; i++) { const x = -640 + hash(i * 2) * 1280; const y = GROUND + 6 + hash(i * 7) * 150; line(c, [[x, y], [x + 4 + Math.sin(s.time + i) * 3, y - 18]], '#4c7040', 3); }
    flowers(c, -90, GROUND + 22, 90, 9, '#f4f0ff', 3, s.time);
  });
}

const marching = (who: Actor['who'], x: number, extra: Partial<Actor> = {}): Actor => ({ who, x, face: 1, shadow: true, ...extra });

export const ACT4: Shots = {
  'ba-rise': {
    light: LIGHT.fire,
    cam: [-40, -40, 1.05],
    moves: [{ l: 0, d: 2, move: 6, x: 0, y: -100, z: 1.15 }, { l: 1, move: 1.4, x: -170, y: -90, z: 1.7 }, { l: 2, move: 7, x: 0, y: -50, z: 1 }],
    back(s) {
      barricadeStreet(s, true);
      s.layer(0.65, () => crowd(s, 200, '#2c1424', 16, 3));
      s.layer(0.8, () => { const grow = ease(ramp(s.since(1), 0, 9)); if (grow > 0) barricadeHeap(s, -40, 620, lerp(220, -20, grow), 5, true); });
    },
    actors: [
      { who: 'enjolras', voice: 'enj', x: -230, face: 1, item: 'flag', pose: 'hold', mood: 'angry', shadow: true, keys: [{ l: 0, d: 2.5, pose: 'raise' }, { l: 1, face: -1, pose: 'raise' }, { l: 2, face: 1, x: 110, y: 90, move: 3, pose: 'raise' }] },
      marching('student', -520, { pose: 'walk', s: 0.95, keys: [{ l: 1, x: -90, move: 4, pose: 'carry' }] }),
      marching('worker', -390, { pose: 'walk', keys: [{ l: 1, x: 290, move: 5, pose: 'lift' }] }),
      marching('grantaire', 420, { face: -1, pose: 'sit', item: 'bottle', mood: 'smirk', s: 0.9 }),
    ],
    front(s) { battleFront(s, 0.2); s.layer(1.4, () => crowd(s, 450, '#14060e', 7, 11)); },
    sound: { crowd: 1, drone: 0.4, melody: 0.5 },
    sfx: [[0, 'bell', 1], [0, 'bell', 2.8], [1, 'wood', 0.6], [2, 'wood', 1]],
    trans: 'wipe',
  },
  'ba-spy': {
    light: LIGHT.fire,
    cam: [0, -30, 1.25],
    moves: [{ l: 0, move: 1.2, x: -80, y: -10, z: 1.8 }, { l: 1, move: 1.4, x: 90, y: -70, z: 2.2 }, { l: 2, move: 5, x: 20, y: -20, z: 1.15 }],
    back(s) { night(s, 330, 760, -60, 7); s.layer(0.95, () => { rect(s.ctx, 126, -180, 22, 410, '#2c180c'); }); },
    actors: [
      { who: 'gavroche', voice: 'gav', x: -150, face: 1, pose: 'point', mood: 'angry', shadow: true, keys: [{ l: 1, pose: 'stand', mood: 'smirk' }] },
      { who: 'javertBare', voice: 'jav', x: 110, face: -1, mood: 'calm', shadow: true, keys: [{ l: 2, pose: 'stand', mood: 'closed', x: 116 }] },
      { who: 'enjolras', voice: 'enj', x: -300, face: 1, mood: 'angry', item: 'musket', pose: 'hold', keys: [{ l: 2, pose: 'point', x: -90, move: 1.4, item: null }] },
      { who: 'worker', x: 250, face: -1, mood: 'angry', pose: 'reach', s: 0.95 },
    ],
    mid(s) { if (s.since(2) > 0.8) s.layer(1, () => { for (let i = 0; i < 3; i++) line(s.ctx, [[76, -10 + i * 34], [116, 2 + i * 34], [160, -12 + i * 34]], '#c8a868', 6); }); },
    front(s) { battleFront(s, 0.22); },
    sound: { fire: 0.5, crowd: 0.4, drone: 0.7 },
    sfx: [[0, 'hit', 0]],
  },
  'ba-eponine': {
    light: LIGHT.night,
    cam: [-30, -20, 1.2],
    moves: [{ l: 0, d: 3.5, move: 1.4, x: 0, y: 30, z: 1.6 }, { l: 1, move: 2.4, x: -10, y: 90, z: 2.3 }, { l: 2, move: 4, x: -40, y: 100, z: 2.9 }, { l: 3, move: 8, x: 0, y: -10, z: 1.1 }],
    back(s) { night(s, 300, 780, -80, 9); },
    actors: [
      { who: 'marius', voice: 'mar', x: 60, face: -1, mood: 'sad', item: 'torch', pose: 'hold', shadow: true, keys: [{ l: 0, d: 4.5, face: 1, pose: 'cower', mood: 'fear', item: null }, { l: 1, face: -1, pose: 'kneel', mood: 'fear', x: 36, move: 1.2 }, { l: 2, mood: 'cry' }, { l: 3, pose: 'bow', x: 20, mood: 'cry', move: 1.6 }] },
      { who: 'soldier', x: 400, y: 150, face: -1, item: 'musket', pose: 'aim', s: 0.9, keys: [{ l: 0, d: 6.2, alpha: 0, move: 0.8 }] },
      { who: 'eponineBoy', voice: 'epo', x: 330, face: -1, pose: 'run', mood: 'fear', shadow: true, keys: [{ l: 0, d: 3.2, x: 170, pose: 'reach', move: 1.2, face: 1 }, { l: 0, d: 5.4, pose: 'lie', x: -70, y: 224, move: 1.2, mood: 'sad', face: 1 }, { l: 1, mood: 'tender' }, { l: 2, mood: 'joy' }, { l: 2, d: 6.2, mood: 'closed' }] },
    ],
    mid(s) { s.layer(1, () => { const k = s.on(1, 2); if (k > 0) drawItem(s.ctx, 'letter', [-20, 150], { t: s.time, ambient: '#101a3a', shade: 0.2 }); thread(s.ctx, [[-60, 120], [-20, 60], [-80, -20], [-10, -140], [-70, -320]], s.on(2, 9, 5), s.time, 2.2); }); },
    front(s) { s.layer(1.25, () => { smoke(s.ctx, s.time, -330, GROUND + 90, '#7a7488', 0.2, 8, 420); rain(s.ctx, s.time, 220, s.on(3, 3) * 0.5); }); },
    sound: { fire: 0.2, melody: 1, drone: 0.3, rain: 0.3 },
    sfx: [[0, 'shot', 5.2], [3, 'thunder', 1]],
  },
  'ba-night': {
    light: LIGHT.fire,
    cam: [-120, -20, 1.4],
    moves: [{ l: 0, move: 9, x: -150, y: -50, z: 1.75 }, { l: 1, move: 4, x: 90, y: -130, z: 1.35 }],
    back(s) { night(s, 130, 700, 0, 13); },
    actors: [
      { who: 'val', voice: 'val', x: -200, face: 1, pose: 'read', item: 'letter', mood: 'sad', shadow: true, keys: [{ l: 0, d: 5, mood: 'smirk' }, { l: 0, d: 7.5, mood: 'sad', pose: 'think', item: null }, { l: 0, d: 9.5, alpha: 0, move: 0.8 }] },
      { who: 'valGuard', x: -200, face: 1, alpha: 0, mood: 'calm', shadow: true, keys: [{ l: 0, d: 9.5, alpha: 1, move: 0.8 }, { l: 0, d: 10.4, pose: 'walk', x: -60, move: 3 }] },
      { who: 'enjolras', voice: 'enj', x: 240, y: 48, face: -1, mood: 'calm', item: 'flag', pose: 'hold', keys: [{ l: 1, mood: 'tender', pose: 'raise' }] },
      marching('student', 70, { face: 1, pose: 'sit', s: 0.9 }),
    ],
    front(s) { battleFront(s, 0.16, 0.22); },
    sound: { rain: 0.3, fire: 0.5, melody: 0.8 },
    sfx: [[1, 'chime', 0]],
  },
  'ba-spare': {
    light: LIGHT.night,
    cam: [0, -30, 1.35],
    moves: [{ l: 1, move: 2, x: -20, y: -60, z: 1.9 }, { l: 2, move: 1.4, x: -90, y: -60, z: 2.2 }, { l: 3, move: 1.4, x: 90, y: -70, z: 2.4 }, { l: 4, move: 2, x: 0, y: -20, z: 1.15 }],
    back(s) {
      const c = s.ctx;
      nightSky(s, '#060818', '#1c1c3c', '#5c3440');
      s.layer(0.6, () => { house(c, -330, 190, 360, 700, { wall: '#1c1830', roof: '#0c0814', lit: 0.05, seed: 41 }); house(c, 340, 190, 380, 640, { wall: '#1c162c', roof: '#0c0814', lit: 0.05, seed: 43 }); });
      s.layer(1, () => { ground(c, GROUND - 6, '#1c1424', '#040208'); godray(c, 40, -420, 60, 360, 660, 0, '#98b0e8', 0.12); });
    },
    actors: [
      { who: 'valGuard', voice: 'val', x: -100, face: 1, mood: 'angry', item: 'pistol', pose: 'stand', shadow: true, keys: [{ l: 1, pose: 'aim', mood: 'calm' }, { l: 1, d: 3.4, pose: 'reach', item: null }, { l: 2, pose: 'stand', mood: 'tender' }, { l: 4, pose: 'point', face: -1 }, { l: 4, d: 2.2, pose: 'raise', item: 'pistol' }] },
      { who: 'javertBare', voice: 'jav', x: 100, face: -1, mood: 'closed', pose: 'hunch', shadow: true, keys: [{ l: 1, d: 3.6, mood: 'fear', pose: 'stand' }, { l: 3, mood: 'angry' }, { l: 4, d: 1.4, face: 1, pose: 'walk', x: 520, mood: 'fear', move: 4 }] },
    ],
    mid(s) { if (s.since(1) < 3.6) s.layer(1, () => { for (let i = 0; i < 3; i++) line(s.ctx, [[70, 20 + i * 30], [104, 30 + i * 30], [140, 18 + i * 30]], '#c8a868', 5); }); },
    front(s) { s.layer(1.3, () => fog(s.ctx, s.time, 290, '#8a6878', 0.18, 7, 18)); const k = s.since(4) - 2.8; if (k > 0 && k < 0.8) s.layer(1, () => glow(s.ctx, -60, -150, 320, '#ffd090', (1 - k / 0.8) * 0.8)); },
    sound: { drone: 0.9, wind: 0.3 },
    sfx: [[1, 'wood', 3.4], [4, 'shot', 2.8]],
    trans: 'black',
  },
  'ba-gavroche': {
    light: LIGHT.fire,
    cam: [-60, -20, 1.3],
    moves: [{ l: 0, move: 1.4, x: -150, y: 20, z: 1.8 }, { l: 1, move: 1.2, x: -200, y: -50, z: 1.7 }, { l: 2, move: 2, x: 90, y: 10, z: 1.35 }, { l: 3, move: 5, x: 60, y: -170, z: 1.05 }],
    back(s) { night(s, -760, -280, -50, 17); s.layer(0.85, () => smoke(s.ctx, s.time, 380, GROUND, '#a89098', 0.35, 9, 380)); },
    actors: [
      { who: 'gavroche', voice: 'gav', x: -170, face: 1, mood: 'joy', item: 'basket', pose: 'stand', shadow: true, keys: [{ l: 0, d: 3, pose: 'run', x: -20, move: 1.6 }, { l: 2, pose: 'bow', x: 90, move: 1.4 }, { l: 2, d: 2.6, pose: 'run', x: 220, move: 1 }, { l: 2, d: 4.2, pose: 'raise', mood: 'smirk' }, { l: 2, d: 5.8, pose: 'run', x: 80, face: -1, move: 1 }, { l: 3, pose: 'fallen', y: 232, mood: 'closed', item: null, move: 1.1 }, { l: 3, d: 2.4, alpha: 0.15, move: 4 }] },
      { who: 'enjolras', voice: 'enj', x: -330, face: 1, mood: 'fear', keys: [{ l: 1, pose: 'reach', x: -250, move: 0.6 }, { l: 3, mood: 'cry', pose: 'hunch' }] },
      { who: 'soldier', x: 520, y: 212, face: -1, item: 'musket', pose: 'aim', s: 0.82 },
      { who: 'soldier', x: 600, y: 224, face: -1, item: 'musket', pose: 'aim', s: 0.86, seed: 4 },
    ],
    mid(s) { s.layer(1, () => { const k = s.on(3, 7, 1.2); thread(s.ctx, [[80, 190], [120, 90], [50, -20], [110, -150], [60, -300], [100, -520]], k, s.time, 3); if (k > 0) { s.ctx.save(); s.ctx.globalAlpha = Math.min(1, k * 2); for (let i = 0; i < 6; i++) glow(s.ctx, 80 + Math.sin(s.time + i * 2) * 60, 120 - ((s.time * 40 + i * 70) % 460), 22, '#ffe0a0', 0.8); s.ctx.restore(); } }); },
    front(s) { battleFront(s, 0.3); },
    sound: { fire: 0.3, drone: 0.5, melody: 0.7, crowd: 0.2 },
    sfx: [[2, 'shot', 0.4], [2, 'shot', 3], [2, 'shot', 4.8], [3, 'shot', 0], [3, 'chime', 2.4]],
  },
  'ba-fall': {
    light: LIGHT.dawn,
    cam: [-40, -30, 1.15],
    moves: [{ l: 0, move: 7, x: -90, y: -50, z: 1.5 }, { l: 1, move: 1.4, x: -90, y: -70, z: 2.1 }, { l: 2, move: 6, x: -90, y: -40, z: 1.35 }],
    back(s) { barricadeStreet(s, true); s.layer(0.8, () => { barricadeHeap(s, 190, 760, 120, 23, true); smoke(s.ctx, s.time, 330, 200, '#d8c0b8', 0.4, 10, 500); }); s.layer(0.95, () => rect(s.ctx, -420, -260, 160, 490, linear(s.ctx, -420, 0, -260, 0, [[0, '#3c2434'], [1, '#6a4454']]))); },
    actors: [
      { who: 'enjolras', voice: 'enj', x: -170, face: 1, mood: 'calm', shadow: true, keys: [{ l: 2, mood: 'joy', pose: 'offer' }] },
      { who: 'grantaire', voice: 'gran', x: -520, face: 1, mood: 'calm', pose: 'walk', shadow: true, keys: [{ l: 0, d: 4, x: -76, move: 4 }, { l: 1, face: -1, pose: 'offer', mood: 'tender' }] },
      { who: 'soldier', x: 330, face: -1, item: 'musket', pose: 'aim', s: 0.92 },
      { who: 'soldier', x: 440, y: 220, face: -1, item: 'musket', pose: 'aim', s: 0.88, seed: 4 },
      { who: 'soldier', x: 545, y: 212, face: -1, item: 'musket', pose: 'aim', s: 0.84, seed: 8 },
    ],
    mid(s) { s.layer(1, () => thread(s.ctx, [[-130, -10], [-104, 20], [-84, -4]], s.on(2, 2), s.time, 2)); },
    front(s) { s.layer(1.25, () => { motes(s.ctx, s.time, 46, '#ffe0c0', 0.4, 640); fog(s.ctx, s.time, 290, '#e0b0b0', 0.22, 8, 16); const k = s.since(2) - 3.4; if (k > 0) rect(s.ctx, X0, -1300, X1 - X0, 2600, rgba('#fff4e8', Math.min(0.85, k * 0.5))); }); },
    sound: { wind: 0.4, melody: 1 },
    sfx: [[2, 'shot', 3.4]],
  },

  /* ---------------- X. The Sewer ---------------- */
  'eg-down': {
    light: LIGHT.sewer,
    cam: [-40, -50, 1.4],
    moves: [{ l: 0, move: 5, x: -10, y: 50, z: 1.55 }, { l: 1, move: 9, x: 0, y: -40, z: 1 }],
    back(s) {
      const c = s.ctx;
      const down = s.since(1) + 0.4;
      if (down < 0) { night(s, 220, 760, -60, 29); s.layer(1, () => { ellipse(c, -40, GROUND + 4, 92, 20, '#020103'); for (let i = -2; i <= 2; i++) line(c, [[-40 + i * 32, GROUND - 12], [-40 + i * 32, GROUND + 20]], '#4a4448', 5); }); }
      else sewerSet(s, 0);
    },
    actors: [
      { who: 'val', voice: 'val', x: -170, face: 1, pose: 'kneel', mood: 'fear', keys: [{ l: 0, d: 4.5, pose: 'carry', x: -70, move: 1.2 }, { l: 1, d: -0.4, x: -250, y: 250, face: 1, pose: 'carry', move: 0.1 }, { l: 1, d: 0.5, x: -20, move: 7 }] },
      { who: 'mariusPale', x: -20, y: 226, face: 1, pose: 'fallen', mood: 'closed', s: 0.92, keys: [{ l: 0, d: 4.5, alpha: 0, move: 1 }] },
    ],
    mid(s) {
      const carried = s.on(0, 1, 4.8);
      if (carried > 0) s.layer(1, () => { const after = s.since(1) + 0.4; const x = after < 0 ? lerp(-170, -70, ease(ramp(s.since(0), 4.5, 5.7))) : lerp(-250, -20, ease(ramp(after, 0.9, 7.9))); s.actor({ who: 'mariusPale', x: x + 20, y: after < 0 ? 58 : 82, face: 1, pose: 'lie', mood: 'closed', s: 0.88, alpha: carried }); });
      if (s.since(1) > 0) s.layer(1, () => { s.ctx.fillStyle = 'rgba(8,24,10,0.75)'; s.ctx.fillRect(X0, GROUND - 12, 2600, 900); water(s.ctx, GROUND - 12, 'rgba(30,52,26,0.8)', '#020603', s.time, [[0, '#8aac58', 1]]); });
    },
    front(s) {
      if (s.since(1) + 0.4 < 0) battleFront(s, 0.24); else s.layer(1.2, () => fog(s.ctx, s.time, 260, '#6a8a50', 0.16, 7, 10));
      /* Into the dark: the street gives way to the sewer. */
      const dark = 1 - Math.min(1, Math.abs(s.since(1) + 0.4) / 0.9);
      if (dark > 0) s.layer(1.2, () => rect(s.ctx, X0, -1300, X1 - X0, 2600, rgba('#020503', dark)));
    },
    sound: { water: 0.5, drone: 0.9 },
    sfx: [[0, 'shot', 0.2], [0, 'chain', 5], [1, 'splash', 0]],
    trans: 'black',
  },
  'eg-water': {
    light: LIGHT.sewer,
    cam: [0, -40, 1.3],
    moves: [{ l: 0, move: 2, x: 30, y: -70, z: 2.1 }, { l: 1, move: 8, x: 0, y: -30, z: 1.05 }, { l: 2, move: 6, x: 30, y: -60, z: 2.3 }],
    back(s) { sewerSet(s, 0); },
    actors: [
      { who: 'val', voice: 'val', x: -60, y: 290, face: 1, pose: 'carry', mood: 'angry', marching: 0.35, keys: [{ l: 1, y: 335, x: -20, mood: 'closed', move: 6 }, { l: 2, y: 310, x: 20, mood: 'cry', move: 5 }] },
    ],
    mid(s) {
      s.layer(1, () => {
        const sink = ease(ramp(s.since(1), 0, 6)) * 45 - ease(ramp(s.since(2), 0, 5)) * 25;
        const x = -60 + ease(ramp(s.since(1), 0, 6)) * 40 + ease(ramp(s.since(2), 0, 5)) * 40;
        s.actor({ who: 'mariusPale', x: x + 22, y: 120 + sink, face: 1, pose: 'lie', mood: 'closed', s: 0.88 });
        water(s.ctx, GROUND - 76 + sink * 1.4, 'rgba(28,50,24,0.86)', '#020603', s.time, [[0, '#90b460', 1.1]]);
        bubbles(s.ctx, s.time, GROUND - 50 + sink, 22);
      });
    },
    front(s) { s.layer(1.2, () => { motes(s.ctx, s.time, 24, '#d8ff90', 0.35, 520); fog(s.ctx, s.time, 280, '#6a8a50', 0.16, 7, 10); }); },
    sound: { water: 0.9, drone: 1 },
    sfx: [[0, 'splash', 2], [1, 'splash', 3], [2, 'splash', 1.5]],
  },
  'eg-gate': {
    light: { ambient: '#2c3418', shade: 0.28, rim: '#fff0b0', x: 1 },
    cam: [-20, -30, 1.2],
    moves: [{ l: 0, move: 4, x: 40, y: -30, z: 1.35 }, { l: 1, move: 1.4, x: -20, y: -40, z: 1.9 }, { l: 2, move: 2.4, x: -80, y: 40, z: 2.3 }],
    back(s) { sewerSet(s, 0.8); s.layer(1, () => ground(s.ctx, GROUND - 2, '#2c3018', '#060803')); },
    actors: [
      { who: 'val', voice: 'val', x: -300, face: 1, pose: 'carry', mood: 'closed', shadow: true, keys: [{ l: 0, x: -120, move: 3.5 }, { l: 0, d: 4, pose: 'kneel', mood: 'calm' }] },
      { who: 'mariusPale', x: -10, y: 238, face: 1, pose: 'lie', mood: 'closed', alpha: 0, s: 0.9, keys: [{ l: 0, d: 4, alpha: 1, move: 0.6 }] },
      { who: 'thenardier', voice: 'then', x: 210, face: -1, mood: 'smirk', item: 'lantern', pose: 'hold', shadow: true, keys: [{ l: 0, d: 5, x: 150, move: 1.4 }, { l: 1, pose: 'offer', item: null }, { l: 2, pose: 'kneel', x: 80, move: 1 }, { l: 2, d: 4, pose: 'offer', item: 'cloth', x: 120 }] },
    ],
    mid(s) { s.layer(1, () => { for (let x = 240; x <= 470; x += 38) line(s.ctx, [[x, -330], [x, GROUND]], '#0a0c06', 11); for (const y of [-210, -20, 150]) line(s.ctx, [[232, y], [476, y]], '#0a0c06', 11); godray(s.ctx, 360, -300, 160, 520, 560, -260, '#fff2c0', 0.16); }); },
    sound: { water: 0.5, drone: 0.7 },
    sfx: [[0, 'chain', 4.6]],
  },
  'eg-javert': {
    light: LIGHT.dusk,
    cam: [-60, -30, 1.1],
    moves: [{ l: 0, d: 1.5, move: 2, x: 170, y: -80, z: 2 }, { l: 1, move: 1.6, x: -90, y: -40, z: 1.8 }, { l: 2, move: 4, x: 60, y: -50, z: 2.3 }],
    back(s) {
      const c = s.ctx;
      duskSky(s, '#201c44', '#6a3c68', '#e08858');
      s.layer(0.1, () => { stars(c, s.time, 40, 0.6, -260); clouds(c, s.time, -230, '#4c2450', 0.5, 6, 6, 66); });
      s.layer(0.3, () => paris(c, 80, '#34204a', '#ffc870', 61, 0.65, true));
      s.layer(0.55, () => water(c, 150, '#5a2c50', '#0c0614', s.time, [[-120, '#ff9858', 0.9], [260, '#ffc070', 0.7]]));
      s.layer(1, () => { ground(c, GROUND - 6, '#2c2030', '#06040a'); c.beginPath(); c.arc(-420, GROUND - 6, 170, Math.PI, 0); c.fillStyle = '#04060a'; c.fill(); for (let x = -560; x < -280; x += 40) line(c, [[x, GROUND - 180], [x, GROUND - 6]], '#141018', 9); });
    },
    actors: [
      { who: 'javert', voice: 'jav', x: 125, face: -1, mood: 'calm', item: 'cane', shadow: true, keys: [{ l: 1, mood: 'fear' }, { l: 2, d: 2, face: 1, mood: 'sad' }] },
      { who: 'val', voice: 'val', x: -400, face: 1, pose: 'carry', mood: 'closed', shadow: true, keys: [{ l: 0, x: -150, move: 4 }, { l: 1, mood: 'tender' }] },
    ],
    mid(s) { s.layer(1, () => { const x = lerp(-400, -150, ease(ramp(s.since(0), 0, 4))); s.actor({ who: 'mariusPale', x: x + 24, y: 62, face: 1, pose: 'lie', mood: 'closed', s: 0.88 }); }); },
    sound: { water: 0.6, wind: 0.3, drone: 0.6 },
    sfx: [[0, 'chain', 0]],
    trans: 'light',
  },

  /* ---------------- XI. The Star ---------------- */
  'et-street': {
    light: LIGHT.night,
    cam: [0, -50, 1.15],
    moves: [{ l: 0, move: 6, x: -80, y: -100, z: 1.5 }, { l: 1, move: 6, x: 90, y: 10, z: 1.05 }],
    back(s) {
      const c = s.ctx;
      nightSky(s, '#050a24', '#16225a', '#3c4c80');
      s.layer(0.08, () => { stars(c, s.time, 150); moon(c, 230, -330, 32); });
      s.layer(0.5, () => paris(c, 160, '#141a40', '#ffc060', 77, 0.9));
      s.layer(1, () => {
        ground(c, GROUND - 6, '#1c2044', '#04050e');
        cobblesBlue(s);
        house(c, -250, GROUND - 4, 340, 520, { wall: '#34385c', roof: '#14162e', lit: 0, seed: 12 });
        windowFrame(c, -260, -150, 110, 140, '#ffd890', '#d87c30', '#2c180c');
        glow(c, -260, -150, 220, '#ffa848', 0.4);
        if (s.since(0) > 3.6) { c.save(); c.beginPath(); c.rect(-315, -220, 110, 140); c.clip(); s.actor({ who: 'val', x: -262, y: 112, s: 0.85, face: 1, mood: s.since(1) > 1 ? 'fear' : 'calm' }); c.restore(); }
        lamp(c, 210, GROUND + 4, 250, s.time);
      });
    },
    actors: [{ who: 'javert', x: 120, face: -1, mood: 'calm', shadow: true, keys: [{ l: 0, d: 4, face: 1, pose: 'walk', x: 600, move: 5 }] }],
    front(s) { s.layer(1.3, () => fog(s.ctx, s.time, 290, '#5c70b0', 0.2, 8, 18)); },
    sound: { wind: 0.4, drone: 0.5 },
    sfx: [[1, 'bell', 1]],
    trans: 'black',
  },
  'et-bridge': {
    light: { ambient: '#101c4c', shade: 0.32, rim: '#b8d0ff', x: 1 },
    cam: [0, -30, 1.15],
    moves: [{ l: 0, move: 3, x: 0, y: -90, z: 2.3 }, { l: 1, move: 8, x: 0, y: -50, z: 1.05 }, { l: 2, move: 3, x: 10, y: -100, z: 2.8 }],
    back(s) { riverNight(s); parapet(s); },
    actors: [
      { who: 'javertBare', voice: 'jav', x: -10, face: 1, mood: 'fear', item: 'hat', pose: 'hold', keys: [{ l: 0, mood: 'fear' }, { l: 1, pose: 'walk', x: -130, face: -1, mood: 'sad', move: 3 }, { l: 1, d: 3.4, face: 1, x: 40, move: 3.4 }, { l: 2, pose: 'think', item: null, mood: 'cry', x: 0 }] },
    ],
    /* Two roads of light, both straight. */
    mid(s) { s.layer(1, () => { const k = s.on(1, 4, 1.2) * (1 - s.on(2, 2)); thread(s.ctx, [[0, 40], [-160, -80], [-330, -230], [-480, -340]], k, s.time, 2.6, k); thread(s.ctx, [[0, 40], [160, -80], [330, -230], [480, -340]], k, s.time, 2.6, k); }); },
    sound: { water: 0.8, wind: 0.5, drone: 0.8 },
    sfx: [[2, 'bell', 2]],
  },
  'et-star': {
    light: { ambient: '#101c4c', shade: 0.38, rim: '#cfe0ff', x: 1 },
    cam: [-40, 30, 1.5],
    moves: [{ l: 1, move: 6, x: 40, y: -60, z: 1.4 }, { l: 2, move: 9, x: 0, y: -240, z: 1 }],
    back(s) {
      riverNight(s);
      parapet(s);
      s.layer(0.1, () => { const k = s.on(2, 4, 2); glow(s.ctx, 40, -340, 26 + k * 90, '#e8f0ff', 0.7); ellipse(s.ctx, 40, -340, 3 + k * 2, 3 + k * 2, '#ffffff'); });
    },
    actors: [
      { who: 'javertBare', voice: 'jav', x: -110, face: 1, pose: 'read', item: 'letter', mood: 'calm', keys: [{ l: 1, pose: 'walk', x: 10, item: 'hat', move: 3 }, { l: 1, d: 3.6, pose: 'offer', mood: 'closed' }, { l: 1, d: 6, pose: 'stand', item: null, y: 130, move: 1.4 }, { l: 2, d: -0.2, alpha: 0, move: 1.2 }] },
    ],
    /* The hat stays on the stone; only rings are left on the water. */
    mid(s) {
      s.layer(1, () => {
        if (s.since(1) > 6) drawItem(s.ctx, 'hat', [112, 124], { t: s.time, ambient: '#101c4c', shade: 0.3 });
        const k = s.since(2) - 1;
        if (k > 0 && k < 6) for (let i = 0; i < 4; i++) { const r = Math.max(0, k - i * 0.6) * 90; if (r > 0) { s.ctx.beginPath(); s.ctx.ellipse(40, GROUND + 80, r, r * 0.2, 0, 0, Math.PI * 2); s.ctx.strokeStyle = rgba('#b8d0ff', Math.max(0, 0.6 - r / 500)); s.ctx.lineWidth = 3; s.ctx.stroke(); } }
      });
    },
    sound: { water: 0.9, wind: 0.3, melody: 0.8, drone: 0.4 },
    sfx: [[2, 'splash', 0.8], [2, 'chime', 4]],
  },

  /* ---------------- XII. Forgiveness ---------------- */
  'pa-wake': {
    light: LIGHT.dawn,
    cam: [-30, 40, 1.7],
    moves: [{ l: 0, d: 3, move: 4, x: -60, y: 30, z: 2 }, { l: 1, move: 1.4, x: 80, y: -20, z: 1.5 }, { l: 2, move: 2, x: -20, y: 10, z: 1.25 }],
    back(s) { bishopRoom(s, { morning: true }); s.layer(1, () => bed(s.ctx, -40, 310)); },
    actors: [
      { who: 'mariusPale', voice: 'mar', x: -50, y: 178, face: 1, pose: 'lie', mood: 'closed', s: 0.88, keys: [{ l: 0, d: 4, mood: 'calm' }, { l: 1, d: 2, mood: 'joy' }, { l: 2, mood: 'tender' }] },
      { who: 'gillenormand', voice: 'gill', x: 200, face: -1, mood: 'sad', pose: 'hunch', shadow: true, keys: [{ l: 1, pose: 'raise', mood: 'joy', x: 150, move: 0.8 }, { l: 2, pose: 'embrace', x: 100, mood: 'cry', move: 1.4 }] },
      { who: 'cosette', x: 520, face: -1, mood: 'joy', pose: 'walk', shadow: true, keys: [{ l: 2, d: 0.5, x: 260, move: 2 }] },
    ],
    mid(s) { s.layer(1, () => blanket(s.ctx, -40, 310, '#a86878')); },
    front(s) { s.layer(1.2, () => motes(s.ctx, s.time, 40, '#fff0d0', 0.5, 560)); },
    sound: { birds: 0.7, melody: 0.8 },
    trans: 'light',
  },
  'pa-wedding': {
    light: LIGHT.gold,
    cam: [0, -80, 1],
    moves: [{ l: 0, move: 7, x: 0, y: -30, z: 1.35 }, { l: 1, move: 1.6, x: -40, y: -50, z: 2 }, { l: 2, move: 2, x: -170, y: -60, z: 2.1 }],
    back(s) {
      salon(s);
      s.layer(0.85, () => { chandelier(s.ctx, 0, -300, s.time); for (let i = 0; i < 8; i++) { const x = (i < 4 ? -640 + i * 105 : 330 + (i - 4) * 105); s.actor({ who: i % 2 ? 'cosette' : 'dandy', x: x + Math.sin(s.time * 1.4 + i) * 16, y: 205, s: 0.62, face: i % 2 ? -1 : 1, pose: i % 3 ? 'offer' : 'raise', mood: 'joy', marching: 0.4, seed: i * 3 }); } });
    },
    actors: [
      { who: 'cosetteBride', voice: 'cos', x: -10, face: 1, mood: 'joy', shadow: true, keys: [{ l: 1, face: -1, pose: 'offer', mood: 'tender' }, { l: 2, mood: 'sad', pose: 'stand' }] },
      { who: 'mariusGroom', x: 96, face: -1, mood: 'joy', shadow: true, keys: [{ l: 0, d: 3, pose: 'offer' }, { l: 1, pose: 'stand' }] },
      { who: 'val', voice: 'val', x: -200, face: 1, mood: 'tender', shadow: true, keys: [{ l: 2, mood: 'sad', pose: 'think' }, { l: 2, d: 3, face: -1, pose: 'hunch', x: -460, move: 3 }] },
      { who: 'gillenormand', x: 280, face: -1, mood: 'joy', pose: 'raise', item: 'bottle' },
    ],
    front(s) { s.layer(1.25, () => { petals(s.ctx, s.time, 80, '#ffd8e0', 0.95); petals(s.ctx, s.time + 11, 40, '#ffe080', 0.9); }); },
    sound: { crowd: 0.45, melody: 1 },
    sfx: [[0, 'bell', 0], [0, 'bell', 1.4], [0, 'bell', 2.8]],
    trans: 'iris',
  },
  'pa-confess': {
    light: LIGHT.cold,
    cam: [0, -40, 1.45],
    moves: [{ l: 0, move: 2, x: -60, y: -65, z: 2.1 }, { l: 1, move: 1.4, x: 90, y: -65, z: 2.3 }, { l: 2, move: 2, x: -60, y: -60, z: 2.5 }, { l: 3, move: 6, x: 20, y: -20, z: 1.1 }],
    back(s) { const c = s.ctx; s.layer(0.55, () => { room(c, '#6c6c80', '#40302c', 190); windowFrame(c, 0, -160, 170, 270, '#b8c4d8', '#e8e0d8', '#34282c', true); }); s.layer(0.8, () => godray(c, 0, -295, 160, 460, 640, 0, '#e8f0ff', 0.12)); s.layer(1, () => ground(c, GROUND - 4, '#483434', '#0c080a')); },
    actors: [
      { who: 'val', voice: 'val', x: -100, face: 1, mood: 'sad', shadow: true, keys: [{ l: 2, mood: 'tender' }, { l: 3, d: 1, face: -1, pose: 'hunch', x: -380, move: 5 }] },
      { who: 'mariusGroom', voice: 'mar', x: 120, face: -1, mood: 'calm', shadow: true, keys: [{ l: 1, pose: 'cower', mood: 'fear', x: 150, move: 0.8 }, { l: 2, pose: 'stand' }, { l: 3, face: 1, pose: 'think', mood: 'sad' }] },
    ],
    sound: { drone: 0.5, melody: 0.6 },
    sfx: [[3, 'door', 5]],
    trans: 'black',
  },
  'pa-alone': {
    light: { ambient: '#161634', shade: 0.34, rim: '#ffc070', x: 1 },
    cam: [-60, -20, 1.1],
    moves: [{ l: 1, d: -1, move: 8, x: -20, y: 0, z: 1.8 }],
    back(s) {
      const c = s.ctx;
      if (s.since(1) < -0.5) {
        nightSky(s, '#10143c', '#3c3470', '#a86870');
        s.layer(0.3, () => paris(c, 100, '#241c4c', '#ffc470', 91, 0.8));
        s.layer(1, () => { ground(c, GROUND - 6, '#2c2448', '#06040e'); house(c, 360, GROUND - 4, 320, 520, { wall: '#5a4468', roof: '#1c1430', lit: 0.8, light: '#ffd080', seed: 93, door: true }); lamp(c, -250, GROUND + 4, 240, s.time); });
      } else {
        bareRoom(s, 0.35);
        s.layer(1, () => { chair(c, -90, 1); table(c, 90, GROUND - 90, 210, '#2c1a10'); candlestick(c, 40, GROUND - 94, 110, s.time, 1); candlestick(c, 140, GROUND - 94, 110, s.time, 2); c.fillStyle = '#18141c'; c.fill(blobPath([[70, GROUND - 96], [110, GROUND - 108], [128, GROUND - 92], [112, GROUND - 78], [118, GROUND - 40], [66, GROUND - 44], [82, GROUND - 78]])); });
      }
    },
    actors: [
      { who: 'valOld', x: -460, face: 1, pose: 'walk', mood: 'sad', item: 'cane', shadow: true, keys: [{ l: 0, x: 0, move: 5 }, { l: 0, d: 5, pose: 'hunch', mood: 'cry' }, { l: 0, d: 6.4, face: -1, pose: 'walk', x: -250, move: 3 }, { l: 1, d: -0.6, x: -92, y: 232, face: 1, pose: 'sit', item: null, move: 0.1 }, { l: 1, d: 4, mood: 'tender', pose: 'read' }] },
    ],
    sound: { wind: 0.4, melody: 0.7, drone: 0.4 },
  },
  'pa-truth': {
    light: LIGHT.gold,
    cam: [0, -30, 1.3],
    moves: [{ l: 0, move: 2, x: -60, y: -50, z: 1.85 }, { l: 1, move: 1.4, x: 90, y: -40, z: 2.2 }, { l: 2, move: 1.2, x: 0, y: -30, z: 1.1 }],
    back(s) { salon(s); },
    actors: [
      { who: 'thenardier', voice: 'then', x: -120, face: 1, mood: 'smirk', pose: 'offer', item: 'cloth', shadow: true, keys: [{ l: 1, item: null, pose: 'stand', mood: 'fear' }, { l: 2, x: -520, face: -1, pose: 'run', move: 2 }] },
      { who: 'mariusGroom', voice: 'mar', x: 110, face: -1, mood: 'angry', shadow: true, keys: [{ l: 1, pose: 'read', item: 'cloth', mood: 'fear' }, { l: 2, face: 1, pose: 'raise', item: null, x: 160 }] },
      { who: 'cosette', x: 560, face: -1, mood: 'fear', pose: 'walk', shadow: true, keys: [{ l: 2, d: 0.4, x: 300, pose: 'run', move: 1.4 }] },
    ],
    sound: { drone: 0.5, crowd: 0.1 },
    sfx: [[1, 'chime', 0.4], [2, 'door', 0.2]],
    trans: 'wipe',
  },
  'pa-return': {
    light: LIGHT.candle,
    cam: [0, -10, 1.15],
    moves: [{ l: 0, move: 3, x: -80, y: 40, z: 2 }, { l: 1, move: 1.6, x: 50, y: -10, z: 1.8 }, { l: 2, move: 2, x: -60, y: 40, z: 2.2 }, { l: 3, move: 8, x: -30, y: 20, z: 1.4 }],
    back(s) { bareRoom(s, 0.5 + s.on(2, 3, 2.5) * 0.45); s.layer(1, () => { bed(s.ctx, -60, 340, '#d8d2c8'); table(s.ctx, 270, GROUND - 100, 110, '#2c1a10'); const lit = s.since(2) > 2.6; candlestick(s.ctx, 245, GROUND - 104, 112, s.time, 1, lit); candlestick(s.ctx, 300, GROUND - 104, 112, s.time, 2, lit); }); },
    actors: [
      { who: 'valOld', voice: 'val', x: -70, y: 178, face: 1, pose: 'lie', mood: 'closed', s: 0.92, keys: [{ l: 0, mood: 'joy' }, { l: 2, mood: 'tender' }] },
      { who: 'cosette', voice: 'cos', x: 520, face: -1, mood: 'fear', pose: 'run', shadow: true, keys: [{ l: 0, x: 110, move: 2.2 }, { l: 0, d: 2.4, pose: 'kneel', x: 50, mood: 'cry' }, { l: 1, mood: 'tender', pose: 'embrace' }, { l: 2, d: 0.5, pose: 'stand', x: 170, face: 1, move: 1 }, { l: 3, pose: 'kneel', face: -1, x: 80, mood: 'cry', move: 1.4 }] },
      { who: 'mariusGroom', x: 620, face: -1, mood: 'sad', pose: 'walk', shadow: true, keys: [{ l: 1, x: 370, move: 2.4 }, { l: 1, d: 2.6, pose: 'hunch' }] },
    ],
    mid(s) { s.layer(1, () => blanket(s.ctx, -60, 340, '#6a6478')); },
    sound: { fire: 0.3, melody: 1 },
    sfx: [[2, 'chime', 2.6]],
  },
  'pa-last': {
    light: LIGHT.gold,
    cam: [-40, 20, 1.6],
    moves: [{ l: 0, move: 4, x: -130, y: 60, z: 2.7 }, { l: 1, move: 2, x: 0, y: 40, z: 2 }, { l: 2, move: 4, x: -110, y: 60, z: 2.8 }, { l: 3, move: 10, x: -20, y: -170, z: 1 }],
    back(s) {
      const c = s.ctx;
      const rise = s.on(3, 8, 1);
      bareRoom(s, 0.95 - rise * 0.5);
      /* The angel in the dark: only two great wings of light. */
      if (rise > 0) s.layer(0.75, () => { c.save(); c.globalAlpha = rise * 0.8; for (const d of [-1, 1]) for (let i = 0; i < 9; i++) thread(c, [[-100, 20 - rise * 120], [-100 + d * (70 + i * 14), -110 - i * 20 - rise * 120], [-100 + d * (170 + i * 26), -140 - i * 6 - rise * 120 + i * i * 4]], rise * 1.3 - i * 0.05, s.time + i, 1.6, 0.6); c.restore(); glow(c, -100, -110 - rise * 120, 360, '#fff0c8', rise * 0.55); });
      s.layer(1, () => { bed(c, -60, 340, '#e8e0d0'); table(c, 270, GROUND - 100, 110, '#2c1a10'); candlestick(c, 245, GROUND - 104, 112, s.time, 1); candlestick(c, 300, GROUND - 104, 112, s.time, 2); });
    },
    actors: [
      { who: 'valOld', voice: 'val', x: -70, y: 178, face: 1, pose: 'lie', mood: 'tender', s: 0.92, keys: [{ l: 2, mood: 'joy' }, { l: 2, d: 5.2, mood: 'closed' }] },
      { who: 'cosette', voice: 'cos', x: 70, face: -1, pose: 'kneel', mood: 'cry', shadow: true, keys: [{ l: 3, pose: 'bow', mood: 'closed', x: 30, move: 2 }] },
      { who: 'mariusGroom', x: 190, face: -1, pose: 'kneel', mood: 'cry', y: 220, s: 0.94 },
    ],
    mid(s) { s.layer(1, () => { blanket(s.ctx, -60, 340, '#8a7888'); thread(s.ctx, [[-90, 130], [-10, 100], [40, 130], [90, 40], [30, -80], [-80, -140], [-40, -300], [40, -520]], s.on(2, 12, 3), s.time, 3); }); },
    front(s) { s.layer(1.2, () => motes(s.ctx, s.time, 60, '#fff0c8', 0.3 + s.on(3, 5) * 0.6, 620)); },
    sound: { melody: 1, fire: 0.2 },
    sfx: [[3, 'chime', 0.5], [3, 'chime', 5]],
  },

  /* ---------------- Epilogue ---------------- */
  'ep-grave': {
    light: LIGHT.cold,
    cam: [0, -80, 1],
    moves: [{ l: 0, move: 7, x: 0, y: 30, z: 1.55 }, { l: 1, move: 5, x: 0, y: -20, z: 2 }],
    back: cemetery,
    front(s) { s.layer(1.25, () => { rain(s.ctx, s.time, 180, s.on(1, 2) * 0.4 * (1 - s.on(1, 3, 5))); petals(s.ctx, s.time, 18, '#ffffff', 0.6); }); },
    sound: { birds: 0.4, wind: 0.4, melody: 0.8, rain: 0.2 },
    trans: 'light',
  },
  'ep-dawn': {
    light: LIGHT.dawn,
    cam: [0, 30, 1.45],
    moves: [{ l: 0, move: 12, x: 0, y: -130, z: 1 }, { l: 1, move: 10, x: 0, y: -60, z: 1.2 }],
    back(s) {
      const c = s.ctx;
      duskSky(s, '#3c4890', '#e08c98', '#ffe0a0');
      s.layer(0.06, () => { stars(c, s.time, 80, Math.max(0, 0.8 - s.t * 0.08), -280); sun(c, 0, 40, 90, '#ffeab0', '#ff9c60'); clouds(c, s.time, -270, '#d87890', 0.45, 7, 8, 95); birds(c, s.time, -210, 12, '#4c2c50', 12); });
      s.layer(0.3, () => paris(c, 110, '#8c5478', '#ffe8a8', 97, 0.7, true));
      s.layer(0.55, () => paris(c, 200, '#4c2c54', '#ffd080', 99, 1));
      s.layer(1, () => { ground(c, GROUND - 6, '#3c2040', '#0c0610'); candlestick(c, -230, GROUND + 4, 200, s.time, 1); candlestick(c, 230, GROUND + 4, 200, s.time, 2); });
    },
    actors: [
      { who: 'cosette', x: -64, face: 1, mood: 'tender', shadow: true, keys: [{ l: 1, face: 1, mood: 'joy', pose: 'offer' }] },
      { who: 'mariusGroom', x: -150, face: 1, mood: 'tender', shadow: true },
      { who: 'littleT', x: 40, face: 1, mood: 'joy', pose: 'walk', shadow: true, keys: [{ l: 0, d: 2, x: 90, move: 4 }, { l: 1, pose: 'reach' }] },
    ],
    mid(s) { s.layer(1, () => thread(s.ctx, [[-230, -40], [-150, 20], [-30, 40], [90, 60], [190, -30], [120, -180], [-60, -230], [-30, -380], [60, -290], [10, -120], [0, 90]], s.on(0, 14), s.time, 3.4)); },
    front(s) { s.layer(1.3, () => { motes(s.ctx, s.time, 60, '#fff0c0', 0.6, 700); const k = s.since(1) - 5; if (k > 0) rect(s.ctx, X0, -1300, X1 - X0, 2600, rgba('#08050a', Math.min(1, k / 5))); }); },
    sound: { birds: 0.8, melody: 1, wind: 0.2 },
    sfx: [[1, 'chime', 0.6]],
    trans: 'light',
  },
};

function parapet(s: S): void {
  const c = s.ctx;
  s.layer(1, () => {
    ground(c, GROUND - 6, '#18204c', '#02030c');
    for (let x = -900; x < 900; x += 150) rect(c, x, 150, 146, GROUND - 150, linear(c, 0, 150, 0, GROUND, [[0, '#2c3868'], [1, '#101638']]));
    rect(c, -900, 134, 1800, 20, '#4a588c');
    lamp(c, -330, 140, 220, s.time);
  });
}

function cobblesBlue(s: S): void {
  for (let r = 0; r < 6; r++) for (let x = -960 + (r % 2) * 30; x < 960; x += 52 + r * 8) ellipse(s.ctx, x, GROUND + 14 + r * r * 4 + r * 14, 22 + r * 4, 6 + r, rgba('#6a78b8', 0.22));
}

