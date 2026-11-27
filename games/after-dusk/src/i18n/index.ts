import type { Language } from '../data/types';
import { EN, type I18nKey } from './en';
import { IT } from './it';

const KEY = 'afterdusk.v1.lang';

let currentLang: Language = 'en';
try {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
  if (saved === 'it' || saved === 'en') currentLang = saved;
  else if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('it')) currentLang = 'it';
} catch {
  // Ignore in SSR/tests
}

export function getLang(): Language {
  return currentLang;
}

export function setLang(lang: Language) {
  currentLang = lang;
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, lang);
  } catch {
    // Ignore storage errors
  }
}

export function t(key: I18nKey): string {
  return (currentLang === 'it' ? IT[key] : EN[key]) ?? EN[key];
}
