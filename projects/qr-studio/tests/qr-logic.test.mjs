import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeUrl,
  escapeWifi,
  buildWifiPayload,
  buildVCard,
  buildEmailPayload,
  buildSmsPayload,
  buildPhonePayload,
  buildGeoPayload,
  buildEventPayload,
  buildPayload,
  detectPayloadType,
  payloadLabel,
  isSafeToOpen,
  fileNameForData,
  truncate,
  valuesFromPayload
} from '../js/qr-logic.js';

test('normalizeUrl aggiunge https solo quando serve', () => {
  assert.equal(normalizeUrl('example.com'), 'https://example.com');
  assert.equal(normalizeUrl('https://example.com/a'), 'https://example.com/a');
  assert.equal(normalizeUrl('mailto:a@b.c'), 'mailto:a@b.c');
  assert.equal(normalizeUrl('  '), '');
  assert.equal(normalizeUrl('not a url'), 'not a url');
});

test('escapeWifi protegge i caratteri speciali', () => {
  assert.equal(escapeWifi('a;b,c:d"e\\f'), 'a\\;b\\,c\\:d\\"e\\\\f');
});

test('buildWifiPayload gestisce WPA, nopass e rete nascosta', () => {
  assert.equal(
    buildWifiPayload({ ssid: 'Casa', password: 'p;ass', security: 'WPA', hidden: true }),
    'WIFI:T:WPA;S:Casa;P:p\\;ass;H:true;;'
  );
  assert.equal(
    buildWifiPayload({ ssid: 'Open', security: 'nopass' }),
    'WIFI:T:nopass;S:Open;;'
  );
  assert.equal(buildWifiPayload({ ssid: '' }), '');
});

test('buildVCard produce un contatto 3.0 valido', () => {
  const card = buildVCard({
    firstName: 'Luca',
    lastName: 'Gandolfi',
    org: 'Portfolio',
    phone: '+39 123',
    email: 'a@b.c',
    url: 'example.com'
  });
  assert.match(card, /^BEGIN:VCARD\nVERSION:3\.0\n/);
  assert.match(card, /N:Gandolfi;Luca;;;/);
  assert.match(card, /FN:Luca Gandolfi/);
  assert.match(card, /ORG:Portfolio/);
  assert.match(card, /TEL;TYPE=CELL:\+39 123/);
  assert.match(card, /URL:https:\/\/example\.com/);
  assert.match(card, /END:VCARD$/);
  assert.equal(buildVCard({}), '');
});

test('buildEmailPayload, SMS, phone e geo', () => {
  assert.equal(
    buildEmailPayload({ to: 'a@b.c', subject: 'Ciao', body: 'Testo' }),
    'mailto:a@b.c?subject=Ciao&body=Testo'
  );
  assert.equal(buildSmsPayload({ phone: '+39 123', message: 'Ciao' }), 'sms:+39123?body=Ciao');
  assert.equal(buildPhonePayload('+39 123-456'), 'tel:+39123456');
  assert.equal(buildGeoPayload({ lat: 45.46, lng: 9.19, label: 'Milano' }), 'geo:45.46,9.19?q=45.46,9.19(Milano)');
  assert.equal(buildGeoPayload({ lat: 'x', lng: 2 }), '');
});

test('buildGeoPayload accetta la virgola decimale', () => {
  assert.equal(buildGeoPayload({ lat: '45,46', lng: '9,19' }), 'geo:45.46,9.19?q=45.46,9.19');
});

test('valuesFromPayload ricostruisce i campi del form', () => {
  assert.deepEqual(valuesFromPayload('url', 'https://example.com'), { url: 'https://example.com' });
  assert.deepEqual(valuesFromPayload('text', 'ciao'), { text: 'ciao' });

  const wifi = valuesFromPayload(
    'wifi',
    buildWifiPayload({ ssid: 'Casa', password: 'p;ass', security: 'WPA', hidden: true })
  );
  assert.deepEqual(wifi, { ssid: 'Casa', security: 'WPA', password: 'p;ass', hidden: true });

  const card = valuesFromPayload(
    'vcard',
    buildVCard({
      firstName: 'Luca',
      lastName: 'Gandolfi',
      org: 'Portfolio',
      phone: '+39 123',
      email: 'a@b.c',
      url: 'example.com'
    })
  );
  assert.deepEqual(card, {
    firstName: 'Luca',
    lastName: 'Gandolfi',
    org: 'Portfolio',
    phone: '+39 123',
    email: 'a@b.c',
    url: 'https://example.com'
  });

  assert.deepEqual(
    valuesFromPayload('email', buildEmailPayload({ to: 'a@b.c', subject: 'Ciao', body: 'Testo libero' })),
    { to: 'a@b.c', subject: 'Ciao', body: 'Testo libero' }
  );
  assert.deepEqual(valuesFromPayload('sms', buildSmsPayload({ phone: '+39123', message: 'Ciao' })), {
    phone: '+39123',
    message: 'Ciao'
  });
  assert.deepEqual(valuesFromPayload('tel', 'tel:+39123'), { phone: '+39123' });
  assert.deepEqual(valuesFromPayload('geo', 'geo:45.46,9.19?q=45.46,9.19(Citt%C3%A0)'), {
    lat: '45.46',
    lng: '9.19',
    label: 'Città'
  });

  const event = valuesFromPayload(
    'event',
    buildEventPayload({
      title: 'Festa',
      start: '2026-11-20T18:30',
      end: '2026-11-20T22:00',
      location: 'Casa',
      description: 'Torta'
    })
  );
  assert.deepEqual(event, {
    title: 'Festa',
    start: '2026-11-20T18:30',
    end: '2026-11-20T22:00',
    location: 'Casa',
    description: 'Torta'
  });
});

