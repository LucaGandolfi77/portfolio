/* Pixel Studio — document, layers and history */
import { BLEND_MODES } from './config.js';

const KEY = 'pixel-studio-project-v3';
const MAX_HISTORY = 30;

export const doc = {
  width: 512, height: 512,
  layers: [], active: 0,
  name: 'Untitled',
  zoom: 1, panX: 0, panY: 0,
  tool: 'brush', color: '#ff4d6d', brush: 6, opacity: 1,
  fillShapes: false, showGrid: false
};

let layerId = 0;
const undoStack = [];
const redoStack = [];

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

export function makeLayer(name = 'Layer', w = doc.width, h = doc.height) {
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  return {
    id: ++layerId, name, canvas, ctx,
    visible: true, locked: false,
    opacity: 1, blend: 'normal'
  };
}

export function activeLayer() { return doc.layers[doc.active] || null; }
export function activeCtx() { const l = activeLayer(); return l && !l.locked ? l.ctx : null; }

export function snapshot(label = 'Modifica') {
  try {
    undoStack.push({
      label,
      width: doc.width, height: doc.height, active: doc.active, name: doc.name,
      layers: doc.layers.map(l => ({
        name: l.name, visible: l.visible, locked: l.locked,
        opacity: l.opacity, blend: l.blend, data: l.canvas.toDataURL('image/png')
      }))
    });
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack.length = 0;
    emit();
  } catch (e) { /* quota */ }
}

function applyState(s) {
  doc.width = s.width; doc.height = s.height;
  doc.active = Math.min(s.active, s.layers.length - 1);
  doc.name = s.name || 'Untitled';
  doc.layers = s.layers.map(d => {
    const l = makeLayer(d.name, s.width, s.height);
    l.visible = d.visible; l.locked = d.locked;
    l.opacity = d.opacity; l.blend = BLEND_MODES.includes(d.blend) ? d.blend : 'normal';
    if (d.data) {
      const img = new Image();
      img.src = d.data;
      img.onload = () => l.ctx.drawImage(img, 0, 0);
    }
    return l;
  });
  requestRender();
  emit();
}

export function undo() {
  if (!undoStack.length) return false;
  redoStack.push({
    label: 'Stato',
    width: doc.width, height: doc.height, active: doc.active, name: doc.name,
    layers: doc.layers.map(l => ({ name: l.name, visible: l.visible, locked: l.locked,
      opacity: l.opacity, blend: l.blend, data: l.canvas.toDataURL('image/png') }))
  });
  applyState(undoStack.pop());
  return true;
}

export function redo() {
  if (!redoStack.length) return false;
  undoStack.push({
    label: 'Stato',
    width: doc.width, height: doc.height, active: doc.active, name: doc.name,
    layers: doc.layers.map(l => ({ name: l.name, visible: l.visible, locked: l.locked,
      opacity: l.opacity, blend: l.blend, data: l.canvas.toDataURL('image/png') }))
  });
  applyState(redoStack.pop());
  return true;
}

export function history() {
  return undoStack.map((s, i) => ({ index: i, label: s.label })).concat(
    redoStack.map((s, i) => ({ index: undoStack.length + i, label: s.label, future: true }))
  );
}
export function jumpTo(index) {
  if (index < 0 || index >= undoStack.length) return;
  const target = undoStack[index];
  undoStack.splice(index + 1);
  applyState(target);
}

export function newProject(w = 512, h = 512) {
  doc.width = w; doc.height = h;
  doc.layers = [makeLayer('Sfondo', w, h)];
  doc.active = 0;
  doc.name = 'Untitled';
  doc.zoom = 1; doc.panX = 0; doc.panY = 0;
  undoStack.length = 0; redoStack.length = 0;
  activeLayer().ctx.clearRect(0, 0, w, h);
  requestRender();
  emit();
}

