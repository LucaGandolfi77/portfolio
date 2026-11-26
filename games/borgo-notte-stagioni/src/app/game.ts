import * as THREE from 'three';
import { FIDENZA } from '../data/fidenza';
import { CollisionWorld, buildCityColliders } from '../data/colliders';
import { buildRoadGraph, nearestOnGraph, pointOnEdge, type RoadGraph } from '../data/roads';
import { HeightField } from '../data/heights';
import { createTextures } from '../world/textures';
import { CityStream } from '../world/city';
import { createEnvironment, type Environment } from '../world/environment';
import { Marker } from '../world/markers';
import { Weather, WEATHER_LABEL, type WeatherKind } from '../world/weather';
import { SeasonLook } from '../world/seasons';
import { SeasonEvents } from '../world/events';
import { collideVehicles, LIGHTS, NO_INPUT, SPECS, Vehicle } from '../game/vehicle';
import { Traffic } from '../game/traffic';
import { VehicleFx } from '../game/vehicle-fx';
import { TrafficSignals } from '../game/signals';
import { Pedestrians } from '../game/peds';
import { PoliceForce, type Offence } from '../game/police';
import { Law } from '../game/law';
import { Missions, TITLES, type MissionEvent, type Spot } from '../game/missions';
import { JobsBoard } from '../game/jobs-board';
import { Controls, type Action } from '../game/input';
import { ChaseCamera } from '../game/camera';
import { Walker } from '../game/player';
import { bustedFine, formatClock, formatMoney, loadSave, writeSave, type Quality, type SaveData } from '../game/save';
import {
  activeEvents,
  dateLabel,
  nextSeasonStart,
  PHASE_LABEL,
  phaseOf,
  SEASON_LABEL,
  seasonOf,
  solarHours,
  type Season,
  type SeasonEvent
} from '../game/calendar';
import { CHAPTERS, PLACES } from '../game/story';
import { AudioEngine, STATIONS } from '../audio/audio';
import { Radar, type Blip } from '../ui/radar';
import { TouchControls } from '../ui/touch';
import { Dialogue } from '../ui/dialogue';
import { Notices } from '../ui/notices';
import { renderPhone, type PhoneTab } from '../ui/phone';
import { Santini } from '../world/santini';
import { ParkedCars, planParking } from '../world/parked';
import { Intro } from './intro';
import { StoryRunner, type StoryHost } from './story-runner';

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} missing`);
  return el as T;
};

interface Preset {
  scale: number;
  traffic: number;
  peds: number;
  far: number;
  crowd: number;
}

const PRESETS: Record<Quality, Preset> = {
  bassa: { scale: 0.5, traffic: 7, peds: 5, far: 300, crowd: 6 },
  media: { scale: 0.72, traffic: 12, peds: 8, far: 380, crowd: 9 },
  alta: { scale: 1, traffic: 18, peds: 13, far: 470, crowd: 14 }
};

/** Real-time seconds per in-game hour. */
const HOUR = 60;
const RELEASE: Spot = { x: 195, z: -103, name: 'Piazza della Repubblica' };
const REPAIR_COST = 80;

export class Game {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private chase: ChaseCamera;
  private env: Environment;
  private city: CityStream;
  private world: CollisionWorld;
  private graph: RoadGraph;
  private roofs: HeightField;
  private jetHint = false;
  private traffic: Traffic;
  private peds: Pedestrians;
  private police: PoliceForce;
  private law = new Law();
  private parked!: ParkedCars;
  private signals!: TrafficSignals;
  private lastCarPos = { x: 0, z: 0 };
  private fx!: VehicleFx;
  private ui = new Notices();
  private missions: Missions;
  private controls: Controls;
  private touch: TouchControls;
  private audio = new AudioEngine();
  private radar: Radar;
  private walker: Walker;
  private car: Vehicle | null = null;
  private save: SaveData;
  private quality: Quality;
  private mobile: boolean;
  private state: 'title' | 'intro' | 'play' | 'pause' | 'map' | 'phone' | 'card' | 'busted' | 'credits' = 'title';
  private day = 0;
  private hours = 7.5;
  private last = performance.now();
  private bustedTimer = 0;
  private jobs: JobsBoard;
  private garageMarker: Marker;
  private saveTimer = 0;
  private beamTex: THREE.Texture;
  private fps = { frames: 0, time: 0, value: 60 };
  private weather: Weather;
  private look: SeasonLook;
  private events: SeasonEvents;
  private story: StoryRunner;
  private dialogue = new Dialogue();
  private intro = new Intro();
  private cardDone: (() => void) | null = null;
  private eventsNow: SeasonEvent[] = [];
  private santini!: Santini;
  private phoneTab = 'storia';
  private objectiveText: string | null = null;
  private objectiveTime: number | null = null;
  private objectiveExtra = '';

  constructor() {
    this.mobile = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    this.save = loadSave();
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    this.quality = this.save.quality ?? (this.mobile ? (memory <= 4 ? 'bassa' : 'media') : 'alta');
    const preset = PRESETS[this.quality];

    const canvas = $<HTMLCanvasElement>('canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.applyQuality();

    this.progress(0.1, 'Disegno le facciate…');
    const textures = createTextures();
    this.beamTex = textures.glow;
    LIGHTS.beam.map = textures.glow;
    this.progress(0.3, 'Costruisco Fidenza…');
    this.city = new CityStream(textures);
    this.scene.add(this.city.group);
    /* The neighbourhood of the start, built now; the rest streams in. */
    this.city.update(PLACES.stazione.x, PLACES.stazione.z, preset.far * 0.6, Infinity);
    this.chase = new ChaseCamera(innerWidth / innerHeight, preset.far);
    this.env = createEnvironment(this.scene, preset.far);
    this.look = new SeasonLook(this.city);
    this.weather = new Weather(this.scene, this.mobile);

    this.progress(0.6, 'Traccio le strade…');
    const parking = planParking();
    this.world = new CollisionWorld(buildCityColliders(parking.map((c) => c.collider)));
    this.parked = new ParkedCars(this.scene, parking);
    this.graph = buildRoadGraph(FIDENZA.roads);
    this.roofs = new HeightField(FIDENZA.meta.view, FIDENZA.buildings);
    this.traffic = new Traffic(this.scene, this.graph, this.world, this.beamTex, preset.traffic);
    this.signals = new TrafficSignals(this.scene, this.graph);
    this.traffic.signals = this.signals;
    this.peds = new Pedestrians(this.scene, this.graph, preset.peds);
    this.police = new PoliceForce(this.scene, this.graph, this.world, this.beamTex);
    this.fx = new VehicleFx(this.scene);
    this.events = new SeasonEvents(this.scene, this.world, preset.crowd);

    const spots: Spot[] = FIDENZA.places.map((p) => {
      const n = nearestOnGraph(this.graph, p.x, p.z, true);
      return { x: n.x, z: n.z, name: p.name };
    });
    for (const e of this.graph.mainEdges) {
      if (e.name && e.length > 60 && e.kind !== 'primary') {
        const p = pointOnEdge(e, e.length / 2, true);
        spots.push({ x: p.x, z: p.z, name: e.name });
      }
    }
    this.missions = new Missions(spots, this.graph);
    this.jobs = new JobsBoard(this.scene, this.graph, this.missions);
    this.garageMarker = new Marker(0x7bdc8a, 3);
    this.scene.add(this.garageMarker.group);

    this.walker = new Walker(this.scene, PLACES.stazione.x, PLACES.stazione.z, Math.PI);
    this.story = new StoryRunner(this.host(), this.save.story);
    this.santini = new Santini(this.scene, this.graph, this.world, this.save.santini);

    this.controls = new Controls(canvas);
    this.controls.on((a) => this.onAction(a));
    this.touch = new TouchControls($('touch'), this.controls);
    this.radar = new Radar($<HTMLCanvasElement>('radar'), this.mobile);
    this.bindUi();
    this.day = this.save.day;
    this.hours = this.save.hours;
    if (import.meta.env.DEV) (window as unknown as { __game: Game }).__game = this;
    this.progress(1, 'Pronto.');
    addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'play') this.setState('pause');
    });
    this.resize();
    this.renderer.setAnimationLoop(() => this.frame());
    $('loading').hidden = true;
    this.showTitle();
  }

  /* ---------------- story host ---------------- */

  private host(): StoryHost {
    return {
      scene: this.scene,
      world: this.world,
      graph: this.graph,
      beam: this.beamTex,
      dialogue: this.dialogue,
      player: () => ({ x: this.px, z: this.pz, vehicle: this.car, speed: this.car ? this.car.speed : this.walker.speed }),
      objective: (text, time, extra) => {
        this.objectiveText = text;
        this.objectiveTime = time ?? null;
        this.objectiveExtra = extra ?? '';
      },
      banner: (t, d, s) => this.ui.banner(t, d, s),
      toast: (t) => this.ui.toast(t),
      chapterCard: (title, text, done) => this.card(title, text, done),
      money: (n) => {
        this.save.money += n;
        this.ui.bumpMoney();
      },
      sound: (k) => (k === 'tick' ? this.audio.checkpoint() : this.audio.jingle(k === 'ok')),
      setClock: (h) => {
        if (h < this.hours) this.day++;
        this.hours = h;
      },
      setWeather: (k) => (this.weather.forced = k),
      jumpSeason: (season) => this.jumpSeason(season),
      season: () => seasonOf(this.day),
      raiseAlert: (level) => {
        this.law.alert.level = Math.max(this.law.alert.level, level);
        this.law.alert.hidden = 0;
      },
      alertLevel: () => this.law.alert.level,
      addVehicle: (v) => {
        this.scene.add(v.model);
        this.traffic.loose.push(v);
      },
      removeVehicle: (v) => {
        if (v === this.car) return;
        this.traffic.remove(v);
      },
      saveProgress: (done) => {
        this.save.story = [...done];
        this.persist();
      },
      finale: () => {
        this.persist();
        this.setState('credits');
      }
    };
  }

  private jumpSeason(season: Season): void {
    if (seasonOf(this.day) === season) return;
    this.day = nextSeasonStart(this.day, season);
    this.hours = 9;
    this.weather.snow = season === 'inverno' ? 0.35 : 0;
    this.persist();
  }

  /* ---------------- set-up ---------------- */

  private progress(value: number, text: string): void {
    $('load-bar').style.width = `${Math.round(value * 100)}%`;
    $('load-text').textContent = text;
  }

  private applyQuality(): void {
    const preset = PRESETS[this.quality];
    const ratio = Math.min(devicePixelRatio || 1, 2) * preset.scale;
    this.renderer.setPixelRatio(ratio);
    $('canvas').classList.toggle('chunky', ratio < 0.9);
    if (this.traffic) this.traffic.target = preset.traffic;
    if (this.peds) this.peds.target = preset.peds;
  }

  private resize(): void {
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.chase.camera.aspect = innerWidth / innerHeight;
    this.chase.camera.updateProjectionMatrix();
  }

  /** Twenty holy cards hidden around town, at real places. */
  /** On foot beside a parked taxi at the start of a session. */
  private placePlayer(fromStart: boolean): void {
    const at = fromStart ? PLACES.stazione : PLACES.garage;
    const n = nearestOnGraph(this.graph, at.x, at.z, true);
    const p = pointOnEdge(n.edge, n.d, true);
    const off = n.edge.width / 2 - 1;
    const v = new Vehicle('taxi', n.x - p.dz * off, n.z + p.dx * off, Math.atan2(p.dx, p.dz), SPECS.taxi.colors[0], this.beamTex);
    this.scene.add(v.model);
    this.traffic.loose.push(v);
    const side = { x: v.x - p.dz * 2.4, z: v.z + p.dx * 2.4 };
    const free = this.world.isFree(side.x, side.z, 0.35) ? side : { x: v.x + p.dz * 2.4, z: v.z - p.dx * 2.4 };
    const r = this.world.resolve(free, 0.35);
    this.walker.place(r.x, r.z, v.heading);
    this.chase.snap();
  }

  /* ---------------- UI ---------------- */

  private showTitle(): void {
    this.state = 'title';
    $('title').hidden = false;
    $('hud').hidden = true;
    const progress = this.save.story.length > 0 || this.save.introSeen;
    $('continue').hidden = !progress;
    $('title-stats').textContent = progress
      ? `${this.chapterLabel()} · ${formatMoney(this.save.money)} · ${dateLabel(this.save.day)}`
      : '';
  }

  private chapterLabel(): string {
    const next = this.story.next;
    return next ? CHAPTERS[next.chapter].title : 'Storia completata';
  }

  private startPlay(fromStart: boolean): void {
    this.audio.unlock();
    this.audio.setStation(this.save.station);
    this.audio.radioOn = this.save.radioOn;
    this.placePlayer(fromStart);
    this.setState('play');
    if (fromStart) this.ui.banner('Fidenza', 'Lo zio Ottavio ti aspetta: segui il segnale blu.', 4);
  }

  private bindUi(): void {
    const play = (fresh: boolean): void => {
      this.audio.unlock();
      if (fresh) {
        if ((this.save.story.length > 0) && !confirm('Iniziare una nuova storia? I progressi attuali si perdono.')) return;
        const quality = this.save.quality;
        this.save = { ...loadSave(null), quality };
        this.story.done = [];
        this.day = 0;
        this.hours = 6;
        this.santini.reset();
        this.persist();
      }
      if (fresh || !this.save.introSeen) {
        this.playIntro(() => {
          this.save.introSeen = true;
          this.day = this.save.day;
          this.hours = 8;
          this.persist();
          this.startPlay(true);
        });
      } else {
        this.startPlay(false);
      }
    };
    $('play').addEventListener('click', () => play(true));
    $('continue').addEventListener('click', () => play(false));
    $('replay-intro').addEventListener('click', () => {
      this.audio.unlock();
      const day = this.day, hours = this.hours;
      this.playIntro(() => {
        this.day = day;
        this.hours = hours;
        this.showTitle();
      });
    });
    $('resume').addEventListener('click', () => this.setState('play'));
    $('pause-btn').addEventListener('click', () => this.setState('pause'));
    $('map-btn').addEventListener('click', () => this.setState('map'));
    $('map-close').addEventListener('click', () => this.setState('play'));
    $('phone-btn').addEventListener('click', () => this.setState('phone'));
    $('phone-close').addEventListener('click', () => this.setState('play'));
    $('card-go').addEventListener('click', () => this.closeCard());
    $('credits-close').addEventListener('click', () => this.setState('play'));
    for (const b of document.querySelectorAll<HTMLButtonElement>('.phone-tabs button')) {
      b.addEventListener('click', () => {
        this.phoneTab = b.dataset.tab ?? 'storia';
        for (const o of document.querySelectorAll('.phone-tabs button')) o.classList.toggle('is-on', o === b);
        this.renderPhone();
      });
    }
    $('quality').addEventListener('click', () => {
      const order: Quality[] = ['bassa', 'media', 'alta'];
      this.quality = order[(order.indexOf(this.quality) + 1) % 3];
      this.save.quality = this.quality;
      this.persist();
      this.applyQuality();
      this.resize();
      this.syncPauseLabels();
    });
    $('radio-toggle').addEventListener('click', () => {
      this.audio.radioOn = !this.audio.radioOn;
      this.save.radioOn = this.audio.radioOn;
      this.persist();
      this.syncPauseLabels();
    });
    $('abandon').addEventListener('click', () => {
      this.story.abandon();
      this.setState('play');
    });
    $('reset').addEventListener('click', () => {
      if (!confirm('Ricominciare da capo? Storia, soldi e collezione tornano a zero.')) return;
      const quality = this.save.quality;
      this.save = { ...loadSave(null), quality };
      this.persist();
      location.reload();
    });
  }

  private playIntro(done: () => void): void {
    this.state = 'intro';
    $('title').hidden = true;
    $('hud').hidden = true;
    $('touch').hidden = true;
    this.audio.radioOn = true;
    this.audio.setStation(3);
    this.intro.start(() => {
      this.audio.radioOn = this.save.radioOn;
      this.audio.setStation(this.save.station);
      done();
    });
  }

  private syncPauseLabels(): void {
    $('quality').textContent = `Grafica: ${this.quality}`;
    $('radio-toggle').textContent = `Radio: ${this.audio.radioOn ? 'accesa' : 'spenta'}`;
    $('abandon').hidden = !this.story.running;
  }

  private setState(next: Game['state']): void {
    this.state = next;
    $('title').hidden = true;
    $('hud').hidden = !['play', 'busted', 'card'].includes(next);
    $('touch').hidden = !(this.mobile && next === 'play');
    $('pause').hidden = next !== 'pause';
    $('map').hidden = next !== 'map';
    $('busted').hidden = next !== 'busted';
    $('phone').hidden = next !== 'phone';
    $('card').hidden = next !== 'card';
    $('credits').hidden = next !== 'credits';
    this.audio.suspend(next === 'pause' || next === 'map' || next === 'phone');
    if (next === 'pause') this.syncPauseLabels();
    if (next === 'map') this.radar.drawMap($<HTMLCanvasElement>('map-canvas'), this.px, this.pz, this.blips());
    if (next === 'phone') this.renderPhone();
    this.last = performance.now();
  }

  private card(title: string, text: string, done: () => void): void {
    $('card-season').textContent = dateLabel(this.day);
    $('card-title').textContent = title;
    $('card-text').textContent = text;
    this.cardDone = done;
    if (this.car) {
      this.car.vx = this.car.vz = 0;
    }
    this.setState('card');
  }

  private closeCard(): void {
    const done = this.cardDone;
    this.cardDone = null;
    this.setState('play');
    done?.();
  }

  private renderPhone(): void {
    $('phone-body').innerHTML = renderPhone(this.phoneTab as PhoneTab, {
      missions: this.story.summary(),
      day: this.day,
      hours: this.hours,
      weather: this.weather.kind,
      events: this.eventsNow,
      save: this.save,
      santiniTotal: this.santini.total,
      storyDone: this.story.done.length
    });
  }

  /** A patrol (chasing or just on its rounds) within `r` metres. */
  private policeNear(x: number, z: number, r: number): boolean {
    if (this.police.sees(x, z) && this.police.patrols.some((p) => Math.hypot(p.vehicle.x - x, p.vehicle.z - z) < r)) return true;
    return this.traffic.vehicles.some((v) => v.type === 'polizia' && v.driver === 'ai' && Math.hypot(v.x - x, v.z - z) < r);
  }

  private offence(o: Offence): void {
    const message = this.law.offence(o, this.day * 24 * HOUR + this.hours * HOUR);
    if (message) this.ui.toast(message);
  }

  private checkBust(dt: number): void {
    const patrols = this.police.patrols.map((p) => ({ x: p.vehicle.x, z: p.vehicle.z, speed: p.vehicle.speed }));
    const arrested = this.law.checkArrest(dt, patrols, {
      x: this.px,
      z: this.pz,
      inCar: !!this.car,
      speed: this.car ? this.car.speed : 0,
      airborne: this.walker.airborne
    });
    if (arrested) this.busted();
  }

  private pickSantini(): void {
    const i = this.santini.update(this.px, this.pz, this.car ? 4.5 : 2.6, this.car !== null || this.walker.y <= 4);
    if (i < 0) return;
    this.save.santini.push(i);
    this.save.money += 50;
    this.ui.bumpMoney();
    this.audio.jingle(true);
    this.ui.toast(`Santino ${this.save.santini.length}/${this.santini.total} · +€ 50`);
    if (this.save.santini.length === this.santini.total) {
      this.save.money += 1000;
      this.ui.banner('Collezione completa', 'Tutti i santini di Fidenza: +€ 1.000', 4);
    }
    this.persist();
  }

  private persist(): void {
    this.save.day = this.day;
    this.save.hours = this.hours;
    this.save.story = [...this.story.done];
    writeSave(this.save);
  }

  /* ---------------- actions ---------------- */

  private get px(): number {
    return this.car ? this.car.x : this.walker.x;
  }

  private get pz(): number {
    return this.car ? this.car.z : this.walker.z;
  }

  private onAction(a: Action): void {
    if (this.state === 'intro' && (a === 'pause' || a === 'enter')) {
      this.intro.finish();
      return;
    }
    if (this.state === 'card' && (a === 'enter' || a === 'pause')) {
      this.closeCard();
      return;
    }
    if (this.dialogue.open && (a === 'enter' || a === 'horn')) {
      this.dialogue.advance();
      return;
    }
    if (a === 'pause') {
      if (this.state === 'play') this.setState('pause');
      else if (['pause', 'map', 'phone'].includes(this.state)) this.setState('play');
      return;
    }
    if (a === 'map') {
      if (this.state === 'play') this.setState('map');
      else if (this.state === 'map') this.setState('play');
      return;
    }
    if (a === 'job') {
      if (this.state === 'play') this.setState('phone');
      else if (this.state === 'phone') this.setState('play');
      return;
    }
    if (this.state !== 'play') return;
    if (a === 'enter') {
      if (this.car) this.leaveCar(false);
      else this.enterNearestCar();
    } else if (a === 'horn' && this.car) {
      this.audio.horn();
      for (const p of this.peds.peds) {
        if (Math.hypot(p.x - this.car.x, p.z - this.car.z) < 14 && p.state === 'walk') {
          p.state = 'flee';
          p.timer = 2;
        }
      }
    } else if (a === 'radio' && this.car) {
      if (!this.audio.radioOn) {
        this.audio.radioOn = true;
        this.audio.setStation(0);
      } else if (this.audio.station === STATIONS.length - 1) {
        this.audio.radioOn = false;
      } else {
        this.audio.setStation(this.audio.station + 1);
      }
      this.save.station = this.audio.station;
      this.save.radioOn = this.audio.radioOn;
      this.radioToast();
    } else if (a === 'jetpack') {
      if (this.car) {
        this.ui.toast('Scendi dall\'auto per usare il jetpack');
        return;
      }
      this.walker.toggleJet();
      this.touch.setMode(this.walker.flying ? 'fly' : 'foot');
      if (this.walker.flying && !this.jetHint) {
        this.jetHint = true;
        this.ui.toast(this.mobile ? 'Jetpack: SU sale, GIÙ scende, TURBO accelera' : 'Jetpack: Spazio sale, Q scende, Shift accelera, G spegne', 4);
      } else if (!this.walker.flying) this.ui.toast('Jetpack spento');
    } else if (a === 'camera') {
      this.chase.mode = this.chase.mode === 'near' ? 'far' : 'near';
    }
  }

  private radioToast(): void {
    if (!this.audio.radioOn) this.ui.toast('Radio spenta');
    else {
      const s = STATIONS[this.audio.station];
      this.ui.toast(`${s.name} ${s.freq} · ${s.genre}`, 2.8);
    }
  }

  private enterNearestCar(): void {
    if (this.walker.airborne) {
      this.ui.toast(this.walker.flying ? 'Atterra prima (Q o GIÙ fino a terra)' : 'Scendi in strada per salire in auto');
      return;
    }
    let best: Vehicle | null = null;
    let bestD = 4.2;
    const story = new Set(this.story.vehicles());
    const all = [...this.traffic.vehicles, ...this.police.patrols.map((p) => p.vehicle)].filter((v) => !story.has(v));
    for (const v of all) {
      const d = Math.hypot(v.x - this.walker.x, v.z - this.walker.z);
      if (d < bestD) {
        best = v;
        bestD = d;
      }
    }
    /* A parked car closer than any moving one: break in and drive off. */
    const kerb = this.parked.nearest(this.walker.x, this.walker.z, bestD);
    if (kerb) {
      this.parked.take(kerb, this.world);
      const stolen = new Vehicle(kerb.type, kerb.x, kerb.z, kerb.heading, kerb.color, this.beamTex);
      this.scene.add(stolen.model);
      this.traffic.loose.push(stolen);
      if (this.police.sees(kerb.x, kerb.z)) this.offence('carjack');
      best = stolen;
    }
    if (!best) {
      this.ui.toast('Nessuna auto vicina');
      return;
    }
    if (best.wrecked) {
      this.ui.toast('Quest\'auto non parte più');
      return;
    }
    const v = best;
    if (v.driver === 'ai') {
      this.traffic.release(v);
      const sx = v.x - v.forwardZ * 1.8, sz = v.z + v.forwardX * 1.8;
      this.peds.spawnLeaving(sx, sz, sx - v.forwardZ * 12, sz + v.forwardX * 12);
      this.offence(v.type === 'polizia' ? 'police-car' : 'carjack');
    } else if (v.driver === 'police') {
      const patrol = this.police.patrols.find((p) => p.vehicle === v);
      if (patrol) this.police.patrols.splice(this.police.patrols.indexOf(patrol), 1);
      this.traffic.loose.push(v);
      this.offence('police-car');
    } else if (!this.traffic.loose.includes(v)) {
      this.traffic.loose.push(v);
    }
    v.driver = 'player';
    v.toughness = 1;
    this.car = v;
    this.walker.visible = false;
    this.touch.setMode('car');
    $('dash').hidden = false;
    $('vehicle-name').textContent = v.spec.label;
    this.audio.radioOn = this.save.radioOn;
    this.radioToast();
  }

  private leaveCar(silent: boolean): void {
    const v = this.car;
    if (!v) return;
    this.car = null;
    v.driver = 'none';
    const left = { x: v.x - v.forwardZ * (v.spec.width / 2 + 0.9), z: v.z + v.forwardX * (v.spec.width / 2 + 0.9) };
    const right = { x: v.x + v.forwardZ * (v.spec.width / 2 + 0.9), z: v.z - v.forwardX * (v.spec.width / 2 + 0.9) };
    const spot = this.world.isFree(left.x, left.z, 0.35) ? left : right;
    const r = this.world.resolve(spot, 0.35);
    this.walker.place(r.x, r.z, v.heading);
    this.walker.visible = true;
    this.touch.setMode('foot');
    $('dash').hidden = true;
    if (!silent && this.missions.active && this.missions.active.offer.kind !== 'fuga') this.ui.toast('Torna in auto per continuare il lavoro');
  }

  /* ---------------- frame ---------------- */

  private frame(): void {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const season = seasonOf(this.day);
    if (this.state === 'play') this.step(dt);
    else if (this.state === 'busted') {
      this.bustedTimer -= dt;
      if (this.bustedTimer <= 0) this.release();
    } else if (this.state === 'intro') {
      const h = this.intro.update(dt, this.chase.camera);
      this.weather.update(dt, 0, 'primavera', this.chase.camera.position);
      this.look.apply('primavera', 0);
      this.env.update(solarHours(h, 'primavera'), this.chase.camera.position, { cloud: 0, fog: 0.15 });
      this.applyNight();
    } else if (this.state === 'title') {
      this.hours += dt / HOUR;
      const t = now / 1000;
      const cam = this.chase.camera;
      cam.position.set(-120 + Math.cos(t * 0.05) * 160, 70, 40 + Math.sin(t * 0.05) * 160);
      cam.lookAt(-150, 10, 20);
      this.look.apply(season, this.weather.snow);
      this.env.update(solarHours(this.hours, season), cam.position, this.weather);
      this.applyNight();
    }
    if (this.state === 'card' || this.dialogue.open) this.dialogue.update(dt);
    const cam = this.chase.camera.position;
    this.city.update(cam.x, cam.z, PRESETS[this.quality].far + 40, this.state === 'intro' || this.state === 'title' ? 14 : 6);
    this.parked.update(cam.x, cam.z, PRESETS[this.quality].far * 0.7);
    this.renderer.render(this.scene, this.chase.camera);
    this.fps.frames++;
    this.fps.time += dt;
    if (this.fps.time > 1) {
      this.fps.value = this.fps.frames / this.fps.time;
      this.fps.frames = 0;
      this.fps.time = 0;
    }
  }

  private step(dt: number): void {
    const dh = dt / HOUR;
    this.hours += dh;
    if (this.hours >= 24) {
      this.hours -= 24;
      this.day++;
    }
    const season = seasonOf(this.day);
    const c = this.controls;
    c.relax(dt);
    const view = this.chase.forward();
    const vehicles = [...this.traffic.vehicles, ...this.police.patrols.map((p) => p.vehicle)];
    const talking = this.dialogue.open;
    this.dialogue.update(dt);

    if (this.car) {
      const v = this.car;
      v.gripScale = this.weather.grip;
      /* During a dialogue the car holds still (brake alone would reverse it). */
      const input = talking ? { ...NO_INPUT, handbrake: true } : { throttle: c.throttle, brake: c.brake, steer: c.steer, handbrake: c.handbrake };
      const impact = v.update(input, dt, this.world);
      if (impact > 4) this.audio.crash(impact);
      if (impact > 7) this.fx.crash(v.x + v.forwardX * v.spec.length * 0.4, v.z + v.forwardZ * v.spec.length * 0.4, impact, v.color);
      for (const other of vehicles) {
        if (other === v || Math.abs(other.x - v.x) > 8 || Math.abs(other.z - v.z) > 8) continue;
        const hit = collideVehicles(v, other);
        if (hit > 7) this.fx.crash((v.x + other.x) / 2, (v.z + other.z) / 2, hit, other.color);
        if (hit > 2) {
          this.audio.crash(hit);
          if (other.driver === 'ai' && !this.story.vehicles().includes(other)) this.traffic.knock(other);
          if (other.driver === 'police' && hit > 4) this.offence('ram');
        }
      }
      v.sync();
      if (v.speed > 25 && this.policeNear(v.x, v.z, 45)) this.offence('speeding');
      if (Math.abs(v.speed) > 5 && this.signals.ranRed(this.lastCarPos, v) && this.policeNear(v.x, v.z, 70)) this.offence('redlight');
      this.lastCarPos = { x: v.x, z: v.z };
      if (v.burning > 0 && this.ui.toastTimer <= 0) this.ui.toast('L\'auto prende fuoco: scendi! (E)');
      else if (v.wrecked && this.ui.toastTimer <= 0) this.ui.toast('Auto distrutta: scendi (E)');
      if (v.burnt) {
        /* Stayed inside until the end: thrown out, shaken but fine. */
        this.leaveCar(true);
        this.walker.knock();
      }
    } else if (!talking) {
      this.walker.update(dt, c, view, this.world, vehicles, this.roofs);
      const mode = this.walker.flying ? 'fly' : 'foot';
      if ($('touch').dataset.mode !== mode) this.touch.setMode(mode);
    }

    for (const p of this.police.patrols) {
      for (const other of this.traffic.vehicles) {
        if (other === this.car || Math.abs(other.x - p.vehicle.x) > 7 || Math.abs(other.z - p.vehicle.z) > 7) continue;
        if (collideVehicles(p.vehicle, other) > 3 && other.driver === 'ai') this.traffic.knock(other);
      }
    }

    const player = { x: this.px, z: this.pz };
    const obstacles = this.car || this.walker.airborne ? [] : [player];
    const keep = new Set<Vehicle>([...(this.car ? [this.car] : []), ...this.story.vehicles()]);
    for (const v of this.traffic.vehicles) v.gripScale = this.weather.grip;
    this.signals.update(dt);
    /* Suspension, fire timers and effects for everything near the camera. */
    const cam = this.chase.camera.position;
    /* Story cars also sit in the traffic list: count each car once. */
    const near = [...new Set([...this.traffic.vehicles, ...this.police.patrols.map((p) => p.vehicle), ...this.story.vehicles()])];
    for (const v of near) if (Math.abs(v.x - cam.x) < 160 && Math.abs(v.z - cam.z) < 160) v.animate(dt);
    this.fx.update(dt, near, cam);
    this.traffic.update(dt, { player, view, obstacles }, keep, () => {
      if (Math.random() < 0.3) this.audio.horn();
    });
    this.peds.update(dt, player, [...this.traffic.vehicles, ...this.police.patrols.map((p) => p.vehicle)], (_ped, car) => {
      if (car === this.car) this.offence('knock');
    });

    const target = this.car
      ? { x: this.car.x, z: this.car.z, vx: this.car.vx, vz: this.car.vz }
      : { x: this.walker.x, z: this.walker.z, vx: this.walker.vx, vz: this.walker.vz };
    this.police.update(dt, this.law.alert.level, target, view);
    const before = this.law.alert.level;
    if (this.law.alert.update(dt, this.police.sees(player.x, player.z)) && this.law.alert.level < before) {
      this.ui.toast(this.law.alert.level === 0 ? 'Li hai seminati' : `Allerta ${this.law.alert.level}`);
    }
    this.checkBust(dt);

    /* Story first; free jobs only between story missions. */
    this.story.update(dt);
    const health = this.car ? this.car.health : 100;
    const input = { x: player.x, z: player.z, inVehicle: !!this.car, speed: this.car ? Math.abs(this.car.speed) : 0, health, alert: this.law.alert.level };
    if (!this.story.running) {
      this.jobs.refresh(player, this.eventsNow);
      if (!this.missions.active && this.law.alert.level >= 3 && this.car) this.onMission(this.missions.startEscape(this.law.alert.level, input));
      for (const e of this.missions.update(dt, input)) this.onMission(e);
    }
    this.jobs.sync(!!this.story.running);
    this.pickSantini();
    this.garage();

    /* Seasons, weather, events. */
    this.weather.update(dt, dh, season, this.chase.camera.position);
    this.look.apply(season, this.weather.snow);
    const events = activeEvents(this.day, this.hours);
    for (const e of events) if (!this.eventsNow.some((x) => x.id === e.id)) this.ui.banner(e.name, `${e.place.name} · ${e.blurb}`, 4.5);
    this.eventsNow = events;
    this.events.update(dt, events, this.hours, this.chase.camera.position);

    /* Audio. */
    if (this.car) {
      const v = this.car;
      const rpm = Math.min(1, Math.abs(v.speed) / v.spec.maxSpeed);
      this.audio.setEngine(rpm * 0.9 + (c.throttle ? 0.1 : 0), c.throttle, true);
      this.audio.radioOn = this.save.radioOn;
    } else {
      /* The jetpack hums through the engine voice. */
      if (this.walker.flying) this.audio.setEngine(0.55 + Math.min(1, this.walker.speed / 32) * 0.45, c.ascend ? 1 : 0.4, true);
      else this.audio.setEngine(0, 0, false);
      if (this.audio.radioOn) this.audio.radioOn = false;
    }
    const nearest = this.police.patrols.reduce((m, p) => Math.min(m, Math.hypot(p.vehicle.x - player.x, p.vehicle.z - player.z)), Infinity);
    this.audio.setSiren(this.law.alert.level > 0 ? Math.max(0, 1 - nearest / 120) : 0);

    const t = this.car
      ? { x: this.car.x, y: 0, z: this.car.z, heading: this.car.heading, speed: this.car.speed, driving: true }
      : { x: this.walker.x, y: this.walker.y, z: this.walker.z, heading: this.walker.heading, speed: this.walker.speed, driving: this.walker.flying };
    this.chase.update(dt, t, c.orbit, c.pitch, this.world);
    this.env.update(solarHours(this.hours, season), this.chase.camera.position, this.weather);
    this.applyNight();
    this.hud(dt);

    this.saveTimer += dt;
    if (this.saveTimer > 10) {
      this.saveTimer = 0;
      this.persist();
    }
  }

  /** Seasonal events add their own jobs at the event square. */
  /** Officina Stirone: stop in the green beacon to repair and save. */
  private garage(): void {
    const at = this.story.spot('officina');
    const k = { x: at.x + Math.cos(at.heading) * 3, z: at.z - Math.sin(at.heading) * 3 };
    this.garageMarker.at(k.x, k.z).update(performance.now() / 1000);
    const v = this.car;
    if (!v || Math.hypot(v.x - k.x, v.z - k.z) > 6 || Math.abs(v.speed) > 1) return;
    if (this.ui.toastTimer > 0) return;
    if (v.health < 99 || v.wrecked) {
      if (this.save.money < REPAIR_COST) {
        this.ui.toast(`Riparazione: servono € ${REPAIR_COST}`);
        return;
      }
      this.save.money -= REPAIR_COST;
      v.health = 100;
      v.wrecked = false;
      this.persist();
      this.ui.toast(`Auto riparata (-€ ${REPAIR_COST}) · partita salvata`, 3);
    } else {
      this.persist();
      this.ui.toast('Partita salvata', 2);
    }
  }

  private applyNight(): void {
    const n = this.env.night;
    for (const m of this.city.materials.lit) m.emissiveIntensity = n * 1.1;
    this.city.lampGlow.opacity = n * 0.55;
    this.city.lampBulb.color.setRGB(0.33 + n * 0.67, 0.31 + n * 0.55, 0.29 + n * 0.25);
    LIGHTS.head.color.setRGB(0.75 + n * 0.25, 0.73 + n * 0.22, 0.65 + n * 0.15);
    LIGHTS.tail.color.setRGB(0.45 + n * 0.55, 0.06 + n * 0.04, 0.05);
    LIGHTS.beam.opacity = n * 0.32;
    const on = this.police.flashOn;
    LIGHTS.blue.color.set(on ? 0x3060ff : 0x101830);
    LIGHTS.red.color.set(on ? 0x301010 : 0xff2a2a);
  }

  private busted(): void {
    const fine = bustedFine(this.save.money);
    this.save.money -= fine;
    this.save.busted++;
    this.persist();
    $('busted-detail').textContent = `Multa e spese: ${formatMoney(fine)}. Ti rilasciano in ${RELEASE.name}.`;
    if (this.missions.active) this.missions.fail(this.missions.active, 'polizia');
    if (this.story.running) this.story.fail('Fermato dalla polizia');
    this.leaveCar(true);
    this.bustedTimer = 3.2;
    this.audio.jingle(false);
    this.setState('busted');
  }

  private release(): void {
    this.law.alert.clear();
    this.police.dismissAll();
    const n = nearestOnGraph(this.graph, RELEASE.x, RELEASE.z, true);
    const r = this.world.resolve({ x: n.x + 3, z: n.z + 3 }, 0.35);
    this.walker.place(r.x, r.z, 0);
    this.chase.snap();
    this.setState('play');
  }

  private onMission(e: MissionEvent): void {
    const a = e.active;
    const title = a.offer.special ?? TITLES[a.offer.kind];
    if (e.type === 'started') {
      const text =
        a.offer.kind === 'corsa'
          ? `Passa dai ${a.checkpoints.length} checkpoint fino a ${a.offer.to.name}`
          : a.offer.kind === 'taxi'
            ? `Il cliente sale: portalo a ${a.offer.to.name}`
            : a.offer.kind === 'fuga'
              ? 'La polizia ti sta addosso: seminala'
              : `Carico a bordo: consegnalo a ${a.offer.to.name}`;
      this.ui.banner(title, text);
      this.audio.checkpoint();
    } else if (e.type === 'checkpoint') {
      this.audio.checkpoint();
      this.ui.toast(`Checkpoint · ne mancano ${e.left}`, 1.2);
    } else if (e.type === 'completed') {
      const bonus = a.offer.special ? Math.round(e.reward * 0.5) : 0;
      const total = e.reward + e.bonus + bonus;
      this.save.money += total;
      this.save.jobs++;
      if (a.offer.kind === 'corsa') {
        const time = a.timeTotal - a.timeLeft;
        if (this.save.bestRace === null || time < this.save.bestRace) this.save.bestRace = Math.round(time);
      }
      this.persist();
      this.ui.banner(`${title}: fatto`, `+${formatMoney(total)}`);
      this.ui.bumpMoney();
      this.audio.jingle(true);
    } else if (e.type === 'failed') {
      const why = { tempo: 'Tempo scaduto', auto: 'Auto distrutta', polizia: 'Fermato dalla polizia', abbandono: 'Lavoro abbandonato' }[e.reason];
      this.ui.banner(`${title}: fallito`, why);
      this.audio.jingle(false);
    }
  }

  private blips(): Blip[] {
    const out: Blip[] = [...this.story.blips(), ...this.jobs.blips(!!this.story.running)];
    const g = this.story.spot('officina');
    out.push({ x: g.x, z: g.z, kind: 'home', label: 'O' });
    for (const p of this.police.patrols) out.push({ x: p.vehicle.x, z: p.vehicle.z, kind: 'police' });
    return out;
  }

  private hud(dt: number): void {
    $('money').textContent = formatMoney(this.save.money);
    $('clock').textContent = formatClock(this.hours);
    const season = seasonOf(this.day);
    const ev = this.eventsNow[0];
    $('when').textContent = `${SEASON_LABEL[season]} · ${PHASE_LABEL[phaseOf(this.hours, season)]} · ${WEATHER_LABEL[this.weather.kind as WeatherKind]}${ev ? ` · ${ev.name}` : ''}`;
    const alert = $('alert');
    alert.classList.toggle('on', this.law.alert.level > 0);
    alert.querySelectorAll('i').forEach((bar, i) => bar.classList.toggle('lit', i < this.law.alert.level));

    /* Objective panel: the story step, or the free job. */
    const job = $('job');
    const active = this.missions.active;
    if (this.story.running && this.objectiveText) {
      job.hidden = false;
      $('job-kind').textContent = this.story.running.mission.title;
      $('job-text').textContent = this.objectiveExtra ? `${this.objectiveText} · ${this.objectiveExtra}` : this.objectiveText;
      this.ui.timer(this.objectiveTime);
    } else if (active && !this.story.running) {
      job.hidden = false;
      $('job-kind').textContent = active.offer.special ?? TITLES[active.offer.kind];
      $('job-text').textContent =
        active.stage === 'escape' ? 'Fai scendere l\'allerta a zero' : active.stage === 'race' ? `Checkpoint ${active.index + 1}/${active.checkpoints.length}` : `→ ${active.target.name}`;
      this.ui.timer(active.timeLeft);
    } else {
      job.hidden = true;
    }

    if (!this.car) {
      const air = this.walker.flying || this.walker.airborne;
      const dash = $('dash');
      dash.hidden = !air;
      if (air) {
        $('speed').textContent = String(Math.round(this.walker.speed * 3.6));
        $('vehicle-name').textContent = `Jetpack · ${Math.round(this.walker.y)} m`;
        $('health').style.width = '100%';
        $('health').style.background = '#6ad1ff';
      }
    }
    if (this.car) {
      $('speed').textContent = String(Math.round(Math.abs(this.car.speed) * 3.6));
      const h = $('health');
      h.style.width = `${this.car.health}%`;
      h.style.background = this.car.health > 50 ? '#7be37a' : this.car.health > 20 ? '#ffd23f' : '#ff3b3b';
    }

    let prompt = '';
    if (this.dialogue.open) prompt = '';
    else if (!this.car && !this.walker.airborne) {
      const near = [...this.traffic.vehicles, ...this.police.patrols.map((p) => p.vehicle)].find((v) => Math.hypot(v.x - this.walker.x, v.z - this.walker.z) < 4.2);
      if (near && !this.story.vehicles().includes(near)) prompt = `${this.mobile ? 'SALI' : 'E'} · ${SPECS[near.type].label}${near.driver === 'ai' || near.driver === 'police' ? ' (la rubi)' : ''}`;
      else {
        const kerb = this.parked.nearest(this.walker.x, this.walker.z, 4.2);
        if (kerb) prompt = `${this.mobile ? 'SALI' : 'E'} · ${SPECS[kerb.type].label} parcheggiata`;
      }
    } else if (this.car && !this.missions.active && !this.story.running) {
      const offer = this.missions.offers.find((o) => Math.hypot(o.x - this.car!.x, o.z - this.car!.z) < 20);
      if (offer) prompt = `Fermati nel segnale: ${offer.special ?? TITLES[offer.kind]} per ${offer.to.name}`;
    }
    const pe = $('prompt');
    pe.hidden = !prompt;
    if (prompt) pe.textContent = prompt;

    this.ui.tick(dt);
    const yaw = Math.atan2(-this.chase.forward().x, -this.chase.forward().z);
    const heading = this.car ? this.car.heading : this.walker.heading;
    this.radar.draw(this.px, this.pz, yaw, heading, this.blips(), dt, this.car ? Math.max(0.6, 1 - Math.abs(this.car.speed) / 60) : 1.4);
  }
}
