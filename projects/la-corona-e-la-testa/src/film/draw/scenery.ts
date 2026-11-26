/* Painted layers: skies, hills, towns, interiors and props. */
import { TAU, blobPath, ellipse, glow, hash, line, linear, mix, mod, noise, poly, rect, rgba, soft, type Ctx, type Pt } from './core';

/** Backgrounds are painted well past any screen shape and camera move. */
export const X0 = -1300;
export const X1 = 1300;
export const Y0 = -1300;
export const Y1 = 1300;
export const GROUND = 230;

export function sky(ctx: Ctx, stops: Array<[number, string]>, horizon = GROUND): void {
  rect(ctx, X0, Y0, X1 - X0, Y1 - Y0, linear(ctx, 0, -640, 0, horizon, stops));
}

export function stars(ctx: Ctx, t: number, count = 160, alpha = 0.9, maxY = 60): void {
  ctx.save();
  ctx.fillStyle = '#fdf6e0';
  for (let i = 0; i < count; i++) {
    const x = -900 + hash(i * 3.1) * 1800;
    const y = -760 + Math.pow(hash(i * 7.7), 1.2) * (maxY + 760);
    const r = 0.6 + Math.pow(hash(i * 1.3), 4) * 2.6;
    ctx.globalAlpha = alpha * (0.45 + 0.55 * Math.sin(t * (0.6 + hash(i) * 1.8) + i) ** 2);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    if (r > 2.2) glow(ctx, x, y, r * 7, '#cfe0ff', 0.4);
  }
  ctx.restore();
}

export function moon(ctx: Ctx, x: number, y: number, r: number, color = '#f6f0d8'): void {
  glow(ctx, x, y, r * 7, '#8fa8d8', 0.45);
  glow(ctx, x, y, r * 2.6, color, 0.4);
  ellipse(ctx, x, y, r, r, color);
  for (let i = 0; i < 6; i++) ellipse(ctx, x + (hash(i) - 0.5) * r * 1.2, y + (hash(i + 9) - 0.5) * r * 1.2, r * (0.08 + hash(i + 3) * 0.17), r * (0.07 + hash(i + 5) * 0.13), 'rgba(150,140,120,0.22)');
}

export function sun(ctx: Ctx, x: number, y: number, r: number, color: string, halo = color): void {
  glow(ctx, x, y, r * 9, halo, 0.55);
  glow(ctx, x, y, r * 3.2, color, 0.7);
  ellipse(ctx, x, y, r, r, mix(color, '#ffffff', 0.45));
}

export function clouds(ctx: Ctx, t: number, y: number, color: string, alpha = 0.5, speed = 6, count = 7, seed = 1): void {
  for (let i = 0; i < count; i++) {
    const w = 220 + hash(seed + i * 2) * 340;
    const x = mod(hash(seed + i * 5) * 2200 + t * speed * (0.5 + hash(i + seed)), 2400) - 1200;
    const cy = y + (hash(seed + i * 9) - 0.5) * 150;
    for (let k = 0; k < 4; k++) soft(ctx, x + (k - 1.5) * w * 0.24, cy + Math.sin(k * 2 + i) * 14, w * (0.34 - Math.abs(k - 1.5) * 0.05), w * 0.1, color, alpha);
  }
}

/** A range of hills or mountains, filled to the bottom. */
export function ridge(ctx: Ctx, y: number, amp: number, color: string, seed: number, step = 120, bottom = Y1): void {
  const pts: Pt[] = [[X0, bottom]];
  for (let x = X0; x <= X1 + step; x += step / 3) {
    const k = (x - X0) / step;
    pts.push([x, y - noise(k + seed * 13) * amp - noise(k * 2.7 + seed) * amp * 0.28]);
  }
  pts.push([X1, bottom]);
  poly(ctx, pts, linear(ctx, 0, y - amp, 0, y + 260, [[0, color], [1, mix(color, '#05040a', 0.55)]]));
}

export function ground(ctx: Ctx, y: number, top: string, bottom: string): void {
  rect(ctx, X0, y, X1 - X0, Y1 - y, linear(ctx, 0, y, 0, y + 420, [[0, top], [1, bottom]]));
  rect(ctx, X0, y - 1.5, X1 - X0, 3, rgba('#fff2d0', 0.1));
}

