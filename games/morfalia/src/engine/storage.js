/* ===== MORFALIA · LocalStorage Save/Load & Export ===== */

const SAVE_KEY = 'morfalia_save_v1';

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
    return JSON.parse(raw);
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
