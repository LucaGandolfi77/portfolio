/* ============================================================
   Seba — boot, the screen, and everything that connects the
   pure state to rooms, games, voice and saving
   ============================================================ */
import { createI18n } from '../../_kit/i18n.js';
import { load, store } from '../../_kit/storage.js';
import { registerSW } from '../../_kit/pwa.js';
import { STRINGS } from './strings.js';
import { NEEDS, NEED_ICON, ITEMS, MIN_SLEEP_FOR_PLAY } from './rules.js';
import * as G from './state.js';
import { sebaSVG } from './seba/rig.js';
import { say } from './seba/lines.js';
import { createAudio } from './audio.js';
import { cityById } from './places/cities.js';
import { ROOMS, ROOM_ICON, sceneFor, actionsFor, trayFor, isAway } from './ui/rooms.js';
import { createSheet, button } from './ui/sheet.js';
import { openWorld } from './ui/world.js';
import { openJournal, storyText } from './ui/journal.js';
import { openWardrobe } from './ui/wardrobe.js';
import { checkAchievements } from './achievements.js';
import { MINIGAMES } from './games/index.js';
import { play, activeGame, el } from './games/shell.js';

const KEY = 'seba-v1';
const SETTINGS_KEY = 'seba-settings';
const $ = (s) => document.querySelector(s);

const i18n = createI18n(STRINGS, 'it');
const t = i18n.t;
const lang = () => i18n.getLang();
const audio = createAudio();
const settings = load(SETTINGS_KEY, {
  sound: true, music: true, big: false, numbers: false, adult: false,
  motion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false,
});

const raw = load(KEY, {});
const isNew = raw.v !== 1;
const state = G.hydrate(raw, Date.now());

let room = 'bar';
let busy = false;            // a game or a flight is on screen
let reaction = null;         // { expr, until }
let bubbleTimer = 0;
let lastSpoke = Date.now();
let sceneKey = '', faceKey = '', panelKey = '';
let quizSeq = 0;

const sheet = createSheet(document, () => t('act.close'));
const homeTrack = () => ({ kind: 'home', bpm: 84, root: 48 });
const save = () => store(KEY, state);
const saveSettings = () => store(SETTINGS_KEY, settings);

/* ---------------- Seba on stage ---------------- */

const face = () => (reaction && reaction.until > Date.now() ? reaction.expr : G.expression(state, Date.now()));

function drawSeba() {
  const expr = face();
  const key = `${expr}|${JSON.stringify(state.outfit)}`;
  if (key === faceKey) return;
  faceKey = key;
  $('#seba').innerHTML = sebaSVG({ expr, outfit: state.outfit, uid: 'main' });
  $('#seba').dataset.expr = expr;
}

function react(expr, ms = 1700) {
  if (state.asleep) return;
  reaction = { expr, until: Date.now() + ms };
  drawSeba();
  setTimeout(drawSeba, ms + 30);
}

function bubble(text, ms) {
  if (!text) return;
  const b = $('#bubble');
  b.textContent = text;
  b.hidden = false;
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => { b.hidden = true; }, ms || Math.max(2600, text.length * 62));
}

function speak(key, expr = null, text = null) {
  const line = text || say(lang(), key);
  if (expr) react(expr);
  bubble(line);
  const e = face();
  audio.mumble(line, e === 'drunk' ? 0.7 : e === 'hype' ? 1.35 : e === 'hangover' || e === 'sleepy' ? 0.8 : 1);
  lastSpoke = Date.now();
  return line;
}

const pending = [];
/** Medals and level-ups wait until the game on screen is over. */
function toast(text, cls = '') {
  if (busy) { pending.push([text, cls]); return; }
  const n = el('div', `toast ${cls}`, text);
  $('#toasts').appendChild(n);
  while ($('#toasts').children.length > 3) $('#toasts').firstChild.remove();
  setTimeout(() => n.remove(), 3200);
}

/* ---------------- the screen ---------------- */

