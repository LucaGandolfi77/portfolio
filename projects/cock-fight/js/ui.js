/* Cockpit Arena — DOM panels, tabs and dialogs */
import { STR, STATS, STAT_LABEL, EQUIPMENT, BREEDS, CHAMPIONSHIP, CURRENCY, HOUSE_EDGE } from './config.js';
import { t, getLang, applyStatic } from './i18n.js';
import { profile } from './storage.js';
import { power, odds, levelInfo, xpNeeded, standings } from './engine.js';

const $ = id => document.getElementById(id);
let tab = 'arena';
let H = {};

export function toast(msg) {
  const el = $('toast');
  el.textContent = msg; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 2400);
}
export function modal(title, html, actions) {
  $('modalTitle').textContent = title;
  $('modalBody').innerHTML = html;
  const bar = $('modalActions'); bar.innerHTML = '';
  (actions || [{ label: t('ok') }]).forEach(a => {
    const b = document.createElement('button');
    b.className = 'btn ' + (a.primary ? 'primary' : 'ghost');
    b.textContent = a.label;
    b.onclick = () => { $('modal').classList.add('hidden'); a.fn?.(); };
    bar.appendChild(b);
  });
  $('modal').classList.remove('hidden');
}
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }

function setTab(next) {
  tab = next;
  document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === next));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('hidden', p.id !== 'tab-' + next));
  H.onTab?.(next);
}

function wallet() { $('walletAmt').textContent = CURRENCY + Math.round(profile.wallet); }

function roosterCard(r) {
  const breed = BREEDS.find(b => b.id === r.breed) || BREEDS[0];
  const level = levelInfo(r.xp);
  const need = xpNeeded(level);
  return `<div class="rooster-card">
    <div class="bird" style="--bird:${breed.color};--bird2:${breed.accent}">🐓</div>
    <div class="rcopy"><b>${esc(r.name)}</b><small>${t('level')} ${level} · ${breed.name[getLang()]}</small></div>
    <div class="xpbar"><i style="width:${Math.min(100, Math.round((r.xp % 100) / need * 100))}%"></i></div>
    <div class="pills"><span>⚡ ${power(r)}</span><span>🏆 ${profile.wins}</span><span>💀 ${profile.losses}</span></div>
  </div>`;
}
function statBars(r) {
  return STATS.map(k => {
    const v = r.stats[k] || 0;
    return `<div class="srow"><span>${STAT_LABEL[k][getLang()]}</span>
      <div class="bar"><i style="width:${Math.min(100, v * 5)}%"></i></div><b>${v}</b>
      <button class="mini" data-train="${k}" title="${t('train')}">+</button></div>`;
  }).join('');
}

function renderTraining() {
  const r = profile.rooster;
  $('roosterCard').innerHTML = roosterCard(r);
  $('statList').innerHTML = statBars(r);
  $('equipList').innerHTML = Object.entries(EQUIPMENT).map(([id, e]) => {
    const owned = r.equipment.includes(id);
    return `<div class="equip"><span class="ei">${e.icon}</span><div><b>${e.name[getLang()]}</b>
      <small>${Object.entries(e.bonus).map(([k, v]) => '+' + v + ' ' + STAT_LABEL[k][getLang()]).join(' · ')}</small></div>
      <button class="btn small ${owned ? 'ghost' : ''}" data-equip="${id}" ${owned ? '' : ''}>
        ${owned ? t('owned') : CURRENCY + e.cost}</button></div>`;
  }).join('');
  $('equipList').querySelectorAll('[data-equip]').forEach(b => b.onclick = () => H.equip(b.dataset.equip));
  $('statList').querySelectorAll('[data-train]').forEach(b => b.onclick = () => H.train(b.dataset.train));
}

