import { test, expect } from '@playwright/test';

const APP = '/projects/shhh-reader/';

async function openFresh(page) {
  await page.goto(APP);
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload();
  await expect(page.locator('#perm-screen')).toBeVisible();
}

test('senza microfono l’app si sblocca e i tab funzionano', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await openFresh(page);
  await expect(page.locator('#overlay-shhh')).toBeHidden();
  await expect(page.locator('#settings-panel')).toBeHidden();
  await expect(page.locator('#audiobar')).toBeHidden();
  await expect(page.locator('#browser-blocked')).toBeHidden();

  await page.locator('#perm-skip').click();
  await expect(page.locator('#perm-screen')).toBeHidden();
  await expect(page.locator('#audiobar')).toBeVisible();
  await expect(page.locator('#home-view')).toBeVisible();
  await expect(page.locator('#mic-dot')).toHaveClass(/off/);

  await page.locator('.tab[data-tab="browser"]').click();
  await expect(page.locator('#tab-browser')).toBeVisible();
  await expect(page.locator('#browser-blocked')).toBeHidden();

  await page.locator('.tab[data-tab="stats"]').click();
  await expect(page.locator('#tab-stats')).toBeVisible();

  await page.locator('#settings-btn').click();
  await expect(page.locator('#settings-panel')).toBeVisible();
  await expect(page.locator('#threshold-val')).toHaveText('-20');
  await expect(page.locator('#enable-mic-btn')).toBeVisible();
  await page.locator('#settings-close').click();
  await expect(page.locator('#settings-panel')).toBeHidden();

  expect(errors).toEqual([]);
});

test('il cambio lingua non distrugge file picker e valori impostazioni', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await openFresh(page);
  await page.locator('#perm-skip').click();

  await page.locator('#lang-btn').click();
  await expect(page.locator('#file-picker-link')).toHaveText('browse');
  await expect(page.locator('.formats')).toHaveText('PDF · ePub · TXT · MD · HTML');

  await page.locator('#settings-btn').click();
  await expect(page.locator('#threshold-val')).toHaveText('-20');
  await expect(page.locator('#floor-val')).toHaveText('-40');
  await expect(page.locator('#ceiling-val')).toHaveText('-15');
  await expect(page.locator('#grace-val')).toHaveText('1.5');
  await page.locator('#settings-close').click();

  await page.setInputFiles('#file-input', {
    name: 'silenzio.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Ciao silenzio!\nSeconda riga.')
  });

  await expect(page.locator('#reader-view')).toBeVisible();
  await expect(page.locator('#home-view')).toBeHidden();
  await expect(page.locator('#text-container')).toContainText('Ciao silenzio!');
  await page.locator('#reader-back').click();
  await expect(page.locator('#home-view')).toBeVisible();
  await expect(page.locator('#reader-view')).toBeHidden();

  expect(errors).toEqual([]);
});

test('un errore microfono non blocca la lettura', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await openFresh(page);
  await page.locator('#perm-btn').click();

  await expect(page.locator('#perm-screen')).toBeHidden();
  await expect(page.locator('#audiobar')).toBeVisible();
  await expect(page.locator('#home-view')).toBeVisible();
  await page.locator('.tab[data-tab="browser"]').click();
  await expect(page.locator('#tab-browser')).toBeVisible();
  await page.locator('#settings-btn').click();
  await expect(page.locator('#mic-state')).not.toBeEmpty();
  await expect(page.locator('#enable-mic-btn')).toBeVisible();

  expect(errors).toEqual([]);
});

test('la scelta senza microfono viene ricordata al reload', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await openFresh(page);
  await page.locator('#perm-skip').click();
  await page.reload();

  await expect(page.locator('#perm-screen')).toBeHidden();
  await expect(page.locator('#home-view')).toBeVisible();
  await expect(page.locator('#audiobar')).toBeVisible();
  await expect(page.locator('#mic-dot')).toHaveClass(/off/);

  expect(errors).toEqual([]);
});
