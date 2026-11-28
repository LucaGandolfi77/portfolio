/* ============================================================
   Ultimo Colore — the battle on screen
   ------------------------------------------------------------
   Runs on its own clock (tick), so pausing is exact and tests
   can fast-forward. Rules stay in battle/engine.js.
   ============================================================ */
import * as E from '../battle/engine.js';
import { judgeDefence, judgeTap, tapBeats, moveEnd, rules, windowFor } from '../battle/timing.js';
import { HEROES, ITEMS, skillsAt } from '../data/party.js';
import { ENEMIES } from '../data/enemies.js';
import { heroSVG, foeSVG, SPRITE_SCALE } from '../render/sprites.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function createBattleUI(root, deps) {
  const { t, lang, audio, settings, onEnd, onMenu } = deps;
  let b = null, node = null, phase = 'idle', clock = 0, waits = [], paused = false;
  let actor = null, pending = null, taps = [], beats = [], t0 = 0, aim = null;
  let move = null, enemy = null, presses = [], shown = [], tutorialPage = -1;

  const $ = (s) => root.querySelector(s);
  const wait = (ms, fn) => waits.push({ at: clock + ms, fn });
  const L = () => lang();
  const heroName = (id) => HEROES[id].name;

  /* ---------- drawing ---------- */

  function build(art) {
    root.innerHTML = `
      <div class="b-bg" style="background-image:url('${art}')"></div>
      <button type="button" class="b-menu btn icon" data-u="menu" aria-label="${esc(t('menu'))}">❚❚</button>
      <div class="foes">${b.enemies.map((e) => `
        <button type="button" class="foe-box" data-foe="${e.id}">
          <span class="f-name">${esc(e.name[L()])}</span>
          <span class="bar hp"><i></i></span><span class="bar brk"><i></i></span>
          <span class="f-status"></span>
          <span class="sprite" style="--s:${SPRITE_SCALE[e.type]}">${foeSVG(e.type)}<span class="weak" hidden></span></span>
        </button>`).join('')}</div>
      <p class="banner" role="status" aria-live="polite"></p>
      <div class="floaters" aria-hidden="true"></div>
      <div class="ring" hidden><i></i><b></b><span></span></div>
      <div class="heroes">${b.heroes.map((h) => `
        <button type="button" class="hero-card" data-hero="${h.id}" style="--c:${HEROES[h.id].color}">
          <span class="h-pic">${heroSVG(h.id, { portrait: true })}</span>
          <span class="h-name">${esc(h.name)}</span>
          <span class="bar hp"><i></i></span><small class="h-hp"></small>
          <span class="pips"></span><small class="h-extra"></small>
        </button>`).join('')}</div>
      <div class="controls"></div>
      <div class="tapzone" hidden><span></span></div>
      <div class="b-over" hidden></div>`;
    refresh();
  }

  function refresh() {
    if (!b) return;
    for (const e of b.enemies) {
      const el = $(`[data-foe="${e.id}"]`);
      if (!el) continue;
      el.querySelector('.hp i').style.width = `${(e.hp / e.maxHp) * 100}%`;
      el.querySelector('.brk i').style.width = `${(e.brk / e.brkMax) * 100}%`;
      el.classList.toggle('fallen', e.hp <= 0);
      el.classList.toggle('broken', e.broken);
      el.setAttribute('aria-label', `${e.name[L()]}, ${Math.ceil(e.hp)}/${e.maxHp}`);
      const st = [e.broken && t('battle.broken'), e.burn > 0 && `🔥`, e.marked > 0 && `✚ ${t('battle.mark')}`].filter(Boolean);
      el.querySelector('.f-status').textContent = st.join(' ');
      el.querySelector('.weak').hidden = !e.weak || e.hp <= 0;
    }
    for (const h of b.heroes) {
      const el = $(`[data-hero="${h.id}"]`);
      el.querySelector('.hp i').style.width = `${(h.hp / h.maxHp) * 100}%`;
      el.querySelector('.h-hp').textContent = h.hp > 0 ? `${h.hp}/${h.maxHp}${h.shield ? ` 🛡${h.shield}` : ''}` : t('battle.down');
      el.querySelector('.pips').innerHTML = Array.from({ length: E.AP_MAX }, (_, i) => `<i class="${i < h.ap ? 'on' : ''}"></i>`).join('');
      el.querySelector('.pips').setAttribute('aria-label', `${h.ap} ${t('battle.ap')}`);
      el.querySelector('.h-extra').textContent = h.id === 'ilario' ? '✦'.repeat(h.sparks) + '✧'.repeat(3 - h.sparks)
        : h.id === 'nora' ? `${t('battle.tempo')} ${h.tempo}` : h.id === 'bastiano' ? '🔔'.repeat(h.charge) || `${t('battle.charge')} 0` : '';
      el.classList.toggle('active', b.current === h.id && phase !== 'defend');
      el.classList.toggle('down', h.hp <= 0);
      el.classList.toggle('targeted', phase === 'defend' && !!move?.targets.includes(h.id));
    }
  }

  const banner = (text) => { const el = $('.banner'); if (el) el.textContent = text; };

  /** A short word or number rising from an element. */
  function float(sel, text, cls = '') {
    const at = $(sel) || $('.heroes');
    const host = $('.floaters');
    if (!at || !host) return;
    const r = at.getBoundingClientRect(), base = root.getBoundingClientRect();
    const el = document.createElement('span');
    el.className = `float ${cls}`;
    el.textContent = text;
    el.style.left = `${r.left - base.left + r.width / 2 + (Math.random() - 0.5) * 30}px`;
    el.style.top = `${r.top - base.top + r.height * 0.4}px`;
    host.appendChild(el);
    wait(900, () => el.remove());
  }

  /* ---------- playing the events of the engine ---------- */

  function playEvents(events, then) {
    let i = 0;
    const step = () => {
      if (i >= events.length) { refresh(); then?.(); return; }
      const ev = events[i++];
      const foe = `[data-foe="${ev.target}"]`, hero = `[data-hero="${ev.target}"]`;
      let delay = 90;
      switch (ev.t) {
        case 'damage': float(foe, String(ev.amount), ev.kind); audio.sfx.hit(); shake(foe); delay = 200; break;
        case 'hurt': float(hero, ev.amount ? `−${ev.amount}` : t('battle.shield'), 'hurt'); audio.sfx.hurt(); shake(hero); delay = 180; break;
        case 'heal': float(hero, `+${ev.amount}`, 'heal'); audio.sfx.heal(); delay = 140; break;
        case 'ap': float(hero, `+${ev.amount} ${t('battle.ap')}`, 'ap'); delay = 40; break;
        case 'break': float(foe, t('battle.broken'), 'big'); audio.sfx.shatter(); delay = 500; break;
        case 'recover': float(foe, t('battle.recovered')); delay = 450; break;
        case 'stagger': float(foe, t('battle.staggered'), 'big'); delay = 500; break;
        case 'counter': float(hero, t('battle.counter'), 'big'); audio.sfx.counter(); delay = 380; break;
        case 'flare': float(hero, t('battle.flare'), 'big'); audio.sfx.counter(); delay = 300; break;
        case 'endure': float(hero, t('battle.endure'), 'big'); delay = 300; break;
        case 'down': float(hero, t('battle.down'), 'hurt'); delay = 300; break;
        case 'revive': float(hero, '✚', 'heal'); audio.sfx.heal(); delay = 300; break;
        case 'fall': audio.sfx.shatter(); delay = 380; break;
        case 'miss': float(foe, t('battle.miss')); audio.sfx.miss(); delay = 200; break;
        case 'status': float(foe, t(`battle.${ev.status === 'stagger' ? 'staggered' : ev.status}`), 'status'); delay = 180; break;
        case 'shield': float(hero, `🛡 ${ev.amount}`, 'heal'); delay = 80; break;
        case 'wide': banner(t('battle.wide')); audio.sfx.toll(); delay = 500; break;
        case 'phase': banner(ev.line[L()]); audio.sfx.shatter(); delay = 1700; break;
        case 'ombra': {
          banner(ev.what === 'olio' ? t('battle.ombraOil') : ev.what === 'bark' ? t('battle.ombraBark') : t('battle.ombraDrag', { n: heroName(ev.target) }));
          audio.sfx.bark(); delay = 900; break;
        }
        default: delay = 0;
      }
      refresh();
      if (delay) wait(delay, step); else step();
    };
    step();
  }

  function shake(sel) {
    const el = $(sel);
    if (!el || settings().motion) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }

  /* ---------- turns ---------- */

  function nextTurn() {
    phase = 'resolve';
    renderControls();
    const r = E.next(b);
    playEvents(r.events, () => {
      if (r.type === 'win' || r.type === 'lose') return finish(r.type);
      if (r.type === 'hero') {
        actor = r.actor; phase = 'menu';
        banner(t('battle.turn', { n: actor.name }));
        refresh(); renderControls();
      } else startDefence(r.actor, r.move);
    });
  }

  function finish(result) {
    if (phase === 'over') return;
    phase = 'over';
    audio.stopCues();
    renderControls();
    banner('');
    if (result === 'win') audio.sfx.win(); else audio.sfx.lose();
    wait(1100, () => onEnd(result, b, node));
  }

  /* ---------- the command menu ---------- */

  const cmd = (act, label, sub = '', off = false, extra = '') => `<button type="button" class="cmd" data-u="${act}" ${extra} ${off ? 'disabled' : ''}><b>${esc(label)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</button>`;

  function renderControls() {
    const el = $('.controls');
    if (!el) return;
    el.dataset.phase = phase;
    if (phase === 'menu') {
      el.innerHTML = `<div class="grid4">
        ${cmd('attack', `⚔ ${t('battle.attack')}`, `+1 ${t('battle.ap')}`)}
        ${cmd('skills', `✺ ${t('battle.skills')}`, `${actor.ap} ${t('battle.ap')}`)}
        ${cmd('spark', `✦ ${t('battle.spark')}`, `1 ${t('battle.ap')} · ×${b.sparksLeft}`, !E.canUse(b, actor, { kind: 'spark' }))}
        ${cmd('items', `🏮 ${t('battle.item')}`, String(b.items.olio + b.items.cera), b.items.olio + b.items.cera === 0)}</div>`;
    } else if (phase === 'skills') {
      el.innerHTML = `<div class="list">${skillsAt(actor.id, actor.level).map((s) => cmd('skill', s[L()], `${s.ap} ${t('battle.ap')} · ${L() === 'it' ? s.dit : s.den}`, actor.ap < s.ap, `data-id="${s.id}"`)).join('')}</div>${cmd('cancel', t('battle.cancel'))}`;
    } else if (phase === 'items') {
      el.innerHTML = `<div class="list">${Object.entries(ITEMS).map(([id, it]) => cmd('item', `${it[L()]} ×${b.items[id]}`, L() === 'it' ? it.dit : it.den, !b.items[id], `data-id="${id}"`)).join('')}</div>${cmd('cancel', t('battle.cancel'))}`;
    } else if (phase === 'target' || phase === 'ally') {
      el.innerHTML = `<p class="prompt">${esc(t(phase === 'target' ? 'battle.pickTarget' : 'battle.pickAlly'))}</p>${cmd('cancel', t('battle.cancel'))}`;
    } else if (phase === 'defend') {
      const low = move.hits.some((h) => h.kind === 'low');
      el.innerHTML = rules(b.difficulty).auto ? '' : `<div class="defence">
        <button type="button" class="def jump ${low ? 'needed' : ''}" data-def="jump">⤒ ${esc(t('battle.jump'))}</button>
        <button type="button" class="def dodge" data-def="dodge">↷ ${esc(t('battle.dodge'))}</button>
        <button type="button" class="def parry" data-def="parry">🛡 ${esc(t('battle.parry'))}</button></div>`;
    } else if (phase === 'attack' || phase === 'aim') {
      el.innerHTML = `<p class="prompt big">${esc(t(phase === 'attack' ? 'battle.tapNow' : aim?.weak ? 'battle.aim' : 'battle.aimBody'))}</p>`;
    } else el.innerHTML = '';
  }

  function chooseTarget(action, side) {
    pending = action;
    const list = side === 'enemy' ? E.living(b.enemies) : b.heroes.filter((h) => (ITEMS[action.item]?.revive ? h.hp <= 0 : h.hp > 0));
    if (side === 'enemy' && list.length === 1) return begin({ ...action, target: list[0].id });
    if (!list.length) return;
    phase = side === 'enemy' ? 'target' : 'ally';
    renderControls();
    root.classList.toggle('picking-foe', side === 'enemy');
    root.classList.toggle('picking-ally', side !== 'enemy');
  }

  function begin(action) {
    root.classList.remove('picking-foe', 'picking-ally');
    pending = action;
    const auto = rules(b.difficulty).auto;
    if (action.kind === 'item') return resolve([]);
    if (action.kind === 'spark') {
      if (auto) return resolve(['good']);
      phase = 'aim'; t0 = clock;
      const e = E.find(b, action.target);
      aim = { id: e.id, weak: e.weak };
      showTapZone(true);
      renderControls();
      return;
    }
    const s = action.kind === 'skill' ? skillsAt(actor.id, actor.level).find((x) => x.id === action.skill) : null;
    const n = s?.taps || 1;
    if (auto) return resolve(Array(n).fill('good'));
    phase = 'attack'; t0 = clock; taps = []; beats = tapBeats(n);
    showTapZone(true);
    renderControls();
    banner(s ? s[L()] : t('battle.attack'));
  }

  function showTapZone(on) {
    $('.tapzone').hidden = !on;
    if (!on) $('.ring').hidden = true;
  }

  function resolve(qualities) {
    showTapZone(false);
    const el = $('.weakdot');
    if (el) el.remove();
    const events = E.heroAct(b, actor.id, { ...pending, taps: qualities });
    const wasSpark = pending.kind === 'spark';
    pending = null;
    if (!events) { phase = 'menu'; renderControls(); return; }
    phase = 'resolve';
    renderControls();
    const sprite = $(`[data-hero="${actor.id}"]`);
    sprite?.classList.add('lunge');
    wait(250, () => sprite?.classList.remove('lunge'));
    playEvents(events, () => {
      if (b.over) return finish(b.over);
      if (wasSpark && b.current === actor.id) { phase = 'menu'; renderControls(); refresh(); return; }
      wait(220, nextTurn);
    });
  }

  function tapAttack() {
    const i = taps.length;
    if (i >= beats.length) return;
    const q = judgeTap(beats[i], clock - t0, b.difficulty);
    taps.push(q);
    float('.ring', t(`battle.${q}`), q);
    if (q === 'perfect') audio.sfx.perfect(); else if (q === 'good') audio.sfx.tap(); else audio.sfx.miss();
  }

  function tapAim(x, y) {
    const dot = $('.weakdot');
    const box = $(`[data-foe="${aim.id}"] .sprite`).getBoundingClientRect();
    let q = 'good';
    if (x !== undefined) {
      const d = dot?.getBoundingClientRect();
      const near = d && Math.hypot(x - (d.left + d.width / 2), y - (d.top + d.height / 2)) <= (aim.weak ? 30 : 22);
      const inside = x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
      q = near ? 'perfect' : inside ? 'good' : 'miss';
    }
    aim = null;
    resolve([q]);
  }

  /* ---------- defence ---------- */

  function startDefence(e, m) {
    enemy = e; move = m; presses = []; shown = m.hits.map(() => false);
    phase = 'defend'; t0 = clock + 350;
    const hints = [m.hits.some((h) => h.kind === 'low') && t('battle.low'), m.feint && t('battle.feint')].filter(Boolean);
    banner(`${t('battle.enemyTurn', { n: e.name[L()], m: m.name[L()] })}${hints.length ? ` · ${hints.join(' · ')}` : ''}`);
    refresh(); renderControls();
    for (const h of m.hits) audio.cue(h.kind, h.at + 350, h === m.hits[m.hits.length - 1] && m.feint ? m.feint + 350 : null);
  }

  function press(kind) {
    if (phase !== 'defend' || paused || rules(b.difficulty).auto) return;
    const now = clock - t0;
    presses.push({ t: now, kind });
    const el = $(`[data-def="${kind}"]`);
    el?.classList.add('down');
    wait(120, () => el?.classList.remove('down'));
    if (kind === 'dodge') audio.sfx.dodge(); else if (kind === 'jump') audio.sfx.jump(); else audio.sfx.tap();
    showOutcomes(judgeDefence(move.hits, presses, b.difficulty, b.wide > 0), now);
  }

  const WORD = { parry: 'parried', leap: 'parried', dodge: 'dodged', jump: 'jumped', hit: 'hitTaken' };
  function showOutcomes(out, now) {
    out.forEach((o, i) => {
      if (shown[i]) return;
      const h = move.hits[i];
      const late = now > h.at + Math.max(windowFor('dodge', h, b.difficulty, b.wide > 0), windowFor('jump', h, b.difficulty, b.wide > 0));
      if (o === 'hit' && !late) return;
      shown[i] = true;
      if (rules(b.difficulty).auto) return;
      float('.heroes', t(`battle.${WORD[o]}`), o === 'hit' ? 'hurt' : o === 'parry' || o === 'leap' ? 'perfect' : 'good');
      if (o === 'parry' || o === 'leap') audio.sfx.parry();
    });
  }

  function endDefence() {
    const out = judgeDefence(move.hits, presses, b.difficulty, b.wide > 0);
    showOutcomes(out, Infinity);
    phase = 'resolve';
    renderControls();
    const el = $(`[data-foe="${enemy.id}"] .sprite`);
    if (el) el.style.transform = '';
    $('.ring').hidden = true;
    const events = E.enemyAct(b, enemy.id, move, out) || [];
    move = null;
    playEvents(events, () => { if (b.over) return finish(b.over); wait(300, nextTurn); });
  }

  /** The enemy's body telegraphs each blow; the ring says when. */
  function animateDefence(now) {
    const el = $(`[data-foe="${enemy.id}"] .sprite`);
    if (!el) return;
    let push = 0;
    for (const h of move.hits) {
      const lead = h.at - now;
      if (lead >= 0 && lead < 600) push = Math.max(push, (1 - lead / 600) ** 3);
      else if (lead < 0 && lead > -220) push = Math.max(push, 1 + lead / 220);
    }
    // a feint starts like a blow and stops half way
    if (move.feint) { const lead = move.feint - now; if (lead > -260 && lead < 420) push = Math.max(push, 0.55 * (lead >= 0 ? (1 - lead / 420) ** 2 : 1 + lead / 260)); }
    const wind = move.hits.some((h) => h.at - now > 600 && h.at - now < 1000) ? -0.12 : 0;
    el.style.transform = settings().motion && !push ? '' : `translateY(${(push * 46 + wind * 60).toFixed(1)}px) scale(${(1 + push * 0.2 + wind * 0.4).toFixed(3)})`;
    el.classList.toggle('striking', push > 0.75);

    const ring = $('.ring');
    const upcoming = move.hits.find((h, i) => !shown[i] && h.at - now < 800 && h.at - now > -120);
    if (!upcoming || !rules(b.difficulty).ring) { ring.hidden = true; return; }
    placeRing('.heroes', Math.max(0, upcoming.at - now) / 800, upcoming.kind === 'low' ? '⬇' : '');
    ring.classList.toggle('low', upcoming.kind === 'low');
  }

  function placeRing(sel, k, icon = '') {
    const ring = $('.ring');
    const at = $(sel);
    if (!at) return;
    const r = at.getBoundingClientRect(), base = root.getBoundingClientRect();
    ring.hidden = false;
    const x = r.left - base.left + r.width / 2;
    const y = sel === '.heroes' ? r.top - base.top - 104 : r.top - base.top + r.height / 2;
    ring.style.left = `${x}px`; ring.style.top = `${y}px`;
    ring.querySelector('i').style.transform = `translate(-50%,-50%) scale(${(1 + k * 2.4).toFixed(3)})`;
    ring.querySelector('i').style.opacity = String(clamp(1.15 - k, 0.25, 1));
    ring.querySelector('span').textContent = icon;
  }

  /* ---------- the clock ---------- */

  function tick(ms) {
    if (!b || paused || phase === 'idle') return;
    clock += ms;
    for (;;) {
      const i = waits.findIndex((w) => w.at <= clock);
      if (i < 0) break;
      const [w] = waits.splice(i, 1);
      w.fn();
      if (!b) return;
    }
    if (phase === 'attack') {
      const now = clock - t0;
      const i = taps.length;
      if (i < beats.length) {
        if (now > beats[i] + rules(b.difficulty).good) { taps.push('miss'); float('.ring', t('battle.miss'), 'miss'); }
        const target = pending.target ? `[data-foe="${pending.target}"] .sprite` : '.foes';
        const k = clamp(((beats[Math.min(taps.length, beats.length - 1)] - now) / 700), 0, 1);
        placeRing(target, k, beats.length > 1 ? `${Math.min(taps.length + 1, beats.length)}/${beats.length}` : '');
        $('.ring').classList.remove('low');
        if (!rules(b.difficulty).ring) $('.ring i').style.opacity = String(k < 0.25 ? 0.9 : 0.15);
      } else if (now > beats[beats.length - 1] + 120) resolve(taps);
    } else if (phase === 'aim') {
      const now = (clock - t0) / 1000;
      const box = $(`[data-foe="${aim.id}"] .sprite`);
      let dot = $('.weakdot');
      if (!dot) { dot = document.createElement('span'); dot.className = `weakdot ${aim.weak ? '' : 'hidden-weak'}`; root.appendChild(dot); }
      const r = box.getBoundingClientRect(), base = root.getBoundingClientRect();
      dot.style.left = `${r.left - base.left + r.width * (0.5 + 0.26 * Math.cos(now * 2.3))}px`;
      dot.style.top = `${r.top - base.top + r.height * (0.5 + 0.22 * Math.sin(now * 3.1))}px`;
      if (now > 5) { aim = null; resolve(['miss']); }
    } else if (phase === 'defend') {
      const now = clock - t0;
      showOutcomes(judgeDefence(move.hits, presses, b.difficulty, b.wide > 0), now);
      animateDefence(now);
      if (now >= moveEnd(move)) endDefence();
    }
  }

  /* ---------- input ---------- */

  root.addEventListener('pointerdown', (e) => {
    if (!b || paused) return;
    const def = e.target.closest('[data-def]');
    if (def) { e.preventDefault(); press(def.dataset.def); return; }
    if (e.target.closest('.tapzone')) {
      e.preventDefault();
      if (phase === 'attack') tapAttack(); else if (phase === 'aim') tapAim(e.clientX, e.clientY);
    }
  });

  root.addEventListener('click', (e) => {
    if (!b) return;
    // keyboard activation of the defence buttons arrives as a click with no pointer
    const def = e.target.closest('[data-def]');
    if (def && e.detail === 0) { press(def.dataset.def); return; }
    const u = e.target.closest('[data-u]');
    if (u && !u.disabled) {
      const k = u.dataset.u, id = u.dataset.id;
      if (k === 'menu') return onMenu();
      if (k === 'tutorial') { if (tutorialPage >= 0) tutorialNext(); return; }
      if (paused) return;
      audio.sfx.tap();
      if (k === 'cancel') { phase = 'menu'; pending = null; root.classList.remove('picking-foe', 'picking-ally'); renderControls(); }
      else if (phase === 'menu' && k === 'attack') chooseTarget({ kind: 'attack' }, 'enemy');
      else if (phase === 'menu' && k === 'spark') chooseTarget({ kind: 'spark' }, 'enemy');
      else if (phase === 'menu' && (k === 'skills' || k === 'items')) { phase = k; renderControls(); }
      else if (phase === 'skills' && k === 'skill') {
        const s = skillsAt(actor.id, actor.level).find((x) => x.id === id);
        if (s.target === 'one') chooseTarget({ kind: 'skill', skill: id }, 'enemy');
        else begin({ kind: 'skill', skill: id, target: s.target === 'all' ? E.living(b.enemies)[0].id : null });
      } else if (phase === 'items' && k === 'item') chooseTarget({ kind: 'item', item: id }, 'ally');
      return;
    }
    const foe = e.target.closest('[data-foe]');
    if (foe && phase === 'target' && E.find(b, foe.dataset.foe).hp > 0) return begin({ ...pending, target: foe.dataset.foe });
    const hero = e.target.closest('[data-hero]');
    if (hero && phase === 'ally') {
      const h = E.find(b, hero.dataset.hero);
      if (ITEMS[pending.item].revive ? h.hp <= 0 : h.hp > 0) begin({ ...pending, target: h.id });
    }
  });

  function key(e) {
    if (!b || paused || e.repeat) return false;
    const k = e.key.toLowerCase();
    if (phase === 'defend') {
      const kind = k === 'j' ? 'parry' : k === 'k' ? 'dodge' : k === 'l' || k === 'arrowup' ? 'jump' : null;
      if (kind) { press(kind); return true; }
    }
    if (k === ' ' && phase === 'attack') { tapAttack(); return true; }
    if (k === ' ' && phase === 'aim') { tapAim(); return true; }
    return false;
  }

  /* ---------- tutorial and life cycle ---------- */

  function tutorialNext() {
    const tips = t('battle.tutorial');
    const el = $('.b-over');
    tutorialPage++;
    if (tutorialPage >= tips.length) { el.hidden = true; paused = false; tutorialPage = -1; return; }
    el.hidden = false;
    el.innerHTML = `<div class="card"><p>${esc(tips[tutorialPage])}</p><button type="button" class="btn primary" data-u="tutorial">${esc(t(tutorialPage === tips.length - 1 ? 'battle.understood' : 'next'))}</button></div>`;
    el.querySelector('button').focus({ preventScroll: true });
  }

  return {
    start(battle, theNode, art, { tutorial = false, note = '' } = {}) {
      b = battle; node = theNode; clock = 0; waits = []; paused = false; actor = null; pending = null; move = null; aim = null; tutorialPage = -1;
      root.classList.remove('picking-foe', 'picking-ally');
      root.dataset.foes = String(b.enemies.length);
      build(art);
      phase = 'resolve';
      banner(note ? `${note} — ${theNode.name[L()]}` : theNode.name[L()]);
      wait(700, nextTurn);
      if (tutorial && !rules(b.difficulty).auto) { paused = true; tutorialNext(); }
    },
    tick, key,
    stop() { b = null; waits = []; phase = 'idle'; audio.stopCues(); },
    /** Pausing during an attack starts that rhythm again, so nothing is unfair. */
    pause(v) {
      if (!b || tutorialPage >= 0) return;
      if (v && !paused) { paused = true; audio.stopCues(); }
      else if (!v && paused) {
        paused = false;
        if (phase === 'defend') { const m = move; startDefence(enemy, m); }
        else if (phase === 'attack') { t0 = clock; taps = []; }
        else if (phase === 'aim') t0 = clock;
      }
    },
    redraw() { if (b) { refresh(); renderControls(); } },
    get battle() { return b; },
    get phase() { return phase; },
    get move() { return move; },
    get time() { return phase === 'idle' ? 0 : clock - t0; },
    /** Test hooks. */
    press,
    forceWin() {
      if (!b || phase === 'over') return;
      waits = []; showTapZone(false);
      for (const e of b.enemies) e.hp = 0;
      b.over = 'win';
      refresh(); finish('win');
    },
    forceLose() {
      if (!b || phase === 'over') return;
      waits = []; showTapZone(false);
      for (const h of b.heroes) h.hp = 0;
      b.over = 'lose';
      refresh(); finish('lose');
    },
    names: ENEMIES,
  };
}
