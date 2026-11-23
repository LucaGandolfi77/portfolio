/* My Club knockout cup (pure) */

import { TEAM_BY_CODE } from '../data/teams.js';
import { CLUB_CODE } from './club-league.js';

export function createCup(rng = Math.random) {
  const teams = Object.keys(TEAM_BY_CODE).filter(c => c !== CLUB_CODE);
  for (let i = teams.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [teams[i], teams[j]] = [teams[j], teams[i]];
  }
  const seeds = [CLUB_CODE, ...teams.slice(0, 15)];
  const matchups = [];
  for (let i = 0; i < 16; i += 2) matchups.push({ a: seeds[i], b: seeds[i + 1], winner: null });
  return { rounds: [{ name: 'Round of 16', matchups }, { name: 'Quarterfinals', matchups: [] },
    { name: 'Semifinals', matchups: [] }, { name: 'Final', matchups: [] }],
    round: 0, champion: null, complete: false };
}

export function playCupRound(cup, clubRating, chemistry, rng = Math.random) {
  if (cup.complete) return cup;
  const round = cup.rounds[cup.round];
  if (!round) { cup.complete = true; return cup; }
  round.matchups.forEach(m => {
    if (m.winner) return;
    const strength = code => code === CLUB_CODE
      ? clubRating + chemistry
      : (TEAM_BY_CODE[code] ? TEAM_BY_CODE[code].players.slice(0, 5).reduce((a, p) => a + p.ovr, 0) / 5 : 78);
    const sa = strength(m.a) + (rng() - 0.5) * 8;
    const sb = strength(m.b) + (rng() - 0.5) * 8;
    m.winner = sa >= sb ? m.a : m.b;
    m.score = [Math.round(90 + sa * 0.2 + rng() * 18), Math.round(90 + sb * 0.2 + rng() * 18)];
  });
  if (cup.round < 3) {
    const next = cup.rounds[cup.round + 1];
    next.matchups = [];
    for (let i = 0; i < round.matchups.length; i += 2) {
      const a = round.matchups[i], b = round.matchups[i + 1];
      if (a && b) next.matchups.push({ a: a.winner, b: b.winner, winner: null });
    }
  } else {
    cup.champion = round.matchups[0] && round.matchups[0].winner;
    cup.complete = true;
  }
  cup.round += 1;
  return cup;
}
