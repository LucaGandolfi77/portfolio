/* Card Collector — DOM rendering, tabs, modals and bilingual strings */

import { state, exportSave, importSave, resetSave } from './state.js';
import { CARDS, BOXES, RARITY } from './data.js';
import { cardPower, getUpgradeRequirement, collectionStats, DECK_LIMITS } from './collection.js';
import { xpForLevel, QUEST_POOL, ACHIEVEMENTS } from './economy.js';
import { setTranslator, toast, celebrate } from './effects.js';

const DICT = {
  en: {
    back: 'Portfolio', tagline: 'Collect · upgrade · battle',
    navCollection: 'Collection', navDeck: 'Decks', navShop: 'Shop', navFortune: 'Fortune',
    navSlot: 'Slots', navBattle: 'Scopa Battle', navMega: 'Mega Battle', navStats: 'Stats', navProfile: 'Profile',
    collectionTitle: 'Your collection', deckTitle: 'Battle deck', shopTitle: 'Card packs',
    fortuneTitle: 'Fortune wheel', slotTitle: 'Lucky slots', questsTitle: 'Daily quests',
    achTitle: 'Achievements', saveTitle: 'Save data',
    scoreAttack: 'ATK', scoreDefense: 'DEF', level: 'Level', count: 'Copies',
    upgrade: 'Upgrade', upgradeNeed: 'Needs {{n}} copies', upgradeBtn: '⬆ Upgrade',
    megaDeck: 'Mega deck (8)', scopaDeck: 'Scopa deck (12)', slotEmpty: '—',
    buyGold: 'Buy with gold', buyGems: 'Buy with gems', cardsInside: '{{n}} cards',
    spinOne: 'Spin ×1 · 500', spinTen: 'Spin ×10 · 5000', slotBet: 'Bet', spin: 'SPIN',
    startScopa: 'Start battle', startMega: 'Start battle', close: 'Close', rematch: 'Rematch',
    result: 'Result', victory: 'Victory!', defeat: 'Defeat!',
    statTotal: 'Cards owned', statLegendary: 'Legendaries', statBattles: 'Battles won', statBoxes: 'Boxes opened',
    xpText: '{{a}} / {{b}} XP', streak: '🔥 {{n}} day streak',
    exportSave: 'Export save', importSave: 'Import save', resetSave: 'Reset',
    skip: 'Skip reveal', closeBox: 'Done', rules: 'How to play',
    notEnough: 'Not enough currency', notEnoughDuplicates: 'Not enough copies',
    upgraded: 'Card upgraded!', deckFull: 'Deck is full', deckNeededMega: 'Add 8 cards to your Mega deck first',
    legendaryPull: 'Legendary pull!', boxOpened: 'Pack opened!', slotWin: 'You won!', slotLose: 'Try again',
    battleWon: 'Victory!', battleLost: 'Defeat!', yourTurn: 'Your turn!',
    youCaptured: 'You captured cards!', enemyCaptured: 'Enemy captured cards!',
    youPlayed: 'You played a card.', enemyPlayed: 'Enemy played a card.',
    questBoxes: 'Open a pack', questBattles: 'Win a battle', questSpins: 'Spin the slots 3×', questCards: 'Collect 5 cards',
    achFirstCard: 'First card', achCollector10: '10 cards', achCollectorAll: 'Complete collection',
    achLegendary: 'Legendary owner', achWins5: '5 victories', achBoxes10: '10 packs', achStreak3: '3-day streak',
    reward: '+{{n}}', language: 'Language', theme: 'Theme',
    saveImported: 'Save imported!', saveInvalid: 'Invalid save file', confirmReset: 'Delete all progress?'
  },
  it: {
    back: 'Portfolio', tagline: 'Colleziona · potenzia · combatti',
    navCollection: 'Collezione', navDeck: 'Mazzi', navShop: 'Negozio', navFortune: 'Fortuna',
    navSlot: 'Slot', navBattle: 'Battaglia Scopa', navMega: 'Mega Battaglia', navStats: 'Statistiche', navProfile: 'Profilo',
    collectionTitle: 'La tua collezione', deckTitle: 'Mazzo da battaglia', shopTitle: 'Pacchetti',
    fortuneTitle: 'Ruota della fortuna', slotTitle: 'Slot fortunati', questsTitle: 'Missioni giornaliere',
    achTitle: 'Obiettivi', saveTitle: 'Salvataggio',
    scoreAttack: 'ATT', scoreDefense: 'DIF', level: 'Livello', count: 'Copie',
    upgrade: 'Potenzia', upgradeNeed: 'Servono {{n}} copie', upgradeBtn: '⬆ Potenzia',
    megaDeck: 'Mazzo mega (8)', scopaDeck: 'Mazzo scopa (12)', slotEmpty: '—',
    buyGold: 'Compra con oro', buyGems: 'Compra con gemme', cardsInside: '{{n}} carte',
    spinOne: 'Gira ×1 · 500', spinTen: 'Gira ×10 · 5000', slotBet: 'Puntata', spin: 'GIRA',
    startScopa: 'Inizia battaglia', startMega: 'Inizia battaglia', close: 'Chiudi', rematch: 'Rivincita',
    result: 'Risultato', victory: 'Vittoria!', defeat: 'Sconfitta!',
    statTotal: 'Carte possedute', statLegendary: 'Leggendarie', statBattles: 'Battaglie vinte', statBoxes: 'Pacchetti aperti',
    xpText: '{{a}} / {{b}} XP', streak: '🔥 {{n}} giorni di fila',
    exportSave: 'Esporta salvataggio', importSave: 'Importa salvataggio', resetSave: 'Azzera',
    skip: 'Salta animazione', closeBox: 'Fatto', rules: 'Come si gioca',
    notEnough: 'Valuta insufficiente', notEnoughDuplicates: 'Copie insufficienti',
    upgraded: 'Carta potenziata!', deckFull: 'Mazzo pieno', deckNeededMega: 'Aggiungi 8 carte al mazzo Mega',
    legendaryPull: 'Carta leggendaria!', boxOpened: 'Pacchetto aperto!', slotWin: 'Hai vinto!', slotLose: 'Riprova',
    battleWon: 'Vittoria!', battleLost: 'Sconfitta!', yourTurn: 'Tuo turno!',
    youCaptured: 'Hai catturato carte!', enemyCaptured: 'Il nemico cattura carte!',
    youPlayed: 'Hai giocato una carta.', enemyPlayed: 'Il nemico gioca una carta.',
    questBoxes: 'Apri un pacchetto', questBattles: 'Vinci una battaglia', questSpins: 'Gira le slot 3 volte', questCards: 'Colleziona 5 carte',
    achFirstCard: 'Prima carta', achCollector10: '10 carte', achCollectorAll: 'Collezione completa',
    achLegendary: 'Leggendaria', achWins5: '5 vittorie', achBoxes10: '10 pacchetti', achStreak3: '3 giorni di fila',
    reward: '+{{n}}', language: 'Lingua', theme: 'Tema',
    saveImported: 'Salvataggio importato!', saveInvalid: 'File di salvataggio non valido', confirmReset: 'Eliminare tutti i progressi?'
  }
};

