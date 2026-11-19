/* Sky Ace — entity factories (plain objects, pooled by the engine) */

import { PLAYER } from './config.js';

export function makePlayer(H) {
  return {
    x: 100, y: H / 2,
    vx: 0, vy: 0,
    pitch: 0, targetPitch: 0, angle: 0,
    flipped: false,
    speed: PLAYER.speed,
    health: PLAYER.maxHealth,
    reload: 0,
    bombs: PLAYER.startBombs,
    bombCooldown: 0,
    shield: 0,        // frames of invulnerability remaining
    rapid: 0,         // frames of rapid fire remaining
    verticalImpulse: 0,
    invuln: 0         // brief flash after taking damage
  };
}

export function makeEnemy(opts) {
  return {
    x: opts.x, y: opts.y,
    w: opts.w, h: opts.h,
    type: opts.type,           // 'air' | 'ground'
    hp: opts.hp, maxHp: opts.hp,
    color: opts.color,
    reload: opts.reload,
    fireRate: opts.fireRate,
    speed: opts.speed || 1,
    launcher: !!opts.launcher,
    launchCooldown: opts.launchCooldown || 0,
    launchRate: opts.launchRate || 200,
    missileSpeed: opts.missileSpeed || 8,
    phase: opts.phase || 0,
    dead: false
  };
}

export function makeBoss(cfg, worldWidth, H) {
  const baseX = worldWidth - 600;
  return {
    baseX, x: baseX, y: H * 0.22,
    w: cfg.w, h: cfg.h,
    hp: cfg.hp, maxHp: cfg.hp,
    color: cfg.color,
    pattern: cfg.pattern,
    name: cfg.name,
    reload: cfg.fireRate,
    fireRate: cfg.fireRate,
    movePhase: 0,
    volley: 0,
    flash: 0
  };
}

export function makeProjectile(o) {
  return {
    x: o.x, y: o.y, vx: o.vx, vy: o.vy,
    owner: o.owner,                 // 'player' | 'enemy'
    life: o.life,
    color: o.color,
    size: o.size || 3,
    damage: o.damage || 10,
    prevX: o.x, prevY: o.y
  };
}

export function makeBomb(o) {
  return {
    x: o.x, y: o.y,
    vx: o.vx, vy: o.vy,
    g: o.g || 0.35
  };
}

export function makePickup(x, y, type) {
  return { x, y, type, life: 900, phase: Math.random() * Math.PI * 2 };
}
