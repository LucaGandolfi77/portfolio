/**
 * config.js — registry dati di Battleship Commander (puro).
 */

export const WORLD_SIZE = 3200;
export const FIXED_DT = 1 / 60;

export const SHIPS = [
  { id: 'scout', name: 'Scout', emoji: '🚤', hull: 80, speed: 4.6, turn: 0.058, reload: 0.22, damage: 1, weapon: 'cannon', unlock: 0 },
  { id: 'destroyer', name: 'Destroyer', emoji: '🛥️', hull: 110, speed: 3.9, turn: 0.046, reload: 0.28, damage: 2, weapon: 'cannon', unlock: 4 },
  { id: 'cruiser', name: 'Cruiser', emoji: '🚢', hull: 150, speed: 3.3, turn: 0.038, reload: 0.34, damage: 3, weapon: 'flak', unlock: 12 },
  { id: 'submarine', name: 'Submarine', emoji: '🫧', hull: 100, speed: 3.6, turn: 0.05, reload: 0.5, damage: 4, weapon: 'torpedo', unlock: 22 },
  { id: 'dreadnought', name: 'Dreadnought', emoji: '⚓', hull: 220, speed: 2.7, turn: 0.03, reload: 0.42, damage: 5, weapon: 'railgun', unlock: 34 }
];

export const WEAPONS = [
  { id: 'cannon', name: 'Cannon', emoji: '💥', speed: 13, life: 1.4, radius: 3, color: '#ffd166', spread: 0.02, shots: 1 },
  { id: 'flak', name: 'Flak', emoji: '✨', speed: 11, life: 1.1, radius: 3, color: '#ff8fb3', spread: 0.12, shots: 3 },
  { id: 'torpedo', name: 'Torpedo', emoji: '🚀', speed: 9, life: 2.2, radius: 5, color: '#67e8f9', spread: 0.01, shots: 1 },
  { id: 'railgun', name: 'Railgun', emoji: '⚡', speed: 22, life: 1, radius: 4, color: '#b6ff6a', spread: 0, shots: 1 }
];

export const BOSSES = [
  { id: 'ironclad', name: 'Ironclad', emoji: '🛡️', hull: 60, speed: 2.6, reload: 0.55, damage: 3, phases: 2 },
  { id: 'leviathan', name: 'Leviathan', emoji: '🐙', hull: 95, speed: 3.1, reload: 0.42, damage: 4, phases: 3 },
  { id: 'dreadlord', name: 'Dreadlord', emoji: '💀', hull: 140, speed: 3.6, reload: 0.32, damage: 5, phases: 3 }
];

export const MODES = [
  { id: 'campaign', name: 'Campaign', emoji: '🗺️', desc: '15 narrative missions' },
  { id: 'endless', name: 'Endless', emoji: '♾️', desc: 'Waves forever, adaptive difficulty' },
  { id: 'survival', name: 'Survival', emoji: '🛡️', desc: 'Last as long as you can' },
  { id: 'timeattack', name: 'Time Attack', emoji: '⏱️', desc: 'Sink the fleet before the clock' },
  { id: 'bosshunt', name: 'Boss Hunt', emoji: '👹', desc: 'Duel the warlords' },
  { id: 'daily', name: 'Daily Challenge', emoji: '📅', desc: 'Seeded run, same for everyone' },
  { id: 'convoy', name: 'Convoy Escort', emoji: '🚢', desc: 'Protect the merchant fleet' }
];

export const MISSIONS = [
  { id: 'm01', name: 'Shakedown', objective: { type: 'sink', target: 3 }, stars: [3, 6, 10], desc: 'Sink 3 enemy ships.' },
  { id: 'm02', name: 'Open Water', objective: { type: 'sink', target: 5 }, stars: [8, 14, 20], desc: 'Sink 5 enemy ships.' },
  { id: 'm03', name: 'Night Watch', objective: { type: 'survive', target: 45 }, mods: ['night'], stars: [10, 18, 26], desc: 'Survive 45 seconds in the dark.' },
  { id: 'm04', name: 'Storm Front', objective: { type: 'sink', target: 6 }, mods: ['storm'], stars: [12, 20, 30], desc: 'Sink 6 ships in a storm.' },
  { id: 'm05', name: 'Convoy Duty', objective: { type: 'escort', target: 40 }, mods: ['convoy'], stars: [14, 24, 34], desc: 'Escort the convoy for 40 seconds.' },
  { id: 'm06', name: 'Silent Runner', objective: { type: 'sink', target: 8 }, mods: ['night'], stars: [16, 28, 40], desc: 'Sink 8 ships under cover of darkness.' },
  { id: 'm07', name: 'Crossfire', objective: { type: 'sink', target: 10 }, stars: [18, 32, 46], desc: 'Sink 10 ships.' },
  { id: 'm08', name: 'Ironclad', objective: { type: 'boss', target: 1 }, mods: ['boss', 'ironclad'], stars: [22, 38, 55], desc: 'Destroy the Ironclad.' },
  { id: 'm09', name: 'Deep Ambush', objective: { type: 'survive', target: 75 }, mods: ['night', 'storm'], stars: [24, 42, 60], desc: 'Survive 75 seconds.' },
  { id: 'm10', name: 'Black Tide', objective: { type: 'sink', target: 12 }, mods: ['storm'], stars: [26, 46, 66], desc: 'Sink 12 ships.' },
  { id: 'm11', name: 'Leviathan', objective: { type: 'boss', target: 1 }, mods: ['boss', 'leviathan'], stars: [30, 52, 74], desc: 'Destroy the Leviathan.' },
  { id: 'm12', name: 'Last Convoy', objective: { type: 'escort', target: 60 }, mods: ['convoy', 'storm'], stars: [32, 56, 80], desc: 'Protect the convoy for 60 seconds.' },
  { id: 'm13', name: 'Gauntlet', objective: { type: 'sink', target: 16 }, mods: ['night'], stars: [36, 62, 88], desc: 'Sink 16 ships.' },
  { id: 'm14', name: 'Dreadnought', objective: { type: 'sink', target: 20 }, stars: [40, 70, 100], desc: 'Sink 20 ships.' },
  { id: 'm15', name: 'Dreadlord', objective: { type: 'boss', target: 1 }, mods: ['boss', 'dreadlord', 'storm'], stars: [50, 85, 120], desc: 'Destroy the Dreadlord and win the war.' }
];

export const DEFAULT_SETTINGS = {
  ship: 'scout',
  sound: true,
  haptics: true,
  autoFire: false,
  aimAssist: true,
  minimap: true,
  difficulty: 1
};

export const STORAGE_KEY = 'battleship.save.v2';

export function findShip(id) { return SHIPS.find((item) => item.id === id) || SHIPS[0]; }
export function findWeapon(id) { return WEAPONS.find((item) => item.id === id) || WEAPONS[0]; }
export function findMission(id) { return MISSIONS.find((item) => item.id === id) || MISSIONS[0]; }
export function findBoss(id) { return BOSSES.find((item) => item.id === id) || BOSSES[0]; }
export function findMode(id) { return MODES.find((item) => item.id === id) || MODES[0]; }
