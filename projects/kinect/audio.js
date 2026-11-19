/* Kinetic — tiny WebAudio synth, no external assets */

export class Sfx {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { /* audio is optional */ }
  }

  tone(freq, dur, type = 'sine', gain = .06, endFreq = null, delay = 0) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + dur);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(amp);
    amp.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  hit(multiplier = 1) {
    const base = 480 + multiplier * 70;
    this.tone(base, .16, 'sine', .08, base * 1.6);
    this.tone(base / 2, .12, 'triangle', .035, base / 2 * 1.3, .02);
  }

  combo(multiplier) {
    [0, 1, 2].forEach(i => this.tone(620 + i * 160 + multiplier * 30, .14, 'triangle', .06, null, i * .07));
  }

  miss() { this.tone(230, .16, 'sawtooth', .025, 120); }

  start() {
    [0, 1, 2].forEach(i => this.tone(360 + i * 140, .18, 'sine', .06, null, i * .09));
  }

  over() {
    [0, 1, 2].forEach(i => this.tone(520 - i * 110, .32, 'triangle', .07, null, i * .14));
  }

  toggle() {
    this.muted = !this.muted;
    return this.muted;
  }
}
