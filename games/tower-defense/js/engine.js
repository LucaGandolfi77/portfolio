/* Motore di gioco: simulazione, ondate, combattimento */

import { TOWERS, ENEMIES, PATH, VIEW_W, VIEW_H, upgradeCost, maxLevel } from './config.js';
import { state, resetState, addFloater, addParticles, saveRecord } from './state.js';
import { createEnemy, createTower, buildWave, spawnInterval, canPlace } from './entities.js';
import { t } from './i18n.js';
import { play } from './audio.js';

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
}

export function startGame(modeId) {
  resetState(modeId);
  emit('td:start', { mode: state.mode });
  emit('td:screen', { screen: 'game' });
  play('start');
}

export function startNextWave() {
  const s = state;
  if (!s.running || s.isWaveActive || s.gameOver || s.victory) return;

  s.wave++;
  s.spawnQueue = buildWave(s.wave, s.modeConfig);
  s.waveTotal = s.spawnQueue.length;
  s.spawnTimer = 260;
  s.isWaveActive = true;

  const hasBoss = s.spawnQueue.indexOf('boss') !== -1;
  emit('td:toast', {
    text: hasBoss ? t('msg.boss') : t('msg.waveStart', { wave: s.wave }),
    kind: hasBoss ? 'danger' : 'info'
  });

  Object.keys(TOWERS).forEach(key => {
    if (TOWERS[key].unlockWave === s.wave && (s.wave > 0)) {
      emit('td:toast', { text: t('msg.unlocked', { name: t('tower.' + key + '.name') }), kind: 'success' });
    }
  });

  play(hasBoss ? 'boss' : 'wave');
  emit('td:wave', { wave: s.wave });
}

export function setSpeed(speed) {
  state.speed = speed;
  emit('td:toast', { text: t('msg.speed', { speed }), kind: 'info' });
  emit('td:hud');
}

export function togglePause(force) {
  if (!state.running || state.gameOver || state.victory) return;
  state.paused = typeof force === 'boolean' ? force : !state.paused;
  emit('td:screen', { screen: state.paused ? 'pause' : 'game' });
  emit('td:hud');
}

export function abandonToMenu() {
  state.running = false;
  state.paused = false;
  emit('td:screen', { screen: 'menu' });
}

export function selectTowerType(type) {
  if (!type || !TOWERS[type]) return;
  const def = TOWERS[type];
  if (!state.modeConfig.unlimitedMoney && state.wave < def.unlockWave) {
    emit('td:toast', { text: t('msg.locked'), kind: 'danger' });
    play('error');
    return;
  }
  state.selectedTower = null;
  state.selectedTowerType = state.selectedTowerType === type ? null : type;
  emit('td:selection');
  play('click');
}

export function clearSelection() {
  if (state.selectedTowerType || state.selectedTower) {
    state.selectedTowerType = null;
    state.selectedTower = null;
    emit('td:selection');
  }
}

export function placeTower(x, y) {
  const s = state;
  const type = s.selectedTowerType;
  if (!type) return false;
  const def = TOWERS[type];

  if (!canPlace(x, y)) {
    emit('td:toast', { text: t('msg.blocked'), kind: 'danger' });
    play('error');
    return false;
  }
  if (!s.modeConfig.unlimitedMoney && s.money < def.cost) {
    emit('td:toast', { text: t('msg.noMoney'), kind: 'danger' });
    play('error');
    return false;
  }

  const tower = createTower(type, x, y);
  s.towers.push(tower);
  if (!s.modeConfig.unlimitedMoney) s.money -= def.cost;

  s.selectedTower = tower;
  s.selectedTowerType = null;
  addParticles(x, y, def.color, 14, 120);
  addFloater(x, y - 24, '-' + def.cost, '#fca5a5', 13);
  play('place');
  emit('td:toast', { text: t('msg.placed'), kind: 'success' });
  emit('td:selection');
  emit('td:hud');
  return true;
}

export function selectTowerAt(x, y) {
  let found = null;
  for (const t of state.towers) {
    if (Math.hypot(x - t.x, y - t.y) < 22) { found = t; break; }
  }
  state.selectedTower = found;
  state.selectedTowerType = null;
  emit('td:selection');
  if (found) play('click');
}