let lang = 'en';
let deckMode = 'mega';
let selectedCard = null;
let handlers = {};

function readLang() {
  try { return localStorage.getItem('site_lang') || localStorage.getItem('lang') || 'en'; }
  catch (e) { return 'en'; }
}

export function t(key, vars = {}) {
  let value = (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
  for (const k in vars) value = value.replace('{{' + k + '}}', String(vars[k]));
  return value;
}

function el(id) { return document.getElementById(id); }
function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(Math.floor(n));
}

export function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === id));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function getDeckMode() { return deckMode; }

export function cardElement(card, owned, options = {}) {
  const wrap = document.createElement('div');
  const level = owned?.level || 1;
  const count = owned?.count || 0;
  const power = cardPower(card, level);
  const needed = getUpgradeRequirement(level);
  wrap.className = `game-card rarity-${card.rarity}${owned ? '' : ' locked'}${options.compact ? ' compact' : ''}`;
  wrap.dataset.cardId = card.id;
  wrap.innerHTML = `
    <div class="card-sheen"></div>
    <div class="card-rarity">${RARITY[card.rarity].label}</div>
    <div class="card-art">${card.emoji}</div>
    <div class="card-title">${card.name}</div>
    <div class="card-stats"><span>⚔ ${power.attack}</span><span>🛡 ${power.defense}</span></div>
    ${owned ? `<div class="card-level">Lv ${level}</div><div class="card-count">×${count}</div>
      <div class="card-progress"><i style="width:${Math.min(100, count / needed * 100)}%"></i></div>` : ''}`;
  if (options.onClick) wrap.addEventListener('click', () => options.onClick(card));
  return wrap;
}

