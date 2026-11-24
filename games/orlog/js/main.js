/**
 * main.js — Orlog: fasi di gioco, modalità, progressione e PWA.
 */

import { MODES, FAVORS, BOSSES, DEFAULT_SETTINGS, STORAGE_KEY, findBoss, findMode, findFavor } from './config.js';
import { createMatch, rollDice, resolve, chooseAI, dailySeed } from './engine.js';
import { modeSetup, tournamentOpponents, endlessOpponent, isBossUnlocked, nextBoss, campaignStars } from './modes.js';
import { emptyProgress, normalizeProgress, awardStars, buyTalent, toggleRelic, updateStreak, talentSummary } from './progression.js';
import { shareResult } from './share.js';
import { createAudio } from './audio.js';
import {
  renderModes, renderDice, rollAnimation, hitAnimation, updateHUD,
  renderFavors, renderLog, renderLore, renderTalents, toast, showScreen, showOverlay
} from './ui.js';

const $ = (id) => document.getElementById(id);

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
  catch (e) { return {}; }
}
const stored = load();
const settings = { ...DEFAULT_SETTINGS, ...(stored.settings || {}) };
let progress = normalizeProgress(stored.progress || emptyProgress());
const audio = createAudio({ sound: settings.sound, haptics: settings.haptics });

const state = {
  mode: settings.mode || 'classic',
  match: null,
  enemyName: 'Challenger',
  favor: null,
  aiFavor: null,
  stage: 0,
  modeData: null,
  locked: []
};

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, progress })); }
  catch (e) {}
}

function setPhase(phase) {
  if (state.match) state.match.phase = phase;
  $('phaseBadge').textContent = phase.toUpperCase();
}

function refreshModes() {
  renderModes(state.mode, (id) => {
    state.mode = id;
    settings.mode = id;
    persist();
    refreshModes();
    toast(findMode(id).name);
  });
}

function setupOpponent() {
  const setup = modeSetup(state.mode, progress);
  state.modeData = setup;
  const maxHp = state.mode === 'tournament' && state.stage > 0
    ? 15 - state.stage * 2
    : setup.hp;
  const match = createMatch({
    mode: state.mode,
    bossId: setup.bossId,
    seed: setup.seed,
    hp: maxHp,
    tokens: setup.tokens,
    relics: progress.relics || [],
    talents: progress.talents || [],
    mutators: setup.mutators
  });
  if (state.mode === 'endless') {
    const foe = endlessOpponent(state.stage + 1);
    match.enemy.hp = foe.hp;
    match.enemy.tokens = foe.tokens;
    state.enemyName = foe.name;
  } else if (state.mode === 'tournament') {
    const foe = tournamentOpponents()[Math.min(state.stage, 2)];
    state.enemyName = foe.name + ' · ' + (state.stage + 1) + '/3';
    match.enemy.hp = foe.hp;
  } else {
    state.enemyName = setup.bossId ? findBoss(setup.bossId).name : 'Challenger';
  }
  state.match = match;
  state.favor = null;
  state.aiFavor = null;
  state.locked = [];
  setPhase('roll');
  $('favorPanel').classList.add('hidden');
  $('resLog').classList.add('hidden');
  $('rollBtn').textContent = '🎲 Roll dice';
  $('rollBtn').disabled = false;
  $('skipBtn').classList.add('hidden');
  renderDice('playerDice', [], [], false);
  renderDice('aiDice', [], [], false);
  updateHUD(match, state.enemyName);
  showScreen('game');
  $('rollInfo').textContent = `Roll up to ${match.rollsLeft} times. Tap dice to lock them.`;
}

function startBattle() {
  audio.unlock();
  state.stage = 0;
  setupOpponent();
}

function handleRoll() {
  const match = state.match;
  if (!match || match.phase !== 'roll') return;
  if (match.rollsLeft <= 0) return;
  const fresh = rollDice(match, 6);
  match.player.dice = fresh;
  match.locked = fresh.map(() => false);
  match.rollsLeft -= 1;
  rollAnimation('playerDice');
  renderDice('playerDice', fresh, match.locked, true, toggleLock);
  renderDice('aiDice', fresh.map(() => '🎲'), [], false);
  audio.roll();
  $('rollInfo').textContent = `Rolls left: ${match.rollsLeft}. Tap dice to lock, then roll again.`;
  if (match.rollsLeft === 0) {
    $('rollBtn').disabled = true;
    setTimeout(enterFavorPhase, 450);
  }
}

function toggleLock(index) {
  const match = state.match;
  if (!match || match.phase !== 'roll') return;
  match.locked[index] = !match.locked[index];
  renderDice('playerDice', match.player.dice, match.locked, true, toggleLock);
  audio.lock();
}

function enterFavorPhase() {
  const match = state.match;
  if (!match) return;
  setPhase('godfavor');
  // mantieni solo i dadi bloccati durante il lancio successivo: qui i dadi sono già fissi
  state.aiFavor = chooseAI(match);
  renderFavors(match, chooseFavor);
  $('favorPanel').classList.remove('hidden');
  $('skipBtn').classList.remove('hidden');
  $('rollInfo').textContent = 'Choose a God Favor or skip to resolve the round.';
  updateHUD(match, state.enemyName);
}

function chooseFavor(id) {
  const match = state.match;
  if (!match || match.phase !== 'godfavor') return;
  const favor = findFavor(id);
  let cost = match.mutators.includes('free') ? 1 : favor.cost;
  if (match.player.relics.includes('runes')) cost = Math.max(1, cost - 1);
  if (match.player.tokens < cost) return;
  state.favor = id;
  if (match.mutators.includes('mirror') && state.aiFavor === null) state.aiFavor = id;
  audio.favor();
  resolveRound();
}

