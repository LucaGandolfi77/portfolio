/* Italy 3D Flight Sim — coastline field: where the water is and how far the shore is (pure logic)
 *
 * A grid over the whole map, twice as fine as the elevation data, holding the
 * signed distance to the nearest shore (positive on land) and the level of the
 * nearest water. The terrain uses it to shape beaches, the renderer to paint them.
 */

import { WORLD } from './config.js';

/* World units. `beach` is the width of the shore ramp, `rise` how far inland the
 * relief takes to reach its full height. */
export const COAST = { beach: 40, rise: 180, beachHeight: 1.1 };
const SUBDIVIDE = 2;
const FAR = 1000;

let grid = null;

const smooth = t => { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c); };

function insidePolygon(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/* Distance from every node to the nearest source node (two-pass chamfer), also
 * carrying along the value stored at that source. */
function distanceField(cols, rows, isSource, value, dx, dz) {
  const distance = new Float32Array(cols * rows).fill(FAR);
  const carried = new Float32Array(cols * rows);
  for (let k = 0; k < distance.length; k++) {
    if (isSource(k)) { distance[k] = 0; carried[k] = value ? value[k] : 0; }
  }
  const diagonal = Math.hypot(dx, dz);
  const pass = step => {
    const neighbours = [[-step, 0, dx], [0, -step, dz], [-step, -step, diagonal], [step, -step, diagonal]];
    for (let n = 0; n < rows; n++) {
      const j = step > 0 ? n : rows - 1 - n;
      for (let m = 0; m < cols; m++) {
        const i = step > 0 ? m : cols - 1 - m;
        const k = j * cols + i;
        for (const [ox, oz, cost] of neighbours) {
          const a = i + ox, b = j + oz;
          if (a < 0 || b < 0 || a >= cols || b >= rows) continue;
          const from = b * cols + a;
          if (distance[from] + cost < distance[k]) { distance[k] = distance[from] + cost; carried[k] = carried[from]; }
        }
      }
    }
  };
  pass(1);
  pass(-1);
  return { distance, carried };
}

/* `elevation(i, j)` reads the data grid in metres. `lakes` are rings in data-grid
 * coordinates with their water level; `pads` are rectangles that must stay dry. */
export function initCoast({ width, height, elevation, lakes = [], pads = [] }) {
  const cols = (width - 1) * SUBDIVIDE + 1, rows = (height - 1) * SUBDIVIDE + 1;
  const dx = WORLD.width / (cols - 1), dz = WORLD.depth / (rows - 1);

  /* A lightly blurred land mask gives a rounded shoreline instead of square steps. */
  const mask = new Float32Array(width * height);
  const kernel = [1, 2, 1];
  const dry = (i, j) => elevation(Math.max(0, Math.min(width - 1, i)), Math.max(0, Math.min(height - 1, j))) > 0 ? 1 : 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      let sum = 0;
      for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) sum += dry(i + a, j + b) * kernel[a + 1] * kernel[b + 1];
      mask[j * width + i] = sum / 16;
    }
  }
  const land = new Uint8Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    const gy = j / SUBDIVIDE, y0 = Math.min(height - 2, Math.floor(gy)), ty = gy - y0;
    for (let i = 0; i < cols; i++) {
      const gx = i / SUBDIVIDE, x0 = Math.min(width - 2, Math.floor(gx)), tx = gx - x0;
      const k = y0 * width + x0;
      const top = mask[k] * (1 - tx) + mask[k + 1] * tx;
      const bottom = mask[k + width] * (1 - tx) + mask[k + width + 1] * tx;
      land[j * cols + i] = top * (1 - ty) + bottom * ty > 0.5 ? 1 : 0;
    }
  }

  const water = new Float32Array(cols * rows);
  for (const lake of lakes) {
    const xs = lake.ring.map(p => p[0]), ys = lake.ring.map(p => p[1]);
    const i0 = Math.max(0, Math.floor(Math.min(...xs) * SUBDIVIDE)), i1 = Math.min(cols - 1, Math.ceil(Math.max(...xs) * SUBDIVIDE));
    const j0 = Math.max(0, Math.floor(Math.min(...ys) * SUBDIVIDE)), j1 = Math.min(rows - 1, Math.ceil(Math.max(...ys) * SUBDIVIDE));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        if (!insidePolygon(i / SUBDIVIDE, j / SUBDIVIDE, lake.ring)) continue;
        land[j * cols + i] = 0;
        water[j * cols + i] = lake.level;
      }
    }
  }

  for (const pad of pads) {
    const reach = Math.hypot(pad.along, pad.across);
    const i0 = Math.max(0, Math.floor((pad.x - reach + WORLD.width / 2) / dx)), i1 = Math.min(cols - 1, Math.ceil((pad.x + reach + WORLD.width / 2) / dx));
    const j0 = Math.max(0, Math.floor((pad.z - reach + WORLD.depth / 2) / dz)), j1 = Math.min(rows - 1, Math.ceil((pad.z + reach + WORLD.depth / 2) / dz));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const ox = i * dx - WORLD.width / 2 - pad.x, oz = j * dz - WORLD.depth / 2 - pad.z;
        if (Math.abs(ox * pad.dir.x + oz * pad.dir.z) <= pad.along && Math.abs(-ox * pad.dir.z + oz * pad.dir.x) <= pad.across) land[j * cols + i] = 1;
      }
    }
  }

  const toWater = distanceField(cols, rows, k => !land[k], water, dx, dz);
  const toLand = distanceField(cols, rows, k => land[k], null, dx, dz);
  const half = (dx + dz) / 4;
  const raw = new Float32Array(cols * rows);
  for (let k = 0; k < raw.length; k++) raw[k] = land[k] ? toWater.distance[k] - half : half - toLand.distance[k];
  const distance = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let sum = 0;
      for (let b = -1; b <= 1; b++) {
        for (let a = -1; a <= 1; a++) {
          const x = Math.max(0, Math.min(cols - 1, i + a)), y = Math.max(0, Math.min(rows - 1, j + b));
          sum += raw[y * cols + x] * kernel[a + 1] * kernel[b + 1];
        }
      }
      distance[j * cols + i] = sum / 16;
    }
  }
  grid = { cols, rows, distance, level: toWater.carried };
  return grid;
}

function sample(field, x, z) {
  const { cols, rows } = grid;
  const gx = Math.max(0, Math.min(cols - 1.001, (x + WORLD.width / 2) / WORLD.width * (cols - 1)));
  const gz = Math.max(0, Math.min(rows - 1.001, (z + WORLD.depth / 2) / WORLD.depth * (rows - 1)));
  const i = Math.floor(gx), j = Math.floor(gz), tx = gx - i, tz = gz - j;
  const k = j * cols + i;
  return (field[k] * (1 - tx) + field[k + 1] * tx) * (1 - tz) + (field[k + cols] * (1 - tx) + field[k + cols + 1] * tx) * tz;
}

/* Signed distance to the shore in world units: positive on land, negative on water. */
export const coastDistance = (x, z) => grid ? sample(grid.distance, x, z) : FAR;
export const waterLevel = (x, z) => grid ? sample(grid.level, x, z) : 0;
export const coastGrid = () => grid;

/* Ground height from the shore profile and the relief height at the same point. */
export function shoreHeight(distance, level, relief) {
  if (distance <= 0) return level;
  const inland = Math.max(0, relief - COAST.beachHeight) * smooth((distance - COAST.beach * 0.5) / COAST.rise);
  return level * (1 - smooth(distance / COAST.rise)) + COAST.beachHeight * smooth(distance / COAST.beach) + inland;
}
