/* Bootstrap del Camera Tracker: loop unico, filtri, PWA */

import { STORAGE_KEY, DEFAULT_SETTINGS, findFilter, FILTERS } from './config.js';
import { t, getLang, uiLang, setLang } from './i18n.js';
import * as camera from './camera.js';
import * as ai from './ai.js';
import * as filters from './filters.js';
import * as gallery from './gallery.js';
import * as subtitles from './subtitles.js';
import * as ui from './ui.js';
import { MediaPipeEngine, MP_FILTERS, modelLabel } from './mediapipe.js';
import { drawStickers, drawPose, poseFromMatrix, STICKERS } from './ar.js';
import { createScanner, drawBoxes } from './barcode.js';
import { createRecorder } from './recorder.js';
import { drawGrid, drawLevel, drawHistogram } from './photo-tools.js';
import { createVoice } from './voice.js';

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

const mpEngine = new MediaPipeEngine();
let barcodeScanner = null;
let qrCodes = [];
let recorderInst = null;
let voiceInst = null;
let histogramData = null;
let lastHistogram = 0;

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

  if (filter.id !== 'subtitles') { subtitles.stop(); if (voiceInst) voiceInst.stop(); }

  if (filter.voice) {
    if (!voiceInst) {
      voiceInst = createVoice({
        lang: settings.language || 'it-IT',
        onTranscript: (text) => { subtitleText = text; },
        onCommand: handleVoiceCommand,
        onStatus: (status) => ui.setStatus(t(status === 'error' ? 'status.subtitleError' : 'status.subtitleListening'))
      });
    }
    if (!voiceInst.start(settings.language || 'it-IT')) ui.toast(t('status.subtitleError'));
    return;
  }

  if (filter.barcode) {
    if (!barcodeScanner) barcodeScanner = await createScanner();
    if (!barcodeScanner) {
      ui.toast('BarcodeDetector non supportato');
      setFilterState(filter, 'error');
    } else setFilterState(filter, null);
    return;
  }

  if (!filter.ai) { setFilterState(filter, null); return; }

  setFilterState(filter, 'loading');
  ui.setStatus(t('status.aiNeeded'));
  let ready = false;
  if (filter.runtime === 'mediapipe' && settings.aiRuntime !== 'legacy') {
    const needed = MP_FILTERS[filter.id] || [];
    try {
      ready = await mpEngine.prepare(needed, (task) => ui.setStatus('MediaPipe: ' + (task === 'wasm' ? 'WASM…' : modelLabel(task))));
    } catch (e) { ready = false; }
  } else {
    const result = await ai.prepare(filter, () => ui.setStatus(t('status.aiNeeded')));
    ready = result.ok;
  }
  if (ready) {
    setFilterState(filter, null);
    ui.setStatus(t('status.aiReady'));
  } else {
    setFilterState(filter, 'error');
    ui.setStatus(t('status.cameraError'), 'error');
    ui.toast(t('msg.loadFail'));
    if (previous && previous.id) {
      currentFilter = previous;
      settings.filter = previous.id;
      ui.setFilter(previous.id);
    }
  }
}

function handleVoiceCommand(command) {
  if (command === 'capture') schedulePhoto();
  else if (command === 'record') toggleRecording();
  else if (command === 'stop') stopAll();
  else if (command === 'grid') toggleTool('grid');
}

function toggleTool(name) {
  settings[name] = !settings[name];
  persistSettings();
  ui.toast(name.toUpperCase() + ': ' + (settings[name] ? 'ON' : 'OFF'));
}

function stopAll() {
  if (recorderInst && (recorderInst.recording || recorderInst.timelapse)) toggleRecording();
  if (voiceInst) voiceInst.stop();
}

