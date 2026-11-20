import { RULES } from './config.js';
import { clamp } from '../../core.js';

export class Engine {
  constructor(hooks = {}) { this.hooks = hooks; this.reset(); }
  reset() {
    this.score = 0; this.lives = RULES.startLives; this.status = 'menu';
    this.player = { x: 200, y: 300 }; this.time = 0;
  }
  start() { this.reset(); this.status = 'playing'; }
  update(dt) {
    if (this.status !== 'playing') return;
    this.time += dt;
    this.player.x = clamp(this.player.x + 60 * dt, 0, 400);
  }
  hit() {
    if (this.status !== 'playing') return;
    this.score += RULES.pointsPerHit;
    this.hooks.onEvent?.('hit', { score: this.score });
  }
  damage() {
    if (this.status !== 'playing') return;
    this.lives--;
    if (this.lives <= 0) {
      this.status = 'gameover';
      this.hooks.onStatus?.('gameover', { score: this.score });
    }
  }
}
