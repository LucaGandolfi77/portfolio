/* ============================================================
   Shake Me — boot, screens, sessions, saving
   ============================================================ */
import { createI18n } from '../../_kit/i18n.js';
import { load, store } from '../../_kit/storage.js';
import { registerSW } from '../../_kit/pwa.js';
import { dailySeed } from '../../_kit/core.js';
import { STRINGS } from './strings.js';
import * as S from './state.js';
import * as V from './service.js';
import { RECIPE } from './data/recipes.js';
import { BY_ID } from './data/ingredients.js';
import { GARNISH } from './data/bar.js';
import { judge } from './judge.js';
import { verdictLine, customerLine, LINES } from './lines.js';
import { createAudio } from './audio.js';
import { createBar } from './barscreen.js';
import { perfectPlay, play } from './steps.js';
import * as W from './workbench.js';
import * as UI from './ui.js';

const $ = (s) => document.querySelector(s);
const i18n = createI18n(STRINGS, 'it');
const t = i18n.t;
const lang = () => i18n.getLang();

const settings = load(S.SETTINGS_KEY, {
  adult: false, sound: true, music: true, sensor: true, bigtext: false,
  motion: matchMedia('(prefers-reduced-motion: reduce)').matches,
});
let state = S.hydrate(load(S.SAVE_KEY, null));
const save = () => store(S.SAVE_KEY, state);
const saveSettings = () => store(S.SETTINGS_KEY, settings);

const audio = createAudio();
audio.setSound(settings.sound);
audio.setMusic(settings.music);

const panel = $('#screen');
const sheet = $('#sheet');
let screen = 'home';
let session = null;
let filter = 'all', query = '', asking = false, declined = false, settingsBack = 'home';

const bar = createBar($('#bar'), {
  t, lang, audio, settings: () => settings,
  onServe: serve,
  onQuit: () => { bar.stop(); quitSession(); },
});

/* ---------- names for Tobia's sentences ---------- */

const ACTION_NAME = {
  it: { shake: 'shakerare', stir: 'mescolare', blend: 'frullare', swizzle: 'lo swizzle' },
  en: { shake: 'shake', stir: 'stir', blend: 'blend', swizzle: 'swizzle' },
};
const names = () => ({
  ing: (id) => (id && BY_ID[id] ? BY_ID[id].name[lang()].toLowerCase() : ''),
  dose: (n, unit) => (n === undefined ? '' : unit === 'ml' ? `${n} ml` : `${n} ${t(`units.${unit}`) || unit}`),
  thing: (v, key) => {
    if (v === undefined || v === null) return '—';
    if (key === 'glass') return UI.glassName(v, lang()).toLowerCase();
    if (key === 'tool') return t(`tools.${v}`).toLowerCase();
    if (key === 'ice') return t(`ice.${v}`).toLowerCase();
    return String(v);
  },
  action: (a) => (a ? ACTION_NAME[lang()][a] : ''),
  garnish: (g) => (g && GARNISH[g] ? GARNISH[g][lang()].toLowerCase() : ''),
  rim: (r) => (r ? t(`rim.${r}`).toLowerCase() : ''),
});

/* ---------- screens ---------- */

function show(name, html) {
  screen = name;
  panel.innerHTML = html;
  panel.hidden = false;
  panel.dataset.kind = name;
  panel.scrollTop = 0;
  $('#bar').hidden = true;
  sheet.hidden = true;
}

function showSheet(name, html) {
  sheet.innerHTML = html;
  sheet.hidden = false;
  sheet.dataset.kind = name;
  sheet.scrollTop = 0;
  sheet.querySelector('.btn.primary, .btn')?.focus({ preventScroll: true });
}

const nextNight = () => { let n = 0; while (n + 1 < V.NIGHTS && (state.nights[n] || 0) > 0) n++; return n; };

function goHome() {
  session = null;
  bar.stop();
  if (!settings.adult) return show('gate', UI.gate(t, declined));
  show('home', UI.home(t, state, nextNight()));
}

function refresh() {
  document.documentElement.lang = lang();
  document.body.classList.toggle('bigtext', !!settings.bigtext);
  document.body.classList.toggle('calm', !!settings.motion);
}

/* ---------- sessions ---------- */

/** iOS lets a page read the motion sensor only after a tap and a yes. */
async function askSensor() {
  const D = window.DeviceMotionEvent;
  if (settings.sensor && typeof D?.requestPermission === 'function') {
    try { await D.requestPermission(); } catch (e) { /* stays off */ }
  }
}

