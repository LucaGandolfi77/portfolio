/**
 * i18n.js — IT/EN per RAVE.
 */

const KEY = 'rave.lang';

const IT = {
  'app.tagline': 'REALTIME ARTISTIC VISION ENGINE',
  'style.base': 'Base', 'style.classic': 'Classici', 'style.pop': 'Pop',
  'style.mono': 'Monocromo', 'style.digital': 'Digitale',
  'label.intensity': 'Intensità',
  'label.beforeAfter': 'Prima / Dopo',
  'label.gallery': 'Galleria',
  'label.camera': 'Camera',
  'label.fps': 'FPS',
  'label.style': 'Stile',
  'label.emptyGallery': 'Nessuno scatto salvato. Premi il pulsante shutter per catturare un frame.',
  'action.capture': 'Scatta',
  'action.record': 'Registra',
  'action.stopRecord': 'Ferma registrazione',
  'action.voice': 'Comandi vocali',
  'action.cameraSwitch': 'Cambia camera',
  'action.fullscreen': 'Schermo intero',
  'action.exit': 'Esci',
  'action.clear': 'Svuota galleria',
  'action.download': 'Scarica',
  'action.delete': 'Elimina',
  'msg.ready': 'Camera pronta',
  'msg.starting': 'Avvio camera…',
  'msg.switching': 'Cambio camera…',
  'msg.noWebgl': 'WebGL non supportato',
  'msg.noCamera': 'Camera non accessibile',
  'msg.noVoice': 'Comandi vocali non supportati',
  'msg.voiceOn': 'Comandi vocali attivi',
  'msg.voiceOff': 'Comandi vocali disattivati',
  'msg.captured': 'Scatto salvato',
  'msg.recordStart': 'Registrazione avviata',
  'msg.recordStop': 'Registrazione fermata',
  'msg.galleryFull': 'Galleria piena (12 scatti)',
  'msg.galleryCleared': 'Galleria svuotata',
  'msg.style': 'Stile: {name}',
  'msg.front': 'Camera frontale',
  'msg.back': 'Camera posteriore',
  'msg.fullscreenOn': 'Schermo intero',
  'msg.fullscreenOff': 'Uscita schermo intero'
};

const EN = {
  'app.tagline': 'REALTIME ARTISTIC VISION ENGINE',
  'style.base': 'Base', 'style.classic': 'Classics', 'style.pop': 'Pop',
  'style.mono': 'Monochrome', 'style.digital': 'Digital',
  'label.intensity': 'Intensity',
  'label.beforeAfter': 'Before / After',
  'label.gallery': 'Gallery',
  'label.camera': 'Camera',
  'label.fps': 'FPS',
  'label.style': 'Style',
  'label.emptyGallery': 'No snapshots yet. Press the shutter to capture a frame.',
  'action.capture': 'Capture',
  'action.record': 'Record',
  'action.stopRecord': 'Stop recording',
  'action.voice': 'Voice commands',
  'action.cameraSwitch': 'Switch camera',
  'action.fullscreen': 'Fullscreen',
  'action.exit': 'Exit',
  'action.clear': 'Clear gallery',
  'action.download': 'Download',
  'action.delete': 'Delete',
  'msg.ready': 'Camera ready',
  'msg.starting': 'Starting camera…',
  'msg.switching': 'Switching camera…',
  'msg.noWebgl': 'WebGL not supported',
  'msg.noCamera': 'Camera unavailable',
  'msg.noVoice': 'Voice commands not supported',
  'msg.voiceOn': 'Voice commands on',
  'msg.voiceOff': 'Voice commands off',
  'msg.captured': 'Snapshot saved',
  'msg.recordStart': 'Recording started',
  'msg.recordStop': 'Recording stopped',
  'msg.galleryFull': 'Gallery full (12 snapshots)',
  'msg.galleryCleared': 'Gallery cleared',
  'msg.style': 'Style: {name}',
  'msg.front': 'Front camera',
  'msg.back': 'Back camera',
  'msg.fullscreenOn': 'Fullscreen',
  'msg.fullscreenOff': 'Exited fullscreen'
};

const DICTS = { it: IT, en: EN };
let current = 'it';
const listeners = [];

function supported(value) { return String(value || '').startsWith('en') ? 'en' : String(value || '').startsWith('it') ? 'it' : null; }
export function getLang() { return current; }
export function initLang() {
  let stored = null;
  try { stored = localStorage.getItem(KEY) || localStorage.getItem('site_lang') || localStorage.getItem('lang'); } catch (e) {}
  current = supported(stored) || (navigator.language && supported(navigator.language)) || 'it';
  document.documentElement.lang = current;
  return current;
}
export function setLang(lang) {
  const next = supported(lang);
  if (!next) return current;
  current = next;
  try { localStorage.setItem(KEY, next); localStorage.setItem('site_lang', next); localStorage.setItem('lang', next); } catch (e) {}
  document.documentElement.lang = next;
  listeners.forEach((fn) => fn(next));
  return next;
}
export function t(key, vars) {
  let text = (DICTS[current] && DICTS[current][key]) || EN[key] || key;
  if (vars) Object.keys(vars).forEach((name) => { text = text.replace(new RegExp('\\{' + name + '\\}', 'g'), String(vars[name])); });
  return text;
}
export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); el.setAttribute('aria-label', el.title); });
}
export function onLanguageChange(fn) { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); }
