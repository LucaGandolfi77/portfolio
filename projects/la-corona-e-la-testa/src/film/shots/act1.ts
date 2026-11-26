/* Prologue, I. Corona, II. Fides, III. Recusatio, IV. Via. */
import { GROUND, X0, X1, ground, thread, godray, flame } from '../draw/scenery';
import { ellipse, glow, hash, line, linear, poly, rect, rgba, soft, ramp, ease, lerp } from '../draw/core';
import { drawItem } from '../draw/puppet';
import { fog, motes, rain, splashes, smoke } from '../draw/weather';
import { LIGHT, arch, cathedral, cellar, duskSky, hall, innExterior, innInterior, medievalTown, milan, milestone, niche, plain, prison, table, treasury } from './sets';
import type { Actor, S, Shots } from './types';

const court = (who: Actor['who'], x: number, face: 1 | -1, extra: Partial<Actor> = {}): Actor => ({ who, x, face, y: 214, s: 0.9, mood: 'calm', ...extra });
const guard = (x: number, face: 1 | -1, extra: Partial<Actor> = {}): Actor => ({ who: 'guard', x, face, item: 'spear', pose: 'hold', ...extra });

/** A legion on the march, flat against the sky. */
function legion(s: S, y: number, color: string, count: number, scale: number, speed: number): void {
  for (let i = 0; i < count; i++) {
    const x = ((i * 120 + s.time * speed) % 2400) - 1200;
    s.actor({ who: 'legionary', x, y: y + (i % 2) * 6, s: scale, face: 1, pose: 'walk', marching: 1, flat: color, seed: i, item: i % 5 === 0 ? 'standard' : 'spear' });
  }
}

