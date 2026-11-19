/* Cozy Coloring Book — interface, library, gallery and bilingual strings */

import { FIGURES, CATEGORIES, dailyFigure } from './figures.js';
import { getState, removeFromGallery, isFavorite, toggleFavorite } from './storage.js';

const DICT = {
  it: {
    back: 'Portfolio', appTitle: 'Cozy Coloring Book', tagline: 'Un momento di calma, un colore alla volta',
    tabDraw: 'Disegna', tabLibrary: 'Libreria', tabGallery: 'Galleria',
    tools: 'Strumenti', toolFill: 'Riempi', toolPen: 'Pennello', toolEraser: 'Gomma',
    toolPicker: 'Contagocce', toolPan: 'Sposta', colors: 'Colori', customColor: 'Colore personalizzato',
    brushSize: 'Spessore', opacity: 'Opacità', tolerance: 'Tolleranza', actions: 'Azioni',
    undo: 'Annulla', redo: 'Ripeti', resetColors: 'Ricolora', saveGallery: 'Salva in galleria',
    download: 'Scarica PNG', print: 'Stampa', currentFigure: 'Disegno attuale',
    libraryTitle: 'Scegli un disegno', search: 'Cerca un disegno…', random: 'Sorprendimi',
    galleryTitle: 'La tua galleria', galleryHint: 'I disegni salvati restano in questo browser.',
    figures: 'disegni', dailyChallenge: 'Sfida del giorno', playDaily: 'Colora la sfida',
    saved: 'Disegno salvato!', removed: 'Disegno rimosso', noResults: 'Nessun disegno trovato',
    emptyGallery: 'Non hai ancora salvato nulla. Colora un disegno e salvalo qui!',
    colorPicked: 'Colore prelevato', firstOpen: 'Scegli un disegno dalla Libreria per iniziare 🎨'
  },
  en: {
    back: 'Portfolio', appTitle: 'Cozy Coloring Book', tagline: 'A calm moment, one color at a time',
    tabDraw: 'Draw', tabLibrary: 'Library', tabGallery: 'Gallery',
    tools: 'Tools', toolFill: 'Fill', toolPen: 'Brush', toolEraser: 'Eraser',
    toolPicker: 'Eyedropper', toolPan: 'Pan', colors: 'Colors', customColor: 'Custom color',
    brushSize: 'Brush size', opacity: 'Opacity', tolerance: 'Tolerance', actions: 'Actions',
    undo: 'Undo', redo: 'Redo', resetColors: 'Recolor', saveGallery: 'Save to gallery',
    download: 'Download PNG', print: 'Print', currentFigure: 'Current figure',
    libraryTitle: 'Pick a drawing', search: 'Search a drawing…', random: 'Surprise me',
    galleryTitle: 'Your gallery', galleryHint: 'Saved drawings stay in this browser.',
    figures: 'drawings', dailyChallenge: 'Daily challenge', playDaily: 'Color the challenge',
    saved: 'Drawing saved!', removed: 'Drawing removed', noResults: 'No drawings found',
    emptyGallery: 'Nothing saved yet. Color a drawing and save it here!',
    colorPicked: 'Color picked', firstOpen: 'Pick a drawing from the Library to start 🎨'
  }
};

let lang = 'it';
try {
  const site = localStorage.getItem('site_lang') || localStorage.getItem('lang');
  lang = String(site).slice(0, 2) === 'en' ? 'en' : 'it';
} catch (e) { /* default */ }

