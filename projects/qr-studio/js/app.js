/**
 * app.js — controller di QR Studio.
 * Moduli: qr-logic (payload), qr-render (canvas/SVG), storage, scanner, i18n.
 */

import {
  buildPayload,
  detectPayloadType,
  payloadLabel,
  isSafeToOpen,
  fileNameForData,
  truncate,
  valuesFromPayload
} from './qr-logic.js';
import {
  loadHistory,
  addHistoryItem,
  removeHistoryItem,
  clearHistory,
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS
} from './storage.js';
import { buildMatrix, drawCanvas, svgString, canvasToBlob, matrixVersion } from './qr-render.js';
import { QrScanner, scanImageFile } from './scanner.js';
import {
  initLang,
  setLang,
  getLang,
  t,
  typeName,
  applyStatic,
  formatDateTime
} from './i18n.js';
import {
  TYPES,
  FORM_TO_DETECTED,
  DETECTED_TO_FORM,
  OPEN_TYPES,
  typeDefinition
} from './forms.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const ICONS = {
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.07 0l-2 2a5 5 0 0 0 7.07 7.07l1.1-1.1"/></svg>',
  text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><path d="M2 9a15 15 0 0 1 20 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>',
  contact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  sms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l2-5.2a8.4 8.4 0 0 1-.9-3.8 8.4 8.4 0 0 1 8.4-8.5 8.4 8.4 0 0 1 8.5 8z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2z"/></svg>',
  geo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  event: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  location: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};

const COLOR_PRESETS = [
  { fg: '#0a0d16', bg: '#ffffff' },
  { fg: '#044b46', bg: '#e8fff9' },
  { fg: '#172a63', bg: '#eef3ff' },
  { fg: '#5b1638', bg: '#fff0f7' },
  { fg: '#3c2503', bg: '#fff8e6' },
  { fg: '#003b4d', bg: '#e6fbff' },
  { fg: '#2b0f3d', bg: '#f7edff' },
  { fg: '#3d1f00', bg: '#fff3e6' }
];

const state = {
  tab: 'create',
  type: 'link',
  values: {},
  typeValues: {},
  data: '',
  matrix: null,
  settings: loadSettings(),
  history: loadHistory(),
  scanResult: null,
  scanner: null,
  scanning: false,
  scanStatus: 'idle',
  scanStatusMessage: '',
  scanDeviceId: ''
};

let previewTimer = 0;
let toastTimer = 0;

/* -------------------------------------------------------------------------- */
/* Utility                                                                    */
/* -------------------------------------------------------------------------- */

function toast(message) {
  if (!message) return;
  if (window.ProjectShell && typeof window.ProjectShell.toast === 'function') {
    window.ProjectShell.toast(message);
    return;
  }
  let el = $('.pf-toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'pf-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.append(el);
  }
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2200);
}

function confirmDialog(options) {
  if (window.ProjectShell && typeof window.ProjectShell.confirm === 'function') {
    return window.ProjectShell.confirm(options);
  }
  return Promise.resolve(window.confirm(options.message || options.title || ''));
}

async function copyText(value) {
  const text = String(value == null ? '' : value);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fallback */
    }
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return value + ' B';
  if (value < 1024 * 1024) return (value / 1024).toFixed(1) + ' kB';
  return (value / (1024 * 1024)).toFixed(1) + ' MB';
}

