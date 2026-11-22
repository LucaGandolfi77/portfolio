import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ApiError,
  NOMINATIM_ENDPOINT,
  WEATHER_ENDPOINT,
  fetchWeather,
  reversePlace,
  reverseUrl,
  searchPlaces,
  searchUrl,
  weatherUrl
} from '../js/api.js';
import { REVERSE_FIXTURE, SEARCH_FIXTURE, weatherFixture } from './fixtures.mjs';

function jsonResponse(payload, options = {}) {
  return {
    ok: options.ok !== false,
    status: options.status || 200,
    json: options.json || (async () => payload)
  };
}

test('weatherUrl contiene i parametri e i blocchi necessari', () => {
  const url = new URL(weatherUrl(45.4642, 9.19));
  assert.equal(url.origin + url.pathname, WEATHER_ENDPOINT);
  assert.equal(url.searchParams.get('latitude'), '45.4642');
  assert.equal(url.searchParams.get('longitude'), '9.19');
  assert.equal(url.searchParams.get('timezone'), 'auto');
  assert.equal(url.searchParams.get('forecast_days'), '7');
  assert.match(url.searchParams.get('current'), /temperature_2m/);
  assert.match(url.searchParams.get('hourly'), /precipitation_probability/);
  assert.match(url.searchParams.get('daily'), /sunrise/);
});

test('searchUrl e reverseUrl rispettano lingua e limiti', () => {
  const search = new URL(searchUrl('Milano, duomo', 'it'));
  assert.equal(search.origin + search.pathname, `${NOMINATIM_ENDPOINT}/search`);
  assert.equal(search.searchParams.get('q'), 'Milano, duomo');
  assert.equal(search.searchParams.get('format'), 'jsonv2');
  assert.equal(search.searchParams.get('limit'), '6');
  assert.equal(search.searchParams.get('accept-language'), 'it');

  const reverse = new URL(reverseUrl(45.4642, 9.19, 'en'));
  assert.equal(reverse.origin + reverse.pathname, `${NOMINATIM_ENDPOINT}/reverse`);
  assert.equal(reverse.searchParams.get('lat'), '45.4642');
  assert.equal(reverse.searchParams.get('lon'), '9.19');
  assert.equal(reverse.searchParams.get('zoom'), '10');
});

test('fetchWeather normalizza Open-Meteo e passa signal/headers', async () => {
  let captured;
  const controller = new AbortController();
  const data = await fetchWeather(45.4642, 9.19, {
    signal: controller.signal,
    lang: 'it',
    fetchImpl: async (url, options) => {
      captured = { url, options };
      return jsonResponse(weatherFixture());
    }
  });
  assert.equal(data.current.temp, 12.4);
  assert.equal(data.daily.length, 7);
  assert.ok(captured.url.startsWith(WEATHER_ENDPOINT));
  assert.equal(captured.options.signal, controller.signal);
  assert.equal(captured.options.headers['Accept-Language'], 'it');
});

test('searchPlaces normalizza e limita i risultati', async () => {
  let url;
  const results = await searchPlaces('Milano', {
    lang: 'it',
    fetchImpl: async (requested) => {
      url = requested;
      return jsonResponse(SEARCH_FIXTURE);
    }
  });
  assert.equal(results.length, 2);
  assert.equal(results[0].name, 'Milano');
  assert.match(url, /accept-language=it/);
  assert.deepEqual(await searchPlaces('   ', { fetchImpl: async () => jsonResponse([]) }), []);
});

test('reversePlace estrae il nome della località', async () => {
  const place = await reversePlace(45.4642, 9.19, {
    fetchImpl: async () => jsonResponse(REVERSE_FIXTURE)
  });
  assert.equal(place.name, 'Milano');
  assert.equal(place.countryCode, 'IT');
});

test('errori HTTP, rete e parsing diventano ApiError', async () => {
  await assert.rejects(
    fetchWeather(1, 2, { fetchImpl: async () => jsonResponse({}, { ok: false, status: 500 }) }),
    (error) => error instanceof ApiError && error.code === 'HTTP'
  );
  await assert.rejects(
    fetchWeather(1, 2, {
      fetchImpl: async () => {
        throw new TypeError('offline');
      }
    }),
    (error) => error instanceof ApiError && error.code === 'NETWORK'
  );
  await assert.rejects(
    fetchWeather(1, 2, {
      fetchImpl: async () => jsonResponse({}, { json: async () => { throw new SyntaxError('json'); } })
    }),
    (error) => error instanceof ApiError && error.code === 'PARSE'
  );
  await assert.rejects(
    fetchWeather(1, 2, { fetchImpl: async () => jsonResponse({ current: {} }) }),
    (error) => error instanceof ApiError && error.code === 'PARSE'
  );
});

test('AbortError viene rilanciato senza transformarlo', async () => {
  const abort = new Error('aborted');
  abort.name = 'AbortError';
  await assert.rejects(
    fetchWeather(1, 2, {
      fetchImpl: async () => {
        throw abort;
      }
    }),
    (error) => error === abort
  );
});
