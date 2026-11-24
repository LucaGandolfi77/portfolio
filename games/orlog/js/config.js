/**
 * config.js — registry dei dati di Orlog (puro).
 */

export const FACES = [
  { id: 'melee', icon: '⚔️', name: 'Melee', kind: 'attack' },
  { id: 'block', icon: '🛡️', name: 'Block', kind: 'defense' },
  { id: 'ranged', icon: '🏹', name: 'Ranged', kind: 'attack' },
  { id: 'shield', icon: '🔰', name: 'Shield', kind: 'defense' },
  { id: 'steal', icon: '🪙', name: 'Steal', kind: 'token' },
  { id: 'token', icon: '✨', name: 'Token', kind: 'token' }
];
export const FAVORS = [
  { id: 'thor', name: "Thor's Strike", icon: '⚡', cost: 4, desc: 'Deal 3 damage', kind: 'damage', value: 3 },
  { id: 'idun', name: "Idun's Rejuvenation", icon: '🌿', cost: 4, desc: 'Heal 3 HP', kind: 'heal', value: 3 },
  { id: 'odin', name: "Odin's Sacrifice", icon: '👁️', cost: 3, desc: 'Steal 3 tokens', kind: 'steal', value: 3 },
  { id: 'tyr', name: "Tyr's Challenge", icon: '🗡️', cost: 5, desc: 'Deal 2 damage + steal 2 tokens', kind: 'damageSteal', value: 2, extra: 2 },
  { id: 'freya', name: "Freya's Blessing", icon: '🌸', cost: 3, desc: 'Block all melee', kind: 'blockMelee' },
  { id: 'loki', name: "Loki's Trick", icon: '🦊', cost: 3, desc: 'Swap HP with your foe', kind: 'swapHp' },
  { id: 'baldr', name: "Baldr's Light", icon: '☀️', cost: 5, desc: 'Heal 2 and deal 2', kind: 'healDamage', value: 2 },
  { id: 'hel', name: "Hel's Shadow", icon: '💀', cost: 4, desc: 'Cancel enemy favor', kind: 'cancel' },
  { id: 'frey', name: "Frey's Harvest", icon: '🌾', cost: 2, desc: 'Gain 4 tokens', kind: 'gain', value: 4 }
];

export const RELICS = [
  { id: 'hammer', name: 'Mjolnir', emoji: '🔨', desc: '+1 melee damage' },
  { id: 'horn', name: 'Drinking Horn', emoji: '🍺', desc: '+1 token per round' },
  { id: 'shield', name: 'Aegis', emoji: '🛡️', desc: '+1 block' },
  { id: 'eye', name: 'Raven Eye', emoji: '🐦‍⬛', desc: 'See enemy dice early' },
  { id: 'runes', name: 'Runes', emoji: 'ᚱ', desc: 'Favors cost 1 less' },
  { id: 'apple', name: 'Golden Apple', emoji: '🍎', desc: 'Heal 1 each round' }
];

export const TALENTS = [
  { id: 'warrior', name: 'Warrior', emoji: '⚔️', desc: '+1 melee damage', cost: 2 },
  { id: 'hunter', name: 'Hunter', emoji: '🏹', desc: '+1 ranged damage', cost: 2 },
  { id: 'trader', name: 'Trader', emoji: '🪙', desc: '+1 token on Steal', cost: 2 },
  { id: 'seer', name: 'Seer', emoji: '👁️', desc: 'Extra reroll', cost: 3 },
  { id: 'warden', name: 'Warden', emoji: '🛡️', desc: '+1 block', cost: 3 },
  { id: 'blessed', name: 'Blessed', emoji: '✨', desc: 'Start with 2 tokens', cost: 4 }
];

export const BOSSES = [
  { id: 'b1', name: 'Sven the Bold', emoji: '🪓', hp: 12, tokens: 2, lore: 'A raider who never backs down.' },
  { id: 'b2', name: 'Freydis', emoji: '🛶', hp: 14, tokens: 3, lore: 'She reads the dice like a map.' },
  { id: 'b3', name: 'Bjorn', emoji: '🐻', hp: 16, tokens: 3, lore: 'The bear-skin clad berserker.' },
  { id: 'b4', name: 'Eirik Bloodaxe', emoji: '🩸', hp: 18, tokens: 4, lore: 'His axe has a name, and it is hungry.' },
  { id: 'b5', name: 'Sigrid', emoji: '👑', hp: 18, tokens: 5, lore: 'A queen who bargains with gods.' },
  { id: 'b6', name: 'Ragnar', emoji: '⚓', hp: 20, tokens: 5, lore: 'He has forgotten how to lose.' },
  { id: 'b7', name: 'Ivar', emoji: '🦯', hp: 20, tokens: 6, lore: 'The boneless one sees all angles.' },
  { id: 'b8', name: 'Skadi', emoji: '❄️', hp: 22, tokens: 6, lore: 'Winter follows her gaze.' },
  { id: 'b9', name: 'Thor', emoji: '⚡', hp: 24, tokens: 7, lore: 'The thunder god tests your luck.' },
  { id: 'b10', name: 'Odin', emoji: '👁️', hp: 28, tokens: 8, lore: 'All-knowing, all-seeing, all-winning.' }
];

export const MODES = [
  { id: 'classic', name: 'Classic', emoji: '⚔️', desc: 'Duel a random challenger' },
  { id: 'campaign', name: 'Campaign', emoji: '🗺️', desc: '10 bosses with lore and stars' },
  { id: 'tournament', name: 'Tournament', emoji: '🏆', desc: 'Three foes, partial health' },
  { id: 'endless', name: 'Endless', emoji: '♾️', desc: 'Survive ever-tougher waves' },
  { id: 'daily', name: 'Daily', emoji: '📅', desc: 'Seeded duel, same for all' },
  { id: 'chaos', name: 'Chaos', emoji: '🌀', desc: 'Wild mutators each round' }
];

export const MUTATORS = [
  { id: 'extra', name: 'Extra die', emoji: '🎲', desc: '7 dice per roll' },
  { id: 'double', name: 'Double damage', emoji: '💥', desc: 'All damage ×2' },
  { id: 'free', name: 'Free favors', emoji: '🆓', desc: 'Favors cost 1' },
  { id: 'mirror', name: 'Mirror', emoji: '🪞', desc: 'Enemy copies your favor' },
  { id: 'chaosDice', name: 'Wild dice', emoji: '🌪️', desc: 'Random extra face' }
];

export const DEFAULT_SETTINGS = {
  mode: 'classic', sound: true, haptics: true, particles: true,
  relics: [], talents: [], locale: 'en'
};
export const STORAGE_KEY = 'orlog-v2';

export function findFavor(id) { return FAVORS.find((item) => item.id === id) || FAVORS[0]; }
export function findBoss(id) { return BOSSES.find((item) => item.id === id) || BOSSES[0]; }
export function findMode(id) { return MODES.find((item) => item.id === id) || MODES[0]; }
export function findRelic(id) { return RELICS.find((item) => item.id === id) || null; }
