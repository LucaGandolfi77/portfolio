import { expect, test } from '@playwright/test';

/* Seba is a static ES-module PWA: no build, served from the repo. */
const APP = '/games/seba/';
test.use({ video: 'off', viewport: { width: 390, height: 844 } });
test.setTimeout(180_000);

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('response', (r) => r.url().includes('/games/') && r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  return errors;
}

async function open(page) {
  await page.goto(APP);
  await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
  await page.locator('#gate-yes').click();
}
const state = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.__seba.state)));
const set = (page, patch) => page.evaluate((p) => window.__seba.set(p), patch);
const room = (page, name) => page.locator(`.nav-btn[data-room="${name}"]`).click();
// a closed sheet keeps its last kind, so the result must also be visible
const result = (page) => page.locator('#sheet[data-kind="result"]');
const closeResult = (page) => page.locator('[data-act="ok"]').click();

test.describe('Seba', () => {
  test('the 18+ gate comes first and can say no', async ({ page }) => {
    await page.goto(APP);
    await expect(page.locator('#gate')).toBeVisible();
    await page.locator('#gate-no').click();
    await expect(page.locator('#gate')).toBeVisible();
    await expect(page.locator('#gate-yes')).toHaveCount(0);
  });

  test('care: feed, drink, smoke, wash, sleep, and it is all still there after a reload', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    const start = await state(page);

    await room(page, 'kitchen');
    await page.locator('[data-item="toast"]').click();
    let s = await state(page);
    expect(s.needs.food).toBeGreaterThan(start.needs.food + 25);
    expect(s.tips).toBe(start.tips - 3);

    // dragging the watermelon onto Seba works like a tap
    const from = await page.locator('[data-item="frutta"]').boundingBox();
    const to = await page.locator('#seba').boundingBox();
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect.poll(async () => (await state(page)).stats['use.frutta']).toBe(1);

    await room(page, 'balcony');
    await page.locator('[data-item="sigaretta"]').click();
    await expect(page.locator('#seba')).toHaveAttribute('data-expr', 'puff');

    await room(page, 'bath');
    for (let i = 0; i < 3; i++) await page.locator('[data-act="scrub"]').click();
    expect((await state(page)).needs.hygiene).toBe(100);

    await room(page, 'sofa');
    await page.locator('[data-act="sleep"]').click();
    await expect(page.locator('#seba')).toHaveAttribute('data-expr', 'sleeping');
    const tired = (await state(page)).needs.sleep;
    await page.evaluate(() => window.__seba.advance(2 * 3600e3));
    expect((await state(page)).needs.sleep).toBeGreaterThan(tired);

    s = await state(page);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    await expect(page.locator('#gate')).toBeHidden();
    const back = await state(page);
    expect(back.tips).toBe(s.tips);
    expect(back.asleep).toBe(true);
    expect(back.achievements).toContain('first-puff');
    expect(errors).toEqual([]);
  });

  test('coming back after hours shows what happened', async ({ page }) => {
    await open(page);
    // leave the app first, so its own save on exit cannot overwrite the edit
    await page.goto(`${APP}manifest.webmanifest`);
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('seba-v1')); s.last -= 5 * 3600e3; localStorage.setItem('seba-v1', JSON.stringify(s)); });
    await page.goto(APP);
    await expect(page.locator('#sheet')).toHaveAttribute('data-kind', 'away');
    await expect(page.locator('.away-needs li').first()).toBeVisible();
  });

  test('a whole shift at the counter, served by hand', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    const before = await state(page);
    await page.locator('[data-act="shift"]').click();
    await page.locator('.game-go').click();
    for (let order = 1; order <= 5; order++) {
      await expect(page.locator('.game-hud')).toHaveText(`${order}/5`);
      while (await page.locator('.shift-ticket li.next').count()) {
        const part = await page.locator('.shift-ticket li.next').getAttribute('data-part');
        await page.locator(`.bottle[data-ing="${part}"]`).click();
      }
      for (let i = 0; i < 3; i++) await page.locator('[data-shake]').click();
    }
    await expect(result(page)).toBeVisible();
    await expect(page.locator('.flawless')).toBeVisible();
    await closeResult(page);
    const after = await state(page);
    expect(after.tips).toBeGreaterThan(before.tips + 20);
    expect(after.xp).toBeGreaterThan(before.xp);
    expect(errors).toEqual([]);
  });

  test('the other five games run on real frames to their own end', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await set(page, { needs: { sleep: 90, thirst: 90, hygiene: 90 }, tips: 60 });
    for (const id of ['lighter', 'dj', 'dance', 'runner']) {
      await page.evaluate((g) => { window.__seba.app.game(g); }, id);
      await page.locator('.game-go').click();
      await expect(page.locator(`.game-${id} canvas`)).toBeVisible();
      if (id === 'dj') for (let i = 0; i < 6; i++) await page.locator(`.pad[data-lane="${i % 4}"]`).dispatchEvent('pointerdown');
      if (id === 'runner') { await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowRight'); }
      await expect(result(page), id).toBeVisible({ timeout: 60_000 });
      await expect(page.locator('.game')).toHaveCount(0);
      await closeResult(page);
    }
    await page.evaluate(() => { window.__seba.app.game('quiz'); });
    await page.locator('.game-go').click();
    for (let i = 0; i < 3; i++) {
      await page.locator('.quiz-opt[data-score="2"]').first().click();
      await page.locator('.quiz-next').click();
    }
    await expect(result(page)).toBeVisible();
    const s = await state(page);
    for (const id of ['lighter', 'dj', 'dance', 'runner', 'quiz']) expect(s.stats[`game.${id}`], id).toBe(1);
    expect(errors).toEqual([]);
  });

  test('leaving a game costs nothing', async ({ page }) => {
    await open(page);
    const before = await state(page);
    await page.locator('[data-act="shift"]').click();
    await page.locator('.game-quit').click();
    await expect(page.locator('.game')).toHaveCount(0);
    expect((await state(page)).stats.shifts).toBe(before.stats.shifts);
  });

  test('a trip: fly to Berlin, rave, after, postcards, fly home', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await set(page, { xp: 400, tips: 100, needs: { sleep: 90, thirst: 90, hygiene: 90 } });
    await room(page, 'world');
    await expect(page.locator('.city')).toHaveCount(14);
    await page.locator('.city[data-city="berlino"]').click();
    await page.locator('[data-act="fly"]').click();
    await expect(page.locator('[data-act="rave"]')).toBeVisible();
    expect((await state(page)).city).toBe('berlino');
    await expect(page.locator('[data-item="local"]')).toContainText('Bunker Mate');

    const finishTwo = async () => {
      for (let i = 0; i < 2; i++) {
        await expect.poll(() => page.evaluate(() => !!window.__seba.game())).toBe(true);
        await page.evaluate(() => { const g = window.__seba.game(); g.start(); g.finish(0.9, false); });
      }
      await expect(result(page)).toBeVisible();
      await closeResult(page);
    };
    await page.locator('[data-act="rave"]').click();
    await finishTwo();
    await page.locator('[data-act="after"]').click();
    await finishTwo();
    expect((await state(page)).trip.stage).toBe('done');

    await room(page, 'journal');
    await expect(page.locator('.postcard img')).toHaveCount(2);
    await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('.postcard img')].every((i) => i.naturalWidth > 0))).toBe(true);
    const download = page.waitForEvent('download');
    await page.evaluate(() => { navigator.canShare = undefined; });
    await page.locator('.postcard .btn').first().click();
    expect((await download).suggestedFilename()).toBe('seba-berlino.png');
    await page.locator('.tab[data-tab="medals"]').click();
    expect(await page.locator('.medal:not(.locked)').count()).toBeGreaterThan(1);
    await page.locator('.sheet-close').click();

    await page.locator('[data-act="home"]').click();
    await expect(page.locator('[data-act="shift"]')).toBeVisible();
    expect((await state(page)).city).toBe('milano');
    expect(errors).toEqual([]);
  });

  test('wardrobe, language and starting over', async ({ page }) => {
    await open(page);
    await set(page, { tips: 100 });
    await room(page, 'bath');
    await page.locator('[data-act="mirror"]').click();
    await page.locator('.cloth[data-id="cappellino-rosso"]').click();
    await expect(page.locator('.cloth[data-id="cappellino-rosso"]')).toHaveClass(/worn/);
    expect((await state(page)).outfit.hat).toBe('cappellino-rosso');
    await page.locator('.sheet-close').click();

    await page.locator('#btn-settings').click();
    await page.locator('[data-lang="en"]').click();
    await expect(page.locator('.nav-btn[data-room="kitchen"]')).toContainText('Kitchen');
    await page.locator('[data-setting="numbers"]').check();
    await expect(page.locator('.need[data-need="food"] .num')).toBeVisible();
    await page.locator('[data-act="reset"]').click();
    expect((await state(page)).outfit.hat).toBe('cappellino-rosso');
    await page.locator('[data-act="reset"]').click();
    expect((await state(page)).outfit.hat).toBeNull();
    expect((await state(page)).tips).toBe(30);
  });

  test('fits a small phone without sideways scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await open(page);
    const m = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, nav: document.querySelector('#nav').getBoundingClientRect().bottom, seba: document.querySelector('#seba').getBoundingClientRect().height }));
    expect(m.w).toBeLessThanOrEqual(320);
    expect(m.nav).toBeLessThanOrEqual(569);
    expect(m.seba).toBeGreaterThan(110);
  });

  test('installs as a PWA and opens offline', async ({ page, context }) => {
    await open(page);
    const manifest = await page.evaluate(async () => (await fetch(document.querySelector('link[rel="manifest"]').href)).json());
    expect(manifest.short_name).toBe('Seba');
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 20_000 }).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    await expect(page.locator('#seba svg')).toBeVisible();
    await context.setOffline(false);
  });
});
