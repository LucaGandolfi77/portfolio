/**
 * reactions.js — particelle e reazioni automatiche in stile Snapchat.
 */

const CONFETTI_COLORS = ['#3ee6ff', '#b28dff', '#ff5f9e', '#ffd166', '#52ff9e', '#ffffff'];

function random(min, max) { return min + Math.random() * (max - min); }

export class ReactionSystem {
  constructor() {
    this.particles = [];
    this.previous = { smile: 0, blink: 0, jaw: 0 };
  }

  clear() { this.particles.length = 0; }

  spawn(type, anchor, count = 18) {
    if (!anchor) return;
    for (let i = 0; i < count; i += 1) {
      const angle = random(-Math.PI, 0);
      const speed = random(1.5, 5);
      this.particles.push({
        type,
        x: anchor.cx + random(-anchor.w * 0.25, anchor.w * 0.25),
        y: anchor.cy + random(-anchor.h * 0.1, anchor.h * 0.1),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 0,
        max: random(45, 90),
        size: random(4, 11),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: random(0, Math.PI * 2),
        spin: random(-0.15, 0.15)
      });
    }
    if (this.particles.length > 220) this.particles.splice(0, this.particles.length - 220);
  }

  /** Aggiorna le reazioni in base alle metriche e alla lente attiva. */
  update(metrics, reaction, anchor, tilt) {
    if (!metrics || !anchor) return;
    if (reaction === 'confetti' && metrics.smile > 0.55 && this.previous.smile <= 0.55) {
      this.spawn('confetti', anchor, 26);
    }
    if (reaction === 'sparkles' && metrics.blink > 0.55 && this.previous.blink <= 0.55) {
      this.spawn('sparkles', anchor, 14);
    }
    if (reaction === 'fire' && metrics.jawOpen > 0.45 && this.previous.jaw <= 0.45) {
      this.spawn('fire', anchor, 18);
    }
    this.previous.smile = metrics.smile;
    this.previous.blink = metrics.blink;
    this.previous.jaw = metrics.jawOpen;

    if (reaction === 'rainbow' && Math.abs(tilt || 0) > 0.18 && Math.random() < 0.35) {
      this.spawn('sparkles', anchor, 2);
    }
  }

  /** Disegna e avanza le particelle. */
  draw(ctx) {
    if (!ctx || !this.particles.length) return;
    ctx.save();
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.life += 1;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;
      if (p.type === 'confetti') p.vy += 0.12;
      if (p.type === 'fire') { p.vy -= 0.08; p.vx *= 0.99; }
      if (p.type === 'sparkles') { p.vx *= 0.97; p.vy *= 0.97; }
      const alpha = Math.max(0, 1 - p.life / p.max);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      if (p.type === 'confetti') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.type === 'fire') {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        gradient.addColorStop(0, 'rgba(255,240,150,.95)');
        gradient.addColorStop(0.5, 'rgba(255,120,30,.8)');
        gradient.addColorStop(1, 'rgba(255,40,20,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.font = Math.round(p.size * 2) + 'px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('✨', 0, 0);
      }
      ctx.restore();
      if (p.life >= p.max || p.y < -80) this.particles.splice(i, 1);
    }
    ctx.restore();
  }

  /** Arcobaleno continuo quando la testa si inclina. */
  drawTiltRainbow(ctx, anchor, tilt) {
    if (!anchor || Math.abs(tilt || 0) < 0.18) return;
    ctx.save();
    ctx.globalAlpha = Math.min(0.55, Math.abs(tilt));
    ctx.lineWidth = Math.max(4, anchor.w * 0.035);
    const colors = ['#ff5f6d', '#ffd166', '#52ff9e', '#3ee6ff', '#b28dff'];
    colors.forEach((color, i) => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(anchor.cx, anchor.cy, anchor.w * (0.7 + i * 0.08), Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
    });
    ctx.restore();
  }
}