export function cobbles(ctx: Ctx, y: number, color: string, rows = 9): void {
  for (let r = 0; r < rows; r++) {
    const yy = y + 12 + r * r * 3.4 + r * 15;
    const w = 34 + r * 9;
    for (let x = -960 + (r % 2) * w * 0.5; x < 960; x += w) ellipse(ctx, x + hash(x + r) * 8, yy, w * 0.42, 5 + r * 1.4, rgba(color, 0.2 + hash(x * 3 + r) * 0.2));
  }
}

export interface HouseOpts { wall: string; roof: string; light?: string; lit?: number; seed?: number; door?: boolean; chimney?: boolean; timber?: boolean; snow?: boolean }

export function house(ctx: Ctx, x: number, base: number, w: number, h: number, o: HouseOpts): void {
  const seed = o.seed ?? 1;
  rect(ctx, x - w / 2, base - h, w, h, linear(ctx, x - w / 2, 0, x + w / 2, 0, [[0, mix(o.wall, '#05040a', 0.25)], [1, o.wall]]));
  if (o.chimney !== false) rect(ctx, x + w * 0.22, base - h - w * 0.36, w * 0.1, w * 0.3, o.roof);
  poly(ctx, [[x - w / 2 - 14, base - h + 4], [x - w * 0.18, base - h - w * 0.3], [x + w * 0.22, base - h - w * 0.32], [x + w / 2 + 14, base - h + 4]], o.roof);
  if (o.snow) line(ctx, [[x - w / 2 - 12, base - h], [x - w * 0.18, base - h - w * 0.3], [x + w * 0.22, base - h - w * 0.32], [x + w / 2 + 12, base - h]], '#dfeaf6', 8);
  const cols = Math.max(1, Math.round(w / 80));
  const rows = Math.max(1, Math.floor((h - 70) / 92));
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const wx = x - w / 2 + ((c + 0.5) * w) / cols - 15;
      const wy = base - h + 26 + r * 92;
      const lit = hash(seed * 7 + c * 3 + r * 11) < (o.lit ?? 0.4);
      rect(ctx, wx - 4, wy - 4, 38, 54, mix(o.wall, '#000000', 0.4));
      rect(ctx, wx, wy, 30, 46, lit ? (o.light ?? '#ffc468') : mix(o.wall, '#0a1020', 0.7));
      if (lit) glow(ctx, wx + 15, wy + 23, 60, o.light ?? '#ffb050', 0.32);
      rect(ctx, wx + 13.5, wy, 3, 46, mix(o.wall, '#000000', 0.45));
      rect(ctx, wx, wy + 20, 30, 3, mix(o.wall, '#000000', 0.45));
    }
  }
  if (o.timber) for (let i = 0; i <= cols; i++) line(ctx, [[x - w / 2 + (i * w) / cols, base - h], [x - w / 2 + (i * w) / cols, base]], mix(o.wall, '#1a0e08', 0.7), 6);
  if (o.door) {
    const dx = x - 26;
    ctx.beginPath();
    ctx.moveTo(dx, base);
    ctx.lineTo(dx, base - 84);
    ctx.arc(x, base - 84, 26, Math.PI, 0);
    ctx.lineTo(x + 26, base);
    ctx.fillStyle = '#2a180e';
    ctx.fill();
    ellipse(ctx, x + 12, base - 46, 4, 4, '#d8a850');
  }
}

export function street(ctx: Ctx, base: number, seed: number, o: Omit<HouseOpts, 'seed'>, scale = 1, gapAt?: [number, number]): void {
  let x = X0 + 200;
  let i = 0;
  while (x < X1 - 200) {
    const w = (150 + hash(seed + i) * 110) * scale;
    const h = (190 + hash(seed + i * 3) * 170) * scale;
    const cx = x + w / 2;
    if (!gapAt || cx + w / 2 < gapAt[0] || cx - w / 2 > gapAt[1]) house(ctx, cx, base, w, h, { ...o, wall: mix(o.wall, o.roof, hash(seed + i * 5) * 0.5), seed: seed + i });
    x += w + 3;
    i++;
  }
}

