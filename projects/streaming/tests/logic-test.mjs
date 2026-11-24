import { test, eq, ok, summary } from '../../../games/_kit/test-harness.js';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const store = new Map();
globalThis.localStorage = {
  getItem: k => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};
globalThis.window = { addEventListener() {}, dispatchEvent() {} };
globalThis.document = { documentElement: { lang: '' }, querySelectorAll: () => [] };

const api = await import(join(ROOT, 'js/api.js'));
const storage = await import(join(ROOT, 'js/storage.js'));
const { STR, CATEGORIES, SORTS } = await import(join(ROOT, 'js/config.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, fn) => cases.push([n, fn]);

// ---- api ----
run('buildQuery composes lucene clauses', () => {
  const q = api.buildQuery('duck and cover', { category: 'prelinger', publicDomain: true, yearFrom: 1930, yearTo: 1950 });
  ok(q.includes('(duck) AND (and) AND (cover)'));
  ok(q.includes('collection:prelinger'));
  ok(q.includes('licenseurl:*publicdomain*'));
  ok(q.includes('year:[1930 TO 1950]'));
});
run('buildQuery defaults to movies', () => {
  const q = api.buildQuery('science');
  ok(q.includes('mediatype:movies'));
});
run('searchUrl sets sort, fields and pagination', () => {
  const u = new URL(api.searchUrl('test', { sort: 'week desc', page: 3, rows: 12 }));
  eq(u.hostname, 'archive.org');
  eq(u.searchParams.get('q'), 'test');
  eq(u.searchParams.get('sort[]'), 'week desc');
  eq(u.searchParams.get('page'), '3');
  eq(u.searchParams.get('rows'), '12');
  ok((u.toString().match(/fl%5B%5D/g) || []).length >= 6);
});
run('normalizeDoc extracts metadata', () => {
  const d = api.normalizeDoc({ identifier: 'abc', title: 'Film', creator: ['Me'], date: '1942-01-01',
    downloads: 1500, licenseurl: 'http://creativecommons.org/licenses/publicdomain/' });
  eq(d.id, 'abc'); eq(d.year, '1942'); eq(d.downloads, 1500); eq(d.publicDomain, true);
  ok(d.thumb.includes('abc'));
});
run('archive URLs are canonical and encoded', () => {
  const u = api.fileUrl('my id', 'folder/my video.mp4');
  ok(u.startsWith('https://archive.org/download/'));
  ok(u.includes('my%20id'));
  ok(u.includes('my%20video.mp4'));
  ok(api.detailsUrl('x').startsWith('https://archive.org/details/'));
});
run('selectVideo prefers a small playable derivative', () => {
  const files = [
    { name: 'original.mov', format: 'Original', size: 900e6 },
    { name: '512kb.mp4', format: '512Kb MPEG4', size: 40e6 },
    { name: 'meta.xml', format: 'Metadata', size: 100 }
  ];
  eq(api.selectVideo(files).name, '512kb.mp4');
  eq(api.selectVideo([files[2], files[0]]).name, 'original.mov');
  eq(api.selectVideo([]), null);
});
run('youtube detection and id extraction', () => {
  eq(api.ytIdOf('https://www.youtube.com/watch?v=abc123XYZ'), 'abc123XYZ');
  eq(api.ytIdOf('https://youtu.be/abc123XYZ'), 'abc123XYZ');
  ok(api.isYoutube('https://youtube.com/shorts/abc123XYZ'));
  ok(api.isDirectVideo('https://x.com/video.mp4?token=1'));
  ok(!api.isDirectVideo('https://x.com/page'));
});
run('search parses docs and numFound', async () => {
  const fake = async () => ({ ok: true, json: async () => ({ response: { numFound: 2, docs: [
    { identifier: 'a', title: 'A' }, { identifier: 'b', title: 'B' }
  ] } }) });
  const r = await api.search('test', { fetchImpl: fake });
  eq(r.items.length, 2); eq(r.total, 2); eq(r.items[0].title, 'A');
});

// ---- storage ----
run('settings, favorites, history and queue persist', () => {
  store.clear();
  storage.setSettings({ sort: 'downloads desc', publicDomain: true });
  ok(storage.toggleFavorite({ id: 'x', title: 'X' }));
  ok(storage.isFavorite('x'));
  ok(storage.queueAdd({ id: 'q1', title: 'Q' }));
  storage.addHistory({ id: 'h1', title: 'H' });
  eq(storage.profile.settings.sort, 'downloads desc');
  eq(storage.profile.queue.length, 1);
  eq(storage.profile.history.length, 1);
});
run('cache TTL expires', () => {
  storage.cachePut('k', ['a'], 1000);
  ok(storage.cacheGet('k', 5000, 2000));
  eq(storage.cacheGet('k', 500, 2000), null);
});
run('positions persist', () => {
  storage.setPosition('x', 42);
  eq(storage.getPosition('x'), 42);
});

// ---- structure ----
run('filters and dictionaries are coherent', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(CATEGORIES.length >= 10);
  ok(SORTS.some(s => s.id === 'week desc'));
  CATEGORIES.forEach(c => ok(c.en && c.it && c.icon));
});
run('all modules and SW assets exist', () => {
  ['config','i18n','storage','api','player','glass','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n + '.js'));
  ['icon.svg','icons/icon-192.png','icons/icon-512.png','css/app.css'].forEach(p =>
    ok(existsSync(join(ROOT, p)), p));
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  ['api','player','glass','main'].forEach(n => ok(sw.includes('js/' + n + '.js'), n));
});
run('HTML has canonical, shell, liquid glass and no CDN fonts', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
  ok(html.includes('data-project-shell'));
  ok(html.includes('glass'));
  ok(!html.includes('fonts.googleapis.com'));
});
run('manifest has icons and correct scope', () => {
  const m = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
  eq(m.scope, './'); ok(m.icons.length >= 2);
});

for (const [n, fn] of cases) { total++; if (test(n, fn)) passed++; }
summary(passed, total);
