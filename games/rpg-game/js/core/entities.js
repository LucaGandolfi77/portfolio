/* Pure entity helpers — no DOM, deterministic given a seed */
import { WORLD } from '../config.js';

export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function clamp(pos, pad = 18) {
  return {
    x: Math.max(pad, Math.min(WORLD.width - pad, pos.x)),
    y: Math.max(pad + 12, Math.min(WORLD.height - pad, pos.y))
  };
}

export function spawnEnemies(zone, count, seed = 7) {
  const r = rng(seed);
  const list = [];
  for (let i = 0; i < count; i++) {
    const def = zone.enemies[Math.floor(r() * zone.enemies.length)];
    let x = 60 + r() * (WORLD.width - 120);
    let y = 80 + r() * (WORLD.height - 160);
    /* keep the starting area clear */
    if (distance({ x, y }, { x: 410, y: 300 }) < 170) { x += 140; y += 90; }
    list.push({
      id: def.id + '-' + i, defId: def.id, def, x: clamp({ x, y }).x, y: clamp({ x, y }).y,
      hp: def.hp, maxHp: def.hp, alive: true, hitFlash: 0, attackCd: 0, wander: r() * Math.PI * 2
    });
  }
  return list;
}

export function moveTowards(entity, target, dt, speed, stopAt = 0) {
  const d = distance(entity, target);
  if (d <= stopAt || d < 0.001) return entity;
  const step = Math.min(d - stopAt, speed * dt);
  entity.x += (target.x - entity.x) / d * step;
  entity.y += (target.y - entity.y) / d * step;
  const p = clamp(entity);
  entity.x = p.x; entity.y = p.y;
  return entity;
}
