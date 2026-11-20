/* Pixel Runner — physics, stages and bosses */

import { STAGES, GRAVITY, JUMP } from './config.js';

export function setup(game) {
  game.data = {
    stage: 0, y: 0, vy: 0, grounded: true, running: true,
    obstacles: [], pickups: [], distance: 0, spawnTimer: 1.2,
    speed: STAGES[0].speed, shield: 0, dashCooldown: 0,
    boss: null, passed: 0, time: 0
  };
  game.combo = 0;
}

export function jump(game) {
  const d = game.data;
  if (game.status !== 'playing' || !d.grounded) return;
  d.vy = -JUMP;
  d.grounded = false;
  game.fx.burst(game.view.w * 0.2, game.view.h * 0.78, '#4de8ff', 6);
}

export function dash(game) {
  const d = game.data;
  if (game.status !== 'playing' || d.dashCooldown > 0) return;
  d.dashCooldown = 2.5;
  d.speed *= 1.8;
  game.fx.blink(0.2, '#a98bff');
}

export function update(dt, game) {
  const d = game.data;
  if (game.status !== 'playing' || !d.running) return;
  d.time += dt;
  const cfg = STAGES[Math.min(d.stage, STAGES.length - 1)];
  const speedScale = { easy: 0.8, normal: 1, hard: 1.2 }[game.difficulty] || 1;
  const speed = cfg.speed * speedScale * (d.dashCooldown > 0 ? 1.3 : 1);
  d.speed = speed;
  d.dashCooldown = Math.max(0, d.dashCooldown - dt);

  d.vy += GRAVITY * dt;
  d.y += d.vy * dt;
  const floor = 0;
  if (d.y >= floor) { d.y = floor; d.vy = 0; d.grounded = true; }

  d.distance += speed * dt / 50;
  game.addScore(speed * dt * 0.05);

  d.spawnTimer -= dt;
  if (d.spawnTimer <= 0 && !d.boss) {
    const cfg = STAGES[Math.min(d.stage, STAGES.length - 1)];
    d.obstacles.push({ x: game.view.w + 40, w: 18 + Math.random() * 18, h: 22 + Math.random() * 34, hit: false });
    if (Math.random() < 0.3) d.pickups.push({ x: game.view.w + 40, y: game.view.h * (0.5 + Math.random() * 0.2), type: Math.random() < 0.5 ? 'shield' : 'coin', taken: false });
    d.spawnTimer = Math.max(0.45, 1.3 - d.stage * 0.12);
  }

  for (let i = d.obstacles.length - 1; i >= 0; i--) {
    const o = d.obstacles[i];
    o.x -= speed * dt;
    if (!o.hit && o.x < game.view.w * 0.2 + 30 && o.x > game.view.w * 0.2 - 20 && d.y > -o.h + 6) {
      o.hit = true;
      if (d.shield > 0) { d.shield -= dt; game.fx.burst(o.x, game.view.h * 0.7, '#4de8ff', 8); }
      else { game.combo = 0; game.fx.hit(10); game.fx.blink(0.3, '#ff6b9d'); d.running = false; game.end('gameover'); return; }
    }
    if (o.x < -60) { d.obstacles.splice(i, 1); d.passed++; }
  }
  for (let i = d.pickups.length - 1; i >= 0; i--) {
    const k = d.pickups[i];
    k.x -= speed * dt;
    if (!k.taken && Math.abs(k.x - game.view.w * 0.2) < 28 && d.y < -20) {
      k.taken = true;
      if (k.type === 'shield') d.shield = 4;
      else { game.addScore(150); game.fx.float(k.x, k.y, '+150', '#ffd166'); }
    }
    if (k.x < -40) d.pickups.splice(i, 1);
  }

  if (!d.boss && d.passed >= cfg.obstacles && d.stage < STAGES.length) {
    d.boss = { hp: cfg.bossHp, maxHp: cfg.bossHp, x: game.view.w * 0.75 };
    d.obstacles.length = 0;
    game.fx.blink(0.3, '#ff6b9d');
  }
  if (d.boss && d.boss.hp <= 0) {
    d.boss = null;
    d.stage++;
    d.passed = 0;
    game.combo++;
    if (d.stage >= STAGES.length) { game.end('victory'); return; }
    game.fx.burst(game.view.w / 2, game.view.h / 2, '#ffd166', 30);
  }
}

export function attack(game) {
  const d = game.data;
  if (!d.boss || game.status !== 'playing') return;
  d.boss.hp--;
  game.addScore(120);
  game.fx.burst(d.boss.x, game.view.h * 0.5, STAGES[d.stage].color, 12);
}

export function draw(ctx, game, view, t) {
  const { w, h } = view;
  const cfg = STAGES[Math.min(game.data.stage, STAGES.length - 1)];
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#06091f'); g.addColorStop(1, cfg.color + '33');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const d = game.data;
  ctx.strokeStyle = cfg.color; ctx.globalAlpha = 0.2; ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    const y = (i * 53) % h;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const floorY = h * 0.78;
  ctx.fillStyle = '#0b1028'; ctx.fillRect(0, floorY, w, h - floorY);
  ctx.strokeStyle = cfg.color; ctx.beginPath(); ctx.moveTo(0, floorY); ctx.lineTo(w, floorY); ctx.stroke();

  const px = w * 0.2, py = floorY + d.y;
  ctx.fillStyle = cfg.color; ctx.shadowColor = cfg.color; ctx.shadowBlur = 18;
  ctx.fillRect(px - 14, py - 26, 28, 26);
  ctx.shadowBlur = 0;
  if (d.shield > 0) { ctx.strokeStyle = '#4de8ff'; ctx.beginPath(); ctx.arc(px, py - 13, 26, 0, Math.PI * 2); ctx.stroke(); }

  d.obstacles.forEach(o => { ctx.fillStyle = '#ff6b9d'; ctx.fillRect(o.x, floorY - o.h, o.w, o.h); });
  d.pickups.forEach(k => {
    ctx.fillStyle = k.type === 'shield' ? '#4de8ff' : '#ffd166';
    ctx.beginPath(); ctx.arc(k.x, k.y, 9, 0, Math.PI * 2); ctx.fill();
  });
  if (d.boss) {
    ctx.fillStyle = '#ff6b9d'; ctx.shadowColor = '#ff6b9d'; ctx.shadowBlur = 24;
    ctx.beginPath(); ctx.arc(d.boss.x, h * 0.5, 34, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(d.boss.x - 40, h * 0.5 - 54, 80, 8);
    ctx.fillStyle = '#fff'; ctx.fillRect(d.boss.x - 40, h * 0.5 - 54, 80 * Math.max(0, d.boss.hp / d.boss.maxHp), 8);
  }
  ctx.textAlign = 'center'; ctx.font = '800 12px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#9fb3d9';
  ctx.fillText(`${game.t('stage')} ${Math.min(d.stage + 1, STAGES.length)} · ${cfg.name} · ${game.t('distance')} ${Math.floor(d.distance)}`, w / 2, 28);
}
export function onTap(game) { const d = game.data; if (d?.boss) attack(game); else jump(game); }
export function onKey(game, code) {
  if (code === 'Space' || code === 'ArrowUp') jump(game);
  if (code === 'KeyD' || code === 'ShiftLeft') dash(game);
  if (code === 'KeyF') attack(game);
}
export const api = { setup, update, draw, onTap, onKey, jump, dash, attack };
