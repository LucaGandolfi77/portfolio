/* Italy 3D Flight Sim — UI, input, data loading and main loop */

import { makeLoop } from '../../_kit/core.js';
import { load, store } from '../../_kit/storage.js';
import { createI18n } from '../../_kit/i18n.js';
import * as AUDIO from '../../_kit/audio.js';
import { registerSW } from '../../_kit/pwa.js';
import { PLANES, MISSIONS, STR, loc, WORLD } from './config.js';
import { AIRPORTS } from './config.js';
import { initGeo, vectorData, geoToWorld, worldPolygon, terrainHeight } from './geo.js';
import { FlightGame } from './game.js';
import { createRenderer } from './render.js';
import { loadImagery } from './imagery.js';
import { initBuildingsData } from './buildings.js';

const SAVE_KEY = 'italy3dFlightSim.save.v1';
const DEFAULTS = {
  plane: 'cessna', sound: true, lang: 'en', freeAirport: 'FCO', quality: 'high', imagery: true,
  bests: {}, stats: { flights: 0, landings: 0, crashes: 0 }
};
const save = load(SAVE_KEY, DEFAULTS);
const i18n = createI18n(STR);
save.lang = i18n.getLang();
const persist = () => store(SAVE_KEY, save);
const game = new FlightGame(save, persist);
const $ = id => document.getElementById(id);
const t = key => i18n.t(key);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const canvas = $('game');
const minimap = $('minimap');
const mctx = minimap.getContext('2d');
const hud = $('hud');
const toast = $('toast');
let view3d = null;

registerSW('./sw.js');

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(el => el.classList.toggle('hidden', el.dataset.screen !== name));
}

function buildHangar() {
  const lang = i18n.getLang();
  $('hangarList').innerHTML = PLANES.map(p => {
    const bar = (label, val) => `<div class="stat"><span>${label}</span><div class="bar"><i style="width:${Math.min(100, val)}%"></i></div></div>`;
    const selected = p.id === game.plane.id;
    const icon = p.starship ? '🚀' : p.kind === 'heli' ? '🚁' : p.kind === 'jet' ? '🛩️' : '✈️';
    return `<button class="plane-card ${selected ? 'sel' : ''}" data-plane="${p.id}" type="button">
      <span class="plane-badge" style="--c:${p.color}">${icon}</span>
      <span class="plane-info"><b>${loc(p.name, lang)}${p.starship ? ' ✦' : ''}</b><small>${loc(p.desc, lang)}</small>
      ${bar(t('speed'), Math.round(p.maxSpeed / 420 * 100))}${bar(t('agility'), Math.round(p.turn / 2.4 * 100))}${bar(t('range'), Math.round((p.fuel / p.burn) / 45 * 100))}</span>
      <span class="plane-tag">${selected ? t('selected') : p.starship ? t('starship') : t('aircraft')}</span>
    </button>`;
  }).join('');
}

function buildMissions() {
  const lang = i18n.getLang();
  $('missionList').innerHTML = MISSIONS.map(m => {
    const best = save.bests[`${m.id}:${game.plane.id}`];
    return `<button class="mission-card" data-mission="${m.id}" type="button">
      <span class="mission-top"><b>${loc(m.name, lang)}</b><small>${'◆'.repeat(m.diff)}${'◇'.repeat(5 - m.diff)}</small></span>
      <small class="mission-desc">${loc(m.desc, lang)}</small>
      <span class="mission-stops">${m.stops.join(' → ')}</span>
      <span class="mission-best">${t('best')}: ${best ? fmt(best) : '—'}</span>
      <span class="mission-go">${t('play')} →</span>
    </button>`;
  }).join('');
}

function buildAirports() {
  const lang = i18n.getLang();
  $('freeAirport').innerHTML = AIRPORTS.map(a => `<option value="${a.code}">${loc(a.name, lang)} (${a.code})</option>`).join('');
  $('freeAirport').value = save.freeAirport || 'FCO';
}

function refreshUI() {
  i18n.apply(document);
  buildHangar(); buildMissions(); buildAirports();
  $('menuPlane').textContent = loc(game.plane.name, i18n.getLang());
  $('btnSound').textContent = `${t('sound')}: ${save.sound ? t('on') : t('off')}`;
  $('resultTitle').textContent = t('missionDone');
  $('qualityVal').textContent = game.quality === 'high' ? t('high') : t('low');
  $('pauseView').textContent = t(game.view);
  $('imageryVal').textContent = save.imagery ? t('on') : t('off');
}
refreshUI();
i18n.onChange(() => { save.lang = i18n.getLang(); persist(); refreshUI(); });
showScreen('loading');

