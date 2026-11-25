/* ============================================================================
   SIM — motore deterministico del gioco. Nessun DOM, nessun timer.
   Tutte le funzioni ricevono lo stato e ritornano descrittori di eventi.
   ============================================================================ */
import * as CFG from './config.js';
import {
  CATALOG, STARTER_CARD_IDS, getCard, cardsOfRarity, levelInfo, cardPower, rarityRank
} from './catalog.js';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function initPlayer(role, name, quotazione, skill) {
  return {
    id: uid(), name, role, quotazione, skill,
    costanza: 0.4 + Math.random() * 0.5,
    votoStorico: [], infortunio: 0, titolare: true
  };
}

/* Un giocatore-carta conserva soltanto lo stato dinamico: identità e stats
   arrivano sempre dal catalogo + livello, così i doppioni potenziano subito. */
function playerFromCard(card, found, opts = {}) {
  const power = cardPower(card, found);
  return {
    id: opts.id || uid(),
    cardId: card.id,
    name: card.name,
    role: card.role,
    rarity: card.rarity,
    cardLevel: power.level,
    quotazione: power.quotazione,
    skill: power.skill,
    costanza: power.costanza,
    votoStorico: opts.votoStorico || [],
    infortunio: opts.infortunio || 0,
    titolare: opts.titolare !== false
  };
}

function starterSquad() {
  return STARTER_CARD_IDS.map(id => playerFromCard(getCard(id), 1));
}

function starterCards() {
  const map = {};
  STARTER_CARD_IDS.forEach(id => { map[id] = { copies: 1, found: 1 }; });
  return map;
}

function buildClassifica() {
  const teams = [{ id:'user', name:'La Mia Squadra', emoji:'🛋️', fp:0, color:'#3ee6ff', form:[] }];
  CFG.TEAMS_AI.forEach(t => teams.push({ id:t.id, name:t.name, emoji:t.emoji, fp:0, color:t.color, form:[] }));
  return teams;
}

export function createInitialState() {
  const now = Date.now();
  return {
    version: CFG.SAVE_VERSION,
    fc: 0, totalFc: 0, fp: 0, totalFp: 0,
    giornata: 0, lastGiornataTime: now,
    players: starterSquad(),
    mercato: [],
    upgrades: {},
    scudetti: 0, scudettiDoro: 0,
    classifica: buildClassifica(),
    formation: '4-3-3',
    feed: [],
    tapCombo: 0, lastTap: 0,
    cards: starterCards(),
    chests: [{ id: uid(), tier: 'legno', at: now }],
    chestQueue: [],
    chestNextAt: now + CFG.CHEST_FREE_MS,
    chestPausedMs: null,
    merchant: null,
    tradeHistory: [],
    pity: { epico: 0, leggendario: 0 },
    stats: { taps:0, goals:0, wins:0, buys:0, upgrades:0, prestiges:0,
      chestsOpened:0, chestsBought:0, cardsFound:STARTER_CARD_IDS.length, trades:0, level5:0 },
    quests: {}, achievements: [],
    settings: { sound:true, motion:true, theme:'neon' }
  };
}

/* ------------------------------------------------------------- collezione */
export function ownedCard(state, cardId) {
  return state.cards ? state.cards[cardId] || null : null;
}

export function duplicatesOf(state, cardId) {
  const owned = ownedCard(state, cardId);
  return owned ? Math.max(0, (owned.copies || 1) - 1) : 0;
}

export function rosterPlayerFor(state, cardId) {
  return state.players.find(p => p.cardId === cardId) || null;
}

export function syncRosterCard(state, cardId) {
  const card = getCard(cardId);
  const owned = ownedCard(state, cardId);
  if (!card || !owned) return null;
  const player = rosterPlayerFor(state, cardId);
  if (!player) return null;
  const power = cardPower(card, owned.found);
  player.name = card.name;
  player.role = card.role;
  player.rarity = card.rarity;
  player.cardLevel = power.level;
  player.quotazione = power.quotazione;
  player.skill = power.skill;
  player.costanza = power.costanza;
  return player;
}

export function syncAllRosterCards(state) {
  state.players.forEach(p => { if (p.cardId) syncRosterCard(state, p.cardId); });
}

export function totalDuplicates(state) {
  return Object.keys(state.cards || {}).reduce((n, id) => n + duplicatesOf(state, id), 0);
}

export function recomputeCollectionStats(state) {
  const ids = Object.keys(state.cards || {}).filter(id => getCard(id));
  state.stats.cardsFound = ids.length;
  state.stats.level5 = ids.filter(id => levelInfo(state.cards[id].found).level >= 5).length;
  return state.stats;
}

