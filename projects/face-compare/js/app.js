/**
 * app.js — Face Compare: camera, engine MediaPipe, confronto e UI.
 * Nessun frame viene inviato a server esterni.
 */

import * as m from './metrics.js';
import { FaceEngine } from './face-engine.js';
import { applyStatic, getLang, initLang, onLanguageChange, setLang, t } from './i18n.js';
import {
  addHistory, clearHistory, deleteProfile, loadHistory, loadProfiles,
  loadSettings, saveProfile, saveSettings
} from './storage.js';

const $ = (id) => document.getElementById(id);
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 52;

const state = {
  engine: null,
  modelPromise: null,
  modelStatus: 'idle',
  cameraRunning: false,
  stream: null,
  raf: 0,
  lastAnalyze: 0,
  fps: 0,
  frames: 0,
  fpsAt: 0,
  ref: null,
  live: null,
  scores: [],
  settings: loadSettings(),
  profiles: loadProfiles(),
  history: loadHistory(),
  objectUrls: { ref: null, live: null },
  lastHistoryAt: 0,
  lastScore: null
};

/* ------------------------------------------------------------------ */
/* Stato e messaggi                                                     */
/* ------------------------------------------------------------------ */

function setModelStatus(kind) {
  state.modelStatus = kind;
  const pill = $('model-pill');
  pill.className = 'pill ' + kind;
  pill.textContent = t('status.model' + kind[0].toUpperCase() + kind.slice(1));
  if (kind === 'error') toast(t('messages.modelFailed'), true);
}

function setCameraStatus(running) {
  state.cameraRunning = running;
  const pill = $('camera-pill');
  pill.className = 'pill ' + (running ? 'live' : 'off');
  pill.textContent = t(running ? 'status.cameraLive' : 'status.cameraOff');
  $('btn-camera').textContent = t(running ? 'actions.stopCamera' : 'actions.startCamera');
  $('btn-camera').classList.toggle('is-danger', running);
  $('btn-capture').disabled = !running;
  $('live-video').classList.toggle('hidden', !running);
  $('live-img').classList.toggle('hidden', running || !state.objectUrls.live);
  $('live-drop').classList.toggle('has-camera', running);
  if (!state.objectUrls.live && !running) $('live-drop').classList.remove('has-image');
}

let toastTimer = null;
function toast(message, isError = false) {
  const el = $('toast');
  el.textContent = message;
  el.classList.toggle('error', isError);
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
}

function askConfirm(message) {
  const dialog = $('confirm-dialog');
  $('confirm-text').textContent = message;
  dialog.showModal();
  return new Promise((resolve) => {
    const ok = $('confirm-ok');
    const cancel = $('confirm-cancel');
    const cleanup = (value) => {
      ok.onclick = null; cancel.onclick = null;
      dialog.onclose = null;
      if (dialog.open) dialog.close();
      resolve(value);
    };
    ok.onclick = () => cleanup(true);
    cancel.onclick = () => cleanup(false);
    dialog.onclose = () => resolve(false);
  });
}

/* ------------------------------------------------------------------ */
/* Modello                                                              */
/* ------------------------------------------------------------------ */

async function ensureEngine() {
  if (state.engine) return state.engine;
  if (state.modelPromise) return state.modelPromise;
  setModelStatus('loading');
  state.modelPromise = FaceEngine.create(setModelStatus)
    .then((engine) => {
      state.engine = engine;
      return engine;
    })
    .catch((error) => {
      console.error('[Face Compare] modello', error);
      setModelStatus('error');
      state.modelPromise = null;
      throw error;
    });
  return state.modelPromise;
}

/* ------------------------------------------------------------------ */
/* Analisi                                                              */
/* ------------------------------------------------------------------ */

function setImage(slot, source) {
  const img = $('ref-img');
  const url = URL.createObjectURL(source);
  if (state.objectUrls[slot]) URL.revokeObjectURL(state.objectUrls[slot]);
  state.objectUrls[slot] = url;
  img.src = url;
  $('ref-drop').classList.add('has-image');
  return new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
  });
}

