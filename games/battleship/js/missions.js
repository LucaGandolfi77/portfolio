/** missions.js — obiettivi, stelle e sfide giornaliere (puro). */

import { MISSIONS, findMission, findMode } from './config.js';
import { clamp } from './sim.js';

export function dailySeed(date = new Date()) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function dailyMission(date = new Date()) {
  const seed = dailySeed(date);
  return MISSIONS[seed % MISSIONS.length];
}

export function objectiveProgress(mission, world) {
  const objective = mission.objective;
  if (objective.type === 'sink') return clamp(world.stats.sunk / objective.target, 0, 1);
  if (objective.type === 'survive' || objective.type === 'escort') return clamp(world.stats.time / objective.target, 0, 1);
  if (objective.type === 'boss') return clamp(world.stats.sunk / objective.target, 0, 1);
  return 0;
}

export function starsFor(mission, stats) {
  const value = stats.score || stats.sunk * 10 || 0;
  const thresholds = mission.stars || [10, 20, 30];
  if (value >= thresholds[2]) return 3;
  if (value >= thresholds[1]) return 2;
  if (value >= thresholds[0]) return 1;
  return 0;
}

export function modeConfig(modeId) {
  const mode = findMode(modeId);
  if (modeId === 'timeattack') return { ...mode, timeLimit: 90, objective: { type: 'sink', target: 12 } };
  if (modeId === 'survival') return { ...mode, timeLimit: 120, objective: { type: 'survive', target: 120 } };
  if (modeId === 'endless') return { ...mode, timeLimit: 0, objective: { type: 'sink', target: Infinity } };
  if (modeId === 'daily') return { ...mode, timeLimit: 120, objective: { type: 'sink', target: 10 } };
  if (modeId === 'convoy') return { ...mode, timeLimit: 90, objective: { type: 'escort', target: 90 } };
  return mode;
}

export function nextMissionId(currentId) {
  const index = MISSIONS.findIndex((mission) => mission.id === currentId);
  if (index < 0 || index >= MISSIONS.length - 1) return null;
  return MISSIONS[index + 1].id;
}

export function missionByIndex(index) { return MISSIONS[clamp(index, 0, MISSIONS.length - 1)]; }

export function objectiveLabel(mission, lang = 'en') {
  const objective = mission.objective;
  const labels = {
    sink: lang === 'it' ? `Affonda ${objective.target} navi` : `Sink ${objective.target} ships`,
    survive: lang === 'it' ? `Sopravvivi ${objective.target}s` : `Survive ${objective.target}s`,
    escort: lang === 'it' ? `Scorta ${objective.target}s` : `Escort for ${objective.target}s`,
    boss: lang === 'it' ? 'Sconfiggi il boss' : 'Defeat the boss'
  };
  return labels[objective.type] || objective.type;
}

export function findMissionByBoss(bossId) {
  return MISSIONS.find((mission) => mission.mods && mission.mods.includes(bossId)) || findMission('m01');
}
