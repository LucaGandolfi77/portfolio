/**
 * app.js — controller di Atlas: mappa Leaflet, meteo Open-Meteo,
 * ricerca Nominatim, distanze great-circle e cache locale.
 */

import {
  distanceSummary,
  formatCoord,
  formatPrecipitation,
  formatTemperature,
  formatWind,
  nextHours,
  normalizeLatLng,
  weatherInfo
} from './geo.js';
import { fetchWeather, reversePlace, searchPlaces } from './api.js';
import {
  addPlace,
  getCachedWeather,
  loadPlaces,
  loadSettings,
  loadWeatherCache,
  putWeatherCache,
  removePlace,
  saveSettings
} from './storage.js';
import {
  applyStatic,
  formatClockFromIso,
  formatDay,
  formatTime,
  getLang,
  initLang,
  setLang,
  t,
  weatherLabel
} from './i18n.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_COPYRIGHT = 'https://www.openstreetmap.org/copyright';

const ICONS = {
  search:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  locate:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="8"/></svg>',
  pin:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  sun:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/></svg>',
  'cloud-sun':
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6a4 4 0 0 1 7.5 2"/><path d="M3 15a4 4 0 0 1 1.2-7.8"/><path d="M8 20h8a4 4 0 0 0 .6-8 5 5 0 0 0-9.2 1.2A3.4 3.4 0 0 0 8 20z"/></svg>',
  'cloud-moon':
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 8a4 4 0 0 0-6.5-3"/><path d="M8 20h8a4 4 0 0 0 .6-8 5 5 0 0 0-9.2 1.2A3.4 3.4 0 0 0 8 20z"/><path d="M17 3a4 4 0 0 0 3.5 5"/></svg>',
  cloud:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 19h10a4 4 0 0 0 .6-8 5.5 5.5 0 0 0-10.2 1.2A3.5 3.5 0 0 0 7 19z"/></svg>',
  fog:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 15h10a4 4 0 0 0 .6-8 5.5 5.5 0 0 0-10.2 1.2A3.5 3.5 0 0 0 7 15z"/><path d="M4 19h16M7 22h10"/></svg>',
  drizzle:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 16h10a4 4 0 0 0 .6-8 5.5 5.5 0 0 0-10.2 1.2A3.5 3.5 0 0 0 7 16z"/><path d="M9 20v1M13 20v1M17 20v1"/></svg>',
  rain:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 15h10a4 4 0 0 0 .6-8 5.5 5.5 0 0 0-10.2 1.2A3.5 3.5 0 0 0 7 15z"/><path d="M8 19l-1 2M13 19l-1 2M18 19l-1 2"/></svg>',
  snow:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 15h10a4 4 0 0 0 .6-8 5.5 5.5 0 0 0-10.2 1.2A3.5 3.5 0 0 0 7 15z"/><path d="M9 20h.01M13 21h.01M17 20h.01M11 18h.01M15 18h.01"/></svg>',
  storm:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 15h10a4 4 0 0 0 .6-8 5.5 5.5 0 0 0-10.2 1.2A3.5 3.5 0 0 0 7 15z"/><path d="m13 17-3 5h3l-1 3 4-5h-3l1-3z"/></svg>',
  save:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  share:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
  copy:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  refresh:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/></svg>',
  swap:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h13l-3-3M17 17H4l3 3"/></svg>',
  reset:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  humidity:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg>',
  wind:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/></svg>',
  sunrise:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18h18M6 14a6 6 0 0 1 12 0"/><path d="M12 2v3M5 6l2 2M19 6l-2 2"/></svg>',
  sunset:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18h18M6 14a6 6 0 0 1 12 0"/><path d="M12 5V2M5 6l2 2M19 6l-2 2"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  globe:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21M12 3C9.5 5.5 8.2 8.7 8.2 12S9.5 18.5 12 21"/></svg>',
  alert:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 21h20L12 3z"/><path d="M12 9v5M12 17h.01"/></svg>'
};

const state = {
  mode: 'weather',
  units: 'metric',
  settings: null,
  places: [],
  cache: {},
  selected: null,
  weather: null,
  meta: { cached: false, offline: false, fetchedAt: 0 },
  loading: false,
  errorKey: '',
  searchResults: [],
  searchOpen: false,
  searchLoading: false,
  searchError: '',
  measureA: null,
  measureB: null,
  measureError: '',
  map: null,
  tileLayer: null,
  markerLayer: null,
  measureLayer: null,
  weatherAbort: null,
  reverseAbort: null,
  searchAbort: null
};

let toastTimer = 0;

/* -------------------------------------------------------------------------- */
/* Utility                                                                    */
/* -------------------------------------------------------------------------- */

function icon(name) {
  return ICONS[name] || ICONS.globe;
}