export function upgradeTower() {
  const tower = state.selectedTower;
  if (!tower || tower.level >= maxLevel(tower)) return;
  const cost = upgradeCost(tower);
  if (state.money < cost) {
    emit('td:toast', { text: t('msg.noMoney'), kind: 'danger' });
    play('error');
    return;
  }
  state.money -= cost;
  tower.invested += cost;
  tower.level++;
  tower.damage = tower.baseDamage * Math.pow(1.22, tower.level - 1);
  tower.range = tower.baseRange * (1 + 0.08 * (tower.level - 1));
  tower.rate = tower.baseRate > 0 ? Math.max(55, tower.baseRate * Math.pow(0.92, tower.level - 1)) : 0;

  addParticles(tower.x, tower.y, tower.color, 18, 150);
  addFloater(tower.x, tower.y - 26, 'Lv ' + tower.level, '#86efac', 15);
  play('upgrade');
  emit('td:toast', { text: t('msg.upgraded'), kind: 'success' });
  emit('td:selection');
  emit('td:hud');
}

export function sellTower() {
  const tower = state.selectedTower;
  if (!tower) return;
  const value = Math.floor(tower.invested * 0.6);
  state.money += value;
  state.towers = state.towers.filter(t => t !== tower);
  state.selectedTower = null;
  addFloater(tower.x, tower.y - 20, '+' + value, '#86efac', 14);
  addParticles(tower.x, tower.y, '#f8fafc', 10, 90);
  play('sell');
  emit('td:toast', { text: t('msg.sold'), kind: 'success' });
  emit('td:selection');
  emit('td:hud');
}

export function setTargeting(strategy) {
  if (!state.selectedTower) return;
  state.selectedTower.targeting = strategy;
  play('click');
  emit('td:selection');
}

/* ---------------- Danni e sistemi interni ---------------- */

function killEnemy(enemy, tower) {
  if (enemy.dead) return;
  enemy.dead = true;
  state.kills++;
  if (tower) tower.kills++;
  const money = state.modeConfig.unlimitedMoney ? 0 : enemy.reward;
  state.money += money;
  state.score += enemy.reward * 10;
  addParticles(enemy.x, enemy.y, enemy.color, enemy.boss ? 34 : 9, enemy.boss ? 220 : 100);
  if (money > 0) addFloater(enemy.x, enemy.y - enemy.radius - 8, '+' + money, '#fde68a', 12);
  if (enemy.boss) {
    state.shake = 14;
    play('explode');
  } else {
    play('hit');
  }
  emit('td:hud');
}

function dealDamage(enemy, amount, tower) {
  if (!enemy || enemy.dead) return;
  let dmg = amount * (1 - (enemy.armor || 0));
  if (enemy.shield > 0) {
    const absorbed = Math.min(enemy.shield, dmg);
    enemy.shield -= absorbed;
    dmg -= absorbed;
    enemy.hitFlash = 100;
    if (absorbed > 0 && Math.random() < 0.12) {
      addFloater(enemy.x, enemy.y - enemy.radius - 6, Math.round(absorbed), '#93c5fd', 11);
    }
  }
  if (dmg > 0) {
    enemy.hp -= dmg;
    enemy.hitFlash = 130;
  }
  if (enemy.hp <= 0) killEnemy(enemy, tower);
}

function leakEnemy(enemy) {
  if (enemy.dead) return;
  enemy.dead = true;
  enemy.leaked = true;
  state.leaked++;
  const loss = enemy.boss ? 5 : 1;
  if (!state.modeConfig.noLose) {
    state.lives -= loss;
    addFloater(VIEW_W - 40, enemy.y - 18, '-' + loss + ' ❤', '#fca5a5', 16);
  }
  state.shake = enemy.boss ? 16 : 7;
  play('leak');
  emit('td:toast', { text: t('msg.leak'), kind: 'danger' });
  emit('td:hud');
  if (!state.modeConfig.noLose && state.lives <= 0) {
    state.lives = 0;
    endGame(false);
  }
}

function pickTarget(tower) {
  const enemies = state.enemies;
  let best = null;
  let bestScore = -Infinity;

  for (const e of enemies) {
    if (e.dead) continue;
    const dist = Math.hypot(e.x - tower.x, e.y - tower.y);
    if (dist > tower.range) continue;
    let score;
    if (tower.targeting === 'first') score = e.pathIdx * 10000 - dist;
    else if (tower.targeting === 'strong') score = e.hp;
    else score = -dist;
    if (score > bestScore) { bestScore = score; best = e; }
  }
  return best;
}

