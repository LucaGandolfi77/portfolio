#!/usr/bin/env node
/**
 * Draws games/shake-me/icons/icon.svg (a shaker and a coupe on dark wood)
 * and renders the PNGs with the Playwright Chromium used by the E2E tests.
 * Uso: node tools/quality/generate-shake-me-icons.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'games', 'shake-me', 'icons');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<defs><radialGradient id="bg" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#4a3222"/><stop offset="1" stop-color="#1d140f"/></radialGradient>
<linearGradient id="m" x1="0" x2="1"><stop offset="0" stop-color="#9aa6b2"/><stop offset=".45" stop-color="#eef2f6"/><stop offset="1" stop-color="#8a96a2"/></linearGradient></defs>
<rect width="512" height="512" rx="108" fill="url(#bg)"/>
<g transform="rotate(-14 200 260)">
<path d="M130 190 L270 190 L252 420 L148 420 Z" fill="url(#m)" stroke="#5e6a76" stroke-width="8"/>
<path d="M142 190 L160 120 L240 120 L258 190 Z" fill="url(#m)" stroke="#5e6a76" stroke-width="8"/>
<rect x="176" y="84" width="48" height="40" rx="10" fill="url(#m)" stroke="#5e6a76" stroke-width="8"/>
<path d="M150 240 L250 240" stroke="#fff" stroke-width="8" opacity=".55"/>
</g>
<path d="M286 232 L462 232 L384 330 L384 430 L426 446 L342 446 L370 430 L370 330 Z" fill="rgba(240,248,255,.2)" stroke="#f4ead8" stroke-width="9" stroke-linejoin="round"/>
<path d="M300 244 L448 244 L377 322 Z" fill="#d9a54a"/>
<circle cx="440" cy="232" r="20" fill="#c8102e"/>
<path d="M440 212 C446 190 460 178 474 172" stroke="#3a7a2a" stroke-width="7" fill="none" stroke-linecap="round"/>
</svg>
`;
mkdirSync(DIR, { recursive: true });
writeFileSync(join(DIR, 'icon.svg'), svg);
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, size, maskable] of [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['icon-maskable-512.png', 512, true]]) {
  await page.setViewportSize({ width: size, height: size });
  const art = maskable ? size * 0.82 : size;
  const body = maskable ? svg.replace('rx="108" fill="url(#bg)"', 'fill="none"') : svg;
  await page.setContent(`<html><body style="margin:0;background:${maskable ? '#2a1d15' : 'transparent'};display:grid;place-items:center;width:${size}px;height:${size}px">
    <div style="width:${art}px;height:${art}px">${body.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div></body></html>`);
  await page.screenshot({ path: join(DIR, name), omitBackground: !maskable });
  console.log('wrote', name);
}
await browser.close();
