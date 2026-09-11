/* ============================================================
   MIRAGGIO HOTEL — motore (canvas, avatar, chat, stanze, monete)
   ============================================================ */
(function () {
  'use strict';
  const D = window.MIRAGGIO;
  const $ = id => document.getElementById(id);
  const SAVE_KEY = 'miraggio_save_v1';
  const TAU = Math.PI * 2;

  /* ---------- stato ---------- */
  function freshState() {
    return {
      nick: '',
      coins: D.startCoins,
      earned: 0,
      room: 'atrio',
      outfit: {
        skin: D.skins[1], hairColor: D.hairColors[0], hairStyle: 'short',
        top: D.tops[0], pants: D.pants[0], acc: 'none'
      },
      ownedStyles: ['short', 'bald'],
      ownedAcc: ['none', 'glasses'],
      ownedColors: [D.skins[0], D.skins[1], D.hairColors[0], D.tops[0], D.pants[0]],
      styleIdx: { hairStyle: 0, acc: 0 },
      px: 350, py: 360,
      eqStyle: { hairStyle: 'short', acc: 'none' },
      ach: {},
      stats: { talks: 0 },
      visitedRooms: [],
      emotesUsed: [],
      stars: {},
      pets: [],
      fashionShow: { active: false, startTime: 0, duration: 45000, participants: [], winners: [], phase: 'idle' },
      fortWheel: { lastSpin: 0, spinsToday: 0, totalSpins: 0 },
ghosts: { seen: {}, active: [], missions: {} },
       minigame: { score: 0, combo: 0, bestScore: 0, totalGames: 0 },
       danceBattle: { score: 0, bestScore: 0, totalGames: 0 },
       weather: { type: 'clear', intensity: 0, nextChange: 0 },
       mystery: { active: null, solved: [], cluesFound: {}, currentStep: 0 },
       dimensions: { dark: false, neon: false, steam: false },
       title: '',
      titles: ['neo'],
      tutorial: { step: 0, completed: false, seen: {} },
      seasonal: { active: null, progress: {}, completed: [], adventCalendar: {}, candyCollected: 0, eggsFound: 0, surfBest: 0 },
       builder: { active: false, roomId: '', name: '', desc: '', slots: [], votes: 0, votedBy: [], createdAt: 0, isPublic: true },
       manager: { unlocked: false, budget: 0, reputation: 0, staff: [], upgrades: {}, rooms: [], revenue: 0, dayIncome: 0, expenses: 0, vipGuests: 0, protection: 0 },
       breeding: { cooldowns: {}, eggs: [], totalBreeds: 0, totalHatchings: 0, totalEvolves: 0, unlocked: false },
       musicStudio: { active: false, currentTrack: { name: 'Untitled', bpm: 120, genre: 'House', pattern: [[], [], [], [], [], []], instruments: [], tempo: 'mid', isPlaying: false, createdAt: 0, likes: 0 }, library: [], weeklyContest: { active: false, genre: '', week: '', entries: [], winner: null, prizes: [] } },
 society: { keys: 0, dailyKeys: 0, marketDay: '', purchasedItems: [], missionsDone: [], reputation: 0, visited: false },
        friends: {}
     };
   }
   let st = freshState();
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(st)); } catch (e) {} }
  function deepMerge(base, override) {
    if (Array.isArray(base) || typeof base !== 'object' || base === null) return override === undefined ? base : override;
    const out = { ...base };
    if (override && typeof override === 'object') {
      for (const k of Object.keys(override)) out[k] = (k in base) ? deepMerge(base[k], override[k]) : override[k];
    }
    return out;
  }
  function load() { try { const r = localStorage.getItem(SAVE_KEY); if (r) { st = deepMerge(freshState(), JSON.parse(r)); return true; } } catch (e) {} return false; }
  function wipe() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

/* ---------- runtime ---------- */
const canvas = $('view');
const ctx = canvas.getContext('2d');
let CW = 0, CH = 0, DPR = 1;
const cam = { s: 1, ox: 0, oy: 0 };
const TOP_RES = 84, DOCK_RES = 92;

/* ---------- day/night ---------- */
let dayTime = 0;
let daySpeed = 0.00005;

/* ---------- achievements ---------- */
let achievements = {};
const ACHIVE_DEFS = [
  { id: 'first_chat', title: 'Primo contatto', desc: 'Parla con un ospite per la prima volta', icon: '💬' },
  { id: '5_chats', title: 'Chiacchierone', desc: '5 chiacchierate in una stanza', icon: '💬' },
  { id: 'all_rooms', title: 'Esploratore', desc: 'Visita tutte le stanze', icon: '🗺️' },
  { id: 'first_coin', title: 'Prima moneta', desc: 'Guadagna la tua prima moneta', icon: '🪙' },
  { id: '100_coins', title: 'Borsellino', desc: 'Raggiungi 100 monete', icon: '💰' },
  { id: 'first_emote', title: 'Espressivo', desc: 'Usa la tua prima emote', icon: '😄' },
  { id: 'all_emotes', title: 'Versatile', desc: 'Usa tutte le emote', icon: '🎭' },
  { id: 'first_mission', title: 'Missione', desc: 'Completa la prima missione', icon: '✅' },
  { id: 'first_lvl', title: 'Livello 2', desc: 'Raggiungi il livello 2 con un ospite', icon: '❤️' },
  { id: 'first_trophy', title: 'Trofeo', desc: 'Ottieni il tuo primo trofeo', icon: '🏆' },
  { id: 'collect_5', title: 'Collezionista', desc: 'Raccogli 5 oggetti volanti', icon: '⭐' },
  { id: 'night_visit', title: 'Notte al Miraggio', desc: 'Visita una stanza di notte', icon: '🌙' },
  { id: 'first_ghost', title: 'Paranormale', desc: 'Parla con un fantasma per la prima volta', icon: '👻' },
  { id: 'mystery_solved', title: 'Detective', desc: 'Risolvi il primo mistero', icon: '🔍' },
  { id: 'all_mysteries', title: 'Master Detective', desc: 'Risolvi tutti i 5 misteri', icon: '🕵️' },
  { id: 'halloween_done', title: 'Trick or Treater', desc: 'Completa il Halloween', icon: '🎃' },
  { id: 'christmas_done', title: 'Natale', desc: 'Completa il Christmas', icon: '🎄' },
  { id: 'easter_done', title: 'Pasqua', desc: 'Completa l\'Easter', icon: '🥚' },
  { id: 'summer_done', title: 'Estate', desc: 'Completa l\'Estate', icon: '🌊' },
  { id: 'all_seasonal', title: 'Party Animal', desc: 'Partecipa a tutti gli eventi stagionali', icon: '🎉' },
  { id: 'first_builder', title: 'Architetto', desc: 'Crea la tua prima stanza', icon: '🏗️' },
  { id: 'builder_5', title: 'Architetto Senior', desc: 'Crea 5 stanze', icon: '🏰' },
  { id: 'builder_10', title: 'Maestro Costruttore', desc: 'Crea 10 stanze', icon: '🏯' },
  { id: 'society_first', title: 'Socio', desc: 'Completa la prima missione segreta', icon: '🗿' },
  { id: 'society_5', title: 'Socio Elite', desc: 'Completa 5 missioni segrete', icon: '🧙' },
  { id: 'society_10', title: 'Master Ombra', desc: 'Completa 10 missioni segrete', icon: '💀' },
{ id: 'all_ach', title: 'Soci Pieni', desc: 'Completa tutti gli achievement', icon: '🌑' },
   { id: 'narrator', title: 'Narratore', desc: 'Rivelare il Sogno di un NPC', icon: '📖' },
   { id: 'sociologist', title: 'Sociologo', desc: 'Rivelare tutti gli archi di un NPC', icon: '🔍' },
{ id: 'hotel_secret', title: 'Segreto dell\'Hotel', desc: 'Rivelare il segreto del Miraggio', icon: '🌑' },
    { id: 'shadow_walker', title: 'Camminatore d\'Ombre', desc: 'Risolvi il mistero dell\'Ombra Profonda', icon: '🌑' },
    { id: 'neon_diver', title: 'Tuffatore Neon', desc: 'Risolvi il bug neon', icon: '💜' },
    { id: 'time_traveler', title: 'Viaggiatore Temporale', desc: 'Ripara la Macchina del Tempo', icon: '⚙️' },
     { id: 'dimension_explorer', title: 'Esploratore Dimensionale', desc: 'Visita tutte e 3 le dimensioni', icon: '🌀' },
     { id: 'hotel_manager', title: 'Hotel Manager', desc: 'Assumi il primo membro dello staff', icon: '👥' },
     { id: 'staff_master', title: 'Staff Master', desc: 'Assumi tutto lo staff', icon: '🏨' },
     { id: 'hotel_chain', title: 'Catena Hotel', desc: 'Migliora tutti gli upgrade', icon: '⬆️' },
     { id: 'vip_hotel', title: 'VIP Hotel', desc: 'Costruisci il Penthouse', icon: '👑' },
     { id: 'first_breed', title: 'Primo Incrocio', desc: 'Alleva il primo ibrido', icon: '🥚' },
     { id: 'breed_5', title: 'Allevatore', desc: 'Crea 5 ibridi', icon: '🐾' },
     { id: 'first_evolve', title: 'Prima Evoluzione', desc: 'Evolvi il tuo primo pet', icon: '✨' },
     { id: 'hatch_5', title: 'Schiusore', desc: 'Schiudi 5 uova', icon: '🥚' },
     { id: 'breed_master', title: 'Master Allevatore', desc: 'Crea 20 ibridi', icon: '🏆' },
     { id: 'first_track', title: 'Prima Traccia', desc: 'Crea il tuo primo brano', icon: '🎵' },
     { id: 'dj_producer', title: 'DJ Producer', desc: 'Salva 5 brani', icon: '💿' },
     { id: 'contest_win', title: 'Contest Win', desc: 'Vinci il contest DJ', icon: '🏆' },
     { id: 'viral_hit', title: 'Viral Hit', desc: 'Ricevi 10 likes su un brano', icon: '🔥' },
   ];

function checkAchievements() {
  achievements = st.ach || {};
  const chats = st.stats ? (st.stats.talks || 0) : 0;
  const earned = st.earned || 0;
  if (chats >= 1 && !achievements.first_chat) unlockAch('first_chat');
  if (chats >= 5 && !achievements['5_chats']) unlockAch('5_chats');
  if (earned >= 1 && !achievements.first_coin) unlockAch('first_coin');
  if (earned >= 100 && !achievements['100_coins']) unlockAch('100_coins');
  if (earned >= 1 && !achievements.first_emote) unlockAch('first_emote');
  // all achievements check
  if (getCompletedAchCount() >= (ACH_IDS.size - 1) && !achievements.all_ach) unlockAch('all_ach');
  // dimension achievements
  if (st.mystery.solved.includes('mystery_dark_1') && !st.ach.shadow_walker) unlockAch('shadow_walker');
  if (st.mystery.solved.includes('mystery_neon_1') && !st.ach.neon_diver) unlockAch('neon_diver');
  if (st.mystery.solved.includes('mystery_steam_1') && !st.ach.time_traveler) unlockAch('time_traveler');
   const dl = st.dimensions || { dark: false, neon: false, steam: false };
   const dimsUnlocked = [dl.dark, dl.neon, dl.steam].filter(Boolean).length;
   if (dimsUnlocked >= 3 && !achievements.dimension_explorer) unlockAch('dimension_explorer');
   // manager achievements
   if (st.manager && st.manager.staff.length >= 1 && !achievements.hotel_manager) unlockAch('hotel_manager');
   if (st.manager && st.manager.staff.length >= 6 && !achievements.staff_master) unlockAch('staff_master');
   const allUpgrades = st.manager && st.manager.upgrades ? Object.keys(st.manager.upgrades).every(k => (st.manager.upgrades[k] || 0) >= 1) : false;
   if (allUpgrades && !achievements.hotel_chain) unlockAch('hotel_chain');
    if (st.manager && st.manager.upgrades && st.manager.upgrades.penthouse && st.manager.upgrades.penthouse >= 1 && !achievements.vip_hotel) unlockAch('vip_hotel');
    // breeding achievements
    if (st.breeding && st.breeding.totalBreeds >= 1 && !achievements.first_breed) unlockAch('first_breed');
    if (st.breeding && st.breeding.totalBreeds >= 5 && !achievements.breed_5) unlockAch('breed_5');
    if (st.breeding && st.breeding.totalEvolves >= 1 && !achievements.first_evolve) unlockAch('first_evolve');
    if (st.breeding && st.breeding.totalHatchings >= 5 && !achievements.hatch_5) unlockAch('hatch_5');
     const allBreedAch = st.breeding && st.breeding.totalBreeds >= 20;
     if (allBreedAch && !achievements.breed_master) unlockAch('breed_master');
     // music studio achievements
     if (st.musicStudio && st.musicStudio.library && st.musicStudio.library.length >= 1 && !achievements.first_track) unlockAch('first_track');
     if (st.musicStudio && st.musicStudio.library && st.musicStudio.library.length >= 5 && !achievements.dj_producer) unlockAch('dj_producer');
     if (st.musicStudio && st.musicStudio.weeklyContest && st.musicStudio.weeklyContest.winner && st.musicStudio.weeklyContest.winner.track && !achievements.contest_win) unlockAch('contest_win');
   }
function unlockAch(id) {
  st.ach = st.ach || {};
  st.ach[id] = true;
  achievements[id] = true;
  const def = ACHIVE_DEFS.find(a => a.id === id);
  if (def) toast(`${def.icon} Achievement sbloccato: ${def.title}!`);
  save();
}

/* ---------- titles system ---------- */
function unlockTitle(id) {
  st.titles = st.titles || ['neo'];
  if (st.titles.includes(id)) return;
  st.titles.push(id);
  const t = D.titles.find(x => x.id === id);
  if (t) toast('👑 Titolo sbloccato: ' + t.emoji + ' ' + t.name + '!');
  save();
}

function setTitle(id) {
  st.titles = st.titles || ['neo'];
  if (!st.titles.includes(id)) return;
  const t = D.titles.find(x => x.id === id);
  if (t) { st.title = t.id; save(); updateHUD(); }
}

function getTitleData(id) {
  return D.titles.find(x => x.id === id) || D.titles[0];
}

function checkTitles() {
  st.titles = st.titles || ['neo'];
  // coins-based titles
  if (st.earned >= 80) unlockTitle('allegro');
  if (st.earned >= 260) unlockTitle('stella');
  if (st.earned >= 420) unlockTitle('vip');
  if (st.earned >= 700) unlockTitle('leggenda');
  // chat-based
  const chats = st.stats.talks || 0;
  if (chats >= 10) unlockTitle('chiacchierone');
  // rooms visited
  if (st.visitedRooms && st.visitedRooms.length >= 9) unlockTitle('esploratore');
  // night visit
  if (st.ach.night_visit) unlockTitle('stella_notte');
  // ghost
  if (st.ach.first_ghost) unlockTitle('paranormale');
  // missions
  const missionsDone = (st.missions.list || []).filter(m => m.done).length;
  if (missionsDone >= 30) unlockTitle('guardiano');
  // collectibles
  if ((st.stats.totalCollected || 0) >= 20) unlockTitle('collezionista');
  // pets
  if (st.pets.length >= 3) unlockTitle('pet_parent');
  // dance battle
  if ((st.danceBattle.bestScore || 0) >= 100) unlockTitle('maestro_ballo');
  // friend level 5
  Object.keys(st.friends || {}).forEach(id => {
    if (lvlOf(id) >= 5) unlockTitle('re_hotel');
  });
  // fortune wheel
  if (st.fortWheel.totalSpins >= 1) unlockTitle('principe');
  // mystery
  if (st.mystery.solved.length >= 1) unlockTitle('detective');
  if (st.mystery.solved.length >= 5) unlockTitle('master_detective');
  const built = (st.builderRooms || []).length;
  if (built >= 1) unlockTitle('builder');
  if (built >= 5) unlockTitle('builder_elite');
  if (built >= 10) unlockTitle('builder_master');
  // society titles
  if (st.ach.society_first) unlockTitle('society_member');
  if ((st.society.missionsDone || []).length >= 5) unlockTitle('society_elite');
  if ((st.society.missionsDone || []).length >= 10 && (st.society.keys || 0) >= 100) unlockTitle('society_master');
if (achievements.all_ach) unlockTitle('soci_pieni');
   // NPC arc titles
   const allBots = Object.keys(D.bots || {});
   if (allBots.some(bid => (st.friends[bid] && st.friends[bid].arcs && st.friends[bid].arcs.sogno))) unlockTitle('narrator');
   if (allBots.every(bid => (st.friends[bid] && st.friends[bid].arcs && st.friends[bid].arcs.relazioni))) { unlockTitle('sociologist'); if (!achievements.sociologist) unlockAch('sociologist'); }
if (achievements.hotel_secret) unlockTitle('hotel_secret');
   if (st.ach.shadow_walker) unlockTitle('shadow_walker');
   if (st.ach.neon_diver) unlockTitle('neon_diver');
   if (st.ach.time_traveler) unlockTitle('time_traveler');
    if (achievements.dimension_explorer) unlockTitle('dimension_explorer');
    // manager titles
    if (achievements.hotel_manager && !st.titles.includes('hotel_manager')) unlockTitle('hotel_manager');
    if (achievements.staff_master && !st.titles.includes('staff_master')) unlockTitle('staff_master');
     if (achievements.vip_hotel && !st.titles.includes('vip_director')) unlockTitle('vip_director');
     if (achievements.first_breed && !st.titles.includes('breeder')) unlockTitle('breeder');
     if (achievements.breed_master && !st.titles.includes('breed_master')) unlockTitle('breed_master');
      if (achievements.first_evolve && !st.titles.includes('evolver')) unlockTitle('evolver');
      if (achievements.first_track && !st.titles.includes('dj_novice')) unlockTitle('dj_novice');
      if (achievements.dj_producer && !st.titles.includes('dj_producer')) unlockTitle('dj_producer');
      if (achievements.contest_win && !st.titles.includes('contest_champion')) unlockTitle('contest_champion');
     }

function renderTitleSelector() {
  const titles = D.titles;
  let h = '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:10px">Scegli il tuo titolo da visualizzare nell\'HUD</div>';
  h += '<div style="display:grid;grid-template-columns:1fr;gap:6px">';
  titles.forEach(t => {
    const owned = (st.titles || []).includes(t.id);
    const active = st.title === t.id;
    h += '<button class="room' + (active ? ' here' : '') + '" data-title="' + t.id + '" ' + (!owned ? 'disabled style="opacity:.4"' : '') + '>' +
      '<span class="re">' + t.emoji + '</span>' +
      '<span style="flex:1;text-align:left"><b>' + t.name + '</b><small>' + t.desc + '</small></span>' +
      (active ? '<span class="online">● attivo</span>' : owned ? '<span class="online">✅</span>' : '<span class="online">🔒</span>') +
      '</button>';
  });
  h += '</div>';
  const body = $('titleBody');
  if (body) body.innerHTML = h;
  // wire clicks
  document.querySelectorAll('[data-title]').forEach(btn => {
    btn.onclick = () => {
      if (!btn.disabled) { setTitle(btn.dataset.title); renderTitleSelector(); }
    };
  });
}

function checkRoomVisit() {
  // track visited rooms
  st.visitedRooms = st.visitedRooms || [];
  if (!st.visitedRooms.includes(st.room)) {
    st.visitedRooms.push(st.room);
    if (st.visitedRooms.length >= Object.keys(D.rooms).length && !achievements.all_rooms) {
      unlockAch('all_rooms');
    }
    if ((dayTime < 0.3 || dayTime > 0.85) && !achievements.night_visit) {
      unlockAch('night_visit');
    }
  }
}
function checkEmoteAchievement() {
  st.emotesUsed = st.emotesUsed || [];
  const used = new Set(st.emotesUsed);
  if (used.size >= D.emotes.length && !achievements.all_emotes) unlockAch('all_emotes');
}

/* ---------- tutorial / onboarding ---------- */
const TUTORIAL_STEPS = [
  { id: 'welcome', text: 'Benvenuto al Miraggio! Tocca il pavimento per camminare 👆', target: 'view', pos: 'center' },
  { id: 'move', text: 'Bravo! Ora tocca un ospite per parlare 💬', target: null, pos: null },
  { id: 'talk', text: 'Ottimo! Parla con altri ospiti per guadagnare monete 🪙', target: null, pos: null },
  { id: 'coins_10', text: 'Hai monete! Prova il 👕 Look per cambiare outfit', target: 'dbWardrobe', pos: 'top' },
  { id: 'wardrobe', text: 'Cambia capelli, colori e accessori. Primi 2 colori gratis!', target: null, pos: null },
  { id: 'room_change', text: 'Ogni stanza ha ospiti diversi! Esplora tutte le stanze 🏨', target: 'dbRooms', pos: 'top' },
  { id: 'emote', text: 'Le emote piacciono agli ospiti! Prova a ballare 💃', target: 'dbEmotes', pos: 'top' },
  { id: 'missions', text: 'Missioni quotidiane ti danno ricompense extra! 📋', target: 'dbMissions', pos: 'top' },
  { id: 'coins_30', text: 'Sei pronto! Prova la 🎡 Ruota della Fortuna', target: 'fwChip', pos: 'bottom' },
  { id: 'wheel', text: 'Complimenti! Sei pronto per esplorare il Miraggio! 🏨', target: null, pos: null }
];

function checkTutorial(stepId) {
  if (st.tutorial.completed) return;
  const step = TUTORIAL_STEPS.find(s => s.id === stepId);
  if (!step) return;
  const idx = TUTORIAL_STEPS.indexOf(step);
  if (idx < st.tutorial.step) return;
  if (st.tutorial.seen[stepId]) return;
  st.tutorial.step = idx + 1;
  st.tutorial.seen[stepId] = true;
  if (step.target) showHint(step.target, step.text, step.pos);
  else toast(step.text, 4000);
  if (st.tutorial.step >= TUTORIAL_STEPS.length) {
    st.tutorial.completed = true;
    setTimeout(() => toast('🎓 Tutorial completato! Esplora liberamente!', 4000), 1500);
  }
  save();
}

function showHint(targetId, text, pos) {
  hideHint();
  const target = $(targetId);
  if (!target) { toast(text, 4000); return; }
  target.classList.add('hint-glow');
  const hint = document.createElement('div');
  hint.id = 'tutorialHint';
  hint.className = 'tutorial-hint';
  hint.innerHTML = '<span>' + text + '</span><button id="hintCloseBtn">✕</button>';
  setTimeout(() => { const hb = document.getElementById('hintCloseBtn'); if (hb) hb.onclick = hideHint; }, 0);
  document.body.appendChild(hint);
  const rect = target.getBoundingClientRect();
  const hintH = 50;
  let top, left;
  if (pos === 'top') { top = rect.top - hintH - 12; left = rect.left + rect.width / 2 - 120; }
  else if (pos === 'bottom') { top = rect.bottom + 12; left = rect.left + rect.width / 2 - 120; }
  else { top = rect.top + rect.height / 2 - hintH / 2; left = rect.left - 250; }
  left = Math.max(10, Math.min(left, window.innerWidth - 250));
  top = Math.max(10, Math.min(top, window.innerHeight - 60));
  hint.style.top = top + 'px';
  hint.style.left = left + 'px';
}

function hideHint() {
  const old = $('tutorialHint');
  if (old) old.remove();
  document.querySelectorAll('.hint-glow').forEach(el => el.classList.remove('hint-glow'));
}

function skipTutorial() {
  st.tutorial.completed = true;
  st.tutorial.step = TUTORIAL_STEPS.length;
  hideHint();
  save();
  toast('🎓 Tutorial saltato!', 2000);
}
function computeStarRating(botId, baseGain) {
  st.stars = st.stars || {};
  const s = st.stars[botId] || { received: 0, total: 0 };
  const mult = s.total < 50 ? 1 : Math.pow(0.5, Math.floor((s.total - 50) / 50));
  s.received = Math.round((s.received + baseGain * mult) * 100) / 100;
  s.total += 1;
  const rating = s.total > 0 ? Math.min(5, s.received / s.total * 5) : 0;
  s.rating = Math.round(rating * 100) / 100;
  st.stars[botId] = s;
  // ricalcola media globale
  const allRatings = Object.keys(st.stars).map(id => st.stars[id].rating || 0).filter(r => r > 0);
  st.globalAvg = allRatings.length > 0 ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 100) / 100 : 0;
  save();
  return s.rating;
}
function getStarTier(rating) {
  if (rating >= 4.5) return { tier: 'diamond', icon: '💎', label: 'Diamond' };
  if (rating >= 3.5) return { tier: 'platinum', icon: '🏆', label: 'Platinum' };
  if (rating >= 2.5) return { tier: 'gold', icon: '🥇', label: 'Gold' };
  if (rating >= 1.5) return { tier: 'silver', icon: '🥈', label: 'Silver' };
  return { tier: 'bronze', icon: '🥉', label: 'Bronze' };
}

/* ============ PET COMPANION ============ */
const PET_TRICKS = {
  wave: { id: 'wave', emoji: '👋', label: 'Ciao', unlock: 1 },
  dance: { id: 'dance', emoji: '🕺', label: 'Ballo', unlock: 2 },
  spin: { id: 'spin', emoji: '🔄', label: 'Giro', unlock: 3 },
  jump: { id: 'jump', emoji: '🤸', label: 'Salto', unlock: 4 },
  fly: { id: 'fly', emoji: '🕊️', label: 'Volo', unlock: 6 }
};
const MAX_PETS = 3;
const PET_HUNGER_RATE = 0.3;
const PET_HAPPINESS_RATE = -0.2;

function adoptPet(speciesId) {
  if (st.pets.length >= MAX_PETS) { toast('🐾 Hai già 3 animali! Rilasciane uno per adottarne un altro.'); return; }
  const sp = D.species.find(s => s.id === speciesId);
  if (!sp) return;
  const names = { unicorn: ['Arcidrago', 'Stellino', 'Luminoso'], pegasus: ['Cielo', 'Vento', 'Alato'], dragon: ['Fiamma', 'Drago', 'Furioso'], fire_snake: ['Serpente', 'Fuoco', 'Luminoso'], crocodile: ['Tropicale', 'Acqua', 'Verde'], snow_tiger: ['Neve', 'Bianco', 'Freddo'], iguana: ['Isla', 'Verde', 'Veloce'], macaw: ['Rosso', 'Ara', 'Piume'], parrot: ['Colorato', 'Canta', 'Pappagallo'], rhino: ['Corna', 'Forte', 'Ruggine'], elephant: ['Saggio', 'Gigante', 'Portatore'], flamingo: ['Rosa', 'Gentile', 'Neon'] };
  const nameList = names[speciesId] || ['Amico'];
  const name = nameList[Math.floor(Math.random() * nameList.length)];
   st.pets.push({ species: speciesId, name, level: 1, happiness: 80, hunger: 20, tricks: ['wave'], color: sp.color, born: Date.now(), care: { feedCount: 0, playCount: 0, petCount: 0, totalTime: 0 }, evolutionStage: 'normal', parent1: null, parent2: null });
  toast('🐾 Adottato ' + sp.emoji + ' ' + name + '! Visita il Nido per curarlo.');
  renderPets(); save();
}
function getPet(i) { return st.pets[i]; }
function getSpecies(pet) { return D.species.find(s => s.id === pet.species) || D.species[0]; }
function petFeed(i) {
  const pet = st.pets[i]; if (!pet) return;
  pet.hunger = Math.max(0, pet.hunger - 30);
  pet.happiness = Math.min(100, pet.happiness + 10);
  pet.level = Math.min(6, Math.floor(pet.happiness / 20) + 1);
  if (pet.happiness >= 80 && !pet.tricks.includes('dance')) { pet.tricks.push('dance'); toast('🕺 Trucco sbloccato: Ballo!'); }
  toast('🍖 ' + pet.name + ' è sazio! Felicità: ' + Math.round(pet.happiness));
  renderPets(); save();
}
function petPlay(i) {
  const pet = st.pets[i]; if (!pet) return;
  pet.happiness = Math.min(100, pet.happiness + 20);
  pet.hunger = Math.min(100, pet.hunger + 5);
  if (pet.happiness >= 60 && !pet.tricks.includes('spin')) { pet.tricks.push('spin'); toast('🔄 Trucco sbloccato: Giro!'); }
  spawnFx(player.x + 20, player.y - 20, '✨', 15);
  toast('🎾 ' + pet.name + ' si diverte! Felicità: ' + Math.round(pet.happiness));
  renderPets(); save();
}
function petPet(i) {
  const pet = st.pets[i]; if (!pet) return;
  pet.happiness = Math.min(100, pet.happiness + 5);
  if (Math.random() < 0.3) { const sp = getSpecies(pet); toast('🐾 ' + pet.name + ' ti fa le smorfie! ' + sp.emoji); }
  save(); renderPets();
}
function petTrick(i, trickId) {
  const pet = st.pets[i]; if (!pet) return;
  const trick = PET_TRICKS[trickId]; if (!trick || !pet.tricks.includes(trickId)) return;
  pet.happiness = Math.min(100, pet.happiness + 15);
  spawnFx(pet.x || player.x + 15, pet.y || player.y - 30, trick.emoji, 15);
  if (trickId === 'dance') { toast('🕺 ' + pet.name + ' balla!'); }
  if (trickId === 'spin') { toast('🔄 ' + pet.name + ' gira!'); }
  if (trickId === 'fly') { toast('🕊️ ' + pet.name + ' vola!'); }
  if (trickId === 'wave') { toast('👋 ' + pet.name + ' saluta!'); }
  if (trickId === 'jump') { toast('🤸 ' + pet.name + ' salta!'); }
  save(); renderPets();
}
function updatePets(dt) {
  st.pets.forEach(pet => {
    pet.hunger = Math.min(100, pet.hunger + PET_HUNGER_RATE * dt);
    pet.happiness = Math.max(0, Math.min(100, pet.happiness + PET_HAPPINESS_RATE * dt));
    pet.level = Math.min(6, Math.floor(pet.happiness / 20) + 1);
  });
}
function renderPets() {
     const pc = $('pcChip');
     if (!pc) return;
     let html = '';
     for (let i = 0; i < Math.min(MAX_PETS, st.pets.length); i++) {
       const pet = st.pets[i];
       const sp = getSpecies(pet);
       const evo = pet.evolutionStage === 'evolved' ? ' ✨' : '';
       const care = pet.care ? (pet.care.feedCount + pet.care.playCount + pet.care.petCount) : 0;
       const canEvolve = pet.level >= 5 && pet.happiness >= 90 && pet.hunger >= 70 && pet.tricks.length >= 3 && care >= 5;
       html += '<span class="petc" title="' + pet.name + ' (' + sp.tier + ')' + (canEvolve ? ' ✨ Evolvibile' : '') + '">' + sp.emoji + ' ' + pet.name + evo + ' ❤' + Math.round(pet.happiness) + ' 🍖' + Math.round(pet.hunger) + '</span>';
     }
     pc.innerHTML = html || '<span style="opacity:.5">🐾 Nessun animale</span>';
   }

/* ==================== BREEDING / ALLEVAMENTO ==================== */

function canBreed(pet1, pet2) {
    if (!pet1 || !pet2) return false;
    if (pet1 === pet2) return false;
    if (pet1.level < 2 || pet2.level < 2) return false;
    if (pet1.happiness < 50 || pet2.happiness < 50) return false;
    const key = [pet1.species, pet2.species].sort().join('+');
    if (st.breeding.cooldowns[key] && Date.now() - st.breeding.cooldowns[key] < (D.breeding.breedingCooldown || 300000)) {
      return false;
    }
    return true;
}

function getHybridResult(species1, species2) {
    const pair = [species1, species2].sort();
    const combo = pair.join('+');
    const comb = D.breeding.breedingCombinations.find(c => {
      const cSorted = [c[0], c[1]].sort();
      return cSorted[0] === pair[0] && cSorted[1] === pair[1];
    });
    if (comb) {
      const hybridId = comb[2];
      const hn = D.breeding.hybridNames[hybridId] || { name: 'Ibrido', emoji: '🥚', color: '#fff', tier: 'raro', hint: '' };
      return { species: hybridId, ...hn };
    }
    return null;
}

function breedPets(i, j) {
    const pet1 = st.pets[i]; if (!pet1) return;
    const pet2 = st.pets[j]; if (!pet2) return;
    if (!canBreed(pet1, pet2)) { toast('⚠️ Non puoi allevare questi pet!'); return; }
    const result = getHybridResult(pet1.species, pet2.species);
    if (!result) { toast('⚠️ Questi pet non possono produrre un ibrido!'); return; }
    const key = [pet1.species, pet2.species].sort().join('+');
    st.breeding.cooldowns[key] = Date.now();
    st.breeding.totalBreeds++;
    const egg = { species: result.species, name: result.name, emoji: result.emoji, color: result.color, tier: result.tier, hint: result.hint, parent1: pet1.species, parent2: pet2.species, level: 1, happiness: 80, hunger: 20, tricks: ['wave'], born: Date.now(), isEgg: true };
    st.breeding.eggs.push(egg);
    toast('🥚 Uovo di ' + result.name + ' creato! Va schiuso nel Nido.');
    save(); renderPets(); updateHUD(); renderBreedingUI();
}

function hatchEgg(eggIdx) {
    if (eggIdx < 0 || eggIdx >= st.breeding.eggs.length) return;
    const egg = st.breeding.eggs[eggIdx];
    const sp = D.species.find(s => s.id === egg.species) || D.breeding.hybridNames[egg.species];
    if (!sp) { toast('⚠️ Specie sconosciuta!'); return; }
    const names = D.species.find(s => s.id === egg.parent1) ? ['Piccolo', 'Bambino', 'Neonato'] : ['Uovo', 'Nascita', 'Piccolo'];
    const name = names[Math.floor(Math.random() * names.length)];
    st.pets.push({ species: egg.species, name, level: 1, happiness: 80, hunger: 20, tricks: ['wave'], color: egg.color, born: Date.now(), care: { feedCount: 0, playCount: 0, petCount: 0, totalTime: 0 }, evolutionStage: 'normal', parent1: egg.parent1, parent2: egg.parent2 });
    st.breeding.eggs.splice(eggIdx, 1);
    st.breeding.totalHatchings++;
    if (st.pets.length > MAX_PETS) { st.pets.shift(); }
    toast('🐾 ' + name + ' è nato! (' + (sp.emoji || sp.emoticon || '') + ' ' + (sp.name || egg.species) + ')');
    save(); renderPets(); updateHUD(); renderBreedingUI();
}

function evolvePet(i) {
    const pet = st.pets[i]; if (!pet) return;
    const req = D.breeding.evolutionReq;
    if (!pet.care) pet.care = { feedCount: 0, playCount: 0, petCount: 0, totalTime: 0 };
    if (pet.level < req.level || pet.happiness < req.happiness || pet.hunger < req.hunger || pet.tricks.length < req.tricks || (pet.care.feedCount + pet.care.playCount + pet.care.petCount) < req.careTotal) {
      toast('🔒 Requisiti non soddisfatti!'); return;
    }
    if (pet.evolutionStage === 'evolved') { toast('✅ Già evoluto!'); return; }
    pet.evolutionStage = 'evolved';
    const sp = getSpecies(pet);
    const evolvedName = sp.name + ' Evoluto';
    pet.name = evolvedName;
    pet.level = Math.min(6, pet.level + 1);
    pet.happiness = 100;
    pet.hunger = 100;
    st.breeding.totalEvolves++;
    toast('✨ ' + pet.name + ' è evoluto! Livello ' + pet.level + ' 🌟');
    save(); renderPets(); updateHUD();
}

function updatePetCare(i, action) {
    const pet = st.pets[i]; if (!pet) return;
    if (!pet.care) pet.care = { feedCount: 0, playCount: 0, petCount: 0, totalTime: 0 };
    pet.care.totalTime += 1;
    if (action === 'feed') pet.care.feedCount++;
    if (action === 'play') pet.care.playCount++;
    if (action === 'pet') pet.care.petCount++;
}

 function renderBreedingUI() {
     const nb = $('nestBody'); if (!nb) return;
     let tabEl = $('nestTab_breeding');
     if (!tabEl) return;
     let html = '';
     if (st.breeding.eggs.length > 0) {
       html += '<div class="gtitle">🥚 Uova (' + st.breeding.eggs.length + ')</div>';
       st.breeding.eggs.forEach((egg, ei) => {
         const sp = D.breeding.hybridNames[egg.species] || D.species.find(s => s.id === egg.species);
         const parent1 = D.species.find(s => s.id === egg.parent1);
         const parent2 = D.species.find(s => s.id === egg.parent2);
         html += '<div style="background:rgba(255,209,102,.08);border:1.5px solid #ffd166;border-radius:12px;padding:10px;margin-bottom:8px">';
         html += '<div style="display:flex;align-items:center;gap:8px">';
         html += '<span style="font-size:1.5rem">' + (sp ? sp.emoji : '🥚') + '</span>';
         html += '<div style="flex:1"><div style="font-weight:800;color:#fff">' + (sp ? sp.name : egg.species) + '</div>';
         html += '<div style="font-size:.72rem;color:#8a7fb8">Genitori: ' + (parent1 ? parent1.emoji : '?') + ' + ' + (parent2 ? parent2.emoji : '?') + '</div></div>';
         html += '<button class="mini" data-hatch="' + ei + '" style="background:linear-gradient(135deg,#ffd166,#ff9f43);color:#4a2c00">🥚 Schiusa</button></div></div>';
       });
     } else {
       html += '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:8px">Nessuna uovo. Alleva due pet per creare un ibrido!</div>';
     }
     tabEl.innerHTML = html;
     tabEl.querySelectorAll('[data-hatch]').forEach(btn => {
       btn.onclick = () => hatchEgg(parseInt(btn.dataset.hatch));
     });
   }

