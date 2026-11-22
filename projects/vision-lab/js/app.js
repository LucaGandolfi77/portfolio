/**
 * app.js — Vision Lab: camera, FaceLandmarker, mesh e smile analysis.
 * Il modello MediaPipe è locale; nessun frame lascia il dispositivo.
 */

import {
  EMOTION_EMOJI,
  analyzeTeethPixels,
  clamp,
  faceMetrics,
  mouthBox,
  smileResult
} from './vision.js';
import { clearBest, loadBest, loadSettings, saveBest, saveSettings } from './storage.js';
import {
  applyStatic,
  emotionLabel,
  formatDateTime,
  getLang,
  initLang,
  setLang,
  t
} from './i18n.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const ICONS = {
  camera:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="4"/></svg>',
  switch:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 7h-4a4 4 0 0 0-4 4v2a4 4 0 0 1-4 4H4"/><path d="m7 4-3 3 3 3M17 14l3 3-3 3"/><circle cx="12" cy="12" r="2.2"/></svg>',
  mirror:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18"/><path d="M8 7 4 12l4 5V7zM16 7l4 5-4 5V7z"/></svg>',
  snapshot:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="4"/></svg>',
  fullscreen:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/></svg>',
  scan:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M8 10c1.2-1.4 2.5-2 4-2s2.8.6 4 2M8 14c1.2 1.4 2.5 2 4 2s2.8-.6 4-2"/><circle cx="9" cy="11.5" r=".6" fill="currentColor"/><circle cx="15" cy="11.5" r=".6" fill="currentColor"/></svg>',
  eye:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  smile:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2.6 4 2.6 4-2.6 4-2.6M9 9.5h.01M15 9.5h.01"/></svg>',
  brow:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 9c3-2.4 6-3 9-3s6 .6 9 3M3 15c3-1.6 6-2 9-2s6 .4 9 2"/></svg>',
  sun:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  align:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/><circle cx="18" cy="17" r="1" fill="currentColor"/></svg>',
  reset:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  alert:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 21h20L12 3z"/><path d="M12 9v5M12 17h.01"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'
};

const state = {
  settings: loadSettings(),
  mode: 'mesh',
  mesh: 'soft',
  mirror: true,
  facing: 'user',
  running: false,
  starting: false,
  cameraStatus: 'idle',
  modelStatus: 'idle',
  faces: 0,
  stream: null,
  landmarker: null,
  modelPromise: null,
  drawing: null,
  sets: null,
  video: null,
  canvas: null,
  ctx: null,
  cropCanvas: null,
  cropCtx: null,
  raf: 0,
  lastDetect: 0,
  lastDetectAt: 0,
  lastUi: 0,
  lastBlink: 0,
  blinkCount: 0,
  fps: 0,
  metrics: null,
  smile: null,
  box: null,
  display: { blink: 0, smile: 0, brow: 0, overall: 0, whiteness: 0, alignment: 0 },
  pose: { yaw: 0, pitch: 0, roll: 0 },
  best: null,
  lastRecordToast: 0,
  errorKey: '',
  errorAction: '',
  stageMessage: ''
};

let toastTimer = 0;

/* -------------------------------------------------------------------------- */
/* Utility                                                                    */
/* -------------------------------------------------------------------------- */

function icon(name) {
  return ICONS[name] || ICONS.scan;
}

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((node) => {
    node.innerHTML = icon(node.dataset.icon);
  });
}

function toast(message) {
  if (!message) return;
  if (window.ProjectShell && typeof window.ProjectShell.toast === 'function') {
    window.ProjectShell.toast(message);
    return;
  }
  let node = $('.pf-toast');
  if (!node) {
    node = document.createElement('div');
    node.className = 'pf-toast';
    node.setAttribute('role', 'status');
    node.setAttribute('aria-live', 'polite');
    document.body.append(node);
  }
  node.textContent = message;
  node.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('is-visible'), 2200);
}

function setBar(id, value) {
  const bar = document.getElementById(id);
  if (bar) bar.style.width = `${clamp(Math.round(value), 0, 100)}%`;
}

function clampPercent(value) {
  return clamp(Math.round(Number(value) || 0), 0, 100);
}