/** The roofs of Paris: mansards, chimneys and, if asked, Notre-Dame. */
export function paris(ctx: Ctx, base: number, color: string, lit: string, seed: number, scale = 1, cathedral = false): void {
  ctx.fillStyle = color;
  let x = -1100;
  let i = 0;
  while (x < 1100) {
    const w = (70 + hash(seed + i) * 120) * scale;
    const h = (60 + hash(seed + i * 3) * 130) * scale;
    poly(ctx, [[x, base + 500], [x, base - h], [x + w * 0.14, base - h - 28 * scale], [x + w * 0.86, base - h - 28 * scale], [x + w, base - h], [x + w, base + 500]], color);
    for (let c = 0; c < 3; c++) {
      if (hash(seed + i * 7 + c) < 0.55) rect(ctx, x + w * 0.2 + c * w * 0.2, base - h - 28 * scale - 14 * scale, 7 * scale, 18 * scale, color);
      for (let r = 0; r < 3; r++) if (hash(seed + i * 13 + c * 5 + r) < 0.22) rect(ctx, x + w * 0.16 + c * w * 0.27, base - h + 14 * scale + r * 32 * scale, 8 * scale, 13 * scale, lit);
    }
    x += w - 2;
    i++;
  }
  if (cathedral) {
    const cx = 210;
    for (const dx of [-62, 62]) {
      rect(ctx, cx + dx * scale - 34 * scale, base - 340 * scale, 68 * scale, 420 * scale, color);
      for (let k = 0; k < 3; k++) rect(ctx, cx + dx * scale - 22 * scale + k * 16 * scale, base - 322 * scale, 9 * scale, 70 * scale, rgba(lit, 0.35));
    }
    rect(ctx, cx - 40 * scale, base - 250 * scale, 80 * scale, 300 * scale, color);
    ellipse(ctx, cx, base - 196 * scale, 26 * scale, 26 * scale, rgba(lit, 0.45));
    poly(ctx, [[cx + 130 * scale, base - 160 * scale], [cx + 168 * scale, base - 430 * scale], [cx + 206 * scale, base - 160 * scale]], color);
  }
}

export function tree(ctx: Ctx, x: number, base: number, h: number, bark: string, leaves: string | null, seed: number, t: number): void {
  const branch = (bx: number, by: number, ang: number, len: number, width: number, depth: number, id: number): void => {
    const sway = Math.sin(t * 0.8 + id) * 0.012 * (5 - depth);
    const ex = bx + Math.sin(ang + sway) * len;
    const ey = by - Math.cos(ang + sway) * len;
    line(ctx, [[bx, by], [(bx + ex) / 2 + (hash(id) - 0.5) * len * 0.22, (by + ey) / 2], [ex, ey]], bark, width);
    if (depth > 0) {
      branch(ex, ey, ang - 0.38 - hash(id * 3) * 0.3, len * 0.74, width * 0.62, depth - 1, id * 2 + 1);
      branch(ex, ey, ang + 0.34 + hash(id * 5) * 0.34, len * 0.7, width * 0.6, depth - 1, id * 2 + 2);
    } else if (leaves) {
      ellipse(ctx, ex + Math.sin(t + id) * 3, ey, h * 0.13, h * 0.1, rgba(leaves, 0.82));
      ellipse(ctx, ex - 8 + Math.sin(t * 1.3 + id) * 3, ey - 12, h * 0.07, h * 0.055, rgba(mix(leaves, '#fff4c0', 0.28), 0.65));
    }
  };
  branch(x, base, (hash(seed) - 0.5) * 0.22, h * 0.36, h * 0.075, 4, seed);
}

/** An interior: wall, wainscot and floorboards. */
export function room(ctx: Ctx, wall: string, floor: string, floorY = GROUND - 10): void {
  rect(ctx, X0, Y0, X1 - X0, floorY - Y0, linear(ctx, 0, -620, 0, floorY, [[0, mix(wall, '#05040a', 0.62)], [1, wall]]));
  for (let x = -1000; x < 1000; x += 74) rect(ctx, x, floorY - 150, 4, 150, rgba('#000000', 0.16));
  rect(ctx, X0, floorY - 156, X1 - X0, 10, mix(wall, '#000000', 0.35));
  rect(ctx, X0, floorY, X1 - X0, Y1 - floorY, linear(ctx, 0, floorY, 0, floorY + 340, [[0, floor], [1, mix(floor, '#030204', 0.7)]]));
  for (let i = -12; i <= 12; i++) line(ctx, [[i * 70, floorY], [i * 150, floorY + 420]], rgba('#000000', 0.22), 3);
}

