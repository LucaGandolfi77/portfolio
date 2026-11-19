/* Card Collector — box purchase, guarantees and card generation */

import { state, commit, addCard } from './state.js';
import { CARDS, RARITY } from './data.js';
import { spend, addXP, progressQuest } from './economy.js';
import { celebrate, toast } from './effects.js';

const BASE_CHANCES = { legendary: 3, epic: 12, rare: 25, common: 60 };

function pickRarity(box, index) {
  if (box.guaranteedLegendaryCount && index < box.guaranteedLegendaryCount) return 'legendary';
  if (box.guaranteedLegendary && index === 0) return 'legendary';
  if (box.guaranteedEpic && index === (box.guaranteedLegendary ? 1 : 0)) return 'epic';
  if (box.guaranteedRare && index === (box.guaranteedLegendary ? 2 : box.guaranteedEpic ? 1 : 0)) return 'rare';
  const roll = Math.random() * 100;
  let acc = 0;
  for (const rarity of ['legendary', 'epic', 'rare', 'common']) {
    acc += BASE_CHANCES[rarity];
    if (roll < acc) return rarity;
  }
  return 'common';
}

export function generateBoxCards(box) {
  const cards = [];
  for (let i = 0; i < box.cards; i++) {
    const rarity = pickRarity(box, i);
    const pool = CARDS.filter(c => c.rarity === rarity);
    cards.push(pool[Math.floor(Math.random() * pool.length)] || CARDS[0]);
  }
  return cards;
}

export function openBox(box, currency = 'gold') {
  const price = currency === 'gems' ? box.gemsPrice : box.goldPrice;
  if (!spend(currency, price)) return null;

  const cards = generateBoxCards(box);
  cards.forEach(card => addCard(card.id));
  state.data.boxesOpened++;
  state.data.stats.boxes++;
  commit();

  addXP(10 + box.cards * 2);
  progressQuest('boxes', 1);
  progressQuest('cards', cards.length);

  const special = cards.some(c => c.rarity === 'epic' || c.rarity === 'legendary');
  if (special) celebrate();
  toast(special ? 'legendaryPull' : 'boxOpened');
  return cards;
}

export function rarityColor(rarity) { return (RARITY[rarity] || RARITY.common).color; }
