/**
 * language.js — stima euristica di somiglianza linguistica (pura).
 * Combina profili fonotattici con la lingua rilevata da Whisper.
 */

import { normalizeText, toKey } from './phonetics.js';

export const LANGUAGES = {
  it: { name: 'Italiano', en: 'Italian', flag: '🇮🇹' },
  en: { name: 'English', en: 'English', flag: '🇬🇧' },
  es: { name: 'Español', en: 'Spanish', flag: '🇪🇸' },
  fr: { name: 'Français', en: 'French', flag: '🇫🇷' },
  de: { name: 'Deutsch', en: 'German', flag: '🇩🇪' },
  pt: { name: 'Português', en: 'Portuguese', flag: '🇵🇹' },
  nl: { name: 'Nederlands', en: 'Dutch', flag: '🇳🇱' },
  pl: { name: 'Polski', en: 'Polish', flag: '🇵🇱' }
};

export const PROFILES = {
  it: { finalVowel: 0.78, clusters: ['st', 'str', 'sc', 'gn', 'gl', 'mb', 'mp', 'nt', 'nd', 'nc', 'ch', 'gh', 'li', 'ri'], doubles: -12, hardEnd: -1.4, bias: 0.2 },
  en: { finalVowel: 0.30, clusters: ['th', 'sh', 'ch', 'ng', 'ght', 'igh', 'ou', 'ea', 'ee', 'er', 'tion'], doubles: 26, hardEnd: 2.2, bias: 0.4 },
  es: { finalVowel: 0.85, clusters: ['ll', 'rr', 'ch', 'nch', 'mbr', 'cion', 'gado', 'quist'], doubles: -10, hardEnd: -1.6, bias: 0 },
  fr: { finalVowel: 0.68, clusters: ['au', 'eau', 'oin', 'ch', 'gn', 'an', 'en', 'ui', 'tion', 'ou'], doubles: -14, hardEnd: -2, bias: -0.2 },
  de: { finalVowel: 0.20, clusters: ['sch', 'tsch', 'ch', 'st', 'sp', 'pf', 'tz', 'ei', 'eu', 'au', 'ung', 'heit'], doubles: 18, hardEnd: 2.4, bias: 0.5 },
  pt: { finalVowel: 0.82, clusters: ['lh', 'nh', 'rr', 'ss', 'ao', 'ão', 'ei', 'ou', 'cia'], doubles: -8, hardEnd: -1.1, bias: 0.1 },
  nl: { finalVowel: 0.32, clusters: ['sch', 'ij', 'oe', 'eu', 'ng', 'nd', 'ing', 'lijk'], doubles: 10, hardEnd: 1.6, bias: 0.2 },
  pl: { finalVowel: 0.24, clusters: ['sz', 'cz', 'rz', 'dz', 'ch', 'prz', 'trz', 'ni', 'ci'], doubles: 12, hardEnd: 2, bias: 0.3 }
};

export function languageLabel(code, english = false) {
  const item = LANGUAGES[code];
  return item ? (english ? item.en : item.name) : code;
}

export function guessLanguage(keys, { whisperLang = null, priorWeight = 1.6 } = {}) {
  const raw = Array.isArray(keys) ? keys : [keys];
  const phon = raw.map((value) => toKey(normalizeText(value))).join(' ');
  if (phon.replace(/[^a-z]/g, '').length < 2) return [];

  const words = phon.split(' ').filter(Boolean);
  const finalVowelRate = words.filter((word) => /[aeiou]$/.test(word)).length / Math.max(1, words.length);
  const doubled = (phon.match(/([a-z])\1/g) || []).length / Math.max(1, phon.length);
  const hardEnd = /[kptbdgsvfz]$/.test(phon) ? 1 : 0;
  const trigrams = new Set();
  for (let i = 0; i < phon.length - 2; i += 1) {
    const slice = phon.slice(i, i + 3);
    if (!/\s/.test(slice)) trigrams.add(slice);
  }

  const scores = {};
  for (const [code, profile] of Object.entries(PROFILES)) {
    let score = (1 - Math.abs(finalVowelRate - profile.finalVowel)) * 6;
    for (const cluster of profile.clusters) {
      if (phon.includes(cluster)) score += Math.min(3, cluster.length * 1.1);
      if (trigrams.has(cluster)) score += 0.7;
    }
    score += doubled * profile.doubles;
    score += hardEnd * profile.hardEnd;
    score += profile.bias;
    if (whisperLang && code === whisperLang.toLowerCase().slice(0, 2)) score += priorWeight * 4;
    scores[code] = Math.max(0, score);
  }
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0) || 1;
  return Object.entries(scores)
    .map(([lang, score]) => ({ lang, pct: Math.round((score / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}
