// save.js — VOTOPOLI persistence
window.Save = (() => {
  const KEY = 'votopoli_save_v1';

  const DEFAULT = {
    name: 'Cittadino',
    city: 'bastardo',
    country: 'italia',
    money: 100,
    influence: 0,
    energy: 50,
    maxEnergy: 50,
    businesses: {},
    home: 0,
    taxPaid: 0,
    totalEarned: 0,
    votesCast: 0,
    favorCount: 0,
    scandals: 0,
    electionsWon: 0,
    lastTick: Date.now(),
    lastElection: '',
    lastNationalElection: '',
    achievements: {},
    settings: { sound: true, darkMode: false },
    isMayor: false,
    mayorTax: 20,
    mayorFavors: [],
    moveCount: 0,
    totalBusinessLevels: 0,
    minigameWins: 0,
    newsFeed: [],
    dailyChallenges: { date: '', challenges: [], streak: 0, totalCompleted: 0 },
    prestigeCount: 0,
    prestigeMultiplier: 1,
    cityServices: {},
    party: null
  };

  function get() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s) return Object.assign({}, DEFAULT, s);
    } catch(e) {}
    return Object.assign({}, DEFAULT);
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data || get()));
    } catch(e) {}
  }

  function reset() {
    const fresh = Object.assign({}, DEFAULT, { lastTick: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  }

  function addMoney(amount) {
    const s = get();
    s.money += amount;
    s.totalEarned += amount;
    save(s);
  }

  function addInfluence(amount) {
    const s = get();
    s.influence += amount;
    save(s);
  }

  function progress(total) {
    const s = get();
    const t = total || 1;
    return Math.min(100, Math.round((s.totalBusinessLevels / t) * 100));
  }

  function formatMoney(n) {
    if (n < 1000) return Math.round(n) + '€';
    if (n < 1e6) return (n / 1e3).toFixed(1) + 'K€';
    if (n < 1e9) return (n / 1e6).toFixed(2) + 'M€';
    if (n < 1e12) return (n / 1e9).toFixed(2) + 'B€';
    if (n < 1e15) return (n / 1e12).toFixed(2) + 'T€';
    return n.toExponential(1);
  }

  return { get, save, reset, addMoney, addInfluence, progress, formatMoney };
})();
