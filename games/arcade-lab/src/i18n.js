(function () {
  'use strict';

  var STORAGE_KEY = 'arcade_lang';
  var currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

  function setLang(lang) {
    currentLang = lang === 'it' ? 'it' : 'en';
    localStorage.setItem(STORAGE_KEY, currentLang);
  }

  function getLang() {
    return currentLang;
  }

  function t(key) {
    var translations = window.TRANSLATIONS || {};
    var langDict = translations[currentLang] || {};
    if (langDict[key] !== undefined) return langDict[key];
    var fallback = translations['en'] || {};
    if (fallback[key] !== undefined) return fallback[key];
    return key;
  }

  window.I18n = {
    setLang: setLang,
    getLang: getLang,
    t: t
  };
})();
