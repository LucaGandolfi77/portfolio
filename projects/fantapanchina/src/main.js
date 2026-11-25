/* ============================================================================
   FANTAPANCHINA — bootstrap, loop, routing, interazioni.
   ============================================================================ */
import * as CFG from './config.js';
import { Store } from './state.js';
import { loadRaw, migrate, save, clear, offlineReport } from './persistence.js';
import * as Sim from './sim.js';
import * as Audio from './audio.js';
import * as Hud from './views/hud.js';
import * as Squadra from './views/squadra.js';
import * as Mercato from './views/mercato.js';
import * as Strutture from './views/strutture.js';
import * as Classifica from './views/classifica.js';
import * as Quest from './views/quest.js';
import * as Collezione from './views/collezione.js';
import { createMatchView } from './views/match.js';
import { esc } from './views/util.js';

/* ---------------------------------------------------------------- bootstrap */
const loaded = migrate(loadRaw());
const state = loaded || Sim.createInitialState();
const store = new Store(state);

let activeTab = 'squadra';
let colUI = { sub: 'bauli', scope: 'tutte', role: 'all', rarity: 'all' };
let ips = Sim.calcFCPerSec(state);
let lastTime = 0;
let lastTick = 0;
let acc = 0;
let pendingMatch = null;
let toastTimer = null;

const app = document.getElementById('app');
app.innerHTML = `
  <div id="hud-root"></div>
  <section class="tap-zone" id="tap-zone">
    <div class="tap-glow"></div>
    <button class="mister" id="mister-btn" aria-label="Tappa il mister">
      <span class="mister-face">🗣️</span>
      <span class="mister-ring"></span>
    </button>
    <div class="tap-copy"><b>TAP IL MISTER</b><small>guadagna FC · mantieni la combo</small></div>
    <div class="combo-chip" id="combo-chip">×1</div>
    <div class="tap-float-layer" id="tap-floats"></div>
  </section>
  <nav class="tabs" id="tabs">
    <button class="tab on" data-tab="squadra">⚽ <span>Squadra</span></button>
    <button class="tab" data-tab="mercato">🏷️ <span>Mercato</span></button>
    <button class="tab" data-tab="collezione">🃏 <span>Collezione</span><b class="tab-badge" id="tab-badge" hidden></b></button>
    <button class="tab" data-tab="strutture">🏗️ <span>Strutture</span></button>
    <button class="tab" data-tab="classifica">🏆 <span>Classifica</span></button>
    <button class="tab" data-tab="quest">🎯 <span>Obiettivi</span></button>
  </nav>
  <main class="panel" id="panel-content"></main>
  <section class="feed"><div class="feed-head" id="feed-head"><span>📰 Live feed</span><span id="feed-caret">▼</span></div>
    <div class="feed-body" id="feed-body"></div></section>
  <footer class="bottom"><button data-action="menu">⚙️ Impostazioni</button><span>FantaPanchina · idle football</span>
    <button data-action="reset">🔄 Reset</button></footer>
  <div id="toast" class="toast"></div>
  <div id="modal" class="modal" hidden><div class="modal-card" id="modal-card"></div></div>
  <div id="match-overlay" class="match-overlay" hidden>
    <div class="match-card">
      <div class="match-head"><span>🔴 LIVE · Giornata <b id="match-g">0</b></span>
        <div class="match-controls">
          <button class="mspeed" data-speed="1">×1</button><button class="mspeed on" data-speed="2">×2</button>
          <button class="mspeed" data-speed="4">×4</button><button data-action="match-skip">⏭ Skip</button>
        </div></div>
      <canvas id="match-canvas"></canvas>
      <div class="match-foot"><span id="match-sub">La partita è iniziata!</span>
        <button class="btn-ghost" data-action="match-close">Chiudi</button></div>
    </div>
  </div>`;

document.getElementById('hud-root').innerHTML = Hud.html();

