import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { posix } from 'node:path';
import { fileURLToPath } from 'node:url';

import { initLang, dictKeys, t, typeName, formatDateTime } from '../js/i18n.js';
import {
  TYPES,
  FORM_TO_DETECTED,
  DETECTED_TO_FORM,
  OPEN_TYPES,
  typeDefinition
} from '../js/forms.js';
import { buildPayload, detectPayloadType } from '../js/qr-logic.js';

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
  for (const match of source.matchAll(/([A-Za-z_:][\w:.-]*)="([^"]*)"/g)) {
    out[match[1]] = match[2];
  }
  return out;
}

function localAsset(ref) {
  if (!ref || /^(?:[a-z]+:|\/\/|#)/i.test(ref)) return null;
  const clean = ref.split('?')[0].split('#')[0];
  if (!clean) return null;
  return resolve(APP, clean);
}

function pngSize(file) {
  const buffer = readFileSync(file);
  assert.equal(
    buffer.subarray(0, 8).toString('hex'),
    '89504e470d0a1a0a',
    `${file} non è un PNG`
  );
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const i18nPattern = /data-i18n(?:-placeholder|-aria|-title)?="([^"]+)"/g;
const htmlKeys = [...html.matchAll(i18nPattern)].map((match) => match[1]);
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));

test('index.html: struttura, meta e accessibilità di base', () => {
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<html lang="en" data-skin="lab">/);
  assert.match(html, /name="viewport" content="[^"]*width=device-width[^"]*viewport-fit=cover/);
  assert.match(html, /<meta name="theme-color" content="#0a0d16">/);

  const h1 = [...html.matchAll(/<h1\b[^>]*>/g)];
  assert.equal(h1.length, 1, 'deve esserci un solo h1');

  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/lucagandolfi77\.github\.io\/portfolio\/projects\/qr-studio\/">/
  );
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
  assert.match(html, /<link rel="apple-touch-icon" href="icons\/apple-touch-icon\.png">/);
  assert.match(html, /<noscript>/);

  assert.match(html, /<header\s+data-project-shell/);
  assert.match(html, /data-id="qr-studio"/);
  assert.match(html, /data-languages="en,it"/);

  const buttons = [...html.matchAll(/<button\b([^>]*)>/g)];
  assert.ok(buttons.length > 0);
  for (const [, raw] of buttons) {
    assert.match(raw, /\btype="button"/, `bottone senza type: ${raw.trim()}`);
  }

  const tabs = [...html.matchAll(/role="tab"/g)];
  assert.equal(tabs.length, 3, 'attese tre schede');
  const panels = [...html.matchAll(/role="tabpanel"/g)];
  assert.equal(panels.length, 3, 'attesi tre pannelli');
});

test('index.html: nessun id duplicato e riferimenti del controller validi', () => {
  const all = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(all).size, all.length, 'id duplicati nel markup');

  const refs = new Set();
  for (const match of app.matchAll(/\$\('#([\w-]+)'/g)) refs.add(match[1]);
  for (const match of app.matchAll(/getElementById\('([\w-]+)'\)/g)) refs.add(match[1]);

  const dynamic = new Set(['geoBtn']);
  const missing = [...refs].filter((id) => !ids.has(id) && !dynamic.has(id)).sort();
  assert.deepEqual(missing, [], `id usati da app.js ma assenti: ${missing.join(', ')}`);

  for (const match of html.matchAll(/aria-controls="([^"]+)"/g)) {
    assert.ok(ids.has(match[1]), `aria-controls verso id inesistente: ${match[1]}`);
  }
  for (const match of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
    assert.ok(ids.has(match[1]), `aria-labelledby verso id inesistente: ${match[1]}`);
  }
  for (const match of html.matchAll(/aria-describedby="([^"]+)"/g)) {
    assert.ok(ids.has(match[1]), `aria-describedby verso id inesistente: ${match[1]}`);
  }

  const tabButtons = [...html.matchAll(/<button[^>]*data-tab="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(tabButtons.sort(), ['create', 'history', 'scan']);
  for (const match of html.matchAll(/data-panel="([^"]+)"/g)) {
    assert.ok(tabButtons.includes(match[1]), `pannello senza scheda: ${match[1]}`);
  }
});

