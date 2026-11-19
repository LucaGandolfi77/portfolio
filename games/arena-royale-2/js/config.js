/* Arena Royale 2 — game constants and data tables */

export const MAP_HALF = 130;
export const BOT_COUNT = 9;
export const PLAYER_SPEED = 9.5;
export const PICKUP_NEED = 2.0;
export const AMMO_NEED = 0.8;
export const PICKUP_DIST = 1.6;
export const STORM_DMG = 12;
export const STORM_PHASES = [{ r: 100 }, { r: 78 }, { r: 58 }, { r: 40 }, { r: 26 }, { r: 15 }];
export const STORM_WAIT = 10;
export const STORM_SHRINK = 8;

export const WEAPONS = {
  fists:     { name: "PUGNI",           dmgMin: 15, dmgMax: 15, pellets: 1, range: 4.2, reload: 0.30, projSpeed: 0,  ammo: Infinity, head: false, supply: false, melee: true,  spread: 0,    color: 0xcccccc, legDmg: null },
  peacemaker:{ name: "PEACEMAKER",      dmgMin: 7,  dmgMax: 7,  pellets: 1, range: 15, reload: 0.50, projSpeed: 24, ammo: 60, ammoPickup: 20, head: true,  supply: false, melee: false, spread: 0.015, color: 0xc8a06a, legDmg: [8, 8] },
  ar:        { name: "ASSAULT RIFLE",   dmgMin: 6,  dmgMax: 9,  pellets: 1, range: 19, reload: 0.20, projSpeed: 26, ammo: 60, ammoPickup: 20, head: false, supply: false, melee: false, spread: 0.03,  color: 0x5f8fd0, legDmg: [7, 10] },
  smg:       { name: "SMG",             dmgMin: 5,  dmgMax: 7,  pellets: 1, range: 22, reload: 0.10, projSpeed: 26, ammo: 90, ammoPickup: 30, head: false, supply: false, melee: false, spread: 0.07,  color: 0xb06ad0, legDmg: [6, 8] },
  shotgun:   { name: "SHOTGUN",         dmgMin: 5,  dmgMax: 10, pellets: 4, range: 9,  reload: 1.40, projSpeed: 20, ammo: 30, ammoPickup: 10, head: false, supply: false, melee: false, spread: 0.16,  color: 0xe0863a, legDmg: [6, 12] },
  sniper:    { name: "SNIPER",          dmgMin: 15, dmgMax: 30, pellets: 1, range: 17, reload: 0.83, projSpeed: 36, ammo: 12, ammoPickup: 5,  head: false, supply: false, melee: false, spread: 0,     color: 0x3fc0b0, legDmg: null },
  dbs:       { name: "D. SHOTGUN",      dmgMin: 7,  dmgMax: 14, pellets: 2, range: 17, reload: 0.66, projSpeed: 20, ammo: 20, ammoPickup: 8,  head: false, supply: false, melee: false, spread: 0.14,  color: 0xd85a5a, legDmg: null },
  scar:      { name: "SCAR",            dmgMin: 9,  dmgMax: 15, pellets: 1, range: 15, reload: 0.35, projSpeed: 28, ammo: 60, ammoPickup: 20, head: false, supply: false, melee: false, spread: 0.04,  color: 0x5fc06a, legDmg: null },
  kar99:     { name: "KAR99",           dmgMin: 25, dmgMax: 50, pellets: 1, range: 17, reload: 1.77, projSpeed: 40, ammo: 12, ammoPickup: 5,  head: false, supply: false, melee: false, spread: 0,     color: 0x9a7a4a, legDmg: [26, 52] },
  minigun:   { name: "MINIGUN",         dmgMin: 9,  dmgMax: 15, pellets: 1, range: 16, reload: 0.09, projSpeed: 30, ammo: 300, ammoPickup: 100, head: false, supply: true, melee: false, spread: 0.11, color: 0x8a92a8, legDmg: null },
  bazooka:   { name: "BAZOOKA",         dmgMin: 70, dmgMax: 70, pellets: 1, range: 18, reload: 2.20, projSpeed: 14, ammo: 6,  ammoPickup: 3,  head: false, supply: true, melee: false, spread: 0,     color: 0x8aa05a, legDmg: [75, 75], explosive: true },
  quadzooka: { name: "QUADZOOKA",       dmgMin: 20, dmgMax: 20, pellets: 4, range: 19, reload: 0.90, projSpeed: 16, ammo: 16, ammoPickup: 6,  head: false, supply: true, melee: false, spread: 0.1,   color: 0x5ac8c0, legDmg: [25, 25], explosive: true }
};

export const LOOT_WEIGHTS = [
  ["peacemaker", 1.3], ["ar", 1.1], ["smg", 1.0], ["shotgun", 0.8],
  ["sniper", 0.5], ["dbs", 0.6], ["scar", 0.5], ["kar99", 0.25]
];
export const LEG_CHANCE = 0.18;
export const BOT_WEAPONS = [["ar", 3], ["smg", 3], ["shotgun", 2], ["scar", 1.5], ["sniper", 0.6]];
export const BOT_COLORS = [0xff6b5e, 0xffb13b, 0x9d5cff, 0x58d66b, 0xff5ec4, 0x41c8e0, 0xffa94d, 0x8a9a5a, 0xe87a3a];

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rand = (a, b) => a + Math.random() * (b - a);

export function rollWeapon(table) {
  let total = 0;
  for (const [, w] of table) total += w;
  let t = Math.random() * total;
  for (const [k, w] of table) { t -= w; if (t <= 0) return k; }
  return table[0][0];
}

export function weaponStats(w, leg) {
  if (leg && w.legDmg) return { dmgMin: w.legDmg[0], dmgMax: w.legDmg[1], ammo: w.ammo };
  return { dmgMin: w.dmgMin, dmgMax: w.dmgMax, ammo: w.ammo };
}
