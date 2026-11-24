/* Fractal Observatory — pan/zoom/rotate camera with smooth animation */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

export class Camera {
  constructor() {
    this.panX = 0; this.panY = 0; this.zoom = 1; this.rot = 0;
    this.fit = 1; this.anim = null;
  }
  setViewport(w, h) { this.fit = Math.min(w, h) / 2.45; }
  screenToWorld(px, py, w, h) {
    const dx = px - w / 2 - this.panX, dy = py - h / 2 - this.panY;
    const c = Math.cos(-this.rot), s = Math.sin(-this.rot), k = 1 / (this.zoom * this.fit);
    return { x: (dx * c - dy * s) * k, y: (dx * s + dy * c) * k };
  }
  placeWorldAt(p, px, py, w, h) {
    const z = this.zoom * this.fit, c = Math.cos(this.rot), s = Math.sin(this.rot);
    const sx = p.x * z * c - p.y * z * s;
    const sy = p.x * z * s + p.y * z * c;
    this.panX = px - w / 2 - sx;
    this.panY = py - h / 2 - sy;
  }
  zoomAt(px, py, factor, w, h) {
    const p = this.screenToWorld(px, py, w, h);
    this.zoom = clamp(this.zoom * factor, 0.02, 100);
    this.placeWorldAt(p, px, py, w, h);
  }
  rotateAt(px, py, d, w, h) {
    const p = this.screenToWorld(px, py, w, h);
    this.rot += d;
    this.placeWorldAt(p, px, py, w, h);
  }
  reset() {
    this.anim = {
      t: performance.now(),
      from: { panX: this.panX, panY: this.panY, zoom: this.zoom, rot: this.rot },
      to: { panX: 0, panY: 0, zoom: 1, rot: Math.round(this.rot / (Math.PI * 2)) * Math.PI * 2 }
    };
  }
  update(now) {
    if (!this.anim) return;
    const t = clamp((now - this.anim.t) / 650, 0, 1);
    const e = 1 - Math.pow(1 - t, 3);
    this.panX = lerp(this.anim.from.panX, this.anim.to.panX, e);
    this.panY = lerp(this.anim.from.panY, this.anim.to.panY, e);
    this.rot = lerp(this.anim.from.rot, this.anim.to.rot, e);
    this.zoom = Math.exp(lerp(Math.log(this.anim.from.zoom), Math.log(this.anim.to.zoom), e));
    if (t >= 1) this.anim = null;
  }
  apply(ctx, dpr, w, h) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(w / 2 + this.panX, h / 2 + this.panY);
    ctx.rotate(this.rot);
    ctx.scale(this.zoom * this.fit, this.zoom * this.fit);
  }
  snapshot() { return { panX: this.panX, panY: this.panY, zoom: this.zoom, rot: this.rot, fit: this.fit }; }
}
