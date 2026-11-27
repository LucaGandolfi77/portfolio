#!/usr/bin/env node
/**
 * Renders the Bar Blu PNG icons from games/piano-fall/icons/icon.svg
 * with the Playwright Chromium already used by the E2E tests.
 * Uso: node tools/quality/generate-piano-icons.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'games', 'bar-blu', 'icons');
const svg = readFileSync(join(DIR, 'icon.svg'), 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, size, maskable] of [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['icon-maskable-512.png', 512, true]]) {
  await page.setViewportSize({ width: size, height: size });
  // Maskable: full-bleed background, artwork inside the 80 % safe zone.
  const art = maskable ? size * 0.78 : size;
  await page.setContent(`<html><body style="margin:0;background:${maskable ? '#050916' : 'transparent'};display:grid;place-items:center;width:${size}px;height:${size}px">
    <div style="width:${art}px;height:${art}px">${svg.replace('<svg ', `<svg style="width:100%;height:100%" `)}</div></body></html>`);
  await page.screenshot({ path: join(DIR, name), omitBackground: !maskable });
  console.log('wrote', name);
}
await browser.close();
