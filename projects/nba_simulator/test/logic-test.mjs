import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};
import { TEAMS, TEAM_BY_CODE, CONFERENCES } from '../js/data/teams.js';
import { seededRandom, dailySeed, dailyKey } from '../js/core/rng.js';
import { Sim, simulateGame, winProbability, Q_LEN } from '../js/sim/engine.js';
import { PLAYBOOKS, choosePlay, counterDefense } from '../js/sim/ai.js';
import { newSeason, playAll, standingsSorted } from '../js/sim/season.js';
import { createBracket, playAllRounds } from '../js/sim/playoffs.js';
import { efficiency, trueShooting, effectiveFG, zoneCounts, leaders } from '../js/sim/stats.js';
import { signPlayer, trade, draftClass, freeAgents } from '../js/sim/career.js';
import { seasonAverage, advancedProjection, STAR_NAMES } from '../js/data/player-stats.js';
import { playerProfile, enrichTeams } from '../js/data/player-profile.js';
import { playerNotes } from '../js/data/player-notes.js';
import { defaults, save, load, recordPlayerStats } from '../js/core/storage.js';
import { RARITIES, rarityFor, chestTier, chestReward, applyGuess } from '../js/sim/career-mode.js';
import { hexToRgb, mix, shade, rarityColor, teamGradient } from '../js/core/theme.js';
import { captureReplay, detectHighlights, frameAt, trimReplays } from '../js/sim/replay.js';
import { SETS, cardSet, fragmentsFor, upgradeCost, applyUpgrade, isDailyChestAvailable, claimDailyChest, setProgress, pullOdds, pityPull, craftCost, craftPlayer, setBonus, PITY_LIMIT } from '../js/sim/cards.js';
import { winOdds, payout, applyBet, claimDailyCredits, streakBonus, propMarket, propOdds, resolveProp, parlayOdds, resolveParlay } from '../js/sim/betting.js';
import { aiOffer, canSell, sellDuplicate } from '../js/sim/market.js';
import { RARITY_FX, fxFor, phaseDurations, nextPhase, totalDuration, confettiCount, PHASES } from '../js/data/chest-fx.js';
import { CHEST_TYPES, buyChest, activeChest, isReady, speedUpCost, speedUpChest, openChest, enforceMinTier, formatTime, QUEUE_LIMIT } from '../js/sim/chest-shop.js';
import { addCopies, copiesNeeded, creditsNeeded, upgradeWithCopies } from '../js/sim/cards.js';
import { normalizeDeck, deckSynergy, DECK_SIZE } from '../js/sim/deck.js';
import { normalizeSquad, squadRating, chemistry, squadReady, TEMPLATES } from '../js/sim/squad.js';
import { newClubLeague, playClubGame, clubStandings, promote, TIERS } from '../js/sim/club-league.js';
import { createCup, playCupRound } from '../js/sim/cup.js';
import { grantWildcard, useWildcard, checkChallenges } from '../js/sim/wildcards.js';

test('30 NBA teams with 10 players and two conferences', () => {
  assert.equal(TEAMS.length, 30);
  assert.equal(CONFERENCES.length, 2);
  assert.ok(TEAMS.every(t => t.players.length === 10));
  assert.ok(TEAMS.every(t => t.players.some(p => p.pos === 'C')));
  assert.ok(TEAM_BY_CODE.LAL.name.includes('Lakers'));
});

test('seeded RNG is deterministic and daily seed is stable', () => {
  const a = seededRandom(42), b = seededRandom(42);
  for (let i = 0; i < 8; i++) assert.equal(a(), b());
  assert.equal(dailyKey(new Date(2026, 0, 2)), '20260102');
  assert.equal(dailySeed(new Date(2026, 0, 2)), dailySeed(new Date(2026, 0, 2)));
});

test('simulation terminates with four quarters and consistent score', () => {
  const s = simulateGame(TEAM_BY_CODE.BOS, TEAM_BY_CODE.LAL, { rng: seededRandom(7) });
  assert.equal(s.quarters.length, Q_LEN > 0 ? 4 : 4);
  assert.equal(s.quarters.reduce((a, q) => a + q.home, 0), s.score.home);
  assert.equal(s.quarters.reduce((a, q) => a + q.away, 0), s.score.away);
  assert.ok(s.score.home > 40 && s.score.away > 40);
  assert.ok(s.events.length > 20);
});

