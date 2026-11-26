/* V. Cosette, VI. The Wall, VII. Marius, VIII. The Garden. */
import { GROUND, X0, X1, bench, candlestick, chair, ground, house, lamp, ridge, room, table, thread, tree, water, windowFrame, godray, paris, clouds, flame, sun } from '../draw/scenery';
import { ellipse, glow, hash, line, linear, poly, rect, rgba, ramp, ease, lerp } from '../draw/core';
import { birds, embers, flash, fog, motes, petals, rain, smoke, snow } from '../draw/weather';
import { drawItem } from '../draw/puppet';
import { LIGHT, alley, cafe, duskSky, forest, forestFront, inn, luxembourg, nightSky, plumet, plumetFront, roofs } from './sets';
import type { S, Shots } from './types';

function seaStorm(s: S): void {
  const c = s.ctx;
  nightSky(s, '#10182c', '#2c4058', '#6a8088');
  s.layer(0.08, () => clouds(c, s.time, -250, '#0c1020', 0.85, 24, 12, 31));
  s.layer(0.15, () => flash(c, s.time, 100, -300, 500, '#d8e8ff', 4.4, 5));
  s.layer(0.3, () => {
    /* The great ship, her masts and the man on the yard. */
    const roll = Math.sin(s.time * 0.8) * 0.045;
    c.save();
    c.translate(60, 90);
    c.rotate(roll);
    poly(c, [[-380, -30], [380, -50], [310, 100], [-300, 100]], '#100c14');
    for (let i = 0; i < 9; i++) rect(c, -300 + i * 70, 5, 22, 18, '#d89848');
    for (const x of [-220, 20, 240]) {
      line(c, [[x, -40], [x, -430]], '#100c14', 13);
      for (const [y, w] of [[-370, 90], [-250, 130], [-130, 150]]) { line(c, [[x - w, y], [x + w, y]], '#100c14', 7); c.fillStyle = rgba('#c8c8c0', 0.28); c.fillRect(x - w + 10, y + 4, w * 2 - 20, 42); }
    }
    c.restore();
  });
}

function waves(s: S, y: number, color: string, amp: number, speed: number): void {
  const c = s.ctx;
  c.beginPath();
  c.moveTo(X0, 1300);
  for (let x = X0; x <= X1; x += 40) c.lineTo(x, y + Math.sin(x * 0.012 + s.time * speed) * amp + Math.sin(x * 0.031 - s.time * speed * 1.7) * amp * 0.4);
  c.lineTo(X1, 1300);
  c.fillStyle = linear(c, 0, y - amp, 0, y + 330, [[0, color], [1, '#020408']]);
  c.fill();
}

function poorRoom(s: S): void {
  const c = s.ctx;
  s.layer(0.55, () => {
    room(c, '#6a5c54', '#3a2a1e', 190);
    windowFrame(c, 200, -150, 160, 220, '#3c3c78', '#e09068', '#2c180c');
    for (let i = 0; i < 8; i++) line(c, [[-340 + hash(i) * 140, -260 + hash(i * 3) * 200], [-320 + hash(i) * 150, -210 + hash(i * 5) * 220]], rgba('#1c1008', 0.45), 3);
  });
  s.layer(0.75, () => godray(c, 200, -250, 130, 330, 540, -300, '#ffc890', 0.18));
  s.layer(1, () => ground(c, GROUND - 4, '#3a2a20', '#0a0604'));
}

function conventWall(s: S): void {
  const c = s.ctx;
  roofs(s, false);
  s.layer(0.75, () => { tree(c, 290, 200, 520, '#0c0a20', '#1c2c44', 14, s.time); });
  s.layer(1, () => {
    ground(c, GROUND - 6, '#241c38', '#06040c');
    rect(c, 70, -190, 330, GROUND + 190, linear(c, 70, 0, 400, 0, [[0, '#6a5c80'], [1, '#2c2440']]));
    for (let r = 0; r < 12; r++) for (let i = 0; i < 5; i++) rect(c, 76 + i * 66 + (r % 2) * 26, -184 + r * 35, 56, 28, rgba('#100820', 0.16 + hash(r * 5 + i) * 0.2));
    rect(c, 56, -214, 360, 28, '#8a7ca0');
  });
}

function convent(s: S): void {
  const c = s.ctx;
  duskSky(s, '#7a98d0', '#c8c0e0', '#ffe0c0');
  s.layer(0.08, () => { clouds(c, s.time, -300, '#ffffff', 0.5, 6, 6, 44); birds(c, s.time, -270, 6, '#3c3450', 8); });
  s.layer(0.4, () => {
    house(c, -200, 170, 340, 330, { wall: '#c8b8b0', roof: '#6a5468', lit: 0, seed: 3 });
    rect(c, 90, -230, 110, 400, '#baaaa4');
    poly(c, [[80, -226], [145, -350], [210, -226]], '#6a5468');
    ellipse(c, 145, -165, 28, 34, '#3c2c40');
    const swing = Math.sin(s.time * 2.4) * 12;
    poly(c, [[145 + swing - 20, -144], [145 + swing - 11, -176], [145 + swing + 11, -176], [145 + swing + 20, -144]], '#d8a848');
  });
  s.layer(0.7, () => { ground(c, 196, '#8aa070', '#3a4c30'); for (const x of [-430, 360]) tree(c, x, 210, 390, '#4a342c', '#f0b8c8', x, s.time); });
  s.layer(1, () => { ground(c, GROUND - 4, '#b8a880', '#4c4030'); });
}

