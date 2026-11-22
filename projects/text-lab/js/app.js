/**
 * app.js — Text Lab: camera, immagini, preprocessing e OCR locale.
 * Tesseract.js e le lingue sono serviti localmente; nessuna immagine lascia il browser.
 */

import {
  DEFAULT_LANGUAGE,
  confidenceBand,
  extractOcr,
  fileNameFor,
  formatDuration,
  historyPreview,
  languageList,
  languageNameKey,
  normalizeOcrText,
  progressKey,
  textStats,
  toggleLanguage,
  validateImageFile
} from './text.js';
import {
  addHistoryItem,
  clearHistory,
  loadHistory,
  loadSettings,
  removeHistoryItem,
  saveSettings
} from './storage.js';
import {
  applyStatic,
  formatDateTime,
  getLang,
  initLang,
  languageName,
  setLang,
  t
} from './i18n.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const MAX_CANVAS_SIDE = 2200;

const ICONS = {
  camera:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="4"/></svg>',
  switch:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 7h-4a4 4 0 0 0-4 4v2a4 4 0 0 1-4 4H4"/><path d="m7 4-3 3 3 3M17 14l3 3-3 3"/><circle cx="12" cy="12" r="2.2"/></svg>',
  capture:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="4"/></svg>',
  image:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>',
  upload:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/></svg>',
  paste:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="4" width="8" height="4" rx="1"/><path d="M16 6h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/></svg>',
  scan:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M7 12h10M7 9h10M7 15h7"/></svg>',
  contrast:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/></svg>',
  brightness:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  rotateLeft:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h9a5 5 0 0 1 0 10H7"/><path d="m8 3-4 4 4 4"/></svg>',
  rotateRight:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 7h-9a5 5 0 0 0 0 10h6"/><path d="m16 3 4 4-4 4"/></svg>',
  reset:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  copy:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  download:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>',
  share:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
  speak:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  clean:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m19 3 2 2-9 9-2-2zM9 14l2 2-5 5H4v-2z"/><path d="M14 4h6v6"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  alert:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 21h20L12 3z"/><path d="M12 9v5M12 17h.01"/></svg>'
};

const state = {
  settings: loadSettings(),
  mode: 'image',
  language: DEFAULT_LANGUAGE,
  history: [],
  running: false,
  starting: false,
  facing: 'environment',
  stream: null,
  video: null,
  hasImage: false,
  source: null,
  sourceUrl: '',
  workCanvas: null,
  rotation: 0,
  grayscale: false,
  contrast: false,
  busy: false,
  cancelled: false,
  worker: null,
  workerLang: '',
  progressKey: '',
  result: null,
  speaking: false,
  errorKey: '',
  errorAction: ''
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

function confirmDialog(options) {
  if (window.ProjectShell && typeof window.ProjectShell.confirm === 'function') {
    return window.ProjectShell.confirm(options);
  }
  return Promise.resolve(window.confirm(options.message || options.title || ''));
}

async function copyText(value) {
  const text = String(value == null ? '' : value);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fallback */
    }
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

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

function setButtonLabel(button, text) {
  const label = button && button.querySelector('.textlab-btn__label');
  if (label) label.textContent = text;
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

function setEngineStatus(status) {
  state.engineStatus = status;
  const badge = $('#engineStatus');
  if (!badge) return;
  badge.dataset.state = status;
  badge.textContent = t(
    status === 'loading' ? 'engineLoading' : status === 'error' ? 'engineError' : 'engineReady'
  );
}

function showError(key, action) {
  state.errorKey = key || '';
  state.errorAction = action || 'ocr';
  const box = $('#errorBox');
  const text = $('#errorText');
  const retry = $('#errorRetry');
  if (!box) return;
  box.hidden = !state.errorKey;
  if (text) text.textContent = state.errorKey ? t(state.errorKey) : '';
  if (retry) retry.textContent = t('retry');
}

function clearError() {
  showError('', 'ocr');
}

function showProcessing(show) {
  const overlay = $('#processingOverlay');
  if (overlay) overlay.hidden = !show;
  if (!show) {
    setProgressBar(0, '');
  }
}

function setProgressBar(percent, key) {
  const value = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
  if (key) state.progressKey = key;
  const bar = $('#progressBar');
  const label = $('#progressPercent');
  const status = $('#progressStatus');
  if (bar) bar.style.width = `${value}%`;
  if (label) label.textContent = `${value}%`;
  if (status && state.progressKey) status.textContent = t(state.progressKey);
}

function handleProgress(message) {
  if (!message || state.cancelled) return;
  const key = progressKey(message.status);
  if (key) state.progressKey = key;
  const percent = Math.round((Number(message.progress) || 0) * 100);
  setEngineStatus(message.status === 'recognizing text' ? 'ready' : 'loading');
  setProgressBar(percent, key || state.progressKey);
}

function updateModeUi() {
  for (const button of $$('#modeSwitch [data-mode]')) {
    button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode));
  }
  const app = $('#app');
  if (app) app.dataset.mode = state.mode;
}

