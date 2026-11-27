import type { SaveDataV1 } from './types';

export interface ForgeWeaponDef {
  id: string;
  nameEn: string;
  nameIt: string;
  descEn: string;
  descIt: string;
  costPips: number;
  materialKey: keyof SaveDataV1['materials'];
  materialCost: number;
  damageBonusPct: number;
  icon: string;
}

export const FORGE_WEAPONS: ForgeWeaponDef[] = [
  {
    id: 'solar-longbow',
    nameEn: 'Helios Relic Bow',
    nameIt: 'Arco Reliquia Helios',
    descEn: 'Permanent +15% global squad attack damage.',
    descIt: '+15% danno d’attacco permanente per tutta la squadra.',
    costPips: 500,
    materialKey: 'fireShards',
    materialCost: 2,
    damageBonusPct: 15,
    icon: '🏹',
  },
  {
    id: 'cryo-halberd',
    nameEn: 'Glacial Shogun Halberd',
    nameIt: 'Alabarda Glaciale Shogun',
    descEn: 'Permanent +20% global squad attack damage.',
    descIt: '+20% danno d’attacco permanente per tutta la squadra.',
    costPips: 850,
    materialKey: 'frostShards',
    materialCost: 3,
    damageBonusPct: 20,
    icon: '❄️',
  },
  {
    id: 'tesla-cannon',
    nameEn: 'Clockwork Volt Repeater',
    nameIt: 'Ripetitore Volt Steampunk',
    descEn: 'Permanent +25% global squad attack damage.',
    descIt: '+25% danno d’attacco permanente per tutta la squadra.',
    costPips: 1200,
    materialKey: 'voltShards',
    materialCost: 3,
    damageBonusPct: 25,
    icon: '⚡',
  },
  {
    id: 'chronos-blade',
    nameEn: 'Chronos Multiverse Relic',
    nameIt: 'Reliquia Multiverso Chronos',
    descEn: 'Permanent +35% global squad attack damage!',
    descIt: '+35% danno d’attacco permanente per tutta la squadra!',
    costPips: 2000,
    materialKey: 'chronoDust',
    materialCost: 4,
    damageBonusPct: 35,
    icon: '🌌',
  },
];

export interface MaterialItemDef {
  key: keyof SaveDataV1['materials'];
  nameEn: string;
  nameIt: string;
  costPips: number;
  sellPips: number;
  icon: string;
}

export const MATERIAL_ITEMS: MaterialItemDef[] = [
  { key: 'fireShards', nameEn: 'Pyro Shard', nameIt: 'Scheggia di Fuoco', costPips: 160, sellPips: 95, icon: '🔥' },
  { key: 'frostShards', nameEn: 'Cryo Shard', nameIt: 'Scheggia di Ghiaccio', costPips: 160, sellPips: 95, icon: '❄️' },
  { key: 'voltShards', nameEn: 'Volt Shard', nameIt: 'Scheggia Fulmine', costPips: 160, sellPips: 95, icon: '⚡' },
  { key: 'chronoDust', nameEn: 'Chrono Dust', nameIt: 'Polvere Temporale', costPips: 320, sellPips: 190, icon: '⏳' },
];

