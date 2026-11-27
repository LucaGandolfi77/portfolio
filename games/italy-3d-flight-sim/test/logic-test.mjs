import { test, eq, ok, near, summary } from '../../_kit/test-harness.js';
import { readFileSync } from 'node:fs';
import { AIRPORTS, MISSIONS, PLANES, STR, TOURS, WORLD } from '../js/config.js';
import { initLandmarks, landmarksData } from '../js/landmarks.js';
import { geoToWorld, worldToGeo, elevationAt, terrainHeight, initGeo, insideItaly } from '../js/geo.js';
import { airportPosition, createFlight, headingDegrees, landingCheck, stepFlight, runwayDirection } from '../js/flight.js';
import { createTraffic, stepTraffic } from '../js/traffic.js';
import { FlightGame } from '../js/game.js';

const base = new URL('../data/', import.meta.url);
const heightBuf = readFileSync(new URL('italy-height.bin', base));
const meta = JSON.parse(readFileSync(new URL('italy-meta.json', base), 'utf8'));
const vectors = JSON.parse(readFileSync(new URL('italy-vector.json', base), 'utf8'));
const imagery = JSON.parse(readFileSync(new URL('imagery-manifest.json', base), 'utf8'));
const buildings = JSON.parse(readFileSync(new URL('buildings.json', base), 'utf8'));
const landmarks = JSON.parse(readFileSync(new URL('landmarks.json', base), 'utf8'));
initLandmarks(landmarks);
initGeo(new DataView(new Uint8Array(heightBuf).buffer), meta, vectors);

let passed = 0, total = 0;
const run = (name, fn) => { total++; if (test(name, fn)) passed++; };

const rome = AIRPORTS.find(a => a.code === 'FCO');
const plane = PLANES[0];

run('geodata files have the expected shape', () => {
  eq(meta.width, 512); eq(meta.height, 512);
  eq(heightBuf.length, 512 * 512 * 2);
  ok(meta.maxElevation > 4000 && meta.maxElevation < 6000);
  ok(meta.minElevation < 0);
  ok(vectors.coastline.length >= 3);
  ok(vectors.cities.length > 20);
  ok(vectors.urban.length > 20);
  ok(vectors.lakes.length >= 1 && vectors.rivers.length >= 1);
});

run('satellite imagery manifest covers Italy with attribution', () => {
  ok(imagery.tiles.length > 300);
  ok(/EOX/i.test(imagery.attribution) && /CC BY 4.0/.test(imagery.attribution));
  ok(imagery.tiles.every(t => t.path.startsWith('./data/imagery/') && t.u1 > t.u0 && t.v1 > t.v0));
  const us = imagery.tiles.flatMap(t => [t.u0, t.u1]);
  ok(Math.min(...us) < 0.02 && Math.max(...us) > 0.98);
});

run('real OSM buildings exist with footprint rings and heights', () => {
  ok(buildings.cities.length >= 10);
  ok(/OpenStreetMap/i.test(buildings.attribution));
  const total = buildings.cities.reduce((s, c) => s + c.buildings.length, 0);
  ok(total > 5000, `expected many buildings, got ${total}`);
  for (const city of buildings.cities.slice(0, 4)) {
    ok(city.name && city.buildings.length > 200);
    ok(city.buildings.every(([ring, h]) => ring.length >= 4 && h > 0 && h < 300));
  }
});

run('world is wide and terrain relief is low', () => {
  ok(WORLD.maxLon - WORLD.minLon > 15);
  ok(WORLD.maxLat - WORLD.minLat > 12);
  ok(WORLD.elevScale <= 0.06 && WORLD.elevScale >= 0.04);
  const peak = terrainHeight(geoToWorld(10.5, 46.5).x, geoToWorld(10.5, 46.5).z);
  ok(peak < 260, `peak too high: ${peak}`);
});

run('real landmarks cover Italy and tours reference them', () => {
  eq(landmarks.landmarks.length, 12);
  const ids = new Set(landmarks.landmarks.map(l => l.id));
  eq(ids.size, 12);
  ok(landmarks.landmarks.every(l => l.lon > WORLD.minLon && l.lon < WORLD.maxLon && l.lat > WORLD.minLat && l.lat < WORLD.maxLat));
  ok(TOURS.length >= 4);
  for (const tour of TOURS) ok(tour.stops.every(id => ids.has(id)), `bad stop in ${tour.id}`);
  eq(landmarksData().landmarks[0].code, 'COL');
});

run('landmark tour advances on flyover and completes', () => {
  const save = { plane: 'cessna', lang: 'en', bests: {}, freeAirport: 'FCO', stats: {}, quality: 'high', visual: 'happy' };
  const game = new FlightGame(save, () => {});
  game.startTour('roma');
  eq(game.targetIndex, 0);
  eq(game.targetLandmark().id, 'colosseo');
  for (const lm of landmarks.landmarks.slice(0, 2)) {
    const p = geoToWorld(lm.lon, lm.lat);
    game.state.x = p.x; game.state.z = p.z;
    game.state.y = terrainHeight(p.x, p.z) + 120;
    game.landCooldown = 0;
    game.update(1 / 60, { turn: 0, pitch: 0, throttle: 0.4 });
  }
  eq(game.mode, 'result');
  ok(save.bests['roma:cessna'] >= 0);
});

