/* Morse Studio — oscilloscope and transmission timeline */
import { normalizeSymbols } from './codec.js';

export class Visualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = 1; this.w = 0; this.h = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = this.canvas.getBoundingClientRect();
    this.w = Math.max(200, r.width || 600);
    this.h = Math.max(80, r.height || 130);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
  }
  draw(scene = {}) {
    const ctx = this.ctx, w = this.w, h = this.h;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(6,12,26,.9)'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,212,255,.08)'; ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(0,212,255,.18)'; ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

    const seq = normalizeSymbols(scene.morse || '');
    const tokens = seq.split(/\s+/).filter(Boolean);
    const totalUnits = tokens.reduce((sum, tk) => {
      if (tk === '/') return sum + 7;
      return sum + [...tk].reduce((s, c) => s + (c === '.' ? 2 : c === '-' ? 4 : 0), 0) + 2;
    }, 0) || 1;
    const amplitude = h * 0.34;
    const freq = (scene.freq || 700) / 90;

    ctx.beginPath();
    let unit = 0;
    for (let x = 0; x < w; x++) {
      const u = (x / w) * totalUnits;
      let on = false;
      unit = 0;
      for (const tk of tokens) {
        if (tk === '/') { unit += 7; if (u >= unit - 7 && u < unit) { on = false; break; } continue; }
        for (const c of tk) {
          const len = c === '.' ? 1 : c === '-' ? 3 : 0;
          const start = unit, end = unit + len;
          if (u >= start && u < end) on = true;
          unit = end + 1;
        }
        unit += 2;
      }
      const y = h / 2 + (on ? Math.sin(x * freq * 0.12 + (scene.time || 0) * 8) * amplitude : 0);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = scene.playing ? '#ffd166' : '#00d4ff';
    ctx.lineWidth = 1.6;
    ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = scene.playing ? 12 : 5;
    ctx.stroke(); ctx.shadowBlur = 0;

    if (scene.progress > 0) {
      const px = scene.progress * w;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
      ctx.fillStyle = 'rgba(255,209,102,.06)'; ctx.fillRect(0, 0, px, h);
    }
    ctx.fillStyle = 'rgba(226,232,240,.55)';
    ctx.font = '700 10px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(scene.label || 'SIGNAL', 8, 14);
    if (scene.tokenIndex >= 0) {
      ctx.textAlign = 'right';
      ctx.fillText(`SYM ${scene.tokenIndex + 1}`, w - 8, 14);
    }
  }
}
