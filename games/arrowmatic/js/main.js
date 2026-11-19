/* Arrowmatic — bootstrap, input and main loop */

import { G, SV, save } from './state.js';
import { initCanvas, resize, render } from './render.js';
import { AU } from './audio.js';
import { newRun, update, endRun, afterDraft } from './game.js';
import {
  initUI, setDraftDone, showScreen, refreshHub, maybeOnboarding,
  releaseJoy, applySettingsUI
} from './ui.js';
import { t } from './i18n.js';

let lastT = performance.now();

function startGame() {
  AU.resume();
  newRun();
  showScreen(null);
  document.getElementById('hud').classList.add('on');
  G.paused = false;
  lastT = performance.now();
}

function togglePause() {
  if (G.SCR === 'run' && !G.paused) {
    G.paused = true;
    releaseJoy();
    G.SCR = 'pause';
    showScreen('scrPause');
  } else if (G.SCR === 'pause') {
    G.paused = false;
    G.SCR = 'run';
    showScreen(null);
    lastT = performance.now();
  }
}

function goHome() {
  releaseJoy();
  G.SCR = 'title';
  G.paused = false;
  G.P = null;
  G.enemies = [];
  G.bullets = [];
  G.ebullets = [];
  G.drops = [];
  G.bossRef = null;
  document.getElementById('hud').classList.remove('on');
  document.getElementById('bosswrap').classList.remove('on');
  showScreen('scrTitle');
  refreshHub();
}

function confirmQuit() {
  if (G.SCR !== 'pause') return;
  const button = document.getElementById('pQuit');
  if (!button.dataset.armed) {
    button.dataset.armed = '1';
    button.textContent = '🤔 ' + t('quitConfirm');
    setTimeout(() => {
      delete button.dataset.armed;
      button.innerHTML = '🏳 <span data-i18n="quit">MOLLA TUTTO</span>';
    }, 2400);
    return;
  }
  delete button.dataset.armed;
  endRun(false);
}

function initInput() {
  const cv = document.getElementById('cv');
  cv.addEventListener('pointerdown', e => {
    AU.resume();
    if (G.SCR !== 'run' || G.paused) return;
    G.joy.on = true;
    G.joy.id = e.pointerId;
    G.joy.ox = e.clientX;
    G.joy.oy = e.clientY;
    G.joy.dx = 0;
    G.joy.dy = 0;
  });
  cv.addEventListener('pointermove', e => {
    if (!G.joy.on || e.pointerId !== G.joy.id) return;
    let dx = e.clientX - G.joy.ox;
    let dy = e.clientY - G.joy.oy;
    const mag = Math.hypot(dx, dy);
    const max = 52;
    if (mag > max) { dx = dx / mag * max; dy = dy / mag * max; }
    G.joy.dx = dx / max;
    G.joy.dy = dy / max;
  });
  const up = e => { if (G.joy.on && e.pointerId === G.joy.id) releaseJoy(); };
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);

  window.addEventListener('keydown', e => {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    G.keys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    if (e.code === 'Escape' || e.code === 'KeyP') togglePause();
  });
  window.addEventListener('keyup', e => { G.keys[e.code] = false; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && G.SCR === 'run' && !G.paused) togglePause();
  });
}

function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.04, (now - lastT) / 1000 || 0.016);
  lastT = now;
  try {
    if (G.SCR === 'run' && !G.paused && G.P) update(dt);
    if (G.P) render();
  } catch (error) {
    console.error('[Arrowmatic] loop error', error);
    if (G.SCR === 'run') {
      G.paused = true;
      G.SCR = 'pause';
      showScreen('scrPause');
    }
  }
}

function boot() {
  initCanvas(document.getElementById('cv'));
  window.addEventListener('resize', resize);
  document.addEventListener('pointerdown', () => AU.resume(), { passive: true });

  initUI({
    onPlay: () => maybeOnboarding(startGame),
    onPause: togglePause,
    onResume: togglePause,
    onQuit: confirmQuit,
    onHome: goHome,
    onLang: () => applySettingsUI()
  });
  setDraftDone(afterDraft);

  initInput();
  lastT = performance.now();
  requestAnimationFrame(loop);
}

boot();
