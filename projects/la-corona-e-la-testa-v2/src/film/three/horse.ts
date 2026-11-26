/* A horse: body, neck, head, mane, tail and four jointed legs that walk. */
import * as THREE from 'three';
import { mat } from './mats';

const cap = new THREE.CapsuleGeometry(1, 1, 6, 16);
const sph = new THREE.SphereGeometry(1, 20, 14);
const box = new THREE.BoxGeometry(1, 1, 1);

function part(geo: THREE.BufferGeometry, m: THREE.Material, s: [number, number, number], p: [number, number, number], r: [number, number, number] = [0, 0, 0]): THREE.Mesh {
  const o = new THREE.Mesh(geo, m);
  o.scale.set(...s);
  o.position.set(...p);
  o.rotation.set(...r);
  o.castShadow = o.receiveShadow = true;
  return o;
}

export class Horse {
  readonly root = new THREE.Group();
  private legs: Array<{ hip: THREE.Group; knee: THREE.Group; front: boolean; side: number }> = [];
  private neck = new THREE.Group();
  private tail = new THREE.Group();
  /** Height of the saddle, where the rider's pelvis goes. */
  static readonly SADDLE = 1.42;

  constructor(color: string) {
    const coat = mat({ color, rough: 0.55, bump: 'grain', bumpScale: 0.3 });
    const dark = mat({ color: '#1e1410', rough: 0.7 });
    const hoof = mat({ color: '#2a2420', rough: 0.5 });
    const cloth = mat({ color: '#8a1a1a', rough: 0.9, bump: 'cloth', bumpScale: 0.5, repeat: 3 });
    /* Barrel of the body, along +z (the horse faces +z). */
    this.root.add(part(cap, coat, [0.3, 0.62, 0.3], [0, 1.18, 0], [Math.PI / 2, 0, 0]));
    this.root.add(part(sph, coat, [0.32, 0.33, 0.36], [0, 1.2, -0.5]));
    this.root.add(part(sph, coat, [0.3, 0.34, 0.34], [0, 1.24, 0.45]));
    this.root.add(part(box, cloth, [0.66, 0.04, 0.6], [0, 1.42, -0.02]));
    this.root.add(part(box, mat({ color: '#d8a840', rough: 0.3, metal: 0.9 }), [0.67, 0.045, 0.04], [0, 1.42, 0.28]));
    /* Neck and head. */
    this.neck.position.set(0, 1.38, 0.6);
    this.root.add(this.neck);
    this.neck.add(part(cap, coat, [0.16, 0.42, 0.2], [0, 0.26, 0.1], [0.55, 0, 0]));
    this.neck.add(part(box, dark, [0.05, 0.6, 0.12], [0, 0.32, 0.0], [0.55, 0, 0]));
    const head = new THREE.Group();
    head.position.set(0, 0.58, 0.32);
    this.neck.add(head);
    head.add(part(cap, coat, [0.11, 0.32, 0.13], [0, -0.05, 0.16], [1.9, 0, 0]));
    head.add(part(sph, dark, [0.075, 0.07, 0.08], [0, -0.17, 0.33]));
    for (const s of [1, -1]) {
      head.add(part(new THREE.ConeGeometry(1, 1, 10), coat, [0.035, 0.12, 0.03], [0.06 * s, 0.1, 0.02], [-0.2, 0, 0.2 * s]));
      head.add(part(sph, dark, [0.02, 0.025, 0.02], [0.1 * s, 0.0, 0.18]));
    }
    /* Tail. */
    this.tail.position.set(0, 1.32, -0.82);
    this.root.add(this.tail);
    this.tail.add(part(cap, dark, [0.06, 0.5, 0.06], [0, -0.32, -0.08], [-0.3, 0, 0]));
    /* Legs. */
    for (const front of [true, false])
      for (const side of [1, -1]) {
        const hip = new THREE.Group();
        hip.position.set(0.17 * side, 1.08, front ? 0.48 : -0.5);
        this.root.add(hip);
        hip.add(part(cap, coat, [0.085, 0.3, 0.1], [0, -0.22, 0]));
        const knee = new THREE.Group();
        knee.position.y = -0.48;
        hip.add(knee);
        knee.add(part(cap, coat, [0.05, 0.38, 0.055], [0, -0.24, 0]));
        knee.add(part(new THREE.CylinderGeometry(1, 1.15, 1, 12), hoof, [0.06, 0.08, 0.065], [0, -0.52, 0.01]));
        this.legs.push({ hip, knee, front, side });
      }
  }

  /** walk: 0..1, phase in radians. */
  apply(time: number, walk: number, phase: number): void {
    for (const l of this.legs) {
      const off = (l.front ? 0 : Math.PI) + (l.side > 0 ? 0 : Math.PI * 0.5);
      const s = Math.sin(phase + off);
      l.hip.rotation.x = walk * s * 0.42;
      l.knee.rotation.x = walk * Math.max(0, Math.cos(phase + off)) * (l.front ? -0.9 : 0.7);
    }
    this.root.position.y = walk * Math.abs(Math.sin(phase)) * 0.04;
    this.neck.rotation.x = Math.sin(phase * 2) * 0.06 * walk + Math.sin(time * 0.7) * 0.03;
    this.tail.rotation.z = Math.sin(time * 1.3) * 0.12;
  }
}
