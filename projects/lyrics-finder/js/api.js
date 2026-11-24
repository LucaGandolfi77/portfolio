/* Reverse Lyrics Finder — API clients with injectable fetch and abort support */
import { ITUNES, LYRICS_OVH } from './config.js';
import { maskQuery } from './search.js';

export class ApiError extends Error {
  constructor(kind, message) { super(message); this.name = 'ApiError'; this.kind = kind; }
}

export function searchUrl(query, settings = {}) {
  const u = new URL(ITUNES);
  u.searchParams.set('term', query);
  u.searchParams.set('media', 'music');
  u.searchParams.set('entity', 'song');
  u.searchParams.set('limit', String(settings.limit || 20));
  u.searchParams.set('country', settings.country || 'it');
  return u.toString();
}

export function lyricsUrl(artist, title) {
  return `${LYRICS_OVH}/${encodeURIComponent(artist || 'unknown')}/${encodeURIComponent(title || '')}`;
}

async function request(url, { fetchImpl = fetch, signal, timeout = 12000, lang } = {}) {
  let controller = signal;
  let timer = null;
  if (!controller && typeof AbortController !== 'undefined') {
    controller = new AbortController();
    timer = setTimeout(() => controller.abort(), timeout);
  }
  try {
    const headers = {};
    if (lang) headers['Accept-Language'] = lang;
    const res = await fetchImpl(url, { signal: controller?.signal, headers });
    if (!res.ok) throw new ApiError('HTTP', 'HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    if (e && e.name === 'AbortError') throw e;
    if (e instanceof ApiError) throw e;
    throw new ApiError('NETWORK', e && e.message ? e.message : 'Network error');
  } finally { if (timer) clearTimeout(timer); }
}

export async function fetchTracks(query, settings = {}, opts = {}) {
  const data = await request(searchUrl(query, settings), opts);
  return Array.isArray(data.results) ? data.results : [];
}

export async function fetchLyrics(artist, title, opts = {}) {
  const data = await request(lyricsUrl(artist, title), opts);
  const lyrics = String(data.lyrics || '').trim();
  if (!lyrics) throw new ApiError('EMPTY', 'No lyrics');
  return lyrics;
}

export function searchTerms(query) {
  const q = String(query || '').trim();
  const alt = maskQuery(q);
  return alt && alt !== q ? [q, alt] : [q];
}
