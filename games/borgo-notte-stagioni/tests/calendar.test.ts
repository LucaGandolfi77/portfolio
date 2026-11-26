import { describe, expect, it } from 'vitest';
import { activeEvents, dayInSeason, nextSeasonStart, phaseOf, seasonOf, solarHours, upcoming, DAYS_PER_SEASON } from '../src/game/calendar';

describe('calendar', () => {
  it('turns the seasons every three days', () => {
    expect(seasonOf(0)).toBe('primavera');
    expect(seasonOf(DAYS_PER_SEASON)).toBe('estate');
    expect(seasonOf(DAYS_PER_SEASON * 3 + 2)).toBe('inverno');
    expect(seasonOf(DAYS_PER_SEASON * 4)).toBe('primavera');
    expect(dayInSeason(4)).toBe(1);
    expect(nextSeasonStart(1, 'autunno')).toBe(6);
    expect(nextSeasonStart(7, 'autunno')).toBe(18);
  });

  it('has short winter days and long summer evenings', () => {
    expect(phaseOf(17.5, 'estate')).toBe('pomeriggio');
    expect(phaseOf(17.5, 'inverno')).toBe('tramonto');
    expect(phaseOf(19, 'inverno')).toBe('sera');
    expect(phaseOf(21.5, 'estate')).toBe('tramonto');
    expect(phaseOf(3, 'estate')).toBe('notte');
    expect(phaseOf(12, 'autunno')).toBe('mezzogiorno');
    expect(phaseOf(6.2, 'estate')).toBe('alba');
  });

  it('maps the clock to solar time so sunset lands on the sky keys', () => {
    expect(solarHours(16.85, 'inverno')).toBeCloseTo(20, 5);
    expect(solarHours(7.85, 'inverno')).toBeCloseTo(6.5, 5);
    expect(solarHours(21.15, 'estate')).toBeCloseTo(20, 5);
    const night = solarHours(2, 'inverno');
    expect(night >= 20 || night < 6.5).toBe(true);
  });

  it('runs each event on its day and hours, also past midnight', () => {
    const notteBianca = DAYS_PER_SEASON + 1;
    expect(activeEvents(notteBianca, 22).map((e) => e.id)).toContain('notte-bianca');
    expect(activeEvents(notteBianca + 1, 1).map((e) => e.id)).toContain('notte-bianca');
    expect(activeEvents(notteBianca + 1, 4).map((e) => e.id)).not.toContain('notte-bianca');
    expect(activeEvents(notteBianca, 12)).toHaveLength(0);
    expect(activeEvents(1, 10).map((e) => e.id)).toEqual(['fiori']);
    expect(activeEvents(DAYS_PER_SEASON * 3 + 2, 23.5).map((e) => e.id)).toContain('capodanno');
  });

  it('lists what comes next', () => {
    const next = upcoming(0, 0, 3);
    expect(next[0].event.id).toBe('fiori');
    expect(next).toHaveLength(3);
  });
});