/* -------------------------------------------------------------- match view */
const match = createMatchView({
  onGoal: team => {
    Audio.play('goal', state.settings.sound);
    (team === 'us' ? document.getElementById('mister-btn') : document.getElementById('match-canvas')).classList.add('celebrate');
    setTimeout(() => document.querySelectorAll('.celebrate').forEach(e => e.classList.remove('celebrate')), 650);
  },
  onEvent: e => { if (e.type === 'yellow') Audio.play('whistle', state.settings.sound); },
  onDone: res => {
    const ov = document.getElementById('match-overlay');
    document.getElementById('match-sub').textContent =
      `Fischio finale · ${res.scoreUs}-${res.scoreAi}. La tua squadra ha giocato.`;
    setTimeout(() => { ov.hidden = true; showToast('Giornata completata · +FP e mercato aggiornato'); }, 1600);
    if (!state.mercato.length) Sim.generateMercato(state);
    refreshAll();
  }
});
match.mount(document.getElementById('match-canvas'));

/* ------------------------------------------------------------------- render */
const PANELS = {
  squadra: Squadra.html,
  mercato: Mercato.html,
  collezione: s => Collezione.html(s, colUI),
  strutture: Strutture.html,
  classifica: Classifica.html,
  quest: Quest.html
};
function activateTab(name) {
  activeTab = name;
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x.dataset.tab === name));
  renderPanel();
}
function renderPanel() {
  const el = document.getElementById('panel-content');
  el.innerHTML = PANELS[activeTab](state);
  el.scrollTop = 0;
}
function renderFeed() {
  const body = document.getElementById('feed-body');
  const feed = state.feed.slice(0, 18);
  body.innerHTML = feed.length
    ? feed.map(f => `<div class="feed-item t-${f.type}"><span class="fi-dot"></span><span>${esc(f.msg)}</span></div>`).join('')
    : '<div class="feed-empty">Il feed si riempie durante le giornate.</div>';
}
function refreshBadges() {
  const badge = document.getElementById('tab-badge');
  if (!badge) return;
  const n = (state.chests || []).length;
  badge.textContent = n > 0 ? String(n) : '';
  badge.hidden = n <= 0;
  badge.classList.toggle('hot', n > 0);
}
function refreshAll() {
  ips = Sim.calcFCPerSec(state);
  renderPanel();
  renderFeed();
  refreshBadges();
  store.set({});
}

function hydrateCollections(now) {
  now = now || Date.now();
  Sim.syncAllRosterCards(state);
  Sim.recomputeCollectionStats(state);
  Sim.maintainChests(state, now);
  if (!state.chests.length && !state.chestQueue.length && !(state.stats.chestsOpened > 0)) {
    Sim.grantChest(state, 'legno', 'benvenuto nella collezione');
  }
  Sim.ensureMerchant(state, now);
  if (!state.mercato.length) Sim.generateMercato(state);
  refreshBadges();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
}

function showModal(html) {
  document.getElementById('modal-card').innerHTML = html;
  document.getElementById('modal').hidden = false;
}
function closeModal() { document.getElementById('modal').hidden = true; }

function showOfflineModal(report, giornate, fp, fc) {
  const chests = (state.chests || []).length + (state.chestQueue || []).length;
  showModal(`<div class="modal-icon">🌙</div><h2>Bentornato!</h2>
    <p>Sei stato via per ${Math.round(report.elapsed / 60000)} minuti${report.wasCapped ? ' (max 8h)' : ''}.</p>
    <div class="modal-reward">La squadra ha giocato <b>${giornate}</b> giornate</div>
    <div class="modal-reward">+${CFG.formatNum(fp)} FP · +${CFG.formatNum(fc)} FC</div>
    ${chests ? `<div class="modal-reward">🎁 ${chests} bauli in attesa</div>` : ''}
    <button class="btn-primary" data-action="close-modal">INCASSA!</button>`);
}

/* -------------------------------------------------------------------- tabs */
document.getElementById('tabs').addEventListener('click', e => {
  const b = e.target.closest('[data-tab]');
  if (!b) return;
  Audio.play('tap', state.settings.sound);
  activateTab(b.dataset.tab);
});

