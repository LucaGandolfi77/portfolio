/* GEOM DASH — HUD, screens and bilingual interface */

import { CHAPTERS, SKINS, DIFFICULTIES, ACHIEVEMENTS } from './config.js';
import { state } from './state.js';

const DICT = {
  it: {
    back: 'Portfolio', title: 'GEOM DASH', tagline: 'Salta, sfiora, sopravvivi. Poi fallo ancora.',
    score: 'PUNTI', best: 'RECORD', near: 'SFIORAMENTI', flow: 'FLOW',
    play: 'GIOCA', pause: 'PAUSA', resume: 'RIPRENDI', restart: 'RIAVVIA', menu: 'MENU',
    mode: 'Modalità', modeEndless: 'Endless', modeLevel: 'Livelli', modeDaily: 'Sfida del giorno',
    difficulty: 'Difficoltà', skin: 'Skin', sound: 'Audio', settings: 'Impostazioni',
    easy: 'Facile', medium: 'Medio', hard: 'Difficile',
    chapter: 'Capitolo', unlockNext: 'Completa il capitolo precedente',
    ready: 'Premi SPAZIO o tocca per saltare!', playing: 'Via! 🎮', paused: 'In pausa ☕',
    died: '💥 Scontro! Riprova', won: '🏁 Livello completato!', checkpoint: '✓ Checkpoint!',
    shield: '🛡️ Scudo attivato!', flowFull: '⚡ Double jump sbloccato!',
    results: 'RISULTATO', distance: 'Distanza', deaths: 'Tentativi', again: 'ANCORA',
    achievements: 'OBIETTIVI', records: 'RECORD', reset: 'Azzera progressi',
    resetConfirm: 'Azzerare tutti i progressi?', controls: 'SPAZIO / CLICK / TAP per saltare · P per la pausa',
    flowHint: 'Sfiora gli ostacoli per caricare il Flow', newBest: '🎉 NUOVO RECORD!'
  },
  en: {
    back: 'Portfolio', title: 'GEOM DASH', tagline: 'Jump, graze, survive. Then do it again.',
    score: 'SCORE', best: 'BEST', near: 'NEAR MISSES', flow: 'FLOW',
    play: 'PLAY', pause: 'PAUSE', resume: 'RESUME', restart: 'RESTART', menu: 'MENU',
    mode: 'Mode', modeEndless: 'Endless', modeLevel: 'Levels', modeDaily: 'Daily challenge',
    difficulty: 'Difficulty', skin: 'Skin', sound: 'Sound', settings: 'Settings',
    easy: 'Easy', medium: 'Medium', hard: 'Hard',
    chapter: 'Chapter', unlockNext: 'Complete the previous chapter',
    ready: 'Press SPACE or tap to jump!', playing: 'Go! 🎮', paused: 'Paused ☕',
    died: '💥 Crash! Try again', won: '🏁 Level complete!', checkpoint: '✓ Checkpoint!',
    shield: '🛡️ Shield activated!', flowFull: '⚡ Double jump unlocked!',
    results: 'RESULT', distance: 'Distance', deaths: 'Attempts', again: 'AGAIN',
    achievements: 'ACHIEVEMENTS', records: 'RECORDS', reset: 'Reset progress',
    resetConfirm: 'Reset all progress?', controls: 'SPACE / CLICK / TAP to jump · P to pause',
    flowHint: 'Graze obstacles to build Flow', newBest: '🎉 NEW BEST!'
  }
};

let lang = 'it';
try {
  const stored = localStorage.getItem('geom_lang');
  const site = localStorage.getItem('site_lang') || localStorage.getItem('lang');
  lang = stored === 'en' || stored === 'it' ? stored : String(site).slice(0, 2) === 'en' ? 'en' : 'it';
} catch (e) { /* default */ }

