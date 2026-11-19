/* Arrowmatic — run logic, waves, combat, AI and progression hooks */

import { G, SV, save, clearEntities, wavesFor, chapterOf, diffMul, metaStats, heroMods } from './state.js';
import { ENEMIES, BOSSES, WEAPONS, DRAFT, MAXLVL } from './data.js';
import { rnd, ri, clamp } from './util.js';
import { AU } from './audio.js';
import { missionProgress, countBoss } from './progression.js';
import { banner, openDraft, updHud, endRunUI, setBossUI, toast } from './ui.js';

export function newRun() {
  const ms = metaStats();
  const wd = WEAPONS[SV.weapons.sel] || WEAPONS.bow;
  const has = id => SV.accs.eq.includes(id);
  clearEntities();
  G.P = {
    x: G.W / 2, y: G.H * 0.62, vx: 0, vy: 0, angle: -Math.PI / 2,
    hp: ms.maxHp, maxHp: ms.maxHp, speed: ms.speed,
    weapon: SV.weapons.sel, wd,
    dmgMul: ms.dmg, rateMul: 1, spdMul: 1, rangeMul: 1,
    n: wd.n || 1, pierce: wd.pierce || 0, bounce: 0, rear: 0, side: 0, diag: 0,
    critC: ms.critC, critD: 2, vamp: 0, pickMul: has('magnet') ? 2.5 : 1, moveFire: false,
    fireCd: 0, moving: false, inv: 0, revived: false,
    waveShield: has('waveshield'), rerolls: (has('dice') ? 1 : 0) + (heroMods().luck ? 1 : 0),
    greed: ms.greed, luck: ms.luck, runLv: 1, xp: 0, xpNeed: 17, xpBuffer: 0, wavePendingLv: 0
  };
  const level = 1;
  G.run = { level, wave: 1, waves: wavesFor(level), coins: 0, kills: 0, pendingNext: false };
  G.SCR = 'run';
  G.paused = false;
  G.autoT = 0;
  startWave();
  updHud();
  banner('ONDATA 1/' + G.run.waves, '#fff');
  return G.P;
}

export function startWave() {
  const level = G.run.level;
  const wave = G.run.wave;
  if (G.P) G.P._wsUsed = false;
  if (wave > G.run.waves) { spawnBoss(); return; }
  const types = ['slime'];
  if (level >= 2) types.push('bat');
  if (level >= 3) types.push('shoot');
  if (level >= 5) types.push('split');
  if (level >= 8) types.push('tank');
  const count = Math.min(14, 3 + wave + Math.floor(level / 4));
  G.spawnQueue = [];
  for (let k = 0; k < count; k++) {
    G.spawnQueue.push({ t: types[Math.floor(Math.random() * types.length)], d: 0.25 * k });
  }
}

function spawnOne(typeName) {
  const d = ENEMIES[typeName];
  if (!d || !G.P) return;
  const dm = diffMul(G.run.level, G.run.wave);
  let hp = Math.round(d.hp * dm);
  let dmg = d.dmg * Math.sqrt(dm);
  const elite = Math.random() < Math.min(0.16, 0.04 + G.run.level * 0.01) && typeName !== 'mini';
  if (elite) { hp *= 2.3; dmg *= 1.35; }
  let x, y, tries = 0;
  do {
    x = rnd(50, G.W - 50);
    y = rnd(50, G.H * 0.45);
    tries++;
  } while (Math.hypot(x - G.P.x, y - G.P.y) < 170 && tries < 20);
  G.enemies.push({
    type: typeName, x, y, vx: 0, vy: 0, r: d.r * (elite ? 1.25 : 1),
    hp, maxHp: hp, dmg, spd: d.spd * (elite ? 0.9 : 1), col: d.col, face: d.face,
    zig: d.zig, shoot: d.shoot ? { ...d.shoot } : null, split: d.split,
    xp: d.xp * (elite ? 3 : 1), coin: d.coin * (elite ? 4 : 1),
    elite, cd: rnd(0.5, 1.5), wt: 0, tx: x, ty: y, flash: 0
  });
}

