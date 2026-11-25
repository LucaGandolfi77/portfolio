/* Slot Collect — lightweight particle/feedback system */

export class Particles {
  constructor() { this.items = []; this.floats = []; this.rings = []; this.shake = 0; this.flash = 0; this.flashColor = '#fff'; }
  burst(x, y, color, count = 20, power = 5) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, v = 1 + Math.random() * power;
      this.items.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1,
        life: 30 + Math.random() * 30, max: 60, color, size: 1.5 + Math.random() * 3.5 });
    }
    if (this.items.length > 500) this.items.splice(0, this.items.length - 500);
  }
  ring(x, y, color, r = 12) { this.rings.push({ x, y, r, color, life: 26, max: 26 }); }
  float(x, y, text, color = '#ffd166') { this.floats.push({ x, y, text, color, life: 70, max: 70 }); }
  hit(amount = 6, color = '#fff') { this.shake = Math.min(22, this.shake + amount); this.flash = Math.max(this.flash, 0.5); this.flashColor = color; }
  update(dt) {
    const k = Math.min(3, dt * 60);
    this.shake *= Math.pow(0.86, k); if (this.shake < 0.2) this.shake = 0;
    this.flash *= Math.pow(0.88, k); if (this.flash < 0.01) this.flash = 0;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i]; p.x += p.vx * k; p.y += p.vy * k; p.vy += 0.12 * k; p.life -= k;
      if (p.life <= 0) this.items.splice(i, 1);
    }
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i]; f.y -= 0.6 * k; f.life -= k;
      if (f.life <= 0) this.floats.splice(i, 1);
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i]; r.r += 1.4 * k; r.life -= k;
      if (r.life <= 0) this.rings.splice(i, 1);
    }
  }
  offset() { return this.shake ? { x: (Math.random() - 0.5) * this.shake, y: (Math.random() - 0.5) * this.shake } : { x: 0, y: 0 }; }
  draw(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.items) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
    }
    for (const r of this.rings) {
      ctx.globalAlpha = Math.max(0, r.life / r.max) * 0.8;
      ctx.strokeStyle = r.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.283); ctx.stroke();
    }
    ctx.restore();
    ctx.save(); ctx.textAlign = 'center'; ctx.font = '900 16px Inter,system-ui,sans-serif';
    for (const f of this.floats) {
      ctx.globalAlpha = Math.min(1, f.life / (f.max * 0.5));
      ctx.fillStyle = f.color; ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.restore();
    if (this.flash > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(0.45, this.flash * 0.4);
      ctx.fillStyle = this.flashColor; ctx.fillRect(0, 0, w, h); ctx.restore();
    }
  }
}
