/* Arrowmatic — static game data */

export const CHAPTERS = [
  { name: 'Prati Pop', c1: '#7ee08a', c2: '#3fae5a', ac: '#2f7d3f' },
  { name: 'Deserto Salato', c1: '#ffd97a', c2: '#f2953f', ac: '#b06a1f' },
  { name: 'Mare Gelatino', c1: '#7ad7ff', c2: '#3f8ae0', ac: '#1f5aa8' },
  { name: 'Bosco Neonic', c1: '#d07aff', c2: '#8a3fe0', ac: '#5f2ba8' },
  { name: 'Vulcano Caramella', c1: '#ff8a7a', c2: '#e03f3f', ac: '#a82f2f' },
  { name: 'Divano Cosmico', c1: '#a78bfa', c2: '#5b21b6', ac: '#3b1680' }
];

export const ENEMIES = {
  slime: { hp: 14, spd: 72, r: 16, dmg: 10, xp: 1, coin: 2, col: '#84cc16', face: 1 },
  bat: { hp: 10, spd: 100, r: 12, dmg: 8, xp: 1, coin: 2, col: '#f472b6', face: 2, zig: true },
  shoot: { hp: 18, spd: 52, r: 14, dmg: 12, xp: 2, coin: 3, col: '#22d3ee', face: 3, shoot: { cd: 1.9, spd: 190, range: 270 } },
  split: { hp: 26, spd: 58, r: 19, dmg: 10, xp: 2, coin: 3, col: '#fb923c', face: 1, split: 2 },
  mini: { hp: 6, spd: 92, r: 9, dmg: 6, xp: 1, coin: 1, col: '#fdba74', face: 1 },
  tank: { hp: 62, spd: 38, r: 23, dmg: 20, xp: 4, coin: 7, col: '#94a3b8', face: 4 }
};

export const BOSSES = [
  { name: 'Slime Ministro 👑', hp: 130, pattern: ['spawn'], col: '#84cc16' },
  { name: 'Duke Ballon 🎈', hp: 180, pattern: ['charge', 'radial'], col: '#f472b6' },
  { name: 'Re Gommoso IV 🍮', hp: 250, pattern: ['spiral'], col: '#fb923c' },
  { name: 'Contessa Spikolina 🌵', hp: 330, pattern: ['radial', 'charge'], col: '#22d3ee' },
  { name: 'General Krunch 💥', hp: 460, pattern: ['wall', 'spawn'], col: '#ef4444' },
  { name: 'VOIDINO, Divinità del Divano 🛋️', hp: 640, pattern: ['spiral', 'radial', 'charge'], col: '#a78bfa' }
];

export const WEAPONS = {
  bow: { name: 'Arco Classico', ic: '🏹', desc: 'Onesto. Affidabile. Un po’ noioso.', dmg: 12, rate: 2.1, pspd: 430, n: 1, range: 340, cost: 0 },
  blades: { name: 'Lame Gemelle', ic: '🔪', desc: 'Raffica corta ma continua.', dmg: 7, rate: 3.7, pspd: 400, n: 2, spread: 0.14, range: 250, cost: 600 },
  staff: { name: 'Bastone Arcobaleno', ic: '🌈', desc: 'Trafora i nemici come gossip.', dmg: 16, rate: 1.5, pspd: 310, n: 1, pierce: 2, range: 360, cost: 1500 },
  boomer: { name: 'Boomerang Bumeran', ic: '🪃', desc: 'Va, torna, ribattezza. Come le tue scuse.', dmg: 11, rate: 1.6, pspd: 350, n: 1, return: true, range: 320, cost: 3200 },
  cannon: { name: 'Cannone Circa', ic: '💥', desc: 'Esplode VICINO al bersaglio. Circa.', dmg: 30, rate: 0.85, pspd: 270, n: 1, aoe: 62, range: 300, cost: 6000 }
};

export const HEROES = {
  arcibaldo: { name: 'Arcibaldo', ic: '🧑‍🌾', desc: 'Perk: nessuno. È orgoglioso di questo.', cost: 0, mods: {} },
  velocirina: { name: 'Velocirina', ic: '🏃‍♀️', desc: '+15% velocità · −10% vita', cost: 800, mods: { speed: 1.15, hp: 0.9 } },
  tankone: { name: 'Tankone', ic: '🧱', desc: '+35% vita · −8% velocità', cost: 2000, mods: { hp: 1.35, speed: 0.92 } },
  fortunella: { name: 'Fortunella', ic: '🍀', desc: '+25% monete · draft più generose', cost: 4000, mods: { greed: 1.25, luck: 1 } }
};

export const ACCS = {
  revive: { name: 'Cuore Ricambio', ic: '💗', desc: 'Una rinascita per run (50% vita)', cost: 1500 },
  magnet: { name: 'Magnete XL', ic: '🧲', desc: 'Raggio raccolta ×2.5', cost: 700 },
  waveshield: { name: 'Scudo da Ondata', ic: '🛡️', desc: 'Blocca il primo colpo di ogni ondata', cost: 1200 },
  dice: { name: 'Dado Birichino', ic: '🎲', desc: '+1 reroll nelle scelte potenziamento', cost: 900 }
};

