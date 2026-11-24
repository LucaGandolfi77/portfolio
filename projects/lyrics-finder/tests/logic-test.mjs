import { test, eq, ok, summary } from '../../../games/_kit/test-harness.js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const store = new Map();
globalThis.localStorage = {
  getItem: k => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};
globalThis.window = { addEventListener() {}, dispatchEvent() {} };
globalThis.document = { documentElement: { lang: '', dataset: {} }, querySelectorAll: () => [] };

const { normalize, cleanQuery, tokens, scoreTrack, dedupe, rankTracks, highlightHtml, maskQuery } =
  await import(join(ROOT, 'js/search.js'));
const { searchUrl, lyricsUrl, fetchTracks, fetchLyrics, ApiError, searchTerms } =
  await import(join(ROOT, 'js/api.js'));
const storage = await import(join(ROOT, 'js/storage.js'));
const { STR } = await import(join(ROOT, 'js/config.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, f) => cases.push([n, f]);

// ---- search ----
run('normalize strips punctuation and lowercases', () => {
  eq(normalize("  We Will, We Will Rock You!  "), 'we will we will rock you');
  ok(normalize("L'Estate Addosso").includes("l'estate"));
});
run('cleanQuery removes noise words', () => {
  eq(cleanQuery('bohemian rhapsody lyrics official video'), 'bohemian rhapsody');
});
run('tokens filters short words', () => {
  ok(tokens('a an the is real life').every(w => w.length >= 3));
  ok(!tokens('a an the is real life').includes('an'));
});
run('scoreTrack ranks a matching title higher', () => {
  const q = 'never gonna give you up';
  const good = scoreTrack({ trackName: 'Never Gonna Give You Up', artistName: 'Rick Astley' }, q);
  const bad = scoreTrack({ trackName: 'Cold Heart', artistName: 'Elton John' }, q);
  ok(good > bad); ok(good >= 80);
});
run('dedupe removes duplicate track ids', () => {
  const list = [
    { kind: 'song', trackId: 1, trackName: 'A', artistName: 'X' },
    { kind: 'song', trackId: 1, trackName: 'A', artistName: 'X' },
    { kind: 'song', trackId: 2, trackName: 'B', artistName: 'Y' }
  ];
  eq(dedupe(list).length, 2);
});
run('rankTracks sorts by score descending', () => {
  const q = 'we will rock you';
  const list = [
    { kind: 'song', trackId: 1, trackName: 'Another One', artistName: 'X' },
    { kind: 'song', trackId: 2, trackName: 'We Will Rock You', artistName: 'Queen' }
  ];
  const ranked = rankTracks(list, q);
  eq(ranked[0].trackId, 2);
});
run('highlightHtml escapes and marks matches', () => {
  const out = highlightHtml('<script>alert(1)</script> we will rock you', 'we will rock you');
  ok(out.includes('<mark>'));
  ok(!out.includes('<script>'));
});
run('exact highlight keeps whole phrase', () => {
  const out = highlightHtml('the real life is fantasy', 'real life', true);
  ok(out.includes('<mark>real life</mark>'));
});
run('maskQuery trims long queries', () => {
  const q = 'is this the real life is this just fantasy caught in a landslide';
  ok(maskQuery(q).length < q.length);
});

// ---- api ----
run('searchUrl uses iTunes params', () => {
  const u = new URL(searchUrl('test', { country: 'us', limit: 7 }));
  eq(u.hostname, 'itunes.apple.com');
  eq(u.searchParams.get('term'), 'test');
  eq(u.searchParams.get('country'), 'us');
  eq(u.searchParams.get('limit'), '7');
  eq(u.searchParams.get('entity'), 'song');
});
run('lyricsUrl encodes artist and title', () => {
  const u = lyricsUrl("Guns N' Roses", 'Sweet Child O Mine');
  ok(u.includes('Guns') && u.includes('Roses') && !u.includes(' '));
});
run('fetchTracks normalizes results with injected fetch', async () => {
  const fake = async () => ({ ok: true, json: async () => ({ results: [{ trackId: 1, trackName: 'A' }] }) });
  const tracks = await fetchTracks('a', {}, { fetchImpl: fake });
  eq(tracks.length, 1);
});
run('fetchLyrics throws EMPTY on missing text', async () => {
  let threw = null;
  try { await fetchLyrics('A', 'B', { fetchImpl: async () => ({ ok: true, json: async () => ({ lyrics: '' }) }) }); }
  catch (e) { threw = e; }
  ok(threw instanceof ApiError); eq(threw.kind, 'EMPTY');
});
run('searchTerms adds a shorter fallback', () => {
  const terms = searchTerms('is this the real life is this just fantasy caught in a landslide');
  ok(terms.length === 2);
});

// ---- storage ----
run('settings merge with defaults', () => {
  store.clear();
  const s = storage.loadSettings();
  eq(s.country, 'it'); eq(s.limit, 20);
  storage.saveSettings({ country: 'us' });
  eq(storage.loadSettings().country, 'us');
});
run('recents dedupe and cap', () => {
  store.clear();
  storage.addRecent('first'); storage.addRecent('second'); storage.addRecent('FIRST');
  const list = storage.loadRecent();
  eq(list.length, 2); eq(list[0], 'FIRST');
});
run('favorites toggle', () => {
  store.clear();
  const t1 = { trackId: 7, trackName: 'A', artistName: 'B' };
  eq(storage.toggleFavorite(t1), true);
  ok(storage.isFavorite(7));
  eq(storage.toggleFavorite(t1), false);
  ok(!storage.isFavorite(7));
});
run('cache TTL and stale flag', () => {
  store.clear();
  let c = storage.putCache({}, 'k', ['a'], 1000);
  ok(storage.getCache(c, 'k', 5000, 2000).data.length === 1);
  const stale = storage.getCache(c, 'k', 5000, 10000);
  ok(stale.stale);
});

// ---- structure ----
run('EN/IT dictionaries aligned', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(Object.values(STR.en).every(v => typeof v === 'string' && v.length));
});
run('all local modules exist', () => {
  ['config','i18n','storage','search','api','audio','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n + '.js'));
});
run('SW precache lists every module and local asset', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  const listed = [...sw.matchAll(/'\.\/([^']+)'/g)].map(m => m[1]);
  ['index.html','manifest.webmanifest','css/app.css'].forEach(f =>
    ok(listed.includes(f), f));
  ['config','i18n','storage','search','api','audio','ui','main'].forEach(n =>
    ok(listed.includes('js/' + n + '.js'), 'js/' + n + '.js'));
});
run('manifest has real icons and canonical in HTML', () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
  ok(manifest.icons.length >= 2);
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
});

for (const [name, fn] of cases) { total++; if (test(name, fn)) passed++; }
summary(passed, total);
