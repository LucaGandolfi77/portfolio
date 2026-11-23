import { expect, test } from '@playwright/test';

import {
  REVERSE_FIXTURE,
  SEARCH_FIXTURE,
  weatherFixture
} from '../../../projects/atlas/tests/fixtures.mjs';

const APP = '/projects/atlas/';
const TILE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

async function mockApis(page) {
  await page.route(/https:\/\/api\.open-meteo\.com\/v1\/forecast/, (route) =>
    route.fulfill({ json: weatherFixture() })
  );
  await page.route(/https:\/\/nominatim\.openstreetmap\.org\/search/, (route) =>
    route.fulfill({ json: SEARCH_FIXTURE })
  );
  await page.route(/https:\/\/nominatim\.openstreetmap\.org\/reverse/, (route) =>
    route.fulfill({ json: REVERSE_FIXTURE })
  );
  await page.route(/https:\/\/[abc]\.tile\.openstreetmap\.org\//, (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: TILE_PNG })
  );
}

test.beforeEach(async ({ page }) => {
  await mockApis(page);
});

test.describe('Atlas', () => {
  test('searches a place, renders weather and saves it', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(APP);
    await expect(page.locator('h1')).toHaveText('The world, at a glance');
    await expect(page.locator('.leaflet-container')).toBeVisible();

    await page.fill('#searchInput', 'Milano');
    await page.click('#searchBtn');
    await expect(page.locator('#searchResults')).toBeVisible();
    await expect(page.locator('.atlas-result')).toHaveCount(2);
    await page.locator('.atlas-result').first().click();

    await expect(page.locator('#weatherContent')).toBeVisible();
    await expect(page.locator('#placeName')).toHaveText('Milano');
    await expect(page.locator('#placeDetail')).toHaveText('Lombardia · Italia');
    await expect(page.locator('#currentTemp')).toHaveText('12°C');
    await expect(page.locator('#currentCondition')).toHaveText('Partly cloudy');
    await expect(page.locator('#metricHumidity')).toHaveText('68%');
    await expect(page.locator('#metricHighLow')).toHaveText('15°C / 7°C');
    await expect(page.locator('.atlas-hour')).toHaveCount(9);
    await expect(page.locator('.atlas-day')).toHaveCount(7);
    await expect(page.locator('.atlas-day').first()).toContainText('Today');

    await page.click('#savePlaceBtn');
    await expect(page.locator('.atlas-place')).toHaveCount(1);
    await expect(page.locator('#savePlaceBtn')).toBeDisabled();
    const places = await page.evaluate(() => JSON.parse(localStorage.getItem('pf.atlas.places')));
    expect(places).toHaveLength(1);
    expect(places[0].name).toBe('Milano');
    expect(errors).toEqual([]);
  });

  test('measures distance from map clicks and coordinates', async ({ page }) => {
    await page.goto(APP + '#measure');
    await expect(page.locator('#measurePanel')).toBeVisible();

    await page.evaluate(() => {
      const map = window.__atlas.map;
      map.fire('click', { latlng: L.latLng(45.4642, 9.19) });
      map.fire('click', { latlng: L.latLng(41.9028, 12.4964) });
    });

    await expect(page.locator('#latA')).toHaveValue('45.46420');
    await expect(page.locator('#lngB')).toHaveValue('12.49640');
    const distance = parseFloat(await page.locator('#distanceValue').textContent());
    expect(distance).toBeGreaterThan(470);
    expect(distance).toBeLessThan(485);
    await expect(page.locator('#bearingValue')).toContainText('SE');
    await expect(page.locator('#midpointValue')).not.toHaveText('—');

    await page.click('#swapPoints');
    await expect(page.locator('#latA')).toHaveValue('41.90280');

    await page.fill('#latA', '45.4642');
    await page.fill('#lngA', '9.19');
    await page.fill('#latB', '48.8566');
    await page.fill('#lngB', '2.3522');
    await page.evaluate(() => {
      document.querySelector('#measureForm').dispatchEvent(new Event('change', { bubbles: true }));
    });
    const paris = parseFloat(await page.locator('#distanceValue').textContent());
    expect(paris).toBeGreaterThan(630);
    expect(paris).toBeLessThan(650);
    await expect(page.locator('#measureWeather')).toBeEnabled();

    await page.click('#measureWeather');
    await expect(page.locator('#weatherPanel')).toBeVisible();
    await expect(page.locator('#weatherContent')).toBeVisible();

    await page.click('#modeSwitch [data-mode="measure"]');
    await page.click('#resetMeasure');
    await expect(page.locator('#latA')).toHaveValue('');
    await expect(page.locator('#distanceValue')).toHaveText('0.00 km');
    await expect(page.locator('#measureWeather')).toBeDisabled();
  });

  test('switches units and language without refetching', async ({ page }) => {
    await page.goto(APP + '?lat=45.4642&lng=9.19&name=Milano');
    await expect(page.locator('#currentTemp')).toHaveText('12°C');
    await expect(page.locator('#metricHighLow')).toHaveText('15°C / 7°C');

    await page.click('#unitsSwitch [data-units="imperial"]');
    await expect(page.locator('#currentTemp')).toHaveText('54°F');
    await expect(page.locator('#metricHighLow')).toContainText('59°F');
    const settings = await page.evaluate(() => JSON.parse(localStorage.getItem('pf.atlas.settings')));
    expect(settings.units).toBe('imperial');

    await page.click('.pf-shell__menu-btn');
    await page.selectOption('[data-lang-select]', 'it');
    await expect(page.locator('h1')).toHaveText('Il mondo, a colpo d’occhio');
    await expect(page.locator('#currentCondition')).toHaveText('Parzialmente nuvoloso');
    await expect(page.locator('#savePlaceBtn')).toContainText('Salva luogo');
    await expect(page.locator('#currentTemp')).toHaveText('54°F');
    expect(await page.evaluate(() => localStorage.getItem('pf.lang'))).toBe('it');
  });

  test('uses geolocation and reverse geocoding', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 45.4642, longitude: 9.19 });
    await page.goto(APP);
    await page.click('#locateBtn');
    await expect(page.locator('#placeName')).toHaveText('Milano');
    await expect(page.locator('#currentTemp')).toHaveText('12°C');
    await expect(page.locator('#weatherContent')).toBeVisible();
  });

  test('legacy GPS and weather URLs redirect to the right mode', async ({ page }) => {
    await page.goto('/projects/atlas/legacy-gps.html');
    await expect(page).toHaveURL(/\/projects\/atlas\/index\.html#measure$/);
    await expect(page.locator('#measurePanel')).toBeVisible();

    await page.goto('/projects/atlas/legacy-world_weather.html');
    await expect(page).toHaveURL(/\/projects\/atlas\/index\.html#weather$/);
    await expect(page.locator('#weatherPanel')).toBeVisible();
  });

  test('mobile layout: no overflow, readable inputs and 44px targets', async ({ page }) => {
    await page.goto(APP);
    const metrics = await page.evaluate(() => {
      const search = document.querySelector('#searchInput');
      const mode = document.querySelector('#modeSwitch [data-mode="weather"]');
      const map = document.querySelector('#map');
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        searchFont: parseFloat(getComputedStyle(search).fontSize),
        modeHeight: mode.getBoundingClientRect().height,
        mapHeight: map.getBoundingClientRect().height
      };
    });
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
    expect(metrics.searchFont).toBeGreaterThanOrEqual(16);
    expect(metrics.modeHeight).toBeGreaterThanOrEqual(44);
    expect(metrics.mapHeight).toBeGreaterThan(280);
  });

  test('service worker serves the shell and cached weather offline', async ({ page, context }) => {
    await page.goto(APP + '?lat=45.4642&lng=9.19&name=Milano');
    await expect(page.locator('#currentTemp')).toHaveText('12°C');

    const state = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return { scope: registration.scope, keys: await caches.keys() };
    });
    expect(state.scope).toContain('/projects/atlas/');
    expect(state.keys).toContain('pf-atlas-shell-v1');

    await page.reload();
    await context.setOffline(true);
    try {
      await page.reload();
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#currentTemp')).toHaveText('12°C');
      await expect(page.locator('#weatherOffline')).toBeVisible();
      await expect(page.locator('#weatherBadge')).toHaveText('cached');
    } finally {
      await context.setOffline(false);
    }
  });
});
