/* Pixel Studio — UI panels and dialogs */
import { STR, TOOLS, PALETTE, EMOJI, PRESETS, BLEND_MODES, SIZES } from './config.js';
import { doc, onChange, history, jumpTo, addLayer, duplicateLayer, deleteLayer,
  moveLayer, mergeDown, flatten, setActive, newProject, serialize, saveProject, loadProject } from './state.js';

let lang = 'en';
let dockTab = 'layers';
let dockCollapsed = false;
export let t = k => (STR[lang] && STR[lang][k]) || STR.en[k] || k;
export function getLang() { return lang; }
export function setLang(v) {
  lang = v === 'it' ? 'it' : 'en';
  document.documentElement.lang = lang;
  try { localStorage.setItem('lang', lang); localStorage.setItem('site_lang', lang); } catch (e) {}
  renderAll();
}
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden', 'show'); void el.offsetWidth; el.classList.add('show');
}

export function dialog(title, bodyHTML, actions) {
  const box = document.getElementById('dialog');
  document.getElementById('dialog-title').textContent = title;
  document.getElementById('dialog-body').innerHTML = bodyHTML;
  const bar = document.getElementById('dialog-actions');
  bar.innerHTML = '';
  (actions || [{ label: t('ok') }]).forEach(a => {
    const b = document.createElement('button');
    b.className = 'btn ' + (a.primary ? 'primary' : 'ghost');
    b.textContent = a.label;
    b.onclick = () => { box.classList.add('hidden'); a.fn && a.fn(); };
    bar.appendChild(b);
  });
  box.classList.remove('hidden');
}
export function closeDialog() { document.getElementById('dialog').classList.add('hidden'); }

function renderTools() {
  const rail = document.getElementById('tool-rail');
  rail.innerHTML = TOOLS.map(tool =>
    `<button class="tool-btn ${doc.tool === tool.id ? 'on' : ''}" data-tool="${tool.id}" title="${t(tool.id)} ${tool.key}" aria-label="${t(tool.id)}">${tool.icon}<kbd>${tool.key}</kbd></button>`
  ).join('');
  rail.querySelectorAll('[data-tool]').forEach(b => b.onclick = () => {
    doc.tool = b.dataset.tool;
    renderTools(); renderInspector(); renderHud();
  });
}

export function renderHud() {
  document.getElementById('hud-tool').textContent = t(doc.tool);
  document.getElementById('hud-size').textContent = `${doc.width} × ${doc.height}`;
  document.getElementById('hud-zoom').textContent = Math.round(doc.zoom * 100) + '%';
  document.getElementById('btn-undo').disabled = history().filter(h => !h.future).length === 0;
  document.getElementById('btn-redo').disabled = history().filter(h => h.future).length === 0;
}

export function renderInspector() {
  const body = document.getElementById('inspector-body');
  document.getElementById('inspector-title').textContent = t('properties');
  const common = `
    <div class="field"><label>${t('color')}</label>
      <div class="row"><input type="color" class="color-input" data-c="color" value="${doc.color}">
      <input type="text" data-c="hex" value="${doc.color}"></div></div>
    <div class="field"><label>${t('size')} — ${doc.brush}px</label>
      <input type="range" min="1" max="120" value="${doc.brush}" data-c="brush"></div>
    <div class="field"><label>${t('opacity')} — ${Math.round(doc.opacity * 100)}%</label>
      <input type="range" min="5" max="100" value="${Math.round(doc.opacity * 100)}" data-c="opacity"></div>`;
  let extra = '';
  if (doc.tool === 'text') {
    extra = `<div class="inspector-section"><h4>${t('text')}</h4>
      <div class="field"><label>${t('textValue')}</label><input type="text" data-c="text" value="Hello!"></div>
      <div class="field"><label>${t('size')}</label><input type="range" min="12" max="140" value="42" data-c="fontSize"></div>
      <div class="field"><label>${t('stroke')}</label><select data-c="stroke"><option value="0">${t('no')}</option><option value="1">${t('yes')}</option></select></div></div>`;
  } else if (doc.tool === 'sticker') {
    extra = `<div class="inspector-section"><h4>${t('stickers')}</h4>
      <div class="sticker-grid">${EMOJI.map(e => `<button data-emoji="${e}">${e}</button>`).join('')}</div></div>`;
  } else if (['rect','ellipse','line'].includes(doc.tool)) {
    extra = `<div class="inspector-section"><h4>${t('properties')}</h4>
      <div class="field"><label>${t('fillShape')}</label><select data-c="fill"><option value="0">${t('no')}</option><option value="1">${t('yes')}</option></select></div></div>`;
  }
  const blend = `<div class="inspector-section"><h4>${t('blend')}</h4>
    <div class="field"><select data-c="blend">${BLEND_MODES.map(m => `<option value="${m}">${t('blendModes.' + m)}</option>`).join('')}</select></div></div>`;
  body.innerHTML = common + extra + blend + `<p class="hint">${t('stickers')} · ${t('adjustments')} · ${t('effects')} — ${t('properties')}</p>`;
  body.querySelector('[data-c="color"]').oninput = e => { doc.color = e.target.value; body.querySelector('[data-c="hex"]').value = e.target.value; };
  body.querySelector('[data-c="hex"]').oninput = e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) doc.color = e.target.value; };
  body.querySelector('[data-c="brush"]').oninput = e => { doc.brush = +e.target.value; e.previousElementSibling.textContent = `${t('size')} — ${doc.brush}px`; };
  body.querySelector('[data-c="opacity"]').oninput = e => { doc.opacity = +e.target.value / 100; e.previousElementSibling.textContent = `${t('opacity')} — ${e.target.value}%`; };
  body.querySelector('[data-c="blend"]').onchange = e => { if (doc.layers[doc.active]) doc.layers[doc.active].blend = e.target.value; };
  const fill = body.querySelector('[data-c="fill"]'); if (fill) fill.onchange = e => { doc.fillShapes = e.target.value === '1'; };
  body.querySelectorAll('[data-emoji]').forEach(b => b.onclick = () => {
    doc.tool = 'sticker'; window.dispatchEvent(new CustomEvent('ps:sticker', { detail: b.dataset.emoji }));
  });
}

