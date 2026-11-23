/* Franchise mode: contracts, trades, draft and free agency (pure) */

import { TEAMS, POSITIONS } from '../data/teams.js';

const clone = t => JSON.parse(JSON.stringify(t));

export function freeAgents(teams, count = 12, rng = Math.random) {
  const signed = new Set(teams.flatMap(t => t.players.map(p => p.id)));
  const out = [];
  for (let i = 0; i < count; i++) {
    const first = ['Alex', 'Jordan', 'Malik', 'Devon', 'Chris', 'Tyler', 'Darius', 'Marcus'][i % 8];
    const last = ['Reed', 'Walker', 'Hayes', 'Brooks', 'Ford', 'Vance', 'Stone', 'Parker'][(i * 3) % 8];
    const ovr = 68 + Math.floor(rng() * 16);
    out.push({
      id: `fa-${i}`, name: `${first} ${last}`, pos: POSITIONS[i % 5], age: 23 + (i % 9),
      ovr, off: ovr + 1, def: ovr - 2, pot: ovr + 8,
      salary: Math.round((2 + (ovr - 68) * 1.4) * 10) / 10,
      injury: null, morale: 70, signed: signed.has(`fa-${i}`)
    });
  }
  return out;
}

export function signPlayer(team, player) {
  const roster = team.players.slice();
  if (roster.length >= 12) return { ok: false, reason: 'roster-full' };
  roster.push({ ...player, id: `${team.code}-${roster.length + 1}` });
  return { ok: true, team: { ...team, players: roster } };
}

export function releasePlayer(team, playerId) {
  if (team.players.length <= 8) return { ok: false, reason: 'roster-min' };
  return { ok: true, team: { ...team, players: team.players.filter(p => p.id !== playerId) } };
}

export function trade(a, b, aOut, bOut) {
  const pa = a.players.find(p => p.id === aOut);
  const pb = b.players.find(p => p.id === bOut);
  if (!pa || !pb) return { ok: false, reason: 'missing-player' };
  return {
    ok: true,
    a: { ...a, players: a.players.map(p => p.id === aOut ? { ...pb, id: aOut } : p) },
    b: { ...b, players: b.players.map(p => p.id === bOut ? { ...pa, id: bOut } : p) }
  };
}

export function draftClass(count = 8, rng = Math.random) {
  const names = ['Cade Wilson', 'Miles Carter', 'Jalen Brooks', 'Trey Davis', 'Amari Johnson',
    'Nico Rivers', 'Owen Price', 'Kai Bennett', 'Luka Moreno', 'Zion Wallace'];
  return Array.from({ length: count }, (_, i) => {
    const ovr = 66 + Math.floor(rng() * 15);
    return {
      id: `draft-${i}`, name: names[i % names.length], pos: POSITIONS[i % 5], age: 19 + (i % 3),
      ovr, off: ovr + 2, def: ovr - 1, pot: Math.min(99, ovr + 18), salary: 2.4,
      injury: null, morale: 80
    };
  }).sort((a, b) => b.pot - a.pot);
}

export function progressRoster(team, year = 1, rng = Math.random) {
  return {
    ...team,
    players: team.players.map(p => {
      const growth = p.age < 26 ? Math.floor(rng() * 5) : p.age < 30 ? Math.floor(rng() * 2) : -Math.floor(rng() * 3);
      const ovr = Math.max(55, Math.min(99, p.ovr + growth));
      return { ...p, age: p.age + 1, ovr, off: Math.max(55, Math.min(99, p.off + growth)), def: Math.max(55, Math.min(99, p.def + growth)), pot: Math.min(99, p.pot) };
    })
  };
}

export function cloneTeams(teams = TEAMS) { return teams.map(clone); }
