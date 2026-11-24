/**
 * ui.js — rendering dei pannelli (board, slip, paddock, results, season).
 */

import { BET_TYPES } from './sim.js';

const $ = (id) => document.getElementById(id);
const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderMeeting(race, t) {
  if (!race) return;
  $('meetingName').textContent = race.course.name + ' · ' + race.course.note;
  $('weatherPill').textContent = race.weather.label + ' ' + weatherIcon(race.weather.id);
  $('groundPill').textContent = t('ground.' + race.ground.id) + ' ' + groundIcon(race.ground.id);
}
function weatherIcon(id) { return ({ sun: '☀️', cloud: '☁️', rain: '🌧️', wind: '🌬️' })[id] || '☀️'; }
function groundIcon(id) { return ({ firm: '🟢', good: '🟡', soft: '🟠', heavy: '🔴' })[id] || ''; }

export function renderBoard(race, bets, betType, t, onBack) {
  const list = $('lbList');
  if (!list || !race) return;
  const ranked = [...race.horses].sort((a, b) => b.progress - a.progress);
  list.innerHTML = ranked.map((horse, index) => {
    const bet = bets[horse.id];
    const medal = ['r1', 'r2', 'r3'][index] || '';
    const status = horse.finishTime !== null
      ? '🏁 ' + Number(horse.finishTime).toFixed(2) + 's'
      : (horse.laps > 0 ? 'G' + (horse.laps + 1) + ' · ' + race.timer.toFixed(1) + 's' : '—');
    return `<div class="row ${bet ? 'bet' : ''}">
      <div class="rank ${medal}">${index + 1}</div>
      <div class="silk" style="--silk:${horse.color}"></div>
      <div class="nm">${esc(horse.name)}<span class="tag">${esc(horse.jockey)} · ${bet ? '🎯 €' + bet.stake + ' ' + t('bet.' + bet.type) : 'val. ' + horse.rating}</span></div>
      <div class="sp ${bet ? 'b' : ''}">${status}</div>
      <button class="back-btn ${bet ? 'on' : ''}" data-id="${horse.id}" ${race.timer > 0 ? 'disabled' : ''}>${bet ? '✓' : '+'}</button>
    </div>`;
  }).join('');
  list.querySelectorAll('.back-btn').forEach((button) => {
    button.addEventListener('click', () => onBack(button.dataset.id, betType));
  });
  document.querySelectorAll('.bet-type').forEach((button) => button.classList.toggle('on', button.dataset.type === betType));
}

export function renderSlip(bets, horses, t, onRemove) {
  const list = $('slipList');
  if (!list) return;
  const entries = Object.entries(bets);
  if (!entries.length) {
    list.innerHTML = '<p class="empty">' + esc(t('bet.none')) + '</p>';
    return;
  }
  list.innerHTML = entries.map(([id, bet]) => {
    const horse = horses.find((h) => h.id === id);
    return `<div class="slip-row"><span class="silk small" style="--silk:${horse ? horse.color : '#999'}"></span>
      <span>${esc(horse ? horse.name : id)}</span><span class="odds">@ ${Number(bet.odds).toFixed(1)}</span>
      <span>€${bet.stake}</span><button class="remove" data-id="${id}">×</button></div>`;
  }).join('');
  list.querySelectorAll('.remove').forEach((button) => button.addEventListener('click', () => onRemove(button.dataset.id)));
}

