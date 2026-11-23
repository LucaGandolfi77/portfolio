/* Italy 3D Flight Sim — mission state, progress and simulation orchestration */

import { sfx } from '../../_kit/audio.js';
import { MISSIONS, PLANES, STR } from './config.js';
import { AIRPORTS } from './config.js';
import { distanceToAirport, createFlight, headingDegrees, stepFlight, toKm, checkLanding } from './flight.js';
import { geoToWorld, terrainHeight } from './geo.js';
import { createTraffic, stepTraffic } from './traffic.js';

const EN = STR.en, IT = STR.it;

export class FlightGame {
  constructor(save, persist = () => {}) {
    this.save = save;
    this.persist = persist;
    this.stats = save.stats || { flights: 0, landings: 0, crashes: 0 };
    this.mode = 'menu';
    this.plane = PLANES.find(p => p.id === save.plane) || PLANES[0];
    this.state = null;
    this.mission = null;
    this.targetIndex = 0;
    this.elapsed = 0;
    this.fuelUsed = 0;
    this.freeAirport = save.freeAirport || 'FCO';
    this.view = 'chase';
    this.quality = save.quality || 'high';
    this.traffic = createTraffic();
    this.toast = { text: '', kind: '', until: 0 };
    this.result = null;
    this.landCooldown = 0;
    this.warnCooldown = 0;
    this.warnTimer = 0;
    this.trafficWarn = false;
  }

  setPlane(id) {
    const plane = PLANES.find(p => p.id === id);
    if (!plane) return;
    this.plane = plane; this.save.plane = id; this.persist();
  }
  setQuality(q) { this.quality = q === 'low' ? 'low' : 'high'; this.save.quality = this.quality; this.persist(); }
  cycleView() { this.view = this.view === 'chase' ? 'cockpit' : this.view === 'cockpit' ? 'overview' : 'chase'; }
  pause() { if (this.mode === 'play') this.mode = 'pause'; }
  resume() { if (this.mode === 'pause') this.mode = 'play'; }
  say(text, kind = 'info', ms = 2600) { this.toast = { text, kind, until: Date.now() + ms }; }

  startFree(code = 'FCO') {
    const airport = AIRPORTS.find(a => a.code === code) || AIRPORTS.find(a => a.code === 'FCO');
    this.freeAirport = airport.code; this.save.freeAirport = airport.code;
    this.mission = null; this.targetIndex = 0;
    this._begin(airport); this.stats.flights++; this.persist();
  }

  startMission(id) {
    const mission = MISSIONS.find(m => m.id === id);
    if (!mission || mission.stops.length < 2) return;
    this.mission = mission; this.targetIndex = 1;
    this._begin(AIRPORTS.find(a => a.code === mission.stops[0]));
  }

  _begin(airport) {
    this.state = createFlight(this.plane, airport);
    this.fuelStart = this.state.fuel;
    this.elapsed = 0; this.fuelUsed = 0;
    this.result = null;
    this.landCooldown = 0; this.warnCooldown = 0;
    this.mode = 'play'; this.view = 'chase';
    this.traffic = createTraffic();
  }

  restart() {
    if (this.mission) this.startMission(this.mission.id);
    else this.startFree(this.freeAirport);
  }

  quit() {
    this.mode = 'menu'; this.state = null; this.mission = null;
    this.save.stats = this.stats; this.persist();
  }

  targetAirport() {
    return this.mission ? AIRPORTS.find(a => a.code === this.mission.stops[this.targetIndex]) : null;
  }

  destination() {
    if (this.targetAirport()) return this.targetAirport();
    let best = AIRPORTS[0], bestD = Infinity;
    for (const a of AIRPORTS) {
      const d = distanceToAirport(this.state, a);
      if (d < bestD) { bestD = d; best = a; }
    }
    return best;
  }

