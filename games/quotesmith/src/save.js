/* QuoteSmith — Save System
   localStorage persistence with versioning.
   Tracks best scores, streaks per category, preferences, and stats. */
'use strict';

const QuoteSmithSave = (() => {
  const KEY = 'quotesmith_save_v1';
  const LEGACY_KEY = 'quotesmith.best';
  const LANG_KEY = 'quotesmith.lang';
  const VERSION = 1;

  const DEFAULT = {
    version: 1,
    lang: 'en',
    categories: [],
    difficulty: 'easy',
    totalRounds: 0,
    totalQuotes: 0,
    bestByCategory: {},
    streakByCategory: {},
    lastPlayed: 0,
  };

  function clone(overrides) {
    return Object.assign(JSON.parse(JSON.stringify(DEFAULT)), overrides || {});
  }

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return migrate();
      const data = JSON.parse(raw);
      if (!data || data.version !== VERSION) return migrate();
      return Object.assign(JSON.parse(JSON.stringify(DEFAULT)), data);
    } catch (e) {
      return migrate();
    }
  }

  function write(state) {
    try {
      state.lastPlayed = Date.now();
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('[QuoteSmithSave] Save failed:', e);
      return false;
    }
  }

  function migrate() {
    const state = clone();
    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || '{}');
      if (legacy.score) state.bestByCategory._global = { score: legacy.score, streak: legacy.streak || 0 };
    } catch (e) { /* ignore */ }
    try {
      const lang = localStorage.getItem(LANG_KEY);
      if (lang) state.lang = lang;
    } catch (e) { /* ignore */ }
    write(state);
    return state;
  }

  function saveBestScore(category, score) {
    const state = read();
    if (!state.bestByCategory[category]) {
      state.bestByCategory[category] = { score: 0, streak: 0 };
    }
    state.bestByCategory[category].score = Math.max(state.bestByCategory[category].score, score);
    write(state);
  }

  function saveBestStreak(category, streak) {
    const state = read();
    if (!state.bestByCategory[category]) {
      state.bestByCategory[category] = { score: 0, streak: 0 };
    }
    state.bestByCategory[category].streak = Math.max(state.bestByCategory[category].streak, streak);
    write(state);
  }

  function getBestScore(category) {
    const state = read();
    if (category) {
      const entry = state.bestByCategory[category];
      return entry ? entry.score : 0;
    }
    let best = 0;
    Object.values(state.bestByCategory).forEach((entry) => {
      best = Math.max(best, entry.score || 0);
    });
    return best;
  }

  function getBestStreak(category) {
    const state = read();
    if (category) {
      const entry = state.bestByCategory[category];
      return entry ? entry.streak : 0;
    }
    let best = 0;
    Object.values(state.bestByCategory).forEach((entry) => {
      best = Math.max(best, entry.streak || 0);
    });
    return best;
  }

  function saveLang(lang) {
    const state = read();
    state.lang = lang;
    write(state);
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
  }

  function saveCategories(categories) {
    const state = read();
    state.categories = categories.slice();
    write(state);
  }

  function saveDifficulty(difficulty) {
    const state = read();
    state.difficulty = difficulty;
    write(state);
  }

  function incrementRounds(count) {
    const state = read();
    state.totalRounds += count || 1;
    write(state);
  }

  function incrementQuotes(count) {
    const state = read();
    state.totalQuotes += count || 1;
    write(state);
  }

  function getStats() {
    const state = read();
    return {
      totalRounds: state.totalRounds,
      totalQuotes: state.totalQuotes,
      bestByCategory: Object.assign({}, state.bestByCategory),
      streakByCategory: Object.assign({}, state.streakByCategory),
    };
  }

  function exportData() {
    return JSON.stringify(read(), null, 2);
  }

  function importData(json) {
    try {
      const data = JSON.parse(json);
      if (!data || data.version !== VERSION) return false;
      const state = Object.assign(JSON.parse(JSON.stringify(DEFAULT)), data);
      return write(state);
    } catch (e) {
      console.warn('[QuoteSmithSave] Import failed:', e);
      return false;
    }
  }

  function formatPlayTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return h + 'h ' + (m % 60) + 'min';
    return m + 'min ' + (s % 60) + 's';
  }

  function formatDate(timestamp) {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function clear() {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(LEGACY_KEY);
      localStorage.removeItem(LANG_KEY);
    } catch (e) { /* ignore */ }
  }

  return {
    read,
    saveBestScore,
    saveBestStreak,
    getBestScore,
    getBestStreak,
    saveLang,
    saveCategories,
    saveDifficulty,
    incrementRounds,
    incrementQuotes,
    getStats,
    exportData,
    importData,
    formatPlayTime,
    formatDate,
    clear,
    DEFAULT,
  };
})();
