import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

/* The second film is a Vite app: the test runs on its build
   (projects/la-corona-e-la-testa/dist, built by CI before this job). */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DIST = join(ROOT, 'projects', 'la-corona-e-la-testa', 'dist', 'index.html');
const APP = '/projects/la-corona-e-la-testa/dist/';

test.skip(!existsSync(DIST), 'build the film first: cd projects/la-corona-e-la-testa && npm run build');
test.use({ video: 'off' });
test.setTimeout(120_000);

function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => r.url().includes('/la-corona-e-la-testa/') && r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  return errors;
}

/** Shows the player controls if they have faded away (they are then inert). */
async function controls(page) {
  const ui = page.locator('#ui');
  if (await ui.evaluate((el) => el.classList.contains('is-hidden'))) await page.locator('#film').click({ position: { x: 20, y: 200 } });
  await expect(ui).not.toHaveClass(/is-hidden/);
}

test.describe('La Corona e la Testa', () => {
  test('starts, speaks both languages and lists its chapters', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(`${APP}?lang=it`);
    await expect(page.locator('#btn-begin-silent')).toHaveText('Guarda in silenzio');
    await page.locator('#btn-begin-silent').click();
    await expect(page.locator('#caption-live')).toContainText('A Fidenza', { timeout: 15_000 });
    /* Pausing keeps the controls on screen while we use them. */
    await page.keyboard.press('Space');
    await controls(page);
    await page.locator('#btn-lang').click();
    await expect(page.locator('#chapter-name')).toHaveText('The Stone That Speaks');
    await page.locator('#btn-chapter').click();
    await expect(page.locator('.chapter-item')).toHaveCount(10);
    await page.locator('.chapter-item').nth(6).click();
    await expect(page.locator('#chapter-name')).toHaveText('The River');
    expect(errors).toEqual([]);
  });

  test('draws every part of the film without errors, up to the end screen', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(`${APP}?lang=en&t=5`);
    await page.locator('#btn-resume').click();
    /* Scrub through the whole film: every shot is drawn at least once. */
    const length = await page.evaluate(async () => {
      const seek = document.querySelector('#seek');
      const max = Number(seek.max);
      for (let t = 1; t < max - 8; t += 6) {
        seek.value = String(t);
        seek.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      seek.value = String(max - 2);
      seek.dispatchEvent(new Event('change', { bubbles: true }));
      return max;
    });
    expect(length).toBeGreaterThan(800);
    await expect(page.locator('#end-screen')).toBeVisible({ timeout: 15_000 });
    expect(errors).toEqual([]);
  });
});