export interface AchievementDef {
  id: string;
  icon: string;
  titleEn: string;
  titleIt: string;
  descEn: string;
  descIt: string;
  rewardPips: number;
  rewardCubes: number;
  check: (d: SaveDataV1) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'ach-first-blood',
    icon: '🧱',
    titleEn: 'First Snap-Victory',
    titleIt: 'Prima Vittoria a Blocchi',
    descEn: 'Defeat your first Synth-Beast.',
    descIt: 'Sconfiggi la tua prima Synth-Bestia.',
    rewardPips: 200,
    rewardCubes: 0,
    check: (d) => d.stats.beasts_defeated >= 1,
  },
  {
    id: 'ach-alchemist',
    icon: '💥',
    titleEn: 'Brick Alchemist',
    titleIt: 'Alchimista Elementale',
    descEn: 'Trigger 10 elemental reactions or combos.',
    descIt: 'Innesca 10 reazioni o combo elementali.',
    rewardPips: 400,
    rewardCubes: 1,
    check: (d) => d.stats.elemental_reactions >= 10,
  },
  {
    id: 'ach-architect',
    icon: '🏘️',
    titleEn: 'Master Architect',
    titleIt: 'Mastro Architetto',
    descEn: 'Build or customize 5 structures in Hearth-Haven.',
    descIt: 'Costruisci o personalizza 5 strutture a Hearth-Haven.',
    rewardPips: 450,
    rewardCubes: 1,
    check: (d) => d.stats.plots_customized >= 5,
  },
  {
    id: 'ach-explorer',
    icon: '🌍',
    titleEn: 'World Cartographer',
    titleIt: 'Cartografo dell’Open-World',
    descEn: 'Discover all 6 Open-World regions.',
    descIt: 'Scopri tutte e 6 le regioni dell’Open-World.',
    rewardPips: 700,
    rewardCubes: 2,
    check: (d) => d.discoveredRegions.length >= 6,
  },
  {
    id: 'ach-towers',
    icon: '📡',
    titleEn: 'Signal Master',
    titleIt: 'Signore delle Torri',
    descEn: 'Activate all 6 Open-World Signal Towers.',
    descIt: 'Attiva tutte e 6 le Torri Segnale dell’Open-World.',
    rewardPips: 800,
    rewardCubes: 2,
    check: (d) => d.activatedTowers.length >= 6,
  },
  {
    id: 'ach-forge',
    icon: '🔨',
    titleEn: 'Relic Forger',
    titleIt: 'Fabbro di Reliquie',
    descEn: 'Craft at least 2 Relic Weapons at the Elemental Forge.',
    descIt: 'Forgia almeno 2 Armi Reliquia alla Fucina Elementale.',
    rewardPips: 600,
    rewardCubes: 1,
    check: (d) => d.ownedWeapons.length >= 2,
  },
  {
    id: 'ach-multiverse',
    icon: '🌀',
    titleEn: 'Multiverse Traveler',
    titleIt: 'Viaggiatore del Multiverso',
    descEn: 'Complete any Alternate-Era / Alternate-Future level.',
    descIt: 'Completa un livello ambientato in un’Epoca o Futuro Alternativo.',
    rewardPips: 650,
    rewardCubes: 1,
    check: (d) =>
      ['neo-edo', 'clockwork-victorian', 'helios-dynasty', 'starlight-nexus'].some((id) =>
        d.completedBiomes.includes(id as SaveDataV1['completedBiomes'][number]),
      ),
  },
  {
    id: 'ach-boss-hunter',
    icon: '👑',
    titleEn: 'Titan Slayer',
    titleIt: 'Cacciatore di Titani',
    descEn: 'Defeat 5 Boss Synth-Beasts.',
    descIt: 'Sconfiggi 5 Boss Synth-Bestie.',
    rewardPips: 900,
    rewardCubes: 2,
    check: (d) => d.stats.bosses_defeated >= 5,
  },
  {
    id: 'ach-bestiary',
    icon: '📖',
    titleEn: 'Living Encyclopedia',
    titleIt: 'Enciclopedia Vivente',
    descEn: 'Discover at least 12 distinct Synth-Beast species.',
    descIt: 'Scopri almeno 12 specie diverse di Synth-Bestie.',
    rewardPips: 750,
    rewardCubes: 2,
    check: (d) => d.discoveredBeasts.length >= 12,
  },
  {
    id: 'ach-solar-colossus',
    icon: '☀️',
    titleEn: 'Fall of the Colossus',
    titleIt: 'Caduta del Colosso',
    descEn: 'Defeat the Solar-Colossus in Solar-Sanctum Core.',
    descIt: 'Sconfiggi il Solar-Colossus nel Solar-Sanctum Core.',
    rewardPips: 1200,
    rewardCubes: 2,
    check: (d) => (d.defeatedCounts['solar-colossus'] ?? 0) >= 1,
  },
  {
    id: 'ach-roguelite',
    icon: '♾️',
    titleEn: 'Endless Champion',
    titleIt: 'Campione Infinito',
    descEn: 'Reach Wave 5 in Endless Roguelite Arena.',
    descIt: 'Raggiungi l’Ondata 5 nell’Arena Infinita Roguelite.',
    rewardPips: 800,
    rewardCubes: 1,
    check: (d) => d.rogueliteBestWave >= 5,
  },
  {
    id: 'ach-true-ending',
    icon: '🌌',
    titleEn: 'Savior of Time (True Ending)',
    titleIt: 'Salvatore del Tempo (Vero Finale)',
    descEn: 'Defeat Chronos-Prime in Starlight-Nexus to unlock the True Ending!',
    descIt: 'Sconfiggi Chronos-Prime nello Starlight-Nexus per sbloccare il Vero Finale!',
    rewardPips: 2500,
    rewardCubes: 5,
    check: (d) => (d.defeatedCounts['chronos-prime'] ?? 0) >= 1,
  },
];

