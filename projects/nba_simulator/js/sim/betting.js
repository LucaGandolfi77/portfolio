/* Virtual betting engine: odds, stakes, props and parlays (pure, no real money) */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function teamStrength(team, record = null) {
  const top = (team.players || []).slice().sort((a, b) => b.ovr - a.ovr).slice(0, 5);
  const base = top.length ? top.reduce((a, p) => a + p.ovr, 0) / top.length : 72;
  const recordBonus = record ? Math.max(-6, Math.min(6, (record.w - record.l) * 0.25)) : 0;
  return base + recordBonus;
}

export function winOdds(home, away, homeRecord = null, awayRecord = null, bonus = 0) {
  const diff = teamStrength(home, homeRecord) - teamStrength(away, awayRecord) + bonus;
  const pHomeRaw = 1 / (1 + Math.exp(-diff / 7));
  const tie = 0.04;
  const pHome = clamp(pHomeRaw * (1 - tie), 0.05, 0.94);
  const pAway = clamp((1 - pHomeRaw) * (1 - tie), 0.05, 0.94);
  const odds = p => Math.round(clamp(0.94 / p, 1.15, 6) * 100) / 100;
  return {
    prob: { home: pHome, away: pAway, tie },
    odds: { home: odds(pHome), away: odds(pAway), tie: odds(tie) }
  };
}

export function payout(stake, odd, won) { return won ? Math.round(stake * odd * 100) / 100 : -stake; }

export function applyBet(career, bet, result, odds, bonus = 0) {
  const won = bet.pick === result;
  const delta = payout(bet.stake, (odds[bet.pick] || 1) + bonus, won);
  career.credits = Math.max(0, Math.round((career.credits || 0) * 100 + delta * 100) / 100);
  career.bets = career.bets || [];
  career.bets.unshift({ t: Date.now(), ...bet, result, delta });
  if (career.bets.length > 40) career.bets.length = 40;
  if (won) {
    career.streak = (career.streak || 0) + 1;
  } else {
    career.streak = 0;
  }
  return { won, delta, credits: career.credits };
}

export function claimDailyCredits(career, today = new Date().toDateString(), amount = 250) {
  if (career.dailyCredits === today) return 0;
  career.dailyCredits = today;
  career.credits = (career.credits || 0) + amount;
  return amount;
}

export function streakBonus(streak = 0) { return Math.min(0.5, Math.max(0, streak) * 0.05); }

/* Prop bets resolved from a finished game summary */
export function propMarket(summary) {
  const total = summary.score.home + summary.score.away;
  const line = Math.round(total / 2);
  const margin = Math.abs(summary.score.home - summary.score.away);
  return {
    totalLine: line,
    over: total > line ? 'over' : 'under',
    margin: margin <= 5 ? 'close' : margin <= 10 ? 'mid' : 'blowout',
    topQuarter: summary.quarters.reduce((best, q, i) => {
      const points = q.home + q.away;
      return points > best.points ? { index: i, points } : best;
    }, { index: 0, points: -1 }).index
  };
}

export function resolveProp(prop, market, pick) {
  if (prop === 'total') return pick === market.over;
  if (prop === 'margin') return pick === market.margin;
  if (prop === 'quarter') return Number(pick) === market.topQuarter;
  return false;
}

export function propOdds(prop, pick) {
  const table = {
    total: { over: 1.9, under: 1.9 },
    margin: { close: 2.1, mid: 2.6, blowout: 3.4 },
    quarter: { 0: 2.2, 1: 2.2, 2: 2.2, 3: 2.2 }
  };
  return (table[prop] || {})[pick] || 1.9;
}

export function parlayOdds(oddsList) {
  return Math.round((oddsList || []).reduce((a, o) => a * (o || 1), 1) * 100) / 100;
}

export function resolveParlay(picks) { return (picks || []).every(p => p.won); }
