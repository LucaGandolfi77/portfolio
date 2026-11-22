import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';

import { createHarness } from './dom-harness.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '..');
const html = readFileSync(join(APP, 'index.html'), 'utf8');

const sandbox = {};
runInNewContext(readFileSync(join(APP, 'js', 'vendor', 'qrcode-generator.js'), 'utf8'), sandbox);
assert.equal(typeof sandbox.qrcode, 'function', 'qrcode-generator non caricato');
globalThis.qrcode = sandbox.qrcode;

const harness = createHarness(html);
globalThis.window = harness.window;
globalThis.document = harness.document;
globalThis.location = harness.location;
globalThis.history = harness.history;
globalThis.localStorage = harness.localStorage;
Object.defineProperty(globalThis, 'navigator', {
  value: harness.navigator,
  configurable: true,
  writable: true
});

if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:qr-studio-test';
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = () => {};
}

await import(pathToFileURL(join(APP, 'js', 'app.js')).href + '?smoke=' + Date.now());

const $ = (selector) => harness.document.querySelector(selector);
const $$ = (selector) => harness.document.querySelectorAll(selector);
const tick = (ms = 40) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const fire = (element, type) => element.dispatchEvent({ type, target: element });
const settings = () => JSON.parse(harness.localStorage.getItem('pf.qr.settings'));
const history = () => JSON.parse(harness.localStorage.getItem('pf.qr.history') || '[]');

test('init: form, tab, controlli e stato vuoto', () => {
  assert.equal($('#app').tagName, 'MAIN');
  assert.equal($('#fields input').id, 'field-url');
  assert.equal($('#fields input').type, 'url');
  assert.equal($('#fields input').placeholder, 'example.com or https://…');
  assert.equal($$('#typeChips .qr-type').length, 9);
  assert.deepEqual(
    $$('#typeChips .qr-type span').map((element) => element.textContent),
    ['Link', 'Text', 'Wi-Fi', 'Contact', 'Email', 'SMS', 'Phone', 'Place', 'Event']
  );
  assert.equal($$('#typeChips .qr-type')[0].getAttribute('aria-pressed'), 'true');

  assert.equal($$('#colorPresets .qr-preset').length, 8);
  assert.equal($('#ecControl [data-ec="M"]').getAttribute('aria-pressed'), 'true');
  assert.equal($('#styleControl [data-style="square"]').getAttribute('aria-pressed'), 'true');
  assert.equal($('#sizeSelect').value, '1024');
  assert.equal($('#fgColor').value, '#0a0d16');
  assert.equal($('#bgColor').value, '#ffffff');

  assert.equal($('#previewEmpty').hidden, false);
  assert.equal($('#qrCanvas').getAttribute('aria-label'), 'QR code preview');
  assert.equal($('#saveBtn').disabled, true);
  assert.equal($('#pngBtn').disabled, true);

  assert.equal($('#scanStatusBadge').textContent, 'Idle');
  assert.equal($('#scanStatusBadge').dataset.state, 'idle');
  assert.equal($('#scanStart').hidden, false);
  assert.equal($('#scanStop').hidden, true);
  assert.equal($('#scanPlaceholder').hidden, false);

  assert.equal($('#panel-create').hidden, false);
  assert.equal($('#panel-scan').hidden, true);
  assert.equal($('#panel-history').hidden, true);
  assert.equal($('#tab-create').getAttribute('aria-selected'), 'true');
  assert.equal($('#historyEmpty').hidden, false);
  assert.equal($('#clearHistoryBtn').hidden, true);
  assert.equal($('#h1') || $('h1').textContent, 'Scan. Create. Keep it local.');
});

test('anteprima live: URL, matrice, badge e link apribile', async () => {
  const input = $('#field-url');
  input.value = 'example.com';
  fire(input, 'input');
  await tick(260);

  const stage = $('#previewStage');
  assert.equal(stage.classList.contains('has-code'), true);
  assert.equal($('#previewEmpty').hidden, true);
  assert.equal($('#previewError').hidden, true);
  assert.equal($('#qrCanvas').width, 720);
  assert.match($('#matrixBadge').textContent, /^v\d+ · \d+×\d+$/);
  assert.match($('#byteBadge').textContent, /\d+ B$/);
  assert.equal($('#byteBadge').hidden, false);
  assert.equal($('#matrixBadge').hidden, false);
  assert.ok($('#previewLabel').textContent.length > 0);
  assert.equal($('#openBtn').hidden, false);
  assert.match($('#openBtn').href, /^https:\/\/example\.com/);
  assert.equal($('#openBtn').target, '_blank');
  assert.equal($('#saveBtn').disabled, false);
  assert.equal($('#pngBtn').disabled, false);

  const calls = $('#qrCanvas').getContext('2d').calls.map((call) => call.name);
  assert.ok(calls.includes('fillRect'));
  assert.ok(calls.includes('fill'));
});

test('stile: pattern, correzione, colori, trasparenza e dimensione persistono', () => {
  $('#styleControl [data-style="round"]').click();
  assert.equal($('#styleControl [data-style="round"]').getAttribute('aria-pressed'), 'true');
  assert.equal(settings().moduleStyle, 'round');

  $('#ecControl [data-ec="H"]').click();
  assert.equal($('#ecControl [data-ec="H"]').getAttribute('aria-pressed'), 'true');
  assert.equal(settings().ec, 'H');

  const fg = $('#fgColor');
  fg.value = '#044b46';
  fire(fg, 'input');
  assert.equal(settings().fg, '#044b46');

  const toggle = $('#transparentToggle');
  toggle.checked = true;
  fire(toggle, 'change');
  assert.equal(settings().transparent, true);
  assert.equal($('#previewStage').classList.contains('is-transparent'), true);

  const size = $('#sizeSelect');
  size.value = '2048';
  fire(size, 'change');
  assert.equal(settings().size, 2048);
});

