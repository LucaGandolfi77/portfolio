/* Fasce di famosità, preset, costruzione del mazzo e punteggio. */

export const TIERS = [
  { id: 'iconic', min: 3.5, mult: 1, timer: 26, color: '#fbbf24' },
  { id: 'famous', min: 2.7, mult: 1.5, timer: 24, color: '#f97316' },
  { id: 'known', min: 1.9, mult: 2, timer: 21, color: '#38bdf8' },
  { id: 'niche', min: 1.1, mult: 3, timer: 18, color: '#a78bfa' },
  { id: 'obscure', min: 0.4, mult: 4, timer: 14, color: '#f472b6' },
  { id: 'deep', min: -Infinity, mult: 5, timer: 10, color: '#4ade80' }
];

export const PRESETS = {
  explorer: { id: 'explorer', rounds: 15, from: 0, to: 2, timeScale: 1.15 },
  normal: { id: 'normal', rounds: 12, from: 0, to: 4, timeScale: 1 },
  expert: { id: 'expert', rounds: 10, from: 1, to: 5, timeScale: 0.9 },
  masochist: { id: 'masochist', rounds: 10, from: 3, to: 5, timeScale: 0.75 }
};

export function tierForFame(fame) {
  for (let i = 0; i < TIERS.length; i++) {
    if (fame >= TIERS[i].min) return i;
  }
  return TIERS.length - 1;
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function bucketFor(articles, tierIndex) {
  return articles.filter(a => tierForFame(a.fame) === tierIndex);
}

function pickFrom(articles, buckets, tierIndex, used) {
  for (let radius = 0; radius < TIERS.length; radius++) {
    const indices = radius === 0 ? [tierIndex] : [tierIndex - radius, tierIndex + radius];
    for (const idx of indices) {
      if (idx < 0 || idx >= TIERS.length) continue;
      const pool = (buckets[idx] || []).filter(a => !used.has(a.id));
      if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  const rest = articles.filter(a => !used.has(a.id));
  return rest.length ? rest[Math.floor(Math.random() * rest.length)] : null;
}

/** Costruisce le domande: ogni round scende di fascia secondo il preset. */
export function buildDeck(articles, mode, presetId, count) {
  const preset = PRESETS[presetId] || PRESETS.normal;
  const rounds = count || preset.rounds;
  const buckets = TIERS.map((_, i) => shuffle(bucketFor(articles, i)));
  const used = new Set();
  const deck = [];

  for (let round = 0; round < rounds; round++) {
    const progress = rounds > 1 ? round / (rounds - 1) : 0;
    const targetTier = Math.round(preset.from + progress * (preset.to - preset.from));
    const article = pickFrom(articles, buckets, targetTier, used);
    if (!article) break;
    used.add(article.id);

    const correctTier = tierForFame(article.fame);
    let options = [];
    if (mode === 'quiz') {
      const distractors = [];
      const local = (buckets[correctTier] || []).filter(a => a.id !== article.id);
      distractors.push(...local);
      if (distractors.length < 3) {
        const wider = shuffle(articles.filter(a => a.id !== article.id && !distractors.some(d => d.id === a.id)));
        distractors.push(...wider);
      }
      options = shuffle([article, ...distractors.slice(0, 3)]);
    }

    deck.push({
      article,
      tier: correctTier,
      options,
      correctIndex: mode === 'quiz' ? options.indexOf(article) : -1,
      timeLimit: Math.max(6, Math.round(TIERS[correctTier].timer * preset.timeScale))
    });
  }
  return deck;
}

export function streakMultiplier(streak) {
  return 1 + Math.min(streak, 8) * 0.25;
}

export function questionPoints(tierIndex, streak, timeRatio, mode, classicCorrect) {
  const tier = TIERS[tierIndex] || TIERS[0];
  if (mode === 'classic' && !classicCorrect) return Math.round(10 * tier.mult);
  const base = 100 * tier.mult * streakMultiplier(streak);
  const bonus = 30 * tier.mult * Math.max(0, Math.min(1, timeRatio));
  return Math.round(base + bonus);
}

export function hintCost(tierIndex) {
  return Math.round(35 * (TIERS[tierIndex] || TIERS[0]).mult);
}

export function rankFor(score, rounds) {
  const pct = score / Math.max(1, rounds * 520);
  if (pct >= 0.95) return 1;
  if (pct >= 0.7) return 2;
  if (pct >= 0.45) return 3;
  if (pct >= 0.25) return 4;
  return 5;
}
