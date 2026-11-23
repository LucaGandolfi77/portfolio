/* Kinetic — bootstrap and main loop */

import { I18n } from './i18n.js';
import { UI } from './ui.js';
import { HandTracker } from './tracker.js';
import { Viewport } from './geometry.js';
import { RendererFallback } from './renderer.js';
import { Game } from './game.js';
import { Sfx } from './audio.js';
import { LandmarkSmoother, GestureDebouncer } from './filters.js';

const i18n = new I18n();
const sfx = new Sfx();
const video = document.getElementById('video');
const canvas = document.getElementById('game');
const vp = new Viewport(canvas, video);
const smoother = new LandmarkSmoother();
const debouncer = new GestureDebouncer();

let renderer = null;
let game = null;
let tracker = null;
let ui = null;
let state = 'idle';
let raf = 0;
let last = 0;
let lastHud = 0;
let touchPos = null;
let quality = 'high';
let best = 0;

const options = () => (ui ? ui.options() : { mode: 'classic', difficulty: 'normal', input: 'camera' });

function bestKey(mode) { return mode === 'classic' ? 'kinect_best' : `kinect_best_${mode}`; }

function loadBest(mode) {
  try { return Number(localStorage.getItem(bestKey(mode)) || localStorage.getItem('kinect_best') || 0) || 0; }
  catch (e) { return 0; }
}

function saveBest(mode, score) {
  try {
    localStorage.setItem(bestKey(mode), String(score));
    if (score > loadBest('classic')) localStorage.setItem('kinect_best', String(score));
  } catch (e) { /* storage optional */ }
}

function sizeCanvas() {
  const dims = vp.resize();
  if (quality === 'low') dims.dpr = 1;
  if (renderer) renderer.resize(dims.w, dims.h, dims.dpr);
}

function cleanUp() {
  cancelAnimationFrame(raf);
  if (tracker) { tracker.stop(); tracker = null; }
  touchPos = null;
  smoother.reset();
  debouncer.reset();
}

async function startGame() {
  if (state === 'loading' || (state === 'playing' && !game?.ended)) return;
  cleanUp();
  const opts = options();
  sfx.init();
  ui.resetSteps();
  ui.showScreen('loading');
  state = 'loading';

  game = new Game({
    onHit: (points, mult) => { sfx.hit(mult); if (navigator.vibrate) navigator.vibrate(25); },
    onCombo: mult => { sfx.combo(mult); ui.toast(`×${mult} COMBO`); },
    onMiss: () => sfx.miss(),
    onPower: () => sfx.power(),
    onEnd: summary => {
      const value = Math.max(loadBest(opts.mode), summary.score);
      saveBest(opts.mode, value);
      best = value;
      ui.setBest(value);
      ui.showSummary(game, value);
      sfx.over();
      cancelAnimationFrame(raf);
      state = 'over';
      ui.showScreen('over');
    }
  });
  game.reset(opts.mode, opts.difficulty);
  best = loadBest(opts.mode);
  ui.setBest(best);
  sizeCanvas();

  if (!renderer) renderer = new RendererFallback(canvas, { dpr: vp.dpr });
  renderer.resize(vp.w, vp.h, quality === 'low' ? 1 : vp.dpr);

  if (opts.input === 'camera') {
    tracker = new HandTracker(video, (step, status) => ui.setStep(step, status));
    try {
      await tracker.startCamera();
      await tracker.loadModel();
    } catch (err) {
      console.warn('[Kinetic] startup failed', err);
      cleanUp();
      ui.setError(String(err));
      state = 'error';
      ui.showScreen('error');
      return;
    }
    ui.setStep('calibration', 'done');
  } else {
    ui.setStep('camera', 'done');
    ui.setStep('model', 'done');
    ui.setStep('calibration', 'done');
  }

  state = 'playing';
  ui.showScreen('none');
  ui.setHandHint(opts.input === 'camera');
  sfx.start();
  last = performance.now();
  lastHud = 0;
  raf = requestAnimationFrame(loop);
}

function loop(now) {
  if (state !== 'playing') return;
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;

  let hands = tracker ? tracker.detect(now) : [];
  if (!tracker && touchPos) {
    const pts = Array.from({ length: 21 }, () => ({ x: touchPos.x, y: touchPos.y }));
    hands = [{ points: pts, gesture: 'Open_Palm', gestureScore: 1 }];
  }
  hands = smoother.filter(hands, dt);
  hands = hands.map(hand => {
    hand.stableGesture = debouncer.update(hand.gesture, hand.gestureScore, now);
    return hand;
  });

  const projected = tracker ? vp.projectAll(hands) : hands;
  game.update(dt, projected, vp, now);

  for (const p of game.popups) {
    if (!p.emitted) { p.emitted = true; ui.popup(p.text, p.x, p.y, p.hue); }
  }
  renderer.draw(game, projected, now);
  if (now - lastHud > 100) { ui.updateHUD(game); lastHud = now; }
  ui.setOrientation(window.innerHeight > window.innerWidth && window.innerWidth < 380);
  raf = requestAnimationFrame(loop);
}

function pauseGame() {
  if (state !== 'playing') return;
  cancelAnimationFrame(raf);
  state = 'paused';
  ui.showScreen('pause');
}

function resumeGame() {
  if (state !== 'paused') return;
  state = 'playing';
  ui.showScreen('none');
  last = performance.now();
  raf = requestAnimationFrame(loop);
}

async function init() {
  await i18n.init();
  ui = new UI({
    onStart: startGame,
    onRetry: startGame,
    onRestart: () => { ui.showScreen('start'); state = 'idle'; cleanUp(); },
    onResume: resumeGame,
    onPause: pauseGame,
    onSound: () => ui.setSound(sfx.toggle()),
    onMirror: checked => {
      vp.mirror = checked;
      video.style.transform = checked ? 'scaleX(-1)' : 'none';
    },
    onSensitivity: value => {
      smoother.hands.forEach(hand => hand.forEach(f => { f.beta = 0.006 + value * 0.035; }));
    },
    onQuality: value => { quality = value; sizeCanvas(); }
  }, i18n);
  ui.init();
  ui.setBest(loadBest('classic'));
  ui.setSound(sfx.muted);
  ui.showScreen('start');
  sizeCanvas();
  renderer = new RendererFallback(canvas, { dpr: vp.dpr });
  renderer.resize(vp.w, vp.h, vp.dpr);

  const stage = document.getElementById('stage');
  const pointer = e => {
    if (state !== 'playing' || options().input !== 'touch') return;
    touchPos = { x: e.clientX, y: e.clientY };
  };
  stage.addEventListener('pointerdown', pointer);
  stage.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') pointer(e); });

  window.addEventListener('resize', sizeCanvas);
  window.addEventListener('orientationchange', () => setTimeout(sizeCanvas, 150));
  document.addEventListener('visibilitychange', async () => {
    if (document.hidden) {
      if (state === 'playing') pauseGame();
      if (tracker) tracker.stopCamera();
    } else if (state === 'paused' && tracker) {
      try { await tracker.startCamera(); } catch (e) { /* user can retry */ }
    }
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Enter' && ['idle', 'error', 'over'].includes(state)) startGame();
    else if (e.code === 'Space') { e.preventDefault(); state === 'playing' ? pauseGame() : resumeGame(); }
    else if (e.key.toLowerCase() === 'r') startGame();
    else if (e.key.toLowerCase() === 'm') ui.setSound(sfx.toggle());
    else if (e.key === 'Escape') ui.toggleSettings(false);
  });
}

init();
