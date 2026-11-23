/* Italy 3D Flight Sim — real OSM building footprints from Overpass.
   Data © OpenStreetMap contributors (ODbL). Attribution shown in the game UI. */

import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
];
const CITIES = [
  ['Rome', 41.90, 12.50], ['Milan', 45.46, 9.19], ['Naples', 40.85, 14.27],
  ['Turin', 45.07, 7.68], ['Florence', 43.77, 11.25], ['Bologna', 44.49, 11.34],
  ['Genoa', 44.41, 8.93], ['Palermo', 38.12, 13.36], ['Catania', 37.50, 15.09],
  ['Bari', 41.12, 16.87]
];
const CAP = 1800;
const HEADERS = { 'User-Agent': 'ItalyFlightSim/1.0 (offline PWA; OSM attribution included)' };

async function query(city, lat, lon) {
  const s = (lat - 0.024).toFixed(4), n = (lat + 0.024).toFixed(4);
  const w = (lon - 0.034).toFixed(4), e = (lon + 0.034).toFixed(4);
  const data = `[out:json][timeout:45];way["building"](${s},${w},${n},${e});out geom;`;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(ENDPOINTS[attempt % ENDPOINTS.length], {
        method: 'POST', headers: HEADERS, body: 'data=' + encodeURIComponent(data),
        signal: AbortSignal.timeout(40000)
      });
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } catch (e) {
      console.warn('  retry', city, e.message);
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  console.warn('  no data for', city);
  return { elements: [] };
}

function ringOf(el) {
  const g = el.geometry;
  if (!g || g.length < 4) return null;
  const ring = g.map(p => [+p.lon.toFixed(6), +p.lat.toFixed(6)]);
  ring.push([...ring[0]]);
  return ring;
}
function heightOf(el) {
  const t = el.tags || {};
  const h = parseFloat(t.height);
  if (Number.isFinite(h) && h > 2 && h < 250) return Math.round(h);
  const levels = parseInt(t['building:levels'], 10);
  return Number.isFinite(levels) && levels > 0 ? Math.min(200, levels * 3.2) : 12;
}

const cities = [];
for (let i = 0; i < CITIES.length; i++) {
  const [name, lat, lon] = CITIES[i];
  process.stdout.write(`Fetching ${name} (${i + 1}/${CITIES.length})… `);
  const json = await query(name, lat, lon);
  const buildings = [];
  for (const el of json.elements) {
    const ring = ringOf(el);
    if (ring) buildings.push([ring, heightOf(el)]);
  }
  const picked = buildings.slice(0, CAP);
  cities.push({ name, lon, lat, buildings: picked });
  console.log(picked.length, 'buildings');
  await writeFile(join(OUT, 'buildings.json'), JSON.stringify({
    attribution: '© OpenStreetMap contributors (ODbL)', cities
  }));
  if (i < CITIES.length - 1) await new Promise(r => setTimeout(r, 2500));
}
await writeFile(join(OUT, 'buildings.json'), JSON.stringify({
  attribution: '© OpenStreetMap contributors (ODbL)', cities
}));
console.log('Buildings done:', cities.reduce((s, c) => s + c.buildings.length, 0), 'footprints');
