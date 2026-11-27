import { BIOMES } from '../data/expeditions';
import { MOD_BLOCKS } from '../data/gadgets';
import { HEROES, OUTFITS } from '../data/heroes';
import { COMMUNITY_QUESTS, HOUSE_ADDONS, HUB_PLOTS } from '../data/hubPlots';
import { ACHIEVEMENTS, FORGE_WEAPONS, MATERIAL_ITEMS, type AchievementDef } from '../data/multiverseAndLibrary';
import type {
  BeastId,
  BiomeId,
  CommunityQuestDef,
  HeroId,
  HouseAddonId,
  ModBlockId,
  OutfitId,
  PlotState,
  PlotThemeId,
  SaveDataV1,
} from '../data/types';

export const SAVE_KEY = 'brickwilds.v1.save';

export function createDefaultSave(): SaveDataV1 {
  const plots: Record<string, PlotState> = {};
  for (const p of HUB_PLOTS) {
    plots[p.id] = {
      built: p.id === 'hero-lodge' || p.id === 'wardrobe-booth',
      theme: p.defaultTheme,
      addon: 'none',
    };
  }
  return {
    version: 1,
    pips: 350,
    coreCubes: 0,
    selectedHeroP1: 'ayla',
    selectedHeroP2: 'varn',
    unlockedHeroes: ['ayla', 'varn'],
    unlockedOutfits: ['default'],
    unlockedBiomes: ['sun-canopy'],
    completedBiomes: [],
    completedChapters: [],
    discoveredBeasts: ['opti-raptor', 'solar-stag'],
    plots,
    enabledMods: [],
    unlockedMods: [],
    heroProgress: {
      ayla: { level: 1, xp: 0, damageTier: 0, heartTier: 0, outfit: 'default' },
      varn: { level: 1, xp: 0, damageTier: 0, heartTier: 0, outfit: 'default' },
      tessa: { level: 1, xp: 0, damageTier: 0, heartTier: 0, outfit: 'default' },
      bram: { level: 1, xp: 0, damageTier: 0, heartTier: 0, outfit: 'default' },
    },
    stats: {
      beasts_defeated: 0,
      weakpoints_broken: 0,
      elemental_reactions: 0,
      plots_customized: 0,
      bosses_defeated: 0,
      pips_collected: 0,
      towers_activated: 0,
      chests_opened: 0,
      regions_discovered: 1,
    },
    claimedQuests: [],
    trackedQuestId: 'q-first-hunt',
    sanctuaryForgeTier: 0,
    rogueliteBestWave: 0,
    titanBestTimeSec: null,
    sculpture: [
      { x: 0, y: 0, z: 0, color: 0xf46025 },
      { x: 0, y: 1, z: 0, color: 0xffca28 },
      { x: 0, y: 2, z: 0, color: 0x22d3ee },
    ],
    activatedTowers: [],
    discoveredRegions: ['meadow'],
    clearedCaves: [],
    completedNpcQuests: [],
    collectedRelics: [],
    defeatedCounts: {},
    unlockedAchievements: [],
    ownedWeapons: [],
    materials: {
      fireShards: 1,
      frostShards: 1,
      voltShards: 1,
      chronoDust: 0,
    },
    activeBuff: 'none',
    settings: {
      quality: 'high',
      sfxEnabled: true,
      musicEnabled: true,
      screenShake: true,
      damageNumbers: true,
    },
  };
}

export class GameState {
  data: SaveDataV1;
  private storage: Pick<Storage, 'getItem' | 'setItem'> | null;

  constructor(storage?: Pick<Storage, 'getItem' | 'setItem'> | null) {
    this.storage = storage !== undefined ? storage : typeof localStorage !== 'undefined' ? localStorage : null;
    this.data = this.load();
  }

