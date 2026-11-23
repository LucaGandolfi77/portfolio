import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { initLang, dictKeys, t, weatherLabel } from '../js/i18n.js';
import { weatherInfo } from '../js/geo.js';

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
  assert.match(html, /<link rel="canonical" href="https:\/\/lucagandolfi77\.github\.io\/portfolio\/projects\/atlas\/">/);
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
  assert.match(html, /<link rel="apple-touch-icon" href="icons\/apple-touch-icon\.png">/);
  assert.match(html, /<noscript>/);

  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  assert.match(html, /<header\s+data-project-shell/);
  assert.match(html, /data-id="atlas"/);
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

test('asset locali, manifest, icone e Leaflet vendorizzato', () => {
  for (const [, tag, raw] of html.matchAll(/<(script|link)\b([^>]*)>/g)) {
    const map = attrs(raw);
    const ref = tag === 'script' ? map.src : map.href;
    if (!ref) continue;
    if (tag === 'link' && map.rel && !/stylesheet|manifest|icon|apple-touch-icon/.test(map.rel)) continue;
    const file = localAsset(ref);
    assert.ok(file, `asset remoto non consentito: ${ref}`);
    assert.ok(existsSync(file) && statSync(file).isFile(), `asset mancante: ${ref}`);
  }

  const leafletCss = read('js/vendor/leaflet/leaflet.css');
  for (const match of leafletCss.matchAll(/url\(([^)]+)\)/g)) {
    const ref = match[1].replace(/['"]/g, '').trim();
    if (!ref || /^(data:|#)/.test(ref)) continue;
    const file = resolve(APP, 'js/vendor/leaflet', ref);
    assert.ok(existsSync(file), `immagine Leaflet mancante: ${ref}`);
  }
  const leafletJs = read('js/vendor/leaflet/leaflet.js');
  assert.match(leafletJs, /version="1\.9\.4"/);
  assert.match(leafletJs, /Leaflet/);
  assert.match(read('js/vendor/leaflet/LICENSE'), /BSD 2-Clause/);

  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './index.html');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.theme_color, '#0a0d16');
  assert.match(manifest.description, /weather/i);

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

test('service worker: shell, tile cache e moduli in cache', () => {
  const sw = read('sw.js');
  assert.match(sw, /var SHELL_CACHE = 'pf-atlas-shell-v1'/);
  assert.match(sw, /var TILE_CACHE = 'pf-atlas-tiles-v1'/);
  assert.match(sw, /var TILE_LIMIT = 180/);
  for (const event of ['install', 'activate', 'fetch']) {
    assert.match(sw, new RegExp(`addEventListener\\('${event}'`));
  }
  assert.match(sw, /skipWaiting\(\)/);
  assert.match(sw, /clients\.claim\(\)/);
  assert.match(sw, /openstreetmap/);
  assert.match(sw, /cache\.addAll\(CORE\)/);

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
      const next = posix.normalize(posix.join(posix.dirname(rel), match[1]));
      modules.push(next);
    }
  }

  for (const asset of expected) {
    assert.ok(core.has(asset), `asset non in cache: ${asset}`);
    const file = localAsset(asset);
    assert.ok(file && existsSync(file), `asset referenziato ma assente: ${asset}`);
  }
});

test('i18n: dizionari completi, markup e chiavi dinamiche', () => {
  const en = dictKeys('en');
  const it = dictKeys('it');
  assert.deepEqual(en.slice().sort(), it.slice().sort(), 'chiavi EN/IT non allineate');
  assert.ok(en.length >= 100, `dizionario troppo piccolo: ${en.length}`);

  for (const lang of ['en', 'it']) {
    initLang(lang);
    for (const key of en) {
      const value = t(key);
      assert.ok(String(value).trim().length > 0, `traduzione vuota (${lang}): ${key}`);
    }
  }

  const required = new Set(htmlKeys);
  for (const key of [
    'locationDenied',
    'locationUnsupported',
    'locationError',
    'searchError',
    'searching',
    'search',
    'noResults',
    'resultsCount',
    'weatherError',
    'offlineNoCache',
    'cached',
    'invalidCoords',
    'mapError',
    'weatherAtMidpoint',
    'pointA',
    'pointB',
    'savePlace',
    'savedPlace',
    'removePlace',
    'confirmRemoveTitle',
    'confirmRemoveText',
    'confirmRemove',
    'cancel',
    'placeSaved',
    'placeRemoved',
    'coordsCopied',
    'copyFailed',
    'shareUnavailable',
    'shareText',
    'updated',
    'feelsLike',
    'distanceLabel',
    'bearingLabel',
    'midpoint'
  ]) {
    required.add(key);
  }
  for (const match of app.matchAll(/\bt\(\s*'([A-Za-z][\w-]*)'\s*[,)]/g)) required.add(match[1]);

  for (const lang of ['en', 'it']) {
    const keys = new Set(dictKeys(lang));
    const missing = [...required].filter((key) => !keys.has(key)).sort();
    assert.deepEqual(missing, [], `chiavi senza traduzione (${lang}): ${missing.join(', ')}`);
  }

  for (const code of [0, 1, 2, 3, 45, 48, 51, 56, 61, 66, 71, 77, 80, 85, 95, 96, 99, 999]) {
    const key = weatherInfo(code).key;
    assert.notEqual(weatherLabel(key), key, `etichetta meteo mancante: ${key}`);
  }
  assert.equal(typeof t('resultsCount', { n: 3 }), 'string');
  assert.match(t('resultsCount', { n: 3 }), /3/);
});

test('CSS: classi usate nel markup/JS definite e requisiti mobile', () => {
  const classes = new Set();
  for (const match of html.matchAll(/class="([^"]+)"/g)) {
    for (const name of match[1].split(/\s+/)) if (name) classes.add(name);
  }
  for (const match of app.matchAll(/className = '([^']+)'/g)) {
    for (const name of match[1].split(/\s+/)) if (name) classes.add(name);
  }
  for (const name of [
    'is-active',
    'is-visible',
    'atlas-pin__pulse',
    'atlas-pin__temp',
    'atlas-pin__dot',
    'atlas-map-point',
    'atlas-map-point--a',
    'atlas-map-point--b',
    'atlas-current--clear',
    'atlas-current--clouds',
    'atlas-current--rain',
    'atlas-current--snow',
    'atlas-current--fog',
    'atlas-current--storm',
    'atlas-result',
    'atlas-result__text',
    'atlas-result__coords',
    'atlas-results__status',
    'atlas-place',
    'atlas-place__open',
    'atlas-place__name',
    'atlas-place__coords',
    'atlas-place__remove',
    'atlas-hour',
    'atlas-hour__time',
    'atlas-hour__icon',
    'atlas-hour__temp',
    'atlas-hour__rain',
    'atlas-day',
    'atlas-day__name',
    'atlas-day__icon',
    'atlas-day__temps',
    'atlas-day__rain'
  ]) {
    classes.add(name);
  }

  const missing = [...classes].filter((name) => !css.includes(`.${name}`)).sort();
  assert.deepEqual(missing, [], `classi senza stile: ${missing.join(', ')}`);
  assert.match(css, /100dvh/);
  assert.match(css, /--pf-safe-bottom/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(read('../_shared/base.css'), /prefers-reduced-motion/);
});

