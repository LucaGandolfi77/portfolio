/**
 * main.js — Smile Detection: camera, MediaPipe, ViT FER e UI liquid glass.
 */

import { FaceTracker } from './face.js';
import { createEmotionClient } from './emotion.js';
import { fuseSmile, ema, clamp01, overallScore } from './fusion.js';
import { mouthBox, analyzeTeeth } from './teeth.js';
import { loadState, updateBest } from './storage.js';
import { initLang, getLang, setLang, t, applyStatic, onLanguageChange } from './i18n.js';
import { setPill, toast, renderScore, renderEmotions, renderTeeth, renderBest } from './ui.js';

const $ = (id) => document.getElementById(id);
const state = {
  running: false,
  stream: null,
  tracker: null,
  emotion: null,
  facing: 'user',
  labels: [],
  probabilities: [],
  display: 0,
  lastEmotion: 0,
  lastTeeth: 0,
  lastFrame: 0,
  teeth: { whiteness: 0, alignment: 0, active: false },
  best: loadState().best
};

const frameCanvas = document.createElement('canvas');
frameCanvas.width = 320;
frameCanvas.height = 240;
const frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true });

function setLoading(text, visible = true) {
  $('loading').textContent = text;
  $('loading').classList.toggle('on', visible);
}

async function start() {
  if (state.running) return;
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: state.facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    $('video').srcObject = state.stream;
    await $('video').play();
    $('video').classList.toggle('mirror', state.facing === 'user');
    $('overlayCanvas').classList.toggle('mirror', state.facing === 'user');
    $('viewfinder').classList.add('ready');
    setPill('cameraPill', t('status.camera') + ' ●', 'ok');
    setLoading(t('status.landmarks'));
  } catch (error) {
    toast(t('msg.noCamera') + ': ' + error.message);
    return;
  }

  $('startBtn').textContent = t('action.stop');
  state.running = true;

  if (!state.tracker) {
    try { state.tracker = await FaceTracker.create((kind) => setPill('modelPill', t('status.' + (kind === 'loading' ? 'modelLoading' : 'modelReady')), kind === 'ready' ? 'ok' : '')); }
    catch (error) { toast(error.message); setPill('modelPill', t('status.modelError'), 'error'); }
  }
  if (!state.emotion) {
    state.emotion = createEmotionClient({
      onStatus: (kind) => setPill('modelPill', t('status.model' + (kind === 'deviceFailed' || kind === 'error' ? 'Error' : kind[0].toUpperCase() + kind.slice(1))), kind === 'ready' ? 'ok' : kind === 'error' || kind === 'deviceFailed' ? 'error' : ''),
      onProgress: () => {}
    });
    state.emotion.load();
  }
  requestAnimationFrame(loop);
}

function stop() {
  state.running = false;
  if (state.stream) state.stream.getTracks().forEach((track) => track.stop());
  state.stream = null;
  $('video').srcObject = null;
  $('viewfinder').classList.remove('ready');
  $('startBtn').textContent = t('action.start');
  setPill('cameraPill', t('status.camera'));
  setPill('facePill', t('status.searching'));
  setLoading('', false);
  $('overlayCanvas').getContext('2d').clearRect(0, 0, $('overlayCanvas').width, $('overlayCanvas').height);
}

