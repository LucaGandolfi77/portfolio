/* Pure track geometry — precomputed road mask and O(1) collision lookup */
import { WORLD } from '../config.js';

const MASK_SCALE = 0.5;

export class Track {
  constructor(def) {
    this.def = def;
    this.width = def.width;
    this.points = def.points.map(p => ({ x:p.x, y:p.y }));
    this.segments = [];
    this.total = 0;
    for (let i = 0; i < this.points.length; i++) {
      const a = this.points[i], b = this.points[(i + 1) % this.points.length];
      const dx = b.x - a.x, dy = b.y - a.y;
      const length = Math.hypot(dx, dy);
      this.segments.push({ a, b, dx, dy, length, start:this.total,
        angle:Math.atan2(dy, dx), nx:-dy / (length || 1), ny:dx / (length || 1) });
      this.total += length;
    }
    this.mw = Math.ceil(WORLD.w * MASK_SCALE);
    this.mh = Math.ceil(WORLD.h * MASK_SCALE);
    this.mask = new Uint8Array(this.mw * this.mh);
    this.buildMask();
    const start = this.pointAt(0);
    this.start = { x:start.x, y:start.y, angle:this.segments[0].angle };
  }

  buildMask() {
    const r = Math.max(2, Math.round(this.width / 2 * MASK_SCALE));
    const stamp = (wx, wy) => {
      const cx = Math.round(wx * MASK_SCALE), cy = Math.round(wy * MASK_SCALE);
      for (let y = Math.max(0, cy - r); y <= Math.min(this.mh - 1, cy + r); y++) {
        const dy = y - cy;
        for (let x = Math.max(0, cx - r); x <= Math.min(this.mw - 1, cx + r); x++) {
          const dx = x - cx;
          if (dx * dx + dy * dy <= r * r) this.mask[y * this.mw + x] = 1;
        }
      }
    };
    this.segments.forEach(s => {
      const steps = Math.max(1, Math.ceil(s.length / 6));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        stamp(s.a.x + s.dx * t, s.a.y + s.dy * t);
      }
    });
  }

  isRoad(x, y) {
    const mx = Math.floor(x * MASK_SCALE), my = Math.floor(y * MASK_SCALE);
    if (mx < 0 || my < 0 || mx >= this.mw || my >= this.mh) return false;
    return this.mask[my * this.mw + mx] === 1;
  }

  /* Nearest point on the centerline. O(number of segments). */
  project(x, y) {
    let best = null, bd = Infinity;
    for (let i = 0; i < this.segments.length; i++) {
      const s = this.segments[i];
      let t = ((x - s.a.x) * s.dx + (y - s.a.y) * s.dy) / (s.length * s.length || 1);
      t = Math.max(0, Math.min(1, t));
      const px = s.a.x + s.dx * t, py = s.a.y + s.dy * t;
      const d = (x - px) ** 2 + (y - py) ** 2;
      if (d < bd) {
        bd = d;
        best = { distance:s.start + s.length * t, lateral:Math.sqrt(d), index:i,
          t, angle:s.angle, x:px, y:py, nx:s.nx, ny:s.ny };
      }
    }
    best.side = Math.sign((x - best.x) * best.nx + (y - best.y) * best.ny) || 1;
    return best;
  }

  pointAt(distance, lane = 0) {
    const d = ((distance % this.total) + this.total) % this.total;
    let s = this.segments[this.segments.length - 1];
    for (let i = 0; i < this.segments.length; i++) {
      if (d >= this.segments[i].start && d < this.segments[i].start + this.segments[i].length) {
        s = this.segments[i]; break;
      }
    }
    const t = (d - s.start) / (s.length || 1);
    return { x:s.a.x + s.dx * t + s.nx * lane, y:s.a.y + s.dy * t + s.ny * lane, angle:s.angle };
  }

  checkpoint(distance) {
    return Math.min(3, Math.floor(distance / this.total * 4));
  }
}
