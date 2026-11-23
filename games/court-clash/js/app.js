/* Court Clash — app controller */

import { TEAMS } from './data/teams.js';
import { enrichTeams } from './data/player-profile.js';
import { seasonAverage } from './data/player-stats.js';
import { simulateGame } from './sim/engine.js';
import { seededRandom } from './core/rng.js';
import { I18n } from './i18n.js';
import { load, save, reset, todayKey, recordHistory } from './core/storage.js';
import { Sfx } from './audio.js';
import {
  STAKE_OPTIONS, winOdds, payout, chestTierForWin, collectionBoost,
  boostTeam, claimDaily, claimComeback, formatCoins
} from './game/economy.js';
import {
  buildCardIndex, cardPower, copiesNeeded, coinsNeeded,
  addCard, upgradeCard, collectionPower, setProgress, claimSetRewards,
  SETS, SET_REWARDS, RARITIES, MAX_LEVEL
} from './game/collection.js';
import {
  addChest, startNextChest, isReady, timeLeft, speedUpCost, speedUpChest,
  openChest, chestRewards, chestInfo, formatTime, slotStatus,
  CHEST_LIMIT, PITY_LIMIT
} from './game/chests.js';
import { openChestModal } from './ui/chest-opening.js';
import { miniAvatarUrl } from './render/mini-avatar.js';

const $ = id => document.getElementById(id);
const i18n = new I18n();
const sfx = new Sfx();

const state = {
  data: load(),
  teams: [],
  teamMap: {},
  cards: [],
  cardIndex: {},
  screen: 'play',
  matchup: null,
  selectedSide: null,
  stake: 50,
  cardLimit: 36,
  openCardId: null,
  lastResult: null,
  lastFocus: null,
  toastTimer: null
};

const CHEST_ICON = { wood: '📦', silver: '🧰', gold: '🎁', legendary: '👑' };

function teamByCode(code) {
  return state.teamMap[code];
}

function buildTeams() {
  state.teams = enrichTeams(TEAMS.map(team => JSON.parse(JSON.stringify(team))));
  state.teamMap = Object.fromEntries(state.teams.map(team => [team.code, team]));
  state.cards = buildCardIndex(state.teams);
  state.cardIndex = Object.fromEntries(state.cards.map(card => [card.id, card]));
}

function teamOvr(team) {
  if (!team || !team.players.length) return 0;
  return Math.round(team.players.reduce((sum, p) => sum + p.ovr, 0) / team.players.length);
}

function currentPower() {
  return collectionPower(state.data.collection, state.cardIndex);
}

function currentBoost() {
  return collectionBoost(currentPower());
}

function toast(text) {
  const el = $('toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

function openModal(id) {
  const modal = $(id);
  if (!modal) return;
  state.lastFocus = document.activeElement;
  modal.hidden = false;
  const focusable = modal.querySelector('button, select, input, [tabindex]:not([tabindex="-1"])');
  if (focusable) setTimeout(() => focusable.focus(), 30);
}

function closeModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.hidden = true;
  if (state.lastFocus && typeof state.lastFocus.focus === 'function') state.lastFocus.focus();
  state.lastFocus = null;
}

function chestName(type) {
  return i18n.t('chest' + type.charAt(0).toUpperCase() + type.slice(1));
}

function setScreen(name, updateHash = true) {
  const valid = ['play', 'chests', 'cards'];
  const screen = valid.includes(name) ? name : 'play';
  state.screen = screen;
  document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.id === 'screen-' + screen));
  document.querySelectorAll('.tabbar [data-screen]').forEach(el => el.classList.toggle('active', el.dataset.screen === screen));
  if (updateHash && location.hash !== '#' + screen) location.hash = screen;
  if (screen === 'play') renderPlay();
  else if (screen === 'chests') renderChests();
  else renderCards();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function newMatchup() {
  if (!state.teams.length) return;
  const home = state.teams[Math.floor(Math.random() * state.teams.length)];
  let away = state.teams[Math.floor(Math.random() * state.teams.length)];
  let guard = 0;
  while (away.code === home.code && guard < 20) {
    away = state.teams[Math.floor(Math.random() * state.teams.length)];
    guard += 1;
  }
  state.matchup = {
    home: home.code,
    away: away.code,
    odds: winOdds(home, away)
  };
  state.selectedSide = null;
}

