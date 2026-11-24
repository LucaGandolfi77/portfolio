/**
 * main.js — Memory Garden: modalità, power-up, quest, collezione e PWA.
 */

import {
  MODES, DIFFICULTIES, DECKS, THEMES, ACHIEVEMENTS, QUESTS, POWERS,
  DEFAULT_SETTINGS, STORAGE_KEY, findMode, findTheme,
  findDeck, findQuest
} from './config.js';
import {
  createGame, boardCards, shuffled, mulberry32, dailySeed,
  comboMultiplier, scorePair, registerMismatch, isComplete,
  starRating, progress, clamp
} from './core.js';
import { questStars, isQuestUnlocked, nextQuestId, meetsQuestGoal } from './quest.js';
import { emptyCollection, normalizeCollection, collectCards } from './collection.js';
import { shareResult } from './share.js';
import { createAudio } from './audio.js';
import {
  renderSelectors, renderPowers, renderHUD, renderGrid, updateCard,
  renderQuests, renderCollection, renderAwards, renderLeaderboard, toast, showOverlay
} from './ui.js';

const $ = (id) => document.getElementById(id);
const saved = load();

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
  catch (e) { return {}; }
}
const save = {
  stars: saved.stars || {}, best: saved.best || {}, lb: saved.lb || {},
  achievements: saved.ach || [], collection: normalizeCollection(saved.collection || {}),
  streak: saved.streak || { count: 0, last: '' }
};
const settings = { ...DEFAULT_SETTINGS, ...(saved.settings || {}) };
const audio = createAudio({ sound: settings.sound, haptics: settings.haptics });

const state = {
  game: null,
  questId: null,
  busy: false,
  selected: [],
  lastFlip: 0,
  matrix: { seq: [], step: 0, showing: false },
  dailyDone: false
};

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      settings, stars: save.stars, best: save.best, lb: save.lb,
      ach: save.achievements, collection: save.collection, streak: save.streak
    }));
  } catch (e) {}
}

function columns() {
  return (DIFFICULTIES.find((item) => item.id === settings.diff) || DIFFICULTIES[0]).cols;
}

function setTheme(id) {
  settings.theme = id;
  const theme = findTheme(id);
  document.body.dataset.theme = id;
  document.documentElement.style.setProperty('--accent', theme.accent);
  document.documentElement.style.setProperty('--accent2', theme.accent2);
  persist();
}

function setMessage(text, kind = '') {
  const node = $('msg');
  node.textContent = text;
  node.className = 'msg ' + kind;
}

function achievement(id) {
  if (save.achievements.includes(id)) return;
  const item = ACHIEVEMENTS.find((entry) => entry.id === id);
  if (!item) return;
  save.achievements.push(id);
  persist();
  toast(item.emoji + ' ' + item.name);
  renderAwards(AWARDS_WITH_STATE());
}

function AWARDS_WITH_STATE() {
  return ACHIEVEMENTS.map((item) => ({ ...item, done: save.achievements.includes(item.id) }));
}

function newGame(questId = null) {
  state.questId = questId;
  if (questId) { settings.mode = 'quest'; settings.deck = findQuest(questId).deck; }
  const mode = findMode(settings.mode);
  const seed = mode.seeded ? dailySeed() : Math.floor(Math.random() * 1e9);
  state.game = createGame({ mode: settings.mode, diff: settings.diff, deck: settings.deck, seed, questId });
  state.selected = [];
  state.busy = false;
  state.lastFlip = 0;
  state.matrix = { seq: [], step: 0, showing: false };
  state.dailyDone = false;
  renderGrid(state.game, columns(), flip);
  renderPowers(state.game.powers, usePower);
  renderHUD(state.game, metaInfo());
  setMessage(mode.desc + ' 🌸');
  showOverlay('winOverlay', false);
  if (settings.mode === 'matrix') startMatrix();
  if (settings.mode === 'mirror') {
    $('grid').style.transform = 'scaleX(-1)';
    $('grid').querySelectorAll('.card').forEach((element, index) => {
      if (index % 3 === 0) {
        element.classList.add('fog');
        element.addEventListener('pointerdown', () => element.classList.remove('fog'), { once: true });
      }
    });
  } else $('grid').style.transform = '';
}

function metaInfo() {
  return { time: findMode(settings.mode).time, level: save.collection.level || 1 };
}

