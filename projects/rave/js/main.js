/**
 * main.js — RAVE: orchestrazione camera, shader, UI, galleria e comandi.
 */

import { STYLES, GROUPS, findStyle, styleLabel } from './styles.js';
import { SHADERS } from '../shaders.js';
import { ShaderEngine } from './shader-engine.js';
import { CameraController } from './camera.js';
import { VideoRecorder } from './recorder.js';
import { createVoiceController } from './voice.js';
import { loadSettings, saveSettings } from './settings.js';
import { loadGallery, addSnapshot, removeSnapshot, clearGallery, downloadDataUrl } from './gallery.js';
import { initLang, getLang, setLang, t, applyStatic, onLanguageChange } from './i18n.js';

const $ = (id) => document.getElementById(id);
const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (character) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

const state = {
  settings: loadSettings(),
  engine: null,
  camera: null,
  recorder: null,
  voice: null,
  running: false,
  frames: 0,
  fpsAt: 0,
  fps: 0,
  toastTimer: null
};

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('on');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => el.classList.remove('on'), 2400);
}

function persist(patch) { state.settings = saveSettings(patch); }

function setStatus(id, text, kind = '') {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'pill ' + kind;
}

function buildStyleRail() {
  const rail = $('styleRail');
  rail.innerHTML = '';
  GROUPS.forEach((group) => {
    const styles = STYLES.filter((style) => style.group === group.id);
    if (!styles.length) return;
    const heading = document.createElement('div');
    heading.className = 'rail-heading';
    heading.dataset.i18n = 'style.' + group.id;
    heading.textContent = t('style.' + group.id);
    rail.appendChild(heading);
    const row = document.createElement('div');
    row.className = 'rail-row';
    styles.forEach((style) => {
      const button = document.createElement('button');
      button.className = 'style-card' + (style.id === state.settings.style ? ' on' : '');
      button.dataset.style = style.id;
      button.title = getLang() === 'en' ? style.nameEn : style.name;
      button.innerHTML = `<span class="swatch" style="background:${style.gradient}">${style.icon}</span>
        <span class="style-name">${esc(getLang() === 'en' ? style.nameEn : style.name)}</span>`;
      button.addEventListener('click', () => selectStyle(style.id));
      row.appendChild(button);
    });
    rail.appendChild(row);
  });
}

function selectStyle(id) {
  const style = findStyle(id);
  if (!SHADERS[style.id]) return;
  persist({ style: style.id });
  state.engine.setStyle(style.id, true);
  document.querySelectorAll('.style-card').forEach((button) => button.classList.toggle('on', button.dataset.style === style.id));
  setStatus('stylePill', style.icon + ' ' + (getLang() === 'en' ? style.nameEn : style.name), 'accent');
  toast(t('msg.style', { name: getLang() === 'en' ? style.nameEn : style.name }));
}

function renderGallery() {
  const list = $('galleryList');
  const items = loadGallery();
  list.innerHTML = '';
  $('galleryEmpty').classList.toggle('hidden', items.length > 0);
  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'shot';
    const image = document.createElement('img');
    image.src = item.dataUrl;
    image.alt = styleLabel(item.style);
    const actions = document.createElement('div');
    actions.className = 'shot-actions';
    const download = document.createElement('button');
    download.textContent = '↓';
    download.title = t('action.download');
    download.addEventListener('click', () => downloadDataUrl(item.dataUrl, `rave_${item.id}.jpg`));
    const remove = document.createElement('button');
    remove.textContent = '×';
    remove.title = t('action.delete');
    remove.addEventListener('click', () => { renderGalleryWith(removeSnapshot(item.id)); toast(t('action.delete')); });
    actions.append(download, remove);
    card.append(image, actions);
    list.appendChild(card);
  });
}
function renderGalleryWith(items) {
  const list = $('galleryList');
  list.innerHTML = '';
  $('galleryEmpty').classList.toggle('hidden', items.length > 0);
  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'shot';
    const image = document.createElement('img');
    image.src = item.dataUrl;
    const actions = document.createElement('div');
    actions.className = 'shot-actions';
    const download = document.createElement('button');
    download.textContent = '↓';
    download.addEventListener('click', () => downloadDataUrl(item.dataUrl, `rave_${item.id}.jpg`));
    const remove = document.createElement('button');
    remove.textContent = '×';
    remove.addEventListener('click', () => renderGalleryWith(removeSnapshot(item.id)));
    actions.append(download, remove);
    card.append(image, actions);
    list.appendChild(card);
  });
}