function drawHud() {
  const { level, pct } = G.levelProgress(state.xp);
  $('#lvl').textContent = `${t('hud.level')} ${level}`;
  $('#xp i').style.width = `${Math.round(pct * 100)}%`;
  $('#tips').textContent = `${state.tips} €`;
  for (const n of NEEDS) {
    const m = document.querySelector(`.need[data-need="${n}"]`);
    const v = Math.round(state.needs[n]);
    m.querySelector('i').style.height = `${v}%`;
    m.querySelector('.num').textContent = v;
    m.classList.toggle('low', v < 25);
    m.setAttribute('aria-label', `${t(`need.${n}`)}: ${v}`);
  }
  const chips = [];
  if (state.drunk >= 5) chips.push(['drunk', '🥴', state.drunk]);
  if (state.hangover >= 5) chips.push(['hangover', '🤕', state.hangover]);
  if (state.liver < 60) chips.push(['liver', '🫀', state.liver]);
  if (state.lungs < 60) chips.push(['lungs', '🫁', state.lungs]);
  $('#chips').replaceChildren(...chips.map(([k, icon, v]) => { const c = el('span', `chip chip-${k}`, `${icon} ${t(`hud.${k}`)} ${Math.round(v)}`); c.dataset.k = k; return c; }));
  $('#app').classList.toggle('woozy', state.drunk >= 60 && !settings.motion);
}

function drawScene() {
  const key = `${room}|${state.city}|${state.asleep}|${state.trip?.stage}|${new Date().getHours()}`;
  if (key === sceneKey) return;
  sceneKey = key;
  $('#scene').innerHTML = sceneFor(room, state, Date.now());
}

function drawPanel(force = false) {
  const key = [room, state.city, state.asleep, state.trip?.stage, state.tips, lang(), state.passedOutUntil > Date.now()].join('|');
  if (!force && key === panelKey) return;
  panelKey = key;
  $('#actions').replaceChildren(...actionsFor(room, app));
  const tray = $('#tray');
  const scroll = tray.scrollLeft;
  tray.replaceChildren(...trayFor(room, app));
  tray.scrollLeft = scroll;
}

function drawNav() {
  const nav = $('#nav');
  nav.replaceChildren(...[...ROOMS, 'world', 'journal'].map((r) => {
    const away = r === 'bar' && isAway(state);
    const label = away ? cityById(state.city)[lang()].name : t(`room.${r}`);
    const b = button('', () => (r === 'world' ? openWorld(app) : r === 'journal' ? openJournal(app) : go(r)), 'nav-btn');
    b.dataset.room = r;
    if (r === room) b.setAttribute('aria-current', 'page');
    b.append(el('span', 'ico', away ? '📍' : ROOM_ICON[r]), el('span', '', label));
    return b;
  }));
}

function refresh(force = false) {
  if (force) { sceneKey = ''; faceKey = ''; }
  drawScene(); drawSeba(); drawHud(); drawPanel(force);
  $('#app').dataset.room = room;
  $('#app').classList.toggle('night', state.asleep);
}

function go(next) {
  if (!ROOMS.includes(next)) return;
  room = next;
  sheet.close();
  drawNav();
  refresh(true);
}

/* ---------------- consequences ---------------- */

function handle(events = []) {
  for (const e of events) {
    if (e.type === 'level') { toast(t('toast.level', { n: e.level }).replace('{b}', e.bonus), 'gold'); audio.sfx('level'); speak('level', 'hype'); }
    else if (e.type === 'newCity') toast(t('toast.newCity'), 'gold');
    else if (e.type === 'hangover') speak('hangoverHit');
    else if (e.type === 'dozed') speak('dozed');
    else if (e.type === 'revived') speak('revived');
    else if (e.type === 'passout') { speak('passout'); audio.sfx('snore'); }
    else if (e.type === 'cough') setTimeout(() => { audio.sfx('cough'); speak('cough', 'cough'); }, 900);
    else if (e.type === 'figuraccia') setTimeout(() => speak('figuraccia', 'drunk'), 1200);
    else if (e.type === 'emptyStomach') toast(say(lang(), 'emptyStomach'));
    else if (e.type === 'bucket') { audio.sfx('bucket'); speak('bucket', 'disgusted'); }
    else if (e.type === 'clean') speak('clean', 'hype');
  }
}

/** Call after any change: medals, screen, disk. */
function changed(events = []) {
  handle(events);
  for (const a of checkAchievements(state)) { toast(t('toast.medal', { m: `${a.icon} ${a.name[lang()]}` }), 'gold'); audio.sfx('good'); }
  refresh();
  drawSeba();
  save();
}

