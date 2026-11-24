/* Neon Kart — glass menu, HUD, results and dialogs */
import { KARTS, TRACKS, MODES, POWERUPS } from './config.js';
import { t, getLang, applyStatic } from './i18n.js';
import { available, bestTime } from './core/progression.js';

const $ = id => document.getElementById(id);
let H = {};

export function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  $('toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2200);
}
export function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }
export function showModal(id) { $(id).classList.add('on'); }
export function closeModal(id) { $(id).classList.remove('on'); }

function stat(label, value, max) {
  return `<div class="stat"><span>${label}</span><div class="track"><i style="width:${Math.min(100, value / max * 100)}%"></i></div><b>${value}</b></div>`;
}
function preview(points, ground, road) {
  const c = document.createElement('canvas'); c.width = 300; c.height = 110;
  const x = c.getContext('2d');
  x.fillStyle = ground; x.fillRect(0, 0, 300, 110);
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const sx = 270 / (maxX - minX || 1), sy = 90 / (maxY - minY || 1);
  x.strokeStyle = road; x.lineWidth = 7; x.lineJoin = 'round';
  x.beginPath();
  points.forEach((p, i) => {
    const px = 15 + (p.x - minX) * sx, py = 10 + (p.y - minY) * sy;
    i ? x.lineTo(px, py) : x.moveTo(px, py);
  });
  x.closePath(); x.stroke();
  return c.toDataURL();
}

export function renderMenu(ctx) {
  const { profile, sel, lists, tab } = ctx;
  const lang = getLang();
  $('starCount').textContent = String(profile.stars);
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  const box = $('tabBody');
  if (tab === 'kart') {
    const item = lists.kart[sel.kart % lists.kart.length];
    const locked = !profile.unlockedKarts.includes(item.id);
    box.innerHTML = `<div class="carousel">
      <button class="nav" data-nav="-1">‹</button>
      <div class="car"><div class="big-icon" style="color:${item.color}">🏎️</div>
        <div class="name">${esc(item[lang])}</div>
        <div class="sub">${locked ? '<span class="lock">🔒 ' + item.stars + ' ⭐</span>' : esc(t('select'))}</div>
        <div class="stat-list">
          ${stat(t('speed'), item.speed, 22)}${stat('ACC', item.accel, 12)}
          ${stat('HAND', item.handling, 4)}${stat('GRIP', Math.round(item.grip * 100), 100)}
          ${stat(t('nitro'), item.nitro, 160)}
        </div></div>
      <button class="nav" data-nav="1">›</button></div>`;
  } else if (tab === 'track') {
    const item = lists.track[sel.track % lists.track.length];
    const locked = !profile.unlockedTracks.includes(item.id);
    const record = bestTime(profile, item.id, profile.lastMode);
    box.innerHTML = `<div class="carousel">
      <button class="nav" data-nav="-1">‹</button>
      <div class="car"><div class="big-icon">🏁</div>
        <div class="name">${esc(item[lang])}</div>
        <div class="sub">${locked ? '<span class="lock">🔒 ' + item.stars + ' ⭐</span>' : esc(t('best')) + ': ' + (record ? fmt(record) : t('none'))}</div>
        <div class="track-preview"><img src="${preview(item.points, item.ground, item.road)}" alt="track"></div></div>
      <button class="nav" data-nav="1">›</button></div>`;
  } else {
    const item = lists.mode[sel.mode % lists.mode.length];
    const locked = !profile.unlockedModes.includes(item.id);
    box.innerHTML = `<div class="carousel">
      <button class="nav" data-nav="-1">‹</button>
      <div class="car"><div class="big-icon">🏆</div>
        <div class="name">${esc(item[lang])}</div>
        <div class="sub">${locked ? '<span class="lock">🔒 ' + item.stars + ' ⭐</span>' : ''}</div>
        <div class="mode-info">${item.laps} ${t('lap').toLowerCase()} · ${item.rivals} AI · ${item.powerups ? POWERUPS.map(p => p.icon).join(' ') : '—'}</div></div>
      <button class="nav" data-nav="1">›</button></div>`;
  }
  box.querySelectorAll('[data-nav]').forEach(b => b.onclick = () => H.nav(+b.dataset.nav));
}

export function fmt(seconds) {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60), s = seconds - m * 60;
  return m + ':' + s.toFixed(2).padStart(5, '0');
}

export function setHUD(race, player, total) {
  $('hudLap').textContent = Math.min(race.mode.laps, player.lap + 1) + '/' + race.mode.laps;
  $('hudPos').textContent = (player.place || 1) + '/' + total;
  $('hudTime').textContent = fmt(race.time);
  $('hudSpeed').textContent = String(Math.round(player.speed * 4));
  $('nitroFill').style.width = Math.max(0, player.nitroFuel / player.kart.nitro * 100) + '%';
}
export function setCountdown(text) {
  const el = $('countdown');
  el.textContent = text || '';
  el.classList.toggle('hidden', !text);
}
export function raceToast(text) {
  const el = $('toastRace');
  el.textContent = text;
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, 1600);
}
export function drawMini(renderer, race) {
  const c = $('mini');
  renderer.drawMini(c.getContext('2d'), 0, 0, c.width, c.height, race);
}
export function showResult(race, gained, unlocked) {
  const lang = getLang();
  const result = race.result || {};
  $('resultTitle').textContent = (result.won ? '🏆 ' + t('win') : '🏁 ' + t('finish'));
  const rows = [
    [t('position'), String(result.place || '—')],
    [t('total'), fmt(result.time || race.time)],
    [t('stars'), '+' + gained],
    ...race.lapTimes.map((v, i) => [t('lapTime') + ' ' + (i + 1), fmt(v)])
  ];
  $('resultBody').innerHTML = rows.map(([k, v]) => `<div class="result-line"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('') +
    (unlocked.length ? `<p>${t('unlock')}: ${unlocked.map(esc).join(', ')}</p>` : '');
  showModal('resultModal');
}

export function initUI(handlers) {
  H = handlers;
  applyStatic(document);
  $('helpText').textContent = t('helpText');
  document.querySelectorAll('.tab').forEach(b => b.onclick = () => H.tab(b.dataset.tab));
  $('btnStart').onclick = H.start;
  $('btnPauseRace').onclick = () => H.pause(true);
  $('btnResume').onclick = () => H.pause(false);
  $('btnRestart').onclick = H.restart;
  $('btnQuit').onclick = H.quit;
  $('btnAgain').onclick = H.restart;
  $('btnResultMenu').onclick = H.quit;
  $('btnSettings').onclick = () => showModal('settingsModal');
  $('btnHelp').onclick = () => showModal('helpModal');
  $('btnLang').onclick = H.lang;
  $('btnTheme').onclick = H.theme;
  $('soundCheck').onchange = e => H.prefs({ sound:e.target.checked });
  $('vibrateCheck').onchange = e => H.prefs({ vibration:e.target.checked });
  $('motionCheck').onchange = e => H.prefs({ reducedMotion:e.target.checked });
  document.querySelectorAll('[data-quality]').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-quality]').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    H.prefs({ quality:b.dataset.quality });
  });
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeModal(b.dataset.close));
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); }));
  window.addEventListener('kart:langchange', () => { applyStatic(document); $('helpText').textContent = t('helpText'); H.renderAll(); });
}

export const ui = { initUI, toast, esc, showModal, closeModal, renderMenu, fmt, setHUD, setCountdown,
  raceToast, drawMini, showResult };
