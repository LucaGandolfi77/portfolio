/* Pure race rules — laps, standings, power-ups, knockout and ghosts */
import { MODES, POWERUPS } from '../config.js';
import { createRacer, aiInput, stepRacer, resolveCollisions, standings } from './physics.js';

const rnd = (seed) => { let a = seed >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; };

export function createRace(modeId, track, kart, options = {}) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const rand = rnd(options.seed || 42);
  const racers = [createRacer(kart, track, 0, false)];
  const rivalKarts = options.rivalKarts || [];
  for (let i = 1; i <= mode.rivals; i++) {
    const rk = rivalKarts[(i - 1) % Math.max(1, rivalKarts.length)] || kart;
    racers.push(createRacer(rk, track, i, true));
  }
  return {
    mode, track, racers, rand, time:0, countdown:3.2, phase:'countdown',
    powerups:mode.powerups ? Array.from({ length:5 }, (_, i) => ({
      type:POWERUPS[i % POWERUPS.length].id, ...track.pointAt((i + 0.5) / 5 * track.total, (i % 2 ? 1 : -1) * track.width * 0.2)
    })) : [],
    oils:[], events:[], lapTimes:[], lastLapAt:0, ghost:[], ghostRef:options.ghost || null,
    eliminated:new Set(), result:null
  };
}

export function applyPowerup(race, racer, type) {
  const events = race.events;
  if (type === 'turbo') racer.boost = Math.max(racer.boost, 1.4);
  if (type === 'shield') racer.shield = 5;
  if (type === 'freeze') race.racers.forEach(r => { if (r !== racer) r.freeze = 1.5; });
  if (type === 'rocket') { racer.boost = Math.max(racer.boost, 2.2); racer.vx += Math.cos(racer.angle) * 90; racer.vy += Math.sin(racer.angle) * 90; }
  if (type === 'oil') race.oils.push({ x:racer.x - Math.cos(racer.angle) * 30, y:racer.y - Math.sin(racer.angle) * 30, life:14 });
  events.push({ type:'powerup', id:type, racer:racer.id });
}

export function updateRace(race, dt, playerInput) {
  race.events = [];
  if (race.phase === 'countdown') {
    race.countdown -= dt;
    if (race.countdown <= 0) race.phase = 'racing';
    return race;
  }
  if (race.phase !== 'racing') return race;
  race.time += dt;

  race.racers.forEach((r, i) => {
    if (r.eliminated || r.finished) return;
    const input = r.ai ? aiInput(r, race.track, race.time) : (playerInput || {});
    stepRacer(r, input, dt, race.track);
    if (r.justLapped) {
      const lapTime = race.time - race.lastLapAt;
      race.lastLapAt = race.time;
      if (!r.ai) race.lapTimes.push(lapTime);
      race.events.push({ type:'lap', racer:r.id, lap:r.lap, time:lapTime });
      if (r.lap >= race.mode.laps) {
        r.finished = true; r.finishTime = race.time;
        race.events.push({ type:'finish', racer:r.id, time:race.time });
      }
    }
    if (!r.ai && Math.floor(race.time * 10) !== Math.floor((race.time - dt) * 10)) {
      race.ghost.push({ x:r.x, y:r.y, angle:r.angle, t:race.time });
    }
  });

  resolveCollisions(race.racers.filter(r => !r.eliminated));

  if (race.mode.powerups) {
    race.oils.forEach(o => {
      o.life -= dt;
      race.racers.forEach(r => {
        if (!r.ai || r.eliminated || r.shield > 0 || r.oil > 0) return;
        if (Math.hypot(r.x - o.x, r.y - o.y) < 20) { r.oil = 1.6; o.life = 0; }
      });
    });
    race.oils = race.oils.filter(o => o.life > 0);
    race.powerups.forEach(p => {
      race.racers.forEach(r => {
        if (r.eliminated || r.finished || Math.hypot(r.x - p.x, r.y - p.y) > 24) return;
        applyPowerup(race, r, p.type);
        const idx = race.powerups.indexOf(p);
        if (idx >= 0) race.powerups[idx] = { ...p, ...race.track.pointAt(race.rand() * race.track.total, (race.rand() - 0.5) * race.track.width * 0.4) };
      });
    });
  }

  if (race.mode.id === 'knockout') {
    race.racers.forEach(r => { if (!r.eliminated && !r.finished && r.lap > (race.lastKnockoutLap || 0)) race.lastKnockoutLap = r.lap; });
    if (race.lastKnockoutLap > (race.knockedAt || 0) && race.lastKnockoutLap < race.mode.laps) {
      race.knockedAt = race.lastKnockoutLap;
      const active = standings(race.racers.filter(r => !r.eliminated && !r.finished), race.track);
      const last = active[active.length - 1];
      if (last) {
        last.eliminated = true;
        race.events.push({ type:'eliminated', racer:last.id });
        if (last.id === 'player') {
          race.phase = 'over'; race.result = { won:false, reason:'knockout' };
          race.events.push({ type:'over', won:false });
        }
      }
    }
  }

  const player = race.racers[0];
  if (player.finished) {
    const order = standings(race.racers, race.track);
    race.phase = 'over';
    race.result = { won:order[0].id === 'player', place:order.indexOf(player) + 1, time:player.finishTime };
    race.events.push({ type:'over', won:race.result.won, place:race.result.place });
  }
  return race;
}

export function ghostAt(race, t) {
  const g = race.ghostRef;
  if (!g || !g.length) return null;
  let lo = 0, hi = g.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (g[mid].t < t) lo = mid + 1; else hi = mid; }
  return g[lo] || null;
}
