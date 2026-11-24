/* Mystic Quest — procedural ambient chimes, no audio files */
export class Sfx {
  constructor(prefs) { this.prefs = prefs; this.ctx = null; }
  ensure() {
    if (!this.prefs.sound) return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }
  tone(freq, dur, gain = 0.05, type = 'sine', slide = 0) {
    const ctx = this.ensure(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ctx.currentTime + dur);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
  }
  star() { [880, 1174, 1568].forEach((f, i) => setTimeout(() => this.tone(f, 0.3, 0.045), i * 80)); }
  spirit() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.45, 0.04, 'triangle'), i * 120)); }
  charge(v) { this.tone(220 + v * 660, 0.08, 0.02, 'sine', 90); }
  step() { this.tone(320, 0.06, 0.012); }
  click() { this.tone(520, 0.08, 0.025, 'triangle'); }
  vibrate(ms) { if (this.prefs.vibration && navigator.vibrate) navigator.vibrate(ms); }
}
