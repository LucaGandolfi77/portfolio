/* Batch season/what-if simulations off the main thread */

import { TEAM_BY_CODE } from '../data/teams.js';
import { simulateGame } from '../sim/engine.js';
import { seededRandom } from '../core/rng.js';

self.onmessage = e => {
  const { id, home, away, homeTeam, awayTeam, count = 10, seed = 1 } = e.data || {};
  const rng = seededRandom(seed);
  const homeSide = homeTeam || TEAM_BY_CODE[home];
  const awaySide = awayTeam || TEAM_BY_CODE[away];
  const results = [];
  for (let i = 0; i < Math.min(100, count); i++) {
    const s = simulateGame(homeSide, awaySide, { rng });
    results.push({ home: s.score.home, away: s.score.away, winner: s.winner, leadChanges: s.leadChanges });
  }
  const wins = results.filter(r => r.winner === 'home').length;
  const meanHome = results.reduce((a, r) => a + r.home, 0) / Math.max(1, results.length);
  const meanAway = results.reduce((a, r) => a + r.away, 0) / Math.max(1, results.length);
  self.postMessage({ id, home, away, results, wins, meanHome, meanAway });
};