function initEconomy() {
  const daily = claimDaily(state.data.wallet, todayKey());
  if (daily) toast(i18n.t('dailyBonus', { amount: formatCoins(daily) }));
  const comeback = claimComeback(state.data.wallet, todayKey());
  if (comeback) toast(i18n.t('comebackBonus', { amount: formatCoins(comeback) }));
  const chests = state.data.chests;
  if (!chests.tutorialGiven && chests.opened === 0 && chests.slots.length === 0) {
    addChest(chests.slots, 'wood');
    chests.tutorialGiven = true;
  }
  startNextChest(chests.slots);
  save(state.data);
}

function renderHUD() {
  $('hudCoins').textContent = formatCoins(state.data.wallet.coins);
  $('hudPower').textContent = formatCoins(currentPower());
  $('hudBoost').textContent = '+' + currentBoost();
  $('hudStreak').textContent = String(state.data.streak || 0);
}

function renderPlay() {
  if (!state.matchup) newMatchup();
  if (!state.matchup) return;
  const home = teamByCode(state.matchup.home);
  const away = teamByCode(state.matchup.away);
  if (!home || !away) return;
  $('homeAbbr').textContent = home.abbr;
  $('awayAbbr').textContent = away.abbr;
  $('homeName').textContent = home.name;
  $('awayName').textContent = away.name;
  $('homeMeta').textContent = `${home.conference} · ${home.division} · OVR ${teamOvr(home)}`;
  $('awayMeta').textContent = `${away.conference} · ${away.division} · OVR ${teamOvr(away)}`;
  $('homeOdds').textContent = state.matchup.odds.home.odds.toFixed(2);
  $('awayOdds').textContent = state.matchup.odds.away.odds.toFixed(2);
  $('homeColor').style.background = home.color;
  $('awayColor').style.background = away.color;
  document.querySelectorAll('.team-pick').forEach(el => {
    el.classList.toggle('selected', el.dataset.side === state.selectedSide);
  });
  const boost = currentBoost();
  $('boostValue').textContent = '+' + boost;
  const boostBadge = $('matchBoost');
  if (state.selectedSide && boost) {
    boostBadge.hidden = false;
    boostBadge.textContent = `+${boost} BOOST`;
  } else {
    boostBadge.hidden = true;
  }
  if (state.selectedSide) {
    $('potential').textContent = formatCoins(payout(state.stake, state.matchup.odds[state.selectedSide].odds));
  } else {
    $('potential').textContent = '—';
  }
  document.querySelectorAll('[data-stake]').forEach(el => el.classList.toggle('active', Number(el.dataset.stake) === state.stake));
  $('record').textContent = `${state.data.wins || 0}W · ${state.data.losses || 0}L`;
  $('btnBet').disabled = !state.selectedSide;
  renderNextChest();
  renderRecent();
}

function renderNextChest() {
  const chest = state.data.chests.slots[0];
  if (!chest) {
    $('nextChestTitle').textContent = i18n.t('nextChestNone');
    $('nextChestEmoji').textContent = '📦';
    $('nextChestTimer').textContent = '—';
    $('nextChestHint').textContent = i18n.t('nextChestNoneHint');
    $('btnQuickOpen').hidden = true;
    return;
  }
  const status = slotStatus(chest);
  const name = chestName(chest.type);
  $('nextChestEmoji').textContent = CHEST_ICON[chest.type] || '📦';
  $('nextChestTitle').textContent = status === 'ready'
    ? i18n.t('nextChestReady')
    : status === 'queued'
      ? i18n.t('nextChestQueued')
      : i18n.t('nextChestUnlocking');
  if (status === 'ready') {
    $('nextChestTimer').textContent = name;
    $('nextChestHint').textContent = i18n.t('chestReady');
    $('btnQuickOpen').hidden = false;
  } else if (status === 'queued') {
    $('nextChestTimer').textContent = i18n.t('chestQueued');
    $('nextChestHint').textContent = name;
    $('btnQuickOpen').hidden = true;
  } else {
    $('nextChestTimer').textContent = formatTime(timeLeft(chest));
    $('nextChestHint').textContent = name;
    $('btnQuickOpen').hidden = true;
  }
}