function flip(index) {
  const game = state.game;
  if (!game || game.over || state.busy) return;
  const card = game.cards[index];
  if (!card || card.flipped || card.matched) return;
  audio.unlock();
  if (settings.mode === 'matrix') { matrixTap(index); return; }
  card.flipped = true;
  updateCard(index, card);
  audio.flip();
  state.selected.push(index);
  if (state.selected.length < 2) return;
  const [first, second] = state.selected.map((id) => game.cards[id]);
  state.selected = [];
  state.busy = true;
  game.moves += 1;
  if (first.value === second.value) {
    setTimeout(() => {
      first.matched = second.matched = true;
      game.matched += 1;
      game.combo += 1;
      game.bestCombo = Math.max(game.bestCombo, game.combo);
      const points = scorePair(game, { seconds: (Date.now() - state.lastFlip) / 1000, gold: first.gold || second.gold });
      first.gold = second.gold = false;
      updateCard(first.id, first); updateCard(second.id, second);
      audio.match(game.combo);
      save.collection = collectCards(save.collection, [first], { stars: 0, theme: settings.theme });
      if (game.combo >= 3) achievement('combo5');
      if (settings.mode === 'chaos') triggerEvent();
      if (settings.mode === 'rush' && game.matched % 4 === 0) rushShuffle();
      state.busy = false;
      setMessage('+' + points + ' · combo ×' + comboMultiplier(game.combo), 'good');
      renderHUD(game, metaInfo());
      if (isComplete(game)) win();
    }, 260);
  } else {
    setTimeout(() => {
      first.flipped = second.flipped = false;
      updateCard(first.id, first); updateCard(second.id, second);
      registerMismatch(game);
      audio.miss();
      state.busy = false;
      setMessage('Not a match — try again!', 'bad');
      renderHUD(game, metaInfo());
    }, 620);
  }
  state.lastFlip = Date.now();
}

function usePower(id) {
  const game = state.game;
  if (!game || !game.powers[id]) return;
  game.powers[id] -= 1;
  audio.power();
  if (id === 'peek') {
    const card = game.cards.find((item) => !item.matched && !item.flipped);
    if (card) { card.flipped = true; updateCard(card.id, card); setTimeout(() => { card.flipped = false; updateCard(card.id, card); }, 900); }
  } else if (id === 'shuffle') {
    const unmatched = game.cards.filter((card) => !card.matched);
    const values = shuffled(unmatched.map((card) => card.value));
    unmatched.forEach((card, index) => { card.value = values[index]; });
    renderGrid(game, columns(), flip);
    if (settings.mode === 'mirror') $('grid').style.transform = 'scaleX(-1)';
  } else if (id === 'freeze') {
    game.freeze = 6;
  } else if (id === 'hint') {
    const pair = game.cards.find((card) => !card.matched && game.cards.some((other) => other !== card && other.value === card.value && !other.matched));
    if (pair) {
      const match = game.cards.find((other) => other !== pair && other.value === pair.value && !other.matched);
      [pair, match].forEach((card) => { const element = $('grid').children[card.id]; if (element) { element.classList.add('hint'); setTimeout(() => element.classList.remove('hint'), 1200); } });
    }
  }
  renderPowers(game.powers, usePower);
}

function triggerEvent() {
  const events = ['shuffle', 'gold', 'fog', 'swap', 'freeze', 'bloom'];
  const id = events[Math.floor(Math.random() * events.length)];
  const game = state.game;
  if (id === 'shuffle') usePower('shuffle');
  else if (id === 'gold') { const card = game.cards.find((item) => !item.matched); if (card) { card.gold = true; updateCard(card.id, card); } }
  else if (id === 'fog') {
    document.querySelectorAll('.card:not(.matched)').forEach((element) => element.classList.add('fog'));
    setTimeout(() => document.querySelectorAll('.card').forEach((element) => element.classList.remove('fog')), 5000);
  } else if (id === 'swap') {
    const a = game.cards.find((item) => !item.matched);
    const b = game.cards.filter((item) => !item.matched && item !== a)[Math.floor(Math.random() * 6)];
    if (a && b) { const value = a.value; a.value = b.value; b.value = value; renderGrid(game, columns(), flip); }
  } else if (id === 'freeze') game.freeze = 6;
  else if (id === 'bloom') { ['peek', 'shuffle', 'freeze', 'hint'].forEach((key) => { game.powers[key] += 1; }); renderPowers(game.powers, usePower); }
  toast('✨ ' + id.toUpperCase() + '!');
}