function openNest() {
    const el = $('sNest');
    closeAllSheets();
    el.classList.add('on');
    renderNest();
    renderBreedingUI();
}

 function openFsOverlay() {
  const el = $('fsOverlay');
  closeAllSheets();
  el.classList.add('on');
  renderFashionShow();
}
 function renderNest() {
   const nb = $('nestBody');
   if (!nb) return;
   let html = '';
   html += '<div id="nestTabs" style="display:flex;gap:4px;margin-bottom:12px">';
   html += '<button class="mini nestTab" data-tab="adopt" style="background:rgba(91,59,214,.3);color:#fff">🏠 Adotta</button>';
   html += '<button class="mini nestTab" data-tab="breeding" style="background:rgba(255,255,255,.1);color:#fff">🔬 Allevamento</button>';
   html += '</div>';
   html += '<div id="nestTab_adopt">';
   D.species.forEach(sp => {
     const owned = st.pets.filter(p => p.species === sp.id).length;
     html += '<div class="nspecies" data-species="' + sp.id + '" title="' + sp.hint + '">' +
       '<span class="ns-emoji">' + sp.emoji + '</span>' +
       '<span class="ns-name">' + sp.name + '</span>' +
       '<span class="ns-tier" style="color:' + (sp.tier === 'comune' ? '#3ddc97' : sp.tier === 'raro' ? '#ffd166' : sp.tier === 'epico' ? '#ff5d9e' : '#ffd166') + '">' + sp.tier + '</span>' +
       '<span class="ns-owned">' + (owned > 0 ? '✅ x' + owned : 'Adotta') + '</span>' +
     '</div>';
   });
   html += '</div>';
   html += '<div id="nestTab_breeding" style="display:none">';
   html += '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:8px">Seleziona 2 pet per allevare → 🥚 Uovo ibrido</div>';
   if (st.pets.length >= 2) {
     html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">';
     st.pets.forEach((pet, i) => {
       const sp = getSpecies(pet);
       html += '<div style="background:rgba(91,59,214,.1);border:1px solid #5b3bd6;border-radius:8px;padding:6px 10px;cursor:pointer" data-breed-pet="' + i + '">' +
         '<span style="font-size:1.2rem">' + sp.emoji + '</span> ';
       html += '<span style="font-size:.78rem;color:#fff">' + pet.name + '</span> ';
       html += '<span style="font-size:.7rem;color:#8a7fb8">Lv' + pet.level + '</span></div>';
     });
     html += '</div>';
     html += '<button class="mini" id="nestBreedBtn" style="background:linear-gradient(135deg,#ffd166,#ff9f43);color:#4a2c00">🥚 Alleva!</button>';
   } else {
     html += '<div style="font-size:.78rem;color:#8a7fb8">Hai bisogno di almeno 2 pet per allevare!</div>';
   }
   html += '</div>';
   nb.innerHTML = html;
   nb.querySelectorAll('.nspecies').forEach(el => {
     el.onclick = () => {
       const sid = el.dataset.species;
       if (st.pets.length >= MAX_PETS) { toast('🐾 Hai già 3 animali!'); return; }
       showAdoptConfirm(sid);
     };
   });
   nb.querySelectorAll('[data-breed-pet]').forEach(el => {
     el.onclick = () => {
       const idx = parseInt(el.dataset.breedPet);
       selectBreedPet(idx);
     };
   });
   const breedBtn = $('nestBreedBtn');
   if (breedBtn) breedBtn.onclick = () => { breedTwoPets(); };
   // tab switching
   nb.querySelectorAll('.nestTab').forEach(btn => {
     btn.onclick = () => {
       nb.querySelectorAll('.nestTab').forEach(b => b.style.background = 'rgba(255,255,255,.1)');
       btn.style.background = 'rgba(91,59,214,.3)';
       const tab = btn.dataset.tab;
       nb.querySelectorAll('[id^="nestTab_"]').forEach(t => t.style.display = 'none');
       const tabEl = $('nestTab_' + tab);
       if (tabEl) tabEl.style.display = '';
     };
   });
 }

function showAdoptConfirm(speciesId) {
  const sp = D.species.find(s => s.id === speciesId);
  if (!sp) return;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:200;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = '<div style="background:#fff;border-radius:18px;padding:28px 24px;max-width:320px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.4);border:2px solid #e7e0ff">' +
    '<div style="font-size:56px;margin-bottom:8px">' + sp.emoji + '</div>' +
    '<div style="font-size:1.1rem;font-weight:700;margin-bottom:6px">Adottare ' + sp.name + '?</div>' +
    '<div style="font-size:.82rem;color:#8a7fb8;margin-bottom:16px">' + sp.hint + '<br>Livello: ' + sp.tier + '</div>' +
    '<div style="display:flex;gap:10px;justify-content:center">' +
    '<button class="mini" id="adoptYes">✅ Adotta</button>' +
    '<button class="mini" id="adoptNo" style="background:#f0e6ff;color:#8a7fb8">Annulla</button>' +
    '</div></div>';
  document.body.appendChild(overlay);
  $('adoptYes').onclick = () => { overlay.remove(); adoptPet(speciesId); };
  $('adoptNo').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

let selectedBreedPet = -1;
function selectBreedPet(idx) {
  selectedBreedPet = idx;
  toast('🐾 Pet selezionato: ' + st.pets[idx].name + '. Seleziona il secondo pet.');
}
function breedTwoPets() {
  if (st.pets.length < 2) { toast('🐾 Hai bisogno di almeno 2 pet!'); return; }
  if (selectedBreedPet < 0) { toast('🐾 Seleziona prima un pet dall\'elenco!'); return; }
  const otherIdx = st.pets.findIndex((p, i) => i !== selectedBreedPet);
  if (otherIdx < 0) { toast('🐾 Seleziona un altro pet!'); return; }
  breedPets(selectedBreedPet, otherIdx);
  selectedBreedPet = -1;
}

function renderPetMenu(i) {
  const pet = st.pets[i]; if (!pet) return;
  const sp = getSpecies(pet);
  const tricksHtml = pet.tricks ? pet.tricks.map(t => { const tr = PET_TRICKS[t]; return tr ? '<button class="mini" data-trick="' + t + '">' + tr.emoji + ' ' + tr.label + '</button>' : ''; }).join('') : '';
  const menu = document.createElement('div');
  menu.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.97);border:2px solid #e7e0ff;border-radius:16px;padding:14px;z-index:50;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;box-shadow:0 10px 30px rgba(60,20,120,.4);min-width:300px';
  menu.innerHTML =
    '<div style="font-size:28px;margin-right:8px">' + sp.emoji + '</div>' +
    '<div style="flex:1;min-width:120px"><b>' + pet.name + '</b><br><span style="font-size:.72rem">Livello ' + pet.level + ' · ❤️ ' + Math.round(pet.happiness) + ' · 🍖 ' + Math.round(pet.hunger) + '</span></div>' +
    '<button class="mini" data-pet="pet" data-idx="' + i + '">🐾 Petta</button>' +
    '<button class="mini" data-pet="feed" data-idx="' + i + '">🍖 Nutrisci</button>' +
    '<button class="mini" data-pet="play" data-idx="' + i + '">🎾 Gioca</button>' +
    '<button class="mini" data-pet="rename" data-idx="' + i + '">✏️ Ribat.</button>' +
    '<div style="width:100%;text-align:center;font-size:.72rem;color:#8a7fb8;margin-top:4px">Trucco: ' + pet.tricks.map(t => { const tr = PET_TRICKS[t]; return tr ? tr.emoji : ''; }).join(' ') + '</div>';
  document.body.appendChild(menu);
  menu.querySelectorAll('[data-pet]').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.idx);
      const action = btn.dataset.pet;
      if (action === 'pet') petPet(idx);
      else if (action === 'feed') petFeed(idx);
      else if (action === 'play') petPlay(idx);
      else if (action === 'rename') { showRenameDialog(idx); }
      menu.remove();
    };
  });
  setTimeout(() => menu.remove(), 8000);
}

function showRenameDialog(idx) {
  const pet = st.pets[idx];
  if (!pet) return;
  const sp = getSpecies(pet);
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:200;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = '<div style="background:#fff;border-radius:18px;padding:28px 24px;max-width:320px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.4);border:2px solid #e7e0ff">' +
    '<div style="font-size:48px;margin-bottom:8px">' + sp.emoji + '</div>' +
    '<div style="font-size:1rem;font-weight:700;margin-bottom:12px">Rinomina ' + pet.name + '</div>' +
    '<input id="renameInput" type="text" value="' + pet.name + '" maxlength="16" style="width:100%;padding:10px 12px;border-radius:10px;border:2px solid #e7e0ff;font-size:1rem;text-align:center;outline:none;box-sizing:border-box">' +
    '<div style="display:flex;gap:10px;justify-content:center;margin-top:14px">' +
    '<button class="mini" id="renameOk">✅ Salva</button>' +
    '<button class="mini" id="renameNo" style="background:#f0e6ff;color:#8a7fb8">Annulla</button>' +
    '</div></div>';
  document.body.appendChild(overlay);
  const inp = $('renameInput');
  if (inp) { inp.focus(); inp.select(); }
  function doRename() {
    const n = inp ? inp.value.trim() : '';
    if (n && n !== pet.name) {
      st.pets[idx].name = n;
      toast('✏️ Rinominato in ' + n);
      save();
    }
    overlay.remove();
  }
  $('renameOk').onclick = doRename;
  $('renameNo').onclick = () => overlay.remove();
  if (inp) inp.onkeydown = (e) => { if (e.key === 'Enter') doRename(); if (e.key === 'Escape') overlay.remove(); };
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

function petFollow(pet, dt) {
  const px = player.x, py = player.y;
  const idx = st.pets.indexOf(pet);
  const offsetX = idx * 25;
  pet.x = pet.x !== undefined ? pet.x + (px + 15 + offsetX - pet.x) * 0.1 : px + 15 + offsetX;
  pet.y = pet.y !== undefined ? pet.y + (py - 25 - pet.y) * 0.1 : py - 25;
  pet._ph = (pet._ph || 0) + dt * 8;
}

/* ============ MYSTERY DETECTIVE MODE ============ */
function getMysteryData(id) { return D.mysteries ? D.mysteries.find(m => m.id === id) : null; }
function getCurrentMystery() { return getMysteryData(st.mystery.active); }
function isMysterySolved(id) { return st.mystery.solved.includes(id); }
function isClueFound(mysteryId, clueId) { return (st.mystery.cluesFound[mysteryId] || []).includes(clueId); }
function getMysteryProgress(mysteryId) {
  const m = getMysteryData(mysteryId);
  if (!m) return { found: 0, total: 0 };
  const found = (st.mystery.cluesFound[mysteryId] || []).length;
  return { found, total: m.clues.length };
}
function getNextMystery() {
  if (!D.mysteries) return null;
  for (const m of D.mysteries) {
    if (!isMysterySolved(m.id)) return m;
  }
  return null;
}

function startMystery(id) {
  const m = getMysteryData(id);
  if (!m || isMysterySolved(id)) return;
  st.mystery.active = id;
  st.mystery.currentStep = 0;
  if (!st.mystery.cluesFound[id]) st.mystery.cluesFound[id] = [];
  save();
  toast(m.emoji + ' ' + m.name + ' iniziato! Esplora le stanze per trovare indizi.');
  updateMysteryChip();
}

function findClue(mysteryId, clueId) {
  if (isClueFound(mysteryId, clueId)) return;
  const m = getMysteryData(mysteryId);
  if (!m) return;
  const clue = m.clues.find(c => c.id === clueId);
  if (!clue) return;
  if (!st.mystery.cluesFound[mysteryId]) st.mystery.cluesFound[mysteryId] = [];
  st.mystery.cluesFound[mysteryId].push(clueId);
  st.mystery.currentStep = st.mystery.cluesFound[mysteryId].length;
  save();
  showClueOverlay(clue, getMysteryProgress(mysteryId));
  updateMysteryChip();
}

function answerMystery(answer) {
  const m = getCurrentMystery();
  if (!m) return;
  const normalized = answer.toLowerCase().trim();
  const correct = m.answers.some(a => normalized.includes(a.toLowerCase()));
  if (!correct) {
    toast('❌ Risposta sbagliata! Continua a cercare indizi...');
    return;
  }
  // solved!
  st.mystery.solved.push(m.id);
  st.mystery.active = null;
  st.mystery.currentStep = 0;
  // rewards
  addCoins(m.rewardCoins);
  if (m.rewardAcc && !st.ownedAcc.includes(m.rewardAcc)) {
    st.ownedAcc.push(m.rewardAcc);
    st.outfit.acc = m.rewardAcc;
    toast('🔍 Accessorio sbloccato: Lente d\'ingrandimento!');
  }
  if (m.rewardTitle) unlockTitle(m.rewardTitle);
  unlockAch('mystery_solved');
  if (st.mystery.solved.length >= 5) unlockAch('all_mysteries');
  // unlock secret room after mystery_2
  if (m.id === 'mystery_2') toast('🔐 Stanza Segreta sbloccata!');
  save();
  toast(m.emoji + ' Mistero risolto! + ' + m.rewardCoins + ' 🪙');
  updateMysteryChip();
  renderMysterySheet();
}

function showClueOverlay(clue, progress) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeIn .3s';
  overlay.innerHTML = '<div style="background:#1a1a2e;border-radius:18px;padding:28px 24px;max-width:340px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.5);border:2px solid #5b3bd6">' +
    '<div style="font-size:56px;margin-bottom:8px;animation:bounceIn .5s">' + clue.emoji + '</div>' +
    '<div style="font-size:1.1rem;font-weight:700;margin-bottom:6px;color:#ffd166">Indizio Trovato!</div>' +
    '<div style="font-size:.85rem;color:#e7e0ff;margin-bottom:12px">' + clue.desc + '</div>' +
    '<div style="font-size:.75rem;color:#8a7fb8;margin-bottom:14px">Progresso: ' + progress.found + '/' + progress.total + ' indizi</div>' +
    '<button class="mini" id="clueOk" style="min-width:120px">Continua</button>' +
    '</div>';
  document.body.appendChild(overlay);
  $('clueOk').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

function renderMysterySheet() {
  const body = $('mysteryBody');
  if (!body) return;
  let h = '';
  if (!D.mysteries) { body.innerHTML = '<div style="padding:20px;text-align:center;color:#8a7fb8">Nessun mistero disponibile</div>'; return; }
  const next = getNextMystery();
  D.mysteries.forEach(m => {
    const solved = isMysterySolved(m.id);
    const active = st.mystery.active === m.id;
    const progress = getMysteryProgress(m.id);
    const locked = !solved && !active && m !== next;
    const statusEmoji = solved ? '✅' : active ? '🔍' : locked ? '🔒' : '🔓';
    h += '<div class="mystery-card' + (solved ? ' solved' : active ? ' active' : locked ? ' locked' : '') + '" data-mystery="' + m.id + '" style="background:' + (solved ? 'rgba(61,220,151,.15)' : active ? 'rgba(91,59,214,.15)' : 'rgba(255,255,255,.05)') + ';border:1.5px solid ' + (solved ? '#3ddc97' : active ? '#5b3bd6' : locked ? '#444' : '#e7e0ff') + ';border-radius:14px;padding:14px;margin-bottom:10px;cursor:' + (locked ? 'not-allowed' : 'pointer') + '">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      '<span style="font-size:28px">' + m.emoji + '</span>' +
      '<div style="flex:1">' +
      '<div style="font-weight:800;color:#fff;font-size:.95rem">' + statusEmoji + ' ' + m.name + '</div>' +
      '<div style="font-size:.75rem;color:#8a7fb8;margin-top:2px">' + m.desc + '</div>' +
      '</div>' +
      '<div style="text-align:right">' +
      (solved ? '<span style="color:#3ddc97;font-size:.75rem">✅ Completato</span>' :
        active ? '<span style="color:#ffd166;font-size:.75rem">' + progress.found + '/' + progress.total + ' indizi</span>' :
          locked ? '<span style="color:#666;font-size:.75rem">🔒 Risolvi il precedente</span>' :
            '<span style="color:#5b3bd6;font-size:.75rem">▶ Inizia</span>') +
      '</div></div>' +
      (active && progress.found >= m.clues.length ? '<div style="margin-top:10px;text-align:center"><button class="mini answerBtn" data-mystery="' + m.id + '" style="background:linear-gradient(135deg,#ffd166,#ff9f43);color:#4a2c00">🧠 Rispondi alla domanda</button></div>' : '') +
      '</div>';
  });
  body.innerHTML = h;
  // wire up clicks
  body.querySelectorAll('.mystery-card').forEach(el => {
    el.onclick = () => {
      const mid = el.dataset.mystery;
      const m = getMysteryData(mid);
      if (!m) return;
      if (isMysterySolved(mid)) { toast('✅ Già risolto!'); return; }
      if (st.mystery.active && st.mystery.active !== mid) { toast('⚠️ Completa prima il mistero attivo!'); return; }
      if (!isMysterySolved(mid) && !st.mystery.active) { startMystery(mid); renderMysterySheet(); }
    };
  });
  body.querySelectorAll('.answerBtn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      renderAnswerSheet(getMysteryData(btn.dataset.mystery));
    };
  });
}

