// seasons.js — Seasonal events system
window.Seasons = (() => {
  const SEASONS = [
    { id: 'spring', name: 'Primavera',   emoji: '🌸', months: [2, 3, 4],   challengeBonus: 'earn',     bonusPct: 50, desc: 'Rinnovamento e crescita' },
    { id: 'summer', name: 'Estate',      emoji: '☀️', months: [5, 6, 7],   challengeBonus: 'minigame', bonusPct: 50, desc: 'Calore e scioperi' },
    { id: 'autumn', name: 'Autunno',     emoji: '🍂', months: [8, 9, 10],  challengeBonus: 'buy',      bonusPct: 50, desc: 'Raccolto e offerte' },
    { id: 'winter', name: 'Inverno',     emoji: '❄️', months: [11, 0, 1],  challengeBonus: 'vote',     bonusPct: 50, desc: 'Festività e tasse' }
  ];

  const SEASONAL_EVENTS = {
    spring: [
      { title: 'Festa del Lavoro',           emoji: ' workers', effect: 'money',  value: 2000, msg: 'I lavoratori festeggiano! +€2.000' },
      { title: 'Sakura Festival',            emoji: '🌸', effect: 'influence', value: 50,   msg: 'Il festival porta influenza! +50' },
      { title: 'Primavera Politica',         emoji: '🌿', effect: 'money',  value: 1500, msg: 'Nuove iniziative politiche! +€1.500' }
    ],
    summer: [
      { title: 'Ferragosto',                 emoji: '🏖️', effect: 'money',  value: 3000, msg: 'Ferragosto! +€3.000 turismo' },
      { title: 'Sciopero Generale',          emoji: '✊', effect: 'money',  value: -1000, msg: 'Sciopero! Perdi €1.000 di produttività' },
      { title: 'Estate Calda',              emoji: '🔥', effect: 'energy', value: 20,   msg: 'Caldo torrido! +20 energia gratis' }
    ],
    autumn: [
      { title: 'Black Friday Politico',      emoji: '🛍️', effect: 'money',  value: 2500, msg: 'Offerte politiche! +€2.500' },
      { title: 'Raccolto Fiscale',           emoji: '🎃', effect: 'tax_holiday', msg: 'Giornata di tasse zero!' },
      { title: 'Autunno Rosso',              emoji: '🍁', effect: 'influence', value: 75,  msg: 'Foglie rosse di influenza! +75' }
    ],
    winter: [
      { title: 'Natale in Votopoli',         emoji: '🎄', effect: 'money',  value: 5000, msg: 'Buon Natale! +€5.000 regalo' },
      { title: 'Sanremo',                    emoji: '🎵', effect: 'influence', value: 100, msg: 'Sanremo! +100 influenza' },
      { title: 'Capodanno',                  emoji: '🎆', effect: 'money',  value: 3000, msg: 'Buon Capodanno! +€3.000 fuochi' }
    ]
  };

  function getCurrentSeason() {
    const month = new Date().getMonth();
    return SEASONS.find(s => s.months.includes(month)) || SEASONS[0];
  }

  function getSeasonalEvents(seasonId) {
    return SEASONAL_EVENTS[seasonId || getCurrentSeason().id] || [];
  }

  function getRandomSeasonalEvent(seasonId) {
    const events = getSeasonalEvents(seasonId);
    if (!events.length) return null;
    return events[Math.floor(Math.random() * events.length)];
  }

  function getChallengeBonus(challengeType) {
    const season = getCurrentSeason();
    if (season.challengeBonus === challengeType) return season.bonusPct;
    return 0;
  }

  function applySeasonalBonus(state) {
    const season = getCurrentSeason();
    const event = getRandomSeasonalEvent(season.id);
    if (!event) return null;

    switch (event.effect) {
      case 'money': state.money += event.value; break;
      case 'influence': state.influence += event.value; break;
      case 'energy': state.energy = Math.min(state.maxEnergy, state.energy + event.value); break;
      case 'tax_holiday': state.mayorTax = 0; break;
    }
    return event;
  }

  function render() {
    const season = getCurrentSeason();
    return `<div style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;background:var(--card);border:1px solid var(--line);border-radius:8px;font-size:11px">
      <span>${season.emoji}</span>
      <span style="font-weight:700">${season.name}</span>
      <span style="color:var(--dim)">· ${season.desc}</span>
    </div>`;
  }

  function renderFull() {
    const current = getCurrentSeason();
    const html = SEASONS.map(s => {
      const isCurrent = s.id === current.id;
      return `<div style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;background:${isCurrent ? 'var(--gold-light)' : 'var(--card)'};border:1px solid ${isCurrent ? 'var(--gold)' : 'var(--line)'};margin:4px 0">
        <div style="font-size:24px">${s.emoji}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:700">${s.name} ${isCurrent ? '(attuale)' : ''}</div>
          <div style="font-size:10px;color:var(--dim)">${s.desc}</div>
          <div style="font-size:9px;color:var(--gold)">Bonus sfide: +${s.bonusPct}% ${s.challengeBonus}</div>
        </div>
      </div>`;
    }).join('');

    return `<div style="padding:12px">
      <div style="font-size:18px;font-weight:800;margin-bottom:8px">🗓️ Stagioni</div>
      <div style="font-size:11px;color:var(--dim);margin-bottom:12px">Ogni stagione ha bonus e eventi speciali</div>
      ${html}
      <button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>
    </div>`;
  }

  return { SEASONS, getCurrentSeason, getSeasonalEvents, getRandomSeasonalEvent, getChallengeBonus, applySeasonalBonus, render, renderFull };
})();