run('lon/lat converts to world coordinates and back', () => {
  for (const a of AIRPORTS) {
    const p = geoToWorld(a.lon, a.lat);
    const back = worldToGeo(p.x, p.z);
    near(back.lon, a.lon, 0.0001);
    near(back.lat, a.lat, 0.0001);
    ok(p.x >= -WORLD.width / 2 && p.x <= WORLD.width / 2);
    ok(p.z >= -WORLD.depth / 2 && p.z <= WORLD.depth / 2);
  }
});

run('real elevation sampling finds mountains and sea', () => {
  const alpine = elevationAt(10.5, 46.5);
  const sea = elevationAt(14, 39);
  ok(alpine > 800, `expected Alpine elevation, got ${alpine}`);
  ok(sea < 50, `expected sea-level sample, got ${sea}`);
  ok(terrainHeight(0, 0) >= 0);
});

run('real cities are inside Italy and sorted by population', () => {
  ok(insideItaly(12.5, 41.9), 'Rome should be inside Italy');
  ok(!insideItaly(10.3, 36.9), 'Tunisia should be outside Italy');
  eq(vectors.cities[0].name, 'Rome');
  ok(vectors.cities.every((c, i, arr) => i === 0 || arr[i - 1].pop >= c.pop));
});

run('all airports and mission stops are valid', () => {
  eq(AIRPORTS.length, 15);
  eq(PLANES.length, 11);
  eq(PLANES.filter(p => p.starship).length, 3);
  ok(MISSIONS.length >= 5);
  for (const m of MISSIONS) ok(m.stops.every(code => AIRPORTS.some(a => a.code === code)));
  eq(Object.keys(STR.en).sort().join(), Object.keys(STR.it).sort().join());
});

run('aircraft start airborne at their real airport', () => {
  const f = createFlight(plane, rome);
  const p = airportPosition(rome);
  near(f.x, p.x, 0.001); near(f.z, p.z, 0.001);
  eq(f.fuel, plane.fuel);
  ok(f.y > f.ground);
  near(f.heading, rome.rwy * Math.PI / 180, 0.0001);
});

run('flight moves in 3D and climbs with pitch input', () => {
  const f = createFlight(plane, rome);
  const x = f.x, z = f.z, y = f.y;
  for (let i = 0; i < 60; i++) stepFlight(f, plane, { turn: 0.2, pitch: 0.6, throttle: 1 }, 1 / 60);
  ok(Math.hypot(f.x - x, f.z - z) > 10);
  ok(f.y > y);
  ok(f.heading !== rome.rwy * Math.PI / 180);
  ok(f.fuel < plane.fuel);
});

run('boost increases speed and burns extra fuel', () => {
  const a = createFlight(plane, rome), b = createFlight(plane, rome);
  for (let i = 0; i < 60; i++) {
    stepFlight(a, plane, { turn: 0, pitch: 0, throttle: 1 }, 1 / 60);
    stepFlight(b, plane, { turn: 0, pitch: 0, throttle: 1, boost: true }, 1 / 60);
  }
  eq(b.boosting, true);
  ok(b.speed > a.speed * 1.05);
  ok(b.fuel < a.fuel);
});

run('landing checks real runway alignment, height and speed', () => {
  const p = airportPosition(rome);
  const r = runwayDirection(rome);
  const good = { x: p.x, z: p.z, y: terrainHeight(p.x, p.z) + 6, heading: rome.rwy * Math.PI / 180, speed: 30, pitch: 0.05 };
  eq(landingCheck(good, plane, rome), 'ok');
  eq(landingCheck({ ...good, x: p.x + 400 }, plane, rome), 'off');
  eq(landingCheck({ ...good, y: good.y + 90 }, plane, rome), 'high');
  eq(landingCheck({ ...good, heading: good.heading + Math.PI / 2 }, plane, rome), 'angle');
  eq(landingCheck({ ...good, speed: 130 }, plane, rome), 'fast');
  ok(Math.abs(r.x) <= 1 && Math.abs(r.z) <= 1);
});

run('AI traffic moves between real airports', () => {
  const traffic = createTraffic();
  eq(traffic.length, 8);
  const first = { ...traffic[0] };
  for (let i = 0; i < 60; i++) stepTraffic(traffic, 1 / 60);
  ok(Math.hypot(traffic[0].x - first.x, traffic[0].z - first.z) > 1);
  ok(traffic.every(t => t.y > 0));
});

run('mission checkpoint advances and completes at the last stop', () => {
  const save = { plane: 'cessna', lang: 'en', bests: {}, freeAirport: 'FCO', stats: {}, quality: 'high' };
  const game = new FlightGame(save, () => {});
  game.startMission('primo');
  eq(game.targetIndex, 1);
  eq(game.targetAirport().code, 'NAP');
  const nap = AIRPORTS.find(a => a.code === 'NAP');
  const p = airportPosition(nap);
  game.state.x = p.x; game.state.z = p.z;
  game.state.y = terrainHeight(p.x, p.z) + 5;
  game.state.heading = nap.rwy * Math.PI / 180;
  game.state.speed = 20; game.state.pitch = 0.02;
  game.update(1 / 60, { turn: 0, pitch: 0, throttle: 0.2 });
  eq(game.mode, 'result');
  ok(save.bests['primo:cessna'] >= 0);
  eq(headingDegrees(0), 0);
});

summary(passed, total);
