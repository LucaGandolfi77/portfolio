/* Arcade Pass — aggregated ranked campaigns across games (ES module) */

import { tierFor } from '../../_kit/campaign.js';

export const CAMPAIGN_GAMES = [
  { id: 'chess', label: 'Chess', key: 'chess.campaign.v1' },
  { id: 'dama', label: 'Dama', key: 'dama.campaign.v1' },
  { id: 'backgammon', label: 'Backgammon', key: 'backgammon.campaign.v1' },
  { id: 'forza4', label: 'Forza 4', key: 'forza4.campaign.v1' },
  { id: 'battleship', label: 'Battleship', key: 'battleship.campaign.v1' },
  { id: 'scopa', label: 'Scopa', key: 'scopa.campaign.v1' },
  { id: 'farkle', label: 'Farkle', key: 'farkle.campaign.v1' },
  { id: 'orlog', label: 'Orlog', key: 'orlog.campaign.v1' },
  { id: 'quantum_tictactoe', label: 'Quantum TTT', key: 'quantum_tictactoe.campaign.v1' },
  { id: 'blackjack', label: 'Blackjack', key: 'blackjack.campaign.v1' },
  { id: 'poker', label: 'Poker', key: 'poker.campaign.v1' },
  { id: 'UNO', label: 'UNO', key: 'UNO.campaign.v1' }
];

function parse(raw) {
  try { return JSON.parse(raw || 'null'); } catch (e) { return null; }
}

export function readCampaigns(ls, list = CAMPAIGN_GAMES) {
  return list.map(game => {
    const s = parse(ls.getItem(game.key));
    if (!s) return { ...game, rating: 1000, rank: tierFor(1000), games: 0, wins: 0, winRate: 0, active: false };
    const games = s.games || 0;
    return {
      ...game,
      rating: s.rating || 1000,
      rank: tierFor(s.rating || 1000),
      games, wins: s.wins || 0,
      winRate: games ? Math.round((s.wins || 0) / games * 100) : 0,
      streak: s.streak || 0,
      active: true
    };
  }).sort((a, b) => b.rating - a.rating);
}

export function readMetaXP(ls, keys) {
  let total = 0;
  const perGame = [];
  for (const key of keys) {
    const s = parse(ls.getItem(key));
    if (!s) continue;
    const xp = s.xp || 0;
    total += xp;
    perGame.push({ key, xp, level: s.level || 1 });
  }
  return { total, perGame };
}

export function renderCampaigns(el, ls = localStorage) {
  if (!el) return;
  const rows = readCampaigns(ls);
  const overall = rows.reduce((a, r) => a + r.rating, 0) / rows.length;
  el.innerHTML = `
    <div class="pass-summary">
      <div><b>${Math.round(overall)}</b><small>Rating medio</small></div>
      <div><b>${tierFor(overall).name}</b><small>Rank complessivo</small></div>
      <div><b>${rows.filter(r => r.active).length}/${rows.length}</b><small>Campagne attive</small></div>
    </div>
    <div class="pass-list">${rows.map(r => `
      <div class="pass-row${r.active ? '' : ' idle'}">
        <span class="pass-name">${r.label}</span>
        <span class="pass-rank" style="color:${r.rank.color}">${r.rank.name}</span>
        <span class="pass-rating">${r.rating}</span>
        <span class="pass-record">${r.winRate}% · ${r.games} partite</span>
      </div>`).join('')}</div>`;
}