export function windowFrame(ctx: Ctx, x: number, y: number, w: number, h: number, glassTop: string, glassBottom: string, frame = '#1c120c', arch = false): void {
  ctx.save();
  const p = new Path2D();
  if (arch) {
    p.moveTo(x - w / 2, y + h / 2);
    p.lineTo(x - w / 2, y - h / 2 + w / 2);
    p.arc(x, y - h / 2 + w / 2, w / 2, Math.PI, 0);
    p.lineTo(x + w / 2, y + h / 2);
    p.closePath();
  } else p.rect(x - w / 2, y - h / 2, w, h);
  ctx.fillStyle = linear(ctx, 0, y - h / 2, 0, y + h / 2, [[0, glassTop], [1, glassBottom]]);
  ctx.fill(p);
  ctx.strokeStyle = frame;
  ctx.lineWidth = 12;
  ctx.stroke(p);
  ctx.restore();
  rect(ctx, x - 3, y - h / 2, 6, h, frame);
  rect(ctx, x - w / 2, y - 3, w, 6, frame);
  rect(ctx, x - w / 2 - 16, y + h / 2, w + 32, 14, mix(frame, '#ffffff', 0.12));
}

/** A slanted shaft of light. */
export function godray(ctx: Ctx, x: number, y: number, topW: number, botW: number, len: number, slant: number, color: string, alpha: number): void {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  poly(ctx, [[x - topW / 2, y], [x + topW / 2, y], [x + slant + botW / 2, y + len], [x + slant - botW / 2, y + len]], linear(ctx, x, y, x + slant, y + len, [[0, rgba(color, alpha)], [1, rgba(color, 0)]]));
  ctx.restore();
}

export function flame(ctx: Ctx, x: number, y: number, r: number, t: number, seed = 1): void {
  const f = noise(t * 7 + seed * 3);
  const sway = (noise(t * 4 + seed) - 0.5) * r * 0.8;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255,150,50,0.85)';
  ctx.fill(blobPath([[x - r * 0.62, y], [x - r * 0.3, y - r * 1.2], [x + sway, y - r * (2.5 + f * 0.7)], [x + r * 0.4, y - r * 1.1], [x + r * 0.6, y], [x, y + r * 0.4]]));
  ellipse(ctx, x + sway * 0.2, y - r * 0.5, r * 0.28, r * 0.75, '#fff0b8');
  ctx.restore();
  glow(ctx, x, y - r, r * 15, '#ff9c3c', 0.34 + f * 0.1);
}

export function candle(ctx: Ctx, x: number, base: number, h: number, t: number, seed = 1, lit = true): void {
  rect(ctx, x - h * 0.08, base - h, h * 0.16, h, linear(ctx, x - h * 0.1, 0, x + h * 0.1, 0, [[0, '#b8a888'], [1, '#f8eed6']]));
  ellipse(ctx, x - h * 0.05, base - h * 0.82, h * 0.035, h * 0.12, '#f4ead0');
  if (lit) flame(ctx, x, base - h - 3, h * 0.085, t, seed);
}

export function candlestick(ctx: Ctx, x: number, base: number, h: number, t: number, seed = 1, lit = true): void {
  const silver = linear(ctx, x - h * 0.14, 0, x + h * 0.14, 0, [[0, '#606c7c'], [0.55, '#eef4fa'], [1, '#8a96a6']]);
  ellipse(ctx, x, base - 3, h * 0.22, h * 0.045, silver);
  poly(ctx, [[x - h * 0.14, base - 6], [x - h * 0.03, base - h * 0.16], [x - h * 0.035, base - h * 0.46], [x - h * 0.1, base - h * 0.5], [x + h * 0.1, base - h * 0.5], [x + h * 0.035, base - h * 0.46], [x + h * 0.03, base - h * 0.16], [x + h * 0.14, base - 6]], silver);
  ellipse(ctx, x, base - h * 0.3, h * 0.065, h * 0.035, silver);
  candle(ctx, x, base - h * 0.5, h * 0.42, t, seed, lit);
}

