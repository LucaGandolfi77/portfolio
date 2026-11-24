/** results.js — unione, dedupe e filtro dei risultati (puro). */

import { normalizeUrl, hostname } from './url.js';

export const TABS = ['links', 'images', 'text', 'headings', 'meta', 'source'];

export function emptyResults() {
  return { links: [], images: [], text: [], headings: [], meta: [], source: [] };
}

export function mergeResults(target, source) {
  for (const key of TABS) {
    if (Array.isArray(source && source[key]) && source[key].length) {
      target[key].push(...source[key]);
    }
  }
  return target;
}

export function dedupeResults(results) {
  const seen = {};
  for (const key of TABS) seen[key] = new Set();
  for (const key of TABS) {
    results[key] = (results[key] || []).filter((item) => {
      const identity = key === 'links' || key === 'images' || key === 'source'
        ? normalizeUrl(item.url || '') || String(item.text || '')
        : String(item.text || '') + '|' + String(item.name || '');
      if (!identity || seen[key].has(identity)) return false;
      seen[key].add(identity);
      return true;
    });
  }
  return results;
}

export function countResults(results) {
  const counts = {};
  let total = 0;
  for (const key of TABS) {
    counts[key] = (results && results[key] && results[key].length) || 0;
    total += counts[key];
  }
  return { counts, total };
}

export function filterResults(results, { tab = 'all', query = '', domain = '' } = {}) {
  const source = tab === 'all' ? TABS.flatMap((key) => (results[key] || []).map((item) => ({ ...item, type: key }))) : (results[tab] || []).map((item) => ({ ...item, type: tab }));
  const needle = String(query || '').toLowerCase().trim();
  const host = String(domain || '').toLowerCase().trim();
  return source.filter((item) => {
    if (host && !hostname(item.url || item.sourceUrl || '').includes(host)) return false;
    if (!needle) return true;
    return [item.text, item.context, item.url, item.name].filter(Boolean).join(' ').toLowerCase().includes(needle);
  });
}

export function sortByRelevance(items) {
  return items.slice().sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
}
