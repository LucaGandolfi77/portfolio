/* T-SNE 3D — glass panels, controls, inspector, dialogs */
import { SAMPLES, METRICS, PALETTE } from './config.js';
import { t, getLang, applyStatic } from './i18n.js';

const $ = id => document.getElementById(id);
let H = {};

export function toast(msg, color) {
  const box = $('toasts');
  const d = document.createElement('div');
  d.className = 'toast'; d.textContent = msg;
  if (color) d.style.borderLeftColor = color;
  box.appendChild(d);
  setTimeout(() => { d.style.opacity = '0'; setTimeout(() => d.remove(), 400); }, 2600);
}
export function dialog(id, html) { $(id).classList.add('on'); if (html) $(id + 'Body') && ($(id + 'Body').innerHTML = html); }
export function closeDialog(id) { $(id).classList.remove('on'); }
export function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

export function renderSamples(active) {
  const sel = $('dsSelect'); if (!sel) return;
  const lang = getLang();
  sel.innerHTML = '<option value="">— ' + t('sample') + ' —</option>' +
    SAMPLES.map(s => `<option value="${s.id}" ${s.id === active ? 'selected' : ''}>${s[lang]}</option>`).join('');
}

export function renderLabels(labels, selected) {
  const sel = $('labelSelect'); if (!sel) return;
  sel.innerHTML = `<option value="-1">${t('noLabel')}</option>` +
    labels.map((l, i) => `<option value="${i}" ${i === selected ? 'selected' : ''}>${esc(l)}</option>`).join('');
}

export function renderLegend(names, counts, focused, colors = PALETTE) {
  const box = $('legendBox'); if (!box) return;
  box.innerHTML = names.map((n, i) =>
    `<div class="legrow ${i === focused ? 'focused' : ''}" data-c="${i}">
      <span class="dot" style="color:${colors[i % colors.length]};background:${colors[i % colors.length]}"></span>
      <span>${esc(n)}</span><span>${counts[i] || 0}</span></div>`).join('');
  box.querySelectorAll('[data-c]').forEach(el => el.onclick = () => H.focus(+el.dataset.c));
}

export function renderMetrics(values, active) {
  const box = $('metricsBox'); if (!box) return;
  const lang = getLang();
  box.innerHTML = METRICS.map(m => {
    const v = values[m.id];
    const shown = v == null || !isFinite(v) ? '—' : (Math.abs(v) >= 100 ? Math.round(v) : v.toFixed(3));
    return `<div class="metric-row ${m.id === active ? 'active' : ''}" data-m="${m.id}" title="${esc(m.hint[lang])}">
      <span>${m[lang]}</span><b>${shown}</b></div>`;
  }).join('');
  box.querySelectorAll('[data-m]').forEach(el => el.onclick = () => H.metric(el.dataset.m));
}

export function setCoherence(value, label) {
  const el = $('cohValue'); if (!el) return;
  const shown = isFinite(value) ? (Math.abs(value) <= 1 ? value.toFixed(3) : Math.round(value).toString()) : '—';
  el.textContent = shown;
  el.style.color = value > 0.4 ? 'var(--green)' : value > 0 ? 'var(--amber)' : 'var(--pink)';
  if (label) $('cohLabel').textContent = label;
}
export function sparkline(values, elId = 'spark') {
  const c = $(elId); if (!c || !values.length) return;
  const ctx = c.getContext('2d'), w = c.width, h = c.height;
  ctx.clearRect(0, 0, w, h);
  const max = Math.max(...values), min = Math.min(...values);
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = i / Math.max(1, values.length - 1) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.strokeStyle = '#3ee6ff'; ctx.lineWidth = 1.5; ctx.stroke();
}
export function inspector(name, entries) {
  const box = $('inspector'); if (!box) return;
  $('inspName').textContent = name || '';
  $('inspTable').innerHTML = entries.map(([k, v]) =>
    `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('');
  box.classList.add('on');
}
export function hideInspector() { $('inspector')?.classList.remove('on'); }
export function focusTag(name) {
  const el = $('focusTag'); if (!el) return;
  el.innerHTML = `🎯 ${esc(name)} <span class="fx">✕</span>`;
  el.style.display = 'block';
  el.querySelector('.fx').onclick = () => H.clearFocus();
}
export function clearFocusTag() { const el = $('focusTag'); if (el) el.style.display = 'none'; }

export function setProgress(pct, label) {
  const bar = $('progressBar'); if (bar) bar.style.width = Math.round(pct * 100) + '%';
  const box = $('statusLine'); if (box) box.textContent = label || '';
}
export function hero(show) { const h = $('hero'); if (h) h.classList.toggle('show', !!show); }
export function setTab(name) {
  document.querySelectorAll('.stab').forEach(b => b.classList.toggle('on', b.dataset.tab === name));
  document.querySelectorAll('.sheet-tab').forEach(p => p.classList.toggle('hidden', p.id !== 'panel-' + name));
}
export function sheet(open) { $('controls').classList.toggle('open', !!open); }

export function initUI(handlers) {
  H = handlers;
  applyStatic(document);
  document.querySelectorAll('.stab').forEach(b => b.onclick = () => setTab(b.dataset.tab));
  $('sheetHandle').onclick = () => sheet(!$('controls').classList.contains('open'));
  $('slider').oninput = e => H.level(+e.target.value / 100);
  $('perpSlider').oninput = e => H.perplexity(+e.target.value);
  $('exagSlider').oninput = e => H.exaggeration(+e.target.value);
  $('kSlider').oninput = e => H.k(+e.target.value);
  $('autoK').onclick = H.autoK;
  $('btnPlay').onclick = H.play;
  $('btnUnfold').onclick = H.unfold;
  $('btnReset').onclick = H.reset;
  $('btnReplay').onclick = H.replay;
  $('btnOrbit').onclick = H.orbit;
  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => H.view(b.dataset.view));
  $('ghostBtn').onchange = H.ghost;
  $('dsSelect').onchange = e => H.sample(e.target.value);
  $('labelSelect').onchange = e => H.label(+e.target.value);
  $('csvFile').onchange = e => { const f = e.target.files?.[0]; if (f) H.file(f); e.target.value = ''; };
  $('btnPaste').onclick = () => dialog('pasteModal');
  $('pasteGo').onclick = () => H.paste($('pasteArea').value);
  $('btnCopy').onclick = H.copy;
  $('btnHelp').onclick = () => dialog('helpModal');
  $('btnPng').onclick = H.png;
  $('btnJson').onclick = H.json;
  $('btnCsv').onclick = H.csv;
  $('btnLang').onclick = H.lang;
  $('btnTheme').onclick = H.theme;
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeDialog(m.id); }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { document.querySelectorAll('.modal').forEach(m => closeDialog(m.id)); H.clearFocus(); }
  });
  window.addEventListener('tsne:langchange', () => { applyStatic(document); renderSamples(H.sampleId()); H.renderAll(); });
}

export const ui = { initUI, toast, dialog, closeDialog, esc, renderSamples, renderLabels, renderLegend,
  renderMetrics, setCoherence, sparkline, inspector, hideInspector, focusTag, clearFocusTag,
  setProgress, hero, setTab, sheet };
