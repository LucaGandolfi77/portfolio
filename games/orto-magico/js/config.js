/**
 * config.js — registry dei dati di Orto Magico (puro).
 */

export const STORAGE_KEY = 'orto-magico-state-v2';

export const SEEDS = {
  lettuce: { id: 'lettuce', name: 'Lattuga', emoji: '🥬', cost: 5, growTime: 30, thirst: 8, minWater: 20, maxWater: 100, coins: 15, gems: 1, season: 'spring' },
  carrot: { id: 'carrot', name: 'Carota', emoji: '🥕', cost: 8, growTime: 45, thirst: 10, minWater: 25, maxWater: 100, coins: 20, gems: 1, season: 'spring' },
  strawberry: { id: 'strawberry', name: 'Fragola', emoji: '🍓', cost: 15, growTime: 60, thirst: 12, minWater: 30, maxWater: 100, coins: 35, gems: 2, season: 'spring' },
  tomato: { id: 'tomato', name: 'Pomodoro', emoji: '🍅', cost: 15, growTime: 60, thirst: 11, minWater: 30, maxWater: 100, coins: 35, gems: 2, season: 'summer' },
  sunflower: { id: 'sunflower', name: 'Girasole', emoji: '🌻', cost: 25, growTime: 90, thirst: 15, minWater: 40, maxWater: 100, coins: 55, gems: 3, season: 'summer' },
  rose: { id: 'rose', name: 'Rosa', emoji: '🌹', cost: 35, growTime: 120, thirst: 18, minWater: 50, maxWater: 100, coins: 80, gems: 5, season: 'summer' },
  mushroom: { id: 'mushroom', name: 'Funghi', emoji: '🍄', cost: 20, growTime: 40, thirst: 8, minWater: 15, maxWater: 80, coins: 25, gems: 1, season: 'autumn' },
  cactus: { id: 'cactus', name: 'Cactus', emoji: '🌵', cost: 30, growTime: 100, thirst: 3, minWater: 10, maxWater: 50, coins: 60, gems: 3, season: 'summer' },
  orchid: { id: 'orchid', name: 'Orchidea', emoji: '🪷', cost: 45, growTime: 150, thirst: 20, minWater: 60, maxWater: 100, coins: 100, gems: 8, season: 'spring' },
  pepper: { id: 'pepper', name: 'Peperoncino', emoji: '🌶️', cost: 20, growTime: 50, thirst: 13, minWater: 25, maxWater: 100, coins: 45, gems: 2, season: 'summer' },
  lettuce2: { id: 'lettuce2', name: 'Lattuga Rossa', emoji: '🥬', cost: 10, growTime: 35, thirst: 9, minWater: 20, maxWater: 100, coins: 18, gems: 1, season: 'spring' },
  pumpkin: { id: 'pumpkin', name: 'Zucca', emoji: '🎃', cost: 40, growTime: 110, thirst: 14, minWater: 35, maxWater: 100, coins: 90, gems: 4, season: 'autumn' },
  wheat: { id: 'wheat', name: 'Grano', emoji: '🌾', cost: 12, growTime: 55, thirst: 7, minWater: 20, maxWater: 100, coins: 28, gems: 1, season: 'summer' },
  holly: { id: 'holly', name: 'Agrifoglio', emoji: '🌲', cost: 50, growTime: 140, thirst: 6, minWater: 15, maxWater: 90, coins: 120, gems: 6, season: 'winter' },
  moonflower: { id: 'moonflower', name: 'Fiore Luna', emoji: '🌙', cost: 75, growTime: 180, thirst: 10, minWater: 25, maxWater: 100, coins: 200, gems: 12, season: 'winter' },
  starfruit: { id: 'starfruit', name: 'Fr Stella', emoji: '⭐', cost: 90, growTime: 200, thirst: 12, minWater: 30, maxWater: 100, coins: 260, gems: 15, mutant: true },
  rainbowrose: { id: 'rainbowrose', name: 'Rosa Arcobaleno', emoji: '🌈', cost: 120, growTime: 240, thirst: 16, minWater: 40, maxWater: 100, coins: 400, gems: 20, mutant: true }
};

export const UPGRADES = [
  { id: 'auto-harvest', name: 'Mietitrice', emoji: '🤖', desc: 'Raccoglie automaticamente', cost: 200, gems: 0, tier: 1 },
  { id: 'auto-replant', name: 'Seminatrice', emoji: '🌱', desc: 'Ripianta dopo il raccolto', cost: 400, gems: 0, tier: 1 },
  { id: 'water-rate-1', name: 'Irrigatore Base', emoji: '💧', desc: '+2 acqua/s', cost: 150, gems: 0, tier: 1 },
  { id: 'water-rate-2', name: 'Irrigatore Pro', emoji: '💦', desc: '+5 acqua/s', cost: 600, gems: 3, tier: 2 },
  { id: 'water-full', name: 'Sistema Completo', emoji: '🚰', desc: 'Acqua sempre piena', cost: 1500, gems: 10, tier: 2 },
  { id: 'speed-1', name: 'Fertilizzante', emoji: '🧪', desc: 'Crescita +25%', cost: 300, gems: 0, tier: 1 },
  { id: 'speed-2', name: 'Concime Magico', emoji: '✨', desc: 'Crescita +50%', cost: 1000, gems: 5, tier: 2 },
  { id: 'speed-3', name: 'Elioforo', emoji: '☀️', desc: 'Crescita ×2', cost: 3000, gems: 15, tier: 3 },
  { id: 'offline-1', name: 'Ombra Fresca', emoji: '⛱️', desc: 'Offline fino a 1h', cost: 250, gems: 0, tier: 1 },
  { id: 'offline-2', name: 'Cella Frigorifera', emoji: '❄️', desc: 'Offline fino a 6h', cost: 800, gems: 5, tier: 2 },
  { id: 'offline-3', name: 'Criostasi', emoji: '🧊', desc: 'Offline fino a 24h', cost: 2500, gems: 12, tier: 3 },
  { id: 'fairy', name: 'Fata del Giardino', emoji: '🧚', desc: '+20% crescita quando annaffi', cost: 700, gems: 4, tier: 2 },
  { id: 'greenhouse', name: 'Serra', emoji: '🏡', desc: 'Sblocca i semi mutanti', cost: 2000, gems: 12, tier: 3 }
];

