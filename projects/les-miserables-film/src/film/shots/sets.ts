/* Places the film returns to. Each paints its background layers. */
import { GROUND, X0, X1, candlestick, chair, cobbles, fireplace, flowers, godray, ground, house, lamp, moon, paris, ridge, room, sky, stars, street, table, tree, water, windowFrame, ironGate, bench, sun, clouds } from '../draw/scenery';
import { blobPath, ellipse, glow, hash, line, linear, mix, poly, rect, rgba, soft } from '../draw/core';
import { fog, motes } from '../draw/weather';
import type { Light, S } from './types';

export const LIGHT = {
  candle: { ambient: '#3a1c14', shade: 0.2, rim: '#ffb860', x: 1 } as Light,
  night: { ambient: '#101a3a', shade: 0.4, rim: '#9cc0ff', x: 1 } as Light,
  dusk: { ambient: '#33203c', shade: 0.28, rim: '#ffa868', x: 1 } as Light,
  dawn: { ambient: '#4a2c44', shade: 0.18, rim: '#ffd0a0', x: -1 } as Light,
  day: { ambient: '#6a6a80', shade: 0.04, rim: '#fff2d0', x: 1 } as Light,
  snow: { ambient: '#223050', shade: 0.28, rim: '#dceaff', x: -1 } as Light,
  fire: { ambient: '#3a0e0a', shade: 0.28, rim: '#ff7a38', x: -1 } as Light,
  sewer: { ambient: '#0e1e12', shade: 0.46, rim: '#b8d878', x: 1 } as Light,
  gold: { ambient: '#6a3a20', shade: 0.1, rim: '#ffe2a0', x: -1 } as Light,
  cold: { ambient: '#303848', shade: 0.2, rim: '#c8d8e8', x: 1 } as Light,
};

export function nightSky(s: S, top = '#050a1e', mid = '#12234a', low = '#35426a'): void {
  s.layer(0, () => sky(s.ctx, [[0, top], [0.62, mid], [1, low]]));
}

export function duskSky(s: S, top: string, mid: string, low: string): void {
  s.layer(0, () => sky(s.ctx, [[0, top], [0.55, mid], [1, low]]));
}

/** The street in Digne: houses, a lamp and one little door. */
export function digne(s: S, openDoor = 0): void {
  const c = s.ctx;
  nightSky(s, '#070b22', '#1c2c55', '#6a4a68');
  s.layer(0.1, () => { stars(c, s.time, 120); moon(c, -230, -330, 34); });
  s.layer(0.25, () => ridge(c, 20, 280, '#18203e', 3, 220));
  s.layer(0.5, () => { street(c, 190, 11, { wall: '#2c2a44', roof: '#151228', lit: 0.3 }, 0.9); ground(c, 188, '#1c1a2c', '#08070e'); });
  s.layer(1, () => {
    ground(c, GROUND - 6, '#2c2838', '#0a080e');
    cobbles(c, GROUND, '#7a7090');
    house(c, 215, GROUND - 4, 250, 330, { wall: '#5a4a50', roof: '#241a26', lit: 0.12, seed: 5, chimney: true });
    rect(c, 178, GROUND - 118, 74, 116, '#241208');
    if (openDoor > 0) {
      rect(c, 181, GROUND - 115, 68 * openDoor, 112, linear(c, 0, GROUND - 115, 0, GROUND, [[0, '#ffd890'], [1, '#d8782c']]));
      glow(c, 215, GROUND - 60, 320 * openDoor, '#ffb050', 0.5);
      soft(c, 150, GROUND + 18, 200, 40, '#ffb050', 0.4 * openDoor);
    }
    lamp(c, -290, GROUND + 4, 210, s.time);
  });
}