function updateLanguageUi() {
  for (const button of $$('#languageChips [data-lang]')) {
    button.setAttribute(
      'aria-pressed',
      String(languageList(state.language).includes(button.dataset.lang))
    );
    const code = button.querySelector('.textlab-lang__code');
    if (code) code.textContent = button.dataset.lang === 'eng' ? 'EN' : 'IT';
  }
  const hint = $('#languageChips');
  if (hint) hint.setAttribute('aria-label', t('languageLabel'));
}

function updatePreprocessUi() {
  for (const button of $$('.textlab-preprocess [data-toggle]')) {
    const key = button.dataset.toggle;
    button.setAttribute('aria-pressed', String(Boolean(state[key])));
    button.disabled = state.busy;
  }
  for (const id of ['rotateLeft', 'rotateRight', 'resetImage']) {
    const button = document.getElementById(id);
    if (button) button.disabled = state.busy || !state.hasImage;
  }
}

function renderStage() {
  const stage = $('#stage');
  const video = state.video;
  const canvas = $('#previewCanvas');
  const dropZone = $('#dropZone');
  const placeholder = $('#cameraPlaceholder');
  if (!stage) return;

  const cameraMode = state.mode === 'camera' && !state.hasImage;
  stage.classList.toggle('is-camera', cameraMode);
  stage.classList.toggle('is-image', !cameraMode);
  stage.classList.toggle('is-running', state.running);
  stage.classList.toggle('has-image', state.hasImage);

  if (video) video.hidden = !cameraMode;
  if (canvas) canvas.hidden = !state.hasImage;
  if (dropZone) dropZone.hidden = !(state.mode === 'image' && !state.hasImage);
  if (placeholder) placeholder.hidden = !(cameraMode && !state.running);

  const cameraButtons = ['cameraToggle', 'switchCamera', 'captureBtn'];
  for (const id of cameraButtons) {
    const button = document.getElementById(id);
    if (button) button.hidden = !cameraMode;
  }
  const choose = $('#chooseImageBtn');
  if (choose) choose.hidden = state.mode !== 'image';
  const retake = $('#retakeBtn');
  if (retake) {
    retake.hidden = !state.hasImage;
    setButtonLabel(retake, t(state.mode === 'camera' ? 'retake' : 'newImage'));
  }

  const imageStatus = $('#imageStatus');
  if (imageStatus) imageStatus.hidden = !state.hasImage;
  const cameraStatus = $('#cameraStatus');
  if (cameraStatus) cameraStatus.hidden = state.mode !== 'camera';
}

function updateUi() {
  renderStage();
  const toggle = $('#cameraToggle');
  if (toggle) {
    toggle.disabled = state.starting || state.busy;
    setButtonLabel(toggle, t(state.running ? 'cameraStop' : 'cameraStart'));
  }
  const stageStart = $('#stageStart');
  if (stageStart) stageStart.disabled = state.starting || state.busy;
  const capture = $('#captureBtn');
  if (capture) capture.disabled = !state.running || state.busy;
  const extract = $('#extractBtn');
  if (extract) extract.disabled = !state.hasImage || state.busy;
  const switchCamera = $('#switchCamera');
  if (switchCamera) switchCamera.disabled = state.starting || state.busy;
  for (const id of ['chooseImageBtn', 'chooseImageStage', 'pasteImageBtn']) {
    const button = document.getElementById(id);
    if (button) button.disabled = state.busy;
  }
  for (const button of $$('#languageChips [data-lang]')) button.disabled = state.busy;
  updatePreprocessUi();
  const cancel = $('#cancelOcr');
  if (cancel) cancel.disabled = !state.busy || state.cancelled;
  const speak = $('#resultSpeak');
  if (speak) {
    speak.setAttribute('aria-pressed', String(state.speaking));
    setButtonLabel(speak, t(state.speaking ? 'stopReading' : 'readAloud'));
  }
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
  if (state.mode !== 'camera' || state.starting || state.running || state.hasImage) return;
  clearError();
  if (!window.isSecureContext) {
    setCameraStatus('error');
    showError('cameraInsecure', 'camera');
    return;
  }
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
    setCameraStatus('error');
    showError('cameraUnsupported', 'camera');
    return;
  }

  state.starting = true;
  setCameraStatus('starting');
  updateUi();
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: state.facing === 'user' ? { ideal: 'user' } : { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
  } catch (error) {
    state.starting = false;
    setCameraStatus('error');
    showError(mapCameraError(error), 'camera');
    updateUi();
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
    for (const track of stream.getTracks()) track.stop();
    state.stream = null;
    state.video.srcObject = null;
    setCameraStatus('error');
    showError('cameraError', 'camera');
    updateUi();
    return;
  }

  state.starting = false;
  state.running = true;
  setCameraStatus('running');
  clearError();
  renderStage();
  updateUi();
}

