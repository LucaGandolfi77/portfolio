/* Radio — test logici (node projects/radio/test/logic-test.js) */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const store = {};
global.localStorage = { getItem(k){ return store[k] || null; }, setItem(k,v){ store[k]=String(v); }, removeItem(k){ delete store[k]; } };
global.window = global;
global.AbortController = class { constructor(){ this.signal = {}; } abort(){} };
global.fetch = function () { return Promise.reject(new Error('offline')); };
global.setTimeout = function (f) { f(); return 1; };
global.clearTimeout = function () {};

const base = path.join(__dirname, '..', 'js');
['stations.js', 'api.js', 'storage.js'].forEach(function (f) { eval(fs.readFileSync(path.join(base, f), 'utf8')); });

const S = window.RadioStations, A = window.RadioApi, ST = window.RadioStorage;
let passed = 0;
const tests = [];
function test(name, fn) { tests.push({ name: name, fn: fn }); }

test('catalogo locale di 50 stazioni', function () { assert.strictEqual(S.STATIONS.length, 50); });
test('URL unici e validi', function () {
  const urls = S.STATIONS.map(function (s) { return s.url; });
  assert.strictEqual(new Set(urls).size, 50);
  urls.forEach(function (u) { assert.ok(/^https?:\/\//.test(u)); });
});
test('stazioni complete dei campi chiave', function () {
  S.STATIONS.forEach(function (s) {
    assert.ok(s.name && s.url && typeof s.votes === 'number');
  });
});
test('filtro locale: top', function () {
  const top = S.localFilter('top');
  assert.strictEqual(top.length, 50);
  assert.ok(top[0].votes >= top[1].votes);
});
test('filtro locale: paese', function () {
  const it = S.localFilter('cc', 'IT');
  assert.ok(it.length > 0);
  it.forEach(function (s) { assert.strictEqual(s.countrycode, 'IT'); });
});
test('filtro locale: tag e ricerca', function () {
  assert.ok(Array.isArray(S.localFilter('tag', 'jazz')));
  assert.ok(Array.isArray(S.localFilter('search', 'radio')));
});
test('emoji e favicon', function () {
  assert.strictEqual(S.emojiFor({ tags: 'jazz', name: 'X' }), '🎷');
  assert.strictEqual(S.emojiFor({ tags: '', name: 'X' }), '🎙️');
  assert.ok(S.faviconFor({ url: 'https://example.com/stream' }).includes('duckduckgo'));
});
test('endpoint paese corretto (bycountrycodeexact)', function () {
  const ep = A.endpoint('cc', 'IT');
  assert.ok(ep.includes('/stations/bycountrycodeexact/IT'));
  assert.ok(!ep.includes('/stations/bycountrycode/'));
});
test('endpoint search/tag/top', function () {
  assert.ok(A.endpoint('search','jazz').includes('/stations/search?name=jazz'));
  assert.ok(A.endpoint('tag','rock').includes('/stations/bytag/rock'));
  assert.ok(A.endpoint('top').includes('/stations/topvote/50'));
});
test('6 mirror configurati', function () { assert.strictEqual(A.MIRRORS.length, 6); });
test('dedupe per URL', function () {
  const data = [{url_resolved:'http://a'}, {url:'http://a'}, {url_resolved:'http://b'}];
  assert.strictEqual(A.dedupe(data).length, 2);
});
test('fallback offline restituisce il catalogo locale', async function () {
  const res = await A.fetchList('top');
  assert.strictEqual(res.offline, true);
  assert.strictEqual(res.items.length, 50);
});
test('fallback offline filtra per paese', async function () {
  const res = await A.fetchList('cc', 'IT');
  assert.strictEqual(res.offline, true);
  assert.ok(res.items.length > 0);
  res.items.forEach(function (s) { assert.strictEqual(s.countrycode, 'IT'); });
});
test('preferite: toggle e persistenza', function () {
  ST.load();
  const st = S.STATIONS[0];
  assert.strictEqual(ST.toggleFav(st), true);
  assert.strictEqual(ST.toggleFav(st), false);
  ST.load();
  assert.strictEqual(ST.favs.length, 0);
});
test('impostazioni: volume e mute', function () {
  ST.load();
  ST.set('volume', 0.4);
  ST.set('muted', true);
  ST.load();
  assert.strictEqual(ST.settings.volume, 0.4);
  assert.strictEqual(ST.settings.muted, true);
});

(async function () {
  for (const t of tests) {
    try { await t.fn(); console.log('✓', t.name); passed++; }
    catch (e) { console.error('✗', t.name, '\n ', e.message); process.exitCode = 1; }
  }
  console.log('\n' + passed + ' test superati.');
})();
