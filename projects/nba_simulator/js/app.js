/* NBA Broadcast Simulator — application controller */

import { TEAMS, TEAM_BY_CODE } from './data/teams.js';
import { I18n } from './i18n.js';
import { load, save, appendHistory, recordPrediction, grantXP, defaults } from './core/storage.js';
import { seededRandom, dailySeed } from './core/rng.js';
import { Sim, simulateGame } from './sim/engine.js';
import { RARITIES, rarityFor, chestReward } from './sim/career-mode.js';
import { newSeason, playWeek, playAll, standingsSorted } from './sim/season.js';
import { createBracket, playRound } from './sim/playoffs.js';
import { freeAgents, signPlayer, trade, draftClass, progressRoster } from './sim/career.js';
import { leaders, efficiency, trueShooting, effectiveFG, teamTotals } from './sim/stats.js';
import { emptyChart, quarterChart, progressionChart, shotChart, comparisonChart } from './ui/charts.js';
import { createCourtGL } from './render/court-gl.js';
import { createCourt2D } from './render/court-2d.js';
import { createArena } from './render/arena.js';
import { createReplayPlayer } from './ui/replay.js';
import { revealChest } from './ui/chest-reveal.js';
import { captureReplay, trimReplays, detectHighlights } from './sim/replay.js';
import { SETS, cardSet, fragmentsFor, upgradeCost, applyUpgrade, isDailyChestAvailable, claimDailyChest, setProgress, cardPower, pullOdds, pityPull, craftCost, craftPlayer, setBonus } from './sim/cards.js';
import { winOdds, payout, applyBet, claimDailyCredits, streakBonus, propMarket, propOdds, resolveProp, parlayOdds, resolveParlay } from './sim/betting.js';
import { aiOffer, sellDuplicate } from './sim/market.js';
import { CHEST_TYPES, buyChest, activeChest, isReady, speedUpChest, openChest, speedUpCost, timeLeft, formatTime, enforceMinTier } from './sim/chest-shop.js';
import { addCopies, copiesNeeded, creditsNeeded, upgradeWithCopies } from './sim/cards.js';
import { normalizeDeck, deckSynergy, DECK_SIZE } from './sim/deck.js';
import { normalizeSquad, squadRating, chemistry, squadReady, TEMPLATES, STARTERS, BENCH } from './sim/squad.js';
import { newClubLeague, playClubGame, clubStandings, promote, TIERS, CLUB_CODE } from './sim/club-league.js';
import { createCup, playCupRound } from './sim/cup.js';
import { grantWildcard, useWildcard, checkChallenges, WILDCARDS } from './sim/wildcards.js';
import { createAvatar } from './render/avatar.js';
import { miniAvatarUrl } from './render/mini-avatar.js';
import { applyTeamTheme, rarityColor, teamGradient, shade } from './core/theme.js';
import { Sfx } from './audio.js';
import { enrichTeams, playerProfile } from './data/player-profile.js';
import { seasonAverage, advancedProjection } from './data/player-stats.js';
import { playerNotes } from './data/player-notes.js';
import { recordPlayerStats } from './core/storage.js';

const $ = id => document.getElementById(id);
const i18n = new I18n();
const sfx = new Sfx();
const persistence = load();

const state = {
  data: persistence,
  teams: enrichTeams(TEAMS.map(t => JSON.parse(JSON.stringify(t))).concat(persistence.customTeams || [])),
  teamMap: {},
  sim: null,
  renderer: null,
  view: 'match',
  sub: { season: 'season', team: 'teams', explore: 'stats' },
  cardPane: 'collection',
  matchPhase: 'setup',
  speed: 1,
  paused: false,
  lastFrame: 0,
  accumulator: 0,
  lastSummary: null,
  lastResult: null,
  rng: Math.random,
  free: [],
  worker: null,
  avatar: null,
  avatarFrame: 0,
  openPlayer: null,
  openTeam: null,
  playerLimit: 60,
  playerViewMode: 'grid',
  cameraMode: 'broadcast',
  replayPlayer: null,
  replayData: null,
  betType: 'winner',
  stake: 10,
  parlayGames: [],
  tourStep: 0,
  lastFocus: null,
  toastTimer: null,
  resetting: false
};

function teamByCode(code) {
  return state.teamMap[code] || state.teams.find(t => t.code === code) || TEAM_BY_CODE[code];
}
function rebuildMap() { state.teamMap = Object.fromEntries(state.teams.map(t => [t.code, t])); }

