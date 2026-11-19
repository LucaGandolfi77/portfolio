/* Precision Skating — bootstrap, loop and mode orchestration */

import { PROGRAM, STR, SKATERS, programFor, CHAMPIONSHIP } from './config.js';
import { state, save, recordRoutine } from './state.js';
import { Engine } from './engine.js';
import { Championship } from './championship.js';
import { Renderer } from './render.js';
import * as AUDIO from './audio.js';
import { UI } from './ui.js';

const canvas = document.getElementById('game');
const renderer = new Renderer(canvas);
const ui = new UI();
const engine = new Engine(onEngineEvent);

let mode = 'practice';
let championship = null;
let running = false;
let paused = false;
let startTime = 0;
let elapsed = 0;
let totalMs = 0;
let lastFrame = 0;
let toastText = '';
let toastTimer = 0;
let toastColor = '#fff';

function t(key) { return ui.t(key); }

function onEngineEvent(event) {
  switch (event.type) {
    case 'perfect':
      showToast(t('perfect'), '#ffd166');
      AUDIO.sfx.perfect();
      vibrate([12]);
      break;
    case 'good':
      showToast(t('good'), '#5ef0a8');
      AUDIO.sfx.good();
      break;
    case 'miss':
      showToast(t('miss'), '#ff6b9d');
      AUDIO.sfx.miss();
      vibrate([25, 20, 25]);
      break;
    case 'drift':
      AUDIO.sfx.drift();
      showToast(t('drift'), '#ff6b9d');
      break;
    case 'correct':
      showToast(t('corrected'), '#5ef0a8');
      AUDIO.sfx.correct();
      vibrate([15, 15, 15]);
      break;
    case 'element':
      showToast(`${t('elementDone')}: ${state.lang === 'it' ? event.element.name_it : event.element.name_en}`, '#a98bff');
      AUDIO.sfx.element();
      break;
  }
}

function vibrate(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* ignore */ }
}

function showToast(text, color = '#fff') {
  toastText = text;
  toastColor = color;
  toastTimer = 1100;
}

function programForMode() {
  return mode === 'championship' && championship
    ? programFor(championship.round)
    : PROGRAM;
}

function startRun() {
  AUDIO.resume();
  const program = programForMode();
  totalMs = program[program.length - 1].startMs + program[program.length - 1].durMs;
  engine.start({ program, difficulty: state.difficulty, rink: renderer.resize() });
  running = true;
  paused = false;
  elapsed = 0;
  lastFrame = 0;
  startTime = performance.now();
  toastTimer = 0;
  ui.hideOverlays();
}

function startPractice() {
  mode = 'practice';
  championship = null;
  startRun();
}

function startChampionship() {
  mode = 'championship';
  if (!championship) {
    championship = new Championship();
    championship.restore();
  }
  if (championship.finished) championship.reset();
  startRun();
}

function nextRound() {
  if (!championship || championship.finished) { ui.showOverlay('startOverlay'); return; }
  startRun();
}

function finishRun() {
  running = false;
  const results = engine.results();
  recordRoutine(mode, state.difficulty, results.total, {
    perfects: results.perfects,
    corrections: results.corrections,
    drifts: results.drifts
  });

  let info = { mode, difficulty: state.difficulty };
  if (mode === 'championship' && championship) {
    const outcome = championship.submit(results.total, state.difficulty);
    info = { ...info, rank: outcome.rank, medal: outcome.medal, finished: outcome.finished, round: championship.round };
    ui.showResults(results, info);
  } else {
    ui.showResults(results, info);
  }
  if (results.total >= state.best[mode] && results.total > 0) showToast(t('newRecord'), '#ffd166');
  AUDIO.sfx.win();
}

function pause() {
  if (!running || paused) return;
  paused = true;
  ui.showPause();
}

function resume() {
  if (!running || !paused) return;
  paused = false;
  startTime = performance.now() - elapsed;
  lastFrame = 0;
  ui.hideOverlays();
}

function quit() {
  running = false;
  paused = false;
  ui.showOverlay('startOverlay');
}

function frame(now) {
  requestAnimationFrame(frame);
  if (!lastFrame) lastFrame = now;
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  if (running && !paused) {
    elapsed = performance.now() - startTime;
    if (toastTimer > 0) toastTimer -= dt * 1000;
    const finished = engine.update(dt, elapsed);
    if (finished === 'finished') finishRun();
  }
  renderer.draw({
    engine, elapsed, running, paused, mode, difficulty: state.difficulty,
    totalMs, lang: state.lang, toast: toastText, toastTimer, toastColor
  });
}

function onTap(x, y) {
  if (!running || paused) return;
  AUDIO.resume();
  if (x !== undefined && y !== undefined && engine.correctAt(x, y)) return;
  engine.tap(elapsed);
}

function setupInput() {
  canvas.addEventListener('pointerdown', e => {
    const rect = canvas.getBoundingClientRect();
    onTap(e.clientX - rect.left, e.clientY - rect.top);
    e.preventDefault();
  });
  document.addEventListener('keydown', e => {
    if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); if (paused) resume(); else onTap(); }
    else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      e.preventDefault();
      if (paused) resume(); else pause();
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && running && !paused) pause(); });
}

function boot() {
  ui.init({
    onPractice: startPractice,
    onChampionship: startChampionship,
    onResume: resume,
    onRestart: startRun,
    onQuit: quit,
    onNextRound: nextRound,
    onSound: value => AUDIO.setSound(value)
  });
  setupInput();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  requestAnimationFrame(frame);
}

boot();
