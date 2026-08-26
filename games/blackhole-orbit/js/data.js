// ═══════════════════════════════════════════════════════════════
// BLACKHOLE ORBIT — Dati di gioco
// Lingua: italiano. Valute: Crediti Stellari (CS) e Voidium (VD).
// Ambientazione: sistema orbitante attorno a un buco nero massiccio.
// ═══════════════════════════════════════════════════════════════

var DATA = {};

// --- Mappa ---------------------------------------------------------------
DATA.WORLD_W = 3000;
DATA.WORLD_H = 2400;
DATA.BASE = { x: 260, y: 2140 };            // Stazione Base in Periferia

// Buco nero centrale: gravità + orizzonte degli eventi letale.
DATA.BLACKHOLE = {
  x: 1500, y: 1200,
  horizon: 110,          // raggio dell'orizzonte degli eventi (morte istantanea)
  pull: 52000,           // intensità della forza gravitazionale
  falloff: 620,          // raggio oltre il quale la gravità è trascurabile
  spinSpeed: 0.25        // velocità visiva del disco d'accrescimento
};

// Orbite (zone rettangolari con nome) — il livello è un permesso geografico.
DATA.SECTORS = [
  { name: 'Orbita Periferia',        x0: 0,    y0: 0,    x1: 1500, y1: 1200, reqLevel: 1, tierMin: 0, tierMax: 1, ores: ['umbrium','umbrium','umbrium','chronite','chronite','gravitite'] },
  { name: 'Disco d\'Accrescimento', x0: 1500, y0: 0,    x1: 3000, y1: 1200, reqLevel: 3, tierMin: 1, tierMax: 3, ores: ['chronite','chronite','gravitite','gravitite','umbridium','chronid'] },
  { name: 'Sfera dei Foton',        x0: 0,    y0: 1200, x1: 1500, y1: 2400, reqLevel: 5, tierMin: 3, tierMax: 5, ores: ['umbridium','umbridium','chronid','chronid','eventrium','horizonium'] },
  { name: 'Orizzonte degli Eventi', x0: 1500, y0: 1200, x1: 3000, y1: 2400, reqLevel: 8, tierMin: 5, tierMax: 6, ores: ['eventrium','eventrium','horizonium','horizonium','horizonium','nullium'] }
];

// --- Navi -----------------------------------------------------------------
DATA.SHIPS = {
  icarus:      { name: 'Icarus',      maxHp: 100, speed: 140, size: 18, slots: 3, color: '#4fd6ff', cost: 0,      voidium: 0 },
  halcyon:     { name: 'Halcyon',     maxHp: 160, speed: 155, size: 19, slots: 4, color: '#6ee7a0', cost: 20000,  voidium: 0 },
  vortex:      { name: 'Vortex',      maxHp: 220, speed: 170, size: 20, slots: 5, color: '#f07a7a', cost: 60000,  voidium: 40 },
  titan:       { name: 'Titan',       maxHp: 320, speed: 180, size: 22, slots: 7, color: '#c58bff', cost: 150000, voidium: 150 },
  singularity: { name: 'Singularity', maxHp: 430, speed: 195, size: 24, slots: 9, color: '#ffd54a', cost: 350000, voidium: 500 }
};

DATA.BASE_STATS = {
  shield: 30,
  shieldRegen: 2,
  energy: 60,
  energyRegen: 6
};

// --- Laser ------------------------------------------------------------------
DATA.LASERS = {
  laser1: { name: 'Laser LC-1',   dmg: 12, rate: 2.2, range: 260, cost: 0,      voidium: 0 },
  laser2: { name: 'Laser LC-2',   dmg: 22, rate: 2.4, range: 280, cost: 12000,  voidium: 0 },
  laser3: { name: 'Laser LCB-10', dmg: 38, rate: 2.6, range: 300, cost: 45000,  voidium: 20 },
  laser4: { name: 'Laser LCB-20', dmg: 60, rate: 2.8, range: 320, cost: 120000, voidium: 80 },
  laser5: { name: 'Laser LF-4',   dmg: 95, rate: 3.0, range: 340, cost: 280000, voidium: 250 }
};

// --- Scudi -------------------------------------------------------------------
DATA.SHIELDS = {
  shield1: { name: 'Scudo SG1-B01', max: 60,  regen: 6,  cost: 0,      voidium: 0 },
  shield2: { name: 'Scudo SG2-B02', max: 120, regen: 10, cost: 15000,  voidium: 0 },
  shield3: { name: 'Scudo SG3-B03', max: 220, regen: 16, cost: 50000,  voidium: 30 },
  shield4: { name: 'Scudo SG4-B04', max: 360, regen: 24, cost: 140000, voidium: 100 },
  shield5: { name: 'Scudo SG5-B05', max: 560, regen: 35, cost: 320000, voidium: 300 }
};