function capture() {
  if (!state.camera.isRunning) return;
  const source = $('glCanvas');
  const temp = document.createElement('canvas');
  temp.width = source.width; temp.height = source.height;
  const ctx = temp.getContext('2d');
  if (state.camera.isFront && state.settings.mirror) {
    ctx.translate(temp.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, 0, 0);
  const dataUrl = temp.toDataURL('image/jpeg', 0.9);
  const list = addSnapshot(dataUrl, state.settings.style);
  if (list.length >= 12) toast(t('msg.galleryFull'));
  else toast(t('msg.captured'));
  renderGalleryWith(list);
}

function toggleRecording() {
  if (state.recorder.recording) {
    state.recorder.stop();
    $('btnRecord').classList.remove('recording');
    toast(t('msg.recordStop'));
    return;
  }
  if (state.recorder.start($('glCanvas'))) {
    $('btnRecord').classList.add('recording');
    toast(t('msg.recordStart'));
  }
}

function toggleSplit() {
  const active = Number($('splitRange').value) < 0.99;
  const next = active ? 1 : 0.5;
  $('splitRange').value = String(next);
  $('splitRow').classList.toggle('on', !active);
  state.engine.setSplit(next);
  persist({ split: next });
}

function applyMirror() {
  const mirrored = state.camera.isFront && state.settings.mirror;
  $('video').classList.toggle('mirror', mirrored);
  $('glCanvas').classList.toggle('mirror', mirrored);
}

function handleCommand(command) {
  if (STYLES.some((style) => style.id === command)) { selectStyle(command); return; }
  const slider = $('intensity');
  if (command === 'more' || command === 'less') {
    const delta = command === 'more' ? 0.1 : -0.1;
    const value = Math.max(0, Math.min(1, Number(slider.value) + delta));
    slider.value = String(value);
    slider.dispatchEvent(new Event('input'));
  } else if (command === 'capture') capture();
  else if (command === 'record') toggleRecording();
  else if (command === 'front' && !state.camera.isFront) switchCamera();
  else if (command === 'back' && state.camera.isFront) switchCamera();
  else if (command === 'fullscreen') toggleFullscreen();
}

async function switchCamera() {
  $('loading').classList.remove('hidden');
  $('loading').textContent = t('msg.switching');
  try {
    await state.camera.switchCamera();
    applyMirror();
    toast(t(state.camera.isFront ? 'msg.front' : 'msg.back'));
  } catch (error) {
    toast(t('msg.noCamera') + ': ' + error.message);
  }
  $('loading').classList.add('hidden');
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    toast(t('msg.fullscreenOn'));
  } else {
    document.exitFullscreen();
    toast(t('msg.fullscreenOff'));
  }
}

