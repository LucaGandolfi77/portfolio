/* NBA Broadcast Simulator — application controller */

import { TEAMS, TEAM_BY_CODE } from './data/teams.js';
import { I18n } from './i18n.js';
import { load, save, appendHistory, recordPrediction, grantXP } from './core/storage.js';
import { seededRandom, dailySeed } from './core/rng.js';
import { Sim, simulateGame, winProbability } from './sim/engine.js';
import { RARITIES, rarityFor, chestTier, chestReward, applyGuess } from './sim/career-mode.js';
import { newSeason, playWeek, playAll, standingsSorted } from './sim/season.js';
import { createBracket, playRound } from './sim/playoffs.js';
import { freeAgents, signPlayer, trade, draftClass, progressRoster } from './sim/career.js';
import { leaders, efficiency, trueShooting, effectiveFG, zoneCounts, teamTotals } from './sim/stats.js';
import { createCourtGL } from './render/court-gl.js';
import { createCourt2D } from './render/court-2d.js';
import { createArena } from './render/arena.js';
import { createReplayPlayer } from './ui/replay.js';
import { captureReplay, trimReplays, detectHighlights } from './sim/replay.js';
import { SETS, cardSet, fragmentsFor, upgradeCost, applyUpgrade, isDailyChestAvailable, claimDailyChest, setProgress, cardPower, pullOdds, pityPull, craftCost, craftPlayer, setBonus } from './sim/cards.js';
import { winOdds, payout, applyBet, claimDailyCredits, streakBonus, propMarket, propOdds, resolveProp, parlayOdds, resolveParlay } from './sim/betting.js';
import { aiOffer, sellDuplicate } from './sim/market.js';
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
  speed: 1,
  paused: false,
  lastFrame: 0,
  accumulator: 0,
  lastSummary: null,
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
  parlayGames: []
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
  const teamFilter = $('playerTeam');
  if (teamFilter) teamFilter.innerHTML = `<option value="">${i18n.t('allTeams')}</option>` + options;
}

function switchView(view) {
  state.view = view;
  document.querySelectorAll('.view').forEach(el => { el.hidden = el.id !== 'view-' + view; });
  document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  if (view === 'match' && state.renderer) resizeCourt();
  if (view === 'season') renderSeason();
  if (view === 'playoffs') renderPlayoffs();
  if (view === 'teams') renderTeams();
  if (view === 'stats') renderStats();
  if (view === 'career') renderCareer();
  if (view === 'players') renderPlayers();
}

function resizeCourt() {
  const wrap = $('courtWrap');
  const dpr = state.data.settings.quality === 'low' ? 1 : Math.min(2, window.devicePixelRatio || 1);
  if (state.renderer) state.renderer.resize(wrap.clientWidth, wrap.clientHeight, dpr);
}

function animate(now) {
  requestAnimationFrame(animate);
  if (!state.sim || state.paused || state.view !== 'match') return;
  const dt = Math.min(100, now - (state.lastFrame || now));
  state.lastFrame = now;
  state.accumulator += dt * state.speed;
  let guard = 0;
  while (state.accumulator >= 180 && !state.sim.finished && guard < 12) {
    state.sim.step();
    state.accumulator -= 180;
    guard += 1;
  }
  renderMatch();
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
  $('quarter').textContent = sim.overtime ? `OT${sim.overtime}` : `Q${sim.quarter}`;
  $('clock').textContent = fmtClock(sim.clock);
  $('poss').textContent = sim.possession === 'home' ? sim.teams.home.abbr : sim.teams.away.abbr;
  $('momentum').textContent = 'Momentum ' + Math.round(sim.momentum);
  $('clutch').hidden = !sim.clutch;
  const feed = $('feed');
  const recent = sim.events.slice(-40).reverse();
  feed.innerHTML = recent.map(e => `<div><span>${fmtClock(e.clock)}</span>${e[i18n.lang === 'en' ? 'en' : 'it']}</div>`).join('');
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
  $('boxBody').innerHTML = `<table><thead><tr><th>${i18n.t('player')}</th>${heads.map(h => `<th>${h.toUpperCase()}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
}

