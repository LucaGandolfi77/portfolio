/**
 * sim.js — simulazione pura di Battleship Commander (nessun DOM).
 */

import { WORLD_SIZE, findShip, findWeapon, findMission, findBoss } from './config.js';

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const wrap = (v, max) => ((v % max) + max) % max;
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function angleTo(from, to) { return Math.atan2(to.y - from.y, to.x - from.x); }
export function angleDiff(target, current) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

/** PRNG deterministico per Daily Challenge e seed condivise. */
export function rngFromSeed(seed) {
  let state = (Number(seed) || 1) >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Spatial hash semplice per collisioni proiettili↔navi. */
export function createGrid(cellSize = 160) {
  const cells = new Map();
  const key = (x, y) => `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`;
  return {
    clear() { cells.clear(); },
    insert(item) {
      const k = key(item.x, item.y);
      if (!cells.has(k)) cells.set(k, []);
      cells.get(k).push(item);
    },
    near(x, y) {
      const gx = Math.floor(x / cellSize), gy = Math.floor(y / cellSize);
      const out = [];
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          const bucket = cells.get(`${gx + dx},${gy + dy}`);
          if (bucket) out.push(...bucket);
        }
      }
      return out;
    }
  };
}

function makeEnemy(world, id, bossId = null) {
  const rng = world.rng;
  const boss = bossId ? findBoss(bossId) : null;
  const health = boss ? boss.hull : 3 + Math.floor(world.difficulty * 1.5);
  let x, y, attempts = 0;
  do {
    x = rng() * WORLD_SIZE; y = rng() * WORLD_SIZE;
    attempts += 1;
  } while (distance({ x, y }, world.player) < 700 && attempts < 40);
  return {
    id, x, y, angle: rng() * Math.PI * 2,
    speed: boss ? boss.speed : 2.4 + rng() * 1.4,
    hp: health, maxHp: health,
    state: 'patrol', stateTimer: 1 + rng() * 2,
    cooldown: rng(), boss, phase: 1,
    damage: boss ? boss.damage : 1,
    reload: boss ? boss.reload : 0.85 - Math.min(0.35, world.difficulty * 0.04)
  };
}

export function createWorld({ missionId = 'm01', mode = 'campaign', seed = 12345, shipId = 'scout', difficulty = 1 } = {}) {
  const rng = rngFromSeed(seed);
  const mission = findMission(missionId);
  const ship = findShip(shipId);
  const islands = [];
  for (let i = 0; i < 15; i += 1) {
    islands.push({ x: rng() * WORLD_SIZE, y: rng() * WORLD_SIZE, radius: 55 + rng() * 130 });
  }
  const world = {
    seed, rng, mission, mode, difficulty, time: 0,
    ship, weapon: findWeapon(ship.weapon),
    player: {
      x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, angle: -Math.PI / 2,
      speed: 0, hp: ship.hull, maxHp: ship.hull,
      reload: 0, alive: true
    },
    enemies: [], projectiles: [], islands, convoy: [], effects: [],
    stats: { sunk: 0, shots: 0, hits: 0, time: 0, damageTaken: 0, waves: 1 },
    events: [], objectiveDone: false, failed: false,
    bossId: mission.mods && mission.mods.find((mod) => ['ironclad', 'leviathan', 'dreadlord'].includes(mod)) || null,
    nextId: 1
  };
  const initial = mode === 'campaign' && world.bossId ? 1 : 5;
  for (let i = 0; i < initial; i += 1) world.enemies.push(makeEnemy(world, world.nextId++, world.bossId));
  if (mission.mods && mission.mods.includes('convoy')) {
    for (let i = 0; i < 3; i += 1) world.convoy.push({ x: world.player.x + (i - 1) * 90, y: world.player.y + 140, hp: 30, alive: true });
  }
  return world;
}

