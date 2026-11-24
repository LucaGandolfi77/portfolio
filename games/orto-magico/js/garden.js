/**
 * garden.js — motore puro di Orto Magico (crescita, acqua, raccolto, offline).
 */

import { SEEDS, UPGRADES, ACHIEVEMENTS, FREE_SEEDS, findSeed, findUpgrade } from './config.js';

export const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

export function defaultState() {
  return {
    coins: 500, gems: 5, level: 1, xp: 0, xpNext: 100,
    plots: [], nextPlotCost: 30, maxPlots: 12,
    collection: {}, achievements: {}, upgrades: [],
    totalPlanted: 0, totalHarvests: 0, totalWatered: 0, autoHarvests: 0,
    totalCoinsEarned: 0, seasonsHarvested: [], lastTick: 0,
    mode: 'garden', season: 'spring', weather: 'sun', spirits: [],
    streak: { count: 0, last: '' }, bestHarvest: 0
  };
}

export function normalizeState(saved = {}) {
  const base = defaultState();
  return {
    ...base, ...saved,
    plots: Array.isArray(saved.plots) ? saved.plots : [],
    collection: saved.collection && typeof saved.collection === 'object' ? saved.collection : {},
    achievements: saved.achievements && typeof saved.achievements === 'object' ? saved.achievements : {},
    upgrades: Array.isArray(saved.upgrades) ? saved.upgrades : [],
    spirits: Array.isArray(saved.spirits) ? saved.spirits : [],
    seasonsHarvested: Array.isArray(saved.seasonsHarvested) ? saved.seasonsHarvested : [],
    streak: { ...base.streak, ...(saved.streak || {}) }
  };
}

export function hasUpgrade(state, id) { return state.upgrades.includes(id); }

export function isSeedUnlocked(state, seedId) {
  if (FREE_SEEDS.includes(seedId)) return true;
  const seed = findSeed(seedId);
  if (seed.mutant) return hasUpgrade(state, 'greenhouse');
  const known = Object.keys(state.collection || {}).length;
  return known >= 3 || state.level >= 3;
}

export function createPlot(id, seedId = null) {
  return {
    id,
    seedId,
    progress: 0,
    water: seedId ? 100 : 0,
    maxWater: seedId ? findSeed(seedId).maxWater : 100
  };
}

export function speedMultiplier(state, env = {}) {
  let speed = 1;
  if (hasUpgrade(state, 'speed-1')) speed += 0.25;
  if (hasUpgrade(state, 'speed-2')) speed += 0.5;
  if (hasUpgrade(state, 'speed-3')) speed *= 2;
  if (env.season) speed *= (env.season.growth || 1);
  if (env.weather) speed *= (env.weather.growth || 1);
  if (state.spirits.includes('sprite')) speed *= 1.2;
  if (state.mode === 'zen') speed *= 0.8;
  return speed;
}

export function waterUseMultiplier(state, env = {}) {
  let use = env.weather ? (env.weather.waterUse === 0 ? 0 : env.weather.waterUse) : 1;
  if (env.season) use *= (env.season.water || 1);
  if (state.spirits.includes('gnome')) use *= 0.7;
  if (state.mode === 'zen') use *= 0.7;
  return use;
}

/** Avanza la crescita di tutti i campi. Ritorna gli eventi da mostrare. */
export function tick(state, seconds, env = {}) {
  const events = [];
  const speed = speedMultiplier(state, env);
  const waterUse = waterUseMultiplier(state, env);
  const autoHarvest = hasUpgrade(state, 'auto-harvest');
  const autoReplant = hasUpgrade(state, 'auto-replant');
  const passiveWater = hasUpgrade(state, 'water-full') ? 999 : hasUpgrade(state, 'water-rate-2') ? 5 : hasUpgrade(state, 'water-rate-1') ? 2 : 0;

  state.plots.forEach((plot) => {
    if (!plot.seedId) return;
    const seed = findSeed(plot.seedId);
    if (passiveWater) plot.water = Math.min(plot.maxWater, plot.water + passiveWater * seconds);
    else if (waterUse > 0) plot.water = Math.max(0, plot.water - (seed.thirst * waterUse * seconds) / 60);
    const waterBonus = plot.water >= seed.minWater ? 1.25 : 1;
    plot.progress += seconds * speed * waterBonus * (state.spirits.includes('sprite') ? 1.1 : 1);
    if (plot.progress >= seed.growTime) {
      if (autoHarvest) {
        const result = harvest(state, plot, env, true);
        events.push({ type: 'harvest', ...result });
        if (autoReplant && state.coins >= seed.cost) {
          plant(state, plot, seed.id);
          events.push({ type: 'replant', plotId: plot.id, seedId: seed.id });
        }
      } else events.push({ type: 'ready', plotId: plot.id, seedId: seed.id });
    }
  });
  state.lastTick = Date.now();
  return events;
}

