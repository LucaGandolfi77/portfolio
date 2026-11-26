import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { FIDENZA } from '../src/data/fidenza';
import { buildRoadGraph } from '../src/data/roads';
import { CollisionWorld } from '../src/data/colliders';
import { Escalation } from '../src/game/escalation';
import { Vehicle, NO_INPUT } from '../src/game/vehicle';
import { buyMod, canHide, cleanGarage, MAX_LEVEL, MODS, NO_TUNE, tuneFactors } from '../src/game/workshop';
import { loadSave } from '../src/game/save';

const graph = buildRoadGraph(FIDENZA.roads);

describe('officina', () => {
  it('sells each modification level once, in order, if you can pay', () => {
    let t = { ...NO_TUNE };
    let money = 100000;
    for (let lv = 1; lv <= MAX_LEVEL; lv++) {
      const r = buyMod(t, 'engine', money)!;
      expect(r.tune.engine).toBe(lv);
      expect(money - r.money).toBe(MODS.engine.prices[lv]);
      t = r.tune;
      money = r.money;
    }
    expect(buyMod(t, 'engine', money)).toBeNull();
    expect(buyMod(NO_TUNE, 'brakes', 10)).toBeNull();
  });

  it('a tuned engine is faster and tuned brakes stop sooner', () => {
    const world = new CollisionWorld([]);
    const run = (engine: number, brakes: number): { top: number; stop: number } => {
      const v = new Vehicle('berlina', 0, 0, 0, 0x2b2d30, null);
      v.tune = { ...NO_TUNE, engine, brakes };
      for (let i = 0; i < 400; i++) v.update({ ...NO_INPUT, throttle: 1 }, 1 / 60, world);
      const top = v.speed;
      let stop = 0;
      while (v.speed > 0.6 && stop < 2000) {
        v.update({ ...NO_INPUT, brake: 1 }, 1 / 60, world);
        stop++;
      }
      return { top, stop };
    };
    const stock = run(0, 0), tuned = run(3, 0), brakes = run(0, 3);
    expect(tuned.top).toBeGreaterThan(stock.top * 1.1);
    expect(brakes.stop).toBeLessThan(stock.stop);
    expect(tuneFactors(NO_TUNE)).toEqual({ accel: 1, top: 1, brake: 1, grip: 1 });
  });

  it('repaints the body and keeps the shades of the trim', () => {
    const v = new Vehicle('utilitaria', 0, 0, 0, 0xc23b2e, null);
    v.repaint(0x1b2a4a);
    expect(v.color).toBe(0x1b2a4a);
    const target = new THREE.Color(0x1b2a4a);
    let matched = 0;
    v.model.traverse((o) => {
      const attr = o instanceof THREE.Mesh ? (o.geometry.getAttribute('color') as THREE.BufferAttribute | undefined) : undefined;
      if (!attr) return;
      for (let i = 0; i < attr.count; i++) if (Math.abs(attr.getX(i) - target.r) < 0.01 && Math.abs(attr.getZ(i) - target.b) < 0.01) matched++;
    });
    expect(matched).toBeGreaterThan(20);
  });
});

describe('garage', () => {
  it('keeps at most four valid cars in the save', () => {
    const raw = [
      { type: 'sportiva', color: 0xd62818, tune: { engine: 9, brakes: -1 }, health: 50 },
      { type: 'astronave', color: 1 },
      { type: 'berlina', color: 0x111111 },
      { type: 'berlina', color: 0x111111 },
      { type: 'berlina', color: 0x111111 },
      { type: 'berlina', color: 0x111111 }
    ];
    const g = cleanGarage(raw, ['sportiva', 'berlina']);
    expect(g).toHaveLength(4);
    expect(g[0].tune).toEqual({ engine: 3, brakes: 0, grip: 0, horn: 0 });
    expect(g[1].health).toBe(100);
    const store = { getItem: () => JSON.stringify({ garage: raw }), setItem: () => undefined };
    expect(loadSave(store).garage).toHaveLength(4);
  });

  it('you can hide only from police who are not watching', () => {
    expect(canHide(3, false)).toBe(true);
    expect(canHide(3, true)).toBe(false);
    expect(canHide(0, false)).toBe(false);
  });
});

describe('police escalation', () => {
  const world = new CollisionWorld([]);
  const start = graph.mainEdges.find((e) => e.length > 60)!;
  const target = { x: start.pts[0], z: start.pts[1], vx: 0, vz: 15, onFoot: false };

  it('sets up a roadblock ahead at level 3 and lifts it below', () => {
    const scene = new THREE.Scene();
    const esc = new Escalation(scene, graph, world, null);
    /* Try a few headings: some places have no wide street ahead. */
    let placed = false;
    for (const [vx, vz] of [[0, 15], [15, 0], [0, -15], [-15, 0]]) {
      esc.update(0.1, 3, { ...target, vx, vz }, []);
      if (esc.vehicles.length) {
        const b = esc.vehicles[0];
        const d = Math.hypot(b.x - target.x, b.z - target.z);
        expect(d).toBeGreaterThan(100);
        expect(d).toBeLessThan(180);
        expect(((b.x - target.x) * vx + (b.z - target.z) * vz) / (d * 15)).toBeGreaterThan(0.7);
        placed = true;
        break;
      }
    }
    expect(placed).toBe(true);
    expect(esc.vehicles).toHaveLength(2);
    esc.update(0.1, 2, target, []);
    expect(esc.vehicles).toHaveLength(0);
  });

  it('sends officers on foot at 4 and the helicopter at 5', () => {
    const scene = new THREE.Scene();
    const esc = new Escalation(scene, graph, world, null);
    const from = [{ x: target.x + 30, z: target.z }];
    esc.update(0.1, 4, { ...target, vx: 0, vz: 0, onFoot: true }, from);
    expect(esc.officers.length).toBe(3);
    const d0 = Math.hypot(esc.officers[0].x - target.x, esc.officers[0].z - target.z);
    for (let i = 0; i < 20; i++) esc.update(0.1, 4, { ...target, vx: 0, vz: 0, onFoot: true }, from);
    expect(Math.hypot(esc.officers[0].x - target.x, esc.officers[0].z - target.z)).toBeLessThan(d0);
    expect(esc.sees(target.x, target.z)).toBe(false);
    for (let i = 0; i < 200; i++) esc.update(0.05, 5, { ...target, vx: 0, vz: 0, onFoot: true }, from);
    expect(esc.helicopter).not.toBeNull();
    expect(esc.sees(target.x, target.z)).toBe(true);
    esc.clear();
    expect(esc.officers.length + esc.vehicles.length).toBe(0);
    expect(esc.helicopter).toBeNull();
  });
});
