#!/usr/bin/env node
/**
 * Genera un video Y4M con un volto reale per la fotocamera finta di Chromium.
 * Usa Chromium (già installato da Playwright) per decodificare il ritratto e
 * convertire un frame in YUV420; Node ripete il frame.
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const INPUT = join(ROOT, 'assets', 'cv_gandolfi.jpeg');
const OUT_DIR = join(HERE, 'fixtures');
const OUTPUT = join(OUT_DIR, 'face-camera.y4m');

const WIDTH = 640;
const HEIGHT = 480;
const FPS = 30;
const FRAMES = 180;

const photo = readFileSync(INPUT).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
const frameBase64 = await page.evaluate(
  async ({ base64, width, height }) => {
    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + base64;
    await img.decode();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#101010';
    ctx.fillRect(0, 0, width, height);

    // Ritaglio 4:3 attorno al viso del ritratto originale.
    ctx.drawImage(img, 280, 380, 700, 525, 0, 0, width, height);
    const rgba = ctx.getImageData(0, 0, width, height).data;

    const yPlane = new Uint8Array(width * height);
    const uPlane = new Uint8Array((width / 2) * (height / 2));
    const vPlane = new Uint8Array((width / 2) * (height / 2));

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4;
        const r = rgba[i];
        const g = rgba[i + 1];
        const b = rgba[i + 2];
        yPlane[y * width + x] = Math.max(
          16,
          Math.min(235, Math.round(16 + 0.257 * r + 0.504 * g + 0.098 * b))
        );
      }
    }

    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let dy = 0; dy < 2; dy += 1) {
          for (let dx = 0; dx < 2; dx += 1) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            r += rgba[i];
            g += rgba[i + 1];
            b += rgba[i + 2];
          }
        }
        r /= 4;
        g /= 4;
        b /= 4;
        const index = (y / 2) * (width / 2) + x / 2;
        uPlane[index] = Math.max(16, Math.min(240, Math.round(128 - 0.148 * r - 0.291 * g + 0.439 * b)));
        vPlane[index] = Math.max(16, Math.min(240, Math.round(128 + 0.439 * r - 0.368 * g - 0.071 * b)));
      }
    }

    const frame = new Uint8Array(width * height + uPlane.length + vPlane.length);
    frame.set(yPlane, 0);
    frame.set(uPlane, yPlane.length);
    frame.set(vPlane, yPlane.length + uPlane.length);

    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < frame.length; i += chunk) {
      binary += String.fromCharCode.apply(null, frame.subarray(i, i + chunk));
    }
    return btoa(binary);
  },
  { base64: photo, width: WIDTH, height: HEIGHT }
);

await browser.close();

const frame = Buffer.from(frameBase64, 'base64');
const chunks = [
  Buffer.from(`YUV4MPEG2 W${WIDTH} H${HEIGHT} F${FPS}:1 Ip A1:1 C420jpeg\n`, 'ascii')
];
for (let index = 0; index < FRAMES; index += 1) {
  chunks.push(Buffer.from('FRAME\n', 'ascii'), frame);
}
const data = Buffer.concat(chunks);
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUTPUT, data);
console.log(`Fake face camera: ${OUTPUT} (${(data.length / (1024 * 1024)).toFixed(1)} MB, ${FRAMES} frame)`);
