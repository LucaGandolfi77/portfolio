/* ============================================================
   Ultimo Colore — boot, journey, scenes, saving
   ============================================================ */
import { createI18n } from '../../_kit/i18n.js';
import { load, store } from '../../_kit/storage.js';
import { registerSW } from '../../_kit/pwa.js';
import { STRINGS } from './strings.js';
import { NODE } from './data/map.js';
import { SCENES, TALKS } from './data/story.js';
import { HEROES } from './data/party.js';
import { MEMORY } from './data/memories.js';
import * as P from './world/progress.js';
import { createBattle, rewards } from './battle/engine.js';
import { createAudio } from './audio.js';
import { createBattleUI } from './ui/battle.js';
import { fadedURL } from './render/fade.js';
import * as UI from './ui/screens.js';

const $ = (s) => document.querySelector(s);
const i18n = createI18n(STRINGS, 'it');
const t = i18n.t;
const lang = () => i18n.getLang();

const settings = load(P.SETTINGS_KEY, {
  autoParry: false, sound: true, music: true, bigtext: false,
  motion: matchMedia('(prefers-reduced-motion: reduce)').matches,
});
let save = P.hydrate(load(P.SAVE_KEY, {}));   // null when there is no journey yet
const persist = () => { if (save) store(P.SAVE_KEY, save); };
const saveSettings = () => store(P.SETTINGS_KEY, settings);

const audio = createAudio();
audio.setSound(settings.sound);
audio.setMusic(settings.music);

const panel = $('#screen');
const stage = $('#stage');
const battleRoot = $('#battle');
const art = $('#art');
const artFaded = $('#art-faded');
const overlay = $('#overlay');

let screen = 'title';
let selected = null;
let scene = null;          // {beats, i, done, fadeAt}
let currentNode = null;
let campId = null;
let back = 'map';
let partyHero = null;

const battle = createBattleUI(battleRoot, {
  t, lang, audio, settings: () => settings,
  onEnd: battleEnded,
  onMenu: openPause,
});

/* ---------- backgrounds ---------- */

let artWanted = '';
const artPath = (name) => `art/${name}.webp`;
/** Paintings lose their green once it has died. */
const resolveArt = (name) => (save?.actDone ? fadedURL(artPath(name)) : Promise.resolve(artPath(name)));

function setArt(name) {
  artWanted = name;
  artFaded.classList.remove('on');
  resolveArt(name).then((url) => { if (artWanted === name) art.style.backgroundImage = `url("${url}")`; });
}

/* ---------- screens ---------- */

function show(name, html, { art: bg = null, music = null, dim = true } = {}) {
  screen = name;
  battle.stop();
  battleRoot.hidden = true;
  overlay.hidden = true;
  panel.innerHTML = html;
  panel.hidden = false;
  panel.dataset.kind = name;
  panel.classList.toggle('dim', dim);
  panel.scrollTop = 0;
  stage.hidden = false;
  if (bg) setArt(bg);
  if (music) audio.music(music);
  audio.setFaded(!!save?.actDone);
}

const goTitle = () => { scene = null; show('title', UI.title(t, save), { art: 'titolo', music: 'title', dim: false }); };

function goMap() {
  if (!save) return goTitle();
  scene = null; campId = null; currentNode = null;
  if (save.actDone) return show('end', UI.end(t, lang(), save), { art: 'secche', music: 'camp' });
  const open = P.available(save);
  if (!open.includes(selected)) selected = open.find((id) => !NODE[id].optional) || open[0] || null;
  show('map', '', { music: 'explore', dim: false });
  panel.innerHTML = UI.map(t, lang(), save, artPath('mappa'), selected);
}

function refreshBody() {
  document.documentElement.lang = lang();
  document.body.classList.toggle('bigtext', !!settings.bigtext);
  document.body.classList.toggle('calm', !!settings.motion);
}

/* ---------- scenes ---------- */