function gorbeau(s: S): void {
  const c = s.ctx;
  s.layer(0.55, () => {
    room(c, '#3c2c34', '#201418', 190);
    windowFrame(c, 280, -150, 140, 210, '#10163c', '#2c3468', '#100808');
    for (let i = 0; i < 14; i++) line(c, [[-420 + hash(i) * 600, -330 + hash(i * 3) * 380], [-400 + hash(i) * 610, -300 + hash(i * 5) * 400]], rgba('#0a0408', 0.5), 3);
  });
  s.layer(1, () => {
    ground(c, GROUND - 4, '#241418', '#040204');
    poly(c, [[-72, GROUND - 52], [-8, GROUND - 52], [-18, GROUND - 12], [-62, GROUND - 12]], '#1c1414');
    line(c, [[-58, GROUND - 12], [-68, GROUND]], '#1c1414', 6);
    line(c, [[-22, GROUND - 12], [-12, GROUND]], '#1c1414', 6);
    for (let i = 0; i < 4; i++) flame(c, -64 + i * 16, GROUND - 52, 8 + (i % 2) * 4, s.time, i * 3);
  });
}

/** A coffin on four shoulders, crossing the garden. */
function coffin(s: S, x: number): void {
  const c = s.ctx;
  poly(c, [[x - 130, -30], [x - 96, -66], [x + 118, -60], [x + 140, -28], [x + 112, 6], [x - 108, 8]], '#3c2414');
  line(c, [[x - 96, -66], [x - 76, -28], [x + 118, -60]], '#6a4424', 4);
  line(c, [[x - 5, -52], [x - 5, -8]], '#d8b050', 6);
  line(c, [[x - 22, -40], [x + 12, -40]], '#d8b050', 6);
}

