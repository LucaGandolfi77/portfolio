import { describe, expect, it } from 'vitest';
import { FIDENZA } from '../src/data/fidenza';
import { buildRoadGraph } from '../src/data/roads';
import { CollisionWorld, buildCityColliders } from '../src/data/colliders';
import { Alert } from '../src/game/police';
import { Missions, RADIUS, type Spot } from '../src/game/missions';
import { bustedFine, DEFAULT_SAVE, formatClock, formatMoney, loadSave, writeSave, KEY } from '../src/game/save';
import { NO_INPUT, Vehicle } from '../src/game/vehicle';

describe('alert level', () => {
  it('rises with offences and counts the same one once every few seconds', () => {
    const a = new Alert();
    expect(a.add('carjack', 0)).toBe(true);
    expect(a.level).toBe(1);
    expect(a.add('carjack', 1)).toBe(false);
    expect(a.add('carjack', 5)).toBe(true);
    expect(a.add('police-car', 5)).toBe(true);
    expect(a.level).toBe(4);
    a.add('ram', 10);
    a.add('knock', 10);
    expect(a.level).toBe(5);
  });

  it('drops one level after hiding long enough, not while seen', () => {
    const a = new Alert();
    a.add('knock', 0);
    a.add('knock', 10);
    expect(a.level).toBe(2);
    for (let t = 0; t < 60; t++) a.update(1, true);
    expect(a.level).toBe(2);
    for (let t = 0; t < Alert.cooldown(2); t++) a.update(1, false);
    expect(a.level).toBe(1);
    for (let t = 0; t < Alert.cooldown(1); t++) a.update(1, false);
    expect(a.level).toBe(0);
  });

  it('sends more patrols at higher levels', () => {
    expect(Alert.units(0)).toBe(0);
    expect(Alert.units(3)).toBeGreaterThan(Alert.units(1));
  });
});

describe('jobs', () => {
  const spots: Spot[] = [
    { x: 0, z: 0, name: 'A' },
    { x: 400, z: 0, name: 'B' },
    { x: 0, z: 500, name: 'C' },
    { x: 700, z: 700, name: 'D' }
  ];
  const input = (x: number, z: number, extra = {}) => ({ x, z, inVehicle: true, speed: 0, health: 100, alert: 0, ...extra });

  it('offers three jobs and starts one when you stop in its beacon', () => {
    const m = new Missions(spots, null, 3);
    m.refresh({ x: 1000, z: 1000 });
    expect(m.offers).toHaveLength(3);
    const offer = m.offers.find((o) => o.kind !== 'corsa')!;
    const events = m.update(0.1, input(offer.x, offer.z));
    expect(events[0].type).toBe('started');
    expect(m.active?.target).toEqual(offer.to);
  });

  it('pays the reward plus a tip on delivery, fails when time runs out', () => {
    const m = new Missions(spots, null, 3);
    m.refresh({ x: 1000, z: 1000 });
    const offer = m.offers.find((o) => o.kind === 'consegna')!;
    m.start(offer, input(offer.x, offer.z));
    const done = m.update(1, input(offer.to.x + RADIUS / 2, offer.to.z));
    expect(done[0].type).toBe('completed');
    if (done[0].type === 'completed') {
      expect(done[0].reward).toBeGreaterThan(100);
      expect(done[0].bonus).toBeGreaterThanOrEqual(0);
    }
    m.refresh({ x: 1000, z: 1000 });
    const again = m.offers.find((o) => o.kind !== 'corsa')!;
    m.start(again, input(again.x, again.z));
    const failed = m.update(10_000, input(-999, -999));
    expect(failed[0].type).toBe('failed');
  });

  it('does not deliver from a moving car or on foot', () => {
    const m = new Missions(spots, null, 3);
    m.refresh({ x: 1000, z: 1000 });
    const offer = m.offers.find((o) => o.kind === 'taxi')!;
    m.start(offer, input(offer.x, offer.z));
    expect(m.update(0.1, input(offer.to.x, offer.to.z, { speed: 20 }))).toHaveLength(0);
    expect(m.update(0.1, input(offer.to.x, offer.to.z, { inVehicle: false }))).toHaveLength(0);
  });

  it('builds a race along real streets with checkpoints', () => {
    const graph = buildRoadGraph(FIDENZA.roads);
    const m = new Missions(spots, graph, 3);
    const route = m.route({ x: 15, z: -21, name: 'Piazza Garibaldi' }, { x: 279, z: 798, name: 'Parco della Pace' });
    expect(route.length).toBeGreaterThan(2);
    expect(route[route.length - 1].name).toBe('Parco della Pace');
  });
});

describe('save', () => {
  it('survives broken storage and keeps defaults', () => {
    const broken = { getItem: () => '{not json', setItem: () => { throw new Error('full'); } };
    expect(loadSave(broken)).toEqual(DEFAULT_SAVE);
    expect(() => writeSave(DEFAULT_SAVE, broken)).not.toThrow();
  });

  it('round-trips progress', () => {
    const store = new Map<string, string>();
    const s = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    writeSave({ ...DEFAULT_SAVE, money: 1234, jobs: 7 }, s);
    expect(store.has(KEY)).toBe(true);
    expect(loadSave(s).money).toBe(1234);
  });

  it('fines 15%, at least 50 and never more than you have', () => {
    expect(bustedFine(1000)).toBe(150);
    expect(bustedFine(100)).toBe(50);
    expect(bustedFine(20)).toBe(20);
    expect(formatMoney(1250)).toMatch(/1\.250/);
    expect(formatClock(19.5)).toBe('19:30');
  });
});

describe('car physics', () => {
  const world = new CollisionWorld(buildCityColliders());

  it('accelerates, brakes and coasts to a stop', () => {
    const car = new Vehicle('berlina', 15, -60, 0, 0xffffff, null);
    for (let i = 0; i < 60; i++) car.update({ ...NO_INPUT, throttle: 1 }, 1 / 30, world);
    expect(car.speed).toBeGreaterThan(5);
    for (let i = 0; i < 90; i++) car.update({ ...NO_INPUT, brake: 1 }, 1 / 30, world);
    expect(car.speed).toBeLessThan(1);
  });

  it('never ends up inside a building', () => {
    const b = FIDENZA.buildings.find((x) => x.area > 400)!;
    const car = new Vehicle('utilitaria', b.x + 40, b.z, -Math.PI / 2, 0xffffff, null);
    for (let i = 0; i < 240; i++) car.update({ ...NO_INPUT, throttle: 1 }, 1 / 30, world);
    expect(world.isFree(car.x, car.z, 0.2)).toBe(true);
  });
});