function playScene(beats, done, { art: bg, fadeAt = null, music = 'explore' } = {}) {
  scene = { beats: [...beats], i: 0, done, fadeAt };
  if (bg) setArt(bg);
  audio.music(music);
  if (fadeAt !== null && bg) fadedURL(artPath(bg)).then((url) => { artFaded.style.backgroundImage = `url("${url}")`; });
  renderBeat();
}

function renderBeat() {
  const beat = scene.beats[scene.i];
  screen = 'scene';
  battle.stop();
  battleRoot.hidden = true;
  overlay.hidden = true;
  stage.hidden = false;
  panel.hidden = false;
  panel.dataset.kind = 'scene';
  panel.classList.remove('dim');
  panel.innerHTML = `<button type="button" class="btn skip" data-act="skip">${UI.esc(t('skip'))} »</button>${UI.dialogue(t, lang(), beat, scene.i, scene.beats.length)}`;
  if (scene.fadeAt !== null && scene.i >= scene.fadeAt) { artFaded.classList.add('on'); audio.setFaded(true); }
  panel.querySelector('.talk button, button.talk')?.focus({ preventScroll: true });
}

function advance() {
  if (!scene) return;
  scene.i++;
  audio.sfx.page();
  if (scene.i < scene.beats.length) return renderBeat();
  const done = scene.done;
  scene = null;
  done();
}

function choose(i) {
  const beat = scene.beats[scene.i];
  const opt = beat.c[i];
  P.addBond(save, opt.bond);
  if (opt.flag) save.flags[opt.flag] = true;
  scene.beats.splice(scene.i + 1, 0, ...(opt.beats || []));
  persist();
  advance();
}

/** Skipping stops at the next choice, so no decision is lost. */
function skip() {
  if (!scene) return;
  const next = scene.beats.findIndex((b, i) => i > scene.i && b.c);
  if (scene.beats[scene.i].c) return;
  scene.i = next >= 0 ? next : scene.beats.length - 1;
  if (next >= 0) renderBeat(); else advance();
}

/* ---------- the journey ---------- */

function enterNode(id) {
  const node = NODE[id];
  if (!node) return;
  currentNode = node;
  if (node.type === 'camp') {
    const first = !save.done.includes(id);
    const open = () => { campId = id; if (first) { const got = P.complete(save, id); P.rest(save); persist(); return gains(got, openCamp); } openCamp(); };
    return first ? playScene(SCENES[node.scene], open, { art: node.art, music: 'camp' }) : ((campId = id), openCamp());
  }
  const seen = save.flags[`seen_${id}`];
  const then = () => {
    save.flags[`seen_${id}`] = true;
    if (node.enemies) return startBattle(node);
    const got = P.complete(save, id);
    persist();
    gains(got, goMap);
  };
  if (node.join) P.join(save, node.join);
  if (seen && node.enemies) return then();
  playScene(SCENES[node.scene] || [], then, { art: node.art, fadeAt: node.fade ? 3 : null });
}

/** Shows what a finished node gave, if anything. */
function gains(got, next, extra = []) {
  const lines = [
    ...extra,
    ...got.joined.map((h) => t('joined', { n: HEROES[h].name })),
    ...got.memories.map((m) => t('found', { m: MEMORY[m][lang()] })),
    ...(got.diary ? [t('newPage')] : []),
  ];
  if (!lines.length) return next();
  after = next;
  show('gains', UI.rewards(t, lang(), lines, 'gains-next'));
}
let after = goMap;

function startBattle(node) {
  const b = createBattle({
    party: save.party, level: P.level(save), enemies: node.enemies, difficulty: save.difficulty,
    items: save.items, equipped: save.equipped, hp: save.hp, autoParry: settings.autoParry,
  });
  scene = null;
  screen = 'battle';
  currentNode = node;
  panel.hidden = true;
  overlay.hidden = true;
  stage.hidden = false;
  battleRoot.hidden = false;
  setArt(node.art);
  audio.music(node.type === 'boss' ? 'boss' : 'battle');
  const tutorial = node.tutorial && !save.flags.tutorial;
  save.flags.tutorial = save.flags.tutorial || !!node.tutorial;
  persist();
  battle.start(b, node, artPath(node.art), { tutorial });
}

