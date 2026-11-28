/* ============================================================
   Ultimo Colore — timing windows and rhythm judgement (pure)
   ------------------------------------------------------------
   All times in milliseconds. A window is half-width: a press
   counts if |press − beat| ≤ window.
   ============================================================ */

export const DIFFICULTY = {
  story: { auto: true, parry: 150, dodge: 300, perfect: 90, good: 220, damage: 0.9, ring: true },
  easy: { parry: 155, dodge: 310, perfect: 100, good: 240, damage: 1.25, ring: true },
  normal: { parry: 110, dodge: 230, perfect: 75, good: 185, damage: 1.75, ring: true },
  hard: { parry: 75, dodge: 170, perfect: 55, good: 140, damage: 2.6, ring: false },
};

export const WIDE = 1.4;          // Tecla's safe course
export const WASTED_LOCK = 420;   // a press at nothing locks the hands briefly
export const GOOD_LOCK = 120;

export const rules = (id) => DIFFICULTY[id] || DIFFICULTY.normal;

/** The window for a defence kind against a hit, or 0 if it cannot work. */
export function windowFor(kind, hit, difficulty, wide = false) {
  const r = rules(difficulty);
  const k = wide ? WIDE : 1;
  if (hit.kind === 'low') return kind === 'jump' ? r.dodge * k : 0;
  if (kind === 'parry') return r.parry * k;
  if (kind === 'dodge') return r.dodge * k;
  return 0;
}

/**
 * Judges the player's presses against a move.
 * hits: [{at, kind}] · presses: [{t, kind: 'parry'|'dodge'|'jump'}]
 * Returns one outcome per hit: 'parry' | 'dodge' | 'jump' | 'leap' | 'hit'
 * ('leap' is a jump timed as tightly as a parry).
 */
export function judgeDefence(hits, presses, difficulty, wide = false) {
  const out = hits.map(() => null);
  const r = rules(difficulty);
  let lock = -Infinity;
  for (const p of [...presses].sort((a, b) => a.t - b.t)) {
    if (p.t < lock) continue;
    // the closest open hit this press can answer
    let best = -1, bestD = Infinity;
    hits.forEach((h, i) => {
      if (out[i]) return;
      const d = Math.abs(p.t - h.at);
      const w = windowFor(p.kind, h, difficulty, wide);
      if (w > 0 && d <= w && d < bestD) { best = i; bestD = d; }
    });
    if (best < 0) { lock = p.t + WASTED_LOCK; continue; }
    const h = hits[best];
    if (h.kind === 'low') out[best] = bestD <= r.parry * (wide ? WIDE : 1) ? 'leap' : 'jump';
    else out[best] = p.kind;
    lock = p.t + GOOD_LOCK;
  }
  return out.map((o) => o || 'hit');
}

/** Quality of a timed attack tap: 'perfect' | 'good' | 'miss'. */
export function judgeTap(beat, t, difficulty) {
  if (t === null || t === undefined) return 'miss';
  const r = rules(difficulty);
  const d = Math.abs(t - beat);
  return d <= r.perfect ? 'perfect' : d <= r.good ? 'good' : 'miss';
}

/** When the taps of a skill fall, from the start of its animation. */
export const tapBeats = (n) => Array.from({ length: n }, (_, i) => 900 + i * 620);

/** Time at which a move is over. */
export const moveEnd = (move) => Math.max(...move.hits.map((h) => h.at)) + 500;