function startMatch() {
  const home = teamByCode($('selHome').value);
  const away = teamByCode($('selAway').value);
  if (!home || !away || home.code === away.code) { toast(i18n.t('selectTwo')); return; }
  const today = new Date().toDateString();
  const seed = state.data.daily.last === today ? dailySeed() : (Date.now() >>> 0);
  state.data.daily.last = today;
  state.rng = seededRandom(seed);
  state.sim = new Sim(home, away, { rng: state.rng, lang: i18n.lang });
  state.lastSummary = null;
  state.paused = false;
  state.accumulator = 0;
  $('resultCard').hidden = true;
  sfx.init();
  if (!state.renderer) state.renderer = makeRenderer();
  resizeCourt();
  renderMatch();
}

function finalizeMatch() {
  if (state.lastSummary) return;
  const sim = state.sim;
  const summary = sim.summary();
  state.lastSummary = summary;
  const pick = $('selPred').value;
  const correct = recordPrediction(state.data, pick, summary.winner);
  appendHistory(state.data, {
    home: summary.home, away: summary.away, hs: summary.score.home, as: summary.score.away,
    winner: summary.winner, top: leaders(summary.players, 'pts', 1)[0] || {},
    events: summary.events.slice(-80).map(e => ({ it: e.it, en: e.en, clock: e.clock, kind: e.kind })),
    summary: { quarters: summary.quarters, leadChanges: summary.leadChanges }
  });
  grantXP(state.data, correct ? 30 : 10, 'match');
  recordPlayerStats(state.data, summary.players);
  state.data.replays = trimReplays([...(state.data.replays || []), captureReplay(sim)], 5);
  state.data.career.fragments = (state.data.career.fragments || 0) + (correct ? 3 : 1);
  state.data.matchup = { home: summary.home, away: summary.away, prediction: pick };
  save(state.data);
  $('finalText').textContent = `${summary.home} ${summary.score.home} – ${summary.score.away} ${summary.away}`;
  $('resultCard').hidden = false;
  sfx.win();
  toast(correct ? i18n.t('saved') : i18n.t('final'));
}

function ensureSeason() {
  if (!state.data.league) state.data.league = newSeason(dailySeed(), seededRandom(dailySeed()));
  return state.data.league;
}

function renderSeason() {
  const season = ensureSeason();
  $('seasonWeek').textContent = `${i18n.t('week')} ${season.week + 1} / ${season.schedule.length}`;
  const groups = [['East', standingsSorted(season, 'East')], ['West', standingsSorted(season, 'West')]];
  $('standingsBody').innerHTML = groups.map(([conf, list]) => `<h4>${conf}</h4><table><thead><tr><th>#</th><th>Team</th><th>W</th><th>L</th><th>DIFF</th></tr></thead><tbody>` +
    list.slice(0, 10).map((t, i) => `<tr><td>${i + 1}</td><td>${teamByCode(t.code).name}</td><td>${t.w}</td><td>${t.l}</td><td>${t.pf - t.pa}</td></tr>`).join('') + '</tbody></table>').join('');
  $('seasonResults').innerHTML = season.results.slice(-12).reverse().map(r => `<div>${r.home} ${r.hs}–${r.as} ${r.away}</div>`).join('') || i18n.t('noGames');
}

function renderPlayoffs() {
  const b = state.data.playoffs;
  if (!b) { $('bracket').textContent = i18n.t('createBracket'); $('champion').textContent = ''; return; }
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
  $('rosterBody').innerHTML = `<table><thead><tr><th>Name</th><th>Pos</th><th>Age</th><th>OVR</th><th>OFF</th><th>DEF</th><th>${i18n.t('salary')}</th><th>${i18n.t('injury')}</th></tr></thead><tbody>${rows}</tbody></table>`;
  $('stratPace').value = team.strategy.pace;
  $('stratThree').value = team.strategy.threeRate;
  $('stratDef').value = team.strategy.defense;
  $('stratRot').value = team.strategy.rotation;
  if (!state.free.length) state.free = freeAgents(state.teams, 8, state.rng);
  $('faList').innerHTML = state.free.map((p, i) => `<div class="series"><span>${p.name} · ${p.pos} · ${p.ovr}</span><button class="btn" data-sign="${i}">+</button></div>`).join('');
}

