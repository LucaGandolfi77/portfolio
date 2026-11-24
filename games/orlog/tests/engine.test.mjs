import test from 'node:test';
import assert from 'node:assert/strict';
import { FACES, FAVORS, RELICS, TALENTS, BOSSES, MODES, MUTATORS, findFavor, findBoss } from '../js/config.js';
import { mulberry32, dailySeed, createMatch, rollDice, countFaces, bestCombo, resolve, chooseAI, clamp } from '../js/engine.js';
import { dailyBoss, isBossUnlocked, nextBoss, campaignStars, endlessOpponent, chaosMutators, modeSetup } from '../js/modes.js';
import { emptyProgress, normalizeProgress, awardStars, canBuyTalent, buyTalent, unlockedRelics, toggleRelic, updateStreak, talentSummary } from '../js/progression.js';

test('registry: facce, favour, boss e modalità', () => {
  assert.equal(FACES.length, 6);
  assert.ok(FAVORS.length >= 9 && BOSSES.length === 10 && MODES.length === 6);
  assert.ok(RELICS.length >= 6 && TALENTS.length >= 6 && MUTATORS.length >= 5);
  FAVORS.forEach((favor) => assert.ok(favor.cost > 0 && favor.kind));
  assert.equal(findFavor('unknown').id, 'thor');
  assert.equal(findBoss('unknown').id, 'b1');
});

test('RNG, seed e dadi', () => {
  const a = mulberry32(9), b = mulberry32(9);
  assert.equal(a(), b());
  assert.equal(dailySeed(new Date(2026, 0, 3)), 20260103);
  assert.equal(dailyBoss(new Date(2026, 0, 3)).id, BOSSES[20260103 % BOSSES.length].id);
  const match = createMatch({ seed: 5 });
  const dice = rollDice(match, 6);
  assert.equal(dice.length, 6);
  assert.deepEqual(rollDice(createMatch({ seed: 5 }), 6), dice);
  const counts = countFaces(dice);
  assert.equal(Object.values(counts).reduce((sum, value) => sum + value, 0), 6);
  assert.ok(bestCombo(dice) >= 1);
  assert.equal(clamp(5, 0, 1), 1);
});

test('risoluzione turno e danni', () => {
  const match = createMatch({ seed: 11, hp: 10 });
  match.player.dice = ['melee', 'melee', 'token', 'block', 'ranged', 'shield'];
  match.enemy.dice = ['melee', 'steal', 'token', 'block', 'shield', 'ranged'];
  match.player.tokens = 6;
  const events = resolve(match, { playerFavor: 'thor' });
  assert.ok(events.some((event) => event.type === 'favor'));
  assert.ok(events.some((event) => event.type === 'damage'));
  assert.ok(match.enemy.hp < 10);
  assert.ok(match.player.tokens >= 0 && match.enemy.tokens >= 0);
  assert.equal(match.round, 2);
  match.enemy.hp = 0;
  match.player.dice = ['melee']; match.enemy.dice = ['token'];
  const endEvents = resolve(match);
  assert.ok(endEvents.some((event) => event.type === 'end' && event.winner === 'player'));
});

test('AI e modalità', () => {
  const match = createMatch({ seed: 3 });
  match.enemy.tokens = 8;
  const choice = chooseAI(match);
  assert.ok(choice === null || FAVORS.some((favor) => favor.id === choice));
  assert.equal(isBossUnlocked('b1', {}), true);
  assert.equal(isBossUnlocked('b2', {}), false);
  assert.equal(isBossUnlocked('b2', { stars: { b1: 2 } }), true);
  assert.equal(nextBoss('b10'), null);
  assert.equal(campaignStars({ stars: { b1: 3 } }), 3);
  assert.ok(endlessOpponent(4).hp > BOSSES[0].hp);
  assert.ok(chaosMutators(mulberry32(3)).length >= 1);
  assert.equal(modeSetup('daily').seed, dailySeed());
});

test('progressione, talenti e reliquie', () => {
  const base = emptyProgress();
  assert.equal(normalizeProgress({ stars: null }).stars.w1 === undefined, true);
  const earned = awardStars(base, 'b1', 3, 120);
  assert.equal(earned.stars.b1, 3);
  assert.equal(earned.xp > 0, true);
  assert.equal(canBuyTalent({ stars: { b1: 3 } }, 'warrior'), true);
  const after = buyTalent({ stars: { b1: 3 } }, 'warrior');
  assert.ok(after.talents.includes('warrior'));
  assert.ok(unlockedRelics({ stars: { b1: 3, b2: 3 } }).length >= 1);
  const toggled = toggleRelic({ stars: { b1: 3 } }, 'hammer');
  assert.ok(toggled.relics.includes('hammer'));
  const streak = updateStreak(base, 20260101);
  assert.equal(streak.streak.count, 1);
  assert.equal(talentSummary(earned).wins, 1);
});