/* ---------- input ---------- */
const keys = new Set();
const joy = { x: 0, y: 0 };
let joyActive = false, joyId = null, joyStart = { x: 0, y: 0 };
let throttle = 0.72, thrHold = 0, barDrag = false, boostHeld = false;

canvas.addEventListener('pointerdown', e => {
  AUDIO.resume();
  if (game.mode !== 'play') return;
  if (e.clientX < window.innerWidth * 0.55 && joyId === null) {
    joyId = e.pointerId; joyActive = true;
    joyStart = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  } else if (joyId === null) {
    barDrag = true;
    setThrottle(1 - (e.clientY - 50) / Math.max(120, window.innerHeight - 160));
    canvas.setPointerCapture(e.pointerId);
  }
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerId === joyId) {
    joy.x = clamp((e.clientX - joyStart.x) / 60, -1, 1);
    joy.y = clamp((e.clientY - joyStart.y) / 60, -1, 1);
  } else if (barDrag) setThrottle(1 - (e.clientY - 50) / Math.max(120, window.innerHeight - 160));
});
function endPointer(e) {
  if (e.pointerId === joyId) { joyId = null; joyActive = false; joy.x = 0; joy.y = 0; }
  barDrag = false;
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);

function setThrottle(v) { throttle = clamp(v, 0, 1); }
function bindHold(id, dir) {
  const el = $(id);
  el.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation(); AUDIO.resume();
    thrHold = dir; setThrottle(throttle + dir * 0.04);
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointerup', () => { thrHold = 0; });
  el.addEventListener('pointercancel', () => { thrHold = 0; });
}
bindHold('thrUp', 1); bindHold('thrDown', -1);
$('btnBoost').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); AUDIO.resume(); boostHeld = true; $('btnBoost').setPointerCapture(e.pointerId); });
$('btnBoost').addEventListener('pointerup', () => { boostHeld = false; });
$('btnBoost').addEventListener('pointercancel', () => { boostHeld = false; });
const thrBar = $('thrBar');
function barSet(e) { const r = thrBar.getBoundingClientRect(); setThrottle(1 - (e.clientX - r.left) / r.width); }
thrBar.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); barDrag = true; barSet(e); thrBar.setPointerCapture(e.pointerId); });
thrBar.addEventListener('pointermove', e => { if (barDrag) barSet(e); });
thrBar.addEventListener('pointerup', () => { barDrag = false; });

window.addEventListener('keydown', e => {
  if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
  if (!e.repeat && (e.key === 'v' || e.key === 'V')) cycleView();
  if (!e.repeat && (e.key === 'p' || e.key === 'P' || e.key === 'Escape')) togglePause();
  keys.add(e.key);
});
window.addEventListener('keyup', e => keys.delete(e.key));
window.addEventListener('blur', () => keys.clear());
const anyKey = arr => arr.some(k => keys.has(k));
const KEY_LEFT = ['ArrowLeft', 'a', 'A'], KEY_RIGHT = ['ArrowRight', 'd', 'D'];
const KEY_UP = ['ArrowUp', 'w', 'W'], KEY_DOWN = ['ArrowDown', 's', 'S'];
const KEY_THR_UP = ['e', 'E', 'Shift'], KEY_THR_DOWN = ['q', 'Q', 'Control'];

