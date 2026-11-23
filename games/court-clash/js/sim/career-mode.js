/* Career mode: rarity tiers, chests and guess-the-result rewards (pure) */

export const RARITIES = {
  common: { label: 'Common', min: 0, color: '#9fb3c7', weight: 50, xp: 20 },
  rare: { label: 'Rare', min: 80, color: '#4de8ff', weight: 30, xp: 45 },
  epic: { label: 'Epic', min: 88, color: '#a78bfa', weight: 15, xp: 90 },
  legendary: { label: 'Legendary', min: 95, color: '#ffd166', weight: 5, xp: 180 }
};

const ORDER = ['common', 'rare', 'epic', 'legendary'];

export function rarityFor(ovr) {
  if (ovr >= RARITIES.legendary.min) return 'legendary';
  if (ovr >= RARITIES.epic.min) return 'epic';
  if (ovr >= RARITIES.rare.min) return 'rare';
  return 'common';
}

export function rarityRank(rarity) { return Math.max(0, ORDER.indexOf(rarity)); }

export function chestTier(streak = 0, rng = Math.random) {
  const roll = rng() * 100;
  const bonus = Math.min(18, Math.max(0, streak) * 3);
  let acc = 0;
  for (const key of ORDER) {
    const weight = RARITIES[key].weight + (key === 'legendary' ? bonus / 4 : key === 'epic' ? bonus / 2 : 0);
    acc += weight;
    if (roll < acc) return key;
  }
  return 'common';
}

export function poolByRarity(teams, rarity) {
  return teams.flatMap(t => t.players.map(p => ({ ...p, team: t.code, rarity: rarityFor(p.ovr) })))
    .filter(p => p.rarity === rarity);
}

export function chestReward(tier, teams, collection = [], rng = Math.random, duplicateRate = 0.18) {
  const all = poolByRarity(teams, tier);
  const fresh = all.filter(p => !collection.includes(p.id));
  const owned = all.filter(p => collection.includes(p.id));
  let player = null;
  let duplicate = false;
  if (owned.length && rng() < duplicateRate) {
    player = owned[Math.floor(rng() * owned.length) % owned.length];
    duplicate = true;
  } else if (fresh.length) {
    player = fresh[Math.floor(rng() * fresh.length) % fresh.length];
  } else if (owned.length) {
    player = owned[Math.floor(rng() * owned.length) % owned.length];
    duplicate = true;
  }
  if (!player) return { player: null, duplicate: true, xp: RARITIES[tier].xp };
  return { player, duplicate, xp: RARITIES[tier].xp };
}

export function guessOutcome(pick, winner) { return pick === winner; }

export function applyGuess(career, pick, winner, reward) {
  const correct = guessOutcome(pick, winner);
  career.guesses = (career.guesses || 0) + 1;
  if (correct) {
    career.wins = (career.wins || 0) + 1;
    career.streak = (career.streak || 0) + 1;
  } else {
    career.streak = 0;
  }
  career.chests = (career.chests || 0) + (reward ? 1 : 0);
  if (reward && reward.player && !career.collection.includes(reward.player.id)) {
    career.collection.push(reward.player.id);
  }
  career.xp += reward ? reward.xp : 10;
  career.level = 1 + Math.floor(Math.sqrt(Math.max(0, career.xp) / 120));
  return { correct, reward };
}