function toast(message) {
  if (!message) return;
  if (window.ProjectShell && typeof window.ProjectShell.toast === 'function') {
    window.ProjectShell.toast(message);
    return;
  }
  let node = $('.pf-toast');
  if (!node) {
    node = document.createElement('div');
    node.className = 'pf-toast';
    node.setAttribute('role', 'status');
    node.setAttribute('aria-live', 'polite');
    document.body.append(node);
  }
  node.textContent = message;
  node.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('is-visible'), 2200);
}

function confirmDialog(options) {
  if (window.ProjectShell && typeof window.ProjectShell.confirm === 'function') {
    return window.ProjectShell.confirm(options);
  }
  return Promise.resolve(window.confirm(options.message || options.title || ''));
}

async function copyText(value) {
  const text = String(value == null ? '' : value);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fallback */
    }
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function setIcon(node, name) {
  if (node) node.innerHTML = icon(name);
}

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((node) => {
    node.innerHTML = icon(node.dataset.icon);
  });
}

function placeLabel(place) {
  if (!place) return '';
  if (place.name) return place.name;
  return `${formatCoord(place.lat, 4)}, ${formatCoord(place.lng, 4)}`;
}

function placeDetail(place) {
  if (!place) return '';
  if (place.detail) return place.detail;
  return `${formatCoord(place.lat, 4)}, ${formatCoord(place.lng, 4)}`;
}

function sameCoords(a, b) {
  if (!a || !b) return false;
  return Math.abs(a.lat - b.lat) < 0.001 && Math.abs(a.lng - b.lng) < 0.001;
}

function isSavedPlace(place) {
  if (!place) return false;
  return state.places.some((item) => sameCoords(item, place));
}

function updateOnlineBanner() {
  const banner = $('#offlineBanner');
  if (banner) banner.hidden = navigator.onLine !== false;
}

/* -------------------------------------------------------------------------- */
/* Mappa                                                                      */
/* -------------------------------------------------------------------------- */

function initMap() {
  if (typeof window.L === 'undefined') {
    const container = $('#map');
    if (container) container.classList.add('atlas-map--missing');
    toast(t('mapError'));
    return;
  }
  const settings = state.settings;
  state.map = window.L.map('map', {
    zoomControl: false,
    attributionControl: false,
    worldCopyJump: true,
    minZoom: 2,
    maxZoom: 18,
    preferCanvas: true
  }).setView([settings.center.lat, settings.center.lng], settings.zoom);

  state.tileLayer = window.L.tileLayer(TILE_URL, {
    maxZoom: 19,
    attribution: `&copy; <a href="${OSM_COPYRIGHT}" target="_blank" rel="noopener">OpenStreetMap</a> contributors`
  }).addTo(state.map);

  window.L.control.zoom({ position: 'bottomright' }).addTo(state.map);
  state.markerLayer = window.L.layerGroup().addTo(state.map);
  state.measureLayer = window.L.layerGroup().addTo(state.map);

  state.map.on('click', (event) => {
    handleMapClick(event.latlng);
  });
  state.map.on('moveend', () => {
    if (!state.map) return;
    const center = state.map.getCenter();
    state.settings.center = { lat: center.lat, lng: center.lng };
    state.settings.zoom = state.map.getZoom();
    saveSettings(state.settings);
  });

  requestAnimationFrame(() => state.map.invalidateSize());
  setTimeout(() => state.map && state.map.invalidateSize(), 220);
}

function markerIcon(className, html) {
  return window.L.divIcon({
    className,
    html,
    iconSize: [52, 52],
    iconAnchor: [26, 26]
  });
}

function renderMapLayers() {
  if (!state.map) return;
  state.markerLayer.clearLayers();
  state.measureLayer.clearLayers();

  if (state.mode === 'weather' && state.selected) {
    const temperature = state.weather ? formatTemperature(state.weather.current.temp, state.units) : '';
    const html = temperature
      ? `<span class="atlas-pin__pulse" aria-hidden="true"></span><span class="atlas-pin__temp">${temperature}</span>`
      : `<span class="atlas-pin__pulse" aria-hidden="true"></span><span class="atlas-pin__dot" aria-hidden="true"></span>`;
    window.L.marker([state.selected.lat, state.selected.lng], {
      icon: markerIcon('atlas-pin', html),
      keyboard: false,
      alt: placeLabel(state.selected)
    }).addTo(state.markerLayer);
    return;
  }

  if (state.mode !== 'measure') return;
  if (state.measureA) {
    window.L.marker([state.measureA.lat, state.measureA.lng], {
      icon: markerIcon('atlas-map-point atlas-map-point--a', '<span>A</span>'),
      keyboard: false,
      alt: `${t('pointA')} ${formatCoord(state.measureA.lat, 4)}, ${formatCoord(state.measureA.lng, 4)}`
    }).addTo(state.measureLayer);
  }
  if (state.measureB) {
    window.L.marker([state.measureB.lat, state.measureB.lng], {
      icon: markerIcon('atlas-map-point atlas-map-point--b', '<span>B</span>'),
      keyboard: false,
      alt: `${t('pointB')} ${formatCoord(state.measureB.lat, 4)}, ${formatCoord(state.measureB.lng, 4)}`
    }).addTo(state.measureLayer);
  }
  if (state.measureA && state.measureB) {
    window.L.polyline(
      [
        [state.measureA.lat, state.measureA.lng],
        [state.measureB.lat, state.measureB.lng]
      ],
      { color: '#00e5ff', weight: 3, opacity: 0.95, dashArray: '7 9' }
    ).addTo(state.measureLayer);
  }
}

