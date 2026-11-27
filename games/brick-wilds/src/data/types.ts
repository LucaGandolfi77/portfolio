export type ElementType = 'none' | 'fire' | 'shock' | 'frost';

export type WeaponModeId = 'standard' | 'fire' | 'frost' | 'shock';

export type HeroId = 'ayla' | 'varn' | 'tessa' | 'bram';

export type OutfitId = 'default' | 'cyber' | 'dino' | 'shark' | 'knight' | 'champion';

export type BeastId =
  | 'opti-raptor'
  | 'solar-stag'
  | 'volt-crab'
  | 'stalker-lynx'
  | 'cryo-mammoth'
  | 'magma-beetle'
  | 'aero-hawk'
  | 'venom-viper'
  | 'frost-scorpion'
  | 'thunder-rhino'
  | 'chrono-scarab'
  | 'samurai-mantis'
  | 'steam-golem'
  | 'pyro-wyvern'
  | 'leviathan-mech'
  | 'pharaoh-sphinx'
  | 'void-kraken'
  | 'apex-rex'
  | 'solar-colossus'
  | 'chronos-prime';

export type PlotThemeId = 'frontier' | 'prehistoric' | 'cyber' | 'carnival';

export type HouseAddonId = 'none' | 'solar-array' | 'hero-banner' | 'firework-tower' | 'crystal-garden';

export type ModBlockId = 'pip-magnet' | 'confetti-boom' | 'big-head' | 'double-pips';

export type BiomeId =
  | 'sun-canopy'
  | 'rust-canyon'
  | 'emerald-marsh'
  | 'crystal-coast'
  | 'frost-spire'
  | 'storm-mesa'
  | 'eclipse-citadel'
  | 'solar-sanctum'
  | 'neo-edo'
  | 'clockwork-victorian'
  | 'helios-dynasty'
  | 'starlight-nexus'
  | 'rome-colosseum'
  | 'viking-fjords'
  | 'maya-solaris'
  | 'medieval-citadel';

export type GameMode = 'title' | 'hub' | 'expedition' | 'cutscene' | 'roguelite' | 'titan-hunt' | 'openworld';

export type QualityLevel = 'low' | 'medium' | 'high';

export interface GameSettings {
  quality: QualityLevel;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  screenShake: boolean;
  damageNumbers: boolean;
}

export type Lang = 'en' | 'it';

export interface SpecialSkillDef {
  id: string;
  nameEn: string;
  nameIt: string;
  descEn: string;
  descIt: string;
  cooldown: number;
  icon: string;
  color: number;
}

export interface WeaponModeDef {
  id: WeaponModeId;
  element: ElementType;
  nameEn: string;
  nameIt: string;
  descEn: string;
  descIt: string;
  icon: string;
  color: number;
  damageMult: number;
  cooldownMult: number;
  effectiveAgainst: BeastId[];
}

export interface HeroDef {
  id: HeroId;
  name: string;
  role: string;
  weapon: string;
  maxHearts: number;
  speed: number;
  attackDamage: number;
  attackCooldown: number;
  range: number;
  projectileSpeed: number;
  colorPrimary: number;
  colorSecondary: number;
  colorAccent: number;
  colorHair: number;
  unlockCostCubes: number;
  special: SpecialSkillDef;
}

export interface OutfitDef {
  id: OutfitId;
  name: string;
  costPips: number;
  bodyColor: number;
  headAccessory: 'none' | 'visor' | 'dino-crest' | 'shark-fin' | 'plume' | 'crown';
  accentColor: number;
}

export interface WeakPointDef {
  id: string;
  label: string;
  hp: number;
  offset: [number, number, number];
  size: [number, number, number];
  color: number;
  weakTo: ElementType;
  onBreak: 'blind' | 'fire-boom' | 'frost-nova' | 'drop-loot' | 'reveal-stealth' | 'drop-weapon' | 'stun';
}

