/* Places the film returns to. Each paints its background layers. */
import { GROUND, X0, X1, Y0, Y1, clouds, ground, godray, moon, ridge, room, sky, stars, sun, tree, water, flame, candle } from '../draw/scenery';
import { TAU, blobPath, ellipse, glow, hash, line, linear, mix, mod, noise, poly, rect, rgba, soft, type Ctx, type Pt } from '../draw/core';
import { fog, motes } from '../draw/weather';
import type { Light, S } from './types';

export const LIGHT = {
  palace: { ambient: '#3a1c2c', shade: 0.14, rim: '#ffd890', x: 1 } as Light,
  hall: { ambient: '#4a2a34', shade: 0.1, rim: '#ffe2a0', x: -1 } as Light,
  lamp: { ambient: '#2a140c', shade: 0.22, rim: '#ffb060', x: 1 } as Light,
  prison: { ambient: '#0c1430', shade: 0.4, rim: '#a8c8ff', x: -1 } as Light,
  night: { ambient: '#101a3a', shade: 0.42, rim: '#9cc0ff', x: 1 } as Light,
  rain: { ambient: '#141c30', shade: 0.4, rim: '#c0d4f0', x: -1 } as Light,
  dawn: { ambient: '#4a3040', shade: 0.16, rim: '#ffd0a0', x: -1 } as Light,
  day: { ambient: '#6a7080', shade: 0.04, rim: '#fff4d8', x: 1 } as Light,
  dusk: { ambient: '#3a1c2c', shade: 0.24, rim: '#ffa060', x: 1 } as Light,
  sunset: { ambient: '#4a1c14', shade: 0.2, rim: '#ff9850', x: 1 } as Light,
  holy: { ambient: '#6a5a6a', shade: 0.06, rim: '#fff4d0', x: -1 } as Light,
  stone: { ambient: '#6a6458', shade: 0.06, rim: '#fff0d0', x: -1 } as Light,
};

export function duskSky(s: S, top: string, mid: string, low: string): void {
  s.layer(0, () => sky(s.ctx, [[0, top], [0.55, mid], [1, low]]));
}
export function nightSky(s: S, top = '#050a1e', mid = '#14244a', low = '#3a3a62'): void {
  s.layer(0, () => sky(s.ctx, [[0, top], [0.62, mid], [1, low]]));
}

/* ------------------------------------------------------------------ */
/* Roman architecture                                                  */
/* ------------------------------------------------------------------ */

/** A column with base, fluted shaft and capital. */
export function column(ctx: Ctx, x: number, base: number, h: number, w: number, color: string, gold?: string): void {
  const shaft = linear(ctx, x - w / 2, 0, x + w / 2, 0, [[0, mix(color, '#100810', 0.5)], [0.38, mix(color, '#ffffff', 0.18)], [0.62, color], [1, mix(color, '#100810', 0.45)]]);
  rect(ctx, x - w * 0.7, base - 22, w * 1.4, 22, mix(color, '#100810', 0.2));
  rect(ctx, x - w * 0.6, base - 34, w * 1.2, 14, mix(color, '#ffffff', 0.08));
  poly(ctx, [[x - w / 2, base - 34], [x - w * 0.44, base - h + 40], [x + w * 0.44, base - h + 40], [x + w / 2, base - 34]], shaft);
  for (let i = 1; i < 5; i++) line(ctx, [[x - w / 2 + (i * w) / 5, base - 40], [x - w * 0.44 + (i * w * 0.88) / 5, base - h + 44]], rgba('#000000', 0.12), 2);
  rect(ctx, x - w * 0.62, base - h + 18, w * 1.24, 24, gold ?? mix(color, '#ffffff', 0.15));
  rect(ctx, x - w * 0.8, base - h, w * 1.6, 20, gold ?? mix(color, '#ffffff', 0.22));
  for (const d of [-1, 1]) ellipse(ctx, x + d * w * 0.58, base - h + 28, w * 0.16, w * 0.16, gold ?? mix(color, '#ffffff', 0.25));
}

/** A round arch on two piers. */
export function arch(ctx: Ctx, x: number, base: number, w: number, h: number, color: string, depth = 26): void {
  const p = new Path2D();
  p.rect(x - w / 2 - depth, base - h - w / 2 - depth, w + depth * 2, h + w / 2 + depth);
  p.moveTo(x + w / 2, base);
  p.lineTo(x + w / 2, base - h);
  p.arc(x, base - h, w / 2, 0, Math.PI, true);
  p.lineTo(x - w / 2, base);
  p.closePath();
  ctx.fillStyle = color;
  ctx.fill(p, 'evenodd');
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI + (i / 8) * Math.PI;
    line(ctx, [[x + Math.cos(a) * w / 2, base - h + Math.sin(a) * w / 2], [x + Math.cos(a) * (w / 2 + depth), base - h + Math.sin(a) * (w / 2 + depth)]], rgba('#000000', 0.25), 2);
  }
}

const mosaics = new Map<string, HTMLCanvasElement>();

/** A golden mosaic: little tiles that catch the light (tiles drawn once, shine animated). */
export function mosaic(ctx: Ctx, x: number, y: number, w: number, h: number, base: string, t: number, star = true): void {
  const key = `${w}x${h}:${base}:${star}`;
  let tile = mosaics.get(key);
  if (!tile) {
    tile = document.createElement('canvas');
    tile.width = w;
    tile.height = h;
    const g = tile.getContext('2d')!;
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    const size = 14;
    for (let r = 0; r * size < h; r++) for (let c = 0; c * size < w; c++) {
      const k = hash(r * 131 + c * 7);
      g.fillStyle = rgba(k > 0.5 ? '#fff0b8' : '#000000', k > 0.5 ? 0.06 + hash(k * 9) * 0.14 : 0.08);
      g.fillRect(c * size + 1, r * size + 1, size - 2, size - 2);
    }
    if (star) for (let i = 0; i < 18; i++) {
      g.save();
      g.translate(hash(i * 3.3) * w, hash(i * 7.7) * h);
      g.rotate(Math.PI / 4);
      g.fillStyle = '#ffe8a0';
      g.fillRect(-5, -5, 10, 10);
      g.restore();
    }
    mosaics.set(key, tile);
  }
  ctx.drawImage(tile, x, y);
  /* A slow glint that travels over the gold. */
  for (let i = 0; i < 5; i++) glow(ctx, x + ((hash(i) * w + t * 22 * (0.5 + hash(i + 3))) % w), y + hash(i * 5) * h, 140, '#fff0c0', 0.12 + 0.1 * Math.sin(t * 0.7 + i));
}