function round(value) {
  return Math.round(Number(value) || 0);
}

function smooth(current, next, alpha = 0.28) {
  return current * (1 - alpha) + next * alpha;
}

/* -------------------------------------------------------------------------- */
/* Stato UI                                                                   */
/* -------------------------------------------------------------------------- */

function setCameraStatus(status) {
  state.cameraStatus = status;
  const badge = $('#cameraStatus');
  if (!badge) return;
  badge.dataset.state = status;
  badge.textContent = t(
    status === 'starting'
      ? 'cameraStarting'
      : status === 'running'
        ? 'cameraReady'
        : status === 'error'
          ? 'cameraError'
          : 'cameraIdle'
  );
}

function setModelStatus(status) {
  state.modelStatus = status;
  const badge = $('#modelStatus');
  if (!badge) return;
  badge.dataset.state = status;
  badge.textContent = t(
    status === 'loading'
      ? 'modelLoading'
      : status === 'ready'
        ? 'modelReady'
        : status === 'error'
          ? 'modelError'
          : 'onDevice'
  );
}

function setStageMessage(message) {
  state.stageMessage = message || '';
  const node = $('#stageMessage');
  if (!node) return;
  node.hidden = !state.stageMessage;
  node.textContent = state.stageMessage;
}

function setError(key, action) {
  state.errorKey = key || '';
  state.errorAction = action || 'camera';
  const box = $('#errorBox');
  const text = $('#errorText');
  const retry = $('#errorRetry');
  if (!box) return;
  box.hidden = !state.errorKey;
  if (text) text.textContent = state.errorKey ? t(state.errorKey) : '';
  if (retry) retry.textContent = t(state.errorAction === 'model' ? 'modelRetry' : 'cameraRetry');
}

function clearError() {
  setError('', 'camera');
}

function applyMirror() {
  const video = state.video;
  const canvas = state.canvas;
  if (video) video.classList.toggle('is-mirrored', state.mirror);
  if (canvas) canvas.classList.toggle('is-mirrored', state.mirror);
  const button = $('#mirrorToggle');
  if (button) button.setAttribute('aria-pressed', String(state.mirror));
}

function updateModeUi() {
  for (const button of $$('#modeSwitch [data-mode]')) {
    button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode));
  }
  const meshPanel = $('#meshPanel');
  const smilePanel = $('#smilePanel');
  if (meshPanel) meshPanel.hidden = state.mode !== 'mesh';
  if (smilePanel) smilePanel.hidden = state.mode !== 'smile';
  const app = $('#app');
  if (app) app.dataset.mode = state.mode;
  const stageTitle = $('#stageTitle');
  if (stageTitle) stageTitle.textContent = t(state.mode === 'smile' ? 'smileTitle' : 'meshTitle');
}

function updateMeshUi() {
  for (const button of $$('#meshSwitch [data-mesh]')) {
    button.setAttribute('aria-pressed', String(button.dataset.mesh === state.mesh));
  }
}

function setMode(mode, options = {}) {
  state.mode = mode === 'smile' ? 'smile' : 'mesh';
  state.settings.mode = state.mode;
  saveSettings(state.settings);
  updateModeUi();
  clearOverlay();
  state.lastUi = 0;
  updateUi(true);
  if (!options.silent && location.hash !== '#' + state.mode) {
    history.replaceState(null, '', '#' + state.mode);
  }
}

function setMeshStyle(style) {
  state.mesh = ['off', 'soft', 'full'].includes(style) ? style : 'soft';
  state.settings.mesh = state.mesh;
  saveSettings(state.settings);
  updateMeshUi();
  if (!state.running) clearOverlay();
}

function updateBest(smile) {
  if (!smile || smile.overall <= 0) return;
  if (state.best && state.best.score >= smile.overall) return;
  const result = saveBest({
    score: smile.overall,
    smile: smile.smile,
    whiteness: smile.whiteness,
    alignment: smile.alignment,
    at: Date.now()
  });
  if (result.record) {
    state.best = result.best;
    renderBest();
    const now = Date.now();
    if (now - state.lastRecordToast > 8000) {
      state.lastRecordToast = now;
      toast(t('newRecord'));
    }
  }
}

