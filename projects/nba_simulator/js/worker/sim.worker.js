/* Batch season/what-if simulations off the main thread */

import { TEAM_BY_CODE } from '../data/teams.js';
import { simulateGame } from '../sim/engine.js';
import { seededRandom } from '../core/rng.js';

self.onmessage = e => {
  const { id, home, away, count = 10, seed = 1 } = e.data || {};
  const rng = seededRandom(seed);
  const results = [];
  for (let i = 0; i < Math.min(100, count); i++) {
    const s = simulateGame(TEAM_BY_CODE[home], TEAM_BY_CODE[away], { rng });
    results.push({ home: s.score.home, away: s.score.away, winner: s.winner, leadChanges: s.leadChanges });
  }
  const wins = results.filter(r => r.winner === 'home').length;
  self.postMessage({ id, results, wins, meanHome: results.reduce((a, r) => a + r.home, 0) / Math.max(1, results.length) });
};
