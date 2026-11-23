import { expect, test } from '@playwright/test';

const APP = '/projects/text-lab/';

test.describe('Text Lab', () => {
  test('extracts text, rotates, downloads and works offline', async ({ page, context }) => {
    test.setTimeout(120000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      localStorage.setItem(
        'pf.text.settings',
        JSON.stringify({ language: 'eng', grayscale: false, contrast: false, facing: 'environment' })
      );
    });

    await page.goto(APP);
    await expect(page.locator('h1')).toHaveText('Turn images into text');

    const base64 = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1100;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#111111';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 92px Arial, sans-serif';
      ctx.fillText('HELLO TEXT LAB', 55, 140);
      ctx.font = 'bold 64px Arial, sans-serif';
      ctx.fillText('OCR WORKS 2026', 55, 245);
      return canvas.toDataURL('image/png').split(',')[1];
    });

    const file = {
      name: 'ocr-test.png',
      mimeType: 'image/png',
      buffer: Buffer.from(base64, 'base64')
    };
    await page.setInputFiles('#imageInput', file);

    await expect(page.locator('#resultContent')).toBeVisible({ timeout: 120000 });
    await expect(page.locator('#resultText')).toHaveValue(/HELLO TEXT LAB/);
    await expect(page.locator('#resultText')).toHaveValue(/OCR WORKS 2026/);
    await expect(page.locator('#statConfidence')).toContainText('%');
    await expect(page.locator('#statWords')).not.toHaveText('0');
    await expect(page.locator('#engineStatus')).toHaveAttribute('data-state', 'ready');
    await expect(page.locator('.textlab-history__item')).toHaveCount(1);

    const before = await page.locator('#previewCanvas').evaluate((canvas) => ({
      width: canvas.width,
      height: canvas.height
    }));
    await page.click('#rotateRight');
    const after = await page.locator('#previewCanvas').evaluate((canvas) => ({
      width: canvas.width,
      height: canvas.height
    }));
    expect(after.width).toBe(before.height);
    expect(after.height).toBe(before.width);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#resultDownload')
    ]);
    expect(download.suggestedFilename()).toMatch(/^text-lab-.*\.txt$/);

    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await context.setOffline(true);
    try {
      await page.reload();
      await page.setInputFiles('#imageInput', file);
      await expect(page.locator('#resultText')).toHaveValue(/HELLO TEXT LAB/, { timeout: 120000 });
    } finally {
      await context.setOffline(false);
    }
    expect(errors).toEqual([]);
  });

  test('restores and clears the local history', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'pf.text.history',
        JSON.stringify([
          {
            id: 'stored-1',
            text: 'Stored OCR text\nSecond line',
            language: 'eng',
            confidence: 88,
            createdAt: Date.now()
          }
        ])
      );
    });
    await page.goto(APP);
    await expect(page.locator('.textlab-history__item')).toHaveCount(1);
    await page.click('.textlab-history__open');
    await expect(page.locator('#resultText')).toHaveValue(/Stored OCR text/);
    await expect(page.locator('#confidenceBadge')).toHaveText('88%');
    await expect(page.locator('#statTime')).toHaveText('—');

    await page.click('#clearHistoryBtn');
    await expect(page.locator('dialog[open]')).toBeVisible();
    await page.click('[data-dialog-confirm]');
    await expect(page.locator('.textlab-history__item')).toHaveCount(0);
    await expect(page.locator('#historyEmpty')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('pf.text.history'))).toBe('[]');
  });

  test('switches language and persists OCR settings', async ({ page }) => {
    await page.goto(APP);
    await page.click('.pf-shell__menu-btn');
    await page.selectOption('[data-lang-select]', 'it');
    await page.keyboard.press('Escape');
    await expect(page.locator('h1')).toHaveText('Trasforma le immagini in testo');

    await expect(page.locator('#languageChips [data-lang="eng"]')).toHaveAttribute('aria-pressed', 'true');
    await page.click('#languageChips [data-lang="eng"]');
    await expect(page.locator('#languageChips [data-lang="eng"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#languageChips [data-lang="ita"]')).toHaveAttribute('aria-pressed', 'true');
    await page.click('.textlab-preprocess [data-toggle="contrast"]');
    const settings = await page.evaluate(() => JSON.parse(localStorage.getItem('pf.text.settings')));
    expect(settings.language).toBe('ita');
    expect(settings.contrast).toBe(true);

    await page.reload();
    await expect(page.locator('h1')).toHaveText('Trasforma le immagini in testo');
    await expect(page.locator('#languageChips [data-lang="eng"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#languageChips [data-lang="ita"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.textlab-preprocess [data-toggle="contrast"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('starts and stops the camera in scan mode', async ({ page }) => {
    await page.goto(APP + '#camera');
    await expect(page.locator('#cameraToggle')).toBeVisible();
    await page.click('#cameraToggle');
    await expect(page.locator('#cameraStatus')).toHaveAttribute('data-state', 'running');
    await expect(page.locator('#cameraToggle')).toContainText('Stop camera');
    await expect(page.locator('#captureBtn')).toBeEnabled();
    await page.click('#cameraToggle');
    await expect(page.locator('#cameraStatus')).toHaveAttribute('data-state', 'idle');
    await expect(page.locator('#cameraPlaceholder')).toBeVisible();
  });

  test('legacy Text Recognition URL opens camera mode', async ({ page }) => {
    await page.goto('/projects/text-lab/legacy-text_recognition.html');
    await expect(page).toHaveURL(/\/projects\/text-lab\/index\.html#camera$/);
    await expect(page.locator('#modeSwitch [data-mode="camera"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#cameraPlaceholder')).toBeVisible();
  });

  test('mobile layout has no overflow and readable controls', async ({ page }) => {
    await page.goto(APP);
    const metrics = await page.evaluate(() => {
      const mode = document.querySelector('#modeSwitch [data-mode="image"]');
      const choose = document.querySelector('#chooseImageBtn');
      const stage = document.querySelector('#stage');
      const textarea = document.querySelector('#resultText');
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        modeHeight: mode.getBoundingClientRect().height,
        chooseHeight: choose.getBoundingClientRect().height,
        stageHeight: stage.getBoundingClientRect().height,
        textareaFont: parseFloat(getComputedStyle(textarea).fontSize)
      };
    });
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
    expect(metrics.modeHeight).toBeGreaterThanOrEqual(44);
    expect(metrics.chooseHeight).toBeGreaterThanOrEqual(44);
    expect(metrics.stageHeight).toBeGreaterThan(280);
    expect(metrics.textareaFont).toBeGreaterThanOrEqual(16);
  });

  test('service worker serves the shell offline', async ({ page, context }) => {
    await page.goto(APP);
    const state = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return { scope: registration.scope, keys: await caches.keys() };
    });
    expect(state.scope).toContain('/projects/text-lab/');
    expect(state.keys).toContain('pf-text-lab-shell-v1');

    await page.reload();
    await context.setOffline(true);
    try {
      await page.reload();
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#dropZone')).toBeVisible();
      await expect(page.locator('#chooseImageBtn')).toBeEnabled();
    } finally {
      await context.setOffline(false);
    }
  });
});
