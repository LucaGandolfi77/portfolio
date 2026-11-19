/* CDD RUN — particles, screen shake, flash and floating text */

let particles = [];
let texts = [];
let shakeAmount = 0;
let flashAlpha = 0;
let flashColor = '#ffffff';

const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function burst(x, y, color, count = 16, power = 140) {
  if (reduced()) return;
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const speed = power * (0.4 + Math.random() * 0.8);
    particles.push({
      x, y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 40,
      life: 0.5 + Math.random() * 0.5,
      max: 1,
      size: 2 + Math.random() * 3.5,
      color
    });
  }
  if (particles.length > 400) particles.splice(0, particles.length - 400);
}

export function trail(x, y, color) {
  if (reduced() || Math.random() > 0.5) return;
  particles.push({
    x: x + (Math.random() - 0.5) * 18,
    y: y + Math.random() * 16,
    vx: (Math.random() - 0.5) * 70,
    vy: 110 + Math.random() * 90,
    life: 0.45,
    max: 0.45,
    size: 2 + Math.random() * 3,
    color
  });
}

export function shake(amount = 1) { if (!reduced()) shakeAmount = Math.max(shakeAmount, amount); }

export function flash(color = '#ffffff', alpha = 0.32) {
  if (reduced()) return;
  flashColor = color;
  flashAlpha = alpha;
}

export function floatText(x, y, text, color = '#ffd166') {
  texts.push({ x, y, text, color, life: 0.9, max: 0.9 });
}

export function update(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 220 * dt;
    p.vx *= 1 - 1.4 * dt;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    t.y -= 46 * dt;
    t.life -= dt;
    if (t.life <= 0) texts.splice(i, 1);
  }
  shakeAmount = Math.max(0, shakeAmount - dt * 2.6);
  flashAlpha = Math.max(0, flashAlpha - dt * 1.8);
}

export function shakeOffset() {
  if (shakeAmount <= 0.001) return { x: 0, y: 0 };
  return {
    x: (Math.random() - 0.5) * 14 * shakeAmount,
    y: (Math.random() - 0.5) * 14 * shakeAmount
  };
}

export function drawParticles(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.max));
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawTexts(ctx) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = "800 18px Inter, system-ui, sans-serif";
  for (const t of texts) {
    ctx.globalAlpha = Math.max(0, t.life / t.max);
    ctx.fillStyle = t.color;
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 14;
    ctx.fillText(t.text, t.x, t.y);
  }
  ctx.restore();
}

export function drawFlash(ctx, w, h) {
  if (flashAlpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = flashAlpha;
  ctx.fillStyle = flashColor;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function clear() {
  particles = [];
  texts = [];
  shakeAmount = 0;
  flashAlpha = 0;
}
