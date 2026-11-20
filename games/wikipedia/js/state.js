/* Stato della partita e record locali */

import { getLang } from './i18n.js';

const KEY = 'wiki_game_records_v1';

export const state = {
  mode: 'quiz',
  preset: 'normal',
  lang: getLang(),
  running: false,
  ended: false,
  loading: false,

  round: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  lives: 3,

  deck: [],
  current: null,
  timeLeft: 0,
  timeLimit: 0,

  history: [],
  hintsUsed: 0,
  hintFirst: false,
  removedIndex: -1,
  locked: false,
  usedFallback: false
};

export function resetGame(mode, preset) {
  state.mode = mode;
  state.preset = preset;
  state.lang = getLang();
  state.running = true;
  state.ended = false;
  state.loading = true;
  state.round = 0;
  state.score = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.lives = 3;
  state.deck = [];
  state.current = null;
  state.timeLeft = 0;
  state.timeLimit = 0;
  state.history = [];
  state.hintsUsed = 0;
  state.hintFirst = false;
  state.removedIndex = -1;
  state.locked = false;
  state.usedFallback = false;
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

export function getRecord(mode, preset) {
  const all = read();
  return (all[mode] && all[mode][preset]) || null;
}

export function getBestOverall() {
  const all = read();
  let best = 0;
  Object.keys(all).forEach(mode => Object.keys(all[mode]).forEach(preset => {
    best = Math.max(best, all[mode][preset].score || 0);
  }));
  return best;
}

export function saveRecord(mode, preset, score, rounds) {
  const all = read();
  if (!all[mode]) all[mode] = {};
  const prev = all[mode][preset] || { score: 0, rounds: 0 };
  const isNew = score > prev.score;
  all[mode][preset] = {
    score: Math.max(prev.score, score),
    rounds: Math.max(prev.rounds, rounds),
    date: new Date().toISOString()
  };
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* ignore */ }
  return isNew;
}