export interface BeastDef {
  id: BeastId;
  name: string;
  loreEn: string;
  loreIt: string;
  maxHp: number;
  speed: number;
  radius: number;
  attackDamage: number;
  attackRange: number;
  attackCooldown: number;
  pipReward: number;
  xpReward: number;
  weakElement: ElementType;
  isBoss?: boolean;
  canStealth?: boolean;
  flying?: boolean;
  armorColor: number;
  chassisColor: number;
  glowColor: number;
  weakPoints: WeakPointDef[];
}

export interface PlotDef {
  id: string;
  name: string;
  category: 'house' | 'facility' | 'landmark';
  position: [number, number, number];
  unlockCubes: number;
  buildCostPips: number;
  defaultTheme: PlotThemeId;
}

export interface HouseAddonDef {
  id: HouseAddonId;
  nameEn: string;
  nameIt: string;
  costPips: number;
  icon: string;
}

export interface CommunityQuestDef {
  id: string;
  category: 'hunt' | 'explore' | 'village' | 'boss';
  titleKey: string;
  descKey: string;
  target: number;
  rewardCubes: number;
  rewardPips: number;
  metric:
    | 'beasts_defeated'
    | 'weakpoints_broken'
    | 'elemental_reactions'
    | 'plots_customized'
    | 'bosses_defeated'
    | 'pips_collected'
    | 'towers_activated'
    | 'chests_opened'
    | 'regions_discovered';
}

export interface HazardPlacement {
  type: 'campfire' | 'shock-crystal' | 'cryo-vent' | 'blast-barrel';
  x: number;
  z: number;
}

export interface WaveSpawn {
  beastId: BeastId;
  count: number;
}

export interface BiomeDef {
  id: BiomeId;
  name: string;
  eraTag?: string;
  isAlternateWorld?: boolean;
  unlockCubes: number;
  skyTop: number;
  skyBottom: number;
  groundColor: number;
  accentGroundColor: number;
  waterColor: number;
  foliageColor: number;
  rockColor: number;
  rewardCubes: number;
  rewardPips: number;
  waves: WaveSpawn[][];
  hazards: HazardPlacement[];
}

export interface CutsceneSlide {
  speaker: string;
  avatarIcon: string;
  titleEn: string;
  titleIt: string;
  textEn: string;
  textIt: string;
  cameraPos: [number, number, number];
  cameraLook: [number, number, number];
}

export interface StoryChapterDef {
  id: string;
  chapterNumber: number;
  biomeId: BiomeId;
  titleEn: string;
  titleIt: string;
  subtitleEn: string;
  subtitleIt: string;
  introSlides: CutsceneSlide[];
  outroSlides: CutsceneSlide[];
}

export interface HeroProgress {
  level: number;
  xp: number;
  damageTier: number;
  heartTier: number;
  outfit: OutfitId;
}

export interface PlotState {
  built: boolean;
  theme: PlotThemeId;
  addon: HouseAddonId;
}

export interface SaveDataV1 {
  version: 1;
  pips: number;
  coreCubes: number;
  selectedHeroP1: HeroId;
  selectedHeroP2: HeroId;
  unlockedHeroes: HeroId[];
  unlockedOutfits: OutfitId[];
  unlockedBiomes: BiomeId[];
  completedBiomes: BiomeId[];
  completedChapters: string[];
  discoveredBeasts: BeastId[];
  plots: Record<string, PlotState>;
  enabledMods: ModBlockId[];
  unlockedMods: ModBlockId[];
  heroProgress: Record<HeroId, HeroProgress>;
  stats: Record<CommunityQuestDef['metric'], number>;
  claimedQuests: string[];
  trackedQuestId: string | null;
  sanctuaryForgeTier: number;
  rogueliteBestWave: number;
  titanBestTimeSec: number | null;
  sculpture: Array<{ x: number; y: number; z: number; color: number }>;
  activatedTowers: string[];
  discoveredRegions: string[];
  clearedCaves: string[];
  completedNpcQuests: string[];
  collectedRelics: string[];
  defeatedCounts: Partial<Record<BeastId, number>>;
  unlockedAchievements: string[];
  ownedWeapons: string[];
  materials: {
    fireShards: number;
    frostShards: number;
    voltShards: number;
    chronoDust: number;
  };
  activeBuff: 'none' | 'vitality' | 'swift' | 'overcharge';
  settings: GameSettings;
}
