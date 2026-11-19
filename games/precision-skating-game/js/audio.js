/* Precision Skating — WebAudio metronome and effects */

import { state } from './state.js';

let ctx = null;
let master = null;

function ensure() {
  if (ctx) return true;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = state.sound ? 0.18 : 0;
    master.connect(ctx.destination);
    return true;
  } catch (e) { return false; }
}

export function resume() {
  if (!ensure()) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
}

export function setSound(value) {
  state.sound = !!value;
  if (master) master.gain.value = state.sound ? 0.18 : 0;
}

function tone(freq, duration, type = 'sine', gain = 0.1, delay = 0, endFreq = null) {
  if (!ensure() || !state.sound) return;
  try {
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t + duration);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.006);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(amp);
    amp.connect(master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  } catch (e) { /* ignore */ }
}

export const sfx = {
  beat: () => tone(660, 0.05, 'sine', 0.06),
  perfect: () => { tone(1200, 0.1, 'sine', 0.16); tone(1600, 0.09, 'sine', 0.1, 0.05); },
  good: () => tone(900, 0.08, 'sine', 0.12),
  miss: () => tone(220, 0.16, 'sawtooth', 0.12, 0, 110),
  drift: () => tone(440, 0.14, 'triangle', 0.09, 0, 620),
  correct: () => { tone(1000, 0.08, 'sine', 0.14); tone(1300, 0.08, 'sine', 0.1, 0.05); },
  element: () => [523, 659, 880].forEach((f, i) => tone(f, 0.14, 'triangle', 0.12, i * 0.1)),
  win: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.2, 'triangle', 0.14, i * 0.12))
};
