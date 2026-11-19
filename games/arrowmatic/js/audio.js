/* Arrowmatic — WebAudio sound bank */

import { SV, save } from './state.js';

export const AU = {
  ctx: null,
  g: null,
  muted: !!SV.mute,
  ensure() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      this.ctx = new AC();
      this.g = this.ctx.createGain();
      this.g.gain.value = this.muted ? 0 : 0.4;
      this.g.connect(this.ctx.destination);
      return true;
    } catch (e) { return false; }
  },
  resume() {
    if (this.ensure() && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  },
  setMuted(value) {
    this.muted = !!value;
    if (this.g) this.g.gain.value = this.muted ? 0 : 0.4;
    SV.mute = this.muted;
    save();
  },
  tone(type, f0, f1, dur, vol, delay = 0) {
    if (this.muted || !this.ensure()) return;
    try {
      const t = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(this.g);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch (e) { /* ignore */ }
  },
  noise(dur, vol, freq) {
    if (this.muted || !this.ensure()) return;
    try {
      const t = this.ctx.currentTime;
      const len = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(filter);
      filter.connect(g);
      g.connect(this.g);
      src.start(t);
    } catch (e) { /* ignore */ }
  },
  shoot() { this.tone('square', 760, 220, 0.09, 0.09); },
  enemyLaser() { this.tone('square', 330, 95, 0.13, 0.11); },
  hit() { this.noise(0.05, 0.12, 2500); },
  kill() { this.noise(0.22, 0.28, 900); this.tone('triangle', 300, 90, 0.18, 0.18); },
  coin() { this.tone('sine', 920, 1400, 0.08, 0.1); this.tone('sine', 1400, 1800, 0.07, 0.08, 0.05); },
  heart() { this.tone('sine', 500, 900, 0.16, 0.16); },
  lvl() { [440, 554, 659, 880].forEach((f, i) => this.tone('sine', f, f, 0.11, 0.2, i * 0.08)); },
  draft() { this.tone('sine', 660, 990, 0.14, 0.2); },
  lego() { [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone('triangle', f, f, 0.14, 0.22, i * 0.07)); },
  boss() { this.tone('sawtooth', 180, 70, 0.5, 0.3); this.noise(0.5, 0.3, 500); },
  death() { this.tone('sawtooth', 280, 40, 0.9, 0.35); this.noise(0.8, 0.45, 450); },
  boom() { this.noise(0.5, 0.5, 700); this.tone('sine', 110, 30, 0.5, 0.4); },
  select2() { this.tone('sine', 600, 900, 0.1, 0.14); }
};
