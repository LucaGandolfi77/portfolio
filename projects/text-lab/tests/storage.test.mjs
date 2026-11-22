import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_SETTINGS,
  HISTORY_KEY,
  HISTORY_LIMIT,
  SETTINGS_KEY,
  addHistoryItem,
  clearHistory,
  historyMeta,
  loadHistory,
  loadSettings,
  removeHistoryItem,
  saveHistory,
  saveSettings
} from '../js/storage.js';

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  get length() {
    return this.map.size;
  }
  key(index) {
    return [...this.map.keys()][index] ?? null;
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    this.map.set(String(key), String(value));
  }
  removeItem(key) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
}

globalThis.localStorage = new MemoryStorage();

beforeEach(() => {
  localStorage.clear();
});

test('chiavi e default', () => {
  assert.equal(SETTINGS_KEY, 'pf.text.settings');
  assert.equal(HISTORY_KEY, 'pf.text.history');
  assert.deepEqual(loadSettings(), DEFAULT_SETTINGS);
  assert.deepEqual(loadHistory(), []);
});

test('settings: valida lingua e preprocessing', () => {
  saveSettings({ language: 'ita', grayscale: true, contrast: true, facing: 'user' });
  assert.deepEqual(loadSettings(), {
    language: 'ita',
    grayscale: true,
    contrast: true,
    facing: 'user'
  });
  saveSettings({ language: 'xxx', facing: 'boh' });
  const settings = loadSettings();
  assert.equal(settings.language, 'eng+ita');
  assert.equal(settings.facing, 'environment');
});

test('history: aggiunta, dedupe, limite e rimozione', () => {
  const first = addHistoryItem({
    text: 'Ciao mondo',
    language: 'ita',
    confidence: 92,
    createdAt: 1000
  });
  assert.equal(first.items.length, 1);
  assert.equal(first.existed, false);
  assert.equal(first.items[0].text, 'Ciao mondo');
  assert.equal(first.items[0].language, 'ita');

  const duplicate = addHistoryItem({ text: 'Ciao mondo', language: 'ita', confidence: 95 });
  assert.equal(duplicate.items.length, 1);
  assert.equal(duplicate.existed, true);
  assert.equal(duplicate.items[0].confidence, 95);

  for (let index = 0; index < 25; index += 1) {
    addHistoryItem({ text: `Testo ${index}`, language: 'eng', confidence: index });
  }
  assert.equal(loadHistory().length, HISTORY_LIMIT);

  const items = loadHistory();
  const after = removeHistoryItem(items[0].id);
  assert.equal(after.length, HISTORY_LIMIT - 1);
  assert.equal(clearHistory().length, 0);
  assert.equal(localStorage.getItem(HISTORY_KEY), '[]');
});

test('history: normalizza testi, confidence e record corrotti', () => {
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify([
      { text: '  A   B\r\n', confidence: 120, language: 'fra', createdAt: 2 },
      { text: '', confidence: 50 },
      { bad: true }
    ])
  );
  const items = loadHistory();
  assert.equal(items.length, 1);
  assert.equal(items[0].text, 'A B');
  assert.equal(items[0].confidence, 100);
  assert.equal(items[0].language, 'eng+ita');
});

test('historyMeta produce preview e banda', () => {
  const meta = historyMeta({ text: 'Ciao mondo', confidence: 90 });
  assert.equal(meta.preview, 'Ciao mondo');
  assert.equal(meta.band, 'high');
  assert.equal(historyMeta(null), null);
});

test('storage tollera JSON rotto', () => {
  localStorage.setItem(SETTINGS_KEY, '{rotto');
  localStorage.setItem(HISTORY_KEY, '{rotto');
  assert.deepEqual(loadSettings(), DEFAULT_SETTINGS);
  assert.deepEqual(loadHistory(), []);
});

test('saveHistory limita e scarta testi vuoti', () => {
  const saved = saveHistory([
    { text: 'ok', confidence: 80, language: 'eng' },
    { text: '', confidence: 10 },
    null
  ]);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].text, 'ok');
});
