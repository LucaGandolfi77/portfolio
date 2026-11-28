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
import * as F from './world/field.js';
import { createWorld } from './ui/world.js';
import { SPAWN } from './world/layout.js';
import { ENEMIES } from './data/enemies.js';
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
const worldRoot = $('#world');

let screen = 'title';
let foe = null;            // the group being fought, to step back from
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

const world = createWorld(worldRoot, {
  t, lang, getSave: () => save, persist,
  onEncounter: encounter,
  onAuto: (id) => enterNode(id),
  onAct: act,
  onMenu(what) {
    if (what === 'title') return goTitle();
    persist();
    if (what === 'atlas') { audio.sfx.page(); resolveArt('world').then((url) => show('atlas', UI.atlas(t, lang(), save, url))); return; }
    actions[what]();
  },
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
  hideWorld();
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

const goTitle = () => { scene = null; persist(); show('title', UI.title(t, save), { art: 'titolo', music: 'title', dim: false }); };

function hideWorld() {
  world.hide();
  worldRoot.hidden = true;
}

/** Back to the open lagoon (or to the closing page, the first time). */
function goWorld() {
  if (!save) return goTitle();
  scene = null; campId = null; currentNode = null;
  if (save.actDone && !save.flags.endSeen) return show('end', UI.end(t, lang(), save), { art: 'secche', music: 'camp' });
  screen = 'world';
  battle.stop();
  battleRoot.hidden = true;
  overlay.hidden = true;
  panel.hidden = true;
  stage.hidden = true;
  worldRoot.hidden = false;
  audio.music('explore');
  audio.setFaded(!!save.actDone);
  const open = () => { world.show(worldArt); world.render(); };
  worldArt = artPath('world');
  open();
  if (save.actDone) resolveArt('world').then((url) => { worldArt = url; if (screen === 'world') open(); });
}
let worldArt = artPath('world');

function encounter(group, advantage) {
  foe = { id: group.id, home: { ...group.home } };
  if (group.node) return enterNode(group.node, advantage);
  const names = (l) => [...new Set(group.enemies.map((e) => ENEMIES[e].name[l]))].join(' · ');
  startBattle({ id: group.id, wild: true, art: group.art, enemies: group.enemies, type: 'battle', name: { it: names('it'), en: names('en') } }, advantage);
}

/** The button in the world. */
function act(near, field) {
  audio.sfx.tap();
  if (near.kind === 'strike') return encounter(field.groups.find((g) => g.id === near.id), 'party');
  if (near.kind === 'gate') return world.toast(t('world.gate'));
  if (near.kind === 'chest') {
    const c = F.openChest(save, near.id);
    if (c) { audio.sfx.heal(); persist(); world.toast(t('world.chest', { o: c.olio, c: c.cera, l: c.light })); }
    return;
  }
  if (near.kind === 'statue') {
    const st = F.readStatue(save, near.id);
    persist();
    audio.sfx.page();
    return show('statue', UI.statue(t, lang(), st), { art: 'canale' });
  }
  enterNode(near.id);
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
  hideWorld();
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

function enterNode(id, advantage = null) {
  const node = NODE[id];
  if (!node) return;
  currentNode = node;
  if (node.type === 'camp') {
    const first = !save.done.includes(id);
    const open = () => { campId = id; save.camp = id; if (first) { const got = P.complete(save, id); P.rest(save); persist(); return gains(got, openCamp); } openCamp(); };
    return first ? playScene(SCENES[node.scene], open, { art: node.art, music: 'camp' }) : ((campId = id), (save.camp = id), openCamp());
  }
  const seen = save.flags[`seen_${id}`];
  const then = () => {
    save.flags[`seen_${id}`] = true;
    if (node.enemies) return startBattle(node, advantage);
    const got = P.complete(save, id);
    persist();
    gains(got, goWorld);
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
let after = goWorld;

function startBattle(node, advantage = null) {
  hideWorld();
  const b = createBattle({
    party: save.party, level: P.level(save), enemies: node.enemies, difficulty: save.difficulty,
    items: save.items, equipped: save.equipped, hp: save.hp, autoParry: settings.autoParry, advantage,
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
  battle.start(b, node, artPath(node.art), { tutorial, note: advantage ? t(advantage === 'party' ? 'world.ambush' : 'world.surprised') : '' });
  currentAdvantage = advantage;
}
let currentAdvantage = null;

function battleEnded(result, b, node) {
  if (result === 'lose') {
    persist();
    return show('defeat', UI.defeat(t), { music: 'camp' });
  }
  const reward = rewards(b);
  if (node.wild) reward.xp = Math.round(reward.xp * P.WILD_XP);
  const outcome = P.afterBattle(save, b, reward);
  let got = { memories: [], joined: [], diary: null };
  if (node.wild) { if (!save.cleared.includes(node.id)) save.cleared.push(node.id); }
  else got = P.complete(save, node.id);
  foe = null;
  persist();
  const lines = [
    t('win.title'), t('win.xp', { n: reward.xp }), t('win.light', { n: reward.light }),
    ...(outcome.levelUp ? [t('win.level', { n: outcome.levelUp })] : []),
    ...outcome.learned.map((x) => t('win.learned', { h: HEROES[x.hero].name, m: MEMORY[x.memory][lang()] })),
  ];
  gains(got, goWorld, lines);
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
    <button type="button" class="btn" data-act="flee">${UI.esc(t('lose.flee'))}</button></div></div>`;
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
  map: goWorld,
  explore() { save.flags.endSeen = true; persist(); goWorld(); },
  camp: openCamp,
  new() { show('difficulty', UI.difficulty(t, !!save), { art: 'titolo' }); },
  start(el) { save = P.newGame(el.dataset.d); persist(); enterNode('casa'); },
  continue: goWorld,
  advance,
  choose(el) { choose(+el.dataset.i); },
  skip,
  'gains-next'() { after(); },
  howto() { show('howto', UI.howto(t, 'title'), { art: 'titolo' }); },
  settings() { showSettings(screen === 'title' ? 'title' : 'map'); },
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
  flee() {
    const from = foe;
    battle.stop();
    goWorld();
    if (from && world.field) { F.retreat(save, world.field, from.home); persist(); world.render(); }
    foe = null;
  },
  'to-camp'() {
    const at = save.camp ? { x: NODE[save.camp].at.x, y: NODE[save.camp].at.y + 20 } : SPAWN;
    save.pos = { x: at.x, y: at.y };
    foe = null;
    persist();
    goWorld();
  },
  retry() { startBattle(currentNode, currentAdvantage); },
  'retry-easier'() {
    const order = ['story', 'easy', 'normal', 'hard'];
    save.difficulty = order[Math.max(0, order.indexOf(save.difficulty) - 1)];
    persist();
    startBattle(currentNode, currentAdvantage);
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
  rest() { P.rest(save); persist(); audio.sfx.heal(); openCamp(); panel.querySelector('.muted').textContent = `${t('camp.rested')} ${t('world.rested')}`; },
  leave() { campId = null; goWorld(); },
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
  if (screen === 'world') { if (world.key(e)) e.preventDefault(); return; }
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
window.addEventListener('resize', () => { world.resize(); if (screen === 'world') world.render(); });
i18n.onChange(() => { refreshBody(); world.labels(); if (screen === 'battle') battle.redraw(); });
window.addEventListener('storage', () => i18n.sync());

/* ---------- loop ---------- */

let last = 0, frozen = false;
function frame(ms) {
  requestAnimationFrame(frame);
  const dt = last ? Math.min(50, ms - last) : 0;
  last = ms;
  if (frozen) return;
  if (screen === 'battle') battle.tick(dt);
  else if (screen === 'world') world.tick(dt / 1000);
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
  newGame(difficulty = 'normal') { save = P.newGame(difficulty); persist(); goWorld(); },
  world,
  /** Walks in a direction for ms milliseconds; stops at the first event. */
  walk(x, y, ms) { for (let left = ms; left > 0 && screen === 'world'; left -= 16) if (world.step(Math.min(16, left) / 1000, { x, y })) break; if (screen === 'world') world.render(0.3); },
  /** Puts the party somewhere, without walking. */
  place(x, y) { save.pos = { x, y }; persist(); goWorld(); },
  act: () => world.act(),
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
    save.pos = { x: NODE[id].at.x, y: NODE[id].at.y + (NODE[id].enemies ? 170 : 40) };
    persist(); goWorld();
  },
};
document.documentElement.dataset.ready = '1';
