/* Headless checks for airfields, take-off, landing, autopilot and instruments data. */
import { test, eq, ok, near, summary } from '../../_kit/test-harness.js';
import { readFileSync } from 'node:fs';
import { AIRPORTS, PLANES } from '../js/config.js';
import { initGeo, geoToWorld, terrainHeight, distanceKm } from '../js/geo.js';
import { RUNWAY, GLIDE_SLOPE, airfield, airfields, runwayCoords, runwayAt, approachGuidance, gradeLanding, threshold } from '../js/airfields.js';
import { createFlight, stepFlight, cycleFlaps, toggleGear } from '../js/flight.js';
import { CRUISE_MOTION, GROUND_MOTION, initRealState, motionFactor, performance } from '../js/flight-model.js';
import { createAutopilot, stepAutopilot } from '../js/autopilot.js';
import { FlightGame } from '../js/game.js';

const base = new URL('../data/', import.meta.url);
const heightBuf = readFileSync(new URL('italy-height.bin', base));
const json = name => JSON.parse(readFileSync(new URL(name, base), 'utf8'));
initGeo(new DataView(new Uint8Array(heightBuf).buffer), json('italy-meta.json'), json('italy-vector.json'));
const landmarks = json('landmarks.json').landmarks;

let passed = 0, total = 0;
const run = (name, fn) => { total++; if (test(name, fn)) passed++; };

const DT = 1 / 60;
const aircraft = PLANES.filter(p => p.aero);
const airport = code => AIRPORTS.find(a => a.code === code);
const input = (extra = {}) => ({ turn: 0, pitch: 0, yaw: 0, trim: 0, throttle: 0, ...extra });
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

run('every airfield is flat along and beside its runway', () => {
  eq(airfields().length, AIRPORTS.length);
  for (const f of airfields()) {
    for (let along = -RUNWAY.half; along <= RUNWAY.half; along += 5) {
      for (const across of [-18, -8, 0, 8, 18]) {
        const x = f.x + f.dir.x * along - f.dir.z * across;
        const z = f.z + f.dir.z * along + f.dir.x * across;
        near(terrainHeight(x, z), f.elevation, 0.6, `${f.code} ${along}/${across}`);
      }
    }
  }
});

run('approach paths clear the terrain at every runway end', () => {
  for (const f of airfields()) {
    for (const end of [1, -1]) {
      for (let distance = 5; distance <= 400; distance += 5) {
        const along = (RUNWAY.aim - RUNWAY.half - distance) * end;
        const ground = terrainHeight(f.x + f.dir.x * along, f.z + f.dir.z * along);
        const path = f.elevation + distance * GLIDE_SLOPE;
        ok(ground <= path + 0.6, `${f.code}/${end} at ${distance}: ground ${ground.toFixed(1)} path ${path.toFixed(1)}`);
      }
    }
  }
});

run('runways do not overlap each other or sit on landmarks', () => {
  for (const a of airfields()) {
    for (const b of airfields()) if (a !== b) ok(Math.hypot(a.x - b.x, a.z - b.z) >= 54, `${a.code}/${b.code}`);
    for (const l of landmarks) {
      const p = geoToWorld(l.lon, l.lat);
      const { along, across } = runwayCoords(a, p.x, p.z);
      const gap = Math.hypot(Math.max(0, Math.abs(along) - RUNWAY.half), Math.max(0, Math.abs(across) - RUNWAY.width / 2));
      ok(gap > (l.kind === 'volcano' ? 46 : 6), `${a.code} too close to ${l.id}: ${gap.toFixed(0)}`);
    }
  }
});

run('map motion is compressed, more so near the ground', () => {
  near(motionFactor(0), GROUND_MOTION, 1e-9);
  near(motionFactor(200), CRUISE_MOTION, 1e-9);
  ok(motionFactor(20) > GROUND_MOTION && motionFactor(20) < CRUISE_MOTION);
});

run('guidance reads centred on the path and points back when off it', () => {
  const f = airfield('FCO');
  const place = (distance, across, height) => {
    const along = RUNWAY.aim - RUNWAY.half - distance;
    return approachGuidance(f.x + f.dir.x * along - f.dir.z * across, f.elevation + 1.5 + height,
      f.z + f.dir.z * along + f.dir.x * across, f.heading);
  };
  const on = place(200, 0, 20);
  eq(on.code, 'FCO'); near(on.lateral, 0, 0.05); near(on.vertical, 0, 0.05);
  ok(place(200, 15, 20).lateral > 0.3);
  ok(place(200, -15, 20).lateral < -0.3);
  ok(place(200, 0, 40).vertical > 0.3);
  ok(place(200, 0, 5).vertical < -0.3);
});

