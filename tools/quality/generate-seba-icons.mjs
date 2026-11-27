#!/usr/bin/env node
/**
 * Draws games/seba/icons/icon.svg from the character rig and renders the PNGs
 * with the Playwright Chromium already used by the E2E tests.
 * Uso: node tools/quality/generate-seba-icons.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const GAME = join(ROOT, 'games', 'seba');
const DIR = join(GAME, 'icons');
const { sebaSVG } = await import(pathToFileURL(join(GAME, 'js', 'seba', 'rig.js')));
const { DEFAULT_OUTFIT } = await import(pathToFileURL(join(GAME, 'js', 'wardrobe.js')));
const face = sebaSVG({ expr: 'hype', outfit: DEFAULT_OUTFIT, uid: 'icon', fx: false })
  .replace('<svg ', '<svg x="48" y="42" width="416" height="451" ');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><radialGradient id="bg" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#7a3a9a"/><stop offset="1" stop-color="#1b0f2e"/></radialGradient></defs><rect width="512" height="512" rx="108" fill="url(#bg)"/>${face}</svg>`;
mkdirSync(DIR, { recursive: true });
writeFileSync(join(DIR, 'icon.svg'), svg);

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, size, maskable] of [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['icon-maskable-512.png', 512, true]]) {
  await page.setViewportSize({ width: size, height: size });
  // Maskable: full-bleed background, artwork inside the 80 % safe zone.
  const art = maskable ? size * 0.8 : size;
  await page.setContent(`<html><body style="margin:0;background:${maskable ? '#1b0f2e' : 'transparent'};display:grid;place-items:center;width:${size}px;height:${size}px">
    <div style="width:${art}px;height:${art}px">${(maskable ? svg.replace('rx="108" fill="url(#bg)"', 'fill="none"') : svg).replace('<svg ', '<svg style="width:100%;height:100%" ')}</div></body></html>`);
  await page.screenshot({ path: join(DIR, name), omitBackground: !maskable });
  console.log('wrote', name);
}
await browser.close();
