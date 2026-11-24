import test from 'node:test';
import assert from 'node:assert/strict';
import { MISSIONS, SHIPS, WEAPONS, BOSSES, MODES, findShip, findMission, STORAGE_KEY } from '../js/config.js';
import { createWorld, stepWorld, rngFromSeed, createGrid, adaptiveDifficulty, evaluateObjective, distance, clamp } from '../js/sim.js';
import { dailySeed, dailyMission, objectiveProgress, starsFor, nextMissionId, modeConfig } from '../js/missions.js';
import { emptySave, normalizeSave, totalStars, isUnlocked, applyMissionResult, newUnlocks } from '../js/economy.js';

test('registry: missioni, navi, armi, boss e modalità', () => {
  assert.equal(MISSIONS.length, 15);
  assert.ok(new Set(MISSIONS.map((item) => item.id)).size === 15);
  assert.ok(SHIPS.length >= 5 && WEAPONS.length >= 4 && BOSSES.length >= 3 && MODES.length >= 7);
  SHIPS.forEach((ship) => assert.ok(ship.hull > 0 && ship.speed > 0 && ship.reload > 0));
  assert.equal(findShip('unknown').id, 'scout');
  assert.equal(findMission('unknown').id, 'm01');
  assert.ok(STORAGE_KEY.includes('battleship'));
});

test('RNG deterministico e spatial hash', () => {
  const a = rngFromSeed(42), b = rngFromSeed(42);
  assert.equal(a(), b());
  const grid = createGrid(100);
  grid.insert({ x: 10, y: 10, id: 'a' });
  grid.insert({ x: 550, y: 550, id: 'b' });
  assert.equal(grid.near(20, 20).length, 1);
  assert.equal(grid.near(550, 550).length, 1);
  assert.equal(clamp(5, 0, 1), 1);
  assert.equal(distance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
});

test('mondo: step, spari e obiettivi', () => {
  const world = createWorld({ missionId: 'm01', seed: 7, shipId: 'scout' });
  assert.ok(world.enemies.length > 0 && world.islands.length === 15);
  const events = stepWorld(world, { throttle: 1, turn: 0, fire: true }, 1 / 60);
  assert.ok(Array.isArray(events));
  assert.equal(world.stats.shots, 1);
  assert.ok(world.projectiles.length > 0);
  world.stats.sunk = 3;
  assert.equal(evaluateObjective(world), true);
  assert.ok(objectiveProgress(world.mission, world) === 1);
});

test('DDA e missioni giornaliere', () => {
  const world = createWorld({ seed: 1 });
  const before = world.difficulty;
  adaptiveDifficulty(world, 0.9);
  assert.ok(world.difficulty >= before);
  assert.equal(dailySeed(new Date(2026, 0, 1)), 20260101);
  assert.ok(dailyMission(new Date(2026, 0, 1)).id.length === 3);
  assert.equal(nextMissionId('m15'), null);
  assert.equal(nextMissionId('m01'), 'm02');
  assert.equal(modeConfig('timeattack').timeLimit, 90);
});

test('economia: stelle, sblocchi e salvataggio', () => {
  const save = emptySave();
  assert.equal(totalStars(save), 0);
  assert.equal(isUnlocked('scout', save), true);
  assert.equal(isUnlocked('cruiser', save), false);
  const result = applyMissionResult(save, 'm01', 3, 100);
  assert.equal(totalStars(result.save), 3);
  assert.ok(result.reward.xp > 0);
  assert.deepEqual(normalizeSave({ stars: null }).stars, {});
  const rich = { ...save, stars: { m01: 3, m02: 3, m03: 3, m04: 3 } };
  assert.ok(newUnlocks(rich).some((ship) => ship.id === 'destroyer'));
});