function loop(now) {
  if (!state.running) return;
  requestAnimationFrame(loop);
  if (now - state.lastFrame < 33) return;
  state.lastFrame = now;

  const video = $('video');
  const face = state.tracker && state.tracker.analyze(video);
  const overlay = $('overlayCanvas');
  if (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight) {
    overlay.width = video.videoWidth || 640;
    overlay.height = video.videoHeight || 480;
  }
  if (!face) {
    setPill('facePill', t('status.searching'));
    overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height);
    return;
  }
  setPill('facePill', t('status.landmarks'), 'ok');
  setLoading('', false);
  state.tracker.drawOverlay(overlay.getContext('2d'), face.landmarks, overlay.width, overlay.height);

  const blend = clamp01(Math.max(face.blend.mouthSmileLeft || 0, face.blend.mouthSmileRight || 0) * 0.9 + (face.blend.jawOpen || 0) * 0.35);
  const quality = clamp01((face.box.w * face.box.h) / 0.18);
  const happy = state.labels.length ? (state.probabilities[state.labels.indexOf('happy')] || 0) : blend;

  if (state.emotion && state.emotion.ready && !state.emotion.busy && now - state.lastEmotion > 550) {
    state.lastEmotion = now;
    state.emotion.classify(face.cropUrl).then((result) => {
      if (!result) return;
      state.labels = result.labels;
      state.probabilities = result.probabilities;
      renderEmotions(result.labels, result.probabilities);
    });
  }

  if (now - state.lastTeeth > 220 && (face.blend.jawOpen || 0) > 0.03) {
    state.lastTeeth = now;
    frameCtx.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);
    const box = mouthBox(face.landmarks, frameCanvas.width, frameCanvas.height);
    if (box) {
      const width = Math.max(1, Math.round(box.w));
      const height = Math.max(1, Math.round(box.h));
      const x = Math.max(0, Math.min(frameCanvas.width - 1, Math.round(box.x)));
      const y = Math.max(0, Math.min(frameCanvas.height - 1, Math.round(box.y)));
      const pixels = frameCtx.getImageData(x, y, Math.min(width, frameCanvas.width - x), Math.min(height, frameCanvas.height - y)).data;
      const sampleWidth = Math.min(width, frameCanvas.width - x);
      const sampleHeight = Math.min(height, frameCanvas.height - y);
      state.teeth = { ...analyzeTeeth(pixels, sampleWidth, sampleHeight), active: true };
      renderTeeth(state.teeth);
    }
  } else if (now - state.lastTeeth > 900) {
    state.teeth.active = false;
    renderTeeth(state.teeth);
  }

  const fused = fuseSmile({
    blendSmile: blend,
    happy,
    probabilities: state.probabilities,
    weight: 0.45,
    quality
  });
  state.display = ema(state.display, fused.score, 0.22);
  renderScore(state.display, fused.confidence, fused.band, fused.ambiguous);
  const overall = overallScore(state.display, state.teeth.whiteness || 0, state.teeth.alignment || 0, face.blend.jawOpen || 0);
  if (fused.confidence > 0.45 && (!state.best || overall > state.best.score)) {
    state.best = updateBest(overall, { smile: state.display, whiteness: state.teeth.whiteness || 0, alignment: state.teeth.alignment || 0 }).best;
    renderBest(state.best);
  }
}

function snapshot() {
  const video = $('video');
  if (!state.stream || video.readyState < 2) return;
  const canvas = document.createElement('canvas');
  canvas.width = 1280; canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (state.facing === 'user') { ctx.translate(1280, 0); ctx.scale(-1, 1); }
  ctx.drawImage(video, 0, 0, 1280, 720);
  ctx.drawImage($('overlayCanvas'), 0, 0, 1280, 720);
  ctx.fillStyle = 'rgba(8,10,24,.72)';
  ctx.fillRect(0, 620, 1280, 100);
  ctx.fillStyle = '#eef2ff';
  ctx.font = '700 54px Georgia, serif';
  ctx.fillText(Math.round(state.display * 100) + '%', 30, 690);
  ctx.font = '22px system-ui';
  ctx.fillText(t('section.score') + ' · ' + new Date().toLocaleTimeString(), 180, 682);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/jpeg', 0.92);
  link.download = 'smile-' + Date.now() + '.jpg';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => link.remove(), 500);
  toast(t('msg.saved'));
}

function refreshTexts() {
  applyStatic(document);
  $('btnLang').textContent = getLang() === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  $('startBtn').textContent = state.running ? t('action.stop') : t('action.start');
  setPill('cameraPill', state.running ? t('status.camera') + ' ●' : t('status.camera'));
  setPill('facePill', t('status.searching'));
  renderBest(state.best);
}

function init() {
  initLang();
  applyStatic(document);
  $('btnLang').addEventListener('click', () => setLang(getLang() === 'it' ? 'en' : 'it'));
  $('startBtn').addEventListener('click', () => state.running ? stop() : start());
  $('btnSnapshot').addEventListener('click', snapshot);
  $('btnSwitch').addEventListener('click', async () => {
    state.facing = state.facing === 'user' ? 'environment' : 'user';
    if (state.running) { stop(); await start(); }
  });
  onLanguageChange(refreshTexts);
  refreshTexts();
  renderBest(state.best);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  window.__SMILE__ = { state, start, stop, snapshot };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