function stopCamera() {
  state.running = false;
  state.starting = false;
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
  setCameraStatus('idle');
  renderStage();
  updateUi();
}

async function switchCamera() {
  state.facing = state.facing === 'user' ? 'environment' : 'user';
  state.settings.facing = state.facing;
  saveSettings(state.settings);
  if (state.running) {
    stopCamera();
    await startCamera();
  }
}

/* -------------------------------------------------------------------------- */
/* Sorgente immagine e preprocessing                                          */
/* -------------------------------------------------------------------------- */

function sourceDimensions(source) {
  if (!source) return { width: 0, height: 0 };
  return {
    width: source.width || source.naturalWidth || 0,
    height: source.height || source.naturalHeight || 0
  };
}

function revokeSource() {
  if (state.sourceUrl) {
    try {
      URL.revokeObjectURL(state.sourceUrl);
    } catch {
      /* ignore */
    }
    state.sourceUrl = '';
  }
  if (state.source && typeof state.source.close === 'function') {
    try {
      state.source.close();
    } catch {
      /* ignore */
    }
  }
}

function buildPreview() {
  if (!state.source || !state.hasImage) return;
  const { width, height } = sourceDimensions(state.source);
  if (!width || !height) return;
  const canvas = $('#previewCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let scale = Math.min(1, MAX_CANVAS_SIDE / Math.max(width, height));
  if (Math.max(width, height) * scale < 700) {
    scale = Math.min(2, 700 / Math.max(width, height));
  }
  const drawWidth = Math.max(1, Math.round(width * scale));
  const drawHeight = Math.max(1, Math.round(height * scale));
  const swapped = state.rotation % 180 !== 0;
  canvas.width = swapped ? drawHeight : drawWidth;
  canvas.height = swapped ? drawWidth : drawHeight;

  const filters = [];
  if (state.grayscale) filters.push('grayscale(1)');
  if (state.contrast) filters.push('contrast(1.45)');
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((state.rotation * Math.PI) / 180);
  ctx.filter = filters.length ? filters.join(' ') : 'none';
  ctx.drawImage(state.source, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();
  canvas.hidden = false;
}

function resetSource() {
  revokeSource();
  state.source = null;
  state.hasImage = false;
  state.rotation = 0;
  const canvas = $('#previewCanvas');
  if (canvas) {
    canvas.hidden = true;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 1;
    canvas.height = 1;
  }
  clearError();
  renderStage();
  updateUi();
}

function applySource(source, options = {}) {
  revokeSource();
  state.source = source;
  state.hasImage = true;
  state.rotation = 0;
  clearError();
  buildPreview();
  renderStage();
  updateUi();
  if (options.auto !== false) runOcr();
}

async function loadFile(file) {
  const validation = validateImageFile(file);
  if (!validation.ok) {
    toast(t(validation.code === 'IMAGE_SIZE' ? 'imageSize' : validation.code === 'EMPTY' ? 'imageEmpty' : 'imageType'));
    return;
  }
  if (state.busy) return;
  if (state.mode !== 'image') {
    setMode('image', { silent: true, keepSource: true });
  }
  stopCamera();
  try {
    if (typeof createImageBitmap === 'function') {
      const bitmap = await createImageBitmap(file);
      state.sourceUrl = '';
      applySource(bitmap);
      return;
    }
  } catch {
    /* fallback */
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    applySource(image);
    state.sourceUrl = url;
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    toast(t('imageType'));
  };
  image.src = url;
}

function captureFrame() {
  if (!state.running || !state.video || !state.video.videoWidth) return;
  const canvas = document.createElement('canvas');
  canvas.width = state.video.videoWidth;
  canvas.height = state.video.videoHeight;
  canvas.getContext('2d').drawImage(state.video, 0, 0);
  stopCamera();
  applySource(canvas);
}

function retake() {
  resetSource();
  if (state.mode === 'camera') startCamera();
}

/* -------------------------------------------------------------------------- */
/* Modalità                                                                   */
/* -------------------------------------------------------------------------- */

function setMode(mode, options = {}) {
  const next = mode === 'camera' ? 'camera' : 'image';
  if (next === state.mode && !options.force) return;
  if (next !== state.mode) {
    stopCamera();
    clearError();
    if (state.hasImage && !options.keepSource) resetSource();
  }
  state.mode = next;
  updateModeUi();
  renderStage();
  updateUi();
  if (!options.silent && location.hash !== '#' + next) {
    history.replaceState(null, '', '#' + next);
  }
}

/* -------------------------------------------------------------------------- */
/* OCR                                                                        */
/* -------------------------------------------------------------------------- */

async function terminateWorker() {
  const worker = state.worker;
  state.worker = null;
  state.workerLang = '';
  if (worker) {
    try {
      await worker.terminate();
    } catch {
      /* ignore */
    }
  }
}

async function ensureWorker(language) {
  if (state.worker && state.workerLang === language) return state.worker;
  await terminateWorker();
  if (typeof window.Tesseract === 'undefined') {
    throw new Error('Tesseract non disponibile');
  }
  setEngineStatus('loading');
  const base = new URL('./vendor/tesseract/', import.meta.url).href;
  const worker = await window.Tesseract.createWorker(language, 1, {
    workerPath: base + 'worker.min.js',
    corePath: base + 'core',
    langPath: base + 'lang',
    workerBlobURL: false,
    gzip: true,
    cacheMethod: 'write',
    logger: handleProgress,
    errorHandler: (error) => {
      if (!state.cancelled) console.error('Tesseract error:', error);
    }
  });
  if (state.cancelled) {
    try {
      await worker.terminate();
    } catch {
      /* ignore */
    }
    return null;
  }
  state.worker = worker;
  state.workerLang = language;
  setEngineStatus('ready');
  return worker;
}

async function runOcr() {
  if (state.busy || !state.hasImage || !state.workCanvas) return;
  if (!$('#previewCanvas') || !$('#previewCanvas').width) return;
  stopSpeech();
  state.busy = true;
  state.cancelled = false;
  state.progressKey = 'progressRecognize';
  setProgressBar(0, 'progressRecognize');
  setEngineStatus('loading');
  showProcessing(true);
  clearError();
  updateUi();
  const started = performance.now();
  const language = state.language;
  try {
    const worker = await ensureWorker(language);
    if (!worker || state.cancelled) return;
    setProgressBar(0, 'progressRecognize');
    const response = await worker.recognize($('#previewCanvas'));
    if (state.cancelled) return;
    const data = response && response.data ? response.data : response;
    const extracted = extractOcr(data, language);
    const duration = performance.now() - started;
    if (!extracted.text) {
      toast(t('noText'));
      return;
    }
    state.result = {
      ...extracted,
      duration,
      createdAt: Date.now(),
      source: 'ocr'
    };
    showResult(state.result);
    const saved = addHistoryItem({
      text: extracted.text,
      language: extracted.language,
      confidence: extracted.confidence,
      createdAt: Date.now()
    });
    state.history = saved.items;
    renderHistory();
    setEngineStatus('ready');
  } catch (error) {
    if (state.cancelled) return;
    console.error('OCR error:', error);
    setEngineStatus('error');
    showError('ocrError', 'ocr');
    await terminateWorker();
  } finally {
    state.busy = false;
    state.cancelled = false;
    showProcessing(false);
    if (state.engineStatus === 'loading') setEngineStatus('ready');
    updateUi();
  }
}

function cancelOcr() {
  if (!state.busy) return;
  state.cancelled = true;
  if (state.worker) {
    terminateWorker();
  }
  setEngineStatus('ready');
  state.progressKey = 'cancel';
  setProgressBar(0, 'cancel');
}

/* -------------------------------------------------------------------------- */
/* Risultato                                                                  */
/* -------------------------------------------------------------------------- */

function resultText() {
  const area = $('#resultText');
  return area ? area.value : '';
}

function updateResultStats(text) {
  const stats = textStats(text);
  const map = {
    statWords: String(stats.words),
    statChars: String(stats.chars),
    statLines: String(stats.lines),
    statReading:
      stats.readingMinutes > 0 ? t('minutes', { n: stats.readingMinutes }) : '—'
  };
  for (const [id, value] of Object.entries(map)) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }
}

function showResult(result) {
  if (!result) {
    clearResult();
    return;
  }
  if (state.speaking) stopSpeech();
  state.result = result;
  const empty = $('#resultEmpty');
  const content = $('#resultContent');
  const textarea = $('#resultText');
  if (empty) empty.hidden = true;
  if (content) content.hidden = false;
  if (textarea) textarea.value = result.text || '';
  updateResultStats(result.text || '');

  const confidence = Number(result.confidence) || 0;
  const badge = $('#confidenceBadge');
  if (badge) {
    badge.hidden = false;
    badge.textContent = `${Math.round(confidence)}%`;
    badge.dataset.band = confidenceBand(confidence);
    badge.title = t(confidence >= 80 ? 'confidenceHigh' : confidence >= 55 ? 'confidenceMedium' : 'confidenceLow');
  }
  const statConfidence = $('#statConfidence');
  if (statConfidence) statConfidence.textContent = `${Math.round(confidence)}%`;
  const statTime = $('#statTime');
  if (statTime) {
    statTime.textContent = result.duration ? formatDuration(result.duration) : '—';
  }
  updateUi();
}

function clearResult() {
  state.result = null;
  stopSpeech();
  const empty = $('#resultEmpty');
  const content = $('#resultContent');
  const badge = $('#confidenceBadge');
  if (empty) empty.hidden = false;
  if (content) content.hidden = true;
  if (badge) badge.hidden = true;
  const textarea = $('#resultText');
  if (textarea) textarea.value = '';
  updateUi();
}

/* -------------------------------------------------------------------------- */
/* Azioni risultato                                                           */
/* -------------------------------------------------------------------------- */

async function copyResult() {
  const text = resultText();
  if (!text) return;
  const ok = await copyText(text);
  toast(ok ? t('copied') : t('copyFailed'));
}

function downloadResult() {
  const text = resultText();
  if (!text) return;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, fileNameFor(new Date()));
  toast(t('downloaded'));
}

