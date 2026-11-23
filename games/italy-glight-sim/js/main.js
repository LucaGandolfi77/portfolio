/* Italy Glight Sim — UI, input and main loop */

import { makeLoop } from '../../_kit/core.js';
import { load, store } from '../../_kit/storage.js';
import { createI18n } from '../../_kit/i18n.js';
import * as AUDIO from '../../_kit/audio.js';
import { registerSW, setupCanvas } from '../../_kit/pwa.js';
import { PLANES, MISSIONS, STR, loc } from './config.js';
import { AIRPORTS_W } from './map.js';
import { FlightGame } from './game.js';
import { drawMinimap, drawScene } from './render.js';

const SAVE_KEY = 'italyGlightSim.save.v1';
const DEFAULTS = {
  plane: 'cessna', sound: true, lang: 'en', freeAirport: 'FCO',
  bests: {}, stats: { flights: 0, landings: 0, crashes: 0 }
};
const save = load(SAVE_KEY, DEFAULTS);
const i18n = createI18n(STR);
save.lang = i18n.getLang();
const persist = () => store(SAVE_KEY, save);
const game = new FlightGame(save, persist);

const $ = id => document.getElementById(id);
const canvas = $('game');
const screen = setupCanvas(canvas);
const minimap = $('minimap');
const mctx = minimap.getContext('2d');
const hud = $('hud');
const toast = $('toast');
const thrFill = $('thrFill'), thrVal = $('thrVal');

game.setViewport(screen.w, screen.h);
window.addEventListener('resize', () => game.setViewport(screen.w, screen.h));
registerSW('./sw.js');

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const t = key => i18n.t(key);
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* ---------- screens ---------- */

let uiScreen = 'menu';
function showScreen(name) {
  uiScreen = name;
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.toggle('hidden', el.dataset.screen !== name);
  });
}

function buildHangar() {
  const lang = i18n.getLang();
  $('hangarList').innerHTML = PLANES.map(p => {
    const speed = Math.min(100, Math.round(p.maxSpeed / 420 * 100));
    const agility = Math.round(p.turn / 2.4 * 100);
    const range = Math.min(100, Math.round((p.fuel / p.burn) / 45 * 100));
    const selected = p.id === game.plane.id;
    const icon = p.starship ? '🚀' : p.kind === 'heli' ? '🚁' : p.kind === 'jet' ? '🛩️' : '✈️';
    const bar = (label, val) => `<div class="stat"><span>${label}</span><div class="bar"><i style="width:${val}%"></i></div></div>`;
    return `<button class="plane-card ${selected ? 'sel' : ''}" data-plane="${p.id}" type="button">
      <span class="plane-badge" style="--c:${p.color}">${icon}</span>
      <span class="plane-info"><b>${loc(p.name, lang)}${p.starship ? ' ✦' : ''}</b><small>${loc(p.desc, lang)}</small>
      ${bar(t('speed'), speed)}${bar(t('agility'), agility)}${bar(t('range'), range)}</span>
      <span class="plane-tag">${selected ? t('selected') : p.starship ? t('starship') : t('aircraft')}</span>
    </button>`;
  }).join('');
}

function buildMissions() {
  const lang = i18n.getLang();
  $('missionList').innerHTML = MISSIONS.map((m, i) => {
    const best = save.bests[`${m.id}:${game.plane.id}`];
    const stops = m.stops.map(c => (AIRPORTS_W.find(a => a.code === c) || {}).code).join(' → ');
    return `<button class="mission-card" data-mission="${m.id}" type="button">
      <span class="mission-top"><b>${loc(m.name, lang)}</b><small>${'◆'.repeat(m.diff)}${'◇'.repeat(4 - m.diff)}</small></span>
      <small class="mission-desc">${loc(m.desc, lang)}</small>
      <span class="mission-stops">${stops}</span>
      <span class="mission-best">${t('best')}: ${best ? fmt(best) : '—'}</span>
      <span class="mission-go">${t('play')} →</span>
    </button>`;
  }).join('');
}

function buildAirports() {
  const lang = i18n.getLang();
  $('freeAirport').innerHTML = AIRPORTS_W
    .map(a => `<option value="${a.code}">${loc(a.name, lang)} (${a.code})</option>`).join('');
  $('freeAirport').value = save.freeAirport || 'FCO';
}

function refreshUI() {
  i18n.apply(document);
  buildHangar();
  buildMissions();
  buildAirports();
  $('menuPlane').textContent = loc(game.plane.name, i18n.getLang());
  $('resultTitle').textContent = t('missionDone');
  $('btnSound').textContent = `${t('sound')}: ${save.sound ? t('on') : t('off')}`;
}
refreshUI();
i18n.onChange(() => { save.lang = i18n.getLang(); persist(); refreshUI(); });
document.addEventListener('visibilitychange', () => { i18n.sync(); game.pause(); });

