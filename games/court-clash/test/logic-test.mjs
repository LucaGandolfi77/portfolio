import { test, eq, ok, near, summary } from '../../_kit/test-harness.js';
import { TEAMS } from '../js/data/teams.js';
import { seededRandom } from '../js/core/rng.js';
import {
  winOdds, payout, chestTierForWin, collectionBoost, boostTeam,
  claimDaily, claimComeback, teamStrength, formatCoins
} from '../js/game/economy.js';
import {
  buildCardIndex, rarityFor, cardSet, cardPower, copiesNeeded, coinsNeeded,
  addCard, upgradeCard, collectionPower, setProgress, claimSetRewards,
  drawChestCards, RARITIES, SET_REWARDS, MAX_LEVEL
} from '../js/game/collection.js';
import {
  addChest, startNextChest, isReady, timeLeft, speedUpCost, speedUpChest,
  openChest, chestRewards, chestInfo, formatTime, slotStatus,
  CHEST_LIMIT, PITY_LIMIT
} from '../js/game/chests.js';

const cards = buildCardIndex(TEAMS);
const cardIndex = Object.fromEntries(cards.map(card => [card.id, card]));
const home = { code: 'HOM', players: Array.from({ length: 8 }, (_, i) => ({ id: 'H' + i, ovr: 88 - i })) };
const away = { code: 'AWY', players: Array.from({ length: 8 }, (_, i) => ({ id: 'A' + i, ovr: 78 - i })) };

let passed = 0;
let total = 0;
const run = (name, fn) => {
  total += 1;
  if (test(name, fn)) passed += 1;
};

run('odds favor the stronger team and stay in a sane range', () => {
  const odds = winOdds(home, away);
  ok(odds.home.prob > odds.away.prob);
  ok(odds.home.odds < odds.away.odds);
  ok(odds.home.odds >= 1.15 && odds.home.odds <= 6);
  ok(odds.away.odds >= 1.15 && odds.away.odds <= 6);
});

run('team strength uses the best five players', () => {
  eq(teamStrength(home), 86);
  eq(teamStrength(null), 72);
});

run('payout and chest tier follow stake and risk', () => {
  eq(payout(100, 2), 200);
  eq(chestTierForWin(50, 1.3, 0), 'wood');
  eq(chestTierForWin(100, 1.3, 0), 'silver');
  eq(chestTierForWin(250, 1.3, 0), 'gold');
  eq(chestTierForWin(50, 1.9, 0), 'silver');
  eq(chestTierForWin(50, 1.9, 3), 'gold');
  eq(chestTierForWin(250, 1.9, 3), 'legendary');
});

run('collection boost is one point per 1500 power and caps at five', () => {
  eq(collectionBoost(0), 0);
  eq(collectionBoost(1499), 0);
  eq(collectionBoost(1500), 1);
  eq(collectionBoost(7500), 5);
  eq(collectionBoost(99999), 5);
});

run('boostTeam copies the team and raises the top eight players without exceeding 99', () => {
  const original = teamStrength(home);
  const boosted = boostTeam(home, 5);
  ok(boosted !== home);
  eq(teamStrength(home), original);
  ok(teamStrength(boosted) > original);
  boosted.players.forEach(p => ok(p.ovr <= 99 && p.off <= 99 && p.def <= 99));
});

run('daily and comeback coins are once per day', () => {
  const wallet = { coins: 10 };
  eq(claimDaily(wallet, '2026-01-01'), 500);
  eq(claimDaily(wallet, '2026-01-01'), 0);
  eq(wallet.coins, 510);
  eq(claimComeback(wallet, '2026-01-01'), 0);
  wallet.coins = 10;
  eq(claimComeback(wallet, '2026-01-01'), 100);
  eq(claimComeback(wallet, '2026-01-01'), 0);
});

run('card rarity, sets and power follow OVR/age rules', () => {
  eq(rarityFor(70), 'common');
  eq(rarityFor(82), 'rare');
  eq(rarityFor(90), 'epic');
  eq(rarityFor(96), 'legendary');
  eq(cardSet({ age: 22, ovr: 70 }), 'rookies');
  eq(cardSet({ age: 30, ovr: 90 }), 'allstar');
  eq(cardSet({ age: 30, ovr: 93 }), 'champions');
  eq(cardSet({ age: 30, ovr: 96 }), 'legends');
  eq(cardPower({ ovr: 90 }, 1), 90);
  eq(cardPower({ ovr: 98 }, 5), 99);
  eq(copiesNeeded(1), 2);
  eq(copiesNeeded(4), 16);
  eq(coinsNeeded(1), 100);
  eq(coinsNeeded(4), 1000);
});

