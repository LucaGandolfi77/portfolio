import type { Shot } from './timeline';

/** When a key (or camera move) of a shot starts, in shot seconds: line `l` (-1 = shot start) plus `d`. */
export function triggerTime(shot: Shot, l: number, d = 0): number {
  if (l < 0) return d;
  const cue = shot.cues[Math.min(l, shot.cues.length - 1)];
  return cue.start - shot.start + d;
}