export function fireplace(ctx: Ctx, x: number, base: number, t: number, size = 1, lit = 1): void {
  const s = size;
  rect(ctx, x - 130 * s, base - 230 * s, 260 * s, 230 * s, '#4a3a34');
  for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) rect(ctx, x - 128 * s + c * 43 * s + (r % 2) * 14 * s, base - 226 * s + r * 32 * s, 38 * s, 28 * s, rgba('#8a5a48', 0.18 + hash(r * 9 + c) * 0.2));
  rect(ctx, x - 150 * s, base - 252 * s, 300 * s, 24 * s, '#2a1a12');
  ctx.beginPath();
  ctx.moveTo(x - 80 * s, base);
  ctx.lineTo(x - 80 * s, base - 90 * s);
  ctx.arc(x, base - 90 * s, 80 * s, Math.PI, 0);
  ctx.lineTo(x + 80 * s, base);
  ctx.fillStyle = '#0c0604';
  ctx.fill();
  line(ctx, [[x - 54 * s, base - 8 * s], [x + 50 * s, base - 22 * s]], '#3a2012', 13 * s);
  line(ctx, [[x - 46 * s, base - 24 * s], [x + 56 * s, base - 8 * s]], '#2a160c', 13 * s);
  if (lit > 0) {
    ctx.save();
    ctx.globalAlpha *= lit;
    for (let i = 0; i < 5; i++) flame(ctx, x + (i - 2) * 24 * s, base - 18 * s, (13 + (i % 2) * 8) * s, t, i * 2.3);
    glow(ctx, x, base - 40 * s, 520 * s, '#ff8c30', 0.28 + noise(t * 6) * 0.07);
    ctx.restore();
  }
}

export function table(ctx: Ctx, x: number, top: number, w: number, color = '#5a3820', cloth?: string): void {
  rect(ctx, x - w / 2 + 14, top, 14, GROUND - top, mix(color, '#000000', 0.4));
  rect(ctx, x + w / 2 - 28, top, 14, GROUND - top, mix(color, '#000000', 0.4));
  rect(ctx, x - w / 2, top - 4, w, 16, color);
  if (cloth) {
    poly(ctx, [[x - w / 2 - 6, top - 6], [x + w / 2 + 6, top - 6], [x + w / 2 - 6, top + 54], [x - w / 2 + 6, top + 54]], linear(ctx, 0, top, 0, top + 56, [[0, cloth], [1, mix(cloth, '#201820', 0.4)]]));
  }
}

export function chair(ctx: Ctx, x: number, face: 1 | -1, color = '#3a2214'): void {
  rect(ctx, x - 34, GROUND - 80, 68, 11, color);
  rect(ctx, x - 32, GROUND - 74, 9, 74, color);
  rect(ctx, x + 23, GROUND - 74, 9, 74, color);
  rect(ctx, x - face * 34 - 5, GROUND - 200, 10, 128, color);
  rect(ctx, x - face * 34 - 7, GROUND - 202, 14, 22, color);
}

export function bed(ctx: Ctx, x: number, w: number, sheet = '#e8e2d4', wood = '#3a2416'): void {
  rect(ctx, x - w / 2 - 18, GROUND - 170, 18, 170, wood);
  rect(ctx, x + w / 2, GROUND - 100, 18, 100, wood);
  rect(ctx, x - w / 2, GROUND - 50, w, 22, wood);
  poly(ctx, [[x - w / 2, GROUND - 86], [x + w / 2, GROUND - 78], [x + w / 2, GROUND - 38], [x - w / 2, GROUND - 38]], linear(ctx, 0, GROUND - 90, 0, GROUND - 38, [[0, sheet], [1, mix(sheet, '#404060', 0.35)]]));
  ellipse(ctx, x - w / 2 + 58, GROUND - 92, 54, 22, sheet);
}

export function blanket(ctx: Ctx, x: number, w: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fill(blobPath([[x - w * 0.16, GROUND - 118], [x + w * 0.24, GROUND - 116], [x + w / 2 + 4, GROUND - 90], [x + w / 2 + 6, GROUND - 34], [x - w * 0.16, GROUND - 36]]));
  line(ctx, [[x - w * 0.14, GROUND - 106], [x + w * 0.1, GROUND - 100], [x + w * 0.44, GROUND - 84]], rgba('#ffffff', 0.2), 5);
}

