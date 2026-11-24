/* RPG Adventure — procedural WebAudio SFX (no assets, no CDN) */

export class Sfx {
  constructor(prefs) {
    this.prefs = prefs;
    this.ctx = null;
  }
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
  tone(freq, duration, type = 'sine', gain = 0.05, slide = 0) {
    const ctx = this.ensure(); if (!ctx) return;
    const osc = ctx.createOscillator(), vol = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), ctx.currentTime + duration);
    vol.gain.setValueAtTime(gain, ctx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(vol).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration);
  }
  noise(duration = 0.12, gain = 0.05) {
    const ctx = this.ensure(); if (!ctx) return;
    const n = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate), out = buf.getChannelData(0);
    for (let i = 0; i < n; i++) out[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource(), vol = ctx.createGain();
    vol.gain.value = gain; src.buffer = buf;
    src.connect(vol).connect(ctx.destination); src.start();
  }
  attack(combo) { this.noise(0.08 + combo * 0.02, 0.035); this.tone(240 + combo * 90, 0.09, 'square', 0.025, -120); }
  hit() { this.tone(120, 0.12, 'sawtooth', 0.04, -70); }
  hurt() { this.tone(180, 0.2, 'sawtooth', 0.05, -120); }
  skill(id) {
    ({ fireball: () => this.tone(420, 0.3, 'sawtooth', 0.04, 500),
       shield: () => this.tone(330, 0.35, 'sine', 0.04, 220),
       dash: () => this.noise(0.16, 0.04),
       heal: () => this.tone(520, 0.4, 'sine', 0.035, 260) }[id] || (() => {}))();
  }
  pickup() { this.tone(660, 0.1, 'triangle', 0.04, 220); }
  level() { [440, 550, 660].forEach((f, i) => setTimeout(() => this.tone(f, 0.18, 'triangle', 0.04), i * 90)); }
  quest() { [520, 780].forEach((f, i) => setTimeout(() => this.tone(f, 0.24, 'sine', 0.04), i * 120)); }
  click() { this.tone(420, 0.05, 'square', 0.02); }
  vibrate(ms) { if (this.prefs.vibration && navigator.vibrate) navigator.vibrate(ms); }
}
