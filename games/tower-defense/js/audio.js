/* Effetti sonori sintetizzati: nessun file audio, tutto WebAudio */

import { getSettings, setSetting } from './state.js';

let ctx = null;
let master = null;
let enabled = getSettings().sound !== false;

function ensureContext() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  } catch (e) {
    ctx = null;
  }
  return ctx;
}

function tone(freq, duration, type, volume, sweepTo, delay) {
  if (!enabled) return;
  const ac = ensureContext();
  if (!ac) return;
  try {
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    const start = ac.currentTime + (delay || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, start);
    if (sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, sweepTo), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume || 0.3), start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  } catch (e) { /* audio non disponibile */ }
}

function noise(duration, volume, delay) {
  if (!enabled) return;
  const ac = ensureContext();
  if (!ac) return;
  try {
    const start = ac.currentTime + (delay || 0);
    const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * duration), ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ac.createBufferSource();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1400;
    gain.gain.setValueAtTime(volume || 0.25, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    src.buffer = buffer;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(start);
  } catch (e) { /* ignore */ }
}

const SOUNDS = {
  click: () => tone(620, 0.06, 'triangle', 0.2, 760),
  start: () => { tone(420, 0.12, 'triangle', 0.25, 620); tone(620, 0.16, 'triangle', 0.22, 880, 0.1); },
  shoot: () => tone(760, 0.055, 'square', 0.13, 380),
  cannon: () => { tone(150, 0.18, 'sawtooth', 0.3, 60); noise(0.22, 0.2); },
  tesla: () => { tone(920, 0.12, 'sawtooth', 0.16, 180); noise(0.1, 0.12); },
  hit: () => tone(260, 0.07, 'square', 0.16, 140),
  explode: () => { noise(0.32, 0.34); tone(110, 0.26, 'sawtooth', 0.28, 45); },
  place: () => { tone(330, 0.09, 'triangle', 0.24, 520); tone(660, 0.07, 'sine', 0.16, 880, 0.06); },
  upgrade: () => { [440, 554, 659].forEach((f, i) => tone(f, 0.12, 'triangle', 0.22, f * 1.3, i * 0.07)); },
  sell: () => tone(480, 0.12, 'sine', 0.2, 240),
  error: () => tone(180, 0.14, 'square', 0.18, 120),
  wave: () => { tone(330, 0.13, 'triangle', 0.22, 440); tone(440, 0.16, 'triangle', 0.2, 660, 0.12); },
  boss: () => { tone(110, 0.42, 'sawtooth', 0.32, 55); tone(165, 0.4, 'square', 0.18, 82, 0.05); },
  waveclear: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.14, 'sine', 0.2, f, i * 0.09)); },
  leak: () => { tone(220, 0.2, 'sawtooth', 0.24, 90); },
  victory: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.32, 'triangle', 0.26, f, i * 0.13)); },
  gameover: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'triangle', 0.26, f * 0.9, i * 0.15)); }
};

export function play(name) {
  if (!enabled) return;
  const fn = SOUNDS[name];
  if (fn) fn();
}

export function isSoundOn() { return enabled; }

export function toggleSound() {
  enabled = !enabled;
  setSetting('sound', enabled);
  if (enabled) play('click');
  return enabled;
}

/* Sblocca l'audio al primo gesto dell'utente (richiesta dei browser) */
export function unlockAudio() {
  const ac = ensureContext();
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
}
