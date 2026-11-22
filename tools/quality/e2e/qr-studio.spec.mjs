import { expect, test } from '@playwright/test';

const APP = '/projects/qr-studio/';

test.describe('QR Studio', () => {
  test('creates, renders and decodes a QR without network', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(APP);
    await expect(page.locator('h1')).toHaveText('Scan. Create. Keep it local.');
    await expect(page.locator('#fields input')).toHaveAttribute('type', 'url');

    await page.fill('#field-url', 'example.com');
    await expect(page.locator('#previewStage')).toHaveClass(/has-code/);
    await expect(page.locator('#matrixBadge')).toContainText('×');

    const decoded = await page.evaluate(() => {
      const canvas = document.querySelector('#qrCanvas');
      const context = canvas.getContext('2d');
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      const result = window.jsQR(image.data, canvas.width, canvas.height, {
        inversionAttempts: 'attemptBoth'
      });
      return result && result.data;
    });
    expect(decoded).toBe('https://example.com');

    for (const style of ['round', 'dot', 'square']) {
      await page.click(`#styleControl [data-style="${style}"]`);
      await expect(page.locator(`#styleControl [data-style="${style}"]`)).toHaveAttribute('aria-pressed', 'true');
      const styleDecoded = await page.evaluate(() => {
        const canvas = document.querySelector('#qrCanvas');
        const context = canvas.getContext('2d');
        const image = context.getImageData(0, 0, canvas.width, canvas.height);
        const result = window.jsQR(image.data, canvas.width, canvas.height, {
          inversionAttempts: 'attemptBoth'
        });
        return result && result.data;
      });
      expect(styleDecoded, `stile ${style}`).toBe('https://example.com');
    }

    await page.click('#saveBtn');
    await expect(page.locator('#historyCount')).toHaveText('1');
    await page.click('#tab-history');
    await expect(page.locator('.qr-history__item')).toHaveCount(1);
    await expect(page.locator('.qr-history__item')).toContainText('https://example.com');
    expect(errors).toEqual([]);
  });

  test('exports PNG and SVG files', async ({ page }) => {
    await page.goto(APP);
    await page.fill('#field-url', 'example.com');
    await expect(page.locator('#previewStage')).toHaveClass(/has-code/);

    const [png] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#pngBtn')
    ]);
    expect(png.suggestedFilename()).toMatch(/\.png$/);

    const [svg] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#svgBtn')
    ]);
    expect(svg.suggestedFilename()).toMatch(/\.svg$/);
  });

  test('legacy QR URLs redirect to the matching section', async ({ page }) => {
    await page.goto('/projects/qrcode.html');
    await expect(page).toHaveURL(/\/projects\/qr-studio\/#scan$/);
    await expect(page.locator('#tab-scan')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#panel-scan')).toBeVisible();

    await page.goto('/projects/create_qrcode.html');
    await expect(page).toHaveURL(/\/projects\/qr-studio\/#create$/);
    await expect(page.locator('#tab-create')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#panel-create')).toBeVisible();
  });

  test('switches language from the Project Shell', async ({ page }) => {
    await page.goto(APP);
    await page.click('.pf-shell__menu-btn');
    await page.selectOption('[data-lang-select]', 'it');

    await expect(page.locator('h1')).toHaveText('Scansiona. Crea. Resta in locale.');
    await expect(page.locator('#tab-create span')).toHaveText('Crea');
    await expect(page.locator('#tab-scan span')).toHaveText('Scansiona');
    await expect(page.locator('#saveBtn')).toHaveText('Salva');
    await expect(page.locator('#scanStatusBadge')).toHaveText('In attesa');
    await expect(page.locator('#typeChips .qr-type span').nth(1)).toHaveText('Testo');

    const lang = await page.evaluate(() => localStorage.getItem('pf.lang'));
    expect(lang).toBe('it');

    await page.selectOption('[data-lang-select]', 'en');
    await expect(page.locator('#tab-create span')).toHaveText('Create');
  });

  test('scans a QR from the camera (fake video)', async ({ page }) => {
    await page.goto(APP + '#scan');
    await page.click('#scanStart');

    await expect(page.locator('#scanResult')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('#resultData')).toHaveText('https://example.com/camera-e2e');
    await expect(page.locator('#resultType')).toHaveText('Link');
    await expect(page.locator('#historyCount')).toHaveText('1');
    await expect(page.locator('#scanPlaceholder')).toBeVisible();
  });

  test('scans a QR from an uploaded image', async ({ page }) => {
    await page.goto(APP + '#scan');

    const base64 = await page.evaluate(async () => {
      const { buildMatrix, drawCanvas } = await import('./js/qr-render.js');
      const matrix = buildMatrix('https://example.com/upload-e2e', 'M');
      const canvas = document.createElement('canvas');
      drawCanvas(canvas, matrix, { size: 640 });
      return canvas.toDataURL('image/png').split(',')[1];
    });

    await page.setInputFiles('#scanFile', {
      name: 'qr-upload.png',
      mimeType: 'image/png',
      buffer: Buffer.from(base64, 'base64')
    });

    await expect(page.locator('#scanResult')).toBeVisible();
    await expect(page.locator('#resultData')).toHaveText('https://example.com/upload-e2e');
    await expect(page.locator('#historyCount')).toHaveText('1');
  });

  test('mobile layout: no horizontal overflow, 44px targets, 16px inputs', async ({ page }) => {
    await page.goto(APP);
    await page.fill('#field-url', 'example.com');
    await expect(page.locator('#previewStage')).toHaveClass(/has-code/);

    const metrics = await page.evaluate(() => {
      const tab = document.querySelector('.qr-tab');
      const input = document.querySelector('#fields input');
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        tabHeight: tab.getBoundingClientRect().height,
        inputFontSize: parseFloat(getComputedStyle(input).fontSize)
      };
    });

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
    expect(metrics.tabHeight).toBeGreaterThanOrEqual(44);
    expect(metrics.inputFontSize).toBeGreaterThanOrEqual(16);
  });

  test('service worker caches the app and serves it offline', async ({ page, context }) => {
    await page.goto(APP);
    const state = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return { scope: registration.scope, keys: await caches.keys() };
    });
    expect(state.scope).toContain('/projects/qr-studio/');
    expect(state.keys).toContain('pf-qr-studio-v1');

    await page.reload();
    await context.setOffline(true);
    try {
      await page.reload();
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#fields input')).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });
});