function renderStats() {
  const sim = state.sim;
  const source = sim ? Object.values(sim.players) : state.teams.flatMap(t => t.players);
  const top = leaders(source, 'pts', 8);
  $('statLeaders').innerHTML = `<table><thead><tr><th>Player</th><th>PTS</th><th>TS%</th><th>eFG%</th><th>EFF</th></tr></thead><tbody>` +
    top.map(p => `<tr data-player-id="${p.id || ''}"><td>${p.name}</td><td>${p.pts || 0}</td><td>${trueShooting(p).toFixed(3)}</td><td>${effectiveFG(p).toFixed(3)}</td><td>${efficiency(p)}</td></tr>`).join('') + '</tbody></table>';
  const canvas = $('chartPoints');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  const quarters = sim ? sim.quarters : [{ home: 24, away: 20 }, { home: 28, away: 26 }, { home: 18, away: 30 }, { home: 26, away: 22 }];
  const max = Math.max(1, ...quarters.flatMap(q => [q.home, q.away]));
  quarters.forEach((q, i) => {
    const bw = (w / quarters.length) / 3;
    ['home', 'away'].forEach((side, j) => {
      ctx.fillStyle = side === 'home' ? teamByCode($('selHome').value).color : teamByCode($('selAway').value).color;
      ctx.fillRect(i * (w / quarters.length) + bw * j + 6, h - (q[side] / max) * (h - 24), bw - 4, (q[side] / max) * (h - 24));
    });
  });
  const zones = zoneCounts(sim ? sim.shots : []);
  $('chartShots').getContext('2d').clearRect(0, 0, 300, 160);
  $('chartCompare').getContext('2d').clearRect(0, 0, 300, 160);
  $('chartWin').getContext('2d').clearRect(0, 0, 300, 160);
}

function quickSim() {
  if (!state.worker) {
    state.worker = new Worker(new URL('./worker/sim.worker.js', import.meta.url), { type: 'module' });
    state.worker.onmessage = e => {
      $('quickSimResult').textContent = `${e.data.wins}/${e.data.results.length} · avg ${e.data.meanHome.toFixed(1)}`;
    };
  }
  state.worker.postMessage({ id: Date.now(), home: $('selHome').value, away: $('selAway').value, count: 12, seed: dailySeed() });
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

  grid.innerHTML = shown.map(p => `<article class="player-tile" data-player-id="${p.id}" style="--team-color:${p.teamColor}">
    <img src="${miniAvatarUrl(p, { color: p.teamColor })}" alt="${p.name}" loading="lazy">
    <span class="ovr">${p.ovr}</span>
    <span class="name">${p.name}</span>
    <span class="meta"><span>${p.teamCode} · ${p.pos}</span><span class="rarity ${p.rarity}">${i18n.t(p.rarity)}</span></span>
  </article>`).join('');

  table.innerHTML = `<table><thead><tr><th>Player</th><th>Team</th><th>POS</th><th>AGE</th><th>OVR</th><th>Rarity</th></tr></thead><tbody>` +
    shown.map(p => `<tr data-player-id="${p.id}"><td>${p.name}</td><td>${p.teamCode}</td><td>${p.pos}</td><td>${p.age}</td><td>${p.ovr}</td><td><span class="rarity ${p.rarity}">${i18n.t(p.rarity)}</span></td></tr>`).join('') +
    '</tbody></table>';
}

