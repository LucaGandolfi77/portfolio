#!/usr/bin/env node
/*
 * ortho-features.mjs — real roof colours and real trees for Fidenza.
 *
 *   node scripts/ortho-features.mjs
 *
 * - Roof colour: the AGEA 2023 orthophoto (public WMS of Regione
 *   Emilia-Romagna) is sampled inside every building footprint; the darkest
 *   and brightest pixels (shadows, glare) are dropped and the rest averaged.
 * - Trees: tree canopies are detected in the same orthophoto (green and
 *   darker than lawns), away from buildings (DBTR footprints), streets,
 *   railways, water, sport pitches and the game's own interaction points;
 *   OpenStreetMap tree rows (natural=tree_row) are planted every 7 m.
 *   The OSM trees already in the data are kept.
 *
 * Results are written into src/data/fidenza.json (buildings[].roof,
 * trees[] with source 'osm' | 'osm-row' | 'ortho').
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mosaic, rasterize, projection } from './lib/wms.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = join(root, 'src', 'data', 'fidenza.json');
const data = JSON.parse(readFileSync(dataFile, 'utf8'));
const { origin, view } = data.meta;

const orto = await mosaic('orto', origin, view);
const edifici = await mosaic('edifici', origin, view);
const W = orto.width;
const H = orto.height;
const idx = (px, pz) => pz * W + px;

/* ---------- roof colours ---------- */
let roofs = 0;
for (const b of data.buildings) {
  const samples = [];
  rasterize(b.poly, orto, (px, pz) => {
    const o = idx(px, pz) * 4;
    samples.push([orto.data[o], orto.data[o + 1], orto.data[o + 2]]);
  });
  delete b.roof;
  if (samples.length < 12) continue;
  samples.sort((a, c) => a[0] + a[1] + a[2] - (c[0] + c[1] + c[2]));
  const from = Math.floor(samples.length * 0.3);
  const to = Math.max(from + 1, Math.floor(samples.length * 0.9));
  let r = 0, g = 0, bl = 0;
  for (let i = from; i < to; i++) {
    r += samples[i][0];
    g += samples[i][1];
    bl += samples[i][2];
  }
  const n = to - from;
  /* Vegetation over a footprint (a tree hiding a small roof) is not a roof. */
  if (g / n > r / n + 8 && g / n > bl / n) continue;
  b.roof = (Math.round(r / n) << 16) | (Math.round(g / n) << 8) | Math.round(bl / n);
  roofs++;
}

/* ---------- blocked cells: where a tree must not stand ---------- */
const blocked = new Uint8Array(W * H);
const block = (px, pz) => { blocked[idx(px, pz)] = 1; };
/* Real buildings (DBTR) and game buildings. */
for (let i = 0; i < W * H; i++) if (edifici.data[i * 4 + 3] > 60) blocked[i] = 1;
for (const b of data.buildings) rasterize(b.poly, orto, block);
/* Sport pitches, platforms and the station yard. */
for (const a of data.areas) if (['sport', 'platform', 'industrial'].includes(a.kind)) rasterize(a.poly, orto, block);
/* Streets, railways, water: a corridor around the centre line. */
function corridor(pts, half) {
  for (let i = 0; i + 3 < pts.length; i += 2) {
    const ax = pts[i], az = pts[i + 1], bx = pts[i + 2], bz = pts[i + 3];
    const len = Math.hypot(bx - ax, bz - az) || 1;
    const nx = ((bz - az) / len) * half;
    const nz = (-(bx - ax) / len) * half;
    rasterize([ax + nx, az + nz, bx + nx, bz + nz, bx - nx, bz - nz, ax - nx, az - nz], orto, block);
  }
}
for (const r of data.roads) corridor(r.pts, r.w / 2 + (['footway', 'cycleway', 'path'].includes(r.kind) ? 0.8 : 1.6));
for (const r of data.railways) corridor(r.pts, 4);
for (const w of data.waterways) corridor(w.pts, Math.max(2, w.w / 2 + 1));

