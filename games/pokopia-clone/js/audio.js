/* DITTOPIA — procedural audio */

import { state } from './state.js';

let ctx = null;
let master = null;
let musicTimer = 0;
let musicNotes = [];

function ensure() {
  if (ctx) return true;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = state.settings.sound ? 0.16 : 0;
    master.connect(ctx.destination);
    return true;
  } catch (e) { return false; }
}

export function resume() {
  if (!ensure()) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
}

export function isMuted() { return !state.settings.sound; }
export function setMute(value) {
  state.settings.sound = !value;
  if (master) master.gain.value = state.settings.sound ? 0.16 : 0;
}

function tone(freq, dur, type = 'square', gain = 0.12, delay = 0, endFreq = null) {
  if (!ensure() || !state.settings.sound) return;
  try {
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t + dur);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(amp);
    amp.connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch (e) { /* ignore */ }
}

function seq(notes, type = 'triangle', gain = 0.14, spacing = 0.1) {
  notes.forEach((n, i) => tone(n, spacing * 1.5, type, gain, i * spacing));
}

export function sfxSelect() { tone(660, 0.06, 'square', 0.1); }
export function sfxStep() { tone(140, 0.035, 'triangle', 0.05, 0, 90); }
export function sfxPickup() { seq([660, 880, 1100], 'square', 0.1, 0.05); }
export function sfxChop() { tone(180, 0.12, 'sawtooth', 0.13, 0, 70); }
export function sfxSmash() { tone(120, 0.16, 'sawtooth', 0.14, 0, 55); }
export function sfxWater() { tone(420, 0.2, 'sine', 0.12, 0, 700); }
export function sfxCraft() { seq([440, 554, 659], 'square', 0.12, 0.07); }
export function sfxError() { tone(180, 0.15, 'square', 0.1, 0, 120); }
export function sfxFanfare() { seq([523, 659, 784, 1046], 'triangle', 0.15, 0.1); }
export function sfxSparkle() { seq([1046, 1318, 1568], 'sine', 0.09, 0.05); }
export function sfxText() { tone(880, 0.02, 'square', 0.03); }
export function cry(notes) {
  if (!notes || notes.length < 2) return;
  const dur = notes[0];
  for (let i = 1; i < notes.length; i += 2) tone(notes[i], dur / 1000, 'triangle', 0.12, (i - 1) / 2 * dur / 1000);
}
export function fluteNote(n) { tone([523,587,659,698,784,880][n] || 523, 0.24, 'sine', 0.16); }
export function fluteFail() { tone(220, 0.28, 'sawtooth', 0.12, 0, 120); }
export function fluteSuccess() { sfxFanfare(); }

export function playMusic(kind) {
  if (!ensure()) return;
  clearInterval(musicTimer);
  musicNotes = kind === 'night' ? [262, 311, 392, 311] : [392, 494, 587, 494];
  let index = 0;
  musicTimer = setInterval(() => {
    if (!state.settings.sound) return;
    tone(musicNotes[index % musicNotes.length], 0.5, 'sine', 0.035);
    index++;
  }, 700);
}
