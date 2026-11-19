/* GEOM DASH — seeded level generator with pooled obstacles */

import { W, GROUND, CHAPTERS, DIFFICULTIES } from './config.js';

export function makeRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dailySeed() {
  const day = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < day.length; i++) hash = (hash * 31 + day.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

const POOL_SIZE = 48;

export function createLevel({ mode = 'endless', chapter = 0, difficulty = 'normal', seed = 1 } = {}) {
  const rng = makeRng(seed);
  const chapterData = CHAPTERS[Math.min(chapter, CHAPTERS.length - 1)];
  const diff = DIFFICULTIES[difficulty] || DIFFICULTIES.normal;
  const isRun = mode === 'level' || mode === 'daily';
  const length = isRun ? chapterData.length : Infinity;

  const pool = Array.from({ length: POOL_SIZE }, () => ({
    x: 0, y: 0, w: 0, h: 0, active: false, near: false, counted: false, type: 'block', hue: 0
  }));

  const level = {
    mode, chapter, difficulty, seed,
    chapterData, diff, length,
    obstacles: pool,
    distance: 0,
    nextSpawnAt: 520,
    checkpoints: isRun ? [chapterData.length * 0.33, chapterData.length * 0.66] : [],
    nextCheckpoint: 0,
    finished: false,
    rng
  };

  return level;
}

function take(level) {
  for (let i = 0; i < level.obstacles.length; i++) {
    if (!level.obstacles[i].active) return level.obstacles[i];
  }
  return null;
}

function spawnGroup(level, x) {
  const rng = level.rng;
  const chapterIndex = level.chapter;
  const roll = rng();
  const lowHeight = 46 + rng() * (58 + chapterIndex * 8);
  const gapMultiplier = 1 - chapterIndex * 0.03;

  const add = (type, px, py, w, h) => {
    const obstacle = take(level);
    if (!obstacle) return;
    obstacle.active = true;
    obstacle.near = false;
    obstacle.counted = false;
    obstacle.type = type;
    obstacle.x = px;
    obstacle.y = py;
    obstacle.w = w;
    obstacle.h = h;
    obstacle.hue = rng();
  };

  if (roll < 0.3) {
    add('block', x, GROUND - lowHeight, 38 + rng() * 26, lowHeight);
  } else if (roll < 0.5) {
    add('spike', x, GROUND - 40, 38, 40);
  } else if (roll < 0.68) {
    add('ceiling', x, 0, 44 + rng() * 22, 70 + rng() * 40);
  } else if (roll < 0.85) {
    const ceilingHeight = 70 + rng() * 30;
    add('block', x, GROUND - lowHeight * 0.7, 40, lowHeight * 0.7);
    add('ceiling', x + 70 * gapMultiplier, 0, 40, ceilingHeight);
  } else {
    add('spike', x, GROUND - 40, 38, 40);
    add('block', x + 105 * gapMultiplier, GROUND - lowHeight * 0.8, 40, lowHeight * 0.8);
  }
}

export function updateLevel(level, dt, speed) {
  level.distance += speed * dt;
  let passed = 0;
  let checkpoint = -1;

  for (let i = 0; i < level.obstacles.length; i++) {
    const obstacle = level.obstacles[i];
    if (!obstacle.active) continue;
    obstacle.x -= speed * dt;
    if (!obstacle.counted && obstacle.x + obstacle.w < 120) {
      obstacle.counted = true;
      passed++;
    }
    if (obstacle.x + obstacle.w < -40) obstacle.active = false;
  }

  const spawnHorizon = level.distance + W + 120;
  while (level.nextSpawnAt < spawnHorizon) {
    spawnGroup(level, W + 40 + (level.nextSpawnAt - level.distance));
    level.nextSpawnAt += level.diff.gap + level.rng() * 150;
  }

  if (level.nextCheckpoint < level.checkpoints.length && level.distance >= level.checkpoints[level.nextCheckpoint]) {
    checkpoint = level.nextCheckpoint;
    level.nextCheckpoint++;
  }

  if (!level.finished && level.distance >= level.length) {
    level.finished = true;
  }

  return { passed, checkpoint, finished: level.finished };
}

export function resetLevel(level, checkpointIndex = -1) {
  for (const obstacle of level.obstacles) obstacle.active = false;
  if (checkpointIndex >= 0 && level.checkpoints[checkpointIndex] !== undefined) {
    level.distance = level.checkpoints[checkpointIndex];
    level.nextCheckpoint = checkpointIndex + 1;
  } else {
    level.distance = 0;
    level.nextCheckpoint = 0;
  }
  level.nextSpawnAt = level.distance + 520;
  level.finished = false;
}

export function progressOf(level) {
  if (!isFinite(level.length) || level.length <= 0) return 0;
  return Math.min(1, level.distance / level.length);
}
