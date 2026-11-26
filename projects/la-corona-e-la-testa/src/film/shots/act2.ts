/* V. Via Aemilia, VI. Ad Flumen, VII. Miraculum, VIII. Civitas, Epilogue. */
import { GROUND, X0, X1, ground, thread, godray } from '../draw/scenery';
import { blobPath, ellipse, glow, hash, line, linear, rect, rgba, soft, ramp, ease, lerp } from '../draw/core';
import { drawItem } from '../draw/puppet';
import { fog, motes, petals } from '../draw/weather';
import { LIGHT, cathedral, farmRoom, medievalTown, modernPiazza, niche, plain, poplar, scaffold, stirone, streetLamp, workshop } from './sets';
import type { S, Shots } from './types';

/** The red cloak Valerius laid over his friend. */
function cloak(s: S, x: number, alpha: number): void {
  if (alpha <= 0) return;
  const c = s.ctx;
  c.save();
  c.globalAlpha *= alpha;
  c.fillStyle = linear(c, x - 150, 0, x + 150, 0, [[0, '#4a0c0c'], [0.5, '#a01e1c'], [1, '#5a1010']]);
  c.fill(blobPath([[x - 170, GROUND + 4], [x - 140, GROUND - 40], [x - 20, GROUND - 56], [x + 120, GROUND - 46], [x + 170, GROUND + 4]]));
  for (let i = 0; i < 4; i++) line(c, [[x - 120 + i * 70, GROUND - 40], [x - 110 + i * 74, GROUND]], 'rgba(40,0,0,0.4)', 3);
  c.restore();
}

/** A pillar of light where the miracle happens. */
function pillar(s: S, x: number, k: number): void {
  if (k <= 0) return;
  godray(s.ctx, x, -900, 90 * k, 260 * k, 1150, 0, '#fff4d0', 0.35 * k);
  glow(s.ctx, x, GROUND - 120, 520 * k, '#fff0c0', 0.55 * k);
}

/** The head of the saint resting on the ground, still shining. */
function restingHead(s: S, x: number, alpha: number): void {
  if (alpha <= 0) return;
  s.ctx.save();
  s.ctx.globalAlpha *= alpha;
  drawItem(s.ctx, 'head', [x, GROUND + 4], { t: s.time, ambient: '#6a5a6a', shade: 0.06 });
  s.ctx.restore();
}

