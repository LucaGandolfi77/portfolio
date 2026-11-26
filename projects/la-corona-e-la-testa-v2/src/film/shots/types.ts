/*
 * How a shot of the 3D film is described. Pure data plus a few small
 * callbacks: the director (stage.ts) turns it into a picture for any moment.
 * Units are metres; +y is up; a figure with rot 0 faces +z.
 */
import type { CastId } from '../three/cast';
import type { Item, Mood, PoseName } from '../three/figure';
import type { SetName, SetOptions } from '../three/sets';
import type { Who } from '../script';

export type V3 = [number, number, number];
export type V2 = [number, number];

/** A change that starts when line `l` begins (-1 = start of the shot), `d` seconds later. */
export interface Key {
  l: number;
  d?: number;
  /** Seconds the change takes. */
  move?: number;
  at?: V2;
  /** Height of the feet (steps, a horse's back is automatic). */
  y?: number;
  /** Facing, degrees (0 = towards +z, 90 = towards +x). */
  rot?: number;
  pose?: PoseName;
  item?: Item | null;
  alpha?: number;
  /** Look at this point (or null to look where the body faces). */
  look?: V3 | null;
  glow?: number;
  mood?: Mood;
}

export interface Actor {
  who: CastId;
  /** Whose lines move this mouth. */
  voice?: Who;
  at: V2;
  y?: number;
  rot?: number;
  pose?: PoseName;
  item?: Item;
  alpha?: number;
  /** Size multiplier (children are smaller in the cast already). */
  s?: number;
  /** Rides a horse of this colour. */
  horse?: string;
  /** Carved in stone. */
  stone?: boolean;
  /** The saint carrying his own head. */
  headless?: boolean;
  /** Light around the figure, 0..1. */
  glow?: number;
  /** Walks on the spot at this speed (for figures carried by the camera). */
  march?: number;
  look?: V3;
  mood?: Mood;
  keys?: Key[];
}

/** A camera position: where it is, what it looks at, its lens. */
export interface CamKey {
  l: number;
  d?: number;
  /** Seconds to glide there; 0 = a cut. */
  move?: number;
  pos: V3;
  look: V3;
  fov?: number;
  /** pos and look are relative to this actor's feet. */
  rel?: number;
}

/**
 * How a line is framed. 'path' follows the authored camera; the others are
 * worked out from where the speaker and listener stand, like a cameraman would.
 */
export type Frame = 'path' | 'close' | 'ots' | 'two' | 'low' | 'high';

export type Transition = 'fade' | 'iris' | 'black' | 'light' | 'wipe' | 'cut';

export interface Sound {
  rain?: number;
  wind?: number;
  fire?: number;
  water?: number;
  crowd?: number;
  birds?: number;
  drone?: number;
  /** 0..1: how much the solo melody sings. */
  melody?: number;
}

export type Sfx = 'bell' | 'door' | 'thunder' | 'shot' | 'splash' | 'coin' | 'chain' | 'hit' | 'wood' | 'glass' | 'chime' | 'fanfare' | 'gallop' | 'sword' | 'choir' | 'chisel';

export interface Fx {
  rain?: number;
  dust?: number;
  embers?: number;
  mist?: number;
  fireflies?: number;
  snow?: number;
  /** Golden motes of the miracle. */
  grace?: number;
}

/** What a shot's own animation callback is told about the moment. */
export interface Moment {
  t: number;
  time: number;
  dur: number;
  /** Eased 0..1 over `over` seconds from the start of line `i` (+delay). */
  on(i: number, over?: number, delay?: number): number;
  since(i: number): number;
}

export interface ShotView {
  set: SetName;
  opt?: SetOptions;
  cam: CamKey[];
  /** Framing for each line; missing lines are framed automatically. */
  frames?: Partial<Record<number, Frame>>;
  /** false: never cut to coverage, always follow the path. */
  cover?: boolean;
  actors?: Actor[];
  fx?: Fx;
  /** Named things inside the set animated by this shot (see sets.ts `props`). */
  animate?(m: Moment, props: Record<string, import('three').Object3D>): void;
  /** Exposure multiplier. */
  exposure?: number;
  trans?: Transition;
  sound?: Sound;
  sfx?: Array<[line: number, name: Sfx, delay?: number]>;
}

export type Shots = Record<string, ShotView>;