function renderRecent() {
  const list = state.data.history.slice(0, 5);
  if (!list.length) {
    $('recentList').innerHTML = `<p class="empty-state">${i18n.t('noMatches')}</p>`;
    return;
  }
  $('recentList').innerHTML = list.map(row => `<div class="recent-row ${row.won ? 'win' : 'loss'}">
    <span class="recent-badge">${i18n.t(row.won ? 'historyWin' : 'historyLoss')}</span>
    <div class="recent-main">
      <b>${row.homeName || row.home} ${row.hs}–${row.as} ${row.awayName || row.away}</b>
      <small>${row.chest ? chestName(row.chest) : i18n.t(row.won ? 'noChestReward' : 'matchLoss')}</small>
    </div>
    <span class="recent-delta">${row.delta > 0 ? '+' : ''}${formatCoins(Math.abs(row.delta))}</span>
  </div>`).join('');
}

function renderChests() {
  startNextChest(state.data.chests.slots);
  const slots = state.data.chests.slots;
  const now = Date.now();
  $('chestSlots').innerHTML = Array.from({ length: CHEST_LIMIT }, (_, index) => {
    const chest = slots[index];
    if (!chest) {
      return `<div class="chest-slot empty">
        <div class="slot-art">＋</div>
        <b>${i18n.t('chestEmpty')}</b>
        <small>${index + 1}/${CHEST_LIMIT}</small>
      </div>`;
    }
    const info = chestInfo(chest.type);
    const status = slotStatus(chest, now);
    const timer = status === 'ready' ? i18n.t('chestReady') : status === 'queued' ? i18n.t('chestQueued') : formatTime(timeLeft(chest, now));
    let action = '';
    if (status === 'ready') {
      action = `<button class="btn small ready" type="button" data-open="${index}">${i18n.t('open')}</button>`;
    } else if (status === 'unlocking') {
      action = `<button class="btn small" type="button" data-speed="${index}">${i18n.t('speedUp')} · ${speedUpCost(chest, now)}</button>`;
    } else {
      action = `<span class="slot-note">${i18n.t('chestQueued')}</span>`;
    }
    return `<div class="chest-slot chest-${chest.type} status-${status}" style="--chest:${info.color};--chest-glow:${info.glow}">
      <div class="slot-art">${CHEST_ICON[chest.type]}</div>
      <b>${chestName(chest.type)}</b>
      <small>${timer}</small>
      ${action}
    </div>`;
  }).join('');
  renderPity();
}

function renderPity() {
  const pity = state.data.chests.pity || 0;
  $('pityCount').textContent = `${pity}/${PITY_LIMIT}`;
  $('pityFill').style.width = Math.min(100, (pity / PITY_LIMIT) * 100) + '%';
}

