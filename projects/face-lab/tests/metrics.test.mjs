import test from 'node:test';
import assert from 'node:assert/strict';

import {
  M68, CHAINS, clamp, clamp01, lerp, blendScore, eyeAspectRatio, blinkScore,
  classifyEmotion, faceMetrics, faceBox, boxToScreen, poseFromLandmarks, lmToScreen,
  setMirror
} from '../js/metrics.js';

function landmarks() {
  const list = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  const set = (i, x, y, z = 0) => { list[i] = { x, y, z }; };
  set(33, 0.4, 0.45); set(263, 0.6, 0.45);
  set(160, 0.42, 0.42); set(158, 0.38, 0.42);
  set(153, 0.42, 0.48); set(144, 0.38, 0.48);
  set(362, 0.62, 0.45); set(385, 0.64, 0.42); set(387, 0.58, 0.42);
  set(373, 0.64, 0.48); set(380, 0.58, 0.48);
  set(1, 0.5, 0.58, 0.04); set(13, 0.5, 0.7); set(14, 0.5, 0.74);
  set(234, 0.3, 0.5); set(454, 0.7, 0.5);
  set(152, 0.5, 0.85); set(10, 0.5, 0.2); set(0, 0.5, 0.72);
  set(4, 0.5, 0.6); set(50, 0.34, 0.6); set(280, 0.66, 0.6);
  return list;
}

test('mappa 68 e catene sono valide', () => {
  assert.equal(M68.length, 68);
  assert.equal(new Set(M68).size, 68);
  assert.ok(M68.every((i) => i >= 0 && i < 478));
  for (const key of Object.keys(CHAINS)) {
    if (key === 'connectors') continue;
    assert.ok(CHAINS[key].every((i) => i >= 0 && i < 68), key);
  }
});

test('clamp, clamp01 e lerp', () => {
  assert.equal(clamp(5, 0, 3), 3);
  assert.equal(clamp01(-2), 0);
  assert.equal(lerp(0, 10, 0.25), 2.5);
});

test('EAR e blink reagiscono all\'apertura degli occhi', () => {
  const open = [[0, 0], [0.4, -0.15], [0.5, 0.15], [0.8, 0], [0.5, -0.15], [0.4, 0.15]];
  const closed = [[0, 0], [0.4, 0], [0.5, 0], [0.8, 0], [0.5, 0], [0.4, 0]];
  assert.ok(eyeAspectRatio(open) > 0.2);
  assert.equal(eyeAspectRatio(closed), 0);
  assert.ok(blinkScore(0.25, 0.25, 0) < 0.3);
  assert.equal(blinkScore(0, 0, 0), 1);
  assert.ok(blinkScore(0.3, 0.3, 0.9) > 0.85);
});

test('blendScore e classificazione emozioni', () => {
  const categories = [{ categoryName: 'mouthSmileLeft', score: 0.8 }, { categoryName: 'jawOpen', score: 0.2 }];
  assert.equal(blendScore(categories, 'mouthSmileLeft'), 0.8);
  assert.equal(blendScore(categories, 'missing'), 0);
  const base = { smile: 0, brow: 0, jawOpen: 0, wink: false, browDown: 0, frown: 0 };
  assert.equal(classifyEmotion({ ...base, smile: 0.9 }).emotion, 'happy');
  assert.equal(classifyEmotion({ ...base, wink: true }).emotion, 'wink');
  assert.equal(classifyEmotion(base).emotion, 'neutral');
});

test('faceMetrics ritorna valori limitati', () => {
  const metrics = faceMetrics(landmarks(), [{ categoryName: 'mouthSmileRight', score: 0.7 }]);
  for (const key of ['blink', 'smile', 'brow', 'jawOpen']) {
    assert.ok(metrics[key] >= 0 && metrics[key] <= 1, key);
  }
  assert.ok(Number.isFinite(metrics.mNose));
  assert.ok(Number.isFinite(metrics.pose.yaw));
  const empty = faceMetrics([]);
  assert.equal(empty.emotion, 'neutral');
});

test('poseFromLandmarks usa la matrice quando disponibile', () => {
  const matrix = [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1];
  const pose = poseFromLandmarks(landmarks(), matrix);
  assert.ok(Math.abs(pose.yaw - Math.PI / 2) < 1e-6);
  assert.ok(Math.abs(pose.pitch) < 1e-6);
  assert.ok(Math.abs(pose.roll) < 1e-6);
});

test('faceBox gestisce lo specchio', () => {
  const lm = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  lm[0] = { x: 0.2, y: 0.3, z: 0 };
  lm[1] = { x: 0.6, y: 0.7, z: 0 };
  setMirror(false);
  const normal = faceBox(lm);
  setMirror(true);
  const mirrored = faceBox(lm);
  assert.ok(Math.abs(normal.cx - 0.4) < 1e-6);
  assert.ok(Math.abs(mirrored.cx - 0.6) < 1e-6);
  setMirror(true);
});

test('boxToScreen e lmToScreen usano il layout', () => {
  const layout = { offX: 10, offY: 20, drawW: 100, drawH: 200 };
  const box = boxToScreen({ cx: 0.6, cy: 0.5, w: 0.2, h: 0.2 }, layout);
  assert.equal(box.x, 60);
  assert.equal(box.y, 100);
  assert.equal(box.w, 20);
  assert.equal(box.h, 40);
  setMirror(false);
  const point = lmToScreen([{ x: 0.25, y: 0.5 }], 0, layout);
  assert.equal(point.x, 35);
  setMirror(true);
});