export interface FinaleClueDef {
  id: string;
  order: number;
  titleEn: string;
  titleIt: string;
  clueEn: string;
  clueIt: string;
  isUnlocked: (d: SaveDataV1) => boolean;
}

export const FINALE_CLUES: FinaleClueDef[] = [
  {
    id: 'clue-1',
    order: 1,
    titleEn: 'Clue I — The Crimson Beam',
    titleIt: 'Indizio I — Il Raggio Cremisi',
    clueEn: 'The signal corrupting the Synth-Beasts did not originate in Hearth-Haven. Collect Core Cubes by clearing Expeditions and activating Open-World Signal Towers.',
    clueIt: 'Il segnale che corrompe le Synth-Bestie non nasce a Hearth-Haven. Raccogli Cubi Nucleo completando Spedizioni e attivando le Torri Segnale nell’Open-World.',
    isUnlocked: () => true,
  },
  {
    id: 'clue-2',
    order: 2,
    titleEn: 'Clue II — Fractures in Time',
    titleIt: 'Indizio II — Fratture nel Tempo',
    clueEn: 'Visit the Beacon Lighthouse in Hearth-Haven: it opens portals to Alternate Eras (Neo-Edo 2199, Clockwork-Victorian, Helios-Dynasty 3000 BC).',
    clueIt: 'Visita il Faro Segnale a Hearth-Haven: apre i portali verso le Epoche Alternative (Neo-Edo 2199, Clockwork-Victorian, Helios-Dynasty 3000 a.C.).',
    isUnlocked: (d) => d.coreCubes >= 2 || d.stats.beasts_defeated >= 5,
  },
  {
    id: 'clue-3',
    order: 3,
    titleEn: 'Clue III — Elemental Alchemy',
    titleIt: 'Indizio III — Alchimia Elementale',
    clueEn: 'Bosses from alternate futures resist brute force. Forge Relic Weapons at the Elemental Forge using Shards & Chrono Dust, and chain Fire + Frost for Thermal Shatter!',
    clueIt: 'I Boss dei futuri alternativi resistono alla forza bruta. Forgia Armi Reliquia alla Fucina Elementale con Schegge e Polvere Temporale, e combina Fuoco + Ghiaccio!',
    isUnlocked: (d) => d.coreCubes >= 4 || d.stats.elemental_reactions >= 4,
  },
  {
    id: 'clue-4',
    order: 4,
    titleEn: 'Clue IV — The Golden Colossus',
    titleIt: 'Indizio IV — Il Colosso Dorato',
    clueEn: 'Reach 8 Core Cubes to unlock Solar-Sanctum Core and defeat Solar-Colossus—but its logs reveal an even deeper master pulling the strings across timelines.',
    clueIt: 'Raggiungi 8 Cubi Nucleo per sbloccare Solar-Sanctum Core e sconfiggere il Solar-Colossus: i suoi archivi rivelano però un burattinaio ancora più potente oltre il tempo.',
    isUnlocked: (d) => d.coreCubes >= 6 || d.completedBiomes.length >= 3,
  },
  {
    id: 'clue-5',
    order: 5,
    titleEn: 'Clue V — The Starlight-Nexus',
    titleIt: 'Indizio V — Lo Starlight-Nexus',
    clueEn: 'Gather 12 Core Cubes to unlock the final Alternate Future: Starlight-Nexus! There, Void-Kraken guards the throne of Chronos-Prime.',
    clueIt: 'Raccogli 12 Cubi Nucleo per sbloccare l’ultimo Futuro Alternativo: Starlight-Nexus! Lì, Void-Kraken protegge il trono di Chronos-Prime.',
    isUnlocked: (d) => d.coreCubes >= 8 || (d.defeatedCounts['solar-colossus'] ?? 0) >= 1,
  },
  {
    id: 'clue-6',
    order: 6,
    titleEn: 'Clue VI — True Ending Key',
    titleIt: 'Indizio VI — Chiave del Vero Finale',
    clueEn: 'Chronos-Prime is weak to ⚡ Volt Rounds! Shatter its Time-Core with Shock to drop a Heavy Weapon and silence the Multiverse Signal forever.',
    clueIt: 'Chronos-Prime è vulnerabile alle munizioni ⚡ Fulmine! Frantuma il suo Nucleo Temporale col Fulmine per spegnere il Segnale del Multiverso per sempre.',
    isUnlocked: (d) => d.coreCubes >= 10 || d.discoveredBeasts.includes('chronos-prime'),
  },
];
