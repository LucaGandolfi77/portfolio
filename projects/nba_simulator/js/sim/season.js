/* 30-team conference-based season (pure, deterministic) */

import { TEAMS, TEAM_BY_CODE } from '../data/teams.js';
import { simulateGame } from './engine.js';

export function newSeason(seed = 1, rng = null) {
  const codes = TEAMS.map(t => t.code).slice();
  // Fisher-Yates with deterministic RNG
  const r = rng || (() => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; });
  for (let i = codes.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [codes[i], codes[j]] = [codes[j], codes[i]];
  }
  // Circle-method round robin: 29 weeks x 15 games, alternating home court.
  const schedule = [];
  const rotating = codes.slice();
  const fixed = rotating.pop();
  const n = rotating.length + 1;
  for (let round = 0; round < n - 1; round++) {
    const games = [[rotating[0], fixed]];
    for (let i = 1; i < n / 2; i++) {
      const a = rotating[i], b = rotating[n - 1 - i];
      games.push(round % 2 ? [b, a] : [a, b]);
    }
    schedule.push(games);
    rotating.unshift(rotating.pop());
  }
  const standings = {};
  codes.forEach(code => { standings[code] = { code, w: 0, l: 0, pf: 0, pa: 0, conf: TEAM_BY_CODE[code].conference }; });
  return { codes, schedule, week: 0, standings, results: [], champion: null, seed };
}

export function playWeek(season, rng = Math.random, fast = true) {
  if (season.week >= season.schedule.length) return [];
  const games = season.schedule[season.week];
  const results = [];
  for (const [homeKey, awayKey] of games) {
    const home = TEAM_BY_CODE[homeKey];
    const away = TEAM_BY_CODE[awayKey];
    let s;
    if (fast) {
      // approximate fast result from ratings, deterministic with supplied rng
      const diff = (home.players.slice(0, 5).reduce((a, p) => a + p.ovr, 0) - away.players.slice(0, 5).reduce((a, p) => a + p.ovr, 0)) / 5;
      const hs = Math.max(70, Math.round(108 + diff * 1.6 + (rng() - 0.5) * 22));
      const as = Math.max(70, Math.round(108 - diff * 1.6 + (rng() - 0.5) * 22));
      s = { score: { home: hs, away: as }, winner: hs === as ? 'tie' : hs > as ? 'home' : 'away' };
    } else {
      s = simulateGame(home, away, { rng });
    }
    const hs = s.score.home, as = s.score.away;
    const h = season.standings[homeKey], a = season.standings[awayKey];
    h.pf += hs; h.pa += as; a.pf += as; a.pa += hs;
    if (hs > as) { h.w += 1; a.l += 1; }
    else if (as > hs) { a.w += 1; h.l += 1; }
    const result = { home: homeKey, away: awayKey, hs, as, winner: s.winner, week: season.week };
    season.results.push(result);
    results.push(result);
  }
  season.week += 1;
  return results;
}

export function standingsSorted(season, conference = null) {
  return Object.values(season.standings)
    .filter(t => !conference || t.conf === conference)
    .sort((a, b) => b.w - a.w || (b.pf - b.pa) - (a.pf - a.pa) || b.pf - a.pf);
}

export function playAll(season, rng = Math.random) {
  const out = [];
  while (season.week < season.schedule.length) out.push(...playWeek(season, rng));
  return out;
}