function refuse(reason) {
  audio.sfx('bad');
  const key = { broke: 'broke', full: 'full', tired: 'tired', stinky: 'stinky', thirsty: 'thirstyNo', asleep: 'asleep' }[reason];
  toast(t(`reason.${reason}`));
  if (key) speak(key);
}

function sync() {
  const r = G.tick(state, Date.now());
  handle(r.events);
}

/* ---------------- actions ---------------- */

function consume(id) {
  if (busy) return;
  sync();
  const r = G.consume(state, id, Date.now());
  if (!r.ok) { refuse(r.reason); return; }
  const it = G.itemFor(state, id);
  if (it.kind === 'smoke') {
    if (id === 'menta') { audio.sfx('munch'); speak('mint', 'disgusted'); }
    else { audio.sfx('lighter'); setTimeout(() => audio.sfx('puff'), 400); speak('smoked', 'puff'); }
  } else if (it.kind === 'drink') {
    audio.sfx('gulp');
    speak(id === 'acqua' ? 'acqua' : id === 'caffe' ? 'caffe' : 'drink', 'gulp');
  } else if (it.kind === 'food') { audio.sfx('munch'); speak('food', 'chew'); }
  else { audio.sfx('water'); speak('deo', 'happy'); }
  changed(r.events);
}

function toggleSleep() {
  sync();
  const sleeping = state.asleep;
  const r = G.setSleep(state, !sleeping, Date.now());
  if (!r.ok) return;
  reaction = null;
  if (!sleeping) { speak('sleep'); audio.sfx('snore'); }
  else if (!r.events.some((e) => e.type === 'bucket')) speak('wake', 'sleepy');
  changed(r.events);
}

function scrub(amount, quiet = false) {
  sync();
  const r = G.wash(state, amount, Date.now());
  if (!r.ok) { refuse(r.reason); return; }
  bubbles(quiet ? 2 : 9);
  if (!quiet) { audio.sfx('water'); speak('shower', 'chew'); } else react('chew', 600);
  changed(r.events);
}

function bubbles(n) {
  if (settings.motion) return;
  const box = $('#stage');
  const rect = $('#seba').getBoundingClientRect(), base = box.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const b = el('i', 'foam');
    b.style.left = `${rect.left - base.left + rect.width * (0.15 + Math.random() * 0.7)}px`;
    b.style.top = `${rect.top - base.top + rect.height * (0.2 + Math.random() * 0.65)}px`;
    b.style.width = b.style.height = `${10 + Math.random() * 26}px`;
    box.appendChild(b);
    setTimeout(() => b.remove(), 1300);
  }
}

function tellStory() {
  const st = state.stories.length ? state.stories[Math.floor(Math.random() * state.stories.length)] : null;
  speak('happy', 'hype', st ? storyText(st, lang(), t) : null);
}

/* ---------------- games ---------------- */

function release() {
  busy = false;
  pending.splice(0).slice(-3).forEach(([text, cls]) => toast(text, cls));
}

const gameContext = (cityId = state.city) => ({
  t, lang, audio, state, homeTrack,
  level: G.levelOf(state.xp),
  city: cityById(cityId),
  seba: (expr) => sebaSVG({ expr, outfit: state.outfit, uid: `g${++quizSeq}`, fx: false }),
});

/** Runs one minigame and books its result. Returns { perf, tips, xp } or null. */
async function runGame(id) {
  audio.unlock();
  const result = await play($('#games'), MINIGAMES[id], gameContext());
  if (!result) return null;
  sync();
  const r = G.applyGame(state, id, result.perf, { flawless: result.flawless, now: Date.now() });
  changed(r.events);
  return { ...result, tips: r.tips, xp: r.xp };
}

function showResult(icon, perf, tips, xp, flawless, done) {
  audio.sfx(perf >= 0.5 ? 'coin' : 'bad');
  sheet.open('result', t('result.title'), (body) => {
    const stars = perf >= 0.85 ? 3 : perf >= 0.55 ? 2 : perf >= 0.2 ? 1 : 0;
    body.append(el('p', 'result-icon', icon), el('p', 'stars', '★'.repeat(stars) + '☆'.repeat(3 - stars)));
    if (flawless) body.appendChild(el('p', 'flawless', t('result.flawless')));
    body.append(el('p', 'result-tips', t('result.tips', { n: tips })), el('p', 'result-xp', t('result.xp', { n: xp })));
    const ok = button(t('act.ok'), () => sheet.close(), 'btn primary');
    ok.dataset.act = 'ok';
    body.appendChild(ok);
  }, done);
}

