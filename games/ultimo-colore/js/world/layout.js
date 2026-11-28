/* ============================================================
   Ultimo Colore — the lagoon: one map for the game and Blender
   ------------------------------------------------------------
   Pure data in world units (= pixels of the painted map),
   x to the right, y downward: north is up. The Blender script
   paints exactly these shapes (scripts/export-world.mjs), and
   world/terrain.js walks on them.
   ============================================================ */

export const WORLD = { w: 2048, h: 3072, margin: 36 };
/** Tall things are painted leaning north by this share of their height. */
export const LEAN = 0.55;

const rand = (seed) => { let s = seed * 7919 + 17; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

/** An irregular island: a wobbled ellipse (round 2) or rounded block (round 4+). */
function blob(cx, cy, rx, ry, seed, wobble = 0.1, round = 2, n = 36) {
  const r = rand(seed);
  for (let i = 0; i < 3; i++) r();
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    const k = 1 + (r() - 0.5) * 2 * wobble;
    const e = 2 / round;
    return [Math.round(cx + Math.sign(c) * Math.abs(c) ** e * rx * k), Math.round(cy + Math.sign(s) * Math.abs(s) ** e * ry * k)];
  });
}

/** Dry land. `ground`: cobble (the city) or grass. */
export const ISLANDS = [
  { id: 'velaria', ground: 'cobble', poly: blob(1000, 2860, 640, 195, 1, 0.04, 5) },
  { id: 'porto', ground: 'cobble', poly: blob(1060, 2435, 580, 125, 2, 0.04, 5) },
  { id: 'reti', ground: 'grass', poly: blob(380, 1760, 190, 150, 3) },
  { id: 'brizio', ground: 'grass', poly: blob(1650, 1700, 180, 125, 4, 0.08) },
  { id: 'campo1', ground: 'grass', poly: blob(1000, 1420, 150, 105, 5, 0.08) },
  { id: 'campo2', ground: 'grass', poly: blob(1300, 500, 135, 82, 6, 0.07) },
  { id: 'radura', ground: 'grass', poly: blob(960, 215, 300, 135, 7, 0.07, 2.4) },
  // islets with nothing to do but look
  { id: 'isolotto1', ground: 'grass', poly: blob(1850, 1420, 80, 55, 8) },
  { id: 'isolotto2', ground: 'grass', poly: blob(160, 2000, 75, 60, 9) },
  { id: 'isolotto3', ground: 'grass', poly: blob(620, 1380, 60, 42, 10) },
];

/** Shallows can be waded on foot. */
export const SHALLOWS = [
  { poly: blob(420, 930, 330, 220, 21, 0.14) },
  { poly: blob(1000, 960, 420, 210, 22, 0.14) },
  { poly: blob(1580, 900, 360, 230, 23, 0.14) },
  { poly: blob(980, 1170, 240, 75, 24, 0.1) },
  { poly: blob(1260, 760, 240, 100, 25, 0.1) },
];

const rect = (x, y, w, h) => ({ x, y, w, h });

/** Bridges and piers: walkable over water. */
export const PIERS = [
  { id: 'ponte', kind: 'bridge', ...rect(948, 2505, 110, 215) },
  { id: 'molo', kind: 'pier', ...rect(1590, 2385, 185, 52) },
  { id: 'attracco-reti', kind: 'pier', ...rect(540, 1735, 80, 38) },
  { id: 'attracco-brizio', kind: 'pier', ...rect(1440, 1725, 80, 38) },
];

const H = (x, y, w, d, h, color) => ({ x, y, w, d, h, color });

