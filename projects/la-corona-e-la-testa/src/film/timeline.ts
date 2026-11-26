/*
 * The clock of the film, derived from the screenplay: every line gets the
 * time it needs to be read (or spoken), shots add a breath before and after,
 * chapters open on a title card. Change the script and the timing follows.
 */
import { SCRIPT, type Line, type Who } from './script';

export type Lang = 'en' | 'it';
export interface Translatable { en: string; it: string }

export interface Cue {
  id: string;
  start: number;
  end: number;
  who: Who;
  text: Translatable;
  french?: string;
}

export interface Shot {
  id: string;
  chapter: number;
  start: number;
  end: number;
  cues: Cue[];
}

export interface Chapter {
  id: string;
  roman: string;
  ordinal: number;
  titleFr: string;
  title: Translatable;
  accent: string;
  start: number;
  end: number;
  shots: Shot[];
  cues: Cue[];
}

/** Seconds of title card before the first line of a chapter. */
export const TITLE_TIME = 5;
const LEAD = 1.4;
const TAIL = 0.9;
const GAP = 0.45;

/** Reading time of a line: long enough for the longer of the two languages. */
export function lineDuration(line: Line): number {
  const [, en, it, fr] = line;
  const base = 1.5 + Math.max(en.length, it.length) / 15.5;
  return Math.max(3.1, fr ? base + 2.6 : base);
}

function build(): Chapter[] {
  let clock = 0;
  let shotNo = 0;
  return SCRIPT.map((def, ci) => {
    const start = clock;
    const shots: Shot[] = def.shots.map((shot, si) => {
      const shotStart = clock;
      let at = shotStart + (si === 0 ? TITLE_TIME : LEAD);
      const cues: Cue[] = shot.lines.map((line, li) => {
        const duration = lineDuration(line);
        const cue: Cue = { id: `${shot.id}-${li}`, start: at, end: at + duration, who: line[0], text: { en: line[1], it: line[2] }, french: line[3] };
        at += duration + GAP;
        return cue;
      });
      clock = at - GAP + TAIL;
      shotNo++;
      return { id: shot.id, chapter: ci, start: shotStart, end: clock, cues };
    });
    /* The last words of the film get a moment to fade. */
    if (ci === SCRIPT.length - 1) {
      clock += 6;
      shots[shots.length - 1].end = clock;
    }
    return {
      id: def.id,
      roman: def.roman,
      ordinal: ci,
      titleFr: def.fr,
      title: { en: def.en, it: def.it },
      accent: def.accent,
      start,
      end: clock,
      shots,
      cues: shots.flatMap((s) => s.cues),
    };
  });
}

export const CHAPTERS: Chapter[] = build();
export const SHOTS: Shot[] = CHAPTERS.flatMap((c) => c.shots);
export const CUES: Cue[] = SHOTS.flatMap((s) => s.cues);
export const DURATION = CHAPTERS[CHAPTERS.length - 1].end;

/** Last item whose start is <= t (items are contiguous or sorted). */
function lastStarted<T extends { start: number }>(list: T[], t: number): number {
  let lo = 0;
  let hi = list.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (list[mid].start <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export function chapterAt(t: number): Chapter {
  return CHAPTERS[lastStarted(CHAPTERS, t)];
}

export function shotIndexAt(t: number): number {
  return lastStarted(SHOTS, t);
}

export function activeCue(t: number): Cue | null {
  const cue = CUES[lastStarted(CUES, t)];
  return cue && t >= cue.start && t < cue.end ? cue : null;
}

export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
