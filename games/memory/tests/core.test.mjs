import test from 'node:test';
import assert from 'node:assert/strict';
import { MODES, DIFFICULTIES, DECKS, THEMES, QUESTS, POWERS, EVENTS, ACHIEVEMENTS, findMode, findDeck, findQuest } from '../js/config.js';
import { mulberry32, dailySeed, shuffled, createGame, boardCards, comboMultiplier, scorePair, registerMismatch, isComplete, starRating, progress, mirrorIndexes } from '../js/core.js';
import { isQuestUnlocked, questStars, nextQuestId, questStats, meetsQuestGoal } from '../js/quest.js';
import { emptyCollection, normalizeCollection, collectCards, levelFor, collectionSummary } from '../js/collection.js';

test('registry: modalità, mazzi, temi, quest', () => {
  assert.ok(MODES.length >= 11);
  assert.equal(new Set(MODES.map((item) => item.id)).size, MODES.length);
  assert.ok(Object.keys(DECKS).length >= 8 && THEMES.length >= 6 && QUESTS.length === 20);
  assert.ok(POWERS.length >= 4 && EVENTS.length >= 5 && ACHIEVEMENTS.length >= 5);
  assert.equal(findMode('unknown').id, 'classic');
  assert.equal(findDeck('unknown').name, 'Animals');
  assert.equal(findQuest('unknown').id, 'q01');
  assert.equal(DIFFICULTIES[0].rows * DIFFICULTIES[0].cols, 16);
});

test('PRNG, daily e shuffle deterministico', () => {
  const a = mulberry32(42), b = mulberry32(42);
  assert.equal(a(), b());
  assert.equal(dailySeed(new Date(2026, 0, 5)), 20260105);
  const values = [1, 2, 3, 4, 5, 6];
  assert.deepEqual(shuffled(values, mulberry32(7)), shuffled(values, mulberry32(7)));
  assert.equal(values.length, 6);
});

test('creazione partita e punteggio', () => {
  const game = createGame({ mode: 'classic', seed: 3, questId: 'q01' });
  assert.equal(game.cards.length, 8);
  assert.equal(game.cards.filter((card) => !card.matched).length, 8);
  assert.equal(comboMultiplier(0), 1);
  assert.ok(comboMultiplier(20) > 1);
  const before = game.score;
  scorePair(game, { seconds: 1, gold: true });
  assert.ok(game.score > before);
  registerMismatch(game);
  assert.equal(game.combo, 0);
  assert.equal(progress(game), 0);
  assert.equal(isComplete(game), false);
  assert.equal(starRating(40, [10, 20, 30]), 3);
  assert.equal(mirrorIndexes(0, 4, true), 3);
});

test('quest: sblocchi e obiettivi', () => {
  assert.equal(isQuestUnlocked('q01', {}), true);
  assert.equal(isQuestUnlocked('q02', {}), false);
  assert.equal(isQuestUnlocked('q02', { stars: { q01: 2 } }), true);
  assert.equal(nextQuestId('q20'), null);
  assert.equal(nextQuestId('q01'), 'q02');
  assert.ok(questStats({ stars: { q01: 3 } }).completed === 1);
  const game = { score: 50, moves: 12, bestCombo: 3 };
  assert.equal(questStars('q01', game) > 0, true);
  assert.equal(meetsQuestGoal({ goal: 'moves', target: 10 }, game), false);
  assert.equal(meetsQuestGoal({ goal: 'combo', target: 3 }, game), true);
});

test('collezione e livelli', () => {
  const empty = emptyCollection();
  assert.equal(normalizeCollection({ cards: null }).cards.length, 0);
  assert.equal(levelFor(0), 1);
  assert.ok(levelFor(500) > 1);
  const next = collectCards(empty, [{ value: '🐶' }, { value: '🐱' }], { stars: 3, theme: 'animals' });
  assert.equal(next.cards.length, 2);
  assert.ok(next.xp > 0);
  const summary = collectionSummary(next);
  assert.equal(summary.count, 2);
  assert.ok(summary.level >= 1);
});
