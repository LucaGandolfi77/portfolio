/* Cockpit Arena — EN/IT with site-shell sync */
import { STR } from './config.js';

const LANG_KEY = 'pf.cockpit.lang';
let current = 'it';

export function detect() {
  try {
    const v = localStorage.getItem('lang') || localStorage.getItem('site_lang') || localStorage.getItem(LANG_KEY);
    return v === 'en' ? 'en' : 'it';
  } catch (e) { return 'it'; }
}
export function initLang(value) {
  current = value === 'en' ? 'en' : 'it';
  document.documentElement.lang = current;
}
export function getLang() { return current; }
export function setLang(value) {
  current = value === 'en' ? 'en' : 'it';
  document.documentElement.lang = current;
  try {
    localStorage.setItem(LANG_KEY, current);
    localStorage.setItem('lang', current);
    localStorage.setItem('site_lang', current);
  } catch (e) {}
  applyStatic(document);
  window.dispatchEvent(new CustomEvent('cockpit:langchange', { detail: { lang: current } }));
}
export function t(key, vars) {
  let text = (STR[current] && STR[current][key]) ?? STR.it[key] ?? STR.en[key] ?? key;
  if (vars && typeof text === 'string') for (const [k, v] of Object.entries(vars)) text = text.replaceAll('{' + k + '}', String(v));
  return text;
}
export function dictKeys(lang = current) { return Object.keys(STR[lang]); }
export function applyStatic(root) {
  root.querySelectorAll?.('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll?.('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
}
window.addEventListener('project:langchange', e => {
  if (e.detail?.lang) { setLang(e.detail.lang); }
});
