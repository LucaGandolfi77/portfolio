/*
 * Act one, in pictures: the square of Fidenza today, Milan, the palace,
 * the prison, the refusal and the escape. See sets.ts for the coordinates.
 */
import type { Actor, CamKey, Shots, V2, V3 } from './types';

export const C = (l: number, pos: V3, look: V3, fov = 38, move = 3, d = 0): CamKey => ({ l, pos, look, fov, move, d });

/** The saint's statue in the niche of the façade, seen by people in the square. */
export const STATUE: V3 = [-3, 6.15, -12.2];

const court = (at: V2, rot: number, who: Actor['who'] = 'courtier'): Actor => ({ who, at, rot });

export const ACT1: Shots = {
  /* ---- Prologue ---- */
  'pr-piazza': {
    set: 'piazza', opt: { sky: 'night' },
    cam: [C(-1, [3, 1.4, 9], [-1, 2.4, -6], 42), C(0, [1.6, 1.3, 2.8], [-2.2, 2.6, -8], 36, 8)],
    frames: { 1: 'two', 2: 'ots', 3: 'close', 4: 'ots' },
    actors: [
      { who: 'kid', voice: 'kid', at: [-1.9, 1.6], rot: 200, keys: [{ l: 1, d: 0.3, pose: 'point', look: STATUE }, { l: 2, pose: 'stand', look: null, rot: 60 }, { l: 4, look: STATUE }] },
      { who: 'mom', voice: 'mom', at: [-1.0, 1.9], rot: 190, keys: [{ l: 2, look: STATUE }, { l: 3, look: null, rot: 240 }] },
    ],
    fx: { snow: 0.55 },
    sound: { wind: 0.25, drone: 0.25, melody: 0.4 },
    sfx: [[-1, 'bell', 1.5]],
  },
  'pr-statue': {
    set: 'piazza', opt: { sky: 'night' },
    cam: [C(-1, [-1.8, 4.2, -5.5], [-3, 5.8, -12.3], 34), C(-1, [-2.6, 6.0, -9.2], [-3, 6.15, -12.3], 26, 9, 0.5)],
    cover: false,
    fx: { snow: 0.6 },
    trans: 'fade',
    sound: { wind: 0.2, drone: 0.4, melody: 0.6 },
    sfx: [[0, 'choir', 0.4]],
  },
  'pr-empire': {
    set: 'milan',
    cam: [C(-1, [-170, 80, 170], [0, 6, -8], 40), C(-1, [-46, 26, 58], [0, 8, -10], 36, 22, 0.2)],
    cover: false,
    trans: 'light',
    sound: { wind: 0.2, crowd: 0.15, melody: 0.7 },
    sfx: [[0, 'fanfare', 1]],
  },

  /* ---- I. The crown ---- */
  'co-treasury': {
    set: 'treasury',
    cam: [C(-1, [2.6, 1.7, 3.0], [0, 1.1, 0], 36), C(0, [1.2, 1.25, 1.2], [0, 1.05, 0], 28, 7)],
    frames: { 2: 'close' },
    actors: [
      { who: 'donCourt', voice: 'don', at: [0.15, 0.62], rot: 185, pose: 'reach', item: 'cloth', keys: [{ l: 2, pose: 'stand', item: null, rot: 230 }] },
      { who: 'eutychius', voice: 'eut', at: [-1.5, 0.6], rot: 110, pose: 'arms' },
    ],
    fx: { dust: 0.8 },
    sound: { drone: 0.2, melody: 0.4 },
    sfx: [[1, 'chime', 0.2]],
  },
  'co-night': {
    set: 'bedchamber',
    cam: [C(-1, [2.8, 1.8, 2.6], [-1.2, 0.9, -2], 38), C(0, [1.6, 1.4, 1.2], [-0.8, 1.0, -1.8], 32, 6)],
    frames: { 1: 'two' },
    actors: [
      { who: 'maximian', voice: 'max', at: [-0.65, -2.1], rot: 95, pose: 'sit', mood: 'sad', keys: [{ l: 3, mood: 'calm' }] },
      { who: 'donCourt', voice: 'don', at: [3, 3.6], rot: 200, keys: [{ l: 1, at: [1.0, -0.9], move: 3.2, rot: 245 }, { l: 4, pose: 'bow', move: 0.8 }, { l: 4, d: 2.4, pose: 'stand' }] },
    ],
    sound: { drone: 0.3, wind: 0.1, melody: 0.45 },
    sfx: [[1, 'door', 0]],
  },
  'co-throne': {
    set: 'hall',
    cam: [C(-1, [0, 3.2, 6], [0, 2.0, -10], 40), C(0, [0.6, 2.2, -4], [0, 2.0, -11.5], 34, 8)],
    frames: { 1: 'low', 2: 'low', 3: 'close', 4: 'low' },
    actors: [
      { who: 'maximian', voice: 'max', at: [0, -12.3], y: 1.1, rot: 0, pose: 'sit', mood: 'stern' },
      { who: 'donCourt', voice: 'don', at: [-0.4, -6.5], rot: 180, keys: [{ l: 1, d: 0.6, at: [-0.4, -9.7], move: 2.6 }, { l: 3, pose: 'bow', move: 0.7 }, { l: 3, d: 1.8, pose: 'stand' }] },
      { who: 'eutychius', at: [2.2, -8.8], rot: 220, pose: 'arms' },
    ],
    sound: { crowd: 0.12, fire: 0.25, melody: 0.5 },
    sfx: [[0, 'fanfare', 0.5]],
  },
  'co-trial': {
    set: 'hall',
    cam: [C(-1, [-3, 2.4, 0], [0.5, 1.4, -7], 36), C(0, [-2.0, 1.9, -3.0], [0.3, 1.4, -7], 32, 6)],
    frames: { 0: 'path', 1: 'low', 4: 'low' },
    actors: [
      { who: 'maximian', voice: 'max', at: [0, -12.3], y: 1.1, rot: 0, pose: 'sit', mood: 'stern', keys: [{ l: 4, mood: 'anger' }] },
      { who: 'donCourt', at: [1.3, -11.6], y: 1.0, rot: 200, pose: 'stand', keys: [{ l: 3, mood: 'sad' }] },
      { who: 'guard', voice: 'guard', at: [1.8, -5.6], rot: 160, pose: 'guard', item: 'spear' },
      { who: 'sabinus', voice: 'eld', at: [-0.3, -6.6], rot: 180, pose: 'stand' },
      { who: 'marcella', voice: 'mar', at: [0.7, -6.4], rot: 185, mood: 'fear', keys: [{ l: 3, pose: 'beg', move: 0.8 }] },
      { who: 'prisoner', at: [-1.2, -5.6], rot: 175, pose: 'pray' },
      { who: 'guard', at: [-2.1, -5.0], rot: 150, pose: 'guard', item: 'spear' },
    ],
    sound: { crowd: 0.2, fire: 0.25, drone: 0.3, melody: 0.35 },
    sfx: [[0, 'chain', 0.3], [4, 'hit', 2.6]],
  },

  /* ---- II. The night of water ---- */
  'fi-prison': {
    set: 'prison',
    cam: [C(-1, [-3.4, 1.7, 3.6], [0, 1.2, -1], 38), C(0, [-1.8, 1.5, 2.6], [0.2, 1.2, -1], 34, 8)],
    actors: [
      { who: 'sabinus', voice: 'eld', at: [-0.4, -1.3], rot: 30 },
      { who: 'marcella', at: [0.9, -1.7], rot: -20, pose: 'pray' },
      { who: 'donCourt', voice: 'don', at: [-3.6, 2.6], rot: 140, item: 'jug', keys: [{ l: 0, d: 1, at: [0.1, 0.4], move: 4.5, rot: 200 }, { l: 2, item: null, pose: 'stand' }] },
    ],
    fx: { dust: 0.5 },
    sound: { drone: 0.35, water: 0.08, melody: 0.4 },
    sfx: [[0, 'door', 0.4], [0, 'chain', 1.8]],
  },
  'fi-baptism': {
    set: 'prison', opt: { sky: 'dawn' },
    cam: [C(-1, [2.6, 1.3, 2.4], [0.2, 1.0, -0.4], 36), C(4, [1.4, 1.2, 1.3], [0.2, 0.9, -0.3], 30, 4), C(5, [3.2, 2.4, 3.2], [0.6, 1.4, -1.4], 38, 6)],
    frames: { 4: 'path', 5: 'path' },
    actors: [
      { who: 'sabinus', voice: 'eld', at: [0.2, -0.75], rot: 0, keys: [{ l: 4, item: 'jug', pose: 'pour', move: 1 }, { l: 5, d: 3, pose: 'stand', item: null }] },
      { who: 'donCourt', voice: 'don', at: [0.25, 0.2], rot: 180, keys: [{ l: 2, pose: 'kneel', move: 1.2 }, { l: 4, pose: 'pray' }, { l: 4, d: 0.1, pose: 'kneel' }] },
      { who: 'marcella', voice: 'mar', at: [1.3, -0.5], rot: -60, pose: 'stand', mood: 'joy' },
      { who: 'prisoner', at: [-1.2, -0.9], rot: 40, pose: 'pray' },
    ],
    fx: { dust: 0.7 },
    sound: { drone: 0.25, water: 0.12, melody: 0.7 },
    sfx: [[4, 'choir', 0.2], [4, 'splash', 2.2]],
  },

  /* ---- III. The refusal ---- */
  're-altar': {
    set: 'hall', opt: { altar: true },
    cam: [C(-1, [-4, 3, 2], [2.5, 1.6, -7], 38), C(0, [-1.2, 2.0, -2.5], [2.4, 1.5, -7], 32, 7)],
    frames: { 1: 'low', 3: 'low' },
    actors: [
      { who: 'maximian', voice: 'max', at: [0.6, -6.8], rot: 60, mood: 'stern', keys: [{ l: 3, mood: 'anger' }] },
      { who: 'donCourt', voice: 'don', at: [2.2, -4.9], rot: 200, keys: [{ l: 1, d: 1, at: [2.7, -5.6], move: 1.6, rot: 150 }, { l: 2, rot: 250, move: 0.8 }] },
      { who: 'priest', at: [3.9, -7.2], rot: 250, item: 'censer' },
      { who: 'eutychius', at: [-1.6, -5.4], rot: 120, pose: 'arms', mood: 'fear' },
    ],
    fx: { embers: 0.5 },
    sound: { crowd: 0.12, fire: 0.35, drone: 0.35 },
    sfx: [[4, 'hit', 0.4]],
  },
  're-crown': {
    set: 'hall', opt: { altar: true },
    cam: [C(-1, [0, 2.0, -2], [0, 1.9, -11], 36), C(0, [1.8, 2.3, -6.8], [0, 2.0, -11.6], 32, 8)],
    frames: { 0: 'path', 1: 'close', 2: 'low', 3: 'close', 4: 'low' },
    actors: [
      { who: 'maximian', voice: 'max', at: [0, -11.85], y: 1.0, rot: 0, mood: 'stern', keys: [{ l: 1, d: 3.4, pose: 'offer', item: 'crown', move: 0.8 }, { l: 2, mood: 'sad', pose: 'hold' }, { l: 4, mood: 'anger', pose: 'point', move: 0.4 }] },
      { who: 'donCourt', voice: 'don', at: [0, -7.4], rot: 180, item: 'crown', pose: 'offer',
        keys: [{ l: 0, d: 0.8, at: [0, -10.5], y: 0.5, move: 5 }, { l: 1, d: 0.6, at: [0, -11.1], y: 0.75, move: 1.6 }, { l: 1, d: 3.5, item: null, pose: 'stand' }, { l: 4, d: 1, rot: 0, move: 0.8 }] },
      { who: 'guard', at: [-2.2, -8.4], rot: 150, pose: 'guard', item: 'spear', keys: [{ l: 4, d: 0.6, at: [-0.9, -10.2], move: 1.4 }] },
      { who: 'guard', at: [2.4, -8.6], rot: 210, pose: 'guard', item: 'spear', keys: [{ l: 4, d: 0.8, at: [1.0, -10.2], move: 1.4 }] },
    ],
    sound: { crowd: 0.08, fire: 0.3, drone: 0.45, melody: 0.3 },
    sfx: [[1, 'chime', 3.4], [4, 'sword', 0.3]],
  },
  're-escape': {
    set: 'postern',
    cam: [C(-1, [4.5, 1.6, 4.5], [0, 1.3, -2.5], 38), C(0, [2.6, 1.6, 2.2], [0, 1.4, -2.6], 32, 8), C(4, [3.6, 2.0, 3.5], [0, 1.3, -3], 36, 4)],
    frames: { 0: 'path' },
    actors: [
      { who: 'valerius', voice: 'val', at: [-2.5, 3], rot: 150, keys: [{ l: -1, d: 0.3, at: [0.7, -1.5], move: 5 }, { l: 1, rot: -70 }] },
      { who: 'donCourt', voice: 'don', at: [-3.2, 3.6], rot: 150, keys: [{ l: -1, d: 0.6, at: [-0.6, -1.7], move: 5 }, { l: 1, rot: 100 }, { l: 4, d: 2.6, at: [0, -3.1], move: 1.8 }, { l: 4, d: 4.2, alpha: 0, move: 0.3 }] },
    ],
    sound: { wind: 0.25, fire: 0.15, drone: 0.3, melody: 0.4 },
    sfx: [[4, 'door', 3.3]],
  },
  're-order': {
    set: 'hall', opt: { sky: 'dusk', empty: true },
    cam: [C(-1, [0, 4.5, 2], [0, 1.5, -10], 40), C(0, [-1.8, 1.6, -6.4], [0, 1.9, -11.6], 34, 6), C(1, [1.6, 1.4, -10.6], [0, 1.0, -8.9], 30, 0), C(2, [-1.3, 1.9, -8.3], [0, 2.3, -11.5], 30, 0), C(3, [0.9, 2.2, -10.2], [0, 2.4, -11.6], 26, 4)],
    cover: false,
    actors: [
      { who: 'maximian', voice: 'max', at: [0, -12.4], y: 1.0, rot: 0, mood: 'anger', keys: [{ l: 2, at: [0, -11.4], y: 0.95, move: 2 }, { l: 3, mood: 'stern' }] },
      { who: 'valeriusBare', voice: 'val', at: [0, -8.9], rot: 180, pose: 'kneel', mood: 'sad' },
    ],
    fx: { embers: 0.3 },
    sound: { fire: 0.3, drone: 0.45 },
    sfx: [[3, 'hit', 0.6]],
  },
};
