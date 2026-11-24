import { test, eq, ok, summary } from '../../_kit/test-harness.js';
import { TEAMS } from '../js/data/teams.js';
import { buildCardIndex, RARITIES, SETS } from '../js/game/collection.js';
import {
  unlockedSlots, chemistry, lineupPower, lineupBoost, lineupSummary, autoFill, LINEUP_SIZE
} from '../js/game/lineup.js';
import { buildMarkets, findOption, pickSide, resolveMarket, cashOutOffer } from '../js/game/markets.js';
import {
  arenaFor, nextArena, trophyDelta, claimTrophyRoad, grantAchievements, achievementStats, ARENAS
} from '../js/game/progression.js';
import {
  DAILY_MISSIONS, WEEKLY_MISSIONS, ensureMissions, recordMission, missionProgress,
  claimMission, dailyBonusAvailable, claimDailyBonus
} from '../js/game/missions.js';
import {
  refreshLab, buyLabOffer, useWildcard, claimLogin, LOGIN_REWARDS, wildcardTotal
} from '../js/game/lab.js';
import {
  ensureDailyChallenge, canCompleteDaily, completeDailyChallenge,
  startTournament, tournamentWin, tournamentLoss, TOURNAMENT_ENTRY
} from '../js/game/events.js';
import { defaults, load, save, reset, todayKey } from '../js/core/storage.js';
import { seededRandom } from '../js/core/rng.js';

const cards = buildCardIndex(TEAMS);
const cardsById = Object.fromEntries(cards.map(card => [card.id, card]));

let passed = 0;
let total = 0;
const run = (name, fn) => { total += 1; if (test(name, fn)) passed += 1; };

function sampleCollection(ids, level = 1) {
  return Object.fromEntries(ids.map(id => [id, { level, copies: 0, isNew: false }]));
}

function sampleLineup() {
  const ids = cards.slice(0, 5).map(card => card.id);
  return { ids, collection: sampleCollection(ids) };
}

run('lineup slots unlock at Pro and All-Star', () => {
  eq(unlockedSlots(0), 3);
  eq(unlockedSlots(399), 3);
  eq(unlockedSlots(400), 4);
  eq(unlockedSlots(900), 5);
});

run('lineup chemistry rewards roles, teams and sets', () => {
  const { ids, collection } = sampleLineup();
  const chem = chemistry(ids, cardsById);
  ok(chem.score > 0);
  ok(chem.labels.length === 3);
  ok(chem.role >= 0 && chem.team >= 0 && chem.set >= 0);
});

run('lineup power and boost are bounded', () => {
  const { ids, collection } = sampleLineup();
  const power = lineupPower(ids, cardsById, collection, 4);
  ok(power.power > power.base);
  eq(lineupBoost(0), 0);
  eq(lineupBoost(120), 1);
  eq(lineupBoost(99999), 5);
  const summary = lineupSummary(ids, cardsById, collection);
  ok(summary.boost >= 0 && summary.boost <= 5);
});

run('autoFill returns unique owned cards and respects unlocked slots', () => {
  const { collection } = sampleLineup();
  const filled = autoFill(collection, cardsById, 3);
  eq(filled.length, LINEUP_SIZE);
  eq(filled.slice(3).filter(Boolean).length, 0);
  eq(new Set(filled.filter(Boolean)).size, 3);
});

run('markets expose winner, margin and total options', () => {
  const home = TEAMS[0];
  const away = TEAMS[1];
  const markets = buildMarkets(home, away);
  eq(markets.winner.options.length, 2);
  eq(markets.margin.options.length, 3);
  eq(markets.total.options.length, 2);
  ok(markets.total.line > 150);
  ok(findOption(markets, 'winner', 'home'));
  eq(pickSide('winner', 'home'), 'home');
  eq(pickSide('margin', 'home10'), 'home');
  eq(pickSide('total', 'over'), null);
});

