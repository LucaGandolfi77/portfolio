/* Audio sintetizzato + feedback aptico */

let ctx = null;
let master = null;
let enabled = true;
let haptics = true;

try {
  const saved = JSON.parse(localStorage.getItem('shogi_pwa_v1') || '{}');
  if (saved && typeof saved.sound === 'boolean') enabled = saved.sound;
  if (saved && typeof saved.haptics === 'boolean') haptics = saved.haptics;
} catch (e) { /* ignore */ }

function ensure() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.2;
    master.connect(ctx.destination);
  } catch (e) { ctx = null; }
  return ctx;
}

function tone(freq, duration, type, volume, sweep, delay) {
  if (!enabled) return;
  const ac = ensure();
  if (!ac) return;
  try {
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    const start = ac.currentTime + (delay || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, start);
    if (sweep) osc.frequency.exponentialRampToValueAtTime(Math.max(30, sweep), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume || 0.3), start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  } catch (e) { /* ignore */ }
}

function noise(duration, volume, delay) {
  if (!enabled) return;
  const ac = ensure();
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
    filter.frequency.value = 1800;
    gain.gain.setValueAtTime(volume || 0.2, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    src.buffer = buffer;
    src.connect(filter); filter.connect(gain); gain.connect(master);
    src.start(start);
  } catch (e) { /* ignore */ }
}

const SOUNDS = {
  move: () => { tone(280, 0.07, 'triangle', 0.28, 200); noise(0.05, 0.09); },
  capture: () => { tone(150, 0.16, 'sawtooth', 0.3, 70); noise(0.14, 0.2); },
  drop: () => { tone(420, 0.09, 'square', 0.2, 250); noise(0.06, 0.12); },
  promote: () => { [440, 554, 659].forEach((f, i) => tone(f, 0.13, 'triangle', 0.24, f * 1.2, i * 0.07)); },
  check: () => { tone(880, 0.22, 'square', 0.22, 660); tone(660, 0.22, 'square', 0.18, 440, 0.1); },
  mate: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, 'triangle', 0.26, f, i * 0.12)); },
  win: () => { [392, 523, 659, 880].forEach((f, i) => tone(f, 0.34, 'triangle', 0.28, f, i * 0.13)); },
  lose: () => { [330, 262, 196].forEach((f, i) => tone(f, 0.34, 'triangle', 0.26, f * 0.9, i * 0.16)); },
  click: () => tone(600, 0.05, 'sine', 0.18, 720),
  hint: () => { tone(740, 0.1, 'sine', 0.2, 980); tone(980, 0.12, 'sine', 0.16, 1180, 0.08); },
  lowTime: () => { tone(1200, 0.07, 'square', 0.16, 900); tone(1200, 0.07, 'square', 0.16, 900, 0.16); }
};

export function play(name) {
  const fn = SOUNDS[name];
  if (fn) fn();
}

export function vibrate(pattern) {
  if (!haptics) return;
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* ignore */ }
}

export function isSoundOn() { return enabled; }
export function isHapticsOn() { return haptics; }
function savePrefs() {
  try {
    const data = JSON.parse(localStorage.getItem('shogi_pwa_v1') || '{}') || {};
    data.settings = Object.assign({}, data.settings, { sound: enabled, haptics });
    localStorage.setItem('shogi_pwa_v1', JSON.stringify(data));
  } catch (e) { /* ignore */ }
}

export function toggleSound() { enabled = !enabled; savePrefs(); if (enabled) play('click'); return enabled; }
export function toggleHaptics() { haptics = !haptics; savePrefs(); if (haptics) vibrate(30); return haptics; }
export function unlockAudio() {
  const ac = ensure();
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
}
