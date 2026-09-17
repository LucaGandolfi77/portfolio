#!/usr/bin/env node
/**
 * generate-icons.mjs
 *
 * Genera le icone PNG della PWA senza dipendenze esterne: un rasterizzatore
 * minimale (anti-aliasing via supersampling) + un encoder PNG scritto a mano.
 *
 * Uso:
 *   npm run icons
 *
 * Output in public/icons/:
 *   icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png (180)
 *
 * Il soggetto: un medaglione color crema con otto ruote disposte in cerchio
 * (le otto ruote di una squadra di pattinaggio sincronizzato) e una stellina
 * champagne al centro. Semplice e leggibile anche a 40px.
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'public', 'icons');
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
    raw[y * (stride + 1)] = 0; // filtro none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------- disegno vettoriale */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;

function mix(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

/**
 * Le lettere della sigla, disegnate a mano come segmenti.
 *
 * Niente canvas e niente dipendenze: ogni lettera è definita in un rettangolo
 * 0..1 e ogni tratto è un segmento con uno spessore. Con "M", "P" e "T" bastano
 * nove segmenti, e la resa resta pulita anche a 40 px.
 */
const GLYPHS = {
  M: [
    [[0.06, 1.0], [0.06, 0.0]],
    [[0.06, 0.0], [0.36, 0.58]],
    [[0.36, 0.58], [0.66, 0.0]],
    [[0.66, 0.0], [0.66, 1.0]],
  ],
  P: [
    [[0.08, 1.0], [0.08, 0.0]],
    [[0.08, 0.0], [0.5, 0.0]],
    [[0.5, 0.0], [0.66, 0.22]],
    [[0.66, 0.22], [0.5, 0.46]],
    [[0.5, 0.46], [0.08, 0.46]],
  ],
  T: [
    [[0.0, 0.0], [0.72, 0.0]],
    [[0.36, 0.0], [0.36, 1.0]],
  ],
};

/** Quanto è "dentro" il punto (x,y) rispetto a un segmento spesso. */
function segmentCoverage(x, y, x1, y1, x2, y2, thickness, aa) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq === 0 ? 0 : ((x - x1) * dx + (y - y1) * dy) / lengthSq;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return clamp01((thickness / 2 - Math.hypot(x - cx, y - cy)) / aa + 0.5);
}

/**
 * Copertura della sigla in un punto, in coordinate 0..1 rispetto al blocco.
 * Restituisce 0..1, così da poter comporre il colore come per il resto.
 */
function glyphMaskCoverage(text, blockX, x, y, aa) {
  const letters = [...text];
  const widths = { M: 0.72, P: 0.66, T: 0.72 };
  const tracking = 0.26; // spazio tra le lettere, in unità di larghezza
  // Larghezza totale, per normalizzare tutto dentro il blocco 0..1.
  const total =
    letters.reduce((sum, c) => sum + widths[c], 0) + tracking * (letters.length - 1);

  let cursor = 0;
  let best = 0;

  for (const char of letters) {
    const w = widths[char] / total;
    const start = cursor / total;
    if (x >= start - 0.06 && x <= start + w + 0.06) {
      const localX = (x - start) / w;
      for (const [[ax, ay], [bx, by]] of GLYPHS[char]) {
        const cover = segmentCoverage(localX, y, ax, ay, bx, by, 0.22, aa / (blockX * w));
        if (cover > best) best = cover;
      }
    }
    cursor += widths[char] + tracking;
  }
  return best;
}

/**
 * Distanza con segno da un rettangolo con angoli arrotondati.
 * (Non usata dal disegno attuale, ma resta utile per varianti future.)
 */
