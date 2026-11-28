/* ===== MORFALIA · World & Mechanics Configuration ===== */

export const MAP_W = 60;
export const MAP_H = 46;
export const TILE_SIZE = 48;

export const DAY_LENGTH_SECONDS = 240; // 4 real minutes = 24 in-game hours

export const TILES = {
  withered: { id: 'withered', name: 'Terra Arida', walkable: true, colors: ['#8b8372', '#7d7565'], lush: false },
  grass: { id: 'grass', name: 'Prato Verde', walkable: true, colors: ['#62a866', '#569b5b'], lush: true },
  tall_grass: { id: 'tall_grass', name: 'Erba Alta', walkable: true, colors: ['#4d9655', '#42874a'], lush: true },
  flowers: { id: 'flowers', name: 'Prato Fiorito', walkable: true, colors: ['#65ad68', '#5aa15d'], lush: true },
  water: { id: 'water', name: 'Acqua Limpida', walkable: false, colors: ['#4299c2', '#3789b0'], lush: true },
  sand: { id: 'sand', name: 'Sabbia Dorata', walkable: true, colors: ['#d8c493', '#ccb683'], lush: true },
  ash: { id: 'ash', name: 'Sabbia di Cenere', walkable: true, colors: ['#777474', '#696666'], lush: false },
  rock: { id: 'rock', name: 'Basalto', walkable: true, colors: ['#6e6b73', '#615e66'], lush: false },
  path: { id: 'path', name: 'Sentiero', walkable: true, colors: ['#bfa988', '#b39d7b'], lush: true },
  bridge: { id: 'bridge', name: 'Ponte di Legno', walkable: true, colors: ['#9e7147', '#8f633c'], lush: true },
  soil: { id: 'soil', name: 'Terra Coltivata', walkable: true, colors: ['#734d34', '#66432c'], lush: true },
  mist: { id: 'mist', name: 'Spore Sopite', walkable: false, colors: ['#584969', '#4b3d5c'], lush: false },
  crystal_floor: { id: 'crystal_floor', name: 'Pietra Celeste', walkable: true, colors: ['#899ec2', '#798fb5'], lush: true },
  wood_floor: { id: 'wood_floor', name: 'Pavimento Legno', walkable: true, colors: ['#b6895b', '#a87b4e'], lush: true }
};

export const POWERS = [
  {
    id: 'hand',
    name: 'Mano',
    icon: '🖐️',
    color: '#d3aefb',
    energy: 0,
    unlockedByDefault: true,
    desc: 'Raccogli oggetti, parla con i Biomini, raccogli colture e accarezza i vicini.'
  },
  {
    id: 'sprout',
    name: 'Germoglio',
    icon: '🌱',
    color: '#79e087',
    energy: 3,
    taughtBy: 'fogliolo',
    desc: 'Trasforma terra arida in prato, erba alta e fiori rigogliosi.'
  },
  {
    id: 'splash',
    name: 'Zampillo',
    icon: '💧',
    color: '#63ccf7',
    energy: 3,
    taughtBy: 'gocciolino',
    desc: 'Innaffia le colture, scava piccoli stagni e lava via la cenere grigia.'
  },
  {
    id: 'flame',
    name: 'Fiammata',
    icon: '🔥',
    color: '#ff9666',
    energy: 4,
    taughtBy: 'bracino',
    desc: 'Accende falò, lanterne e fornaci; brucia i rovi secchi e fonde detriti.'
  },
  {
    id: 'cut',
    name: 'Taglio',
    icon: '🌿',
    color: '#a3df6d',
    energy: 4,
    taughtBy: 'ramosauro',
    desc: 'Taglia tronchi secchi, siepi spinose e alberi per ottenere legname.'
  },
  {
    id: 'smash',
    name: 'Spacca',
    icon: '🪨',
    color: '#d4b483',
    energy: 5,
    taughtBy: 'ciotolino',
    desc: 'Frantuma massi e vene minerali per estrarre pietra, ferro e cristalli.'
  },
  {
    id: 'spark',
    name: 'Scintilla',
    icon: '⚡',
    color: '#ffe26a',
    energy: 4,
    taughtBy: 'voltacchio',
    desc: 'Riattiva generatori antichi, lampioni elettrici e macchinari dei Custodi.'
  },
  {
    id: 'breeze',
    name: 'Brezza',
    icon: '🍃',
    color: '#9bf0e1',
    energy: 4,
    taughtBy: 'zefirino',
    desc: 'Dissipa le spore violacee della foresta e fa girare mulini a vento.'
  },
  {
    id: 'echo',
    name: 'Eco',
    icon: '✨',
    color: '#f2b8ff',
    energy: 6,
    taughtBy: 'luminella',
    desc: 'Armonizza una zona 3×3: fa sbocciare la vita, innaffia e ricarica i nodi.'
  }
];

