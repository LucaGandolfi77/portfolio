import { describe, expect, it } from 'vitest';
import { BEASTS } from '../src/data/beasts';
import { WEAPON_MODE_LIST } from '../src/data/heroes';
import { resolveMidAirInfusion } from '../src/entities/ProjectileManager';
import { computeWeakPointHit } from '../src/entities/SynthBeast';

describe('Elemental weapon switching, mid-air infusion & super-effective multipliers', () => {
  it('defines 4 elemental weapon modes (standard, fire, frost, shock)', () => {
    expect(WEAPON_MODE_LIST.map((w) => w.id)).toEqual(['standard', 'fire', 'frost', 'shock']);
  });

  it('infuses neutral projectiles passing through campfire, shock-crystal, and cryo-vent', () => {
    expect(resolveMidAirInfusion('none', 'campfire')).toBe('fire');
    expect(resolveMidAirInfusion('none', 'shock-crystal')).toBe('shock');
    expect(resolveMidAirInfusion('none', 'cryo-vent')).toBe('frost');
    expect(resolveMidAirInfusion('fire', 'cryo-vent')).toBe('fire');
  });

  it('applies 1.85x super-effective body damage and 3.2x super-effective weak-point damage', () => {
    const mammoth = BEASTS['cryo-mammoth'];
    const sac = mammoth.weakPoints[0];
    expect(mammoth.weakElement).toBe('fire');

    const neutralBody = computeWeakPointHit(20, 'none', null, mammoth.weakElement);
    expect(neutralBody.damage).toBe(20);
    expect(neutralBody.superEffective).toBe(false);

    const fireBody = computeWeakPointHit(20, 'fire', null, mammoth.weakElement);
    expect(fireBody.damage).toBe(37);
    expect(fireBody.superEffective).toBe(true);

    const fireWeakPoint = computeWeakPointHit(20, 'fire', sac, mammoth.weakElement);
    expect(fireWeakPoint.damage).toBe(64);
    expect(fireWeakPoint.superEffective).toBe(true);
    expect(fireWeakPoint.elementalReaction).toBe(true);
  });
});