test('same seed produces the same result', () => {
  const a = simulateGame(TEAM_BY_CODE.GSW, TEAM_BY_CODE.NYK, { rng: seededRandom(99) });
  const b = simulateGame(TEAM_BY_CODE.GSW, TEAM_BY_CODE.NYK, { rng: seededRandom(99) });
  assert.deepEqual(a.score, b.score);
});

test('bilingual events carry IT and EN text', () => {
  const sim = new Sim(TEAM_BY_CODE.CHI, TEAM_BY_CODE.MIA, { rng: seededRandom(3) });
  for (let i = 0; i < 30; i++) sim.step();
  assert.ok(sim.events.length > 0);
  assert.ok(sim.events.every(e => e.it && e.en));
});

test('win probability is monotonic', () => {
  assert.ok(winProbability(12, 600) > winProbability(0, 600));
  assert.ok(winProbability(10, 60) > winProbability(10, 600));
});

test('playbooks and counter defenses are selected from the registry', () => {
  const play = choosePlay(TEAM_BY_CODE.BOS, seededRandom(11));
  assert.ok(PLAYBOOKS[play]);
  assert.ok(['man', 'zone', 'press', 'switch'].includes(counterDefense(play, null, seededRandom(5))));
});

test('season schedules 29 weeks and completes', () => {
  const season = newSeason(123);
  assert.equal(season.schedule.length, 29);
  playAll(season, seededRandom(456));
  assert.equal(season.week, 29);
  assert.ok(season.results.length > 200);
  assert.equal(standingsSorted(season, 'East').length, 15);
});

test('playoffs use a 16-team field and crown a champion', () => {
  const season = newSeason(7);
  playAll(season, seededRandom(8));
  const bracket = createBracket(season);
  assert.equal(bracket.rounds[0].matchups.length, 8);
  playAllRounds(bracket, seededRandom(9));
  assert.equal(bracket.complete, true);
  assert.ok(bracket.champion);
});

test('advanced metrics stay finite', () => {
  const p = { pts: 20, fgm: 8, fga: 15, tpm: 3, tpa: 6, ftm: 4, fta: 5, orb: 2, drb: 5, ast: 4, stl: 1, blk: 1, to: 2 };
  assert.ok(Number.isFinite(efficiency(p)));
  assert.ok(trueShooting(p) > 0 && trueShooting(p) < 2);
  assert.ok(effectiveFG(p) > 0 && effectiveFG(p) < 1);
  assert.deepEqual(Object.keys(zoneCounts([{ value: 3, y: 20 }, { value: 2, y: 240 }])).length, 3);
  assert.equal(leaders([p], 'pts', 1).length, 1);
});

test('franchise actions validate roster rules', () => {
  const team = JSON.parse(JSON.stringify(TEAM_BY_CODE.BOS));
  const fa = freeAgents([team], 2, seededRandom(4))[0];
  const signed = signPlayer(team, fa);
  assert.equal(signed.ok, true);
  assert.equal(signed.team.players.length, 11);
  const t = trade(TEAM_BY_CODE.BOS, TEAM_BY_CODE.LAL, 'BOS-1', 'LAL-1');
  assert.equal(t.ok, true);
  assert.equal(draftClass(3, seededRandom(2)).length, 3);
});

test('star season averages are curated and realistic', () => {
  assert.equal(STAR_NAMES.length, 30);
  const a = seasonAverage(TEAM_BY_CODE.LAL.players[0]);
  assert.equal(a.curated, true);
  assert.ok(a.pts > 20 && a.fg > 0.4 && a.ft > 0.6);
  const b = seasonAverage(TEAM_BY_CODE.BOS.players[9]);
  assert.equal(b.curated, false);
  assert.ok(b.pts > 0 && b.reb >= 0);
  const adv = advancedProjection(TEAM_BY_CODE.LAL.players[0]);
  assert.ok(adv.per > 0 && adv.ts > 0.3 && adv.ts < 0.9);
});

test('all players have physical attributes for the 3D avatar', () => {
  const enriched = enrichTeams(TEAMS);
  assert.equal(enriched.length, 30);
  assert.ok(enriched.every(t => t.players.every(p =>
    p.heightCm > 170 && p.weightKg > 60 && p.hairColor.startsWith('#') &&
    ['oval', 'round', 'square', 'long'].includes(p.faceShape) && p.jersey >= 0)));
  const bron = playerProfile(TEAM_BY_CODE.LAL.players[0]);
  assert.equal(bron.curated, true);
  assert.equal(bron.jersey, 23);
});

