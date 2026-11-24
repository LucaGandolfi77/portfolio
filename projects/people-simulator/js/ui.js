/* People Simulator — panels, controls, charts and dialogs */
import { STATES, ACTIVITIES, EVENTS, COHORTS } from './config.js';
import { t, applyStatic, getLang } from './i18n.js';
import { profile } from './storage.js';
import { activityBars, donut, sparkline, dayStrip } from './charts.js';

const $ = id => document.getElementById(id);
let H = {};

export function toast(msg) {
  const el = $('toast'); el.textContent = msg;
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 2200);
}
export function modal(title, html, actions) {
  $('modalTitle').textContent = title; $('modalBody').innerHTML = html;
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
export function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }

export function renderSnapshot(s, series) {
  if (!s) return;
  const lang = getLang();
  $('clock-time').textContent = s.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  $('clock-day').textContent = s.time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  $('st-name').textContent = s.name || t('national');
  $('st-pop').textContent = (s.population / 1e6).toFixed(1) + 'M';
  const a = ACTIVITIES.find(x => x.id === s.dominant);
  $('dominant-icon').textContent = a?.icon || '•';
  $('dominant-text').textContent = t('dominant') + ' ' + (a ? a[lang].toLowerCase() : s.dominant);
  $('dominant-pct').textContent = s.mix[s.dominant] + '%';
  const bars = $('activityBars'); if (bars) bars.innerHTML = activityBars(s.mix, lang);
  const dg = $('activityDonut'); if (dg) dg.innerHTML = donut(s.mix);
  const met = $('metrics');
  if (met) met.innerHTML = Object.entries(s.metrics).map(([k, v]) =>
    `<div class="metric"><span>${t(k)}</span><b>${v}</b><i style="width:${v}%"></i></div>`).join('');
  const sp = $('sparkline'); if (sp) sp.innerHTML = sparkline(series, 'work');
  const strip = $('dayStrip'); if (strip) strip.innerHTML = dayStrip(series, lang);
  const names = $('stateSelect');
  if (names && names.dataset.ready !== '1') {
    names.innerHTML = `<option value="">${t('national')}</option>` +
      STATES.map(s => `<option value="${esc(s[0])}">${esc(s[0])}</option>`).join('');
    names.dataset.ready = '1';
    names.value = profile.lastState || '';
  }
}

export function renderEvent(eventId) {
  const sel = $('eventSelect');
  if (sel) sel.value = eventId;
  const label = $('eventLabel');
  if (label) label.textContent = t('eventsLabel') + ': ' + (EVENTS.find(e => e.id === eventId)?.[getLang()] || eventId);
}

export function renderFavorites() {
  const box = $('favorites');
  if (!box) return;
  box.innerHTML = profile.favorites.length
    ? profile.favorites.map(n => `<button class="chip" data-state="${esc(n)}">${esc(n)}</button>`).join('')
    : `<span class="hint">—</span>`;
  box.querySelectorAll('[data-state]').forEach(b => b.onclick = () => H.selectState(b.dataset.state));
}

export function initUI(handlers) {
  H = handlers;
  applyStatic(document);
  $('playBtn').onclick = H.play;
  $('speedBtn').onclick = H.speed;
  $('stepHour').onclick = H.stepHour;
  $('stepDay').onclick = H.stepDay;
  $('resetView').onclick = H.reset;
  $('stateSelect').onchange = e => H.selectState(e.target.value || null);
  $('eventSelect').onchange = e => H.setEvent(e.target.value);
  $('favBtn').onclick = H.favorite;
  $('compareBtn').onclick = H.compare;
  $('scenarioBtn').onclick = H.scenario;
  $('langBtn').onclick = H.lang;
  $('tutorialBtn').onclick = () => modal(t('tutorial'), `<p>${t('tutorialText')}</p>`, [{ label: t('ok'), primary: true }]);
  $('modal').addEventListener('click', e => { if (e.target === $('modal')) $('modal').classList.add('hidden'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $('modal').classList.add('hidden');
    if (e.code === 'Space' && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); H.play(); }
    if (e.key.toLowerCase() === 'f') H.stepHour();
    if (e.key.toLowerCase() === 'd') H.stepDay();
  });
  window.addEventListener('people:langchange', () => { applyStatic(document); renderFavorites(); H.render(); });
  renderFavorites();
  $('eventSelect').innerHTML = EVENTS.map(e => `<option value="${e.id}">${e.icon} ${e[getLang()]}</option>`).join('');
}

export const ui = { initUI, toast, modal, renderSnapshot, renderEvent, renderFavorites, esc };
