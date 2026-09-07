/* De Rerum Gatta — salvataggi in localStorage */
'use strict';

const SaveSys = (() => {
  const KEY = 'dererumgatta_v1';
  const DEF = { flowers: {}, letters: {}, notes: {}, calendar: {}, muted: false, seenIntro: false, walkDone: false, walkIdx: 0, night: false };

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

  return { load, store, KEY };
})();
