import type { Difficulty, Quality } from '../data/types';

export const CONFIG = {
  eyeHeight: 1.62,
  crouchHeight: 1.02,
  walkSpeed: 3.2,
  sprintSpeed: 5.5,
  crouchSpeed: 1.75,
  acceleration: 15,
  damping: 12,
  gravity: 18,
  mouseSensitivity: 0.0022,
  touchSensitivity: 0.0042,
  interactionRange: 3.1,
  captureDistance: 1.25,
  threatMax: 100,
  panicMax: 100,
  groundingDuration: 3.0,
  battery: {
    idleDrain: 0.011,
    phoneDrain: 0.085,
    callDrain: 0.22,
    flashlightDrain: 0.15,
    chargerRate: 13,
    powerBank: 40,
    critical: 15,
  },
  difficulty: {
    easy: { threat: 0.68, battery: 0.75, enemySpeed: 0.82, panic: 0.72 },
    normal: { threat: 1, battery: 1, enemySpeed: 1, panic: 1 },
    hard: { threat: 1.38, battery: 1.25, enemySpeed: 1.2, panic: 1.3 },
  } as Record<Difficulty, { threat: number; battery: number; enemySpeed: number; panic: number }>,
  quality: {
    low: { pixelRatio: 0.75, shadows: false, shadowSize: 512, fogFar: 28, lights: 3, postFx: false },
    medium: { pixelRatio: 1, shadows: true, shadowSize: 1024, fogFar: 40, lights: 5, postFx: false },
    high: { pixelRatio: 1.4, shadows: true, shadowSize: 2048, fogFar: 54, lights: 7, postFx: true },
    ultra: { pixelRatio: 2, shadows: true, shadowSize: 2048, fogFar: 64, lights: 9, postFx: true },
  } as Record<Quality, { pixelRatio: number; shadows: boolean; shadowSize: number; fogFar: number; lights: number; postFx: boolean }>,
};