function renderBest() {
  const value = $('#bestValue');
  const date = $('#bestDate');
  const reset = $('#resetBest');
  if (value) value.textContent = state.best ? `${state.best.score}/100` : '—';
  if (date) date.textContent = state.best ? t('bestAt', { date: formatDateTime(state.best.at) }) : '';
  if (reset) reset.disabled = !state.best;
}

/* -------------------------------------------------------------------------- */
/* UI numerica                                                                */
/* -------------------------------------------------------------------------- */

function updateUi(force = false) {
  const now = performance.now();
  if (!force && now - state.lastUi < 90) return;
  state.lastUi = now;

  const running = state.running;
  const faceCount = state.faces;
  const faceBadge = $('#faceStatus');
  if (faceBadge) {
    faceBadge.dataset.state = running && faceCount > 0 ? 'tracking' : 'idle';
    faceBadge.textContent = !running
      ? t('noFace')
      : faceCount === 0
        ? t('noFace')
        : faceCount === 1
          ? t('faceCountOne')
          : t('facesCount', { n: faceCount });
  }

  const faceValue = $('#faceCountValue');
  if (faceValue) faceValue.textContent = !running ? '—' : String(faceCount);
  const blinkCount = $('#blinkCountValue');
  if (blinkCount) blinkCount.textContent = String(state.blinkCount);
  const fps = state.fps >= 10 ? String(Math.round(state.fps)) : state.fps.toFixed(1);
  const fpsValue = $('#fpsValue');
  if (fpsValue) fpsValue.textContent = fps;
  const fpsBadge = $('#fpsBadge');
  if (fpsBadge) {
    fpsBadge.hidden = !running || state.fps < 0.5;
    fpsBadge.textContent = `${fps} ${t('fps')}`;
  }

  setBar('barBlink', state.display.blink * 100);
  setBar('barSmile', state.display.smile * 100);
  setBar('barBrow', state.display.brow * 100);
  const valBlink = $('#valBlink');
  const valSmile = $('#valSmile');
  const valBrow = $('#valBrow');
  if (valBlink) valBlink.textContent = `${clampPercent(state.display.blink * 100)}%`;
  if (valSmile) valSmile.textContent = `${clampPercent(state.display.smile * 100)}%`;
  if (valBrow) valBrow.textContent = `${clampPercent(state.display.brow * 100)}%`;

  const yaw = $('#poseYaw');
  const pitch = $('#posePitch');
  const roll = $('#poseRoll');
  if (yaw) yaw.textContent = `${round(state.pose.yaw)}°`;
  if (pitch) pitch.textContent = `${round(state.pose.pitch)}°`;
  if (roll) roll.textContent = `${round(state.pose.roll)}°`;
  const emotion = $('#emotionValue');
  if (emotion) emotion.textContent = emotionLabel(state.metrics ? state.metrics.emotion : 'neutral');
  const emoji = $('#emotionEmoji');
  if (emoji) emoji.textContent = EMOTION_EMOJI[state.metrics ? state.metrics.emotion : 'neutral'] || '😐';

  const smile = state.smile || { smile: 0, whiteness: 0, alignment: 0, overall: 0, stars: 1 };
  const values = [
    ['smileValue', 'smileBar', smile.smile],
    ['whitenessValue', 'whitenessBar', smile.whiteness],
    ['alignmentValue', 'alignmentBar', smile.alignment]
  ];
  for (const [valueId, barId, value] of values) {
    const node = document.getElementById(valueId);
    if (node) node.textContent = `${clampPercent(value)}%`;
    setBar(barId, value);
  }
  const overall = $('#overallValue');
  if (overall) overall.textContent = String(clampPercent(smile.overall));
  const stars = $('#overallStars');
  if (stars) {
    [...stars.children].forEach((star, index) => {
      star.classList.toggle('is-on', index < smile.stars);
    });
  }

  const smileHint = $('#smileHint');
  if (smileHint) {
    smileHint.textContent = !running
      ? t('cameraOffHint')
      : !state.metrics
        ? t('smileEmpty')
        : state.metrics.jawOpen <= 0.03
          ? t('openMouth')
          : t('teethHint');
  }

  const toggle = $('#cameraToggle');
  const toggleLabel = $('#cameraToggleLabel');
  if (toggle) toggle.disabled = state.starting;
  if (toggleLabel) toggleLabel.textContent = running ? t('cameraStop') : t('cameraStart');
  const snapshot = $('#snapshotBtn');
  if (snapshot) snapshot.disabled = !running;
}

