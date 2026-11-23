/* Court Clash — card collection, duplicates, upgrades, sets and chest draws */

export const RARITIES = {
  common: { key: 'common', label: 'Common', color: '#9fb3c7', rank: 0 },
  rare: { key: 'rare', label: 'Rare', color: '#4de8ff', rank: 1 },
  epic: { key: 'epic', label: 'Epic', color: '#a78bfa', rank: 2 },
  legendary: { key: 'legendary', label: 'Legendary', color: '#ffd166', rank: 3 }
};

export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'];

export const SETS = {
  rookies: { key: 'rookies', name: 'Rookie Class', color: '#4de8ff' },
  allstar: { key: 'allstar', name: 'All-Star', color: '#a78bfa' },
  champions: { key: 'champions', name: 'Champions', color: '#ffd166' },
  legends: { key: 'legends', name: 'Legends', color: '#ff9f1c' },
  base: { key: 'base', name: 'Base', color: '#9fb3c7' }
};

export const SET_REWARDS = {
  rookies: 500,
  allstar: 1000,
  champions: 2000,
  legends: 3000,
  base: 750
};

export const COPIES_NEEDED = [2, 4, 8, 16];
export const COINS_NEEDED = [100, 250, 500, 1000];
export const MAX_LEVEL = 5;
export const EXTRA_COPY_COINS = 30;

const CHEST_WEIGHTS = {
  wood: { common: 72, rare: 24, epic: 3.5, legendary: 0.5 },
  silver: { common: 46, rare: 40, epic: 11, legendary: 3 },
  gold: { common: 20, rare: 45, epic: 27, legendary: 8 },
  legendary: { common: 0, rare: 24, epic: 46, legendary: 30 }
};

const CHEST_FLOOR = {
  wood: 'common',
  silver: 'rare',
  gold: 'epic',
  legendary: 'legendary'
};

export const CHEST_CARD_COUNT = {
  wood: 3,
  silver: 3,
  gold: 4,
  legendary: 5
};

export function rarityFor(ovr) {
  if (ovr >= 95) return 'legendary';
  if (ovr >= 88) return 'epic';
  if (ovr >= 80) return 'rare';
  return 'common';
}

export function rarityRank(rarity) {
  return Math.max(0, RARITY_ORDER.indexOf(rarity));
}

export function cardSet(player) {
  if (player.age <= 24) return 'rookies';
  if (player.ovr >= 95) return 'legends';
  if (player.ovr >= 92) return 'champions';
  if (player.ovr >= 88) return 'allstar';
  return 'base';
}

export function cardPower(player, level = 1) {
  return Math.min(99, (player.ovr || 0) + Math.min(5, Math.max(0, level - 1)));
}

export function copiesNeeded(level) {
  return COPIES_NEEDED[Math.max(0, Math.min(COPIES_NEEDED.length - 1, level - 1))];
}

export function coinsNeeded(level) {
  return COINS_NEEDED[Math.max(0, Math.min(COINS_NEEDED.length - 1, level - 1))];
}

export function buildCardIndex(teams) {
  return teams.flatMap(team => team.players.map(player => ({
    ...player,
    teamCode: team.code,
    teamName: team.name,
    teamColor: team.color,
    rarity: rarityFor(player.ovr),
    set: cardSet(player)
  })));
}

export function addCard(collection, cardId) {
  if (!collection[cardId]) {
    collection[cardId] = { level: 1, copies: 0, isNew: true };
    return { status: 'new', copies: 0 };
  }
  const entry = collection[cardId];
  if (entry.level >= MAX_LEVEL) {
    return { status: 'max', coins: EXTRA_COPY_COINS };
  }
  entry.copies += 1;
  return { status: 'copy', copies: entry.copies };
}

export function upgradeCard(collection, cardId, coins) {
  const entry = collection[cardId];
  if (!entry) return { ok: false, reason: 'missing' };
  if (entry.level >= MAX_LEVEL) return { ok: false, reason: 'max' };
  const needCopies = copiesNeeded(entry.level);
  const needCoins = coinsNeeded(entry.level);
  if (entry.copies < needCopies || coins < needCoins) {
    return { ok: false, reason: 'resources', needCopies, needCoins };
  }
  entry.copies -= needCopies;
  entry.level += 1;
  return {
    ok: true,
    level: entry.level,
    copies: entry.copies,
    coins: coins - needCoins,
    needCopies,
    needCoins
  };
}

export function collectionPower(collection, cardIndex) {
  let total = 0;
  for (const [id, entry] of Object.entries(collection || {})) {
    const card = cardIndex[id];
    if (!card) continue;
    total += cardPower(card, entry.level);
  }
  return total;
}

export function setProgress(collection, cards) {
  const out = {};
  for (const key of Object.keys(SETS)) {
    const setCards = cards.filter(c => c.set === key);
    const owned = setCards.filter(c => collection[c.id]).length;
    out[key] = {
      key,
      owned,
      total: setCards.length,
      ratio: setCards.length ? owned / setCards.length : 0
    };
  }
  return out;
}

export function claimSetRewards(collection, cards, claimed = {}) {
  const progress = setProgress(collection, cards);
  let coins = 0;
  const won = [];
  for (const [key, p] of Object.entries(progress)) {
    if (p.total > 0 && p.owned >= p.total && !claimed[key]) {
      claimed[key] = true;
      coins += SET_REWARDS[key] || 0;
      won.push(key);
    }
  }
  return { coins, won, claimed };
}

function pickRarity(tier, rng) {
  const weights = CHEST_WEIGHTS[tier] || CHEST_WEIGHTS.wood;
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (const rarity of RARITY_ORDER) {
    roll -= weights[rarity];
    if (roll < 0) return rarity;
  }
  return 'common';
}

function poolByRarity(cards, rarity) {
  return cards.filter(c => c.rarity === rarity);
}

function pickCard(cards, rarity, collection, rng, used) {
  const pool = poolByRarity(cards, rarity);
  if (!pool.length) return null;
  const available = pool.filter(c => !used.has(c.id));
  const source = available.length ? available : pool;
  const owned = source.filter(c => collection[c.id]);
  const fresh = source.filter(c => !collection[c.id]);
  let list = source;
  // Bias toward owned cards so duplicates actually make upgrades possible
  // with a 300-card pool.
  if (owned.length && (rng() < 0.55 || !fresh.length)) list = owned;
  else if (fresh.length) list = fresh;
  const card = list[Math.floor(rng() * list.length) % list.length];
  used.add(card.id);
  return card;
}

export function drawChestCards(tier, cards, collection, rng = Math.random, forceRarity = null) {
  const count = CHEST_CARD_COUNT[tier] || 3;
  const floor = CHEST_FLOOR[tier] || 'common';
  const used = new Set();
  let picks = [];
  for (let i = 0; i < count; i++) {
    const rarity = pickRarity(tier, rng);
    const card = pickCard(cards, rarity, collection, rng, used);
    if (card) picks.push(card);
  }
  const floorRank = rarityRank(floor);
  const hasFloor = picks.some(c => rarityRank(c.rarity) >= floorRank);
  if (!hasFloor) {
    const card = pickCard(cards, floor, collection, rng, used);
    if (card) {
      if (picks.length >= count) picks[picks.length - 1] = card;
      else picks.push(card);
    }
  }
  if (forceRarity) {
    const card = pickCard(cards, forceRarity, collection, rng, used);
    if (card) {
      if (picks.length >= count) picks[picks.length - 1] = card;
      else picks.push(card);
    }
  }
  return picks.map(card => ({
    ...card,
    isNew: !collection[card.id],
    level: collection[card.id]?.level || 1
  }));
}
