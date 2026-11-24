import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clamp01,
  confidenceBand,
  cosineSimilarity,
  ema,
  estimateBrightness,
  estimateSharpness,
  faceFrame,
  gridDescriptor,
  landmarkDescriptor,
  median,
  normalizeVector,
  poseFromLandmarks,
  qualityScore,
  scoreFromSimilarities,
  stretchSimilarity,
  canonicalTransform
} from '../js/metrics.js';

function faceLandmarks({ cx = 0.5, cy = 0.5, span = 0.2, angle = 0 } = {}) {
  const landmarks = Array.from({ length: 478 }, (_, i) => ({
    x: cx + (((i % 17) - 8) / 8) * span,
    y: cy + ((Math.floor(i / 17) - 14) / 14) * span,
    z: 0
  }));
  const set = (index, x, y, z = 0) => { landmarks[index] = { x, y, z }; };
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const place = (index, u, v, z = 0) => {
    set(index, cx + u * cos - v * sin, cy + u * sin + v * cos, z);
  };
  place(33, -span / 2, 0);
  place(263, span / 2, 0);
  place(1, 0, span * 0.55, span * 0.25);
  place(152, 0, span * 1.5, 0);
  place(234, -span, 0.05);
  place(454, span, 0.05);
  return landmarks;
}

function rgba(width, height, painter) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const color = painter(x, y) || 0;
      data[i] = color; data[i + 1] = color; data[i + 2] = color; data[i + 3] = 255;
    }
  }
  return data;
}

test('cosine similarity: identico, ortogonale, opposto', () => {
  assert.ok(Math.abs(cosineSimilarity([1, 2, 3], [1, 2, 3]) - 1) < 1e-6);
  assert.ok(Math.abs(cosineSimilarity([1, 0], [0, 1])) < 1e-6);
  assert.ok(Math.abs(cosineSimilarity([1, 0], [-1, 0]) + 1) < 1e-6);
  assert.equal(cosineSimilarity([], []), 0);
  assert.equal(cosineSimilarity([0, 0], [1, 1]), 0);
});

test('normalizeVector produce norma unitaria e gestisce lo zero', () => {
  const v = normalizeVector([3, 4]);
  assert.ok(Math.abs(Math.hypot(v[0], v[1]) - 1) < 1e-6);
  assert.deepEqual(Array.from(normalizeVector([0, 0])), [0, 0]);
});

test('faceFrame e canonicalTransform', () => {
  const frame = faceFrame(faceLandmarks());
  assert.ok(Math.abs(frame.cx - 0.5) < 1e-6);
  assert.ok(Math.abs(frame.distance - 0.2) < 1e-6);
  const transform = canonicalTransform(faceLandmarks());
  assert.ok(transform.scale > 0);
  assert.equal(canonicalTransform([]), null);
});

test('landmarkDescriptor è invariante a traslazione e scala', () => {
  const base = landmarkDescriptor(faceLandmarks());
  const shifted = faceLandmarks({ cx: 0.8, cy: 0.2 });
  const scaled = faceLandmarks({ cx: 0.7, cy: 0.6, span: 0.4 });
  const dShift = landmarkDescriptor(shifted);
  const dScale = landmarkDescriptor(scaled);
  assert.ok(cosineSimilarity(base, dShift) > 0.999);
  assert.ok(cosineSimilarity(base, dScale) > 0.999);
  assert.equal(base.length, 478 * 3);
});

test('landmarkDescriptor gestisce volto mancante', () => {
  assert.deepEqual(Array.from(landmarkDescriptor([])), new Array(478 * 3).fill(0));
});

test('gridDescriptor è invariante al guadagno di luminosità', () => {
  const width = 32, height = 32;
  const a = rgba(width, height, (x, y) => 40 + x * 3 + y * 2);
  const b = rgba(width, height, (x, y) => (40 + x * 3 + y * 2) * 1.25);
  const da = gridDescriptor(a, width, height);
  const db = gridDescriptor(b, width, height);
  assert.equal(da.length, 256);
  assert.ok(cosineSimilarity(da, db) > 0.995);
  assert.equal(gridDescriptor(rgba(width, height, () => 128), width, height).length, 256);
});

test('stretchSimilarity e scoreFromSimilarities sono limitati e ordinati', () => {
  assert.equal(stretchSimilarity(0.45), 0);
  assert.equal(stretchSimilarity(0.95), 1);
  assert.ok(Math.abs(stretchSimilarity(0.7) - 0.5) < 1e-9);
  const low = scoreFromSimilarities(0.5, 0.5);
  const high = scoreFromSimilarities(0.9, 0.9);
  assert.ok(high > low);
  assert.ok(clamp01(high) === high);
  assert.equal(scoreFromSimilarities(0.9, 0.9, 2), stretchSimilarity(0.9));
});

test('confidenceBand usa le soglie', () => {
  assert.equal(confidenceBand(40).key, 'low');
  assert.equal(confidenceBand(60).key, 'medium');
  assert.equal(confidenceBand(80).key, 'high');
});

test('qualityScore segnala problemi noti', () => {
  const good = qualityScore({ faceCount: 1, sizeRatio: 0.2, sharpness: 0.7, brightness: 0.5, pose: { yaw: 0 } });
  assert.equal(good.score, 1);
  assert.deepEqual(good.flags, []);
  const bad = qualityScore({ faceCount: 2, sizeRatio: 0.01, sharpness: 0.05, brightness: 0.05, pose: { yaw: 45 } });
  assert.ok(bad.score < 0.1);
  assert.ok(bad.flags.includes('multipleFaces'));
  assert.ok(bad.flags.includes('blurry'));
  assert.ok(bad.flags.includes('profile'));
  assert.deepEqual(qualityScore({ faceCount: 0 }).flags, ['noFace']);
});

test('stima contrasto, nitidezza e luminosità', () => {
  const flat = rgba(32, 32, () => 128);
  const noise = rgba(32, 32, (x, y) => (x + y) % 2 ? 0 : 255);
  assert.ok(estimateSharpness(noise, 32, 32) > estimateSharpness(flat, 32, 32));
  assert.ok(estimateBrightness(flat, 32, 32) - 0.502 < 1e-3);
  assert.ok(estimateSharpness([], 0, 0) === 0);
});

test('poseFromLandmarks restituisce roll in gradi', () => {
  const pose = poseFromLandmarks(faceLandmarks({ angle: Math.PI / 12 }));
  assert.ok(Math.abs(pose.roll - 15) < 1e-3);
  assert.deepEqual(poseFromLandmarks([]), { yaw: 0, pitch: 0, roll: 0 });
});

test('ema e median', () => {
  assert.equal(ema(0, 100, 0.5), 50);
  assert.equal(ema(undefined, 10), 10);
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 2, 3]), 2.5);
  assert.equal(median([]), 0);
});
