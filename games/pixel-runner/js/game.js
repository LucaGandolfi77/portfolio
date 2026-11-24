/* Pixel Runner — physics, stages, bosses and power-ups (pure, DOM-free) */

import { STAGES, GRAVITY, JUMP, POWERUPS } from './config.js';

const PICKUP_TYPES = ['coin','coin','shield','magnet','double','slow','repair'];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export function setup(game) {
  game.data = {
    stage: 0, y: 0, vy: 0, grounded: true, running: true,
    obstacles: [], pickups: [], distance: 0, spawnTimer: 1.2,
    speed: STAGES[0].speed, shield: 0, dashCooldown: 0,
    boss: null, passed: 0, time: 0,
    magnet: 0, double: 0, slow: 0, missed: 0, bossesDefeated: 0
  };
  game.combo = 0;
  if (game.mode === 'bossrush') {
    const cfg = STAGES[0];
    game.data.boss = { hp:cfg.bossHp, maxHp:cfg.bossHp, x:game.view.w * 0.75 };
  }
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
  const speedScale = { easy:0.8, normal:1, hard:1.2 }[game.difficulty] || 1;
  let speed = cfg.speed * speedScale * (d.dashCooldown > 0 ? 1.3 : 1);
  if (d.slow > 0) speed *= 0.62;
  d.speed = speed;
  d.dashCooldown = Math.max(0, d.dashCooldown - dt);
  d.magnet = Math.max(0, d.magnet - dt);
  d.double = Math.max(0, d.double - dt);
  d.slow = Math.max(0, d.slow - dt);

  d.vy += GRAVITY * dt;
  d.y += d.vy * dt;
  if (d.y >= 0) { d.y = 0; d.vy = 0; d.grounded = true; }

  d.distance += speed * dt / 50;
  game.addScore(speed * dt * 0.05 * (d.double > 0 ? 2 : 1));

  d.spawnTimer -= dt;
  if (d.spawnTimer <= 0 && !d.boss && game.mode !== 'bossrush') {
    d.obstacles.push({ x:game.view.w + 40, w:18 + Math.random() * 18, h:22 + Math.random() * 34, hit:false, missed:false });
    if (Math.random() < 0.42) {
      d.pickups.push({
        x:game.view.w + 40,
        y:game.view.h * (0.45 + Math.random() * 0.25),
        type:pick(PICKUP_TYPES), taken:false
      });
    }
    d.spawnTimer = Math.max(0.45, 1.3 - d.stage * 0.12);
  }

  const px = game.view.w * 0.2;
  for (let i = d.obstacles.length - 1; i >= 0; i--) {
    const o = d.obstacles[i];
    o.x -= speed * dt;
    const near = o.x < px + 34 && o.x > px - 34;
    if (!o.hit && near && d.y > -o.h + 6) {
      o.hit = true;
      if (d.shield > 0) {
        d.shield = Math.max(0, d.shield - 0.6);
        game.fx.burst(o.x, game.view.h * 0.7, '#4de8ff', 8);
      } else {
        game.combo = 0;
        game.fx.hit(10); game.fx.blink(0.3, '#ff6b9d');
        d.running = false; game.end('gameover'); return;
      }
    } else if (!o.missed && !o.hit && o.x < px - 34 && d.y < -o.h) {
      o.missed = true;
      d.missed++;
      game.combo++;
      game.addScore(60 * Math.min(5, game.combo));
      game.fx.float(o.x, game.view.h * 0.6, 'NEAR MISS ×' + game.combo, '#ffd166');
    }
    if (o.x < -60) { d.obstacles.splice(i, 1); d.passed++; }
  }

  for (let i = d.pickups.length - 1; i >= 0; i--) {
    const k = d.pickups[i];
    k.x -= speed * dt;
    const range = d.magnet > 0 ? 110 : 30;
    if (d.magnet > 0 && Math.abs(k.x - px) < range) k.x += (px - k.x) * Math.min(1, dt * 6);
    if (!k.taken && Math.abs(k.x - px) < 28 && (d.y < -20 || d.magnet > 0)) {
      k.taken = true;
      const value = d.double > 0 ? 2 : 1;
      if (k.type === 'shield') { d.shield = Math.max(d.shield, 4); game.fx.float(k.x, k.y, 'SHIELD', '#4de8ff'); }
      else if (k.type === 'magnet') { d.magnet = 7; game.fx.float(k.x, k.y, 'MAGNET', '#b28dff'); }
      else if (k.type === 'double') { d.double = 7; game.fx.float(k.x, k.y, '×2 SCORE', '#ffd166'); }
      else if (k.type === 'slow') { d.slow = 4; game.fx.float(k.x, k.y, 'SLOW', '#8ad4ff'); }
      else if (k.type === 'repair') { d.shield = Math.max(d.shield, 6); game.addScore(250 * value); game.fx.float(k.x, k.y, '+250', '#5ef0a8'); }
      else { game.addScore(150 * value); game.fx.float(k.x, k.y, '+' + (150 * value), '#ffd166'); }
      game.fx.burst(k.x, k.y, k.type === 'shield' ? '#4de8ff' : '#ffd166', 8);
    }
    if (k.x < -40) d.pickups.splice(i, 1);
  }

  if (!d.boss && game.mode !== 'bossrush' && d.passed >= cfg.obstacles && d.stage < STAGES.length) {
    d.boss = { hp:cfg.bossHp, maxHp:cfg.bossHp, x:game.view.w * 0.75 };
    d.obstacles.length = 0;
    game.fx.blink(0.3, '#ff6b9d');
  }
  if (d.boss && d.boss.hp <= 0) {
    d.bossesDefeated++;
    d.boss = null;
    d.stage++;
    d.passed = 0;
    game.combo++;
    if (d.stage >= STAGES.length) { game.end('victory'); return; }
    if (game.mode === 'bossrush') {
      const next = STAGES[d.stage];
      d.boss = { hp:next.bossHp, maxHp:next.bossHp, x:game.view.w * 0.75 };
    }
    game.fx.burst(game.view.w / 2, game.view.h / 2, '#ffd166', 30);
  }
}

