// scripts/make-icons.mjs — generate PWA PNG icons (no dependencies)
// Draws a rounded-square gradient tile with a terminal "chevron + cursor" glyph.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "icons");
mkdirSync(OUT, { recursive: true });

/* ---------------- tiny PNG encoder ---------------- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------------- drawing helpers ---------------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

function hex(c) {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
}

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = clamp(t, 0, 1);
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function roundedRectAlpha(px, py, size, radius) {
  const half = size / 2;
  const cx = clamp(px, radius - half, half - radius);
  const cy = clamp(py, radius - half, half - radius);
  const d = Math.hypot(px - cx, py - cy);
  return clamp(half - radius - d + 1, 0, 1);
}

/** Draw one icon. size in px; pad = margin fraction for the glyph (maskable safe zone). */
function drawIcon(size, { pad = 0.08, glyph = 0.9 } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const S = size;
  const top = hex("#22315f");
  const bot = hex("#0a0e1f");
  const cTop = hex("#22315f");
  const cBot = hex("#3a1c52");
  const white = hex("#ffffff");
  const accent = hex("#6ea8ff");
  const glow = hex("#22d3ee");

  // glyph geometry (relative to S), scaled by glyph
  const g = glyph;
  const cx = 0.5 * S;
  const cy = 0.5 * S;
  const chevronA = [(0.5 - 0.17 * g) * S, (0.5 - 0.155 * g) * S];
  const chevronB = [(0.5 + 0.02 * g) * S, 0.5 * S];
  const chevronC = [(0.5 - 0.17 * g) * S, (0.5 + 0.155 * g) * S];
  const w = 0.058 * S;
  // cursor: short rounded bar right of the chevron
  const barX0 = (0.5 + 0.075 * g) * S;
  const barY0 = (0.5 - 0.032 * g) * S;
  const barW = 0.12 * g * S;
  const barH = 0.064 * S;
  const r = 3;

  const ss = 2; // 2x2 supersampling
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let R = 0, G = 0, B = 0, A = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const px = x + (sx + 0.5) / ss;
          const py = y + (sy + 0.5) / ss;

          // background tile with diagonal gradient
          const t = (px / S + py / S) / 2;
          let cr = lerp(top[0], bot[0], t);
          let cg = lerp(top[1], bot[1], t);
          let cb = lerp(top[2], bot[2], t);
          let alpha = roundedRectAlpha(px, py, S, 0.16 * S);

          // soft radial accent glow lower-right
          const gd = Math.hypot(px - 0.82 * S, py - 0.86 * S) / (0.6 * S);
          if (gd < 1) {
            const k = (1 - gd) * 0.5;
            cr = lerp(cr, cTop[0], k); cg = lerp(cg, cTop[1], k); cb = lerp(cb, cTop[2], k);
          }
          const gd2 = Math.hypot(px - 0.18 * S, py - 0.16 * S) / (0.55 * S);
          if (gd2 < 1) {
            const k = (1 - gd2) * 0.4;
            cr = lerp(cr, cBot[0], k); cg = lerp(cg, cBot[1], k); cb = lerp(cb, cBot[2], k);
          }

          // chevron distance to the two segments
          const d1 = segDist(px, py, chevronA[0], chevronA[1], chevronB[0], chevronB[1]);
          const d2 = segDist(px, py, chevronB[0], chevronB[1], chevronC[0], chevronC[1]);
          const d = Math.min(d1, d2);
          const cov = clamp(w / 2 - d + 0.7, 0, 1);
          if (cov > 0) {
            cr = lerp(cr, white[0], cov); cg = lerp(cg, white[1], cov); cb = lerp(cb, white[2], cov);
          }
          // glow under chevron
          const glowCov = clamp(0.09 * S - d, 0, 1) * 0.35;
          if (glowCov > 0) {
            cr = lerp(cr, glow[0], glowCov); cg = lerp(cg, glow[1], glowCov); cb = lerp(cb, glow[2], glowCov);
          }

          // cursor bar (rounded rect)
          const bx0 = barX0 + r, by0 = barY0 + r;
          const bx1 = barX0 + barW - r, by1 = barY0 + barH - r;
          const bd = Math.hypot(
            clamp(px, bx0, bx1) - px,
            clamp(py, by0, by1) - py
          );
          const bcov = clamp(r - bd + 0.7, 0, 1);
          if (bcov > 0) {
            cr = lerp(cr, accent[0], bcov); cg = lerp(cg, accent[1], bcov); cb = lerp(cb, accent[2], bcov);
          }

          // maskable padding: cut outer 20% for maskable variants
          const padFrac = pad; // caller passes 0.2 for maskable
          if (padFrac > 0) {
            const m = Math.min(
              clamp((px - padFrac * S) / 4 + 0.5, 0, 1) + clamp((S - padFrac * S - px) / 4 + 0.5, 0, 1),
              1
            );
            // rounded alpha already cut corners; multiply
            alpha *= clamp((px - padFrac * S + 6) / 6, 0, 1) * clamp((S - padFrac * S - px + 6) / 6, 0, 1);
          }

          R += cr * alpha; G += cg * alpha; B += cb * alpha; A += alpha * 255;
        }
      }
      const n = ss * ss;
      const i = (y * S + x) * 4;
      rgba[i] = clamp(R / n, 0, 255);
      rgba[i + 1] = clamp(G / n, 0, 255);
      rgba[i + 2] = clamp(B / n, 0, 255);
      rgba[i + 3] = clamp(A / n, 0, 255);
    }
  }
  return encodePng(S, S, rgba);
}

const files = [
  ["icon-192.png", 192, 0],
  ["icon-512.png", 512, 0],
  ["icon-maskable-512.png", 512, 0.2],
];
for (const [name, size, pad] of files) {
  writeFileSync(path.join(OUT, name), drawIcon(size, { pad }));
  console.log("wrote", name, `(${size}x${size})`);
}
