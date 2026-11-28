#!/usr/bin/env node
/**
 * Draws games/ultimo-colore/icons/icon.svg (a paper lantern losing its
 * colour from the bottom up) and renders the PNGs with Playwright's Chromium.
 * Uso: node tools/quality/generate-ultimo-colore-icons.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'games', 'ultimo-colore', 'icons');
const body = 'M256 96 C146 96 104 190 112 262 C120 350 178 398 256 398 C334 398 392 350 400 262 C408 190 366 96 256 96 Z';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<defs><radialGradient id="bg" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#2c2a3a"/><stop offset="1" stop-color="#100c0e"/></radialGradient>
<linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8505a"/><stop offset=".36" stop-color="#f29a3c"/><stop offset=".58" stop-color="#f2d24a"/><stop offset=".62" stop-color="#cfcac0"/><stop offset="1" stop-color="#8a867f"/></linearGradient>
<radialGradient id="g" cx=".5" cy=".4" r=".5"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
<rect width="512" height="512" rx="108" fill="url(#bg)"/><circle cx="256" cy="230" r="220" fill="url(#g)"/>
<path d="M256 36 V70" stroke="#efe6d4" stroke-width="10" stroke-linecap="round"/>
<rect x="196" y="66" width="120" height="34" rx="10" fill="#241c18" stroke="#efe6d4" stroke-width="6"/>
<path d="${body}" fill="url(#c)" stroke="#1a1210" stroke-width="10"/>
<path d="M196 100 C150 180 150 320 200 392 M256 96 V398 M316 100 C362 180 362 320 312 392" stroke="#1a1210" stroke-width="5" fill="none" opacity=".45"/>
<rect x="200" y="394" width="112" height="32" rx="10" fill="#241c18" stroke="#efe6d4" stroke-width="6"/>
<path d="M256 426 V452 M256 452 q-14 14 -8 28 M256 452 q14 14 8 28" stroke="#efe6d4" stroke-width="8" fill="none" stroke-linecap="round"/>
</svg>
`;
mkdirSync(DIR, { recursive: true });
writeFileSync(join(DIR, 'icon.svg'), svg);
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, size, maskable] of [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['icon-maskable-512.png', 512, true]]) {
  await page.setViewportSize({ width: size, height: size });
  const art = maskable ? size * 0.82 : size;
  const inner = maskable ? svg.replace('rx="108" fill="url(#bg)"', 'fill="none"') : svg;
  await page.setContent(`<html><body style="margin:0;background:${maskable ? '#1c1620' : 'transparent'};display:grid;place-items:center;width:${size}px;height:${size}px">
    <div style="width:${art}px;height:${art}px">${inner.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div></body></html>`);
  await page.screenshot({ path: join(DIR, name), omitBackground: !maskable });
  console.log('wrote', name);
}
await browser.close();
