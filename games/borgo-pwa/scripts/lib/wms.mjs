/*
 * Public WMS sources used to check and enrich the Fidenza map, and a tiled
 * raster mosaic over the game area at 1 px = 1 m (local metres, the same
 * projection as src/data/fidenza.json). Tiles are cached in .cache/wms.
 *
 * - DBTR, Regione Emilia-Romagna (CC BY 4.0)
 * - Cartografia catastale, Agenzia delle Entrate (CC BY 4.0)
 * - Ortofoto AGEA 2023, servizio WMS della Regione Emilia-Romagna
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePng } from './png.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CACHE = join(root, '.cache', 'wms');

export const SOURCES = {
  edifici: { url: 'https://servizigis.regione.emilia-romagna.it/wms/dbtr', layers: 'EDI_Edificio' },
  veicolare: { url: 'https://servizigis.regione.emilia-romagna.it/wms/dbtr', layers: 'ACS_Area_di_circolazione_veicolare' },
  pedonale: { url: 'https://servizigis.regione.emilia-romagna.it/wms/dbtr', layers: 'ACP_Area_di_circolazione_pedonale' },
  catasto: { url: 'https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php', layers: 'fabbricati', crs13: 'EPSG:4258' },
  orto: { url: 'https://servizigis.regione.emilia-romagna.it/wms/agea2023_rgb', layers: 'Agea2023_RGB', opaque: true }
};

const TILE = 600;

export function projection(origin) {
  const mLat = 111320;
  const mLon = 111320 * Math.cos((origin.lat * Math.PI) / 180);
  return { lon: (x) => origin.lon + x / mLon, lat: (z) => origin.lat - z / mLat };
}

async function fetchTile(name, source, proj, x1, z1) {
  const file = join(CACHE, `${name}_${x1}_${z1}.png`);
  if (existsSync(file)) return readFileSync(file);
  const { lon, lat } = proj;
  const common = { SERVICE: 'WMS', REQUEST: 'GetMap', LAYERS: source.layers, STYLES: '', WIDTH: String(TILE), HEIGHT: String(TILE), FORMAT: 'image/png', TRANSPARENT: source.opaque ? 'FALSE' : 'TRUE' };
  const params = source.crs13
    ? { ...common, VERSION: '1.3.0', CRS: source.crs13, BBOX: `${lat(z1 + TILE)},${lon(x1)},${lat(z1)},${lon(x1 + TILE)}` }
    : { ...common, VERSION: '1.1.1', SRS: 'EPSG:4326', BBOX: `${lon(x1)},${lat(z1 + TILE)},${lon(x1 + TILE)},${lat(z1)}` };
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(`${source.url}?${new URLSearchParams(params)}`, { signal: AbortSignal.timeout(90000) });
      const type = res.headers.get('content-type') || '';
      const buf = Buffer.from(await res.arrayBuffer());
      if (!res.ok || !type.includes('png')) throw new Error(`${name}: ${res.status} ${type} ${buf.toString('utf8', 0, 200)}`);
      mkdirSync(CACHE, { recursive: true });
      writeFileSync(file, buf);
      return buf;
    } catch (err) {
      if (attempt >= 3) throw err;
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
}

/* A mosaic of one source over `view` (local metres), 1 px = 1 m. */
export async function mosaic(name, origin, view) {
  const source = SOURCES[name];
  const proj = projection(origin);
  const x0 = Math.floor(view.minX);
  const z0 = Math.floor(view.minZ);
  const width = Math.ceil(view.maxX - x0);
  const height = Math.ceil(view.maxZ - z0);
  const data = new Uint8ClampedArray(width * height * 4);
  for (let tz = z0; tz < z0 + height; tz += TILE) {
    for (let tx = x0; tx < x0 + width; tx += TILE) {
      const png = decodePng(await fetchTile(name, source, proj, tx, tz));
      for (let y = 0; y < TILE; y++) {
        const gy = tz - z0 + y;
        if (gy >= height) break;
        for (let x = 0; x < TILE; x++) {
          const gx = tx - x0 + x;
          if (gx >= width) break;
          const s = (y * png.width + x) * 4;
          const d = (gy * width + gx) * 4;
          data[d] = png.data[s];
          data[d + 1] = png.data[s + 1];
          data[d + 2] = png.data[s + 2];
          data[d + 3] = png.data[s + 3];
        }
      }
    }
  }
  return {
    x0, z0, width, height, data,
    at(x, z) {
      const px = Math.floor(x - x0);
      const pz = Math.floor(z - z0);
      if (px < 0 || pz < 0 || px >= width || pz >= height) return null;
      const o = (pz * width + px) * 4;
      return [data[o], data[o + 1], data[o + 2], data[o + 3]];
    }
  };
}

/* Calls fn(px, pz) for every 1 m cell whose centre is inside the polygon
   (flat [x,z,...] ring), in mosaic pixel coordinates. */
export function rasterize(poly, raster, fn) {
  const n = poly.length / 2;
  let minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < n; i++) {
    minZ = Math.min(minZ, poly[i * 2 + 1]);
    maxZ = Math.max(maxZ, poly[i * 2 + 1]);
  }
  for (let z = Math.ceil(minZ - 0.5) + 0.5; z < maxZ; z += 1) {
    const xs = [];
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const zi = poly[i * 2 + 1], zj = poly[j * 2 + 1];
      if (zi > z !== zj > z) xs.push(poly[i * 2] + ((z - zi) / (zj - zi)) * (poly[j * 2] - poly[i * 2]));
    }
    xs.sort((a, b) => a - b);
    const pz = Math.floor(z - raster.z0);
    if (pz < 0 || pz >= raster.height) continue;
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = Math.ceil(xs[k] - 0.5) + 0.5; x < xs[k + 1]; x += 1) {
        const px = Math.floor(x - raster.x0);
        if (px >= 0 && px < raster.width) fn(px, pz);
      }
    }
  }
}