export function drape(ctx: Ctx, x: number, top: number, w: number, h: number, color: string, t: number, open = 0.5): void {
  const sway = Math.sin(t * 0.6 + x) * 5;
  for (const side of [-1, 1]) {
    const inner = x + side * w * (0.5 - open * 0.5);
    const outer = x + side * w * 0.55;
    const pts: Pt[] = [[outer, top], [inner, top], [inner + side * 30 + sway, top + h * 0.45], [inner + side * 6 + sway, top + h], [outer, top + h]];
    poly(ctx, pts, linear(ctx, outer, 0, inner, 0, [[0, mix(color, '#100410', 0.5)], [0.6, color], [1, mix(color, '#ffffff', 0.12)]]));
    for (let i = 1; i < 4; i++) line(ctx, [[outer + (inner - outer) * i / 4, top], [outer + (inner - outer) * i / 4 + sway * 0.7, top + h]], rgba('#000000', 0.18), 3);
  }
  rect(ctx, x - w * 0.6, top - 10, w * 1.2, 16, '#c8962e');
}

export function brazier(ctx: Ctx, x: number, base: number, t: number, s = 1, seed = 1): void {
  line(ctx, [[x - 26 * s, base], [x, base - 80 * s], [x + 26 * s, base]], '#3a2a1a', 6 * s);
  line(ctx, [[x, base], [x, base - 80 * s]], '#3a2a1a', 6 * s);
  ctx.fillStyle = linear(ctx, x - 40 * s, 0, x + 40 * s, 0, [[0, '#6a4a1e'], [0.5, '#e8b850'], [1, '#6a4a1e']]);
  ctx.fill(blobPath([[x - 44 * s, base - 96 * s], [x + 44 * s, base - 96 * s], [x + 28 * s, base - 70 * s], [x - 28 * s, base - 70 * s]]));
  for (let i = 0; i < 4; i++) flame(ctx, x + (i - 1.5) * 18 * s, base - 96 * s, (12 + (i % 2) * 6) * s, t, seed + i * 1.7);
  glow(ctx, x, base - 120 * s, 340 * s, '#ff9038', 0.35 + noise(t * 5 + seed) * 0.08);
}

/** Marble floor in perspective with a checker pattern. */
export function marble(ctx: Ctx, y: number, a: string, b: string): void {
  rect(ctx, X0, y, X1 - X0, Y1 - y, linear(ctx, 0, y, 0, y + 500, [[0, a], [1, mix(a, '#05030a', 0.7)]]));
  /* One path for all the light tiles: a single fill. */
  ctx.beginPath();
  for (let r = 0; r < 9; r++) {
    const y0 = y + r * r * 5 + r * 14;
    const y1 = y + (r + 1) * (r + 1) * 5 + (r + 1) * 14;
    const tile = 70 + r * 26;
    for (let c = -16; c <= 16; c++) if ((c + r) % 2 === 0) {
      const xa = c * tile * 0.5;
      const xb = (c + 1) * tile * 0.5;
      ctx.moveTo(xa * (1 + r * 0.02), y0);
      ctx.lineTo(xb * (1 + r * 0.02), y0);
      ctx.lineTo(xb * (1 + (r + 1) * 0.02), y1);
      ctx.lineTo(xa * (1 + (r + 1) * 0.02), y1);
      ctx.closePath();
    }
  }
  ctx.fillStyle = rgba(b, 0.45);
  ctx.fill();
  /* Reflections. */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  rect(ctx, X0, y, X1 - X0, 3, rgba('#ffe8c0', 0.12));
  ctx.restore();
}

export function throne(ctx: Ctx, x: number, base: number, t: number): void {
  for (let i = 0; i < 4; i++) rect(ctx, x - 230 + i * 22, base - i * 20, 460 - i * 44, 22, mix('#8a6a6a', '#e8d8c8', i * 0.18));
  const top = base - 80;
  rect(ctx, x - 70, top - 230, 140, 200, linear(ctx, 0, top - 230, 0, top, [[0, '#4a103e'], [1, '#2a0820']]));
  ctx.fillStyle = '#d8a83a';
  ctx.fill(blobPath([[x - 84, top - 236], [x, top - 290], [x + 84, top - 236], [x + 80, top - 220], [x - 80, top - 220]]));
  rect(ctx, x - 90, top - 70, 180, 34, '#c8962e');
  for (const d of [-1, 1]) {
    rect(ctx, x + d * 92 - 14, top - 120, 28, 110, '#c8962e');
    ellipse(ctx, x + d * 92, top - 124, 20, 16, '#f0c860');
  }
  glow(ctx, x, top - 240, 170, '#ffd070', 0.3 + Math.sin(t * 0.7) * 0.05);
}

/** The imperial hall in Milan. */
export function hall(s: S, o: { altar?: boolean; throneX?: number; dim?: number } = {}): void {
  const c = s.ctx;
  s.layer(0.4, () => {
    rect(c, X0, Y0, X1 - X0, GROUND + 10 - Y0, linear(c, 0, -640, 0, GROUND, [[0, '#1a0814'], [1, '#4a2430']]));
    /* The apse: gold mosaic, a starry vault. */
    c.save();
    c.beginPath();
    c.moveTo(-300, 180);
    c.lineTo(-300, -250);
    c.arc(0, -250, 300, Math.PI, 0);
    c.lineTo(300, 180);
    c.closePath();
    c.clip();
    mosaic(c, -310, -560, 620, 760, '#a8782a', s.time);
    c.restore();
    for (const x of [-520, -330, 330, 520]) column(c, x, 190, 760, 66, x % 2 ? '#7a2850' : '#6a2248', '#d8a840');
  });
  s.layer(0.55, () => {
    drape(c, -420, -560, 260, 760, '#5a1450', s.time, 0.8);
    drape(c, 420, -560, 260, 760, '#5a1450', s.time, 0.8);
    marble(c, 186, '#6a4a4a', '#e8d0c0');
    throne(c, o.throneX ?? 0, 190, s.time);
  });
  s.layer(0.75, () => {
    godray(c, -160, -640, 140, 420, 900, 120, '#ffe0a0', 0.12);
    godray(c, 220, -640, 100, 330, 900, -80, '#ffe0a0', 0.09);
    if (o.altar) altar(s, -300, 200);
    for (const x of [-560, 560]) brazier(c, x, 214, s.time, 1.1, x);
  });
  s.layer(1, () => {
    marble(c, GROUND - 4, '#7a5050', '#f0dcc8');
    motes(c, s.time, 40, '#ffe0a0', 0.4, 700);
  });
}

