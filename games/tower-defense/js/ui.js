/* Collegamento tra logica di gioco e DOM */

import { TOWERS, TOWER_ORDER, MODES, MODE_ORDER, upgradeCost, sellValue, maxLevel, TARGETING } from './config.js';
import { state, getModeRecord, getRecords } from './state.js';
import { t, getLang, setLang, onLangChange, formatTime } from './i18n.js';
import {
  startGame, startNextWave, setSpeed, togglePause, abandonToMenu,
  selectTowerType, upgradeTower, sellTower, setTargeting, clearSelection
} from './engine.js';
import { isSoundOn, toggleSound } from './audio.js';

const $ = id => document.getElementById(id);

const MODE_ICONS = { campaign: '🛡️', endless: '♾️', challenge: '⏱️', hardcore: '💀', sandbox: '🧪' };
const MODE_TINTS = {
  campaign: 'rgba(56,189,248,.22)', endless: 'rgba(167,139,250,.22)',
  challenge: 'rgba(251,191,36,.2)', hardcore: 'rgba(248,113,113,.22)', sandbox: 'rgba(74,222,128,.18)'
};

let deferredPrompt = null;
let waitingWorker = null;
let lastShopSig = '';
let lastUpgradeSig = '';
let lastHudSig = '';
let toastCounter = 0;

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
}

function isUnlocked(def) {
  return state.modeConfig.unlimitedMoney || state.wave >= def.unlockWave;
}

/* ---------------- Traduzioni ---------------- */

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  document.documentElement.lang = getLang();
  $('langBtn').textContent = getLang() === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  $('soundBtn').textContent = isSoundOn() ? '🔊' : '🔇';
  renderModes();
  renderRecords();
  renderShop(true);
  renderUpgrade(true);
  lastHudSig = '';
}

/* ---------------- Render ---------------- */

function renderShop(force) {
  const sig = [state.money, state.wave, state.selectedTowerType, state.mode,
    state.modeConfig.unlimitedMoney, getLang()].join('|');
  if (!force && sig === lastShopSig) return;
  lastShopSig = sig;

  const shop = $('shop');
  shop.innerHTML = '';
  TOWER_ORDER.forEach((key, idx) => {
    const def = TOWERS[key];
    const unlocked = isUnlocked(def);
    const affordable = state.modeConfig.unlimitedMoney || state.money >= def.cost;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tower-btn' + (state.selectedTowerType === key ? ' selected' : '');
    btn.disabled = !unlocked || (!affordable && !state.modeConfig.unlimitedMoney);
    btn.style.setProperty('--tint', def.color);
    btn.title = t('tower.' + key + '.name') + ' — ' + t('tower.' + key + '.desc');
    btn.innerHTML =
      '<span class="key">' + (idx + 1) + '</span>' +
      (unlocked ? '' : '<span class="lock">🔒</span>') +
      '<span class="glyph" style="color:' + def.color + '">' + def.glyph + '</span>' +
      '<span class="cost">' + def.cost + '</span>';
    btn.addEventListener('click', () => selectTowerType(key));
    shop.appendChild(btn);
  });
}

function renderSpeeds() {
  const box = $('speedBtns');
  box.innerHTML = '';
  [1, 2, 4].forEach(speed => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'speed-btn' + (state.speed === speed ? ' active' : '');
    b.textContent = speed + '×';
    b.addEventListener('click', () => setSpeed(speed));
    box.appendChild(b);
  });
}

function renderModes() {
  const grid = $('modeGrid');
  grid.innerHTML = '';
  MODE_ORDER.forEach(id => {
    const mode = MODES[id];
    const rec = getModeRecord(id);
    const card = document.createElement('div');
    card.className = 'mode-card';
    card.style.setProperty('--tint', MODE_TINTS[id]);
    const recText = rec
      ? t('menu.best', { wave: rec.bestWave || 0, score: (rec.bestScore || 0).toLocaleString() })
      : '';
    card.innerHTML =
      '<span class="mode-icon">' + MODE_ICONS[id] + '</span>' +
      '<span class="mode-name">' + t('mode.' + id + '.name') + '</span>' +
      '<span class="mode-desc">' + t('mode.' + id + '.desc') + '</span>' +
      (recText ? '<span class="mode-rec">' + recText + '</span>' : '') +
      '<span class="mode-start">' + t('menu.start') + '</span>';
    card.addEventListener('click', () => startGame(id));
    grid.appendChild(card);
  });
}

