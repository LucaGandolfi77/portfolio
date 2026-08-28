// ═══════════════════════════════════════════════════════════════
// BLACKHOLE ORBIT — Salvataggio (localStorage)
// Account e mondo condiviso persistono tra sessioni.
// Fix clone originale: niente Infinity nei salvataggi (corrompevano il JSON).
// ═══════════════════════════════════════════════════════════════

var SAVE = {};

SAVE.LS_ACCOUNTS = 'blackhole_accounts';
SAVE.LS_WORLD = 'blackhole_world';

SAVE.rawGet = function (key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
};
SAVE.rawSet = function (key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
};

// --- Account -----------------------------------------------------------------
SAVE.defaultAccount = function (name) {
  return {
    name: name,
    credits: 3000,
    voidium: 20,
    ship: 'icarus',
    owned: {
      ship: ['icarus'],
      laser: ['laser1'],
      shield: ['shield1'],
      gen: ['gen1'],
      batt: ['batt1'],
      eng: ['eng1']
    },
    slots: ['laser1', 'shield1', 'gen1'],
    x: DATA.BASE.x,
    y: DATA.BASE.y,
    vx: 0, vy: 0,
    angle: 0,
    hp: DATA.SHIPS.icarus.maxHp,
    shieldHp: DATA.BASE_STATS.shield,
    energy: DATA.BASE_STATS.energy,
    kills: 0,
    admin: (name.toLowerCase() === DATA.ADMIN_NAME),
    ammo: 'red',
    ammoCounts: { red: DATA.AMMO_START, blue: 0, green: 0, white: 0 },
    ep: 0,
    level: 1,
    honor: 0,
    config: 'assalto',
    ores: SAVE.emptyOres(),
    skylab: { level: 0, recipe: 'umbridium', lastTick: Date.now() },
    drone: null,
    mission: null,
    missionBoard: null,
    gateParts: 0,
    gate: null,
    boosters: { danno: 0, scudo: 0, velocita: 0, mining: 0 }
  };
};

SAVE.emptyOres = function () {
  var o = {}, k;
  for (k in DATA.ORES) if (DATA.ORES.hasOwnProperty(k)) o[k] = 0;
  return o;
};

SAVE.moduleOf = function (key) {
  if (DATA.LASERS[key]) return 'laser';
  if (DATA.SHIELDS[key]) return 'shield';
  if (DATA.GENERATORS[key]) return 'gen';
  if (DATA.BATTERIES[key]) return 'batt';
  if (DATA.ENGINES[key]) return 'eng';
  return null;
};

SAVE.SLOT_ORDER = ['laser', 'shield', 'gen', 'batt', 'eng'];

SAVE.resizeSlots = function (acc) {
  var n = DATA.SHIPS[acc.ship].slots;
  if (!Array.isArray(acc.slots)) acc.slots = [];
  if (acc.slots.length > n) acc.slots.length = n;
  var i;
  for (i = acc.slots.length; i < n; i++) {
    var filled = false;
    for (var j = 0; j < SAVE.SLOT_ORDER.length && !filled; j++) {
      var cat = SAVE.SLOT_ORDER[j];
      var owned = (acc.owned && acc.owned[cat]) || [];
      for (var k = 0; k < owned.length && !filled; k++) {
        if (acc.slots.indexOf(owned[k]) < 0) { acc.slots.push(owned[k]); filled = true; }
      }
    }
    if (!filled) acc.slots.push('');
  }
};