/** The bishop's dining room. */
export function bishopRoom(s: S, opts: { night?: boolean; morning?: boolean; table?: boolean; candles?: boolean } = {}): void {
  const c = s.ctx;
  const wall = opts.morning ? '#a8907c' : opts.night ? '#232240' : '#6a4438';
  s.layer(0.55, () => {
    room(c, wall, opts.morning ? '#6a4a34' : '#3a2216', 190);
    windowFrame(c, -190, -150, 150, 260, opts.morning ? '#ffe9c0' : '#0e1c44', opts.morning ? '#ffc890' : '#2c4478', '#2a180e', true);
    if (!opts.morning) { moon(c, -220, -210, 17); stars(c, s.time, 0); }
    rect(c, 120, -190, 8, 130, '#3a2410');
    rect(c, 90, -158, 68, 8, '#3a2410');
    fireplace(c, 290, 192, s.time, 0.9, opts.morning ? 0 : opts.night ? 0.25 : 1);
  });
  s.layer(0.7, () => {
    if (opts.morning) godray(c, -190, -270, 130, 420, 620, 260, '#ffe0a8', 0.22);
    else if (opts.night) godray(c, -190, -270, 130, 360, 620, 240, '#8fb0ff', 0.2);
  });
  s.layer(1, () => { ground(c, GROUND - 4, opts.night ? '#1c1424' : '#442a1a', '#0c0608'); });
}

export function supper(s: S, lit = true): void {
  const c = s.ctx;
  table(c, 0, GROUND - 92, 340, '#4a2c18', '#e8e0d0');
  candlestick(c, -80, GROUND - 96, 112, s.time, 1, lit);
  candlestick(c, 80, GROUND - 96, 112, s.time, 2, lit);
  ellipse(c, -34, GROUND - 99, 24, 6, '#d8dee6');
  ellipse(c, 34, GROUND - 99, 24, 6, '#d8dee6');
  ellipse(c, 0, GROUND - 110, 20, 13, '#b8742e');
}

export function snowTown(s: S): void {
  const c = s.ctx;
  nightSky(s, '#0a1024', '#273a5c', '#7a8aa8');
  s.layer(0.2, () => { stars(c, s.time, 50, 0.5); ridge(c, 60, 130, '#33445f', 9, 260); });
  s.layer(0.45, () => { street(c, 160, 23, { wall: '#3c4258', roof: '#252b40', lit: 0.32, snow: true }, 0.75); ground(c, 158, '#7f90ae', '#27304a'); });
  s.layer(0.7, () => { street(c, 196, 41, { wall: '#2a2a40', roof: '#171728', lit: 0.2, snow: true }, 1.05, [-330, 330]); fog(c, s.time, 170, '#9ab0d0', 0.16); });
  s.layer(1, () => {
    ground(c, GROUND - 6, '#c8d6ea', '#3a4668');
    for (let i = 0; i < 26; i++) soft(c, -900 + i * 74 + hash(i) * 40, GROUND + 30 + hash(i * 3) * 120, 70, 18, i % 2 ? '#ffffff' : '#5a6a90', 0.35);
    lamp(c, -250, GROUND + 8, 250, s.time);
  });
}

/** The forest at Christmas, under many stars. */
export function forest(s: S): void {
  const c = s.ctx;
  nightSky(s, '#02061a', '#0c1c48', '#2c4a7a');
  s.layer(0.08, () => { stars(c, s.time, 220, 1, 150); moon(c, 190, -330, 30, '#e8f0ff'); });
  s.layer(0.25, () => { ridge(c, 110, 150, '#12234a', 5, 180); for (let i = 0; i < 14; i++) tree(c, -820 + i * 128 + hash(i) * 60, 150, 190 + hash(i * 2) * 120, '#0e1a38', null, i + 3, s.time); });
  s.layer(0.55, () => { ground(c, 186, '#2c3e66', '#0a1028'); for (let i = 0; i < 8; i++) { const x = -760 + i * 220 + hash(i * 5) * 70; if (Math.abs(x) > 150) tree(c, x, 196, 380 + hash(i) * 180, '#08102a', null, i + 21, s.time); } fog(c, s.time, 190, '#6a88c0', 0.2); });
  s.layer(1, () => { ground(c, GROUND - 6, '#7288b4', '#10183a'); });
}

