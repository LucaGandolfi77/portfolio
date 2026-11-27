#!/usr/bin/env node
/**
 * Draws games/agente-zero/icons/icon.svg (a white zero on a ball) and renders
 * the PNGs with the Playwright Chromium already used by the E2E tests.
 * Uso: node tools/quality/generate-agente-zero-icons.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'games', 'agente-zero', 'icons');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<defs><radialGradient id="bg" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#e8283f"/><stop offset="1" stop-color="#8d0a1c"/></radialGradient>
<radialGradient id="b" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="#ffab52"/><stop offset="1" stop-color="#b94a0c"/></radialGradient></defs>
<rect width="512" height="512" rx="108" fill="url(#bg)"/>
<circle cx="256" cy="256" r="188" fill="url(#b)" stroke="#2b1206" stroke-width="10"/>
<g fill="none" stroke="#2b1206" stroke-width="9"><path d="M256 68V444M68 256H444"/><path d="M123 123C196 190 196 322 123 389M389 123C316 190 316 322 389 389"/></g>
<ellipse cx="256" cy="256" rx="76" ry="112" fill="none" stroke="#2b1206" stroke-width="82"/>
<ellipse cx="256" cy="256" rx="76" ry="112" fill="none" stroke="#fff" stroke-width="58"/>
<ellipse cx="256" cy="256" rx="76" ry="112" fill="none" stroke="#d3182f" stroke-width="6"/>
</svg>
`;
mkdirSync(DIR, { recursive: true });
writeFileSync(join(DIR, 'icon.svg'), svg);

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, size, maskable] of [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['icon-maskable-512.png', 512, true]]) {
  await page.setViewportSize({ width: size, height: size });
  // Maskable: full-bleed background, artwork inside the 80 % safe zone.
  const art = maskable ? size * 0.82 : size;
  const body = maskable ? svg.replace('rx="108" fill="url(#bg)"', 'fill="none"') : svg;
  await page.setContent(`<html><body style="margin:0;background:${maskable ? '#a80f24' : 'transparent'};display:grid;place-items:center;width:${size}px;height:${size}px">
    <div style="width:${art}px;height:${art}px">${body.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div></body></html>`);
  await page.screenshot({ path: join(DIR, name), omitBackground: !maskable });
  console.log('wrote', name);
}
await browser.close();
