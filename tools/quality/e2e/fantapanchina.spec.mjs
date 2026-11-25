import { test, expect } from '@playwright/test';

const APP = '/projects/fantapanchina/';

async function fresh(page) {
  await page.addInitScript(() => {
    try { localStorage.clear(); } catch (e) { /* storage disabilitato */ }
  });
  await page.goto(APP);
  await expect(page.locator('.tab[data-tab="collezione"]')).toBeVisible();
}

test('collezione: apre un baule e mostra la carta', async ({ page }) => {
  await fresh(page);
  await page.locator('.tab[data-tab="collezione"]').click();
  await expect(page.locator('.seg-btn[data-sub="bauli"].on')).toBeVisible();
  await expect(page.locator('.chest-slot:not(.empty)')).toHaveCount(1);

  const before = await page.evaluate(() => Object.keys(window.__fp.state.cards).length);
  await page.locator('[data-action="open-chest"]').first().click();

  await expect(page.locator('.reveal-card')).toBeVisible();
  await expect(page.locator('.reveal-badge')).toContainText(/NUOVA|DOPPIONE/);
  await expect(page.locator('[data-action="close-modal"]')).toBeVisible();

  const after = await page.evaluate(() => ({
    cards: Object.keys(window.__fp.state.cards).length,
    opened: window.__fp.state.stats.chestsOpened
  }));
  expect(after.cards).toBeGreaterThanOrEqual(before);
  expect(after.opened).toBe(1);
  await page.locator('[data-action="close-modal"]').click();
});

test('carte: il doppione sale di livello e potenzia il giocatore in rosa', async ({ page }) => {
  await fresh(page);
  const before = await page.evaluate(() => {
    const p = window.__fp.state.players.find(x => x.cardId === 'c001');
    return { skill: p.skill, level: p.cardLevel };
  });

  const result = await page.evaluate(() => {
    const { Sim, state } = window.__fp;
    const res = Sim.addCardToCollection(state, 'c001');
    window.__fp.refresh();
    return { level: res.levelAfter, skill: res.player.skill, isNew: res.isNew };
  });

  expect(result.isNew).toBe(false);
  expect(result.level).toBe(2);
  expect(result.skill).toBeCloseTo(before.skill + 0.4, 5);

  await page.locator('.tab[data-tab="squadra"]').click();
  await expect(page.locator('.player-card[data-id="c001"] .pc-level')).toHaveText('Lv.2');
});

test('collezione: schiera una nuova carta in rosa', async ({ page }) => {
  await fresh(page);
  await page.evaluate(() => {
    const { Sim, state } = window.__fp;
    Sim.addCardToCollection(state, 'c002');
    window.__fp.refresh();
  });

  await page.locator('.tab[data-tab="collezione"]').click();
  await page.locator('.seg-btn[data-sub="carte"]').click();
  await page.locator('.fcard[data-id="c002"]').click();
  await expect(page.locator('.card-detail')).toBeVisible();
  await page.locator('[data-action="deploy-card"]').click();

  await expect(page.locator('.toast')).toContainText('entra in rosa');
  const info = await page.evaluate(() => ({
    players: window.__fp.state.players.length,
    inRoster: window.__fp.state.players.some(p => p.cardId === 'c002')
  }));
  expect(info.players).toBe(11);
  expect(info.inRoster).toBe(true);
});

test('mercante: scambia solo i doppioni e non tocca la prima copia', async ({ page }) => {
  await fresh(page);
  const before = await page.evaluate(() => {
    const { Sim, state } = window.__fp;
    state.cards.c001.copies = 4;
    state.cards.c001.found = 4;
    Sim.generateMerchant(state);
    window.__fp.refresh();
    const offer = state.merchant.offers.find(o => !o.recovery);
    if (!offer) throw new Error('offerta non trovata');
    return {
      wantId: offer.wantId,
      qty: offer.wantQty,
      copies: state.cards[offer.wantId].copies,
      found: state.cards[offer.wantId].found,
      unique: Object.keys(state.cards).length
    };
  });

  await page.locator('.tab[data-tab="collezione"]').click();
  await page.locator('.seg-btn[data-sub="mercante"]').click();
  await expect(page.locator('.merchant-offer').first()).toBeVisible();
  await page.locator('.merchant-offer .trade-btn').first().click();
  await expect(page.locator('.reveal-card')).toBeVisible();
  await page.locator('[data-action="close-modal"]').click();

  const after = await page.evaluate(() => ({
    copies: window.__fp.state.cards.c001.copies,
    found: window.__fp.state.cards.c001.found,
    unique: Object.keys(window.__fp.state.cards).length,
    trades: window.__fp.state.stats.trades
  }));
  expect(after.copies).toBe(before.copies - before.qty);
  expect(after.copies).toBeGreaterThanOrEqual(1);
  expect(after.found).toBe(before.found);
  expect(after.unique).toBeGreaterThanOrEqual(before.unique);
  expect(after.trades).toBe(1);
  await expect(page.locator('.trade-history')).toBeVisible();
});

test('bauli: acquisto con FC e coda quando gli slot sono pieni', async ({ page }) => {
  await fresh(page);
  await page.evaluate(() => {
    const { Sim, state } = window.__fp;
    state.fc = 99999;
    state.chestQueue = [];
    state.chestPausedMs = null;
    while (state.chests.length < 4) Sim.grantChest(state, 'legno', '');
    window.__fp.refresh();
  });
  await page.locator('.tab[data-tab="collezione"]').click();
  const before = await page.evaluate(() => window.__fp.state.fc);
  await page.locator('[data-action="chest-buy"][data-tier="oro"]').click();

  await expect(page.locator('.chest-queue')).toContainText('In coda');
  const state = await page.evaluate(() => ({
    queue: window.__fp.state.chestQueue.length,
    fc: window.__fp.state.fc
  }));
  expect(state.queue).toBe(1);
  expect(state.fc).toBeLessThan(before);
  expect(state.fc).toBeGreaterThan(before - 20000 - 500);
});

test('migrazione: un salvataggio v2 diventa v3 senza perdere i progressi', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('fantapanchina-save-v2', JSON.stringify({
      version: 2, fc: 777, totalFc: 777, fp: 10, players: [], mercato: [], upgrades: {},
      stats: { taps: 5 }, classifica: [], feed: []
    }));
  });
  await page.goto(APP);
  const snap = await page.evaluate(() => ({
    version: window.__fp.state.version,
    fc: window.__fp.state.fc,
    taps: window.__fp.state.stats.taps,
    cards: typeof window.__fp.state.cards,
    chests: Array.isArray(window.__fp.state.chests),
    pity: !!window.__fp.state.pity
  }));
  expect(snap.version).toBe(3);
  expect(snap.fc).toBe(777);
  expect(snap.taps).toBe(5);
  expect(snap.cards).toBe('object');
  expect(snap.chests).toBe(true);
  expect(snap.pity).toBe(true);
});

test('loop: i FC crescono e la giornata parte', async ({ page }) => {
  await fresh(page);
  const before = await page.evaluate(() => window.__fp.state.fc);
  await page.waitForTimeout(600);
  const grown = await page.evaluate(() => window.__fp.state.fc);
  expect(grown).toBeGreaterThan(before);

  await page.evaluate(() => { window.__fp.state.lastGiornataTime = Date.now() - 181000; });
  await expect(page.locator('#match-overlay')).toBeVisible();
  const giornata = await page.evaluate(() => window.__fp.state.giornata);
  expect(giornata).toBeGreaterThanOrEqual(1);
  await page.locator('[data-action="match-close"]').click();
  await expect(page.locator('#match-overlay')).toBeHidden();
});