function handleMapClick(latlng) {
  const coords = normalizeLatLng(latlng && latlng.lat, latlng && latlng.lng);
  if (!coords) return;

  if (state.mode === 'measure') {
    if (!state.measureA || (state.measureA && state.measureB)) {
      state.measureA = coords;
      state.measureB = null;
    } else {
      state.measureB = coords;
    }
    state.measureError = '';
    syncMeasureInputs();
    renderMeasure();
    if (state.measureA && state.measureB && state.map) {
      state.map.fitBounds(
        [
          [state.measureA.lat, state.measureA.lng],
          [state.measureB.lat, state.measureB.lng]
        ],
        { padding: [60, 60], maxZoom: 14 }
      );
    }
    return;
  }

  selectPlace({ name: '', detail: '', lat: coords.lat, lng: coords.lng }, { fly: false });
}

/* -------------------------------------------------------------------------- */
/* Meteo                                                                      */
/* -------------------------------------------------------------------------- */

function setMode(mode, options = {}) {
  const next = mode === 'measure' ? 'measure' : 'weather';
  state.mode = next;
  state.settings.mode = next;
  saveSettings(state.settings);

  for (const button of $$('#modeSwitch [data-mode]')) {
    button.setAttribute('aria-pressed', String(button.dataset.mode === next));
  }
  const weatherPanel = $('#weatherPanel');
  const measurePanel = $('#measurePanel');
  if (weatherPanel) weatherPanel.hidden = next !== 'weather';
  if (measurePanel) measurePanel.hidden = next !== 'measure';
  const hint = $('#mapHint');
  if (hint) hint.textContent = t(next === 'measure' ? 'mapHintMeasure' : 'mapHintWeather');
  const shell = $('#app');
  if (shell) shell.dataset.mode = next;
  renderMapLayers();
  if (!options.silent && location.hash !== '#' + next) {
    history.replaceState(null, '', '#' + next);
  }
}

function selectPlace(place, options = {}) {
  const coords = normalizeLatLng(place && place.lat, place && place.lng);
  if (!coords) return;
  if (state.weatherAbort) state.weatherAbort.abort();
  if (state.reverseAbort) state.reverseAbort.abort();

  state.selected = {
    name: typeof place.name === 'string' ? place.name.trim() : '',
    detail: typeof place.detail === 'string' ? place.detail : '',
    countryCode: typeof place.countryCode === 'string' ? place.countryCode : '',
    lat: coords.lat,
    lng: coords.lng
  };
  state.settings.lastPlace = { ...state.selected };
  saveSettings(state.settings);
  state.weather = null;
  state.meta = { cached: false, offline: false, fetchedAt: 0 };
  state.errorKey = '';
  state.loading = false;

  const cached = getCachedWeather(state.cache, coords.lat, coords.lng);
  if (cached) {
    state.weather = cached.data;
    state.meta = { cached: true, offline: navigator.onLine === false, fetchedAt: cached.fetchedAt };
  }

  setMode('weather', { silent: options.silent });
  if (options.fly !== false && state.map) {
    state.map.flyTo([coords.lat, coords.lng], Math.max(state.map.getZoom(), options.zoom || 10), {
      duration: 0.8
    });
  }
  renderWeather();
  renderMapLayers();
  renderPlaces();
  if (options.load !== false) loadWeather();
  if (!state.selected.name) reverseName();
  if (options.focus) {
    requestAnimationFrame(() => {
      const heading = $('#weatherHeading');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus();
      }
    });
  }
}

async function loadWeather(options = {}) {
  if (!state.selected) return;
  if (state.weatherAbort) state.weatherAbort.abort();
  const controller = new AbortController();
  state.weatherAbort = controller;
  state.loading = true;
  state.errorKey = '';
  renderWeather();

  if (navigator.onLine === false) {
    state.loading = false;
    if (state.weather) {
      state.meta = { ...state.meta, cached: true, offline: true };
    } else {
      state.errorKey = 'offlineNoCache';
    }
    renderWeather();
    return;
  }

  try {
    const data = await fetchWeather(state.selected.lat, state.selected.lng, {
      signal: controller.signal,
      lang: getLang()
    });
    if (state.weatherAbort !== controller) return;
    state.weather = data;
    state.meta = { cached: false, offline: false, fetchedAt: Date.now() };
    state.loading = false;
    state.errorKey = '';
    state.cache = putWeatherCache(
      state.cache,
      state.selected.lat,
      state.selected.lng,
      data,
      state.selected
    );
    renderWeather();
    renderMapLayers();
  } catch (error) {
    if (error && error.name === 'AbortError') return;
    if (state.weatherAbort !== controller) return;
    state.loading = false;
    const cached = getCachedWeather(state.cache, state.selected.lat, state.selected.lng);
    if (cached) {
      if (!state.weather) state.weather = cached.data;
      state.meta = { cached: true, offline: true, fetchedAt: cached.fetchedAt };
    } else {
      state.errorKey = 'weatherError';
    }
    renderWeather();
    renderMapLayers();
  }
}

