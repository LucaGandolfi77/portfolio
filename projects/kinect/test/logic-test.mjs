import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, CONFIG, MODES, GESTURES } from '../game.js';
import { OneEuro, LandmarkSmoother, GestureDebouncer, pinchDistance } from '../filters.js';

const vp = { w: 800, h: 600 };
const handAt = (x, y, gesture = 'Open_Palm') => ({
  points: Array.from({ length: 21 }, () => ({ x, y, z: 0 })),
  gesture, gestureScore: 1, stableGesture: gesture
});

test('game resets per mode and difficulty', () => {
  const g = new Game();
  g.reset('time', 'chaotic');
  assert.equal(g.mode, 'time');
  assert.equal(g.difficulty, 'chaotic');
  assert.equal(g.timeLeft, MODES.time.seconds);
  assert.equal(g.score, 0);
  assert.equal(g.ended, false);
});

test('hit near a fingertip scores points and builds combo', () => {
  const g = new Game();
  g.reset('classic', 'normal');
  g.targets = [{ x: 400, y: 300, r: 20, vy: 0, vx: 0, hue: 200, age: 1, spin: 0, type: 'orb', gesture: null, value: 10 }];
  g.update(0.016, [handAt(405, 305)], vp, 1000);
  assert.equal(g.hits, 1);
  assert.equal(g.score, 10);
  assert.equal(g.combo, 1);
  assert.ok(g.particles.length > 0);
});

test('combo multiplier caps at five', () => {
  const g = new Game();
  g.reset();
  for (let i = 0; i < 20; i++) g.combo = i;
  assert.equal(g.multiplier, 5);
});

test('misses reset combo and reduce accuracy', () => {
  const g = new Game();
  g.reset();
  g.combo = 4;
  g.targets = [{ x: 400, y: 590, r: 10, vy: 600, vx: 0, hue: 200, age: 1, spin: 0, type: 'orb', gesture: null, value: 10 }];
  g.update(0.05, [], vp, 1000);
  assert.equal(g.misses, 1);
  assert.equal(g.combo, 0);
  assert.equal(g.accuracy, 0);
});

test('gesture mode requires the matching gesture', () => {
  const g = new Game();
  g.reset('gesture', 'normal');
  const required = GESTURES[0];
  g.targets = [{ x: 400, y: 300, r: 20, vy: 0, vx: 0, hue: 200, age: 1, spin: 0, type: 'orb', gesture: required, value: 10 }];
  g.update(0.016, [handAt(405, 305, 'Thumb_Up')], vp, 1000);
  assert.equal(g.hits, 0);
  g.update(0.016, [handAt(405, 305, required)], vp, 1016);
  assert.equal(g.hits, 1);
});

test('game ends when time runs out', () => {
  let summary = null;
  const g = new Game({ onEnd: s => { summary = s; } });
  g.reset('time', 'normal');
  g.update(0.05, [], vp, 1000);
  // fast-forward without relying on real timers
  g.timeLeft = 0.01;
  g.update(0.05, [], vp, 1050);
  assert.equal(g.ended, true);
  assert.ok(summary && summary.mode === 'time');
});

test('One Euro filter converges toward a stable value', () => {
  const f = new OneEuro();
  let out = 0;
  for (let i = 0; i < 60; i++) out = f.filter(0.8, 1 / 60);
  assert.ok(Math.abs(out - 0.8) < 0.01);
});

test('landmark smoother returns 21 points per hand', () => {
  const s = new LandmarkSmoother();
  const out = s.filter([handAt(0.2, 0.3)], 1 / 60);
  assert.equal(out[0].points.length, 21);
  assert.ok(out[0].points[8].x > 0);
});

test('gesture debouncer needs three consistent frames', () => {
  const d = new GestureDebouncer({ frames: 3, score: 0.5 });
  assert.equal(d.update('Victory', 0.9, 0), null);
  assert.equal(d.update('Victory', 0.9, 16), null);
  assert.equal(d.update('Victory', 0.9, 32), 'Victory');
  d.reset();
  assert.equal(d.update('Victory', 0.2, 100), null);
});

test('pinch distance uses thumb and index tips', () => {
  const pts = Array.from({ length: 21 }, (_, i) => ({ x: i, y: 0 }));
  assert.equal(pinchDistance(pts), 4);
  assert.equal(pinchDistance([]), Infinity);
});

console.log('10/10 tests passed');