function renderChampionship() {
  const done = profile.round;
  $('roundList').innerHTML = CHAMPIONSHIP.map((c, i) => {
    const state = i < done ? (profile.medals[i] || '') : i === done ? 'now' : 'lock';
    const medal = state === 'gold' ? '🥇' : state === 'silver' ? '🥈' : state === 'bronze' ? '🥉' : state === 'now' ? '▶' : '🔒';
    return `<div class="round-row ${state === 'now' ? 'now' : ''}"><span>${i + 1}</span>
      <b>${c[getLang()]}</b><span>${medal}</span><small>${CURRENCY}${c.reward}</small></div>`;
  }).join('');
  const s = standings(profile.history);
  $('champStats').innerHTML = `<span>${t('wins')} <b>${s.wins}</b></span><span>${t('losses')} <b>${s.losses}</b></span>
    <span>${t('net')} <b style="color:${s.net >= 0 ? '#5ef0a8' : '#ff6b9d'}">${s.net >= 0 ? '+' : ''}${s.net}</b></span>`;
  $('championBadge').classList.toggle('hidden', !profile.champion);
}

function renderSimulator() {
  $('simResult').innerHTML = H.lastSim
    ? `<div class="sim-result"><b>${H.lastSim.winner === 'a' ? esc(H.simA?.name) : esc(H.simB?.name)}</b>
       <span>${t('rounds')}: ${H.lastSim.rounds} · PERFECT: ${H.lastSim.perfects}</span></div>` : '';
}

function renderBetting() {
  const list = profile.bets.slice(0, 12);
  $('betHistory').innerHTML = list.length ? list.map(b =>
    `<div class="bet-row ${b.won ? 'win' : 'loss'}"><span>${esc(b.label)}</span>
      <span>${CURRENCY}${b.stake}</span><b>${b.won ? '+' + CURRENCY + b.net : CURRENCY + b.net}</b></div>`).join('')
    : `<div class="empty">—</div>`;
  $('houseNote').textContent = t('house') + ' · ' + Math.round(HOUSE_EDGE * 100) + '%';
  if ($('betOdds')) $('betOdds').textContent = H.oddsText ? H.oddsText() : '';
}

export function renderAll() {
  wallet(); renderTraining(); renderChampionship(); renderSimulator(); renderBetting();
  $('langToggle').textContent = t('lang');
  applyStatic(document);
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('hidden', p.id !== 'tab-' + tab));
}

export function initUI(handlers) {
  H = handlers;
  wallet();
  document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => setTab(b.dataset.tab));
  $('langToggle').onclick = () => H.lang();
  $('soundToggle').onclick = () => H.sound();
  $('resetBtn').onclick = () => modal(t('reset'), `<p>${t('reset')}?</p>`, [
    { label: t('cancel') }, { label: t('ok'), primary: true, fn: () => H.reset() }
  ]);
  ['attack', 'defend', 'wait', 'special'].forEach(a => {
    const b = $('act-' + a); if (b) b.onclick = () => H.action(a);
  });
  $('nextRoundBtn').onclick = () => H.nextRound();
  $('simBtn').onclick = () => H.simulate();
  $('simBetBtn').onclick = () => H.simBet();
  $('stakeBtns').querySelectorAll('[data-stake]').forEach(b => b.onclick = () => H.stake(+b.dataset.stake));
  $('betWinBtn').onclick = () => H.placeBet('win');
  $('betLoseBtn').onclick = () => H.placeBet('lose');
  $('betRoundsBtn').onclick = () => H.placeBet('rounds');
  $('modal').addEventListener('click', e => { if (e.target === $('modal')) $('modal').classList.add('hidden'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $('modal').classList.add('hidden');
    if (tab === 'arena' && ['1', '2', '3', '4'].includes(e.key)) {
      H.action(['attack', 'defend', 'wait', 'special'][+e.key - 1]);
    }
  });
  window.addEventListener('cockpit:langchange', renderAll);
  renderAll();
}

export const ui = { initUI, renderAll, renderTraining, renderChampionship, renderSimulator,
  renderBetting, toast, modal, wallet, setTab, get tab() { return tab; }, esc,
  set lastSim(v) { H.lastSim = v; }, get lastSim() { return H.lastSim; },
  set simA(v) { H.simA = v; }, get simA() { return H.simA; },
  set simB(v) { H.simB = v; }, get simB() { return H.simB; } };
