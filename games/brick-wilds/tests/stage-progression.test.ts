import { describe, expect, it } from 'vitest';
import { BEASTS, BEAST_LIST } from '../src/data/beasts';
import { BIOME_LIST, GRAND_INTRO_SLIDES, STORY_CHAPTERS } from '../src/data/expeditions';
import { HERO_LIST } from '../src/data/heroes';
import { COMMUNITY_QUESTS, HUB_PLOTS } from '../src/data/hubPlots';
import { ACHIEVEMENTS, FINALE_CLUES, FORGE_WEAPONS } from '../src/data/multiverseAndLibrary';
import { HIDDEN_COLLECTIBLES, OPEN_WORLD_CAVES, OPEN_WORLD_NPCS } from '../src/data/openWorldContent';
import { GameState } from '../src/game/GameState';
import { getOpenWorldElevationAt, getOpenWorldRegionAt, isOpenWorldWaterAt, OPEN_WORLD_REGIONS } from '../src/world/OpenWorldStage';

describe('20 Synth-Beasts, 16 Biomes (8 Historical/Alt Worlds), Hills & Mountains, Library & Shops', () => {
  it('defines 20 Synth-Beasts (7 Bosses), 16 Biomes, 16 Story Chapters, 12 Achievements, and 6 Finale Clues', () => {
    expect(BEAST_LIST).toHaveLength(20);
    expect(BEAST_LIST.filter((b) => b.isBoss)).toHaveLength(7);
    expect(BIOME_LIST).toHaveLength(16);
    expect(BIOME_LIST.filter((b) => b.isAlternateWorld)).toHaveLength(8);
    expect(STORY_CHAPTERS).toHaveLength(16);
    expect(GRAND_INTRO_SLIDES).toHaveLength(4);
    expect(HUB_PLOTS).toHaveLength(10);
    expect(COMMUNITY_QUESTS).toHaveLength(10);
    expect(ACHIEVEMENTS).toHaveLength(12);
    expect(FINALE_CLUES).toHaveLength(6);
    expect(FORGE_WEAPONS).toHaveLength(4);
  });

  it('generates flat Meadow/Ocean and elevated 3D mountains in Glacier and Volcano', () => {
    expect(getOpenWorldElevationAt(0, 0)).toBe(0);
    expect(getOpenWorldElevationAt(0, 80)).toBe(0); // Ocean
    expect(getOpenWorldElevationAt(-16, -44)).toBeGreaterThanOrEqual(3.2); // Glacier Mountain Peak
    expect(getOpenWorldElevationAt(36, -36)).toBeGreaterThanOrEqual(3.2); // Volcano Mountain Peak
  });

  it('defines valid Synth-Beast wave rosters across all 12 biomes', () => {
    for (const biome of BIOME_LIST) {
      expect(biome.waves.length).toBeGreaterThanOrEqual(3);
      for (const wave of biome.waves) {
        for (const group of wave) {
          expect(BEASTS[group.beastId]).toBeDefined();
          expect(group.count).toBeGreaterThan(0);
        }
      }
    }
  });

  it('tracks defeated beasts, ocean swimming, 4 distant islands, 3 caves, 6 NPCs, and Forge shops', () => {
    expect(HERO_LIST).toHaveLength(4);
    expect(OPEN_WORLD_REGIONS).toHaveLength(14);
    expect(OPEN_WORLD_CAVES).toHaveLength(3);
    expect(OPEN_WORLD_NPCS).toHaveLength(6);
    expect(HIDDEN_COLLECTIBLES).toHaveLength(20);

    // Mainland vs. Swimmable Ocean vs. Distant & Outer Islands
    expect(isOpenWorldWaterAt(0, 0)).toBe(false);
    expect(isOpenWorldWaterAt(0, 80)).toBe(true);
    expect(isOpenWorldWaterAt(4, 102)).toBe(false);
    expect(getOpenWorldRegionAt(4, 102).id).toBe('coral-isle');
    expect(getOpenWorldRegionAt(-12, -162).id).toBe('polar-isle');
    expect(getOpenWorldRegionAt(142, -118).id).toBe('neon-isle');
    expect(getOpenWorldRegionAt(-146, 118).id).toBe('clockwork-isle');

    const gs = new GameState(null);
    expect(gs.markCaveCleared('cave-smuggler', 750)).toBe(true);
    expect(gs.claimNpcQuest('npc-brine', 650, 1)).toBe(true);
    expect(gs.data.clearedCaves).toContain('cave-smuggler');
    expect(gs.data.completedNpcQuests).toContain('npc-brine');

    // Collect 5 hidden collectibles -> triggers bonus Core Cube on 5th!
    for (let i = 1; i <= 4; i++) {
      expect(gs.collectRelic(`col-${i}`).bonusCube).toBe(false);
    }
    const fifth = gs.collectRelic('col-5');
    expect(fifth.collected).toBe(true);
    expect(fifth.bonusCube).toBe(true);
    expect(fifth.total).toBe(5);
    gs.recordBeastDefeated('chronos-prime', true);
    expect(gs.data.defeatedCounts['chronos-prime']).toBe(1);
    expect(gs.data.materials.chronoDust).toBe(6);

    const unlocked = gs.evaluateAchievements();
    expect(unlocked.some((a) => a.id === 'ach-first-blood')).toBe(true);
    expect(unlocked.some((a) => a.id === 'ach-true-ending')).toBe(true);

    // Buy fireShards & craft Helios Relic Bow
    gs.addPips(1500);
    expect(gs.buyMaterial('fireShards')).toBe(true);
    const dmgBefore = gs.getHeroDamage('ayla');
    expect(gs.craftForgeWeapon('solar-longbow')).toBe(true);
    expect(gs.getHeroDamage('ayla')).toBeGreaterThan(dmgBefore);
  });
});
