/* GEOM DASH — tiny WebAudio sound bank */

import { state } from './state.js';

let ctx = null;

function ensure() {
  if (ctx || !state.settings.sound) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  } catch (e) { /* silent */ }
}

export function sound(name) {
  if (!state.settings.sound) return;
  ensure();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  const tone = (freq, end, dur, type = 'square', gain = 0.06, delay = 0) => {
    try {
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + dur);
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(gain, t + 0.008);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch (e) { /* ignore */ }
  };
  switch (name) {
    case 'jump': tone(420, 780, 0.12, 'square', 0.05); break;
    case 'double': tone(620, 1040, 0.14, 'triangle', 0.055); break;
    case 'land': tone(180, 90, 0.08, 'sine', 0.04); break;
    case 'near': tone(920, 1300, 0.07, 'sine', 0.035); break;
    case 'flow': tone(700, 1100, 0.18, 'triangle', 0.06); tone(1100, 1400, 0.12, 'sine', 0.04, 0.08); break;
    case 'shield': tone(300, 700, 0.2, 'sawtooth', 0.06); break;
    case 'hit': tone(220, 60, 0.35, 'sawtooth', 0.09); break;
    case 'checkpoint': [520, 660, 880].forEach((f, i) => tone(f, f, 0.12, 'sine', 0.055, i * 0.08)); break;
    case 'win': [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, 0.18, 'triangle', 0.07, i * 0.1)); break;
    case 'click': tone(600, 720, 0.06, 'square', 0.03); break;
  }
}