export const REGIONS = [
  {
    id: 'landa',
    name: 'Landa Inaridita',
    restoredName: 'Valle Rinverdita',
    icon: '🌱',
    chapter: 1,
    unlockHint: 'Regione iniziale',
    desc: 'Una conca silenziosa attorno al vecchio Santuario del Seme, dove Mimo si è risvegliato.',
    sanctuaryName: 'Santuario del Seme',
    sanctuaryPos: { x: 30, y: 12 },
    spawnPos: { x: 30, y: 26 },
    skyWithered: '#6e6a60',
    skyLush: '#78b982',
    sanctuaryCost: { wood: 6, stone: 4, clay: 3 }
  },
  {
    id: 'costa',
    name: 'Costa di Cenere',
    restoredName: 'Baia Corallina',
    icon: '🐚',
    chapter: 2,
    unlockHint: 'Completa il Capitolo 1 nella Landa Inaridita',
    desc: 'Una baia prosciugata e coperta di sabbia grigia con un antico faro spento.',
    sanctuaryName: 'Faro delle Maree',
    sanctuaryPos: { x: 46, y: 11 },
    spawnPos: { x: 9, y: 22 },
    skyWithered: '#686b72',
    skyLush: '#56aac9',
    sanctuaryCost: { lumber: 5, glass: 4, stone: 6 }
  },
  {
    id: 'creste',
    name: 'Creste di Basalto',
    restoredName: 'Altopiano Dorato',
    icon: '⛰️',
    chapter: 3,
    unlockHint: 'Completa il Capitolo 2 sulla Costa di Cenere',
    desc: 'Terrazze rocciose percorse da vecchi cavi e turbine abbandonate dai Custodi.',
    sanctuaryName: 'Centrale Eolica',
    sanctuaryPos: { x: 30, y: 9 },
    spawnPos: { x: 30, y: 38 },
    skyWithered: '#5c5863',
    skyLush: '#c9a66b',
    sanctuaryCost: { iron_bar: 5, brick: 5, spark_core: 3 }
  },
  {
    id: 'foresta',
    name: 'Foresta di Nebbia',
    restoredName: 'Bosco Bioluminescente',
    icon: '🍄',
    chapter: 4,
    unlockHint: 'Completa il Capitolo 3 sulle Creste di Basalto',
    desc: 'Un antico bosco velato da spore soporifere, custode del Grande Albero Madre.',
    sanctuaryName: 'Albero Madre',
    sanctuaryPos: { x: 30, y: 18 },
    spawnPos: { x: 8, y: 23 },
    skyWithered: '#494257',
    skyLush: '#4a8f7a',
    sanctuaryCost: { lumber: 6, glow_mushroom: 6, pollen: 5 }
  },
  {
    id: 'isole',
    name: 'Isole Sospese',
    restoredName: 'Santuario Celeste',
    icon: '☁️',
    chapter: 5,
    unlockHint: 'Completa il Capitolo 4 nella Foresta di Nebbia',
    desc: 'Un arcipelago fluttuante di laboratori cristallini sospeso sopra le nuvole.',
    sanctuaryName: 'Faro di Risonanza',
    sanctuaryPos: { x: 30, y: 11 },
    spawnPos: { x: 30, y: 38 },
    skyWithered: '#5f687a',
    skyLush: '#86b5f5',
    sanctuaryCost: { crystal: 8, iron_bar: 6, glass: 6, spark_core: 4 }
  }
];

export const WEATHERS = [
  { id: 'sunny', name: 'Sereno', icon: '☀️' },
  { id: 'breeze', name: 'Brezza', icon: '🍃' },
  { id: 'rain', name: 'Pioggia', icon: '🌧️' },
  { id: 'aurora', name: 'Aurora', icon: '✨' }
];

export function getTimePeriod(hour) {
  if (hour >= 5 && hour < 9) return { id: 'alba', name: 'Alba', tint: 'rgba(255, 194, 133, 0.14)' };
  if (hour >= 9 && hour < 17) return { id: 'giorno', name: 'Giorno', tint: 'rgba(0, 0, 0, 0)' };
  if (hour >= 17 && hour < 21) return { id: 'sera', name: 'Sera', tint: 'rgba(242, 132, 92, 0.22)' };
  return { id: 'notte', name: 'Notte', tint: 'rgba(18, 28, 66, 0.44)' };
}

export const HARMONY_THRESHOLDS = [0, 80, 190, 340, 520]; // Lv 1..5
export function getHarmonyLevel(points) {
  let lv = 1;
  for (let i = 1; i < HARMONY_THRESHOLDS.length; i++) {
    if (points >= HARMONY_THRESHOLDS[i]) lv = i + 1;
  }
  const curMin = HARMONY_THRESHOLDS[lv - 1];
  const nextMin = HARMONY_THRESHOLDS[lv] || HARMONY_THRESHOLDS[HARMONY_THRESHOLDS.length - 1];
  const pct = lv >= 5 ? 100 : Math.min(100, Math.round(((points - curMin) / (nextMin - curMin)) * 100));
  return { level: lv, pct, points, nextTarget: nextMin };
}
