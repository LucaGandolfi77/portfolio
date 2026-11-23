/* Universal wildcards and card challenges (pure) */

import { rarityFor } from './career-mode.js';

export const WILDCARDS = ['common', 'rare', 'epic', 'legendary'];

export function grantWildcard(career, type, amount = 1) {
  career.wildcards = career.wildcards || {};
  career.wildcards[type] = (career.wildcards[type] || 0) + amount;
  return career.wildcards[type];
}

export function useWildcard(career, player) {
  const rarity = rarityFor(player.ovr);
  if (!(career.wildcards || {})[rarity]) return { ok: false, reason: 'missing' };
  career.wildcards[rarity] -= 1;
  career.copies = career.copies || {};
  career.copies[player.id] = (career.copies[player.id] || 0) + 1;
  return { ok: true, rarity, copies: career.copies[player.id] };
}

export const CHALLENGES = [
  { id: 'deck3', label: 'Win 3 club games', reward: { type: 'rare', amount: 1 } },
  { id: 'cup1', label: 'Reach the cup semifinal', reward: { type: 'epic', amount: 1 } },
  { id: 'star1', label: 'Reach card level 3', reward: { type: 'rare', amount: 2 } },
  { id: 'legend1', label: 'Own a legendary card', reward: { type: 'legendary', amount: 1 } }
];

export function checkChallenges(career, state = {}) {
  const done = career.challengesDone || (career.challengesDone = []);
  const earned = [];
  const conditions = {
    deck3: (state.clubWins || 0) >= 3,
    cup1: (state.cupRound || 0) >= 2,
    star1: Object.values(career.cards || {}).some(level => level >= 3),
    legend1: (career.collection || []).some(id => (state.legendaryIds || []).includes(id))
  };
  for (const c of CHALLENGES) {
    if (done.includes(c.id) || !conditions[c.id]) continue;
    done.push(c.id);
    grantWildcard(career, c.reward.type, c.reward.amount);
    earned.push(c);
  }
  return earned;
}
