/* UI del Camera Tracker */

import { FILTERS, RESOLUTIONS } from './config.js';
import { t, getLang, setLang, onLangChange, uiLang } from './i18n.js';

const $ = id => document.getElementById(id);
const OVERLAYS = ['permissionOverlay', 'settingsOverlay', 'galleryOverlay', 'diagOverlay'];
let callbacks = {};
let currentFilter = 'normal';

export function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => el.classList.remove('show'), 2400);
}

export function showOverlay(name) {
  OVERLAYS.forEach(id => $(id).classList.add('hidden'));
  if (name) $(name).classList.remove('hidden');
}

export function hidePermission() { showOverlay(null); }

export function showPermissionError(message) {
  const el = $('permissionError');
  el.textContent = message;
  el.classList.remove('hidden');
}

export function setStatus(text, kind) {
  const el = $('statusChip');
  el.textContent = '● ' + text;
  el.className = 'status-chip' + (kind ? ' ' + kind : '');
}

export function setOnline(online) {
  $('offlineChip').classList.toggle('hidden', online);
  $('offlineChip').textContent = '⚡ ' + t('status.offline');
}

export function setFilter(id) {
  currentFilter = id;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === id);
  });
  const def = FILTERS.find(f => f.id === id);
  $('sliderContainer').classList.toggle('hidden', !def || !def.slider);
  if (def && def.slider) $('filterSlider').value = def.slider;
  const rail = $('filterRail');
  const active = rail.querySelector('.filter-btn.active');
  if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

export function setFilterState(id, state) {
  const btn = document.querySelector('.filter-btn[data-filter="' + id + '"]');
  if (!btn) return;
  btn.classList.remove('loading', 'error');
  if (state) btn.classList.add(state);
}

export function getSliderValue() { return Number($('filterSlider').value); }

export function setCountdown(value) {
  const el = $('countdown');
  if (!value) { el.classList.add('hidden'); return; }
  el.textContent = String(value);
  el.classList.remove('hidden');
}

export function setTorchActive(active) { $('torchBtn').classList.toggle('active', active); }
export function setTimerActive(active) { $('timerBtn').classList.toggle('active', active); }
export function setZoom(value) {
  $('zoomRange').value = String(value);
  $('zoomLabel').textContent = Number(value).toFixed(1).replace(/\.0$/, '') + '×';
}

export function renderGallery(photos) {
  const grid = $('galleryGrid');
  grid.innerHTML = '';
  $('galleryEmpty').classList.toggle('hidden', photos.length > 0);
  $('galleryEmpty').textContent = t('status.noPhotos');
  photos.forEach(photo => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML =
      '<img src="' + photo.dataUrl + '" alt="photo">' +
      '<button class="del" type="button" title="' + t('action.delete') + '">✕</button>' +
      '<button class="share" type="button" title="' + t('action.share') + '">↗</button>';
    item.querySelector('.del').addEventListener('click', () => callbacks.onDeletePhoto && callbacks.onDeletePhoto(photo.id));
    item.querySelector('.share').addEventListener('click', () => callbacks.onSharePhoto && callbacks.onSharePhoto(photo));
    grid.appendChild(item);
  });
}

export function updateDiagnostics(data) {
  const items = [
    ['diag.fps', data.fps || 0],
    ['diag.resolution', data.resolution || '—'],
    ['diag.model', data.model || t('diag.none')],
    ['diag.detection', data.detectionMs != null ? Math.round(data.detectionMs) + ' ms' : '—'],
    ['diag.network', data.online ? t('status.online') : t('status.offline')],
    ['diag.filter', t('filter.' + currentFilter)]
  ];
  $('diagContent').innerHTML = items.map(([key, value]) =>
    '<div class="diag-box"><span>' + t(key) + '</span><b>' + value + '</b></div>').join('');
}

