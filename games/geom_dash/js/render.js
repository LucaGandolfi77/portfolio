/* GEOM DASH — DPR-aware renderer with parallax and neon visuals */

import { W, H, GROUND, SKINS } from './config.js';
import { shakeOffset } from './effects.js';
import { progressOf } from './level.js';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function background(chapter, time, distance) {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, chapter.bg1);
    gradient.addColorStop(1, chapter.bg2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    const offset = (distance * 0.12) % 80;
    ctx.strokeStyle = chapter.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -offset; x < W; x += 80) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = (time * 12) % 80; y < H; y += 80) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,.4)';
    for (let i = 0; i < 34; i++) {
      const x = (i * 137.5) % W;
      const y = (i * 79.3) % (GROUND - 80);
      const twinkle = 0.35 + 0.4 * Math.sin(time * 2 + i);
      ctx.globalAlpha = twinkle;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.beginPath();
    ctx.moveTo(0, GROUND);
    for (let x = 0; x <= W; x += 60) {
      const y = GROUND - 40 - Math.sin((x + distance * 0.25) / 130) * 26 - Math.sin((x + distance * 0.1) / 70) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, GROUND);
    ctx.closePath();
    ctx.fill();
  }

  function ground(chapter) {
    const gradient = ctx.createLinearGradient(0, GROUND, 0, H);
    gradient.addColorStop(0, chapter.ground);
    gradient.addColorStop(1, '#05030f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, GROUND, W, H - GROUND);

    ctx.strokeStyle = chapter.accent;
    ctx.lineWidth = 2;
    ctx.shadowColor = chapter.accent;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(0, GROUND + 0.5);
    ctx.lineTo(W, GROUND + 0.5);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(255,255,255,.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < W; x += 40) { ctx.moveTo(x, GROUND); ctx.lineTo(x - 18, H); }
    ctx.stroke();
  }

  function obstacles(level, chapter, time) {
    for (const obstacle of level.obstacles) {
      if (!obstacle.active) continue;
      ctx.save();
      ctx.shadowColor = chapter.obstacle;
      ctx.shadowBlur = 16;
      ctx.fillStyle = chapter.obstacle;
      if (obstacle.type === 'spike') {
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.h);
        ctx.lineTo(obstacle.x + obstacle.w / 2, obstacle.y);
        ctx.lineTo(obstacle.x + obstacle.w, obstacle.y + obstacle.h);
        ctx.closePath();
        ctx.fill();
      } else {
        const radius = obstacle.type === 'ceiling' ? 6 : 8;
        ctx.beginPath();
        ctx.roundRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h, radius);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(obstacle.x + 3, obstacle.y + 3, Math.max(2, obstacle.w - 6), Math.max(2, obstacle.h - 6), 4);
      ctx.stroke();
      if (obstacle.type === 'ceiling') {
        ctx.fillStyle = 'rgba(0,0,0,.25)';
        for (let y = obstacle.y + 12; y < obstacle.y + obstacle.h; y += 16) {
          ctx.fillRect(obstacle.x + 8, y, obstacle.w - 16, 3);
        }
      }
      ctx.restore();
    }
  }

  function finish(level, chapter) {
    if (!isFinite(level.length)) return;
    const x = 120 + (level.length - level.distance);
    if (x < -40 || x > W + 40) return;
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.shadowColor = chapter.accent;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, GROUND);
    ctx.stroke();
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = i % 2 ? '#fff' : chapter.obstacle;
      ctx.fillRect(x - 14, 50 + i * 22, 14, 16);
      ctx.fillRect(x, 50 + i * 22, 14, 16);
    }
    ctx.restore();
  }

  function playerShape(x, y, size, skin, alpha = 1, ghost = false) {
    ctx.save();
    ctx.globalAlpha = alpha;
    if (ghost) {
      ctx.strokeStyle = skin.body;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, 8);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      return;
    }
    ctx.shadowColor = skin.body;
    ctx.shadowBlur = 20;
    ctx.fillStyle = skin.body;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = skin.trim;
    ctx.beginPath();
    ctx.roundRect(x + 5, y + 5, size - 10, size - 12, 5);
    ctx.fill();
    ctx.fillStyle = '#141028';
    ctx.fillRect(x + 9, y + 12, 5, 5);
    ctx.fillRect(x + size - 14, y + 12, 5, 5);
    ctx.restore();
  }

  function player(playerState, ghostState, skinName) {
    const skin = SKINS[skinName] || SKINS.neon;
    for (const t of playerState.trail) {
      ctx.globalAlpha = Math.max(0, t.life) * 0.35;
      ctx.fillStyle = skin.body;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 8 * t.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (ghostState) playerShape(ghostState.x, ghostState.y, playerState.w, skin, 0.32, true);
    playerShape(playerState.x, playerState.y, playerState.w, skin);

    if (playerState.shield) {
      ctx.save();
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 6]);
      ctx.shadowColor = '#ffd166';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(playerState.x + playerState.w / 2, playerState.y + playerState.h / 2, playerState.w * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function particles(effects) {
    for (const p of effects.particles) {
      if (!p.active) continue;
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function draw(scene) {
    const { level, player: hero, ghost, effects, chapter, skin, time } = scene;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const shake = shakeOffset(effects);
    ctx.save();
    ctx.translate(shake.x, shake.y);
    background(chapter, time, level.distance);
    ground(chapter);
    finish(level, chapter);
    obstacles(level, chapter, time);
    player(hero, ghost, skin);
    particles(effects);
    ctx.restore();

    if (effects.flash > 0) {
      ctx.globalAlpha = Math.min(1, effects.flash);
      ctx.fillStyle = effects.flashColor;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  return { resize, draw, ctx };
}