function rushShuffle() {
  const game = state.game;
  const unmatched = game.cards.filter((card) => !card.matched);
  const values = shuffled(unmatched.map((card) => card.value));
  unmatched.forEach((card, index) => { card.value = values[index]; });
  renderGrid(game, columns(), flip);
  toast('⚡ Board shifted!');
}

function startMatrix() {
  const game = state.game;
  const values = shuffled(game.cards.map((card) => card.value)).slice(0, 3 + Math.min(4, game.matched));
  state.matrix = { seq: values, step: 0, showing: true };
  setMessage('Watch the sequence…');
  values.forEach((value, index) => {
    setTimeout(() => {
      const card = game.cards.find((item) => item.value === value && !item.flipped);
      if (card) { card.flipped = true; updateCard(card.id, card); setTimeout(() => { card.flipped = false; updateCard(card.id, card); }, 500); }
    }, 700 * (index + 1));
  });
  setTimeout(() => { state.matrix.showing = false; setMessage('Repeat the sequence!'); }, 700 * (values.length + 1));
}

function matrixTap(index) {
  const game = state.game, matrix = state.matrix;
  if (matrix.showing) return;
  const card = game.cards[index];
  const expected = matrix.seq[matrix.step];
  if (card.value !== expected) {
    matrix.step = 0;
    setMessage('Wrong — watch again!', 'bad');
    startMatrix();
    return;
  }
  card.flipped = true; card.matched = true; game.matched += 1;
  scorePair(game, { seconds: 0 });
  updateCard(index, card);
  audio.match(matrix.step);
  matrix.step += 1;
  if (matrix.step >= matrix.seq.length) {
    game.matched = 0;
    game.cards.forEach((item) => { item.matched = false; item.flipped = false; });
    startMatrix();
    setMessage('Round cleared! Next sequence.', 'good');
  }
  renderHUD(game, metaInfo());
}