// --- Generatori (energia al secondo) ------------------------------------------
DATA.GENERATORS = {
  gen1: { name: 'Generatore G3N-1', regen: 12, cost: 0,      voidium: 0 },
  gen2: { name: 'Generatore G3N-2', regen: 22, cost: 15000,  voidium: 0 },
  gen3: { name: 'Generatore G3N-3', regen: 35, cost: 50000,  voidium: 30 },
  gen4: { name: 'Generatore G3N-4', regen: 52, cost: 140000, voidium: 100 },
  gen5: { name: 'Generatore G3N-5', regen: 75, cost: 320000, voidium: 300 }
};

// --- Batterie (energia massima) ------------------------------------------------
DATA.BATTERIES = {
  batt1: { name: 'Batteria B4T-1', max: 100, cost: 0,      voidium: 0 },
  batt2: { name: 'Batteria B4T-2', max: 180, cost: 12000,  voidium: 0 },
  batt3: { name: 'Batteria B4T-3', max: 300, cost: 45000,  voidium: 20 },
  batt4: { name: 'Batteria B4T-4', max: 460, cost: 120000, voidium: 80 },
  batt5: { name: 'Batteria B4T-5', max: 680, cost: 280000, voidium: 250 }
};

// --- Propulsori -----------------------------------------------------------------
DATA.ENGINES = {
  eng1: { name: 'Propulsore PR-1', boost: 0,   cost: 0,      voidium: 0 },
  eng2: { name: 'Propulsore PR-2', boost: 18,  cost: 10000,  voidium: 0 },
  eng3: { name: 'Propulsore PR-3', boost: 40,  cost: 40000,  voidium: 20 },
  eng4: { name: 'Propulsore PR-4', boost: 70,  cost: 110000, voidium: 80 },
  eng5: { name: 'Propulsore PR-5', boost: 110, cost: 260000, voidium: 250 }
};

// --- Entità aliene del vuoto ------------------------------------------------------
DATA.NPCS = [
  { name: 'Zerith',   hp: 60,   speed: 55,  dmg: 8,  aggro: 260, range: 200, color: '#e8546a', reward: 200,   voidiumChance: 0.04, size: 16, ep: 8,    honor: 2 },
  { name: 'Kravon',   hp: 110,  speed: 68,  dmg: 15, aggro: 280, range: 220, color: '#ff8a5b', reward: 600,   voidiumChance: 0.08, size: 17, ep: 25,   honor: 5 },
  { name: 'Nyxis',    hp: 180,  speed: 78,  dmg: 24, aggro: 300, range: 240, color: '#d06bff', reward: 1400,  voidiumChance: 0.14, size: 18, ep: 70,   honor: 12 },
  { name: 'Voltrum',  hp: 280,  speed: 86,  dmg: 34, aggro: 320, range: 260, color: '#5be0a0', reward: 3000,  voidiumChance: 0.22, size: 20, ep: 190,  honor: 30 },
  { name: 'Cryolith', hp: 420,  speed: 95,  dmg: 48, aggro: 340, range: 280, color: '#ffd54a', reward: 6000,  voidiumChance: 0.30, size: 22, ep: 480,  honor: 70 },
  { name: 'Gorgath',  hp: 650,  speed: 100, dmg: 65, aggro: 360, range: 300, color: '#7df0ff', reward: 12000, voidiumChance: 0.40, size: 23, ep: 1100, honor: 150 },
  { name: 'Titanox',  hp: 1000, speed: 105, dmg: 85, aggro: 380, range: 320, color: '#ff6ec7', reward: 25000, voidiumChance: 0.50, size: 25, ep: 2600, honor: 350 }
];

// --- Asteroidi ----------------------------------------------------------------------
DATA.ASTEROID_ORE_AMOUNT = 3;
DATA.ASTEROID_VOIDIUM_CHANCE = 0.06;

// Bonus minerario vicino al buco nero (rischio/ricompensa): entro questo raggio
// gli asteroidi contengono risorse extra.
DATA.BH_RICH_RADIUS = 420;

