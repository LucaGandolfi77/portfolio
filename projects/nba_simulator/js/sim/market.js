/* AI-driven duplicate card market (pure) */

import { rarityRank, rarityFor } from './career-mode.js';

const BASE = { common: 25, rare: 60, epic: 140, legendary: 320 };

export function aiOffer(player, rng = Math.random, day = 0) {
  const rarity = rarityFor(player.ovr);
  const base = BASE[rarity] || 25;
  const ovrBonus = Math.max(0, player.ovr - 70) * 3;
  const demand = 0.85 + rng() * 0.5 + Math.sin(day / 7) * 0.08;
  return Math.round((base + ovrBonus) * demand);
}

export function canSell(career, player) {
  return ((career.duplicates || {})[player.id] || 0) > 0;
}

export function sellDuplicate(career, player, offer) {
  if (!canSell(career, player)) return { ok: false };
  career.duplicates[player.id] -= 1;
  career.credits = (career.credits || 0) + offer;
  return { ok: true, offer, credits: career.credits };
}
