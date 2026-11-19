/* Sky Ace — screen shake, flash and floating combat text */

export class Effects {
  constructor() {
    this.shake = 0;
    this.flash = 0;
    this.flashColor = '#fff';
    this.floaters = [];
  }

  addShake(amount) { this.shake = Math.min(28, this.shake + amount); }
  addFlash(alpha, color = '#fff') {
    this.flash = Math.max(this.flash, alpha);
    this.flashColor = color;
  }
  floatText(x, y, text, color = '#fff') {
    this.floaters.push({ x, y, text, color, life: 60, max: 60 });
    if (this.floaters.length > 40) this.floaters.shift();
  }

  update() {
    this.shake *= 0.86;
    if (this.shake < 0.2) this.shake = 0;
    this.flash *= 0.85;
    if (this.flash < 0.01) this.flash = 0;
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.y -= 0.6;
      f.life--;
      if (f.life <= 0) this.floaters.splice(i, 1);
    }
  }

  offset() {
    if (!this.shake) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.shake,
      y: (Math.random() - 0.5) * this.shake
    };
  }

  drawFloaters(ctx) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '800 14px Inter, system-ui, sans-serif';
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.min(1, f.life / 25);
      ctx.fillStyle = f.color;
      ctx.shadowColor = f.color;
      ctx.shadowBlur = 8;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.restore();
  }

  drawFlash(ctx, w, h) {
    if (this.flash <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(0.65, this.flash);
    ctx.fillStyle = this.flashColor;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