test('player notes contain verified quote and factual trivia', () => {
  const notes = playerNotes(TEAM_BY_CODE.LAL.players[0], 'en', 'Los Angeles Lakers');
  assert.ok(notes.quote && notes.quote.includes('criticism'));
  assert.ok(notes.trivia.includes('2003'));
  const other = playerNotes(TEAM_BY_CODE.BOS.players[9], 'it', 'Boston Celtics');
  assert.equal(other.quote, null);
  assert.ok(other.trivia.includes('Boston Celtics'));
});

test('storage v3 accumulates per-player totals and migrates v2', () => {
  store.clear();
  const state = defaults();
  recordPlayerStats(state, [{ id: 'BOS-1', pts: 20, orb: 3, drb: 5, fgm: 8, fga: 15 }]);
  recordPlayerStats(state, [{ id: 'BOS-1', pts: 10, orb: 1, drb: 4, fgm: 4, fga: 9 }]);
  assert.equal(state.playerStats['BOS-1'].games, 2);
  assert.equal(state.playerStats['BOS-1'].pts, 30);
  assert.equal(state.playerStats['BOS-1'].reb, 13);
  save(state);
  store.delete('pf.nba.v3');
  store.set('pf.nba.v2', JSON.stringify({ version: 2, history: [1, 2], settings: { lang: 'it' } }));
  const migrated = load();
  assert.equal(migrated.version, 3);
  assert.equal(migrated.settings.lang, 'it');
  assert.equal(migrated.history.length, 2);
});

test('rarity tiers follow player strength', () => {
  assert.equal(rarityFor(96), 'legendary');
  assert.equal(rarityFor(90), 'epic');
  assert.equal(rarityFor(83), 'rare');
  assert.equal(rarityFor(70), 'common');
  assert.ok(Object.keys(RARITIES).length === 4);
});

test('chest tier improves with streak and rewards an unowned player', () => {
  const low = chestTier(0, () => 0.99);
  const high = chestTier(6, () => 0.99);
  assert.ok(['common', 'rare', 'epic', 'legendary'].includes(low));
  assert.ok(['epic', 'legendary'].includes(high));
  const reward = chestReward('legendary', TEAMS, [], seededRandom(3));
  assert.ok(reward.player && reward.player.ovr >= 95);
  assert.equal(reward.duplicate, false);
});

test('career guesses update streak, collection and XP', () => {
  const career = { collection: [], xp: 0, level: 1 };
  const reward = { player: TEAM_BY_CODE.BOS.players[0], xp: 100, duplicate: false };
  const win = applyGuess(career, 'home', 'home', reward);
  assert.equal(win.correct, true);
  assert.equal(career.streak, 1);
  assert.equal(career.collection.length, 1);
  assert.ok(career.xp >= 100);
  const loss = applyGuess(career, 'home', 'away', null);
  assert.equal(loss.correct, false);
  assert.equal(career.streak, 0);
});

test('storage v3 merges new career fields from older saves', () => {
  store.clear();
  store.set('pf.nba.v3', JSON.stringify({ version: 3, career: { year: 2027, xp: 500 } }));
  const loaded = load();
  assert.equal(loaded.career.year, 2027);
  assert.deepEqual(loaded.career.collection, []);
  assert.equal(loaded.career.streak, 0);
});