/** Aggiunge una copia (nuova carta o doppione) e sincronizza l'eventuale rosa. */
export function addCardToCollection(state, cardId) {
  const card = getCard(cardId);
  if (!card) return { ok:false, msg:'Carta sconosciuta' };
  let owned = state.cards[cardId];
  const before = owned ? levelInfo(owned.found).level : 0;
  let isNew = false;
  let duplicate = false;
  if (!owned) {
    owned = state.cards[cardId] = { copies: 1, found: 1 };
    isNew = true;
  } else {
    owned.copies = Math.max(1, owned.copies || 1) + 1;
    owned.found = Math.max(owned.copies, (owned.found || 1) + 1);
    duplicate = true;
  }
  const info = levelInfo(owned.found);
  const levelUp = before > 0 && info.level > before;
  const player = syncRosterCard(state, cardId);
  recomputeCollectionStats(state);
  return {
    ok: true, card, owned, isNew, duplicate,
    levelBefore: before, levelAfter: info.level, levelUp,
    power: cardPower(card, owned.found), player
  };
}

/** Aggiunge una carta alla rosa. Se la rosa è piena serve replaceId. */
export function deployCard(state, cardId, replaceId) {
  const card = getCard(cardId);
  const owned = ownedCard(state, cardId);
  if (!card || !owned) return { ok:false, msg:'Carta non posseduta' };
  if (rosterPlayerFor(state, cardId)) return { ok:false, msg:'Carta già in rosa' };
  if (state.players.length >= CFG.MAX_ROSTER && !replaceId) {
    return { ok:false, needReplace:true, msg:'Rosa al completo: scegli chi sostituire' };
  }

  let player;
  if (replaceId) {
    const idx = state.players.findIndex(p => p.id === replaceId);
    if (idx < 0) return { ok:false, msg:'Giocatore non trovato' };
    const old = state.players[idx];
    player = playerFromCard(card, owned.found, { titolare: old.titolare });
    state.players[idx] = player;
    addFeed(state, `🃏 ${card.name} prende il posto di ${old.name} in rosa`, 'card');
    checkQuests(state);
    checkAchievements(state);
    return { ok:true, player, replaced: old };
  }

  const titolariRole = state.players.filter(p => p.titolare && p.role === card.role).length;
  player = playerFromCard(card, owned.found, {
    titolare: titolariRole < (CFG.ROLES[card.role] || 0)
  });
  state.players.push(player);
  addFeed(state, `🃏 ${card.name} entra in rosa come ${player.titolare ? 'titolare' : 'panchina'}`, 'card');
  checkQuests(state);
  checkAchievements(state);
  return { ok:true, player };
}

export function removeCardFromRoster(state, cardId) {
  const idx = state.players.findIndex(p => p.cardId === cardId);
  if (idx < 0) return { ok:false, msg:'La carta non è in rosa' };
  if (state.players.length <= 1) return { ok:false, msg:'Serve almeno un giocatore in rosa' };
  const old = state.players.splice(idx, 1)[0];
  addFeed(state, `🪑 ${old.name} torna in collezione`, 'card');
  return { ok:true, removed: old };
}

/* ---------------------------------------------------------------- bauli */
function rollRarity(drops, rng) {
  const entries = Object.entries(drops).filter(([, w]) => w > 0);
  const total = entries.reduce((n, [, w]) => n + w, 0);
  let r = rng() * total;
  for (const [rarity, weight] of entries) {
    if (r < weight) return rarity;
    r -= weight;
  }
  return entries.length ? entries[entries.length - 1][0] : 'comune';
}

function clampRarity(rarity, minRarity) {
  if (!minRarity) return rarity;
  return rarityRank(rarity) < rarityRank(minRarity) ? minRarity : rarity;
}

function pickCardForRarity(state, rarity, rng, preferUnowned) {
  const pool = cardsOfRarity(rarity);
  if (!pool.length) return pickCardForRarity(state, 'comune', rng, preferUnowned);
  if (preferUnowned) {
    const unowned = pool.filter(c => !state.cards[c.id]);
    if (unowned.length) return unowned[Math.floor(rng() * unowned.length)];
  }
  /* Le carte non possedute hanno doppio peso: la collezione si riempie,
     ma i doppioni restano possibili e alimentano il mercante. */
  const weighted = [];
  pool.forEach(c => {
    weighted.push(c);
    if (!state.cards[c.id]) weighted.push(c);
  });
  return weighted[Math.floor(rng() * weighted.length)];
}

