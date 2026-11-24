/* Cockpit Arena — pure combat, odds and betting engine */
import { HOUSE_EDGE, MAX_ROUNDS, STATS, EQUIPMENT, BREEDS, CHAMPIONSHIP, PERSONALITIES } from './config.js';
import { pickWeighted, seeded } from './rng.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function power(rooster) {
  const stats = rooster.stats || {};
  let total = STATS.reduce((sum, key) => sum + (stats[key] || 0), 0);
  for (const item of (rooster.equipment || [])) {
    const bonus = EQUIPMENT[item]?.bonus || {};
    total += Object.values(bonus).reduce((a, b) => a + b, 0);
  }
  return Math.round(total + ((rooster.level || 1) - 1) * 2 + ((rooster.form || 1) - 1) * 4);
}

export function odds(a, b) {
  const pa = clamp(1 / (1 + Math.pow(10, (power(b) - power(a)) / 24)), 0.08, 0.92);
  const pb = 1 - pa;
  return { pA: pa, pB: pb, oddsA: +(1 / pa * (1 - HOUSE_EDGE)).toFixed(2),
    oddsB: +(1 / pb * (1 - HOUSE_EDGE)).toFixed(2) };
}

export function makeOpponent(roundIndex, rng = Math.random) {
  const cfg = CHAMPIONSHIP[clamp(roundIndex, 0, CHAMPIONSHIP.length - 1)];
  const breed = BREEDS[Math.floor(rng() * BREEDS.length)];
  const scale = cfg.difficulty;
  const stats = {};
  STATS.forEach(k => { stats[k] = Math.max(2, Math.round(breed.stats[k] * scale)); });
  const personality = PERSONALITIES[Math.floor(rng() * PERSONALITIES.length)];
  return {
    name: cfg.en, breed: breed.id, color: breed.color, stats,
    level: 1 + roundIndex, form: 1, personality: personality.id,
    weights: personality.weights, reward: cfg.reward
  };
}

const QUALITY_MULT = { perfect: 1.55, good: 1, miss: 0.2 };

export function simulateFight(a, b, opts = {}) {
  const rng = typeof opts.rng === 'function' ? opts.rng : Math.random;
  let hpA = 100, hpB = 100, enA = 100, enB = 100;
  let perfects = 0, goods = 0, misses = 0;
  const log = [];
  const weightsB = b.weights || PERSONALITIES[0].weights;

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const actA = opts.action || (opts.actionA || 'attack');
    const actB = ACTION_IDS[pickWeighted(weightsB, rng)];
    const qualityA = opts.quality || (rng() < 0.22 ? 'perfect' : rng() < 0.82 ? 'good' : 'miss');
    if (qualityA === 'perfect') perfects++;
    else if (qualityA === 'good') goods++; else misses++;

    const baseA = 7 + power(a) * 0.18 + (a.stats?.attack || 0) * 0.55;
    const baseB = 7 + power(b) * 0.18 + (b.stats?.attack || 0) * 0.55;
    const dmgA = attackDamage(baseA, actA, actB, qualityA, enA, rng);
    enA = updateEnergy(enA, actA);
    if (actA === 'special') enA = Math.max(0, enA - 35);

    const qB = rng() < 0.18 ? 'perfect' : rng() < 0.8 ? 'good' : 'miss';
    const dmgB = attackDamage(baseB, actB, actA, qB, enB, rng);
    enB = updateEnergy(enB, actB);
    if (actB === 'special') enB = Math.max(0, enB - 35);

    hpB = Math.max(0, hpB - dmgA);
    hpA = Math.max(0, hpA - dmgB);
    log.push({ round, a: actA, b: actB, qA: qualityA, qB, dmgA, dmgB, hpA, hpB });
    if (hpA <= 0 || hpB <= 0) break;
  }

  const winner = hpA > hpB ? 'a' : hpB > hpA ? 'b' : (perfects >= goods ? 'a' : 'b');
  return { winner, rounds: log.length, hpA, hpB, perfects, goods, misses, log,
    qualityA: perfects >= goods ? (perfects > 0 ? 'perfect' : 'good') : 'good' };
}

export const ACTION_IDS = ['attack', 'defend', 'wait', 'special'];