run('landing grade rewards a soft, centred touchdown', () => {
  const f = airfield('FCO');
  const touch = (across, sink, along = RUNWAY.aim - RUNWAY.half) => ({
    x: f.x + f.dir.x * along - f.dir.z * across, z: f.z + f.dir.z * along + f.dir.x * across,
    heading: f.heading, sink, speed: 30
  });
  eq(gradeLanding(f, touch(0, 0.5)).score, 100);
  ok(gradeLanding(f, touch(6, 3)).score < 70);
  ok(gradeLanding(f, touch(0, 0.5, 60)).score < 90);
  eq(runwayAt(f.x, f.z).code, 'FCO');
});

run('distances are real kilometres', () => {
  near(distanceKm(airport('FCO'), airport('MXP')), 513, 15);
});

for (const plane of aircraft) {
  run(`${plane.id}: starts stationary on the runway and stays put at idle`, () => {
    const s = createFlight(plane, airport('FCO'), 220, 'real', true);
    const { x, z } = s;
    eq(s.onGround, true); eq(s.gear, true); eq(s.flaps, 1);
    for (let i = 0; i < 300; i++) stepFlight(s, plane, input(), DT);
    eq(s.status, 'flying'); near(s.speed, 0, 0.01); near(s.x, x, 0.01); near(s.z, z, 0.01);
    eq(s.touchdown, null);
    toggleGear(s, plane); eq(s.gear, true, 'gear must not retract on the ground');
  });

  run(`${plane.id}: takes off within the runway`, () => {
    for (const code of ['FCO', 'MXP', 'NAP', 'CTA']) {
      const s = createFlight(plane, airport(code), 220, 'real', true);
      const f = airfield(code);
      let along = null;
      for (let i = 0; i < 60 / DT; i++) {
        stepFlight(s, plane, input({ throttle: 1, pitch: s.speed > plane.stall * 1.15 && s.pitch < 0.17 ? 0.4 : 0 }), DT);
        if (s.status !== 'flying') break;
        if (s.y - f.elevation > 4) { along = runwayCoords(f, s.x, s.z).along; break; }
      }
      eq(s.status, 'flying', code);
      ok(along !== null && along < RUNWAY.half + 15, `${code}: lifted off at ${along?.toFixed(0)}`);
    }
  });

  run(`${plane.id}: flaps lower the stall speed`, () => {
    ok(performance(plane, 0, 2).stallSpeed < performance(plane, 0, 1).stallSpeed);
    ok(performance(plane, 0, 1).stallSpeed < performance(plane).stallSpeed);
    const s = createFlight(plane, airport('FCO'), 220, 'real');
    cycleFlaps(s); eq(s.flaps, 1); cycleFlaps(s); cycleFlaps(s); eq(s.flaps, 0);
  });

  run(`${plane.id}: autopilot holds heading and altitude`, () => {
    const s = createFlight(plane, airport('FCO'), 400, 'real');
    s.fuel = 1e9;
    const ap = createAutopilot(s, plane);
    ap.heading = (s.heading + 1.2) % (Math.PI * 2);
    ap.altitude = s.y + 50;
    let worstAlt = 0, worstHdg = 0;
    for (let i = 0; i < 150 / DT; i++) {
      stepFlight(s, plane, stepAutopilot(ap, s, plane, DT), DT);
      if (i * DT > 100) {
        worstAlt = Math.max(worstAlt, Math.abs(s.y - ap.altitude));
        worstHdg = Math.max(worstHdg, Math.abs(wrap(s.heading - ap.heading)));
      }
    }
    eq(s.status, 'flying');
    ok(worstAlt < 8, `altitude error ${worstAlt.toFixed(1)}`);
    ok(worstHdg < 0.08, `heading error ${(worstHdg * 57.3).toFixed(1)} deg`);
  });

  run(`${plane.id}: a flown approach lands, stops and is graded`, () => {
    const save = { plane: plane.id, flightModel: 'real', lang: 'en', bests: {}, stats: { flights: 0, landings: 0, crashes: 0 }, quality: 'high' };
    const game = new FlightGame(save, () => {});
    game.startMission('primo');
    const s = game.state, f = airfield('NAP');
    const distance = 380, along = RUNWAY.aim - RUNWAY.half - distance;
    const approach = performance(plane, 0, 2).stallSpeed * 1.3;
    Object.assign(s, { heading: f.heading, x: f.x + f.dir.x * along, z: f.z + f.dir.z * along, y: f.elevation + 1.5 + (distance + 65) * GLIDE_SLOPE });
    initRealState(s, plane, approach, { flaps: 2, gear: true });
    s.fuel = plane.fuel;
    const ap = createAutopilot(s, plane);
    ap.speed = approach;
    let touchedSink = null;
    for (let i = 0; i < 150 / DT && game.mode === 'play'; i++) {
      const local = runwayCoords(f, s.x, s.z);
      const toAim = RUNWAY.aim - RUNWAY.half - local.along;
      const height = s.y - f.elevation - 1.5;
      /* Follow the glide path, flare for the last few units, then idle and brake. */
      /* Sink rate that matches the path at this map speed, plus a correction. */
      const path = f.elevation + 1.5 + Math.max(0, toAim + 65) * GLIDE_SLOPE;
      const follow = -s.speed * motionFactor(height) * GLIDE_SLOPE + (path - s.y) * 0.2;
      ap.heading = f.heading - Math.max(-0.25, Math.min(0.25, local.across * 0.02));
      const flare = height < 7;
      ap.verticalSpeed = flare ? -Math.max(0.8, height * 0.3) : follow;
      const c = stepAutopilot(ap, s, plane, DT);
      if (flare) c.throttle = 0;
      if (s.onGround) Object.assign(c, { throttle: 0, pitch: 0, turn: 0, brake: true, yaw: Math.max(-1, Math.min(1, wrap(f.heading - s.heading) * 4)) });
      game.update(DT, c);
      if (s.touchdown) touchedSink = s.touchdown.sink;
      if (game.state !== s) break;
    }
    eq(game.state, s, `crashed (crashes ${game.stats.crashes})`);
    eq(game.stats.landings, 1, `no landing: height ${(s.y - s.ground).toFixed(1)} speed ${s.speed.toFixed(0)} along ${runwayCoords(f, s.x, s.z).along.toFixed(0)}`);
    eq(game.mode, 'result');
    ok(game.result.grade.score > 30, `score ${game.result.grade.score} ${JSON.stringify(game.result.grade)}`);
  });
}

