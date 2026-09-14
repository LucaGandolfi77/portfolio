/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Save/Load System
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Save = (function() {
  'use strict';

  var SAVE_KEY = 'scalpel2_save';

  var defaultSave = {
    chapter: 1,
    completed: {},
    scores: {},
    bestGrades: {},
    daily: {},
    settings: {
      sound: true,
      theme: 'dark'
    }
  };

  function load() {
    try {
      var data = localStorage.getItem(SAVE_KEY);
      if (data) {
        var parsed = JSON.parse(data);
        return merge(defaultSave, parsed);
      }
    } catch(e) {
      console.warn('[Save] Failed to load:', e);
    }
    return JSON.parse(JSON.stringify(defaultSave));
  }

  function save(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch(e) {
      console.warn('[Save] Failed to save:', e);
    }
  }

  function clear() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch(e) {
      console.warn('[Save] Failed to clear:', e);
    }
  }

  function merge(target, source) {
    var result = JSON.parse(JSON.stringify(target));
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = merge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  }

  return {
    load: load,
    save: save,
    clear: clear
  };

})();

window.S2 = window.S2 || {};
window.S2.Save = S2.Save;
