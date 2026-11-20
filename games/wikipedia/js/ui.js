/* Rendering e gestione degli eventi DOM */

import { TIERS, PRESETS } from './difficulty.js';
import { state } from './state.js';
import { t, getLang, setLang } from './i18n.js';

const $ = id => document.getElementById(id);

const RING_CIRCUMFERENCE = 2 * Math.PI * 26;
let handlers = {};
let selectedMode = 'quiz';
let selectedPreset = 'normal';

export function getSelectedMode() { return selectedMode; }
export function getSelectedPreset() { return selectedPreset; }

function emitEvent(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.documentElement.lang = getLang();
  $('langBtn').textContent = getLang() === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  $('btnKnow').textContent = t('classic.know');
  $('btnDontKnow').textContent = t('classic.dontknow');
  renderMenuLabels();
  if (state.current) renderQuestion(state.current);
}

function renderMenuLabels() {
  $('modeGrid').innerHTML = '';
  [
    ['quiz', '🧠', 'menu.mode.quiz', 'menu.mode.quiz.desc'],
    ['classic', '💬', 'menu.mode.classic', 'menu.mode.classic.desc']
  ].forEach(([id, icon, nameKey, descKey]) => {
    const card = document.createElement('div');
    card.className = 'mode-card' + (selectedMode === id ? ' active' : '');
    card.innerHTML =
      '<span class="mode-icon">' + icon + '</span>' +
      '<span class="mode-name">' + t(nameKey) + '</span>' +
      '<span class="mode-desc">' + t(descKey) + '</span>';
    card.addEventListener('click', () => {
      selectedMode = id;
      renderMenuLabels();
      handlers.onMode && handlers.onMode(id);
    });
    $('modeGrid').appendChild(card);
  });

  $('presetGrid').innerHTML = '';
  Object.keys(PRESETS).forEach(id => {
    const preset = PRESETS[id];
    const card = document.createElement('div');
    card.className = 'preset-card' + (selectedPreset === id ? ' active' : '');
    card.innerHTML =
      '<span class="preset-name">' + t('preset.' + id + '.name') + '</span>' +
      '<span class="preset-desc">' + t('preset.' + id + '.desc') + '</span>';
    card.addEventListener('click', () => {
      selectedPreset = id;
      renderMenuLabels();
      updateBestLabel();
      handlers.onPreset && handlers.onPreset(id);
    });
    $('presetGrid').appendChild(card);
  });
  updateBestLabel();
}

function updateBestLabel() {
  const best = handlers.getBest && handlers.getBest(selectedMode, selectedPreset);
  $('bestLabel').textContent = best
    ? t('menu.best', { score: best.score.toLocaleString() })
    : t('menu.noBest');
}

function showView(name) {
  ['menuView', 'gameView', 'resultsView'].forEach(id => $(id).classList.add('hidden'));
  $(name + 'View').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function showMenu() {
  showView('menu');
  renderMenuLabels();
}

export function showLoading() {
  showView('game');
  $('feedback').className = 'feedback info';
  $('feedback').textContent = t('status.loading');
}

export function showOfflineNotice() {
  $('offlineNotice').textContent = t('status.offlineNotice');
  $('offlineNotice').classList.remove('hidden');
}

export function renderQuestion(question) {
  const s = state;
  const tier = TIERS[question.tier] || TIERS[0];
  $('feedback').className = 'feedback hidden';
  $('card').style.setProperty('--tier', tier.color);
  $('tierBadge').textContent = t('tier.' + tier.id);
  $('fameFill').style.width = Math.max(4, Math.min(100, (question.article.fame / 5) * 100)).toFixed(0) + '%';

  if (question.article.image) {
    $('wikiImage').src = question.article.image;
    $('wikiImage').classList.remove('hidden');
    $('imagePlaceholder').classList.add('hidden');
  } else {
    $('wikiImage').classList.add('hidden');
    $('imagePlaceholder').classList.remove('hidden');
  }

  const isQuiz = s.mode === 'quiz';
  $('promptText').textContent = t(isQuiz ? 'quiz.prompt' : 'classic.prompt');
  $('articleTitle').classList.toggle('hidden', isQuiz);
  $('articleTitle').textContent = isQuiz ? '' : question.article.title;
  $('extract').textContent = question.article.extract;
  $('answerGrid').classList.toggle('hidden', !isQuiz);
  $('binaryGrid').classList.toggle('hidden', isQuiz);
  $('hintBar').classList.toggle('hidden', !isQuiz);
  $('hintReveal').classList.add('hidden');
  $('hintReveal').textContent = '';

  $('answerGrid').innerHTML = '';
  if (isQuiz) {
    question.options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer-btn';
      btn.innerHTML = '<span class="label"></span><span class="num">' + (index + 1) + '</span>';
      btn.querySelector('.label').textContent = option.title;
      btn.addEventListener('click', () => handlers.onAnswer && handlers.onAnswer(index));
      $('answerGrid').appendChild(btn);
    });
  }

  $('hintFirst').textContent = t('hint.first') + ' · ' + t('hint.cost', { n: hintCostFor(question) });
  $('hintEliminate').textContent = t('hint.eliminate') + ' · ' + t('hint.cost', { n: hintCostFor(question) });
  $('hintFirst').disabled = false;
  $('hintEliminate').disabled = false;

  updateHUD();
  updateTimer(s.timeLeft, s.timeLimit);
}

function hintCostFor(question) {
  return Math.round(35 * (TIERS[question.tier] || TIERS[0]).mult);
}