function renderHUD() {
  const d = state.data;
  el('goldAmount').textContent = fmt(d.gold);
  el('gemsAmount').textContent = fmt(d.gems);
  el('headerLevel').textContent = 'Lv.' + d.level;
  el('profileLevel').textContent = d.level;
  const need = xpForLevel(d.level);
  el('xpBar').style.width = Math.min(100, d.xp / need * 100) + '%';
  el('xpText').textContent = t('xpText', { a: d.xp, b: need });
  const streakEl = el('streakText');
  if (streakEl) streakEl.textContent = t('streak', { n: d.daily.streak || 0 });
}

function renderCollection() {
  const grid = el('collectionGrid');
  if (!grid) return;
  grid.innerHTML = '';
  CARDS.forEach(card => grid.appendChild(cardElement(card, state.data.collection[card.id], {
    onClick: c => openCardModal(c)
  })));
}

function renderDeck() {
  const slots = el('deckSlots');
  const grid = el('deckCollectionGrid');
  if (!slots || !grid) return;
  const deck = deckMode === 'mega' ? state.data.deck : state.data.scopaDeck;
  const limit = DECK_LIMITS[deckMode];
  slots.innerHTML = '';
  for (let i = 0; i < limit; i++) {
    const slot = document.createElement('div');
    slot.className = 'deck-slot' + (deck[i] ? '' : ' empty');
    if (deck[i]) {
      const card = CARDS.find(c => c.id === deck[i]);
      if (card) {
        slot.appendChild(cardElement(card, state.data.collection[card.id], { compact: true }));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'slot-remove';
        remove.textContent = '×';
        remove.onclick = ev => { ev.stopPropagation(); handlers.onRemoveFromDeck?.(card.id, deckMode); };
        slot.appendChild(remove);
      }
    } else slot.textContent = '+';
    slots.appendChild(slot);
  }
  grid.innerHTML = '';
  CARDS.filter(c => state.data.collection[c.id]).forEach(card => {
    const node = cardElement(card, state.data.collection[card.id], {
      compact: true,
      onClick: c => handlers.onAddToDeck?.(c.id, deckMode)
    });
    if (deck.includes(card.id)) node.classList.add('in-deck');
    grid.appendChild(node);
  });
  el('deckTitle').textContent = `${t('deckTitle')} · ${deck.length}/${limit}`;
  el('btnMegaDeck')?.classList.toggle('active', deckMode === 'mega');
  el('btnScopaDeck')?.classList.toggle('active', deckMode === 'scopa');
}

function renderShop() {
  const grid = el('shopGrid');
  if (!grid) return;
  grid.innerHTML = '';
  BOXES.forEach(box => {
    const card = document.createElement('div');
    card.className = 'shop-card';
    card.innerHTML = `
      <div class="shop-emoji">${box.emoji}</div>
      <h3>${box.name}</h3>
      <p>${t('cardsInside', { n: box.cards })}</p>
      <div class="shop-buttons">
        <button type="button" class="buy gold" data-box="${box.id}" data-currency="gold">💰 ${fmt(box.goldPrice)}</button>
        <button type="button" class="buy gems" data-box="${box.id}" data-currency="gems">💎 ${fmt(box.gemsPrice)}</button>
      </div>`;
    grid.appendChild(card);
  });
  grid.querySelectorAll('.buy').forEach(btn => {
    btn.onclick = () => handlers.onBuyBox?.(BOXES.find(b => b.id === btn.dataset.box), btn.dataset.currency);
  });
}

function renderStats() {
  const s = collectionStats();
  const d = state.data;
  el('statTotalCards').textContent = s.owned + '/' + s.total;
  el('statLegendary').textContent = s.legendary;
  el('statBattlesWon').textContent = d.battlesWon;
  el('statBoxesOpened').textContent = d.boxesOpened;
}

function renderQuests() {
  const box = el('questList');
  if (!box) return;
  box.innerHTML = '';
  state.data.daily.quests.forEach(q => {
    const row = document.createElement('div');
    row.className = 'quest' + (q.done ? ' done' : '');
    row.innerHTML = `<div><b>${t(q.key)}</b><small>${Object.entries(q.reward).map(([k, v]) => t('reward', { n: v }) + ' ' + k).join(' · ')}</small></div>
      <span>${q.progress}/${q.target}</span>`;
    box.appendChild(row);
  });
}