/** Buildings: footprint (x, y, w, d) and height. */
export const HOUSES = [
  H(430, 2760, 150, 105, 120, '#a8654a'), H(615, 2775, 125, 95, 105, '#c2a070'), H(450, 2930, 140, 75, 95, '#7a7468'), H(625, 2940, 120, 70, 90, '#946a5a'),
  H(1290, 2750, 155, 105, 125, '#7a8a6a'), H(1478, 2765, 100, 125, 105, '#a87488'), H(1295, 2925, 150, 80, 90, '#c8b088'), H(1465, 2930, 100, 70, 85, '#8a5a48'),
  H(800, 2958, 118, 55, 80, '#b85a42'),          // Ilario's
  H(1150, 2765, 112, 82, 100, '#c98a4a'),        // Ada's bakery
  H(575, 2385, 150, 62, 95, '#6a5a68'), H(745, 2392, 125, 55, 85, '#b0885a'),
  H(1160, 2385, 140, 60, 100, '#a86a50'), H(1325, 2392, 150, 55, 90, '#6a7a70'),
  // the two crowded banks of the laundry canal
  H(615, 2185, 120, 80, 110, '#b85a42'), H(745, 2150, 120, 100, 130, '#d0a060'), H(625, 2085, 105, 70, 95, '#7a8a6a'),
  H(1085, 2155, 120, 100, 125, '#a87488'), H(1220, 2185, 115, 80, 105, '#c8b088'), H(1225, 2085, 105, 70, 90, '#8a5a48'),
];

/** Things in the way that are not houses: [x, y, radius]. */
export const TOWER = { x: 1668, y: 1650, w: 78, h: 230 };
export const WILLOWS = [
  [255, 1700, 1.0], [470, 1665, 0.8], [1760, 1760, 0.8], [900, 1370, 0.85], [1100, 1475, 0.7],
  [230, 800, 1.2], [620, 880, 1.0], [180, 1080, 1.1], [760, 1010, 0.9], [1290, 1060, 1.1], [1690, 1090, 1.0], [1840, 830, 1.2], [1500, 750, 0.9], [980, 760, 1.0], [520, 700, 0.9],
  [1390, 470, 0.8], [740, 175, 1.1], [1185, 180, 1.1], [870, 110, 0.8], [1060, 110, 0.9],
];

export const CAMPS = [{ id: 'campo1', x: 1000, y: 1420 }, { id: 'campo2', x: 1285, y: 505 }];

/**
 * Walls of reeds across the water. `gate` is the way through: it opens
 * when the named stage of the story is done.
 */
export const WALLS = [
  { id: 'canale', y: 2120, h: 56, from: 0, to: 600 },
  { id: 'canale', y: 2120, h: 56, from: 1352, to: 2048 },
  { id: 'sud', y: 1222, h: 50, from: 0, to: 2048, gap: [920, 1100] },
  { id: 'mezzo', y: 608, h: 50, from: 0, to: 2048, gap: [1215, 1385] },
  { id: 'nord', y: 372, h: 40, from: 0, to: 2048, gap: [875, 1050] },
];
/** The banks of the canal cannot be walked: houses fill them. */
export const BLOCKS = [rect(598, 2040, 282, 255), rect(1072, 2040, 282, 255)];

export const GATES = [
  { id: 'ponte', needs: 'ponte', ...rect(940, 2556, 126, 34) },
  { id: 'canale', needs: 'canale', ...rect(868, 2062, 218, 34) },
  { id: 'sud', needs: 'campo1', ...rect(912, 1222, 196, 50) },
  { id: 'mezzo', needs: 'airone', ...rect(1207, 608, 186, 50) },
  { id: 'nord', needs: 'campo2', ...rect(867, 372, 191, 40) },
];

export const SPAWN = { x: 860, y: 2900 };
/** The boat is there to board once the harbour has been reached. */
export const BOAT_AT = { x: 1815, y: 2408 };

/** Cut glass around the clearing of the stag: [x, y, height]. */
export const SHARDS = (() => {
  const r = rand(77);
  return Array.from({ length: 70 }, () => {
    const side = r() < 0.5 ? -1 : 1;
    return [Math.round(960 + side * (330 + r() * 560)), Math.round(60 + r() * 290), Math.round(30 + r() * 110)];
  });
})();
