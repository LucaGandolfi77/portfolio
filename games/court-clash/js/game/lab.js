/* Court Clash — rotating Card Lab, wildcards and daily login */

import { RARITIES, rarityRank } from './collection.js';

export const LAB_PRICES = {
  common: 80,
  rare: 200,
  epic: 450,
  legendary: 900
};

export const LOGIN_REWARDS = [
  { coins: 100 },
  { wildcards: { common: 1 } },
  { coins: 150 },
  { wildcards: { rare: 1 } },
  { coins: 200 },
  { wildcards: { epic: 1 } },
  { coins: 500, wildcards: { rare: 1 } }
];

export function applyReward(data, reward) {
  const coins = (reward && reward.coins) || 0;
  data.wallet.coins = (data.wallet.coins || 0) + coins;
  for (const [rarity, amount] of Object.entries((reward && reward.wildcards) || {})) {
    data.wildcards[rarity] = (data.wildcards[rarity] || 0) + amount;
  }
  return { coins, wildcards: (reward && reward.wildcards) || {} };
}

function pick(list, rng) {
  return list[Math.floor(rng() * list.length) % list.length];
}

function pickFromTier(cards, rarities) {
  const pool = cards.filter(card => rarities.includes(card.rarity));
  return pool.length ? pick(pool, Math.random) : null;
}

export function refreshLab(data, cards, today, rng = Math.random) {
  data.lab = data.lab || {};
  if (data.lab.date === today && Array.isArray(data.lab.offers) && data.lab.offers.length === 3) return data.lab;
  const tiers = [['common', 'rare'], ['rare', 'epic'], ['epic', 'legendary']];
  const offers = [];
  const used = new Set();
  for (const tier of tiers) {
    const pool = cards.filter(card => tier.includes(card.rarity) && !used.has(card.id));
    const card = pool.length ? pool[Math.floor(rng() * pool.length) % pool.length] : pickFromTier(cards, tier);
    if (!card || used.has(card.id)) continue;
    used.add(card.id);
    offers.push({
      cardId: card.id,
      rarity: card.rarity,
      price: LAB_PRICES[card.rarity] || 100,
      sold: false
    });
  }
  data.lab = { date: today, offers, freeClaimed: false };
  return data.lab;
}

export function buyLabOffer(data, index) {
  const offer = data.lab && data.lab.offers ? data.lab.offers[index] : null;
  if (!offer || offer.sold) return { ok: false, reason: 'sold' };
  if ((data.wallet.coins || 0) < offer.price) return { ok: false, reason: 'coins', offer };
  data.wallet.coins -= offer.price;
  offer.sold = true;
  return { ok: true, offer };
}

export function useWildcard(data, cardId, cardsById, collection) {
  const card = cardsById[cardId];
  const entry = collection[cardId];
  if (!card || !entry) return { ok: false, reason: 'missing' };
  const rarity = card.rarity;
  if (!(data.wildcards[rarity] > 0)) return { ok: false, reason: 'wildcard', rarity };
  data.wildcards[rarity] -= 1;
  return { ok: true, rarity, card };
}

export function wildcardTotal(data) {
  return Object.values(data.wildcards || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

export function claimLogin(data, today) {
  data.login = data.login || { day: 0, last: '' };
  if (data.login.last === today) return null;
  const nextDay = data.login.last ? (data.login.day % 7) + 1 : 1;
  const reward = LOGIN_REWARDS[nextDay - 1];
  data.login.day = nextDay;
  data.login.last = today;
  applyReward(data, reward);
  return { day: nextDay, reward };
}

export function labRarityLabel(rarity) {
  return RARITIES[rarity] ? RARITIES[rarity].label : rarity;
}

export function labRarityRank(rarity) {
  return rarityRank(rarity);
}
