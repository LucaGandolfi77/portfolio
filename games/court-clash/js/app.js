/* Court Clash — application controller v1.1 */

import { TEAMS } from './data/teams.js';
import { enrichTeams } from './data/player-profile.js';
import { seasonAverage } from './data/player-stats.js';
import { simulateGame } from './sim/engine.js';
import { seededRandom } from './core/rng.js';
import { I18n } from './i18n.js';
import { load, save, reset, todayKey, recordHistory } from './core/storage.js';
import { Sfx } from './audio.js';
import {
  STAKE_OPTIONS, payout, chestTierForWin, boostTeam, claimDaily, claimComeback, formatCoins
} from './game/economy.js';
import {
  buildCardIndex, cardPower, copiesNeeded, coinsNeeded, addCard, upgradeCard,
  collectionPower, setProgress, claimSetRewards, SETS, SET_REWARDS, RARITIES, MAX_LEVEL
} from './game/collection.js';
import {
  addChest, startNextChest, isReady, timeLeft, speedUpCost, speedUpChest,
  openChest, chestRewards, chestInfo, formatTime, slotStatus, upgradeChestTier,
  chestTierRank, CHEST_LIMIT, PITY_LIMIT
} from './game/chests.js';
import {
  LINEUP_SIZE, unlockedSlots, sanitizeLineup, lineupSummary, autoFill, slotUnlockTrophies
} from './game/lineup.js';
import {
  buildMarkets, findOption, pickSide, resolveMarket, cashOutOffer
} from './game/markets.js';
import {
  arenaFor, nextArena, trophyDelta, claimTrophyRoad, grantAchievements,
  arenaProgress, ACHIEVEMENTS, TROPHY_ROAD, ARENAS
} from './game/progression.js';
import {
  DAILY_MISSIONS, WEEKLY_MISSIONS, ensureMissions, recordMission, missionProgress,
  claimMission, dailyBonusAvailable, claimDailyBonus, dailySummary, dateKey, weekKey
} from './game/missions.js';
import {
  refreshLab, buyLabOffer, useWildcard, claimLogin, applyReward,
  LOGIN_REWARDS
} from './game/lab.js';
import {
  ensureDailyChallenge, canCompleteDaily, completeDailyChallenge,
  startTournament, tournamentWin, tournamentLoss, tournamentStatus,
  TOURNAMENT_ENTRY, TOURNAMENT_WINS
} from './game/events.js';
import {
  levelInfo, levelReward, addXp, nextLevels,
  XP_MATCH, XP_WIN, XP_CASHOUT, XP_CHEST, XP_MISSION, XP_DAILY_BONUS,
  XP_DAILY_CHALLENGE, XP_TOURNAMENT_STEP, XP_TOURNAMENT_COMPLETE
} from './game/levels.js';
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
  cardsTab: 'collection',
  matchups: [],
  selectedMatch: 0,
  market: 'winner',
  marketsExpanded: false,
  pick: null,
  stake: 50,
  matchRun: null,
  openCardId: null,
  lineupSlot: null,
  lineupSearch: '',
  cardLimit: 36,
  filtersOpen: false,
  trophyRoadExpanded: false,
  goalAction: 'play',
  levelUpQueue: [],
  lastFocus: null,
  toastTimer: null,
  bootToasts: []
};

const CHEST_ICON = { wood: '📦', silver: '🧰', gold: '🎁', legendary: '👑' };

function cap(value) { return value.charAt(0).toUpperCase() + value.slice(1); }
function teamByCode(code) { return state.teamMap[code]; }
function chestName(type) { return i18n.t('chest' + cap(type)); }
function arenaName(arena) { return i18n.t('arena' + cap(arena.key)); }
function formatPercent(value) { return Math.round(value * 100) + '%'; }

function buildTeams() {
  state.teams = enrichTeams(TEAMS.map(team => JSON.parse(JSON.stringify(team))));
  state.teamMap = Object.fromEntries(state.teams.map(team => [team.code, team]));
  state.cards = buildCardIndex(state.teams);
  state.cardIndex = Object.fromEntries(state.cards.map(card => [card.id, card]));
}

function lineupState() {
  const unlocked = unlockedSlots(state.data.trophies || 0);
  const slots = sanitizeLineup(state.data.lineup?.slots, state.data.collection, state.cardIndex, unlocked);
  const summary = lineupSummary(slots, state.cardIndex, state.data.collection);
  return { ...summary, unlocked };
}

function currentMatch() {
  const match = state.matchups[state.selectedMatch];
  if (!match) return null;
  return {
    ...match,
    homeTeam: teamByCode(match.home),
    awayTeam: teamByCode(match.away),
    markets: match.markets
  };
}

function currentMarket() {
  const match = currentMatch();
  return match ? match.markets[state.market] : null;
}

function currentOption() {
  const match = currentMatch();
  return match ? findOption(match.markets, state.market, state.pick) : null;
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
  if (focusable) setTimeout(() => focusable.focus(), 35);
}

function closeModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.hidden = true;
  if (state.lastFocus && typeof state.lastFocus.focus === 'function') state.lastFocus.focus();
  state.lastFocus = null;
  setTimeout(flushLevelUp, 0);
}

function visibleModal() {
  return [...document.querySelectorAll('.modal')].find(modal => !modal.hidden && modal.id !== 'chestModal') || null;
}