/* ---------- actions ---------- */
function cycleView() { game.cycleView(); refreshUI(); AUDIO.sfx.tap(); }
function togglePause() {
  if (game.mode === 'play') game.pause();
  else if (game.mode === 'pause') { game.resume(); showScreen(null); lastMode = game.mode; }
}
function beginFlying() {
  AUDIO.init(save.sound); AUDIO.resume();
  throttle = 0.72;
  showScreen(null);
  game.say(t('howto1'), '', 5000);
  if (view3d) view3d.setPlane(game.plane);
  lastMode = game.mode;
}
$('btnFree').addEventListener('click', () => {
  const code = $('freeAirport').value || 'FCO';
  save.freeAirport = code; persist();
  game.startFree(code); beginFlying();
});
$('btnMissions').addEventListener('click', () => showScreen('missions'));
$('btnHangar').addEventListener('click', () => showScreen('hangar'));
$('btnHowto').addEventListener('click', () => showScreen('howto'));
document.querySelectorAll('[data-back]').forEach(el => el.addEventListener('click', () => showScreen('menu')));
$('hangarList').addEventListener('click', e => {
  const card = e.target.closest('[data-plane]');
  if (!card) return;
  game.setPlane(card.dataset.plane); AUDIO.sfx.tap();
  refreshUI();
  if (view3d) view3d.setPlane(game.plane);
});
$('missionList').addEventListener('click', e => {
  const card = e.target.closest('[data-mission]');
  if (!card) return;
  game.startMission(card.dataset.mission); beginFlying();
});
$('btnView').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); cycleView(); });
$('btnViewPause').addEventListener('click', cycleView);
$('btnImagery').addEventListener('click', () => {
  save.imagery = !save.imagery; persist(); refreshUI();
  if (view3d) view3d.setImagery(save.imagery);
});
$('btnQuality').addEventListener('click', () => {
  game.setQuality(game.quality === 'high' ? 'low' : 'high');
  save.quality = game.quality; persist(); refreshUI();
  game.say(t('quality') + ': ' + (game.quality === 'high' ? t('high') : t('low')), '', 2000);
});
$('btnPause').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); togglePause(); });
$('btnResume').addEventListener('click', () => { game.resume(); showScreen(null); lastMode = game.mode; });
$('btnRestart').addEventListener('click', () => { game.restart(); beginFlying(); });
$('btnChangePlane').addEventListener('click', () => { game.quit(); showScreen('hangar'); refreshUI(); lastMode = game.mode; });
$('btnQuit').addEventListener('click', () => { game.quit(); showScreen('menu'); refreshUI(); lastMode = game.mode; });
$('btnSound').addEventListener('click', () => {
  save.sound = !save.sound; persist();
  AUDIO.init(save.sound); AUDIO.setSound(save.sound); refreshUI();
});
$('btnRetry').addEventListener('click', () => { game.startMission(game.mission.id); beginFlying(); });
$('btnNext').addEventListener('click', () => {
  const i = MISSIONS.findIndex(m => m.id === game.mission.id);
  const next = MISSIONS[i + 1];
  if (next) { game.startMission(next.id); beginFlying(); }
  else { game.quit(); showScreen('missions'); refreshUI(); lastMode = game.mode; }
});
$('btnResultMenu').addEventListener('click', () => { game.quit(); showScreen('menu'); refreshUI(); lastMode = game.mode; });

/* ---------- minimap ---------- */
function drawMinimap() {
  const w = minimap.width, h = minimap.height;
  const v = vectorData();
  mctx.clearRect(0, 0, w, h);
  mctx.fillStyle = '#0a2540'; mctx.fillRect(0, 0, w, h);
  const sx = x => (x + WORLD.width / 2) / WORLD.width * (w - 12) + 6;
  const sy = z => (z + WORLD.depth / 2) / WORLD.depth * (h - 12) + 6;
  if (v) {
    for (const ring of v.coastline) {
      const pts = worldPolygon(ring);
      mctx.beginPath();
      pts.forEach((p, i) => { if (i === 0) mctx.moveTo(sx(p.x), sy(p.z)); else mctx.lineTo(sx(p.x), sy(p.z)); });
      mctx.closePath();
      mctx.fillStyle = 'rgba(74,138,103,0.92)'; mctx.fill();
      mctx.strokeStyle = 'rgba(169,227,184,0.8)'; mctx.lineWidth = 0.6; mctx.stroke();
    }
    for (const a of AIRPORTS) {
      const p = geoToWorld(a.lon, a.lat);
      mctx.fillStyle = '#ffd166'; mctx.fillRect(sx(p.x) - 1, sy(p.z) - 1, 2, 2);
    }
  }
  if (game.state) {
    mctx.fillStyle = '#fff';
    mctx.beginPath(); mctx.arc(sx(game.state.x), sy(game.state.z), 3, 0, Math.PI * 2); mctx.fill();
  }
}

/* ---------- loop ---------- */
let lastMode = game.mode;
let frameNo = 0;

