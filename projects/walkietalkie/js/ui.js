/* Walkie Talkie — glass UI, radio screen, peers, chat and dialogs */
import { QUICK_MSGS } from './config.js';
import { t, getLang, applyStatic } from './i18n.js';
import { profile } from './storage.js';

const $ = id => document.getElementById(id);
let H = {};

export function toast(msg, bad = false) {
  const box = $('toasts');
  const el = document.createElement('div');
  el.className = 'toast' + (bad ? ' bad' : '');
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; setTimeout(() => el.remove(), 320); }, 2600);
}
export function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }
export function showModal(id) { $(id).classList.add('on'); }
export function closeModal(id) { $(id).classList.remove('on'); }
export function menu(name) {
  ['main', 'host', 'join'].forEach(x => $('menu-' + x).classList.toggle('hidden', x !== name));
}

export function setScreen(key, extra = '') {
  const el = $('screen-status');
  el.textContent = extra ? `${t(key)} · ${extra}` : t(key);
  const led = $('status-led');
  led.className = 'led' + ({ transmitting:' on', receiving:' rx', listening:' wait', connecting:' wait', connected:'' }[key] || '');
}
export function setChannel(id, isHost) {
  $('channel-id-display').textContent = id ? `ID: ${id}` : 'ID: ---';
  $('screen-freq').textContent = id ? (isHost ? `${id} MHz` : `→ ${id} MHz`) : '---.--- MHz';
  $('channel-id-modal').textContent = id || '····';
}
export function setClients(n) { $('client-count').textContent = String(n); }

export function setVU(level) {
  const bars = $('vu-bars').children;
  for (let i = 0; i < bars.length; i++) {
    const envelope = 1 - Math.abs(i - (bars.length - 1) / 2) / (bars.length / 2);
    const h = Math.max(2, Math.min(30, level * 30 * envelope + (i % 3 === 0 ? 2 : 0)));
    bars[i].style.height = h + 'px';
    bars[i].classList.toggle('hot', h > 21);
  }
}

export function setPTT(active, locked, enabled) {
  const b = $('ptt-btn');
  b.disabled = !enabled;
  b.classList.toggle('active', !!active);
  b.classList.toggle('locked', !!locked);
  $('pttMain').textContent = active ? t('release') : (locked ? t('lock') : t('hold'));
  $('pttSub').textContent = active ? t('transmitting') : t('toTalk');
  $('btnLock').classList.toggle('active', !!locked);
  $('btnMute').classList.toggle('active', !!profile.settings.muted);
}

export function renderPeers(entries) {
  const box = $('peerList');
  if (!entries.length) { box.innerHTML = `<div class="peer-empty">${t('idle')}</div>`; return; }
  box.innerHTML = entries.map(p =>
    `<div class="peer-row ${p.talking ? 'talking' : ''}" data-peer="${esc(p.id)}">
      <span class="dot"></span><span>${esc(p.id === 'self' ? t('who') + ' · ' + p.id : p.id)}</span>
      <small>${p.talking ? t('transmitting') : t('idle')}</small></div>`).join('');
}

export function renderChat(messages) {
  const box = $('chatList');
  if (!messages.length) { box.innerHTML = `<div class="chat-empty">${t('emptyChat')}</div>`; return; }
  box.innerHTML = messages.slice(-40).map(m =>
    `<div class="chat-msg ${m.mine ? 'mine' : ''}"><b>${esc(m.author)}</b>${esc(m.text)}</div>`).join('');
  box.scrollTop = box.scrollHeight;
}

export function renderQuick() {
  const lang = getLang();
  $('quickMsgs').innerHTML = QUICK_MSGS.map(m => `<button type="button" data-quick="${m.id}">${m[lang]}</button>`).join('');
  $('quickMsgs').querySelectorAll('[data-quick]').forEach(b => b.onclick = () => H.quick(b.dataset.quick));
}

export function renderRecent() {
  const box = $('recentList');
  box.innerHTML = profile.recent.length
    ? profile.recent.map(id => `<button type="button" data-recent="${esc(id)}">${esc(id)}</button>`).join('')
    : '<span class="hint">—</span>';
  box.querySelectorAll('[data-recent]').forEach(b => b.onclick = () => H.recent(b.dataset.recent));
}