function clampN(n, min, max) { return Math.max(min, Math.min(max, n)); }

export function promoteChestQueue(state) {
  let moved = false;
  while (state.chests.length < CFG.CHEST_SLOTS && state.chestQueue.length) {
    const next = state.chestQueue.shift();
    state.chests.push({ id: next.id || uid(), tier: next.tier, at: Date.now() });
    moved = true;
  }
  return moved;
}

export function grantChest(state, tierKey, reason) {
  const tier = CFG.CHEST_TIERS[tierKey];
  if (!tier) return { ok:false, msg:'Baule sconosciuto' };
  const entry = { id: uid(), tier: tierKey, at: Date.now() };
  let queued = false;
  if (state.chests.length < CFG.CHEST_SLOTS) {
    state.chests.push(entry);
  } else if (state.chestQueue.length < CFG.CHEST_QUEUE_MAX) {
    state.chestQueue.push({ id: entry.id, tier: tierKey });
    queued = true;
  } else {
    return { ok:false, msg:'Slot bauli pieni' };
  }
  if (reason) {
    addFeed(state, `🎁 ${tier.emoji} ${tier.name}${queued ? ' in coda' : ''} · ${reason}`, 'chest');
  }
  return { ok:true, chest: entry, queued };
}

/** Timer gratuito: si mette in pausa quando i 4 slot sono pieni. */
export function maintainChests(state, now) {
  now = now || Date.now();
  let changed = promoteChestQueue(state);

  if (state.chests.length >= CFG.CHEST_SLOTS) {
    if (state.chestPausedMs == null) {
      state.chestPausedMs = Math.max(0, (state.chestNextAt || now) - now);
      changed = true;
    }
    return changed;
  }

  if (state.chestPausedMs != null) {
    state.chestNextAt = now + state.chestPausedMs;
    state.chestPausedMs = null;
    changed = true;
  }
  if (!state.chestNextAt) {
    state.chestNextAt = now + CFG.CHEST_FREE_MS;
    changed = true;
  }

  let guard = 0;
  while (now >= state.chestNextAt && state.chests.length < CFG.CHEST_SLOTS && guard < CFG.CHEST_SLOTS) {
    state.chests.push({ id: uid(), tier: 'legno', at: state.chestNextAt });
    state.chestNextAt += CFG.CHEST_FREE_MS;
    guard++;
    changed = true;
  }
  if (state.chests.length >= CFG.CHEST_SLOTS) {
    state.chestPausedMs = Math.max(0, state.chestNextAt - now);
  }
  return changed;
}

export function chestStatus(state, now) {
  now = now || Date.now();
  const full = state.chests.length >= CFG.CHEST_SLOTS;
  const remaining = full && state.chestPausedMs != null
    ? state.chestPausedMs
    : Math.max(0, (state.chestNextAt || now) - now);
  return { full, remaining, interval: CFG.CHEST_FREE_MS };
}

export function openChest(state, chestId, rng) {
  rng = rng || Math.random;
  const idx = state.chests.findIndex(c => c.id === chestId);
  if (idx < 0) return { ok:false, msg:'Baule non trovato' };
  const chest = state.chests[idx];
  const tier = CFG.CHEST_TIERS[chest.tier];
  if (!tier) return { ok:false, msg:'Baule sconosciuto' };

  state.chests.splice(idx, 1);
  state.stats.chestsOpened = (state.stats.chestsOpened || 0) + 1;

  const sinceEpic = state.pity.epico || 0;
  const sinceLegend = state.pity.leggendario || 0;
  let rarity = rollRarity(tier.drops, rng);
  rarity = clampRarity(rarity, tier.minRarity);
  let pityHit = null;
  if (sinceLegend >= CFG.PITY.leggendario - 1) {
    rarity = 'leggendario';
    pityHit = 'leggendario';
  } else if (sinceEpic >= CFG.PITY.epico - 1 && rarityRank(rarity) < 2) {
    rarity = 'epico';
    pityHit = 'epico';
  }

  const card = pickCardForRarity(state, rarity, rng, false);
  const added = addCardToCollection(state, card.id);
  state.pity.leggendario = rarity === 'leggendario' ? 0 : sinceLegend + 1;
  state.pity.epico = rarityRank(rarity) >= 2 ? 0 : sinceEpic + 1;
  promoteChestQueue(state);
  maintainChests(state, Date.now());

  const owned = state.cards[card.id];
  addFeed(state, added.isNew
    ? `🃏 Nuova carta: ${card.name} (${tier.name})`
    : `🔁 Doppione: ${card.name} +1${added.levelUp ? ` · LIVELLO ${added.levelAfter}` : ''}`, 'card');
  checkQuests(state);
  checkAchievements(state);

  return {
    ok:true, source:'chest', chest, tier, rarity, pityHit,
    ...added, card, owned
  };
}

