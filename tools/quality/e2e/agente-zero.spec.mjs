import { expect, test } from '@playwright/test';

/* Agente Zero is a static ES-module PWA: no build, served from the repo. */
const APP = '/games/agente-zero/';
test.use({ video: 'off', viewport: { width: 390, height: 844 } });
test.setTimeout(120_000);

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !m.text().includes('navigator.vibrate') && errors.push(m.text()));
  page.on('response', (r) => r.url().includes('/games/') && r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  return errors;
}

async function open(page) {
  await page.addInitScript(() => { localStorage.setItem('lang', 'it'); });
  await page.goto(APP);
  await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
}

const screen = (page) => page.evaluate(() => window.__zero.screen);
const matchInfo = (page) => page.evaluate(() => {
  const m = window.__zero.game.match;
  return { id: m.id, attempts: m.attempts, makes: m.makes, score: m.score, over: m.over, spot: { ...m.spot }, letters: m.letters && { ...m.letters } };
});

/** Plays shots until the match ends. `make` false sends every one short. */
async function playOut(page, make = true) {
  await page.evaluate((good) => {
    const z = window.__zero;
    for (let i = 0; i < 400 && z.screen === 'play' && !z.game.match.over; i++) {
      if (z.game.canShoot()) z.shoot(good ? {} : { power: 0.88 });
      z.advance(500);
    }
    z.advance(3000);
  }, make);
  await expect(page.locator('#screen[data-kind="result"]')).toBeVisible();
}

/** A real finger gesture: an upward drag of the ideal length. */
async function swipe(page, ratio = 1) {
  const box = await page.locator('#court').boundingBox();
  const d = await page.evaluate(() => window.__zero.game.distance());
  const len = (0.17 + 0.024 * d) * box.height * ratio;
  const x = box.x + box.width / 2, y = box.y + box.height * 0.86;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - len, { steps: 10 });
  await page.mouse.up();
}

