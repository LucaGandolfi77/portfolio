// leagues.js — League system with simulated opponents
window.Leagues = (() => {
  const LEAGUES = [
    { id: 'bronze',   name: 'Bronze',   emoji: '🥉', minScore: 0,      reward: 100,   color: '#CD7F32' },
    { id: 'silver',   name: 'Silver',   emoji: '🥈', minScore: 5000,   reward: 500,   color: '#C0C0C0' },
    { id: 'gold',     name: 'Gold',     emoji: '🥇', minScore: 25000,  reward: 2000,  color: '#FFD700' },
    { id: 'platinum', name: 'Platinum', emoji: '💎', minScore: 100000, reward: 8000,  color: '#E5E4E2' },
    { id: 'diamond',  name: 'Diamond',  emoji: '💠', minScore: 500000, reward: 30000, color: '#B9F2FF' },
    { id: 'master',   name: 'Master',   emoji: '👑', minScore: 2000000, reward: 100000, color: '#9C27B0' },
    { id: 'legend',   name: 'Legend',   emoji: '🏆', minScore: 10000000, reward: 500000, color: '#FF9500' }
  ];

  const BOT_NAMES = [
    'MarcoInvest', 'Finanza4U', 'SoldiSmart', 'BorsaKing', 'RisparmioPro',
    'TraderJoe', 'MonetaMan', 'BudgetPro', 'InvestitoreX', 'CashFlow',
    'PennyWise', 'GoldDigger', 'BondMaster', 'StockGuru', 'CryptoMax',
    'RichDad', 'MoneyMogul', 'ProfitHunter', 'WealthBuilder', 'EliteFinanza'
  ];

  function getLeagueForScore(score) {
    for (let i = LEAGUES.length - 1; i >= 0; i--) {
      if (score >= LEAGUES[i].minScore) return LEAGUES[i];
    }
    return LEAGUES[0];
  }

  function getNextLeague(currentId) {
    const idx = LEAGUES.findIndex(l => l.id === currentId);
    return idx < LEAGUES.length - 1 ? LEAGUES[idx + 1] : null;
  }

  function getPlayerScore(save) {
    const money = save.money || 0;
    const earned = save.empire ? (save.empire.totalEarned || 0) : 0;
    const chapters = (save.completedChapters || []).length;
    const prestige = save.empire ? (save.empire.prestigeCount || 0) : 0;
    return Math.round(money + earned + chapters * 500 + prestige * 10000);
  }

  function generateLeaderboard(playerScore, leagueId) {
    const league = LEAGUES.find(l => l.id === leagueId) || LEAGUES[0];
    const nextLeague = getNextLeague(leagueId);

    // Generate 9 bot scores around player score
    const bots = [];
    const usedNames = new Set();

    for (let i = 0; i < 9; i++) {
      let botScore;
      const variation = Math.random() * 0.6 - 0.3; // -30% to +30%
      botScore = Math.round(playerScore * (1 + variation));
      botScore = Math.max(0, botScore);

      // Ensure unique names
      let name;
      do {
        name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      } while (usedNames.has(name));
      usedNames.add(name);

      bots.push({ name, score: botScore, isBot: true });
    }

    // Add player
    const all = [...bots, { name: 'Tu', score: playerScore, isBot: false }];
    all.sort((a, b) => b.score - a.score);

    const playerRank = all.findIndex(e => !e.isBot) + 1;
    const top3 = all.slice(0, 3);

    return { entries: all, playerRank, top3, totalPlayers: 10 };
  }

  function getLeagueProgress(playerScore, leagueId) {
    const league = LEAGUES.find(l => l.id === leagueId) || LEAGUES[0];
    const next = getNextLeague(leagueId);
    if (!next) return { pct: 100, needed: 0, nextName: null };

    const range = next.minScore - league.minScore;
    const progress = playerScore - league.minScore;
    const pct = Math.min(100, Math.round((progress / range) * 100));
    const needed = Math.max(0, next.minScore - playerScore);

    return { pct, needed, nextName: next.name, nextEmoji: next.emoji };
  }

  function checkPromotion(save) {
    const score = getPlayerScore(save);
    const league = getLeagueForScore(score);
    const savedLeague = save.league || 'bronze';

    if (league.id !== savedLeague) {
      const oldIdx = LEAGUES.findIndex(l => l.id === savedLeague);
      const newIdx = LEAGUES.findIndex(l => l.id === league.id);
      return {
        promoted: newIdx > oldIdx,
        from: LEAGUES[oldIdx],
        to: league,
        reward: newIdx > oldIdx ? league.reward : 0
      };
    }
    return null;
  }

  function renderLeaguesPanel(save) {
    const score = getPlayerScore(save);
    const league = getLeagueForScore(score);
    const progress = getLeagueProgress(score, league.id);
    const leaderboard = generateLeaderboard(score, league.id);

    let entriesHtml = leaderboard.entries.map((e, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
      const style = e.isBot ? '' : 'font-weight:800;color:var(--gold)';
      const bg = i < 3 ? 'background:var(--card2);' : '';
      return `
        <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;${bg}">
          <span style="width:24px;text-align:center;font-size:12px">${medal}</span>
          <span style="flex:1;font-size:12px;${style}">${e.name}${e.isBot ? '' : ' 👈'}</span>
          <span style="font-size:11px;color:var(--dim)">€${formatScore(e.score)}</span>
        </div>`;
    }).join('');

    const progressHtml = progress.nextName ? `
      <div style="margin:12px 0">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--dim);margin-bottom:4px">
          <span>${league.emoji} ${league.name}</span>
          <span>${progress.nextEmoji} ${progress.nextName}</span>
        </div>
        <div style="height:8px;background:var(--line);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${progress.pct}%;background:${league.color};border-radius:4px;transition:width 0.3s"></div>
        </div>
        <div style="font-size:10px;color:var(--dim);margin-top:4px;text-align:center">
          ${progress.needed > 0 ? `€${formatScore(progress.needed)} al prossimo livello` : '🏆 Livello massimo!'}
        </div>
      </div>` : '<div style="text-align:center;font-size:12px;color:var(--gold);margin:8px 0">🏆 Sei al livello massimo!</div>';

    return `
      <div style="padding:12px">
        <div style="text-align:center;margin-bottom:12px">
          <div style="font-size:48px">${league.emoji}</div>
          <div style="font-size:18px;font-weight:800;color:${league.color}">${league.name} League</div>
          <div style="font-size:11px;color:var(--dim)">Punteggio: €${formatScore(score)}</div>
          <div style="font-size:10px;color:var(--green);margin-top:2px">Ricompensa: €${formatScore(league.reward)}/settimana</div>
        </div>
        ${progressHtml}
        <div style="font-size:12px;font-weight:700;margin:12px 0 6px">Classifica settimanale</div>
        <div style="max-height:300px;overflow-y:auto">
          ${entriesHtml}
        </div>
        <div style="font-size:10px;color:var(--dim);text-align:center;margin-top:8px">
          Posizione: #${leaderboard.playerRank}/${leaderboard.totalPlayers}
          ${leaderboard.playerRank <= 3 ? ' — 🏆 Promozione!' : ''}
        </div>
      </div>`;
  }

  function formatScore(n) {
    if (n < 1000) return Math.round(n).toString();
    if (n < 1e6) return (n / 1e3).toFixed(1) + 'K';
    if (n < 1e9) return (n / 1e6).toFixed(2) + 'M';
    if (n < 1e12) return (n / 1e9).toFixed(2) + 'B';
    return n.toExponential(1);
  }

  return {
    getLeagueForScore,
    getPlayerScore,
    generateLeaderboard,
    getLeagueProgress,
    checkPromotion,
    renderLeaguesPanel,
    LEAGUES
  };
})();
