/* Small maths, colour and shape helpers shared by every drawing. */
export type Ctx = CanvasRenderingContext2D;
export type Pt = [number, number];

export const TAU = Math.PI * 2;
export const clamp = (v: number, a = 0, b = 1): number => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const mod = (v: number, n: number): number => ((v % n) + n) % n;
/** Smootherstep: gentle start and stop, for camera and actors. */
export const ease = (t: number): number => {
  const x = clamp(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
export const smooth = (t: number): number => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
/** 0→1 between a and b. */
export const ramp = (t: number, a: number, b: number): number => clamp((t - a) / Math.max(1e-4, b - a));
export const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};
export const noise = (x: number): number => {
  const i = Math.floor(x);
  const f = x - i;
  return lerp(hash(i), hash(i + 1), f * f * (3 - 2 * f));
};

const rgbCache = new Map<string, [number, number, number]>();
export function rgb(hex: string): [number, number, number] {
  let hit = rgbCache.get(hex);
  if (!hit) {
    const n = parseInt(hex.slice(1), 16);
    hit = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(hex, hit);
  }
  return hit;
}
const hex2 = (v: number): string => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
export function mix(a: string, b: string, t: number): string {
  const x = rgb(a);
  const y = rgb(b);
  const p = clamp(t);
  return `#${hex2(lerp(x[0], y[0], p))}${hex2(lerp(x[1], y[1], p))}${hex2(lerp(x[2], y[2], p))}`;
}
export function rgba(hex: string, a: number): string {
  const [r, g, b] = rgb(hex);
  return `rgba(${r},${g},${b},${clamp(a)})`;
}

export function linear(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, stops: Array<[number, string]>): CanvasGradient {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

export function poly(ctx: Ctx, pts: Pt[], fill: string | CanvasGradient): void {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** A closed shape with rounded corners through the midpoints. */
export function blobPath(pts: Pt[]): Path2D {
  const p = new Path2D();
  const n = pts.length;
  p.moveTo((pts[0][0] + pts[n - 1][0]) / 2, (pts[0][1] + pts[n - 1][1]) / 2);
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    p.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  }
  p.closePath();
  return p;
}

export function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient, rot = 0): void {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function rect(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string | CanvasGradient): void {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

export function line(ctx: Ctx, pts: Pt[], color: string, width: number): void {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  if (pts.length === 3) ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
  else for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

const sprites = new Map<string, HTMLCanvasElement>();
function glowSprite(color: string): HTMLCanvasElement {
  let c = sprites.get(color);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, rgba(color, 1));
  grad.addColorStop(0.2, rgba(color, 0.55));
  grad.addColorStop(0.55, rgba(color, 0.14));
  grad.addColorStop(1, rgba(color, 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  sprites.set(color, c);
  return c;
}

/** Additive light bloom (cached sprite, cheap). */
export function glow(ctx: Ctx, x: number, y: number, r: number, color: string, a: number, squash = 1): void {
  if (r <= 0 || a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha *= clamp(a);
  ctx.drawImage(glowSprite(color), x - r, y - r * squash, r * 2, r * 2 * squash);
  ctx.restore();
}

/** Soft shadow or mist patch (normal blending). */
export function soft(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string, a: number): void {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.drawImage(glowSprite(color), x - rx, y - ry, rx * 2, ry * 2);
  ctx.restore();
}
