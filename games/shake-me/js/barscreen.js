/* ============================================================
   Shake Me — the counter: tabs, pouring, technique, serving
   ============================================================ */
import * as W from './workbench.js';
import { INGREDIENTS, BY_ID, KINDS, COUNT_UNITS } from './data/ingredients.js';
import { GLASSES, ICES, RIMS, GARNISHES, ACTIONS, MUDDLE } from './data/bar.js';
import { RECIPE } from './data/recipes.js';
import { TIERS } from './judge.js';
import { stepsOf, doseText } from './steps.js';
import { glassSVG, toolSVG, personSVG } from './render/art.js';
import { esc, customer, glassName } from './ui.js';

const TABS = ['glass', 'tool', 'ings', 'tech', 'garnish'];
const TAB_ICON = { glass: '🥃', tool: '🍸', ings: '🍾', tech: '🌀', garnish: '🍋' };
const FLOATERS = ['cream', 'dark-rum', 'red-wine', 'islay-whisky'];
const ACTION_OF = { shaker: 'shake', mixing: 'stir', blender: 'blend' };

const nice = (v) => (v <= 60 ? 60 : v <= 90 ? 90 : v <= 120 ? 120 : v <= 160 ? 160 : 200);
const fmt = (n) => (Math.round(n * 100) / 100).toString();

