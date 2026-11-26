import { describe, expect, it } from 'vitest';
import { CAST, CHAPTERS, MISSIONS, PLACES, type Step } from '../src/game/story';
import { FIDENZA } from '../src/data/fidenza';
import { CollisionWorld, buildCityColliders } from '../src/data/colliders';
import { buildRoadGraph, nearestOnGraph } from '../src/data/roads';

const places = PLACES as Record<string, { x: number; z: number; name: string }>;

function refs(step: Step): string[] {
  switch (step.kind) {
    case 'talk':
    case 'goto':
      return [step.at];
    case 'deliver':
      return [step.to];
    case 'race':
      return step.via;
    case 'chase':
      return [step.from];
    case 'tail':
      return [step.from, step.to];
    case 'collect':
      return step.items;
    default:
      return [];
  }
}

describe('story', () => {
  it('has four chapters, one per season, three missions each', () => {
    expect(CHAPTERS.map((c) => c.season)).toEqual(['primavera', 'estate', 'autunno', 'inverno']);
    for (let c = 0; c < 4; c++) {
      const missions = MISSIONS.filter((m) => m.chapter === c);
      expect(missions).toHaveLength(3);
      expect(missions.every((m) => m.season === CHAPTERS[c].season)).toBe(true);
    }
  });

  it('only uses known places and characters', () => {
    for (const m of MISSIONS) {
      expect(places[m.at], m.id).toBeDefined();
      expect(CAST[m.giver]).toBeDefined();
      for (const step of m.steps) {
        for (const r of refs(step)) expect(places[r], `${m.id}: ${r}`).toBeDefined();
        if (step.kind === 'talk') for (const l of step.lines) expect(CAST[l.who]).toBeDefined();
      }
    }
  });

  it('moves to the next season at the end of each of the first three chapters', () => {
    for (let c = 0; c < 3; c++) {
      const last = MISSIONS.filter((m) => m.chapter === c).at(-1)!;
      const step = last.steps.at(-1)!;
      expect(step.kind).toBe('season');
      if (step.kind === 'season') expect(step.to).toBe(CHAPTERS[c + 1].season);
    }
  });

  it('puts every place near a drivable street', () => {
    const graph = buildRoadGraph(FIDENZA.roads);
    const world = new CollisionWorld(buildCityColliders());
    for (const [id, p] of Object.entries(places)) {
      const n = nearestOnGraph(graph, p.x, p.z, true);
      expect(n.dist, id).toBeLessThan(120);
      expect(n.edge.main, `${id} on the main network`).toBe(true);
      expect(world.isFree(n.x, n.z, 1), `${id} street point free`).toBe(true);
    }
  });
});