export function attack(game) {
  const d = game.data;
  if (!d.boss || game.status !== 'playing') return;
  d.boss.hp--;
  game.addScore(120 * (d.double > 0 ? 2 : 1));
  game.fx.burst(d.boss.x, game.view.h * 0.5, STAGES[Math.min(d.stage, STAGES.length - 1)].color, 12);
  if (d.boss.hp <= 0) game.fx.hit(4);
}

export function draw(ctx, game, view, t) {
  const { w, h } = view;
  const cfg = STAGES[Math.min(game.data.stage, STAGES.length - 1)];
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#06091f'); g.addColorStop(1, cfg.color + '33');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const d = game.data;

  ctx.strokeStyle = cfg.color; ctx.globalAlpha = 0.2; ctx.lineWidth = 1;
  const shift = (t * 0.03 * (d.slow > 0 ? 0.4 : 1)) % 53;
  for (let i = 0; i < 20; i++) {
    const y = (i * 53 + shift) % h;
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
  const badges = [];
  if (d.magnet > 0) badges.push(['🧲', '#b28dff']);
  if (d.double > 0) badges.push(['×2', '#ffd166']);
  if (d.slow > 0) badges.push(['🐢', '#8ad4ff']);
  badges.forEach(([label, color], i) => {
    ctx.fillStyle = color; ctx.font = '700 13px Inter, sans-serif';
    ctx.fillText(label, px - 18 + i * 20, py - 38);
  });

  d.obstacles.forEach(o => { ctx.fillStyle = '#ff6b9d'; ctx.fillRect(o.x, floorY - o.h, o.w, o.h); });
  d.pickups.forEach(k => {
    const def = POWERUPS.find(p => p.id === k.type);
    ctx.fillStyle = def?.id === 'magnet' ? '#b28dff' : def?.id === 'double' ? '#ffd166' :
      def?.id === 'slow' ? '#8ad4ff' : def?.id === 'repair' ? '#5ef0a8' :
        def?.id === 'shield' ? '#4de8ff' : '#ffd166';
    ctx.beginPath(); ctx.arc(k.x, k.y, 9, 0, Math.PI * 2); ctx.fill();
  });

  if (d.boss) {
    const pulse = 34 + Math.sin(t * 0.008) * 3;
    ctx.fillStyle = '#ff6b9d'; ctx.shadowColor = '#ff6b9d'; ctx.shadowBlur = 24;
    ctx.beginPath(); ctx.arc(d.boss.x, h * 0.5, pulse, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(d.boss.x - 40, h * 0.5 - 54, 80, 8);
    ctx.fillStyle = '#fff'; ctx.fillRect(d.boss.x - 40, h * 0.5 - 54, 80 * Math.max(0, d.boss.hp / d.boss.maxHp), 8);
  }

  ctx.textAlign = 'center'; ctx.font = '800 12px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#9fb3d9';
  const label = game.mode === 'bossrush' ? game.t('boss') : game.t('stage');
  ctx.fillText(`${label} ${Math.min(d.stage + 1, STAGES.length)} · ${cfg.name} · ${game.t('distance')} ${Math.floor(d.distance)}`, w / 2, 28);
}

export function onTap(game) { const d = game.data; if (d?.boss) attack(game); else jump(game); }
export function onKey(game, code) {
  if (code === 'Space' || code === 'ArrowUp') jump(game);
  if (code === 'KeyD' || code === 'ShiftLeft') dash(game);
  if (code === 'KeyF') attack(game);
}
export const api = { setup, update, draw, onTap, onKey, jump, dash, attack };
