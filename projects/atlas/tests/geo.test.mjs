import test from 'node:test';
import assert from 'node:assert/strict';

import {
  bearingDeg,
  cacheKey,
  compassPoint,
  distanceKm,
  distanceSummary,
  formatDistance,
  formatTemperature,
  formatWind,
  formatPrecipitation,
  midpoint,
  nextHours,
  normalizeLatLng,
  normalizeSearchResults,
  normalizeWeather,
  reversePlaceName,
  weatherIcon,
  weatherInfo
} from '../js/geo.js';
import { REVERSE_FIXTURE, SEARCH_FIXTURE, weatherFixture } from './fixtures.mjs';

const MILAN = { lat: 45.4642, lng: 9.19 };
const PARIS = { lat: 48.8566, lng: 2.3522 };
const ROME = { lat: 41.9028, lng: 12.4964 };

test('normalizeLatLng valida e accetta la virgola decimale', () => {
  assert.deepEqual(normalizeLatLng('45,4642', '9,19'), { lat: 45.4642, lng: 9.19 });
  assert.deepEqual(normalizeLatLng('-33.8688', '151.2093'), { lat: -33.8688, lng: 151.2093 });
  assert.equal(normalizeLatLng('', ''), null);
  assert.equal(normalizeLatLng('abc', '9'), null);
  assert.equal(normalizeLatLng(91, 9), null);
  assert.equal(normalizeLatLng(45, 181), null);
});

test('distanceKm calcola distanze great-circle realistiche', () => {
  assert.ok(Math.abs(distanceKm(MILAN, ROME) - 477) < 8);
  assert.ok(Math.abs(distanceKm(MILAN, PARIS) - 640) < 10);
  assert.equal(distanceKm(MILAN, MILAN), 0);
  assert.equal(distanceKm(null, PARIS), 0);
});

test('bearing e compass mostrano la direzione iniziale', () => {
  const bearing = bearingDeg(MILAN, PARIS);
  assert.ok(bearing > 280 && bearing < 320, `bearing inatteso: ${bearing}`);
  assert.equal(compassPoint(0), 'N');
  assert.equal(compassPoint(90), 'E');
  assert.equal(compassPoint(225), 'SW');
  assert.equal(compassPoint(-45), 'NW');
});

test('midpoint resta tra i due punti', () => {
  const mid = midpoint(MILAN, ROME);
  assert.ok(mid.lat > ROME.lat && mid.lat < MILAN.lat);
  assert.ok(mid.lng > MILAN.lng && mid.lng < ROME.lng);
  assert.equal(midpoint(null, ROME), null);
});

test('formatta distanza, temperatura, vento e precipitazioni', () => {
  assert.deepEqual(formatDistance(1.234, 'metric'), { value: '1.23', unit: 'km', numeric: 1.234 });
  assert.equal(formatDistance(100, 'metric').value, '100');
  assert.equal(formatDistance(100, 'imperial').unit, 'mi');

  assert.equal(formatTemperature(12.4, 'metric'), '12°C');
  assert.equal(formatTemperature(12.4, 'imperial'), '54°F');
  assert.equal(formatTemperature(null), '—');

  assert.equal(formatWind(8.5, 'metric'), '9 km/h');
  assert.equal(formatWind(8.5, 'imperial'), '5 mph');
  assert.equal(formatWind(null), '—');

  assert.equal(formatPrecipitation(0.2, 'metric'), '0.2 mm');
  assert.equal(formatPrecipitation(25.4, 'imperial'), '1.0 in');
});

test('weatherInfo mappa i codici WMO, giorno/notte e sconosciuti', () => {
  assert.equal(weatherInfo(0, true).key, 'clear');
  assert.equal(weatherInfo(0, true).icon, 'sun');
  assert.equal(weatherInfo(0, false).icon, 'moon');
  assert.equal(weatherInfo(2).key, 'partly');
  assert.equal(weatherInfo(2).group, 'clouds');
  assert.equal(weatherInfo(61).group, 'rain');
  assert.equal(weatherInfo(71).group, 'snow');
  assert.equal(weatherInfo(95).group, 'storm');
  assert.equal(weatherInfo(null).key, 'unknown');
  assert.equal(weatherInfo(999).key, 'unknown');
  assert.equal(weatherIcon('snowShowers'), 'snow');
});

test('normalizeWeather converte il payload Open-Meteo', () => {
  const weather = normalizeWeather(weatherFixture());
  assert.equal(weather.timezone, 'Europe/Rome');
  assert.equal(weather.current.temp, 12.4);
  assert.equal(weather.current.feels, 10.8);
  assert.equal(weather.current.humidity, 68);
  assert.equal(weather.current.code, 2);
  assert.equal(weather.current.isDay, true);
  assert.equal(weather.daily.length, 7);
  assert.equal(weather.hourly.length, 24);
  assert.deepEqual(weather.daily[0], {
    date: '2026-11-20',
    code: 2,
    max: 15,
    min: 7,
    precipProbability: 10,
    sunrise: '2026-11-20T07:20',
    sunset: '2026-11-20T17:00'
  });
  assert.throws(() => normalizeWeather({}), /non valida/);
  assert.throws(() => normalizeWeather({ current: {} }), /Temperatura/);
});

test('nextHours parte dall’ora corrente e rispetta il limite', () => {
  const weather = normalizeWeather(weatherFixture());
  const hours = nextHours(weather.hourly, '2026-11-20T08:10', 12);
  assert.equal(hours.length, 12);
  assert.equal(hours[0].time, '2026-11-20T09:00');
  assert.equal(hours[11].time, '2026-11-20T20:00');
  assert.deepEqual(nextHours([], '2026-11-20T08:10'), []);
});

test('normalizeSearchResults produce voci pulite e deduplicate', () => {
  const results = normalizeSearchResults(SEARCH_FIXTURE);
  assert.equal(results.length, 2);
  assert.deepEqual(results[0], {
    id: '45.464,9.19',
    name: 'Milano',
    detail: 'Lombardia · Italia',
    country: 'Italia',
    countryCode: 'IT',
    lat: 45.4642,
    lng: 9.19,
    type: 'city'
  });
  const duplicate = normalizeSearchResults([...SEARCH_FIXTURE, SEARCH_FIXTURE[0]]);
  assert.equal(duplicate.length, 2);
  assert.deepEqual(normalizeSearchResults(null), []);
});

test('reversePlaceName estrae città e paese', () => {
  const place = reversePlaceName(REVERSE_FIXTURE);
  assert.equal(place.name, 'Milano');
  assert.equal(place.countryCode, 'IT');
  assert.equal(reversePlaceName({}), null);
});

test('cacheKey arrotonda e rifiuta coordinate invalide', () => {
  assert.equal(cacheKey(45.46421, 9.19004), '45.464,9.19');
  assert.equal(cacheKey('x', 9), '');
});

test('distanceSummary aggrega distanza, direzione e punto medio', () => {
  const summary = distanceSummary(MILAN, ROME, 'metric');
  assert.ok(Number(summary.distance.value) > 400);
  assert.equal(summary.distance.unit, 'km');
  assert.ok(summary.bearing > 120 && summary.bearing < 180);
  assert.ok(summary.midpoint.lat < MILAN.lat && summary.midpoint.lat > ROME.lat);
  assert.equal(summary.compass, 'SE');
});