showScreen('menu');

/* ---------- input ---------- */

const keys = new Set();
const joy = { x: 0, y: 0 };
let joyActive = false, joyId = null, joyStart = { x: 0, y: 0 };
let throttle = 0.7, thrHold = 0, barDrag = false, boostHeld = false;

function setThrottle(v) { throttle = clamp(v, 0, 1); }

canvas.addEventListener('pointerdown', e => {
  AUDIO.resume();
  if (game.mode !== 'play') return;
  if (e.clientX < screen.w * 0.55 && joyId === null) {
    joyId = e.pointerId; joyActive = true;
    joyStart = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  } else if (joyId === null) {
    barDrag = true;
    setThrottle(1 - (e.clientY - 50) / Math.max(120, screen.h - 160));
    canvas.setPointerCapture(e.pointerId);
  }
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerId === joyId) {
    joy.x = clamp((e.clientX - joyStart.x) / 60, -1, 1);
    joy.y = clamp((e.clientY - joyStart.y) / 60, -1, 1);
  } else if (barDrag) {
    setThrottle(1 - (e.clientY - 50) / Math.max(120, screen.h - 160));
  }
});
function endPointer(e) {
  if (e.pointerId === joyId) { joyId = null; joyActive = false; joy.x = 0; joy.y = 0; }
  barDrag = false;
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);

function bindHold(id, dir) {
  const el = $(id);
  el.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    AUDIO.resume(); thrHold = dir;
    setThrottle(throttle + dir * 0.04);
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointerup', () => { thrHold = 0; });
  el.addEventListener('pointercancel', () => { thrHold = 0; });
}
bindHold('thrUp', 1);
bindHold('thrDown', -1);

const boostBtn = $('btnBoost');
boostBtn.addEventListener('pointerdown', e => {
  e.preventDefault(); e.stopPropagation();
  AUDIO.resume(); boostHeld = true;
  boostBtn.setPointerCapture(e.pointerId);
});
boostBtn.addEventListener('pointerup', () => { boostHeld = false; });
boostBtn.addEventListener('pointercancel', () => { boostHeld = false; });

const thrBar = $('thrBar');
function barSet(e) {
  const r = thrBar.getBoundingClientRect();
  setThrottle(1 - (e.clientX - r.left) / r.width);
}
thrBar.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); barDrag = true; barSet(e); thrBar.setPointerCapture(e.pointerId); });
thrBar.addEventListener('pointermove', e => { if (barDrag) barSet(e); });
thrBar.addEventListener('pointerup', () => { barDrag = false; });

const KEY_LEFT = ['ArrowLeft', 'a', 'A'];
const KEY_RIGHT = ['ArrowRight', 'd', 'D'];
const KEY_UP = ['ArrowUp', 'w', 'W'];
const KEY_DOWN = ['ArrowDown', 's', 'S'];
const KEY_THR_UP = ['e', 'E', 'Shift'];
const KEY_THR_DOWN = ['q', 'Q', 'Control'];
window.addEventListener('keydown', e => {
  if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
  if (!e.repeat && (e.key === 'v' || e.key === 'V')) game.toggleView();
  if (!e.repeat && (e.key === 'p' || e.key === 'P' || e.key === 'Escape')) togglePause();
  keys.add(e.key);
});
window.addEventListener('keyup', e => keys.delete(e.key));
window.addEventListener('blur', () => keys.clear());

const anyKey = arr => arr.some(k => keys.has(k));

/* ---------- actions ---------- */

function beginFlying() {
  AUDIO.init(save.sound);
  AUDIO.resume();
  throttle = 0.7;
  showScreen(null);
  game.say(t('howto1'), '', 5000);
  lastMode = game.mode;
}

function togglePause() {
  if (game.mode === 'play') game.pause();
  else if (game.mode === 'pause') { game.resume(); showScreen(null); lastMode = game.mode; }
}

$('btnFree').addEventListener('click', () => {
  const code = $('freeAirport').value || 'FCO';
  save.freeAirport = code; persist();
  game.startFree(code);
  beginFlying();
});
$('btnMissions').addEventListener('click', () => { AUDIO.sfx.tap(); showScreen('missions'); });
$('btnHangar').addEventListener('click', () => { AUDIO.sfx.tap(); showScreen('hangar'); });
$('btnHowto').addEventListener('click', () => { AUDIO.sfx.tap(); showScreen('howto'); });
document.querySelectorAll('[data-back]').forEach(el => el.addEventListener('click', () => { AUDIO.sfx.tap(); showScreen('menu'); }));

$('hangarList').addEventListener('click', e => {
  const card = e.target.closest('[data-plane]');
  if (!card) return;
  game.setPlane(card.dataset.plane);
  AUDIO.sfx.tap();
  buildHangar(); buildMissions();
  $('menuPlane').textContent = loc(game.plane.name, i18n.getLang());
});

