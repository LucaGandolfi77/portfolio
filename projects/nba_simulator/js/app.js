/* NBA Broadcast Simulator — application controller */

import { TEAMS, TEAM_BY_CODE } from './data/teams.js';
import { I18n } from './i18n.js';
import { load, save, appendHistory, recordPrediction, grantXP } from './core/storage.js';
import { seededRandom, dailySeed } from './core/rng.js';
import { Sim, winProbability } from './sim/engine.js';
import { newSeason, playWeek, playAll, standingsSorted } from './sim/season.js';
import { createBracket, playRound } from './sim/playoffs.js';
import { freeAgents, signPlayer, trade, draftClass, progressRoster } from './sim/career.js';
import { leaders, efficiency, trueShooting, effectiveFG, zoneCounts, teamTotals } from './sim/stats.js';
import { createCourtGL } from './render/court-gl.js';
import { createCourt2D } from './render/court-2d.js';
import { createAvatar } from './render/avatar.js';
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
  openTeam: null
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
      if (p) players.push({ side, pos: p.pos, name: p.name });
    });
  }
  const shot = sim.shots[sim.shots.length - 1];
  return {
    players,
    homeColor: sim.teams.home.color,
    awayColor: sim.teams.away.color,
    ball: shot ? { x: shot.x / 500, y: shot.y / 500 } : { x: 0.5, y: 0.5 }
  };
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
  if (state.renderer) state.renderer.draw(courtState(), performance.now());
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
  if (!state.renderer) {
    const canvas = $('court');
    state.renderer = createCourtGL(canvas) || createCourt2D(canvas);
  }
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

function renderCareer() {
  const c = state.data.career;
  $('careerYear').textContent = c.year;
  $('careerLevel').textContent = c.level;
  $('careerXp').textContent = c.xp;
  $('careerBadges').textContent = (c.badges || []).join(' · ') || '—';
  $('dailyText').textContent = `${i18n.t('daily')} · ${new Date().toDateString()}`;
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
  $('playerName').textContent = player.name;
  $('playerTeam').textContent = `${team.name} · ${player.pos}`;
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
  $('playerAdvanced').innerHTML = [
    ['PER', adv.per], ['TS%', adv.ts], ['eFG%', adv.efg], ['OVR', player.ovr], ['OFF', player.off], ['DEF', player.def], ['POT', player.pot]
  ].map(([k, v]) => `<span class="stat-chip">${k}: <b>${v}</b></span>`).join('');
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

function closePlayerCard() {
  $('playerModal').hidden = true;
  cancelAnimationFrame(state.avatarFrame);
  state.openPlayer = null;
  state.openTeam = null;
}

function bind() {
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => switchView(b.dataset.view)));
  const openFromRow = id => { if (id) openPlayerCard(id); };
  ['boxBody', 'rosterBody', 'statLeaders'].forEach(container => {
    const el = $(container);
    if (!el) return;
    el.addEventListener('click', e => {
      const row = e.target.closest('tr[data-player-id]');
      if (row) openFromRow(row.dataset.playerId);
    });
  });
  $('btnPlayerClose').addEventListener('click', closePlayerCard);
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
  $('selHome').addEventListener('change', () => { state.data.matchup.home = $('selHome').value; save(state.data); });
  $('selAway').addEventListener('change', () => { state.data.matchup.away = $('selAway').value; save(state.data); });
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
    renderMatch(); renderSeason(); renderTeams(); renderCareer();
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
  bind();
  $('quality').value = state.data.settings.quality || 'high';
  state.renderer = createCourtGL($('court')) || createCourt2D($('court'));
  resizeCourt();
  switchView('match');
  requestAnimationFrame(animate);
}

init();