function skipFavor() {
  state.favor = null;
  resolveRound();
}

function resolveRound() {
  const match = state.match;
  if (!match) return;
  setPhase('resolution');
  const events = resolve(match, { playerFavor: state.favor, aiFavor: state.aiFavor });
  renderLog(events, { enemy: state.enemyName });
  hitAnimation('playerDice', 'player');
  hitAnimation('aiDice', 'enemy');
  if (events.some((event) => event.type === 'damage')) audio.hit();
  if (events.some((event) => event.type === 'heal')) audio.heal();
  renderDice('aiDice', match.enemy.dice, [], false);
  updateHUD(match, state.enemyName);
  $('favorPanel').classList.add('hidden');
  $('skipBtn').classList.add('hidden');
  $('rollInfo').textContent = match.winner ? 'The duel is over!' : 'Dice resolved — preparing the next round…';

  setTimeout(() => {
    if (match.winner) { finish(match.winner === 'player'); return; }
    if (state.mode === 'endless' || state.mode === 'tournament') {
      state.stage += 1;
      if (state.mode === 'tournament' && state.stage >= 3) { finish(true); return; }
      setupOpponent();
      toast(state.mode === 'endless' ? `Wave ${state.stage + 1}!` : 'Next challenger!');
      return;
    }
    match.player.dice = [];
    match.enemy.dice = [];
    match.player.favor = null;
    match.enemy.favor = null;
    match.rollsLeft = 3;
    state.favor = null;
    state.aiFavor = null;
    setPhase('roll');
    renderDice('playerDice', [], [], false);
    renderDice('aiDice', [], [], false);
    $('rollBtn').disabled = false;
    $('rollBtn').textContent = '🎲 Roll dice';
    $('resLog').classList.add('hidden');
    $('rollInfo').textContent = `Round ${match.round} — roll again!`;
    updateHUD(match, state.enemyName);
  }, 1600);
}

function finish(won) {
  const match = state.match;
  const bossId = state.modeData && state.modeData.bossId ? state.modeData.bossId : state.mode;
  const rounds = Math.max(1, match.round - 1);
  const score = won ? Math.max(0, match.enemy.hp <= 0 ? match.player.hp * 20 + rounds * 15 : 0) : 0;
  const stars = won ? (score >= 300 ? 3 : score >= 180 ? 2 : 1) : 0;
  progress = awardStars(progress, bossId, stars, score);
  if (state.mode === 'daily') progress = updateStreak(progress, dailySeed());
  persist();
  $('goTrophy').textContent = won ? '🏆' : '💀';
  $('goTitle').textContent = won ? 'Victory!' : 'Defeat!';
  $('goStars').textContent = won ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '☆☆☆';
  $('goStats').textContent = `${state.enemyName} · ${rounds} rounds · ${score} points · ${campaignStars(progress)} stars`;
  showScreen('gameover');
  if (won) audio.win(); else audio.lose();
  state.lastResult = { won, mode: findMode(state.mode).name, boss: state.enemyName, rounds, score, combo: match.combo || 1, stars };
}

async function share() {
  const result = state.lastResult || {
    won: false, mode: findMode(state.mode).name, boss: state.enemyName,
    rounds: state.match ? state.match.round : 1, score: 0, combo: 1, stars: 0
  };
  toast(await shareResult(result) === 'shared' ? 'Shared!' : 'PNG saved');
}

function renderTalentSheet() {
  renderTalents(progress, {
    onTalent: (id) => { progress = buyTalent(progress, id); persist(); renderTalentSheet(); },
    onRelic: (id) => { progress = toggleRelic(progress, id); persist(); renderTalentSheet(); }
  });
}

function bindUI() {
  $('playBtn').addEventListener('click', startBattle);
  $('menuBtn').addEventListener('click', () => showScreen('start'));
  $('rollBtn').addEventListener('click', handleRoll);
  $('skipBtn').addEventListener('click', skipFavor);
  $('goAgain').addEventListener('click', startBattle);
  $('goMenu').addEventListener('click', () => showScreen('start'));
  $('goShare').addEventListener('click', share);
  $('gameShareBtn').addEventListener('click', share);
  $('loreBtn').addEventListener('click', () => showOverlay('loreOverlay', true));
  $('gameLoreBtn').addEventListener('click', () => showOverlay('loreOverlay', true));
  $('loreClose').addEventListener('click', () => showOverlay('loreOverlay', false));
  $('talentBtn').addEventListener('click', () => { renderTalentSheet(); showOverlay('talentOverlay', true); });
  $('talentClose').addEventListener('click', () => showOverlay('talentOverlay', false));
  $('gameSoundBtn').addEventListener('click', () => {
    settings.sound = !settings.sound;
    audio.setSound(settings.sound);
    $('gameSoundBtn').textContent = settings.sound ? '🔊' : '🔇';
    persist();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') document.querySelectorAll('.overlay').forEach((node) => node.classList.add('hidden'));
    if (event.key === ' ' && state.match && state.match.phase === 'roll') { event.preventDefault(); handleRoll(); }
  });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) $('updateBar').classList.remove('hidden');
        });
      });
    }).catch(() => {});
  }
  $('updateBtn').addEventListener('click', () => {
    navigator.serviceWorker.getRegistration().then((registration) => { if (registration && registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' }); });
    location.reload();
  });
}

function init() {
  refreshModes();
  bindUI();
  renderLore();
  $('gameSoundBtn').textContent = settings.sound ? '🔊' : '🔇';
  talentSummary(progress);
  showScreen('start');
}

init();
window.__ORLOG__ = { state, get progress() { return progress; }, settings, startBattle, handleRoll, enterFavorPhase, chooseFavor, skipFavor, finish };
