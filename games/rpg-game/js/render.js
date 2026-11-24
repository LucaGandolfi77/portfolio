/* RPG Adventure — procedural Canvas 2D renderer (no image assets) */
import { WORLD } from './config.js';
import { rng } from './core/entities.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = 1;
    this.decor = new Map();
    this.resize();
    addEventListener('resize', () => this.resize());
  }
  resize() {
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    const r = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.round(r.width * this.dpr));
    this.canvas.height = Math.max(1, Math.round(r.height * this.dpr));
  }
  decorFor(zone) {
    if (!this.decor.has(zone.id)) {
      const r = rng(zone.id.length * 97 + 7);
      const items = [];
      for (let i = 0; i < 26; i++) {
        items.push({ x: r() * WORLD.width, y: r() * WORLD.height, s: 8 + r() * 16, kind: r() > 0.5 ? 'tree' : 'rock' });
      }
      this.decor.set(zone.id, items);
    }
    return this.decor.get(zone.id);
  }
  draw(g) {
    const { ctx } = this;
    const w = this.canvas.width, h = this.canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = g.zone.sky;
    ctx.fillRect(0, 0, w, h);
    const scale = Math.min(w / WORLD.width, h / WORLD.height);
    const ox = (w - WORLD.width * scale) / 2, oy = (h - WORLD.height * scale) / 2;
    ctx.setTransform(scale, 0, 0, scale, ox, oy);

    /* ground + grid */
    const grd = ctx.createLinearGradient(0, 0, WORLD.width, WORLD.height);
    grd.addColorStop(0, g.zone.ground);
    grd.addColorStop(1, g.zone.sky);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    ctx.strokeStyle = g.zone.grid; ctx.lineWidth = 1;
    for (let x = 0; x <= WORLD.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.height); ctx.stroke(); }
    for (let y = 0; y <= WORLD.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.width, y); ctx.stroke(); }

    /* decorations */
    this.decorFor(g.zone).forEach(d => {
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = d.kind === 'tree' ? g.zone.accent : '#9aa6c0';
      if (d.kind === 'tree') {
        ctx.beginPath(); ctx.arc(d.x, d.y, d.s, 0, 7); ctx.fill();
        ctx.fillRect(d.x - 1.5, d.y, 3, d.s * 0.7);
      } else {
        ctx.beginPath(); ctx.ellipse(d.x, d.y, d.s, d.s * 0.55, 0.4, 0, 7); ctx.fill();
      }
    });
    ctx.globalAlpha = 1;

    /* portals */
    g.zone.portals.forEach(p => {
      const pulse = 1 + Math.sin(g.time * 3 + p.x) * 0.08;
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(pulse, pulse);
      ctx.shadowColor = g.zone.accent; ctx.shadowBlur = 22;
      ctx.strokeStyle = g.zone.accent; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(0, 0, 22, 30, 0, 0, 7); ctx.stroke();
      ctx.fillStyle = g.zone.accent + '22'; ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#fff';
      ctx.font = '12px system-ui'; ctx.textAlign = 'center'; ctx.fillText('↗', 0, 4);
      ctx.restore();
    });

    /* npcs */
    g.npcs.forEach(n => {
      ctx.save(); ctx.translate(n.x, n.y);
      ctx.fillStyle = '#2c6bff'; ctx.shadowColor = '#3d8bff'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(0, -4, 4, 0, 7); ctx.fill();
      ctx.fillRect(-6, 3, 12, 6);
      ctx.fillStyle = '#ffd166'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('!', 0, -22);
      ctx.fillStyle = '#cfe0ff'; ctx.font = '10px system-ui'; ctx.fillText(n.name, 0, 30);
      ctx.restore();
    });

    /* enemies */
    g.enemies.forEach(e => {
      if (!e.alive) return;
      const def = e.def;
      ctx.save(); ctx.translate(e.x, e.y);
      ctx.globalAlpha = e.hitFlash > 0 ? 0.6 : 1;
      ctx.shadowColor = def.color; ctx.shadowBlur = 16;
      ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : def.color;
      ctx.beginPath(); ctx.arc(0, 0, def.size, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0a0a14';
      ctx.beginPath(); ctx.arc(-5, -2, 2.5, 0, 7); ctx.arc(5, -2, 2.5, 0, 7); ctx.fill();
      ctx.fillRect(-6, def.size + 4, 22, 4);
      ctx.fillStyle = '#ff5d6c'; ctx.fillRect(-6, def.size + 4, 22 * Math.max(0, e.hp / e.maxHp), 4);
      ctx.restore();
    });

    /* projectiles */
    g.projectiles.forEach(p => {
      ctx.save(); ctx.shadowColor = '#ff8a3d'; ctx.shadowBlur = 18;
      ctx.fillStyle = p.color || '#ff6a2b';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r || 7, 0, 7); ctx.fill();
      ctx.restore();
    });

    /* player */
    const p = g.player;
    ctx.save(); ctx.translate(p.x, p.y);
    if (g.invuln > 0 && Math.floor(g.time * 14) % 2) ctx.globalAlpha = 0.45;
    if (g.shield > 0) {
      ctx.strokeStyle = '#5aa9ff'; ctx.lineWidth = 3;
      ctx.shadowColor = '#5aa9ff'; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(0, 0, 26 + Math.sin(g.time * 8) * 2, 0, 7); ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = '#0b2b3a';
    ctx.beginPath(); ctx.moveTo(-p.facing * 10, 0); ctx.lineTo(-p.facing * 22, 16); ctx.lineTo(-p.facing * 4, 10); ctx.fill();
    ctx.fillStyle = g.attacking > 0 ? '#ffe066' : '#3ee6ff';
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, 7); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#071320';
    ctx.beginPath(); ctx.arc(p.facing * 5, -3, 2.6, 0, 7); ctx.fill();
    ctx.strokeStyle = '#e8f6ff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(p.facing * 10, 4); ctx.lineTo(p.facing * (g.attacking > 0 ? 30 : 20), g.attacking > 0 ? -8 : 12); ctx.stroke();
    ctx.restore();

    /* particles + floating numbers */
    g.particles.forEach(p2 => {
      ctx.globalAlpha = Math.max(0, p2.life / p2.maxLife);
      ctx.fillStyle = p2.color;
      ctx.beginPath(); ctx.arc(p2.x, p2.y, p2.size, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;
    g.floaters.forEach(f => {
      ctx.globalAlpha = Math.max(0, f.life / f.maxLife);
      ctx.fillStyle = f.color; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
    });
    ctx.globalAlpha = 1;

    /* vignette */
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.72);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  }
}
