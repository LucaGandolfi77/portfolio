/* Neural Style Studio — timelapse keyframes (DOM-free) */

export class History {
  constructor(limit = 480) {
    this.limit = limit;
    this.frames = [];
  }

  add(frame) {
    this.frames.push({ t: Date.now(), ...frame });
    if (this.frames.length > this.limit) this.frames.splice(0, this.frames.length - this.limit);
    return this.frames[this.frames.length - 1];
  }

  at(index) {
    if (!this.frames.length) return null;
    return this.frames[Math.max(0, Math.min(this.frames.length - 1, Math.round(index)))];
  }

  interpolate(position) {
    if (!this.frames.length) return null;
    const p = Math.max(0, Math.min(1, position)) * (this.frames.length - 1);
    const a = this.frames[Math.floor(p)];
    const b = this.frames[Math.ceil(p)];
    const t = p - Math.floor(p);
    const mix = (x, y) => (typeof x === 'number' && typeof y === 'number') ? x + (y - x) * t : (t < 0.5 ? x : y);
    return {
      strength: mix(a.strength, b.strength),
      mix: mix(a.mix, b.mix),
      split: mix(a.split ?? -1, b.split ?? -1),
      styleA: t < 0.5 ? a.styleA : b.styleA,
      styleB: t < 0.5 ? a.styleB : b.styleB
    };
  }

  clear() { this.frames = []; }
  get length() { return this.frames.length; }
  serialize() { return JSON.stringify(this.frames); }
  static from(json) {
    const h = new History();
    try { h.frames = JSON.parse(json) || []; } catch (e) { /* ignore */ }
    return h;
  }
}
