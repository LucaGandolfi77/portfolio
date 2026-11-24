/* Morse Studio — local EN/IT, compatible with the project shell */
import { STR } from './config.js';

const KEY = 'pf.morse.lang';
let current = 'en';

export function detect() {
  try {
    const v = localStorage.getItem('lang') || localStorage.getItem('site_lang') || localStorage.getItem(KEY);
    return v === 'it' ? 'it' : 'en';
  } catch (e) { return 'en'; }
}
export function initLang(value) { current = value === 'it' ? 'it' : 'en'; document.documentElement.lang = current; }
export function getLang() { return current; }
export function setLang(value) {
  current = value === 'it' ? 'it' : 'en';
  document.documentElement.lang = current;
  try {
    localStorage.setItem(KEY, current);
    localStorage.setItem('lang', current);
    localStorage.setItem('site_lang', current);
  } catch (e) {}
  applyStatic(document);
  window.dispatchEvent(new CustomEvent('morse:langchange', { detail: { lang: current } }));
}
export function t(key, vars) {
  let text = (STR[current] && STR[current][key]) ?? STR.en[key] ?? key;
  if (vars && typeof text === 'string') for (const [k, v] of Object.entries(vars)) text = text.replaceAll('{' + k + '}', String(v));
  return text;
}
export function dictKeys(lang = current) { return Object.keys(STR[lang]); }
export function applyStatic(root) {
  root.querySelectorAll?.('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll?.('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  root.querySelectorAll?.('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
}
window.addEventListener('project:langchange', e => { if (e.detail?.lang) setLang(e.detail.lang); });
