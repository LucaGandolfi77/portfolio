/* Tiny WebAudio synth for buzzer, shots and wins */

export class Sfx {
  constructor() { this.ctx = null; this.muted = false; }

  init() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { /* optional */ }
  }

  tone(freq, dur, type = 'sine', gain = 0.05, end = null, delay = 0) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (end) osc.frequency.exponentialRampToValueAtTime(Math.max(1, end), t + dur);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(amp); amp.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  shot() { this.tone(540, 0.1, 'sine', 0.045, 760); }
  three() { [0, 1, 2].forEach(i => this.tone(620 + i * 180, 0.13, 'triangle', 0.04, null, i * 0.05)); }
  buzzer() { this.tone(220, 0.45, 'sawtooth', 0.06, 90); }
  win() { [0, 1, 2].forEach(i => this.tone(440 + i * 160, 0.2, 'sine', 0.05, null, i * 0.1)); }
  chest(kind = 'click') {
    if (kind === 'click') this.tone(180, 0.07, 'square', 0.04, 120);
    else if (kind === 'rise') [0, 1, 2].forEach(i => this.tone(320 + i * 180, 0.16, 'sine', 0.05, null, i * 0.06));
    else if (kind === 'epic') {
      [0, 1, 2, 3].forEach(i => this.tone(260 + i * 150, 0.3, 'triangle', 0.05, null, i * 0.08));
      this.tone(90, 0.4, 'sawtooth', 0.03, 60);
    } else if (kind === 'legend') {
      [0, 1, 2, 3, 4].forEach(i => this.tone(330 * Math.pow(2, i / 12), 0.45, 'sine', 0.045, null, i * 0.09));
      [0, 1].forEach(i => this.tone(140 + i * 40, 0.7, 'triangle', 0.03, 80, i * 0.1));
    }
  }

  toggle() { this.muted = !this.muted; return this.muted; }
}