function battleEnded(result, b, node) {
  if (result === 'lose') {
    persist();
    return show('defeat', UI.defeat(t), { music: 'camp' });
  }
  const reward = rewards(b);
  const outcome = P.afterBattle(save, b, reward);
  const got = P.complete(save, node.id);
  persist();
  const lines = [
    t('win.title'), t('win.xp', { n: reward.xp }), t('win.light', { n: reward.light }),
    ...(outcome.levelUp ? [t('win.level', { n: outcome.levelUp })] : []),
    ...outcome.learned.map((x) => t('win.learned', { h: HEROES[x.hero].name, m: MEMORY[x.memory][lang()] })),
  ];
  gains(got, goMap, lines);
}

function openCamp() {
  show('camp', UI.camp(t, lang(), save, campId, P.talksAt(save, campId)), { art: NODE[campId].art, music: 'camp' });
}

function openPause() {
  if (screen !== 'battle') return;
  battle.pause(true);
  overlay.hidden = false;
  overlay.innerHTML = `<div class="card center"><h2>${UI.esc(t('menu'))}</h2><div class="col">
    <button type="button" class="btn primary" data-act="resume">${UI.esc(t('cont'))}</button>
    <button type="button" class="btn" data-act="pause-settings">${UI.esc(t('settings'))}</button>
    <button type="button" class="btn" data-act="flee">${UI.esc(t('lose.map'))}</button></div></div>`;
  overlay.querySelector('button').focus({ preventScroll: true });
}

/* ---------- actions ---------- */

function showSettings(from) {
  back = from;
  const html = UI.settingsScreen(t, lang(), settings, save?.difficulty, from);
  if (from === 'resume') { overlay.hidden = false; overlay.innerHTML = `<div class="card settings">${html}</div>`; }
  else show('settings', html);
}

function showParty(note = '') {
  const top = panel.scrollTop;
  show('party', UI.party(t, lang(), save, partyHero, campId ? 'camp' : 'map', note));
  panel.scrollTop = top;
}

const actions = {
  title: goTitle,
  map: goMap,
  camp: openCamp,
  new() { show('difficulty', UI.difficulty(t, !!save), { art: 'titolo' }); },
  start(el) { save = P.newGame(el.dataset.d); selected = null; persist(); enterNode('casa'); },
  continue: goMap,
  node(el) {
    selected = el.dataset.id;
    panel.innerHTML = UI.map(t, lang(), save, artPath('mappa'), selected);
    panel.querySelector('[data-act="enter"]')?.focus({ preventScroll: true });
  },
  enter(el) { enterNode(el.dataset.id); },
  advance,
  choose(el) { choose(+el.dataset.i); },
  skip,
  'gains-next'() { after(); },
  howto() { show('howto', UI.howto(t, 'title'), { art: 'titolo' }); },
  settings() { showSettings(screen === 'map' ? 'map' : 'title'); },
  set(el) {
    const { key, v } = el.dataset;
    if (key === 'lang') i18n.setLang(v);
    else if (key === 'diff') { save.difficulty = v; if (battle.battle) battle.battle.difficulty = v; persist(); }
    else settings[key] = v === 'true';
    if (battle.battle) battle.battle.autoParry = settings.autoParry;
    audio.setSound(settings.sound);
    audio.setMusic(settings.music);
    saveSettings();
    refreshBody();
    showSettings(back);
  },
  resume() {
    overlay.hidden = true;
    battle.redraw();
    battle.pause(false);
  },
  'pause-settings'() { showSettings('resume'); },
  flee() { battle.stop(); goMap(); },
  retry() { startBattle(currentNode); },
  'retry-easier'() {
    const order = ['story', 'easy', 'normal', 'hard'];
    save.difficulty = order[Math.max(0, order.indexOf(save.difficulty) - 1)];
    persist();
    startBattle(currentNode);
  },
  party() { showParty(); },
  hero(el) { partyHero = el.dataset.id; showParty(); },
  mem(el) {
    const hero = save.party.includes(partyHero) ? partyHero : save.party[0];
    const err = P.toggleMemory(save, hero, el.dataset.id);
    persist();
    const other = P.holder(save, el.dataset.id);
    showParty(err === 'full' ? t('party.full') : err === 'taken' ? t('party.taken', { h: HEROES[other]?.name }) : '');
  },
  teach(el) { const hero = save.party.includes(partyHero) ? partyHero : save.party[0]; if (P.teach(save, hero, el.dataset.id)) { audio.sfx.heal(); persist(); } showParty(); },
  diary() { show('diary', UI.diary(t, lang(), save, campId ? 'camp' : 'map')); },
  talk(el) {
    const talk = TALKS[campId].find((x) => x.id === el.dataset.id);
    if (!talk || P.talksLeft(save, campId) <= 0) return;
    playScene(talk.beats, () => { P.hadTalk(save, talk.id); persist(); openCamp(); }, { art: NODE[campId].art, music: 'camp' });
  },
  rest() { P.rest(save); persist(); audio.sfx.heal(); openCamp(); panel.querySelector('.muted').textContent = t('camp.rested'); },
  leave() { campId = null; goMap(); },
};