export function roundedRectSdf(px, py, cx, cy, halfW, halfH, r) {
  const qx = Math.abs(px - cx) - (halfW - r);
  const qy = Math.abs(py - cy) - (halfH - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

const CREAM = [253, 246, 240];
const BLUSH = [244, 208, 221];
const ROSE = [231, 159, 180];
const LAVENDER = [226, 220, 247];
const ICE = [214, 235, 246];
const GOLD = [227, 199, 149];
const GOLD_DEEP = [140, 111, 63];
const FLAG_GREEN = [14, 138, 82];
const FLAG_WHITE = [246, 242, 236];
const FLAG_RED = [208, 69, 90];

/** Stella a quattro punte: |dx|^p + |dy|^p <= r^p con p<1 (punte concave) e concave. */
const STAR_P = 0.5;

/**
 * Colore di un pixel in coordinate 0..1, con anti-aliasing calcolato dal SDF.
 * `maskable` riduce la scala del soggetto per rispettare la zona di sicurezza.
 */
function sample(u, v, size, maskable) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = maskable ? 0.7 : 1;
  const R = size * 0.44 * scale;
  const aa = Math.max(1, size / 300);

  const d = Math.hypot(u - cx, v - cy);

  // 1. Sfondo: gradiente verticale crema -> rosa cipria.
  let color = mix(CREAM, BLUSH, clamp01(v / size));

  // 2. Medaglione: gradiente diagonale panna -> lavanda/ghiaccio.
  const inside = clamp01((R - d) / aa + 0.5);
  const medallion = mix(
    [255, 253, 250],
    mix(LAVENDER, ICE, clamp01(v / size)),
    clamp01((u + v) / (size * 2.2)),
  );
  color = mix(color, medallion, inside);

  // 3. Bordo champagne del medaglione.
  const border = clamp01((size * 0.014 - Math.abs(d - (R - size * 0.014))) / aa + 0.5);
  color = mix(color, GOLD, border * 0.85);

  // 4. Le otto ruote della squadra, disposte a corona.
  //    La corona è sollevata di 0.08 R così la sigla in basso respira.
  const wheelRingX = R * 0.56;
  const wheelRingY = R * 0.5;
  const wheelCy = cy - R * 0.08;
  const wheelR = R * 0.112;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const wx = cx + Math.cos(a) * wheelRingX;
    const wy = wheelCy + Math.sin(a) * wheelRingY;
    const dw = Math.hypot(u - wx, v - wy);
    const cover = clamp01((wheelR - dw) / aa + 0.5);
    if (cover > 0) {
      // Ogni ruota ha una sfumatura diversa: rosa, lavanda, ghiaccio.
      const tone = mix(mix(ROSE, LAVENDER, (i % 3) / 2), ICE, i % 2 === 0 ? 0.18 : 0);
      color = mix(color, tone, cover);
    }
    const hubCover = clamp01((wheelR * 0.36 - dw) / aa + 0.5);
    if (hubCover > 0) color = mix(color, [255, 255, 255], hubCover * 0.9);
  }

  // 5. Traccia della pista: cerchio sottile attorno alle ruote.
  const trackR = R * 0.79;
  const track = clamp01((size * 0.0065 - Math.abs(d - trackR)) / aa + 0.5);
  color = mix(color, GOLD, track * 0.55);

  // 6. Stellina champagne al centro delle ruote.
  const starR = R * 0.17;
  const dx = Math.abs(u - cx) / starR;
  const dy = Math.abs(v - wheelCy) / starR;
  const star = Math.pow(dx, STAR_P) + Math.pow(dy, STAR_P); // 1 sul bordo della stella
  const starCover = clamp01(((1 - star) * starR) / aa + 0.5);
  if (starCover > 0) {
    color = mix(color, mix(GOLD, [255, 246, 230], 0.4), starCover);
    const core = clamp01(((0.42 - star) * starR) / aa + 0.5);
    color = mix(color, GOLD_DEEP, core * 0.35);
  }

  // 7. Scintille discrete agli angoli del medaglione.
  const sparkles = [
    [cx - R * 1.1, cy - R * 0.78, R * 0.1],
    [cx + R * 1.06, cy + R * 0.72, R * 0.08],
    [cx + R * 0.72, cy - R * 1.12, R * 0.07],
  ];
  for (const [sx, sy, sr] of sparkles) {
    const sdx = Math.abs(u - sx) / sr;
    const sdy = Math.abs(v - sy) / sr;
    const s = Math.pow(sdx, STAR_P) + Math.pow(sdy, STAR_P);
    const cov = clamp01((1 - s) * sr / aa + 0.5);
    if (cov > 0) color = mix(color, GOLD, cov * 0.9);
  }

  // 8. Anello tricolore, sottile, subito dentro il bordo champagne.
  const flagR = R * 0.91;
  const flagWidth = size * 0.016;
  const flagCover = clamp01((flagWidth - Math.abs(d - flagR)) / aa + 0.5);
  if (flagCover > 0) {
    // -90° in alto, come una bandiera che gira: verde, bianco, rosso.
    const angle = (Math.atan2(v - cy, u - cx) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    const third = angle / ((Math.PI * 2) / 3);
    const flagColor = third < 1 ? FLAG_GREEN : third < 2 ? FLAG_WHITE : FLAG_RED;
    color = mix(color, flagColor, flagCover * 0.95);
  }

  // 9. Sigla della squadra (MPT) nella parte bassa del medaglione.
  {
    // Il blocco è alto 1 e largo 1: le lettere riempiono la larghezza, quindi
    // normalizziamo x sul blocco e y sull'altezza delle lettere.
    const letters = 'MPT';
    const textW = R * 0.6;
    const textH = R * 0.19;
    const blockX = cx - textW / 2;
    const blockY = cy - textH * 0.5 + R * 0.52;
    const bx = (u - blockX) / textW;
    const by = (v - blockY) / textH;
    if (bx > -0.12 && bx < 1.12 && by > -0.3 && by < 1.3) {
      const cover = glyphMaskCoverage(letters, textW, bx, by, aa);
      if (cover > 0) {
        // Lastra chiara dietro le lettere: le rende leggibili sul disco.
        color = mix(color, [255, 253, 250], 0.55);
        color = mix(color, GOLD_DEEP, cover * 0.94);
      }
    }
  }

  return [color[0], color[1], color[2], 255];
}

/** Rasterizza con supersampling 3x3: bordi puliti anche a dimensioni piccole. */
function render(size, maskable) {
  const SS = 3;
  const rgba = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const u = x + (sx + 0.5) / SS;
          const v = y + (sy + 0.5) / SS;
          const px = sample(u, v, size, maskable);
          r += px[0];
          g += px[1];
          b += px[2];
          a += px[3];
        }
      }
      const n = SS * SS;
      const i = (y * size + x) * 4;
      rgba[i] = Math.round(r / n);
      rgba[i + 1] = Math.round(g / n);
      rgba[i + 2] = Math.round(b / n);
      rgba[i + 3] = Math.round(a / n);
    }
  }

  return encodePng(size, size, rgba);
}

const targets = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-maskable-512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
];

for (const { file, size, maskable } of targets) {
  const png = render(size, maskable);
  writeFileSync(join(outDir, file), png);
  process.stdout.write(`✓ ${file} (${size}×${size}, ${(png.length / 1024).toFixed(1)} kB)\n`);
}

process.stdout.write(`\nIcone scritte in ${outDir}\n`);