function cardTile(card) {
  const entry = state.data.collection[card.id];
  const owned = !!entry;
  const level = entry ? entry.level : 0;
  const power = owned ? cardPower(card, level) : card.ovr;
  const need = copiesNeeded(level || 1);
  const copies = entry ? entry.copies : 0;
  return `<button class="ccard ${owned ? 'owned' : 'locked'} rarity-${card.rarity}" type="button" data-card-id="${card.id}"
    style="--rarity:${RARITIES[card.rarity].color};--team:${card.teamColor}">
    <span class="ccard-ovr">${card.ovr}</span>
    ${owned ? `<span class="ccard-level">Lv${level}</span>` : `<span class="ccard-lock">🔒</span>`}
    ${entry && entry.isNew ? `<span class="ccard-new">${i18n.t('cardNew')}</span>` : ''}
    <img src="${miniAvatarUrl(card, { color: card.teamColor }, 112)}" alt="${card.name}" loading="lazy">
    <b>${card.name}</b>
    <small>${card.teamCode} · ${card.pos}</small>
    <span class="ccard-power">${power}</span>
    <span class="ccard-copies">${owned ? `${copies}/${level >= MAX_LEVEL ? '—' : need}` : '—'}</span>
  </button>`;
}

function filteredCards() {
  const search = $('cardSearch').value.trim().toLowerCase();
  const rarity = $('filterRarity').value;
  const set = $('filterSet').value;
  const team = $('filterTeam').value;
  const owned = $('filterOwned').value;
  const sort = $('sortCards').value;
  let list = state.cards.filter(card => {
    if (search && !card.name.toLowerCase().includes(search)) return false;
    if (rarity && card.rarity !== rarity) return false;
    if (set && card.set !== set) return false;
    if (team && card.teamCode !== team) return false;
    if (owned === 'owned' && !state.data.collection[card.id]) return false;
    return true;
  });
  list.sort((a, b) => {
    const ae = state.data.collection[a.id];
    const be = state.data.collection[b.id];
    if (!!ae !== !!be) return ae ? -1 : 1;
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'rarity') return RARITIES[b.rarity].rank - RARITIES[a.rarity].rank || b.ovr - a.ovr;
    const ap = ae ? cardPower(a, ae.level) : a.ovr;
    const bp = be ? cardPower(b, be.level) : b.ovr;
    return bp - ap || b.ovr - a.ovr;
  });
  return list;
}

function renderCards() {
  const owned = Object.keys(state.data.collection).length;
  const power = currentPower();
  const boost = currentBoost();
  $('collectionSummary').textContent = i18n.t('collectionSummary', {
    owned,
    total: state.cards.length,
    power: formatCoins(power),
    boost
  });
  $('collectionEmpty').hidden = owned > 0;
  const progress = setProgress(state.data.collection, state.cards);
  $('setProgress').innerHTML = Object.keys(SETS).map(key => {
    const p = progress[key];
    const label = i18n.t('set' + key.charAt(0).toUpperCase() + key.slice(1));
    const claimed = state.data.setsClaimed[key];
    return `<div class="set-row">
      <span>${label}</span>
      <i><b style="width:${Math.round(p.ratio * 100)}%"></b></i>
      <span>${p.owned}/${p.total}</span>
      <small>${claimed ? '✓' : '+' + SET_REWARDS[key]}</small>
    </div>`;
  }).join('');

  const list = filteredCards();
  const shown = list.slice(0, state.cardLimit);
  $('cardGrid').innerHTML = shown.map(cardTile).join('');
  $('cardEmpty').hidden = list.length > 0;
  $('btnMoreCards').hidden = shown.length >= list.length;
  $('cardEmpty').textContent = i18n.t('noCardsFilter');
}

function renderAll() {
  renderHUD();
  renderPlay();
  renderChests();
  renderCards();
}

function showPlayError(message) {
  const el = $('playError');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(showPlayError.timer);
  showPlayError.timer = setTimeout(() => { el.hidden = true; }, 3200);
}