function spawnBoss() {
  const isOmega = G.run.level > 30;
  const index = isOmega ? ri(0, BOSSES.length - 1) : Math.min(BOSSES.length - 1, chapterOf(G.run.level));
  const bd = BOSSES[index];
  const dm = diffMul(G.run.level, G.run.wave);
  const hp = Math.round(bd.hp * dm);
  const boss = {
    type: 'boss', name: (isOmega ? 'Ω ' : '') + bd.name,
    x: G.W / 2, y: G.H * 0.22, vx: 0, vy: 0,
    r: 34, hp, maxHp: hp, dmg: 22 * Math.sqrt(dm), spd: 60, col: bd.col, face: 4,
    pattern: bd.pattern, pi: 0, pt: 1.6, state: 'idle', xp: 15, coin: 40,
    boss: true, alive: true, cd: 2, wt: 0, tx: 0, ty: 0, flash: 0, shoot: null, elite: false
  };
  G.enemies.push(boss);
  G.bossRef = boss;
  setBossUI(boss);
  banner('⚠ ' + boss.name.toUpperCase(), '#ffb3bb');
  AU.boss();
  G.run.wave = G.run.waves + 1;
}

export function inputVector() {
  let ax = 0, ay = 0;
  const k = G.keys;
  if (k.KeyW || k.ArrowUp) ay -= 1;
  if (k.KeyS || k.ArrowDown) ay += 1;
  if (k.KeyA || k.ArrowLeft) ax -= 1;
  if (k.KeyD || k.ArrowRight) ax += 1;
  if (ax || ay) {
    const m = Math.hypot(ax, ay);
    return { x: ax / m, y: ay / m };
  }
  if (G.joy.on && (Math.abs(G.joy.dx) > 0.12 || Math.abs(G.joy.dy) > 0.12)) {
    return { x: G.joy.dx, y: G.joy.dy };
  }
  return null;
}

function autoBrain(dt) {
  G.autoT += dt;
  const P = G.P;
  const foes = G.enemies.filter(e => !e.dead);
  if (!foes.length) {
    let best = null, bd = 1e9;
    for (const d of G.drops) {
      const dd = Math.hypot(d.x - P.x, d.y - P.y);
      if (dd < bd) { bd = dd; best = d; }
    }
    if (best && bd > 20) return { x: (best.x - P.x) / Math.max(1, bd), y: (best.y - P.y) / Math.max(1, bd) };
    return null;
  }
  let target = null, bd = 1e9;
  for (const e of foes) {
    const d = Math.hypot(e.x - P.x, e.y - P.y) - e.r;
    if (d < bd) { bd = d; target = e; }
  }
  if (!target) return null;

  let dangerX = 0, dangerY = 0, inDanger = false;
  for (const b of G.ebullets) {
    const dx = P.x - b.x, dy = P.y - b.y;
    const d = Math.hypot(dx, dy);
    if (d < 120) {
      const w = (1 - d / 120) * 2.2;
      dangerX += dx / (d || 1) * w;
      dangerY += dy / (d || 1) * w;
      inDanger = true;
    }
  }
  const range = P.wd.range * P.rangeMul * 0.8;
  const dx = target.x - P.x, dy = target.y - P.y;
  const d = Math.hypot(dx, dy) || 1;
  const want = range * 0.7;
  let mx = 0, my = 0;
  if (inDanger) { mx = dangerX; my = dangerY; }
  else if (d > want + 30) { mx = dx / d; my = dy / d; }
  else if (d < want - 40) { mx = -dx / d; my = -dy / d; }
  else {
    const t = (G.autoT * 0.6) % 2;
    if (t < 1.25) { mx = -dy / d * 0.5; my = dx / d * 0.5; }
    else return null;
  }
  if (P.hp < P.maxHp * 0.5) {
    for (const dr of G.drops) {
      if (dr.type !== 'heart') continue;
      const dd = Math.hypot(dr.x - P.x, dr.y - P.y);
      if (dd < 230) { mx = (dr.x - P.x) / dd; my = (dr.y - P.y) / dd; }
    }
  }
  const m = Math.hypot(mx, my) || 1;
  return { x: mx / m, y: my / m };
}