export function t(key) { return (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key; }
export function getLang() { return lang; }
export function setLang(value) { lang = value === 'en' ? 'en' : 'it'; }

const $ = id => document.getElementById(id);
let toastTimer = 0;
let activeCategory = 'all';
let activeTool = 'fill';
let activeColor = '#e88b6a';
let callbacks = {};

export function toast(message) {
  const el = $('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 2200);
}

export function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view' + name[0].toUpperCase() + name.slice(1)));
  document.querySelectorAll('.tab').forEach(tab => {
    const on = tab.dataset.view === name;
    tab.classList.toggle('active', on);
    tab.setAttribute('aria-selected', on ? 'true' : 'false');
  });
}

export function setTool(tool) {
  activeTool = tool;
  document.querySelectorAll('.tool').forEach(btn => btn.classList.toggle('active', btn.dataset.tool === tool));
  $('paper')?.classList.toggle('pan', tool === 'pan');
  callbacks.onTool?.(tool);
}

export function getTool() { return activeTool; }
export function getColor() { return activeColor; }
export function getBrushSize() { return Number($('brushSize').value); }
export function getOpacity() { return Number($('opacity').value) / 100; }
export function getTolerance() { return Number($('tolerance').value); }

export function setColor(color) {
  activeColor = color;
  document.querySelectorAll('.swatch').forEach(el => el.classList.toggle('active', el.dataset.color === color));
  const custom = $('customColor');
  if (custom) custom.value = color;
  callbacks.onColor?.(color);
}

function drawThumb(canvas, figure) {
  const ctx = canvas.getContext('2d');
  canvas.width = 300;
  canvas.height = 200;
  ctx.fillStyle = '#fffdf8';
  ctx.fillRect(0, 0, 300, 200);
  ctx.save();
  ctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  ctx.strokeStyle = '#8b7a6a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  figure.draw(ctx);
  ctx.restore();
}

export function renderCategories() {
  const row = $('categories');
  row.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'category' + (cat.id === activeCategory ? ' active' : '');
    btn.textContent = cat.icon + ' ' + cat.label;
    btn.onclick = () => { activeCategory = cat.id; renderCategories(); renderFigures(); };
    row.appendChild(btn);
  });
}

export function renderFigures() {
  const query = ($('searchInput').value || '').trim().toLowerCase();
  const list = FIGURES.filter(fig => {
    const inCategory = activeCategory === 'all' || fig.category === activeCategory;
    const inSearch = !query || (fig.name + ' ' + fig.tags + ' ' + fig.category).toLowerCase().includes(query);
    return inCategory && inSearch;
  });
  $('figureCount').textContent = `${list.length} ${t('figures')} · ${FIGURES.length} totali`;
  const grid = $('figureGrid');
  grid.innerHTML = '';
  if (!list.length) { grid.innerHTML = `<p class="empty-state">${t('noResults')}</p>`; return; }
  list.forEach(fig => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'figure-card';
    const canvas = document.createElement('canvas');
    drawThumb(canvas, fig);
    card.appendChild(canvas);
    const title = document.createElement('b');
    title.textContent = fig.name;
    const sub = document.createElement('small');
    sub.textContent = fig.category;
    card.append(title, sub);
    card.onclick = () => callbacks.onSelectFigure?.(fig);
    grid.appendChild(card);
  });
}

export function renderDaily() {
  const fig = dailyFigure();
  const box = $('dailyBanner');
  box.innerHTML = `<span>🌟 ${t('dailyChallenge')}: <b>${fig.name}</b></span>
    <button class="soft-btn" id="dailyBtn" type="button">${t('playDaily')} →</button>`;
  $('dailyBtn').onclick = () => callbacks.onSelectFigure?.(fig);
}

export function renderGallery() {
  const grid = $('galleryGrid');
  const state = getState();
  grid.innerHTML = '';
  if (!state.items.length) { grid.innerHTML = `<p class="empty-state">${t('emptyGallery')}</p>`; return; }
  state.items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    const img = document.createElement('img');
    img.src = item.thumb;
    img.alt = item.title;
    const info = document.createElement('div');
    const title = document.createElement('b');
    title.textContent = item.title;
    const actions = document.createElement('span');
    const fav = document.createElement('button');
    fav.type = 'button';
    fav.textContent = isFavorite(item.id) ? '⭐' : '☆';
    fav.title = 'Favorite';
    fav.onclick = () => { toggleFavorite(item.id); renderGallery(); };
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '🗑';
    del.title = 'Delete';
    del.onclick = () => { removeFromGallery(item.id); renderGallery(); toast(t('removed')); };
    const open = document.createElement('button');
    open.type = 'button';
    open.textContent = '↗';
    open.title = 'Open';
    open.onclick = () => callbacks.onOpenSaved?.(item);
    actions.append(fav, open, del);
    info.append(title, actions);
    card.append(img, info);
    grid.appendChild(card);
  });
}

