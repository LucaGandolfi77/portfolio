/* Tower Defense — configurazione centrale (nessuna dipendenza esterna) */

export const VIEW_W = 960;
export const VIEW_H = 600;
export const PATH_WIDTH = 46;
export const BUILD_MARGIN = 18;

/* Percorso normalizzato: l'entrata e' fuori schermo a sinistra, l'uscita a destra. */
export const PATH_NORM = [
  { x: -0.02, y: 0.18 },
  { x: 0.20, y: 0.18 },
  { x: 0.20, y: 0.80 },
  { x: 0.50, y: 0.80 },
  { x: 0.50, y: 0.18 },
  { x: 0.79, y: 0.18 },
  { x: 0.79, y: 0.82 },
  { x: 1.02, y: 0.82 }
];

export const PATH = PATH_NORM.map(p => ({ x: p.x * VIEW_W, y: p.y * VIEW_H }));

/*Torri */
export const TOWER_ORDER = ['basic', 'sniper', 'rapid', 'frost', 'cannon', 'laser', 'tesla'];

export const TOWERS = {
  basic: {
    id: 'basic', cost: 50, range: 108, damage: 18, rate: 560,
    color: '#38bdf8', accent: '#e0f2fe', projectileSpeed: 560,
    glyph: '◆', kind: 'bullet', unlockWave: 0
  },
  sniper: {
    id: 'sniper', cost: 110, range: 265, damage: 96, rate: 1900,
    color: '#e879f9', accent: '#fae8ff', projectileSpeed: 980,
    glyph: '✦', kind: 'bullet', unlockWave: 0
  },
  rapid: {
    id: 'rapid', cost: 140, range: 98, damage: 7, rate: 110,
    color: '#facc15', accent: '#fef9c3', projectileSpeed: 680,
    glyph: '⚡', kind: 'bullet', unlockWave: 0
  },
  frost: {
    id: 'frost', cost: 120, range: 116, damage: 11, rate: 720,
    color: '#7dd3fc', accent: '#f0f9ff', projectileSpeed: 520,
    glyph: '❄', kind: 'slow', slowFactor: 0.48, slowTime: 950, unlockWave: 2
  },
  cannon: {
    id: 'cannon', cost: 185, range: 128, damage: 46, rate: 1450,
    color: '#fb923c', accent: '#ffedd5', projectileSpeed: 430,
    glyph: '✹', kind: 'splash', splash: 64, unlockWave: 3
  },
  laser: {
    id: 'laser', cost: 225, range: 152, damage: 135, rate: 0,
    color: '#fb7185', accent: '#ffe4e6', projectileSpeed: 0,
    glyph: '➤', kind: 'beam', unlockWave: 4
  },
  tesla: {
    id: 'tesla', cost: 205, range: 134, damage: 28, rate: 920,
    color: '#a78bfa', accent: '#ede9fe', projectileSpeed: 0,
    glyph: '⌁', kind: 'chain', chains: 3, unlockWave: 5
  }
};

/* Nemici */
export const ENEMIES = {
  normal:  { hp: 24,  speed: 54,  reward: 8,   radius: 11, color: '#ef4444', shape: 'circle',   cost: 1, armor: 0 },
  fast:    { hp: 19,  speed: 100, reward: 11,  radius: 8,  color: '#fb923c', shape: 'circle',   cost: 2, armor: 0 },
  scout:   { hp: 14,  speed: 118, reward: 9,   radius: 8,  color: '#22d3ee', shape: 'triangle', cost: 2, armor: 0 },
  tank:    { hp: 96,  speed: 31,  reward: 23,  radius: 15, color: '#a855f7', shape: 'circle',   cost: 4, armor: 0.10 },
  armored: { hp: 68,  speed: 39,  reward: 21,  radius: 13, color: '#94a3b8', shape: 'square',   cost: 4, armor: 0.35 },
  swarmer: { hp: 9,   speed: 126, reward: 4,   radius: 6,  color: '#facc15', shape: 'diamond',  cost: 1, armor: 0 },
  shield:  { hp: 58,  speed: 45,  reward: 26,  radius: 13, color: '#60a5fa', shape: 'hexagon',  cost: 5, armor: 0, shield: 62 },
  medic:   { hp: 48,  speed: 46,  reward: 28,  radius: 11, color: '#34d399', shape: 'cross',    cost: 5, armor: 0, heal: 7 },
  boss:    { hp: 540, speed: 25,  reward: 145, radius: 23, color: '#dc2626', shape: 'circle',   cost: 0, armor: 0.22, boss: true }
};

export const ENEMY_UNLOCKS = [
  { key: 'normal', wave: 1 }, { key: 'fast', wave: 2 }, { key: 'scout', wave: 3 },
  { key: 'tank', wave: 4 }, { key: 'armored', wave: 5 }, { key: 'swarmer', wave: 6 },
  { key: 'shield', wave: 7 }, { key: 'medic', wave: 8 }
];

/* Modalita' di gioco */
export const MODES = {
  campaign: {
    id: 'campaign', lives: 20, money: 165, hpScale: 1, hpGrowth: 0.16,
    rewardScale: 1, waveCap: 0, bossEvery: 5, unlimitedMoney: false,
    noLose: false, speedScale: 1, spawnScale: 1
  },
  endless: {
    id: 'endless', lives: 15, money: 150, hpScale: 1, hpGrowth: 0.23,
    rewardScale: 1.1, waveCap: 0, bossEvery: 5, unlimitedMoney: false,
    noLose: false, speedScale: 1.08, spawnScale: 0.88
  },
  challenge: {
    id: 'challenge', lives: 20, money: 185, hpScale: 0.95, hpGrowth: 0.17,
    rewardScale: 1.05, waveCap: 20, bossEvery: 5, unlimitedMoney: false,
    noLose: false, speedScale: 1, spawnScale: 1
  },
  hardcore: {
    id: 'hardcore', lives: 5, money: 105, hpScale: 1.4, hpGrowth: 0.2,
    rewardScale: 2, waveCap: 0, bossEvery: 4, unlimitedMoney: false,
    noLose: false, speedScale: 1.12, spawnScale: 0.85
  },
  sandbox: {
    id: 'sandbox', lives: 9999, money: 99999, hpScale: 1, hpGrowth: 0.12,
    rewardScale: 1, waveCap: 0, bossEvery: 5, unlimitedMoney: true,
    noLose: true, speedScale: 1, spawnScale: 1
  }
};

export const MODE_ORDER = ['campaign', 'endless', 'challenge', 'hardcore', 'sandbox'];

export const TARGETING = ['close', 'first', 'strong'];

export function upgradeCost(tower) {
  return Math.floor(tower.baseCost * 0.6 * Math.pow(tower.level, 1.35));
}

export function sellValue(tower) {
  return Math.floor(tower.invested * 0.6);
}

export function maxLevel(tower) {
  return 8;
}
