/* Sound effects as moments of film time. */
import { SHOT_VIEWS } from './shots';
import type { Sfx } from './shots/types';
import { triggerTime } from './keys';
import { SHOTS } from './timeline';

export const EFFECTS: Array<{ at: number; name: Sfx }> = SHOTS.flatMap((shot) =>
  (SHOT_VIEWS[shot.id].sfx ?? []).map(([line, name, delay]) => ({ at: shot.start + triggerTime(shot, line, delay), name })),
).sort((a, b) => a.at - b.at);

/** Effects that fall in (from, to]. */
export function effectsBetween(from: number, to: number): Sfx[] {
  return EFFECTS.filter((e) => e.at > from && e.at <= to).map((e) => e.name);
}