async function game(id) {
  if (busy) return;
  sync();
  const can = G.canPlay(state, id, Date.now());
  if (!can.ok) { refuse(can.reason); return; }
  busy = true;
  sheet.close();
  const r = await runGame(id);
  release();
  if (!r) return;
  const good = r.perf >= 0.55;
  showResult(MINIGAMES[id] && { shift: '🍸', dj: '🎛️', dance: '🕺', lighter: '🔥', runner: '🌅', quiz: '🙈' }[id], r.perf, r.tips, r.xp, r.flawless, () => {
    speak(id === 'shift' ? (good ? 'shiftGood' : 'shiftBad') : good ? 'gameGood' : 'gameBad', good ? 'hype' : 'bored');
  });
}

/** Two games in a row, then the night is paid and remembered. */
async function night(kind) {
  if (busy) return;
  sync();
  const can = kind === 'rave' ? G.canRave(state, Date.now()) : { ok: !state.asleep, reason: 'asleep' };
  if (!can.ok) { refuse(can.reason); return; }
  if (kind === 'after' && state.trip?.stage !== 'raved') return;
  busy = true;
  sheet.close();
  speak(kind === 'rave' ? 'raveStart' : 'after', kind === 'rave' ? 'hype' : 'after');
  const where = state.city;
  const results = [];
  for (const id of kind === 'rave' ? ['dj', 'dance'] : ['quiz', 'runner']) {
    const r = await runGame(id);
    if (!r) break;
    results.push(r);
  }
  if (results.length < 2) { release(); return; }   // leaving halfway keeps what was earned, not the night
  const perf = (results[0].perf + results[1].perf) / 2;
  const now = Date.now();
  const r = kind === 'rave' ? G.applyRave(state, perf, now) : G.applyAfter(state, perf, now);
  release();
  if (!r.ok) return;
  const line = say(lang(), kind === 'rave' ? 'raveEnd' : 'after');
  G.addPostcard(state, { t: now, kind, city: where, outfit: { ...state.outfit }, expr: kind === 'rave' ? 'hype' : 'after', line });
  changed(r.events);
  const tips = r.tips + results[0].tips + results[1].tips, xp = r.xp + results[0].xp + results[1].xp;
  showResult(kind === 'rave' ? '🪩' : '🌤️', perf, tips, xp, results.every((x) => x.flawless), () => bubble(line));
}

/* ---------------- travel ---------------- */

function fly(cityId) {
  sync();
  const r = G.fly(state, cityId, Date.now());
  if (!r.ok) { refuse(r.reason); return; }
  sheet.close();
  audio.sfx('plane');
  const plane = $('#flight');
  const arrive = () => {
    plane.hidden = true;
    room = 'bar';
    drawNav(); refresh(true);
    if (cityId === 'milano') speak('home', 'happy');
    else speak('flight', 'hype', cityById(cityId)[lang()].hello);
    music();
  };
  if (settings.motion) arrive();
  else { plane.querySelector('b').textContent = cityById(cityId)[lang()].name; plane.hidden = false; setTimeout(arrive, 1500); }
  changed(r.events);
}

/* ---------------- panels ---------------- */

function applySettings() {
  audio.setSound(settings.sound);
  audio.setMusic(settings.music);
  const c = document.documentElement.classList;
  c.toggle('calm', settings.motion);
  c.toggle('big', settings.big);
  c.toggle('numbers', settings.numbers);
}

function openSettings() {
  sheet.open('settings', t('settings.title'), (body) => {
    const stats = el('p', 'vitals', `🫀 ${t('hud.liver')} ${Math.round(state.liver)} · 🫁 ${t('hud.lungs')} ${Math.round(state.lungs)}`);
    body.appendChild(stats);
    const langRow = el('div', 'setting');
    langRow.appendChild(el('span', '', t('settings.lang')));
    for (const code of ['it', 'en']) {
      const b = button(code.toUpperCase(), () => { i18n.setLang(code); relabel(); openSettings(); }, 'btn small');
      b.dataset.lang = code;
      b.setAttribute('aria-pressed', lang() === code);
      langRow.appendChild(b);
    }
    body.appendChild(langRow);
    for (const key of ['sound', 'music', 'motion', 'big', 'numbers']) {
      const row = el('label', 'setting');
      const box = el('input'); box.type = 'checkbox'; box.checked = settings[key]; box.dataset.setting = key;
      box.addEventListener('change', () => { settings[key] = box.checked; saveSettings(); applySettings(); });
      row.append(el('span', '', t(`settings.${key}`)), box);
      body.appendChild(row);
    }
    let armed = false;
    const reset = button(t('settings.reset'), () => {
      if (!armed) { armed = true; reset.textContent = t('settings.confirm'); return; }
      Object.assign(state, G.newState(Date.now()));
      save(); sheet.close(); room = 'bar'; drawNav(); refresh(true); speak('greet', 'hype');
    }, 'btn danger');
    reset.dataset.act = 'reset';
    body.append(reset, el('p', 'about', t('settings.about')));
  });
}