function shootAt(target) {
  const P = G.P;
  const base = Math.atan2(target.y - P.y, target.x - P.x);
  P.angle = base;
  const wd = P.wd;
  const angles = [base];
  const sidePairs = Math.ceil(P.side / 2);
  for (let i = 1; i <= sidePairs; i++) {
    angles.push(base + 0.21 * i);
    if (angles.length <= P.side) angles.push(base - 0.21 * i);
  }
  if (P.side % 2 === 1) angles[angles.length - 1] = base + Math.PI;
  for (let i = 1; i <= Math.floor(P.diag / 2); i++) angles.push(base + 0.78 * i, base - 0.78 * i);
  for (let i = 0; i < P.rear; i++) angles.push(base + Math.PI);
  AU.shoot();
  angles.forEach(a => {
    const crit = Math.random() < P.critC;
    const dmg = Math.round(P.wd.dmg * P.dmgMul * (crit ? P.critD : 1));
    G.bullets.push({
      x: P.x + Math.cos(a) * 14, y: P.y + Math.sin(a) * 14,
      vx: Math.cos(a) * wd.pspd, vy: Math.sin(a) * wd.pspd,
      dmg, crit, pierce: P.pierce, bounce: P.bounce,
      aoe: wd.aoe, ret: !!wd.return,
      life: (wd.range ? wd.range * P.rangeMul : 440) / wd.pspd,
      maxLife: 1.1, col: crit ? '#fbbf24' : '#ffffff'
    });
  });
}

function nearestEnemy() {
  const P = G.P;
  let best = null, bd = 1e9;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const d = Math.hypot(e.x - P.x, e.y - P.y);
    if (d < bd) { bd = d; best = e; }
  }
  const reach = (P.wd.range || 340) * P.rangeMul * 1.25;
  if (best && bd - (best.r || 0) > reach) return null;
  return best;
}

function spawnParticle(x, y, col) {
  if (G.parts.length > 320) return;
  const a = Math.random() * 6.28;
  const s = rnd(40, 190);
  G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.3, 0.7), maxLife: 0.7, col });
}

function boom(x, y, col, n) {
  const cap = 300 - G.parts.length;
  if (cap <= 0) return;
  const count = Math.min(n, cap);
  for (let i = 0; i < count; i++) spawnParticle(x, y, col);
}

function explode(x, y, r, dmg) {
  boom(x, y, '#fdba74', 20);
  G.shake = Math.max(G.shake, 7);
  AU.boom();
  for (const e of G.enemies) {
    if (!e.dead && Math.hypot(e.x - x, e.y - y) < r) damageEnemy(e, Math.round(dmg));
  }
}

function drop(x, y, type, val) {
  G.drops.push({ x, y, type, val, life: 12, ph: Math.random() * 6 });
}

function collectDrop(dr) {
  const P = G.P;
  switch (dr.type) {
    case 'coin': {
      const v = dr.val || 1;
      G.run.coins += v;
      missionProgress('coin', v);
      AU.coin();
      break;
    }
    case 'gem': gainXp(1); break;
    case 'heart':
      P.hp = Math.min(P.maxHp, P.hp + 25);
      G.floats.push({ x: P.x, y: P.y - 20, txt: '+25 ❤️', life: 0.9, col: '#84cc16' });
      AU.heart();
      break;
    case 'magnet':
      for (const d of G.drops) if (d.type === 'coin' || d.type === 'gem') { d.x = P.x; d.y = P.y; }
      banner('🧲 MAGNETE!', '#7dd3fc');
      break;
    case 'bomb':
      explode(G.W / 2, G.H / 2, Math.max(G.W, G.H), 60);
      banner('💣 KABOOM!', '#fda4af');
      break;
    case 'chest': {
      const keys = Object.keys(WEAPONS).filter(k => k !== P.weapon);
      const next = keys[ri(0, keys.length - 1)];
      P.weapon = next;
      P.wd = WEAPONS[next];
      banner(P.wd.ic + ' ' + P.wd.name.toUpperCase() + '!', '#fde68a');
      AU.draft();
      break;
    }
  }
}

function gainXp(n) { G.P.xpBuffer += n; }
function xpNeedFor(level) { return Math.floor(14 + level * 8 + level * level * 1.6); }