async function reverseName() {
  if (!state.selected || state.selected.name) return;
  const target = { lat: state.selected.lat, lng: state.selected.lng };
  if (state.reverseAbort) state.reverseAbort.abort();
  const controller = new AbortController();
  state.reverseAbort = controller;
  try {
    const place = await reversePlace(target.lat, target.lng, {
      signal: controller.signal,
      lang: getLang()
    });
    if (state.reverseAbort !== controller || !state.selected) return;
    if (!sameCoords(state.selected, target) || !place || !place.name) return;
    state.selected.name = place.name;
    state.selected.detail = place.detail || state.selected.detail;
    state.selected.countryCode = place.countryCode || state.selected.countryCode;
    state.settings.lastPlace = { ...state.selected };
    saveSettings(state.settings);
    renderWeather();
  } catch {
    /* la posizione resta espressa in coordinate */
  }
}

function renderWeather() {
  const content = $('#weatherContent');
  const empty = $('#weatherEmpty');
  const loading = $('#weatherLoading');
  const error = $('#weatherError');
  const badge = $('#weatherBadge');
  const offline = $('#weatherOffline');
  if (!content) return;

  const hasWeather = Boolean(state.weather && state.selected);
  const hasError = Boolean(state.errorKey);

  if (empty) empty.hidden = hasWeather || state.loading || hasError;
  if (loading) loading.hidden = !state.loading || hasWeather;
  if (error) error.hidden = !hasError || hasWeather;
  content.hidden = !hasWeather;

  const errorText = $('#weatherErrorText');
  if (errorText && hasError) errorText.textContent = t(state.errorKey);

  if (badge) {
    badge.hidden = !state.meta.cached;
    badge.textContent = t('cached');
  }
  if (offline) offline.hidden = !state.meta.offline || !hasWeather;

  if (!hasWeather) {
    renderMapLayers();
    return;
  }

  const weather = state.weather;
  const current = weather.current;
  const info = weatherInfo(current.code, current.isDay);
  const selected = state.selected;
  const today = weather.daily[0];

  const name = $('#placeName');
  const detail = $('#placeDetail');
  if (name) name.textContent = placeLabel(selected);
  if (detail) detail.textContent = placeDetail(selected);

  const updated = $('#weatherUpdated');
  if (updated) {
    updated.textContent = t('updated', { time: formatTime(new Date(state.meta.fetchedAt || Date.now())) });
  }

  const currentBlock = $('#currentBlock');
  if (currentBlock) currentBlock.className = `atlas-current atlas-current--${info.group}`;

  const currentIcon = $('#currentIcon');
  if (currentIcon) setIcon(currentIcon, info.icon);
  const temp = $('#currentTemp');
  if (temp) temp.textContent = formatTemperature(current.temp, state.units);
  const condition = $('#currentCondition');
  if (condition) condition.textContent = weatherLabel(info.key);
  const feels = $('#currentFeels');
  if (feels) {
    feels.textContent = `${t('feelsLike')} ${formatTemperature(current.feels, state.units)}`;
  }

  const humidity = $('#metricHumidity');
  if (humidity) humidity.textContent = current.humidity == null ? '—' : `${Math.round(current.humidity)}%`;
  const wind = $('#metricWind');
  if (wind) wind.textContent = formatWind(current.wind, state.units);
  const precip = $('#metricPrecip');
  if (precip) precip.textContent = formatPrecipitation(current.precip, state.units);
  const highLow = $('#metricHighLow');
  if (highLow) {
    highLow.textContent =
      today && today.max != null && today.min != null
        ? `${formatTemperature(today.max, state.units)} / ${formatTemperature(today.min, state.units)}`
        : '—';
  }
  const sunrise = $('#metricSunrise');
  if (sunrise) sunrise.textContent = today ? formatClockFromIso(today.sunrise) || '—' : '—';
  const sunset = $('#metricSunset');
  if (sunset) sunset.textContent = today ? formatClockFromIso(today.sunset) || '—' : '—';

  const osm = $('#osmLink');
  if (osm) {
    osm.href = `https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=12/${selected.lat}/${selected.lng}`;
  }

  const saveButton = $('#savePlaceBtn');
  if (saveButton) {
    const saved = isSavedPlace(selected);
    saveButton.disabled = saved;
    saveButton.innerHTML = saved
      ? `${icon('check')}<span>${t('savedPlace')}</span>`
      : `${icon('save')}<span>${t('savePlace')}</span>`;
  }

  renderHourly(weather);
  renderForecast(weather);
  renderMapLayers();
}

