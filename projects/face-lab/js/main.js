/**
 * main.js — Face Lab: camera, MediaPipe, orchestrazione dell'UI in stile Snapchat.
 */

import { FaceLandmarker, FilesetResolver } from 'mp-vision';
import {
  M68, CHAINS, faceMetrics, faceBox, boxToScreen, lmToScreen, clamp, setMirror
} from './metrics.js';
import { CATEGORIES, LENSES, STICKERS, findLens, findSticker, lensesFor } from './lenses.js';
import { drawBase, applyLens, reactionOf } from './effects.js';
import { drawStickers, hitSticker, dragSticker, normalizeOffsets, stickerPosition } from './props.js';
import { ReactionSystem } from './reactions.js';
import * as tech from './tech.js';

const SETTINGS_KEY = 'facelab_settings';
const SKETCH_KEY = 'facelab_sketches';

const $ = (id) => document.getElementById(id);
const S = {
  mode: 'fun',
  category: 'classic',
  lens: 'none',
  stickers: new Set(),
  offsets: {},
  mirror: true,
  facing: 'user',
  grid: false,
  timer: false,
  faces: 0,
  blinkCount: 0,
  lastBlink: 0,
  frames: 0,
  fps: 0,
  fpsAt: 0,
  lastLM: null,
  lastMetrics: null,
  running: false
};

const video = $('video');
const fx = $('fxCanvas'), fctx = fx.getContext('2d');
const orig = document.createElement('canvas'), octx = orig.getContext('2d');
const region = document.createElement('canvas');
const reactions = new ReactionSystem();
let VW = 0, VH = 0, drawW = 0, drawH = 0, offX = 0, offY = 0;
let faceLandmarker = null, modelReady = false, lastDetect = 0, lastUI = 0, lastBS = null;

function readSettings() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') || {}; } catch (e) {}
  S.lens = findLens(saved.lens || 'none').id;
  S.category = CATEGORIES.some((c) => c.id === saved.category) ? saved.category : 'classic';
  S.mirror = saved.mirror !== false;
  S.grid = !!saved.grid;
  S.stickers = new Set(Array.isArray(saved.stickers) ? saved.stickers.filter((id) => findSticker(id)) : []);
  S.offsets = normalizeOffsets(saved.offsets);
  setMirror(S.mirror);
}
function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      lens: S.lens, category: S.category, mirror: S.mirror, grid: S.grid,
      stickers: [...S.stickers], offsets: S.offsets
    }));
  } catch (e) {}
}

function toast(message, color) {
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  if (color) node.style.borderLeftColor = color;
  $('toasts').appendChild(node);
  setTimeout(() => { node.style.opacity = '0'; node.style.transition = 'opacity .35s'; setTimeout(() => node.remove(), 400); }, 2600);
}

/* ------------------------------------------------------------------ */
/* Canvas / layout                                                      */
/* ------------------------------------------------------------------ */
function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  fx.width = Math.round(innerWidth * dpr);
  fx.height = Math.round(innerHeight * dpr);
  fx.style.width = innerWidth + 'px';
  fx.style.height = innerHeight + 'px';
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // orig usa coordinate CSS: semplifica il warp e gli occhi giganti su display DPR>1
  orig.width = Math.round(innerWidth);
  orig.height = Math.round(innerHeight);
  octx.setTransform(1, 0, 0, 1, 0, 0);
  tech.resizeTech();
}
function computeLayout() {
  if (!VW) return;
  const cw = innerWidth, ch = innerHeight;
  const scale = Math.max(cw / VW, ch / VH);
  drawW = VW * scale; drawH = VH * scale;
  offX = (cw - drawW) / 2; offY = (ch - drawH) / 2;
}
const layout = () => ({ w: innerWidth, h: innerHeight, drawW, drawH, offX, offY });

/* ------------------------------------------------------------------ */
/* Camera / modello                                                     */
/* ------------------------------------------------------------------ */
async function startCamera(silent = false) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: S.facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false
    });
    video.srcObject = stream;
    await new Promise((resolve) => { video.onloadedmetadata = resolve; setTimeout(resolve, 2500); });
    await video.play();
    VW = video.videoWidth || 640;
    VH = video.videoHeight || 480;
    computeLayout();
    return true;
  } catch (error) {
    if (!silent) {
      const name = error && error.name;
      $('errMsg').textContent = name === 'NotAllowedError'
        ? 'Camera permission denied. Allow access in your browser settings and try again. (iPhone: Settings → Safari → Camera)'
        : name === 'NotFoundError' ? 'No camera found on this device.' : 'Camera error: ' + (error && error.message || error);
      $('err').classList.add('on');
    }
    return false;
  }
}