function downloadBlob(blob, filename) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function matrixFor(data) {
  const attempts = [state.settings.ec, 'M', 'L'];
  for (const ec of attempts) {
    try {
      return buildMatrix(data, ec);
    } catch {
      /* prova il livello successivo */
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Form                                                                       */
/* -------------------------------------------------------------------------- */

function readFormValues() {
  const values = { ...(state.typeValues[state.type] || {}) };
  const form = $('#qrForm');
  if (!form) return values;
  for (const element of Array.from(form.elements)) {
    if (!element.name) continue;
    values[element.name] = element.type === 'checkbox' ? element.checked : element.value;
  }
  return values;
}

function renderTypeChips() {
  const container = $('#typeChips');
  if (!container) return;
  container.innerHTML = '';
  for (const type of TYPES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'qr-type';
    button.dataset.type = type.id;
    button.setAttribute('aria-pressed', String(type.id === state.type));
    button.innerHTML = ICONS[type.icon] || '';
    const label = document.createElement('span');
    label.textContent = typeName(type.id);
    button.append(label);
    button.addEventListener('click', () => selectType(type.id));
    container.append(button);
  }
}

function makeField(field, values) {
  const wrapper = document.createElement('label');
  const controlId = 'field-' + field.name;
  wrapper.htmlFor = controlId;

  if (field.control === 'checkbox') {
    wrapper.className = 'pf-check qr-field-check';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = controlId;
    input.name = field.name;
    input.checked = Boolean(values[field.name]);
    const text = document.createElement('span');
    text.textContent = t(field.label);
    wrapper.append(input, text);
    return wrapper;
  }

  wrapper.className = 'pf-field';
  const label = document.createElement('span');
  label.className = 'pf-label';
  label.textContent = t(field.label);
  wrapper.append(label);

  let control;
  if (field.control === 'select') {
    control = document.createElement('select');
    control.className = 'pf-select';
    control.id = controlId;
    control.name = field.name;
    if (field.refresh) control.dataset.refresh = 'true';
    for (const option of field.options) {
      const item = document.createElement('option');
      item.value = option.value;
      item.textContent = t(option.label);
      control.append(item);
    }
    control.value = values[field.name] ?? field.value ?? field.options[0].value;
  } else if (field.control === 'textarea') {
    control = document.createElement('textarea');
    control.className = 'pf-textarea';
    control.id = controlId;
    control.name = field.name;
    control.rows = field.rows || 4;
    control.placeholder = t(field.placeholder || '');
    control.value = values[field.name] ?? field.value ?? '';
  } else {
    control = document.createElement('input');
    control.className = 'pf-input';
    control.id = controlId;
    control.name = field.name;
    control.type = field.type || 'text';
    if (field.inputmode) control.inputMode = field.inputmode;
    if (field.autocomplete) control.autocomplete = field.autocomplete;
    if (field.placeholder) control.placeholder = t(field.placeholder);
    if (field.step) control.step = field.step;
    control.value = values[field.name] ?? field.value ?? '';
  }

  if (field.required) {
    control.required = true;
    control.setAttribute('aria-required', 'true');
  }
  wrapper.append(control);
  return wrapper;
}

function renderFields() {
  const container = $('#fields');
  if (!container) return;
  const type = typeDefinition(state.type);
  const values = state.typeValues[state.type] || {};
  container.innerHTML = '';

  for (const field of type.fields) {
    if (field.show && !field.show(values)) continue;
    container.append(makeField(field, values));
  }

  if (type.extra === 'geo') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pf-btn pf-btn--ghost qr-geo-btn';
    button.id = 'geoBtn';
    button.innerHTML = ICONS.location || '';
    const label = document.createElement('span');
    label.textContent = t('useLocation');
    button.append(label);
    button.addEventListener('click', usePosition);
    container.append(button);
  }
}

function selectType(id, nextValues) {
  if (!TYPES.some((type) => type.id === id)) return;
  state.typeValues[state.type] = readFormValues();
  state.type = id;
  if (nextValues) state.typeValues[id] = nextValues;
  renderTypeChips();
  renderFields();
  updatePreview();
}

function usePosition() {
  if (!navigator.geolocation) {
    toast(t('locationUnsupported'));
    return;
  }
  const button = $('#geoBtn');
  if (button) button.disabled = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const values = readFormValues();
      values.lat = position.coords.latitude.toFixed(6);
      values.lng = position.coords.longitude.toFixed(6);
      state.typeValues[state.type] = values;
      renderFields();
      updatePreview();
      toast(t('locationSet'));
    },
    (error) => {
      if (button) button.disabled = false;
      toast(t(error && error.code === 1 ? 'locationDenied' : 'locationUnsupported'));
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
  );
}

/* -------------------------------------------------------------------------- */
/* Preview + export                                                           */
/* -------------------------------------------------------------------------- */

function setActionsEnabled(enabled) {
  for (const id of ['saveBtn', 'pngBtn', 'svgBtn', 'copyBtn', 'shareBtn']) {
    const button = document.getElementById(id);
    if (button) button.disabled = !enabled;
  }
}

function schedulePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 140);
}