function renderHourly(weather) {
  const list = $('#hourlyList');
  if (!list) return;
  list.replaceChildren();
  const hours = nextHours(weather.hourly, weather.current.time, 12);
  for (const [index, hour] of hours.entries()) {
    const item = make('div', 'atlas-hour');
    const time = make('time', 'atlas-hour__time', index === 0 ? t('now') : formatClockFromIso(hour.time));
    if (hour.time) time.dateTime = hour.time;
    const iconNode = make('span', 'atlas-hour__icon');
    setIcon(iconNode, weatherInfo(hour.code, hourIsDay(weather, hour.time)).icon);
    const value = make(
      'span',
      'atlas-hour__temp',
      hour.temp == null ? '—' : formatTemperature(hour.temp, state.units)
    );
    item.append(time, iconNode, value);
    if (hour.precipProbability != null && hour.precipProbability > 0) {
      item.append(make('span', 'atlas-hour__rain', `${Math.round(hour.precipProbability)}%`));
    }
    list.append(item);
  }
}

function hourIsDay(weather, iso) {
  const match = String(iso || '').match(/T(\d{2})/);
  if (!match) return weather.current.isDay;
  const hour = Number(match[1]);
  const today = weather.daily[0];
  if (!today) return weather.current.isDay;
  const sunrise = Number((today.sunrise.match(/T(\d{2})/) || [])[1]);
  const sunset = Number((today.sunset.match(/T(\d{2})/) || [])[1]);
  if (!Number.isFinite(sunrise) || !Number.isFinite(sunset)) return weather.current.isDay;
  return hour >= sunrise && hour < sunset;
}

function renderForecast(weather) {
  const list = $('#forecastList');
  if (!list) return;
  list.replaceChildren();
  for (const [index, day] of weather.daily.slice(0, 7).entries()) {
    const item = make('div', 'atlas-day');
    const label = index === 0 ? t('today') : index === 1 ? t('tomorrow') : formatDay(day.date);
    const name = make('span', 'atlas-day__name', label);
    const iconNode = make('span', 'atlas-day__icon');
    setIcon(iconNode, weatherInfo(day.code, true).icon);
    const temps = make('span', 'atlas-day__temps');
    temps.append(
      make('strong', null, day.max == null ? '—' : formatTemperature(day.max, state.units)),
      make('span', null, day.min == null ? '—' : formatTemperature(day.min, state.units))
    );
    item.append(name, iconNode, temps);
    if (day.precipProbability != null && day.precipProbability > 0) {
      item.append(make('span', 'atlas-day__rain', `${Math.round(day.precipProbability)}%`));
    }
    list.append(item);
  }
}

/* -------------------------------------------------------------------------- */
/* Ricerca                                                                    */
/* -------------------------------------------------------------------------- */

function closeSearch() {
  state.searchOpen = false;
  const results = $('#searchResults');
  if (results) {
    results.hidden = true;
    results.replaceChildren();
  }
}

async function runSearch(event) {
  if (event) event.preventDefault();
  const input = $('#searchInput');
  const query = input ? input.value.trim() : '';
  if (query.length < 2) return;

  if (state.searchAbort) state.searchAbort.abort();
  const controller = new AbortController();
  state.searchAbort = controller;
  state.searchLoading = true;
  state.searchError = '';
  state.searchResults = [];
  state.searchOpen = true;
  const status = $('#searchStatus');
  if (status) status.textContent = t('searching');
  const button = $('#searchBtn');
  if (button) button.setAttribute('aria-busy', 'true');
  const label = $('#searchBtnLabel');
  if (label) label.textContent = t('searching');
  renderSearchResults();

  try {
    const results = await searchPlaces(query, {
      signal: controller.signal,
      lang: getLang()
    });
    if (state.searchAbort !== controller) return;
    state.searchResults = results;
    state.searchLoading = false;
    state.searchOpen = true;
    renderSearchResults();
    if (status) {
      status.textContent = results.length ? t('resultsCount', { n: results.length }) : t('noResults');
    }
  } catch (error) {
    if (error && error.name === 'AbortError') return;
    if (state.searchAbort !== controller) return;
    state.searchLoading = false;
    state.searchError = 'searchError';
    state.searchOpen = true;
    renderSearchResults();
    if (status) status.textContent = t('searchError');
  } finally {
    if (state.searchAbort === controller) {
      if (button) button.removeAttribute('aria-busy');
      if (label) label.textContent = t('search');
    }
  }
}

