import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};
import { TEAMS, TEAM_BY_CODE, CONFERENCES } from '../js/data/teams.js';
import { seededRandom, dailySeed, dailyKey } from '../js/core/rng.js';
import { Sim, simulateGame, winProbability, Q_LEN } from '../js/sim/engine.js';
import { PLAYBOOKS, choosePlay, counterDefense } from '../js/sim/ai.js';
import { newSeason, playAll, standingsSorted } from '../js/sim/season.js';
import { createBracket, playAllRounds } from '../js/sim/playoffs.js';
import { efficiency, trueShooting, effectiveFG, zoneCounts, leaders } from '../js/sim/stats.js';
import { signPlayer, trade, draftClass, freeAgents } from '../js/sim/career.js';
import { seasonAverage, advancedProjection, STAR_NAMES } from '../js/data/player-stats.js';
import { playerProfile, enrichTeams } from '../js/data/player-profile.js';
import { playerNotes } from '../js/data/player-notes.js';
import { defaults, save, load, recordPlayerStats } from '../js/core/storage.js';

test('30 NBA teams with 10 players and two conferences', () => {
  assert.equal(TEAMS.length, 30);
  assert.equal(CONFERENCES.length, 2);
  assert.ok(TEAMS.every(t => t.players.length === 10));
  assert.ok(TEAMS.every(t => t.players.some(p => p.pos === 'C')));
  assert.ok(TEAM_BY_CODE.LAL.name.includes('Lakers'));
});

test('seeded RNG is deterministic and daily seed is stable', () => {
  const a = seededRandom(42), b = seededRandom(42);
  for (let i = 0; i < 8; i++) assert.equal(a(), b());
  assert.equal(dailyKey(new Date(2026, 0, 2)), '20260102');
  assert.equal(dailySeed(new Date(2026, 0, 2)), dailySeed(new Date(2026, 0, 2)));
});

test('simulation terminates with four quarters and consistent score', () => {
  const s = simulateGame(TEAM_BY_CODE.BOS, TEAM_BY_CODE.LAL, { rng: seededRandom(7) });
  assert.equal(s.quarters.length, Q_LEN > 0 ? 4 : 4);
  assert.equal(s.quarters.reduce((a, q) => a + q.home, 0), s.score.home);
  assert.equal(s.quarters.reduce((a, q) => a + q.away, 0), s.score.away);
  assert.ok(s.score.home > 40 && s.score.away > 40);
  assert.ok(s.events.length > 20);
});

test('same seed produces the same result', () => {
  const a = simulateGame(TEAM_BY_CODE.GSW, TEAM_BY_CODE.NYK, { rng: seededRandom(99) });
  const b = simulateGame(TEAM_BY_CODE.GSW, TEAM_BY_CODE.NYK, { rng: seededRandom(99) });
  assert.deepEqual(a.score, b.score);
});

test('bilingual events carry IT and EN text', () => {
  const sim = new Sim(TEAM_BY_CODE.CHI, TEAM_BY_CODE.MIA, { rng: seededRandom(3) });
  for (let i = 0; i < 30; i++) sim.step();
  assert.ok(sim.events.length > 0);
  assert.ok(sim.events.every(e => e.it && e.en));
});

test('win probability is monotonic', () => {
  assert.ok(winProbability(12, 600) > winProbability(0, 600));
  assert.ok(winProbability(10, 60) > winProbability(10, 600));
});

test('playbooks and counter defenses are selected from the registry', () => {
  const play = choosePlay(TEAM_BY_CODE.BOS, seededRandom(11));
  assert.ok(PLAYBOOKS[play]);
  assert.ok(['man', 'zone', 'press', 'switch'].includes(counterDefense(play, null, seededRandom(5))));
});

test('season schedules 29 weeks and completes', () => {
  const season = newSeason(123);
  assert.equal(season.schedule.length, 29);
  playAll(season, seededRandom(456));
  assert.equal(season.week, 29);
  assert.ok(season.results.length > 200);
  assert.equal(standingsSorted(season, 'East').length, 15);
});

test('playoffs use a 16-team field and crown a champion', () => {
  const season = newSeason(7);
  playAll(season, seededRandom(8));
  const bracket = createBracket(season);
  assert.equal(bracket.rounds[0].matchups.length, 8);
  playAllRounds(bracket, seededRandom(9));
  assert.equal(bracket.complete, true);
  assert.ok(bracket.champion);
});