export function addLayer() {
  snapshot('Nuovo livello');
  const l = makeLayer('Livello ' + (doc.layers.length + 1));
  doc.layers.splice(doc.active + 1, 0, l);
  doc.active += 1;
  requestRender(); emit();
  return l;
}
export function duplicateLayer() {
  const src = activeLayer(); if (!src) return;
  snapshot('Duplica');
  const l = makeLayer(src.name + ' copia');
  l.ctx.drawImage(src.canvas, 0, 0);
  l.opacity = src.opacity; l.blend = src.blend;
  doc.layers.splice(doc.active + 1, 0, l); doc.active += 1;
  requestRender(); emit();
}
export function deleteLayer() {
  if (doc.layers.length <= 1) return false;
  const l = activeLayer(); if (!l || l.locked) return false;
  snapshot('Elimina livello');
  doc.layers.splice(doc.active, 1);
  doc.active = Math.max(0, Math.min(doc.active, doc.layers.length - 1));
  requestRender(); emit();
  return true;
}
export function moveLayer(from, to) {
  if (to < 0 || to >= doc.layers.length) return;
  const [l] = doc.layers.splice(from, 1);
  doc.layers.splice(to, 0, l);
  doc.active = to;
  snapshot('Riordina');
  requestRender(); emit();
}
export function mergeDown() {
  if (doc.active <= 0) return;
  const top = activeLayer(), below = doc.layers[doc.active - 1];
  if (top.locked || below.locked) return;
  snapshot('Unisci');
  below.ctx.save();
  below.ctx.globalAlpha = top.opacity;
  below.ctx.globalCompositeOperation = top.blend;
  below.ctx.drawImage(top.canvas, 0, 0);
  below.ctx.restore();
  doc.layers.splice(doc.active, 1);
  doc.active -= 1;
  requestRender(); emit();
}
export function flatten() {
  snapshot('Appiattisci');
  const base = makeLayer('Sfondo');
  doc.layers.forEach(l => {
    base.ctx.save();
    base.ctx.globalAlpha = l.opacity;
    base.ctx.globalCompositeOperation = l.blend;
    base.ctx.drawImage(l.canvas, 0, 0);
    base.ctx.restore();
  });
  doc.layers = [base]; doc.active = 0;
  requestRender(); emit();
}
export function setActive(i) {
  doc.active = Math.max(0, Math.min(i, doc.layers.length - 1));
  requestRender(); emit();
}

export function serialize() {
  return {
    version: 3, name: doc.name, width: doc.width, height: doc.height,
    layers: doc.layers.map(l => ({ name: l.name, visible: l.visible, locked: l.locked,
      opacity: l.opacity, blend: l.blend, data: l.canvas.toDataURL('image/png') }))
  };
}
export function saveProject() {
  try { localStorage.setItem(KEY, JSON.stringify(serialize())); return true; }
  catch (e) { return false; }
}
export function loadProject(data) {
  const raw = data || localStorage.getItem(KEY);
  if (!raw) return false;
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!obj.layers || !obj.width) return false;
    doc.width = obj.width; doc.height = obj.height; doc.name = obj.name || 'Untitled';
    doc.layers = obj.layers.map(d => {
      const l = makeLayer(d.name, obj.width, obj.height);
      l.visible = d.visible !== false; l.locked = !!d.locked;
      l.opacity = d.opacity == null ? 1 : d.opacity;
      l.blend = BLEND_MODES.includes(d.blend) ? d.blend : 'normal';
      if (d.data) {
        const img = new Image(); img.src = d.data;
        img.onload = () => { l.ctx.drawImage(img, 0, 0); requestRender(); };
      }
      return l;
    });
    doc.active = 0;
    requestRender(); emit();
    return true;
  } catch (e) { return false; }
}

const listeners = new Set();
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function emit() { listeners.forEach(fn => fn()); }

let renderDirty = true;
export function requestRender() { renderDirty = true; }
export function consumeRender() { if (!renderDirty) return false; renderDirty = false; return true; }