$('missionList').addEventListener('click', e => {
  const card = e.target.closest('[data-mission]');
  if (!card) return;
  game.startMission(card.dataset.mission);
  beginFlying();
});

$('btnView').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); game.toggleView(); AUDIO.sfx.tap(); });
$('btnPause').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); togglePause(); });
$('btnResume').addEventListener('click', () => { game.resume(); showScreen(null); lastMode = game.mode; });
$('btnRestart').addEventListener('click', () => { game.restart(); beginFlying(); });
$('btnChangePlane').addEventListener('click', () => { game.quit(); showScreen('hangar'); refreshUI(); lastMode = game.mode; });
$('btnQuit').addEventListener('click', () => { game.quit(); showScreen('menu'); refreshUI(); lastMode = game.mode; });
$('btnSound').addEventListener('click', () => {
  save.sound = !save.sound; persist();
  AUDIO.init(save.sound); AUDIO.setSound(save.sound);
  refreshUI();
});

$('btnRetry').addEventListener('click', () => { game.startMission(game.mission.id); beginFlying(); });
$('btnNext').addEventListener('click', () => {
  const i = MISSIONS.findIndex(m => m.id === game.mission.id);
  const next = MISSIONS[i + 1];
  if (next) { game.startMission(next.id); beginFlying(); }
  else { game.quit(); showScreen('missions'); refreshUI(); lastMode = game.mode; }
});
$('btnResultMenu').addEventListener('click', () => { game.quit(); showScreen('menu'); refreshUI(); lastMode = game.mode; });

/* ---------- loop ---------- */

let lastMode = game.mode;
let frameNo = 0;

function update(dt) {
  if (thrHold) setThrottle(throttle + thrHold * dt * 0.55);
  if (game.mode !== 'play' && game.mode !== 'pause') return;

  const turn = (anyKey(KEY_RIGHT) ? 1 : 0) - (anyKey(KEY_LEFT) ? 1 : 0) + joy.x;
  const climb = (anyKey(KEY_UP) ? 1 : 0) - (anyKey(KEY_DOWN) ? 1 : 0) - joy.y;
  if (anyKey(KEY_THR_UP)) setThrottle(throttle + dt * 0.4);
  if (anyKey(KEY_THR_DOWN)) setThrottle(throttle - dt * 0.4);

  game.update(dt, {
    turn: clamp(turn, -1, 1),
    pitch: clamp(climb, -1, 1),
    throttle,
    brake: keys.has(' '),
    boost: boostHeld || anyKey(['b', 'B'])
  });

  if (game.mode !== lastMode) {
    lastMode = game.mode;
    if (game.mode === 'play') showScreen(null);
    else if (game.mode === 'pause') showScreen('pause');
    else if (game.mode === 'result') {
      showScreen('result');
      const r = game.result;
      $('resultTime').textContent = fmt(r.time);
      $('resultUsed').textContent = `${Math.round(r.used)}%`;
      $('resultBest').textContent = `${fmt(r.best)}${r.isNew ? ' ★' : ''}`;
      $('btnNext').classList.toggle('hidden', MISSIONS.findIndex(m => m.id === game.mission.id) >= MISSIONS.length - 1);
    }
  }
}

function draw() {
  const time = Date.now() / 1000;
  drawScene(screen.ctx, { w: screen.w, h: screen.h, game, time, joy, joyActive });
  if (++frameNo % 3 === 0) drawMinimap(mctx, minimap.width, minimap.height, game);

  const playing = game.mode === 'play' || game.mode === 'pause';
  hud.classList.toggle('hidden', !playing);
  const h = game.hud();
  if (h) {
    $('hudSpeed').textContent = h.speed;
    $('hudAlt').textContent = h.alt;
    $('hudFuel').textContent = h.fuel + '%';
    $('hudHdg').textContent = String(h.hdg).padStart(3, '0') + '°';
    $('hudNext').textContent = h.next;
    $('hudDist').textContent = h.dist.toFixed(1) + ' ' + t('km');
    $('hudStep').textContent = h.progress;
    $('thrVal').textContent = Math.round(throttle * 100) + '%';
    thrFill.style.width = Math.round(throttle * 100) + '%';
    $('hudFuel').classList.toggle('low', h.fuel < 20);
    const badge = $('boostBadge');
    badge.textContent = t('boost');
    badge.classList.toggle('hidden', !h.boosting);
  }
  const showToast = playing && Date.now() < game.toast.until;
  toast.textContent = showToast ? game.toast.text : '';
  toast.className = 'toast ' + (showToast ? game.toast.kind : '') + (showToast ? '' : ' hidden');
}

makeLoop(update, draw).start();
