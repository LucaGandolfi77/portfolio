/* Game Kit — particles, screen shake, flash and floating text */

export class FX {
  constructor() { this.particles = []; this.shake = 0; this.flash = 0; this.floaters = []; }

  burst(x, y, color, count = 12, power = 4) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, s = Math.random() * power;
      this.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 18 + Math.random() * 18, max: 36, color, size: 2 + Math.random() * 3
      });
    }
    if (this.particles.length > 400) this.particles.splice(0, this.particles.length - 400);
  }
  hit(amount = 6) { this.shake = Math.min(20, this.shake + amount); }
  blink(alpha = 0.3, color = '#fff') { this.flash = Math.max(this.flash, alpha); this.flashColor = color; }
  float(x, y, text, color = '#ffd166') {
    this.floaters.push({ x, y, text, color, life: 55 });
    if (this.floaters.length > 30) this.floaters.shift();
  }
  update() {
    this.shake *= 0.86; if (this.shake < 0.2) this.shake = 0;
    this.flash *= 0.85; if (this.flash < 0.01) this.flash = 0;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy; p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i]; f.y -= 0.5; f.life--;
      if (f.life <= 0) this.floaters.splice(i, 1);
    }
  }
  offset() { return this.shake ? { x: (Math.random() - .5) * this.shake, y: (Math.random() - .5) * this.shake } : { x: 0, y: 0 }; }
  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / 30);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '800 14px Inter, system-ui, sans-serif';
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.min(1, f.life / 20);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.restore();
    if (this.flash > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.6, this.flash);
      ctx.fillStyle = this.flashColor || '#fff';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }
}
