/* RPG Adventure — game loop and orchestration */

import { ZONES, SKILLS, QUESTS, COMBO_WINDOW, WORLD, PALETTE } from './config.js';
import { detect, initLang, setLang, getLang, t } from './i18n.js';
import { loadGame, saveGame, clearGame, loadPrefs, savePrefs } from './storage.js';
import { initialState, stats, addLoot, useItem, equipItem, dropItem, buyItem,
  questProgress, claimQuest, tickCooldowns } from './core/progression.js';
import { comboFor, meleeDamage, canCast, cast, dashTarget, damageTaken } from './core/combat.js';
import { spawnEnemies, distance, clamp, moveTowards } from './core/entities.js';
import { Renderer } from './render.js';
import { Input } from './input.js';
import { Sfx } from './audio.js';
import { ui } from './ui.js';
import * as glass from './glass.js';

const $ = id => document.getElementById(id);
let state = loadGame();
let prefs = loadPrefs();
const sfx = new Sfx(prefs);
const renderer = new Renderer($('gameCanvas'));

let zone = ZONES.find(z => z.id === state.zone) || ZONES[0];
state.zone = zone.id;
let npcs = zone.npcs.map(n => ({ ...n }));
let enemies = spawnEnemies(zone, 8, 7);
let projectiles = [], particles = [], floaters = [];
let player = { x: state.x, y: state.y, facing: state.facing || 1 };
let invuln = 0, shield = 0, attacking = 0, combo = 0, lastAttack = 0, attackCd = 0;
let portalCd = 0, waveCd = 0, wave = 0, paused = false, dead = false, time = 0;
let fpsAcc = 0, fpsFrames = 0, saveAcc = 0, resetArmed = false, hiddenPause = false;

function toast(msg, warn) { ui.toast(msg, warn); }

/* ---------- effects ---------- */
function burst(x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, sp = 30 + Math.random() * 90;
    particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: 0.45, maxLife: 0.45, size: 2 + Math.random() * 3, color });
  }
}
function floater(x, y, text, color) {
  floaters.push({ x, y, text, color, life: 0.8, maxLife: 0.8 });
}

/* ---------- combat resolution ---------- */
function hurtPlayer(amount) {
  const dmg = damageTaken(state, amount, invuln > 0);
  if (!dmg) return;
  state.hp = Math.max(0, state.hp - dmg);
  invuln = 0.7;
  sfx.hurt(); sfx.vibrate(60);
  floater(player.x, player.y - 22, '-' + dmg, PALETTE.hp);
  burst(player.x, player.y, PALETTE.hp, 6);
  if (state.hp <= 0) {
    dead = true;
    ui.showModal('deathModal');
  }
}

function damageEnemy(enemy, amount) {
  if (!enemy.alive) return;
  enemy.hp -= amount;
  enemy.hitFlash = 0.12;
  floater(enemy.x, enemy.y - 20, '-' + amount, PALETTE.gold);
  burst(enemy.x, enemy.y, enemy.def.color, 5);
  if (enemy.hp > 0) return;
  enemy.alive = false;
  const loot = addLoot(state, enemy.def.gold, enemy.def.xp);
  state = loot.state;
  const q = questProgress(state, 'kill', 1, zone.id);
  state = q.state;
  const g = questProgress(state, 'gold', enemy.def.gold);
  state = g.state;
  [...q.ready, ...g.ready].forEach(id => {
    state = claimQuest(state, id) || state;
    toast(t('questDone') + ': ' + (QUEST_NAME(id)));
    sfx.quest();
  });
  if (loot.levels) { toast(t('levelUp') + ' ' + state.level); sfx.level(); }
  sfx.pickup(); sfx.vibrate(25);
}

function QUEST_NAME(id) {
  const q = QUESTS.find(x => x.id === id);
  return q ? q[getLang()] : id;
}

function attack() {
  if (paused || dead || ui.anyModalOpen() || attackCd > 0) return;
  combo = comboFor(combo, Date.now(), lastAttack);
  lastAttack = Date.now();
  const dmg = meleeDamage(state, combo);
  attackCd = combo === 3 ? 0.5 : 0.3;
  attacking = combo === 3 ? 0.45 : 0.3;
  sfx.attack(combo); sfx.vibrate(combo === 3 ? 45 : 15);
  ui.setCombo(combo);
  enemies.forEach(e => {
    if (!e.alive) return;
    const d = distance(player, e);
    if (d < 64 && (e.x - player.x) * player.facing > -18) damageEnemy(e, dmg);
  });
  burst(player.x + player.facing * 24, player.y, PALETTE.cyan, 4);
}

