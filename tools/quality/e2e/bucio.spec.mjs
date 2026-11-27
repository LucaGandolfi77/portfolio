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
    /* The 35 props of Portomarina come from the kit, not from the fallback. */
    await expect(page.locator('html')).toHaveAttribute('data-kit', '35', { timeout: 30_000 });
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
