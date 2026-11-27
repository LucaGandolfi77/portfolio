/* ============================================================
   Agente Zero — boot, menus, HUD, saving
   ============================================================ */
import { createI18n } from '../../_kit/i18n.js';
import { load, store } from '../../_kit/storage.js';
import { registerSW } from '../../_kit/pwa.js';
import { dailySeed } from '../../_kit/core.js';
import { STRINGS } from './strings.js';
import * as G from './state.js';
import * as M from './modes.js';
import { CHAPTERS, missionUnlocked, chapterUnlocked } from './career.js';
import { PRACTICE_SPOTS, distanceOf } from './court-data.js';
import { say, lineKey } from './lines.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { createGame } from './game.js';
import { drawPlayer, poseAt } from './render/player.js';
import { greenZone } from './shot.js';
import { createTilt } from './tilt.js';
import { stageOf, multiplierOf } from './drunk.js';
import * as UI from './ui.js';

const $ = (s) => document.querySelector(s);
const i18n = createI18n(STRINGS, 'it');
const t = i18n.t;

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const settings = load(G.SETTINGS_KEY, {
  control: 'swipe', diff: 'normal', sound: true, music: true, vibrate: true, guide: true,
  motion: reduced, contrast: false, bigtext: false, tilt: true, adult: false,
});
let state = G.hydrate(load(G.SAVE_KEY, null));
const save = () => store(G.SAVE_KEY, state);
const saveSettings = () => store(G.SETTINGS_KEY, settings);

const audio = createAudio();
audio.setSound(settings.sound);
audio.setMusic(settings.music);

const tilt = createTilt();
const canvas = $('#court');
const panel = $('#screen');
let screen = 'home';
let current = null;       // the options of the match in progress, for "retry"
let openChapter = 0;
let askingReset = false;
let bubbleTimer = 0, flashTimer = 0, lastLine = '';
let hudKey = '';
let declined = false;     // said "no" to the age question in this visit

const game = createGame(canvas, {
  audio, settings: () => settings, look: () => state.look, emit: onGame,
  tilt: () => (settings.tilt ? tilt.angle() : 0),
  words: () => ({ clean: t('bomb.clean'), spill: t('bomb.spill'), burp: t('bomb.burp'), can: t('bomb.can') }),
});

const input = createInput(canvas, {
  canShoot: () => screen === 'play' && game.canShoot(),
  distance: () => game.distance(),
  settings: () => settings,
  onGather: (k) => game.onGather(k),
  onPreview: (e) => game.onPreview(e),
  onShoot: (e) => game.shoot(e),
  onCancel: () => game.cancel(),
});

/* ---------- screens ---------- */

function show(name, html) {
  screen = name;
  panel.innerHTML = html;
  panel.hidden = false;
  panel.dataset.kind = name;
  panel.scrollTop = 0;
  const playing = ['pause', 'result', 'paused-settings'].includes(name);
  game.hold(false);
  $('#hud').hidden = !playing;
  $('#spots').hidden = true;
  $('#hint').hidden = true;
  $('#meter').hidden = true;
  if (!playing) { $('#bubble').hidden = true; $('#flash').hidden = true; }
}

function goHome() {
  current = null;
  game.demo(state.stats.shots ? game.match?.place || 'bunker' : 'bunker');
  show('home', UI.home(t, state, String(dailySeed())));
}

function showCareer() {
  if (!chapterUnlocked(state.stars, openChapter)) openChapter = 0;
  show('career', UI.career(t, i18n.getLang(), state, openChapter));
}

function refresh() {
  document.documentElement.lang = i18n.getLang();
  document.body.classList.toggle('bigtext', !!settings.bigtext);
  document.body.classList.toggle('contrast', !!settings.contrast);
  document.body.classList.toggle('calm', !!settings.motion);
  $('#btn-pause').setAttribute('aria-label', t('pause'));
  canvas.setAttribute('aria-label', t('hint.keys'));
}

