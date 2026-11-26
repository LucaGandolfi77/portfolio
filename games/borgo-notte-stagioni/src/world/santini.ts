import * as THREE from 'three';
import { FIDENZA } from '../data/fidenza';
import type { CollisionWorld } from '../data/colliders';
import { nearestOnGraph, pointOnEdge, type RoadGraph } from '../data/roads';
import { PLACES } from '../game/story';

/* Twenty holy cards on the pavements near the town's landmarks. */
export const SANTINI = 20;

export class Santini {
  readonly items: Array<{ x: number; z: number; mesh: THREE.Mesh }> = [];

  constructor(scene: THREE.Scene, graph: RoadGraph, world: CollisionWorld, found: number[]) {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 96;
    const g = c.getContext('2d')!;
    g.fillStyle = '#f2e6c4';
    g.fillRect(0, 0, 64, 96);
    g.strokeStyle = '#c9a64b';
    g.lineWidth = 6;
    g.strokeRect(4, 4, 56, 88);
    g.fillStyle = '#7a4a2a';
    g.beginPath();
    g.arc(32, 36, 14, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(32, 36, 18, Math.PI, 0);
    g.lineWidth = 3;
    g.strokeStyle = '#ffd23f';
    g.stroke();
    g.fillRect(20, 54, 24, 26);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
    const geo = new THREE.PlaneGeometry(0.6, 0.9);
    const candidates = [...FIDENZA.places.map((p) => ({ x: p.x, z: p.z })), ...Object.values(PLACES).map((p) => ({ x: p.x + 9, z: p.z - 7 }))];
    const chosen: Array<{ x: number; z: number }> = [];
    for (const p of candidates) {
      if (chosen.length >= SANTINI) break;
      const n = nearestOnGraph(graph, p.x, p.z, true);
      const dir = pointOnEdge(n.edge, n.d, true);
      const off = n.edge.width / 2 + 1.4;
      const x = n.x - dir.dz * off, z = n.z + dir.dx * off;
      if (!world.isFree(x, z, 0.4)) continue;
      if (chosen.some((q) => Math.hypot(q.x - x, q.z - z) < 60)) continue;
      chosen.push({ x, z });
    }
    chosen.forEach((p, i) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x, 1.4, p.z);
      mesh.visible = !found.includes(i);
      scene.add(mesh);
      this.items.push({ x: p.x, z: p.z, mesh });
    });
  }

  get total(): number {
    return this.items.length;
  }

  reset(): void {
    for (const s of this.items) s.mesh.visible = true;
  }

  /** Spins the cards; returns the index picked up this frame, or -1. */
  update(x: number, z: number, radius: number, canPick: boolean): number {
    const t = performance.now() / 1000;
    let picked = -1;
    this.items.forEach((s, i) => {
      if (!s.mesh.visible) return;
      s.mesh.rotation.y = t * 1.6 + i;
      s.mesh.position.y = 1.4 + Math.sin(t * 2 + i) * 0.15;
      if (picked < 0 && canPick && Math.hypot(s.x - x, s.z - z) < radius) {
        s.mesh.visible = false;
        picked = i;
      }
    });
    return picked;
  }
}
