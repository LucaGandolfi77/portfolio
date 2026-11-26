/*
 * Calendar: the time of day, its named phases, the four seasons and the
 * seasonal events. One in-game day lasts 24 real minutes; a season lasts
 * three days, so the year turns in under four hours of play (the story also
 * jumps ahead a season at the end of each chapter).
 */

export type Season = 'primavera' | 'estate' | 'autunno' | 'inverno';
export type Phase = 'notte' | 'alba' | 'mattina' | 'mezzogiorno' | 'pomeriggio' | 'tramonto' | 'sera';

export const SEASONS: Season[] = ['primavera', 'estate', 'autunno', 'inverno'];
export const DAYS_PER_SEASON = 3;

export const SEASON_LABEL: Record<Season, string> = {
  primavera: 'Primavera',
  estate: 'Estate',
  autunno: 'Autunno',
  inverno: 'Inverno'
};

export const PHASE_LABEL: Record<Phase, string> = {
  notte: 'Notte',
  alba: 'Alba',
  mattina: 'Mattina',
  mezzogiorno: 'Mezzogiorno',
  pomeriggio: 'Pomeriggio',
  tramonto: 'Tramonto',
  sera: 'Sera'
};

/** Sunrise and sunset by season (hours), roughly the Po valley. */
export const DAYLIGHT: Record<Season, { rise: number; set: number }> = {
  primavera: { rise: 6.6, set: 19.8 },
  estate: { rise: 5.65, set: 21.15 },
  autunno: { rise: 7.1, set: 18.2 },
  inverno: { rise: 7.85, set: 16.85 }
};

export function seasonOf(day: number): Season {
  const index = Math.floor(Math.max(0, day) / DAYS_PER_SEASON) % 4;
  return SEASONS[index];
}

export function dayInSeason(day: number): number {
  return Math.floor(Math.max(0, day)) % DAYS_PER_SEASON;
}

/** First day (absolute) of the next occurrence of a season, from `day`. */
export function nextSeasonStart(day: number, season: Season): number {
  const year = DAYS_PER_SEASON * 4;
  const start = SEASONS.indexOf(season) * DAYS_PER_SEASON;
  let d = Math.floor(day / year) * year + start;
  if (d <= day) d += year;
  return d;
}

export function phaseOf(hours: number, season: Season): Phase {
  const h = ((hours % 24) + 24) % 24;
  const { rise, set } = DAYLIGHT[season];
  if (h < rise - 0.8 || h >= set + 2.2) return 'notte';
  if (h < rise + 1) return 'alba';
  if (h < 11.5) return 'mattina';
  if (h < 14) return 'mezzogiorno';
  if (h < set - 1) return 'pomeriggio';
  if (h < set + 0.8) return 'tramonto';
  return 'sera';
}

/**
 * Maps the clock to the "summer-ish" solar time the sky keys are written
 * for (sunrise 6.5, sunset 20): short winter days get their dusk early.
 */
export function solarHours(hours: number, season: Season): number {
  const h = ((hours % 24) + 24) % 24;
  const { rise, set } = DAYLIGHT[season];
  const R = 6.5, S = 20;
  if (h >= rise && h <= set) return R + ((h - rise) / (set - rise)) * (S - R);
  /* Night: stretch the remaining hours between sunset and the next sunrise. */
  const night = 24 - (set - rise);
  const since = h > set ? h - set : h + 24 - set;
  const out = S + (since / night) * (24 - (S - R));
  return out % 24;
}

export interface SeasonEvent {
  id: 'fiori' | 'notte-bianca' | 'san-donnino' | 'natale' | 'capodanno';
  name: string;
  season: Season;
  /** Day within the season (0..2) and the hours it runs (end may pass midnight). */
  day: number;
  from: number;
  to: number;
  place: { x: number; z: number; name: string };
  blurb: string;
}

export const EVENTS: SeasonEvent[] = [
  {
    id: 'fiori',
    name: 'Mercato dei fiori',
    season: 'primavera',
    day: 1,
    from: 8,
    to: 19,
    place: { x: 15, z: -21, name: 'Piazza Garibaldi' },
    blurb: 'Banchi di fiori e piante in Piazza Garibaldi: i vivaisti cercano chi consegni.'
  },
  {
    id: 'notte-bianca',
    name: 'Notte Bianca',
    season: 'estate',
    day: 1,
    from: 19,
    to: 3,
    place: { x: -297, z: -4, name: 'Piazza Duomo' },
    blurb: 'Concerti, luci e tavolini fino all\'alba: la città è piena e i taxi non bastano mai.'
  },
  {
    id: 'san-donnino',
    name: 'Festa di San Donnino',
    season: 'autunno',
    day: 1,
    from: 9,
    to: 23,
    place: { x: -297, z: -4, name: 'Piazza Duomo' },
    blurb: 'Lanterne, bancarelle e la processione verso il Duomo per il patrono.'
  },
  {
    id: 'natale',
    name: 'Mercatino di Natale',
    season: 'inverno',
    day: 0,
    from: 15,
    to: 23,
    place: { x: 15, z: -21, name: 'Piazza Garibaldi' },
    blurb: 'Casette di legno, vin brulé e luci: tutti vogliono pacchi consegnati prima di sera.'
  },
  {
    id: 'capodanno',
    name: 'Capodanno',
    season: 'inverno',
    day: 2,
    from: 22,
    to: 1.5,
    place: { x: 15, z: -21, name: 'Piazza Garibaldi' },
    blurb: 'Il conto alla rovescia in piazza e i fuochi d\'artificio a mezzanotte.'
  }
];

function inWindow(h: number, from: number, to: number): boolean {
  return from <= to ? h >= from && h < to : h >= from || h < to;
}

/** Events running at this moment. An event past midnight belongs to the day it started. */
export function activeEvents(day: number, hours: number): SeasonEvent[] {
  const h = ((hours % 24) + 24) % 24;
  return EVENTS.filter((e) => {
    const started = e.from > e.to && h < e.to ? day - 1 : day;
    return started >= 0 && seasonOf(started) === e.season && dayInSeason(started) === e.day && inWindow(h, e.from, e.to);
  });
}

/** The next event (now or later) with the absolute day it happens on. */
export function upcoming(day: number, hours: number, count = 3): Array<{ event: SeasonEvent; day: number }> {
  const out: Array<{ event: SeasonEvent; day: number; at: number }> = [];
  const now = day * 24 + hours;
  for (let d = day - 1; d < day + DAYS_PER_SEASON * 4 + 1 && out.length < 40; d++) {
    for (const e of EVENTS) {
      if (seasonOf(d) !== e.season || dayInSeason(d) !== e.day) continue;
      const end = d * 24 + (e.to > e.from ? e.to : e.to + 24);
      if (end <= now) continue;
      out.push({ event: e, day: d, at: d * 24 + e.from });
    }
  }
  return out.sort((a, b) => a.at - b.at).slice(0, count).map(({ event, day: d }) => ({ event, day: d }));
}

export function dateLabel(day: number): string {
  const season = seasonOf(day);
  return `${SEASON_LABEL[season]}, giorno ${dayInSeason(day) + 1}`;
}
