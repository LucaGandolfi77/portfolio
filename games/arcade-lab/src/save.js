(function () {
  'use strict';

  var STORAGE_KEY = 'arcade_save';
  var VERSION = 1;

  function loadAll() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { version: VERSION, games: {} };
      var data = JSON.parse(raw);
      if (!data.version) {
        data.version = VERSION;
        if (!data.games) data.games = {};
      }
      return data;
    } catch (e) {
      return { version: VERSION, games: {} };
    }
  }

  function persist(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function save(gameId, data) {
    var store = loadAll();
    store.games[gameId] = {
      data: data,
      timestamp: Date.now()
    };
    persist(store);
  }

  function load(gameId) {
    var store = loadAll();
    var entry = store.games[gameId];
    return entry ? entry.data : null;
  }

  function getHighScores(gameId) {
    var store = loadAll();
    var entry = store.games[gameId];
    if (!entry || !entry.data) return [];
    var scores = entry.data.scores || entry.data.highScores || [];
    return scores.slice(0, 10);
  }

  function addScore(gameId, score) {
    var store = loadAll();
    if (!store.games[gameId]) {
      store.games[gameId] = { data: {}, timestamp: Date.now() };
    }
    var entry = store.games[gameId];
    if (!entry.data.scores) entry.data.scores = [];
    entry.data.scores.push({ score: score, time: Date.now() });
    entry.data.scores.sort(function (a, b) { return b.score - a.score; });
    if (entry.data.scores.length > 10) {
      entry.data.scores = entry.data.scores.slice(0, 10);
    }
    persist(store);
  }

  function getAll() {
    var store = loadAll();
    return store.games;
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function exportData() {
    return JSON.stringify(loadAll(), null, 2);
  }

  function importData(json) {
    try {
      var data = JSON.parse(json);
      if (data && data.games) {
        persist(data);
        return true;
      }
    } catch (e) {}
    return false;
  }

  window.Save = {
    save: save,
    load: load,
    getHighScores: getHighScores,
    addScore: addScore,
    getAll: getAll,
    reset: reset,
    exportData: exportData,
    importData: importData
  };
})();
