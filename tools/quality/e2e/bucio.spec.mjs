import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

/* BUCIO is a Vite app: the test runs on its build (games/bucio/dist, built by
   CI before this job). */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DIST = join(ROOT, 'games', 'bucio', 'dist', 'index.html');
const APP = '/games/bucio/dist/';

test.skip(!existsSync(DIST), 'build the game first: cd games/bucio && npm run build');
test.use({ video: 'off' });
/* The town is rendered in software (SwiftShader) here: slow, so generous. */
test.setTimeout(120_000);

test.describe('BUCIO', () => {
  test('loads the Blender kit, plays a match and draws the minimap', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (r) => r.url().includes('/games/bucio/') && r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));

    await page.goto(`${APP}?q=low&t=portomarina&m=citta`);
    /* The props of Portomarina come from its Blender kit, not from the backup. */
    await expect(page.locator('html')).toHaveAttribute('data-kit', /^3\d$/, { timeout: 30_000 });
    await expect(page.locator('#btn-play')).toBeVisible({ timeout: 30_000 });
    const kitMeshes = await page.evaluate(() =>
      window.__bucio.world.group.children.filter((m) => m.isInstancedMesh && !m.material.flatShading).length
    );
    expect(kitMeshes).toBeGreaterThanOrEqual(30);

    await page.locator('#btn-play').click();
    await expect(page.locator('#hud')).toBeVisible();
    /* Drive the hole for a few seconds of game time, then check it ate something. */
    await page.evaluate(() => {
      window.__bucio.autopilot = { x: 0.7, y: -0.5, mag: 1 };
      window.__bucio.ff(6);
    });
    const score = Number((await page.locator('#hud-score').textContent()).replace(/\D/g, ''));
    expect(score).toBeGreaterThan(0);
    await expect.poll(() => page.locator('#hud-minimap').evaluate((c) => c.width)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('the new settings load their own Blender kits', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const [theme, min] of [['luna', 14], ['vigneto', 20]]) {
      await page.goto(`${APP}?q=low&t=${theme}`);
      await expect(page.locator('#btn-play')).toBeVisible({ timeout: 30_000 });
      await expect
        .poll(() => page.evaluate(() => Number(document.documentElement.dataset.kit)), { timeout: 30_000 })
        .toBeGreaterThanOrEqual(min);
      const info = await page.evaluate(() => ({
        theme: window.__bucio.themeId(),
        golds: window.__bucio.world.golds.length,
        planet: !!window.__bucio.engine.scene.getObjectByName('pianeta'),
      }));
      expect(info.theme).toBe(theme);
      expect(info.golds).toBeGreaterThan(0);
      expect(info.planet).toBe(theme === 'luna');
    }
    expect(errors).toEqual([]);
  });

  test('without the Blender kits the game falls back to its procedural models', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route('**/models/kit-*.glb', (route) => route.abort());
    await page.goto(`${APP}?q=low&t=luna`);
    await expect(page.locator('#btn-play')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('html')).toHaveAttribute('data-kit', '0');
    const flat = await page.evaluate(
      () => window.__bucio.world.group.children.filter((m) => m.isInstancedMesh && m.material.flatShading).length
    );
    expect(flat).toBeGreaterThanOrEqual(14);
    await page.locator('#btn-play').click();
    await page.evaluate(() => {
      window.__bucio.autopilot = { x: 0.6, y: -0.4, mag: 1 };
      window.__bucio.ff(6);
    });
    expect(Number((await page.locator('#hud-score').textContent()).replace(/\D/g, ''))).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('installs as a PWA: manifest, icons and service worker', async ({ page }) => {
    await page.goto(APP);
    const manifest = await page.evaluate(async () => {
      const href = document.querySelector('link[rel="manifest"]').href;
      return (await fetch(href)).json();
    });
    expect(manifest.short_name).toBe('BUCIO');
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
    await expect.poll(() => page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => !!r)), {
      timeout: 20_000,
    }).toBe(true);
  });
});
