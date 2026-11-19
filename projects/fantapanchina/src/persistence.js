/* ============================================================================
   Persistenza versionata: salvataggio, migrazione v1 -> v2, progresso offline.
   ============================================================================ */
import { SAVE_KEY, SAVE_VERSION, MAX_OFFLINE_H } from './config.js';

export function loadRaw() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

export function migrate(data) {
  if (!data) return null;
  if (data.version === SAVE_VERSION) return data;
  // vecchio salvataggio v1 (chiavi piatte, senza versione)
  if (!data.version) {
    return {
      version: SAVE_VERSION,
      fc: data.fc || 0,
      totalFc: data.totalFc || data.fc || 0,
      fp: data.fp || 0,
      totalFp: data.totalFp || data.fp || 0,
      giornata: data.giornata || 0,
      lastGiornataTime: data.lastGiornataTime || Date.now(),
      players: data.players || [],
      mercato: data.mercato || [],
      upgrades: data.upgrades || {},
      scudetti: data.scudetti || 0,
      scudettiDoro: data.scudettiDoro || 0,
      classifica: data.classifica || [],
      formation: data.format || '4-3-3',
      feed: data.feed || [],
      tapCombo: 0,
      lastTap: 0,
      stats: { taps:0, goals:0, wins:0, buys:0, upgrades:0, prestiges:0 },
      quests: {},
      achievements: [],
      settings: { sound:true, motion:true, theme:'neon' }
    };
  }
  return null;
}

export function save(state) {
  try {
    const data = Object.assign({}, state, { version: SAVE_VERSION, savedAt: Date.now() });
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) { /* storage pieno/disabilitato */ }
}

export function clear() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

export function offlineReport(state, now) {
  const last = state.lastGiornataTime || now;
  const elapsed = Math.max(0, now - last);
  const cap = MAX_OFFLINE_H * 3600000;
  const capped = Math.min(elapsed, cap);
  const giornate = Math.floor(capped / 180000);
  return { elapsed, capped, giornate, wasCapped: elapsed > cap };
}
