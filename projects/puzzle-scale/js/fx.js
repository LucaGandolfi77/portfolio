/* Scale Puzzle — particle FX, pulses and shake */
export class FX {
  constructor() { this.particles = []; this.shake = 0; this.flash = 0; this.ripples = []; }
  burst(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, s = 30 + Math.random() * 120;
      this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 0.5 + Math.random() * 0.4, max: 0.9, color, size: 2 + Math.random() * 3 });
    }
  }
  ripple(x, y, color = '#4de8ff') { this.ripples.push({ x, y, r: 4, life: 0.5, color }); }
  hit(amount = 6) { this.shake = Math.min(18, this.shake + amount); }
  blink(a = 0.35) { this.flash = Math.max(this.flash, a); }
  update(dt) {
    this.shake *= 0.88; if (this.shake < 0.2) this.shake = 0;
    this.flash *= 0.86; if (this.flash < 0.01) this.flash = 0;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 180 * dt; p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i]; r.r += 140 * dt; r.life -= dt;
      if (r.life <= 0) this.ripples.splice(i, 1);
    }
  }
  draw(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const r of this.ripples) {
      ctx.globalAlpha = Math.max(0, r.life * 2);
      ctx.strokeStyle = r.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
    }
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    if (this.flash > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(0.6, this.flash);
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.restore();
    }
  }
  offset() { return this.shake ? { x: (Math.random() - 0.5) * this.shake, y: (Math.random() - 0.5) * this.shake } : { x: 0, y: 0 }; }
}