function setLiveImage(source) {
  const img = $('live-img');
  const url = URL.createObjectURL(source);
  if (state.objectUrls.live) URL.revokeObjectURL(state.objectUrls.live);
  state.objectUrls.live = url;
  img.src = url;
  $('live-drop').classList.add('has-image');
  return new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
  });
}

async function analyzeSlot(slot, source, label) {
  let result = null;
  try {
    const engine = await ensureEngine();
    result = engine.analyze(source);
  } catch (error) {
    toast(t('messages.modelFailed'), true);
    return null;
  }
  if (slot === 'ref') {
    if (!result.landmarks) { toast(t('warnings.noFace'), true); return result; }
    state.ref = {
      name: label || t('labels.reference'),
      geometry: result.geometry,
      appearance: result.appearance
    };
    $('ref-label').textContent = state.ref.name;
    $('ref-badge').textContent = Math.round(result.quality.score * 100) + '%';
    drawAligned('ref-aligned', result.aligned);
    toast(t('messages.referenceReady'));
  } else {
    state.live = result;
    drawLiveOverlay(result);
    drawAligned('live-aligned', result.aligned);
    updateLiveChips(result);
    compare();
  }
  return result;
}

function drawAligned(id, source) {
  const canvas = $(id);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!source) return;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
}

function drawLiveOverlay(result) {
  const ref = result && result.landmarks ? $('live-overlay') : null;
  const ctx = ref ? ref.getContext('2d') : null;
  if (!ctx || !state.settings.overlay) {
    if (ctx) ctx.clearRect(0, 0, ref.width, ref.height);
    return;
  }
  const visible = state.cameraRunning ? $('live-video') : $('live-img');
  const box = visible.getBoundingClientRect();
  const w = box.width || result.width;
  const h = box.height || result.height;
  if (ref.width !== Math.round(w) || ref.height !== Math.round(h)) {
    ref.width = Math.round(w);
    ref.height = Math.round(h);
  }
  state.engine.drawOverlay(ctx, result.landmarks, ref.width, ref.height);
}

function updateLiveChips(result) {
  $('chip-quality').textContent = t('labels.quality') + ' ' + Math.round(result.quality.score * 100) + '%';
  $('chip-faces').textContent = t('labels.faces') + ' ' + result.faceCount;
  const pose = result.pose || { yaw: 0, pitch: 0, roll: 0 };
  $('chip-pose').textContent = t('labels.pose') + ' ' + Math.round(pose.yaw) + '°/' + Math.round(pose.pitch) + '°';
  $('chip-fps').textContent = t('labels.fps') + ' ' + (state.fps || '—');
}

function renderWarnings(result) {
  const holder = $('warning-list');
  holder.innerHTML = '';
  if (!result || result.faceCount === 0) return;
  (result.quality.flags || []).forEach((flag) => {
    const key = 'warnings.' + flag;
    const chip = document.createElement('span');
    chip.className = 'warning-chip';
    chip.textContent = '⚠ ' + t(key);
    holder.appendChild(chip);
  });
}

function compare() {
  if (!state.ref || !state.live || !state.live.landmarks) {
    updateGauge(0, null);
    $('confidence-desc').textContent = t(state.ref ? 'messages.needLive' : 'messages.needReference');
    return;
  }
  const geometry = m.cosineSimilarity(state.ref.geometry, state.live.geometry);
  const appearance = m.cosineSimilarity(state.ref.appearance, state.live.appearance);
  const score = Math.round(m.scoreFromSimilarities(geometry, appearance, state.settings.geometryWeight) * 100);
  const band = m.confidenceBand(score);
  state.lastScore = score;

  updateGauge(score, band);
  renderWarnings(state.live);
  $('confidence-desc').textContent = t('bands.' + band.key + 'Desc');

  if (state.live.quality.score >= 0.25) {
    state.scores.push(score);
    if (state.scores.length > 60) state.scores.shift();
    drawSparkline();
  }
  const now = Date.now();
  if (now - state.lastHistoryAt > 2000) {
    state.lastHistoryAt = now;
    state.history = addHistory({ score, reference: state.ref.name, source: state.cameraRunning ? 'camera' : 'image' });
    renderHistory();
  }
}

