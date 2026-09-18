/**
 * eggs.js — easter egg discreti.
 *
 *  - 5 tap sulle rotelle dell'illustrazione -> modalità glitter per 12 secondi;
 *  - stelline nascoste in alcune caselle (le posizioni stanno in calendar.js);
 *  - una frase speciale per chi insiste sulle caselle future.
 *
 * I segreti trovati restano trovati (localStorage).
 */
import { readJson, writeJson } from '../utils/storage.js';

const STORAGE_KEY = 'sd.eggs.v1';
export const WHEELS_TAPS_TO_GLITTER = 5;
const GLITTER_MS = 12_000;

export function createEggs() {
  const stored = readJson(STORAGE_KEY, {});
  const state = {
    found: Array.isArray(stored.found) ? stored.found : [],
    wheelTaps: typeof stored.wheelTaps === 'number' ? stored.wheelTaps : 0,
  };

  let glitterTimer = 0;
  let glitterActive = false;
  const listeners = new Set();

  const persist = () => writeJson(STORAGE_KEY, state);
  const notify = () => listeners.forEach((fn) => fn());

  function stopGlitter() {
    glitterActive = false;
    document.body.classList.remove('glitter-mode');
    notify();
  }

  function startGlitter() {
    glitterActive = true;
    document.body.classList.add('glitter-mode');
    window.clearTimeout(glitterTimer);
    glitterTimer = window.setTimeout(stopGlitter, GLITTER_MS);
    notify();
  }

  /** Registra un segreto trovato. Restituisce true se è nuovo. */
  function discover(id) {
    if (state.found.includes(id)) return false;
    state.found.push(id);
    persist();
    notify();
    return true;
  }

  /** Tap sull'illustrazione del pattino: ogni 5 tap si riattiva la modalità glitter. */
  function registerWheelTap() {
    state.wheelTaps += 1;
    persist();
    if (state.wheelTaps % WHEELS_TAPS_TO_GLITTER === 0) {
      discover('glitter');
      startGlitter();
      return true;
    }
    return false;
  }

  return {
    discover,
    registerWheelTap,
    isGlitterActive: () => glitterActive,
    foundCount: () => state.found.length,
    has: (id) => state.found.includes(id),
    onChange: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