function updatePreview() {
  const stage = $('#previewStage');
  const canvas = $('#qrCanvas');
  const empty = $('#previewEmpty');
  const errorBox = $('#previewError');
  const byteBadge = $('#byteBadge');
  const matrixBadge = $('#matrixBadge');
  const previewLabel = $('#previewLabel');
  const openBtn = $('#openBtn');
  if (!stage || !canvas) return;

  const values = readFormValues();
  state.values = values;
  state.typeValues[state.type] = values;
  const data = buildPayload(state.type, values);
  state.data = data;

  stage.classList.toggle('is-transparent', Boolean(state.settings.transparent));

  if (!data) {
    state.matrix = null;
    stage.classList.remove('has-code');
    if (empty) empty.hidden = false;
    if (errorBox) errorBox.hidden = true;
    if (byteBadge) byteBadge.hidden = true;
    if (matrixBadge) matrixBadge.hidden = true;
    if (previewLabel) previewLabel.textContent = '';
    if (openBtn) openBtn.hidden = true;
    setActionsEnabled(false);
    canvas.setAttribute('aria-label', t('previewAlt'));
    return;
  }

  try {
    const matrix = buildMatrix(data, state.settings.ec);
    state.matrix = matrix;
    drawCanvas(canvas, matrix, {
      size: 720,
      style: state.settings.moduleStyle,
      fg: state.settings.fg,
      bg: state.settings.bg,
      transparent: state.settings.transparent
    });

    stage.classList.add('has-code');
    if (empty) empty.hidden = true;
    if (errorBox) errorBox.hidden = true;
    setActionsEnabled(true);

    const bytes = new TextEncoder().encode(data).length;
    if (byteBadge) {
      byteBadge.textContent = formatBytes(bytes);
      byteBadge.hidden = false;
    }
    if (matrixBadge) {
      const version = matrixVersion(matrix.count);
      matrixBadge.textContent = `v${version || '?'} · ${matrix.count}×${matrix.count}`;
      matrixBadge.hidden = false;
    }
    if (previewLabel) previewLabel.textContent = payloadLabel(state.type, data);
    canvas.setAttribute('aria-label', `${t('previewAlt')}: ${truncate(data, 80)}`);

    const openType = OPEN_TYPES[state.type];
    const canOpen = Boolean(openType && isSafeToOpen(openType, data));
    if (openBtn) {
      openBtn.hidden = !canOpen;
      if (canOpen) {
        openBtn.href = data;
        if (openType === 'url') {
          openBtn.target = '_blank';
          openBtn.rel = 'noopener';
        } else {
          openBtn.removeAttribute('target');
        }
      }
    }
  } catch (error) {
    state.matrix = null;
    stage.classList.remove('has-code');
    if (empty) empty.hidden = false;
    if (errorBox) {
      errorBox.textContent = t(error && error.code === 'CAPACITY' ? 'errorTooLong' : 'errorGeneric');
      errorBox.hidden = false;
    }
    if (byteBadge) byteBadge.hidden = true;
    if (matrixBadge) matrixBadge.hidden = true;
    if (previewLabel) previewLabel.textContent = '';
    if (openBtn) openBtn.hidden = true;
    setActionsEnabled(false);
  }
}

function exportCanvas() {
  const canvas = document.createElement('canvas');
  drawCanvas(canvas, state.matrix, {
    size: state.settings.size,
    style: state.settings.moduleStyle,
    fg: state.settings.fg,
    bg: state.settings.bg,
    transparent: state.settings.transparent
  });
  return canvas;
}

async function downloadPng(data = state.data, matrix = state.matrix) {
  if (!matrix || !data) return;
  try {
    const canvas = document.createElement('canvas');
    drawCanvas(canvas, matrix, {
      size: state.settings.size,
      style: state.settings.moduleStyle,
      fg: state.settings.fg,
      bg: state.settings.bg,
      transparent: state.settings.transparent
    });
    const blob = await canvasToBlob(canvas);
    downloadBlob(blob, fileNameForData(data, state.settings.size, 'png'));
    toast(t('exported'));
  } catch {
    toast(t('errorGeneric'));
  }
}

function downloadSvg() {
  if (!state.matrix || !state.data) return;
  const svg = svgString(state.matrix, {
    size: state.settings.size,
    style: state.settings.moduleStyle,
    fg: state.settings.fg,
    bg: state.settings.bg,
    transparent: state.settings.transparent
  });
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, fileNameForData(state.data, state.settings.size, 'svg'));
  toast(t('exported'));
}

