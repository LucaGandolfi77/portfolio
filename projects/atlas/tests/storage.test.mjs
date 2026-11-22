import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  CACHE_LIMIT,
  DEFAULT_SETTINGS,
  PLACES_KEY,
  PLACES_LIMIT,
  SETTINGS_KEY,
  WEATHER_KEY,
  addPlace,
  clearWeatherCache,
  getCachedWeather,
  isPlaceSaved,
  loadPlaces,
  loadSettings,
  loadWeatherCache,
  putWeatherCache,
  removePlace,
  savePlaces,
  saveSettings,
  saveWeatherCache
} from '../js/storage.js';
import { normalizeWeather } from '../js/geo.js';
import { weatherFixture } from './fixtures.mjs';

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

test('le chiavi usano il prefisso pf.atlas e i limiti sono espliciti', () => {
  assert.equal(PLACES_KEY, 'pf.atlas.places');
  assert.equal(SETTINGS_KEY, 'pf.atlas.settings');
  assert.equal(WEATHER_KEY, 'pf.atlas.weather');
  assert.equal(PLACES_LIMIT, 12);
  assert.equal(CACHE_LIMIT, 20);
});

test('settings: default e validazione dei valori', () => {
  assert.deepEqual(loadSettings(), DEFAULT_SETTINGS);
  saveSettings({ units: 'imperial', mode: 'measure', center: { lat: 999, lng: 0 }, zoom: 99 });
  const settings = loadSettings();
  assert.equal(settings.units, 'imperial');
  assert.equal(settings.mode, 'measure');
  assert.deepEqual(settings.center, DEFAULT_SETTINGS.center);
  assert.equal(settings.zoom, 18);
  assert.equal(settings.lastPlace, null);
});

test('settings: conserva l’ultimo luogo anche senza nome (coordinate)', () => {
  saveSettings({ lastPlace: { name: '', lat: 45.4642, lng: 9.19 } });
  const settings = loadSettings();
  assert.equal(settings.lastPlace.name, '');
  assert.equal(settings.lastPlace.lat, 45.4642);
  assert.equal(settings.lastPlace.lng, 9.19);

  saveSettings({ lastPlace: { name: 'Rotta', lat: 'x', lng: 9 } });
  assert.equal(loadSettings().lastPlace, null);
});

test('places: aggiunta, dedupe per coordinate, rimozione e limite', () => {
  const first = addPlace({ name: 'Milano', lat: 45.4642, lng: 9.19, detail: 'Lombardia' });
  assert.equal(first.places.length, 1);
  assert.equal(first.existed, false);
  assert.equal(first.item.name, 'Milano');
  assert.equal(isPlaceSaved(45.4642, 9.1901), true);

  const duplicate = addPlace({ name: 'Milano', lat: 45.4642, lng: 9.19 });
  assert.equal(duplicate.places.length, 1);
  assert.equal(duplicate.existed, true);
  assert.equal(duplicate.item.id, first.item.id);

  for (let index = 0; index < 20; index += 1) {
    addPlace({ name: `Place ${index}`, lat: 40 + index, lng: 10 + index });
  }
  assert.equal(loadPlaces().length, PLACES_LIMIT);

  const all = loadPlaces();
  const after = removePlace(all[0].id);
  assert.equal(after.length, PLACES_LIMIT - 1);
  assert.equal(savePlaces([{ name: '', lat: 1, lng: 1 }]).length, 0);
});

test('places: scarta record corrotti senza perdere quelli validi', () => {
  localStorage.setItem(
    PLACES_KEY,
    JSON.stringify([
      { name: 'Roma', lat: 41.9028, lng: 12.4964 },
      { name: 'Rotta', lat: 'x', lng: 2 },
      { name: '', lat: 1, lng: 1 },
      null
    ])
  );
  const places = loadPlaces();
  assert.equal(places.length, 1);
  assert.equal(places[0].name, 'Roma');
});

test('weather cache: put/get, scadenza e limite', () => {
  const data = { current: { temp: 12 }, daily: [] };
  const now = Date.now();
  let cache = putWeatherCache({}, 45.4642, 9.19, data, { name: 'Milano' }, now);
  const hit = getCachedWeather(cache, 45.4642, 9.19, now + 1000);
  assert.equal(hit.data, data);
  assert.equal(hit.entry.name, 'Milano');
  assert.equal(hit.stale, false);
  assert.equal(getCachedWeather(cache, 45.4642, 9.19, now + 60 * 60 * 1000).stale, true);
  assert.equal(getCachedWeather(cache, 0, 0), null);
  assert.equal(getCachedWeather(null, 45, 9), null);

  for (let index = 0; index < 30; index += 1) {
    cache = putWeatherCache(cache, 40 + index / 10, 9 + index / 10, data, { name: `P${index}` }, now + index);
  }
  assert.equal(Object.keys(cache).length, CACHE_LIMIT);
  assert.equal(Object.keys(loadWeatherCache()).length, CACHE_LIMIT);

  assert.deepEqual(clearWeatherCache(), {});
  assert.equal(localStorage.getItem(WEATHER_KEY), null);
});

test('weather cache: ignora payload senza data', () => {
  const cache = saveWeatherCache({ a: { fetchedAt: 1 }, b: { data: null }, c: { data: { current: {} }, fetchedAt: 2 } });
  assert.deepEqual(Object.keys(cache), ['c']);
});

test('storage tollera JSON invalido', () => {
  localStorage.setItem(PLACES_KEY, '{rotto');
  localStorage.setItem(SETTINGS_KEY, '{rotto');
  localStorage.setItem(WEATHER_KEY, '{rotto');
  assert.deepEqual(loadPlaces(), []);
  assert.deepEqual(loadSettings(), DEFAULT_SETTINGS);
  assert.deepEqual(loadWeatherCache(), {});
});

test('il payload meteo è serializzabile e rileggibile', () => {
  const data = normalizeWeather(weatherFixture());
  const cache = putWeatherCache({}, 45.4642, 9.19, data, { name: 'Milano' }, 1000);
  const hit = getCachedWeather(cache, 45.4642, 9.19, 2000);
  assert.equal(hit.data.current.temp, 12.4);
  assert.equal(hit.data.daily.length, 7);
});
