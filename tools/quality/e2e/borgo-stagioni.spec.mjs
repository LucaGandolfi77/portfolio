import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

/* BORGO NOTTE: Quattro Stagioni is a Vite app: the test runs on its build
   (games/borgo-notte-stagioni/dist, built by CI before this job). */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DIST = join(ROOT, 'games', 'borgo-notte-stagioni', 'dist', 'index.html');
const APP = '/games/borgo-notte-stagioni/dist/';
const SAVE_KEY = 'borgo-stagioni-save-v1';

test.skip(!existsSync(DIST), 'build the game first: cd games/borgo-notte-stagioni && npm run build');
/* No GPU on CI runners: WebGL through SwiftShader. */
test.use({
  launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] },
  video: 'off'
});
test.setTimeout(90_000);

function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

test.describe('BORGO NOTTE: Quattro Stagioni', () => {
  test('loads the map data, plays the opening film and starts the story', async ({ page }) => {
    const errors = watchErrors(page);
    const map = page.waitForResponse((r) => r.url().endsWith('/data/fidenza.json'));
    await page.goto(APP);
    expect((await map).status()).toBe(200);
    await expect(page.locator('#title')).toBeVisible({ timeout: 60_000 });
    await page.locator('#play').click();
    await expect(page.locator('#intro')).toBeVisible();
    await page.locator('.intro-skip').click();
    await expect(page.locator('#hud')).toBeVisible();
    await expect(page.locator('#money')).toHaveText(/€ 250/);
    await expect(page.locator('#when')).toContainText('Primavera');
    expect(errors).toEqual([]);
  });

  test('continues a saved game: phone, calendar and jetpack', async ({ page }) => {
    const errors = watchErrors(page);
    await page.addInitScript(([key]) => {
      localStorage.setItem(key, JSON.stringify({ introSeen: true, story: ['stazione'], day: 4, hours: 21, money: 900, quality: 'bassa' }));
    }, [SAVE_KEY]);
    await page.goto(APP);
    await expect(page.locator('#continue')).toBeVisible({ timeout: 60_000 });
    await page.locator('#continue').click();
    await expect(page.locator('#hud')).toBeVisible();
    /* Summer, day 2 at 21:00: the Notte Bianca is on. */
    await expect(page.locator('#when')).toContainText('Notte Bianca');
    await page.locator('#phone-btn').click();
    await expect(page.locator('#phone-body li')).toHaveCount(12);
    await page.locator('.phone-tabs [data-tab="calendario"]').click();
    await expect(page.locator('#phone-body')).toContainText('Notte Bianca');
    await page.locator('#phone-close').click();
    await page.keyboard.press('g');
    await page.keyboard.down('Space');
    await expect(page.locator('#vehicle-name')).toContainText('Jetpack', { timeout: 10_000 });
    await page.waitForTimeout(1500);
    await page.keyboard.up('Space');
    await expect(page.locator('#vehicle-name')).not.toHaveText('Jetpack · 0 m');
    expect(errors).toEqual([]);
  });
});