async function shareResult() {
  const text = resultText();
  if (!text) return;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Text Lab', text });
      return;
    } catch (error) {
      if (error && error.name === 'AbortError') return;
    }
  }
  const ok = await copyText(text);
  toast(ok ? t('copied') : t('shareUnavailable'));
}

function setSpeaking(value) {
  state.speaking = value;
  updateUi();
}

function stopSpeech() {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
  if (state.speaking) setSpeaking(false);
}

function speakResult() {
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    toast(t('speechUnsupported'));
    return;
  }
  if (state.speaking) {
    stopSpeech();
    return;
  }
  const text = resultText();
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.result && state.result.language === 'ita' ? 'it-IT' : 'en-US';
  utterance.rate = 1;
  utterance.onend = () => setSpeaking(false);
  utterance.onerror = () => setSpeaking(false);
  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  } catch {
    toast(t('speechUnsupported'));
  }
}

function cleanResult() {
  const textarea = $('#resultText');
  if (!textarea) return;
  textarea.value = normalizeOcrText(textarea.value);
  updateResultStats(textarea.value);
  toast(t('cleaned'));
}

/* -------------------------------------------------------------------------- */
/* Cronologia                                                                 */
/* -------------------------------------------------------------------------- */

function renderHistory() {
  const list = $('#historyList');
  const empty = $('#historyEmpty');
  const clear = $('#clearHistoryBtn');
  if (!list) return;
  const total = state.history.length;
  if (empty) empty.hidden = total > 0;
  if (clear) clear.hidden = total === 0;
  list.replaceChildren();

  for (const item of state.history) {
    const row = document.createElement('div');
    row.className = 'textlab-history__item';

    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'textlab-history__open';
    const preview = document.createElement('span');
    preview.className = 'textlab-history__preview';
    preview.textContent = historyPreview(item.text);
    const meta = document.createElement('span');
    meta.className = 'textlab-history__meta';
    meta.textContent = `${formatDateTime(item.createdAt)} · ${languageName(item.language)} · ${item.confidence}%`;
    open.append(preview, meta);
    open.addEventListener('click', () => {
      showResult({
        text: item.text,
        confidence: item.confidence,
        language: item.language,
        stats: textStats(item.text),
        duration: 0,
        createdAt: item.createdAt,
        source: 'history'
      });
      toast(t('historyRestored'));
      $('#resultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'textlab-history__remove';
    remove.setAttribute('aria-label', `${t('delete')} ${historyPreview(item.text, 40)}`);
    remove.innerHTML = icon('close');
    remove.addEventListener('click', () => {
      state.history = removeHistoryItem(item.id);
      renderHistory();
      toast(t('deleted'));
    });

    row.append(open, remove);
    list.append(row);
  }
}

async function clearHistoryWithConfirm() {
  const ok = await confirmDialog({
    title: t('confirmClearTitle'),
    message: t('confirmClearText'),
    confirmText: t('confirmClear'),
    cancelText: t('cancelDialog')
  });
  if (!ok) return;
  state.history = clearHistory();
  renderHistory();
  toast(t('cleared'));
}

/* -------------------------------------------------------------------------- */
/* Lingua                                                                     */
/* -------------------------------------------------------------------------- */

function updateLanguage() {
  applyStatic(document);
  hydrateIcons(document);
  updateModeUi();
  updateLanguageUi();
  setCameraStatus(state.cameraStatus || 'idle');
  setEngineStatus(state.engineStatus || 'ready');
  if (state.errorKey) showError(state.errorKey, state.errorAction);
  if (state.busy) {
    const status = $('#progressStatus');
    const key = state.progressKey || 'progressRecognize';
    if (status) status.textContent = t(key);
  }
  if (state.result) {
    const badge = $('#confidenceBadge');
    if (badge && !badge.hidden) {
      const confidence = Number(state.result.confidence) || 0;
      badge.title = t(confidence >= 80 ? 'confidenceHigh' : confidence >= 55 ? 'confidenceMedium' : 'confidenceLow');
    }
    updateResultStats(resultText());
  }
  renderHistory();
  updateUi();
}

/* -------------------------------------------------------------------------- */
/* Eventi                                                                     */
/* -------------------------------------------------------------------------- */

function bindEvents() {
  for (const button of $$('#modeSwitch [data-mode]')) {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  }

  $('#cameraToggle').addEventListener('click', () => {
    if (state.running) stopCamera();
    else startCamera();
  });
  $('#stageStart').addEventListener('click', startCamera);
  $('#switchCamera').addEventListener('click', switchCamera);
  $('#captureBtn').addEventListener('click', captureFrame);

  const input = $('#imageInput');
  for (const id of ['chooseImageBtn', 'chooseImageStage']) {
    const button = document.getElementById(id);
    if (button && input) {
      button.addEventListener('click', () => input.click());
    }
  }
  if (input) {
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (file) loadFile(file);
    });
  }

  const paste = $('#pasteImageBtn');
  if (paste) {
    paste.addEventListener('click', async () => {
      if (!navigator.clipboard || typeof navigator.clipboard.read !== 'function') {
        toast(t('imageType'));
        return;
      }
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const type = item.types.find((value) => /^image\//.test(value));
          if (!type) continue;
          const blob = await item.getType(type);
          const file = new File([blob], 'clipboard-image', { type });
          await loadFile(file);
          return;
        }
        toast(t('imageType'));
      } catch {
        toast(t('imageType'));
      }
    });
  }

  const stage = $('#stage');
  if (stage) {
    const stop = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    stage.addEventListener('dragover', (event) => {
      stop(event);
      stage.classList.add('is-drag');
    });
    stage.addEventListener('dragleave', (event) => {
      stop(event);
      stage.classList.remove('is-drag');
    });
    stage.addEventListener('drop', (event) => {
      stop(event);
      stage.classList.remove('is-drag');
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (file) loadFile(file);
    });
  }

  document.addEventListener('paste', (event) => {
    if (state.busy) return;
    const items = event.clipboardData && event.clipboardData.items;
    if (!items) return;
    for (const item of items) {
      if (!/^image\//.test(item.type)) continue;
      const file = item.getAsFile();
      if (file) {
        event.preventDefault();
        loadFile(file);
        return;
      }
    }
  });

  for (const button of $$('#languageChips [data-lang]')) {
    button.addEventListener('click', () => {
      if (state.busy) return;
      state.language = toggleLanguage(state.language, button.dataset.lang);
      state.settings.language = state.language;
      saveSettings(state.settings);
      updateLanguageUi();
      if (state.worker && state.workerLang !== state.language) {
        setEngineStatus('ready');
      }
    });
  }

  for (const button of $$('.textlab-preprocess [data-toggle]')) {
    button.addEventListener('click', () => {
      if (state.busy) return;
      const key = button.dataset.toggle;
      state[key] = !state[key];
      state.settings[key] = state[key];
      saveSettings(state.settings);
      updatePreprocessUi();
      if (state.hasImage) buildPreview();
    });
  }

  $('#rotateLeft').addEventListener('click', () => {
    if (state.busy || !state.hasImage) return;
    state.rotation = (state.rotation + 270) % 360;
    buildPreview();
  });
  $('#rotateRight').addEventListener('click', () => {
    if (state.busy || !state.hasImage) return;
    state.rotation = (state.rotation + 90) % 360;
    buildPreview();
  });
  $('#resetImage').addEventListener('click', () => {
    if (state.busy || !state.hasImage) return;
    state.rotation = 0;
    state.grayscale = false;
    state.contrast = false;
    state.settings.grayscale = false;
    state.settings.contrast = false;
    saveSettings(state.settings);
    updatePreprocessUi();
    buildPreview();
  });

  $('#extractBtn').addEventListener('click', () => {
    if (!state.hasImage || state.busy) return;
    runOcr();
  });
  $('#retakeBtn').addEventListener('click', retake);
  $('#cancelOcr').addEventListener('click', cancelOcr);

  $('#resultCopy').addEventListener('click', copyResult);
  $('#resultDownload').addEventListener('click', downloadResult);
  $('#resultShare').addEventListener('click', shareResult);
  $('#resultSpeak').addEventListener('click', speakResult);
  $('#resultClean').addEventListener('click', cleanResult);
  $('#resultClear').addEventListener('click', clearResult);

  $('#resultText').addEventListener('input', () => {
    updateResultStats(resultText());
  });

  $('#clearHistoryBtn').addEventListener('click', clearHistoryWithConfirm);

  $('#errorRetry').addEventListener('click', () => {
    const action = state.errorAction;
    clearError();
    if (action === 'camera') startCamera();
    else if (action === 'ocr') runOcr();
    else if (action === 'image') $('#imageInput').click();
  });

  window.addEventListener('hashchange', () => {
    const hash = location.hash.slice(1);
    if (hash === 'camera' || hash === 'image') setMode(hash, { silent: true });
  });

  window.addEventListener('project:langchange', (event) => {
    setLang(event && event.detail ? event.detail.lang : getLang());
    document.documentElement.lang = getLang();
    stopSpeech();
    updateLanguage();
  });

  window.addEventListener('beforeunload', () => {
    stopCamera();
    terminateWorker();
    stopSpeech();
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

/* -------------------------------------------------------------------------- */
/* Init                                                                       */
/* -------------------------------------------------------------------------- */

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
  state.language = state.settings.language;
  state.facing = state.settings.facing;
  state.grayscale = state.settings.grayscale;
  state.contrast = state.settings.contrast;
  state.history = loadHistory();
  state.video = $('#video');
  state.workCanvas = $('#previewCanvas');
  state.cameraStatus = 'idle';
  state.engineStatus = 'ready';

  const hash = location.hash.slice(1);
  state.mode = hash === 'camera' ? 'camera' : 'image';

  bindEvents();
  updateModeUi();
  updateLanguageUi();
  updatePreprocessUi();
  setCameraStatus('idle');
  setEngineStatus('ready');
  renderHistory();
  renderStage();
  updateUi();

  registerServiceWorker();

  window.__textlab = {
    getState: () => ({
      mode: state.mode,
      language: state.language,
      hasImage: state.hasImage,
      busy: state.busy,
      workerLang: state.workerLang,
      result: state.result,
      history: state.history,
      cameraStatus: state.cameraStatus,
      engineStatus: state.engineStatus
    }),
    runOcr,
    loadFile,
    setMode
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
