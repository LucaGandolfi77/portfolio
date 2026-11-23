/* Italy Flight Sim — game state, missions and progress */

import { lerp } from '../../_kit/core.js';
import { sfx } from '../../_kit/audio.js';
import { MISSIONS, PLANES, STR } from './config.js';
import { airportByCode, cameraFor, distance, nearestAirport } from './map.js';
import { checkLanding, createFlight, stepFlight, toKm } from './flight.js';

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
    this.fuelStart = 0;
    this.fuelUsed = 0;
    this.freeAirport = save.freeAirport || 'FCO';
    this.view = 'follow';
    this.vw = 800; this.vh = 600;
    this.cam = cameraFor('overview', null, this.vw, this.vh);
    this.toast = { text: '', kind: '', until: 0 };
    this.result = null;
    this.landCooldown = 0;
    this.warnCooldown = 0;
  }

  setPlane(id) {
    const plane = PLANES.find(p => p.id === id);
    if (!plane) return;
    this.plane = plane;
    this.save.plane = id;
    this.persist();
  }

  setViewport(w, h) { this.vw = w; this.vh = h; }

  say(text, kind = 'info', ms = 2600) {
    this.toast = { text, kind, until: Date.now() + ms };
  }

  startFree(airportCode = 'FCO') {
    const airport = airportByCode(airportCode) || airportByCode('FCO');
    this.freeAirport = airport.code;
    this.save.freeAirport = airport.code;
    this.mission = null;
    this.targetIndex = 0;
    this._begin(airport);
    this.stats.flights++;
    this.persist();
  }

  startMission(id) {
    const mission = MISSIONS.find(m => m.id === id);
    if (!mission || mission.stops.length < 2) return;
    this.mission = mission;
    this.targetIndex = 1;
    this._begin(airportByCode(mission.stops[0]));
  }

  _begin(airport) {
    this.state = createFlight(this.plane, airport);
    this.elapsed = 0;
    this.fuelUsed = 0;
    this.fuelStart = this.state.fuel;
    this.result = null;
    this.landCooldown = 0;
    this.warnCooldown = 0;
    this.mode = 'play';
    this.view = 'follow';
    this.cam = cameraFor('follow', this.state, this.vw, this.vh);
  }

  targetAirport() {
    return this.mission ? airportByCode(this.mission.stops[this.targetIndex]) : null;
  }

  destination() {
    return this.targetAirport() || nearestAirport(this.state.x, this.state.y);
  }

  targetDistanceKm() {
    if (!this.state) return 0;
    return toKm(distance(this.state, this.destination()));
  }

  toggleView() { this.view = this.view === 'follow' ? 'overview' : 'follow'; }
  pause() { if (this.mode === 'play') this.mode = 'pause'; }
  resume() { if (this.mode === 'pause') this.mode = 'play'; }

  quit() {
    this.mode = 'menu';
    this.state = null;
    this.mission = null;
    this.save.stats = this.stats;
    this.persist();
  }

  restart() {
    if (this.mission) this.startMission(this.mission.id);
    else this.startFree(this.freeAirport);
  }

  update(dt, input) {
    if (this.mode !== 'play' || !this.state) return;
    this.elapsed += dt;
    const fuelBefore = this.state.fuel;
    stepFlight(this.state, this.plane, input, dt);
    this.fuelUsed += Math.max(0, fuelBefore - this.state.fuel);

    const desired = cameraFor(this.view, this.state, this.vw, this.vh);
    const k = 1 - Math.exp(-dt * 5);
    this.cam.x = lerp(this.cam.x, desired.x, k);
    this.cam.y = lerp(this.cam.y, desired.y, k);
    this.cam.zoom = lerp(this.cam.zoom, desired.zoom, k);

    this.landCooldown = Math.max(0, this.landCooldown - dt);
    this.warnCooldown = Math.max(0, this.warnCooldown - dt);

    if (this.state.status === 'crashed') {
      this._respawn();
      return;
    }

    const landing = checkLanding(this.state, this.plane);
    if (landing.result === 'ok' && this.landCooldown <= 0) this._onLanding(landing.airport);

    if (this.warnCooldown <= 0) {
      if (this.state.fuel <= 0) {
        this.say(this._str('noFuel'), 'bad', 2400);
        this.warnCooldown = 6;
      } else if (this.state.stallWarn) {
        this.say(this._str('stall'), 'bad', 1800);
        this.warnCooldown = 4;
      }
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
      ? (airportByCode(this.mission.stops[this.targetIndex]) || nearestAirport(this.state.x, this.state.y))
      : (nearestAirport(this.state.x, this.state.y) || airportByCode('FCO'));
    this.state = createFlight(this.plane, airport);
    this.state.fuel = Math.max(this.state.fuel, this.plane.fuel * 0.35);
    this.stats.crashes++;
    this.save.stats = this.stats;
    this.persist();
    this.say(this._str('crash', { code: airport.code }), 'bad', 3000);
    sfx.bad();
  }

  _onLanding(airport) {
    this.landCooldown = 1.6;
    this.state.alt = 70;
    this.state.speed = this.plane.stall + 16;
    this.state.fuel = this.plane.fuel;
    this.stats.landings++;
    this.save.stats = this.stats;
    this.persist();
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
    this.result = { type: 'mission', time, used, best: bests[key], isNew };
    this.mode = 'result';
    this.save.stats = this.stats;
    this.persist();
    sfx.win();
  }

  hud() {
    const s = this.state;
    if (!s) return null;
    return {
      speed: Math.round(s.speed * 1.6),
      alt: Math.round(s.alt * 3),
      fuel: Math.round(100 * s.fuel / this.plane.fuel),
      hdg: Math.round(s.heading * 180 / Math.PI) % 360,
      throttle: Math.round(s.throttle * 100),
      boosting: !!s.boosting,
      next: this.destination().code,
      dist: this.targetDistanceKm(),
      progress: this.mission ? `${this.targetIndex}/${this.mission.stops.length - 1}` : ''
    };
  }
}

// Small local copies so game state can format toasts without a DOM i18n instance.
const EN = STR.en, IT = STR.it;