function updatePlayer(world, input, dt) {
  const player = world.player;
  const turn = (input.turn || 0) * world.ship.turn;
  player.angle = wrap(player.angle + turn + Math.PI, Math.PI * 2) - Math.PI;
  const throttle = clamp(input.throttle || 0, -1, 1);
  const targetSpeed = throttle * world.ship.speed;
  player.speed += clamp(targetSpeed - player.speed, -8 * dt, 8 * dt);
  player.x = wrap(player.x + Math.cos(player.angle) * player.speed * dt * 60, WORLD_SIZE);
  player.y = wrap(player.y + Math.sin(player.angle) * player.speed * dt * 60, WORLD_SIZE);
  for (const island of world.islands) {
    const d = distance(player, island);
    if (d < island.radius + 12) {
      player.x = island.x + ((player.x - island.x) / Math.max(1, d)) * (island.radius + 12);
      player.y = island.y + ((player.y - island.y) / Math.max(1, d)) * (island.radius + 12);
      player.speed *= 0.4;
    }
  }
  player.reload -= dt;
  if (input.fire && player.reload <= 0) {
    player.reload = world.ship.reload;
    const weapon = world.weapon;
    for (let i = 0; i < weapon.shots; i += 1) {
      const spread = weapon.spread * (i - (weapon.shots - 1) / 2);
      const angle = player.angle + spread;
      world.projectiles.push({
        x: player.x + Math.cos(angle) * 24, y: player.y + Math.sin(angle) * 24,
        vx: Math.cos(angle) * weapon.speed, vy: Math.sin(angle) * weapon.speed,
        life: weapon.life, damage: world.ship.damage, radius: weapon.radius,
        team: 'player', color: weapon.color
      });
    }
    world.stats.shots += 1;
    world.events.push({ type: 'shoot' });
  }
}

function avoidIslands(world, entity) {
  for (const island of world.islands) {
    if (distance(entity, island) < island.radius + 220) {
      const desired = angleTo(entity, island);
      return angleDiff(desired + Math.PI, entity.angle) > 0 ? -1 : 1;
    }
  }
  return 0;
}

function updateAI(world, dt) {
  for (const enemy of world.enemies) {
    enemy.stateTimer -= dt;
    enemy.cooldown -= dt;
    const playerDistance = distance(enemy, world.player);
    if (enemy.stateTimer <= 0) {
      const roll = world.rng();
      if (enemy.hp < enemy.maxHp * 0.3) enemy.state = 'retreat';
      else if (playerDistance < 260) enemy.state = 'evade';
      else if (roll < 0.42) enemy.state = 'chase';
      else if (roll < 0.7) enemy.state = 'flank';
      else enemy.state = 'patrol';
      enemy.stateTimer = 1 + world.rng() * 2.5;
    }
    let targetAngle = enemy.angle;
    let throttle = 0.6;
    if (enemy.state === 'chase') targetAngle = angleTo(enemy, world.player);
    else if (enemy.state === 'flank') targetAngle = angleTo(enemy, world.player) + 0.7;
    else if (enemy.state === 'evade') targetAngle = angleTo(enemy, world.player) + Math.PI;
    else if (enemy.state === 'retreat') { targetAngle = angleTo(enemy, world.player) + Math.PI; throttle = 1; }
    else targetAngle = enemy.angle + (world.rng() - 0.5) * 0.6;
    const avoidance = avoidIslands(world, enemy);
    targetAngle += avoidance * 0.9;
    const diff = angleDiff(targetAngle, enemy.angle);
    enemy.angle += clamp(diff, -enemy.speed * dt * 1.6, enemy.speed * dt * 1.6);
    enemy.x = wrap(enemy.x + Math.cos(enemy.angle) * enemy.speed * throttle * dt * 60, WORLD_SIZE);
    enemy.y = wrap(enemy.y + Math.sin(enemy.angle) * enemy.speed * throttle * dt * 60, WORLD_SIZE);

    const aligned = Math.abs(angleDiff(angleTo(enemy, world.player), enemy.angle)) < 0.25 && playerDistance < 720;
    if (aligned && enemy.cooldown <= 0) {
      enemy.cooldown = enemy.reload;
      world.projectiles.push({
        x: enemy.x + Math.cos(enemy.angle) * 24, y: enemy.y + Math.sin(enemy.angle) * 24,
        vx: Math.cos(enemy.angle) * 10, vy: Math.sin(enemy.angle) * 10,
        life: 1.6, damage: enemy.damage, radius: 3, team: 'enemy', color: '#ff5f6d'
      });
    }
    if (enemy.boss && enemy.hp < enemy.maxHp * 0.5 && enemy.phase === 1) {
      enemy.phase = 2;
      enemy.reload *= 0.7;
      world.events.push({ type: 'bossPhase', enemy });
    }
  }
}

