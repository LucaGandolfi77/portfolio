/* Forza 4 — persistent stats, settings and achievements */

const KEY = 'forza4_state_v2';

const blankRecord = () => ({ win: 0, loss: 0, draw: 0 });

export function defaultState() {
  return {
    v: 2,
    games: 0,
    stats: {
      easy: blankRecord(), medium: blankRecord(), hard: blankRecord(),
      local: { p1: 0, p2: 0, draw: 0 }
    },
    streak: 0,
    bestStreak: 0,
    achievements: {},
    settings: {
      sound: true,
      skin: 'classic',
      aiName: '',
      personality: 'sly',
      reduceMotion: false,
      mode: 'ai',
      difficulty: 'medium'
    }
  };
}

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, n) : fallback;
}

function normalize(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== 'object') return base;
  const data = { ...base, ...raw };
  data.v = 2;
  data.games = number(data.games);
  data.streak = number(data.streak);
  data.bestStreak = number(data.bestStreak);
  data.stats = { ...base.stats, ...(data.stats || {}) };
  for (const key of ['easy', 'medium', 'hard', 'local']) {
    data.stats[key] = { ...base.stats[key], ...(data.stats[key] || {}) };
    Object.keys(base.stats[key]).forEach(k => { data.stats[key][k] = number(data.stats[key][k]); });
  }
  data.achievements = data.achievements && typeof data.achievements === 'object' ? data.achievements : {};
  data.settings = { ...base.settings, ...(data.settings || {}) };
  data.settings.sound = !!data.settings.sound;
  data.settings.reduceMotion = !!data.settings.reduceMotion;
  return data;
}

let stored = null;
try {
  const raw = localStorage.getItem(KEY);
  stored = raw ? JSON.parse(raw) : null;
} catch (e) { stored = null; }

// migrate from the old flat scores key
if (!stored) {
  try {
    const old = localStorage.getItem('forza4_scores');
    if (old) {
      const parsed = JSON.parse(old);
      const fresh = defaultState();
      fresh.stats.medium.win = number(parsed.player);
      fresh.stats.medium.loss = number(parsed.ai);
      fresh.stats.medium.draw = number(parsed.draws);
      stored = fresh;
    }
  } catch (e) { /* ignore */ }
}

export const state = normalize(stored);

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

export function recordResult(mode, difficulty, outcome) {
  state.games++;
  if (mode === 'local') {
    if (outcome === 'p1') state.stats.local.p1++;
    else if (outcome === 'p2') state.stats.local.p2++;
    else state.stats.local.draw++;
  } else {
    const record = state.stats[difficulty] || state.stats.medium;
    if (outcome === 'win') {
      record.win++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    } else if (outcome === 'loss') {
      record.loss++;
      state.streak = 0;
    } else record.draw++;
  }
  checkAchievements();
  save();
}

export const ACHIEVEMENTS = [
  { id: 'firstWin', icon: '🏆', label: 'Prima vittoria', test: s => Object.values(s.stats).some(r => r.win > 0 || r.p1 > 0) },
  { id: 'streak3', icon: '🔥', label: 'Serie di 3', test: s => s.bestStreak >= 3 },
  { id: 'hardWin', icon: '🧠', label: 'Batti il difficile', test: s => s.stats.hard.win > 0 },
  { id: 'tenGames', icon: '🎮', label: '10 partite', test: s => s.games >= 10 },
  { id: 'perfect', icon: '😎', label: 'Streak di 5', test: s => s.bestStreak >= 5 }
];

export function checkAchievements() {
  for (const achievement of ACHIEVEMENTS) {
    if (state.achievements[achievement.id]) continue;
    try {
      if (achievement.test(state)) state.achievements[achievement.id] = Date.now();
    } catch (e) { /* ignore */ }
  }
}

export function resetStats() {
  const settings = state.settings;
  Object.assign(state, defaultState());
  state.settings = settings;
  save();
}

export function setSetting(key, value) {
  state.settings[key] = value;
  save();
}