/** The altar of Hercules: a statue, a tripod and its fire. */
export function altar(s: S, x: number, base: number): void {
  const c = s.ctx;
  rect(c, x - 70, base - 110, 140, 110, linear(c, x - 70, 0, x + 70, 0, [[0, '#8a7a6a'], [0.5, '#e8dcc8'], [1, '#8a7a6a']]));
  rect(c, x - 80, base - 120, 160, 14, '#f0e4d0');
  for (const k of [-1, 1]) line(c, [[x + k * 22, base - 120], [x + k * 8, base - 160]], '#c8962e', 5);
  ellipse(c, x, base - 164, 34, 9, '#c8962e');
  flame(c, x, base - 168, 16, s.time, 9);
  s.actor({ who: 'hercules', x: x + 10, y: base - 180, s: 1.1, face: 1, pose: 'hold', item: 'staff', stone: '#d8ccb8' });
}

export function treasury(s: S): void {
  const c = s.ctx;
  s.layer(0.5, () => {
    room(c, '#4a2a22', '#2a160e', 190);
    for (const x of [-430, 430]) { arch(c, x, 190, 200, 360, '#3a1e18'); rect(c, x - 100, -170, 200, 360, rgba('#000000', 0.25)); }
    for (let i = 0; i < 3; i++) { const x = -150 + i * 150; rect(c, x - 54, 110, 108, 80, '#5a3418'); rect(c, x - 58, 96, 116, 20, '#7a4a22'); line(c, [[x - 54, 140], [x + 54, 140]], '#c8962e', 4); }
    rect(c, -620, -120, 1240, 12, '#2a160e');
    for (let i = 0; i < 9; i++) { const x = -540 + i * 135; ellipse(c, x, -134, 30, 14, i % 2 ? '#d8b048' : '#c8c8d0'); glow(c, x, -138, 50, '#ffe0a0', 0.3); }
  });
  s.layer(1, () => { ground(c, GROUND - 4, '#3a2014', '#080402'); table(c, 0, GROUND - 86, 260); });
}

export function table(ctx: Ctx, x: number, top: number, w: number, color = '#4a2a14'): void {
  rect(ctx, x - w / 2 + 16, top, 14, GROUND - top, mix(color, '#000000', 0.4));
  rect(ctx, x + w / 2 - 30, top, 14, GROUND - top, mix(color, '#000000', 0.4));
  rect(ctx, x - w / 2, top - 4, w, 16, color);
}

export function prison(s: S): void {
  const c = s.ctx;
  s.layer(0.5, () => {
    rect(c, X0, Y0, X1 - X0, GROUND - Y0, linear(c, 0, -600, 0, GROUND, [[0, '#06080e'], [1, '#1c2030']]));
    for (let r = 0; r < 18; r++) for (let i = 0; i < 16; i++) rect(c, -900 + i * 116 + (r % 2) * 58, -560 + r * 44, 108, 38, rgba('#3a4258', 0.18 + hash(r * 17 + i) * 0.22));
    /* A barred window high in the wall, the moon behind it. */
    rect(c, 120, -320, 170, 130, '#0c1838');
    stars(c, s.time, 0);
    ellipse(c, 230, -280, 22, 22, '#e8eeff');
    for (let x = 136; x < 290; x += 34) line(c, [[x, -320], [x, -190]], '#05060a', 9);
    for (const x of [-420, 470]) { line(c, [[x, -140], [x + 10, -40], [x - 4, 40]], '#4a4c58', 5); ellipse(c, x - 4, 48, 14, 8, '#4a4c58'); }
  });
  s.layer(0.75, () => godray(c, 205, -320, 150, 380, 680, -330, '#a8c4ff', 0.2));
  s.layer(1, () => { ground(c, GROUND - 4, '#20242e', '#04050a'); for (let i = 0; i < 40; i++) ellipse(c, -600 + hash(i) * 1200, GROUND + 6 + hash(i * 3) * 120, 6 + hash(i * 5) * 12, 2, rgba('#c8c0a0', 0.25)); });
}

/** Milan at night: walls, towers, a column of torches. */
export function milan(s: S, dawn = 0): void {
  const c = s.ctx;
  duskSky(s, mix('#050818', '#3a3a78', dawn), mix('#141c40', '#c8708a', dawn), mix('#2c2c50', '#ffc890', dawn));
  s.layer(0.06, () => { stars(c, s.time, 140, 1 - dawn, 0); if (!dawn) moon(c, -240, -330, 30); });
  s.layer(0.3, () => {
    const col = mix('#141634', '#5a3a5a', dawn);
    rect(c, -1100, 40, 2200, 300, col);
    for (let i = 0; i < 12; i++) { const x = -1000 + i * 180; rect(c, x, -40 - (i % 3) * 30, 70, 120 + (i % 3) * 30, col); for (let k = 0; k < 4; k++) rect(c, x + k * 18, -54 - (i % 3) * 30, 12, 16, col); }
    for (let k = 0; k < 30; k++) rect(c, -1100 + k * 74, 26, 44, 16, col);
    rect(c, 140, -260, 120, 300, col);
    poly(c, [[130, -260], [200, -340], [270, -260]], col);
    for (let i = 0; i < 26; i++) { const x = -900 + hash(i) * 1800; rect(c, x, 80 + hash(i * 3) * 80, 8, 12, rgba('#ffc060', 0.6 + dawn * -0.6)); }
  });
}

