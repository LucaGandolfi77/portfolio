import { test, eq, ok, near, summary } from '../../_kit/test-harness.js';
import { AIRPORTS, MISSIONS, PLANES, STR, WORLD } from '../js/config.js';
import { AIRPORTS_W, cameraFor, screenToWorld, worldToScreen, airportByCode } from '../js/map.js';
import { createFlight, landingCheck, stepFlight } from '../js/flight.js';
import { FlightGame } from '../js/game.js';

let passed = 0, total = 0;
const run = (name, fn) => { total++; if (test(name, fn)) passed++; };

const plane = PLANES[0];
const rome = airportByCode('FCO');

run('world/screen projection round-trips', () => {
  const cam = { x: 700, y: 560, zoom: 0.8 };
  const w = 390, h = 844;
  const s = worldToScreen(320.5, 910.25, cam, w, h);
  const back = screenToWorld(s.x, s.y, cam, w, h);
  near(back.x, 320.5, 0.001);
  near(back.y, 910.25, 0.001);
});

run('overview camera fits the whole country', () => {
  const cam = cameraFor('overview', null, 390, 844);
  ok(cam.zoom < 0.35 && cam.zoom > 0.1);
  eq(cam.x, WORLD.w / 2);
  eq(cam.y, WORLD.h / 2);
});

run('follow camera tracks the aircraft', () => {
  const s = createFlight(plane, rome);
  s.x = 400; s.y = 300;
  const cam = cameraFor('follow', s, 390, 844);
  ok(Math.abs(cam.x - s.x) < 60 && Math.abs(cam.y - s.y) < 60);
  ok(cam.zoom >= 0.55);
});

run('every airport is scaled inside the world', () => {
  eq(AIRPORTS_W.length, AIRPORTS.length);
  ok(AIRPORTS_W.every(a => a.x > 0 && a.x < WORLD.w && a.y > 0 && a.y < WORLD.h));
  ok(AIRPORTS_W.every(a => a.code && a.rwy >= 0 && a.rwy < 360));
});

run('mission stop codes are valid', () => {
  ok(MISSIONS.length >= 4);
  for (const m of MISSIONS) {
    ok(m.stops.length >= 2);
    ok(m.stops.every(code => !!airportByCode(code)), `bad stop in ${m.id}`);
  }
});

run('EN and IT dictionaries have the same keys', () => {
  const a = Object.keys(STR.en).sort().join(',');
  const b = Object.keys(STR.it).sort().join(',');
  eq(a, b);
});

run('start state is airborne with full fuel', () => {
  const f = createFlight(plane, rome);
  eq(f.fuel, plane.fuel);
  eq(f.alt, 90);
  eq(f.status, 'flying');
  near(f.heading, rome.rwy * Math.PI / 180, 0.0001);
});

run('flight accelerates, moves and burns fuel', () => {
  const f = createFlight(plane, rome);
  const x = f.x, y = f.y, fuel = f.fuel;
  for (let i = 0; i < 60; i++) stepFlight(f, plane, { turn: 0, pitch: 0, throttle: 1 }, 1 / 60);
  ok(f.speed > plane.stall + 22);
  ok(Math.hypot(f.x - x, f.y - y) > 10);
  ok(f.fuel < fuel);
});

run('turn input changes heading without moving outside the world', () => {
  const f = createFlight(plane, rome);
  const h = f.heading;
  for (let i = 0; i < 60; i++) stepFlight(f, plane, { turn: 1, pitch: 0, throttle: 0.6 }, 1 / 60);
  ok(f.heading > h);
  ok(f.x >= -30 && f.x <= WORLD.w + 30 && f.y >= -30 && f.y <= WORLD.h + 30);
});

run('empty fuel stops acceleration', () => {
  const f = createFlight(plane, rome);
  f.fuel = 0;
  for (let i = 0; i < 60; i++) stepFlight(f, plane, { turn: 0, pitch: 0, throttle: 1 }, 1 / 60);
  eq(f.fuel, 0);
  ok(f.speed < plane.stall + 22);
});

run('landing needs the right spot, height, angle and speed', () => {
  const good = { x: rome.x, y: rome.y, heading: rome.rwy * Math.PI / 180, alt: 8, speed: 30 };
  eq(landingCheck(good, plane, rome), 'ok');
  eq(landingCheck({ ...good, x: rome.x + 300 }, plane, rome), 'off');
  eq(landingCheck({ ...good, alt: 90 }, plane, rome), 'high');
  eq(landingCheck({ ...good, heading: good.heading + 1.2 }, plane, rome), 'angle');
  eq(landingCheck({ ...good, speed: 120 }, plane, rome), 'fast');
});

run('helicopter landing ignores runway alignment', () => {
  const heli = PLANES.find(p => p.kind === 'heli');
  const f = { x: rome.x, y: rome.y, heading: rome.rwy * Math.PI / 180 + 1.2, alt: 8, speed: 10 };
  eq(landingCheck(f, heli, rome), 'ok');
});

run('a mission checkpoint advances and completes on the last stop', () => {
  const save = { plane: 'cessna', lang: 'en', bests: {}, freeAirport: 'FCO', stats: {} };
  const game = new FlightGame(save, () => {});
  game.setViewport(390, 800);
  game.startMission('primo');
  eq(game.targetIndex, 1);
  eq(game.targetAirport().code, 'NAP');
  const nap = airportByCode('NAP');
  game.state.x = nap.x; game.state.y = nap.y;
  game.state.heading = nap.rwy * Math.PI / 180;
  game.state.alt = 6; game.state.speed = 20;
  game.update(1 / 60, { turn: 0, pitch: 0, throttle: 0.2 });
  eq(game.mode, 'result');
  ok(game.result.time >= 0);
  ok(save.bests['primo:cessna'] >= 0);
});

run('roster has 11 craft including 3 starships', () => {
  eq(PLANES.length, 11);
  eq(PLANES.filter(p => p.starship).length, 3);
  ok(PLANES.every(p => p.boost > 1 && p.landSpeed > p.stall && p.maxSpeed > p.stall));
});

run('starships are about twice as fast as jets', () => {
  const jet = PLANES.find(p => p.id === 'jet');
  const ships = PLANES.filter(p => p.starship);
  ok(ships.every(s => s.maxSpeed >= jet.maxSpeed * 1.8 && s.maxSpeed <= jet.maxSpeed * 2.4));
});

run('boost raises speed and burns extra fuel', () => {
  const normal = createFlight(plane, rome);
  const boosted = createFlight(plane, rome);
  for (let i = 0; i < 60; i++) {
    stepFlight(normal, plane, { turn: 0, pitch: 0, throttle: 1 }, 1 / 60);
    stepFlight(boosted, plane, { turn: 0, pitch: 0, throttle: 1, boost: true }, 1 / 60);
  }
  eq(boosted.boosting, true);
  ok(boosted.speed > normal.speed * 1.05);
  ok(boosted.fuel < normal.fuel);
});

run('faster craft zoom out on the compact map', () => {
  const ship = PLANES.find(p => p.starship);
  const slow = createFlight(plane, rome);
  const fast = createFlight(ship, rome);
  fast.speed = ship.maxSpeed;
  const zSlow = cameraFor('follow', slow, 390, 844).zoom;
  const zFast = cameraFor('follow', fast, 390, 844).zoom;
  ok(zFast < zSlow * 0.7);
});

summary(passed, total);
