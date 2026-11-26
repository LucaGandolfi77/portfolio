import * as THREE from 'three';
import type { CollisionWorld } from '../data/colliders';
import { nearestOnGraph, pointOnEdge, type RoadGraph } from '../data/roads';
import { CAST, CHAPTERS, MISSIONS, PLACES, type CastId, type Mission, type PlaceId, type Step } from '../game/story';
import type { Season } from '../game/calendar';
import type { WeatherKind } from '../world/weather';
import { Vehicle, type VehicleType } from '../game/vehicle';
import { Autopilot, routeThrough, type Pt } from '../game/autopilot';
import { Marker } from '../world/markers';
import { animateIdle, createBlobShadow, createPerson, type PersonRig } from '../world/person';
import type { Dialogue } from '../ui/dialogue';
import type { Blip } from '../ui/radar';

/*
 * Plays the story missions step by step on top of the open world.
 */

export interface StoryHost {
  scene: THREE.Scene;
  world: CollisionWorld;
  graph: RoadGraph;
  beam: THREE.Texture | null;
  dialogue: Dialogue;
  player(): { x: number; z: number; vehicle: Vehicle | null; speed: number };
  objective(text: string | null, timeLeft?: number | null, extra?: string): void;
  banner(title: string, detail?: string, seconds?: number): void;
  toast(text: string): void;
  chapterCard(title: string, text: string, done: () => void): void;
  money(amount: number): void;
  sound(kind: 'ok' | 'fail' | 'tick'): void;
  setClock(hours: number): void;
  setWeather(kind: WeatherKind | null): void;
  jumpSeason(season: Season): void;
  season(): Season;
  raiseAlert(level: number): void;
  alertLevel(): number;
  addVehicle(v: Vehicle): void;
  removeVehicle(v: Vehicle): void;
  saveProgress(done: string[]): void;
  finale(): void;
}

interface Spot extends Pt {
  name: string;
  heading: number;
}

type Running = {
  mission: Mission;
  index: number;
  state: StepState;
};

interface StepState {
  started: boolean;
  timeLeft: number;
  marker?: Marker;
  extra: Marker[];
  items?: Spot[];
  rival?: { vehicle: Vehicle; pilot: Autopilot };
  checkpoints?: Spot[];
  checkpoint?: number;
  countdown?: number;
  startHealth?: number;
  closeTimer?: number;
  farTimer?: number;
  stopTimer?: number;
}

export class StoryRunner {
  done: string[];
  running: Running | null = null;
  private npcs = new Map<CastId, { rig: PersonRig; shadow: THREE.Mesh; at: Spot }>();
  private giverMarker = new Marker(0x4ab0ff, 2.6);
  private t = 0;

  constructor(private host: StoryHost, done: string[]) {
    this.done = [...done];
    this.giverMarker.group.visible = false;
    host.scene.add(this.giverMarker.group);
  }

  /** A street-side point for a place (on the main network, on the pavement). */
  spot(id: PlaceId): Spot {
    const p = PLACES[id];
    const n = nearestOnGraph(this.host.graph, p.x, p.z, true);
    const dir = pointOnEdge(n.edge, n.d, true);
    return { x: n.x, z: n.z, name: p.name, heading: Math.atan2(dir.dx, dir.dz) };
  }

  private kerb(s: Spot, side = 1): Pt {
    const off = 4.2 * side;
    const p = { x: s.x + Math.cos(s.heading) * off, z: s.z - Math.sin(s.heading) * off };
    const r = this.host.world.resolve(p, 0.4);
    return { x: r.x, z: r.z };
  }

  get next(): Mission | null {
    return MISSIONS.find((m) => !this.done.includes(m.id)) ?? null;
  }

  get finished(): boolean {
    return this.next === null;
  }

  get chapter(): number {
    return this.running ? this.running.mission.chapter : this.next?.chapter ?? CHAPTERS.length - 1;
  }

  /* ---------- characters on the street ---------- */

