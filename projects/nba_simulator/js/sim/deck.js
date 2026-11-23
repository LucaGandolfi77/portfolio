/* Clash-Royale-style active deck bonuses (pure) */

export const DECK_SIZE = 8;

export function normalizeDeck(ids = []) {
  const seen = new Set();
  return ids.filter(id => { if (!id || seen.has(id)) return false; seen.add(id); return true; }).slice(0, DECK_SIZE);
}

export function deckSynergy(cards, deckIds = []) {
  const owned = cards || {};
  const ids = normalizeDeck(deckIds);
  const sets = {};
  const positions = {};
  let power = 0;
  for (const id of ids) {
    const card = owned[id] || {};
    power += (card.ovr || 70) + ((card.level || 1) - 1) * 3;
    sets[card.set || 'base'] = (sets[card.set || 'base'] || 0) + 1;
    positions[card.pos || 'SF'] = (positions[card.pos || 'SF'] || 0) + 1;
  }
  const sameSet = Object.values(sets).some(n => n >= 3);
  const balanced = Object.values(positions).filter(n => n > 0).length >= 4;
  const full = ids.length === DECK_SIZE;
  return {
    size: ids.length,
    power: Math.round(power / Math.max(1, ids.length)),
    xp: (full ? 0.1 : 0) + (sameSet ? 0.05 : 0),
    odds: (balanced ? 0.03 : 0) + (sameSet ? 0.02 : 0),
    drop: sameSet ? 0.04 : 0,
    labels: [full && 'Full deck', sameSet && 'Set synergy', balanced && 'Balanced positions'].filter(Boolean)
  };
}