async function copyImage() {
  if (!state.matrix) return;
  try {
    if (!navigator.clipboard || typeof navigator.clipboard.write !== 'function' || typeof ClipboardItem !== 'function') {
      throw new Error('unsupported');
    }
    const blob = await canvasToBlob(exportCanvas());
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast(t('copied'));
  } catch {
    toast(t('copyFailed'));
  }
}

async function shareQr() {
  if (!state.matrix) return;
  try {
    const blob = await canvasToBlob(exportCanvas());
    const filename = fileNameForData(state.data, state.settings.size, 'png');
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      await navigator.share({ files: [file], title: 'QR Studio' });
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: 'QR Studio', text: truncate(state.data, 120), url: location.href });
      return;
    }
    toast(t('shareUnavailable'));
  } catch (error) {
    if (error && error.name === 'AbortError') return;
    toast(t('shareUnavailable'));
  }
}

function saveCurrent() {
  if (!state.matrix || !state.data) return;
  const result = addHistoryItem({
    type: state.type,
    label: payloadLabel(state.type, state.data),
    data: state.data,
    values: state.values
  });
  state.history = result.items;
  renderHistory();
  toast(t('saved'));
}

/* -------------------------------------------------------------------------- */
/* Style controls                                                             */
/* -------------------------------------------------------------------------- */

function syncSettingsUi() {
  const settings = state.settings;
  $$('#ecControl [data-ec]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.ec === settings.ec));
    button.setAttribute('aria-label', t('ec' + button.dataset.ec));
  });
  $$('#styleControl [data-style]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.style === settings.moduleStyle));
  });
  const fg = $('#fgColor');
  const bg = $('#bgColor');
  const transparent = $('#transparentToggle');
  const size = $('#sizeSelect');
  if (fg) fg.value = settings.fg;
  if (bg) bg.value = settings.bg;
  if (transparent) transparent.checked = settings.transparent;
  if (size) size.value = String(settings.size);
}

function persistSettings() {
  saveSettings(state.settings);
}

function bindStyleControls() {
  const ec = $('#ecControl');
  if (ec) {
    ec.addEventListener('click', (event) => {
      const button = event.target.closest('[data-ec]');
      if (!button) return;
      state.settings.ec = button.dataset.ec;
      persistSettings();
      syncSettingsUi();
      updatePreview();
    });
  }

  const style = $('#styleControl');
  if (style) {
    style.addEventListener('click', (event) => {
      const button = event.target.closest('[data-style]');
      if (!button) return;
      state.settings.moduleStyle = button.dataset.style;
      persistSettings();
      syncSettingsUi();
      updatePreview();
    });
  }

  for (const [id, key] of [
    ['fgColor', 'fg'],
    ['bgColor', 'bg']
  ]) {
    const input = document.getElementById(id);
    if (!input) continue;
    input.addEventListener('input', () => {
      state.settings[key] = input.value;
      persistSettings();
      updatePreview();
    });
  }

  const transparent = $('#transparentToggle');
  if (transparent) {
    transparent.addEventListener('change', () => {
      state.settings.transparent = transparent.checked;
      persistSettings();
      updatePreview();
    });
  }

  const size = $('#sizeSelect');
  if (size) {
    size.addEventListener('change', () => {
      const value = Number(size.value);
      state.settings.size = [512, 1024, 2048].includes(value) ? value : 1024;
      persistSettings();
    });
  }

  const reset = $('#resetStyle');
  if (reset) {
    reset.addEventListener('click', () => {
      state.settings = { ...DEFAULT_SETTINGS };
      persistSettings();
      syncSettingsUi();
      updatePreview();
      toast(t('resetDone'));
    });
  }

  const presets = $('#colorPresets');
  if (presets) {
    presets.innerHTML = '';
    COLOR_PRESETS.forEach((preset, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'qr-preset';
      button.dataset.fg = preset.fg;
      button.dataset.bg = preset.bg;
      button.setAttribute('aria-label', t('presetName', { n: index + 1 }));
      button.innerHTML =
        `<span class="qr-preset__fg" style="background:${preset.fg}"></span>` +
        `<span class="qr-preset__bg" style="background:${preset.bg}"></span>`;
      button.addEventListener('click', () => {
        state.settings.fg = preset.fg;
        state.settings.bg = preset.bg;
        state.settings.transparent = false;
        persistSettings();
        syncSettingsUi();
        updatePreview();
      });
      presets.append(button);
    });
  }
}

