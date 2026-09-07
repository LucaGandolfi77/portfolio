// achievements.js — Sistema achievement e milestone
window.Achievements = (() => {
  const DEFS = [
    { id: 'first_coin',    title: 'Prima Moneta',          desc: 'Guadagna la prima moneta',                icon: '🪙', condition: s => s.money > 0 },
    { id: 'chapter_1',     title: 'Studente',               desc: 'Completa il primo capitolo',               icon: '📖', condition: s => s.completedChapters.length >= 1 },
    { id: 'chapter_5',     title: 'Mezzo Cammino',          desc: 'Completa 5 capitoli',                      icon: '📘', condition: s => s.completedChapters.length >= 5 },
    { id: 'chapter_10',    title: 'Esperto',                desc: 'Completa 10 capitoli',                     icon: '🎓', condition: s => s.completedChapters.length >= 10 },
    { id: 'boss_slayer',   title: 'Slayer del Drago',       desc: 'Sconfiggi Inflazion',                      icon: '🐉', condition: s => s.completedChapters.includes(6) },
    { id: 'all_chapters',  title: 'Laurea in Finanza',      desc: 'Completa tutti i 18 capitoli',             icon: '🏆', condition: s => s.completedChapters.length >= 18 },
    { id: 'empire_founded',title: 'Fondatore',              desc: 'Sblocca l\'Impero di Soldania',            icon: '🏰', condition: s => s.empireUnlocked },
    { id: 'millionaire',   title: 'Milionario',             desc: 'Guadagna €1.000.000 totali',               icon: '💰', condition: s => (s.empire.totalEarned || 0) >= 1e6 },
    { id: 'billionaire',   title: 'Miliardario',            desc: 'Guadagna €1.000.000.000 totali',           icon: '💎', condition: s => (s.empire.totalEarned || 0) >= 1e9 },
    { id: 'prestige_1',    title: 'Rinascita',              desc: 'Fai prestige 1 volta',                     icon: '👑', condition: s => (s.empire.prestigeCount || 0) >= 1 },
    { id: 'prestige_5',    title: 'Ciclo Infinito',         desc: 'Fai prestige 5 volte',                     icon: '🌀', condition: s => (s.empire.prestigeCount || 0) >= 5 },
    { id: 'streak_3',      title: 'Tre Giorni',             desc: 'Streak di 3 giorni',                       icon: '🔥', condition: s => (s.streak?.count || 0) >= 3 },
    { id: 'streak_7',      title: 'Settimana Forte',        desc: 'Streak di 7 giorni',                       icon: '⚡', condition: s => (s.streak?.count || 0) >= 7 },
    { id: 'streak_30',     title: 'Mese Pieno',             desc: 'Streak di 30 giorni',                      icon: '🌟', condition: s => (s.streak?.count || 0) >= 30 },
    { id: 'events_10',     title: 'Sopravvissuto',          desc: 'Subisci 10 eventi casuali',                icon: '🎭', condition: s => (s.empire.eventsDone || 0) >= 10 },
    { id: 'events_50',     title: 'Veterano',               desc: 'Subisci 50 eventi casuali',                icon: '🎖️', condition: s => (s.empire.eventsDone || 0) >= 50 },
    { id: 'buildings_max', title: 'Architetto Supremo',     desc: 'Possiedi tutti gli 8 tipi di edifici',     icon: '🏗️', condition: s => Object.keys(s.empire.buildings || {}).length >= 8 },
  ];

  let unlocked = [];

  function load() {
    try {
      const raw = localStorage.getItem('rdm_achievements_v1');
      if (raw) unlocked = JSON.parse(raw);
    } catch(e) { unlocked = []; }
  }

  function save() {
    try { localStorage.setItem('rdm_achievements_v1', JSON.stringify(unlocked)); } catch(e) {}
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

  function getAll() {
    return DEFS.map(a => ({ ...a, unlocked: unlocked.includes(a.id) }));
  }

  function isUnlocked(id) { return unlocked.includes(id); }
  function count() { return unlocked.length; }
  function total() { return DEFS.length; }
  function pct() { return Math.round((unlocked.length / DEFS.length) * 100); }

  // Mostra notifica achievement
  function showNotification(ach) {
    const el = document.createElement('div');
    el.className = 'achievement-toast';
    el.innerHTML = `<div class="ach-icon">${ach.icon}</div><div class="ach-info"><div class="ach-title">${ach.title}</div><div class="ach-desc">${ach.desc}</div></div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 400);
    }, 3000);
  }

  // Check + mostra notifiche per i nuovi
  function checkAndNotify() {
    const fresh = check();
    fresh.forEach((a, i) => {
      setTimeout(() => {
        showNotification(a);
        if (window.Sounds) window.Sounds.play('levelup');
      }, i * 800);
    });
    return fresh;
  }

  load();

  return { check, checkAndNotify, getAll, isUnlocked, count, total, pct, showNotification };
})();