async function loadModel() {
  const options = (delegate) => ({
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      delegate
    },
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
    runningMode: 'VIDEO',
    numFaces: 4
  });
  try {
    const fileset = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
    $('loadMsg').textContent = 'Loading AI model · MediaPipe FaceLandmarker…';
    $('statusModel').textContent = 'AI loading…';
    $('statusModel').classList.add('warn');
    try {
      faceLandmarker = await FaceLandmarker.createFromOptions(fileset, options('GPU'));
    } catch (e) {
      faceLandmarker = await FaceLandmarker.createFromOptions(fileset, options('CPU'));
    }
    modelReady = true;
    $('statusModel').textContent = 'AI ready';
    $('statusModel').classList.remove('warn');
  } catch (error) {
    $('statusModel').textContent = 'AI error';
    $('errMsg').textContent = 'Failed to load the AI model. Check your connection and reload.';
    $('err').classList.add('on');
  }
}

/* ------------------------------------------------------------------ */
/* UI in stile Snapchat                                                 */
/* ------------------------------------------------------------------ */
function buildCategories() {
  const holder = $('lensCategories');
  holder.innerHTML = '';
  CATEGORIES.forEach((category) => {
    const button = document.createElement('button');
    button.className = 'cat-pill' + (category.id === S.category ? ' on' : '');
    button.textContent = category.emoji + ' ' + category.label;
    button.onclick = () => { S.category = category.id; buildCategories(); buildCarousel(); saveSettings(); };
    holder.appendChild(button);
  });
}

function buildCarousel() {
  const holder = $('lensCarousel');
  holder.innerHTML = '';
  lensesFor(S.category).forEach((lens) => {
    const button = document.createElement('button');
    button.className = 'lens' + (lens.id === S.lens ? ' on' : '');
    button.title = lens.name;
    button.innerHTML = '<span class="lens-emoji">' + lens.emoji + '</span><span class="lens-name">' + lens.name + '</span>';
    button.onclick = () => selectLens(lens.id);
    holder.appendChild(button);
  });
  const current = findLens(S.lens);
  $('lensName').textContent = current.emoji + '  ' + current.name;
}

function selectLens(id) {
  S.lens = findLens(id).id;
  const lens = findLens(S.lens);
  if (CATEGORIES.some((c) => c.id === lens.category)) S.category = lens.category;
  buildCategories(); buildCarousel(); saveSettings();
  toast(lens.emoji + ' ' + lens.name);
}

function buildStickerTray() {
  const holder = $('stickerTray');
  holder.innerHTML = '';
  STICKERS.forEach((sticker) => {
    const button = document.createElement('button');
    button.className = 'sticker' + (S.stickers.has(sticker.id) ? ' on' : '');
    button.title = sticker.name;
    button.textContent = sticker.emoji;
    button.onclick = () => {
      if (S.stickers.has(sticker.id)) S.stickers.delete(sticker.id);
      else S.stickers.add(sticker.id);
      button.classList.toggle('on', S.stickers.has(sticker.id));
      saveSettings();
    };
    holder.appendChild(button);
  });
}

function setMode(mode) {
  S.mode = mode;
  $('tabFun').classList.toggle('on', mode === 'fun');
  $('tabTech').classList.toggle('on', mode === 'tech');
  $('hud').classList.toggle('on', mode === 'tech');
  $('bottomBar').classList.toggle('on', mode === 'fun');
  tech.setTechVisible(mode === 'tech');
  if (mode === 'tech') tech.resizeTech();
}

