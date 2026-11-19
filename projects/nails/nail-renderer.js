/* Nail Art AR — canvas renderer shared by the live AR view and the preview */

export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]
];

const TIPS = [4, 8, 12, 16, 20];
const DIPS = [3, 7, 11, 15, 19];
const PIPS = [2, 6, 10, 14, 18];
const FINGER_WIDTH = [0.86, 1.0, 1.06, 0.96, 0.82];

function shade(hex, amount) {
  const n = parseInt(hex.replace('#', ''), 16);
  if (Number.isNaN(n)) return hex;
  const clamp = v => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `rgb(${r},${g},${b})`;
}

function nailPath(ctx, shape, w, bedY, topY) {
  const h = w / 2;
  ctx.beginPath();
  ctx.moveTo(-h * 0.92, bedY);
  switch (shape) {
    case 'round':
      ctx.bezierCurveTo(-h, bedY * 0.45, -h, topY + h * 0.9, -h * 0.62, topY + h * 0.22);
      ctx.bezierCurveTo(-h * 0.34, topY - h * 0.16, h * 0.34, topY - h * 0.16, h * 0.62, topY + h * 0.22);
      ctx.bezierCurveTo(h, topY + h * 0.9, h, bedY * 0.45, h * 0.92, bedY);
      break;
    case 'square':
      ctx.lineTo(-h, topY + h * 0.24);
      ctx.quadraticCurveTo(-h, topY, -h + h * 0.24, topY);
      ctx.lineTo(h - h * 0.24, topY);
      ctx.quadraticCurveTo(h, topY, h, topY + h * 0.24);
      ctx.lineTo(h * 0.92, bedY);
      break;
    case 'stiletto':
      ctx.quadraticCurveTo(-h * 0.92, topY * 0.2, 0, topY);
      ctx.quadraticCurveTo(h * 0.92, topY * 0.2, h * 0.92, bedY);
      break;
    case 'almond':
      ctx.bezierCurveTo(-h * 1.02, bedY * 0.2, -h * 0.52, topY + h * 0.3, 0, topY);
      ctx.bezierCurveTo(h * 0.52, topY + h * 0.3, h * 1.02, bedY * 0.2, h * 0.92, bedY);
      break;
    case 'coffin':
      ctx.lineTo(-h * 0.78, topY + h * 0.2);
      ctx.quadraticCurveTo(-h * 0.62, topY, -h * 0.34, topY);
      ctx.lineTo(h * 0.34, topY);
      ctx.quadraticCurveTo(h * 0.62, topY, h * 0.78, topY + h * 0.2);
      ctx.lineTo(h * 0.92, bedY);
      break;
  }
  ctx.quadraticCurveTo(0, bedY + h * 0.28, -h * 0.92, bedY);
  ctx.closePath();
}

