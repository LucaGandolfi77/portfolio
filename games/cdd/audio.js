/* CDD RUN — tiny WebAudio sound bank */

import { meta } from './state.js';

let ctx = null;

export function ensureAudio() {
  if (meta.muted) return;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  } catch (e) { /* audio optional */ }
}

function tone(freq, dur, type = 'sine', gain = 0.07, slide = null, delay = 0) {
  if (meta.muted || !ctx || ctx.state !== 'running') return;
  try {
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slide), t + dur);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  } catch (e) { /* ignore */ }
}

export function sfx(name) {
  switch (name) {
    case 'coin': tone(880, 0.1, 'sine', 0.07, 1320); break;
    case 'combo': tone(660, 0.09, 'triangle', 0.06, 990); tone(990, 0.12, 'triangle', 0.05, null, 0.07); break;
    case 'lane': tone(420, 0.05, 'square', 0.03); break;
    case 'jump': tone(300, 0.13, 'triangle', 0.06, 620); break;
    case 'hit': tone(140, 0.32, 'sawtooth', 0.1, 40); break;
    case 'shield': tone(320, 0.24, 'sine', 0.09, 720); break;
    case 'power': tone(520, 0.18, 'triangle', 0.08, 900); break;
    case 'level': [0, 1, 2].forEach(i => tone(520 + i * 160, 0.14, 'sine', 0.06, null, i * 0.08)); break;
    case 'start': [0, 1, 2].forEach(i => tone(360 + i * 140, 0.16, 'sine', 0.06, null, i * 0.08)); break;
    case 'over': [0, 1, 2].forEach(i => tone(420 - i * 100, 0.3, 'triangle', 0.07, null, i * 0.13)); break;
    case 'near': tone(1200, 0.05, 'sine', 0.03, 1600); break;
    case 'pause': tone(480, 0.12, 'sine', 0.05, 300); break;
  }
}
