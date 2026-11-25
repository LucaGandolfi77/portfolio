/* Slot Collect — pure-ish reducer state machine + tiny store */

import { DIFFICULTY, MODES, REELS, MAX_BET, COLLECTIBLE } from './config.js';
import { seededRandom, dailySeed, mixSeed } from './rng.js';
import { generateGrid, evaluate, drawSymbol } from './systems/reels.js';
import { cashOut, energyFor, buyUpgrade, changeBet } from './systems/economy.js';
import { load, save as persist, clear } from './systems/storage.js';
import { grantXP, touchStreak, addCollection, progressAchievements } from './systems/progression.js';

const SPIN_DURATION = 1.15;
const RESOLVE_DURATION = 1.1;

export function initialState(storage) {
  const save = load(storage);
  return {
    phase: 'menu', mode: save.mode || 'classic', difficulty: save.difficulty || 'normal',
    score: 0, combo: 0, best: save.best?.[save.mode || 'classic'] || 0,
    grid: [], result: null, message: '', spinT: 0, resolveT: 0,
    run: null, counters: {}, save, rng: Math.random, seed: 0,
    lastWin: 0, flash: 0
  };
}

function rngFor(mode, difficulty, seed) {
  if (mode !== 'daily') return Math.random;
  return seededRandom(mixSeed(seed, difficulty.length * 2654435761));
}

export function start(state, { mode = state.mode, difficulty = state.difficulty } = {}) {
  const cfg = DIFFICULTY[difficulty] || DIFFICULTY.normal;
  const seed = mode === 'daily' ? dailySeed() : (Date.now() >>> 0);
  const save = state.save;
  save.mode = mode; save.difficulty = difficulty;
  save.streak = save.streak || {};
  touchStreak(save);
  persist(save);
  const upgrades = save.upgrades || {};
  const rng = rngFor(mode, difficulty, seed);
  const reelCount = Math.min(6, REELS + (upgrades.reel || 0));
  const initialGrid = generateGrid({ reels: reelCount, rng, luck: upgrades.luck || 0, odds: cfg.odds });
  return {
    ...state,
    phase: 'idle', mode, difficulty, score: 0, combo: 0,
    best: save.best?.[mode] || 0, grid: initialGrid, result: null, message: '',
    spinT: 0, resolveT: 0, lastWin: 0, flash: 0,
    seed, rng,
    run: {
      energy: energyFor(difficulty, upgrades) + (upgrades.energy || 0),
      maxEnergy: energyFor(difficulty, upgrades) + (upgrades.energy || 0),
      bet: 1, points: 0, banked: 0, freeSpins: 0,
      multiplier: 1 + (upgrades.multiplier || 0) * 0.25,
      spins: 0, reelCount: Math.min(6, REELS + (upgrades.reel || 0)),
      luck: upgrades.luck || 0,
      goal: cfg.goal,
      auto: false, collected: []
    }
  };
}

function finish(state, won) {
  const s = { ...state };
  const save = s.save;
  save.spins = (save.spins || 0) + s.run.spins;
  if (won) save.wins = (save.wins || 0) + 1;
  const score = s.score + s.run.banked;
  const bestKey = s.mode;
  const isBest = score > (save.best?.[bestKey] || 0);
  if (isBest) { save.best = save.best || {}; save.best[bestKey] = score; }
  save.lastRun = { mode: s.mode, score, won, at: Date.now() };
  if (s.mode === 'daily') save.daily = { ...(save.daily || {}), [dailySeed()]: score };
  const counters = s.counters;
  if (won) counters['first-win'] = (counters['first-win'] || 0) + 1;
  if (s.run.bet === MAX_BET && s.lastWin > 0) counters['high-roller'] = 1;
  if ((save.streak?.count || 0) >= 3) counters['daily-3'] = 1;
  const newAchievements = progressAchievements(save, counters);
  grantXP(save, Math.round(score / 20) + (won ? 80 : 20));
  persist(save);
  return { ...s, score, best: save.best?.[bestKey] || score, phase: 'result',
    message: won ? 'win' : 'lose', newAchievements, isBest };
}