const showSettings = () => {
  const inMatch = !!current;
  show(inMatch ? 'paused-settings' : 'settings', UI.settingsScreen(t, i18n.getLang(), settings, inMatch, askingReset));
};

/* ---------- matches ---------- */

function startMatch(mode, opts = {}) {
  current = { mode, opts };
  const places = ['bunker', 'gym', 'roof', 'beach', 'hall', 'arena'];
  const place = mode === 'training' || mode === 'timed' || mode === 'zero'
    ? opts.place || places[Math.min(places.length - 1, bestChapter())] : opts.place;
  const skill = { easy: 0.35, normal: 0.55, hard: 0.75 }[settings.diff];
  const match = G.beginMatch(state, M.newMatch(mode, { skill, ...opts, place }));
  screen = 'play';
  panel.hidden = true;
  $('#hud').hidden = false;
  $('#bubble').hidden = true;
  $('#flash').hidden = true;
  hudKey = '';
  input.cancel();
  input.resetAim();
  game.start(match);
  bubble(say(i18n.getLang(), mode === 'career' ? 'coach' : mode === 'bomb' ? 'bombHello' : 'hello'));
  if (mode === 'timed' || mode === 'three' || mode === 'bomb') audio.sfx.whistle();
}

/** iOS only grants the motion sensor from a tap, so ask before anything else. */
async function startBomb() {
  if (settings.tilt) await tilt.request();
  startMatch('bomb');
}

/** The furthest chapter reached picks the court for the free modes. */
function bestChapter() {
  let c = 0;
  while (c + 1 < CHAPTERS.length && chapterUnlocked(state.stars, c + 1)) c++;
  return c;
}

function endMatch(match, summary) {
  const reward = G.finishMatch(state, match, summary);
  save();
  let hasNext = false;
  if (match.id === 'career' && summary.stars > 0) hasNext = !!nextMission(match.chapter, match.mission);
  setTimeout(() => {
    if (screen !== 'play' || game.match !== match) return;
    if (summary.won) audio.sfx.win(); else audio.sfx.lose();
    if (match.id !== 'bomb') bubble(say(i18n.getLang(), summary.won ? 'win' : 'lose'));
    show('result', UI.result(t, match, summary, reward, hasNext));
  }, summary.crashed ? 2600 : 900);
  if (match.id === 'bomb') {
    bubble(say(i18n.getLang(), summary.crashed ? 'crash' : 'standing'));
    $('#hint').hidden = true;
  }
}

function nextMission(c, m) {
  let nc = c, nm = m + 1;
  if (nm >= CHAPTERS[c].missions.length) { nc++; nm = 0; }
  return nc < CHAPTERS.length && missionUnlocked(state.stars, nc, nm) ? { chapter: nc, mission: nm } : null;
}

/** Quitting keeps what happened: statistics, bests and medals. */
function quitMatch() {
  const match = game.match;
  if (match && match.attempts > 0 && !match.over && match.id !== 'career' && match.id !== 'daily') {
    G.finishMatch(state, match, M.summaryOf(match));
    save();
  }
  if (match?.id === 'career') { openChapter = match.chapter; current = null; game.demo(match.place); showCareer(); } else goHome();
}

function pauseMatch() {
  if (screen !== 'play' || !game.match || game.match.over) return;
  input.cancel();
  game.cancel();
  game.pause(true);
  show('pause', UI.pause(t));
}

function resume() {
  screen = 'play';
  panel.hidden = true;
  game.pause(false);
  $('#hud').hidden = false;
  hudKey = '';
  if (game.phase === 'drink') { tilt.reset(); drinkHint(); } else updateTurn();
}

/* ---------- game events ---------- */