export function lamp(ctx: Ctx, x: number, base: number, h: number, t: number, color = '#ffc060'): void {
  rect(ctx, x - 5, base - h, 10, h, '#141014');
  ellipse(ctx, x, base, 20, 6, '#141014');
  poly(ctx, [[x - 20, base - h], [x + 20, base - h], [x + 14, base - h - 40], [x - 14, base - h - 40]], rgba(color, 0.9));
  poly(ctx, [[x - 24, base - h - 40], [x + 24, base - h - 40], [x, base - h - 58]], '#141014');
  glow(ctx, x, base - h - 20, 230, color, 0.5 + noise(t * 5 + x) * 0.08);
  soft(ctx, x, base + 6, 190, 40, color, 0.2);
}

export function wheel(ctx: Ctx, x: number, y: number, r: number, rot: number, color = '#3a2414'): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.17;
  ctx.stroke();
  for (let i = 0; i < 8; i++) line(ctx, [[x, y], [x + Math.cos(rot + (i * TAU) / 8) * r * 0.94, y + Math.sin(rot + (i * TAU) / 8) * r * 0.94]], color, r * 0.08);
  ellipse(ctx, x, y, r * 0.17, r * 0.17, mix(color, '#000000', 0.3));
}

export function barrel(ctx: Ctx, x: number, y: number, s: number, rot = 0, color = '#6a4224'): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = linear(ctx, -34 * s, 0, 34 * s, 0, [[0, mix(color, '#000000', 0.45)], [0.65, color], [1, mix(color, '#000000', 0.25)]]);
  ctx.fill(blobPath([[-28 * s, -46 * s], [28 * s, -46 * s], [40 * s, 0], [28 * s, 46 * s], [-28 * s, 46 * s], [-40 * s, 0]]));
  for (const yy of [-30, 28]) line(ctx, [[-34 * s, yy * s], [34 * s, yy * s]], '#1a1410', 5 * s);
  ellipse(ctx, 0, -44 * s, 27 * s, 7 * s, mix(color, '#000000', 0.2));
  ctx.restore();
}

export function bench(ctx: Ctx, x: number, w = 220, color = '#3c2a1c'): void {
  rect(ctx, x - w / 2, GROUND - 78, w, 13, color);
  rect(ctx, x - w / 2, GROUND - 132, w, 11, color);
  rect(ctx, x - w / 2, GROUND - 110, w, 11, color);
  for (const dx of [-w / 2 + 10, w / 2 - 20]) {
    rect(ctx, x + dx, GROUND - 136, 9, 136, '#1c1410');
  }
}

export function ironGate(ctx: Ctx, x: number, w: number, h: number, color = '#0e0c12'): void {
  const n = Math.round(w / 34);
  for (let i = 0; i <= n; i++) {
    const gx = x - w / 2 + (i * w) / n;
    const top = GROUND - h - Math.sin((i / n) * Math.PI) * 50;
    line(ctx, [[gx, GROUND], [gx, top]], color, 7);
    poly(ctx, [[gx - 7, top + 2], [gx, top - 18], [gx + 7, top + 2]], color);
  }
  for (const yy of [GROUND - 30, GROUND - h * 0.78]) line(ctx, [[x - w / 2, yy], [x + w / 2, yy]], color, 8);
  line(ctx, [[x - w / 2, GROUND - h], [x, GROUND - h - 50], [x + w / 2, GROUND - h]], color, 6);
}

export function flowers(ctx: Ctx, x: number, y: number, spread: number, count: number, color: string, seed: number, t: number): void {
  for (let i = 0; i < count; i++) {
    const fx = x + (hash(seed + i) - 0.5) * spread;
    const h = 14 + hash(seed + i * 3) * 52;
    const bend = Math.sin(t * 1.1 + i) * 4;
    line(ctx, [[fx, y], [fx + bend * 0.4, y - h * 0.5], [fx + bend, y - h]], '#2c5434', 3);
    const r = 4 + hash(seed + i * 5) * 6;
    for (let k = 0; k < 5; k++) ellipse(ctx, fx + bend + Math.cos((k * TAU) / 5) * r * 0.7, y - h + Math.sin((k * TAU) / 5) * r * 0.7, r * 0.62, r * 0.62, color);
    ellipse(ctx, fx + bend, y - h, r * 0.4, r * 0.4, '#ffe080');
  }
}

