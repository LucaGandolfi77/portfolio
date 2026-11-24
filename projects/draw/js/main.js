/* Pixel Studio — bootstrap, compositing and I/O */
import { doc, activeLayer, activeCtx, newProject, saveProject, loadProject, snapshot,
  undo, redo, flatten, requestRender, consumeRender } from './state.js';
import { adjust, boxBlur, sharpen, pixelate, applyToContext } from './filters.js';
import { begin, move, end, clearActive } from './tools.js';
import * as UI from './ui.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const mini = document.getElementById('mini');
const mctx = mini.getContext('2d');
const fileInput = document.getElementById('file-input');
const projectInput = document.getElementById('project-input');
const video = document.getElementById('camera-video');

let W = 0, H = 0, dpr = 1, dirty = true;
let pointers = new Map(), gesture = null;
let stickerText = '✦';
let saveTimer = null;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  dirty = true;
}
window.addEventListener('resize', resize);
resize();

function checker(c) {
  const s = 12;
  for (let y = 0; y < c.canvas.height; y += s) {
    for (let x = 0; x < c.canvas.width; x += s) {
      c.fillStyle = ((x / s + y / s) % 2) ? '#20263c' : '#171c2e';
      c.fillRect(x, y, s, s);
    }
  }
}

function render() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const dw = doc.width * doc.zoom, dh = doc.height * doc.zoom;
  const dx = (W - dw) / 2 + doc.panX, dy = (H - dh) / 2 + doc.panY;

  ctx.save();
  ctx.fillStyle = '#0e1324';
  ctx.fillRect(dx - 8, dy - 8, dw + 16, dh + 16);
  checker(ctx);
  ctx.save();
  ctx.translate(dx, dy);
  ctx.scale(doc.zoom, doc.zoom);
  ctx.beginPath(); ctx.rect(0, 0, doc.width, doc.height); ctx.clip();
  checker(ctx);
  for (const layer of doc.layers) {
    if (!layer.visible) continue;
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.globalCompositeOperation = layer.blend;
    ctx.drawImage(layer.canvas, 0, 0);
    ctx.restore();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(140,180,255,.35)'; ctx.lineWidth = 1;
  ctx.strokeRect(dx - .5, dy - .5, dw + 1, dh + 1);
  ctx.restore();

  mctx.clearRect(0, 0, mini.width, mini.height);
  mctx.fillStyle = '#0e1324'; mctx.fillRect(0, 0, mini.width, mini.height);
  mctx.save();
  mctx.scale(mini.width / doc.width, mini.height / doc.height);
  for (const layer of doc.layers) if (layer.visible) { mctx.globalAlpha = layer.opacity; mctx.drawImage(layer.canvas, 0, 0); }
  mctx.restore();
  mctx.strokeStyle = '#26d6ee';
  mctx.strokeRect(-doc.panX / doc.width * mini.width, -doc.panY / doc.height * mini.height,
    W / doc.width * mini.width, H / doc.height * mini.height);
  UI.renderHud();
}

function frame() {
  requestAnimationFrame(frame);
  if (dirty || consumeRender()) { render(); dirty = false; }
}
requestAnimationFrame(frame);
function invalidate() { dirty = true; }
window.addEventListener('ps:render', invalidate);

function point(e) {
  const r = canvas.getBoundingClientRect();
  const dw = doc.width * doc.zoom, dh = doc.height * doc.zoom;
  const dx = (W - dw) / 2 + doc.panX, dy = (H - dh) / 2 + doc.panY;
  return { x: (e.clientX - r.left - dx) / doc.zoom, y: (e.clientY - r.top - dy) / doc.zoom };
}

canvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  canvas.setPointerCapture?.(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) {
    if (gesture?.session) end();
    gesture = { kind: 'zoom', dist: pointerDistance() };
    return;
  }
  const p = point(e);
  if (e.button === 1 || e.altKey || doc.tool === 'move') {
    gesture = { kind: 'pan', sx: e.clientX, sy: e.clientY, px: doc.panX, py: doc.panY };
    return;
  }
  const res = begin(p.x, p.y, { tool: doc.tool, color: doc.color, brush: doc.brush,
    text: stickerText, fontSize: 42, stroke: false });
  if (res && res.picked) {
    doc.color = res.picked; UI.renderInspector(); UI.toast(res.picked); return;
  }
  gesture = { kind: 'draw', session: !!res?.session };
  invalidate();
});
canvas.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (gesture?.kind === 'zoom' && pointers.size >= 2) {
    const d = pointerDistance();
    if (gesture.dist) zoom(d / gesture.dist);
    gesture.dist = d;
    return;
  }
  if (gesture?.kind === 'pan') {
    doc.panX = gesture.px + (e.clientX - gesture.sx);
    doc.panY = gesture.py + (e.clientY - gesture.sy);
    invalidate(); return;
  }
  if (gesture?.kind === 'draw') { const p = point(e); move(p.x, p.y); invalidate(); }
});
function pointerDistance() {
  const p = [...pointers.values()];
  return p.length >= 2 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
}
function stopPointer(e) {
  pointers.delete(e.pointerId);
  if (gesture?.kind === 'draw') end();
  if (pointers.size < 2 && gesture?.kind === 'zoom') gesture = null;
  if (pointers.size === 0) gesture = null;
  invalidate(); scheduleSave();
}
canvas.addEventListener('pointerup', stopPointer);
canvas.addEventListener('pointercancel', stopPointer);
canvas.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.1 : 0.9); }, { passive: false });

function zoom(f) { doc.zoom = Math.max(0.25, Math.min(16, doc.zoom * f)); invalidate(); UI.renderHud(); }
function fit() {
  doc.zoom = Math.min((W - 80) / doc.width, (H - 280) / doc.height);
  doc.panX = doc.panY = 0; invalidate(); UI.renderHud();
}

function scheduleSave() {
  document.getElementById('save-status').textContent = '●';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (saveProject()) document.getElementById('save-status').textContent = '●';
  }, 700);
}

function loadImage(file, asLayer = true) {
  if (!file || !file.type.startsWith('image/')) return;
  const img = new Image();
  img.onload = () => {
    snapshot('Import');
    const layer = asLayer ? (doc.layers[doc.active] && !doc.layers[doc.active].locked ? doc.layers[doc.active] : null) : activeLayer();
    if (!layer) return;
    const c = layer.canvas, x = layer.ctx;
    const scale = Math.min(c.width / img.width, c.height / img.height);
    const w = img.width * scale, h = img.height * scale;
    x.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
    invalidate(); UI.toast('Image imported'); UI.renderDock(); scheduleSave();
  };
  img.src = URL.createObjectURL(file);
}
fileInput.onchange = () => loadImage(fileInput.files[0]);
projectInput.onchange = () => {
  const f = projectInput.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { if (loadProject(r.result)) { UI.renderAll(); invalidate(); UI.toast('Project loaded'); } };
  r.readAsText(f);
};

async function camera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream; await video.play();
    UI.dialog('Camera', '<video style="width:100%;border-radius:12px" autoplay playsinline muted id="cam-preview"></video>', [
      { label: 'Cancel', fn: () => stream.getTracks().forEach(t => t.stop()) },
      { label: 'Capture', primary: true, fn: () => {
        const c = document.createElement('canvas');
        c.width = doc.width; c.height = doc.height;
        c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
        snapshot('Camera');
        const layer = activeLayer(); if (layer) layer.ctx.drawImage(c, 0, 0);
        stream.getTracks().forEach(t => t.stop()); invalidate(); scheduleSave();
      } }
    ]);
    const preview = document.getElementById('cam-preview');
    if (preview) preview.srcObject = stream;
  } catch (e) { UI.toast('Camera unavailable'); }
}

