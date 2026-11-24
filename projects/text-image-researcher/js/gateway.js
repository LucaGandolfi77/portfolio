/**
 * gateway.js — strategie di recupero pagine: diretto → Jina → proxy.
 */

export const STRATEGIES = [
  { id: 'direct', label: 'Direct', build: (url) => url },
  { id: 'jina', label: 'r.jina.ai', build: (url) => 'https://r.jina.ai/' + encodeURIComponent(url) },
  { id: 'allorigins', label: 'AllOrigins', build: (url) => 'https://api.allorigins.win/get?url=' + encodeURIComponent(url) },
  { id: 'codetabs', label: 'CodeTabs', build: (url) => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url) },
  { id: 'corsproxy', label: 'CorsProxy', build: (url) => 'https://corsproxy.io/?' + encodeURIComponent(url) }
];

const cache = new Map();

function timeoutSignal(ms) {
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) return AbortSignal.timeout(ms);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

async function readResponse(response, strategyId) {
  const contentType = response.headers.get('content-type') || '';
  if (strategyId === 'allorigins' || contentType.includes('json')) {
    try {
      const data = await response.json();
      if (data && typeof data.contents === 'string') return data.contents;
      if (data && typeof data.body === 'string') return data.body;
      if (typeof data === 'string') return data;
      return JSON.stringify(data);
    } catch (e) { /* torna al testo */ }
  }
  return response.text();
}

/**
 * @returns {{html:string, strategy:string, label:string}}
 */
export async function fetchPage(url, { timeout = 9000, onStatus = () => {}, includeProxies = true } = {}) {
  if (cache.has(url)) return { ...cache.get(url), cached: true };
  const strategies = STRATEGIES.filter((strategy) => includeProxies || strategy.id === 'direct' || strategy.id === 'jina');
  const errors = [];
  for (const strategy of strategies) {
    const target = strategy.build(url);
    onStatus(strategy.id, `Tentativo: ${strategy.label}…`);
    try {
      const response = await fetch(target, { signal: timeoutSignal(timeout), headers: { Accept: 'text/html,text/plain,*/*' } });
      if (!response.ok) { errors.push(`${strategy.label}: HTTP ${response.status}`); continue; }
      const html = await readResponse(response, strategy.id);
      if (!html || html.length < 40) { errors.push(`${strategy.label}: risposta vuota`); continue; }
      const result = { html, strategy: strategy.id, label: strategy.label };
      cache.set(url, result);
      return result;
    } catch (error) {
      errors.push(`${strategy.label}: ${error && error.name === 'TimeoutError' ? 'timeout' : error.message}`);
    }
  }
  const failure = new Error('FETCH_FAILED');
  failure.details = errors;
  throw failure;
}

export function clearCache() { cache.clear(); }

export function strategyLabel(id) {
  const strategy = STRATEGIES.find((item) => item.id === id);
  return strategy ? strategy.label : 'Unknown';
}
