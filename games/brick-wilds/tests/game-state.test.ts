import { describe, expect, it } from 'vitest';
import { GameState } from '../src/game/GameState';

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
}

describe('GameState economy, hub customization, and quests', () => {
  it('persists Pips, Core Cubes, biome unlocks, and Mod-Blocks', () => {
    const store = memoryStorage();
    const gs = new GameState(store);

    expect(gs.data.pips).toBe(350);
    expect(gs.data.unlockedBiomes).toContain('sun-canopy');
    expect(gs.data.unlockedBiomes).not.toContain('rust-canyon');

    gs.addCoreCubes(8);
    expect(gs.data.unlockedBiomes).toContain('rust-canyon');
    expect(gs.data.unlockedBiomes).toContain('emerald-marsh');
    expect(gs.data.unlockedBiomes).toContain('frost-spire');
    expect(gs.data.unlockedBiomes).toContain('eclipse-citadel');
    expect(gs.data.unlockedBiomes).toContain('solar-sanctum');

    // Enable 2x Pip Multiplier Mod-Block (cost 5 Core Cubes)
    expect(gs.toggleMod('double-pips')).toBe(true);
    expect(gs.addPips(100)).toBe(200);

    // Reload from storage and verify persistence
    const reloaded = new GameState(store);
    expect(reloaded.data.pips).toBe(550);
    expect(reloaded.hasMod('double-pips')).toBe(true);
  });

  it('allows customizing Hearth-Haven plots and claiming Community Board quests', () => {
    const gs = new GameState(memoryStorage());
    gs.addPips(1000);
    expect(gs.customizePlot('gadget-forge', 'cyber')).toBe(true);
    expect(gs.customizePlot('hero-lodge', 'carnival')).toBe(true);
    expect(gs.customizePlot('wardrobe-booth', 'prehistoric')).toBe(true);

    expect(gs.data.stats.plots_customized).toBe(3);
    expect(gs.claimQuest('q-village-architect')).toBe(true);
    expect(gs.data.claimedQuests).toContain('q-village-architect');
    // Double-claiming must fail
    expect(gs.claimQuest('q-village-architect')).toBe(false);
  });

  it('unlocks heroes, outfits, and hero upgrades cleanly', () => {
    const gs = new GameState(memoryStorage());
    expect(gs.unlockHero('tessa')).toBe(false);
    gs.addCoreCubes(2);
    expect(gs.unlockHero('tessa')).toBe(true);
    expect(gs.selectHero(0, 'tessa')).toBe(true);

    gs.addPips(1000);
    expect(gs.buyOrEquipOutfit('tessa', 'cyber')).toBe(true);
    expect(gs.data.heroProgress.tessa.outfit).toBe('cyber');

    const beforeDmg = gs.getHeroDamage('tessa');
    expect(gs.upgradeHero('tessa', 'damage')).toBe(true);
    expect(gs.getHeroDamage('tessa')).toBeGreaterThan(beforeDmg);
  });
});