export function reduce(state, action) {
  const s = { ...state };
  switch (action.type) {
    case 'START': return start(s, action);
    case 'MENU': return { ...s, phase: 'menu', grid: [], result: null, run: null };
    case 'BET': {
      if (!s.run || s.phase !== 'idle') return s;
      return { ...s, run: { ...s.run, bet: changeBet(s.run.bet, action.delta) } };
    }
    case 'AUTO': {
      if (!s.run || !(s.save.upgrades?.autospin)) return s;
      return { ...s, run: { ...s.run, auto: !s.run.auto } };
    }
    case 'SPIN': {
      if (!s.run || (s.phase !== 'idle' && !(s.phase === 'result' && action.again))) return s;
      const r = { ...s.run };
      if (r.freeSpins > 0) r.freeSpins--;
      else if (r.energy <= 0) return s;
      else r.energy -= r.bet;
      r.spins++;
      const cfg = DIFFICULTY[s.difficulty] || DIFFICULTY.normal;
      const grid = generateGrid({ reels: r.reelCount, rng: s.rng, luck: r.luck, odds: cfg.odds });
      return { ...s, phase: 'spinning', spinT: 0, grid, result: null, message: '', run: r, flash: 0 };
    }
    case 'TICK': {
      if (s.phase === 'spinning') {
        const spinT = s.spinT + action.dt / SPIN_DURATION;
        if (spinT < 1) return { ...s, spinT };
        const r = { ...s.run };
        const cfg = DIFFICULTY[s.difficulty] || DIFFICULTY.normal;
        const result = evaluate(s.grid, { reels: r.reelCount, bet: r.bet, luck: r.luck });
        const combo = result.total > 0 ? s.combo + 1 : 0;
        const multiplier = r.multiplier * (result.freeSpins > 0 ? 2 : 1) * Math.min(4, 1 + combo * 0.1);
        const points = Math.round(result.total * multiplier);
        r.points += points;
        r.collected = [...r.collected, ...result.collected];
        if (result.freeSpins > 0) {
          r.freeSpins += result.freeSpins;
          s.counters = { ...s.counters, 'free-spins': 1 };
        }
        if (result.lines.some(l => l.wildUsed)) s.counters = { ...s.counters, 'wild-win': 1 };
        if (result.total > 0) s.counters = { ...s.counters, [`combo-${Math.min(10, combo)}`]: combo };
        const score = s.score + points;
        return { ...s, phase: 'resolving', resolveT: 0, spinT: 1, result,
          combo, score, lastWin: points, flash: result.total > 0 ? 1 : 0,
          run: r, message: result.total > 0 ? `+${points}` : '' };
      }
      if (s.phase === 'resolving') {
        const resolveT = s.resolveT + action.dt / RESOLVE_DURATION;
        if (resolveT < 1) return { ...s, resolveT, flash: Math.max(0, s.flash - action.dt * 2) };
        const r = s.run;
        if (r.energy <= 0 && r.freeSpins <= 0) return finish({ ...s, resolveT: 1 }, r.points >= r.goal * 100);
        return { ...s, phase: 'idle', resolveT: 1 };
      }
      return s;
    }
    case 'CASH': {
      if (!s.run || (s.phase !== 'idle' && s.phase !== 'resolving')) return s;
      const { net, banked } = cashOut(s.run.points, s.run.banked);
      const r = { ...s.run, points: 0, banked };
      const score = s.score + net;
      return finish({ ...s, score, run: r, message: 'bank' }, true);
    }
    case 'UPGRADE': {
      const wallet = { score: s.score + s.run?.banked, upgrades: s.save.upgrades || {} };
      if (!buyUpgrade(wallet, action.id, 'score')) return { ...s, message: 'need' };
      s.save.upgrades = wallet.upgrades;
      persist(s.save);
      return { ...s, score: 0, message: 'bought', save: s.save };
    }
    case 'RESET':
      clear();
      return initialState(undefined);
    default: return s;
  }
}

export function createStore(storage) {
  let state = initialState(storage);
  const listeners = new Set();
  return {
    get: () => state,
    dispatch(action) {
      state = reduce(state, action);
      listeners.forEach(fn => fn(state, action));
      return state;
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  };
}

export function runSummary(state) {
  const r = state.run;
  if (!r) return null;
  const sets = COLLECTIBLE.filter(id => (r.collected || []).includes(id)).length;
  return { ...r, sets, progress: Math.min(1, sets / r.goal), score: state.score, combo: state.combo };
}
