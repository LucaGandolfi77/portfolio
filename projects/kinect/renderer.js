/* Kinetic — canvas effects: hand skeleton, orbs, particles, floating text */

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]
];
const RETICLE_POINTS = [8, 0];

export class Renderer {
  constructor(viewport) {
    this.vp = viewport;
    this.ctx = viewport.ctx;
  }

  draw(game, hands, now) {
    const ctx = this.ctx;
    const t = now / 1000;
    ctx.clearRect(0, 0, this.vp.w, this.vp.h);
    this.drawHands(hands, t);
    this.drawTargets(game.targets, t);
    this.drawParticles(game.particles);
    this.drawPopups(game.popups);
  }

  drawHands(hands, t) {
    const ctx = this.ctx;
    if (!hands || !hands.length) return;
    hands.forEach((hand, hi) => {
      const pts = hand.points;
      if (!pts || pts.length < 21) return;
      const hue = hi === 0 ? 188 : 266;
      const stroke = `hsla(${hue},100%,68%,.95)`;

      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.shadowColor = `hsla(${hue},100%,60%,.9)`;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      for (const [a, b] of HAND_CONNECTIONS) {
        const p1 = pts[a], p2 = pts[b];
        if (!p1 || !p2) continue;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.shadowColor = stroke;
      ctx.shadowBlur = 10;
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,.92)';
        ctx.fill();
      }
      ctx.restore();

      RETICLE_POINTS.forEach((idx, ri) => {
        const p = pts[idx];
        if (!p) return;
        this.drawReticle(p.x, p.y, hue, t, ri);
      });
    });
  }

  drawReticle(x, y, hue, t, offset) {
    const ctx = this.ctx;
    const pulse = 0.5 + 0.5 * Math.sin(t * 5 + offset * 1.6);
    const r = 21 + pulse * 3;
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = `hsla(${hue},100%,72%,${0.55 + pulse * 0.3})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `hsla(${hue},100%,60%,.9)`;
    ctx.shadowBlur = 12;
    ctx.setLineDash([5, 6]);
    ctx.lineDashOffset = -t * 18;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue},100%,80%,.95)`;
    ctx.fill();
    ctx.restore();
  }

  drawTargets(targets, t) {
    const ctx = this.ctx;
    for (const o of targets) {
      const appear = Math.min(1, o.age * 5);
      const r = o.r * appear;
      if (r <= 0) continue;
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.scale(r / o.r, r / o.r);

      ctx.shadowColor = `hsla(${o.hue},100%,60%,.85)`;
      ctx.shadowBlur = 26;
      const g = ctx.createRadialGradient(-o.r * .3, -o.r * .35, o.r * .1, 0, 0, o.r);
      g.addColorStop(0, `hsla(${o.hue},100%,82%,1)`);
      g.addColorStop(.55, `hsla(${o.hue},100%,58%,.95)`);
      g.addColorStop(1, `hsla(${o.hue},95%,40%,.55)`);
      ctx.beginPath();
      ctx.arc(0, 0, o.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,.75)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.rotate(o.spin);
      ctx.strokeStyle = `hsla(${o.hue},100%,78%,.55)`;
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 9]);
      ctx.lineDashOffset = -t * 12;
      ctx.beginPath();
      ctx.arc(0, 0, o.r + 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(0, 0, o.r * .32, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.fill();
      ctx.restore();
    }
  }

  drawParticles(particles) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.6 + a * 0.6), 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},100%,68%,${a})`;
      ctx.fill();
    }
    ctx.restore();
  }

  drawPopups(popups) {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "700 20px 'JetBrains Mono', monospace";
    for (const p of popups) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a;
      ctx.shadowColor = `hsla(${p.hue},100%,60%,.9)`;
      ctx.shadowBlur = 14;
      ctx.fillStyle = p.hue === 45 ? '#ffd166' : '#ffffff';
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.restore();
  }
}
