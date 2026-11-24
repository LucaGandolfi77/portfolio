/* Neon Kart — fixed-step race loop and orchestration */

import { KARTS, TRACKS, MODES, STEP, MODE_BY_ID } from './config.js';
import { detect, initLang, setLang, getLang, t } from './i18n.js';
import { loadProfile, saveProfile } from './storage.js';
import { available, recordRace, bestTime } from './core/progression.js';
import { Track } from './core/track.js';
import { createRace, updateRace, ghostAt } from './core/race.js';
import { standings } from './core/physics.js';
import { Renderer } from './render.js';
import { Input } from './input.js';
import { Sfx } from './audio.js';
import { ui } from './ui.js';
import * as glass from './glass.js';

const $ = id => document.getElementById(id);
let profile = loadProfile();
let prefs = { ...profile.settings };
const sfx = new Sfx(prefs);
const renderer = new Renderer($('gameCanvas'), prefs.quality);
const input = new Input({
  pause: () => pause(!paused),
  confirm: () => {}
});

let tab = 'kart';
const sel = { kart:0, track:0, mode:0 };
let race = null;
let paused = false;
let acc = 0;
let last = performance.now();
let hiddenPause = false;
let lastCount = -1;

const lists = () => ({
  kart:available(profile, 'kart'),
  track:available(profile, 'track'),
  mode:available(profile, 'mode')
});
function menuCtx() { return { profile, sel, lists:lists(), tab }; }

function syncSelections() {
  const l = lists();
  sel.kart = Math.min(sel.kart, l.kart.length - 1);
  sel.track = Math.min(sel.track, l.track.length - 1);
  sel.mode = Math.min(sel.mode, l.mode.length - 1);
}
function current() {
  const l = lists();
  return { kart:l.kart[sel.kart], track:l.track[sel.track], mode:l.mode[sel.mode] };
}

function renderMenu() { syncSelections(); ui.renderMenu(menuCtx()); }

function startRace() {
  const { kart, track:tdef, mode } = current();
  if (!kart || !tdef || !mode) return;
  const track = new Track(tdef);
  const rivals = KARTS.filter(k => k.id !== kart.id && profile.unlockedKarts.includes(k.id)).slice(0, mode.rivals);
  const key = tdef.id + ':' + mode.id;
  let ghost = null;
  if (mode.id === 'time') {
    try { ghost = JSON.parse(localStorage.getItem('pf.kart.ghost.' + key) || 'null'); } catch (e) {}
  }
  race = createRace(mode.id, track, kart, { rivalKarts:rivals, ghost, seed:7 });
  profile.lastKart = kart.id; profile.lastTrack = tdef.id; profile.lastMode = mode.id;
  saveProfile(profile);
  paused = false; acc = 0; lastCount = -1;
  $('menu').classList.add('hidden');
  $('hud').classList.remove('hidden');
  $('touchControls').classList.remove('hidden');
  ui.closeModal('resultModal');
  sfx.engineStart();
  renderer.buildTrack(track);
  renderer.camera.x = race.racers[0].x;
  renderer.camera.y = race.racers[0].y;
  renderHUD();
}

function finishRace() {
  const player = race.racers[0];
  const key = race.track.def.id + ':' + race.mode.id;
  const prev = bestTime(profile, race.track.def.id, race.mode.id);
  const isBest = !!player.finishTime && (!prev || player.finishTime < prev);
  const res = recordRace(profile, {
    trackId:race.track.def.id, modeId:race.mode.id, time:player.finishTime,
    won:!!race.result?.won, place:race.result?.place || 1, isBest
  });
  profile = res.profile;
  saveProfile(profile);
  if (isBest && race.mode.id === 'time') {
    try { localStorage.setItem('pf.kart.ghost.' + key, JSON.stringify(race.ghost.slice(0, 1200))); } catch (e) {}
  }
  sfx.engineStop();
  if (race.result?.won) sfx.win();
  ui.showResult(race, res.gained, res.unlocked);
  syncSelections();
  renderMenu();
}

