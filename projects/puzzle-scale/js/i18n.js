/* Scale Puzzle — EN/IT with project-shell sync */
import { STR } from './config.js';
const KEY = 'pf.puzzle-scale.lang';
let current = 'it';
export function detect() {
  try {
    const v = localStorage.getItem('lang') || localStorage.getItem('site_lang') || localStorage.getItem(KEY);
    return v === 'en' ? 'en' : 'it';
  } catch (e) { return 'it'; }
}
export function initLang(v) { current = v === 'en' ? 'en' : 'it'; document.documentElement.lang = current; }
export function getLang() { return current; }
export function setLang(v) {
  current = v === 'en' ? 'en' : 'it';
  document.documentElement.lang = current;
  try { localStorage.setItem(KEY, current); localStorage.setItem('lang', current); localStorage.setItem('site_lang', current); } catch (e) {}
  applyStatic(document);
  window.dispatchEvent(new CustomEvent('puzzle:langchange', { detail: { lang: current } }));
}
export function t(key, vars) {
  let text = (STR[current] && STR[current][key]) ?? STR.it[key] ?? key;
  if (vars && typeof text === 'string') for (const [k, v] of Object.entries(vars)) text = text.replaceAll('{' + k + '}', String(v));
  return text;
}
export function applyStatic(root) {
  root.querySelectorAll?.('[data-i18n]').forEach(el => {
    const value = t(el.dataset.i18n);
    /* Non sostituire textContent: cancellerebbe gli elementi annidati
       (per esempio <b id="comboVal">) e romperebbe l'HUD. */
    const children = [...(el.childNodes || [])];
    const textNode = children.find(n => n.nodeType === 3);
    if (textNode && children.some(n => n.nodeType === 1)) textNode.textContent = value;
    else el.textContent = value;
  });
}
window.addEventListener('project:langchange', e => { if (e.detail?.lang) setLang(e.detail.lang); });