function renderSearchResults() {
  const box = $('#searchResults');
  if (!box) return;
  box.replaceChildren();
  box.hidden = !state.searchOpen;
  if (!state.searchOpen) return;

  if (state.searchLoading) {
    const loading = make('div', 'atlas-results__status');
    loading.append(make('span', 'atlas-spinner', ''), document.createTextNode(t('searching')));
    box.append(loading);
    return;
  }

  if (state.searchError) {
    box.append(make('p', 'atlas-results__status', t(state.searchError)));
    return;
  }

  if (!state.searchResults.length) {
    box.append(make('p', 'atlas-results__status', t('noResults')));
    return;
  }

  for (const result of state.searchResults) {
    const button = make('button', 'atlas-result');
    button.type = 'button';
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', 'false');
    button.dataset.resultId = result.id;
    const text = make('span', 'atlas-result__text');
    text.append(make('strong', null, result.name), make('span', null, result.detail || result.country || ''));
    const coords = make(
      'span',
      'atlas-result__coords',
      `${formatCoord(result.lat, 3)}, ${formatCoord(result.lng, 3)}`
    );
    button.append(text, coords);
    button.addEventListener('click', () => {
      const input = $('#searchInput');
      if (input) input.value = `${result.name}${result.countryCode ? ', ' + result.countryCode : ''}`;
      closeSearch();
      selectPlace(result, { fly: true, focus: true });
    });
    box.append(button);
  }
}

/* -------------------------------------------------------------------------- */
/* Luoghi salvati                                                             */
/* -------------------------------------------------------------------------- */

function renderPlaces() {
  const list = $('#placesList');
  const empty = $('#placesEmpty');
  if (!list) return;
  list.replaceChildren();
  if (empty) empty.hidden = state.places.length > 0;

  for (const place of state.places) {
    const row = make('div', 'atlas-place');
    row.dataset.placeId = place.id;
    if (sameCoords(place, state.selected)) row.classList.add('is-active');

    const open = make('button', 'atlas-place__open');
    open.type = 'button';
    const name = make('span', 'atlas-place__name', place.name);
    const coords = make(
      'span',
      'atlas-place__coords',
      place.detail || `${formatCoord(place.lat, 3)}, ${formatCoord(place.lng, 3)}`
    );
    open.append(name, coords);
    open.addEventListener('click', () => selectPlace(place, { fly: true, focus: true }));

    const remove = make('button', 'atlas-place__remove');
    remove.type = 'button';
    remove.setAttribute('aria-label', `${t('removePlace')} ${place.name}`);
    remove.innerHTML = icon('close');
    remove.addEventListener('click', async (event) => {
      event.stopPropagation();
      const ok = await confirmDialog({
        title: t('confirmRemoveTitle'),
        message: t('confirmRemoveText'),
        confirmText: t('confirmRemove'),
        cancelText: t('cancel')
      });
      if (!ok) return;
      state.places = removePlace(place.id);
      renderPlaces();
      renderWeather();
      toast(t('placeRemoved'));
    });

    row.append(open, remove);
    list.append(row);
  }
}

function saveSelectedPlace() {
  if (!state.selected) return;
  const result = addPlace({ ...state.selected, name: placeLabel(state.selected) });
  if (result.item) {
    state.places = result.places;
    renderPlaces();
    renderWeather();
    toast(t('placeSaved'));
  }
}

/* -------------------------------------------------------------------------- */
/* Distanze                                                                   */
/* -------------------------------------------------------------------------- */

function syncMeasureInputs() {
  const values = [
    ['latA', state.measureA && state.measureA.lat],
    ['lngA', state.measureA && state.measureA.lng],
    ['latB', state.measureB && state.measureB.lat],
    ['lngB', state.measureB && state.measureB.lng]
  ];
  for (const [id, value] of values) {
    const input = document.getElementById(id);
    if (input) input.value = value == null ? '' : formatCoord(value, 5);
  }
}

function readPoint(prefix) {
  const latInput = document.getElementById('lat' + prefix);
  const lngInput = document.getElementById('lng' + prefix);
  if (!latInput || !lngInput) return { point: null, empty: true, invalid: false };
  const lat = latInput.value.trim();
  const lng = lngInput.value.trim();
  if (!lat && !lng) return { point: null, empty: true, invalid: false };
  if (!lat || !lng) return { point: null, empty: false, invalid: true };
  const point = normalizeLatLng(lat, lng);
  return { point, empty: false, invalid: !point };
}

function handleMeasureInput() {
  const a = readPoint('A');
  const b = readPoint('B');
  for (const [prefix, result] of [['A', a], ['B', b]]) {
    const lat = document.getElementById('lat' + prefix);
    const lng = document.getElementById('lng' + prefix);
    if (lat) lat.setAttribute('aria-invalid', String(result.invalid));
    if (lng) lng.setAttribute('aria-invalid', String(result.invalid));
  }
  state.measureA = a.point;
  state.measureB = b.point;

  if (a.invalid || b.invalid) {
    state.measureError = 'invalidCoords';
  } else {
    state.measureError = '';
  }
  renderMeasure();
}

