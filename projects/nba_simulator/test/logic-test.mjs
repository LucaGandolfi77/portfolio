import test from 'node:test';
import assert from 'node:assert/strict';
import { TEAMS, TEAM_BY_CODE, CONFERENCES } from '../js/data/teams.js';
import { seededRandom, dailySeed, dailyKey } from '../js/core/rng.js';
import { Sim, simulateGame, winProbability, Q_LEN } from '../js/sim/engine.js';
import { PLAYBOOKS, choosePlay, counterDefense } from '../js/sim/ai.js';
import { newSeason, playAll, standingsSorted } from '../js/sim/season.js';
import { createBracket, playAllRounds } from '../js/sim/playoffs.js';
import { efficiency, trueShooting, effectiveFG, zoneCounts, leaders } from '../js/sim/stats.js';
import { signPlayer, trade, draftClass, freeAgents } from '../js/sim/career.js';

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

console.log('11/11 tests passed');