function placeBet() {
  if (!state.matchup) { showPlayError(i18n.t('selectTeam')); return; }
  if (!state.selectedSide) { showPlayError(i18n.t('selectTeam')); return; }
  if (state.data.chests.slots.length >= CHEST_LIMIT) { showPlayError(i18n.t('slotsFull')); return; }
  if (state.data.wallet.coins < state.stake) {
    const comeback = claimComeback(state.data.wallet, todayKey());
    if (comeback) {
      toast(i18n.t('comebackBonus', { amount: formatCoins(comeback) }));
      save(state.data);
      renderHUD();
    }
  }
  if (state.data.wallet.coins < state.stake) { showPlayError(i18n.t('noCoins')); return; }

  sfx.init();
  const home = teamByCode(state.matchup.home);
  const away = teamByCode(state.matchup.away);
  const side = state.selectedSide;
  const odds = state.matchup.odds[side].odds;
  const boost = currentBoost();
  const boostedHome = side === 'home' ? boostTeam(home, boost) : home;
  const boostedAway = side === 'away' ? boostTeam(away, boost) : away;
  const rng = seededRandom((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
  const summary = simulateGame(boostedHome, boostedAway, { rng });
  const won = summary.winner === side;
  const stake = state.stake;
  const payoutAmount = won ? payout(stake, odds) : 0;
  const delta = won ? payoutAmount - stake : -stake;

  state.data.wallet.coins = Math.max(0, state.data.wallet.coins - stake + payoutAmount);
  state.data.wins = (state.data.wins || 0) + (won ? 1 : 0);
  state.data.losses = (state.data.losses || 0) + (won ? 0 : 1);
  state.data.streak = won ? (state.data.streak || 0) + 1 : 0;
  state.data.bestStreak = Math.max(state.data.bestStreak || 0, state.data.streak);

  let chestType = null;
  if (won) {
    chestType = chestTierForWin(stake, odds, state.data.streak);
    const added = addChest(state.data.chests.slots, chestType);
    if (added.ok) startNextChest(state.data.chests.slots);
    else chestType = null;
  }

  recordHistory(state.data, {
    home: home.code, away: away.code, homeName: home.name, awayName: away.name,
    hs: summary.score.home, as: summary.score.away, pick: side, won, stake, odds, delta, chest: chestType
  });
  state.lastResult = {
    summary, won, side, stake, odds, delta, chestType, boost,
    home, away,
    top: summary.players.slice().sort((a, b) => b.pts - a.pts)[0] || null
  };
  save(state.data);
  renderAll();
  showMatchModal();
  if (won) sfx.win();
  else sfx.buzzer();
}

function animateScore(el, final) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = String(final);
    return;
  }
  const start = performance.now();
  const duration = 650;
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = String(Math.round(final * t));
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = String(final);
  }
  requestAnimationFrame(frame);
}

function showMatchModal() {
  const result = state.lastResult;
  if (!result) return;
  const { summary, won, side, stake, delta, chestType, top } = result;
  $('matchHomeAbbr').textContent = result.home.abbr;
  $('matchAwayAbbr').textContent = result.away.abbr;
  $('matchHomeScore').textContent = '0';
  $('matchAwayScore').textContent = '0';
  $('matchTeams').textContent = `${result.home.name} vs ${result.away.name}${result.boost ? ` · Boost +${result.boost} ${side === 'home' ? result.home.abbr : result.away.abbr}` : ''}`;
  const banner = $('matchResultBanner');
  banner.className = 'result-banner ' + (won ? 'win' : 'loss');
  banner.innerHTML = `<b>${i18n.t(won ? 'matchWin' : 'matchLoss')}</b>
    <span>${i18n.t(won ? 'pickCorrect' : 'pickWrong')} · ${i18n.t(won ? 'coinsEarned' : 'coinsLost')}: ${delta > 0 ? '+' : ''}${formatCoins(Math.abs(delta))}</span>`;
  $('matchQuarters').innerHTML = summary.quarters.map((q, i) => `<span>Q${i + 1}<b>${q.home}–${q.away}</b></span>`).join('');
  $('matchTop').innerHTML = top ? `<small>${i18n.t('topPerformer')}</small><b>${top.name}</b><span>${top.pts} PTS · ${(top.orb || 0) + (top.drb || 0)} REB · ${top.ast || 0} AST</span>` : '';
  const reward = $('matchReward');
  reward.className = 'match-reward ' + (won && chestType ? 'win' : won ? 'win' : 'loss');
  reward.innerHTML = won && chestType
    ? `<span class="reward-chest">${CHEST_ICON[chestType]}</span><div><b>${chestName(chestType)}</b><small>${i18n.t('chestWon')}</small></div>`
    : `<span class="reward-chest">${won ? '🪙' : '💥'}</span><div><b>${i18n.t('matchReward')}</b><small>${won ? i18n.t('noChestReward') : i18n.t('coinsLost')}</small></div>`;
  animateScore($('matchHomeScore'), summary.score.home);
  animateScore($('matchAwayScore'), summary.score.away);
  openModal('matchModal');
}