/** Rain-soaked road at night, an inn with a lamp. */
export function innExterior(s: S, door = 0): void {
  const c = s.ctx;
  nightSky(s, '#04060e', '#121a30', '#2c3448');
  s.layer(0.1, () => clouds(c, s.time, -260, '#1a2236', 0.8, 16, 10, 7));
  s.layer(0.3, () => { ridge(c, 110, 140, '#121a2c', 3, 220); for (let i = 0; i < 10; i++) tree(c, -900 + i * 190, 140, 230, '#0a1020', null, i + 20, s.time); });
  s.layer(0.65, () => { ground(c, 186, '#1c2234', '#05060c'); });
  s.layer(1, () => {
    ground(c, GROUND - 6, '#2a3044', '#04050a');
    /* The inn: stone walls, tiled roof, a lantern on a hook. */
    const x = 230;
    rect(c, x - 230, GROUND - 330, 460, 330, linear(c, x - 230, 0, x + 230, 0, [[0, '#2c2a34'], [1, '#4a4450']]));
    for (let r = 0; r < 9; r++) for (let i = 0; i < 7; i++) rect(c, x - 226 + i * 66 + (r % 2) * 33, GROUND - 326 + r * 36, 60, 30, rgba('#000000', 0.08 + hash(r * 7 + i) * 0.12));
    poly(c, [[x - 270, GROUND - 320], [x - 40, GROUND - 470], [x + 270, GROUND - 320]], '#5a2a20');
    for (let i = 0; i < 12; i++) line(c, [[x - 250 + i * 44, GROUND - 330], [x - 40 + i * 6, GROUND - 462]], rgba('#000000', 0.2), 3);
    rect(c, x - 70, GROUND - 190, 120, 190, '#1a0c06');
    if (door > 0) {
      rect(c, x - 66, GROUND - 186, 112 * door, 184, linear(c, 0, GROUND - 186, 0, GROUND, [[0, '#ffd080'], [1, '#c86a28']]));
      glow(c, x - 10, GROUND - 90, 300 * door, '#ffa848', 0.5);
      soft(c, x - 60, GROUND + 26, 200, 40, '#ffa848', 0.4 * door);
    }
    rect(c, x + 90, GROUND - 230, 90, 70, '#ffc870');
    glow(c, x + 135, GROUND - 195, 160, '#ffb050', 0.4);
    line(c, [[x - 110, GROUND - 260], [x - 110, GROUND - 230]], '#1a1410', 3);
    ellipse(c, x - 110, GROUND - 218, 12, 16, '#ffc060');
    glow(c, x - 110, GROUND - 218, 140, '#ffa040', 0.5 + noise(s.time * 4) * 0.1);
    /* A puddle that mirrors the lamp. */
    ellipse(c, x - 190, GROUND + 60, 160, 20, '#1a2236');
    soft(c, x - 150, GROUND + 60, 60, 12, '#ffb050', 0.35);
  });
}

export function innInterior(s: S): void {
  const c = s.ctx;
  s.layer(0.55, () => {
    room(c, '#5a3a28', '#2c1a10', 190);
    rect(c, X0, -300, X1 - X0, 30, '#2c180c');
    /* The fish carved in the beam. */
    c.save();
    c.translate(-60, -285);
    c.strokeStyle = '#d8a860';
    c.lineWidth = 3.5;
    c.beginPath();
    c.moveTo(-30, 0);
    c.quadraticCurveTo(0, -16, 26, 6);
    c.moveTo(-30, 0);
    c.quadraticCurveTo(0, 16, 26, -6);
    c.stroke();
    c.restore();
    glow(c, -60, -285, 60, '#ffd890', 0.3 + 0.2 * Math.sin(s.time * 1.2));
    for (const x of [-430, 430]) rect(c, x - 14, -640, 28, 830, '#2c180c');
    for (let i = 0; i < 6; i++) { const x = 180 + i * 34; ellipse(c, x, -168, 14, 30, i % 2 ? '#8a4a2a' : '#6a3a1e'); }
    rect(c, 160, -136, 240, 10, '#2c180c');
    hearth(c, -330, 192, s.time);
  });
  s.layer(1, () => { ground(c, GROUND - 4, '#3a2414', '#080402'); });
}

export function hearth(ctx: Ctx, x: number, base: number, t: number): void {
  rect(ctx, x - 120, base - 160, 240, 160, '#3a2a22');
  ctx.beginPath();
  ctx.moveTo(x - 80, base);
  ctx.lineTo(x - 80, base - 70);
  ctx.arc(x, base - 70, 80, Math.PI, 0);
  ctx.lineTo(x + 80, base);
  ctx.fillStyle = '#0a0604';
  ctx.fill();
  for (let i = 0; i < 4; i++) flame(ctx, x + (i - 1.5) * 26, base - 14, 14 + (i % 2) * 6, t, i * 2.1);
  glow(ctx, x, base - 40, 460, '#ff8c30', 0.3 + noise(t * 5) * 0.08);
}

export function cellar(s: S): void {
  const c = s.ctx;
  s.layer(0.5, () => {
    rect(c, X0, Y0, X1 - X0, GROUND - Y0, linear(c, 0, -600, 0, GROUND, [[0, '#0a0604'], [1, '#2a1a10']]));
    for (let i = -3; i <= 3; i++) { c.beginPath(); c.arc(i * 260, -60, 150, Math.PI, 0); c.strokeStyle = '#3a2416'; c.lineWidth = 30; c.stroke(); }
    for (let i = 0; i < 9; i++) barrelSide(c, -760 + i * 190, 150, 0.9);
  });
  s.layer(1, () => { ground(c, GROUND - 4, '#2c1a10', '#060302'); });
}

export function barrelSide(ctx: Ctx, x: number, y: number, s: number): void {
  ellipse(ctx, x, y, 70 * s, 60 * s, linear(ctx, 0, y - 60 * s, 0, y + 60 * s, [[0, '#7a4a22'], [0.5, '#5a3418'], [1, '#2a160a']]));
  ellipse(ctx, x, y, 46 * s, 44 * s, '#4a2a14');
  for (const k of [-0.6, 0.6]) line(ctx, [[x + k * 70 * s, y - 50 * s], [x + k * 70 * s, y + 50 * s]], '#1a1008', 6 * s);
}

