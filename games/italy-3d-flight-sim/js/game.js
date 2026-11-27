/* Italy 3D Flight Sim — mission state, progress and simulation orchestration */

import { sfx } from '../../_kit/audio.js';
import { MISSIONS, PLANES, STR, TOURS, loc } from './config.js';
import { AIRPORTS } from './config.js';
import { landmarksData } from './landmarks.js';
import { airportPosition, distanceToAirport, createFlight, headingDegrees, stepFlight, checkLanding, relaunch, setStateModel, cycleFlaps, toggleGear, lineUp } from './flight.js';
import { airfields, angleDiff, approachGuidance, gradeLanding, runwayAt, runwayEnd, threshold } from './airfields.js';
import { ALT_STEP, createAutopilot, stepAutopilot } from './autopilot.js';
import { distanceKm, geoToWorld, terrainHeight, worldToGeo } from './geo.js';
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
    this.freeDestination = save.freeDestination || '';
    this.view = 'chase';
    this.quality = save.quality || 'high';
    this.flightModel = save.flightModel === 'real' ? 'real' : 'arcade';
    this.startMode = save.startMode === 'runway' ? 'runway' : 'air';
    this.autopilot = null;
    this.rollout = null;
    this.grade = null;
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
  setFlightModel(model) {
    this.flightModel = model === 'real' ? 'real' : 'arcade';
    this.save.flightModel = this.flightModel; this.persist();
    this.autopilot = null; this.rollout = null;
    if (this.state) setStateModel(this.state, this.plane, this.flightModel);
  }
  setStartMode(mode) {
    this.startMode = mode === 'runway' ? 'runway' : 'air';
    this.save.startMode = this.startMode; this.persist();
  }

  get real() { return this.state?.model === 'real'; }

  cycleFlaps() { if (this.mode === 'play' && this.state) cycleFlaps(this.state); }
  toggleGear() { if (this.mode === 'play' && this.state) toggleGear(this.state, this.plane); }

  toggleAutopilot() {
    if (this.mode !== 'play' || !this.real || this.state.onGround) return;
    this.autopilot = this.autopilot ? null : createAutopilot(this.state, this.plane);
    this.say(this._str(this.autopilot ? 'apOn' : 'apOff'), this.autopilot ? 'good' : '', 1600);
  }
  toggleNav() {
    if (!this.autopilot) this.toggleAutopilot();
    if (!this.autopilot) return;
    this.autopilot.mode = this.autopilot.mode === 'nav' ? 'hdg' : 'nav';
    if (this.autopilot.mode === 'hdg') this.autopilot.heading = this.state.heading;
  }
  adjustAltitude(direction) {
    if (this.autopilot) this.autopilot.altitude = Math.max(20, this.autopilot.altitude + direction * ALT_STEP);
  }

  /* Stationary on the ground close to an airfield: offer to line up for departure. */
  canLineUp() {
    const s = this.state;
    if (!this.real || !s.onGround || s.speed > 12) return false;
    const airport = this._nearest();
    if (distanceToAirport(s, airport) >= 150) return false;
    /* Nothing to offer when already waiting on a threshold, pointing down the runway. */
    const field = airfields().find(f => f.code === airport.code);
    const start = threshold(field, runwayEnd(field, s.heading));
    return Math.hypot(s.x - start.x, s.z - start.z) > 8 || Math.abs(angleDiff(s.heading, start.heading)) > 0.1;
  }
  lineUp() {
    if (this.mode !== 'play' || !this.canLineUp()) return false;
    const airport = this._nearest();
    const field = airfields().find(f => f.code === airport.code);
    const flaps = this.state.flaps;
    lineUp(this.state, this.plane, airport, runwayEnd(field, this.state.heading));
    this.state.flaps = Math.max(1, flaps === 2 ? 1 : flaps);
    this.rollout = null;
    this.say(this._str('takeoffHint'), '', 3000);
    return true;
  }
  setQuality(q) { this.quality = q === 'low' ? 'low' : 'high'; this.save.quality = this.quality; this.persist(); }
  cycleView() { this.view = this.view === 'chase' ? 'cockpit' : this.view === 'cockpit' ? 'overview' : 'chase'; }
  pause() { if (this.mode === 'play') this.mode = 'pause'; }
  resume() { if (this.mode === 'pause') this.mode = 'play'; }
  say(text, kind = 'info', ms = 2600) { this.toast = { text, kind, until: Date.now() + ms }; }

  setDestination(code) {
    this.freeDestination = AIRPORTS.some(a => a.code === code) ? code : '';
    this.save.freeDestination = this.freeDestination; this.persist();
  }

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

  startTour(id) {
    const tour = TOURS.find(m => m.id === id);
    if (!tour || tour.stops.length < 2) return;
    this.mission = { ...tour, kind: 'tour' };
    this.targetIndex = 0;
    const first = this.targetLandmark();
    const airport = AIRPORTS.reduce((best, a) =>
      distanceToAirport({ x: geoToWorld(first.lon, first.lat).x, z: geoToWorld(first.lon, first.lat).z }, a) < distanceToAirport({ x: geoToWorld(best.lon, best.lat).x, z: geoToWorld(best.lon, best.lat).z }, a) ? a : best, AIRPORTS[0]);
    this._begin(airport);
    this.targetIndex = 0;
  }

  _begin(airport) {
    this.state = this._spawn(airport);
    this.fuelStart = this.state.fuel;
    this.elapsed = 0; this.fuelUsed = 0;
    this.result = null;
    this.landCooldown = 0; this.warnCooldown = 0;
    this.mode = 'play'; this.view = 'chase';
    this.traffic = createTraffic();
  }

  _spawn(airport) {
    this.autopilot = null; this.rollout = null; this.grade = null;
    return createFlight(this.plane, airport, 220, this.flightModel, this.startMode === 'runway');
  }

  restart() {
    if (this.mission?.kind === 'tour') this.startTour(this.mission.id);
    else if (this.mission) this.startMission(this.mission.id);
    else this.startFree(this.freeAirport);
  }

  quit() {
    this.mode = 'menu'; this.state = null; this.mission = null;
    this.save.stats = this.stats; this.persist();
  }

  targetAirport() {
    if (this.mission?.kind === 'tour') return null;
    return this.mission ? AIRPORTS.find(a => a.code === this.mission.stops[this.targetIndex]) : null;
  }

  targetLandmark() {
    if (this.mission?.kind !== 'tour') return null;
    const data = landmarksData();
    return data ? data.landmarks.find(l => l.id === this.mission.stops[this.targetIndex]) : null;
  }

  destination() {
    if (this.targetLandmark()) return this.targetLandmark();
    if (this.targetAirport()) return this.targetAirport();
    const chosen = !this.mission && AIRPORTS.find(a => a.code === this.freeDestination);
    if (chosen) return chosen;
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
    const controls = this._controls(input, dt);
    stepFlight(this.state, this.plane, controls, dt);
    this.fuelUsed += Math.max(0, before - this.state.fuel);
    stepTraffic(this.traffic, dt, this.state);
    this.landCooldown = Math.max(0, this.landCooldown - dt);
    this.warnCooldown = Math.max(0, this.warnCooldown - dt);

    this.trafficWarn = this.traffic.some(t => Math.hypot(t.x - this.state.x, t.z - this.state.z) < 70 && Math.abs(t.y - this.state.y) < 35);

    if (this.state.status === 'crashed') { this._respawn(); return; }
    if (this.mission?.kind === 'tour' && this.landCooldown <= 0) {
      const lm = this.targetLandmark();
      if (lm) {
        const p = geoToWorld(lm.lon, lm.lat);
        const dist = Math.hypot(this.state.x - p.x, this.state.z - p.z);
        const agl = this.state.y - terrainHeight(p.x, p.z);
        if (dist < 85 && agl < 420 && agl > 15) this._reachLandmark(lm);
      }
    }
    if (this.real) this._trackLanding();
    else if (this.mission?.kind !== 'tour' && this.landCooldown <= 0) {
      const landing = checkLanding(this.state, this.plane, AIRPORTS);
      if (landing.result === 'ok') this._onLanding(landing.airport);
    }
    if (this.warnCooldown <= 0) {
      if (this.state.fuel <= 0) { this.say(this._str('noFuel'), 'bad', 2400); this.warnCooldown = 6; }
      else if (this.state.stallWarn) { this.say(this._str('stall'), 'bad', 1800); this.warnCooldown = 4; }
      else if (this.state.gearWarn) { this.say(this._str('gearWarn'), 'bad', 1800); this.warnCooldown = 4; }
      else if (this.trafficWarn) { this.say(this._str('trafficWarn'), 'bad', 1800); this.warnCooldown = 5; }
    }
  }

  /* Pilot input, or the autopilot's while it is engaged. */
  _controls(input, dt) {
    if (!this.autopilot) return input;
    if (!this.real || this.state.onGround || Math.abs(input.turn || 0) > 0.4 || Math.abs(input.pitch || 0) > 0.4) {
      this.autopilot = null;
      this.say(this._str('apOff'), '', 1600);
      return input;
    }
    const goal = this.destination();
    const target = goal.code && this.targetLandmark() !== goal ? airportPosition(goal) : geoToWorld(goal.lon, goal.lat);
    const commands = stepAutopilot(this.autopilot, this.state, this.plane, dt, target);
    return { ...input, ...commands, brake: false };
  }

  /* Realistic landings count only after touching a runway and slowing down. */
  _trackLanding() {
    const s = this.state;
    if (s.touchdown) {
      const field = runwayAt(s.touchdown.x, s.touchdown.z);
      if (field) {
        this.rollout = { field, grade: gradeLanding(field, s.touchdown) };
        this.say(this._str('brakeHint'), '', 2600);
      } else {
        this.rollout = null;
        this.say(this._str('offRunway'), 'bad', 2600);
      }
      s.touchdown = null;
    }
    if (!this.rollout) return;
    if (!s.onGround && s.y - s.ground > 12) { this.rollout = null; return; }
    if (s.onGround && s.speed < 12) {
      const { field, grade } = this.rollout;
      this.rollout = null;
      this._onLanding(field.airport, grade);
    }
  }

  _str(key, vars) {
    const dict = this.save.lang === 'it' ? IT : EN;
    let text = dict[key] || EN[key] || key;
    if (vars) for (const [k, v] of Object.entries(vars)) text = String(text).replace(`{${k}}`, v);
    return text;
  }

  _reachLandmark(lm) {
    this.landCooldown = 1.8;
    this.say(this._str('photoDone', { name: loc(lm.name, this.save.lang) }), 'good', 2600);
    sfx.coin();
    this.targetIndex++;
    if (this.targetIndex >= this.mission.stops.length) this._completeMission();
  }

  _respawn() {
    // On the runway, a mission restarts from the stop you last left, not the destination.
    const index = this.flightModel === 'real' && this.startMode === 'runway' ? this.targetIndex - 1 : this.targetIndex;
    const airport = this.mission
      ? (AIRPORTS.find(a => a.code === this.mission.stops[index]) || this._nearest())
      : this._nearest();
    this.state = this._spawn(airport);
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

  _onLanding(airport, grade = null) {
    this.landCooldown = 1.6;
    if (!grade) {
      const p = airportPosition(airport);
      relaunch(this.state, this.plane, terrainHeight(p.x, p.z) + 60);
    }
    this.state.fuel = this.plane.fuel;
    this.stats.landings++;
    this.save.stats = this.stats; this.persist();
    if (grade) {
      this.grade = grade;
      const centre = `${grade.centre.toFixed(0)} m`;
      this.say(this._str('landed', { code: airport.code, score: grade.score, fpm: -grade.feetPerMinute, centre }), 'good', 5000);
    } else this.say(this._str('refueled', { code: airport.code }), 'good', 2400);
    sfx.good();
    if (!this.mission) return;
    if (airport.code === this.mission.stops[this.targetIndex]) {
      this.targetIndex++;
      if (this.targetIndex >= this.mission.stops.length) this._completeMission();
      else if (!grade) this.say(`${this._str('step')} ${this.targetIndex}/${this.mission.stops.length - 1}`, 'good', 2600);
    }
  }

  _completeMission() {
    const time = this.elapsed;
    const used = Math.round(100 * this.fuelUsed / Math.max(1, this.fuelStart * this.mission.stops.length));
    const key = `${this.mission.id}:${this.plane.id}`;
    const bests = this.save.bests || (this.save.bests = {});
    const isNew = !bests[key] || time < bests[key];
    if (isNew) bests[key] = time;
    this.result = { type: 'mission', grade: this.grade, time, used, best: bests[key], isNew, name: this.mission.name };
    this.mode = 'result';
    this.save.stats = this.stats; this.persist();
    sfx.win();
  }

  hud() {
    const s = this.state;
    if (!s) return null;
    const real = s.model === 'real';
    const goal = this.destination();
    const from = worldToGeo(s.x, s.z);
    // Airfields can be nudged on the map, so measure to where they are drawn.
    const to = this.targetLandmark() === goal ? goal : worldToGeo(airportPosition(goal).x, airportPosition(goal).z);
    const ap = this.autopilot;
    return {
      pitch: s.pitch,
      roll: s.roll,
      onGround: real && s.onGround,
      flaps: real ? s.flaps : 0,
      gear: real ? s.gear : true,
      retractable: real && !!this.plane.aero.retractable,
      guidance: real && !s.onGround ? approachGuidance(s.x, s.y, s.z, s.heading) : null,
      autopilot: ap ? { mode: ap.mode, altitude: Math.round(ap.altitude), heading: headingDegrees(ap.heading) } : null,
      msl: Math.round(s.y),
      canLineUp: this.canLineUp(),
      real,
      g: real && !s.onGround ? s.gLoad : 1,
      aoa: real ? s.alpha * 180 / Math.PI : 0,
      trim: real ? s.trim * 180 / Math.PI : 0,
      speed: Math.round((real ? s.ias : s.speed) * 3.6),
      alt: Math.round(s.y - s.ground),
      fuel: Math.round(100 * s.fuel / this.plane.fuel),
      hdg: headingDegrees(s.heading),
      vs: Math.round(s.verticalSpeed * (real ? 1 : 3)),
      throttle: Math.round(s.throttle * 100),
      boosting: !!s.boosting,
      next: goal.code,
      // No distance while parked on the field in question.
      dist: s.model === 'real' && s.onGround && distanceToAirport(s, goal) < 150 ? null : distanceKm(from, to),
      progress: this.mission ? `${this.targetIndex}/${this.mission.stops.length - 1}` : '',
      view: this.view
    };
  }
}
