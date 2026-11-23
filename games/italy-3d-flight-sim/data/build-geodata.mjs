/* Italy 3D Flight Sim — build real geodata from public-domain sources.
   Run: node data/build-geodata.mjs
   Sources: Natural Earth (public domain) and Mapzen Terrarium SRTM tiles. */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const OUT = dirname(fileURLToPath(import.meta.url));
const BBOX = { minLon: 6.4, maxLon: 19.0, minLat: 35.8, maxLat: 47.4 };
const GRID = 512;
const ZOOM = 9;
const NE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';

async function getJSON(name) {
  const url = NE + name + '.geojson';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
    }
  }
}

function inBox([lon, lat]) {
  return lon >= BBOX.minLon && lon <= BBOX.maxLon && lat >= BBOX.minLat && lat <= BBOX.maxLat;
}
function ringInBox(ring) { return ring.some(inBox); }
function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function round(n) { return Math.round(n * 10000) / 10000; }
function cleanCoords(coords) { return coords.map(([lon, lat]) => [round(lon), round(lat)]); }

function extractRings(geojson, filter = () => true) {
  const rings = [];
  for (const f of geojson.features || []) {
    if (!filter(f)) continue;
    const g = f.geometry || {};
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    for (const poly of polys) {
      for (const ring of poly) {
        if (ring.length > 3 && ringInBox(ring)) rings.push(cleanCoords(ring));
      }
    }
  }
  return rings;
}

function extractLines(geojson) {
  const lines = [];
  for (const f of geojson.features || []) {
    const g = f.geometry || {};
    const parts = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
    for (const line of parts) {
      if (line.length > 2 && line.some(inBox)) lines.push(cleanCoords(line));
    }
  }
  return lines;
}

function decodePNG(buf) {
  let pos = 8, width = 0, height = 0, colorType = 2;
  const chunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); colorType = data[9]; }
    if (type === 'IDAT') chunks.push(data);
    if (type === 'IEND') break;
    pos += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const raw = zlib.inflateSync(Buffer.concat(chunks));
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[dst + x - bpp] : 0;
      const b = y > 0 ? out[dst - stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[dst - stride + x - bpp] : 0;
      let v = raw[src + x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[dst + x] = v & 255;
    }
  }
  return { width, height, data: out, bpp };
}

function tileXY(lon, lat, z) {
  const n = 2 ** z;
  const x = (lon + 180) / 360 * n;
  const latRad = lat * Math.PI / 180;
  const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;
  return { x, y };
}