function renderRecords() {
  const box = $('recordsList');
  const all = getRecords();
  const hasAny = MODE_ORDER.some(id => all[id]);
  if (!hasAny) {
    box.innerHTML = '<p class="records-empty">' + t('menu.noRecord') + '</p>';
    return;
  }
  box.innerHTML = MODE_ORDER.filter(id => all[id]).map(id => {
    const r = all[id];
    const extra = r.bestTimeMs ? ' · ' + t('menu.bestTime', { time: formatTime(r.bestTimeMs) }) : '';
    return '<div class="records-row">' +
      '<span class="dot" style="background:' + (MODE_TINTS[id] || '#38bdf8') + '"></span>' +
      '<span class="label">' + t('mode.' + id + '.name') + '</span>' +
      '<span class="val">' + t('menu.best', { wave: r.bestWave || 0, score: (r.bestScore || 0).toLocaleString() }) + extra + '</span>' +
      '</div>';
  }).join('');
}

function renderUpgrade(force) {
  const panel = $('upgradePanel');
  const tower = state.selectedTower;
  if (!tower) { panel.hidden = true; lastUpgradeSig = ''; return; }

  const cost = upgradeCost(tower);
  const sig = [tower.type, tower.level, state.money, tower.targeting, getLang()].join('|');
  if (!force && sig === lastUpgradeSig) return;
  lastUpgradeSig = sig;
  panel.hidden = false;

  const def = TOWERS[tower.type];
  const dps = tower.kind === 'beam'
    ? Math.round(tower.damage)
    : tower.rate > 0 ? Math.round(tower.damage * 1000 / tower.rate) : Math.round(tower.damage);
  const maxed = tower.level >= maxLevel(tower);

  panel.innerHTML =
    '<div class="upgrade-head"><h3>' + t('upgrade.title') + '</h3>' +
    '<button class="upgrade-close" type="button" aria-label="' + t('common.close') + '">✕</button></div>' +
    '<div class="upgrade-name" style="color:' + def.color + '">' + def.glyph + ' ' + t('tower.' + tower.type + '.name') + ' · ' + t('common.level', { n: tower.level }) + '</div>' +
    '<div class="upgrade-stats">' +
      '<div><span>' + t('upgrade.damage') + '</span><b>' + Math.round(tower.damage) + '</b></div>' +
      '<div><span>' + t('upgrade.range') + '</span><b>' + Math.round(tower.range) + '</b></div>' +
      '<div><span>' + t('upgrade.rate') + '</span><b>' + (tower.rate > 0 ? (tower.rate / 1000).toFixed(2) + 's' : '∞') + '</b></div>' +
      '<div><span>' + t('upgrade.dps') + '</span><b>' + dps + '</b></div>' +
    '</div>' +
    '<div class="target-row">' + TARGETING.map(strategy =>
      '<button type="button" data-target="' + strategy + '" class="' + (tower.targeting === strategy ? 'active' : '') + '">' +
      t('target.' + strategy) + '</button>').join('') + '</div>' +
    '<div class="upgrade-actions">' +
      '<button class="btn-up" type="button" ' + (maxed || state.money < cost ? 'disabled' : '') + '>' +
        (maxed ? t('upgrade.max') : t('upgrade.button') + ' · ' + cost) + '</button>' +
      '<button class="btn-sell" type="button">' + t('upgrade.sell') + ' · ' + sellValue(tower) + '</button>' +
    '</div>';

  panel.querySelector('.upgrade-close').addEventListener('click', clearSelection);
  panel.querySelector('.btn-up').addEventListener('click', upgradeTower);
  panel.querySelector('.btn-sell').addEventListener('click', sellTower);
  panel.querySelectorAll('[data-target]').forEach(btn => {
    btn.addEventListener('click', () => setTargeting(btn.getAttribute('data-target')));
  });
}

function updateHUD() {
  const s = state;
  $('hudLives').textContent = s.modeConfig.noLose ? '∞' : s.lives;
  $('hudMoney').textContent = s.modeConfig.unlimitedMoney ? '∞' : Math.floor(s.money);
  $('hudWave').textContent = s.wave + (s.modeConfig.waveCap ? '/' + s.modeConfig.waveCap : '');
  $('hudScore').textContent = s.score.toLocaleString();
  $('hudTime').textContent = formatTime(s.elapsed);

  const btn = $('waveBtn');
  btn.disabled = s.isWaveActive || !s.running || s.paused || s.gameOver || s.victory;
  btn.classList.toggle('pulse', !btn.disabled && s.wave === 0);
  $('waveBtnText').textContent = s.isWaveActive ? t('hud.waveActive') : t('hud.nextWave');

  const total = s.waveTotal || 0;
  const progress = s.isWaveActive && total > 0
    ? Math.max(0, Math.min(1, 1 - (s.spawnQueue.length + s.enemies.length) / total))
    : (s.wave > 0 && !s.isWaveActive ? 1 : 0);
  $('waveFill').style.width = (progress * 100).toFixed(1) + '%';

  const speedSig = String(s.speed);
  if (speedSig !== lastHudSig) {
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.toggle('active', b.textContent.indexOf(String(s.speed)) === 0));
    lastHudSig = speedSig;
  }
  renderShop();
  renderUpgrade();
}

