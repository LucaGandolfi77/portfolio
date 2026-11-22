/**
 * storage.js — preferenze, luoghi salvati e cache meteo di Atlas.
 * Chiavi: pf.atlas.settings, pf.atlas.places, pf.atlas.weather.
 */

import { cacheKey, normalizeLatLng, round, WEATHER_CACHE_TTL } from './geo.js';

export const SETTINGS_KEY = 'pf.atlas.settings';
export const PLACES_KEY = 'pf.atlas.places';
export const WEATHER_KEY = 'pf.atlas.weather';
export const PLACES_LIMIT = 12;
export const CACHE_LIMIT = 20;

export const DEFAULT_SETTINGS = Object.freeze({
  units: 'metric',
  mode: 'weather',
  center: { lat: 20, lng: 10 },
  zoom: 2,
  lastPlace: null
});

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function makeId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fallback */
  }
  return 'atlas-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function normalizePlace(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const coords = normalizeLatLng(raw.lat, raw.lng);
  if (!coords) return null;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name) return null;
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : makeId(),
    name,
    detail: typeof raw.detail === 'string' ? raw.detail : '',
    countryCode: typeof raw.countryCode === 'string' ? raw.countryCode : '',
    lat: coords.lat,
    lng: coords.lng,
    savedAt: Number.isFinite(raw.savedAt) ? raw.savedAt : Date.now()
  };
}

export function loadPlaces() {
  const raw = readJSON(PLACES_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizePlace).filter(Boolean).slice(0, PLACES_LIMIT);
}

export function savePlaces(places) {
  const clean = (Array.isArray(places) ? places : [])
    .map(normalizePlace)
    .filter(Boolean)
    .slice(0, PLACES_LIMIT);
  writeJSON(PLACES_KEY, clean);
  return clean;
}

export function addPlace(place) {
  const clean = normalizePlace(place);
  if (!clean) return { places: loadPlaces(), item: null, existed: false };
  const places = loadPlaces();
  const index = places.findIndex(
    (item) => Math.abs(item.lat - clean.lat) < 0.001 && Math.abs(item.lng - clean.lng) < 0.001
  );
  const existed = index >= 0;
  if (existed) {
    clean.id = places[index].id;
    places.splice(index, 1);
  }
  places.unshift(clean);
  return { places: savePlaces(places), item: clean, existed };
}

export function removePlace(id) {
  return savePlaces(loadPlaces().filter((place) => place.id !== id));
}

export function isPlaceSaved(lat, lng) {
  const coords = normalizeLatLng(lat, lng);
  if (!coords) return false;
  return loadPlaces().some(
    (item) => Math.abs(item.lat - coords.lat) < 0.001 && Math.abs(item.lng - coords.lng) < 0.001
  );
}

function normalizeCenter(raw) {
  const coords = normalizeLatLng(raw && raw.lat, raw && raw.lng);
  return coords || { ...DEFAULT_SETTINGS.center };
}

function normalizeLastPlace(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const coords = normalizeLatLng(raw.lat, raw.lng);
  if (!coords) return null;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  return {
    name,
    detail: typeof raw.detail === 'string' ? raw.detail : '',
    lat: coords.lat,
    lng: coords.lng
  };
}

export function loadSettings() {
  const raw = readJSON(SETTINGS_KEY, {});
  const source = raw && typeof raw === 'object' ? raw : {};
  const settings = {
    units: source.units === 'imperial' ? 'imperial' : 'metric',
    mode: source.mode === 'measure' ? 'measure' : 'weather',
    center: normalizeCenter(source.center),
    zoom: Number.isFinite(Number(source.zoom))
      ? Math.min(18, Math.max(1, Math.round(Number(source.zoom))))
      : DEFAULT_SETTINGS.zoom,
    lastPlace: normalizeLastPlace(source.lastPlace)
  };
  return settings;
}

export function saveSettings(settings) {
  const merged = {
    ...DEFAULT_SETTINGS,
    ...(settings && typeof settings === 'object' ? settings : {})
  };
  return writeJSON(SETTINGS_KEY, merged);
}

export function loadWeatherCache() {
  const raw = readJSON(WEATHER_KEY, {});
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
}

export function saveWeatherCache(cache) {
  const source = cache && typeof cache === 'object' && !Array.isArray(cache) ? cache : {};
  const entries = Object.entries(source)
    .filter(([, entry]) => entry && typeof entry === 'object' && entry.data)
    .sort((a, b) => (Number(b[1].fetchedAt) || 0) - (Number(a[1].fetchedAt) || 0))
    .slice(0, CACHE_LIMIT);
  const clean = Object.fromEntries(entries);
  writeJSON(WEATHER_KEY, clean);
  return clean;
}

export function putWeatherCache(cache, lat, lng, data, place, now = Date.now()) {
  const key = cacheKey(lat, lng);
  if (!key) return cache;
  const source = cache && typeof cache === 'object' ? { ...cache } : {};
  source[key] = {
    key,
    lat: round(Number(lat), 4),
    lng: round(Number(lng), 4),
    name: place && place.name ? String(place.name) : '',
    data,
    fetchedAt: now
  };
  return saveWeatherCache(source);
}

export function getCachedWeather(cache, lat, lng, now = Date.now(), ttl = WEATHER_CACHE_TTL) {
  const key = cacheKey(lat, lng);
  if (!key) return null;
  const entry = cache && cache[key];
  if (!entry || !entry.data) return null;
  const fetchedAt = Number(entry.fetchedAt) || 0;
  return {
    entry,
    data: entry.data,
    fetchedAt,
    stale: now - fetchedAt > ttl
  };
}

export function clearWeatherCache() {
  try {
    localStorage.removeItem(WEATHER_KEY);
  } catch {
    /* ignore */
  }
  return {};
}
