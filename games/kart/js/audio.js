/* Neon Kart — procedural engine and SFX, no audio files */
export class Sfx {
  constructor(prefs) { this.prefs = prefs; this.ctx = null; this.engine = null; }
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
  beep(freq, dur, type = 'sine', gain = 0.04, slide = 0) {
    const ctx = this.ensure(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ctx.currentTime + dur);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
  }
  engineStart() {
    const ctx = this.ensure(); if (!ctx || this.engine) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = 70; f.type = 'lowpass'; f.frequency.value = 320;
    g.gain.value = 0.012;
    o.connect(f).connect(g).connect(ctx.destination); o.start();
    this.engine = { o, g, f };
  }
  engineSet(speed, nitro) {
    if (!this.engine || !this.ctx) return;
    this.engine.o.frequency.setTargetAtTime(60 + speed * 11 + (nitro ? 40 : 0), this.ctx.currentTime, 0.08);
    this.engine.f.frequency.setTargetAtTime(240 + speed * 42, this.ctx.currentTime, 0.08);
  }
  engineStop() { try { this.engine?.o.stop(); } catch (e) {} this.engine = null; }
  count(n) { this.beep(n === 0 ? 880 : 440, n === 0 ? 0.5 : 0.14, 'square', 0.05); }
  lap() { [660, 880].forEach((f, i) => setTimeout(() => this.beep(f, 0.16, 'triangle', 0.04), i * 90)); }
  pickup() { this.beep(520, 0.18, 'triangle', 0.04, 260); }
  crash() { this.beep(120, 0.18, 'sawtooth', 0.05, -80); }
  win() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.beep(f, 0.25, 'triangle', 0.05), i * 130)); }
  vibrate(ms) { if (this.prefs.vibration && navigator.vibrate) navigator.vibrate(ms); }
}
