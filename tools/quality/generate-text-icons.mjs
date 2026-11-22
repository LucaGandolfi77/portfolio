#!/usr/bin/env node
/**
 * Genera le icone PNG di Text Lab senza dipendenze esterne.
 * Uso: node tools/quality/generate-text-icons.mjs
 */

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'projects', 'text-lab', 'icons');
const SS = 4;

const COLORS = { bgTop: '#0a0d16', bgBottom: '#101a2e', accent: '#00e5ff', pink: '#ff7ab8' };

function hex(value) {
  const clean = value.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16)
  ];
}

const BG_TOP = hex(COLORS.bgTop);
const BG_BOTTOM = hex(COLORS.bgBottom);
const ACCENT = hex(COLORS.accent);
const PINK = hex(COLORS.pink);

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function insideRoundedRect(x, y, left, top, width, height, radius) {
  if (x < left || y < top || x > left + width || y > top + height) return false;
  const r = Math.min(radius, width / 2, height / 2);
  if (!r) return true;
  const cx = Math.min(Math.max(x, left + r), left + width - r);
  const cy = Math.min(Math.max(y, top + r), top + height - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

function insideRing(x, y, left, top, width, height, radius, thickness) {
  return (
    insideRoundedRect(x, y, left, top, width, height, radius) &&
    !insideRoundedRect(x, y, left + thickness, top + thickness, width - thickness * 2, height - thickness * 2, Math.max(0, radius - thickness))
  );
}

function insideLine(x, y, x1, y1, x2, y2, thickness) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = dx * dx + dy * dy;
  const t = length ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / length)) : 0;
  const px = x1 + t * dx;
  const py = y1 + t * dy;
  return (x - px) ** 2 + (y - py) ** 2 <= (thickness / 2) ** 2;
}

function fill(buffer, size, predicate, color) {
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!predicate(x + 0.5, y + 0.5)) continue;
      const index = (y * size + x) * 4;
      buffer[index] = color[0];
      buffer[index + 1] = color[1];
      buffer[index + 2] = color[2];
      buffer[index + 3] = color[3] ?? 255;
    }
  }
}

function paintBackground(buffer, size, rounded, scale) {
  const half = size / 2;
  const toDesign = (value) => (value - half) / scale + 256;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = toDesign(x + 0.5);
      const dy = toDesign(y + 0.5);
      if (rounded && !insideRoundedRect(dx, dy, 0, 0, 512, 512, 112)) continue;
      const t = Math.min(1, Math.max(0, (dx + dy) / 1024));
      let r = lerp(BG_TOP[0], BG_BOTTOM[0], t);
      let g = lerp(BG_TOP[1], BG_BOTTOM[1], t);
      let b = lerp(BG_TOP[2], BG_BOTTOM[2], t);
      const gx = dx - 100;
      const gy = dy - 60;
      const glow = Math.max(0, 1 - Math.sqrt(gx * gx + gy * gy) / 470);
      const alpha = 0.24 * glow * glow;
      r = lerp(r, ACCENT[0], alpha);
      g = lerp(g, ACCENT[1], alpha);
      b = lerp(b, ACCENT[2], alpha);
      const index = (y * size + x) * 4;
      buffer[index] = Math.round(r);
      buffer[index + 1] = Math.round(g);
      buffer[index + 2] = Math.round(b);
      buffer[index + 3] = 255;
    }
  }
}

function draw(buffer, size, scale) {
  const half = size / 2;
  const dx = (value) => (value - half) / scale + 256;
  const dy = (value) => (value - half) / scale + 256;
  const predicate = (fn) => (x, y) => fn(dx(x), dy(y));

  fill(buffer, size, predicate((x, y) => insideRing(x, y, 144, 92, 224, 296, 22, 18)), ACCENT);
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 282, 92, 368, 178, 16)), ACCENT);
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 282, 92, 282, 178, 16)), ACCENT);
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 282, 178, 368, 178, 16)), ACCENT);
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 188, 236, 306, 236, 16)), PINK);
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 188, 286, 320, 286, 16)), PINK);
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 188, 336, 280, 336, 16)), PINK);

  // angoli di scansione
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 88, 156, 88, 122, 16)), ACCENT);
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 88, 122, 122, 122, 16)), ACCENT);
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 368, 100, 402, 100, 16)), ACCENT);
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 402, 100, 402, 134, 16)), ACCENT);
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 424, 356, 424, 390, 16)), ACCENT);
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 424, 390, 390, 390, 16)), ACCENT);
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 144, 412, 110, 412, 16)), ACCENT);
  fill(buffer, size, predicate((x, y) => insideLine(x, y, 110, 412, 110, 378, 16)), ACCENT);
}

function downsample(buffer, size, factor) {
  const width = size / factor;
  const out = new Uint8ClampedArray(width * width * 4);
  for (let y = 0; y < width; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < factor; sy += 1) {
        for (let sx = 0; sx < factor; sx += 1) {
          const index = ((y * factor + sy) * size + (x * factor + sx)) * 4;
          const alpha = buffer[index + 3] / 255;
          r += buffer[index] * alpha;
          g += buffer[index + 1] * alpha;
          b += buffer[index + 2] * alpha;
          a += alpha;
        }
      }
      const count = factor * factor;
      const index = (y * width + x) * 4;
      if (a === 0) {
        out[index] = out[index + 1] = out[index + 2] = out[index + 3] = 0;
      } else {
        out[index] = Math.round(r / a);
        out[index + 1] = Math.round(g / a);
        out[index + 2] = Math.round(b / a);
        out[index + 3] = Math.round((a / count) * 255);
      }
    }
  }
  return { pixels: out, width };
}

function crcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

const CRC = crcTable();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuffer, data]);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

function encodePng(pixels, width, height) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const offset = y * (width * 4 + 1);
    raw[offset] = 0;
    Buffer.from(pixels.buffer, pixels.byteOffset + y * width * 4, width * 4).copy(raw, offset + 1);
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
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function render(size, { rounded, contentScale }) {
  const work = size * SS;
  const buffer = new Uint8ClampedArray(work * work * 4);
  paintBackground(buffer, work, rounded, contentScale * SS);
  draw(buffer, work, contentScale * SS);
  const { pixels, width } = downsample(buffer, work, SS);
  return encodePng(pixels, width, width);
}

const ICONS = [
  ['icon-192.png', 192, { rounded: true, contentScale: 1 }],
  ['icon-512.png', 512, { rounded: true, contentScale: 1 }],
  ['icon-maskable-512.png', 512, { rounded: false, contentScale: 0.74 }],
  ['apple-touch-icon.png', 180, { rounded: false, contentScale: 0.86 }]
];

mkdirSync(OUT, { recursive: true });
for (const [name, size, options] of ICONS) {
  const png = render(size, options);
  writeFileSync(join(OUT, name), png);
  console.log(`${name} — ${size}×${size}, ${(png.length / 1024).toFixed(1)} kB`);
}
