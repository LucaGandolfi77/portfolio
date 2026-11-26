/*
 * Road graph for traffic, police and missions, built from the vehicular
 * OpenStreetMap streets of Fidenza. Nodes are junctions and dead ends;
 * edges are the polylines between them.
 */
import type { FidenzaRoad } from './fidenza';

export const VEHICULAR = new Set([
  'primary',
  'primary_link',
  'secondary',
  'tertiary',
  'residential',
  'unclassified',
  'living_street'
]);

export interface RoadNode {
  id: number;
  x: number;
  z: number;
  edges: number[];
}

export interface RoadEdge {
  id: number;
  a: number;
  b: number;
  /** Flat [x,z,...] polyline from node a to node b. */
  pts: number[];
  /** Cumulative length at every vertex. */
  cum: number[];
  length: number;
  width: number;
  name: string;
  kind: string;
  /** Part of the largest connected network (spawns only happen there). */
  main: boolean;
}

export interface RoadGraph {
  nodes: RoadNode[];
  edges: RoadEdge[];
  /** Edges of the largest connected network. */
  mainEdges: RoadEdge[];
}

const key = (x: number, z: number): string => `${Math.round(x * 2)},${Math.round(z * 2)}`;

export function buildRoadGraph(roads: FidenzaRoad[]): RoadGraph {
  const vehicular = roads.filter((r) => VEHICULAR.has(r.kind) && r.pts.length >= 4);
  /* A vertex is a node if it ends a road or is shared by two roads. */
  const uses = new Map<string, number>();
  for (const road of vehicular) {
    const seen = new Set<string>();
    for (let i = 0; i < road.pts.length; i += 2) {
      const k = key(road.pts[i], road.pts[i + 1]);
      if (seen.has(k)) continue;
      seen.add(k);
      uses.set(k, (uses.get(k) ?? 0) + 1);
    }
  }
  const nodes: RoadNode[] = [];
  const nodeAt = new Map<string, number>();
  const node = (x: number, z: number): number => {
    const k = key(x, z);
    const existing = nodeAt.get(k);
    if (existing !== undefined) return existing;
    const id = nodes.length;
    nodes.push({ id, x, z, edges: [] });
    nodeAt.set(k, id);
    return id;
  };
  const edges: RoadEdge[] = [];
  for (const road of vehicular) {
    const n = road.pts.length / 2;
    let start = 0;
    for (let i = 1; i < n; i++) {
      const k = key(road.pts[i * 2], road.pts[i * 2 + 1]);
      if (i < n - 1 && (uses.get(k) ?? 0) < 2) continue;
      const pts = road.pts.slice(start * 2, i * 2 + 2);
      addEdge(pts, road);
      start = i;
    }
  }

  function addEdge(pts: number[], road: FidenzaRoad): void {
    const cum = [0];
    for (let i = 2; i < pts.length; i += 2) {
      cum.push(cum[cum.length - 1] + Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]));
    }
    const length = cum[cum.length - 1];
    if (length < 0.5) return;
    const a = node(pts[0], pts[1]);
    const b = node(pts[pts.length - 2], pts[pts.length - 1]);
    if (a === b) return;
    const id = edges.length;
    edges.push({ id, a, b, pts, cum, length, width: road.w, name: road.name, kind: road.kind, main: false });
    nodes[a].edges.push(id);
    nodes[b].edges.push(id);
  }

  /* Largest connected component: small isolated courtyards stay drawn but
     nothing spawns there (a patrol could never leave them). */
  const comp = new Int32Array(nodes.length).fill(-1);
  let best = -1;
  let bestSize = 0;
  for (let s = 0, id = 0; s < nodes.length; s++) {
    if (comp[s] >= 0) continue;
    let size = 0;
    const stack = [s];
    comp[s] = id;
    while (stack.length) {
      const u = stack.pop()!;
      size++;
      for (const eid of nodes[u].edges) {
        const e = edges[eid];
        const v = e.a === u ? e.b : e.a;
        if (comp[v] < 0) {
          comp[v] = id;
          stack.push(v);
        }
      }
    }
    if (size > bestSize) {
      bestSize = size;
      best = id;
    }
    id++;
  }
  for (const e of edges) e.main = comp[e.a] === best;
  return { nodes, edges, mainEdges: edges.filter((e) => e.main) };
}

