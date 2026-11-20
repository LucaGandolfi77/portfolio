/* Game Kit — bilingual strings synced with the site top bar */

export function createI18n(dict, defaultLang = 'en') {
  function detect() {
    try {
      const v = localStorage.getItem('lang') || localStorage.getItem('site_lang');
      if (v === 'en' || v === 'it') return v;
    } catch (e) { /* ignore */ }
    return defaultLang;
  }
  let lang = detect();
  const listeners = new Set();

  function lookup(d, key) {
    return key.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), d);
  }
  function t(key, vars) {
    let text = lookup(dict[lang], key) ?? lookup(dict.en, key) ?? key;
    if (Array.isArray(text)) return text;
    if (vars) for (const [k, v] of Object.entries(vars)) text = String(text).replace(`{${k}}`, v);
    return text;
  }
  function getLang() { return lang; }
  function setLang(next, persist = true) {
    const value = next === 'it' ? 'it' : 'en';
    if (value === lang) return;
    lang = value;
    if (persist) {
      try {
        localStorage.setItem('lang', lang);
        localStorage.setItem('site_lang', lang);
      } catch (e) { /* ignore */ }
    }
    listeners.forEach(fn => fn(lang));
  }
  function apply(root = document) {
    root.querySelectorAll?.('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  }
  function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  function sync() {
    const stored = detect();
    if (stored !== lang) setLang(stored, false);
  }
  return { t, getLang, setLang, apply, onChange, sync };
}