test.describe('Agente Zero', () => {
  test('home shows seven modes and a swipe scores in training', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await expect(page.locator('.mode')).toHaveCount(7);
    await page.locator('[data-id="training"]').click();
    await expect(page.locator('#hud')).toBeVisible();
    await swipe(page);
    await expect.poll(async () => (await matchInfo(page)).makes).toBe(1);
    expect(errors).toEqual([]);
  });

  test('a short swipe misses and says so', async ({ page }) => {
    await open(page);
    await page.locator('[data-id="training"]').click();
    await swipe(page, 0.5);
    await expect(page.locator('#flash small')).toContainText('Corto');
    const m = await matchInfo(page);
    expect(m.attempts).toBe(1);
    expect(m.makes).toBe(0);
  });

  test('training lets you move; pause stops the clock', async ({ page }) => {
    await open(page);
    await page.locator('[data-id="training"]').click();
    await page.locator('[data-spot="corner-l"]').click();
    expect((await matchInfo(page)).spot.x).toBeLessThan(-6);
    await page.locator('#btn-pause').click();
    await expect(page.locator('[data-act="resume"]')).toBeVisible();
    await page.locator('[data-act="quit"]').click();
    expect(await screen(page)).toBe('home');
    await page.locator('[data-id="timed"]').click();
    await page.locator('#btn-pause').click();
    const left = await page.evaluate(() => { window.__zero.advance(5000); return window.__zero.game.match.timeLeft; });
    expect(left).toBeGreaterThan(55);
  });

  test('keyboard and hold-and-release controls shoot', async ({ page }) => {
    await open(page);
    await page.locator('[data-id="training"]').click();
    await page.locator('#court').focus();
    await page.keyboard.down('Space');
    await expect(page.locator('#meter')).toBeVisible();
    await page.evaluate(() => window.__zero.advance(375));
    await page.keyboard.up('Space');
    await expect.poll(async () => (await matchInfo(page)).attempts).toBe(1);
  });

  for (const [mode, shots] of [['timed', null], ['three', 25], ['daily', 10]]) {
    test(`a whole ${mode} match ends with a result and is saved`, async ({ page }) => {
      const errors = collectErrors(page);
      await open(page);
      await page.locator(`[data-id="${mode}"]`).click();
      await playOut(page);
      const m = await matchInfo(page);
      expect(m.makes).toBeGreaterThan(0);
      if (shots) expect(m.attempts).toBe(shots);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
      const saved = await page.evaluate(() => window.__zero.state);
      expect(saved.matches).toBe(1);
      expect(saved.stats.makes).toBeGreaterThan(0);
      if (mode === 'daily') expect(Object.keys(saved.daily)).toHaveLength(1);
      else expect(saved.best[mode]).toBeGreaterThan(0);
      expect(errors).toEqual([]);
    });
  }

  test('Z-E-R-O: missing every copy loses the match', async ({ page }) => {
    await open(page);
    await page.locator('[data-id="zero"]').click();
    // the rival never misses here, we always do
    await page.evaluate(() => { window.__zero.game.match.skill = 1; window.__zero.game.match.rng = () => 0.5; });
    await playOut(page, false);
    expect((await matchInfo(page)).letters.you).toBe(4);
    await expect(page.locator('.result h2')).toHaveText('Ha vinto Kappa');
  });

  test('career: the first mission gives stars and unlocks the second', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    await page.locator('[data-id="career"]').click();
    await expect(page.locator('[data-act="brief"][data-m="1"]')).toBeDisabled();
    await page.locator('[data-act="brief"][data-c="0"][data-m="0"]').click();
    await page.locator('[data-act="mission"]').click();
    await playOut(page);
    await expect(page.locator('.result > .stars i.on')).toHaveCount(3);
    await page.locator('[data-act="next"]').click();
    await expect(page.locator('[data-act="mission"][data-m="1"]')).toBeVisible();
    await page.locator('[data-act="career"]').click();
    await expect(page.locator('[data-act="brief"][data-m="1"]')).toBeEnabled();
    expect(errors).toEqual([]);
  });

  test('locker room: free looks change, locked ones do not, choices persist', async ({ page }) => {
    await open(page);
    await page.locator('[data-act="wardrobe"]').click();
    await expect(page.locator('[data-slot="jersey"][data-id="retro"]')).toBeDisabled();
    await page.locator('[data-slot="hair"][data-id="braids"]').click();
    await page.locator('[data-slot="band"][data-id="none"]').click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    const look = await page.evaluate(() => window.__zero.state.look);
    expect(look.hair).toBe('braids');
    expect(look.band).toBe('none');
  });

  test('settings switch language and control; stats, medals and help open', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page);
    for (const act of ['stats', 'medals', 'howto']) {
      await page.locator(`.tools [data-act="${act}"]`).click();
      await expect(page.locator(`#screen[data-kind="${act}"] h2`)).toBeVisible();
      await page.locator('.sc-head [data-act="home"]').click();
    }
    await page.locator('.tools [data-act="settings"]').click();
    await page.locator('[data-key="lang"][data-v="en"]').click();
    await expect(page.locator('.sc-head h2')).toHaveText('Settings');
    await page.locator('[data-key="control"][data-v="hold"]').click();
    await page.locator('.sc-head [data-act="home"]').click();
    await page.locator('[data-id="training"]').click();
    const box = await page.locator('#court').boundingBox();
    await page.mouse.move(box.width / 2, box.height * 0.7);
    await page.mouse.down();
    await expect(page.locator('#meter')).toBeVisible();
    await page.evaluate(() => window.__zero.advance(375));
    await page.mouse.up();
    await expect.poll(async () => (await matchInfo(page)).attempts).toBe(1);
    expect(errors).toEqual([]);
  });

  test('fits a small phone without sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await open(page);
    for (const sel of ['body', '#screen']) {
      expect(await page.locator(sel).evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
    }
    await page.locator('[data-id="three"]').click();
    expect(await page.locator('body').evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
  });

  test('works offline after the first visit', async ({ page, context }) => {
    await open(page);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    await expect(page.locator('.mode')).toHaveCount(7);
    await context.setOffline(false);
  });
});