function bindUI() {
  $('btnStart').onclick = startAll;
  $('errRetry').onclick = () => location.reload();
  $('tabFun').onclick = () => setMode('fun');
  $('tabTech').onclick = () => setMode('tech');
  $('btnFlip').onclick = async () => {
    S.facing = S.facing === 'user' ? 'environment' : 'user';
    if (!(await startCamera(true))) {
      S.facing = S.facing === 'user' ? 'environment' : 'user';
      toast('Could not switch camera', 'var(--red)');
    } else toast('📷 Camera switched');
  };
  $('btnMirror').onclick = () => {
    S.mirror = !S.mirror;
    setMirror(S.mirror);
    $('btnMirror').classList.toggle('on', S.mirror);
    saveSettings();
  };
  $('btnMirror').classList.toggle('on', S.mirror);
  $('btnGrid').onclick = () => {
    S.grid = !S.grid;
    $('btnGrid').classList.toggle('on', S.grid);
    saveSettings();
  };
  $('btnGrid').classList.toggle('on', S.grid);
  $('btnTimer').onclick = () => {
    S.timer = !S.timer;
    $('btnTimer').classList.toggle('on', S.timer);
    toast(S.timer ? '⏱ Timer on' : '⏱ Timer off');
  };
  $('btnSnap').onclick = snapshot;
  $('btnShutter').onclick = snapshot;
  $('btnSketch').onclick = captureSketch;
  $('btnGallery').onclick = () => { renderGallery(); $('galleryModal').classList.add('on'); };
  document.querySelectorAll('[data-close]').forEach((button) => {
    button.onclick = () => button.closest('.modal').classList.remove('on');
  });
  $('galleryModal').addEventListener('click', (event) => {
    if (event.target === $('galleryModal')) $('galleryModal').classList.remove('on');
  });
  $('lensPrev').onclick = stepLens(-1);
  $('lensNext').onclick = stepLens(1);
  addEventListener('resize', () => { resize(); computeLayout(); });
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape') document.querySelectorAll('.modal.on').forEach((m) => m.classList.remove('on'));
    if (event.key === 'ArrowLeft') stepLens(-1)();
    if (event.key === 'ArrowRight') stepLens(1)();
  });
  bindStickerDragging();
}

function stepLens(direction) {
  return () => {
    const inCategory = lensesFor(S.category);
    const index = inCategory.findIndex((lens) => lens.id === S.lens);
    const next = inCategory[(index + direction + inCategory.length) % inCategory.length];
    if (next) selectLens(next.id);
  };
}

function bindStickerDragging() {
  let dragging = null, startX = 0, startY = 0;
  fx.addEventListener('pointerdown', (event) => {
    if (!S.lastLM || !S.stickers.size || S.mode !== 'fun') return;
    const id = hitSticker(event.clientX, event.clientY, S.lastLM, layout(), S.stickers, S.offsets);
    if (!id) return;
    dragging = id;
    startX = event.clientX; startY = event.clientY;
    fx.setPointerCapture(event.pointerId);
    fx.classList.add('dragging');
  });
  fx.addEventListener('pointermove', (event) => {
    if (!dragging || !S.lastLM) return;
    const box = boxToScreen(faceBox(S.lastLM), layout());
    dragSticker(S.offsets, dragging, event.clientX - startX, event.clientY - startY, box);
    startX = event.clientX; startY = event.clientY;
  });
  const end = () => { if (dragging) { dragging = null; fx.classList.remove('dragging'); saveSettings(); } };
  fx.addEventListener('pointerup', end);
  fx.addEventListener('pointercancel', end);
}

/* ------------------------------------------------------------------ */
/* Detection loop                                                       */
/* ------------------------------------------------------------------ */
function drawGrid(ctx) {
  if (!S.grid) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.16)';
  ctx.lineWidth = 1;
  const thirdW = innerWidth / 3, thirdH = innerHeight / 3;
  for (let i = 1; i < 3; i += 1) {
    ctx.beginPath(); ctx.moveTo(thirdW * i, 0); ctx.lineTo(thirdW * i, innerHeight); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, thirdH * i); ctx.lineTo(innerWidth, thirdH * i); ctx.stroke();
  }
  ctx.restore();
}

