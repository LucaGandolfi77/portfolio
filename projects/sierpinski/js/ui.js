/* Fractal Observatory — mobile-first sheet, controls, presets and dialogs */
import { FORMS, PRESETS, PALETTES } from './config.js';
import { t, getLang, applyStatic } from './i18n.js';
import { profile } from './storage.js';

const $ = id => document.getElementById(id);
let H = {}, tab = 'forms';

export function toast(msg) {
  const el = $('toast'); el.textContent = msg;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 1900);
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

export function setTab(next) {
  tab = next;
  document.querySelectorAll('.stab').forEach(b => b.classList.toggle('on', b.dataset.stab === next));
  document.querySelectorAll('.stab-panel').forEach(p => p.classList.toggle('hidden', p.id !== 'panel-' + next));
}

export function renderForms(current) {
  const box = $('formTabs'); if (!box) return;
  box.innerHTML = FORMS.map(f =>
    `<button class="ftab ${f.id === current ? 'active' : ''}" data-form="${f.id}">
      <span class="sw" style="background:${f.color}"></span><span>${f.icon}</span>${f.name}</button>`).join('');
  box.querySelectorAll('[data-form]').forEach(b => b.onclick = () => H.setForm(b.dataset.form));
}

export function renderParams(form, params) {
  const box = $('paramsBox'); if (!box) return;
  box.innerHTML = '';
  form.params.forEach(p => {
    const label = p[getLang()] || p.en || p.k;
    const val = params[p.k] ?? p.val;
    const row = document.createElement('div'); row.className = 'prow';
    row.innerHTML = `<label>${label}</label>
      <input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${val}">
      <span class="pv">${val}</span>`;
    const input = row.querySelector('input'), out = row.querySelector('.pv');
    input.oninput = () => { params[p.k] = +input.value; out.textContent = input.value; H.onParam(); };
    box.appendChild(row);
  });
  (form.flags || []).forEach(flag => {
    const b = document.createElement('button');
    b.className = 'tgl' + (params[flag] ? ' on' : '');
    b.innerHTML = `<span class="led"></span>${flag === 'noRepeat' ? 'NO-REPEAT' : flag === 'orbitTrap' ? 'ORBIT TRAP' : flag.toUpperCase()}`;
    b.onclick = () => { params[flag] = !params[flag]; b.classList.toggle('on', params[flag]); H.onParam(); };
    box.appendChild(b);
  });
}

export function renderStyle(settings, palettes) {
  const pal = $('palRow');
  if (pal) {
    pal.innerHTML = Object.entries(palettes).map(([id, def]) =>
      `<button class="pal ${id === settings.palette ? 'active' : ''}" data-pal="${id}" title="${def[getLang()]}" style="background:linear-gradient(135deg,${def.fn(0, 8)},${def.fn(4, 8)},${def.fn(8, 8)})"></button>`).join('');
    pal.querySelectorAll('[data-pal]').forEach(b => b.onclick = () => { H.setPalette(b.dataset.pal); renderStyle(H.settings(), palettes); });
  }
  const bind = (id, key, fn) => {
    const el = $(id); if (!el) return;
    el.checked = !!settings[key];
    el.onchange = () => fn(el.checked);
  };
  bind('spinBtn','spin',v => H.setSetting({ spin: v }));
  bind('revealBtn','reveal',v => H.setSetting({ reveal: v }));
  const sym = $('symRange'), symVal = $('symVal');
  if (sym) {
    sym.value = settings.symmetry || 1;
    if (symVal) symVal.textContent = '×' + sym.value;
    sym.oninput = () => { H.setSetting({ symmetry: +sym.value }); if (symVal) symVal.textContent = '×' + sym.value; };
  }
  const glow = $('glowRange'), glowVal = $('glowVal');
  if (glow) {
    glow.value = settings.glow || 0;
    if (glowVal) glowVal.textContent = glow.value;
    glow.oninput = () => { H.setSetting({ glow: +glow.value }); if (glowVal) glowVal.textContent = glow.value; };
  }
  const blend = $('blendSel');
  if (blend) { blend.value = settings.blend || 'lighter'; blend.onchange = () => H.setSetting({ blend: blend.value }); }
  const bg = $('bgSel');
  if (bg) { bg.value = settings.bg || 'stars'; bg.onchange = () => H.setSetting({ bg: bg.value }); }
}

export function renderPresets(current) {
  const box = $('presetChips'); if (!box) return;
  const lang = getLang();
  const items = PRESETS.map(p => ({ ...p, label: p[lang] }))
    .concat(profile.custom.map(c => ({ ...c, label: c.name })));
  box.innerHTML = items.map(p =>
    `<button class="chip ${p.id === current ? 'on' : ''}" data-preset="${esc(p.id)}">${esc(p.label)}</button>`).join('');
  box.querySelectorAll('[data-preset]').forEach(b => b.onclick = () => H.applyPreset(b.dataset.preset));
}

export function renderFavorites() {
  const box = $('favChips'); if (!box) return;
  box.innerHTML = profile.favorites.length
    ? profile.favorites.map(id => `<button class="chip" data-fav="${esc(id)}">${esc(id)}</button>`).join('')
    : '<span class="hint">—</span>';
  box.querySelectorAll('[data-fav]').forEach(b => b.onclick = () => H.applyPreset(b.dataset.fav));
}

export function updateHUD(s) {
  const el = $('hud'); if (!el) return;
  el.textContent = `${t('fps')} ${s.fps} · ${s.elems.toLocaleString()} ${t('elems')}` +
    (s.chaos ? ` · ${s.points.toLocaleString()} ${t('points')}` : '') +
    ` · ${t('zoom')} ${s.zoom.toFixed(2)}× · ${t('rot')} ${s.rot.toFixed(0)}°`;
}

export function initUI(handlers) {
  H = handlers;
  applyStatic(document);
  document.querySelectorAll('.stab').forEach(b => b.onclick = () => setTab(b.dataset.stab));
  $('randomBtn').onclick = H.randomize;
  $('saveBtn').onclick = H.savePreset;
  $('favBtn').onclick = H.toggleFavorite;
  $('resetCamBtn').onclick = H.resetCamera;
  $('pngBtn').onclick = H.exportPng;
  $('svgBtn').onclick = H.exportSvg;
  $('copyBtn').onclick = H.copyLink;
  $('langBtn').onclick = H.lang;
  $('sheetHandle').onclick = H.toggleSheet;
  $('howBtn').onclick = () => modal(t('how'), `<p>${t('howText')}</p>`, [{ label: t('ok'), primary: true }]);
  $('modal').addEventListener('click', e => { if (e.target === $('modal')) $('modal').classList.add('hidden'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $('modal').classList.add('hidden');
    if (e.key.toLowerCase() === 'r') H.resetCamera();
    if (e.key.toLowerCase() === ' ') { e.preventDefault(); H.toggleSpin(); }
  });
  window.addEventListener('fractal:langchange', () => { applyStatic(document); H.renderAll(); });
  setTab('forms');
}

export const ui = { initUI, toast, modal, setTab, renderForms, renderParams, renderStyle,
  renderPresets, renderFavorites, updateHUD, esc };
