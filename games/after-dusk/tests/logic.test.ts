import { describe, it, expect, beforeEach } from 'vitest';
import { GameState, contactAvailability } from '../src/game/GameState';
import { PanicSystem } from '../src/systems/PanicSystem';
import { ErrandSystem } from '../src/systems/ErrandSystem';
import { ThreatSystem } from '../src/systems/ThreatSystem';
import { BatterySystem } from '../src/systems/BatterySystem';
import { CallSystem } from '../src/systems/CallSystem';
import { StorySystem } from '../src/systems/StorySystem';
import { SaveSystem } from '../src/systems/SaveSystem';
import { taxiCost, ZONES } from '../src/data/zones';
import { ERRANDS } from '../src/data/errands';
import { EN } from '../src/i18n/en';
import { IT } from '../src/i18n/it';

// Mock localStorage for Node Vitest environment
const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v); },
  removeItem: (k: string) => { store.delete(k); },
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() { return store.size; },
};

describe('After Dusk core simulation', () => {
  let state: GameState;

  beforeEach(() => {
    store.clear();
    state = new GameState();
    state.reset('story');
  });

  it('starts story mode at 19:30 Dusk and classic mode at 22:00', () => {
    expect(state.timeString).toBe('19:30');
    const classic = new GameState();
    classic.reset('classic');
    expect(classic.timeString).toBe('22:00');
  });

  it('increases panic in darkness and lowers panic in LightPools', () => {
    const ps = new PanicSystem();
    const initial = state.panic;
    ps.update(4, state, 0, false, false);
    const afterDark = state.panic;
    expect(afterDark).toBeGreaterThan(initial);

    ps.update(4, state, 1, true, false);
    expect(state.panic).toBeLessThan(afterDark);
  });

  it('calms panic and builds composure when Grounding breath completes', () => {
    const ps = new PanicSystem();
    state.panic = 65;
    const compBefore = state.composure;
    const r1 = ps.update(1.5, state, 0, false, true);
    expect(r1.grounded).toBe(false);
    const r2 = ps.update(1.6, state, 0, false, true);
    expect(r2.grounded).toBe(true);
    expect(state.panic).toBeLessThan(40);
    expect(state.composure).toBeGreaterThan(compBefore);
  });

  it('completes errands only once and rewards composure', () => {
    const es = new ErrandSystem();
    const before = state.composure;
    const done = es.complete(state, 'make_tea');
    expect(done?.id).toBe('make_tea');
    expect(state.composure).toBeGreaterThan(before);
    expect(es.complete(state, 'make_tea')).toBeNull();
  });

  it('slows threat rise when connected on a call or inside light', () => {
    const ts = new ThreatSystem();
    ts.update(5, state, false, 0);
    const darkThreat = state.threat;

    state.threat = 0;
    ts.update(5, state, true, 0);
    expect(state.threat).toBeLessThan(darkThreat);
  });

  it('drains battery faster during calls and flashlight, and recharges via powerbank', () => {
    const bs = new BatterySystem();
    state.flashlightOn = true;
    bs.update(10, state, true, true);
    expect(state.battery).toBeLessThan(98);
    state.battery = 20;
    expect(bs.usePowerBank(state)).toBe(true);
    expect(state.battery).toBe(60);
    expect(bs.usePowerBank(state)).toBe(false);
  });

  it('handles CallSystem ringing, connection, dialogue choice, and diminishing returns', () => {
    const ts = new ThreatSystem();
    const cs = new CallSystem(state, ts);
    expect(cs.start('sophie')).toBe(true);
    expect(cs.call?.phase).toBe('ringing');
    cs.update(5);
    expect(cs.connected).toBe(true);
    expect(cs.choose(0)).toBe(true);
    expect(state.relation('sophie')).toBeGreaterThan(0);
    cs.hangUp();
    expect(state.callCounts.sophie).toBe(1);
    expect(state.callEffectiveness('sophie')).toBeLessThan(1);
  });

  it('enforces chapter-gated contact availability', () => {
    state.chapter = 1;
    expect(contactAvailability(state, 'jessica')).toBe('off');
    expect(contactAvailability(state, 'unknown')).toBe('off');
    state.chapter = 2;
    expect(contactAvailability(state, 'jessica')).toBe('ok');
  });

  it('resolves reclaimed-night ending when mandatory errands and composure >= 60 are met', () => {
    for (const e of ERRANDS.filter((x) => !x.optional)) state.completeErrand(e.id);
    state.composure = 70;
    expect(StorySystem.resolveEnding(state)).toBe('reclaimed-night');
  });

  it('round-trips SaveSystem snapshots across v2 fields', () => {
    const saves = new SaveSystem();
    state.panic = 42;
    state.composure = 55;
    state.completeErrand('make_tea');
    expect(saves.save(state, 'slot1', 'Test Save')).toBe(true);
    const loaded = saves.load('slot1');
    expect(loaded).not.toBeNull();
    const restored = new GameState();
    restored.restore(loaded!);
    expect(restored.panic).toBe(42);
    expect(restored.composure).toBe(55);
    expect(restored.errandsDone.has('make_tea')).toBe(true);
  });

  it('computes bounded taxi costs across all 15 zones', () => {
    expect(ZONES.length).toBe(15);
    for (const z of ZONES) {
      const cost = taxiCost('home', z.id);
      expect(cost).toBeGreaterThanOrEqual(6);
      expect(cost).toBeLessThanOrEqual(18);
    }
  });

  it('maintains 100% EN/IT i18n key parity', () => {
    expect(Object.keys(IT).sort()).toEqual(Object.keys(EN).sort());
  });
});