export function renderDock() {
  const tabs = document.querySelectorAll('.dock-tabs button[data-tab]');
  tabs.forEach(b => b.classList.toggle('on', b.dataset.tab === dockTab));
  const body = document.getElementById('dock-body');
  if (dockTab === 'layers') {
    body.innerHTML = doc.layers.slice().reverse().map((l, ri) => {
      const i = doc.layers.length - 1 - ri;
      return `<div class="layer-row ${i === doc.active ? 'on' : ''}" data-i="${i}">
        <canvas width="34" height="34" data-thumb="${i}"></canvas>
        <input type="text" value="${l.name.replace(/"/g, '&quot;')}" data-name="${i}" aria-label="Layer name">
        <button class="eye ${l.visible ? '' : 'off'}" data-vis="${i}" title="${t('visibility')}">◉</button>
        <button data-lock="${i}" title="${t('lock')}">${l.locked ? '🔒' : '🔓'}</button>
        <button data-del="${i}" title="${t('deleteLayer')}">✕</button></div>`;
    }).join('');
    body.querySelectorAll('[data-thumb]').forEach(c => {
      const l = doc.layers[+c.dataset.thumb];
      c.getContext('2d').drawImage(l.canvas, 0, 0, 34, 34);
    });
    body.querySelectorAll('.layer-row').forEach(r => r.onclick = e => {
      if (e.target.closest('button,input')) return;
      setActive(+r.dataset.i); renderDock();
    });
    body.querySelectorAll('[data-name]').forEach(inp => inp.onchange = e => { doc.layers[+e.target.dataset.name].name = e.target.value; renderDock(); });
    body.querySelectorAll('[data-vis]').forEach(b => b.onclick = e => {
      const l = doc.layers[+e.target.dataset.vis]; l.visible = !l.visible; renderDock(); window.dispatchEvent(new Event('ps:render'));
    });
    body.querySelectorAll('[data-lock]').forEach(b => b.onclick = e => {
      const l = doc.layers[+e.target.dataset.lock]; l.locked = !l.locked; renderDock();
    });
    body.querySelectorAll('[data-del]').forEach(b => b.onclick = e => {
      dialog(t('confirmDelete'), `<p>${t('confirmDelete')}?</p>`, [
        { label: t('cancel') },
        { label: t('deleteLayer'), primary: true, fn: () => { deleteLayer(); renderAll(); toast(t('layerRemoved')); } }
      ]);
    });
  } else if (dockTab === 'history') {
    const h = history();
    body.innerHTML = h.length ? h.slice().reverse().map(item =>
      `<div class="history-row ${item.future ? 'future' : ''}" data-index="${item.index}">${item.label}${item.future ? ' ↷' : ''}</div>`).join('')
      : `<p class="hint">${t('history')}</p>`;
    body.querySelectorAll('[data-index]').forEach(r => r.onclick = () => { jumpTo(+r.dataset.index); renderAll(); });
  } else if (dockTab === 'stickers') {
    body.innerHTML = `<div class="sticker-grid">${EMOJI.map(e => `<button data-emoji="${e}">${e}</button>`).join('')}</div>`;
    body.querySelectorAll('[data-emoji]').forEach(b => b.onclick = () => {
      doc.tool = 'sticker'; window.dispatchEvent(new CustomEvent('ps:sticker', { detail: b.dataset.emoji }));
    });
  } else if (dockTab === 'adjust') {
    body.innerHTML = ['brightness','contrast','saturation','hue'].map(k =>
      `<div class="field"><label>${t(k)}</label><input type="range" min="-100" max="100" value="0" data-adj="${k}"></div>`).join('') +
      `<button class="btn primary" id="adj-apply">${t('apply')}</button>`;
    body.querySelector('#adj-apply').onclick = () => {
      const opts = {};
      body.querySelectorAll('[data-adj]').forEach(i => opts[i.dataset.adj] = +i.value);
      window.dispatchEvent(new CustomEvent('ps:adjust', { detail: opts }));
    };
  } else {
    body.innerHTML = `<div class="preset-grid">${Object.keys(PRESETS).map(k =>
      `<button class="chip" data-preset="${k}">${k}</button>`).join('')}</div>
      <div class="preset-grid" style="margin-top:8px">${['grayscale','sepia','invert','blur','sharpen','pixelate'].map(k =>
      `<button class="chip" data-effect="${k}">${t(k)}</button>`).join('')}</div>`;
    body.querySelectorAll('[data-preset]').forEach(b => b.onclick = () =>
      window.dispatchEvent(new CustomEvent('ps:preset', { detail: PRESETS[b.dataset.preset] })));
    body.querySelectorAll('[data-effect]').forEach(b => b.onclick = () =>
      window.dispatchEvent(new CustomEvent('ps:effect', { detail: b.dataset.effect })));
  }
}