/** Point and heading at distance d along an edge, walking from node `from`. */
export function pointOnEdge(edge: RoadEdge, d: number, fromA = true): { x: number; z: number; dx: number; dz: number } {
  const s = Math.max(0, Math.min(edge.length, fromA ? d : edge.length - d));
  let i = 1;
  while (i < edge.cum.length - 1 && edge.cum[i] < s) i++;
  const ax = edge.pts[(i - 1) * 2];
  const az = edge.pts[(i - 1) * 2 + 1];
  const bx = edge.pts[i * 2];
  const bz = edge.pts[i * 2 + 1];
  const seg = edge.cum[i] - edge.cum[i - 1] || 1;
  const t = (s - edge.cum[i - 1]) / seg;
  let dx = (bx - ax) / seg;
  let dz = (bz - az) / seg;
  if (!fromA) {
    dx = -dx;
    dz = -dz;
  }
  return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, dx, dz };
}

/** Nearest point on the graph to (x, z). */
export function nearestOnGraph(graph: RoadGraph, x: number, z: number): { edge: RoadEdge; d: number; x: number; z: number; dist: number } {
  let best = { edge: graph.edges[0], d: 0, x: graph.edges[0].pts[0], z: graph.edges[0].pts[1], dist: Infinity };
  for (const edge of graph.edges) {
    const p = edge.pts;
    for (let i = 0; i + 3 < p.length; i += 2) {
      const ax = p[i], az = p[i + 1], bx = p[i + 2], bz = p[i + 3];
      if (Math.min(ax, bx) - best.dist > x || Math.max(ax, bx) + best.dist < x) continue;
      if (Math.min(az, bz) - best.dist > z || Math.max(az, bz) + best.dist < z) continue;
      const vx = bx - ax, vz = bz - az;
      const len2 = vx * vx + vz * vz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / len2));
      const px = ax + vx * t, pz = az + vz * t;
      const dist = Math.hypot(px - x, pz - z);
      if (dist < best.dist) best = { edge, d: edge.cum[i / 2] + Math.sqrt(len2) * t, x: px, z: pz, dist };
    }
  }
  return best;
}

/** Next edge at a node, avoiding a U-turn unless it is a dead end. */
export function nextEdge(graph: RoadGraph, nodeId: number, cameFrom: number, random: () => number): RoadEdge {
  const options = graph.nodes[nodeId].edges.filter((e) => e !== cameFrom);
  const pick = options.length > 0 ? options : graph.nodes[nodeId].edges;
  return graph.edges[pick[Math.floor(random() * pick.length) % pick.length]];
}

/** Shortest path (Dijkstra on node ids) from node s to node t; returns edge ids. */
export function shortestPath(graph: RoadGraph, s: number, t: number): number[] {
  const dist = new Float64Array(graph.nodes.length).fill(Infinity);
  const prevEdge = new Int32Array(graph.nodes.length).fill(-1);
  const done = new Uint8Array(graph.nodes.length);
  dist[s] = 0;
  const heap: Array<[number, number]> = [[0, s]];
  const push = (item: [number, number]): void => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = (): [number, number] | undefined => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0 && last) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  for (let item = pop(); item; item = pop()) {
    const [d, u] = item;
    if (done[u]) continue;
    done[u] = 1;
    if (u === t) break;
    for (const eid of graph.nodes[u].edges) {
      const e = graph.edges[eid];
      const v = e.a === u ? e.b : e.a;
      const nd = d + e.length;
      if (nd < dist[v]) {
        dist[v] = nd;
        prevEdge[v] = eid;
        push([nd, v]);
      }
    }
  }
  if (!Number.isFinite(dist[t])) return [];
  const path: number[] = [];
  for (let v = t; v !== s; ) {
    const eid = prevEdge[v];
    if (eid < 0) return [];
    path.push(eid);
    const e = graph.edges[eid];
    v = e.a === v ? e.b : e.a;
  }
  return path.reverse();
}
