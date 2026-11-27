/* Italy 3D Flight Sim — UI, input, data loading and main loop */

import { makeLoop } from '../../_kit/core.js';
import { load, store } from '../../_kit/storage.js';
import { createI18n } from '../../_kit/i18n.js';
import * as AUDIO from '../../_kit/audio.js';
import { registerSW } from '../../_kit/pwa.js';
import { PLANES, MISSIONS, TOURS, STR, loc, WORLD } from './config.js';
import { AIRPORTS } from './config.js';
import { initLandmarks, landmarksData } from './landmarks.js';
import { initGeo, vectorData, geoToWorld, worldPolygon, terrainHeight } from './geo.js';
import { FlightGame } from './game.js';
import { createRenderer } from './render.js';
import { flightModelFor } from './flight.js';
import { drawAttitude } from './instruments.js';
import * as COCKPIT from './cockpit-audio.js';
import { loadImagery } from './imagery.js';
import { initBuildingsData } from './buildings.js';

const SAVE_KEY = 'italy3dFlightSim.save.v1';
const DEFAULTS = {
  plane: 'cessna', flightModel: 'real', startMode: 'runway', freeDestination: '', sound: true, lang: 'en', freeAirport: 'FCO', quality: 'high',
  imagery: true, mapMode: false, visual: 'happy', timeMode: 'cycle', weather: 'clear',
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
const actx = $('attitude').getContext('2d');
const hud = $('hud');
const toast = $('toast');
let view3d = null;
let imageryTexture = null;

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
  const cards = (items, isTour) => items.map(m => {
    const best = save.bests[`${m.id}:${game.plane.id}`];
    const attr = isTour ? `data-tour="${m.id}"` : `data-mission="${m.id}"`;
    const stops = isTour ? m.stops.map(id => {
      const d = landmarksData()?.landmarks.find(l => l.id === id);
      return d ? loc(d.name, lang) : id;
    }).join(' → ') : m.stops.join(' → ');
    return `<button class="mission-card" ${attr} type="button">
      <span class="mission-top"><b>${isTour ? '🗺️ ' : ''}${loc(m.name, lang)}</b><small>${'◆'.repeat(m.diff)}${'◇'.repeat(5 - m.diff)}</small></span>
      <small class="mission-desc">${loc(m.desc, lang)}</small>
      <span class="mission-stops">${stops}</span>
      <span class="mission-best">${t('best')}: ${best ? fmt(best) : '—'}</span>
      <span class="mission-go">${isTour ? t('tour') : t('play')} →</span>
    </button>`;
  }).join('');
  $('missionList').innerHTML =
    `<div class="group-label">${t('missions')}</div>${cards(MISSIONS, false)}` +
    `<div class="group-label">${t('tours')}</div>${cards(TOURS, true)}`;
}

function buildAirports() {
  const lang = i18n.getLang();
  $('freeAirport').innerHTML = AIRPORTS.map(a => `<option value="${a.code}">${loc(a.name, lang)} (${a.code})</option>`).join('');
  $('freeAirport').value = save.freeAirport || 'FCO';
  $('freeDestination').innerHTML = `<option value="">${t('nearest')}</option>` + $('freeAirport').innerHTML;
  $('freeDestination').value = game.freeDestination;
}

function refreshUI() {
  i18n.apply(document);
  buildHangar(); buildMissions(); buildAirports();
  $('menuPlane').textContent = loc(game.plane.name, i18n.getLang());
  $('btnSound').textContent = `${t('sound')}: ${save.sound ? t('on') : t('off')}`;
  $('resultTitle').textContent = t('missionDone');
  $('qualityVal').textContent = game.quality === 'high' ? t('high') : t('low');
  $('pauseView').textContent = t(game.view);
  const modelText = t(game.flightModel === 'real' ? 'realistic' : 'arcade') +
    (game.flightModel === 'real' && flightModelFor(game.plane, 'real') !== 'real' ? ` (${t('arcadeOnly')})` : '');
  $('modelVal').textContent = modelText;
  $('modelPauseVal').textContent = modelText;
  $('startVal').textContent = t(game.startMode === 'runway' ? 'startRunway' : 'startAir');
  $('btnStart').classList.toggle('hidden', flightModelFor(game.plane, game.flightModel) !== 'real');
  $('trimUp').setAttribute('aria-label', t('trimUp'));
  $('trimDown').setAttribute('aria-label', t('trimDown'));
  const happy = save.visual === 'happy';
  $('imageryVal').textContent = !happy && save.imagery ? t('on') : t('off');
  $('mapModeVal').textContent = !happy && save.mapMode ? t('on') : t('off');
  $('timeVal').textContent = t(save.timeMode === 'cycle' ? 'cycle' : save.timeMode === 'day' ? 'day' : save.timeMode === 'dusk' ? 'dusk' : 'night');
  $('weatherVal').textContent = t(save.weather === 'fog' ? 'fog' : save.weather === 'cloudy' ? 'cloudy' : 'clear');
}
refreshUI();
i18n.onChange(() => { save.lang = i18n.getLang(); persist(); refreshUI(); });
showScreen('loading');

