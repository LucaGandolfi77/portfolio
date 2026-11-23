/* Kinetic — temporal filters and gesture debouncing (DOM-free, Node-testable) */

export class LowPass {
  constructor() { this.y = null; this.s = null; }

  filter(value, alpha) {
    if (this.y === null) { this.y = value; this.s = value; return value; }
    this.s = alpha * value + (1 - alpha) * this.s;
    this.y = this.s;
    return this.y;
  }
}

function alpha(cutoff, dt) {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
}

export class OneEuro {
  constructor({ minCutoff = 1.0, beta = 0.015, dCutoff = 1.0 } = {}) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.x = new LowPass();
    this.dx = new LowPass();
  }

  filter(value, dt) {
    const step = Math.max(1 / 240, Math.min(0.1, dt || 1 / 60));
    const derivative = this.x.y === null ? 0 : (value - this.x.y) / step;
    const edx = this.dx.filter(derivative, alpha(this.dCutoff, step));
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    return this.x.filter(value, alpha(cutoff, step));
  }

  reset() { this.x = new LowPass(); this.dx = new LowPass(); }
}

export class LandmarkSmoother {
  constructor(opts = {}) {
    this.opts = opts;
    this.hands = [];
  }

  filter(hands, dt) {
    while (this.hands.length < hands.length) this.hands.push(Array.from({ length: 21 }, () => new OneEuro(this.opts)));
    return hands.map((hand, i) => {
      const points = hand.points || [];
      const filters = this.hands[i];
      const smoothed = points.map((p, j) => ({
        x: filters[j].filter(p.x, dt),
        y: filters[j].filter(p.y, dt),
        z: p.z || 0
      }));
      return { ...hand, points: smoothed };
    });
  }

  reset() { this.hands = []; }
}

export class GestureDebouncer {
  constructor({ frames = 3, score = 0.5, holdMs = 80 } = {}) {
    this.frames = frames;
    this.minScore = score;
    this.holdMs = holdMs;
    this.candidate = null;
    this.count = 0;
    this.stable = null;
    this.since = 0;
  }

  update(label, confidence, now = 0) {
    const valid = label && label !== 'None' && confidence >= this.minScore ? label : null;
    if (valid === this.candidate) this.count += 1;
    else { this.candidate = valid; this.count = valid ? 1 : 0; }
    if (!valid || this.count < this.frames) {
      if (now - this.since > this.holdMs) this.stable = null;
      return this.stable;
    }
    if (this.stable !== valid) {
      this.stable = valid;
      this.since = now;
      return valid;
    }
    return this.stable;
  }

  reset() { this.candidate = null; this.count = 0; this.stable = null; this.since = 0; }
}

export function pinchDistance(points) {
  const a = points && points[4];
  const b = points && points[8];
  if (!a || !b) return Infinity;
  return Math.hypot(a.x - b.x, a.y - b.y);
}
