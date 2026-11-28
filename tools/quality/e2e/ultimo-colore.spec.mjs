import { expect, test } from '@playwright/test';

/* Ultimo Colore is a static ES-module PWA: no build, served from the repo. */
const APP = '/games/ultimo-colore/';
test.use({ video: 'off', viewport: { width: 390, height: 844 } });
test.setTimeout(120_000);

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('response', (r) => r.url().includes('/games/') && r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  return errors;
}
async function open(page) {
  await page.addInitScript(() => localStorage.setItem('lang', 'it'));
  await page.goto(APP);
  await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
}
const c = (page, fn, arg) => page.evaluate(fn, arg);
const screen = (page) => c(page, () => window.__colore.screen);
const phase = (page) => c(page, () => window.__colore.battle.phase);
const advance = (page, ms) => c(page, (t) => window.__colore.advance(t), ms);
/** Runs the battle clock until it reaches one of the phases. */
const until = (page, phases) => c(page, (list) => {
  const z = window.__colore;
  for (let i = 0; i < 600 && !list.includes(z.battle.phase) && z.screen === 'battle'; i++) z.advance(100);
  return z.battle.phase;
}, phases);

/** A new journey, already on the road, in a given fight. */
async function fight(page, node = 'ponte', difficulty = 'normal') {
  await c(page, ([n, d]) => {
    const z = window.__colore;
    z.newGame(d);
    z.jump(n);
    z.save.flags.tutorial = true;
    z.enter(n);
    z.readAll();
  }, [node, difficulty]);
  expect(await screen(page)).toBe('battle');
}

