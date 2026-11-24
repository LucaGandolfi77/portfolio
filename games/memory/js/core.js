/**
 * core.js — logica pura di Memory Garden (testabile in Node).
 */

import { DIFFICULTIES, findDeck, findMode, findQuest } from './config.js';

export const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
export const pick = (list, rng = Math.random) => list[Math.floor(rng() * list.length)];

export function mulberry32(seed) {
  let state = (Number(seed) || 1) >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function dailySeed(date = new Date()) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function shuffled(list, rng = Math.random) {
  const result = list.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const index = Math.floor(rng() * (i + 1));
    [result[i], result[index]] = [result[index], result[i]];
  }
  return result;
}

export function findDifficulty(id) {
  return DIFFICULTIES.find((item) => item.id === id) || DIFFICULTIES[0];
}

export function boardCards({ diff = 'easy', deck = 'animals', seed = null, pairs = null } = {}) {
  const config = findDifficulty(diff);
  const count = pairs || (config.rows * config.cols) / 2;
  const icons = findDeck(deck).icons;
  const values = [];
  for (let i = 0; i < count; i += 1) values.push(icons[i % icons.length]);
  const rng = seed === null ? Math.random : mulberry32(seed);
  return shuffled([...values, ...values], rng).map((value, index) => ({
    id: index, value, flipped: false, matched: false, gold: false, hidden: false
  }));
}

export function createGame({ mode = 'classic', diff = 'easy', deck = 'animals', seed = null, questId = null } = {}) {
  const quest = questId ? findQuest(questId) : null;
  const config = findMode(mode);
  return {
    mode, diff, deck, seed, questId,
    cards: boardCards({ diff, deck, seed, pairs: quest ? quest.pairs : null }),
    flipped: [], matched: 0, moves: 0, mistakes: 0,
    score: 0, combo: 0, bestCombo: 0,
    time: config.time || 0, freeze: 0, gold: false, fog: false,
    busy: false, over: false,
    players: [{ name: 'P1', score: 0 }, { name: 'P2', score: 0 }],
    turn: 0,
    powers: { peek: 2, shuffle: 2, freeze: 1, hint: 3 }
  };
}

export function comboMultiplier(combo) {
  return 1 + Math.min(9, Math.floor(combo / 2));
}

export function scorePair(state, { seconds = 0, gold = false } = {}) {
  const multiplier = comboMultiplier(state.combo);
  const speedBonus = Math.max(0, 5 - Math.floor(seconds));
  const value = (10 + speedBonus) * multiplier * (gold || state.gold ? 2 : 1);
  state.score += value;
  state.gold = false;
  return value;
}

export function registerMismatch(state) {
  state.mistakes += 1;
  state.combo = 0;
}

export function isComplete(state) {
  return state.cards.length > 0 && state.cards.every((card) => card.matched);
}

export function starRating(score, thresholds = [10, 20, 30]) {
  if (score >= thresholds[2]) return 3;
  if (score >= thresholds[1]) return 2;
  if (score >= thresholds[0]) return 1;
  return 0;
}

export function progress(state) {
  const total = state.cards.length / 2;
  return total ? clamp(state.matched / total, 0, 1) : 0;
}

export function mirrorIndexes(index, columns, mirrored = true) {
  if (!mirrored) return index;
  const row = Math.floor(index / columns);
  const column = index % columns;
  return row * columns + (columns - 1 - column);
}
