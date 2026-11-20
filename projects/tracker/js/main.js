/* Bootstrap del Camera Tracker: loop unico, filtri, PWA */

import { STORAGE_KEY, DEFAULT_SETTINGS, findFilter, FILTERS } from './config.js';
import { t, getLang, uiLang, setLang } from './i18n.js';
import * as camera from './camera.js';
import * as ai from './ai.js';
import * as filters from './filters.js';
import * as gallery from './gallery.js';
import * as subtitles from './subtitles.js';
import * as ui from './ui.js';

const $ = id => document.getElementById(id);
const canvas = $('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const video = $('video');

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return Object.assign({}, DEFAULT_SETTINGS, saved.settings || {});
  } catch (e) { return Object.assign({}, DEFAULT_SETTINGS); }
}

const settings = loadSettings();
try {
  const requestedFilter = new URLSearchParams(location.search).get('filter');
  if (requestedFilter) settings.filter = requestedFilter;
} catch (e) { /* ignore */ }
let currentFilter = findFilter(settings.filter);
let detectionResults = null;
let detectionMs = 0;
let lastDetection = 0;
let subtitleText = '';
let fps = 0;
let frames = 0;
let lastFpsUpdate = performance.now();
let timerValue = settings.timer || 0;
let timerId = null;
let cameraStarted = false;
let pinchStart = null;
let lastTap = 0;

function persistSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    saved.settings = settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch (e) { /* ignore */ }
}

function setFilterState(filter, state) {
  ui.setFilterState(filter.id, state);
}

async function selectFilter(filter) {
  if (filter.id === currentFilter.id && filter.ai) return;
  const previous = currentFilter;
  currentFilter = filter;
  settings.filter = filter.id;
  persistSettings();
  detectionResults = null;
  ui.setFilter(filter.id);
  ui.setStatus(t('status.ready'));

  if (filter.id !== 'subtitles') subtitles.stop();

  if (filter.voice) {
    if (!subtitles.isSupported()) {
      ui.toast(t('status.subtitleError'));
    } else {
      subtitles.start(
        text => { subtitleText = text; },
        key => ui.setStatus(t(key))
      );
    }
    return;
  }

  if (!filter.ai) { setFilterState(filter, null); return; }

  setFilterState(filter, 'loading');
  ui.setStatus(t('status.aiNeeded'));
  const result = await ai.prepare(filter, () => {
    ui.setStatus(t('status.aiNeeded'));
  });
  if (result.ok) {
    setFilterState(filter, null);
    ui.setStatus(t('status.aiReady'));
  } else {
    setFilterState(filter, 'error');
    ui.setStatus(t(result.reason === 'offline' ? 'status.offline' : 'status.cameraError'), 'error');
    ui.toast(t(result.reason === 'offline' ? 'msg.offlineAI' : 'msg.loadFail'));
    if (previous && previous.id) {
      currentFilter = previous;
      settings.filter = previous.id;
      ui.setFilter(previous.id);
    }
  }
}

async function startCamera() {
  camera.attach(video);
  camera.configure(settings);
  ui.setStatus(t('status.loading'));
  try {
    await camera.start();
    cameraStarted = true;
    ui.setStatus(t('status.ready'));
    ui.setTorchActive(false);
    ui.setZoom(settings.zoom || 1);
  } catch (error) {
    cameraStarted = false;
    const code = error && error.name === 'NotAllowedError' ? 'denied' : 'missing';
    ui.showPermissionError(t(code === 'denied' ? 'msg.cameraDenied' : 'msg.cameraMissing'));
    ui.setStatus(t('status.cameraError'), 'error');
    ui.showOverlay('permissionOverlay');
  }
}

function drawPlaceholder() {
  ctx.fillStyle = '#05080f';
  ctx.fillRect(0, 0, canvas.width || 640, canvas.height || 480);
}

function maybeDetect(now) {
  if (!currentFilter.ai || !cameraStarted || !detectionResultsReady()) return;
  const interval = 1000 / Math.max(1, settings.detectionFps || 10);
  if (now - lastDetection < interval) return;
  lastDetection = now;
  const started = performance.now();
  Promise.resolve(ai.detect(currentFilter, video)).then(result => {
    detectionResults = result;
    detectionMs = performance.now() - started;
  });
}

function detectionResultsReady() {
  if (currentFilter.id === 'tracker') return !!(window.AITracker && window.AITracker.targetEmbedding) || true;
  return true;
}

function frame(now) {
  if (cameraStarted && video.readyState >= 2 && video.videoWidth) {
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    const state = camera.getState();
    const opts = {
      mirror: state.facingMode === 'user' || state.mirror,
      digitalZoom: state.capabilities && state.capabilities.zoom ? 1 : state.zoom,
      slider: ui.getSliderValue(),
      segmentation: currentFilter.id === 'segment' ? detectionResults : null,
      subtitle: currentFilter.id === 'subtitles' ? subtitleText : '',
      tapText: t('filter.tracker') + ' — tap'
    };
    filters.renderFrame(ctx, video, canvas, currentFilter.id, opts);
    maybeDetect(now);
    if (currentFilter.ai || currentFilter.voice) {
      filters.renderOverlay(ctx, canvas, currentFilter.id, detectionResults, opts);
    }
  } else {
    drawPlaceholder();
  }

  frames++;
  if (now - lastFpsUpdate >= 500) {
    fps = Math.round(frames * 1000 / (now - lastFpsUpdate));
    frames = 0;
    lastFpsUpdate = now;
    if (!$('diagOverlay').classList.contains('hidden')) updateDiagnostics();
  }
  requestAnimationFrame(frame);
}