function paintNail(ctx, g, design) {
  const { x, y, angle, w, bedY, topY, opacity, foreshorten } = g;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);
  ctx.scale(1, Math.max(0.42, foreshorten * 0.5 + 0.5));
  ctx.globalAlpha = opacity;

  // soft drop shadow under the free edge
  nailPath(ctx, design.shape, w, bedY, topY);
  if (design.lighting) {
    ctx.shadowColor = 'rgba(0,0,0,.55)';
    ctx.shadowBlur = Math.max(5, w * 0.35);
    ctx.shadowOffsetY = Math.max(2, w * 0.12);
  }

  const grad = ctx.createLinearGradient(0, bedY, 0, topY - w * 0.12);
  grad.addColorStop(0, shade(design.c1, -16));
  grad.addColorStop(0.38, design.c1);
  grad.addColorStop(1, design.c2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.save();
  nailPath(ctx, design.shape, w, bedY, topY);
  ctx.clip();

  if (design.lighting) {
    // cylindrical curvature across the nail
    const side = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    side.addColorStop(0, 'rgba(0,0,0,.34)');
    side.addColorStop(0.3, 'rgba(0,0,0,0)');
    side.addColorStop(0.72, 'rgba(0,0,0,0)');
    side.addColorStop(1, 'rgba(0,0,0,.3)');
    ctx.fillStyle = side;
    ctx.fillRect(-w, topY - w, w * 2, bedY - topY + w * 2);

    // cuticle shadow at the root
    const root = ctx.createLinearGradient(0, bedY, 0, bedY - w * 0.55);
    root.addColorStop(0, 'rgba(80,30,45,.34)');
    root.addColorStop(1, 'rgba(80,30,45,0)');
    ctx.fillStyle = root;
    ctx.fillRect(-w, bedY - w, w * 2, w);
  }

  // free edge translucency for longer nails
  if (design.length > 1.15) {
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    ctx.fillRect(-w, topY, w * 2, Math.max(1.5, w * 0.09));
  }

  // specular band + secondary glint
  const shine = design.lighting ? 0.14 + design.gloss * 0.6 : design.gloss * 0.3;
  const hy = topY + (bedY - topY) * 0.36;
  const spec = ctx.createRadialGradient(-w * 0.16, hy, 0, -w * 0.16, hy, w * 0.62);
  spec.addColorStop(0, `rgba(255,255,255,${shine})`);
  spec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = spec;
  ctx.fillRect(-w, topY - w, w * 2, bedY - topY + w * 2);

  if (design.lighting && design.gloss > 0.25) {
    ctx.fillStyle = `rgba(255,255,255,${shine * 0.45})`;
    ctx.beginPath();
    ctx.ellipse(w * 0.2, hy + (bedY - topY) * 0.18, w * 0.09, (bedY - topY) * 0.16, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  if (design.sparkle) {
    for (let i = 0; i < 9; i++) {
      const px = ((i * 37) % 100) / 100 - 0.5;
      const py = ((i * 61) % 100) / 100;
      ctx.fillStyle = `rgba(255,255,255,${0.35 + (i % 3) * 0.18})`;
      ctx.beginPath();
      ctx.arc(px * w, topY + py * (bedY - topY), Math.max(0.8, w * 0.022), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // crisp rim light
  nailPath(ctx, design.shape, w, bedY, topY);
  ctx.strokeStyle = `rgba(255,255,255,${design.lighting ? 0.5 : 0.28})`;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

export class NailRenderer {
  constructor(canvas, design) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.design = design;
    this.w = 1;
    this.h = 1;
  }

  resize(w, h, dpr) {
    this.w = w;
    this.h = h;
    this.canvas.width = Math.max(1, Math.round(w * dpr));
    this.canvas.height = Math.max(1, Math.round(h * dpr));
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  clear() { this.ctx.clearRect(0, 0, this.w, this.h); }

  renderPreview() {
    const ctx = this.ctx;
    this.clear();
    const cx = this.w / 2;
    const cy = this.h / 2;
    ctx.save();

    // soft finger silhouette
    const skin = ctx.createLinearGradient(cx - 34, 0, cx + 34, 0);
    skin.addColorStop(0, '#7b5566');
    skin.addColorStop(0.45, '#d8a895');
    skin.addColorStop(1, '#8c6272');
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.moveTo(cx - 30, this.h);
    ctx.quadraticCurveTo(cx - 32, cy + 10, cx - 28, cy - 4);
    ctx.quadraticCurveTo(cx, cy - 22, cx + 28, cy - 4);
    ctx.quadraticCurveTo(cx + 32, cy + 10, cx + 30, this.h);
    ctx.closePath();
    ctx.fill();

    paintNail(ctx, {
      x: cx,
      y: cy + 12,
      angle: -Math.PI / 2,
      w: 56,
      bedY: 32,
      topY: -30 - (this.design.state.length - 1) * 46,
      opacity: 1,
      foreshorten: 1
    }, this.design.state);
    ctx.restore();
  }

  renderHands(hands, debug = false) {
    this.clear();
    hands.forEach((hand, hi) => {
      const pts = hand.points;
      if (!pts || pts.length < 21) return;
      const opacity = hand.facing === 'palm' ? 0.12 : 1;

      TIPS.forEach((tipIdx, i) => {
        const tip = pts[tipIdx];
        const dip = pts[DIPS[i]];
        const pip = pts[PIPS[i]];
        if (!tip || !dip || !pip) return;
        const dx = tip.x - dip.x;
        const dy = tip.y - dip.y;
        const dz = tip.z - dip.z;
        const bone3D = Math.hypot(dx, dy, dz);
        if (bone3D < 4) return;
        const dist2D = Math.hypot(dx, dy);
        const foreshorten = Math.max(0.25, Math.min(1, dist2D / bone3D));
        const angle = dist2D > 4 ? Math.atan2(dy, dx) : Math.atan2(tip.y - pip.y, tip.x - pip.x);
        const w = Math.max(9, Math.min(34, bone3D * 0.74 * FINGER_WIDTH[i]));
        const bedY = bone3D * 0.46;
        const topY = -(1.5 + Math.max(0, this.design.state.length - 1) * bone3D * 0.8);
        paintNail(this.ctx, { x: tip.x, y: tip.y, angle, w, bedY, topY, opacity, foreshorten }, this.design.state);
      });

      if (debug) this.drawSkeleton(pts, hi);
    });
  }

  drawSkeleton(pts, handIndex) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = handIndex === 0 ? 'rgba(77,232,255,.9)' : 'rgba(169,139,255,.9)';
    ctx.fillStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (const [a, b] of HAND_CONNECTIONS) {
      if (!pts[a] || !pts[b]) continue;
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    TIPS.forEach(idx => {
      const p = pts[idx];
      if (!p) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "600 10px 'JetBrains Mono', monospace";
      ctx.fillText(String(idx), p.x + 6, p.y - 6);
    });
    ctx.restore();
  }
}
