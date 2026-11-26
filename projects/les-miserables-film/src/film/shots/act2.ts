/* III. Fantine and IV. A Tempest in a Mind. */
import { GROUND, bed, blanket, candlestick, chair, clouds, ground, house, ridge, room, street, table, thread, tree, wheel, windowFrame, godray, fireplace } from '../draw/scenery';
import { blobPath, ellipse, hash, line, linear, mix, poly, rect, rgba, soft, ramp, ease, lerp } from '../draw/core';
import { flash, motes, petals, rain, snow, splashes } from '../draw/weather';
import { LIGHT, duskSky, luxembourg, snowTown } from './sets';
import type { S, Shots } from './types';

function factory(s: S): void {
  const c = s.ctx;
  s.layer(0.45, () => {
    room(c, '#8a8a80', '#4a3c30', 190);
    for (let i = -4; i <= 4; i++) windowFrame(c, i * 190, -150, 100, 270, '#e8f0f4', '#b8c8d0', '#34302c', true);
  });
  s.layer(0.6, () => {
    for (let i = -3; i <= 3; i++) godray(c, i * 190, -270, 90, 220, 470, 150, '#fff0c8', 0.1);
    for (let i = -3; i <= 3; i++) {
      const x = i * 210 + 40;
      ellipse(c, x, 60 + Math.sin(s.time * 3 + i) * 3, 20, 23, '#4a4650');
      c.fillStyle = '#3c3844';
      c.fill(blobPath([[x - 40, 150], [x - 20, 84], [x + 20, 84], [x + 40, 150]]));
      rect(c, x - 90, 140, 180, 14, '#5a4430');
    }
  });
  s.layer(1, () => ground(c, GROUND - 4, '#5a4838', '#16100c'));
}

function attic(s: S): void {
  const c = s.ctx;
  s.layer(0.55, () => {
    room(c, '#3a3448', '#241a1c', 190);
    poly(c, [[-900, -640], [-120, -640], [-900, -60]], '#161020');
    poly(c, [[900, -640], [240, -640], [900, -60]], '#161020');
    windowFrame(c, 150, -170, 120, 150, '#101c44', '#2c4070', '#1c1010');
    for (let i = 0; i < 6; i++) line(c, [[-330 + i * 21, -200 + hash(i) * 60], [-318 + i * 22, -150 + hash(i * 3) * 90]], rgba('#05040a', 0.55), 3);
  });
  s.layer(0.75, () => godray(c, 150, -245, 110, 260, 520, -220, '#90b0ff', 0.14));
  s.layer(1, () => ground(c, GROUND - 4, '#2c2026', '#070406'));
}

function mudSquare(s: S): void {
  const c = s.ctx;
  duskSky(s, '#4c5a70', '#8a8c8c', '#c8bca0');
  s.layer(0.08, () => clouds(c, s.time, -230, '#4a4e60', 0.7, 14, 10, 8));
  s.layer(0.35, () => { street(c, 150, 83, { wall: '#7a6c64', roof: '#4a3c40', lit: 0.05, timber: true }, 0.85); ground(c, 148, '#8a7a66', '#4a3c30'); });
  s.layer(0.65, () => { street(c, 196, 97, { wall: '#6a544c', roof: '#32242a', lit: 0.1, timber: true }, 1.05, [-380, 380]); });
  s.layer(1, () => {
    ground(c, GROUND - 6, '#6a5038', '#1c120a');
    for (let i = 0; i < 14; i++) ellipse(c, -700 + i * 108, GROUND + 20 + hash(i) * 100, 40 + hash(i * 3) * 50, 8 + hash(i * 5) * 8, rgba('#a8a8b0', 0.3));
  });
}

/** The cart; `up` is how high Valjean has raised it. */
function cart(s: S, up: number): void {
  const c = s.ctx;
  c.save();
  c.translate(170, GROUND - 6);
  c.rotate(0.3 - up * 0.34);
  c.translate(0, -up * 66);
  wheel(c, 62, -28, 62, up * 0.4, '#2c1a0e');
  poly(c, [[-210, -110], [140, -110], [122, -48], [-190, -48]], '#6a4424');
  for (let i = 0; i < 5; i++) line(c, [[-196 + i * 76, -108], [-190 + i * 72, -50]], '#3c240e', 6);
  for (let i = 0; i < 6; i++) ellipse(c, -170 + i * 54, -118 - (i % 2) * 14, 36, 24, '#a89468');
  line(c, [[-200, -62], [-330, -10 + up * 40]], '#4a2c14', 13);
  c.restore();
}

