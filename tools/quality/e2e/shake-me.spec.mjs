import { expect, test } from '@playwright/test';

/* Shake Me is a static ES-module PWA: no build, served from the repo. */
const APP = '/games/shake-me/';
test.use({ video: 'off', viewport: { width: 390, height: 844 } });
test.setTimeout(120_000);

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !m.text().includes('navigator.vibrate') && errors.push(m.text()));
  page.on('response', (r) => r.url().includes('/games/') && r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  return errors;
}

async function open(page, adult = true) {
  await page.addInitScript((a) => {
    localStorage.setItem('lang', 'it');
    if (a) localStorage.setItem('shake-me-settings', JSON.stringify({ adult: true, music: false }));
  }, adult);
  await page.goto(APP);
  await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
}

// the guide repeats the tab buttons as links, so tabs are taken from the tab bar
const b = (page, k, id) => page.locator(`${k === 'tab' ? '.tabs ' : ''}${id ? `[data-b="${k}"][data-id="${id}"]` : `[data-b="${k}"]`}`);
/** Holds a button for `ms` of game time (the clock is advanced by the test hook). */
async function hold(page, sel, ms) {
  const box = await page.locator(sel).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.evaluate((t) => window.__shake.advance(t), ms);
  await page.mouse.up();
}
async function pourMl(page, id, ms) {
  await b(page, 'tab', 'ings').click();
  await page.locator('[data-b-search]').fill(id);
  await b(page, 'ing', id).click();
  await hold(page, '[data-hold="pour"]', ms);
  await b(page, 'addml').click();
}