function closeMatchModal(fresh = true) {
  closeModal('matchModal');
  if (fresh) {
    newMatchup();
    renderPlay();
  }
}

function openChestFlow() {
  const slots = state.data.chests.slots;
  const chest = slots[0];
  if (!chest) { toast(i18n.t('nextChestNone')); return; }
  if (!isReady(chest)) { toast(i18n.t('nextChestUnlocking')); return; }
  sfx.init();
  const tier = chest.type;
  const rewards = chestRewards(tier, state.cards, state.data.collection, state.data.chests.pity || 0, seededRandom((Date.now() ^ 0x9e3779b9) >>> 0));
  const opened = openChest(slots);
  if (!opened.ok) return;

  let overflowCoins = 0;
  const displayCards = rewards.cards.map(card => {
    const result = addCard(state.data.collection, card.id);
    const entry = state.data.collection[card.id];
    if (result.status === 'max') overflowCoins += result.coins || 0;
    return {
      ...card,
      isNew: result.status === 'new',
      level: entry ? entry.level : 1,
      overflow: result.status === 'max' ? result.coins : 0,
      rarityColor: RARITIES[card.rarity] ? RARITIES[card.rarity].color : '#4de8ff'
    };
  });
  const setReward = claimSetRewards(state.data.collection, state.cards, state.data.setsClaimed);
  const totalCoins = rewards.coins + overflowCoins + setReward.coins;
  state.data.wallet.coins += totalCoins;
  state.data.chests.pity = rewards.pity;
  state.data.chests.opened = (state.data.chests.opened || 0) + 1;
  save(state.data);
  renderAll();
  if (setReward.coins) toast(i18n.t('setComplete', { coins: formatCoins(setReward.coins) }));

  openChestModal({
    tier,
    cards: displayCards,
    coins: totalCoins,
    sfx,
    i18n,
    onDone: () => {
      renderAll();
      save(state.data);
    }
  });
}

function speedUpSlot() {
  const result = speedUpChest(state.data.chests.slots, state.data.wallet.coins);
  if (!result.ok) { toast(i18n.t('noCoins')); return; }
  state.data.wallet.coins = result.coins;
  save(state.data);
  renderAll();
  if (result.cost) toast(`-${formatCoins(result.cost)} 🪙`);
}

