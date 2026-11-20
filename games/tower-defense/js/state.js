/* Stato di gioco condiviso e persistenza locale */

import { MODES } from './config.js';

export const state = {
  mode: 'campaign',
  running: false,
  paused: false,
  gameOver: false,
  victory: false,

  lives: 0,
  money: 0,
  wave: 0,
  score: 0,
  kills: 0,
  elapsed: 0,
  leaked: 0,

  enemies: [],
  towers: [],
  projectiles: [],
  particles: [],
  floaters: [],
  beams: [],

  spawnQueue: [],
  spawnTimer: 0,
  waveTotal: 0,
  isWaveActive: false,

  selectedTowerType: null,
  selectedTower: null,
  speed: 1,
  shake: 0,
  hoverX: -999,
  hoverY: -999,
  hoverInside: false,

  modeConfig: MODES.campaign,
  lastWaveBonus: 0
};

export function resetState(modeId) {
  const mode = MODES[modeId] || MODES.campaign;
  state.mode = mode.id;
  state.modeConfig = mode;
  state.running = true;
  state.paused = false;
  state.gameOver = false;
  state.victory = false;
  state.lives = mode.lives;
  state.money = mode.money;
  state.wave = 0;
  state.score = 0;
  state.kills = 0;
  state.elapsed = 0;
  state.leaked = 0;
  state.enemies = [];
  state.towers = [];
  state.projectiles = [];
  state.particles = [];
  state.floaters = [];
  state.beams = [];
  state.spawnQueue = [];
  state.spawnTimer = 0;
  state.waveTotal = 0;
  state.isWaveActive = false;
  state.selectedTowerType = null;
  state.selectedTower = null;
  state.speed = 1;
  state.shake = 0;
  state.lastWaveBonus = 0;
}

export function addFloater(x, y, text, color, size) {
  state.floaters.push({ x, y, text, color: color || '#fff', size: size || 13, life: 900, maxLife: 900 });
  if (state.floaters.length > 60) state.floaters.shift();
}

export function addParticles(x, y, color, count, power) {
  const n = count || 8;
  const p = power || 90;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = p * (0.35 + Math.random() * 0.75);
    state.particles.push({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      life: 380 + Math.random() * 320,
      maxLife: 700,
      color,
      size: 1.5 + Math.random() * 2.5
    });
  }
  if (state.particles.length > 400) state.particles.splice(0, state.particles.length - 400);
}

/* ---------------- Persistenza ---------------- */

const KEY_RECORDS = 'td_records_v2';
const KEY_SETTINGS = 'td_settings_v2';

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}

function safeWrite(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
}

export function getRecords() {
  const data = safeRead(KEY_RECORDS, {});
  return data && typeof data === 'object' ? data : {};
}

export function getModeRecord(modeId) {
  return getRecords()[modeId] || null;
}

export function saveRecord(modeId, record) {
  const all = getRecords();
  const prev = all[modeId] || { bestWave: 0, bestScore: 0, bestTimeMs: 0 };
  const next = {
    bestWave: Math.max(prev.bestWave || 0, record.wave || 0),
    bestScore: Math.max(prev.bestScore || 0, record.score || 0),
    bestTimeMs: record.timeMs
      ? (prev.bestTimeMs ? Math.min(prev.bestTimeMs, record.timeMs) : record.timeMs)
      : (prev.bestTimeMs || 0),
    victories: (prev.victories || 0) + (record.victory ? 1 : 0),
    games: (prev.games || 0) + 1
  };
  all[modeId] = next;
  safeWrite(KEY_RECORDS, all);
  return {
    isNewScore: (record.score || 0) > (prev.bestScore || 0),
    isNewWave: (record.wave || 0) > (prev.bestWave || 0),
    record: next
  };
}

export function getSettings() {
  return Object.assign({ sound: true, reducedMotion: false }, safeRead(KEY_SETTINGS, {}));
}

export function setSetting(key, value) {
  const all = getSettings();
  all[key] = value;
  safeWrite(KEY_SETTINGS, all);
}
