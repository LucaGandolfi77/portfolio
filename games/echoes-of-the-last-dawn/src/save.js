/* Echoes of the Last Dawn — Save System
   3 slots + 1 auto-save, localStorage persistence.
   State: zone, flags, party HP/essence, skills, inventory, choices. */
'use strict';

const SaveSys = (() => {
  const KEY_PREFIX = 'echoes_save_';
  const AUTO_KEY = KEY_PREFIX + 'auto';
  const MAX_SLOTS = 3;

  const DEFAULT_STATE = {
    version: 1,
    zoneIndex: 0,
    flags: {},
    party: {
      elia:  { hp: 100, maxHp: 100 },
      toma:  { hp: 85,  maxHp: 85 },
      iria:  { hp: 75,  maxHp: 75 }
    },
    essence: { current: 60, max: 60 },
    skills: {
      elia: ['attacco'],
      toma: ['attacco', 'scudo'],
      iria: ['attacco', 'cura']
    },
    bonusSkills: [],
    inventory: [],
    npcMet: [],
    bossesDefeated: [],
    choicesMade: {},
    totalPlayTime: 0,
    lastSaved: 0,
    introSeen: false,
    language: 'it'
  };

  function cloneState(overrides) {
    return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), overrides || {});
  }

  function save(slotKey, state) {
    try {
      state.lastSaved = Date.now();
      localStorage.setItem(slotKey, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('[SaveSys] Save failed:', e);
      return false;
    }
  }

  function load(slotKey) {
    try {
      const raw = localStorage.getItem(slotKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.version !== 1) return null;
      // Merge with defaults to handle new fields
      return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), data);
    } catch (e) {
      console.warn('[SaveSys] Load failed:', e);
      return null;
    }
  }

  function remove(slotKey) {
    try { localStorage.removeItem(slotKey); } catch (e) {}
  }

  // ── Public API ──

  function autoSave(state) {
    return save(AUTO_KEY, state);
  }

  function loadAuto() {
    return load(AUTO_KEY);
  }

  function saveSlot(slotIndex, state) {
    if (slotIndex < 0 || slotIndex >= MAX_SLOTS) return false;
    return save(KEY_PREFIX + slotIndex, state);
  }

  function loadSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_SLOTS) return null;
    return load(KEY_PREFIX + slotIndex);
  }

  function deleteSlot(slotIndex) {
    remove(KEY_PREFIX + slotIndex);
  }

  function getSlotPreviews() {
    const previews = [];
    for (let i = 0; i < MAX_SLOTS; i++) {
      const state = load(KEY_PREFIX + i);
      if (state) {
        previews.push({
          slot: i,
          zoneIndex: state.zoneIndex,
          lastSaved: state.lastSaved,
          totalPlayTime: state.totalPlayTime,
          bossesDefeated: state.bossesDefeated.length,
          npcMet: state.npcMet.length
        });
      } else {
        previews.push(null);
      }
    }
    return previews;
  }

  function hasAutoSave() {
    return load(AUTO_KEY) !== null;
  }

  function hasAnySave() {
    if (hasAutoSave()) return true;
    for (let i = 0; i < MAX_SLOTS; i++) {
      if (load(KEY_PREFIX + i)) return true;
    }
    return false;
  }

  function newGame(overrides) {
    return cloneState(overrides);
  }

  function formatPlayTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}min`;
    return `${m}min ${s % 60}s`;
  }

  function formatDate(timestamp) {
    if (!timestamp) return 'Mai';
    return new Date(timestamp).toLocaleDateString('it-IT', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }

  return {
    autoSave,
    loadAuto,
    saveSlot,
    loadSlot,
    deleteSlot,
    getSlotPreviews,
    hasAutoSave,
    hasAnySave,
    newGame,
    formatPlayTime,
    formatDate,
    DEFAULT_STATE,
    MAX_SLOTS
  };
})();