test('catalogo, redirect legacy e service worker root', () => {
  const catalog = read('../../assets/js/projects-data.js');
  assert.equal((catalog.match(/"id": "atlas"/g) || []).length, 1);
  assert.match(catalog, /"href": "projects\/atlas\/"/);
  assert.doesNotMatch(catalog, /gps\.html|world_weather\.html/);
  assert.match(read('../../index.html'), /href="projects\/atlas\/"/);

  const redirects = [
    ['../../projects/atlas/legacy-gps.html', 'measure'],
    ['../../projects/atlas/legacy-world_weather.html', 'weather']
  ];
  for (const [file, section] of redirects) {
    const source = read(file);
    assert.match(source, /<link rel="canonical" href="https:\/\/lucagandolfi77\.github\.io\/portfolio\/projects\/atlas\/">/);
    assert.match(source, new RegExp(`http-equiv="refresh" content="0; url=\\./atlas/#${section}"`));
    assert.match(source, new RegExp(`var target = '\\./atlas/' \\+ location\\.search \\+ '#${section}';`));
    assert.match(source, /location\.replace\(target\)/);
    assert.match(source, /name="robots" content="noindex, follow"/);
    assert.doesNotMatch(source, /https?:\/\/(?:unpkg|cdn|cdnjs)/);
  }

  assert.match(read('../../sw.js'), /pf-atlas-/);
});

test('sicurezza: niente CDN, storage con prefisso e API https', () => {
  assert.doesNotMatch(html, /<script[^>]+src="https?:/i);
  assert.doesNotMatch(html, /<link[^>]+rel="stylesheet"[^>]+href="https?:/i);
  assert.match(read('js/api.js'), /https:\/\/api\.open-meteo\.com/);
  assert.match(read('js/api.js'), /https:\/\/nominatim\.openstreetmap\.org/);
  assert.doesNotMatch(app, /\beval\s*\(|new Function\s*\(|document\.write\s*\(/);
  assert.doesNotMatch(app, /localStorage/);
  const storage = read('js/storage.js');
  assert.match(storage, /SETTINGS_KEY = 'pf\.atlas\.settings'/);
  assert.match(storage, /PLACES_KEY = 'pf\.atlas\.places'/);
  assert.match(storage, /WEATHER_KEY = 'pf\.atlas\.weather'/);
});
