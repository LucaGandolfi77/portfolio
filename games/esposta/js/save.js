window.Save = (function() {
  const STORAGE_KEY = 'esposta_save';
  const CURRENT_VERSION = 1;

  function getDefaultState() {
    return {
      version: CURRENT_VERSION,
      currentChapter: 0,
      completedChapters: [],
      scores: {},
      examScore: null,
      examCompleted: false,
      agencyState: {
        money: 500,
        reputation: 3,
        clientsServed: 0,
        totalEarned: 0,
        campaignHistory: []
      },
      language: 'it',
      totalPlayTime: 0,
      lastPlayed: null
    };
  }

  function migrate(state) {
    let v = state.version || 1;
    if (v < 2) {
      // future migration example:
      // state.newField = defaultValue;
      // v = 2;
    }
    state.version = CURRENT_VERSION;
    return state;
  }

  function save(state) {
    state.lastPlayed = new Date().toISOString();
    state.version = CURRENT_VERSION;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e) {
      console.warn('Save failed:', e);
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultState();
      const parsed = JSON.parse(raw);
      const merged = { ...getDefaultState(), ...parsed };
      return migrate(merged);
    } catch(e) {
      return getDefaultState();
    }
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('esposta_state');
    localStorage.removeItem('esposta_agency');
    localStorage.removeItem('esposta_lang');
    return getDefaultState();
  }

  function exportData() {
    const state = load();
    return JSON.stringify(state, null, 2);
  }

  function importData(json) {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object') return false;
      if (typeof parsed.version !== 'number') return false;
      if (!Array.isArray(parsed.completedChapters)) return false;
      if (typeof parsed.scores !== 'object') return false;
      const merged = { ...getDefaultState(), ...parsed };
      save(merged);
      return true;
    } catch(e) {
      return false;
    }
  }

  function formatPlayTime(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h === 0) return m + 'm';
    return h + 'h ' + m + 'm';
  }

  function formatSaveDate(isoString) {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch(e) {
      return isoString;
    }
  }

  return {
    save: function(state) { save(state); },
    load: load,
    reset: reset,
    exportData: exportData,
    importData: importData,
    formatPlayTime: formatPlayTime,
    formatSaveDate: formatSaveDate,
    getDefaultState: getDefaultState
  };
})();