/* --------------------------------------------------------------- tap mister */
const tapZone = document.getElementById('tap-zone');
const mister = document.getElementById('mister-btn');
let combo = 0, comboTimer = null;
function doTap(e) {
  if (e && e.target.closest('[data-action]')) return;
  const r = Sim.tapMister(state);
  combo = r.combo;
  Audio.play(combo > 0 && combo % 10 === 0 ? 'combo' : 'tap', state.settings.sound);
  const chip = document.getElementById('combo-chip');
  chip.textContent = '×' + Math.min(combo, 99);
  chip.classList.remove('pop'); void chip.offsetWidth; chip.classList.add('pop');
  const zoneRect = tapZone.getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'tap-float';
  f.textContent = '+' + CFG.formatNum(r.gain);
  f.style.left = ((e ? e.clientX : innerWidth / 2) - zoneRect.left) + 'px';
  f.style.top = ((e ? e.clientY : innerHeight / 2) - zoneRect.top) + 'px';
  document.getElementById('tap-floats').appendChild(f);
  setTimeout(() => f.remove(), 900);
  clearTimeout(comboTimer);
  comboTimer = setTimeout(() => { combo = 0; chip.textContent = '×1'; }, 1300);
  store.set({ fc: state.fc });
  Sim.checkQuests(state);
}
mister.addEventListener('pointerdown', e => { e.preventDefault(); doTap(e); });
tapZone.addEventListener('pointerdown', e => { if (e.target === tapZone || e.target.classList.contains('tap-copy')) doTap(e); });

