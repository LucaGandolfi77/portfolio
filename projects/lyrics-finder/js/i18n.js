/* Reverse Lyrics Finder — EN/IT with project-shell sync */
import { STR } from './config.js';

let current = 'en';

export function initLang(value) {
  current = value === 'it' ? 'it' : 'en';
  document.documentElement.lang = current;
}
export function getLang() { return current; }
export function setLang(value) {
  current = value === 'it' ? 'it' : 'en';
  document.documentElement.lang = current;
  try {
    localStorage.setItem('lang', current);
    localStorage.setItem('site_lang', current);
  } catch (e) { /* ignore */ }
  applyStatic(document);
  window.dispatchEvent(new CustomEvent('lyrics:langchange', { detail: { lang: current } }));
}
export function t(key, vars) {
  let text = (STR[current] && STR[current][key]) ?? STR.en[key] ?? key;
  if (vars && typeof text === 'string') for (const [k, v] of Object.entries(vars)) text = text.replaceAll('{' + k + '}', String(v));
  return text;
}
export function dictKeys(lang = current) { return Object.keys(STR[lang] || STR.en); }

export function applyStatic(root) {
  root.querySelectorAll?.('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll?.('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  root.querySelectorAll?.('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  root.querySelectorAll?.('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
}

export function detect() {
  try { return localStorage.getItem('lang') || localStorage.getItem('site_lang') || 'en'; }
  catch (e) { return 'en'; }
}

window.addEventListener('project:langchange', e => {
  if (e.detail && e.detail.lang) {
    current = e.detail.lang === 'it' ? 'it' : 'en';
    document.documentElement.lang = current;
    applyStatic(document);
    window.dispatchEvent(new CustomEvent('lyrics:langchange', { detail: { lang: current } }));
  }
});