function processWaveXp() {
  const P = G.P;
  if (P.xpBuffer <= 0) return false;
  const gained = P.xpBuffer;
  P.xpBuffer = 0;
  P.xp += gained;
  G.floats.push({ x: P.x, y: P.y - 30, txt: '+' + gained + ' XP', life: 1, col: '#a78bfa' });
  while (P.xp >= P.xpNeed && P.wavePendingLv < 1) {
    P.xp -= P.xpNeed;
    P.runLv++;
    P.xpNeed = xpNeedFor(P.runLv);
    P.wavePendingLv++;
  }
  if (P.wavePendingLv > 0) {
    P.wavePendingLv--;
    openDraft();
    missionProgress('draft', 1);
    return true;
  }
  return false;
}

function advanceWave() {
  G.run.wave++;
  startWave();
}

export function afterDraft() {
  const P = G.P;
  if (P.wavePendingLv > 0) {
    P.wavePendingLv--;
    openDraft();
    return;
  }
  advanceWave();
}

function levelClear() {
  const bonus = Math.round((18 + G.run.level * 7) * G.P.greed);
  G.run.coins += bonus;
  SV.bestLv = Math.max(SV.bestLv, G.run.level);
  missionProgress('level', 1);
  banner('LIVELLO ' + G.run.level + ' ✔ +' + bonus + '🪙', '#a7f3d0');
  AU.lvl();
  save();
  G.run.pendingNext = true;
}

function hurtPlayer(dmg) {
  const P = G.P;
  if (P.inv > 0) return;
  if (P.waveShield && !P._wsUsed) {
    P._wsUsed = true;
    P.inv = 0.6;
    G.floats.push({ x: P.x, y: P.y - 22, txt: '🛡️ BLOCCATO', life: 0.9, col: '#7dd3fc' });
    AU.hit();
    return;
  }
  P.hp -= dmg;
  P.inv = 0.6;
  G.shake = Math.max(G.shake, 5);
  G.floats.push({ x: P.x, y: P.y - 20, txt: '-' + Math.round(dmg), life: 0.7, col: '#fca5a5' });
  AU.hit();
  if (P.hp <= 0) {
    if (SV.accs.eq.includes('revive') && !P.revived) {
      P.revived = true;
      P.hp = Math.round(P.maxHp * 0.5);
      P.inv = 1.6;
      banner('💗 CUORE RICAMBIO!', '#fbcfe8');
      AU.lego();
      return;
    }
    endRun(false);
  }
}

function killEnemy(en) {
  en.dead = true;
  G.run.kills++;
  SV.kills++;
  missionProgress('kill', 1);
  G.shake = Math.max(G.shake, en.boss ? 12 : 4);
  boom(en.x, en.y, en.col, en.boss ? 40 : 16);
  AU.kill();
  drop(en.x, en.y, 'coin', Math.max(1, Math.round(en.coin * G.P.greed)));
  if (Math.random() < 0.14) drop(en.x + rnd(-14, 14), en.y, 'gem');
  if (Math.random() < 0.05) drop(en.x, en.y, 'heart');
  if (Math.random() < 0.025) drop(en.x, en.y, ['magnet', 'bomb', 'chest'][ri(0, 2)]);
  if (en.boss) {
    G.bossRef = null;
    setBossUI(null);
    countBoss();
    missionProgress('boss', 1);
    for (let i = 0; i < 8; i++) drop(en.x + rnd(-40, 40), en.y + rnd(-40, 40), 'gem');
    drop(en.x, en.y, 'heart');
    drop(en.x + 20, en.y, 'chest');
    banner(en.name + ' È STATO SMONTATO!', '#a7f3d0');
    AU.boom();
  }
  if (en.split) {
    for (let i = 0; i < en.split; i++) {
      const d = ENEMIES.mini;
      const hp = Math.round(d.hp * diffMul(G.run.level, G.run.wave));
      G.enemies.push({
        type: 'mini', x: en.x + rnd(-16, 16), y: en.y + rnd(-16, 16), vx: 0, vy: 0, r: d.r,
        hp, maxHp: hp, dmg: d.dmg, spd: d.spd, col: d.col, face: 1, xp: 1, coin: 1,
        dead: false, cd: 0, wt: 0, tx: 0, ty: 0, flash: 0
      });
    }
  }
  gainXp(en.xp);
}

