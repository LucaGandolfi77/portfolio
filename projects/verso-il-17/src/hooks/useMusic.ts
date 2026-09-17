import { useCallback, useRef, useState } from 'react';

/**
 * Colonna sonora opzionale.
 *
 * Scelta precisa: NESSUN audio automatico. Il suono parte solo dopo un tap esplicito
 * su play, come richiesto dalle linee guida iOS/Safari.
 *
 * Non essendoci file audio nel progetto, la traccia predefinita è una piccola
 * "musica da carillon" sintetizzata in tempo reale con la Web Audio API: nessun
 * download, funziona offline, e la licenza non è un problema. Per usare un tuo
 * brano, vedi il README (basta sostituire `src/utils/track.ts`).
 */

type Note = { freq: number; at: number; dur: number };

const NOTE = {
  A4: 440.0,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880.0,
  C6: 1046.5,
  D6: 1174.7,
  E6: 1318.5,
} as const;

/** Melodia dolce in La minore pentatonico: si ripete con variazioni leggere. */
const MELODY: Note[] = [
  { freq: NOTE.A5, at: 0.0, dur: 0.9 },
  { freq: NOTE.C6, at: 0.45, dur: 0.9 },
  { freq: NOTE.E5, at: 1.1, dur: 1.1 },
  { freq: NOTE.G5, at: 1.8, dur: 0.8 },
  { freq: NOTE.A5, at: 2.35, dur: 1.2 },
  { freq: NOTE.D6, at: 3.2, dur: 0.9 },
  { freq: NOTE.C6, at: 3.8, dur: 1.0 },
  { freq: NOTE.A5, at: 4.6, dur: 1.4 },
  { freq: NOTE.G5, at: 5.4, dur: 0.8 },
  { freq: NOTE.E6, at: 6.0, dur: 1.0 },
  { freq: NOTE.D6, at: 6.7, dur: 1.1 },
  { freq: NOTE.C6, at: 7.4, dur: 1.6 },
];

const LOOP_SECONDS = 9.4;

interface Engine {
  ctx: AudioContext;
  master: GainNode;
  timer: number;
  loopStart: number;
}

function createEngine(): Engine | null {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  const ctx = new Ctor();
  const master = ctx.createGain();
  master.gain.value = 0;

  // Un filtro morbido toglie ogni asprezza: suono "carillon lontano".
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2600;

  master.connect(filter);
  filter.connect(ctx.destination);

  return { ctx, master, timer: 0, loopStart: 0 };
}

function pluck(engine: Engine, freq: number, at: number, dur: number, volume: number): void {
  const { ctx, master } = engine;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
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

function pad(engine: Engine, at: number, seconds: number): void {
  const { ctx, master } = engine;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(0.035, at + 1.6);
  gain.gain.linearRampToValueAtTime(0.0001, at + seconds);

  const freqs = [NOTE.A4 / 2, NOTE.E5 / 2, NOTE.C5 / 2];
  freqs.forEach((freq, i) => {
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

export function useMusic() {
  const engineRef = useRef<Engine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAvailable] = useState(
    () =>
      typeof window !== 'undefined' &&
      Boolean(
        window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext,
      ),
  );

  const scheduleLoop = useCallback((engine: Engine) => {
    const { ctx } = engine;
    const start = ctx.currentTime + 0.08;
    engine.loopStart = start;

    MELODY.forEach((note, i) => {
      // Volume leggermente alternato: la melodia "respira".
      const volume = i % 3 === 0 ? 0.16 : 0.11;
      pluck(engine, note.freq, start + note.at, note.dur, volume);
    });
    pad(engine, start, LOOP_SECONDS);

    engine.timer = window.setTimeout(() => scheduleLoop(engine), LOOP_SECONDS * 1000);
  }, []);

  const play = useCallback(async () => {
    if (!isAvailable) return;
    if (!engineRef.current) engineRef.current = createEngine();
    const engine = engineRef.current;
    if (!engine) return;

    if (engine.ctx.state === 'suspended') await engine.ctx.resume();

    // Fade-in: nessun attacco brusco.
    const now = engine.ctx.currentTime;
    engine.master.gain.cancelScheduledValues(now);
    engine.master.gain.setValueAtTime(Math.max(engine.master.gain.value, 0.0001), now);
    engine.master.gain.linearRampToValueAtTime(0.5, now + 1.4);

    window.clearTimeout(engine.timer);
    scheduleLoop(engine);
    setIsPlaying(true);
  }, [isAvailable, scheduleLoop]);

  const pause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    window.clearTimeout(engine.timer);
    const now = engine.ctx.currentTime;
    engine.master.gain.cancelScheduledValues(now);
    engine.master.gain.setValueAtTime(engine.master.gain.value, now);
    engine.master.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else void play();
  }, [isPlaying, pause, play]);

  // Se l'app va in background, la musica si mette in pausa: comportamento rispettoso.
  const handleVisibility = useCallback(() => {
    if (document.visibilityState === 'hidden' && isPlaying) pause();
  }, [isPlaying, pause]);

  return { isPlaying, isAvailable, play, pause, toggle, handleVisibility };
}