function renderMeasure() {
  const summary = distanceSummary(state.measureA, state.measureB, state.units);
  const distance = $('#distanceValue');
  if (distance) distance.textContent = `${summary.distance.value} ${summary.distance.unit}`;
  const bearing = $('#bearingValue');
  if (bearing) {
    bearing.textContent =
      state.measureA && state.measureB ? `${Math.round(summary.bearing)}° ${summary.compass}` : '—';
  }
  const midpoint = $('#midpointValue');
  if (midpoint) {
    midpoint.textContent = summary.midpoint
      ? `${formatCoord(summary.midpoint.lat, 4)}, ${formatCoord(summary.midpoint.lng, 4)}`
      : '—';
  }
  const error = $('#measureStatus');
  if (error) {
    error.hidden = !state.measureError;
    error.textContent = state.measureError ? t(state.measureError) : '';
  }
  const weatherButton = $('#measureWeather');
  if (weatherButton) weatherButton.disabled = !summary.midpoint;
  renderMapLayers();
}

function resetMeasure() {
  state.measureA = null;
  state.measureB = null;
  state.measureError = '';
  syncMeasureInputs();
  renderMeasure();
}

function swapMeasure() {
  const first = state.measureA;
  state.measureA = state.measureB;
  state.measureB = first;
  state.measureError = '';
  syncMeasureInputs();
  renderMeasure();
}

/* -------------------------------------------------------------------------- */
/* Azioni                                                                     */
/* -------------------------------------------------------------------------- */

function shareUrl() {
  const url = new URL(location.href);
  url.hash = state.mode;
  if (state.selected) {
    url.searchParams.set('lat', String(state.selected.lat));
    url.searchParams.set('lng', String(state.selected.lng));
    if (state.selected.name) url.searchParams.set('name', state.selected.name);
  }
  return url.toString();
}

async function shareSelected() {
  if (!state.selected) return;
  const url = shareUrl();
  const data = {
    title: 'Atlas',
    text: `${placeLabel(state.selected)} — ${t('shareText')}`,
    url
  };
  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch (error) {
      if (error && error.name === 'AbortError') return;
    }
  }
  const ok = await copyText(url);
  toast(ok ? t('copied') : t('shareUnavailable'));
}

async function copyCoordinates() {
  if (!state.selected) return;
  const ok = await copyText(
    `${formatCoord(state.selected.lat, 5)}, ${formatCoord(state.selected.lng, 5)}`
  );
  toast(ok ? t('coordsCopied') : t('copyFailed'));
}

function locate() {
  if (!navigator.geolocation) {
    toast(t('locationUnsupported'));
    return;
  }
  const button = $('#locateBtn');
  if (button) button.disabled = true;
  const label = $('#locateLabel');
  if (label) label.textContent = t('locating');
  navigator.geolocation.getCurrentPosition(
    (position) => {
      if (button) button.disabled = false;
      if (label) label.textContent = t('locate');
      const coords = normalizeLatLng(position.coords.latitude, position.coords.longitude);
      if (!coords) return;
      selectPlace({ name: '', detail: '', ...coords }, { fly: true, zoom: 11, focus: true });
    },
    (error) => {
      if (button) button.disabled = false;
      if (label) label.textContent = t('locate');
      toast(
        t(
          error && error.code === 1
            ? 'locationDenied'
            : error && error.code === 2
              ? 'locationUnsupported'
              : 'locationError'
        )
      );
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
  );
}

/* -------------------------------------------------------------------------- */
/* Lingua                                                                     */
/* -------------------------------------------------------------------------- */

function updateDynamicLanguage() {
  applyStatic(document);
  if (state.searchAbort) state.searchAbort.abort();
  state.searchLoading = false;
  closeSearch();
  const searchLabel = $('#searchBtnLabel');
  if (searchLabel) searchLabel.textContent = t(state.searchLoading ? 'searching' : 'search');
  renderWeather();
  renderPlaces();
  renderMeasure();
  setMode(state.mode, { silent: true });
  updateOnlineBanner();
}

/* -------------------------------------------------------------------------- */
/* Init                                                                       */
/* -------------------------------------------------------------------------- */

function bindEvents() {
  const searchForm = $('#searchForm');
  if (searchForm) searchForm.addEventListener('submit', runSearch);

  const searchInput = $('#searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const clear = $('#searchClear');
      if (clear) clear.hidden = !searchInput.value;
      if (!searchInput.value.trim()) {
        if (state.searchAbort) state.searchAbort.abort();
        state.searchLoading = false;
        state.searchOpen = false;
        renderSearchResults();
      }
    });
  }

  const clear = $('#searchClear');
  if (clear) {
    clear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      clear.hidden = true;
      closeSearch();
    });
  }

  document.addEventListener('click', (event) => {
    if (!state.searchOpen) return;
    const form = $('#searchForm');
    if (form && form.contains(event.target)) return;
    closeSearch();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.searchOpen) {
      closeSearch();
      if (searchInput) searchInput.focus();
    }
  });

  for (const button of $$('#modeSwitch [data-mode]')) {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  }

  for (const button of $$('#unitsSwitch [data-units]')) {
    button.addEventListener('click', () => {
      state.units = button.dataset.units === 'imperial' ? 'imperial' : 'metric';
      state.settings.units = state.units;
      saveSettings(state.settings);
      for (const item of $$('#unitsSwitch [data-units]')) {
        item.setAttribute('aria-pressed', String(item.dataset.units === state.units));
      }
      renderWeather();
      renderMeasure();
    });
  }

  const locateBtn = $('#locateBtn');
  if (locateBtn) {
    locateBtn.addEventListener('click', locate);
  }

  const save = $('#savePlaceBtn');
  if (save) save.addEventListener('click', saveSelectedPlace);

  const share = $('#shareBtn');
  if (share) {
    share.addEventListener('click', shareSelected);
  }

  const copy = $('#copyCoordsBtn');
  if (copy) {
    copy.addEventListener('click', copyCoordinates);
  }

  const refresh = $('#refreshBtn');
  if (refresh) {
    refresh.addEventListener('click', () => loadWeather());
  }

  const retry = $('#weatherRetry');
  if (retry) retry.addEventListener('click', () => loadWeather());

  const measureForm = $('#measureForm');
  if (measureForm) {
    measureForm.addEventListener('submit', (event) => event.preventDefault());
    measureForm.addEventListener('change', handleMeasureInput);
  }

  const swap = $('#swapPoints');
  if (swap) {
    swap.addEventListener('click', swapMeasure);
  }

  const reset = $('#resetMeasure');
  if (reset) {
    reset.addEventListener('click', resetMeasure);
  }

  const midpointWeather = $('#measureWeather');
  if (midpointWeather) {
    midpointWeather.addEventListener('click', () => {
      if (!state.measureA || !state.measureB) return;
      const mid = distanceSummary(state.measureA, state.measureB, state.units).midpoint;
      if (!mid) return;
      selectPlace({ name: '', detail: '', ...mid }, { fly: true, focus: true });
    });
  }

  window.addEventListener('online', () => {
    updateOnlineBanner();
    if (state.selected && !state.weather && !state.loading) loadWeather();
  });
  window.addEventListener('offline', updateOnlineBanner);

  window.addEventListener('hashchange', () => {
    const hash = location.hash.slice(1);
    if (hash === 'weather' || hash === 'measure') setMode(hash, { silent: true });
  });

  window.addEventListener('project:langchange', (event) => {
    setLang(event && event.detail ? event.detail.lang : getLang());
    document.documentElement.lang = getLang();
    updateDynamicLanguage();
  });

  window.addEventListener('beforeunload', () => {
    if (state.weatherAbort) state.weatherAbort.abort();
    if (state.searchAbort) state.searchAbort.abort();
    if (state.reverseAbort) state.reverseAbort.abort();
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline opzionale */
    });
  });
}