function renderAnswerSheet(m) {
  if (!m) return;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeIn .3s';
  overlay.innerHTML = '<div style="background:#1a1a2e;border-radius:18px;padding:28px 24px;max-width:380px;width:90%;box-shadow:0 12px 40px rgba(0,0,0,.5);border:2px solid #5b3bd6">' +
    '<div style="font-size:40px;margin-bottom:8px">' + m.emoji + '</div>' +
    '<div style="font-size:1.05rem;font-weight:700;margin-bottom:8px;color:#ffd166">' + m.name + '</div>' +
    '<div style="font-size:.85rem;color:#e7e0ff;margin-bottom:14px;line-height:1.5">' + m.question + '</div>' +
    '<input id="answerInput" type="text" placeholder="La tua risposta..." style="width:100%;padding:12px;border-radius:12px;border:2px solid #5b3bd6;background:rgba(255,255,255,.1);color:#fff;font-size:1rem;text-align:center;outline:none;box-sizing:border-box">' +
    '<div style="display:flex;gap:10px;justify-content:center;margin-top:14px">' +
    '<button class="mini" id="answerOk" style="background:linear-gradient(135deg,#ffd166,#ff9f43);color:#4a2c00;min-width:100px">✅ Rispondi</button>' +
    '<button class="mini" id="answerNo" style="background:#2a2a4e;color:#8a7fb8">Annulla</button>' +
    '</div></div>';
  document.body.appendChild(overlay);
  const inp = $('answerInput');
  if (inp) { inp.focus(); }
  function doAnswer() {
    const val = inp ? inp.value.trim() : '';
    if (!val) return;
    overlay.remove();
    answerMystery(val);
    renderMysterySheet();
  }
  $('answerOk').onclick = doAnswer;
  $('answerNo').onclick = () => overlay.remove();
  if (inp) inp.onkeydown = (e) => { if (e.key === 'Enter') doAnswer(); if (e.key === 'Escape') overlay.remove(); };
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

function updateMysteryChip() {
  const chip = $('mysteryChip');
  if (!chip) return;
  const m = getCurrentMystery();
  if (m) {
    const progress = getMysteryProgress(m.id);
    chip.style.display = '';
    chip.textContent = m.emoji + ' ' + progress.found + '/' + progress.total;
  } else if (getNextMystery()) {
    chip.style.display = '';
    chip.textContent = '🔍 Mistero';
  } else {
    chip.style.display = 'none';
  }
}

function getRoomClues(roomId) {
  if (!st.mystery.active || !D.mysteries) return [];
  const m = getCurrentMystery();
  if (!m) return [];
  return m.clues.filter(c => c.room === roomId && !isClueFound(m.id, c.id));
}

 function checkMysteryClue() {
   if (!st.mystery.active) return;
   // regular room clues
   const roomClues = getRoomClues(st.room);
   if (roomClues.length > 0) {
     findClue(st.mystery.active, roomClues[0].id);
   }
   // dimension puzzle clues
   const dimPuzzles = D.mysteries ? D.mysteries.filter(m => m.id && m.id.startsWith('mystery_') && m.id.endsWith('_1')) : [];
   dimPuzzles.forEach(mp => {
     if (!isMysterySolved(mp.id) && mp.clues) {
       mp.clues.forEach(c => {
         if (!isClueFound(mp.id, c.id)) {
           // auto-find clue if in dimension room
           const dim = mp.id.replace('mystery_', '').replace('_1', '');
           if (st.room.startsWith(dim + '_') || st.room === 'atrio_' + dim) {
             findClue(mp.id, c.id);
           }
         }
       });
     }
   });
   // manager unlock
   if (st.mystery.solved.includes('mystery_3') && !st.manager.unlocked) {
     st.manager.unlocked = true;
     st.manager.budget = 500;
     toast('💰 Hotel Tycoon sbloccato! Budget iniziale: 500 🪙');
     save();
     updateHUD();
   }
 }

/* ============ SEASONAL EVENTS ============ */
function getSeasonalEvent() {
  if (!D.seasonalEvents) return null;
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = mm + '-' + dd;
  return D.seasonalEvents.find(ev => {
    if (todayStr >= ev.startDate && todayStr <= ev.endDate) return true;
    if (todayStr >= ev.announceStart && todayStr < ev.startDate) return true;
    return false;
  }) || null;
}
function isEventActive(eventId) {
  const ev = getSeasonalEvent();
  return ev && ev.id === eventId && ev.startDate <= (String((new Date().getMonth()+1)).padStart(2,'0') + '-' + String(new Date().getDate()).padStart(2,'0'));
}
function isEventAnnounced(eventId) {
  const ev = getSeasonalEvent();
  return ev && ev.id === eventId && ev.startDate > (String((new Date().getMonth()+1)).padStart(2,'0') + '-' + String(new Date().getDate()).padStart(2,'0'));
}
function getSeasonalProgress(eventId) {
  return st.seasonal.progress[eventId] || { phase: 'idle', day: 0, rewards: [] };
}
function updateSeasonalChip() {
  const chip = $('seasonalChip');
  if (!chip) return;
  const ev = getSeasonalEvent();
  if (ev) {
    const today = new Date();
    const endD = new Date(ev.endDate + '-' + today.getFullYear());
    const daysLeft = Math.ceil((endD - today) / 86400000);
    chip.style.display = '';
    chip.textContent = ev.emoji + ' ' + ev.name + ' (' + Math.max(0, daysLeft) + 'd)';
  } else {
    chip.style.display = 'none';
  }
}
/* Controllo stagionale: gira a ogni tick (1s).
   Avvia l'evento attivo, avvisa quando un evento sta per arrivare e
   chiude (con ricompense) quello a cui il giocatore ha partecipato. */
function checkSeasonal() {
  if (!st) return;
  if (!st.seasonal) st.seasonal = { active: null, progress: {}, completed: [], adventCalendar: {}, candyCollected: 0, eggsFound: 0, surfBest: 0 };
  const s = st.seasonal;
  if (!s.progress) s.progress = {};
  if (!Array.isArray(s.completed)) s.completed = [];
  if (!s.adventCalendar) s.adventCalendar = {};
  const ev = getSeasonalEvent();
  // l'evento attivo non è più quello corrente: se era finito, chiudilo
  if (s.active && (!ev || ev.id !== s.active)) {
    const prev = D.seasonalEvents ? D.seasonalEvents.find(e => e.id === s.active) : null;
    if (prev && !isEventActive(prev.id) && !s.completed.includes(prev.id) && s.progress[prev.id]) {
      completeSeasonal(prev.id);
    } else if (prev) {
      s.active = null;
      save();
    }
  }
  if (!ev) return;
  const today = new Date();
  const todayStr = String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  const phase = todayStr >= ev.startDate ? 'active' : 'soon';
  const key = ev.id + ':' + phase + ':' + today.getFullYear();
  if (s.notice === key) return;   // già notificato (una volta per fase/anno)
  s.notice = key;
  save();
  if (phase === 'active') {
    if (!s.completed.includes(ev.id)) startSeasonal(ev.id);
  } else {
    const [sm, sd] = ev.startDate.split('-').map(Number);
    const start = new Date(today.getFullYear(), sm - 1, sd);
    const days = Math.max(1, Math.round((start - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000));
    toast(ev.emoji + ' ' + ev.name + ' sta arrivando! Inizia tra ' + days + (days === 1 ? ' giorno' : ' giorni') + '.');
  }
  updateSeasonalChip();
}
function startSeasonal(eventId) {
  const ev = D.seasonalEvents ? D.seasonalEvents.find(e => e.id === eventId) : null;
  if (!ev || st.seasonal.completed.includes(eventId)) return;
  st.seasonal.active = eventId;
  if (!st.seasonal.progress[eventId]) st.seasonal.progress[eventId] = { phase: 'idle', day: 0, rewards: [] };
  if (eventId === 'christmas' && Object.keys(st.seasonal.adventCalendar || {}).length === 0) {
    st.seasonal.adventCalendar = {};
    for (let i = 1; i <= 24; i++) st.seasonal.adventCalendar[i] = false;
  }
  save();
  toast(ev.emoji + ' ' + ev.name + ' iniziato! ' + ev.desc);
  updateSeasonalChip();
}
function completeSeasonal(eventId) {
  if (st.seasonal.completed.includes(eventId)) return;
  st.seasonal.completed.push(eventId);
  const ev = D.seasonalEvents ? D.seasonalEvents.find(e => e.id === eventId) : null;
  if (!ev) return;
  if (ev.rewards.coins) addCoins(ev.rewards.coins);
  if (ev.rewards.accessory && !st.ownedAcc.includes(ev.rewards.accessory)) {
    st.ownedAcc.push(ev.rewards.accessory);
    st.outfit.acc = ev.rewards.accessory;
    toast('🎁 Accessorio sbloccato: ' + ev.rewards.accessory.replace(/_/g, ' '));
  }
  if (ev.rewards.title) unlockTitle(ev.rewards.title);
  unlockAch(ev.id + '_done');
  const totalEvents = D.seasonalEvents ? D.seasonalEvents.length : 0;
  if (st.seasonal.completed.length >= totalEvents) unlockAch('all_seasonal');
  if (st.seasonal.active === eventId) st.seasonal.active = null;
  save();
  toast(ev.emoji + ' ' + ev.name + ' completato! +' + ev.rewards.coins + ' 🪙');
  updateSeasonalChip();
  renderSeasonalSheet();
}
function renderSeasonalSheet() {
  const body = $('seasonalBody');
  if (!body) return;
  let h = '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:10px">Eventi stagionali attivi!</div>';
  if (!D.seasonalEvents) { body.innerHTML = '<div style="padding:20px;text-align:center;color:#8a7fb8">Nessun evento stagionale</div>'; return; }
  D.seasonalEvents.forEach(ev => {
    const active = isEventActive(ev.id);
    const announced = isEventAnnounced(ev.id);
    const completed = st.seasonal.completed.includes(ev.id);
    const today = new Date();
    const todayStr = String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
    const show = active || announced;
    const status = completed ? '✅ Completato' : active ? '🎮 Attivo' : announced ? '⏰ In arrivo' : '🔒 Prossimo';
    const statusColor = completed ? '#3ddc97' : active ? '#ffd166' : announced ? '#5b3bd6' : '#666';
    if (!show && !completed) return;
    h += '<div class="seasonal-card" data-event="' + ev.id + '" style="background:' + (active ? 'rgba(91,59,214,.12)' : completed ? 'rgba(61,220,151,.12)' : 'rgba(255,255,255,.05)') + ';border:1.5px solid ' + statusColor + ';border-radius:14px;padding:14px;margin-bottom:10px">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      '<span style="font-size:28px">' + ev.emoji + '</span>' +
      '<div style="flex:1">' +
      '<div style="font-weight:800;color:#fff;font-size:.95rem">' + ev.name + '</div>' +
      '<div style="font-size:.75rem;color:#8a7fb8;margin-top:2px">' + ev.desc + '</div>' +
      '</div>' +
      '<div style="text-align:right"><span style="color:' + statusColor + ';font-size:.75rem">' + status + '</span></div></div>' +
      '<div style="font-size:.7rem;color:#666;margin-top:6px">' + ev.startDate + ' → ' + ev.endDate + '</div>' +
      (active && ev.activities ? '<div style="margin-top:8px">' +
        ev.activities.map(a => '<button class="mini" data-activity="' + ev.id + '_' + a.id + '" style="margin:2px">' + a.emoji + ' ' + a.name + '</button>').join('') +
        '</div>' : '') + '</div>';
  });
  body.innerHTML = h;
  body.querySelectorAll('[data-activity]').forEach(btn => {
    btn.onclick = () => { const [eid, aid] = btn.dataset.activity.split('_'); startSeasonalActivity(eid, aid); };
  });
}
function startSeasonalActivity(eventId, activityId) {
  const ev = D.seasonalEvents ? D.seasonalEvents.find(e => e.id === eventId) : null;
  if (!ev) return;
  const activity = ev.activities.find(a => a.id === activityId);
  if (!activity) return;
  toast(ev.emoji + ' ' + activity.name + ': ' + activity.desc);
  if (activityId === 'advent_calendar') renderAdventCalendar();
  else if (activityId === 'costume_contest') startCostumeContest();
  else if (activityId === 'egg_hunt') { startEggHunt(); }
  else if (activityId === 'surf_minigame') startSurfMinigame();
  else if (activityId === 'secret_santa') startSecretSanta();
}
function renderAdventCalendar() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeIn .3s';
  overlay.innerHTML = '<div style="background:#1a1a2e;border-radius:18px;padding:24px;max-width:400px;width:90%;box-shadow:0 12px 40px rgba(0,0,0,.5);border:2px solid #e7e0ff">' +
    '<div style="font-size:2rem;margin-bottom:8px">🎄 Calendario Avvento</div>' +
    '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:14px">Apri una porta ogni giorno per ricevere ricompense!</div>' +
    '<div id="adventGrid" style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:14px"></div>' +
    '<button class="mini" id="adventClose" style="min-width:120px">Chiudi</button></div>';
  document.body.appendChild(overlay);
  renderAdventGrid();
  $('adventClose').onclick = () => overlay.remove();
}
function renderAdventGrid() {
  const grid = $('adventGrid');
  if (!grid) return;
  const today = new Date().getDate();
  let h = '';
  for (let i = 1; i <= 24; i++) {
    const opened = st.seasonal.adventCalendar[i];
    const todayAvailable = i <= today;
    const bg = opened ? 'rgba(61,220,151,.3)' : todayAvailable ? 'rgba(255,93,158,.3)' : 'rgba(255,255,255,.05)';
    const border = opened ? '#3ddc97' : todayAvailable ? '#ff5d9e' : '#444';
    const text = opened ? '✅' : todayAvailable ? '?' : '🔒';
    h += '<button class="mini" data-advent-day="' + i + '" style="background:' + bg + ';border:1.5px solid ' + border + ';font-size:1.2rem">' + text + '</button>';
  }
  grid.innerHTML = h;
  grid.querySelectorAll('[data-advent-day]').forEach(btn => {
    btn.onclick = () => {
      const day = parseInt(btn.dataset.adventDay);
      if (st.seasonal.adventCalendar[day] || day > today) return;
      st.seasonal.adventCalendar[day] = true;
      addCoins(5); save();
      toast('🎄 Giorno ' + day + ' aperto! +5 🪙');
      renderAdventGrid();
    };
  });
}
function startCostumeContest() {
  toast('🎃 Costume Contest! Scegli il tuo costume migliore!');
}
function startEggHunt() {
  toast('🥚 Caccia Uova! Cerca le uova nelle stanze!');
  spawnEggParticles();
}
function spawnEggParticles() {
  for (let i = 0; i < 10; i++) setTimeout(() => spawnFx(150+Math.random()*400, 150+Math.random()*250, '🥚', 20), i*500);
}
function startSurfMinigame() {
  toast('🌊 Surf! Premi le frecce al momento giusto!');
}
function startSecretSanta() {
  toast('🎁 Secret Santa! Spedisci un regalo oggi!');
  if (!st.seasonal.secretSanta) st.seasonal.secretSanta = {};
  const today = new Date().getDate();
  if (!st.seasonal.secretSanta[today]) {
    st.seasonal.secretSanta[today] = { sent: false, gift: '🧸' };
    toast('🎁 Il tuo Secret Santa di oggi ti aspetta!');
  }
}
function getSeasonalWeather() {
  const ev = getSeasonalEvent();
  if (!ev || !ev.weatherOverride) return null;
  return { type: ev.weatherOverride, color: ev.weatherColor };
}

/* ============ SOCIETÀ SEGRETA ============ */
const ACH_IDS = new Set((ACHIVE_DEFS || []).map(a => a.id));
function getTotalAchCount() { const defs = ACHIVE_DEFS || []; return defs.length; }
function getCompletedAchCount() { return Object.keys(st.ach || {}).filter(k => ACH_IDS.has(k) && k !== 'all_ach').length; }
function canEnterSotterraneo() { return getCompletedAchCount() >= (ACH_IDS.size - 1); }
function societyMissionHit(type) {
  if (!st.society) st.society = { keys: 0, dailyKeys: 0, marketDay: '', purchasedItems: [], missionsDone: [], reputation: 0, visited: false };
  st.society.missionProgress = st.society.missionProgress || {};
  st.society.missionProgress[type] = (st.society.missionProgress[type] || 0) + 1;
  (D.societyMissions || []).forEach((m, i) => {
    if (m.t !== type) return;
    if (st.society.missionProgress[type] >= m.n && !st.society.missionsDone.includes(m.t + '_' + i)) {
      st.society.missionsDone.push(m.t + '_' + i);
      st.society.reputation = (st.society.reputation || 0) + 10;
      toast('🗿 Missione segreta completata: ' + m.title);
    }
  });
  const n = st.society.missionsDone.length;
  if (n >= 1) unlockAch('society_first');
  if (n >= 5) unlockAch('society_5');
  if (n >= 5 && (st.society.reputation || 0) >= 100) unlockAch('society_10');
  save();
}
function addKeys(n) {
  if (!st.society) st.society = { keys: 0, dailyKeys: 0, marketDay: '', purchasedItems: [], missionsDone: [], reputation: 0, visited: false };
  st.society.keys += n;
  if (n > 0) { toast('🗝️ +' + n + ' Chiavi Oscure! Totale: ' + st.society.keys); societyMissionHit('keys'); }
  save();
}
function getTodayKey() {
  if (!st.society) return 0;
  const today = new Date().toDateString();
  if (st.society.marketDay === today) return 0;
  st.society.marketDay = today;
  st.society.dailyKeys = 1;
  st.society.keys += 1;
  save();
  societyMissionHit('keys');
  toast('🗝️ +1 Chiave Oscura per il giorno!');
  return 1;
}
function updateSocietyChip() {
   const chip = $('societyChip');
   if (!chip) return;
   if (st.society && st.society.keys > 0) {
     chip.style.display = '';
     chip.textContent = '🗝️ ' + st.society.keys;
   } else {
     chip.style.display = 'none';
   }
 }
 function updateNPCChip() {
   const chip = $('npcChip');
   if (!chip) return;
   const allBots = Object.keys(D.bots || {});
   let totalArcs = 0, totalUnlocked = 0;
   allBots.forEach(bid => {
     const f = st.friends[bid];
     if (f && f.arcs) {
       totalArcs += 5;
       totalUnlocked += ['sogno', 'paura', 'talento', 'relazioni', 'segreto'].filter(a => f.arcs[a]).length;
     }
   });
   if (totalUnlocked > 0) {
     chip.style.display = '';
     chip.textContent = '📖 ' + totalUnlocked + '/' + totalArcs;
   } else {
     chip.style.display = 'none';
   }
 }
function renderSocietySheet() {
  const body = $('societyBody');
  if (!body) return;
  if (!canEnterSotterraneo()) {
    body.innerHTML = '<div style="text-align:center;padding:24px;color:#8a7fb8">' +
      '<div style="font-size:3rem">🔒</div>' +
      '<div style="font-size:1.1rem;font-weight:800;margin-top:8px">Sotterraneo Bloccato</div>' +
      '<div style="font-size:.85rem;margin-top:6px">Completa tutti gli achievement per accedere</div>' +
      '<div style="font-size:.75rem;margin-top:12px">Achievement: ' + getCompletedAchCount() + '/' + getTotalAchCount() + '</div></div>';
    return;
  }
  let h = '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:10px">Il Sotterraneo ti attende 🌑</div>';
  h += '<div style="background:rgba(155,89,182,.15);border:1.5px solid #9b59b6;border-radius:14px;padding:14px;margin-bottom:14px">' +
    '<div style="font-size:2rem">🗝️ ' + st.society.keys + '</div>' +
    '<div style="font-size:.75rem;color:#8a7fb8">Chiavi Oscure</div></div>';
  const shop = D.shadowShop || [];
  shop.forEach((item, i) => {
    h += '<div style="background:rgba(255,255,255,.05);border:1.5px solid #444;border-radius:12px;padding:12px;margin-bottom:8px">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      '<span style="font-size:2rem">' + item.e + '</span>' +
      '<div style="flex:1">' +
      '<div style="font-weight:800;color:#fff;font-size:.9rem">' + item.name + '</div>' +
      '<div style="font-size:.7rem;color:#8a7fb8">' + item.desc + '</div>' +
      '</div>' +
      '<button class="mini" data-buy="' + i + '" style="background:linear-gradient(135deg,#9b59b6,#8e44ad);color:#fff">🗝️ ' + item.keys + '</button>' +
      '</div></div>';
  });
  h += '<div style="font-size:.9rem;font-weight:800;color:#fff;margin-bottom:8px;margin-top:14px">📋 Missioni Segrete</div>';
  const smissions = D.societyMissions || [];
  smissions.forEach((m, i) => {
    const done = (st.society.missionsDone || []).includes(m.t + '_' + i);
    h += '<div style="background:rgba(255,255,255,.05);border:1.5px solid ' + (done ? '#3ddc97' : '#444') + ';border-radius:12px;padding:12px;margin-bottom:8px">' +
      '<div style="font-weight:800;color:#fff;font-size:.85rem">' + (done ? '✅' : '⬜') + ' ' + m.title + '</div>' +
      '<div style="font-size:.7rem;color:#8a7fb8">' + m.desc + '</div></div>';
  });
  h += '<div style="margin-top:14px;font-size:.75rem;color:#666">' +
    'Missioni: ' + (st.society.missionsDone || []).length + ' · Reputazione: ' + (st.society.reputation || 0) + ' · Oggetti: ' + (st.society.purchasedItems || []).length + '</div>';
  body.innerHTML = h;
  body.querySelectorAll('[data-buy]').forEach(btn => {
    btn.onclick = () => buyShadowItem(parseInt(btn.dataset.buy));
  });
}
function buyShadowItem(idx) {
  const item = D.shadowShop[idx];
  if (!item) return;
  if (st.society.keys < item.keys) { toast('⚠️ Chiavi insufficienti!'); return; }
  st.society.keys -= item.keys;
  if (!st.society.purchasedItems) st.society.purchasedItems = [];
  st.society.purchasedItems.push(item.e);
  st.society.reputation += 10;
  if (item.prod) st.shopItems.push(item.e);
  addCoins(item.prod || 0);
  save();
  toast('✅ ' + item.name + ' acquistato!');
  societyMissionHit('shadow');
  renderSocietySheet();
  updateSocietyChip();
  updateNPCChip();
}
function visitSotterraneo() {
  if (!canEnterSotterraneo()) { toast('🔒 Completa tutti gli achievement per accedere!'); return; }
  if (!st.society) st.society = { keys: 0, dailyKeys: 0, marketDay: '', purchasedItems: [], missionsDone: [], reputation: 0, visited: false };
  st.society.visited = true;
  getTodayKey();
  societyMissionHit('society');
  st.room = 'sotterraneo';
  st.px = st.py = -1;
  setupRoom(); computeCam();
  if ($('roomChip')) $('roomChip').textContent = room().emoji + ' ' + room().name;
  checkRoomVisit(); updateHUD(); save();
}

/* ============ DIMENSIONI PARALLELE ============ */
function getDimensionLevel() {
  if (!st.dimensions) return { dark: false, neon: false, steam: false };
  return st.dimensions;
}
function setDimensionLevel(dim, val) {
  st.dimensions = st.dimensions || { dark: false, neon: false, steam: false };
  st.dimensions[dim] = val;
  save();
}
function canEnterDimension(dim) {
  const dl = getDimensionLevel();
  if (dim === 'dark') return st.mystery.solved.includes('mystery_dark_1');
  if (dim === 'neon') return st.mystery.solved.includes('mystery_neon_1');
  if (dim === 'steam') return st.mystery.solved.includes('mystery_steam_1');
  return false;
}
function enterDimension(dim) {
  const roomId = 'atrio_' + dim;
  const dimRoom = D.rooms[roomId];
  if (!dimRoom) { toast('🔒 Dimensione non ancora disponibile!'); return; }
  if (!canEnterDimension(dim)) { toast('🔒 Completa il mistero della dimensione per accedere!'); return; }
  setDimensionLevel(dim, true);
  checkDimensions();
  enterRoom(roomId);
  renderDPuzzle(dim);
  toast('🌀 Entrata nella dimensione ' + dim + '!');
  unlockAch('dimension_' + dim);
}
function solveDimensionPuzzle(dim, answer) {
  const puzzleId = 'mystery_' + dim + '_1';
  const m = D.mysteries ? D.mysteries.find(x => x.id === puzzleId) : null;
  if (!m || isMysterySolved(puzzleId)) return;
  const normalized = answer.toLowerCase().trim();
  const correct = m.answers.some(a => normalized.includes(a.toLowerCase()));
  if (!correct) { toast('❌ Risposta sbagliata! Continua a cercare indizi...'); return; }
  st.mystery.solved.push(puzzleId);
  st.mystery.active = null;
  addCoins(m.rewardCoins);
  if (m.rewardAcc && !st.ownedAcc.includes(m.rewardAcc)) {
    st.ownedAcc.push(m.rewardAcc);
    st.outfit.acc = m.rewardAcc;
    toast('✨ Accessorio sbloccato: ' + m.rewardAcc + '!');
  }
  if (m.rewardTitle) unlockTitle(m.rewardTitle);
  unlockAch('mystery_' + dim);
  toast('🌀 Enigma risolto! +' + m.rewardCoins + ' 🪙');
  updateHUD();
  save();
}
function getDimensionPuzzle(dim) {
  return D.mysteries ? D.mysteries.find(x => x.id === 'mystery_' + dim + '_1') : null;
}
function isDimensionPuzzleSolved(dim) {
  return isMysterySolved('mystery_' + dim + '_1');
}
function checkDimensions() {
  const dl = getDimensionLevel();
  if (!st.mystery.solved.includes('mystery_2') && !dl.dark) {
    toast('🌑 La dimensione Oscura si sblocca risolvendo il mistero del furto!');
  }
  if (!st.mystery.solved.includes('mystery_3') && !dl.neon) {
    toast('💜 La dimensione Neon si sblocca risolvendo il codice segreto!');
  }
if (!st.mystery.solved.includes('mystery_4') && !dl.steam) {
     toast('⚙️ La dimensione Steampunk si sblocca risolvendo il mistero della piscina!');
   }
  }

  /* ==================== HOTEL TYCOON / MANAGER ==================== */
  function openManager() {
    if (!st.manager.unlocked) { toast('🔒 Completa il terzo mistero per sbloccare il Manager!'); return; }
    closeAllSheets();
    $('sManager').classList.add('on');
    renderManager();
    $('managerChip').classList.add('on');
  }
  function closeManager() {
    $('sManager').classList.remove('on');
    $('managerChip').classList.remove('on');
  }
  function calculateDayIncome() {
    const mgr = D.manager;
    let income = 0;
    let mult = 1;
    if (mgr.staff) {
      Object.keys(mgr.staff).forEach(sid => {
        if (st.manager.staff.includes(sid)) {
          const s = mgr.staff[sid];
          income += s.cost * 0.1;
          if (s.effect.includes('ricavi')) mult += parseFloat(s.effect) / 100;
        }
      });
    }
    if (mgr.upgrades) {
      Object.keys(mgr.upgrades).forEach(uid => {
        const u = mgr.upgrades[uid];
        if (u && st.manager.upgrades[uid] && st.manager.upgrades[uid] > 0) {
          mult += parseFloat(u.effect) / 100 * st.manager.upgrades[uid];
        }
      });
    }
    st.manager.dayIncome = Math.round(income * mult);
    return st.manager.dayIncome;
  }
  function collectRevenue() {
    if (!st.manager.unlocked) return;
    const income = calculateDayIncome();
    if (income <= 0) { toast('⚠️ Nessun ricavo da riscuotere!'); return; }
    st.coins += income;
    st.manager.budget += income;
    st.manager.revenue += income;
    coinSound();
    toast('💰 Ricavi riscossi: +' + income + ' 🪙 (Budget: ' + st.manager.budget + ')');
    checkAchievements();
    checkTitles();
    updateHUD();
    save();
    renderManager();
  }
  function hireStaff(id) {
    if (!st.manager.unlocked) return;
    const s = D.manager.staff[id];
    if (!s) return;
    if (st.manager.staff.includes(id)) { toast('⚠️ Già assunto!'); return; }
    if (st.manager.budget < s.cost) { toast('🔒 Budget insufficiente! (' + s.cost + ' 🪙)'); return; }
    st.manager.budget -= s.cost;
    st.manager.staff.push(id);
    st.manager.expenses += s.cost;
    toast('👥 Assunto ' + s.name + '! Costo: ' + s.cost + ' 🪙');
    checkAchievements();
    checkTitles();
    updateHUD();
    save();
    renderManager();
  }
  function fireStaff(id) {
    if (!st.manager.unlocked) return;
    if (!st.manager.staff.includes(id)) { toast('⚠️ Non hai questo staff!'); return; }
    const s = D.manager.staff[id];
    const refund = Math.round(s.cost * 0.5);
    openConfirm({
      title: 'Licenzia staff',
      message: 'Sei sicuro di voler licenziare ' + s.name + '? Riceverai un rimborso di ' + refund + ' 🪙.',
      confirmLabel: 'Licenzia',
      cancelLabel: 'Annulla',
      danger: true,
      onConfirm: () => {
        st.manager.budget += refund;
        st.manager.staff = st.manager.staff.filter(sid => sid !== id);
        toast('❌ Licenziato ' + s.name + '. Rimborso: ' + refund + ' 🪙');
        updateHUD();
        save();
        renderManager();
      }
    });
  }
  function buyUpgrade(id) {
    if (!st.manager.unlocked) return;
    const u = D.manager.upgrades[id];
    if (!u) return;
    const currentLevel = st.manager.upgrades[id] || 0;
    if (currentLevel >= u.maxLevel) { toast('⚠️ Livello massimo raggiunto!'); return; }
    const cost = u.cost * (currentLevel + 1);
    if (st.manager.budget < cost) { toast('🔒 Budget insufficiente! (' + cost + ' 🪙)'); return; }
    st.manager.budget -= cost;
    st.manager.upgrades[id] = currentLevel + 1;
    st.manager.expenses += cost;
    toast('⬆️ Upgrade "' + u.name + '" livello ' + (currentLevel + 1) + '!');
    checkAchievements();
    checkTitles();
    updateHUD();
    save();
    renderManager();
  }
  function expandRoom(type) {
    if (!st.manager.unlocked) return;
    const rt = D.manager.roomTypes[type];
    if (!rt) return;
    if (st.manager.budget < rt.cost) { toast('🔒 Budget insufficiente! (' + rt.cost + ' 🪙)'); return; }
    st.manager.budget -= rt.cost;
    st.manager.rooms.push({ type: type, level: 1 });
    toast('🏨 Aggiunta stanza ' + rt.name + '!');
    checkAchievements();
    checkTitles();
    updateHUD();
    save();
    renderManager();
  }
  function renderManager() {
    const body = $('managerBody');
    if (!body) return;
    const mgr = D.manager;
    let h = '';
    // Dashboard tab
    const income = calculateDayIncome();
    h += '<div id="mgrTabs" style="display:flex;gap:4px;margin-bottom:12px">';
    h += '<button class="mini mgrTab" data-tab="dashboard" style="background:rgba(91,59,214,.3);color:#fff">🏠 Dashboard</button>';
    h += '<button class="mini mgrTab" data-tab="staff" style="background:rgba(255,255,255,.1);color:#fff">👥 Staff</button>';
    h += '<button class="mini mgrTab" data-tab="upgrades" style="background:rgba(255,255,255,.1);color:#fff">⬆️ Upgrades</button>';
    h += '<button class="mini mgrTab" data-tab="rooms" style="background:rgba(255,255,255,.1);color:#fff">🏨 Stanze</button>';
    h += '</div>';
    h += '<div id="mgrContent">';
    // Dashboard
    h += '<div id="mgrTab_dashboard" class="mgrTabContent">';
    h += '<div style="background:rgba(91,59,214,.1);border:1.5px solid #5b3bd6;border-radius:14px;padding:14px;margin-bottom:10px">';
    h += '<div style="font-size:1.2rem;font-weight:800;color:#fff">💰 Budget: ' + st.manager.budget + ' 🪙</div>';
    h += '<div style="font-size:.85rem;color:#e7e0ff;margin-top:6px">Reputazione: ' + st.manager.reputation + ' · Ricavi totali: ' + st.manager.revenue + ' 🪙</div>';
    h += '</div>';
    h += '<div style="background:rgba(61,220,151,.08);border:1.5px solid #3ddc97;border-radius:14px;padding:14px;margin-bottom:10px">';
    h += '<div style="font-size:1rem;font-weight:800;color:#3ddc97">📊 Ricavo giornaliero: ' + income + ' 🪙</div>';
    h += '<div style="font-size:.78rem;color:#8a7fb8;margin-top:4px">Staff: ' + st.manager.staff.length + ' · Upgrades: ' + Object.keys(st.manager.upgrades).filter(k => st.manager.upgrades[k] > 0).length + ' · Stanze: ' + st.manager.rooms.length + '</div>';
    h += '</div>';
    h += '<button class="mini" id="mgrCollect" style="background:linear-gradient(135deg,#3ddc97,#2bc48a);color:#fff;padding:12px 24px;font-size:1rem;width:100%">💰 Riscuoti Ricavi (' + income + ' 🪙)</button>';
    h += '</div>';
    // Staff
    h += '<div id="mgrTab_staff" class="mgrTabContent" style="display:none">';
    h += '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:8px">Assumi personale per aumentare i ricavi e la reputazione</div>';
    Object.keys(mgr.staff).forEach(sid => {
      const s = mgr.staff[sid];
      const hired = st.manager.staff.includes(sid);
      h += '<div style="background:' + (hired ? 'rgba(61,220,151,.1)' : 'rgba(255,255,255,.05)') + ';border:1.5px solid ' + (hired ? '#3ddc97' : '#444') + ';border-radius:12px;padding:10px;margin-bottom:8px">';
      h += '<div style="display:flex;align-items:center;gap:8px">';
      h += '<span style="font-size:1.5rem">' + s.emoji + '</span>';
      h += '<div style="flex:1"><div style="font-weight:800;color:#fff">' + s.name + '</div>';
      h += '<div style="font-size:.75rem;color:#8a7fb8">' + s.desc + ' · ' + s.effect + '</div></div>';
      h += '<div style="text-align:right"><div style="font-size:.85rem;color:#e7e0ff">' + s.cost + ' 🪙</div>';
      h += '<button class="mini" data-hire="' + sid + '" style="background:' + (hired ? '#555' : 'rgba(91,59,214,.3)') + ';color:#fff;margin-top:4px">' + (hired ? '✔ Assunto' : 'Assumi') + '</button></div>';
      h += '</div></div>';
    });
    h += '</div>';
    // Upgrades
    h += '<div id="mgrTab_upgrades" class="mgrTabContent" style="display:none">';
    h += '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:8px">Migliora l\'hotel per aumentare ricavi e reputazione</div>';
    Object.keys(mgr.upgrades).forEach(uid => {
      const u = mgr.upgrades[uid];
      const lvl = st.manager.upgrades[uid] || 0;
      const cost = u.cost * (lvl + 1);
      const maxed = lvl >= u.maxLevel;
      h += '<div style="background:rgba(255,255,255,.05);border:1.5px solid ' + (maxed ? '#555' : '#5b3bd6') + ';border-radius:12px;padding:10px;margin-bottom:8px">';
      h += '<div style="display:flex;align-items:center;gap:8px">';
      h += '<div style="flex:1"><div style="font-weight:800;color:#fff">' + u.name + '</div>';
      h += '<div style="font-size:.75rem;color:#8a7fb8">' + u.desc + ' · ' + u.effect + '</div>';
      h += '<div style="font-size:.75rem;color:#e7e0ff;margin-top:2px">Livello: ' + lvl + '/' + u.maxLevel + '</div></div>';
      h += '<button class="mini" data-upgrade="' + uid + '" ' + (maxed ? 'disabled' : '') + ' style="background:' + (maxed ? '#555' : 'rgba(91,59,214,.3)') + ';color:#fff">⬆️ ' + (maxed ? 'Max' : cost + ' 🪙') + '</button></div>';
      h += '</div>';
    });
    h += '</div>';
    // Rooms
    h += '<div id="mgrTab_rooms" class="mgrTabContent" style="display:none">';
    h += '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:8px">Espandi l\'hotel con nuove stanze</div>';
    Object.keys(mgr.roomTypes).forEach(rid => {
      const rt = mgr.roomTypes[rid];
      const count = st.manager.rooms.filter(r => r.type === rid).length;
      h += '<div style="background:rgba(255,255,255,.05);border:1.5px solid #5b3bd6;border-radius:12px;padding:10px;margin-bottom:8px">';
      h += '<div style="display:flex;align-items:center;gap:8px">';
      h += '<span style="font-size:1.5rem">' + rt.emoji + '</span>';
      h += '<div style="flex:1"><div style="font-weight:800;color:#fff">' + rt.name + '</div>';
      h += '<div style="font-size:.75rem;color:#8a7fb8">Base: ' + rt.baseRevenue + ' 🪙/stanza · Slot: ' + rt.slots + '</div></div>';
      h += '<div style="text-align:right"><div style="font-size:.85rem;color:#e7e0ff">' + rt.cost + ' 🪙</div>';
      h += '<button class="mini" data-expand="' + rid + '" style="background:rgba(91,59,214,.3);color:#fff">🏨 Aggiungi</button></div>';
      h += '</div></div>';
    });
    h += '</div>';
    h += '</div>';
    body.innerHTML = h;
    // wire tabs
    body.querySelectorAll('.mgrTab').forEach(btn => {
      btn.onclick = () => {
        body.querySelectorAll('.mgrTabContent').forEach(c => c.style.display = 'none');
        body.querySelectorAll('.mgrTab').forEach(b => b.style.background = 'rgba(255,255,255,.1)');
        const tab = btn.dataset.tab;
        const tabEl = $('mgrTab_' + tab);
        if (tabEl) tabEl.style.display = '';
        btn.style.background = 'rgba(91,59,214,.3)';
      };
    });
    // wire collect
    const collectBtn = $('mgrCollect');
    if (collectBtn) collectBtn.onclick = collectRevenue;
    // wire hire
    body.querySelectorAll('[data-hire]').forEach(btn => {
      btn.onclick = () => hireStaff(btn.dataset.hire);
    });
    // wire upgrade
    body.querySelectorAll('[data-upgrade]').forEach(btn => {
      btn.onclick = () => buyUpgrade(btn.dataset.upgrade);
    });
    // wire expand
    body.querySelectorAll('[data-expand]').forEach(btn => {
      btn.onclick = () => expandRoom(btn.dataset.expand);
    });
  }

  function renderDimensions() {
   const body = $('dimBody');
   if (!body) return;
   const dl = st.dimensions || { dark: false, neon: false, steam: false };
   const dimData = [
     { id: 'dark', name: 'Dimensione Oscura', emoji: '🌑', desc: 'Nel buio le ombre prendono vita', mystery: 'mystery_dark_1', unlock: st.mystery.solved.includes('mystery_2') },
     { id: 'neon', name: 'Dimensione Neon', emoji: '💜', desc: 'Il ciber-spazio pulsante', mystery: 'mystery_neon_1', unlock: st.mystery.solved.includes('mystery_3') },
     { id: 'steam', name: 'Dimensione Steampunk', emoji: '⚙️', desc: 'Vapore, ingranaggi e aristocratica eleganza', mystery: 'mystery_steam_1', unlock: st.mystery.solved.includes('mystery_4') }
   ];
   let h = '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:10px">Scegli una dimensione da esplorare!</div>';
   dimData.forEach(d => {
     const unlocked = d.unlock;
     const solved = isDimensionPuzzleSolved(d.id);
     h += '<div style="background:' + (unlocked ? (solved ? 'rgba(61,220,151,.12)' : 'rgba(91,59,214,.12)') : 'rgba(255,255,255,.05)') + ';border:1.5px solid ' + (unlocked ? (solved ? '#3ddc97' : '#5b3bd6') : '#444') + ';border-radius:14px;padding:14px;margin-bottom:10px">' +
       '<div style="display:flex;align-items:center;gap:10px">' +
       '<span style="font-size:28px">' + d.emoji + '</span>' +
       '<div style="flex:1">' +
       '<div style="font-weight:800;color:#fff;font-size:.95rem">' + d.name + '</div>' +
       '<div style="font-size:.75rem;color:#8a7fb8;margin-top:2px">' + d.desc + '</div>' +
       '</div>' +
       '<div style="text-align:right">' +
       (solved ? '<span style="color:#3ddc97;font-size:.75rem">✅ Enigma risolto</span>' :
         unlocked ? '<span style="color:#ffd166;font-size:.75rem">▶ Esplora</span>' :
           '<span style="color:#666;font-size:.75rem">🔒 Sblocca il mistero</span>') +
       '</div></div>' +
       (unlocked && !solved ? '<div style="margin-top:10px;text-align:center"><button class="mini dimEnter" data-dim="' + d.id + '" style="background:linear-gradient(135deg,#9b59b6,#8e44ad);color:#fff">🌀 Entra nella dimensione</button></div>' : '') +
       '</div>';
   });
   body.innerHTML = h;
   body.querySelectorAll('.dimEnter').forEach(btn => {
     btn.onclick = () => { enterDimension(btn.dataset.dim); $('sDimensions').classList.remove('on'); };
   });
 }

 function renderDPuzzle(dim) {
   const body = $('puzzleBody');
   if (!body) return;
   const m = getDimensionPuzzle(dim);
   if (!m) { body.innerHTML = '<div style="color:#8a7fb8">Nessun enigma disponibile</div>'; return; }
   const solved = isDimensionPuzzleSolved(dim);
   const dimNames = { dark: 'Oscura', neon: 'Neon', steam: 'Steampunk' };
   let h = '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:10px">Enigmi della dimensione ' + dimNames[dim] + '!</div>';
   h += '<div style="background:rgba(91,59,214,.1);border:1.5px solid #5b3bd6;border-radius:14px;padding:14px;margin-bottom:14px">' +
     '<div style="font-size:2rem">' + m.emoji + '</div>' +
     '<div style="font-size:1.05rem;font-weight:800;color:#fff;margin-top:8px">' + m.name + '</div>' +
     '<div style="font-size:.85rem;color:#e7e0ff;margin-top:6px;line-height:1.5">' + m.desc + '</div>' +
     '</div>';
   h += '<div class="gtitle" style="margin-top:8px">Indizi trovati</div>';
   m.clues.forEach(c => {
     const found = isClueFound(m.id, c.id);
     h += '<div style="background:' + (found ? 'rgba(61,220,151,.1)' : 'rgba(255,255,255,.05)') + ';border:1.5px solid ' + (found ? '#3ddc97' : '#444') + ';border-radius:10px;padding:8px;margin-bottom:6px">' +
       '<span style="font-size:1.2rem">' + (found ? c.emoji : '❓') + '</span>' +
       '<div style="font-size:.78rem;color:#8a7fb8;margin-top:4px">' + (found ? c.desc : c.hint) + '</div></div>';
   });
   h += '<div class="gtitle">Rispondi all\'enigma</div>';
   h += '<div style="background:rgba(255,255,255,.05);border:1.5px solid #e7e0ff;border-radius:12px;padding:12px;margin-bottom:8px">' +
     '<div style="font-size:.9rem;font-weight:800;color:#fff">' + m.question + '</div></div>';
   h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px" id="puzzleAnswers">';
   m.answers.forEach(a => {
     h += '<button class="mini" data-answer="' + a + '" style="background:rgba(91,59,214,.2);border-color:#5b3bd6;color:#fff">' + a + '</button>';
   });
   h += '</div>';
   h += '<button class="mini" id="puzzleCustom" style="background:linear-gradient(135deg,#ffd166,#ff9f43);color:#4a2c00;min-width:120px">💡 Rispondi personalmente</button>';
   body.innerHTML = h;
   body.querySelectorAll('[data-answer]').forEach(btn => {
     btn.onclick = () => { $('puzzleBody').querySelectorAll('[data-answer]').forEach(b => b.style.borderColor = '#5b3bd6'); btn.style.borderColor = '#ffd166'; };
   });
   const customBtn = $('puzzleCustom');
   if (customBtn) customBtn.onclick = () => {
     const ans = prompt('La tua risposta:');
     if (ans) solveDimensionPuzzle(dim, ans);
   };
 }

 /* ============ ROOM BUILDER ============ */
function openBuilder() {
  closeAllSheets();
  if (!st.builder.slots.length) {
    st.builder.name = '';
    st.builder.desc = '';
    st.builder.slots = [];
    st.builder.votes = 0;
    st.builder.votedBy = [];
    st.builder.createdAt = Date.now();
    st.builder.isPublic = true;
  }
  st.builder.active = true;
  const builderRoomEl = $('builderRoom');
  if (builderRoomEl) builderRoomEl.classList.add('here');
  save();
  renderBuilder();
  toast('🏗️ Room Builder attivo! Clicca su un oggetto dallo stash per posizionarlo.');
}
function closeBuilder() {
  st.builder.active = false;
  const builderRoomEl = $('builderRoom');
  if (builderRoomEl) builderRoomEl.classList.remove('here');
  save();
}
function renderBuilder() {
  const body = $('builderBody');
  if (!body) return;
  let h = '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:10px">Personalizza la tua stanza!</div>';
  // Name input
  h += '<input id="bRoomName" type="text" value="' + escHtml(st.builder.name || '') + '" placeholder="Nome stanza..." maxlength="20" style="width:100%;padding:8px 12px;border-radius:10px;border:2px solid #e7e0ff;background:rgba(255,255,255,.1);color:#fff;font-size:.9rem;text-align:center;margin-bottom:8px;box-sizing:border-box">' +
    '<textarea id="bRoomDesc" placeholder="Desc..." maxlength="50" style="width:100%;padding:8px 12px;border-radius:10px;border:2px solid #e7e0ff;background:rgba(255,255,255,.1);color:#fff;font-size:.85rem;margin-bottom:8px;resize:none;height:40px;box-sizing:border-box"></textarea>' +
    '<div id="bSlots" style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:10px"></div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px" id="bStash"></div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
    '<button class="mini" id="bTemplate">📋 Template</button>' +
    '<button class="mini" id="bShare">🔗 Condividi</button>' +
    '<button class="mini" id="bImport">📥 Importa</button>' +
    '<button class="mini" id="bCommunity">🏆 Community</button>' +
    '<button class="mini" id="bSave" style="background:linear-gradient(135deg,#3ddc97,#2bc48a);color:#fff">💾 Salva</button>' +
    '<button class="mini" id="bClear" style="background:#ff5d9e;color:#fff">🗑️ Svuota</button>' +
    '<button class="mini" id="bExit" style="background:#5b3bd6;color:#fff">✕ Esci</button>' +
    '</div>';
  body.innerHTML = h;
  // render slots
  const slotsEl = $('bSlots');
  const slots = room().slots || [];
  slots.forEach((sp, si) => {
    const item = st.builder.slots.find(s => s.slot === si);
    const bg = item ? 'rgba(61,220,151,.2)' : 'rgba(255,255,255,.05)';
    const border = item ? '#3ddc97' : '#444';
    slotsEl.innerHTML += '<button class="mini" data-slot="' + si + '" style="background:' + bg + ';border:2px solid ' + border + ';aspect-ratio:1;font-size:.8rem;min-height:40px">' + (item ? item.e : '+') + '</button>';
  });
  slotsEl.querySelectorAll('[data-slot]').forEach(btn => {
    btn.onclick = () => {
      const si = parseInt(btn.dataset.slot);
      const item = st.builder.slots.find(s => s.slot === si);
      if (item) {
        // return to stash
        st.builder.slots = st.builder.slots.filter(s => s.slot !== si);
        st.shopItems.push(item.e);
        toast('🗑️ Rimosso ' + item.e);
      } else if (st.shopItems.length) {
        // place first available
        const e = st.shopItems.shift();
        st.builder.slots.push({ e, slot: si, last: Date.now() });
        toast('📍 Posizionato ' + e);
      } else {
        toast('📦 Magazzino vuoto!');
      }
      save();
      renderBuilder();
    };
  });
  // render stash
  const stashEl = $('bStash');
  stashEl.innerHTML = '<div style="font-size:.75rem;color:#8a7fb8;width:100%">📦 Magazzino: ' + st.shopItems.length + ' oggetti</div>';
  st.shopItems.slice(0, 12).forEach((e, i) => {
    stashEl.innerHTML += '<button class="mini" data-stash="' + i + '" style="background:rgba(91,59,214,.2);border-color:#5b3bd6;font-size:1.1rem">' + e + '</button>';
  });
  stashEl.querySelectorAll('[data-stash]').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.stash);
      const e = st.shopItems[idx];
      if (!e) return;
      const freeSlot = st.builder.slots.findIndex(s => !st.builder.slots.find(sb => sb.slot === s.slot));
      if (freeSlot >= 0 && freeSlot < slots.length) {
        st.shopItems.splice(idx, 1);
        st.builder.slots.push({ e, slot: freeSlot, last: Date.now() });
        toast('📍 Posizionato ' + e);
      } else {
        toast('⚠️ Tutti gli slot sono pieni!');
      }
      save();
      renderBuilder();
    };
  });
  // wire up buttons
  $('bRoomName').oninput = (e) => { st.builder.name = e.target.value; save(); };
  $('bRoomDesc').oninput = (e) => { st.builder.desc = e.target.value; save(); };
  $('bSave').onclick = () => { saveBuilderRoom(); toast('💾 Stanza salvata!'); };
  $('bClear').onclick = () => { st.builder.slots = []; save(); renderBuilder(); toast('🗑️ Stanza svuotata'); };
  $('bExit').onclick = () => { closeBuilder(); toast('✕ Uscito dal builder'); };
  $('bShare').onclick = () => showShareCode();
  $('bImport').onclick = () => showImportDialog();
  $('bTemplate').onclick = () => showTemplates();
  $('bCommunity').onclick = () => showCommunity();
}
function b64encodeUtf8(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function b64decodeUtf8(code) {
  const bin = atob(code);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
function generateBuilderCode() {
  const data = {
    n: st.builder.name || 'Sans nome',
    d: st.builder.desc || '',
    f: st.builder.slots.map(s => s.e)
  };
  return b64encodeUtf8(data);
}
function decodeBuilderCode(code) {
  try {
    const data = b64decodeUtf8(code);
    if (!data || typeof data.n !== 'string' || !Array.isArray(data.f)) throw new Error('Invalid');
    return data;
  } catch(e) { return null; }
}
function importBuilderCode(code) {
  const data = decodeBuilderCode(code);
  if (!data) { toast('❌ Codice non valido'); return; }
  st.builder.name = String(data.n).slice(0, 20);
  st.builder.desc = typeof data.d === 'string' ? data.d.slice(0, 50) : '';
  st.builder.slots = (Array.isArray(data.f) ? data.f : []).slice(0, 100).map((e, i) => ({ e: String(e).slice(0,4), slot: i, last: Date.now() }));
  const slots = room().slots || [];
  if (st.builder.slots.length > slots.length) {
    st.builder.slots = st.builder.slots.slice(0, slots.length);
  }
  save();
  toast('✅ Stanza importata: ' + escHtml(st.builder.name) + '!');
  renderBuilder();
}
function saveBuilderRoom() {
  st.builder.createdAt = Date.now();
  st.builder.isPublic = true;
  save();
  unlockAch('first_builder');
  const count = (st.builderRooms || []).length + 1;
  if (!st.builderRooms) st.builderRooms = [];
  st.builderRooms.push({ name: st.builder.name, id: Date.now(), slots: st.builder.slots.length });
  if (count >= 1) unlockTitle('builder');
  if (count >= 5) { unlockTitle('builder_elite'); unlockAch('builder_5'); }
  if (count >= 10) { unlockTitle('builder_master'); unlockAch('builder_10'); }
  checkTitles();
}
function showShareCode() {
  if (!st.builder.slots.length) { toast('⚠️ Posiziona almeno un oggetto!'); return; }
  const code = generateBuilderCode();
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeIn .3s';
  overlay.innerHTML = '<div style="background:#1a1a2e;border-radius:18px;padding:28px;max-width:400px;width:90%;box-shadow:0 12px 40px rgba(0,0,0,.5);border:2px solid #5b3bd6">' +
    '<div style="font-size:2rem;margin-bottom:8px">🔗 Condividi</div>' +
    '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:14px">Copia questo codice e condividilo con gli amici!</div>' +
    '<input id="shareCodeInput" type="text" value="' + code + '" readonly style="width:100%;padding:12px;border-radius:10px;border:2px solid #e7e0ff;background:rgba(255,255,255,.1);color:#fff;font-size:.75rem;margin-bottom:14px;box-sizing:border-box">' +
    '<div style="display:flex;gap:10px;justify-content:center">' +
    '<button class="mini" id="shareCopy">📋 Copia</button>' +
    '<button class="mini" id="shareClose" style="background:#2a2a4e;color:#8a7fb8">Chiudi</button>' +
    '</div></div>';
  document.body.appendChild(overlay);
  $('shareCopy').onclick = () => {
    if (navigator.clipboard) navigator.clipboard.writeText($('shareCodeInput').value);
    toast('📋 Codice copiato!');
  };
  $('shareClose').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}
function showImportDialog() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeIn .3s';
  overlay.innerHTML = '<div style="background:#1a1a2e;border-radius:18px;padding:28px;max-width:400px;width:90%;box-shadow:0 12px 40px rgba(0,0,0,.5);border:2px solid #5b3bd6">' +
    '<div style="font-size:2rem;margin-bottom:8px">📥 Importa</div>' +
    '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:14px">Incolla il codice di una stanza condivisa!</div>' +
    '<input id="importCodeInput" type="text" placeholder="Codice qui..." style="width:100%;padding:12px;border-radius:10px;border:2px solid #e7e0ff;background:rgba(255,255,255,.1);color:#fff;font-size:.9rem;margin-bottom:14px;box-sizing:border-box">' +
    '<div style="display:flex;gap:10px;justify-content:center">' +
    '<button class="mini" id="importOk" style="background:linear-gradient(135deg,#3ddc97,#2bc48a);color:#fff">✅ Importa</button>' +
    '<button class="mini" id="importNo" style="background:#2a2a4e;color:#8a7fb8">Annulla</button>' +
    '</div></div>';
  document.body.appendChild(overlay);
  $('importOk').onclick = () => {
    const code = $('importCodeInput').value.trim();
    if (code) importBuilderCode(code);
    overlay.remove();
  };
  $('importNo').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}
function showTemplates() {
  const body = $('builderBody');
  if (!body) return;
  const templates = D.roomTemplates || [];
  let h = '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:10px">Scegli un template!</div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">';
  templates.forEach(t => {
    h += '<button class="mini" data-template="' + t.id + '" style="background:rgba(91,59,214,.15);border:1.5px solid #5b3bd6;padding:14px;text-align:center">' +
      '<div style="font-size:2rem">' + t.emoji + '</div>' +
      '<div style="font-weight:800;color:#fff;font-size:.85rem">' + t.name + '</div>' +
      '<div style="font-size:.7rem;color:#8a7fb8">' + t.desc + '</div></button>';
  });
  h += '</div><button class="mini" id="tmplClose" style="margin-top:10px;background:#2a2a4e;color:#8a7fb8">Chiudi</button>';
  body.innerHTML = h;
  body.querySelectorAll('[data-template]').forEach(btn => {
    btn.onclick = () => {
      const t = (D.roomTemplates || []).find(x => x.id === btn.dataset.template);
      if (!t) return;
      st.builder.slots = [];
      st.builder.name = t.name;
      st.builder.desc = t.desc;
      const slots = room().slots || [];
      t.furniture.forEach((e, i) => {
        if (i < slots.length) st.builder.slots.push({ e, slot: i, last: Date.now() });
      });
      save();
      toast('📋 Template "' + t.name + '" caricato!');
      renderBuilder();
    };
  });
  $('tmplClose').onclick = () => { renderBuilder(); };
}
function showCommunity() {
  const body = $('builderBody');
  if (!body) return;
  const rooms = st.builderRooms || [];
  const seasonalCode = D.stanzaSettimana || {};
  let h = '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:10px">🌟 Stanza della settimana!</div>';
  if (seasonalCode && seasonalCode.roomId) {
    h += '<div style="background:rgba(255,209,102,.1);border:1.5px solid #ffd166;border-radius:14px;padding:14px;margin-bottom:14px">' +
      '<div style="font-size:2rem">' + (D.roomTemplates.find(t => t.id === seasonalCode.roomId) || { emoji: '🏆' }).emoji + '</div>' +
      '<div style="font-weight:800;color:#fff">' + escHtml(seasonalCode.owner || 'Anonimo') + '</div>' +
      '<div style="font-size:.75rem;color:#8a7fb8">⭐ ' + (seasonalCode.votes || 0) + ' voti · Settimana ' + (seasonalCode.week || '?') + '</div></div>';
  }
  h += '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:10px">Le tue stanze (' + rooms.length + ')</div>';
  if (rooms.length === 0) {
    h += '<div style="color:#666;font-size:.85rem">Nessuna stanza creata. Crea la tua prima stanza!</div>';
  }
  rooms.forEach((r, i) => {
    h += '<div style="background:rgba(255,255,255,.05);border:1.5px solid #e7e0ff;border-radius:12px;padding:12px;margin-bottom:8px">' +
      '<div style="font-weight:800;color:#fff">' + escHtml(r.name || 'Anonimo') + '</div>' +
      '<div style="font-size:.75rem;color:#8a7fb8">📍 ' + r.slots + ' oggetti</div></div>';
  });
  h += '<button class="mini" id="commClose" style="background:#2a2a4e;color:#8a7fb8">Chiudi</button>';
  body.innerHTML = h;
  $('commClose').onclick = () => renderBuilder();
}
function voteBuilder(roomId) {
  if (!st.builder.votedBy) st.builder.votedBy = [];
  const today = new Date().toDateString();
  if (st.builder.votedBy.includes(today)) { toast('⚠️ Hai già votato oggi!'); return; }
  st.builder.votedBy.push(today);
  if (!st.builderVotes) st.builderVotes = {};
  st.builderVotes[roomId] = (st.builderVotes[roomId] || 0) + 1;
  save();
  toast('🗳️ Voto registrato!');
}
function getRoomOfTheWeek() {
  const votes = st.builderVotes || {};
  let bestId = null, bestVotes = 0;
  Object.keys(votes).forEach(rid => {
    if (votes[rid] > bestVotes) { bestVotes = votes[rid]; bestId = rid; }
  });
  return { roomId: bestId, votes: bestVotes };
}

/* ============ FASHION SHOW ============ */
const FS_INTERVAL = 7200000;
const FS_POSE_TIME = 30000;
const FS_VOTE_TIME = 15000;
const FS_REWARDS = [20, 15, 10];
const FS_XP = 5;

function getFsState() { return st.fashionShow; }

function startFashionShow() {
  const fs = st.fashionShow;
  fs.active = true;
  fs.startTime = Date.now();
  fs.duration = FS_POSE_TIME + FS_VOTE_TIME;
  fs.phase = 'pose';
  fs.participants = [];
  fs.winners = [];
  fs.votes = {};
  toast('🎭✨ Fashion Show in corso! Scegli il tuo outfit e la tua emote!');
  updateFSChip();
  save();
}
function endFashionShow() {
  const fs = st.fashionShow;
  fs.phase = 'vote';
  // calcola punteggi
  const allScores = [];
  Object.keys(D.bots).forEach(botId => {
    const bot = D.bots[botId];
    if (!bot) return;
    const ci = D.charInfo[botId];
    const score = calculateFashionScore(botId);
    allScores.push({ id: botId, name: bot.name, score, emoji: bot.emoji, outfit: bot.outfit || {}, emote: 'dance' });
  });
  // aggiungi player
  allScores.push({ id: 'player', name: st.nick || 'Ospite', score: calculateFashionScore('player'), emoji: '👤', outfit: st.outfit, emote: 'dance' });
  allScores.sort((a, b) => b.score - a.score);
  fs.winners = allScores.slice(0, 3);
  fs.phase = 'done';
  fs.active = false;
  // premia
  fs.winners.forEach((w, i) => {
    if (i < FS_REWARDS.length) {
      addCoins(FS_REWARDS[i]);
      if (i === 0) { st.fashionShow.trophy = (st.fashionShow.trophy || 0) + 1; }
    }
  });
  toast('🎭🏆 Fashion Show finito! 1°: ' + fs.winners[0].name + ' (' + fs.winners[0].score + 'pt)');
  updateFSChip();
  renderFashionShowResults();
  save();
}
function calculateFashionScore(entityId) {
  let score = 0;
  let outfit = {};
  if (entityId === 'player') {
    outfit = st.outfit;
  } else {
    const bot = D.bots[entityId];
    if (!bot) return 0;
    outfit = { skin: bot.skin, hairColor: bot.hair, top: bot.top, pants: bot.pants, acc: bot.acc || 'none' };
  }
  // coordinamento colori
  if (outfit.top && outfit.pants) {
    if (outfit.top === outfit.pants) score += 15;
  }
  // accessori
  if (outfit.acc && outfit.acc !== 'none') score += 10;
  // emote gradita
  const ci = D.charInfo[entityId];
  if (ci && ci.likes && ci.likes.indexOf('dance') >= 0) score += 20;
  // random
  score += Math.random() * 10;
  return Math.round(score);
}
function voteFor(voterId, targetId, vote) {
  const fs = st.fashionShow;
  if (!fs.votes[voterId]) fs.votes[voterId] = {};
  fs.votes[voterId][targetId] = vote;
  save();
}
function renderFashionShowResults() {
  const fb = $('fsResultsBody');
  if (!fb) return;
  const fs = st.fashionShow;
  if (!fs.winners.length) { fb.innerHTML = '<div style="color:#8a7fb8">Nessun risultato ancora</div>'; return; }
  let html = '';
  fs.winners.forEach((w, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
    const reward = i < FS_REWARDS.length ? FS_REWARDS[i] + ' 🪙' : '';
    html += '<div class="fsr" style="border-color:' + (i === 0 ? '#ffd166' : i === 1 ? '#c0c0c0' : '#cd7f32') + '">' +
      '<span class="fsr-medal">' + medal + '</span>' +
      '<span class="fsr-name">' + w.name + '</span>' +
      '<span class="fsr-score">' + w.score + 'pt</span>' +
      '<span class="fsr-reward">' + reward + '</span>' +
    '</div>';
  });
  fb.innerHTML = html;
}
function updateFSChip() {
  const fs = st.fashionShow;
  const fc = $('fsChip');
  if (!fc) return;
  if (!fs.active) { fc.style.display = 'none'; return; }
  fc.style.display = '';
  const elapsed = Date.now() - fs.startTime;
  const remaining = Math.max(0, fs.duration - elapsed);
  const s = Math.floor(remaining / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  fc.textContent = '⏰ ' + m + ':' + String(sec).padStart(2, '0');
}
function renderFashionShow() {
  const fb = $('fsBody');
  if (!fb) return;
  const fs = st.fashionShow;
  const poseLeft = Math.max(0, fs.duration - (Date.now() - fs.startTime));
  const s = Math.floor(poseLeft / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  let html = '<div class="fspose" style="margin-bottom:12px">';
  html += '<span class="fs-emoji">🎭</span>';
  html += '<span>Fase: ' + (fs.phase === 'pose' ? '🕐 Pose' : fs.phase === 'vote' ? '🗳️ Votazione' : '🏆 Risultati') + '</span>';
  html += '<span>⏰ ' + m + ':' + String(sec).padStart(2, '0') + '</span>';
  html += '</div>';
  if (fs.phase === 'pose' || fs.phase === 'vote') {
    html += '<div class="gtitle">Il tuo outfit</div>';
    html += '<div style="background:#faf8ff;border:1.5px solid #e7e0ff;border-radius:14px;padding:12px;margin-bottom:12px">';
    html += '<span style="font-size:24px">' + (st.outfit.acc && st.outfit.acc !== 'none' ? '👒' : '') + '</span> ';
    html += '<b>' + (D.wardrobe.top.find(t => t.id === st.outfit.top) ? D.wardrobe.top.find(t => t.id === st.outfit.top).id : st.outfit.top) + '</b> ';
    html += '<b>' + (D.wardrobe.pants.find(p => p.id === st.outfit.pants) ? D.wardrobe.pants.find(p => p.id === st.outfit.pants).id : st.outfit.pants) + '</b> ';
    html += '<span>' + (st.outfit.acc ? st.outfit.acc : 'none') + '</span>';
    html += '</div>';
    html += '<div class="gtitle">La tua emote</div>';
    html += '<div class="emotes" style="grid-template-columns:repeat(4,1fr)">';
    D.emotes.forEach(em => {
      html += '<div class="emo" data-fs-emote="' + em.id + '"><span class="e">' + em.e + '</span><span>' + em.label + '</span></div>';
    });
    html += '</div>';
    html += '<button class="mini" id="fsConfirm" style="width:100%;margin-top:12px;padding:12px">🎭 Conferma e attendi il verdetto!</button>';
  }
  fb.innerHTML = html;
  if (fs.phase === 'pose') {
    fb.querySelectorAll('.emo').forEach(el => {
      el.onclick = () => {
        const emoteId = el.dataset.fsEmote;
        const e = D.emotes.find(x => x.id === emoteId);
        if (e) doEmote(e);
        fb.querySelectorAll('.emo').forEach(x => x.style.borderColor = '#e7e0ff');
        el.style.borderColor = '#ffd166';
        el.style.background = '#ffe9f2';
      };
    });
    const confirmBtn = $('fsConfirm');
    if (confirmBtn) confirmBtn.onclick = () => {
      fs.participants.push({ name: st.nick || 'Ospite', outfit: st.outfit, emote: 'dance', score: 0 });
      toast('✅ Pronto! Attendi il verdetto...');
      fs.phase = 'voting';
      setTimeout(() => endFashionShow(), 3000);
      renderFashionShow();
    };
  }
}
function checkFashionShow() {
  const fs = st.fashionShow;
  if (!fs.active) {
    const now = Date.now();
    const lastShow = fs.lastShow || 0;
    if (now - lastShow > FS_INTERVAL) {
      startFashionShow();
    }
  }
}

  const player = { x: 350, y: 360, tx: null, ty: null, moving: false, face: 1, ph: 0, anim: null, animT: 0, talked: false };
  let bubbles = [];      // {x,y,lines,t,dur,color,bg,align}
  let fx = [];           // {x,y,e,life,t,size}
  let botPos = {};       // id -> {x,y,ph,tx,ty,wander,moving,dir}
  let roomBots = [];
  let lastBotTalk = {};  // id -> ts
  let lastFurnTalk = {}; // key -> ts
let lastChatCoin = 0;
let lastAmbient = 0;
let lastEvent = 0;
let lastParticles = 0;
let ambientParticles = []; // {x,y,type,life,t,vy}
let flyingCollectibles = []; // {x,y,e,life,t}
let roomTransition = null; // {from,to,progress,t}

/* ---------- fortune wheel ---------- */
let fwSpinning = false;
let fwAngle = 0;
let fwCurrentAngle = 0;
let fwSpinStart = 0;
let fwSpinDuration = 4000;
let fwTargetReward = null;

function canSpinWheel() {
  const now = Date.now();
  const fw = st.fortWheel;
  const dayStart = new Date();
  dayStart.setHours(0,0,0,0);
  if (fw.lastSpin < dayStart.getTime()) {
    fw.spinsToday = 0;
  }
  return fw.spinsToday < D.fortWheel.maxSpinsPerDay;
}

function spinWheel() {
  if (fwSpinning || !canSpinWheel()) return;
  fwSpinning = true;
  fwSpinStart = Date.now();
  st.fortWheel.spinsToday++;
  st.fortWheel.totalSpins++;
  st.fortWheel.lastSpin = Date.now();
  checkTutorial('wheel');
  // pick weighted random reward
  const rewards = D.fortWheel.rewards;
  const totalWeight = rewards.reduce((s, r) => s + r.weight, 0);
  let rand = Math.random() * totalWeight;
  let chosen = rewards[0];
  for (const r of rewards) {
    rand -= r.weight;
    if (rand <= 0) { chosen = r; break; }
  }
  fwTargetReward = chosen;
  // target angle: align chosen segment to top
  const segAngle = TAU / rewards.length;
  const idx = rewards.indexOf(chosen);
  const targetSeg = TAU - (idx * segAngle) - segAngle / 2;
  fwAngle = fwAngle % TAU;
  const spins = 5 + Math.floor(Math.random() * 4);
  fwAngle = fwAngle + spins * TAU + targetSeg;
  blip(660, .1, 'sine');
  setTimeout(() => blip(880, .1, 'sine'), 200);
}

function updateFortWheel() {
  if (!fwSpinning) return;
  const elapsed = Date.now() - fwSpinStart;
  const progress = Math.min(1, elapsed / fwSpinDuration);
  // ease out cubic
  const ease = 1 - Math.pow(1 - progress, 3);
  fwCurrentAngle = fwAngle * ease;
  if (fwSpinning) renderFortWheel();
  if (progress >= 1) {
    fwSpinning = false;
    if (fwTargetReward) {
      const msg = fwTargetReward.action(st);
      toast(msg, 5000);
      coinSound();
      save();
    }
  }
}

function renderFortWheel() {
  const canvasEl = $('fwCanvas');
  if (!canvasEl) return;
  const rewards = D.fortWheel.rewards;
  const segAngle = TAU / rewards.length;
  const ctx2 = canvasEl.getContext('2d');
  const w = canvasEl.width, h = canvasEl.height;
  const cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - 10;
  ctx2.clearRect(0, 0, w, h);
  // draw segments (ruotati)
  ctx2.save();
  ctx2.translate(cx, cy);
  ctx2.rotate(fwCurrentAngle);
  ctx2.translate(-cx, -cy);
  for (let i = 0; i < rewards.length; i++) {
    const startA = i * segAngle - Math.PI / 2;
    const endA = startA + segAngle;
    ctx2.beginPath();
    ctx2.moveTo(cx, cy);
    ctx2.arc(cx, cy, r, startA, endA);
    ctx2.closePath();
    ctx2.fillStyle = i % 2 === 0 ? '#f3e8ff' : '#e7e0ff';
    ctx2.fill();
    ctx2.strokeStyle = '#b8860b';
    ctx2.lineWidth = 1;
    ctx2.stroke();
    // emoji
    const midA = startA + segAngle / 2;
    const tx = cx + Math.cos(midA) * r * 0.65;
    const ty = cy + Math.sin(midA) * r * 0.65;
    ctx2.font = '24px serif';
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';
    ctx2.fillText(rewards[i].emoji, tx, ty);
  }
  ctx2.restore();
  // center circle
  ctx2.beginPath();
  ctx2.arc(cx, cy, 20, 0, TAU);
  ctx2.fillStyle = '#b8860b';
  ctx2.fill();
  ctx2.fillStyle = '#fff';
  ctx2.font = 'bold 11px sans-serif';
  ctx2.textAlign = 'center';
  ctx2.textBaseline = 'middle';
  ctx2.fillText('🎯', cx, cy);
  // pointer at top
  ctx2.beginPath();
  ctx2.moveTo(cx, cy - r - 8);
  ctx2.lineTo(cx - 8, cy - r + 8);
  ctx2.lineTo(cx + 8, cy - r + 8);
  ctx2.closePath();
  ctx2.fillStyle = '#ff2d55';
  ctx2.fill();
}

function openFortWheel() {
  closeAllSheets();
  const el = $('fwOverlay');
  if (el) {
    el.classList.add('on');
    renderFortWheel();
    updateFWBtn();
  }
}

function updateFWBtn() {
  const btn = $('fwSpinBtn');
  if (!btn) return;
  const canSpin = canSpinWheel();
  btn.disabled = !canSpin || fwSpinning;
  btn.textContent = fwSpinning ? '🌀 Giro in corso...' : canSpin ? '🎡 Gira la Ruota!' : '❌ Giri esauriti oggi';
  const info = $('fwInfo');
  if (info) info.textContent = canSpin ? 'Giri rimasti: ' + (D.fortWheel.maxSpinsPerDay - st.fortWheel.spinsToday) : 'Torna domani!';
}

/* ---------- ghost NPCs ---------- */
function spawnGhosts() {
  if (dayTime > 0.3 && dayTime < 0.7) return; // only at night
  if (st.ghosts.active.length >= 2) return; // max 2 at a time
  if (Math.random() > D.ghosts.ghostSpawnChance) return;
  const available = D.ghosts.filter(g => !st.ghosts.active.find(a => a.id === g.id));
  if (available.length === 0) return;
  const ghost = available[Math.floor(Math.random() * available.length)];
  const rm = D.rooms[ghost.room];
  if (!rm) return;
  st.ghosts.active.push({
    id: ghost.id,
    x: rm.spawnX || 200,
    y: rm.spawnY || 300,
    life: D.ghosts.ghostDespawnTime,
    alpha: 0,
    talked: false
  });
}

function updateGhosts(dt) {
  // spawn new ghosts
  if (Math.random() < 0.001) spawnGhosts();
  // update existing
  st.ghosts.active = st.ghosts.active.filter(g => {
    g.life -= dt;
    g.alpha = Math.min(0.7, g.alpha + dt * 0.0003);
    if (g.life < 3000) g.alpha = Math.max(0, g.alpha - dt * 0.0002);
    if (g.life <= 0) return false;
    // player near ghost?
    const dx = player.x - g.x;
    const dy = player.y - g.y;
    if (dx * dx + dy * dy < 40 * 40 && !g.talked) {
      talkGhost(g);
      g.talked = true;
    }
    return true;
  });
}

function talkGhost(ghost) {
  const data = D.ghosts.find(g => g.id === ghost.id);
  if (!data) return;
  const lines = data.dialogue;
  const line = lines[Math.floor(Math.random() * lines.length)];
  say({ id: 'ghost_' + ghost.id, x: ghost.x, y: ghost.y }, data.emoji + ' ' + data.name + ': "' + line + '"', 5000);
  // reward if first time
  if (!st.ghosts.seen[ghost.id]) {
    st.ghosts.seen[ghost.id] = true;
    st.coins += data.reward;
    toast('👻 Hai scoperto ' + data.name + '! +' + data.reward + ' 🪙', 4000);
    coinSound();
    save();
    unlockAch('first_ghost');
  }
  // ghost mission tracking
  if (data.mission && !st.ghosts.missions[ghost.id]) {
    st.ghosts.missions[ghost.id] = { active: true, progress: 0, completed: false };
    toast('👻 Missione: ' + data.mission.type + ' ' + (data.mission.item || '') + ' (' + data.mission.count + 'x)', 4000);
    save();
  }
}

function advanceGhostMission(type, item) {
  Object.keys(st.ghosts.missions).forEach(gid => {
    const m = st.ghosts.missions[gid];
    if (!m.active || m.completed) return;
    const data = D.ghosts.find(g => g.id === gid);
    if (!data || !data.mission) return;
    if (data.mission.type === type && (!data.mission.item || data.mission.item === item)) {
      m.progress++;
      if (m.progress >= (data.mission.count || 1)) {
        m.completed = true;
        m.active = false;
        st.coins += data.mission.reward;
        toast('👻 Missione completata! +' + data.mission.reward + ' 🪙', 5000);
        coinSound();
        save();
      }
    }
  });
}

function drawGhosts() {
  st.ghosts.active.forEach(g => {
    const data = D.ghosts.find(d => d.id === g.id);
    if (!data) return;
    const sx = (g.x - cam.ox) * cam.s;
    const sy = (g.y - cam.oy) * cam.s;
    // glow
    ctx.save();
    ctx.globalAlpha = g.alpha * 0.4;
    ctx.beginPath();
    ctx.arc(sx, sy + 10 * cam.s, 28 * cam.s, 0, TAU);
    ctx.fillStyle = data.color;
    ctx.fill();
    // body
    ctx.globalAlpha = g.alpha;
    ctx.font = (36 * cam.s) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.emoji, sx, sy);
    // name
    ctx.font = 'bold ' + (9 * cam.s) + 'px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(data.name, sx, sy + 22 * cam.s);
    ctx.restore();
  });
}

/* ---------- carnival minigame ---------- */
let mgActive = false;
let mgTargets = [];
let mgTimer = 0;
let mgLastSpawn = 0;
let mgScore = 0;
let mgCombo = 0;
let mgStartTime = 0;
let mgCanvas = null;
let mgCtx = null;

function startMinigame() {
  if (mgActive) return;
  mgActive = true;
  mgTargets = [];
  mgScore = 0;
  mgCombo = 0;
  mgStartTime = Date.now();
  mgLastSpawn = 0;
  st.minigame.totalGames++;
  const el = $('mgOverlay');
  if (el) el.classList.add('on');
  mgCanvas = $('mgCanvas');
  if (mgCanvas) {
    mgCtx = mgCanvas.getContext('2d');
    mgCanvas.width = 280;
    mgCanvas.height = 280;
  }
  toast('🎪 Carnival Minigame! Colpisci i bersagli!', 3000);
  blip(660, .1, 'sine');
}

function endMinigame() {
  mgActive = false;
  // calc rewards
  let rewardCoins = 0, rewardXp = 0;
  for (const r of D.minigame.rewards) {
    if (mgScore >= r.minScore) {
      rewardCoins = r.coins;
      rewardXp = r.xp;
    }
  }
  st.coins += rewardCoins;
  xpAdd(rewardXp);
  if (mgScore > st.minigame.bestScore) st.minigame.bestScore = mgScore;
  st.minigame.score = mgScore;
  const el = $('mgOverlay');
  if (el) el.classList.remove('on');
  toast('🎪 Punteggio: ' + mgScore + ' | +' + rewardCoins + ' 🪙 +' + rewardXp + ' XP', 5000);
  if (rewardCoins > 0) coinSound();
  save();
}

function updateMinigame(dt) {
  if (!mgActive) return;
  const elapsed = Date.now() - mgStartTime;
  mgTimer = D.minigame.duration - elapsed;
  if (mgTimer <= 0) { endMinigame(); return; }
  // spawn targets
  if (elapsed - mgLastSpawn > D.minigame.spawnInterval) {
    mgLastSpawn = elapsed;
    if (mgTargets.length < D.minigame.maxTargets) {
      const target = D.minigame.targets[Math.floor(Math.random() * D.minigame.targets.length)];
      mgTargets.push({
        x: 20 + Math.random() * 240,
        y: 20 + Math.random() * 200,
        life: D.minigame.targetLife,
        data: target,
        born: Date.now()
      });
    }
  }
  // update targets
  mgTargets = mgTargets.filter(t => {
    t.life -= dt;
    return t.life > 0;
  });
  renderMinigame();
}

function renderMinigame() {
  if (!mgCtx) return;
  const w = mgCanvas.width, h = mgCanvas.height;
  mgCtx.clearRect(0, 0, w, h);
  // background
  mgCtx.fillStyle = 'rgba(58,33,143,0.1)';
  mgCtx.fillRect(0, 0, w, h);
  // targets
  mgTargets.forEach(t => {
    const pct = t.life / D.minigame.targetLife;
    const scale = 0.5 + pct * 0.5;
    mgCtx.save();
    mgCtx.translate(t.x, t.y);
    mgCtx.scale(scale, scale);
    mgCtx.font = '32px serif';
    mgCtx.textAlign = 'center';
    mgCtx.textBaseline = 'middle';
    mgCtx.fillText(t.data.emoji, 0, 0);
    // glow
    mgCtx.globalAlpha = pct * 0.3;
    mgCtx.fillStyle = t.data.color;
    mgCtx.beginPath();
    mgCtx.arc(0, 0, 20, 0, TAU);
    mgCtx.fill();
    mgCtx.restore();
  });
  // HUD
  mgCtx.fillStyle = '#3a218f';
  mgCtx.font = 'bold 14px sans-serif';
  mgCtx.textAlign = 'left';
  mgCtx.fillText('⏱ ' + Math.ceil(mgTimer / 1000) + 's', 10, 20);
  mgCtx.textAlign = 'right';
  mgCtx.fillText('🎯 ' + mgScore, w - 10, 20);
  if (mgCombo > 1) {
    mgCtx.textAlign = 'center';
    mgCtx.fillStyle = '#ff2d55';
    mgCtx.fillText('x' + mgCombo + ' COMBO!', w / 2, 20);
  }
}

function mgClick(e) {
  if (!mgActive || !mgCanvas) return;
  const rect = mgCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (mgCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (mgCanvas.height / rect.height);
  for (let i = mgTargets.length - 1; i >= 0; i--) {
    const t = mgTargets[i];
    const dx = x - t.x, dy = y - t.y;
    if (dx * dx + dy * dy < 400) {
      // hit!
      if (t.data.points > 0) {
        mgCombo++;
        mgScore += t.data.points * Math.min(mgCombo, 5);
        blip(880 + mgCombo * 40, .08, 'sine');
      } else {
        mgCombo = 0;
        mgScore = Math.max(0, mgScore + t.data.points);
        blip(220, .15, 'square');
      }
      mgTargets.splice(i, 1);
      return;
    }
  }
}

/* ---------- dance battle ---------- */
let dbActive = false;
let dbArrows = [];
let dbTimer = 0;
let dbScore = 0;
let dbCombo = 0;
let dbStartTime = 0;
let dbLastSpawn = 0;
let dbCanvas = null;
let dbCtx = null;
const DB_KEY_MAP = { ArrowLeft: '←', ArrowUp: '↑', ArrowRight: '→', ArrowDown: '↓' };

function startDanceBattle() {
  if (dbActive) return;
  dbActive = true;
  dbArrows = [];
  dbScore = 0;
  dbCombo = 0;
  dbStartTime = Date.now();
  dbLastSpawn = 0;
  st.danceBattle.totalGames++;
  const el = $('dbOverlay');
  if (el) el.classList.add('on');
  dbCanvas = $('dbCanvas');
  if (dbCanvas) {
    dbCtx = dbCanvas.getContext('2d');
    dbCanvas.width = 280;
    dbCanvas.height = 280;
  }
  toast('💃 Dance Battle! Premi le frecce al ritmo!', 3000);
  blip(660, .1, 'sine');
}

function endDanceBattle() {
  dbActive = false;
  let rewardCoins = 0, rewardXp = 0;
  for (const r of D.danceBattle.rewards) {
    if (dbScore >= r.minScore) { rewardCoins = r.coins; rewardXp = r.xp; }
  }
  st.coins += rewardCoins;
  xpAdd(rewardXp);
  if (dbScore > st.danceBattle.bestScore) st.danceBattle.bestScore = dbScore;
  st.danceBattle.score = dbScore;
  const el = $('dbOverlay');
  if (el) el.classList.remove('on');
  toast('💃 Punteggio: ' + dbScore + ' | +' + rewardCoins + ' 🪙 +' + rewardXp + ' XP', 5000);
  if (rewardCoins > 0) coinSound();
  save();
}

function updateDanceBattle(dt) {
  if (!dbActive) return;
  const elapsed = Date.now() - dbStartTime;
  dbTimer = D.danceBattle.duration - elapsed;
  if (dbTimer <= 0) { endDanceBattle(); return; }
  // spawn arrows
  const spawnRate = 60000 / D.danceBattle.bpm;
  if (elapsed - dbLastSpawn > spawnRate) {
    dbLastSpawn = elapsed;
    const dir = D.danceBattle.arrows[Math.floor(Math.random() * 4)];
    dbArrows.push({ dir, y: 0, born: Date.now(), hit: false });
  }
  // update arrows
  dbArrows = dbArrows.filter(a => {
    a.y += D.danceBattle.arrowSpeed;
    return a.y < 300 && !a.hit;
  });
  renderDanceBattle();
}

function renderDanceBattle() {
  if (!dbCtx) return;
  const w = dbCanvas.width, h = dbCanvas.height;
  dbCtx.clearRect(0, 0, w, h);
  // lanes
  const laneW = w / 4;
  const hitY = h - 50;
  for (let i = 0; i < 4; i++) {
    const x = i * laneW + laneW / 2;
    dbCtx.fillStyle = 'rgba(58,33,143,0.1)';
    dbCtx.fillRect(i * laneW, 0, laneW, h);
    // hit zone
    dbCtx.fillStyle = 'rgba(255,255,255,0.2)';
    dbCtx.fillRect(i * laneW, hitY - 10, laneW, 20);
    // arrow icon at bottom
    dbCtx.font = '20px sans-serif';
    dbCtx.textAlign = 'center';
    dbCtx.textBaseline = 'middle';
    dbCtx.fillStyle = D.danceBattle.arrowColors[D.danceBattle.arrows[i]];
    dbCtx.fillText(D.danceBattle.arrows[i], x, hitY);
  }
  // falling arrows
  dbArrows.forEach(a => {
    const laneIdx = D.danceBattle.arrows.indexOf(a.dir);
    const x = laneIdx * laneW + laneW / 2;
    dbCtx.font = '24px sans-serif';
    dbCtx.textAlign = 'center';
    dbCtx.textBaseline = 'middle';
    dbCtx.fillStyle = D.danceBattle.arrowColors[a.dir];
    dbCtx.fillText(a.dir, x, a.y);
  });
  // HUD
  dbCtx.fillStyle = '#3a218f';
  dbCtx.font = 'bold 14px sans-serif';
  dbCtx.textAlign = 'left';
  dbCtx.fillText('⏱ ' + Math.ceil(dbTimer / 1000) + 's', 10, 20);
  dbCtx.textAlign = 'right';
  dbCtx.fillText('💃 ' + dbScore, w - 10, 20);
  if (dbCombo > 1) {
    dbCtx.textAlign = 'center';
    dbCtx.fillStyle = '#ff2d55';
    dbCtx.fillText('x' + dbCombo + ' COMBO!', w / 2, 20);
  }
}

function danceHit(dir) {
  if (!dbActive) return;
  const hitY = 280 - 50;
  const laneW = 280 / 4;
  for (let i = dbArrows.length - 1; i >= 0; i--) {
    const a = dbArrows[i];
    if (a.dir === dir && Math.abs(a.y - hitY) < 30) {
      a.hit = true;
      dbCombo++;
      const pts = Math.min(10, 2 + dbCombo);
      dbScore += pts;
      blip(880 + dbCombo * 30, .06, 'sine');
      dbArrows.splice(i, 1);
      return;
    }
  }
  // miss
  dbCombo = 0;
  blip(220, .1, 'square');
}

function danceKeyHandler(e) {
  const dir = DB_KEY_MAP[e.key];
  if (dir) { e.preventDefault(); danceHit(dir); }
}

/* ---------- weather system ---------- */
let weatherParticles = [];
let lightningTimer = 0;

function updateWeather(dt) {
  const w = st.weather;
  const now = Date.now();
  // seasonal weather override
  const seasonalWeather = getSeasonalWeather();
  if (seasonalWeather) {
    w.type = seasonalWeather.type;
    w.intensity = 0.7;
  } else {
    // change weather periodically
    if (now > w.nextChange) {
      w.nextChange = now + D.weather.changeInterval;
      const types = D.weather.types;
      const newType = types[Math.floor(Math.random() * types.length)];
      w.type = newType.id;
      w.intensity = 0.3 + Math.random() * 0.7;
      weatherParticles = [];
      toast(newType.emoji + ' Meteo: ' + newType.name, 2000);
    }
  }
  // spawn particles
  const wData = D.weather.types.find(t => t.id === w.type);
  if (wData && wData.particles > 0) {
    const spawnRate = Math.min(10, Math.floor(1000 / (wData.particles * w.intensity)));
    for (let i = 0; i < spawnRate; i++) {
      if (Math.random() < 0.3) {
        weatherParticles.push({
          x: Math.random() * CW,
          y: -10,
          speed: 2 + Math.random() * 4,
          size: 1 + Math.random() * 2,
          type: w.type,
          alpha: 0.3 + Math.random() * 0.5
        });
      }
    }
  }
  // update particles
  weatherParticles = weatherParticles.filter(p => {
    p.y += p.speed;
    if (p.type === 'rain' || p.type === 'storm') {
      p.x += Math.sin(p.y / 20) * 0.5;
    } else if (p.type === 'snow') {
      p.x += Math.sin(p.y / 30 + p.x) * 0.8;
    }
    return p.y < CH + 10;
  });
  // lightning
  if (w.type === 'storm') {
    lightningTimer -= dt;
    if (lightningTimer <= 0) {
      lightningTimer = 3000 + Math.random() * 8000;
      if (Math.random() < D.weather.lightningChance) {
        flashLightning();
      }
    }
  }
}

function flashLightning() {
  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.4);z-index:100;pointer-events:none;transition:opacity 0.3s';
  document.body.appendChild(flash);
  setTimeout(() => { flash.style.opacity = '0'; }, 50);
  setTimeout(() => { flash.remove(); }, 350);
  blip(100, .3, 'sawtooth');
}

function drawWeather() {
  const wData = D.weather.types.find(t => t.id === st.weather.type);
  if (!wData) return;
  // overlay
  ctx.fillStyle = wData.color;
  ctx.fillRect(0, 0, CW, CH);
  // particles
  weatherParticles.forEach(p => {
    ctx.globalAlpha = p.alpha;
    if (p.type === 'rain' || p.type === 'storm') {
      ctx.strokeStyle = 'rgba(150,200,255,0.6)';
      ctx.lineWidth = p.size * 0.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 1, p.y + p.size * 4);
      ctx.stroke();
    } else if (p.type === 'snow') {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, TAU);
      ctx.fill();
    } else if (p.type === 'fog') {
      ctx.fillStyle = 'rgba(200,200,200,0.3)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 5, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  // weather chip
  let wEl = $('weatherChip');
  if (!wEl) {
    wEl = document.createElement('span');
    wEl.id = 'weatherChip';
    wEl.className = 'chip';
    wEl.style.cssText = 'font-size:11px;background:rgba(100,150,255,.2);border-color:rgba(100,150,255,.4);color:#6496ff';
    const hud = $('hud');
    if (hud) hud.appendChild(wEl);
  }
  wEl.textContent = wData.emoji + ' ' + wData.name;
}

  function room() { return D.rooms[st.room]; }

  /* ---------- audio minuscolo ---------- */
  let AC = null;
  function blip(freq, dur, type) {
    if (st && st.sound === false) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type || 'sine'; o.frequency.value = freq || 660;
      g.gain.value = 0.06;
      o.connect(g); g.connect(AC.destination);
      o.start(); g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + (dur || 0.12));
      o.stop(AC.currentTime + (dur || 0.12) + 0.02);
    } catch (e) {}
  }
  function coinSound() { blip(880, .09, 'triangle'); setTimeout(() => blip(1320, .12, 'triangle'), 70); }

  /* ---------- toast ---------- */
  let toastT = null;
  function toast(msg, dur) {
    const t = $('toast');
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), dur || 2800);
  }

  /* ---------- monete & badge ---------- */
  function addCoins(n, silent) {
    const ev = activeEvent();
    if (n > 0 && ev && ev.mult > 1) n = Math.round(n * ev.mult);
    st.coins += n; st.earned += n;
    if (!silent) coinSound();
    try { if (st.sound !== false && navigator.vibrate) navigator.vibrate(8); } catch (e) {}
    checkAchievements();
    if (st.coins >= 10) checkTutorial('coins_10');
    if (st.coins >= 30) checkTutorial('coins_30');
    checkTitles();
    updateHUD();
    save();
  }
  function badgeFor() {
    let b = D.badges[0];
    D.badges.forEach(x => { if (st.earned >= x.min) b = x; });
    return b;
  }
  function updateHUD() {
    const titleData = st.title ? getTitleData(st.title) : null;
    const titleStr = titleData ? ' ' + titleData.emoji : '';
    $('nameChip').textContent = '👤 ' + (st.nick || 'Ospite') + (st.lvl ? ' · Lv ' + st.lvl : '') + titleStr;
    $('coins').textContent = st.coins;
    $('roomChip').textContent = room().emoji + ' ' + room().name;
    const b = badgeFor();
    $('badgeChip').textContent = b.icon + ' ' + b.title;
try {
       const snd = $('soundBtn');
       if (snd) snd.textContent = st.sound === false ? '🔇' : '🔊';
       const inCam = st.room === 'camera';
       $('shopChip').style.display = inCam ? '' : 'none';
       $('stashChip').style.display = inCam ? '' : 'none';
       // builder chip
const bld = $('builderChip');
        if (bld) {
          const hasBuilder = (st.builderRooms || []).length > 0 || (D.roomTemplates && D.roomTemplates.length > 0);
          bld.style.display = hasBuilder ? '' : 'none';
        }
// society chip
         const sc = $('societyChip');
         if (sc) {
           sc.style.display = (st.society && st.society.keys > 0) ? '' : 'none';
         }
         // npc chip
         updateNPCChip();
        // skip tutorial button
       const skipBtn = $('skipTutBtn');
       if (skipBtn) skipBtn.style.display = (!st.tutorial.completed && st.tutorial.step > 0) ? '' : 'none';
       // title chip
       const titleChip = $('titleChip');
       if (titleChip) {
         const titles = st.titles || ['neo'];
         titleChip.style.display = titles.length > 1 ? '' : 'none';
         const td = st.title ? getTitleData(st.title) : null;
         titleChip.textContent = td ? td.emoji + ' ' + td.name : '👑 Titolo';
       }
       const ev = activeEvent();
       const evEl = $('evChip');
       if (ev.active) {
         evEl.style.display = '';
         evEl.textContent = ev.emoji + ' LIVE ×' + ev.mult + ' ' + ev.name;
         evEl.style.background = 'linear-gradient(135deg,#ffd166,#ff9f43)';
         evEl.style.color = '#4a2c00';
       } else {
         const nextTxt = nextEventText();
         if (nextTxt) {
           evEl.style.display = '';
           evEl.textContent = '⏰ prossimo evento in ' + nextTxt;
           evEl.style.background = 'rgba(255,255,255,.13)';
           evEl.style.color = '#fff';
         } else evEl.style.display = 'none';
       }
     } catch (e) {}
    // indicatore chat cross-scheda
    try {
      let bcEl = $('bcChip');
      if (!bcEl) {
        bcEl = document.createElement('span');
        bcEl.id = 'bcChip';
        bcEl.className = 'chip';
        bcEl.style.cssText = 'font-size:11px;background:rgba(61,220,151,.2);border-color:rgba(61,220,151,.4);color:#3ddc97';
        bcEl.textContent = '📡 Live';
        const hud = $('hud');
        if (hud) hud.appendChild(bcEl);
      }
    } catch(e) {}
    // indicatore stelle globale
    try {
      let scEl = $('scChip');
      if (!scEl) {
        scEl = document.createElement('span');
        scEl.id = 'scChip';
        scEl.className = 'chip';
        scEl.style.cssText = 'font-size:11px;background:rgba(255,209,102,.2);border-color:rgba(255,209,102,.4);color:#ffd166';
        scEl.textContent = '⭐ 0.00';
        const hud = $('hud');
        if (hud) hud.appendChild(scEl);
      } else {
        const avg = st.globalAvg || 0;
        scEl.textContent = '⭐ ' + avg.toFixed(2);
      }
    } catch(e) {}
    // chip pet
    try {
      let pcEl = $('pcChip');
      if (!pcEl) {
        pcEl = document.createElement('span');
        pcEl.id = 'pcChip';
        pcEl.className = 'chip';
        pcEl.style.cssText = 'font-size:11px;background:rgba(61,220,151,.2);border-color:rgba(61,220,151,.4);color:#3ddc97';
        pcEl.textContent = '🐾 Nessun animale';
        const hud = $('hud');
        if (hud) hud.appendChild(pcEl);
      } else {
        renderPets();
      }
    } catch(e) {}
    // chip fashion show
    try {
      let fsEl = $('fsChip');
      if (!fsEl) {
        fsEl = document.createElement('span');
        fsEl.id = 'fsChip';
        fsEl.className = 'chip';
        fsEl.style.cssText = 'font-size:11px;background:rgba(255,93,158,.2);border-color:rgba(255,93,158,.4);color:#ff5d9e';
        fsEl.textContent = '🎭 Nessun evento';
        fsEl.style.display = 'none';
        const hud = $('hud');
        if (hud) hud.appendChild(fsEl);
      } else {
        const fs = st.fashionShow;
        fsEl.style.display = fs.active ? '' : 'none';
        if (fs.active) updateFSChip();
      }
    } catch(e) {}
    // chip fortune wheel
    try {
      let fwEl = $('fwChip');
      if (!fwEl) {
        fwEl = document.createElement('span');
        fwEl.id = 'fwChip';
        fwEl.className = 'chip';
        fwEl.style.cssText = 'font-size:11px;background:rgba(184,134,11,.2);border-color:rgba(184,134,11,.4);color:#b8860b;cursor:pointer';
        fwEl.textContent = '🎡 Ruota';
        fwEl.onclick = () => openFortWheel();
        const hud = $('hud');
        if (hud) hud.appendChild(fwEl);
      } else {
fwEl.textContent = canSpinWheel() ? '🎡 Ruota!' : '🎡 ⏳';
       }
     } catch(e) {}
     // chip dimensioni
     try {
       let dimEl = $('dimChip');
       if (!dimEl) {
         dimEl = document.createElement('span');
         dimEl.id = 'dimChip';
         dimEl.className = 'chip';
         dimEl.style.cssText = 'font-size:11px;background:rgba(155,89,182,.2);border-color:rgba(155,89,182,.4);color:#9b59b6;cursor:pointer';
         dimEl.textContent = '🌀 Dimensioni';
         dimEl.onclick = () => { const el = $('sDimensions'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderDimensions(); } };
         const hud = $('hud');
         if (hud) hud.appendChild(dimEl);
       } else {
         const dl = st.dimensions || { dark: false, neon: false, steam: false };
         const unlocked = [dl.dark, dl.neon, dl.steam].filter(Boolean).length;
         dimEl.textContent = '🌀 ' + unlocked + '/3';
       }
      } catch(e) {}
      // chip manager
      try {
        let mgrEl = $('managerChip');
        if (!mgrEl) {
          mgrEl = document.createElement('span');
          mgrEl.id = 'managerChip';
          mgrEl.className = 'chip';
          mgrEl.style.cssText = 'font-size:11px;background:rgba(255,209,102,.2);border-color:rgba(255,209,102,.4);color:#ffd166;cursor:pointer';
          mgrEl.textContent = '💰 Manager';
          mgrEl.onclick = () => { if ($('sManager').classList.contains('on')) { $('sManager').classList.remove('on'); $('managerChip').classList.remove('on'); } else { openManager(); } };
          const hud = $('hud');
          if (hud) hud.appendChild(mgrEl);
        } else {
          if (st.manager && st.manager.unlocked) {
            mgrEl.style.display = '';
            mgrEl.textContent = '💰 ' + st.manager.budget + ' 🪙';
          } else {
            mgrEl.style.display = 'none';
          }
        }
      } catch(e) {}
      // chip breeding
      try {
        let breedEl = $('breedChip');
        if (!breedEl) {
          breedEl = document.createElement('span');
          breedEl.id = 'breedChip';
          breedEl.className = 'chip';
          breedEl.style.cssText = 'font-size:11px;background:rgba(255,209,102,.2);border-color:rgba(255,209,102,.4);color:#ffd166;cursor:pointer';
          breedEl.textContent = '🥚 Alleva';
          breedEl.onclick = () => { if ($('sNest').classList.contains('on')) $('sNest').classList.remove('on'); else openNest(); };
          const hud = $('hud');
          if (hud) hud.appendChild(breedEl);
        } else {
          if (st.breeding && st.breeding.eggs && st.breeding.eggs.length > 0) {
            breedEl.style.display = '';
            breedEl.textContent = '🥚 ' + st.breeding.eggs.length + ' uova';
          } else if (st.pets.length >= 2) {
            breedEl.style.display = '';
            breedEl.textContent = '🥚 Alleva';
          } else {
            breedEl.style.display = 'none';
          }
        }
      } catch(e) {}
     // music studio chip
     try {
       let msEl = $('musicStudioChip');
       if (!msEl) {
         msEl = document.createElement('span');
         msEl.id = 'musicStudioChip';
         msEl.className = 'chip';
         msEl.style.cssText = 'font-size:11px;background:rgba(91,59,214,.2);border-color:rgba(91,59,214,.4);color:#9b59b6;cursor:pointer';
         msEl.textContent = '🎵 Studio';
         msEl.onclick = () => { if ($('sStudio').classList.contains('on')) { $('sStudio').classList.remove('on'); $('musicStudioChip').classList.remove('on'); } else { openMusicStudio(); } };
         const hud = $('hud');
         if (hud) hud.appendChild(msEl);
       } else {
         const canUse = st.musicStudio && (st.lvl >= 2 || st.coins >= 100);
         msEl.style.display = canUse ? '' : 'none';
       }
     } catch(e) {}
   }

   /* ---------- dimensioni / camera ---------- */
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    CW = window.innerWidth; CH = window.innerHeight;
    canvas.width = Math.round(CW * DPR);
    canvas.height = Math.round(CH * DPR);
    canvas.style.width = CW + 'px';
    canvas.style.height = CH + 'px';
    computeCam();
  }
  function computeCam() {
    const r = room();
    const availH = Math.max(160, CH - TOP_RES - DOCK_RES);
    cam.s = Math.min((CW - 14) / r.w, availH / r.h);
    cam.s = Math.min(cam.s, 1.15);
    cam.ox = (CW - r.w * cam.s) / 2;
    cam.oy = TOP_RES + (availH - r.h * cam.s) / 2;
  }
  const toW = (cx, cy) => ({ x: (cx - cam.ox) / cam.s, y: (cy - cam.oy) / cam.s });
  const toS = (x, y) => ({ x: cam.ox + x * cam.s, y: cam.oy + y * cam.s });

  /* ---------- ingressi ---------- */
