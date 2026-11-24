import { test, eq, ok, summary } from '../../../games/_kit/test-harness.js';
import { adjust, boxBlur, sharpen, pixelate } from '../js/filters.js';
import { TOOLS, BLEND_MODES, PRESETS, PALETTE } from '../js/config.js';

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

function solid(r, g, b, a = 255) {
  const d = new Uint8ClampedArray(4 * 4 * 4);
  for (let i = 0; i < d.length; i += 4) { d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a; }
  return d;
}

run('config has 10 tools and 5 blend modes', () => {
  eq(TOOLS.length, 10); eq(BLEND_MODES.length, 5);
  ok(PALETTE.length >= 16); ok(Object.keys(PRESETS).length >= 5);
});

run('brightness raises RGB', () => {
  const o = adjust(solid(100, 100, 100), { brightness: 40 });
  ok(o[0] > 100 && o[1] > 100 && o[2] > 100);
});

run('contrast expands range', () => {
  const o = adjust(solid(100, 100, 100), { contrast: 60 });
  ok(Math.abs(o[0] - 100) > 5);
});

run('grayscale equalizes channels', () => {
  const o = adjust(solid(200, 50, 20), { grayscale: 100 });
  eq(o[0], o[1]); eq(o[1], o[2]);
});

run('invert flips color', () => {
  const o = adjust(solid(0, 255, 40, 200), { invert: 100 });
  ok(o[0] > 240 && o[1] < 15 && o[2] > 200);
  eq(o[3], 200);
});

run('box blur keeps uniform image uniform', () => {
  const o = boxBlur(solid(120, 120, 120), 4, 4, 2);
  ok(Math.abs(o[0] - 120) < 2);
});

run('sharpen preserves alpha', () => {
  const o = sharpen(solid(120, 60, 30, 128), 4, 4, 50);
  eq(o[3], 128);
});

run('pixelate averages a checkerboard', () => {
  const d = new Uint8ClampedArray(16 * 4);
  for (let i = 0; i < 16; i++) { d[i * 4] = i % 2 ? 255 : 0; d[i * 4 + 3] = 255; }
  const o = pixelate(d, 4, 4, 4);
  ok(o[0] > 0 && o[0] < 255);
});

run('adjust preserves length and alpha', () => {
  const src = solid(10, 20, 30, 77);
  const o = adjust(src, { brightness: 10, saturation: 20, hue: 30 });
  eq(o.length, src.length); eq(o[3], 77);
});

summary(passed, total);
