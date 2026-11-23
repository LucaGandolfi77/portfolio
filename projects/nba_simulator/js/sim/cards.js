/* Collectible card sets, fragments, upgrades and daily chests (pure) */

import { rarityFor, rarityRank, RARITIES } from './career-mode.js';

export const PITY_LIMIT = 40;

export const SETS = {
  rookies: { name: 'Rookie Class', maxAge: 24, accent: '#4de8ff' },
  allstar: { name: 'All-Star', minOvr: 88, accent: '#a78bfa' },
  champions: { name: 'Champions', minOvr: 92, accent: '#ffd166' },
  legends: { name: 'Legends', minOvr: 95, accent: '#ff9f1c' },
  base: { name: 'Base', accent: '#9fb3c7' }
};

export function cardSet(player) {
  if (player.age <= SETS.rookies.maxAge) return 'rookies';
  if (player.ovr >= SETS.legends.minOvr) return 'legends';
  if (player.ovr >= SETS.champions.minOvr) return 'champions';
  if (player.ovr >= SETS.allstar.minOvr) return 'allstar';
  return 'base';
}

export function fragmentsFor(rarity) {
  return Math.max(1, rarityRank(rarity) * 4 + 1);
}

export function upgradeCost(level) {
  return 10 + Math.max(0, level) * 15;
}

export function applyUpgrade(career, playerId) {
  const current = (career.upgrades || {})[playerId] || 0;
  const cost = upgradeCost(current);
  if ((career.fragments || 0) < cost) return { ok: false, cost };
  career.fragments -= cost;
  career.upgrades = career.upgrades || {};
  career.upgrades[playerId] = current + 1;
  return { ok: true, level: current + 1, cost };
}

export function isDailyChestAvailable(career, today = new Date().toDateString()) {
  return !career.dailyChest || career.dailyChest !== today;
}

export function claimDailyChest(career, today = new Date().toDateString()) {
  if (!isDailyChestAvailable(career, today)) return false;
  career.dailyChest = today;
  return true;
}

export function setProgress(career, teams, setKey) {
  const ids = teams.flatMap(t => t.players).filter(p => cardSet(p) === setKey).map(p => p.id);
  const owned = ids.filter(id => (career.collection || []).includes(id));
  return { owned: owned.length, total: ids.length, ratio: ids.length ? owned.length / ids.length : 0 };
}

export function cardPower(player, level = 0) {
  return Math.min(99, player.ovr + Math.min(5, level));
}

/* Transparent gacha odds; legendary is guaranteed at PITY_LIMIT pulls. */
export function pullOdds(pity = 0) {
  const step = Math.min(1, Math.max(0, pity) / PITY_LIMIT);
  const legendary = RARITIES.legendary.weight + step * 10;
  const epic = RARITIES.epic.weight + step * 12;
  const rare = RARITIES.rare.weight + step * 4;
  const common = Math.max(5, 100 - legendary - epic - rare);
  const total = common + rare + epic + legendary;
  return {
    common: Math.round(common / total * 1000) / 10,
    rare: Math.round(rare / total * 1000) / 10,
    epic: Math.round(epic / total * 1000) / 10,
    legendary: Math.round(legendary / total * 1000) / 10
  };
}

export function pityPull(career, rng = Math.random) {
  career.pity = (career.pity || 0) + 1;
  const guaranteed = career.pity >= PITY_LIMIT;
  const odds = pullOdds(career.pity - 1);
  let roll = rng() * 100;
  let tier = 'common';
  for (const key of ['common', 'rare', 'epic', 'legendary']) {
    if (roll < odds[key]) { tier = key; break; }
    roll -= odds[key];
  }
  if (guaranteed) tier = 'legendary';
  if (tier === 'legendary') career.pity = 0;
  career.pullHistory = career.pullHistory || [];
  career.pullHistory.unshift({ t: Date.now(), tier, guaranteed });
  if (career.pullHistory.length > 12) career.pullHistory.length = 12;
  return { tier, guaranteed, odds };
}

export function craftCost(player) {
  return 40 + 60 * rarityRank(rarityFor(player.ovr));
}

export function craftPlayer(career, player) {
  const cost = craftCost(player);
  if ((career.fragments || 0) < cost) return { ok: false, cost };
  career.fragments -= cost;
  career.collection = career.collection || [];
  if (!career.collection.includes(player.id)) career.collection.push(player.id);
  return { ok: true, cost, player };
}

/* Clash-Royale-style upgrades: copies + credits */
export const COPY_COSTS = [2, 4, 8, 16];
export const CREDIT_COSTS = [100, 250, 500, 1000];

export function copiesNeeded(level) {
  return COPY_COSTS[Math.max(0, Math.min(COPY_COSTS.length - 1, level - 1))];
}

export function creditsNeeded(level) {
  return CREDIT_COSTS[Math.max(0, Math.min(CREDIT_COSTS.length - 1, level - 1))];
}

export function addCopies(career, playerId, amount = 1) {
  career.copies = career.copies || {};
  career.copies[playerId] = (career.copies[playerId] || 0) + amount;
  return career.copies[playerId];
}

export function upgradeWithCopies(career, playerId) {
  const level = ((career.cards || {})[playerId] || 1);
  if (level >= 5) return { ok: false, reason: 'max' };
  const copies = (career.copies || {})[playerId] || 0;
  const needCopies = copiesNeeded(level);
  const needCredits = creditsNeeded(level);
  if (copies < needCopies || (career.credits || 0) < needCredits) {
    return { ok: false, reason: 'resources', needCopies, needCredits };
  }
  career.copies[playerId] = copies - needCopies;
  career.credits -= needCredits;
  career.cards = career.cards || {};
  career.cards[playerId] = level + 1;
  return { ok: true, level: level + 1, needCopies, needCredits };
}

export function setBonus(career, teams, key) {
  const p = setProgress(career, teams, key);
  if (!p.total || p.ratio < 1) return 0;
  return ({ rookies: 0.03, allstar: 0.05, champions: 0.06, legends: 0.08, base: 0.01 })[key] || 0;
}