run('new cards, duplicates and max-level overflow coins are handled', () => {
  const collection = {};
  const first = addCard(collection, 'C1');
  eq(first.status, 'new');
  eq(collection.C1.level, 1);
  const duplicate = addCard(collection, 'C1');
  eq(duplicate.status, 'copy');
  eq(collection.C1.copies, 1);
  collection.C1.level = MAX_LEVEL;
  const overflow = addCard(collection, 'C1');
  eq(overflow.status, 'max');
  ok(overflow.coins > 0);
});

run('upgrading consumes copies and coins and respects the level cap', () => {
  const collection = { C1: { level: 1, copies: 2, isNew: false } };
  const upgraded = upgradeCard(collection, 'C1', 500);
  eq(upgraded.ok, true);
  eq(upgraded.level, 2);
  eq(collection.C1.copies, 0);
  eq(upgraded.coins, 400);
  const fail = upgradeCard(collection, 'C1', 0);
  eq(fail.ok, false);
  collection.C1.level = MAX_LEVEL;
  eq(upgradeCard(collection, 'C1', 9999).reason, 'max');
});

run('collection power and set progress reflect owned cards', () => {
  const collection = {
    [cards[0].id]: { level: 2, copies: 0, isNew: false },
    [cards[1].id]: { level: 1, copies: 0, isNew: false }
  };
  const power = collectionPower(collection, cardIndex);
  eq(power, cardPower(cards[0], 2) + cardPower(cards[1], 1));
  const progress = setProgress(collection, cards);
  const ownedTotal = Object.values(progress).reduce((sum, p) => sum + p.owned, 0);
  eq(ownedTotal, 2);
  ok(Object.values(progress).every(p => p.total > 0));
});

run('completing a set grants a one-time coin reward', () => {
  const key = 'base';
  const setCards = cards.filter(card => card.set === key);
  const collection = Object.fromEntries(setCards.map(card => [card.id, { level: 1, copies: 0, isNew: false }]));
  const claimed = {};
  const first = claimSetRewards(collection, cards, claimed);
  ok(first.coins >= SET_REWARDS[key]);
  const second = claimSetRewards(collection, cards, claimed);
  eq(second.coins, 0);
});

run('chest card draws return the right count and rarity floor', () => {
  const collection = {};
  const rng = seededRandom(42);
  const wood = drawChestCards('wood', cards, collection, rng);
  eq(wood.length, 3);
  const gold = drawChestCards('gold', cards, collection, rng);
  eq(gold.length, 4);
  ok(gold.some(card => RARITIES[card.rarity].rank >= RARITIES.epic.rank));
  const legendary = drawChestCards('legendary', cards, collection, rng);
  eq(legendary.length, 5);
  ok(legendary.some(card => card.rarity === 'legendary'));
});

run('chest rewards apply pity and guarantee a legendary at the limit', () => {
  const collection = {};
  const rng = seededRandom(7);
  const normal = chestRewards('gold', cards, collection, 0, rng);
  ok(normal.cards.length >= 4);
  ok(normal.pity >= 0 && normal.pity <= PITY_LIMIT);
  const guarantee = chestRewards('gold', cards, collection, PITY_LIMIT - 1, rng);
  ok(guarantee.cards.some(card => card.rarity === 'legendary'));
  eq(guarantee.pity, 0);
  eq(guarantee.guaranteed, true);
});

run('chest slots enforce the limit and start the first timer', () => {
  const slots = [];
  const now = 1000;
  const first = addChest(slots, 'wood', now);
  eq(first.ok, true);
  eq(slots.length, 1);
  eq(slots[0].unlockAt, now + chestInfo('wood').durationMs);
  for (let i = 1; i < CHEST_LIMIT; i++) addChest(slots, 'silver', now);
  eq(slots.length, CHEST_LIMIT);
  eq(addChest(slots, 'gold', now).reason, 'full');
});

run('chest time, speed-up and open work together', () => {
  const now = 5000;
  const slots = [];
  addChest(slots, 'silver', now);
  const chest = slots[0];
  eq(slotStatus(chest, now), 'unlocking');
  ok(timeLeft(chest, now) > 0);
  const cost = speedUpCost(chest, now);
  ok(cost > 0);
  const speed = speedUpChest(slots, 99999, now);
  eq(speed.ok, true);
  eq(isReady(chest, now), true);
  eq(slotStatus(chest, now), 'ready');
  const opened = openChest(slots, now);
  eq(opened.ok, true);
  eq(slots.length, 0);
});

run('only one chest unlocks at a time and queued ones start after opening', () => {
  const now = 1000;
  const slots = [];
  addChest(slots, 'wood', now);
  addChest(slots, 'gold', now + 1);
  ok(slots[0].unlockAt);
  eq(slots[1].unlockAt, null);
  slots[0].unlockAt = now - 1;
  openChest(slots, now);
  ok(slots[0].unlockAt > now);
  eq(slots.length, 1);
});

run('time and coin formatting stay readable', () => {
  eq(formatTime(30_000), '0:30');
  eq(formatTime(3_600_000), '1:00:00');
  eq(formatCoins(1500), '1,500');
});

summary(passed, total);