function updateGauge(score, band) {
  $('gauge-value').textContent = String(score);
  $('gauge-progress').style.strokeDashoffset = String(GAUGE_CIRCUMFERENCE * (1 - score / 100));
  const gauge = $('gauge');
  gauge.classList.toggle('is-high', !!band && band.key === 'high');
  gauge.classList.toggle('is-medium', !!band && band.key === 'medium');
  const badge = $('confidence-badge');
  badge.textContent = band ? t('bands.' + band.key) : '—';
  badge.className = 'badge ' + (band ? band.key : '');
}

function drawSparkline() {
  const canvas = $('sparkline');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 300, h = 70;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,.08)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath(); ctx.moveTo(0, (h / 4) * i); ctx.lineTo(w, (h / 4) * i); ctx.stroke();
  }
  if (state.scores.length < 2) return;
  const step = w / Math.max(1, state.scores.length - 1);
  ctx.beginPath();
  state.scores.forEach((value, i) => {
    const x = i * step, y = h - (value / 100) * (h - 8) - 4;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, 'rgba(34,211,238,.28)');
  gradient.addColorStop(1, 'rgba(34,211,238,0)');
  ctx.fillStyle = gradient;
  ctx.fill();
}

/* ------------------------------------------------------------------ */
/* Camera                                                               */
/* ------------------------------------------------------------------ */

async function startCamera() {
  if (state.cameraRunning) return;
  try {
    await ensureEngine();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    state.stream = stream;
    const video = $('live-video');
    video.srcObject = stream;
    await video.play();
    setCameraStatus(true);
    $('live-media').classList.toggle('mirrored', state.settings.mirror);
    state.lastAnalyze = 0;
    state.fpsAt = performance.now();
    state.frames = 0;
    state.raf = requestAnimationFrame(cameraTick);
  } catch (error) {
    toast(t('messages.cameraDenied', { error: error && error.message ? error.message : error }), true);
    setCameraStatus(false);
  }
}

function cameraTick(now) {
  if (!state.cameraRunning) return;
  if (now - state.lastAnalyze > 95) {
    state.lastAnalyze = now;
    const video = $('live-video');
    if (video.readyState >= 2) {
      try { analyzeSlot('live', video); } catch (e) { console.warn(e); }
      state.frames += 1;
      if (now - state.fpsAt >= 1000) {
        state.fps = Math.round((state.frames * 1000) / (now - state.fpsAt));
        state.frames = 0;
        state.fpsAt = now;
        if (state.live) $('chip-fps').textContent = t('labels.fps') + ' ' + state.fps;
      }
    }
  }
  state.raf = requestAnimationFrame(cameraTick);
}

function stopCamera() {
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = 0;
  if (state.stream) state.stream.getTracks().forEach((track) => track.stop());
  state.stream = null;
  $('live-video').srcObject = null;
  setCameraStatus(false);
}

function captureReference() {
  const video = $('live-video');
  if (!video || !state.cameraRunning || video.readyState < 2) return;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  captureReferenceFromCanvas(canvas);
}

async function captureReferenceFromCanvas(canvas) {
  const dataUrl = canvas.toDataURL('image/png');
  if (state.objectUrls.ref) URL.revokeObjectURL(state.objectUrls.ref);
  state.objectUrls.ref = dataUrl;
  $('ref-img').src = dataUrl;
  $('ref-drop').classList.add('has-image');
  const img = $('ref-img');
  if (!img.complete) await new Promise((resolve) => { img.onload = resolve; });
  await analyzeSlot('ref', img, t('labels.reference'));
  toast(t('messages.captureDone'));
}

/* ------------------------------------------------------------------ */
/* Profili, storico, export                                             */
/* ------------------------------------------------------------------ */