function loop(now) {
  requestAnimationFrame(loop);
  if (!modelReady || !video.readyState || !S.running) return;
  if (now - lastDetect < 1000 / 30) return;
  lastDetect = now;

  let result = null;
  try { result = faceLandmarker.detectForVideo(video, now); } catch (e) { return; }
  const faces = (result && result.faceLandmarks) || [];
  S.faces = faces.length;
  const L = layout();
  fctx.clearRect(0, 0, innerWidth, innerHeight);

  if (!faces.length) {
    drawBase(fctx, video, L, S.mirror, findLens(S.lens));
    drawGrid(fctx);
    S.lastLM = null;
    tech.hideTechFaces();
  } else {
    const sizes = faces.map((lm) => Math.hypot(lm[234].x - lm[454].x, lm[234].y - lm[454].y));
    let primary = 0;
    for (let i = 1; i < sizes.length; i += 1) if (sizes[i] > sizes[primary]) primary = i;
    drawBase(fctx, video, L, S.mirror, findLens(S.lens));

    for (let i = 0; i < faces.length; i += 1) {
      const lm = faces[i];
      const categories = result.faceBlendshapes && result.faceBlendshapes[i]
        ? result.faceBlendshapes[i].categories : null;
      const matrix = result.facialTransformationMatrixes && result.facialTransformationMatrixes[i]
        ? result.facialTransformationMatrixes[i].data : null;
      if (i === primary) {
        S.lastLM = lm;
        lastBS = categories;
        const metrics = faceMetrics(lm, categories, matrix);
        S.lastMetrics = metrics;
        if (metrics.blink > 0.55 && now - S.lastBlink > 350) { S.blinkCount += 1; S.lastBlink = now; }
        try {
          applyLens(fctx, orig, region, lm, L, findLens(S.lens), metrics, now);
          drawStickers(fctx, lm, L, S.stickers, S.offsets);
          const box = boxToScreen(faceBox(lm), L);
          reactions.update(metrics, reactionOf(findLens(S.lens)), box, metrics.pose.roll);
          reactions.drawTiltRainbow(fctx, box, metrics.pose.roll);
          reactions.draw(fctx);
        } catch (e) { /* un effetto non deve bloccare il loop */ }
        if (S.mode === 'tech') tech.updateTech(lm, metrics, L, S.mirror, true);
      } else {
        fctx.fillStyle = 'rgba(62,230,255,.55)';
        for (const index of M68) {
          const p = lmToScreen(lm, index, L);
          fctx.beginPath(); fctx.arc(p.x, p.y, 2, 0, Math.PI * 2); fctx.fill();
        }
      }
    }
    drawGrid(fctx);
  }

  S.frames += 1;
  if (now - S.fpsAt >= 1000) {
    S.fps = Math.round((S.frames * 1000) / (now - S.fpsAt));
    S.frames = 0; S.fpsAt = now;
    $('statusFps').textContent = S.fps + ' FPS';
  }
  if (now - lastUI > 120) {
    lastUI = now;
    $('statusFaces').textContent = S.faces + (S.faces === 1 ? ' face' : ' faces');
    if (S.mode === 'tech') tech.updateHUD(S.lastMetrics, S.blinkCount, S.faces);
  }
  tech.renderTech(now, S.lastMetrics);
}

/* ------------------------------------------------------------------ */
/* Snapshot / sketch / gallery                                          */
/* ------------------------------------------------------------------ */
function download(url, name) {
  const link = document.createElement('a');
  link.href = url; link.download = name;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => link.remove(), 300);
}

function snapshot() {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(innerWidth * 1.5);
  canvas.height = Math.round(innerHeight * 1.5);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(fx, 0, 0, canvas.width, canvas.height);
  if (S.mode === 'tech') {
    tech.renderTech(performance.now(), S.lastMetrics);
    ctx.drawImage($('glCanvas'), 0, 0, canvas.width, canvas.height);
  }
  ctx.fillStyle = 'rgba(7,8,18,.75)';
  ctx.fillRect(0, canvas.height - 58, canvas.width, 58);
  ctx.fillStyle = '#eef0ff';
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText('FACE//LAB · ' + findLens(S.lens).name + ' · ' + new Date().toLocaleTimeString(), 24, canvas.height - 20);
  download(canvas.toDataURL('image/png'), 'facelab-' + Date.now() + '.png');
  toast('📸 Snapshot saved');
}

