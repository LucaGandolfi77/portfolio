/* Precision Skating — 4-round championship with AI teams and standings */

import { CHAMPIONSHIP } from './config.js';
import { state, save } from './state.js';

const POINTS = [5, 3, 2, 1, 0];

export class Championship {
  constructor() {
    this.round = 0;
    this.entries = [
      { id: 'player', name: 'Team Kinetic', power: 1, points: 0, scores: [] },
      ...CHAMPIONSHIP.map(round => ({
        id: round.id, name: round.opponent, power: round.power, points: 0, scores: []
      }))
    ];
  }

  reset() {
    this.round = 0;
    state.championship = { round: 0, points: 0, history: [] };
    state.standings = [];
    save();
    this.entries = [
      { id: 'player', name: 'Team Kinetic', power: 1, points: 0, scores: [] },
      ...CHAMPIONSHIP.map(round => ({
        id: round.id, name: round.opponent, power: round.power, points: 0, scores: []
      }))
    ];
  }

  get current() { return CHAMPIONSHIP[Math.min(this.round, CHAMPIONSHIP.length - 1)]; }
  get finished() { return this.round >= CHAMPIONSHIP.length; }

  aiScore(round, difficulty) {
    const power = round.power;
    const difficultyFactor = difficulty === 'hard' ? 1.08 : difficulty === 'easy' ? 0.9 : 1;
    const base = 118 * power * difficultyFactor;
    return Math.round(base + (Math.random() - 0.5) * 22);
  }

  submit(playerTotal, difficulty) {
    const round = this.current;
    if (!round) return null;
    const results = this.entries.map(entry => ({
      entry,
      score: entry.id === 'player' ? playerTotal : this.aiScore(round, difficulty)
    }));
    results.sort((a, b) => b.score - a.score);
    results.forEach((result, index) => {
      result.entry.points += POINTS[index] || 0;
      result.entry.scores.push(result.score);
    });
    const rank = results.findIndex(result => result.entry.id === 'player') + 1;
    const medal = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : null;
    this.round++;
    state.championship.round = this.round;
    state.championship.history.push({ round: round.id, score: playerTotal, rank, medal });
    state.championship.points = this.entries[0].points;
    state.standings = this.standings();
    if (medal === 'gold') state.stats.wins++;
    state.best.championship = Math.max(state.best.championship, playerTotal);
    save();
    return { rank, medal, results: results.map(r => ({ name: r.entry.name, score: r.score, points: r.entry.points })), finished: this.finished };
  }

  standings() {
    return this.entries.slice().sort((a, b) => b.points - a.points || b.scores.reduce((x, y) => x + y, 0) - a.scores.reduce((x, y) => x + y, 0));
  }

  restore() {
    if (state.championship.round > 0) {
      // riprende la classifica dal salvataggio senza forzare un nuovo campionato
      const stored = state.standings || [];
      if (stored.length) {
        this.entries = stored.map(entry => ({ ...entry, scores: entry.scores || [] }));
      }
      this.round = state.championship.round;
    }
  }
}
