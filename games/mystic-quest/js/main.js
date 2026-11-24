/* Mystic Quest — game loop and orchestration */

import { REALMS, WORLD, STEP } from './config.js';
import { detect, initLang, setLang, getLang, t } from './i18n.js';
import { loadGame, saveGame, clearGame, loadPrefs, savePrefs } from './storage.js';
import { initialState, addStar, rescueSpirit, addMemory } from './core/progression.js';
import { layout, nearestWithin, clampToWorld } from './core/world.js';
import { chapterLines, starLine, spiritLine, travelLine, finale } from './core/story.js';
import { Renderer } from './render.js';
import { Input } from './input.js';
import { Sfx } from './audio.js';
import { ui } from './ui.js';
import * as glass from './glass.js';

const $ = id => document.getElementById(id);
let state = loadGame();
let prefs = loadPrefs();
const sfx = new Sfx(prefs);
const renderer = new Renderer($('gameCanvas'), prefs.quality);
let current = layout(state.realm);
let player = { x:WORLD.w / 2, y:WORLD.h / 2, targetX:null, targetY:null, moving:false, stepAcc:0 };
let charge = 0, spiritReady = false, playing = false, paused = false, hiddenPause = false;
let acc = 0, last = performance.now(), time = 0, deleteArmed = false;

const input = new Input({
  tap: (cx, cy) => {
    if (!playing || paused || hiddenPause || ui.anyModalOpen() || ui.dialogueActive()) return;
    const p = renderer.screenToWorld(cx, cy);
    player.targetX = Math.max(14, Math.min(WORLD.w - 14, p.x));
    player.targetY = Math.max(38, Math.min(WORLD.h - 14, p.y));
  },
  move: (dx, dy) => {
    if (!playing || paused || hiddenPause || ui.anyModalOpen() || ui.dialogueActive()) return;
    player.targetX = Math.max(14, Math.min(WORLD.w - 14, player.x + dx * 44));
    player.targetY = Math.max(38, Math.min(WORLD.h - 14, player.y + dy * 44));
  },
  pause: () => { if (playing) pause(!paused); }
});

function resetPlayer() {
  player = { x:WORLD.w / 2, y:WORLD.h / 2, targetX:null, targetY:null, moving:false, stepAcc:0 };
  charge = 0;
}
function refreshReady() {
  spiritReady = state.stars[state.realm].every(Boolean) && !state.spirits[state.realm];
}
function startGame(fresh) {
  if (fresh) { state = initialState(); saveGame(state); }
  state.realm = Math.max(0, Math.min(REALMS.length - 1, state.realm));
  current = layout(state.realm);
  resetPlayer(); refreshReady();
  playing = true; paused = false; acc = 0;
  $('menu').classList.add('hidden');
  $('hud').classList.remove('hidden');
  ui.updateHUD(state, state.realm);
  ui.startDialogue(chapterLines(state.realm, getLang()), () => {});
}
function travel(index) {
  if (index >= state.unlocked || index >= REALMS.length) return;
  state.realm = index; saveGame(state);
  current = layout(index);
  resetPlayer(); refreshReady();
  ui.closeModal('realmsModal');
  ui.updateHUD(state, index);
  ui.setCharge(0, false);
  ui.startDialogue([travelLine(index, getLang())], () => {});
}

function rescue() {
  const res = rescueSpirit(state, state.realm);
  state = addMemory(res.state, spiritLine(state.realm, getLang()));
  saveGame(state);
  sfx.spirit(); sfx.vibrate(60);
  renderer.emit(current.spirit.x, current.spirit.y, REALMS[state.realm].accent, 24);
  ui.toast(t('freed'));
  ui.setCharge(0, false);
  spiritReady = false;
  ui.startDialogue([spiritLine(state.realm, getLang())], () => {
    if (res.finished) {
      ui.showModal('endModal');
      $('endTitle').textContent = '✨ ' + t('complete');
      $('endBody').textContent = t('finale');
      playing = false;
      $('hud').classList.add('hidden');
    } else if (state.realm < REALMS.length - 1) {
      ui.toast(t('unlock'));
      travel(state.realm + 1);
    }
  });
}