/* Interaction points of the game: every "x: N, z: N" literal in src/. */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.ts')) out.push(p);
  }
  return out;
}
const points = [];
for (const file of walk(join(root, 'src'))) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\bx:\s*(-?\d+(?:\.\d+)?),\s*z:\s*(-?\d+(?:\.\d+)?)/g)) points.push([Number(m[1]), Number(m[2])]);
}
const KEEP_CLEAR = 7;
const nearPoint = (x, z) => points.some(([px, pz]) => Math.abs(px - x) < KEEP_CLEAR && Math.abs(pz - z) < KEEP_CLEAR && Math.hypot(px - x, pz - z) < KEEP_CLEAR);

/* Grow the blocked mask by 1.5 m so crowns do not touch walls and kerbs. */
const grown = new Uint8Array(W * H);
for (let pz = 0; pz < H; pz++) {
  for (let px = 0; px < W; px++) {
    if (!blocked[idx(px, pz)]) continue;
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const x = px + dx, z = pz + dz;
      if (x >= 0 && z >= 0 && x < W && z < H) grown[idx(x, z)] = 1;
    }
  }
}

/* ---------- canopy detection ---------- */
const lumOf = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) lumOf[i] = 0.3 * orto.data[i * 4] + 0.59 * orto.data[i * 4 + 1] + 0.11 * orto.data[i * 4 + 2];
const canopy = new Uint8Array(W * H);
for (let pz = 2; pz < H - 2; pz++) {
  for (let px = 2; px < W - 2; px++) {
    const i = idx(px, pz);
    const r = orto.data[i * 4], g = orto.data[i * 4 + 1], b = orto.data[i * 4 + 2];
    const exg = 2 * g - r - b;
    if (!(exg > 18 && g >= r && lumOf[i] < 104)) continue;
    /* Crowns are rough (sunlit leaves next to their own shadow); fields and
       lawns are smooth. Local contrast in a 5x5 window tells them apart. */
    let sum = 0, sq = 0;
    for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
      const v = lumOf[idx(px + dx, pz + dz)];
      sum += v;
      sq += v * v;
    }
    const mean = sum / 25;
    const std = Math.sqrt(Math.max(0, sq / 25 - mean * mean));
    canopy[i] = std > 11 ? 1 : 0;
  }
}
/* No orchards of invented trees on fields and lawns mapped in OSM. */
for (const a of data.areas) if (['farmland', 'grass'].includes(a.kind)) rasterize(a.poly, orto, (px, pz) => { canopy[idx(px, pz)] = 0; });

/* Seeded random for a stable layout. */
let seed = 20231;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

const trees = data.trees.filter((t) => t.source !== 'ortho' && t.source !== 'osm-row').map((t) => ({ ...t, source: 'osm' }));
const grid = new Map();
const cellKey = (x, z) => `${Math.floor(x / 8)},${Math.floor(z / 8)}`;
function tooClose(x, z, min) {
  const cx = Math.floor(x / 8), cz = Math.floor(z / 8);
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
    for (const t of grid.get(`${cx + dx},${cz + dz}`) || []) if (Math.hypot(t.x - x, t.z - z) < min) return true;
  }
  return false;
}
function place(t) {
  trees.push(t);
  const k = cellKey(t.x, t.z);
  if (!grid.has(k)) grid.set(k, []);
  grid.get(k).push(t);
}
for (const t of trees) {
  const k = cellKey(t.x, t.z);
  if (!grid.has(k)) grid.set(k, []);
  grid.get(k).push(t);
}
const free = (x, z) => {
  const px = Math.floor(x - orto.x0), pz = Math.floor(z - orto.z0);
  if (px < 0 || pz < 0 || px >= W || pz >= H) return false;
  return !grown[idx(px, pz)] && !nearPoint(x, z);
};

