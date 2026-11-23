/* Court Clash — chest slots, timers, speed-up and rewards */

import { drawChestCards } from './collection.js';

export const CHEST_LIMIT = 4;
export const PITY_LIMIT = 40;

export const CHEST_TYPES = {
  wood: {
    key: 'wood', name: 'Wood', durationMs: 30_000, cards: 3, coins: 50,
    color: '#b88a5a', glow: '#e0b07a'
  },
  silver: {
    key: 'silver', name: 'Silver', durationMs: 120_000, cards: 3, coins: 150,
    color: '#b9c8dc', glow: '#e8f2ff'
  },
  gold: {
    key: 'gold', name: 'Gold', durationMs: 600_000, cards: 4, coins: 400,
    color: '#ffd166', glow: '#ffe8a3'
  },
  legendary: {
    key: 'legendary', name: 'Legendary', durationMs: 1_800_000, cards: 5, coins: 1000,
    color: '#ff9f1c', glow: '#ffc46b'
  }
};

export const CHEST_ORDER = ['wood', 'silver', 'gold', 'legendary'];

export function chestInfo(type) {
  return CHEST_TYPES[type] || CHEST_TYPES.wood;
}

export function createChest(type, now = Date.now()) {
  const info = chestInfo(type);
  return {
    id: `chest-${now}-${Math.floor(Math.random() * 100000)}`,
    type: info.key,
    createdAt: now,
    unlockAt: null
  };
}

export function startNextChest(slots, now = Date.now()) {
  if (!Array.isArray(slots) || !slots.length) return false;
  if (slots[0].unlockAt) return false;
  slots[0].unlockAt = now + chestInfo(slots[0].type).durationMs;
  return true;
}

export function addChest(slots, type, now = Date.now()) {
  if (!Array.isArray(slots)) return { ok: false, reason: 'invalid' };
  if (slots.length >= CHEST_LIMIT) return { ok: false, reason: 'full' };
  const chest = createChest(type, now);
  slots.push(chest);
  if (slots.length === 1) startNextChest(slots, now);
  return { ok: true, chest, slots };
}

export function isReady(chest, now = Date.now()) {
  return !!chest && !!chest.unlockAt && chest.unlockAt <= now;
}

export function timeLeft(chest, now = Date.now()) {
  if (!chest || !chest.unlockAt) return 0;
  return Math.max(0, chest.unlockAt - now);
}

export function speedUpCost(chest, now = Date.now()) {
  const remaining = timeLeft(chest, now);
  return Math.max(1, Math.ceil(remaining / 1000) * 2);
}

export function speedUpChest(slots, coins, now = Date.now()) {
  const chest = slots[0];
  if (!chest) return { ok: false, reason: 'empty' };
  if (isReady(chest, now)) return { ok: true, chest, cost: 0, coins };
  const cost = speedUpCost(chest, now);
  if (coins < cost) return { ok: false, reason: 'coins', cost };
  chest.unlockAt = now;
  return { ok: true, chest, cost, coins: coins - cost };
}

export function openChest(slots, now = Date.now()) {
  const chest = slots[0];
  if (!chest) return { ok: false, reason: 'empty' };
  if (!isReady(chest, now)) return { ok: false, reason: 'locked' };
  slots.shift();
  startNextChest(slots, now);
  return { ok: true, chest, slots };
}

export function chestRewards(tier, players, collection, pity = 0, rng = Math.random) {
  const guaranteed = (pity + 1) >= PITY_LIMIT;
  const cards = drawChestCards(tier, players, collection, rng, guaranteed ? 'legendary' : null);
  const gotLegendary = cards.some(card => card.rarity === 'legendary');
  const nextPity = gotLegendary ? 0 : pity + (guaranteed ? 0 : 1);
  return {
    cards,
    coins: chestInfo(tier).coins,
    pity: nextPity,
    guaranteed: guaranteed || gotLegendary
  };
}

export function formatTime(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function slotStatus(chest, now = Date.now()) {
  if (!chest) return 'empty';
  if (!chest.unlockAt) return 'queued';
  if (isReady(chest, now)) return 'ready';
  return 'unlocking';
}