function update(dt) {
  time += dt;
  ui.tickDialogue(dt);
  if (!playing || paused || hiddenPause || ui.anyModalOpen() || ui.dialogueActive()) return;

  const v = input.vector();
  if (v.x || v.y) {
    player.targetX = Math.max(14, Math.min(WORLD.w - 14, player.x + v.x * 46));
    player.targetY = Math.max(38, Math.min(WORLD.h - 14, player.y + v.y * 46));
  }

  if (player.targetX !== null) {
    const dx = player.targetX - player.x, dy = player.targetY - player.y;
    const d = Math.hypot(dx, dy);
    if (d < 2.5) {
      player.x = player.targetX; player.y = player.targetY;
      player.targetX = player.targetY = null; player.moving = false;
    } else {
      const step = Math.min(d, 132 * dt);
      player.x += dx / d * step; player.y += dy / d * step;
      player.moving = true;
      player.stepAcc += step;
      if (player.stepAcc > 34) { player.stepAcc = 0; sfx.step(); }
    }
    const p = clampToWorld(player);
    player.x = p.x; player.y = p.y;
  } else player.moving = false;

  const star = nearestWithin(current.stars, player, 24, (s, i) => !state.stars[state.realm][i]);
  if (star) {
    const res = addStar(state, state.realm, star.index);
    state = res.state; saveGame(state);
    renderer.emit(star.item.x, star.item.y, '#ffe98a', 12);
    sfx.star(); sfx.vibrate(25);
    ui.toast(t('collected') + ' ' + (star.index + 1) + '/3');
    ui.updateHUD(state, state.realm);
    if (res.complete && !state.spirits[state.realm]) {
      spiritReady = true;
      ui.toast(t('calm'));
    }
  }

  if (spiritReady && Math.hypot(player.x - current.spirit.x, player.y - current.spirit.y) < 74 && input.lantern) {
    charge = Math.min(1, charge + dt * 0.42);
    if (Math.random() < 0.4) renderer.emit(current.spirit.x, current.spirit.y - 10, REALMS[state.realm].accent, 1);
    if (Math.floor(charge * 10) !== Math.floor((charge - dt * 0.42) * 10)) sfx.charge(charge);
    if (charge >= 1) rescue();
  } else if (!input.lantern) charge = Math.max(0, charge - dt * 0.5);

  ui.setCharge(charge, spiritReady && Math.hypot(player.x - current.spirit.x, player.y - current.spirit.y) < 90);

  if (state.spirits[state.realm] && state.realm < REALMS.length - 1 &&
      Math.hypot(player.x - current.portal.x, player.y - current.portal.y) < 26) {
    travel(state.realm + 1);
  }
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  acc = Math.min(acc + dt, 0.2);
  let steps = 0;
  while (acc >= STEP && steps < 5) { update(STEP); acc -= STEP; steps++; }

  renderer.draw({
    realm:state.realm, state, layout:current, player,
    lantern:input.lantern, spiritReady, time, dt
  });
  if (playing) ui.updateHUD(state, state.realm);
}

function pause(on) {
  if (!playing) return;
  paused = !!on;
  if (paused) ui.showModal('pauseModal'); else ui.closeModal('pauseModal');
}
function quit() {
  playing = false; paused = false;
  ui.closeModal('pauseModal'); ui.closeModal('endModal');
  $('hud').classList.add('hidden');
  $('menu').classList.remove('hidden');
}
function deleteSave() {
  if (!deleteArmed) {
    deleteArmed = true;
    $('btnDeleteSave').textContent = t('confirmReset');
    setTimeout(() => { deleteArmed = false; $('btnDeleteSave').textContent = t('reset'); }, 3500);
    return;
  }
  clearGame(); state = initialState(); saveGame(state);
  deleteArmed = false; $('btnDeleteSave').textContent = t('reset');
  quit(); ui.toast(t('reset'));
}

initLang(detect());
document.body.dataset.theme = prefs.theme || 'dark';
$('soundCheck').checked = !!prefs.sound;
$('vibrateCheck').checked = !!prefs.vibration;
$('motionCheck').checked = !!prefs.reducedMotion;
document.querySelectorAll('[data-quality]').forEach(b => b.classList.toggle('on', b.dataset.quality === prefs.quality));

ui.initUI({
  state: () => state,
  continue: () => startGame(false),
  newGame: () => startGame(true),
  travel,
  pause, restart: () => startGame(true), quit,
  deleteSave,
  prefs: patch => {
    prefs = { ...prefs, ...patch };
    savePrefs(prefs);
  },
  lang: () => setLang(getLang() === 'en' ? 'it' : 'en'),
  theme: () => {
    prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = prefs.theme; savePrefs(prefs);
  },
  renderAll: () => { ui.updateHUD(state, state.realm); }
});
glass.enable(document.querySelector('.menu-card'), 24, 18);
document.addEventListener('visibilitychange', () => { hiddenPause = document.hidden; });
addEventListener('pagehide', () => saveGame(state));

ui.updateHUD(state, state.realm);
requestAnimationFrame(frame);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
