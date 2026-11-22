import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  BEST_KEY,
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  clearBest,
  loadBest,
  loadSettings,
  saveBest,
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

test('chiavi e default di Vision Lab', () => {
  assert.equal(SETTINGS_KEY, 'pf.vision.settings');
  assert.equal(BEST_KEY, 'pf.vision.best');
  assert.deepEqual(loadSettings(), DEFAULT_SETTINGS);
  assert.equal(loadBest(), null);
});

test('settings: valida mode, mesh, mirror e facing', () => {
  saveSettings({ mode: 'smile', mesh: 'full', mirror: false, facing: 'environment' });
  assert.deepEqual(loadSettings(), {
    mode: 'smile',
    mesh: 'full',
    mirror: false,
    facing: 'environment'
  });

  saveSettings({ mode: 'boh', mesh: 'boh', mirror: 0, facing: 'boh' });
  const settings = loadSettings();
  assert.equal(settings.mode, 'mesh');
  assert.equal(settings.mesh, 'soft');
  assert.equal(settings.mirror, false);
  assert.equal(settings.facing, 'user');
});

test('best: primo record, miglioramento e nessun peggioramento', () => {
  const first = saveBest({
    score: 61,
    smile: 70,
    whiteness: 55,
    alignment: 50,
    at: 1000
  });
  assert.equal(first.record, true);
  assert.equal(first.best.score, 61);
  assert.equal(loadBest().score, 61);

  const better = saveBest({ score: 82, smile: 90, whiteness: 80, alignment: 70, at: 2000 });
  assert.equal(better.record, true);
  assert.equal(better.best.score, 82);
  assert.equal(better.best.at, 2000);

  const worse = saveBest({ score: 40, smile: 40, whiteness: 30, alignment: 20, at: 3000 });
  assert.equal(worse.record, false);
  assert.equal(worse.best.score, 82);
});

test('best: scarta valori invalidi e azzera', () => {
  assert.equal(saveBest(null).record, false);
  assert.equal(saveBest({ score: -4 }).record, false);
  saveBest({ score: 50 });
  assert.equal(clearBest(), null);
  assert.equal(loadBest(), null);
  assert.equal(localStorage.getItem(BEST_KEY), null);
});

test('storage tollera JSON rotto', () => {
  localStorage.setItem(SETTINGS_KEY, '{rotto');
  localStorage.setItem(BEST_KEY, '{rotto');
  assert.deepEqual(loadSettings(), DEFAULT_SETTINGS);
  assert.equal(loadBest(), null);
});
