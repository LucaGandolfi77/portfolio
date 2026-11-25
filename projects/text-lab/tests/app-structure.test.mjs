import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { dictKeys, initLang, languageName, t } from '../js/i18n.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '..');
const read = (file) => readFileSync(join(APP, file), 'utf8');

const html = read('index.html');
const app = read('js/app.js');
const css = [
  read('css/app.css'),
  read('../_shared/tokens.css'),
  read('../_shared/base.css'),
  read('../_shared/shell.css')
].join('\n');

function attrs(source) {
  const out = {};
  for (const match of source.matchAll(/([A-Za-z_:][\w:.-]*)="([^"]*)"/g)) out[match[1]] = match[2];
  return out;
}

function localAsset(ref) {
  if (!ref || /^(?:[a-z]+:|\/\/|#)/i.test(ref)) return null;
  const clean = ref.split('?')[0].split('#')[0];
  return clean ? resolve(APP, clean) : null;
}

function pngSize(file) {
  const buffer = readFileSync(file);
  assert.equal(buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const htmlKeys = [...html.matchAll(/data-i18n(?:-placeholder|-aria|-title)?="([^"]+)"/g)].map(
  (match) => match[1]
);

test('index.html: struttura, meta e accessibilità di base', () => {
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<html lang="en" data-skin="lab">/);
  assert.match(html, /name="viewport" content="[^"]*width=device-width[^"]*viewport-fit=cover/);
  assert.match(html, /<meta name="theme-color" content="#0a0d16">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/lucagandolfi77\.github\.io\/portfolio\/projects\/text-lab\/">/);
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
  assert.match(html, /<link rel="apple-touch-icon" href="icons\/apple-touch-icon\.png">/);
  assert.match(html, /<noscript>/);

  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  assert.match(html, /<header\s+data-project-shell/);
  assert.match(html, /data-id="text-lab"/);
  assert.match(html, /data-heading="div"/);
  assert.match(html, /data-languages="en,it"/);

  for (const [, raw] of html.matchAll(/<button\b([^>]*)>/g)) {
    assert.match(raw, /\btype="button"|type="submit"/, `bottone senza type: ${raw.trim()}`);
  }
  for (const [raw] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    assert.match(raw, /\brel="[^"]*noopener/, `target blank senza noopener: ${raw}`);
  }
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i, 'handler inline non ammessi');
});

test('index.html: id unici, riferimenti del controller e ARIA validi', () => {
  const all = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(all).size, all.length, 'id duplicati');

  const refs = new Set();
  for (const match of app.matchAll(/\$\('#([\w-]+)'/g)) refs.add(match[1]);
  for (const match of app.matchAll(/getElementById\('([\w-]+)'\)/g)) refs.add(match[1]);
  const missing = [...refs].filter((id) => !ids.has(id)).sort();
  assert.deepEqual(missing, [], `id usati da app.js ma assenti: ${missing.join(', ')}`);

  for (const match of html.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
    assert.ok(ids.has(match[1]), `ARIA verso id inesistente: ${match[1]}`);
  }
});

test('asset locali, Tesseract vendorizzato e manifest PWA', () => {
  for (const [, tag, raw] of html.matchAll(/<(script|link)\b([^>]*)>/g)) {
    const map = attrs(raw);
    const ref = tag === 'script' ? map.src : map.href;
    if (!ref) continue;
    if (tag === 'link' && map.rel && !/stylesheet|manifest|icon|apple-touch-icon/.test(map.rel)) continue;
    const file = localAsset(ref);
    assert.ok(file, `asset remoto non consentito: ${ref}`);
    assert.ok(existsSync(file) && statSync(file).isFile(), `asset mancante: ${ref}`);
  }

  for (const file of [
    'tesseract.min.js',
    'worker.min.js',
    'core/tesseract-core-lstm.wasm.js',
    'core/tesseract-core-simd-lstm.wasm.js',
    'lang/eng.traineddata.gz',
    'lang/ita.traineddata.gz'
  ]) {
    const path = join(APP, 'js/vendor/tesseract', file);
    assert.ok(existsSync(path), `file Tesseract mancante: ${file}`);
    assert.ok(statSync(path).size > 1000);
  }
  assert.match(read('js/vendor/tesseract/NOTICE.md'), /tesseract\.js@5\.1\.1/);
  assert.match(read('js/vendor/tesseract/LICENSE-tesseract-core'), /Apache License/i);

  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './index.html');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.theme_color, '#0a0d16');
  assert.match(manifest.description, /OCR/i);

  const sizes = new Set();
  for (const icon of manifest.icons.filter((entry) => entry.type === 'image/png')) {
    const file = localAsset(icon.src);
    assert.ok(file && existsSync(file), `icona mancante: ${icon.src}`);
    const { width, height } = pngSize(file);
    assert.equal(`${width}x${height}`, icon.sizes);
    sizes.add(icon.sizes);
  }
  assert.ok(sizes.has('192x192'));
  assert.ok(sizes.has('512x512'));
  assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable' && icon.sizes === '512x512'));
  assert.ok(manifest.icons.some((icon) => icon.type === 'image/svg+xml'));
  assert.match(read('icon.svg'), /viewBox="0 0 512 512"/);
});