export function forestFront(s: S): void {
  s.layer(1.45, () => { tree(s.ctx, -470, GROUND + 130, 760, '#03060f', null, 71, s.time); tree(s.ctx, 500, GROUND + 160, 700, '#03060f', null, 88, s.time); });
}

/** The inn of the Thénardiers: beams, fire, bottles. */
export function inn(s: S): void {
  const c = s.ctx;
  s.layer(0.55, () => {
    room(c, '#7a4a2c', '#3c2414', 190);
    for (const x of [-420, -140, 140, 420]) rect(c, x - 12, -640, 24, 700, '#2c180c');
    rect(c, -700, -330, 1400, 30, '#2c180c');
    fireplace(c, -250, 192, s.time, 1.15);
    rect(c, 150, -150, 230, 10, '#2c180c');
    for (let i = 0; i < 8; i++) { const x = 165 + i * 28; ellipse(c, x, -172, 9, 22, ['#2e6a3a', '#7a2a24', '#8a6a24'][i % 3]); line(c, [[x, -192], [x, -208]], '#1c3020', 5); }
    windowFrame(c, 260, 10, 110, 150, '#0a1434', '#24366a');
  });
  s.layer(1, () => ground(c, GROUND - 4, '#4a2e1a', '#0e0806'));
}

/** Paris roofs at night. */
export function roofs(s: S, cathedral = true): void {
  const c = s.ctx;
  nightSky(s, '#080a26', '#2c2458', '#9a5a6a');
  s.layer(0.08, () => { stars(c, s.time, 130, 0.8, -60); moon(c, -190, -310, 40, '#ffeacc'); clouds(c, s.time, -220, '#5a3a6a', 0.35, 7, 6, 2); });
  s.layer(0.3, () => paris(c, 70, '#2a2048', '#ffc878', 4, 0.8, cathedral));
  s.layer(0.55, () => paris(c, 170, '#1a1434', '#ffb058', 19, 1.1));
}

export function alley(s: S): void {
  const c = s.ctx;
  roofs(s, false);
  s.layer(0.75, () => { house(c, -420, 200, 320, 620, { wall: '#262042', roof: '#100c22', lit: 0.1, seed: 31 }); house(c, 440, 200, 330, 560, { wall: '#221c3c', roof: '#100c22', lit: 0.12, seed: 33 }); });
  s.layer(1, () => { ground(c, GROUND - 6, '#2a2440', '#07050e'); cobbles(c, GROUND, '#7a68a0'); });
}

export function luxembourg(s: S): void {
  const c = s.ctx;
  duskSky(s, '#5a8ac8', '#a8cce0', '#ffe6b8');
  s.layer(0.08, () => { sun(c, 220, -250, 36, '#fff0b8', '#ffd878'); clouds(c, s.time, -280, '#ffffff', 0.5, 8, 6, 5); });
  s.layer(0.25, () => { paris(c, 100, '#8aa0bc', '#fff0c0', 9, 0.65, true); });
  s.layer(0.45, () => { ground(c, 150, '#7aa868', '#2c4a2c'); for (let i = 0; i < 16; i++) tree(c, -900 + i * 120, 170, 200, '#3c5040', '#6c9c58', i + 40, s.time); });
  s.layer(0.75, () => { ground(c, 200, '#8cb468', '#34502c'); for (const x of [-430, -250, 330, 480]) tree(c, x, 214, 390, '#3a2c24', '#8cb850', x, s.time); });
  s.layer(1, () => {
    ground(c, GROUND - 4, '#d8c090', '#6a5438');
    for (let i = 0; i < 90; i++) ellipse(c, -700 + hash(i) * 1400, GROUND + 4 + hash(i * 3) * 200, 4 + hash(i * 5) * 5, 2, rgba(i % 2 ? '#ffffff' : '#5a4430', 0.3));
    bench(c, 150, 250, '#2c4434');
  });
}