/* ---------- input ---------- */
const keys = new Set();
const joy = { x: 0, y: 0 };
let joyActive = false, joyId = null, joyStart = { x: 0, y: 0 };
let throttle = 0.72, thrHold = 0, barDrag = false, boostHeld = false, trimHold = 0;

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
for (const [id, dir] of [['trimUp', 1], ['trimDown', -1]]) {
  const el = $(id);
  el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); AUDIO.resume(); trimHold = dir; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointerup', () => { trimHold = 0; });
  el.addEventListener('pointercancel', () => { trimHold = 0; });
}
const thrBar = $('thrBar');
function barSet(e) { const r = thrBar.getBoundingClientRect(); setThrottle(1 - (e.clientX - r.left) / r.width); }
thrBar.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); barDrag = true; barSet(e); thrBar.setPointerCapture(e.pointerId); });
thrBar.addEventListener('pointermove', e => { if (barDrag) barSet(e); });
thrBar.addEventListener('pointerup', () => { barDrag = false; });

window.addEventListener('keydown', e => {
  if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
  if (!e.repeat && (e.key === 'v' || e.key === 'V')) cycleView();
  if (!e.repeat) cockpitKey(e.key.toLowerCase());
  if (!e.repeat && (e.key === 'p' || e.key === 'P' || e.key === 'Escape')) togglePause();
  keys.add(e.key);
});
window.addEventListener('keyup', e => keys.delete(e.key));
window.addEventListener('blur', () => keys.clear());
const anyKey = arr => arr.some(k => keys.has(k));
const KEY_LEFT = ['ArrowLeft', 'a', 'A'], KEY_RIGHT = ['ArrowRight', 'd', 'D'];
const KEY_UP = ['ArrowUp', 'w', 'W'], KEY_DOWN = ['ArrowDown', 's', 'S'];
const KEY_THR_UP = ['e', 'E', 'Shift'], KEY_THR_DOWN = ['q', 'Q', 'Control'];
const KEY_YAW_LEFT = ['z', 'Z'], KEY_YAW_RIGHT = ['x', 'X'];
const KEY_TRIM_UP = ['r', 'R'], KEY_TRIM_DOWN = ['f', 'F'];
// Keys are all-or-nothing, so in the realistic model they use part of the elevator travel.
const KEY_ELEVATOR_REAL = 0.6;
const axis = (plus, minus) => (anyKey(plus) ? 1 : 0) - (anyKey(minus) ? 1 : 0);

/* ---------- cockpit switches ---------- */
const SWITCHES = {
  c: () => game.cycleFlaps(),
  g: () => game.toggleGear(),
  h: () => game.toggleAutopilot(),
  n: () => game.toggleNav(),
  i: () => game.adjustAltitude(1),
  k: () => game.adjustAltitude(-1),
  l: () => { if (game.lineUp()) setThrottle(0); }
};
function cockpitKey(key) { if (game.mode === 'play') SWITCHES[key]?.(); }
for (const [id, key] of [['btnFlaps', 'c'], ['btnGear', 'g'], ['btnAp', 'h'], ['btnNav', 'n'], ['apUp', 'i'], ['apDown', 'k'], ['btnLineUp', 'l']]) {
  $(id).addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation(); AUDIO.resume(); AUDIO.sfx.tap();
    cockpitKey(key);
    e.currentTarget.blur(); // keep Space for the brakes
  });
}