run('moving the stick disconnects the autopilot', () => {
  const save = { plane: 'cessna', flightModel: 'real', lang: 'en', bests: {}, stats: { flights: 0, landings: 0, crashes: 0 }, quality: 'high' };
  const game = new FlightGame(save, () => {});
  game.startFree('FCO');
  game.toggleAutopilot();
  ok(game.autopilot);
  game.update(DT, input({ throttle: 0.7 }));
  ok(game.autopilot);
  game.update(DT, input({ throttle: 0.7, turn: 1 }));
  eq(game.autopilot, null);
});

run('navigation mode turns towards the chosen destination', () => {
  const save = { plane: 'cessna', flightModel: 'real', lang: 'en', bests: {}, stats: { flights: 0, landings: 0, crashes: 0 }, quality: 'high' };
  const game = new FlightGame(save, () => {});
  game.setDestination('MXP');
  game.startFree('FCO');
  eq(game.destination().code, 'MXP');
  const f = airfield('MXP');
  const off = () => Math.abs(wrap(Math.atan2(f.x - game.state.x, -(f.z - game.state.z)) - game.state.heading));
  game.state.heading = Math.PI; initRealState(game.state, game.plane);
  const before = off();
  game.autopilot = null; game.toggleNav();
  game.state.fuel = 1e9;
  let best = before;
  for (let i = 0; i < 40 / DT; i++) { game.update(DT, input({ throttle: 0.7 })); best = Math.min(best, off()); }
  ok(before > 1 && best < 0.15, `closest ${(best * 57.3).toFixed(0)} deg, was ${(before * 57.3).toFixed(0)}`);
  eq(game.hud().autopilot.mode, 'nav');
});

run('runway start, line up, and mission respawn at the departure stop', () => {
  const save = { plane: 'cessna', flightModel: 'real', startMode: 'runway', lang: 'en', bests: {}, stats: { flights: 0, landings: 0, crashes: 0 }, quality: 'high' };
  const game = new FlightGame(save, () => {});
  game.startMission('primo');
  eq(game.state.onGround, true);
  game.toggleAutopilot(); eq(game.autopilot, null, 'no autopilot on the ground');
  eq(game.canLineUp(), false, 'already lined up');
  ok(game.hud().dist > 100, 'distance to the next stop'); eq(game.hud().g, 1);
  game.startFree('MXP');
  eq(game.hud().dist, null, 'parked at the destination');
  game.startMission('primo');
  const f = airfield('FCO');
  game.state.x = f.x; game.state.z = f.z; game.state.heading = f.heading + Math.PI;
  ok(game.lineUp());
  const t = threshold(f, -1);
  near(game.state.x, t.x, 0.01); near(game.state.heading, t.heading, 0.01);
  game.state.status = 'crashed';
  game.update(DT, input());
  eq(game.stats.crashes, 1);
  ok(Math.hypot(game.state.x - f.x, game.state.z - f.z) < RUNWAY.half + 1, 'respawned away from FCO');
});

run('arcade flights still start in the air', () => {
  const save = { plane: 'heli', flightModel: 'real', startMode: 'runway', lang: 'en', bests: {}, stats: { flights: 0, landings: 0, crashes: 0 }, quality: 'high' };
  const game = new FlightGame(save, () => {});
  game.startFree('FCO');
  eq(game.state.model, 'arcade'); ok(game.state.y > game.state.ground + 100);
});

summary(passed, total);