/* -------------------------------------------------------------------------- */
/* Camera                                                                     */
/* -------------------------------------------------------------------------- */

function mapCameraError(error) {
  const name = error && error.name;
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'cameraDenied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'DevicesNotFoundError') {
    return 'cameraNotFound';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') {
    return 'cameraBusy';
  }
  return 'cameraError';
}

async function startCamera() {
  if (state.starting || state.running) return;
  clearError();
  if (!window.isSecureContext) {
    setCameraStatus('error');
    setError('cameraInsecure', 'camera');
    return;
  }
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
    setCameraStatus('error');
    setError('cameraUnsupported', 'camera');
    return;
  }

  state.starting = true;
  setCameraStatus('starting');
  setStageMessage(t('loadingCamera'));
  updateUi(true);

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: state.facing === 'environment' ? { ideal: 'environment' } : { ideal: 'user' },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
  } catch (error) {
    state.starting = false;
    setCameraStatus('error');
    setStageMessage('');
    setError(mapCameraError(error), 'camera');
    updateUi(true);
    return;
  }

  state.stream = stream;
  state.video.srcObject = stream;
  state.video.muted = true;
  state.video.setAttribute('playsinline', '');
  try {
    await state.video.play();
  } catch {
    state.starting = false;
    state.stream = null;
    for (const track of stream.getTracks()) track.stop();
    state.video.srcObject = null;
    setCameraStatus('error');
    setStageMessage('');
    setError('cameraError', 'camera');
    updateUi(true);
    return;
  }

  state.starting = false;
  state.running = true;
  state.blinkCount = 0;
  state.fps = 0;
  state.lastDetect = 0;
  state.lastDetectAt = 0;
  state.metrics = null;
  state.smile = null;
  state.box = null;
  state.faces = 0;
  state.display = { blink: 0, smile: 0, brow: 0, overall: 0, whiteness: 0, alignment: 0 };
  state.pose = { yaw: 0, pitch: 0, roll: 0 };
  $('#stage').classList.add('is-running');
  setCameraStatus('running');
  setStageMessage('');
  applyMirror();
  adjustCanvas();
  updateUi(true);
  startLoop();
  ensureModel().catch(() => {
    /* l'errore è già mostrato da ensureModel */
  });
}

function stopCamera() {
  state.running = false;
  state.starting = false;
  if (state.raf) {
    cancelAnimationFrame(state.raf);
    state.raf = 0;
  }
  if (state.stream) {
    for (const track of state.stream.getTracks()) {
      try {
        track.stop();
      } catch {
        /* ignore */
      }
    }
  }
  state.stream = null;
  if (state.video) {
    try {
      state.video.pause();
    } catch {
      /* ignore */
    }
    state.video.srcObject = null;
  }
  const stage = $('#stage');
  if (stage) stage.classList.remove('is-running');
  clearOverlay();
  setCameraStatus('idle');
  setStageMessage('');
  state.faces = 0;
  state.metrics = null;
  state.smile = null;
  state.box = null;
  state.fps = 0;
  state.display = { blink: 0, smile: 0, brow: 0, overall: 0, whiteness: 0, alignment: 0 };
  state.pose = { yaw: 0, pitch: 0, roll: 0 };
  updateUi(true);
}

async function switchCamera() {
  state.facing = state.facing === 'user' ? 'environment' : 'user';
  state.mirror = state.facing === 'user';
  state.settings.facing = state.facing;
  state.settings.mirror = state.mirror;
  saveSettings(state.settings);
  applyMirror();
  if (state.running) {
    stopCamera();
    await startCamera();
  } else {
    updateUi(true);
  }
}

function startLoop() {
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = requestAnimationFrame(loop);
}