  private place(who: CastId, at: Spot): void {
    const existing = this.npcs.get(who);
    const pos = this.kerb(at);
    if (existing) {
      existing.at = at;
      existing.rig.group.position.set(pos.x, 0, pos.z);
      existing.shadow.position.set(pos.x, 0.08, pos.z);
      return;
    }
    const rig = createPerson(CAST[who].look);
    const shadow = createBlobShadow(0.9);
    rig.group.position.set(pos.x, 0, pos.z);
    shadow.position.set(pos.x, 0.08, pos.z);
    this.host.scene.add(rig.group, shadow);
    this.npcs.set(who, { rig, shadow, at });
  }

  private clearNpcs(keep?: CastId): void {
    for (const [id, n] of this.npcs) {
      if (id === keep) continue;
      this.host.scene.remove(n.rig.group, n.shadow);
      this.npcs.delete(id);
    }
  }

  /* ---------- loop ---------- */

  update(dt: number): void {
    this.t += dt;
    const p = this.host.player();
    for (const n of this.npcs.values()) {
      animateIdle(n.rig, this.t, 0.8);
      n.rig.group.rotation.y = Math.atan2(p.x - n.rig.group.position.x, p.z - n.rig.group.position.z);
    }
    if (!this.running) {
      const m = this.next;
      if (!m) {
        this.giverMarker.group.visible = false;
        return;
      }
      const at = this.spot(m.at);
      this.place(m.giver, at);
      const k = this.kerb(at);
      this.giverMarker.at(k.x, k.z).update(this.t);
      this.giverMarker.group.visible = true;
      const near = Math.hypot(p.x - k.x, p.z - k.z) < (p.vehicle ? 9 : 4.5);
      if (near && Math.abs(p.speed) < 2 && !this.host.dialogue.open) this.begin(m);
      return;
    }
    this.giverMarker.group.visible = false;
    this.step(dt);
  }

  private begin(m: Mission): void {
    if (this.host.season() !== m.season) this.host.jumpSeason(m.season);
    this.running = { mission: m, index: 0, state: this.fresh() };
    const first = MISSIONS.filter((x) => x.chapter === m.chapter)[0] === m;
    if (first) {
      const c = CHAPTERS[m.chapter];
      this.host.chapterCard(c.title, c.intro, () => this.host.banner(m.title, 'Missione', 2.6));
    } else {
      this.host.banner(m.title, CHAPTERS[m.chapter].title, 2.6);
    }
  }

  private fresh(): StepState {
    return { started: false, timeLeft: 0, extra: [] };
  }

  private cleanupStep(s: StepState): void {
    if (s.marker) this.host.scene.remove(s.marker.group);
    for (const m of s.extra) this.host.scene.remove(m.group);
    if (s.rival) this.host.removeVehicle(s.rival.vehicle);
  }

  private advance(): void {
    const r = this.running!;
    this.cleanupStep(r.state);
    r.index++;
    r.state = this.fresh();
    if (r.index >= r.mission.steps.length) this.complete();
  }

  private complete(): void {
    const m = this.running!.mission;
    this.done.push(m.id);
    this.running = null;
    this.host.objective(null);
    this.host.saveProgress(this.done);
    this.host.sound('ok');
    this.clearNpcs(this.next?.giver);
    if (this.finished) this.host.finale();
    else this.host.banner('Missione compiuta', m.title, 3);
  }

  fail(reason: string): void {
    const r = this.running;
    if (!r) return;
    this.cleanupStep(r.state);
    this.running = null;
    this.host.objective(null);
    this.host.setWeather(null);
    this.host.sound('fail');
    this.host.banner('Missione fallita', `${reason}. Riprova dal segnale blu.`, 3.5);
  }

  private marker(s: StepState, at: Pt, color = 0xffd23f): void {
    if (!s.marker) {
      s.marker = new Marker(color, 3.4);
      this.host.scene.add(s.marker.group);
    }
    s.marker.at(at.x, at.z).update(this.t);
  }

