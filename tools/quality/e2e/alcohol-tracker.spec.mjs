import { expect, test } from '@playwright/test';

const APP = '/projects/alcohol-tracker/';

const PROFILE = {
  sex: 'male',
  weight: 70,
  height: 175,
  age: 30,
  metab: 'medium',
  items: [],
  favs: []
};

async function seed(page, state = PROFILE) {
  await page.addInitScript((value) => {
    localStorage.setItem('alcotracker_v2', JSON.stringify(value));
  }, state);
}

test.describe('AlcoTracker', () => {
  test('saves the profile and exposes a consistent model', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(APP);

    await expect(page.locator('#profileCard')).toBeVisible();
    await page.fill('#weight', '82');
    await page.fill('#height', '181');
    await page.fill('#age', '34');
    await page.click('#saveProfile');

    await expect(page.locator('#mainGrid')).toBeVisible();
    await expect(page.locator('#profileName')).toContainText('82 kg');
    await expect(page.locator('#bacNow')).toHaveText('0.00');
    await expect(page.locator('#bacState')).toHaveText('Nessun dato');

    const checks = await page.evaluate(() => window.__ALCO__.selfTest());
    expect(checks.length).toBeGreaterThan(8);
    expect(checks.filter((check) => !check.pass)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('meal lowers and delays the peak but never speeds elimination', async ({ page }) => {
    await seed(page);
    await page.goto(APP);

    const result = await page.evaluate(() => {
      const A = window.__ALCO__;
      const M = A.model;
      const base = new Date('2026-01-15T20:00:00').getTime();
      const beer = { food: false, grams: M.grams(330, 4.7), t: new Date(base) };
      const meal = { food: true, foodFactor: 0.6, t: new Date(base) };
      const empty = M.buildCurve([beer], A.state());
      const fed = M.buildCurve([beer, meal], A.state());
      const emptyPeak = M.peakInfo(empty);
      const fedPeak = M.peakInfo(fed);
      const emptyZero = M.crossing(empty, 0.001);
      const fedZero = M.crossing(fed, 0.001);
      const lateMeal = M.buildCurve([beer, { ...meal, t: new Date(base + 4 * 3600000) }], A.state());
      return {
        emptyPeak: emptyPeak.bac,
        fedPeak: fedPeak.bac,
        emptyTmax: (emptyPeak.t - base) / 60000,
        fedTmax: (fedPeak.t - base) / 60000,
        emptyZero: (emptyZero - base) / 60000,
        fedZero: (fedZero - base) / 60000,
        lateDelta: Math.abs(
          M.bacAt(lateMeal, new Date(base + 2 * 3600000)) -
          M.bacAt(empty, new Date(base + 2 * 3600000))
        )
      };
    });

    expect(result.emptyPeak).toBeGreaterThan(0.15);
    expect(result.emptyPeak).toBeLessThan(0.25);
    expect(result.fedPeak).toBeLessThan(result.emptyPeak);
    expect(result.fedTmax).toBeGreaterThan(result.emptyTmax);
    expect(result.fedZero).toBeGreaterThanOrEqual(result.emptyZero - 5);
    expect(result.lateDelta).toBeLessThan(1e-6);
  });

  test('shows the correct warning while above the limit', async ({ page }) => {
    const now = Date.now();
    await seed(page, {
      ...PROFILE,
      items: [0, 1, 2, 3].map((i) => ({
        food: false,
        em: '🍺',
        nm: 'Birra piccola',
        vol: 330,
        abv: 4.7,
        grams: 12.24,
        t: new Date(now - (20 - i * 5) * 60000).toISOString()
      }))
    });
    await page.goto(APP);

    await expect(page.locator('#bacState')).toHaveText('Sopra il limite');
    await expect(page.locator('#driveTitle')).toHaveText('Non guidare');
    await expect(page.locator('#driveTime')).toContainText('Sotto il limite alle');
    await expect(page.locator('#driveBox')).toHaveClass(/no/);
    await expect(page.locator('#mPeak')).not.toHaveText('—');
    await expect(page.locator('#mSober')).not.toHaveText('—');
  });

  test('uses the next limit crossing when a later round raises BAC again', async ({ page }) => {
    const now = Date.now();
    const beer = (minutesAgo) => ({
      food: false,
      em: '🍺',
      nm: 'Birra piccola',
      vol: 330,
      abv: 4.7,
      grams: 12.24,
      t: new Date(now - minutesAgo * 60000).toISOString()
    });
    await seed(page, {
      ...PROFILE,
      items: [240, 232, 224, 36, 28, 20].map(beer)
    });
    await page.goto(APP);

    await expect(page.locator('#bacState')).toHaveText('Sopra il limite');
    await expect(page.locator('#driveTitle')).toHaveText('Non guidare');
    await expect(page.locator('#driveTime')).toContainText('tra ');
    await expect(page.locator('#driveTime')).not.toContainText('adesso');
    await expect(page.locator('#mSober')).not.toHaveText('Adesso');
  });

  test('adds a drink and a meal from the dashboard', async ({ page }) => {
    await seed(page);
    await page.goto(APP);

    await page.locator('#drinkGrid .drink').first().click();
    await expect(page.locator('#items .item')).toHaveCount(1);
    await expect(page.locator('#mCount')).toHaveText('1');
    await expect(page.locator('#bacState')).not.toHaveText('Nessun dato');

    await page.click('#addFood');
    await expect(page.locator('#items .item')).toHaveCount(2);
    await expect(page.locator('#items .item').first()).toContainText('Spuntino leggero');

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('alcotracker_v2')));
    expect(stored.items).toHaveLength(2);
    expect(stored.items.some((item) => item.food && item.foodFactor === 0.9)).toBe(true);
  });

  test('explains that a late meal does not change the curve', async ({ page }) => {
    await seed(page, {
      ...PROFILE,
      items: [{
        food: false,
        em: '🍺',
        nm: 'Birra piccola',
        vol: 330,
        abv: 4.7,
        grams: 12.24,
        t: new Date(Date.now() - 3 * 3600000).toISOString()
      }]
    });
    await page.goto(APP);
    await page.click('#addFood');
    await expect(page.locator('#toastMsg')).toContainText('già assorbito');
    await expect(page.locator('#items .item').filter({ hasText: 'Spuntino leggero' })).not.toContainText('Pasto ·');
  });

  test('timeline adds an item by drag and deletes it', async ({ page }) => {
    await seed(page);
    await page.goto(APP);
    await page.click('#tabTimeline');
    await expect(page.locator('#timelineView')).toBeVisible();

    const chip = page.locator('#tlDrinkChips .chip2').first();
    const canvas = page.locator('#tlCanvas');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    await chip.locator('.fav').click();
    await expect(page.locator('#favChips .chip2')).toHaveCount(1);
    await expect(page.locator('#items .item')).toHaveCount(0);

    await chip.dragTo(canvas, { targetPosition: { x: box.width * 0.6, y: box.height * 0.5 } });
    await expect(page.locator('#items .item')).toHaveCount(1);
    await expect(page.locator('#tlSelBar')).not.toHaveClass(/on/);

    await canvas.click({ position: { x: box.width * 0.6, y: box.height * 0.5 } });
    await expect(page.locator('#tlSelBar')).toHaveClass(/on/);
    await page.click('#tlDelSelBar');
    await expect(page.locator('#items .item')).toHaveCount(0);
  });

  test('blocks underage profiles and keeps the info modal accessible', async ({ page }) => {
    await page.goto(APP);
    await page.fill('#weight', '60');
    await page.fill('#height', '170');
    await page.fill('#age', '16');
    await page.click('#saveProfile');
    await expect(page.locator('#underage')).toHaveClass(/on/);
    await expect(page.locator('#mainGrid')).toBeHidden();

    await page.click('#underageEdit');
    await expect(page.locator('#underage')).not.toHaveClass(/on/);
    await page.fill('#age', '30');
    await page.click('#saveProfile');
    await expect(page.locator('#mainGrid')).toBeVisible();

    await page.click('#infoBtn');
    await expect(page.locator('#infoModal')).toHaveClass(/on/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#infoModal')).not.toHaveClass(/on/);
  });
});
