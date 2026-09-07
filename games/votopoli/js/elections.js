// elections.js — Motore elettorale: elezioni locali e nazionali
window.Elections = (() => {
  const LOCAL_INTERVAL = 86400000; // 24h real time
  const NATIONAL_INTERVAL = 604800000; // 7 days real time
  const CAMPAIGN_DURATION = 120000; // 2 min campaign phase
  const POLL_OPEN = 8; // 8:00
  const POLL_CLOSE = 22; // 22:00

  function getTodaySeed() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  function getWeekSeed() {
    const d = new Date();
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    return weekStart.getFullYear() * 10000 + (weekStart.getMonth() + 1) * 100 + weekStart.getDate();
  }

  function canVoteLocal(lastElection) {
    if (!lastElection) return true;
    const last = new Date(lastElection).getTime();
    return Date.now() - last >= LOCAL_INTERVAL;
  }

  function canVoteNational(lastNationalElection) {
    if (!lastNationalElection) return true;
    const last = new Date(lastNationalElection).getTime();
    return Date.now() - last >= NATIONAL_INTERVAL;
  }

  function isPollsOpen() {
    const hour = new Date().getHours();
    return hour >= POLL_OPEN && hour < POLL_CLOSE;
  }

  function getTimeUntilNextLocal() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(POLL_OPEN, 0, 0, 0);
    if (now.getHours() >= POLL_CLOSE) {
      next.setDate(next.getDate() + 1);
    }
    return Math.max(0, next.getTime() - now.getTime());
  }

  function getTimeUntilNextNational() {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(18, 0, 0, 0);
    if (now.getDay() === 0 && now.getHours() >= 18) {
      nextSunday.setDate(nextSunday.getDate() + 7);
    }
    return Math.max(0, nextSunday.getTime() - now.getTime());
  }

  function setupLocalElection(cityId) {
    const seed = getTodaySeed() + hashString(cityId);
    const candidates = Politicians.generateCandidates(seed, 4);
    const electors = Bots.generateElectors(cityId, 50 + (hashString(cityId) % 50));
    return { candidates, electors, seed, cityId, type: 'local' };
  }

  function setupNationalElection() {
    const seed = getWeekSeed();
    const candidates = Politicians.generateCandidates(seed, 5);
    const electors = Bots.generateElectors('national', 200);
    return { candidates, electors, seed, type: 'national' };
  }

  function resolveElection(election, playerVote, donationBoost) {
    const results = Bots.simulateVotes(election.electors, election.candidates, playerVote, donationBoost);
    const winner = results[0];
    const runnerUp = results[1];

    winner.isWinner = true;

    return {
      winner,
      runnerUp,
      results,
      totalVotes: results.reduce((sum, c) => sum + c.votes, 0),
      turnout: election.electors.filter(e => e.turnout).length / election.electors.length
    };
  }

  function applyFavor(winner, playerDonated, playerVoted) {
    if (!winner || !winner.isWinner) return null;

    if (playerVoted && winner.favor) {
      if (playerDonated > 0) {
        return { ...winner.favor, tier: 'supporter', message: `${winner.partyEmoji} Il tuo candidato ha vinto! Favoro: ${winner.favor.name}` };
      }
      return { ...winner.favor, tier: 'voter', message: `${winner.partyEmoji} Hai votato il vincitore! Bonus piccolo.` };
    }

    return null;
  }

  function applyScandalChance(candidates) {
    const scandals = [];
    candidates.forEach(c => {
      if (Math.random() < c.scandalChance) {
        scandals.push({
          candidate: c.name,
          title: `SCANDALO: ${c.name} beccato con la bustarella!`,
          desc: `${c.partyEmoji} ${c.party} è coinvolto in uno scandalo.`,
          effect: 'scandal_fine',
          value: 500
        });
      }
    });
    return scandals;
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + c;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function formatCountdown(ms) {
    if (ms <= 0) return 'Ora!';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  return {
    LOCAL_INTERVAL, NATIONAL_INTERVAL, CAMPAIGN_DURATION,
    getTodaySeed, getWeekSeed,
    canVoteLocal, canVoteNational, isPollsOpen,
    getTimeUntilNextLocal, getTimeUntilNextNational,
    setupLocalElection, setupNationalElection,
    resolveElection, applyFavor, applyScandalChance,
    formatCountdown
  };
})();