export function renderAll() {
  renderTools(); renderInspector(); renderDock(); renderHud();
  document.getElementById('btn-lang').textContent = lang === 'it' ? 'EN' : 'IT';
  document.getElementById('btn-export').textContent = t('export');
  document.getElementById('doc-name').value = doc.name;
  document.querySelectorAll('.dock-tabs button[data-tab]').forEach(b => b.textContent = t(b.dataset.tab));
}

export function bindChrome(handlers) {
  document.getElementById('btn-lang').onclick = () => setLang(lang === 'it' ? 'en' : 'it');
  document.getElementById('btn-undo').onclick = handlers.undo;
  document.getElementById('btn-redo').onclick = handlers.redo;
  document.getElementById('btn-new').onclick = () => dialog(t('newProject'),
    `<p>${t('width')}</p><input id="nw" type="number" value="512"><p>${t('height')}</p><input id="nh" type="number" value="512">
     <div class="chips">${SIZES.map(s => `<button class="chip" data-size="${s[0]},${s[1]}">${s[0]}×${s[1]}</button>`).join('')}</div>`,
    [{ label: t('cancel') }, { label: t('newProject'), primary: true, fn: () => {
      const w = +(document.getElementById('nw')?.value || 512), h = +(document.getElementById('nh')?.value || 512);
      newProject(Math.max(8, Math.min(2000, w)), Math.max(8, Math.min(2000, h))); renderAll();
    } }]);
  document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click();
  document.getElementById('btn-camera').onclick = handlers.camera;
  document.getElementById('btn-project').onclick = () => dialog(t('project'),
    `<p>${t('saveProject')} · ${t('open')}</p>`,
    [{ label: t('cancel') }, { label: t('saveProject'), primary: true, fn: () => { saveProject(); toast(t('projectSaved')); } },
     { label: t('open'), fn: () => document.getElementById('project-input').click() }]);
  document.getElementById('btn-share').onclick = handlers.share;
  document.getElementById('btn-export').onclick = handlers.exportDialog;
  document.getElementById('btn-clear')?.addEventListener('click', handlers.clear);
  document.getElementById('inspector-close').onclick = () => document.getElementById('inspector').classList.remove('open');
  document.getElementById('props-fab').onclick = () => document.getElementById('inspector').classList.toggle('open');
  document.getElementById('dock-toggle').onclick = () => {
    dockCollapsed = !dockCollapsed;
    document.getElementById('app').classList.toggle('dock-collapsed', dockCollapsed);
    document.getElementById('dock-toggle').textContent = dockCollapsed ? '⌃' : '⌄';
  };
  document.querySelectorAll('.dock-tabs button[data-tab]').forEach(b => b.onclick = () => { dockTab = b.dataset.tab; renderDock(); });
  document.getElementById('doc-name').onchange = e => { doc.name = e.target.value || 'Untitled'; renderHud(); };
  document.getElementById('zoom-in').onclick = () => handlers.zoom(1.25);
  document.getElementById('zoom-out').onclick = () => handlers.zoom(0.8);
  document.getElementById('zoom-fit').onclick = () => handlers.fit();
  onChange(() => { renderDock(); renderHud(); });
}
