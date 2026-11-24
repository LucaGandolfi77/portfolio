/**
 * i18n.js — dizionari IT/EN per Phonetic Transcriber.
 */

const KEY = 'phontrans.lang';

const IT = {
  'app.title': 'PHONETIC TRANSCRIBER',
  'app.subtitle': 'Suoni inventati → chiave fonetica · IPA · lingua simile',
  'status.idle': 'modello non caricato',
  'status.loading': 'caricamento modello…',
  'status.ready': 'modello pronto',
  'status.error': 'modello non disponibile',
  'tab.live': '🎙 Live',
  'tab.file': '📁 File audio',
  'tab.manual': '⌨️ Manuale offline',
  'tab.guess': '🌍 Lingue & storico',
  'section.capture': 'Registrazione',
  'section.analysis': 'Analisi',
  'section.spectrum': 'Spettro',
  'section.waveform': 'Waveform',
  'section.result': 'Risultato',
  'section.paddock': 'Pannello fonemico',
  'section.compare': 'Confronta chiavi',
  'section.history': 'Storico',
  'section.languages': 'Lingue simili',
  'section.settings': 'Impostazioni',
  'action.start': '● Avvia registrazione',
  'action.stop': '⏹ Stop',
  'action.transcribe': '🔥 Trascrivi',
  'action.analyze': '⚡ Analizza',
  'action.clear': 'Pulisci',
  'action.guess': '🤔 Indovina',
  'action.compare': '🔍 Confronta',
  'action.copy': 'Copia risultato',
  'action.copyAll': 'Copia tutto',
  'action.exportJSON': 'Export JSON',
  'action.exportPNG': 'Export PNG',
  'action.import': 'Import',
  'action.empty': 'Svuota',
  'label.heard': 'Sentito',
  'label.key': 'Chiave fonetica',
  'label.ipa': 'IPA',
  'label.engine': 'Motore',
  'label.language': 'Lingua simile',
  'label.voice': 'Voce IPA',
  'label.model': 'Modello ASR',
  'label.voiceHint': 'Seleziona la lingua del suono per l’IPA',
  'label.syllables': 'Sillabe',
  'label.vowels': 'Vocali',
  'label.consonants': 'Consonanti',
  'label.stress': 'Accenti',
  'label.phonemes': 'Fonemi',
  'label.similarity': 'Similarità',
  'label.distance': 'Distanza',
  'label.placeholderManual': 'es. ﬁkure, liskato, veltalaiter…',
  'label.placeholderCompare': 'Una chiave per riga (due o più)',
  'label.placeholderSearch': 'Cerca nello storico…',
  'hint.live': 'In attesa. Premi Avvia e parla (anche con suoni inventati).',
  'hint.file': 'Nessun file selezionato.',
  'hint.manual': 'Scrivi un suono e premi Analizza.',
  'hint.drop': 'Trascina qui un file audio',
  'hint.dropSub': 'oppure clicca per selezionarlo',
  'hint.historyEmpty': 'Nessuna trascrizione salvata.',
  'hint.compareEmpty': 'Inserisci due chiavi da confrontare.',
  'msg.loading': 'Caricamento modello Whisper…',
  'msg.decoding': 'Decodifica audio…',
  'msg.transcribing': 'Whisper trascrive…',
  'msg.done': 'Analisi completata ✓',
  'msg.vad': 'Silenzio rimosso: {ms} ms',
  'msg.trimDisabled': 'Audiotroppo breve per il VAD',
  'msg.copied': 'Copiato ✓',
  'msg.noFunds': '—',
  'msg.needVoice': 'Modello non disponibile → usa il tab Manuale',
  'msg.espeakReady': 'IPA eSpeak pronto',
  'msg.espeakFallback': 'eSpeak non disponibile: uso l’euristica',
  'footer.note': 'IPA euristico senza motore eSpeak: approssimazione dichiarata.'
};