function updateEnergy(en, action) {
  if (action === 'wait') return clamp(en + 24, 0, 100);
  if (action === 'defend') return clamp(en + 10, 0, 100);
  return clamp(en + 4, 0, 100);
}
function attackDamage(base, action, enemyAction, quality, energy, rng) {
  if (action === 'wait') return 0;
  if (action === 'special' && energy < 35) return Math.round(base * 0.6 * QUALITY_MULT[quality]);
  let mult = QUALITY_MULT[quality] || 1;
  if (action === 'special') mult *= 1.9;
  if (action === 'defend') mult *= 0.18;
  if (enemyAction === 'defend') mult *= 0.45;
  if (enemyAction === 'wait') mult *= 1.25;
  const variance = 0.85 + rng() * 0.3;
  return Math.max(0, Math.round(base * mult * variance));
}

export function stepFight(state, a, b, actA, quality, rng = Math.random) {
  const actB = ACTION_IDS[pickWeighted(b.weights || PERSONALITIES[0].weights, rng)];
  const qB = rng() < 0.18 ? 'perfect' : rng() < 0.8 ? 'good' : 'miss';
  const baseA = 7 + power(a) * 0.18 + (a.stats?.attack || 0) * 0.55;
  const baseB = 7 + power(b) * 0.18 + (b.stats?.attack || 0) * 0.55;
  const dmgA = attackDamage(baseA, actA, actB, quality, state.enA, rng);
  state.enA = updateEnergy(state.enA, actA);
  if (actA === 'special') state.enA = Math.max(0, state.enA - 35);
  const dmgB = attackDamage(baseB, actB, actA, qB, state.enB, rng);
  state.enB = updateEnergy(state.enB, actB);
  if (actB === 'special') state.enB = Math.max(0, state.enB - 35);
  state.hpB = Math.max(0, state.hpB - dmgA);
  state.hpA = Math.max(0, state.hpA - dmgB);
  state.round++;
  const entry = { round: state.round, a: actA, b: actB, qA: quality, qB, dmgA, dmgB, hpA: state.hpA, hpB: state.hpB };
  state.log.push(entry);
  if (quality === 'perfect') state.perfects++;
  return { ...entry, done: state.hpA <= 0 || state.hpB <= 0 || state.round >= MAX_ROUNDS,
    winner: state.hpA > state.hpB ? 'a' : state.hpB > state.hpA ? 'b' : (state.perfects > 0 ? 'a' : 'b') };
}

export function newFightState() {
  return { hpA: 100, hpB: 100, enA: 100, enB: 100, round: 0, log: [], perfects: 0 };
}

export function settleBet(bet, result, quote) {
  const oddsTable = {
    win: result.winner === 'a' ? quote.oddsA : 0,
    lose: result.winner === 'b' ? quote.oddsB : 0,
    rounds: result.rounds === bet.value ? 3.5 : 0,
    perfect: result.perfects >= (bet.value || 2) ? 2.2 : 0
  };
  const oddsValue = oddsTable[bet.type] || 0;
  const won = oddsValue > 0;
  return { won, odds: oddsValue, payout: won ? Math.round(bet.stake * oddsValue) : 0,
    net: won ? Math.round(bet.stake * oddsValue - bet.stake) : -bet.stake };
}

export function train(rooster, stat, rng = Math.random) {
  if (!STATS.includes(stat)) return rooster;
  const value = rooster.stats[stat] || 0;
  if (value >= 20) return rooster;
  const gain = rng() < 0.35 ? 2 : 1;
  return { ...rooster, stats: { ...rooster.stats, [stat]: Math.min(20, value + gain) } };
}

export function levelInfo(xp) { return Math.floor(xp / 100) + 1; }
export function xpNeeded(level) { return level * 100; }

export function standings(history) {
  const out = { wins: 0, losses: 0, net: 0, fights: history.length };
  history.forEach(h => {
    if (h.won) out.wins++; else out.losses++;
    out.net += h.net || 0;
  });
  return out;
}

export function deterministicFight(a, b, seed, opts = {}) {
  return simulateFight(a, b, { ...opts, rng: seeded(seed) });
}