function awayReport(r) {
  const minutes = Math.round(r.awayMs / 60000);
  sheet.open('away', t('away.title'), (body) => {
    body.appendChild(el('p', '', minutes >= 90 ? t('away.hours', { n: Math.round(minutes / 60) }) : t('away.minutes', { n: minutes })));
    const ul = el('ul', 'away-needs');
    for (const n of NEEDS) {
      const a = Math.round(r.before[n]), b = Math.round(r.after[n]);
      if (a === b) continue;
      ul.appendChild(el('li', b < a ? 'down' : 'up', `${NEED_ICON[n]} ${t(`need.${n}`)}  ${a} → ${b}`));
    }
    body.appendChild(ul);
    const extra = [];
    if (r.events.some((e) => e.type === 'dozed')) extra.push(t('away.dozed'));
    if (r.events.some((e) => e.type === 'hangover')) extra.push(t('away.hangover'));
    for (const x of extra) body.appendChild(el('p', 'warn', x));
    body.append(el('p', 'alone', t('away.alone')), el('p', 'alone-line', say(lang(), 'away')));
    const ok = button(t('act.ok'), () => sheet.close(), 'btn primary');
    ok.dataset.act = 'ok';
    body.appendChild(ok);
  }, () => speak('greet', null));
}

function adultGate(then) {
  const gate = $('#gate');
  gate.hidden = false;
  const draw = (blocked) => {
    const box = gate.querySelector('div');
    box.replaceChildren();
    const art = el('figure'); art.innerHTML = sebaSVG({ expr: blocked ? 'bored' : 'hype', uid: 'gate', outfit: state.outfit });
    box.append(art, el('h1', '', blocked ? t('title') : t('adult.title')), el('p', '', blocked ? t('adult.blocked') : t('adult.body')));
    if (blocked) return;
    const yes = button(t('adult.yes'), () => { settings.adult = true; saveSettings(); gate.hidden = true; audio.unlock(); then(); }, 'btn primary');
    yes.id = 'gate-yes';
    const no = button(t('adult.no'), () => draw(true), 'btn');
    no.id = 'gate-no';
    const swap = button(lang() === 'it' ? 'English' : 'Italiano', () => { i18n.setLang(lang() === 'it' ? 'en' : 'it'); relabel(); draw(false); }, 'btn small');
    box.append(yes, no, swap);
  };
  draw(false);
}

/* ---------------- wiring ---------------- */

function overSeba(x, y) {
  const r = $('#seba').getBoundingClientRect();
  return x >= r.left - 20 && x <= r.right + 20 && y >= r.top - 30 && y <= r.bottom + 20;
}

const app = {
  state, t, lang, audio, sheet, toast, speak, changed, go,
  consume, toggleSleep, scrub, tellStory, overSeba, game, fly,
  rave: () => night('rave'),
  after: () => night('after'),
  flyHome: () => fly('milano'),
  wardrobe: () => openWardrobe(app, () => refresh(true)),
};

function relabel() {
  document.documentElement.lang = lang();
  for (const n of NEEDS) document.querySelector(`.need[data-need="${n}"] .label`).textContent = t(`need.${n}`);
  $('#btn-settings').setAttribute('aria-label', t('settings.title'));
  $('#sign').textContent = t('sign');
  drawNav();
  refresh(true);
}

function music() { audio.music(homeTrack()); }