export function renderStable(horses, profile, t, onRename, onColor, silks) {
  const list = $('stableList');
  if (!list) return;
  list.innerHTML = horses.map((horse) => {
    const career = profile.career[horse.id] || {};
    const bar = (value) => '<div class="sbar"><i style="width:' + Math.round(Math.min(1, Math.max(0, value)) * 100) + '%"></i></div>';
    return `<div class="hcard">
      <div class="silk big" style="--silk:${horse.color}"></div>
      <div class="info">
        <input class="rename" data-id="${horse.id}" value="${esc(horse.name)}" maxlength="22" aria-label="Horse name">
        <div class="jockey-line">${esc(t('horse.jockey'))}: <b>${esc(horse.jockey)}</b></div>
        <div class="swatches">${silks.map((color) => `<button class="sw ${color === horse.color ? 'on' : ''}" data-id="${horse.id}" data-color="${color}" style="--silk:${color}" aria-label="Silk ${color}"></button>`).join('')}</div>
        <div class="stats">
          <div><span>${esc(t('horse.speed'))}</span><b>${Math.round(horse.baseSpeed)}</b>${bar(horse.baseSpeed / 100)}</div>
          <div><span>${esc(t('horse.accel'))}</span><b>${Math.round(horse.accel)}</b>${bar(horse.accel / 28)}</div>
          <div><span>${esc(t('horse.stamina'))}</span><b>${Math.round(horse.stamina * 100)}</b>${bar(horse.stamina)}</div>
          <div><span>${esc(t('horse.form'))}</span><b>${Math.round(horse.form * 100)}</b>${bar(horse.form)}</div>
          <div><span>${esc(t('horse.rating'))}</span><b>${horse.rating}</b></div>
          <div><span>${esc(t('horse.career'))}</span><b>${career.races || 0} / ${career.wins || 0}</b></div>
          <div><span>${esc(t('horse.podiums'))}</span><b>${career.places || 0}</b></div>
          <div><span>${esc(t('horse.best'))}</span><b>${career.best || '—'}</b></div>
        </div>
      </div></div>`;
  }).join('');
  list.querySelectorAll('.rename').forEach((input) => input.addEventListener('change', () => onRename(input.dataset.id, input.value.trim())));
  list.querySelectorAll('.sw').forEach((button) => button.addEventListener('click', () => onColor(button.dataset.id, button.dataset.color)));
}

export function renderResults(race, settlements, net, margin, t) {
  const list = $('resultsList');
  if (!list) return;
  const rows = settlements.length
    ? settlements.map((s) => `<div class="result-row">
        <div class="rank r${s.place || 0}">${s.place || '—'}</div>
        <div class="nm">${esc(s.name)}</div>
        <div class="payout ${s.gain >= 0 ? '' : 'loss'}">${s.gain >= 0 ? '+' : '−'}€${Math.abs(s.gain)}</div>
      </div>`).join('')
    : '<p class="empty">' + esc(t('result.noBets')) + '</p>';
  list.innerHTML = rows;
  const modalList = $('resList');
  if (modalList) modalList.innerHTML = rows;
  const marginEl = $('resMargin');
  if (marginEl) marginEl.textContent = margin !== null && margin !== undefined
    ? t('result.margin') + ': ' + Number(margin).toFixed(3) + 's' : '';
  const text = (net >= 0 ? '+' : '−') + '€' + Math.abs(Math.round(net));
  const className = 'net ' + (net >= 0 ? 'win' : 'loss');
  ['resNet', 'resNetPanel'].forEach((id) => {
    const el = $(id);
    if (el) { el.textContent = text; el.className = className; }
  });
}

export function renderSeason(standings, t) {
  const list = $('seasonList');
  if (!list) return;
  const rows = Object.values(standings || {}).sort((a, b) => b.points - a.points);
  if (!rows.length) { list.innerHTML = '<p class="empty">' + esc(t('season.title')) + ' —</p>'; return; }
  list.innerHTML = '<div class="season-head"><span>#</span><span>' + esc(t('season.title')) + '</span><span>' + esc(t('season.points')) + '</span><span>' + esc(t('season.wins')) + '</span><span>' + esc(t('season.trophy')) + '</span></div>' +
    rows.map((row, i) => `<div class="season-row">
      <span class="rank ${['r1', 'r2', 'r3'][i] || ''}">${i + 1}</span>
      <span>${esc(row.name)}</span><span>${row.points}</span><span>${row.wins}</span>
      <span>${row.wins > 0 ? '🏆'.repeat(Math.min(3, row.wins)) : '—'}</span>
    </div>`).join('');
}

export function addLog(feed, text, kind = '') {
  if (!feed) return;
  const row = document.createElement('div');
  row.className = 'log-row ' + kind;
  row.textContent = text;
  feed.prepend(row);
  while (feed.children.length > 40) feed.lastChild.remove();
}

export function betTypeButtons(t) {
  return BET_TYPES.map((type) => `<button class="bet-type ${type === 'win' ? 'on' : ''}" data-type="${type}">${esc(t('bet.' + type))}</button>`).join('');
}
