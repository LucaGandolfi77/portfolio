/* 16-team conference playoffs with best-of-7 series and home court (pure) */

import { TEAM_BY_CODE } from '../data/teams.js';
import { simulateGame } from './engine.js';

export function createBracket(season) {
  const rounds = [];
  // Seed positions are resolved from the supplied standings list per conference.
  const byConf = { East: [], West: [] };
  Object.values(season.standings).forEach(t => byConf[t.conf].push(t));
  for (const conf of ['East', 'West']) {
    byConf[conf].sort((a, b) => b.w - a.w || (b.pf - b.pa) - (a.pf - a.pa));
  }
  const matchups = [];
  for (const conf of ['East', 'West']) {
    const list = byConf[conf].slice(0, 8);
    const pairs = [[0, 7], [3, 4], [2, 5], [1, 6]];
    pairs.forEach(([a, b], i) => matchups.push({
      id: `${conf}-R1-${i}`, conference: conf, round: 1,
      a: list[a].code, b: list[b].code, seedA: a + 1, seedB: b + 1,
      wins: [0, 0], games: [], winner: null
    }));
  }
  rounds.push({ name: 'Round 1', matchups });
  rounds.push({ name: 'Semifinals', matchups: [] });
  rounds.push({ name: 'Conference Finals', matchups: [] });
  rounds.push({ name: 'NBA Finals', matchups: [] });
  return { rounds, round: 0, champion: null, complete: false };
}

function playSeries(series, rng) {
  let a = series.wins[0], b = series.wins[1];
  while (a < 4 && b < 4) {
    const home = a + b < 4 && (series.seedA < series.seedB || (a + b) % 2 === 0) ? series.a : series.b;
    const away = home === series.a ? series.b : series.a;
    const s = simulateGame(TEAM_BY_CODE[home], TEAM_BY_CODE[away], { rng });
    const homeWon = (home === series.a) === (s.winner === 'home');
    if (homeWon) a += 1; else b += 1;
    series.games.push({ home, away, hs: s.score.home, as: s.score.away, winner: s.winner });
  }
  series.wins = [a, b];
  series.winner = a > b ? series.a : series.b;
  return series;
}

export function playRound(bracket, rng = Math.random) {
  if (bracket.complete) return bracket;
  const current = bracket.rounds[bracket.round];
  if (!current) { bracket.complete = true; return bracket; }
  current.matchups.forEach(m => playSeries(m, rng));
  if (bracket.round < 3) {
    const next = bracket.rounds[bracket.round + 1];
    if (bracket.round === 2) {
      const east = current.matchups.find(m => m.conference === 'East' && m.winner);
      const west = current.matchups.find(m => m.conference === 'West' && m.winner);
      next.matchups = [{ id: 'Finals', conference: 'NBA', round: 4, a: east && east.winner, b: west && west.winner, seedA: 1, seedB: 1, wins: [0, 0], games: [], winner: null }];
    } else {
      for (const conf of ['East', 'West']) {
        const winners = current.matchups.filter(m => m.conference === conf && m.winner);
        for (let i = 0; i < winners.length; i += 2) {
          const a = winners[i], b = winners[i + 1];
          if (!a || !b) continue;
          next.matchups.push({
            id: `${conf}-R${bracket.round + 2}-${i / 2}`, conference: conf, round: bracket.round + 2,
            a: a.winner, b: b.winner, seedA: a.seedA, seedB: b.seedB,
            wins: [0, 0], games: [], winner: null
          });
        }
      }
    }
  } else {
    bracket.champion = current.matchups[0] && current.matchups[0].winner;
    bracket.complete = true;
  }
  bracket.round += 1;
  return bracket;
}

export function playAllRounds(bracket, rng = Math.random) {
  let guard = 0;
  while (!bracket.complete && guard < 6) { playRound(bracket, rng); guard += 1; }
  return bracket;
}