  update(dt, input) {
    if (this.mode !== 'play' || !this.state) return;
    this.elapsed += dt;
    const before = this.state.fuel;
    stepFlight(this.state, this.plane, input, dt);
    this.fuelUsed += Math.max(0, before - this.state.fuel);
    stepTraffic(this.traffic, dt, this.state);
    this.landCooldown = Math.max(0, this.landCooldown - dt);
    this.warnCooldown = Math.max(0, this.warnCooldown - dt);

    this.trafficWarn = this.traffic.some(t => Math.hypot(t.x - this.state.x, t.z - this.state.z) < 70 && Math.abs(t.y - this.state.y) < 35);

    if (this.state.status === 'crashed') { this._respawn(); return; }
    if (this.landCooldown <= 0) {
      const landing = checkLanding(this.state, this.plane, AIRPORTS);
      if (landing.result === 'ok') this._onLanding(landing.airport);
    }
    if (this.warnCooldown <= 0) {
      if (this.state.fuel <= 0) { this.say(this._str('noFuel'), 'bad', 2400); this.warnCooldown = 6; }
      else if (this.state.stallWarn) { this.say(this._str('stall'), 'bad', 1800); this.warnCooldown = 4; }
      else if (this.trafficWarn) { this.say(this._str('trafficWarn'), 'bad', 1800); this.warnCooldown = 5; }
    }
  }

  _str(key, vars) {
    const dict = this.save.lang === 'it' ? IT : EN;
    let text = dict[key] || EN[key] || key;
    if (vars) for (const [k, v] of Object.entries(vars)) text = String(text).replace(`{${k}}`, v);
    return text;
  }

  _respawn() {
    const airport = this.mission
      ? (AIRPORTS.find(a => a.code === this.mission.stops[this.targetIndex]) || this._nearest())
      : this._nearest();
    this.state = createFlight(this.plane, airport);
    this.state.fuel = Math.max(this.state.fuel, this.plane.fuel * 0.35);
    this.stats.crashes++;
    this.save.stats = this.stats; this.persist();
    this.say(this._str('crash', { code: airport.code }), 'bad', 3000);
    sfx.bad();
  }

  _nearest() {
    let best = AIRPORTS[0], bestD = Infinity;
    for (const a of AIRPORTS) {
      const d = distanceToAirport(this.state, a);
      if (d < bestD) { bestD = d; best = a; }
    }
    return best;
  }

  _onLanding(airport) {
    this.landCooldown = 1.6;
    const p = geoToWorld(airport.lon, airport.lat);
    this.state.y = terrainHeight(p.x, p.z) + 60;
    this.state.speed = this.plane.stall + 16;
    this.state.verticalSpeed = 0;
    this.state.fuel = this.plane.fuel;
    this.stats.landings++;
    this.save.stats = this.stats; this.persist();
    this.say(this._str('refueled', { code: airport.code }), 'good', 2400);
    sfx.good();
    if (!this.mission) return;
    if (airport.code === this.mission.stops[this.targetIndex]) {
      this.targetIndex++;
      if (this.targetIndex >= this.mission.stops.length) this._completeMission();
      else this.say(`${this._str('step')} ${this.targetIndex}/${this.mission.stops.length - 1}`, 'good', 2600);
    }
  }

  _completeMission() {
    const time = this.elapsed;
    const used = Math.round(100 * this.fuelUsed / Math.max(1, this.fuelStart * this.mission.stops.length));
    const key = `${this.mission.id}:${this.plane.id}`;
    const bests = this.save.bests || (this.save.bests = {});
    const isNew = !bests[key] || time < bests[key];
    if (isNew) bests[key] = time;
    this.result = { type: 'mission', time, used, best: bests[key], isNew, name: this.mission.name };
    this.mode = 'result';
    this.save.stats = this.stats; this.persist();
    sfx.win();
  }

  hud() {
    const s = this.state;
    if (!s) return null;
    return {
      speed: Math.round(s.speed * 3.6),
      alt: Math.round(s.y - s.ground),
      fuel: Math.round(100 * s.fuel / this.plane.fuel),
      hdg: headingDegrees(s.heading),
      vs: Math.round(s.verticalSpeed * 3),
      throttle: Math.round(s.throttle * 100),
      boosting: !!s.boosting,
      next: this.destination().code,
      dist: toKm(distanceToAirport(s, this.destination())),
      progress: this.mission ? `${this.targetIndex}/${this.mission.stops.length - 1}` : '',
      view: this.view
    };
  }
}