test('asset locali, manifest e icone PWA', () => {
  const assets = [];
  for (const [, tag, raw] of html.matchAll(/<(script|link)\b([^>]*)>/g)) {
    const map = attrs(raw);
    const ref = tag === 'script' ? map.src : map.href;
    if (!ref) continue;
    if (tag === 'link' && map.rel && !/stylesheet|manifest|icon|apple-touch-icon/.test(map.rel)) {
      continue;
    }
    const file = localAsset(ref);
    if (!file) {
      assert.fail(`asset remoto non consentito: <${tag}> ${ref}`);
    }
    assets.push([ref, file]);
    assert.ok(existsSync(file) && statSync(file).isFile(), `asset mancante: ${ref}`);
  }
  assert.ok(assets.length >= 5, 'attesi CSS, manifest, icone e script locali');

  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './index.html');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.theme_color, '#0a0d16');
  assert.match(manifest.description, /local-first/i);

  const iconEntries = manifest.icons.filter((icon) => icon.type === 'image/png');
  const sizes = new Set();
  for (const icon of iconEntries) {
    const file = localAsset(icon.src);
    assert.ok(file && existsSync(file), `icona manifest mancante: ${icon.src}`);
    const { width, height } = pngSize(file);
    assert.equal(`${width}x${height}`, icon.sizes, `dimensioni errate per ${icon.src}`);
    sizes.add(icon.sizes);
  }
  assert.ok(sizes.has('192x192'));
  assert.ok(sizes.has('512x512'));
  assert.ok(
    manifest.icons.some((icon) => icon.purpose === 'maskable' && icon.sizes === '512x512'),
    'manca un icona maskable 512'
  );
  assert.ok(manifest.icons.some((icon) => icon.type === 'image/svg+xml'));

  assert.ok(existsSync(join(APP, 'icons', 'apple-touch-icon.png')));
  assert.match(read('icon.svg'), /viewBox="0 0 512 512"/);
});

test('service worker: cache versionata e asset principali in cache', () => {
  const sw = read('sw.js');
  const cache = sw.match(/var CACHE = '([^']+)'/);
  assert.ok(cache, 'CACHE non dichiarata');
  assert.match(cache[1], /^pf-qr-studio-v\d+$/);

  for (const event of ['install', 'activate', 'fetch']) {
    assert.match(sw, new RegExp(`addEventListener\\('${event}'`), `manca l'evento ${event}`);
  }
  assert.match(sw, /skipWaiting\(\)/);
  assert.match(sw, /clients\.claim\(\)/);
  assert.match(sw, /url\.origin !== self\.location\.origin/);
  assert.match(sw, /request\.mode === 'navigate'/);

  const list = sw.match(/var CORE = \[([\s\S]*?)\];/);
  assert.ok(list, 'CORE non dichiarato');
  const core = new Set(
    [...list[1].matchAll(/'([^']+)'/g)].map((match) => posix.normalize(match[1]))
  );

  const expected = new Set();
  for (const [, tag, raw] of html.matchAll(/<(script|link)\b([^>]*)>/g)) {
    const map = attrs(raw);
    const ref = tag === 'script' ? map.src : map.href;
    if (!ref) continue;
    if (tag === 'link' && map.rel && !/stylesheet|manifest|icon|apple-touch-icon/.test(map.rel)) {
      continue;
    }
    expected.add(posix.normalize(ref));
  }

  const modules = ['js/app.js'];
  const seen = new Set();
  while (modules.length) {
    const rel = modules.pop();
    if (seen.has(rel)) continue;
    seen.add(rel);
    expected.add(rel);
    const source = read(rel);
    for (const match of source.matchAll(/from\s+'(\.\.?\/[^']+)'/g)) {
      const next = posix.normalize(posix.join(posix.dirname(rel), match[1]));
      if (!seen.has(next)) modules.push(next);
    }
    for (const match of source.matchAll(/import\s+'(\.\.?\/[^']+)'/g)) {
      const next = posix.normalize(posix.join(posix.dirname(rel), match[1]));
      if (!seen.has(next)) modules.push(next);
    }
  }

  for (const asset of expected) {
    assert.ok(core.has(asset), `asset non in cache: ${asset}`);
    const file = localAsset(asset);
    assert.ok(file && existsSync(file), `asset referenziato ma assente: ${asset}`);
  }
});