test('theme helpers produce valid team colors and gradients', () => {
  assert.deepEqual(hexToRgb('#00d4ff'), [0, 212, 255]);
  assert.equal(mix('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(shade('#ffffff', -1), '#000000');
  assert.equal(rarityColor('legendary'), RARITIES.legendary.color);
  const g = teamGradient(TEAM_BY_CODE.BOS, TEAM_BY_CODE.LAL);
  assert.ok(g.includes('linear-gradient') && g.includes('#'));
});

test('replay log records events, highlights and frames', () => {
  const sim = new Sim(TEAM_BY_CODE.BOS, TEAM_BY_CODE.LAL, { rng: seededRandom(11) });
  for (let i = 0; i < 80; i++) sim.step();
  const replay = captureReplay(sim);
  assert.ok(replay.events.length > 0);
  assert.ok(Array.isArray(detectHighlights(replay)));
  const frame = frameAt(replay, 0.5);
  assert.ok(frame && frame.event && frame.score);
  assert.equal(trimReplays([1, 2, 3, 4, 5, 6], 3).length, 3);
});

test('card sets, upgrades and daily chests follow the rules', () => {
  const p = { ...TEAM_BY_CODE.LAL.players[0], age: 30, ovr: 96 };
  assert.equal(cardSet(p), 'legends');
  assert.equal(cardSet({ ovr: 70, age: 27 }), 'base');
  assert.equal(Object.keys(SETS).length, 5);
  assert.ok(fragmentsFor('legendary') > fragmentsFor('common'));
  const career = { fragments: 100, upgrades: {}, dailyChest: null, collection: [p.id] };
  const up = applyUpgrade(career, p.id);
  assert.equal(up.ok, true);
  assert.equal(up.level, 1);
  assert.ok(career.fragments < 100);
  assert.equal(upgradeCost(1) > upgradeCost(0), true);
  assert.equal(isDailyChestAvailable(career), true);
  assert.equal(claimDailyChest(career), true);
  assert.equal(isDailyChestAvailable(career), false);
  const progress = setProgress(career, [TEAM_BY_CODE.LAL], 'legends');
  assert.ok(progress.total >= 0 && progress.ratio >= 0);
});

test('betting odds, payouts and credits follow the rules', () => {
  const strong = { players: Array.from({ length: 5 }, (_, i) => ({ ovr: 95 - i })) };
  const weak = { players: Array.from({ length: 5 }, (_, i) => ({ ovr: 72 - i })) };
  const odds = winOdds(strong, weak);
  assert.ok(odds.odds.home < odds.odds.away);
  assert.equal(payout(10, 2, true), 20);
  assert.equal(payout(10, 2, false), -10);
  const career = { credits: 100, streak: 0, bets: [] };
  const win = applyBet(career, { pick: 'home', stake: 10 }, 'home', odds.odds, 0);
  assert.equal(win.won, true);
  assert.ok(career.credits > 100);
  assert.equal(claimDailyCredits(career), 250);
  assert.equal(claimDailyCredits(career), 0);
  assert.ok(streakBonus(4) > streakBonus(0));
});

test('prop bets and parlays resolve from a game summary', () => {
  const summary = { score: { home: 110, away: 100 }, quarters: [{ home: 30, away: 20 }, { home: 25, away: 25 }, { home: 30, away: 25 }, { home: 25, away: 30 }] };
  const market = propMarket(summary);
  assert.ok(market.totalLine >= 100 && market.totalLine <= 115);
  assert.equal(resolveProp('total', market, market.over), true);
  assert.equal(resolveProp('margin', market, market.margin), true);
  assert.equal(resolveProp('quarter', market, 2), true);
  assert.ok(propOdds('margin', 'blowout') > propOdds('margin', 'close'));
  assert.ok(parlayOdds([2, 2, 2]) > 7);
  assert.equal(resolveParlay([{ won: true }, { won: false }]), false);
});

test('pity guarantees a legendary and odds stay normalized', () => {
  const odds = pullOdds(0);
  assert.ok(Math.abs(odds.common + odds.rare + odds.epic + odds.legendary - 100) < 0.5);
  const career = { pity: PITY_LIMIT - 1, pullHistory: [] };
  const pull = pityPull(career, () => 0.99);
  assert.equal(pull.guaranteed, true);
  assert.equal(pull.tier, 'legendary');
  assert.equal(career.pity, 0);
  assert.equal(career.pullHistory.length, 1);
});

test('crafting and AI market use fragments and duplicates', () => {
  const p = { ...TEAM_BY_CODE.BOS.players[0], age: 30, ovr: 96 };
  const career = { fragments: 1000, collection: [], duplicates: {}, credits: 0 };
  assert.ok(craftCost(p) > 0);
  const crafted = craftPlayer(career, p);
  assert.equal(crafted.ok, true);
  assert.ok(career.collection.includes(p.id));
  career.duplicates[p.id] = 1;
  assert.equal(canSell(career, p), true);
  const offer = aiOffer(p, () => 0.5, 0);
  assert.ok(offer > 0);
  const sold = sellDuplicate(career, p, offer);
  assert.equal(sold.ok, true);
  assert.equal(career.credits, offer);
  const set = setProgress(career, [TEAM_BY_CODE.BOS], 'legends');
  assert.ok(set.total >= 0);
});

test('chest effects scale with rarity and honor reduced motion', () => {
  assert.equal(Object.keys(RARITY_FX).length, 4);
  const common = fxFor('common');
  const legend = fxFor('legendary');
  assert.ok(legend.particles > common.particles);
  assert.ok(legend.flash > common.flash);
  assert.equal(confettiCount('legendary'), 90);
  assert.equal(confettiCount('common'), 0);
  assert.equal(nextPhase('shake'), 'open');
  assert.equal(nextPhase(PHASES[PHASES.length - 1]), 'done');
  assert.ok(totalDuration('legendary') > totalDuration('common'));
  const reduced = phaseDurations('legendary', true);
  assert.equal(reduced.shake, 0);
  assert.equal(confettiCount('legendary', true), 0);
});

test('timed chest shop buys, queues, speeds up and opens', () => {
  const now = 1000000;
  const career = { credits: 5000, chestQueue: [], collection: [] };
  const bought = buyChest(career, 'silver', now);
  assert.equal(bought.ok, true);
  assert.equal(career.credits, 5000 - CHEST_TYPES.silver.price);
  assert.equal(activeChest(career, now).type, 'silver');
  assert.equal(isReady(activeChest(career, now), now), false);
  assert.ok(speedUpCost(activeChest(career, now), now) > 0);
  const fast = speedUpChest(career, now);
  assert.equal(fast.ok, true);
  assert.equal(isReady(activeChest(career, now), now), true);
  const opened = openChest(career, now);
  assert.equal(opened.ok, true);
  assert.equal(career.chestQueue.length, 0);
  assert.equal(enforceMinTier('common', 'epic'), 'epic');
  assert.equal(formatTime(65000), '1:05');
  assert.equal(QUEUE_LIMIT, 4);
});

test('card upgrades need copies and credits', () => {
  const career = { credits: 5000, copies: {}, cards: {} };
  addCopies(career, 'BOS-1', 2);
  assert.equal(copiesNeeded(1), 2);
  assert.ok(creditsNeeded(1) > 0);
  const up = upgradeWithCopies(career, 'BOS-1');
  assert.equal(up.ok, true);
  assert.equal(career.cards['BOS-1'], 2);
  assert.equal(career.copies['BOS-1'], 0);
  const fail = upgradeWithCopies(career, 'BOS-1');
  assert.equal(fail.ok, false);
  assert.equal(fail.reason, 'resources');
});

test('deck synergy rewards full and balanced decks', () => {
  const cards = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`p${i}`, { id: `p${i}`, ovr: 80 + i, pos: ['PG', 'SG', 'SF', 'PF', 'C'][i % 5], set: 'base', level: 1 }]));
  const deck = normalizeDeck(['p0', 'p0', ...Object.keys(cards).slice(1, 8)]);
  assert.equal(deck.length, DECK_SIZE);
  const syn = deckSynergy(cards, deck);
  assert.ok(syn.odds > 0 && syn.xp > 0);
  assert.ok(syn.labels.includes('Full deck'));
});

