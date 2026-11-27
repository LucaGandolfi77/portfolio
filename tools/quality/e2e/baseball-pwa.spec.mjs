import { expect, test } from '@playwright/test';

test.describe('Diamond & Oval Poly (Baseball + Cricket PWA)', () => {
  test('loads cleanly, switches Baseball <-> Cricket, and plays without errors', async ({ page, baseURL }) => {
    const errors = [];
    const origin = new URL(baseURL).origin;
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('response', (res) => {
      const url = new URL(res.url());
      if (url.origin === origin && url.pathname !== '/favicon.ico' && res.status() >= 400) {
        errors.push(`HTTP ${res.status()}: ${url.pathname}`);
      }
    });

    await page.goto('/games/baseball-pwa/index.html', { waitUntil: 'load' });

    // Menu modal visible and fits viewport horizontally (important on vertical iPhone)
    const modal = page.locator('#menu-modal');
    await expect(modal).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    expect(overflow).toBe(false);

    // Start Baseball Match
    await page.locator('#btn-start-game').click();
    await expect(modal).toBeHidden();
    await expect(page.locator('#baseball-scorebug')).toBeVisible();
    await expect(page.locator('#cricket-scorebug')).toBeHidden();

    // Wait for canvas render + windup -> pitch
    await page.waitForTimeout(1000);
    await page.locator('#btn-swing').click();
    await page.waitForTimeout(300);

    // Open menu and switch to Cricket mode
    await page.locator('#btn-menu').click();
    await expect(modal).toBeVisible();
    await page.locator('.sport-tab[data-sport="cricket"]').click();
    await expect(page.locator('#modal-title')).toContainText('OVAL');
    await expect(page.locator('#btn-start-game')).toContainText('CRICKET');

    // Start Cricket Super Over
    await page.locator('#btn-start-game').click();
    await expect(modal).toBeHidden();
    await expect(page.locator('#cricket-scorebug')).toBeVisible();
    await expect(page.locator('#baseball-scorebug')).toBeHidden();
    await expect(page.locator('#cr-over-balls .ov-dot')).toHaveCount(6);

    // Wait for bowler run-up -> delivery and play a shot
    await page.waitForTimeout(1000);
    await page.locator('#btn-swing').click();
    await page.waitForTimeout(300);

    // Verify canvas is non-empty and matches viewport
    const box = await page.locator('#game-canvas').boundingBox();
    expect(box.width).toBeGreaterThan(300);
    expect(box.height).toBeGreaterThan(400);

    expect(errors).toEqual([]);
  });
});
