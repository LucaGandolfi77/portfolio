/**
 * api.js — Open-Meteo per il meteo, Nominatim per la ricerca.
 * Le funzioni accettano `fetchImpl` e `signal` per essere testabili senza rete.
 */

import { normalizeSearchResults, normalizeWeather, reversePlaceName } from './geo.js';

export const WEATHER_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
export const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org';

export class ApiError extends Error {
  constructor(code, cause) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.cause = cause;
  }
}

function defaultFetch() {
  if (typeof fetch !== 'function') throw new ApiError('UNSUPPORTED');
  return fetch;
}

async function readJson(response) {
  if (!response || !response.ok) throw new ApiError('HTTP');
  try {
    return await response.json();
  } catch (error) {
    throw new ApiError('PARSE', error);
  }
}

async function request(url, { fetchImpl, signal, lang = 'en' } = {}) {
  const doFetch = fetchImpl || defaultFetch();
  let response;
  try {
    response = await doFetch(url, {
      signal,
      headers: { Accept: 'application/json', 'Accept-Language': lang },
      referrerPolicy: 'strict-origin-when-cross-origin'
    });
  } catch (error) {
    if (error && error.name === 'AbortError') throw error;
    throw new ApiError('NETWORK', error);
  }
  return readJson(response);
}

export function weatherUrl(lat, lng) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,weather_code,precipitation_probability',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '7',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm'
  });
  return `${WEATHER_ENDPOINT}?${params.toString()}`;
}

export function searchUrl(query, lang = 'en') {
  const params = new URLSearchParams({
    q: String(query || '').trim(),
    format: 'jsonv2',
    addressdetails: '1',
    limit: '6',
    'accept-language': lang
  });
  return `${NOMINATIM_ENDPOINT}/search?${params.toString()}`;
}

export function reverseUrl(lat, lng, lang = 'en') {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'jsonv2',
    addressdetails: '1',
    zoom: '10',
    'accept-language': lang
  });
  return `${NOMINATIM_ENDPOINT}/reverse?${params.toString()}`;
}

export async function fetchWeather(lat, lng, options = {}) {
  const payload = await request(weatherUrl(lat, lng), options);
  try {
    return normalizeWeather(payload);
  } catch (error) {
    throw new ApiError('PARSE', error);
  }
}

export async function searchPlaces(query, options = {}) {
  const text = String(query || '').trim();
  if (!text) return [];
  const payload = await request(searchUrl(text, options.lang || 'en'), options);
  return normalizeSearchResults(payload, 6);
}

export async function reversePlace(lat, lng, options = {}) {
  const payload = await request(reverseUrl(lat, lng, options.lang || 'en'), options);
  return reversePlaceName(payload);
}
