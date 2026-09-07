// achievements.js — VOTOPOLI achievements (pattern from regno-di-moneta)
window.Achievements = (() => {
  const KEY = 'votopoli_achievements_v1';

  const DEFS = [
    { id: 'first_vote',      title: 'Primo Voto',         desc: 'Hai votato per la prima volta',                   icon: '🗳️',  condition: s => s.votesCast >= 1 },
    { id: 'voter_10',        title: 'Elettore Serio',      desc: 'Hai votato 10 volte',                             icon: '🗳️',  condition: s => s.votesCast >= 10 },
    { id: 'voter_100',       title: 'Democrazia Attiva',   desc: 'Hai votato 100 volte',                             icon: '🏛️',  condition: s => s.votesCast >= 100 },
    { id: 'first_biz',       title: 'Imprenditore',        desc: 'Hai comprato il tuo primo business',               icon: '💼',  condition: s => Object.keys(s.businesses).length >= 1 },
    { id: 'biz_5',           title: 'Magnate',             desc: 'Possiedi 5 business diversi',                      icon: '💰',  condition: s => Object.keys(s.businesses).length >= 5 },
    { id: 'biz_13',          title: 'Monopolista',         desc: 'Possiedi tutti i 13 business',                     icon: '🏭',  condition: s => Object.keys(s.businesses).length >= 13 },
    { id: 'millionaire',     title: 'Milionario',          desc: 'Hai guadagnato €1.000.000 in totale',              icon: '💸',  condition: s => s.totalEarned >= 1000000 },
    { id: 'billionaire',     title: 'Miliardario',         desc: 'Hai guadagnato €1.000.000.000 in totale',          icon: '💎',  condition: s => s.totalEarned >= 1000000000 },
    { id: 'home_3',          title: 'Casa Decente',        desc: 'Sei arrivato ad un Appartamento',                  icon: '🏢',  condition: s => s.home >= 3 },
    { id: 'home_7',          title: 'Castellano',          desc: 'Hai un Castello!',                                 icon: '🏰',  condition: s => s.home >= 7 },
    { id: 'traveler',        title: 'Viaggiatore',         desc: 'Ti sei trasferito 3 volte',                        icon: '🗺️',  condition: s => s.moveCount >= 3 },
    { id: 'globe_trotter',   title: 'Globe Trotter',       desc: 'Ti sei trasferito 10 volte',                       icon: '🌍',  condition: s => s.moveCount >= 10 },
    { id: 'first_scandal',   title: 'Scandalizzato',       desc: 'Hai avuto il tuo primo scandalo',                  icon: '📰',  condition: s => s.scandals >= 1 },
    { id: 'survivor',        title: 'Sopravvissuto',       desc: 'Hai sopravvissuto a 5 scandali',                   icon: '🎭',  condition: s => s.scandals >= 5 },
    { id: 'tax_master',      title: 'Titolare del Fisco',  desc: 'Hai pagato €100.000 di tasse',                     icon: '🏛️',  condition: s => s.taxPaid >= 100000 },
    { id: 'favor_collector', title: 'Raccomandato',         desc: 'Hai ricevuto 5 favori',                            icon: '🎁',  condition: s => s.favorCount >= 5 },
    { id: 'influencer',      title: 'Influencer',          desc: 'Hai accumulato 500 di influenza',                  icon: '⭐',  condition: s => s.influence >= 500 },
    { id: 'minigame_king',   title: 'Re dei Minigiochi',   desc: 'Hai vinto 10 minigiochi',                          icon: '👑',  condition: s => (s.minigameWins || 0) >= 10 }
  ];

  let unlocked = [];

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(saved)) unlocked = saved;
    } catch(e) {}
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(unlocked)); } catch(e) {}
  }

  function check() {
    const state = window.Save.get();
    const newlyUnlocked = [];
    DEFS.forEach(a => {
      if (!unlocked.includes(a.id) && a.condition(state)) {
        unlocked.push(a.id);
        newlyUnlocked.push(a);
      }
    });
    if (newlyUnlocked.length > 0) save();
    return newlyUnlocked;
  }

  function showNotification(ach) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <div class="ach-icon">${ach.icon}</div>
      <div class="ach-info">
        <div class="ach-title">${ach.title}</div>
        <div class="ach-desc">${ach.desc}</div>
      </div>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
  }

  function checkAndNotify() {
    const fresh = check();
    fresh.forEach((a, i) => {
      setTimeout(() => {
        showNotification(a);
        if (window.Sounds) window.Sounds.play('levelup');
        try { if (navigator.vibrate) navigator.vibrate([10, 30, 10]); } catch(e) {}
      }, i * 800);
    });
    return fresh;
  }

  function getAll() {
    return DEFS.map(a => ({ ...a, unlocked: unlocked.includes(a.id) }));
  }

  function count() { return unlocked.length; }
  function total() { return DEFS.length; }
  function pct() { return Math.round((unlocked.length / DEFS.length) * 100); }

  load();

  return { check, checkAndNotify, getAll, count, total, pct, showNotification };
})();
