/**
 * render.js — disegno dei puppet, props e particelle su Canvas2D.
 */

import { clamp } from './rig.js';

const TAU = Math.PI * 2;

function eye(ctx, style, x, y, r, rig, character) {
  ctx.save();
  ctx.translate(x, y);
  if (style === 'alien') {
    ctx.fillStyle = '#0b0f08';
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.85, r * 1.25, -0.5, 0, TAU); ctx.fill();
    ctx.fillStyle = character.body;
    ctx.beginPath(); ctx.ellipse(-r * 0.15, -r * 0.2, r * 0.2, r * 0.3, -0.5, 0, TAU); ctx.fill();
  } else if (style === 'cat') {
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#16121f';
    ctx.beginPath(); ctx.ellipse(clamp(rig.eyeVX * 0.03, -r * 0.3, r * 0.3), 0, r * 0.18, r * 0.6, 0, 0, TAU); ctx.fill();
  } else if (style === 'patch') {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(-r * 1.6, -r * 0.35, r * 3.2, r * 0.7);
  } else if (style === 'star') {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const angle = (i / 10) * TAU - Math.PI / 2;
      const radius = i % 2 ? r * 0.25 : r * 0.55;
      const px = Math.cos(angle) * radius, py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  } else if (style === 'slit') {
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.fillStyle = '#d50000';
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.22, r * 0.68, 0, 0, TAU); ctx.fill();
  } else if (style === 'rect') {
    ctx.shadowColor = '#67e8f9'; ctx.shadowBlur = 12;
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(-r * 0.8, -r * 0.5, r * 1.6, r);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#05202a';
    ctx.fillRect(clamp(rig.eyeVX * 0.04, -r * 0.2, r * 0.2) - r * 0.12, -r * 0.5, r * 0.24, r);
  } else {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.fillStyle = '#16121f';
    ctx.beginPath();
    ctx.arc(clamp(rig.eyeVX * 0.05, -r * 0.45, r * 0.45), clamp(r * 0.18 + rig.eyeVY * 0.04, -r * 0.4, r * 0.5), r * 0.4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.beginPath(); ctx.arc(-r * 0.18, -r * 0.2, r * 0.12, 0, TAU); ctx.fill();
    if (style === 'lash') {
      ctx.strokeStyle = '#5a4a7a'; ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath(); ctx.moveTo(i * r * 0.45, -r * 0.85); ctx.lineTo(i * r * 0.62, -r * 1.2); ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function mouth(ctx, character, x, y, size, open) {
  const wide = size * (0.5 + open * 0.8);
  const tall = size * (0.08 + open * 0.5);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = character.dark;
  ctx.beginPath(); ctx.ellipse(0, 0, wide + size * 0.1, tall + size * 0.08, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = character.inner;
  ctx.beginPath(); ctx.ellipse(0, 0, wide, Math.max(size * 0.05, tall), 0, 0, TAU); ctx.fill();
  if (character.mouth === 'rainbow') {
    const colors = ['#ff5f6d', '#ffd166', '#b6ff6a', '#67e8f9', '#a78bfa'];
    colors.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.fillRect(-wide + (wide * 2 / colors.length) * index, -tall * 0.2, wide * 2 / colors.length, tall * 0.25);
    });
  } else if (open > 0.3) {
    ctx.fillStyle = character.tongue;
    ctx.beginPath(); ctx.ellipse(0, tall * 0.5, wide * 0.5, tall * 0.4, 0, 0, Math.PI); ctx.fill();
  }
  if (character.mouth === 'spiky' && open > 0.25) {
    ctx.fillStyle = '#fff';
    const step = Math.max(6, wide / 4);
    for (let tx = -wide * 0.8; tx < wide * 0.8; tx += step) {
      ctx.beginPath();
      ctx.moveTo(tx, -tall * 0.7); ctx.lineTo(tx + step / 2, tall * 0.1); ctx.lineTo(tx + step, -tall * 0.7);
      ctx.moveTo(tx, tall * 0.7); ctx.lineTo(tx + step / 2, -tall * 0.1); ctx.lineTo(tx + step, tall * 0.7);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawPuppet(ctx, character, rig, options = {}) {
  if (!ctx || !character || !rig) return;
  const size = clamp(rig.scale, 36, 260);
  ctx.save();
  ctx.translate(rig.x, rig.y);
  ctx.rotate(rig.angle);
  ctx.shadowColor = 'rgba(0,0,0,.35)';
  ctx.shadowBlur = size * 0.25;
  ctx.shadowOffsetY = size * 0.12;

  const gradient = ctx.createLinearGradient(-size, -size, size, size);
  gradient.addColorStop(0, character.body);
  gradient.addColorStop(1, character.dark);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.92, 0, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.22)';
  ctx.lineWidth = Math.max(2, size * 0.035);
  ctx.stroke();

  // specular
  const shine = ctx.createRadialGradient(-size * 0.3, -size * 0.45, 1, -size * 0.3, -size * 0.45, size);
  shine.addColorStop(0, 'rgba(255,255,255,.35)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine;
  ctx.beginPath(); ctx.ellipse(0, 0, size, size * 0.92, 0, 0, TAU); ctx.fill();

  const eyeY = -size * 0.2;
  const eyeR = size * 0.22;
  eye(ctx, character.eye, -size * 0.38, eyeY, eyeR, rig, character);
  eye(ctx, character.eye, size * 0.38, eyeY, eyeR, rig, character);
  mouth(ctx, character, 0, size * 0.38, size * 0.42, clamp(rig.open, 0, 1));

  (options.props || []).forEach((prop) => {
    ctx.font = Math.round(size * 0.7) + 'px serif';
    ctx.textAlign = 'center';
    ctx.fillText(prop.emoji, prop.id === 'hat' || prop.id === 'crown' || prop.id === 'halo' ? 0 : size * 0.5,
      prop.id === 'hat' || prop.id === 'crown' || prop.id === 'halo' ? -size * 1.05 : size * 0.2);
  });
  ctx.restore();
}

export function spawnBurst(list, character, rig, preset, count = 6) {
  for (let i = 0; i < count; i += 1) {
    list.push({
      x: rig.x, y: rig.y - rig.scale * 0.3,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 3 - 0.5,
      life: 1, decay: 0.008 + Math.random() * 0.01,
      size: 3 + Math.random() * 6,
      color: preset.colors[Math.floor(Math.random() * preset.colors.length)],
      spin: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * TAU
    });
  }
  if (list.length > 160) list.splice(0, list.length - 160);
}

export function updateParticles(list, preset) {
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const particle = list[i];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += preset.gravity;
    particle.rotation += particle.spin;
    particle.life -= particle.decay;
    if (particle.life <= 0) list.splice(i, 1);
  }
}

export function drawParticles(ctx, list) {
  if (!ctx) return;
  ctx.save();
  for (const particle of list) {
    ctx.globalAlpha = clamp(particle.life, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
    ctx.restore();
  }
  ctx.restore();
}
