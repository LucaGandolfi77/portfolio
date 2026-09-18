/**
 * music.js — colonna sonora opzionale.
 *
 * NESSUN audio automatico: parte solo dopo un tap esplicito, come impongono le
 * regole di Safari iOS. Non essendoci file audio, la traccia è una piccola
 * "musica da carillon" sintetizzata in tempo reale con la Web Audio API:
 * nessun download, funziona offline, nessun problema di licenze.
 *
 * Per usare un tuo brano, sostituisci `scheduleLoop` con la riproduzione di un
 * <audio> (vedi README).
 */
import { qs } from '../utils/dom.js';

const NOTE = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, C6: 1046.5,
};

/**
 * Melodia in Do maggiore, saltellante: roba da osteria, non da carillon.
 * È una marcetta allegra che si ripete: tre note su, una giù, e si ricomincia.
 */
const MELODY = [
  { freq: NOTE.C5, at: 0.0, dur: 0.34 },
  { freq: NOTE.E5, at: 0.36, dur: 0.34 },
  { freq: NOTE.G5, at: 0.72, dur: 0.34 },
  { freq: NOTE.E5, at: 1.08, dur: 0.34 },
  { freq: NOTE.F5, at: 1.44, dur: 0.34 },
  { freq: NOTE.A5, at: 1.8, dur: 0.34 },
  { freq: NOTE.G5, at: 2.16, dur: 0.7 },
  { freq: NOTE.E5, at: 3.0, dur: 0.34 },
  { freq: NOTE.G5, at: 3.36, dur: 0.34 },
  { freq: NOTE.C6, at: 3.72, dur: 0.34 },
  { freq: NOTE.A5, at: 4.08, dur: 0.34 },
  { freq: NOTE.F5, at: 4.44, dur: 0.34 },
  { freq: NOTE.G5, at: 4.8, dur: 0.34 },
  { freq: NOTE.E5, at: 5.16, dur: 0.34 },
  { freq: NOTE.C5, at: 5.52, dur: 0.9 },
  { freq: NOTE.D5, at: 6.5, dur: 0.34 },
  { freq: NOTE.F5, at: 6.86, dur: 0.34 },
  { freq: NOTE.A5, at: 7.22, dur: 0.34 },
  { freq: NOTE.G5, at: 7.58, dur: 1.2 },
];

const LOOP_SECONDS = 9.0;

const ICON_MUSIC = '<path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />';
const ICON_PAUSE =
  '<rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />';

export function createMusic() {
  const button = qs('#music-btn');
  const icon = qs('#music-icon');
  const pulse = button?.querySelector('.iconbtn__pulse');
  const Ctor = window.AudioContext || window.webkitAudioContext;

  if (!button || !Ctor) {
    button?.setAttribute('hidden', '');
    return { isPlaying: () => false };
  }

  button.removeAttribute('hidden');

  let ctx = null;
  let master = null;
  let timer = 0;
  let playing = false;

  function build() {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0;

    // Un filtro morbido toglie ogni asprezza: suono "carillon lontano".
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1500;

    master.connect(filter);
    filter.connect(ctx.destination);
  }

  function pluck(freq, at, dur, volume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, at);

    // Attacco dolce + decadimento lungo: è la forma d'onda che rende "cozy".
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);

    osc.connect(gain);
    gain.connect(master);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }

  function pad(at, seconds) {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(0.035, at + 1.6);
    gain.gain.linearRampToValueAtTime(0.0001, at + seconds);

    [NOTE.C4, NOTE.G4 / 2, NOTE.E4 / 2].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = i * 6 - 6;
      osc.connect(gain);
      osc.start(at);
      osc.stop(at + seconds + 0.1);
    });

    gain.connect(master);
  }

  function scheduleLoop() {
    const start = ctx.currentTime + 0.08;
    MELODY.forEach((note, i) => {
      // Volume leggermente alternato: la melodia "respira".
      pluck(note.freq, start + note.at, note.dur, i % 4 === 0 ? 0.13 : 0.085);
    });
    pad(start, LOOP_SECONDS);
    timer = window.setTimeout(scheduleLoop, LOOP_SECONDS * 1000);
  }

  function reflect() {
    icon.innerHTML = playing ? ICON_PAUSE : ICON_MUSIC;
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Metti in pausa la colonna sonora' : 'Avvia la colonna sonora');
    button.classList.toggle('iconbtn--active', playing);
    if (pulse) pulse.hidden = !playing;
  }

  async function play() {
    if (!ctx) build();
    if (ctx.state === 'suspended') await ctx.resume();

    // Fade-in: nessun attacco brusco.
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
    master.gain.linearRampToValueAtTime(0.5, now + 1.4);

    window.clearTimeout(timer);
    scheduleLoop();
    playing = true;
    reflect();
  }

  function pause() {
    window.clearTimeout(timer);
    if (ctx) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    }
    playing = false;
    reflect();
  }

  button.addEventListener('click', () => (playing ? pause() : play()));

  // Se l'app va in background, la musica si mette in pausa: comportamento rispettoso.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && playing) pause();
  });

  return { isPlaying: () => playing };
}
