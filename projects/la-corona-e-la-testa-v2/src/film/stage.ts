/*
 * The director of the 3D film. For any moment of film time it picks the shot,
 * places and poses the actors, frames the speaker like a camera operator would
 * (shot / reverse shot, over the shoulder, close-ups), renders the set with
 * light, shadows and bloom, then lays transitions, titles and captions on top.
 * Everything is a pure function of time, so seeking is frame-exact.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { CAST } from './three/cast';
import { Figure, type FigureState, type Mood, type PoseName } from './three/figure';
import { Horse } from './three/horse';
import { getSet, type SetInstance } from './three/sets';
import { particles } from './three/fx';
import { FILM, SPEAKERS } from './script';
import { SHOT_VIEWS } from './shots';
import type { Actor, CamKey, Frame, Key, Moment, ShotView, Transition, V3 } from './shots/types';
import { triggerTime } from './keys';
import { CHAPTERS, DURATION, SHOTS, TITLE_TIME, activeCue, shotIndexAt, type Chapter, type Cue, type Lang, type Shot } from './timeline';
import { clamp, ease, lerp, turn } from './util';

export { triggerTime };

export interface RenderOptions {
  lang: Lang;
  captions: boolean;
  reducedMotion: boolean;
  /** CSS pixels at the bottom covered by the player controls. */
  inset?: number;
}

/** Seconds a transition between two shots lasts. */
export const TRANSITION = 1.25;
const SERIF = "'Cormorant Garamond Variable', 'Cormorant Garamond', Georgia, serif";
const SANS = "'Inter Variable', Inter, system-ui, sans-serif";
const DEG = Math.PI / 180;

/* ---------------- Actors ---------------- */

export interface Resolved {
  x: number;
  z: number;
  y: number;
  rot: number;
  pose: PoseName;
  from: PoseName;
  blend: number;
  item: Actor['item'] | null;
  alpha: number;
  look: V3 | null;
  glow: number;
  mood: Mood;
}

const keyCache = new WeakMap<Actor, Array<Key & { at_: number }>>();

/** Where an actor is and what it does at shot time t (pure). */
export function resolveActor(a: Actor, shot: Shot, t: number): Resolved {
  let keys = keyCache.get(a);
  if (!keys) {
    keys = (a.keys ?? []).map((k) => ({ ...k, at_: triggerTime(shot, k.l, k.d) })).sort((p, q) => p.at_ - q.at_);
    keyCache.set(a, keys);
  }
  const pose = a.pose ?? 'stand';
  const r: Resolved = {
    x: a.at[0], z: a.at[1], y: a.y ?? 0, rot: (a.rot ?? 0) * DEG, pose, from: pose, blend: 1, item: a.item ?? null,
    alpha: a.alpha ?? 1, look: a.look ?? null, glow: a.glow ?? 0, mood: a.mood ?? 'calm',
  };
  for (const k of keys) {
    if (t < k.at_) break;
    const since = t - k.at_;
    const dur = Math.max(0.05, k.move ?? 1.4);
    const e = ease(since / dur);
    if (k.at) {
      const dx = k.at[0] - r.x;
      const dz = k.at[1] - r.z;
      const dist = Math.hypot(dx, dz);
      /* Walk at an even pace (eased only at the ends), facing the way. */
      const lin = clamp(since / dur);
      const pace = dist > 1.5 ? clamp(lin * 1.0) : e;
      const soft = dist > 1.5 ? pace * pace * (3 - 2 * pace) * 0.25 + pace * 0.75 : e;
      if (dist > 0.05 && since < dur) r.rot = turn(r.rot, Math.atan2(dx, dz), clamp(since / 0.35));
      else if (dist > 0.05 && k.rot === undefined) r.rot = Math.atan2(dx, dz);
      r.x += dx * soft;
      r.z += dz * soft;
    }
    if (k.rot !== undefined) {
      const target = k.rot * DEG;
      const start = k.at ? Math.max(0, dur - 0.5) : 0;
      r.rot = turn(r.rot, target, clamp((since - start) / 0.6));
    }
    if (k.y !== undefined) r.y = lerp(r.y, k.y, e);
    if (k.alpha !== undefined) r.alpha = lerp(r.alpha, k.alpha, e);
    if (k.glow !== undefined) r.glow = lerp(r.glow, k.glow, e);
    if (k.item !== undefined) r.item = k.item;
    if (k.look !== undefined) r.look = k.look;
    if (k.mood !== undefined) r.mood = k.mood;
    if (k.pose !== undefined && k.pose !== r.pose) {
      r.from = r.pose;
      r.pose = k.pose;
      r.blend = clamp(since / Math.min(1.2, Math.max(0.3, k.move ?? 0.7)));
    }
  }
  return r;
}

