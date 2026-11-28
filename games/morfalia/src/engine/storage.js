/* ===== MORFALIA · LocalStorage Save/Load & Export ===== */
import { MAP_W, MAP_H } from '../data/config.js';

const SAVE_KEY = 'morfalia_save_v1';

function migrateState(data) {
  if (!data || !data.regions) return data;
  const baseByReg = { landa: 'withered', costa: 'ash', creste: 'rock', foresta: 'withered', isole: 'crystal_floor' };
  for (const [rid, reg] of Object.entries(data.regions)) {
    if (!reg || !Array.isArray(reg.tiles)) continue;
    const oldH = reg.tiles.length;
    const oldW = reg.tiles[0]?.length || 0;
    if (oldH < MAP_H || oldW < MAP_W) {
      const fill = baseByReg[rid] || 'withered';
      const newTiles = Array.from({ length: MAP_H }, (_, y) =>
        Array.from({ length: MAP_W }, (_, x) => (y < oldH && x < oldW ? reg.tiles[y][x] : (rid === 'isole' && (x <= 3 || x >= MAP_W - 4 || y <= 2 || y >= MAP_H - 3) ? 'water' : fill)))
      );
      reg.tiles = newTiles;
    }
  }
  return data;
}

export function hasSave() {
  try {
    return !!localStorage.getItem(SAVE_KEY);
  } catch {
    return false;
  }
}

export function getSaveSummary() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      chapter: data.chapter || 1,
      day: data.day || 1,
      befriended: (data.befriended || []).length,
      habitats: (data.discoveredHabitats || []).length,
      regionId: data.currentRegion || 'landa',
      savedAt: data.savedAt || Date.now()
    };
  } catch {
    return null;
  }
}

export function saveGame(state) {
  try {
    const payload = {
      ...state,
      savedAt: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('Morfalia save error:', err);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return migrateState(JSON.parse(raw));
  } catch (err) {
    console.warn('Morfalia load error:', err);
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}

export function exportSaveString(state) {
  return JSON.stringify(state);
}

export function importSaveString(str) {
  const parsed = JSON.parse(str);
  if (!parsed || !parsed.regions || !parsed.player) {
    throw new Error('Formato salvataggio non valido');
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
  return parsed;
}