test('service worker: shell, worker Tesseract e cache dei core', () => {
  const sw = read('sw.js');
  assert.match(sw, /var CACHE = 'pf-text-lab-shell-v1'/);
  for (const event of ['install', 'activate', 'fetch']) {
    assert.match(sw, new RegExp(`addEventListener\\('${event}'`));
  }
  assert.match(sw, /skipWaiting\(\)/);
  assert.match(sw, /clients\.claim\(\)/);
  assert.match(sw, /cache\.addAll\(CORE\)/);
  assert.match(sw, /response\.status === 200/);

  const list = sw.match(/var CORE = \[([\s\S]*?)\];/);
  const core = new Set([...list[1].matchAll(/'([^']+)'/g)].map((match) => posix.normalize(match[1])));
  const expected = new Set();
  for (const [, tag, raw] of html.matchAll(/<(script|link)\b([^>]*)>/g)) {
    const map = attrs(raw);
    const ref = tag === 'script' ? map.src : map.href;
    if (!ref) continue;
    if (tag === 'link' && map.rel && !/stylesheet|manifest|icon|apple-touch-icon/.test(map.rel)) continue;
    expected.add(posix.normalize(ref));
  }

  const modules = ['js/app.js'];
  const seen = new Set();
  while (modules.length) {
    const rel = modules.pop();
    if (seen.has(rel)) continue;
    seen.add(rel);
    expected.add(rel);
    for (const match of read(rel).matchAll(/from\s+'(\.\.?\/[^']+)'/g)) {
      modules.push(posix.normalize(posix.join(posix.dirname(rel), match[1])));
    }
  }

  for (const asset of expected) {
    assert.ok(core.has(asset), `asset non in cache: ${asset}`);
    const file = localAsset(asset);
    assert.ok(file && existsSync(file), `asset referenziato ma assente: ${asset}`);
  }

  for (const file of [
    'core/tesseract-core-lstm.wasm.js',
    'core/tesseract-core-simd-lstm.wasm.js',
    'lang/eng.traineddata.gz',
    'lang/ita.traineddata.gz'
  ]) {
    assert.ok(existsSync(join(APP, 'js/vendor/tesseract', file)), `asset runtime mancante: ${file}`);
  }
});

test('i18n: dizionari completi e chiavi dinamiche', () => {
  const en = dictKeys('en');
  const it = dictKeys('it');
  assert.deepEqual(en.slice().sort(), it.slice().sort(), 'chiavi EN/IT non allineate');
  assert.ok(en.length >= 100, `dizionario troppo piccolo: ${en.length}`);

  for (const lang of ['en', 'it']) {
    initLang(lang);
    for (const key of en) {
      assert.ok(String(t(key)).trim().length > 0, `traduzione vuota (${lang}): ${key}`);
    }
    assert.ok(languageName('eng').length > 0);
    assert.ok(languageName('ita').length > 0);
    assert.ok(languageName('eng+ita').length > 0);
  }

  const required = new Set(htmlKeys);
  for (const key of [
    'cameraIdle',
    'cameraStarting',
    'cameraReady',
    'cameraError',
    'cameraDenied',
    'cameraNotFound',
    'cameraBusy',
    'cameraInsecure',
    'cameraUnsupported',
    'imageType',
    'imageSize',
    'imageEmpty',
    'engineReady',
    'engineLoading',
    'engineError',
    'ocrError',
    'progressCore',
    'progressInit',
    'progressLang',
    'progressApi',
    'progressRecognize',
    'confidenceHigh',
    'confidenceMedium',
    'confidenceLow',
    'minutes',
    'newImage',
    'historyRestored',
    'deleted',
    'cleaned',
    'cleared',
    'speechUnsupported'
  ]) {
    required.add(key);
  }
  for (const match of app.matchAll(/\bt\(\s*'([A-Za-z][\w-]*)'\s*[,)]/g)) required.add(match[1]);

  for (const lang of ['en', 'it']) {
    const keys = new Set(dictKeys(lang));
    const missing = [...required].filter((key) => !keys.has(key)).sort();
    assert.deepEqual(missing, [], `chiavi senza traduzione (${lang}): ${missing.join(', ')}`);
  }
});

