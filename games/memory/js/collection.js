/** collection.js — carte rare e progressione (puro). */

export function emptyCollection() {
  return { cards: [], xp: 0, level: 1, rare: 0, seen: {} };
}

export function normalizeCollection(value = {}) {
  const base = emptyCollection();
  const cards = Array.isArray(value.cards) ? value.cards : [];
  return {
    cards: cards.slice(0, 200),
    xp: Number(value.xp) || 0,
    level: Number(value.level) || 1,
    rare: Number(value.rare) || 0,
    seen: value.seen && typeof value.seen === 'object' ? value.seen : {}
  };
}

export function levelFor(xp) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 120)) + 1);
}

export function collectCards(collection, cards = [], { stars = 0, theme = 'candy' } = {}) {
  const next = normalizeCollection(collection);
  const entries = Array.isArray(cards) ? cards : [];
  for (const card of entries) {
    const id = `${theme}:${card.value || card}`;
    if (next.seen[id]) continue;
    const rare = Math.random() < 0.12 || stars >= 3;
    next.seen[id] = true;
    next.cards.push({ id, value: card.value || card, theme, rare, ts: Date.now() });
    if (rare) next.rare += 1;
  }
  next.xp += 20 + stars * 10;
  next.level = levelFor(next.xp);
  if (next.cards.length > 200) next.cards = next.cards.slice(-200);
  return next;
}

export function collectionSummary(collection) {
  const state = normalizeCollection(collection);
  return { count: state.cards.length, rare: state.rare, xp: state.xp, level: state.level, nextLevelXp: (state.level ** 2) * 120 };
}
