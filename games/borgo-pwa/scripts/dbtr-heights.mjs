#!/usr/bin/env node
/*
 * dbtr-heights.mjs — replace the inferred building heights in
 * src/data/fidenza.json with measured ones from the Database Topografico
 * Regionale (DBTR) of Regione Emilia-Romagna, class UVL "Unità volumetrica",
 * field H_uvl (average height, derived from the regional DTM/DSM LiDAR).
 *
 * DBTR © Regione Emilia-Romagna, CC BY 4.0.
 *
 *   node scripts/dbtr-heights.mjs fetch   # query the public WMS, fill the cache
 *   node scripts/dbtr-heights.mjs apply   # write the heights into fidenza.json
 *
 * The WFS of the region needs credentials, so the script asks the public WMS
 * (GetFeatureInfo) for one to three points inside each footprint. Answers are
 * cached in data/dbtr-heights.json: "fetch" only asks for what is missing and
 * can be stopped and resumed. "apply" needs no network.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = join(root, 'src', 'data', 'fidenza.json');
const cacheFile = join(root, 'data', 'dbtr-heights.json');
const WMS = 'https://servizigis.regione.emilia-romagna.it/wms/dbtr';
const LAYER = 'UVL_Unita_volumetrica';
const CONCURRENCY = 4;
const MIN_H = 2.5;
const MAX_H = 60;

const data = JSON.parse(readFileSync(dataFile, 'utf8'));
const origin = data.meta.origin;
const mLat = 111320;
const mLon = 111320 * Math.cos((origin.lat * Math.PI) / 180);
const toLatLon = (x, z) => ({ lat: origin.lat - z / mLat, lon: origin.lon + x / mLon });

const ring = (flat) => {
  const pts = [];
  for (let i = 0; i < flat.length; i += 2) pts.push([flat[i], flat[i + 1]]);
  return pts;
};

function inside([x, z], pts) {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i];
    const [xj, zj] = pts[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit;
  }
  return hit;
}

/* Distance from a point to the nearest edge: keeps samples away from walls,
   where a neighbouring volume could answer instead. */
function edgeDistance([x, z], pts) {
  let best = Infinity;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, az] = pts[j];
    const [bx, bz] = pts[i];
    const dx = bx - ax;
    const dz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(x - (ax + t * dx), z - (az + t * dz)));
  }
  return best;
}

/* Up to `count` interior points, the deepest first, on a coarse grid. */
function samplePoints(building, count) {
  const pts = ring(building.poly);
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [x, z] of pts) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  }
  const step = Math.max(1, Math.min(maxX - minX, maxZ - minZ) / 6);
  const candidates = [];
  for (let x = minX + step / 2; x < maxX; x += step) {
    for (let z = minZ + step / 2; z < maxZ; z += step) {
      if (inside([x, z], pts)) candidates.push({ p: [x, z], d: edgeDistance([x, z], pts) });
    }
  }
  if (candidates.length === 0) return [[building.x, building.z]];
  candidates.sort((a, b) => b.d - a.d);
  const chosen = [candidates[0]];
  /* Further samples spread out across the footprint. */
  while (chosen.length < count) {
    let best = null;
    let bestScore = -1;
    for (const c of candidates) {
      if (c.d < 1) continue;
      const near = Math.min(...chosen.map((k) => Math.hypot(k.p[0] - c.p[0], k.p[1] - c.p[1])));
      if (near > bestScore) { bestScore = near; best = c; }
    }
    if (!best || bestScore < 4) break;
    chosen.push(best);
  }
  return chosen.map((c) => c.p);
}

async function featureInfo(x, z) {
  const { lat, lon } = toLatLon(x, z);
  const d = 0.00001;
  const params = new URLSearchParams({
    service: 'WMS', version: '1.1.1', request: 'GetFeatureInfo',
    layers: LAYER, query_layers: LAYER, styles: '', format: 'image/png',
    srs: 'EPSG:4326', bbox: `${lon - d},${lat - d},${lon + d},${lat + d}`,
    width: '11', height: '11', x: '5', y: '5', feature_count: '3', info_format: 'text/xml'
  });
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`${WMS}?${params}`, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const out = [];
      for (const m of xml.matchAll(/<FIELDS ([^>]*)>/g)) {
        const h = /\bH_uvl="([^"]*)"/.exec(m[1]);
        const id = /\bId_e="([^"]*)"/.exec(m[1]);
        const value = h ? Number(h[1].replace(',', '.')) : NaN;
        if (Number.isFinite(value)) out.push({ h: value, id: id ? id[1] : '' });
      }
      return out;
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  return [];
}

function loadCache() {
  return existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : { source: {}, buildings: {} };
}

function saveCache(cache) {
  mkdirSync(dirname(cacheFile), { recursive: true });
  cache.source = {
    name: 'DBTR — Database Topografico Regionale, classe UVL (Unità volumetrica), campo H_uvl',
    publisher: 'Regione Emilia-Romagna',
    license: 'CC-BY-4.0',
    service: WMS
  };
  writeFileSync(cacheFile, JSON.stringify(cache, null, 0).replace(/},"/g, '},\n"') + '\n');
}

async function fetchAll() {
  const cache = loadCache();
  const todo = data.buildings.filter((b) => !cache.buildings[b.id]);
  console.log(`[dbtr] ${data.buildings.length} buildings, ${todo.length} to query`);
  let done = 0;
  let next = 0;
  async function worker() {
    while (next < todo.length) {
      const building = todo[next++];
      const count = building.area > 900 ? 3 : building.area > 250 ? 2 : 1;
      const samples = [];
      for (const [x, z] of samplePoints(building, count)) {
        for (const f of await featureInfo(x, z)) samples.push(f.h);
      }
      cache.buildings[building.id] = samples;
      done++;
      if (done % 100 === 0) {
        saveCache(cache);
        console.log(`[dbtr] ${done}/${todo.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  saveCache(cache);
  console.log(`[dbtr] done, cache in ${cacheFile}`);
}

function median(values) {
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function applyAll() {
  const cache = loadCache();
  let measured = 0;
  let kept = 0;
  for (const building of data.buildings) {
    const samples = (cache.buildings[building.id] || []).filter((h) => h >= MIN_H && h <= MAX_H);
    if (samples.length === 0) {
      kept++;
      continue;
    }
    building.h = Math.round(median(samples) * 10) / 10;
    measured++;
  }
  data.meta.heights = {
    source: 'DBTR Regione Emilia-Romagna, UVL H_uvl (DTM/DSM)',
    attribution: 'Altezze: DBTR © Regione Emilia-Romagna (CC BY 4.0)',
    license: 'CC-BY-4.0',
    measured,
    inferred: kept
  };
  writeFileSync(dataFile, JSON.stringify(data));
  console.log(`[dbtr] heights: ${measured} measured, ${kept} kept inferred`);
}

const mode = process.argv[2];
if (mode === 'fetch') await fetchAll();
else if (mode === 'apply') applyAll();
else {
  console.error('usage: node scripts/dbtr-heights.mjs fetch|apply');
  process.exit(1);
}
