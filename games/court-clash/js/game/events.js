/* Court Clash — daily underdog challenge and 3-win tournament streak */

export const DAILY_UNDERDOG_ODDS = 2.0;
export const DAILY_REWARD = { coins: 100, chestUpgrade: 1 };
export const TOURNAMENT_ENTRY = 250;
export const TOURNAMENT_WINS = 3;
export const TOURNAMENT_REWARD = { coins: 500, chest: 'gold' };

export function ensureDailyChallenge(data, today) {
  data.dailyChallenge = data.dailyChallenge || { date: '', done: false };
  if (data.dailyChallenge.date !== today) {
    data.dailyChallenge = { date: today, done: false };
  }
  return data.dailyChallenge;
}

export function canCompleteDaily(data, odds, won) {
  return !!won && odds >= DAILY_UNDERDOG_ODDS && !data.dailyChallenge?.done;
}

export function completeDailyChallenge(data, today) {
  ensureDailyChallenge(data, today);
  if (data.dailyChallenge.done) return null;
  data.dailyChallenge.done = true;
  data.wallet.coins = (data.wallet.coins || 0) + DAILY_REWARD.coins;
  return DAILY_REWARD;
}

export function startTournament(data) {
  data.tournament = data.tournament || { active: false, step: 0 };
  if (data.tournament.active) return { ok: false, reason: 'active' };
  if ((data.wallet.coins || 0) < TOURNAMENT_ENTRY) return { ok: false, reason: 'coins' };
  data.wallet.coins -= TOURNAMENT_ENTRY;
  data.tournament = { active: true, step: 0 };
  return { ok: true, step: 0 };
}

export function tournamentWin(data) {
  if (!data.tournament || !data.tournament.active) return null;
  data.tournament.step = (data.tournament.step || 0) + 1;
  if (data.tournament.step >= TOURNAMENT_WINS) {
    data.tournament.active = false;
    data.wallet.coins = (data.wallet.coins || 0) + TOURNAMENT_REWARD.coins;
    data.stats.tournamentsWon = (data.stats.tournamentsWon || 0) + 1;
    return { complete: true, reward: TOURNAMENT_REWARD };
  }
  return { advance: true, step: data.tournament.step };
}

export function tournamentLoss(data) {
  if (!data.tournament || !data.tournament.active) return null;
  data.tournament.active = false;
  return { failed: true };
}

export function tournamentStatus(data) {
  const t = data.tournament || { active: false, step: 0 };
  return {
    active: !!t.active,
    step: t.step || 0,
    winsNeeded: TOURNAMENT_WINS,
    entry: TOURNAMENT_ENTRY,
    reward: TOURNAMENT_REWARD
  };
}
