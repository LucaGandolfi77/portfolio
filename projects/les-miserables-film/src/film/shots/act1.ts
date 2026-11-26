/* Prologue, I. The Convict, II. The Candlesticks. */
import { GROUND, X0, X1, bed, candlestick, chair, ground, house, moon, ridge, stars, street, sun, thread, tree, water, windowFrame, clouds, bench } from '../draw/scenery';
import { blobPath, ellipse, glow, hash, line, linear, mix, poly, rect, rgba, ramp, ease, lerp } from '../draw/core';
import { birds, fog, motes, snow } from '../draw/weather';
import { LIGHT, bishopRoom, digne, duskSky, nightSky, supper } from './sets';
import type { S, Shots } from './types';

/** The old book that opens the film. */
function book(s: S): void {
  const c = s.ctx;
  const open = ease(ramp(s.t, 0.6, 4.6));
  s.layer(0, () => rect(c, X0, -1300, X1 - X0, 2600, '#070406'));
  s.layer(0.6, () => { glow(c, -270, -40, 620, '#ff9438', 0.3); motes(c, s.time, 60, '#ffd890', 0.55, 620); });
  s.layer(1, () => {
    rect(c, X0, 190, X1 - X0, 1100, linear(c, 0, 190, 0, 560, [[0, '#3a2012'], [1, '#080402']]));
    for (let i = -8; i < 9; i++) line(c, [[i * 130, 192], [i * 260, 700]], rgba('#000000', 0.3), 4);
    candlestick(c, -285, 196, 250, s.time, 1);
    /* Covers, pages and the turning leaf. */
    poly(c, [[-250, 170], [0, 205], [250 * open + 10, 170], [270 * open + 14, 205], [0, 244], [-270, 205]], '#4a1c14');
    const page = linear(c, -230, 0, 230, 0, [[0, '#d8c498'], [0.48, '#f6ecd2'], [0.5, '#a89068'], [0.54, '#f4e8cc'], [1, '#d0ba8c']]);
    c.fillStyle = page;
    c.fill(blobPath([[-238, 160], [-130, 118], [-14, 158], [0, 190], [-6, 200], [-130, 172], [-244, 192]]));
    c.fill(blobPath([[4, 188], [20, 156], [130 * open + 20, 118], [238 * open + 14, 160], [244 * open + 14, 192], [130 * open, 172], [8, 200]]));
    for (let i = 0; i < 6; i++) {
      line(c, [[-212, 156 + i * 6], [-128, 134 + i * 7], [-30, 162 + i * 6]], 'rgba(70,40,20,0.42)', 1.6);
      if (open > 0.8) line(c, [[32, 162 + i * 6], [128, 134 + i * 7], [212, 156 + i * 6]], 'rgba(70,40,20,0.42)', 1.6);
    }
    const leaf = (s.t * 0.17) % 1;
    if (s.t > 5 && leaf < 0.36) {
      const a = (leaf / 0.36) * Math.PI;
      c.fillStyle = 'rgba(250,240,214,0.92)';
      c.fill(blobPath([[0, 190], [8, 158], [Math.cos(a) * 130, 118 - Math.sin(a) * 90], [Math.cos(a) * 236, 160 - Math.sin(a) * 120], [Math.cos(a) * 230, 186 - Math.sin(a) * 100], [Math.cos(a) * 110, 172 - Math.sin(a) * 50]]));
    }
    thread(c, [[0, 184], [-40, 90], [60, 20], [-70, -80], [40, -170], [0, -230], [90, -280], [250, -330]], ramp(s.t, 3.4, 12), s.time, 3.4);
  });
}

