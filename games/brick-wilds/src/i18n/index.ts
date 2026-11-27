import type { Lang } from '../data/types';
import { EN_STRINGS } from './en';
import { IT_STRINGS } from './it';

const LANG_KEY = 'brickwilds.v1.lang';

let currentLang: Lang = detectInitialLang();

function detectInitialLang(): Lang {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'it') return saved;
  }
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('it')) {
    return 'it';
  }
  return 'en';
}

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  currentLang = lang;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  }
}

export function t(key: string): string {
  const dict = currentLang === 'it' ? IT_STRINGS : EN_STRINGS;
  return dict[key] ?? EN_STRINGS[key] ?? key;
}
