/* Basketball squad builder: 5 starters + 7 bench (pure) */

export const STARTERS = 5;
export const BENCH = 7;
export const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

export const TEMPLATES = {
  balanced: { label: 'Balanced', positions: POSITIONS.slice() },
  small: { label: 'Small Ball', positions: ['PG', 'SG', 'SF', 'SF', 'PF'] },
  big: { label: 'Big Man', positions: ['PG', 'SG', 'SF', 'PF', 'C'] }
};

export function normalizeSquad(squad = {}) {
  const starters = (squad.starters || []).filter(Boolean).slice(0, STARTERS);
  const bench = (squad.bench || []).filter(id => !starters.includes(id)).slice(0, BENCH);
  return { template: squad.template || 'balanced', starters, bench };
}

export function squadRating(cards = {}, squad = {}) {
  const s = normalizeSquad(squad);
  const positions = (TEMPLATES[s.template] || TEMPLATES.balanced).positions;
  let total = 0;
  s.starters.forEach((id, i) => {
    const card = cards[id] || {};
    const fit = card.pos === positions[i] ? 3 : 0;
    total += (card.ovr || 70) + ((card.level || 1) - 1) * 3 + fit;
  });
  return Math.round(total / Math.max(1, s.starters.length));
}

export function chemistry(cards = {}, squad = {}) {
  const s = normalizeSquad(squad);
  const list = s.starters.concat(s.bench).map(id => cards[id]).filter(Boolean);
  if (!list.length) return 0;
  const teams = {}, sets = {}, pos = {};
  list.forEach(c => {
    teams[c.team] = (teams[c.team] || 0) + 1;
    sets[c.set] = (sets[c.set] || 0) + 1;
    pos[c.pos] = (pos[c.pos] || 0) + 1;
  });
  const teamBonus = Math.min(12, Object.values(teams).reduce((a, n) => a + Math.max(0, n - 1) * 2, 0));
  const setBonus = Math.min(10, Object.values(sets).reduce((a, n) => a + Math.max(0, n - 1), 0) * 2);
  const posBonus = Object.keys(pos).length >= 5 ? 8 : 0;
  return Math.min(30, teamBonus + setBonus + posBonus);
}

export function squadReady(cards = {}, squad = {}) {
  const s = normalizeSquad(squad);
  return s.starters.length === STARTERS && s.starters.every(id => !!cards[id]);
}