export const ACT2: Shots = {
  /* ---------------- V. Via Aemilia ---------------- */
  'ae-plain': {
    light: LIGHT.day,
    cam: [0, -80, 1],
    moves: [{ l: 0, move: 14, x: 0, y: -20, z: 1.5 }],
    back(s) { plain(s, {}); },
    actors: [{ who: 'donTravel', x: 0, y: 330, s: 0.5, face: 1, pose: 'walk', item: 'staff', marching: 1, keys: [{ l: 0, move: 14, y: 250, s: 0.9 }] }],
    front(s) { s.layer(1.3, () => { for (let i = 0; i < 3; i++) poplar(s.ctx, -560 + i * 560 + (i === 1 ? 960 : 0), GROUND + 260, 700, '#2c3a20', s.time, i + 90); }); },
    sound: { birds: 0.9, wind: 0.3, melody: 0.9 },
    trans: 'light',
  },
  'ae-farm': {
    light: LIGHT.day,
    cam: [80, -40, 1.1],
    moves: [{ l: 0, move: 3, x: -20, y: -40, z: 1.6 }, { l: 1, move: 1.6, x: -110, y: -50, z: 2 }, { l: 2, move: 2, x: 90, y: -50, z: 2.1 }, { l: 3, move: 2, x: -60, y: -40, z: 1.9 }],
    back(s) { plain(s, { farm: true, road: false }); },
    actors: [
      { who: 'farmer', voice: 'farm', x: 520, face: -1, pose: 'run', mood: 'fear', shadow: true, keys: [{ l: 0, x: 60, move: 2.2 }, { l: 0, d: 2.4, pose: 'offer' }, { l: 2, pose: 'pray', mood: 'cry' }, { l: 3, mood: 'sad', pose: 'stand' }] },
      { who: 'donTravel', voice: 'don', x: -160, face: 1, item: 'staff', mood: 'calm', shadow: true, keys: [{ l: 1, mood: 'tender' }, { l: 3, pose: 'offer', mood: 'calm' }] },
    ],
    sound: { birds: 0.6, wind: 0.3 },
  },
  'ae-prayer': {
    light: LIGHT.prison,
    cam: [-60, 20, 1.3],
    moves: [{ l: 0, move: 9, x: -110, y: 20, z: 2.1 }, { l: 1, move: 7, x: 40, y: -10, z: 1.3 }],
    back(s) { farmRoom(s, 0); },
    actors: [
      { who: 'lucius', x: -200, y: 150, face: 1, pose: 'lie', mood: 'closed', s: 0.85 },
      { who: 'donTravel', voice: 'don', x: 40, face: -1, pose: 'kneel', mood: 'closed', keys: [{ l: 0, pose: 'pray' }] },
      { who: 'farmer', x: 250, y: 232, face: -1, pose: 'sit', mood: 'sad', keys: [{ l: 1, mood: 'closed' }] },
    ],
    mid(s) { s.layer(1, () => { drawItem(s.ctx, 'oillamp', [130, GROUND - 4], { t: s.time, ambient: '#0c1430', shade: 0.2 }); thread(s.ctx, [[20, -20], [-60, -120], [-140, -60], [-200, 80]], s.on(0, 9, 2), s.time, 2.4); }); },
    front(s) { s.layer(1.2, () => motes(s.ctx, s.time, 26, '#c8d8ff', 0.4, 480)); },
    sound: { wind: 0.3, melody: 1 },
    sfx: [[0, 'choir', 1.5]],
    trans: 'black',
  },
  'ae-dawn': {
    light: LIGHT.dawn,
    cam: [-150, 10, 1.9],
    moves: [{ l: 0, d: 1, move: 2, x: -150, y: 20, z: 2.3 }, { l: 1, move: 2, x: -60, y: -10, z: 1.6 }, { l: 2, move: 2, x: 80, y: -40, z: 2 }],
    back(s) { farmRoom(s, 1); },
    actors: [
      { who: 'lucius', voice: 'boy', x: -200, y: 150, face: 1, pose: 'lie', mood: 'closed', s: 0.85, keys: [{ l: 0, mood: 'calm' }, { l: 1, pose: 'sit', y: 160, item: 'bowl', mood: 'joy', move: 1.2 }] },
      { who: 'farmer', voice: 'farm', x: 220, face: -1, pose: 'sit', mood: 'closed', y: 232, keys: [{ l: 0, d: 1, pose: 'stand', mood: 'fear', move: 0.6 }, { l: 1, pose: 'raise', mood: 'joy', x: -40, move: 1.4 }, { l: 2, pose: 'embrace', mood: 'cry', x: -80 }] },
      { who: 'donTravel', voice: 'don', x: 70, face: -1, pose: 'kneel', mood: 'closed', keys: [{ l: 1, mood: 'joy', pose: 'stand', x: 160, move: 1 }, { l: 2, face: -1, mood: 'tender' }] },
    ],
    front(s) { s.layer(1.2, () => motes(s.ctx, s.time, 50, '#ffe0b0', 0.6, 560)); },
    sound: { birds: 0.7, melody: 1 },
    sfx: [[0, 'chime', 0.4]],
    trans: 'light',
  },
  'ae-riders': {
    light: LIGHT.day,
    cam: [-100, -60, 1.05],
    moves: [{ l: 0, move: 8, x: 60, y: -60, z: 1.2 }, { l: 1, move: 1.6, x: 140, y: -170, z: 2 }, { l: 2, move: 1.6, x: -20, y: -190, z: 2.2 }, { l: 3, move: 2, x: 0, y: -170, z: 2.5 }],
    back(s) { plain(s, { road: true }); },
    actors: [
      { who: 'legionary', voice: 'sol', x: -560, face: 1, horse: '#5a3a24', pose: 'sit', s: 0.86, keys: [{ l: 0, x: 210, move: 8 }, { l: 1, pose: 'point' }, { l: 2, pose: 'sit' }] },
      { who: 'valerius', voice: 'val', x: -760, face: 1, horse: '#e8e0d4', pose: 'sit', mood: 'calm', s: 0.9, keys: [{ l: 0, x: 20, move: 8 }, { l: 2, mood: 'sad' }, { l: 3, pose: 'point', mood: 'angry' }] },
      { who: 'legionary', x: -960, face: 1, horse: '#2a1a14', pose: 'sit', item: 'standard', s: 0.84, seed: 7, keys: [{ l: 0, x: -170, move: 8 }] },
    ],
    front(s) { s.layer(1.3, () => { for (let i = 0; i < 14; i++) { const k = (s.time * 0.3 + i / 14) % 1; soft(s.ctx, -200 + i * 30 - k * 200, GROUND + 20 - k * 60, 30 + k * 60, 20 + k * 30, '#d8c8a0', 0.25 * (1 - k) * (1 - s.on(0, 3, 7))); } }); },
    sound: { wind: 0.4, drone: 0.6 },
    sfx: [[0, 'gallop', 0], [0, 'gallop', 3], [0, 'gallop', 6]],
    trans: 'wipe',
  },
  'ae-farewell': {
    light: LIGHT.day,
    cam: [0, -20, 1.5],
    moves: [{ l: 0, move: 1.6, x: -90, y: 30, z: 2.3 }, { l: 1, move: 2, x: 40, y: -40, z: 2 }, { l: 2, move: 1.6, x: 140, y: -50, z: 2 }, { l: 3, move: 6, x: 0, y: -40, z: 1.1 }],
    back(s) { plain(s, { farm: true, road: false }); },
    actors: [
      { who: 'lucius', voice: 'boy', x: -70, face: 1, mood: 'sad', shadow: true, keys: [{ l: 1, mood: 'tender' }, { l: 3, pose: 'raise', mood: 'joy', d: 2 }] },
      { who: 'farmer', voice: 'farm', x: 210, face: -1, item: 'staff', mood: 'tender', shadow: true, keys: [{ l: 2, pose: 'offer' }, { l: 3, item: null, pose: 'stand' }] },
      { who: 'donTravel', voice: 'don', x: 60, face: -1, mood: 'tender', shadow: true, keys: [{ l: 1, pose: 'kneel' }, { l: 3, pose: 'stand', item: 'staff', move: 0.8 }, { l: 3, d: 2, face: 1, pose: 'walk', x: 620, move: 8 }] },
    ],
    sound: { birds: 0.7, melody: 0.9 },
  },

  /* ---------------- VI. Ad Flumen ---------------- */
  'st-bridge': {
    light: LIGHT.sunset,
    cam: [0, -60, 1],
    moves: [{ l: 0, move: 12, x: -40, y: -20, z: 1.35 }],
    back(s) { stirone(s, { time: 'sunset' }); },
    actors: [
      { who: 'donTravel', x: 80, face: 1, item: 'staff', pose: 'walk', shadow: true, keys: [{ l: 0, x: 220, move: 6 }, { l: 0, d: 6, face: -1, pose: 'stand', mood: 'calm' }] },
      { who: 'valerius', x: -900, face: 1, horse: '#e8e0d4', pose: 'sit', s: 0.9, keys: [{ l: 0, d: 4, x: -150, move: 6 }] },
      { who: 'legionary', x: -1100, face: 1, horse: '#5a3a24', pose: 'sit', s: 0.86, keys: [{ l: 0, d: 4, x: -360, move: 6 }] },
    ],
    sound: { water: 0.6, wind: 0.3, melody: 0.6 },
    sfx: [[0, 'gallop', 4]],
    trans: 'black',
  },
  'st-meet': {
    light: LIGHT.sunset,
    cam: [0, -40, 1.5],
    moves: [{ l: 0, move: 2, x: -100, y: -70, z: 2.2 }, { l: 1, move: 2, x: 100, y: -60, z: 2.2 }, { l: 2, move: 2, x: -100, y: -70, z: 2.2 }, { l: 3, move: 3, x: 60, y: -60, z: 2.4 }],
    back(s) { stirone(s, { time: 'sunset' }); },
    actors: [
      { who: 'valerius', voice: 'val', x: -110, face: 1, mood: 'sad', shadow: true, keys: [{ l: 2, pose: 'offer', mood: 'tender' }, { l: 3, pose: 'stand', mood: 'sad' }] },
      { who: 'donTravel', voice: 'don', x: 110, face: -1, item: 'staff', mood: 'tender', shadow: true, keys: [{ l: 3, mood: 'calm' }] },
    ],
    sound: { water: 0.5, melody: 0.8 },
  },
  'st-plead': {
    light: LIGHT.sunset,
    cam: [0, -60, 2.1],
    moves: [{ l: 0, move: 2, x: -90, y: -80, z: 2.5 }, { l: 1, move: 2, x: -80, y: -80, z: 2.8 }, { l: 2, move: 2, x: 90, y: -80, z: 2.6 }, { l: 3, move: 4, x: 0, y: -60, z: 2 }],
    back(s) { stirone(s, { time: 'sunset' }); },
    actors: [
      { who: 'valeriusBare', voice: 'val', x: -100, face: 1, item: 'helmet', pose: 'hold', mood: 'sad', shadow: true, keys: [{ l: 1, mood: 'cry', pose: 'pray', item: null }, { l: 3, mood: 'cry', pose: 'hunch' }] },
      { who: 'donTravel', voice: 'don', x: 100, face: -1, mood: 'tender', shadow: true, keys: [{ l: 2, pose: 'embrace', x: 40, move: 1.6 }, { l: 3, pose: 'point', x: 100, mood: 'calm' }] },
    ],
    sound: { water: 0.5, melody: 1 },
  },
  'st-kneel': {
    light: LIGHT.sunset,
    cam: [0, -40, 1.6],
    moves: [{ l: 0, move: 4, x: 60, y: -30, z: 1.9 }, { l: 1, move: 3, x: 80, y: -60, z: 2.4 }, { l: 2, move: 9, x: 130, y: -260, z: 1 }],
    back(s) { stirone(s, { time: 'sunset' }); },
    actors: [
      { who: 'donTravel', voice: 'don', x: 80, face: 1, mood: 'calm', shadow: true, keys: [{ l: 0, pose: 'kneel', move: 1.4 }, { l: 1, pose: 'pray', mood: 'closed' }] },
      { who: 'valeriusBare', x: -150, face: 1, mood: 'cry', shadow: true, keys: [{ l: 2, face: -1, pose: 'hunch', move: 1 }] },
    ],
    front(s) { s.layer(1.2, () => { const k = s.on(2, 6, 3); if (k > 0) rect(s.ctx, X0, -1300, X1 - X0, 2600, rgba('#1a0408', k * 0.85)); }); },
    sound: { water: 0.6, melody: 0.8 },
    sfx: [[2, 'sword', 3.5], [2, 'bell', 5]],
  },

  /* ---------------- VII. Miraculum ---------------- */
  'mi-night': {
    light: LIGHT.night,
    cam: [0, -80, 1.05],
    moves: [{ l: 0, move: 12, x: -40, y: -40, z: 1.5 }],
    back(s) { stirone(s, { time: 'night' }); s.layer(1, () => cloak(s, 60, 1)); },
    actors: [
      { who: 'valeriusBare', x: -150, y: 232, face: 1, pose: 'sit', mood: 'cry' },
      { who: 'legionary', x: -340, face: -1, horse: '#5a3a24', pose: 'sit', s: 0.82, keys: [{ l: 0, x: -900, move: 7 }] },
    ],
    front(s) { s.layer(1.3, () => fog(s.ctx, s.time, 290, '#4a5aa0', 0.18, 7, 8)); },
    sound: { water: 0.5, wind: 0.3, melody: 0.6 },
    trans: 'black',
  },
  'mi-rise': {
    light: LIGHT.holy,
    cam: [40, -40, 1.6],
    moves: [{ l: 0, move: 8, x: 60, y: -80, z: 1.4 }, { l: 1, move: 8, x: 60, y: -110, z: 1.9 }],
    back(s) {
      stirone(s, { time: 'dawn' });
      const rise = s.on(0, 4, 3);
      s.layer(1, () => { cloak(s, 60, 1 - rise); pillar(s, 60, Math.min(1, s.on(0, 3, 1.5) * 1.3)); });
    },
    actors: [
      { who: 'donSaint', x: 60, face: 1, pose: 'kneel', mood: 'closed', headless: true, alpha: 0, keys: [{ l: 0, d: 4, alpha: 1, move: 2.5 }, { l: 0, d: 7, pose: 'stand', move: 2 }, { l: 1, d: 1.5, pose: 'offer', item: 'head', move: 1.2 }] },
      { who: 'valeriusBare', x: -230, y: 232, face: 1, pose: 'sit', mood: 'closed', keys: [{ l: 0, d: 5, mood: 'fear', pose: 'cower' }] },
    ],
    mid(s) { const pick = s.since(1) - 1.5; s.layer(1, () => restingHead(s, 70, pick < 0 ? s.on(0, 2, 6) : 0)); },
    front(s) { s.layer(1.2, () => motes(s.ctx, s.time, 70, '#fff4d0', 0.8, 620)); },
    sound: { water: 0.3, melody: 1 },
    sfx: [[0, 'choir', 2.5], [1, 'chime', 1.5]],
    trans: 'light',
  },
  'mi-widow': {
    light: LIGHT.holy,
    cam: [0, -60, 1.5],
    moves: [{ l: 0, move: 2, x: -110, y: -70, z: 2.2 }, { l: 1, move: 2, x: 100, y: -100, z: 2.1 }, { l: 2, move: 1.6, x: -110, y: -70, z: 2.3 }, { l: 3, move: 3, x: 80, y: -100, z: 2 }],
    back(s) { stirone(s, { time: 'dawn', bridge: false }); s.layer(1, () => pillar(s, 120, 0.6)); },
    actors: [
      { who: 'widow', voice: 'wid', x: -120, face: 1, pose: 'cower', item: 'jug', mood: 'fear', shadow: true, keys: [{ l: 1, pose: 'stand', mood: 'calm' }, { l: 2, mood: 'tender' }, { l: 3, pose: 'pray', mood: 'cry' }] },
      { who: 'donSaint', voice: 'don', x: 120, face: -1, pose: 'offer', item: 'head', headless: true, mood: 'tender' },
    ],
    front(s) { s.layer(1.2, () => motes(s.ctx, s.time, 50, '#fff4d0', 0.7, 600)); },
    sound: { water: 0.4, melody: 1 },
  },
  'mi-cross': {
    light: LIGHT.holy,
    cam: [-200, -60, 1.2],
    moves: [{ l: 0, move: 14, x: 230, y: -60, z: 1.3 }],
    back(s) {
      stirone(s, { time: 'dawn', bridge: false });
      s.layer(1, () => { for (let i = 0; i < 9; i++) { const k = (s.time * 0.4 + i / 9) % 1; ellipse(s.ctx, lerp(-300, 400, ease(ramp(s.since(0), 0, 10))), GROUND + 10, 30 + k * 120, 6 + k * 20, rgba('#fff4d0', 0.35 * (1 - k))); } restingHead(s, 470, s.on(0, 1.5, 12.5)); pillar(s, 450, s.on(0, 3, 12)); });
    },
    actors: [{ who: 'donSaint', x: -300, face: 1, pose: 'offer', item: 'head', headless: true, mood: 'calm', keys: [{ l: 0, x: 400, move: 10 }, { l: 0, d: 10.5, pose: 'kneel', move: 1.2 }, { l: 0, d: 12.5, item: null, pose: 'pray' }, { l: 0, d: 14, alpha: 0, move: 3 }] }],
    front(s) { s.layer(1.2, () => motes(s.ctx, s.time, 70, '#fff4d0', 0.8, 700)); },
    sound: { water: 0.7, melody: 1 },
    sfx: [[0, 'choir', 11], [0, 'bell', 13]],
  },
  'mi-valerius': {
    light: LIGHT.dawn,
    cam: [0, -20, 1.7],
    moves: [{ l: 0, move: 5, x: -40, y: -10, z: 2.2 }, { l: 1, move: 9, x: 0, y: -60, z: 1.1 }],
    back(s) { stirone(s, { time: 'dawn', bridge: false }); s.layer(1, () => { pillar(s, 60, 0.4); restingHead(s, 60, 1); }); },
    actors: [
      { who: 'valeriusBare', voice: 'val', x: -90, face: 1, pose: 'kneel', mood: 'cry', shadow: true, keys: [{ l: 1, pose: 'pray', mood: 'closed' }] },
      { who: 'widow', x: 240, face: -1, pose: 'pray', mood: 'tender', shadow: true },
    ],
    mid(s) { s.layer(1, () => thread(s.ctx, [[60, 200], [10, 80], [80, -60], [20, -220], [60, -420]], s.on(1, 8), s.time, 3)); },
    sound: { water: 0.3, birds: 0.5, melody: 1 },
    trans: 'black',
  },

  /* ---------------- VIII. Civitas ---------------- */
  'ci-town': {
    light: LIGHT.day,
    cam: [0, -120, 1],
    moves: [{ l: 0, move: 10, x: 0, y: -80, z: 1.2 }, { l: 1, move: 9, x: 100, y: -40, z: 1.4 }],
    back(s) {
      medievalTown(s);
      s.layer(0.7, () => { cathedral(s, 0, 214, 1, { built: 0.62 }); scaffold(s.ctx, 0, 214, 400, 420); });
      s.layer(1, () => ground(s.ctx, GROUND - 4, '#b8a078', '#4a3a24'));
    },
    actors: [
      { who: 'pilgrimMan', x: -600, face: 1, pose: 'walk', item: 'staff', shadow: true, keys: [{ l: 0, move: 18, x: 300 }] },
      { who: 'pilgrim', x: -720, face: 1, pose: 'walk', shadow: true, keys: [{ l: 0, move: 18, x: 160 }] },
      { who: 'pilgrimBoy', x: -800, face: 1, pose: 'walk', shadow: true, keys: [{ l: 0, move: 18, x: 60 }] },
      { who: 'apprentice', x: 380, face: -1, pose: 'carry', mood: 'calm', shadow: true },
    ],
    sound: { birds: 0.7, crowd: 0.3, melody: 0.6 },
    sfx: [[0, 'bell', 1], [1, 'chisel', 0.5], [1, 'chisel', 2]],
    trans: 'light',
  },
  'ci-workshop': {
    light: LIGHT.stone,
    cam: [0, -40, 1.2],
    moves: [{ l: 0, move: 8, x: 60, y: -60, z: 1.5 }, { l: 1, move: 1.6, x: 150, y: -50, z: 2 }, { l: 2, move: 1.6, x: -60, y: -60, z: 2.1 }, { l: 3, move: 1.6, x: 150, y: -50, z: 2 }, { l: 4, move: 3, x: -20, y: -80, z: 1.7 }],
    back: workshop,
    actors: [
      { who: 'statue', x: 0, face: 1, pose: 'offer', item: 'head', headless: true, stone: '#d8ccb4' },
      { who: 'master', voice: 'mast', x: -150, face: 1, pose: 'reach', item: 'chisel', mood: 'calm', keys: [{ l: 2, face: -1, pose: 'stand', mood: 'tender' }, { l: 4, face: 1, pose: 'think', mood: 'calm' }] },
      { who: 'apprentice', voice: 'app', x: 210, face: -1, mood: 'calm', shadow: true, keys: [{ l: 3, mood: 'fear' }, { l: 4, mood: 'joy' }] },
    ],
    front(s) { const k = s.since(0); if (k > 0 && k < 9) s.layer(1, () => { for (let i = 0; i < 10; i++) { const p = (s.time * 1.6 + i / 10) % 1; ellipse(s.ctx, -40 + p * 30 * Math.cos(i), -40 + p * 60 + p * p * 80, 2.4, 2.4, rgba('#f0e8d8', 0.8 * (1 - p))); } }); },
    sound: { birds: 0.3, melody: 0.6 },
    sfx: [[0, 'chisel', 1], [0, 'chisel', 2.2], [0, 'chisel', 3.4], [0, 'chisel', 4.6]],
  },
  'ci-pilgrim': {
    light: LIGHT.day,
    cam: [0, -60, 1.3],
    moves: [{ l: 0, move: 2, x: -90, y: -60, z: 1.9 }, { l: 1, move: 2, x: 100, y: -70, z: 2 }, { l: 2, move: 6, x: 0, y: -120, z: 1.1 }],
    back(s) {
      medievalTown(s);
      s.layer(0.7, () => cathedral(s, 0, 214, 1, { lit: 0.6 }));
      s.layer(0.7, () => niche(s, -262, 60, 1.2));
      s.layer(1, () => ground(s.ctx, GROUND - 4, '#b8a078', '#4a3a24'));
    },
    actors: [
      { who: 'pilgrim', voice: 'pil', x: -110, face: 1, pose: 'offer', mood: 'sad', shadow: true, keys: [{ l: 2, d: 3, face: 1, pose: 'walk', x: 20, move: 4, mood: 'tender' }] },
      { who: 'pilgrimBoy', x: -210, face: 1, mood: 'calm', shadow: true, keys: [{ l: 2, d: 3, x: -60, move: 4, pose: 'walk' }] },
      { who: 'master', voice: 'mast', x: 130, face: -1, mood: 'tender', item: 'chisel', pose: 'hold', shadow: true, keys: [{ l: 2, pose: 'point' }] },
    ],
    front(s) { s.layer(1.3, () => petals(s.ctx, s.time, 20, '#fff0d0', 0.5)); },
    sound: { birds: 0.6, crowd: 0.2, melody: 0.8 },
    sfx: [[2, 'bell', 4]],
  },

  /* ---------------- Epilogue ---------------- */
  'ep-today': {
    light: LIGHT.dusk,
    cam: [0, -80, 1],
    moves: [{ l: 0, move: 10, x: 0, y: -60, z: 1.15 }, { l: 1, move: 10, x: -240, y: -90, z: 2.2 }],
    back(s) {
      const dusk = 0.4 + s.p * 0.5;
      modernPiazza(s, dusk);
      s.layer(0.7, () => { cathedral(s, 0, 214, 1, { lit: dusk }); niche(s, -262, 60, 1.2, '#d8c8a6', s.on(1, 4) * 0.5); });
      s.layer(1, () => { ground(s.ctx, GROUND - 4, '#8a7a6a', '#1c1410'); for (const x of [-430, 430]) streetLamp(s.ctx, x, GROUND + 4, 300, dusk); });
    },
    actors: [
      { who: 'modernA', x: -620, face: 1, pose: 'walk', shadow: true, keys: [{ l: 0, move: 16, x: 520 }] },
      { who: 'modernKid', x: -700, face: 1, pose: 'walk', shadow: true, keys: [{ l: 0, move: 16, x: 420 }, { l: 1, d: 3, pose: 'point' }] },
      { who: 'modernB', x: 600, face: -1, pose: 'walk', item: 'book', shadow: true, keys: [{ l: 0, move: 16, x: -560 }] },
    ],
    sound: { birds: 0.4, crowd: 0.25, melody: 0.8 },
    sfx: [[0, 'bell', 1], [0, 'bell', 3]],
    trans: 'light',
  },
  'ep-end': {
    light: LIGHT.stone,
    cam: [-262, -170, 2.1],
    moves: [{ l: 0, move: 8, x: -262, y: -170, z: 2.3 }, { l: 1, move: 12, x: -150, y: -130, z: 1.5 }],
    back(s) {
      modernPiazza(s, 0.95);
      s.layer(0.7, () => { cathedral(s, 0, 214, 1, { lit: 1 }); niche(s, -262, 60, 1.2, '#d8c8a6', 0.4 + s.on(1, 6) * 0.5); });
    },
    front(s) { s.layer(1.2, () => { motes(s.ctx, s.time, 50, '#ffe0a0', 0.6, 600); const k = s.since(1) - 6; if (k > 0) rect(s.ctx, X0, -1300, X1 - X0, 2600, rgba('#05030a', Math.min(1, k / 5))); }); },
    sound: { melody: 1, wind: 0.2 },
    sfx: [[1, 'choir', 0.5], [1, 'bell', 4]],
  },
};

export { glow, hash, line, soft };
