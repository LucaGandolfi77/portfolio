/**
 * voice.js — parser comandi vocali IT/EN + wrapper SpeechRecognition.
 */

import { STYLES } from './styles.js';

const STYLE_ALIASES = {
  vangogh: ['van gogh', 'vangogh', 'vangoc'],
  picasso: ['picasso', 'picassa'],
  monet: ['monet', 'mone'],
  hokusai: ['hokusai', 'hokusay'],
  warhol: ['warhol', 'varol'],
  klimt: ['klimt', 'climt'],
  matisse: ['matisse', 'matis'],
  sketch: ['matita', 'schizzo', 'sketch', 'pencil'],
  cyber: ['cyber', 'cyberpunk', 'glitch'],
  watercolor: ['acquerello', 'watercolor'],
  none: ['originale', 'normale', 'none', 'original']
};

const ACTION_ALIASES = {
  more: ['più', 'piu', 'aumenta', 'more', 'increase', 'up'],
  less: ['meno', 'diminuisci', 'riduci', 'less', 'decrease', 'down'],
  capture: ['scatta', 'foto', 'snapshot', 'capture', 'shoot'],
  record: ['registra', 'registrazione', 'record', 'video'],
  front: ['anteriore', 'frontale', 'front', 'selfie'],
  back: ['posteriore', 'retro', 'back', 'rear'],
  fullscreen: ['schermo intero', 'fullscreen', 'pieno schermo', 'full screen']
};

/** Riconosce un comando nel testo trascritto; ritorna null se non trovato. */
export function parseVoiceCommand(text) {
  const value = String(text || '').toLowerCase().trim();
  if (!value) return null;
  for (const [id, aliases] of Object.entries(STYLE_ALIASES)) {
    if (aliases.some((alias) => value.includes(alias))) return id;
  }
  for (const [id, aliases] of Object.entries(ACTION_ALIASES)) {
    if (aliases.some((alias) => value.includes(alias))) return id;
  }
  return null;
}

export function isSupported() {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function createVoiceController({ language = 'it-IT', onCommand = () => {} } = {}) {
  let recognition = null;
  let listening = false;
  let currentLanguage = language;

  function stop() {
    listening = false;
    if (recognition) { try { recognition.stop(); } catch (e) {} }
    recognition = null;
  }

  function start() {
    if (!isSupported()) return false;
    stop();
    const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new Constructor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = currentLanguage;
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (!last || !last.isFinal) return;
      const command = parseVoiceCommand(last[0].transcript);
      if (command) onCommand(command, last[0].transcript);
    };
    recognition.onerror = () => { /* il restart automatico gestisce i cali */ };
    recognition.onend = () => {
      if (!listening || !recognition) return;
      try { recognition.start(); } catch (e) { listening = false; }
    };
    try { recognition.start(); listening = true; return true; }
    catch (e) { recognition = null; return false; }
  }

  return {
    start, stop,
    toggle() { return listening ? (stop(), false) : start(); },
    setLanguage(next) { currentLanguage = next; if (listening) { stop(); start(); } },
    get listening() { return listening; },
    get supported() { return isSupported(); }
  };
}

export function stylesFromCommands(commands) {
  return commands.filter((command) => STYLES.some((style) => style.id === command));
}