function onGame(type, data) {
  if (type === 'turn') updateTurn();
  else if (type === 'launch') { $('#spots').hidden = true; $('#hint').hidden = true; }
  else if (type === 'cancel') input.cancel();
  else if (type === 'shot') onShot(data);
  else if (type === 'over') endMatch(data.match, data.summary);
  else if (type === 'drink') { input.cancel(); $('#flash').hidden = true; $('#bubble').hidden = true; drinkHint(); }
  else if (type === 'bombstep') { if (data.bomb.step === 'drink') tilt.reset(); drinkHint(); }
  else if (type === 'drunk') {
    // he comments back on court: the drink scene has no room for a bubble
    const stage = stageOf(data.match.level);
    const key = stage ? `drunk${stage}` : data.res.clean ? 'bombClean' : 'bombSpill';
    if (!data.match.over) bubble(say(i18n.getLang(), key, Math.random, lastLine));
  } else if (type === 'hiccup') flash(t('bomb.hic'), '', false);
}

/** What to do now in the drink scene. */
function drinkHint() {
  const step = game.bomb?.step;
  const hint = $('#hint');
  $('#spots').hidden = true;
  const key = step === 'swing' ? 'drop' : step === 'drink' ? (settings.tilt && tilt.seen ? 'both' : 'hold') : '';
  hint.textContent = key ? t(`bomb.${key}`) : '';
  hint.hidden = !key;
}

function onShot({ match, out, err, spot, env, beater }) {
  G.recordShot(state, { spot, env, buzzer: beater, out });
  if (out.who === 'you') save();
  const lang = i18n.getLang();
  let text = t(`miss.${out.made ? out.result : out.result === 'rim' || out.result === 'bank' ? 'miss' : out.result}`);
  let sub = '';
  if (out.made && out.points) sub = `+${out.points}`;
  else if (!out.made && out.who === 'you') sub = [err.len, err.side].filter(Boolean).map((k) => t(`miss.${k}`)).join(', ');
  if (out.letter) sub = t(out.letter === 'you' ? 'letterYou' : 'letterCpu');
  if (match.id === 'career' && match.spec.type === 'duel') sub = `${sub ? sub + ' · ' : ''}${t('hud.rival')} ${out.rivalMade ? '✔' : '✘'}`;
  flash(out.ignited ? t('hud.fire') : text, sub, out.made);
  if (out.who === 'you') {
    const key = lineKey(out, beater);
    if (['buzzer', 'fire', 'airball', 'blocked', 'late'].includes(key) || Math.random() < 0.55) bubble(say(lang, key, Math.random, lastLine));
  } else if (out.made) bubble(`Kappa: ${say(lang, 'rival', Math.random, lastLine)}`);
}

function flash(main, sub, good) {
  const el = $('#flash');
  el.innerHTML = `<b></b><small></small>`;
  el.querySelector('b').textContent = main;
  el.querySelector('small').textContent = sub;
  el.className = good ? 'good' : 'bad';
  el.hidden = false;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => { el.hidden = true; }, 1300);
}

