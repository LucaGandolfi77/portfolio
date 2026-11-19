/* GEOM DASH — pooled particles and screen feedback */

const POOL = 260;

export function createEffects() {
  const particles = Array.from({ length: POOL }, () => ({
    active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 2, color: '#fff', gravity: 600
  }));
  return { particles, shake: 0, flash: 0, flashColor: '#ffffff' };
}

export function burst(effects, x, y, color, count = 16, power = 280) {
  let spawned = 0;
  for (let i = 0; i < effects.particles.length && spawned < count; i++) {
    const p = effects.particles[i];
    if (p.active) continue;
    const angle = Math.random() * Math.PI * 2;
    const speed = power * (0.35 + Math.random() * 0.8);
    p.active = true;
    p.x = x; p.y = y;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - 80;
    p.life = 0.35 + Math.random() * 0.5;
    p.max = p.life;
    p.size = 2 + Math.random() * 4;
    p.color = color;
    p.gravity = 700;
    spawned++;
  }
}

export function updateEffects(effects, dt) {
  for (let i = 0; i < effects.particles.length; i++) {
    const p = effects.particles[i];
    if (!p.active) continue;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += p.gravity * dt;
    p.vx *= 1 - 1.1 * dt;
    p.life -= dt;
    if (p.life <= 0) p.active = false;
  }
  effects.shake = Math.max(0, effects.shake - dt * 2.4);
  effects.flash = Math.max(0, effects.flash - dt * 2.2);
}

export function addShake(effects, amount = 0.5) {
  effects.shake = Math.min(1, effects.shake + amount);
}

export function addFlash(effects, color = '#ffffff', alpha = 0.3) {
  effects.flashColor = color;
  effects.flash = alpha;
}

export function resetEffects(effects) {
  for (const p of effects.particles) p.active = false;
  effects.shake = 0;
  effects.flash = 0;
}

export function shakeOffset(effects) {
  if (effects.shake <= 0.001) return { x: 0, y: 0 };
  const amount = effects.shake * 11;
  return { x: (Math.random() - 0.5) * amount, y: (Math.random() - 0.5) * amount };
}
