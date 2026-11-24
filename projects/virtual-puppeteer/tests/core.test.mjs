import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, PROPS, SCENES, PARTICLES, GESTURES, DEFAULT_SETTINGS, findCharacter, findScene, findParticles } from '../js/config.js';
import { handMetrics, detectGesture, createRig, updateRig, tapRig, clamp, lerp, distance } from '../js/rig.js';

function landmarks(kind = 'open') {
  const lm = Array.from({ length: 21 }, (_, i) => ({ x: 0.5 + (i % 5) * 0.01, y: 0.5 + Math.floor(i / 5) * 0.01, z: 0 }));
  lm[0] = { x: 0.5, y: 0.8, z: 0 };
  lm[9] = { x: 0.5, y: 0.5, z: 0 };
  if (kind === 'pinch') {
    lm[4] = { x: 0.5, y: 0.45, z: 0 };
    lm[8] = { x: 0.51, y: 0.45, z: 0 };
  } else if (kind === 'fist') {
    [4, 8, 12, 16, 20].forEach((index) => { lm[index] = { x: 0.5, y: 0.62, z: 0 }; });
    [2, 6, 10, 14, 18].forEach((index) => { lm[index] = { x: 0.5, y: 0.55, z: 0 }; });
  } else {
    lm[4] = { x: 0.42, y: 0.4, z: 0 };
    lm[8] = { x: 0.6, y: 0.3, z: 0 };
    [12, 16, 20].forEach((index) => { lm[index] = { x: 0.5 + index * 0.005, y: 0.15, z: 0 }; });
  }
  return lm;
}

test('registry: personaggi, props, scene e gesti', () => {
  assert.ok(CHARACTERS.length >= 12);
  assert.equal(new Set(CHARACTERS.map((item) => item.id)).size, CHARACTERS.length);
  assert.ok(PROPS.length >= 6 && SCENES.length >= 4 && PARTICLES.length >= 4 && GESTURES.length >= 5);
  CHARACTERS.forEach((item) => assert.ok(item.body && item.dark && item.inner && item.tongue && item.voice));
  assert.equal(findCharacter('unknown').id, CHARACTERS[0].id);
  assert.equal(findScene('unknown').id, SCENES[0].id);
  assert.equal(findParticles('unknown').id, PARTICLES[0].id);
  assert.equal(DEFAULT_SETTINGS.scene, 'theater');
});

test('utilità rig', () => {
  assert.equal(clamp(5, 0, 1), 1);
  assert.equal(lerp(0, 10, 0.5), 5);
  assert.equal(distance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
});

test('metriche mano e gesture', () => {
  const metrics = handMetrics(landmarks('open'), 800, 600);
  assert.ok(metrics && Number.isFinite(metrics.x) && Number.isFinite(metrics.angle));
  assert.ok(metrics.open >= 0 && metrics.open <= 1);
  assert.equal(handMetrics(null, 800, 600), null);
  assert.equal(detectGesture(landmarks('pinch')), 'pinch');
  assert.equal(detectGesture(landmarks('fist')), 'fist');
  assert.equal(detectGesture(landmarks('open')), 'open');
});

test('spring rig converged verso il target', () => {
  const rig = createRig();
  const target = { x: 100, y: 80, angle: 0.4, scale: 90, open: 0.7, gesture: 'pinch' };
  for (let i = 0; i < 120; i += 1) updateRig(rig, target, 1 / 60);
  assert.ok(Math.abs(rig.x - 100) < 1);
  assert.ok(Math.abs(rig.y - 80) < 1);
  assert.ok(Math.abs(rig.open - 0.7) < 0.05);
  assert.equal(rig.gesture, 'pinch');
  const tap = tapRig(50, 60, 1000);
  assert.ok(tap.open >= 0 && tap.open <= 1);
});
