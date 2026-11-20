/* Sunset Compass — bootstrap, sensor orchestration and UI router */

import { DEFAULT_POS } from './config.js';
import { t, getLang, setLang, syncFromStorage, onLanguageChange } from './i18n.js';
import { calcSunAzAlt, getSunTimes, getSunAtTime, getEventDates, nextEvent, phaseOf } from './sun.js';
import { Compass, formatCoord } from './compass.js';
import { CameraAR } from './camera.js';
import * as Tracker from './tracker.js';
import { applyTheme, createStars, renderCompass, renderAR, setCountdownRing } from './render.js';

const $ = id => document.getElementById(id);
const compass = new Compass();
const camera = new CameraAR();

let started = false;
let mode = 'compass';
let position = { ...DEFAULT_POS };
let heading = 0;
let demo = false;
let loopTimer = null;
let currentPhase = 'night';
let lang = getLang();

/* ---------- i18n ---------- */
function applyLanguage() {
  lang = getLang();
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-sa-i18n]').forEach(el => { el.textContent = t(el.dataset.saI18n); });
  $('btn-lang').textContent = lang === 'it' ? 'EN' : 'IT';
  $('perm-private').innerHTML = t('permPrivate');
  if (started) {
    refreshAll();
  }
}

onLanguageChange(() => applyLanguage());

/* ---------- views ---------- */
function showView(name) {
  ['view-perm', 'view-compass', 'view-camera', 'view-tracker'].forEach(id => {
    const el = $(id);
    if (el) el.style.display = 'none';
  });
  if (name === 'perm') {
    $('view-perm').style.display = 'flex';
    return;
  }
  $('view-main').style.display = 'flex';
  const view = $('view-' + name);
  if (view) view.style.display = name === 'camera' ? 'block' : 'flex';
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.mode === name);
  });
  document.querySelector('.nav').dataset.active = name;
}

function switchMode(next) {
  mode = next;
  if (next !== 'camera' && camera.isActive()) camera.stop();
  showView(next);
  if (next === 'camera') startCamera();
  if (next === 'tracker') refreshTracker();
  if (next === 'compass') refreshCompass();
}

/* ---------- sensors ---------- */
async function startSensors() {
  // iOS requires the orientation request to happen inside a user gesture.
  compass.startOrientation(h => { heading = h; onHeading(); });

  let fix = null;
  if (navigator.geolocation) {
    try {
      fix = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, timeout: 8000, maximumAge: 10000
        });
      });
    } catch (e) { /* fallback below */ }
  }

  if (fix) {
    position = { lat: fix.coords.latitude, lon: fix.coords.longitude, accuracy: fix.coords.accuracy };
  } else {
    demo = true;
    position = { ...DEFAULT_POS };
  }

  compass.startGPS(pos => { position = pos; demo = false; refreshAll(); });
  refreshAll();
}

async function startCamera() {
  const ok = await camera.start($('ar-video'));
  if (!ok) {
    camera.stop();
    $('ar-fallback').classList.remove('hidden');
    $('ar-fallback-title').textContent = t('cameraUnavailable');
    $('ar-fallback-text').textContent = t('cameraHint');
  } else {
    $('ar-fallback').classList.add('hidden');
  }
  refreshAR();
}

/* ---------- live data ---------- */
function onHeading() {
  if (mode === 'compass') refreshCompass();
  if (mode === 'camera') refreshAR();
}

function sunNow() {
  return calcSunAzAlt(position.lat, position.lon, new Date());
}

function refreshCompass() {
  if (!started) return;
  const sun = sunNow();
  const obstacle = camera.nearest(sun.azimuth);
  renderCompass($('compass-svg'), {
    sunAz: sun.azimuth, sunAlt: sun.altitude,
    obstacle, heading, phase: currentPhase
  });
  $('sun-readout').textContent = `${t('sun')} ${Math.round(sun.altitude)}° · ${Math.round(sun.azimuth)}°`;
}

function refreshAR() {
  if (!started || mode !== 'camera') return;
  const now = new Date();
  const points = [];
  for (let m = -30; m <= 120; m += 10) {
    const future = new Date(now.getTime() + m * 60000);
    const utcH = future.getUTCHours() + future.getUTCMinutes() / 60;
    const sp = getSunAtTime(position.lat, position.lon, future, utcH);
    points.push({
      az: sp.azimuth, alt: sp.altitude, time: future.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isNow: m === 0
    });
  }
  const rect = $('ar-svg').getBoundingClientRect();
  const w = rect.width || 400, h = rect.height || 400;
  $('ar-svg').setAttribute('viewBox', `0 0 ${w} ${h}`);
  renderAR($('ar-svg'), {
    points: points.map(p => {
      const screen = camera.sunToScreen(p.az, p.alt, heading, w, h);
      return screen ? { ...screen, alt: p.alt, time: p.time, isNow: p.isNow } : null;
    }).filter(Boolean),
    obstacles: camera.list(),
    heading, phase: currentPhase, w, h
  });
  const sun = sunNow();
  $('ar-sun-info').textContent = `☀ ${Math.round(sun.altitude)}°`;
  const n = camera.list().length;
  $('ar-obs-info').textContent = `🏔 ${n} ${n === 1 ? t('obstacleOne') : t('obstacles')}`;
}

