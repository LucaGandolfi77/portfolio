/* Card Collector — collection, upgrades and deck management */

import { state, commit } from './state.js';
import { CARD_BY_ID, CARDS, RARITY } from './data.js';
import { toast } from './effects.js';
import { progressQuest } from './economy.js';

export const DECK_LIMITS = { mega: 8, scopa: 12 };

export function getUpgradeRequirement(level) { return level * 5; }

export function cardPower(card, level = 1) {
  const scale = 1 + (level - 1) * 0.2;
  return {
    attack: Math.floor(card.attack * scale),
    defense: Math.floor(card.defense * scale)
  };
}

export function upgradeCard(id) {
  const entry = state.data.collection[id];
  if (!entry) return false;
  const needed = getUpgradeRequirement(entry.level);
  if (entry.count < needed) {
    toast('notEnoughDuplicates', 'error');
    return false;
  }
  entry.count -= needed;
  entry.level++;
  commit();
  toast('upgraded');
  progressQuest('cards', 1);
  return true;
}

export function activeDeck(mode = 'mega') {
  return mode === 'scopa' ? state.data.scopaDeck : state.data.deck;
}

export function addToDeck(cardId, mode = 'mega') {
  const deck = activeDeck(mode);
  if (deck.length >= DECK_LIMITS[mode]) {
    toast('deckFull', 'error');
    return false;
  }
  if (deck.includes(cardId)) return false;
  if (!state.data.collection[cardId]) return false;
  deck.push(cardId);
  commit();
  return true;
}

export function removeFromDeck(cardId, mode = 'mega') {
  const key = mode === 'scopa' ? 'scopaDeck' : 'deck';
  state.data[key] = state.data[key].filter(id => id !== cardId);
  commit();
}

export function collectionStats() {
  const d = state.data;
  const owned = Object.keys(d.collection);
  const legendary = owned.filter(id => CARD_BY_ID[Number(id)]?.rarity === 'legendary').length;
  const totalDuplicates = owned.reduce((sum, id) => sum + (d.collection[id].count || 0), 0);
  const byRarity = Object.keys(RARITY).reduce((acc, key) => {
    acc[key] = owned.filter(id => CARD_BY_ID[Number(id)]?.rarity === key).length;
    return acc;
  }, {});
  return { owned: owned.length, legendary, totalDuplicates, byRarity, total: CARDS.length };
}