function toggleRecording() {
  if (!cameraStarted) { ui.toast(t('status.cameraError')); return; }
  if (recorderInst && (recorderInst.recording || recorderInst.timelapse)) {
    recorderInst.stop();
    ui.toast('Registrazione fermata');
    return;
  }
  recorderInst = createRecorder({ onStop: () => ui.toast('Video salvato') });
  const timelapseMs = Number(settings.timelapse || 0) * 1000;
  const ok = recorderInst.start(canvas, {
    timelapseMs,
    onFrame: (count) => ui.toast('Time-lapse ' + count)
  });
  ui.toast(ok ? (timelapseMs ? 'Time-lapse avviato' : 'Registrazione avviata') : 'Registrazione non supportata');
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
  if (!cameraStarted) return;
  const isMP = currentFilter.runtime === 'mediapipe' && settings.aiRuntime !== 'legacy' && currentFilter.ai;
  const isQR = !!currentFilter.barcode;
  if (!currentFilter.ai && !isQR) return;
  const interval = 1000 / Math.max(1, settings.detectionFps || 10);
  if (now - lastDetection < interval) return;
  lastDetection = now;
  const started = performance.now();
  if (isMP) {
    const names = MP_FILTERS[currentFilter.id] || [];
    detectionResults = {};
    names.forEach((name) => { detectionResults[name] = mpEngine.detect(name, video); });
    detectionMs = performance.now() - started;
    if (currentFilter.id === 'pose') {
      const matrix = detectionResults.pose && detectionResults.pose.facialTransformationMatrixes && detectionResults.pose.facialTransformationMatrixes[0];
      void matrix;
    }
  } else if (isQR && barcodeScanner) {
    barcodeScanner.detect(video).then((codes) => {
      qrCodes = codes || [];
      detectionMs = performance.now() - started;
    });
  } else {
    Promise.resolve(ai.detect(currentFilter, video)).then(result => {
      detectionResults = result;
      detectionMs = performance.now() - started;
    });
  }
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
    const useMP = currentFilter.runtime === 'mediapipe' && settings.aiRuntime !== 'legacy';
    if ((currentFilter.ai || currentFilter.voice) && !useMP) {
      filters.renderOverlay(ctx, canvas, currentFilter.id, detectionResults, opts);
    }
    if (currentFilter.id === 'objects' && detectionResults && detectionResults.objects && detectionResults.objects.detections) {
      ctx.save();
      ctx.lineWidth = 2;
      ctx.font = '600 11px ui-monospace, monospace';
      for (const detection of detectionResults.objects.detections) {
        const box = detection.boundingBox;
        if (!box) continue;
        ctx.strokeStyle = '#67e8f9';
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        const category = detection.categories && detection.categories[0];
        const label = (category ? category.categoryName : 'object') + ' ' + Math.round((category ? category.score : 0) * 100) + '%';
        ctx.fillStyle = 'rgba(4,10,24,.8)';
        ctx.fillRect(box.x, Math.max(0, box.y - 18), ctx.measureText(label).width + 10, 17);
        ctx.fillStyle = '#eef2ff';
        ctx.fillText(label, box.x + 5, Math.max(12, box.y - 5));
      }
      ctx.restore();
    }

    if (currentFilter.id === 'ar' && detectionResults && detectionResults.face) {
      drawStickers(ctx, detectionResults.face, canvas.width, canvas.height, settings.stickers || []);
    }
    let tilt = 0;
    if (currentFilter.id === 'ar' && detectionResults && detectionResults.face && detectionResults.face.facialTransformationMatrixes) {
      tilt = poseFromMatrix(detectionResults.face.facialTransformationMatrixes[0]?.data).roll;
    }
    if (currentFilter.id === 'pose' && detectionResults && detectionResults.pose && detectionResults.pose.poseLandmarks) {
      const points = detectionResults.pose.poseLandmarks[0];
      if (points && points[11] && points[12]) {
        tilt = Math.atan2(points[12].y - points[11].y, points[12].x - points[11].x) * 180 / Math.PI;
        drawPose(ctx, { yaw: 0, pitch: 0, roll: tilt }, canvas.width - 70, 70, 90);
      }
    }
    if (currentFilter.barcode) drawBoxes(ctx, qrCodes, canvas.width, canvas.height);
    if (settings.grid) drawGrid(ctx, canvas.width, canvas.height);
    if (settings.level) drawLevel(ctx, canvas.width, canvas.height, tilt);
    if (settings.histogram && now - lastHistogram > 600) {
      lastHistogram = now;
      try { histogramData = ctx.getImageData(0, 0, canvas.width, canvas.height); } catch (e) {}
    }
    if (settings.histogram && histogramData) drawHistogram(ctx, histogramData, 12, canvas.height - 92, 160, 72);
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

/* Nuovi controlli AR / tool / registrazione */
function buildStickerTray() {
  const tray = $('stickerTray');
  if (!tray) return;
  tray.innerHTML = STICKERS.map((item) => `<button type="button" class="sticker-btn ${(settings.stickers || []).includes(item.id) ? 'on' : ''}" data-sticker="${item.id}" title="${item.id}">${item.emoji}</button>`).join('');
  tray.querySelectorAll('[data-sticker]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.sticker;
    settings.stickers = settings.stickers || [];
    if (settings.stickers.includes(id)) settings.stickers = settings.stickers.filter((value) => value !== id);
    else settings.stickers.push(id);
    button.classList.toggle('on', settings.stickers.includes(id));
    persistSettings();
  }));
}

const toolButtons = [
  ['btnGrid', 'grid'], ['btnLevel', 'level'], ['btnHistogram', 'histogram']
];
toolButtons.forEach(([id, key]) => {
  const button = $(id);
  if (!button) return;
  button.classList.toggle('active', !!settings[key]);
  button.addEventListener('click', () => {
    toggleTool(key);
    button.classList.toggle('active', !!settings[key]);
  });
});
$('btnRecord')?.addEventListener('click', toggleRecording);
$('btnVoice')?.addEventListener('click', () => {
  if (!voiceInst) {
    voiceInst = createVoice({
      lang: settings.language || 'it-IT',
      onTranscript: (text) => { subtitleText = text; },
      onCommand: handleVoiceCommand,
      onStatus: (status) => ui.setStatus(t(status === 'error' ? 'status.subtitleError' : 'status.subtitleListening'))
    });
  }
  const active = voiceInst.toggle(settings.language || 'it-IT');
  $('btnVoice')?.classList.toggle('active', active);
});
if ($('aiRuntimeSelect')) {
  $('aiRuntimeSelect').value = settings.aiRuntime || 'mediapipe';
  $('aiRuntimeSelect').addEventListener('change', (event) => {
    settings.aiRuntime = event.target.value;
    persistSettings();
    ui.toast('Runtime AI: ' + event.target.value);
  });
}
if ($('timelapseSelect')) {
  $('timelapseSelect').value = String(settings.timelapse || 0);
  $('timelapseSelect').addEventListener('change', (event) => {
    settings.timelapse = Number(event.target.value);
    persistSettings();
  });
}
buildStickerTray();

ui.setFilter(currentFilter.id);
ui.setTimerActive(!!timerValue);
requestAnimationFrame(frame);
