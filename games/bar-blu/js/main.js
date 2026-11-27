/* ============================================================
   BAR BLU — sette notti in via Padova
   ------------------------------------------------------------
   Architecture:
     story/*.js   the script, as plain text (one file per night)
     engine/      parser + runner: pure, tested with Node
     ui/stage     Blender backgrounds, silhouettes, weather
     ui/…         dialogue box, the two small games, the journal
     main.js      wires the runner's events to the UI, saves at
                  every scene, keeps settings
   ============================================================ */
import { parseScript } from './engine/script.js';
import { Runner, newStoryState } from './engine/runner.js';
import { SOURCES, START } from './story/index.js';
import { CAST } from './cast.js';
import { createStage } from './ui/stage.js';
import { rush, saletta } from './ui/minigames.js';
import { renderJournal, ENDINGS } from './ui/journal.js';
import * as audio from './audio.js';

const $ = (sel, root = document) => root.querySelector(sel);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const SAVE_KEY = 'bar-blu-v2';
const SPEEDS = { lento: 26, normale: 48, veloce: 110, subito: 0 };

/* ---------------- saved data ---------------- */

function freshSave() {
  return {
    story: null, stage: null, music: null, night: '', usedRegulars: [],
    memories: {}, met: [], postcards: [], endings: [],
    settings: { speed: 'normale', music: 0.55, sfx: 0.8, reduced: false },
  };
}
function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (raw && typeof raw === 'object') {
      const base = freshSave();
      return { ...base, ...raw, settings: { ...base.settings, ...(raw.settings || {}) } };
    }
  } catch (e) { /* corrupt: start over */ }
  return freshSave();
}
const save = loadSave();
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* quota */ } };

/* ---------------- story ---------------- */

const script = parseScript(SOURCES);
let runner = null;
let currentMusic = null;

/* ---------------- DOM ---------------- */

const app = $('#app');
const stage = createStage($('#stage'));
const ui = {
  home: $('#home'), btnNew: $('#btn-new'), btnContinue: $('#btn-continue'), btnJournalHome: $('#btn-journal-home'), btnSettingsHome: $('#btn-settings-home'),
  top: $('#topbar'), night: $('#tb-night'), money: $('#tb-money'), btnJournal: $('#btn-journal'), btnMenu: $('#btn-menu'),
  box: $('#box'), speaker: $('#box .speaker'), text: $('#box .text'), choices: $('#box .choices'), more: $('#box .more'),
  title: $('#title-card'), journal: $('#journal'), menu: $('#menu'), settings: $('#settings'),
  name: $('#name-input'), credits: $('#credits'), end: $('#end'), toast: $('#toast'), sal: $('#saletta'),
};

function toast(text, kind = '') {
  const t = document.createElement('div');
  t.className = 'toast-item ' + kind;
  t.textContent = text;
  ui.toast.appendChild(t);
  setTimeout(() => t.classList.add('gone'), 3200);
  setTimeout(() => t.remove(), 3800);
}

function updateTop() {
  const v = runner ? runner.state.vars : {};
  ui.money.textContent = `${Math.max(0, Math.round((v.mance || 0) * 100) / 100)} €`;
  ui.night.textContent = save.night || '';
}

/* ---------------- dialogue box ---------------- */

let advance = null;          // resolves the current line on tap
let typing = null;           // { finish() } while text is being typed

function speakerOf(who) {
  const c = CAST[who];
  if (c) return { name: c.name, color: c.color, voice: c.voice };
  const name = who.replace(/(^|\s)\S/g, (s) => s.toUpperCase());
  return { name, color: '#c9d2e3', voice: 230 };
}

function typeText(el, text, voice) {
  const cps = SPEEDS[save.settings.speed] ?? 48;
  el.textContent = '';
  if (!cps || save.settings.reduced) { el.textContent = text; return Promise.resolve(); }
  return new Promise((resolve) => {
    let i = 0;
    let timer = null;
    const finish = () => { clearInterval(timer); el.textContent = text; typing = null; resolve(); };
    typing = { finish };
    timer = setInterval(() => {
      i += 1;
      el.textContent = text.slice(0, i);
      if (voice && i % 3 === 0 && /\w/.test(text[i - 1] || '')) audio.blip(voice);
      if (i >= text.length) finish();
    }, 1000 / cps);
  });
}

