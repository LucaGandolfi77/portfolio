/* ============================================================
   Agente Zero — the Zero Bomb: drop the shot, drink it (pure)
   ------------------------------------------------------------
   steps: swing → fall → drink → burp → done
   ============================================================ */
import { strength } from './drunk.js';

export const CATCH = 0.28;      // |x| at the drop that lands in the glass
export const FALL = 0.5;        // seconds
export const AUTO_DROP = 6;     // the fingers give up
export const GUARD = 0.35;      // taps ignored right after the scene opens
export const BURP = 1.1;
export const HOLD_RATE = 1 / 1.6;
export const TILT_START = 22;   // degrees before anything flows
export const TILT_FULL = 65;
export const TILT_RATE = 1 / 1.3;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Where the swinging shot glass is: -1 … 1, 0 is over the big glass. */
export function shotX(t, level) {
  const k = strength(level);
  const w = Math.PI * 2 * (0.45 + 0.5 * k);
  return (0.62 + 0.38 * k) * Math.sin(w * t + 1.9);
}

export const newBomb = (level) => ({ step: 'swing', t: 0, level, x: shotX(0, level), clean: null, progress: 0, rate: 0 });

export function dropShot(b) {
  if (b.step !== 'swing' || b.t < GUARD) return false;
  b.clean = Math.abs(b.x) <= CATCH;
  b.step = 'fall';
  b.t = 0;
  return true;
}

/** How fast the glass empties for a phone tipped by `deg` degrees. */
export function tiltRate(deg) {
  if (!(deg > TILT_START)) return 0;
  return TILT_RATE * clamp(0.25 + (0.75 * (deg - TILT_START)) / (TILT_FULL - TILT_START), 0, 1);
}

/**
 * Advances the scene by dt. input: {tilt: degrees, hold: boolean}.
 * Returns the step just entered, or null.
 */
export function stepBomb(b, dt, input = {}) {
  if (b.step === 'done') return null;
  b.t += dt;
  const enter = (step) => { b.step = step; b.t = 0; return step; };
  if (b.step === 'swing') {
    b.x = shotX(b.t, b.level);
    if (b.t >= AUTO_DROP) { dropShot(b); return 'fall'; }
  } else if (b.step === 'fall') {
    if (b.t >= FALL) return enter('drink');
  } else if (b.step === 'drink') {
    b.rate = Math.max(tiltRate(input.tilt), input.hold ? HOLD_RATE : 0);
    b.progress = Math.min(1, b.progress + b.rate * dt);
    if (b.progress >= 1) return enter('burp');
  } else if (b.step === 'burp') {
    if (b.t >= BURP) return enter('done');
  }
  return null;
}