/* ---------- actions ---------- */
function cycleView() { game.cycleView(); refreshUI(); AUDIO.sfx.tap(); }
function togglePause() {
  if (game.mode === 'play') game.pause();
  else if (game.mode === 'pause') { game.resume(); showScreen(null); lastMode = game.mode; }
}
function beginFlying() {
  AUDIO.init(save.sound); AUDIO.resume(); COCKPIT.unlock();
  const onRunway = !!game.state?.onGround;
  throttle = onRunway ? 0 : 0.72;
  showScreen(null);
  game.say(onRunway ? t('takeoffHint') : save.visual === 'happy' ? t('happyHint') : t('howto1'), '', 5000);
  if (view3d) view3d.setPlane(game.plane);
  lastMode = game.mode;
}
$('btnFree').addEventListener('click', () => {
  const code = $('freeAirport').value || 'FCO';
  save.freeAirport = code; persist();
  game.startFree(code); beginFlying();
});
$('freeDestination').addEventListener('change', e => game.setDestination(e.target.value));
$('btnStart').addEventListener('click', () => {
  game.setStartMode(game.startMode === 'runway' ? 'air' : 'runway');
  refreshUI(); AUDIO.sfx.tap();
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
  const tour = e.target.closest('[data-tour]');
  if (tour) { game.startTour(tour.dataset.tour); beginFlying(); return; }
  const card = e.target.closest('[data-mission]');
  if (card) { game.startMission(card.dataset.mission); beginFlying(); }
});
$('btnView').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); cycleView(); });
$('btnViewPause').addEventListener('click', cycleView);
$('btnHappy').addEventListener('click', () => {
  save.visual = 'happy'; save.mapMode = false; persist(); refreshUI();
  if (view3d) view3d.setHappy(true);
  game.say(t('happyHint'), 'good', 3200);
});
$('btnImagery').addEventListener('click', async () => {
  save.imagery = !save.imagery;
  if (save.imagery) { save.visual = 'satellite'; save.mapMode = false; }
  persist(); refreshUI();
  if (!view3d) return;
  if (save.imagery) {
    view3d.setHappy(false);
    if (!imageryTexture) {
      $('loadStatus').textContent = 'satellite imagery 0%';
      $('loading').classList.remove('hidden');
      imageryTexture = await loadImagery(p => { $('loadStatus').textContent = `satellite imagery ${Math.round(p * 100)}%`; }).catch(() => null);
      $('loading').classList.add('hidden');
      view3d.setImageryTexture(imageryTexture);
    }
    view3d.setImagery(true);
    view3d.setMapMode(false);
  } else view3d.setImagery(false);
});
$('btnMapMode').addEventListener('click', () => {
  save.mapMode = !save.mapMode;
  if (save.mapMode) { save.visual = 'map'; save.imagery = false; }
  persist(); refreshUI();
  if (view3d) { if (save.mapMode) view3d.setHappy(false); view3d.setMapMode(save.mapMode); view3d.setImagery(false); }
});
$('btnTime').addEventListener('click', () => {
  const modes = ['cycle', 'day', 'dusk', 'night'];
  save.timeMode = modes[(modes.indexOf(save.timeMode) + 1) % modes.length];
  persist(); refreshUI();
  if (view3d) view3d.setTimeMode(save.timeMode);
});
$('btnWeather').addEventListener('click', () => {
  const presets = ['clear', 'cloudy', 'fog'];
  save.weather = presets[(presets.indexOf(save.weather) + 1) % presets.length];
  persist(); refreshUI();
  if (view3d) view3d.setWeather(save.weather);
});
function toggleModel() {
  game.setFlightModel(game.flightModel === 'real' ? 'arcade' : 'real');
  refreshUI(); AUDIO.sfx.tap();
}
$('btnModel').addEventListener('click', toggleModel);
$('btnModelPause').addEventListener('click', toggleModel);
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
function replayMission() {
  if (game.mission?.kind === 'tour') game.startTour(game.mission.id);
  else game.startMission(game.mission.id);
  beginFlying();
}
$('btnRetry').addEventListener('click', replayMission);
$('btnNext').addEventListener('click', () => {
  const list = game.mission?.kind === 'tour' ? TOURS : MISSIONS;
  const i = list.findIndex(m => m.id === game.mission.id);
  const next = list[i + 1];
  if (next) {
    if (game.mission?.kind === 'tour') game.startTour(next.id);
    else game.startMission(next.id);
    beginFlying();
  } else { game.quit(); showScreen('missions'); refreshUI(); lastMode = game.mode; }
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
  const keyScale = game.state?.model === 'real' ? KEY_ELEVATOR_REAL : 1;
  const pitch = axis(KEY_UP, KEY_DOWN) * keyScale - joy.y;
  if (anyKey(KEY_THR_UP)) setThrottle(throttle + dt * 0.4);
  if (anyKey(KEY_THR_DOWN)) setThrottle(throttle - dt * 0.4);
  const crashes = game.stats.crashes;
  const engaged = !!game.autopilot;
  game.update(dt, {
    turn: clamp(turn, -1, 1), pitch: clamp(pitch, -1, 1),
    yaw: axis(KEY_YAW_RIGHT, KEY_YAW_LEFT),
    trim: clamp(axis(KEY_TRIM_UP, KEY_TRIM_DOWN) + trimHold, -1, 1),
    throttle, brake: keys.has(' '), boost: boostHeld || anyKey(['b', 'B'])
  });
  // The autopilot owns the throttle while engaged; a respawn on the runway idles it.
  if (engaged && game.autopilot) setThrottle(game.state.throttle);
  if (game.stats.crashes !== crashes && game.state?.onGround) setThrottle(0);
  if (game.mode !== lastMode) {
    lastMode = game.mode;
    if (game.mode === 'play') showScreen(null);
    else if (game.mode === 'pause') { showScreen('pause'); refreshUI(); }
    else if (game.mode === 'result') {
      showScreen('result');
      const r = game.result;
      $('resultTime').textContent = fmt(r.time);
      $('resultUsed').textContent = `${r.used}%`;
      $('resultGradeBox').classList.toggle('hidden', !r.grade);
      if (r.grade) $('resultGrade').textContent = `${r.grade.score}/100`;
      $('resultBest').textContent = `${fmt(r.best)}${r.isNew ? ' ★' : ''}`;
      const nextList = game.mission?.kind === 'tour' ? TOURS : MISSIONS;
      $('btnNext').classList.toggle('hidden', nextList.findIndex(m => m.id === game.mission.id) >= nextList.length - 1);
      $('resultTitle').textContent = game.mission?.kind === 'tour' ? `${t('tour')}: ${loc(game.mission.name, i18n.getLang())}` : t('missionDone');
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
    $('hudDist').textContent = h.dist === null ? '—' : h.dist.toFixed(0) + ' ' + t('km');
    $('hudStep').textContent = h.progress;
    $('thrVal').textContent = Math.round(throttle * 100) + '%';
    $('thrFill').style.width = Math.round(throttle * 100) + '%';
    $('hudFuel').classList.toggle('low', h.fuel < 20);
    $('boostBadge').classList.toggle('hidden', !h.boosting);
    $('viewTag').textContent = t(h.view);
    $('simPanel').classList.toggle('hidden', !h.real);
    if (h.real) {
      drawAttitude(actx, h);
      $('hudMsl').textContent = h.msl;
      $('flapsVal').textContent = ['UP', '1', 'FULL'][h.flaps];
      $('gearVal').textContent = t(h.gear ? 'gearDown' : 'gearUp');
      $('btnGear').disabled = !h.retractable || h.onGround;
      $('btnAp').classList.toggle('on', !!h.autopilot);
      $('btnAp').disabled = h.onGround;
      $('btnNav').disabled = h.onGround;
      $('btnNav').classList.toggle('on', h.autopilot?.mode === 'nav');
      for (const id of ['apUp', 'apDown']) $(id).disabled = !h.autopilot;
      $('btnLineUp').classList.toggle('hidden', !h.canLineUp);
      $('apStatus').textContent = h.autopilot
        ? `${t(h.autopilot.mode === 'nav' ? 'apNav' : 'apHdg')} ${String(h.autopilot.heading).padStart(3, '0')}° · ALT ${h.autopilot.altitude}`
        : '';
      $('hudG').textContent = h.g.toFixed(1);
      $('hudAoa').textContent = h.aoa.toFixed(0) + '°';
      $('hudTrim').textContent = (h.trim > 0 ? '+' : '') + h.trim.toFixed(1) + '°';
    }
  }
  COCKPIT.update(game.mode === 'play' && save.sound && game.state ? {
    power: game.state.spool ?? game.state.throttle, speed: game.state.speed,
    jet: game.plane.kind !== 'prop' && game.plane.kind !== 'heli',
    stall: game.state.stallWarn, gear: game.state.gearWarn
  } : null);
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
    $('loadStatus').textContent = 'landmarks';
    const landmarks = await fetch('./data/landmarks.json').then(r => r.json()).catch(() => ({ landmarks: [] }));
    initLandmarks(landmarks);
    refreshUI();
    $('loadStatus').textContent = 'city buildings';
    const buildings = await fetch('./data/buildings.json').then(r => r.json()).catch(() => ({ cities: [] }));
    initBuildingsData(buildings);
    const lowEnd = (navigator.hardwareConcurrency || 8) <= 4;
    if (lowEnd && save.quality === 'high') { game.setQuality('low'); save.quality = 'low'; }
    if (save.visual === 'satellite') {
      $('loadStatus').textContent = 'satellite imagery 0%';
      imageryTexture = await loadImagery(p => { $('loadStatus').textContent = `satellite imagery ${Math.round(p * 100)}%`; }).catch(() => null);
    }
    $('loadStatus').textContent = '3D scene';
    view3d = createRenderer(canvas, game.quality, imageryTexture, save.visual);
    view3d.addLandmarks();
    view3d.setTimeMode(save.timeMode);
    view3d.setWeather(save.weather);
    view3d.setHappy(save.visual === 'happy');
    if (save.visual !== 'happy') {
      view3d.setImagery(save.visual === 'satellite' && save.imagery);
      view3d.setMapMode(save.visual === 'map');
    }
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