function toast(text) {
  const el = $('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

function openModal(id) {
  const modal = $(id);
  if (!modal) return;
  state.lastFocus = document.activeElement;
  modal.hidden = false;
  modal.setAttribute('aria-modal', 'true');
  const focusable = modal.querySelector('button, [href], select, input, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable) setTimeout(() => focusable.focus(), 30);
}

function closeModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.hidden = true;
  if (state.lastFocus && typeof state.lastFocus.focus === 'function') state.lastFocus.focus();
  state.lastFocus = null;
}

function visibleModal() {
  return [...document.querySelectorAll('.modal')].find(m => !m.hidden && m.id !== 'chestModal') || null;
}

function trapFocus(event) {
  if (event.key !== 'Tab') return;
  const modal = visibleModal();
  if (!modal) return;
  const items = [...modal.querySelectorAll('button, [href], select, input, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.disabled && el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

function fmtClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function initSelects() {
  ['selHome', 'selAway'].forEach(id => {
    const el = $(id);
    el.innerHTML = state.teams.map(t => `<option value="${t.code}">${t.name}</option>`).join('');
  });
  const team = $('teamSelect');
  team.innerHTML = state.teams.map(t => `<option value="${t.code}">${t.name}</option>`).join('');
  $('selHome').value = state.data.matchup.home || 'BOS';
  $('selAway').value = state.data.matchup.away || 'LAL';
  $('selPred').value = state.data.matchup.prediction || 'home';
  const options = state.teams.map(t => `<option value="${t.code}">${t.name}</option>`).join('');
  ['guessHome', 'guessAway'].forEach(id => { const el = $(id); if (el) el.innerHTML = options; });
  if ($('guessHome')) $('guessHome').value = $('selHome').value;
  if ($('guessAway')) $('guessAway').value = $('selAway').value;
  const teamFilter = $('playerTeam');
  if (teamFilter) teamFilter.innerHTML = `<option value="">${i18n.t('allTeams')}</option>` + options;
  renderMatchupMeta();
}

const VIEWS = {
  match: { views: ['match'], subs: [] },
  season: { views: ['season', 'playoffs'], subs: ['season', 'playoffs'] },
  team: { views: ['teams', 'career'], subs: ['teams', 'career'] },
  explore: { views: ['stats', 'players'], subs: ['stats', 'players'] },
  cards: { views: ['cards'], subs: [] }
};

const SUB_NAV = { season: 'seasonSubnav', team: 'teamSubnav', explore: 'exploreSubnav' };
const LEGACY_VIEW = { league: 'season', franchise: 'team', stats: 'explore', players: 'explore', club: 'cards' };

function activeSub(view) {
  const config = VIEWS[view] || VIEWS.match;
  return config.subs.length ? (config.subs.includes(state.sub[view]) ? state.sub[view] : config.subs[0]) : config.views[0];
}

function syncUrl(view, sub, mode = 'none') {
  if (mode === 'none') return;
  try {
    const url = new URL(location.href);
    url.searchParams.set('view', view);
    if (sub) url.searchParams.set('sub', sub); else url.searchParams.delete('sub');
    url.hash = '';
    history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url);
  } catch (e) { /* ignore */ }
}

function switchView(view, sub, options = {}) {
  const config = VIEWS[view] || VIEWS.match;
  state.view = view;
  if (sub && config.subs.includes(sub)) state.sub[view] = sub;
  const active = activeSub(view);
  if (config.subs.length) state.sub[view] = active;
  document.querySelectorAll('.view').forEach(el => {
    const name = el.id.replace(/^view-/, '');
    const inGroup = config.views.includes(name);
    el.hidden = !(inGroup && (config.views.length === 1 || name === active));
  });
  document.querySelectorAll('.tabbar button').forEach(b => {
    const on = b.dataset.view === view;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  Object.entries(SUB_NAV).forEach(([group, id]) => {
    const el = $(id);
    if (el) el.hidden = view !== group;
  });
  document.querySelectorAll('[data-sub]').forEach(b => b.classList.toggle('active', config.subs.includes(b.dataset.sub) && b.dataset.sub === active));

  if (view === 'match' && state.renderer) resizeCourt();
  if (view === 'season') { if (active === 'season') renderSeason(); else renderPlayoffs(); }
  if (view === 'team') { if (active === 'teams') renderTeams(); else renderCareer(); }
  if (view === 'explore') { if (active === 'stats') renderStats(); else renderPlayers(); }
  if (view === 'cards') renderCards();
  syncUrl(view, config.subs.length ? active : null, options.url || 'none');
  if (options.scroll !== false) window.scrollTo(0, 0);
}

function navigate(view, sub) {
  switchView(view, sub, { url: 'push' });
}

function parseRoute() {
  const params = new URLSearchParams(location.search);
  const rawView = params.get('view') || 'match';
  let view = VIEWS[rawView] ? rawView : (LEGACY_VIEW[rawView] || 'match');
  let sub = params.get('sub') || null;
  if (rawView === 'players') sub = 'players';
  if (!sub && rawView === 'league') sub = 'season';
  if (!sub && rawView === 'franchise') sub = 'teams';
  return { view, sub };
}

function resizeCourt() {
  const wrap = $('courtWrap');
  if (!wrap) return;
  const dpr = state.data.settings.quality === 'low' ? 1 : Math.min(2, window.devicePixelRatio || 1);
  if (state.renderer) state.renderer.resize(wrap.clientWidth, wrap.clientHeight, dpr);
}

function teamOverall(team) {
  if (!team || !team.players || !team.players.length) return 0;
  return Math.round(team.players.reduce((sum, p) => sum + (p.ovr || 0), 0) / team.players.length);
}

function renderMatchupMeta() {
  const home = teamByCode($('selHome')?.value);
  const away = teamByCode($('selAway')?.value);
  const meta = team => team ? `${team.conference} · ${team.division} · ${i18n.t('ovr')} ${teamOverall(team)}` : '';
  if ($('homeMeta')) $('homeMeta').textContent = meta(home);
  if ($('awayMeta')) $('awayMeta').textContent = meta(away);
}

function ensureDailyState() {
  const today = new Date().toDateString();
  if (!state.data.daily || state.data.daily.last !== today) {
    state.data.daily = { last: today, wins: 0, games: 0, correct: 0 };
  }
  state.data.daily.games = state.data.daily.games || 0;
  state.data.daily.correct = state.data.daily.correct || 0;
  return state.data.daily;
}

function setMatchPhase(phase) {
  state.matchPhase = phase;
  const setup = $('matchSetup');
  const live = $('matchLive');
  if (setup) setup.hidden = phase !== 'setup';
  if (live) live.hidden = phase === 'setup';
  if ($('quickLinks')) $('quickLinks').hidden = phase !== 'setup';
  const final = phase === 'final';
  if ($('btnPause')) $('btnPause').hidden = final;
  if ($('btnSimEnd')) $('btnSimEnd').hidden = final;
  if ($('speedGroup')) $('speedGroup').hidden = final;
  document.querySelectorAll('[data-speed]').forEach(b => { b.disabled = final; });
  if ($('liveBadge')) {
    $('liveBadge').textContent = i18n.t(final ? 'final' : 'live');
    $('liveBadge').classList.toggle('is-final', final);
    $('liveBadge').setAttribute('data-i18n', final ? 'final' : 'live');
  }
  if (final && $('clutch')) $('clutch').hidden = true;
  if (!final) {
    document.querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('active', Number(b.dataset.speed) === state.speed));
  }
}

function animate(now) {
  requestAnimationFrame(animate);
  if (!state.sim || state.paused || state.view !== 'match' || state.matchPhase !== 'live') return;
  const dt = Math.min(100, now - (state.lastFrame || now));
  state.lastFrame = now;
  state.accumulator += dt * state.speed;
  let guard = 0;
  let stepped = false;
  while (state.accumulator >= 180 && !state.sim.finished && guard < 12) {
    state.sim.step();
    state.accumulator -= 180;
    guard += 1;
    stepped = true;
  }
  if (stepped) renderMatch();
  else drawCourt(now);
  if (state.sim.finished) finalizeMatch();
}

function courtState() {
  const sim = state.sim;
  const players = [];
  for (const side of ['home', 'away']) {
    sim.onCourt[side].forEach(id => {
      const p = sim.players[id];
      if (p) players.push({ ...p, side });
    });
  }
  const shot = sim.shots[sim.shots.length - 1];
  return {
    players,
    homeColor: sim.teams.home.color,
    awayColor: sim.teams.away.color,
    ball: shot ? { x: shot.x / 500, y: shot.y / 500 } : { x: 0.5, y: 0.5 },
    lastShot: shot ? { key: String(sim.shots.length), player: shot.player, side: shot.side, made: shot.made } : null
  };
}

function makeRenderer() {
  const canvas = $('court');
  if ((state.data.settings.quality || 'high') === 'high') {
    const arena = createArena(canvas);
    if (arena) return arena;
  }
  return createCourtGL(canvas) || createCourt2D(canvas);
}

function drawCourt(now) {
  if (!state.renderer) return;
  const s = courtState();
  if (state.renderer.kind === 'arena') {
    state.renderer.setState(s, now);
    state.renderer.render(now);
  } else {
    state.renderer.draw(s, now);
  }
}

function renderMatch() {
  const sim = state.sim;
  if (!sim) return;
  $('scoreHome').textContent = sim.score.home;
  $('scoreAway').textContent = sim.score.away;
  $('homeAbbr').textContent = sim.teams.home.abbr;
  $('awayAbbr').textContent = sim.teams.away.abbr;
  $('homeName').textContent = sim.teams.home.name;
  $('awayName').textContent = sim.teams.away.name;
  $('quarter').textContent = sim.overtime ? `OT${sim.overtime}` : `Q${sim.quarter}`;
  $('clock').textContent = fmtClock(sim.clock);
  $('poss').textContent = sim.possession === 'home' ? sim.teams.home.abbr : sim.teams.away.abbr;
  const lead = sim.momentum >= 0 ? sim.teams.home.abbr : sim.teams.away.abbr;
  $('momentum').textContent = `${i18n.t('momentum')} ${sim.momentum >= 0 ? '+' : ''}${Math.round(sim.momentum)} · ${lead}`;
  $('clutch').hidden = !sim.clutch || state.matchPhase === 'final';
  const feed = $('feed');
  const recent = sim.events.slice(-40).reverse();
  feed.innerHTML = recent.length
    ? recent.map(e => `<div><span>${fmtClock(e.clock)}</span>${e[i18n.lang === 'en' ? 'en' : 'it']}</div>`).join('')
    : `<div class="empty-inline">${i18n.t('tipoffHint')}</div>`;
  renderBox(sim);
  drawCourt(performance.now());
}

function renderBox(sim) {
  const heads = ['pts', 'reb', 'ast', 'stl', 'blk', 'to', 'fgm', 'fga', 'tpm', 'ts', 'efg', 'eff'];
  const rows = Object.values(sim.players).filter(p => p.minutes > 0).sort((a, b) => b.pts - a.pts);
  const body = rows.map(p => `<tr data-player-id="${p.id}"><td>${p.name}</td>` + heads.map(k => {
    const v = k === 'ts' || k === 'efg' ? (k === 'ts' ? trueShooting(p) : effectiveFG(p)) : k === 'eff' ? efficiency(p) : (p.reb = p.orb + p.drb, p[k]);
    return `<td>${typeof v === 'number' && k !== 'fgm' && k !== 'fga' && k !== 'tpm' ? v.toFixed(2) : (v || 0)}</td>`;
  }).join('') + '</tr>').join('');
  $('boxBody').innerHTML = rows.length
    ? `<table><thead><tr><th>${i18n.t('player')}</th>${heads.map(h => `<th>${h.toUpperCase()}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`
    : `<p class="empty-inline">${i18n.t('boxEmpty')}</p>`;
}

function startMatch() {
  const home = teamByCode($('selHome').value);
  const away = teamByCode($('selAway').value);
  if (!home || !away || home.code === away.code) { toast(i18n.t('selectTwo')); return; }
  if (!state.data.settings.onboarded) markOnboarded();
  if ($('welcomeModal') && !$('welcomeModal').hidden) closeModal('welcomeModal');
  const daily = ensureDailyState();
  const seed = (Date.now() ^ ((daily.games || 0) * 7919)) >>> 0;
  daily.last = new Date().toDateString();
  state.rng = seededRandom(seed);
  state.sim = new Sim(home, away, { rng: state.rng, lang: i18n.lang });
  state.lastSummary = null;
  state.lastResult = null;
  state.paused = false;
  state.accumulator = 0;
  state.lastFrame = 0;
  $('resultCard').hidden = true;
  $('finalDetails').innerHTML = '';
  $('feed').innerHTML = '';
  $('boxBody').innerHTML = '';
  $('boxDetails').open = false;
  $('btnPause').textContent = i18n.t('pause');
  $('btnPause').classList.add('primary');
  $('extraControls').hidden = true;
  $('btnMoreControls').textContent = i18n.t('moreActions');
  $('btnMoreControls').setAttribute('aria-expanded', 'false');
  setMatchPhase('live');
  sfx.init();
  if (!state.renderer) state.renderer = makeRenderer();
  resizeCourt();
  renderMatch();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderFinal() {
  const result = state.lastResult;
  if (!result) return;
  const { summary, correct, xp, fragments } = result;
  const home = teamByCode(summary.home);
  const away = teamByCode(summary.away);
  const top = leaders(summary.players, 'pts', 3);
  $('finalText').textContent = `${home ? home.name : summary.home} ${summary.score.home} – ${summary.score.away} ${away ? away.name : summary.away}`;
  $('finalDetails').innerHTML = `
    <div class="final-summary">
      <span class="final-pick ${correct ? 'good' : 'bad'}">${correct ? i18n.t('pickCorrect') : i18n.t('pickMissed')}</span>
      <span>${i18n.t('rewards')} <b>+${xp} XP</b> · <b>+${fragments} ${i18n.t('fragments')}</b></span>
    </div>
    <h3>${i18n.t('topPerformers')}</h3>
    <div class="top-performers">
      ${top.map(p => `<button class="top-player" type="button" data-player-id="${p.id}"><b>${p.name}</b><span>${p.pts} PTS · ${(p.orb || 0) + (p.drb || 0)} REB · ${p.ast || 0} AST</span></button>`).join('')}
    </div>`;
  $('resultCard').hidden = false;
}

function finalizeMatch() {
  if (state.lastSummary) return;
  const sim = state.sim;
  const summary = sim.summary();
  state.lastSummary = summary;
  const pick = $('selPred').value;
  const correct = recordPrediction(state.data, pick, summary.winner);
  const daily = ensureDailyState();
  daily.games += 1;
  if (correct) daily.correct += 1;
  appendHistory(state.data, {
    home: summary.home, away: summary.away, hs: summary.score.home, as: summary.score.away,
    winner: summary.winner, top: leaders(summary.players, 'pts', 1)[0] || {},
    events: summary.events.slice(-80).map(e => ({ it: e.it, en: e.en, clock: e.clock, kind: e.kind })),
    summary: { quarters: summary.quarters, leadChanges: summary.leadChanges }
  });
  const xp = correct ? 30 : 10;
  const fragments = correct ? 3 : 1;
  grantXP(state.data, xp, 'match');
  recordPlayerStats(state.data, summary.players);
  state.data.replays = trimReplays([...(state.data.replays || []), captureReplay(sim)], 5);
  state.data.career.fragments = (state.data.career.fragments || 0) + fragments;
  state.data.matchup = { home: summary.home, away: summary.away, prediction: pick };
  state.lastResult = { summary, correct, xp, fragments };
  setMatchPhase('final');
  save(state.data);
  renderFinal();
  renderHUD();
  sfx.win();
  toast(correct ? i18n.t('pickCorrect') : i18n.t('pickMissed'));
  setTimeout(() => {
    if (state.matchPhase === 'final' && state.view === 'match' && $('resultCard')) $('resultCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 120);
}

function newMatch() {
  state.sim = null;
  state.lastSummary = null;
  state.lastResult = null;
  state.paused = true;
  state.accumulator = 0;
  state.lastFrame = 0;
  $('resultCard').hidden = true;
  $('finalDetails').innerHTML = '';
  $('feed').innerHTML = '';
  $('boxBody').innerHTML = '';
  $('boxDetails').open = false;
  setMatchPhase('setup');
  renderMatchupMeta();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function ensureSeason() {
  if (!state.data.league) state.data.league = newSeason(dailySeed(), seededRandom(dailySeed()));
  return state.data.league;
}

function renderSeason() {
  const season = ensureSeason();
  $('seasonWeek').textContent = `${i18n.t('week')} ${season.week + 1} / ${season.schedule.length}`;
  const groups = [['East', standingsSorted(season, 'East')], ['West', standingsSorted(season, 'West')]];
  $('standingsBody').innerHTML = groups.map(([conf, list]) => `<h4>${conf}</h4><table><thead><tr><th>#</th><th>${i18n.t('team')}</th><th>W</th><th>L</th><th>DIFF</th></tr></thead><tbody>` +
    list.slice(0, 10).map((t, i) => `<tr><td>${i + 1}</td><td>${teamByCode(t.code).name}</td><td>${t.w}</td><td>${t.l}</td><td>${t.pf - t.pa}</td></tr>`).join('') + '</tbody></table>').join('');
  $('seasonResults').innerHTML = season.results.slice(-12).reverse().map(r => `<div class="result-row"><span>${teamByCode(r.home)?.name || r.home}</span><b>${r.hs}–${r.as}</b><span>${teamByCode(r.away)?.name || r.away}</span></div>`).join('') || `<p class="empty-inline">${i18n.t('noGames')}</p>`;
}

function renderPlayoffs() {
  const b = state.data.playoffs;
  if (!b) {
    $('bracket').innerHTML = `<p class="empty-inline">${i18n.t('noBracket')}</p>`;
    $('champion').textContent = '';
    return;
  }
  $('bracket').innerHTML = b.rounds.filter(r => r.matchups.length).map(r => `<h4>${r.name}</h4>` +
    r.matchups.map(m => `<div class="series"><span>${m.a} ${m.wins[0]}–${m.wins[1]} ${m.b}</span><span>${m.winner || '—'}</span></div>`).join('')).join('');
  $('champion').textContent = b.champion ? `🏆 ${b.champion}` : '';
}

function renderTeams() {
  const team = teamByCode($('teamSelect').value) || state.teams[0];
  if (!team) return;
  const rows = team.players.map(p => `<tr data-id="${p.id}"><td>${p.name}</td><td>${p.pos}</td><td>${p.age}</td>
    <td><input type="number" class="ovr" min="40" max="99" value="${p.ovr}"></td>
    <td><input type="number" class="off" min="40" max="99" value="${p.off}"></td>
    <td><input type="number" class="def" min="40" max="99" value="${p.def}"></td>
    <td>${p.salary}</td><td>${p.injury || '—'}</td></tr>`).join('');
  $('rosterBody').innerHTML = `<table><thead><tr><th>${i18n.t('player')}</th><th>${i18n.t('pos')}</th><th>${i18n.t('age')}</th><th>OVR</th><th>OFF</th><th>DEF</th><th>${i18n.t('salary')}</th><th>${i18n.t('injury')}</th></tr></thead><tbody>${rows}</tbody></table>`;
  $('stratPace').value = team.strategy.pace;
  $('stratThree').value = team.strategy.threeRate;
  $('stratDef').value = team.strategy.defense;
  $('stratRot').value = team.strategy.rotation;
  if (!state.free.length) state.free = freeAgents(state.teams, 8, state.rng);
  $('faList').innerHTML = state.free.length
    ? state.free.map((p, i) => `<div class="series"><span>${p.name} · ${p.pos} · ${p.ovr}</span><button class="btn" data-sign="${i}" title="${i18n.t('signPlayer')}">+</button></div>`).join('')
    : `<p class="empty-inline">${i18n.t('noFreeAgents')}</p>`;
  renderTradeBuilder();
}

function fillTradeTeams() {
  const a = $('tradeTeamA');
  const b = $('tradeTeamB');
  if (!a || !b) return;
  const aValue = a.value;
  const bValue = b.value;
  const options = state.teams.map(t => `<option value="${t.code}">${t.name}</option>`).join('');
  a.innerHTML = options;
  b.innerHTML = options;
  const selected = $('teamSelect').value || state.teams[0].code;
  a.value = state.teams.some(t => t.code === aValue) ? aValue : selected;
  b.value = state.teams.some(t => t.code === bValue) ? bValue : (state.teams.find(t => t.code !== a.value)?.code || a.value);
}

function fillTradePlayers() {
  const teamA = teamByCode($('tradeTeamA').value);
  const teamB = teamByCode($('tradeTeamB').value);
  if (!teamA || !teamB) return;
  const opts = team => team.players.map(p => `<option value="${p.id}">${p.name} · ${p.pos} · ${p.ovr}</option>`).join('');
  $('tradePlayerA').innerHTML = opts(teamA);
  $('tradePlayerB').innerHTML = opts(teamB);
}

function renderTradeBuilder() {
  fillTradeTeams();
  fillTradePlayers();
}

function renderStats() {
  const sim = state.sim;
  const source = sim ? Object.values(sim.players) : [];
  const top = sim ? leaders(source, 'pts', 8) : [];
  $('statLeaders').innerHTML = top.length
    ? `<table><thead><tr><th>${i18n.t('player')}</th><th>PTS</th><th>TS%</th><th>eFG%</th><th>EFF</th></tr></thead><tbody>` +
      top.map(p => `<tr data-player-id="${p.id || ''}"><td>${p.name}</td><td>${p.pts || 0}</td><td>${trueShooting(p).toFixed(3)}</td><td>${effectiveFG(p).toFixed(3)}</td><td>${efficiency(p)}</td></tr>`).join('') + '</tbody></table>'
    : `<p class="empty-inline">${i18n.t('statsEmpty')}</p>`;

  const home = teamByCode($('selHome').value);
  const away = teamByCode($('selAway').value);
  const homeColor = home?.color || '#00d4ff';
  const awayColor = away?.color || '#ffd166';
  const quarters = sim ? sim.quarters : [];
  const shots = sim ? sim.shots : [];

  quarterChart($('chartPoints'), quarters, homeColor, awayColor);
  progressionChart($('chartProgression'), quarters, homeColor, awayColor);
  shotChart($('chartShots'), shots, homeColor, awayColor);

  const rows = [];
  if (sim) {
    const homePlayers = sim.teams.home.players.map(p => sim.players[p.id]).filter(Boolean);
    const awayPlayers = sim.teams.away.players.map(p => sim.players[p.id]).filter(Boolean);
    const h = teamTotals(homePlayers);
    const a = teamTotals(awayPlayers);
    const pct = (t) => t.fga ? Math.round((t.fgm / t.fga) * 100) : 0;
    rows.push({ label: 'PTS', home: h.pts, away: a.pts });
    rows.push({ label: 'REB', home: (h.orb || 0) + (h.drb || 0), away: (a.orb || 0) + (a.drb || 0) });
    rows.push({ label: 'AST', home: h.ast, away: a.ast });
    rows.push({ label: 'FG%', home: pct(h), away: pct(a) });
  }
  comparisonChart($('chartCompare'), rows, homeColor, awayColor);

  $('quickSimMatchup').textContent = `${home ? home.name : '—'} vs ${away ? away.name : '—'} · ${i18n.t('quickSimHint')}`;
}

function quickSim() {
  const home = teamByCode($('selHome').value);
  const away = teamByCode($('selAway').value);
  if (!state.worker) {
    state.worker = new Worker(new URL('./worker/sim.worker.js', import.meta.url), { type: 'module' });
    state.worker.onmessage = e => {
      const { wins, results, meanHome, meanAway } = e.data;
      const count = results.length || 1;
      const homeName = teamByCode(e.data.home)?.name || e.data.home;
      const awayName = teamByCode(e.data.away)?.name || e.data.away;
      const losses = count - wins;
      $('quickSimResult').textContent = `${homeName} ${wins}–${losses} ${awayName} · ${i18n.t('averageScore')} ${meanHome.toFixed(1)}–${meanAway.toFixed(1)}`;
    };
  }
  if (!home || !away || home.code === away.code) { toast(i18n.t('selectTwo')); return; }
  $('quickSimResult').textContent = i18n.t('simulating');
  state.worker.postMessage({
    id: Date.now(),
    home: home.code,
    away: away.code,
    homeTeam: JSON.parse(JSON.stringify(home)),
    awayTeam: JSON.parse(JSON.stringify(away)),
    count: 12,
    seed: dailySeed()
  });
}

function filteredPlayers() {
  const query = ($('playerSearch').value || '').toLowerCase().trim();
  const team = $('playerTeam').value;
  const pos = $('playerPos').value;
  const rarity = $('playerRarity').value;
  const sort = $('playerSort').value;
  let list = state.teams.flatMap(t => t.players.map(p => ({ ...p, teamCode: t.code, teamName: t.name, teamColor: t.color, rarity: rarityFor(p.ovr) })));
  list = list.filter(p =>
    (!query || p.name.toLowerCase().includes(query)) &&
    (!team || p.teamCode === team) &&
    (!pos || p.pos === pos) &&
    (!rarity || p.rarity === rarity));
  list.sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'age' ? a.age - b.age : b.ovr - a.ovr);
  return list;
}

function renderPlayers() {
  const list = filteredPlayers();
  const shown = list.slice(0, state.playerLimit);
  const grid = $('playerGrid');
  const table = $('playerList');
  grid.hidden = state.playerViewMode !== 'grid';
  table.hidden = state.playerViewMode !== 'table';
  $('btnGridView').classList.toggle('active', state.playerViewMode === 'grid');
  $('btnTableView').classList.toggle('active', state.playerViewMode === 'table');
  $('btnMorePlayers').hidden = shown.length >= list.length;
  if ($('playerCount')) $('playerCount').textContent = `${list.length} ${i18n.t('playersFound')}`;

  grid.innerHTML = shown.map(p => `<article class="player-tile" data-player-id="${p.id}" style="--team-color:${p.teamColor}">
    <img src="${miniAvatarUrl(p, { color: p.teamColor })}" alt="${p.name}" loading="lazy">
    <span class="ovr">${p.ovr}</span>
    <span class="name">${p.name}</span>
    <span class="meta"><span>${p.teamCode} · ${p.pos}</span><span class="rarity ${p.rarity}">${i18n.t(p.rarity)}</span></span>
  </article>`).join('');

  table.innerHTML = `<table><thead><tr><th>${i18n.t('player')}</th><th>${i18n.t('team')}</th><th>${i18n.t('pos')}</th><th>${i18n.t('age')}</th><th>OVR</th><th>${i18n.t('rarityLabel')}</th></tr></thead><tbody>` +
    shown.map(p => `<tr data-player-id="${p.id}"><td>${p.name}</td><td>${p.teamCode}</td><td>${p.pos}</td><td>${p.age}</td><td>${p.ovr}</td><td><span class="rarity ${p.rarity}">${i18n.t(p.rarity)}</span></td></tr>`).join('') +
    '</tbody></table>';
}

function ownedCards() {
  const c = state.data.career;
  return (c.collection || []).map(id => {
    const found = findPlayer(id);
    if (!found) return null;
    const level = Math.max(1, (c.cards || {})[id] || 1);
    return {
      ...found.player, team: found.team.code, teamName: found.team.name,
      set: cardSet(found.player), level, copies: (c.copies || {})[id] || 0
    };
  }).filter(Boolean);
}

function renderCards() {
  const c = state.data.career;
  const cards = ownedCards();
  const cardMap = Object.fromEntries(cards.map(p => [p.id, p]));
  c.deck = normalizeDeck(c.deck || []);
  c.squad = normalizeSquad(c.squad || {});
  $('clubPicker').innerHTML = cards.map(p => `<option value="${p.id}">${p.name} · ${p.ovr} · Lv${p.level}</option>`).join('');
  $('btnAddCard').disabled = !cards.length;
  const pickerWrap = $('clubPickerWrap');
  if (pickerWrap) pickerWrap.hidden = !['deck', 'squad'].includes(state.cardPane);
  const rating = squadRating(cardMap, c.squad);
  const chem = chemistry(cardMap, c.squad);
  $('clubRating').textContent = rating || '—';
  $('clubChem').textContent = '+' + chem;
  $('clubTier').textContent = c.clubLeague?.tier || '—';
  $('clubWeek').textContent = '—';
  if ($('clubPickerHint')) {
    $('clubPickerHint').textContent = cards.length
      ? (state.cardPane === 'deck' ? i18n.t('deckPickerHint') : i18n.t('squadPickerHint'))
      : i18n.t('noCardsHint');
  }

  ['collection', 'deck', 'squad', 'league', 'cup'].forEach(name => {
    const pane = $('cardsPane' + name[0].toUpperCase() + name.slice(1));
    if (pane) pane.hidden = name !== state.cardPane;
  });
  document.querySelectorAll('[data-card-sub]').forEach(b => b.classList.toggle('active', b.dataset.cardSub === state.cardPane));

  if (state.cardPane === 'collection') {
    renderCollection(cards);
  } else if (state.cardPane === 'deck') {
    const slot = (id, i) => {
      const p = cardMap[id];
      return `<button class="slot ${p ? 'filled' : ''}" data-remove-deck="${i}">${p ? `<b>${p.name}</b><small>Lv${p.level} · ${p.ovr}</small>` : `<b>+</b><small>${i18n.t('deck')} ${i + 1}</small>`}</button>`;
    };
    $('clubDeck').innerHTML = Array.from({ length: DECK_SIZE }, (_, i) => slot(c.deck[i], i)).join('');
    const syn = deckSynergy(cardMap, c.deck);
    $('clubDeckSynergy').innerHTML = `<span>${i18n.t('rating')} ${syn.power}</span>` +
      syn.labels.map(l => `<span>${l}</span>`).join('') +
      `<span>XP +${Math.round(syn.xp * 100)}%</span><span>${i18n.t('odds')} +${Math.round(syn.odds * 100)}%</span>`;
  } else if (state.cardPane === 'squad') {
    $('clubTemplate').value = c.squad.template;
    const slot = (id, kind, i) => {
      const p = cardMap[id];
      return `<button class="slot ${p ? 'filled' : ''}" data-remove-squad="${kind}:${i}">${p ? `<b>${p.name}</b><small>${p.pos} · Lv${p.level}</small>` : `<b>+</b><small>${i + 1}</small>`}</button>`;
    };
    $('clubStarters').innerHTML = Array.from({ length: STARTERS }, (_, i) => slot(c.squad.starters[i], 'starters', i)).join('');
    $('clubBench').innerHTML = Array.from({ length: BENCH }, (_, i) => slot(c.squad.bench[i], 'bench', i)).join('');
  } else if (state.cardPane === 'league') {
    if (!c.clubLeague) c.clubLeague = newClubLeague();
    const l = c.clubLeague;
    $('clubTier').textContent = l.tier;
    $('clubWeek').textContent = `${l.week}/${l.games.length}`;
    $('clubStandings').innerHTML = `<table><thead><tr><th>#</th><th>${i18n.t('team')}</th><th>W</th><th>L</th><th>DIFF</th></tr></thead><tbody>` +
      clubStandings(l).slice(0, 10).map((t, i) => `<tr${t.code === CLUB_CODE ? ' style="color:#4de8ff"' : ''}><td>${i + 1}</td><td>${t.code}</td><td>${t.w}</td><td>${t.l}</td><td>${t.pf - t.pa}</td></tr>`).join('') + '</tbody></table>';
  } else if (state.cardPane === 'cup') {
    if (!c.clubCup) c.clubCup = createCup();
    const cup = c.clubCup;
    $('clubCup').innerHTML = cup.rounds.filter(r => r.matchups.length).map(r => `<h3>${r.name}</h3>` +
      r.matchups.map(m => `<div class="series"><span>${m.a} vs ${m.b}</span><b>${m.winner || '—'}</b></div>`).join('')).join('') +
      (cup.champion ? `<p>🏆 ${cup.champion}</p>` : '');
    $('clubWeek').textContent = cup.complete ? i18n.t('final') : `R${cup.round + 1}`;
  }
  save(state.data);
}

function renderCollection(cards = ownedCards()) {
  const c = state.data.career;
  const ids = c.collection || [];
  const hasCards = cards.length > 0;
  if ($('cardsEmpty')) $('cardsEmpty').hidden = hasCards;
  if ($('yourCardsTitle')) $('yourCardsTitle').hidden = !hasCards;
  if ($('collectionList')) $('collectionList').hidden = !hasCards;
  $('collectionInfo').textContent = `${i18n.t('playersOwned')}: ${ids.length} · ${i18n.t('chests')}: ${c.chests || 0} · ${i18n.t('streak')}: ${c.streak || 0}`;
  $('fragmentCount').textContent = c.fragments || 0;
  $('btnDailyChest').disabled = !isDailyChestAvailable(c);
  const odds = pullOdds(c.pity || 0);
  $('pullOdds').innerHTML = Object.entries(odds).map(([k, v]) => `<span class="odd">${i18n.t(k)}<b>${v}%</b></span>`).join('');
  $('pityFill').style.width = Math.min(100, ((c.pity || 0) / 40) * 100) + '%';
  $('pityText').textContent = `${i18n.t('pity')} ${c.pity || 0}/40`;
  $('pullHistory').innerHTML = (c.pullHistory || []).map(p => `<span class="rarity ${p.tier}" title="${p.guaranteed ? 'PITY' : ''}">${i18n.t(p.tier)}</span>`).join('') || '<span class="hint">—</span>';
  const craft = $('craftTarget');
  craft.innerHTML = state.teams.flatMap(t => t.players.map(p => `<option value="${p.id}">${p.name} · ${p.ovr}</option>`)).join('');
  $('setProgress').innerHTML = Object.keys(SETS).map(key => {
    const p = setProgress(c, state.teams, key);
    return `<div class="set-row"><span>${SETS[key].name}</span><i><b style="width:${Math.round(p.ratio * 100)}%"></b></i><span>${p.owned}/${p.total}</span></div>`;
  }).join('');
  $('collectionList').innerHTML = ids.map(id => {
    const found = findPlayer(id);
    if (!found) return '';
    const p = found.player;
    const rarity = rarityFor(p.ovr);
    const level = Math.max(1, (c.cards || {})[id] || ((c.upgrades || {})[id] || 0) + 1);
    return `<div class="card3d" data-player-id="${id}">
      <div class="card3d-inner">
        <div class="card3d-face">
          <img src="${miniAvatarUrl(p, found.team)}" alt="${p.name}" loading="lazy">
          <span class="name">${p.name}</span>
          <span class="rarity ${rarity}">${i18n.t(rarity)} · ${SETS[cardSet(p)].name}</span>
          <span class="meta">${i18n.t('level')} ${level} · ${cardPower(p, level - 1)}</span>
          <div class="copy-bar"><b style="width:${Math.min(100, (((c.copies || {})[id] || 0) / Math.max(1, copiesNeeded(level))) * 100)}%"></b></div>
          <span class="meta">${i18n.t('copies')} ${(c.copies || {})[id] || 0}/${level >= 5 ? '—' : copiesNeeded(level)}</span>
          <div class="card-actions">
            <button class="btn up" data-upgrade="${id}">${level >= 5 ? i18n.t('maxed') : `${i18n.t('upgrade')} · ${copiesNeeded(level)} + ${creditsNeeded(level)}`}</button>
            ${(c.duplicates || {})[id] ? `<button class="btn up" data-sell="${id}">${i18n.t('share')} · ${aiOffer(p, Math.random, Date.now() / 86400000)}</button>` : ''}
          </div>
        </div>
        <div class="card3d-face card3d-back">
          <b>${p.name}</b><p>${p.pos} · ${found.team.name} · ${p.age}</p>
          <p>${playerNotes(p, i18n.lang, found.team.name).trivia}</p>
        </div>
      </div>
    </div>`;
  }).join('') || `<p class="empty-inline">${i18n.t('noCardsTitle')}</p>`;
  $('clubWildcards').innerHTML = WILDCARDS.map(k => `<span class="odd">${i18n.t(k)}<b>${(c.wildcards || {})[k] || 0}</b></span>`).join('');
  $('clubChallenges').innerHTML = (c.challengesDone || []).map(id => `<span class="stat-chip">✓ ${id}</span>`).join('') || '—';
  $('clubWildcardTarget').innerHTML = cards.map(p => `<option value="${p.id}">${p.name} · ${i18n.t(rarityFor(p.ovr))}</option>`).join('');
  renderChestShop();
  renderBetPanel();
}

function renderHUD() {
  const c = state.data.career;
  $('topCredits').textContent = Math.round(c.credits || 0);
  $('topLevel').textContent = c.level || 1;
  const chest = activeChest(c);
  if (!chest) {
    $('topChestLabel').textContent = i18n.t('noChest');
    $('topChestTimer').textContent = '—';
    $('btnOpenChest').hidden = true;
    $('btnSpeedChest').hidden = true;
    return;
  }
  const ready = isReady(chest);
  $('topChestLabel').textContent = i18n.t(chest.type);
  $('topChestTimer').textContent = ready ? i18n.t('openChest') : formatTime(timeLeft(chest));
  $('btnOpenChest').hidden = !ready;
  $('btnSpeedChest').hidden = ready;
  if (!ready) $('btnSpeedChest').textContent = `${i18n.t('speedUp')} · ${speedUpCost(chest)}`;
}

function renderChestShop() {
  const c = state.data.career;
  $('chestShopOptions').innerHTML = Object.values(CHEST_TYPES).map(def =>
    `<button class="btn" data-buy="${def.key}" style="border-color:${def.color}">${i18n.t(def.key)} · ${def.price}</button>`).join('');
  $('chestQueue').innerHTML = (c.chestQueue || []).map((chest, i) => {
    const def = CHEST_TYPES[chest.type];
    return `<div class="queue-item"><span>${i === 0 ? '▶ ' : ''}${i18n.t(def.key)}</span><span>${isReady(chest) ? i18n.t('openChest') : formatTime(timeLeft(chest))}</span></div>`;
  }).join('') || `<span class="hint">${i18n.t('noChest')}</span>`;
}

function renderCareer() {
  const c = state.data.career;
  const daily = ensureDailyState();
  $('careerYear').textContent = c.year;
  $('careerLevel').textContent = c.level;
  $('careerXp').textContent = c.xp;
  $('careerBadges').textContent = (c.badges || []).join(' · ') || '—';
  $('dailyText').textContent = `${i18n.t('dailyGoalPlay')} ${Math.min(1, daily.games || 0)}/1 · ${i18n.t('dailyGoalCorrect')} ${daily.correct || 0}`;
}

function totalSetBonus() {
  const set = Object.keys(SETS).reduce((a, key) => a + setBonus(state.data.career, state.teams, key), 0);
  const cards = ownedCards();
  const deck = deckSynergy(Object.fromEntries(cards.map(p => [p.id, p])), state.data.career.deck || []);
  return set + deck.odds;
}

function updatePropOptions() {
  const type = $('propType').value;
  const options = type === 'total'
    ? [['over', i18n.t('overUnder') + ' · Over'], ['under', i18n.t('overUnder') + ' · Under']]
    : type === 'margin'
      ? [['close', '1–5'], ['mid', '6–10'], ['blowout', '11+']]
      : [0, 1, 2, 3].map(i => [String(i), 'Q' + (i + 1)]);
  $('propPick').innerHTML = options.map(([v, label]) => `<option value="${v}">${label}</option>`).join('');
}

function renderBetPanel() {
  const c = state.data.career;
  $('creditBalance').textContent = Math.round(c.credits || 0);
  $('betStreak').textContent = c.streak || 0;
  const home = teamByCode($('guessHome').value);
  const away = teamByCode($('guessAway').value);
  const bonus = streakBonus(c.streak || 0) + totalSetBonus();
  let html = '';
  if (state.betType === 'winner' && home && away) {
    const odds = winOdds(home, away, null, null, bonus);
    const labels = { home: i18n.t('home'), away: i18n.t('away'), tie: i18n.t('tie') };
    html = ['home', 'away', 'tie'].map(k => `<span class="odd">${labels[k].toUpperCase()}<b>${odds.odds[k].toFixed(2)}</b></span>`).join('');
  } else if (state.betType === 'prop') {
    const pick = $('propPick').value;
    html = `<span class="odd">${i18n.t('odds')}<b>${propOdds($('propType').value, pick).toFixed(2)}</b></span>`;
  } else {
    const odds = state.parlayGames.map(g => g.odds || 1.9);
    html = `<span class="odd">${i18n.t('parlay')}<b>${parlayOdds(odds).toFixed(2)}</b></span>`;
  }
  $('betOdds').innerHTML = html;
}

function generateParlay() {
  const pool = state.teams.slice().sort(() => Math.random() - 0.5).slice(0, 6);
  state.parlayGames = [0, 1, 2].map(i => {
    const home = pool[i * 2], away = pool[i * 2 + 1];
    const odds = winOdds(home, away).odds.home;
    return { home: home.code, away: away.code, odds };
  });
  $('parlayGames').innerHTML = state.parlayGames.map((g, i) => `<div class="parlay-row"><span>${g.home} – ${g.away}</span>
    <select data-parlay="${i}"><option value="home">${g.home}</option><option value="away">${g.away}</option></select></div>`).join('');
  renderBetPanel();
}

function placeBet() {
  const c = state.data.career;
  claimDailyCredits(c);
  if ((c.credits || 0) < state.stake) { toast(i18n.t('balance')); return; }
  const bonus = streakBonus(c.streak || 0) + totalSetBonus();
  const seed = (Date.now() ^ (c.bets || []).length * 7919) >>> 0;
  const rng = seededRandom(seed);
  let won = false;
  let delta = 0;
  let text = '';
  let summary = null;
  let chestPull = null;
  let chestRewardData = null;

  if (state.betType === 'winner') {
    const home = teamByCode($('guessHome').value), away = teamByCode($('guessAway').value);
    if (!home || !away || home.code === away.code) { toast(i18n.t('selectTwo')); return; }
    const odds = winOdds(home, away, null, null, bonus);
    const pick = $('guessPred').value;
    summary = simulateGame(home, away, { rng }).summary();
    const result = applyBet(c, { type: 'winner', pick, stake: state.stake, home: home.code, away: away.code }, summary.winner, odds.odds, bonus);
    won = result.won; delta = result.delta;
    text = `${home.code} ${summary.score.home}–${summary.score.away} ${away.code}`;
  } else if (state.betType === 'prop') {
    const home = teamByCode($('guessHome').value), away = teamByCode($('guessAway').value);
    summary = simulateGame(home, away, { rng }).summary();
    const type = $('propType').value, pick = $('propPick').value;
    const market = propMarket(summary);
    const odd = propOdds(type, pick) + bonus;
    const result = applyBet(c, { type: 'prop', prop: type, pick, stake: state.stake }, 'win', { win: odd }, 0);
    won = resolveProp(type, market, pick);
    delta = won ? Math.round(state.stake * odd * 100) / 100 : -state.stake;
    c.credits = Math.max(0, Math.round((c.credits || 0) * 100 + (delta - result.delta) * 100) / 100);
    c.streak = won ? (c.streak || 0) + 1 : 0;
    text = `${type}: ${pick} · ${summary.score.home}–${summary.score.away}`;
  } else {
    if (!state.parlayGames.length) generateParlay();
    const picks = [];
    for (const g of state.parlayGames) {
      const home = teamByCode(g.home), away = teamByCode(g.away);
      const s = simulateGame(home, away, { rng }).summary();
      const sel = document.querySelector(`[data-parlay="${picks.length}"]`);
      const pick = sel ? sel.value : 'home';
      picks.push({ won: (pick === 'home' && s.winner === 'home') || (pick === 'away' && s.winner === 'away') });
      text += `${g.home}/${pick} `;
    }
    won = resolveParlay(picks);
    const odd = parlayOdds(state.parlayGames.map(g => g.odds)) + bonus;
    const result = applyBet(c, { type: 'parlay', stake: state.stake, games: state.parlayGames.length }, 'win', { win: odd }, 0);
    delta = won ? Math.round(state.stake * odd * 100) / 100 : -state.stake;
    c.credits = Math.max(0, Math.round((c.credits || 0) * 100 + (delta - result.delta) * 100) / 100);
    c.streak = won ? (c.streak || 0) + 1 : 0;
  }

  let chestText = '';
  if (won) {
    const pull = pityPull(c, rng);
    const reward = chestReward(pull.tier, state.teams, c.collection || [], rng);
    chestPull = pull;
    chestRewardData = reward;
    if (reward.player) {
      addCopies(c, reward.player.id, 1);
      if (reward.duplicate) {
        c.duplicates = c.duplicates || {};
        c.duplicates[reward.player.id] = (c.duplicates[reward.player.id] || 0) + 1;
        c.fragments = (c.fragments || 0) + fragmentsFor(pull.tier);
      } else if (!c.collection.includes(reward.player.id)) c.collection.push(reward.player.id);
      chestText = `${i18n.t(RARITIES[pull.tier].label.toLowerCase())} · ${reward.duplicate ? i18n.t('duplicate') : `${i18n.t('unlocked')}: ${reward.player.name}`}`;
    }
    c.chests = (c.chests || 0) + 1;
    grantXP(state.data, 20, 'deck');
    c.guesses = (c.guesses || 0) + 1;
  } else { c.guesses = (c.guesses || 0) + 1; }

  save(state.data);
  const el = $('guessResult');
  el.className = 'guess-result ' + (won ? 'good' : 'bad');
  el.textContent = `${won ? i18n.t('correct') : i18n.t('wrong')} · ${text} · ${delta > 0 ? '+' : ''}${delta} ${chestText}`;
  renderBetPanel();
  renderCards(); renderHUD();
  if (chestPull) {
    const found = chestRewardData && chestRewardData.player ? findPlayer(chestRewardData.player.id) : null;
    revealChest(chestPull, chestRewardData, { sfx, i18n, team: found ? found.team : null });
  }
}

function findPlayer(id) {
  for (const team of state.teams) {
    const p = team.players.find(x => x.id === id);
    if (p) return { player: p, team };
  }
  if (state.sim && state.sim.players[id]) return { player: state.sim.players[id], team: teamByCode($('selHome').value) };
  return null;
}

function openPlayerCard(id) {
  const found = findPlayer(id);
  if (!found) return;
  const { player, team } = found;
  state.openPlayer = player;
  state.openTeam = team;
  const avg = seasonAverage(player);
  const adv = advancedProjection(player);
  const notes = playerNotes(player, i18n.lang, team.name);
  const rarity = rarityFor(player.ovr);
  const card = $('playerModal').querySelector('.player-card');
  card.style.setProperty('--team', team.color || '#00d4ff');
  card.style.setProperty('--team-2', shade(team.color || '#00d4ff', 0.35));
  card.style.setProperty('--team-glow', shade(team.color || '#00d4ff', 0.5));
  $('playerNumber').textContent = player.jersey == null ? 1 : player.jersey;
  const badge = $('playerCardRarity');
  badge.className = 'rarity ' + rarity;
  badge.textContent = i18n.t(rarity);
  badge.style.color = rarityColor(rarity);
  $('playerName').textContent = player.name;
  $('playerCardTeam').textContent = `${team.name} · ${player.pos}`;
  $('playerPhotoInfo').innerHTML = [
    ['height', `${player.heightCm || 200} cm`], ['weight', `${player.weightKg || 100} kg`],
    ['hair', (player.hairStyle || 'short')], ['face', (player.faceShape || 'oval')],
    ['jersey', String(player.jersey == null ? 1 : player.jersey)]
  ].map(([k, v]) => `<span>${i18n.t(k)}: <b>${v}</b></span>`).join('');
  $('playerAverages').innerHTML = [
    ['PTS', avg.pts], ['REB', avg.reb], ['AST', avg.ast], ['STL', avg.stl], ['BLK', avg.blk],
    ['FG%', avg.fg.toFixed(3)], ['3P%', avg.tp.toFixed(3)], ['FT%', avg.ft.toFixed(3)],
    ['MPG', avg.mpg], ['GP', avg.gp]
  ].map(([k, v]) => `<span class="stat-chip">${k}: <b>${v}</b></span>`).join('');
  const ring = (label, value) => `<div class="ring"><svg viewBox="0 0 80 80" pathLength="100"><circle class="track" cx="40" cy="40" r="32" pathLength="100"/><circle class="value" cx="40" cy="40" r="32" pathLength="100" stroke-dasharray="${Math.round(value * 100)} 100"/></svg><b>${Math.round(value * 100)}%</b><small>${label}</small></div>`;
  $('playerRings').innerHTML = ring('TS', adv.ts) + ring('eFG', adv.efg);
  $('playerBars').innerHTML = [['OVR', player.ovr], ['OFF', player.off], ['DEF', player.def], ['POT', player.pot]]
    .map(([label, value]) => `<div class="attr"><span>${label}</span><i><b style="width:${Math.max(0, Math.min(100, value))}%"></b></i><span>${value}</span></div>`).join('');
  $('playerTrivia').textContent = notes.trivia;
  $('playerQuote').textContent = notes.quote || '';
  $('playerModal').hidden = false;

  const canvas = $('avatarCanvas');
  if (!state.avatar) state.avatar = createAvatar(canvas);
  if (state.avatar) {
    state.avatar.autoSpin(true);
    state.avatar.setPlayer(player, team);
    const av = state.avatar;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    av.resize(canvas.clientWidth, canvas.clientHeight, dpr);
    const loop = now => {
      if ($('playerModal').hidden || !state.avatar) return;
      av.render(now);
      state.avatarFrame = requestAnimationFrame(loop);
    };
    state.avatarFrame = requestAnimationFrame(loop);
  }
}

async function sharePlayerCard() {
  if (!state.openPlayer || !state.openTeam) return;
  const p = state.openPlayer;
  const team = state.openTeam;
  const c = document.createElement('canvas');
  c.width = 720; c.height = 900;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 720, 900);
  grad.addColorStop(0, shade(team.color || '#00d4ff', -0.6));
  grad.addColorStop(1, '#060b18');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 720, 900);
  const avatar = $('avatarCanvas');
  if (avatar && avatar.width && avatar.height) ctx.drawImage(avatar, 40, 30, 640, 560);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 60px Inter, sans-serif';
  ctx.fillText(p.name, 40, 690);
  ctx.font = '700 28px Inter, sans-serif';
  ctx.fillStyle = '#93aac9';
  ctx.fillText(`${team.name} · ${p.pos} · #${p.jersey == null ? 1 : p.jersey}`, 40, 735);
  const avg = seasonAverage(p);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 36px Inter, sans-serif';
  ctx.fillText(`OVR ${p.ovr}   PTS ${avg.pts}   REB ${avg.reb}   AST ${avg.ast}`, 40, 805);
  ctx.fillStyle = rarityColor(rarityFor(p.ovr));
  ctx.font = '900 24px Inter, sans-serif';
  ctx.fillText(i18n.t(rarityFor(p.ovr)).toUpperCase(), 40, 855);

  const blob = await new Promise(resolve => c.toBlob(resolve, 'image/png'));
  if (!blob) return;
  try {
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'player.png', { type: 'image/png' })] })) {
      await navigator.share({ title: i18n.t('title'), files: [new File([blob], 'player.png', { type: 'image/png' })] });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${p.name.replace(/\s+/g, '-')}.png`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  } catch (e) { /* cancelled */ }
}

function closePlayerCard() {
  $('playerModal').hidden = true;
  cancelAnimationFrame(state.avatarFrame);
  state.openPlayer = null;
  state.openTeam = null;
}

function openReplay(data) {
  if (!data) { toast(i18n.t('noGames')); return; }
  state.replayData = data;
  $('replayInfo').textContent = `${detectHighlights(data).length} highlights · ${data.home} ${data.score.home}–${data.score.away} ${data.away}`;
  $('replayModal').hidden = false;
  const canvas = $('replayCanvas');
  state.replayPlayer = createReplayPlayer(canvas, data, frame => {
    $('replayInfo').textContent = (i18n.lang === 'en' ? frame.event.en : frame.event.it) || '';
  });
  if (state.replayPlayer) {
    state.replayPlayer.resize(canvas.clientWidth, canvas.clientHeight, Math.min(2, window.devicePixelRatio || 1));
    state.replayPlayer.draw(0);
  }
}

function closeReplay() {
  if (state.replayPlayer) state.replayPlayer.pause();
  $('replayModal').hidden = true;
}

async function exportReplay() {
  if (!state.replayPlayer) return;
  const blob = await state.replayPlayer.exportWebM(6);
  if (!blob) { toast(i18n.t('statusError')); return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nba-replay-${Date.now()}.webm`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function reasonText(reason) {
  const map = {
    'roster-full': 'reasonRosterFull',
    'roster-min': 'reasonRosterMin',
    'missing-player': 'reasonMissingPlayer',
    'queue-full': 'queueFull',
    credits: 'needCredits',
    locked: 'chestLocked',
    empty: 'noChest',
    max: 'maxed',
    resources: 'needCredits'
  };
  return i18n.t(map[reason] || 'statusError');
}

async function confirmAction(title, message) {
  if (window.ProjectShell && window.ProjectShell.confirm) {
    return window.ProjectShell.confirm({ title, message, confirmText: i18n.t('confirm') });
  }
  return window.confirm(message);
}

function markOnboarded() {
  state.data.settings.onboarded = true;
  save(state.data);
}

const TOUR_STEPS = [
  { view: 'match', title: 'tourPlayTitle', body: 'tourPlayBody' },
  { view: 'season', sub: 'season', title: 'tourSeasonTitle', body: 'tourSeasonBody' },
  { view: 'team', sub: 'teams', title: 'tourTeamTitle', body: 'tourTeamBody' },
  { view: 'explore', sub: 'stats', title: 'tourExploreTitle', body: 'tourExploreBody' },
  { view: 'cards', title: 'tourCardsTitle', body: 'tourCardsBody' }
];

function renderTourStep() {
  const step = TOUR_STEPS[state.tourStep];
  if (!step) return;
  switchView(step.view, step.sub || null, { url: 'none' });
  $('tourStepLabel').textContent = `${state.tourStep + 1} / ${TOUR_STEPS.length}`;
  $('tourTitle').textContent = i18n.t(step.title);
  $('tourBody').textContent = i18n.t(step.body);
  $('btnTourPrev').disabled = state.tourStep === 0;
  $('btnTourNext').textContent = i18n.t(state.tourStep === TOUR_STEPS.length - 1 ? 'finish' : 'next');
}

function startTour() {
  markOnboarded();
  state.tourStep = 0;
  openModal('tourModal');
  renderTourStep();
}

function finishTour() {
  markOnboarded();
  closeModal('tourModal');
  switchView('match', null, { url: 'replace' });
}

function showWelcome() {
  if (state.data.settings.onboarded) return;
  openModal('welcomeModal');
}

function claimDailyChestReward() {
  const c = state.data.career;
  if (!claimDailyChest(c)) { toast(i18n.t('dailyChestUnavailable')); return; }
  const pull = pityPull(c, seededRandom(Date.now() >>> 0));
  const reward = chestReward(pull.tier, state.teams, c.collection || [], seededRandom((Date.now() ^ 0x1234) >>> 0));
  if (reward.player) addCopies(c, reward.player.id, 1);
  if (reward.player && reward.duplicate) {
    c.duplicates = c.duplicates || {};
    c.duplicates[reward.player.id] = (c.duplicates[reward.player.id] || 0) + 1;
  } else if (reward.player && !c.collection.includes(reward.player.id)) c.collection.push(reward.player.id);
  c.fragments = (c.fragments || 0) + (reward.duplicate ? fragmentsFor(pull.tier) : 1);
  c.chests = (c.chests || 0) + 1;
  c.xp += RARITIES[pull.tier].xp;
  save(state.data);
  renderCards(); renderHUD();
  const found = reward.player ? findPlayer(reward.player.id) : null;
  revealChest(pull, reward, { sfx, i18n, team: found ? found.team : null });
}

function updateSoundLabel() {
  const muted = sfx.muted || state.data.settings.sound === false;
  if ($('btnSound')) $('btnSound').textContent = `${i18n.t('sound')}: ${i18n.t(muted ? 'off' : 'on')}`;
  if ($('settingsSound')) $('settingsSound').checked = !muted;
}

function toggleSound() {
  sfx.init();
  const currentlyMuted = sfx.muted || state.data.settings.sound === false;
  const nextSound = currentlyMuted;
  state.data.settings.sound = nextSound;
  sfx.muted = !nextSound;
  updateSoundLabel();
  save(state.data);
}

function bind() {
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => navigate(b.dataset.view)));
  document.querySelectorAll('[data-quick-view]').forEach(b => b.addEventListener('click', () => navigate(b.dataset.quickView)));
  document.querySelectorAll('[data-card-sub]').forEach(b => b.addEventListener('click', () => {
    state.cardPane = b.dataset.cardSub;
    renderCards();
  }));
  $('btnAddCard').addEventListener('click', () => {
    const id = $('clubPicker').value;
    const c = state.data.career;
    if (!id) return;
    if (state.cardPane === 'deck') {
      const deck = normalizeDeck(c.deck || []);
      if (deck.includes(id)) { toast(i18n.t('alreadyInDeck')); return; }
      if (deck.length >= DECK_SIZE) { toast(i18n.t('deckFull')); return; }
      deck.push(id);
      c.deck = normalizeDeck(deck);
    } else if (state.cardPane === 'squad') {
      c.squad = normalizeSquad(c.squad || {});
      if (c.squad.starters.includes(id) || c.squad.bench.includes(id)) { toast(i18n.t('alreadyInSquad')); return; }
      if (!c.squad.starters.includes(id) && c.squad.starters.length < STARTERS) c.squad.starters.push(id);
      else if (!c.squad.bench.includes(id) && c.squad.bench.length < BENCH) c.squad.bench.push(id);
      else { toast(i18n.t('squadFull')); return; }
    } else return;
    save(state.data); renderCards();
  });
  $('clubDeck').addEventListener('click', e => {
    const b = e.target.closest('[data-remove-deck]');
    if (!b) return;
    state.data.career.deck.splice(Number(b.dataset.removeDeck), 1);
    save(state.data); renderCards();
  });
  $('clubStarters').addEventListener('click', e => {
    const b = e.target.closest('[data-remove-squad]'); if (!b) return;
    const [kind, i] = b.dataset.removeSquad.split(':');
    state.data.career.squad[kind].splice(Number(i), 1);
    save(state.data); renderCards();
  });
  $('clubBench').addEventListener('click', e => {
    const b = e.target.closest('[data-remove-squad]'); if (!b) return;
    const [kind, i] = b.dataset.removeSquad.split(':');
    state.data.career.squad[kind].splice(Number(i), 1);
    save(state.data); renderCards();
  });
  $('clubTemplate').addEventListener('change', e => {
    state.data.career.squad.template = e.target.value;
    save(state.data); renderCards();
  });
  $('clubAutoFill').addEventListener('click', () => {
    const c = state.data.career;
    const cards = ownedCards().sort((a, b) => b.ovr - a.ovr);
    c.squad = normalizeSquad({ template: $('clubTemplate').value, starters: cards.slice(0, 5).map(p => p.id), bench: cards.slice(5, 12).map(p => p.id) });
    c.deck = normalizeDeck(cards.slice(0, 8).map(p => p.id));
    save(state.data); renderCards();
  });
  $('btnClubWeek').addEventListener('click', () => {
    const c = state.data.career;
    if (!c.clubLeague) c.clubLeague = newClubLeague();
    const cards = Object.fromEntries(ownedCards().map(p => [p.id, p]));
    const rating = squadRating(cards, c.squad), chem = chemistry(cards, c.squad);
    const result = playClubGame(c.clubLeague, rating, chem, seededRandom(Date.now() >>> 0));
    c.wildcards = c.wildcards || {};
    c.credits = (c.credits || 0) + (result && result.won ? 120 : 40);
    c.xp += result && result.won ? 40 : 10;
    c.level = 1 + Math.floor(Math.sqrt(c.xp / 120));
    checkChallenges(c, { clubWins: (c.clubLeague.results || []).filter(r => r.won).length, legendaryIds: ownedCards().filter(p => p.ovr >= 95).map(p => p.id) });
    save(state.data); renderCards(); renderHUD();
    toast(result ? `${result.opponent} ${result.hs}–${result.as}` : i18n.t('noGames'));
  });
  $('btnClubSeason').addEventListener('click', () => {
    const c = state.data.career;
    if (!c.clubLeague) c.clubLeague = newClubLeague();
    const cards = Object.fromEntries(ownedCards().map(p => [p.id, p]));
    const rating = squadRating(cards, c.squad), chem = chemistry(cards, c.squad);
    let guard = 0;
    while (!c.clubLeague.complete && guard < 40) { playClubGame(c.clubLeague, rating, chem, seededRandom(Date.now() + guard)); guard += 1; }
    promote(c.clubLeague);
    c.credits = (c.credits || 0) + 500;
    save(state.data); renderCards(); renderHUD();
  });
  $('btnClubNew').addEventListener('click', () => {
    state.data.career.clubLeague = newClubLeague(state.data.career.clubLeague ? state.data.career.clubLeague.tier : 'Bronze');
    save(state.data); renderCards();
  });
  $('btnCupNew').addEventListener('click', () => {
    state.data.career.clubCup = createCup();
    save(state.data); renderCards();
  });
  $('btnCupRound').addEventListener('click', () => {
    const c = state.data.career;
    if (!c.clubCup) c.clubCup = createCup();
    const cards = Object.fromEntries(ownedCards().map(p => [p.id, p]));
    playCupRound(c.clubCup, squadRating(cards, c.squad), chemistry(cards, c.squad), seededRandom(Date.now() >>> 0));
    checkChallenges(c, { cupRound: c.clubCup.round, legendaryIds: ownedCards().filter(p => p.ovr >= 95).map(p => p.id) });
    c.credits = (c.credits || 0) + 80;
    save(state.data); renderCards(); renderHUD();
  });
  $('btnUseWildcard').addEventListener('click', () => {
    const c = state.data.career;
    const found = findPlayer($('clubWildcardTarget').value);
    if (!found) return;
    const result = useWildcard(c, found.player);
    save(state.data); renderCards(); renderHUD();
    toast(result.ok ? `${i18n.t('copies')} +1` : i18n.t('needCredits'));
  });
  document.querySelectorAll('[data-sub]').forEach(b => b.addEventListener('click', () => {
    const sub = b.dataset.sub;
    const view = ['season', 'playoffs'].includes(sub) ? 'season'
      : ['teams', 'career'].includes(sub) ? 'team'
      : ['stats', 'players'].includes(sub) ? 'explore' : null;
    if (view) navigate(view, sub);
  }));
  const openFromRow = id => { if (id) openPlayerCard(id); };
  ['boxBody', 'rosterBody', 'statLeaders'].forEach(container => {
    const el = $(container);
    if (!el) return;
    el.addEventListener('click', e => {
      const row = e.target.closest('[data-player-id]');
      if (row) openFromRow(row.dataset.playerId);
    });
  });
  $('resultCard').addEventListener('click', e => {
    const row = e.target.closest('[data-player-id]');
    if (row) openFromRow(row.dataset.playerId);
  });
  $('chestShopOptions').addEventListener('click', e => {
    const btn = e.target.closest('[data-buy]');
    if (!btn) return;
    const result = buyChest(state.data.career, btn.dataset.buy);
    save(state.data);
    renderHUD(); renderChestShop();
    toast(result.ok ? i18n.t('chestBought') : i18n.t(result.reason === 'queue-full' ? 'queueFull' : 'needCredits'));
  });
  $('btnSpeedChest').addEventListener('click', () => {
    const result = speedUpChest(state.data.career);
    save(state.data);
    renderHUD(); renderChestShop();
    if (!result.ok) toast(i18n.t('needCredits'));
  });
  $('btnOpenChest').addEventListener('click', () => {
    const result = openChest(state.data.career);
    if (!result.ok) { toast(i18n.t('noChest')); return; }
    const c = state.data.career;
    const def = CHEST_TYPES[result.chest.type];
    const pull = pityPull(c, seededRandom(Date.now() >>> 0));
    pull.tier = enforceMinTier(pull.tier, def.minTier);
    if (pull.tier === 'legendary') c.pity = 0;
    const reward = chestReward(pull.tier, state.teams, c.collection || [], seededRandom((Date.now() ^ 0x55) >>> 0));
    if (reward.player) {
      addCopies(c, reward.player.id, 1);
      if (reward.duplicate) c.fragments = (c.fragments || 0) + fragmentsFor(pull.tier);
      else if (!c.collection.includes(reward.player.id)) c.collection.push(reward.player.id);
    }
    c.chests = (c.chests || 0) + 1;
    save(state.data);
    renderHUD(); renderChestShop(); renderCards();
    const found = reward.player ? findPlayer(reward.player.id) : null;
    revealChest(pull, reward, { sfx, i18n, team: found ? found.team : null });
  });
  $('btnMoreControls').addEventListener('click', () => {
    const extra = $('extraControls');
    extra.hidden = !extra.hidden;
    $('btnMoreControls').textContent = extra.hidden ? i18n.t('moreActions') : i18n.t('close');
    $('btnMoreControls').setAttribute('aria-expanded', String(!extra.hidden));
  });
  $('btnCamera').addEventListener('click', () => {
    const modes = ['broadcast', 'overhead', 'baseline'];
    state.cameraMode = modes[(modes.indexOf(state.cameraMode) + 1) % modes.length];
    if (state.renderer && state.renderer.setCamera) state.renderer.setCamera(state.cameraMode);
    $('btnCamera').textContent = `${i18n.t('camera')} · ${i18n.t(state.cameraMode)}`;
    if (state.renderer && state.renderer.kind !== 'arena') toast(i18n.t('cameraFallback'));
  });
  $('btnReplayGame').addEventListener('click', () => {
    const data = state.lastSummary ? state.data.replays[state.data.replays.length - 1] : null;
    openReplay(data);
  });
  $('btnFinalReplay').addEventListener('click', () => {
    const data = state.data.replays && state.data.replays.length ? state.data.replays[state.data.replays.length - 1] : null;
    openReplay(data);
  });
  $('btnReplayClose').addEventListener('click', closeReplay);
  $('replayModal').addEventListener('click', e => { if (e.target === $('replayModal')) closeReplay(); });
  $('btnReplayPlay').addEventListener('click', () => {
    if (!state.replayPlayer) return;
    if (state.replayPlayer.playing) { state.replayPlayer.pause(); $('btnReplayPlay').textContent = i18n.t('play'); }
    else { state.replayPlayer.play(); $('btnReplayPlay').textContent = i18n.t('pause'); }
  });
  $('replayScrub').addEventListener('input', e => { if (state.replayPlayer) state.replayPlayer.seek(Number(e.target.value) / 100); });
  $('btnReplayExport').addEventListener('click', exportReplay);
  $('btnPlayerClose').addEventListener('click', closePlayerCard);
  $('btnShareCard').addEventListener('click', sharePlayerCard);
  $('btnGridView').addEventListener('click', () => { state.playerViewMode = 'grid'; renderPlayers(); });
  $('btnTableView').addEventListener('click', () => { state.playerViewMode = 'table'; renderPlayers(); });
  $('btnMorePlayers').addEventListener('click', () => { state.playerLimit += 60; renderPlayers(); });
  $('playerModal').addEventListener('click', e => { if (e.target === $('playerModal')) closePlayerCard(); });
  $('btnRotate').addEventListener('click', () => { if (state.avatar) state.avatar.rotate(140); });
  const av = $('avatarCanvas');
  let dragging = false, lastX = 0;
  av.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; av.setPointerCapture(e.pointerId); if (state.avatar) state.avatar.startDrag(); });
  av.addEventListener('pointermove', e => {
    if (!dragging || !state.avatar) return;
    state.avatar.rotate((e.clientX - lastX) * 2);
    lastX = e.clientX;
  });
  av.addEventListener('pointerup', () => { dragging = false; if (state.avatar) state.avatar.endDrag(); });
  av.addEventListener('pointercancel', () => { dragging = false; if (state.avatar) state.avatar.endDrag(); });
  $('btnTipoff').addEventListener('click', startMatch);
  $('btnRematch').addEventListener('click', startMatch);
  $('btnNewMatch').addEventListener('click', newMatch);
  $('btnSwapTeams').addEventListener('click', () => {
    const home = $('selHome').value;
    $('selHome').value = $('selAway').value;
    $('selAway').value = home;
    state.data.matchup.home = $('selHome').value;
    state.data.matchup.away = $('selAway').value;
    applyTeamTheme(teamByCode($('selHome').value), teamByCode($('selAway').value));
    renderMatchupMeta();
    save(state.data);
  });
  $('btnRandom').addEventListener('click', () => {
    const a = state.teams[Math.floor(Math.random() * state.teams.length)];
    let b = state.teams[Math.floor(Math.random() * state.teams.length)];
    while (b.code === a.code) b = state.teams[Math.floor(Math.random() * state.teams.length)];
    $('selHome').value = a.code; $('selAway').value = b.code;
    state.data.matchup.home = a.code;
    state.data.matchup.away = b.code;
    applyTeamTheme(a, b);
    renderMatchupMeta();
    save(state.data);
    toast(`${a.name} vs ${b.name}`);
  });
  ['selHome', 'selAway'].forEach(id => {
    $(id).addEventListener('change', () => {
      state.data.matchup.home = $('selHome').value;
      state.data.matchup.away = $('selAway').value;
      applyTeamTheme(teamByCode($('selHome').value), teamByCode($('selAway').value));
      renderMatchupMeta();
      save(state.data);
    });
  });
  $('selPred').addEventListener('change', () => { state.data.matchup.prediction = $('selPred').value; save(state.data); });
  $('btnPause').addEventListener('click', togglePause);
  document.querySelectorAll('[data-speed]').forEach(b => b.addEventListener('click', () => {
    state.speed = Number(b.dataset.speed) || 1;
    document.querySelectorAll('[data-speed]').forEach(x => x.classList.toggle('active', x === b));
  }));
  function togglePause() {
    if (!state.sim || state.matchPhase !== 'live') return;
    state.paused = !state.paused;
    $('btnPause').textContent = i18n.t(state.paused ? 'resume' : 'pause');
    $('btnPause').classList.toggle('primary', state.paused);
  }
  $('btnSound').addEventListener('click', toggleSound);
  $('btnSimEnd').addEventListener('click', async () => {
    if (!state.sim || state.matchPhase !== 'live') return;
    if (window.ProjectShell && window.ProjectShell.confirm) {
      const ok = await window.ProjectShell.confirm({
        title: i18n.t('skipToFinal'),
        message: i18n.t('skipConfirm'),
        confirmText: i18n.t('skipToFinal')
      });
      if (!ok) return;
    }
    let guard = 0;
    while (!state.sim.finished && guard < 6000) { state.sim.step(); guard += 1; }
    renderMatch(); finalizeMatch();
  });
  $('btnReplay').addEventListener('click', () => {
    if (!state.lastSummary) { toast(i18n.t('noGames')); return; }
    const feed = state.lastSummary.events.slice(-2).map(e => e[i18n.lang === 'en' ? 'en' : 'it']).join(' · ');
    toast(feed || i18n.t('noGames'));
  });
  async function shareResult() {
    if (!state.lastSummary) { toast(i18n.t('noGames')); return; }
    const s = state.lastSummary;
    const text = `${s.home} ${s.score.home}–${s.score.away} ${s.away}`;
    try {
      if (navigator.share) await navigator.share({ title: i18n.t('title'), text });
      else await navigator.clipboard.writeText(text);
      toast(i18n.t('saved'));
    } catch (e) { /* cancelled */ }
  }
  $('btnShare').addEventListener('click', shareResult);
  $('btnShareFinal').addEventListener('click', shareResult);
  $('btnPlayWeek').addEventListener('click', () => {
    const season = ensureSeason();
    const results = playWeek(season, state.rng, true);
    save(state.data);
    renderSeason();
    toast(`${i18n.t('week')} ${season.week}: ${results.length}`);
  });
  $('btnSimSeason').addEventListener('click', () => { playAll(ensureSeason(), state.rng); save(state.data); renderSeason(); });
  $('btnNewSeason').addEventListener('click', () => { state.data.league = newSeason(dailySeed(), seededRandom(dailySeed())); state.data.playoffs = null; save(state.data); renderSeason(); });
  $('btnCreateBracket').addEventListener('click', () => {
    const season = ensureSeason();
    state.data.playoffs = createBracket(season);
    save(state.data); renderPlayoffs();
  });
  $('btnPlayRound').addEventListener('click', () => {
    if (!state.data.playoffs) return;
    playRound(state.data.playoffs, state.rng);
    save(state.data); renderPlayoffs();
  });
  $('btnSaveTeam').addEventListener('click', () => {
    const team = teamByCode($('teamSelect').value);
    if (!team) return;
    team.players.forEach(p => {
      const row = document.querySelector(`tr[data-id="${p.id}"]`);
      if (!row) return;
      p.ovr = Number(row.querySelector('.ovr').value);
      p.off = Number(row.querySelector('.off').value);
      p.def = Number(row.querySelector('.def').value);
    });
    team.strategy.pace = Number($('stratPace').value);
    team.strategy.threeRate = Number($('stratThree').value);
    team.strategy.defense = Number($('stratDef').value);
    team.strategy.rotation = Number($('stratRot').value);
    if (team.custom) {
      const idx = state.data.customTeams.findIndex(t => t.code === team.code);
      if (idx >= 0) state.data.customTeams[idx] = JSON.parse(JSON.stringify(team));
    }
    save(state.data);
    toast(i18n.t('saved'));
  });
  $('btnCreateTeam').addEventListener('click', () => {
    const code = 'U' + String(state.teams.length + 1).padStart(2, '0');
    const team = {
      code, name: 'Custom Team ' + state.teams.length, color: '#00d4ff', conference: 'East', division: 'Atlantic', custom: true,
      strategy: { pace: 50, threeRate: 50, defense: 50, rotation: 50, style: 'balanced' },
      players: Array.from({ length: 8 }, (_, i) => {
        const p = { id: `${code}-${i + 1}`, name: `Player ${i + 1}`, pos: ['PG', 'SG', 'SF', 'PF', 'C'][i % 5], age: 25, ovr: 72, off: 73, def: 71, pot: 78, salary: 3, injury: null, morale: 75 };
        return { ...p, ...playerProfile(p) };
      })
    };
    state.teams.push(team);
    state.data.customTeams.push(JSON.parse(JSON.stringify(team)));
    save(state.data); initSelects(); $('teamSelect').value = code; renderTeams();
  });
  $('teamSelect').addEventListener('change', () => {
    renderTeams();
    $('tradeTeamA').value = $('teamSelect').value;
    fillTradePlayers();
  });
  $('tradeTeamA').addEventListener('change', fillTradePlayers);
  $('tradeTeamB').addEventListener('change', fillTradePlayers);
  $('btnTradePropose').addEventListener('click', async () => {
    const a = teamByCode($('tradeTeamA').value);
    const b = teamByCode($('tradeTeamB').value);
    const pa = $('tradePlayerA').value;
    const pb = $('tradePlayerB').value;
    if (!a || !b || a.code === b.code) { toast(i18n.t('selectTwo')); return; }
    const paName = a.players.find(p => p.id === pa)?.name || '—';
    const pbName = b.players.find(p => p.id === pb)?.name || '—';
    if (window.ProjectShell && window.ProjectShell.confirm) {
      const ok = await window.ProjectShell.confirm({
        title: i18n.t('tradeBuilder'),
        message: i18n.t('tradeConfirm', { a: a.name, pa: paName, b: b.name, pb: pbName }),
        confirmText: i18n.t('proposeTrade')
      });
      if (!ok) return;
    }
    const result = trade(a, b, pa, pb);
    if (!result.ok) { $('tradeResult').textContent = reasonText(result.reason); toast(reasonText(result.reason)); return; }
    Object.assign(a, result.a); Object.assign(b, result.b);
    if (a.custom || b.custom) { state.data.customTeams = state.teams.filter(t => t.custom).map(t => JSON.parse(JSON.stringify(t))); save(state.data); }
    $('tradeResult').textContent = i18n.t('tradeDone', { pa: paName, pb: pbName });
    renderTeams();
    renderMatchupMeta();
    toast(i18n.t('tradeDone', { pa: paName, pb: pbName }));
  });
  $('btnDraft').addEventListener('click', () => {
    const picks = draftClass(4, state.rng);
    const team = teamByCode($('teamSelect').value);
    const signed = signPlayer(team, picks[0]);
    if (!signed.ok) { toast(reasonText(signed.reason)); return; }
    Object.assign(team, signed.team);
    team.players = team.players.map(pl => pl.heightCm ? pl : { ...pl, ...playerProfile(pl) });
    if (team.custom) { state.data.customTeams = state.teams.filter(t => t.custom).map(t => JSON.parse(JSON.stringify(t))); save(state.data); }
    toast(`${i18n.t('drafted')}: ${picks[0].name}`); renderTeams();
  });
  $('faList').addEventListener('click', e => {
    const i = e.target.dataset.sign;
    if (i === undefined) return;
    const team = teamByCode($('teamSelect').value);
    const signed = signPlayer(team, state.free[Number(i)]);
    if (!signed.ok) { toast(reasonText(signed.reason)); return; }
    Object.assign(team, signed.team);
    team.players = team.players.map(pl => pl.heightCm ? pl : { ...pl, ...playerProfile(pl) });
    state.free.splice(Number(i), 1);
    if (team.custom) { state.data.customTeams = state.teams.filter(t => t.custom).map(t => JSON.parse(JSON.stringify(t))); save(state.data); }
    renderTeams();
  });
  ['playerSearch', 'playerTeam', 'playerPos', 'playerRarity', 'playerSort'].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', renderPlayers);
  });
  $('collectionList').addEventListener('click', e => {
    const sell = e.target.closest('[data-sell]');
    if (sell) {
      const found = findPlayer(sell.dataset.sell);
      if (found) {
        const offer = aiOffer(found.player, Math.random, Date.now() / 86400000);
        const result = sellDuplicate(state.data.career, found.player, offer);
        save(state.data);
        renderCards();
        toast(result.ok ? `+${offer}` : i18n.t('statusError'));
      }
      return;
    }
    const up = e.target.closest('[data-upgrade]');
    if (up) {
      const result = upgradeWithCopies(state.data.career, up.dataset.upgrade);
      save(state.data);
      renderCards(); renderHUD();
      toast(result.ok ? i18n.t('saved') : i18n.t('needCredits'));
      return;
    }
    const card = e.target.closest('.card3d');
    if (card) {
      if (e.target.closest('.up')) return;
      card.classList.toggle('flipped');
      return;
    }
    const item = e.target.closest('[data-player-id]');
    if (item) openPlayerCard(item.dataset.playerId);
  });
  $('btnDailyChest').addEventListener('click', claimDailyChestReward);
  $('btnEmptyDailyChest').addEventListener('click', claimDailyChestReward);
  document.querySelectorAll('[data-bet]').forEach(b => b.addEventListener('click', () => {
    state.betType = b.dataset.bet;
    document.querySelectorAll('[data-bet]').forEach(x => x.classList.toggle('active', x === b));
    $('propPanel').hidden = state.betType !== 'prop';
    $('parlayPanel').hidden = state.betType !== 'parlay';
    if (state.betType === 'prop') updatePropOptions();
    renderBetPanel();
  }));
  ['guessHome', 'guessAway', 'guessPred'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('change', renderBetPanel);
  });
  document.querySelectorAll('[data-stake]').forEach(b => b.addEventListener('click', () => {
    state.stake = Number(b.dataset.stake);
    document.querySelectorAll('[data-stake]').forEach(x => x.classList.toggle('active', x === b));
  }));
  $('propType').addEventListener('change', () => { updatePropOptions(); renderBetPanel(); });
  $('propPick').addEventListener('change', renderBetPanel);
  $('btnParlayGames').addEventListener('click', generateParlay);
  $('parlayGames').addEventListener('change', renderBetPanel);
  $('btnGuess').addEventListener('click', placeBet);
  $('btnCraft').addEventListener('click', () => {
    const p = findPlayer($('craftTarget').value);
    if (!p) return;
    const result = craftPlayer(state.data.career, p.player);
    save(state.data);
    renderCards();
    toast(result.ok ? `${i18n.t('unlocked')}: ${p.player.name}` : i18n.t('fragments'));
  });
  $('btnQuickSim').addEventListener('click', quickSim);
  $('btnAdvance').addEventListener('click', () => {
    state.data.career.year += 1;
    state.teams = state.teams.map(t => progressRoster(t, 1, state.rng));
    state.data.customTeams = state.teams.filter(t => t.custom).map(t => JSON.parse(JSON.stringify(t)));
    state.data.league = null; state.data.playoffs = null;
    save(state.data); rebuildMap(); initSelects(); renderCareer(); renderHUD();
    toast(i18n.t('seasonAdvanced'));
  });
  $('quality').addEventListener('change', e => { state.data.settings.quality = e.target.value; save(state.data); resizeCourt(); });
  $('btnInfo').addEventListener('click', () => openModal('infoModal'));
  $('btnInfoClose').addEventListener('click', () => closeModal('infoModal'));
  $('btnInfoCloseBottom').addEventListener('click', () => closeModal('infoModal'));
  $('infoModal').addEventListener('click', e => { if (e.target === $('infoModal')) closeModal('infoModal'); });
  $('btnTourFromHelp').addEventListener('click', () => { closeModal('infoModal'); startTour(); });
  $('btnSettings').addEventListener('click', () => openModal('settingsModal'));
  $('btnSettingsClose').addEventListener('click', () => closeModal('settingsModal'));
  $('settingsModal').addEventListener('click', e => { if (e.target === $('settingsModal')) closeModal('settingsModal'); });
  $('settingsLang').addEventListener('change', e => {
    if (window.ProjectShell && window.ProjectShell.setLang) window.ProjectShell.setLang(e.target.value);
    else { i18n.setLang(e.target.value); i18n.apply(); }
    save(state.data);
  });
  $('settingsSound').addEventListener('change', () => {
    state.data.settings.sound = $('settingsSound').checked;
    sfx.muted = !state.data.settings.sound;
    updateSoundLabel();
    save(state.data);
  });
  $('btnReplayTour').addEventListener('click', () => { closeModal('settingsModal'); startTour(); });
  $('btnResetCards').addEventListener('click', async () => {
    const ok = await confirmAction(i18n.t('resetCards'), i18n.t('resetCardsConfirm'));
    if (!ok) return;
    state.data.career = defaults().career;
    state.cardPane = 'collection';
    save(state.data);
    renderHUD(); renderCards(); renderCareer();
    toast(i18n.t('resetDone'));
  });
  $('btnResetAll').addEventListener('click', async () => {
    const ok = await confirmAction(i18n.t('resetAll'), i18n.t('resetAllConfirm'));
    if (!ok) return;
    state.resetting = true;
    try {
      ['pf.nba.v3', 'pf.nba.v2', 'nba.sim.v1'].forEach(key => localStorage.removeItem(key));
    } catch (e) { /* ignore */ }
    location.reload();
  });
  $('btnWelcomeQuick').addEventListener('click', () => { markOnboarded(); closeModal('welcomeModal'); $('selHome').focus(); });
  $('btnWelcomeSkip').addEventListener('click', () => { markOnboarded(); closeModal('welcomeModal'); });
  $('btnWelcomeTour').addEventListener('click', () => { markOnboarded(); closeModal('welcomeModal'); startTour(); });
  $('btnTourClose').addEventListener('click', finishTour);
  $('btnTourPrev').addEventListener('click', () => { if (state.tourStep > 0) { state.tourStep -= 1; renderTourStep(); } });
  $('btnTourNext').addEventListener('click', () => {
    if (state.tourStep >= TOUR_STEPS.length - 1) { finishTour(); return; }
    state.tourStep += 1; renderTourStep();
  });
  window.addEventListener('popstate', () => {
    const { view, sub } = parseRoute();
    switchView(view, sub, { url: 'none' });
  });
  document.addEventListener('keydown', e => {
    const modal = visibleModal();
    if (modal) {
      trapFocus(e);
      if (e.key === 'Escape') {
        e.preventDefault();
        if (modal.id === 'replayModal') closeReplay();
        else if (modal.id === 'playerModal') closePlayerCard();
        else closeModal(modal.id);
      }
      return;
    }
    if (e.target.closest('input, select, textarea, button, a')) return;
    if (e.code === 'Space' && state.view === 'match' && state.matchPhase === 'live') { e.preventDefault(); togglePause(); }
    else if (e.key.toLowerCase() === 'r' && state.view === 'match') { e.preventDefault(); if (state.matchPhase === 'setup') startMatch(); else newMatch(); }
    else if (e.key.toLowerCase() === 'm') { e.preventDefault(); toggleSound(); }
    else if (e.key === 'Escape') { const open = visibleModal(); if (open) closeModal(open.id); }
  });
  window.addEventListener('resize', () => { if (state.view === 'match') resizeCourt(); });
  window.addEventListener('project:langchange', e => {
    i18n.setLang(e.detail && e.detail.lang);
    i18n.apply();
    renderMatchupMeta(); renderMatch(); renderSeason(); renderTeams(); renderCareer(); renderStats(); renderPlayers(); renderCards();
    if ($('btnCamera')) $('btnCamera').textContent = `${i18n.t('camera')} · ${i18n.t(state.cameraMode)}`;
    updateSoundLabel();
    if (state.matchPhase === 'final') renderFinal();
    if (!$('playerModal').hidden && state.openPlayer) {
      const id = state.openPlayer.id;
      closePlayerCard();
      openPlayerCard(id);
    }
  });
  window.addEventListener('beforeunload', () => { if (!state.resetting) save(state.data); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.sim && !state.sim.finished) {
      state.paused = true;
      if ($('btnPause')) $('btnPause').textContent = i18n.t('resume');
    }
  });
}

function init() {
  rebuildMap();
  i18n.apply();
  ensureDailyState();
  initSelects();
  applyTeamTheme(teamByCode($('selHome').value), teamByCode($('selAway').value));
  bind();
  const credited = claimDailyCredits(state.data.career);
  if (credited) toast(i18n.t('dailyCredits', { amount: credited }));
  sfx.muted = state.data.settings.sound === false;
  updateSoundLabel();
  $('btnCamera').textContent = `${i18n.t('camera')} · ${i18n.t(state.cameraMode)}`;
  renderHUD();
  renderChestShop();
  setInterval(() => { renderHUD(); if (state.view === 'cards' && state.cardPane === 'collection') renderChestShop(); }, 1000);
  updatePropOptions();
  renderBetPanel();
  save(state.data);
  $('quality').value = state.data.settings.quality || 'high';
  $('settingsLang').value = i18n.lang;
  $('settingsVersion').textContent = 'NBA Broadcast Simulator · v3';
  state.renderer = makeRenderer();
  resizeCourt();
  const { view, sub } = parseRoute();
  switchView(view, sub, { url: 'replace' });
  if (!state.data.settings.onboarded) setTimeout(showWelcome, 350);
  requestAnimationFrame(animate);
}

init();