const box = {
  async say({ who, color, text, kind = 'say', voice }) {
    ui.choices.innerHTML = '';
    ui.box.dataset.kind = kind;
    if (kind === 'narr') { ui.speaker.textContent = ''; ui.speaker.hidden = true; }
    else { ui.speaker.hidden = false; ui.speaker.textContent = who; ui.speaker.style.color = color; }
    ui.box.style.setProperty('--rim', color || 'rgba(255,255,255,.2)');
    ui.more.hidden = true;
    await typeText(ui.text, text, voice);
    ui.more.hidden = false;
    await new Promise((r) => { advance = r; });
    advance = null;
  },
  async choose(options, drink) {
    ui.more.hidden = true;
    ui.choices.innerHTML = '';
    ui.choices.className = 'choices' + (drink ? ' drinks' : '');
    return new Promise((resolve) => {
      options.forEach((o, n) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'choice' + (o.kind === 'once' ? ' once' : '');
        b.textContent = o.text;
        b.dataset.n = n + 1;
        b.addEventListener('click', (ev) => {
          ev.stopPropagation();
          audio.sfx('pagina');
          ui.choices.innerHTML = '';
          resolve(o.index ?? o.key);
        });
        ui.choices.appendChild(b);
      });
      ui.choices.querySelector('button')?.focus({ preventScroll: true });
    });
  },
  async ask({ who, color, text, drinks }) {
    ui.speaker.hidden = false;
    ui.speaker.textContent = who;
    ui.speaker.style.color = color;
    ui.box.dataset.kind = 'say';
    await typeText(ui.text, text, 230);
    return this.choose(drinks.map((d) => ({ text: d.label, key: d.key })), true);
  },
};

function tapAdvance() {
  if (typing) { typing.finish(); return; }
  if (advance) { audio.sfx('pagina'); advance(); }
}

/* ---------------- commands ---------------- */

async function command(name, args) {
  switch (name) {
    case 'bg': stage.setBackground(args[0]); break;
    case 'fx': stage.setFx(args[0]); break;
    case 'music': currentMusic = args[0]; audio.music(args[0]); break;
    case 'sfx': audio.sfx(args[0]); break;
    case 'show': stage.show(args[0], args[1] || 'center'); meet(args[0]); break;
    case 'hide': stage.hide(args[0] || 'all'); break;
    case 'wait': await wait(Number(args[0]) || 600); break;
    case 'title': await titleCard(args[0], args[1]); break;
    case 'rush': {
      const used = new Set(save.usedRegulars);
      await rush({ count: Number(args[0]) || 2, stage, box: rushBox, vars: runner.state.vars, sfx: audio.sfx, used });
      save.usedRegulars = [...used].slice(-8);
      break;
    }
    case 'saletta': {
      const back = currentMusic;
      await saletta({
        root: document, vars: runner.state.vars, sfx: audio.sfx, music: audio.music, onChange: updateTop,
        onLine: (n) => {
          const v = ui.sal.querySelector('.sal-voice');
          v.textContent = n >= 30 ? 'Luca, dalla tenda: «Blu. Basta. Ti prego.»' : 'Luca, dalla tenda: «Blu. Anche mio padre diceva "ancora uno".»';
          v.classList.add('luca');
          setTimeout(() => v.classList.remove('luca'), 4000);
        },
      });
      if (back) audio.music(back);
      break;
    }
    case 'postcard': {
      const card = { id: args[0], caption: args[1] || '', bg: stage.bg, actors: stage.actorIds().filter((i) => i !== '_guest'), night: (save.night || '').split('·')[0].trim() };
      save.postcards = save.postcards.filter((c) => c.id !== card.id).concat(card);
      persist();
      toast(`✎ Anna ha disegnato: «${card.caption}»`, 'card');
      break;
    }
    case 'memory': {
      const [who, text] = args;
      const list = save.memories[who] || (save.memories[who] = []);
      if (!list.includes(text)) list.push(text);
      meet(who);
      persist();
      toast(`◆ Ricordo · ${speakerOf(who).name}`, 'memory');
      break;
    }
    case 'input': runner.state.vars[args[0]] = await askName(); break;
    case 'credits': await credits(); break;
    default: console.warn('unknown command', name, args);
  }
}

const rushBox = {
  ask: (o) => box.ask(o),
  say: (o) => box.say({ ...o, voice: 230 }),
};

function meet(id) {
  if (CAST[id] && !save.met.includes(id)) save.met.push(id);
}

function titleCard(a, b) {
  save.night = a;
  updateTop();
  ui.title.querySelector('.tc-a').textContent = a;
  ui.title.querySelector('.tc-b').textContent = b || '';
  ui.title.classList.remove('hidden');
  return new Promise((resolve) => {
    let done = false;
    const end = () => { if (done) return; done = true; ui.title.classList.add('hidden'); ui.title.onclick = null; resolve(); };
    ui.title.onclick = end;
    setTimeout(end, save.settings.reduced ? 1600 : 3200);
  });
}

