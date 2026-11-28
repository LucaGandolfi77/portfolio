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

/** Walks the party along a path found on the same ground the game uses. */
const walkTo = (page, target, reach = 40) => page.evaluate(async ([goal, near]) => {
  const { findPath } = await import('./js/world/terrain.js');
  const { ctxOf } = await import('./js/world/field.js');
  const z = window.__colore;
  const path = findPath(z.save.pos, goal, ctxOf(z.save), near, 16);
  if (!path) return 'no path';
  for (const p of path) {
    for (let i = 0; i < 40 && z.screen === 'world'; i++) {
      const dx = p.x - z.save.pos.x, dy = p.y - z.save.pos.y, d = Math.hypot(dx, dy);
      if (d < 10) break;
      z.walk(dx / d, dy / d, Math.min(64, (d / 190) * 1000));
    }
    if (z.screen !== 'world') break;
  }
  return z.screen;
}, [target, reach]);

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
    expect(await screen(page)).toBe('world');
    await expect(page.locator('.w-goal strong')).toContainText('ponte');
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

  test('pause stops the clock; flee returns to the lagoon', async ({ page }) => {
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
    expect(await screen(page)).toBe('world');
    // stepped back, with a moment of peace
    expect(await c(page, () => window.__colore.world.field.grace)).toBeGreaterThan(1);
    expect(await c(page, () => window.__colore.save.difficulty)).toBe('easy');
  });

  test('walking: joystick and keys move the party; walls stop it', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await c(page, () => { const z = window.__colore; z.newGame(); z.jump('darsena'); });
    expect(await screen(page)).toBe('world');
    const pos = () => c(page, () => ({ ...window.__colore.save.pos }));
    const a = await pos();
    await page.keyboard.down('ArrowLeft');
    await expect.poll(async () => (await pos()).x).toBeLessThan(a.x - 40);
    await page.keyboard.up('ArrowLeft');
    const b1 = await pos();
    const box = await page.locator('.w-canvas').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.6);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height * 0.6, { steps: 4 });
    await expect(page.locator('.w-stick')).toBeVisible();
    await expect.poll(async () => (await pos()).x).toBeGreaterThan(b1.x + 40);
    await page.mouse.up();
    await expect(page.locator('.w-stick')).toBeHidden();
    // without a boat the sea stops the walk
    await c(page, () => { window.__colore.place(1300, 2490); window.__colore.walk(0, 1, 6000); });
    expect((await pos()).y).toBeLessThan(2565);
    expect(errors).toEqual([]);
  });

  test('the lagoon is drawn in 3D over the sharp map, without catching taps', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await c(page, () => { const z = window.__colore; z.freeze(); z.newGame(); z.jump('campo1'); });
    const stats = () => c(page, () => window.__colore.world.view.stats);
    await c(page, () => window.__colore.world.render(0));
    expect((await stats()).mode).toBe('3d');
    expect((await stats()).figures).toBeGreaterThan(5);
    await expect(page.locator('canvas.w-gl')).toHaveCSS('pointer-events', 'none');
    await expect(page.locator('canvas.w-top')).toHaveCSS('pointer-events', 'none');
    // something is really painted around the leader
    await expect.poll(() => c(page, () => {
      const z = window.__colore, gl = z.world.view.renderer.gl;
      z.world.render(0);
      const px = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
      gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, px);
      let solid = 0;
      for (let i = 3; i < px.length; i += 4) if (px[i] === 255) solid++;
      return solid;
    })).toBeGreaterThan(1500);
    for (let i = 0; i < 6; i++) expect((await page.request.get(`${APP}art/world-${i}.webp`)).ok()).toBe(true);
    expect(errors).toEqual([]);
  });

  test('a lost graphics context falls back to flat drawings and comes back', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await c(page, () => { const z = window.__colore; z.freeze(); z.newGame(); z.jump('darsena'); window.lose = z.world.view.renderer.gl.getExtension('WEBGL_lose_context'); window.lose.loseContext(); });
    const mode = () => c(page, () => { window.__colore.world.render(0); return window.__colore.world.view.stats.mode; });
    await expect.poll(mode).toBe('flat');
    await c(page, () => window.lose.restoreContext());
    await expect.poll(mode).toBe('3d');
    expect(errors).toEqual([]);
  });

  test('without WebGL the lagoon is still walkable', async ({ page }) => {
    const errors = collectErrors(page);
    await page.addInitScript(() => {
      const real = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (kind, ...rest) { return /webgl/.test(kind) ? null : real.call(this, kind, ...rest); };
    });
    await open(page);
    await c(page, () => { const z = window.__colore; z.freeze(); z.newGame(); z.jump('darsena'); });
    await expect(page.locator('canvas.w-gl')).toHaveCount(0);
    const before = await c(page, () => window.__colore.save.pos.x);
    await c(page, () => window.__colore.walk(-1, 0, 500));
    expect(await c(page, () => window.__colore.save.pos.x)).toBeLessThan(before - 40);
    expect(await c(page, () => window.__colore.world.view.stats.mode)).toBe('flat');
    expect(errors).toEqual([]);
  });

  test('walking into the guardians on the bridge starts the story fight', async ({ page }) => {
    await open(page);
    await c(page, () => { const z = window.__colore; z.freeze(); z.newGame(); z.jump('ponte'); z.save.flags.tutorial = true; });
    await walkTo(page, { x: 1003, y: 2625 }, 20);
    await c(page, () => window.__colore.walk(0, 0, 3000));
    expect(await screen(page)).toBe('scene');
    await c(page, () => window.__colore.readAll());
    expect(await screen(page)).toBe('battle');
    expect(await c(page, () => window.__colore.save.party)).toContain('tecla');
  });

  test('a wandering enemy can be struck first, beaten, and returns after resting', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await c(page, () => { const z = window.__colore; z.freeze(); z.newGame(); z.jump('campo1'); });
    await c(page, () => {
      const z = window.__colore;
      const g = z.world.field.groups.find((x) => x.id === 'w-sud');
      z.place(g.x, g.y + 100);
      const h = z.world.field.groups.find((x) => x.id === 'w-sud');
      h.dir = { x: 0, y: -1 };
      z.world.field.grace = 0;
      z.walk(0, 0.0001, 16);
    });
    await expect(page.locator('.w-act')).toContainText('Colpisci');
    await page.locator('.w-act').click();
    expect(await screen(page)).toBe('battle');
    await expect(page.locator('.banner')).toContainText('sorpresa');
    const before = await c(page, () => window.__colore.save.xp);
    await c(page, () => { window.__colore.battle.forceWin(); window.__colore.advance(2000); });
    await page.locator('[data-act="gains-next"]').click();
    expect(await screen(page)).toBe('world');
    expect(await c(page, () => window.__colore.save.cleared)).toContain('w-sud');
    expect(await c(page, () => window.__colore.save.xp)).toBeGreaterThan(before);
    expect(await c(page, () => window.__colore.world.field.groups.some((g) => g.id === 'w-sud'))).toBe(false);
    await c(page, () => { const z = window.__colore; z.enter('campo1'); z.readAll(); document.querySelector('[data-act="gains-next"]')?.click(); });
    await page.locator('[data-act="rest"]').click();
    await page.locator('[data-act="leave"]').click();
    expect(await c(page, () => window.__colore.world.field.groups.some((g) => g.id === 'w-sud'))).toBe(true);
    expect(errors).toEqual([]);
  });

  test('lanterns, statues and the atlas', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await c(page, () => { const z = window.__colore; z.freeze(); z.newGame(); z.jump('ponte'); z.place(1475, 2712); z.walk(0.5, 0, 100); });
    await expect(page.locator('.w-act')).toContainText('lanterna');
    await page.locator('.w-act').click();
    await expect(page.locator('.w-toast')).toContainText('olio');
    await c(page, () => { const z = window.__colore; z.place(1185, 2900); z.walk(0.3, 0, 60); });
    await expect(page.locator('.w-act')).toContainText('statua');
    await page.locator('.w-act').click();
    await expect(page.locator('.statue .words')).toContainText('aquilone');
    await page.locator('.statue [data-act="map"]').click();
    await page.locator('.w-mini').click();
    await expect(page.locator('.atlas .pin.you')).toBeVisible();
    await expect(page.locator('.atlas .pin.goal')).toHaveCount(1);
    await expect(page.locator('#screen')).toContainText('Lanterne trovate 1/9');
    await page.locator('.sc-head [data-act="map"]').click();
    expect(await screen(page)).toBe('world');
    expect(errors).toEqual([]);
  });

  test('the whole first act on foot and by boat, from the bakery to the sunset', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await c(page, () => { const z = window.__colore; z.freeze(); z.newGame('normal'); z.save.flags.tutorial = true; });
    const route = ['casa', 'ponte', 'darsena', 'stiva', 'canale', 'reti', 'campanaro', 'campanile', 'campo1', 'secche', 'statua', 'airone', 'campo2', 'cervo', 'tramonto'];
    for (const id of route) {
      // walk there; wandering enemies met on the way are won at once
      for (let tries = 0; tries < 12; tries++) {
        const done = await c(page, (n) => window.__colore.save.done.includes(n), id);
        if (done) break;
        const where = await screen(page);
        if (where === 'scene') await c(page, () => window.__colore.readAll());
        else if (where === 'battle') await c(page, () => { window.__colore.battle.forceWin(); window.__colore.advance(2500); });
        else if (where === 'gains') await page.locator('[data-act="gains-next"]').click();
        else if (where === 'camp') {
          await page.locator('[data-act="talk"]').first().click();
          await c(page, () => window.__colore.readAll());
          await page.locator('[data-act="rest"]').click();
          await page.locator('[data-act="leave"]').click();
        } else if (where === 'world') {
          if (id === 'casa' || id === 'tramonto') await c(page, () => window.__colore.walk(0, 0, 32));
          else {
            const goal = await c(page, async (n) => {
              const { NODE } = await import('./js/data/map.js');
              const { BOAT_AT } = await import('./js/world/layout.js');
              return n === 'stiva' ? BOAT_AT : NODE[n].at;
            }, id);
            const res = await walkTo(page, goal, id === 'stiva' ? 70 : 40);
            expect(res, id).not.toBe('no path');
            // stand there: guardians notice, and any moment of peace runs out
            if ((await screen(page)) === 'world') await c(page, () => { window.__colore.walk(0, 0, 3000); if (window.__colore.screen === 'world') window.__colore.act(); });
          }
        }
      }
      // settle the screens that follow
      for (let i = 0; i < 6 && !['world', 'end'].includes(await screen(page)); i++) {
        const where = await screen(page);
        if (where === 'scene') await c(page, () => window.__colore.readAll());
        else if (where === 'battle') await c(page, () => { window.__colore.battle.forceWin(); window.__colore.advance(2500); });
        else if (where === 'gains') await page.locator('[data-act="gains-next"]').click();
        else if (where === 'camp') {
          await page.locator('[data-act="talk"]').first().click();
          await c(page, () => window.__colore.readAll());
          await page.locator('[data-act="leave"]').click();
        }
      }
      expect(await c(page, (n) => window.__colore.save.done.includes(n), id), id).toBe(true);
    }
    expect(await screen(page)).toBe('end');
    const s = await c(page, () => window.__colore.save);
    expect(s.actDone).toBe(true);
    expect(s.party).toEqual(['ilario', 'tecla', 'nora', 'bastiano']);
    expect(s.owned.length).toBe(20);
    expect(s.diary.length).toBe(4);
    await page.locator('[data-act="explore"]').click();
    expect(await screen(page)).toBe('world');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    await page.locator('[data-act="continue"]').click();
    expect(await screen(page)).toBe('world');
    expect(errors).toEqual([]);
  });

  test('party screen: wear and remove memories; journal and settings', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await c(page, () => { window.__colore.newGame(); window.__colore.jump('campo1'); });
    await page.locator('.w-nav [data-w="party"]').click();
    await expect(page.locator('.chips [data-act="hero"]')).toHaveCount(4);
    const worn = page.locator('.mems li.on');
    await expect(worn).toHaveCount(3);
    await worn.first().locator('.mem').click();
    await expect(page.locator('.mems li.on')).toHaveCount(2);
    await page.locator('.sc-head [data-act="map"]').click();
    await page.locator('.w-nav [data-w="diary"]').click();
    await expect(page.locator('.page')).toHaveCount(1);
    await page.locator('.sc-head [data-act="map"]').click();
    await page.locator('.w-nav [data-w="settings"]').click();
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
    await c(page, () => { const z = window.__colore; z.battle.forceWin(); z.advance(2000); document.querySelector('[data-act="gains-next"]')?.click(); });
    for (const sel of ['.w-goal', '.w-mini', '.w-nav [data-w="settings"]']) await expect(page.locator(sel)).toBeInViewport({ ratio: 1 });
  });

  test('works offline after the first visit', async ({ page, context }) => {
    await open(page);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    await expect(page.locator('[data-act="new"]')).toBeVisible();
    // the lagoon and its figures are there too
    const errors = collectErrors(page);
    await c(page, () => { const z = window.__colore; z.newGame(); z.jump('campo1'); });
    expect(await c(page, async () => (await Promise.all([0, 1, 2, 3, 4, 5].map((i) => fetch(`art/world-${i}.webp`)))).every((r) => r.ok))).toBe(true);
    expect(await c(page, () => window.__colore.world.view.stats.mode)).toBe('3d');
    expect(errors).toEqual([]);
    await context.setOffline(false);
  });
});