export const ACT3: Shots = {
  'co-sea': {
    light: { ambient: '#101830', shade: 0.45, rim: '#c8e0ff', x: 1 },
    cam: [60, -100, 1.15],
    moves: [{ l: 0, move: 4, x: 60, y: -170, z: 1.55 }, { l: 0, d: 5, move: 2, x: -20, y: 60, z: 1.2 }, { l: 1, move: 6, x: 0, y: 20, z: 1 }],
    back(s) {
      seaStorm(s);
      s.layer(0.6, () => waves(s, 130, '#1c3c4c', 28, 1.5));
      const c = s.ctx;
      s.layer(1, () => {
        const k = s.since(0);
        /* One leap from the yard, and the sea closes. */
        const fall = ramp(k, 4.8, 6.4);
        if (fall > 0 && fall < 1) { c.save(); c.translate(-10, lerp(-260, 230, fall * fall)); c.rotate(fall * 3); s.actor({ who: 'valConvict', x: 0, y: 70, s: 0.55, pose: 'fallen', mood: 'closed' }); c.restore(); }
        waves(s, 214, '#142c3c', 34, 2.1);
        const splash = k - 6.4;
        if (splash > 0 && splash < 2) for (let i = 0; i < 26; i++) { const a = -Math.PI * (0.15 + hash(i) * 0.7); ellipse(c, -10 + Math.cos(a) * splash * (80 + hash(i * 3) * 140), 214 + Math.sin(a) * splash * 200 + splash * splash * 100, 5, 5, rgba('#dcf0ff', 1 - splash / 2)); }
      });
    },
    actors: [{ who: 'worker', x: 130, y: -176, s: 0.42, pose: 'raise', mood: 'fear', keys: [{ l: 0, d: 3.8, alpha: 0, move: 1 }] }],
    front(s) { s.layer(1.3, () => { rain(s.ctx, s.time, 240, 0.5, 0.35); waves(s, 330, '#06121c', 40, 2.8); }); },
    sound: { rain: 0.9, wind: 1, water: 0.9, drone: 0.7 },
    sfx: [[0, 'thunder', 0.6], [0, 'splash', 6.4], [1, 'bell', 1]],
    trans: 'black',
  },
  'co-inn': {
    light: LIGHT.candle,
    cam: [0, -20, 1.1],
    moves: [{ l: 0, move: 4, x: -90, y: 20, z: 1.35 }, { l: 1, move: 1.4, x: 90, y: -50, z: 1.75 }, { l: 2, move: 1.6, x: -50, y: 20, z: 2 }, { l: 3, move: 1.6, x: 40, y: -20, z: 1.5 }],
    back: inn,
    actors: [
      { who: 'littleT', x: -240, y: 232, pose: 'sit', mood: 'joy', item: 'doll', s: 0.55 },
      { who: 'littleT', x: -130, face: -1, y: 232, pose: 'kneel', mood: 'joy', s: 0.5, seed: 9 },
      { who: 'cosChild', voice: 'cos', x: -20, y: 232, face: 1, pose: 'kneel', mood: 'sad', item: 'broom', shadow: true, keys: [{ l: 1, pose: 'cower', mood: 'fear', item: null }, { l: 2, pose: 'pray' }, { l: 3, pose: 'offer', item: 'bucket', mood: 'sad' }] },
      { who: 'mmeT', voice: 'mmet', x: 200, face: -1, mood: 'calm', shadow: true, keys: [{ l: 1, pose: 'point', mood: 'angry', x: 140, move: 0.8 }, { l: 3, pose: 'reach', mood: 'smirk', x: 120 }] },
      { who: 'thenardier', x: 340, face: -1, pose: 'sit', item: 'bottle', mood: 'smirk', y: 224 },
    ],
    sound: { fire: 0.8, crowd: 0.35 },
    sfx: [[1, 'wood', 0]],
    trans: 'iris',
  },
  'co-forest': {
    light: LIGHT.night,
    cam: [-20, -60, 1],
    moves: [{ l: 0, move: 7, x: -40, y: 50, z: 1.7 }, { l: 1, move: 2.5, x: -30, y: 70, z: 2.4 }, { l: 2, move: 3, x: 40, y: 20, z: 1.5 }],
    back(s) {
      forest(s);
      const c = s.ctx;
      s.layer(1, () => { for (let i = 0; i < 7; i++) { const x = 360 + hash(i) * 150; ellipse(c, x, GROUND - 4 - (i % 3) * 12, 40, 22, '#3c4a70'); } water(c, GROUND + 52, '#2c4478', '#08102c', s.time, [[190, '#cfe0ff', 0.5]]); });
    },
    actors: [
      { who: 'cosChild', voice: 'cos', x: -340, face: 1, pose: 'hunch', item: 'bucket', item2: 'lantern', mood: 'fear', shadow: true, keys: [{ l: 0, move: 8, x: -50 }, { l: 1, pose: 'kneel', mood: 'cry' }, { l: 2, d: 1.8, pose: 'stand', mood: 'fear', item: null, move: 0.8 }] },
      { who: 'val', x: 480, face: -1, item: 'cane', pose: 'walk', alpha: 0, shadow: true, keys: [{ l: 2, alpha: 1, move: 1 }, { l: 2, x: 52, move: 2.4 }, { l: 2, d: 2.4, pose: 'hold', item: 'bucket' }] },
    ],
    front(s) { forestFront(s); s.layer(1.2, () => snow(s.ctx, s.time, 60, 0.65, 0.8)); },
    sound: { wind: 0.7, drone: 0.4 },
    sfx: [[2, 'chime', 1.8]],
    trans: 'black',
  },
  'co-meet': {
    light: LIGHT.night,
    cam: [0, 20, 1.55],
    moves: [{ l: 0, move: 2, x: 60, y: -40, z: 2.1 }, { l: 1, move: 1.4, x: -60, y: 50, z: 2.6 }, { l: 2, move: 2, x: 80, y: -50, z: 2.4 }, { l: 3, move: 5, x: -20, y: 0, z: 1.25 }],
    back: forest,
    actors: [
      { who: 'val', voice: 'val', x: 90, face: -1, pose: 'bow', item: 'bucket', mood: 'tender', shadow: true, keys: [{ l: 2, pose: 'stand', mood: 'fear', move: 0.8 }, { l: 3, pose: 'kneel', mood: 'tender', x: 60, move: 1.4 }] },
      { who: 'cosChild', voice: 'cos', x: -50, face: 1, item: 'lantern', pose: 'hold', mood: 'fear', shadow: true, keys: [{ l: 1, mood: 'calm' }, { l: 3, mood: 'joy', pose: 'point', item: null }] },
    ],
    mid(s) { s.layer(1, () => thread(s.ctx, [[96, 128], [50, 172], [6, 140], [-30, 168]], s.on(2, 3), s.time, 2.2)); },
    front(s) { forestFront(s); s.layer(1.2, () => snow(s.ctx, s.time, 50, 0.6, 0.8)); },
    sound: { wind: 0.35, melody: 1 },
  },
  'co-doll': {
    light: LIGHT.candle,
    cam: [20, 0, 1.15],
    moves: [{ l: 0, move: 3, x: 40, y: -10, z: 1.4 }, { l: 1, move: 1.4, x: 40, y: 0, z: 1.8 }, { l: 2, move: 1.6, x: -50, y: 40, z: 2.4 }, { l: 3, move: 1.8, x: -230, y: -50, z: 2 }, { l: 4, move: 2.4, x: 0, y: -20, z: 1.25 }],
    back: inn,
    actors: [
      { who: 'val', voice: 'val', x: 520, face: -1, item: 'doll', pose: 'walk', mood: 'tender', shadow: true, keys: [{ l: 0, x: 130, move: 3 }, { l: 1, pose: 'kneel', x: 90 }, { l: 2, d: 2, item: null }, { l: 4, pose: 'offer', item: 'letter', x: 20, mood: 'calm', face: -1 }] },
      { who: 'cosChild', voice: 'cos', x: -50, face: 1, pose: 'cower', mood: 'fear', shadow: true, keys: [{ l: 1, pose: 'stand' }, { l: 2, pose: 'reach', mood: 'joy' }, { l: 2, d: 2.4, pose: 'embrace', item: 'doll' }] },
      { who: 'thenardier', voice: 'then', x: -300, face: 1, mood: 'smirk', pose: 'think', keys: [{ l: 3, pose: 'offer', x: -230, move: 1 }, { l: 4, pose: 'reach' }] },
      { who: 'mmeT', x: -420, face: 1, mood: 'angry' },
    ],
    sound: { fire: 0.6, melody: 0.7 },
    sfx: [[0, 'door', 0], [4, 'coin', 0.5], [4, 'coin', 1.2]],
  },
  'co-dawn': {
    light: LIGHT.dawn,
    cam: [-100, -20, 1.5],
    moves: [{ l: 0, move: 9, x: 10, y: -40, z: 1.05 }, { l: 1, move: 2, x: 40, y: 20, z: 1.9 }, { l: 2, move: 3, x: 70, y: -10, z: 1.7 }],
    back(s) {
      const c = s.ctx;
      duskSky(s, '#3c4a90', '#d888a0', '#ffd890');
      s.layer(0.07, () => { sun(c, 150, 10, 66, '#ffe8a8', '#ff9060'); clouds(c, s.time, -250, '#c86890', 0.4, 8, 7, 52); birds(c, s.time, -180, 7, '#4a2848', 9); });
      s.layer(0.22, () => ridge(c, 70, 200, '#8a5c88', 33, 280));
      s.layer(0.4, () => ridge(c, 140, 130, '#6c4070', 37, 210));
      s.layer(0.65, () => { ridge(c, 192, 50, '#422650', 41, 200); for (let i = 0; i < 8; i++) tree(c, -760 + i * 220, 192, 220, '#2c1834', null, i + 90, s.time); });
      s.layer(1, () => { ground(c, GROUND - 6, '#6a4458', '#160a14'); });
    },
    actors: [
      { who: 'val', voice: 'val', x: -170, face: 1, pose: 'walk', mood: 'tender', shadow: true, keys: [{ l: 0, move: 8, x: 60 }, { l: 1, pose: 'stand' }, { l: 2, mood: 'joy' }] },
      { who: 'cosDoll', voice: 'cos', x: -250, face: 1, pose: 'walk', item: 'doll', mood: 'joy', shadow: true, keys: [{ l: 0, move: 8, x: -14 }, { l: 1, pose: 'offer', mood: 'tender' }] },
    ],
    mid(s) { s.layer(1, () => thread(s.ctx, [[36, 120], [14, 150], [-6, 134]], s.on(0, 4, 3), s.time, 2)); },
    sound: { birds: 0.8, melody: 1, wind: 0.2 },
    trans: 'light',
  },

  /* ---------------- VI. The Wall ---------------- */
  'cv-lesson': {
    light: LIGHT.gold,
    cam: [0, -20, 1.2],
    moves: [{ l: 0, move: 7, x: 0, y: 20, z: 1.55 }, { l: 1, move: 1.6, x: -70, y: 0, z: 2.1 }, { l: 2, move: 1.6, x: 70, y: 30, z: 2.2 }],
    back(s) { poorRoom(s); s.layer(1, () => { chair(s.ctx, -140, 1); chair(s.ctx, 140, -1); }); },
    actors: [
      { who: 'val', voice: 'val', x: -130, face: 1, pose: 'sit', mood: 'tender', keys: [{ l: 1, pose: 'sit', item: 'book', mood: 'calm' }, { l: 2, mood: 'joy' }] },
      { who: 'cosDoll', voice: 'cos', x: 120, face: -1, pose: 'sit', mood: 'calm', y: 224, keys: [{ l: 2, mood: 'joy' }] },
    ],
    mid(s) { const c = s.ctx; s.layer(1, () => { table(c, 0, GROUND - 78, 160); candlestick(c, -34, GROUND - 82, 72, s.time, 3); drawItem(c, 'book', [20, GROUND - 90], { t: s.time, ambient: '#3a2010', shade: 0.1 }); ellipse(c, 46, GROUND - 88, 20, 11, '#b8742e'); }); },
    front(s) { s.layer(1.2, () => motes(s.ctx, s.time, 36, '#ffd8a0', 0.45, 520)); },
    sound: { birds: 0.2, melody: 0.7, fire: 0.2 },
    trans: 'wipe',
  },
  'cv-chase': {
    light: LIGHT.night,
    cam: [-40, -20, 1.1],
    moves: [{ l: 1, move: 1.4, x: -220, y: -50, z: 1.75 }, { l: 2, move: 1.4, x: 200, y: 0, z: 1.65 }],
    back(s) { alley(s); s.layer(1, () => lamp(s.ctx, -60, GROUND + 4, 260, s.time)); },
    actors: [
      { who: 'val', voice: 'val', x: -120, face: 1, pose: 'walk', mood: 'fear', shadow: true, keys: [{ l: 0, move: 6, x: 100 }, { l: 0, d: 3, face: -1, pose: 'stand' }, { l: 1, face: 1, pose: 'run', x: 220, move: 2 }, { l: 2, pose: 'kneel', face: -1, mood: 'tender' }] },
      { who: 'cosDoll', voice: 'cos', x: -190, face: 1, pose: 'walk', mood: 'calm', shadow: true, keys: [{ l: 0, move: 6, x: 30 }, { l: 0, d: 3, pose: 'stand', mood: 'fear' }, { l: 1, pose: 'run', x: 150, move: 2 }, { l: 2, pose: 'embrace', x: 175 }] },
      { who: 'javert', voice: 'jav', x: -640, face: 1, pose: 'walk', mood: 'calm', shadow: true, keys: [{ l: 0, d: 2.4, move: 5, x: -380 }, { l: 1, pose: 'point', mood: 'angry', x: -270, move: 1.4 }] },
      { who: 'soldier', x: -720, face: 1, pose: 'walk', item: 'torch', s: 0.9, keys: [{ l: 1, x: -400, move: 2.4 }] },
      { who: 'soldier', x: -780, face: 1, pose: 'walk', item: 'musket', s: 0.86, keys: [{ l: 1, x: -490, move: 3 }] },
    ],
    front(s) { s.layer(1.3, () => fog(s.ctx, s.time, 280, '#7a68a8', 0.2, 8, 24)); },
    sound: { wind: 0.4, drone: 0.9 },
    sfx: [[0, 'wood', 1.2], [0, 'wood', 1.9], [0, 'wood', 2.6], [1, 'bell', 0.4]],
  },
  'cv-wall': {
    light: { ambient: '#141440', shade: 0.35, rim: '#e0d0ff', x: -1 },
    cam: [60, -20, 1.2],
    moves: [{ l: 0, move: 6, x: 90, y: -150, z: 1.35 }, { l: 1, move: 2.5, x: 120, y: 10, z: 1.15 }, { l: 2, move: 1.4, x: -120, y: -30, z: 1.75 }, { l: 3, move: 1.4, x: -40, y: -30, z: 1.8 }],
    back(s) {
      conventWall(s);
      const c = s.ctx;
      if (s.since(1) > 2) s.layer(1, () => { rect(c, X0, GROUND - 4, 2600, 4, '#3c3058'); });
      s.layer(1, () => { const up = ramp(s.since(0), 2.6, 5.6); if (s.since(1) < 2.2 && up > 0) line(c, [[110, -214], [20, lerp(150, -110, up)]], '#d8c090', 3.5); });
    },
    actors: [
      { who: 'val', voice: 'val', x: 50, face: 1, pose: 'reach', mood: 'angry', keys: [{ l: 0, d: 0.5, pose: 'lift', y: -120, x: 56, move: 2.4 }, { l: 0, d: 2.8, y: -214, x: 120, pose: 'kneel', move: 0.8, face: -1 }, { l: 1, d: 2, y: 230, x: -40, pose: 'stand', face: -1, move: 0.6, mood: 'calm' }, { l: 3, pose: 'offer', mood: 'tender' }] },
      { who: 'cosDoll', x: 0, y: 230, face: 1, pose: 'raise', mood: 'fear', keys: [{ l: 0, d: 2.6, y: -90, move: 3 }, { l: 1, d: 2, y: 230, x: 30, pose: 'stand', face: -1, move: 0.6 }] },
      { who: 'fauchelevent', voice: 'fauch', x: -560, face: 1, item: 'lantern', pose: 'hold', mood: 'fear', shadow: true, keys: [{ l: 1, d: 2.4, x: -210, move: 2.4 }, { l: 2, pose: 'raise', mood: 'joy' }, { l: 3, pose: 'hold' }] },
    ],
    front(s) { s.layer(1.25, () => fog(s.ctx, s.time, 290, '#8878b8', 0.18, 7, 14)); },
    sound: { wind: 0.3, drone: 0.5 },
    sfx: [[1, 'bell', 3]],
  },
  'cv-coffin': {
    light: LIGHT.day,
    cam: [-60, -50, 1.5],
    moves: [{ l: 0, move: 5, x: 20, y: -30, z: 1.3 }, { l: 1, move: 10, x: 40, y: -30, z: 1.05 }],
    back: convent,
    actors: [
      { who: 'fauchelevent', voice: 'fauch', x: -340, face: 1, mood: 'smirk', pose: 'point', shadow: true, keys: [{ l: 1, pose: 'walk', x: 340, move: 11, mood: 'calm' }] },
      { who: 'nun', x: -140, face: 1, pose: 'carry', alpha: 0, keys: [{ l: 1, alpha: 1, move: 0.8 }, { l: 1, x: 150, move: 10 }] },
      { who: 'nun', x: -10, face: 1, pose: 'carry', alpha: 0, seed: 5, keys: [{ l: 1, alpha: 1, move: 0.8 }, { l: 1, x: 280, move: 10 }] },
    ],
    mid(s) { const k = s.since(1); if (k > 0) s.layer(1, () => { s.ctx.save(); s.ctx.globalAlpha = ramp(k, 0, 0.8); coffin(s, -80 + ease(ramp(k, 0, 10)) * 290); s.ctx.restore(); }); },
    front(s) { s.layer(1.3, () => petals(s.ctx, s.time, 30, '#ffd0e0', 0.8)); },
    sound: { birds: 0.7, melody: 0.4 },
    sfx: [[1, 'bell', 0], [1, 'bell', 2.4], [1, 'bell', 4.8]],
    trans: 'iris',
  },
  'cv-years': {
    light: LIGHT.dawn,
    cam: [0, 0, 1.15],
    moves: [{ l: 0, move: 9, x: 30, y: -50, z: 1.8 }, { l: 1, move: 2.4, x: -80, y: -50, z: 1.9 }],
    back: convent,
    actors: [
      { who: 'cosDoll', x: 80, face: -1, mood: 'joy', shadow: true, keys: [{ l: 0, d: 3.5, alpha: 0, move: 2 }] },
      { who: 'cosetteDark', voice: 'cos', x: 80, face: -1, mood: 'calm', alpha: 0, shadow: true, keys: [{ l: 0, d: 3.5, alpha: 1, move: 2 }, { l: 0, d: 7, mood: 'joy', pose: 'hold' }] },
      { who: 'val', voice: 'val', x: -150, face: 1, mood: 'tender', pose: 'stand', shadow: true, keys: [{ l: 1, mood: 'sad', pose: 'think' }] },
    ],
    front(s) { s.layer(1.25, () => { petals(s.ctx, s.time * 2.2, 70, '#ffc8d8', 0.9); }); },
    sound: { birds: 0.6, melody: 1 },
    sfx: [[0, 'chime', 3.5]],
  },

  /* ---------------- VII. Marius ---------------- */
  'em-bench': {
    light: LIGHT.day,
    cam: [0, -10, 1.05],
    moves: [{ l: 0, move: 6, x: -20, y: -30, z: 1.3 }, { l: 1, move: 2, x: -90, y: -50, z: 2.2 }, { l: 2, move: 2, x: 120, y: -30, z: 1.5 }],
    back: luxembourg,
    actors: [
      { who: 'val', voice: 'val', x: 220, y: 230, face: -1, pose: 'sit', item: 'book', mood: 'calm', keys: [{ l: 2, pose: 'stand', item: null, mood: 'angry', move: 0.6 }, { l: 2, d: 2, pose: 'walk', face: 1, x: 640, move: 4 }] },
      { who: 'cosetteDark', x: 110, y: 230, face: -1, pose: 'sit', mood: 'calm', keys: [{ l: 1, mood: 'tender' }, { l: 2, pose: 'stand', mood: 'sad', move: 0.6 }, { l: 2, d: 2.4, pose: 'walk', x: 540, move: 4, face: 1 }, { l: 2, d: 3.4, face: -1 }] },
      { who: 'marius', voice: 'mar', x: -560, face: 1, pose: 'walk', item: 'book', mood: 'calm', shadow: true, keys: [{ l: 0, x: -100, move: 6 }, { l: 1, mood: 'joy', pose: 'stand' }, { l: 2, mood: 'sad', x: 20, move: 3 }] },
    ],
    mid(s) { s.layer(1, () => thread(s.ctx, [[-70, -50], [-20, -110], [40, -20], [96, -20]], s.on(1, 3, 1), s.time, 2.4, 1 - s.on(2, 3, 2))); },
    front(s) { s.layer(1.3, () => petals(s.ctx, s.time, 36, '#fff0b0', 0.8)); },
    sound: { birds: 0.9, melody: 0.7 },
    trans: 'light',
  },
  'em-grand': {
    light: LIGHT.gold,
    cam: [0, -30, 1.2],
    moves: [{ l: 1, move: 1.2, x: -80, y: -50, z: 1.8 }, { l: 2, move: 3, x: 110, y: -40, z: 1.9 }],
    back(s) {
      const c = s.ctx;
      s.layer(0.55, () => { room(c, '#7a3c48', '#4a2a1c', 190); for (const x of [-250, 250]) { rect(c, x - 80, -260, 160, 190, '#d8a848'); rect(c, x - 66, -246, 132, 162, '#241420'); } ellipse(c, -250, -185, 30, 38, '#c8a890'); poly(c, [[-300, -86], [-250, -150], [-200, -86]], '#3c4a7a'); windowFrame(c, 0, -160, 130, 250, '#4c5890', '#e0a088', '#d8b060', true); });
      s.layer(1, () => ground(c, GROUND - 4, '#5a3020', '#140806'));
    },
    actors: [
      { who: 'gillenormand', voice: 'gill', x: -130, face: 1, mood: 'angry', pose: 'point', item: 'cane', shadow: true, keys: [{ l: 2, pose: 'hunch', mood: 'sad', face: -1 }] },
      { who: 'marius', voice: 'mar', x: 100, face: -1, mood: 'angry', shadow: true, keys: [{ l: 1, d: 3.4, face: 1, pose: 'walk', x: 280, move: 3 }, { l: 2, face: -1, pose: 'read', item: 'letter', x: 150, mood: 'sad', move: 0.1 }] },
    ],
    sound: { fire: 0.4, drone: 0.4 },
    sfx: [[1, 'hit', 0.2]],
  },
  'em-trap': {
    light: LIGHT.fire,
    cam: [0, -20, 1.15],
    moves: [{ l: 0, move: 4, x: 60, y: -40, z: 1.4 }, { l: 1, move: 1.4, x: -150, y: -50, z: 1.95 }, { l: 2, move: 1.6, x: -330, y: -60, z: 1.9 }],
    back(s) {
      gorbeau(s);
      const c = s.ctx;
      /* Marius watches through a crack in the wall. */
      s.layer(1, () => { rect(c, -520, -340, 190, 570, '#140a0e'); const k = s.on(2, 1.4); if (k > 0) { c.save(); c.globalAlpha = k; c.beginPath(); c.ellipse(-390, -76, 56, 74, 0.2, 0, Math.PI * 2); c.clip(); rect(c, -460, -160, 150, 180, '#2c1c30'); s.actor({ who: 'marius', voice: 'mar', x: -412, y: 208, face: 1, mood: 'fear', s: 1 }); c.restore(); line(c, [[-444, -130], [-424, -150], [-380, -156], [-344, -128]], '#000000', 7); } });
    },
    actors: [
      { who: 'val', voice: 'val', x: 90, face: -1, mood: 'calm', shadow: true, keys: [{ l: 1, mood: 'angry' }] },
      { who: 'thenardier', voice: 'then', x: -140, face: 1, mood: 'smirk', pose: 'offer', shadow: true, keys: [{ l: 1, pose: 'point' }, { l: 2, pose: 'think' }] },
      { who: 'worker', x: 230, face: -1, mood: 'angry', pose: 'reach', s: 0.96 },
      { who: 'mmeT', x: 350, face: -1, mood: 'smirk', item: 'torch', pose: 'raise', s: 0.9, y: 222 },
      { who: 'grantaire', x: -250, face: 1, mood: 'angry', item: 'cane', s: 0.9, y: 218 },
    ],
    sound: { fire: 0.7, drone: 0.9 },
    sfx: [[0, 'door', 3], [1, 'chain', 1]],
    trans: 'black',
  },
  'em-iron': {
    light: LIGHT.fire,
    cam: [20, -30, 1.45],
    moves: [{ l: 0, move: 2, x: 50, y: -50, z: 2.2 }, { l: 1, move: 2, x: 20, y: -20, z: 2.5 }, { l: 2, move: 1.4, x: 0, y: -30, z: 1.05 }],
    back: gorbeau,
    actors: [
      { who: 'val', voice: 'val', x: 60, face: -1, mood: 'tender', pose: 'stand', shadow: true, keys: [{ l: 1, pose: 'offer', item: 'iron', mood: 'closed' }, { l: 2, d: 0.5, x: 330, pose: 'run', face: 1, item: null, move: 1.4 }, { l: 2, d: 1.8, alpha: 0, move: 0.5 }] },
      { who: 'thenardier', x: -140, face: 1, mood: 'smirk', pose: 'offer', keys: [{ l: 1, mood: 'fear', pose: 'cower', x: -180 }, { l: 2, pose: 'raise' }] },
      { who: 'worker', x: -270, face: 1, mood: 'fear', pose: 'cower', s: 0.96 },
      { who: 'javert', voice: 'jav', x: -640, face: 1, pose: 'walk', mood: 'angry', keys: [{ l: 2, x: -60, move: 1.6 }, { l: 2, d: 1.8, pose: 'point' }] },
      { who: 'soldier', x: -720, face: 1, item: 'musket', pose: 'walk', keys: [{ l: 2, x: -380, move: 2 }, { l: 2, d: 2, pose: 'aim' }] },
    ],
    front(s) { const k = s.since(1) - 0.8; if (k > 0 && k < 5) s.layer(1, () => { smoke(s.ctx, s.time, 20, -40, '#e8e0d8', 0.3 * Math.min(1, k), 9, 240); embers(s.ctx, s.time, 20, -30, 40, 120, 16); }); },
    sound: { fire: 0.7, drone: 1 },
    sfx: [[1, 'chime', 1], [2, 'door', 0], [2, 'wood', 0.6]],
  },

  /* ---------------- VIII. The Garden ---------------- */
  'pl-epo': {
    light: LIGHT.dusk,
    cam: [0, -30, 1.35],
    moves: [{ l: 0, move: 2, x: -50, y: -40, z: 1.8 }, { l: 1, move: 1.4, x: 80, y: -50, z: 2.1 }, { l: 2, move: 1.4, x: -70, y: -40, z: 2.4 }, { l: 3, move: 5, x: 0, y: -10, z: 1.1 }],
    back(s) {
      const c = s.ctx;
      duskSky(s, '#2c2860', '#a04c70', '#ffa060');
      s.layer(0.08, () => clouds(c, s.time, -260, '#6a2c60', 0.5, 8, 7, 61));
      s.layer(0.3, () => paris(c, 90, '#4a2858', '#ffd080', 71, 0.75, true));
      s.layer(0.55, () => { water(c, 150, '#6a3860', '#1c0c20', s.time, [[-200, '#ffa860', 0.8], [250, '#ffc880', 0.6]]); });
      s.layer(1, () => { ground(c, GROUND - 6, '#4c2c44', '#10060e'); for (let x = -900; x < 900; x += 90) rect(c, x, GROUND - 72, 14, 68, '#2c1830'); rect(c, -900, GROUND - 84, 1800, 16, '#3c2038'); });
    },
    actors: [
      { who: 'eponine', voice: 'epo', x: -80, face: 1, mood: 'smirk', shadow: true, keys: [{ l: 2, mood: 'sad', pose: 'hunch' }, { l: 3, face: -1, x: -140, mood: 'cry', move: 3, pose: 'hunch' }] },
      { who: 'marius', voice: 'mar', x: 110, face: -1, mood: 'joy', shadow: true, keys: [{ l: 1, pose: 'offer', item: 'coin' }, { l: 2, pose: 'stand', item: null, mood: 'calm' }, { l: 3, face: 1, pose: 'walk', x: 320, mood: 'joy', move: 7 }] },
    ],
    sound: { water: 0.4, wind: 0.3, melody: 0.8 },
    trans: 'wipe',
  },
  'pl-letter': {
    light: { ambient: '#14285a', shade: 0.28, rim: '#c8f0ff', x: 1 },
    cam: [-30, 10, 1.15],
    moves: [{ l: 0, move: 5, x: -50, y: 20, z: 1.7 }, { l: 1, move: 4, x: -70, y: -30, z: 2.2 }, { l: 2, move: 2.4, x: 30, y: -30, z: 1.45 }],
    back(s) { plumet(s); s.layer(1, () => bench(s.ctx, -110, 190, '#24405a')); },
    actors: [
      { who: 'cosette', voice: 'cos', x: -250, face: 1, pose: 'walk', mood: 'calm', shadow: true, keys: [{ l: 0, x: -110, move: 3 }, { l: 0, d: 3, pose: 'kneel', move: 0.8 }, { l: 1, pose: 'read', item: 'letter', mood: 'tender', move: 0.8 }, { l: 2, pose: 'stand', mood: 'joy', item: null }] },
      { who: 'marius', voice: 'mar', x: 370, face: -1, mood: 'tender', alpha: 0, shadow: true, keys: [{ l: 2, alpha: 1, move: 1.4 }, { l: 2, x: 120, move: 2.4 }] },
    ],
    mid(s) { s.layer(1, () => thread(s.ctx, [[-80, 80], [-200, -20], [-60, -190], [120, -150], [260, -280]], s.on(1, 5), s.time, 2.4, 1 - s.on(2, 3, 2))); },
    front: plumetFront,
    sound: { water: 0.15, melody: 1, birds: 0.15 },
    trans: 'iris',
  },
  'pl-gate': {
    light: { ambient: '#14285a', shade: 0.24, rim: '#d8f4ff', x: 1 },
    cam: [0, -40, 1.8],
    moves: [{ l: 0, move: 1.6, x: 50, y: -60, z: 2.4 }, { l: 1, move: 1.4, x: -50, y: -55, z: 2.4 }, { l: 2, move: 1.4, x: 0, y: -50, z: 1.9 }, { l: 3, move: 8, x: 0, y: -20, z: 1.05 }],
    back(s) { plumet(s, false); },
    actors: [
      { who: 'cosette', voice: 'cos', x: -74, face: 1, mood: 'tender', shadow: true, keys: [{ l: 1, mood: 'joy' }, { l: 3, pose: 'embrace', mood: 'closed', x: -36, move: 3 }] },
      { who: 'marius', voice: 'mar', x: 76, face: -1, mood: 'tender', shadow: true, keys: [{ l: 2, mood: 'joy' }, { l: 3, pose: 'embrace', mood: 'closed', x: 36, move: 3 }] },
    ],
    front(s) { plumetFront(s); s.layer(1.15, () => { petals(s.ctx, s.time, 30, '#ffe0f0', 0.75); motes(s.ctx, s.time, 26, '#fff0b0', s.on(3, 3) * 0.9, 380); }); },
    mid(s) { s.layer(1, () => thread(s.ctx, [[-200, -80], [-110, -190], [0, -210], [110, -190], [200, -80]], s.on(3, 6, 1), s.time, 2.6)); },
    sound: { melody: 1, water: 0.1 },
  },
  'pl-leave': {
    light: LIGHT.night,
    cam: [0, -30, 1.4],
    moves: [{ l: 0, move: 2, x: -50, y: -50, z: 2.2 }, { l: 1, move: 1.4, x: 50, y: -50, z: 2.3 }, { l: 2, move: 6, x: 0, y: -130, z: 1 }],
    back(s) { plumet(s); s.layer(0.5, () => glow(s.ctx, 0, 90, 700, '#ff5030', s.on(2, 4) * 0.35)); },
    actors: [
      { who: 'cosette', voice: 'cos', x: -66, face: 1, mood: 'cry', pose: 'hunch', shadow: true },
      { who: 'marius', voice: 'mar', x: 70, face: -1, mood: 'sad', shadow: true, keys: [{ l: 1, mood: 'cry', pose: 'reach' }, { l: 2, face: 1, pose: 'stand', mood: 'fear' }] },
    ],
    front(s) { plumetFront(s); s.layer(1.2, () => rain(s.ctx, s.time, 120, s.on(2, 3) * 0.35)); },
    sound: { wind: 0.4, melody: 0.5, drone: 0.4, crowd: 0.1 },
    sfx: [[2, 'thunder', 1], [2, 'bell', 2.5]],
  },
  'pl-abc': {
    light: LIGHT.candle,
    cam: [0, -20, 1.05],
    moves: [{ l: 0, move: 5, x: -30, y: -40, z: 1.2 }, { l: 1, move: 1.4, x: -90, y: -70, z: 1.75 }, { l: 2, move: 1.4, x: 220, y: -10, z: 1.85 }, { l: 3, move: 1.2, x: -60, y: -60, z: 2 }, { l: 4, move: 1.2, x: 200, y: -20, z: 2 }, { l: 5, move: 1.6, x: -150, y: -20, z: 1.3 }],
    back: cafe,
    actors: [
      { who: 'student', x: -330, face: 1, pose: 'sit', mood: 'calm', y: 226 },
      { who: 'worker', x: 70, face: -1, pose: 'think', mood: 'calm', s: 0.92, y: 216 },
      { who: 'marius', x: 360, face: -1, mood: 'sad', s: 0.9, y: 214 },
      { who: 'enjolras', voice: 'enj', x: -90, face: 1, mood: 'angry', shadow: true, keys: [{ l: 1, pose: 'raise' }, { l: 2, pose: 'stand' }, { l: 3, pose: 'point' }, { l: 4, pose: 'stand', mood: 'tender' }, { l: 5, face: -1, mood: 'fear' }] },
      { who: 'grantaire', voice: 'gran', x: 230, face: -1, pose: 'sit', item: 'bottle', mood: 'smirk', y: 232, keys: [{ l: 4, mood: 'tender' }] },
      { who: 'gavroche', voice: 'gav', x: -640, face: 1, pose: 'run', mood: 'fear', shadow: true, keys: [{ l: 5, x: -270, move: 1.2 }, { l: 5, d: 1.3, pose: 'raise' }] },
    ],
    mid(s) { s.layer(1, () => { table(s.ctx, 205, GROUND - 74, 150); candlestick(s.ctx, 180, GROUND - 78, 64, s.time, 8); }); },
    sound: { crowd: 0.55, fire: 0.3 },
    sfx: [[5, 'door', 0], [5, 'bell', 1.6]],
    trans: 'black',
  },
};

