/*
 * Act two, in pictures: the road in the rain, the inn, the plain, the farm,
 * the river Stirone, the miracle, the town that grew, and today.
 */
import { C, STATUE } from './act1';
import type { Shots } from './types';

const SUN: [number, number, number] = [-40, 4, -24];

export const ACT2: Shots = {
  /* ---- IV. The road ---- */
  'vi-rain': {
    set: 'road',
    cam: [{ l: -1, pos: [1.8, 1.7, 3.4], look: [0, 1.3, -3], fov: 34, rel: 0, move: 0 }, { l: 1, d: 2, pos: [-1.2, 2.4, -6], look: [0, 1.2, 2], fov: 36, rel: 0, move: 5 }],
    cover: false,
    actors: [{ who: 'donTravel', at: [0.3, 12], rot: 180, keys: [{ l: -1, d: 0.2, at: [0.3, -34], move: 44 }] }],
    fx: { rain: 1 },
    sound: { rain: 0.9, wind: 0.3, drone: 0.25, melody: 0.35 },
    sfx: [[0, 'thunder', 2], [1, 'thunder', 4]],
  },
  'vi-inn': {
    set: 'innInterior',
    cam: [C(-1, [2.6, 1.7, 3.6], [-1.5, 1.3, 0.2], 38), C(0, [0.6, 1.5, 2.6], [-1.6, 1.4, 0.4], 32, 7)],
    frames: { 2: 'path', 3: 'two' },
    actors: [
      { who: 'hostess', voice: 'host', at: [-0.4, 1.6], rot: 230, keys: [{ l: 3, at: [2.4, -0.6], move: 2.4 }, { l: 3, d: 2.4, rot: 300 }] },
      { who: 'donTravel', voice: 'don', at: [-1.8, 2.6], rot: 160, keys: [{ l: 1, d: 2.2, look: [-1, 2.6, -0.43] }, { l: 2, look: null, rot: 80 }, { l: 3, d: 1, at: [1.8, -0.2], move: 2.6 }] },
    ],
    exposure: 1.05,
    sound: { fire: 0.6, rain: 0.25, melody: 0.35 },
    sfx: [[-1, 'door', 0.5]],
  },
  'vi-cellar': {
    set: 'cellar',
    cam: [C(-1, [0, 1.6, 3.2], [0, 1.0, -1.5], 40), C(0, [1.1, 1.2, 1.2], [0, 1.0, -1.8], 34, 8)],
    actors: [
      { who: 'presbyter', voice: 'pres', at: [-0.7, -2.5], rot: 20, item: 'bread' },
      { who: 'faithfulA', at: [0.9, -2.4], rot: -30, pose: 'kneel' },
      { who: 'faithfulB', at: [-1.4, -1.4], rot: 70, pose: 'kneel' },
      { who: 'donTravel', voice: 'don', at: [0.3, 3.0], rot: 180, keys: [{ l: 0, d: 0.5, at: [0.5, -0.6], move: 4 }, { l: 3, d: 1.6, pose: 'kneel', move: 1 }] },
    ],
    fx: { dust: 0.4 },
    sound: { drone: 0.25, melody: 0.55 },
  },
  'vi-patrol': {
    set: 'innExterior', opt: { sky: 'night' },
    cam: [C(-1, [6, 1.8, 9], [-0.5, 1.6, 2], 38), C(0, [3.6, 1.7, 6], [-1.4, 1.8, 2.8], 32, 6), C(3, [4, 2.6, 8], [-2, 1.4, 2.4], 40, 5)],
    cover: false,
    actors: [
      { who: 'legionary', voice: 'sol', at: [-9, 3.8], rot: 90, horse: '#3a2a20', keys: [{ l: -1, d: 0.2, at: [-1.8, 3.6], move: 3.6, rot: 110 }, { l: 3, at: [-24, 3.6], move: 9 }] },
      { who: 'legionary', at: [-12, 4.4], rot: 90, horse: '#6a4a30', keys: [{ l: -1, d: 0.6, at: [-4.6, 4.2], move: 3.6, rot: 100 }, { l: 3, d: 0.4, at: [-27, 4.2], move: 9 }] },
      { who: 'hostess', voice: 'host', at: [0.8, -0.3], rot: 0, item: 'oillamp', keys: [{ l: 0, d: 0.5, at: [0.6, 1.0], move: 1.2, rot: -60 }, { l: 3, d: 4, at: [0.8, -0.3], move: 1.4 }] },
    ],
    fx: { rain: 0.9 },
    sound: { rain: 0.8, wind: 0.25, drone: 0.35 },
    sfx: [[-1, 'gallop', 0.2], [0, 'door', -0.6], [3, 'gallop', 0.1]],
  },
  'vi-ring': {
    set: 'innInterior', opt: { sky: 'dawn' },
    cam: [C(-1, [-3.2, 1.6, 2.6], [0.5, 1.4, 0.4], 36), C(0, [-1.6, 1.5, 1.8], [0.6, 1.4, 0.5], 30, 6)],
    frames: { 0: 'two' },
    actors: [
      { who: 'donTravel', voice: 'don', at: [-0.1, 0.7], rot: 90, item: 'ring', pose: 'offer', keys: [{ l: 1, pose: 'stand', item: null }] },
      { who: 'hostess', voice: 'host', at: [1.1, 0.6], rot: 270, keys: [{ l: 1, pose: 'talk' }] },
    ],
    fx: { dust: 0.8 },
    sound: { birds: 0.2, fire: 0.25, melody: 0.5 },
  },
  'vi-fork': {
    set: 'crossroad',
    cam: [C(-1, [4.5, 1.6, 6.5], [0, 1.3, -1], 38), C(0, [3.0, 1.5, 4.0], [0.2, 1.4, 0.5], 34, 6), C(2, [1.2, 1.7, 4.5], [0, 1.6, -30], 40, 6, 1.2)],
    frames: { 2: 'close' },
    actors: [
      { who: 'hostess', voice: 'host', at: [-0.6, 1.6], rot: 140, keys: [{ l: 0, pose: 'point', rot: 260 }, { l: 0, d: 3, rot: 180 }, { l: 1, pose: 'stand', rot: 110 }] },
      { who: 'donTravel', voice: 'don', at: [0.6, 1.4], rot: 250, keys: [{ l: 2, d: 3, at: [0.2, -28], move: 24 }] },
    ],
    fx: { mist: 0.6 },
    sound: { birds: 0.4, wind: 0.2, melody: 0.5 },
  },

  /* ---- V. The plain ---- */
  'ae-plain': {
    set: 'plain', opt: { sky: 'dawn' },
    cam: [C(-1, [6, 2.2, 6], [0, 1.4, -6], 38), { l: -1, pos: [-3.2, 6.5, 12], look: [0, 1.2, -6], fov: 36, rel: 0, move: 14, d: 1 }],
    cover: false,
    actors: [{ who: 'donTravel', at: [0.4, 4], rot: 180, keys: [{ l: -1, d: 0.4, at: [0.4, -18], move: 16 }] }],
    fx: { mist: 0.9 },
    trans: 'light',
    sound: { birds: 0.6, wind: 0.3, melody: 0.7 },
  },
  'ae-farm': {
    set: 'farm', opt: { sky: 'golden' },
    cam: [C(-1, [9, 1.8, 8], [5, 1.3, 0], 38), C(0, [8.2, 1.6, 4.5], [5, 1.4, 0.4], 32, 6)],
    actors: [
      { who: 'farmer', voice: 'farm', at: [-3, -1.6], rot: 90, mood: 'fear', keys: [{ l: -1, d: 0.5, at: [4.6, 0.2], move: 3.4 }, { l: 0, rot: 70 }] },
      { who: 'donTravel', voice: 'don', at: [7, 9], rot: 180, keys: [{ l: -1, at: [6.4, 0.8], move: 4.2 }, { l: 0, d: 1, rot: 250 }] },
    ],
    sound: { birds: 0.5, wind: 0.2, melody: 0.35 },
  },
  'ae-prayer': {
    set: 'farmRoom', opt: { sky: 'night' },
    cam: [C(-1, [2.2, 1.5, 2.2], [0, 0.8, -1.1], 38), C(0, [0.9, 1.1, 0.9], [0.1, 0.9, -1.0], 30, 10)],
    frames: { 0: 'close', 1: 'path' },
    actors: [
      { who: 'lucius', at: [0.25, -1.2], y: 0.42, rot: 90, pose: 'sleep', mood: 'sad' },
      { who: 'donTravel', voice: 'don', at: [0.3, -0.15], rot: 180, pose: 'pray', keys: [{ l: -1, d: 0.2, pose: 'kneel', move: 1 }, { l: 0, pose: 'kneel' }] },
      { who: 'farmer', at: [-1.7, 0.3], rot: 140, pose: 'pray', mood: 'sad' },
    ],
    sound: { drone: 0.35, wind: 0.2, melody: 0.6 },
  },
  'ae-dawn': {
    set: 'farmRoom', opt: { sky: 'dawn' },
    cam: [C(-1, [1.8, 1.3, 1.8], [0, 0.8, -1.0], 36), C(1, [1.1, 1.3, 0.8], [-0.2, 0.9, -1.0], 32, 5)],
    frames: { 0: 'close', 1: 'two' },
    actors: [
      { who: 'lucius', voice: 'boy', at: [0.1, -0.85], y: 0.27, rot: 10, pose: 'sit', keys: [{ l: 1, d: 0.6, item: 'bowl', pose: 'hold', move: 0.8 }] },
      { who: 'farmer', voice: 'farm', at: [-1.0, -0.1], rot: 120, mood: 'joy', keys: [{ l: 0, d: 0.8, at: [-0.55, -0.2], move: 1.2 }, { l: 1, pose: 'raise', move: 0.6 }, { l: 1, d: 2.4, pose: 'talk', rot: 90 }] },
      { who: 'donTravel', voice: 'don', at: [0.9, 0.2], rot: 230, keys: [{ l: 2, pose: 'stand' }] },
    ],
    fx: { dust: 0.6 },
    trans: 'light',
    sound: { birds: 0.6, melody: 0.8 },
    sfx: [[1, 'chime', 0.2]],
  },
  'ae-riders': {
    set: 'plain', opt: { sky: 'day' },
    cam: [C(-1, [3.6, 1.5, 6], [0, 2, 14], 36), C(1, [-3, 3, -2], [0, 2, 10], 34, 5), C(2, [2.4, 2.6, 2.4], [0.4, 2.2, -0.2], 30, 0)],
    cover: false,
    actors: [
      { who: 'valerius', voice: 'val', at: [0.4, 30], rot: 180, horse: '#e8e0d0', keys: [{ l: -1, d: 0.3, at: [0.4, 0], move: 11 }, { l: 2, d: 3, rot: 240 }] },
      { who: 'legionary', voice: 'sol', at: [-0.8, 33], rot: 180, horse: '#5a3a24', keys: [{ l: -1, d: 0.3, at: [-1.0, 3], move: 11 }, { l: 1, rot: 240 }] },
      { who: 'legionary', at: [1.4, 35], rot: 180, horse: '#3a2a20', item: 'standard', keys: [{ l: -1, d: 0.3, at: [1.6, 5], move: 11 }] },
      { who: 'guard', at: [0.2, 37], rot: 180, horse: '#7a5434', keys: [{ l: -1, d: 0.3, at: [0.2, 7], move: 11 }] },
    ],
    sound: { birds: 0.3, wind: 0.3, drone: 0.3 },
    sfx: [[-1, 'gallop', 0.2], [0, 'gallop', 2], [1, 'fanfare', 0]],
  },
  'ae-farewell': {
    set: 'farm', opt: { sky: 'day' },
    cam: [C(-1, [9, 1.4, 5], [5, 1.1, 0.3], 36), C(0, [7.4, 1.2, 3.0], [5, 1.0, 0.3], 32, 6)],
    frames: { 0: 'two', 1: 'close' },
    actors: [
      { who: 'lucius', voice: 'boy', at: [4.6, 0.6], rot: 80, keys: [{ l: 3, d: 2, pose: 'raise', move: 0.6 }] },
      { who: 'farmer', voice: 'farm', at: [4.1, -0.5], rot: 70, item: 'staff', keys: [{ l: 2, d: 1.2, at: [5.0, -0.2], move: 0.8, pose: 'offer' }, { l: 2, d: 2.8, item: null, pose: 'stand' }] },
      { who: 'donTravel', voice: 'don', at: [5.9, 0.7], rot: 260, keys: [{ l: 2, d: 2.8, item: 'staff', pose: 'guard' }, { l: 3, d: 3, at: [7.0, -16], move: 18 }] },
    ],
    sound: { birds: 0.6, melody: 0.7 },
  },

  /* ---- VI. The river ---- */
  'st-bridge': {
    set: 'stirone', opt: { sky: 'sunset' },
    cam: [C(-1, [8, 4, 22], [-10, 1.5, 2], 40), C(-1, [2, 2.6, 16], [-4, 1.2, 8], 36, 14, 1)],
    cover: false,
    actors: [
      { who: 'donTravel', at: [-14, 8], rot: 90, item: 'staff', pose: 'guard', keys: [{ l: -1, at: [-1.0, 8.4], move: 13 }] },
      { who: 'valerius', at: [-34, 13], rot: 90, horse: '#e8e0d0', keys: [{ l: 0, d: 2, at: [-6.5, 11.5], move: 9 }] },
      { who: 'legionary', at: [-37, 14.5], rot: 90, horse: '#5a3a24', keys: [{ l: 0, d: 2.3, at: [-9, 13], move: 9 }] },
      { who: 'legionary', at: [-39, 12], rot: 90, horse: '#3a2a20', item: 'standard', keys: [{ l: 0, d: 2.6, at: [-10.5, 11], move: 9 }] },
    ],
    trans: 'black',
    sound: { water: 0.6, wind: 0.3, birds: 0.2, melody: 0.5 },
    sfx: [[0, 'gallop', 2]],
  },
  'st-meet': {
    set: 'stirone', opt: { sky: 'sunset' },
    cam: [C(-1, [0, 1.7, 13], [0, 1.5, 8.5], 36)],
    actors: [
      { who: 'valeriusBare', voice: 'val', at: [-1.3, 9.0], rot: 95, mood: 'sad' },
      { who: 'donTravel', voice: 'don', at: [0.9, 8.7], rot: 275, item: 'staff', pose: 'guard', keys: [{ l: 1, item: null, pose: 'stand' }] },
      { who: 'legionary', at: [-6.5, 11.5], rot: 90, horse: '#5a3a24' },
      { who: 'legionary', at: [-8.5, 10.5], rot: 80, horse: '#3a2a20', item: 'standard' },
    ],
    sound: { water: 0.55, wind: 0.2, melody: 0.5 },
  },
  'st-plead': {
    set: 'stirone', opt: { sky: 'sunset' },
    cam: [C(-1, [-1, 1.6, 12.5], [0, 1.5, 8.5], 34)],
    frames: { 1: 'close', 3: 'close' },
    actors: [
      { who: 'valeriusBare', voice: 'val', at: [-0.8, 9.0], rot: 95, mood: 'sad', keys: [{ l: 1, pose: 'beg', move: 0.9 }, { l: 2, d: 1, pose: 'stand' }] },
      { who: 'donTravel', voice: 'don', at: [0.9, 8.7], rot: 275, keys: [{ l: 2, d: 0.4, at: [0.3, 8.8], move: 1.2 }] },
    ],
    sound: { water: 0.5, wind: 0.2, melody: 0.7 },
  },
  'st-kneel': {
    set: 'stirone', opt: { sky: 'sunset' },
    cam: [C(-1, [4, 1.4, 11], [-2, 1.0, 5], 36), C(1, [1.5, 1.05, 5.4], [0.5, 1.12, 6.7], 30, 0), C(2, [6, 2.5, 13], [-6, 1.0, 0], 40, 0), C(2, [5, 3, 14], [-12, 0.8, -2], 40, 10, 1)],
    frames: { 1: 'path', 2: 'path' },
    actors: [
      { who: 'donTravel', voice: 'don', at: [0.8, 7.4], rot: 245, keys: [{ l: 0, d: 0.5, at: [0.6, 6.7], move: 1.4, rot: 240 }, { l: 0, d: 2.2, pose: 'kneel', move: 1.4 }, { l: 1, pose: 'pray', move: 0.5 }, { l: 1, d: 0.5, pose: 'kneel', look: SUN }] },
      { who: 'valeriusBare', at: [2.0, 8.6], rot: 225, item: 'sword', pose: 'guard', mood: 'sad', keys: [{ l: 2, d: 0.6, rot: 160, move: 1.5 }] },
    ],
    sound: { water: 0.6, wind: 0.25, drone: 0.3, melody: 0.6 },
    sfx: [[1, 'choir', 0.3], [2, 'splash', 3.6]],
  },

  /* ---- VII. The miracle ---- */
  'mi-night': {
    set: 'stirone', opt: { sky: 'night', shroud: true },
    cam: [C(-1, [7, 2.2, 14], [0, 0.8, 7], 38), C(-1, [3.4, 1.4, 10], [0.8, 0.6, 7], 34, 14, 1)],
    cover: false,
    actors: [{ who: 'valeriusBare', at: [1.6, 7.6], rot: 250, pose: 'grieve' }],
    fx: { fireflies: 0.7 },
    trans: 'black',
    sound: { water: 0.5, wind: 0.2, drone: 0.4, melody: 0.4 },
  },
  'mi-rise': {
    set: 'stirone', opt: { sky: 'dawn', shroud: true },
    cam: [C(-1, [-2.5, 1.3, 10.5], [0.8, 1.0, 7.0], 36), C(0, [-2.0, 1.0, 9.6], [0.7, 1.5, 6.9], 34, 8), C(1, [-1.2, 1.4, 9.2], [0.7, 1.4, 6.9], 32, 6)],
    cover: false,
    actors: [
      { who: 'valeriusBare', at: [2.0, 8.4], rot: 250, pose: 'grieve', keys: [{ l: 1, d: 2, pose: 'kneel', look: [0.6, 1.6, 6.8], move: 1.2 }] },
      { who: 'donSaint', at: [0.6, 6.8], rot: 120, headless: true, pose: 'lie', alpha: 0, glow: 0, keys: [{ l: 0, d: 1, alpha: 1, move: 0.2 }, { l: 0, d: 1.2, glow: 1, move: 4 }, { l: 0, d: 3, pose: 'kneel', move: 1.2 }, { l: 1, pose: 'stand', move: 1 }, { l: 1, d: 1.5, pose: 'hold', move: 1 }] },
    ],
    animate(m, props) {
      const s = props.shroud;
      if (s) s.visible = m.on(0, 0.6, 1.0) < 0.5;
    },
    fx: { grace: 0.7, mist: 0.2 },
    exposure: 0.85,
    trans: 'light',
    sound: { water: 0.4, birds: 0.2, melody: 0.9 },
    sfx: [[0, 'choir', 0.8]],
  },
  'mi-widow': {
    set: 'stirone', opt: { sky: 'dawn' },
    cam: [C(-1, [-2.5, 1.6, 14], [1.5, 1.4, 8], 36)],
    actors: [
      { who: 'widow', voice: 'wid', at: [-2.4, 10], rot: 120, mood: 'fear', keys: [{ l: 1, mood: 'calm' }, { l: 3, pose: 'pray', move: 1 }] },
      { who: 'donSaint', voice: 'don', at: [3.5, 7.6], rot: 260, headless: true, pose: 'hold', glow: 1, keys: [{ l: -1, at: [0.3, 8.6], move: 4.5 }] },
    ],
    fx: { grace: 0.5, mist: 0.25 },
    exposure: 0.85,
    sound: { water: 0.45, birds: 0.35, melody: 0.7 },
  },
  'mi-cross': {
    set: 'stirone', opt: { sky: 'dawn' },
    cam: [C(-1, [14, 3.5, 12], [5, 1, -2], 38), C(-1, [12, 5, 2], [4, 1.5, -10], 38, 16, 2)],
    cover: false,
    actors: [
      { who: 'donSaint', at: [5.8, 6.4], rot: 180, headless: true, pose: 'hold', glow: 1, keys: [{ l: -1, d: 0.6, at: [6, -1], y: -0.45, move: 6 }, { l: 0, d: 4, at: [5.2, -9], y: 0, move: 6 }, { l: 0, d: 10, at: [4.2, -12], move: 2.4 }, { l: 0, d: 12.8, pose: 'kneel', move: 1.5 }] },
      { who: 'valeriusBare', at: [6.8, 9], rot: 180, keys: [{ l: -1, d: 2.5, at: [6.6, 5.4], move: 5 }] },
    ],
    fx: { grace: 0.6, mist: 0.2 },
    sound: { water: 0.65, birds: 0.35, melody: 0.9 },
    sfx: [[0, 'splash', 1], [0, 'choir', 12.5]],
  },
  'mi-valerius': {
    set: 'stirone', opt: { sky: 'golden', tomb: true },
    cam: [C(-1, [4.6, 1.6, -6.5], [1.5, 0.9, -12], 36), C(0, [3, 1.1, -8.6], [1.5, 0.9, -11.4], 30, 6), C(1, [6.5, 2.4, -5], [1.6, 0.8, -11.5], 40, 4)],
    frames: { 0: 'path' },
    cover: false,
    actors: [
      { who: 'valeriusBare', voice: 'val', at: [1.5, -10.3], rot: 180, pose: 'grieve', keys: [{ l: 1, pose: 'kneel', move: 1.2 }] },
      { who: 'farmer', at: [9, -8], rot: 270, keys: [{ l: 2, at: [3.6, -10.6], move: 5 }] },
      { who: 'lucius', at: [9.6, -8.6], rot: 270, item: 'jug', keys: [{ l: 2, at: [2.6, -11.0], move: 5.6, rot: 200 }, { l: 2, d: 6, pose: 'offer', move: 0.8 }, { l: 2, d: 7.4, item: null, pose: 'stand' }] },
    ],
    trans: 'light',
    sound: { water: 0.35, birds: 0.5, melody: 0.8 },
    sfx: [[2, 'chime', 7.2]],
  },

  /* ---- VIII. The town ---- */
  'ci-town': {
    set: 'medieval', opt: { sky: 'golden', built: 0.72 },
    cam: [C(-1, [0, 22, 30], [0, 4, -12], 40), C(-1, [5, 3.2, 10], [0, 4, -14], 38, 14, 0.5)],
    cover: false,
    actors: [
      { who: 'pilgrimMan', at: [-1, 16], rot: 180, item: 'staff', pose: 'guard', keys: [{ l: -1, at: [-1, 1], move: 18 }] },
      { who: 'pilgrim', at: [0.2, 17], rot: 180, keys: [{ l: -1, at: [0.2, 2], move: 18 }] },
    ],
    fx: { dust: 0.4 },
    trans: 'light',
    sound: { crowd: 0.35, birds: 0.4, melody: 0.6 },
    sfx: [[0, 'bell', 1], [1, 'chisel', 0.6]],
  },
  'ci-workshop': {
    set: 'workshop', opt: { sky: 'golden' },
    cam: [C(-1, [3.6, 1.8, 3.4], [0.4, 1.1, -1], 38), C(0, [1.6, 1.4, 1.6], [0.4, 1.1, -1.1], 30, 8)],
    actors: [
      { who: 'master', voice: 'mast', at: [1.5, -0.7], rot: 255, pose: 'carve', item: 'chisel', keys: [{ l: 2, pose: 'talk', item: null, rot: 230 }, { l: 4, d: 3, pose: 'carve', item: 'chisel', rot: 255 }] },
      { who: 'apprentice', voice: 'app', at: [-0.8, -0.1], rot: 110, item: 'hammer', pose: 'guard' },
    ],
    fx: { dust: 0.8 },
    sound: { birds: 0.35, crowd: 0.12, melody: 0.5 },
    sfx: [[0, 'chisel', 2], [0, 'chisel', 3.2], [4, 'chisel', 3.5]],
  },
  'ci-pilgrim': {
    set: 'workshop', opt: { sky: 'golden' },
    cam: [C(-1, [-3.8, 1.7, 3.2], [0.4, 1.2, -0.6], 38)],
    actors: [
      { who: 'pilgrim', voice: 'pil', at: [-2.6, 2.6], rot: 140, mood: 'sad', keys: [{ l: -1, at: [-0.5, 1.0], move: 3 }, { l: 0, rot: 110 }, { l: 2, d: 4, at: [3.5, -5.2], move: 5 }] },
      { who: 'master', voice: 'mast', at: [1.5, -0.7], rot: 240 },
      { who: 'apprentice', at: [-0.9, -0.4], rot: 80, item: 'hammer', pose: 'guard' },
    ],
    sound: { birds: 0.35, crowd: 0.12, melody: 0.6 },
    sfx: [[2, 'bell', 2]],
  },

  /* ---- Epilogue ---- */
  'ep-today': {
    set: 'piazza', opt: { sky: 'dusk' },
    cam: [C(-1, [-2, 8, 18], [-1, 4, -10], 40), C(-1, [2, 1.5, 6], [-1.6, 1.4, 1.6], 36, 6, 0.5)],
    frames: { 0: 'path', 1: 'two' },
    actors: [
      { who: 'kid', voice: 'kid', at: [-1.9, 1.6], rot: 200, look: STATUE, keys: [{ l: 1, look: null, rot: 60 }, { l: 3, look: STATUE, rot: 190 }] },
      { who: 'mom', voice: 'mom', at: [-1.0, 1.9], rot: 190, look: STATUE, keys: [{ l: 1, look: null, rot: 240 }, { l: 3, look: STATUE }] },
    ],
    trans: 'light',
    sound: { wind: 0.15, crowd: 0.12, birds: 0.2, melody: 0.6 },
    sfx: [[3, 'bell', 1]],
  },
  'ep-end': {
    set: 'piazza', opt: { sky: 'night' },
    cam: [C(-1, [-2.6, 6.1, -9.4], [-3, 6.15, -12.3], 30), C(0, [-2.0, 7.0, -5.5], [-3, 6.6, -12.3], 40, 9, 1), C(1, [0, 10, 12], [0, 22, -30], 50, 12, 0.5)],
    cover: false,
    fx: { snow: 0.4 },
    trans: 'fade',
    sound: { wind: 0.2, drone: 0.3, melody: 1 },
    sfx: [[1, 'choir', 0], [1, 'bell', 4]],
  },
};
