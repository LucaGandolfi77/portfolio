/* Headless checks for the coastline, beaches, terrain chunks and long-range flying. */
import { test, eq, ok, near, summary } from '../../_kit/test-harness.js';
import { readFileSync } from 'node:fs';
import { AIRPORTS, MISSIONS, PLANES, WORLD } from '../js/config.js';
import { initGeo, geoToWorld, isWater, terrainHeight } from '../js/geo.js';
import { COAST, coastDistance, waterLevel } from '../js/coast.js';
import { airfields } from '../js/airfields.js';
import { COLS, ROWS, CHUNK, SEGMENTS, chunkData, chunkDistance, chunkLevel, chunkOrigin, isOpenWater } from '../js/terrain-grid.js';
import { createFlight, stepFlight } from '../js/flight.js';
import { createAutopilot, stepAutopilot } from '../js/autopilot.js';

const base = new URL('../data/', import.meta.url);
const heightBuf = readFileSync(new URL('italy-height.bin', base));
const json = name => JSON.parse(readFileSync(new URL(name, base), 'utf8'));
initGeo(new DataView(new Uint8Array(heightBuf).buffer), json('italy-meta.json'), json('italy-vector.json'));

let passed = 0, total = 0;
const run = (name, fn) => { total++; if (test(name, fn)) passed++; };
const at = (lon, lat) => geoToWorld(lon, lat);

run('known places are on the right side of the shore', () => {
  for (const [name, lon, lat] of [['Tyrrhenian', 12.0, 40.0], ['Adriatic', 14.5, 43.5], ['Ionian', 17.5, 38.5]]) {
    const p = at(lon, lat);
    ok(isWater(p.x, p.z), name);
    eq(terrainHeight(p.x, p.z), 0, name);
  }
  for (const [name, lon, lat] of [['Rome', 12.5, 41.9], ['Po plain', 10.5, 45.1], ['Sicily', 14.2, 37.5], ['Sardinia', 9.0, 40.1]]) {
    const p = at(lon, lat);
    ok(!isWater(p.x, p.z) && terrainHeight(p.x, p.z) > 0.5, name);
  }
});

run('shores slope gently from the sea into a beach', () => {
  /* Walk from open water inland towards Rome until well past the beach. */
  const from = at(11.6, 41.5), to = at(12.5, 41.9);
  let shore = null;
  const steps = 4000;
  const point = i => ({ x: from.x + (to.x - from.x) * i / steps, z: from.z + (to.z - from.z) * i / steps });
  for (let i = 0; i <= steps && shore === null; i++) if (coastDistance(point(i).x, point(i).z) > 0) shore = i;
  ok(shore !== null, 'no shore found');
  const step = Math.hypot(to.x - from.x, to.z - from.z) / steps;
  for (let u = 0; u <= COAST.beach; u += 4) {
    const p = point(shore + Math.round(u / step));
    const h = terrainHeight(p.x, p.z);
    ok(h >= 0 && h < 3, `height ${h.toFixed(1)} at ${u} from the shore`);
  }
});

run('lakes sit flat at their own level', () => {
  for (const ring of json('italy-vector.json').lakes) {
    const lon = ring.reduce((s, p) => s + p[0], 0) / ring.length;
    const lat = ring.reduce((s, p) => s + p[1], 0) / ring.length;
    const p = at(lon, lat);
    if (!isWater(p.x, p.z)) continue;
    near(terrainHeight(p.x, p.z), waterLevel(p.x, p.z), 1e-6);
    ok(waterLevel(p.x, p.z) >= 1);
  }
});

run('every airfield stands on dry land', () => {
  for (const f of airfields()) {
    for (const along of [-110, 0, 110]) {
      const x = f.x + f.dir.x * along, z = f.z + f.dir.z * along;
      ok(coastDistance(x, z) > 10, `${f.code} at ${along}: ${coastDistance(x, z).toFixed(0)}`);
    }
  }
});