function bubble(text) {
  const el = $('#bubble');
  if (!text) return;
  lastLine = text;
  el.textContent = text;
  el.hidden = false;
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

/** Hint and spot picker for the shot about to be taken. */
function updateTurn() {
  const match = game.match;
  if (!match || screen !== 'play') return;
  const who = M.turnOf(match);
  const hint = $('#hint');
  let text = '';
  if (match.id === 'zero') {
    text = who === 'you' ? t(match.phase === 'lead' ? 'zeroLead' : 'zeroCopy') : t(match.phase === 'lead' ? 'zeroCpuLead' : 'zeroCpuCopy');
  } else if (match.id === 'bomb' && match.level >= 20 && match.bombs < 3) text = t('bomb.arrow');
  else if (match.attempts < 3) text = t(`hint.${settings.control === 'hold' ? 'hold' : 'swipe'}`);
  hint.textContent = text;
  hint.hidden = !text;
  const picker = $('#spots');
  picker.hidden = !M.canMove(match);
  if (!picker.hidden) {
    const pool = PRACTICE_SPOTS.filter((s) => match.id === 'training' || (s.id !== 'half' && s.id !== 'deep'));
    picker.innerHTML = pool.map((s) => {
      const on = Math.hypot(s.x - match.spot.x, s.y - match.spot.y) < 0.05;
      return `<button type="button" class="chip" data-spot="${s.id}" aria-pressed="${on}">${UI.esc(t(`spots.${s.id}`))}</button>`;
    }).join('');
    picker.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
}

function updateHud() {
  const m = game.match;
  if (!m) return;
  const time = m.timeLeft !== null ? Math.ceil(m.timeLeft) : m.shotClock !== undefined ? Math.ceil(m.shotClock) : null;
  const wind = m.env.wind;
  const wob = game.wobble();
  const key = [m.level === undefined ? '' : Math.round(m.level), m.bombs, wob?.flip, m.score, m.attempts, m.makes, m.streak, time, m.letters?.you, m.letters?.cpu, m.rivalScore, wind?.[0], m.spot.x, M.isMoneyBall(m), i18n.getLang()].join('|');
  if (key === hudKey) return;
  hudKey = key;
  $('#hud-mode').textContent = t(`modes.${m.id}`);
  const items = [];
  const item = (label, value, cls = '') => items.push(`<div class="stat ${cls}"><small>${UI.esc(label)}</small><b>${value}</b></div>`);
  if (m.id === 'zero') {
    const letters = (n) => [...M.WORD].map((l, i) => `<i class="${i < n ? 'on' : ''}">${l}</i>`).join('');
    item(t('hud.you'), `<span class="letters">${letters(m.letters.you)}</span>`);
    item(t('hud.cpu'), `<span class="letters">${letters(m.letters.cpu)}</span>`);
  } else {
    if (time !== null) item(t('hud.time'), time, time <= 5 ? 'urgent' : '');
    if (m.id === 'career') {
      const spec = m.spec;
      if (spec.type === 'duel') { item(t('hud.you'), m.makes); item(t('hud.rival'), m.rivalScore); }
      else item(t('hud.goal'), `${M.goalValue(m)}/${spec.stars[M.starsFor(spec, M.goalValue(m))] ?? spec.stars[2]}`);
      if (spec.type !== 'clock') item(t('hud.shots'), `${m.attempts}/${spec.shots}`);
    } else if (m.id === 'training') {
      item(t('hud.baskets'), `${m.makes}/${m.attempts}`);
      item(t('hud.streak'), m.streak);
    } else {
      item(t('hud.score'), m.score);
      if (m.id === 'bomb') item(t('bomb.bombs'), m.bombs);
      if (m.id === 'timed') item(t('hud.streak'), m.streak);
      if (m.id === 'three') item(t('hud.shots'), `${m.attempts}/25`);
      if (m.id === 'daily') item(t('hud.shots'), `${m.attempts}/${M.DAILY_SHOTS}`);
    }
  }
  $('#hud-stats').innerHTML = items.join('');
  const chips = [];
  if (wind) {
    // the arrow shows the wind as seen by the shooter
    const d = distanceOf(m.spot) || 1;
    const fx = -m.spot.x / d, fy = -m.spot.y / d;
    const right = wind[0] * fy - (wind[1] || 0) * fx, ahead = wind[0] * fx + (wind[1] || 0) * fy;
    const deg = Math.round((Math.atan2(right, ahead) * 180) / Math.PI);
    chips.push(`<span class="wind">🚩 ${UI.esc(t('hud.wind'))} <i style="transform:rotate(${deg}deg)">↑</i> ${Math.hypot(wind[0], wind[1] || 0).toFixed(1)} m/s</span>`);
  }
  if (M.isMoneyBall(m)) chips.push(`<span class="money">×2 ${UI.esc(t('hud.money'))}</span>`);
  if (M.onFire(m)) chips.push(`<span class="hot">🔥 ${UI.esc(t('hud.fire'))}</span>`);
  if (m.id === 'bomb') {
    const stage = t('bomb.stages')[stageOf(m.level)];
    chips.push(`<span class="meter" role="meter" aria-label="${UI.esc(t('bomb.meter'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(m.level)}"><i><u style="width:${Math.round(m.level)}%"></u></i> ${UI.esc(stage)} ×${multiplierOf(m.level)}</span>`);
    if (wob.flip) chips.push(`<span class="hot">↔ ${UI.esc(t('bomb.flip'))}</span>`);
  }
  $('#hud-chips').innerHTML = chips.join('');
}

function updateMeter() {
  const m = screen === 'play' ? input.meter() : null;
  const el = $('#meter');
  const keyAim = input.keyAim();
  el.hidden = !m;
  if (m) {
    const g = greenZone(settings.diff) * 100;
    el.querySelector('.zone').style.cssText = `bottom:${50 - g / 2}%;height:${g}%`;
    el.querySelector('.needle').style.bottom = `${m.power * 100}%`;
  }
  const arrow = $('#aim');
  arrow.hidden = !m && !(screen === 'play' && keyAim && game.canShoot());
  if (!arrow.hidden) arrow.style.transform = `translateX(-50%) rotate(${((m ? m.aim : keyAim) * 360).toFixed(1)}deg)`;
}

/* ---------- actions ---------- */

const actions = {
  home: goHome,
  mode(el) {
    const id = el.dataset.id;
    if (id === 'career') { openChapter = bestChapter(); showCareer(); }
    else if (id === 'bomb') {
      if (declined) show('gate', UI.gate(t, true));
      else if (!settings.adult) show('gate', UI.gate(t, false));
      else startBomb();
    } else startMatch(id);
  },
  'adult-yes'() { settings.adult = true; saveSettings(); startBomb(); },
  'adult-no'() { declined = true; show('gate', UI.gate(t, true)); },
  career: showCareer,
  chapter(el) {
    const c = +el.dataset.c;
    openChapter = openChapter === c ? -1 : c;
    show('career', UI.career(t, i18n.getLang(), state, openChapter));
    panel.querySelector(`[data-act="chapter"][data-c="${c}"]`)?.scrollIntoView({ block: 'nearest' });
  },
  brief(el) { show('brief', UI.brief(t, i18n.getLang(), +el.dataset.c, +el.dataset.m)); },
  mission(el) { startMatch('career', { chapter: +el.dataset.c, mission: +el.dataset.m }); },
  wardrobe() { show('wardrobe', UI.wardrobe(t, state)); },
  look(el) {
    const { slot, id } = el.dataset;
    if (!G.setLook(state, slot, id)) return;
    save();
    const top = panel.scrollTop;
    show('wardrobe', UI.wardrobe(t, state));
    panel.scrollTop = top;
    panel.querySelector(`[data-slot="${slot}"][data-id="${id}"]`)?.focus({ preventScroll: true });
    if (slot === 'celebration') previewPose = { name: id, at: now() };
  },
  stats() { show('stats', UI.stats(t, state)); },
  medals() { G.checkMedals(state); save(); show('medals', UI.medals(t, state)); },
  howto() { show('howto', UI.howto(t)); },
  settings() { askingReset = false; showSettings(); },
  paused() { show('pause', UI.pause(t)); },
  set(el) {
    const { key, v } = el.dataset;
    const top = panel.scrollTop;
    if (key === 'lang') i18n.setLang(v);
    else settings[key] = v === 'true' ? true : v === 'false' ? false : v;
    audio.setSound(settings.sound);
    audio.setMusic(settings.music);
    saveSettings();
    refresh();
    showSettings();
    panel.scrollTop = top;
    panel.querySelector(`[data-key="${key}"][data-v="${v}"]`)?.focus({ preventScroll: true });
  },
  'reset-ask'() { askingReset = true; showSettings(); },
  'reset-no'() { askingReset = false; showSettings(); },
  'reset-yes'() { askingReset = false; state = G.newState(); save(); goHome(); },
  resume,
  retry() {
    if (!current) return;
    if (current.mode === 'bomb') startBomb();
    else startMatch(current.mode, current.opts);
  },
  next() {
    const n = game.match && nextMission(game.match.chapter, game.match.mission);
    if (!n) return showCareer();
    openChapter = n.chapter;
    show('brief', UI.brief(t, i18n.getLang(), n.chapter, n.mission));
    current = null;
    game.demo(CHAPTERS[n.chapter].place);
  },
  quit: quitMatch,
};

panel.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  audio.sfx.tap();
  actions[el.dataset.act]?.(el);
});
$('#spots').addEventListener('click', (e) => {
  const el = e.target.closest('[data-spot]');
  if (!el) return;
  const spot = PRACTICE_SPOTS.find((s) => s.id === el.dataset.spot);
  if (game.setSpot(spot)) { audio.sfx.tap(); input.cancel(); updateTurn(); el.blur(); }
});
$('#btn-pause').addEventListener('click', pauseMatch);

