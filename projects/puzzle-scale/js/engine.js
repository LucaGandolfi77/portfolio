/* Scale Puzzle — pure game engine */
import { generate, sameCell } from './generator.js';
import { DIFFICULTY, MAX_LEVEL, LIVES } from './config.js';

export class Game {
  constructor(hooks = {}) { this.hooks = hooks; this.reset(); }
  reset() {
    this.level = 1; this.mode = 'classic'; this.difficulty = 'normal';
    this.status = 'menu'; this.pattern = null; this.progress = 0;
    this.moves = 0; this.hits = 0; this.misses = 0; this.combo = 0;
    this.maxCombo = 0; this.score = 0; this.lives = LIVES;
    this.hints = 2; this.hintUsed = 0; this.elapsed = 0; this.stars = 0;
  }
  get cfg() { return DIFFICULTY[this.difficulty] || DIFFICULTY.normal; }

  start(level, mode = this.mode, difficulty = this.difficulty, seed = null) {
    this.level = Math.max(1, Math.min(MAX_LEVEL, level));
    this.mode = mode; this.difficulty = difficulty;
    this.pattern = generate(this.level, seed, mode);
    this.progress = 0; this.moves = 0; this.hits = 0; this.misses = 0;
    this.combo = 0; this.maxCombo = 0; this.score = 0;
    this.lives = LIVES; this.hints = 2; this.hintUsed = 0;
    this.elapsed = 0; this.stars = 0;
    this.status = mode === 'memory' || mode === 'daily' ? 'preview' : 'playing';
    this.hooks.onStart?.(this.snapshot());
    return this.snapshot();
  }

  beginPlay() {
    if (this.status === 'preview') { this.status = 'playing'; this.hooks.onPlay?.(this.snapshot()); }
  }
  tick(dt) {
    if (this.status !== 'playing') return;
    this.elapsed += dt;
    if (this.mode === 'speed' && this.elapsed >= 60) {
      this.status = 'gameover';
      this.hooks.onEnd?.(this.snapshot(), 'time');
    }
  }

  tap(cell) {
    if (this.status !== 'playing' || !this.pattern) return { ok: false };
    const expected = this.pattern.sequence[this.progress];
    this.moves++;
    if (sameCell(expected, cell)) {
      this.progress++;
      this.hits++;
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      const quality = this.combo >= 8 ? 'perfect' : this.combo >= 4 ? 'great' : 'good';
      this.score += Math.round((10 + this.level * 0.5) * (1 + this.combo * 0.12));
      this.hooks.onHit?.({ cell, index: this.progress, quality, combo: this.combo, ...this.snapshot() });
      if (this.progress >= this.pattern.length) return this.complete();
      return { ok: true, quality };
    }
    this.misses++;
    this.combo = 0;
    this.score = Math.max(0, this.score - Math.round(5 * this.cfg.penalty));
    this.lives--;
    this.hooks.onMiss?.({ cell, expected, lives: this.lives, ...this.snapshot() });
    if (this.lives <= 0) {
      this.status = 'gameover';
      this.hooks.onEnd?.(this.snapshot(), 'lives');
      return { ok: false, gameover: true };
    }
    return { ok: false };
  }

  complete() {
    this.status = 'complete';
    const timeBonus = this.mode === 'speed' ? 0 : Math.max(0, 90 - Math.round(this.elapsed * 3));
    const accuracy = this.hits / Math.max(1, this.moves);
    this.score += timeBonus + Math.round(accuracy * 100) - this.hintUsed * 10;
    this.stars = accuracy >= 0.98 && this.hintUsed === 0 ? 3
      : accuracy >= 0.85 ? 2 : 1;
    this.hooks.onWin?.(this.snapshot());
    return { ok: true, complete: true, stars: this.stars };
  }

  undo() {
    if (this.status !== 'playing' || this.progress <= 0) return false;
    this.progress--;
    this.moves++;
    this.combo = 0;
    this.score = Math.max(0, this.score - 8);
    this.hooks.onUndo?.(this.snapshot());
    return true;
  }

  hint() {
    if (this.status !== 'playing' || this.hints <= 0) return null;
    const next = this.pattern.sequence[this.progress];
    if (!next) return null;
    this.hints--; this.hintUsed++;
    this.score = Math.max(0, this.score - this.cfg.hintCost);
    this.hooks.onHint?.({ cell: next, ...this.snapshot() });
    return next;
  }

  snapshot() {
    return {
      level: this.level, mode: this.mode, difficulty: this.difficulty,
      status: this.status, size: this.pattern?.size || 3, shape: this.pattern?.shape || '',
      sequence: this.pattern?.sequence || [], length: this.pattern?.length || 0,
      progress: this.progress, moves: this.moves, hits: this.hits, misses: this.misses,
      combo: this.combo, maxCombo: this.maxCombo, score: this.score,
      lives: this.lives, hints: this.hints, hintUsed: this.hintUsed,
      elapsed: this.elapsed, stars: this.stars
    };
  }
}

export function starsFor(s) { return s.stars || 0; }
