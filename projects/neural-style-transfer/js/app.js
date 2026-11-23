/* Neural Style Studio — application controller */

import { I18n } from './i18n.js';
import { createPreview } from './preview.js';
import { NeuralEngine } from './neural.js';
import { GPU_STYLES, NEURAL_STYLES, CONTENT_STYLES, findStyle } from './styles.js';
import { imageStats } from './pipeline.js';
import { History } from './history.js';

const $ = id => document.getElementById(id);
const i18n = new I18n();
const neural = new NeuralEngine();
const history = new History();

const state = {
  mode: 'gpu',
  contentSrc: 'examples/content-0.svg',
  gpuStyle: 'starry',
  neuralStyle: 'candy',
  strength: 0.7,
  mix: 0.3,
  split: 1,
  brush: 45,
  quality: 'high',
  contentStats: { mean: [128, 128, 128], std: [50, 20, 20] },
  aStats: { mean: [128, 128, 128], std: [50, 20, 20] },
  bStats: { mean: [128, 128, 128], std: [50, 20, 20] },
  contentImage: null,
  camera: false,
  cameraStream: null,
  neuralResult: null,
  painting: false,
  tlTimer: 0,
  tlPos: 0,
  frame: 0
};

let preview = null;
let maskCtx = null;

function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  $('toasts').appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function setStatus(text) { if ($('status')) $('status').textContent = text; }
function setProgress(value) {
  if ($('progressBar')) $('progressBar').style.width = Math.max(0, Math.min(100, value * 100)) + '%';
  if ($('progressText')) $('progressText').textContent = value > 0 && value < 1
    ? i18n.t('modelProgress', { percent: Math.round(value * 100) }) : '';
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function statsOf(source, size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, size, size);
  return imageStats(ctx.getImageData(0, 0, size, size).data);
}

function sizeCanvas() {
  const stage = $('stage');
  const w = Math.max(1, stage.clientWidth);
  const h = Math.max(1, stage.clientHeight);
  const cap = state.quality === 'low' ? 1 : 2;
  const dpr = Math.min(cap, Math.max(1, window.devicePixelRatio || 1));
  if (preview) preview.resize(w, h, dpr);
  const mask = $('maskCanvas');
  mask.width = Math.round(w);
  mask.height = Math.round(h);
  maskCtx = mask.getContext('2d', { willReadFrequently: true });
  maskCtx.fillStyle = '#fff';
  maskCtx.fillRect(0, 0, mask.width, mask.height);
  if (preview) preview.upload('mask', mask);
  const result = $('resultCanvas');
  result.width = Math.round(w * dpr);
  result.height = Math.round(h * dpr);
}

function renderFrame(params = {}) {
  if (!preview) return;
  preview.render({
    strength: params.strength ?? state.strength,
    mix: params.mix ?? state.mix,
    split: (params.split ?? state.split) >= 0.999 ? -1 : (params.split ?? state.split),
    time: performance.now() / 1000,
    quality: state.quality === 'low' ? 0.4 : 1,
    cStats: state.contentStats,
    aStats: state.aStats,
    bStats: state.bStats
  });
  const label = $('splitLabel');
  if (label) label.textContent = state.split >= 1 ? '—' : Math.round(state.split * 100) + '%';
}

