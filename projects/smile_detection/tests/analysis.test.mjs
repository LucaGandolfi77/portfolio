import test from 'node:test';
import assert from 'node:assert/strict';
import { softmax, entropyNormalized, topMargin, ema, fuseSmile, overallScore, clamp01 } from '../js/fusion.js';
import { rgbToLab, mouthBox, analyzeTeeth } from '../js/teeth.js';

test('softmax, entropia e margine', () => {
  const probs = softmax([0, 0, 0]);
  assert.ok(probs.every((p) => Math.abs(p - 1 / 3) < 1e-6));
  assert.ok(entropyNormalized(probs) > 0.99);
  assert.ok(topMargin(probs) < 1e-6);
  const peaked = softmax([5, 0, 0]);
  assert.ok(peaked[0] > 0.9);
  assert.ok(entropyNormalized(peaked) < 0.3);
  assert.ok(topMargin(peaked) > 0.8);
  assert.deepEqual(softmax([]), []);
});

test('fusione con gating di confidenza', () => {
  const confident = fuseSmile({ blendSmile: 0.9, happy: 0.85, probabilities: softmax([5, 0, 0, 0, 0, 0, 0]), quality: 1 });
  const ambiguous = fuseSmile({ blendSmile: 0.9, happy: 0.85, probabilities: softmax([0, 0, 0, 0, 0, 0, 0]), quality: 1 });
  assert.ok(confident.score > ambiguous.score);
  assert.ok(confident.confidence > ambiguous.confidence);
  assert.equal(confident.band, 'high');
  assert.equal(ambiguous.ambiguous, true);
  assert.equal(fuseSmile({ blendSmile: 0.1, happy: 0.1, probabilities: [] }).band, 'low');
});

test('EMA e punteggio complessivo', () => {
  assert.equal(ema(0, 1, 0.5), 0.5);
  assert.equal(ema(undefined, 0.4), 0.4);
  assert.equal(overallScore(0.8, 0.9, 0.9, 0), 80);
  assert.ok(overallScore(0.8, 0.9, 0.9, 0.2) > 80);
  assert.equal(clamp01(-3), 0);
});

test('LAB e box della bocca', () => {
  const white = rgbToLab(255, 255, 255);
  assert.ok(white.l > 99 && Math.abs(white.a) < 1 && Math.abs(white.b) < 1);
  const black = rgbToLab(0, 0, 0);
  assert.ok(black.l < 1);
  const landmarks = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  landmarks[78] = { x: 0.4, y: 0.6, z: 0 };
  landmarks[308] = { x: 0.6, y: 0.7, z: 0 };
  const box = mouthBox(landmarks, 400, 300);
  assert.ok(box && box.w > 0 && box.h > 0);
  assert.equal(mouthBox([], 400, 300), null);
});

test('analisi denti su pixel sintetici', () => {
  const width = 32, height = 24;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 4;
    pixels[offset] = 40; pixels[offset + 1] = 30; pixels[offset + 2] = 35; pixels[offset + 3] = 255;
  }
  // riga di denti bianchi allineati
  for (let x = 4; x < 28; x += 1) {
    for (let y = 10; y < 14; y += 1) {
      const offset = (y * width + x) * 4;
      pixels[offset] = 245; pixels[offset + 1] = 245; pixels[offset + 2] = 242;
    }
  }
  const result = analyzeTeeth(pixels, width, height);
  assert.ok(result.teethRatio > 0.05);
  assert.ok(result.whiteness > 0.5);
  assert.ok(result.alignment > 0.4);
  const empty = analyzeTeeth(new Uint8ClampedArray(0), 0, 0);
  assert.equal(empty.quality, 0);
});
