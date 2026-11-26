import type { VehicleType } from './vehicle';

/*
 * Officina Stirone: repairs and modifications, and the Corradi garage where
 * up to four cars are kept (saved with their paint and modifications).
 */

export type ModKind = 'engine' | 'brakes' | 'grip' | 'horn';

export interface Tune {
  engine: number;
  brakes: number;
  grip: number;
  horn: number;
}

export const NO_TUNE: Tune = { engine: 0, brakes: 0, grip: 0, horn: 0 };
export const MAX_LEVEL = 3;
export const REPAIR_COST = 80;
export const PAINT_COST = 90;
export const GARAGE_SLOTS = 4;

export const MODS: Record<ModKind, { label: string; levels: string[]; prices: number[] }> = {
  engine: { label: 'Motore', levels: ['Di serie', 'Centralina', 'Aspirazione e scarico', 'Preparazione da corsa'], prices: [0, 400, 900, 1800] },
  brakes: { label: 'Freni', levels: ['Di serie', 'Pastiglie sportive', 'Dischi forati', 'Pinze a quattro pistoncini'], prices: [0, 250, 600, 1100] },
  grip: { label: 'Assetto', levels: ['Di serie', 'Gomme nuove', 'Molle ribassate', 'Assetto regolabile'], prices: [0, 300, 700, 1300] },
  horn: { label: 'Clacson', levels: ['Di serie', 'Bitonale', 'Trombe', 'Motivo da sagra'], prices: [0, 60, 120, 200] }
};

/** Garage paint chart: the colours are ours, picked for the Po valley light. */
export const PAINTS: Array<{ name: string; color: number }> = [
  { name: 'Rosso Salsomaggiore', color: 0xb3241c },
  { name: 'Blu notte', color: 0x1b2a4a },
  { name: 'Verde bottiglia', color: 0x1f4a32 },
  { name: 'Giallo granoturco', color: 0xe6b520 },
  { name: 'Bianco latte', color: 0xeeeae0 },
  { name: 'Nero lucido', color: 0x16161a },
  { name: 'Grigio nebbia', color: 0x8c9096 },
  { name: 'Arancio zucca', color: 0xd8641c }
];

/** Horn note pairs (Hz) and how long each plays, per horn level. */
export const HORNS: Array<{ notes: number[]; step: number }> = [
  { notes: [392, 494], step: 0 },
  { notes: [440, 554], step: 0.22 },
  { notes: [330, 415, 494], step: 0 },
  { notes: [392, 392, 392, 523, 659], step: 0.13 }
];

export function nextPrice(t: Tune, kind: ModKind): number | null {
  const level = t[kind];
  return level >= MAX_LEVEL ? null : MODS[kind].prices[level + 1];
}

/** Buys the next level of a modification. Returns the new money or null. */
export function buyMod(t: Tune, kind: ModKind, money: number): { tune: Tune; money: number } | null {
  const price = nextPrice(t, kind);
  if (price === null || money < price) return null;
  return { tune: { ...t, [kind]: t[kind] + 1 }, money: money - price };
}

/** How each modification changes the driving model. */
export function tuneFactors(t: Tune): { accel: number; top: number; brake: number; grip: number } {
  return {
    accel: 1 + t.engine * 0.14,
    top: 1 + t.engine * 0.07,
    brake: 1 + t.brakes * 0.22,
    grip: 1 + t.grip * 0.09
  };
}

export interface StoredCar {
  type: VehicleType;
  color: number;
  tune: Tune;
  health: number;
}

export function cleanTune(raw: unknown): Tune {
  const r = (raw ?? {}) as Partial<Tune>;
  const lv = (n: unknown): number => (Number.isInteger(n) ? Math.max(0, Math.min(MAX_LEVEL, n as number)) : 0);
  return { engine: lv(r.engine), brakes: lv(r.brakes), grip: lv(r.grip), horn: lv(r.horn) };
}

export function cleanGarage(raw: unknown, types: readonly string[]): StoredCar[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c) => c && typeof c === 'object' && types.includes((c as StoredCar).type) && Number.isFinite((c as StoredCar).color))
    .slice(0, GARAGE_SLOTS)
    .map((c) => ({
      type: c.type,
      color: c.color,
      tune: cleanTune(c.tune),
      health: Number.isFinite(c.health) ? Math.max(10, Math.min(100, c.health)) : 100
    }));
}

/**
 * Hiding in the garage: the doors close behind you and the alert drops,
 * but only if nobody is watching you drive in.
 */
export function canHide(level: number, seen: boolean): boolean {
  return level > 0 && !seen;
}