function handleEvents() {
  const player = race.racers[0];
  for (const ev of race.events) {
    if (ev.type === 'lap') {
      sfx.lap();
      ui.raceToast(t('lapTime') + ' ' + (ev.lap) + ' · ' + ui.fmt(ev.time));
    }
    if (ev.type === 'powerup' && ev.racer === 'player') { sfx.pickup(); ui.raceToast(ev.id.toUpperCase()); }
    if (ev.type === 'eliminated' && ev.racer === 'player') ui.raceToast(t('lost'));
    if (ev.type === 'over') finishRace();
  }
  const order = standings(race.racers, race.track);
  player.place = order.indexOf(player) + 1;
}

function renderHUD() {
  if (!race) return;
  ui.setHUD(race, race.racers[0], race.racers.filter(r => !r.eliminated).length);
  ui.drawMini(renderer, race);
  if (race.phase === 'countdown') {
    const n = Math.ceil(race.countdown);
    if (n !== lastCount && n > 0) { sfx.count(n); lastCount = n; }
    ui.setCountdown(n > 0 ? String(n) : t('go'));
  } else if (race.phase === 'racing' && race.time < 0.6) {
    ui.setCountdown(t('go'));
  } else ui.setCountdown('');

  const player = race.racers[0];
  race.currentGhost = ghostAt(race, race.time);
  sfx.engineSet(player.speed, player.nitroOn);
  if (player.speed > 12 && (player.nitroOn || player.drift)) {
    renderer.emit(player.x - Math.cos(player.angle) * 20, player.y - Math.sin(player.angle) * 20,
      player.nitroOn ? '#ff9d3d' : '#b28dff', 2, 0.6);
  }
}

function pause(on) {
  if (!race || race.phase === 'over') return;
  paused = !!on;
  if (paused) ui.showModal('pauseModal'); else ui.closeModal('pauseModal');
}
function quit() {
  race = null; paused = false;
  sfx.engineStop();
  $('hud').classList.add('hidden');
  $('touchControls').classList.add('hidden');
  ui.closeModal('pauseModal'); ui.closeModal('resultModal');
  $('menu').classList.remove('hidden');
  renderMenu();
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (race && !paused && !hiddenPause && race.phase !== 'over') {
    acc = Math.min(acc + dt, 0.25);
    let steps = 0;
    while (acc >= STEP && steps < 6) {
      updateRace(race, STEP, input.read());
      handleEvents();
      acc -= STEP; steps++;
      if (race.phase === 'over') break;
    }
  }
  if (race) {
    renderer.drawRace(race, race.racers[0], dt);
    renderHUD();
  }
}

initLang(detect());
document.body.dataset.theme = prefs.theme || 'dark';
$('soundCheck').checked = !!prefs.sound;
$('vibrateCheck').checked = !!prefs.vibration;
$('motionCheck').checked = !!prefs.reducedMotion;
document.querySelectorAll('[data-quality]').forEach(b => b.classList.toggle('on', b.dataset.quality === prefs.quality));

ui.initUI({
  start:startRace, pause, restart:startRace, quit,
  tab: name => { tab = name; renderMenu(); },
  nav: dir => {
    const l = lists()[tab];
    if (!l.length) return;
    sel[tab] = (sel[tab] + dir + l.length) % l.length;
    renderMenu();
    sfx.beep(420, 0.05);
  },
  prefs: patch => {
    prefs = { ...prefs, ...patch };
    profile.settings = prefs; saveProfile(profile);
    if (patch.quality) { renderer.quality = patch.quality; renderer.resize(); if (race) renderer.trackKey = null; }
    if (patch.sound === false) sfx.engineStop();
  },
  lang: () => setLang(getLang() === 'en' ? 'it' : 'en'),
  theme: () => {
    prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = prefs.theme;
    profile.settings = prefs; saveProfile(profile);
  },
  renderAll: () => { renderMenu(); renderHUD(); }
});

glass.enable(document.querySelector('.menu-card'), 24, 18);
document.addEventListener('visibilitychange', () => {
  hiddenPause = document.hidden;
  if (hiddenPause && race) sfx.engineStop();
  else if (race && !paused) sfx.engineStart();
});
addEventListener('pagehide', () => saveProfile(profile));

renderMenu();
requestAnimationFrame(frame);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