test.describe('Agente Zero — Bomba', () => {
  const info = (page) => page.evaluate(() => {
    const g = window.__zero.game, m = g.match;
    return { phase: g.phase, step: g.bomb?.step ?? null, level: m.level, bombs: m.bombs, score: m.score, left: m.timeLeft };
  });
  const advance = (page, ms) => page.evaluate((t) => window.__zero.advance(t), ms);
  async function enter(page) {
    await open(page);
    await page.locator('[data-id="bomb"]').click();
    await page.locator('[data-act="adult-yes"]').click();
    await expect(page.locator('#hud')).toBeVisible();
  }
  /** Scores one sober basket and waits for the drink to appear. */
  async function basket(page) {
    await page.evaluate(() => {
      const z = window.__zero;
      for (let i = 0; i < 40 && !z.game.canShoot(); i++) z.advance(200);
      z.game.match.level = 0;
      z.shoot({});
      for (let i = 0; i < 40 && z.game.phase !== 'drink'; i++) z.advance(200);
    });
    await expect.poll(async () => (await info(page)).phase).toBe('drink');
  }

  test('asks the age first; “no” keeps only this mode closed', async ({ page }) => {
    await open(page);
    await page.locator('[data-id="bomb"]').click();
    await expect(page.locator('[data-act="adult-yes"]')).toBeVisible();
    await page.locator('[data-act="adult-no"]').click();
    await expect(page.locator('[data-act="adult-yes"]')).toHaveCount(0);
    await page.locator('#screen [data-act="home"]').click();
    await page.locator('[data-id="bomb"]').click();
    await expect(page.locator('[data-act="adult-yes"]')).toHaveCount(0);
    await page.locator('#screen [data-act="home"]').click();
    await page.locator('[data-id="training"]').click();
    expect(await screen(page)).toBe('play');
  });

  test('basket, drop the shot with a tap, drink by holding, back on court drunker', async ({ page }) => {
    const errors = collectErrors(page);
    await enter(page);
    await basket(page);
    await expect(page.locator('#hint')).toContainText('Tocca');
    const left = (await info(page)).left;
    await advance(page, 500);
    const box = await page.locator('#court').boundingBox();
    await page.mouse.click(box.width / 2, box.height / 2);
    expect((await info(page)).step).toBe('fall');
    await advance(page, 700);
    await expect(page.locator('#hint')).toContainText('Tieni premuto');
    await page.mouse.move(box.width / 2, box.height / 2);
    await page.mouse.down();
    await advance(page, 1800);
    await page.mouse.up();
    await advance(page, 1500);
    const after = await info(page);
    expect(after.phase).toBe('aim');
    expect(after.bombs).toBe(1);
    expect(after.level).toBeGreaterThan(10);
    // over five seconds of drinking; only the moment back on court counts
    expect(left - after.left).toBeLessThan(1.5);
    await expect(page.locator('#hud-chips .meter')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('tipping the phone empties the glass', async ({ page }) => {
    await enter(page);
    const tip = (beta) => page.evaluate((b) => window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: b, gamma: 0 })), beta);
    await tip(75);
    await basket(page);
    await advance(page, 500);
    await page.evaluate(() => window.__zero.game.drop());
    await advance(page, 700);
    await expect(page.locator('#hint')).toContainText('Inclina');
    await advance(page, 1000);
    expect(await page.evaluate(() => window.__zero.game.bomb.progress)).toBe(0);
    await tip(5);
    await advance(page, 1600);
    await advance(page, 1500);
    expect((await info(page)).bombs).toBe(1);
  });

  test('one drink too many: he falls asleep and the night is saved', async ({ page }) => {
    const errors = collectErrors(page);
    await enter(page);
    await basket(page);
    await page.evaluate(() => {
      const z = window.__zero;
      z.game.match.level = 95;
      z.advance(500);
      z.game.drop();
      z.advance(700);
      z.game.hold(true);
      z.advance(1800);
      z.advance(1500);
    });
    await expect(page.locator('.result h2')).toHaveText('Crollato!', { timeout: 8000 });
    const saved = await page.evaluate(() => window.__zero.state);
    expect(saved.stats.bombs).toBe(1);
    expect(saved.medals).toContain('bomb1');
    await page.locator('[data-act="retry"]').click();
    await expect.poll(async () => (await info(page)).level).toBe(0);
    expect(errors).toEqual([]);
  });

  test('drunk shots are bent by the wobble and sober modes are untouched', async ({ page }) => {
    await enter(page);
    const aimed = await page.evaluate(() => {
      const z = window.__zero;
      z.advance(900);
      z.game.match.level = 90;
      z.shoot({});
      return z.game.flight.err;
    });
    expect(Math.abs(aimed.aim) + Math.abs(aimed.power - 1)).toBeGreaterThan(0.004);
    const sober = await page.evaluate(() => {
      const z = window.__zero;
      z.start('training');
      z.advance(900);
      z.shoot({});
      return { err: z.game.flight.err, wobble: z.game.wobble() };
    });
    expect(sober).toEqual({ err: {}, wobble: null });
  });
});