export function getLang() { return lang; }
export function setLang(value) {
  lang = value === 'en' ? 'en' : 'it';
  try { localStorage.setItem('geom_lang', lang); } catch (e) { /* ignore */ }
}
export function t(key) { return (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key; }

const $ = id => document.getElementById(id);
let toastTimer = 0;

export function showScreen(name) {
  ['menu', 'game', 'results', 'pause'].forEach(screen => {
    const el = $(screen + 'Screen');
    if (el) el.classList.toggle('on', screen === name);
  });
  document.body.dataset.screen = name;
}

export function setMessage(text, tone = '') {
  const el = $('gameMessage');
  if (!el) return;
  el.textContent = text;
  el.className = 'game-message' + (tone ? ' ' + tone : '');
}

export function toast(text) {
  const el = $('toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 1800);
}

export function updateHUD(data) {
  $('score').textContent = data.score;
  $('best').textContent = data.best || '—';
  $('near').textContent = data.near;
  $('flowFill').style.width = Math.round(data.flow) + '%';
  $('flowText').textContent = Math.round(data.flow) + '%';
  $('flowBar').classList.toggle('full', data.flow >= 100);
  $('chapterName').textContent = data.chapterName;
  const progress = $('progressFill');
  if (progress) {
    progress.style.width = Math.round(data.progress * 100) + '%';
    $('progressWrap').classList.toggle('hidden', !data.hasProgress);
  }
}

export function renderChapters() {
  const grid = $('chapterGrid');
  if (!grid) return;
  grid.innerHTML = '';
  CHAPTERS.forEach((chapter, index) => {
    const unlocked = index === 0 || state.wins[index - 1];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chapter-card' + (state.settings.chapter === index ? ' active' : '') + (unlocked ? '' : ' locked');
    button.style.setProperty('--chapter', chapter.accent);
    button.innerHTML = `<span class="chapter-num">0${index + 1}</span>
      <b>${chapter.name}</b><small>${unlocked ? chapter.subtitle : t('unlockNext')}</small>`;
    button.disabled = !unlocked;
    button.onclick = () => {
      window.dispatchEvent(new CustomEvent('geom:chapter', { detail: index }));
    };
    grid.appendChild(button);
  });
}

export function renderAchievements() {
  const list = $('achievementList');
  if (!list) return;
  list.innerHTML = ACHIEVEMENTS.map(a =>
    `<div class="ach ${state.achievements[a.id] ? 'done' : ''}"><span>${a.icon}</span><b>${a.label}</b></div>`).join('');
}

export function renderSettings() {
  document.querySelectorAll('[data-mode]').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === state.settings.mode));
  document.querySelectorAll('[data-difficulty]').forEach(btn => btn.classList.toggle('active', btn.dataset.difficulty === state.settings.difficulty));
  document.querySelectorAll('[data-skin]').forEach(btn => btn.classList.toggle('active', btn.dataset.skin === state.settings.skin));
  $('soundBtn').textContent = state.settings.sound ? '🔊' : '🔇';
  $('langBtn').textContent = lang === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  renderChapters();
  renderAchievements();
}

export function showResults({ won, score, best, distance, near, isRecord, mode }) {
  $('resultTitle').textContent = won ? t('won') : t('died');
  $('resultScore').textContent = score;
  $('resultBest').textContent = best;
  $('resultDistance').textContent = Math.floor(distance) + ' m';
  $('resultNear').textContent = near;
  $('recordBadge').classList.toggle('hidden', !isRecord);
  $('resultPanel').classList.toggle('victory', !!won);
  showScreen('results');
}

export function applyLanguage() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  renderSettings();
}

export function initUI(callbacks) {
  applyLanguage();
  const on = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
  on('startBtn', callbacks.onStart);
  on('pauseBtn', callbacks.onPause);
  on('resumeBtn', callbacks.onResume);
  on('restartBtn', callbacks.onRestart);
  on('resultsAgain', callbacks.onRestart);
  on('resultsMenu', callbacks.onMenu);
  on('soundBtn', callbacks.onSound);
  on('langBtn', () => { setLang(lang === 'it' ? 'en' : 'it'); applyLanguage(); });
  on('resetBtn', callbacks.onReset);

  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.onclick = () => callbacks.onMode?.(btn.dataset.mode);
  });
  document.querySelectorAll('[data-difficulty]').forEach(btn => {
    btn.onclick = () => callbacks.onDifficulty?.(btn.dataset.difficulty);
  });
  document.querySelectorAll('[data-skin]').forEach(btn => {
    btn.onclick = () => callbacks.onSkin?.(btn.dataset.skin);
  });
  window.addEventListener('geom:chapter', e => callbacks.onChapter?.(e.detail));
  showScreen('menu');
}
