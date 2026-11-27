import type { BeastId, SaveDataV1 } from './types';

export interface OpenWorldNpcDef {
  id: string;
  name: string;
  icon: string;
  color: number;
  x: number;
  z: number;
  regionId: string;
  greetingEn: string;
  greetingIt: string;
  questTitleEn: string;
  questTitleIt: string;
  questDescEn: string;
  questDescIt: string;
  doneTextEn: string;
  doneTextIt: string;
  rewardPips: number;
  rewardCubes: number;
  checkComplete: (d: SaveDataV1) => boolean;
}

export interface CaveDef {
  id: string;
  nameEn: string;
  nameIt: string;
  entranceX: number;
  entranceZ: number;
  floorColor: number;
  crystalColor: number;
  beasts: BeastId[];
  rewardPips: number;
}

export interface HiddenCollectibleDef {
  id: string;
  kind: 'crystal-brick' | 'ocean-pearl' | 'ancient-relic';
  nameEn: string;
  nameIt: string;
  x: number;
  z: number;
  color: number;
}

export const HIDDEN_COLLECTIBLES: HiddenCollectibleDef[] = [
  // 8 Mainland Hidden Crystal Bricks
  { id: 'col-1', kind: 'crystal-brick', nameEn: 'Meadow Emerald Stud', nameIt: 'Perno Smeraldo Prateria', x: -17, z: -15, color: 0x4ade80 },
  { id: 'col-2', kind: 'crystal-brick', nameEn: 'Glacier Prism Block', nameIt: 'Prisma del Ghiacciaio', x: -30, z: -60, color: 0x7dd3fc },
  { id: 'col-3', kind: 'crystal-brick', nameEn: 'Frost Peak Shard', nameIt: 'Scheggia della Vetta', x: 6, z: -62, color: 0xbae6fd },
  { id: 'col-4', kind: 'crystal-brick', nameEn: 'Rust Mesa Gear', nameIt: 'Ingranaggio del Canyon', x: -62, z: -8, color: 0xf46025 },
  { id: 'col-5', kind: 'crystal-brick', nameEn: 'Badlands Amber Brick', nameIt: 'Mattoncino Ambra Canyon', x: -56, z: 26, color: 0xffca28 },
  { id: 'col-6', kind: 'crystal-brick', nameEn: 'Marsh Glow-Cube', nameIt: 'Cubo Luminescente Palude', x: 60, z: 22, color: 0x52b74b },
  { id: 'col-7', kind: 'crystal-brick', nameEn: 'Lagoon Sapphire Tile', nameIt: 'Tessera Zaffiro Laguna', x: 18, z: 54, color: 0x22d3ee },
  { id: 'col-8', kind: 'crystal-brick', nameEn: 'Obsidian Ember Core', nameIt: 'Nucleo Brace Obsidian', x: 58, z: -52, color: 0xff5a1f },
  // 6 Ocean Pearls (reachable by swimming!)
  { id: 'col-9', kind: 'ocean-pearl', nameEn: 'Southern Reef Pearl', nameIt: 'Perla della Barriera Sud', x: -24, z: 84, color: 0x99f6e4 },
  { id: 'col-10', kind: 'ocean-pearl', nameEn: 'Deep Trench Pearl', nameIt: 'Perla della Fossa Marina', x: 56, z: 86, color: 0x38bdf8 },
  { id: 'col-11', kind: 'ocean-pearl', nameEn: 'Western Wave Pearl', nameIt: 'Perla dell’Onda Ovest', x: -84, z: -6, color: 0x7dd3fc },
  { id: 'col-12', kind: 'ocean-pearl', nameEn: 'Northern Drift Pearl', nameIt: 'Perla della Corrente Nord', x: 24, z: -110, color: 0xeef6ff },
  { id: 'col-13', kind: 'ocean-pearl', nameEn: 'Eastern Mist Pearl', nameIt: 'Perla della Foschia Est', x: 112, z: -20, color: 0x67e8f9 },
  { id: 'col-14', kind: 'ocean-pearl', nameEn: 'Starlight Sea Pearl', nameIt: 'Perla del Mare Stellato', x: -64, z: 126, color: 0xc084fc },
  // 6 Ancient Relics on the 7 Distant & Outer Islands!
  { id: 'col-15', kind: 'ancient-relic', nameEn: 'Coral Crown Relic', nameIt: 'Corona Corallina Antica', x: 10, z: 114, color: 0xfde047 },
  { id: 'col-16', kind: 'ancient-relic', nameEn: 'Pharaoh Sun Scarab', nameIt: 'Scarabeo Solare Antico', x: -104, z: -64, color: 0xffca28 },
  { id: 'col-17', kind: 'ancient-relic', nameEn: 'Tempest Lightning Idol', nameIt: 'Idolo della Tempesta', x: -112, z: 48, color: 0x818cf8 },
  { id: 'col-18', kind: 'ancient-relic', nameEn: 'Abyssal Void Chalice', nameIt: 'Calice dell’Abisso', x: 98, z: 84, color: 0xf472b6 },
  { id: 'col-19', kind: 'ancient-relic', nameEn: 'Polar Star Totem', nameIt: 'Totem della Stella Polare', x: -12, z: -172, color: 0x22d3ee },
  { id: 'col-20', kind: 'ancient-relic', nameEn: 'Neo-Edo Shogun Seal', nameIt: 'Sigillo Shogun Neo-Edo', x: 148, z: -124, color: 0xf43f5e },
];

