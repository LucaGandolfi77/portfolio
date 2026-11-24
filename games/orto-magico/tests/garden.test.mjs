import test from 'node:test';
import assert from 'node:assert/strict';
import { SEEDS, UPGRADES, ACHIEVEMENTS, SEASONS, WEATHER, MODES, findSeed, findSeason } from '../js/config.js';
import {
  defaultState, normalizeState, createPlot, plant, water, harvest, tick,
  buyPlot, buyUpgrade, claimAchievement, offlineReport, speedMultiplier, isSeedUnlocked
} from '../js/garden.js';
import { dailySeed, mulberry32, seasonForDate, weatherForDate, modeEnv, timeAttackConfig, greenhouseSeeds } from '../js/modes.js';
import { albumEntries, collectionCount, updateStreak, shareText, seasonProgress } from '../js/progress.js';

test('registry: semi, upgrade, stagioni e modalità', () => {
  assert.ok(Object.keys(SEEDS).length >= 16);
  assert.ok(UPGRADES.length >= 13 && MODES.length === 6 && SEASONS.length === 4 && WEATHER.length === 4);
  assert.ok(ACHIEVEMENTS.length >= 6);
  assert.equal(findSeed('unknown').id, 'lettuce');
  assert.equal(findSeason('unknown').id, 'spring');
  assert.ok(greenhouseSeeds().length >= 2);
  assert.equal(timeAttackConfig().duration, 60);
});

test('stato, piantagione e raccolto', () => {
  const state = defaultState();
  state.plots.push(createPlot(0));
  assert.equal(plant(state, 0, 'lettuce'), true);
  assert.equal(state.coins, 495);
  assert.equal(state.plots[0].seedId, 'lettuce');
  assert.equal(water(state, 0), false);
  state.plots[0].water = 50;
  assert.equal(water(state, 0), true);
  state.plots[0].progress = 999;
  const result = harvest(state, 0, { seasonId: 'spring' });
  assert.ok(result && result.coins > 0);
  assert.equal(state.plots[0].seedId, null);
  assert.equal(state.totalHarvests, 1);
  assert.equal(state.collectionKnown, 1);
  assert.equal(state.seasonsHarvested.includes('spring'), true);
});

test('tick, velocità e raccolto automatico', () => {
  const state = defaultState();
  state.plots.push(createPlot(0));
  plant(state, 0, 'lettuce');
  const env = modeEnv(state, new Date(2026, 5, 1));
  const events = tick(state, 10, env);
  assert.ok(Array.isArray(events));
  assert.ok(state.plots[0].progress > 0);
  assert.ok(speedMultiplier(state, env) > 0);
  state.upgrades.push('auto-harvest');
  state.plots[0].progress = 999;
  const auto = tick(state, 1, env);
  assert.ok(auto.some((event) => event.type === 'harvest' && event.automatic));
});

test('negozio, traguardi e offline', () => {
  const state = defaultState();
  state.coins = 5000; state.gems = 50;
  assert.equal(buyPlot(state), true);
  assert.equal(state.plots.length, 1);
  assert.equal(buyUpgrade(state, 'speed-1'), true);
  assert.equal(state.upgrades.includes('speed-1'), true);
  state.totalHarvests = 2;
  assert.equal(claimAchievement(state, 'first-sprout'), true);
  state.plots[0] = createPlot(0, 'lettuce');
  const report = offlineReport(state, 3600 * 1000, modeEnv(state));
  assert.ok(report.coins > 0 && report.capHours > 0);
  assert.ok(report.cycles > 0);
  assert.equal(isSeedUnlocked(state, 'starfruit'), false);
});

test('modalità, seed e progressi', () => {
  const a = mulberry32(4), b = mulberry32(4);
  assert.equal(a(), b());
  assert.equal(dailySeed(new Date(2026, 0, 2)), 20260102);
  assert.equal(seasonForDate(new Date(2026, 0, 1)).id, 'winter');
  assert.equal(seasonForDate(new Date(2026, 6, 1)).id, 'summer');
  assert.ok(weatherForDate(new Date(2026, 0, 1)).id.length > 0);
  const state = normalizeState({ collection: { lettuce: 2 } });
  const env = modeEnv(state);
  assert.ok(env.season && env.weather);
  assert.equal(collectionCount(state), 1);
  assert.ok(albumEntries(state).length >= 16);
  assert.equal(updateStreak(state, 20260101).streak.count, 1);
  assert.ok(shareText(state).includes('Orto Magico'));
  assert.equal(seasonProgress(state).total, 4);
});