export function plumet(s: S, gate = true): void {
  const c = s.ctx;
  nightSky(s, '#060c2a', '#162c5c', '#4a6890');
  s.layer(0.08, () => { stars(c, s.time, 150, 0.8, 0); moon(c, 180, -320, 44); });
  s.layer(0.35, () => { ridge(c, 80, 110, '#14264a', 15, 150); house(c, -290, 170, 240, 330, { wall: '#1e2c50', roof: '#0c1430', lit: 0.2, seed: 61 }); });
  s.layer(0.65, () => { ground(c, 180, '#16363c', '#06121a'); for (const x of [-420, -230, 260, 440]) tree(c, x, 200, 330, '#0a1a24', '#1c5048', x, s.time); });
  s.layer(0.85, () => { if (gate) ironGate(c, 0, 760, 250, '#0c1226'); flowers(c, -230, 214, 320, 34, '#c890d8', 4, s.time); flowers(c, 260, 216, 300, 30, '#f0a8c0', 9, s.time); });
  s.layer(1, () => { ground(c, GROUND - 4, '#1c3c3c', '#040c12'); motes(c, s.time, 40, '#d8ffb0', 0.7, 520); });
}

export function plumetFront(s: S): void {
  s.layer(1.35, () => { flowers(s.ctx, -330, GROUND + 130, 300, 22, '#8a60a8', 21, s.time); flowers(s.ctx, 340, GROUND + 140, 300, 20, '#b06888', 37, s.time); });
}

export function cafe(s: S): void {
  const c = s.ctx;
  s.layer(0.55, () => {
    room(c, '#5c3c30', '#341e14', 190);
    rect(c, -330, -260, 250, 190, '#d8c498');
    for (let i = 0; i < 9; i++) line(c, [[-320 + hash(i) * 230, -250 + hash(i * 2) * 170], [-320 + hash(i * 3) * 230, -250 + hash(i * 4) * 170]], 'rgba(120,60,30,0.55)', 3);
    windowFrame(c, 230, -150, 150, 210, '#1c1c44', '#6a3c5a');
  });
  s.layer(0.75, () => { for (const x of [-170, 170]) { line(c, [[x, -640], [x, -250]], '#1a100a', 3); poly(c, [[x - 44, -216], [x + 44, -216], [x + 20, -250], [x - 20, -250]], '#2a3c2c'); glow(c, x, -205, 330, '#ffb858', 0.45); ellipse(c, x, -212, 14, 9, '#ffe8b0'); } });
  s.layer(1, () => ground(c, GROUND - 4, '#3c2416', '#0c0604'));
}

/** The narrow street of the barricade. */
export function barricadeStreet(s: S, dawn = false): void {
  const c = s.ctx;
  if (dawn) duskSky(s, '#2a2c54', '#a0607a', '#ffc890');
  else nightSky(s, '#0c0a1c', '#281a34', '#8a3a30');
  s.layer(0.25, () => paris(c, 60, dawn ? '#5c4060' : '#1c1228', '#ff9a50', 27, 0.8));
  s.layer(0.55, () => {
    house(c, -390, 185, 300, 560, { wall: dawn ? '#6a4c60' : '#2a1c30', roof: '#120a18', lit: 0.2, seed: 71, timber: true });
    house(c, 400, 185, 320, 480, { wall: dawn ? '#6a4a54' : '#321e2c', roof: '#120a18', lit: 0.42, light: '#ffb060', seed: 73 });
    ground(c, 180, '#2a1a24', '#0a060a');
  });
  s.layer(1, () => { ground(c, GROUND - 6, dawn ? '#5a4454' : '#2c1c22', '#080406'); cobbles(c, GROUND, dawn ? '#c89890' : '#8a5a54'); });
}

/** The heap of Paris: wheels, chairs, barrels, stones. */
export { barricadeHeap } from './heap';