/* ---------------------------------------------------------- event delegation */
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action],[data-tab],[data-speed]');
  if (!btn) return;
  if (btn.dataset.tab) return;
  const action = btn.dataset.action;
  let res;

  if (action === 'sound') {
    state.settings.sound = !state.settings.sound;
    showToast(state.settings.sound ? 'Audio attivo' : 'Audio disattivato');
    refreshAll();
  } else if (action === 'menu' || action === 'settings') {
    showModal(`<div class="modal-icon">⚙️</div><h2>Impostazioni</h2>
      <div class="settings-row"><span>🔊 Audio</span><button class="chip-btn" data-action="sound">${state.settings.sound ? 'ON' : 'OFF'}</button></div>
      <div class="settings-row"><span>🎬 Animazioni</span><button class="chip-btn" data-action="motion">${state.settings.motion ? 'ON' : 'OFF'}</button></div>
      <div class="settings-row"><span>💾 Esporta salvataggio</span><button class="chip-btn" data-action="export">JSON</button></div>
      <div class="settings-row"><span>📥 Importa salvataggio</span><button class="chip-btn" data-action="import">JSON</button></div>
      <button class="btn-primary" data-action="close-modal">CHIUDI</button>`);
  } else if (action === 'motion') {
    state.settings.motion = !state.settings.motion;
    document.body.classList.toggle('no-motion', !state.settings.motion);
    showModal(document.getElementById('modal-card').innerHTML.replace(/data-action="motion"[^>]*>[^<]*</,
      `data-action="motion">${state.settings.motion ? 'ON' : 'OFF'}<`));
  } else if (action === 'close-modal') closeModal();
  else if (action === 'buy') {
    res = Sim.buyPlayer(state, btn.dataset.id);
    Audio.play(res.ok ? 'buy' : 'error', state.settings.sound);
    showToast(res.ok ? `Acquistato ${res.player.name}!` : res.msg);
    if (res.ok) showModal(`<div class="modal-icon">🎉</div><h2>ACQUISTO!</h2>
      <div class="modal-player">${esc(res.player.name)}</div>
      <p>${esc(res.comment)}</p><button class="btn-primary" data-action="close-modal">CONTINUA</button>`);
    refreshAll();
  } else if (action === 'upgrade') {
    res = Sim.upgrade(state, btn.dataset.id);
    Audio.play(res.ok ? 'upgrade' : 'error', state.settings.sound);
    showToast(res.ok ? 'Struttura potenziata!' : res.msg);
    refreshAll();
  } else if (action === 'prestige') {
    res = Sim.doPrestige(state);
    if (res.ok) {
      Object.keys(state).forEach(k => delete state[k]);
      Object.assign(state, res.state);
      hydrateCollections();
      Audio.play('prestige', state.settings.sound);
      showModal(`<div class="modal-icon">🏆</div><h2>SCUDETTO D'ORO #${state.scudettiDoro}</h2>
        <p>Nuova stagione! +25% income permanente. La collezione resta tua.</p>
        <button class="btn-primary" data-action="close-modal">NUOVA STAGIONE</button>`);
    } else showToast(res.msg);
    refreshAll();
  } else if (action === 'formation') {
    state.formation = CFG.FORMATIONS[(CFG.FORMATIONS.indexOf(state.formation) + 1) % CFG.FORMATIONS.length];
    showToast('Modulo: ' + state.formation); renderPanel();
  } else if (action === 'toggle-player') {
    const p = state.players.find(x => x.id === btn.dataset.id);
    if (p) { p.titolare = !p.titolare; renderPanel(); }
  } else if (action === 'refresh-market') {
    Sim.generateMercato(state); Audio.play('tap', state.settings.sound); renderPanel();
  } else if (action === 'col-tab') {
    colUI.sub = btn.dataset.sub || 'bauli';
    Audio.play('tap', state.settings.sound);
    renderPanel();
  } else if (action === 'col-scope') {
    colUI.scope = btn.dataset.value || 'tutte';
    renderPanel();
  } else if (action === 'col-role') {
    colUI.role = btn.dataset.value || 'all';
    renderPanel();
  } else if (action === 'col-rarity') {
    colUI.rarity = btn.dataset.value || 'all';
    renderPanel();
  } else if (action === 'open-chest') {
    res = Sim.openChest(state, btn.dataset.id);
    if (res.ok) {
      Audio.play('chest', state.settings.sound);
      if (res.levelUp) setTimeout(() => Audio.play('combo', state.settings.sound), 260);
      showModal(Collezione.revealHtml(res));
      Sim.maintainChests(state, Date.now());
      refreshAll();
    } else showToast(res.msg);
  } else if (action === 'chest-buy') {
    res = Sim.buyChest(state, btn.dataset.tier);
    Audio.play(res.ok ? 'buy' : 'error', state.settings.sound);
    showToast(res.ok ? (res.queued ? 'Baule in coda: slot pieni' : 'Baule aggiunto!') : res.msg);
    refreshAll();
  } else if (action === 'merchant-reroll') {
    res = Sim.rerollMerchant(state);
    Audio.play(res.ok ? 'tap' : 'error', state.settings.sound);
    showToast(res.ok ? 'Offerte rimescolate' : res.msg);
    refreshAll();
  } else if (action === 'merchant-trade') {
    res = Sim.tradeMerchant(state, btn.dataset.id);
    if (res.ok) {
      Audio.play('trade', state.settings.sound);
      if (res.levelUp) setTimeout(() => Audio.play('combo', state.settings.sound), 260);
      showModal(Collezione.revealHtml(res));
      refreshAll();
    } else showToast(res.msg);
  } else if (action === 'deploy-card') {
    res = Sim.deployCard(state, btn.dataset.id);
    if (res.ok) {
      closeModal();
      showToast(`${res.player.name} entra in rosa!`);
      Audio.play('buy', state.settings.sound);
      refreshAll();
    } else if (res.needReplace) {
      showModal(Collezione.replaceHtml(state, btn.dataset.id));
    } else showToast(res.msg);
  } else if (action === 'choose-replace') {
    res = Sim.deployCard(state, btn.dataset.cardId, btn.dataset.outId);
    if (res.ok) {
      closeModal();
      showToast(`${res.player.name} entra in rosa!`);
      Audio.play('buy', state.settings.sound);
      refreshAll();
    } else showToast(res.msg);
  } else if (action === 'remove-card') {
    res = Sim.removeCardFromRoster(state, btn.dataset.id);
    if (res.ok) {
      closeModal();
      showToast(`${res.removed.name} torna in collezione`);
      refreshAll();
    } else showToast(res.msg);
  } else if (action === 'card-detail') {
    showModal(Collezione.cardDetailHtml(state, btn.dataset.id));
  } else if (action === 'goto-collezione') {
    closeModal();
    colUI.sub = 'carte';
    colUI.scope = 'owned';
    colUI.role = 'all';
    colUI.rarity = 'all';
    activateTab('collezione');
  } else if (action === 'share') {
    shareTeam();
  } else if (action === 'reset') {
    showModal(`<div class="modal-icon">🧹</div><h2>Ricominciare?</h2><p>Tutti i progressi saranno cancellati.</p>
      <button class="btn-primary" data-action="confirm-reset">SÌ, RESET</button>
      <button class="btn-ghost" data-action="close-modal">ANNULLA</button>`);
  } else if (action === 'confirm-reset') {
    clear(); Object.keys(state).forEach(k => delete state[k]);
    Object.assign(state, Sim.createInitialState());
    hydrateCollections(); closeModal(); refreshAll(); showToast('Nuova partita!');
  } else if (action === 'export') {
    const blob = new Blob([JSON.stringify(state)], { type:'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'fantapanchina-save.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
    showToast('Salvataggio esportato');
  } else if (action === 'import') {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const d = JSON.parse(rd.result);
          const next = migrate(d);
          if (!next) throw new Error('salvataggio non valido');
          Object.keys(state).forEach(k => delete state[k]);
          Object.assign(state, next);
          hydrateCollections();
          closeModal(); refreshAll(); showToast('Salvataggio importato');
        } catch (err) { showToast('File non valido'); }
      };
      rd.readAsText(f);
    };
    inp.click();
  } else if (action === 'match-skip') match.skip();
  else if (action === 'match-close') { match.stop(); document.getElementById('match-overlay').hidden = true; }
  if (btn.dataset.speed) {
    match.setSpeed(+btn.dataset.speed);
    document.querySelectorAll('.mspeed').forEach(x => x.classList.toggle('on', x === btn));
  }
});