/** A Roman milestone with an inscription. */
export function milestone(ctx: Ctx, x: number, base: number, text: string, color = '#b8ae98'): void {
  ctx.fillStyle = linear(ctx, x - 40, 0, x + 40, 0, [[0, mix(color, '#000000', 0.4)], [0.5, color], [1, mix(color, '#000000', 0.3)]]);
  ctx.fill(blobPath([[x - 36, base], [x - 38, base - 170], [x - 20, base - 196], [x + 20, base - 196], [x + 38, base - 170], [x + 36, base]]));
  ctx.save();
  ctx.font = `600 20px 'Cormorant Garamond Variable', serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = rgba('#2a2018', 0.75);
  text.split('\n').forEach((l, i) => ctx.fillText(l, x, base - 140 + i * 26));
  ctx.restore();
}

/** The Po valley: fields, poplars, mist, the straight road. */
export function plain(s: S, o: { dawn?: number; road?: boolean; farm?: boolean } = {}): void {
  const c = s.ctx;
  const d = o.dawn ?? 0;
  duskSky(s, mix('#6a9ad0', '#3c3a7a', d), mix('#b8d0e0', '#e898a8', d), mix('#fff0d0', '#ffd0a0', d));
  s.layer(0.06, () => { sun(c, -260, d ? 120 : -260, d ? 70 : 40, d ? '#ffe0a0' : '#fff6d8', d ? '#ff9a60' : '#ffe8a0'); clouds(c, s.time, -280, d ? '#e8a0b8' : '#ffffff', 0.5, 6, 7, 41); });
  s.layer(0.18, () => ridge(c, 92, 60, d ? '#a88aa8' : '#9ab0c0', 8, 300));
  s.layer(0.3, () => {
    ground(c, 120, d ? '#9a8a7a' : '#a8b878', '#5a6a40');
    for (let i = 0; i < 26; i++) poplar(c, -1000 + i * 82 + hash(i) * 30, 124, 70 + hash(i * 3) * 40, d ? '#5a5a5a' : '#5a7a48', s.time, i);
    fog(c, s.time, 128, d ? '#f0d8d8' : '#ffffff', 0.4, 9, 6);
  });
  s.layer(0.55, () => {
    ground(c, 160, d ? '#8a7a60' : '#b8b870', '#4a5030');
    for (let r = 0; r < 6; r++) for (let i = 0; i < 10; i++) rect(c, -1000 + i * 220 + (r % 2) * 90, 168 + r * 9, 180, 4, rgba(i % 2 ? '#e8d890' : '#6a8a40', 0.35));
    for (let i = 0; i < 9; i++) poplar(c, -900 + i * 230 + hash(i * 7) * 70, 172, 170 + hash(i) * 60, d ? '#4a4a48' : '#4a6a3a', s.time, i + 40);
    if (o.farm) farmhouse(c, 330, 178, s.time);
  });
  s.layer(1, () => {
    ground(c, GROUND - 6, d ? '#9a8868' : '#c8b878', '#4a3c24');
    if (o.road !== false) {
      poly(c, [[-80, GROUND - 6], [80, GROUND - 6], [460, Y1], [-460, Y1]], linear(c, 0, GROUND, 0, GROUND + 400, [[0, '#b8a888'], [1, '#6a5a44']]));
      for (let r = 0; r < 12; r++) { const y = GROUND + r * r * 3 + r * 10; const w = 80 + r * 34; for (let i = -6; i <= 6; i++) ellipse(c, i * w * 0.3, y, w * 0.12, 3 + r * 0.7, rgba('#5a4a38', 0.35)); }
    }
    for (let i = 0; i < 50; i++) { const x = -700 + hash(i * 2) * 1400; if (Math.abs(x) > 200) line(c, [[x, GROUND + hash(i) * 60], [x + 4 + Math.sin(s.time + i) * 4, GROUND - 22 + hash(i) * 60]], '#7a8a40', 3); }
  });
}

export function poplar(ctx: Ctx, x: number, base: number, h: number, color: string, t: number, seed: number): void {
  line(ctx, [[x, base], [x, base - h * 0.3]], mix(color, '#2a1c10', 0.6), Math.max(2, h * 0.04));
  const sway = Math.sin(t * 0.7 + seed) * h * 0.02;
  ctx.fillStyle = color;
  ctx.fill(blobPath([[x, base - h * 0.18], [x + h * 0.11, base - h * 0.45], [x + h * 0.08 + sway, base - h * 0.85], [x + sway, base - h], [x - h * 0.08 + sway, base - h * 0.85], [x - h * 0.11, base - h * 0.45]]));
  ctx.save();
  ctx.globalAlpha *= 0.3;
  ctx.fillStyle = mix(color, '#fff0c0', 0.4);
  ctx.fill(blobPath([[x + h * 0.02, base - h * 0.3], [x + h * 0.09, base - h * 0.5], [x + h * 0.05 + sway, base - h * 0.85], [x + h * 0.02, base - h * 0.6]]));
  ctx.restore();
}

export function farmhouse(ctx: Ctx, x: number, base: number, t: number): void {
  rect(ctx, x - 190, base - 170, 380, 170, linear(ctx, x - 190, 0, x + 190, 0, [[0, '#a8806a'], [1, '#d8b898']]));
  poly(ctx, [[x - 220, base - 162], [x - 30, base - 262], [x + 220, base - 162]], '#a84a2a');
  for (let i = 0; i < 10; i++) line(ctx, [[x - 200 + i * 44, base - 168], [x - 30 + i * 2, base - 256]], rgba('#5a1c10', 0.35), 3);
  rect(ctx, x - 40, base - 110, 70, 110, '#4a2a18');
  rect(ctx, x + 80, base - 120, 50, 44, '#2a1810');
  rect(ctx, x - 150, base - 120, 50, 44, '#2a1810');
  ellipse(ctx, x + 280, base - 50, 70, 70, '#d8b860');
  poly(ctx, [[x + 220, base - 60], [x + 280, base - 150], [x + 340, base - 60]], '#c8a850');
  /* Smoke from the chimney. */
  rect(ctx, x + 90, base - 290, 30, 70, '#8a6a58');
  for (let i = 0; i < 6; i++) { const k = (t * 0.08 + i / 6) % 1; soft(ctx, x + 105 + k * 60 + Math.sin(t + i) * 10, base - 300 - k * 260, 20 + k * 50, 16 + k * 40, '#e8e4e0', 0.4 * (1 - k)); }
}

export function farmRoom(s: S, dawn = 0): void {
  const c = s.ctx;
  s.layer(0.55, () => {
    room(c, mix('#2a2030', '#9a7a64', dawn), mix('#1a1210', '#5a4030', dawn), 190);
    rect(c, 160, -170, 160, 160, mix('#0a1028', '#ffd8a0', dawn));
    for (const k of [0, 1]) rect(c, 160 + k * 76, -170, 8, 160, '#2a180c');
    rect(c, 160, -94, 160, 8, '#2a180c');
    for (let i = 0; i < 5; i++) ellipse(c, -300 + i * 40, -200, 12, 18, '#c8a040');
  });
  s.layer(0.75, () => godray(c, 240, -170, 150, 340, 520, -260, dawn ? '#ffe0a8' : '#9ab0f0', 0.18));
  s.layer(1, () => {
    ground(c, GROUND - 4, mix('#20160e', '#5a4028', dawn), '#060402');
    /* A straw bed against the wall. */
    rect(c, -380, GROUND - 70, 420, 40, '#5a3a1e');
    ellipse(c, -170, GROUND - 74, 220, 24, mix('#a89048', '#d8c070', dawn));
  });
}

/** The Stirone: banks, reeds, a Roman bridge, water. */
export function stirone(s: S, o: { time: 'sunset' | 'night' | 'dawn'; bridge?: boolean; far?: boolean }): void {
  const c = s.ctx;
  const sunset = o.time === 'sunset';
  const nightT = o.time === 'night';
  if (sunset) duskSky(s, '#2a1c4a', '#c8506a', '#ffb050');
  else if (nightT) nightSky(s, '#02040e', '#0c1640', '#202c5c');
  else duskSky(s, '#4a5a9a', '#f0a8b0', '#fff0c8');
  s.layer(0.05, () => {
    if (sunset) { sun(c, 120, 60, 76, '#ffd070', '#ff6030'); clouds(c, s.time, -230, '#7a2c50', 0.55, 6, 8, 57); }
    else if (nightT) { stars(c, s.time, 260, 1, 100); moon(c, -250, -320, 26, '#e8f0ff'); }
    else { sun(c, -180, 110, 80, '#fff4d0', '#ffd0a0'); clouds(c, s.time, -260, '#ffd8e0', 0.45, 5, 6, 61); }
  });
  s.layer(0.2, () => ridge(c, 90, 90, sunset ? '#6a2c48' : nightT ? '#0e1838' : '#9a8ab0', 4, 260));
  s.layer(0.35, () => {
    ground(c, 128, sunset ? '#4a2030' : nightT ? '#0a1028' : '#8a8a90', '#100810');
    for (let i = 0; i < 18; i++) poplar(c, -1000 + i * 120 + hash(i) * 40, 132, 90 + hash(i * 3) * 50, sunset ? '#3a1828' : nightT ? '#060c20' : '#5a6a70', s.time, i);
  });
  s.layer(0.5, () => {
    const lights: Array<[number, string, number]> = sunset ? [[120, '#ffb050', 1.4]] : nightT ? [[-250, '#c8d8ff', 0.6]] : [[-180, '#fff0c0', 1.4]];
    water(c, 150, sunset ? '#a84a50' : nightT ? '#0c1840' : '#b8c0d8', sunset ? '#2a0c18' : '#04060e', s.time, lights);
    if (o.bridge !== false) {
      const col = sunset ? '#3a1820' : nightT ? '#0c1030' : '#7a7080';
      for (let i = -2; i <= 2; i++) {
        const x = i * 260 + 40;
        c.beginPath();
        c.rect(x - 132, 60, 264, 110);
        c.moveTo(x + 104, 172);
        c.arc(x, 172, 104, 0, Math.PI, true);
        c.fillStyle = col;
        c.fill('evenodd');
        for (let k = 0; k < 7; k++) { const a = Math.PI + (k / 6) * Math.PI; line(c, [[x + Math.cos(a) * 104, 172 + Math.sin(a) * 104], [x + Math.cos(a) * 128, 172 + Math.sin(a) * 128]], rgba('#000000', 0.3), 2); }
      }
      rect(c, -700, 46, 1400, 18, mix(col, '#ffffff', 0.08));
    }
    fog(c, s.time, 170, sunset ? '#ff9880' : nightT ? '#4a5a90' : '#ffffff', nightT ? 0.15 : 0.25, 8, 8);
  });
  s.layer(1, () => {
    ground(c, GROUND - 6, sunset ? '#3a1a20' : nightT ? '#0a0e22' : '#7a7a6a', '#06040a');
    for (let i = 0; i < 46; i++) { const x = -800 + hash(i * 3.3) * 1600; const h = 40 + hash(i) * 90; line(c, [[x, GROUND + 10], [x + Math.sin(s.time * 0.8 + i) * 8, GROUND - h]], sunset ? '#2a0e14' : nightT ? '#040818' : '#4a5a3a', 3); }
  });
}

/* ------------------------------------------------------------------ */
/* The medieval town and the cathedral                                 */
/* ------------------------------------------------------------------ */

/** The façade of the cathedral of Fidenza: towers, portals, loggia, reliefs. */
export function cathedral(s: S, x: number, base: number, k: number, o: { built?: number; lit?: number; color?: string } = {}): void {
  const c = s.ctx;
  const stone = o.color ?? '#d8c8a8';
  const built = o.built ?? 1;
  const top = base - 560 * k;
  const g = linear(c, x - 300 * k, 0, x + 300 * k, 0, [[0, mix(stone, '#3a2a20', 0.35)], [0.5, stone], [1, mix(stone, '#3a2a20', 0.3)]]);
  /* Towers. */
  for (const d of [-1, 1]) {
    const tx = x + d * 250 * k;
    const h = (d < 0 ? 720 : 640) * k;
    rect(c, tx - 70 * k, base - h * Math.min(1, built * 1.2), 140 * k, h * Math.min(1, built * 1.2), g);
    for (let r = 0; r < 3; r++) if (built > 0.3 + r * 0.2) for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(tx - 24 * k + i * 48 * k, base - h + 120 * k + r * 140 * k, 15 * k, Math.PI, 0); c.rect(tx - 39 * k + i * 48 * k, base - h + 120 * k + r * 140 * k, 30 * k, 50 * k); c.fillStyle = rgba('#140c0a', 0.75); c.fill(); }
  }
  /* Central body with the gable. */
  const bodyTop = base - (base - top) * built;
  rect(c, x - 180 * k, bodyTop, 360 * k, base - bodyTop, g);
  if (built > 0.95) poly(c, [[x - 190 * k, top + 2], [x, top - 110 * k], [x + 190 * k, top + 2]], g);
  /* Loggia. */
  if (built > 0.8) for (let i = 0; i < 7; i++) { const ax = x - 150 * k + i * 50 * k; c.beginPath(); c.arc(ax, top + 80 * k, 16 * k, Math.PI, 0); c.rect(ax - 16 * k, top + 80 * k, 32 * k, 48 * k); c.fillStyle = rgba('#1a1010', 0.7); c.fill(); }
  /* Three portals, the great one in the middle. */
  for (const [px, w, h] of [[-120, 70, 160], [0, 110, 230], [120, 70, 160]] as Array<[number, number, number]>) {
    const cx = x + px * k;
    if (base - h * k < bodyTop) continue;
    for (let r = 0; r < 4; r++) { c.beginPath(); c.arc(cx, base - h * k + (w * k) / 2, (w / 2 + 18 - r * 4) * k, Math.PI, 0); c.lineWidth = 5 * k; c.strokeStyle = mix(stone, '#4a3a30', 0.25 + r * 0.1); c.stroke(); }
    c.beginPath();
    c.moveTo(cx - (w / 2) * k, base);
    c.lineTo(cx - (w / 2) * k, base - h * k + (w * k) / 2);
    c.arc(cx, base - h * k + (w * k) / 2, (w / 2) * k, Math.PI, 0);
    c.lineTo(cx + (w / 2) * k, base);
    c.fillStyle = o.lit ? mix('#2a1408', '#ffc060', o.lit) : '#20140e';
    c.fill();
    if (o.lit) glow(c, cx, base - 60 * k, 140 * k, '#ffb050', o.lit * 0.5);
  }
  /* The lions holding the columns of the great portal. */
  for (const d of [-1, 1]) {
    const lx = x + d * 78 * k;
    ellipse(c, lx, base - 18 * k, 30 * k, 18 * k, mix(stone, '#8a3a2a', 0.35));
    ellipse(c, lx + d * 20 * k, base - 30 * k, 14 * k, 14 * k, mix(stone, '#8a3a2a', 0.35));
    rect(c, lx - 7 * k, base - 230 * k, 14 * k, 200 * k, mix(stone, '#ffffff', 0.12));
  }
  /* A frieze of the saint's story along the façade. */
  if (built > 0.7) {
    rect(c, x - 180 * k, base - 290 * k, 360 * k, 34 * k, mix(stone, '#5a4a3a', 0.2));
    for (let i = 0; i < 9; i++) { const fx = x - 160 * k + i * 40 * k; ellipse(c, fx, base - 282 * k, 6 * k, 6 * k, mix(stone, '#3a2a20', 0.35)); rect(c, fx - 6 * k, base - 276 * k, 12 * k, 18 * k, mix(stone, '#3a2a20', 0.35)); }
  }
}

/** Two niches with the stone saint, beside the great portal. */
export function niche(s: S, x: number, base: number, k: number, stone = '#cfc0a2', glowAmount = 0): void {
  const c = s.ctx;
  c.beginPath();
  c.moveTo(x - 46 * k, base);
  c.lineTo(x - 46 * k, base - 210 * k);
  c.arc(x, base - 210 * k, 46 * k, Math.PI, 0);
  c.lineTo(x + 46 * k, base);
  c.fillStyle = mix(stone, '#2a2018', 0.55);
  c.fill();
  if (glowAmount > 0) glow(c, x, base - 160 * k, 220 * k, '#ffe0a0', glowAmount);
  s.actor({ who: 'statue', x, y: base - 6 * k, s: 0.78 * k, face: 1, pose: 'offer', item: 'head', headless: true, stone });
}

export function medievalTown(s: S, o: { dusk?: boolean } = {}): void {
  const c = s.ctx;
  if (o.dusk) duskSky(s, '#2c2c64', '#c87888', '#ffc890');
  else duskSky(s, '#5a8ad0', '#b8d4ec', '#fff4dc');
  s.layer(0.06, () => { if (o.dusk) sun(c, 300, 40, 60, '#ffd890', '#ff8a50'); else sun(c, 260, -280, 40, '#fffbe8', '#fff0b0'); clouds(c, s.time, -270, o.dusk ? '#c86a8a' : '#ffffff', 0.5, 6, 7, 71); birds(c, s.time, -220, 6, o.dusk ? '#3a2040' : '#4a4a5a', 3); });
  s.layer(0.25, () => { for (let i = 0; i < 14; i++) { const x = -1000 + i * 150; const h = 100 + hash(i) * 120; rect(c, x, 140 - h, 140, h + 300, o.dusk ? '#5a3c58' : '#c8a890'); poly(c, [[x - 6, 144 - h], [x + 70, 100 - h], [x + 146, 144 - h]], o.dusk ? '#4a2840' : '#a85a3a'); } });
}

export function birds(ctx: Ctx, t: number, y: number, count: number, color: string, seed: number): void {
  for (let i = 0; i < count; i++) {
    const x = mod(hash(i + seed) * 1600 + t * (24 + hash(i * 3) * 18), 1800) - 900;
    const yy = y + (hash(i * 5 + seed) - 0.5) * 150 + Math.sin(t * 0.8 + i) * 10;
    const flap = Math.sin(t * 5 + i * 2) * 7;
    const s = 8 + hash(i * 9) * 9;
    line(ctx, [[x - s, yy - flap], [x, yy], [x + s, yy - flap]], color, 2.4);
  }
}

export function scaffold(ctx: Ctx, x: number, base: number, w: number, h: number): void {
  const wood = '#6a4a2a';
  for (let i = 0; i <= 4; i++) line(ctx, [[x - w / 2 + (i * w) / 4, base], [x - w / 2 + (i * w) / 4, base - h]], wood, 7);
  for (let r = 1; r <= 5; r++) line(ctx, [[x - w / 2 - 10, base - (r * h) / 5], [x + w / 2 + 10, base - (r * h) / 5]], wood, 9);
  for (let i = 0; i < 4; i++) line(ctx, [[x - w / 2 + (i * w) / 4, base - (i % 2) * h * 0.4], [x - w / 2 + ((i + 1) * w) / 4, base - h * 0.4 - (i % 2) * -h * 0.4]], rgba(wood, 0.7), 4);
}

/** Blocks of stone and a half-carved relief in the workshop. */
export function workshop(s: S): void {
  const c = s.ctx;
  s.layer(0.5, () => {
    room(c, '#7a6a58', '#4a3a28', 190);
    for (const x of [-380, 380]) arch(c, x, 190, 240, 330, '#5a4a3a');
    for (const x of [-380, 380]) { rect(c, x - 120, -140, 240, 330, linear(c, 0, -140, 0, 190, [[0, '#a8c8e8'], [1, '#f0e0c0']])); }
  });
  s.layer(0.75, () => { godray(c, -380, -260, 200, 500, 640, 280, '#fff0d0', 0.18); godray(c, 380, -260, 200, 500, 640, -200, '#fff0d0', 0.14); motes(c, s.time, 60, '#fff4d8', 0.5, 700); });
  s.layer(1, () => {
    ground(c, GROUND - 4, '#7a6650', '#20160e');
    for (let i = 0; i < 4; i++) { const x = -520 + i * 70 + hash(i) * 20; rect(c, x - 30, GROUND - 60 - (i % 2) * 40, 60, 60 + (i % 2) * 40, linear(c, x - 30, 0, x + 30, 0, [[0, '#a89880'], [1, '#e8dcc4']])); }
    for (let i = 0; i < 40; i++) ellipse(c, -600 + hash(i * 4) * 1200, GROUND + 10 + hash(i) * 120, 4 + hash(i * 3) * 6, 2, rgba('#f0e8d8', 0.5));
  });
}

export function modernPiazza(s: S, dusk: number): void {
  const c = s.ctx;
  duskSky(s, mix('#5a8ad0', '#24285a', dusk), mix('#b8d4ec', '#c8708a', dusk), mix('#fff4dc', '#ffc080', dusk));
  s.layer(0.06, () => { stars(c, s.time, 60, dusk * 0.6, -250); clouds(c, s.time, -270, dusk ? '#c86a8a' : '#ffffff', 0.45, 6, 7, 91); birds(c, s.time, -230, 7, '#3a3040', 9); });
  s.layer(0.3, () => { for (let i = 0; i < 12; i++) { const x = -1000 + i * 180; const h = 140 + hash(i) * 120; rect(c, x, 150 - h, 170, h + 300, mix('#d8a888', '#6a4a5a', dusk)); for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) rect(c, x + 22 + k * 48, 170 - h + r * 52, 22, 32, hash(i * 9 + r + k) < dusk * 0.7 ? '#ffd080' : rgba('#2a2030', 0.6)); poly(c, [[x - 8, 154 - h], [x + 85, 120 - h], [x + 178, 154 - h]], mix('#a84a2a', '#4a2030', dusk)); } });
}

export function streetLamp(ctx: Ctx, x: number, base: number, h: number, on: number): void {
  line(ctx, [[x, base], [x, base - h]], '#1a1a20', 6);
  line(ctx, [[x, base - h], [x + 30, base - h - 10]], '#1a1a20', 5);
  ellipse(ctx, x + 32, base - h - 4, 10, 6, on > 0 ? '#ffe8b0' : '#6a6a6a');
  if (on > 0) { glow(ctx, x + 32, base - h, 200, '#ffc878', on * 0.5); soft(ctx, x + 30, base + 6, 150, 30, '#ffc878', on * 0.25); }
}

/** A horse, drawn standing or walking, facing right, hooves at y = 0. */
export function horse(ctx: Ctx, color: string, mane: string, t: number, walk: number, phase: number): void {
  const bob = Math.sin(phase * 2) * 4 * walk;
  const body = linear(ctx, 0, -200, 0, -100, [[0, mix(color, '#ffffff', 0.12)], [1, mix(color, '#000000', 0.35)]]);
  const leg = (x: number, front: boolean, offset: number, near: boolean): void => {
    const swing = Math.sin(phase + offset) * 26 * walk;
    const lift = Math.max(0, Math.sin(phase + offset + 1.4)) * 24 * walk;
    const knee: Pt = [x + swing * 0.5, -70 - lift * 0.5];
    const hoof: Pt = [x + swing + (front ? lift * 0.4 : -lift * 0.2), -6 - lift];
    const col = near ? color : mix(color, '#000000', 0.35);
    line(ctx, [[x, -130 + bob], knee], col, near ? 20 : 17);
    line(ctx, [knee, hoof], col, near ? 13 : 11);
    rect(ctx, hoof[0] - 9, hoof[1] - 4, 18, 10, '#1a1410');
  };
  leg(-74, false, Math.PI, false);
  leg(70, true, 0, false);
  /* Tail, body, neck and head. */
  line(ctx, [[-108, -168 + bob], [-140, -120 + Math.sin(t * 2) * 6], [-132, -70]], mane, 16);
  ctx.fillStyle = body;
  ctx.fill(blobPath([[-112, -170 + bob], [-60, -196 + bob], [40, -198 + bob], [96, -178 + bob], [104, -136 + bob], [50, -118 + bob], [-60, -118 + bob], [-114, -134 + bob]]));
  ctx.fill(blobPath([[66, -186 + bob], [104, -262 + bob], [132, -282 + bob], [146, -268 + bob], [124, -200 + bob], [102, -150 + bob]]));
  ctx.fillStyle = color;
  ctx.fill(blobPath([[116, -286 + bob], [172, -246 + bob], [184, -228 + bob], [170, -222 + bob], [120, -246 + bob]]));
  ellipse(ctx, 140, -266 + bob, 4, 4, '#0a0606');
  poly(ctx, [[120, -290 + bob], [124, -312 + bob], [132, -288 + bob]], color);
  line(ctx, [[112, -280 + bob], [92, -232 + bob], [70, -190 + bob]], mane, 12);
  /* Saddle cloth and bridle. */
  poly(ctx, [[-50, -196 + bob], [30, -198 + bob], [36, -140 + bob], [-56, -140 + bob]], '#8a1e1a');
  line(ctx, [[-50, -196 + bob], [30, -198 + bob]], '#e0b040', 4);
  line(ctx, [[176, -232 + bob], [120, -250 + bob], [96, -200 + bob]], '#2a1a10', 3);
  leg(-90, false, 0, true);
  leg(56, true, Math.PI, true);
}

export { TAU, candle, ellipse, glow, hash, line, linear, mix, poly, rect, rgba, soft, X0, X1, Y0, Y1, GROUND };