function renderFilterRail() {
  const rail = $('filterRail');
  rail.innerHTML = '';
  FILTERS.forEach(filter => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn';
    btn.dataset.filter = filter.id;
    btn.title = t(filter.key);
    btn.innerHTML = '<span class="bubble">' + filter.icon + '</span><span class="label">' + t(filter.key) + '</span>';
    btn.addEventListener('click', () => callbacks.onFilter && callbacks.onFilter(filter));
    rail.appendChild(btn);
  });
  setFilter(currentFilter);
}

function renderSettings(settings) {
  const res = $('resolutionSelect');
  res.innerHTML = RESOLUTIONS.map(r => '<option value="' + r.id + '">' + t(r.labelKey) + '</option>').join('');
  res.value = settings.resolution;
  $('speechLangSelect').value = settings.language;
  $('fpsSelect').value = String(settings.detectionFps);
  $('timerSelect').value = String(settings.timer);
  $('mirrorToggle').checked = !!settings.mirror;
  $('soundToggle').checked = settings.sound !== false;
}

export function applyTranslations(settings) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.documentElement.lang = uiLang() === 'it' ? 'it' : 'en';
  renderFilterRail();
  if (settings) renderSettings(settings);
}

export function initUI(callbacksObject, settings) {
  callbacks = callbacksObject || {};
  applyTranslations(settings);
  setFilter(settings.filter || 'normal');
  setZoom(settings.zoom || 1);

  $('startBtn').addEventListener('click', () => {
    hidePermission();
    callbacks.onStart && callbacks.onStart();
  });
  $('shutterBtn').addEventListener('click', () => callbacks.onShutter && callbacks.onShutter());
  $('switchBtn').addEventListener('click', () => callbacks.onSwitch && callbacks.onSwitch());
  $('torchBtn').addEventListener('click', () => callbacks.onTorch && callbacks.onTorch());
  $('timerBtn').addEventListener('click', () => callbacks.onTimer && callbacks.onTimer());
  $('zoomRange').addEventListener('input', e => {
    const value = Number(e.target.value);
    setZoom(value);
    callbacks.onZoom && callbacks.onZoom(value);
  });
  $('filterSlider').addEventListener('input', e => {
    callbacks.onSlider && callbacks.onSlider(Number(e.target.value));
  });

  $('settingsBtn').addEventListener('click', () => showOverlay('settingsOverlay'));
  $('settingsShortcut').addEventListener('click', () => showOverlay('settingsOverlay'));
  $('galleryBtn').addEventListener('click', () => callbacks.onOpenGallery && callbacks.onOpenGallery());
  $('galleryShortcut').addEventListener('click', () => callbacks.onOpenGallery && callbacks.onOpenGallery());
  $('diagBtn').addEventListener('click', () => showOverlay('diagOverlay'));

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => showOverlay(null));
  });

  const settingChange = (key, transform) => event => {
    const value = transform ? transform(event) : event.target.value;
    renderSettings(Object.assign({}, settings, { [key]: value }));
    callbacks.onSetting && callbacks.onSetting(key, value);
  };
  $('resolutionSelect').addEventListener('change', settingChange('resolution'));
  $('speechLangSelect').addEventListener('change', settingChange('language'));
  $('fpsSelect').addEventListener('change', settingChange('detectionFps', e => Number(e.target.value)));
  $('timerSelect').addEventListener('change', settingChange('timer', e => Number(e.target.value)));
  $('mirrorToggle').addEventListener('change', settingChange('mirror', e => e.target.checked));
  $('soundToggle').addEventListener('change', settingChange('sound', e => e.target.checked));

  $('clearGalleryBtn').addEventListener('click', () => callbacks.onClearGallery && callbacks.onClearGallery());
  $('updateBtn').addEventListener('click', () => {
    if (window.__trackerWaitingWorker) window.__trackerWaitingWorker.postMessage({ type: 'SKIP_WAITING' });
    $('updateBar').classList.add('hidden');
  });

  onLangChange(() => {
    applyTranslations(settings);
    if (settings) settings.language = getLang();
  });
}