function buildHud() {
  $('#needs').replaceChildren(...NEEDS.map((n) => {
    const b = button('', () => toast(`${NEED_ICON[n]} ${t(`need.${n}`)}: ${Math.round(state.needs[n])}/100`), 'need');
    b.dataset.need = n;
    const ring = el('span', 'ring'); ring.append(el('i'), el('span', 'ico', NEED_ICON[n]));
    b.append(ring, el('span', 'label'), el('span', 'num'));
    return b;
  }));
}

function wireSeba() {
  const seba = $('#seba');
  let scrubbing = false, scrubbed = false, travelled = 0, last = null;
  seba.addEventListener('pointerdown', (e) => { if (room === 'bath') { scrubbing = true; travelled = 0; last = [e.clientX, e.clientY]; seba.setPointerCapture?.(e.pointerId); } });
  seba.addEventListener('pointermove', (e) => {
    if (!scrubbing) return;
    travelled += Math.hypot(e.clientX - last[0], e.clientY - last[1]);
    last = [e.clientX, e.clientY];
    if (travelled > 90) { travelled = 0; scrubbed = true; scrub(5, true); audio.sfx('water'); }
  });
  const end = () => { scrubbing = false; };
  seba.addEventListener('pointerup', end);
  seba.addEventListener('pointercancel', end);
  seba.addEventListener('click', () => {
    if (scrubbed) { scrubbed = false; return; }
    audio.unlock(); music();
    if (state.asleep) { bubble(say(lang(), 'asleep')); audio.sfx('snore'); return; }
    const r = G.pet(state);
    if (!r.ok) return;
    if (r.count % 5 === 0) speak('love', 'love');
    else speak('poke', 'hype');
    changed();
  });
}

function idle() {
  if (busy || sheet.kind || state.asleep || document.hidden || !$('#gate').hidden) return;
  if (Date.now() - lastSpoke < 13000) return;
  const need = G.loudestNeed(state);
  const e = G.expression(state, Date.now());
  const byNeed = { thirst: 'thirsty', smoke: 'smoke', food: 'hungry', sleep: 'sleepy', fun: 'bored', hygiene: 'dirty' };
  const byFace = { drunk: 'drunk', hangover: 'hangover', tipsy: 'tipsy', cough: 'cough', after: 'after', hype: 'hype' };
  const key = e === 'drunk' || e === 'hangover' ? byFace[e] : need ? byNeed[need] : byFace[e] || 'happy';
  speak(key);
}

function boot() {
  buildHud();
  applySettings();
  wireSeba();
  $('#btn-settings').addEventListener('click', openSettings);
  relabel();

  const report = G.catchUp(state, Date.now());
  refresh(true);
  save();
  const welcome = () => {
    if (!isNew && report.awayMs > 10 * 60 * 1000) awayReport(report);
    else speak('greet', 'hype');
    changed(isNew ? [] : report.events.filter((e) => e.type === 'revived'));
  };
  if (settings.adult) welcome(); else adultGate(welcome);

  window.addEventListener('pointerdown', () => { audio.unlock(); music(); }, { once: true });
  setInterval(() => { if (!document.hidden && !busy) { sync(); refresh(); } }, 5000);
  setInterval(idle, 4000);
  setInterval(save, 30000);

  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); sync(); save(); audio.pause(); return; }
    audio.resume();
    if (busy) { state.last = Date.now(); return; }
    const r = G.catchUp(state, Date.now());
    refresh(true);
    if (hiddenAt && Date.now() - hiddenAt > 10 * 60 * 1000 && settings.adult) awayReport(r);
    else handle(r.events);
    save();
  });
  window.addEventListener('pagehide', save);
  i18n.onChange(relabel);
  window.addEventListener('storage', (e) => { if (e.key === 'lang') i18n.sync(); });

  registerSW('./sw.js');

  window.__seba = {
    state, settings, app,
    save,
    refresh: () => { refresh(true); drawNav(); },
    go,
    /** Pretends `ms` milliseconds have passed. */
    advance(ms) { state.last -= ms; if (state.passedOutUntil) state.passedOutUntil -= ms; sync(); changed(); },
    set(patch) { for (const [k, v] of Object.entries(patch)) { if (v && typeof v === 'object' && !Array.isArray(v) && state[k]) Object.assign(state[k], v); else state[k] = v; } G.clampState(state); drawNav(); refresh(true); },
    game: () => activeGame(),
    items: ITEMS,
    minSleep: MIN_SLEEP_FOR_PLAY,
  };
  document.documentElement.dataset.ready = '1';
}

boot();