function court(s: S): void {
  const c = s.ctx;
  s.layer(0.45, () => {
    room(c, '#5a3c38', '#2c1a14', 190);
    for (const x of [-420, -250, 250, 420]) { rect(c, x - 26, -640, 52, 830, linear(c, x - 26, 0, x + 26, 0, [[0, '#3c2c2c'], [0.7, '#b89880'], [1, '#6a5448']])); rect(c, x - 40, -380, 80, 30, '#c8a888'); }
    windowFrame(c, 0, -330, 170, 220, '#e0d0b0', '#8a7060', '#2c180c', true);
    line(c, [[0, -190], [0, -90]], '#d8a840', 7);
    line(c, [[-60, -170], [60, -170]], '#d8a840', 6);
    for (const x of [-60, 60]) { line(c, [[x, -170], [x - 18, -130], [x + 18, -130], [x, -170]], '#d8a840', 2); }
  });
  s.layer(0.6, () => godray(c, 0, -420, 150, 640, 700, 0, '#ffe8c0', 0.13));
  s.layer(0.8, () => { rect(c, 90, 10, 420, 220, '#3c200e'); rect(c, 76, -4, 448, 22, '#5a3418'); for (let i = 0; i < 4; i++) rect(c, 116 + i * 96, 44, 70, 150, '#2c1608'); });
  s.layer(1, () => ground(c, GROUND - 4, '#3c2418', '#0a0604'));
}

function ward(s: S, dim = 0): void {
  const c = s.ctx;
  s.layer(0.55, () => {
    room(c, mix('#b8bcc4', '#2c2c44', dim), mix('#7a6c60', '#1c1620', dim), 190);
    windowFrame(c, -230, -160, 150, 250, mix('#f4f8ff', '#10183c', dim), mix('#c0d4e8', '#24306a', dim), '#4a3c34', true);
    poly(c, [[-330, -300], [-290, -300], [-280, 20], [-340, 40]], rgba('#f0e8e0', 0.7));
    rect(c, 260, -190, 8, 110, '#3a2410');
    rect(c, 232, -164, 64, 8, '#3a2410');
  });
  s.layer(0.75, () => godray(c, -230, -285, 140, 380, 600, 300, '#fff4e0', 0.2 * (1 - dim)));
  s.layer(1, () => { ground(c, GROUND - 4, mix('#8a786a', '#241c26', dim), '#0c080a'); bed(c, 40, 330); });
}

