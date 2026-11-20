/* Game Kit — local ranked campaign: rating, ranks, streaks, daily challenge */

import { load, store } from './storage.js';

export const TIERS = [
  { min: 0, name: 'ROOKIE', color: '#9fb3d9' },
  { min: 1050, name: 'BRONZE', color: '#d08c60' },
  { min: 1180, name: 'SILVER', color: '#c9d6e8' },
  { min: 1320, name: 'GOLD', color: '#ffd166' },
  { min: 1480, name: 'PLATINUM', color: '#4de8ff' },
  { min: 1650, name: 'DIAMOND', color: '#a98bff' },
  { min: 1850, name: 'LEGEND', color: '#ff6b9d' }
];

export function tierFor(rating) {
  return [...TIERS].reverse().find(t => rating >= t.min) || TIERS[0];
}

export function createCampaign({ key, k = 32, tiers = TIERS }) {
  const state = load(key, {
    rating: 1000, wins: 0, losses: 0, draws: 0,
    streak: 0, bestStreak: 0, games: 0, log: []
  });

  function saveCampaign() { store(key, state); }

  function result(outcome, opponentRating = 1000) {
    const expected = 1 / (1 + Math.pow(10, (opponentRating - state.rating) / 400));
    const actual = outcome === 'win' ? 1 : outcome === 'draw' ? 0.5 : 0;
    const delta = Math.round(k * (actual - expected));
    const before = tierFor(state.rating);
    state.rating = Math.max(0, state.rating + delta);
    const after = tierFor(state.rating);
    state.games++;
    if (outcome === 'win') { state.wins++; state.streak = Math.max(0, state.streak) + 1; }
    else if (outcome === 'loss') { state.losses++; state.streak = 0; }
    else { state.draws++; }
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.log.unshift({ outcome, delta, rating: state.rating, t: Date.now() });
    if (state.log.length > 30) state.log.length = 30;
    saveCampaign();
    return {
      delta, rating: state.rating, rank: after.name, color: after.color,
      rankChanged: after.name !== before.name,
      streak: state.streak,
      text: `${outcome === 'win' ? 'VICTORY' : outcome === 'loss' ? 'DEFEAT' : 'DRAW'} ${delta >= 0 ? '+' : ''}${delta} · ${after.name}`
    };
  }

  function summary() {
    return {
      rating: state.rating, rank: tierFor(state.rating),
      wins: state.wins, losses: state.losses, draws: state.draws,
      games: state.games, streak: state.streak, bestStreak: state.bestStreak,
      winRate: state.games ? Math.round(state.wins / state.games * 100) : 0
    };
  }

  function daily(date = new Date(), n = 3) {
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    let s = seed >>> 0;
    const rng = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const goals = ['win in under 20 moves', 'win without undo', 'win as black', 'draw a game', 'win 2 in a row'];
    const picks = [];
    while (picks.length < n) {
      const g = goals[Math.floor(rng() * goals.length)];
      if (!picks.includes(g)) picks.push(g);
    }
    return { seed, goals: picks };
  }

  function reset() {
    state.rating = 1000; state.wins = state.losses = state.draws = 0;
    state.streak = state.bestStreak = state.games = 0; state.log = [];
    saveCampaign();
  }

  return { state, result, summary, daily, reset, tierFor };
}
