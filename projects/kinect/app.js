/* Kinetic — bootstrap, state machine and main loop */

import { Viewport } from './geometry.js';
import { UI } from './ui.js';
import { HandTracker } from './tracker.js';
import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { Sfx } from './audio.js';

const video = document.getElementById('video');
const canvas = document.getElementById('game-canvas');

let state = 'idle';
let raf = 0;
let last = 0;
let tracker = null;
let hands = [];
let best = 0;
try { best = Number(localStorage.getItem('kinect_best') || 0) || 0; } catch (e) { /* ignore */ }

const ui = new UI({
  onStart: () => startGame(),
  onRetry: () => startGame(),
  onRestart: () => startGame(true),
  onResume: resume,
  onPause: togglePause,
  onSound: toggleSound
});
ui.init();
ui.setBest(best);
ui.setSound(false);

const vp = new Viewport(canvas, video);
const renderer = new Renderer(vp);
const sfx = new Sfx();
const game = new Game({
  onHit: (points, x, y, hue, multiplier) => {
    ui.bumpScore();
    ui.flash();
    sfx.hit(multiplier);
    if (navigator.vibrate) navigator.vibrate(35);
  },
  onMiss: () => sfx.miss(),
  onCombo: (multiplier) => sfx.combo(multiplier),
  onLevel: (level) => ui.toast(ui.t('level') + ' ' + level),
  onEnd: () => endGame()
});

function setState(next) {
  state = next;
  document.body.dataset.state = next;
}

async function startGame(force = false) {
  if (state === 'loading' || (state === 'playing' && !force)) return;
  cancelAnimationFrame(raf);
  if (tracker) { tracker.stop(); tracker = null; }
  hands = [];
  game.reset();
  sfx.init();
  ui.resetSteps();
  ui.showScreen('loading');
  setState('loading');

  tracker = new HandTracker(video, (name, step) => ui.setStep(name, step));
  try {
    await tracker.init();
    await tracker.start();
  } catch (err) {
    console.error('[Kinetic] startup failed', err);
    tracker.stop();
    tracker = null;
    ui.setError(String(err));
    ui.showScreen('error');
    setState('error');
    return;
  }

  vp.resize();
  ui.showScreen('none');
  ui.setPaused(false);
  ui.setHandHint(true);
  sfx.start();
  setState('playing');
  last = performance.now();
  raf = requestAnimationFrame(loop);
}

function loop(now) {
  if (state !== 'playing' && state !== 'paused') return;
  raf = requestAnimationFrame(loop);
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;

  if (state === 'playing') {
    hands = tracker ? tracker.detect(now) : [];
    const projected = vp.projectAll(hands);
    game.update(dt, projected, vp, now);
    ui.updateHUD(game);
    ui.setHandHint(projected.length === 0);
    renderer.draw(game, projected, now);
  } else {
    renderer.draw(game, [], now);
  }
}

function togglePause() {
  if (state === 'playing') pause();
  else if (state === 'paused') resume();
}

function pause() {
  if (state !== 'playing') return;
  setState('paused');
  ui.showPause(game);
  ui.setPaused(true);
  ui.toast(ui.t('toastPaused'));
}

function resume() {
  if (state !== 'paused') return;
  ui.showScreen('none');
  ui.setPaused(false);
  ui.toast(ui.t('toastResumed'));
  setState('playing');
  last = performance.now();
}

function endGame() {
  cancelAnimationFrame(raf);
  if (tracker) { tracker.stop(); tracker = null; }
  hands = [];
  sfx.over();
  if (game.score > best) {
    best = game.score;
    try { localStorage.setItem('kinect_best', String(best)); } catch (e) { /* ignore */ }
    ui.setBest(best);
    ui.toast(ui.t('newBest'));
  }
  ui.showResult(game, best);
  setState('over');
}

function toggleSound() {
  const muted = sfx.toggle();
  ui.setSound(muted);
  ui.toast(ui.t(muted ? 'toastMuted' : 'toastUnmuted'));
}

window.addEventListener('keydown', (e) => {
  if (e.target && /INPUT|SELECT|TEXTAREA/i.test(e.target.tagName)) return;
  if (e.code === 'Enter' && ['idle', 'error', 'over'].includes(state)) {
    e.preventDefault();
    startGame();
  } else if (e.code === 'Space') {
    e.preventDefault();
    togglePause();
  } else if (e.key === 'r' || e.key === 'R') {
    if (state !== 'loading') startGame(true);
  } else if (e.key === 'm' || e.key === 'M') {
    toggleSound();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && state === 'playing') pause();
});

window.addEventListener('resize', () => vp.resize());
window.addEventListener('orientationchange', () => setTimeout(() => vp.resize(), 150));

ui.showScreen('start');
setState('idle');
