import { expect, test } from '@playwright/test';

/* Bar Blu is a static ES-module PWA: no build, served from the repo. */
const APP = '/games/bar-blu/';
test.use({ video: 'off', viewport: { width: 390, height: 844 } });
test.setTimeout(240_000);

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => r.url().includes('/games/bar-blu/') && r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  return errors;
}

/** Clicks through the story: first choice each time, leaves the saletta, names the player. */
async function drive(page, until, seconds = 60) {
  return page.evaluate(async ({ until, seconds }) => {
    const sleep = (ms) => (ms > 5 ? new Promise((r) => setTimeout(r, ms)) : new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = r; c.port2.postMessage(0); }));
    const $ = (s) => document.querySelector(s);
    const deadline = Date.now() + seconds * 1000;
    while (Date.now() < deadline) {
      if (window.__barblu.ended || window.__barblu.knot === until) break;
      await sleep(1);
      if (!$('#title-card').classList.contains('hidden')) { $('#title-card').click(); continue; }
      if (!$('#saletta').classList.contains('hidden')) { $('.sal-leave').click(); continue; }
      if (!$('#name-input').classList.contains('hidden')) { $('#name-input input').value = 'Prova'; $('#name-input form').requestSubmit(); continue; }
      if (!$('#credits').classList.contains('hidden')) { $('.cr-close').click(); continue; }
      const c = document.querySelector('.choice');
      if (c) { c.click(); continue; }
      if ($('#box .more').hidden) { await sleep(25); continue; }   // the story is waiting on a timer
      $('#box').click();
    }
    return { knot: window.__barblu.knot, ended: window.__barblu.ended };
  }, { until, seconds });
}

test.describe('Bar Blu', () => {
  test('the first night plays: Luca, Assunta, Ugo, a quick round at the counter', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(APP);
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    await page.evaluate(() => window.__barblu.setSpeed('subito'));
    await page.locator('#btn-new').click();
    await expect(page.locator('#title-card')).toBeVisible();
    const r = await drive(page, 'n2_inizio');
    expect(r.knot).toBe('n2_inizio');
    const v = await page.evaluate(() => ({ vars: window.__barblu.vars, trust: window.__barblu.trust, met: window.__barblu.save().met }));
    expect(v.trust.luca).toBeGreaterThan(0);
    expect(v.met).toEqual(expect.arrayContaining(['luca', 'assunta', 'ugo', 'baldini', 'gigi']));
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('.bg.on')).backgroundImage)).toContain('.webp');
    expect(errors).toEqual([]);
  });

  test('saves at every scene and continues after a reload', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(APP);
    await page.evaluate(() => window.__barblu.setSpeed('subito'));
    await page.locator('#btn-new').click();
    await drive(page, 'n1_sera');
    await page.reload();
    await expect(page.locator('#btn-continue')).toBeVisible();
    await page.evaluate(() => window.__barblu.setSpeed('subito'));
    await page.locator('#btn-continue').click();
    await expect.poll(() => page.evaluate(() => window.__barblu.knot)).toBe('n1_sera');
    expect(errors).toEqual([]);
  });

  test('the whole story reaches an ending, with postcards and memories in the journal', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(APP);
    await page.evaluate(() => window.__barblu.setSpeed('subito'));
    await page.locator('#btn-new').click();
    const r = await drive(page, null, 200);
    expect(r.ended, JSON.stringify(r)).toBeTruthy();
    await expect(page.locator('#end')).toBeVisible();
    await page.locator('.end-journal').click();
    await page.locator('.jr-tab[data-tab="cartoline"]').click();
    await expect(page.locator('.jr-card').first()).toBeVisible();
    await expect(page.locator('.jr-thumb').first()).toBeVisible({ timeout: 10_000 });
    await page.locator('.jr-tab[data-tab="persone"]').click();
    expect(await page.locator('.jr-person').count()).toBeGreaterThan(5);
    expect(errors).toEqual([]);
  });

  test('installs as a PWA: manifest, icons and service worker', async ({ page }) => {
    await page.goto(APP);
    const manifest = await page.evaluate(async () => (await fetch(document.querySelector('link[rel="manifest"]').href)).json());
    expect(manifest.short_name).toBe('Bar Blu');
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
    await expect.poll(() => page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => !!r)), { timeout: 15_000 }).toBe(true);
  });
});
