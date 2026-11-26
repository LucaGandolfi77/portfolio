import { ACT1 } from './act1';
import { ACT2 } from './act2';
import type { Shots } from './types';

/** Every picture of the film, by shot id (see script.ts). */
export const SHOT_VIEWS: Shots = { ...ACT1, ...ACT2 };