async function getTile(tx, ty) {
  const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${ZOOM}/${tx}/${ty}.png`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      return decodePNG(Buffer.from(await res.arrayBuffer()));
    } catch (e) {
      if (attempt === 2) return null;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
}

console.log('Downloading Natural Earth vectors…');
const [countries, lakes, rivers, urban, places] = await Promise.all([
  getJSON('ne_50m_admin_0_countries'),
  getJSON('ne_50m_lakes'),
  getJSON('ne_50m_rivers_lake_centerlines'),
  getJSON('ne_50m_urban_areas'),
  getJSON('ne_50m_populated_places')
]);
const italy = extractRings(countries, f => f.properties?.ADMIN === 'Italy' || f.properties?.NAME === 'Italy');
const insideItaly = (lon, lat) => italy.some(ring => pointInRing(lon, lat, ring));
const vector = {
  coastline: italy,
  lakes: extractRings(lakes),
  rivers: extractLines(rivers),
  urban: [],
  cities: []
};
for (const f of urban.features || []) {
  const polys = f.geometry?.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry?.type === 'MultiPolygon' ? f.geometry.coordinates : [];
  for (const poly of polys) {
    const ring = poly[0];
    const cx = ring?.reduce((s, p) => s + p[0], 0) / (ring?.length || 1);
    const cy = ring?.reduce((s, p) => s + p[1], 0) / (ring?.length || 1);
    if (ring?.length > 3 && ringInBox(ring) && insideItaly(cx, cy)) vector.urban.push({ ring: cleanCoords(ring), pop: Math.round(f.properties?.POP_MAX || 0) });
  }
}
for (const f of places.features || []) {
  const [lon, lat] = f.geometry?.coordinates || [];
  if (!inBox([lon, lat]) || !insideItaly(lon, lat)) continue;
  vector.cities.push({
    name: f.properties?.NAME || '', lon: round(lon), lat: round(lat),
    pop: Math.round(f.properties?.POP_MAX || f.properties?.POP_EST || 0)
  });
}
vector.cities.sort((a, b) => b.pop - a.pop);
vector.cities = vector.cities.slice(0, 140);

console.log(`Vectors: ${italy.length} coastline rings, ${vector.lakes.length} lakes, ${vector.rivers.length} rivers, ${vector.urban.length} urban areas, ${vector.cities.length} cities`);

const cornerA = tileXY(BBOX.minLon, BBOX.maxLat, ZOOM);
const cornerB = tileXY(BBOX.maxLon, BBOX.minLat, ZOOM);
const tx0 = Math.floor(cornerA.x), tx1 = Math.floor(cornerB.x);
const ty0 = Math.floor(cornerA.y), ty1 = Math.floor(cornerB.y);
const keys = [];
for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) keys.push([tx, ty]);
console.log(`Downloading ${keys.length} elevation tiles at zoom ${ZOOM}…`);
const tiles = new Map();
for (let i = 0; i < keys.length; i += 12) {
  const batch = keys.slice(i, i + 12);
  const decoded = await Promise.all(batch.map(([tx, ty]) => getTile(tx, ty)));
  batch.forEach(([tx, ty], j) => { if (decoded[j]) tiles.set(`${tx}/${ty}`, decoded[j]); });
  if (i % 60 === 0) console.log(`  ${Math.min(i + 12, keys.length)}/${keys.length}`);
}

const height = Buffer.alloc(GRID * GRID * 2);
let min = 9999, max = -9999;
function sample(lon, lat) {
  const t = tileXY(lon, lat, ZOOM);
  const tile = tiles.get(`${Math.floor(t.x)}/${Math.floor(t.y)}`);
  if (!tile) return 0;
  const px = Math.min(tile.width - 1, Math.max(0, Math.floor((t.x % 1) * tile.width)));
  const py = Math.min(tile.height - 1, Math.max(0, Math.floor((t.y % 1) * tile.height)));
  const idx = (py * tile.width + px) * tile.bpp;
  return Math.round(tile.data[idx] * 256 + tile.data[idx + 1] + tile.data[idx + 2] / 256 - 32768);
}
for (let j = 0; j < GRID; j++) {
  const lat = BBOX.maxLat - (j / (GRID - 1)) * (BBOX.maxLat - BBOX.minLat);
  for (let i = 0; i < GRID; i++) {
    const lon = BBOX.minLon + (i / (GRID - 1)) * (BBOX.maxLon - BBOX.minLon);
    const h = Math.max(-200, Math.min(6000, sample(lon, lat)));
    height.writeInt16LE(h, (j * GRID + i) * 2);
    if (h < min) min = h;
    if (h > max) max = h;
  }
}

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, 'italy-height.bin'), height);
await writeFile(join(OUT, 'italy-meta.json'), JSON.stringify({
  bbox: BBOX, width: GRID, height: GRID, zoom: ZOOM, minElevation: min, maxElevation: max,
  sources: ['Natural Earth 50m (public domain)', 'Mapzen Terrarium / SRTM (public domain)']
}, null, 2) + '\n');
await writeFile(join(OUT, 'italy-vector.json'), JSON.stringify(vector));
console.log(`Done. Elevation ${min}…${max} m. Heightfield ${(height.length / 1024).toFixed(0)} KB, vectors ${(JSON.stringify(vector).length / 1024).toFixed(0)} KB.`);