function refreshTracker() {
  if (!started) return;
  Tracker.update($('trail-scroll'), position.lat, position.lon, camera.list());
}

function fmtDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = n => String(n).padStart(2, '0');
  return d > 0 ? `${d}${t('daysShort')} ${pad(h)}:${pad(m)}`
               : `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function refreshCountdown() {
  if (!started) return;
  const now = Date.now();
  const events = getEventDates(position.lat, position.lon, new Date());
  const times = getSunTimes(position.lat, position.lon, new Date());
  const sunset = nextEvent(events, 'sunset', now);
  const sunrise = nextEvent(events, 'sunrise', now);

  if (sunset && (!sunrise || sunset.time < sunrise.time)) {
    const remaining = sunset.time - now;
    $('cd-time').textContent = fmtDuration(remaining);
    $('cd-sub').textContent = `${t('sunsetAt')} ${times.sunset.string}`;
    $('cd-label').textContent = t('nextSunset');
    setCountdownRing($('cd-ring'), 1 - remaining / (18 * 3600000));
    $('countdown-box').classList.remove('is-night');
  } else if (sunrise) {
    const remaining = sunrise.time - now;
    $('cd-time').textContent = '🌙 ' + fmtDuration(remaining);
    $('cd-sub').textContent = `${t('sunriseIn')} ${times.sunrise.string}`;
    $('cd-label').textContent = t('nightFallback');
    setCountdownRing($('cd-ring'), 1 - remaining / (12 * 3600000));
    $('countdown-box').classList.add('is-night');
  }
}

function refreshAll() {
  if (!started) return;
  $('loc-text').textContent = demo ? t('gpsDenied') : formatCoord(position.lat, position.lon);
  const sun = sunNow();
  currentPhase = phaseOf(sun.altitude);
  applyTheme(currentPhase, sun.altitude);
  $('phase-chip').textContent = t(currentPhase);
  refreshCountdown();
  refreshCompass();
  if (mode === 'camera') refreshAR();
  if (mode === 'tracker') refreshTracker();
}

function tick() {
  syncFromStorage();
  $('clock').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  refreshAll();
}

/* ---------- modal ---------- */
function showModal(icon, title, text, buttons) {
  $('modal-icon').textContent = icon;
  $('modal-title').textContent = title;
  $('modal-text').textContent = text;
  $('modal-actions').innerHTML = buttons.map((b, i) =>
    `<button class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('');
  $('modal-actions').querySelectorAll('button').forEach(btn => {
    btn.onclick = () => { buttons[+btn.dataset.i].fn?.(); closeModal(); };
  });
  $('modal').classList.add('on');
}
function closeModal() { $('modal').classList.remove('on'); }

/* ---------- AR markers ---------- */
function handleARTap(e) {
  if (!camera.isActive()) return;
  const rect = $('ar-tap').getBoundingClientRect();
  const x = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - rect.left;
  const y = (e.clientY ?? e.touches?.[0]?.clientY ?? 0) - rect.top;
  const world = camera.screenToWorld(x, y, heading, rect.width, rect.height);
  camera.add(world.azimuth, world.altitude);
  toast('🏔 ' + Math.round(world.altitude) + '°');
  refreshAR();
}

let toastTimer = null;
function toast(text) {
  const el = $('toast');
  el.textContent = text;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1400);
}

/* ---------- init ---------- */
function init() {
  createStars($('stars'));
  applyLanguage();
  showView('perm');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  $('btn-start').addEventListener('click', async () => {
    const btn = $('btn-start');
    btn.textContent = t('loading');
    btn.disabled = true;
    await startSensors();
    started = true;
    camera.load();
    showView('compass');
    switchMode('compass');
    tick();
    if (demo) {
      showModal('📍', t('demoTitle'), t('demoText'), [{ label: t('ok'), cls: 'sun' }]);
    }
    if (!loopTimer) loopTimer = setInterval(tick, 1000);
  });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  $('btn-lang').addEventListener('click', () => {
    setLang(lang === 'it' ? 'en' : 'it');
  });

  $('ar-tap').addEventListener('click', handleARTap);
  $('btn-clear-obs').addEventListener('click', () => {
    camera.clear();
    refreshAR();
    toast(t('cleared'));
  });
  $('modal-close').addEventListener('click', closeModal);
  $('modal').addEventListener('click', e => { if (e.target === $('modal')) closeModal(); });
}

init();
