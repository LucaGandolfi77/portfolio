/* Italy 3D Flight Sim — download EOX Sentinel-2 cloudless imagery tiles.
   Licence: CC BY 4.0 (2016 vintage). Attribution is shown in the game UI. */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));
const TILES = join(OUT, 'imagery');
const ZOOM = 9;
const BBOX = { minLon: 6.4, maxLon: 19.0, minLat: 35.8, maxLat: 47.4 };
const URL = (x, y) => `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/${ZOOM}/${y}/${x}.jpg`;

const mercY = lat => (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2;
const mx0 = (BBOX.minLon + 180) / 360, mx1 = (BBOX.maxLon + 180) / 360;
const my0 = mercY(BBOX.maxLat), my1 = mercY(BBOX.minLat);
const tileLon = x => x / 2 ** ZOOM * 360 - 180;
const mx = lon => (lon + 180) / 360;

const tx0 = Math.floor(mx0 * 2 ** ZOOM), tx1 = Math.floor(mx1 * 2 ** ZOOM);
const ty0 = Math.floor(my0 * 2 ** ZOOM), ty1 = Math.floor(my1 * 2 ** ZOOM);
const jobs = [];
for (let y = ty0; y <= ty1; y++) {
  for (let x = tx0; x <= tx1; x++) {
    const u0 = (mx(tileLon(x)) - mx0) / (mx1 - mx0);
    const u1 = (mx(tileLon(x + 1)) - mx0) / (mx1 - mx0);
    const v0 = (y / 2 ** ZOOM - my0) / (my1 - my0);
    const v1 = ((y + 1) / 2 ** ZOOM - my0) / (my1 - my0);
    if (u1 < 0 || u0 > 1 || v1 < 0 || v0 > 1) continue;
    jobs.push({ x, y, u0: +u0.toFixed(6), u1: +u1.toFixed(6), v0: +v0.toFixed(6), v1: +v1.toFixed(6), path: `./data/imagery/${x}_${y}.jpg` });
  }
}
console.log(`Downloading ${jobs.length} EOX Sentinel-2 tiles at zoom ${ZOOM}…`);
await mkdir(TILES, { recursive: true });

async function getTile(job) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(URL(job.x, job.y), { headers: { 'User-Agent': 'ItalyFlightSim/1.0 (offline PWA)' } });
      if (!res.ok) throw new Error(res.status);
      const data = Buffer.from(await res.arrayBuffer());
      if (data.length < 500) throw new Error('empty tile');
      await writeFile(join(TILES, `${job.x}_${job.y}.jpg`), data);
      return data.length;
    } catch (e) {
      if (attempt === 3) { console.warn('  failed', job.x, job.y, e.message); return 0; }
      await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
    }
  }
}
let bytes = 0, done = 0;
for (let i = 0; i < jobs.length; i += 10) {
  const results = await Promise.all(jobs.slice(i, i + 10).map(getTile));
  bytes += results.reduce((a, b) => a + b, 0);
  done += results.length;
  if (i % 100 === 0) console.log(`  ${done}/${jobs.length}`);
}
await writeFile(join(OUT, 'imagery-manifest.json'), JSON.stringify({
  zoom: ZOOM, bbox: BBOX, attribution: 'EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016), CC BY 4.0', tiles: jobs
}));
await writeFile(join(OUT, 'imagery-list.json'), JSON.stringify(jobs.map(j => j.path)));
console.log(`Imagery done: ${jobs.length} tiles, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
