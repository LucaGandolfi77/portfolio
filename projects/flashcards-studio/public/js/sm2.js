/** SM-2 (SuperMemo-2) — algoritmo locale, zero server */
const SM2 = {
  initEFactor(card) { if (!card.ef) card.ef = 2.5; return card.ef; },
  calcInterval(card, q) { const ef = this.initEFactor(card); if (q >= 3) { card.interval = Math.round(card.interval || 1) * ef; card.ef = Math.max(1.3, ef - 0.15 + (5 - q) * (0.1 - (5 - q) * 0.02)); } else { card.interval = 1; card.ef = Math.max(1.3, ef - 0.2); } card.next = Date.now() + card.interval * 86400000; },
  qualityToScore(q) { return q; }
};