export function buyChest(state, tierKey) {
  const tier = CFG.CHEST_TIERS[tierKey];
  if (!tier) return { ok:false, msg:'Baule sconosciuto' };
  if (state.fc < tier.price) return { ok:false, msg:'Fondi insufficienti!' };
  const before = state.chests.length + state.chestQueue.length;
  const grant = grantChest(state, tierKey, '');
  if (!grant.ok) return grant;
  state.fc -= tier.price;
  state.stats.chestsBought = (state.stats.chestsBought || 0) + 1;
  if (before === 0) state.chestPausedMs = null;
  addFeed(state, `🛒 Acquistato ${tier.emoji} ${tier.name} per ${CFG.formatNum(tier.price)} FC`, 'chest');
  return { ok:true, chest: grant.chest, queued: grant.queued };
}

/* ------------------------------------------------------------- mercante */
function shuffled(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function pickMerchantGive(state, minRank, used, rng) {
  for (let rank = minRank; rank <= 3; rank++) {
    const rarity = CFG.RARITY_ORDER[rank];
    const pool = cardsOfRarity(rarity).filter(c => !used.has(c.id));
    if (!pool.length) continue;
    const unowned = pool.filter(c => !state.cards[c.id]);
    const pickFrom = unowned.length ? unowned : pool;
    return pickFrom[Math.floor(rng() * pickFrom.length)];
  }
  const fallback = CATALOG.filter(c => !used.has(c.id));
  return fallback[Math.floor(rng() * fallback.length)] || CATALOG[0];
}

export function hasDuplicates(state) {
  return Object.keys(state.cards || {}).some(id => getCard(id) && duplicatesOf(state, id) > 0);
}

export function generateMerchant(state, rng) {
  rng = rng || Math.random;
  const now = Date.now();
  const teams = shuffled(CFG.TEAMS_AI, rng);
  const budget = {};
  Object.keys(state.cards || {}).forEach(id => {
    const dup = Math.min(3, duplicatesOf(state, id));
    if (dup > 0) budget[id] = dup;
  });
  const ids = Object.keys(budget).filter(id => getCard(id));
  const offers = [];
  const usedGive = new Set();

  if (!ids.length) {
    const give = pickMerchantGive(state, 0, usedGive, rng);
    const team = teams[0];
    offers.push({
      id: uid(), recovery: true, teamId: team.id, teamName: team.name,
      teamEmoji: team.emoji, teamColor: team.color,
      nick: CFG.NICKNAMES[Math.floor(rng() * CFG.NICKNAMES.length)],
      status: CFG.MERCHANT_STATUS[Math.floor(rng() * CFG.MERCHANT_STATUS.length)],
      wantId: null, wantQty: 0, giveId: give.id, cost: CFG.MERCHANT.recoveryCost
    });
  } else {
    let guard = 0;
    while (offers.length < CFG.MERCHANT.offers && guard < 12) {
      guard++;
      const available = ids.filter(id => budget[id] > 0);
      if (!available.length) break;
      const wantId = available[Math.floor(rng() * available.length)];
      const qty = Math.max(1, Math.min(budget[wantId], 1 + Math.floor(rng() * 3)));
      budget[wantId] -= qty;
      const wantCard = getCard(wantId);
      const bump = offers.length === 0 || rng() < 0.35 ? 1 : 0;
      const targetRank = clampN(rarityRank(wantCard.rarity) + bump, 0, 3);
      const blocked = new Set(usedGive);
      blocked.add(wantId);
      const give = pickMerchantGive(state, targetRank, blocked, rng);
      usedGive.add(give.id);
      const team = teams[offers.length % teams.length];
      offers.push({
        id: uid(), recovery: false, teamId: team.id, teamName: team.name,
        teamEmoji: team.emoji, teamColor: team.color,
        nick: CFG.NICKNAMES[Math.floor(rng() * CFG.NICKNAMES.length)],
        status: CFG.MERCHANT_STATUS[Math.floor(rng() * CFG.MERCHANT_STATUS.length)],
        wantId, wantQty: qty, giveId: give.id, cost: 0
      });
    }
  }

  state.merchant = {
    offers,
    generatedAt: now,
    nextAt: now + CFG.MERCHANT.rotateMs,
    recoveryOnly: offers.length > 0 && offers.every(o => o.recovery)
  };
  return state.merchant;
}

export function ensureMerchant(state, now) {
  now = now || Date.now();
  const m = state.merchant;
  const expired = !m || !Array.isArray(m.offers) || !m.offers.length || !m.nextAt || now >= m.nextAt;
  const needsUpgrade = m && m.recoveryOnly && hasDuplicates(state);
  if (expired || needsUpgrade) {
    generateMerchant(state);
    return true;
  }
  return false;
}

export function rerollMerchant(state) {
  if (state.fc < CFG.MERCHANT.rerollCost) return { ok:false, msg:'Servono ' + CFG.MERCHANT.rerollCost + ' FC' };
  state.fc -= CFG.MERCHANT.rerollCost;
  generateMerchant(state);
  addFeed(state, `🔄 Mercante rimescolato per ${CFG.MERCHANT.rerollCost} FC`, 'trade');
  return { ok:true, merchant: state.merchant };
}

function recordTrade(state, entry) {
  state.tradeHistory = state.tradeHistory || [];
  state.tradeHistory.unshift(Object.assign({ at: Date.now() }, entry));
  if (state.tradeHistory.length > CFG.MERCHANT.historyMax) state.tradeHistory.length = CFG.MERCHANT.historyMax;
}

export function tradeMerchant(state, offerId) {
  const m = state.merchant;
  const offer = m && m.offers.find(o => o.id === offerId);
  if (!offer) return { ok:false, msg:'Offerta scaduta' };

  if (offer.recovery) {
    if (state.fc < offer.cost) return { ok:false, msg:'Servono ' + offer.cost + ' FC' };
    const got = addCardToCollection(state, offer.giveId);
    if (!got.ok) return got;
    state.fc -= offer.cost;
    state.stats.trades = (state.stats.trades || 0) + 1;
    recordTrade(state, { type:'recovery', team:offer.teamName, teamEmoji:offer.teamEmoji,
      gotId:offer.giveId, gotName:got.card.name, cost:offer.cost });
    addFeed(state, `🤝 ${offer.teamName}: riscatto ${got.card.name} per ${offer.cost} FC`, 'trade');
    generateMerchant(state);
    checkQuests(state);
    checkAchievements(state);
    return { ok:true, source:'trade', team:offer.teamName, teamEmoji:offer.teamEmoji,
      cost:offer.cost, gave:null, wantQty:0, ...got };
  }

  const want = getCard(offer.wantId);
  const owned = state.cards[offer.wantId];
  if (!want || !owned) return { ok:false, msg:'Carta non più disponibile' };
  if (duplicatesOf(state, offer.wantId) < offer.wantQty) {
    return { ok:false, msg:'Ti servono ' + offer.wantQty + ' doppioni' };
  }

  owned.copies -= offer.wantQty;
  const got = addCardToCollection(state, offer.giveId);
  if (!got.ok) {
    owned.copies += offer.wantQty;
    return got;
  }
  state.stats.trades = (state.stats.trades || 0) + 1;
  recordTrade(state, {
    type:'trade', team:offer.teamName, teamEmoji:offer.teamEmoji,
    gaveId:want.id, gaveName:want.name, gaveQty:offer.wantQty,
    gotId:got.card.id, gotName:got.card.name, gotRarity:got.card.rarity
  });
  addFeed(state, `🤝 ${offer.teamName}: ${offer.wantQty}× ${want.name} → ${got.card.name}`, 'trade');
  generateMerchant(state);
  checkQuests(state);
  checkAchievements(state);
  return {
    ok:true, source:'trade', team:offer.teamName, teamEmoji:offer.teamEmoji,
    gave:want, wantQty:offer.wantQty, cost:0, ...got
  };
}

/* ----------------------------------------------------------------- helpers */
function totalFor(stat, type) {
  return (state) => {
    let v = 0;
    CFG.UPGRADES.forEach(u => {
      if (u.effect.type !== type || u.effect.stat !== stat) return;
      const lvl = state.upgrades[u.id] || 0;
      v += type === 'mult' ? u.effect.pct * lvl : u.effect.val * lvl;
    });
    return v;
  };
}
const multFC = totalFor('fcPerSec', 'mult');
const flatFC = totalFor('fcPerSec', 'flat');
const flatVoto = totalFor('votoBonus', 'flat');
const multVoto = totalFor('votoBonus', 'mult');
const multAway = totalFor('awayBonus', 'mult');
const chanceFree = totalFor('freePlayer', 'chance');

export function calcFCPerSec(state) {
  let base = 0;
  state.players.forEach(p => { if (p.titolare && p.infortunio <= 0) base += p.quotazione * 0.5; });
  return (base + flatFC(state)) * (1 + multFC(state)) * Math.pow(1.25, state.scudettiDoro);
}

export function getUpgradeCost(state, id) {
  const u = CFG.UPGRADES.find(x => x.id === id);
  if (!u) return Infinity;
  const lvl = state.upgrades[id] || 0;
  if (lvl >= u.maxLevel) return Infinity;
  return Math.floor(u.baseCost * Math.pow(u.costMul, lvl));
}

export function getVotoBonus(state) { return flatVoto(state) * (1 + multVoto(state)); }
export function getAwayBonus(state) { return multAway(state); }

export function simVoto(state, player, home = true) {
  let base = player.skill + getVotoBonus(state);
  if (!home) base *= 1 + getAwayBonus(state);
  if (player.infortunio > 0) base *= 0.5;
  const voto = Math.round((base + (Math.random() - 0.5) * 4) * 10) / 10;
  return Math.max(4, Math.min(10, voto));
}

/* ------------------------------------------------------------------- events */
export function addFeed(state, msg, type = 'info') {
  state.feed.unshift({ id: uid(), msg, type, at: Date.now() });
  if (state.feed.length > 120) state.feed.length = 120;
}

export function checkQuests(state) {
  const done = [];
  CFG.QUESTS.forEach(q => {
    if (state.quests[q.id]) return;
    if ((state.stats[q.stat] || 0) >= q.target) {
      state.quests[q.id] = true;
      state.fc += q.reward;
      state.totalFc += q.reward;
      addFeed(state, `🎯 Obiettivo completato: ${q.name} → +${q.reward} FC`, 'quest');
      done.push(q);
    }
  });
  return done;
}

export function checkAchievements(state) {
  const got = [];
  const unlock = (id, cond) => {
    if (cond && !state.achievements.includes(id)) { state.achievements.push(id); got.push(id); }
  };
  unlock('first_goal', state.stats.goals >= 1);
  unlock('bidone', state.achievements.includes('bidone'));
  unlock('prestige', state.scudettiDoro >= 1);
  unlock('rich', state.totalFc >= 10000);
  unlock('quests', Object.keys(state.quests).length >= 3);
  unlock('chest10', (state.stats.chestsOpened || 0) >= 10);
  unlock('collector', Object.keys(state.cards || {}).length >= 20);
  unlock('legend', Object.keys(state.cards || {}).some(id => (getCard(id) || {}).rarity === 'leggendario'));
  unlock('trader', (state.stats.trades || 0) >= 5);
  unlock('card_max', (state.stats.level5 || 0) >= 1);
  return got;
}

/* --------------------------------------------------------------------- tap */
export function tapMister(state) {
  const now = Date.now();
  const window = 1200;
  state.tapCombo = (now - state.lastTap < window) ? state.tapCombo + 1 : 1;
  state.lastTap = now;
  const gain = 1 + Math.min(50, state.tapCombo) * 0.6 + state.scudettiDoro;
  state.fc += gain;
  state.totalFc += gain;
  state.stats.taps++;
  return { gain, combo: state.tapCombo };
}

/* ----------------------------------------------------------------- mercato */
export function generateMercato(state) {
  const list = [];
  const n = 5 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const weights = [['P',0.12],['D',0.30],['C',0.35],['A',0.23]];
    let r = Math.random(), acc = 0, role = 'C';
    for (const [k, w] of weights) { acc += w; if (r < acc) { role = k; break; } }
    const skill = 1 + Math.random() * 8;
    const quot = Math.max(1, Math.floor(skill * 1.2));
    const costanza = 0.3 + Math.random() * 0.7;
    list.push({
      id: uid(), name: CFG.generatePlayerName(), role, quotazione: quot, skill,
      costanza, revealed: false,
      cost: Math.floor(quot * quot * 100 * (0.8 + Math.random() * 0.4)),
      isBidone: costanza < 0.35
    });
  }
  state.mercato = list;
  revealBidoni(state);
  return list;
}