function captureSketch() {
  if (!S.lastLM) { toast('No face detected — look at the camera', 'var(--amber)'); return; }
  const lm = S.lastLM;
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0b0d1f'; ctx.fillRect(0, 0, 512, 512);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const i of M68) {
    minX = Math.min(minX, lm[i].x); maxX = Math.max(maxX, lm[i].x);
    minY = Math.min(minY, lm[i].y); maxY = Math.max(maxY, lm[i].y);
  }
  const scale = Math.min(400 / Math.max(1e-4, maxX - minX), 400 / Math.max(1e-4, maxY - minY));
  const ox = (512 - (maxX - minX) * scale) / 2;
  const oy = (512 - (maxY - minY) * scale) / 2 - 40;
  const point = (i) => [ox + lm[i].x * scale, oy + lm[i].y * scale];
  const chain = (key, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath();
    CHAINS[key].forEach((idx, i) => {
      const [x, y] = point(M68[idx]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };
  chain('jaw', '#3ee6ff');
  chain('browL', '#b28dff'); chain('browR', '#b28dff');
  chain('nose', '#52ff9e'); chain('noseL', '#52ff9e');
  chain('eyeL', '#ff5f9e'); chain('eyeR', '#ff5f9e');
  chain('mouthOuter', '#ffd166'); chain('mouthInner', '#ffd166');
  for (let i = 0; i < 68; i += 1) {
    const [x, y] = point(M68[i]);
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  const data = {
    t: Date.now(), w: 512, h: 512,
    pts: Array.from({ length: 68 }, (_, i) => point(M68[i]).map((v) => Math.round(v)))
  };
  try {
    let list = [];
    try { list = JSON.parse(localStorage.getItem(SKETCH_KEY) || '[]'); } catch (e) {}
    list.unshift(data);
    if (list.length > 12) list.length = 12;
    localStorage.setItem(SKETCH_KEY, JSON.stringify(list));
  } catch (e) { toast('Storage full', 'var(--amber)'); }
  download(canvas.toDataURL('image/png'), 'face-sketch-' + Date.now() + '.png');
  toast('✏️ Sketch saved to your gallery', 'var(--violet)');
}

function renderGallery() {
  const grid = $('skGrid');
  grid.innerHTML = '';
  let list = [];
  try { list = JSON.parse(localStorage.getItem(SKETCH_KEY) || '[]'); } catch (e) {}
  if (!list.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-note';
    empty.textContent = 'No sketches yet — press ✏️ while looking at the camera.';
    grid.appendChild(empty);
    return;
  }
  list.forEach((sketch, index) => {
    const item = document.createElement('div');
    item.className = 'skitem';
    const canvas = document.createElement('canvas');
    canvas.width = sketch.w; canvas.height = sketch.h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0b0d1f'; ctx.fillRect(0, 0, sketch.w, sketch.h);
    ctx.strokeStyle = '#3ee6ff'; ctx.lineWidth = 3;
    const chains = ['jaw', 'browL', 'browR', 'nose', 'noseL', 'nose2', 'eyeL', 'eyeR', 'mouthOuter', 'mouthInner'];
    for (const key of chains) {
      ctx.beginPath();
      CHAINS[key].forEach((idx, i) => {
        const [x, y] = sketch.pts[idx] || [0, 0];
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
    const time = document.createElement('div');
    time.className = 'time';
    time.textContent = new Date(sketch.t).toLocaleTimeString();
    const del = document.createElement('button');
    del.className = 'del'; del.textContent = '✕';
    del.onclick = (event) => {
      event.stopPropagation();
      list.splice(index, 1);
      try { localStorage.setItem(SKETCH_KEY, JSON.stringify(list)); } catch (e) {}
      renderGallery();
    };
    item.append(canvas, del, time);
    grid.appendChild(item);
  });
}

/* ------------------------------------------------------------------ */
/* Boot                                                                 */
/* ------------------------------------------------------------------ */
async function startAll() {
  $('start').classList.remove('on');
  $('load').classList.add('on');
  const modelPromise = loadModel();
  const cameraOk = await startCamera();
  if (!cameraOk) { $('load').classList.remove('on'); return; }
  await modelPromise;
  $('load').classList.remove('on');
  if (modelReady) {
    tech.buildLinePairs();
    tech.initTech($('glCanvas'));
    setMode('fun');
    resize(); computeLayout();
    S.running = true;
    S.fpsAt = performance.now();
    requestAnimationFrame(loop);
    toast('✨ Face tracking live — pick a lens!', 'var(--green)');
  }
}

readSettings();
buildCategories();
buildCarousel();
buildStickerTray();
bindUI();
resize();
setMode('fun');
