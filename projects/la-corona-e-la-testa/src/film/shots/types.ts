import type { CastId } from '../draw/cast';
import type { Ctx } from '../draw/core';
import type { Item, Mood, PoseName } from '../draw/puppet';
import type { Who } from '../script';

/** What a picture can ask about the moment it is drawing. */
export interface S {
  ctx: Ctx;
  /** Seconds since the shot began, its progress and length. */
  t: number;
  p: number;
  dur: number;
  /** Film time (for things that must not restart at a cut). */
  time: number;
  /** Seconds since line `i` of this shot began (negative before it). */
  since(i: number): number;
  /** Eased 0..1 over `over` seconds from the start of line `i`. */
  on(i: number, over?: number, delay?: number): number;
  /** Draws inside a parallax layer: 0 = sky, 1 = the stage, >1 = foreground. */
  layer(depth: number, draw: () => void): void;
  /** Draws one more figure (used by pictures that need custom order). */
  actor(a: Actor): void;
}

export interface Light {
  /** Colour the figures are tinted with, and how much. */
  ambient: string;
  shade: number;
  /** Colour of the lit edge and the side it comes from. */
  rim: string;
  x: 1 | -1;
}

/** A change that starts when line `l` begins (-1 = start of the shot). */
export interface Key {
  l: number;
  d?: number;
  /** Seconds the movement takes. */
  move?: number;
  x?: number;
  y?: number;
  s?: number;
  face?: 1 | -1;
  pose?: PoseName;
  mood?: Mood;
  item?: Item | null;
  alpha?: number;
}

export interface Actor {
  who: CastId;
  /** Whose lines move this mouth. */
  voice?: Who;
  x: number;
  y?: number;
  s?: number;
  face?: 1 | -1;
  pose?: PoseName;
  mood?: Mood;
  item?: Item;
  item2?: Item;
  alpha?: number;
  /** Flat silhouette colour, for crowds. */
  flat?: string;
  seed?: number;
  shadow?: boolean;
  /** Walking on the spot (figures that travel with the camera). */
  marching?: number;
  /** Carved in stone of this colour (statues). */
  stone?: string;
  /** The saint carrying his own head. */
  headless?: boolean;
  /** Rides a horse of this colour. */
  horse?: string;
  keys?: Key[];
}

export interface Move {
  l: number;
  d?: number;
  move?: number;
  x?: number;
  y?: number;
  z?: number;
}

export type Transition = 'fade' | 'thread' | 'iris' | 'black' | 'light' | 'wipe';

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

export interface ShotView {
  light: Light;
  /** Starting camera: centre x, centre y, zoom. */
  cam?: [number, number, number];
  moves?: Move[];
  back(s: S): void;
  actors?: Actor[];
  /** Props in front of the figures. */
  mid?(s: S): void;
  /** Foreground and weather. */
  front?(s: S): void;
  /** Colour wash over the whole picture. */
  grade?: [string, number];
  trans?: Transition;
  sound?: Sound;
  sfx?: Array<[line: number, name: Sfx, delay?: number]>;
}

export type Shots = Record<string, ShotView>;
