/* Headless checks for the force-based flight model. */
import { test, eq, ok, near, summary } from '../../_kit/test-harness.js';
import { readFileSync } from 'node:fs';
import { AIRPORTS, PLANES } from '../js/config.js';
import { initGeo, geoToWorld, terrainHeight } from '../js/geo.js';
import { createFlight, stepFlight, setStateModel, relaunch, flightModelFor } from '../js/flight.js';
import { airDensity, attitudeFromQuat, quatFromAttitude, performance, stallAlpha, engineThrust } from '../js/flight-model.js';
import { FlightGame } from '../js/game.js';

const base = new URL('../data/', import.meta.url);
const heightBuf = readFileSync(new URL('italy-height.bin', base));
const json = name => JSON.parse(readFileSync(new URL(name, base), 'utf8'));
initGeo(new DataView(new Uint8Array(heightBuf).buffer), json('italy-meta.json'), json('italy-vector.json'));

let passed = 0, total = 0;
const run = (name, fn) => { total++; if (test(name, fn)) passed++; };

const DT = 1 / 60;
const rome = AIRPORTS.find(a => a.code === 'FCO');
const aircraft = PLANES.filter(p => p.aero);
const DEG = 180 / Math.PI;

/* High above the sea-level airport, with an endless tank, so only aerodynamics matter. */
function airborne(plane, height = 400) {
  const s = createFlight(plane, rome, height, 'real');
  s.fuel = 1e9;
  return s;
}
function fly(s, plane, seconds, input, each) {
  for (let i = 0; i < Math.round(seconds / DT); i++) {
    stepFlight(s, plane, typeof input === 'function' ? input(s, i * DT) : input, DT);
    each?.(s, i * DT);
    if (s.status !== 'flying') break;
  }
  return s;
}
const hold = (throttle, extra = {}) => ({ turn: 0, pitch: 0, yaw: 0, trim: 0, throttle, ...extra });
const finite = s => ['x', 'y', 'z', 'speed', 'pitch', 'roll', 'heading', 'alpha', 'beta', 'gLoad'].every(k => Number.isFinite(s[k]));

run('fixed-wing aircraft have aero data; helicopter and starships stay arcade', () => {
  eq(aircraft.map(p => p.id).sort().join(), 'airliner,concorde,cessna,cub,f35,jet,stol'.split(',').sort().join());
  for (const p of PLANES) {
    const expected = p.aero ? 'real' : 'arcade';
    eq(flightModelFor(p, 'real'), expected, p.id);
    eq(createFlight(p, rome, 220, 'real').model, expected, p.id);
    eq(createFlight(p, rome).model, 'arcade', p.id);
  }
});

run('attitude survives the quaternion round trip', () => {
  for (const [h, p, r] of [[0, 0, 0], [1.2, 0.3, -0.7], [4.5, -0.4, 1.2], [6.1, 0.9, 2.5]]) {
    const a = attitudeFromQuat(quatFromAttitude(h, p, r));
    near(a.heading, h, 1e-9); near(a.pitch, p, 1e-9); near(a.roll, r, 1e-9);
  }
});

run('air thins with height and engines lose thrust', () => {
  near(airDensity(0), 1.225, 0.001);
  ok(airDensity(400) < airDensity(100));
  ok(airDensity(1500) < airDensity(1000));
  for (const p of aircraft) ok(engineThrust(p.aero, 1, p.aero.cruise, airDensity(900)) < engineThrust(p.aero, 1, p.aero.cruise, airDensity(0)), p.id);
});

