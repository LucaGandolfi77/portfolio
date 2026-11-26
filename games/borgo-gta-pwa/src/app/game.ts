import * as THREE from 'three';
import { FIDENZA } from '../data/fidenza';
import { CollisionWorld, buildCityColliders } from '../data/colliders';
import { buildRoadGraph, nearestOnGraph, pointOnEdge, type RoadGraph } from '../data/roads';
import { createTextures } from '../world/textures';
import { buildCity, type CityRender } from '../world/city';
import { createEnvironment, type Environment } from '../world/environment';
import { Marker } from '../world/markers';
import { collideVehicles, LIGHTS, SPECS, Vehicle } from '../game/vehicle';
import { Traffic } from '../game/traffic';
import { Pedestrians } from '../game/peds';
import { Alert, PoliceForce, type Offence } from '../game/police';
import { Missions, TITLES, type MissionEvent, type Spot } from '../game/missions';
import { Controls, type Action } from '../game/input';
import { ChaseCamera } from '../game/camera';
import { Walker } from '../game/player';
import { bustedFine, formatClock, formatMoney, loadSave, writeSave, type Quality, type SaveData } from '../game/save';
import { AudioEngine, STATIONS } from '../audio/audio';
import { Radar, type Blip } from '../ui/radar';
import { TouchControls } from '../ui/touch';

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
}

const PRESETS: Record<Quality, Preset> = {
  bassa: { scale: 0.5, traffic: 8, peds: 5, far: 300 },
  media: { scale: 0.72, traffic: 13, peds: 9, far: 380 },
  alta: { scale: 1, traffic: 20, peds: 14, far: 470 }
};

/** Real-time seconds per in-game hour. */
const HOUR = 60;
const START: Spot = { x: 15, z: -21, name: 'Piazza Garibaldi' };
const RELEASE: Spot = { x: 195, z: -103, name: 'Piazza della Repubblica' };

export class Game {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private chase: ChaseCamera;
  private env: Environment;
  private city: CityRender;
  private world: CollisionWorld;
  private graph: RoadGraph;
  private traffic: Traffic;
  private peds: Pedestrians;
  private police: PoliceForce;
  private alert = new Alert();
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
  private state: 'title' | 'play' | 'pause' | 'map' | 'busted' = 'title';
  private clock = 0;
  private last = performance.now();
  private bustTimer = 0;
  private bustedTimer = 0;
  private markers = new Map<number, Marker>();
  private targetMarker: Marker;
  private bannerTimer = 0;
  private toastTimer = 0;
  private saveTimer = 0;
  private beamTex: THREE.Texture;
  private fps = { frames: 0, time: 0, value: 60 };

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
    this.city = buildCity(textures);
    this.scene.add(this.city.group);
    this.chase = new ChaseCamera(innerWidth / innerHeight, preset.far);
    this.env = createEnvironment(this.scene, preset.far);

    this.progress(0.6, 'Traccio le strade…');
    this.world = new CollisionWorld(buildCityColliders());
    this.graph = buildRoadGraph(FIDENZA.roads);
    this.traffic = new Traffic(this.scene, this.graph, this.world, this.beamTex, preset.traffic);
    this.peds = new Pedestrians(this.scene, this.graph, preset.peds);
    this.police = new PoliceForce(this.scene, this.graph, this.world, this.beamTex);

    const spots: Spot[] = FIDENZA.places.map((p) => {
      const n = nearestOnGraph(this.graph, p.x, p.z);
      return { x: n.x, z: n.z, name: p.name };
    });
    for (const e of this.graph.edges) {
      if (e.name && e.length > 60 && e.kind !== 'primary') {
        const p = pointOnEdge(e, e.length / 2, true);
        spots.push({ x: p.x, z: p.z, name: e.name });
      }
    }
    this.missions = new Missions(spots, this.graph);
    this.targetMarker = new Marker(0xffd23f, 3.6);
    this.targetMarker.group.visible = false;
    this.scene.add(this.targetMarker.group);

    this.walker = new Walker(this.scene, START.x, START.z, Math.PI);
    this.spawnStarterCar();
    if (import.meta.env.DEV) (window as unknown as { __game: Game }).__game = this;