function damageEnemy(en, dmg, crit, hx, hy) {
  en.hp -= dmg;
  en.flash = 0.1;
  G.floats.push({ x: hx ?? en.x, y: hy ?? en.y - 10, txt: (crit ? '💥' + dmg + '!' : '' + dmg), life: 0.7, col: crit ? '#fbbf24' : '#fff' });
  AU.hit();
  if (G.P.vamp > 0) G.P.hp = Math.min(G.P.maxHp, G.P.hp + dmg * G.P.vamp);
  if (en.hp <= 0) killEnemy(en);
}

function patternDur(state) {
  return state === 'charge' ? 1.35 : state === 'radial' ? 1.7 : state === 'spiral' ? 2 : state === 'wall' ? 2.4 : 1.6;
}

function spawnMinion(boss) {
  if (G.enemies.filter(e => !e.dead && !e.boss).length > 16) return;
  const type = Math.random() < 0.5 ? 'slime' : 'mini';
  const d = ENEMIES[type];
  const a = Math.random() * 6.28;
  const hp = Math.round(d.hp * diffMul(G.run.level, G.run.wave));
  G.enemies.push({
    type, x: boss.x + Math.cos(a) * 60, y: boss.y + Math.sin(a) * 60, vx: 0, vy: 0,
    r: d.r, hp, maxHp: hp, dmg: d.dmg, spd: d.spd, col: d.col, face: 1,
    xp: 1, coin: 1, dead: false, cd: 0, wt: 0, tx: 0, ty: 0, flash: 0
  });
  boom(boss.x + Math.cos(a) * 60, boss.y + Math.sin(a) * 60, '#fff', 5);
}

function stepBoss(en, dt, d, dx, dy) {
  en.pt -= dt;
  const pattern = en.pattern;
  switch (en.state) {
    case 'idle':
      en.angle = Math.atan2(dy, dx);
      if (d > 170) { en.x += dx / d * en.spd * dt; en.y += dy / d * en.spd * dt; }
      if (en.pt <= 0) { en.state = pattern[en.pi % pattern.length]; en.pi++; en.pt = patternDur(en.state); en.sub = 0; }
      break;
    case 'charge':
      if (en.pt <= patternDur('charge') - 0.55) {
        if (!en.chargeA) en.chargeA = Math.atan2(dy, dx);
        en.x += Math.cos(en.chargeA) * en.spd * 4.2 * dt;
        en.y += Math.sin(en.chargeA) * en.spd * 4.2 * dt;
        en.x = clamp(en.x, en.r, G.W - en.r);
        en.y = clamp(en.y, en.r, G.H - en.r);
      }
      if (en.pt <= 0) { en.state = 'idle'; en.pt = 1.1; en.chargeA = null; }
      break;
    case 'radial':
      en.sub = (en.sub || 0) + dt;
      if (en.sub > 0.42) {
        en.sub = 0;
        const count = 14, off = Math.random() * 6.28;
        for (let i = 0; i < count; i++) {
          const a = off + i / count * 6.28;
          G.ebullets.push({ x: en.x, y: en.y, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, dmg: en.dmg * 0.8, life: 4, r: 7, col: '#f472b6' });
        }
        AU.enemyLaser();
      }
      if (en.pt <= 0) { en.state = 'idle'; en.pt = 1.2; }
      break;
    case 'spiral':
      en.sub = (en.sub || 0) + dt;
      if (en.sub > 0.09) {
        en.sub = 0;
        const a = performance.now() / 180;
        for (let k = 0; k < 2; k++) {
          const aa = a + k * Math.PI;
          G.ebullets.push({ x: en.x, y: en.y, vx: Math.cos(aa) * 150, vy: Math.sin(aa) * 150, dmg: en.dmg * 0.7, life: 4, r: 6, col: '#fdba74' });
        }
      }
      if (en.pt <= 0) { en.state = 'idle'; en.pt = 1.3; }
      break;
    case 'wall':
      en.sub = (en.sub || 0) + dt;
      if (en.sub > 0.8) {
        en.sub = 0;
        const sideY = Math.random() < 0.5 ? 40 : G.H - 40;
        for (let x = 30; x < G.W; x += 46) {
          G.ebullets.push({ x, y: sideY, vx: 0, vy: sideY === 40 ? 150 : -150, dmg: en.dmg * 0.7, life: 5, r: 8, col: '#ef4444' });
        }
        AU.enemyLaser();
      }
      if (en.pt <= 0) { en.state = 'idle'; en.pt = 1.4; }
      break;
    case 'spawn':
      en.sub = (en.sub || 0) + dt;
      if (en.sub > 0.55) { en.sub = 0; spawnMinion(en); }
      if (en.pt <= 0) { en.state = 'idle'; en.pt = 1.2; }
      break;
  }
}