function showNeuralResult(rgba, size) {
  const canvas = $('resultCanvas');
  const ctx = canvas.getContext('2d');
  const tmp = document.createElement('canvas');
  tmp.width = tmp.height = size;
  tmp.getContext('2d').putImageData(new ImageData(rgba, size, size), 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
  canvas.hidden = false;
  $('canvas').hidden = true;
  state.neuralResult = { rgba, size };
  toast(i18n.t('saved'));
}

function clearNeuralResult() {
  state.neuralResult = null;
  $('resultCanvas').hidden = true;
  $('canvas').hidden = false;
}

async function refreshContent(src) {
  const img = await loadImage(src);
  state.contentImage = img;
  state.contentSrc = src;
  state.contentStats = statsOf(img);
  if (preview) preview.upload('content', img);
  clearNeuralResult();
  renderFrame();
}

async function refreshStyles() {
  const isGpu = state.mode === 'gpu';
  const list = isGpu ? GPU_STYLES : NEURAL_STYLES;
  const idx = isGpu
    ? Math.max(0, GPU_STYLES.findIndex(s => s.id === state.gpuStyle))
    : Math.max(0, NEURAL_STYLES.findIndex(s => s.id === state.neuralStyle));
  const next = list[(idx + 1) % list.length];
  const sa = await loadImage(list[idx].svg || GPU_STYLES[idx % GPU_STYLES.length].svg);
  const sb = await loadImage(next.svg || GPU_STYLES[(idx + 1) % GPU_STYLES.length].svg);
  state.aStats = statsOf(sa);
  state.bStats = statsOf(sb);
  if (preview) { preview.upload('styleA', sa); preview.upload('styleB', sb); }
  renderFrame();
}

function selectButton(selector, active) {
  document.querySelectorAll(selector).forEach(b => b.classList.toggle('active', b === active));
}

function recordFrame() {
  history.add({
    strength: state.strength, mix: state.mix, split: state.split,
    styleA: state.mode === 'gpu' ? state.gpuStyle : state.neuralStyle,
    styleB: state.mode === 'gpu' ? state.gpuStyle : state.neuralStyle
  });
  const tl = $('timeline');
  tl.hidden = false;
  $('tlLabel').textContent = history.length + ' ' + i18n.t('frames');
}

function stopTimeline() {
  clearInterval(state.tlTimer);
  state.tlTimer = 0;
  $('tlPlay').textContent = '▶';
}

function playTimeline() {
  if (history.length < 2) { toast(i18n.t('frames') + ' ≥ 2'); return; }
  if (state.tlTimer) { stopTimeline(); return; }
  $('tlPlay').textContent = '⏸';
  state.tlTimer = setInterval(() => {
    state.tlPos = (state.tlPos + 0.02) % 1;
    const f = history.interpolate(state.tlPos);
    if (!f) return;
    renderFrame({ strength: f.strength, mix: f.mix, split: f.split });
    $('tlScrub').value = String(Math.round(state.tlPos * 100));
  }, 40);
}

async function toggleCamera() {
  if (state.camera) {
    if (state.cameraStream) state.cameraStream.getTracks().forEach(t => t.stop());
    state.cameraStream = null;
    state.camera = false;
    $('btnCamera').textContent = i18n.t('camera');
    toast(i18n.t('cameraOff'));
    renderFrame();
    return;
  }
  try {
    state.cameraStream = await navigator.mediaDevices.getUserMedia({
      audio: false, video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
    });
    const video = $('video');
    video.srcObject = state.cameraStream;
    video.hidden = false;
    await video.play();
    state.camera = true;
    $('btnCamera').textContent = '⏹';
    clearNeuralResult();
    const loop = () => {
      if (!state.camera) return;
      if (preview) preview.upload('content', video);
      renderFrame();
      state.frame = requestAnimationFrame(loop);
    };
    loop();
  } catch (e) {
    toast(i18n.t('statusError') + ': ' + (e.name || 'camera'));
  }
}

function snapshot() {
  if (!state.camera) return;
  const video = $('video');
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  c.getContext('2d').drawImage(video, 0, 0, 512, 512);
  refreshContent(c.toDataURL('image/png'));
  toggleCamera();
}

async function enhance() {
  const style = findStyle(state.neuralStyle);
  const size = state.quality === 'low' ? 320 : 512;
  setStatus(i18n.t('statusModel'));
  setProgress(0.01);
  try {
    const src = state.contentImage;
    if (!src) throw new Error('no content');
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(src, 0, 0, size, size);
    const rgba = await neural.stylize(ctx.getImageData(0, 0, size, size).data, size, style, setProgress);
    showNeuralResult(rgba, size);
    setStatus(i18n.t('statusReady'));
  } catch (e) {
    console.error('[NST] neural render failed', e);
    setStatus(i18n.t('statusError'));
    toast(e.message || String(e));
  } finally { setProgress(0); }
}

function download() {
  const source = state.neuralResult ? $('resultCanvas') : $('canvas');
  renderFrame();
  source.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neural-style-' + Date.now() + '.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}

function bindUI() {
  document.querySelectorAll('[data-content]').forEach(btn => btn.addEventListener('click', async () => {
    selectButton('[data-content]', btn);
    try { await refreshContent(btn.dataset.content); recordFrame(); } catch (e) { toast(String(e)); }
  }));
  document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => {
    state.mode = btn.dataset.mode;
    selectButton('[data-mode]', btn);
    $('styleStripGpu').hidden = state.mode !== 'gpu';
    $('styleStripNeural').hidden = state.mode !== 'neural';
    refreshStyles().catch(e => toast(String(e)));
  }));
  document.querySelectorAll('[data-gpu-style]').forEach(btn => btn.addEventListener('click', () => {
    state.gpuStyle = btn.dataset.gpuStyle;
    selectButton('[data-gpu-style]', btn);
    refreshStyles().catch(e => toast(String(e)));
    recordFrame();
  }));
  document.querySelectorAll('[data-neural-style]').forEach(btn => btn.addEventListener('click', () => {
    state.neuralStyle = btn.dataset.neuralStyle;
    selectButton('[data-neural-style]', btn);
    refreshStyles().catch(e => toast(String(e)));
    recordFrame();
  }));

  const slider = (id, key, label, scale = 1) => {
    const el = $(id);
    el.addEventListener('input', () => {
      state[key] = Number(el.value) / scale;
      $(label).textContent = (scale === 1 ? el.value + 'px' : el.value + '%');
      clearNeuralResult();
      renderFrame();
      recordFrame();
    });
  };
  slider('strength', 'strength', 'strengthVal', 100);
  slider('mix', 'mix', 'mixVal', 100);
  slider('brush', 'brush', 'brushVal', 1);
  slider('split', 'split', 'splitVal', 100);

  $('quality').addEventListener('change', e => { state.quality = e.target.value; sizeCanvas(); renderFrame(); });
  $('btnEnhance').addEventListener('click', enhance);
  $('btnCamera').addEventListener('click', toggleCamera);
  $('btnSnapshot').addEventListener('click', snapshot);
  $('btnDownload').addEventListener('click', download);
  $('btnRandom').addEventListener('click', () => {
    const c = CONTENT_STYLES[Math.floor(Math.random() * CONTENT_STYLES.length)];
    const s = (state.mode === 'gpu' ? GPU_STYLES : NEURAL_STYLES)[Math.floor(Math.random() * (state.mode === 'gpu' ? GPU_STYLES.length : NEURAL_STYLES.length))];
    selectButton('[data-content]', document.querySelector(`[data-content="${c.svg}"]`));
    if (state.mode === 'gpu') {
      state.gpuStyle = s.id;
      selectButton('[data-gpu-style]', document.querySelector(`[data-gpu-style="${s.id}"]`));
    } else {
      state.neuralStyle = s.id;
      selectButton('[data-neural-style]', document.querySelector(`[data-neural-style="${s.id}"]`));
    }
    refreshContent(c.svg).then(() => refreshStyles()).then(recordFrame).catch(e => toast(String(e)));
  });
  $('btnClearMask').addEventListener('click', () => {
    if (!maskCtx) return;
    maskCtx.fillStyle = '#fff';
    maskCtx.fillRect(0, 0, $('maskCanvas').width, $('maskCanvas').height);
    if (preview) preview.upload('mask', $('maskCanvas'));
    state.maskUsed = false;
    renderFrame();
  });
  $('btnTimelapse').addEventListener('click', () => { $('timeline').hidden = false; playTimeline(); });
  $('tlPlay').addEventListener('click', playTimeline);
  $('tlClose').addEventListener('click', () => { stopTimeline(); $('timeline').hidden = true; });
  $('tlScrub').addEventListener('input', e => {
    const f = history.interpolate(Number(e.target.value) / 100);
    if (f) renderFrame({ strength: f.strength, mix: f.mix, split: f.split });
  });

  const pick = (input, kind) => $(input).addEventListener('change', async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      if (kind === 'content') await refreshContent(url);
      else {
        state.aStats = statsOf(img);
        if (preview) preview.upload('styleA', img);
        renderFrame();
        toast(i18n.t('customStyle'));
      }
    } finally { URL.revokeObjectURL(url); }
  });
  $('btnUploadPhoto').addEventListener('click', () => $('filePhoto').click());
  $('btnUploadStyle').addEventListener('click', () => $('fileStyle').click());
  pick('filePhoto', 'content');
  pick('fileStyle', 'style');

  $('btnInfo').addEventListener('click', () => { $('infoModal').hidden = false; });
  $('btnInfoClose').addEventListener('click', () => { $('infoModal').hidden = true; });
  $('infoModal').addEventListener('click', e => { if (e.target === $('infoModal')) $('infoModal').hidden = true; });

  window.addEventListener('resize', () => { sizeCanvas(); renderFrame(); });
  window.addEventListener('project:langchange', e => {
    i18n.setLang(e.detail && e.detail.lang);
    i18n.apply();
  });
  window.addEventListener('beforeunload', () => {
    if (state.cameraStream) state.cameraStream.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(state.frame);
    stopTimeline();
  });

  const stage = $('stage');
  const paint = e => {
    if (!maskCtx || !state.painting) return;
    const rect = stage.getBoundingClientRect();
    maskCtx.fillStyle = '#fff';
    maskCtx.beginPath();
    maskCtx.arc(e.clientX - rect.left, e.clientY - rect.top, state.brush, 0, Math.PI * 2);
    maskCtx.fill();
    if (preview) preview.upload('mask', $('maskCanvas'));
    renderFrame();
  };
  stage.addEventListener('pointerdown', e => {
    if (!state.maskUsed) {
      maskCtx.fillStyle = '#000';
      maskCtx.fillRect(0, 0, $('maskCanvas').width, $('maskCanvas').height);
      state.maskUsed = true;
    }
    state.painting = true;
    paint(e);
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') paint(e); });
  stage.addEventListener('pointerup', () => { state.painting = false; });
  stage.addEventListener('pointercancel', () => { state.painting = false; });
}

async function init() {
  i18n.apply();
  sizeCanvas();
  preview = await createPreview($('canvas'));
  sizeCanvas();
  bindUI();
  try {
    await refreshContent(state.contentSrc);
    await refreshStyles();
  } catch (e) {
    console.error('[NST] init failed', e);
    toast(String(e));
  }
  setStatus(i18n.t('statusReady'));
}

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

init();
