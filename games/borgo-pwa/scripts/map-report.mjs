#!/usr/bin/env node
/*
 * map-report.mjs — how well the game map matches the official maps.
 *
 *   node scripts/map-report.mjs
 *
 * Rasterises the game footprints at 1 m and compares them with the building
 * layers of the cadastre (Agenzia delle Entrate, CC BY 4.0) and of the DBTR
 * (Regione Emilia-Romagna, CC BY 4.0) over the same area:
 *   precision = game ∩ official / game      (is what we draw real?)
 *   coverage  = game ∩ official / official  (how much of the town we draw)
 *   IoU       = game ∩ official / game ∪ official
 * Also counts trees and measured roofs, heights and street widths.
 * Writes data/map-report.json; tiles come from .cache/wms (see lib/wms.mjs).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mosaic, rasterize } from './lib/wms.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'src', 'data', 'fidenza.json'), 'utf8'));
const { origin, view } = data.meta;

const catasto = await mosaic('catasto', origin, view);
const edifici = await mosaic('edifici', origin, view);
const W = catasto.width;
const H = catasto.height;
const game = new Uint8Array(W * H);
for (const b of data.buildings) rasterize(b.poly, catasto, (px, pz) => { game[pz * W + px] = 1; });

/* The cadastre stamps its copyright in red at the bottom of every tile. */
const isCatasto = (i) => {
  const a = catasto.data[i * 4 + 3];
  const r = catasto.data[i * 4], g = catasto.data[i * 4 + 1];
  return a > 100 && !(r > 200 && g < 120 && catasto.data[i * 4 + 2] < 120);
};
const isDbtr = (i) => edifici.data[i * 4 + 3] > 100;

function compare(test) {
  let inter = 0, ref = 0, mine = 0;
  for (let i = 0; i < W * H; i++) {
    const g = game[i];
    const r = test(i);
    if (g) mine++;
    if (r) ref++;
    if (g && r) inter++;
  }
  const pct = (v) => Math.round(v * 1000) / 10;
  return { precision: pct(inter / mine), coverage: pct(inter / ref), iou: pct(inter / (mine + ref - inter)), gameM2: mine, officialM2: ref };
}

const report = {
  generated: new Date().toISOString().slice(0, 10),
  area: view,
  buildings: {
    count: data.buildings.length,
    catasto: compare(isCatasto),
    dbtr: compare(isDbtr),
    measuredHeights: data.meta.heights?.measured ?? 0,
    orthoRoofs: data.buildings.filter((b) => b.roof !== undefined).length
  },
  trees: data.trees.reduce((acc, t) => ((acc[t.source ?? 'osm'] = (acc[t.source ?? 'osm'] ?? 0) + 1), acc), {}),
  streets: data.meta.streets ?? null
};
mkdirSync(join(root, 'data'), { recursive: true });
writeFileSync(join(root, 'data', 'map-report.json'), JSON.stringify(report, null, 2) + '\n');
const b = report.buildings;
console.log(`[report] buildings ${b.count}: catasto precision ${b.catasto.precision}% coverage ${b.catasto.coverage}% IoU ${b.catasto.iou}%`);
console.log(`[report] DBTR precision ${b.dbtr.precision}% coverage ${b.dbtr.coverage}% IoU ${b.dbtr.iou}%`);
console.log(`[report] heights ${b.measuredHeights}, roofs ${b.orthoRoofs}, trees ${JSON.stringify(report.trees)}`);
