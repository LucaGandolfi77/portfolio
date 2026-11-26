/* Rain, snow, embers and drifting things. All pure functions of time. */
import { TAU, ellipse, glow, hash, line, mod, noise, rgba, soft, type Ctx } from './core';

export function rain(ctx: Ctx, t: number, count = 220, alpha = 0.4, slant = 0.2, color = '#cfe0f0'): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let band = 0; band < 3; band++) {
    ctx.globalAlpha = alpha * (0.4 + band * 0.3);
    ctx.lineWidth = 0.8 + band * 0.7;
    ctx.beginPath();
    for (let i = band; i < count; i += 3) {
      const speed = 900 + band * 320;
      const y = mod(hash(i * 1.7) * 1600 + t * speed, 1600) - 800;
      const x = mod(hash(i * 3.9) * 2000 - y * slant + t * 20, 2000) - 1000;
      const len = 18 + band * 16;
      ctx.moveTo(x, y);
      ctx.lineTo(x - len * slant, y + len);
    }
    ctx.stroke();
  }
  ctx.restore();
}

export function splashes(ctx: Ctx, t: number, y: number, count = 26, spreadY = 140): void {
  for (let i = 0; i < count; i++) {
    const p = mod(t * (1.5 + hash(i)) + hash(i * 5), 1);
    const x = -700 + hash(i * 9.3 + Math.floor(t * (1.5 + hash(i)) + hash(i * 5))) * 1400;
    ctx.beginPath();
    ctx.ellipse(x, y + hash(i * 2) * spreadY, 3 + p * 20, 1 + p * 5, 0, 0, TAU);
    ctx.strokeStyle = rgba('#dceaff', 0.4 * (1 - p));
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

export function snow(ctx: Ctx, t: number, count = 170, alpha = 0.9, scale = 1, seed = 0): void {
  ctx.save();
  ctx.fillStyle = '#f2f7ff';
  for (let i = 0; i < count; i++) {
    const k = i + seed;
    const speed = 26 + hash(k * 5.1) * 60;
    const y = mod(hash(k * 2.3) * 1500 + t * speed * scale, 1500) - 760;
    const x = mod(hash(k * 4.1) * 1900 + Math.sin(t * 0.7 + k) * 28 + t * 9, 1900) - 950;
    const r = (1.2 + Math.pow(hash(k * 7.9), 3) * 4.6) * scale;
    ctx.globalAlpha = alpha * (0.3 + hash(k * 1.1) * 0.7);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function embers(ctx: Ctx, t: number, x: number, y: number, spread: number, rise: number, count = 40, color = '#ffa040'): void {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i++) {
    const life = mod(t * (0.12 + hash(i) * 0.22) + hash(i * 3), 1);
    const px = x + (hash(i * 7) - 0.5) * spread + Math.sin(t * 1.4 + i) * 24 * life;
    const py = y - life * rise;
    ctx.globalAlpha = (1 - life) * 0.9;
    ellipse(ctx, px, py, 1.4 + hash(i * 11) * 2.6, 1.4 + hash(i * 11) * 2.6, color);
  }
  ctx.restore();
}

export function motes(ctx: Ctx, t: number, count = 60, color = '#ffe8b0', alpha = 0.6, area = 900): void {
  for (let i = 0; i < count; i++) {
    const x = mod(hash(i * 3.3) * area * 2 + Math.sin(t * 0.3 + i) * 40 + t * 5, area * 2) - area;
    const y = mod(hash(i * 8.1) * 900 - t * (4 + hash(i) * 9), 900) - 600;
    glow(ctx, x, y, 3 + hash(i * 2) * 9, color, alpha * (0.2 + 0.8 * Math.sin(t * 0.8 + i * 2) ** 2));
  }
}

export function petals(ctx: Ctx, t: number, count = 46, color = '#ffc0d0', alpha = 0.9): void {
  for (let i = 0; i < count; i++) {
    const speed = 30 + hash(i * 5.7) * 46;
    const y = mod(hash(i * 2.9) * 1200 + t * speed, 1200) - 700;
    const x = mod(hash(i * 4.7) * 1800 + t * 26 + Math.sin(t + i) * 40, 1800) - 900;
    ctx.save();
    ctx.globalAlpha = alpha * (0.45 + hash(i) * 0.55);
    ctx.translate(x, y);
    ctx.rotate(t * (0.5 + hash(i * 9)) + i);
    ellipse(ctx, 0, 0, 4 + hash(i * 3) * 6, 2.4 + hash(i * 3) * 2.4 * Math.abs(Math.sin(t * 2 + i)), color);
    ctx.restore();
  }
}

export function fog(ctx: Ctx, t: number, y: number, color: string, alpha = 0.3, count = 9, speed = 12): void {
  for (let i = 0; i < count; i++) {
    const x = mod(hash(i * 6.1) * 2400 + t * speed * (0.4 + hash(i)), 2400) - 1200;
    soft(ctx, x, y + (hash(i * 3) - 0.5) * 70, 260 + hash(i * 9) * 260, 60 + hash(i * 4) * 50, color, alpha);
  }
}

export function smoke(ctx: Ctx, t: number, x: number, y: number, color: string, alpha = 0.35, count = 12, rise = 420): void {
  for (let i = 0; i < count; i++) {
    const life = mod(t * 0.09 + i / count, 1);
    const r = 26 + life * 120;
    soft(ctx, x + Math.sin(i * 7 + t * 0.4) * 40 * life + life * 50, y - life * rise, r, r * 0.8, color, alpha * Math.sin(life * Math.PI));
  }
}

export function bubbles(ctx: Ctx, t: number, y: number, count = 18): void {
  for (let i = 0; i < count; i++) {
    const p = mod(t * (0.2 + hash(i) * 0.4) + hash(i * 3), 1);
    ctx.beginPath();
    ctx.ellipse(-500 + hash(i * 7) * 1000, y + hash(i * 5) * 200, 3 + p * 16, 1 + p * 4, 0, 0, TAU);
    ctx.strokeStyle = rgba('#c8e0a0', 0.35 * (1 - p));
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
}

/** Distant flashes (musket fire, lightning): rare, soft, never strobing. */
export function flash(ctx: Ctx, t: number, x: number, y: number, r: number, color: string, every = 3.4, seed = 0): void {
  const slot = Math.floor(t / every + seed);
  const local = mod(t / every + seed, 1) * every;
  const at = hash(slot * 3.7 + seed) * (every - 1);
  const d = local - at;
  if (d >= 0 && d < 0.9) glow(ctx, x + (hash(slot) - 0.5) * 420, y, r, color, Math.sin(Math.min(1, d / 0.18) * Math.PI * 0.5) * (1 - d / 0.9) * 0.7);
}

export function birds(ctx: Ctx, t: number, y: number, count = 7, color = '#201820', seed = 0): void {
  for (let i = 0; i < count; i++) {
    const x = mod(hash(i + seed) * 1600 + t * (24 + hash(i * 3) * 18), 1800) - 900;
    const yy = y + (hash(i * 5 + seed) - 0.5) * 150 + Math.sin(t * 0.8 + i) * 10;
    const flap = Math.sin(t * 5 + i * 2) * 7;
    const s = 8 + hash(i * 9) * 9;
    line(ctx, [[x - s, yy - flap], [x, yy], [x + s, yy - flap]], color, 2.4);
  }
}

export { noise };
