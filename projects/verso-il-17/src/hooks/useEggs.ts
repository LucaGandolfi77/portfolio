import { useCallback, useEffect, useRef, useState } from 'react';
import { safeReadJson, safeWriteJson } from '../utils/storage';

export type EggId = 'wheels' | 'glitter' | 'star' | 'peek' | 'finale';

const STORAGE_KEY = 'verso17.eggs.v1';
/** Quanti tap sulle rotelle servono per sbloccare la modalità glitter. */
export const WHEELS_TAPS_TO_GLITTER = 5;
const GLITTER_MS = 12_000;

interface EggState {
  found: EggId[];
  /** Tap cumulativi sull'illustrazione del pattino, per l'easter egg delle rotelle. */
  wheelTaps: number;
}

function readState(): EggState {
  const stored = safeReadJson<Partial<EggState>>(STORAGE_KEY, {});
  return {
    found: Array.isArray(stored.found) ? (stored.found as EggId[]) : [],
    wheelTaps: typeof stored.wheelTaps === 'number' ? stored.wheelTaps : 0,
  };
}

/**
 * Easter egg discreti:
 *  - 5 tap sulle rotelle dell'illustrazione -> modalità glitter per 12 secondi;
 *  - stelline nascoste in alcune caselle;
 *  - una frase speciale per chi insiste sulle caselle future.
 *
 * I segreti trovati restano trovati (localStorage). Lo stato è puro: gli effetti
 * collaterali vivono in useEffect, così il doppio render di StrictMode è innocuo.
 */
export function useEggs() {
  const [state, setState] = useState<EggState>(readState);
  const [glitterActive, setGlitterActive] = useState(false);
  const glitterTimer = useRef<number | undefined>(undefined);

  // Persistenza: un solo punto di scrittura.
  useEffect(() => {
    safeWriteJson(STORAGE_KEY, state);
  }, [state]);

  /**
   * Registra un segreto trovato.
   *
   * Ogni scoperta ha il SUO messaggio, mostrato da chi la provoca: qui non si
   * annuncia nulla e non si accoda nulla. Così non esiste più il caso in cui un
   * annuncio in ritardo scavalca quello che l'utente sta leggendo.
   */
  const discover = useCallback((id: EggId) => {
    setState((prev) => (prev.found.includes(id) ? prev : { ...prev, found: [...prev.found, id] }));
  }, []);

  const stopGlitter = useCallback(() => setGlitterActive(false), []);

  const startGlitter = useCallback(() => {
    setGlitterActive(true);
    window.clearTimeout(glitterTimer.current);
    glitterTimer.current = window.setTimeout(stopGlitter, GLITTER_MS);
  }, [stopGlitter]);

  /** Tap sull'illustrazione del pattino: ogni 5 tap si riattiva la modalità glitter. */
  const registerWheelTap = useCallback(() => {
    setState((prev) => ({ ...prev, wheelTaps: prev.wheelTaps + 1 }));
  }, []);

  // Reazione al conteggio tap: nessun side effect dentro il reducer.
  // Il conteggio vive solo in memoria: al reload non si riattiva da solo.
  const handledTapCount = useRef(state.wheelTaps);
  useEffect(() => {
    if (state.wheelTaps === handledTapCount.current) return;
    handledTapCount.current = state.wheelTaps;
    if (state.wheelTaps % WHEELS_TAPS_TO_GLITTER !== 0) return;
    discover('glitter');
    startGlitter();
  }, [state.wheelTaps, discover, startGlitter]);

  useEffect(() => () => window.clearTimeout(glitterTimer.current), []);

  return {
    found: state.found,
    foundCount: state.found.length,
    registerWheelTap,
    discover,
    glitterActive,
  };
}
