import { describe, expect, it } from 'vitest';
import { FIDENZA } from '../src/data/fidenza';
import { buildRoadGraph } from '../src/data/roads';
import { lightAt, planJunctions } from '../src/game/signals';
import { planParking } from '../src/world/parked';

const graph = buildRoadGraph(FIDENZA.roads);

describe('traffic lights', () => {
  it('cycles green, amber, red and never shows green on both axes', () => {
    const seen: string[] = [];
    for (let t = 0; t < 30; t += 0.25) {
      const a = lightAt(t, 0, 0);
      const b = lightAt(t, 1, 0);
      expect(a === 'green' && b === 'green').toBe(false);
      expect(a !== 'red' && b !== 'red').toBe(false);
      if (seen.at(-1) !== a) seen.push(a);
    }
    expect(seen.slice(0, 3)).toEqual(['green', 'amber', 'red']);
  });

  it('puts signals at real junctions of the main streets', () => {
    const junctions = planJunctions(graph);
    expect(junctions.length).toBeGreaterThan(10);
    for (const j of junctions) {
      expect(j.approaches.length).toBeGreaterThanOrEqual(3);
      expect(new Set(j.approaches.map((a) => a.phase)).size).toBe(2);
    }
    for (let i = 0; i < junctions.length; i++) {
      for (let k = i + 1; k < junctions.length; k++) {
        expect(Math.hypot(junctions[i].x - junctions[k].x, junctions[i].z - junctions[k].z)).toBeGreaterThanOrEqual(40);
      }
    }
  });
});

describe('parked cars', () => {
  const cars = planParking();
  const inside = (x: number, z: number, poly: number[]): boolean => {
    let hit = false;
    for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
      const zi = poly[i + 1], zj = poly[j + 1];
      if (zi > z !== zj > z && x < ((poly[j] - poly[i]) * (z - zi)) / (zj - zi) + poly[i]) hit = !hit;
    }
    return hit;
  };

  it('parks a few hundred cars, always in the same spots', () => {
    expect(cars.length).toBeGreaterThan(150);
    expect(planParking().map((c) => [c.x, c.z])).toEqual(cars.map((c) => [c.x, c.z]));
  });

  it('keeps parked cars out of buildings and apart from each other', () => {
    for (const c of cars) {
      for (const b of FIDENZA.buildings) {
        if (Math.abs(b.x - c.x) > 60 || Math.abs(b.z - c.z) > 60) continue;
        expect(inside(c.x, c.z, b.poly), `car ${c.id} in ${b.id}`).toBe(false);
      }
    }
    let overlaps = 0;
    for (let i = 0; i < cars.length; i++) {
      for (let k = i + 1; k < cars.length; k++) {
        if (Math.hypot(cars[i].x - cars[k].x, cars[i].z - cars[k].z) < 1.5) overlaps++;
      }
    }
    expect(overlaps / cars.length).toBeLessThan(0.05);
  });
});