export const OPEN_WORLD_CAVES: CaveDef[] = [
  {
    id: 'cave-crystal',
    nameEn: 'Crystal Glacier Cavern',
    nameIt: 'Grotta dei Cristalli Glaciali',
    entranceX: -22,
    entranceZ: -54,
    floorColor: 0x1e3a5f,
    crystalColor: 0x7dd3fc,
    beasts: ['frost-scorpion', 'cryo-mammoth'],
    rewardPips: 500,
  },
  {
    id: 'cave-magma',
    nameEn: 'Obsidian Magma Grotto',
    nameIt: 'Grotta Magmatica Obsidian',
    entranceX: 52,
    entranceZ: -48,
    floorColor: 0x261414,
    crystalColor: 0xff5a1f,
    beasts: ['magma-beetle', 'thunder-rhino'],
    rewardPips: 650,
  },
  {
    id: 'cave-smuggler',
    nameEn: 'Smuggler Coral Cavern',
    nameIt: 'Grotta dei Contrabbandieri',
    entranceX: 14,
    entranceZ: 102,
    floorColor: 0x163840,
    crystalColor: 0x22d3ee,
    beasts: ['volt-crab', 'venom-viper', 'aero-hawk'],
    rewardPips: 750,
  },
];

export const OPEN_WORLD_NPCS: OpenWorldNpcDef[] = [
  {
    id: 'npc-kael',
    name: 'Ranger Kael',
    icon: '🧭',
    color: 0x52b74b,
    x: 6,
    z: -2,
    regionId: 'meadow',
    greetingEn: 'Welcome to the Great Brick-Wilds! Beyond the mainland lies the vast Ocean—dive right in to swim toward 4 distant Islands!',
    greetingIt: 'Benvenuto nelle Grandi Terre di Brick-Wilds! Oltre il continente si estende l’Oceano: tuffati e nuota fino alle 4 Isole Lontane!',
    questTitleEn: 'Call of the Ocean',
    questTitleIt: 'Richiamo dell’Oceano',
    questDescEn: 'Swim out to Coral Island in the southern Ocean.',
    questDescIt: 'Nuota nell’Oceano fino a scoprire l’Isola Corallina a Sud.',
    doneTextEn: 'You crossed the ocean like a true explorer! Take these Pips and a Core Cube.',
    doneTextIt: 'Hai attraversato l’oceano da vero esploratore! Ecco Gettoni e un Cubo Nucleo.',
    rewardPips: 450,
    rewardCubes: 1,
    checkComplete: (d) => d.discoveredRegions.includes('coral-isle'),
  },
  {
    id: 'npc-brine',
    name: 'Captain Brine',
    icon: '⚓',
    color: 0x29a7e8,
    x: -4,
    z: 98,
    regionId: 'coral-isle',
    greetingEn: 'Ahoy, swimmer! You made it to Coral Island! There is a hidden Smuggler Cavern right on this shore.',
    greetingIt: 'Ahoy, nuotatore! Ce l’hai fatta fino all’Isola Corallina! Su questa spiaggia si nasconde la Grotta dei Contrabbandieri.',
    questTitleEn: 'Smuggler’s Cavern',
    questTitleIt: 'La Grotta dei Contrabbandieri',
    questDescEn: 'Enter and clear the Smuggler Coral Cavern on Coral Island.',
    questDescIt: 'Entra e libera la Grotta dei Contrabbandieri sull’Isola Corallina.',
    doneTextEn: 'Arrr! You cleared the cavern and claimed the treasure! Here’s your pirate share.',
    doneTextIt: 'Arrr! Hai liberato la grotta e preso il tesoro! Ecco la tua parte da pirata.',
    rewardPips: 650,
    rewardCubes: 1,
    checkComplete: (d) => d.clearedCaves.includes('cave-smuggler'),
  },
  {
    id: 'npc-lyra',
    name: 'Archaeologist Lyra',
    icon: '🏺',
    color: 0xffca28,
    x: -94,
    z: -56,
    regionId: 'sunken-isle',
    greetingEn: 'Incredible! You swam all the way to Sunken Ruins Island! Ancient Chrono-Scarabs guard these pillars.',
    greetingIt: 'Incredibile! Hai nuotato fino all’Isola delle Rovine Perdute! Antichi Chrono-Scarab sorvegliano queste colonne.',
    questTitleEn: 'Island Cartographer',
    questTitleIt: 'Cartografa delle Isole',
    questDescEn: 'Discover at least 8 total regions (including distant Ocean Islands).',
    questDescIt: 'Scopri almeno 8 regioni totali (incluse le Isole Lontane nell’Oceano).',
    doneTextEn: 'Your map of the seas and islands is legendary! Take this reward.',
    doneTextIt: 'La tua mappa dei mari e delle isole è leggendaria! Ecco la tua ricompensa.',
    rewardPips: 850,
    rewardCubes: 2,
    checkComplete: (d) => d.discoveredRegions.length >= 8,
  },
  {
    id: 'npc-otto',
    name: 'Engineer Otto',
    icon: '🔧',
    color: 0xf46025,
    x: -44,
    z: 14,
    regionId: 'canyon',
    greetingEn: 'These Rust-Canyon relays are jammed! Activate Signal Towers across the continent to restore communications.',
    greetingIt: 'I ripetitori di Rust-Canyon sono bloccati! Attiva le Torri Segnale in giro per il continente per ripristinare la rete.',
    questTitleEn: 'Relay Network',
    questTitleIt: 'Rete di Segnali',
    questDescEn: 'Activate 4 Signal Towers in the Open-World.',
    questDescIt: 'Attiva 4 Torri Segnale nell’Open-World.',
    doneTextEn: 'Signal strength is at 100%! You’re a true Brick-Wilds engineer.',
    doneTextIt: 'Segnale al 100%! Sei un vero ingegnere di Brick-Wilds.',
    rewardPips: 700,
    rewardCubes: 2,
    checkComplete: (d) => d.activatedTowers.length >= 4,
  },
  {
    id: 'npc-mira',
    name: 'Herbalist Mira',
    icon: '🌿',
    color: 0x7c3aed,
    x: 38,
    z: 18,
    regionId: 'marsh',
    greetingEn: 'Rare glowing crystals grow inside the underground Caverns. Watch out for Synth-Beasts guarding them!',
    greetingIt: 'Cristalli rarissimi crescono dentro le Grotte sotterranee. Fai attenzione alle Synth-Bestie che li sorvegliano!',
    questTitleEn: 'Spelunker of Brick-Wilds',
    questTitleIt: 'Speleologo di Brick-Wilds',
    questDescEn: 'Explore and clear at least 2 different Underground Caverns.',
    questDescIt: 'Esplora e libera almeno 2 diverse Grotte sotterranee.',
    doneTextEn: 'Splendid crystal samples! Hearth-Haven’s greenhouse will flourish.',
    doneTextIt: 'Campioni di cristallo splendidi! La serra di Hearth-Haven fiorirà.',
    rewardPips: 750,
    rewardCubes: 2,
    checkComplete: (d) => d.clearedCaves.length >= 2,
  },
  {
    id: 'npc-sol',
    name: 'Guardian Sol',
    icon: '🌋',
    color: 0xe63946,
    x: 86,
    z: 74,
    regionId: 'abyss-isle',
    greetingEn: 'Only the bravest swim through the deep ocean to Abyss Atoll! A Void-Kraken prowls these dark waters.',
    greetingIt: 'Solo i più coraggiosi nuotano fino all’Isola dell’Abisso! Un Void-Kraken si aggira in queste acque oscure.',
    questTitleEn: 'Master of the Abyss',
    questTitleIt: 'Signore dell’Abisso',
    questDescEn: 'Clear all 3 Caverns OR defeat 3 Bosses across the world.',
    questDescIt: 'Libera tutte e 3 le Grotte OPPURE sconfiggi 3 Boss nel mondo.',
    doneTextEn: 'Even the Abyss bows before your squad! Take this royal bounty.',
    doneTextIt: 'Perfino l’Abisso si inchina alla tua squadra! Ecco il tesoro reale.',
    rewardPips: 1200,
    rewardCubes: 3,
    checkComplete: (d) => d.clearedCaves.length >= 3 || d.stats.bosses_defeated >= 3,
  },
];