function askName() {
  ui.name.classList.remove('hidden');
  const input = ui.name.querySelector('input');
  input.value = '';
  setTimeout(() => input.focus(), 50);
  return new Promise((resolve) => {
    const ok = () => {
      const v = input.value.trim().replace(/[<>{}]/g, '').slice(0, 24) || 'Blu';
      ui.name.classList.add('hidden');
      ui.name.querySelector('form').onsubmit = null;
      resolve(v);
    };
    ui.name.querySelector('form').onsubmit = (e) => { e.preventDefault(); ok(); };
  });
}

function credits() {
  ui.credits.classList.remove('hidden');
  return new Promise((resolve) => {
    ui.credits.querySelector('.cr-close').onclick = () => { ui.credits.classList.add('hidden'); resolve(); };
  });
}

/* ---------------- the loop ---------------- */

let playing = false;

async function play() {
  if (playing) return;
  playing = true;
  for (;;) {
    const e = runner.next();
    updateTop();
    if (e.t === 'say' || e.t === 'narr') {
      if (e.t === 'say') { meet(e.who); stage.speaking(e.who); }
      else stage.speaking(null);
      const sp = e.t === 'say' ? speakerOf(e.who) : null;
      const kind = e.t === 'narr' ? 'narr' : e.who === 'macchina' ? 'machine' : e.who === 'tu' ? 'tu' : 'say';
      await box.say({ who: sp ? sp.name + (e.dir ? ` (${e.dir})` : '') : '', color: sp?.color, text: e.text, kind, voice: sp?.voice });
    } else if (e.t === 'choices') {
      stage.speaking(null);
      const i = await box.choose(e.options, e.drink);
      runner.choose(i);
      if (e.drink) audio.sfx('tazzina');
    } else if (e.t === 'cmd') {
      await command(e.name, e.args);
    } else if (e.t === 'end') {
      playing = false;
      await ending(e);
      return;
    }
  }
}

function onKnot(name) {
  save.story = JSON.parse(JSON.stringify(runner.state));
  save.stage = stage.snapshot();
  save.music = currentMusic;
  persist();
  window.__barblu.knot = name;
}

function newRunner(state) {
  runner = new Runner(script, state || newStoryState());
  runner.onKnot = onKnot;
  return runner;
}

function startNew() {
  save.story = null;
  save.night = '';
  save.usedRegulars = [];
  persist();
  newRunner();
  enterGame();
  runner.goto(START);
  play();
}

function continueGame() {
  if (!save.story || !script.knots[save.story.knot]) return startNew();
  newRunner(save.story);
  runner.stack = [{ nodes: script.knots[save.story.knot], i: 0 }];
  window.__barblu.knot = save.story.knot;
  enterGame();
  if (save.stage) stage.restore(save.stage);
  if (save.music) { currentMusic = save.music; audio.music(save.music); }
  play();
}

function enterGame() {
  audio.unlock();
  ui.home.classList.add('hidden');
  ui.end.classList.add('hidden');
  app.classList.add('in-game');
  updateTop();
}

async function ending(e) {
  const fin = runner.state.vars.finale || (e.reason === 'luce' ? 'luce' : 'ronzio');
  if (!save.endings.includes(fin)) save.endings.push(fin);
  save.story = null;
  persist();
  const v = runner.state.vars;
  const info = ENDINGS[fin] || ENDINGS.ronzio;
  ui.end.querySelector('.end-title').textContent = info.title;
  ui.end.querySelector('.end-text').textContent = info.text;
  const stats = [
    ['Caffè sospesi', v.sospesi || 0],
    ['Giri alle macchinette', v.spins || 0],
    ['Ugo', v.ugo_salvo ? 'è vivo' : 'non c’è più'],
    ['Gigi', v.gigi_salvo ? 'era alla laurea' : 'è andato via'],
    ['Finali trovati', `${save.endings.length} / 4`],
  ];
  const ul = ui.end.querySelector('.end-stats');
  ul.innerHTML = '';
  for (const [k, val] of stats) {
    const li = document.createElement('li');
    li.innerHTML = '<span></span><b></b>';
    li.firstChild.textContent = k;
    li.lastChild.textContent = val;
    ul.appendChild(li);
  }
  ui.end.classList.remove('hidden');
  window.__barblu.ended = fin;
}

function goHome() {
  app.classList.remove('in-game');
  stage.hide('all');
  stage.setBackground('esterno-notte');
  stage.setFx('pioggia');
  audio.music('pioggia');
  currentMusic = 'pioggia';
  for (const el of [ui.menu, ui.end, ui.journal, ui.settings]) el.classList.add('hidden');
  ui.home.classList.remove('hidden');
  ui.btnContinue.hidden = !save.story;
  ui.btnContinue.textContent = save.night ? `Continua · ${save.night.split('·')[0].trim()}` : 'Continua';
}

