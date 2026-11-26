import { describe, expect, it } from 'vitest';
import { FIDENZA } from '../src/data/fidenza';
import { buildRoadGraph, nearestOnGraph, nextEdge, pointOnEdge, shortestPath } from '../src/data/roads';

const graph = buildRoadGraph(FIDENZA.roads);

function components(): number[] {
  const seen = new Int32Array(graph.nodes.length).fill(-1);
  const sizes: number[] = [];
  for (let s = 0; s < graph.nodes.length; s++) {
    if (seen[s] >= 0) continue;
    const id = sizes.length;
    let size = 0;
    const stack = [s];
    seen[s] = id;
    while (stack.length) {
      const u = stack.pop()!;
      size++;
      for (const eid of graph.nodes[u].edges) {
        const e = graph.edges[eid];
        const v = e.a === u ? e.b : e.a;
        if (seen[v] < 0) {
          seen[v] = id;
          stack.push(v);
        }
      }
    }
    sizes.push(size);
  }
  return sizes.sort((a, b) => b - a);
}

describe('road graph', () => {
  it('has junctions and streets', () => {
    expect(graph.edges.length).toBeGreaterThan(500);
    expect(graph.nodes.length).toBeGreaterThan(400);
  });

  it('is mostly one connected network', () => {
    const sizes = components();
    console.log('components', sizes.length, 'largest', sizes.slice(0, 5), 'nodes', graph.nodes.length);
    expect(sizes[0]).toBeGreaterThan(graph.nodes.length * 0.8);
  });

  it('finds a route across town', () => {
    const a = nearestOnGraph(graph, 15, -21);
    const b = nearestOnGraph(graph, 279, 798);
    const path = shortestPath(graph, a.edge.a, b.edge.b);
    expect(path.length).toBeGreaterThan(3);
  });

  it('walks along an edge and turns at a junction without a U-turn', () => {
    const e = graph.edges.find((x) => graph.nodes[x.b].edges.length > 2)!;
    const mid = pointOnEdge(e, e.length / 2, true);
    expect(Number.isFinite(mid.x)).toBe(true);
    const next = nextEdge(graph, e.b, e.id, () => 0.3);
    expect(next.id).not.toBe(e.id);
  });
});