/* -------------------------------------------------------------------------- */
/* History                                                                    */
/* -------------------------------------------------------------------------- */

function valuesForHistory(item) {
  const detected = FORM_TO_DETECTED[item.type] || item.type;
  const formType = DETECTED_TO_FORM[detected] || 'text';
  const type = typeDefinition(formType);
  const fieldNames = new Set(type.fields.map((field) => field.name));
  const savedKeys = item.values && typeof item.values === 'object' ? Object.keys(item.values) : [];
  const useSaved = savedKeys.some((key) => fieldNames.has(key));
  const values = useSaved ? { ...item.values } : valuesFromPayload(detected, item.data);
  return { type: formType, values };
}

function reuseHistoryItem(item) {
  const mapped = valuesForHistory(item);
  selectType(mapped.type, mapped.values);
  switchTab('create');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHistory() {
  const list = $('#historyList');
  const empty = $('#historyEmpty');
  const clear = $('#clearHistoryBtn');
  const count = $('#historyCount');
  if (!list) return;

  const total = state.history.length;
  if (count) {
    count.textContent = total > 99 ? '99+' : String(total);
    count.hidden = total === 0;
  }
  if (clear) clear.hidden = total === 0;
  if (empty) empty.hidden = total > 0;
  list.innerHTML = '';

  for (const item of state.history) {
    const article = document.createElement('article');
    article.className = 'qr-history__item';

    const top = document.createElement('div');
    top.className = 'qr-history__top';
    const badge = document.createElement('span');
    badge.className = 'pf-badge pf-badge--accent';
    badge.textContent = typeName(FORM_TO_DETECTED[item.type] || item.type);
    const time = document.createElement('time');
    time.className = 'qr-history__time';
    time.dateTime = new Date(item.createdAt).toISOString();
    time.textContent = formatDateTime(item.createdAt);
    top.append(badge, time);

    const label = document.createElement('p');
    label.className = 'qr-history__label';
    label.textContent = item.label || truncate(item.data, 48);
    const data = document.createElement('code');
    data.className = 'qr-history__data';
    data.textContent = truncate(item.data, 180);

    const actions = document.createElement('div');
    actions.className = 'qr-history__actions';

    const reuse = document.createElement('button');
    reuse.type = 'button';
    reuse.className = 'pf-btn pf-btn--sm';
    reuse.textContent = t('reuse');
    reuse.addEventListener('click', () => reuseHistoryItem(item));

    const png = document.createElement('button');
    png.type = 'button';
    png.className = 'pf-btn pf-btn--sm';
    png.textContent = t('download');
    png.addEventListener('click', () => {
      const matrix = matrixFor(item.data);
      if (!matrix) {
        toast(t('errorGeneric'));
        return;
      }
      downloadPng(item.data, matrix);
    });

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'pf-btn pf-btn--sm pf-btn--ghost';
    copy.textContent = t('copyResult');
    copy.addEventListener('click', async () => {
      const ok = await copyText(item.data);
      toast(ok ? t('copied') : t('copyFailed'));
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'pf-btn pf-btn--sm pf-btn--danger';
    remove.textContent = t('delete');
    remove.addEventListener('click', async () => {
      const ok = await confirmDialog({
        title: t('confirmDeleteTitle'),
        message: t('confirmDeleteText'),
        confirmText: t('confirmDelete'),
        cancelText: t('cancel')
      });
      if (!ok) return;
      state.history = removeHistoryItem(item.id);
      renderHistory();
      toast(t('deleted'));
    });

    actions.append(reuse, png, copy, remove);
    article.append(top, label, data, actions);
    list.append(article);
  }
}

function bindHistory() {
  const clear = $('#clearHistoryBtn');
  if (!clear) return;
  clear.addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: t('confirmClearTitle'),
      message: t('confirmClearText'),
      confirmText: t('confirmClear'),
      cancelText: t('cancel')
    });
    if (!ok) return;
    state.history = clearHistory();
    renderHistory();
    toast(t('historyCleared'));
  });
}

/* -------------------------------------------------------------------------- */
/* Scanner                                                                    */
/* -------------------------------------------------------------------------- */