export function updateHUD() {
  const s = state;
  $('hudScore').textContent = Math.max(0, s.score).toLocaleString();
  $('hudStreak').textContent = '×' + (1 + Math.min(s.streak, 8) * 0.25).toFixed(2).replace(/\.00$/, '');
  $('hudLives').textContent = s.lives > 0 ? '♥ '.repeat(s.lives).trim() : '—';
  $('hudRound').textContent = Math.min(s.round + 1, s.deck.length) + '/' + s.deck.length;
  $('roundFill').style.width = (s.deck.length ? (s.round / s.deck.length) * 100 : 0).toFixed(1) + '%';
}

export function updateTimer(left, limit) {
  const ratio = Math.max(0, Math.min(1, limit > 0 ? left / limit : 0));
  $('timerRing').style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - ratio));
  $('timerText').textContent = Math.ceil(left / 1000) + 's';
  $('timer').classList.toggle('low', ratio < 0.28);
}

export function showFeedback(kind, text) {
  const el = $('feedback');
  el.className = 'feedback ' + kind;
  el.textContent = text;
}

export function markAnswers(correctIndex, chosenIndex) {
  const buttons = $('answerGrid').querySelectorAll('.answer-btn');
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIndex) btn.classList.add('correct');
    else if (i === chosenIndex) btn.classList.add('wrong');
    else btn.classList.add('removed');
  });
}

export function applyHintFirst(letter) {
  const el = $('hintReveal');
  el.textContent = t('hint.first.reveal', { letter: letter.toUpperCase() });
  el.classList.remove('hidden');
  $('hintFirst').disabled = true;
}

export function applyHintEliminate(index) {
  const btn = $('answerGrid').querySelectorAll('.answer-btn')[index];
  if (btn) { btn.disabled = true; btn.classList.add('removed'); }
  if (state.removedIndex >= 0) {
    const prev = $('answerGrid').querySelectorAll('.answer-btn')[state.removedIndex];
    if (prev) { prev.disabled = false; prev.classList.remove('removed'); }
  }
  $('hintEliminate').disabled = true;
}

export function disableHints() {
  $('hintFirst').disabled = true;
  $('hintEliminate').disabled = true;
}

export function showResults(data) {
  showView('results');
  $('finalScore').textContent = data.score.toLocaleString();
  $('newBest').classList.toggle('hidden', !data.isNew);
  $('rankLabel').textContent = t('results.rank') + ': ' + t('results.rank.' + data.rank);
  $('resultStats').innerHTML =
    '<div class="result-stat"><b>' + data.correct + '</b><span>' + t('results.correct') + '</span></div>' +
    '<div class="result-stat"><b>' + data.wrong + '</b><span>' + t('results.wrong') + '</span></div>' +
    '<div class="result-stat"><b>' + data.skipped + '</b><span>' + t('results.skipped') + '</span></div>';

  $('resultList').innerHTML = '';
  data.history.forEach(item => {
    const tier = TIERS[item.tier] || TIERS[0];
    const li = document.createElement('li');
    const color = item.kind === 'correct' ? 'var(--good)' : item.kind === 'skip' ? 'var(--gold)' : 'var(--bad)';
    li.innerHTML =
      '<span class="result-dot" style="background:' + color + '"></span>' +
      '<span class="result-title"></span>' +
      '<span class="result-tier" style="color:' + tier.color + '">' + t('tier.' + tier.id) + '</span>' +
      '<a class="result-tier" href="' + encodeURI(item.url) + '" target="_blank" rel="noopener">↗</a>';
    li.querySelector('.result-title').textContent = item.title;
    $('resultList').appendChild(li);
  });
}

export function initUI(callbacks) {
  handlers = callbacks || {};
  applyTranslations();
  showMenu();

  $('langBtn').addEventListener('click', () => {
    setLang(getLang() === 'it' ? 'en' : 'it');
  });
  $('startBtn').addEventListener('click', () => handlers.onStart && handlers.onStart());
  $('againBtn').addEventListener('click', () => handlers.onAgain && handlers.onAgain());
  $('menuBtn').addEventListener('click', () => handlers.onMenu && handlers.onMenu());
  $('btnKnow').addEventListener('click', () => handlers.onAnswer && handlers.onAnswer('know'));
  $('btnDontKnow').addEventListener('click', () => handlers.onAnswer && handlers.onAnswer('dontknow'));
  $('hintFirst').addEventListener('click', () => handlers.onHint && handlers.onHint('first'));
  $('hintEliminate').addEventListener('click', () => handlers.onHint && handlers.onHint('eliminate'));

  window.addEventListener('keydown', event => {
    if (!state.running || state.loading || state.locked) return;
    const key = event.key;
    if (key >= '1' && key <= '4' && state.mode === 'quiz') {
      const idx = Number(key) - 1;
      if (idx < state.current.options.length) handlers.onAnswer && handlers.onAnswer(idx);
    } else if (state.mode === 'classic' && (key === 'ArrowRight' || key === ' ')) {
      event.preventDefault(); handlers.onAnswer && handlers.onAnswer('know');
    } else if (state.mode === 'classic' && key === 'ArrowLeft') {
      handlers.onAnswer && handlers.onAnswer('dontknow');
    } else if (key === 'h' || key === 'H') {
      handlers.onHint && handlers.onHint('first');
    } else if (key === 'Escape') {
      handlers.onMenu && handlers.onMenu();
    }
  });

  import('./i18n.js').then(mod => mod.onLangChange(applyTranslations));
  emitEvent('td:ui-ready');
}

export { applyTranslations, updateBestLabel };
