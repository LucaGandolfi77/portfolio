import type { GameState, StateSnapshot } from '../game/GameState';

const PREFIX = 'afterdusk.v1.save.';
const SETTINGS_KEY = 'afterdusk.v1.settings';
export const SLOTS = ['slot1', 'slot2', 'slot3'];

export interface SlotInfo { slot: string; data: StateSnapshot | null }

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; }
  catch { return null; }
}

export class SaveSystem {
  list(): SlotInfo[] {
    return SLOTS.map((slot) => ({ slot, data: safeParse<StateSnapshot>(localStorage.getItem(PREFIX + slot)) }));
  }

  save(state: GameState, slot: string, label = 'Autosave'): boolean {
    if (!SLOTS.includes(slot)) return false;
    try {
      localStorage.setItem(PREFIX + slot, JSON.stringify(state.snapshot(label)));
      return true;
    } catch {
      return false;
    }
  }

  load(slot: string): StateSnapshot | null {
    const data = safeParse<StateSnapshot>(localStorage.getItem(PREFIX + slot));
    return data && (data.version === 1 || data.version === 2) ? data : null;
  }

  delete(slot: string) { localStorage.removeItem(PREFIX + slot); }

  saveSettings(settings: Record<string, unknown>) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* private mode */ }
  }

  loadSettings(): Record<string, unknown> | null {
    return safeParse<Record<string, unknown>>(localStorage.getItem(SETTINGS_KEY));
  }
}