// in the drink scene a tap drops the shot, then holding drinks it
function pour(down) {
  if (screen !== 'play' || game.phase !== 'drink') return;
  if (!down) game.hold(false);
  else if (!game.drop()) game.hold(true);
}
canvas.addEventListener('pointerdown', (e) => { if (e.button <= 0) pour(true); });
for (const type of ['pointerup', 'pointercancel']) window.addEventListener(type, () => game.hold(false));
const POUR_KEYS = ['Space', 'Enter'];
window.addEventListener('keydown', (e) => {
  if (e.repeat || !POUR_KEYS.includes(e.code) || e.target.closest?.('button') || game.phase !== 'drink') return;
  e.preventDefault();
  pour(true);
});
window.addEventListener('keyup', (e) => { if (POUR_KEYS.includes(e.code)) pour(false); });
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' && e.key.toLowerCase() !== 'p') return;
  if (screen === 'play') pauseMatch();
  else if (screen === 'pause') resume();
});

const wake = () => { if (audio.unlock()) audio.startMusic(); };
window.addEventListener('pointerdown', wake, { passive: true });
window.addEventListener('keydown', wake);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { pauseMatch(); save(); audio.pause(); } else audio.resume();
});
window.addEventListener('pagehide', () => save());
window.addEventListener('resize', () => game.resize());
i18n.onChange(refresh);
window.addEventListener('storage', () => i18n.sync());