function startSession(kind, opts = {}) {
  askSensor();
  if (kind === 'night') {
    const night = opts.night ?? nextNight();
    session = { kind, night, tier: V.tierOf(night), orders: V.nightOrders(night, opts.seed ?? Date.now() % 9973), i: 0, scores: [] };
  } else if (kind === 'school') {
    session = { kind, tier: 'easy', orders: [{ recipe: opts.recipe, customer: null }], i: 0, scores: [] };
  } else if (kind === 'daily') {
    const seed = dailySeed();
    session = { kind, seed, tier: 'medium', orders: V.dailyOrders(seed).map((id) => ({ recipe: id, customer: null })), i: 0, scores: [] };
  } else if (kind === 'memory') {
    session = { kind, tier: 'hard', orders: [{ recipe: V.memoryPick(S.madeIds(state)), customer: null }], i: 0, scores: [], streak: 0 };
  }
  openOrder();
}

function openOrder() {
  const o = session.orders[session.i];
  const c = UI.customer(o.customer);
  let label = '';
  if (session.kind === 'night') label = `${t('night', { n: session.night + 1 })} · ${t('nightOf', { i: session.i + 1, n: session.orders.length })}`;
  else if (session.kind === 'daily') label = `${t('modes.daily')} · ${session.i + 1}/3`;
  else if (session.kind === 'memory') label = `${t('modes.memory')} · ${t('memoryStreak', { n: session.streak, b: state.memory })}`;
  else label = t('modes.school');
  screen = 'bar';
  panel.hidden = true;
  sheet.hidden = true;
  $('#bar').hidden = false;
  bar.open({
    recipe: o.recipe, customer: o.customer, tier: session.tier, label,
    recipeMode: session.kind === 'memory' ? 'never' : 'show',
    recipeOpen: session.kind === 'school' && innerHeight >= 700,
    say: c ? customerLine(lang(), c.id) : LINES[lang()].hello[(session.i + session.orders.length) % LINES[lang()].hello.length],
  });
}

function serve(bench) {
  const o = session.orders[session.i];
  const recipe = RECIPE[o.recipe];
  const res = judge(recipe, bench, session.tier);
  const info = S.recordServe(state, recipe.id, res.score);
  session.scores[session.i] = res.score;
  save();
  res.stars >= 2 ? audio.sfx.good() : audio.sfx.bad();
  for (let i = 0; i < res.stars; i++) audio.sfx.star(i);
  let buttons;
  const last = session.i + 1 >= session.orders.length;
  if (session.kind === 'school') buttons = `${btn('home', t('menu'))}${btn('pick-other', t('modes.school'))}${btn('again', t('retry'), 'primary')}`;
  else if (session.kind === 'memory') {
    session.streak = res.score >= 75 ? session.streak + 1 : 0;
    if (session.streak > state.memory) { state.memory = session.streak; save(); }
    buttons = `${btn('home', t('menu'))}${btn('memory-next', t('next'), 'primary')}`;
  } else buttons = `${btn('again', t('retry'))}${btn('order-next', last ? (session.kind === 'night' ? t('result.toNight') : t('next')) : t('result.next'), 'primary')}`;
  showSheet('result', UI.result(t, lang(), recipe, res, info, verdictLine(lang(), res, names()), names(), buttons));
}

const btn = (act, label, cls = '') => `<button type="button" class="btn ${cls}" data-act="${act}">${UI.esc(label)}</button>`;

function nextOrder() {
  if (session.i + 1 < session.orders.length) { session.i++; openOrder(); return; }
  if (session.kind === 'night') {
    const res = V.nightResult(session.scores, session.night);
    S.finishNight(state, session.night, res);
    save();
    res.passed ? audio.sfx.good() : audio.sfx.bad();
    showSheet('night', UI.nightEnd(t, session.night, res, session.scores, session.orders));
  } else if (session.kind === 'daily') {
    const total = session.scores.reduce((a, b) => a + b, 0);
    const best = S.finishDaily(state, session.seed, total);
    save();
    showSheet('daily', UI.dailyEnd(t, total, best, session.scores, session.orders));
  }
}

function quitSession() {
  const kind = session?.kind;
  session = null;
  if (kind === 'school') return show('school', UI.school(t, lang(), state, filter, query));
  goHome();
}

/* ---------- actions ---------- */

