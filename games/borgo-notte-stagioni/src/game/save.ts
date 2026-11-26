/* Progress kept in localStorage; every access is guarded (private mode,
   blocked storage) and the game works without it. */

export type Quality = 'bassa' | 'media' | 'alta';

export interface SaveData {
  money: number;
  jobs: number;
  bestRace: number | null;
  busted: number;
  station: number;
  radioOn: boolean;
  quality: Quality | null;
  hours: number;
  /** Absolute in-game day (calendar.ts). */
  day: number;
  /** Completed story missions. */
  story: string[];
  /** Indexes of the santini found. */
  santini: number[];
  introSeen: boolean;
}

export const KEY = 'borgo-stagioni-save-v1';

export const DEFAULT_SAVE: SaveData = {
  money: 250,
  jobs: 0,
  bestRace: null,
  busted: 0,
  station: 0,
  radioOn: true,
  quality: null,
  hours: 7.5,
  day: 0,
  story: [],
  santini: [],
  introSeen: false
};

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function storage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadSave(store: StorageLike | null = storage()): SaveData {
  try {
    const raw = store?.getItem(KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const data = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...DEFAULT_SAVE,
      ...data,
      money: Number.isFinite(data.money) ? Math.max(0, Math.round(data.money as number)) : DEFAULT_SAVE.money,
      story: Array.isArray(data.story) ? data.story.filter((x) => typeof x === 'string') : [],
      santini: Array.isArray(data.santini) ? data.santini.filter((x) => Number.isInteger(x)) : []
    };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function writeSave(data: SaveData, store: StorageLike | null = storage()): void {
  try {
    store?.setItem(KEY, JSON.stringify(data));
  } catch {
    /* Storage full or blocked: progress stays in memory for this session. */
  }
}

/** Being stopped by the police costs 15% of the money, at least 50. */
export function bustedFine(money: number): number {
  return Math.min(money, Math.max(50, Math.round(money * 0.15)));
}

export function formatMoney(value: number): string {
  /* Fixed grouping (1.250), independent of the device locale data. */
  const n = Math.round(value);
  const digits = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `€ ${n < 0 ? '-' : ''}${digits}`;
}

export function formatClock(hours: number): string {
  const h = Math.floor(((hours % 24) + 24) % 24);
  const m = Math.floor((hours % 1) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
