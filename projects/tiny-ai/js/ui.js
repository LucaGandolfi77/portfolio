/* Tiny AI — chat UI, model picker, settings sheet, dialogs */
import { MODELS, BACKENDS, TIERS, PRESETS } from './config.js';
import { t, getLang, applyStatic } from './i18n.js';
import { profile } from './storage.js';
import { formatSize } from './capabilities.js';
import { render as md } from './markdown.js';

const $ = id => document.getElementById(id);
let H = {};

export function toast(msg) {
  const el = $('toast'); el.textContent = msg;
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 2200);
}
export function dialog(title, html, actions) {
  $('dlgTitle').textContent = title; $('dlgBody').innerHTML = html;
  const bar = $('dlgActions'); bar.innerHTML = '';
  (actions || [{ label: t('ok') }]).forEach(a => {
    const b = document.createElement('button');
    b.className = 'btn ' + (a.primary ? 'primary' : 'ghost');
    b.textContent = a.label; b.onclick = () => { $('dlg').classList.add('hidden'); a.fn?.(); };
    bar.appendChild(b);
  });
  $('dlg').classList.remove('hidden');
}
export function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

export function renderBackends(active) {
  const box = $('backendList'); if (!box) return;
  const lang = getLang();
  box.innerHTML = BACKENDS.filter(b => profile.settings.showAdvanced || !b.advanced).map(b =>
    `<button class="chip ${b.id === active ? 'active' : ''}" data-backend="${b.id}">${b.icon} ${b[lang]}</button>`).join('');
  box.querySelectorAll('[data-backend]').forEach(x => x.onclick = () => H.setBackend(x.dataset.backend));
}

export function renderModels(backend, modelId, caps) {
  const box = $('modelList'); if (!box) return;
  const lang = getLang();
  const list = MODELS[backend] || [];
  box.innerHTML = list.map(m => {
    const tier = TIERS[m.tier] || TIERS.small;
    const disabled = !H.fits(m, caps);
    return `<button class="model-row ${m.id === modelId ? 'active' : ''} ${disabled ? 'disabled' : ''}"
      data-model="${esc(m.id)}" ${disabled ? 'disabled' : ''}>
      <span class="dot" style="background:${tier.color}"></span>
      <span class="minfo"><b>${esc(m.label)}</b><small>${esc(formatSize(m.size))} · ${esc(tier[lang])}</small></span>
      <span class="check">${m.verified ? '✓' : ''}</span></button>`;
  }).join('');
  box.querySelectorAll('[data-model]').forEach(x => x.onclick = () => H.setModel(x.dataset.model));
}

export function renderConversations(activeId) {
  const box = $('convList'); if (!box) return;
  box.innerHTML = profile.conversations.map(c =>
    `<div class="conv-row ${c.id === activeId ? 'active' : ''}" data-id="${c.id}">
      <button class="conv-open">💬 <span>${esc(c.title)}</span></button>
      <button class="conv-del" title="${t('delete')}">✕</button></div>`).join('');
  box.querySelectorAll('.conv-open').forEach(b => b.onclick = () => H.selectConv(b.parentElement.dataset.id));
  box.querySelectorAll('.conv-del').forEach(b => b.onclick = () => H.deleteConv(b.parentElement.dataset.id));
}

export function renderMessages(messages) {
  const area = $('chatArea');
  area.innerHTML = '';
  if (!messages.length) {
    area.innerHTML = `<div class="welcome"><div class="welcome-icon">🤖</div><h2>${t('title')}</h2><p>${t('welcome')}</p></div>`;
    return;
  }
  messages.forEach(m => {
    const div = document.createElement('div');
    div.className = `msg ${m.role}`;
    const meta = m.meta ? `<small class="meta">${esc(m.meta)}</small>` : '';
    div.innerHTML = `<div class="bubble">${m.role === 'assistant' ? md(m.content) : esc(m.content)}${meta}</div>`;
    area.appendChild(div);
  });
  area.scrollTop = area.scrollHeight;
}

export function appendStreaming(text) {
  let el = $('streamingMsg');
  if (!el) {
    const area = $('chatArea');
    el = document.createElement('div');
    el.className = 'msg assistant'; el.id = 'streamingMsg';
    el.innerHTML = '<div class="bubble"><span class="stream-text"></span><span class="caret">▌</span></div>';
    area.appendChild(el);
  }
  el.querySelector('.stream-text').textContent = text;
  $('chatArea').scrollTop = $('chatArea').scrollHeight;
}
export function finishStreaming(meta) {
  const el = $('streamingMsg'); if (!el) return;
  el.removeAttribute('id');
  el.querySelector('.caret')?.remove();
  if (meta) el.querySelector('.bubble').insertAdjacentHTML('beforeend', `<small class="meta">${esc(meta)}</small>`);
}
export function removeStreaming() { $('streamingMsg')?.remove(); }

export function typing(text) {
  const el = $('typing'); if (el) el.textContent = text;
  $('typingRow')?.classList.remove('hidden');
}
export function hideTyping() { $('typingRow')?.classList.add('hidden'); }

export function renderCapabilities(caps) {
  const box = $('capList'); if (!box) return;
  const lang = getLang();
  const vals = [
    [t('gpu'), caps.webgpu ? '✓' : '✕'],
    [t('webnn'), caps.webnn ? '✓' : '✕'],
    [t('wasm'), caps.wasm ? '✓' : '✕'],
    [t('memory'), caps.memoryGB ? caps.memoryGB + ' GB' : '—'],
    ['CPU', caps.cores + ' ' + 'cores']
  ];
  box.innerHTML = vals.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
}

export function showSheet(open) { $('settingsSheet').classList.toggle('open', !!open); }

export function initUI(handlers) {
  H = handlers;
  applyStatic(document);
  $('sendBtn').onclick = H.send;
  $('prompt').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); H.send(); } });
  $('newChatBtn').onclick = H.newChat;
  $('clearChatBtn').onclick = H.clearChat;
  $('settingsBtn').onclick = () => showSheet(true);
  $('sheetClose').onclick = () => showSheet(false);
  $('verifyBtn').onclick = H.verify;
  $('clearCacheBtn').onclick = H.clearCache;
  $('themeBtn').onclick = H.theme;
  $('langBtn').onclick = H.lang;
  $('showAdvanced').onchange = e => H.advanced(e.target.checked);
  $('systemPrompt').oninput = e => H.system(e.target.value);
  $('temperature').oninput = e => { $('temperatureVal').textContent = (+e.target.value).toFixed(2); H.temperature(+e.target.value); };
  $('maxTokens').onchange = e => H.maxTokens(+e.target.value);
  $('device').onchange = e => H.device(e.target.value);
  $('apiKey').oninput = e => H.apiKey(e.target.value);
  $('keyToggle').onclick = () => { const i = $('apiKey'); i.type = i.type === 'password' ? 'text' : 'password'; };
  $('presetBtns').innerHTML = PRESETS.map(p => `<button class="chip" data-preset="${p.id}">${p[getLang()]}</button>`).join('');
  $('presetBtns').querySelectorAll('[data-preset]').forEach(b => b.onclick = () => H.preset(b.dataset.preset));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { $('dlg').classList.add('hidden'); showSheet(false); }
  });
  window.addEventListener('tinyai:langchange', () => { applyStatic(document); H.renderAll(); });
}

export const ui = { initUI, toast, dialog, esc, renderBackends, renderModels, renderConversations,
  renderMessages, appendStreaming, finishStreaming, removeStreaming, typing, hideTyping,
  renderCapabilities, showSheet };