function openCardModal(id) {
  const card = state.cardIndex[id];
  if (!card) return;
  const entry = state.data.collection[id];
  if (entry && entry.isNew) {
    entry.isNew = false;
    save(state.data);
    renderCards();
  }
  state.openCardId = id;
  $('cardModal').style.setProperty('--rarity', RARITIES[card.rarity].color);
  $('detailImg').src = miniAvatarUrl(card, { color: card.teamColor }, 200);
  $('detailImg').alt = card.name;
  $('detailRarity').className = 'rarity-pill rarity-' + card.rarity;
  $('detailRarity').textContent = i18n.t(card.rarity);
  $('detailRarity').style.color = RARITIES[card.rarity].color;
  $('detailName').textContent = card.name;
  $('detailTeam').textContent = `${card.teamName} · ${card.pos} · ${card.age}`;
  const level = entry ? entry.level : 0;
  const power = entry ? cardPower(card, level) : card.ovr;
  $('detailOvr').textContent = String(card.ovr);
  $('detailLevel').textContent = entry ? String(level) : '—';
  $('detailPower').textContent = String(power);
  $('detailCopies').textContent = entry ? `${entry.copies}/${level >= MAX_LEVEL ? '—' : copiesNeeded(level)}` : '—';

  const avg = seasonAverage(card);
  $('detailAverages').innerHTML = [
    ['statPts', avg.pts], ['statReb', avg.reb], ['statAst', avg.ast]
  ].map(([key, value]) => `<span class="stat-chip">${i18n.t(key)} <b>${value}</b></span>`).join('');

  const btn = $('btnUpgradeCard');
  if (!entry) {
    $('detailHint').textContent = i18n.t('cardNotOwned');
    btn.disabled = true;
    btn.textContent = i18n.t('locked');
  } else if (level >= MAX_LEVEL) {
    $('detailHint').textContent = i18n.t('maxLevel');
    btn.disabled = true;
    btn.textContent = i18n.t('maxed');
  } else {
    const needCopies = copiesNeeded(level);
    const needCoins = coinsNeeded(level);
    const enoughCopies = entry.copies >= needCopies;
    const enoughCoins = state.data.wallet.coins >= needCoins;
    $('detailHint').textContent = `${i18n.t('copiesProgress', { have: entry.copies, need: needCopies })} · ${i18n.t('upgradeCost', { copies: needCopies, coins: formatCoins(needCoins) })}`;
    btn.disabled = !(enoughCopies && enoughCoins);
    btn.textContent = !enoughCopies
      ? i18n.t('needCopies', { need: needCopies })
      : !enoughCoins
        ? i18n.t('needCoins', { need: formatCoins(needCoins) })
        : i18n.t('upgrade');
  }
  openModal('cardModal');
}

function upgradeOpenCard() {
  if (!state.openCardId) return;
  const id = state.openCardId;
  const result = upgradeCard(state.data.collection, id, state.data.wallet.coins);
  if (!result.ok) {
    toast(result.reason === 'max' ? i18n.t('maxLevel') : i18n.t('cardUpgradeError'));
    return;
  }
  state.data.wallet.coins = result.coins;
  save(state.data);
  sfx.init();
  sfx.chest('click');
  renderAll();
  openCardModal(id);
  toast(i18n.t('cardUpgradeSuccess', { level: result.level }));
}

function populateFilters() {
  const teamFilter = $('filterTeam');
  const current = teamFilter.value;
  teamFilter.innerHTML = `<option value="">${i18n.t('allTeams')}</option>` +
    state.teams.map(team => `<option value="${team.code}">${team.name}</option>`).join('');
  teamFilter.value = current;
}

function updateSettings() {
  const settings = state.data.settings;
  $('settingsLang').value = i18n.lang;
  $('settingsSound').checked = settings.sound !== false;
  sfx.muted = settings.sound === false;
}

function applyLanguage() {
  i18n.apply();
  populateFilters();
  updateSettings();
  renderAll();
}