// --- Minerali -------------------------------------------------------------------------
DATA.ORES = {
  umbrium:    { name: 'Umbrium',    tier: 'raw',   value: 10,   color: '#8ae0ff' },
  chronite:   { name: 'Chronite',   tier: 'raw',   value: 15,   color: '#ffb35b' },
  gravitite:  { name: 'Gravitite',  tier: 'raw',   value: 25,   color: '#b9f06a' },
  umbridium:  { name: 'Umbridium',  tier: 'sec',   value: 200,  color: '#7de8f5' },
  chronid:    { name: 'Chronid',    tier: 'sec',   value: 200,  color: '#ff8a9a' },
  eventrium:  { name: 'Eventrium',  tier: 'prime', value: 500,  color: '#ffd54a' },
  horizonium: { name: 'Horizonium', tier: 'prime', value: 750,  color: '#c58bff' },
  nullium:    { name: 'Nullium',    tier: 'adv',   value: 3000, color: '#ffffff' }
};

// --- Ricette di raffinazione -------------------------------------------------------------
DATA.RECIPES = {
  umbridium:  { name: 'Umbridium',  out: 'umbridium',  cost: { umbrium: 3, chronite: 2 } },
  chronid:    { name: 'Chronid',    out: 'chronid',    cost: { chronite: 3, gravitite: 2 } },
  eventrium:  { name: 'Eventrium',  out: 'eventrium',  cost: { umbridium: 3, chronid: 1 } },
  horizonium: { name: 'Horizonium', out: 'horizonium', cost: { chronid: 3, eventrium: 1 } },
  nullium:    { name: 'Nullium',    out: 'nullium',    cost: { horizonium: 3, eventrium: 1 } }
};

// --- Configurazioni nave --------------------------------------------------------------------
DATA.CONFIGS = {
  assalto:  { name: 'ASSALTO',  dmg: 1.20, speed: 0.92, shield: 1.00 },
  velocita: { name: 'VELOCITA', dmg: 0.85, speed: 1.18, shield: 0.92 }
};

// --- Skylab → "Fabbrica Orbitale" --------------------------------------------------------------
DATA.SKYLAB = [
  { name: 'Fabbrica L1', cost: 5000,   rate: 20,  reqLevel: 1 },
  { name: 'Fabbrica L2', cost: 25000,  rate: 45,  reqLevel: 4 },
  { name: 'Fabbrica L3', cost: 80000,  rate: 90,  reqLevel: 8 },
  { name: 'Fabbrica L4', cost: 200000, rate: 160, reqLevel: 12 },
  { name: 'Fabbrica L5', cost: 450000, rate: 260, reqLevel: 16 },
  { name: 'Fabbrica L6', cost: 900000, rate: 400, reqLevel: 20 }
];

// --- Livelli (EP) ---------------------------------------------------------------------------------
DATA.EP_FOR_LEVEL = function (l) { return 10000 * Math.pow(2, l - 1); };

// --- Gradi -------------------------------------------------------------------------------------------
DATA.RANKS = [
  { pts: 0,       title: 'Recluta' },
  { pts: 1000,    title: 'Pilota' },
  { pts: 10000,   title: 'Soldato' },
  { pts: 50000,   title: 'Capitano' },
  { pts: 150000,  title: 'Comandante' },
  { pts: 400000,  title: 'Ammiraglio' }
];

// --- Munizioni (ora CONSUMABILI: pacchetti comprabili al negozio) -------------------------------
DATA.AMMO = {
  red:   { name: 'ROSE',   mult: 1, color: '#ff5b6a', pack: 50,  cost: 400 },
  blue:  { name: 'BLU',    mult: 2, color: '#3f8dff', pack: 40,  cost: 900 },
  green: { name: 'VERDI',  mult: 3, color: '#46e0a0', pack: 30,  cost: 1800 },
  white: { name: 'BIANCHE',mult: 4, color: '#ffffff', pack: 25,  cost: 3500 }
};
DATA.AMMO_START = 120;   // munizioni rosse gratuite alla creazione dell'account

// Costo in energia per colpo di laser (il boost consuma energia a parte)
DATA.ENERGY_PER_SHOT = 2;
DATA.BOOST_ENERGY_PER_SEC = 9;

// --- Droni -----------------------------------------------------------------------------------------
DATA.DRONES = {
  drone1: { name: 'Drone E-1', dmg: 8,  rate: 1.6, range: 260, cost: 8000,   voidium: 0,   color: '#46e0a0' },
  drone2: { name: 'Drone E-2', dmg: 18, rate: 2.0, range: 300, cost: 40000,  voidium: 20,  color: '#7de8f5' },
  drone3: { name: 'Drone E-3', dmg: 40, rate: 2.4, range: 340, cost: 150000, voidium: 120, color: '#ffd54a' },
  drone4: { name: 'Drone X-4', dmg: 95, rate: 2.8, range: 380, cost: 450000, voidium: 400, color: '#ff6ec7' }
};