function renderCareer() {
  const c = state.data.career;
  $('careerYear').textContent = c.year;
  $('careerLevel').textContent = c.level;
  $('careerXp').textContent = c.xp;
  $('careerBadges').textContent = (c.badges || []).join(' · ') || '—';
  $('dailyText').textContent = `${i18n.t('daily')} · ${new Date().toDateString()}`;
  const ids = c.collection || [];
  $('collectionInfo').textContent = `${ids.length} ${i18n.t('players')} · ${c.chests || 0} ${i18n.t('chests')} · ${c.streak || 0} ${i18n.t('streak')}`;
  $('fragmentCount').textContent = c.fragments || 0;
  $('btnDailyChest').disabled = !isDailyChestAvailable(c);
  const odds = pullOdds(c.pity || 0);
  $('pullOdds').innerHTML = Object.entries(odds).map(([k, v]) => `<span class="odd">${i18n.t(k)}<b>${v}%</b></span>`).join('');
  $('pityFill').style.width = Math.min(100, ((c.pity || 0) / 40) * 100) + '%';
  $('pityText').textContent = `${i18n.t('pity')} ${c.pity || 0}/40`;
  $('pullHistory').innerHTML = (c.pullHistory || []).map(p => `<span class="rarity ${p.tier}" title="${p.guaranteed ? 'PITY' : ''}">${i18n.t(p.tier)}</span>`).join('');
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
    const level = (c.upgrades || {})[id] || 0;
    return `<div class="card3d" data-player-id="${id}">
      <div class="card3d-inner">
        <div class="card3d-face">
          <img src="${miniAvatarUrl(p, found.team)}" alt="${p.name}" loading="lazy">
          <span class="name">${p.name}</span>
          <span class="rarity ${rarity}">${i18n.t(rarity)} · ${SETS[cardSet(p)].name}</span>
          <span class="meta">${cardPower(p, level)} ${level ? '+' + level : ''}</span>
          <div class="card-actions">
            <button class="btn up" data-upgrade="${id}">${level >= 5 ? i18n.t('maxed') : `${i18n.t('upgrade')} · ${upgradeCost(level)}`}</button>
            ${(c.duplicates || {})[id] ? `<button class="btn up" data-sell="${id}">${i18n.t('share')} · ${aiOffer(p, Math.random, Date.now() / 86400000)}</button>` : ''}
          </div>
        </div>
        <div class="card3d-face card3d-back">
          <b>${p.name}</b><p>${p.pos} · ${found.team.name} · ${p.age}</p>
          <p>${playerNotes(p, i18n.lang, found.team.name).trivia}</p>
        </div>
      </div>
    </div>`;
  }).join('') || i18n.t('noGames');
}

function totalSetBonus() {
  return Object.keys(SETS).reduce((a, key) => a + setBonus(state.data.career, state.teams, key), 0);
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
    html = ['home', 'away', 'tie'].map(k => `<span class="odd">${k.toUpperCase()}<b>${odds.odds[k].toFixed(2)}</b></span>`).join('');
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
    if (reward.player) {
      if (reward.duplicate) {
        c.duplicates = c.duplicates || {};
        c.duplicates[reward.player.id] = (c.duplicates[reward.player.id] || 0) + 1;
        c.fragments = (c.fragments || 0) + fragmentsFor(pull.tier);
      } else if (!c.collection.includes(reward.player.id)) c.collection.push(reward.player.id);
      chestText = `${i18n.t(RARITIES[pull.tier].label.toLowerCase())} · ${reward.duplicate ? i18n.t('duplicate') : `${i18n.t('unlocked')}: ${reward.player.name}`}`;
    }
    c.chests = (c.chests || 0) + 1;
    c.guesses = (c.guesses || 0) + 1;
  } else { c.guesses = (c.guesses || 0) + 1; }

  save(state.data);
  const el = $('guessResult');
  el.className = 'guess-result ' + (won ? 'good' : 'bad');
  el.textContent = `${won ? i18n.t('correct') : i18n.t('wrong')} · ${text} · ${delta > 0 ? '+' : ''}${delta} ${chestText}`;
  renderBetPanel();
  renderCareer();
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