/** Water with wobbling reflections of the given lights. */
export function water(ctx: Ctx, y: number, top: string, bottom: string, t: number, lights: Array<[number, string, number]> = []): void {
  rect(ctx, X0, y, X1 - X0, Y1 - y, linear(ctx, 0, y, 0, y + 460, [[0, top], [1, bottom]]));
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, color, s] of lights) {
    for (let i = 0; i < 26; i++) {
      const yy = y + 8 + i * i * 0.55 + i * 6;
      const wob = Math.sin(t * 2.2 + i * 0.9 + x) * (4 + i * 1.3);
      const w = (26 + i * 2.4) * s * (0.5 + noise(t * 1.4 + i * 3 + x) * 0.8);
      rect(ctx, x + wob - w / 2, yy, w, 2.4 + i * 0.14, rgba(color, 0.4 * (1 - i / 28)));
    }
  }
  for (let i = 0; i < 46; i++) {
    const yy = y + 6 + Math.pow(hash(i * 2.2), 1.5) * 460;
    const x = mod(hash(i * 5.3) * 2000 + t * (8 + hash(i) * 22), 2000) - 1000;
    rect(ctx, x, yy, 30 + hash(i * 7) * 90, 1.6, rgba('#c8d8ff', 0.08 + 0.08 * Math.sin(t + i) ** 2));
  }
  ctx.restore();
}

export function chandelier(ctx: Ctx, x: number, y: number, t: number): void {
  line(ctx, [[x, y - 500], [x, y - 10]], '#6a5020', 4);
  for (const [dx, dy] of [[-150, 24], [-96, 52], [-34, 66], [34, 66], [96, 52], [150, 24]]) {
    line(ctx, [[x, y], [x + dx * 0.55, y + dy + 34], [x + dx, y + dy]], '#c8a040', 6);
    candle(ctx, x + dx, y + dy, 34, t, dx);
    ellipse(ctx, x + dx * 0.6, y + dy + 36, 3.5, 6, 'rgba(220,240,255,0.85)');
  }
  ellipse(ctx, x, y, 16, 30, '#d8b050');
}

export function headstone(ctx: Ctx, x: number, base: number, w: number, h: number, color: string, tilt = 0): void {
  ctx.save();
  ctx.translate(x, base);
  ctx.rotate(tilt);
  const p = new Path2D();
  p.moveTo(-w / 2, 0);
  p.lineTo(-w / 2, -h + w / 2);
  p.arc(0, -h + w / 2, w / 2, Math.PI, 0);
  p.lineTo(w / 2, 0);
  p.closePath();
  ctx.fillStyle = linear(ctx, -w / 2, 0, w / 2, 0, [[0, mix(color, '#10101a', 0.4)], [1, color]]);
  ctx.fill(p);
  ctx.restore();
}

/** The golden thread: it draws itself along a path and shimmers. */
export function thread(ctx: Ctx, pts: Pt[], reveal: number, t: number, width = 3, alpha = 1): void {
  if (reveal <= 0 || alpha <= 0 || pts.length < 2) return;
  /* Catmull-Rom through the points, sampled so it can be revealed evenly. */
  const line_: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 18; k++) {
      const u = k / 18;
      const f = (a: number, b: number, c: number, d: number): number => 0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - 3 * c + d - a) * u * u * u);
      line_.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]) + Math.sin(t * 1.6 + (i * 18 + k) * 0.16) * 3.5]);
    }
  }
  line_.push(pts[pts.length - 1]);
  const n = Math.max(2, Math.round(line_.length * Math.min(1, reveal)));
  const shown = line_.slice(0, n);
  const stroke = (c: string, w: number): void => {
    ctx.beginPath();
    ctx.moveTo(shown[0][0], shown[0][1]);
    for (const p of shown) ctx.lineTo(p[0], p[1]);
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.globalCompositeOperation = 'lighter';
  stroke('rgba(255,180,60,0.12)', width * 6);
  stroke('rgba(255,196,80,0.3)', width * 2.6);
  stroke('rgba(255,226,150,0.95)', width);
  ctx.restore();
  const head = shown[shown.length - 1];
  glow(ctx, head[0], head[1], width * 15, '#ffcf70', 0.85 * alpha);
  const spark = shown[Math.floor(mod(t * 0.23, 1) * (shown.length - 1))];
  glow(ctx, spark[0], spark[1], width * 8, '#fff0c0', 0.6 * alpha);
}