export const ACT1: Shots = {
  'pr-book': {
    light: LIGHT.candle,
    cam: [0, 20, 1.5],
    moves: [{ l: 0, move: 8, y: -30, z: 1.08 }, { l: 1, move: 6, y: -50, z: 1 }],
    back: book,
    sound: { fire: 0.3, melody: 0.6 },
    sfx: [[0, 'chime', 0]],
    trans: 'black',
  },
  'pr-france': {
    light: LIGHT.dusk,
    cam: [-80, -20, 1.15],
    moves: [{ l: 0, move: 11, x: 60, z: 1 }, { l: 1, move: 6, x: 40, y: 40, z: 1.35 }],
    back(s) {
      const c = s.ctx;
      duskSky(s, '#241c48', '#a8485a', '#ffb45a');
      s.layer(0.08, () => { sun(c, 150, -20, 54, '#ffcf6a', '#ff7a38'); clouds(c, s.time, -230, '#6a2c4c', 0.55, 11, 9, 3); birds(c, s.time, -190, 9, '#2c1424'); });
      s.layer(0.22, () => ridge(c, 80, 250, '#6c3856', 2, 250));
      s.layer(0.4, () => { ridge(c, 140, 150, '#442240', 8, 190); for (let i = 0; i < 9; i++) { const x = -700 + i * 175; line(c, [[x, 130], [x + 8, 40]], '#241022', 5); poly(c, [[x + 8, 40], [x + 54, 54 + Math.sin(s.time * 3 + i) * 6], [x + 10, 72]], '#241022'); } });
      s.layer(1, () => { ground(c, GROUND - 6, '#2c1424', '#0a040a'); });
    },
    actors: [
      { who: 'soldier', x: -520, face: 1, pose: 'walk', flat: '#1a0a18', s: 0.55, y: 200, keys: [{ l: -1, move: 16, x: -60 }] },
      { who: 'soldier', x: -640, face: 1, pose: 'hunch', flat: '#1a0a18', s: 0.5, y: 196, keys: [{ l: -1, move: 18, x: -230 }] },
      { who: 'soldier', x: 520, face: -1, pose: 'walk', flat: '#1a0a18', s: 0.45, y: 192, keys: [{ l: -1, move: 18, x: 180 }] },
      { who: 'valConvict', x: -40, face: 1, pose: 'hunch', alpha: 0, keys: [{ l: 1, move: 2, alpha: 1 }, { l: 1, move: 6, x: 50 }] },
    ],
    mid(s) { s.layer(1, () => thread(s.ctx, [[330, -300], [220, -190], [270, -90], [120, -40]], s.on(1, 5), s.time, 2.4)); },
    sound: { wind: 0.5, melody: 0.4 },
    trans: 'thread',
  },
  'pr-bread': {
    light: { ambient: '#1a2048', shade: 0.35, rim: '#ffc46a', x: 1 },
    cam: [20, -10, 1.1],
    moves: [{ l: 0, move: 3, x: 60, y: -20, z: 1.45 }, { l: 1, move: 7, x: 0, z: 1 }],
    back(s) {
      const c = s.ctx;
      nightSky(s, '#050a20', '#14224c', '#2c3c70');
      s.layer(0.1, () => { stars(c, s.time, 70); moon(c, -240, -340, 28); });
      s.layer(0.5, () => { street(c, 195, 55, { wall: '#232a4a', roof: '#0e1228', lit: 0.1 }, 1.1, [-100, 360]); });
      s.layer(1, () => {
        ground(c, GROUND - 6, '#1c2038', '#05060e');
        house(c, 150, GROUND - 4, 360, 420, { wall: '#4a3450', roof: '#1c1226', lit: 0, seed: 9 });
        windowFrame(c, 130, 70, 190, 150, '#ffd890', '#d87c30', '#3a1c10');
        glow(c, 130, 70, 330, '#ffa848', 0.4);
        for (const [x, y] of [[80, 116], [126, 122], [176, 112]]) ellipse(c, x, y, 28, 15, '#b06c24', -0.2);
        const broken = s.since(0) > 3.6;
        if (broken) for (let i = 0; i < 11; i++) line(c, [[150, 55], [150 + Math.cos(i * 0.6) * (30 + hash(i) * 50), 55 + Math.sin(i * 0.6) * (24 + hash(i + 2) * 40)]], 'rgba(240,250,255,0.85)', 1.8);
        /* Nineteen years, counted on the wall. */
        const marks = Math.floor(s.on(1, 6, 1) * 19);
        for (let i = 0; i < marks; i++) {
          const x = -330 + (i % 5) * 26;
          const y = -250 + Math.floor(i / 5) * 76;
          if (i % 5 === 4) line(c, [[x - 112, y + 44], [x - 4, y + 4]], '#ffe0a0', 5);
          else line(c, [[x, y], [x - 5, y + 50]], '#ffe0a0', 5);
        }
      });
    },
    actors: [
      { who: 'valConvict', voice: 'val', x: -240, face: 1, pose: 'walk', mood: 'sad', keys: [{ l: 0, move: 3, x: -30 }, { l: 0, d: 3, pose: 'reach', move: 0.5 }, { l: 0, d: 4.2, pose: 'hold', item: 'bread' }, { l: 0, d: 5, pose: 'run', move: 3, x: -330, face: -1 }, { l: 1, pose: 'bow', face: 1, x: -150, item: null, move: 0.1 }] },
    ],
    mid(s) {
      const bars = s.on(1, 2.5);
      if (bars > 0) s.layer(1.2, () => { s.ctx.save(); s.ctx.globalAlpha = bars; for (let x = -520; x <= 520; x += 104) line(s.ctx, [[x, -760], [x, 700]], '#05050a', 15); line(s.ctx, [[-700, -140], [700, -140]], '#05050a', 13); s.ctx.restore(); });
    },
    sfx: [[0, 'glass', 3.6], [1, 'chain', 0.2], [1, 'chain', 3]],
    sound: { wind: 0.25, drone: 0.4 },
    trans: 'iris',
  },

  /* ---------------- I. The Convict ---------------- */
  'fo-toulon': {
    light: { ambient: '#8a4a28', shade: 0.14, rim: '#fff0c0', x: 1 },
    cam: [0, -30, 1],
    moves: [{ l: 1, move: 3, x: 20, y: 0, z: 1.25 }, { l: 2, move: 2, x: -90, y: -50, z: 1.9 }, { l: 3, move: 2.4, x: 0, y: 10, z: 1.3 }],
    back(s) {
      const c = s.ctx;
      duskSky(s, '#5a7ab0', '#d8a878', '#ffd890');
      s.layer(0.08, () => { sun(c, 220, -300, 48, '#fff2c0', '#ffb848'); birds(c, s.time, -250, 6, '#3a2418', 3); });
      s.layer(0.18, () => { water(c, 20, '#3c6a80', '#12202c', s.time, [[220, '#ffd070', 1.1]]); });
      s.layer(0.3, () => {
        for (const [x, h] of [[-290, 1], [90, 0.75], [430, 0.9]]) {
          const y = 62 + Math.sin(s.time * 0.7 + x) * 4;
          poly(c, [[x - 130 * h, y], [x + 140 * h, y], [x + 100 * h, y + 34 * h], [x - 100 * h, y + 34 * h]], '#2c1a1a');
          for (const dx of [-60, 20, 80]) {
            line(c, [[x + dx * h, y], [x + dx * h, y - 220 * h]], '#2c1a1a', 5 * h);
            poly(c, [[x + (dx - 44) * h, y - 190 * h], [x + (dx + 40) * h, y - 196 * h], [x + (dx + 30) * h, y - 120 * h], [x + (dx - 34) * h, y - 114 * h]], rgba('#f0d8b0', 0.8));
          }
        }
      });
      s.layer(0.65, () => { for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) rect(c, -660 + i * 118 + (r % 2) * 40, 180 - r * 56, 108, 50, mix('#8a6448', '#4a2c22', hash(r * 7 + i))); rect(c, 180, 140, 700, 90, '#6a4636'); });
      s.layer(1, () => { ground(c, GROUND - 6, '#a87850', '#2c1810'); line(c, [[-350, 244], [-260, 262], [-170, 246], [-110, 258]], '#2a2420', 9); });
    },
    actors: [
      { who: 'worker', x: -330, s: 0.82, y: 222, pose: 'lift', shadow: true, mood: 'sad' },
      { who: 'champ', x: -230, s: 0.75, y: 214, pose: 'hunch', mood: 'sad' },
      { who: 'valConvict', voice: 'val', x: -90, face: 1, mood: 'angry', pose: 'hunch', keys: [{ l: 2, pose: 'stand' }, { l: 3, d: 2, pose: 'offer', item: 'passport' }] },
      { who: 'guard', voice: 'guard', x: 130, face: -1, item: 'cane', mood: 'smirk', keys: [{ l: 3, pose: 'offer', item: 'passport', move: 0.4 }, { l: 3, d: 2, pose: 'stand', item: 'cane' }] },
    ],
    front(s) { s.layer(1.3, () => motes(s.ctx, s.time, 40, '#ffd890', 0.45, 700)); },
    sfx: [[0, 'chain', 0.5], [1, 'chain', 0], [3, 'wood', 0]],
    sound: { water: 0.6, wind: 0.3, birds: 0.3 },
    trans: 'black',
  },
  'fo-road': {
    light: LIGHT.dusk,
    cam: [-60, -30, 1],
    moves: [{ l: 0, move: 9, x: 20 }, { l: 1, move: 3, x: 40, y: -30, z: 1.7 }],
    back(s) {
      const c = s.ctx;
      duskSky(s, '#1c1c50', '#6a3c78', '#f08c68');
      s.layer(0.06, () => { stars(c, s.time, 60, 0.7, -250); clouds(c, s.time, -200, '#e0708a', 0.35, 9, 8, 4); });
      const scroll = s.t * 14;
      s.layer(0.18, () => ridge(c, -10, 330, '#584078', 4, 300));
      s.layer(0.34, () => { ridge(c, 70, 210, '#382858', 11, 230); });
      s.layer(0.6, () => { ridge(c, 170, 120, '#22183c', 19, 180); for (let i = 0; i < 12; i++) { const x = ((i * 190 - scroll * 3) % 2200 + 3300) % 2200 - 1100; tree(c, x, 175, 150 + hash(i) * 90, '#140c24', i % 3 ? '#2c1c3c' : null, i + 5, s.time); } });
      s.layer(1, () => {
        ground(c, GROUND - 6, '#3a2840', '#0a0610');
        for (let i = 0; i < 18; i++) { const x = ((i * 120 - scroll * 9) % 2160 + 3240) % 2160 - 1080; ellipse(c, x, GROUND + 16 + (i % 3) * 22, 26, 7, '#5a4460'); }
        for (let i = 0; i < 8; i++) { const x = ((i * 260 - scroll * 9) % 2080 + 3120) % 2080 - 1040; poly(c, [[x, GROUND], [x + 6, GROUND - 44], [x + 24, GROUND - 46], [x + 30, GROUND]], '#4a3850'); }
      });
    },
    actors: [{ who: 'valConvict', voice: 'val', x: -40, pose: 'hunch', mood: 'sad', item: 'cane', marching: 1, shadow: true }],
    front(s) { s.layer(1.4, () => fog(s.ctx, s.time, 290, '#c890b8', 0.18, 8, -30)); },
    sound: { wind: 0.65, melody: 0.5 },
    trans: 'wipe',
  },
  'fo-inn': {
    light: { ambient: '#14183c', shade: 0.34, rim: '#ffb860', x: 1 },
    cam: [40, -20, 1.2],
    moves: [{ l: 0, move: 1.6, x: 90, y: -50, z: 1.75 }, { l: 1, move: 2, x: -50, y: -50, z: 1.75 }, { l: 2, move: 2, x: 60, y: -20, z: 1.35 }, { l: 3, move: 3, x: -80, y: 30, z: 1.2 }],
    back(s) {
      const c = s.ctx;
      digne(s);
      s.layer(1, () => {
        house(c, 220, GROUND - 4, 300, 380, { wall: '#6a4a44', roof: '#2a1a1e', lit: 0.65, seed: 91, timber: true });
        rect(c, 120, GROUND - 190, 110, 188, linear(c, 0, GROUND - 190, 0, GROUND, [[0, '#ffd080'], [1, '#b05c24']]));
        glow(c, 175, GROUND - 90, 280, '#ffa040', 0.45);
        rect(c, 150, GROUND - 270, 160, 42, '#2c1810');
        line(c, [[170, GROUND - 249], [290, GROUND - 249]], '#d8a850', 5);
        const dog = s.since(3);
        if (dog > 0) {
          poly(c, [[-340, GROUND], [-340, GROUND - 76], [-282, GROUND - 120], [-222, GROUND - 76], [-222, GROUND]], '#3c2820');
          ellipse(c, -250 + ease(ramp(dog, 0, 1)) * 40, GROUND - 28, 34, 24, '#120c0c');
          ellipse(c, -216 + ease(ramp(dog, 0, 1)) * 40, GROUND - 52, 19, 17, '#120c0c');
          ellipse(c, -208 + ease(ramp(dog, 0, 1)) * 40, GROUND - 56, 3, 3, '#ffd040');
        }
      });
    },
    actors: [
      { who: 'innkeeper', voice: 'inn', x: 165, face: -1, mood: 'angry', keys: [{ l: 0, pose: 'point' }, { l: 1, pose: 'stand' }, { l: 2, pose: 'point' }, { l: 3, pose: 'stand', move: 1.5, x: 200, alpha: 0 }] },
      { who: 'valConvict', voice: 'val', x: -60, face: 1, pose: 'hunch', mood: 'sad', keys: [{ l: 1, pose: 'offer', item: 'coin', mood: 'calm' }, { l: 2, pose: 'hunch', item: null, mood: 'sad' }, { l: 3, d: 1, face: -1, move: 3.5, x: -190 }] },
    ],
    sfx: [[0, 'wood', 0], [3, 'wood', 0.2]],
    sound: { wind: 0.4, crowd: 0.2 },
  },
  'fo-bench': {
    light: LIGHT.night,
    cam: [-50, 20, 1.3],
    moves: [{ l: 1, move: 2.5, x: -20, y: -20, z: 1.5 }, { l: 2, move: 6, x: 80, y: -30, z: 1.05 }],
    back(s) {
      const c = s.ctx;
      digne(s, s.on(2, 4, 3) * 0.7);
      s.layer(1, () => bench(c, -150, 260, '#4a4a62'));
    },
    actors: [
      { who: 'valConvict', voice: 'val', x: -62, y: 168, pose: 'lie', mood: 'closed', keys: [{ l: 1, d: 1, pose: 'sit', x: -150, y: 232, mood: 'sad', move: 1.4 }, { l: 2, pose: 'stand', y: 230, move: 1.2 }, { l: 2, d: 2, x: 90, move: 5, pose: 'hunch' }] },
      { who: 'woman', voice: 'woman', x: -390, face: 1, item: 'lantern', pose: 'hold', mood: 'tender', keys: [{ l: 0, d: 3, move: 3, x: -290 }, { l: 1, pose: 'point', item: null }, { l: 2, d: 1, move: 4, x: -420, face: -1, pose: 'walk' }] },
    ],
    front(s) { s.layer(1.3, () => snow(s.ctx, s.time, 30, 0.35, 0.7)); },
    sound: { wind: 0.55, melody: 0.7 },
    sfx: [[0, 'bell', 0.4]],
  },

  /* ---------------- II. The Candlesticks ---------------- */
  'ev-door': {
    light: LIGHT.candle,
    cam: [-60, -50, 1.5],
    moves: [{ l: 1, move: 2.4, x: 70, y: -50, z: 1.6 }, { l: 2, move: 2, x: 190, y: -40, z: 1.7 }],
    back(s) {
      const c = s.ctx;
      bishopRoom(s);
      s.layer(1, () => {
        rect(c, -420, -150, 190, 378, linear(c, 0, -150, 0, 230, [[0, '#101c48'], [1, '#1c2c60']]));
        stars(c, s.time, 0);
        for (let i = 0; i < 20; i++) ellipse(c, -410 + hash(i) * 170, -130 + ((s.time * 40 + hash(i * 3) * 340) % 340), 2.4, 2.4, '#dce8ff');
        rect(c, -436, -170, 222, 22, '#2c180c');
        rect(c, -436, -170, 18, 400, '#2c180c');
        rect(c, -232, -170, 18, 400, '#2c180c');
      });
    },
    actors: [
      { who: 'valConvict', voice: 'val', x: -270, face: 1, pose: 'hunch', mood: 'sad', keys: [{ l: 0, d: 1, move: 3, x: -160, pose: 'stand' }, { l: 0, d: 4, pose: 'offer', item: 'passport' }, { l: 1, pose: 'stand', item: null, mood: 'calm' }] },
      { who: 'myriel', voice: 'myr', x: 70, face: -1, mood: 'tender', keys: [{ l: 1, pose: 'offer' }, { l: 2, pose: 'stand' }] },
      { who: 'magloire', voice: 'mag', x: 250, face: -1, mood: 'calm', keys: [{ l: 2, pose: 'cower', mood: 'fear', move: 0.5 }] },
    ],
    sfx: [[0, 'door', 0]],
    sound: { fire: 0.7 },
    trans: 'light',
  },
  'ev-table': {
    light: LIGHT.candle,
    cam: [0, -20, 1.25],
    moves: [{ l: 1, move: 2, x: -100, y: -10, z: 2.1 }, { l: 2, move: 2, x: 100, y: -10, z: 2.1 }, { l: 3, move: 7, x: 0, y: -20, z: 1.1 }],
    back(s) { bishopRoom(s); s.layer(1, () => { chair(s.ctx, -190, 1); chair(s.ctx, 190, -1); }); },
    actors: [
      { who: 'valConvict', voice: 'val', x: -180, face: 1, pose: 'sit', mood: 'calm', keys: [{ l: 1, mood: 'cry' }, { l: 3, mood: 'calm', pose: 'read', item: 'bread' }, { l: 3, d: 4, mood: 'closed', pose: 'sit', item: null }] },
      { who: 'myriel', voice: 'myr', x: 180, face: -1, pose: 'sit', mood: 'tender', keys: [{ l: 2, mood: 'joy' }, { l: 3, mood: 'tender', pose: 'pray' }] },
      { who: 'magloire', x: 340, face: -1, pose: 'hold', item: 'silver', mood: 'sad', s: 0.94, y: 222 },
    ],
    mid(s) { s.layer(1, () => supper(s)); },
    sound: { fire: 0.6, melody: 0.8 },
  },
  'ev-night': {
    light: LIGHT.night,
    cam: [-90, 0, 1.35],
    moves: [{ l: 1, move: 2.5, x: -40, y: -50, z: 2.2 }, { l: 2, move: 4, x: 60, y: -20, z: 1.15 }],
    back(s) {
      const c = s.ctx;
      bishopRoom(s, { night: true });
      s.layer(1, () => {
        bed(c, -250, 230);
        const cx = 110;
        rect(c, cx - 70, GROUND - 190, 140, 190, '#241830');
        rect(c, cx - 58, GROUND - 176, 116, 80, '#0c0814');
        const shine = 0.5 + 0.5 * Math.sin(s.time * 2.1);
        if (s.since(2) < 2.4) for (let i = 0; i < 4; i++) ellipse(c, cx - 30 + i * 20, GROUND - 106 - i * 3, 24, 6, '#d4e0f0');
        glow(c, cx, GROUND - 120, 110 + shine * 50, '#b8d0ff', s.since(2) < 2.4 ? 0.4 : 0);
      });
    },
    actors: [
      { who: 'valConvict', voice: 'val', x: -220, y: 232, face: 1, pose: 'sit', mood: 'fear', keys: [{ l: 1, mood: 'angry', pose: 'think' }, { l: 2, pose: 'stand', move: 0.8, x: -40 }, { l: 2, d: 1.6, pose: 'reach', move: 0.8, x: 20 }, { l: 2, d: 2.6, pose: 'run', item: 'basket', move: 2.8, x: 470, mood: 'fear' }] },
    ],
    sfx: [[0, 'bell', 0.3], [2, 'wood', 1.8]],
    sound: { wind: 0.25, drone: 0.7 },
    trans: 'black',
  },
  'ev-morning': {
    light: LIGHT.dawn,
    cam: [0, -30, 1.15],
    moves: [{ l: 0, move: 1.6, x: -80, y: -40, z: 1.55 }, { l: 1, move: 2, x: 60, y: -40, z: 1.7 }, { l: 2, move: 2, x: 10, y: -20, z: 1.05 }],
    back(s) { bishopRoom(s, { morning: true }); },
    actors: [
      { who: 'magloire', voice: 'mag', x: -140, face: 1, pose: 'raise', mood: 'fear', keys: [{ l: 1, pose: 'stand', mood: 'sad' }, { l: 2, x: -330, move: 1.2 }] },
      { who: 'myriel', voice: 'myr', x: 80, face: -1, pose: 'hold', item: 'book', mood: 'tender', keys: [{ l: 2, face: 1, pose: 'stand', item: null, x: -60, move: 1 }] },
      { who: 'gendarme', voice: 'gend', x: 640, face: -1, mood: 'calm', keys: [{ l: 2, move: 2, x: 320 }] },
      { who: 'valConvict', voice: 'val', x: 620, face: -1, pose: 'hunch', mood: 'fear', keys: [{ l: 2, move: 2, x: 190 }] },
      { who: 'gendarme', x: 680, face: -1, item: 'silver', pose: 'hold', keys: [{ l: 2, move: 2.2, x: 430 }] },
    ],
    sfx: [[2, 'door', 0]],
    sound: { birds: 0.7 },
    trans: 'light',
  },
  'ev-gift': {
    light: LIGHT.gold,
    cam: [0, -20, 1.2],
    moves: [{ l: 0, move: 2, x: -20, y: -40, z: 1.6 }, { l: 1, move: 2.2, x: 100, y: -60, z: 2.3 }, { l: 2, move: 2.4, x: -80, y: -60, z: 2.2 }, { l: 3, move: 6, x: 20, y: -10, z: 1.15 }],
    back(s) { bishopRoom(s, { morning: true }); },
    actors: [
      { who: 'myriel', voice: 'myr', x: -140, face: 1, pose: 'offer', item: 'candlestick', mood: 'joy', keys: [{ l: 0, move: 3, x: -60 }, { l: 2, mood: 'tender', pose: 'hold' }, { l: 3, pose: 'offer' }, { l: 3, d: 3, item: null }] },
      { who: 'valConvict', voice: 'val', x: 110, face: -1, pose: 'hunch', mood: 'fear', keys: [{ l: 1, mood: 'cry' }, { l: 3, d: 3, pose: 'hold', item: 'candlestick', mood: 'tender' }] },
      { who: 'gendarme', x: 300, face: -1, keys: [{ l: 1, d: 0.4, x: 560, move: 2.4, face: 1 }] },
    ],
    front(s) { s.layer(1.2, () => { motes(s.ctx, s.time, 50, '#fff0c0', 0.5 + s.on(2) * 0.4, 600); }); },
    mid(s) { s.layer(1, () => thread(s.ctx, [[-40, 40], [10, -30], [40, 20], [90, -10]], s.on(3, 5, 2), s.time, 2.6)); },
    sound: { birds: 0.3, melody: 1 },
    sfx: [[2, 'chime', 0]],
  },
  'ev-gervais': {
    light: LIGHT.dusk,
    cam: [0, -10, 1.05],
    moves: [{ l: 0, d: 3, move: 2.4, x: -10, y: 70, z: 1.7 }, { l: 1, move: 1.6, x: 60, y: -10, z: 1.8 }, { l: 2, move: 0.9, x: -60, y: -60, z: 2.1 }, { l: 3, move: 4, x: 0, y: -40, z: 1 }],
    back(s) {
      const c = s.ctx;
      duskSky(s, '#201a48', '#8a3050', '#ff7a40');
      s.layer(0.06, () => { sun(c, -180, 70, 70, '#ffb050', '#ff5028'); clouds(c, s.time, -180, '#501c40', 0.6, 8, 8, 6); });
      s.layer(0.25, () => ridge(c, 130, 80, '#5a2440', 6, 330));
      s.layer(0.55, () => { ridge(c, 190, 30, '#34142c', 9, 200); tree(c, 360, 200, 300, '#1c0818', null, 77, s.time); });
      s.layer(1, () => {
        ground(c, GROUND - 6, '#3c1828', '#080206');
        for (let i = 0; i < 60; i++) { const x = -700 + hash(i * 4) * 1400; line(c, [[x, GROUND + hash(i) * 90], [x + 6 + Math.sin(s.time + i) * 4, GROUND - 22 + hash(i) * 90]], '#541c28', 2.5); }
        const roll = ease(ramp(s.since(0), 2.4, 4.4));
        if (roll > 0) { const x = lerp(230, 10, roll); ellipse(c, x, GROUND - 3 - Math.abs(Math.sin(roll * 14)) * 24 * (1 - roll), 9, 7, '#ffe890'); glow(c, x, GROUND - 6, 44, '#ffd040', 0.8); }
      });
    },
    actors: [
      { who: 'valConvict', voice: 'val', x: -70, face: 1, pose: 'sit', mood: 'closed', y: 226, keys: [{ l: 0, d: 4, pose: 'stand', x: -26, mood: 'angry', move: 0.7 }, { l: 2, pose: 'point' }, { l: 3, pose: 'hunch', mood: 'fear', d: 2 }] },
      { who: 'gervais', voice: 'gerv', x: 330, face: -1, pose: 'walk', mood: 'joy', keys: [{ l: 0, move: 4.5, x: 150 }, { l: 1, pose: 'reach', mood: 'cry', x: 100, move: 0.8 }, { l: 2, d: 0.5, pose: 'cower', mood: 'fear' }, { l: 3, pose: 'run', face: 1, x: 760, move: 4 }] },
    ],
    sound: { wind: 0.6, birds: 0.2, drone: 0.5 },
    sfx: [[0, 'coin', 2.6], [2, 'hit', 0]],
    trans: 'wipe',
  },
  'ev-weep': {
    light: LIGHT.night,
    cam: [0, -10, 1],
    moves: [{ l: 1, move: 3, x: -20, y: 10, z: 1.9 }, { l: 2, move: 6, x: 60, y: -30, z: 1.05 }],
    back(s) {
      const c = s.ctx;
      const dawn = s.on(2, 7);
      nightSky(s, '#03061c', '#10205a', mix('#2c3c74', '#d8789a', dawn));
      s.layer(0.07, () => { stars(c, s.time, 220, 1 - dawn * 0.7, 120); });
      s.layer(0.25, () => ridge(c, 140, 90, '#141c44', 6, 330));
      s.layer(0.7, () => { if (dawn > 0.02) { c.save(); c.globalAlpha = dawn; digne(s, 0.25); c.restore(); } });
      s.layer(1, () => { if (dawn < 0.5) ground(c, GROUND - 6, '#1c2048', '#04040c'); });
    },
    actors: [
      { who: 'valConvict', voice: 'val', x: -120, face: 1, pose: 'raise', mood: 'fear', keys: [{ l: 0, d: 2.4, face: -1, move: 0.4 }, { l: 1, pose: 'kneel', face: 1, x: -20, mood: 'cry', move: 1.4 }, { l: 2, x: 90, pose: 'pray', move: 0.2 }] },
    ],
    mid(s) { s.layer(1, () => thread(s.ctx, [[-360, -330], [-180, -200], [-220, -40], [-60, -60], [20, 20], [200, 90], [215, 170]], s.on(2, 8), s.time, 3)); },
    sound: { wind: 0.5, melody: 1 },
    sfx: [[1, 'chime', 1]],
  },
};
