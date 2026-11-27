import { describe, expect, it } from 'vitest';
import { QUICK_BUILD_LIST, ROGUELITE_PERKS, resolveElementalCombo } from '../src/data/advanced';
import { GameState } from '../src/game/GameState';

describe('Elemental Combos, Quick-Build, Roguelite & Brick-Lab', () => {
  it('detects Thermal Shatter, Superconductor, and Overload elemental combos', () => {
    expect(resolveElementalCombo({ burning: false, frosted: true, stunned: false }, 'fire')).toBe('thermal-shatter');
    expect(resolveElementalCombo({ burning: true, frosted: false, stunned: false }, 'frost')).toBe('thermal-shatter');
    expect(resolveElementalCombo({ burning: false, frosted: true, stunned: false }, 'shock')).toBe('superconductor');
    expect(resolveElementalCombo({ burning: true, frosted: false, stunned: false }, 'shock')).toBe('overload');
    expect(resolveElementalCombo({ burning: false, frosted: false, stunned: false }, 'fire')).toBeNull();
  });

  it('defines Quick-Build structures and Roguelite perks', () => {
    expect(QUICK_BUILD_LIST).toHaveLength(3);
    expect(ROGUELITE_PERKS.length).toBeGreaterThanOrEqual(6);
  });

  it('persists Brick-Lab sculptures, Roguelite best wave, and Titan Hunt best time', () => {
    const gs = new GameState(null);
    gs.saveSculpture([
      { x: 0, y: 0, z: 0, color: 0xff0000 },
      { x: 1, y: 0, z: 0, color: 0x00ff00 },
    ]);
    expect(gs.data.sculpture).toHaveLength(2);

    gs.recordRogueliteWave(7);
    gs.recordRogueliteWave(4);
    expect(gs.data.rogueliteBestWave).toBe(7);

    gs.recordTitanTime(42.34);
    gs.recordTitanTime(55.1);
    expect(gs.data.titanBestTimeSec).toBe(42.3);
  });
});
