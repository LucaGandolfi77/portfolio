import { expect, test } from '@playwright/test';

const APP = '/projects/vision-lab/';

test.describe('Vision Lab', () => {
  test('tracks a face, renders smile scores and exports a snapshot', async ({ page }) => {
    test.skip(
      test.info().project.name === 'vision-mobile',
      'La pipeline camera pesante è coperta su desktop; il layout mobile ha un test dedicato.'
    );
    test.setTimeout(120000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(APP);
    await expect(page.locator('h1')).toHaveText('Your face, in real time');
    await page.click('#cameraToggle');

    await expect(page.locator('#cameraStatus')).toHaveAttribute('data-state', 'running');
    await expect(page.locator('#modelStatus')).toHaveAttribute('data-state', 'ready', {
      timeout: 45000
    });
    await expect(page.locator('#faceStatus')).toHaveAttribute('data-state', 'tracking', {
      timeout: 45000
    });

    const state = await page.evaluate(() => window.__vision.getState());
    expect(state.faces).toBeGreaterThanOrEqual(1);
    expect(state.metrics).toBeTruthy();
    expect(state.smile).toBeTruthy();
    await expect(page.locator('#faceCountValue')).not.toHaveText('—');

    const overlay = await page.evaluate(() => {
      const canvas = document.querySelector('#overlay');
      const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let painted = 0;
      for (let index = 3; index < data.length; index += 4) {
        if (data[index] > 0) painted += 1;
      }
      return { width: canvas.width, height: canvas.height, painted };
    });
    expect(overlay.width).toBeGreaterThan(320);
    expect(overlay.height).toBeGreaterThan(240);
    expect(overlay.painted).toBeGreaterThan(1000);

    await page.click('#modeSwitch [data-mode="smile"]');
    await expect(page.locator('#smilePanel')).toBeVisible();
    await expect(page.locator('#smileValue')).toContainText('%');
    await expect(page.locator('#whitenessValue')).toContainText('%');
    await expect(page.locator('#alignmentValue')).toContainText('%');
    await expect(page.locator('#smileHint')).toHaveText(/mouth|teeth/i);
    await expect(page).toHaveURL(/#smile$/);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#snapshotBtn')
    ]);
    expect(download.suggestedFilename()).toMatch(/^vision-lab-.*\.png$/);

    await page.click('#modeSwitch [data-mode="mesh"]');
    await expect(page.locator('#meshPanel')).toBeVisible();
    await expect(page.locator('#smilePanel')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('persists best score from storage and resets it', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'pf.vision.best',
        JSON.stringify({ score: 88, smile: 90, whiteness: 85, alignment: 80, at: Date.now() })
      );
    });
    await page.goto(APP + '#smile');
    await expect(page.locator('#bestValue')).toHaveText('88/100');
    await expect(page.locator('#bestDate')).toContainText(/Set|Impostato/);
    await page.click('#resetBest');
    await expect(page.locator('#bestValue')).toHaveText('—');
    await expect(page.locator('#resetBest')).toBeDisabled();
    const best = await page.evaluate(() => localStorage.getItem('pf.vision.best'));
    expect(best).toBeNull();
  });

  test('switches language and persists mesh, mirror and settings', async ({ page }) => {
    await page.goto(APP);
    await page.click('.pf-shell__menu-btn');
    await page.selectOption('[data-lang-select]', 'it');
    await page.keyboard.press('Escape');
    await expect(page.locator('h1')).toHaveText('Il tuo viso, in tempo reale');
    await expect(page.locator('#meshPanel .pf-card__title')).toHaveText('Mesh facciale');

    await page.click('#meshSwitch [data-mesh="full"]');
    await page.click('#mirrorToggle');
    await expect(page.locator('#mirrorToggle')).toHaveAttribute('aria-pressed', 'false');

    await page.reload();
    await expect(page.locator('#mirrorToggle')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#meshSwitch [data-mesh="full"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('h1')).toHaveText('Il tuo viso, in tempo reale');
    const settings = await page.evaluate(() => JSON.parse(localStorage.getItem('pf.vision.settings')));
    expect(settings.mesh).toBe('full');
    expect(settings.mirror).toBe(false);
  });

  test('legacy FaceMesh and Smile URLs redirect to the right mode', async ({ page }) => {
    await page.goto('/projects/vision-lab/legacy-facemesh_camera.html');
    await expect(page).toHaveURL(/\/projects\/vision-lab\/#mesh$/);
    await expect(page.locator('#meshPanel')).toBeVisible();

    await page.goto('/projects/vision-lab/legacy-smile_detection.html');
    await expect(page).toHaveURL(/\/projects\/vision-lab\/#smile$/);
    await expect(page.locator('#smilePanel')).toBeVisible();

    await page.goto('/projects/smile_detection/index.html');
    await expect(page).toHaveURL(/\/projects\/vision-lab\/#smile$/);
    await expect(page.locator('#smilePanel')).toBeVisible();
  });

  test('mobile layout has no overflow and 44px controls', async ({ page }) => {
    await page.goto(APP);
    const metrics = await page.evaluate(() => {
      const mode = document.querySelector('#modeSwitch [data-mode="mesh"]');
      const camera = document.querySelector('#cameraToggle');
      const stage = document.querySelector('#stage');
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        modeHeight: mode.getBoundingClientRect().height,
        cameraHeight: camera.getBoundingClientRect().height,
        stageHeight: stage.getBoundingClientRect().height
      };
    });
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
    expect(metrics.modeHeight).toBeGreaterThanOrEqual(44);
    expect(metrics.cameraHeight).toBeGreaterThanOrEqual(44);
    expect(metrics.stageHeight).toBeGreaterThan(280);
  });

  test('service worker serves the shell offline', async ({ page, context }) => {
    await page.goto(APP);
    const state = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return { scope: registration.scope, keys: await caches.keys() };
    });
    expect(state.scope).toContain('/projects/vision-lab/');
    expect(state.keys).toContain('pf-vision-lab-shell-v1');

    await page.reload();
    await context.setOffline(true);
    try {
      await page.reload();
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#stagePlaceholder')).toBeVisible();
      await expect(page.locator('#cameraToggle')).toBeEnabled();
    } finally {
      await context.setOffline(false);
    }
  });
});