test('buildEventPayload formatta le date ICS', () => {
  const event = buildEventPayload({
    title: 'Compleanno',
    location: 'Casa',
    start: '2026-11-20T18:30',
    end: '2026-11-20T22:00',
    description: 'Porta la torta'
  });
  assert.match(event, /^BEGIN:VEVENT\nSUMMARY:Compleanno/);
  assert.match(event, /DTSTART:20261120T183000/);
  assert.match(event, /DTEND:20261120T220000/);
  assert.match(event, /END:VEVENT$/);
  assert.equal(buildEventPayload({ title: 'No date' }), '');
});

test('buildPayload smista i tipi', () => {
  assert.equal(buildPayload('link', { url: 'example.com' }), 'https://example.com');
  assert.equal(buildPayload('text', { text: 'ciao' }), 'ciao');
  assert.match(buildPayload('wifi', { ssid: 'X', security: 'nopass' }), /^WIFI:/);
  assert.equal(buildPayload('unknown', {}), '');
});

test('detectPayloadType riconosce i payload comuni', () => {
  assert.equal(detectPayloadType('WIFI:T:WPA;S:X;;'), 'wifi');
  assert.equal(detectPayloadType('BEGIN:VCARD\nVERSION:3.0'), 'vcard');
  assert.equal(detectPayloadType('BEGIN:VEVENT'), 'event');
  assert.equal(detectPayloadType('geo:1,2'), 'geo');
  assert.equal(detectPayloadType('mailto:a@b.c'), 'email');
  assert.equal(detectPayloadType('sms:+39123'), 'sms');
  assert.equal(detectPayloadType('tel:+39123'), 'tel');
  assert.equal(detectPayloadType('https://example.com'), 'url');
  assert.equal(detectPayloadType('www.example.com'), 'url');
  assert.equal(detectPayloadType('just text'), 'text');
});

test('payloadLabel estrae un’etichetta leggibile', () => {
  assert.equal(payloadLabel('wifi', 'WIFI:T:WPA;S:Casa;P:x;;'), 'Casa');
  assert.equal(payloadLabel('vcard', 'BEGIN:VCARD\nFN:Mario Rossi\nEND:VCARD'), 'Mario Rossi');
  assert.equal(payloadLabel('url', 'https://www.example.com/path'), 'example.com');
  assert.equal(payloadLabel('tel', 'tel:+39123'), '+39123');
});

test('isSafeToOpen limita i protocolli apribili', () => {
  assert.equal(isSafeToOpen('url', 'https://example.com'), true);
  assert.equal(isSafeToOpen('url', 'javascript:alert(1)'), false);
  assert.equal(isSafeToOpen('email', 'mailto:a@b.c'), true);
  assert.equal(isSafeToOpen('text', 'ciao'), false);
});

test('fileNameForData e truncate', () => {
  assert.equal(fileNameForData('https://example.com/a b', 1024, 'png'), 'qr-example-com-a-b-1024.png');
  assert.equal(truncate('abcdef', 4), 'abc…');
  assert.equal(truncate('abc', 10), 'abc');
});

test('storage: cronologia, dedupe e impostazioni', async () => {
  const map = new Map();
  globalThis.localStorage = {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    clear: () => map.clear()
  };
  const storage = await import('../js/storage.js');

  assert.deepEqual(storage.loadHistory(), []);
  const first = storage.addHistoryItem({
    type: 'url',
    label: 'example.com',
    data: 'https://example.com',
    values: { url: 'https://example.com' }
  });
  assert.equal(first.items.length, 1);
  assert.equal(first.existed, false);

  const duplicate = storage.addHistoryItem({
    type: 'url',
    label: 'example.com',
    data: 'https://example.com',
    values: { url: 'https://example.com' }
  });
  assert.equal(duplicate.items.length, 1);
  assert.equal(duplicate.existed, true);
  assert.equal(duplicate.items[0].id, first.items[0].id);

  const second = storage.addHistoryItem({
    type: 'text',
    label: 'ciao',
    data: 'ciao',
    values: { text: 'ciao' }
  });
  assert.equal(second.items.length, 2);
  assert.equal(second.items[0].data, 'ciao');

  const removed = storage.removeHistoryItem(second.items[0].id);
  assert.equal(removed.length, 1);
  assert.equal(removed[0].data, 'https://example.com');

  const settings = storage.loadSettings();
  assert.equal(settings.ec, 'M');
  assert.equal(settings.size, 1024);
  storage.saveSettings({ ...settings, ec: 'H', size: 2048, transparent: true });
  const reloaded = storage.loadSettings();
  assert.equal(reloaded.ec, 'H');
  assert.equal(reloaded.size, 2048);
  assert.equal(reloaded.transparent, true);

  storage.clearHistory();
  assert.deepEqual(storage.loadHistory(), []);
});
