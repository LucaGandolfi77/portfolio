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

const codec = await import(join(ROOT, 'js/codec.js'));
const wav = await import(join(ROOT, 'js/wav.js'));
const train = await import(join(ROOT, 'js/train.js'));
const storage = await import(join(ROOT, 'js/storage.js'));
const { STR, MORSE } = await import(join(ROOT, 'js/config.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, f) => cases.push([n, f]);

// ---- codec ----
run('encode maps letters, digits and punctuation', () => {
  eq(codec.encode('SOS').morse, '... --- ...');
  eq(codec.encode('1').morse, '.----');
  eq(codec.encode('?').morse, '..--..');
});
run('encode separates words with slash', () => {
  eq(codec.encode('HI THERE').morse, '.... .. / - .... . .-. .');
});
run('encode reports unknown characters', () => {
  const r = codec.encode('A#€');
  eq(r.morse, '.-');
  ok(r.unknown.includes('#'));
});
run('normalize unicode bullets and dashes', () => {
  eq(codec.normalizeSymbols('••• −−− /'), '... --- /');
});
run('decode tokens and word gaps', () => {
  eq(codec.decode('... --- ...').text, 'SOS');
  eq(codec.decode('.... .. / - .... . .-. .').text, 'HI THERE');
});
run('decode strict marks unknown tokens', () => {
  eq(codec.decode('... .-..-', { strict: true }).text, 'S?');
});
run('decodeCompact handles sequences without spaces', () => {
  const encoded = codec.encode('SOS').morse.replace(/\s+/g, '');
  const res = codec.decodeCompact(encoded);
  ok(res.text.length > 0);
  eq(res.errors, 0);
});
run('autoDecode chooses token or compact mode', () => {
  eq(codec.autoDecode('... --- ...').text, 'SOS');
  ok(codec.autoDecode('...---...').text.length > 0);
});
run('round-trip common phrases', () => {
  for (const phrase of ['HELLO WORLD', 'SOS', 'MORSE 123', 'CIAO?']) {
    eq(codec.decode(codec.encode(phrase).morse).text, phrase);
  }
});
run('validateMorse flags invalid characters', () => {
  ok(codec.validateMorse('... ---').valid);
  ok(!codec.validateMorse('... xyz').valid);
});
run('stats counts symbols and units', () => {
  const s = codec.stats('... --- ...');
  eq(s.dots, 6); eq(s.dashes, 3); eq(s.symbols, 9);
  ok(codec.durationSeconds('... --- ...', 14) > 0);
});

// ---- wav ----
run('buildSegments includes tones and silences', () => {
  const segs = wav.buildSegments('.-', 14);
  ok(segs.some(s => s.type === 'tone'));
  ok(segs.some(s => s.type === 'silence'));
});
run('WAV has a valid header', () => {
  const bytes = wav.buildWav('... --- ...', { wpm: 14 });
  const text = String.fromCharCode(...bytes.slice(0, 4));
  eq(text, 'RIFF');
  eq(String.fromCharCode(...bytes.slice(8, 12)), 'WAVE');
  ok(bytes.length > 44);
});
run('WAV length scales with wpm', () => {
  const slow = wav.buildWav('........', { wpm: 5 }).length;
  const fast = wav.buildWav('........', { wpm: 35 }).length;
  ok(slow > fast);
});

// ---- training ----
run('randomSymbol returns a valid code', () => {
  const s = train.randomSymbol(() => 0.1);
  eq(MORSE[s.char], s.code);
});
run('dictationSequence builds matching morse', () => {
  const d = train.dictationSequence(() => 0.2, 4);
  eq(d.chars.length, 4);
  eq(d.morse, d.chars.split('').map(c => MORSE[c]).join(' '));
});
run('checkGuess normalizes input', () => {
  ok(train.checkGuess('A', ' a '));
  ok(!train.checkGuess('A', 'B'));
});
run('speedWpm scales with time and characters', () => {
  ok(train.speedWpm('AAAAA', 60) === 1);
  ok(train.speedWpm('AAAAA', 30) === 2);
});

// ---- storage ----
run('settings persist and merge', () => {
  store.clear();
  storage.setSettings({ wpm: 20 });
  eq(storage.profile.settings.wpm, 20);
  eq(storage.profile.settings.freq, 700);
});
run('history is capped and restorable', () => {
  storage.clearHistory();
  for (let i = 0; i < 45; i++) storage.pushHistory('t' + i, 'm' + i);
  eq(storage.profile.history.length, 40);
  eq(storage.profile.history[0].input, 't44');
});
run('favorites toggle', () => {
  storage.profile.favorites = [];
  const item = { input: 'HI', output: '.... ..' };
  ok(storage.toggleFavorite(item));
  ok(storage.isFavorite(item));
  ok(!storage.toggleFavorite(item));
});

// ---- structure ----
run('EN/IT dictionaries aligned', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(Object.values(STR.en).every(v => typeof v === 'string' && v.length));
});
run('all modules and SW assets exist', () => {
  ['config','i18n','storage','codec','wav','audio','visualize','train','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n + '.js'));
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  const listed = [...sw.matchAll(/'\.\/([^']+)'/g)].map(m => m[1]);
  ['index.html','manifest.webmanifest','css/app.css'].forEach(f => ok(listed.includes(f), f));
  ['config','i18n','storage','codec','wav','audio','visualize','train','ui','main'].forEach(n =>
    ok(listed.includes('js/' + n + '.js'), 'js/' + n + '.js'));
});
run('HTML has canonical, shell and required ids', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
  ok(html.includes('data-project-shell'));
  ['inputText','outputText','scope','wpm','playBtn','refGrid','trainPanel'].forEach(id =>
    ok(html.includes('id="' + id + '"'), id));
});
run('manifest icons present', () => {
  const m = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
  ok(m.icons.length >= 2);
  ok(existsSync(join(ROOT, 'icons/icon-192.png')));
});
run('no external font CDN', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(!html.includes('fonts.googleapis.com'));
});

for (const [name, fn] of cases) { total++; if (test(name, fn)) passed++; }
summary(passed, total);