function castSkill(i) {
  if (paused || dead || ui.anyModalOpen()) return;
  const skill = SKILLS[i];
  const error = canCast(state, skill);
  if (error) { toast(t(error), true); return; }
  state = cast(state, skill);
  sfx.skill(skill.id); sfx.vibrate(30);
  if (skill.id === 'fireball') {
    projectiles.push({ x: player.x + player.facing * 18, y: player.y, vx: player.facing * 420,
      life: 1.2, r: 8, damage: skill.damage, color: '#ff8a3d' });
  } else if (skill.id === 'shield') {
    shield = skill.duration;
    burst(player.x, player.y, PALETTE.mana, 12);
  } else if (skill.id === 'dash') {
    player = dashTarget(player, player.facing, 110);
    invuln = Math.max(invuln, skill.duration);
    burst(player.x, player.y, PALETTE.cyan, 10);
  } else if (skill.id === 'heal') {
    burst(player.x, player.y, PALETTE.green, 12);
    floater(player.x, player.y - 24, '+' + skill.heal, PALETTE.green);
  }
}

function dodge() {
  if (paused || dead || ui.anyModalOpen() || invuln > 0) return;
  player = dashTarget(player, player.facing, 76);
  invuln = 0.4;
  sfx.skill('dash'); sfx.vibrate(20);
  burst(player.x, player.y, PALETTE.cyan, 6);
}

function interact() {
  if (paused || dead || ui.anyModalOpen()) return;
  const near = npcs.find(n => distance(player, n) < 70);
  if (near) {
    ui.showDialog(near.name, near[getLang()]);
    if (near.shop) ui.renderShop(zone, state);
    sfx.click();
    return;
  }
  toast(t('talk') + ' —');
}

function changeZone(to) {
  const target = ZONES.find(z => z.id === to);
  if (!target) return;
  zone = target;
  state.zone = zone.id;
  npcs = zone.npcs.map(n => ({ ...n }));
  enemies = spawnEnemies(zone, zone.id === 'crypt' ? 7 : 8, ++wave + 7);
  projectiles = [];
  /* enter near the portal that leads back */
  const back = zone.portals.find(p => p.to !== to);
  player = back ? clamp({ x: back.x + 40, y: back.y }) : { x: 410, y: 300 };
  state.x = player.x; state.y = player.y;
  portalCd = 1.6;
  toast(zone[getLang()]);
  saveGame({ ...state, x: player.x, y: player.y, facing: player.facing });
}

/* ---------- inventory handlers ---------- */
function refreshInventory() { ui.renderInventory(state); }
const doUse = i => { const s = useItem(state, i); if (s) { state = s; sfx.click(); refreshInventory(); } };
const doEquip = i => { const s = equipItem(state, i); if (s) { state = s; sfx.click(); refreshInventory(); } };
const doDrop = i => { const s = dropItem(state, i); if (s) { state = s; refreshInventory(); } };
const doBuy = id => {
  const s = buyItem(state, id);
  if (!s) { toast(t('noGold'), true); return; }
  state = s; sfx.click(); ui.renderShop(zone, state);
};
const doClaim = id => { const s = claimQuest(state, id); if (s) { state = s; ui.renderQuests(state); sfx.quest(); } };

function pause(on) {
  paused = !!on;
  if (paused) ui.showModal('pauseModal'); else ui.closeModal('pauseModal');
}
function restart() {
  clearGame();
  state = initialState();
  zone = ZONES[0]; state.zone = zone.id;
  npcs = zone.npcs.map(n => ({ ...n }));
  enemies = spawnEnemies(zone, 8, 7);
  projectiles = []; particles = []; floaters = [];
  player = { x: 410, y: 300, facing: 1 };
  combo = 0; invuln = 0; shield = 0; dead = false; paused = false;
  ui.closeModal('deathModal'); ui.closeModal('pauseModal');
  toast(t('reset'));
}

function resetGame() {
  if (!resetArmed) {
    resetArmed = true;
    $('btnResetSave').textContent = t('ok') + '?';
    setTimeout(() => { resetArmed = false; $('btnResetSave').textContent = t('reset'); }, 3000);
    return;
  }
  resetArmed = false;
  $('btnResetSave').textContent = t('reset');
  restart();
}

const input = new Input({
  attack, dodge, interact,
  skill0: () => castSkill(0), skill1: () => castSkill(1),
  skill2: () => castSkill(2), skill3: () => castSkill(3),
  menu: () => pause(!paused), pause: () => pause(!paused),
  inventory: () => { ui.renderInventory(state); ui.showModal('inventoryModal'); }
});

