/* Precision Skating — neon speed renderer */

import { STR, SKATER_COLORS } from './config.js';
import { state } from './state.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = 0; this.H = 0; this.DPR = 1;
    this.rink = { x: 0, y: 0, w: 0, h: 0 };
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.DPR = Math.min(window.devicePixelRatio || 1, 2);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = Math.round(this.W * this.DPR);
    this.canvas.height = Math.round(this.H * this.DPR);
    this.canvas.style.width = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    this.ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
    const top = (typeof getComputedStyle !== 'undefined'
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-top'), 10) || 12
      : 12);
    const margin = Math.max(14, this.W * 0.04);
    this.rink = {
      x: margin,
      y: top + 76,
      w: this.W - margin * 2,
      h: Math.max(180, this.H - top - 210)
    };
    return this.rink;
  }

  rounded(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  background(time) {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(0, 0, this.W, this.H);
    gradient.addColorStop(0, '#080b1f');
    gradient.addColorStop(0.5, '#151134');
    gradient.addColorStop(1, '#22103a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.W, this.H);

    // speed lines
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#4de8ff';
    ctx.lineWidth = 1;
    for (let i = 0; i < 18; i++) {
      const offset = (time * 0.18 + i * 67) % (this.H + 200) - 100;
      const x = (i * 97) % this.W;
      ctx.beginPath();
      ctx.moveTo(x, offset);
      ctx.lineTo(x + 20, offset - 70);
      ctx.stroke();
    }
    ctx.restore();
  }

  rinkSurface(time) {
    const ctx = this.ctx;
    const { x, y, w, h } = this.rink;
    ctx.save();
    ctx.shadowColor = 'rgba(77,232,255,.35)';
    ctx.shadowBlur = 28;
    const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
    gradient.addColorStop(0, '#182552');
    gradient.addColorStop(1, '#2a1746');
    ctx.fillStyle = gradient;
    this.rounded(x, y, w, h, 22);
    ctx.fill();
    ctx.restore();

    ctx.save();
    this.rounded(x, y, w, h, 22);
    ctx.clip();
    ctx.strokeStyle = 'rgba(160,200,255,.12)';
    ctx.lineWidth = 1;
    for (let gx = x; gx < x + w; gx += 42) {
      ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke();
    }
    for (let gy = y; gy < y + h; gy += 42) {
      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,107,157,.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w * 0.16, h * 0.26, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.stroke();
    // moving sheen
    const sheen = (time * 0.12) % 2 - 0.5;
    const light = ctx.createLinearGradient(x + w * sheen, y, x + w * (sheen + 0.5), y + h);
    light.addColorStop(0, 'rgba(255,255,255,0)');
    light.addColorStop(0.5, 'rgba(255,255,255,.06)');
    light.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = light;
    ctx.fillRect(x, y, w, h);
    ctx.restore();

    ctx.strokeStyle = 'rgba(77,232,255,.5)';
    ctx.lineWidth = 2;
    this.rounded(x, y, w, h, 22);
    ctx.stroke();
  }

  skaters(engine, time) {
    const ctx = this.ctx;
    for (const skater of engine.skaters) {
      const color = SKATER_COLORS[skater.index];
      ctx.save();
      for (const point of skater.trail) {
        if (point.life <= 0) continue;
        ctx.globalAlpha = point.life * 0.32;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5 * point.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // target ring
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(skater.tx, skater.ty, 8, 0, Math.PI * 2);
      ctx.stroke();

      if (skater.drifting) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.012 + skater.index);
        ctx.strokeStyle = `rgba(255,107,157,${0.5 + pulse * 0.5})`;
        ctx.lineWidth = 2.5 + pulse;
        ctx.shadowColor = '#ff6b9d';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(skater.x, skater.y, 15 + pulse * 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.shadowColor = color;
      ctx.shadowBlur = skater.corrected ? 24 : 12;
      ctx.fillStyle = skater.corrected ? '#ffffff' : color;
      ctx.beginPath();
      ctx.arc(skater.x, skater.y, skater.corrected ? 10 : 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(8,11,31,.85)';
      ctx.beginPath();
      ctx.arc(skater.x - 2, skater.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  beatBar(engine, elapsed) {
    const ctx = this.ctx;
    const element = engine.program[engine.programIdx];
    if (!element) return;
    const barY = this.H - 74;
    const left = 18;
    const width = this.W - 36;
    ctx.fillStyle = 'rgba(10,14,34,.82)';
    this.rounded(left, barY, width, 42, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(160,200,255,.2)';
    ctx.stroke();

    const center = left + width / 2;
    ctx.fillStyle = 'rgba(255,209,102,.14)';
    ctx.fillRect(center - width * 0.035, barY + 3, width * 0.07, 36);
    ctx.fillStyle = 'rgba(94,240,168,.1)';
    ctx.fillRect(center - width * 0.1, barY + 3, width * 0.2, 36);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(center, barY + 2);
    ctx.lineTo(center, barY + 40);
    ctx.stroke();

    const progress = (elapsed - element.startMs) / element.durMs;
    for (const beat of engine.beats) {
      if (beat.judged) continue;
      const beatProgress = (beat.timeMs - element.startMs) / element.durMs;
      const delta = beatProgress - progress;
      if (Math.abs(delta) > 0.45) continue;
      const x = center + delta * width * 0.5;
      ctx.fillStyle = beat.hit ? '#5ef0a8' : '#4de8ff';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, barY + 21, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  chip(x, y, text, color) {
    const ctx = this.ctx;
    ctx.font = '800 12px Inter, system-ui, sans-serif';
    const width = ctx.measureText(text).width + 20;
    ctx.fillStyle = 'rgba(10,14,34,.82)';
    this.rounded(x, y, width, 26, 9);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 10, y + 13);
    return width;
  }

  hud(scene) {
    const ctx = this.ctx;
    const { engine, elapsed, mode, difficulty, totalMs, lang } = scene;
    let x = 14;
    const y = (typeof getComputedStyle !== 'undefined'
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-top'), 10) || 12
      : 12) + 6;
    const strings = STR[lang] || STR.en;
    x += this.chip(x, y, `${strings.score} ${engine.results().total}`, '#ffd166') + 8;
    x += this.chip(x, y, `${strings.combo} ×${engine.score.combo}`, '#5ef0a8') + 8;
    x += this.chip(x, y, `${difficulty.toUpperCase()} · ${mode === 'championship' ? strings.championship : strings.practice}`, '#a98bff') + 8;
    const remaining = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));
    this.chip(this.W - 100, y, `${strings.time} ${remaining}s`, '#4de8ff');

    const element = engine.program[engine.programIdx];
    if (element) {
      ctx.font = '900 16px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#fce4f0';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'it' ? element.name_it : element.name_en, this.W / 2, y + 14);
    }
  }

  toast(scene) {
    if (!scene.toast || scene.toastTimer <= 0) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = Math.min(1, scene.toastTimer / 200);
    ctx.font = '900 22px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = scene.toastColor || '#fff';
    ctx.shadowColor = scene.toastColor || '#fff';
    ctx.shadowBlur = 16;
    ctx.fillText(scene.toast, this.W / 2, this.rink.y + this.rink.h * 0.25);
    ctx.restore();
  }

  draw(scene) {
    const ctx = this.ctx;
    ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
    ctx.clearRect(0, 0, this.W, this.H);
    this.background(scene.elapsed);
    this.rinkSurface(scene.elapsed);
    this.skaters(scene.engine, scene.elapsed);
    if (scene.running && !scene.paused) this.beatBar(scene.engine, scene.elapsed);
    this.hud(scene);
    this.toast(scene);
  }
}