export function renderDevices(devices, selected) {
  const sel = $('deviceSelect');
  sel.innerHTML = devices.length
    ? devices.map((d, i) => `<option value="${esc(d.deviceId)}" ${d.deviceId === selected ? 'selected' : ''}>${esc(d.label || `Mic ${i + 1}`)}</option>`).join('')
    : `<option value="">${t('mic')}</option>`;
}

export function fillSettings(s) {
  $('deviceSelect').value = s.deviceId || '';
  $('volumeRange').value = String(Math.round((s.volume ?? 0.8) * 100));
  $('echoCheck').checked = !!s.echoCancel;
  $('noiseCheck').checked = !!s.noiseSuppression;
  $('gainCheck').checked = !!s.autoGain;
  $('squelchCheck').checked = !!s.squelch;
  $('lockCheck').checked = !!s.pttLock;
  $('signalingHost').value = s.signalingHost || '0.peerjs.com';
  $('signalingPort').value = String(s.signalingPort || 443);
  $('signalingSecure').checked = !!s.signalingSecure;
}

export function initUI(handlers) {
  H = handlers;
  applyStatic(document);
  renderQuick(); renderRecent();

  $('btnCreate').onclick = H.create;
  $('btnJoin').onclick = () => menu('join');
  $('btnJoinGo').onclick = () => H.join($('join-id-input').value);
  $('btnBack').onclick = () => menu('main');
  $('btnCopyId').onclick = H.copyId;
  $('btnCopyLink2').onclick = H.copyLink;
  $('btnCopy').onclick = H.copyId;
  $('btnLink').onclick = H.copyLink;
  $('btnConnect').onclick = () => { menu('main'); showModal('connectModal'); };
  $('btnSettings').onclick = () => showModal('settingsModal');
  $('btnHelp').onclick = () => showModal('helpModal');
  $('btnLang').onclick = H.lang;
  $('btnTheme').onclick = H.theme;
  $('btnMute').onclick = H.mute;
  $('btnLock').onclick = H.lock;
  $('btnReset').onclick = H.reset;

  const ptt = $('ptt-btn');
  ptt.addEventListener('pointerdown', e => { e.preventDefault(); H.pttDown(); });
  const up = () => H.pttUp();
  ptt.addEventListener('pointerup', up);
  ptt.addEventListener('pointercancel', up);
  ptt.addEventListener('pointerleave', up);
  document.addEventListener('pointerup', up);
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && !e.repeat && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) {
      e.preventDefault(); H.pttDown();
    }
  });
  document.addEventListener('keyup', e => { if (e.code === 'Space') H.pttUp(); });

  $('chatForm').addEventListener('submit', e => { e.preventDefault(); H.chat($('chatInput').value); $('chatInput').value = ''; });
  $('join-id-input').addEventListener('keydown', e => { if (e.key === 'Enter') H.join(e.target.value); });

  $('volumeRange').oninput = e => H.settings({ volume: +e.target.value / 100 });
  $('echoCheck').onchange = e => H.settings({ echoCancel: e.target.checked });
  $('noiseCheck').onchange = e => H.settings({ noiseSuppression: e.target.checked });
  $('gainCheck').onchange = e => H.settings({ autoGain: e.target.checked });
  $('squelchCheck').onchange = e => H.settings({ squelch: e.target.checked });
  $('lockCheck').onchange = e => H.settings({ pttLock: e.target.checked });
  $('deviceSelect').onchange = e => H.settings({ deviceId: e.target.value });
  $('signalingHost').onchange = e => H.settings({ signalingHost: e.target.value });
  $('signalingPort').onchange = e => H.settings({ signalingPort: +e.target.value });
  $('signalingSecure').onchange = e => H.settings({ signalingSecure: e.target.checked });

  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeModal(b.dataset.close));
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal').forEach(m => closeModal(m.id)); });
  window.addEventListener('walkie:langchange', () => { applyStatic(document); renderQuick(); renderRecent(); H.renderAll(); });
}

export const ui = { initUI, toast, esc, showModal, closeModal, menu, setScreen, setChannel, setClients,
  setVU, setPTT, renderPeers, renderChat, renderQuick, renderRecent, renderDevices, fillSettings };
