/**
 * Generates PWA icons (192/512 normal + maskable + favicon.svg) and initial
 * wide/tall screenshots from deterministic toy-block SVG art via sharp.
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
  const s = (size - pad * 2) * 0.62;
  const bx = cx - s * 0.44;
  const by = cy - s * 0.24;
  const bw = s * 0.88;
  const bh = s * 0.56;
  const studW = bw * 0.24;
  const studH = bh * 0.24;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1b3a4b"/>
      <stop offset="60%" stop-color="#10212e"/>
      <stop offset="100%" stop-color="#0b151e"/>
    </linearGradient>
    <linearGradient id="brick" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ff8a3d"/>
      <stop offset="100%" stop-color="#d84716"/>
    </linearGradient>
    <radialGradient id="visor" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7df9ff"/>
      <stop offset="70%" stop-color="#00b4d8"/>
      <stop offset="100%" stop-color="#006d8f"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <!-- Glowing Holo-Visor ring -->
  <circle cx="${cx}" cy="${cy}" r="${(s * 0.62).toFixed(1)}" fill="none" stroke="#48e5ff" stroke-width="${(size * 0.022).toFixed(1)}" stroke-dasharray="${(size * 0.06).toFixed(1)} ${(size * 0.03).toFixed(1)}" opacity="0.65"/>
  <!-- Top 2 brick connector pips -->
  <rect x="${(bx + bw * 0.14).toFixed(1)}" y="${(by - studH * 0.72).toFixed(1)}" width="${studW.toFixed(1)}" height="${studH.toFixed(1)}" rx="${(size * 0.025).toFixed(1)}" fill="#ff9f5a" stroke="#9e2f0a" stroke-width="${(size * 0.014).toFixed(1)}"/>
  <rect x="${(bx + bw * 0.62).toFixed(1)}" y="${(by - studH * 0.72).toFixed(1)}" width="${studW.toFixed(1)}" height="${studH.toFixed(1)}" rx="${(size * 0.025).toFixed(1)}" fill="#ff9f5a" stroke="#9e2f0a" stroke-width="${(size * 0.014).toFixed(1)}"/>
  <!-- Main orange snap-block body -->
  <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="${(size * 0.045).toFixed(1)}" fill="url(#brick)" stroke="#8c2706" stroke-width="${(size * 0.018).toFixed(1)}"/>
  <!-- Gloss highlight -->
  <rect x="${(bx + bw * 0.07).toFixed(1)}" y="${(by + bh * 0.08).toFixed(1)}" width="${(bw * 0.86).toFixed(1)}" height="${(bh * 0.16).toFixed(1)}" rx="${(size * 0.02).toFixed(1)}" fill="#ffffff" opacity="0.26"/>
  <!-- Synth-Beast glowing cyclops optic -->
  <circle cx="${cx}" cy="${(by + bh * 0.56).toFixed(1)}" r="${(bh * 0.27).toFixed(1)}" fill="#0e1a24" stroke="#ffd166" stroke-width="${(size * 0.016).toFixed(1)}"/>
  <circle cx="${cx}" cy="${(by + bh * 0.56).toFixed(1)}" r="${(bh * 0.16).toFixed(1)}" fill="url(#visor)"/>
</svg>`;
}

function screenSvg(w, h) {
  const cx = w / 2;
  const u = Math.min(w, h);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#194a63"/>
      <stop offset="55%" stop-color="#2a7f7a"/>
      <stop offset="100%" stop-color="#142b33"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <circle cx="${cx}" cy="${(h * 0.42).toFixed(0)}" r="${(u * 0.36).toFixed(0)}" fill="#ffb703" opacity="0.16"/>
  <text x="${cx}" y="${(h * 0.44).toFixed(0)}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="${(u * 0.11).toFixed(0)}" fill="#fff8eb" letter-spacing="4">BRICK-WILDS</text>
  <text x="${cx}" y="${(h * 0.53).toFixed(0)}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="${(u * 0.038).toFixed(0)}" fill="#7df9ff" letter-spacing="3">SYNTH-BEAST CHRONICLES</text>
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
console.log('Generated Brick-Wilds PWA icons and screenshots.');