const actions = {
  home: goHome,
  'adult-yes'() { settings.adult = true; saveSettings(); goHome(); },
  'adult-no'() { declined = true; goHome(); },
  mode(el) {
    const id = el.dataset.id;
    filter = 'all'; query = '';
    if (id === 'night') show('nights', UI.nights(t, state));
    else if (id === 'school') show('school', UI.school(t, lang(), state, filter, query));
    else if (id === 'book') show('book', UI.book(t, lang(), state, filter, query));
    else startSession(id);
  },
  night(el) { startSession('night', { night: +el.dataset.n }); },
  filter(el) { filter = el.dataset.f; rerenderList(); },
  pick(el) { startSession('school', { recipe: el.dataset.id }); },
  detail(el) { show('detail', UI.detail(t, lang(), state, el.dataset.id)); },
  book() { show('book', UI.book(t, lang(), state, filter, query)); },
  howto() { show('howto', UI.howto(t)); },
  settings() { asking = false; settingsBack = 'home'; show('settings', UI.settingsScreen(t, lang(), settings, asking, settingsBack)); },
  set(el) {
    const { key, v } = el.dataset;
    if (key === 'lang') i18n.setLang(v);
    else settings[key] = v === 'true';
    audio.setSound(settings.sound);
    audio.setMusic(settings.music);
    saveSettings();
    refresh();
    const top = panel.scrollTop;
    show('settings', UI.settingsScreen(t, lang(), settings, asking, settingsBack));
    panel.scrollTop = top;
    panel.querySelector(`[data-key="${key}"][data-v="${v}"]`)?.focus({ preventScroll: true });
  },
  'reset-ask'() { asking = true; show('settings', UI.settingsScreen(t, lang(), settings, asking)); },
  'reset-no'() { asking = false; show('settings', UI.settingsScreen(t, lang(), settings, asking)); },
  'reset-yes'() { asking = false; state = S.newState(); save(); goHome(); },
  again() { openOrder(); },
  'order-next': nextOrder,
  'pick-other'() { session = null; show('school', UI.school(t, lang(), state, filter, query)); },
  'memory-next'() {
    session.orders = [{ recipe: V.memoryPick(S.madeIds(state), Math.random, session.orders[0].recipe), customer: null }];
    session.i = 0;
    openOrder();
  },
  'night-retry'() { startSession('night', { night: session.night }); },
  'night-next'() { startSession('night', { night: session.night + 1 }); },
};

function rerenderList() {
  const html = screen === 'book' ? UI.book(t, lang(), state, filter, query) : UI.school(t, lang(), state, filter, query);
  show(screen, html);
  const s = panel.querySelector('[data-search]');
  if (s && query) { s.focus(); s.setSelectionRange(query.length, query.length); }
}

for (const root of [panel, sheet]) {
  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    audio.sfx.tap();
    actions[el.dataset.act]?.(el);
  });
}
panel.addEventListener('input', (e) => {
  if (!e.target.matches('[data-search]')) return;
  query = e.target.value;
  rerenderList();
});

const wake = () => { if (audio.unlock() && settings.adult) audio.startMusic(); };
window.addEventListener('pointerdown', wake, { passive: true });
window.addEventListener('keydown', wake);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { bar.stop(); audio.stopAll(); save(); audio.pause(); } else audio.resume();
});
window.addEventListener('pagehide', () => save());
i18n.onChange(() => {
  refresh();
  if (screen === 'bar') bar.render();
});
window.addEventListener('storage', () => i18n.sync());

/* shaking the phone shakes the shaker */
let lastJolt = 0;
window.addEventListener('devicemotion', (e) => {
  if (!settings.sensor || screen !== 'bar') return;
  const a = e.acceleration?.x != null ? e.acceleration : null;
  const g = a || e.accelerationIncludingGravity;
  if (!g) return;
  const m = Math.hypot(g.x || 0, g.y || 0, g.z || 0) - (a ? 0 : 9.81);
  const now = performance.now();
  if (Math.abs(m) > 12 && now - lastJolt > 120) { lastJolt = now; bar.impulse(0.22); }
});

/* ---------- loop ---------- */

let last = 0;
function frame(ms) {
  requestAnimationFrame(frame);
  const dt = last ? Math.min(0.05, (ms - last) / 1000) : 0;
  last = ms;
  if (screen === 'bar') bar.tick(dt);
}

refresh();
goHome();
requestAnimationFrame(frame);
registerSW();

/** Test hooks. */
window.__shake = {
  get state() { return state; },
  get screen() { return screen; },
  get session() { return session; },
  bar,
  settings,
  start: startSession,
  /** Makes the current order exactly by the book. */
  perfect() { const b = W.newBench(); play(b, perfectPlay(RECIPE[bar.order.recipe])); bar.setBench(b); return b; },
  advance(ms) { for (let left = ms / 1000; left > 1e-6; left -= 1 / 60) bar.tick(Math.min(1 / 60, left)); },
};
document.documentElement.dataset.ready = '1';