function loop(now) {
  if (!state.running) return;
  state.raf = requestAnimationFrame(loop);
  if (document.hidden) return;
  if (now - state.lastDetect < 33) return;
  if (!state.landmarker || !state.video || state.video.readyState < 2) return;
  adjustCanvas();

  let result = null;
  try {
    result = state.landmarker.detectForVideo(state.video, now);
  } catch {
    return;
  }
  state.lastDetect = now;
  if (state.lastDetectAt) {
    const instant = clamp(1000 / Math.max(1, now - state.lastDetectAt), 0, 60);
    state.fps = state.fps ? smooth(state.fps, instant, 0.12) : instant;
  }
  state.lastDetectAt = now;

  processResult(result, now);
}

function adjustCanvas() {
  if (!state.video || !state.canvas) return;
  const width = state.video.videoWidth;
  const height = state.video.videoHeight;
  if (!width || !height) return;
  if (state.canvas.width !== width) state.canvas.width = width;
  if (state.canvas.height !== height) state.canvas.height = height;
}

function clearOverlay() {
  if (!state.ctx || !state.canvas) return;
  state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
}

/* -------------------------------------------------------------------------- */
/* Modello                                                                    */
/* -------------------------------------------------------------------------- */

async function ensureModel() {
  if (state.landmarker) return state.landmarker;
  if (state.modelPromise) return state.modelPromise;

  setModelStatus('loading');
  setStageMessage(t('modelLoading'));
  clearError();

  state.modelPromise = (async () => {
    const vision = await import('./vendor/mediapipe/vision_bundle.js');
    const wasmRoot = new URL('./vendor/mediapipe/wasm/', import.meta.url).href;
    const modelPath = new URL('../model/face_landmarker.task', import.meta.url).href;
    const fileset = await vision.FilesetResolver.forVisionTasks(wasmRoot);
    const options = {
      baseOptions: { modelAssetPath: modelPath, delegate: 'GPU' },
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      runningMode: 'VIDEO',
      numFaces: 2,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    };

    let landmarker;
    try {
      landmarker = await vision.FaceLandmarker.createFromOptions(fileset, options);
    } catch {
      landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
        ...options,
        baseOptions: { modelAssetPath: modelPath, delegate: 'CPU' }
      });
    }

    state.landmarker = landmarker;
    state.sets = vision.FaceLandmarker;
    state.drawing = new vision.DrawingUtils(state.ctx);
    setModelStatus('ready');
    setStageMessage('');
    updateUi(true);
    return landmarker;
  })();

  try {
    return await state.modelPromise;
  } catch (error) {
    state.modelPromise = null;
    state.landmarker = null;
    setModelStatus('error');
    setStageMessage('');
    setError('modelError', 'model');
    updateUi(true);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* Analisi e rendering                                                        */
/* -------------------------------------------------------------------------- */

function cropMouth(box) {
  if (!box || !state.video) return null;
  const canvas = state.cropCanvas;
  const ctx = state.cropCtx;
  if (!canvas || !ctx) return null;
  try {
    ctx.drawImage(state.video, box.x, box.y, box.w, box.h, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch {
    return null;
  }
}

function processResult(result, now) {
  const faces = result && Array.isArray(result.faceLandmarks) ? result.faceLandmarks : [];
  const hadFace = state.faces > 0;
  state.faces = faces.length;

  if (!faces.length) {
    state.metrics = null;
    state.smile = null;
    state.box = null;
    state.display = { blink: 0, smile: 0, brow: 0, overall: 0, whiteness: 0, alignment: 0 };
    state.pose = { yaw: 0, pitch: 0, roll: 0 };
    clearOverlay();
    if (hadFace) updateUi(true);
    return;
  }

  const widths = faces.map((landmarks) => {
    const left = landmarks[234] || { x: 0, y: 0 };
    const right = landmarks[454] || { x: 0, y: 0 };
    return Math.hypot(right.x - left.x, right.y - left.y);
  });
  let primaryIndex = 0;
  for (let index = 1; index < widths.length; index += 1) {
    if (widths[index] > widths[primaryIndex]) primaryIndex = index;
  }
  const landmarks = faces[primaryIndex];
  const categories =
    result.faceBlendshapes && result.faceBlendshapes[primaryIndex]
      ? result.faceBlendshapes[primaryIndex].categories
      : null;
  const matrixEntry =
    result.facialTransformationMatrixes && result.facialTransformationMatrixes[primaryIndex];
  const matrix = matrixEntry ? matrixEntry.data || matrixEntry : null;

  const metrics = faceMetrics(landmarks, categories, matrix);
  const box = mouthBox(landmarks, state.video.videoWidth, state.video.videoHeight);
  let teeth = null;
  if (box && metrics.jawOpen > 0.03) {
    const pixels = cropMouth(box);
    if (pixels) teeth = analyzeTeethPixels(pixels.data, pixels.width, pixels.height);
  }
  const smile = smileResult(metrics, teeth);

  state.metrics = metrics;
  state.smile = { ...smile, box };
  state.box = box;
  state.display = {
    blink: smooth(state.display.blink, metrics.blink),
    smile: smooth(state.display.smile, metrics.smile),
    brow: smooth(state.display.brow, metrics.brow),
    overall: smooth(state.display.overall, smile.overall),
    whiteness: smooth(state.display.whiteness, smile.whiteness),
    alignment: smooth(state.display.alignment, smile.alignment)
  };
  state.pose = {
    yaw: smooth(state.pose.yaw, metrics.pose.yaw, 0.35),
    pitch: smooth(state.pose.pitch, metrics.pose.pitch, 0.35),
    roll: smooth(state.pose.roll, metrics.pose.roll, 0.35)
  };

  if (metrics.blink > 0.55 && now - state.lastBlink > 350) {
    state.blinkCount += 1;
    state.lastBlink = now;
  }

  if (metrics.jawOpen > 0.03) updateBest(smile);
  drawOverlay(result, landmarks, primaryIndex, box);
  updateUi();
}

function drawOverlay(result, landmarks, primaryIndex, box) {
  const ctx = state.ctx;
  const drawing = state.drawing;
  const sets = state.sets;
  if (!ctx || !state.canvas) return;
  ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
  if (!drawing || !sets || !landmarks) return;

  if (state.mode === 'mesh') {
    if (state.mesh !== 'off') {
      if (state.mesh === 'full') {
        drawing.drawConnectors(landmarks, sets.FACE_LANDMARKS_TESSELATION, {
          color: 'rgba(0, 229, 255, 0.12)',
          lineWidth: 1
        });
      }
      drawing.drawConnectors(landmarks, sets.FACE_LANDMARKS_FACE_OVAL, {
        color: 'rgba(0, 229, 255, 0.72)',
        lineWidth: 1.6
      });
      drawing.drawConnectors(landmarks, sets.FACE_LANDMARKS_CONTOURS, {
        color: 'rgba(0, 229, 255, 0.62)',
        lineWidth: 1.2
      });
      drawing.drawConnectors(landmarks, sets.FACE_LANDMARKS_LEFT_EYE, {
        color: 'rgba(120, 255, 214, 0.92)',
        lineWidth: 1.4
      });
      drawing.drawConnectors(landmarks, sets.FACE_LANDMARKS_RIGHT_EYE, {
        color: 'rgba(120, 255, 214, 0.92)',
        lineWidth: 1.4
      });
      drawing.drawConnectors(landmarks, sets.FACE_LANDMARKS_LIPS, {
        color: 'rgba(255, 122, 184, 0.95)',
        lineWidth: 1.6
      });
      if (state.mesh === 'full') {
        drawing.drawLandmarks(landmarks, {
          color: 'rgba(0, 229, 255, 0.9)',
          fillColor: 'rgba(0, 229, 255, 0.85)',
          radius: 1.1
        });
      }
      const faces = result.faceLandmarks || [];
      for (let index = 0; index < faces.length; index += 1) {
        if (index === primaryIndex) continue;
        drawing.drawConnectors(faces[index], sets.FACE_LANDMARKS_CONTOURS, {
          color: 'rgba(255, 122, 184, 0.45)',
          lineWidth: 1
        });
      }
    }
    return;
  }

  drawing.drawConnectors(landmarks, sets.FACE_LANDMARKS_FACE_OVAL, {
    color: 'rgba(0, 229, 255, 0.45)',
    lineWidth: 1.2
  });
  drawing.drawConnectors(landmarks, sets.FACE_LANDMARKS_LIPS, {
    color: 'rgba(255, 122, 184, 0.95)',
    lineWidth: 1.8
  });

  if (box) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 122, 184, 0.10)';
    ctx.strokeStyle = 'rgba(255, 122, 184, 0.95)';
    ctx.lineWidth = 2;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    const tick = Math.min(18, box.w / 4, box.h / 3);
    ctx.beginPath();
    ctx.moveTo(box.x, box.y + tick);
    ctx.lineTo(box.x, box.y);
    ctx.lineTo(box.x + tick, box.y);
    ctx.moveTo(box.x + box.w - tick, box.y);
    ctx.lineTo(box.x + box.w, box.y);
    ctx.lineTo(box.x + box.w, box.y + tick);
    ctx.stroke();
    ctx.restore();
  }
}

/* -------------------------------------------------------------------------- */
/* Snapshot                                                                   */
/* -------------------------------------------------------------------------- */

function downloadBlob(blob, filename) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function snapshot() {
  if (!state.running || !state.video || !state.video.videoWidth) {
    toast(t('snapshotError'));
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = state.video.videoWidth;
  canvas.height = state.video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    toast(t('snapshotError'));
    return;
  }

  if (state.mirror) {
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(state.video, 0, 0, canvas.width, canvas.height);
  if (state.canvas && state.canvas.width) {
    ctx.drawImage(state.canvas, 0, 0, canvas.width, canvas.height);
  }
  if (state.mirror) ctx.restore();

  const pad = Math.round(canvas.width * 0.035);
  ctx.save();
  ctx.fillStyle = 'rgba(4, 10, 20, 0.62)';
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
  ctx.lineWidth = Math.max(1, canvas.width * 0.002);
  const boxW = Math.round(canvas.width * 0.34);
  const boxH = Math.round(canvas.height * 0.13);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(pad, canvas.height - pad - boxH, boxW, boxH, Math.round(boxH * 0.18));
  } else {
    ctx.rect(pad, canvas.height - pad - boxH, boxW, boxH);
  }
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.max(14, Math.round(canvas.width * 0.022))}px system-ui, sans-serif`;
  ctx.fillText('Vision Lab', pad + boxW * 0.08, canvas.height - pad - boxH * 0.48);
  ctx.fillStyle = '#00e5ff';
  ctx.font = `700 ${Math.max(12, Math.round(canvas.width * 0.016))}px system-ui, sans-serif`;
  ctx.fillText(t('onDevice'), pad + boxW * 0.08, canvas.height - pad - boxH * 0.2);
  if (state.mode === 'smile' && state.smile) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#00e5ff';
    ctx.font = `800 ${Math.max(22, Math.round(canvas.width * 0.04))}px system-ui, sans-serif`;
    ctx.fillText(String(state.smile.overall), canvas.width - pad * 1.2, canvas.height - pad - boxH * 0.35);
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = `600 ${Math.max(11, Math.round(canvas.width * 0.014))}px system-ui, sans-serif`;
    ctx.fillText('/100', canvas.width - pad * 1.2, canvas.height - pad - boxH * 0.12);
  }
  ctx.restore();

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        toast(t('snapshotError'));
        return;
      }
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      downloadBlob(blob, `vision-lab-${stamp}.png`);
      toast(t('snapshotSaved'));
    },
    'image/png'
  );
}

async function toggleFullscreen() {
  const stage = $('#stage');
  if (!stage) return;
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (stage.requestFullscreen) await stage.requestFullscreen();
  } catch {
    toast(t('errorGeneric'));
  }
}

/* -------------------------------------------------------------------------- */
/* Lingua                                                                     */
/* -------------------------------------------------------------------------- */

function updateLanguage() {
  applyStatic(document);
  hydrateIcons(document);
  updateModeUi();
  setCameraStatus(state.cameraStatus);
  setModelStatus(state.modelStatus);
  if (state.errorKey) setError(state.errorKey, state.errorAction);
  renderBest();
  updateUi(true);
  if (state.stageMessage) {
    if (state.cameraStatus === 'starting') setStageMessage(t('loadingCamera'));
    else if (state.modelStatus === 'loading') setStageMessage(t('modelLoading'));
  }
}

/* -------------------------------------------------------------------------- */
/* Eventi e init                                                              */
/* -------------------------------------------------------------------------- */

function bindEvents() {
  for (const button of $$('#modeSwitch [data-mode]')) {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  }
  for (const button of $$('#meshSwitch [data-mesh]')) {
    button.addEventListener('click', () => setMeshStyle(button.dataset.mesh));
  }

  $('#cameraToggle').addEventListener('click', () => {
    if (state.running) stopCamera();
    else startCamera();
  });
  $('#stageStart').addEventListener('click', () => startCamera());
  $('#switchCamera').addEventListener('click', switchCamera);
  $('#mirrorToggle').addEventListener('click', () => {
    state.mirror = !state.mirror;
    state.settings.mirror = state.mirror;
    saveSettings(state.settings);
    applyMirror();
  });
  $('#snapshotBtn').addEventListener('click', snapshot);
  $('#fullscreenBtn').addEventListener('click', toggleFullscreen);
  $('#fullscreenExit').addEventListener('click', toggleFullscreen);

  $('#resetBest').addEventListener('click', () => {
    clearBest();
    state.best = null;
    renderBest();
    toast(t('bestReset'));
  });

  $('#errorRetry').addEventListener('click', () => {
    const action = state.errorAction;
    clearError();
    if (action === 'model') {
      if (state.running) {
        ensureModel().catch(() => {});
      } else {
        startCamera();
      }
    } else {
      startCamera();
    }
  });

  window.addEventListener('hashchange', () => {
    const hash = location.hash.slice(1);
    if (hash === 'mesh' || hash === 'smile') setMode(hash, { silent: true });
  });

  window.addEventListener('project:langchange', (event) => {
    setLang(event && event.detail ? event.detail.lang : getLang());
    document.documentElement.lang = getLang();
    updateLanguage();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (state.raf) {
        cancelAnimationFrame(state.raf);
        state.raf = 0;
      }
    } else if (state.running && !state.raf) {
      state.lastDetect = 0;
      state.lastDetectAt = 0;
      startLoop();
    }
  });

  window.addEventListener('beforeunload', () => {
    stopCamera();
    if (state.landmarker && typeof state.landmarker.close === 'function') {
      try {
        state.landmarker.close();
      } catch {
        /* ignore */
      }
    }
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline opzionale */
    });
  });
}

function init() {
  const initialLang =
    (window.ProjectShell && window.ProjectShell.getLang && window.ProjectShell.getLang()) ||
    window.__PROJECT_LANG__ ||
    document.documentElement.lang ||
    'en';
  initLang(initialLang);
  document.documentElement.lang = getLang();
  applyStatic(document);
  hydrateIcons(document);

  state.settings = loadSettings();
  state.mode = state.settings.mode;
  state.mesh = state.settings.mesh;
  state.mirror = state.settings.mirror;
  state.facing = state.settings.facing;
  state.best = loadBest();

  state.video = $('#video');
  state.canvas = $('#overlay');
  state.ctx = state.canvas.getContext('2d', { willReadFrequently: true });
  state.cropCanvas = document.createElement('canvas');
  state.cropCanvas.width = 128;
  state.cropCanvas.height = 80;
  state.cropCtx = state.cropCanvas.getContext('2d', { willReadFrequently: true });

  const hash = location.hash.slice(1);
  if (hash === 'mesh' || hash === 'smile') state.mode = hash;

  bindEvents();
  updateModeUi();
  updateMeshUi();
  applyMirror();
  setCameraStatus('idle');
  setModelStatus('idle');
  renderBest();
  updateUi(true);

  if (state.canvas) {
    state.canvas.width = 1;
    state.canvas.height = 1;
  }

  registerServiceWorker();

  window.__vision = {
    startCamera,
    stopCamera,
    switchCamera,
    getState: () => ({
      running: state.running,
      faces: state.faces,
      mode: state.mode,
      mesh: state.mesh,
      mirror: state.mirror,
      modelStatus: state.modelStatus,
      cameraStatus: state.cameraStatus,
      metrics: state.metrics,
      smile: state.smile,
      best: state.best,
      fps: state.fps
    })
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