document.getElementById('feed-head').addEventListener('click', () => {
  const body = document.getElementById('feed-body');
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  document.getElementById('feed-caret').textContent = open ? '▶' : '▼';
});

/* ------------------------------------------------------------------- share */
function shareTeam() {
  const c = document.createElement('canvas'); c.width = 720; c.height = 400;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 720, 400);
  g.addColorStop(0, '#0a1524'); g.addColorStop(1, '#141d33');
  x.fillStyle = g; x.fillRect(0, 0, 720, 400);
  x.fillStyle = '#3ee6ff'; x.font = '800 34px Inter,sans-serif';
  x.fillText('FANTAPANCHINA', 40, 62);
  x.fillStyle = '#dce8ff'; x.font = '700 18px Inter,sans-serif';
  x.fillText('La mia squadra · Giornata ' + state.giornata, 40, 94);
  const best = state.players.slice().sort((a, b) => b.skill - a.skill).slice(0, 6);
  best.forEach((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    x.fillStyle = 'rgba(255,255,255,.06)';
    x.fillRect(40 + col * 220, 130 + row * 110, 200, 90);
    x.fillStyle = '#52ff9e'; x.font = '800 16px Inter,sans-serif';
    x.fillText('★ ' + p.skill.toFixed(1), 54 + col * 220, 158 + row * 110);
    x.fillStyle = '#f2f5ff'; x.font = '700 14px Inter,sans-serif';
    x.fillText(p.name.slice(0, 24), 54 + col * 220, 186 + row * 110);
  });
  x.fillStyle = '#8fa3c4'; x.font = '600 13px Inter,sans-serif';
  x.fillText(`${state.scudetti} scudetti · ${state.scudettiDoro} d’oro · ${CFG.formatNum(state.fp)} FP`, 40, 376);
  c.toBlob(b => {
    if (!b) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(b);
    a.download = 'fantapanchina squadra.png'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
    showToast('Immagine squadra salvata');
  });
}

/* --------------------------------------------------------------------- loop */
function startGiornata() {
  const result = Sim.runGiornata(state);
  ips = Sim.calcFCPerSec(state);
  pendingMatch = result.match;
  document.getElementById('match-g').textContent = result.giornata;
  document.getElementById('match-sub').textContent = result.commentary[0] || 'La partita è iniziata!';
  document.getElementById('match-overlay').hidden = false;
  match.start(pendingMatch);
  Audio.play('whistle', state.settings.sound);
  refreshAll();
}