export function createBar(root, deps) {
  const { t, lang, audio, settings, onServe, onQuit } = deps;
  let order = null, bench = W.newBench();
  let tab = 'glass', kind = 'spirit', query = '', sel = null, jig = 0, count = 0, target = 'tool';
  let hold = null, holdT = 0, recipeOpen = false, toastTimer = 0, stageKey = '';

  const recipe = () => RECIPE[order.recipe];
  const tier = () => TIERS[order.tier] || TIERS.easy;
  const lineFor = (id) => recipe().ings.find((l) => l.ids.includes(id));
  const unitFor = (id) => lineFor(id)?.unit ?? BY_ID[id].unit;

  function open(next) {
    order = next;
    bench = W.newBench();
    tab = 'glass'; kind = 'spirit'; query = ''; sel = null; jig = 0; count = 0; hold = null;
    recipeOpen = !!next.recipeOpen;
    stageKey = '';
    render();
  }

  function toast(key) {
    const el = root.querySelector('.bar-toast');
    if (!el) return;
    el.textContent = t(`err.${key}`);
    el.hidden = false;
    audio.sfx.error();
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 1800);
  }

  /** Runs a bench move; shows the reason when it is refused. */
  function move(fn, ...args) {
    const err = W[fn](bench, ...args);
    if (err) { toast(err); return false; }
    return true;
  }

  /* ---------- rendering ---------- */

  function glassPours() {
    const c = W.contents(bench);
    const list = c.glass.map((p) => ({ ...p }));
    const last = list[list.length - 1];
    if (last && list.length > 1 && (BY_ID[last.id].dense || (FLOATERS.includes(last.id) && last.target === 'glass'))) last.layer = true;
    return { list, extra: c.glassMl - list.reduce((n, p) => n + W.mlOf(p), 0), tool: c.tool };
  }

  function stageHTML() {
    const g = glassPours();
    const tool = bench.tool && bench.tool !== 'glass'
      ? `<div class="toolbox ${hold && ACTION_OF[bench.tool] === hold ? 'busy ' + hold : ''}">${toolSVG(bench.tool, g.tool, bench.toolIce, 'tl')}<small>${esc(t(`tools.${bench.tool}`))}${bench.strained ? ' ✓' : ''}</small></div>` : '';
    const glass = bench.glass
      ? `<div class="glassbox ${hold === 'swizzle' ? 'busy swizzle' : ''}">${glassSVG(bench.glass, { pours: g.list, extraMl: g.extra, ice: bench.glassIce, rim: bench.rim, garnish: bench.garnish, uid: 'gl', label: glassName(bench.glass, lang()) })}<small>${esc(glassName(bench.glass, lang()))}</small></div>`
      : `<div class="glassbox empty"><span>🥃</span><small>${esc(t('glass.pick'))}</small></div>`;
    return glass + tool;
  }

  function recipeHTML() {
    const r = recipe();
    if (order.recipeMode === 'never') return '';
    const done = (l) => bench.pours.some((p) => l.ids.includes(p.id));
    return `<div class="recipecard" ${recipeOpen ? '' : 'hidden'}>
      <ul class="check">${r.ings.map((l) => `<li class="${done(l) ? 'done' : ''}">${done(l) ? '✓' : '○'} ${esc(doseText(l, lang()))}</li>`).join('')}</ul>
      <ol class="steps">${stepsOf(r, lang()).map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>`;
  }

  function panelHTML() {
    if (tab === 'glass') {
      return `<div class="grid glasses">${GLASSES.map((g) => `<button type="button" class="pick" data-b="glass" data-id="${g.id}" aria-pressed="${bench.glass === g.id}">${glassSVG(g.id, { uid: 'p' + g.id, label: '' })}<span>${esc(g[lang()])}</span></button>`).join('')}</div>
        <fieldset><legend>${esc(t('glass.ice'))}</legend><div class="chips">${ICES.map((i) => `<button type="button" class="chip" data-b="gice" data-id="${i}" aria-pressed="${bench.glassIce === i}">${esc(t(`ice.${i}`))}</button>`).join('')}</div></fieldset>
        <fieldset><legend>${esc(t('glass.rim'))}</legend><div class="chips">${['none', ...RIMS].map((r) => `<button type="button" class="chip" data-b="rim" data-id="${r}" aria-pressed="${(bench.rim || 'none') === r}">${esc(t(`rim.${r}`))}</button>`).join('')}</div></fieldset>`;
    }
    if (tab === 'tool') {
      return `<div class="grid tools">${['shaker', 'mixing', 'blender', 'glass'].map((id) => `<button type="button" class="pick tool" data-b="tool" data-id="${id}" aria-pressed="${bench.tool === id}">
        <span class="ic">${id === 'glass' ? '🥃' : toolSVG(id, [], false, 'pt' + id)}</span><span>${esc(t(`tools.${id}`))}</span><small>${esc(t(`toolDesc.${id}`))}</small></button>`).join('')}</div>`;
    }
    if (tab === 'ings') return sel ? pourHTML() : shelfHTML();
    if (tab === 'tech') return techHTML();
    return `<div class="chips garnishes">${GARNISHES.map((g) => `<button type="button" class="chip" data-b="garnish" data-id="${g.id}" aria-pressed="${bench.garnish.includes(g.id)}"><span aria-hidden="true">${g.icon}</span> ${esc(g[lang()])}</button>`).join('')}</div>`;
  }

  function shelfHTML() {
    const q = query.trim().toLowerCase();
    const showNeed = order.recipeMode !== 'never' && tier().target;
    const need = new Set(showNeed ? recipe().ings.flatMap((l) => l.ids) : []);
    const list = INGREDIENTS.filter((i) => (q ? i.name[lang()].toLowerCase().includes(q) || i.name.en.toLowerCase().includes(q) || i.id.includes(q) : i.kind === kind));
    return `<input class="search" type="search" data-b-search placeholder="${esc(t('search'))}" value="${esc(query)}" aria-label="${esc(t('search'))}">
      ${q ? '' : `<div class="chips scroll kinds">${KINDS.map((k) => `<button type="button" class="chip" data-b="kind" data-id="${k}" aria-pressed="${kind === k}">${esc(t(`kinds.${k}`))}</button>`).join('')}</div>`}
      <div class="shelf">${list.map((i) => `<button type="button" class="bottle ${need.has(i.id) ? 'need' : ''}" data-b="ing" data-id="${i.id}"><i style="background:${i.color}"></i><span>${esc(i.name[lang()])}</span></button>`).join('')}</div>`;
  }

  function targetHTML() {
    if (!bench.tool || bench.tool === 'glass' || bench.strained) return '';
    return `<div class="chips target" role="group" aria-label="${esc(t('pour.into'))}">${['tool', 'glass'].map((x) => `<button type="button" class="chip" data-b="target" data-id="${x}" aria-pressed="${target === x}">${esc(t(`pour.${x}`))}</button>`).join('')}</div>`;
  }

  function jiggerMax() {
    const l = lineFor(sel);
    return l && l.unit === 'ml' ? nice(Math.max(l.amount * 1.6, l.amount + 20)) : 60;
  }

  function jiggerSVG() {
    const max = jiggerMax();
    const tr = tier();
    const H = 180, top = 10;
    const y = (ml) => top + H - (H * ml) / max;
    const step = max > 120 ? 10 : 5, label = max > 120 ? 20 : 10;
    let ticks = '';
    if (tr.lines !== 'none') {
      for (let ml = step; ml < max; ml += step) {
        const big = ml % label === 0;
        ticks += `<line x1="${big ? 14 : 22}" x2="${big ? 40 : 34}" y1="${y(ml)}" y2="${y(ml)}" stroke="rgba(255,255,255,.7)" stroke-width="${big ? 1.6 : 1}"/>`;
        if (big && tr.lines === 'numbers') ticks += `<text x="46" y="${y(ml) + 4}" font-size="11" fill="#fff">${ml}</text>`;
      }
    }
    const l = lineFor(sel);
    const want = tr.target && order.recipeMode !== 'never' && l && l.unit === 'ml'
      ? `<line class="want" x1="4" x2="66" y1="${y(l.amount)}" y2="${y(l.amount)}" stroke="#4ade80" stroke-width="2.5" stroke-dasharray="5 3"/><text x="70" y="${y(l.amount) + 4}" font-size="11" fill="#4ade80">${fmt(l.amount)}</text>` : '';
    const fill = Math.min(jig, max);
    return `<svg class="jigger" viewBox="0 0 96 200" aria-hidden="true">
      <rect x="8" y="${top}" width="56" height="${H}" rx="6" fill="rgba(255,255,255,.08)" stroke="#d8dde4" stroke-width="2"/>
      <rect class="jfill" x="10" y="${y(fill)}" width="52" height="${(H * fill) / max}" fill="${BY_ID[sel].color}" opacity=".92"/>
      ${ticks}${want}</svg>`;
  }

  function pourHTML() {
    const ing = BY_ID[sel];
    const unit = unitFor(sel);
    const head = `<div class="pour-head"><button type="button" class="btn icon" data-b="unsel" aria-label="${esc(t('back'))}">‹</button><i style="background:${ing.color}"></i><strong>${esc(ing.name[lang()])}</strong></div>${targetHTML()}`;
    if (unit === 'some') return `${head}<button type="button" class="btn primary wide" data-b="some">${esc(t('pour.some'))}</button>`;
    if (unit !== 'ml') {
      const stepU = COUNT_UNITS[unit] || 1;
      return `${head}<div class="counter"><button type="button" class="btn big" data-b="minus" aria-label="−${stepU}">−</button><output aria-live="polite">${fmt(count)} <small>${esc(t(`units.${unit}`))}</small></output><button type="button" class="btn big" data-b="plus" aria-label="+${stepU}">+</button></div>
        <button type="button" class="btn primary wide" data-b="add" ${count > 0 ? '' : 'disabled'}>${esc(t('pour.add'))}</button>`;
    }
    const readout = tier().lines === 'numbers' ? `<output class="readout" aria-live="polite">${Math.round(jig)} ml</output>` : '<output class="readout" aria-live="polite"></output>';
    return `${head}<div class="pour-row">${jiggerSVG()}<div class="pour-ctl">${readout}
        <button type="button" class="btn hold primary" data-hold="pour">${esc(t('pour.hold'))}</button>
        <div class="row"><button type="button" class="btn" data-b="emptyjig">${esc(t('pour.empty'))}</button><button type="button" class="btn primary" data-b="addml" ${jig > 0 ? '' : 'disabled'}>${esc(t('pour.add'))}</button></div></div></div>`;
  }

  function meterHTML(action) {
    const a = ACTIONS[action];
    const p = bench.acts[action]?.progress || 0;
    return `<div class="meter" data-meter="${action}"><i class="band" style="left:${a.band[0] * 100}%;width:${(a.band[1] - a.band[0]) * 100}%"></i><u style="width:${Math.min(100, p * 100)}%"></u></div>`;
  }

  function techHTML() {
    if (!bench.tool) return `<p class="muted">${esc(t('tech.noTool'))}</p>`;
    const v = bench.tool === 'glass' || bench.strained ? 'glass' : 'tool';
    const muddle = `<button type="button" class="btn" data-b="muddle">🪵 ${esc(t('tech.muddle', { n: bench.muddle[v] }))}</button>`;
    if (bench.tool === 'glass') {
      return `<p class="muted">${esc(t('in.glass'))}</p><div class="col">${muddle}
        ${meterHTML('swizzle')}<button type="button" class="btn hold" data-hold="swizzle">${esc(t('tech.swizzle'))}</button></div>`;
    }
    const action = ACTION_OF[bench.tool];
    return `<div class="col">
      <button type="button" class="chip big" data-b="toolice" aria-pressed="${bench.toolIce}">🧊 ${esc(t('tech.toolIce'))}</button>
      ${muddle}
      ${meterHTML(action)}
      <button type="button" class="btn hold primary" data-hold="${action}" ${bench.strained ? 'disabled' : ''}>${esc(t(`tech.${action}`))}</button>
      ${action === 'shake' && settings().sensor ? `<small class="muted">${esc(t('tech.sensor'))}</small>` : ''}
      <button type="button" class="btn" data-b="strain" ${bench.strained ? 'disabled' : ''}>${esc(t(bench.tool === 'blender' ? 'tech.pourOut' : 'tech.strain'))}${bench.strained ? ' ✓' : ''}</button></div>`;
  }

  function render() {
    if (!order) return;
    const r = recipe();
    const c = customer(order.customer);
    const who = c ? c[lang()].split(',')[0] : 'Tobia';
    const canSee = order.recipeMode !== 'never';
    root.innerHTML = `
      <header class="order">
        <button type="button" class="btn icon" data-b="quit" aria-label="${esc(t('menu'))}">‹</button>
        <span class="avatar">${c ? personSVG({ color: '#e0b090', hair: c.hair, cardigan: c.color }) : ''}</span>
        <div class="what"><small>${esc(order.label || '')}</small><strong>${esc(r.name)}</strong><small>${esc(t('orders', { c: who }))} · <span class="tier ${order.tier}">${esc(t(`tier.${order.tier}`))}</span></small></div>
        ${canSee ? `<button type="button" class="btn" data-b="recipe" aria-expanded="${recipeOpen}">📜 ${esc(t(recipeOpen ? 'hideRecipe' : 'recipe'))}</button>` : ''}
      </header>
      ${order.say ? `<p class="say">“${esc(order.say)}”</p>` : ''}
      ${recipeHTML()}
      <div class="stage">${stageHTML()}</div>
      <p class="bar-toast" role="status" hidden></p>
      <nav class="tabs" role="tablist">${TABS.map((x) => `<button type="button" role="tab" class="tab" data-b="tab" data-id="${x}" aria-selected="${tab === x}"><span aria-hidden="true">${TAB_ICON[x]}</span>${esc(t(`tabs.${x}`))}</button>`).join('')}</nav>
      <div class="panel" role="tabpanel">${panelHTML()}</div>
      <footer class="bar-foot"><button type="button" class="btn" data-b="reset">↺ ${esc(t('reset'))}</button><button type="button" class="btn primary serve" data-b="serve" ${W.contents(bench).glass.length ? '' : 'disabled'}>🛎️ ${esc(t('serve'))}</button></footer>`;
    stageKey = '';
  }

  /** Light refresh: only the glass, the tool, the serve button and the recipe ticks. */
  function refreshStage() {
    const st = root.querySelector('.stage');
    if (st) st.innerHTML = stageHTML();
    const serve = root.querySelector('[data-b="serve"]');
    if (serve) serve.disabled = !W.contents(bench).glass.length;
    const rc = root.querySelector('.recipecard');
    if (rc) { const open = !rc.hidden; rc.outerHTML = recipeHTML(); if (open) root.querySelector('.recipecard').hidden = false; }
  }

  function refreshPanel() {
    const p = root.querySelector('.panel');
    if (p) p.innerHTML = panelHTML();
    const s = p?.querySelector('[data-b-search]');
    if (s && query) { s.focus(); s.setSelectionRange(query.length, query.length); }
  }

  /* ---------- input ---------- */

  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-b]');
    if (!el || el.disabled || !order) return;
    const id = el.dataset.id;
    const k = el.dataset.b;
    let stage = false, panel = false;
    switch (k) {
      case 'quit': return onQuit();
      case 'tab': tab = id; sel = null; render(); audio.sfx.tap(); return;
      case 'recipe': recipeOpen = !recipeOpen; render(); return;
      case 'glass': if (move('chooseGlass', id)) { audio.sfx.glass(); stage = panel = true; } break;
      case 'gice': if (move('setGlassIce', id)) { if (id !== 'none') audio.sfx.ice(); stage = panel = true; } break;
      case 'rim': if (move('setRim', id === 'none' ? null : id)) { stage = panel = true; audio.sfx.tap(); } break;
      case 'tool': if (move('chooseTool', id)) { target = id === 'glass' ? 'glass' : 'tool'; audio.sfx.glass(); stage = panel = true; } break;
      case 'kind': kind = id; panel = true; break;
      case 'ing': sel = id; jig = 0; count = 0; target = W.defaultTarget(bench); panel = true; audio.sfx.tap(); break;
      case 'unsel': sel = null; panel = true; break;
      case 'target': target = id; panel = true; break;
      case 'plus': count += COUNT_UNITS[unitFor(sel)] || 1; panel = true; audio.sfx.tap(); break;
      case 'minus': count = Math.max(0, count - (COUNT_UNITS[unitFor(sel)] || 1)); panel = true; break;
      case 'emptyjig': jig = 0; panel = true; break;
      case 'add': if (move('pour', sel, count, unitFor(sel), target)) { audio.sfx.add(); sel = null; stage = panel = true; } break;
      case 'addml': if (move('pour', sel, Math.round(jig * 2) / 2, 'ml', target)) { audio.sfx.add(); sel = null; stage = panel = true; } break;
      case 'some': if (move('pour', sel, 1, 'some', target)) { audio.sfx.add(); sel = null; stage = panel = true; } break;
      case 'toolice': if (move('setToolIce', !bench.toolIce)) { if (bench.toolIce) audio.sfx.ice(); stage = panel = true; } break;
      case 'muddle': if (move('muddle', 1)) { audio.sfx.muddle(); panel = true; if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(15); } break;
      case 'strain': if (move('strain')) { audio.sfx.strain(); target = 'glass'; stage = panel = true; } break;
      case 'garnish': move('toggleGarnish', id); audio.sfx.tap(); stage = panel = true; break;
      case 'reset': open({ ...order, recipeOpen }); return;
      case 'serve': if (W.contents(bench).glass.length) { stopHold(); bench.served = true; audio.sfx.serve(); onServe(bench); } return;
      default: return;
    }
    if (stage) refreshStage();
    if (panel) refreshPanel();
  });

  root.addEventListener('input', (e) => {
    if (!e.target.matches('[data-b-search]')) return;
    query = e.target.value;
    refreshPanel();
  });

  function startHold(kind) {
    if (hold || !order) return;
    if (kind !== 'pour') {
      const a = ACTIONS[kind];
      if (bench.tool !== a.tool) return toast('wrongTool');
      const v = a.tool === 'glass' ? 'glass' : 'tool';
      if (!bench.pours.some((p) => p.target === v)) return toast('empty');
    }
    hold = kind;
    holdT = 0;
    audio.startLoop(kind === 'pour' ? 'pour' : kind);
    root.querySelector(`[data-hold="${kind}"]`)?.classList.add('down');
    if (kind !== 'pour') refreshStage();
  }

  function stopHold() {
    if (!hold) return;
    audio.stopLoop(hold === 'pour' ? 'pour' : hold);
    root.querySelector(`[data-hold="${hold}"]`)?.classList.remove('down');
    const was = hold;
    hold = null;
    if (was === 'pour') { const b = root.querySelector('[data-b="addml"]'); if (b) b.disabled = !(jig > 0); }
    else refreshStage();
  }

  root.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('[data-hold]');
    if (!el || el.disabled || e.button > 0) return;
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch (_) { /* synthetic */ }
    startHold(el.dataset.hold);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) root.addEventListener(type, () => stopHold());
  root.addEventListener('keydown', (e) => {
    const el = e.target.closest?.('[data-hold]');
    if (!el || (e.key !== ' ' && e.key !== 'Enter')) return;
    e.preventDefault();
    if (!e.repeat) startHold(el.dataset.hold);
  });
  root.addEventListener('keyup', (e) => { if ((e.key === ' ' || e.key === 'Enter') && hold) stopHold(); });

  /** Shaking the phone pushes the shaker meter. */
  function impulse(k) {
    if (!order || tab !== 'tech' || bench.tool !== 'shaker' || bench.strained || !bench.pours.some((p) => p.target === 'tool')) return;
    const cur = bench.acts.shake?.progress || 0;
    W.act(bench, 'shake', cur + k / ACTIONS.shake.full);
    audio.sfx.ice();
    const m = root.querySelector('[data-meter="shake"] u');
    if (m) m.style.width = `${Math.min(100, (cur + k / ACTIONS.shake.full) * 100)}%`;
  }

  function tick(dt) {
    if (!hold || !order) return;
    holdT += dt;
    if (hold === 'pour') {
      const rate = holdT < 0.5 ? 10 : 30;
      jig = Math.min(jiggerMax(), jig + rate * dt);
      const svg = root.querySelector('.jigger');
      if (svg) {
        const max = jiggerMax();
        const f = svg.querySelector('.jfill');
        f.setAttribute('y', 10 + 180 - (180 * jig) / max);
        f.setAttribute('height', (180 * jig) / max);
      }
      const out = root.querySelector('.readout');
      if (out && tier().lines === 'numbers') out.textContent = `${Math.round(jig)} ml`;
    } else {
      const a = ACTIONS[hold];
      const cur = bench.acts[hold]?.progress || 0;
      W.act(bench, hold, cur + dt / a.full);
      const m = root.querySelector(`[data-meter="${hold}"] u`);
      if (m) m.style.width = `${Math.min(100, (bench.acts[hold].progress) * 100)}%`;
    }
  }

  return {
    open, tick, impulse, render,
    stop: stopHold,
    get bench() { return bench; },
    get order() { return order; },
    /** Test hook: put the bench in a given state. */
    setBench(b) { bench = b; render(); },
    setTab(x) { tab = x; sel = null; render(); },
  };
}

export { MUDDLE };
