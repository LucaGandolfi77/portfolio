/* Kinetic — viewport projection (normalized landmarks -> screen pixels) */

export class Viewport {
  constructor(canvas, video) {
    this.canvas = canvas;
    this.video = video;
    this.w = 1;
    this.h = 1;
    this.dpr = 1;
    this.mirror = true;
  }

  resize() {
    const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
    const cap = coarse ? 1.5 : 2;
    this.dpr = Math.min(cap, Math.max(1, window.devicePixelRatio || 1));
    this.w = Math.max(1, window.innerWidth);
    this.h = Math.max(1, window.innerHeight);
    return { w: this.w, h: this.h, dpr: this.dpr };
  }

  get videoSize() {
    return {
      w: this.video && this.video.videoWidth ? this.video.videoWidth : 640,
      h: this.video && this.video.videoHeight ? this.video.videoHeight : 480
    };
  }

  project(p) {
    if (!p) return { x: 0, y: 0 };
    const vw = this.videoSize.w;
    const vh = this.videoSize.h;
    const scale = Math.max(this.w / vw, this.h / vh);
    const drawnW = vw * scale;
    const drawnH = vh * scale;
    const offsetX = (this.w - drawnW) / 2;
    const offsetY = (this.h - drawnH) / 2;
    const x = this.mirror ? 1 - p.x : p.x;
    return { x: offsetX + x * drawnW, y: offsetY + p.y * drawnH };
  }

  projectAll(hands) {
    return (hands || []).map(hand => ({
      ...hand,
      points: (hand.points || []).map(p => this.project(p))
    }));
  }
}
