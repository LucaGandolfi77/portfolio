/* Italy 3D Flight Sim — terrain chunks and their level of detail (pure logic)
 *
 * The map is cut into square-ish chunks. Each is built from the height function at
 * a resolution that depends on how far it is from the aircraft.
 */

import { WORLD } from './config.js';
import { airfields } from './airfields.js';
import { coastDistance, waterLevel } from './coast.js';
import { terrainHeight } from './geo.js';

export const COLS = 32;
export const ROWS = 26;
export const CHUNK = { width: WORLD.width / COLS, depth: WORLD.depth / ROWS };
/* Quads per side: near, middle, far. */
export const SEGMENTS = { high: [48, 22, 10], low: [34, 16, 8] };
export const RANGE = { high: { near: 900, middle: 2400, detail: 1500 }, low: { near: 550, middle: 1400, detail: 900 } };
const HYSTERESIS = 120;
const SKIRT = 6;

export const chunkOrigin = (col, row) => ({
  x: -WORLD.width / 2 + col * CHUNK.width,
  z: -WORLD.depth / 2 + row * CHUNK.depth
});

/* Distance on the ground from a point to the nearest part of a chunk. */
export function chunkDistance(col, row, x, z) {
  const o = chunkOrigin(col, row);
  const dx = Math.max(o.x - x, 0, x - o.x - CHUNK.width);
  const dz = Math.max(o.z - z, 0, z - o.z - CHUNK.depth);
  return Math.hypot(dx, dz);
}

/* Open sea is perfectly flat, so one quad is enough at any range. */
export function isOpenWater(col, row) {
  const o = chunkOrigin(col, row);
  const steps = 14;
  for (let j = 0; j <= steps; j++) {
    for (let i = 0; i <= steps; i++) {
      const x = o.x + i / steps * CHUNK.width, z = o.z + j / steps * CHUNK.depth;
      if (coastDistance(x, z) > -45 || waterLevel(x, z) !== 0) return false;
    }
  }
  return true;
}

export function hasAirfield(col, row) {
  return airfields().some(f => chunkDistance(col, row, f.x, f.z) < 180);
}

/* 0 near, 1 middle, 2 far. A chunk keeps its level until it is clearly past a limit. */
export function chunkLevel(distance, quality = 'high', current = null, airfield = false) {
  const range = RANGE[quality] || RANGE.high;
  const limit = (value, level) => value + (current !== null && current <= level ? HYSTERESIS : 0);
  /* Runways need the fine grid as soon as they can be made out. */
  if (distance <= limit(airfield ? range.middle : range.near, 0)) return 0;
  if (distance <= limit(range.middle, 1)) return 1;
  return 2;
}

/* Vertex data for one chunk, with a skirt hanging from its edges to hide cracks
 * between neighbours of different detail. */
export function chunkData(col, row, segments, height = terrainHeight) {
  const o = chunkOrigin(col, row);
  const dx = CHUNK.width / segments, dz = CHUNK.depth / segments;
  const side = segments + 1;
  /* One extra ring of samples so normals match across chunk edges. */
  const wide = segments + 3;
  const samples = new Float32Array(wide * wide);
  for (let j = 0; j < wide; j++) {
    for (let i = 0; i < wide; i++) samples[j * wide + i] = height(o.x + (i - 1) * dx, o.z + (j - 1) * dz);
  }
  const skirt = side * 4;
  const positions = new Float32Array((side * side + skirt) * 3);
  const normals = new Float32Array(positions.length);
  for (let j = 0; j < side; j++) {
    for (let i = 0; i < side; i++) {
      const k = (j * side + i) * 3, s = (j + 1) * wide + i + 1;
      positions[k] = o.x + i * dx; positions[k + 1] = samples[s]; positions[k + 2] = o.z + j * dz;
      const nx = -(samples[s + 1] - samples[s - 1]) / (2 * dx);
      const nz = -(samples[s + wide] - samples[s - wide]) / (2 * dz);
      const length = Math.hypot(nx, 1, nz);
      normals[k] = nx / length; normals[k + 1] = 1 / length; normals[k + 2] = nz / length;
    }
  }
  const index = new Uint16Array(segments * segments * 6 + segments * 4 * 12);
  let n = 0;
  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < segments; i++) {
      const a = j * side + i, b = a + side, c = b + 1, d = a + 1;
      index.set([a, b, d, b, c, d], n);
      n += 6;
    }
  }
  const edges = [
    i => i, i => (side - 1) * side + i,
    i => i * side, i => i * side + side - 1
  ];
  edges.forEach((edge, e) => {
    const base = side * side + e * side;
    for (let i = 0; i < side; i++) {
      const from = edge(i) * 3, to = (base + i) * 3;
      positions.set(positions.subarray(from, from + 3), to);
      positions[to + 1] -= SKIRT;
      normals.set(normals.subarray(from, from + 3), to);
    }
    for (let i = 0; i < segments; i++) {
      const a = edge(i), b = edge(i + 1), c = base + i, d = base + i + 1;
      /* Both windings, so the skirt shows from whichever side the crack is seen. */
      index.set([a, c, b, b, c, d, a, b, c, b, d, c], n);
      n += 12;
    }
  });
  return { positions, normals, index };
}
