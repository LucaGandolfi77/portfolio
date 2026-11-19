/* Cozy Coloring Book — bootstrap and interaction wiring */

import { engine, initEngine, loadFigure, artFromDataUrl, screenToArt, zoomBy, panBy, resetView } from './engine.js';
import { getFigure } from './figures.js';
import { History } from './history.js';
import { floodFill, stroke, dot, erase, pickColor, hexToRgb } from './tools.js';
import { autosave, getCurrent, saveToGallery, getState } from './storage.js';
import {
  initUI, getTool, getColor, getBrushSize, getOpacity, getTolerance,
  setFigureName, setColor, toast, updateHistoryButtons, renderGallery, showView, t
} from './ui.js';

const history = new History(30);
let drawing = false;
let panning = false;
let lastPoint = null;
let lastPan = null;
let saveTimer = 0;
let currentFigure = null;

function snapshot() { history.push(engine.ctx.getImageData(0, 0, engine.art.width, engine.art.height)); }
function refreshHistoryUI() { updateHistoryButtons(history.canUndo, history.canRedo); }

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (currentFigure) autosave(engine.art, currentFigure.id);
  }, 700);
}

function selectFigure(figure) {
  currentFigure = figure;
  loadFigure(figure);
  history.clear();
  refreshHistoryUI();
  setFigureName(figure.name);
  showView('draw');
  resetView();
  document.getElementById('zoomBadge').textContent = '100%';
  toast(figure.name + ' 🎨');
  scheduleSave();
}

function undo() {
  if (history.undo(engine.ctx)) { refreshHistoryUI(); scheduleSave(); }
}
function redo() {
  if (history.redo(engine.ctx)) { refreshHistoryUI(); scheduleSave(); }
}

function recolor() {
  if (!currentFigure) return;
  snapshot();
  loadFigure(currentFigure);
  refreshHistoryUI();
  toast(t('resetColors'));
  scheduleSave();
}

function applyZoom(delta) {
  const value = zoomBy(delta, window.innerWidth / 2, window.innerHeight / 2);
  document.getElementById('zoomBadge').textContent = Math.round(value * 100) + '%';
}

function openSaved(item) {
  currentFigure = getFigure(item.figureId);
  loadFigure(currentFigure);
  artFromDataUrl(item.image).then(() => {
    setFigureName(item.title || currentFigure.name);
    history.clear();
    refreshHistoryUI();
    showView('draw');
    toast(t('firstOpen'));
  });
}

function bindCanvas() {
  const canvas = engine.art;
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const pos = screenToArt(e.clientX, e.clientY);
    const tool = getTool();

    if (tool === 'pan' || e.button === 1) {
      panning = true;
      lastPan = { x: e.clientX, y: e.clientY };
      return;
    }
    if (tool === 'picker') {
      const color = pickColor(engine.ctx, pos.x, pos.y);
      setColor(color);
      toast(t('colorPicked') + ': ' + color);
      return;
    }
    if (tool === 'fill') {
      const before = engine.ctx.getImageData(0, 0, canvas.width, canvas.height);
      const changed = floodFill(engine.ctx, pos.x, pos.y, hexToRgb(getColor()), getTolerance());
      if (changed) { history.push(before); refreshHistoryUI(); scheduleSave(); }
      return;
    }
    snapshot();
    drawing = true;
    lastPoint = pos;
    if (tool === 'eraser') erase(engine.ctx, engine.template, pos.x, pos.y, getBrushSize() * 2.2);
    else dot(engine.ctx, pos.x, pos.y, getColor(), getBrushSize(), getOpacity());
    refreshHistoryUI();
  });

  canvas.addEventListener('pointermove', e => {
    if (panning && lastPan) {
      panBy(e.clientX - lastPan.x, e.clientY - lastPan.y);
      lastPan = { x: e.clientX, y: e.clientY };
      return;
    }
    if (!drawing) return;
    const pos = screenToArt(e.clientX, e.clientY);
    if (getTool() === 'eraser') erase(engine.ctx, engine.template, pos.x, pos.y, getBrushSize() * 2.2);
    else stroke(engine.ctx, lastPoint, pos, getColor(), getBrushSize(), getOpacity());
    lastPoint = pos;
    scheduleSave();
  });

  const end = () => { drawing = false; panning = false; lastPoint = null; lastPan = null; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('lostpointercapture', end);

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    applyZoom(e.deltaY < 0 ? 0.12 : -0.12);
  }, { passive: false });
}

function download() {
  const link = document.createElement('a');
  link.download = 'cozy-coloring.png';
  link.href = engine.art.toDataURL('image/png');
  link.click();
}

function boot() {
  initEngine(document.getElementById('art'));
  initUI({
    onSelectFigure: selectFigure,
    onUndo: undo,
    onRedo: redo,
    onRecolor: recolor,
    onZoom: applyZoom,
    onZoomReset: () => { resetView(); document.getElementById('zoomBadge').textContent = '100%'; },
    onSaveGallery: () => {
      if (!currentFigure) return;
      saveToGallery(engine.art, currentFigure.id, currentFigure.name);
      toast(t('saved'));
      renderGallery();
    },
    onDownload: download,
    onPrint: () => window.print(),
    onOpenSaved: openSaved,
    onColor: () => {}
  });

  bindCanvas();

  const saved = getCurrent();
  if (saved) {
    currentFigure = getFigure(saved.figureId);
    loadFigure(currentFigure);
    artFromDataUrl(saved.image).then(() => {
      setFigureName(currentFigure.name);
      toast(t('firstOpen'));
    });
  } else {
    selectFigure(getFigure('cat'));
  }
}

boot();
