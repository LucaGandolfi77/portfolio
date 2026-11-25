/* Slot Collect — high-DPI layered canvas renderer */

import { SYMBOLS, PAYLINES } from '../config.js';
import { symbolSprite } from './symbols.js';
import { Particles } from './particles.js';

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  if (typeof g.roundRect === 'function') { g.roundRect(x, y, w, h, r); return; }
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.p = new Particles();
    this.dpr = 1; this.w = 0; this.h = 0;
    this.stars = Array.from({ length: 90 }, () => ({
      x: Math.random(), y: Math.random(), r: 0.4 + Math.random() * 1.4,
      s: 0.2 + Math.random() * 0.8, c: Math.random() > 0.7 ? '#ff6b9d' : '#4de8ff'
    }));
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(320, r.width); this.h = Math.max(360, r.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
  }
  layout(state) {
    const reels = state.run?.reelCount || 5;
    const cw = Math.min(this.w * 0.94, 760);
    const ch = Math.min(this.h * 0.62, 460);
    const x = (this.w - cw) / 2, y = Math.max(this.h * 0.16, 96);
    const pad = Math.min(28, cw * 0.04);
    const cell = Math.min((cw - pad * 2) / reels, (ch - pad * 2) / 3);
    return { x, y, w: cw, h: ch, pad, cell,
      gridW: cell * reels, gridH: cell * 3,
      gx: x + (cw - cell * reels) / 2, gy: y + (ch - cell * 3) / 2 + 12 };
  }
  cellCenter(L, reel, row) { return { x: L.gx + reel * L.cell + L.cell / 2, y: L.gy + row * L.cell + L.cell / 2 }; }

  backdrop(g, t) {
    const bg = g.createLinearGradient(0, 0, 0, this.h);
    bg.addColorStop(0, '#080a1d'); bg.addColorStop(0.55, '#120a2c'); bg.addColorStop(1, '#05060f');
    g.fillStyle = bg; g.fillRect(0, 0, this.w, this.h);
    for (const st of this.stars) {
      const yy = ((st.y + t * st.s * 0.02) % 1) * this.h;
      g.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(t + st.x * 10));
      g.fillStyle = st.c; g.beginPath(); g.arc(st.x * this.w, yy, st.r, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;
    g.strokeStyle = 'rgba(120,150,255,.055)'; g.lineWidth = 1;
    const step = 48, off = (t * 8) % step;
    for (let x = -step + off; x < this.w + step; x += step) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, this.h); g.stroke();
    }
    for (let y = 0; y < this.h; y += step) {
      g.beginPath(); g.moveTo(0, y + off); g.lineTo(this.w, y + off); g.stroke();
    }
    const glow = g.createRadialGradient(this.w / 2, this.h * 0.32, 10, this.w / 2, this.h * 0.32, this.w * 0.6);
    glow.addColorStop(0, 'rgba(120,80,255,.18)'); glow.addColorStop(1, 'rgba(120,80,255,0)');
    g.fillStyle = glow; g.fillRect(0, 0, this.w, this.h);
  }

  cabinet(g, L, t, state) {
    g.save();
    g.shadowColor = 'rgba(77,232,255,.35)'; g.shadowBlur = 28;
    const frame = g.createLinearGradient(L.x, L.y, L.x + L.w, L.y + L.h);
    frame.addColorStop(0, '#1b1644'); frame.addColorStop(0.5, '#2a1c58'); frame.addColorStop(1, '#120d30');
    g.fillStyle = frame; roundRect(g, L.x, L.y, L.w, L.h, 22); g.fill();
    g.shadowBlur = 0;
    g.strokeStyle = 'rgba(77,232,255,.55)'; g.lineWidth = 2;
    roundRect(g, L.x, L.y, L.w, L.h, 22); g.stroke();
    g.strokeStyle = 'rgba(255,107,157,.28)'; g.lineWidth = 1;
    roundRect(g, L.x + 6, L.y + 6, L.w - 12, L.h - 12, 18); g.stroke();
    // marquee
    const mg = g.createLinearGradient(L.x, L.y, L.x + L.w, L.y);
    mg.addColorStop(0, '#4de8ff'); mg.addColorStop(0.5, '#c26bff'); mg.addColorStop(1, '#ff6b9d');
    g.fillStyle = mg; g.globalAlpha = 0.85;
    roundRect(g, L.x + L.w * 0.24, L.y + 5, L.w * 0.52, 23, 8); g.fill();
    g.globalAlpha = 1;
    g.fillStyle = '#0a0a1e'; g.font = '900 11px Inter,system-ui,sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('SLOT COLLECT', L.x + L.w / 2, L.y + 17);
    // reel window
    g.fillStyle = 'rgba(4,6,20,.85)';
    roundRect(g, L.gx - 8, L.gy - 8, L.gridW + 16, L.gridH + 16, 12); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1;
    roundRect(g, L.gx - 8, L.gy - 8, L.gridW + 16, L.gridH + 16, 12); g.stroke();
    g.restore();
  }

  reels(g, L, state, t) {
    const grid = state.grid || [];
    const reels = state.run?.reelCount || 5;
    const spinning = state.phase === 'spinning';
    const p = state.spinT || 0;
    for (let c = 0; c < reels; c++) {
      const col = grid[c] || [];
      for (let r = 0; r < 3; r++) {
        const idx = col[r];
        const sprite = symbolSprite(idx === undefined ? 0 : idx, Math.round(L.cell * 1.5));
        const cx = L.gx + c * L.cell, cy = L.gy + r * L.cell;
        g.save();
        roundRect(g, cx + 2, cy + 2, L.cell - 4, L.cell - 4, 8); g.clip();
        if (spinning) {
          const speed = 1 - c / (reels + 1);
          const shift = ((t * 260 * speed + c * 37) % (L.cell * 1.6));
          const base = idx === undefined ? c + r : idx;
          for (let k = -1; k <= 2; k++) {
            const s = symbolSprite((base + k + 20) % SYMBOLS.length, Math.round(L.cell * 1.5));
            g.globalAlpha = k === 0 ? 1 : 0.22;
            g.drawImage(s, cx + 2, cy + 2 - shift + k * L.cell * 0.8, L.cell - 4, L.cell - 4);
          }
        } else {
          g.drawImage(sprite, cx + 2, cy + 2, L.cell - 4, L.cell - 4);
        }
        g.restore();
        const sh = g.createLinearGradient(cx, cy, cx, cy + L.cell);
        sh.addColorStop(0, 'rgba(0,0,0,.22)'); sh.addColorStop(0.5, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.35)');
        g.fillStyle = sh; g.fillRect(cx + 2, cy + 2, L.cell - 4, L.cell - 4);
      }
      if (spinning && p > 0.35 + c * 0.09) {
        g.fillStyle = '#52ff9e'; g.globalAlpha = 0.7;
        g.fillRect(L.gx + c * L.cell + 4, L.gy - 4, L.cell - 8, 3);
        g.globalAlpha = 1;
      }
      g.strokeStyle = 'rgba(255,255,255,.06)';
      g.beginPath(); g.moveTo(L.gx + (c + 1) * L.cell, L.gy); g.lineTo(L.gx + (c + 1) * L.cell, L.gy + L.gridH); g.stroke();
    }
  }

  paylines(g, L, state, t) {
    const res = state.result;
    if (!res || !res.lines.length) return;
    const grid = state.grid || [];
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const line of res.lines) {
      const pts = line.cells.map(c => this.cellCenter(L, c.reel, c.row));
      const def = SYMBOLS[line.symbol];
      g.strokeStyle = def?.color || '#ffd166';
      g.lineWidth = 3 + Math.sin(t * 8) * 1.2;
      g.shadowColor = g.strokeStyle; g.shadowBlur = 18;
      g.globalAlpha = state.phase === 'resolving' ? 0.95 : 0.5;
      g.beginPath(); pts.forEach((pt, i) => i ? g.lineTo(pt.x, pt.y) : g.moveTo(pt.x, pt.y)); g.stroke();
      for (const pt of pts) {
        g.fillStyle = '#fff'; g.globalAlpha = 0.6;
        g.beginPath(); g.arc(pt.x, pt.y, 3, 0, 6.283); g.fill();
      }
    }
    g.restore();
  }

  draw(state, t, dt) {
    const g = this.ctx;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, this.w, this.h);
    const off = this.p.offset();
    g.save(); g.translate(off.x, off.y);
    this.backdrop(g, t);
    const L = this.layout(state);
    this.cabinet(g, L, t, state);
    if (state.phase !== 'menu') this.reels(g, L, state, t);
    this.paylines(g, L, state, t);
    this.p.update(dt);
    this.p.draw(g, this.w, this.h);
    g.restore();
    this.lastLayout = L;
  }

  celebrate(state, result) {
    const L = this.lastLayout || this.layout(state);
    if (!result?.lines?.length) return;
    for (const line of result.lines) {
      const cell = this.cellCenter(L, line.cells[line.cells.length - 1].reel, line.cells[0].row);
      this.p.burst(cell.x, cell.y, SYMBOLS[line.symbol].color, 18, 6);
      this.p.ring(cell.x, cell.y, SYMBOLS[line.symbol].color, 10);
      this.p.float(cell.x, cell.y - 20, `+${line.win}`, '#ffd166');
    }
    this.p.hit(result.total > 80 ? 12 : 5, '#4de8ff');
  }
}