export function revealBidoni(state) {
  const lvl = state.upgrades.osservatore || 0;
  if (!lvl) { state.mercato.forEach(p => { p.revealed = false; }); return; }
  state.mercato.forEach(p => { p.revealed = lvl >= 3 || Math.random() < lvl * 0.3; });
}

export function buyPlayer(state, id) {
  const idx = state.mercato.findIndex(p => p.id === id);
  if (idx < 0) return { ok:false, msg:'Giocatore non trovato' };
  const p = state.mercato[idx];
  if (state.fc < p.cost) return { ok:false, msg:'Fondi insufficienti!' };
  if (state.players.length >= 26) return { ok:false, msg:'Rosa al completo' };

  let worstIdx = -1, worstSkill = Infinity;
  state.players.forEach((pl, i) => {
    if (pl.titolare && pl.role === p.role && pl.skill < worstSkill) { worstSkill = pl.skill; worstIdx = i; }
  });
  if (worstIdx < 0) worstIdx = state.players.findIndex(pl => pl.role === p.role && !pl.titolare);
  if (worstIdx < 0) return { ok:false, msg:'Nessun sostituto disponibile' };

  state.fc -= p.cost;
  const old = state.players[worstIdx];
  state.players[worstIdx] = initPlayer(p.role, p.name, p.quotazione, p.skill);
  state.mercato.splice(idx, 1);
  state.stats.buys++;
  const comment = CFG.pickRandom(CFG.BIDONE_COMMENTS);
  addFeed(state, `🛒 Acquistato ${p.name} per ${CFG.formatNum(p.cost)} FC. ${comment}`, 'buy');
  if (p.isBidone && !state.achievements.includes('bidone')) state.achievements.push('bidone');
  checkQuests(state);
  return { ok:true, player:p, replaced:old, comment, free:false };
}