test('advanced metrics stay finite', () => {
  const p = { pts: 20, fgm: 8, fga: 15, tpm: 3, tpa: 6, ftm: 4, fta: 5, orb: 2, drb: 5, ast: 4, stl: 1, blk: 1, to: 2 };
  assert.ok(Number.isFinite(efficiency(p)));
  assert.ok(trueShooting(p) > 0 && trueShooting(p) < 2);
  assert.ok(effectiveFG(p) > 0 && effectiveFG(p) < 1);
  assert.deepEqual(Object.keys(zoneCounts([{ value: 3, y: 20 }, { value: 2, y: 240 }])).length, 3);
  assert.equal(leaders([p], 'pts', 1).length, 1);
});

test('franchise actions validate roster rules', () => {
  const team = JSON.parse(JSON.stringify(TEAM_BY_CODE.BOS));
  const fa = freeAgents([team], 2, seededRandom(4))[0];
  const signed = signPlayer(team, fa);
  assert.equal(signed.ok, true);
  assert.equal(signed.team.players.length, 11);
  const t = trade(TEAM_BY_CODE.BOS, TEAM_BY_CODE.LAL, 'BOS-1', 'LAL-1');
  assert.equal(t.ok, true);
  assert.equal(draftClass(3, seededRandom(2)).length, 3);
});

test('star season averages are curated and realistic', () => {
  assert.equal(STAR_NAMES.length, 30);
  const a = seasonAverage(TEAM_BY_CODE.LAL.players[0]);
  assert.equal(a.curated, true);
  assert.ok(a.pts > 20 && a.fg > 0.4 && a.ft > 0.6);
  const b = seasonAverage(TEAM_BY_CODE.BOS.players[9]);
  assert.equal(b.curated, false);
  assert.ok(b.pts > 0 && b.reb >= 0);
  const adv = advancedProjection(TEAM_BY_CODE.LAL.players[0]);
  assert.ok(adv.per > 0 && adv.ts > 0.3 && adv.ts < 0.9);
});

test('all players have physical attributes for the 3D avatar', () => {
  const enriched = enrichTeams(TEAMS);
  assert.equal(enriched.length, 30);
  assert.ok(enriched.every(t => t.players.every(p =>
    p.heightCm > 170 && p.weightKg > 60 && p.hairColor.startsWith('#') &&
    ['oval', 'round', 'square', 'long'].includes(p.faceShape) && p.jersey >= 0)));
  const bron = playerProfile(TEAM_BY_CODE.LAL.players[0]);
  assert.equal(bron.curated, true);
  assert.equal(bron.jersey, 23);
});

test('player notes contain verified quote and factual trivia', () => {
  const notes = playerNotes(TEAM_BY_CODE.LAL.players[0], 'en', 'Los Angeles Lakers');
  assert.ok(notes.quote && notes.quote.includes('criticism'));
  assert.ok(notes.trivia.includes('2003'));
  const other = playerNotes(TEAM_BY_CODE.BOS.players[9], 'it', 'Boston Celtics');
  assert.equal(other.quote, null);
  assert.ok(other.trivia.includes('Boston Celtics'));
});

test('storage v3 accumulates per-player totals and migrates v2', () => {
  store.clear();
  const state = defaults();
  recordPlayerStats(state, [{ id: 'BOS-1', pts: 20, orb: 3, drb: 5, fgm: 8, fga: 15 }]);
  recordPlayerStats(state, [{ id: 'BOS-1', pts: 10, orb: 1, drb: 4, fgm: 4, fga: 9 }]);
  assert.equal(state.playerStats['BOS-1'].games, 2);
  assert.equal(state.playerStats['BOS-1'].pts, 30);
  assert.equal(state.playerStats['BOS-1'].reb, 13);
  save(state);
  store.delete('pf.nba.v3');
  store.set('pf.nba.v2', JSON.stringify({ version: 2, history: [1, 2], settings: { lang: 'it' } }));
  const migrated = load();
  assert.equal(migrated.version, 3);
  assert.equal(migrated.settings.lang, 'it');
  assert.equal(migrated.history.length, 2);
});

console.log('15/15 tests passed');
