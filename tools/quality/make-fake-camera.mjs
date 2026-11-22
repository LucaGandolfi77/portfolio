#!/usr/bin/env node
/**
 * Genera un video Y4M con un QR code, usato da Chromium come fotocamera finta.
 * Payload: https://example.com/camera-e2e
 *
 * Formato: 640×480, 30 fps, 60 frame, C420jpeg. Il QR è centrato e ha un
 * margine bianco di 48 px (oltre alla quiet zone di 4 moduli).
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildMatrix } from '../../projects/qr-studio/js/qr-render.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, 'fixtures');
const OUT_FILE = join(OUT_DIR, 'qr-camera.y4m');

const WIDTH = 640;
const HEIGHT = 480;
const FPS = 30;
const FRAMES = 60;
const QR_SIZE = 384;
const QUIET = 4;
const PAYLOAD = process.env.QR_CAMERA_PAYLOAD || 'https://example.com/camera-e2e';

const require = createRequire(import.meta.url);
const qrcode = require('../../projects/qr-studio/js/vendor/qrcode-generator.js');
const matrix = buildMatrix(PAYLOAD, 'M', qrcode);
const totalModules = matrix.count + QUIET * 2;
const cell = QR_SIZE / totalModules;
const originX = Math.round((WIDTH - QR_SIZE) / 2);
const originY = Math.round((HEIGHT - QR_SIZE) / 2);

const yPlane = new Uint8Array(WIDTH * HEIGHT);
const uPlane = new Uint8Array((WIDTH / 2) * (HEIGHT / 2));
const vPlane = new Uint8Array((WIDTH / 2) * (HEIGHT / 2));
yPlane.fill(235);
uPlane.fill(128);
vPlane.fill(128);

// Sfondo leggermente grigio attorno al foglio bianco: aiuta il contrasto.
for (let y = 0; y < HEIGHT; y += 1) {
  for (let x = 0; x < WIDTH; x += 1) {
    const insidePage =
      x >= originX - 24 &&
      x < originX + QR_SIZE + 24 &&
      y >= originY - 24 &&
      y < originY + QR_SIZE + 24;
    if (!insidePage) yPlane[y * WIDTH + x] = 200;
  }
}

for (let row = 0; row < matrix.count; row += 1) {
  for (let col = 0; col < matrix.count; col += 1) {
    if (!matrix.modules[row][col]) continue;
    const left = originX + Math.round((col + QUIET) * cell);
    const right = originX + Math.round((col + QUIET + 1) * cell);
    const top = originY + Math.round((row + QUIET) * cell);
    const bottom = originY + Math.round((row + QUIET + 1) * cell);
    for (let y = top; y < bottom; y += 1) {
      for (let x = left; x < right; x += 1) {
        if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) yPlane[y * WIDTH + x] = 16;
      }
    }
  }
}

const chunks = [
  Buffer.from(`YUV4MPEG2 W${WIDTH} H${HEIGHT} F${FPS}:1 Ip A1:1 C420jpeg\n`, 'ascii')
];
for (let frame = 0; frame < FRAMES; frame += 1) {
  chunks.push(Buffer.from('FRAME\n', 'ascii'), Buffer.from(yPlane), Buffer.from(uPlane), Buffer.from(vPlane));
}

mkdirSync(OUT_DIR, { recursive: true });
const data = Buffer.concat(chunks);
writeFileSync(OUT_FILE, data);
console.log(`Fake camera: ${OUT_FILE} (${(data.length / (1024 * 1024)).toFixed(1)} MB, ${FRAMES} frame)`);
