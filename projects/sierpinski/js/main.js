/* Fractal Observatory — bootstrap, loop, camera input and export */
import { FORMS, PALETTES, PRESETS, DEFAULT_SETTINGS } from './config.js';
import { detect, initLang, setLang, getLang, t } from './i18n.js';
import { profile, save, setSettings, setParams, toggleFavorite, addCustom, resetAll } from './storage.js';
import { build, newChaos, chaosStep } from './fractal.js';
import { Camera } from './camera.js';
import { Renderer } from './render.js';
import { ui } from './ui.js';

const $ = id => document.getElementById(id);
const renderer = new Renderer($('cv'));
const camera = new Camera();
let settings = profile.settings;
let form = FORMS.find(f => f.id === profile.lastForm) || FORMS[0];
let params = { ...form.defaults, ...(profile.params[form.id] || {}) };
let chaos = newChaos(12345);
let chaosPoints = [], chaosVertices = [];
let seed = 12345;
let spinOn = !!settings.spin;
let lastInteract = 0, pointerLive = 0, paused = false;
let fps = 60, fpsFrames = 0, fpsLast = performance.now();
let needsDraw = true, last = 0;
let previewStart = performance.now(), reveal = 1;
let pointers = new Map(), lastPinch = null, lastTap = 0, lastTapXY = null;

function palette() { return PALETTES[settings.palette] || PALETTES.neon; }
function geometry() {
  if (form.id === 'chaos') return null;
  return build(form.id, params, seed);
}
function interact() { lastInteract = performance.now(); needsDraw = true; }

function setForm(id) {
  const next = FORMS.find(f => f.id === id);
  if (!next) return;
  form = next;
  profile.lastForm = form.id;
  params = { ...form.defaults, ...(profile.params[form.id] || {}) };
  if (form.id === 'chaos') { chaos = newChaos(seed); chaosPoints = []; }
  previewStart = performance.now(); reveal = 0;
  save();
  ui.renderForms(form.id); ui.renderParams(form, params); ui.renderPresets(form.id);
  needsDraw = true;
}

function applyPreset(id) {
  const p = PRESETS.find(x => x.id === id) || profile.custom.find(x => x.id === id);
  if (!p) return;
  if (p.form) setForm(p.form);
  params = { ...params, ...(p.params || {}) };
  profile.params[form.id] = params;
  if (form.id === 'chaos') { chaos = newChaos(seed); chaosPoints = []; }
  save(); ui.renderParams(form, params); ui.renderPresets(id);
  previewStart = performance.now(); reveal = 0;
  needsDraw = true;
}

function setSetting(patch) {
  settings = setSettings(patch);
  if ('spin' in patch) spinOn = !!patch.spin;
  needsDraw = true;
}

function randomize() {
  form.params.forEach(p => {
    params[p.k] = p.step >= 1
      ? p.min + Math.floor(Math.random() * (p.max - p.min + 1)) * p.step
      : +(p.min + Math.random() * (p.max - p.min)).toFixed(2);
  });
  profile.params[form.id] = params; save();
  ui.renderParams(form, params);
  seed = Math.floor(Math.random() * 1e9);
  if (form.id === 'chaos') { chaos = newChaos(seed); chaosPoints = []; }
  previewStart = performance.now(); reveal = 0; needsDraw = true;
  ui.toast(form.name + ' ✨');
}

function savePreset() {
  const id = 'custom-' + Date.now().toString(36);
  addCustom({ id, name: `${form.name} ${Object.values(params).join('-')}`, form: form.id, params: { ...params } });
  ui.renderPresets(id); ui.toast('★ ' + t('save'));
}

