// bots.js — Cittadini simulati + AI di voto
window.Bots = (() => {
  const BOT_NAMES = [
    'Paperino', 'Topolino', 'Pippo', 'Pluto', 'Gastone',
    'Zio Paperone', 'Qui', 'Quo', 'Qua', 'Nonna Papera',
    'Mario', 'Luigi', 'Peach', 'Toad', 'Yoshi',
    'Sonic', 'Tails', 'Knuckles', 'Amy', 'Shadow',
    'Batman', 'Superman', 'Spider-Man', 'Wolverine', 'Hulk',
    'Frodo', 'Gandalf', 'Aragorn', 'Legolas', 'Gimli',
    'Luke', 'Leia', 'Han', 'Chewbacca', 'Yoda',
    'Neo', 'Trinity', 'Morpheus', 'Agent Smith', 'Oracle',
    'Sherlock', 'Watson', 'Moriarty', 'Bond', 'Q',
    'Rambo', 'Rocky', 'Terminator', 'Robocop', 'Predator'
  ];

  function seededRandom(seed) {
    let s = seed;
    return function() {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  function generateBots(cityId, count) {
    const seed = hashString(cityId + new Date().toDateString());
    const rng = seededRandom(seed);
    const used = new Set();
    const bots = [];

    for (let i = 0; i < count; i++) {
      let name;
      do {
        name = BOT_NAMES[Math.floor(rng() * BOT_NAMES.length)];
      } while (used.has(name));
      used.add(name);

      bots.push({
        id: `bot_${i}`,
        name: name,
        money: Math.round(100 + rng() * 5000),
        influence: Math.round(rng() * 20),
        home: Math.floor(rng() * 4),
        voteWeight: 0.5 + rng() * 0.5,
        loyalty: Math.random() < 0.3 ? Math.floor(rng() * 4) : -1
      });
    }

    return bots;
  }

  function generateElectors(cityId, count) {
    const seed = hashString(cityId + new Date().toDateString());
    const rng = seededRandom(seed);
    const electors = [];

    for (let i = 0; i < count; i++) {
      electors.push({
        id: `elector_${i}`,
        name: BOT_NAMES[i % BOT_NAMES.length] + (i >= BOT_NAMES.length ? `'${i}` : ''),
        voteWeight: 0.5 + rng() * 0.5,
        loyalty: Math.floor(rng() * 5) - 1,
        turnout: rng() < 0.7
      });
    }

    return electors;
  }

  function simulateVotes(electors, candidates, playerVote, donationBoost) {
    candidates.forEach(c => c.votes = 0);

    if (playerVote) {
      const pc = candidates.find(c => c.id === playerVote);
      if (pc) pc.votes += 1 + (donationBoost || 0);
    }

    electors.forEach(e => {
      if (!e.turnout) return;
      if (e.loyalty >= 0 && e.loyalty < candidates.length) {
        candidates[e.loyalty].votes += e.voteWeight;
        return;
      }
      const rng = seededRandom(hashString(e.id + new Date().toDateString()));
      const weights = candidates.map(c => {
        let w = c.charisma * (0.5 + rng() * 0.5);
        if (c.taxRate <= 20) w += 0.2;
        if (c.favor && c.favor.type === 'money_bonus') w += 0.15;
        return Math.max(0.01, w);
      });
      const total = weights.reduce((a, b) => a + b, 0);
      let r = rng() * total;
      for (let i = 0; i < candidates.length; i++) {
        r -= weights[i];
        if (r <= 0) {
          candidates[i].votes += e.voteWeight;
          break;
        }
      }
    });

    return candidates.sort((a, b) => b.votes - a.votes);
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

  return { generateBots, generateElectors, simulateVotes };
})();