function enterRoom(id) {
     roomTransition = { from: st.room, to: id, progress: 0, t: performance.now() };
     setTimeout(() => {
       st.room = id;
       st.px = st.py = -1;
       if (id === 'camera') { openBuilder(); return; }
       if (id === 'sotterraneo') { if (!canEnterSotterraneo()) { toast('🔒 Completa tutti gli achievement!'); return; } visitSotterraneo(); return; }
       // dimension rooms
 if (id.startsWith('atrio_') || id.startsWith('sala_giochi_') || id.startsWith('discoteca_') || id.startsWith('terrazza_')) {
          setupRoom(); computeCam(); $('roomChip').textContent = room().emoji + ' ' + room().name;
          document.querySelectorAll('.room').forEach(el => el.classList.toggle('here', el.dataset.room === id));
          checkRoomVisit(); updateHUD(); save();
          // play studio music in discoteca
          if (id.startsWith('discoteca_') && st.musicStudio && st.musicStudio.currentTrack && st.musicStudio.currentTrack.instruments && st.musicStudio.currentTrack.instruments.length > 0) {
            toast('🎵 In riproduzione: ' + st.musicStudio.currentTrack.name);
          }
          return;
        }
       setupRoom();
       computeCam();
       $('roomChip').textContent = room().emoji + ' ' + room().name;
       document.querySelectorAll('.room').forEach(el => el.classList.toggle('here', el.dataset.room === id));
       missionHit('room', null);
       checkRoomVisit();
       checkMysteryClue();
       if (Object.keys(st.visitedRooms || {}).length >= 2) checkTutorial('room_change');
       toast(room().emoji + ' Benvenuto in: ' + room().name);
       updateHUD(); save();
     }, 200);
   }
  function setupRoom() {
    const r = room();
    player.x = r.w / 2;
    player.y = r.h - 60;
    player.tx = null; player.moving = false; player.anim = null;
    botPos = {};
    roomBots = (r.bots || []).map((id, i) => {
      const col = Math.floor(i / 2);
      const x = 130 + ((i % 2) * (r.w - 260)) + (i % 2 ? 0 : 0);
      const pos = { id, homeX: 150 + i * 110, homeY: 250 + (i % 2) * 60, x: 150 + i * 110, y: 250 + (i % 2) * 60, ph: 0, wander: 0, moving: false, dir: 1 };
      botPos[id] = pos;
      return pos;
    });
    // valigie sparse
    bubbles = []; fx = [];
    lastAmbient = performance.now() + 2500;
  }

  /* ---------- collisioni ---------- */
  function solidList() { return (room().furniture || []).filter(f => !f.xl); }
  function clampPt(x, y) {
    const r = room();
    const minY = r.walkTop || 40;
    x = Math.max(24, Math.min(r.w - 24, x));
    y = Math.max(minY, Math.min(r.h - 26, y));
    // push fuori dai mobili
    for (let k = 0; k < 3; k++) {
      let pushed = false;
      solidList().forEach(f => {
        const rad = (f.s || 34) * 0.42;
        const dx = x - f.x, dy = y - f.y;
        const d = Math.hypot(dx, dy);
        if (d < rad + 10 && d > 0.001) {
          const p = rad + 10 - d;
          x += (dx / d) * p; y += (dy / d) * p;
          pushed = true;
        }
      });
      if (!pushed) break;
    }
    return { x: Math.max(24, Math.min(room().w - 24, x)), y: Math.max(room().walkTop || 40, Math.min(room().h - 26, y)) };
  }

  /* ---------- loop ---------- */
  let lastT = 0;
  function loop(t) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    step(dt);
    draw();
  }
  function step(dt) {
    everyTick(dt);
    updateFortWheel();
    // player movimento
    if (player.tx !== null) {
      const dx = player.tx - player.x, dy = player.ty - player.y;
      const d = Math.hypot(dx, dy);
      const sp = 210 * cam.s * dt;
      if (d < 4 || sp <= 0) {
        const act = player._act; player._act = null;
        player.tx = null; player.moving = false;
        if (act) act();
      } else {
        player.face = dx >= 0 ? 1 : -1;
        player.moving = true;
        player.ph += dt * 11;
        const np = clampPt(player.x + (dx / d) * sp, player.y + (dy / d) * sp);
        player.x = np.x; player.y = np.y;
      }
    } else player.moving = false;

    // bot vagabondano piano
    const r = room();
    roomBots.forEach(bp => {
      const b = D.bots[bp.id];
      if (!b) return;
      if (!bp.tx) {
        if (Math.random() < 0.004) {
          bp.tx = Math.max(120, Math.min(r.w - 120, bp.homeX + (Math.random() - 0.5) * 200));
          bp.ty = Math.max(r.walkTop + 60, Math.min(r.h - 90, bp.homeY + (Math.random() - 0.5) * 130));
        }
      } else {
        const dx = bp.tx - bp.x, dy = bp.ty - bp.y;
        const d = Math.hypot(dx, dy);
        if (d < 6) { bp.tx = null; bp.moving = false; }
        else {
          const sp = 36 * dt;
          const np = clampPt(bp.x + (dx / d) * sp, bp.y + (dy / d) * sp);
          bp.x = np.x; bp.y = np.y;
          bp.dir = dx >= 0 ? 1 : -1;
          bp.moving = true; bp.ph += dt * 8;
        }
      }
    });

    // animazioni giocatore
    if (player.anim && performance.now() > player.animT) player.anim = null;

    // aggiorna bolle
    const now = performance.now();
    bubbles = bubbles.filter(b => now < b.t + b.dur);
    fx = fx.filter(f => now < f.t + f.life);

    // ambient
    if (now - lastAmbient > D.ambientInterval) {
      lastAmbient = now;
      const candidates = roomBots.filter(bp => D.bots[bp.id] && !bubbles.some(b => b.owner === bp.id));
      if (candidates.length && Math.random() < 0.75) {
        const bp = candidates[Math.floor(Math.random() * candidates.length)];
        const lines = D.bots[bp.id].ambient || D.bots[bp.id].greet;
        say(bp, lines[Math.floor(Math.random() * lines.length)], 3600);
      }
    }
    // evento casuale divertente
    if (now - lastEvent > 26000 && Math.random() < 0.5) {
      lastEvent = now;
      const events = [
        '🎊 Consegna confetti a sorpresa in tutta la stanza!',
        '🦜 Un pappagallo ha imparato a dire “Bravo!” e ora applaude tutti.',
        '🧦 Qualcuno ha lasciato dei calzini arcobaleno appesi… chi sarà?',
        '☁️ Sta piovendo zucchero filato davanti alla finestra!',
        '📣 L’altoparlante: “Ricordate: qui il dress code è il sorriso”.'
      ];
      toast(events[Math.floor(Math.random() * events.length)]);
      if (Math.random() < 0.5) addCoins(2, true);
    }
  }

  /* ---------- bolle ---------- */
  function wrapLines(txt) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = '600 14px system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
    const max = 210;
    const words = String(txt).split(' ');
    const lines = []; let cur = '';
    words.forEach(w => {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > max && cur) { lines.push(cur); cur = w; }
      else cur = test;
    });
    if (cur) lines.push(cur);
    ctx.restore();
    return lines.length ? lines : [''];
  }
  function say(who, txt, dur, opts) {
    const isBot = !!(who.id !== undefined && who.id !== 'player');
    const x = isBot ? who.x : player.x;
    const y = isBot ? who.y - 8 : player.y;
    const o = opts || {};
    const botDef = isBot ? D.bots[who.id] : null;
    bubbles.push({
      x, y, owner: who.id || 'player',
      lines: wrapLines(txt), t: performance.now(),
      dur: dur || 3000,
      color: o.color || (isBot ? '#fff' : '#fffbe6'),
      ink: o.ink || (isBot ? '#3a2a8f' : '#5a3a00'),
      border: o.border || (botDef && botDef.top ? botDef.top : '#ffd166'),
      align: isBot ? -1 : 1
    });
  }
  // Battuta di storia di un NPC: fumetto dedicato sopra il personaggio
  function storySay(botId, text, emoji) {
    if (!text) return;
    const bp = roomBots ? roomBots.find(b => b.id === botId) : null;
    const who = bp || { id: botId, x: player.x + 34, y: player.y - 12 };
    const msg = (emoji ? emoji + ' ' : '') + text;
    say(who, msg, Math.max(4000, Math.min(9000, 1600 + msg.length * 45)), { color: '#f3e8ff', ink: '#38206b', border: '#5b3bd6' });
  }

  /* ---------- interazioni ---------- */
  function walkTo(x, y, act) {
    const p = clampPt(x, y);
    player.tx = p.x; player.ty = p.y;
    player._act = act;
    checkTutorial('move');
  }

  function talkBot(bp) {
    const b = D.bots[bp.id];
    bp.dir = (player.x <= bp.x) ? 1 : -1;
    player.face = bp.x >= player.x ? 1 : -1;
    const now = performance.now();
    const line = b.greet[Math.floor(Math.random() * b.greet.length)];
    say(bp, line, 3800);
    if (st.room === 'sotterraneo') societyMissionHit('shadow_talk');
    const prevTalk = lastBotTalk[bp.id];
    const canCoin = prevTalk === undefined || now - prevTalk > 5000;
    lastBotTalk[bp.id] = now;
    if (canCoin) { addCoins(2); spawnFx(bp.x, bp.y - 46, '🪙'); }
    if (canCoin && bp.id === guestId()) { addCoins(2); spawnFx(bp.x, bp.y - 60, '⭐'); }
    if (Math.random() < 0.25) playerWave(bp);
    const isFirstTalk = prevTalk === undefined;
    checkTutorial('talk');
    affTalk(bp.id);
    if (isFirstTalk) {
      const prevRating = (st.stars[bp.id] && st.stars[bp.id].rating) || 0;
      const newRating = computeStarRating(bp.id, 0.3);
      if (newRating >= 2.5 && prevRating < 2.5) toast('🥇 Prima visita a ' + b.name + ' — è diventato Gold!');
    }
  }
  function playerWave(who) {
    setAnim('wave', 1400);
  }
  function setAnim(anim, dur) {
    player.anim = anim; player.animT = performance.now() + (dur || 1400);
  }
  function spawnFx(x, y, e, size) {
    fx.push({ x, y, e, life: 1300, t: performance.now(), size: size || 18 });
  }

  function interactFurniture(f) {
    const key = st.room + ':' + f.e;
    const now = performance.now();
    const reply = D.furnitureReplies[f.e];
    if (!reply) return;
    const prevFurn = lastFurnTalk[key];
    if (f.xl && prevFurn !== undefined && now - prevFurn < 9000) return;
    lastFurnTalk[key] = now;
    bubbles.push({ x: f.x, y: f.y - 20, owner: 'f' + key, lines: wrapLines(reply), t: now, dur: 3600, color: '#e9f7ff', ink: '#1b5e79', border: '#40c4ff' });
    if (f.xl) { addCoins(1 + Math.floor(Math.random() * 2)); spawnFx(f.x, f.y - 44, '🪙'); missionHit('furn', null); }
    blip(520, .08, 'sine');
  }

  /* ---------- emotes ---------- */
  function doEmote(e) {
    st.emotesUsed = st.emotesUsed || [];
    if (!st.emotesUsed.includes(e.id)) st.emotesUsed.push(e.id);
    checkEmoteAchievement();
    checkTutorial('emote');
    setAnim(e.anim, e.dur);
    say({ id: 'player', x: player.x, y: player.y }, e.txt, e.dur);
    const nearBot = roomBots.find(bp => Math.hypot(bp.x - player.x, bp.y - player.y) < 230) || null;
    if (nearBot) affEmote(nearBot.id, e.id); else missionHit('emote', null);
    const ejs = { wave: '👋', dance: '🎵', jump: '⭐', clap: '👏', heart: '💖', angry: '💢', laugh: '😂', dive: '💦' };
    for (let i = 0; i < 5; i++) setTimeout(() => spawnFx(player.x + (Math.random() - 0.5) * 40, player.y - 40, ejs[e.anim] || '✨', 15 + Math.random() * 9), i * 120);
    if (e.anim === 'dance') blip(660, .15, 'square');
    advanceGhostMission('dance', e.id);
    // reazione simpatica di un ospite vicino
    const near = roomBots.find(bp => Math.hypot(bp.x - player.x, bp.y - player.y) < 240);
    if (near && Math.random() < 0.5) {
      setTimeout(() => {
        const lines = D.bots[near.id].ambient || D.bots[near.id].greet;
        say(near, lines[Math.floor(Math.random() * lines.length)], 3200);
      }, 800);
    }
  }

  /* ---------- chat ---------- */
  function sendChat(txt) {
    txt = String(txt || '').trim();
    if (!txt) return;
    say({ id: 'player' }, txt, 3600, { color: '#fffbe6', ink: '#5a3a00', border: '#ffd166' });
    broadcast(txt); // chat cross-tab
    const now = performance.now();
    const prevChat = lastChatCoin;
    if (prevChat === 0 || now - prevChat > 9000) { addCoins(1); spawnFx(player.x, player.y - 46, '🪙'); lastChatCoin = now; }
    const low = txt.toLowerCase();
    const hit = D.chatTriggers.find(tr => tr.words.some(w => low.includes(w)));
    missionHit('chat', null);
    if (hit && hit.words.some(w => w === 'ciao')) missionHit('chatWord', null);
    if (hit) {
      const responder = roomBots.filter(bp => D.bots[bp.id]).sort((a, b) =>
        Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0];
      if (responder) setTimeout(() => say(responder, hit.reply, 4000), 900);
      else setTimeout(() => {
        const rp = { id: 'player', x: player.x, y: player.y };
        say(rp, '📣 L’eco del Miraggio risponde: “' + hit.reply + '”', 4200, { color: '#efe6ff', ink: '#5b3bd6', border: '#8b6cff' });
      }, 700);
    }
    blip(700, .07, 'sine');
    closeComposer();
  }

  /* ============================ DISEGNO ============================ */
  function drawFloor() {
    const r = room();
    const ts = 46;
    // day/night tint
    const dayR = Math.round(255 * (1 - dayTime * 0.6));
    const dayG = Math.round(220 * (1 - dayTime * 0.5));
    const dayB = Math.round(180 * (1 - dayTime * 0.4));
    const nightFactor = dayTime < 0.3 || dayTime > 0.85 ? 0.3 : 0;
    const floor1T = r.floor1;
    const floor2T = r.floor2;
    for (let gy = 0; gy < Math.ceil(r.h / ts); gy++) {
      for (let gx = 0; gx < Math.ceil(r.w / ts); gx++) {
        const base = (gx + gy) % 2 ? r.floor2 : r.floor1;
        // parse hex
        const cr = parseInt(base.slice(1,3),16), cg = parseInt(base.slice(3,5),16), cb = parseInt(base.slice(5,7),16);
        const nr = Math.round(cr * (1 - nightFactor) + dayR * nightFactor * 0.3);
        const ng = Math.round(cg * (1 - nightFactor) + dayG * nightFactor * 0.3);
        const nb = Math.round(cb * (1 - nightFactor) + dayB * nightFactor * 0.3);
        ctx.fillStyle = `rgb(${nr},${ng},${nb})`;
        ctx.fillRect(gx * ts, gy * ts, ts, ts);
      }
    }
    // muro: strisce allegre
    const wallNight = nightFactor > 0.2;
    ctx.fillStyle = wallNight ? '#1a1a3e' : r.wall;
    ctx.fillRect(0, 0, r.w, 18);
    ctx.fillStyle = wallNight ? 'rgba(255,200,100,.15)' : 'rgba(255,255,255,.25)';
    for (let x = 0; x < r.w; x += 40) ctx.fillRect(x, 4, 18, 10);
    ctx.fillStyle = 'rgba(0,0,0,.10)';
    ctx.fillRect(0, 18, r.w, 7);
    // battiscopa
    ctx.fillStyle = wallNight ? 'rgba(255,200,100,.1)' : 'rgba(255,255,255,.18)';
    ctx.fillRect(0, r.h - 8, r.w, 8);
    // lanterne notturne
    if (wallNight) {
      const lanterns = [{x:100},{x:300},{x:500},{x:650}];
      lanterns.forEach(l => {
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 500 + l.x);
        ctx.fillStyle = `rgba(255,180,50,${0.1 + pulse * 0.15})`;
        ctx.beginPath(); ctx.arc(l.x, 15, 12, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgba(255,220,100,${0.3 + pulse * 0.3})`;
        ctx.beginPath(); ctx.arc(l.x, 15, 5, 0, TAU); ctx.fill();
      });
    }
  }

  function EMOJI(size) { return size + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; }

  function drawWorld() {
    ctx.save();
    ctx.translate(cam.ox, cam.oy);
    ctx.scale(cam.s, cam.s);
    drawFloor();
    const r = room();

    // mobili
    (r.furniture || []).forEach(f => {
      ctx.fillStyle = 'rgba(60,20,100,.12)';
      ctx.beginPath();
      ctx.ellipse(f.x, f.y + (f.s || 34) * 0.36, (f.s || 34) * 0.4, (f.s || 34) * 0.13, 0, 0, TAU);
      ctx.fill();
      ctx.font = EMOJI(f.s || 34);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.e, f.x, f.y);
      if (f.xl) { // oggetto interattivo: piccolo luccichio
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 300 + f.x);
        ctx.strokeStyle = 'rgba(255,209,102,' + (0.25 + pulse * 0.4) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(f.x, f.y - 4, (f.s || 34) * 0.42 + pulse * 2, 0, TAU);
        ctx.stroke();
      }
});
     // gateway dimensionali
     const dimRooms = ['atrio_dark', 'atrio_neon', 'atrio_steam', 'sala_giochi_dark', 'sala_giochi_neon', 'sala_giochi_steam', 'discoteca_dark', 'discoteca_neon', 'discoteca_steam', 'terrazza_dark', 'terrazza_neon', 'terrazza_steam'];
     dimRooms.forEach(dr => {
       const drRoom = D.rooms[dr];
       if (!drRoom || drRoom.bots.length === 0) return;
       const portal = drRoom.furniture.find(f => f.e === '🌑' || f.e === '💜' || f.e === '⚙️');
       if (!portal) return;
       const dim = dr.split('_').pop();
       const dimUnlock = dim === 'dark' ? st.dimensions.dark : dim === 'neon' ? st.dimensions.neon : st.dimensions.steam;
       if (!dimUnlock) return;
       const sx = (portal.x - cam.ox) * cam.s;
       const sy = (portal.y - cam.oy) * cam.s;
       const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 500 + portal.x);
       ctx.save();
       ctx.globalAlpha = 0.3 + pulse * 0.3;
       ctx.beginPath(); ctx.arc(sx, sy - 4 * cam.s, 20 * cam.s, 0, TAU);
       ctx.fillStyle = dim === 'dark' ? 'rgba(100,0,200,0.4)' : dim === 'neon' ? 'rgba(255,0,255,0.4)' : 'rgba(255,165,0,0.4)';
       ctx.fill();
       ctx.globalAlpha = 0.8 + pulse * 0.2;
       ctx.font = (36 * cam.s) + 'px serif';
       ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
       ctx.fillText(portal.e, sx, sy - 4 * cam.s);
       ctx.restore();
     });
     if (r.id === 'camera') drawCameraExtras();

     // particelle ambientali
    const now = performance.now();
    ambientParticles.forEach(p => {
      const pct = 1 - (now - p.t) / p.life;
      const alpha = Math.max(0, pct);
      if (p.type === 'firefly') {
        ctx.fillStyle = `rgba(200,255,50,${alpha * 0.7})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgba(255,255,100,${alpha * 0.3})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, TAU); ctx.fill();
      } else if (p.type === 'sparkle') {
        ctx.fillStyle = `rgba(255,200,255,${alpha * 0.6})`;
        const s = 2 + Math.sin(now / 200 + p.x) * 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, TAU); ctx.fill();
      } else if (p.type === 'star') {
        ctx.fillStyle = `rgba(255,255,200,${alpha * 0.5})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, TAU); ctx.fill();
      } else if (p.type === 'ghost') {
        ctx.fillStyle = `rgba(200,100,255,${alpha * 0.4})`;
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👻', p.x, p.y);
      } else if (p.type === 'snow') {
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2 + Math.sin(now / 300 + p.x) * 0.5, 0, TAU); ctx.fill();
      } else if (p.type === 'petal') {
        ctx.fillStyle = `rgba(255,150,180,${alpha * 0.5})`;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, 3, 1.5, now / 1000 + p.x, 0, TAU); ctx.fill();
      } else if (p.type === 'wave') {
        ctx.fillStyle = `rgba(100,200,255,${alpha * 0.4})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2 + Math.sin(now / 200 + p.x) * 1, 0, TAU); ctx.fill();
      } else {
        ctx.fillStyle = `rgba(200,200,200,${alpha * 0.3})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, TAU); ctx.fill();
      }
    });
    // collezionabili volanti
    flyingCollectibles.forEach(c => {
      const pct = 1 - (now - c.t) / c.life;
      const alpha = Math.max(0, pct * pct);
      const bob = Math.sin(now / 400 + c.x) * 3;
      ctx.globalAlpha = alpha;
      ctx.font = '22px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.e, c.x, c.y + bob);
      // glow
      ctx.fillStyle = c.e === '🪙' ? 'rgba(255,209,102,0.15)' : 'rgba(255,215,0,0.15)';
      ctx.beginPath(); ctx.arc(c.x, c.y + bob, 10, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    });

    // bot
    roomBots.forEach(bp => {
      const b = D.bots[bp.id];
      if (!b) return;
      drawAv(bp.x, bp.y, bp.moving ? Math.floor(bp.ph) % 2 : 0, bp.dir, b, 1, false);
      // stella aura
      const sr = (st.stars && st.stars[bp.id] && st.stars[bp.id].rating) || 0;
      if (sr >= 2.0) {
        const now = performance.now();
        const glow = sr >= 4.5 ? 20 : sr >= 3.5 ? 16 : 12;
        const hue = sr >= 4.5 ? 45 : sr >= 3.5 ? 40 : 45;
        const alpha = 0.15 + Math.sin(now / 500 + bp.x) * 0.05;
        ctx.save();
        ctx.globalAlpha = alpha;
        const grad = ctx.createRadialGradient(bp.x, bp.y, 5, bp.x, bp.y, glow);
        grad.addColorStop(0, 'hsla(' + hue + ', 100%, 70%, ' + alpha + ')');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(bp.x, bp.y, glow, 0, TAU); ctx.fill();
        if (sr >= 4.5) {
          for (let i = 0; i < 6; i++) {
            const a = now / 300 + i * Math.PI / 3;
            const sx = bp.x + Math.cos(a) * (glow + 5 + Math.sin(now / 200 + i) * 3);
            const sy = bp.y + Math.sin(a) * (glow + 5 + Math.cos(now / 200 + i) * 3);
            ctx.fillStyle = 'rgba(255,215,0,' + (0.6 + Math.sin(now / 150 + i) * 0.3) + ')';
            ctx.beginPath(); ctx.arc(sx, sy, 2, 0, TAU); ctx.fill();
          }
        }
        ctx.restore();
      }
    });
    // ghost NPCs
    drawGhosts();
    // giocatore
    const pwalk = player.moving ? Math.floor(player.ph) % 2 : 0;
    drawAv(player.x, player.y, pwalk, player.face, st.outfit, 1, true);
    // pet companioni
    st.pets.forEach((pet, idx) => {
      const sp = getSpecies(pet);
      const px = pet.x, py = pet.y;
      if (px === undefined || py === undefined) return;
      const now = performance.now();
      const bob = Math.sin(now / 400 + idx * 1.5) * 3;
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      ctx.beginPath(); ctx.ellipse(px, py + 2, 10, 4, 0, 0, TAU); ctx.fill();
      // emoji
      ctx.font = '22px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(sp.emoji, px, py + bob);
      // glow se tier raro+
      if (sp.tier === 'raro' || sp.tier === 'epico' || sp.tier === 'leggendario') {
        ctx.save();
        ctx.globalAlpha = 0.3 + Math.sin(now / 300 + idx) * 0.15;
        const grad = ctx.createRadialGradient(px, py + bob, 5, px, py + bob, 20);
        grad.addColorStop(0, sp.glow);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(px, py + bob, 20, 0, TAU); ctx.fill();
        ctx.restore();
      }
      // sparkles se felice
      if (pet.happiness > 80 && Math.random() < 0.02) {
        spawnFx(px + (Math.random() - 0.5) * 15, py + bob - 5, '✨', 10);
      }
      // hunger indicator
      if (pet.hunger > 70) {
        ctx.font = '10px system-ui';
        ctx.fillStyle = '#ff4444';
        ctx.textAlign = 'center';
        ctx.fillText('🍖', px, py + bob - 16);
      }
    });

    ctx.restore();
  }

  function drawAv(x, y, walk, face, o, scale, isPlayer) {
    // o: {skin, hairColor, hairStyle, top, pants, acc}
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * face, scale);
    const now = performance.now();
    let bobY = 0, tilt = 0;
    const anim = isPlayer ? player.anim : null;
    if (anim === 'dance') { bobY = Math.sin(now / 90) * 5; tilt = Math.sin(now / 140) * 0.08; }
    else if (anim === 'jump') { const p = Math.max(0, 1 - (now % 700) / 700); bobY = -Math.sin(p * Math.PI) * 16; }
    else if (anim === 'wave') tilt = -0.06;
    else if (anim === 'heart') bobY = Math.sin(now / 150) * 2;
    else if (isPlayer && player.moving) bobY = Math.sin(player.ph * 0.6) * 1.2;
    ctx.translate(0, bobY);
    if (tilt) ctx.rotate(tilt * face);

    // ombra
    ctx.fillStyle = 'rgba(60,20,100,.16)';
    ctx.beginPath(); ctx.ellipse(0, 13, 14, 4.6, 0, 0, TAU); ctx.fill();

    // gambe + scarpe
    const legSwing = walk ? Math.sin(walk * Math.PI) * 3.4 : 0;
    ctx.fillStyle = o.pants;
    ctx.fillRect(-5.5, 1, 4.6, 8 + legSwing * 0.15);
    ctx.fillRect(0.9, 1, 4.6, 8 - legSwing * 0.15);
    ctx.fillStyle = '#2a2140';
    ctx.fillRect(-6.4, 9.4, 6.2, 3);
    ctx.fillRect(0.2, 9.4, 6.2, 3);

    // busto (tuta)
    ctx.fillStyle = o.top;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-10, -12, 20, 18, 5) : ctx.rect(-10, -12, 20, 18);
    ctx.fill();
    // zip
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.fillRect(-1.2, -12, 2.4, 18);

    // braccia (quella che saluta si alza)
    const waving = anim === 'wave' || (isPlayer && player.anim === 'wave');
    const armL = waving ? -Math.sin(now / 160) * 3 : 0;
    ctx.fillStyle = o.top;
    ctx.fillRect(-13.4, -8 - armL, 3.8, 13 + armL);
    ctx.fillRect(9.6, -8, 3.8, 13);
    ctx.fillStyle = o.skin;
    ctx.fillRect(-14.2, 4.5 - armL * 0.5, 5, 4);
    ctx.fillRect(9, 4.5, 5, 4);

    // testa grande (stile chibi)
    ctx.fillStyle = o.skin;
    ctx.beginPath(); ctx.arc(0, -21, 12, 0, TAU); ctx.fill();
    // orecchie
    ctx.fillRect(-12.5, -23, 2.6, 4);
    ctx.fillRect(9.9, -23, 2.6, 4);

    // occhi + bocca
    const blink = (now % 3200) < 120;
    ctx.fillStyle = '#261a3d';
    if (!blink) {
      ctx.fillRect(-6, -22.5, 2.4, 3.4);
      ctx.fillRect(3.6, -22.5, 2.4, 3.4);
    } else {
      ctx.fillRect(-6, -21, 2.6, 1.1);
      ctx.fillRect(3.6, -21, 2.6, 1.1);
    }
    ctx.strokeStyle = '#261a3d'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
    if (anim === 'angry') {
      ctx.beginPath(); ctx.moveTo(-1.6, -12.4); ctx.quadraticCurveTo(0, -10.8, 1.6, -12.4); ctx.stroke();
      ctx.strokeStyle = '#e33'; ctx.beginPath(); ctx.moveTo(-7, -24); ctx.lineTo(-3, -21); ctx.stroke(); ctx.beginPath(); ctx.moveTo(7, -24); ctx.lineTo(3, -21); ctx.stroke();
    } else if (anim === 'laugh') {
      ctx.fillStyle = '#8a3a50'; ctx.beginPath(); ctx.arc(0, -11.6, 3, 0, TAU); ctx.fill();
    } else if (anim === 'heart') {
      ctx.fillStyle = '#ff5d9e'; ctx.font = '10px sans-serif'; ctx.fillText('♥', -4.6, -10.6);
    } else if (anim === 'dance') {
      ctx.beginPath(); ctx.arc(0, -12.4, 2.2, 0, TAU); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, -12.6, 2.4, 0.1, Math.PI - 0.1); ctx.stroke();
      // guance
      ctx.fillStyle = 'rgba(255,120,140,.5)';
      ctx.beginPath(); ctx.arc(-7.4, -17.5, 2.3, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(7.4, -17.5, 2.3, 0, TAU); ctx.fill();
    }

    // capelli
    ctx.fillStyle = o.hairColor;
    const hs = o.hairStyle;
    if (hs === 'bald') {
      ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, -21, 11, 0, TAU); ctx.stroke();
    } else if (hs === 'long') {
      ctx.beginPath(); ctx.arc(0, -22.5, 12.2, Math.PI * 0.9, Math.PI * 0.1); ctx.fill();
      ctx.fillRect(-10.5, -24, 4.5, 16);
      ctx.fillRect(6, -24, 4.5, 16);
    } else if (hs === 'curly') {
      ctx.beginPath(); ctx.arc(0, -23.5, 12, Math.PI, 0); ctx.fill();
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + (i / 6) * Math.PI;
        ctx.beginPath(); ctx.arc(Math.cos(a) * 10.4, -23.8 + Math.sin(a) * 3.4, 2.6, 0, TAU); ctx.fill();
      }
    } else if (hs === 'puff') {
      ctx.beginPath(); ctx.arc(0, -24.5, 9.4, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.arc(-7.6, -23.5, 5.4, Math.PI * 0.6, Math.PI * 1.6); ctx.fill();
      ctx.beginPath(); ctx.arc(7.6, -23.5, 5.4, Math.PI * 0.4, -Math.PI * 0.6); ctx.fill();
      ctx.fillStyle = '#ff8f8f';
      ctx.beginPath(); ctx.arc(0, -33.5, 3.2, 0, TAU); ctx.fill();
    } else { // short
      ctx.beginPath(); ctx.arc(0, -22.5, 12.2, Math.PI, 0); ctx.fill();
    }
    // accessori
    if (o.acc === 'glasses') {
      ctx.strokeStyle = '#3a2a8f'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(-4.8, -21, 3.4, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(4.8, -21, 3.4, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-1.4, -21); ctx.lineTo(1.4, -21); ctx.stroke();
    } else if (o.acc === 'cap') {
      ctx.fillStyle = o.top;
      ctx.beginPath(); ctx.arc(0, -23.4, 12.4, Math.PI * 0.94, Math.PI * 0.06); ctx.fill();
      ctx.fillRect(-13, -23.6, 26, 3.2);
      ctx.beginPath(); ctx.arc(-11, -21, 2.6, 0, TAU); ctx.fill();
    } else if (o.acc === 'headphones') {
      ctx.strokeStyle = '#3a2a8f'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -22, 12.6, Math.PI * 0.82, Math.PI * 1.18); ctx.stroke();
      ctx.fillStyle = '#ff5d9e';
      ctx.fillRect(-14.6, -27.4, 5.6, 8);
      ctx.fillRect(9, -27.4, 5.6, 8);
    } else if (o.acc === 'crown') {
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.moveTo(-9.5, -33.6); ctx.lineTo(-9.5, -26.4);
      ctx.lineTo(-4.6, -30.2); ctx.lineTo(0, -26.4); ctx.lineTo(4.6, -30.2); ctx.lineTo(9.5, -26.4); ctx.lineTo(9.5, -33.6);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff5d9e';
      [[-6.6, -27], [0, -27], [6.6, -27]].forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 1.2, 0, TAU); ctx.fill(); });
    }
    ctx.restore();
  }

  function drawScreen() {
    // etichette bot
    roomBots.forEach(bp => {
      const s = toS(bp.x, bp.y - 46);
      const nm = D.bots[bp.id] && D.bots[bp.id].name || bp.id;
      ctx.font = '900 12px system-ui,sans-serif';
      const w = ctx.measureText(nm).width + 14;
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.beginPath(); rr(s.x - w / 2, s.y - 9, w, 17, 9); ctx.fill();
      ctx.fillStyle = '#4a2a8f';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(nm, s.x, s.y + 0.5);
    });
    // bolle
    const now = performance.now();
    bubbles.forEach(b => {
      const sp = toS(b.x, b.y - (b.owner === 'player' ? 62 : 50));
      const fade = Math.min(1, (b.t + b.dur - now) / 260, (now - b.t) / 180 + 0.6);
      let w = 0;
      ctx.font = '600 13.5px system-ui,sans-serif';
      b.lines.forEach(l => { w = Math.max(w, ctx.measureText(l).width); });
      const bw = w + 18, bh = b.lines.length * 17 + 10;
      let bx = Math.min(Math.max(sp.x - bw / 2, 4), CW - bw - 4);
      let by = Math.max(sp.y - bh - 4, 8);
      if (by < 40 && b.owner === 'player') by = 46;
      ctx.globalAlpha = Math.max(0.05, Math.min(1, fade));
      ctx.fillStyle = b.color || '#fff';
      ctx.strokeStyle = b.border || '#c9b6ff';
      ctx.lineWidth = 2;
      ctx.beginPath(); rr(bx, by, bw, bh, 11); ctx.fill(); ctx.stroke();
      // coda
      ctx.fillStyle = b.color || '#fff';
      ctx.beginPath();
      ctx.moveTo(bx + bw / 2 - 5, by + bh - 1);
      ctx.lineTo(bx + bw / 2, by + bh + 8);
      ctx.lineTo(bx + bw / 2 + 5, by + bh - 1);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = b.ink || '#3a2a8f';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      b.lines.forEach((l, i) => ctx.fillText(l, bx + bw / 2, by + 8 + i * 17 + 4));
      ctx.globalAlpha = 1;
    });
    // effetti
    fx.forEach(f => {
      const p = (now - f.t) / f.life;
      const sp = toS(f.x, f.y - p * 70);
      ctx.globalAlpha = 1 - p;
      ctx.font = (f.size || 18) + 'px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(f.e, sp.x, sp.y);
      ctx.globalAlpha = 1;
    });
  }

  function rr(x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    if (!room()) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, CW, CH);
    drawWorld();
    drawScreen();
    // overlay giorno/notte
    const nightAlpha = dayTime < 0.3 || dayTime > 0.85 ? Math.min(0.35, (dayTime < 0.3 ? 0.3 - dayTime : dayTime - 0.85) * 1.5) : 0;
    if (nightAlpha > 0.01) {
      ctx.fillStyle = `rgba(5,5,30,${nightAlpha})`;
      ctx.fillRect(0, 0, CW, CH);
    }
    // weather overlay
    drawWeather();
    // room transition fade
    if (roomTransition) {
      const elapsed = performance.now() - roomTransition.t;
      const alpha = elapsed < 200 ? elapsed / 200 : Math.max(0, 1 - (elapsed - 200) / 200);
      if (alpha > 0.01) {
        ctx.fillStyle = `rgba(20,10,40,${alpha})`;
        ctx.fillRect(0, 0, CW, CH);
      }
      if (elapsed > 400) roomTransition = null;
    }
    // indicatorlo ora
    const h = Math.floor(dayTime * 24);
    const m = Math.floor((dayTime * 24 - h) * 60);
    const isNight = dayTime < 0.3 || dayTime > 0.85;
    ctx.fillStyle = isNight ? 'rgba(255,200,50,0.6)' : 'rgba(255,255,255,0.4)';
    ctx.font = '12px system-ui,sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(isNight ? '🌙 ' + String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') : '☀️ ' + String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0'), 8, CH - 12);
    // minimap
    const r = room();
    if (r && r.w && r.h) {
      const mmSize = 90;
      const mmX = CW - mmSize - 12;
      const mmY = CH - mmSize - 12;
      const scale = mmSize / Math.max(r.w, r.h);
      ctx.fillStyle = 'rgba(0,0,0,.45)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(mmX, mmY, mmSize, mmSize, 8); else ctx.rect(mmX, mmY, mmSize, mmSize);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(mmX, mmY, mmSize, mmSize);
      // stanze
      const roomKeys = D.rooms ? Object.keys(D.rooms) : [];
      const cols = 3;
      const roomW = mmSize / cols;
      const roomH = mmSize / 3;
      roomKeys.forEach(rid => {
        const rm = D.rooms[rid];
        if (!rm) return;
        if (rm.hidden && !isMysterySolved('mystery_2') && !canEnterSotterraneo() && st.room !== rid) return;
        const col = rm.x !== undefined ? rm.x : 0;
        const row = rm.y !== undefined ? rm.y : 0;
        const rx = mmX + col * roomW + 2;
        const ry = mmY + row * roomH + 2;
        const rw = roomW - 4;
        const rh = roomH - 4;
        ctx.fillStyle = rid === st.room ? 'rgba(61,220,151,.5)' : 'rgba(255,255,255,.1)';
        ctx.fillRect(rx, ry, rw, rh);
        // room emoji
        ctx.font = '8px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rid === st.room ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.3)';
        ctx.fillText(rm.emoji, rx + rw / 2, ry + rh / 2);
      });
      // player
      const px = mmX + player.x * scale;
      const py = mmY + player.y * scale;
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.arc(px, py, 3, 0, TAU); ctx.fill();
      // bots
      roomBots.forEach(bp => {
        ctx.fillStyle = '#3ddc97';
        ctx.beginPath(); ctx.arc(mmX + bp.x * scale, mmY + bp.y * scale, 2, 0, TAU); ctx.fill();
      });
    }
  }

  /* ============================ INPUT ============================ */
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const w = toW(e.clientX, e.clientY);
    const r = room();
    let target = null, best = 60;
    if (w.x < 20 || w.y < 20 || w.x > r.w - 20 || w.y > r.h - 20) return;
    // builder mode
    if (st.builder && st.builder.active) {
      const slots = room().slots || [];
      let done = false;
      slots.forEach((sp, si) => {
        if (done) return;
        const placed = st.builder.slots.find(p => p.slot === si);
        if (Math.hypot(sp.x - w.x, sp.y - w.y) < 52) {
          done = true;
          if (placed) {
            st.builder.slots = st.builder.slots.filter(p => p.slot !== si);
            st.shopItems.push(placed.e);
            toast('🗑️ Rimosso ' + placed.e);
            save(); renderBuilder();
          } else if (st.shopItems.length) {
            const e = st.shopItems.shift();
            st.builder.slots.push({ e, slot: si, last: Date.now() });
            toast('📍 Posizionato ' + e);
            save(); renderBuilder();
          } else {
            toast('📦 Magazzino vuoto!');
          }
        }
      });
      if (done) return;
    }
    // la tua camera: posiziona/rimuovi mobili
    if (st.room === 'camera' && !st.builder.active) {
      const slots = room().slots || [];
      let done = false;
      slots.forEach((sp, si) => {
        if (done) return;
        const placed = st.placed.find(p => p.slot === si);
        if (Math.hypot(sp.x - w.x, sp.y - w.y) < 52) {
          done = true;
          if (placed) {
            walkTo(sp.x, sp.y + 10, () => removePlaced(si));
          } else if (st.shopItems.length) {
            walkTo(sp.x, sp.y + 10, () => placeFirst(si));
          } else {
            walkTo(sp.x, sp.y + 10, () => toast('Magazzino vuoto: compra un mobile al 🛒 Negozio'));
          }
        }
      });
      if (done) return;
    }
    // sotterraneo: slot interazione
    if (st.room === 'sotterraneo') {
      const slots = room().slots || [];
      let done = false;
      slots.forEach((sp, si) => {
        if (done) return;
        if (Math.hypot(sp.x - w.x, sp.y - w.y) < 52) {
          done = true;
          visitSotterraneo();
        }
      });
      if (done) return;
    }
    // gateway dimensionali
     const dimRooms = ['atrio_dark', 'atrio_neon', 'atrio_steam', 'sala_giochi_dark', 'sala_giochi_neon', 'sala_giochi_steam', 'discoteca_dark', 'discoteca_neon', 'discoteca_steam', 'terrazza_dark', 'terrazza_neon', 'terrazza_steam'];
     dimRooms.forEach(dr => {
       const drRoom = D.rooms[dr];
       if (!drRoom) return;
       const portal = drRoom.furniture.find(f => f.e === '🌑' || f.e === '💜' || f.e === '⚙️');
       if (portal) {
         const d = Math.hypot(portal.x - w.x, portal.y - w.y);
         if (d < 50) { best = 30; target = { kind: 'gateway', roomId: dr }; }
       }
     });
      if (target && target.kind === 'gateway') {
        enterDimension(target.roomId.replace(/^.*_/, ''));
        return;
      }
    // bot?
    target = null; best = 60;
    roomBots.forEach(bp => {
      const d = Math.hypot(bp.x - w.x, bp.y - w.y);
      if (d < best) { best = d; target = { kind: 'bot', bp }; }
    });
    if (target) {
      walkTo(target.bp.x - 12, target.bp.y + 16, () => talkBot(target.bp));
      return;
    }
    // mobili interattivi
    let fur = null, fbest = 60;
    (r.furniture || []).forEach(f => {
      const d = Math.hypot(f.x - w.x, f.y - w.y);
      if (d < fbest) { fbest = d; fur = f; }
    });
    if (fur && D.furnitureReplies[fur.e]) {
      walkTo(fur.x + (fur.x < w.x ? -14 : 14), fur.y + 16, () => interactFurniture(fur));
      return;
    }
    // collezionabili volanti
    const now = performance.now();
    for (let i = flyingCollectibles.length - 1; i >= 0; i--) {
      const c = flyingCollectibles[i];
      if (Math.hypot(c.x - w.x, c.y - w.y) < 25) {
        const earned = c.e === '🪙' ? 2 : 5;
        addCoins(earned);
        spawnFx(c.x, c.y, c.e, 20);
        flyingCollectibles.splice(i, 1);
        toast('🪙 +' + earned + ' raccolto!');
        blip(880, .08, 'triangle');
        st.stats.totalCollected = (st.stats.totalCollected || 0) + 1;
        if (st.stats.totalCollected >= 5 && !achievements.collect_5) unlockAch('collect_5');
        advanceGhostMission('collect', c.e === '🪙' ? 'uova' : 'palla');
        save();
        return;
      }
    }
    // click su pet
    for (let i = 0; i < st.pets.length; i++) {
      const pet = st.pets[i];
      if (pet.x !== undefined && Math.hypot(pet.x - w.x, pet.y - w.y) < 25) {
        renderPetMenu(i);
        blip(660, .1, 'square');
        return;
      }
    }
    walkTo(w.x, w.y);
  });

  /* ============================ UI: stanze ============================ */
function renderRooms() {
     const list = $('roomList');
     list.innerHTML = '';
     Object.keys(D.rooms).forEach(id => {
       const r = D.rooms[id];
       if (r.hidden && !isMysterySolved('mystery_2') && !canEnterSotterraneo() && st.room !== id) return;
       // dimension gateways
       if (id.startsWith('atrio_') || id.startsWith('sala_giochi_') || id.startsWith('discoteca_') || id.startsWith('terrazza_')) {
         const dim = id.split('_').pop();
         const dimUnlock = dim === 'dark' ? st.dimensions.dark : dim === 'neon' ? st.dimensions.neon : st.dimensions.steam;
         if (!dimUnlock) return;
       }
       const b = document.createElement('button');
       b.className = 'room' + (st.room === id ? ' here' : '');
       b.dataset.room = id;
       const dimBadge = (id === 'atrio_dark' || id === 'discoteca_dark' || id === 'terrazza_dark') ? ' 🌑' : (id === 'atrio_neon' || id === 'discoteca_neon' || id === 'terrazza_neon') ? ' 💜' : (id === 'atrio_steam' || id === 'discoteca_steam' || id === 'terrazza_steam') ? ' ⚙️' : '';
       b.innerHTML = '<span class="re">' + r.emoji + '</span><span style="flex:1"><b>' + r.name + dimBadge + '</b><small>' + r.hint + '</small></span>' +
         (st.room === id ? '<span class="online">● qui</span>' : '<span class="online">' + (2 + Math.floor(Math.random() * 5)) + ' in stanza</span>');
       b.onclick = () => { $('sRooms').classList.remove('on'); enterRoom(id); };
       list.appendChild(b);
     });
   }

  /* ============================ UI: guardaroba ============================ */
  function ownedColor(hex) { return st.ownedColors.includes(hex); }
  function buyEquipColor(hex) {
    const isSkin = D.skins.includes(hex), isHair = D.hairColors.includes(hex),
      isTop = D.tops.includes(hex), isPants = D.pants.includes(hex);
    const idx = isSkin ? D.skins.indexOf(hex) : isHair ? D.hairColors.indexOf(hex) : isTop ? D.tops.indexOf(hex) : D.pants.indexOf(hex);
    let cost = idx <= 1 ? 0 : 12;
    cost = effCost(cost);
    const slot = isSkin ? 'skin' : isHair ? 'hairColor' : isTop ? 'top' : 'pants';
    if (!ownedColor(hex)) {
      if (st.coins < cost) { toast('🪙 Ti servono ' + cost + ' monete per questo colore'); return; }
      st.coins -= cost; st.ownedColors.push(hex);
      coinSound();
    }
    st.outfit[slot] = hex;
    equipDone();
  }
  function equipStyle(slot, id, cost, type) {
    const owned = type === 'style' ? st.ownedStyles.includes(id) : st.ownedAcc.includes(id);
    cost = effCost(cost);
    if (!owned) {
      if (st.coins < cost) { toast('🪙 Ti servono ' + cost + ' monete'); return; }
      st.coins -= cost;
      (type === 'style' ? st.ownedStyles : st.ownedAcc).push(id);
      coinSound();
    }
    st.eqStyle[slot] = id;
    st.outfit[slot] = id;
    equipDone();
  }
  function equipDone() { updateHUD(); save(); renderWardrobe(); draw(); }
  function colorBtn(hex, on) {
    return '<button class="opt ' + (on ? 'on' : '') + '" data-hex="' + hex + '"><span class="sw" style="background:' + hex + '"></span>' +
      (ownedColor(hex) ? '' : '<small class="coin-tag">🪙12</small>') + '</button>';
  }
  function renderWardrobe() {
    checkTutorial('wardrobe');
    $('coinLbl').textContent = '🪙 ' + st.coins;
    const body = $('wardBody');
    let h = '';
    // capelli
    h += '<div class="gtitle">Taglio di capelli</div><div class="rowopt">';
    D.wardrobe.hairStyle.forEach(opt => {
      const owned = st.ownedStyles.includes(opt.id);
      h += '<button class="opt ' + (st.eqStyle.hairStyle === opt.id ? 'on' : '') + (owned ? '' : ' lock') + '" data-style="' + opt.id + '" data-slot="hairStyle" data-cost="' + opt.cost + '">' + opt.label +
        (owned ? '' : ' <small class="coin-tag">🪙' + effCost(opt.cost) + '</small>') + '</button>';
    });
    h += '</div>';
    h += '<div class="gtitle">Accessorio</div><div class="rowopt">';
    D.wardrobe.acc.forEach(opt => {
      const owned = st.ownedAcc.includes(opt.id);
      h += '<button class="opt ' + (st.eqStyle.acc === opt.id ? 'on' : '') + (owned ? '' : ' lock') + '" data-acc="' + opt.id + '" data-cost="' + opt.cost + '">' + opt.label +
        (owned ? '' : ' <small class="coin-tag">🪙' + effCost(opt.cost) + '</small>') + '</button>';
    });
    h += '</div>';
    h += '<div class="gtitle">Pelle</div><div class="rowopt">' + D.wardrobe.skin.map(x => colorBtn(x, st.outfit.skin === x)).join('') + '</div>';
    h += '<div class="gtitle">Colore capelli</div><div class="rowopt">' + D.wardrobe.hairColor.map(x => colorBtn(x, st.outfit.hairColor === x)).join('') + '</div>';
    h += '<div class="gtitle">Tuta</div><div class="rowopt">' + D.wardrobe.top.map(x => colorBtn(x, st.outfit.top === x)).join('') + '</div>';
    h += '<div class="gtitle">Pantaloni</div><div class="rowopt">' + D.wardrobe.pants.map(x => colorBtn(x, st.outfit.pants === x)).join('') + '</div>';
    h += '<div class="hint" style="font-size:.75rem;color:#8a7fb8;margin-top:10px">I primi 2 colori di ogni palette sono gratis. Gli altri costano 🪙12. Le monete si guadagnano parlando con gli ospiti e toccando gli oggetti luccicanti ✨</div>';
    body.innerHTML = h;

    body.querySelectorAll('[data-style]').forEach(b => b.onclick = () => equipStyle('hairStyle', b.dataset.style, parseInt(b.dataset.cost, 10), 'style'));
    body.querySelectorAll('[data-acc]').forEach(b => b.onclick = () => equipStyle('acc', b.dataset.acc, parseInt(b.dataset.cost, 10), 'acc'));
    body.querySelectorAll('[data-hex]').forEach(b => b.onclick = () => buyEquipColor(b.dataset.hex));
  }

  /* ============================ UI: emotes ============================ */
  function renderEmotes() {
    const list = $('emoList');
    list.innerHTML = '';
    D.emotes.forEach(em => {
      const b = document.createElement('button');
      b.className = 'emo';
      b.innerHTML = '<span class="e">' + em.e + '</span>' + em.label;
      b.onclick = () => { $('sEmotes').classList.remove('on'); doEmote(em); };
      list.appendChild(b);
    });
  }

  /* ============================ UI: chat ============================ */
  const composer = $('composer');
  function openComposer() {
    composer.classList.add('on');
    const inp = $('chatInput');
    inp.value = '';
    setTimeout(() => { try { inp.focus(); } catch (e) {} }, 60);
  }
  function closeComposer() { composer.classList.remove('on'); try { $('chatInput').blur(); } catch (e) {} }

  /* ============================ start screen ============================ */
  const avprev = $('avprev');
  function paintPreview() {
    const c = avprev.getContext('2d');
    const W = avprev.width, H = avprev.height;
    c.clearRect(0, 0, W, H);
    const o = st.outfit;
    const cx = W / 2, cy = H / 2 + 18, sc = 1.5;
    c.save();
    c.translate(cx, cy);
    c.scale(sc, sc);
    // corpo
    c.fillStyle = o.top;
    rr2(c, -10, -4, 20, 22, 6); c.fill();
    // testa
    c.fillStyle = o.skin;
    c.beginPath(); c.arc(0, -20, 12, 0, TAU); c.fill();
    // occhi + bocca
    c.fillStyle = '#261a3d';
    c.fillRect(-6, -21.5, 2.2, 3);
    c.fillRect(3.8, -21.5, 2.2, 3);
    c.beginPath(); c.arc(0, -12.4, 2, 0.15, Math.PI - 0.15); c.stroke();
    // guance
    c.fillStyle = 'rgba(255,120,140,.5)';
    c.beginPath(); c.arc(-7.2, -17, 2, 0, TAU); c.fill();
    c.beginPath(); c.arc(7.2, -17, 2, 0, TAU); c.fill();
    // capelli
    c.fillStyle = o.hairColor;
    const hs = o.hairStyle;
    if (hs === 'long') {
      c.beginPath(); c.arc(0, -21.5, 12.2, Math.PI * 0.92, Math.PI * 0.08); c.fill();
      c.fillRect(-10.2, -22, 4, 15);
      c.fillRect(6.2, -22, 4, 15);
    } else if (hs === 'curly') {
      c.beginPath(); c.arc(0, -22.5, 11.6, Math.PI, 0); c.fill();
    } else if (hs === 'puff') {
      c.beginPath(); c.arc(0, -23.5, 8.6, Math.PI, 0); c.fill();
      c.beginPath(); c.arc(-6.8, -22.5, 5, Math.PI * .6, Math.PI * 1.6); c.fill();
      c.beginPath(); c.arc(6.8, -22.5, 5, Math.PI * .4, -Math.PI * .6); c.fill();
    } else if (hs !== 'bald') {
      c.beginPath(); c.arc(0, -21.8, 12, Math.PI, 0); c.fill();
    }
    // accessori
    if (o.acc === 'glasses') {
      c.strokeStyle = '#3a2a8f'; c.lineWidth = 1.4;
      c.beginPath(); c.arc(-4.6, -20.6, 3.2, 0, TAU); c.stroke();
      c.beginPath(); c.arc(4.6, -20.6, 3.2, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(-1.4, -20.6); c.lineTo(1.4, -20.6); c.stroke();
    } else if (o.acc === 'cap') {
      c.fillStyle = o.top;
      c.beginPath(); c.arc(0, -22.6, 12.2, Math.PI, 0); c.fill();
      c.beginPath(); c.arc(-11, -20.6, 2.4, 0, TAU); c.fill();
    } else if (o.acc === 'headphones') {
      c.strokeStyle = '#3a2a8f'; c.lineWidth = 2.6;
      c.beginPath(); c.arc(0, -21, 11.8, Math.PI * .82, Math.PI * 1.18); c.stroke();
      c.fillStyle = '#ff5d9e';
      c.fillRect(-14, -26, 5.2, 7);
      c.fillRect(8.8, -26, 5.2, 7);
    } else if (o.acc === 'crown') {
      c.fillStyle = '#ffd166';
      c.beginPath();
      c.moveTo(-9, -31.6); c.lineTo(-9, -24.6); c.lineTo(-4.4, -28.2); c.lineTo(0, -24.6); c.lineTo(4.4, -28.2); c.lineTo(9, -24.6); c.lineTo(9, -31.6);
      c.closePath(); c.fill();
    }
    c.restore();
  }
  function rr2(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function makeSwatches(colors, sel) {
    return colors.map((col, i) => '<button class="swatch ' + (sel === col ? 'on' : '') + '" data-c="' + i + '" style="background:' + col + '"></button>').join('');
  }
  function bindStart() {
    const skinEl = $('skinSw'), hairEl = $('hairSw'), topEl = $('topSw');
    function refreshSwatches() {
      skinEl.innerHTML = makeSwatches(D.skins, st.outfit.skin);
      hairEl.innerHTML = makeSwatches(D.hairColors, st.outfit.hairColor);
      topEl.innerHTML = makeSwatches(D.tops, st.outfit.top);
    }
    function bindCols() {
      [skinEl, hairEl, topEl].forEach((el, gi) => {
        el.querySelectorAll('.swatch').forEach(sw => {
          sw.onclick = () => {
            const i = parseInt(sw.dataset.c, 10);
            if (gi === 0) st.outfit.skin = D.skins[i];
            else if (gi === 1) st.outfit.hairColor = D.hairColors[i];
            else st.outfit.top = D.tops[i];
            refreshSwatches(); bindCols(); paintPreview();
          };
        });
      });
    }
    refreshSwatches(); bindCols(); paintPreview();
    $('enterBtn').onclick = () => {
      const nick = $('nick').value.trim();
      st.nick = (nick || 'Ospite').slice(0, 14);
      normalize();
      $('cover').style.display = 'none';
      setupRoom();
      updateHUD();
      resize();
      renderRooms(); renderEmotes(); renderWardrobe();
      $('dbRooms').classList.add('on');
      startLoop();
      save();
      blip(523, .15, 'triangle'); setTimeout(() => blip(784, .2, 'triangle'), 90);
      toast('🎉 Benvenuto al Miraggio, ' + st.nick + '! Tocca gli ospiti per chiacchierare e guadagna monete.');
    };
    $('nick').addEventListener('keydown', e => { if (e.key === 'Enter') $('enterBtn').click(); });
  }

  /* ============================ loop start ============================ */
  let running = false;
  function startLoop() {
    if (running) return;
    running = true;
    lastT = performance.now();
    requestAnimationFrame(loop);
  }

  /* ============================ UI wiring ============================ */
  function bindUI() {
    $('dbRooms').onclick = () => { const el = $('sRooms'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderRooms(); $('dbRooms').classList.add('on'); } };
    $('dbChat').onclick = () => { const was = composer.classList.contains('on'); closeAllSheets(); if (!was) { openComposer(); $('dbChat').classList.add('on'); } };
    $('dbEmotes').onclick = () => { const el = $('sEmotes'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderEmotes(); $('dbEmotes').classList.add('on'); } };
    $('dbWardrobe').onclick = () => { const el = $('sWardrobe'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderWardrobe(); $('dbWardrobe').classList.add('on'); } };
    document.querySelectorAll('.sheetwrap').forEach(sw => sw.addEventListener('click', e => { if (e.target === sw) { sw.classList.remove('on'); closeAllSheets(); } }));
    document.querySelectorAll('[data-close]').forEach(x => x.onclick = () => { $(x.dataset.close).classList.remove('on'); document.querySelectorAll('.db').forEach(b => b.classList.remove('on')); });
    // chat
    $('chatSend').onclick = () => sendChat($('chatInput').value);
    $('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChat($('chatInput').value); });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) resize(); });
    // reset
    const resetLink = document.createElement('button');
    resetLink.className = 'x';
    resetLink.textContent = '↺';
    resetLink.style.cssText = 'background:rgba(255,255,255,.2);color:#fff;margin-top:14px';
    resetLink.title = 'Ricomincia da capo';
    resetLink.onclick = () => {
      openConfirm({
        title: 'Ricomincia da capo',
        message: 'Sei sicuro di voler ripartire da zero? Perderai monete, look e tutti i progressi.',
        confirmLabel: 'Riparti',
        cancelLabel: 'Annulla',
        danger: true,
        onConfirm: () => { wipe(); location.reload(); }
      });
    };
    document.querySelector('.cover .panel').appendChild(resetLink);
  }
  /* ============================ boot ============================ */
  function boot() {
    normalize();
    const hasSave = load();
    normalize();
    wireExtras();
    wireExtra2();
    // PWA: manifest + service worker (solo su https/localhost)
    try {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = 'manifest.webmanifest';
      document.head.appendChild(link);
      if ('serviceWorker' in navigator && /^https:|^http:/.test(location.protocol)) {
        navigator.serviceWorker.register('sw.js').catch(function () {});
      }
    } catch (e) {}
    bindUI();
    // prepara outfit di default se salvataggio parziale
    if (hasSave) {
      $('nick').value = st.nick;
      $('cover').style.display = 'none';
      $('cover').classList.remove('on');
      setupRoom(); updateHUD(); renderRooms(); renderEmotes(); renderWardrobe(); resize(); startLoop();
      toast('👋 Bentornato, ' + (st.nick || 'Ospite') + '!');
    } else {
      st = freshState();
      normalize();
      bindStart();
    }
    // show first tutorial hint for new players
    if (!st.tutorial.completed && st.tutorial.step === 0) {
      setTimeout(() => checkTutorial('welcome'), 1000);
    }
    checkTitles();
    window.addEventListener('error', (e) => { try { toast('Ops: ' + (e.message || 'errore')); } catch (x) {} });
  }

  function closeAllSheets() {
    document.querySelectorAll('.sheetwrap').forEach(x => x.classList.remove('on'));
    closeComposer();
    document.querySelectorAll('.db').forEach(b => b.classList.remove('on'));
  }

  /* ============ AFFINITÀ, LIVELLI E STORIE ============ */
  const LVL_T = [1, 4, 8, 13, 20];
  function lvlOf(botId) {
    const x = (st.friends && st.friends[botId] && st.friends[botId].x) || 0;
    let l = 0; LVL_T.forEach(t => { if (x >= t) l++; });
    return Math.min(5, l);
  }
function affTalk(botId) {
     st.friends = st.friends || {}; st.friends[botId] = st.friends[botId] || { x: 0, arcs: { sogno: false, paura: false, talento: false, relazioni: false, segreto: false } };
     st.friends[botId].arcTalkCount = (st.friends[botId].arcTalkCount || 0) + 1;
     const old = lvlOf(botId);
     st.friends[botId].x++;
     const lv = lvlOf(botId);
     st.stats.talks = (st.stats.talks || 0) + 1;
     checkAchievements();
     const prevRating = (st.stars[botId] && st.stars[botId].rating) || 0;
     const newRating = computeStarRating(botId, 0.5);
     const ci = D.charInfo[botId];
     xpAdd(2);
     if (lv > old) onLevelUp(botId, lv);
     else missionHit('talk', botId);
    if (newRating >= 4.5 && prevRating < 4.5) toast('💎 ' + (D.bots[botId] ? D.bots[botId].name : botId) + ' ha raggiunto il Diamond!');
    if (newRating >= 2.5 && prevRating < 2.5) toast('🥇 ' + (D.bots[botId] ? D.bots[botId].name : botId) + ' è diventato Gold!');
    if (ci && ci.starLines && newRating >= 2.5 && prevRating < 2.5) { say({ id: 'player' }, ci.starLines.gold, 3500, { color: '#ffe08a', ink: '#5a3a00', border: '#ffd166' }); }
    if (ci && ci.starLines && newRating >= 4.5 && prevRating < 4.5) { say({ id: 'player' }, ci.starLines.diamond, 4000, { color: '#ffd166', ink: '#4a2c00', border: '#ff9f43' }); }
    save();
  }
  function onLevelUp(botId, lv) {
    const ci = D.charInfo[botId];
    const bname = D.bots[botId] ? D.bots[botId].name : botId;
    missionHit('talk', botId);
    if (!ci) return;
    const f = st.friends[botId];
    if (lv === 2 && !f.s1) { f.s1 = true; storySay(botId, ci.s1, '📖'); addSticker(botId); xpAdd(10); logDiary('📖 ' + bname + ' ti ha confidato il primo segreto.'); if (!achievements.first_lvl) unlockAch('first_lvl'); }
    if (lv === 3 && !f.s3) { f.s3 = true; const l3 = D.story3[botId]; if (l3) storySay(botId, l3, '🤩'); xpAdd(12); logDiary('🤩 ' + bname + ' ha un altro capitolo di storia.'); }
    if (lv === 4 && !f.s2) { f.s2 = true; storySay(botId, ci.s2, '🤫'); xpAdd(15); logDiary('🤫 Il grande segreto di ' + bname + ': lo sai anche tu, ora.'); }
if (lv === 5 && !f.trophy) {
       f.trophy = true;
       st.items.push({ e: ci.trophy, name: 'Trofeo di ' + bname });
       addCoins(8);
       xpAdd(25);
       computeStarRating(botId, 2.0);
       toast('🏆 Trofeo sbloccato: ' + ci.trophy + ' (+8 🪙)');
       spawnFx(player.x, player.y - 50, '🏆', 22);
       logDiary('🏆 Trofeo conquistato: ' + ci.trophy + ' (' + bname + ')');
       blip(660, .1, 'triangle'); setTimeout(() => blip(880, .14, 'triangle'), 90);
       if (!achievements.first_trophy) unlockAch('first_trophy');
     }
     if (!f.arcs) f.arcs = { sogno: false, paura: false, talento: false, relazioni: false, segreto: false };
     if (lv >= 1 && !f.arcs.sogno) unlockArc(botId, 'sogno');
     if (lv >= 2 && !f.arcs.paura) unlockArc(botId, 'paura');
     if (lv >= 3 && !f.arcs.talento) unlockArc(botId, 'talento');
     if (lv >= 4 && !f.arcs.relazioni) unlockArc(botId, 'relazioni');
     if (lv === 5 && !f.arcs.segreto) checkHotelSecret();
     save();
   }
   function unlockArc(botId, arcType) {
     const f = st.friends[botId];
     if (!f || !f.arcs || f.arcs[arcType]) return;
     const ci = D.charInfo[botId];
     const arcs = D.npcArcs;
     if (!arcs || !arcs[botId] || !arcs[botId][arcType]) return;
     const arc = arcs[botId][arcType];
     f.arcs[arcType] = true;
     f.arcTalkCount = (f.arcTalkCount || 0) + 1;
     storySay(botId, arc.text, arc.emoji);
logDiary(arc.diary);
      if (!achievements.narrator) unlockAch('narrator');
      save();
   }
   function checkHotelSecret() {
     const allBots = Object.keys(D.bots || {});
     const allComplete = allBots.every(bid => {
       const f = st.friends[bid];
       return f && f.arcs && f.arcs.sogno && f.arcs.paura && f.arcs.talento && f.arcs.relazioni;
     });
     if (!allComplete) return;
     const f = st.friends[allBots[0]];
     if (!f || f.arcs.segreto) return;
     f.arcs.segreto = true;
     allBots.forEach(bid => {
       const fi = st.friends[bid];
       if (fi) fi.arcs.segreto = true;
     });
     if (!achievements.hotel_secret) unlockAch('hotel_secret');
     st.titles.push('hotel_secret');
     logDiary('🌑 Il segreto del Miraggio è stato rivelato! Il hotel è un portale verso vite diverse.');
     toast('🌑 Il Segreto dell\'Hotel è stato rivelato!');
     spawnFx(player.x, player.y - 50, '🌑', 30);
     blip(440, .2, 'sine'); setTimeout(() => blip(660, .2, 'sine'), 150); setTimeout(() => blip(880, .2, 'sine'), 300);
     save();
   }
   function showArcDialogue(botId, arcType) {
     const arcs = D.npcArcs;
     if (!arcs || !arcs[botId] || !arcs[botId][arcType]) return;
     const arc = arcs[botId][arcType];
     storySay(botId, arc.text, arc.emoji);
     const el = $('sNPCStories');
     if (el) el.classList.remove('on');
   }
   function renderNPCStories() {
     const el = $('npcStoryContent');
     if (!el) return;
     el.innerHTML = '';
     const allBots = Object.keys(D.bots || {});
     allBots.forEach(bid => {
       const bname = D.bots[bid] ? D.bots[bid].name : bid;
       const emoji = D.bots[bid] ? D.bots[bid].emoji : '❓';
       const f = st.friends[bid] || {};
       const arcs = f.arcs || {};
       const card = document.createElement('div');
       card.className = 'npc-arc-card';
       card.innerHTML = '<div class="npc-arc-header">' + emoji + ' ' + bname + '</div>' +
         '<div class="npc-arc-list">' +
         ['sogno', 'paura', 'talento', 'relazioni', 'segreto'].map(a => {
           const unlocked = arcs[a];
           const d = D.npcArcs[bid] && D.npcArcs[bid][a];
           return '<div class="npc-arc-item ' + (unlocked ? 'unlocked' : 'locked') + '" data-bid="' + bid + '" data-arc="' + a + '">' +
             '<span class="npc-arc-emoji">' + (unlocked ? (d ? d.emoji : '✅') : '🔒') + '</span>' +
             '<span class="npc-arc-name">' + a + '</span>' +
             '<span class="npc-arc-status">' + (unlocked ? 'Rivelato' : 'Segreto') + '</span></div>';
         }).join('') + '</div>';
       el.appendChild(card);
     });
     el.querySelectorAll('.npc-arc-item.unlocked').forEach(item => {
       item.style.cursor = 'pointer';
       item.addEventListener('click', () => {
         const bid = item.dataset.bid;
         const arc = item.dataset.arc;
         showArcDialogue(bid, arc);
       });
     });
}
   function getNPCConnections(botId) {
     const conns = D.npcConnections;
     if (!conns || !conns[botId]) return [];
     return conns[botId].connectedTo || [];
   }
   function renderInterNPCDialogue(botId1, botId2) {
     const key = botId1 + '_' + botId2;
     const revKey = botId2 + '_' + botId1;
     const dia = D.npcDialogue;
     const txt = (dia && dia[key]) || (dia && dia[revKey]) || 'Scambio di sguardi tra ' + (D.bots[botId1] ? D.bots[botId1].name : botId1) + ' e ' + (D.bots[botId2] ? D.bots[botId2].name : botId2) + '.';
     const bp1 = roomBots.find(b => b.id === botId1);
     const bp2 = roomBots.find(b => b.id === botId2);
     if (bp1) setTimeout(() => say(bp1, txt, 4000), 500);
     if (bp2 && bp2 !== bp1) setTimeout(() => say(bp2, txt, 4000), 2500);
     else if (!bp1 && !bp2) { bubbles.push({ x: player.x, y: player.y - 10, owner: 'npcdia', lines: wrapLines('💬 ' + txt), t: performance.now(), dur: 5000, color: '#e0f0ff', ink: '#0a2a4a', border: '#87ceeb' }); }
     logDiary('💬 Dialoga inter-NPC: ' + (D.bots[botId1] ? D.bots[botId1].name : botId1) + ' e ' + (D.bots[botId2] ? D.bots[botId2].name : botId2));
}
  function affEmote(botId, emoteId) {
    missionHit('emote', botId);
    const ci = D.charInfo[botId];
    if (!ci) return;
    const isLike = ci.likes.indexOf(emoteId) >= 0;
const gain = isLike ? 1.0 : 0.2;
     st.friends[botId] = st.friends[botId] || { x: 0, arcs: { sogno: false, paura: false, talento: false, relazioni: false, segreto: false } };
     const prevRating = (st.stars[botId] && st.stars[botId].rating) || 0;
    const newRating = computeStarRating(botId, gain);
    if (isLike) {
      st.friends[botId] = st.friends[botId] || { x: 0 };
      const old = lvlOf(botId);
      st.friends[botId].x += 2;
      const lv = lvlOf(botId);
      if (lv > old) onLevelUp(botId, lv);
      else if (Math.random() < 0.7) { addCoins(1); spawnFx(player.x, player.y - 46, '💛'); }
      xpAdd(2);
      const bp = roomBots.find(b => b.id === botId);
      if (bp && Math.random() < 0.55) {
        const lines = ['Adoro quando fai così! 💖', 'Ecco, questa emote vale più di mille parole!', 'Ti copio!'];
        setTimeout(() => say(bp, lines[Math.floor(Math.random() * lines.length)], 3200), 600);
      }
    } else {
      const bp = roomBots.find(b => b.id === botId);
      if (bp && Math.random() < 0.5) {
        const lines = ['Ahi, questa emote mi ha colpito in pieno…', 'Ok, ok… questa la incasso con sportività 😅', 'Il mio cuoricino digitale ha fatto "glitch".'];
        setTimeout(() => say(bp, lines[Math.floor(Math.random() * lines.length)], 3000), 500);
      }
    }
    if (newRating >= 4.5 && prevRating < 4.5) toast('💎 ' + (D.bots[botId] ? D.bots[botId].name : botId) + ' ha raggiunto il Diamond!');
    if (newRating >= 2.5 && prevRating < 2.5) toast('🥇 ' + (D.bots[botId] ? D.bots[botId].name : botId) + ' è diventato Gold!');
    if (ci && ci.starLines && newRating >= 2.5 && prevRating < 2.5) { say({ id: 'player' }, ci.starLines.gold, 3500, { color: '#ffe08a', ink: '#5a3a00', border: '#ffd166' }); }
    if (ci && ci.starLines && newRating >= 4.5 && prevRating < 4.5) { say({ id: 'player' }, ci.starLines.diamond, 4000, { color: '#ffd166', ink: '#4a2c00', border: '#ff9f43' }); }
    save();
  }
  function dayKey() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function ensureMissions() {
    st.missions = st.missions || { date: '', list: [] };
    if (st.missions.date === dayKey() && st.missions.list.length) return;
    const pool = D.missionPool;
    const seed = dayKey().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const pick = [];
    const add = (v) => { const i = ((v % pool.length) + pool.length) % pool.length; if (pick.indexOf(i) < 0) pick.push(i); };
    add(seed); add(seed * 7 + 3); add(seed * 13 + 11);
    st.missions = { date: dayKey(), list: pick.map(i => ({ i, p: 0, done: false })) };
    save();
  }
  function missionHit(type, botId) {
    ensureMissions();
    let changed = false;
    st.missions.list.forEach(m => {
      if (m.done) return;
      const tpl = D.missionPool[m.i];
      if (!tpl) return;
      if (tpl.t !== type) return;
      if (tpl.bot && tpl.bot !== botId) return;
      m.p = Math.min(tpl.n, m.p + 1);
      if (m.p >= tpl.n) { m.done = true; changed = true; }
    });
    if (changed) {
      unlockAch('first_mission');
      const doneCount = st.missions.list.filter(x => x.done).length;
      addCoins(5);
      xpAdd(12);
      const doneM = st.missions.list.filter(x => x.done);
      const lastM = doneM[doneM.length - 1];
      if (lastM && D.missionPool[lastM.i]) logDiary('📋 Missione: ' + D.missionPool[lastM.i].title);
      toast('📋 Missione completata! +5 🪙 (' + doneCount + '/' + st.missions.list.length + ')');
      spawnFx(player.x, player.y - 50, '✅');
      blip(700, .1, 'triangle'); setTimeout(() => blip(1050, .12, 'triangle'), 80);
      save();
    }
  }
  function missionsLeftToday() { ensureMissions(); return st.missions.list.filter(m => !m.done).length; }

  /* ============ UI missioni / amici / trofei ============ */
  function heartsHtml(lv) {
    let h = '';
    for (let i = 0; i < 5; i++) h += i < lv ? '❤️' : '🤍';
    return h;
  }
  function renderMissionsUI() {
    checkTutorial('missions');
    normalize(); ensureMissions();
    const b = $('missionsBody');
    const gb = D.bots[guestId()];
    const guestBanner = '<div style="background:#fff6df;border:1.5px solid #ffd166;border-radius:13px;padding:8px 12px;margin-bottom:9px;font-size:.8rem;color:#6b4a00">⭐ <b>Ospite del giorno: ' + (gb ? gb.name : '?') + '</b> — oggi parlargli vale il doppio!</div>';
    let html = '';
    const done = st.missions.list.filter(m => m.done).length;
    st.missions.list.forEach(m => {
      const tpl = D.missionPool[m.i];
      if (!tpl) return;
      const pct = Math.min(100, Math.round((m.p / tpl.n) * 100));
      html += '<div style="background:#faf8ff;border:1.5px solid ' + (m.done ? '#3ddc97' : '#e7e0ff') + ';border-radius:14px;padding:10px 12px;margin-bottom:8px">' +
        '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font-size:.9rem;color:#3a2a8f">' + tpl.title + '</b>' +
        (m.done ? '<span style="color:#0a8f52;font-weight:900">✓ fatto!</span>' : '<span style="color:#8a7fb8;font-size:.75rem">' + m.p + '/' + tpl.n + '</span>') + '</div>' +
        '<div style="font-size:.72rem;color:#8a7fb8">' + tpl.desc + '</div>' +
        '<div style="height:6px;background:#efe9ff;border-radius:99px;margin-top:7px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:' + (m.done ? '#3ddc97' : 'linear-gradient(90deg,#5b3bd6,#ff5d9e)') + ';border-radius:99px"></div></div></div>';
    });
    b.innerHTML = guestBanner + (html || '<div style="color:#8a7fb8">Nessuna missione.</div>');
    if ($('missionsDone')) $('missionsDone').textContent = done + '/' + st.missions.list.length + ' completate';
    // amici
    const fb = $('friendsBody');
    let fh = '';
    Object.keys(D.bots).forEach(id => {
      const bot = D.bots[id];
      const lv = lvlOf(id);
      const ci = D.charInfo[id];
      const f = st.friends[id] || {};
      const locked2 = lv < 2 ? ' 🔒' : '';
      const locked4 = lv < 4 ? ' 🔒' : '';
      fh += '<div style="display:flex;align-items:center;gap:9px;background:#faf8ff;border:1px solid #e7e0ff;border-radius:13px;padding:8px 10px;margin-bottom:6px">' +
        '<span style="font-size:20px">' + bot.emoji + '</span>' +
        '<div style="flex:1;min-width:0"><div style="font-weight:800;font-size:.86rem;color:#3a2a8f">' + bot.name + ' <span style="color:#8a7fb8;font-weight:500;font-size:.7rem">· ' + bot.role + '</span></div>' +
        '<div style="font-size:.72rem">' + heartsHtml(lv) + ' <span style="color:#8a7fb8">' + (ci ? ('storia ' + lv + '/5') : '') + '</span></div>' +
        (ci ? '<div style="font-size:.68rem;color:#a06f9f">💡 liv2:' + (f.s1 ? 'vista' : locked2) + ' · liv4:' + (f.s2 ? 'vista' : locked4) + '</div>' : '') +
        '</div></div>';
    });
    fb.innerHTML = fh;
    // trofei
    const tb = $('trophyBody');
if (tb) tb.innerHTML = st.items.length
      ? st.items.map(it => '<span style="display:inline-flex;align-items:center;gap:6px;background:#fff6df;border:1px solid #ffd166;border-radius:99px;padding:5px 11px;font-size:.78rem;font-weight:800;color:#6b4a00;margin:0 5px 6px 0">' + it.e + ' ' + it.name + '</span>').join('')
      : '<div style="color:#8a7fb8;font-size:.8rem">Nessun trofeo ancora: porta un ospite a livello 5 parlandogli e con le emote che ama!</div>';
    // achievements
    const achb = $('achieveBody');
    if (achb) {
      const unlocked = st.ach || {};
      achb.innerHTML = ACHIVE_DEFS.map(a => {
        const isUn = unlocked[a.id];
        return '<div class="ach ' + (isUn ? 'unlocked' : 'locked') + '"><span class="ai">' + (isUn ? a.icon : '🔒') + '</span><div class="at"><div>' + a.title + '</div><div class="ab">' + a.desc + '</div></div></div>';
      }).join('');
    }
    // album degli amici (figurine)
    const ab = $('albumBody');
    if (ab) {
      let ah = '';
      Object.keys(D.bots).forEach(id => {
        const got = st.stickers && st.stickers[id];
        const nm = D.bots[id] ? D.bots[id].name : id;
        const em = D.bots[id] ? D.bots[id].emoji : '❓';
        ah += '<span title="' + nm + '" style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:12px;margin:0 4px 6px 0;background:' + (got ? 'linear-gradient(135deg,#ffe08a,#ff9f43)' : '#efe9ff') + ';border:1.5px solid ' + (got ? '#e09b00' : '#e7e0ff') + ';font-size:22px;filter:' + (got ? 'none' : 'grayscale(1)') + ';opacity:' + (got ? 1 : .55) + '">' + em + '</span>';
      });
      const gotN = Object.keys(st.stickers || {}).length;
      ab.innerHTML = ah + '<div style="font-size:.72rem;color:#8a7fb8;margin-top:2px">' + gotN + '/' + Object.keys(D.bots).length + ' raccolte — si sbloccano al segreto del livello 2. Album completo: +50 🪙.</div>';
    }
    // diario del Miraggio
    const db = $('diaryBody');
    if (db) {
      db.innerHTML = st.log && st.log.length
        ? '<div style="font-family:ui-monospace,monospace;font-size:.74rem;line-height:1.8;color:#5a4a9f;max-height:200px;overflow-y:auto">' + st.log.map(l => '<div>' + l + '</div>').join('') + '</div>'
        : '<div style="color:#8a7fb8;font-size:.8rem">Nessuna voce… il Miraggio aspetta la tua storia!</div>';
    }
    // star board
    renderStarBoard();
  }

  function renderStarBoard() {
    const sb = $('starBoard');
    if (!sb) return;
    const allRatings = Object.keys(st.stars || {}).map(id => ({ id, rating: (st.stars[id] && st.stars[id].rating) || 0, total: (st.stars[id] && st.stars[id].total) || 0 }));
    allRatings.sort((a, b) => b.rating - a.rating);
    const allIds = Object.keys(D.bots);
    let html = '';
    allIds.forEach(id => {
      const r = allRatings.find(x => x.id === id) || { rating: 0, total: 0 };
      const t = getStarTier(r.rating);
      const pct = Math.min(100, r.rating / 5 * 100);
      html += '<div class="sb" title="' + D.bots[id].name + ' (' + r.total + ' interazioni)">' +
        '<span class="sb-tier">' + t.icon + '</span>' +
        '<span class="sb-name">' + D.bots[id].name + '</span>' +
        '<span class="sb-bar"><span class="sb-bar-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="sb-rating">' + r.rating.toFixed(2) + '</span>' +
      '</div>';
    });
    sb.innerHTML = html;
  }

  /* ============ MINIGIOCHI ============ */
  function openGame(id) {
    if (id === 'memory') startMemory();
    else if (id === 'gabbiano') startGabbiano();
    else if (id === 'slot') startSlot();
    else if (id === 'treasure') startTreasure();
  }
  function showGame(title) {
    closeAllSheets();
    $('gameTitle').textContent = title;
    $('gameWrap').classList.add('on');
  }
  function closeGame() {
    $('gameWrap').classList.remove('on');
    if (memTimer) clearInterval(memTimer);
    if (gabbTimer) clearInterval(gabbTimer);
  }
  function doneGame(id, earned, msg) {
    st.stats = st.stats || {};
    st.stats.best = st.stats.best || {};
    st.stats.best[id] = Math.max(st.stats.best[id] || 0, earned);
    st.stats.games = (st.stats.games || 0) + 1;
    missionHit('minigame', null);
    if (earned > 0) { addCoins(earned); }
    xpAdd(8);
    const gname = D.minigames[id] ? D.minigames[id].name : id;
    logDiary('🎮 ' + gname + (earned > 0 ? ' → +' + earned + ' 🪙' : ' → riprovaci!'));
    toast(msg || (earned > 0 ? ('🎉 +' + earned + ' 🪙') : 'Riprova: la fortuna gira!'));
    renderGamesUI();
    save();
  }
  const EMO_POOL = ['🍒', '🍋', '⭐', '🔔', '💎', '🍩', '🍉', '🐸'];
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* --- Memoria di coppie --- */
  let memTimer = null;
  function startMemory() {
    closeGame(); showGame('🧠 Memoria di coppie');
    const body = $('gameBody');
    const pairs = shuffle(EMO_POOL).slice(0, 6);
    const cards = shuffle(pairs.concat(pairs));
    let open = [], locked = false, found = 0, timeLeft = 45;
    body.innerHTML = '<div style="text-align:center;color:#8a7fb8;font-size:.85rem">Trova le 6 coppie prima che scada il tempo<br><b id="memTime" style="color:#5b3bd6">45s</b></div><div id="memGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px"></div><div id="memEnd"></div>';
    const grid = $('memGrid');
    cards.forEach((e, i) => {
      const b = document.createElement('button');
      b.className = 'memc';
      b.style.cssText = 'aspect-ratio:1;border-radius:14px;border:2px solid #e7e0ff;background:linear-gradient(135deg,#5b3bd6,#8a4bd6);color:#fff;font-size:26px;cursor:pointer';
      b.dataset.i = i; b.dataset.e = e;
      b.addEventListener('click', () => {
        if (locked || open.includes(i) || b.dataset.done) return;
        b.textContent = e;
        b.style.background = '#fff';
        open.push(i);
        if (open.length === 2) {
          locked = true;
          const a = cards[open[0]], c = cards[open[1]];
          if (a === c) {
            found++;
            grid.children[open[0]].dataset.done = '1';
            grid.children[open[1]].dataset.done = '1';
            grid.children[open[0]].style.background = '#3ddc97';
            grid.children[open[1]].style.background = '#3ddc97';
            open = []; locked = false;
            blip(900, .07, 'triangle');
            if (found === 6) { clearInterval(memTimer); doneGame('memory', 6 + Math.max(0, Math.round(timeLeft / 4)), '🧠 Memoria completata!'); }
          } else {
            setTimeout(() => {
              grid.children[open[0]].textContent = ''; grid.children[open[0]].style.background = '';
              grid.children[open[1]].textContent = ''; grid.children[open[1]].style.background = '';
              open = []; locked = false;
            }, 620);
          }
        }
      });
      grid.appendChild(b);
    });
    clearInterval(memTimer);
    memTimer = setInterval(() => {
      timeLeft--;
      const el = $('memTime');
      if (el) el.textContent = timeLeft + 's';
      if (timeLeft <= 0) { clearInterval(memTimer); doneGame('memory', 0, '⏰ Tempo scaduto! Ma Leo ha applaudito comunque.'); }
    }, 1000);
  }

  /* --- Whack-a-Tino --- */
  let gabbTimer = null;
  function startGabbiano() {
    closeGame(); showGame('🕊️ Whack-a-Tino!');
    const body = $('gameBody');
    const W = 330, H = 320;
    body.innerHTML = '<div style="display:flex;justify-content:space-between;font-weight:900;color:#3a2a8f"><span>🪙 ' + D.minigames.gabbiano.rewardBase + ' per punto</span><span id="gbTime">20s</span></div><canvas id="gbCv" width="' + W + '" height="' + H + '" style="width:100%;height:auto;background:radial-gradient(circle at 50% 20%,#bfeaff,#7fd8ff);border-radius:16px;margin-top:8px;touch-action:none"></canvas><div style="text-align:center;font-weight:900;color:#5b3bd6;margin-top:6px">Punti: <span id="gbScore">0</span></div>';
    const cv = $('gbCv'), g = cv.getContext('2d');
    const birds = [];
    let score = 0, timeLeft = 20;
    function spawn() {
      if (birds.length >= 3) return;
      const gold = Math.random() < 0.18;
      birds.push({ x: 30 + Math.random() * (W - 60), y: 30 + Math.random() * (H - 70), gold, t: performance.now() });
    }
    function drawBirds() {
      g.clearRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.5)';
      for (let r = 0; r < 4; r++) { g.beginPath(); g.arc(40 + r * 84, 55 + (r % 2) * 70, 30, 0, 7); g.fill(); }
      birds.forEach(b => {
        const bob = Math.sin((performance.now() - b.t) / 130) * 4;
        g.font = '34px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(b.gold ? '🐤' : '🕊️', b.x, b.y + bob);
      });
    }
    function hitTest(x, y) {
      for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i];
        if (Math.abs(x - b.x) < 26 && Math.abs(y - b.y) < 26) {
          birds.splice(i, 1);
          score += b.gold ? 3 : 1;
          $('gbScore').textContent = score;
          blip(500 + score * 60, .07, 'square');
          return;
        }
      }
    }
    cv.addEventListener('pointerdown', (e) => {
      const r = cv.getBoundingClientRect();
      const x = (e.clientX - r.left) * (W / r.width);
      const y = (e.clientY - r.top) * (H / r.height);
      hitTest(x, y);
    });
    clearInterval(gabbTimer);
    spawn(); spawn();
    gabbTimer = setInterval(() => {
      if (Math.random() < 0.8) spawn();
      timeLeft -= 0.2;
      const el = $('gbTime');
      if (el) el.textContent = Math.max(0, Math.round(timeLeft)) + 's';
      drawBirds();
      if (timeLeft <= 0) {
        clearInterval(gabbTimer);
        const earned = score;
        doneGame('gabbiano', earned, earned > 0 ? ('🕊️ ' + earned + ' gabbiani colpiti! (+' + earned + ' 🪙)') : '🕊️ Tino è sfuggito a tutti… stavolta.');
      }
    }, 200);
  }

  /* --- Slot --- */
  function startSlot() {
    if (st.coins < 5) { toast('Ti servono 5 🪙 per giocare'); renderGamesUI(); return; }
    closeGame(); showGame('🎰 Jackpot delle risate');
    const body = $('gameBody');
    const sym = ['🍒', '🍋', '⭐', '🔔', '7️⃣', '🍩', '💎'];
    let reels = [0, 0, 0];
    body.innerHTML = '<div style="text-align:center;color:#8a7fb8;font-size:.85rem">Punta 5 🪙 e allinea le emoji</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;margin:16px 0"><div id="sl" style="display:flex;gap:10px"></div></div>' +
      '<div style="display:flex;gap:8px;justify-content:center"><button class="bigbtn" id="slSpin" style="max-width:240px">🔄 Gira (5 🪙)</button></div>' +
      '<div id="slRes" style="text-align:center;min-height:40px;font-weight:900;color:#3a2a8f;margin-top:12px;font-size:1.05rem"></div>';
    const wrap = $('sl');
    for (let i = 0; i < 3; i++) {
      const r = document.createElement('div');
      r.id = 'sl' + i;
      r.style.cssText = 'width:78px;height:96px;display:grid;place-items:center;font-size:52px;background:linear-gradient(180deg,#fff,#f4ecff);border:3px solid #d9c9ff;border-radius:16px';
      r.textContent = sym[0];
      wrap.appendChild(r);
    }
    $('slSpin').addEventListener('click', () => {
      if (st.coins < 5) { toast('Monete insufficienti'); return; }
      st.coins -= 5; updateHUD(); save();
      $('slRes').textContent = '';
      $('slSpin').disabled = true;
      // esito predefinito
      const roll = Math.random();
      let res;
      if (roll < 0.08) res = [7, 7, 7];
      else if (roll < 0.3) { const k = 1 + Math.floor(Math.random() * 6); res = [k, k, 2]; }
      else { res = [Math.floor(Math.random() * 7), Math.floor(Math.random() * 7), Math.floor(Math.random() * 7)]; }
      let frames = 0;
      const iv = setInterval(() => {
        frames++;
        for (let i = 0; i < 3; i++) {
          $('sl' + i).textContent = sym[Math.floor(Math.random() * 7)];
          if (frames > 9 - i * 3) $('sl' + i).textContent = sym[res[i]];
        }
        blip(300 + frames * 40, .04, 'sine');
        if (frames > 12) {
          clearInterval(iv);
          const a = res[0], b = res[1], c = res[2];
          let pay = 0, txt = 'Niente stavolta… la ruota si sta riposando.';
          if (a === b && b === c) { pay = (a === 7 ? 50 : 30); txt = '🎉 TRIS! +' + pay + ' 🪙'; }
          else if (a === b || b === c || a === c) { pay = 12; txt = '✨ Coppia! +' + pay + ' 🪙'; }
          $('slRes').textContent = txt;
          doneGame('slot', pay, pay > 0 ? txt : '🎰 La slot ti guarda. Sorride. Riprova!');
          $('slSpin').disabled = false;
        }
      }, 90);
    });
  }

  function renderGamesUI() {
    normalize();
    const b = $('gamesBody');
    st.stats = st.stats || {}; st.stats.best = st.stats.best || {};
    b.innerHTML = '';
    Object.keys(D.minigames).forEach(id => {
      const mg = D.minigames[id];
      const who = D.bots[mg.who];
      const card = document.createElement('div');
      card.style.cssText = 'display:flex;gap:12px;align-items:center;background:#faf8ff;border:1.5px solid #e7e0ff;border-radius:16px;padding:12px;margin-bottom:10px';
      card.innerHTML = '<span style="font-size:30px">' + mg.emoji + '</span>' +
        '<div style="flex:1;min-width:0"><b style="color:#3a2a8f">' + mg.name + '</b>' +
        '<div style="font-size:.75rem;color:#8a7fb8">' + mg.how + '</div>' +
        '<div style="font-size:.7rem;color:#a06f9f">con ' + (who ? who.name : '?') + ' · record: ' + (st.stats.best[id] || 0) + '</div></div>' +
        '<button class="mini" data-game="' + id + '">Gioca ▶</button>';
      card.querySelector('[data-game]').addEventListener('click', () => openGame(id));
      b.appendChild(card);
    });
    // extra games: carnival minigame and dance battle
    const extraGames = [
      { id: 'carnival', name: 'Carnival Minigame', emoji: '🎪', how: 'Colpisci i bersagli!', start: startMinigame },
      { id: 'dance', name: 'Dance Battle', emoji: '💃', how: 'Segui il ritmo con le frecce!', start: startDanceBattle }
    ];
    extraGames.forEach(mg => {
      const card = document.createElement('div');
      card.style.cssText = 'display:flex;gap:12px;align-items:center;background:#faf8ff;border:1.5px solid #e7e0ff;border-radius:16px;padding:12px;margin-bottom:10px';
      card.innerHTML = '<span style="font-size:30px">' + mg.emoji + '</span>' +
        '<div style="flex:1;min-width:0"><b style="color:#3a2a8f">' + mg.name + '</b>' +
        '<div style="font-size:.75rem;color:#8a7fb8">' + mg.how + '</div>' +
        '</div>' +
        '<button class="mini" data-extra="' + mg.id + '">Gioca ▶</button>';
      card.querySelector('[data-extra]').addEventListener('click', () => { closeAllSheets(); mg.start(); });
      b.appendChild(card);
    });
  }

  /* ============ WIRING EXTRA ============ */
  function wireExtras() {
    $('dbMissions').onclick = () => { const el = $('sMissions'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderMissionsUI(); renderStarBoard(); } };
    $('dbStars').onclick = () => { const el = $('sMissions'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderMissionsUI(); renderStarBoard(); } };
     $('dbNest').onclick = () => openNest();
      if ($('breedChip')) $('breedChip').onclick = () => { if ($('sNest').classList.contains('on')) $('sNest').classList.remove('on'); else openNest(); };
      if ($('musicStudioChip')) $('musicStudioChip').onclick = () => { if ($('sStudio').classList.contains('on')) { $('sStudio').classList.remove('on'); $('musicStudioChip').classList.remove('on'); } else { openMusicStudio(); } };
      $('fwSpinBtn').onclick = () => { spinWheel(); setTimeout(updateFWBtn, 50); setTimeout(updateFWBtn, fwSpinDuration + 200); };
    $('dbGames').onclick = () => { const el = $('sGames'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderGamesUI(); } };
    $('gameClose').onclick = () => closeGame();
    $('gameWrap').addEventListener('click', e => { if (e.target === $('gameWrap')) closeGame(); });
    if ($('mgCanvas')) $('mgCanvas').addEventListener('click', mgClick);
    document.addEventListener('keydown', danceKeyHandler);
    // title selector
    if ($('titleChip')) $('titleChip').onclick = () => { const el = $('sTitles'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderTitleSelector(); } };
    if ($('photoChip')) $('photoChip').onclick = () => openPhotoMode();
    if ($('photoSave')) $('photoSave').onclick = () => savePhoto();
    if ($('mysteryChip')) $('mysteryChip').onclick = () => { const el = $('sMystery'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderMysterySheet(); } };
    if ($('seasonalChip')) $('seasonalChip').onclick = () => { const el = $('sSeasonal'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderSeasonalSheet(); } };
    if ($('builderChip')) $('builderChip').onclick = () => { const el = $('sBuilder'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); openBuilder(); } };
if ($('societyChip')) $('societyChip').onclick = () => { const el = $('sSociety'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderSocietySheet(); } };
      if ($('npcChip')) $('npcChip').onclick = () => { const el = $('sNPCStories'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderNPCStories(); } };
       if ($('dimChip')) $('dimChip').onclick = () => { const el = $('sDimensions'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderDimensions(); } };
       if ($('managerChip')) $('managerChip').onclick = () => { if ($('sManager').classList.contains('on')) { $('sManager').classList.remove('on'); $('managerChip').classList.remove('on'); } else { openManager(); } };
     }
  function normalize() {
    st.friends = st.friends || {};
    Object.keys(D.bots || {}).forEach(bid => {
      if (!st.friends[bid]) st.friends[bid] = { x: 0, s1: false, s2: false, s3: false, trophy: false, arcs: { sogno: false, paura: false, talento: false, relazioni: false, segreto: false } };
      else st.friends[bid].arcs = st.friends[bid].arcs || { sogno: false, paura: false, talento: false, relazioni: false, segreto: false };
    });
    st.items = st.items || [];
    st.missions = st.missions || { date: '', list: [] };
    st.stats = st.stats || {};
    st.stats.best = st.stats.best || {};
    st.stats.talks = st.stats.talks || 0;
    st.stats.games = st.stats.games || 0;
    if (st.xp === undefined) st.xp = 0;
    if (st.lvl === undefined) st.lvl = 0;
    if (st.log === undefined) st.log = [];
    if (st.sound === undefined) st.sound = true;
    if (st.stickers === undefined) st.stickers = {};
    if (st.shopItems === undefined) st.shopItems = [];
    if (st.placed === undefined) st.placed = [];
    if (st.albumBonus === undefined) st.albumBonus = false;
    if (st._tick === undefined) st._tick = 0;
    if (!st.builder) st.builder = { active: false, roomId: '', name: '', desc: '', slots: [], votes: 0, votedBy: [], createdAt: 0, isPublic: true };
    if (!st.builderRooms) st.builderRooms = [];
    if (!st.builderVotes) st.builderVotes = {};
    if (!st.builderVotedBy) st.builderVotedBy = [];
      if (!st.society) st.society = { keys: 0, dailyKeys: 0, marketDay: '', purchasedItems: [], missionsDone: [], reputation: 0, visited: false };
      if (!st.manager) st.manager = { unlocked: false, budget: 0, reputation: 0, staff: [], upgrades: {}, rooms: [], revenue: 0, dayIncome: 0, expenses: 0, vipGuests: 0, protection: 0 };
      if (!st.breeding) st.breeding = { cooldowns: {}, eggs: [], totalBreeds: 0, totalHatchings: 0, totalEvolves: 0, unlocked: false };
      if (!st.musicStudio) st.musicStudio = { active: false, currentTrack: { name: 'Untitled', bpm: 120, genre: 'House', pattern: [[], [], [], [], [], []], instruments: [], tempo: 'mid', isPlaying: false, createdAt: 0, likes: 0 }, library: [], weeklyContest: { active: false, genre: '', week: '', entries: [], winner: null, prizes: [] } };
      if (!st.mystery) st.mystery = { active: null, solved: [], cluesFound: {}, currentStep: 0 };
      if (!st.dimensions) st.dimensions = { dark: false, neon: false, steam: false };
      if (!st.seasonal) st.seasonal = { active: null, progress: {}, completed: [], adventCalendar: {}, candyCollected: 0, eggsFound: 0, surfBest: 0 };
      if (!st.tutorial) st.tutorial = { step: 0, completed: false, seen: {} };
      if (!Array.isArray(st.pets)) st.pets = [];
      if (!st.ghosts) st.ghosts = { seen: {}, active: [], missions: {} };
      if (!st.minigame) st.minigame = { score: 0, combo: 0, bestScore: 0, totalGames: 0 };
      if (!st.danceBattle) st.danceBattle = { score: 0, bestScore: 0, totalGames: 0 };
      if (!st.weather) st.weather = { type: 'clear', intensity: 0, nextChange: 0 };
      if (!st.fashionShow) st.fashionShow = { active: false, startTime: 0, duration: 45000, participants: [], winners: [], phase: 'idle' };
      if (!st.fortWheel) st.fortWheel = { lastSpin: 0, spinsToday: 0, totalSpins: 0 };
      if (!st.visitedRooms) st.visitedRooms = [];
      if (!st.emotesUsed) st.emotesUsed = [];
      if (!st.stars) st.stars = {};
     }

  /* ============ MUSIC STUDIO ============ */
  function openMusicStudio() {
    closeAllSheets();
    $('sStudio').classList.add('on');
    st.musicStudio.active = true;
    renderMusicStudio();
  }
  function closeMusicStudio() {
    $('sStudio').classList.remove('on');
    st.musicStudio.active = false;
  }
  function initTrack() {
    const ms = st.musicStudio;
    ms.currentTrack = { name: 'Untitled', bpm: 120, genre: 'House', pattern: [[], [], [], [], [], []], instruments: [], tempo: 'mid', isPlaying: false, createdAt: Date.now(), likes: 0 };
  }
  function toggleStep(step, lane) {
    const ms = st.musicStudio;
    const track = ms.currentTrack;
    if (!track || !track.pattern || !track.pattern[lane]) return;
    const idx = track.pattern[lane].indexOf(step);
    if (idx >= 0) {
      track.pattern[lane] = track.pattern[lane].filter(s => s !== step);
    } else {
      track.pattern[lane].push(step);
      track.pattern[lane].sort((a, b) => a - b);
    }
    renderMusicStudio();
  }
  function addInstrument(inst) {
    const ms = st.musicStudio;
    const track = ms.currentTrack;
    if (!track.instruments.includes(inst)) {
      track.instruments.push(inst);
      toast('🎵 Aggiunto: ' + D.musicStudio.instruments[inst].name);
    }
    renderMusicStudio();
  }
  function removeInstrument(inst) {
    const ms = st.musicStudio;
    const track = ms.currentTrack;
    track.instruments = track.instruments.filter(i => i !== inst);
    track.pattern = track.pattern.map(() => []);
    renderMusicStudio();
  }
  function setTempo(presetId) {
    const ms = st.musicStudio;
    const preset = D.musicStudio.tempoPresets[presetId];
    if (!preset) return;
    ms.currentTrack.bpm = preset.bpm;
    ms.currentTrack.tempo = preset.name;
    toast('⏱️ Tempo: ' + preset.name + ' (' + preset.bpm + ' BPM)');
    renderMusicStudio();
  }
  function setGenre(genre) {
    const ms = st.musicStudio;
    ms.currentTrack.genre = genre;
    toast('🎭 Genere: ' + genre);
    renderMusicStudio();
  }
  function saveTrack() {
    const ms = st.musicStudio;
    const track = ms.currentTrack;
    if (!track || track.instruments.length === 0) { toast('⚠️ Aggiungi almeno uno strumento!'); return; }
    track.name = $('msTrackName').value || 'Untitled';
    track.createdAt = Date.now();
    st.musicStudio.library.push(JSON.parse(JSON.stringify(track)));
    toast('💾 Brano salvato: ' + track.name + '!');
    renderMusicStudio();
  }
  function loadTrack(idx) {
    const ms = st.musicStudio;
    if (idx < 0 || idx >= ms.library.length) return;
    ms.currentTrack = JSON.parse(JSON.stringify(ms.library[idx]));
    ms.currentTrack.isPlaying = false;
    toast('📂 Caricato: ' + ms.currentTrack.name);
    renderMusicStudio();
  }
  function deleteTrack(idx) {
    const ms = st.musicStudio;
    if (idx < 0 || idx >= ms.library.length) return;
    const name = ms.library[idx].name;
    openConfirm({
      title: 'Elimina brano',
      message: 'Sei sicuro di voler eliminare "' + name + '"? L\'operazione è irreversibile.',
      confirmLabel: 'Elimina',
      cancelLabel: 'Annulla',
      danger: true,
      onConfirm: () => {
        ms.library.splice(idx, 1);
        toast('🗑️ Eliminato: ' + name);
        renderMusicStudio();
      }
    });
  }
  function shareTrack() {
    const ms = st.musicStudio;
    const track = ms.currentTrack;
    if (!track || track.instruments.length === 0) { toast('⚠️ Nessun brano da condividere!'); return; }
    const code = b64encodeUtf8({ n: track.name, b: track.bpm, g: track.genre, p: track.pattern, i: track.instruments });
    const text = '🎵 Miraggio Hotel - ' + track.name + ' (' + track.genre + ', ' + track.bpm + ' BPM)\nCodice: ' + code;
    if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => toast('📋 Codice copiato!')); }
    else { toast('📋 ' + code); }
  }
  function togglePlay() {
    const ms = st.musicStudio;
    const track = ms.currentTrack;
    if (!track || track.instruments.length === 0) { toast('⚠️ Aggiungi almeno uno strumento!'); return; }
    track.isPlaying = !track.isPlaying;
    if (track.isPlaying) { toast('▶️ Riproduzione: ' + track.name); }
    else { toast('⏸️ Pausa'); }
    renderMusicStudio();
  }
  function startWeeklyContest() {
    const ms = st.musicStudio;
    const genres = D.musicStudio.genres;
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const now = new Date();
    const weekNum = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
    ms.weeklyContest = { active: true, genre: genre, week: 'Settimana ' + (weekNum + 1), entries: [], winner: null, prizes: [500, 300, 150] };
    // entry NPC generate dal "pubblico"
    const NAMES = ['DJ Nova', 'Beat Bot', 'Vinile', 'Echo', 'Mix Master'];
    const n = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      ms.weeklyContest.entries.push({
        track: { name: NAMES[Math.floor(Math.random() * NAMES.length)], genre: genre, bpm: 120, pattern: [[], [], [], [], [], []], instruments: [] },
        likes: Math.floor(Math.random() * 6), voters: [], isPlayer: false, submittedAt: Date.now()
      });
    }
    toast('🎤 Contest DJ iniziato! Genere: ' + genre + '. Invia il tuo brano!');
    renderMusicStudio();
  }
  function submitToContest(idx) {
    const ms = st.musicStudio;
    if (!ms.weeklyContest.active) { toast('⚠️ Nessun contest attivo!'); return; }
    if (idx < 0 || idx >= ms.library.length) return;
    const entry = { track: ms.library[idx], likes: Math.floor(Math.random() * 4), voters: [], isPlayer: true, submittedAt: Date.now() };
    ms.weeklyContest.entries.push(entry);
    toast('🎤 Inviato al contest: ' + ms.library[idx].name);
    renderMusicStudio();
  }
  function voteContest(entryIdx) {
    const ms = st.musicStudio;
    if (!ms.weeklyContest.active) return;
    const entry = ms.weeklyContest.entries[entryIdx];
    if (!entry || entry.voters.includes('player')) { toast('⚠️ Hai già votato!'); return; }
    entry.likes++;
    entry.voters.push('player');
    toast('🗳️ Voto registrato!');
    renderMusicStudio();
  }
  function calculateContestWinner() {
    const ms = st.musicStudio;
    if (!ms.weeklyContest.active || ms.weeklyContest.entries.length === 0) { toast('⚠️ Nessun partecipante!'); return; }
    const sorted = [...ms.weeklyContest.entries].sort((a, b) => b.likes - a.likes);
    ms.weeklyContest.winner = sorted[0];
    ms.weeklyContest.active = false;
    const prizes = ms.weeklyContest.prizes;
    if (sorted[0].isPlayer) {
      st.coins += prizes[0] || 0;
      st.earned += prizes[0] || 0;
      toast('🏆 Vince il tuo brano: ' + sorted[0].track.name + '! +' + prizes[0] + ' 🪙');
    } else {
      toast('🏆 Vince: ' + sorted[0].track.name + '. Riprova la prossima settimana!');
    }
    ms.weeklyContest.entries.forEach(e => { if (e.isPlayer && e.likes >= 10) unlockAch('viral_hit'); });
    checkAchievements();
    checkTitles();
    updateHUD();
    save();
    renderMusicStudio();
  }
  function renderMusicStudio() {
    const body = $('msBody');
    if (!body) return;
    const ms = st.musicStudio;
    const track = ms.currentTrack;
    const insts = D.musicStudio.instruments;
    const maxSteps = D.musicStudio.maxSteps;
    const patternLen = D.musicStudio.patternLength;
    let h = '';
    // Header
    h += '<div id="msTabs" style="display:flex;gap:4px;margin-bottom:12px">';
    h += '<button class="mini msTab" data-tab="sequencer" style="background:rgba(91,59,214,.3);color:#fff">🎹 Sequencer</button>';
    h += '<button class="mini msTab" data-tab="mixer" style="background:rgba(255,255,255,.1);color:#fff">🎛️ Mixer</button>';
    h += '<button class="mini msTab" data-tab="library" style="background:rgba(255,255,255,.1);color:#fff">💾 Library</button>';
    if (ms.weeklyContest && ms.weeklyContest.active) { h += '<button class="mini msTab" data-tab="contest" style="background:rgba(255,209,102,.3);color:#ffd166">🎤 Contest</button>'; }
    h += '</div>';
    // Sequencer tab
    h += '<div id="msTab_sequencer" class="msTabContent" style="display:none">';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center">';
    h += '<input id="msTrackName" type="text" value="' + (track.name || 'Untitled') + '" placeholder="Nome brano..." maxlength="20" style="background:rgba(255,255,255,.1);border:1px solid #5b3bd6;color:#fff;padding:6px 10px;border-radius:8px;font-size:.85rem;width:150px">';
    h += '<button class="mini" id="msPlayBtn" style="background:' + (track.isPlaying ? '#ff5d9e' : '#3ddc97') + ';color:#fff">▶' + (track.isPlaying ? '⏸' : '') + '</button>';
    h += '<button class="mini" id="msSaveBtn" style="background:linear-gradient(135deg,#ffd166,#ff9f43);color:#4a2c00">💾 Salva</button>';
    h += '<button class="mini" id="msShareBtn" style="background:#5b3bd6;color:#fff">📋 Condividi</button>';
    h += '</div>';
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">';
    Object.keys(insts).forEach(iid => {
      const inst = insts[iid];
      const active = track.instruments.includes(iid);
      h += '<button class="mini" data-inst="' + iid + '" style="background:' + (active ? inst.color + '44' : 'rgba(255,255,255,.05)') + ';border-color:' + (active ? inst.color : '#444') + ';color:#fff;' + (active ? '' : 'opacity:.5') + '">' + inst.emoji + ' ' + inst.name + '</button>';
    });
    h += '</div>';
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">';
    Object.keys(D.musicStudio.tempoPresets).forEach(pid => {
      const preset = D.musicStudio.tempoPresets[pid];
      h += '<button class="mini" data-tempo="' + pid + '" style="background:' + (track.tempo === preset.name ? 'rgba(91,59,214,.3)' : 'rgba(255,255,255,.05)') + ';color:#fff">' + preset.name + ' ' + preset.bpm + '</button>';
    });
    h += '</div>';
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">';
    D.musicStudio.genres.forEach(g => {
      h += '<button class="mini" data-genre="' + g + '" style="background:' + (track.genre === g ? 'rgba(91,59,214,.3)' : 'rgba(255,255,255,.05)') + ';color:#fff">' + g + '</button>';
    });
    h += '</div>';
    // Sequencer grid
    h += '<div style="display:grid;grid-template-columns:80px repeat(' + maxSteps + ',1fr);gap:2px;margin-bottom:8px">';
    h += '<div></div>';
    for (let s = 0; s < maxSteps; s++) { h += '<div style="text-align:center;font-size:.6rem;color:#8a7fb8">' + (s + 1) + '</div>'; }
    Object.keys(insts).forEach(iid => {
      const inst = insts[iid];
      const active = track.instruments.includes(iid);
      h += '<div style="display:flex;align-items:center;font-size:.6rem;color:#8a7fb8;gap:2px">' + inst.emoji + '</div>';
      for (let s = 0; s < maxSteps; s++) {
        const stepActive = track.pattern[iid] && track.pattern[iid].includes(s);
        h += '<div data-step="' + s + '" data-lane="' + iid + '" style="width:100%;aspect-ratio:1;background:' + (stepActive ? inst.color : 'rgba(255,255,255,.05)') + ';border:1px solid ' + (stepActive ? inst.color : '#333') + ';border-radius:3px;cursor:pointer;min-height:16px"></div>';
      }
    });
    h += '</div>';
    h += '</div>';
    // Mixer tab
    h += '<div id="msTab_mixer" class="msTabContent" style="display:none">';
    h += '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:8px">Mixer - Volume per strumento</div>';
    track.instruments.forEach(iid => {
      const inst = insts[iid];
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
      h += '<span style="font-size:1.2rem">' + inst.emoji + '</span>';
      h += '<span style="color:#fff;font-size:.8rem">' + inst.name + '</span>';
      h += '<input type="range" min="0" max="100" value="80" style="flex:1;accent-color:' + inst.color + '" data-vol="' + iid + '">';
      h += '<span style="color:#8a7fb8;font-size:.7rem">80%</span>';
      h += '</div>';
    });
    h += '</div>';
    // Library tab
    h += '<div id="msTab_library" class="msTabContent" style="display:none">';
    h += '<div style="font-size:.85rem;color:#8a7fb8;margin-bottom:8px">Libreria brani salvati (' + ms.library.length + ')</div>';
    if (ms.library.length === 0) { h += '<div style="font-size:.78rem;color:#8a7fb8">Nessun brano salvato. Crea e salva la tua prima traccia!</div>'; }
    ms.library.forEach((t, idx) => {
      h += '<div style="background:rgba(255,255,255,.05);border:1px solid #5b3bd6;border-radius:10px;padding:10px;margin-bottom:6px">';
      h += '<div style="display:flex;align-items:center;gap:6px">';
      h += '<span style="font-size:1.2rem">' + (t.genre === 'House' ? '🎵' : '🎶') + '</span>';
      h += '<div style="flex:1"><div style="font-weight:800;color:#fff">' + t.name + '</div>';
      h += '<div style="font-size:.7rem;color:#8a7fb8">' + t.genre + ' · ' + t.bpm + ' BPM · ' + t.instruments.length + ' strumenti</div></div>';
      h += '<button class="mini" data-load="' + idx + '" style="background:#3ddc97;color:#fff">▶</button>';
      h += '<button class="mini" data-delete="' + idx + '" style="background:#ff5d9e;color:#fff">🗑️</button>';
      h += '<button class="mini" data-contest="' + idx + '" style="background:#ffd166;color:#4a2c00">🎤</button></div></div>';
    });
    h += '</div>';
    // Contest tab
    if (ms.weeklyContest && ms.weeklyContest.active) {
      h += '<div id="msTab_contest" class="msTabContent" style="display:none">';
      h += '<div style="background:rgba(255,209,102,.08);border:1.5px solid #ffd166;border-radius:14px;padding:14px;margin-bottom:10px">';
      h += '<div style="font-size:1.1rem;font-weight:800;color:#ffd166">🎤 Contest DJ: ' + ms.weeklyContest.genre + '</div>';
      h += '<div style="font-size:.78rem;color:#e7e0ff;margin-top:4px">' + ms.weeklyContest.week + ' · ' + ms.weeklyContest.entries.length + ' partecipanti</div>';
      h += '</div>';
      ms.weeklyContest.entries.forEach((entry, ei) => {
        h += '<div style="background:rgba(255,255,255,.05);border:1px solid #5b3bd6;border-radius:10px;padding:10px;margin-bottom:6px">';
        h += '<div style="display:flex;align-items:center;gap:6px">';
        h += '<span style="font-size:1.2rem">' + (entry.track.genre === 'House' ? '🎵' : '🎶') + '</span>';
        h += '<div style="flex:1"><div style="font-weight:800;color:#fff">' + entry.track.name + '</div>';
        h += '<div style="font-size:.7rem;color:#8a7fb8">' + entry.track.genre + ' · ❤️ ' + entry.likes + '</div></div>';
        h += '<button class="mini" data-vote="' + ei + '" style="background:#ffd166;color:#4a2c00">🗳️ Vota</button></div></div>';
      });
      h += '</div>';
    }
    body.innerHTML = h;
    // wire tabs
    body.querySelectorAll('.msTab').forEach(btn => {
      btn.onclick = () => {
        body.querySelectorAll('.msTabContent').forEach(c => c.style.display = 'none');
        body.querySelectorAll('.msTab').forEach(b => b.style.background = 'rgba(255,255,255,.1)');
        const tab = btn.dataset.tab;
        const tabEl = $('msTab_' + tab);
        if (tabEl) tabEl.style.display = '';
        btn.style.background = 'rgba(91,59,214,.3)';
      };
    });
    // wire play
    const playBtn = $('msPlayBtn');
    if (playBtn) playBtn.onclick = togglePlay;
    // wire save
    const saveBtn = $('msSaveBtn');
    if (saveBtn) saveBtn.onclick = saveTrack;
    // wire share
    const shareBtn = $('msShareBtn');
    if (shareBtn) shareBtn.onclick = shareTrack;
    // wire instrument buttons
    body.querySelectorAll('[data-inst]').forEach(btn => {
      btn.onclick = () => {
        const inst = btn.dataset.inst;
        if (track.instruments.includes(inst)) { removeInstrument(inst); }
        else { addInstrument(inst); }
      };
    });
    // wire step buttons
    body.querySelectorAll('[data-step]').forEach(btn => {
      btn.onclick = () => {
        const step = parseInt(btn.dataset.step);
        const lane = btn.dataset.lane;
        toggleStep(step, lane);
      };
    });
    // wire tempo buttons
    body.querySelectorAll('[data-tempo]').forEach(btn => {
      btn.onclick = () => setTempo(btn.dataset.tempo);
    });
    // wire genre buttons
    body.querySelectorAll('[data-genre]').forEach(btn => {
      btn.onclick = () => setGenre(btn.dataset.genre);
    });
    // wire load/delete/contest
    body.querySelectorAll('[data-load]').forEach(btn => { btn.onclick = () => loadTrack(parseInt(btn.dataset.load)); });
    body.querySelectorAll('[data-delete]').forEach(btn => { btn.onclick = () => deleteTrack(parseInt(btn.dataset.delete)); });
    body.querySelectorAll('[data-contest]').forEach(btn => { btn.onclick = () => submitToContest(parseInt(btn.dataset.contest)); });
    // wire vote
    body.querySelectorAll('[data-vote]').forEach(btn => { btn.onclick = () => voteContest(parseInt(btn.dataset.vote)); });
  }

  /* ============ CONFIRM MODAL ============ */
  function openConfirm({ title = 'Conferma', message = '', confirmLabel = 'Conferma', cancelLabel = 'Annulla', danger = false, onConfirm = null, onCancel = null } = {}) {
    const titleEl = $('confirmTitle');
    const bodyEl = $('confirmBody');
    const okBtn = $('confirmOk');
    const cancelBtn = $('confirmCancel');
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.textContent = message;
    if (okBtn) {
      okBtn.textContent = confirmLabel;
      okBtn.style.background = danger ? '#ff5d9e' : '#3ddc97';
      okBtn.onclick = () => { closeConfirm(); if (typeof onConfirm === 'function') onConfirm(); };
    }
    if (cancelBtn) {
      cancelBtn.textContent = cancelLabel;
      cancelBtn.onclick = () => { closeConfirm(); if (typeof onCancel === 'function') onCancel(); };
    }
    closeAllSheets();
    $('sConfirm').classList.add('on');
    // focus ok button for accessibility
    setTimeout(() => okBtn && okBtn.focus(), 50);
  }
  function closeConfirm() {
    $('sConfirm').classList.remove('on');
  }

  /* ============ EVENTI A ORARI ============ */
  function activeEvent() {
    const d = new Date();
    const nowMin = d.getHours() * 60 + d.getMinutes();
    for (const ev of D.events) {
      const start = ev.h * 60 + (ev.m || 0);
      const end = start + (ev.dur || 30);
      if (nowMin >= start && nowMin < end) {
        return { active: true, ...ev, end };
      }
    }
    return { active: false, next: null, mult: 1 };
  }
  function nextEventText() {
    const d = new Date();
    const nowMin = d.getHours() * 60 + d.getMinutes();
    let best = null;
    D.events.forEach(ev => {
      let start = ev.h * 60 + (ev.m || 0);
      if (start <= nowMin) start += 24 * 60;
      if (!best || start < best.start) best = { ...ev, start };
    });
    if (!best) return null;
    const diff = best.start - nowMin;
    const h = Math.floor(diff / 60), m = diff % 60;
    return (h > 0 ? h + 'h ' : '') + m + 'm';
  }
  let lastEvCheck = 0;
  let evActiveNow = false;
  function everyTick(dt) {
    if (!st) return;
    st._tick = (st._tick || 0) + dt;
    if (st._tick < 1) return;
    const elapsed = st._tick;
    st._tick = 0;
    const now = performance.now();
    const ev = activeEvent();
    if (ev.active && !evActiveNow) {
      evActiveNow = true;
      toast(ev.msg);
      logDiary(ev.msg);
      if (st.room === 'discoteca' || st.room === 'bar') {
        for (let i = 0; i < 6; i++) setTimeout(() => spawnFx(150 + Math.random() * 380, 130 + Math.random() * 200, ev.emoji === '🪩' ? '🪩' : '🍹', 20), i * 200);
      }
    } else if (!ev.active) evActiveNow = false;
    // stagione
    if (typeof checkSeasonal === 'function') checkSeasonal();
    if (typeof updateSeasonalChip === 'function') updateSeasonalChip();
    // produzione mobili della camera
    productionTick();
    // ciclo giorno/notte
    dayTime = (dayTime + daySpeed * dt * 60) % 1;
    // particelle ambientali
      if (now - lastParticles > 1500) {
        lastParticles = now;
        const r = room();
        const count = r.id === 'giardino' ? 3 : r.id === 'discoteca' ? 4 : r.id === 'terrazza' ? 2 : 1;
        // seasonal particle type
        const seasonalEv = getSeasonalEvent();
        let seasonalType = null;
        if (seasonalEv) {
          if (seasonalEv.id === 'halloween') seasonalType = 'ghost';
          else if (seasonalEv.id === 'christmas') seasonalType = 'snow';
          else if (seasonalEv.id === 'easter') seasonalType = 'petal';
          else if (seasonalEv.id === 'summer') seasonalType = 'wave';
        }
        for (let i = 0; i < count; i++) {
          const pType = seasonalType || (r.id === 'giardino' ? 'firefly' : r.id === 'discoteca' ? 'sparkle' : r.id === 'terrazza' ? 'star' : 'dust');
          ambientParticles.push({
            x: 30 + Math.random() * (r.w - 60),
            y: r.walkTop + 20 + Math.random() * (r.h - r.walkTop - 80),
            type: pType,
            life: 3000 + Math.random() * 2000,
            t: now,
            vy: -(0.1 + Math.random() * 0.3),
            vx: (Math.random() - 0.5) * 0.3
          });
        }
      }
    // collezionabili volanti
    if (flyingCollectibles.length < 3 && Math.random() < 0.003) {
      const r = room();
      flyingCollectibles.push({
        x: 50 + Math.random() * (r.w - 100),
        y: r.walkTop + 30 + Math.random() * (r.h - r.walkTop - 100),
        e: Math.random() < 0.7 ? '🪙' : '⭐',
        life: 6000 + Math.random() * 4000,
        t: now,
        vy: -0.05 - Math.random() * 0.1,
        vx: (Math.random() - 0.5) * 0.2
      });
    }
    // aggiorna particelle
    ambientParticles = ambientParticles.filter(p => now - p.t < p.life);
    flyingCollectibles = flyingCollectibles.filter(c => now - c.t < c.life);
    updatePets(elapsed);
    checkFashionShow();
    updateGhosts(elapsed);
    updateMinigame(elapsed);
    updateDanceBattle(elapsed);
    updateWeather(elapsed);
    // contest DJ: il pubblico aggiunge like alle entry attive
    const wc = st.musicStudio && st.musicStudio.weeklyContest;
    if (wc && wc.active && wc.entries && wc.entries.length) {
      if (Math.random() < 0.15) {
        const e = wc.entries[Math.floor(Math.random() * wc.entries.length)];
        e.likes++;
      }
      wc.entries.forEach(e => { if (e.isPlayer && e.likes >= 10 && !achievements.viral_hit) unlockAch('viral_hit'); });
    }
  }
  function productionTick() {
    const now = Date.now();
    let gained = 0;
    (st.placed || []).forEach(p => {
      const item = D.furnitureShop.find(f => f.e === p.e);
      if (!item || !item.prod) return;
      if (!p.last) p.last = now;
      if (now - p.last >= 30000) { p.last = now; gained += item.prod; }
    });
    if (gained > 0) {
      addCoins(gained, true);
      if (st.room === 'camera') spawnFx(player.x, player.y - 46, '🪙');
    }
  }

  /* ============ OSPITE DEL GIORNO ============ */
  function guestId() {
    const keys = Object.keys(D.bots).sort();
    const seed = dayKey().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return keys[seed % keys.length];
  }

  /* ============ XP / LIVELLO GIOCATORE ============ */
  const XP_T = [20, 60, 120, 220, 340];
  function lvlOfPlayer() { let l = 0; XP_T.forEach(t => { if (st.xp >= t) l++; }); return l; }
  function xpAdd(n) {
    normalize();
    st.xp = (st.xp || 0) + n;
    const lv = lvlOfPlayer();
    if (lv > (st.lvl || 0)) {
      st.lvl = lv;
      addCoins(10 + lv * 5, true);
      toast('⬆️ Livello ' + lv + '! +' + (10 + lv * 5) + ' 🪙' + (lv >= 3 ? ' (sconto guardaroba 20% attivo)' : ''));
      logDiary('⬆️ Sei salito al livello ' + lv + '!');
      blip(523, .1, 'triangle'); setTimeout(() => blip(784, .16, 'triangle'), 100);
    }
    save();
  }
  function effCost(c) { return st.lvl >= 3 ? Math.ceil(c * 0.8) : c; }

  /* ============ DIARIO ============ */
  function logDiary(txt) {
    normalize();
    const d = new Date();
    const stamp = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    st.log = st.log || [];
    st.log.unshift(stamp + '  ' + txt);
    if (st.log.length > 50) st.log.length = 50;
    save();
  }

  /* ============ ALBUM / FIGURINE ============ */
  function addSticker(botId) {
    normalize();
    st.stickers = st.stickers || {};
    if (!st.stickers[botId]) {
      st.stickers[botId] = 1;
      const all = Object.keys(D.bots).length;
      const got = Object.keys(st.stickers).length;
      toast('📔 Figurina di ' + D.bots[botId].name + ' aggiunta all\'album (' + got + '/' + all + ')');
      if (got >= all && !st.albumBonus) { st.albumBonus = true; addCoins(50); toast('🏆 Album completo! +50 🪙'); }
      save();
    }
  }

  /* ============ NEGOZIO & CAMERA ============ */
  function renderShop() {
    normalize();
    $('shopCoins').textContent = '🪙 ' + st.coins;
    const b = $('shopBody');
    b.innerHTML = '';
    D.furnitureShop.forEach((f, i) => {
      const card = document.createElement('div');
      card.style.cssText = 'display:flex;gap:10px;align-items:center;background:#faf8ff;border:1.5px solid #e7e0ff;border-radius:14px;padding:9px 11px;margin-bottom:8px';
      card.innerHTML = '<span style="font-size:24px">' + f.e + '</span><div style="flex:1;min-width:0"><b style="color:#3a2a8f;font-size:.9rem">' + f.name + '</b><div style="font-size:.72rem;color:#8a7fb8">' + f.desc + '</div></div>' +
        '<button class="mini" data-buy="' + i + '">🛒 ' + effCost(f.cost) + '🪙</button>';
      card.querySelector('[data-buy]').addEventListener('click', () => buyFurn(i));
      b.appendChild(card);
    });
  }
  function buyFurn(i) {
    const f = D.furnitureShop[i];
    const cost = effCost(f.cost);
    if (st.coins < cost) { toast('Ti servono ' + cost + ' 🪙'); return; }
    st.coins -= cost;
    st.shopItems = st.shopItems || [];
    st.shopItems.push(f.e);
    toast('🛒 Comprato: ' + f.name);
    logDiary('🛒 Comprato: ' + f.name + ' (' + cost + ' 🪙)');
    coinSound();
    updateHUD(); save(); renderShop();
  }
  function firstFreeSlot() {
    const slots = room().slots || [];
    st.placed = st.placed || [];
    for (let i = 0; i < slots.length; i++) if (!st.placed.find(p => p.slot === i)) return i;
    return -1;
  }
  function placeFirst(slotIdx) {
    st.shopItems = st.shopItems || [];
    st.placed = st.placed || [];
    if (!st.shopItems.length) { toast('Magazzino vuoto: compra al negozio'); return; }
    const idx = slotIdx >= 0 ? slotIdx : firstFreeSlot();
    if (idx < 0) { toast('Camera piena: tocca un mobile per riporlo'); return; }
    if (st.placed.find(p => p.slot === idx)) return;
    const e = st.shopItems.shift();
    st.placed.push({ e, slot: idx, last: Date.now() });
    toast('📦 Posizionato: ' + e + ' (produce monete ogni 30s)');
    save(); renderStash();
  }
  function removePlaced(slotIdx) {
    st.placed = st.placed || [];
    const p = st.placed.find(x => x.slot === slotIdx);
    if (!p) return;
    st.placed = st.placed.filter(x => x.slot !== slotIdx);
    st.shopItems.push(p.e);
    toast('📦 ' + p.e + ' riposto nel magazzino');
    save(); renderStash();
  }
  function renderStash() {
    normalize();
    const b = $('stashBody');
    st.shopItems = st.shopItems || [];
    st.placed = st.placed || [];
    let h = '';
    if (st.shopItems.length) {
      const uniq = [...new Set(st.shopItems)];
      h += '<div class="gtitle">Da posizionare</div>';
      uniq.forEach(e => {
        const cnt = st.shopItems.filter(x => x === e).length;
        const meta = D.furnitureShop.find(f => f.e === e);
        h += '<div style="display:flex;align-items:center;gap:9px;background:#faf8ff;border:1px solid #e7e0ff;border-radius:12px;padding:7px 10px;margin-bottom:6px"><span style="font-size:20px">' + e + '</span><div style="flex:1;font-size:.8rem;color:#3a2a8f"><b>' + (meta ? meta.name : e) + '</b> ×' + cnt + '</div><button class="mini" data-put="' + e + '">▶ posiziona</button></div>';
      });
    } else h += '<div style="color:#8a7fb8;font-size:.82rem;margin-bottom:8px">Magazzino vuoto. Compra al 🛒 Negozio mobili.</div>';
    h += '<div class="gtitle">Nella tua camera</div>';
    if (st.placed.length) {
      st.placed.forEach(p => {
        const meta = D.furnitureShop.find(f => f.e === p.e);
        h += '<div style="display:flex;align-items:center;gap:9px;background:#f4fff6;border:1px solid #bdecc8;border-radius:12px;padding:7px 10px;margin-bottom:6px"><span style="font-size:20px">' + p.e + '</span><div style="flex:1;font-size:.78rem;color:#0a6b3a">' + (meta ? meta.name : p.e) + ' · slot ' + (p.slot + 1) + ' · produce 🪙</div><button class="mini" data-rm="' + p.slot + '">riponi</button></div>';
      });
    } else h += '<div style="color:#8a7fb8;font-size:.82rem">Camera vuota: tocca uno slot tratteggiato per posizionare.</div>';
    b.innerHTML = h;
    b.querySelectorAll('[data-put]').forEach(btn => btn.onclick = () => { const e = btn.dataset.put; const i = st.shopItems.indexOf(e); if (i >= 0) { st.shopItems.splice(i, 1); const slot = firstFreeSlot(); if (slot < 0) { st.shopItems.push(e); toast('Camera piena'); return; } st.placed.push({ e, slot, last: Date.now() }); toast('Posizionato ' + e); save(); renderStash(); } });
    b.querySelectorAll('[data-rm]').forEach(btn => btn.onclick = () => removePlaced(parseInt(btn.dataset.rm, 10)));
  }
  function drawCameraExtras() {
    const r = room();
    if (r.id !== 'camera') return;
    const now = performance.now();
    if (st.builder && st.builder.active) {
      // builder mode slots
      (r.slots || []).forEach((sp, si) => {
        const placed = st.builder.slots.find(p => p.slot === si);
        if (!placed) {
          ctx.strokeStyle = 'rgba(122,90,255,.5)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(sp.x, sp.y - 6, 26, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = '16px system-ui,sans-serif';
          ctx.fillStyle = 'rgba(122,90,255,.6)';
          ctx.textAlign = 'center';
          ctx.fillText('+', sp.x, sp.y + 2);
        } else {
          const bob = Math.sin(now / 600 + si) * 2;
          ctx.fillStyle = 'rgba(60,20,100,.12)';
          ctx.beginPath(); ctx.ellipse(sp.x, sp.y + 8, 14, 4.5, 0, 0, TAU); ctx.fill();
          ctx.font = '34px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(placed.e, sp.x, sp.y - 10 + bob);
          const pulse = 0.5 + 0.5 * Math.sin(now / 400 + si * 1.2);
          ctx.strokeStyle = 'rgba(61,220,151,' + (0.3 + pulse * 0.5) + ')';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(sp.x, sp.y - 8, 30 + pulse * 2, 0, TAU); ctx.stroke();
        }
      });
    } else {
      st.placed = st.placed || [];
      (r.slots || []).forEach((sp, si) => {
        const placed = st.placed.find(p => p.slot === si);
        if (!placed) {
          ctx.strokeStyle = 'rgba(122,90,255,.5)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(sp.x, sp.y - 6, 26, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = '16px system-ui,sans-serif';
          ctx.fillStyle = 'rgba(122,90,255,.6)';
          ctx.textAlign = 'center';
          ctx.fillText('+', sp.x, sp.y + 2);
        } else {
          const bob = Math.sin(now / 600 + si) * 2;
          ctx.fillStyle = 'rgba(60,20,100,.12)';
          ctx.beginPath(); ctx.ellipse(sp.x, sp.y + 8, 14, 4.5, 0, 0, TAU); ctx.fill();
          ctx.font = '34px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(placed.e, sp.x, sp.y - 10 + bob);
          const pulse = 0.5 + 0.5 * Math.sin(now / 400 + si * 1.2);
          ctx.strokeStyle = 'rgba(61,220,151,' + (0.3 + pulse * 0.5) + ')';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(sp.x, sp.y - 8, 30 + pulse * 2, 0, TAU); ctx.stroke();
        }
      });
    }
    // sotterraneo slots
    if (r.id === 'sotterraneo') {
      (r.slots || []).forEach((sp, si) => {
        const now = performance.now();
        ctx.strokeStyle = 'rgba(155,89,182,.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y - 6, 26, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '16px system-ui,sans-serif';
        ctx.fillStyle = 'rgba(155,89,182,.6)';
        ctx.textAlign = 'center';
        ctx.fillText('🗝️', sp.x, sp.y + 2);
      });
    }
  }

  /* ============ CACCIA AL TESORO ============ */
  function startTreasure() {
    closeGame(); showGame('🧭 Caccia al tesoro');
    const body = $('gameBody');
    const N = 12, chest = Math.floor(Math.random() * N);
    let left = 4;
    body.innerHTML = '<div style="text-align:center;color:#8a7fb8;font-size:.85rem">Tino ha nascosto il forziere tra 12 casse.<br>Hai <b id="trLeft" style="color:#5b3bd6">4</b> tentativi. Ogni errore dimezza… il premio non si sa mai.</div>' +
      '<div id="trGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px"></div><div id="trRes" style="text-align:center;min-height:34px;font-weight:900;color:#3a2a8f;margin-top:10px"></div>';
    const grid = $('trGrid');
    let done = false;
    for (let i = 0; i < N; i++) {
      const b = document.createElement('button');
      b.className = 'trc';
      b.style.cssText = 'aspect-ratio:1;font-size:30px;border-radius:14px;border:2px solid #e7e0ff;background:linear-gradient(135deg,#c9a15f,#8a5a2b);cursor:pointer;color:rgba(255,255,255,.2)';
      b.addEventListener('click', () => {
        if (done || b.dataset.open) return;
        b.dataset.open = '1';
        left--;
        if (i === chest) {
          done = true;
          b.textContent = '🎁';
          b.style.background = '#3ddc97';
          const earned = 6 + left * 2;
          $('trRes').textContent = '🎉 Trovato! Premi residui: ' + left;
          doneGame('treasure', earned, '🧭 Forziere trovato! +' + earned + ' 🪙');
        } else {
          b.textContent = '❌';
          b.style.background = '#e8e0ff';
          $('trLeft').textContent = left;
          if (left <= 0) {
            done = true;
            grid.children[chest].textContent = '🎁';
            grid.children[chest].style.background = '#3ddc97';
            $('trRes').textContent = 'Tino ha vinto… stavolta.';
            doneGame('treasure', 0, '🧭 Il forziere era sotto la cassa ' + (chest + 1) + '. Riprova!');
          }
        }
      });
      grid.appendChild(b);
    }
  }

  /* ============ FOTO DEL LOOK ============ */
  function lookShot() {
    const c = document.createElement('canvas');
    c.width = 420; c.height = 560;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 420, 560);
    grad.addColorStop(0, '#5b3bd6'); grad.addColorStop(.55, '#ff5d9e'); grad.addColorStop(1, '#ffd166');
    g.fillStyle = grad; g.fillRect(0, 0, 420, 560);
    // cerchi decorativi
    g.globalAlpha = .25;
    g.fillStyle = '#fff';
    [[350, 80, 60], [60, 480, 90], [370, 430, 40]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
    g.globalAlpha = 1;
    g.textAlign = 'center';
    g.font = '900 30px system-ui,sans-serif';
    g.fillStyle = '#fff';
    g.fillText('MIRAGGIO HOTEL', 210, 76);
    g.font = '600 22px system-ui,sans-serif';
    g.fillText((st.nick || 'Ospite') + ' · ' + badgeFor().title, 210, 112);
    const saved = ctx;
    ctx = g;
    g.translate(210, 330); g.scale(3.1, 3.1);
    drawAv(0, 0, 0, 1, st.outfit, 1, false);
    ctx = saved;
    g.font = '16px system-ui,sans-serif';
    g.fillStyle = 'rgba(255,255,255,.85)';
    g.fillText('La tua scheda al Miraggio 🏨', 210, 532);
    try {
      const url = c.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url; a.download = 'miraggio-look.png';
      document.body.appendChild(a); a.click(); a.remove();
      toast('📸 Look salvato come immagine');
    } catch (e) { toast('Export non supportato'); }
  }

  /* ============ PHOTO MODE ============ */
  let currentFilter = 'none';

  function openPhotoMode() {
    closeAllSheets();
    const el = $('sPhoto');
    if (el) {
      el.classList.add('on');
      renderPhotoPreview();
      renderFilterList();
    }
  }

  function renderFilterList() {
    const list = $('filterList');
    if (!list) return;
    let h = '';
    D.photoFilters.forEach(f => {
      h += '<button class="room' + (currentFilter === f.id ? ' here' : '') + '" data-filter="' + f.id + '" style="padding:6px;font-size:.75rem;text-align:center">' +
        '<span style="font-size:16px">' + f.emoji + '</span><br>' + f.name + '</button>';
    });
    list.innerHTML = h;
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.onclick = () => {
        currentFilter = btn.dataset.filter;
        renderFilterList();
        renderPhotoPreview();
      };
    });
  }

  function renderPhotoPreview() {
    const preview = $('photoPreview');
    if (!preview) return;
    const pctx = preview.getContext('2d');
    const w = preview.width, h = preview.height;
    // draw game canvas scaled to preview
    pctx.drawImage(canvas, 0, 0, w, h);
    // apply filter
    const filter = D.photoFilters.find(f => f.id === currentFilter);
    if (filter && filter.css !== 'none') {
      preview.style.filter = filter.css;
    } else {
      preview.style.filter = 'none';
    }
  }

  function savePhoto() {
    const preview = $('photoPreview');
    if (!preview) return;
    // create final canvas with filter baked in
    const c = document.createElement('canvas');
    c.width = 1200; c.height = 800;
    const g = c.getContext('2d');
    // apply filter via CSS filter on context (if supported)
    const filter = D.photoFilters.find(f => f.id === currentFilter);
    if (filter && filter.css !== 'none') {
      g.filter = filter.css;
    }
    // draw game scene
    g.drawImage(canvas, 0, 0, 1200, 800);
    g.filter = 'none';
    // add watermark
    g.globalAlpha = 0.6;
    g.font = 'bold 24px system-ui,sans-serif';
    g.fillStyle = '#fff';
    g.textAlign = 'right';
    g.textBaseline = 'bottom';
    g.fillText('🏨 Miraggio Hotel · ' + (st.nick || 'Ospite'), 1180, 780);
    g.globalAlpha = 1;
    // add filter name
    if (filter && filter.id !== 'none') {
      g.font = '16px system-ui,sans-serif';
      g.fillStyle = 'rgba(255,255,255,.7)';
      g.textAlign = 'left';
      g.fillText(filter.emoji + ' ' + filter.name, 20, 780);
    }
    try {
      const url = c.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url; a.download = 'miraggio-photo-' + currentFilter + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      toast('📸 Foto salvata con filtro ' + (filter ? filter.emoji : '') + '!');
    } catch (e) { toast('Export non supportato'); }
  }

  /* ============ CHAT GLOBALE (BroadcastChannel tra schede) ============ */
  let bc = null;
  function initBroadcast() {
    try {
      if (typeof BroadcastChannel === 'undefined') return;
      bc = new BroadcastChannel('miraggio-hotel');
      bc.onmessage = (ev) => {
        const d = ev.data;
        if (!d || !d.txt || d.nick === st.nick) return;
        toast('📡 ' + d.nick + ' ha scritto: ' + d.txt);
        spawnFx(player.x, player.y - 60, '📡');
      };
    } catch (e) {}
  }
  function broadcast(txt) {
    try { if (bc) bc.postMessage({ nick: st.nick || 'Ospite', txt }); } catch (e) {}
  }

  /* ============ WIRING EXTRA 2 ============ */
  function wireExtra2() {
    $('soundBtn').onclick = () => { st.sound = st.sound === false ? true : false; save(); updateHUD(); toast(st.sound === false ? '🔇 Suoni disattivati' : '🔊 Suoni attivi'); };
    $('shopChip').onclick = () => { const el = $('sShop'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderShop(); } };
    $('stashChip').onclick = () => { const el = $('sStash'); const was = el.classList.contains('on'); closeAllSheets(); if (!was) { el.classList.add('on'); renderStash(); } };
    $('diaryCopy').onclick = () => { const t = (st.log || []).join('\n'); if (!t) return toast('Diario ancora vuoto'); copyText(t); };
    $('diaryClear').onclick = () => { st.log = []; save(); renderMissionsUI(); toast('🗑️ Diario svuotato'); };
    $('lookShot').onclick = lookShot;
    initBroadcast();
  }
  function copyText(txt) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(() => toast('📋 Copiato')).catch(() => {}); return; }
    } catch (e) {}
    const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('📋 Copiato'); } catch (e) {}
    ta.remove();
  }

  /* API di debug/test (nessun effetto sul gameplay) — attiva con ?dev o window.__DEV__ */
  if (/(\?|&)dev(=|&|$)/.test(location.search) || window.__DEV__) window.__MH = {
    get: () => (typeof structuredClone === 'function' ? structuredClone(st) : JSON.parse(JSON.stringify(st))),
    room: () => st.room,
    bots: () => roomBots.length,
    roomFurn: () => room().furniture.map(f => f.e),
    enter: (id) => enterRoom(id),
    talk: (i) => { const bp = roomBots[i]; if (bp) talkBot(bp); return !!bp; },
    furn: (i) => { const f = room().furniture[i]; if (f && D.furnitureReplies[f.e]) interactFurniture(f); },
    emote: (id) => { const e = D.emotes.find(x => x.id === id); if (e) doEmote(e); },
    chat: (t) => sendChat(t),
    equipStyle: (slot, id, cost, type) => equipStyle(slot, id, cost, type),
    equipColor: (hex) => buyEquipColor(hex),
    coins: () => st.coins,
    bubbleCount: () => bubbles.length,
    anim: () => player.anim,
    nick: (n) => { if (n) st.nick = n; return st.nick; },
    save: () => save(),
    paint: () => draw(),
    tryOutfit: (h, a) => { st.outfit.hairStyle = h; st.outfit.acc = a; },
    openGame: (id) => openGame(id),
    lvlOf: (id) => lvlOf(id),
    missionCount: () => { ensureMissions(); return st.missions.list.filter(m => !m.done).length; },
    xp: () => st.xp || 0,
    lvlP: () => st.lvl || 0,
    eventInfo: () => activeEvent(),
    guest: () => guestId(),
    buyFurn: (i) => buyFurn(i),
    placeFirst: (s) => placeFirst(s),
    placedCount: () => (st.placed || []).length,
    shopItemsCount: () => (st.shopItems || []).length,
    tutorial: () => st.tutorial,
    tutorialStep: (n) => { st.tutorial.step = n; st.tutorial.completed = false; st.tutorial.seen = {}; save(); },
    tutorialComplete: () => { st.tutorial.completed = true; save(); },
    tutorialReset: () => { st.tutorial = { step: 0, completed: false, seen: {} }; save(); },
    titles: () => st.titles || [],
    title: () => st.title || '',
    setTitle: (id) => { setTitle(id); },
    unlockTitle: (id) => { unlockTitle(id); },
    checkTitles: () => { checkTitles(); },
    photoMode: () => openPhotoMode(),
    setFilter: (id) => { currentFilter = id; },
    mystery: (id) => { startMystery(id); },
    findClue: (mid, cid) => { findClue(mid, cid); },
    solveMystery: (ans) => { answerMystery(ans); },
    mysteryProgress: () => { const m = getCurrentMystery(); return m ? getMysteryProgress(m.id) : null; },
    builder: () => openBuilder(),
    builderSave: () => saveBuilderRoom(),
    builderCode: () => generateBuilderCode(),
    builderRooms: () => (st.builderRooms || []).length,
    builderVotes: () => st.builderVotes || {},
    societyKeys: () => st.society ? st.society.keys : 0,
    societyMissions: () => st.society ? (st.society.missionsDone || []).length : 0,
    societyBuy: (i) => { if (D.shadowShop[i]) buyShadowItem(i); },
    societyVisit: () => visitSotterraneo(),
    stickers: () => Object.keys(st.stickers || {}).length,
    diaryLen: () => (st.log || []).length,
    outfit: () => JSON.parse(JSON.stringify(st.outfit))
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
