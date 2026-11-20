/* Creazione di entita' e generazione delle ondate */

import { PATH, PATH_WIDTH, BUILD_MARGIN, VIEW_W, VIEW_H, TOWERS, ENEMIES, ENEMY_UNLOCKS } from './config.js';
import { state } from './state.js';

export function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export function canPlace(x, y) {
  if (x < BUILD_MARGIN + 14 || x > VIEW_W - BUILD_MARGIN - 14) return false;
  if (y < BUILD_MARGIN + 58 || y > VIEW_H - BUILD_MARGIN - 76) return false;

  const half = PATH_WIDTH / 2 + 12;
  for (let i = 0; i < PATH.length - 1; i++) {
    const p1 = PATH[i];
    const p2 = PATH[i + 1];
    if (distanceToSegment(x, y, p1.x, p1.y, p2.x, p2.y) < half) return false;
  }
  for (const t of state.towers) {
    if (Math.hypot(x - t.x, y - t.y) < 40) return false;
  }
  return true;
}

export function hpForWave(baseHp, wave, mode) {
  return Math.round(baseHp * (1 + wave * mode.hpGrowth) * mode.hpScale);
}

export function createEnemy(typeKey, wave, mode) {
  const def = ENEMIES[typeKey] || ENEMIES.normal;
  const hp = hpForWave(def.hp, wave, mode);
  const speed = def.speed * mode.speedScale;
  return {
    type: typeKey,
    x: PATH[0].x,
    y: PATH[0].y,
    pathIdx: 0,
    hp,
    maxHp: hp,
    speed,
    baseSpeed: speed,
    radius: def.radius,
    color: def.color,
    shape: def.shape,
    reward: Math.round(def.reward * mode.rewardScale),
    armor: def.armor || 0,
    shield: def.shield ? Math.round(def.shield * (1 + wave * 0.12) * mode.hpScale) : 0,
    maxShield: def.shield ? Math.round(def.shield * (1 + wave * 0.12) * mode.hpScale) : 0,
    heal: def.heal || 0,
    boss: !!def.boss,
    slowUntil: 0,
    slowFactor: 1,
    angle: 0,
    hitFlash: 0,
    healPulse: 0
  };
}

export function createTower(typeKey, x, y) {
  const def = TOWERS[typeKey];
  return {
    type: typeKey,
    x, y,
    baseCost: def.cost,
    invested: def.cost,
    cost: def.cost,
    baseRange: def.range,
    range: def.range,
    baseDamage: def.damage,
    damage: def.damage,
    baseRate: def.rate,
    rate: def.rate,
    color: def.color,
    accent: def.accent,
    glyph: def.glyph,
    kind: def.kind,
    projectileSpeed: def.projectileSpeed,
    splash: def.splash || 0,
    chains: def.chains || 0,
    slowFactor: def.slowFactor || 1,
    slowTime: def.slowTime || 0,
    level: 1,
    cooldown: 0,
    angle: -Math.PI / 2,
    targeting: 'close',
    flash: 0,
    kills: 0
  };
}

export function buildWave(wave, mode) {
  const queue = [];
  if (mode.bossEvery && wave % mode.bossEvery === 0) queue.push('boss');

  const available = ENEMY_UNLOCKS.filter(u => wave >= u.wave).map(u => u.key);
  let points = 10 + wave * 7;
  let guard = 0;

  while (points > 0 && guard++ < 400) {
    const pool = available.filter(key => ENEMIES[key].cost <= points);
    if (!pool.length) break;
    const key = pool[Math.floor(Math.random() * pool.length)];
    queue.push(key);
    points -= ENEMIES[key].cost;
  }

  /* Il boss viene messo in coda all'inizio dell'array: verra' spawnato per ultimo
     perche' la coda viene consumata con pop(). */
  const start = queue.length && queue[0] === 'boss' ? 1 : 0;
  for (let i = queue.length - 1; i > start; i--) {
    const j = start + Math.floor(Math.random() * (i - start + 1));
    const tmp = queue[i];
    queue[i] = queue[j];
    queue[j] = tmp;
  }
  return queue;
}

export function spawnInterval(wave, mode) {
  return Math.max(240, (820 - wave * 18) * mode.spawnScale);
}