function stepEnemy(en, dt) {
  if (en.flash > 0) en.flash -= dt;
  const dx = G.P.x - en.x, dy = G.P.y - en.y;
  const d = Math.hypot(dx, dy) || 1;
  if (en.boss) { stepBoss(en, dt, d, dx, dy); }
  else if (en.shoot) {
    en.angle = Math.atan2(dy, dx);
    if (d > en.shoot.range * 0.8) { en.x += dx / d * en.spd * dt; en.y += dy / d * en.spd * dt; }
    else if (d < en.shoot.range * 0.5) { en.x -= dx / d * en.spd * 0.7 * dt; en.y -= dy / d * en.spd * 0.7 * dt; }
    en.cd -= dt;
    if (en.cd <= 0 && d < en.shoot.range) {
      en.cd = en.shoot.cd;
      G.ebullets.push({ x: en.x, y: en.y, vx: dx / d * en.shoot.spd, vy: dy / d * en.shoot.spd, dmg: en.dmg, life: 3, r: 6, col: '#22d3ee' });
    }
  } else {
    en.angle = Math.atan2(dy, dx);
    let sx = 0, sy = 0;
    if (en.zig) {
      const z = Math.sin(performance.now() / 120 + en.x) * 0.9;
      sx = -dy / d * z; sy = dx / d * z;
    }
    en.x += (dx / d + sx) * en.spd * dt;
    en.y += (dy / d + sy) * en.spd * dt;
  }
  for (const other of G.enemies) {
    if (other === en || other.dead) continue;
    const ox = en.x - other.x, oy = en.y - other.y;
    const od = Math.hypot(ox, oy);
    if (od > 0 && od < en.r + other.r) {
      const push = (en.r + other.r - od) / od * 0.5;
      en.x += ox * push; en.y += oy * push;
    }
  }
  en.x = clamp(en.x, 20, G.W - 20);
  en.y = clamp(en.y, 20, G.H - 20);
}

export function endRun(won = false) {
  const P = G.P;
  if (!P) return;
  SV.coins += G.run.coins;
  SV.runs++;
  SV.bestLv = Math.max(SV.bestLv, won ? G.run.level : Math.max(0, G.run.level - 1));
  save();
  AU.death();
  G.shake = 14;
  boom(P.x, P.y, '#fff', 36);
  endRunUI(won, G.run);
}