function exportImage(type = 'image/png', quality = 0.92, scale = 1) {
  const out = document.createElement('canvas');
  out.width = doc.width * scale; out.height = doc.height * scale;
  const c = out.getContext('2d');
  if (type !== 'image/png') { c.fillStyle = '#fff'; c.fillRect(0, 0, out.width, out.height); }
  c.scale(scale, scale);
  for (const l of doc.layers) if (l.visible) { c.globalAlpha = l.opacity; c.globalCompositeOperation = l.blend; c.drawImage(l.canvas, 0, 0); }
  out.toBlob(blob => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (doc.name || 'pixel-studio') + (type === 'image/png' ? '.png' : type === 'image/jpeg' ? '.jpg' : '.webp');
    a.click();
    URL.revokeObjectURL(a.href);
    UI.toast('Exported');
  }, type, quality);
}
function exportDialog() {
  UI.dialog(UI.t('export'), `<div class="field"><label>${UI.t('format')}</label>
    <select id="ex-type"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></div>
    <div class="field"><label>${UI.t('quality')}</label><input id="ex-q" type="range" min="30" max="100" value="92"></div>
    <div class="field"><label>${UI.t('size')}</label><select id="ex-s"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></div>`,
    [{ label: UI.t('cancel') }, { label: UI.t('export'), primary: true, fn: () => {
      exportImage(document.getElementById('ex-type')?.value || 'image/png',
        +(document.getElementById('ex-q')?.value || 92) / 100,
        +(document.getElementById('ex-s')?.value || 1));
    } }]);
}
async function share() {
  const out = document.createElement('canvas');
  out.width = doc.width; out.height = doc.height;
  const c = out.getContext('2d');
  for (const l of doc.layers) if (l.visible) { c.globalAlpha = l.opacity; c.drawImage(l.canvas, 0, 0); }
  try {
    const blob = await new Promise(r => out.toBlob(r));
    const file = new File([blob], doc.name + '.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: doc.name });
    else UI.toast('Sharing unavailable');
  } catch (e) { UI.toast('Sharing unavailable'); }
}

function applyEffect(effect) {
  const l = activeLayer(); if (!l || l.locked) return;
  snapshot(effect);
  if (effect === 'grayscale') applyToContext(l.ctx, (d, w, h) => adjust(d, { grayscale: 100 }));
  else if (effect === 'sepia') applyToContext(l.ctx, (d, w, h) => adjust(d, { sepia: 100 }));
  else if (effect === 'invert') applyToContext(l.ctx, (d, w, h) => adjust(d, { invert: 100 }));
  else if (effect === 'blur') applyToContext(l.ctx, (d, w, h) => boxBlur(d, w, h, 3));
  else if (effect === 'sharpen') applyToContext(l.ctx, (d, w, h) => sharpen(d, w, h, 60));
  else if (effect === 'pixelate') applyToContext(l.ctx, (d, w, h) => pixelate(d, w, h, 8));
  invalidate(); UI.renderDock(); scheduleSave();
}
function applyAdjust(opts) {
  const l = activeLayer(); if (!l || l.locked) return;
  snapshot('Adjust');
  applyToContext(l.ctx, (d, w, h) => adjust(d, opts));
  invalidate(); scheduleSave();
}
window.addEventListener('ps:effect', e => applyEffect(e.detail));
window.addEventListener('ps:adjust', e => applyAdjust(e.detail));
window.addEventListener('ps:preset', e => applyAdjust(e.detail));
window.addEventListener('ps:sticker', e => { stickerText = e.detail; doc.tool = 'sticker'; UI.renderTools(); UI.renderInspector(); });

document.addEventListener('keydown', e => {
  if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
  const map = { v:'move', b:'brush', e:'eraser', f:'fill', l:'line', r:'rect', o:'ellipse', t:'text', s:'sticker', i:'pick' };
  if (map[e.key.toLowerCase()]) { doc.tool = map[e.key.toLowerCase()]; UI.renderTools(); UI.renderInspector(); UI.renderHud(); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); UI.renderAll(); invalidate(); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveProject(); UI.toast('Saved'); }
  if (e.key === 'Escape') UI.closeDialog();
  if (e.key === '+' || e.key === '=') zoom(1.2);
  if (e.key === '-') zoom(0.83);
  if (e.key === '0') fit();
});

const savedLang = (() => { try { return localStorage.getItem('lang'); } catch (e) { return null; } })();
UI.setLang(savedLang === 'it' ? 'it' : 'en');
newProject(512, 512);
loadProject();
UI.bindChrome({
  undo: () => { undo(); UI.renderAll(); invalidate(); },
  redo: () => { redo(); UI.renderAll(); invalidate(); },
  clear: () => { clearActive(); invalidate(); },
  zoom, fit, camera, share, exportDialog
});
UI.renderAll();
fit();
document.getElementById('save-status').textContent = '●';
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
