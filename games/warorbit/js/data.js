// ═══════════════════════════════════════════════════════════════
// WAR ORBIT — data (clone of the War Universe product wiki)
// Top-down space MMO, iPhone-first. All content derived from the
// public wiki: waruniverse.notion.site
// ═══════════════════════════════════════════════════════════════

var DATA = {};

// --- factions ---
DATA.FACTIONS = [
  { id: 'solar', name: 'Solar Conglomerate', base: 'R-1', color: '#3b82f6' },
  { id: 'orion', name: 'Orion Empire',       base: 'E-1', color: '#ef4444' },
  { id: 'vega',  name: 'Vega Union',          base: 'U-1', color: '#22c55e' }
];

// --- ships (HP / shield / speed / cargo / slots / cost / level) ---
DATA.SHIPS = {
  shuttle:  { id:'shuttle',  name:'Shuttle',  hp:3000,  shield:1500, speed:170, cargo:60,  slots:2, cost:0,       level:1, color:'#9ca3af', desc:'Your first ship. It is what it is.' },
  veles:    { id:'veles',    name:'Veles',    hp:6000,  shield:2500, speed:160, cargo:90,  slots:3, cost:40000,   level:2, color:'#60a5fa', desc:'Balanced all-rounder.' },
  vostok:   { id:'vostok',   name:'Vostok-M', hp:5000,  shield:2000, speed:230, cargo:70,  slots:3, cost:120000,  level:4, color:'#a78bfa', desc:'Fast, fragile, annoying.' },
  hecate:   { id:'hecate',   name:'Hecate',   hp:10000, shield:4200, speed:130, cargo:130, slots:4, cost:150000,  level:5, color:'#f472b6', ability:'-80% damage from aliens', desc:'A tank. Aliens bounce off.' },
  hyperion: { id:'hyperion', name:'Hyperion', hp:8000,  shield:3600, speed:180, cargo:220, slots:5, cost:400000,  level:8, color:'#fbbf24', desc:'Best NPC killer. Big cargo.' }
};

// --- laser guns ---
DATA.GUNS = {
  lg1: { id:'lg1', name:'LG-1', dmg:40,  rate:3.5, range:260, cost:0,       level:1, color:'#f87171' },
  lg2: { id:'lg2', name:'LG-2', dmg:90,  rate:3.0, range:300, cost:40000,   level:3, color:'#fb923c' },
  lg3: { id:'lg3', name:'LG-3', dmg:160, rate:2.6, range:330, cost:20000,   level:8, cur:'PLT', cost2:20000, color:'#a3e635' },
  lg4: { id:'lg4', name:'LG-4', dmg:260, rate:2.2, range:360, cost:50000,   level:10, cur:'PLT', cost2:50000, color:'#22d3ee' }
};

// --- laser ammo (damage multipliers, charges) ---
DATA.AMMO = {
  rlx: { id:'rlx', name:'RLX-1', mult:1, cost:200,   amt:2000, level:1, color:'#f87171' },
  glx: { id:'glx', name:'GLX-2', mult:2, cost:800,   amt:1000, level:3, color:'#4ade80' },
  blx: { id:'blx', name:'BLX-3', mult:3, cost:2000,  amt:600,  level:6, color:'#38bdf8' },
  wlx: { id:'wlx', name:'WLX-4', mult:4, cost:6000,  amt:300,  level:9, color:'#e879f9' }
};

// --- rockets (secondary, cooldown) ---
DATA.ROCKET = { id:'mrs', name:'MRS-6x', dmg:600, cd:4, cost:4000, amt:100, level:5, color:'#f59e0b' };

// --- shield generators ---
DATA.SHIELDS = {
  sg1: { id:'sg1', name:'SG-1', shield:1200, regen:60,  cost:0,     level:1 },
  sg2: { id:'sg2', name:'SG-2', shield:2600, regen:110, cost:35000, level:4 },
  sg3: { id:'sg3', name:'SG-3', shield:4500, regen:180, cost:20000, level:8, cur:'PLT', cost2:20000 }
};

// --- speed generators ---
DATA.SPEEDS = {
  acc1: { id:'acc1', name:'ACC-1', spd:30, cost:0,     level:1 },
  acc2: { id:'acc2', name:'ACC-2', spd:60, cost:25000, level:4 },
  acc3: { id:'acc3', name:'ACC-3', spd:90, cost:10000, level:8, cur:'PLT', cost2:10000 }
};

// --- extensions (one active, press to use, cooldown) ---
DATA.EXTS = {
  invuln: { id:'invuln', name:'E-WS-02', label:'Invulnerability', emoji:'🛡️', cost:120000, level:6, cur:'PLT', cost2:120000, cd:25, dur:3, desc:'Invulnerable for 3 seconds.' },
  repair: { id:'repair', name:'E-FR-05', label:'Repair', emoji:'🔧', cost:85000, level:5, cur:'PLT', cost2:85000, cd:20, dur:5, desc:'Regenerates 10% of hull each second.' },
  bomb:   { id:'bomb',   name:'E-NB-01', label:'Nuke', emoji:'☢️', cost:90000, level:6, cur:'PLT', cost2:90000, cd:30, dur:0, radius:220, desc:'Deals 10-25% of enemy HP in a radius.' },
  invis:  { id:'invis',  name:'E-INV-04', label:'Invisibility', emoji:'👻', cost:65000, level:5, cur:'PLT', cost2:65000, cd:20, dur:5, desc:'Invisible until you attack.' }
};

