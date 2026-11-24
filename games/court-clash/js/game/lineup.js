/* Court Clash — 5-card support lineup, chemistry and match boost */

import { cardPower } from './collection.js';

export const LINEUP_SIZE = 5;
export const CHEM_POINTS = 25;
export const BOOST_STEP = 120;
export const MAX_BOOST = 5;

function pairCount(values) {
  const counts = {};
  values.forEach(value => { counts[value] = (counts[value] || 0) + 1; });
  return Object.values(counts).reduce((sum, n) => sum + (n * (n - 1)) / 2, 0);
}

export function unlockedSlots(trophies = 0) {
  if (trophies >= 900) return 5;
  if (trophies >= 400) return 4;
  return 3;
}

export function sanitizeLineup(lineup, collection, cardsById, unlocked = LINEUP_SIZE) {
  const source = Array.isArray(lineup) ? lineup : [];
  const seen = new Set();
  return Array.from({ length: LINEUP_SIZE }, (_, index) => {
    if (index >= unlocked) return null;
    const id = source[index];
    if (!id || seen.has(id) || !collection[id] || !cardsById[id]) return null;
    seen.add(id);
    return id;
  });
}

export function chemistry(slots, cardsById) {
  const cards = (slots || []).filter(Boolean).map(id => cardsById[id]).filter(Boolean);
  const positions = new Set(cards.map(card => card.pos));
  const role = Math.max(0, positions.size - 1);
  const teamPairs = pairCount(cards.map(card => card.teamCode));
  const setPairs = pairCount(cards.map(card => card.set));
  const team = Math.min(3, teamPairs);
  const set = Math.min(2, setPairs);
  const score = role + team + set;
  return {
    score,
    role,
    team,
    set,
    labels: [
      { key: 'chemRole', value: role },
      { key: 'chemTeam', value: team },
      { key: 'chemSet', value: set }
    ]
  };
}

export function lineupPower(slots, cardsById, collection, chemScore = 0) {
  const base = (slots || []).filter(Boolean).reduce((sum, id) => {
    const card = cardsById[id];
    const entry = collection[id];
    if (!card || !entry) return sum;
    return sum + cardPower(card, entry.level);
  }, 0);
  const chemistryBonus = Math.max(0, chemScore) * CHEM_POINTS;
  return {
    base,
    chemistry: chemistryBonus,
    power: base + chemistryBonus
  };
}

export function lineupBoost(power) {
  return Math.min(MAX_BOOST, Math.floor(Math.max(0, power) / BOOST_STEP));
}

export function lineupSummary(slots, cardsById, collection) {
  const chem = chemistry(slots, cardsById);
  const power = lineupPower(slots, cardsById, collection, chem.score);
  return {
    slots,
    chemistry: chem,
    power: power.power,
    base: power.base,
    chemistryPower: power.chemistry,
    boost: lineupBoost(power.power)
  };
}

export function autoFill(collection, cardsById, unlocked = unlockedSlots(0)) {
  const owned = Object.keys(collection)
    .map(id => cardsById[id])
    .filter(Boolean);
  const slots = [];
  for (let index = 0; index < unlocked; index += 1) {
    let best = null;
    for (const card of owned) {
      if (slots.includes(card.id)) continue;
      const candidate = [...slots, card.id];
      const chem = chemistry(candidate, cardsById);
      const power = lineupPower(candidate, cardsById, collection, chem.score);
      if (!best || power.power > best.power) best = { id: card.id, power: power.power };
    }
    slots.push(best ? best.id : null);
  }
  return Array.from({ length: LINEUP_SIZE }, (_, index) => slots[index] || null);
}

export function slotUnlockTrophies(index) {
  if (index <= 2) return 0;
  if (index === 3) return 400;
  return 900;
}
