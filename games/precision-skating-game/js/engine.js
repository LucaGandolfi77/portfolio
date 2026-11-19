/* Precision Skating — rhythm engine, drift system and scoring */

import { SKATERS, DIFF_MULT, beatsForElement, formationFor } from './config.js';

const PERFECT_MS = 85;
const GOOD_MS = 170;

export class Engine {
  constructor(onEvent = () => {}) {
    this.onEvent = onEvent;
    this.skaters = [];
    this.beats = [];
    this.beatIdx = 0;
    this.program = [];
    this.programIdx = 0;
    this.difficulty = 'medium';
    this.rink = { x: 0, y: 0, w: 100, h: 100 };
    this.score = this.blankScore();
    this.pendingNext = false;
  }

  blankScore() {
    return {
      technical: 0, execution: 0, artistic: 0, penalties: 0,
      combo: 0, maxCombo: 0, perfects: 0, corrections: 0, drifts: 0
    };
  }

  start({ program, difficulty, rink }) {
    this.program = program;
    this.difficulty = difficulty;
    this.rink = rink;
    this.programIdx = 0;
    this.score = this.blankScore();
    this.beatIdx = 0;
    this.pendingNext = false;
    this.skaters = SKATERS.map((skater, i) => {
      const point = this.targetsFor(program[0].variant)[i] || { x: rink.x + rink.w / 2, y: rink.y + rink.h / 2 };
      return {
        index: i, name: skater.name, stats: skater,
        x: point.x, y: point.y, tx: point.x, ty: point.y,
        drifting: false, driftTargetX: point.x, driftTargetY: point.y,
        driftTimer: 0, corrected: false, trail: []
      };
    });
    this.generateBeats();
  }

  targetsFor(variant, progress = 0) {
    return formationFor(variant, progress).map(p => ({
      x: this.rink.x + p.x * this.rink.w,
      y: this.rink.y + p.y * this.rink.h
    }));
  }

  generateBeats() {
    const element = this.program[this.programIdx];
    this.beats = [];
    this.beatIdx = 0;
    if (!element) return;
    const count = beatsForElement(element, this.difficulty);
    const gap = element.durMs / count;
    for (let i = 0; i < count; i++) {
      this.beats.push({ timeMs: element.startMs + i * gap, judged: false, hit: false, quality: null });
    }
  }

  update(dt, elapsedMs) {
    // formation movement
    for (const skater of this.skaters) {
      skater.trail.unshift({ x: skater.x, y: skater.y, life: 1 });
      if (skater.trail.length > 12) skater.trail.pop();
      for (const point of skater.trail) point.life -= dt * 2.2;
      const targetX = skater.drifting ? skater.driftTargetX : skater.tx;
      const targetY = skater.drifting ? skater.driftTargetY : skater.ty;
      const factor = Math.min(1, dt * (skater.drifting ? 1.6 : 2.6));
      skater.x += (targetX - skater.x) * factor;
      skater.y += (targetY - skater.y) * factor;
      if (skater.corrected) {
        skater.driftTimer += dt;
        if (skater.driftTimer > 0.5) skater.corrected = false;
      }
    }

    // frame-rate independent drifts
    const element = this.program[this.programIdx];
    if (!element) return 'finished';
    const multiplier = (DIFF_MULT[element.diff] || 1) * (this.difficulty === 'hard' ? 1.25 : this.difficulty === 'easy' ? 0.7 : 1);
    for (const skater of this.skaters) {
      if (skater.drifting) continue;
      const probability = 0.11 * multiplier * (1 - skater.stats.precision / 200) * dt;
      if (Math.random() < probability) {
        skater.drifting = true;
        skater.driftTimer = 0;
        const angle = Math.random() * Math.PI * 2;
        const offset = 16 + Math.random() * 26;
        skater.driftTargetX = skater.tx + Math.cos(angle) * offset;
        skater.driftTargetY = skater.ty + Math.sin(angle) * offset;
        this.score.drifts++;
        this.onEvent({ type: 'drift', skater });
      }
    }

    // missed beats
    for (const beat of this.beats) {
      if (!beat.judged && elapsedMs > beat.timeMs + GOOD_MS) {
        beat.judged = true;
        beat.hit = false;
        this.score.combo = 0;
        this.score.penalties -= 0.5;
        this.onEvent({ type: 'miss', beat });
      }
    }

    // element transitions
    if (elapsedMs >= element.startMs + element.durMs) {
      this.score.technical += 5 + element.level * 2;
      for (const skater of this.skaters) {
        if (skater.drifting) this.score.penalties -= 1;
      }
      this.programIdx++;
      if (this.programIdx >= this.program.length) return 'finished';
      const next = this.program[this.programIdx];
      const targets = this.targetsFor(next.variant);
      this.skaters.forEach((skater, i) => {
        skater.tx = targets[i].x;
        skater.ty = targets[i].y;
        skater.drifting = false;
      });
      this.generateBeats();
      this.onEvent({ type: 'element', element: next });
    }
    return null;
  }

  tap(elapsedMs) {
    for (let i = this.beatIdx; i < this.beats.length; i++) {
      const beat = this.beats[i];
      if (beat.judged) continue;
      const difference = Math.abs(elapsedMs - beat.timeMs);
      if (difference > GOOD_MS) continue;

      beat.judged = true;
      beat.hit = true;
      this.score.combo++;
      this.score.maxCombo = Math.max(this.score.maxCombo, this.score.combo);
      if (difference <= PERFECT_MS) {
        beat.quality = 'perfect';
        this.score.execution += 2;
        this.score.perfects++;
        this.onEvent({ type: 'perfect', combo: this.score.combo });
      } else {
        beat.quality = 'good';
        this.score.execution += 1;
        this.onEvent({ type: 'good', combo: this.score.combo });
      }
      this.beatIdx = Math.max(this.beatIdx, i + 1);
      return beat.quality;
    }
    this.score.combo = 0;
    this.score.penalties -= 0.5;
    this.onEvent({ type: 'miss' });
    return 'miss';
  }

  correctAt(x, y, radius = 26) {
    let closest = null;
    let best = radius;
    for (const skater of this.skaters) {
      if (!skater.drifting) continue;
      const distance = Math.hypot(skater.x - x, skater.y - y);
      if (distance < best) { best = distance; closest = skater; }
    }
    if (!closest) return false;
    closest.drifting = false;
    closest.corrected = true;
    closest.driftTimer = 0;
    this.score.corrections++;
    this.score.execution += 1;
    this.score.combo++;
    this.score.maxCombo = Math.max(this.score.maxCombo, this.score.combo);
    this.onEvent({ type: 'correct', skater: closest });
    return true;
  }

  results() {
    const artistic = Math.max(0, 20 - Math.min(10, -this.score.penalties * 0.5));
    const comboBonus = Math.min(5, Math.floor(this.score.maxCombo / 5));
    const total = Math.max(0, Math.round(
      this.score.technical + this.score.execution + artistic + this.score.penalties + comboBonus
    ));
    return { ...this.score, artistic, comboBonus, total };
  }
}
