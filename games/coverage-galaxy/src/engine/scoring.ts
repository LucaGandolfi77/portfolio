// Coverage Galaxy — Scoring & Progression

export interface PlayerProfile {
  xp: number;
  rank: string;
  planetsCompleted: string[];
  badges: string[];
  dailyStreak: number;
  lastDailyDate: string;
  mode: 'beginner' | 'advanced';
  hintsUsed: number;
}

export const RANKS = [
  { name: 'Cadet', xp: 0 },
  { name: 'Guardiamarina', xp: 3000 },
  { name: 'Ingegnere', xp: 8000 },
  { name: 'Specialista', xp: 16000 },
  { name: 'Verification Master', xp: 30000 },
];

export function getRank(xp: number): string {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].xp) return RANKS[i].name;
  }
  return RANKS[0].name;
}

export function getNextRankXP(xp: number): number | null {
  for (const r of RANKS) {
    if (xp < r.xp) return r.xp;
  }
  return null;
}

export function calcPlanetScore(params: {
  coveragePct: number;
  testsUsed: number;
  testsOptimal: number;
  triageCorrect: number;
  triageTotal: number;
  anomaliesTruePositive: number;
  anomaliesFalsePositive: number;
  regressionClean: boolean;
  mode: 'beginner' | 'advanced';
  hintsUsed: number;
}): number {
  const base = 1000;
  const coverageBonus = Math.round(params.coveragePct * 5);
  const efficiencyBonus = params.testsOptimal > 0
    ? Math.max(0, Math.round((params.testsOptimal / Math.max(1, params.testsUsed)) * 300))
    : 0;
  const triageBonus = params.triageTotal > 0
    ? Math.round((params.triageCorrect / params.triageTotal) * 400)
    : 0;
  const anomalyBonus = params.anomaliesTruePositive * 200 - params.anomaliesFalsePositive * 100;
  const regressionBonus = params.regressionClean ? 200 : 0;
  const hintPenalty = params.mode === 'advanced' ? params.hintsUsed * 50 : 0;

  return Math.max(0, base + coverageBonus + efficiencyBonus + triageBonus + Math.max(0, anomalyBonus) + regressionBonus - hintPenalty);
}

export const BADGES: Record<string, { name: string; desc: string; icon: string }> = {
  'first-contact': { name: 'First Contact', desc: 'Conquista il tuo primo pianeta', icon: '🛸' },
  'orbit-complete': { name: 'Orbita Completa', desc: '100% statement coverage', icon: '🪐' },
  'branch-nav': { name: 'Branch Navigator', desc: '100% branch coverage', icon: '🧭' },
  'moonwalker': { name: 'Moonwalker', desc: '100% MC/DC coverage', icon: '🌙' },
  'anomaly-hunter': { name: 'Anomaly Hunter', desc: 'Trova un defect in un pianeta', icon: '🔍' },
  'zero-false': { name: 'Zero False Alarms', desc: 'Nessuna falsa anomalia su 3 pianeti', icon: '✅' },
  'regression-champ': { name: 'Regression Champion', desc: '5 regression campaign pulite', icon: '🔁' },
  'minimalist': { name: 'Minimalist', desc: 'Branch 100% con ≤5 test in un pianeta', icon: '✂️' },
  'stub-architect': { name: 'Stub Architect', desc: 'Configura 20 stub correttamente', icon: '⚙️' },
  'glossary-scholar': { name: 'Glossario Scholar', desc: 'Leggi tutti i termini del glossario', icon: '📚' },
  'speed-run': { name: 'Speed Run', desc: 'Completa un pianeta in <5 min', icon: '⚡' },
  'daily-cadet': { name: 'Daily Cadet', desc: 'Completa 3 missioni giornaliere', icon: '📅' },
  'galaxy-master': { name: 'Galaxy Master', desc: 'Conquista tutti i pianeti', icon: '🌟' },
};