function setScanStatus(status, message) {
  state.scanStatus = status;
  state.scanStatusMessage = message || '';
  const badge = $('#scanStatusBadge');
  const start = $('#scanStart');
  const stop = $('#scanStop');
  const placeholder = $('#scanPlaceholder');
  const video = $('#scanVideo');
  const stage = $('#scannerStage');

  if (badge) {
    badge.dataset.state = status;
    badge.textContent =
      state.scanStatusMessage ||
      t(
        status === 'running'
          ? 'scanRunning'
          : status === 'starting'
            ? 'scanStarting'
            : status === 'error'
              ? 'scanError'
              : 'scanIdle'
      );
  }
  if (start) start.hidden = status === 'running' || status === 'starting';
  if (stop) stop.hidden = !(status === 'running' || status === 'starting');
  if (placeholder) placeholder.hidden = status === 'running';
  if (video) video.classList.toggle('is-live', status === 'running');
  if (stage) stage.classList.toggle('is-live', status === 'running');
}

function scanErrorKey(error) {
  switch (error && error.code) {
    case 'DENIED':
      return 'cameraDenied';
    case 'NOT_FOUND':
      return 'cameraNotFound';
    case 'BUSY':
      return 'cameraBusy';
    case 'INSECURE':
      return 'cameraInsecure';
    case 'UNSUPPORTED':
      return 'cameraUnsupported';
    default:
      return 'cameraError';
  }
}

function ensureScanner() {
  if (state.scanner) return state.scanner;
  const video = $('#scanVideo');
  const canvas = $('#scanCanvas');
  if (!video || !canvas) return null;
  state.scanner = new QrScanner({
    video,
    canvas,
    onResult: (result) => handleScanResult(result),
    onStatus: (status) => {
      state.scanning = status === 'running';
      if (status === 'idle' && state.scanStatus === 'running') setScanStatus('idle');
    }
  });
  return state.scanner;
}

function configureScannerExtras(capabilities) {
  const extra = $('#scanExtra');
  const cameraWrap = $('#cameraWrap');
  const cameraSelect = $('#cameraSelect');
  const zoomWrap = $('#zoomWrap');
  const zoomRange = $('#zoomRange');
  const torch = $('#scanTorch');
  let hasExtra = false;

  if (torch) {
    torch.hidden = !capabilities.torch;
    torch.setAttribute('aria-pressed', 'false');
    torch.classList.remove('is-on');
  }

  const scanner = state.scanner;
  scanner.listCameras().then((cameras) => {
    if (cameraSelect && cameras.length > 1) {
      cameraSelect.innerHTML = '';
      for (const camera of cameras) {
        const option = document.createElement('option');
        option.value = camera.id;
        option.textContent = camera.label;
        cameraSelect.append(option);
      }
      if (capabilities.deviceId) cameraSelect.value = capabilities.deviceId;
      if (cameraWrap) cameraWrap.hidden = false;
      hasExtra = true;
    } else if (cameraWrap) {
      cameraWrap.hidden = true;
    }
    if (extra) extra.hidden = !hasExtra && !capabilities.zoom;
  });

  if (capabilities.zoom && zoomRange && zoomWrap) {
    zoomRange.min = String(capabilities.zoom.min);
    zoomRange.max = String(capabilities.zoom.max);
    zoomRange.step = String(capabilities.zoom.step || 0.1);
    zoomRange.value = String(capabilities.zoom.min);
    zoomWrap.hidden = false;
    if (extra) extra.hidden = false;
  } else if (zoomWrap) {
    zoomWrap.hidden = true;
  }
}

async function startScan(deviceId) {
  const scanner = ensureScanner();
  if (!scanner) return;
  setScanStatus('starting');
  const result = $('#scanResult');
  if (result) result.hidden = true;
  try {
    const capabilities = await scanner.start(deviceId || state.scanDeviceId || undefined);
    // La decodifica può avvenire durante `start()`: in quel caso lo scanner
    // è già stato fermato e non bisogna riportare la UI in "running".
    if (!scanner.running) return;
    state.scanDeviceId = capabilities.deviceId || deviceId || '';
    setScanStatus('running');
    configureScannerExtras(capabilities);
  } catch (error) {
    setScanStatus('error');
    toast(t(scanErrorKey(error)));
  }
}

function stopScan() {
  if (state.scanner) state.scanner.stop();
  state.scanning = false;
  setScanStatus('idle');
}