test.describe('Ultimo Colore', () => {
  test('new journey: difficulty, first scene, a choice, then the map', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await page.locator('[data-act="new"]').click();
    await expect(page.locator('[data-act="start"]')).toHaveCount(4);
    await page.locator('[data-act="start"][data-d="normal"]').click();
    await expect(page.locator('.talk .words')).toContainText('Velaria');
    for (let i = 0; i < 40 && (await page.locator('[data-act="choose"]').count()) === 0; i++) await page.locator('[data-act="advance"]').click();
    await page.locator('[data-act="choose"]').nth(1).click();
    for (let i = 0; i < 20 && (await screen(page)) === 'scene'; i++) await page.locator('[data-act="advance"]').click();
    expect(await screen(page)).toBe('map');
    await expect(page.locator('.node.open')).toHaveCount(1);
    expect(await c(page, () => window.__colore.save.flags.rispetto)).toBe(true);
    expect(errors).toEqual([]);
  });

  test('first fight: tutorial, a timed attack, a perfect parry and a counter', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await c(page, () => { const z = window.__colore; z.freeze(); z.newGame('normal'); z.jump('ponte'); z.enter('ponte'); z.readAll(); });
    await expect(page.locator('.b-over')).toBeVisible();
    for (let i = 0; i < 3; i++) await page.locator('[data-u="tutorial"]').click();
    await expect(page.locator('.b-over')).toBeHidden();
    await until(page, ['menu', 'defend']);
    if ((await phase(page)) === 'defend') await until(page, ['menu']);
    await page.locator('[data-u="attack"]').click();
    await page.locator('.foe-box').first().click();
    expect(await phase(page)).toBe('attack');
    // tap exactly on the beat
    await advance(page, 896);
    const box = await page.locator('.tapzone').boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 3);
    await expect(page.locator('.float.perfect')).toContainText('Perfetto');
    // the next enemy move: parry every hit at the right moment
    const result = await c(page, () => {
      const z = window.__colore, u = z.battle;
      for (let i = 0; i < 400 && u.phase !== 'defend'; i++) {
        if (u.phase === 'menu') { document.querySelector('[data-u="attack"]').click(); document.querySelector('.foe-box:not(.fallen)').click(); }
        z.advance(100);
      }
      const hits = u.move.hits;
      const before = u.battle.heroes.map((h) => h.hp);
      const parries = u.battle.stats.parries;
      for (const h of hits) { z.advance(h.at - u.time); u.press(h.kind === 'low' ? 'jump' : 'parry'); }
      // just past the end of this move, before anyone else acts
      while (u.phase === 'defend') z.advance(16);
      return { before, after: u.battle.heroes.map((h) => h.hp), parries: u.battle.stats.parries - parries, hits: hits.length, foe: u.battle.enemies.map((x) => x.hp < x.maxHp) };
    });
    expect(result.parries).toBe(result.hits);
    expect(result.after).toEqual(result.before);
    expect(result.foe).toContain(true);
    expect(errors).toEqual([]);
  });

  test('skills, sparks and items work from the menu', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await fight(page, 'canale');
    await until(page, ['menu']);
    await page.locator('[data-u="skills"]').click();
    await expect(page.locator('[data-u="skill"]')).toHaveCount(2);
    await page.locator('[data-u="cancel"]').click();
    await page.locator('[data-u="spark"]').click();
    await page.locator('.foe-box').first().click();
    expect(await phase(page)).toBe('aim');
    await advance(page, 200);
    const dot = await page.locator('.weakdot').boundingBox();
    await page.mouse.click(dot.x + dot.width / 2, dot.y + dot.height / 2);
    await until(page, ['menu', 'defend']);
    const hp = await c(page, () => window.__colore.battle.battle.enemies[0]);
    expect(hp.hp).toBeLessThan(hp.maxHp);
    await until(page, ['menu']);
    await page.locator('[data-u="items"]').click();
    await page.locator('[data-u="item"][data-id="olio"]').click();
    await page.locator('.hero-card').first().click();
    expect(await c(page, () => window.__colore.battle.battle.items.olio)).toBe(2);
    expect(errors).toEqual([]);
  });

  test('story mode plays a whole fight with taps on the menu only', async ({ page }) => {
    await open(page);
    await fight(page, 'ponte', 'story');
    await expect(page.locator('.def')).toHaveCount(0);
    await c(page, () => {
      const z = window.__colore, u = z.battle;
      for (let i = 0; i < 1500 && z.screen === 'battle'; i++) {
        if (u.phase === 'menu') { document.querySelector('[data-u="attack"]').click(); document.querySelector('.foe-box:not(.fallen)')?.click(); }
        z.advance(100);
      }
    });
    expect(await screen(page)).toBe('gains');
  });

  test('losing offers a retry, easier if wanted', async ({ page }) => {
    await open(page);
    await fight(page, 'ponte', 'hard');
    await c(page, () => { window.__colore.battle.forceLose(); window.__colore.advance(2000); });
    await expect(page.locator('[data-act="retry-easier"]')).toBeVisible();
    await page.locator('[data-act="retry-easier"]').click();
    expect(await screen(page)).toBe('battle');
    expect(await c(page, () => window.__colore.save.difficulty)).toBe('normal');
  });

  test('pause stops the clock; flee returns to the map', async ({ page }) => {
    await open(page);
    await fight(page);
    await until(page, ['menu', 'defend']);
    await page.locator('.b-menu').click();
    await expect(page.locator('#overlay')).toBeVisible();
    const t1 = await c(page, () => window.__colore.battle.time);
    await advance(page, 3000);
    expect(await c(page, () => window.__colore.battle.time)).toBe(t1);
    await page.locator('[data-act="pause-settings"]').click();
    await page.locator('#overlay [data-key="diff"][data-v="easy"]').click();
    await page.locator('#overlay .sc-head [data-act="resume"]').click();
    await page.locator('[data-act="flee"]').click();
    expect(await screen(page)).toBe('map');
    expect(await c(page, () => window.__colore.save.difficulty)).toBe('easy');
  });

  test('the whole first act, from the bakery to the sunset', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await c(page, () => { window.__colore.newGame('normal'); });
    const route = ['casa', 'ponte', 'darsena', 'stiva', 'canale', 'reti', 'campanaro', 'campanile', 'campo1', 'secche', 'statua', 'airone', 'campo2', 'cervo', 'tramonto'];
    for (const id of route) {
      await expect(page.locator(`.node[data-id="${id}"]`)).toBeEnabled();
      await page.locator(`.node[data-id="${id}"]`).click({ force: true });
      await page.locator(`[data-act="enter"][data-id="${id}"]`).click();
      await c(page, () => window.__colore.readAll());
      if ((await screen(page)) === 'battle') {
        await c(page, () => {
          const z = window.__colore;
          document.querySelectorAll('.b-over:not([hidden]) button').forEach(() => {});
          for (let i = 0; i < 4; i++) document.querySelector('.b-over:not([hidden]) [data-u="tutorial"]')?.click();
          z.battle.forceWin(); z.advance(2000);
        });
      }
      if (id.startsWith('campo')) {
        if ((await screen(page)) === 'gains') await page.locator('[data-act="gains-next"]').click();
        expect(await screen(page)).toBe('camp');
        await page.locator('[data-act="talk"]').first().click();
        await c(page, () => window.__colore.readAll());
        await page.locator('[data-act="rest"]').click();
        await page.locator('[data-act="leave"]').click();
      } else if ((await screen(page)) === 'gains') await page.locator('[data-act="gains-next"]').click();
    }
    expect(await screen(page)).toBe('end');
    const s = await c(page, () => window.__colore.save);
    expect(s.actDone).toBe(true);
    expect(s.party).toEqual(['ilario', 'tecla', 'nora', 'bastiano']);
    expect(s.owned.length).toBe(20);
    expect(s.diary.length).toBe(4);
    expect(Object.keys(s.bonds).length).toBeGreaterThan(0);
    // the paintings have lost their green
    await expect.poll(() => page.locator('#art').evaluate((el) => el.style.backgroundImage)).toContain('blob:');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    await page.locator('[data-act="continue"]').click();
    expect(await screen(page)).toBe('end');
    expect(errors).toEqual([]);
  });

  test('party screen: wear and remove memories; journal and settings', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await c(page, () => { window.__colore.newGame(); window.__colore.jump('campo1'); });
    await page.locator('.mapnav [data-act="party"]').click();
    await expect(page.locator('.chips [data-act="hero"]')).toHaveCount(4);
    const worn = page.locator('.mems li.on');
    await expect(worn).toHaveCount(3);
    await worn.first().locator('.mem').click();
    await expect(page.locator('.mems li.on')).toHaveCount(2);
    await page.locator('.sc-head [data-act="map"]').click();
    await page.locator('.mapnav [data-act="diary"]').click();
    await expect(page.locator('.page')).toHaveCount(1);
    await page.locator('.sc-head [data-act="map"]').click();
    await page.locator('.mapnav [data-act="settings"]').click();
    await page.locator('[data-key="lang"][data-v="en"]').click();
    await expect(page.locator('.sc-head h2')).toHaveText('Settings');
    expect(errors).toEqual([]);
  });

  test('fits a small phone without sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await open(page);
    expect(await page.locator('#screen').evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
    await fight(page, 'campanile');
    await until(page, ['menu']);
    for (const sel of ['[data-u="attack"]', '[data-u="items"]', '.hero-card >> nth=0']) await expect(page.locator(sel)).toBeInViewport({ ratio: 1 });
    await until(page, ['menu']);
    await page.locator('[data-u="attack"]').click();
    await page.locator('.foe-box').first().click();
    await c(page, () => {
      const z = window.__colore, u = z.battle;
      for (let i = 0; i < 600 && u.phase !== 'defend'; i++) { if (u.phase === 'menu') { document.querySelector('[data-u="attack"]').click(); document.querySelector('.foe-box:not(.fallen)').click(); } z.advance(100); }
    });
    for (const sel of ['.def.parry', '.def.jump']) await expect(page.locator(sel)).toBeInViewport({ ratio: 1 });
    expect(await page.locator('#battle').evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
  });

  test('works offline after the first visit', async ({ page, context }) => {
    await open(page);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    await expect(page.locator('[data-act="new"]')).toBeVisible();
    await context.setOffline(false);
  });
});