function trapFocus(event) {
  if (event.key !== 'Tab') return;
  const modal = visibleModal();
  if (!modal) return;
  const items = [...modal.querySelectorAll('button, select, input, [tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.disabled && el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

function setScreen(name, updateHash = true) {
  const valid = ['play', 'chests', 'cards', 'progress'];
  const normalized = name === 'profile' ? 'progress' : name;
  const screen = valid.includes(normalized) ? normalized : 'play';
  state.screen = screen;
  document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.id === 'screen-' + screen));
  document.querySelectorAll('.tabbar [data-screen]').forEach(el => el.classList.toggle('active', el.dataset.screen === screen));
  if (updateHash && location.hash !== '#' + screen) location.hash = screen;
  if (screen === 'play') renderPlay();
  else if (screen === 'chests') renderChests();
  else if (screen === 'cards') renderCards();
  else renderProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function newMatchups() {
  const pool = state.teams;
  const matchups = [];
  let guard = 0;
  while (matchups.length < 3 && guard < 80) {
    guard += 1;
    const home = pool[Math.floor(Math.random() * pool.length)];
    const away = pool[Math.floor(Math.random() * pool.length)];
    if (home.code === away.code) continue;
    if (matchups.some(m => (m.home === home.code && m.away === away.code) || (m.home === away.code && m.away === home.code))) continue;
    matchups.push({ home: home.code, away: away.code, markets: buildMarkets(home, away) });
  }
  state.matchups = matchups;
  state.selectedMatch = 0;
  state.market = 'winner';
  state.marketsExpanded = false;
  state.pick = null;
}

function ensuredDaily() {
  ensureMissions(state.data, dateKey(), weekKey());
  ensureDailyChallenge(state.data, todayKey());
}

function ensureData() {
  ensuredDaily();
  const daily = claimDaily(state.data.wallet, todayKey());
  if (daily) state.bootToasts.push(i18n.t('dailyBonus', { amount: formatCoins(daily) }));
  const comeback = claimComeback(state.data.wallet, todayKey());
  if (comeback) state.bootToasts.push(i18n.t('comebackBonus', { amount: formatCoins(comeback) }));
  refreshLab(state.data, state.cards, todayKey(), seededRandom((Date.now() ^ 0x5bf03635) >>> 0));

  const chests = state.data.chests;
  if (!chests.tutorialGiven && chests.opened === 0 && chests.slots.length === 0) {
    const added = addChest(chests.slots, 'wood');
    if (added.ok) added.chest.tutorial = true;
    chests.tutorialGiven = true;
  }
  startNextChest(chests.slots);

  if (!state.data.progress) state.data.progress = { xp: 0, level: 1, rewardsLevel: 1 };

  const unlocked = unlockedSlots(state.data.trophies || 0);
  let slots = sanitizeLineup(state.data.lineup?.slots, state.data.collection, state.cardIndex, unlocked);
  if (!slots.some(Boolean) && Object.keys(state.data.collection).length) {
    slots = autoFill(state.data.collection, state.cardIndex, unlocked);
  }
  state.data.lineup.slots = slots;

  const unlockedAchievements = grantAchievements(state.data, state.cards);
  unlockedAchievements.forEach(a => state.bootToasts.push(i18n.t('newAchievement', { title: i18n.t(a.titleKey) })));
  save(state.data);
}

function renderHUD() {
  const info = levelInfo(state.data.progress);
  $('hudCoins').textContent = formatCoins(state.data.wallet.coins);
  $('hudTrophies').textContent = String(state.data.trophies || 0);
  $('hudLevel').textContent = String(info.level);
  $('hudXpFill').style.width = Math.round(info.ratio * 100) + '%';
  const xpHint = info.max
    ? i18n.t('maxLevelReached')
    : i18n.t('xpToNext', { xp: info.next - info.current, level: info.nextLevel });
  $('hudLevelChip').title = xpHint;
  $('hudLevelChip').setAttribute('aria-label', `${i18n.t('levelTitle', { level: info.level })} · ${xpHint}`);
}

function renderPlay() {
  ensuredDaily();
  if (!state.matchups.length) newMatchups();
  const match = currentMatch();
  if (!match) return;
  const info = levelInfo(state.data.progress);
  const arena = arenaFor(state.data.trophies || 0);
  const next = nextArena(state.data.trophies || 0);

  $('playLevel').textContent = String(info.level);
  $('playLevelTitle').textContent = i18n.t('levelTitle', { level: info.level });
  $('playXpText').textContent = info.max ? i18n.t('xpMax') : i18n.t('xpProgress', { current: info.current, next: info.next });
  $('playXpFill').style.width = Math.round(info.ratio * 100) + '%';
  $('playNextReward').textContent = info.max
    ? i18n.t('maxLevelReached')
    : i18n.t('nextRewardLine', { level: info.nextLevel, reward: rewardText(levelReward(info.nextLevel)) });
  $('arenaName').textContent = arenaName(arena);
  $('playTrophies').textContent = String(state.data.trophies || 0);
  $('arenaNext').textContent = next
    ? i18n.t('arenaNext', { arena: arenaName(next), trophies: next.min })
    : i18n.t('maxArena');

  $('matchupList').innerHTML = state.matchups.map((item, index) => {
    const home = teamByCode(item.home);
    const away = teamByCode(item.away);
    return `<button class="matchup-mini ${index === state.selectedMatch ? 'selected' : ''}" type="button" data-match-index="${index}" style="--home:${home.color};--away:${away.color}">
      <span class="matchup-abbrs"><b>${home.abbr}</b><i>vs</i><b>${away.abbr}</b></span>
      <small>${item.markets.winner.options[0].odds.toFixed(2)} · ${item.markets.winner.options[1].odds.toFixed(2)}</small>
    </button>`;
  }).join('');
  $('selHomeName').textContent = match.homeTeam.name;
  $('selAwayName').textContent = match.awayTeam.name;
  renderMarketTabs();
  renderMarketOptions();

  const lineup = lineupState();
  const side = pickSide(state.market, state.pick);
  $('boostValue').textContent = '+' + lineup.boost;
  const marketHasSide = state.market === 'winner' || (state.market === 'margin' && state.pick !== 'close');
  if (!side) {
    $('boostNote').textContent = marketHasSide ? i18n.t('lineupBoostHint') : i18n.t('noLineupBoost');
  } else {
    const sideName = side === 'home' ? match.homeTeam.abbr : match.awayTeam.abbr;
    $('boostNote').textContent = lineup.boost
      ? i18n.t('lineupBoostSide', { boost: lineup.boost, team: sideName })
      : i18n.t('lineupBoostHint');
  }

  document.querySelectorAll('[data-stake]').forEach(el => el.classList.toggle('active', Number(el.dataset.stake) === state.stake));
  const option = currentOption();
  $('potential').textContent = option ? formatCoins(payout(state.stake, option.odds)) : '—';
  $('btnBet').disabled = !option;
  $('record').textContent = `${state.data.stats.wins || 0}W · ${state.data.stats.losses || 0}L`;
  renderNextGoal();
  renderSpecialCards();
  renderNextChest();
  renderRecent();
}

function renderMarketTabs() {
  const expanded = state.marketsExpanded || state.market !== 'winner';
  document.querySelectorAll('#marketTabs [data-market]').forEach(btn => {
    btn.hidden = !expanded && btn.dataset.market !== 'winner';
    btn.classList.toggle('active', btn.dataset.market === state.market);
  });
  $('btnMoreMarkets').hidden = expanded;
}

function nextGoal() {
  const stats = state.data.stats;
  const lineup = lineupState();
  const daily = ensureDailyChallenge(state.data, todayKey());
  const tutorial = state.data.chests.slots.find(chest => chest.tutorial);
  const readyChest = state.data.chests.slots.find(chest => isReady(chest));
  const bonus = dailyBonusAvailable(state.data);
  const claimable = [...DAILY_MISSIONS.map(mission => ['daily', mission]), ...WEEKLY_MISSIONS.map(mission => ['weekly', mission])]
    .some(([period, mission]) => missionProgress(state.data, period, mission).ratio >= 1
      && !state.data.missions[period].claimed.includes(mission.id));

  if ((stats.matches || 0) < 1) {
    return { icon: '🏀', title: i18n.t('goalPlayTitle'), hint: i18n.t('goalPlayHint'), label: i18n.t('goalPlayAction'), action: 'play' };
  }
  if (tutorial && isReady(tutorial) && (stats.chestsOpened || 0) === 0) {
    return { icon: '📦', title: i18n.t('goalChestTitle'), hint: i18n.t('goalChestHint'), label: i18n.t('goalChestAction'), action: 'open-chest' };
  }
  if (Object.keys(state.data.collection).length && !lineup.slots.some(Boolean)) {
    return { icon: '🃏', title: i18n.t('goalLineupTitle'), hint: i18n.t('goalLineupHint'), label: i18n.t('goalLineupAction'), action: 'lineup' };
  }
  if (bonus) {
    return { icon: '🎁', title: i18n.t('goalBonusTitle'), hint: i18n.t('goalBonusHint'), label: i18n.t('goalBonusAction'), action: 'claim-bonus' };
  }
  if (claimable) {
    return { icon: '✅', title: i18n.t('goalMissionsTitle'), hint: i18n.t('goalMissionsHint'), label: i18n.t('goalMissionsAction'), action: 'claim-missions' };
  }
  if (readyChest) {
    return { icon: CHEST_ICON[readyChest.type] || '📦', title: i18n.t('goalReadyChestTitle'), hint: i18n.t('goalReadyChestHint'), label: i18n.t('goalReadyChestAction'), action: 'open-chest' };
  }
  if (!daily.done) {
    return { icon: '🎯', title: i18n.t('goalDailyTitle'), hint: i18n.t('goalDailyHint'), label: i18n.t('goalDailyAction'), action: 'play' };
  }
  if (state.data.tournament?.active) {
    const step = state.data.tournament.step || 0;
    return {
      icon: '🏆',
      title: i18n.t('goalTournamentTitle', { step, total: TOURNAMENT_WINS }),
      hint: i18n.t('goalTournamentHint', { left: TOURNAMENT_WINS - step }),
      label: i18n.t('goalTournamentAction'),
      action: 'play'
    };
  }
  return { icon: '🏀', title: i18n.t('goalWinTitle'), hint: i18n.t('goalWinHint'), label: i18n.t('goalWinAction'), action: 'play' };
}

function renderNextGoal() {
  const goal = nextGoal();
  state.goalAction = goal.action;
  $('goalIcon').textContent = goal.icon;
  $('goalTitle').textContent = goal.title;
  $('goalHint').textContent = goal.hint;
  $('btnGoal').textContent = goal.label;
}

function renderMarketOptions() {
  const match = currentMatch();
  if (!match) return;
  const market = match.markets[state.market];
  const home = match.homeTeam;
  const away = match.awayTeam;
  $('marketOptions').innerHTML = market.options.map(option => {
    let label = '';
    if (state.market === 'winner') {
      const team = option.key === 'home' ? home : away;
      label = `<i class="team-dot" style="background:${team.color}"></i>${team.name}`;
    } else if (state.market === 'margin') {
      label = option.key === 'home10' ? i18n.t('pickHome10', { team: home.abbr })
        : option.key === 'away10' ? i18n.t('pickAway10', { team: away.abbr })
          : i18n.t('pickClose');
    } else {
      label = option.key === 'over' ? i18n.t('pickOver', { line: market.line }) : i18n.t('pickUnder', { line: market.line });
    }
    return `<button class="odds-option ${state.pick === option.key ? 'selected' : ''}" type="button" data-pick="${option.key}">
      <span class="option-label">${label}</span>
      <b class="option-odds">×${option.odds.toFixed(2)}</b>
    </button>`;
  }).join('');
  $('marketNote').textContent = state.market === 'winner' ? i18n.t('cashoutAvailable') : i18n.t('cashoutOnlyWinner');
}

function renderSpecialCards() {
  ensuredDaily();
  const daily = ensureDailyChallenge(state.data, todayKey());
  $('dailyState').textContent = daily.done ? '✓' : '0/1';
  $('dailyText').textContent = daily.done ? i18n.t('dailyDone') : i18n.t('dailyText');
  const tournament = tournamentStatus(state.data);
  const arena = arenaFor(state.data.trophies || 0);
  if (!arena.tournament) {
    $('tournamentState').textContent = '🔒';
    $('tournamentText').textContent = i18n.t('unlocksAt', { arena: arenaName(ARENAS[1]) });
    $('btnTournament').hidden = true;
    $('btnTournament').disabled = true;
  } else if (tournament.active) {
    $('tournamentState').textContent = `${tournament.step}/${TOURNAMENT_WINS}`;
    $('tournamentText').textContent = i18n.t('tournamentActive', { step: tournament.step, total: TOURNAMENT_WINS });
    $('btnTournament').hidden = true;
  } else {
    $('tournamentState').textContent = '—';
    $('tournamentText').textContent = i18n.t('tournamentText');
    $('btnTournament').hidden = false;
    $('btnTournament').textContent = i18n.t('tournamentEnter');
    $('btnTournament').disabled = state.data.wallet.coins < TOURNAMENT_ENTRY + STAKE_OPTIONS[0];
  }
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
  $('nextChestTitle').textContent = status === 'ready' ? i18n.t('nextChestReady')
    : status === 'queued' ? i18n.t('nextChestQueued') : i18n.t('nextChestUnlocking');
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
  $('recentList').innerHTML = list.map(row => `<div class="recent-row ${row.won ? 'win' : row.cashedOut ? 'cashout' : 'loss'}">
    <span class="recent-badge">${row.cashedOut ? i18n.t('cashedOut') : i18n.t(row.won ? 'historyWin' : 'historyLoss')}</span>
    <div class="recent-main">
      <b>${row.homeName || row.home} ${row.hs}–${row.as} ${row.awayName || row.away}</b>
      <small>${row.market ? i18n.t('market' + cap(row.market)) : ''}${row.pickText ? ' · ' + row.pickText : ''}${row.chest ? ' · ' + chestName(row.chest) : ''}</small>
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
      return `<div class="chest-slot empty"><div class="slot-art">＋</div><b>${i18n.t('chestEmpty')}</b><small>${index + 1}/${CHEST_LIMIT}</small></div>`;
    }
    const info = chestInfo(chest.type);
    const status = slotStatus(chest, now);
    const timer = status === 'ready' ? i18n.t('chestReady') : status === 'queued' ? i18n.t('chestQueued') : formatTime(timeLeft(chest, now));
    let action = `<span class="slot-note">${i18n.t('chestQueued')}</span>`;
    if (status === 'ready') action = `<button class="btn small ready" type="button" data-open="${index}">${i18n.t('open')}</button>`;
    else if (status === 'unlocking') action = `<button class="btn small" type="button" data-speed="${index}">${i18n.t('speedUp')} · ${speedUpCost(chest, now)}</button>`;
    return `<div class="chest-slot chest-${chest.type} status-${status}" style="--chest:${info.color};--chest-glow:${info.glow}">
      <div class="slot-art">${CHEST_ICON[chest.type]}</div><b>${chestName(chest.type)}</b><small>${timer}</small>${action}
    </div>`;
  }).join('');
  const pity = state.data.chests.pity || 0;
  $('pityCount').textContent = `${pity}/${PITY_LIMIT}`;
  $('pityFill').style.width = Math.min(100, (pity / PITY_LIMIT) * 100) + '%';
  const milestone = (state.data.chests.opened || 0) % 10;
  $('milestoneCount').textContent = `${milestone}/10`;
  $('milestoneFill').style.width = (milestone / 10) * 100 + '%';
}

function filteredCards() {
  const search = $('cardSearch').value.trim().toLowerCase();
  const rarity = $('filterRarity').value;
  const set = $('filterSet').value;
  const team = $('filterTeam').value;
  const owned = $('filterOwned').value;
  const sort = $('sortCards').value;
  const list = state.cards.filter(card => {
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
    <b>${card.name}</b><small>${card.teamCode} · ${card.pos}</small>
    <span class="ccard-power">${power}</span><span class="ccard-copies">${owned ? `${copies}/${level >= MAX_LEVEL ? '—' : need}` : '—'}</span>
  </button>`;
}

function setCardsHead(eyebrowKey, titleKey, summary) {
  $('cardsEyebrow').textContent = i18n.t(eyebrowKey);
  $('cardsTitle').textContent = i18n.t(titleKey);
  $('collectionSummary').textContent = summary;
}

function activeFilterCount() {
  let count = 0;
  if ($('filterRarity').value) count += 1;
  if ($('filterSet').value) count += 1;
  if ($('filterTeam').value) count += 1;
  if ($('filterOwned').value !== 'owned') count += 1;
  if ($('sortCards').value !== 'power') count += 1;
  return count;
}

function updateFilterUI() {
  const count = activeFilterCount();
  $('filterPanel').hidden = !state.filtersOpen;
  $('filterCount').textContent = count ? ` (${count})` : '';
  $('btnToggleFilters').classList.toggle('active', state.filtersOpen || count > 0);
  $('btnToggleFilters').setAttribute('aria-expanded', String(state.filtersOpen));
}

function renderCards() {
  updateFilterUI();
  document.querySelectorAll('[data-cards-tab]').forEach(btn => btn.classList.toggle('active', btn.dataset.cardsTab === state.cardsTab));
  $('cardsPaneCollection').hidden = state.cardsTab !== 'collection';
  $('cardsPaneLineup').hidden = state.cardsTab !== 'lineup';
  $('cardsPaneMarket').hidden = state.cardsTab !== 'market';
  if (state.cardsTab === 'collection') renderCollectionPane();
  else if (state.cardsTab === 'lineup') renderLineupPane();
  else renderMarketPane();
}

function renderCollectionPane() {
  updateFilterUI();
  const owned = Object.keys(state.data.collection).length;
  const power = collectionPower(state.data.collection, state.cardIndex);
  setCardsHead('tabCollection', 'yourCards', i18n.t('collectionSummary', {
    owned, total: state.cards.length, power: formatCoins(power)
  }));
  $('collectionEmpty').hidden = owned > 0;
  const collectionCard = $('cardGrid').closest('.collection-card');
  if (collectionCard) collectionCard.hidden = owned === 0;
  const progress = setProgress(state.data.collection, state.cards);
  $('setProgress').innerHTML = Object.keys(SETS).map(key => {
    const item = progress[key];
    const claimed = state.data.setsClaimed[key];
    return `<div class="set-row"><span>${i18n.t('set' + cap(key))}</span>
      <i><b style="width:${Math.round(item.ratio * 100)}%"></b></i>
      <span>${item.owned}/${item.total}</span><small>${claimed ? '✓' : '+' + SET_REWARDS[key]}</small></div>`;
  }).join('');
  const list = filteredCards();
  const shown = list.slice(0, state.cardLimit);
  $('cardGrid').innerHTML = shown.map(cardTile).join('');
  $('cardEmpty').hidden = list.length > 0;
  $('btnMoreCards').hidden = shown.length >= list.length;
}

function renderLineupPane() {
  const lineup = lineupState();
  setCardsHead('tabLineup', 'yourLineup', i18n.t('lineupLede', {
    filled: lineup.slots.filter(Boolean).length,
    total: LINEUP_SIZE,
    power: formatCoins(lineup.power),
    boost: lineup.boost
  }));
  $('lineupPower').textContent = formatCoins(lineup.power);
  $('lineupBoost').textContent = '+' + lineup.boost;
  $('lineupChem').textContent = String(lineup.chemistry.score);
  $('lineupNote').textContent = lineup.boost
    ? i18n.t('lineupBoostApplied', { boost: lineup.boost })
    : i18n.t('lineupNote');
  $('lineupSlots').innerHTML = Array.from({ length: LINEUP_SIZE }, (_, index) => {
    if (index >= lineup.unlocked) {
      return `<div class="lineup-slot locked"><span>🔒</span><small>${i18n.t('lineupLocked', { trophies: slotUnlockTrophies(index) })}</small></div>`;
    }
    const id = lineup.slots[index];
    const card = id ? state.cardIndex[id] : null;
    if (!card) {
      return `<button class="lineup-slot empty" type="button" data-slot="${index}"><b>+</b><small>${i18n.t('slotEmpty')}</small></button>`;
    }
    const entry = state.data.collection[id];
    return `<button class="lineup-slot filled" type="button" data-slot="${index}" style="--rarity:${RARITIES[card.rarity].color};--team:${card.teamColor}">
      <img src="${miniAvatarUrl(card, { color: card.teamColor }, 112)}" alt="${card.name}">
      <b>${card.name}</b><small>${card.pos} · Lv${entry.level} · ${cardPower(card, entry.level)}</small>
    </button>`;
  }).join('');
  $('chemBreakdown').innerHTML = lineup.chemistry.labels.map(item =>
    `<span class="chem-chip">${i18n.t(item.key)} <b>+${item.value}</b></span>`
  ).join('') + `<span class="chem-chip">${i18n.t('chemScore', { score: lineup.chemistry.score })}</span>`;
  const hasCollection = Object.keys(state.data.collection).length > 0;
  const emptyLineup = !lineup.slots.some(Boolean);
  $('btnAutoFill').disabled = !hasCollection;
  $('btnAutoFill').classList.toggle('primary', hasCollection && emptyLineup);
  $('btnAutoFill').textContent = hasCollection && emptyLineup ? i18n.t('autoFillBest') : i18n.t('autoFill');
}

function renderMarketPane() {
  refreshLab(state.data, state.cards, todayKey(), seededRandom((Date.now() ^ 0x5bf03635) >>> 0));
  setCardsHead('tabMarket', 'cardLab', i18n.t('marketLede'));
  $('labDate').textContent = state.data.lab.date;
  $('labOffers').innerHTML = state.data.lab.offers.map((offer, index) => {
    const card = state.cardIndex[offer.cardId];
    if (!card) return '';
    const entry = state.data.collection[card.id];
    return `<div class="lab-offer ${offer.sold ? 'sold' : ''}" style="--rarity:${RARITIES[card.rarity].color}">
      <img src="${miniAvatarUrl(card, { color: card.teamColor }, 96)}" alt="${card.name}">
      <div><b>${card.name}</b><small>${card.teamName} · ${card.pos}</small>
      <span class="rarity-pill rarity-${card.rarity}">${i18n.t(card.rarity)}</span>
      ${entry ? `<small>Lv${entry.level} · ${entry.copies}/${copiesNeeded(entry.level)}</small>` : `<small>${i18n.t('cardNew')}</small>`}</div>
      <button class="btn small ${offer.sold ? '' : 'primary'}" type="button" data-buy-offer="${index}" ${offer.sold || state.data.wallet.coins < offer.price ? 'disabled' : ''}>
        ${offer.sold ? i18n.t('sold') : i18n.t('labPrice', { price: offer.price })}
      </button>
    </div>`;
  }).join('') || `<p class="empty-state">${i18n.t('noRewards')}</p>`;

  $('wildcardCounts').innerHTML = ['common', 'rare', 'epic', 'legendary'].map(rarity =>
    `<span class="wildcard-chip rarity-${rarity}" style="--rarity:${RARITIES[rarity].color}">
      <b>${state.data.wildcards[rarity] || 0}</b><small>${i18n.t(rarity)}</small>
    </span>`
  ).join('');

  const claimedToday = state.data.login.last === todayKey();
  const nextDay = state.data.login.last ? (state.data.login.day % 7) + 1 : 1;
  $('loginTrack').innerHTML = LOGIN_REWARDS.map((reward, index) => {
    const day = index + 1;
    const active = claimedToday ? day === state.data.login.day : day === nextDay;
    return `<div class="login-day ${active ? 'active' : ''} ${claimedToday && day <= state.data.login.day ? 'done' : ''}">
      <small>${i18n.t('loginDay', { day })}</small><b>${loginRewardText(reward)}</b>
    </div>`;
  }).join('');
  $('btnLogin').disabled = claimedToday;
  $('btnLogin').textContent = claimedToday ? i18n.t('loginClaimed') : i18n.t('claimToday');
  $('loginText').textContent = claimedToday ? i18n.t('loginClaimed') : `${i18n.t('loginReward')}: ${loginRewardText(LOGIN_REWARDS[nextDay - 1])}`;
}

function loginRewardText(reward) {
  if (reward.coins) return `🪙 +${reward.coins}`;
  const entry = Object.entries(reward.wildcards || {})[0];
  return entry ? `${entry[1]}× ${i18n.t(entry[0])} ${i18n.t('wildcards')}` : '—';
}

function rewardText(reward) {
  if (!reward) return '';
  const parts = [];
  if (reward.coins) parts.push(`+${reward.coins} 🪙`);
  for (const [rarity, amount] of Object.entries(reward.wildcards || {})) parts.push(`+${amount} ${i18n.t(rarity)}`);
  return parts.join(' · ');
}

function renderProgress() {
  ensuredDaily();
  const info = levelInfo(state.data.progress);
  const arena = arenaFor(state.data.trophies || 0);
  const next = nextArena(state.data.trophies || 0);
  const arenaInfo = arenaProgress(state.data.trophies || 0);
  const stats = state.data.stats;
  const xpText = info.max ? i18n.t('xpMax') : i18n.t('xpProgress', { current: info.current, next: info.next });
  const xpHint = info.max ? i18n.t('maxLevelReached') : i18n.t('xpToNext', { xp: info.next - info.current, level: info.nextLevel });

  $('profileLevel').textContent = String(info.level);
  $('profileLevelTitle').textContent = i18n.t('levelTitle', { level: info.level });
  $('profileRecord').textContent = `${stats.wins || 0}W · ${stats.losses || 0}L`;
  $('profileTrophies').textContent = String(state.data.trophies || 0);
  $('profileXpText').textContent = xpText;
  $('profileXpNext').textContent = xpHint;
  $('profileXpFill').style.width = Math.round(info.ratio * 100) + '%';
  $('profileArena').textContent = arenaName(arena);
  $('profileArenaFill').style.width = Math.round(arenaInfo.ratio * 100) + '%';
  $('profileArenaNext').textContent = next ? i18n.t('arenaNext', { arena: arenaName(next), trophies: next.min }) : i18n.t('maxArena');

  const reward = info.max ? null : levelReward(info.nextLevel);
  $('nextRewardTitle').textContent = info.max ? i18n.t('maxLevelReached') : i18n.t('levelTitle', { level: info.nextLevel });
  $('nextRewardXp').textContent = info.max ? '—' : xpHint;
  $('nextRewardText').textContent = info.max ? i18n.t('maxLevelReached') : rewardText(reward);
  const steps = nextLevels(state.data.progress, 5);
  $('levelTrack').innerHTML = steps.length ? steps.map(step => `<div class="level-step">
    <small>LV ${step.level}</small><b>${step.reward ? rewardText(step.reward) : '—'}</b>
  </div>`).join('') : `<span class="hint">${i18n.t('maxLevelReached')}</span>`;

  renderTrophyRoad();
  renderMissions();
  renderAchievements();

  const setComplete = Object.values(setProgress(state.data.collection, state.cards)).filter(p => p.total && p.owned >= p.total).length;
  const winRate = (stats.wins + stats.losses) ? stats.wins / (stats.wins + stats.losses) : 0;
  const favorite = Object.entries(stats.teamCounts || {}).sort((a, b) => b[1] - a[1])[0];
  const favoriteName = favorite ? (teamByCode(favorite[0])?.name || favorite[0]) : '—';
  const rows = [
    ['statMatches', stats.matches || 0],
    ['statWins', stats.wins || 0],
    ['statLosses', stats.losses || 0],
    ['statWinRate', formatPercent(winRate)],
    ['statBestStreak', stats.bestStreak || 0],
    ['statChests', state.data.chests.opened || 0],
    ['statCards', Object.keys(state.data.collection).length],
    ['statSets', setComplete],
    ['statCoinsEarned', formatCoins(stats.coinsEarned || 0)],
    ['statCoinsSpent', formatCoins(stats.coinsSpent || 0)],
    ['statFavoriteTeam', favoriteName],
    ['statBestChest', stats.bestChest ? chestName(stats.bestChest) : '—'],
    ['statCashouts', stats.cashOuts || 0],
    ['statTournaments', stats.tournamentsWon || 0],
    ['statUpgrades', stats.upgrades || 0]
  ];
  $('profileStats').innerHTML = rows.map(([key, value]) => `<div class="stat-box"><span>${i18n.t(key)}</span><b>${value}</b></div>`).join('');
}

function renderTrophyRoad() {
  const claimed = state.data.trophyRoadClaimed || [];
  $('trophyRoad').classList.toggle('collapsed', !state.trophyRoadExpanded);
  $('btnToggleTrophyRoad').textContent = state.trophyRoadExpanded ? i18n.t('showLess') : i18n.t('showAll');
  $('trophyRoad').innerHTML = TROPHY_ROAD.map(item => {
    const done = claimed.includes(item.at);
    const reachable = state.data.trophies >= item.at;
    return `<div class="trophy-row ${done ? 'done' : ''} ${reachable && !done ? 'reachable' : ''}">
      <b>🏆 ${item.at}</b><span>${rewardText({ coins: item.coins, wildcards: item.wildcards })}</span>
      <small>${done ? i18n.t('claimed') : reachable ? i18n.t('ready') : '—'}</small>
    </div>`;
  }).join('');
  $('btnClaimTrophyRoad').disabled = !TROPHY_ROAD.some(item => state.data.trophies >= item.at && !claimed.includes(item.at));
}

function renderMissions() {
  const summary = dailySummary(state.data);
  $('dailyMissionState').textContent = i18n.t('dailyMissionsDone', { claimed: summary.claimed, total: summary.total });
  $('dailyMissions').innerHTML = DAILY_MISSIONS.map(mission => missionRow('daily', mission)).join('');
  $('weeklyMissions').innerHTML = WEEKLY_MISSIONS.map(mission => missionRow('weekly', mission)).join('');
  const bonus = dailyBonusAvailable(state.data);
  $('dailyBonus').hidden = !bonus;
  $('dailyBonus').innerHTML = bonus
    ? `<span>${i18n.t('dailyBonusText')}</span><button class="btn small primary" type="button" data-claim-bonus="daily">${i18n.t('claim')} ${rewardText({ coins: 100, wildcards: { rare: 1 } })}</button>`
    : '';
  const claimable = [...DAILY_MISSIONS.map(mission => ['daily', mission]), ...WEEKLY_MISSIONS.map(mission => ['weekly', mission])]
    .some(([period, mission]) => missionProgress(state.data, period, mission).ratio >= 1
      && !state.data.missions[period].claimed.includes(mission.id));
  $('btnClaimAllMissions').disabled = !claimable && !bonus;
}

function missionRow(period, mission) {
  const progress = missionProgress(state.data, period, mission);
  const claimed = state.data.missions[period].claimed.includes(mission.id);
  const complete = progress.ratio >= 1;
  return `<div class="mission-row ${claimed ? 'claimed' : complete ? 'complete' : ''}">
    <div class="mission-main"><b>${i18n.t(mission.titleKey)}</b><small>${i18n.t(mission.descKey)}</small>
      <div class="mini-bar"><i style="width:${Math.round(progress.ratio * 100)}%"></i></div>
    </div>
    <div class="mission-side">
      <span>${i18n.t('missionProgress', { value: progress.value, target: progress.target })}</span>
      <small>${rewardText(mission.reward)}</small>
      ${claimed ? '<b class="mission-claimed">✓</b>' : complete ? `<button class="btn small primary" type="button" data-claim-mission="${period}:${mission.id}">${i18n.t('claim')}</button>` : ''}
    </div>
  </div>`;
}

function renderAchievements() {
  const unlocked = state.data.achievements.unlocked || [];
  $('achievementCount').textContent = `${unlocked.length}/${ACHIEVEMENTS.length}`;
  $('achievements').innerHTML = ACHIEVEMENTS.map(achievement => {
    const done = unlocked.includes(achievement.id);
    return `<div class="achievement-row ${done ? 'done' : ''}">
      <span>${done ? '✓' : '🔒'}</span>
      <div><b>${i18n.t(achievement.titleKey)}</b><small>${i18n.t(achievement.descKey)}</small></div>
      <small>${rewardText(achievement.reward)}</small>
    </div>`;
  }).join('');
}

function placeBet() {
  if (state.matchRun) return;
  const match = currentMatch();
  const option = currentOption();
  if (!match || !option) { showPlayError(i18n.t('selectTeam')); return; }
  if (state.data.chests.slots.length >= CHEST_LIMIT) { showPlayError(i18n.t('slotsFull')); return; }
  if (state.data.wallet.coins < state.stake) {
    const comeback = claimComeback(state.data.wallet, todayKey());
    if (comeback) { toast(i18n.t('comebackBonus', { amount: formatCoins(comeback) })); save(state.data); renderHUD(); }
  }
  if (state.data.wallet.coins < state.stake) { showPlayError(i18n.t('noCoins')); return; }
  const side = pickSide(state.market, state.pick);
  const lineup = lineupState();
  const boost = side ? lineup.boost : 0;
  const home = match.homeTeam;
  const away = match.awayTeam;
  const boostedHome = side === 'home' ? boostTeam(home, boost) : home;
  const boostedAway = side === 'away' ? boostTeam(away, boost) : away;
  const summary = simulateGame(boostedHome, boostedAway, { rng: seededRandom((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0) });
  state.matchRun = {
    match,
    market: state.market,
    pick: state.pick,
    side,
    option,
    odds: option.odds,
    line: match.markets.total.line,
    stake: state.stake,
    summary,
    boost,
    revealedStage: 0,
    settled: false,
    cashoutOffered: { HT: false, Q3: false },
    pendingStage: null,
    timer: null,
    result: null
  };
  sfx.init();
  sfx.tone(420, 0.07, 'sine', 0.03);
  showMatchModal();
}

function showPlayError(message) {
  const el = $('playError');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(showPlayError.timer);
  showPlayError.timer = setTimeout(() => { el.hidden = true; }, 3200);
}


function awardPlayerXp(amount) {
  const result = addXp(state.data.progress, amount);
  if (result.gained.length) {
    result.gained.forEach(item => applyReward(state.data, item.reward));
    state.levelUpQueue.push(...result.gained);
  }
  return result;
}

function flushLevelUp() {
  if (!state.levelUpQueue.length) return;
  if (visibleModal() || !$('chestModal').hidden) return;
  const gained = state.levelUpQueue.splice(0);
  const last = gained[gained.length - 1];
  const total = { coins: 0, wildcards: {} };
  gained.forEach(item => {
    const reward = item.reward || {};
    total.coins += reward.coins || 0;
    for (const [rarity, amount] of Object.entries(reward.wildcards || {})) {
      total.wildcards[rarity] = (total.wildcards[rarity] || 0) + amount;
    }
  });
  $('levelUpNumber').textContent = String(last.level);
  $('levelUpTitle').textContent = i18n.t('levelTitle', { level: last.level });
  $('levelUpText').textContent = i18n.t('levelUpText', { level: last.level });
  const chips = [];
  if (total.coins) chips.push(`<span class="level-reward-chip">🪙 +${formatCoins(total.coins)}</span>`);
  for (const [rarity, amount] of Object.entries(total.wildcards)) {
    chips.push(`<span class="level-reward-chip">${amount}× ${i18n.t(rarity)} ${i18n.t('wildcards')}</span>`);
  }
  $('levelUpRewards').innerHTML = chips.join('');
  openModal('levelModal');
  sfx.chest('rise');
}

function handleGoalAction() {
  if (state.goalAction === 'open-chest') {
    if (state.data.chests.slots.some(chest => isReady(chest))) openChestFlow();
    else setScreen('chests');
    return;
  }
  if (state.goalAction === 'lineup') {
    state.cardsTab = 'lineup';
    setScreen('cards');
    return;
  }
  if (state.goalAction === 'claim-bonus') { claimDailyBonusReward(); return; }
  if (state.goalAction === 'claim-missions') { claimAllMissions(); return; }
  setScreen('play');
  const card = $('quickMatchCard');
  if (card) {
    card.classList.add('attention');
    setTimeout(() => card.classList.remove('attention'), 900);
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function pickLabel(match, market, pick) {
  if (market === 'winner') return pick === 'home' ? match.homeTeam.name : match.awayTeam.name;
  if (market === 'margin') {
    if (pick === 'close') return i18n.t('pickClose');
    return i18n.t(pick === 'home10' ? 'pickHome10' : 'pickAway10', { team: pick === 'home10' ? match.homeTeam.abbr : match.awayTeam.abbr });
  }
  return i18n.t(pick === 'over' ? 'pickOver' : 'pickUnder', { line: match.markets.total.line });
}

function pickShort(match, market, pick) {
  if (market === 'winner') return pick === 'home' ? match.homeTeam.abbr : match.awayTeam.abbr;
  if (market === 'margin') {
    if (pick === 'close') return i18n.t('pickClose');
    return `${pick === 'home10' ? match.homeTeam.abbr : match.awayTeam.abbr} +10`;
  }
  return i18n.t(pick === 'over' ? 'pickOver' : 'pickUnder', { line: match.markets.total.line });
}

function showMatchModal() {
  const run = state.matchRun;
  if (!run) return;
  const match = run.match;
  $('matchModeLabel').textContent = i18n.t('quickMatch');
  $('matchMarketLabel').textContent = `${i18n.t('market' + cap(run.market))} · ${pickShort(match, run.market, run.pick)}`;
  $('matchHomeAbbr').textContent = match.homeTeam.abbr;
  $('matchAwayAbbr').textContent = match.awayTeam.abbr;
  $('matchHomeScore').textContent = '0';
  $('matchAwayScore').textContent = '0';
  $('matchTeams').textContent = `${match.homeTeam.name} vs ${match.awayTeam.name}${run.boost ? ` · Boost +${run.boost} ${run.side === 'home' ? match.homeTeam.abbr : match.awayTeam.abbr}` : ''}`;
  $('matchStatus').textContent = i18n.t('tipoff');
  $('matchQuarters').innerHTML = '';
  $('cashoutPanel').hidden = true;
  $('matchResultBanner').hidden = true;
  $('matchReward').hidden = true;
  $('matchTop').innerHTML = '';
  $('matchTop').hidden = true;
  $('btnMatchSkip').hidden = false;
  $('btnMatchAgain').hidden = true;
  $('btnMatchChests').hidden = true;
  $('btnMatchShare').hidden = true;
  openModal('matchModal');
  startReveal(run);
}

function startReveal(run) {
  clearTimeout(run.timer);
  run.revealedStage = 0;
  renderReveal(run);
  run.timer = setTimeout(() => advanceReveal(run), state.data.settings.fastReveal ? 60 : 500);
}

function advanceReveal(run) {
  if (!run || run.settled) return;
  if (run.revealedStage < 4) {
    run.revealedStage += 1;
    renderReveal(run);
    if (run.revealedStage === 2 && run.market === 'winner' && run.side && !run.cashoutOffered.HT) {
      showCashout(run, 'HT');
      return;
    }
    if (run.revealedStage === 3 && run.market === 'winner' && run.side && !run.cashoutOffered.Q3) {
      showCashout(run, 'Q3');
      return;
    }
    if (run.revealedStage === 4) {
      settleFinal(run);
      return;
    }
    run.timer = setTimeout(() => advanceReveal(run), state.data.settings.fastReveal ? 60 : 550);
  }
}

function renderReveal(run) {
  const summary = run.summary;
  const stage = Math.min(4, run.revealedStage);
  const quarters = summary.quarters.slice(0, stage);
  const home = quarters.reduce((sum, q) => sum + q.home, 0);
  const away = quarters.reduce((sum, q) => sum + q.away, 0);
  $('matchHomeScore').textContent = String(home);
  $('matchAwayScore').textContent = String(away);
  $('matchQuarters').innerHTML = quarters.map((q, i) => `<span>Q${i + 1}<b>${q.home}–${q.away}</b></span>`).join('');
  $('matchStatus').textContent = stage === 0 ? i18n.t('tipoff') : stage === 1 ? i18n.t('matchStatusQ', { quarter: 1 })
    : stage === 2 ? i18n.t('matchStatusHalf') : stage === 3 ? i18n.t('matchStatusQ', { quarter: 3 }) : i18n.t('matchStatusFinal');
}

function showCashout(run, stage) {
  clearTimeout(run.timer);
  const amount = cashOutOffer({ stake: run.stake, odds: run.odds, summary: run.summary, side: run.side, stage });
  if (!amount) { advanceReveal(run); return; }
  run.pendingStage = stage;
  run.cashoutOffered[stage] = true;
  $('cashoutAmount').textContent = formatCoins(amount);
  $('cashoutFull').textContent = i18n.t('fullPayout', { amount: formatCoins(payout(run.stake, run.odds)) });
  $('cashoutPanel').hidden = false;
  $('matchStatus').textContent = stage === 'HT' ? i18n.t('matchStatusHalf') : i18n.t('matchStatusQ', { quarter: 3 });
  $('btnMatchSkip').hidden = false;
}

function settleCashout(run, amount) {
  if (!run || run.settled) return;
  run.settled = true;
  clearTimeout(run.timer);
  $('cashoutPanel').hidden = true;
  const delta = amount - run.stake;
  state.data.wallet.coins = Math.max(0, state.data.wallet.coins + delta);
  const stats = state.data.stats;
  stats.matches = (stats.matches || 0) + 1;
  stats.cashOuts = (stats.cashOuts || 0) + 1;
  stats.coinsSpent = (stats.coinsSpent || 0) + run.stake;
  stats.coinsEarned = (stats.coinsEarned || 0) + amount;
  stats.streak = 0;
  if (run.side) {
    const code = run.side === 'home' ? run.match.home : run.match.away;
    stats.teamCounts = stats.teamCounts || {};
    stats.teamCounts[code] = (stats.teamCounts[code] || 0) + 1;
    stats.favoriteTeam = code;
  }
  recordMission(state.data, 'match');
  let tournamentEvent = null;
  if (state.data.tournament?.active) tournamentEvent = tournamentLoss(state.data);
  const xp = XP_MATCH + XP_CASHOUT;
  awardPlayerXp(xp);
  recordHistory(state.data, {
    home: run.match.home, away: run.match.away, homeName: run.match.homeTeam.name, awayName: run.match.awayTeam.name,
    hs: cumulative(run.summary, run.pendingStage).home, as: cumulative(run.summary, run.pendingStage).away,
    pick: run.pick, pickText: pickLabel(run.match, run.market, run.pick), market: run.market, won: false, cashedOut: true, stake: run.stake, odds: run.odds, delta, chest: null
  });
  run.result = { type: 'cashout', amount, delta, tournamentEvent, xp };
  grantAchievementsAndNotify();
  save(state.data);
  renderAll();
  renderMatchResult(run);
  flushLevelUp();
  sfx.chest('click');
  if (tournamentEvent) toast(i18n.t('tournamentFailed'));
}

function cumulative(summary, stage) {
  const count = stage === 'Q3' ? 3 : stage === 'HT' ? 2 : 4;
  const quarters = (summary.quarters || []).slice(0, count);
  return {
    home: quarters.reduce((sum, q) => sum + q.home, 0),
    away: quarters.reduce((sum, q) => sum + q.away, 0)
  };
}

function settleFinal(run) {
  if (!run || run.settled) return;
  run.settled = true;
  clearTimeout(run.timer);
  $('cashoutPanel').hidden = true;
  run.revealedStage = 4;
  const summary = run.summary;
  const won = resolveMarket(run.market, run.pick, summary, run.line);
  const stake = run.stake;
  const payoutAmount = won ? payout(stake, run.odds) : 0;
  const delta = won ? payoutAmount - stake : -stake;
  const stats = state.data.stats;
  stats.matches = (stats.matches || 0) + 1;
  stats.wins = (stats.wins || 0) + (won ? 1 : 0);
  stats.losses = (stats.losses || 0) + (won ? 0 : 1);
  stats.streak = won ? (stats.streak || 0) + 1 : 0;
  stats.bestStreak = Math.max(stats.bestStreak || 0, stats.streak);
  stats.coinsSpent = (stats.coinsSpent || 0) + stake;
  stats.coinsEarned = (stats.coinsEarned || 0) + (won ? payoutAmount : 0);
  if (won && run.odds >= 2) stats.underdogWins = (stats.underdogWins || 0) + 1;
  if (run.side) {
    const code = run.side === 'home' ? run.match.home : run.match.away;
    stats.teamCounts = stats.teamCounts || {};
    stats.teamCounts[code] = (stats.teamCounts[code] || 0) + 1;
    stats.favoriteTeam = code;
  }
  state.data.wallet.coins = Math.max(0, state.data.wallet.coins + delta);

  const arenaBefore = arenaFor(state.data.trophies || 0);
  const trophyChange = trophyDelta(run.odds, won);
  state.data.trophies = Math.max(0, (state.data.trophies || 0) + trophyChange);
  const arenaAfter = arenaFor(state.data.trophies || 0);
  const arenaChanged = arenaBefore.key !== arenaAfter.key;
  if (arenaChanged) toast(i18n.t(arenaAfter.min > arenaBefore.min ? 'arenaUp' : 'arenaDown', { arena: arenaName(arenaAfter) }));

  const dailyEligible = run.market === 'winner' && canCompleteDaily(state.data, run.odds, won);
  let chestUpgrade = 0;
  if (dailyEligible) {
    const daily = completeDailyChallenge(state.data, todayKey());
    chestUpgrade = daily?.chestUpgrade || 0;
    toast(`${i18n.t('dailyChallenge')} · +100 🪙`);
  }

  let chestType = null;
  let slotFull = false;
  if (won) {
    chestType = chestTierForWin(stake, run.odds, stats.streak);
    if (chestUpgrade) chestType = upgradeChestTier(chestType, chestUpgrade);
    const added = addChest(state.data.chests.slots, chestType);
    if (added.ok) {
      startNextChest(state.data.chests.slots);
      if (!stats.bestChest || chestTierRank(chestType) > chestTierRank(stats.bestChest)) stats.bestChest = chestType;
    } else {
      slotFull = true;
      chestType = null;
      state.data.wallet.coins += 300;
    }
  }

  let tournamentEvent = null;
  if (state.data.tournament?.active) {
    if (won) {
      tournamentEvent = tournamentWin(state.data);
      if (tournamentEvent?.complete) {
        const added = addChest(state.data.chests.slots, 'gold');
        if (added.ok) startNextChest(state.data.chests.slots);
        else state.data.wallet.coins += 500;
        toast(i18n.t('tournamentComplete'));
      } else {
        toast(i18n.t('tournamentActive', { step: state.data.tournament.step, total: TOURNAMENT_WINS }));
      }
    } else {
      tournamentEvent = tournamentLoss(state.data);
      toast(i18n.t('tournamentFailed'));
    }
  }

  recordMission(state.data, 'match');
  if (won) {
    recordMission(state.data, 'win');
    if (run.odds >= 2) recordMission(state.data, 'underdogWin');
  }
  let xp = XP_MATCH + (won ? XP_WIN : 0);
  if (dailyEligible) xp += XP_DAILY_CHALLENGE;
  if (tournamentEvent?.advance) xp += XP_TOURNAMENT_STEP;
  if (tournamentEvent?.complete) xp += XP_TOURNAMENT_STEP + XP_TOURNAMENT_COMPLETE;
  awardPlayerXp(xp);
  recordHistory(state.data, {
    home: run.match.home, away: run.match.away, homeName: run.match.homeTeam.name, awayName: run.match.awayTeam.name,
    hs: summary.score.home, as: summary.score.away, pick: run.pick, pickText: pickLabel(run.match, run.market, run.pick), market: run.market, won,
    cashedOut: false, stake, odds: run.odds, delta, chest: chestType, slotFull
  });
  run.result = { type: 'final', won, delta, chestType, chestUpgrade, slotFull, tournamentEvent, arenaChanged, xp };
  const newAchievements = grantAchievements(state.data, state.cards);
  newAchievements.forEach(a => toast(i18n.t('newAchievement', { title: i18n.t(a.titleKey) })));
  save(state.data);
  renderAll();
  renderMatchResult(run);
  flushLevelUp();
  if (won) sfx.win(); else sfx.buzzer();
  if (navigator.vibrate) navigator.vibrate(won ? [20, 40, 20] : 30);
}

function renderMatchResult(run) {
  const result = run.result;
  if (!result) return;
  const stage = run.revealedStage;
  const summary = run.summary;
  const quarters = summary.quarters.slice(0, stage === 4 ? 4 : stage);
  const homeScore = quarters.reduce((sum, q) => sum + q.home, 0);
  const awayScore = quarters.reduce((sum, q) => sum + q.away, 0);
  $('matchHomeScore').textContent = String(homeScore);
  $('matchAwayScore').textContent = String(awayScore);
  $('matchQuarters').innerHTML = quarters.map((q, i) => `<span>Q${i + 1}<b>${q.home}–${q.away}</b></span>`).join('');
  const banner = $('matchResultBanner');
  banner.hidden = false;
  if (result.type === 'cashout') {
    banner.className = 'result-banner cashout';
    banner.innerHTML = `<b>${i18n.t('cashedOut')}</b><span>${i18n.t('cashedOutText')} · ${formatCoins(result.amount)} 🪙 · ${i18n.t('xpGain', { amount: result.xp })}</span>`;
    $('matchStatus').textContent = i18n.t('cashedOut');
  } else {
    banner.className = 'result-banner ' + (result.won ? 'win' : 'loss');
    banner.innerHTML = `<b>${i18n.t(result.won ? 'matchWin' : 'matchLoss')}</b>
      <span>${i18n.t(result.won ? 'pickCorrect' : 'pickWrong')} · ${i18n.t(result.won ? 'coinsEarned' : 'coinsLost')}: ${result.delta > 0 ? '+' : ''}${formatCoins(Math.abs(result.delta))} 🪙 · ${i18n.t('xpGain', { amount: result.xp })}</span>`;
    $('matchStatus').textContent = i18n.t('matchStatusFinal');
  }
  const top = summary.players.slice().sort((a, b) => b.pts - a.pts)[0];
  $('matchTop').hidden = false;
  $('matchTop').innerHTML = top ? `<small>${i18n.t('topPerformer')}</small><b>${top.name}</b><span>${top.pts} PTS · ${(top.orb || 0) + (top.drb || 0)} REB · ${top.ast || 0} AST</span>` : '';
  const reward = $('matchReward');
  reward.hidden = false;
  if (result.type === 'cashout') {
    reward.className = 'match-reward cashout';
    reward.innerHTML = `<span class="reward-chest">🪙</span><div><b>${formatCoins(result.amount)} 🪙</b><small>${i18n.t('cashedOutText')}</small></div>`;
  } else if (result.chestType) {
    reward.className = 'match-reward win';
    reward.innerHTML = `<span class="reward-chest">${CHEST_ICON[result.chestType]}</span><div><b>${chestName(result.chestType)}</b><small>${result.chestUpgrade ? i18n.t('chestUpgraded') + ' · ' : ''}${i18n.t('chestWon')}</small></div>`;
  } else {
    reward.className = 'match-reward ' + (result.won ? 'win' : 'loss');
    reward.innerHTML = `<span class="reward-chest">${result.won ? '🪙' : '💥'}</span><div><b>${i18n.t('matchReward')}</b><small>${result.won ? (result.slotFull ? i18n.t('noChestReward') : '') : i18n.t('coinsLost')}</small></div>`;
  }
  $('btnMatchSkip').hidden = true;
  $('cashoutPanel').hidden = true;
  $('btnMatchAgain').hidden = false;
  $('btnMatchChests').hidden = false;
  $('btnMatchShare').hidden = false;
}

function closeMatchModal(fresh = true) {
  if (state.matchRun && !state.matchRun.settled) settleFinal(state.matchRun);
  closeModal('matchModal');
  state.matchRun = null;
  if (fresh) {
    newMatchups();
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
  if (chest.tutorial && displayCards[0]) {
    for (let i = 0; i < 2; i += 1) {
      const result = addCard(state.data.collection, displayCards[0].id);
      if (result.status === 'max') overflowCoins += result.coins || 0;
    }
    const entry = state.data.collection[displayCards[0].id];
    displayCards[0].level = entry ? entry.level : 1;
    toast(i18n.t('tutorialBonus'));
  }
  const setReward = claimSetRewards(state.data.collection, state.cards, state.data.setsClaimed);
  state.data.wallet.coins += rewards.coins + overflowCoins + setReward.coins;
  state.data.chests.pity = rewards.pity;
  state.data.chests.opened = (state.data.chests.opened || 0) + 1;
  state.data.stats.chestsOpened = state.data.chests.opened;
  state.data.stats.coinsEarned = (state.data.stats.coinsEarned || 0) + rewards.coins + overflowCoins + setReward.coins;
  recordMission(state.data, 'chest');
  awardPlayerXp(XP_CHEST);
  const openedCount = state.data.chests.opened;
  if (openedCount > 0 && openedCount % 10 === 0) {
    const rarity = openedCount % 40 === 0 ? 'epic' : 'rare';
    state.data.wildcards[rarity] = (state.data.wildcards[rarity] || 0) + 1;
    toast(`${i18n.t('milestone')}: +1 ${i18n.t(rarity)} ${i18n.t('wildcards')}`);
  }
  if (setReward.coins) toast(i18n.t('setComplete', { coins: formatCoins(setReward.coins) }));
  if (!state.data.lineup.slots.some(Boolean) && Object.keys(state.data.collection).length) {
    state.data.lineup.slots = autoFill(state.data.collection, state.cardIndex, unlockedSlots(state.data.trophies || 0));
    toast(i18n.t('lineupAutoFilled'));
  }
  const newAchievements = grantAchievements(state.data, state.cards);
  newAchievements.forEach(a => toast(i18n.t('newAchievement', { title: i18n.t(a.titleKey) })));
  save(state.data);
  renderAll();
  openChestModal({
    tier,
    cards: displayCards,
    coins: rewards.coins + overflowCoins + setReward.coins,
    xp: XP_CHEST,
    sfx,
    i18n,
    onDone: () => { renderAll(); save(state.data); flushLevelUp(); }
  });
}

function speedUpSlot() {
  const result = speedUpChest(state.data.chests.slots, state.data.wallet.coins);
  if (!result.ok) { toast(i18n.t('noCoins')); return; }
  state.data.wallet.coins = result.coins;
  state.data.stats.coinsSpent = (state.data.stats.coinsSpent || 0) + result.cost;
  save(state.data);
  renderAll();
  if (result.cost) toast(`-${formatCoins(result.cost)} 🪙`);
  sfx.init();
  sfx.chest('click');
}

function openCardModal(id) {
  const card = state.cardIndex[id];
  if (!card) return;
  const entry = state.data.collection[id];
  state.openCardId = id;
  if (entry && entry.isNew) {
    entry.isNew = false;
    save(state.data);
    renderCards();
  }
  $('cardModal').style.setProperty('--rarity', RARITIES[card.rarity].color);
  $('detailImg').src = miniAvatarUrl(card, { color: card.teamColor }, 200);
  $('detailImg').alt = card.name;
  $('detailRarity').className = 'rarity-pill rarity-' + card.rarity;
  $('detailRarity').textContent = i18n.t(card.rarity);
  $('detailRarity').style.color = RARITIES[card.rarity].color;
  $('detailName').textContent = card.name;
  $('detailTeam').textContent = `${card.teamName} · ${card.pos} · ${card.age}`;
  const level = entry ? entry.level : 0;
  $('detailOvr').textContent = String(card.ovr);
  $('detailLevel').textContent = entry ? String(level) : '—';
  $('detailPower').textContent = String(entry ? cardPower(card, level) : card.ovr);
  $('detailCopies').textContent = entry ? `${entry.copies}/${level >= MAX_LEVEL ? '—' : copiesNeeded(level)}` : '—';
  const avg = seasonAverage(card);
  $('detailAverages').innerHTML = [['statPts', avg.pts], ['statReb', avg.reb], ['statAst', avg.ast]]
    .map(([key, value]) => `<span class="stat-chip">${i18n.t(key)} <b>${value}</b></span>`).join('');
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
    btn.textContent = !enoughCopies ? i18n.t('needCopies', { need: needCopies })
      : !enoughCoins ? i18n.t('needCoins', { need: formatCoins(needCoins) }) : i18n.t('upgrade');
  }
  const wildcardCount = entry ? (state.data.wildcards[card.rarity] || 0) : 0;
  $('btnUseWildcard').hidden = !entry || wildcardCount <= 0;
  $('btnShareCard').hidden = !entry;
  openModal('cardModal');
}

function upgradeOpenCard() {
  if (!state.openCardId) return;
  const id = state.openCardId;
  const result = upgradeCard(state.data.collection, id, state.data.wallet.coins);
  if (!result.ok) { toast(result.reason === 'max' ? i18n.t('maxLevel') : i18n.t('cardUpgradeError')); return; }
  state.data.wallet.coins = result.coins;
  state.data.stats.upgrades = (state.data.stats.upgrades || 0) + 1;
  state.data.stats.coinsSpent = (state.data.stats.coinsSpent || 0) + (result.needCoins || 0);
  recordMission(state.data, 'upgrade');
  grantAchievementsAndNotify();
  save(state.data);
  sfx.init();
  sfx.chest('click');
  renderAll();
  openCardModal(id);
  toast(i18n.t('cardUpgradeSuccess', { level: result.level }));
}

function useWildcardOnOpen() {
  if (!state.openCardId) return;
  const card = state.cardIndex[state.openCardId];
  const result = useWildcard(state.data, state.openCardId, state.cardIndex, state.data.collection);
  if (!result.ok) { toast(i18n.t('noWildcard')); return; }
  const added = addCard(state.data.collection, state.openCardId);
  if (added.status === 'max' && added.coins) state.data.wallet.coins += added.coins;
  save(state.data);
  renderAll();
  openCardModal(state.openCardId);
  toast(i18n.t('wildcardAdded'));
  sfx.chest('click');
  grantAchievementsAndNotify();
  save(state.data);
}

function openLineupPicker(index) {
  const unlocked = unlockedSlots(state.data.trophies || 0);
  if (index >= unlocked) return;
  state.lineupSlot = index;
  state.lineupSearch = '';
  $('lineupPickerTitle').textContent = i18n.t('chooseCard');
  renderLineupPicker();
  openModal('lineupPickerModal');
}

function renderLineupPicker() {
  const query = (state.lineupSearch || '').toLowerCase().trim();
  const owned = Object.keys(state.data.collection)
    .map(id => state.cardIndex[id])
    .filter(card => card && (!query || card.name.toLowerCase().includes(query)))
    .sort((a, b) => {
      const ae = state.data.collection[a.id];
      const be = state.data.collection[b.id];
      return cardPower(b, be.level) - cardPower(a, ae.level);
    });
  const shown = owned.slice(0, 60);
  $('lineupPickerGrid').innerHTML = owned.length
    ? shown.map(card => {
      const entry = state.data.collection[card.id];
      return `<button class="lineup-pick ${state.data.lineup.slots.includes(card.id) ? 'used' : ''}" type="button" data-lineup-card="${card.id}" style="--rarity:${RARITIES[card.rarity].color};--team:${card.teamColor}">
        <img src="${miniAvatarUrl(card, { color: card.teamColor }, 96)}" alt="${card.name}">
        <b>${card.name}</b><small>${card.pos} · Lv${entry.level} · ${cardPower(card, entry.level)}</small>
      </button>`;
    }).join('') + (owned.length > 60 ? `<p class="empty-state lineup-more">${i18n.t('searchMoreHint')}</p>` : '')
    : `<p class="empty-state">${i18n.t('noOwnedCards')}</p>`;
}

function chooseLineupCard(cardId) {
  const slots = [...(state.data.lineup.slots || [])];
  const existing = slots.indexOf(cardId);
  if (existing >= 0) slots[existing] = null;
  slots[state.lineupSlot] = cardId;
  state.data.lineup.slots = sanitizeLineup(slots, state.data.collection, state.cardIndex, unlockedSlots(state.data.trophies || 0));
  save(state.data);
  closeModal('lineupPickerModal');
  renderAll();
}

function autoFillLineup() {
  if (!Object.keys(state.data.collection).length) { toast(i18n.t('noOwnedCards')); return; }
  state.data.lineup.slots = autoFill(state.data.collection, state.cardIndex, unlockedSlots(state.data.trophies || 0));
  save(state.data);
  renderAll();
  toast(i18n.t('saved'));
}

function claimMissionReward(period, id) {
  const reward = claimMission(state.data, period, id);
  if (!reward) return;
  applyReward(state.data, reward);
  awardPlayerXp(XP_MISSION);
  save(state.data);
  renderAll();
  toast(i18n.t('missionComplete', { reward: rewardText(reward) }));
  flushLevelUp();
}

function claimDailyBonusReward() {
  const reward = claimDailyBonus(state.data);
  if (!reward) return;
  applyReward(state.data, reward);
  awardPlayerXp(XP_DAILY_BONUS);
  save(state.data);
  renderAll();
  toast(i18n.t('missionComplete', { reward: rewardText(reward) }));
  flushLevelUp();
}

function claimAllMissions() {
  const total = { coins: 0, wildcards: {} };
  let missionCount = 0;
  let bonusClaimed = false;
  for (const [period, list] of [['daily', DAILY_MISSIONS], ['weekly', WEEKLY_MISSIONS]]) {
    for (const mission of list) {
      const reward = claimMission(state.data, period, mission.id);
      if (!reward) continue;
      applyReward(state.data, reward);
      missionCount += 1;
      total.coins += reward.coins || 0;
      for (const [rarity, amount] of Object.entries(reward.wildcards || {})) {
        total.wildcards[rarity] = (total.wildcards[rarity] || 0) + amount;
      }
    }
  }
  if (dailyBonusAvailable(state.data)) {
    const bonus = claimDailyBonus(state.data);
    if (bonus) {
      applyReward(state.data, bonus);
      bonusClaimed = true;
      total.coins += bonus.coins || 0;
      for (const [rarity, amount] of Object.entries(bonus.wildcards || {})) {
        total.wildcards[rarity] = (total.wildcards[rarity] || 0) + amount;
      }
    }
  }
  if (!missionCount && !bonusClaimed) { toast(i18n.t('noRewards')); return; }
  awardPlayerXp(missionCount * XP_MISSION + (bonusClaimed ? XP_DAILY_BONUS : 0));
  save(state.data);
  renderAll();
  toast(i18n.t('missionComplete', { reward: rewardText(total) }));
  flushLevelUp();
}

function claimTrophyRoadRewards() {
  const result = claimTrophyRoad(state.data);
  if (!result.claimed.length) { toast(i18n.t('noRewards')); return; }
  applyReward(state.data, result);
  save(state.data);
  renderAll();
  toast(i18n.t('trophyRoadClaimed', { coins: formatCoins(result.coins) }));
}

function startTournamentRun() {
  const arena = arenaFor(state.data.trophies || 0);
  if (!arena.tournament) { toast(i18n.t('unlocksAt', { arena: arenaName(ARENAS[1]) })); return; }
  if ((state.data.wallet.coins || 0) < TOURNAMENT_ENTRY + STAKE_OPTIONS[0]) { toast(i18n.t('noCoins')); return; }
  const result = startTournament(state.data);
  if (!result.ok) { toast(result.reason === 'coins' ? i18n.t('noCoins') : i18n.t('tournamentActive', { step: 0, total: TOURNAMENT_WINS })); return; }
  state.data.stats.coinsSpent = (state.data.stats.coinsSpent || 0) + TOURNAMENT_ENTRY;
  save(state.data);
  renderAll();
  toast(i18n.t('tournamentStarted'));
}

function buyLab(index) {
  const result = buyLabOffer(state.data, index);
  if (!result.ok) { toast(result.reason === 'coins' ? i18n.t('noCoins') : i18n.t('sold')); return; }
  state.data.stats.coinsSpent = (state.data.stats.coinsSpent || 0) + result.offer.price;
  const added = addCard(state.data.collection, result.offer.cardId);
  if (added.status === 'max' && added.coins) state.data.wallet.coins += added.coins;
  const card = state.cardIndex[result.offer.cardId];
  const achievement = grantAchievements(state.data, state.cards);
  achievement.forEach(a => toast(i18n.t('newAchievement', { title: i18n.t(a.titleKey) })));
  save(state.data);
  renderAll();
  toast(`${card ? card.name : 'Card'}: ${added.status === 'new' ? i18n.t('cardNew') : i18n.t('cardCopy')}`);
  sfx.chest('click');
}

function claimLoginReward() {
  const result = claimLogin(state.data, todayKey());
  if (!result) { toast(i18n.t('loginClaimed')); return; }
  save(state.data);
  renderAll();
  toast(`${i18n.t('loginReward')}: ${loginRewardText(result.reward)}`);
}

function grantAchievementsAndNotify() {
  const unlocked = grantAchievements(state.data, state.cards);
  unlocked.forEach(a => toast(i18n.t('newAchievement', { title: i18n.t(a.titleKey) })));
  return unlocked;
}

function shareText(text) {
  if (!text) return;
  try {
    if (navigator.share) { navigator.share({ title: 'Court Clash', text }).catch(() => {}); return; }
    if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => toast(i18n.t('shareCopied'))).catch(() => {}); return; }
  } catch (e) { /* ignore */ }
  toast(text);
}

function shareMatch() {
  const run = state.matchRun;
  if (!run) return;
  const summary = run.summary;
  const score = run.result && run.result.type === 'cashout'
    ? cumulative(summary, run.pendingStage)
    : summary.score;
  const pick = pickLabel(run.match, run.market, run.pick);
  shareText(i18n.t('shareText', {
    home: run.match.homeTeam.name, hs: score.home, as: score.away, away: run.match.awayTeam.name, pick
  }));
}

function shareCard() {
  if (!state.openCardId) return;
  const card = state.cardIndex[state.openCardId];
  const entry = state.data.collection[state.openCardId];
  if (!card || !entry) return;
  shareText(`${card.name} · ${card.teamName} · ${i18n.t(card.rarity)} · Lv${entry.level} · ${cardPower(card, entry.level)} OVR`);
}

function shareProfile() {
  const stats = state.data.stats;
  const info = levelInfo(state.data.progress);
  shareText(`Court Clash · LV ${info.level} · 🏆 ${state.data.trophies || 0} · ${stats.wins || 0}W-${stats.losses || 0}L · ${Object.keys(state.data.collection).length}/300 cards`);
}

function renderAll() {
  ensuredDaily();
  renderHUD();
  renderPlay();
  renderChests();
  renderCards();
  renderProgress();
}

function applyLanguage() {
  i18n.setLang(state.data.settings.lang || i18n.lang);
  i18n.apply();
  populateFilters();
  updateSettings();
  renderAll();
}

function populateFilters() {
  const filter = $('filterTeam');
  const current = filter.value;
  filter.innerHTML = `<option value="">${i18n.t('allTeams')}</option>` +
    state.teams.map(team => `<option value="${team.code}">${team.name}</option>`).join('');
  filter.value = current;
}

function updateSettings() {
  $('settingsLang').value = i18n.lang;
  $('settingsSound').checked = state.data.settings.sound !== false;
  $('settingsFast').checked = state.data.settings.fastReveal === true;
  sfx.muted = state.data.settings.sound === false;
}

function bind() {
  document.querySelectorAll('.tabbar [data-screen]').forEach(btn => btn.addEventListener('click', () => setScreen(btn.dataset.screen)));
  document.querySelectorAll('[data-go]').forEach(btn => btn.addEventListener('click', () => setScreen(btn.dataset.go)));
  document.querySelectorAll('[data-cards-tab]').forEach(btn => btn.addEventListener('click', () => {
    state.cardsTab = btn.dataset.cardsTab;
    renderCards();
  }));
  $('matchupList').addEventListener('click', event => {
    const btn = event.target.closest('[data-match-index]');
    if (!btn) return;
    state.selectedMatch = Number(btn.dataset.matchIndex);
    state.pick = null;
    renderPlay();
  });
  $('marketTabs').addEventListener('click', event => {
    const btn = event.target.closest('[data-market]');
    if (!btn) return;
    state.market = btn.dataset.market;
    if (state.market !== 'winner') state.marketsExpanded = true;
    state.pick = null;
    renderPlay();
  });
  $('btnMoreMarkets').addEventListener('click', () => {
    state.marketsExpanded = true;
    renderPlay();
  });
  $('marketOptions').addEventListener('click', event => {
    const btn = event.target.closest('[data-pick]');
    if (!btn) return;
    state.pick = btn.dataset.pick;
    renderPlay();
  });
  document.querySelectorAll('[data-stake]').forEach(btn => btn.addEventListener('click', () => {
    state.stake = Number(btn.dataset.stake) || STAKE_OPTIONS[0];
    renderPlay();
  }));
  $('btnShuffle').addEventListener('click', () => { newMatchups(); renderPlay(); });
  $('btnBet').addEventListener('click', placeBet);
  $('btnTournament').addEventListener('click', startTournamentRun);
  $('btnQuickOpen').addEventListener('click', openChestFlow);
  $('btnGoal').addEventListener('click', handleGoalAction);
  $('chestSlots').addEventListener('click', event => {
    if (event.target.closest('[data-open]')) { openChestFlow(); return; }
    if (event.target.closest('[data-speed]')) speedUpSlot();
  });
  $('btnToggleFilters').addEventListener('click', () => {
    state.filtersOpen = !state.filtersOpen;
    updateFilterUI();
    renderCollectionPane();
  });
  ['cardSearch', 'filterRarity', 'filterSet', 'filterTeam', 'filterOwned', 'sortCards'].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', () => {
      state.cardLimit = 36;
      renderCollectionPane();
    });
  });
  $('btnMoreCards').addEventListener('click', () => { state.cardLimit += 36; renderCollectionPane(); });
  $('cardGrid').addEventListener('click', event => {
    const btn = event.target.closest('[data-card-id]');
    if (btn) openCardModal(btn.dataset.cardId);
  });
  $('lineupSlots').addEventListener('click', event => {
    const btn = event.target.closest('[data-slot]');
    if (btn) openLineupPicker(Number(btn.dataset.slot));
  });
  $('lineupPickerGrid').addEventListener('click', event => {
    const btn = event.target.closest('[data-lineup-card]');
    if (btn) chooseLineupCard(btn.dataset.lineupCard);
  });
  $('lineupSearch').addEventListener('input', event => {
    state.lineupSearch = event.target.value;
    renderLineupPicker();
  });
  $('btnClearSlot').addEventListener('click', () => {
    if (state.lineupSlot == null) return;
    state.data.lineup.slots[state.lineupSlot] = null;
    state.data.lineup.slots = sanitizeLineup(state.data.lineup.slots, state.data.collection, state.cardIndex, unlockedSlots(state.data.trophies || 0));
    save(state.data);
    closeModal('lineupPickerModal');
    renderAll();
  });
  $('btnAutoFill').addEventListener('click', autoFillLineup);
  $('labOffers').addEventListener('click', event => {
    const btn = event.target.closest('[data-buy-offer]');
    if (btn) buyLab(Number(btn.dataset.buyOffer));
  });
  $('btnLogin').addEventListener('click', claimLoginReward);
  $('screen-progress').addEventListener('click', event => {
    const mission = event.target.closest('[data-claim-mission]');
    if (mission) {
      const [period, id] = mission.dataset.claimMission.split(':');
      claimMissionReward(period, id);
      return;
    }
    if (event.target.closest('[data-claim-bonus]')) claimDailyBonusReward();
  });
  $('btnClaimTrophyRoad').addEventListener('click', claimTrophyRoadRewards);
  $('btnClaimAllMissions').addEventListener('click', claimAllMissions);
  $('btnToggleTrophyRoad').addEventListener('click', () => {
    state.trophyRoadExpanded = !state.trophyRoadExpanded;
    renderTrophyRoad();
  });
  $('btnShareProfile').addEventListener('click', shareProfile);

  $('btnCardClose').addEventListener('click', () => closeModal('cardModal'));
  $('btnUpgradeCard').addEventListener('click', upgradeOpenCard);
  $('btnUseWildcard').addEventListener('click', useWildcardOnOpen);
  $('btnShareCard').addEventListener('click', shareCard);
  $('btnLineupPickerClose').addEventListener('click', () => closeModal('lineupPickerModal'));

  $('btnMatchClose').addEventListener('click', () => closeMatchModal(true));
  $('btnMatchAgain').addEventListener('click', () => closeMatchModal(true));
  $('btnMatchChests').addEventListener('click', () => { closeMatchModal(true); setScreen('chests'); });
  $('btnMatchSkip').addEventListener('click', () => {
    const run = state.matchRun;
    if (!run) return;
    clearTimeout(run.timer);
    run.revealedStage = 4;
    renderReveal(run);
    settleFinal(run);
  });
  $('btnCashout').addEventListener('click', () => {
    const run = state.matchRun;
    if (!run || !run.pendingStage) return;
    const amount = cashOutOffer({ stake: run.stake, odds: run.odds, summary: run.summary, side: run.side, stage: run.pendingStage });
    if (amount) settleCashout(run, amount);
  });
  $('btnRide').addEventListener('click', () => {
    const run = state.matchRun;
    if (!run) return;
    $('cashoutPanel').hidden = true;
    run.pendingStage = null;
    advanceReveal(run);
  });
  $('btnMatchShare').addEventListener('click', shareMatch);

  $('btnLevelContinue').addEventListener('click', () => {
    closeModal('levelModal');
    flushLevelUp();
  });
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
    state.data.settings.lang = event.target.value;
    i18n.setLang(event.target.value);
    save(state.data);
    applyLanguage();
  });
  $('settingsSound').addEventListener('change', event => {
    state.data.settings.sound = event.target.checked;
    sfx.muted = !event.target.checked;
    if (event.target.checked) sfx.init();
    save(state.data);
  });
  $('settingsFast').addEventListener('change', event => {
    state.data.settings.fastReveal = event.target.checked;
    save(state.data);
  });
  $('btnReset').addEventListener('click', () => {
    if (!window.confirm(i18n.t('resetConfirm'))) return;
    state.data = reset();
    state.data.settings.lang = i18n.lang;
    state.matchups = [];
    state.cardsTab = 'collection';
    state.matchRun = null;
    state.filtersOpen = false;
    state.trophyRoadExpanded = false;
    state.marketsExpanded = false;
    state.levelUpQueue = [];
    ['filterRarity', 'filterSet', 'filterTeam', 'sortCards'].forEach(id => { if ($(id)) $(id).value = ''; });
    if ($('filterOwned')) $('filterOwned').value = 'owned';
    if ($('sortCards')) $('sortCards').value = 'power';
    if ($('cardSearch')) $('cardSearch').value = '';
    ensureData();
    newMatchups();
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
      if (modal.id === 'matchModal') { closeMatchModal(true); return; }
      if (modal.id === 'onboardingModal') {
        state.data.settings.onboarded = true;
        save(state.data);
        closeModal('onboardingModal');
        return;
      }
      closeModal(modal.id);
    });
  });
  document.addEventListener('keydown', event => {
    const modal = visibleModal();
    if (modal) {
      trapFocus(event);
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (modal.id === 'matchModal') closeMatchModal(true);
      else if (modal.id === 'onboardingModal') {
        state.data.settings.onboarded = true;
        save(state.data);
        closeModal('onboardingModal');
      } else closeModal(modal.id);
      return;
    }
    if (event.key === 'Escape') return;
  });
  window.addEventListener('hashchange', () => {
    const raw = location.hash.replace('#', '') || 'play';
    const next = raw === 'profile' ? 'progress' : raw;
    if (raw === 'profile') { setScreen('progress', true); return; }
    if (state.screen !== next) setScreen(next, false);
  });
  window.addEventListener('beforeunload', () => save(state.data));
}

function init() {
  buildTeams();
  i18n.apply();
  ensureData();
  populateFilters();
  bind();
  newMatchups();
  renderAll();
  updateSettings();
  const initial = location.hash.replace('#', '') || 'play';
  setScreen(initial, initial === 'profile');
  if (!state.data.settings.onboarded) openModal('onboardingModal');
  state.bootToasts.forEach(text => toast(text));
  setTimeout(() => {
    const lineup = lineupState();
    if (lineup.slots.some(Boolean) && state.data.settings.onboarded) {
      const missing = lineup.slots.filter(Boolean).length < lineup.unlocked;
      if (missing) toast(i18n.t('lineupNote'));
    }
  }, 800);
  setInterval(() => {
    const changed = startNextChest(state.data.chests.slots);
    if (changed) save(state.data);
    if (state.screen === 'chests') renderChests();
    else if (state.screen === 'play') renderNextChest();
  }, 1000);
  save(state.data);
}

init();