interface Rig {
  def: Actor;
  fig: Figure;
  horse?: Horse;
  group: THREE.Group;
  seed: number;
}

/* ---------------- Camera ---------------- */

interface Cam {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
}

/** The authored camera path at shot time t. */
export function cameraPath(view: ShotView, shot: Shot, t: number, actorAt?: (i: number) => THREE.Vector3): Cam {
  const keys = view.cam.map((k) => ({ ...k, at: triggerTime(shot, k.l, k.d) })).sort((p, q) => p.at - q.at);
  const place = (k: CamKey): Cam => {
    const base = k.rel !== undefined && actorAt ? actorAt(k.rel) : new THREE.Vector3();
    return { pos: new THREE.Vector3(...k.pos).add(base), look: new THREE.Vector3(...k.look).add(base), fov: k.fov ?? 38 };
  };
  let cur = place(keys[0]);
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (t < k.at) break;
    const next = place(k);
    const m = k.move ?? 3;
    const e = m <= 0 ? 1 : ease((t - k.at) / m);
    cur = { pos: cur.pos.lerp(next.pos, e), look: cur.look.lerp(next.look, e), fov: lerp(cur.fov, next.fov, e) };
  }
  return cur;
}

/* ---------------- The renderer ---------------- */

export class FilmRenderer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private buffer: HTMLCanvasElement;
  private bctx: CanvasRenderingContext2D;
  private vignette: HTMLCanvasElement;
  private grain: HTMLCanvasElement;
  private gl: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private renderPass: RenderPass;
  private bloom: UnrealBloomPass;
  private camera = new THREE.PerspectiveCamera(38, 1, 0.05, 1200);
  private rigs = new Map<string, Rig[]>();
  private attached = new Map<THREE.Scene, THREE.Group | null>();
  private dpr = 1;
  private cssW = 360;
  private cssH = 640;
  private quality = 1;
  private prepared = new Set<number>();
  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D is not available');
    this.ctx = ctx;
    this.buffer = document.createElement('canvas');
    this.bctx = this.buffer.getContext('2d', { alpha: false })!;
    this.vignette = document.createElement('canvas');
    this.grain = makeGrain();
    this.gl = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    this.gl.shadowMap.enabled = true;
    this.gl.shadowMap.type = THREE.PCFSoftShadowMap;
    this.gl.toneMapping = THREE.ACESFilmicToneMapping;
    this.gl.outputColorSpace = THREE.SRGBColorSpace;
    this.composer = new EffectComposer(this.gl);
    this.renderPass = new RenderPass(new THREE.Scene(), this.camera);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.55, 0.82);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.resize();
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.cssW = Math.max(1, rect.width);
    this.cssH = Math.max(1, rect.height);
    const raw = window.devicePixelRatio || 1;
    const budget = Math.sqrt(2_300_000 / (this.cssW * this.cssH));
    this.dpr = Math.max(0.7, Math.min(2, raw, budget));
    const w = Math.round(this.cssW * this.dpr);
    const h = Math.round(this.cssH * this.dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = this.buffer.width = w;
      this.canvas.height = this.buffer.height = h;
      this.paintVignette(w, h);
    }
    /* The 3D picture is rendered at a lower resolution when the device struggles. */
    const k = clamp(this.quality, 0.4, 1);
    const gw = Math.max(2, Math.round(w * k));
    const gh = Math.max(2, Math.round(h * k));
    if (this.gl.domElement.width !== gw || this.gl.domElement.height !== gh) {
      this.gl.setPixelRatio(1);
      this.gl.setSize(gw, gh, false);
      this.composer.setPixelRatio(1);
      this.composer.setSize(gw, gh);
      this.bloom.resolution.set(gw / 2, gh / 2);
    }
    this.gl.shadowMap.type = k < 0.6 ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
  }

  /** 1 = full resolution; lower when the device cannot keep up. */
  setQuality(q: number): void {
    const next = clamp(q, 0.4, 1);
    if (Math.abs(next - this.quality) < 0.01) return;
    this.quality = next;
    this.resize();
  }

  private paintVignette(w: number, h: number): void {
    this.vignette.width = w;
    this.vignette.height = h;
    const g = this.vignette.getContext('2d')!;
    const r = Math.hypot(w, h) / 2;
    const grad = g.createRadialGradient(w / 2, h * 0.46, r * 0.45, w / 2, h / 2, r * 1.05);
    grad.addColorStop(0, 'rgba(3,2,6,0)');
    grad.addColorStop(0.62, 'rgba(3,2,6,0.14)');
    grad.addColorStop(1, 'rgba(3,2,6,0.6)');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }

  private rigsFor(shot: Shot, view: ShotView, set: SetInstance): THREE.Group {
    let rigs = this.rigs.get(shot.id);
    if (!rigs) {
      rigs = (view.actors ?? []).map((def, i) => {
        const fig = new Figure(CAST[def.who], { stone: def.stone, headless: def.headless });
        const group = new THREE.Group();
        let horse: Horse | undefined;
        if (def.horse) {
          horse = new Horse(def.horse);
          group.add(horse.root);
          fig.root.position.y = Horse.SADDLE - 0.5;
          fig.root.position.z = -0.1;
        }
        group.add(fig.root);
        if (def.s) group.scale.setScalar(def.s);
        return { def, fig, horse, group, seed: i * 17 + shot.id.length * 3 };
      });
      this.rigs.set(shot.id, rigs);
      const all = new THREE.Group();
      all.name = shot.id;
      rigs.forEach((r) => all.add(r.group));
      (rigs as unknown as { all: THREE.Group }).all = all;
    }
    return (rigs as unknown as { all: THREE.Group }).all;
  }

  private attach(set: SetInstance, group: THREE.Group, fx: ShotView['fx']): void {
    const prev = this.attached.get(set.scene);
    if (prev !== group) {
      if (prev) set.scene.remove(prev);
      set.scene.add(group);
      this.attached.set(set.scene, group);
    }
    for (const kind of ['rain', 'dust', 'embers', 'mist', 'fireflies', 'snow', 'grace'] as const) {
      const p = particles(kind);
      const want = !!fx?.[kind];
      if (want && p.object.parent !== set.scene) set.scene.add(p.object);
      if (!want && p.object.parent === set.scene) set.scene.remove(p.object);
    }
  }

  /** Poses every actor of the shot for shot time t. */
  private pose(shot: Shot, view: ShotView, rigs: Rig[], t: number, time: number): void {
    const cue = activeCue(time);
    const now = shot.start + t;
    /* Who is speaking now and who spoke before: heads turn towards them. */
    let ci = -1;
    while (ci + 1 < shot.cues.length && shot.cues[ci + 1].start - 0.25 <= now) ci++;
    const speakerOf = (i: number): Rig | undefined => (i >= 0 ? rigs.find((r) => r.def.voice === shot.cues[i].who) : undefined);
    const headOf = (r: Rig | undefined): THREE.Vector3 | null => {
      if (!r) return null;
      const st = resolveActor(r.def, shot, t);
      return new THREE.Vector3(st.x, st.y + (r.def.horse ? 2.25 : st.pose === 'kneel' || st.pose === 'sit' || st.pose === 'beg' || st.pose === 'grieve' ? 1.15 : 1.62) * (CAST[r.def.who].size ?? 1) * (r.def.s ?? 1), st.z);
    };
    const curSpeaker = speakerOf(ci);
    const prevSpeaker = speakerOf(ci - 1);
    const turnK = ci >= 0 ? ease((now - shot.cues[ci].start + 0.25) / 0.7) : 1;

    for (const rig of rigs) {
      const a = rig.def;
      const st = resolveActor(a, shot, t);
      const before = resolveActor(a, shot, Math.max(0, t - 0.1));
      const speed = t > 0.1 ? Math.hypot(st.x - before.x, st.z - before.z) / 0.1 : 0;
      const marching = a.march ?? 0;
      const walk = clamp(Math.max(speed / 1.25, marching));
      const phase = time * (4.2 + Math.max(speed, marching * 1.3) * 2.2) + rig.seed;
      rig.group.position.set(st.x, st.y, st.z);
      rig.group.rotation.y = st.rot;
      rig.group.visible = st.alpha > 0.5;
      /* Eyes on whoever speaks, or on the point the shot asks for. */
      let yaw = 0;
      let pitch = 0;
      const self = new THREE.Vector3(st.x, st.y + 1.6, st.z);
      const aim = (target: THREE.Vector3 | null): [number, number] => {
        if (!target) return [0, 0];
        const dx = target.x - self.x;
        const dz = target.z - self.z;
        const ang = Math.atan2(dx, dz) - st.rot;
        const wrapped = Math.atan2(Math.sin(ang), Math.cos(ang));
        const dist = Math.hypot(dx, dz);
        return [clamp(wrapped, -1.1, 1.1), clamp(-Math.atan2(target.y - self.y, Math.max(0.3, dist)) * 0.8, -0.5, 0.5)];
      };
      const lookPoint = st.look ? new THREE.Vector3(...st.look) : null;
      /* Whoever speaks looks at the one they speak to. */
      const partner = (i: number): Rig | undefined => {
        if (i < 0) return undefined;
        for (let d = 1; d < shot.cues.length; d++)
          for (const j of [i - d, i + d]) {
            const c = shot.cues[j];
            if (!c || c.who === 'n' || c.who === shot.cues[i].who) continue;
            const r = rigs.find((x) => x.def.voice === c.who);
            if (r && r !== rig) return r;
          }
        return undefined;
      };
      const target = (sp: Rig | undefined, i: number): THREE.Vector3 | null => {
        if (lookPoint) return lookPoint;
        if (!sp) return null;
        if (sp !== rig) return headOf(sp);
        return headOf(partner(i));
      };
      const curT = target(curSpeaker, ci);
      const prevT = target(prevSpeaker, ci - 1);
      const [y1, p1] = aim(curT);
      const [y0, p0] = aim(prevT);
      yaw = lerp(y0, y1, turnK);
      pitch = lerp(p0, p1, turnK);
      const speaking = !!a.voice && cue?.who === a.voice && time < cue.end - 0.35;
      const pose = a.horse ? 'ride' : st.pose;
      const state: FigureState = {
        pose, from: a.horse ? 'ride' : st.from, blend: st.blend, walk: a.horse ? 0 : walk, phase, speaking, time, mood: st.mood,
        lookYaw: yaw, lookPitch: pitch, item: st.item ?? null, glow: st.glow, seed: rig.seed,
      };
      rig.fig.apply(state);
      rig.horse?.apply(time, walk, phase * 0.8);
    }
  }

  /** The camera for this moment: the path, or a framing of whoever speaks. */
  private frame(shot: Shot, view: ShotView, rigs: Rig[], t: number, time: number, reduced: boolean): Cam {
    const actorAt = (i: number): THREE.Vector3 => {
      const r = rigs[i];
      return r ? r.group.position.clone() : new THREE.Vector3();
    };
    const path = cameraPath(view, shot, t, actorAt);
    const now = shot.start + t;
    let ci = -1;
    while (ci + 1 < shot.cues.length && shot.cues[ci + 1].start - 0.2 <= now) ci++;
    let cam = path;
    if (ci >= 0 && view.cover !== false) {
      const cue = shot.cues[ci];
      const speaker = rigs.find((r) => r.def.voice === cue.who && r.group.visible);
      let kind: Frame | undefined = view.frames?.[ci];
      if (!kind) {
        if (!speaker) kind = 'path';
        else {
          /* Count dialogue lines so far to vary the framing. */
          let j = 0;
          for (let i = 0; i < ci; i++) if (shot.cues[i].who !== 'n') j++;
          kind = j === 0 ? 'two' : j % 3 === 2 ? 'close' : 'ots';
        }
      }
      if (kind !== 'path' && speaker) {
        /* The listener: who spoke before or after, else the nearest other figure. */
        let listener: Rig | undefined;
        for (let d = 1; d < shot.cues.length && !listener; d++)
          for (const i of [ci - d, ci + d]) {
            const c = shot.cues[i];
            if (!c || c.who === cue.who || c.who === 'n') continue;
            listener = rigs.find((r) => r.def.voice === c.who && r.group.visible);
            if (listener) break;
          }
        if (!listener) {
          let best = Infinity;
          for (const r of rigs) {
            if (r === speaker || !r.group.visible) continue;
            const d = r.group.position.distanceTo(speaker.group.position);
            if (d < best && d < 7) {
              best = d;
              listener = r;
            }
          }
        }
        const local = clamp((now - cue.start + 0.2) / Math.max(1, cue.end - cue.start));
        cam = coverage(kind, speaker, listener, path, local, this.tmp, this.tmp2);
      }
    }
    if (!reduced) {
      /* A breathing, hand-held camera. */
      cam.pos.x += Math.sin(time * 0.37) * 0.025;
      cam.pos.y += Math.sin(time * 0.29 + 1) * 0.02;
      cam.look.x += Math.sin(time * 0.23 + 2) * 0.02;
    }
    return cam;
  }

  private drawShot(target: CanvasRenderingContext2D, index: number, t: number, time: number, reduced: boolean): void {
    const shot = SHOTS[index];
    const view = SHOT_VIEWS[shot.id];
    const set = getSet(view.set, view.opt);
    const group = this.rigsFor(shot, view, set);
    const rigs = this.rigs.get(shot.id)!;
    this.attach(set, group, view.fx);
    set.update(time);
    this.pose(shot, view, rigs, t, time);
    const dur = shot.end - shot.start;
    if (view.animate) {
      const m: Moment = {
        t,
        time,
        dur,
        on: (i, over = 2, delay = 0) => ease((t - triggerTime(shot, i) - delay) / over),
        since: (i) => t - triggerTime(shot, i),
      };
      view.animate(m, set.props);
    }
    const cam = this.frame(shot, view, rigs, t, time, reduced);
    const w = this.gl.domElement.width;
    const h = this.gl.domElement.height;
    const aspect = w / h;
    /* Lenses are designed for 16:9; tall screens keep most of the width. */
    const designed = 16 / 9;
    let fov = cam.fov;
    if (aspect < designed) {
      const hfov = 2 * Math.atan(Math.tan((fov * DEG) / 2) * designed);
      const needed = (2 * Math.atan(Math.tan(hfov / 2) / aspect)) / DEG;
      fov = lerp(fov, needed, aspect < 1 ? 0.62 : 0.8);
    }
    this.camera.fov = Math.min(fov, 95);
    this.camera.aspect = aspect;
    this.camera.position.copy(cam.pos);
    this.camera.lookAt(cam.look);
    this.camera.updateProjectionMatrix();
    for (const kind of ['rain', 'dust', 'embers', 'mist', 'fireflies', 'snow', 'grace'] as const) {
      const amount = view.fx?.[kind];
      if (amount) particles(kind).update(time, this.camera, amount, h, kind === 'grace' || kind === 'embers' ? cam.look : undefined);
    }
    const fill = set.props.fill as THREE.PointLight | undefined;
    if (fill) {
      const right = new THREE.Vector3().subVectors(cam.look, cam.pos).cross(new THREE.Vector3(0, 1, 0)).normalize();
      fill.position.copy(cam.pos).addScaledVector(right, 0.6).add(new THREE.Vector3(0, 0.5, 0));
      fill.intensity = set.scene.background ? 2.2 : 0.8;
    }
    this.gl.toneMappingExposure = set.exposure * (view.exposure ?? 1);
    this.bloom.strength = set.bloom * (this.quality < 0.55 ? 0.6 : 1);
    this.renderPass.scene = set.scene;
    this.composer.render();
    target.save();
    target.setTransform(1, 0, 0, 1, 0, 0);
    target.drawImage(this.gl.domElement, 0, 0, this.canvas.width, this.canvas.height);
    target.restore();
  }

  /** Builds and compiles the next shot ahead of time, so the cut does not stutter. */
  private prepare(index: number): void {
    if (index >= SHOTS.length || this.prepared.has(index)) return;
    this.prepared.add(index);
    const shot = SHOTS[index];
    const view = SHOT_VIEWS[shot.id];
    const set = getSet(view.set, view.opt);
    this.rigsFor(shot, view, set);
    const compile = (this.gl as unknown as { compileAsync?: (s: THREE.Object3D, c: THREE.Camera) => Promise<unknown> }).compileAsync;
    if (compile) compile.call(this.gl, set.scene, this.camera).catch(() => undefined);
  }

  private composite(kind: Transition, q: number): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const k = ease(q);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (kind === 'black') {
      if (q > 0.5) ctx.drawImage(this.buffer, 0, 0);
      ctx.fillStyle = `rgba(4,2,6,${1 - Math.abs(q - 0.5) * 2})`;
      ctx.fillRect(0, 0, w, h);
    } else if (kind === 'iris') {
      ctx.save();
      ctx.beginPath();
      const r = k * Math.hypot(w, h) * 0.58;
      ctx.arc(w / 2, h / 2, Math.max(1, r), 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(this.buffer, 0, 0);
      ctx.restore();
    } else if (kind === 'wipe') {
      const x = k * (w + 200) - 100;
      const grad = ctx.createLinearGradient(x - 100, 0, x + 100, 0);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      this.bctx.save();
      this.bctx.globalCompositeOperation = 'destination-in';
      this.bctx.fillStyle = grad;
      this.bctx.fillRect(0, 0, w, h);
      this.bctx.restore();
      ctx.drawImage(this.buffer, 0, 0);
    } else {
      ctx.globalAlpha = k;
      ctx.drawImage(this.buffer, 0, 0);
      ctx.globalAlpha = 1;
      if (kind === 'light') {
        const g = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, Math.max(w, h) * 0.8);
        g.addColorStop(0, `rgba(255,236,200,${Math.sin(q * Math.PI) * 0.85})`);
        g.addColorStop(1, 'rgba(255,236,200,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    }
    ctx.restore();
  }

  render(time: number, options: RenderOptions): void {
    const ctx = this.ctx;
    const t = clamp(time, 0, DURATION - 0.001);
    const index = shotIndexAt(t);
    const shot = SHOTS[index];
    const local = t - shot.start;
    const view = SHOT_VIEWS[shot.id];
    const trans = view.trans ?? 'fade';
    if (index > 0 && local < TRANSITION && trans !== 'cut') {
      const prev = SHOTS[index - 1];
      this.drawShot(ctx, index - 1, prev.end - prev.start - 0.001, prev.end - 0.001, options.reducedMotion);
      this.drawShot(this.bctx, index, local, t, options.reducedMotion);
      this.composite(options.reducedMotion ? 'fade' : trans, local / TRANSITION);
    } else this.drawShot(ctx, index, local, t, options.reducedMotion);
    if (local > 2) this.prepare(index + 1);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.vignette, 0, 0);
    this.paintGrain(options.reducedMotion ? 0 : t);
    const chapter = CHAPTERS[shot.chapter];
    if (shot.id === chapter.shots[0].id) this.titleCard(chapter, t - chapter.start, options.lang);
    const cue = activeCue(t);
    if (cue && options.captions) this.caption(cue, t, options.lang, options.inset ?? 0);
    if (t < 1.4) {
      ctx.fillStyle = `rgba(4,2,6,${1 - t / 1.4})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    ctx.restore();
  }

  private paintGrain(t: number): void {
    const ctx = this.ctx;
    const pattern = ctx.createPattern(this.grain, 'repeat');
    if (!pattern) return;
    const step = Math.floor(t * 12);
    const dx = (step * 83) % 256;
    const dy = (step * 149) % 256;
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.globalCompositeOperation = 'overlay';
    ctx.translate(-dx, -dy);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, this.canvas.width + 256, this.canvas.height + 256);
    ctx.restore();
  }

  private type(): number {
    const wide = this.cssW > this.cssH;
    return clamp(Math.min(this.cssW, this.cssH) * (wide ? 0.04 : 0.047), wide ? 14 : 16, 29) * this.dpr;
  }

  private titleCard(chapter: Chapter, local: number, lang: Lang): void {
    const a = clamp((local - 0.5) / 0.9) * clamp((TITLE_TIME - 0.1 - local) / 0.8);
    if (a <= 0) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const f = this.type();
    const cy = h * 0.36;
    const first = chapter.ordinal === 0;
    ctx.save();
    ctx.globalAlpha = a;
    const band = ctx.createRadialGradient(w / 2, cy, 0, w / 2, cy, Math.min(w * 0.75, f * 22));
    band.addColorStop(0, 'rgba(5,3,9,0.85)');
    band.addColorStop(1, 'rgba(5,3,9,0)');
    ctx.fillStyle = band;
    ctx.fillRect(0, cy - f * 10, w, f * 20);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = f * 0.6;
    ctx.fillStyle = chapter.accent;
    ctx.font = `600 ${f * 0.72}px ${SANS}`;
    spaced(ctx, first ? FILM.credit[lang] : chapter.roman, w / 2, cy - f * 3.1, f * 0.28, w * 0.9);
    ctx.fillStyle = '#fbf1da';
    const title = first ? FILM.title : chapter.titleFr;
    const big = Math.min(f * (first ? 3.1 : 2.5), ((w * 0.86) / Math.max(7, title.length)) * 2.1);
    ctx.font = `italic 500 ${big}px ${SERIF}`;
    ctx.fillText(title, w / 2, cy - f * 0.9);
    const reach = Math.min(w * 0.32, f * 7) * ease((local - 0.7) / 2);
    ctx.strokeStyle = chapter.accent;
    ctx.lineWidth = Math.max(1, f * 0.07);
    ctx.beginPath();
    ctx.moveTo(w / 2 - reach, cy + f * 0.9);
    ctx.lineTo(w / 2 + reach, cy + f * 0.9);
    ctx.stroke();
    ctx.fillStyle = chapter.accent;
    ctx.fillRect(w / 2 - f * 0.13, cy + f * 0.77, f * 0.26, f * 0.26);
    ctx.fillStyle = '#e8dcc0';
    ctx.font = `500 ${f * 0.82}px ${SANS}`;
    spaced(ctx, chapter.title[lang].toUpperCase(), w / 2, cy + f * 2.3, f * 0.2, w * 0.9);
    ctx.restore();
  }

  private caption(cue: Cue, t: number, lang: Lang, inset: number): void {
    const a = clamp((t - cue.start) / 0.35) * clamp((cue.end - t) / 0.3);
    if (a <= 0) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const f = this.type();
    const portrait = h > w;
    const bottom = h - Math.max(portrait ? h * 0.115 : h * 0.065, inset * this.dpr);
    const max = Math.min(w * 0.88, f * (portrait ? 29 : 36));
    const rise = (1 - ease((t - cue.start) / 0.6)) * f * 0.4;
    const speaker = SPEAKERS[cue.who];
    const quoted = !!cue.french;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = quoted ? `italic 600 ${f * 1.22}px ${SERIF}` : `600 ${f * 1.04}px ${SERIF}`;
    const main = wrap(ctx, cue.french ?? cue.text[lang], max);
    const mainH = f * (quoted ? 1.5 : 1.32);
    ctx.font = `500 ${f * 0.84}px ${SANS}`;
    const sub = quoted ? wrap(ctx, cue.text[lang], max) : [];
    const subH = f * 1.18;
    const name = speaker[lang];
    const total = main.length * mainH + sub.length * subH + (sub.length ? f * 0.45 : 0) + (name ? f * 1.25 : 0);
    const top = bottom - total + rise;
    const band = ctx.createLinearGradient(0, top - f * 3.2, 0, h);
    band.addColorStop(0, 'rgba(4,2,8,0)');
    band.addColorStop(0.32, `rgba(4,2,8,${portrait ? 0.62 : 0.46})`);
    band.addColorStop(1, `rgba(4,2,8,${portrait ? 0.82 : 0.74})`);
    ctx.fillStyle = band;
    ctx.fillRect(0, top - f * 3.2, w, h - top + f * 3.2);
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = f * 0.35;
    ctx.shadowOffsetY = f * 0.07;
    let y = top;
    if (name) {
      ctx.fillStyle = speaker.color;
      ctx.font = `700 ${f * 0.66}px ${SANS}`;
      spaced(ctx, name.toUpperCase(), w / 2, y + f * 0.75, f * 0.16, w * 0.9);
      y += f * 1.25;
    }
    ctx.font = quoted ? `italic 600 ${f * 1.22}px ${SERIF}` : `600 ${f * 1.04}px ${SERIF}`;
    ctx.fillStyle = quoted ? '#ffe8b8' : cue.who === 'n' ? '#f2e8d2' : '#ffffff';
    for (const l of main) {
      ctx.fillText(l, w / 2, y + mainH * 0.78);
      y += mainH;
    }
    if (sub.length) {
      y += f * 0.45;
      ctx.font = `500 ${f * 0.84}px ${SANS}`;
      ctx.fillStyle = '#e4d8c4';
      for (const l of sub) {
        ctx.fillText(l, w / 2, y + subH * 0.76);
        y += subH;
      }
    }
    ctx.restore();
  }

  /** The still behind the title screen: a living picture from the film. */
  renderPoster(now = 0): void {
    const shot = SHOTS.findIndex((s) => s.id === 'co-throne');
    const len = SHOTS[shot].end - SHOTS[shot].start;
    const local = 2.5 + ((now / 1000) % Math.max(4, Math.min(6, len - 4)));
    this.drawShot(this.ctx, shot, local, SHOTS[shot].start + local, true);
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.drawImage(this.vignette, 0, 0);
    this.ctx.restore();
  }

  toBlob(): Promise<Blob | null> {
    return new Promise((resolve) => this.canvas.toBlob((blob) => resolve(blob), 'image/png'));
  }
}

/** Camera placements worked out from where two people stand. */
function coverage(kind: Frame, speaker: Rig, listener: Rig | undefined, path: Cam, local: number, a: THREE.Vector3, b: THREE.Vector3): Cam {
  const S = speaker.fig.headWorld(a.clone());
  S.y -= 0.02;
  const fwd = new THREE.Vector3(Math.sin(speaker.group.rotation.y), 0, Math.cos(speaker.group.rotation.y));
  const L = listener ? listener.fig.headWorld(b.clone()) : S.clone().add(fwd.clone().multiplyScalar(2));
  const axis = L.clone().sub(S).setY(0);
  if (axis.lengthSq() < 0.01) axis.copy(fwd);
  axis.normalize();
  const n = new THREE.Vector3(axis.z, 0, -axis.x);
  const mid = S.clone().add(L).multiplyScalar(0.5);
  /* Stay on the side of the line the path camera is on (the 180° rule). */
  const side = Math.sign(n.dot(path.pos.clone().sub(mid))) || 1;
  n.multiplyScalar(side);
  const up = new THREE.Vector3(0, 1, 0);
  const push = 1 - local * 0.07;
  let pos: THREE.Vector3;
  let look: THREE.Vector3;
  let fov: number;
  switch (kind) {
    case 'ots': {
      const sep = Math.max(1, S.distanceTo(L));
      pos = L.clone().add(axis.clone().multiplyScalar(1.35)).add(n.clone().multiplyScalar(0.95)).add(up.clone().multiplyScalar(0.06));
      look = S.clone().add(n.clone().multiplyScalar(0.05 * sep)).add(up.clone().multiplyScalar(-0.08));
      fov = 30;
      break;
    }
    case 'two': {
      const sep = S.distanceTo(L);
      const dist = Math.max(2.4, sep * 1.25 + 1.3);
      pos = mid.clone().add(n.clone().multiplyScalar(dist)).add(up.clone().multiplyScalar(0.2));
      look = mid.clone().add(up.clone().multiplyScalar(-0.15));
      fov = 34;
      break;
    }
    case 'low': {
      const d = speaker.fig.faceForward(new THREE.Vector3()).multiplyScalar(0.8).add(n.clone().multiplyScalar(0.5)).normalize();
      pos = S.clone().add(d.multiplyScalar(2.0)).add(up.clone().multiplyScalar(-0.45));
      look = S.clone().add(up.clone().multiplyScalar(0.05));
      fov = 30;
      break;
    }
    case 'high': {
      const d = speaker.fig.faceForward(new THREE.Vector3()).multiplyScalar(0.7).add(n.clone().multiplyScalar(0.6)).normalize();
      pos = S.clone().add(d.multiplyScalar(2.2)).add(up.clone().multiplyScalar(1.3));
      look = S.clone().add(up.clone().multiplyScalar(-0.2));
      fov = 32;
      break;
    }
    default: {
      /* In front of the face, a little to the side of the line. */
      const facing = speaker.fig.faceForward(new THREE.Vector3());
      const d = facing.multiplyScalar(0.85).add(n.clone().multiplyScalar(0.45)).normalize();
      pos = S.clone().add(d.multiplyScalar(1.55)).add(up.clone().multiplyScalar(0.03));
      look = S.clone().add(up.clone().multiplyScalar(-0.04));
      fov = 26;
    }
  }
  pos = look.clone().add(pos.sub(look).multiplyScalar(push));
  return { pos, look, fov };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  const full = ctx.measureText(text).width;
  const target = full > max ? Math.min(max, (full / Math.ceil(full / max)) * 1.08) : max;
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > target) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, gap: number, max = Infinity): void {
  const widths = [...text].map((c) => ctx.measureText(c).width);
  const natural = widths.reduce((s, v) => s + v, 0);
  let space = gap;
  if (natural + gap * (text.length - 1) > max) space = Math.max(0, (max - natural) / Math.max(1, text.length - 1));
  let cx = x - (natural + space * (text.length - 1)) / 2;
  const align = ctx.textAlign;
  ctx.textAlign = 'left';
  [...text].forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + space;
  });
  ctx.textAlign = align;
}

function makeGrain(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const img = g.createImageData(256, 256);
  let seed = 9173;
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const v = seed >>> 24;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}
