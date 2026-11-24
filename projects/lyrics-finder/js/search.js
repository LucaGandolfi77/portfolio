/* Reverse Lyrics Finder — pure search/ranking/highlight helpers */

export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9à-ÿ' ]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanQuery(text) {
  return normalize(text)
    .replace(/\b(lyrics|testo|parole|song|canzone|official|video)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokens(text, min = 3) {
  return normalize(text).split(' ').filter(w => w.replace(/[^a-z0-9']/gi, '').length >= min);
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}
function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export function scoreTrack(track, query) {
  const q = cleanQuery(query);
  const words = tokens(q);
  if (!words.length) return 0;
  const hay = normalize(`${track.trackName || ''} ${track.artistName || ''} ${track.collectionName || ''}`);
  const exact = q.length >= 4 && (hay.includes(q) || q.includes(normalize(track.trackName || '')));
  let matched = 0;
  const seen = new Set();
  for (const w of words) {
    if (seen.has(w)) continue;
    seen.add(w);
    if (hay.includes(w)) matched++;
  }
  const ratio = matched / seen.size;
  let score = Math.round(ratio * 82 + (exact ? 18 : 0));
  if (matched === seen.size && seen.size >= 3) score = Math.max(score, 85);
  return Math.max(0, Math.min(100, score));
}

export function dedupe(list) {
  const seen = new Set();
  return list.filter(t => {
    if (!t || t.kind !== 'song' || !t.trackName) return false;
    const key = (t.trackId || '') + '|' + normalize(t.artistName || '') + '|' + normalize(t.trackName);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function rankTracks(list, query) {
  return dedupe(list)
    .map(t => ({ ...t, matchScore: scoreTrack(t, query) }))
    .sort((a, b) => b.matchScore - a.matchScore || String(a.trackName).localeCompare(String(b.trackName)));
}

export function highlightHtml(text, query, exact = false) {
  const safe = escapeHtml(text);
  const q = cleanQuery(query);
  if (!q) return safe;
  let patterns;
  if (exact) {
    patterns = [q];
  } else {
    patterns = [...new Set(tokens(q))].slice(0, 8).map(w => w.replace(/'/g, "['’]"));
  }
  if (!patterns.length) return safe;
  const re = new RegExp('(' + patterns.map(escapeRe).join('|') + ')', 'gi');
  return safe.replace(re, '<mark>$1</mark>');
}

export function maskQuery(text) {
  const words = tokens(text);
  if (words.length < 4) return text;
  return words.slice(0, 5).join(' ');
}
