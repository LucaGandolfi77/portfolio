/* Nail Art AR — bootstrap, state machine and main loop */

import { Design } from './design.js';
import { Viewport, smoothHands, handFacing } from './geometry.js';
import { HandTracker } from './tracker.js';
import { NailRenderer } from './nail-renderer.js';
import { UI } from './ui.js';

const video = document.getElementById('input-video');
const arCanvas = document.getElementById('ar-canvas');
const previewCanvas = document.getElementById('preview-canvas');

let state = 'idle';
let tracker = null;
let raf = 0;
let previousHands = new Map();
let debugOn = false;

const design = new Design();
const ui = new UI({
  onStart: start,
  onRetry: start,
  onStop: stop,
  onScreenshot: screenshot,
  onDebug: toggleDebug,
  onPreset: id => design.applyPreset(id),
  onDesign: patch => design.set(patch)
});

const previewRenderer = new NailRenderer(previewCanvas, design);
const vp = new Viewport(arCanvas, video);
const arRenderer = new NailRenderer(arCanvas, design);

design.onChange = () => {
  previewRenderer.renderPreview();
  ui.syncControls(design);
};

ui.init(design);
resizeAll();

function resizeAll() {
  const box = previewCanvas.parentElement;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  previewRenderer.resize(box.clientWidth || 300, box.clientHeight || 170, dpr);
  vp.resize();
  arRenderer.resize(vp.w, vp.h, vp.dpr);
  previewRenderer.renderPreview();
}

async function start() {
  if (state !== 'idle' && state !== 'error') return;
  state = 'loading';
  ui.showScreen('loading');
  ui.setLoading('model');
  tracker = new HandTracker(video, stage => ui.setLoading(stage));

  try {
    await tracker.init();
    await tracker.start();
  } catch (err) {
    console.error('[Nails] startup failed', err);
    if (tracker) tracker.stop();
    tracker = null;
    state = 'error';
    ui.setError(String(err));
    ui.setRunning(false);
    ui.showScreen('error');
    return;
  }

  previousHands = new Map();
  resizeAll();
  state = 'running';
  ui.setRunning(true);
  ui.showScreen('none');
  ui.setStatus(0);
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(loop);
}

function loop(now) {
  if (state !== 'running') return;
  raf = requestAnimationFrame(loop);

  const result = tracker.detect(now);
  const labels = (result.handedness || []).map((h, i) => (h && h[0] && h[0].categoryName) || ('hand' + i));
  previousHands = smoothHands(previousHands, result.landmarks || [], labels, 0.55);

  const hands = [];
  previousHands.forEach((landmarks, label) => {
    hands.push({
      label,
      facing: handFacing(landmarks, [{ categoryName: label }]),
      points: landmarks.map(p => vp.toScreen(p))
    });
  });

  arRenderer.renderHands(hands, debugOn);
  ui.setStatus(hands.length);
}

function stop() {
  cancelAnimationFrame(raf);
  if (tracker) { tracker.stop(); tracker = null; }
  previousHands = new Map();
  arRenderer.clear();
  state = 'idle';
  ui.setRunning(false);
  ui.showScreen('placeholder');
}

function toggleDebug() {
  debugOn = !debugOn;
  ui.setDebug(debugOn);
}

function screenshot() {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh || state !== 'running') {
    ui.toast(ui.t('shotFail'));
    return;
  }
  try {
    const out = document.createElement('canvas');
    out.width = vw;
    out.height = vh;
    const ctx = out.getContext('2d');

    // video element is mirrored by CSS: reproduce that mirror in the export
    ctx.save();
    ctx.translate(vw, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, vw, vh);
    ctx.restore();

    // the overlay is drawn in cover-mapped display pixels: crop the video region
    const map = vp.mapping;
    const d = vp.dpr;
    ctx.drawImage(
      arCanvas,
      map.startX * d, map.startY * d, map.drawWidth * d, map.drawHeight * d,
      0, 0, vw, vh
    );

    const link = document.createElement('a');
    link.download = 'nail-art-ar.png';
    link.href = out.toDataURL('image/png');
    link.click();
    ui.toast(ui.t('shotSaved'));
  } catch (e) {
    console.error('[Nails] screenshot failed', e);
    ui.toast(ui.t('shotFail'));
  }
}

window.addEventListener('resize', resizeAll);
window.addEventListener('orientationchange', () => setTimeout(resizeAll, 150));
window.addEventListener('keydown', e => {
  if (e.target && /INPUT|SELECT|TEXTAREA/i.test(e.target.tagName)) return;
  if (e.code === 'Enter' && (state === 'idle' || state === 'error')) start();
  else if (e.code === 'Escape' && state === 'running') stop();
});
