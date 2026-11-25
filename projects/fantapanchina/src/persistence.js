/* ============================================================================
   Persistenza versionata: salvataggio, migrazione v1/v2 -> v3, report offline.
   ============================================================================ */
import {
  SAVE_KEY, SAVE_VERSION, MAX_OFFLINE_H, CHEST_FREE_MS, TEAMS_AI
} from './config.js';

export function loadRaw() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function statsBase(stats) {
  return Object.assign({
    taps: 0, goals: 0, wins: 0, buys: 0, upgrades: 0, prestiges: 0,
    chestsOpened: 0, chestsBought: 0, cardsFound: 0, trades: 0, level5: 0
  }, stats || {});
}

function ensureClassifica(classifica) {
  if (Array.isArray(classifica) && classifica.length) return classifica;
  return [{ id:'user', name:'La Mia Squadra', emoji:'🛋️', fp:0, color:'#3ee6ff', form:[] }]
    .concat(TEAMS_AI.map(t => ({
      id:t.id, name:t.name, emoji:t.emoji, fp:0, color:t.color, form:[]
    })));
}

/** Normalizza qualsiasi salvataggio alla forma v3, senza perdere progressi. */
function normalize(data) {
  const now = Date.now();
  const out = Object.assign({}, data);
  out.version = SAVE_VERSION;
  out.fc = Number(out.fc) || 0;
  out.totalFc = Number(out.totalFc) || out.fc;
  out.fp = Number(out.fp) || 0;
  out.totalFp = Number(out.totalFp) || out.fp;
  out.giornata = Number(out.giornata) || 0;
  out.lastGiornataTime = Number(out.lastGiornataTime) || now;
  out.players = Array.isArray(out.players) ? out.players : [];
  out.mercato = Array.isArray(out.mercato) ? out.mercato : [];
  out.upgrades = out.upgrades && typeof out.upgrades === 'object' ? out.upgrades : {};
  out.scudetti = Number(out.scudetti) || 0;
  out.scudettiDoro = Number(out.scudettiDoro) || 0;
  out.classifica = ensureClassifica(out.classifica);
  out.formation = out.formation || out.format || '4-3-3';
  out.feed = Array.isArray(out.feed) ? out.feed : [];
  out.tapCombo = Number(out.tapCombo) || 0;
  out.lastTap = Number(out.lastTap) || 0;

  out.cards = out.cards && typeof out.cards === 'object' ? out.cards : {};
  Object.keys(out.cards).forEach(id => {
    const card = out.cards[id];
    if (!card || typeof card !== 'object') { delete out.cards[id]; return; }
    card.copies = Math.max(1, Math.floor(Number(card.copies) || 1));
    card.found = Math.max(card.copies, Math.floor(Number(card.found) || card.copies));
  });

  out.chests = Array.isArray(out.chests)
    ? out.chests.filter(c => c && c.tier).slice(0, 4)
    : [];
  out.chests.forEach(c => {
    c.id = c.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
    c.at = Number(c.at) || now;
  });
  out.chestQueue = Array.isArray(out.chestQueue)
    ? out.chestQueue.filter(c => c && c.tier).slice(0, 12)
    : [];
  out.chestNextAt = Number(out.chestNextAt) || now + CHEST_FREE_MS;
  out.chestPausedMs = out.chestPausedMs == null ? null : Math.max(0, Number(out.chestPausedMs) || 0);

  out.merchant = out.merchant && Array.isArray(out.merchant.offers) ? out.merchant : null;
  out.tradeHistory = Array.isArray(out.tradeHistory) ? out.tradeHistory : [];
  out.pity = Object.assign({ epico: 0, leggendario: 0 }, out.pity || {});

  out.stats = statsBase(out.stats);
  out.stats.cardsFound = Object.keys(out.cards).length;
  out.quests = out.quests && typeof out.quests === 'object' ? out.quests : {};
  out.achievements = Array.isArray(out.achievements) ? out.achievements : [];
  out.settings = Object.assign({ sound:true, motion:true, theme:'neon' }, out.settings || {});
  return out;
}

export function migrate(data) {
  if (!data || typeof data !== 'object') return null;

  /* v1: chiavi piatte, senza campo version. */
  if (!data.version) {
    return normalize(Object.assign({}, data, {
      fc: data.fc || 0,
      totalFc: data.totalFc || data.fc || 0,
      fp: data.fp || 0,
      totalFp: data.totalFp || data.fp || 0,
      formation: data.format || '4-3-3',
      players: data.players || [],
      mercato: data.mercato || [],
      upgrades: data.upgrades || {},
      classifica: data.classifica || [],
      feed: data.feed || [],
      cards: {},
      chests: [],
      chestQueue: [],
      stats: statsBase(data.stats),
      quests: {},
      achievements: []
    }));
  }

  /* v2 e v3: la normalizzazione aggiunge i campi mancanti. */
  return normalize(data);
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