// --- aliens (per wiki, low -> high maps) ---
DATA.ALIENS = {
  hydro:     { id:'hydro',     name:'Hydro',     hp:1200,  shield:0,   speed:70,  dmg:60,  size:20, btc:1500,   plt:5,   exp:120,  honor:80,  color:'#4ade80', desc:'Old, hungry, not very smart.' },
  jenta:     { id:'jenta',     name:'Jenta',     hp:1600,  shield:200, speed:110, dmg:80,  size:16, btc:2400,   plt:10,  exp:200,  honor:140, color:'#a3e635', desc:'Bites and does not let go.' },
  mali:      { id:'mali',      name:'Mali',      hp:2600,  shield:400, speed:90,  dmg:110, size:22, btc:4500,   plt:20,  exp:380,  honor:260, color:'#fbbf24', desc:'A lot like Jenta. Stronger.' },
  plarion:   { id:'plarion',   name:'Plarion',   hp:4200,  shield:1500, speed:55,  dmg:160, size:28, btc:8000,   plt:40,  exp:700,  honor:480, color:'#94a3b8', desc:'Slow armored cube with a lonely beacon.' },
  xeon:      { id:'xeon',      name:'Xeon',      hp:7000,  shield:2000, speed:130, dmg:230, size:26, btc:15000,  plt:80,  exp:1300, honor:900, color:'#c084fc', desc:'Big, fast, strong. Do not stand still.' },
  bangoliour:{ id:'bangoliour',name:'Bangoliour',hp:9000,  shield:3000, speed:160, dmg:300, size:24, btc:25000,  plt:150, exp:2100, honor:1500,color:'#f472b6', desc:'Agile, terrible, can smell your fear.' },
  quattroid: { id:'quattroid', name:'Quattroid', hp:40000, shield:15000, speed:40, dmg:500, size:46, btc:120000, plt:900, exp:9000, honor:7000,color:'#e879f9', desc:'A mysterious structure. Good luck.' }
};
// hyper variants: double stats
function hyperOf(id) {
  var a = DATA.ALIENS[id];
  return { id:'hyper-' + id, name:'Hyper ' + a.name, hp:a.hp*2, shield:a.shield*2, speed:a.speed*1.1, dmg:a.dmg*1.5, size:a.size*1.3, btc:a.btc*2.5, plt:a.plt*2.5, exp:a.exp*2, honor:a.honor*2, color:'#f87171', desc:'Hyper ' + a.desc };
}
DATA.ALIENS['hyper-hydro'] = hyperOf('hydro');
DATA.ALIENS['hyper-jenta'] = hyperOf('jenta');
DATA.ALIENS['hyper-mali'] = hyperOf('mali');
DATA.ALIENS['hyper-plarion'] = hyperOf('plarion');
DATA.ALIENS['hyper-xeon'] = hyperOf('xeon');
DATA.ALIENS['hyper-bangoliour'] = hyperOf('bangoliour');
DATA.ALIENS['hyper-quattroid'] = hyperOf('quattroid');

// --- resources (primary on maps, secondary from aliens) ---
DATA.RESOURCES = {
  mercury:  { id:'mercury',  name:'Mercury',  price:8,   tier:1, color:'#cbd5e1', emoji:'⛏️' },
  erbium:   { id:'erbium',   name:'Erbium',   price:25,  tier:2, color:'#a78bfa', emoji:'⛏️' },
  cerium:   { id:'cerium',   name:'Cerium',   price:60,  tier:3, color:'#fbbf24', emoji:'⛏️' },
  azurit:   { id:'azurit',   name:'Azurit',   price:40,  tier:4, color:'#38bdf8', emoji:'💠' },
  uranit:   { id:'uranit',   name:'Uranit',   price:40,  tier:4, color:'#34d399', emoji:'💠' },
  darkonit: { id:'darkonit', name:'Darkonit', price:40,  tier:4, color:'#f472b6', emoji:'💠' }
};

// --- maps ---
DATA.MAPS = {
  x1: { id:'x1', name:'X-1', size:2200, level:1,  aliens:['hydro','jenta'], rocks:['mercury'], rockN:40 },
  x2: { id:'x2', name:'X-2', size:2600, level:3,  aliens:['mali','plarion','hyper-hydro','hyper-jenta'], rocks:['mercury','erbium'], rockN:50 },
  x3: { id:'x3', name:'X-3', size:3000, level:6,  aliens:['xeon','bangoliour','hyper-mali','hyper-plarion','quattroid'], rocks:['erbium','cerium'], rockN:60 }
};

// --- ranks ---
DATA.RANKS = [
  { name:'Private', honor:0 }, { name:'Sergeant', honor:50000 },
  { name:'Lieutenant', honor:200000 }, { name:'Captain', honor:500000 },
  { name:'Major', honor:1000000 }, { name:'Colonel', honor:2000000 },
  { name:'General', honor:4000000 }, { name:'Marshal', honor:8000000 }
];

// --- prices / misc ---
DATA.COSTS = {
  factionChange: 10000, // PLT
  refine: 5,            // primary -> next primary (5:1)
  hullUp: 5000,         // BTC + azurit
  shieldUp: 5000,       // BTC + uranit
  dmgUp: 5000,          // BTC + darkonit
  repairFree: true
};
DATA.SAVE_KEY = 'warorbit_save_v1';