export const ACHIEVEMENTS = [
  { id: 'first-sprout', name: 'Primo Germoglio', desc: 'Raccogli la prima pianta', goal: 1, field: 'totalHarvests', coins: 50, gems: 0, emoji: '🌱' },
  { id: 'green-thumb', name: 'Mani di Terra', desc: 'Pianta 10 semi', goal: 10, field: 'totalPlanted', coins: 100, gems: 1, emoji: '🌿' },
  { id: 'watering-can', name: 'Innaffiatoio Doc', desc: 'Annaffia 50 volte', goal: 50, field: 'totalWatered', coins: 150, gems: 2, emoji: '💧' },
  { id: 'botanist', name: 'Collezionista', desc: 'Scopri 12 varietà', goal: 12, field: 'collectionKnown', coins: 500, gems: 15, emoji: '📚' },
  { id: 'idle-master', name: 'Maestro Idle', desc: 'Raccogli 500 piante', goal: 500, field: 'totalHarvests', coins: 1000, gems: 20, emoji: '👑' },
  { id: 'coin-hoarder', name: 'Tesoriere', desc: 'Guadagna 50.000 monete', goal: 50000, field: 'totalCoinsEarned', coins: 2000, gems: 30, emoji: '💰' },
  { id: 'season-master', name: 'Guardiano delle Stagioni', desc: 'Raccogli in 4 stagioni', goal: 4, field: 'seasonsHarvested', coins: 800, gems: 10, emoji: '🍃' }
];

export const SEASONS = [
  { id: 'spring', name: 'Primavera', emoji: '🌸', growth: 1.1, water: 1, color: '#7cf5b4' },
  { id: 'summer', name: 'Estate', emoji: '☀️', growth: 1.25, water: 1.3, color: '#ffd166' },
  { id: 'autumn', name: 'Autunno', emoji: '🍂', growth: 0.9, water: 0.85, color: '#ff9f6b' },
  { id: 'winter', name: 'Inverno', emoji: '❄️', growth: 0.7, water: 0.6, color: '#9bd8ff' }
];

export const WEATHER = [
  { id: 'sun', name: 'Sole', emoji: '☀️', growth: 1.1, waterUse: 1.2 },
  { id: 'rain', name: 'Pioggia', emoji: '🌧️', growth: 1.05, waterUse: 0 },
  { id: 'cloud', name: 'Nuvoloso', emoji: '☁️', growth: 1, waterUse: 0.8 },
  { id: 'night', name: 'Notte', emoji: '🌙', growth: 0.9, waterUse: 0.7 }
];

export const SPIRITS = [
  { id: 'sprite', name: 'Fata', emoji: '🧚', desc: '+20% crescita', boost: 1.2 },
  { id: 'gnome', name: 'Gnomo', emoji: '🧙', desc: '-30% acqua consumata', water: 0.7 },
  { id: 'owl', name: 'Gufo', emoji: '🦉', desc: '+10% monete', coins: 1.1 }
];

export const MODES = [
  { id: 'garden', name: 'Giardino', emoji: '🌿', desc: 'Coltiva senza fretta' },
  { id: 'seasons', name: 'Stagioni', emoji: '🍃', desc: 'Ciclo stagionale e bonus' },
  { id: 'time', name: 'Sfida 60s', emoji: '⏱️', desc: 'Raccogli prima del tempo' },
  { id: 'daily', name: 'Quotidiana', emoji: '📅', desc: 'Seed del giorno e streak' },
  { id: 'zen', name: 'Zen', emoji: '🧘', desc: 'Crescita lenta, UI essenziale' },
  { id: 'greenhouse', name: 'Serra Mutanti', emoji: '🏡', desc: 'Piante ibride rare' }
];

export const FREE_SEEDS = ['lettuce', 'carrot', 'strawberry'];

export function findSeed(id) { return SEEDS[id] || SEEDS.lettuce; }
export function findUpgrade(id) { return UPGRADES.find((item) => item.id === id) || null; }
export function findSeason(id) { return SEASONS.find((item) => item.id === id) || SEASONS[0]; }
export function findWeather(id) { return WEATHER.find((item) => item.id === id) || WEATHER[0]; }
export function findMode(id) { return MODES.find((item) => item.id === id) || MODES[0]; }