function renderProfiles() {
  const list = $('profiles-list');
  list.innerHTML = '';
  if (!state.profiles.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-note';
    empty.textContent = t('labels.noProfiles');
    list.appendChild(empty);
    return;
  }
  state.profiles.forEach((profile) => {
    const row = document.createElement('div');
    row.className = 'list-row';
    const info = document.createElement('div');
    info.className = 'row-info';
    const name = document.createElement('strong');
    name.textContent = profile.name;
    const when = document.createElement('small');
    when.textContent = t('labels.savedAt', { time: new Date(profile.createdAt).toLocaleTimeString() });
    info.append(name, when);
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    const load = document.createElement('button');
    load.className = 'btn small';
    load.textContent = t('actions.load');
    load.onclick = () => loadProfile(profile);
    const del = document.createElement('button');
    del.className = 'btn small ghost';
    del.textContent = t('actions.delete');
    del.onclick = () => {
      deleteProfile(profile.id);
      state.profiles = loadProfiles();
      renderProfiles();
      toast(t('messages.profileDeleted'));
    };
    actions.append(load, del);
    row.append(info, actions);
    list.appendChild(row);
  });
}

function renderHistory() {
  const list = $('history-list');
  list.innerHTML = '';
  if (!state.history.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-note';
    empty.textContent = t('labels.noHistory');
    list.appendChild(empty);
    return;
  }
  state.history.slice(0, 12).forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'list-row';
    const info = document.createElement('div');
    info.className = 'row-info';
    const value = document.createElement('strong');
    value.textContent = entry.score + '%';
    const detail = document.createElement('small');
    detail.textContent = new Date(entry.at).toLocaleTimeString() + ' · ' + entry.reference;
    info.append(value, detail);
    const bar = document.createElement('div');
    bar.className = 'history-bar';
    const fill = document.createElement('span');
    fill.style.width = entry.score + '%';
    bar.appendChild(fill);
    row.append(info, bar);
    list.appendChild(row);
  });
}

function loadProfile(profile) {
  state.ref = {
    name: profile.name,
    geometry: Float32Array.from(profile.geometry || []),
    appearance: Float32Array.from(profile.appearance || [])
  };
  $('ref-label').textContent = profile.name;
  $('ref-badge').textContent = '✓';
  $('ref-drop').classList.add('has-image');
  drawAligned('ref-aligned', null);
  compare();
  toast(t('messages.profileLoaded', { name: profile.name }));
}

async function saveCurrentProfile() {
  if (!state.ref) { toast(t('messages.needReference'), true); return; }
  const dialog = $('name-dialog');
  $('name-help').textContent = t('messages.askNameHelp');
  dialog.showModal();
  const name = await new Promise((resolve) => {
    const form = $('name-form');
    const input = $('profile-name');
    input.value = t('labels.reference');
    const done = (value) => {
      form.onsubmit = null;
      $('name-cancel').onclick = null;
      dialog.onclose = null;
      if (dialog.open) dialog.close();
      resolve(value);
    };
    form.onsubmit = (e) => { e.preventDefault(); done(input.value.trim()); };
    $('name-cancel').onclick = () => done(null);
    dialog.onclose = () => resolve(null);
    setTimeout(() => { input.focus(); input.select(); }, 30);
  });
  if (!name) return;
  const profile = saveProfile({ name, geometry: state.ref.geometry, appearance: state.ref.appearance });
  if (!profile) { toast(t('messages.modelFailed'), true); return; }
  state.ref.name = name;
  $('ref-label').textContent = name;
  state.profiles = loadProfiles();
  renderProfiles();
  toast(t('messages.profileSaved', { name }));
}

