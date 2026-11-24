/**
 * fusion.js — fusione dei segnali sorriso con gating di confidenza (puro).
 */

export const clamp = (v, a, b) => Math.max(a, Math.min(b, Number(v) || 0));
export const clamp01 = (v) => clamp(v, 0, 1);

export function softmax(logits) {
  const values = Array.isArray(logits) ? logits : [];
  if (!values.length) return [];
  const peak = Math.max(...values.map((value) => Number(value) || 0));
  const exps = values.map((value) => Math.exp((Number(value) || 0) - peak));
  const total = exps.reduce((sum, value) => sum + value, 0) || 1;
  return exps.map((value) => value / total);
}

/** Entropia normalizzata: 0 = certo, 1 = del tutto ambiguo. */
export function entropyNormalized(probabilities, maxEntropy) {
  const probs = Array.isArray(probabilities) ? probabilities.filter((value) => value > 0) : [];
  if (probs.length < 2) return 0;
  const entropy = -probs.reduce((sum, value) => sum + value * Math.log(value), 0);
  const limit = maxEntropy > 0 ? maxEntropy : Math.log(probs.length);
  return clamp01(entropy / Math.max(1e-6, limit));
}

/** Distacco tra la classe più probabile e la seconda. */
export function topMargin(probabilities) {
  const sorted = (Array.isArray(probabilities) ? probabilities : []).slice().sort((a, b) => b - a);
  if (sorted.length < 2) return sorted[0] || 0;
  return Math.max(0, sorted[0] - sorted[1]);
}

export function ema(previous, value, alpha = 0.25) {
  if (!Number.isFinite(previous)) return clamp01(value);
  return previous * (1 - clamp01(alpha)) + clamp01(value) * clamp01(alpha);
}

/**
 * Fonde blendshape e probabilità ViT del sorriso.
 * @returns {{score:number, confidence:number, band:string, ambiguous:boolean}}
 */
export function fuseSmile({
  blendSmile = 0,
  happy = 0,
  probabilities = [],
  weight = 0.45,
  quality = 1
} = {}) {
  const blend = clamp01(blendSmile);
  const vit = clamp01(happy);
  const margin = topMargin(probabilities);
  const uncertainty = entropyNormalized(probabilities);
  const separation = clamp01(margin * 3);
  const confidence = clamp01((separation * 0.65 + (1 - uncertainty) * 0.35) * (0.55 + 0.45 * clamp01(quality)));
  const score = clamp01((clamp01(weight) * blend + (1 - clamp01(weight)) * vit) * (0.75 + 0.25 * confidence));
  return {
    score,
    confidence,
    band: score >= 0.75 ? 'high' : score >= 0.45 ? 'medium' : 'low',
    ambiguous: confidence < 0.32 || probabilities.length < 3
  };
}

export function overallScore(smile, whiteness, alignment, jawOpen = 0) {
  const teethActive = jawOpen > 0.03;
  if (!teethActive) return Math.round(clamp01(smile) * 100);
  return Math.round(clamp01(smile * 0.5 + whiteness * 0.25 + alignment * 0.25) * 100);
}