/* ---------------- Schermate e messaggi ---------------- */

function showScreen(name) {
  const overlays = {
    menu: 'menuOverlay', pause: 'pauseOverlay', gameover: 'endOverlay',
    victory: 'endOverlay', howto: 'howtoOverlay'
  };
  Object.values(overlays).forEach(id => $(id).classList.add('hidden'));
  const inGame = name === 'game' || name === 'pause';
  $('hud').style.opacity = inGame ? '1' : '.35';
  $('actionbar').style.opacity = inGame ? '1' : '.25';
  $('actionbar').style.pointerEvents = inGame ? '' : 'none';

  if (name === 'game') return;
  if (name === 'menu') {
    renderModes();
    renderRecords();
  }
  if (overlays[name]) $(overlays[name]).classList.remove('hidden');
}

function toast(text, kind) {
  const el = document.createElement('div');
  el.className = 'toast ' + (kind || '');
  el.textContent = text;
  el.dataset.id = String(++toastCounter);
  $('toasts').appendChild(el);
  setTimeout(() => el.remove(), 2300);
  const box = $('toasts');
  while (box.children.length > 4) box.removeChild(box.firstChild);
}

function showEnd(data) {
  $('endTitle').textContent = data.victory ? t('over.victory') : t('over.title');
  $('endIcon').textContent = data.victory ? '🏆' : '💀';
  $('endSub').textContent = data.victory ? t('over.complete') : t('over.defeat');
  $('newRecord').classList.toggle('hidden', !(data.isNewScore || data.isNewWave));
  $('endStats').innerHTML =
    '<div class="end-stat"><span>' + t('over.score') + '</span><b>' + data.score.toLocaleString() + '</b></div>' +
    '<div class="end-stat"><span>' + t('over.wave') + '</span><b>' + data.wave + '</b></div>' +
    '<div class="end-stat"><span>' + t('over.kills') + '</span><b>' + data.kills + '</b></div>' +
    '<div class="end-stat"><span>' + t('over.time') + '</span><b>' + formatTime(data.timeMs) + '</b></div>';
  $('retryBtn').setAttribute('data-mode', data.mode);
}

/* ---------------- Inizializzazione ---------------- */

export function initUI() {
  applyTranslations();
  renderSpeeds();
  showScreen('menu');

  $('langBtn').addEventListener('click', () => setLang(getLang() === 'it' ? 'en' : 'it'));
  $('soundBtn').addEventListener('click', () => {
    const on = toggleSound();
    $('soundBtn').textContent = on ? '🔊' : '🔇';
  });
  $('pauseBtn').addEventListener('click', () => togglePause());
  $('waveBtn').addEventListener('click', startNextWave);
  $('resumeBtn').addEventListener('click', () => togglePause(false));
  $('restartBtn').addEventListener('click', () => startGame(state.mode));
  $('pauseMenuBtn').addEventListener('click', abandonToMenu);
  $('retryBtn').addEventListener('click', e => startGame(e.currentTarget.getAttribute('data-mode')));
  $('endMenuBtn').addEventListener('click', abandonToMenu);
  $('howtoBtn').addEventListener('click', () => showScreen('howto'));
  $('howtoCloseBtn').addEventListener('click', () => showScreen(state.running ? (state.paused ? 'pause' : 'game') : 'menu'));

  $('installBtn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch (e) { /* ignore */ }
    deferredPrompt = null;
    $('installBtn').classList.add('hidden');
  });
  $('updateBtn').addEventListener('click', () => {
    if (waitingWorker) waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    $('updateBar').classList.add('hidden');
  });

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    $('installBtn').classList.remove('hidden');
  });
  window.addEventListener('appinstalled', () => $('installBtn').classList.add('hidden'));

  function updateConnection() {
    $('offlineChip').classList.toggle('hidden', navigator.onLine !== false);
  }
  window.addEventListener('online', updateConnection);
  window.addEventListener('offline', updateConnection);
  updateConnection();

  onLangChange(applyTranslations);

  window.addEventListener('td:toast', e => toast(e.detail.text, e.detail.kind));
  window.addEventListener('td:screen', e => showScreen(e.detail.screen));
  window.addEventListener('td:end', e => showEnd(e.detail));
  window.addEventListener('td:selection', () => { lastShopSig = ''; lastUpgradeSig = ''; renderShop(true); renderUpgrade(true); });
  window.addEventListener('td:sound', e => { $('soundBtn').textContent = e.detail.on ? '🔊' : '🔇'; });
  window.addEventListener('td:hud', () => { lastShopSig = ''; lastUpgradeSig = ''; renderShop(true); renderUpgrade(true); });
  window.addEventListener('td:sw-update', e => {
    waitingWorker = e.detail.worker;
    $('updateBar').classList.remove('hidden');
  });
}

export { updateHUD, applyTranslations };