run('market resolution handles winner, margin and total', () => {
  const summary = { winner: 'home', score: { home: 112, away: 99 }, quarters: [{ home: 28, away: 24 }, { home: 30, away: 25 }] };
  eq(resolveMarket('winner', 'home', summary), true);
  eq(resolveMarket('winner', 'away', summary), false);
  eq(resolveMarket('margin', 'home10', summary), true);
  eq(resolveMarket('margin', 'close', summary), false);
  eq(resolveMarket('total', 'over', summary, 200), true);
  eq(resolveMarket('total', 'under', summary, 250), true);
});

run('cash-out offers stay between a token and the full payout', () => {
  const summary = { winner: 'home', score: { home: 112, away: 99 }, quarters: [{ home: 30, away: 20 }, { home: 25, away: 30 }, { home: 28, away: 22 }] };
  const offer = cashOutOffer({ stake: 100, odds: 2, summary, side: 'home', stage: 'HT' });
  ok(offer >= 1 && offer <= 200);
  const late = cashOutOffer({ stake: 100, odds: 2, summary, side: 'home', stage: 'Q3' });
  ok(late >= 1 && late <= 200);
});

run('arena thresholds and trophy deltas work', () => {
  eq(arenaFor(0).key, 'rookie');
  eq(arenaFor(400).key, 'pro');
  eq(arenaFor(900).key, 'allstar');
  eq(arenaFor(2500).key, 'legend');
  eq(nextArena(0).key, 'pro');
  ok(trophyDelta(2.5, true) > trophyDelta(1.3, true));
  ok(trophyDelta(1.3, false) < 0);
});

run('trophy road rewards are claimed once', () => {
  const data = defaults();
  data.trophies = 210;
  const first = claimTrophyRoad(data);
  ok(first.coins > 0);
  ok(first.claimed.length >= 2);
  const second = claimTrophyRoad(data);
  eq(second.coins, 0);
});

run('achievements unlock once and grant rewards', () => {
  const data = defaults();
  data.stats.wins = 1;
  data.stats.chestsOpened = 10;
  const unlocked = grantAchievements(data, cards);
  ok(unlocked.some(a => a.id === 'firstWin'));
  ok(data.wallet.coins > 1000);
  const again = grantAchievements(data, cards);
  eq(again.length, 0);
  const stats = achievementStats(data, cards);
  eq(stats.wins, 1);
});

run('daily missions progress and claim once', () => {
  const data = defaults();
  ensureMissions(data, '2026-01-01', '2026-W01');
  recordMission(data, 'match', 2);
  recordMission(data, 'win', 1);
  recordMission(data, 'chest', 1);
  const play = DAILY_MISSIONS.find(m => m.id === 'play');
  eq(missionProgress(data, 'daily', play).ratio, 1);
  const reward = claimMission(data, 'daily', 'play');
  ok(reward.coins > 0);
  eq(claimMission(data, 'daily', 'play'), null);
  eq(dailyBonusAvailable(data), false);
});

run('daily bonus unlocks after all daily missions are claimed', () => {
  const data = defaults();
  ensureMissions(data, '2026-01-01', '2026-W01');
  recordMission(data, 'match', 2);
  recordMission(data, 'win', 1);
  recordMission(data, 'chest', 1);
  recordMission(data, 'underdogWin', 1);
  DAILY_MISSIONS.forEach(mission => claimMission(data, 'daily', mission.id));
  eq(dailyBonusAvailable(data), true);
  const bonus = claimDailyBonus(data);
  ok(bonus.coins > 0);
  eq(claimDailyBonus(data), null);
});

run('weekly missions reset by week key', () => {
  const data = defaults();
  ensureMissions(data, '2026-01-01', '2026-W01');
  recordMission(data, 'win', 10);
  const mission = WEEKLY_MISSIONS.find(m => m.id === 'wins10');
  eq(missionProgress(data, 'weekly', mission).ratio, 1);
  ensureMissions(data, '2026-01-08', '2026-W02');
  eq(missionProgress(data, 'weekly', mission).value, 0);
});