export function update(dt) {
  const P = G.P;
  if (!P) return;
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 30);

  let v = inputVector();
  if (SV.auto.on) v = autoBrain(dt);
  P.moving = !!v;
  if (v) {
    P.vx = v.x * P.speed * P.spdMul;
    P.vy = v.y * P.speed * P.spdMul;
    P.angle = Math.atan2(v.y, v.x);
    if (!P.moveFire) P.fireCd = Math.max(P.fireCd, 0.09);
  } else {
    P.vx *= Math.pow(0.001, dt);
    P.vy *= Math.pow(0.001, dt);
  }
  P.x = clamp(P.x + P.vx * dt, 24, G.W - 24);
  P.y = clamp(P.y + P.vy * dt, 24, G.H - 24);
  if (P.inv > 0) P.inv -= dt;

  if (G.run.pendingNext) {
    G.run.pendingNext = false;
    G.run.level++;
    G.run.wave = 1;
    G.run.waves = wavesFor(G.run.level);
    startWave();
    return;
  }
  if (!G.spawnQueue.length) {
    const alive = G.enemies.some(e => !e.dead);
    if (!alive && !(G.bossRef && !G.bossRef.dead)) {
      if (G.run.wave >= G.run.waves + 1) { levelClear(); return; }
      if (processWaveXp()) return;
      advanceWave();
    }
  } else {
    for (let i = G.spawnQueue.length - 1; i >= 0; i--) {
      G.spawnQueue[i].d -= dt;
      if (G.spawnQueue[i].d <= 0) {
        spawnOne(G.spawnQueue[i].t);
        G.spawnQueue.splice(i, 1);
      }
    }
  }

  P.fireCd -= dt;
  if ((P.moveFire || !P.moving) && P.fireCd <= 0) {
    const target = nearestEnemy();
    if (target) { shootAt(target); P.fireCd = 1 / (P.wd.rate * P.rateMul); }
  }

  for (const en of G.enemies) if (!en.dead) stepEnemy(en, dt);

  for (let i = G.bullets.length - 1; i >= 0; i--) {
    const b = G.bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.ret) {
      b.retT = (b.retT || 0) + dt;
      if (b.retT > b.maxLife * 0.45) {
        const dx = P.x - b.x, dy = P.y - b.y;
        const d = Math.hypot(dx, dy) || 1;
        const speed = Math.hypot(b.vx, b.vy);
        b.vx = b.vx * 0.9 + dx / d * speed * 0.4;
        b.vy = b.vy * 0.9 + dy / d * speed * 0.4;
        if (d < 16 || b.retT > 4) { G.bullets.splice(i, 1); continue; }
      }
    } else {
      b.life -= dt;
      if (b.life <= 0) { G.bullets.splice(i, 1); continue; }
    }
    if (b.x < -30 || b.x > G.W + 30 || b.y < -30 || b.y > G.H + 30) {
      if (!b.ret) { G.bullets.splice(i, 1); continue; }
    }
    let bounced = false;
    if (b.bounce > 0) {
      if (b.x < 10 || b.x > G.W - 10) { b.vx *= -1; b.bounce--; bounced = true; }
      if (b.y < 10 || b.y > G.H - 10) { b.vy *= -1; b.bounce--; bounced = true; }
    }
    for (const en of G.enemies) {
      if (en.dead) continue;
      if (Math.hypot(b.x - en.x, b.y - en.y) < en.r + 5) {
        if (b.hitSet && b.hitSet.has(en)) continue;
        damageEnemy(en, b.dmg, b.crit, b.x, b.y);
        if (b.aoe) explode(b.x, b.y, b.aoe, b.dmg * 0.6);
        if (!b.hitSet) b.hitSet = new Set();
        b.hitSet.add(en);
        if (b.pierce > 0 && !bounced) { b.pierce--; continue; }
        if (b.ret) continue;
        G.bullets.splice(i, 1);
        break;
      }
    }
  }

  for (let i = G.ebullets.length - 1; i >= 0; i--) {
    const b = G.ebullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0 || b.x < -20 || b.x > G.W + 20 || b.y < -20 || b.y > G.H + 20) {
      G.ebullets.splice(i, 1);
      continue;
    }
    if (Math.hypot(b.x - P.x, b.y - P.y) < 14) {
      G.ebullets.splice(i, 1);
      hurtPlayer(b.dmg);
    }
  }

  for (const en of G.enemies) {
    if (!en.dead && Math.hypot(en.x - P.x, en.y - P.y) < en.r + 13 && P.inv <= 0) hurtPlayer(en.dmg);
  }

  const pickRadius = 26 * P.pickMul;
  for (let i = G.drops.length - 1; i >= 0; i--) {
    const dr = G.drops[i];
    dr.life -= dt;
    const d = Math.hypot(dr.x - P.x, dr.y - P.y);
    if (d < pickRadius) { dr.x += (P.x - dr.x) * dt * 8; dr.y += (P.y - dr.y) * dt * 8; }
    if (d < 18) { collectDrop(dr); G.drops.splice(i, 1); continue; }
    if (dr.life <= 0) G.drops.splice(i, 1);
  }

  for (let i = G.parts.length - 1; i >= 0; i--) {
    const p = G.parts[i];
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= 0.96; p.vy *= 0.96;
    p.life -= dt;
    if (p.life <= 0) G.parts.splice(i, 1);
  }
  for (let i = G.floats.length - 1; i >= 0; i--) {
    const f = G.floats[i];
    f.y -= 34 * dt;
    f.life -= dt;
    if (f.life <= 0) G.floats.splice(i, 1);
  }
  updHud();
}