  private spawnCar(type: VehicleType, color: number, at: Spot, ahead = 0): Vehicle {
    const x = at.x + Math.sin(at.heading) * ahead;
    const z = at.z + Math.cos(at.heading) * ahead;
    const v = new Vehicle(type, x, z, at.heading, color, this.host.beam);
    v.driver = 'ai';
    this.host.addVehicle(v);
    return v;
  }

  private step(dt: number): void {
    const r = this.running!;
    const step = r.mission.steps[r.index];
    const s = r.state;
    const p = this.host.player();
    const inCar = !!p.vehicle;
    const fresh = !s.started;
    s.started = true;
    switch (step.kind) {
      case 'talk': {
        const at = this.spot(step.at);
        if (fresh) this.place(step.who === 'dario' ? r.mission.giver : step.who, at);
        /* Dario thinking aloud: nobody to reach, the lines start at once. */
        if (step.who === 'dario') {
          if (fresh) {
            this.host.objective(null);
            this.host.dialogue.play(step.lines, () => this.advance());
          }
          return;
        }
        const k = this.kerb(at);
        const near = Math.hypot(p.x - k.x, p.z - k.z) < (inCar ? 10 : 5);
        if (!near) {
          this.marker(s, k, 0x4ab0ff);
          this.host.objective(`Raggiungi ${CAST[step.who].name} (${at.name})`);
          return;
        }
        if (!this.host.dialogue.open && Math.abs(p.speed) < 2.5) {
          this.host.objective(null);
          if (s.marker) s.marker.group.visible = false;
          this.host.dialogue.play(step.lines, () => this.advance());
        }
        return;
      }
      case 'goto': {
        const at = this.spot(step.at);
        this.marker(s, at);
        if (step.car && !inCar) {
          this.host.objective('Sali in auto');
          return;
        }
        this.host.objective(step.text, null, at.name);
        if (Math.hypot(p.x - at.x, p.z - at.z) < 8 && Math.abs(p.speed) < 7) this.advance();
        return;
      }
      case 'deliver': {
        const at = this.spot(step.to);
        if (fresh) {
          s.timeLeft = step.time;
          s.startHealth = p.vehicle?.health ?? 100;
        }
        this.marker(s, at);
        if (!inCar) {
          this.host.objective('Torna in auto', s.timeLeft);
        } else {
          this.host.objective(step.text, s.timeLeft, at.name);
        }
        s.timeLeft -= dt;
        if (s.timeLeft <= 0) return this.fail('Tempo scaduto');
        if (step.fragile !== undefined && p.vehicle && (s.startHealth ?? 100) - p.vehicle.health > step.fragile) return this.fail('Il carico si è rotto');
        if (inCar && Math.hypot(p.x - at.x, p.z - at.z) < 8 && Math.abs(p.speed) < 5) {
          this.host.money(Math.round(40 + Math.max(0, s.timeLeft) * 2));
          this.advance();
        }
        return;
      }
      case 'collect': {
        if (fresh) {
          s.timeLeft = step.time ?? Infinity;
          s.items = step.items.map((id) => this.spot(id));
          for (const it of s.items) {
            const m = new Marker(0x7bdc8a, 2.2).at(it.x, it.z);
            this.host.scene.add(m.group);
            s.extra.push(m);
          }
        }
        s.timeLeft -= dt;
        if (s.timeLeft <= 0) return this.fail('Tempo scaduto');
        s.items!.forEach((it, i) => {
          const m = s.extra[i];
          if (!m.group.visible) return;
          m.update(this.t);
          if (Math.hypot(p.x - it.x, p.z - it.z) < 7) {
            m.group.visible = false;
            this.host.sound('tick');
            this.host.toast(`${it.name}: preso`);
          }
        });
        const left = s.extra.filter((m) => m.group.visible).length;
        this.host.objective(step.text, Number.isFinite(s.timeLeft) ? s.timeLeft : null, `${step.items.length - left}/${step.items.length}`);
        if (left === 0) this.advance();
        return;
      }
      case 'race': {
        if (!inCar && fresh) {
          s.started = false;
          this.host.objective('Sali in auto per la gara');
          return;
        }
        if (fresh) {
          const stops = step.via.map((id) => this.spot(id));
          s.checkpoints = stops.slice(1);
          s.checkpoint = 0;
          s.countdown = 3;
          const route = routeThrough(this.host.graph, [{ x: p.x, z: p.z }, ...stops]);
          /* On the route itself, a few metres ahead, facing along it. */
          let i0 = 0;
          while (i0 < route.length - 2 && Math.hypot(route[i0].x - p.x, route[i0].z - p.z) < 9) i0++;
          const a0 = route[i0], a1 = route[Math.min(i0 + 1, route.length - 1)];
          const v = this.spawnCar('sportiva', 0xc23b2e, { x: a0.x, z: a0.z, name: '', heading: Math.atan2(a1.x - a0.x, a1.z - a0.z) }, 0);
          v.toughness = 0.2;
          v.sync();
          s.rival = { vehicle: v, pilot: new Autopilot(v, route, 'race', 0.9) };
        }
        if ((s.countdown ?? 0) > 0) {
          const before = Math.ceil(s.countdown!);
          s.countdown! -= dt;
          if (Math.ceil(s.countdown!) !== before && s.countdown! > 0) this.host.sound('tick');
          this.host.objective(`Pronti… ${Math.max(1, Math.ceil(s.countdown!))}`);
          if (p.vehicle) {
            p.vehicle.vx = p.vehicle.vz = 0;
          }
          return;
        }
        s.rival!.pilot.update(dt, this.host.world);
        const cp = s.checkpoints![s.checkpoint!];
        this.marker(s, cp);
        this.host.objective(step.text, null, `${s.checkpoint! + 1}/${s.checkpoints!.length}`);
        if (Math.hypot(p.x - cp.x, p.z - cp.z) < 10) {
          s.checkpoint!++;
          this.host.sound('tick');
          if (s.checkpoint! >= s.checkpoints!.length) return this.advance();
        }
        if (s.rival!.pilot.done) return this.fail(`${CAST[step.rival].name} è arrivato prima`);
        return;
      }
      case 'chase': {
        if (fresh) {
          s.timeLeft = step.time;
          const at = this.spot(step.from);
          const v = this.spawnCar('berlina', 0x1b1d22, at, 18);
          v.toughness = 1.6;
          s.rival = { vehicle: v, pilot: new Autopilot(v, [{ x: v.x + Math.sin(at.heading) * 20, z: v.z + Math.cos(at.heading) * 20 }], 'flee', 0.78, this.host.graph) };
          s.stopTimer = 0;
        }
        const v = s.rival!.vehicle;
        if (!v.wrecked) s.rival!.pilot.update(dt, this.host.world, { x: p.x, z: p.z });
        else {
          v.vx *= 0.96;
          v.vz *= 0.96;
          v.sync();
        }
        s.timeLeft -= dt;
        this.marker(s, { x: v.x, z: v.z }, 0xff3b3b);
        this.host.objective(step.text, s.timeLeft, `danni ${Math.round(100 - v.health)}%`);
        const d = Math.hypot(v.x - p.x, v.z - p.z);
        if (v.wrecked || (v.health < 45 && Math.abs(v.speed) < 1.2 && (s.stopTimer = (s.stopTimer ?? 0) + dt) > 1.5)) {
          if (d < 25) return this.advance();
          this.host.objective('Raggiungi l\'auto ferma');
          return;
        }
        if (s.timeLeft <= 0) return this.fail('È scappato');
        if (d > 260) return this.fail('L\'hai perso di vista');
        return;
      }
      case 'tail': {
        if (fresh) {
          const from = this.spot(step.from);
          const to = this.spot(step.to);
          const type: VehicleType = step.target === 'conte' ? 'berlina' : 'furgone';
          const v = this.spawnCar(type, step.target === 'conte' ? 0x14151a : 0xe8e4da, from, 0);
          v.toughness = 0.3;
          s.rival = { vehicle: v, pilot: new Autopilot(v, routeThrough(this.host.graph, [from, to]), 'cruise', 11) };
          s.closeTimer = 0;
          s.farTimer = 0;
        }
        const v = s.rival!.vehicle;
        const d = Math.hypot(v.x - p.x, v.z - p.z);
        /* Wait for the player to get going before the target leaves. */
        if (d < 140 || s.rival!.pilot.index > 0) s.rival!.pilot.update(dt, this.host.world);
        this.marker(s, { x: v.x, z: v.z }, 0xffd23f);
        let hint = 'distanza giusta';
        if (d < 14) {
          s.closeTimer! += dt;
          hint = 'troppo vicino!';
        } else s.closeTimer = Math.max(0, s.closeTimer! - dt);
        if (d > 95) {
          s.farTimer! += dt;
          hint = 'lo stai perdendo';
        } else s.farTimer = 0;
        this.host.objective(step.text, null, `${Math.round(d)} m · ${hint}`);
        if (s.closeTimer! > 3) return this.fail('Ti ha visto');
        if (s.farTimer! > 7) return this.fail('L\'hai perso');
        if (s.rival!.pilot.done && Math.abs(v.speed) < 1) return this.advance();
        return;
      }
      case 'escape': {
        if (fresh) {
          s.timeLeft = step.time;
          this.host.raiseAlert(step.level);
        }
        s.timeLeft -= dt;
        this.host.objective(step.text, s.timeLeft);
        if (this.host.alertLevel() === 0) return this.advance();
        if (s.timeLeft <= 0) return this.fail('Non sei riuscito a seminarli');
        return;
      }
      case 'money': {
        this.host.money(step.amount);
        this.host.toast(`${step.text}: +€ ${step.amount}`);
        return this.advance();
      }
      case 'season': {
        if (fresh) {
          this.host.objective(null);
          const next = CHAPTERS.find((c) => c.season === step.to);
          this.host.jumpSeason(step.to);
          this.host.chapterCard(next ? next.title.split(' — ')[0] : 'Tempo dopo', step.card, () => this.advance());
          s.timeLeft = Infinity;
        }
        return;
      }
      case 'weather': {
        this.host.setWeather(step.set);
        return this.advance();
      }
      case 'clock': {
        this.host.setClock(step.hours);
        return this.advance();
      }
    }
    void (step as Step);
  }

