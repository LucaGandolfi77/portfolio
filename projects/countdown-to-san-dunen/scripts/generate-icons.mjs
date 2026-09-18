#!/usr/bin/env node
/**
 * generate-icons.mjs — genera le icone PNG della PWA senza dipendenze.
 *
 * Soggetto: una ruota di bicicletta (la bici è il mezzo ufficiale della
 * Compagnia) su fondo crema-ambra, con cerchio vino e raggi dorati.
 *
 * Uso:  npm run icons
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'icons');
mkdirSync(outDir, { recursive: true });

/* ------------------------------------------------------------------ PNG */

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------- disegno */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

const CREAM = [253, 244, 232];
const AMBER_SOFT = [240, 185, 106];
const PAPER = [255, 253, 248];
const WINE = [168, 50, 74];
const GOLD = [224, 184, 120];
const GOLD_DEEP = [201, 138, 46];

/** Distanza di un punto da un segmento spesso: serve per i raggi. */
function segmentCoverage(x, y, x1, y1, x2, y2, thickness, aa) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((x - x1) * dx + (y - y1) * dy) / lenSq;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return clamp01((thickness / 2 - Math.hypot(x - cx, y - cy)) / aa + 0.5);
}

function sample(u, v, size, maskable) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = maskable ? 0.72 : 1;
  const R = size * 0.42 * scale;
  const aa = Math.max(1, size / 300);
  const d = Math.hypot(u - cx, v - cy);

  // 1. Sfondo crema -> ambra
  let color = mix(CREAM, AMBER_SOFT, clamp01(v / size));

  // 2. Disco di carta con bordo dorato
  const dentro = clamp01((R - d) / aa + 0.5);
  color = mix(color, mix(PAPER, mix(CREAM, AMBER_SOFT, 0.25), clamp01((u + v) / (size * 2.1))), dentro);
  const bordo = clamp01((size * 0.012 - Math.abs(d - (R - size * 0.012))) / aa + 0.5);
  color = mix(color, GOLD, bordo * 0.9);

  // 3. Cerchione: gomma in vino
  const tyreR = R * 0.66;
  const tyreW = R * 0.11;
  const tyre = clamp01((tyreW / 2 - Math.abs(d - tyreR)) / aa + 0.5);
  color = mix(color, WINE, tyre);

  // 4. Raggio interno dorato
  const rimR = R * 0.57;
  const rim = clamp01((R * 0.022 - Math.abs(d - rimR)) / aa + 0.5);
  color = mix(color, GOLD_DEEP, rim * 0.85);

  // 5. Otto raggi
  const hubR = R * 0.1;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x1 = cx + Math.cos(a) * hubR;
    const y1 = cy + Math.sin(a) * hubR;
    const x2 = cx + Math.cos(a) * rimR;
    const y2 = cy + Math.sin(a) * rimR;
    const cov = segmentCoverage(u, v, x1, y1, x2, y2, R * 0.028, aa);
    if (cov > 0) color = mix(color, GOLD, cov * 0.9);
  }

  // 6. Mozzo
  const hub = clamp01((hubR - d) / aa + 0.5);
  color = mix(color, WINE, hub);
  const hubLuce = clamp01((hubR * 0.4 - Math.hypot(u - (cx - hubR * 0.25), v - (cy - hubR * 0.25))) / aa + 0.5);
  color = mix(color, [255, 255, 255], hubLuce * 0.5);

  // 7. Scintille
  const sparkles = [
    [cx - R * 0.92, cy - R * 0.72, R * 0.085],
    [cx + R * 0.88, cy + R * 0.66, R * 0.07],
  ];
  for (const [sx, sy, sr] of sparkles) {
    const sdx = Math.abs(u - sx) / sr;
    const sdy = Math.abs(v - sy) / sr;
    const s = Math.pow(sdx, 0.5) + Math.pow(sdy, 0.5);
    const cov = clamp01(((1 - s) * sr) / aa + 0.5);
    if (cov > 0) color = mix(color, GOLD_DEEP, cov * 0.9);
  }

  return [color[0], color[1], color[2], 255];
}

function render(size, maskable) {
  const SS = 3;
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const px = sample(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS, size, maskable);
          r += px[0]; g += px[1]; b += px[2];
        }
      }
      const n = SS * SS;
      const i = (y * size + x) * 4;
      rgba[i] = Math.round(r / n);
      rgba[i + 1] = Math.round(g / n);
      rgba[i + 2] = Math.round(b / n);
      rgba[i + 3] = 255;
    }
  }
  return encodePng(size, size, rgba);
}

for (const { file, size, maskable } of [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-maskable-512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
]) {
  const png = render(size, maskable);
  writeFileSync(join(outDir, file), png);
  process.stdout.write(`✓ ${file} (${size}×${size}, ${(png.length / 1024).toFixed(1)} kB)\n`);
}
process.stdout.write(`\nIcone scritte in ${outDir}\n`);
