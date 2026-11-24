/* Pixel Runner — versioned profile, top scores and preferences */
import { VERSION, STAGES, OBJECTIVES } from './config.js';

const SAVE = 'pf.pixel-runner.profile.v1';
const PREFS = 'pf.pixel-runner.prefs.v1';
const defaults = { sound:true, vibration:true, reducedMotion:false, quality:'high', theme:'dark' };

export function initialProfile() {
  return {
    version:VERSION, runs:0, wins:0, totalScore:0, bestOverall:0,
    best:{}, scores:{}, bosses:0, stages:1, challenges:[],
    objectives:{ runs10:0, boss4:0, allclear:0 }
  };
}
export function normalizeProfile(raw) {
  const base = initialProfile();
  if (!raw || raw.version !== VERSION) return base;
  const p = { ...base, ...raw };
  p.best = raw.best && typeof raw.best === 'object' ? raw.best : {};
  p.scores = raw.scores && typeof raw.scores === 'object' ? raw.scores : {};
  p.challenges = Array.isArray(raw.challenges) ? raw.challenges.slice(-10) : [];
  p.objectives = { ...base.objectives, ...(raw.objectives || {}) };
  p.stages = Math.max(1, Math.min(STAGES.length, Number(p.stages) || 1));
  p.bosses = Math.max(0, Number(p.bosses) || 0);
  return p;
}
export function loadProfile() {
  try { return normalizeProfile(JSON.parse(localStorage.getItem(SAVE) || 'null')); }
  catch (e) { return initialProfile(); }
}
export function saveProfile(p) { try { localStorage.setItem(SAVE, JSON.stringify(p)); return true; } catch (e) { return false; } }
export function loadPrefs() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(PREFS) || '{}') }; }
  catch (e) { return { ...defaults }; }
}
export function savePrefs(p) { try { localStorage.setItem(PREFS, JSON.stringify(p)); } catch (e) {} }

export function recordRun(profile, result) {
  const p = JSON.parse(JSON.stringify(profile));
  const key = result.mode + ':' + result.difficulty;
  const score = Math.max(0, Math.round(result.score || 0));
  p.runs++; p.totalScore += score;
  p.best[key] = Math.max(p.best[key] || 0, score);
  p.bestOverall = Math.max(p.bestOverall, score);
  p.scores[key] = [...(p.scores[key] || []), { score, t:Date.now() }]
    .sort((a, b) => b.score - a.score).slice(0, 5);
  p.objectives.runs10 = p.runs;
  if (result.bosses) {
    p.bosses += result.bosses;
    p.objectives.boss4 = p.bosses;
    p.stages = Math.max(p.stages, Math.min(STAGES.length, result.stage + 2));
  }
  if (result.won) { p.wins++; p.objectives.allclear = 1; }
  return { profile:p, record:score > 0 && score >= (profile.best[key] || 0) };
}
export function recordChallenge(profile, entry) {
  const p = JSON.parse(JSON.stringify(profile));
  p.challenges = [...p.challenges, { ...entry, t:Date.now() }].slice(-10);
  return p;
}

export function objectives(profile) {
  const values = { runs10:profile.runs, boss4:profile.bosses, allclear:profile.wins };
  return OBJECTIVES.map(o => ({ ...o, current:values[o.id] || 0, done:(values[o.id] || 0) >= o.goal }));
}