function styleScanResult(type) {
  const badge = $('#resultType');
  const open = $('#resultOpen');
  if (badge) {
    badge.textContent = typeName(type);
    badge.className = 'pf-badge';
  }
  if (open && state.scanResult) {
    const safe = isSafeToOpen(type, state.scanResult.data);
    open.hidden = !safe;
    if (safe) {
      badge.classList.add('pf-badge--ok');
      open.href = state.scanResult.data;
      if (type === 'url') {
        open.target = '_blank';
        open.rel = 'noopener';
      } else {
        open.removeAttribute('target');
      }
    } else {
      open.removeAttribute('href');
    }
  }
}

function handleScanResult(result) {
  const data = result && result.data ? result.data : '';
  if (!data) return;
  if (state.scanner) state.scanner.stop();
  setScanStatus('idle');
  state.scanning = false;

  const detected = detectPayloadType(data);
  state.scanResult = { data, detected, label: payloadLabel(detected, data) };

  const card = $('#scanResult');
  const label = $('#resultLabel');
  const content = $('#resultData');
  if (label) label.textContent = state.scanResult.label;
  if (content) content.textContent = data;
  styleScanResult(detected);
  if (card) card.hidden = false;

  const saved = addHistoryItem({
    type: detected,
    label: state.scanResult.label,
    data,
    values: {}
  });
  state.history = saved.items;
  renderHistory();
  toast(t('scanSuccess'));
}

async function analyzeFile(file) {
  if (!file) return;
  if (!/^image\//.test(file.type || '')) {
    toast(t('scanImageError'));
    return;
  }
  if (state.scanner && state.scanner.running) state.scanner.stop();
  setScanStatus('starting', t('scanAnalyzing'));
  try {
    const data = await scanImageFile(file);
    if (!data) {
      setScanStatus('idle');
      toast(t('scanNoCode'));
      return;
    }
    handleScanResult({ data });
  } catch {
    setScanStatus('idle');
    toast(t('scanDecodeError'));
  } finally {
    const input = $('#scanFile');
    if (input) input.value = '';
  }
}

