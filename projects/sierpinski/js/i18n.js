/* Fractal Observatory — EN/IT with project-shell sync */
import { STR } from './config.js';
const KEY = 'pf.fractal.lang';
let current = 'en';
export function detect() {
  try {
    const v = localStorage.getItem('lang') || localStorage.getItem('site_lang') || localStorage.getItem(KEY);
    return v === 'it' ? 'it' : 'en';
  } catch (e) { return 'en'; }
}
export function initLang(v) { current = v === 'it' ? 'it' : 'en'; document.documentElement.lang = current; }
export function getLang() { return current; }
export function setLang(v) {
  current = v === 'it' ? 'it' : 'en';
  document.documentElement.lang = current;
  try { localStorage.setItem(KEY, current); localStorage.setItem('lang', current); localStorage.setItem('site_lang', current); } catch (e) {}
  applyStatic(document);
  window.dispatchEvent(new CustomEvent('fractal:langchange', { detail: { lang: current } }));
}
export function t(key, vars) {
  let text = (STR[current] && STR[current][key]) ?? STR.en[key] ?? key;
  if (vars && typeof text === 'string') for (const [k, v] of Object.entries(vars)) text = text.replaceAll('{' + k + '}', String(v));
  return text;
}
export function applyStatic(root) {
  root.querySelectorAll?.('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
}
window.addEventListener('project:langchange', e => { if (e.detail?.lang) setLang(e.detail.lang); });
