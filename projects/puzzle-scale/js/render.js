/* Scale Puzzle — canvas board with neon cells and animated path preview */
import { PALETTE } from './config.js';
import { keyOf } from './generator.js';

const TAU = Math.PI * 2;

export class Board {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = 1; this.w = 0; this.h = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(200, r.width); this.h = Math.max(200, r.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
  }
  cellRect(r, c, size) {
    const pad = 14;
    const cell = Math.min((this.w - pad * 2) / size, (this.h - pad * 2) / size);
    const ox = (this.w - cell * size) / 2, oy = (this.h - cell * size) / 2;
    return { x: ox + c * cell + 3, y: oy + r * cell + 3, s: cell - 6 };
  }
  center(r, c, size) {
    const q = this.cellRect(r, c, size);
    return { x: q.x + q.s / 2, y: q.y + q.s / 2 };
  }
  hitTest(x, y, size) {
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
      const q = this.cellRect(r, c, size);
      if (x >= q.x && x <= q.x + q.s && y >= q.y && y <= q.y + q.s) return { r, c };
    }
    return null;
  }
  roundRect(x, y, w, h, rad) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }
  draw(scene, fx) {
    const ctx = this.ctx, s = scene.size || 3, t = scene.time || 0;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    const off = fx.offset();
    ctx.save(); ctx.translate(off.x, off.y);

    const solution = scene.solution || new Map();
    const preview = scene.status === 'preview' ? scene.previewProgress || 0 : -1;
    const completed = new Set(scene.completed || []);

    for (let r = 0; r < s; r++) {
      for (let c = 0; c < s; c++) {
        const q = this.cellRect(r, c, s);
        const idx = solution.get(keyOf({ r, c }));
        const done = completed.has(keyOf({ r, c }));
        const isNext = scene.hint && scene.hint.r === r && scene.hint.c === c;
        const glow = done || isNext;
        ctx.save();
        ctx.shadowColor = isNext ? PALETTE.gold : done ? PALETTE.cyan : 'transparent';
        ctx.shadowBlur = glow ? 18 + Math.sin(t * 6) * 5 : 0;
        ctx.fillStyle = done ? 'rgba(77,232,255,.2)' : isNext ? 'rgba(255,209,102,.2)' : 'rgba(20,16,42,.85)';
        this.roundRect(q.x, q.y, q.s, q.s, 10); ctx.fill();
        ctx.strokeStyle = done ? PALETTE.cyan : isNext ? PALETTE.gold : 'rgba(169,139,255,.22)';
        ctx.lineWidth = done || isNext ? 2 : 1;
        this.roundRect(q.x, q.y, q.s, q.s, 10); ctx.stroke();
        if (scene.showPattern && idx) {
          ctx.fillStyle = done ? PALETTE.cyan : PALETTE.violet;
          ctx.font = `900 ${Math.max(12, q.s * 0.42)}px Inter, sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(idx), q.x + q.s / 2, q.y + q.s / 2);
        }
        ctx.restore();
      }
    }

    // animated preview path
    if (preview >= 0 && scene.sequence && scene.sequence.length) {
      const pts = scene.sequence.map(cell => this.center(cell.r, cell.c, s));
      ctx.save();
      ctx.strokeStyle = PALETTE.cyan; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.shadowColor = PALETTE.cyan; ctx.shadowBlur = 16;
      ctx.beginPath();
      const upto = Math.min(pts.length - 1, Math.floor(preview * pts.length));
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i <= upto; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
      const active = pts[upto];
      if (active) {
        ctx.fillStyle = PALETTE.gold; ctx.beginPath(); ctx.arc(active.x, active.y, 8, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }

    fx.draw(ctx, this.w, this.h);
    ctx.restore();
  }
}
