/** speech.js — parlato sintetico per i puppet. */

const LINES = [
  'Hello there!', 'Look at me!', 'Ta-da!', 'What a show!', 'Again, again!',
  'Ciao!', 'Bravissimo!', 'I am the star!', 'Did you see that?', 'Encore!'
];

export function isSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function createSpeech({ onStart = () => {}, onEnd = () => {} } = {}) {
  let enabled = false;

  function speak(text, character) {
    if (!enabled || !isSupported()) return false;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text || pickLine()));
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        const preferred = voices.find((voice) => voice.lang.startsWith('it')) || voices[0];
        utterance.voice = preferred;
      }
      utterance.rate = character.voice.rate || 1;
      utterance.pitch = character.voice.pitch || 1;
      utterance.volume = 0.9;
      utterance.onstart = onStart;
      utterance.onend = onEnd;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) { return false; }
  }

  function pickLine() { return LINES[Math.floor(Math.random() * LINES.length)]; }

  return {
    speak, pickLine,
    setEnabled(value) { enabled = !!value; if (!enabled && isSupported()) window.speechSynthesis.cancel(); },
    get enabled() { return enabled; }
  };
}