test('CSS: classi usate definite e requisiti mobile', () => {
  const classes = new Set();
  for (const match of html.matchAll(/class="([^"]+)"/g)) {
    for (const name of match[1].split(/\s+/)) if (name) classes.add(name);
  }
  for (const match of app.matchAll(/className = '([^']+)'/g)) {
    for (const name of match[1].split(/\s+/)) if (name) classes.add(name);
  }
  for (const name of [
    'is-camera',
    'is-image',
    'is-running',
    'has-image',
    'is-drag',
    'is-visible',
    'textlab-btn__label',
    'textlab-history__item',
    'textlab-history__open',
    'textlab-history__preview',
    'textlab-history__meta',
    'textlab-history__remove',
    'textlab-noscript',
    'textlab-textarea',
    'textlab-stats',
    'textlab-actions',
    'textlab-processing__card'
  ]) {
    classes.add(name);
  }

  const missing = [...classes].filter((name) => !css.includes(`.${name}`)).sort();
  assert.deepEqual(missing, [], `classi senza stile: ${missing.join(', ')}`);
  assert.match(css, /100dvh/);
  assert.match(css, /--pf-safe-bottom/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /font-size:\s*16px/);
  assert.match(read('../_shared/base.css'), /prefers-reduced-motion/);
});

test('catalogo, redirect legacy e service worker root', () => {
  const catalog = read('../../assets/js/projects-data.js');
  assert.equal((catalog.match(/"id": "text-lab"/g) || []).length, 1);
  assert.match(catalog, /"href": "projects\/text-lab\/"/);
  assert.doesNotMatch(catalog, /text_recognition\.html/);
  assert.doesNotMatch(read('../../assets/js/catalog-data.js'), /text-recognition/);

  const redirect = read('../../projects/text-lab/legacy-text_recognition.html');
  assert.match(redirect, /<link rel="canonical" href="https:\/\/lucagandolfi77\.github\.io\/portfolio\/projects\/text-lab\/">/);
  assert.match(redirect, /http-equiv="refresh" content="0; url=\.\/index\.html#camera"/);
  assert.match(redirect, /var target = '\.\/index\.html' \+ location\.search \+ '#camera';/);
  assert.match(redirect, /location\.replace\(target\)/);
  assert.match(redirect, /name="robots" content="noindex, follow"/);
  assert.doesNotMatch(redirect, /https?:\/\/(?:unpkg|cdn|cdnjs)/);

  assert.match(read('../../sw.js'), /name\.startsWith\('portfolio-'\)/);
  assert.match(read('../../sw.js'), /isNestedApp/);
});

test('sicurezza: nessun CDN e storage con prefisso', () => {
  assert.doesNotMatch(html, /<script[^>]+src="https?:/i);
  assert.doesNotMatch(html, /<link[^>]+rel="stylesheet"[^>]+href="https?:/i);
  assert.doesNotMatch(app, /\beval\s*\(|new Function\s*\(|document\.write\s*\(/);
  assert.doesNotMatch(app, /localStorage/);
  assert.doesNotMatch(app, /['"]https?:\/\//, 'nessun URL remoto nel controller');
  const storage = read('js/storage.js');
  assert.match(storage, /SETTINGS_KEY = 'pf\.text\.settings'/);
  assert.match(storage, /HISTORY_KEY = 'pf\.text\.history'/);
  assert.doesNotMatch(read('sw.js'), /https?:\/\//, 'service worker senza richieste remote');
});
