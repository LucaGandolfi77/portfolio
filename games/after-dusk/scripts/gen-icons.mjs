/**
 * Generates PWA icons (192/512 normal + maskable + favicon.svg) and initial
 * wide/tall screenshots from deterministic SVG art via sharp.
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outIcons = join(root, 'public', 'icons');
const outScreens = join(root, 'public', 'screens');

function iconSvg(size, maskable = false) {
  const pad = maskable ? size * 0.14 : 0;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - pad * 2) * 0.34;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="sky" cx="50%" cy="42%" r="70%">
      <stop offset="0%" stop-color="#19253f"/>
      <stop offset="55%" stop-color="#0b101d"/>
      <stop offset="100%" stop-color="#05070c"/>
    </radialGradient>
    <radialGradient id="lamp" cx="50%" cy="38%" r="48%">
      <stop offset="0%" stop-color="#ffd99a" stop-opacity="0.9"/>
      <stop offset="45%" stop-color="#e59b52" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#05070c" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#sky)"/>
  <circle cx="${cx}" cy="${cy * 0.85}" r="${r * 1.45}" fill="url(#lamp)"/>
  <!-- Phone silhouette -->
  <rect x="${(cx - r * 0.56).toFixed(1)}" y="${(cy - r * 0.92).toFixed(1)}" width="${(r * 1.12).toFixed(1)}" height="${(r * 1.84).toFixed(1)}" rx="${(r * 0.2).toFixed(1)}" fill="#0e1422" stroke="#ffd99a" stroke-width="${(size * 0.018).toFixed(1)}"/>
  <rect x="${(cx - r * 0.44).toFixed(1)}" y="${(cy - r * 0.7).toFixed(1)}" width="${(r * 0.88).toFixed(1)}" height="${(r * 1.38).toFixed(1)}" rx="${(r * 0.08).toFixed(1)}" fill="#142338"/>
  <!-- Glowing call pulse -->
  <circle cx="${cx}" cy="${(cy - r * 0.06).toFixed(1)}" r="${(r * 0.22).toFixed(1)}" fill="#ffcf86"/>
  <circle cx="${cx}" cy="${(cy - r * 0.06).toFixed(1)}" r="${(r * 0.34).toFixed(1)}" fill="none" stroke="#ffcf86" stroke-width="${(size * 0.01).toFixed(1)}" opacity="0.5"/>
  <!-- Shadow eyes peeking from bottom corner -->
  <ellipse cx="${(cx - r * 0.72).toFixed(1)}" cy="${(cy + r * 0.52).toFixed(1)}" rx="${(r * 0.07).toFixed(1)}" ry="${(r * 0.045).toFixed(1)}" fill="#ff3b52"/>
  <ellipse cx="${(cx - r * 0.5).toFixed(1)}" cy="${(cy + r * 0.52).toFixed(1)}" rx="${(r * 0.07).toFixed(1)}" ry="${(r * 0.045).toFixed(1)}" fill="#ff3b52"/>
</svg>`;
}

function screenSvg(w, h) {
  const cx = w / 2;
  const cy = h * 0.46;
  const u = Math.min(w, h);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#080c17"/>
      <stop offset="55%" stop-color="#172038"/>
      <stop offset="100%" stop-color="#2b1e2c"/>
    </linearGradient>
    <radialGradient id="cone" cx="50%" cy="42%" r="48%">
      <stop offset="0%" stop-color="#ffd594" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#070910" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#dusk)"/>
  <circle cx="${cx}" cy="${cy}" r="${u * 0.42}" fill="url(#cone)"/>
  <text x="${cx}" y="${(h * 0.44).toFixed(0)}" text-anchor="middle" font-family="Georgia,serif" font-size="${(u * 0.11).toFixed(0)}" fill="#f6efe2" letter-spacing="4">AFTER DUSK</text>
  <text x="${cx}" y="${(h * 0.52).toFixed(0)}" text-anchor="middle" font-family="Inter,sans-serif" font-size="${(u * 0.036).toFixed(0)}" fill="#ffd594" letter-spacing="3">KEEP THE LINE OPEN</text>
</svg>`;
}

await mkdir(outIcons, { recursive: true });
await mkdir(outScreens, { recursive: true });

await writeFile(join(outIcons, 'favicon.svg'), iconSvg(128, false));
for (const size of [192, 512]) {
  await sharp(Buffer.from(iconSvg(size, false))).png().toFile(join(outIcons, `icon-${size}.png`));
  await sharp(Buffer.from(iconSvg(size, true))).png().toFile(join(outIcons, `maskable-${size}.png`));
}
await sharp(Buffer.from(screenSvg(1280, 720))).png().toFile(join(outScreens, 'shot-wide.png'));
await sharp(Buffer.from(screenSvg(750, 1334))).png().toFile(join(outScreens, 'shot-tall.png'));
console.log('Generated After Dusk PWA icons and initial screenshots.');