export const ACT1: Shots = {
  'pr-facade': {
    light: LIGHT.stone,
    cam: [-250, -140, 2.6],
    moves: [{ l: 0, d: 2, move: 9, x: -250, y: -120, z: 2.2 }, { l: 1, move: 9, x: 0, y: -60, z: 1 }],
    back(s) {
      medievalTown(s, { dusk: true });
      s.layer(0.75, () => cathedral(s, 0, 214, 1.05, { lit: 0.5 }));
      s.layer(0.75, () => niche(s, -262, 60, 1.25, '#d8c8a6', 0.25 + s.p * 0.3));
      s.layer(1, () => { ground(s.ctx, GROUND - 4, '#8a7058', '#20140c'); });
    },
    actors: [
      { who: 'pilgrimMan', x: -520, face: 1, pose: 'walk', item: 'staff', shadow: true, keys: [{ l: 0, move: 14, x: -160 }, { l: 1, d: 2, pose: 'pray' }] },
      { who: 'pilgrim', x: 520, face: -1, pose: 'walk', shadow: true, keys: [{ l: 0, move: 12, x: 170 }, { l: 1, pose: 'pray' }] },
    ],
    front(s) { s.layer(1.2, () => motes(s.ctx, s.time, 46, '#ffe0a0', 0.5, 700)); },
    sound: { birds: 0.3, wind: 0.2, melody: 0.9 },
    sfx: [[0, 'bell', 0.3], [1, 'choir', 1]],
    trans: 'black',
  },
  'pr-empire': {
    light: LIGHT.night,
    cam: [0, -60, 1.1],
    moves: [{ l: 0, move: 10, x: 0, y: -10, z: 1.25 }, { l: 1, move: 9, x: 80, y: -40, z: 1.6 }],
    back(s) {
      milan(s);
      s.layer(0.55, () => { ground(s.ctx, 196, '#141428', '#04040a'); legion(s, 200, '#0a0a16', 18, 0.5, 26); });
      s.layer(1, () => ground(s.ctx, GROUND - 4, '#1c1c30', '#04040a'));
    },
    actors: [{ who: 'legionary', x: 110, face: -1, item: 'standard', pose: 'hold', shadow: true, keys: [{ l: 1, x: 70, move: 3 }] }],
    front(s) { s.layer(1.3, () => { legion(s, 470, '#05050a', 8, 1.2, 60); fog(s.ctx, s.time, 290, '#4a4a78', 0.2, 7, 14); }); },
    sound: { drone: 0.6, wind: 0.4, crowd: 0.2 },
    sfx: [[0, 'fanfare', 0.5], [1, 'gallop', 0]],
    trans: 'iris',
  },

  /* ---------------- I. Corona ---------------- */
  'co-treasury': {
    light: LIGHT.lamp,
    cam: [0, 10, 1.5],
    moves: [{ l: 0, move: 8, x: -40, y: 20, z: 2.1 }, { l: 1, move: 1.6, x: 140, y: -40, z: 2 }, { l: 2, move: 1.6, x: -60, y: -40, z: 2.2 }, { l: 4, move: 3, x: 20, y: -10, z: 1.4 }],
    back: treasury,
    actors: [
      { who: 'donCourt', voice: 'don', x: -70, face: 1, pose: 'read', item: 'crown', mood: 'calm', keys: [{ l: 2, pose: 'hold', mood: 'tender' }, { l: 4, mood: 'sad', pose: 'think', item: null }] },
      { who: 'eutychius', voice: 'eut', x: 190, face: -1, pose: 'hold', item: 'oillamp', mood: 'tender', keys: [{ l: 3, mood: 'calm' }] },
    ],
    mid(s) { if (s.since(4) > 0) s.layer(1, () => drawItem(s.ctx, 'crown', [20, GROUND - 92], { t: s.time, ambient: '#2a140c', shade: 0.1 })); },
    front(s) { s.layer(1.2, () => motes(s.ctx, s.time, 40, '#ffd890', 0.5, 520)); },
    sound: { fire: 0.3, melody: 0.7 },
    trans: 'light',
  },
  'co-throne': {
    light: LIGHT.palace,
    cam: [0, -80, 1],
    moves: [{ l: 0, move: 7, x: 0, y: -40, z: 1.2 }, { l: 1, move: 2.2, x: 30, y: -110, z: 2 }, { l: 2, move: 1.8, x: 40, y: -120, z: 2.6 }, { l: 3, move: 1.6, x: -70, y: -100, z: 2.4 }, { l: 4, move: 4, x: 20, y: -60, z: 1.35 }],
    back(s) { hall(s); },
    actors: [
      guard(-560, 1), guard(560, -1, { seed: 4 }),
      court('courtier', -420, 1), court('lady', -310, 1, { seed: 3 }), court('courtier2', 330, -1), court('courtier', 440, -1, { seed: 7 }),
      { who: 'maximian', voice: 'max', x: 20, y: 110, face: 1, pose: 'sit', mood: 'calm', s: 0.95, keys: [{ l: 2, mood: 'smirk' }, { l: 4, mood: 'angry', pose: 'point' }] },
      { who: 'donCourt', voice: 'don', x: -420, face: 1, pose: 'walk', item: 'crown', mood: 'calm', shadow: true, keys: [{ l: 1, x: -70, y: 170, move: 3.4 }, { l: 1, d: 3.6, pose: 'offer' }, { l: 3, pose: 'bow', item: null, mood: 'tender' }, { l: 4, pose: 'stand', mood: 'fear' }] },
    ],
    sound: { fire: 0.3, crowd: 0.15, melody: 0.6 },
    sfx: [[0, 'fanfare', 1.2], [3, 'choir', 0]],
    trans: 'wipe',
  },
  'co-trial': {
    light: LIGHT.hall,
    cam: [0, -60, 1.05],
    moves: [{ l: 0, move: 2.4, x: -120, y: -30, z: 1.5 }, { l: 1, move: 2, x: 40, y: -110, z: 2.1 }, { l: 2, move: 2, x: -150, y: -60, z: 2.2 }, { l: 3, move: 1.8, x: -60, y: -60, z: 2.3 }, { l: 4, move: 3, x: 0, y: -40, z: 1.25 }],
    back(s) { hall(s, { altar: true }); },
    actors: [
      { who: 'maximian', voice: 'max', x: 20, y: 110, face: -1, pose: 'sit', mood: 'calm', s: 0.95, keys: [{ l: 1, pose: 'point', mood: 'smirk' }, { l: 4, mood: 'angry', pose: 'stand' }] },
      { who: 'guard', voice: 'guard', x: -320, face: 1, item: 'spear', pose: 'hold', keys: [{ l: 4, d: 2, x: -620, move: 3, face: -1, pose: 'walk' }] },
      { who: 'sabinus', voice: 'eld', x: -200, face: 1, pose: 'hunch', mood: 'calm', shadow: true, keys: [{ l: 2, pose: 'offer', mood: 'tender' }, { l: 4, d: 2, x: -560, move: 3, face: -1, pose: 'walk', mood: 'sad' }] },
      { who: 'marcella', voice: 'mar', x: -110, face: 1, pose: 'cower', mood: 'fear', shadow: true, keys: [{ l: 3, pose: 'pray', mood: 'cry' }, { l: 4, d: 2, x: -480, move: 3, face: -1, pose: 'walk' }] },
      { who: 'donCourt', x: 250, face: -1, mood: 'calm', shadow: true, keys: [{ l: 3, mood: 'sad' }, { l: 4, mood: 'cry' }] },
      guard(450, -1, { seed: 2 }),
    ],
    sound: { fire: 0.3, drone: 0.6 },
    sfx: [[0, 'door', 0], [0, 'chain', 0.6], [4, 'chain', 2]],
  },

  /* ---------------- II. Fides ---------------- */
  'fi-prison': {
    light: LIGHT.prison,
    cam: [-60, -20, 1.2],
    moves: [{ l: 0, move: 7, x: -40, y: -10, z: 1.35 }, { l: 1, move: 1.8, x: 120, y: -40, z: 2 }, { l: 2, move: 1.8, x: -110, y: -40, z: 2.1 }, { l: 3, move: 2, x: 100, y: -40, z: 2.2 }, { l: 4, move: 2, x: -100, y: -50, z: 2.2 }],
    back: prison,
    actors: [
      { who: 'sabinus', voice: 'eld', x: 140, y: 232, face: -1, pose: 'sit', mood: 'calm', keys: [{ l: 3, mood: 'tender' }] },
      { who: 'marcella', x: 280, y: 232, face: -1, pose: 'sit', mood: 'sad' },
      { who: 'faithfulB', x: 400, y: 228, face: -1, pose: 'kneel', mood: 'calm', s: 0.95 },
      { who: 'donCourt', voice: 'don', x: -520, face: 1, pose: 'walk', item: 'oillamp', item2: 'jug', mood: 'sad', shadow: true, keys: [{ l: 0, move: 6, x: -110 }, { l: 1, pose: 'hold' }, { l: 2, pose: 'offer', item: 'bread', mood: 'calm' }, { l: 4, pose: 'kneel', mood: 'tender', x: -60 }] },
    ],
    sound: { drone: 0.4, water: 0.15, melody: 0.5 },
    sfx: [[0, 'door', 1], [0, 'chain', 1.6]],
    trans: 'black',
  },
  'fi-baptism': {
    light: { ambient: '#101c40', shade: 0.32, rim: '#cfe0ff', x: -1 },
    cam: [20, -30, 1.8],
    moves: [{ l: 0, move: 6, x: 20, y: -50, z: 2.2 }, { l: 2, move: 2, x: -40, y: -40, z: 2.5 }, { l: 4, move: 6, x: 10, y: -80, z: 2.1 }, { l: 5, move: 8, x: 0, y: -40, z: 1.3 }],
    back(s) {
      prison(s);
      const k = s.on(4, 4);
      s.layer(0.8, () => { godray(s.ctx, 0, -620, 120, 300, 900, 30, '#fff0c8', 0.12 + k * 0.3); glow(s.ctx, 20, -40, 400, '#fff0c8', k * 0.3); });
    },
    actors: [
      { who: 'sabinus', voice: 'eld', x: 110, face: -1, pose: 'stand', mood: 'tender', keys: [{ l: 4, pose: 'offer', item: 'jug', move: 1 }] },
      { who: 'donCourt', voice: 'don', x: -40, face: 1, pose: 'kneel', mood: 'calm', keys: [{ l: 2, mood: 'cry' }, { l: 4, mood: 'closed', pose: 'pray' }, { l: 5, mood: 'joy' }] },
      { who: 'marcella', x: 260, y: 232, face: -1, pose: 'pray', mood: 'tender' },
    ],
    mid(s) {
      const k = s.since(4) - 1;
      if (k > 0 && k < 5) s.layer(1, () => { for (let i = 0; i < 12; i++) { const y = -60 + ((k * 120 + i * 17) % 100); ellipse(s.ctx, 40 + Math.sin(i) * 8, y, 2.2, 5, '#cfe8ff'); } });
      s.layer(1, () => thread(s.ctx, [[-30, -40], [-60, -160], [10, -280], [-20, -440], [40, -620]], s.on(5, 8), s.time, 3));
    },
    front(s) { s.layer(1.2, () => motes(s.ctx, s.time, 40, '#e8f0ff', 0.3 + s.on(4, 3) * 0.5, 520)); },
    sound: { melody: 1, water: 0.2 },
    sfx: [[4, 'choir', 0.3], [5, 'bell', 2]],
  },

  /* ---------------- III. Recusatio ---------------- */
  're-altar': {
    light: LIGHT.hall,
    cam: [-150, -60, 1.2],
    moves: [{ l: 1, move: 2, x: 0, y: -110, z: 1.9 }, { l: 2, move: 2, x: -160, y: -80, z: 2.3 }, { l: 3, move: 1.6, x: 0, y: -120, z: 2.4 }, { l: 4, move: 1.2, x: -170, y: -80, z: 2.6 }],
    back(s) { hall(s, { altar: true }); },
    actors: [
      court('courtier', -560, 1), court('lady', 300, -1), court('courtier2', 420, -1, { seed: 8 }),
      { who: 'priest', x: -420, face: 1, item: 'censer', pose: 'hold', mood: 'calm' },
      { who: 'maximian', voice: 'max', x: 20, y: 110, face: -1, pose: 'sit', mood: 'smirk', s: 0.95, keys: [{ l: 1, pose: 'point' }, { l: 3, pose: 'stand', mood: 'angry' }] },
      { who: 'donCourt', voice: 'don', x: -190, face: 1, mood: 'calm', shadow: true, keys: [{ l: 2, mood: 'tender', pose: 'offer' }, { l: 3, pose: 'stand', mood: 'calm' }, { l: 4, mood: 'closed' }] },
      guard(560, -1),
    ],
    sound: { fire: 0.4, drone: 0.5 },
    sfx: [[0, 'chime', 0], [4, 'hit', 1]],
  },
  're-crown': {
    light: LIGHT.palace,
    cam: [0, -60, 1.1],
    moves: [{ l: 0, move: 6, x: 0, y: -110, z: 1.6 }, { l: 1, move: 2, x: -40, y: -110, z: 2.3 }, { l: 2, move: 1.6, x: 40, y: -140, z: 2.7 }, { l: 3, move: 1.6, x: -40, y: -110, z: 2.5 }, { l: 4, move: 1, x: 0, y: -60, z: 1.1 }],
    back(s) { hall(s); },
    actors: [
      court('courtier', -440, 1, { keys: [{ l: 4, mood: 'fear' }] }), court('lady', -320, 1, { mood: 'fear' }), court('courtier2', 340, -1, { keys: [{ l: 4, mood: 'fear', pose: 'cower' }] }),
      { who: 'maximian', voice: 'max', x: 20, y: 110, face: -1, pose: 'sit', mood: 'angry', s: 0.95, keys: [{ l: 2, mood: 'sad' }, { l: 4, pose: 'point', mood: 'angry' }] },
      { who: 'donCourt', voice: 'don', x: -260, face: 1, pose: 'walk', item: 'crown', mood: 'calm', shadow: true, keys: [{ l: 0, d: 1, x: -90, y: 190, move: 4 }, { l: 1, pose: 'kneel' }, { l: 1, d: 3.5, item: null, pose: 'bow' }, { l: 3, pose: 'stand', mood: 'tender' }, { l: 4, mood: 'calm' }] },
      guard(-600, 1, { keys: [{ l: 4, x: -250, move: 1.6, pose: 'walk' }] }), guard(600, -1, { seed: 3, keys: [{ l: 4, x: 100, move: 1.6, pose: 'walk' }] }),
    ],
    mid(s) { if (s.since(1) > 3.5) s.layer(1, () => drawItem(s.ctx, 'crown', [-30, 166], { t: s.time, ambient: '#3a1c2c', shade: 0.1 })); },
    sound: { fire: 0.3, drone: 0.4, melody: 0.8 },
    sfx: [[1, 'coin', 3.6], [4, 'sword', 0.3]],
  },
  're-escape': {
    light: LIGHT.night,
    cam: [0, -20, 1.3],
    moves: [{ l: 0, move: 8, x: -30, y: -30, z: 1.5 }, { l: 1, move: 1.6, x: 90, y: -60, z: 2.2 }, { l: 2, move: 1.6, x: -90, y: -60, z: 2.2 }, { l: 3, move: 1.6, x: 90, y: -60, z: 2.3 }, { l: 4, move: 4, x: -40, y: -40, z: 1.4 }],
    back(s) {
      milan(s);
      const c = s.ctx;
      s.layer(0.75, () => { arch(c, -160, 214, 150, 230, '#2a2238'); rect(c, -900, -500, 820, 714, '#211a30'); rect(c, 80, -500, 820, 714, '#211a30'); for (let r = 0; r < 14; r++) for (let i = 0; i < 7; i++) { rect(c, -900 + i * 118 + (r % 2) * 59, -480 + r * 50, 110, 44, rgba('#000000', 0.12 + hash(r * 9 + i) * 0.14)); rect(c, 90 + i * 118 + (r % 2) * 59, -480 + r * 50, 110, 44, rgba('#000000', 0.12 + hash(r * 3 + i) * 0.14)); } });
      s.layer(1, () => ground(c, GROUND - 4, '#1c1828', '#04040a'));
    },
    actors: [
      { who: 'valerius', voice: 'val', x: 80, face: -1, item: 'torch', pose: 'hold', mood: 'calm', shadow: true, keys: [{ l: 1, mood: 'sad' }, { l: 3, mood: 'angry', pose: 'point' }, { l: 4, pose: 'hold', mood: 'sad' }] },
      { who: 'donTravel', voice: 'don', x: -60, face: 1, mood: 'fear', shadow: true, keys: [{ l: 2, mood: 'sad' }, { l: 4, mood: 'tender', pose: 'offer' }, { l: 4, d: 2.6, face: -1, x: -460, pose: 'run', move: 3 }] },
    ],
    front(s) { s.layer(1.3, () => fog(s.ctx, s.time, 290, '#4a4a80', 0.18, 7, 16)); },
    sound: { wind: 0.4, drone: 0.7 },
    sfx: [[0, 'door', 3], [4, 'gallop', 3]],
    trans: 'black',
  },

  /* ---------------- IV. Via ---------------- */
  'vi-rain': {
    light: LIGHT.rain,
    cam: [-120, -20, 1.1],
    moves: [{ l: 0, move: 9, x: -40, y: -30, z: 1.2 }, { l: 1, move: 8, x: 150, y: -40, z: 1.5 }],
    back(s) { innExterior(s, s.on(1, 2, 6)); },
    actors: [{ who: 'donTravel', x: -560, face: 1, pose: 'hunch', item: 'staff', mood: 'sad', shadow: true, keys: [{ l: 0, move: 12, x: -120 }, { l: 1, d: 2, x: 120, move: 4 }, { l: 1, d: 6, pose: 'reach' }] }],
    front(s) { s.layer(1.2, () => { rain(s.ctx, s.time, 260, 0.55, 0.25); splashes(s.ctx, s.time, GROUND + 20, 24, 140); }); },
    sound: { rain: 1, wind: 0.5, melody: 0.4 },
    sfx: [[0, 'thunder', 2], [1, 'door', 6]],
    trans: 'wipe',
  },
  'vi-inn': {
    light: LIGHT.lamp,
    cam: [0, -20, 1.3],
    moves: [{ l: 0, move: 2, x: 100, y: -40, z: 1.9 }, { l: 1, move: 1.6, x: -100, y: -40, z: 2 }, { l: 2, move: 2.4, x: 0, y: -200, z: 2.2 }, { l: 3, move: 2, x: 40, y: -20, z: 1.4 }],
    back: innInterior,
    actors: [
      { who: 'hostess', voice: 'host', x: 140, face: -1, mood: 'tender', item: 'oillamp', pose: 'hold', keys: [{ l: 2, pose: 'point', item: null, mood: 'smirk' }, { l: 3, pose: 'offer', mood: 'tender' }] },
      { who: 'donTravel', voice: 'don', x: -120, face: 1, mood: 'sad', item: 'staff', shadow: true, keys: [{ l: 1, mood: 'calm' }, { l: 2, mood: 'fear' }, { l: 3, mood: 'joy', x: 40, move: 2 }] },
    ],
    front(s) { s.layer(1.2, () => { for (let i = 0; i < 8; i++) { const k = (s.time * 0.5 + i / 8) % 1; ellipse(s.ctx, -110 + Math.sin(i * 3) * 30, 20 + k * 200, 2, 4, rgba('#cfe0ff', 0.6 * (1 - k))); } }); },
    sound: { rain: 0.4, fire: 0.6 },
  },
  'vi-cellar': {
    light: LIGHT.lamp,
    cam: [0, 0, 1.15],
    moves: [{ l: 0, move: 8, x: -20, y: -20, z: 1.4 }, { l: 1, move: 1.6, x: 120, y: -40, z: 2.1 }, { l: 2, move: 1.6, x: -110, y: -40, z: 2.1 }, { l: 3, move: 3, x: 40, y: -20, z: 1.5 }],
    back: cellar,
    actors: [
      { who: 'faithfulA', x: -330, y: 232, face: 1, pose: 'pray', mood: 'calm' },
      { who: 'faithfulB', x: 360, y: 232, face: -1, pose: 'sit', mood: 'calm' },
      { who: 'presbyter', voice: 'pres', x: 150, face: -1, pose: 'hold', item: 'bread', mood: 'tender', keys: [{ l: 3, pose: 'offer' }] },
      { who: 'donTravel', voice: 'don', x: -140, face: 1, mood: 'calm', shadow: true, keys: [{ l: 2, mood: 'sad' }, { l: 3, pose: 'sit', y: 236, mood: 'joy', move: 1 }] },
    ],
    mid(s) { s.layer(1, () => { table(s.ctx, 40, GROUND - 70, 180); drawItem(s.ctx, 'oillamp', [40, GROUND - 80], { t: s.time, ambient: '#2a140c', shade: 0.1 }); }); },
    sound: { rain: 0.15, melody: 0.8 },
    sfx: [[0, 'choir', 2]],
  },
  'vi-patrol': {
    light: LIGHT.rain,
    cam: [140, -40, 1.6],
    moves: [{ l: 0, move: 1.6, x: 60, y: -60, z: 2 }, { l: 1, move: 1.6, x: 180, y: -60, z: 2.1 }, { l: 2, move: 1.6, x: 40, y: -60, z: 2.1 }, { l: 3, move: 6, x: 120, y: -30, z: 1.2 }],
    back(s) { innExterior(s, 0.8); },
    actors: [
      { who: 'hostess', voice: 'host', x: 160, face: -1, mood: 'calm', shadow: true, keys: [{ l: 1, pose: 'offer', mood: 'smirk' }, { l: 2, pose: 'stand', mood: 'calm' }] },
      { who: 'legionary', voice: 'sol', x: -20, face: 1, item: 'torch', pose: 'hold', mood: 'angry', shadow: true, keys: [{ l: 0, pose: 'point' }, { l: 2, pose: 'hold', mood: 'calm' }, { l: 3, face: -1, x: -520, move: 5, pose: 'walk' }] },
      { who: 'legionary', x: -170, face: 1, item: 'spear', pose: 'hold', seed: 6, keys: [{ l: 3, face: -1, x: -640, move: 5, pose: 'walk' }] },
    ],
    front(s) { s.layer(1.2, () => { rain(s.ctx, s.time, 240, 0.55, 0.25); splashes(s.ctx, s.time, GROUND + 20, 20, 140); }); },
    sound: { rain: 1, drone: 0.8 },
    sfx: [[0, 'hit', 0], [0, 'hit', 0.4], [3, 'gallop', 1]],
  },
  'vi-ring': {
    light: LIGHT.lamp,
    cam: [0, -40, 1.9],
    moves: [{ l: 0, move: 2, x: -40, y: -50, z: 2.3 }, { l: 1, move: 1.6, x: 60, y: -50, z: 2.4 }, { l: 2, move: 2, x: -50, y: -50, z: 2.5 }],
    back: innInterior,
    actors: [
      { who: 'donTravel', voice: 'don', x: -80, face: 1, pose: 'offer', item: 'ring', mood: 'tender', keys: [{ l: 2, mood: 'calm', pose: 'stand', item: null }] },
      { who: 'hostess', voice: 'host', x: 80, face: -1, mood: 'sad', keys: [{ l: 1, pose: 'offer', mood: 'tender' }, { l: 2, mood: 'cry', pose: 'pray' }] },
    ],
    sound: { fire: 0.5, rain: 0.2, melody: 0.9 },
  },
  'vi-fork': {
    light: LIGHT.dawn,
    cam: [0, -20, 1.2],
    moves: [{ l: 0, move: 3, x: 60, y: -60, z: 1.7 }, { l: 1, move: 2, x: -40, y: -60, z: 1.8 }, { l: 2, move: 7, x: 0, y: -30, z: 1 }],
    back(s) { plain(s, { dawn: 1 }); s.layer(1, () => { milestone(s.ctx, 220, GROUND + 6, 'VIA AEMILIA\nPARMA\nM P XXX'); }); },
    actors: [
      { who: 'hostess', voice: 'host', x: 120, face: -1, mood: 'calm', shadow: true, keys: [{ l: 0, pose: 'point' }, { l: 1, pose: 'stand', mood: 'sad' }, { l: 2, mood: 'cry' }] },
      { who: 'donTravel', voice: 'don', x: -40, face: 1, item: 'staff', mood: 'calm', shadow: true, keys: [{ l: 2, mood: 'tender' }, { l: 2, d: 3.4, face: -1, pose: 'walk', x: -620, move: 7 }] },
    ],
    front(s) { s.layer(1.3, () => fog(s.ctx, s.time, 280, '#ffe0e0', 0.25, 8, 10)); },
    sound: { birds: 0.6, wind: 0.3, melody: 0.8 },
    trans: 'light',
  },
};

export { duskSky, X0, X1, lerp, ease, ramp, line, linear, poly, soft, glow, flame, smoke };
