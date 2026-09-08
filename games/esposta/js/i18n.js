window.I18n = (function() {
  let currentLang = localStorage.getItem('esposta_lang') || 'it';

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('esposta_lang', lang);
    document.documentElement.lang = lang;
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  function getLang() {
    return currentLang;
  }

  function t(key) {
    const dict = window.TRANSLATIONS && window.TRANSLATIONS[currentLang];
    if (dict && dict[key] !== undefined) return dict[key];
    return key;
  }

  document.documentElement.lang = currentLang;

  return { setLang, getLang, t };
})();
