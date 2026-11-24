/** i18n.js — IT/EN per Smile Detection. */

const KEY = 'smiledet.lang';
const IT = {
  'app.title': 'SMILE DETECTION',
  'app.tagline': 'Analisi del sorriso on-device',
  'status.camera': 'Camera',
  'status.landmarks': 'Volto tracciato',
  'status.modelLoading': 'Caricamento modello emozioni…',
  'status.modelReady': 'Modello pronto',
  'status.modelError': 'Modello non disponibile',
  'status.searching': 'Cerca un volto',
  'status.smiling': 'Sorridi!',
  'status.ambiguous': 'Esposizione incerta — inquadra meglio',
  'section.score': 'Punteggio sorriso',
  'section.confidence': 'Confidenza',
  'section.emotions': 'Emozioni',
  'section.teeth': 'Denti',
  'section.whiteness': 'Bianchezza',
  'section.alignment': 'Allineamento',
  'section.best': 'Record personale',
  'section.hint': 'Apri la bocca per misurare i denti.',
  'section.disclaimer': 'Stima giocosa, non una diagnosi dentistica.',
  'action.start': 'Avvia camera',
  'action.stop': 'Ferma camera',
  'action.snapshot': 'Scatta',
  'action.switch': 'Cambia camera',
  'action.lang': 'Lingua',
  'msg.saved': 'Snapshot salvato',
  'msg.noCamera': 'Camera non accessibile',
  'msg.noWebgl': 'Modello non supportato su questo browser',
  'msg.teethWait': 'Apri la bocca e guarda la luce',
  'emotion.happy': 'Felice', 'emotion.neutral': 'Neutrale', 'emotion.sad': 'Triste',
  'emotion.angry': 'Arrabbiato', 'emotion.surprise': 'Sorpreso', 'emotion.fear': 'Paura', 'emotion.disgust': 'Disgustato'
};
const EN = {
  'app.title': 'SMILE DETECTION',
  'app.tagline': 'On-device smile analysis',
  'status.camera': 'Camera',
  'status.landmarks': 'Face tracked',
  'status.modelLoading': 'Loading emotion model…',
  'status.modelReady': 'Model ready',
  'status.modelError': 'Model unavailable',
  'status.searching': 'Looking for a face',
  'status.smiling': 'Smile!',
  'status.ambiguous': 'Uncertain read — improve framing',
  'section.score': 'Smile score',
  'section.confidence': 'Confidence',
  'section.emotions': 'Emotions',
  'section.teeth': 'Teeth',
  'section.whiteness': 'Whiteness',
  'section.alignment': 'Alignment',
  'section.best': 'Personal best',
  'section.hint': 'Open your mouth to measure teeth.',
  'section.disclaimer': 'Playful estimate, not a dental diagnosis.',
  'action.start': 'Start camera',
  'action.stop': 'Stop camera',
  'action.snapshot': 'Snapshot',
  'action.switch': 'Switch camera',
  'action.lang': 'Language',
  'msg.saved': 'Snapshot saved',
  'msg.noCamera': 'Camera unavailable',
  'msg.noWebgl': 'Model not supported in this browser',
  'msg.teethWait': 'Open your mouth in good light',
  'emotion.happy': 'Happy', 'emotion.neutral': 'Neutral', 'emotion.sad': 'Sad',
  'emotion.angry': 'Angry', 'emotion.surprise': 'Surprise', 'emotion.fear': 'Fear', 'emotion.disgust': 'Disgust'
};
const DICTS = { it: IT, en: EN };
let current = 'it';
const listeners = [];
function supported(v) { return String(v || '').startsWith('en') ? 'en' : String(v || '').startsWith('it') ? 'it' : null; }
export function getLang() { return current; }
export function initLang() {
  let stored = null;
  try { stored = localStorage.getItem(KEY) || localStorage.getItem('site_lang') || localStorage.getItem('lang'); } catch (e) {}
  current = supported(stored) || (navigator.language && supported(navigator.language)) || 'it';
  document.documentElement.lang = current;
  return current;
}
export function setLang(value) {
  const next = supported(value);
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
}
export function onLanguageChange(fn) { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); }