/* ---------- loop ---------- */

const now = () => performance.now() / 1000;
let previewPose = { name: 'idle', at: 0 };

function drawPreview() {
  const cv = $('#preview');
  if (!cv) return;
  const c = cv.getContext('2d');
  c.clearRect(0, 0, cv.width, cv.height);
  let name = previewPose.name, time = now() - previewPose.at;
  if (name !== 'idle' && time > 2.4) { previewPose = { name: 'idle', at: now() }; name = 'idle'; time = 0; }
  drawPlayer(c, cv.width * 0.46, cv.height - 28, 215, poseAt(name, time), state.look, { spin: time });
}

function advance(dt) {
  input.step(screen === 'play' ? dt : 0);
  game.update(dt);
}

let last = 0;
function frame(ms) {
  requestAnimationFrame(frame);
  const dt = last ? Math.min(0.05, (ms - last) / 1000) : 0;
  last = ms;
  advance(dt);
  game.draw();
  if (!$('#hud').hidden) updateHud();
  updateMeter();
  if (screen === 'wardrobe') drawPreview();
}

/* ---------- boot ---------- */

refresh();
goHome();
requestAnimationFrame(frame);
registerSW();

/** Test hooks. */
window.__zero = {
  get state() { return state; },
  settings,
  game,
  get screen() { return screen; },
  start: startMatch,
  shoot: (err = {}) => game.shoot(err),
  /** Runs the game for ms milliseconds without waiting for animation frames. */
  advance(ms) {
    for (let left = ms / 1000; left > 1e-6; left -= 1 / 60) advance(Math.min(1 / 60, left));
    game.draw();
    updateHud();
  },
};
document.documentElement.dataset.ready = '1';