    this.controls = new Controls(canvas);
    this.controls.on((a) => this.onAction(a));
    this.touch = new TouchControls($('touch'), this.controls);
    this.radar = new Radar($<HTMLCanvasElement>('radar'), this.mobile);
    this.bindUi();
    this.clock = this.save.hours;
    this.progress(1, 'Pronto.');
    addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'play') this.setState('pause');
    });
    this.resize();
    this.renderer.setAnimationLoop(() => this.frame());
    $('loading').hidden = true;
    $('title').hidden = false;
    this.updateTitleStats();
  }

  private progress(value: number, text: string): void {
    $('load-bar').style.width = `${Math.round(value * 100)}%`;
    $('load-text').textContent = text;
  }

  private applyQuality(): void {
    const preset = PRESETS[this.quality];
    const ratio = Math.min(devicePixelRatio || 1, 2) * preset.scale;
    this.renderer.setPixelRatio(ratio);
    /* Below native resolution, keep the pixels crisp like an old console. */
    $('canvas').classList.toggle('chunky', ratio < 0.9);
    if (this.traffic) this.traffic.target = preset.traffic;
    if (this.peds) this.peds.target = preset.peds;
  }

  private resize(): void {
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.chase.camera.aspect = innerWidth / innerHeight;
    this.chase.camera.updateProjectionMatrix();
  }

  private spawnStarterCar(): void {
    const n = nearestOnGraph(this.graph, START.x + 12, START.z + 6);
    const p = pointOnEdge(n.edge, n.d, true);
    const off = n.edge.width / 2 - 1;
    const v = new Vehicle('utilitaria', n.x - p.dz * off, n.z + p.dx * off, Math.atan2(p.dx, p.dz), 0xc23b2e, this.beamTex);
    this.scene.add(v.model);
    this.traffic.loose.push(v);
    /* Start on the pavement right next to it. */
    const side = { x: v.x - p.dz * 2.2, z: v.z + p.dx * 2.2 };
    const free = this.world.isFree(side.x, side.z, 0.35) ? side : { x: v.x + p.dz * 2.2, z: v.z - p.dx * 2.2 };
    const r = this.world.resolve(free, 0.35);
    this.walker.place(r.x, r.z, v.heading);
  }

  /* ---------------- UI ---------------- */

  private bindUi(): void {
    $('play').addEventListener('click', () => {
      this.audio.unlock();
      this.audio.setStation(this.save.station);
      this.audio.radioOn = this.save.radioOn;
      this.setState('play');
      this.chase.snap();
      this.banner('Fidenza, di notte', 'Trova un\'auto e cerca i segnali arancioni: ci sono lavori da fare.');
    });
    $('resume').addEventListener('click', () => this.setState('play'));
    $('pause-btn').addEventListener('click', () => this.setState('pause'));
    $('map-btn').addEventListener('click', () => this.setState('map'));
    $('map-close').addEventListener('click', () => this.setState('play'));
    $('quality').addEventListener('click', () => {
      const order: Quality[] = ['bassa', 'media', 'alta'];
      this.quality = order[(order.indexOf(this.quality) + 1) % 3];
      this.save.quality = this.quality;
      writeSave(this.save);
      this.applyQuality();
      this.resize();
      this.syncPauseLabels();
    });
    $('radio-toggle').addEventListener('click', () => {
      this.audio.radioOn = !this.audio.radioOn;
      this.save.radioOn = this.audio.radioOn;
      writeSave(this.save);
      this.syncPauseLabels();
    });
    $('reset').addEventListener('click', () => {
      if (!confirm('Ricominciare da capo? Soldi e statistiche tornano a zero.')) return;
      const quality = this.save.quality;
      this.save = { ...loadSave(null), quality };
      writeSave(this.save);
      this.alert.clear();
      this.police.dismissAll();
      if (this.missions.active) this.missions.fail(this.missions.active, 'abbandono');
      this.leaveCar(true);
      this.walker.place(START.x, START.z, Math.PI);
      this.chase.snap();
      this.setState('play');
    });
  }

  private syncPauseLabels(): void {
    $('quality').textContent = `Grafica: ${this.quality}`;
    $('radio-toggle').textContent = `Radio: ${this.audio.radioOn ? 'accesa' : 'spenta'}`;
  }

  private updateTitleStats(): void {
    const s = this.save;
    $('title-stats').textContent = s.jobs > 0 || s.money !== 250 ? `${formatMoney(s.money)} · ${s.jobs} lavori fatti` : '';
  }

  private setState(next: Game['state']): void {
    this.state = next;
    $('title').hidden = true;
    $('hud').hidden = next === 'title';
    $('touch').hidden = !(this.mobile && next === 'play');
    $('pause').hidden = next !== 'pause';
    $('map').hidden = next !== 'map';
    $('busted').hidden = next !== 'busted';
    this.audio.suspend(next === 'pause' || next === 'map');
    if (next === 'pause') this.syncPauseLabels();
    if (next === 'map') this.radar.drawMap($<HTMLCanvasElement>('map-canvas'), this.px, this.pz, this.blips());
    this.last = performance.now();
  }

  private banner(title: string, detail = '', seconds = 3.2): void {
    const el = $('banner');
    el.innerHTML = '';
    el.append(title);
    if (detail) {
      const small = document.createElement('small');
      small.textContent = detail;
      el.append(small);
    }
    el.hidden = false;
    /* Restart the drop-in animation. */
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    this.bannerTimer = seconds;
  }

  private toast(text: string, seconds = 2.2): void {
    const el = $('toast');
    el.textContent = text;
    el.hidden = false;
    this.toastTimer = seconds;
  }

  /* ---------------- actions ---------------- */

  private get px(): number {
    return this.car ? this.car.x : this.walker.x;
  }

  private get pz(): number {
    return this.car ? this.car.z : this.walker.z;
  }

  private onAction(a: Action): void {
    if (a === 'pause') {
      if (this.state === 'play') this.setState('pause');
      else if (this.state === 'pause' || this.state === 'map') this.setState('play');
      return;
    }
    if (a === 'map') {
      if (this.state === 'play') this.setState('map');
      else if (this.state === 'map') this.setState('play');
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
    } else if (a === 'camera') {
      this.chase.mode = this.chase.mode === 'near' ? 'far' : 'near';
    }
  }

  private radioToast(): void {
    if (!this.audio.radioOn) this.toast('Radio spenta');
    else {
      const s = STATIONS[this.audio.station];
      this.toast(`${s.name} ${s.freq} · ${s.genre}`, 2.8);
    }
  }

  private offence(o: Offence): void {
    if (this.alert.add(o, this.clock * HOUR)) {
      const words: Record<Offence, string> = {
        carjack: 'Auto rubata',
        knock: 'Pedone investito',
        ram: 'Speronamento',
        speeding: 'Eccesso di velocità',
        'police-car': 'Auto della polizia rubata'
      };
      this.toast(`${words[o]}: allerta ${this.alert.level}`);
    }
  }

  private enterNearestCar(): void {
    let best: Vehicle | null = null;
    let bestD = 4.2;
    const all = [...this.traffic.vehicles, ...this.police.patrols.map((p) => p.vehicle)];
    for (const v of all) {
      const d = Math.hypot(v.x - this.walker.x, v.z - this.walker.z);
      if (d < bestD) {
        best = v;
        bestD = d;
      }
    }
    if (!best) {
      this.toast('Nessuna auto vicina');
      return;
    }
    if (best.wrecked) {
      this.toast('Quest\'auto non parte più');
      return;
    }
    const v = best;
    if (v.driver === 'ai') {
      /* The driver gets out and walks off; that is theft. */
      this.traffic.release(v);
      const sx = v.x - v.forwardZ * 1.8, sz = v.z + v.forwardX * 1.8;
      this.peds.spawnLeaving(sx, sz, sx - v.forwardZ * 12, sz + v.forwardX * 12);
      this.offence('carjack');
    } else if (v.driver === 'police') {
      const patrol = this.police.patrols.find((p) => p.vehicle === v);
      if (patrol) this.police.patrols.splice(this.police.patrols.indexOf(patrol), 1);
      this.traffic.loose.push(v);
      this.offence('police-car');
    } else if (!this.traffic.loose.includes(v)) {
      this.traffic.loose.push(v);
    }
    v.driver = 'player';
    this.car = v;
    this.walker.visible = false;
    this.touch.setMode(true);
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
    /* Step out on the left, or the right if the left is blocked. */
    const left = { x: v.x - v.forwardZ * (v.spec.width / 2 + 0.9), z: v.z + v.forwardX * (v.spec.width / 2 + 0.9) };
    const right = { x: v.x + v.forwardZ * (v.spec.width / 2 + 0.9), z: v.z - v.forwardX * (v.spec.width / 2 + 0.9) };
    const spot = this.world.isFree(left.x, left.z, 0.35) ? left : right;
    const r = this.world.resolve(spot, 0.35);
    this.walker.place(r.x, r.z, v.heading);
    this.walker.visible = true;
    this.touch.setMode(false);
    $('dash').hidden = true;
    if (!silent && this.missions.active && this.missions.active.offer.kind !== 'fuga') {
      this.toast('Torna in auto per continuare il lavoro');
    }
  }

  /* ---------------- frame ---------------- */

  private frame(): void {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (this.state === 'play') this.step(dt);
    else if (this.state === 'busted') {
      this.bustedTimer -= dt;
      if (this.bustedTimer <= 0) this.release();
    }
    if (this.state === 'title') {
      /* Slow orbit over the centre behind the title. */
      this.clock += dt / HOUR;
      const t = now / 1000;
      const cam = this.chase.camera;
      cam.position.set(-120 + Math.cos(t * 0.05) * 160, 70, 40 + Math.sin(t * 0.05) * 160);
      cam.lookAt(-150, 10, 20);
      this.env.update(this.clock, cam.position);
      this.applyNight();
    }
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
    this.clock += dt / HOUR;
    const c = this.controls;
    c.relax(dt);
    const view = this.chase.forward();
    const vehicles = [...this.traffic.vehicles, ...this.police.patrols.map((p) => p.vehicle)];

    if (this.car) {
      const v = this.car;
      const impact = v.update({ throttle: c.throttle, brake: c.brake, steer: c.steer, handbrake: c.handbrake }, dt, this.world);
      if (impact > 4) this.audio.crash(impact);
      for (const other of vehicles) {
        if (other === v || Math.abs(other.x - v.x) > 8 || Math.abs(other.z - v.z) > 8) continue;
        const hit = collideVehicles(v, other);
        if (hit > 2) {
          this.audio.crash(hit);
          if (other.driver === 'ai') this.traffic.knock(other);
          if (other.driver === 'police' && hit > 4) this.offence('ram');
        }
      }
      v.sync();
      if (v.speed > 25 && this.police.sees(v.x, v.z)) this.offence('speeding');
      if (v.wrecked && this.toastTimer <= 0) this.toast('Auto distrutta: scendi (E)');
    } else {
      this.walker.update(dt, c, view, this.world, vehicles);
    }

    /* Police cars bump into traffic too. */
    for (const p of this.police.patrols) {
      for (const other of this.traffic.vehicles) {
        if (other === this.car || Math.abs(other.x - p.vehicle.x) > 7 || Math.abs(other.z - p.vehicle.z) > 7) continue;
        if (collideVehicles(p.vehicle, other) > 3 && other.driver === 'ai') this.traffic.knock(other);
      }
    }

    const player = { x: this.px, z: this.pz };
    const obstacles = this.car ? [] : [player];
    const keep = new Set<Vehicle>(this.car ? [this.car] : []);
    this.traffic.update(dt, { player, view, obstacles }, keep, () => {
      if (Math.random() < 0.3) this.audio.horn();
    });
    this.peds.update(dt, player, [...this.traffic.vehicles, ...this.police.patrols.map((p) => p.vehicle)], (_ped, car) => {
      if (car === this.car) this.offence('knock');
    });

    const target = this.car
      ? { x: this.car.x, z: this.car.z, vx: this.car.vx, vz: this.car.vz }
      : { x: this.walker.x, z: this.walker.z, vx: this.walker.vx, vz: this.walker.vz };
    this.police.update(dt, this.alert.level, target, view);
    const before = this.alert.level;
    if (this.alert.update(dt, this.police.sees(player.x, player.z)) && this.alert.level < before) {
      this.toast(this.alert.level === 0 ? 'Li hai seminati' : `Allerta ${this.alert.level}`);
    }
    this.checkBust(dt);

    /* Jobs. */
    const health = this.car ? this.car.health : 100;
    const input = { x: player.x, z: player.z, inVehicle: !!this.car, speed: this.car ? Math.abs(this.car.speed) : 0, health, alert: this.alert.level };
    this.missions.refresh(player);
    if (!this.missions.active && this.alert.level >= 3 && this.car) {
      this.onMission(this.missions.startEscape(this.alert.level, input));
    }
    for (const e of this.missions.update(dt, input)) this.onMission(e);
    this.syncMarkers(dt);

    /* Audio. */
    if (this.car) {
      const v = this.car;
      const rpm = Math.min(1, Math.abs(v.speed) / v.spec.maxSpeed);
      this.audio.setEngine(rpm * 0.9 + (c.throttle ? 0.1 : 0), c.throttle, true);
      this.audio.radioOn = this.save.radioOn;
    } else {
      this.audio.setEngine(0, 0, false);
    }
    if (!this.car && this.audio.radioOn) this.audio.radioOn = false;
    const nearest = this.police.patrols.reduce((m, p) => Math.min(m, Math.hypot(p.vehicle.x - player.x, p.vehicle.z - player.z)), Infinity);
    this.audio.setSiren(this.alert.level > 0 ? Math.max(0, 1 - nearest / 120) : 0);

    /* Camera, world light, HUD. */
    const t = this.car
      ? { x: this.car.x, y: 0, z: this.car.z, heading: this.car.heading, speed: this.car.speed, driving: true }
      : { x: this.walker.x, y: 0, z: this.walker.z, heading: this.walker.heading, speed: this.walker.speed, driving: false };
    this.chase.update(dt, t, c.orbit, c.pitch, this.world);
    this.env.update(this.clock, this.chase.camera.position);
    this.applyNight();
    this.hud(dt);

    this.saveTimer += dt;
    if (this.saveTimer > 10) {
      this.saveTimer = 0;
      this.save.hours = this.clock % 24;
      writeSave(this.save);
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

  private checkBust(dt: number): void {
    if (this.alert.level === 0) {
      this.bustTimer = 0;
      return;
    }
    let close = 0;
    for (const p of this.police.patrols) {
      const d = Math.hypot(p.vehicle.x - this.px, p.vehicle.z - this.pz);
      if (d < (this.car ? 7 : 5) && Math.abs(p.vehicle.speed) < 5) close++;
    }
    const stopped = this.car ? Math.abs(this.car.speed) < 1.5 : true;
    if (close > 0 && stopped) this.bustTimer += dt;
    else this.bustTimer = Math.max(0, this.bustTimer - dt * 2);
    if (this.bustTimer > (this.car ? 2.2 : 1.6)) this.busted();
  }

  private busted(): void {
    const fine = bustedFine(this.save.money);
    this.save.money -= fine;
    this.save.busted++;
    writeSave(this.save);
    $('busted-detail').textContent = `Multa e spese: ${formatMoney(fine)}. Ti rilasciano in ${RELEASE.name}.`;
    if (this.missions.active) this.missions.fail(this.missions.active, 'polizia');
    this.leaveCar(true);
    this.bustTimer = 0;
    this.bustedTimer = 3.2;
    this.audio.jingle(false);
    this.setState('busted');
  }

  private release(): void {
    this.alert.clear();
    this.police.dismissAll();
    const n = nearestOnGraph(this.graph, RELEASE.x, RELEASE.z);
    const r = this.world.resolve({ x: n.x + 3, z: n.z + 3 }, 0.35);
    this.walker.place(r.x, r.z, 0);
    this.chase.snap();
    this.setState('play');
  }

  private onMission(e: MissionEvent): void {
    const a = e.active;
    const title = TITLES[a.offer.kind];
    if (e.type === 'started') {
      const text =
        a.offer.kind === 'corsa'
          ? `Passa dai ${a.checkpoints.length} checkpoint fino a ${a.offer.to.name}`
          : a.offer.kind === 'taxi'
            ? `Il cliente sale: portalo a ${a.offer.to.name}`
            : a.offer.kind === 'fuga'
              ? 'La polizia ti sta addosso: seminala'
              : `Pacco caricato: consegnalo a ${a.offer.to.name}`;
      this.banner(title, text);
      this.audio.checkpoint();
    } else if (e.type === 'checkpoint') {
      this.audio.checkpoint();
      this.toast(`Checkpoint · ne mancano ${e.left}`, 1.2);
    } else if (e.type === 'completed') {
      const total = e.reward + e.bonus;
      this.save.money += total;
      this.save.jobs++;
      if (a.offer.kind === 'corsa') {
        const time = a.timeTotal - a.timeLeft;
        if (this.save.bestRace === null || time < this.save.bestRace) this.save.bestRace = Math.round(time);
      }
      writeSave(this.save);
      this.banner(`${title} riuscita`, `+${formatMoney(e.reward)}${e.bonus ? ` e ${formatMoney(e.bonus)} di extra` : ''}`);
      const money = $('money');
      money.classList.remove('bump');
      void money.offsetWidth;
      money.classList.add('bump');
      this.audio.jingle(true);
    } else if (e.type === 'failed') {
      const why = { tempo: 'Tempo scaduto', auto: 'Auto distrutta', polizia: 'Fermato dalla polizia', abbandono: 'Lavoro abbandonato' }[e.reason];
      this.banner(`${title} fallita`, why);
      this.audio.jingle(false);
    }
  }

  private syncMarkers(dt: number): void {
    const t = this.clock * HOUR;
    const active = this.missions.active;
    /* Offer beacons (hidden during a job). */
    const live = new Set<number>();
    for (const o of this.missions.offers) {
      live.add(o.id);
      let m = this.markers.get(o.id);
      if (!m) {
        m = new Marker(0xff8a3d).at(o.x, o.z);
        this.markers.set(o.id, m);
        this.scene.add(m.group);
      }
      m.group.visible = !active;
      m.update(t);
    }
    for (const [id, m] of this.markers) {
      if (!live.has(id)) {
        this.scene.remove(m.group);
        this.markers.delete(id);
      }
    }
    if (active && active.stage !== 'escape') {
      this.targetMarker.group.visible = true;
      this.targetMarker.at(active.target.x, active.target.z).update(t);
    } else {
      this.targetMarker.group.visible = false;
    }
    void dt;
  }

  private blips(): Blip[] {
    const out: Blip[] = [];
    const active = this.missions.active;
    if (active && active.stage !== 'escape') out.push({ x: active.target.x, z: active.target.z, kind: 'target' });
    if (!active) {
      for (const o of this.missions.offers) out.push({ x: o.x, z: o.z, kind: 'offer', label: o.kind === 'consegna' ? 'C' : o.kind === 'taxi' ? 'T' : 'R' });
    }
    for (const p of this.police.patrols) out.push({ x: p.vehicle.x, z: p.vehicle.z, kind: 'police' });
    return out;
  }

  private hud(dt: number): void {
    $('money').textContent = formatMoney(this.save.money);
    $('clock').textContent = formatClock(this.clock);
    const alert = $('alert');
    alert.classList.toggle('on', this.alert.level > 0);
    alert.querySelectorAll('i').forEach((bar, i) => bar.classList.toggle('lit', i < this.alert.level));

    const active = this.missions.active;
    $('job').hidden = !active;
    if (active) {
      $('job-kind').textContent = TITLES[active.offer.kind];
      $('job-text').textContent =
        active.stage === 'escape'
          ? 'Fai scendere l\'allerta a zero'
          : active.stage === 'race'
            ? `Checkpoint ${active.index + 1}/${active.checkpoints.length}`
            : `→ ${active.target.name}`;
      const left = Math.max(0, Math.ceil(active.timeLeft));
      const timer = $('job-timer');
      timer.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      timer.classList.toggle('low', left <= 10);
    }

    if (this.car) {
      $('speed').textContent = String(Math.round(Math.abs(this.car.speed) * 3.6));
      const h = $('health');
      h.style.width = `${this.car.health}%`;
      h.style.background = this.car.health > 50 ? '#7be37a' : this.car.health > 20 ? '#ffd23f' : '#ff3b3b';
    }

    /* Context prompt: a car to take. */
    let prompt = '';
    if (!this.car) {
      const near = [...this.traffic.vehicles, ...this.police.patrols.map((p) => p.vehicle)].find(
        (v) => Math.hypot(v.x - this.walker.x, v.z - this.walker.z) < 4.2
      );
      if (near) prompt = `${this.mobile ? 'SALI' : 'E'} · ${SPECS[near.type].label}${near.driver === 'ai' || near.driver === 'police' ? ' (la rubi)' : ''}`;
    } else if (!this.missions.active) {
      const offer = this.missions.offers.find((o) => Math.hypot(o.x - this.car!.x, o.z - this.car!.z) < 20);
      if (offer) prompt = `Fermati nel segnale: ${TITLES[offer.kind]} per ${offer.to.name}`;
    }
    const pe = $('prompt');
    pe.hidden = !prompt;
    if (prompt) pe.textContent = prompt;

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) $('banner').hidden = true;
    }
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) $('toast').hidden = true;
    }
    const yaw = Math.atan2(-this.chase.forward().x, -this.chase.forward().z);
    const heading = this.car ? this.car.heading : this.walker.heading;
    this.radar.draw(this.px, this.pz, yaw, heading, this.blips(), dt, this.car ? Math.max(0.6, 1 - Math.abs(this.car.speed) / 60) : 1.4);
  }
}