run('chunks cover the whole map exactly once', () => {
  near(COLS * CHUNK.width, WORLD.width, 1e-6);
  near(ROWS * CHUNK.depth, WORLD.depth, 1e-6);
  const last = chunkOrigin(COLS - 1, ROWS - 1);
  near(last.x + CHUNK.width, WORLD.width / 2, 1e-6);
  near(last.z + CHUNK.depth, WORLD.depth / 2, 1e-6);
});

run('chunk vertices follow the ground and neighbours share their edge', () => {
  const col = 15, row = 13, seg = SEGMENTS.high[1], side = seg + 1;
  const a = chunkData(col, row, seg), b = chunkData(col + 1, row, seg);
  for (let j = 0; j < side; j += 5) {
    const right = (j * side + seg) * 3, left = (j * side) * 3;
    near(a.positions[right], b.positions[left], 0.01);
    near(a.positions[right + 1], b.positions[left + 1], 0.01);
    near(a.positions[right + 2], b.positions[left + 2], 0.01);
    near(a.normals[right], b.normals[left], 0.001);
    near(a.positions[right + 1], terrainHeight(a.positions[right], a.positions[right + 2]), 0.001);
  }
  ok(Math.max(...a.index) < a.positions.length / 3, 'index out of range');
  eq(a.index.length, seg * seg * 6 + seg * 48);
  /* The first triangle faces up. */
  const [i0, i1, i2] = a.index;
  const v = i => [a.positions[i * 3], a.positions[i * 3 + 2]];
  const [p, q, r] = [v(i0), v(i1), v(i2)];
  ok((q[1] - p[1]) * (r[0] - p[0]) - (q[0] - p[0]) * (r[1] - p[1]) > 0);
});

run('detail falls with distance, with a margin against flicker', () => {
  eq(chunkLevel(0), 0); eq(chunkLevel(1500), 1); eq(chunkLevel(5000), 2);
  eq(chunkLevel(950, 'high', 0), 0); eq(chunkLevel(950, 'high', 1), 1);
  eq(chunkLevel(1500, 'high', null, true), 0, 'runways need detail further out');
  eq(chunkDistance(0, 0, -WORLD.width / 2 + 1, -WORLD.depth / 2 + 1), 0);
});

run('open sea chunks are recognised and land chunks are not', () => {
  const find = (lon, lat) => {
    const p = at(lon, lat);
    return [Math.floor((p.x + WORLD.width / 2) / CHUNK.width), Math.floor((p.z + WORLD.depth / 2) / CHUNK.depth)];
  };
  eq(isOpenWater(...find(11.0, 39.5)), true);
  eq(isOpenWater(...find(12.5, 41.9)), false);
});

run('every plane with aerodynamics can fly the longest mission leg on one tank', () => {
  const legs = MISSIONS.flatMap(m => m.stops.slice(1).map((code, i) => {
    const a = airfields().find(f => f.code === m.stops[i]), b = airfields().find(f => f.code === code);
    return Math.hypot(a.x - b.x, a.z - b.z);
  }));
  const longest = Math.max(...legs);
  ok(longest > 5000, `legs are long: ${longest.toFixed(0)}`);
  for (const plane of PLANES.filter(p => p.aero)) {
    const state = createFlight(plane, AIRPORTS.find(a => a.code === 'FCO'), 300, 'real');
    const ap = createAutopilot(state, plane);
    ap.speed = plane.aero.cruise;
    let flown = 0;
    const dt = 1 / 30;
    for (let i = 0; i < 1200 / dt && flown < longest * 1.15 && state.fuel > 0 && state.status === 'flying'; i++) {
      const x = state.x, z = state.z;
      /* Fly back and forth so the test stays over the map. */
      ap.heading = Math.floor(i * dt / 60) % 2 ? 0.2 : Math.PI + 0.2;
      stepFlight(state, plane, stepAutopilot(ap, state, plane, dt), dt);
      flown += Math.hypot(state.x - x, state.z - z);
    }
    ok(flown >= longest * 1.15, `${plane.id}: ${flown.toFixed(0)} of ${longest.toFixed(0)}, fuel ${state.fuel.toFixed(0)}, ${state.status}`);
  }
});

summary(passed, total);
