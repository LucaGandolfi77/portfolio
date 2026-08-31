/* ZERO ASSOLUTO — salvataggi in localStorage */
'use strict';

const SaveSys = (() => {
  const KEY = 'zeroassoluto_v1';
  const DEF = {
    seenIntro: false,
    beaten: {},        // boss id -> true
    stars: {},         // boss id -> 1..3
    unlockedCards: [], // id carte sbloccate (base implicite)
    deck: [],          // id carte nel mazzo
    notes: {},         // risposte del Diario
    muted: false,
    night: false,
    bestScore: 0,
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEF));
      const s = JSON.parse(raw);
      return Object.assign(JSON.parse(JSON.stringify(DEF)), s);
    } catch (e) { return JSON.parse(JSON.stringify(DEF)); }
  }

  function store(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }

  return { load, store, KEY, DEF };
})();
