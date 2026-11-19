/* Arena Royale 2 — WebAudio + haptics */

import { getSound } from './store.js';

let actx = null;

export function initAudio() {
  try { actx = new (window.AudioContext || window.webkitAudioContext)(); }
  catch (e) { /* audio optional */ }
}

export function sfx(freq, dur, type = 'square', vol = 0.04) {
  try {
    if (!getSound() || !actx) return;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    o.connect(g).connect(actx.destination);
    o.start();
    o.stop(actx.currentTime + dur);
  } catch (e) { /* silent */ }
}

export function buzz(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms); }
  catch (e) { /* ignore */ }
}