  blips(): Blip[] {
    const out: Blip[] = [];
    if (!this.running) {
      const m = this.next;
      if (m) {
        const k = this.kerb(this.spot(m.at));
        out.push({ x: k.x, z: k.z, kind: 'home', label: 'S' });
      }
      return out;
    }
    const s = this.running.state;
    if (s.marker && s.marker.group.visible) out.push({ x: s.marker.group.position.x, z: s.marker.group.position.z, kind: 'target' });
    s.extra.forEach((m) => m.group.visible && out.push({ x: m.group.position.x, z: m.group.position.z, kind: 'offer', label: '•' }));
    return out;
  }

  /** The story car the player must not lose sight of, if any (for the minimap colour). */
  vehicles(): Vehicle[] {
    const s = this.running?.state;
    return s?.rival ? [s.rival.vehicle] : [];
  }

  abandon(): void {
    if (this.running) this.fail('Missione abbandonata');
  }

  /** Text for the phone. */
  summary(): Array<{ title: string; chapter: string; state: 'fatta' | 'attuale' | 'futura' }> {
    const next = this.running?.mission ?? this.next;
    return MISSIONS.map((m) => ({
      title: m.title,
      chapter: CHAPTERS[m.chapter].title,
      state: this.done.includes(m.id) ? 'fatta' : m === next ? 'attuale' : 'futura'
    }));
  }
}