/* ---------------- journal, menu, settings ---------------- */

function openJournal(tab = 'persone') {
  renderJournal(ui.journal, save, tab);
  ui.journal.classList.remove('hidden');
}

function openSettings() {
  const s = save.settings;
  const f = ui.settings;
  f.querySelectorAll('[data-speed]').forEach((b) => b.classList.toggle('active', b.dataset.speed === s.speed));
  f.querySelector('#set-music').value = Math.round(s.music * 100);
  f.querySelector('#set-sfx').value = Math.round(s.sfx * 100);
  f.querySelector('#set-reduced').checked = !!s.reduced;
  f.classList.remove('hidden');
}

function applySettings() {
  audio.setVolumes(save.settings.music, save.settings.sfx);
  stage.reduced = !!save.settings.reduced;
  document.documentElement.dataset.reduced = save.settings.reduced ? '1' : '0';
}

function bind() {
  ui.btnNew.addEventListener('click', () => {
    if (save.story && !confirm('Ricominciare dalla prima notte? Il salvataggio attuale andrà perso (diario e cartoline restano).')) return;
    startNew();
  });
  ui.btnContinue.addEventListener('click', continueGame);
  ui.btnJournalHome.addEventListener('click', () => openJournal());
  ui.btnSettingsHome.addEventListener('click', openSettings);
  ui.btnJournal.addEventListener('click', () => openJournal());
  ui.btnMenu.addEventListener('click', () => ui.menu.classList.remove('hidden'));
  ui.menu.querySelector('.mn-resume').addEventListener('click', () => ui.menu.classList.add('hidden'));
  ui.menu.querySelector('.mn-journal').addEventListener('click', () => { ui.menu.classList.add('hidden'); openJournal(); });
  ui.menu.querySelector('.mn-settings').addEventListener('click', () => { ui.menu.classList.add('hidden'); openSettings(); });
  ui.menu.querySelector('.mn-home').addEventListener('click', () => { playing = false; advance = null; location.reload(); });
  ui.journal.querySelectorAll('.jr-tab').forEach((b) => b.addEventListener('click', () => { audio.sfx('pagina'); renderJournal(ui.journal, save, b.dataset.tab); }));
  ui.journal.querySelector('.jr-done').addEventListener('click', () => ui.journal.classList.add('hidden'));
  ui.settings.querySelectorAll('[data-speed]').forEach((b) => b.addEventListener('click', () => { save.settings.speed = b.dataset.speed; persist(); openSettings(); }));
  ui.settings.querySelector('#set-music').addEventListener('input', (e) => { save.settings.music = e.target.value / 100; applySettings(); persist(); });
  ui.settings.querySelector('#set-sfx').addEventListener('input', (e) => { save.settings.sfx = e.target.value / 100; applySettings(); persist(); });
  ui.settings.querySelector('#set-reduced').addEventListener('change', (e) => { save.settings.reduced = e.target.checked; applySettings(); persist(); });
  ui.settings.querySelector('.st-done').addEventListener('click', () => ui.settings.classList.add('hidden'));
  ui.end.querySelector('.end-journal').addEventListener('click', () => openJournal('finali'));
  ui.end.querySelector('.end-home').addEventListener('click', goHome);

  ui.box.addEventListener('click', tapAdvance);
  $('#stage').addEventListener('click', () => { if (app.classList.contains('in-game')) tapAdvance(); });
  window.addEventListener('keydown', (e) => {
    if (!app.classList.contains('in-game') || e.target.tagName === 'INPUT') return;
    if (e.key === ' ' || e.key === 'Enter') {
      if (ui.choices.children.length) return;
      e.preventDefault();
      tapAdvance();
    } else if (/^[1-9]$/.test(e.key)) {
      ui.choices.querySelector(`[data-n="${e.key}"]`)?.click();
    } else if (e.key === 'Escape') {
      ui.menu.classList.toggle('hidden');
    }
  });
  document.addEventListener('pointerdown', () => audio.unlock(), { once: true, capture: true });
  window.addEventListener('resize', stage.resize);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  stage.frame(dt);
  requestAnimationFrame(loop);
}

/* Test hooks (Playwright, node walkers). */
window.__barblu = {
  knot: null, ended: null,
  get vars() { return runner?.state.vars; },
  get trust() { return runner?.state.trust; },
  save: () => save,
  setSpeed(s) { save.settings.speed = s; },
};

function boot() {
  applySettings();
  bind();
  stage.resize();
  goHome();
  requestAnimationFrame(loop);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  document.documentElement.dataset.ready = '1';
}

boot();