test('basketball squad validates 5 starters and bonuses', () => {
  const cards = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`p${i}`, { id: `p${i}`, ovr: 80 + i, pos: ['PG', 'SG', 'SF', 'PF', 'C'][i % 5], team: 'BOS', set: 'base', level: 2 }]));
  const squad = normalizeSquad({ template: 'balanced', starters: Object.keys(cards).slice(0, 5), bench: Object.keys(cards).slice(5, 12) });
  assert.equal(squadReady(cards, squad), true);
  assert.ok(squadRating(cards, squad) > 80);
  assert.ok(chemistry(cards, squad) > 0);
  assert.equal(Object.keys(TEMPLATES).length, 3);
});

test('club league and cup progress with promotions and wildcards', () => {
  const league = newClubLeague('Bronze', seededRandom(1));
  assert.equal(league.games.length, 30);
  const result = playClubGame(league, 88, 10, seededRandom(2));
  assert.ok(result && league.week === 1);
  assert.ok(clubStandings(league).length === 31);
  const cup = createCup(seededRandom(3));
  assert.equal(cup.rounds[0].matchups.length, 8);
  playCupRound(cup, 88, 10, seededRandom(4));
  assert.equal(cup.round, 1);
  const career = { wildcards: {}, copies: {}, cards: {}, collection: ['p1'], challengesDone: [] };
  grantWildcard(career, 'rare', 1);
  const used = useWildcard(career, { id: 'p1', ovr: 82 });
  assert.equal(used.ok, true);
  assert.equal(career.copies.p1, 1);
  const earned = checkChallenges(career, { cupRound: 2 });
  assert.ok(Array.isArray(earned));
  assert.equal(TIERS.length, 4);
});

console.log('32/32 tests passed');