function bind() {
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => switchView(b.dataset.view)));
  const openFromRow = id => { if (id) openPlayerCard(id); };
  ['boxBody', 'rosterBody', 'statLeaders'].forEach(container => {
    const el = $(container);
    if (!el) return;
    el.addEventListener('click', e => {
      const row = e.target.closest('[data-player-id]');
      if (row) openFromRow(row.dataset.playerId);
    });
  });
  $('btnCamera').addEventListener('click', () => {
    const modes = ['broadcast', 'overhead', 'baseline'];
    state.cameraMode = modes[(modes.indexOf(state.cameraMode) + 1) % modes.length];
    if (state.renderer && state.renderer.setCamera) state.renderer.setCamera(state.cameraMode);
    $('btnCamera').textContent = 'CAM · ' + i18n.t(state.cameraMode === 'baseline' ? 'away' : state.cameraMode);
    if (state.renderer && state.renderer.kind !== 'arena') toast(i18n.t('camera'));
  });
  $('btnReplayGame').addEventListener('click', () => {
    const data = state.lastSummary ? state.data.replays[state.data.replays.length - 1] : null;
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
  $('btnRandom').addEventListener('click', () => {
    const a = state.teams[Math.floor(Math.random() * state.teams.length)];
    let b = state.teams[Math.floor(Math.random() * state.teams.length)];
    while (b.code === a.code) b = state.teams[Math.floor(Math.random() * state.teams.length)];
    $('selHome').value = a.code; $('selAway').value = b.code;
    startMatch();
  });
  $('selHome').addEventListener('change', () => { state.data.matchup.home = $('selHome').value; applyTeamTheme(teamByCode($('selHome').value), teamByCode($('selAway').value)); save(state.data); });
  $('selAway').addEventListener('change', () => { state.data.matchup.away = $('selAway').value; applyTeamTheme(teamByCode($('selHome').value), teamByCode($('selAway').value)); save(state.data); });
  $('selPred').addEventListener('change', () => { state.data.matchup.prediction = $('selPred').value; save(state.data); });
  $('btnPause').addEventListener('click', () => { state.paused = !state.paused; $('btnPause').textContent = i18n.t(state.paused ? 'resume' : 'pause'); });
  $('btnSpeed').addEventListener('click', () => {
    state.speed = state.speed === 1 ? 4 : state.speed === 4 ? 12 : 1;
    $('btnSpeed').textContent = i18n.t('speed') + ' ×' + state.speed;
  });
  $('btnSound').addEventListener('click', () => { sfx.init(); $('btnSound').textContent = i18n.t('sound') + (sfx.toggle() ? ' ✕' : ''); });
  $('btnSimEnd').addEventListener('click', () => {
    if (!state.sim) return;
    let guard = 0;
    while (!state.sim.finished && guard < 6000) { state.sim.step(); guard += 1; }
    renderMatch(); finalizeMatch();
  });
  $('btnReplay').addEventListener('click', () => {
    if (!state.lastSummary) return;
    const feed = state.lastSummary.events.slice(-40).map(e => e[i18n.lang === 'en' ? 'en' : 'it']).join('\n');
    toast(feed.slice(-160));
  });
  $('btnShare').addEventListener('click', async () => {
    if (!state.lastSummary) return;
    const s = state.lastSummary;
    const text = `${s.home} ${s.score.home}–${s.score.away} ${s.away}`;
    try {
      if (navigator.share) await navigator.share({ title: i18n.t('title'), text });
      else await navigator.clipboard.writeText(text);
      toast(i18n.t('saved'));
    } catch (e) { /* cancelled */ }
  });
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
  $('teamSelect').addEventListener('change', renderTeams);
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
  $('btnTrade').addEventListener('click', () => {
    const a = teamByCode($('selHome').value), b = teamByCode($('selAway').value);
    const result = trade(a, b, a.players[0].id, b.players[0].id);
    if (!result.ok) { toast(result.reason); return; }
    Object.assign(a, result.a); Object.assign(b, result.b);
    if (a.custom || b.custom) { state.data.customTeams = state.teams.filter(t => t.custom).map(t => JSON.parse(JSON.stringify(t))); save(state.data); }
    renderTeams(); toast(i18n.t('trade'));
  });
  $('btnDraft').addEventListener('click', () => {
    const picks = draftClass(4, state.rng);
    const team = teamByCode($('teamSelect').value);
    const signed = signPlayer(team, picks[0]);
    if (!signed.ok) { toast(signed.reason); return; }
    Object.assign(team, signed.team);
    team.players = team.players.map(pl => pl.heightCm ? pl : { ...pl, ...playerProfile(pl) });
    if (team.custom) { state.data.customTeams = state.teams.filter(t => t.custom).map(t => JSON.parse(JSON.stringify(t))); save(state.data); }
    toast(picks[0].name); renderTeams();
  });
  $('faList').addEventListener('click', e => {
    const i = e.target.dataset.sign;
    if (i === undefined) return;
    const team = teamByCode($('teamSelect').value);
    const signed = signPlayer(team, state.free[Number(i)]);
    if (!signed.ok) { toast(signed.reason); return; }
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
        renderCareer();
        toast(result.ok ? `+${offer}` : i18n.t('statusError'));
      }
      return;
    }
    const up = e.target.closest('[data-upgrade]');
    if (up) {
      const result = applyUpgrade(state.data.career, up.dataset.upgrade);
      save(state.data);
      renderCareer();
      toast(result.ok ? i18n.t('saved') : i18n.t('fragments'));
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
  $('btnDailyChest').addEventListener('click', () => {
    const c = state.data.career;
    if (!claimDailyChest(c)) return;
    const tier = chestTier(0, seededRandom(Date.now() >>> 0));
    const reward = chestReward(tier, state.teams, c.collection || [], seededRandom((Date.now() ^ 0x1234) >>> 0));
    if (reward.player && !c.collection.includes(reward.player.id)) c.collection.push(reward.player.id);
    c.fragments = (c.fragments || 0) + (reward.duplicate ? fragmentsFor(tier) : 1);
    c.chests = (c.chests || 0) + 1;
    c.xp += RARITIES[tier].xp;
    save(state.data);
    renderCareer();
    toast(reward.player ? `${i18n.t('unlocked')}: ${reward.player.name}` : i18n.t('duplicate'));
  });
  document.querySelectorAll('[data-bet]').forEach(b => b.addEventListener('click', () => {
    state.betType = b.dataset.bet;
    document.querySelectorAll('[data-bet]').forEach(x => x.classList.toggle('active', x === b));
    $('propPanel').hidden = state.betType !== 'prop';
    $('parlayPanel').hidden = state.betType !== 'parlay';
    if (state.betType === 'prop') updatePropOptions();
    renderBetPanel();
  }));
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
    renderCareer();
    toast(result.ok ? `${i18n.t('unlocked')}: ${p.player.name}` : i18n.t('fragments'));
  });
  $('btnQuickSim').addEventListener('click', quickSim);
  $('btnAdvance').addEventListener('click', () => {
    state.data.career.year += 1;
    state.teams = state.teams.map(t => progressRoster(t, 1, state.rng));
    state.data.customTeams = state.teams.filter(t => t.custom).map(t => JSON.parse(JSON.stringify(t)));
    state.data.league = null; state.data.playoffs = null;
    save(state.data); rebuildMap(); initSelects(); renderCareer();
  });
  $('quality').addEventListener('change', e => { state.data.settings.quality = e.target.value; save(state.data); resizeCourt(); });
  $('btnInfo').addEventListener('click', () => { $('infoModal').hidden = false; });
  $('btnInfoClose').addEventListener('click', () => { $('infoModal').hidden = true; });
  $('infoModal').addEventListener('click', e => { if (e.target === $('infoModal')) $('infoModal').hidden = true; });
  window.addEventListener('resize', () => { if (state.view === 'match') resizeCourt(); });
  window.addEventListener('project:langchange', e => {
    i18n.setLang(e.detail && e.detail.lang);
    i18n.apply();
    renderMatch(); renderSeason(); renderTeams(); renderCareer(); renderPlayers();
    if (!$('playerModal').hidden && state.openPlayer) {
      const id = state.openPlayer.id;
      closePlayerCard();
      openPlayerCard(id);
    }
  });
  window.addEventListener('beforeunload', () => save(state.data));
  document.addEventListener('visibilitychange', () => { if (document.hidden && state.sim && !state.sim.finished) state.paused = true; });
}

function init() {
  rebuildMap();
  i18n.apply();
  initSelects();
  applyTeamTheme(teamByCode($('selHome').value), teamByCode($('selAway').value));
  bind();
  claimDailyCredits(state.data.career);
  updatePropOptions();
  renderBetPanel();
  save(state.data);
  $('quality').value = state.data.settings.quality || 'high';
  state.renderer = makeRenderer();
  resizeCourt();
  const requested = new URLSearchParams(location.search).get('view');
  switchView(['match', 'season', 'playoffs', 'teams', 'stats', 'career', 'players'].includes(requested) ? requested : 'match');
  requestAnimationFrame(animate);
}

init();