function initialSelection() {
  const params = new URLSearchParams(location.search);
  const lat = params.get('lat');
  const lng = params.get('lng');
  if (lat != null && lng != null) {
    const coords = normalizeLatLng(lat, lng);
    if (coords) {
      selectPlace(
        { name: params.get('name') || '', detail: '', ...coords },
        { fly: true, zoom: 10 }
      );
      return;
    }
  }
  if (state.mode === 'measure') {
    renderWeather();
    return;
  }
  if (state.settings.lastPlace) {
    selectPlace(state.settings.lastPlace, { fly: false, zoom: state.map ? state.map.getZoom() : 6 });
  } else {
    renderWeather();
  }
}

function init() {
  const initialLang =
    (window.ProjectShell && window.ProjectShell.getLang && window.ProjectShell.getLang()) ||
    window.__PROJECT_LANG__ ||
    document.documentElement.lang ||
    'en';
  initLang(initialLang);
  document.documentElement.lang = getLang();
  applyStatic(document);
  hydrateIcons(document);

  state.settings = loadSettings();
  state.places = loadPlaces();
  state.cache = loadWeatherCache();
  state.units = state.settings.units;
  const hash = location.hash.slice(1);
  state.mode = hash === 'measure' || hash === 'weather' ? hash : state.settings.mode;

  initMap();
  bindEvents();

  for (const button of $$('#unitsSwitch [data-units]')) {
    button.setAttribute('aria-pressed', String(button.dataset.units === state.units));
  }
  const clear = $('#searchClear');
  if (clear) clear.hidden = true;
  updateOnlineBanner();
  renderPlaces();
  syncMeasureInputs();
  renderMeasure();
  setMode(state.mode, { silent: true });
  initialSelection();
  registerServiceWorker();

  if (state.map) {
    requestAnimationFrame(() => state.map.invalidateSize());
    if (window.ResizeObserver) {
      try {
        new ResizeObserver(() => {
          state.map.invalidateSize();
        }).observe($('#mapWrap'));
      } catch {
        /* ignore */
      }
    }
  }

  window.__atlas = {
    map: state.map,
    setMode,
    selectPlace: (place) => selectPlace(place, { fly: true, focus: true }),
    getState: () => ({
      mode: state.mode,
      units: state.units,
      selected: state.selected,
      weather: state.weather,
      loading: state.loading,
      errorKey: state.errorKey,
      places: state.places
    })
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