test('i18n: dizionari EN/IT completi e chiavi del markup presenti', () => {
  const en = dictKeys('en');
  const it = dictKeys('it');
  assert.deepEqual(en.slice().sort(), it.slice().sort(), 'chiavi EN e IT non allineate');
  assert.ok(en.length >= 150, `dizionario troppo piccolo: ${en.length} chiavi`);

  for (const lang of ['en', 'it']) {
    initLang(lang);
    for (const key of en) {
      const value = t(key);
      assert.notEqual(value, key, `traduzione mancante (${lang}): ${key}`);
      assert.ok(String(value).trim().length > 0, `traduzione vuota (${lang}): ${key}`);
    }
  }

  const required = new Set(htmlKeys);
  for (const type of TYPES) {
    for (const field of type.fields) {
      if (field.label) required.add(field.label);
      if (field.placeholder) required.add(field.placeholder);
      for (const option of field.options || []) required.add(option.label);
    }
  }
  for (const key of [
    'typeLink',
    'typeText',
    'typeWifi',
    'typeContact',
    'typeEmail',
    'typeSms',
    'typePhone',
    'typeGeo',
    'typeEvent',
    'typeUrl',
    'typeVcard',
    'typeTel',
    'ecL',
    'ecM',
    'ecQ',
    'ecH',
    'cameraDenied',
    'cameraNotFound',
    'cameraBusy',
    'cameraInsecure',
    'cameraUnsupported',
    'cameraError',
    'scanIdle',
    'scanStarting',
    'scanRunning',
    'scanError',
    'scanAnalyzing',
    'errorTooLong',
    'errorGeneric',
    'confirmDeleteTitle',
    'confirmDeleteText',
    'confirmDelete',
    'confirmClearTitle',
    'confirmClearText',
    'confirmClear',
    'cancel',
    'presetName',
    'notOpenable',
    'scanNoCode',
    'scanDecodeError'
  ]) {
    required.add(key);
  }
  for (const match of app.matchAll(/\bt\(\s*'([A-Za-z][\w-]*)'\s*[,)]/g)) required.add(match[1]);

  for (const lang of ['en', 'it']) {
    const keys = new Set(dictKeys(lang));
    const missing = [...required].filter((key) => !keys.has(key)).sort();
    assert.deepEqual(missing, [], `chiavi senza traduzione (${lang}): ${missing.join(', ')}`);
  }

  initLang('en');
  assert.equal(t('tabCreate'), 'Create');
  initLang('it');
  assert.equal(t('tabCreate'), 'Crea');
  assert.match(t('presetName', { n: 3 }), /3/);
  initLang('fr');
  assert.equal(t('tabCreate'), 'Create', 'lingua non supportata deve ricadere su EN');

  for (const detected of Object.keys(DETECTED_TO_FORM)) {
    assert.ok(typeName(detected).length > 0, `typeName vuoto per ${detected}`);
  }
  assert.ok(typeName('sconosciuto').length > 0, 'typeName deve avere un fallback');

  initLang('it');
  assert.match(formatDateTime(Date.now()), /\d/);
  initLang('en');
});

test('forms: tipi, campi e mapping payload coerenti', () => {
  const typeIds = TYPES.map((type) => type.id);
  assert.equal(new Set(typeIds).size, typeIds.length, 'id tipo duplicati');
  assert.deepEqual(Object.keys(FORM_TO_DETECTED).sort(), typeIds.slice().sort());
  assert.deepEqual(Object.keys(OPEN_TYPES).sort(), ['email', 'geo', 'link', 'phone', 'sms']);

  for (const type of TYPES) {
    assert.ok(type.fields.length > 0, `tipo senza campi: ${type.id}`);
    const names = type.fields.map((field) => field.name);
    assert.equal(new Set(names).size, names.length, `campi duplicati in ${type.id}`);
    for (const field of type.fields) {
      assert.ok(field.name);
      assert.ok(field.label, `campo senza label in ${type.id}`);
      if (field.control === 'select') {
        assert.ok(field.options.length >= 2);
        for (const option of field.options) assert.ok(option.value && option.label);
      }
    }
  }

  for (const [form, detected] of Object.entries(FORM_TO_DETECTED)) {
    assert.ok(form in DETECTED_TO_FORM || Object.values(DETECTED_TO_FORM).includes(form));
    assert.ok(DETECTED_TO_FORM[detected], `manca il mapping inverso per ${detected}`);
  }
  for (const [detected, form] of Object.entries(DETECTED_TO_FORM)) {
    assert.ok(typeIds.includes(form), `mapping verso un tipo inesistente: ${detected} -> ${form}`);
  }
  for (const [form, detected] of Object.entries(OPEN_TYPES)) {
    assert.ok(typeIds.includes(form));
    assert.ok(detected in DETECTED_TO_FORM);
  }

  const samples = {
    link: { url: 'example.com' },
    text: { text: 'ciao' },
    wifi: { ssid: 'Casa', security: 'WPA', password: 'segreta' },
    contact: { firstName: 'Luca', lastName: 'Gandolfi' },
    email: { to: 'a@b.c', subject: 'Ciao', body: 'Testo' },
    sms: { phone: '+39123', message: 'Ciao' },
    phone: { phone: '+39123' },
    geo: { lat: '45.46', lng: '9.19', label: 'Milano' },
    event: { title: 'Festa', start: '2026-11-20T18:30', location: 'Casa' }
  };
  for (const type of TYPES) {
    const data = buildPayload(type.id, samples[type.id]);
    assert.ok(data, `payload vuoto per ${type.id}`);
    assert.equal(
      detectPayloadType(data),
      FORM_TO_DETECTED[type.id],
      `tipo rilevato errato per ${type.id}`
    );
  }

  assert.equal(typeDefinition('inesistente'), TYPES[0]);
});