function bind() {
  document.querySelectorAll('.tabbar [data-screen]').forEach(btn => {
    btn.addEventListener('click', () => setScreen(btn.dataset.screen));
  });
  document.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => setScreen(btn.dataset.go));
  });
  document.querySelectorAll('.team-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedSide = btn.dataset.side;
      sfx.init();
      sfx.tone(420, 0.06, 'sine', 0.03);
      renderPlay();
    });
  });
  document.querySelectorAll('[data-stake]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.stake = Number(btn.dataset.stake) || STAKE_OPTIONS[0];
      renderPlay();
    });
  });
  $('btnShuffle').addEventListener('click', () => {
    newMatchup();
    renderPlay();
  });
  $('btnBet').addEventListener('click', placeBet);
  $('btnQuickOpen').addEventListener('click', openChestFlow);
  $('chestSlots').addEventListener('click', event => {
    const open = event.target.closest('[data-open]');
    if (open) { openChestFlow(); return; }
    const speed = event.target.closest('[data-speed]');
    if (speed) speedUpSlot();
  });
  ['cardSearch', 'filterRarity', 'filterSet', 'filterTeam', 'filterOwned', 'sortCards'].forEach(id => {
    const el = $(id);
    if (!el) return;
    const event = el.tagName === 'INPUT' ? 'input' : 'change';
    el.addEventListener(event, () => {
      state.cardLimit = 36;
      renderCards();
    });
  });
  $('btnMoreCards').addEventListener('click', () => {
    state.cardLimit += 36;
    renderCards();
  });
  $('cardGrid').addEventListener('click', event => {
    const btn = event.target.closest('[data-card-id]');
    if (btn) openCardModal(btn.dataset.cardId);
  });

  $('btnMatchClose').addEventListener('click', () => closeMatchModal(true));
  $('btnMatchAgain').addEventListener('click', () => closeMatchModal(true));
  $('btnMatchChests').addEventListener('click', () => {
    closeMatchModal(true);
    setScreen('chests');
  });
  $('btnCardClose').addEventListener('click', () => closeModal('cardModal'));
  $('btnUpgradeCard').addEventListener('click', upgradeOpenCard);

  $('btnHelp').addEventListener('click', () => openModal('helpModal'));
  $('btnHelpClose').addEventListener('click', () => closeModal('helpModal'));
  $('btnSettings').addEventListener('click', () => openModal('settingsModal'));
  $('btnSettingsClose').addEventListener('click', () => closeModal('settingsModal'));
  $('btnStart').addEventListener('click', () => {
    state.data.settings.onboarded = true;
    save(state.data);
    closeModal('onboardingModal');
  });
  $('settingsLang').addEventListener('change', event => {
    i18n.setLang(event.target.value);
    state.data.settings.lang = i18n.lang;
    save(state.data);
    applyLanguage();
  });
  $('settingsSound').addEventListener('change', event => {
    state.data.settings.sound = event.target.checked;
    sfx.muted = !event.target.checked;
    if (event.target.checked) sfx.init();
    save(state.data);
  });
  $('btnReset').addEventListener('click', () => {
    if (!window.confirm(i18n.t('resetConfirm'))) return;
    state.data = reset();
    state.data.settings.lang = i18n.lang;
    state.data.settings.onboarded = false;
    initEconomy();
    newMatchup();
    state.cardLimit = 36;
    updateSettings();
    renderAll();
    setScreen('play', false);
    closeModal('settingsModal');
    openModal('onboardingModal');
    toast(i18n.t('resetDone'));
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target !== modal) return;
      if (modal.id === 'chestModal') {
        if (!modal.classList.contains('revealed')) $('btnChestSkip').click();
        return;
      }
      if (modal.id === 'matchModal') closeMatchModal(true);
      else if (modal.id === 'onboardingModal') {
        state.data.settings.onboarded = true;
        save(state.data);
        closeModal('onboardingModal');
      }
      else closeModal(modal.id);
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const open = [...document.querySelectorAll('.modal')].find(m => !m.hidden);
    if (!open) return;
    if (open.id === 'matchModal') closeMatchModal(true);
    else if (open.id === 'chestModal') return;
    else closeModal(open.id);
  });
  window.addEventListener('hashchange', () => {
    const next = location.hash.replace('#', '') || 'play';
    if (state.screen !== next) setScreen(next, false);
  });
  window.addEventListener('beforeunload', () => save(state.data));
}

function init() {
  buildTeams();
  i18n.apply();
  populateFilters();
  bind();
  initEconomy();
  newMatchup();
  renderAll();
  updateSettings();
  const initial = location.hash.replace('#', '') || 'play';
  setScreen(initial, false);
  if (!state.data.settings.onboarded) openModal('onboardingModal');
  setInterval(() => {
    const changed = startNextChest(state.data.chests.slots);
    if (changed) save(state.data);
    if (state.screen === 'chests') renderChests();
    else if (state.screen === 'play') renderNextChest();
  }, 1000);
  save(state.data);
}

init();