function updateProjectiles(world, dt, grid) {
  grid.clear();
  for (const enemy of world.enemies) grid.insert(enemy);
  for (let i = world.projectiles.length - 1; i >= 0; i -= 1) {
    const shot = world.projectiles[i];
    shot.x = wrap(shot.x + shot.vx * dt * 60, WORLD_SIZE);
    shot.y = wrap(shot.y + shot.vy * dt * 60, WORLD_SIZE);
    shot.life -= dt;
    let consumed = shot.life <= 0;
    if (shot.team === 'player') {
      for (const enemy of grid.near(shot.x, shot.y)) {
        if (enemy.hp <= 0 || distance(shot, enemy) > (enemy.boss ? 34 : 22)) continue;
        enemy.hp -= shot.damage;
        world.stats.hits += 1;
        world.effects.push({ type: 'hit', x: shot.x, y: shot.y, color: shot.color });
        if (enemy.hp <= 0) {
          world.stats.sunk += 1;
          world.effects.push({ type: 'sink', x: enemy.x, y: enemy.y, color: '#ffd166' });
          world.events.push({ type: 'sink', enemy });
        }
        consumed = true;
        break;
      }
    } else if (distance(shot, world.player) < 22 && world.player.alive) {
      world.player.hp = Math.max(0, world.player.hp - shot.damage);
      world.stats.damageTaken += shot.damage;
      world.effects.push({ type: 'hit', x: shot.x, y: shot.y, color: '#ff5f6d' });
      world.events.push({ type: 'playerHit', damage: shot.damage });
      consumed = true;
    }
    if (consumed) world.projectiles.splice(i, 1);
  }
  world.enemies = world.enemies.filter((enemy) => enemy.hp > 0);
}

function updateConvoy(world, dt) {
  for (const ship of world.convoy) {
    if (!ship.alive) continue;
    ship.hp -= dt * 1.4;
    if (ship.hp <= 0) { ship.alive = false; world.failed = true; world.events.push({ type: 'convoyLost' }); }
  }
}

export function evaluateObjective(world) {
  const objective = world.mission.objective;
  if (objective.type === 'sink') return world.stats.sunk >= objective.target;
  if (objective.type === 'survive') return world.stats.time >= objective.target;
  if (objective.type === 'escort') return world.stats.time >= objective.target && world.convoy.some((ship) => ship.alive);
  if (objective.type === 'boss') return world.stats.sunk >= objective.target && world.enemies.every((enemy) => !enemy.boss);
  return false;
}

/** Difficoltà adattiva: regola il numero di nemici in base alle prestazioni. */
export function adaptiveDifficulty(world, accuracy = 0.5) {
  if (accuracy > 0.7 && world.difficulty < 3) world.difficulty += 0.05;
  else if (accuracy < 0.25 && world.difficulty > 0.6) world.difficulty -= 0.05;
  return world.difficulty;
}

export function stepWorld(world, input, dt = 1 / 60) {
  world.events = [];
  world.time += dt;
  world.stats.time += dt;
  if (world.failed || world.objectiveDone) return world.events;
  updatePlayer(world, input, dt);
  updateAI(world, dt);
  updateProjectiles(world, dt, createGrid());
  if (world.convoy.length) updateConvoy(world, dt);

  const wanted = 4 + Math.floor(world.difficulty * 2);
  if (!world.mission.mods?.includes('boss') && world.enemies.length < wanted && world.rng() < 0.006) {
    world.enemies.push(makeEnemy(world, world.nextId++));
  }
  if (world.player.hp <= 0) { world.failed = true; world.events.push({ type: 'gameOver' }); }
  if (evaluateObjective(world)) { world.objectiveDone = true; world.events.push({ type: 'objective' }); }
  return world.events;
}