export function setFigureName(name) { $('figureName').textContent = name || '—'; }

export function updateHistoryButtons(canUndo, canRedo) {
  $('undoBtn').disabled = !canUndo;
  $('redoBtn').disabled = !canRedo;
}

export function applyLanguage() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(node => { node.placeholder = t(node.dataset.i18nPh); });
  $('langBtn').textContent = lang === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  renderCategories();
  renderFigures();
  renderDaily();
  renderGallery();
}

export function initUI(callbacksIn) {
  callbacks = callbacksIn;
  applyLanguage();

  const paletteColors = [
    '#e88b6a', '#f2b56b', '#f5dd8b', '#a9cf8b', '#6fb9a1', '#8bb7d4', '#a89bd4', '#d791bf',
    '#8d6e5c', '#c9b8a8', '#fffdf8', '#4a3b32', '#d95757', '#e07a3f', '#c9a227', '#6f9c4a',
    '#3f8f7a', '#3f6fa8', '#6b52a8', '#a8447a', '#f4c7b2', '#e8d5b7', '#dcefc9', '#cfe4f2'
  ];
  const palette = $('palette');
  paletteColors.forEach((color, index) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'swatch' + (index === 0 ? ' active' : '');
    swatch.dataset.color = color;
    swatch.style.background = color;
    swatch.setAttribute('aria-label', color);
    swatch.onclick = () => setColor(color);
    palette.appendChild(swatch);
  });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = () => {
      showView(tab.dataset.view);
      if (tab.dataset.view === 'gallery') renderGallery();
    };
  });
  document.querySelectorAll('.tool').forEach(btn => { btn.onclick = () => setTool(btn.dataset.tool); });
  $('customColor').oninput = e => setColor(e.target.value);

  [['brushSize', 'brushVal', ''], ['opacity', 'opacityVal', '%'], ['tolerance', 'toleranceVal', '']].forEach(([id, out, suffix]) => {
    const input = $(id);
    const update = () => { $(out).textContent = input.value + suffix; };
    input.oninput = update;
    update();
  });

  $('undoBtn').onclick = () => callbacks.onUndo?.();
  $('redoBtn').onclick = () => callbacks.onRedo?.();
  $('resetColorBtn').onclick = () => callbacks.onRecolor?.();
  $('zoomInBtn').onclick = () => callbacks.onZoom?.(0.2);
  $('zoomOutBtn').onclick = () => callbacks.onZoom?.(-0.2);
  $('zoomResetBtn').onclick = () => callbacks.onZoomReset?.();
  $('saveGalleryBtn').onclick = () => callbacks.onSaveGallery?.();
  $('downloadBtn').onclick = () => callbacks.onDownload?.();
  $('printBtn').onclick = () => callbacks.onPrint?.();
  $('randomBtn').onclick = () => callbacks.onSelectFigure?.(FIGURES[Math.floor(Math.random() * FIGURES.length)]);
  $('searchInput').oninput = renderFigures;
  $('langBtn').onclick = () => { setLang(lang === 'it' ? 'en' : 'it'); applyLanguage(); };
  $('muteBtn').onclick = () => {
    const muted = $('muteBtn').textContent === '🔇';
    $('muteBtn').textContent = muted ? '🔊' : '🔇';
  };
  updateHistoryButtons(false, false);
}