for (const root of [panel, overlay]) {
  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    // "back" inside the pause settings goes back to the pause menu
    if (root === overlay && el.dataset.act === 'resume' && el.closest('.settings')) return openPause();
    audio.sfx.tap();
    actions[el.dataset.act]?.(el);
  });
}

window.addEventListener('keydown', (e) => {
  if (screen === 'battle') {
    if (e.key === 'Escape') { if (overlay.hidden) openPause(); else actions.resume(); return; }
    if (overlay.hidden && battle.key(e)) e.preventDefault();
  }
});

const wake = () => audio.unlock();
window.addEventListener('pointerdown', wake, { passive: true });
window.addEventListener('keydown', wake);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { openPause(); persist(); audio.pause(); } else audio.resume();
});
window.addEventListener('pagehide', persist);
i18n.onChange(() => { refreshBody(); if (screen === 'battle') battle.redraw(); });
window.addEventListener('storage', () => i18n.sync());

/* ---------- loop ---------- */

let last = 0, frozen = false;
function frame(ms) {
  requestAnimationFrame(frame);
  const dt = last ? Math.min(50, ms - last) : 0;
  last = ms;
  if (screen === 'battle' && !frozen) battle.tick(dt);
}

refreshBody();
goTitle();
requestAnimationFrame(frame);
registerSW();

/** Test hooks. */
window.__colore = {
  get save() { return save; },
  get screen() { return screen; },
  settings,
  battle,
  /** Stops the real-time clock, so tests can time presses exactly. */
  freeze(v = true) { frozen = v; },
  newGame(difficulty = 'normal') { save = P.newGame(difficulty); selected = null; persist(); goMap(); },
  enter: enterNode,
  /** Runs the battle clock for ms milliseconds. */
  advance(ms) { for (let left = ms; left > 0 && screen === 'battle'; left -= 16) battle.tick(Math.min(16, left)); },
  /** Plays a scene to its end, taking the first answer to every question. */
  readAll() { for (let i = 0; i < 200 && screen === 'scene'; i++) { const b = scene.beats[scene.i]; if (b.c) choose(0); else advance(); } },
  /** Marks every node up to `id` as done. */
  jump(id) {
    for (const n of Object.values(NODE)) {
      if (n.id === id) break;
      P.join(save, n.join);
      if (!n.optional) { P.complete(save, n.id); save.xp += (n.enemies?.length || 0) * 40; }
    }
    persist(); goMap();
  },
};
document.documentElement.dataset.ready = '1';