function updateDiagnostics() {
  ui.updateDiagnostics({
    fps,
    resolution: cameraStarted ? canvas.width + '×' + canvas.height : '—',
    model: ai.getModelStatus(currentFilter),
    detectionMs,
    online: navigator.onLine !== false
  });
}

async function takePhoto() {
  if (!cameraStarted) { ui.toast(t('status.cameraError')); return; }
  $('flash').style.opacity = '1';
  setTimeout(() => { $('flash').style.opacity = '0'; }, 110);
  try {
    await gallery.savePhoto(canvas.toDataURL('image/jpeg', 0.82), currentFilter.id);
    ui.toast(t('msg.photoSaved'));
  } catch (e) {
    ui.toast(t('status.saving'));
  }
}

function schedulePhoto() {
  if (timerId) return;
  const seconds = timerValue || 0;
  if (!seconds) { takePhoto(); return; }
  let remaining = seconds;
  ui.setCountdown(remaining);
  timerId = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      ui.setCountdown(remaining);
    } else {
      clearInterval(timerId);
      timerId = null;
      ui.setCountdown(0);
      takePhoto();
    }
  }, 1000);
}

async function openGallery() {
  ui.showOverlay('galleryOverlay');
  try { ui.renderGallery(await gallery.listPhotos()); }
  catch (e) { ui.toast(t('status.noPhotos')); }
}

/* gestures: doppio tap = switch camera, pinch = zoom */
canvas.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch') {
    const now = Date.now();
    if (now - lastTap < 300) { camera.switchFacing().then(() => ui.setZoom(settings.zoom || 1)); }
    lastTap = now;
  }
});

canvas.addEventListener('touchstart', event => {
  if (event.touches.length === 2) {
    pinchStart = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY
    );
  }
}, { passive: true });

canvas.addEventListener('touchmove', event => {
  if (event.touches.length === 2 && pinchStart) {
    const dist = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY
    );
    const zoom = Math.max(1, Math.min(5, (settings.zoom || 1) + (dist - pinchStart) * 0.006));
    settings.zoom = zoom;
    ui.setZoom(zoom);
    camera.setZoom(zoom);
    pinchStart = dist;
    persistSettings();
  }
}, { passive: true });

canvas.addEventListener('touchend', () => { pinchStart = null; });

canvas.addEventListener('click', async event => {
  if (currentFilter.id !== 'tracker' || !detectionResults || !detectionResults.all) return;
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  const state = camera.getState();
  const mirror = state.facingMode === 'user' || state.mirror;
  const hit = detectionResults.all.find(p => {
    const [bx, by, bw, bh] = p.bbox;
    const fx = mirror ? canvas.width - bx - bw : bx;
    return x >= fx && x <= fx + bw && y >= by && y <= by + bh;
  });
  if (hit) {
    await ai.setTrackerTarget(video, hit.bbox, currentFilter);
    ui.toast(t('filter.tracker') + ': ' + hit.class);
  }
});

/* PWA events */
window.addEventListener('online', () => { ui.setOnline(false); updateDiagnostics(); });
window.addEventListener('offline', () => { ui.setOnline(true); updateDiagnostics(); });
ui.setOnline(navigator.onLine === false);

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  $('installBtn').classList.remove('hidden');
});
window.addEventListener('appinstalled', () => $('installBtn').classList.add('hidden'));
$('installBtn').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  try { await deferredPrompt.userChoice; } catch (e) { /* ignore */ }
  deferredPrompt = null;
  $('installBtn').classList.add('hidden');
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js', { scope: './' }).then(registration => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          window.__trackerWaitingWorker = worker;
          $('updateBar').classList.remove('hidden');
        }
      });
    });
  }).catch(() => { /* il tracker resta utilizzabile online */ });
}

/* Init */
ui.initUI({
  onStart: startCamera,
  onFilter: selectFilter,
  onSlider: value => { settings.slider = value; persistSettings(); },
  onSwitch: async () => { await camera.switchFacing(); },
  onTorch: async () => { const on = await camera.toggleTorch(); ui.setTorchActive(on); },
  onTimer: () => {
    timerValue = timerValue ? 0 : (settings.timer || 3);
    ui.setTimerActive(!!timerValue);
    ui.toast(timerValue ? t('msg.timer', { n: timerValue }) : t('common.off'));
  },
  onZoom: value => { settings.zoom = value; camera.setZoom(value); persistSettings(); },
  onShutter: schedulePhoto,
  onOpenGallery: openGallery,
  onClearGallery: async () => {
    await gallery.clearPhotos();
    ui.renderGallery([]);
    ui.toast(t('status.noPhotos'));
  },
  onDeletePhoto: async id => {
    await gallery.deletePhoto(id);
    ui.renderGallery(await gallery.listPhotos());
  },
  onSharePhoto: async photo => {
    try { await gallery.sharePhoto(photo); }
    catch (e) { ui.toast(t('status.shareFail')); }
  },
  onSetting: (key, value) => {
    settings[key] = value;
    if (key === 'language') setLang(value);
    if (key === 'timer') timerValue = value;
    if (key === 'resolution') camera.setResolution(value);
    if (key === 'mirror') camera.configure({ mirror: value });
    persistSettings();
  }
}, settings);

ui.setFilter(currentFilter.id);
ui.setTimerActive(!!timerValue);
requestAnimationFrame(frame);
