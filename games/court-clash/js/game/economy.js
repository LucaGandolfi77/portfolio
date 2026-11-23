/* Court Clash — pure economy rules: odds, payouts, boost and chest tier */

export const STAKE_OPTIONS = [50, 100, 250];
export const STARTING_COINS = 1000;
export const DAILY_COINS = 500;
export const COMEBACK_THRESHOLD = 50;
export const COMEBACK_COINS = 100;
export const BOOST_STEP = 1500;
export const MAX_BOOST = 5;

const CHEST_ORDER = ['wood', 'silver', 'gold', 'legendary'];
const BASE_BY_STAKE = { 50: 'wood', 100: 'silver', 250: 'gold' };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round2 = v => Math.round(v * 100) / 100;

export function teamStrength(team) {
  if (!team || !Array.isArray(team.players) || !team.players.length) return 72;
  const top = team.players.slice().sort((a, b) => b.ovr - a.ovr).slice(0, 5);
  return top.reduce((sum, p) => sum + (p.ovr || 0), 0) / top.length;
}

export function winOdds(home, away) {
  const diff = teamStrength(home) - teamStrength(away);
  const pHomeRaw = 1 / (1 + Math.exp(-diff / 7));
  const pHome = clamp(pHomeRaw, 0.05, 0.95);
  const pAway = clamp(1 - pHomeRaw, 0.05, 0.95);
  const odds = p => round2(clamp(0.94 / p, 1.15, 6));
  return {
    home: { prob: round2(pHome * 100) / 100, odds: odds(pHome) },
    away: { prob: round2(pAway * 100) / 100, odds: odds(pAway) }
  };
}

export function payout(stake, odds) {
  return Math.round(stake * odds);
}

export function netResult(stake, odds, won) {
  return won ? Math.round(stake * odds) - stake : -stake;
}

export function chestTierForWin(stake, odds, streak) {
  let index = CHEST_ORDER.indexOf(BASE_BY_STAKE[stake] || 'wood');
  if (odds >= 1.8) index += 1;
  if (streak >= 3) index += 1;
  return CHEST_ORDER[clamp(index, 0, CHEST_ORDER.length - 1)];
}

export function collectionBoost(power) {
  return clamp(Math.floor(Math.max(0, power) / BOOST_STEP), 0, MAX_BOOST);
}

/* The supported team gets a small rating boost; it is applied to the simulation,
   while the displayed odds stay based on the base team strength. */
export function boostTeam(team, boost) {
  if (!team || !boost) return team;
  const copy = {
    ...team,
    players: team.players.map(p => ({ ...p }))
  };
  const chosen = copy.players
    .slice()
    .sort((a, b) => b.ovr - a.ovr)
    .slice(0, 8);
  chosen.forEach(p => {
    p.ovr = Math.min(99, (p.ovr || 0) + boost);
    p.off = Math.min(99, (p.off || 0) + boost);
    p.def = Math.min(99, (p.def || 0) + boost);
  });
  return copy;
}

export function claimDaily(wallet, today, amount = DAILY_COINS) {
  if (!wallet || wallet.dailyClaimed === today) return 0;
  wallet.dailyClaimed = today;
  wallet.coins = (wallet.coins || 0) + amount;
  return amount;
}

export function claimComeback(wallet, today, threshold = COMEBACK_THRESHOLD, amount = COMEBACK_COINS) {
  if (!wallet) return 0;
  if ((wallet.coins || 0) >= threshold) return 0;
  if (wallet.comebackClaimed === today) return 0;
  wallet.comebackClaimed = today;
  wallet.coins = (wallet.coins || 0) + amount;
  return amount;
}

export function formatCoins(value) {
  const n = Math.max(0, Math.round(Number(value) || 0));
  return n.toLocaleString('en-US');
}

export function oddsLabel(odds) {
  return Number(odds || 0).toFixed(2);
}