export const META_UPG = [
  { id: 'atk', ic: '⚔️', name: 'Attacco+', ds: v => `+${6 * v}% danno`, base: 80, mult: 1.55 },
  { id: 'hp', ic: '❤️', name: 'Vita+', ds: v => `+${8 * v}% vita max`, base: 70, mult: 1.5 },
  { id: 'spd', ic: '👟', name: 'Velocità+', ds: v => `+${3 * v}% movimento`, base: 90, mult: 1.6 },
  { id: 'crit', ic: '🎯', name: 'Critico+', ds: v => `+${3 * v}% prob. critico`, base: 110, mult: 1.6 },
  { id: 'greed', ic: '🪙', name: 'Avidità+', ds: v => `+${8 * v}% monete raccolte`, base: 100, mult: 1.55 }
];

export const DRAFT = [
  { id: 'multi', ic: '✨', nm: 'Multishot', ds: '+1 proiettile a ogni scatto', w: 2, cc: '#ff5ea8', r: 'comune', f: p => p.n += 1 },
  { id: 'atk', ic: '⚔️', nm: 'Super Attacco', ds: '+20% danno', w: 1.6, cc: '#ef4444', r: 'comune', f: p => p.dmgMul *= 1.2 },
  { id: 'rate', ic: '⚡', nm: 'Cadenza Folle', ds: '+18% velocità di tiro', w: 1.5, cc: '#fbbf24', r: 'comune', f: p => p.rateMul *= 1.18 },
  { id: 'critc', ic: '🎯', nm: 'Occhio Di Falco', ds: '+8% probabilità critico', w: 1.4, cc: '#22d3ee', r: 'comune', f: p => p.critC += 0.08 },
  { id: 'hpm', ic: '❤️‍🔥', nm: 'Cuorione', ds: '+15% vita max e cura 25%', w: 1.4, cc: '#84cc16', r: 'comune', f: p => { p.maxHp = Math.round(p.maxHp * 1.15); p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.25); } },
  { id: 'pierce', ic: '🔩', nm: 'Traforo', ds: 'i colpi attraversano +1 nemico', w: 1.3, cc: '#8b5cf6', r: 'raro', f: p => p.pierce += 1 },
  { id: 'bounce', ic: '🏓', nm: 'Rimbalzotto', ds: 'i colpi rimbalzano +1 sui muri', w: 1.2, cc: '#38bdf8', r: 'raro', f: p => p.bounce += 1 },
  { id: 'rear', ic: '🔙', nm: 'Parricida Retro', ds: '+1 colpo all’indietro', w: 1.2, cc: '#fb923c', r: 'raro', f: p => p.rear += 1 },
  { id: 'side', ic: '↔️', nm: 'Fianchi Folli', ds: '+2 colpi laterali', w: 1.2, cc: '#a78bfa', r: 'raro', f: p => p.side += 2 },
  { id: 'diag', ic: '✖️', nm: 'X Diagonale', ds: '+2 colpi diagonali', w: 1, cc: '#f472b6', r: 'raro', f: p => p.diag += 2 },
  { id: 'critd', ic: '💢', nm: 'Critico Brutale', ds: '+40% danno critico', w: 1, cc: '#dc2626', r: 'raro', f: p => p.critD += 0.4 },
  { id: 'spd', ic: '👟', nm: 'Scarpette Volanti', ds: '+10% velocità di movimento', w: 1.1, cc: '#84cc16', r: 'comune', f: p => p.spdMul *= 1.1 },
  { id: 'range', ic: '🔭', nm: 'Lunghissimo', ds: '+15% gittata', w: 1, cc: '#0ea5e9', r: 'comune', f: p => p.rangeMul *= 1.15 },
  { id: 'vamp', ic: '🧛', nm: 'Zanzarone', ds: '3% del danno torna come vita', w: 0.8, cc: '#be123c', r: 'epico', f: p => p.vamp += 0.03 },
  { id: 'mag', ic: '🧲', nm: 'Calamita Anima', ds: '+40% raggio di raccolta', w: 0.9, cc: '#06b6d4', r: 'comune', f: p => p.pickMul *= 1.4 },
  { id: 'movefire', ic: '🦵', nm: 'Ginocchia di Ferro', ds: 'LEGGENDARIO: spari anche CORRENDO!', w: 0.45, cc: '#fbbf24', r: 'leggendaria', lego: true, f: p => p.moveFire = true }
];

export const DAILY_REWARDS = [40, 60, 90, 130, 180, 250, 400];

export const MISSION_POOL = [
  { id: 'kills30', key: 'missionKills', target: 30, event: 'kill', reward: 80 },
  { id: 'lv5', key: 'missionLevel', target: 5, event: 'level', reward: 120 },
  { id: 'coins150', key: 'missionCoins', target: 150, event: 'coin', reward: 100 },
  { id: 'boss1', key: 'missionBoss', target: 1, event: 'boss', reward: 200 },
  { id: 'draft3', key: 'missionDraft', target: 3, event: 'draft', reward: 90 }
];

export const ACHIEVEMENTS = [
  { id: 'firstRun', key: 'achFirstRun', reward: 50, test: s => s.runs >= 1 },
  { id: 'kill100', key: 'achKill100', reward: 150, test: s => s.kills >= 100 },
  { id: 'lv10', key: 'achLv10', reward: 200, test: s => s.bestLv >= 10 },
  { id: 'bossSlayer', key: 'achBoss', reward: 250, test: s => (s.achCounters?.bosses || 0) >= 1 },
  { id: 'streak3', key: 'achStreak', reward: 180, test: s => (s.daily?.streak || 0) >= 3 },
  { id: 'rich', key: 'achRich', reward: 300, test: s => s.coins >= 5000 }
];

export const MAXLVL = 8;
export const AUTO_PRICE = 2500;
