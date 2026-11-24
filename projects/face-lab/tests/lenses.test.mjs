import test from 'node:test';
import assert from 'node:assert/strict';

import { LENSES, CATEGORIES, STICKERS, findLens, lensesFor, clampOffset, findSticker } from '../js/lenses.js';
import { lensFilter, reactionOf, isWarpLens } from '../js/effects.js';
import { normalizeOffsets, stickerPosition, hitSticker, dragSticker } from '../js/props.js';

test('registry delle lenti: ID unici e categorie valide', () => {
  const ids = LENSES.map((lens) => lens.id);
  assert.equal(new Set(ids).size, ids.length);
  const categories = new Set(CATEGORIES.map((category) => category.id));
  for (const lens of LENSES) {
    assert.ok(categories.has(lens.category), lens.id);
    assert.ok(lens.emoji && lens.name && lens.kind, lens.id);
  }
  assert.ok(findLens('unknown').id === 'none');
  assert.ok(lensesFor('animals').length >= 4);
  assert.ok(LENSES.some((lens) => lens.kind === 'reaction'));
  assert.ok(LENSES.some((lens) => lens.kind === 'warp'));
});

test('sticker unici e offset limitati', () => {
  const ids = STICKERS.map((sticker) => sticker.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(clampOffset(9, -9), { dx: 0.6, dy: -0.6 });
  assert.ok(findSticker('crown'));
  assert.equal(findSticker('unknown'), null);
  const normalized = normalizeOffsets({ glasses: { dx: 4, dy: -4 }, bogus: { dx: 1, dy: 1 } });
  assert.deepEqual(normalized.glasses, { dx: 0.6, dy: -0.6 });
  assert.equal(normalized.bogus, undefined);
});

test('effetti: filtro CSS, warp e reazione', () => {
  assert.equal(lensFilter(findLens('neon')), 'invert(1) saturate(1.9) hue-rotate(180deg) contrast(1.25)');
  assert.equal(lensFilter(findLens('none')), 'none');
  assert.ok(isWarpLens(findLens('kaleido')));
  assert.ok(!isWarpLens(findLens('dog')));
  assert.equal(reactionOf(findLens('confetti')), 'confetti');
  assert.equal(reactionOf(findLens('none')), null);
});

test('sticker: posizione, hit test e drag', () => {
  const lm = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  lm[33] = { x: 0.4, y: 0.45, z: 0 };
  lm[263] = { x: 0.6, y: 0.45, z: 0 };
  const layout = { w: 800, h: 600, offX: 0, offY: 0, drawW: 800, drawH: 600 };
  const pos = stickerPosition('glasses', lm, layout, { dx: 0.1, dy: 0 });
  assert.ok(pos && pos.x > 400);
  assert.ok(pos.size >= 26);
  assert.equal(hitSticker(pos.x, pos.y, lm, layout, new Set(['glasses']), { glasses: { dx: 0.1, dy: 0 } }), 'glasses');
  assert.equal(hitSticker(10, 10, lm, layout, new Set(['glasses'])), null);
  const moved = dragSticker({ glasses: { dx: 0, dy: 0 } }, 'glasses', 100, 50, pos.box);
  assert.ok(moved.dx > 0 && moved.dy > 0);
});