for (const plane of aircraft) {
  run(`${plane.id}: stall and top speed agree with the hangar figures`, () => {
    const { stallSpeed, maxLevelSpeed } = performance(plane);
    ok(Math.abs(stallSpeed / plane.stall - 1) < 0.15, `stall ${stallSpeed.toFixed(1)} vs ${plane.stall}`);
    const ratio = maxLevelSpeed / plane.maxSpeed;
    ok(ratio > 0.65 && ratio < 1.05, `top ${maxLevelSpeed.toFixed(1)} vs ${plane.maxSpeed}`);
    ok(plane.landSpeed > stallSpeed, 'can be flown below landing speed');
  });

  run(`${plane.id}: flies hands-off in trim for two minutes`, () => {
    const s = airborne(plane);
    let minV = Infinity, maxV = 0, maxBank = 0;
    fly(s, plane, 120, hold(0.6), st => {
      minV = Math.min(minV, st.speed); maxV = Math.max(maxV, st.speed);
      maxBank = Math.max(maxBank, Math.abs(st.roll));
    });
    eq(s.status, 'flying');
    ok(finite(s));
    ok(minV > plane.stall && maxV < plane.maxSpeed * 1.25, `speed ${minV.toFixed(0)}..${maxV.toFixed(0)}`);
    ok(maxBank < 0.05, `bank ${maxBank}`);
  });

  run(`${plane.id}: full power climbs, idle descends`, () => {
    const up = airborne(plane), down = airborne(plane);
    const y = up.y;
    fly(up, plane, 40, hold(1));
    // Long enough for the engines to spool down and the extra speed to bleed off.
    fly(down, plane, 30, hold(0));
    ok(up.y > y + 40, `climbed ${(up.y - y).toFixed(0)}`);
    ok(down.y < y - 5, `idle changed ${(down.y - y).toFixed(0)}`);
    eq(up.status, 'flying'); eq(down.status, 'flying');
  });

  run(`${plane.id}: banking turns the aircraft with little sideslip`, () => {
    const s = airborne(plane);
    const heading = s.heading;
    // Roll to about 30 degrees, then hold it with a light back pressure.
    fly(s, plane, 8, st => hold(0.8, { turn: Math.max(-1, Math.min(1, (0.52 - st.roll) * 3)), pitch: 0.15 }));
    ok(s.roll > 0.3, `bank ${(s.roll * DEG).toFixed(0)}`);
    const turned = ((s.heading - heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    ok(turned > 0.12, `turned ${(turned * DEG).toFixed(1)} deg`);
    ok(Math.abs(s.beta) < 0.09, `sideslip ${(s.beta * DEG).toFixed(1)} deg`);
  });

  run(`${plane.id}: rudder yaws the nose the way it is pushed`, () => {
    const s = airborne(plane);
    const heading = s.heading;
    fly(s, plane, 1.5, hold(0.7, { yaw: 1 }));
    ok(((s.heading - heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI > 0.01);
  });

  run(`${plane.id}: full back stick at idle ${plane.aero.limiter ? 'is held by the alpha limiter' : 'stalls'}`, () => {
    const s = airborne(plane, 700);
    let maxAlpha = 0, warned = false;
    fly(s, plane, 40, hold(0, { pitch: 1 }), st => { maxAlpha = Math.max(maxAlpha, st.alpha); warned ||= st.stallWarn; });
    ok(finite(s));
    ok(warned, `no warning, max alpha ${(maxAlpha * DEG).toFixed(1)}`);
    if (plane.aero.limiter) ok(maxAlpha < stallAlpha(plane.aero) + 0.03, `alpha ${(maxAlpha * DEG).toFixed(1)}`);
    else ok(maxAlpha > stallAlpha(plane.aero), `alpha ${(maxAlpha * DEG).toFixed(1)}`);
  });

  run(`${plane.id}: a hard pull at speed respects the g limit`, () => {
    const s = airborne(plane);
    fly(s, plane, 20, hold(1));
    let maxG = 0;
    fly(s, plane, 4, hold(1, { pitch: 1 }), st => { maxG = Math.max(maxG, st.gLoad); });
    ok(maxG > 1.15, `g ${maxG.toFixed(2)}`);
    ok(maxG < plane.aero.gMax * 1.15, `g ${maxG.toFixed(2)} over ${plane.aero.gMax}`);
  });

  run(`${plane.id}: random handling never produces NaN`, () => {
    const s = airborne(plane, 600);
    let seed = 7;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
    let input = hold(0.8);
    fly(s, plane, 120, (st, t) => {
      if (Math.round(t / DT) % 45 === 0) input = { turn: rnd(), pitch: rnd(), yaw: rnd(), trim: rnd(), throttle: Math.abs(rnd()), brake: rnd() > 0.7, boost: rnd() > 0.7 };
      return input;
    }, st => { if (!finite(st)) throw new Error('non-finite state'); });
    ok(finite(s));
  });
}

run('a gentle touchdown rolls out, a hard one crashes', () => {
  const plane = PLANES[0];
  const place = sink => {
    const s = airborne(plane);
    s.y = terrainHeight(s.x, s.z) + 1.6;
    s.vx = Math.sin(s.heading) * 30; s.vz = -Math.cos(s.heading) * 30; s.vy = -sink;
    s.airborne = true;
    s.pitch = 0.08; s.quat = quatFromAttitude(s.heading, 0.08, 0);
    return s;
  };
  const soft = place(1.5);
  fly(soft, plane, 1, hold(0, { brake: true }));
  eq(soft.status, 'flying'); eq(soft.onGround, true);
  ok(soft.speed < 28, `still ${soft.speed.toFixed(1)}`);
  const hard = place(14);
  fly(hard, plane, 1, hold(0));
  eq(hard.status, 'crashed');
});

run('switching model mid-flight keeps position and heading', () => {
  const plane = PLANES[0];
  const s = createFlight(plane, rome);
  fly(s, plane, 3, hold(0.7, { turn: 0.5 }));
  const { x, z, heading } = s;
  setStateModel(s, plane, 'real');
  eq(s.model, 'real'); near(s.x, x, 1e-9); near(s.z, z, 1e-9); near(s.heading, heading, 1e-9);
  fly(s, plane, 3, hold(0.7));
  eq(s.status, 'flying');
  setStateModel(s, plane, 'arcade');
  eq(s.model, 'arcade'); ok(Math.abs(s.pitch) <= 0.55);
});

run('game remembers the chosen flight model', () => {
  const save = { plane: 'cessna', lang: 'en', bests: {}, stats: {}, quality: 'high' };
  const game = new FlightGame(save, () => {});
  eq(game.flightModel, 'arcade');
  game.startFree('FCO');
  game.setFlightModel('real');
  eq(save.flightModel, 'real'); eq(game.state.model, 'real');
  game.restart();
  eq(game.state.model, 'real');
  eq(Math.round(game.hud().g), 1);
});

summary(passed, total);
