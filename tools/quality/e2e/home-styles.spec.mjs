import { test, expect } from '@playwright/test';

/* Stili della home (assets/js/style-engine.js + assets/css/styles/*.css).
   I font esterni vengono bloccati: i test devono passare anche offline e
   non dipendere dai tempi di Google Fonts. */

// La home anima canvas e particelle: registrare il video rende lentissima la
// chiusura del contesto ("Tearing down context exceeded the test timeout").
// Screenshot e trace restano attivi sui fallimenti.
// Movimento ridotto di default: niente canvas animati, meno CPU sottratta
// agli altri spec che girano in parallelo (l'OCR di Text Lab in CI).
// I test sulle animazioni lo riattivano con emulateMedia.
test.use({ video: 'off', reducedMotion: 'reduce' });

const STYLES = {
  classic:   { bg: '#0a0d0b', theme: null },
  glass:     { bg: '#0a0d18', theme: null },
  terminal:  { bg: '#050805', theme: null },
  arcade:    { bg: '#1b1036', theme: null },
  newspaper: { bg: '#f3efe6', theme: 'light' },
  fashion:   { bg: '#fbf8f6', theme: 'light' }
};

async function open(page, query = '') {
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await page.route(/https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)\//, (route) => route.abort());
  await page.goto('/' + query);
  await expect(page.locator('#styleToggle')).toBeVisible();
  return errors;
}

const token = (page, name) => page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

for (const [name, cfg] of Object.entries(STYLES)) {
  test(`style ${name}: applies tokens, theme and loads without errors`, async ({ page }) => {
    const errors = await open(page, `?style=${name}`);
    const attr = await page.evaluate(() => document.documentElement.getAttribute('data-style'));
    expect(attr).toBe(name === 'classic' ? null : name);
    expect((await token(page, '--c-bg')).toLowerCase()).toBe(cfg.bg);
    if (cfg.theme) {
      await expect(page.locator('html')).toHaveAttribute('data-theme', cfg.theme);
    }
    if (name !== 'classic') {
      await expect(page.locator('#themeToggle')).toBeHidden();
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test('picker switches style, updates the URL and remembers the choice', async ({ page }) => {
  const errors = await open(page);
  await page.locator('#styleToggle').click();
  const options = page.locator('#stylePicker [role="radio"]');
  await expect(options).toHaveCount(6);
  await expect(page.locator('#stylePicker [aria-checked="true"]')).toHaveAttribute('data-style-opt', 'classic');

  await page.locator('#stylePicker [data-style-opt="terminal"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-style', 'terminal');
  await expect(page).toHaveURL(/[?&]style=terminal/);
  await expect(page.locator('#stylePicker [aria-checked="true"]')).toHaveAttribute('data-style-opt', 'terminal');

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-style', 'terminal');
  expect(errors).toEqual([]);
});

test('classic keeps the light/dark choice across fixed-theme styles', async ({ page }) => {
  await open(page, '?style=classic');
  await page.locator('#themeToggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.evaluate(() => window.PortfolioStyle.choose('glass'));
  await expect(page.locator('html')).toHaveAttribute('data-style', 'glass');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');

  await page.evaluate(() => window.PortfolioStyle.choose('classic'));
  await expect(page.locator('html')).not.toHaveAttribute('data-style', /.+/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('#themeToggle')).toBeVisible();
});

test('terminal: reduced motion shows the typed headline at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, '?style=terminal');
  const title = page.locator('.header .title');
  const typed = page.locator('.style-typed .style-typed__text');
  await expect(page.locator('.style-typed')).toHaveAttribute('aria-hidden', 'true');
  await expect(typed).toHaveText((await title.textContent()).trim(), { timeout: 1500 });
  await expect(page.locator('.style-typed .style-caret')).toHaveCount(1);
});

test('terminal: the typed copy follows the real headline (i18n included)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open(page, '?style=terminal');
  const title = page.locator('.header .title');
  const typed = page.locator('.style-typed .style-typed__text');
  await expect(typed).toHaveText((await title.textContent()).trim(), { timeout: 10000 });
  await page.evaluate(() => { document.querySelector('.header .title').textContent = 'Ciao, sono Luca'; });
  await expect(typed).toHaveText('Ciao, sono Luca', { timeout: 10000 });
  await page.evaluate(() => window.PortfolioStyle.choose('classic'));
  await expect(page.locator('.style-typed')).toHaveCount(0);
});

test('arcade draws the pixel avatar and removes it when leaving', async ({ page }) => {
  await open(page, '?style=arcade');
  await expect(page.locator('.style-pixel-avatar')).toHaveCount(1);
  await page.evaluate(() => window.PortfolioStyle.choose('classic'));
  await expect(page.locator('.style-pixel-avatar')).toHaveCount(0);
});