test.describe('Shake Me', () => {
  test('asks the age first and “no” keeps the bar closed', async ({ page }) => {
    await open(page, false);
    await expect(page.locator('[data-act="adult-yes"]')).toBeVisible();
    await page.locator('[data-act="adult-no"]').click();
    await expect(page.locator('[data-act="adult-yes"]')).toHaveCount(0);
    await expect(page.locator('.mode')).toHaveCount(0);
  });

  test('a Negroni by hand in the school gets three stars', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await page.locator('[data-id="school"]').click();
    await page.locator('[data-search]').fill('negroni');
    await page.locator('[data-act="pick"][data-id="negroni"]').click();
    await b(page, 'glass', 'rocks').click();
    await b(page, 'gice', 'cubes').click();
    await b(page, 'tab', 'tool').click();
    await b(page, 'tool', 'glass').click();
    // easy: 0.5 s at 10 ml/s, then 18 ml/s; 1.8 s ≈ 28 ml settles on 30
    for (const id of ['gin', 'red-bitter', 'sweet-vermouth']) await pourMl(page, id, 1800);
    await b(page, 'tab', 'garnish').click();
    await b(page, 'garnish', 'orange-slice').click();
    await b(page, 'serve').click();
    await expect(page.locator('#sheet .result')).toBeVisible();
    expect(Number(await page.locator('.score b').textContent())).toBeGreaterThanOrEqual(90);
    await expect(page.locator('#sheet .stars i.on')).toHaveCount(3);
    expect(await page.evaluate(() => window.__shake.state.made.negroni)).toBe(1);
    expect(errors).toEqual([]);
  });

  test('a shaken Daiquiri: ice, shake in the green, strain', async ({ page }) => {
    await open(page);
    await page.evaluate(() => window.__shake.start('school', { recipe: 'daiquiri' }));
    await b(page, 'glass', 'cocktail').click();
    await b(page, 'tab', 'tool').click();
    await b(page, 'tool', 'shaker').click();
    await pourMl(page, 'white-rum', 3550);
    await pourMl(page, 'lime', 1333);
    await b(page, 'tab', 'ings').click();
    await page.locator('[data-b-search]').fill('zucchero');
    await b(page, 'ing', 'sugar').click();
    for (let i = 0; i < 8; i++) await b(page, 'plus').click();
    await b(page, 'add').click();
    await b(page, 'tab', 'tech').click();
    await b(page, 'toolice').click();
    await hold(page, '[data-hold="shake"]', 4000);
    await b(page, 'strain').click();
    await b(page, 'serve').click();
    await expect(page.locator('.score b')).toHaveText(/^(9\d|100)$/);
  });

  test('mistakes are named: the wrong glass and a missing ingredient', async ({ page }) => {
    await open(page);
    await page.evaluate(() => window.__shake.start('school', { recipe: 'negroni' }));
    await b(page, 'glass', 'flute').click();
    await b(page, 'tab', 'tool').click();
    await b(page, 'tool', 'glass').click();
    await pourMl(page, 'gin', 1333);
    await b(page, 'serve').click();
    await expect(page.locator('.defects')).toContainText('Manca');
    await expect(page.locator('.defects')).toContainText('Bicchiere');
    expect(Number(await page.locator('.score b').textContent())).toBeLessThan(55);
  });

  test('a whole evening: five orders, a summary, the next evening opens', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await page.locator('[data-id="night"]').click();
    await expect(page.locator('[data-act="night"][data-n="1"]')).toBeDisabled();
    await page.locator('[data-act="night"][data-n="0"]').click();
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.__shake.perfect());
      await b(page, 'serve').click();
      await page.locator('[data-act="order-next"]').click();
    }
    await expect(page.locator('#sheet[data-kind="night"]')).toBeVisible();
    await expect(page.locator('#sheet .news')).toBeVisible();
    await page.locator('[data-act="night-next"]').click();
    expect(await page.evaluate(() => window.__shake.session.night)).toBe(1);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    expect(await page.evaluate(() => window.__shake.state.nights[0])).toBe(3);
    expect(errors).toEqual([]);
  });

  test('first evening: the guide leads, highlights the next choice and the jigger settles on the dose', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await page.evaluate(() => window.__shake.start('school', { recipe: 'negroni' }));
    await expect(page.locator('.guide')).toContainText('old fashioned');
    await expect(page.locator('[data-b="glass"][data-id="rocks"]')).toHaveClass(/hint/);
    await b(page, 'glass', 'rocks').click();
    await expect(page.locator('.guide')).toContainText('cubetti');
    await b(page, 'gice', 'cubes').click();
    await page.locator('.guide [data-b="tab"]').click();
    await expect(page.locator('[data-b="tool"][data-id="glass"]')).toHaveClass(/hint/);
    await b(page, 'tool', 'glass').click();
    await page.locator('.guide [data-b="tab"]').click();
    // the shelf opens on the ingredients of this drink, the next one glowing
    await expect(page.locator('.bottle')).toHaveCount(3);
    await expect(page.locator('[data-b="ing"][data-id="gin"]')).toHaveClass(/hint/);
    for (const id of ['gin', 'red-bitter', 'sweet-vermouth']) {
      await b(page, 'ing', id).click();
      // 1.6 s is about 25 ml: close enough, the jigger settles on 30
      await hold(page, '[data-hold="pour"]', 1600);
      await expect(page.locator('.readout')).toHaveText('30 ml');
      await b(page, 'addml').click();
    }
    await expect(page.locator('.guide')).toContainText('arancia');
    await page.locator('.guide [data-b="tab"]').click();
    await b(page, 'garnish', 'orange-slice').click();
    await expect(page.locator('.guide')).toContainText('servi');
    await expect(page.locator('[data-b="serve"]')).toHaveClass(/hint/);
    await b(page, 'serve').click();
    await expect(page.locator('.score b')).toHaveText('100');
    expect(errors).toEqual([]);
  });

  test('later evenings hide the marks on the jigger', async ({ page }) => {
    await open(page);
    await page.evaluate(() => window.__shake.start('night', { night: 9 }));
    await b(page, 'tab', 'tool').click();
    await b(page, 'tool', 'shaker').click();
    await b(page, 'tab', 'ings').click();
    await b(page, 'ing', 'gin').click();
    await expect(page.locator('.jigger line')).toHaveCount(0);
    await expect(page.locator('.guide')).toBeHidden();
    await expect(page.locator('.jigger text')).toHaveCount(0);
    await page.evaluate(() => window.__shake.start('school', { recipe: 'negroni' }));
    await b(page, 'tab', 'tool').click();
    await b(page, 'tool', 'glass').click();
    await b(page, 'tab', 'ings').click();
    await b(page, 'ing', 'gin').click();
    await expect(page.locator('.jigger .want')).toHaveCount(1);
  });

  test('recipe book, by heart, daily challenge and settings', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await page.locator('[data-id="book"]').click();
    await expect(page.locator('.recipe-row')).toHaveCount(112);
    await page.locator('[data-act="filter"][data-f="zero"]').click();
    await expect(page.locator('.recipe-row')).toHaveCount(10);
    await page.locator('[data-act="filter"][data-f="all"]').click();
    await page.locator('[data-act="detail"][data-id="sazerac"]').click();
    await expect(page.locator('.steps li').first()).toBeVisible();
    await page.locator('.sc-head [data-act="book"]').click();
    await page.locator('.sc-head [data-act="home"]').click();
    await page.locator('[data-id="memory"]').click();
    await expect(page.locator('[data-b="recipe"]')).toHaveCount(0);
    await page.locator('[data-b="quit"]').click();
    await page.locator('[data-id="daily"]').click();
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.__shake.perfect());
      await b(page, 'serve').click();
      await page.locator('[data-act="order-next"]').click();
    }
    await expect(page.locator('#sheet .score b')).toHaveText('300');
    await page.locator('#sheet [data-act="home"]').click();
    await page.locator('.tools [data-act="settings"]').click();
    await page.locator('[data-key="lang"][data-v="en"]').click();
    await expect(page.locator('.sc-head h2')).toHaveText('Settings');
    expect(errors).toEqual([]);
  });

  test('fits a small phone without sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await open(page);
    expect(await page.locator('#screen').evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
    await page.evaluate(() => window.__shake.start('school', { recipe: 'mojito' }));
    for (const tab of ['glass', 'tool', 'ings', 'tech', 'garnish']) {
      await b(page, 'tab', tab).click();
      expect(await page.locator('#bar').evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
    }
    await expect(page.locator('[data-b="serve"]')).toBeInViewport();
  });

  test('works offline after the first visit', async ({ page, context }) => {
    await open(page);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    await expect(page.locator('.mode')).toHaveCount(5);
    await context.setOffline(false);
  });
});