function fireTower(tower, target) {
  const p = {
    x: tower.x,
    y: tower.y,
    target,
    tower,
    speed: tower.projectileSpeed,
    damage: tower.damage,
    color: tower.color,
    kind: tower.kind,
    splash: tower.splash,
    slowFactor: tower.slowFactor,
    slowTime: tower.slowTime,
    trail: []
  };
  state.projectiles.push(p);
  tower.flash = 110;
  play(tower.kind === 'splash' ? 'cannon' : 'shoot');
}

function fireChain(tower, target) {
  const hit = [target];
  let current = target;
  const used = new Set([target]);
  for (let i = 1; i < tower.chains; i++) {
    let next = null;
    let bestDist = 120;
    for (const e of state.enemies) {
      if (e.dead || used.has(e)) continue;
      const d = Math.hypot(e.x - current.x, e.y - current.y);
      if (d < bestDist) { bestDist = d; next = e; }
    }
    if (!next) break;
    used.add(next);
    hit.push(next);
    current = next;
  }
  hit.forEach((enemy, idx) => {
    state.beams.push({
      x1: idx === 0 ? tower.x : hit[idx - 1].x,
      y1: idx === 0 ? tower.y : hit[idx - 1].y,
      x2: enemy.x, y2: enemy.y,
      color: tower.color, life: 160, maxLife: 160
    });
    dealDamage(enemy, tower.damage * Math.pow(0.72, idx), tower);
  });
  tower.flash = 130;
  addParticles(target.x, target.y, tower.color, 6, 70);
  play('tesla');
}

function hitProjectile(p) {
  const target = p.target;
  if (!target || target.dead) return;

  if (p.kind === 'splash') {
    for (const e of state.enemies) {
      if (e.dead) continue;
      const d = Math.hypot(e.x - target.x, e.y - target.y);
      if (d <= p.splash) dealDamage(e, p.damage * (1 - 0.45 * d / p.splash), p.tower);
    }
    addParticles(target.x, target.y, '#fb923c', 22, 190);
    state.shake = Math.max(state.shake, 4);
    play('explode');
  } else {
    dealDamage(target, p.damage, p.tower);
    if (p.kind === 'slow' && !target.dead) {
      target.slowUntil = state.elapsed + p.slowTime;
      target.slowFactor = p.slowFactor;
      addParticles(target.x, target.y, p.color, 5, 60);
    }
  }
}

/* ---------------- Ciclo di aggiornamento ---------------- */

