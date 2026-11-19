/* Kinetic — game state, entities and rules */

export const CONFIG = {
  GAME_SECONDS: 90,
  TARGET_RADIUS: 28,
  HIT_RADIUS: 34,
  LEVEL_POINTS: 200,
  COMBO_WINDOW: 2.4,
  HIT_POINTS: [8, 0] // index fingertip and wrist
};

export class Game {
  constructor(callbacks = {}) {
    this.cb = callbacks;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.hits = 0;
    this.misses = 0;
    this.remaining = CONFIG.GAME_SECONDS;
    this.level = 1;
    this.levelProgress = 0;
    this.spawnTimer = 0.6;
    this.ended = false;
    this.targets = [];
    this.particles = [];
    this.popups = [];
  }

  spawn(viewport) {
    const r = CONFIG.TARGET_RADIUS + Math.random() * 6;
    this.targets.push({
      x: r + Math.random() * (viewport.w - r * 2),
      y: -r,
      vx: (Math.random() - 0.5) * 70,
      vy: 115 + this.level * 17 + Math.random() * 70,
      r,
      hue: Math.floor(Math.random() * 360),
      age: 0,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 2.2,
      active: true
    });
  }

  burst(x, y, hue, amount = 16) {
    for (let i = 0; i < amount; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 220;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 40,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        size: 1.5 + Math.random() * 3,
        hue: hue + (Math.random() - 0.5) * 40
      });
    }
    if (this.particles.length > 320) this.particles.splice(0, this.particles.length - 320);
  }

  popup(x, y, text, hue) {
    this.popups.push({ x, y, text, hue, vy: -55, life: 0.9, maxLife: 0.9 });
  }

  update(dt, hands, viewport, now) {
    if (this.ended) return;

    /* --- clock & level --- */
    this.remaining = Math.max(0, this.remaining - dt);
    const newLevel = Math.min(10, 1 + Math.floor(this.score / CONFIG.LEVEL_POINTS));
    if (newLevel !== this.level) {
      this.level = newLevel;
      if (this.cb.onLevel) this.cb.onLevel(newLevel);
    }
    this.levelProgress = (this.score % CONFIG.LEVEL_POINTS) / CONFIG.LEVEL_POINTS;

    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    /* --- spawning --- */
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawn(viewport);
      this.spawnTimer = Math.max(0.45, 1.45 - (this.level - 1) * 0.09);
    }

    /* --- targets --- */
    for (const t of this.targets) {
      t.age += dt;
      t.spin += t.spinSpeed * dt;
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      if (t.x < t.r) { t.x = t.r; t.vx = Math.abs(t.vx); }
      if (t.x > viewport.w - t.r) { t.x = viewport.w - t.r; t.vx = -Math.abs(t.vx); }
      if (t.y - t.r > viewport.h) {
        t.active = false;
        this.misses++;
        this.combo = 0;
        this.comboTimer = 0;
        if (this.cb.onMiss) this.cb.onMiss();
      }
    }

    /* --- collision: break on first hit so one orb scores once per frame --- */
    if (hands && hands.length) {
      const map = viewport.mapping;
      outer:
      for (const t of this.targets) {
        if (!t.active) continue;
        for (const hand of hands) {
          for (const idx of CONFIG.HIT_POINTS) {
            const p = viewport.project(hand.points, idx, map);
            if (!p) continue;
            const reach = t.r + CONFIG.HIT_RADIUS;
            if (Math.hypot(p.x - t.x, p.y - t.y) < reach) {
              t.active = false;
              const multiplier = Math.min(5, 1 + Math.floor(this.combo / 3));
              const points = 10 * multiplier;
              this.score += points;
              this.hits++;
              this.combo++;
              this.comboTimer = CONFIG.COMBO_WINDOW;
              this.maxCombo = Math.max(this.maxCombo, this.combo);
              this.burst(t.x, t.y, t.hue);
              this.popup(t.x, t.y - t.r - 6, '+' + points, t.hue);
              if (this.combo > 1 && this.combo % 3 === 0) {
                this.popup(t.x, t.y - t.r - 30, 'x' + multiplier + '!', 45);
                if (this.cb.onCombo) this.cb.onCombo(multiplier);
              }
              if (this.cb.onHit) this.cb.onHit(points, t.x, t.y, t.hue, multiplier);
              continue outer;
            }
          }
        }
      }
    }
    this.targets = this.targets.filter(t => t.active);

    /* --- particles & popups --- */
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
      p.vx *= 1 - 1.2 * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);

    for (const p of this.popups) {
      p.y += p.vy * dt;
      p.vy *= 1 - 0.8 * dt;
      p.life -= dt;
    }
    this.popups = this.popups.filter(p => p.life > 0);

    if (this.remaining <= 0) {
      this.ended = true;
      if (this.cb.onEnd) this.cb.onEnd(this);
    }
  }
}