  private load(): SaveDataV1 {
    const def = createDefaultSave();
    if (!this.storage) return def;
    try {
      const raw = this.storage.getItem(SAVE_KEY);
      if (!raw) return def;
      const parsed = JSON.parse(raw) as Partial<SaveDataV1>;
      if (parsed.version !== 1) return def;

      const mergedPlots: Record<string, PlotState> = { ...def.plots };
      if (parsed.plots) {
        for (const [k, v] of Object.entries(parsed.plots)) {
          mergedPlots[k] = {
            built: Boolean(v.built),
            theme: v.theme ?? 'frontier',
            addon: v.addon ?? 'none',
          };
        }
      }

      return {
        ...def,
        ...parsed,
        plots: mergedPlots,
        completedChapters: parsed.completedChapters ?? [],
        discoveredBeasts: parsed.discoveredBeasts ?? def.discoveredBeasts,
        rogueliteBestWave: parsed.rogueliteBestWave ?? 0,
        titanBestTimeSec: parsed.titanBestTimeSec ?? null,
        sculpture: parsed.sculpture ?? def.sculpture,
        trackedQuestId: parsed.trackedQuestId ?? def.trackedQuestId,
        activatedTowers: parsed.activatedTowers ?? [],
        discoveredRegions: parsed.discoveredRegions ?? def.discoveredRegions,
        clearedCaves: parsed.clearedCaves ?? [],
        completedNpcQuests: parsed.completedNpcQuests ?? [],
        collectedRelics: parsed.collectedRelics ?? [],
        defeatedCounts: parsed.defeatedCounts ?? {},
        unlockedAchievements: parsed.unlockedAchievements ?? [],
        ownedWeapons: parsed.ownedWeapons ?? [],
        materials: { ...def.materials, ...(parsed.materials ?? {}) },
        activeBuff: parsed.activeBuff ?? 'none',
        settings: { ...def.settings, ...(parsed.settings ?? {}) },
        heroProgress: { ...def.heroProgress, ...(parsed.heroProgress ?? {}) },
        stats: { ...def.stats, ...(parsed.stats ?? {}) },
      };
    } catch {
      return def;
    }
  }

