import test from 'node:test';
import assert from 'node:assert/strict';
import { imageStats, buildTransfer, applyColorTransfer, toNchw, fromNchw, blendMask, mixWeight, coverCrop } from '../js/pipeline.js';
import { History } from '../js/history.js';
import { GPU_STYLES, NEURAL_STYLES, findStyle } from '../js/styles.js';

const solid = (r, g, b, n = 16) => {
  const a = new Uint8ClampedArray(n * n * 4);
  for (let i = 0; i < a.length; i += 4) { a[i] = r; a[i + 1] = g; a[i + 2] = b; a[i + 3] = 255; }
  return a;
};

test('image stats of a solid color have zero deviation', () => {
  const s = imageStats(solid(120, 80, 40));
  assert.ok(Math.abs(s.mean[0] - (0.299 * 120 + 0.587 * 80 + 0.114 * 40)) < 1);
  assert.ok(s.std.every(v => v >= 1));
});

test('color transfer shifts a solid image toward the style mean', () => {
  const c = imageStats(solid(100, 100, 100));
  const s = imageStats(solid(200, 50, 20));
  const transfer = buildTransfer(c, s);
  const out = applyColorTransfer(solid(100, 100, 100), transfer, 1);
  assert.notEqual(out[0], 100);
  assert.equal(out[3], 255);
});

test('zero strength keeps the source image', () => {
  const src = solid(100, 100, 100);
  const out = applyColorTransfer(src, () => [10, 20, 30], 0);
  assert.equal(out[0], 100);
});

test('NCHW conversion round-trips RGBA values', () => {
  const rgba = solid(12, 34, 56, 4);
  const tensor = toNchw(rgba, 4);
  assert.equal(tensor.length, 48);
  const back = fromNchw(tensor, 4);
  assert.equal(back[0], 12);
  assert.equal(back[1], 34);
  assert.equal(back[2], 56);
});

test('mask blending respects strength', () => {
  const base = solid(0, 0, 0, 2);
  const overlay = solid(200, 100, 50, 2);
  const mask = solid(255, 255, 255, 2);
  const out = blendMask(base, overlay, mask, 0.5);
  assert.equal(out[0], 100);
});

test('mix weight interpolates between styles', () => {
  assert.equal(mixWeight(10, 30, 0.5), 20);
  assert.equal(mixWeight(10, 30, 2), 30);
});

test('cover crop produces a square source region', () => {
  const c = coverCrop(1920, 1080, 512);
  assert.ok(Math.abs(c.sw - c.sh) < 1e-6);
  assert.ok(c.sx >= 0 && c.sy >= 0);
});

test('history records and interpolates keyframes', () => {
  const h = new History();
  h.add({ strength: 0, mix: 0 });
  h.add({ strength: 1, mix: 1 });
  assert.equal(h.length, 2);
  assert.equal(h.interpolate(0.5).strength, 0.5);
  assert.ok(h.serialize().includes('strength'));
  h.clear();
  assert.equal(h.length, 0);
});

test('style registries expose model URLs and presets', () => {
  assert.equal(GPU_STYLES.length, 5);
  assert.equal(NEURAL_STYLES.length, 5);
  assert.ok(NEURAL_STYLES.every(s => s.model.endsWith('-9.onnx')));
  assert.equal(findStyle('mosaic').id, 'mosaic');
});

console.log('9/9 tests passed');
