/* Mystic Quest — pre-rendered layers, particle pool, DPR-capped Canvas 2D */
import { WORLD, REALMS } from './config.js';

function buildBackground(def) {
  const c = document.createElement('canvas');
  c.width = WORLD.w; c.height = WORLD.h;
  const x = c.getContext('2d');
  const sky = x.createLinearGradient(0, 0, 0, WORLD.h);
  sky.addColorStop(0, def.sky[0]); sky.addColorStop(1, def.sky[1]);
  x.fillStyle = sky; x.fillRect(0, 0, WORLD.w, WORLD.h);

  let seed = def.id.length * 7919;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  x.fillStyle = 'rgba(255,255,255,.5)';
  for (let i = 0; i < 70; i++) {
    const px = rnd() * WORLD.w, py = rnd() * WORLD.h * 0.6;
    x.globalAlpha = 0.15 + rnd() * 0.5;
    x.fillRect(px, py, rnd() > 0.8 ? 2 : 1, 1);
  }
  x.globalAlpha = 1;

  x.fillStyle = 'rgba(0,0,0,.18)';
  for (let layer = 0; layer < 3; layer++) {
    const base = WORLD.h * (0.42 + layer * 0.14);
    x.beginPath(); x.moveTo(0, WORLD.h);
    for (let px = 0; px <= WORLD.w; px += 24) {
      x.lineTo(px, base + Math.sin(px / (60 + layer * 20) + layer) * (16 + layer * 8));
    }
    x.lineTo(WORLD.w, WORLD.h); x.closePath(); x.fill();
  }
  x.fillStyle = def.ground;
  x.fillRect(0, WORLD.h * 0.72, WORLD.w, WORLD.h * 0.28);
  x.fillStyle = 'rgba(255,255,255,.04)';
  for (let i = 0; i < 60; i++) x.fillRect(rnd() * WORLD.w, WORLD.h * 0.72 + rnd() * WORLD.h * 0.28, 3, 1);
  return c;
}

export class Renderer {
  constructor(canvas, quality = 'high') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha:false });
    this.quality = quality;
    this.bg = new Map();
    this.view = { scale:1, ox:0, oy:0 };
    this.particles = Array.from({ length:100 }, () => ({ active:false, x:0, y:0, vx:0, vy:0, life:0, max:1, size:2, color:'#fff' }));
    this.pIndex = 0;
    this.resize();
    addEventListener('resize', () => this.resize());
  }
  resize() {
    this.dpr = Math.min(devicePixelRatio || 1, this.quality === 'low' ? 1.25 : 2);
    const r = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.round(r.width * this.dpr));
    this.canvas.height = Math.max(1, Math.round(r.height * this.dpr));
  }
  screenToWorld(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect();
    const cssW = r.width, cssH = r.height;
    const scale = Math.min(cssW / WORLD.w, cssH / WORLD.h);
    const ox = (cssW - WORLD.w * scale) / 2, oy = (cssH - WORLD.h * scale) / 2;
    return { x:(clientX - r.left - ox) / scale, y:(clientY - r.top - oy) / scale };
  }
  background(def) {
    if (!this.bg.has(def.id)) this.bg.set(def.id, buildBackground(def));
    return this.bg.get(def.id);
  }
  emit(x, y, color, count = 6) {
    for (let i = 0; i < count; i++) {
      const p = this.particles[this.pIndex++ % this.particles.length];
      const a = Math.random() * 7, sp = 12 + Math.random() * 46;
      p.active = true; p.x = x; p.y = y;
      p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
      p.max = p.life = 0.35 + Math.random() * 0.5;
      p.size = 1 + Math.random() * 2.5; p.color = color;
    }
  }
  draw(g) {
    const ctx = this.ctx, cw = this.canvas.width, ch = this.canvas.height;
    const cssScale = Math.min(cw / WORLD.w, ch / WORLD.h);
    const ox = (cw - WORLD.w * cssScale) / 2, oy = (ch - WORLD.h * cssScale) / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#050512'; ctx.fillRect(0, 0, cw, ch);
    ctx.save();
    ctx.translate(ox, oy); ctx.scale(cssScale, cssScale);
    ctx.beginPath(); ctx.rect(0, 0, WORLD.w, WORLD.h); ctx.clip();

    const def = REALMS[g.realm];
    ctx.drawImage(this.background(def), 0, 0);
    const px = (g.player.x - WORLD.w / 2) / WORLD.w * 10;
    const py = (g.player.y - WORLD.h / 2) / WORLD.h * 8;
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = def.accent;
    for (let i = 0; i < 8; i++) {
      const fx = ((i * 83 + g.time * 9) % WORLD.w) - px * 2;
      const fy = 60 + ((i * 71 + g.time * 5) % 300) - py;
      ctx.beginPath(); ctx.arc(fx, fy, 1.5, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;

    const layout = g.layout;
    layout.stars.forEach((s, i) => {
      if (g.state.stars[g.realm][i]) return;
      const pulse = 1 + Math.sin(g.time * 3 + s.phase) * 0.18;
      ctx.save(); ctx.translate(s.x, s.y); ctx.scale(pulse, pulse);
      ctx.fillStyle = '#ffe98a'; ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 4 : 11;
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    });

    if (g.spiritReady && !g.state.spirits[g.realm]) {
      const s = layout.spirit;
      ctx.save(); ctx.translate(s.x, s.y);
      const pulse = 1 + Math.sin(g.time * 2) * 0.1;
      ctx.scale(pulse, pulse);
      ctx.fillStyle = def.accent; ctx.globalAlpha = 0.22;
      ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.ellipse(0, 0, 14, 18, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#0a1020';
      ctx.beginPath(); ctx.arc(-5, -3, 2.5, 0, 7); ctx.arc(5, -3, 2.5, 0, 7); ctx.fill();
      ctx.restore();
    }

    if (g.state.spirits[g.realm] && g.realm < REALMS.length - 1) {
      const p = layout.portal;
      ctx.strokeStyle = def.accent; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 22, 28, 0, 0, 7); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '14px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('↑', p.x, p.y + 5);
    }

    const p = g.player;
    ctx.save(); ctx.translate(p.x, p.y);
    if (g.lantern) {
      ctx.fillStyle = 'rgba(255,233,138,.10)';
      ctx.beginPath(); ctx.arc(0, 0, 44 + Math.sin(g.time * 12) * 4, 0, 7); ctx.fill();
    }
    ctx.fillStyle = '#d9a066';
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fill();
    ctx.fillStyle = '#f6d7a8';
    ctx.beginPath(); ctx.arc(0, 4, 8, 0, 7); ctx.fill();
    ctx.fillStyle = '#101626';
    ctx.beginPath(); ctx.arc(-4, -2, 2, 0, 7); ctx.arc(4, -2, 2, 0, 7); ctx.fill();
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath(); ctx.arc(14, -6, 4, 0, 7); ctx.fill();
    ctx.restore();

    this.particles.forEach(pt => {
      if (!pt.active) return;
      ctx.globalAlpha = Math.max(0, pt.life / pt.max);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
    });
    ctx.globalAlpha = 1;

    for (let i = 0; i < this.particles.length; i++) {
      const pt = this.particles[i];
      if (!pt.active) continue;
      pt.x += pt.vx * g.dt; pt.y += pt.vy * g.dt; pt.life -= g.dt;
      if (pt.life <= 0) pt.active = false;
    }
    ctx.restore();
  }
}
