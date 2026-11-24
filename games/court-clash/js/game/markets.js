/* Court Clash — markets: winner, margin, total; live cash-out */

import { winOdds, teamStrength } from './economy.js';
import { winProbability } from '../sim/engine.js';

export const MARKET_TYPES = ['winner', 'margin', 'total'];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round2 = value => Math.round(value * 100) / 100;

function normalCdf(z) {
  // Abramowitz-Stegun approximation, enough for market odds.
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

function oddsFromProbability(probability) {
  return round2(clamp(0.94 / clamp(probability, 0.01, 0.99), 1.2, 6));
}

export function buildMarkets(home, away) {
  const winner = winOdds(home, away);
  const diff = teamStrength(home) - teamStrength(away);
  const sigma = 13;
  const pHome10 = clamp(1 - normalCdf((10 - diff * 0.9) / sigma), 0.03, 0.7);
  const pAway10 = clamp(normalCdf((-10 - diff * 0.9) / sigma), 0.03, 0.7);
  const pClose = clamp(1 - pHome10 - pAway10, 0.2, 0.85);
  const avg = (teamStrength(home) + teamStrength(away)) / 2;
  const line = Math.round(205 + (avg - 75) * 1.2);

  return {
    winner: {
      type: 'winner',
      options: [
        { key: 'home', side: 'home', odds: winner.home.odds, probability: winner.home.prob },
        { key: 'away', side: 'away', odds: winner.away.odds, probability: winner.away.prob }
      ]
    },
    margin: {
      type: 'margin',
      options: [
        { key: 'home10', side: 'home', odds: oddsFromProbability(pHome10), probability: pHome10 },
        { key: 'away10', side: 'away', odds: oddsFromProbability(pAway10), probability: pAway10 },
        { key: 'close', side: null, odds: oddsFromProbability(pClose), probability: pClose }
      ]
    },
    total: {
      type: 'total',
      line,
      options: [
        { key: 'over', side: null, odds: 1.9, probability: 0.5 },
        { key: 'under', side: null, odds: 1.9, probability: 0.5 }
      ]
    }
  };
}

export function findOption(markets, type, pick) {
  const market = markets && markets[type];
  if (!market) return null;
  return market.options.find(option => option.key === pick) || null;
}

export function pickSide(type, pick) {
  if (type === 'winner') return pick === 'home' || pick === 'away' ? pick : null;
  if (type === 'margin') return pick === 'home10' ? 'home' : pick === 'away10' ? 'away' : null;
  return null;
}

export function resolveMarket(type, pick, summary, line = 0) {
  if (!summary) return false;
  if (type === 'winner') return summary.winner === pick;
  if (type === 'margin') {
    const margin = Math.abs(summary.score.home - summary.score.away);
    if (pick === 'close') return margin < 10;
    if (pick === 'home10') return summary.winner === 'home' && margin >= 10;
    if (pick === 'away10') return summary.winner === 'away' && margin >= 10;
    return false;
  }
  if (type === 'total') {
    const total = summary.score.home + summary.score.away;
    return pick === 'over' ? total > line : total <= line;
  }
  return false;
}

export function cashOutOffer({ stake, odds, summary, side, stage }) {
  if (!summary || !side) return 0;
  const quarters = summary.quarters || [];
  const count = stage === 'Q3' ? 3 : 2;
  const sliced = quarters.slice(0, count);
  if (!sliced.length) return 0;
  const home = sliced.reduce((sum, q) => sum + (q.home || 0), 0);
  const away = sliced.reduce((sum, q) => sum + (q.away || 0), 0);
  const diff = side === 'home' ? home - away : away - home;
  const secondsLeft = stage === 'Q3' ? 720 : 1440;
  const probability = winProbability(diff, secondsLeft);
  const full = stake * odds;
  const offer = Math.round(full * clamp(probability, 0.02, 0.98) * 0.85);
  return clamp(offer, 1, Math.round(full));
}
