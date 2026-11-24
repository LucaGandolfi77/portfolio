/**
 * search.js — parsing keyword, matching booleano e ranking (puro).
 */

import { escapeHtml } from './parser.js';

export function parseKeywords(input) {
  const raw = String(input || '');
  const mode = /\band\b/i.test(raw) && !/\bor\b/i.test(raw) ? 'and' : 'or';
  const cleaned = raw.replace(/\b(and|or)\b/gi, ' ');
  const positive = [];
  const negative = [];
  const quoted = [...cleaned.matchAll(/"([^"]+)"/g)].map((match) => match[1].trim()).filter(Boolean);
  const rest = cleaned.replace(/"[^"]+"/g, ' ');
  const words = rest.split(/[\s,;]+/).filter(Boolean);
  for (const word of [...quoted, ...words]) {
    if (word.startsWith('-') && word.length > 1) negative.push(word.slice(1));
    else positive.push(word);
  }
  return { positive, negative, mode };
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toRegExp(term, { regex, caseSensitive }) {
  const flags = regex ? (caseSensitive ? 'g' : 'gi') : (caseSensitive ? 'g' : 'gi');
  try { return new RegExp(regex ? term : escapeRegex(term), flags); }
  catch (e) { return new RegExp(escapeRegex(term), flags); }
}

/**
 * Crea una funzione di matching che restituisce {match, score, hits}.
 */
export function createMatcher({ positive = [], negative = [], mode = 'or', regex = false, caseSensitive = false } = {}) {
  const positives = positive.filter(Boolean);
  const negatives = negative.filter(Boolean);
  return function match(value) {
    const text = String(value || '');
    if (!text) return { match: positives.length === 0, score: 0, hits: 0 };
    for (const term of negatives) {
      if (toRegExp(term, { regex, caseSensitive }).test(text)) return { match: false, score: 0, hits: 0 };
    }
    if (!positives.length) return { match: true, score: 0, hits: 0 };
    let found = 0, score = 0, hits = 0;
    for (const term of positives) {
      const expression = toRegExp(term, { regex, caseSensitive });
      const matches = text.match(expression);
      if (!matches || !matches.length) continue;
      found += 1;
      hits += matches.length;
      const first = text.search(expression);
      const positionBonus = 1 - Math.min(1, Math.max(0, first) / Math.max(1, text.length));
      score += Math.min(5, matches.length) * (1 + positionBonus * 0.6) + (term.includes(' ') ? 1.5 : 0);
    }
    const match = mode === 'and' ? found === positives.length : found > 0;
    return { match, score: match ? score : 0, hits };
  };
}

export function rankItems(items, matcher) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const result = matcher(typeof item === 'string' ? item : searchableText(item));
      return { item, index, ...result };
    })
    .filter((entry) => entry.match)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => ({ ...entry.item, relevance: Math.round(entry.score * 10) / 10, hitCount: entry.hits }));
}

export function searchableText(item) {
  return [item && item.text, item && item.context, item && item.url].filter(Boolean).join(' ');
}

export function snippet(text, terms, max = 190) {
  const value = String(text || '');
  if (value.length <= max) return value;
  let position = -1;
  for (const term of (Array.isArray(terms) ? terms : [terms]).filter(Boolean)) {
    const found = value.toLowerCase().indexOf(String(term).toLowerCase());
    if (found >= 0 && (position < 0 || found < position)) position = found;
  }
  const start = position < 0 ? 0 : Math.max(0, position - Math.floor(max / 3));
  return (start ? '…' : '') + value.slice(start, start + max) + (start + max < value.length ? '…' : '');
}

export function highlight(text, terms, { caseSensitive = false } = {}) {
  const escaped = escapeHtml(text);
  const expressions = (Array.isArray(terms) ? terms : [terms]).filter(Boolean)
    .map((term) => toRegExp(term, { regex: false, caseSensitive }));
  if (!expressions.length) return escaped;
  const pattern = new RegExp('(' + expressions.map((expression) => expression.source).join('|') + ')', caseSensitive ? 'g' : 'gi');
  // Applica i mark sul testo già escapato: i termini con caratteri speciali HTML non combaceranno, ed è accettabile.
  return escaped.replace(pattern, '<mark>$1</mark>');
}