  save(): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch {
      // Ignore quota errors
    }
  }

  reset(): void {
    this.data = createDefaultSave();
    this.save();
  }

  hasMod(mod: ModBlockId): boolean {
    return this.data.enabledMods.includes(mod);
  }

  discoverBeast(beastId: BeastId): void {
    if (!this.data.discoveredBeasts.includes(beastId)) {
      this.data.discoveredBeasts.push(beastId);
      this.save();
    }
  }

  completeChapter(chapterId: string): void {
    if (!this.data.completedChapters.includes(chapterId)) {
      this.data.completedChapters.push(chapterId);
      this.save();
    }
  }

  saveSculpture(voxels: Array<{ x: number; y: number; z: number; color: number }>): void {
    this.data.sculpture = voxels.slice(0, 64);
    this.save();
  }

  recordRogueliteWave(wave: number): void {
    if (wave > this.data.rogueliteBestWave) {
      this.data.rogueliteBestWave = wave;
      this.save();
    }
  }

  recordTitanTime(seconds: number): void {
    if (this.data.titanBestTimeSec === null || seconds < this.data.titanBestTimeSec) {
      this.data.titanBestTimeSec = Math.round(seconds * 10) / 10;
      this.save();
    }
  }

  isPlotBuilt(plotId: string): boolean {
    return Boolean(this.data.plots[plotId]?.built);
  }

  setTrackedQuest(questId: string | null): void {
    this.data.trackedQuestId = questId;
    this.save();
  }

  activateTower(towerId: string): boolean {
    if (this.data.activatedTowers.includes(towerId)) return false;
    this.data.activatedTowers.push(towerId);
    this.data.stats.towers_activated = this.data.activatedTowers.length;
    this.addCoreCubes(1);
    this.addPips(350);
    return true;
  }

  discoverRegion(regionId: string): boolean {
    if (this.data.discoveredRegions.includes(regionId)) return false;
    this.data.discoveredRegions.push(regionId);
    this.data.stats.regions_discovered = this.data.discoveredRegions.length;
    this.save();
    return true;
  }

  markCaveCleared(caveId: string, rewardPips: number): boolean {
    if (this.data.clearedCaves.includes(caveId)) return false;
    this.data.clearedCaves.push(caveId);
    this.addPips(rewardPips);
    this.addCoreCubes(1);
    return true;
  }

  claimNpcQuest(npcId: string, rewardPips: number, rewardCubes: number): boolean {
    if (this.data.completedNpcQuests.includes(npcId)) return false;
    this.data.completedNpcQuests.push(npcId);
    this.addPips(rewardPips);
    if (rewardCubes > 0) this.addCoreCubes(rewardCubes);
    return true;
  }

  collectRelic(relicId: string): { collected: boolean; bonusCube: boolean; total: number } {
    if (this.data.collectedRelics.includes(relicId)) {
      return { collected: false, bonusCube: false, total: this.data.collectedRelics.length };
    }
    this.data.collectedRelics.push(relicId);
    this.addPips(250);
    this.data.materials.chronoDust += 1;
    const total = this.data.collectedRelics.length;
    const bonusCube = total % 5 === 0;
    if (bonusCube) this.addCoreCubes(1);
    this.save();
    return { collected: true, bonusCube, total };
  }

  updateSettings(patch: Partial<SaveDataV1['settings']>): void {
    this.data.settings = { ...this.data.settings, ...patch };
    this.save();
  }

  addPips(amount: number): number {
    const mult = this.hasMod('double-pips') ? 2 : 1;
    const gained = Math.max(0, Math.round(amount * mult));
    this.data.pips += gained;
    this.data.stats.pips_collected += gained;
    this.save();
    return gained;
  }

  addCoreCubes(amount: number): void {
    this.data.coreCubes += Math.max(0, amount);
    for (const biome of Object.values(BIOMES)) {
      if (this.data.coreCubes >= biome.unlockCubes && !this.data.unlockedBiomes.includes(biome.id)) {
        this.data.unlockedBiomes.push(biome.id);
      }
    }
    this.save();
  }

  recordStat(metric: CommunityQuestDef['metric'], delta = 1): void {
    this.data.stats[metric] = (this.data.stats[metric] ?? 0) + delta;
    this.save();
  }

  addHeroXp(heroId: HeroId, xp: number): boolean {
    const prog = this.data.heroProgress[heroId];
    prog.xp += xp;
    let leveled = false;
    while (prog.xp >= prog.level * 120) {
      prog.xp -= prog.level * 120;
      prog.level += 1;
      leveled = true;
    }
    this.save();
    return leveled;
  }

  getHeroDamage(heroId: HeroId): number {
    const base = HEROES[heroId].attackDamage;
    const prog = this.data.heroProgress[heroId];
    const weaponPct = this.data.ownedWeapons.reduce((acc, wId) => {
      const def = FORGE_WEAPONS.find((w) => w.id === wId);
      return acc + (def ? def.damageBonusPct : 0);
    }, 0);
    const buffMult = this.data.activeBuff === 'overcharge' ? 1.25 : 1.0;
    return Math.round(
      base *
        (1 + (prog.level - 1) * 0.1 + prog.damageTier * 0.18 + this.data.sanctuaryForgeTier * 0.1 + weaponPct / 100) *
        buffMult,
    );
  }

  getHeroMaxHearts(heroId: HeroId): number {
    return HEROES[heroId].maxHearts + this.data.heroProgress[heroId].heartTier + (this.data.activeBuff === 'vitality' ? 2 : 0);
  }

  recordBeastDefeated(beastId: BeastId, isBoss: boolean): void {
    this.data.defeatedCounts[beastId] = (this.data.defeatedCounts[beastId] ?? 0) + 1;
    this.data.stats.beasts_defeated += 1;
    if (isBoss) {
      this.data.stats.bosses_defeated += 1;
      this.data.materials.chronoDust += 1;
    } else {
      // Drop elemental shard materials!
      const keys: Array<keyof SaveDataV1['materials']> = ['fireShards', 'frostShards', 'voltShards'];
      const k = keys[this.data.stats.beasts_defeated % keys.length];
      this.data.materials[k] += 1;
    }
    this.save();
  }

  evaluateAchievements(): AchievementDef[] {
    const newlyUnlocked: AchievementDef[] = [];
    for (const ach of ACHIEVEMENTS) {
      if (this.data.unlockedAchievements.includes(ach.id)) continue;
      if (ach.check(this.data)) {
        this.data.unlockedAchievements.push(ach.id);
        this.addPips(ach.rewardPips);
        if (ach.rewardCubes > 0) this.addCoreCubes(ach.rewardCubes);
        newlyUnlocked.push(ach);
      }
    }
    if (newlyUnlocked.length > 0) this.save();
    return newlyUnlocked;
  }

  buyMaterial(key: keyof SaveDataV1['materials']): boolean {
    const item = MATERIAL_ITEMS.find((m) => m.key === key);
    if (!item || this.data.pips < item.costPips) return false;
    this.data.pips -= item.costPips;
    this.data.materials[key] += 1;
    this.save();
    return true;
  }

  sellMaterial(key: keyof SaveDataV1['materials']): boolean {
    const item = MATERIAL_ITEMS.find((m) => m.key === key);
    if (!item || this.data.materials[key] <= 0) return false;
    this.data.materials[key] -= 1;
    this.data.pips += item.sellPips;
    this.save();
    return true;
  }

  exchangeMaterialsForCube(): boolean {
    const totalShards =
      this.data.materials.fireShards + this.data.materials.frostShards + this.data.materials.voltShards;
    if (totalShards < 6) return false;
    let toRemove = 6;
    for (const k of ['fireShards', 'frostShards', 'voltShards'] as const) {
      const take = Math.min(this.data.materials[k], toRemove);
      this.data.materials[k] -= take;
      toRemove -= take;
    }
    this.addCoreCubes(1);
    return true;
  }

  craftForgeWeapon(weaponId: string): boolean {
    if (this.data.ownedWeapons.includes(weaponId)) return false;
    const def = FORGE_WEAPONS.find((w) => w.id === weaponId);
    if (!def) return false;
    if (this.data.pips < def.costPips || this.data.materials[def.materialKey] < def.materialCost) return false;
    this.data.pips -= def.costPips;
    this.data.materials[def.materialKey] -= def.materialCost;
    this.data.ownedWeapons.push(weaponId);
    this.save();
    return true;
  }

  activateHerbBuff(buff: SaveDataV1['activeBuff'], costPips: number): boolean {
    if (this.data.pips < costPips) return false;
    this.data.pips -= costPips;
    this.data.activeBuff = buff;
    this.save();
    return true;
  }

  unlockHero(heroId: HeroId): boolean {
    if (this.data.unlockedHeroes.includes(heroId)) return true;
    const def = HEROES[heroId];
    if (this.data.coreCubes < def.unlockCostCubes) return false;
    this.data.unlockedHeroes.push(heroId);
    this.save();
    return true;
  }

  selectHero(player: 0 | 1, heroId: HeroId): boolean {
    if (!this.data.unlockedHeroes.includes(heroId)) return false;
    if (player === 0) this.data.selectedHeroP1 = heroId;
    else this.data.selectedHeroP2 = heroId;
    this.save();
    return true;
  }

  buyOrEquipOutfit(heroId: HeroId, outfitId: OutfitId): boolean {
    const def = OUTFITS.find((o) => o.id === outfitId);
    if (!def) return false;
    if (!this.data.unlockedOutfits.includes(outfitId)) {
      if (this.data.pips < def.costPips) return false;
      this.data.pips -= def.costPips;
      this.data.unlockedOutfits.push(outfitId);
    }
    this.data.heroProgress[heroId].outfit = outfitId;
    this.save();
    return true;
  }

  upgradeHero(heroId: HeroId, kind: 'damage' | 'heart'): boolean {
    const prog = this.data.heroProgress[heroId];
    const tier = kind === 'damage' ? prog.damageTier : prog.heartTier;
    if (tier >= 4) return false;
    const cost = 250 + tier * 250;
    if (this.data.pips < cost) return false;
    this.data.pips -= cost;
    if (kind === 'damage') prog.damageTier += 1;
    else prog.heartTier += 1;
    this.save();
    return true;
  }

  customizePlot(plotId: string, theme: PlotThemeId): boolean {
    const def = HUB_PLOTS.find((p) => p.id === plotId);
    if (!def) return false;
    if (this.data.coreCubes < def.unlockCubes) return false;
    const state = this.data.plots[plotId] ?? { built: false, theme: def.defaultTheme, addon: 'none' };
    const cost = state.built ? 100 : def.buildCostPips;
    if (this.data.pips < cost) return false;
    this.data.pips -= cost;
    this.data.plots[plotId] = { built: true, theme, addon: state.addon ?? 'none' };
    this.data.stats.plots_customized += 1;
    this.save();
    return true;
  }

  installPlotAddon(plotId: string, addonId: HouseAddonId): boolean {
    const state = this.data.plots[plotId];
    if (!state || !state.built) return false;
    const addon = HOUSE_ADDONS.find((a) => a.id === addonId);
    if (!addon) return false;
    if (state.addon === addonId) return true;
    if (this.data.pips < addon.costPips) return false;
    this.data.pips -= addon.costPips;
    state.addon = addonId;
    this.data.stats.plots_customized += 1;
    this.save();
    return true;
  }

  toggleMod(modId: ModBlockId): boolean {
    const def = MOD_BLOCKS.find((m) => m.id === modId);
    if (!def) return false;
    if (!this.data.unlockedMods.includes(modId)) {
      if (this.data.coreCubes < def.costCubes) return false;
      this.data.unlockedMods.push(modId);
    }
    const idx = this.data.enabledMods.indexOf(modId);
    if (idx >= 0) this.data.enabledMods.splice(idx, 1);
    else this.data.enabledMods.push(modId);
    this.save();
    return true;
  }

  claimQuest(questId: string): boolean {
    if (this.data.claimedQuests.includes(questId)) return false;
    const q = COMMUNITY_QUESTS.find((c) => c.id === questId);
    if (!q) return false;
    if ((this.data.stats[q.metric] ?? 0) < q.target) return false;
    this.data.claimedQuests.push(questId);
    this.addCoreCubes(q.rewardCubes);
    this.addPips(q.rewardPips);
    this.save();
    return true;
  }

  completeBiome(biomeId: BiomeId): { cubes: number; pips: number; firstClear: boolean } {
    const def = BIOMES[biomeId];
    const firstClear = !this.data.completedBiomes.includes(biomeId);
    if (firstClear) {
      this.data.completedBiomes.push(biomeId);
    }
    const cubes = firstClear ? def.rewardCubes : 1;
    this.addCoreCubes(cubes);
    const pips = this.addPips(def.rewardPips);
    return { cubes, pips, firstClear };
  }
}
