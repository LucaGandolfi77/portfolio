/* Italy 3D Flight Sim — geographic coordinate and elevation helpers (pure) */

import { WORLD } from './config.js';

let heightData = null;
let meta = null;
let vectors = null;

export function initGeo(heightBuffer, metaJson, vectorJson) {
  heightData = heightBuffer;
  meta = metaJson;
  vectors = vectorJson;
  const w = meta.width, h = meta.height;
  const smooth = new Float32Array(w * h);
  const at = (x, y) => heightData.getInt16((Math.max(0, Math.min(h - 1, y)) * w + Math.max(0, Math.min(w - 1, x))) * 2, true);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      smooth[y * w + x] = (
        at(x, y) * 4 +
        at(x - 1, y) * 2 + at(x + 1, y) * 2 + at(x, y - 1) * 2 + at(x, y + 1) * 2 +
        at(x - 1, y - 1) + at(x + 1, y - 1) + at(x - 1, y + 1) + at(x + 1, y + 1)
      ) / 16;
    }
  }
  smoothed = smooth;
}

let smoothed = null;

export function geoToWorld(lon, lat) {
  return {
    x: (lon - WORLD.minLon) / (WORLD.maxLon - WORLD.minLon) * WORLD.width - WORLD.width / 2,
    z: -(lat - WORLD.minLat) / (WORLD.maxLat - WORLD.minLat) * WORLD.depth + WORLD.depth / 2
  };
}

export function worldToGeo(x, z) {
  return {
    lon: WORLD.minLon + (x + WORLD.width / 2) / WORLD.width * (WORLD.maxLon - WORLD.minLon),
    lat: WORLD.minLat - (z - WORLD.depth / 2) / WORLD.depth * (WORLD.maxLat - WORLD.minLat)
  };
}

export function elevationAt(lon, lat) {
  if (!heightData || !meta) return 0;
  const gx = (lon - meta.bbox.minLon) / (meta.bbox.maxLon - meta.bbox.minLon) * (meta.width - 1);
  const gy = (meta.bbox.maxLat - lat) / (meta.bbox.maxLat - meta.bbox.minLat) * (meta.height - 1);
  const x0 = Math.max(0, Math.min(meta.width - 2, Math.floor(gx)));
  const y0 = Math.max(0, Math.min(meta.height - 2, Math.floor(gy)));
  const tx = Math.max(0, Math.min(1, gx - x0));
  const ty = Math.max(0, Math.min(1, gy - y0));
  const at = (x, y) => smoothed
    ? smoothed[y * meta.width + x]
    : heightData.getInt16((y * meta.width + x) * 2, true);
  const a = at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx;
  const b = at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx;
  return a * (1 - ty) + b * ty;
}

export function terrainHeight(x, z) {
  const { lon, lat } = worldToGeo(x, z);
  return Math.max(0, elevationAt(lon, lat)) * WORLD.elevScale;
}

export function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function insideItaly(lon, lat) {
  if (!vectors) return false;
  return vectors.coastline.some(ring => pointInRing(lon, lat, ring));
}

export function worldPolygon(ring) {
  return ring.map(([lon, lat]) => geoToWorld(lon, lat));
}

export function vectorData() { return vectors; }
export function geoMeta() { return meta; }