export function update(rawDt) {
  const s = state;
  if (!s.running || s.paused || s.gameOver || s.victory) return;

  const dt = Math.min(Math.max(rawDt, 0), 48) * s.speed;
  s.elapsed += dt;

  /* Spawn */
  if (s.isWaveActive && s.spawnQueue.length) {
    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      const key = s.spawnQueue.pop();
      s.enemies.push(createEnemy(key, s.wave, s.modeConfig));
      s.spawnTimer = spawnInterval(s.wave, s.modeConfig);
    }
  }

  /* Movimento nemici */
  for (const e of s.enemies) {
    if (e.dead) continue;
    const slow = e.slowUntil > s.elapsed ? e.slowFactor : 1;
    let remaining = e.speed * slow * dt / 1000;
    let guard = 0;
    while (remaining > 0 && guard++ < 8) {
      const target = PATH[e.pathIdx + 1];
      if (!target) { leakEnemy(e); break; }
      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= remaining) {
        e.x = target.x;
        e.y = target.y;
        e.pathIdx++;
        remaining -= dist;
        if (e.pathIdx >= PATH.length - 1) { leakEnemy(e); break; }
      } else {
        e.x += dx / dist * remaining;
        e.y += dy / dist * remaining;
        e.angle = Math.atan2(dy, dx);
        remaining = 0;
      }
    }
    if (e.hitFlash > 0) e.hitFlash -= dt;
    if (e.healPulse > 0) e.healPulse -= dt;
  }

  /* Medici: curano gli alleati vicini */
  for (const m of s.enemies) {
    if (m.dead || !m.heal) continue;
    for (const a of s.enemies) {
      if (a.dead || a === m) continue;
      if (a.hp >= a.maxHp) continue;
      if (Math.hypot(a.x - m.x, a.y - m.y) <= 92) {
        a.hp = Math.min(a.maxHp, a.hp + m.heal * dt / 1000);
        a.healPulse = 200;
      }
    }
  }

  /* Torri */
  for (const tower of s.towers) {
    if (tower.cooldown > 0) tower.cooldown -= dt;
    if (tower.flash > 0) tower.flash -= dt;
    const target = pickTarget(tower);
    if (!target) continue;
    tower.angle = Math.atan2(target.y - tower.y, target.x - tower.x);

    if (tower.kind === 'beam') {
      dealDamage(target, tower.damage * dt / 1000, tower);
      s.beams.push({
        x1: tower.x, y1: tower.y, x2: target.x, y2: target.y,
        color: tower.color, life: 70, maxLife: 70, width: 5
      });
      if (Math.random() < 0.25) addParticles(target.x, target.y, tower.color, 1, 45);
    } else if (tower.cooldown <= 0) {
      if (tower.kind === 'chain') fireChain(tower, target);
      else fireTower(tower, target);
      tower.cooldown = tower.rate;
    }
  }

  /* Proiettili */
  for (let i = s.projectiles.length - 1; i >= 0; i--) {
    const p = s.projectiles[i];
    if (!p.target || p.target.dead) {
      let replacement = null;
      let bestDist = 170;
      for (const e of s.enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < bestDist) { bestDist = d; replacement = e; }
      }
      if (!replacement) { s.projectiles.splice(i, 1); continue; }
      p.target = replacement;
    }
    const dx = p.target.x - p.x;
    const dy = p.target.y - p.y;
    const dist = Math.hypot(dx, dy);
    const step = p.speed * dt / 1000;
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 5) p.trail.shift();
    if (dist <= step) {
      p.x = p.target.x;
      p.y = p.target.y;
      hitProjectile(p);
      s.projectiles.splice(i, 1);
    } else {
      p.x += dx / dist * step;
      p.y += dy / dist * step;
    }
  }

  /* Raggi, particelle, numeri */
  for (let i = s.beams.length - 1; i >= 0; i--) {
    s.beams[i].life -= dt;
    if (s.beams[i].life <= 0) s.beams.splice(i, 1);
  }
  for (let i = s.particles.length - 1; i >= 0; i--) {
    const p = s.particles[i];
    p.x += p.vx * dt / 1000;
    p.y += p.vy * dt / 1000;
    p.vx *= 0.97;
    p.vy *= 0.97;
    p.life -= dt;
    if (p.life <= 0) s.particles.splice(i, 1);
  }
  for (let i = s.floaters.length - 1; i >= 0; i--) {
    const f = s.floaters[i];
    f.y -= 26 * dt / 1000;
    f.life -= dt;
    if (f.life <= 0) s.floaters.splice(i, 1);
  }
  if (s.shake > 0) s.shake = Math.max(0, s.shake - dt * 0.04);

  /* Pulizia nemici morti */
  if (s.enemies.some(e => e.dead)) s.enemies = s.enemies.filter(e => !e.dead);

  /* Fine ondata */
  if (s.isWaveActive && s.spawnQueue.length === 0 && s.enemies.length === 0) {
    s.isWaveActive = false;
    const bonus = Math.round((18 + s.wave * 7) * s.modeConfig.rewardScale);
    s.money += bonus;
    s.score += bonus * 5;
    s.lastWaveBonus = bonus;
    addFloater(VIEW_W / 2, VIEW_H / 2 - 40, '+' + bonus, '#fde68a', 26);
    emit('td:toast', { text: t('msg.waveClear', { wave: s.wave, bonus }), kind: 'success' });
    play('waveclear');
    emit('td:hud');
    if (s.modeConfig.waveCap && s.wave >= s.modeConfig.waveCap) endGame(true);
  }
}

/* ---------------- Fine partita ---------------- */

export function endGame(won) {
  const s = state;
  if (s.gameOver || s.victory) return;
  s.running = false;
  s.gameOver = !won;
  s.victory = !!won;
  s.isWaveActive = false;
  s.selectedTowerType = null;

  if (won) s.score += s.lives * 50;

  const result = saveRecord(s.mode, {
    wave: s.wave,
    score: s.score,
    timeMs: won ? Math.round(s.elapsed) : 0,
    victory: won
  });

  if (won) play('victory');
  else play('gameover');

  emit('td:end', {
    victory: won,
    mode: s.mode,
    wave: s.wave,
    score: s.score,
    kills: s.kills,
    timeMs: Math.round(s.elapsed),
    leaked: s.leaked,
    isNewScore: result.isNewScore,
    isNewWave: result.isNewWave,
    record: result.record
  });
  emit('td:screen', { screen: won ? 'victory' : 'gameover' });
}

export function getTowerDef(type) { return TOWERS[type]; }
export function getEnemyDef(type) { return ENEMIES[type]; }
