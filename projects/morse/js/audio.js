/* Morse Studio — WebAudio transmitter with play/pause/stop and progress */
import { normalizeSymbols } from './codec.js';

export class Transmitter {
  constructor() {
    this.ctx = null;
    this.playing = false;
    this.startAt = 0;
    this.pausedAt = 0;
    this.total = 0;
    this.tokens = [];
    this.events = [];
    this.onProgress = null;
    this.onEnd = null;
    this.onToken = null;
    this.raf = 0;
    this.lastToken = -1;
  }

  build(morse, opts = {}) {
    const wpm = Math.max(1, opts.wpm || 14);
    const unit = 1.2 / wpm;
    const seq = normalizeSymbols(morse);
    const tokens = seq.split(/\s+/).filter(Boolean);
    const events = [];
    let t = 0;
    tokens.forEach((token, index) => {
      const start = t;
      if (token === '/') { t += unit * 7; events.push({ type: 'space', start, duration: unit * 7, index }); return; }
      for (let i = 0; i < token.length; i++) {
        if (token[i] === '.') { events.push({ type: 'tone', start: t, duration: unit, index }); t += unit * 2; }
        else if (token[i] === '-') { events.push({ type: 'tone', start: t, duration: unit * 3, index }); t += unit * 4; }
      }
      t += unit * 2;
    });
    this.tokens = tokens;
    this.events = events;
    this.total = t;
    return this.total;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  play(morse, opts = {}) {
    this.stop();
    const total = this.build(morse, opts);
    if (!total) return false;
    const ctx = this.ensure();
    if (!ctx) return false;
    const freq = opts.freq || 700;
    const volume = Math.max(0, Math.min(1, opts.volume == null ? 0.6 : opts.volume));
    const base = ctx.currentTime + 0.05;
    this.events.filter(e => e.type === 'tone').forEach(ev => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain); gain.connect(ctx.destination);
      const s = base + ev.start, d = ev.duration;
      const peak = volume * 0.22;
      gain.gain.setValueAtTime(0.0001, s);
      gain.gain.linearRampToValueAtTime(peak, s + Math.min(0.006, d / 4));
      gain.gain.setValueAtTime(peak, s + Math.max(0.006, d - 0.006));
      gain.gain.linearRampToValueAtTime(0.0001, s + d);
      osc.start(s); osc.stop(s + d + 0.02);
    });
    this.startAt = performance.now();
    this.pausedAt = 0;
    this.playing = true;
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({ title: 'Morse transmission', artist: 'Morse Studio' });
        navigator.mediaSession.playbackState = 'playing';
      } catch (e) {}
    }
    this.tick();
    return true;
  }

  tick = () => {
    if (!this.playing) return;
    const elapsed = (performance.now() - this.startAt) / 1000;
    const progress = Math.min(1, elapsed / this.total);
    this.onProgress?.(progress, elapsed, this.total);
    const tokenIndex = this.events.findLast?.(e => e.start <= elapsed)?.index ?? -1;
    if (tokenIndex !== this.lastToken) { this.lastToken = tokenIndex; this.onToken?.(tokenIndex); }
    if (elapsed >= this.total + 0.1) { this.finish(); return; }
    this.raf = requestAnimationFrame(this.tick);
  };

  pause() {
    if (!this.playing) return;
    this.pausedAt = (performance.now() - this.startAt) / 1000;
    this.playing = false;
    cancelAnimationFrame(this.raf);
    this.ctx?.suspend?.().catch(() => {});
  }
  resume() {
    if (this.playing || !this.pausedAt) return;
    this.ctx?.resume?.().catch(() => {});
    this.startAt = performance.now() - this.pausedAt * 1000;
    this.pausedAt = 0;
    this.playing = true;
    this.tick();
  }
  stop() {
    this.playing = false;
    this.pausedAt = 0;
    cancelAnimationFrame(this.raf);
    if (this.ctx) {
      try { this.ctx.close(); } catch (e) {}
      this.ctx = null;
    }
    this.onProgress?.(0, 0, 0);
    this.onToken?.(-1);
  }
  finish() {
    this.stop();
    this.onEnd?.();
  }
  get isPlaying() { return this.playing; }
}