run('Card Lab generates offers and purchases once', () => {
  const data = defaults();
  const lab = refreshLab(data, cards, '2026-01-01', seededRandom(3));
  eq(lab.offers.length, 3);
  const offer = lab.offers[0];
  const before = data.wallet.coins;
  const bought = buyLabOffer(data, 0);
  eq(bought.ok, true);
  eq(data.wallet.coins, before - offer.price);
  eq(buyLabOffer(data, 0).ok, false);
});

run('wildcards are consumed for owned cards of the right rarity', () => {
  const data = defaults();
  data.wildcards.rare = 1;
  const rare = cards.find(card => card.rarity === 'rare');
  const collection = sampleCollection([rare.id]);
  const used = useWildcard(data, rare.id, cardsById, collection);
  eq(used.ok, true);
  eq(data.wildcards.rare, 0);
  eq(useWildcard(data, rare.id, cardsById, collection).ok, false);
  const missing = cards.find(card => !collection[card.id]);
  eq(useWildcard(data, missing.id, cardsById, collection).ok, false);
});

run('daily login advances and pays once per day', () => {
  const data = defaults();
  const first = claimLogin(data, '2026-01-01');
  eq(first.day, 1);
  ok(first.reward);
  eq(claimLogin(data, '2026-01-01'), null);
  const second = claimLogin(data, '2026-01-02');
  eq(second.day, 2);
  eq(LOGIN_REWARDS.length, 7);
  ok(wildcardTotal(data) >= 0);
});

run('daily underdog challenge completes once', () => {
  const data = defaults();
  ensureDailyChallenge(data, '2026-01-01');
  eq(canCompleteDaily(data, 1.5, true), false);
  eq(canCompleteDaily(data, 2.1, true), true);
  const reward = completeDailyChallenge(data, '2026-01-01');
  ok(reward.coins > 0);
  eq(completeDailyChallenge(data, '2026-01-01'), null);
});

run('tournament charges entry and completes after three wins', () => {
  const data = defaults();
  data.wallet.coins = 1000;
  eq(startTournament(data).ok, true);
  eq(data.wallet.coins, 1000 - TOURNAMENT_ENTRY);
  eq(tournamentWin(data).advance, true);
  eq(tournamentWin(data).advance, true);
  const final = tournamentWin(data);
  eq(final.complete, true);
  ok(data.wallet.coins > 750);
  eq(data.stats.tournamentsWon, 1);
  data.wallet.coins = 1000;
  startTournament(data);
  eq(tournamentLoss(data).failed, true);
  eq(data.tournament.active, false);
});

run('storage migrates v1 saves to v2 and round-trips', () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: key => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: key => store.delete(key)
  };
  store.set('pf.courtclash.v1', JSON.stringify({
    version: 1,
    wallet: { coins: 777, dailyClaimed: '', comebackClaimed: '' },
    collection: { 'BOS-1': { level: 2, copies: 1, isNew: false } },
    chests: { slots: [], pity: 2, opened: 5, tutorialGiven: true },
    setsClaimed: {},
    streak: 2,
    bestStreak: 4,
    wins: 7,
    losses: 3,
    history: [],
    settings: { lang: 'it', sound: false, onboarded: true },
    matchup: null
  }));
  const loaded = load();
  eq(loaded.version, 2);
  eq(loaded.wallet.coins, 777);
  eq(loaded.stats.wins, 7);
  eq(loaded.stats.losses, 3);
  eq(loaded.stats.bestStreak, 4);
  eq(loaded.stats.chestsOpened, 5);
  eq(loaded.settings.lang, 'it');
  ok(loaded.lineup.slots.length === 5);
  save(loaded);
  const again = load();
  eq(again.wallet.coins, 777);
  reset();
  eq(store.has('pf.courtclash.v2'), false);
  eq(store.has('pf.courtclash.v1'), false);
});

summary(passed, total);