SAVE.ensureFields = function (acc) {
  if (typeof acc !== 'object' || !acc) return acc;
  if (!acc.ammo || !DATA.AMMO[acc.ammo]) acc.ammo = 'red';
  if (!acc.ammoCounts) acc.ammoCounts = { red: DATA.AMMO_START, blue: 0, green: 0, white: 0 };
  var ak;
  for (ak in DATA.AMMO) if (DATA.AMMO.hasOwnProperty(ak)) {
    if (typeof acc.ammoCounts[ak] !== 'number') acc.ammoCounts[ak] = 0;
  }
  if (acc.vx === undefined) acc.vx = 0;
  if (acc.vy === undefined) acc.vy = 0;
  if (acc.angle === undefined) acc.angle = 0;
  if (acc.ep === undefined) acc.ep = 0;
  if (acc.level === undefined || !acc.level) acc.level = 1;
  if (acc.honor === undefined) acc.honor = 0;
  if (!acc.config || !DATA.CONFIGS[acc.config]) acc.config = 'assalto';
  if (!acc.ores) acc.ores = SAVE.emptyOres();
  var k;
  for (k in DATA.ORES) if (DATA.ORES.hasOwnProperty(k)) { if (acc.ores[k] === undefined) acc.ores[k] = 0; }
  if (!acc.skylab) acc.skylab = { level: 0, recipe: 'umbridium', lastTick: Date.now() };
  if (!acc.skylab.recipe || !DATA.RECIPES[acc.skylab.recipe]) acc.skylab.recipe = 'umbridium';
  if (acc.skylab.lastTick === undefined) acc.skylab.lastTick = Date.now();
  if (acc.drone === undefined) acc.drone = null;
  if (acc.mission === undefined) acc.mission = null;
  if (acc.missionBoard === undefined) acc.missionBoard = null;
  if (acc.gateParts === undefined) acc.gateParts = 0;
  if (acc.gate === undefined) acc.gate = null;
  if (!acc.boosters) acc.boosters = { danno: 0, scudo: 0, velocita: 0, mining: 0 };
  var bk;
  for (bk in DATA.BOOSTERS) if (DATA.BOOSTERS.hasOwnProperty(bk)) { if (acc.boosters[bk] === undefined) acc.boosters[bk] = 0; }

  // FIX: ripara salvataggi corrotti da Infinity/NaN (bug del vecchio clone)
  ['credits', 'voidium'].forEach(function (f) {
    if (!isFinite(acc[f])) acc[f] = acc.admin ? DATA.ADMIN_CAP : 0;
  });
  if (acc.admin) {
    acc.credits = Math.min(acc.credits, DATA.ADMIN_CAP);
    acc.voidium = Math.min(acc.voidium, DATA.ADMIN_CAP);
  }

  // migrazione dal vecchio modello a moduli singoli
  if (!acc.owned) {
    acc.owned = { ship: [acc.ship || 'icarus'], laser: [], shield: [], gen: [], batt: [], eng: [] };
    if (acc.laser) acc.owned.laser.push(acc.laser);
    if (acc.shield) acc.owned.shield.push(acc.shield);
    if (acc.gen) acc.owned.gen.push(acc.gen);
    if (acc.batt) acc.owned.batt.push(acc.batt);
    if (acc.eng) acc.owned.eng.push(acc.eng);
    acc.slots = [];
    SAVE.resizeSlots(acc);
  }
  // migrazione nomi vecchi del clone → nuovi nomi BlackHoleOrbit
  var SHIP_MAP = { phoenix: 'icarus', yamato: 'halcyon', vengeance: 'vortex', goliath: 'titan', nemesis: 'singularity' };
  if (!DATA.SHIPS[acc.ship] && SHIP_MAP[acc.ship]) acc.ship = SHIP_MAP[acc.ship];
  if (!DATA.SHIPS[acc.ship]) acc.ship = 'icarus';
  if (!acc.owned.ship) acc.owned.ship = [acc.ship];
  SAVE.resizeSlots(acc);
  return acc;
};

SAVE.getAccounts = function () {
  var a = SAVE.rawGet(SAVE.LS_ACCOUNTS);
  return (a && typeof a === 'object') ? a : {};
};

SAVE.listAccounts = function () {
  var all = SAVE.getAccounts(), out = [], k;
  for (k in all) if (all.hasOwnProperty(k)) out.push(k);
  return out.sort();
};

SAVE.loadAccount = function (name) {
  var all = SAVE.getAccounts();
  var acc = all[name];
  if (!acc && name === DATA.ADMIN_NAME) {
    // migrazione: account "Admin"/"ADMIN" creati prima della normalizzazione case-insensitive
    var k;
    for (k in all) {
      if (all.hasOwnProperty(k) && k.toLowerCase() === DATA.ADMIN_NAME) {
        acc = all[k];
        delete all[k];
        break;
      }
    }
    if (acc) { acc.name = DATA.ADMIN_NAME; all[DATA.ADMIN_NAME] = acc; SAVE.rawSet(SAVE.LS_ACCOUNTS, all); }
  }
  if (!acc) { acc = SAVE.defaultAccount(name); all[name] = acc; SAVE.rawSet(SAVE.LS_ACCOUNTS, all); }
  else acc.admin = (name.toLowerCase() === DATA.ADMIN_NAME);
  SAVE.ensureFields(acc);
  return acc;
};

SAVE.saveAccount = function (acc) {
  var all = SAVE.getAccounts();
  all[acc.name] = acc;
  SAVE.rawSet(SAVE.LS_ACCOUNTS, all);
};

SAVE.deleteAccount = function (name) {
  var all = SAVE.getAccounts();
  delete all[name];
  SAVE.rawSet(SAVE.LS_ACCOUNTS, all);
};

// --- Mondo condiviso -----------------------------------------------------------
// Persistenza REALE: asteroidi (risorsa residua / vita / respawn) e NPC
// (vivo / timer di respawn) vengono riscritti dal runtime ad ogni autosave.
SAVE.loadWorld = function () {
  return SAVE.rawGet(SAVE.LS_WORLD);
};
SAVE.saveWorld = function (w) {
  SAVE.rawSet(SAVE.LS_WORLD, w);
};