export const ACT2: Shots = {
  'fa-spring': {
    light: LIGHT.day,
    cam: [0, -20, 1.05],
    moves: [{ l: 0, move: 6, x: -50, y: -50, z: 1.55 }, { l: 1, move: 2, x: 0, y: -40, z: 1.7 }, { l: 2, move: 5, x: -60, y: -10, z: 1.1 }],
    back: luxembourg,
    actors: [
      { who: 'fantine', voice: 'fan', x: -110, face: 1, pose: 'stand', mood: 'joy', shadow: true, keys: [{ l: 1, pose: 'reach', mood: 'tender' }, { l: 2, pose: 'read', item: 'letter', mood: 'calm' }, { l: 2, d: 2.6, mood: 'cry', pose: 'hunch' }] },
      { who: 'dandy', x: 20, face: -1, pose: 'offer', mood: 'smirk', shadow: true, keys: [{ l: 1, d: 0.5, pose: 'stand' }, { l: 2, face: 1, pose: 'walk', x: 600, move: 5 }] },
      { who: 'cosDoll', x: -230, face: 1, s: 0.7, alpha: 0, mood: 'joy', shadow: true, keys: [{ l: 2, d: 2, alpha: 1, move: 1.6 }] },
    ],
    front(s) { s.layer(1.3, () => petals(s.ctx, s.time, 44, '#ffd0dc', 0.85)); },
    sound: { birds: 0.8, melody: 0.8 },
    trans: 'light',
  },
  'fa-leave': {
    light: LIGHT.dusk,
    cam: [-20, -10, 1.1],
    moves: [{ l: 1, move: 2, x: -100, y: -30, z: 1.6 }, { l: 2, move: 2, x: 120, y: -30, z: 1.6 }, { l: 3, move: 2, x: 170, y: -30, z: 1.7 }],
    back(s) {
      const c = s.ctx;
      duskSky(s, '#3c3c78', '#b86a7a', '#ffc080');
      s.layer(0.08, () => clouds(c, s.time, -250, '#8a4470', 0.5, 7, 7, 12));
      s.layer(0.3, () => ridge(c, 100, 190, '#5a3c5c', 13, 260));
      s.layer(0.6, () => { ridge(c, 180, 70, '#34223c', 14, 200); tree(c, -420, 200, 330, '#1c101c', '#4a3048', 5, s.time); });
      s.layer(1, () => {
        ground(c, GROUND - 6, '#5a3c40', '#12080c');
        house(c, 330, GROUND - 4, 330, 330, { wall: '#7a5448', roof: '#32202a', lit: 0.5, seed: 17, door: true, timber: true });
        rect(c, 190, GROUND - 292, 200, 46, '#2c1c14');
        for (let i = 0; i < 9; i++) ellipse(c, 214 + i * 20, GROUND - 269 + Math.sin(i * 2) * 7, 6, 9, '#c8a060');
        line(c, [[100, GROUND - 150], [180, GROUND - 40]], '#2c1c14', 7);
      });
    },
    actors: [
      { who: 'fantine', voice: 'fan', x: -420, face: 1, pose: 'walk', mood: 'sad', shadow: true, keys: [{ l: 0, move: 6, x: -130 }, { l: 1, pose: 'offer', mood: 'tender' }, { l: 3, pose: 'hunch', mood: 'sad' }] },
      { who: 'cosDoll', x: -500, face: 1, pose: 'walk', s: 0.62, shadow: true, keys: [{ l: 0, move: 6, x: -200 }, { l: 1, pose: 'stand' }, { l: 3, x: -20, move: 3, pose: 'walk', mood: 'fear' }] },
      { who: 'mmeT', voice: 'mmet', x: 200, face: -1, mood: 'calm', keys: [{ l: 3, pose: 'offer', mood: 'smirk' }] },
      { who: 'thenardier', voice: 'then', x: 90, face: -1, mood: 'smirk', alpha: 0, keys: [{ l: 1, d: 2, alpha: 1, move: 1 }, { l: 2, pose: 'point' }, { l: 3, pose: 'think' }] },
      { who: 'littleT', x: 290, face: -1, mood: 'joy', pose: 'sit', s: 0.55 },
    ],
    sound: { birds: 0.3, wind: 0.3 },
    trans: 'wipe',
  },
  'fa-factory': {
    light: LIGHT.cold,
    cam: [40, -30, 1.02],
    moves: [{ l: 0, move: 9, x: -60, y: -20, z: 1.2 }, { l: 1, move: 2.5, x: -110, y: -40, z: 1.9 }, { l: 2, move: 1.8, x: 20, y: -40, z: 1.5 }, { l: 3, move: 2, x: -100, y: -40, z: 2.1 }],
    back: factory,
    actors: [
      { who: 'valMayor', x: 330, face: -1, shadow: true, mood: 'tender', keys: [{ l: 0, move: 8, x: 130 }, { l: 1, d: 1, x: 620, move: 4, face: 1 }] },
      { who: 'fantineWork', voice: 'fan', x: -110, y: 232, face: 1, pose: 'read', mood: 'calm', shadow: true, keys: [{ l: 1, mood: 'joy' }, { l: 2, pose: 'stand', mood: 'fear' }, { l: 3, pose: 'pray', mood: 'cry' }] },
      { who: 'forewoman', voice: 'woman', x: 520, face: -1, mood: 'angry', keys: [{ l: 2, x: 90, move: 1.4, pose: 'point' }, { l: 3, pose: 'stand' }] },
    ],
    front(s) { s.layer(1.2, () => motes(s.ctx, s.time, 40, '#fff0d0', 0.35, 600)); },
    sound: { crowd: 0.6 },
  },
  'fa-attic': {
    light: { ambient: '#161434', shade: 0.34, rim: '#ffb864', x: -1 },
    cam: [-20, -10, 1.2],
    moves: [{ l: 1, move: 1.8, x: -40, y: -40, z: 1.9 }, { l: 2, move: 1.8, x: 80, y: -40, z: 1.8 }, { l: 3, move: 3, x: -50, y: -50, z: 2.5 }, { l: 4, move: 6, x: 0, y: -20, z: 1.2 }],
    back(s) { attic(s); s.layer(1, () => { table(s.ctx, -250, GROUND - 86, 120, '#3a2414'); candlestick(s.ctx, -250, GROUND - 90, 80, s.time, 7); chair(s.ctx, -70, 1); }); },
    actors: [
      { who: 'fantineWork', voice: 'fan', x: -60, face: 1, pose: 'read', item: 'letter', mood: 'sad', keys: [{ l: 1, pose: 'think', item: null }, { l: 2, d: 3.1, alpha: 0, move: 0.3 }] },
      { who: 'fantinePoor', voice: 'fan', x: -60, face: 1, pose: 'sit', alpha: 0, mood: 'sad', keys: [{ l: 2, d: 3.1, alpha: 1, move: 0.3 }, { l: 3, mood: 'smirk', face: -1 }, { l: 4, mood: 'cry', pose: 'pray', face: 1 }] },
      { who: 'barber', voice: 'merch', x: 360, face: -1, pose: 'walk', mood: 'smirk', keys: [{ l: 1, x: 110, move: 1.6, pose: 'offer' }, { l: 2, d: 2.8, pose: 'reach' }, { l: 3, x: 480, move: 2, face: 1, pose: 'walk' }] },
    ],
    mid(s) {
      const c = s.ctx;
      const cut = s.since(2) - 3.1;
      if (cut > 0 && cut < 4) s.layer(1, () => { for (let i = 0; i < 12; i++) { const y = -60 + cut * (70 + hash(i) * 60) + i * 5; const x = -80 + Math.sin(cut * 2 + i) * 30 + i * 4; if (y < GROUND) line(c, [[x, y], [x + 6, y + 18], [x - 3, y + 34]], '#f0c25a', 3); } });
    },
    sound: { wind: 0.35, melody: 0.9 },
    sfx: [[2, 'coin', 2], [2, 'wood', 3]],
    trans: 'black',
  },
  'fa-snow': {
    light: LIGHT.snow,
    cam: [-20, -10, 1.15],
    moves: [{ l: 0, d: 3, move: 1.2, x: -30, y: -30, z: 1.5 }, { l: 1, move: 2, x: 80, y: -50, z: 1.75 }, { l: 2, move: 2, x: -50, y: 0, z: 1.8 }],
    back: snowTown,
    actors: [
      { who: 'fantinePoor', voice: 'fan', x: -30, face: -1, pose: 'hunch', mood: 'sad', shadow: true, keys: [{ l: 0, d: 2.6, pose: 'cower', mood: 'fear', move: 0.3 }, { l: 0, d: 4, face: 1, pose: 'run', x: 20, mood: 'angry', move: 0.7 }, { l: 1, pose: 'cower', x: -60, mood: 'fear' }, { l: 2, pose: 'kneel', mood: 'cry' }] },
      { who: 'dandy', x: -260, face: 1, mood: 'smirk', shadow: true, keys: [{ l: 0, d: 1.4, x: -90, pose: 'reach', move: 1.2 }, { l: 0, d: 4.4, x: 80, pose: 'cower', mood: 'fear', move: 0.8, face: -1 }, { l: 1, x: -380, move: 2, pose: 'walk' }] },
      { who: 'javert', voice: 'jav', x: 560, face: -1, mood: 'calm', shadow: true, keys: [{ l: 1, x: 150, move: 2.2 }, { l: 1, d: 2.6, pose: 'point', mood: 'angry' }, { l: 2, pose: 'stand', mood: 'calm' }] },
    ],
    front(s) { s.layer(1.25, () => snow(s.ctx, s.time, 130, 0.95, 1.2)); s.layer(1.6, () => snow(s.ctx, s.time, 30, 0.6, 2.4, 500)); },
    sound: { wind: 0.8, drone: 0.35 },
    sfx: [[0, 'hit', 4.2]],
    trans: 'iris',
  },
  'fa-mayor': {
    light: LIGHT.snow,
    cam: [40, -40, 1.5],
    moves: [{ l: 0, move: 1.6, x: -110, y: -60, z: 1.8 }, { l: 1, move: 1.6, x: 130, y: -70, z: 2.2 }, { l: 2, move: 1.6, x: -90, y: -70, z: 2.1 }, { l: 3, move: 3, x: -20, y: 10, z: 1.2 }, { l: 4, move: 3, x: -40, y: -10, z: 1.8 }],
    back: snowTown,
    actors: [
      { who: 'fantinePoor', voice: 'fan', x: -10, face: 1, pose: 'kneel', mood: 'cry', shadow: true, keys: [{ l: 2, mood: 'calm' }, { l: 3, pose: 'fallen', x: 60, mood: 'closed', move: 1.2 }, { l: 3, d: 3, alpha: 0, move: 0.8 }] },
      { who: 'valMayor', voice: 'val', x: -420, face: 1, mood: 'calm', shadow: true, keys: [{ l: 0, x: -150, move: 1.6 }, { l: 2, mood: 'angry', pose: 'point' }, { l: 3, pose: 'kneel', mood: 'tender', x: -80 }, { l: 3, d: 3, pose: 'carry', x: -90 }, { l: 4, d: 1.5, face: -1, x: -330, move: 6, pose: 'carry' }] },
      { who: 'javert', voice: 'jav', x: 150, face: -1, mood: 'calm', shadow: true, keys: [{ l: 1, mood: 'angry' }, { l: 3, mood: 'angry', x: 220, move: 1 }] },
    ],
    /* Fantine lies across his arms as he walks away. */
    mid(s) {
      const k = s.since(3) - 3.2;
      if (k > 0) s.layer(1, () => { const away = ease(ramp(s.since(4), 1.5, 7.5)); s.actor({ who: 'fantinePoor', x: lerp(-170, -410, away), y: 112, face: 1, pose: 'lie', mood: 'closed', alpha: ramp(k, 0, 0.8), s: 0.8 }); });
    },
    front(s) { s.layer(1.25, () => snow(s.ctx, s.time, 110, 0.9, 1.1)); },
    sound: { wind: 0.6, melody: 0.8 },
  },

  /* ---------------- IV. A Tempest in a Mind ---------------- */
  'te-cart': {
    light: LIGHT.cold,
    cam: [0, -20, 1.05],
    moves: [{ l: 0, move: 5, x: -190, y: -60, z: 1.8 }, { l: 1, move: 2.5, x: 110, y: 20, z: 1.4 }, { l: 2, move: 2, x: -190, y: -60, z: 2.1 }, { l: 3, move: 1.6, x: 0, y: -40, z: 1.6 }],
    back: mudSquare,
    actors: [
      { who: 'javert', voice: 'jav', x: -280, face: 1, mood: 'calm', pose: 'stand', item: 'cane', shadow: true, keys: [{ l: 2, mood: 'smirk', pose: 'think', item: null }, { l: 3, pose: 'stand', mood: 'calm' }] },
      { who: 'fauchelevent', voice: 'fauch', x: 245, y: 232, pose: 'lie', mood: 'fear', s: 0.85, keys: [{ l: 1, mood: 'cry' }] },
      { who: 'valMayor', voice: 'val', x: 460, face: -1, mood: 'calm', shadow: true, keys: [{ l: 1, d: 0.5, x: 80, move: 2 }, { l: 3, face: -1, mood: 'angry', pose: 'point', x: -30 }] },
      { who: 'woman', x: 400, face: -1, mood: 'fear', pose: 'pray', s: 0.85, y: 214 },
      { who: 'innkeeper', x: -390, face: 1, mood: 'fear', s: 0.82, y: 212 },
    ],
    mid(s) { s.layer(1, () => cart(s, 0)); },
    front(s) { s.layer(1.2, () => rain(s.ctx, s.time, 80, 0.2, 0.1)); },
    sound: { rain: 0.3, crowd: 0.6, drone: 0.3 },
    sfx: [[1, 'wood', 0]],
    trans: 'wipe',
  },
  'te-lift': {
    light: LIGHT.cold,
    cam: [60, 0, 1.45],
    moves: [{ l: 0, move: 5, x: 90, y: -10, z: 1.75 }, { l: 1, move: 2.5, x: 150, y: 0, z: 1.6 }, { l: 2, move: 2, x: -170, y: -50, z: 1.9 }, { l: 3, move: 6, x: -40, y: -20, z: 1.05 }],
    back: mudSquare,
    actors: [
      { who: 'javert', voice: 'jav', x: -270, face: 1, mood: 'calm', shadow: true, keys: [{ l: 0, d: 2, mood: 'fear' }, { l: 2, mood: 'calm', pose: 'bow', x: -200, move: 1.4 }] },
      { who: 'fauchelevent', voice: 'fauch', x: 270, y: 232, pose: 'lie', mood: 'fear', s: 0.85, keys: [{ l: 1, pose: 'kneel', x: 300, mood: 'cry', face: -1 }, { l: 1, d: 3, pose: 'pray', mood: 'joy' }] },
      { who: 'valMayor', voice: 'val', x: 60, face: 1, pose: 'kneel', mood: 'angry', shadow: true, keys: [{ l: 0, pose: 'lift', x: 100, move: 3 }, { l: 1, d: 3, pose: 'stand', x: -40, mood: 'tender', move: 1.6 }, { l: 2, face: -1, mood: 'calm' }] },
      { who: 'champ', x: -520, face: 1, pose: 'hunch', mood: 'sad', alpha: 0, keys: [{ l: 3, alpha: 1, move: 2 }] },
    ],
    mid(s) { s.layer(1, () => cart(s, ease(ramp(s.since(0), 1.2, 5)) * (1 - 0.75 * ease(ramp(s.since(1), 3, 5))))); },
    front(s) { s.layer(1.2, () => { rain(s.ctx, s.time, 80, 0.2, 0.1); splashes(s.ctx, s.time, GROUND + 20, 12, 100); }); },
    sound: { rain: 0.35, crowd: 0.4, melody: 0.5 },
    sfx: [[0, 'wood', 1.4], [0, 'wood', 4.6]],
  },
  'te-storm': {
    light: { ambient: '#101030', shade: 0.38, rim: '#ff9848', x: 1 },
    cam: [0, -20, 1.15],
    moves: [{ l: 0, move: 3, x: -60, y: -60, z: 2.2 }, { l: 1, move: 8, x: 0, y: -30, z: 1.25 }, { l: 2, move: 3, x: -80, y: -60, z: 2.5 }, { l: 3, move: 4, x: 40, y: -40, z: 1.5 }],
    back(s) {
      const c = s.ctx;
      s.layer(0.55, () => {
        room(c, '#2c2440', '#1c1218', 190);
        windowFrame(c, -230, -150, 190, 280, '#0c1030', '#28285c', '#180c08', true);
        flash(c, s.time, -230, -180, 330, '#c8d8ff', 4.2, 2);
        for (let i = 0; i < 30; i++) { const y = -285 + ((s.time * 400 + hash(i) * 280) % 270); line(c, [[-318 + hash(i * 3) * 175, y], [-324 + hash(i * 3) * 175, y + 16]], 'rgba(200,220,255,0.4)', 1.4); }
        fireplace(c, 270, 192, s.time, 0.95);
      });
      s.layer(1, () => { ground(c, GROUND - 4, '#241620', '#050306'); table(c, 80, GROUND - 88, 150, '#2c1a10'); candlestick(c, 40, GROUND - 92, 104, s.time, 1); candlestick(c, 120, GROUND - 92, 104, s.time, 2); });
      /* The two men he could be. */
      const split = s.on(1, 3) * (1 - s.on(3, 2));
      if (split > 0.01) s.layer(0.8, () => {
        s.actor({ who: 'valConvict', x: -235, y: 190, s: 1.35, face: 1, pose: 'hunch', mood: 'angry', flat: '#a83830', alpha: split * 0.55 });
        s.actor({ who: 'valMayor', x: 235, y: 190, s: 1.35, face: -1, pose: 'stand', mood: 'calm', flat: '#d8b060', alpha: split * 0.55 });
      });
    },
    actors: [
      { who: 'valMayor', voice: 'val', x: -110, face: 1, pose: 'think', mood: 'fear', shadow: true, keys: [{ l: 1, pose: 'walk', x: -130, face: -1, move: 3 }, { l: 1, d: 3.2, face: 1, x: -20, move: 3.4 }, { l: 2, pose: 'think', mood: 'sad' }, { l: 3, pose: 'reach', x: -30, mood: 'cry' }] },
    ],
    front(s) { s.layer(1.2, () => motes(s.ctx, s.time, 24, '#ff9848', 0.4, 420)); },
    sound: { rain: 0.65, fire: 0.5, wind: 0.5, drone: 0.8 },
    sfx: [[0, 'thunder', 0.8], [1, 'thunder', 3], [2, 'bell', 0], [3, 'thunder', 1]],
    trans: 'black',
  },
  'te-court': {
    light: { ambient: '#3c2420', shade: 0.16, rim: '#ffe0b0', x: -1 },
    cam: [30, -30, 1.05],
    moves: [{ l: 0, move: 2, x: 220, y: -100, z: 1.7 }, { l: 1, move: 2, x: -100, y: -50, z: 1.6 }, { l: 2, move: 1.4, x: -60, y: -80, z: 2.7 }, { l: 3, move: 5, x: -20, y: -30, z: 1.15 }],
    back: court,
    actors: [
      { who: 'judge', voice: 'judge', x: 250, y: 120, face: -1, mood: 'calm', keys: [{ l: 0, pose: 'point' }, { l: 1, pose: 'stand', mood: 'fear' }] },
      { who: 'champ', x: 20, face: -1, pose: 'hunch', mood: 'fear', shadow: true, keys: [{ l: 2, pose: 'raise', mood: 'joy' }] },
      { who: 'valMayor', voice: 'val', x: -380, face: 1, mood: 'calm', shadow: true, keys: [{ l: 1, x: -130, move: 2 }, { l: 2, pose: 'stand', mood: 'angry' }, { l: 3, d: 0.6, alpha: 0, move: 1.6 }] },
      { who: 'valGuard', x: -130, face: 1, alpha: 0, mood: 'tender', keys: [{ l: 3, d: 0.6, alpha: 0 }] },
      { who: 'val', x: -130, face: 1, alpha: 0, mood: 'tender', keys: [{ l: 3, d: 0.6, alpha: 1, move: 1.6 }] },
    ],
    mid(s) { s.layer(0.95, () => { for (let i = 0; i < 9; i++) { const x = -470 + i * 120; ellipse(s.ctx, x, 262 + (i % 2) * 14, 40, 46, '#120a10'); soft(s.ctx, x, 330, 80, 60, '#120a10', 1); } }); },
    sound: { crowd: 0.45, drone: 0.45 },
    sfx: [[0, 'wood', 0], [2, 'chime', 0.2]],
    trans: 'light',
  },
  'te-bed': {
    light: { ambient: '#2c2c48', shade: 0.2, rim: '#fff0d8', x: -1 },
    cam: [0, -10, 1.2],
    moves: [{ l: 0, move: 2.5, x: -60, y: 60, z: 2 }, { l: 1, move: 0.9, x: 200, y: -50, z: 1.7 }, { l: 2, move: 2, x: 10, y: 10, z: 1.35 }, { l: 3, move: 5, x: -30, y: 40, z: 1.8 }],
    back(s) { ward(s, s.on(2, 5) * 0.75); },
    actors: [
      { who: 'fantinePoor', voice: 'fan', x: 30, y: 178, s: 0.9, face: 1, pose: 'lie', mood: 'tender', keys: [{ l: 0, mood: 'joy' }, { l: 1, mood: 'fear' }, { l: 2, d: 3, mood: 'closed' }] },
      { who: 'val', voice: 'val', x: -230, face: 1, pose: 'kneel', mood: 'tender', shadow: true, keys: [{ l: 1, pose: 'stand', mood: 'fear', move: 0.4 }, { l: 2, x: -215, move: 1.4 }, { l: 3, pose: 'kneel', x: -200, mood: 'cry', move: 1.2 }] },
      { who: 'javert', voice: 'jav', x: 560, face: -1, mood: 'angry', shadow: true, keys: [{ l: 1, x: 270, move: 0.9, pose: 'point' }, { l: 2, x: -80, move: 1.6, pose: 'reach' }, { l: 3, x: 330, move: 2.5, pose: 'stand', mood: 'calm' }] },
    ],
    mid(s) {
      s.layer(1, () => blanket(s.ctx, 40, 330, '#8a98b0'));
      s.layer(1, () => thread(s.ctx, [[-60, 90], [-90, 20], [-20, -80], [-110, -180], [-30, -320]], s.on(2, 8, 3), s.time, 2.4));
    },
    sound: { melody: 1, drone: 0.3 },
    sfx: [[1, 'door', 0], [2, 'chime', 3.4]],
  },
};