// --- Missioni ----------------------------------------------------------------------------------------
DATA.MISSION_POOL = [
  { type: 'kill',    gen: { tier: null,           n: [3, 5] } },
  { type: 'kill',    gen: { tier: [0, 2],         n: [4, 7] } },
  { type: 'kill',    gen: { tier: [2, 5],         n: [3, 6] } },
  { type: 'collect', gen: { oreTier: 'raw',       n: [6, 10] } },
  { type: 'collect', gen: { oreTier: 'sec',       n: [3, 5] } },
  { type: 'collect', gen: { oreTier: 'prime',     n: [2, 4] } },
  { type: 'reach',   gen: {} },
  { type: 'survive', gen: { secs: [25, 50] } }
];

DATA.NPC_TIER_RANGE = function (level) {
  if (level >= 10) return [2, 6];
  if (level >= 6) return [1, 5];
  if (level >= 3) return [0, 3];
  return [0, 2];
};

// --- La Frattura (ex Galaxy Gate) ------------------------------------------------------------
DATA.GATE = {
  reqLevel: 8,
  arena: { x0: 2400, y0: 1800, x1: 2950, y1: 2350 },
  portal: { x: 2700, y: 2075 },
  waves: 5,
  boss: {
    name: 'SINGULARITAS · Custode dell\'Orizzonte',
    short: 'SINGULARITAS',
    hp: 2500, speed: 88, dmg: 90,
    aggro: 420, range: 340, color: '#ff2d4d', size: 30, reward: 40000,
    voidiumChance: 1
  }
};

DATA.GATE_TIERS = function (level) {
  if (level >= 14) return [3, 6];
  if (level >= 9) return [2, 5];
  if (level >= 6) return [1, 4];
  return [0, 3];
};

DATA.GATE_REWARD = function (level) {
  return {
    credits: 2500 + level * 1500,
    voidium: 15 + level * 4,
    ep: 1500 * level,
    honor: 80 * level,
    parts: 2 + Math.floor(level / 6)
  };
};

// --- Evento Boss periodico nell'Orizzonte degli Eventi ---------------------------------------
// Ogni BOSS_EVENT.interval ms spawna un mini-boss annunciato a tutti.
DATA.BOSS_EVENT = {
  interval: 240000,                 // ogni 4 minuti di gioco
  announceRadius: 99999,            // annuncio globale
  count: 2,                         // quanti mini-boss spawnare
  stats: {
    name: 'Arconte del Vuoto',
    hp: 900, speed: 92, dmg: 55,
    aggro: 500, range: 300, color: '#b388ff', size: 26,
    reward: 15000, voidiumChance: 0.9, ep: 3200, honor: 420
  }
};

// --- Booster ------------------------------------------------------------------------------------
DATA.BOOSTERS = {
  danno:     { name: 'Booster DANNO',    voidium: 25, dur: 10 * 3600 * 1000, color: '#ff5b6a', desc: '+25% danno per 10 ore' },
  scudo:     { name: 'Booster SCUDO',    voidium: 20, dur: 10 * 3600 * 1000, color: '#2fd3ff', desc: '+40% scudo massimo per 10 ore' },
  velocita:  { name: 'Booster VELOCITA', voidium: 15, dur: 10 * 3600 * 1000, color: '#46e0a0', desc: '+25% velocità per 10 ore' },
  mining:    { name: 'Booster MINING',   voidium: 15, dur: 10 * 3600 * 1000, color: '#ffd54a', desc: '+50% minerali estratti per 10 ore' }
};

// --- Kit consumabili ------------------------------------------------------------------------------
DATA.KITS = {
  repair: { name: 'Kit riparazione scafo', cost: 2000, desc: 'Ripara il 60% dello scafo' },
  shield: { name: 'Ricarica scudo',        cost: 1500, desc: 'Riporta lo scudo al massimo' },
  energy: { name: 'Ricaricatore energia',  cost: 800,  desc: 'Riporta l\'energia al massimo' }
};

DATA.ADMIN_NAME = 'admin';

// Cap delle risorse admin: evita Infinity nel localStorage (bug del clone originale)
DATA.ADMIN_CAP = 999999999;
