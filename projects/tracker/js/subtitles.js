/* Riconoscimento vocale per i sottotitoli live */

import { getLang } from './i18n.js';

let recognition = null;
let active = false;
let transcript = '';
let onUpdate = null;
let onStatus = null;
let clearTimer = null;

export function isSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function status(key) {
  if (onStatus) onStatus(key);
}

export function start(updateCallback, statusCallback) {
  onUpdate = updateCallback || null;
  onStatus = statusCallback || null;
  if (!isSupported()) { status('status.subtitleError'); return false; }

  if (!recognition) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { active = true; status('status.subtitleListening'); };
    recognition.onresult = event => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          transcript = text;
          clearTimeout(clearTimer);
          clearTimer = setTimeout(() => { transcript = ''; if (onUpdate) onUpdate(''); }, 5000);
        } else {
          interim += text;
        }
      }
      if (onUpdate) onUpdate(interim || transcript);
    };
    recognition.onerror = event => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        active = false;
        status('status.subtitleError');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        status('status.subtitleError');
      }
    };
    recognition.onend = () => {
      if (active) {
        try { recognition.start(); } catch (e) { status('status.subtitleStopped'); }
      } else {
        status('status.subtitleStopped');
      }
    };
  }

  recognition.lang = getLang();
  try {
    recognition.start();
    active = true;
    status('status.subtitleStart');
    return true;
  } catch (e) {
    return true;
  }
}

export function stop() {
  active = false;
  transcript = '';
  clearTimeout(clearTimer);
  if (recognition) {
    try { recognition.stop(); } catch (e) { /* ignore */ }
  }
  if (onUpdate) onUpdate('');
  status('status.subtitleStopped');
}

export function setLanguage(lang) {
  const wasActive = active;
  if (recognition && wasActive) stop();
  if (wasActive) start(onUpdate, onStatus);
}
