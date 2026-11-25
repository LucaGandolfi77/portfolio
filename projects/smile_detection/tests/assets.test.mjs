import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = fileURLToPath(new URL('../', import.meta.url));
const faceSource = readFileSync(path.join(projectDir, 'js/face.js'), 'utf8');
const swSource = readFileSync(path.join(projectDir, 'sw.js'), 'utf8');
const workerSource = readFileSync(path.join(projectDir, 'js/emotion-worker.js'), 'utf8');
const visionLabDir = path.resolve(projectDir, '../vision-lab');

const sharedAssets = [
  'js/vendor/mediapipe/vision_bundle.js',
  'js/vendor/mediapipe/wasm/vision_wasm_internal.js',
  'js/vendor/mediapipe/wasm/vision_wasm_internal.wasm',
  'js/vendor/mediapipe/wasm/vision_wasm_nosimd_internal.js',
  'js/vendor/mediapipe/wasm/vision_wasm_nosimd_internal.wasm',
  'model/face_landmarker.task'
];

test('face.js usa i percorsi locali corretti di vision-lab', () => {
  assert.match(faceSource, /from '\.\.\/\.\.\/vision-lab\/js\/vendor\/mediapipe\/vision_bundle\.js'/);
  assert.match(faceSource, /new URL\('\.\.\/\.\.\/vision-lab\/js\/vendor\/mediapipe\/wasm\/'/);
  assert.match(faceSource, /new URL\('\.\.\/\.\.\/vision-lab\/model\/face_landmarker\.task'/);
});

test('gli asset condivisi MediaPipe esistono', () => {
  for (const asset of sharedAssets) {
    assert.ok(existsSync(path.join(visionLabDir, asset)), `Missing asset: ${asset}`);
  }
});

test('il service worker aggiornato precarica modello e WASM', () => {
  assert.match(swSource, /pf-smile-detection-shell-v2/);
  for (const asset of sharedAssets) {
    assert.ok(swSource.includes(`../vision-lab/${asset}`), `Service worker missing: ${asset}`);
  }
});

test('il modello emozioni usa WASM diretto per evitare il fallback rotto', () => {
  assert.match(workerSource, /device:\s*'wasm'/);
  assert.doesNotMatch(workerSource, /for\s*\(const device of/);
  assert.match(workerSource, /id:\s*message\.id\s*\|\|\s*null/);
});