function update(dt) {
  time += dt;
  invuln = Math.max(0, invuln - dt);
  attacking = Math.max(0, attacking - dt);
  attackCd = Math.max(0, attackCd - dt);
  portalCd = Math.max(0, portalCd - dt);
  shield = Math.max(0, shield - dt);
  state = tickCooldowns(state, dt);

  const v = input.vector();
  if (v.x || v.y) {
    const speed = 168;
    const p = clamp({ x: player.x + v.x * speed * dt, y: player.y + v.y * speed * dt });
    player.x = p.x; player.y = p.y;
    if (Math.abs(v.x) > 0.1) player.facing = Math.sign(v.x);
    state.x = player.x; state.y = player.y; state.facing = player.facing;
  }

  enemies.forEach(e => {
    if (!e.alive) return;
    e.hitFlash = Math.max(0, e.hitFlash - dt);
    e.attackCd = Math.max(0, e.attackCd - dt);
    const d = distance(player, e);
    if (d > 34) {
      moveTowards(e, player, dt, e.def.speed);
      e.wander += dt;
    } else if (e.attackCd <= 0) {
      e.attackCd = 1.1;
      hurtPlayer(e.def.damage);
    }
  });

  projectiles.forEach(p => {
    p.x += p.vx * dt; p.life -= dt;
    enemies.forEach(e => {
      if (e.alive && Math.hypot(p.x - e.x, p.y - e.y) < 24 + p.r) damageEnemy(e, p.damage);
    });
  });
  projectiles = projectiles.filter(p => p.life > 0 && p.x > -50 && p.x < WORLD.width + 50);

  particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
  particles = particles.filter(p => p.life > 0);
  floaters.forEach(f => { f.y -= 24 * dt; f.life -= dt; });
  floaters = floaters.filter(f => f.life > 0);

  zone.portals.forEach(p => {
    if (portalCd <= 0 && distance(player, p) < 28) changeZone(p.to);
  });

  if (!enemies.some(e => e.alive)) {
    waveCd += dt;
    if (waveCd > 1.4) {
      waveCd = 0; wave++;
      enemies = spawnEnemies(zone, zone.id === 'crypt' ? 7 : 8, 11 + wave);
      toast(t('enemyRemaining') + ' +' + enemies.length);
    }
  } else waveCd = 0;

  if (combo > 0 && Date.now() - lastAttack > COMBO_WINDOW) { combo = 0; ui.setCombo(0); }

  saveAcc += dt;
  if (saveAcc > 5) { saveAcc = 0; saveGame({ ...state, x: player.x, y: player.y, facing: player.facing }); }
}

function render() {
  renderer.draw({
    zone, npcs, enemies, projectiles, particles, floaters,
    player, time, invuln, shield, attacking
  });
}

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const blocked = paused || dead || hiddenPause || ui.anyModalOpen();
  if (!blocked) update(dt);
  render();
  ui.renderHUD(state, zone);
  ui.updateSkills(state);
  ui.setEnemies(enemies.filter(e => e.alive).length);

  fpsAcc += dt; fpsFrames++;
  if (fpsAcc >= 0.5) {
    if (prefs.showFps) ui.setFps(Math.round(fpsFrames / fpsAcc));
    else ui.setFps(0);
    fpsAcc = 0; fpsFrames = 0;
  }
}

initLang(detect());
document.body.dataset.theme = prefs.theme || 'dark';
ui.initUI({
  state: () => state,
  lang: () => setLang(getLang() === 'en' ? 'it' : 'en'),
  theme: () => {
    prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = prefs.theme; savePrefs(prefs);
  },
  prefs: patch => { prefs = { ...prefs, ...patch }; savePrefs(prefs); },
  pause, reset: resetGame, retry: restart,
  attack, dodge, interact,
  skill0: () => castSkill(0), skill1: () => castSkill(1),
  skill2: () => castSkill(2), skill3: () => castSkill(3),
  use: doUse, equip: doEquip, drop: doDrop, buy: doBuy, claim: doClaim,
  renderAll: () => ui.renderHUD(state, zone)
});

/* reflect stored preferences in the settings panel */
$('soundCheck').checked = !!prefs.sound;
$('vibrateCheck').checked = !!prefs.vibration;
$('motionCheck').checked = !!prefs.reducedMotion;
$('fpsCheck').checked = !!prefs.showFps;
document.body.classList.toggle('reduced', !!prefs.reducedMotion);

glass.enable(document.querySelector('.game-frame'), 22, 16);
glass.enable(document.querySelector('.topbar'), 18, 12);

document.addEventListener('visibilitychange', () => {
  hiddenPause = document.hidden;
  if (!document.hidden) saveGame({ ...state, x: player.x, y: player.y, facing: player.facing });
});
addEventListener('pagehide', () => saveGame({ ...state, x: player.x, y: player.y, facing: player.facing }));

ui.renderHUD(state, zone);
requestAnimationFrame(frame);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