function win() {
  const game = state.game;
  if (game.over) return;
  game.over = true;
  audio.win();
  achievement('first');
  if (game.mistakes === 0) achievement('perfect');
  if (game.bestCombo >= 10) achievement('streak10');

  let stars = starRating(game.score, findMode(settings.mode).id === 'quest' ? findQuest(state.questId).stars : [10, 20, 30]);
  if (settings.mode === 'quest' && !meetsQuestGoal(findQuest(state.questId), game)) stars = Math.min(1, stars);
  const modeKey = settings.mode;
  save.best[modeKey] = Math.max(save.best[modeKey] || 0, game.score);
  save.lb[modeKey] = [...(save.lb[modeKey] || []), { score: game.score, date: new Date().toLocaleDateString() }].sort((a, b) => b.score - a.score).slice(0, 10);
  if (settings.mode === 'quest') save.stars[state.questId] = Math.max(save.stars[state.questId] || 0, stars);
  if (settings.mode === 'daily') {
    const today = dailySeed();
    save.streak = { count: save.streak.last === today ? save.streak.count : save.streak.count + 1, last: today };
    if (save.streak.count >= 7) achievement('daily7');
  }
  save.collection = collectCards(save.collection, game.cards.filter((card) => card.matched), { stars, theme: settings.theme });
  if (save.collection.cards.length >= 30) achievement('collector');
  if (QUESTS.filter((quest) => (save.stars[quest.id] || 0) > 0).length >= 10) achievement('quest10');
  persist();

  $('winTitle').textContent = '🎉 Garden in bloom!';
  $('winBody').textContent = `${game.score} points · ${game.moves} moves · ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;
  const next = state.questId ? nextQuestId(state.questId) : null;
  $('winNext').classList.toggle('hidden', !next);
  $('winNext').onclick = () => { if (next) { newGame(next); renderSelectors(state, handlers); } };
  showOverlay('winOverlay', true);
}

function loop(timestamp) {
  requestAnimationFrame(loop);
  const game = state.game;
  if (!game || game.over) return;
  const mode = findMode(settings.mode);
  const delta = Math.min(0.05, (timestamp - (state.lastTick || timestamp)) / 1000);
  state.lastTick = timestamp;
  if (game.freeze > 0) game.freeze = Math.max(0, game.freeze - delta);
  else if (mode.time) {
    game.time -= delta;
    if (game.time <= 0) { game.time = 0; game.over = true; setMessage('Time is up!', 'bad'); toast('⏰ Time up!'); }
  }
  if (settings.mode === 'rush' && game.moves >= 24 && !game.over) { game.over = true; setMessage('Out of moves!', 'bad'); }
  renderHUD(game, metaInfo());
}

const handlers = {
  onMode(id) { settings.mode = id; state.questId = null; persist(); renderSelectors(state, handlers); newGame(); },
  onDiff(id) { settings.diff = id; persist(); renderSelectors(state, handlers); newGame(); },
  onDeck(id) { settings.deck = id; persist(); newGame(); },
  onTheme(id) { setTheme(id); }
};

function bindUI() {
  renderSelectors(state, handlers);
  $('newBtn').addEventListener('click', () => { newGame(); renderSelectors(state, handlers); });
  $('questBtn').addEventListener('click', () => { renderQuests(save, { onQuest: (id) => { newGame(id); showOverlay('questOverlay', false); } }); showOverlay('questOverlay', true); });
  $('collectionBtn').addEventListener('click', () => { renderCollection(save.collection); showOverlay('collectionOverlay', true); });
  $('achBtn').addEventListener('click', () => { renderAwards(AWARDS_WITH_STATE()); showOverlay('achOverlay', true); });
  $('lbBtn').addEventListener('click', () => { renderLeaderboard(save.lb); showOverlay('lbOverlay', true); });
  $('shareBtn').addEventListener('click', async () => {
    const result = await shareResult({
      mode: findMode(settings.mode).name, score: state.game.score, moves: state.game.moves,
      combo: state.game.bestCombo, theme: findTheme(settings.theme).name, stars: 0
    });
    toast(result === 'shared' ? 'Shared!' : 'PNG saved + text copied');
  });
  ['winClose', 'winAgain', 'questClose', 'collectionClose', 'achClose', 'lbClose'].forEach((id) => {
    $(id).addEventListener('click', () => {
      document.querySelectorAll('.overlay').forEach((overlay) => overlay.classList.add('hidden'));
      if (id === 'winAgain') newGame(state.questId);
    });
  });
  $('soundBtn').addEventListener('click', () => {
    settings.sound = !settings.sound;
    audio.setSound(settings.sound);
    $('soundBtn').textContent = settings.sound ? '🔊' : '🔇';
    persist();
  });
  $('hapticsBtn').addEventListener('click', () => {
    settings.haptics = !settings.haptics;
    audio.setHaptics(settings.haptics);
    $('hapticsBtn').textContent = settings.haptics ? '📳' : '📴';
    persist();
  });
  $('langSel').addEventListener('change', (event) => {
    try { localStorage.setItem('site_lang', event.target.value); localStorage.setItem('lang', event.target.value); } catch (e) {}
    if (window.translations) location.reload();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') document.querySelectorAll('.overlay').forEach((overlay) => overlay.classList.add('hidden'));
  });
}

function init() {
  $('langSel').value = ['it', 'en', 'es', 'fr', 'de'].includes(settings.locale) ? settings.locale : 'it';
  $('soundBtn').textContent = settings.sound ? '🔊' : '🔇';
  $('hapticsBtn').textContent = settings.haptics ? '📳' : '📴';
  setTheme(settings.theme);
  bindUI();
  newGame();
  renderAwards(AWARDS_WITH_STATE());
  renderLeaderboard(save.lb);
  renderCollection(save.collection);
  for (let i = 0; i < 22; i += 1) {
    const leaf = document.createElement('i');
    leaf.textContent = ['🍃', '🌸', '🦋', '✨', '🌼'][i % 5];
    leaf.style.left = (Math.random() * 100) + '%';
    leaf.style.fontSize = (12 + Math.random() * 16) + 'px';
    leaf.style.animationDuration = (16 + Math.random() * 20) + 's';
    leaf.style.animationDelay = (-Math.random() * 25) + 's';
    $('garden').appendChild(leaf);
  }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  requestAnimationFrame(loop);
}

init();
window.__MEMORY__ = { state, save, settings, newGame, flip, usePower, win, handlers };
