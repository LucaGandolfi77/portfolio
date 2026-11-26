import * as THREE from 'three';
import { GeoBatch, glowMaterial, staticMaterial } from './batch';
import type { CollisionWorld } from '../data/colliders';
import { EVENTS, type SeasonEvent } from '../game/calendar';
import { addFarMesh, animateIdle, createPerson, setFar, type PersonLook, type PersonRig } from './person';

/*
 * Seasonal events in town: stalls, lights, a stage, lanterns, a Christmas
 * tree, fireworks, and a crowd standing around while the event runs.
 * Each event is one or two merged meshes, shown only while it is active.
 */

type EventId = SeasonEvent['id'];

const CROWD: PersonLook[] = ['citizen1', 'citizen2', 'citizen3', 'ada', 'elio', 'marta', 'nino', 'lidia', 'sara', 'beppe'];

interface Decor {
  group: THREE.Group;
  crowd: PersonRig[];
  spots: Array<{ x: number; z: number }>;
}

export class SeasonEvents {
  private decor = new Map<EventId, Decor>();
  private fireworks: Fireworks;
  private active = new Set<EventId>();
  private t = 0;

  constructor(private scene: THREE.Scene, private world: CollisionWorld, private crowdSize: number) {
    for (const e of EVENTS) {
      const group = this.build(e);
      group.visible = false;
      scene.add(group);
      this.decor.set(e.id, { group, crowd: [], spots: this.freeSpots(e.place, 22, 16) });
    }
    this.fireworks = new Fireworks(scene);
  }

  /** Free ground spots in a ring around the event square. */
  private freeSpots(c: { x: number; z: number }, radius: number, count: number): Array<{ x: number; z: number }> {
    const out: Array<{ x: number; z: number }> = [];
    for (let i = 0; i < count * 6 && out.length < count; i++) {
      const a = (i / (count * 6)) * Math.PI * 2 * 3 + i * 0.37;
      const r = 6 + ((i * 7) % radius);
      const x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r;
      if (this.world.isFree(x, z, 1.6) && out.every((p) => Math.hypot(p.x - x, p.z - z) > 4)) out.push({ x, z });
    }
    return out;
  }

  private build(e: SeasonEvent): THREE.Group {
    const g = new THREE.Group();
    const solid = new GeoBatch();
    const glow = new GeoBatch();
    const spots = this.freeSpots(e.place, 22, 12);
    const stall = (x: number, z: number, a: number, cloth: number): void => {
      solid.box(2.4, 0.9, 1.2, x, 0.45, z, 0x8a6a48, 0, a);
      for (const [dx, dz] of [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]]) {
        const c = Math.cos(a), s = Math.sin(a);
        solid.box(0.08, 2.3, 0.08, x + dx * c + dz * s, 1.15, z - dx * s + dz * c, 0x5a4632);
      }
      solid.box(2.7, 0.12, 1.6, x, 2.35, z, cloth, 0, a);
      solid.box(2.7, 0.28, 0.04, x - Math.sin(a) * 0.8, 2.2, z - Math.cos(a) * 0.8, 0xf2ead8, 0, a);
    };
    if (e.id === 'fiori') {
      const flowers = [0xe2496a, 0xf2c94c, 0xffffff, 0x9b59b6, 0xff8a3d, 0x4ab0d9];
      spots.forEach((p, i) => {
        stall(p.x, p.z, Math.atan2(e.place.x - p.x, e.place.z - p.z), i % 2 ? 0x3f8a5a : 0xd8d0b0);
        for (let k = 0; k < 6; k++) solid.sphere(0.22, p.x - 0.9 + k * 0.36, 1.05, p.z, flowers[(i + k) % flowers.length], 0, 0.8);
      });
    } else if (e.id === 'notte-bianca') {
      const c = e.place;
      solid.box(10, 1.2, 6, c.x + 4, 0.6, c.z + 16, 0x2a2a30);
      solid.box(10, 0.2, 6, c.x + 4, 6, c.z + 16, 0x1a1a1e);
      for (const dx of [-5, 5]) solid.box(0.3, 6, 0.3, c.x + 4 + dx, 3, c.z + 16, 0x1a1a1e);
      for (const dx of [-4, 4]) solid.box(1.2, 2.2, 1, c.x + 4 + dx, 2.3, c.z + 13.8, 0x111111);
      /* Strings of bulbs across the square. */
      for (let line = 0; line < 6; line++) {
        const a = (line / 6) * Math.PI;
        for (let k = -12; k <= 12; k++) {
          const x = c.x + Math.cos(a) * k * 1.6, z = c.z + Math.sin(a) * k * 1.6;
          const sag = 7.5 - Math.cos((k / 12) * Math.PI * 0.5) * 1.2;
          glow.sphere(0.13, x, sag, z, [0xffe08a, 0xff6a8a, 0x8ad8ff][(k + line) & 1 ? 0 : (line % 3)], 0);
        }
      }
      spots.slice(0, 8).forEach((p) => {
        solid.cylinder(0.5, 0.5, 0.05, 10, p.x, 0.75, p.z, 0xf2ead8);
        solid.cylinder(0.06, 0.06, 0.75, 6, p.x, 0.37, p.z, 0x333333);
      });
    } else if (e.id === 'san-donnino') {
      spots.forEach((p, i) => {
        if (i % 3 === 0) stall(p.x, p.z, Math.atan2(e.place.x - p.x, e.place.z - p.z), 0xa8432f);
        solid.box(0.1, 3, 0.1, p.x + 2, 1.5, p.z, 0x3a3028);
        glow.box(0.5, 0.6, 0.5, p.x + 2, 3.2, p.z, 0xffa040);
      });
    } else if (e.id === 'natale') {
      const c = e.place;
      /* The tree: stacked cones with lights. */
      for (let k = 0; k < 4; k++) solid.cone(3.4 - k * 0.7, 3, 9, c.x, 2 + k * 2.2, c.z, 0x2f5a34);
      solid.box(0.6, 1.4, 0.6, c.x, 0.7, c.z, 0x5a3a26);
      glow.sphere(0.45, c.x, 11.2, c.z, 0xffe08a, 0);
      for (let k = 0; k < 40; k++) {
        const y = 1.5 + (k / 40) * 8.5;
        const r = 3.3 * (1 - (y - 1.5) / 9.5) + 0.1;
        const a = k * 2.4;
        glow.sphere(0.12, c.x + Math.cos(a) * r, y, c.z + Math.sin(a) * r, [0xff3b3b, 0xffd23f, 0x6ad1ff][k % 3], 0);
      }
      spots.forEach((p) => {
        const a = Math.atan2(c.x - p.x, c.z - p.z);
        solid.box(2.6, 2.2, 2, p.x, 1.1, p.z, 0x8a5a36, 0, a);
        solid.box(3, 0.15, 2.6, p.x, 2.45, p.z, 0xf4f6fa, 0, a);
        glow.box(2.2, 0.08, 0.08, p.x, 2.25, p.z, 0xffd27a);
      });
    }
    const material = staticMaterial();
    /* Decorations stay readable after dark. */
    material.emissive.setRGB(0.06, 0.05, 0.04);
    const s = solid.build(material);
    const l = glow.build(glowMaterial());
    if (s) g.add(s);
    if (l) g.add(l);
    return g;
  }

  /** Shows the running events, fills the crowd, fires the midnight show. */
  update(dt: number, events: SeasonEvent[], hours: number, centre: THREE.Vector3): void {
    this.t += dt;
    const now = new Set(events.map((e) => e.id));
    for (const [id, d] of this.decor) {
      const on = now.has(id);
      d.group.visible = on;
      if (on && d.crowd.length === 0 && Math.hypot(centre.x - EVENTS.find((e) => e.id === id)!.place.x, centre.z - EVENTS.find((e) => e.id === id)!.place.z) < 260) {
        d.spots.slice(0, this.crowdSize).forEach((p, i) => {
          const rig = createPerson(CROWD[i % CROWD.length]);
          addFarMesh(rig);
          rig.group.position.set(p.x + 1, 0, p.z + 1);
          rig.group.rotation.y = i * 1.7;
          this.scene.add(rig.group);
          d.crowd.push(rig);
        });
      }
      if (!on && d.crowd.length) {
        for (const r of d.crowd) this.scene.remove(r.group);
        d.crowd.length = 0;
      }
      d.crowd.forEach((r, i) => {
        const far = Math.hypot(r.group.position.x - centre.x, r.group.position.z - centre.z) > 40;
        setFar(r, far);
        if (!far) animateIdle(r, this.t + i, 0.8);
      });
    }
    this.active = now;
    /* Fireworks from 23:55 to 00:30 at Capodanno. */
    const h = ((hours % 24) + 24) % 24;
    const show = now.has('capodanno') && (h > 23.9 || h < 0.5);
    this.fireworks.update(dt, show, EVENTS.find((e) => e.id === 'capodanno')!.place);
  }

  isActive(id: EventId): boolean {
    return this.active.has(id);
  }
}

