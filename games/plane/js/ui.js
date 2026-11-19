/* Sky Ace — menus, HUD, overlays and localization */

import { STR, LEVELS, DIFFICULTY } from './config.js';
import { state, save, setLang, accuracy } from './state.js';
import { levelName } from './config.js';
import * as AUDIO from './audio.js';

const $ = id => document.getElementById(id);

export class UI {
  constructor() { this.callbacks = {}; this.current = null; this.toastTimer = 0; }

  t(key) { return (STR[state.lang] && STR[state.lang][key]) || STR.en[key] || key; }

  init(callbacks) {
    this.callbacks = callbacks;
    const on = (id, fn) => { const el = $(id); if (el) el.addEventListener('click', e => { e.preventDefault(); el.blur(); fn(e); }); };
    on('btnCampaign', () => callbacks.onCampaign?.(0));
    on('btnTutorial', () => this.showOverlay('tutorialOverlay'));
    on('btnTutorialBack', () => this.showOverlay('menuOverlay'));
    on('btnStats', () => this.showStats());
    on('btnStatsBack', () => this.showOverlay('menuOverlay'));
    on('btnLaunch', () => callbacks.onLaunch?.());
    on('btnBriefBack', () => callbacks.onQuit?.());
    on('btnResume', () => callbacks.onResume?.());
    on('btnRestart', () => callbacks.onRestart?.());
    on('btnQuit', () => callbacks.onQuit?.());
    on('btnNext', () => callbacks.onNext?.());
    on('btnRetry', () => callbacks.onRetry?.());
    on('btnAgain', () => callbacks.onAgain?.());
    on('btnMenuGameover', () => callbacks.onQuit?.());
    on('btnMenuVictory', () => callbacks.onQuit?.());
    on('btnLang', () => this.toggleLang());
    on('btnSound', () => this.toggleSound());

    document.querySelectorAll('[data-difficulty]').forEach(button => {
      button.addEventListener('click', () => {
        state.difficulty = button.dataset.difficulty;
        save();
        this.renderDifficulty();
      });
    });

    this.applyLanguage();
    this.renderSound();
    this.renderRecords();
  }

  applyLanguage() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = this.t(node.dataset.i18n); });
    this.renderDifficulty();
    this.renderTutorial();
    this.renderRecords();
    $('btnSoundText').textContent = `${this.t('sound')}: ${state.sound ? this.t('on') : this.t('off')}`;
  }

  toggleLang() {
    setLang(state.lang === 'it' ? 'en' : 'it');
    this.applyLanguage();
    this.callbacks.onLanguage?.();
  }

  toggleSound() {
    state.sound = !state.sound;
    save();
    AUDIO.setSound(state.sound);
    this.renderSound();
  }

  renderSound() {
    $('btnSoundText').textContent = `${this.t('sound')}: ${state.sound ? this.t('on') : this.t('off')}`;
  }

  renderDifficulty() {
    document.querySelectorAll('[data-difficulty]').forEach(button => {
      button.classList.toggle('active', button.dataset.difficulty === state.difficulty);
    });
  }

  renderTutorial() {
    const el = $('tutorialList');
    if (el) el.innerHTML = [1, 2, 3, 4].map(i => `
      <div class="tut-row"><b>${i}</b><span>${this.t('t' + i)}</span></div>`).join('');
  }

  renderRecords() {
    const el = $('menuRecord');
    if (el) el.textContent = `${this.t('best')}: ${state.best.toLocaleString()}`;
  }

  showOverlay(id) {
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
    if (id) $(id)?.classList.remove('hidden');
    this.current = id;
    $('touchControls').classList.toggle('hidden', id !== null);
  }

  hideOverlays() { this.showOverlay(null); }

  toast(text, color = '#4de8ff') {
    const el = $('toast');
    el.textContent = text;
    el.style.setProperty('--toast-color', color);
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('show'), 1300);
  }

  updateHUD(engine) {
    if (!engine.player) return;
    const p = engine.player;
    $('hudLevel').textContent = `${this.t('level')} ${engine.levelIndex + 1}/${LEVELS.length}`;
    $('hudMission').textContent = levelName(engine.levelIndex, state.lang);
    $('hudScore').textContent = engine.score.toLocaleString();
    $('hudCombo').textContent = `×${engine.combo}`;
    $('hudCombo').parentElement.classList.toggle('hot', engine.combo >= 5);
    $('hudEnemies').textContent = engine.enemies.length + (engine.boss ? 1 : 0);
    $('hudBombs').textContent = p.bombs;
    const hp = Math.max(0, Math.round(p.health));
    $('hudHealth').textContent = `${hp}%`;
    $('healthFill').style.width = hp + '%';
    $('healthFill').style.background = hp > 55 ? 'linear-gradient(90deg,#5ef0a8,#4de8ff)'
      : hp > 25 ? 'linear-gradient(90deg,#ffd166,#ff9f68)' : 'linear-gradient(90deg,#ff4d6d,#ff6b9d)';
    $('hudShield').classList.toggle('hidden', p.shield <= 0);
  }

  showBrief(index) {
    $('briefNum').textContent = `${this.t('mission')} ${index + 1} / ${LEVELS.length}`;
    $('briefName').textContent = levelName(index, state.lang);
    $('briefEnemies').textContent = LEVELS[index].enemyCount;
    $('briefBoss').textContent = LEVELS[index].boss
      ? (state.lang === 'it' && index >= 2 ? this.t('boss') + ': ' + LEVELS[index].boss.name : LEVELS[index].boss.name)
      : '—';
    $('briefDiff').textContent = this.t(DIFFICULTY[state.difficulty] ? state.difficulty : 'medium');
    this.showOverlay('briefOverlay');
  }

  showPause() {
    this.showOverlay('pauseOverlay');
  }

  showLevelComplete(engine) {
    this.showOverlay('levelOverlay');
    $('levelDoneTitle').textContent = this.t('levelComplete');
    $('levelDoneScore').textContent = `${this.t('score')}: ${engine.score.toLocaleString()}`;
    $('levelDoneBonus').textContent = `+${engine.clearBonus.toLocaleString()}`;
  }

  showGameOver(engine, isRecord) {
    this.showOverlay('gameoverOverlay');
    $('goScore').textContent = `${this.t('score')}: ${engine.score.toLocaleString()}`;
    $('goLevel').textContent = `${this.t('level')} ${engine.levelIndex + 1}`;
    $('goRecord').classList.toggle('hidden', !isRecord);
  }

  showVictory(engine, isRecord) {
    this.showOverlay('victoryOverlay');
    $('vicScore').textContent = `${this.t('score')}: ${engine.score.toLocaleString()}`;
    $('vicKills').textContent = `${this.t('kills')}: ${engine.kills}`;
    $('vicRecord').classList.toggle('hidden', !isRecord);
  }

  showStats() {
    this.showOverlay('statsOverlay');
    $('statBest').textContent = state.best.toLocaleString();
    $('statEasy').textContent = (state.bestByDifficulty.easy || 0).toLocaleString();
    $('statMedium').textContent = (state.bestByDifficulty.medium || 0).toLocaleString();
    $('statHard').textContent = (state.bestByDifficulty.hard || 0).toLocaleString();
    $('statRuns').textContent = state.runs;
    $('statWins').textContent = state.wins;
    $('statKills').textContent = state.totalKills;
    $('statAcc').textContent = accuracy() + '%';
    $('statProgress').textContent = `${state.highLevel}/${LEVELS.length}`;
  }
}