/* OSM tree rows: one tree every 7 m along the line. */
const rowsCache = join(root, '.cache', 'osm-tree-rows.json');
let rows = null;
if (existsSync(rowsCache)) rows = JSON.parse(readFileSync(rowsCache, 'utf8'));
else {
  const proj = projection(origin);
  const bbox = `${proj.lat(view.maxZ)},${proj.lon(view.minX)},${proj.lat(view.minZ)},${proj.lon(view.maxX)}`;
  const query = `[out:json][timeout:120];way[natural=tree_row](${bbox});out geom;`;
  const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  for (let attempt = 0; attempt < 6 && !rows; attempt++) {
    try {
      const res = await fetch(endpoints[attempt % endpoints.length], {
        method: 'POST',
        body: new URLSearchParams({ data: query }),
        headers: { 'User-Agent': 'borgo-pwa-map-build/1.0' },
        signal: AbortSignal.timeout(150000)
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      rows = await res.json();
    } catch (err) {
      console.warn(`[ortho] ${err.message}, retrying`);
      await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
    }
  }
  if (!rows) throw new Error('Overpass unavailable');
  mkdirSync(dirname(rowsCache), { recursive: true });
  writeFileSync(rowsCache, JSON.stringify(rows));
}
const mLat = 111320;
const mLon = 111320 * Math.cos((origin.lat * Math.PI) / 180);
let rowTrees = 0;
for (const way of rows.elements || []) {
  const pts = (way.geometry || []).map((g) => [(g.lon - origin.lon) * mLon, (origin.lat - g.lat) * mLat]);
  let carry = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az] = pts[i];
    const [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    for (let d = carry; d < len; d += 7) {
      const x = ax + ((bx - ax) * d) / len;
      const z = az + ((bz - az) * d) / len;
      if (x < view.minX || x > view.maxX || z < view.minZ || z > view.maxZ) continue;
      /* Rows stand on kerbs: only buildings and interaction points block them. */
      const px = Math.floor(x - orto.x0), pz = Math.floor(z - orto.z0);
      if (blocked[idx(px, pz)] && edifici.data[idx(px, pz) * 4 + 3] > 60) continue;
      if (nearPoint(x, z) || tooClose(x, z, 4.5)) continue;
      place({ x: round(x), z: round(z), h: round(8 + rand() * 4), leaf: 'broadleaved', source: 'osm-row' });
      rowTrees++;
    }
    carry = (carry + 7 - (len % 7)) % 7;
  }
}

/* Canopy: scan 3 m cells, plant where the crown covers most of a 5x5 m window. */
const MAX_TREES = 3000;
const candidates = [];
for (let pz = 2; pz < H - 2; pz += 3) {
  for (let px = 2; px < W - 2; px += 3) {
    let c = 0;
    for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) c += canopy[idx(px + dx, pz + dz)];
    if (c < 12) continue;
    let wide = 0;
    for (let dz = -5; dz <= 5; dz += 1) for (let dx = -5; dx <= 5; dx += 1) {
      const x = px + dx, z = pz + dz;
      if (x >= 0 && z >= 0 && x < W && z < H) wide += canopy[idx(x, z)];
    }
    candidates.push({ px, pz, c, wide });
  }
}
/* Random (seeded) order: the cap must not favour one side of the map. */
for (let i = candidates.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
}
let orthoTrees = 0;
for (const cand of candidates) {
  if (trees.length >= MAX_TREES) break;
  const x = orto.x0 + cand.px + 0.5 + (rand() - 0.5) * 1.5;
  const z = orto.z0 + cand.pz + 0.5 + (rand() - 0.5) * 1.5;
  if (!free(x, z)) continue;
  /* Larger crowns (more canopy around) grow taller trees, spaced wider. */
  const big = Math.min(1, cand.wide / 70);
  const spacing = 5 + big * 3;
  if (tooClose(x, z, spacing)) continue;
  place({ x: round(x), z: round(z), h: round(6 + big * 8 + rand() * 2), leaf: 'broadleaved', source: 'ortho' });
  orthoTrees++;
}

function round(v) {
  return Math.round(v * 10) / 10;
}

data.trees = trees;
data.meta.counts.trees = trees.length;
data.meta.ortho = {
  source: 'Ortofoto AGEA 2023 (WMS Regione Emilia-Romagna)',
  attribution: 'Ortofoto AGEA 2023 via Regione Emilia-Romagna',
  roofs,
  trees: { osm: trees.filter((t) => t.source === 'osm').length, rows: rowTrees, canopy: orthoTrees }
};
writeFileSync(dataFile, JSON.stringify(data));
console.log(`[ortho] roofs ${roofs}/${data.buildings.length}; trees ${trees.length} (osm ${data.meta.ortho.trees.osm}, rows ${rowTrees}, canopy ${orthoTrees})`);
