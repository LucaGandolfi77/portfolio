/** voice.js — sottotitoli live e comandi vocali. */

export function isSupported() {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/** Estrae comandi da un transcript (IT/EN). */
export function parseVoiceCommand(text) {
  const value = String(text || '').toLowerCase();
  if (/\b(scatta|foto|shot|capture|shoot)\b/.test(value)) return 'capture';
  if (/\b(registra|registrazione|record|video)\b/.test(value)) return 'record';
  if (/\b(ferma|stop|basta)\b/.test(value)) return 'stop';
  if (/\b(griglia|grid)\b/.test(value)) return 'grid';
  return null;
}

export function createVoice({ lang = 'it-IT', onTranscript = () => {}, onCommand = () => {}, onStatus = () => {} } = {}) {
  let recognition = null, listening = false, clearTimer = null, transcript = '';

  function stop() {
    listening = false;
    if (recognition) { try { recognition.stop(); } catch (e) {} }
    recognition = null;
    clearTimeout(clearTimer);
    onTranscript('');
  }

  function start(nextLang = lang) {
    if (!isSupported() || listening) return false;
    const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new Constructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = nextLang;
    recognition.onstart = () => { listening = true; onStatus('listening'); };
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          transcript = text;
          const command = parseVoiceCommand(text);
          if (command) onCommand(command);
          clearTimeout(clearTimer);
          clearTimer = setTimeout(() => { transcript = ''; onTranscript(''); }, 5000);
        } else interim += text;
      }
      onTranscript(interim || transcript);
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        listening = false;
        onStatus('error');
      }
    };
    recognition.onend = () => {
      if (!listening) return;
      try { recognition.start(); } catch (e) { listening = false; }
    };
    try { recognition.start(); return true; }
    catch (e) { recognition = null; return false; }
  }

  return {
    start, stop,
    toggle(nextLang) { return listening ? (stop(), false) : start(nextLang); },
    get listening() { return listening; }
  };
}