function exportSnapshot() {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 1200, 720);
  gradient.addColorStop(0, '#0b1220');
  gradient.addColorStop(1, '#131f38');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 720);
  ctx.fillStyle = '#eaf6ff';
  ctx.font = '700 40px system-ui';
  ctx.fillText(t('app.title'), 60, 80);
  ctx.fillStyle = '#8ba3c7';
  ctx.font = '20px system-ui';
  ctx.fillText(new Date().toLocaleString(), 60, 116);

  const drawPanel = (x, titleImage, alignedCanvas, caption) => {
    ctx.fillStyle = 'rgba(255,255,255,.04)';
    ctx.fillRect(x, 160, 520, 420);
    ctx.fillStyle = '#22d3ee';
    ctx.font = '600 22px system-ui';
    ctx.fillText(caption, x + 24, 202);
    try {
      if (alignedCanvas && alignedCanvas.width) ctx.drawImage(alignedCanvas, x + 130, 230, 260, 260);
      else if (titleImage && titleImage.src) ctx.drawImage(titleImage, x + 40, 230, 440, 260);
      else ctx.fillText('—', x + 240, 380);
    } catch (e) { ctx.fillText('—', x + 240, 380); }
  };
  drawPanel(60, $('ref-img'), $('ref-aligned'), t('labels.reference') + ': ' + (state.ref ? state.ref.name : '—'));
  drawPanel(620, $('live-img'), $('live-aligned'), t('labels.live'));

  ctx.fillStyle = state.lastScore >= 75 ? '#34d399' : state.lastScore >= 55 ? '#fbbf24' : '#fb7185';
  ctx.font = '800 96px system-ui';
  ctx.fillText((state.lastScore == null ? 0 : state.lastScore) + '%', 60, 660);
  ctx.fillStyle = '#8ba3c7';
  ctx.font = '22px system-ui';
  ctx.fillText(t('labels.confidence') + ': ' + (state.lastScore == null ? '—' : $('confidence-badge').textContent), 320, 660);
  ctx.font = '14px system-ui';
  ctx.fillText(t('messages.descriptorNote'), 60, 700);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'face-compare-' + Date.now() + '.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast(t('messages.snapshotSaved'));
  }, 'image/png');
}

/* ------------------------------------------------------------------ */
/* Eventi                                                               */
/* ------------------------------------------------------------------ */

function handleFile(file, slot) {
  if (!file || !file.type.startsWith('image/')) return;
  if (slot === 'ref') {
    setImage('ref', file).then(() => analyzeSlot('ref', $('ref-img'), file.name)).catch(() => toast(t('messages.modelFailed'), true));
  } else {
    stopCamera();
    setLiveImage(file).then(() => analyzeSlot('live', $('live-img'))).catch(() => toast(t('messages.modelFailed'), true));
  }
}

function bindDropzone(id, slot) {
  const zone = $(id);
  ['dragenter', 'dragover'].forEach((type) => zone.addEventListener(type, (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  }));
  ['dragleave', 'drop'].forEach((type) => zone.addEventListener(type, (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
  }));
  zone.addEventListener('drop', (e) => {
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file, slot);
  });
}

function swapSides() {
  if (!state.ref) { toast(t('messages.needReference'), true); return; }
  if (state.cameraRunning) { captureReference(); return; }
  const refImg = $('ref-img'), liveImg = $('live-img');
  if (!refImg.src || !liveImg.src) { toast(t('messages.needLive'), true); return; }
  const oldSrc = refImg.src;
  refImg.src = liveImg.src;
  liveImg.src = oldSrc;
  const oldRef = state.ref;
  state.ref = { name: t('labels.live'), geometry: state.live ? state.live.geometry : oldRef.geometry, appearance: state.live ? state.live.appearance : oldRef.appearance };
  $('ref-label').textContent = state.ref.name;
  if (state.live) {
    const oldLive = state.live;
    state.live = { ...oldLive, geometry: oldRef.geometry, appearance: oldRef.appearance };
  }
  compare();
}

function refreshTexts() {
  applyStatic(document);
  setCameraStatus(state.cameraRunning);
  setModelStatus(state.modelStatus);
  const net = navigator.onLine ? 'online' : 'offline';
  $('net-pill').textContent = t('status.' + net);
  $('lang-toggle').textContent = getLang() === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  if (state.ref && !$('ref-label').textContent) $('ref-label').textContent = state.ref.name;
  if (state.live) {
    updateLiveChips(state.live);
    renderWarnings(state.live);
  } else $('warning-list').innerHTML = '';
  compare();
  renderProfiles();
  renderHistory();
}

