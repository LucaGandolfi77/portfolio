/* Pinball — versioned profile, scores and preferences */
import { VERSION, TABLES, OBJECTIVES } from './config.js';
import { rankScores, isRecord } from './engine/scoring.js';

const SAVE = 'pf.pinball.profile.v1';
const PREFS = 'pf.pinball.prefs.v1';
const defaults = { sound:true, vibration:true, reducedMotion:false, quality:'high', theme:'dark' };

export function initialProfile() {
  return {
    version:VERSION, games:0, totalScore:0, bestOverall:0, table:TABLES[0].id,
    scores:Object.fromEntries(TABLES.map(t => [t.id, []])),
    played:Object.fromEntries(TABLES.map(t => [t.id, 0])),
    challenges:[]
  };
}
export function normalizeProfile(raw) {
  const base = initialProfile();
  if (!raw || raw.version !== VERSION) return base;
  const p = { ...base, ...raw };
  p.scores = Object.fromEntries(TABLES.map(t => [t.id, Array.isArray(raw.scores?.[t.id]) ? raw.scores[t.id].slice(0, 5) : []]));
  p.played = Object.fromEntries(TABLES.map(t => [t.id, Number(raw.played?.[t.id]) || 0]));
  p.challenges = Array.isArray(raw.challenges) ? raw.challenges.slice(-10) : [];
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

export function recordScore(profile, tableId, score) {
  const p = JSON.parse(JSON.stringify(profile));
  const wasRecord = isRecord(p.scores[tableId] || [], tableId, score);
  p.games++;
  p.totalScore += score;
  p.bestOverall = Math.max(p.bestOverall, score);
  p.played[tableId] = (p.played[tableId] || 0) + 1;
  p.scores[tableId] = rankScores([...(p.scores[tableId] || []), { score, t:Date.now() }]);
  return { profile:p, record:wasRecord };
}
export function recordChallenge(profile, entry) {
  const p = JSON.parse(JSON.stringify(profile));
  p.challenges = [...p.challenges, { ...entry, t:Date.now() }].slice(-10);
  return p;
}
export function objectives(profile) {
  const played = Object.values(profile.played).filter(n => n > 0).length;
  const values = { games10:profile.games, score100k:profile.bestOverall, tables4:played };
  return OBJECTIVES.map(o => ({ ...o, current:values[o.id] || 0, done:(values[o.id] || 0) >= o.goal }));
}
