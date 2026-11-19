/* CDD RUN — canvas renderer */

import { drawParticles, drawTexts, drawFlash, shakeOffset } from './effects.js';

export function createRenderer(canvas, world) {
  const ctx = canvas.getContext('2d');
  let dpr = 1;
  let w = 0, h = 0;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    world.resize(w, h);
  }

  function sky() {
    const { horizon } = world.dims;
    const g = ctx.createLinearGradient(0, 0, 0, horizon);
    g.addColorStop(0, '#070b1c');
    g.addColorStop(0.55, '#1b1d4f');
    g.addColorStop(1, '#4b2a70');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, horizon);

    for (const s of world.stars) {
      const a = 0.3 + 0.55 * (0.5 + 0.5 * Math.sin(world.time * 2 + s.tw));
      ctx.globalAlpha = a;
      ctx.fillStyle = '#dbe6ff';
      ctx.fillRect(s.x * w, s.y * horizon, s.r, s.r);
    }
    ctx.globalAlpha = 1;

    const glow = ctx.createRadialGradient(w / 2, horizon, 0, w / 2, horizon, w * 0.45);
    glow.addColorStop(0, 'rgba(236,72,153,.22)');
    glow.addColorStop(1, 'rgba(236,72,153,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, horizon);
  }

  function hills() {
    const { horizon } = world.dims;
    for (const hill of world.hills) {
      const speed = hill.layer ? 9 : 5;
      const offset = (world.time * speed) % (w * 1.3);
      const base = hill.x * w * 1.5 - offset;
      const hh = h * hill.h;
      const bw = w * hill.w;
      ctx.fillStyle = hill.layer ? 'rgba(91,76,150,.45)' : 'rgba(58,52,110,.6)';
      for (const shift of [0, bw * 2.1]) {
        const x = base + shift;
        ctx.beginPath();
        ctx.moveTo(x - bw, horizon + 2);
        ctx.quadraticCurveTo(x - bw / 2, horizon - hh * 2.2, x + bw / 2, horizon);
        ctx.quadraticCurveTo(x + bw * 0.75, horizon - hh * 0.8, x + bw, horizon + 2);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  function clouds() {
    ctx.fillStyle = 'rgba(226,232,255,.14)';
    for (const c of world.clouds) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.s / 2, 0, Math.PI * 2);
      ctx.arc(c.x + c.s / 3, c.y - c.s / 4, c.s / 3, 0, Math.PI * 2);
      ctx.arc(c.x - c.s / 3, c.y - c.s / 4, c.s / 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function ground() {
    const { horizon } = world.dims;
    const g = ctx.createLinearGradient(0, horizon, 0, h);
    g.addColorStop(0, '#2b2352');
    g.addColorStop(0.3, '#191a3a');
    g.addColorStop(1, '#0a0b18');
    ctx.fillStyle = g;
    ctx.fillRect(0, horizon, w, h - horizon);

    ctx.strokeStyle = 'rgba(110,231,255,.24)';
    ctx.lineWidth = Math.max(1.5, w * 0.003);
    for (let lane = 0; lane <= 3; lane++) {
      const l = lane - 1.5;
      const far = world.project(1, 4000);
      const xNear = w / 2 + l * world.dims.laneW;
      const xFar = w / 2 + l * world.dims.laneW * (0.32 + 0.68 * far.persp);
      ctx.beginPath();
      ctx.moveTo(xFar, far.y);
      ctx.lineTo(xNear, h);
      ctx.stroke();
    }

    const gap = 170;
    const off = (world.time * world.speed * 0.9) % gap;
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    for (let d = off; d < 2600; d += gap) {
      const p = world.project(1, d);
      const half = 34 * p.persp;
      ctx.fillRect(w / 2 - half, p.y, half * 2, Math.max(2, 5 * p.persp));
    }
  }

  function cube(x, y, width, height, color) {
    const top = Math.max(5, height * 0.22);
    ctx.fillStyle = color;
    ctx.fillRect(x - width / 2, y - height, width, height);
    ctx.fillStyle = 'rgba(255,255,255,.2)';
    ctx.beginPath();
    ctx.moveTo(x - width / 2, y - height);
    ctx.lineTo(x - width / 2 + width * 0.22, y - height - top);
    ctx.lineTo(x + width / 2 + width * 0.22, y - height - top);
    ctx.lineTo(x + width / 2, y - height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y - height);
    ctx.lineTo(x + width / 2 + width * 0.22, y - height - top);
    ctx.lineTo(x + width / 2 + width * 0.22, y - top * 0.6);
    ctx.lineTo(x + width / 2, y);
    ctx.closePath();
    ctx.fill();
  }

  function obstacle(ob) {
    const p = world.project(ob.lane, ob.z - world.time);
    const s = p.scale;
    const tall = ob.type === 'tall';
    const bw = (tall ? 44 : 62) * s;
    const bh = (tall ? 110 : 56) * s;
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, bw * 0.6, bw * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    cube(p.x, p.y, bw, bh, tall ? '#e11d8f' : '#f43f5e');
    ctx.strokeStyle = tall ? 'rgba(255,190,230,.85)' : 'rgba(255,210,210,.7)';
    ctx.lineWidth = 2 * s;
    ctx.strokeRect(p.x - bw / 2, p.y - bh, bw, bh);
    if (tall) {
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.font = `${Math.max(8, 14 * s)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('✕', p.x, p.y - bh * 0.55);
    }
  }

  function coin(c) {
    const p = world.project(c.lane, c.z - world.time);
    const r = 13 * p.scale;
    const spin = Math.sin(world.time * 6 + c.phase);
    ctx.fillStyle = 'rgba(255,209,102,.22)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 1.7, 0, Math.PI * 2);
    ctx.fill();
    const g = ctx.createRadialGradient(p.x - r * 0.3, p.y - r * 0.3, r * 0.2, p.x, p.y, r);
    g.addColorStop(0, '#fff8d0');
    g.addColorStop(0.5, '#ffd166');
    g.addColorStop(1, '#d99a10');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y - r * 0.3, r * Math.max(0.25, Math.abs(spin)), r, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function powerup(p) {
    const pos = world.project(p.lane, p.z - world.time);
    const r = 18 * pos.scale;
    const colors = { shield: '#38bdf8', magnet: '#a855f7', turbo: '#f43f5e' };
    const icons = { shield: '🛡️', magnet: '🧲', turbo: '⚡' };
    const pulse = 1 + Math.sin(world.time * 5 + p.z) * 0.12;
    ctx.fillStyle = colors[p.type] + '33';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r * 1.7 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors[p.type];
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = `${r * 1.3}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icons[p.type], pos.x, pos.y + 1);
  }

  function player() {
    const p = world.project(world.player.lane, 0);
    const s = p.scale * 0.9;
    const bw = 46 * s;
    const bh = 84 * s;
    const jump = -world.player.jumpH * 0.5;
    const x = p.x;
    const base = p.y + jump;
    const bob = world.player.jumping ? 0 : Math.sin(world.player.runPhase) * 2 * s;

    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath();
    ctx.ellipse(x, p.y, bw * 0.55, bw * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    if (world.shield || world.magnet || world.turbo) {
      ctx.strokeStyle = world.shield ? 'rgba(56,189,248,.8)' : world.magnet ? 'rgba(168,85,247,.75)' : 'rgba(244,63,94,.75)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash(world.magnet ? [4, 7] : [7, 5]);
      ctx.beginPath();
      ctx.arc(x, base - bh / 2 + bob, bw * 0.92, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const grad = ctx.createLinearGradient(x, base - bh, x, base);
    grad.addColorStop(0, world.shield ? '#38bdf8' : '#818cf8');
    grad.addColorStop(1, '#4338ca');
    ctx.fillStyle = grad;
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 18;
    roundRect(x - bw / 2, base - bh + bob, bw, bh, bw * 0.38);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0b1026';
    roundRect(x - bw * 0.33, base - bh * 0.72 + bob, bw * 0.66, bh * 0.23, bw * 0.16);
    ctx.fill();
    ctx.fillStyle = '#7dd3fc';
    roundRect(x - bw * 0.27, base - bh * 0.68 + bob, bw * 0.54, bh * 0.12, bw * 0.1);
    ctx.fill();

    const swing = world.player.jumping ? 0 : Math.sin(world.player.runPhase) * 0.5;
    ctx.fillStyle = '#312e81';
    roundRect(x - bw * 0.34, base - bh * 0.14 + bob, bw * 0.22, bh * 0.22, bw * 0.1);
    ctx.fill();
    roundRect(x + bw * 0.12, base - bh * 0.14 + bob, bw * 0.22, bh * 0.22, bw * 0.1);
    ctx.fill();
    ctx.fillStyle = '#1e1b4b';
    const lx = x - bw * 0.23 + swing * bw * 0.16;
    const rx = x + bw * 0.23 - swing * bw * 0.16;
    roundRect(lx - bw * 0.1, base - bh * 0.02 + bob, bw * 0.2, bh * 0.16, bw * 0.07);
    ctx.fill();
    roundRect(rx - bw * 0.1, base - bh * 0.02 + bob, bw * 0.2, bh * 0.16, bw * 0.07);
    ctx.fill();
  }

  function roundRect(x, y, width, height, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function draw(effects) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const shake = shakeOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);

    sky();
    hills();
    clouds();
    ground();

    if (world.turbo) {
      const p = world.project(world.player.lane, 0);
      effects.trail(p.x, p.y - 10, Math.random() < 0.5 ? '#38bdf8' : '#f43f5e');
    }

    const items = [];
    for (const ob of world.obstacles) items.push({ z: ob.z, draw: () => obstacle(ob) });
    for (const c of world.coinsArr) items.push({ z: c.z, draw: () => coin(c) });
    for (const p of world.powerups) items.push({ z: p.z, draw: () => powerup(p) });
    items.sort((a, b) => b.z - a.z);
    for (const it of items) it.draw();

    player();
    drawParticles(ctx);
    drawTexts(ctx);
    ctx.restore();
    drawFlash(ctx, w, h);
  }

  resize();
  return { resize, draw, ctx };
}
