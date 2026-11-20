/* Sunset Compass — local language state, synced with the site top bar */

import { STR } from './config.js';

function detect() {
  try {
    const v = localStorage.getItem('lang') || localStorage.getItem('site_lang');
    if (v === 'en' || v === 'it') return v;
  } catch (e) { /* ignore */ }
  return 'it';
}

let lang = detect();
let onChange = null;

export function t(key) {
  return (STR[lang] && STR[lang][key]) || STR.it[key] || STR.en[key] || key;
}

export function getLang() { return lang; }

export function setLang(value, persist = true) {
  const next = value === 'en' ? 'en' : 'it';
  if (next === lang) return;
  lang = next;
  if (persist) {
    try {
      localStorage.setItem('lang', lang);
      localStorage.setItem('site_lang', lang);
    } catch (e) { /* ignore */ }
  }
  onChange?.(lang);
}

export function onLanguageChange(fn) { onChange = fn; }

/* The site top bar writes localStorage without firing a storage event in the
   same tab, so poll it from the app loop to stay in sync. */
export function syncFromStorage() {
  const stored = detect();
  if (stored !== lang) setLang(stored, false);
}
