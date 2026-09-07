// save.js — Persistenza con localStorage + Streak System
window.Save = (() => {
  const KEY = 'rdm_save_v1';

  const defaults = () => ({
    money: 0,
    completedChapters: [],
    currentChapter: 0,
    empireUnlocked: false,
    streak: { count: 0, lastDate: null, bestStreak: 0 },
    empire: {
      money: 0,
      buildings: {},
      upgrades: {},
      prestigeCount: 0,
      prestigeMultiplier: 1,
      totalEarned: 0,
      lastTick: Date.now(),
      eventsDone: 0
    }
  });

  let data = defaults();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        data = {
          ...defaults(),
          ...saved,
          streak: { ...defaults().streak, ...(saved.streak || {}) },
          empire: { ...defaults().empire, ...(saved.empire || {}) }
        };
      }
    } catch(e) { data = defaults(); }
    updateStreak();
    return data;
  }

  function save() {
    data.empire.lastTick = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e) {}
  }

  function get() { return data; }

  function setMoney(m) { data.money = Math.max(0, Math.round(m)); save(); }

  function addMoney(m) {
    data.money = Math.max(0, data.money + Math.round(m));
    data.empire.totalEarned += Math.max(0, Math.round(m));
    save();
  }

  function completeChapter(idx) {
    if (!data.completedChapters.includes(idx)) {
      data.completedChapters.push(idx);
      if (idx >= 5) data.empireUnlocked = true;
      save();
    }
  }

  function setCurrentChapter(idx) { data.currentChapter = idx; save(); }

  function isChapterDone(idx) { return data.completedChapters.includes(idx); }

  function isChapterUnlocked(idx) {
    if (idx === 0) return true;
    return data.completedChapters.includes(idx - 1) || data.completedChapters.includes(idx);
  }

  function progress(total) {
    const t = total || 18;
    return Math.round((data.completedChapters.length / t) * 100);
  }

  // === STREAK SYSTEM ===
  function updateStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (!data.streak) data.streak = { count: 0, lastDate: null, bestStreak: 0 };
    if (data.streak.lastDate === today) return; // già aggiornato oggi
    if (data.streak.lastDate === yesterday) {
      data.streak.count++;
    } else if (data.streak.lastDate !== today) {
      data.streak.count = 1;
    }
    data.streak.lastDate = today;
    data.streak.bestStreak = Math.max(data.streak.bestStreak, data.streak.count);
  }

  function getStreak() {
    updateStreak();
    return data.streak;
  }

  function reset() { data = defaults(); save(); }

  return {
    load, save, get, setMoney, addMoney,
    completeChapter, setCurrentChapter,
    isChapterDone, isChapterUnlocked,
    progress, reset, getStreak
  };
})();