export function upgrade(state, id) {
  const u = CFG.UPGRADES.find(x => x.id === id);
  if (!u) return { ok:false, msg:'Struttura sconosciuta' };
  const cost = getUpgradeCost(state, id);
  if (!isFinite(cost)) return { ok:false, msg:'Livello massimo' };
  if (state.fc < cost) return { ok:false, msg:'Fondi insufficienti!' };
  state.fc -= cost;
  state.upgrades[id] = (state.upgrades[id] || 0) + 1;
  state.stats.upgrades++;
  if (u.effect.type === 'reveal') revealBidoni(state);
  addFeed(state, `🏗️ ${u.name} potenziata al livello ${state.upgrades[id]}`, 'upgrade');
  checkQuests(state);
  return { ok:true, level:state.upgrades[id], cost };
}

export function doPrestige(state) {
  if (state.scudetti < 1) return { ok:false, msg:'Serve almeno uno scudetto' };
  state.scudettiDoro++;
  const keep = state.scudettiDoro;
  const fresh = createInitialState();
  fresh.scudettiDoro = keep;
  fresh.stats = Object.assign({}, state.stats, { prestiges: state.stats.prestiges + 1 });
  fresh.achievements = state.achievements.slice();
  fresh.quests = {};
  fresh.settings = Object.assign({}, state.settings);
  /* La collezione è permanente: bauli, carte e mercante sopravvivono. */
  fresh.cards = Object.assign({}, state.cards || {});
  STARTER_CARD_IDS.forEach(id => {
    if (!fresh.cards[id]) fresh.cards[id] = { copies: 1, found: 1 };
  });
  fresh.chests = (state.chests || []).slice();
  fresh.chestQueue = (state.chestQueue || []).slice();
  fresh.chestNextAt = state.chestNextAt || Date.now() + CFG.CHEST_FREE_MS;
  fresh.chestPausedMs = state.chestPausedMs != null ? state.chestPausedMs : null;
  fresh.pity = Object.assign({ epico: 0, leggendario: 0 }, state.pity || {});
  fresh.tradeHistory = (state.tradeHistory || []).slice();
  fresh.merchant = null;
  syncAllRosterCards(fresh);
  recomputeCollectionStats(fresh);
  grantChest(fresh, 'diamante', 'prestigio: nuova stagione');
  addFeed(fresh, `🏆 Nuova stagione! Scudetto d’oro #${keep}: +25% income permanente`, 'prestige');
  return { ok:true, state:fresh };
}