test('salvataggio, cronologia e download PNG/SVG', async () => {
  $('#saveBtn').click();
  assert.equal($('#historyList').children.length, 1);
  assert.equal($('#historyCount').textContent, '1');
  assert.equal($('#historyCount').hidden, false);
  assert.equal($('#historyEmpty').hidden, true);
  assert.equal($('#clearHistoryBtn').hidden, false);
  assert.equal(history().length, 1);
  assert.equal(history()[0].type, 'link');
  assert.match(history()[0].data, /^https:\/\/example\.com/);
  assert.equal($('.pf-toast').textContent, 'Saved to history');
  assert.equal($('.qr-history__item .pf-badge').textContent, 'Link');

  const before = harness.document.__clicks.filter((link) => link.download).length;
  $('#pngBtn').click();
  await tick();
  $('#svgBtn').click();
  await tick();

  const downloads = harness.document.__clicks.filter((link) => link.download);
  assert.equal(downloads.length, before + 2);
  assert.match(downloads[downloads.length - 2].download, /\.png$/);
  assert.match(downloads[downloads.length - 1].download, /\.svg$/);
  assert.equal($('.pf-toast').textContent, 'Download started');
});

test('cambio lingua EN → IT: testi, tipi, placeholder e stato scanner', () => {
  harness.window.dispatchEvent({ type: 'project:langchange', detail: { lang: 'it' } });

  assert.equal($('h1').textContent, 'Scansiona. Crea. Resta in locale.');
  assert.equal($('#tab-create span').textContent, 'Crea');
  assert.equal($('#tab-scan span').textContent, 'Scansiona');
  assert.equal($('#tab-history span').textContent, 'Cronologia');
  assert.equal($('#typeChips .qr-type span').textContent, 'Link');
  assert.equal($$('#typeChips .qr-type span')[1].textContent, 'Testo');
  assert.equal($$('#typeChips .qr-type span')[3].textContent, 'Contatto');
  assert.equal($('#fields label .pf-label').textContent, 'URL');
  assert.equal($('#fields input').placeholder, 'example.com oppure https://…');
  assert.equal($('#saveBtn').textContent, 'Salva');
  assert.equal($('#scanStatusBadge').textContent, 'In attesa');
  assert.equal($('#historyTitle') || $('.qr-history-card .pf-card__title').textContent, 'QR recenti');
  assert.match($('.qr-footer p').textContent, /Project Kit 2026/);
});

test('tab: click, hash e navigazione da tastiera', () => {
  $('#tab-scan').click();
  assert.equal($('#panel-scan').hidden, false);
  assert.equal($('#panel-create').hidden, true);
  assert.equal($('#tab-scan').getAttribute('aria-selected'), 'true');
  assert.equal(harness.location.hash, '#scan');

  $('#tab-history').click();
  assert.equal($('#panel-history').hidden, false);
  assert.equal($('#historyList').children.length, 1);
  assert.equal(harness.location.hash, '#history');

  $('#tab-create').click();
  $('#tab-create').dispatchEvent({ type: 'keydown', key: 'ArrowRight' });
  assert.equal($('#panel-scan').hidden, false);
  assert.equal(harness.location.hash, '#scan');

  $('#tab-create').click();
  assert.equal($('#fields input').value, 'example.com');
});

test('cronologia: riuso, eliminazione e svuotamento', async () => {
  $('#tab-history').click();
  let actions = $$('#historyList .qr-history__actions button');
  assert.equal(actions.length, 4);

  actions[0].click();
  assert.equal($('#panel-create').hidden, false);
  assert.equal($('#field-url').value, 'example.com');
  assert.ok(harness.window.__scrolls >= 1);

  $('#tab-history').click();
  actions = $$('#historyList .qr-history__actions button');
  actions[3].click();
  await tick();
  assert.equal($('#historyList').children.length, 0);
  assert.equal($('#historyEmpty').hidden, false);
  assert.equal(history().length, 0);
  assert.equal($('.pf-toast').textContent, 'Eliminato');

  $('#saveBtn').click();
  assert.equal($('#historyList').children.length, 1);
  $('#clearHistoryBtn').click();
  await tick();
  assert.equal($('#historyList').children.length, 0);
  assert.deepEqual(history(), []);
  assert.equal($('.pf-toast').textContent, 'Cronologia svuotata');
});

test('reset stile e gestione errore fotocamera non supportata', async () => {
  harness.window.dispatchEvent({ type: 'project:langchange', detail: { lang: 'en' } });
  $('#tab-create').click();
  $('#resetStyle').click();

  assert.equal(settings().moduleStyle, 'square');
  assert.equal(settings().ec, 'M');
  assert.equal(settings().fg, '#0a0d16');
  assert.equal(settings().bg, '#ffffff');
  assert.equal(settings().transparent, false);
  assert.equal(settings().size, 1024);
  assert.equal($('#fgColor').value, '#0a0d16');
  assert.equal($('#transparentToggle').checked, false);
  assert.equal($('#sizeSelect').value, '1024');
  assert.equal($('#styleControl [data-style="square"]').getAttribute('aria-pressed'), 'true');

  $('#tab-scan').click();
  $('#scanStart').click();
  await tick();
  assert.equal($('#scanStatusBadge').dataset.state, 'error');
  assert.equal($('#scanStatusBadge').textContent, 'Error');
  assert.match($('.pf-toast').textContent, /does not support camera access/i);
  assert.equal($('#panel-scan').hidden, false);

  $('#tab-create').click();
  assert.equal($('#panel-scan').hidden, true);
});
