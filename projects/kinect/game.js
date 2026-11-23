/* Kinetic — game rules (DOM-free, Node-testable) */

export const CONFIG = {
  GAME_SECONDS: 90,
  TARGET_RADIUS: 28,
  HIT_RADIUS: 34,
  LEVEL_POINTS: 200,
  COMBO_WINDOW: 2.4,
  HIT_POINTS: 8,
  MAX_PARTICLES: 240
};

export const MODES = {
  classic: { seconds: 90, spawn: 1.45, speed: 115, score: 1, label: 'Classic' },
  time: { seconds: 60, spawn: 1.0, speed: 145, score: 1.4, label: 'Time Attack' },
  gesture: { seconds: 75, spawn: 1.25, speed: 125, score: 1.8, label: 'Gesture Combo' }
};

export const DIFFICULTIES = {
  relaxed: { spawn: 1.25, speed: 0.85, radius: 1.2, hits: 1 },
  normal: { spawn: 1, speed: 1, radius: 1, hits: 1 },
  chaotic: { spawn: 0.78, speed: 1.22, radius: 0.86, hits: 2 }
};

export const GESTURES = ['Closed_Fist', 'Open_Palm', 'Victory', 'Thumb_Up'];

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export class Game {
  constructor(callbacks = {}) {
    this.cb = callbacks;
    this.reset();
  }

  reset(mode = 'classic', difficulty = 'normal') {
    this.mode = MODES[mode] ? mode : 'classic';
    this.difficulty = DIFFICULTIES[difficulty] ? difficulty : 'normal';
    this.rules = MODES[this.mode];
    this.mod = DIFFICULTIES[this.difficulty];
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.hits = 0;
    this.misses = 0;
    this.level = 1;
    this.timeLeft = this.rules.seconds;
    this.targets = [];
    this.particles = [];
    this.popups = [];
    this.lastHit = 0;
    this.spawnTimer = 0.6;
    this.power = null;
    this.ended = false;
    this.mobile = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
    this.seed = (Date.now() % 100000) / 100000;
  }

  get multiplier() { return clamp(1 + Math.floor(this.combo / 3), 1, 5); }
  get accuracy() { return this.hits + this.misses ? Math.round(this.hits / (this.hits + this.misses) * 100) : 0; }

  random() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  spawn(vp, now) {
    const width = vp && vp.w ? vp.w : 800;
    const radius = CONFIG.TARGET_RADIUS * this.mod.radius;
    const isPower = this.random() < 0.07;
    const gesture = this.mode === 'gesture' ? GESTURES[Math.floor(this.random() * GESTURES.length)] : null;
    this.targets.push({
      x: radius + this.random() * Math.max(1, width - radius * 2),
      y: -radius,
      r: radius,
      vx: (this.random() - 0.5) * 24,
      vy: (this.rules.speed + this.random() * 70 + (this.level - 1) * 16) * this.mod.speed,
      hue: isPower ? 45 : gesture ? this.gestureHue(gesture) : 188 + this.random() * 90,
      age: 0,
      spin: this.random() * 6,
      type: isPower ? 'power' : 'orb',
      gesture,
      value: isPower ? 0 : 10
    });
  }

  gestureHue(gesture) {
    return ({ Closed_Fist: 8, Open_Palm: 188, Victory: 140, Thumb_Up: 280 })[gesture] || 200;
  }

  update(dt, hands, vp, now) {
    if (this.ended) return;
    const width = vp && vp.w ? vp.w : 800;
    const height = vp && vp.h ? vp.h : 600;
    const step = clamp(dt, 0, 0.05);
    const slow = this.power && this.power.kind === 'slow' && now < this.power.until ? 0.5 : 1;
    this.timeLeft = Math.max(0, this.timeLeft - step);
    if (this.power && now >= this.power.until) this.power = null;

    if (now - this.lastHit > CONFIG.COMBO_WINDOW && this.combo > 0) {
      this.combo = 0;
      this.cb.onComboEnd && this.cb.onComboEnd(0);
    }

    this.spawnTimer -= step * slow;
    if (this.spawnTimer <= 0) {
      this.spawn(vp, now);
      this.spawnTimer = Math.max(0.35, this.rules.spawn - (this.level - 1) * 0.08) * this.mod.spawn;
    }

    const list = hands || [];
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      t.age += step;
      t.spin += step * 1.4;
      t.x += t.vx * step;
      t.y += t.vy * step * slow;
      if (t.x < t.r || t.x > width - t.r) t.vx *= -1;

      let hit = false;
      for (const hand of list) {
        const pts = hand.points || [];
        if (t.gesture) {
          const g = hand.stableGesture || hand.gesture;
          if (!g || g !== t.gesture) continue;
        }
        for (const idx of [8, 0]) {
          const p = pts[idx];
          if (!p) continue;
          if (Math.hypot(p.x - t.x, p.y - t.y) < t.r + CONFIG.HIT_RADIUS) { hit = true; break; }
        }
        if (hit) break;
      }

      if (hit) {
        this.registerHit(t, now);
        this.targets.splice(i, 1);
      } else if (t.y - t.r > height) {
        this.targets.splice(i, 1);
        if (t.type === 'orb') {
          this.misses += 1;
          this.combo = 0;
          this.cb.onMiss && this.cb.onMiss();
        }
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= step;
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.vy += 120 * step;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.life -= step;
      p.y -= 26 * step;
      if (p.life <= 0) this.popups.splice(i, 1);
    }

    if (this.timeLeft <= 0) {
      this.ended = true;
      this.cb.onEnd && this.cb.onEnd(this.summary());
    }
  }

  registerHit(t, now) {
    this.hits += 1;
    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.lastHit = now;

    if (t.type === 'power') {
      const kind = this.random() < 0.5 ? 'slow' : 'double';
      this.power = { kind, until: now + 6000 };
      this.popups.push({ text: kind === 'slow' ? 'SLOW-MO' : '2× POINTS', x: t.x, y: t.y, hue: 45, life: 1.2, maxLife: 1.2 });
      this.cb.onPower && this.cb.onPower(kind);
    } else {
      const double = this.power && this.power.kind === 'double' ? 2 : 1;
      const points = Math.round(t.value * this.multiplier * this.rules.score * double);
      this.score += points;
      this.popups.push({ text: `+${points}`, x: t.x, y: t.y, hue: t.hue, life: 0.9, maxLife: 0.9 });
      this.cb.onHit && this.cb.onHit(points, this.multiplier);
      if (this.combo % 3 === 0) this.cb.onCombo && this.cb.onCombo(this.multiplier);
    }

    const level = Math.min(10, 1 + Math.floor(this.score / CONFIG.LEVEL_POINTS));
    if (level !== this.level) {
      this.level = level;
      this.cb.onLevel && this.cb.onLevel(level);
    }

    const count = this.mobile ? 8 : 14;
    for (let i = 0; i < count; i++) {
      const a = this.random() * Math.PI * 2;
      const speed = 60 + this.random() * 160;
      this.particles.push({
        x: t.x, y: t.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
        hue: t.hue, size: 2 + this.random() * 3, life: 0.5 + this.random() * 0.4,
        maxLife: 0.9
      });
    }
    if (this.particles.length > CONFIG.MAX_PARTICLES) {
      this.particles.splice(0, this.particles.length - CONFIG.MAX_PARTICLES);
    }
  }

  summary() {
    return {
      score: this.score, accuracy: this.accuracy, maxCombo: this.maxCombo,
      hits: this.hits, misses: this.misses, mode: this.mode, difficulty: this.difficulty
    };
  }
}