function exportPng() {
  const scale = 2;
  const out = document.createElement('canvas');
  out.width = renderer.w * scale; out.height = renderer.h * scale;
  const c = out.getContext('2d');
  c.drawImage(renderer.canvas, 0, 0, out.width, out.height);
  out.toBlob(blob => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fractal-${form.id}-${Date.now()}.png`;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    ui.toast(t('exportPng'));
  });
}
function exportSvg() {
  const g = geometry();
  if (!g) { exportPng(); return; }
  let body = '';
  if (g.type === 'tris') body = g.items.map((t, i) =>
    `<polygon points="${t.map(p => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' ')}" fill="${palette().fn(i / g.items.length * 8, 8)}"/>`).join('');
  else if (g.type === 'squares') body = g.items.map((s, i) =>
    `<rect x="${s.x.toFixed(3)}" y="${s.y.toFixed(3)}" width="${s.s.toFixed(3)}" height="${s.s.toFixed(3)}" fill="${palette().fn(i / g.items.length * 8, 8)}"/>`).join('');
  else if (g.type === 'segments') body = g.items.map(seg =>
    `<line x1="${seg[0].x.toFixed(3)}" y1="${seg[0].y.toFixed(3)}" x2="${seg[1].x.toFixed(3)}" y2="${seg[1].y.toFixed(3)}" stroke="#ffffff" stroke-width="0.01"/>`).join('');
  else if (g.type === 'path') body = `<path d="${g.points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(3)} ${p.y.toFixed(3)}`).join(' ')}${g.closed ? 'Z' : ''}" fill="none" stroke="#ffffff" stroke-width="0.01"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.4 -1.4 2.8 2.8">${body}</svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `fractal-${form.id}.svg`;
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  ui.toast(t('exportSvg'));
}
async function copyLink() {
  const u = new URL(location.href);
  u.searchParams.set('f', form.id);
  u.searchParams.set('s', String(seed));
  u.searchParams.set('p', btoa(JSON.stringify(params)));
  try { await navigator.clipboard.writeText(u.toString()); ui.toast(t('copied')); }
  catch (e) { ui.toast(t('copy')); }
}
function resetCamera() { camera.reset(); interact(); }
function toggleSheet() { $('sheet').classList.toggle('collapsed'); }

/* camera input */
const cv = $('cv');
cv.addEventListener('pointerdown', e => {
  try { cv.setPointerCapture(e.pointerId); } catch (err) {}
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  lastPinch = null; pointerLive++; interact();
  const now = Date.now();
  if (now - lastTap < 330 && lastTapXY && Math.hypot(e.clientX - lastTapXY[0], e.clientY - lastTapXY[1]) < 30) {
    resetCamera(); lastTap = 0;
  } else { lastTap = now; lastTapXY = [e.clientX, e.clientY]; }
});
cv.addEventListener('pointermove', e => {
  const p = pointers.get(e.pointerId); if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  p.x = e.clientX; p.y = e.clientY;
  if (pointers.size === 1) {
    if (e.shiftKey || e.buttons === 2) camera.rotateAt(renderer.w / 2, renderer.h / 2, -dx * 0.006, renderer.w, renderer.h);
    else { camera.panX += dx; camera.panY += dy; }
    interact();
  } else if (pointers.size === 2) {
    const arr = [...pointers.values()];
    const dist = Math.hypot(arr[1].x - arr[0].x, arr[1].y - arr[0].y);
    const ang = Math.atan2(arr[1].y - arr[0].y, arr[1].x - arr[0].x);
    const mx = (arr[0].x + arr[1].x) / 2, my = (arr[0].y + arr[1].y) / 2;
    if (lastPinch) {
      camera.zoomAt(mx, my, dist / lastPinch.dist, renderer.w, renderer.h);
      camera.rotateAt(mx, my, ang - lastPinch.ang, renderer.w, renderer.h);
    }
    lastPinch = { dist, ang }; interact();
  }
});
['pointerup','pointercancel'].forEach(ev => cv.addEventListener(ev, e => {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) lastPinch = null;
  if (!pointers.size) pointerLive = 0;
  interact();
}));
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('wheel', e => {
  e.preventDefault();
  camera.zoomAt(e.clientX, e.clientY, Math.pow(1.0016, -e.deltaY), renderer.w, renderer.h);
}, { passive: false });

/* URL state */
try {
  const u = new URL(location.href);
  const f = u.searchParams.get('f');
  if (f && FORMS.some(x => x.id === f)) form = FORMS.find(x => x.id === f);
  const s = u.searchParams.get('s');
  if (s) seed = +s || 12345;
  const p = u.searchParams.get('p');
  if (p) params = { ...params, ...JSON.parse(atob(p)) };
} catch (e) {}

initLang(detect());
ui.initUI({
  setForm, applyPreset, onParam: () => { profile.params[form.id] = params; save(); previewStart = performance.now(); reveal = 0; needsDraw = true; },
  setPalette: p => setSetting({ palette: p }),
  setSetting, settings: () => settings,
  randomize, savePreset, resetCamera, exportPng, exportSvg, copyLink, toggleSheet,
  toggleSpin: () => { spinOn = !spinOn; setSetting({ spin: spinOn }); $('spinBtn').classList.toggle('on', spinOn); },
  toggleFavorite: () => { const on = toggleFavorite(form.id); ui.toast(on ? '★' : '☆'); },
  lang: () => setLang(getLang() === 'en' ? 'it' : 'en'),
  renderAll: () => {
    ui.renderForms(form.id); ui.renderParams(form, params);
    ui.renderStyle(settings, PALETTES); ui.renderPresets(form.id); ui.renderFavorites();
  }
});
ui.renderForms(form.id);
ui.renderParams(form, params);
ui.renderStyle(settings, PALETTES);
ui.renderPresets(form.id);
ui.renderFavorites();
renderer.resize();
camera.setViewport(renderer.w, renderer.h);
setInterval(() => { camera.panX += 0; save(); }, 8000);

function frame(now) {
  requestAnimationFrame(frame);
  if (!last) last = now;
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  fpsFrames++;
  if (now - fpsLast >= 500) { fps = Math.round(fpsFrames * 1000 / (now - fpsLast)); fpsFrames = 0; fpsLast = now; }
  camera.update(now);
  camera.setViewport(renderer.w, renderer.h);
  if (spinOn && !pointerLive && now - lastInteract > 1400) { camera.rot += dt * 0.12; needsDraw = true; }
  if (settings.reveal && reveal < 1) { reveal = Math.min(1, (now - previewStart) / 900); needsDraw = true; }
  renderer.draw({
    w: renderer.w, h: renderer.h, dpr: renderer.dpr, camera,
    palette: palette().fn, glow: settings.glow, blend: settings.blend,
    symmetry: settings.symmetry, bg: settings.bg,
    geometry: geometry(), chaosPoints, chaosVertices, chaosVerts: params.verts || 3
  });

  if (form.id === 'chaos' && !paused) {
    const rng = Math.random;
    const n = Math.max(1, Math.min(3000, params.speed || 600));
    if (chaosPoints.length < 160000) {
      for (let i = 0; i < n; i++) {
        const p = chaosStep(chaos, { ...params, rng });
        if (chaos.count > 16) chaosPoints.push(p);
      }
      chaosVertices = chaos.vertices;
      needsDraw = true;
    }
  }
  ui.updateHUD({ fps, elems: geometry()?.count || chaosPoints.length, chaos: form.id === 'chaos',
    points: chaosPoints.length, zoom: camera.zoom, rot: camera.rot });
}
requestAnimationFrame(frame);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
