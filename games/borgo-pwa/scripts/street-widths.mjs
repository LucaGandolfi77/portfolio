#!/usr/bin/env node
/*
 * street-widths.mjs — measured carriageway widths for the streets of Fidenza.
 *
 *   node scripts/street-widths.mjs
 *
 * OpenStreetMap gives a nominal width per road class (8.5 m, 5.5 m, ...).
 * The DBTR of Regione Emilia-Romagna (CC BY 4.0) maps the real vehicular
 * surface (class ACS, "Area di circolazione veicolare"). Every few metres
 * along each street the script walks across the axis until it leaves that
 * surface, and keeps the median width. The OSM width is kept in wOsm, so the
 * script can be run again.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mosaic } from './lib/wms.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = join(root, 'src', 'data', 'fidenza.json');
const data = JSON.parse(readFileSync(dataFile, 'utf8'));
const acs = await mosaic('veicolare', data.meta.origin, data.meta.view);

const VEHICULAR = new Set(['primary', 'primary_link', 'secondary', 'tertiary', 'residential', 'unclassified', 'living_street', 'service']);
const on = (x, z) => {
  const p = acs.at(x, z);
  return p !== null && p[3] > 60;
};

function crossWidth(x, z, nx, nz) {
  if (!on(x, z)) return null;
  let left = 0;
  let right = 0;
  for (let d = 0.5; d <= 12; d += 0.5) {
    if (!on(x + nx * d, z + nz * d)) break;
    left = d;
  }
  for (let d = 0.5; d <= 12; d += 0.5) {
    if (!on(x - nx * d, z - nz * d)) break;
    right = d;
  }
  /* Hitting the 12 m limit means a square or a car park, not a street. */
  if (left >= 12 || right >= 12) return null;
  return left + right + 0.5;
}

let measured = 0;
let kept = 0;
for (const road of data.roads) {
  if (road.wOsm === undefined) road.wOsm = road.w;
  if (!VEHICULAR.has(road.kind)) continue;
  const widths = [];
  const pts = road.pts;
  for (let i = 0; i + 3 < pts.length; i += 2) {
    const ax = pts[i], az = pts[i + 1], bx = pts[i + 2], bz = pts[i + 3];
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 1) continue;
    const nx = -(bz - az) / len;
    const nz = (bx - ax) / len;
    for (let d = Math.min(2, len / 2); d < len; d += 6) {
      const w = crossWidth(ax + ((bx - ax) * d) / len, az + ((bz - az) * d) / len, nx, nz);
      if (w !== null) widths.push(w);
    }
  }
  if (widths.length < 2) {
    road.w = road.wOsm;
    kept++;
    continue;
  }
  widths.sort((a, b) => a - b);
  /* The DBTR surface runs from facade to facade, pavements included; the
     game draws a 2.1 m pavement band around every street but service lanes
     (src/world/city.ts addRoads), so that part is not the carriageway. */
  const median = widths[Math.floor(widths.length / 2)] - (road.kind === 'service' ? 0 : 2.1);
  /* Stay within a sane range around the class width (lanes, not plazas). */
  road.w = Math.round(Math.min(Math.max(median, 3, road.wOsm * 0.55), Math.max(road.wOsm * 1.8, 6), 16) * 10) / 10;
  measured++;
}
data.meta.streets = {
  source: 'DBTR Regione Emilia-Romagna, ACS Area di circolazione veicolare',
  attribution: 'Larghezze stradali: DBTR © Regione Emilia-Romagna (CC BY 4.0)',
  measured,
  kept
};
writeFileSync(dataFile, JSON.stringify(data));
const changes = data.roads.filter((r) => VEHICULAR.has(r.kind) && Math.abs(r.w - r.wOsm) > 1).length;
console.log(`[streets] ${measured} measured, ${kept} kept OSM width; ${changes} changed by more than 1 m`);
