/* My Club league with divisions and promotions (pure) */

import { TEAM_BY_CODE } from '../data/teams.js';

export const TIERS = ['Bronze', 'Silver', 'Gold', 'Legend'];
export const CLUB_CODE = 'MYC';

export function newClubLeague(tier = 'Bronze', rng = Math.random) {
  const codes = Object.keys(TEAM_BY_CODE).filter(c => c !== CLUB_CODE);
  for (let i = codes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [codes[i], codes[j]] = [codes[j], codes[i]];
  }
  // 30-game calendar, alternating home and away.
  const games = codes.map((code, i) => i % 2 ? { home: code, away: CLUB_CODE } : { home: CLUB_CODE, away: code });
  const standings = {};
  [CLUB_CODE, ...codes].forEach(code => { standings[code] = { code, w: 0, l: 0, pf: 0, pa: 0 }; });
  return { tier, week: 0, games, standings, results: [], champion: null, complete: false };
}

export function clubStrength(clubRating, chemistry = 0) { return clubRating + chemistry; }

export function playClubGame(league, clubRating, chemistry, rng = Math.random) {
  const game = league.games[league.week];
  if (!game) return null;
  const opponent = game.home === CLUB_CODE ? game.away : game.home;
  const team = TEAM_BY_CODE[opponent];
  const oppRating = team ? team.players.slice(0, 5).reduce((a, p) => a + p.ovr, 0) / 5 : 78;
  const diff = clubStrength(clubRating, chemistry) - oppRating;
  const hs = Math.max(60, Math.round(105 + diff * 1.6 + (rng() - 0.5) * 22));
  const as = Math.max(60, Math.round(105 - diff * 1.6 + (rng() - 0.5) * 22));
  const clubHome = game.home === CLUB_CODE;
  const my = clubHome ? hs : as;
  const their = clubHome ? as : hs;
  const me = league.standings[CLUB_CODE], them = league.standings[opponent];
  me.pf += my; me.pa += their; them.pf += their; them.pa += my;
  if (my > their) { me.w += 1; them.l += 1; } else { me.l += 1; them.w += 1; }
  const result = { week: league.week, home: game.home, away: game.away, hs, as, opponent, won: my > their };
  league.results.push(result);
  league.week += 1;
  if (league.week >= league.games.length) league.complete = true;
  return result;
}

export function clubStandings(league) {
  return Object.values(league.standings).sort((a, b) => b.w - a.w || (b.pf - b.pa) - (a.pf - a.pa));
}

export function promote(league) {
  if (!league.complete) return league.tier;
  const pos = clubStandings(league).findIndex(t => t.code === CLUB_CODE);
  const idx = TIERS.indexOf(league.tier);
  if (pos < 6 && idx < TIERS.length - 1) league.tier = TIERS[idx + 1];
  else if (pos > 22 && idx > 0) league.tier = TIERS[idx - 1];
  return league.tier;
}