function bindScannerControls() {
  const start = $('#scanStart');
  const stop = $('#scanStop');
  const torch = $('#scanTorch');
  const upload = $('#scanUpload');
  const fileInput = $('#scanFile');
  const cameraSelect = $('#cameraSelect');
  const zoomRange = $('#zoomRange');
  const stage = $('#scannerStage');

  if (start) start.addEventListener('click', () => startScan());
  if (stop) stop.addEventListener('click', stopScan);
  if (upload && fileInput) upload.addEventListener('click', () => fileInput.click());
  if (fileInput) fileInput.addEventListener('change', () => analyzeFile(fileInput.files && fileInput.files[0]));

  if (torch) {
    torch.addEventListener('click', async () => {
      if (!state.scanner) return;
      const next = torch.getAttribute('aria-pressed') !== 'true';
      const ok = await state.scanner.setTorch(next);
      if (!ok) {
        toast(t('cameraError'));
        return;
      }
      torch.setAttribute('aria-pressed', String(next));
      torch.classList.toggle('is-on', next);
    });
  }

  if (cameraSelect) {
    cameraSelect.addEventListener('change', () => {
      state.scanDeviceId = cameraSelect.value;
      startScan(cameraSelect.value);
    });
  }

  if (zoomRange) {
    zoomRange.addEventListener('input', () => {
      if (state.scanner) state.scanner.setZoom(Number(zoomRange.value));
    });
  }

  if (stage) {
    const stopEvent = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    stage.addEventListener('dragover', (event) => {
      stopEvent(event);
      stage.classList.add('is-drag');
    });
    stage.addEventListener('dragleave', (event) => {
      stopEvent(event);
      stage.classList.remove('is-drag');
    });
    stage.addEventListener('drop', (event) => {
      stopEvent(event);
      stage.classList.remove('is-drag');
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      analyzeFile(file);
    });
  }

  const copy = $('#resultCopy');
  if (copy) {
    copy.addEventListener('click', async () => {
      if (!state.scanResult) return;
      const ok = await copyText(state.scanResult.data);
      toast(ok ? t('copied') : t('copyFailed'));
    });
  }

  const open = $('#resultOpen');
  if (open) {
    open.addEventListener('click', (event) => {
      if (!state.scanResult || !isSafeToOpen(state.scanResult.detected, state.scanResult.data)) {
        event.preventDefault();
        toast(t('notOpenable'));
      }
    });
  }

  const reuse = $('#resultReuse');
  if (reuse) {
    reuse.addEventListener('click', () => {
      if (!state.scanResult) return;
      const formType = DETECTED_TO_FORM[state.scanResult.detected] || 'text';
      const values = valuesFromPayload(state.scanResult.detected, state.scanResult.data);
      selectType(formType, values);
      switchTab('create');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const again = $('#resultAgain');
  if (again) {
    again.addEventListener('click', () => {
      const card = $('#scanResult');
      if (card) card.hidden = true;
      startScan(state.scanDeviceId);
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.scanning) stopScan();
  });
}

/* -------------------------------------------------------------------------- */
/* Tabs                                                                       */
/* -------------------------------------------------------------------------- */

function switchTab(tab, options = {}) {
  const valid = ['create', 'scan', 'history'].includes(tab) ? tab : 'create';
  if (state.tab === 'scan' && valid !== 'scan') stopScan();
  state.tab = valid;

  for (const button of $$('#qrTabs [data-tab]')) {
    const active = button.dataset.tab === valid;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  }
  for (const panel of $$('[data-panel]')) {
    panel.hidden = panel.dataset.panel !== valid;
  }
  if (valid === 'history') renderHistory();
  if (!options.silent) {
    const target = '#' + valid;
    if (location.hash !== target) history.replaceState(null, '', target);
  }
}

function bindTabs() {
  const tabs = $$('#qrTabs [data-tab]');
  for (const button of tabs) {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const index = tabs.indexOf(button);
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const next = tabs[(index + delta + tabs.length) % tabs.length];
      next.focus();
      switchTab(next.dataset.tab);
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Init                                                                       */
/* -------------------------------------------------------------------------- */

function bindForm() {
  const form = $('#qrForm');
  if (!form) return;
  const onChange = (event) => {
    const target = event.target;
    if (!target || !target.name) return;
    state.values = readFormValues();
    state.typeValues[state.type] = state.values;
    if (target.dataset && target.dataset.refresh) {
      const focusName = target.name;
      renderFields();
      const next = document.getElementById('field-' + focusName);
      if (next) next.focus();
    }
    schedulePreview();
  };
  form.addEventListener('input', onChange);
  form.addEventListener('change', onChange);
}

function bindActions() {
  const bind = (id, handler) => {
    const button = document.getElementById(id);
    if (button) button.addEventListener('click', handler);
  };
  bind('saveBtn', saveCurrent);
  bind('pngBtn', () => downloadPng());
  bind('svgBtn', downloadSvg);
  bind('copyBtn', copyImage);
  bind('shareBtn', shareQr);
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline opzionale */
    });
  });
}

function updateStaticLanguage() {
  applyStatic(document);
  const currentValues = readFormValues();
  state.typeValues[state.type] = currentValues;
  renderTypeChips();
  renderFields();
  syncSettingsUi();
  renderHistory();
  updatePreview();
  if (state.scanResult) styleScanResult(state.scanResult.detected);
  if (state.scanStatus !== 'idle' || state.scanStatusMessage) {
    setScanStatus(state.scanStatus, state.scanStatusMessage);
  }
}

function init() {
  const initialLang =
    (window.ProjectShell && window.ProjectShell.getLang && window.ProjectShell.getLang()) ||
    window.__PROJECT_LANG__ ||
    document.documentElement.lang ||
    'en';
  initLang(initialLang);
  applyStatic(document);

  state.settings = loadSettings();
  state.history = loadHistory();

  renderTypeChips();
  renderFields();
  syncSettingsUi();
  bindStyleControls();
  bindForm();
  bindTabs();
  bindHistory();
  bindActions();
  bindScannerControls();
  renderHistory();
  setScanStatus('idle');

  const initialTab = ['create', 'scan', 'history'].includes(location.hash.slice(1))
    ? location.hash.slice(1)
    : 'create';
  switchTab(initialTab, { silent: true });
  updatePreview();

  window.addEventListener('project:langchange', (event) => {
    setLang(event && event.detail ? event.detail.lang : getLang());
    updateStaticLanguage();
  });

  window.addEventListener('hashchange', () => {
    const tab = location.hash.slice(1);
    if (['create', 'scan', 'history'].includes(tab)) switchTab(tab, { silent: true });
  });

  window.addEventListener('beforeunload', () => {
    if (state.scanner) state.scanner.stop();
  });

  registerServiceWorker();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
