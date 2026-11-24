/* Pure arcade kart physics and AI — fixed timestep, no DOM */
import { WORLD } from '../config.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrapAngle = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

export function createRacer(kart, track, index, isAI = false) {
  const lane = ((index % 5) - 2) * (track.width * 0.18);
  const start = track.pointAt(0, lane);
  const p = track.project(start.x, start.y);
  return {
    id:isAI ? 'ai' + index : 'player', kart, ai:isAI, lane,
    x:start.x, y:start.y, angle:start.angle, vx:Math.cos(start.angle) * 12, vy:Math.sin(start.angle) * 12, speed:12,
    nitroFuel:kart.nitro, nitroOn:false, drift:false, driftCharge:0,
    boost:0, shield:0, freeze:0, oil:0,
    lap:0, progress:p.distance, lastProgress:p.distance, checkpoints:[false, false, false, false],
    finished:false, finishTime:0, place:index + 1,
    aiSkill:isAI ? 0.78 + (index % 4) * 0.07 : 1,
    lanePhase:index * 1.7
  };
}

export function aiInput(racer, track, time) {
  const offroad = !track.isRoad(racer.x, racer.y);
  const lookahead = offroad ? 40 : 60 + racer.speed * 2.2;
  racer.lanePhase += 0.004;
  const lane = offroad ? 0 : racer.lane + Math.sin(racer.lanePhase) * track.width * 0.12;
  const target = track.pointAt(racer.progress + lookahead, lane);
  const diff = wrapAngle(Math.atan2(target.y - racer.y, target.x - racer.x) - racer.angle);
  return {
    steer:clamp(diff * (offroad ? 3.5 : 2.2), -1, 1),
    throttle:Math.abs(diff) > 0.9 && !offroad ? 0.55 : 1,
    brake:Math.abs(diff) > 1.2 && racer.speed > 11,
    drift:Math.abs(diff) > 0.42 && racer.speed > 8,
    nitro:racer.nitroFuel > 35 && Math.abs(diff) < 0.12 && racer.speed > 10
  };
}

export function stepRacer(racer, input, dt, track) {
  if (racer.finished) return racer;
  racer.justLapped = false;
  const k = racer.kart;
  racer.drift = !!input.drift;
  racer.freeze = Math.max(0, racer.freeze - dt);
  racer.shield = Math.max(0, racer.shield - dt);
  racer.oil = Math.max(0, racer.oil - dt);
  racer.boost = Math.max(0, racer.boost - dt);

  const offroad = !track.isRoad(racer.x, racer.y);
  const nitroOn = !!input.nitro && racer.nitroFuel > 0;
  racer.nitroOn = nitroOn;
  if (nitroOn) racer.nitroFuel = Math.max(0, racer.nitroFuel - 26 * dt);
  else racer.nitroFuel = Math.min(k.nitro, racer.nitroFuel + 9 * dt);

  let maxSpeed = k.speed * (nitroOn ? 1.45 : 1) * (racer.boost > 0 ? 1.25 : 1);
  if (offroad) maxSpeed *= 0.52;
  if (racer.freeze > 0) maxSpeed *= 0.42;
  if (racer.oil > 0) maxSpeed *= 0.65;
  if (racer.ai) maxSpeed *= racer.aiSkill;

  const steerPower = k.handling * dt * Math.min(1, 0.35 + Math.hypot(racer.vx, racer.vy) / k.speed);
  racer.angle = wrapAngle(racer.angle + (input.steer || 0) * steerPower * (racer.drift ? 1.35 : 1));

  const thrust = k.accel * (input.throttle ?? 1) * dt * (racer.freeze > 0 ? 0.45 : 1);
  racer.vx += Math.cos(racer.angle) * thrust;
  racer.vy += Math.sin(racer.angle) * thrust;

  const speed = Math.hypot(racer.vx, racer.vy);
  const grip = k.grip * (racer.drift ? 0.35 : 1) * (offroad ? 0.7 : 1);
  const blend = Math.min(1, dt * 7 * grip);
  racer.vx += (Math.cos(racer.angle) * speed - racer.vx) * blend;
  racer.vy += (Math.sin(racer.angle) * speed - racer.vy) * blend;

  const drag = input.brake ? 0.955 : (offroad ? 0.984 : 0.995);
  racer.vx *= drag; racer.vy *= drag;
  let sp = Math.hypot(racer.vx, racer.vy);
  if (sp > maxSpeed) { racer.vx *= maxSpeed / sp; racer.vy *= maxSpeed / sp; sp = maxSpeed; }
  racer.speed = sp;

  racer.x += racer.vx * dt; racer.y += racer.vy * dt;
  if (racer.x < 12 || racer.x > WORLD.w - 12) { racer.x = clamp(racer.x, 12, WORLD.w - 12); racer.vx *= -0.3; }
  if (racer.y < 12 || racer.y > WORLD.h - 12) { racer.y = clamp(racer.y, 12, WORLD.h - 12); racer.vy *= -0.3; }

  if (racer.drift && Math.abs(input.steer || 0) > 0.2 && sp > 5) {
    racer.driftCharge = Math.min(1, racer.driftCharge + dt * 0.9);
  } else if (racer.driftCharge > 0.32) {
    racer.boost = Math.max(racer.boost, 0.5 + racer.driftCharge * 0.9);
    racer.driftCharge = 0;
  } else if (!racer.drift) racer.driftCharge = Math.max(0, racer.driftCharge - dt * 2);

  const p = track.project(racer.x, racer.y);
  racer.lastProgress = racer.progress;
  racer.progress = p.distance;
  racer.checkpoints[track.checkpoint(p.distance)] = true;
  const delta = racer.progress - racer.lastProgress;
  if (delta < -track.total * 0.5 && racer.checkpoints.every(Boolean)) {
    racer.lap++;
    racer.justLapped = true;
    racer.checkpoints = [false, false, false, false];
  } else if (delta > track.total * 0.5) racer.lap = Math.max(0, racer.lap - 1);

  return racer;
}

export function resolveCollisions(racers) {
  for (let i = 0; i < racers.length; i++) {
    for (let j = i + 1; j < racers.length; j++) {
      const a = racers[i], b = racers[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d > 26 || d < 0.001) continue;
      const push = (26 - d) / 2, nx = dx / d, ny = dy / d;
      a.x -= nx * push; a.y -= ny * push;
      b.x += nx * push; b.y += ny * push;
      a.vx *= 0.92; a.vy *= 0.92; b.vx *= 0.92; b.vy *= 0.92;
      if (a.shield > 0 && b.shield <= 0) { b.vx += nx * 60; b.vy += ny * 60; }
      if (b.shield > 0 && a.shield <= 0) { a.vx -= nx * 60; a.vy -= ny * 60; }
    }
  }
}

export function standings(racers, track) {
  return racers.slice().sort((a, b) => score(b, track) - score(a, track));
}
const score = (r, track) => r.finished ? 1e9 - r.finishTime : r.lap * track.total + r.progress;
