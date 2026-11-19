/* Arena Royale 2 — shared runtime state */

import * as THREE from 'three';
import { STORM_PHASES, STORM_WAIT, BOT_COUNT } from './config.js';

export function freshStorm() {
  return {
    cx: 0, cz: 0,
    r: 120, startR: 120, targetR: STORM_PHASES[0].r,
    state: 'wait', timer: STORM_WAIT, phaseIdx: 0, dmgAcc: 0
  };
}

function freshInput() {
  return {
    joyMove: { active: false, id: null, bx: 0, by: 0, dx: 0, dy: 0, rad: 50 },
    joyAim: { active: false, id: null, bx: 0, by: 0, dx: 0, dy: 0, rad: 50 },
    mouseX: 0, mouseY: 0, mouseDown: false, mouseUsed: false,
    keys: { up: false, down: false, left: false, right: false }
  };
}

export const G = {
  phase: 'menu',
  started: false,
  lastT: 0,

  scene: null,
  camera: null,
  renderer: null,
  forestMesh: null,
  aimLine: null,
  aimDir: new THREE.Vector3(0, 0, -1),

  curDpr: 1,
  targetDpr: 1,
  fpsAcc: 0,
  fpsN: 0,
  fpsAvg: 60,
  fpsTimer: 0,

  player: null,
  bots: [],
  projectiles: [],
  crates: [],
  rocks: [],
  trees: [],
  loot: [],
  explosions: [],
  particles: [],

  kills: 0,
  streak: 0,
  dropTimer: 25,
  dropActive: false,
  timeScale: 1,
  shake: 0,
  legendT: 0,
  matchShots: 0,
  matchHits: 0,

  storm: freshStorm(),
  input: freshInput()
};

export function resetRuntime() {
  G.player = null;
  G.bots = [];
  G.projectiles = [];
  G.crates = [];
  G.rocks = [];
  G.trees = [];
  G.loot = [];
  G.explosions = [];
  G.particles = [];
  G.kills = 0;
  G.streak = 0;
  G.dropTimer = 25;
  G.dropActive = false;
  G.timeScale = 1;
  G.shake = 0;
  G.legendT = 0;
  G.matchShots = 0;
  G.matchHits = 0;
  G.storm = freshStorm();
  G.aimDir.set(0, 0, -1);
  G.input = freshInput();
}

export const aliveBots = () => G.bots.filter(b => b.alive).length;