export function plant(state, plotOrIndex, seedId) {
  const plot = typeof plotOrIndex === 'number' ? state.plots[plotOrIndex] : plotOrIndex;
  const seed = findSeed(seedId);
  if (!plot || !seed || plot.seedId || state.coins < seed.cost || !isSeedUnlocked(state, seedId)) return false;
  state.coins -= seed.cost;
  plot.seedId = seed.id;
  plot.progress = 0;
  plot.water = 100;
  plot.maxWater = seed.maxWater;
  state.totalPlanted += 1;
  return true;
}

export function water(state, plotOrIndex) {
  const plot = typeof plotOrIndex === 'number' ? state.plots[plotOrIndex] : plotOrIndex;
  if (!plot || !plot.seedId || plot.water >= plot.maxWater) return false;
  plot.water = Math.min(plot.maxWater, plot.water + 40);
  state.totalWatered += 1;
  return true;
}

export function harvest(state, plotOrIndex, env = {}, automatic = false) {
  const plot = typeof plotOrIndex === 'number' ? state.plots[plotOrIndex] : plotOrIndex;
  if (!plot || !plot.seedId) return null;
  const seed = findSeed(plot.seedId);
  if (plot.progress < seed.growTime) return null;
  const owl = state.spirits.includes('owl') ? 1.1 : 1;
  const coins = Math.round(seed.coins * owl);
  const gems = seed.gems;
  state.coins += coins;
  state.gems += gems;
  state.totalCoinsEarned += coins;
  state.totalHarvests += 1;
  if (automatic) state.autoHarvests += 1;
  state.xp += Math.max(5, Math.round(coins / 3));
  awardLevels(state);
  state.collection[seed.id] = (state.collection[seed.id] || 0) + 1;
  state.collectionKnown = Object.keys(state.collection).length;
  if (env.seasonId && !state.seasonsHarvested.includes(env.seasonId)) state.seasonsHarvested.push(env.seasonId);
  state.bestHarvest = Math.max(state.bestHarvest, coins);
  plot.seedId = null; plot.progress = 0; plot.water = 0;
  return { seedId: seed.id, coins, gems, automatic };
}

export function awardLevels(state) {
  while (state.xp >= state.xpNext) {
    state.xp -= state.xpNext;
    state.level += 1;
    state.xpNext = Math.round(state.xpNext * 1.35);
  }
}

export function buyPlot(state) {
  if (state.plots.length >= state.maxPlots || state.coins < state.nextPlotCost) return false;
  state.coins -= state.nextPlotCost;
  state.plots.push(createPlot(state.plots.length));
  state.nextPlotCost = Math.round(state.nextPlotCost * 1.5);
  return true;
}

export function buyUpgrade(state, id) {
  const upgrade = findUpgrade(id);
  if (!upgrade || hasUpgrade(state, id) || state.coins < upgrade.cost || state.gems < upgrade.gems) return false;
  state.coins -= upgrade.cost;
  state.gems -= upgrade.gems;
  state.upgrades.push(id);
  return true;
}

export function claimAchievement(state, id) {
  const achievement = ACHIEVEMENTS.find((item) => item.id === id);
  if (!achievement || state.achievements[id]) return false;
  if ((state[achievement.field] || 0) < achievement.goal) return false;
  state.achievements[id] = Date.now();
  state.coins += achievement.coins;
  state.gems += achievement.gems;
  return true;
}

/** Calcola il reddito While-Away senza applicarlo. */
export function offlineReport(state, elapsedMs, env = {}) {
  const capHours = hasUpgrade(state, 'offline-3') ? 24 : hasUpgrade(state, 'offline-2') ? 6 : hasUpgrade(state, 'offline-1') ? 1 : 0.15;
  const seconds = Math.min(elapsedMs / 1000, capHours * 3600);
  const speed = speedMultiplier(state, env);
  let coins = 0, gems = 0, cycles = 0, ready = 0;
  state.plots.forEach((plot) => {
    if (!plot.seedId) return;
    const seed = findSeed(plot.seedId);
    const total = plot.progress + seconds * speed;
    const earned = Math.floor(total / seed.growTime);
    if (earned > 0) {
      coins += earned * seed.coins;
      gems += earned * seed.gems;
      cycles += earned;
      ready += 1;
    }
  });
  return { seconds, capHours, coins, gems, cycles, ready };
}