/* ---------------------------------------------------------------- giornata */
function teamStrengthAI(team, giornata) {
  return team.skill * (0.85 + Math.random() * 0.45) + Math.sin(giornata * 0.7 + team.skill) * 0.25;
}

export function runGiornata(state) {
  state.giornata++;
  const events = [];
  const commentary = [];
  const titolari = state.players.filter(p => p.titolare);

  const voti = titolari.map(p => ({ player:p, voto:simVoto(state, p) }));
  voti.forEach(v => {
    v.player.votoStorico.push(v.voto);
    if (v.player.votoStorico.length > 10) v.player.votoStorico.shift();
    if (v.player.infortunio > 0) v.player.infortunio--;
  });

  const media = voti.reduce((a, b) => a + b.voto, 0) / Math.max(1, voti.length);
  const opp = CFG.pickRandom(CFG.TEAMS_AI);
  const myForza = media + state.scudettiDoro * 0.3;
  const aiForza = teamStrengthAI(opp, state.giornata);
  const goalsUs = Math.max(0, Math.round((myForza - aiForza + 3.2) / 1.6 + (Math.random() - 0.5) * 1.4));
  const goalsAi = Math.max(0, Math.round((aiForza - myForza + 3.2) / 1.6 + (Math.random() - 0.5) * 1.4));

  const fpGain = Math.round(media * 8 + goalsUs * 25 - goalsAi * 6);
  state.fp += Math.max(1, fpGain);
  state.totalFp += Math.max(1, fpGain);

  const win = goalsUs > goalsAi;
  if (win) {
    state.stats.wins++;
    grantChest(state, 'argento', `vittoria contro ${opp.name}`);
    if (state.stats.wins % 5 === 0) grantChest(state, 'oro', '5 vittorie in stagione');
  }
  state.scudetti += win ? 1 : 0;

  const scorers = voti.filter(v => v.voto >= 7).map(v => v.player);
  for (let i = 0; i < goalsUs; i++) {
    const scorer = scorers.length ? CFG.pickRandom(scorers) : CFG.pickRandom(titolari);
    if (!scorer) break;
    state.stats.goals++;
    const msg = CFG.pickRandom(CFG.EVENT_TEMPLATES.goal).replace('{name}', scorer.name);
    events.push({ type:'goal', minute: 12 + Math.floor(Math.random() * 75), msg, team:'us' });
    commentary.push(msg);
  }
  for (let i = 0; i < goalsAi; i++) {
    events.push({ type:'goal', minute: 10 + Math.floor(Math.random() * 78),
      msg:`⚽ ${opp.name} segna. Il portiere era distratto.`, team:'ai' });
  }

  if (Math.random() < 0.35) {
    const p = CFG.pickRandom(titolari);
    if (p) {
      const msg = CFG.pickRandom(CFG.EVENT_TEMPLATES.yellow).replace('{name}', p.name);
      events.push({ type:'yellow', minute: 20 + Math.floor(Math.random() * 65), msg });
    }
  }
  if (Math.random() < 0.09) {
    const p = CFG.pickRandom(titolari);
    if (p) {
      p.infortunio = 2;
      const msg = CFG.pickRandom(CFG.EVENT_TEMPLATES.injury).replace('{name}', p.name);
      events.push({ type:'injury', minute: 30 + Math.floor(Math.random() * 55), msg });
      commentary.push(msg);
    }
  }
  if (Math.random() < 0.25) {
    events.push({ type:'random', minute: 15 + Math.floor(Math.random() * 70), msg:CFG.pickRandom(CFG.EVENT_TEMPLATES.random) });
  }
  events.sort((a, b) => a.minute - b.minute);

  // classifica
  state.classifica[0].fp = state.fp;
  state.classifica[0].form.unshift(win ? 'W' : goalsUs === goalsAi ? 'D' : 'L');
  state.classifica[0].form = state.classifica[0].form.slice(0, 5);
  state.classifica.forEach(t => {
    if (t.id === 'user') return;
    t.fp = Math.round(t.fp + 120 + Math.random() * 260 + t.fp * 0.02);
    t.form = t.form || [];
    t.form.unshift(Math.random() < 0.5 ? 'W' : 'L');
    t.form = t.form.slice(0, 5);
  });

  addFeed(state, `📣 Giornata #${state.giornata}: La Mia Squadra ${goalsUs}-${goalsAi} ${opp.name} · +${Math.max(1, fpGain)} FP`,
    win ? 'win' : 'match');

  const quests = checkQuests(state);
  const achievements = checkAchievements(state);

  return {
    giornata: state.giornata, goalsUs, goalsAi, opponent:opp, fpGain:Math.max(1, fpGain),
    win, media:Math.round(media * 10) / 10, events, commentary,
    voti, quests, achievements,
    match: { us:goalsUs, ai:goalsAi, opponent:opp, events, duration:13000 }
  };
}

export function offlineGiornate(state, n) {
  const reports = [];
  for (let i = 0; i < n; i++) reports.push(runGiornata(state));
  return reports;
}

export function randomNews(state) {
  if (Math.random() < 0.12) addFeed(state, CFG.pickRandom(CFG.FANTANOTIZIE), 'news');
}

export function randomCoach(state) {
  if (Math.random() < 0.08) addFeed(state, CFG.pickRandom(CFG.COACH_REACTIONS), 'coach');
}
