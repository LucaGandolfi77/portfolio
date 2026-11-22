import test from 'node:test';
import assert from 'node:assert/strict';

import {
  analyzeTeethPixels,
  blendScores,
  emotionFrom,
  eyeAspectRatio,
  faceMetrics,
  mouthBox,
  overallStars,
  poseFromMatrix,
  smileResult
} from '../js/vision.js';

function blankLandmarks() {
  return Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
}

function openFace({ closed = false, smile = 0.8, jaw = 0.5, brow = 0 } = {}) {
  const lm = blankLandmarks();
  const set = (index, x, y) => {
    lm[index] = { x, y, z: 0 };
  };

  // occhi aperti/chiusi
  set(33, 0.36, 0.5);
  set(160, 0.38, closed ? 0.5 : 0.48);
  set(158, 0.4, closed ? 0.5 : 0.48);
  set(133, 0.42, 0.5);
  set(153, 0.4, closed ? 0.5 : 0.52);
  set(144, 0.38, closed ? 0.5 : 0.52);

  set(362, 0.58, 0.5);
  set(385, 0.6, closed ? 0.5 : 0.48);
  set(387, 0.62, closed ? 0.5 : 0.48);
  set(263, 0.64, 0.5);
  set(373, 0.62, closed ? 0.5 : 0.52);
  set(380, 0.6, closed ? 0.5 : 0.52);

  set(234, 0.25, 0.5);
  set(454, 0.75, 0.5);
  set(61, 0.35, 0.65);
  set(291, 0.65, 0.65);
  set(13, 0.5, 0.65);
  set(1, 0.5, 0.55);
  set(152, 0.5, 0.8);

  // bocca interna
  for (let i = 0; i < 20; i += 1) {
    const angle = (Math.PI * 2 * i) / 20;
    set(
      [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 12, 13, 82, 81, 80, 191][i],
      0.5 + Math.cos(angle) * 0.11,
      0.65 + Math.sin(angle) * 0.035
    );
  }

  const categories = [
    { categoryName: 'mouthSmileLeft', score: smile },
    { categoryName: 'mouthSmileRight', score: smile },
    { categoryName: 'jawOpen', score: jaw },
    { categoryName: 'browInnerUp', score: brow },
    { categoryName: 'browOuterUpLeft', score: brow },
    { categoryName: 'browOuterUpRight', score: brow },
    { categoryName: 'eyeBlinkLeft', score: closed ? 0.95 : 0.05 },
    { categoryName: 'eyeBlinkRight', score: closed ? 0.95 : 0.05 },
    { categoryName: 'mouthFrownLeft', score: 0.02 },
    { categoryName: 'mouthFrownRight', score: 0.02 }
  ];
  return { landmarks: lm, categories };
}

function teethPixels(width = 64, height = 32, { bright = true } = {}) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const inside = bright && y >= 6 && y <= 22 && x > 4 && x < width - 5;
      const value = inside ? 238 : 40;
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = inside ? 230 : 38;
      data[index + 3] = 255;
    }
  }
  return { data, width, height };
}

test('blendScores converte le categorie MediaPipe', () => {
  assert.deepEqual(blendScores([{ categoryName: 'jawOpen', score: 0.5 }]), { jawOpen: 0.5 });
  assert.deepEqual(blendScores(null), {});
});

test('eyeAspectRatio e blink distinguono occhi aperti e chiusi', () => {
  const open = openFace();
  const closed = openFace({ closed: true });
  const openMetrics = faceMetrics(open.landmarks, open.categories);
  const closedMetrics = faceMetrics(closed.landmarks, closed.categories);
  assert.ok(openMetrics.earL > 0.3);
  assert.equal(closedMetrics.earL, 0);
  assert.ok(closedMetrics.blink > 0.9);
  assert.ok(openMetrics.blink < 0.3);
});

test('smile: bocca aperta aumenta il punteggio, chiusa lo riduce', () => {
  const open = openFace({ jaw: 0.6, smile: 0.9 });
  const closed = openFace({ jaw: 0, smile: 0.9 });
  const openMetrics = faceMetrics(open.landmarks, open.categories);
  const closedMetrics = faceMetrics(closed.landmarks, closed.categories);
  assert.ok(openMetrics.smile > closedMetrics.smile);
  assert.ok(openMetrics.smile > 0.5);
  assert.ok(closedMetrics.smile < 0.35);
});

test('head pose: matrice identità e fallback landmark', () => {
  const identity = poseFromMatrix([1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
  assert.deepEqual(identity, { yaw: 0, pitch: -0, roll: 0 });
  assert.equal(poseFromMatrix(null), null);
  const face = openFace();
  const metrics = faceMetrics(face.landmarks, face.categories);
  assert.ok(Math.abs(metrics.pose.yaw) < 1);
  assert.ok(Math.abs(metrics.pose.roll) < 1);
});

test('emozioni: happy, wink e neutral', () => {
  assert.equal(emotionFrom({ smile: 0.9, brow: 0, blink: 0, jawOpen: 0.4, blend: {}, wink: 0 }).emotion, 'happy');
  assert.equal(emotionFrom({ smile: 0, brow: 0, blink: 0.9, jawOpen: 0, blend: {}, wink: 1 }).emotion, 'wink');
  assert.equal(emotionFrom({ smile: 0, brow: 0, blink: 0, jawOpen: 0, blend: {}, wink: 0 }).emotion, 'neutral');
});

test('mouthBox restituisce un box clampato', () => {
  const face = openFace();
  const box = mouthBox(face.landmarks, 1000, 500);
  assert.ok(box.w > 100);
  assert.ok(box.h > 20);
  assert.ok(box.x >= 0 && box.y >= 0);
  assert.ok(box.x + box.w <= 1000);
  assert.ok(box.y + box.h <= 500);
  assert.equal(mouthBox(null, 100, 100), null);
});

test('analisi pixel: denti chiari e allineati battono un frame scuro', () => {
  const good = teethPixels();
  const result = analyzeTeethPixels(good.data, good.width, good.height);
  assert.ok(result.whiteness > 70, `whiteness ${result.whiteness}`);
  assert.ok(result.alignment > 40, `alignment ${result.alignment}`);
  assert.ok(result.teethRatio > 0.1);

  const dark = teethPixels(64, 32, { bright: false });
  const darkResult = analyzeTeethPixels(dark.data, dark.width, dark.height);
  assert.equal(darkResult.whiteness, 0);
  assert.equal(darkResult.alignment, 0);
});

test('smileResult combina metrica e denti', () => {
  const face = openFace({ jaw: 0.6, smile: 0.9 });
  const metrics = faceMetrics(face.landmarks, face.categories);
  const teeth = { whiteness: 80, alignment: 70, teethRatio: 0.25 };
  const result = smileResult(metrics, teeth);
  assert.ok(result.smile > 50);
  assert.equal(result.whiteness, 80);
  assert.equal(result.alignment, 70);
  assert.ok(result.overall > 50);
  assert.equal(result.stars, overallStars(result.overall));

  const noTeeth = smileResult(metrics, null);
  assert.equal(noTeeth.whiteness, 0);
  assert.equal(noTeeth.alignment, 0);
  assert.ok(noTeeth.overall < result.overall);
});

test('overallStars segue le soglie', () => {
  assert.equal(overallStars(95), 5);
  assert.equal(overallStars(75), 4);
  assert.equal(overallStars(55), 3);
  assert.equal(overallStars(30), 2);
  assert.equal(overallStars(0), 1);
});