function bindEvents() {
  $('btnExit').addEventListener('click', () => { window.location.href = '../index.html#projects'; });
  $('btnFullscreen').addEventListener('click', toggleFullscreen);
  $('btnLang').addEventListener('click', () => setLang(getLang() === 'it' ? 'en' : 'it'));
  $('btnCamera').addEventListener('click', switchCamera);
  $('btnCapture').addEventListener('click', capture);
  $('btnRecord').addEventListener('click', toggleRecording);
  $('btnSplit').addEventListener('click', toggleSplit);
  $('btnGallery').addEventListener('click', () => $('gallerySheet').classList.toggle('on'));
  $('btnGalleryClose').addEventListener('click', () => $('gallerySheet').classList.remove('on'));
  $('btnGalleryClear').addEventListener('click', () => { renderGalleryWith(clearGallery()); toast(t('msg.galleryCleared')); });
  $('btnVoice').addEventListener('click', () => {
    if (!state.voice.supported) { toast(t('msg.noVoice')); return; }
    const active = state.voice.toggle();
    $('btnVoice').classList.toggle('on', active);
    toast(t(active ? 'msg.voiceOn' : 'msg.voiceOff'));
  });

  const slider = $('intensity');
  slider.value = String(state.settings.intensity);
  $('intensityVal').textContent = Math.round(state.settings.intensity * 100) + '%';
  slider.addEventListener('input', () => {
    const value = Number(slider.value);
    $('intensityVal').textContent = Math.round(value * 100) + '%';
    state.engine.setIntensity(value);
    persist({ intensity: value });
  });
  const split = $('splitRange');
  split.value = String(state.settings.split);
  $('splitRow').classList.toggle('on', state.settings.split < 0.99);
  split.addEventListener('input', () => {
    const value = Number(split.value);
    state.engine.setSplit(value);
    persist({ split: value });
  });

  document.addEventListener('keydown', (event) => {
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (event.code === 'Space') { event.preventDefault(); capture(); }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const index = STYLES.findIndex((style) => style.id === state.settings.style);
      const next = STYLES[(index + (event.key === 'ArrowRight' ? 1 : -1) + STYLES.length) % STYLES.length];
      selectStyle(next.id);
    }
    if (event.key.toLowerCase() === 'g') $('gallerySheet').classList.toggle('on');
  });
  let lastTap = 0;
  $('glCanvas').addEventListener('click', () => {
    const now = Date.now();
    if (now - lastTap < 300) switchCamera();
    lastTap = now;
  });
  onLanguageChange(() => {
    refreshTexts();
    if (state.voice) state.voice.setLanguage(getLang() === 'en' ? 'en-US' : 'it-IT');
  });
}

function refreshTexts() {
  applyStatic(document);
  $('btnLang').textContent = getLang() === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  buildStyleRail();
  document.querySelectorAll('.style-card').forEach((button) => button.classList.toggle('on', button.dataset.style === state.settings.style));
  setStatus('stylePill', findStyle(state.settings.style).icon + ' ' + styleLabel(state.settings.style, getLang() === 'en'), 'accent');
  renderGallery();
}

function loop(now) {
  if (!state.running) return;
  state.engine.render($('video'));
  state.frames += 1;
  if (now - state.fpsAt >= 1000) {
    state.fps = Math.round((state.frames * 1000) / (now - state.fpsAt));
    state.frames = 0; state.fpsAt = now;
    setStatus('fpsPill', state.fps + ' FPS', '');
  }
  requestAnimationFrame(loop);
}

async function init() {
  initLang();
  state.engine = new ShaderEngine($('glCanvas'));
  if (!state.engine.init()) {
    $('loading').textContent = t('msg.noWebgl');
    return;
  }
  state.camera = new CameraController($('video'));
  state.recorder = new VideoRecorder(() => { $('btnRecord').classList.remove('recording'); toast(t('msg.recordStop')); });
  state.voice = createVoiceController({
    language: getLang() === 'en' ? 'en-US' : 'it-IT',
    onCommand: handleCommand
  });
  state.engine.setIntensity(state.settings.intensity);
  state.engine.setSplit(state.settings.split);
  state.engine.setStyle(state.settings.style, false);
  buildEventsAndUI();
  try {
    $('loading').textContent = t('msg.starting');
    await state.camera.start('user');
    applyMirror();
    setStatus('cameraPill', '● ' + t('label.camera'), 'ok');
    setStatus('stylePill', findStyle(state.settings.style).icon + ' ' + styleLabel(state.settings.style, getLang() === 'en'), 'accent');
    $('loading').classList.add('hidden');
    state.running = true;
    state.fpsAt = performance.now();
    requestAnimationFrame(loop);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
    toast(t('msg.ready'));
  } catch (error) {
    $('loading').textContent = t('msg.noCamera') + ': ' + error.message;
  }
}

function buildEventsAndUI() {
  bindEvents();
  refreshTexts();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

window.__RAVE__ = { STYLES, selectStyle, capture, toggleSplit, get state() { return state; } };