const EN = {
  'app.title': 'PHONETIC TRANSCRIBER',
  'app.subtitle': 'Invented sounds → phonetic key · IPA · similar language',
  'status.idle': 'model not loaded',
  'status.loading': 'loading model…',
  'status.ready': 'model ready',
  'status.error': 'model unavailable',
  'tab.live': '🎙 Live',
  'tab.file': '📁 Audio file',
  'tab.manual': '⌨️ Offline manual',
  'tab.guess': '🌍 Languages & history',
  'section.capture': 'Capture',
  'section.analysis': 'Analysis',
  'section.spectrum': 'Spectrum',
  'section.waveform': 'Waveform',
  'section.result': 'Result',
  'section.paddock': 'Phoneme panel',
  'section.compare': 'Compare keys',
  'section.history': 'History',
  'section.languages': 'Similar languages',
  'section.settings': 'Settings',
  'action.start': '● Start recording',
  'action.stop': '⏹ Stop',
  'action.transcribe': '🔥 Transcribe',
  'action.analyze': '⚡ Analyze',
  'action.clear': 'Clear',
  'action.guess': '🤔 Guess',
  'action.compare': '🔍 Compare',
  'action.copy': 'Copy result',
  'action.copyAll': 'Copy all',
  'action.exportJSON': 'Export JSON',
  'action.exportPNG': 'Export PNG',
  'action.import': 'Import',
  'action.empty': 'Clear all',
  'label.heard': 'Heard',
  'label.key': 'Phonetic key',
  'label.ipa': 'IPA',
  'label.engine': 'Engine',
  'label.language': 'Similar language',
  'label.voice': 'IPA voice',
  'label.model': 'ASR model',
  'label.voiceHint': 'Pick the language of the sound for IPA',
  'label.syllables': 'Syllables',
  'label.vowels': 'Vowels',
  'label.consonants': 'Consonants',
  'label.stress': 'Stress marks',
  'label.phonemes': 'Phonemes',
  'label.similarity': 'Similarity',
  'label.distance': 'Distance',
  'label.placeholderManual': 'e.g. ﬁkure, liskato, veltalaiter…',
  'label.placeholderCompare': 'One key per line (two or more)',
  'label.placeholderSearch': 'Search history…',
  'hint.live': 'Ready. Press Start and speak (invented sounds included).',
  'hint.file': 'No file selected.',
  'hint.manual': 'Write a sound and press Analyze.',
  'hint.drop': 'Drop an audio file here',
  'hint.dropSub': 'or click to choose one',
  'hint.historyEmpty': 'No transcriptions saved yet.',
  'hint.compareEmpty': 'Enter two keys to compare.',
  'msg.loading': 'Loading Whisper model…',
  'msg.decoding': 'Decoding audio…',
  'msg.transcribing': 'Whisper is transcribing…',
  'msg.done': 'Analysis complete ✓',
  'msg.vad': 'Silence trimmed: {ms} ms',
  'msg.trimDisabled': 'Audio too short for VAD',
  'msg.copied': 'Copied ✓',
  'msg.noFunds': '—',
  'msg.needVoice': 'Model unavailable → use the Manual tab',
  'msg.espeakReady': 'eSpeak IPA ready',
  'msg.espeakFallback': 'eSpeak unavailable: using heuristics',
  'footer.note': 'Heuristic IPA without eSpeak: approximation disclosed.'
};

const DICTS = { it: IT, en: EN };
let current = 'it';
const listeners = [];

function supported(value) {
  const lang = String(value || '').toLowerCase();
  return lang.startsWith('it') ? 'it' : lang.startsWith('en') ? 'en' : null;
}
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
  try {
    localStorage.setItem(KEY, next);
    localStorage.setItem('site_lang', next);
    localStorage.setItem('lang', next);
  } catch (e) {}
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
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
}
export function onLanguageChange(fn) { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); }