function init() {
  initLang();
  document.documentElement.lang = getLang();
  applyStatic(document);
  state.profiles = loadProfiles();
  state.history = loadHistory();

  $('lang-toggle').addEventListener('click', () => setLang(getLang() === 'it' ? 'en' : 'it'));
  onLanguageChange(refreshTexts);

  $('ref-input').addEventListener('change', (e) => handleFile(e.target.files[0], 'ref'));
  $('live-input').addEventListener('change', (e) => handleFile(e.target.files[0], 'live'));
  bindDropzone('ref-drop', 'ref');
  bindDropzone('live-drop', 'live');

  $('btn-camera').addEventListener('click', () => state.cameraRunning ? stopCamera() : startCamera());
  $('btn-capture').addEventListener('click', captureReference);
  $('btn-compare').addEventListener('click', () => {
    const source = state.cameraRunning ? $('live-video') : $('live-img');
    if (!state.ref) { toast(t('messages.needReference'), true); return; }
    if (!source || !source.src && !state.cameraRunning) { toast(t('messages.needLive'), true); return; }
    if (state.cameraRunning) analyzeSlot('live', source);
    else if (state.live) compare();
  });
  $('btn-swap').addEventListener('click', swapSides);
  $('btn-save-profile').addEventListener('click', saveCurrentProfile);
  $('btn-export').addEventListener('click', exportSnapshot);
  $('btn-clear').addEventListener('click', async () => {
    if (!(await askConfirm(t('messages.clearAll')))) return;
    stopCamera();
    state.ref = null; state.live = null; state.scores = [];
    state.history = clearHistory();
    $('ref-img').removeAttribute('src');
    $('live-img').removeAttribute('src');
    $('ref-drop').classList.remove('has-image');
    $('live-drop').classList.remove('has-image');
    $('ref-aligned').getContext('2d').clearRect(0, 0, 256, 256);
    $('live-aligned').getContext('2d').clearRect(0, 0, 256, 256);
    $('ref-overlay').getContext('2d').clearRect(0, 0, 300, 200);
    $('live-overlay').getContext('2d').clearRect(0, 0, 300, 200);
    $('warning-list').innerHTML = '';
    $('confidence-desc').textContent = t('messages.needReference');
    drawSparkline(); updateGauge(0, null); renderHistory();
    toast(t('actions.clear'));
  });

  $('overlay-toggle').addEventListener('change', (e) => {
    state.settings = saveSettings({ overlay: e.target.checked });
    if (!e.target.checked) {
      ['ref-overlay', 'live-overlay'].forEach((id) => {
        const canvas = $(id);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      });
    }
    toast(t(e.target.checked ? 'messages.overlayOn' : 'messages.overlayOff'));
  });
  $('mirror-toggle').addEventListener('change', (e) => {
    state.settings = saveSettings({ mirror: e.target.checked });
    $('live-media').classList.toggle('mirrored', e.target.checked);
  });
  $('weight-range').addEventListener('input', (e) => {
    state.settings = saveSettings({ geometryWeight: Number(e.target.value) / 100 });
    $('weight-value').textContent = e.target.value + '%';
    if (state.live) compare();
  });

  document.addEventListener('paste', (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        handleFile(item.getAsFile(), 'live');
        e.preventDefault();
        return;
      }
    }
  });
  window.addEventListener('online', refreshTexts);
  window.addEventListener('offline', refreshTexts);
  window.addEventListener('resize', () => drawSparkline());
  window.addEventListener('beforeunload', () => {
    stopCamera();
    if (state.engine) state.engine.close();
  });

  $('overlay-toggle').checked = state.settings.overlay;
  $('mirror-toggle').checked = state.settings.mirror;
  $('weight-range').value = String(Math.round(state.settings.geometryWeight * 100));
  $('net-pill').textContent = t(navigator.onLine ? 'status.online' : 'status.offline');
  $('lang-toggle').textContent = getLang() === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  $('confidence-desc').textContent = t('messages.needReference');
  drawSparkline();
  updateGauge(0, null);
  renderProfiles();
  renderHistory();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  }
  ensureEngine().catch(() => {});
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