function update(dt) {
  if (thrHold) setThrottle(throttle + thrHold * dt * 0.55);
  if (game.mode !== 'play' && game.mode !== 'pause') return;
  const turn = (anyKey(KEY_RIGHT) ? 1 : 0) - (anyKey(KEY_LEFT) ? 1 : 0) + joy.x;
  const pitch = (anyKey(KEY_UP) ? 1 : 0) - (anyKey(KEY_DOWN) ? 1 : 0) - joy.y;
  if (anyKey(KEY_THR_UP)) setThrottle(throttle + dt * 0.4);
  if (anyKey(KEY_THR_DOWN)) setThrottle(throttle - dt * 0.4);
  game.update(dt, {
    turn: clamp(turn, -1, 1), pitch: clamp(pitch, -1, 1),
    throttle, brake: keys.has(' '), boost: boostHeld || anyKey(['b', 'B'])
  });
  if (game.mode !== lastMode) {
    lastMode = game.mode;
    if (game.mode === 'play') showScreen(null);
    else if (game.mode === 'pause') { showScreen('pause'); refreshUI(); }
    else if (game.mode === 'result') {
      showScreen('result');
      const r = game.result;
      $('resultTime').textContent = fmt(r.time);
      $('resultUsed').textContent = `${r.used}%`;
      $('resultBest').textContent = `${fmt(r.best)}${r.isNew ? ' ★' : ''}`;
      $('btnNext').classList.toggle('hidden', MISSIONS.findIndex(m => m.id === game.mission.id) >= MISSIONS.length - 1);
    }
  }
}

function draw() {
  if (!view3d) return;
  const time = Date.now() / 1000;
  view3d.update(game, 1 / 60, time);
  if (++frameNo % 3 === 0) drawMinimap();
  const playing = game.mode === 'play' || game.mode === 'pause';
  hud.classList.toggle('hidden', !playing);
  const h = game.hud();
  if (h) {
    $('hudSpeed').textContent = h.speed;
    $('hudAlt').textContent = h.alt;
    $('hudFuel').textContent = h.fuel + '%';
    $('hudHdg').textContent = String(h.hdg).padStart(3, '0') + '°';
    $('hudVs').textContent = (h.vs > 0 ? '+' : '') + h.vs;
    $('hudNext').textContent = h.next;
    $('hudDist').textContent = h.dist.toFixed(1) + ' ' + t('km');
    $('hudStep').textContent = h.progress;
    $('thrVal').textContent = Math.round(throttle * 100) + '%';
    $('thrFill').style.width = Math.round(throttle * 100) + '%';
    $('hudFuel').classList.toggle('low', h.fuel < 20);
    $('boostBadge').classList.toggle('hidden', !h.boosting);
    $('viewTag').textContent = t(h.view);
  }
  const showToast = playing && Date.now() < game.toast.until;
  toast.textContent = showToast ? game.toast.text : '';
  toast.className = 'toast ' + (showToast ? game.toast.kind : '') + (showToast ? '' : ' hidden');
}

async function boot() {
  try {
    $('loadStatus').textContent = 'elevation grid';
    const [heightBuf, meta, vectors] = await Promise.all([
      fetch('./data/italy-height.bin').then(r => r.arrayBuffer()),
      fetch('./data/italy-meta.json').then(r => r.json()),
      fetch('./data/italy-vector.json').then(r => r.json())
    ]);
    initGeo(new DataView(heightBuf), meta, vectors);
    $('loadStatus').textContent = 'city buildings';
    const buildings = await fetch('./data/buildings.json').then(r => r.json()).catch(() => ({ cities: [] }));
    initBuildingsData(buildings);
    $('loadStatus').textContent = 'satellite imagery 0%';
    const imagery = await loadImagery(p => { $('loadStatus').textContent = `satellite imagery ${Math.round(p * 100)}%`; }).catch(() => null);
    $('loadStatus').textContent = '3D scene';
    view3d = createRenderer(canvas, game.quality, imagery);
    view3d.setImagery(save.imagery);
    view3d.setPlane(game.plane);
    view3d.setTraffic(game.traffic);
    window.addEventListener('resize', () => view3d.resize(window.innerWidth, window.innerHeight));
    $('loading').classList.add('hidden');
    showScreen('menu');
    makeLoop(update, draw).start();
  } catch (e) {
    $('loadStatus').textContent = 'error: ' + e.message;
    console.error(e);
  }
}
boot();