function renderAchievements() {
  const box = el('achievementList');
  if (!box) return;
  box.innerHTML = '';
  ACHIEVEMENTS.forEach(a => {
    const row = document.createElement('div');
    const done = !!state.data.achievements[a.id];
    row.className = 'achievement' + (done ? ' done' : '');
    row.innerHTML = `<span>${done ? '🏆' : '🔒'}</span><b>${t(a.key)}</b>`;
    box.appendChild(row);
  });
}

export function renderAll() {
  renderHUD();
  renderCollection();
  renderDeck();
  renderShop();
  renderStats();
  renderQuests();
  renderAchievements();
}

export function openCardModal(card) {
  selectedCard = card;
  const d = state.data;
  const owned = d.collection[card.id];
  el('modalCard').innerHTML = `<div class="card-art">${card.emoji}</div><div class="card-name">${card.name}</div>`;
  el('modalCardName').textContent = card.name;
  el('modalCardDesc').textContent = card.description;
  const power = cardPower(card, owned?.level || 1);
  el('modalCardStats').textContent = `${t('scoreAttack')} ${power.attack} · ${t('scoreDefense')} ${power.defense}`;
  el('modalCardPower').textContent = card.specialPower;
  el('modalCardCount').textContent = owned ? `${t('count')}: ${owned.count} · ${t('level')} ${owned.level}` : t('notEnoughDuplicates');
  const btn = el('upgradeBtn');
  btn.classList.toggle('is-hidden', !owned);
  if (owned) btn.textContent = `${t('upgradeBtn')} · ${t('upgradeNeed', { n: getUpgradeRequirement(owned.level) })}`;
  el('cardModal').classList.add('active');
}

export function closeCardModal() {
  el('cardModal')?.classList.remove('active');
  selectedCard = null;
}

export function showBoxReveal(cards) {
  const overlay = el('boxOverlay');
  const container = el('revealedCards');
  overlay.classList.add('active');
  container.innerHTML = '';
  let index = 0;
  const showNext = () => {
    const step = cards.length > 30 ? 4 : 1;
    for (let i = 0; i < step && index < cards.length; i++, index++) {
      const node = cardElement(cards[index], { count: 1, level: 1 }, { compact: true });
      node.classList.add('revealed');
      container.appendChild(node);
    }
    if (index < cards.length) setTimeout(showNext, cards.length > 30 ? 40 : 90);
  };
  setTimeout(showNext, 350);
  if (cards.some(c => c.rarity === 'legendary')) celebrate();
}

export function closeBoxReveal() { el('boxOverlay')?.classList.remove('active'); }

export function setDeckMode(mode) {
  deckMode = mode;
  renderDeck();
}

export function setLang(next) {
  lang = next === 'it' ? 'it' : 'en';
  document.documentElement.lang = lang;
  el('langBtn').textContent = lang === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  renderAll();
  toast('language');
}

export function initUI(callbacks) {
  handlers = callbacks;
  lang = readLang().slice(0, 2) === 'it' ? 'it' : 'en';
  document.documentElement.lang = lang;
  setTranslator(t);
  el('langBtn').textContent = lang === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });
  el('btnMegaDeck').onclick = () => setDeckMode('mega');
  el('btnScopaDeck').onclick = () => setDeckMode('scopa');
  el('upgradeBtn').onclick = () => { if (selectedCard) { handlers.onUpgrade?.(selectedCard.id); openCardModal(selectedCard); } };
  el('closeModal').onclick = closeCardModal;
  el('cardModal').addEventListener('click', e => { if (e.target.id === 'cardModal') closeCardModal(); });
  el('closeBox').onclick = closeBoxReveal;
  el('langBtn').onclick = () => setLang(lang === 'en' ? 'it' : 'en');

  el('btnExportSave').onclick = () => {
    const blob = new Blob([exportSave()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'card-collector-save.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  el('btnImportSave').onclick = () => el('saveFileInput').click();
  el('saveFileInput').onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try { importSave(await file.text()); renderAll(); toast('saveImported'); }
    catch (err) { toast('saveInvalid', 'error'); }
    e.target.value = '';
  };
  el('btnResetSave').onclick = () => {
    if (window.confirm(t('confirmReset'))) { resetSave(); renderAll(); }
  };
  renderAll();
}