test('CSS: classi usate nel markup e componenti condivisi definiti', () => {
  const classes = new Set();
  for (const match of html.matchAll(/class="([^"]+)"/g)) {
    for (const name of match[1].split(/\s+/)) if (name) classes.add(name);
  }
  for (const match of app.matchAll(/className = '([^']+)'/g)) {
    for (const name of match[1].split(/\s+/)) if (name) classes.add(name);
  }
  for (const name of [
    'is-visible',
    'is-live',
    'is-drag',
    'is-transparent',
    'is-on',
    'has-code',
    'qr-field-check'
  ]) {
    classes.add(name);
  }

  const missing = [...classes].filter((name) => !css.includes(`.${name}`)).sort();
  assert.deepEqual(missing, [], `classi senza stile: ${missing.join(', ')}`);

  assert.match(css, /--pf-safe-bottom/);
  assert.match(read('../_shared/base.css'), /100dvh/);
  assert.match(read('../_shared/base.css'), /prefers-reduced-motion/);
  assert.match(css, /min-height:\s*44px/);
});

test('app.js: nessuna API rischiosa o chiave di storage fuori prefisso', () => {
  assert.doesNotMatch(app, /\beval\s*\(/);
  assert.doesNotMatch(app, /new Function\s*\(/);
  assert.doesNotMatch(app, /document\.write\s*\(/);
  assert.doesNotMatch(app, /localStorage/);
  assert.doesNotMatch(app, /['"]https?:\/\//, 'nessun URL remoto nel controller');

  const storage = read('js/storage.js');
  assert.match(storage, /HISTORY_KEY = 'pf\.qr\.history'/);
  assert.match(storage, /SETTINGS_KEY = 'pf\.qr\.settings'/);
  assert.match(storage, /HISTORY_LIMIT = 50/);

  const core = read('sw.js');
  assert.equal((core.match(/self\.skipWaiting\(\)/g) || []).length, 1);
  assert.match(core, /cache\.addAll\(CORE\)/);
  assert.match(core, /caches\.delete\(key\)/);
});

test('catalogo e redirect: una sola voce QR Studio, nessun doppione legacy', () => {
  const catalog = read('../../assets/js/projects-data.js');
  assert.equal((catalog.match(/"id": "qr-studio"/g) || []).length, 1);
  assert.match(catalog, /"href": "projects\/qr-studio\/"/);
  assert.doesNotMatch(catalog, /qrcode\.html|create_qrcode\.html/);

  const redirects = [
    ['../../projects/qr-studio/legacy-qrcode.html', 'scan'],
    ['../../projects/qr-studio/legacy-create_qrcode.html', 'create']
  ];
  for (const [file, section] of redirects) {
    const source = read(file);
    assert.match(source, /<link rel="canonical" href="https:\/\/lucagandolfi77\.github\.io\/portfolio\/projects\/qr-studio\/">/);
    assert.match(source, new RegExp(`http-equiv="refresh" content="0; url=\\./index\\.html#${section}"`));
    assert.match(source, new RegExp(`href="\\./index\\.html#${section}"`));
    assert.match(source, new RegExp(`var target = '\\./index\\.html' \\+ location\\.search \\+ '#${section}';`));
    assert.match(source, /location\.replace\(target\)/);
    assert.match(source, /name="robots" content="noindex, follow"/);
    assert.doesNotMatch(source, /https?:\/\/(?:unpkg|cdn|cdnjs)/);
  }

  const rootWorker = read('../../sw.js');
  assert.match(rootWorker, /pf-qr-studio-/);
});

