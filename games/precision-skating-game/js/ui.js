/* Precision Skating — overlays, menus and bilingual strings */

import { STR, FORMATIONS, CHAMPIONSHIP, SKATERS } from './config.js';
import { state, save } from './state.js';

const $ = id => document.getElementById(id);

export class UI {
  constructor() { this.callbacks = {}; this.current = null; }

  init(callbacks) {
    this.callbacks = callbacks;
    this.applyLanguage();
    const on = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
    on('btnPlay', () => callbacks.onPractice?.());
    on('btnChampionship', () => callbacks.onChampionship?.());
    on('btnPractice', () => callbacks.onPractice?.());
    on('btnLang', () => this.toggleLang());
    on('btnTutorial', () => this.showOverlay('tutorialOverlay'));
    on('btnPreview', () => this.showOverlay('previewOverlay'));
    on('btnResume', () => callbacks.onResume?.());
    on('btnRestart', () => callbacks.onRestart?.());
    on('btnQuit', () => callbacks.onQuit?.());
    on('btnRestartResults', () => callbacks.onRestart?.());
    on('btnMenuResults', () => callbacks.onQuit?.());
    on('btnNextRound', () => callbacks.onNextRound?.());
    on('btnStandingsBack', () => callbacks.onQuit?.());
    on('btnPreviewBack', () => this.showOverlay('startOverlay'));
    on('btnTutorialBack', () => this.showOverlay('startOverlay'));
    on('soundBtn', () => {
      state.sound = !state.sound;
      save();
      $('soundBtn').textContent = state.sound ? '♪' : '✕';
      callbacks.onSound?.(state.sound);
    });
    document.querySelectorAll('[data-difficulty]').forEach(button => {
      button.onclick = () => {
        state.difficulty = button.dataset.difficulty;
        save();
        this.renderDifficulty();
      };
    });
    this.renderDifficulty();
    $('soundBtn').textContent = state.sound ? '♪' : '✕';
    this.renderPreview();
    this.renderTutorial();
  }

  t(key) { return (STR[state.lang] && STR[state.lang][key]) || STR.en[key] || key; }

  applyLanguage() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = this.t(node.dataset.i18n); });
    $('btnLangText').textContent = this.t('lang');
    this.renderDifficulty();
    this.renderPreview();
    this.renderTutorial();
  }

  toggleLang() {
    state.lang = state.lang === 'it' ? 'en' : 'it';
    save();
    this.applyLanguage();
  }

  renderDifficulty() {
    document.querySelectorAll('[data-difficulty]').forEach(button => {
      button.classList.toggle('active', button.dataset.difficulty === state.difficulty);
    });
  }

  renderPreview() {
    const container = $('formationList');
    if (!container) return;
    const names = ['block', 'line', 'circle', 'wheel', 'intersection', 'traveling'];
    container.innerHTML = names.map((key, i) => {
      const points = FORMATIONS[key.toUpperCase()] ? FORMATIONS[key.toUpperCase()]() : [];
      const dots = points.map(p => `<i style="left:${p.x * 100}%;top:${p.y * 100}%"></i>`).join('');
      return `<div class="preview-card"><div class="mini-rink">${dots}</div><span>${i + 1}</span></div>`;
    }).join('');
  }

  renderTutorial() {
    const el = $('tutorialBody');
    if (el) {
      el.innerHTML = `<p>${this.t('tutorialText')}</p>
        <div class="tut-row"><b>1</b><span>${this.t('tapHint')}</span></div>
        <div class="tut-row"><b>2</b><span>${this.t('tapSkater')}</span></div>
        <div class="tut-row"><b>3</b><span>${this.t('spaceHint')}</span></div>`;
    }
  }

  showOverlay(id) {
    document.querySelectorAll('.overlay').forEach(overlay => overlay.classList.add('hidden'));
    if (id) $(id)?.classList.remove('hidden');
    this.current = id;
  }
  hideOverlays() { this.showOverlay(null); }

  showPause() {
    this.showOverlay('pauseOverlay');
    $('pauseTitle').textContent = this.t('pause');
    $('btnResumeText').textContent = this.t('resume');
    $('btnRestartText').textContent = this.t('restart');
    $('btnQuitText').textContent = this.t('quit');
  }

  showResults(results, { mode, rank, medal, finished, round, difficulty }) {
    this.showOverlay('resultsOverlay');
    $('routineDoneText').textContent = this.t('routineDone');
    $('resTechnical').textContent = `${this.t('technical')}: ${results.technical}`;
    $('resExecution').textContent = `${this.t('execution')}: ${results.execution}`;
    $('resArtistic').textContent = `${this.t('artistic')}: ${results.artistic}`;
    $('resPenalties').textContent = `${this.t('penalties')}: ${results.penalties.toFixed(1)}`;
    $('resCombo').textContent = `${this.t('comboBonus')}: ${results.comboBonus}`;
    $('resTotal').textContent = `${this.t('total')}: ${results.total}`;
    $('resultNote').textContent = mode === 'championship'
      ? `${this.t('rank')} #${rank}${medal ? ' · ' + this.t(medal) : ''}${finished ? ' · ' + this.t('champion') : ''}`
      : `${this.t('difficulty')}: ${this.t(difficulty)}`;
    $('btnNextRound').classList.toggle('hidden', mode !== 'championship' || finished);
  }

  showStandings(standings, championship) {
    this.showOverlay('standingsOverlay');
    const list = $('standingsList');
    list.innerHTML = standings.map((entry, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
      const isPlayer = entry.id === 'player';
      return `<div class="standing-row${isPlayer ? ' me' : ''}"><span>${i + 1}.</span>
        <b>${isPlayer ? 'Team Kinetic' : entry.name}</b><span>${entry.points} pt</span><span>${medal}</span></div>`;
    }).join('');
    $('standingsRound').textContent = `${this.t('round')} ${Math.min(championship.round + 1, CHAMPIONSHIP.length)}/${CHAMPIONSHIP.length}`;
  }
}
