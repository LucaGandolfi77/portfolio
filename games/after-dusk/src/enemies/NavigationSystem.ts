import * as THREE from 'three';

export class NavigationSystem {
  constructor(private nodes: THREE.Vector3[], private edges: number[][]) {}

  nearest(pos: THREE.Vector3): number {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < this.nodes.length; i++) {
      const d = this.nodes[i].distanceToSquared(pos);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  route(from: number, to: number): number[] {
    if (from === to) return [to];
    const n = this.nodes.length;
    const dist = new Array(n).fill(Infinity);
    const prev = new Array(n).fill(-1);
    const open = new Set<number>([from]);
    dist[from] = 0;

    while (open.size > 0) {
      let cur = -1;
      let curF = Infinity;
      for (const i of open) {
        const f = dist[i] + this.nodes[i].distanceTo(this.nodes[to]);
        if (f < curF) { curF = f; cur = i; }
      }
      if (cur === -1 || cur === to) break;
      open.delete(cur);
      for (const nb of this.edges[cur] ?? []) {
        const alt = dist[cur] + this.nodes[cur].distanceTo(this.nodes[nb]);
        if (alt < dist[nb]) { dist[nb] = alt; prev[nb] = cur; open.add(nb); }
      }
    }

    const path: number[] = [];
    let c = to;
    while (c !== -1) { path.unshift(c); c = prev[c]; }
    return path.length ? path : [to];
  }

  node(index: number): THREE.Vector3 {
    return this.nodes[index] ?? new THREE.Vector3();
  }
}