/* Bursts of points in the sky. */
class Fireworks {
  private points: THREE.Points;
  private vel: Float32Array;
  private life: Float32Array;
  private count = 900;
  private timer = 0;

  constructor(scene: THREE.Scene) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.count * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.count * 3), 3));
    this.vel = new Float32Array(this.count * 3);
    this.life = new Float32Array(this.count);
    this.points = new THREE.Points(
      g,
      new THREE.PointsMaterial({ size: 0.9, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })
    );
    this.points.frustumCulled = false;
    this.points.visible = false;
    scene.add(this.points);
  }

  update(dt: number, on: boolean, at: { x: number; z: number }): void {
    const pos = this.points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const col = this.points.geometry.getAttribute('color') as THREE.BufferAttribute;
    const p = pos.array as Float32Array;
    const c = col.array as Float32Array;
    this.points.visible = on || this.life.some((l) => l > 0);
    if (!this.points.visible) return;
    this.timer -= dt;
    if (on && this.timer <= 0) {
      this.timer = 0.5 + Math.random() * 0.7;
      const cx = at.x + (Math.random() - 0.5) * 60, cy = 45 + Math.random() * 25, cz = at.z + (Math.random() - 0.5) * 60;
      const color = new THREE.Color().setHSL(Math.random(), 0.9, 0.6);
      let n = 0;
      for (let i = 0; i < this.count && n < 120; i++) {
        if (this.life[i] > 0) continue;
        const a = Math.random() * Math.PI * 2, b = Math.acos(Math.random() * 2 - 1);
        const s = 12 + Math.random() * 6;
        p.set([cx, cy, cz], i * 3);
        this.vel.set([Math.sin(b) * Math.cos(a) * s, Math.cos(b) * s, Math.sin(b) * Math.sin(a) * s], i * 3);
        c.set([color.r, color.g, color.b], i * 3);
        this.life[i] = 1.6 + Math.random() * 0.6;
        n++;
      }
    }
    for (let i = 0; i < this.count; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      const o = i * 3;
      this.vel[o + 1] -= 9 * dt;
      for (let k = 0; k < 3; k++) {
        this.vel[o + k] *= 1 - dt * 1.2;
        p[o + k] += this.vel[o + k] * dt;
      }
      const fade = Math.max(0, this.life[i] / 2);
      c[o] *= 0.99 + fade * 0.01;
      if (this.life[i] <= 0) p[o + 1] = -100;
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  }
}