function frame(now) {
  requestAnimationFrame(frame);
  const wall = Date.now();
  const dt = lastTime ? Math.max(0, Math.min(100, now - lastTime)) : 0;
  lastTime = now;
  acc += dt;
  if (acc > 1000) acc = 1000; // evita un ciclo infinito dopo un tab in background
  while (acc >= CFG.TICK_MS) {
    acc -= CFG.TICK_MS;
    const step = CFG.TICK_MS / 1000;
    if (ips > 0) { const gain = ips * step; state.fc += gain; state.totalFc += gain; }
    if (wall - state.lastGiornataTime >= CFG.GIORNATA_MS) {
      state.lastGiornataTime = wall;
      startGiornata();
    }
    if (Math.random() < 0.0004) { Sim.randomNews(state); renderFeed(); }
  }
  if (now - lastTick >= 250) {
    lastTick = now;
    Hud.update(state, ips, CFG.GIORNATA_MS - (wall - state.lastGiornataTime));
    const comboChip = document.getElementById('combo-chip');
    if (comboChip && combo === 0) comboChip.textContent = '×1';
    if (Sim.maintainChests(state, wall)) {
      refreshBadges();
      if (activeTab === 'collezione' && colUI.sub === 'bauli') renderPanel();
    }
    if (Sim.ensureMerchant(state, wall)) {
      if (activeTab === 'collezione' && colUI.sub === 'mercante') renderPanel();
    }
    updateCollectionLive(wall);
  }
}

function updateCollectionLive(now) {
  if (activeTab !== 'collezione') return;
  document.querySelectorAll('[data-action="chest-buy"]').forEach(btn => {
    const tier = CFG.CHEST_TIERS[btn.dataset.tier];
    if (tier) btn.disabled = state.fc < tier.price;
  });
  const reroll = document.querySelector('[data-action="merchant-reroll"]');
  if (reroll) reroll.disabled = state.fc < CFG.MERCHANT.rerollCost;
  document.querySelectorAll('[data-action="merchant-trade"]').forEach(btn => {
    const offer = state.merchant && state.merchant.offers.find(o => o.id === btn.dataset.id);
    if (!offer) { btn.disabled = true; return; }
    btn.disabled = offer.recovery
      ? state.fc < offer.cost
      : Sim.duplicatesOf(state, offer.wantId) < offer.wantQty;
  });
  if (colUI.sub === 'bauli') {
    const status = Sim.chestStatus(state, now);
    const timer = document.querySelector('[data-chest-timer]');
    if (timer) timer.textContent = status.full ? 'In pausa' : Collezione.timeText(status.remaining);
    const bar = document.querySelector('[data-chest-bar]');
    if (bar) {
      const pct = status.full ? 100
        : Math.max(0, Math.min(100, (1 - status.remaining / CFG.CHEST_FREE_MS) * 100));
      bar.style.width = pct.toFixed(2) + '%';
    }
  } else if (colUI.sub === 'mercante') {
    const timer = document.querySelector('[data-merchant-timer]');
    if (timer) {
      const m = state.merchant;
      timer.textContent = Collezione.timeText(m && m.nextAt
        ? Math.max(0, m.nextAt - now) : CFG.MERCHANT.rotateMs);
    }
  }
}
setInterval(() => save(state), CFG.AUTOSAVE_MS);
addEventListener('beforeunload', () => save(state));

/* -------------------------------------------------------------------- init */
state.settings = state.settings || { sound:true, motion:true, theme:'neon' };
document.body.classList.toggle('no-motion', !state.settings.motion);
if (state.fc == null) Object.assign(state, Sim.createInitialState());

const report = offlineReport(state, Date.now());
if (report.giornate > 0) {
  const beforeFp = state.fp, beforeFc = state.fc;
  Sim.offlineGiornate(state, Math.min(report.giornate, 50));
  state.lastGiornataTime = Date.now();
  setTimeout(() => showOfflineModal(report, report.giornate, state.fp - beforeFp, state.fc - beforeFc), 300);
} else state.lastGiornataTime = Date.now();

if (!state.mercato.length) Sim.generateMercato(state);
hydrateCollections();
refreshAll();
Hud.update(state, ips, CFG.GIORNATA_MS);
requestAnimationFrame(frame);
window.__fp = {
  state, store, Sim, match, refresh: refreshAll, activateTab, colUI, Collezione
};