export function sewerSet(s: S, exit = 0): void {
  const c = s.ctx;
  s.layer(0, () => rect(c, X0, -1300, X1 - X0, 2600, '#040a06'));
  /* Vaults receding towards a faint glow. */
  const walk = (s.time * 0.09) % 1;
  for (let i = 7; i >= 0; i--) {
    const d = i + 1 - walk;
    const k = 1 / (0.5 + d * 0.42);
    s.layer(0.15 + k * 0.5, () => {
      const w = 780 * k;
      const top = GROUND - 800 * k;
      c.beginPath();
      c.moveTo(-w / 2, GROUND + 30 * k);
      c.lineTo(-w / 2, top + w / 2);
      c.arc(0, top + w / 2, w / 2, Math.PI, 0);
      c.lineTo(w / 2, GROUND + 30 * k);
      c.strokeStyle = mix('#33482a', '#08120a', 1 - k * 0.7);
      c.lineWidth = 70 * k + 8;
      c.stroke();
      c.strokeStyle = rgba('#b8d878', 0.08 + k * 0.1);
      c.lineWidth = 3;
      c.stroke();
    });
    if (i === 7) s.layer(0.2, () => { glow(c, 0, -10, 230 + exit * 400, exit > 0 ? '#fff2c0' : '#7a9a50', 0.4 + exit * 0.5); });
  }
  s.layer(0.9, () => water(c, GROUND - 36, '#1c301a', '#020603', s.time, [[0, exit > 0 ? '#fff0b8' : '#8aac58', 1.2 + exit]]));
}

export function riverNight(s: S, bridge = true): void {
  const c = s.ctx;
  nightSky(s, '#02041a', '#0a1644', '#2c3c74');
  s.layer(0.06, () => { stars(c, s.time, 260, 1, 80); });
  s.layer(0.3, () => { paris(c, 66, '#101840', '#ffd080', 33, 0.55, true); });
  s.layer(0.45, () => water(c, 100, '#142456', '#020410', s.time, [[-260, '#ffb860', 0.7], [90, '#ffd890', 0.5], [330, '#ffb860', 0.8], [190, '#cfe0ff', 0.5]]));
  if (bridge) {
    s.layer(0.65, () => {
      for (let i = -3; i <= 3; i++) {
        const x = i * 300;
        c.beginPath();
        c.rect(x - 152, 62, 304, 120);
        c.moveTo(x + 116, 184);
        c.arc(x, 184, 116, 0, Math.PI, true);
        c.fillStyle = '#0c1030';
        c.fill('evenodd');
      }
    });
  }
}

export function salon(s: S): void {
  const c = s.ctx;
  s.layer(0.5, () => {
    room(c, '#c08a64', '#7a4a2c', 190);
    for (const x of [-330, 0, 330]) windowFrame(c, x, -150, 150, 320, '#1c2658', '#6a4a80', '#f0dcb0', true);
    for (const x of [-170, 170]) { rect(c, x - 22, -420, 44, 610, '#e8cc9c'); rect(c, x - 34, -430, 68, 26, '#f4e0b4'); }
  });
  s.layer(0.75, () => { for (const x of [-170, 170]) glow(c, x, -190, 260, '#ffc878', 0.34); });
  s.layer(1, () => ground(c, GROUND - 4, '#9a6a44', '#24120c'));
}

export function bareRoom(s: S, light = 1): void {
  const c = s.ctx;
  s.layer(0.55, () => { room(c, mix('#14121c', '#5a4440', light), '#241a18', 190); windowFrame(c, 220, -140, 130, 220, '#080c22', '#1c2850', '#140c0a'); stars(c, s.time, 0); });
  s.layer(0.7, () => godray(c, 220, -250, 110, 300, 560, -280, '#8aa8f0', 0.16));
  s.layer(1, () => ground(c, GROUND - 4, '#2a1e1a', '#060406'));
}

