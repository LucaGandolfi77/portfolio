/* Bootstrap del Wikipedia Game */

import { fetchArticles } from './api.js';
import { getFallbackPool } from './pool.js';
import { buildDeck, questionPoints, hintCost, rankFor, TIERS } from './difficulty.js';
import { state, resetGame, saveRecord, getRecord } from './state.js';
import * as ui from './ui.js';
import { t, getLang } from './i18n.js';

let timerId = null;

function stopTimer() {
  if (timerId) { clearInterval(timerId); timerId = null; }
}

function startTimer() {
  stopTimer();
  state.timeLimit = state.current.timeLimit;
  state.timeLeft = state.current.timeLimit;
  ui.updateTimer(state.timeLeft, state.timeLimit);
  timerId = setInterval(() => {
    if (!state.running || state.locked || !state.current) return;
    state.timeLeft -= 100;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      ui.updateTimer(0, state.timeLimit);
      answer(null, true);
      return;
    }
    ui.updateTimer(state.timeLeft, state.timeLimit);
  }, 100);
}

async function startGame() {
  stopTimer();
  const mode = ui.getSelectedMode();
  const preset = ui.getSelectedPreset();
  resetGame(mode, preset);
  ui.showLoading();

  let articles;
  try {
    articles = await fetchArticles(getLang(), 100);
  } catch (error) {
    console.warn('[WikiGame] fallback locale:', error && error.message);
    articles = getFallbackPool(getLang());
    state.usedFallback = true;
  }
  if (state.usedFallback) ui.showOfflineNotice();

  state.deck = buildDeck(articles, mode, preset);
  if (!state.deck.length) {
    ui.showOfflineNotice();
    ui.showMenu();
    return;
  }
  state.round = 0;
  showQuestion();
}

function showQuestion() {
  const question = state.deck[state.round];
  if (!question) { endGame(); return; }
  state.current = question;
  state.locked = false;
  state.hintFirst = false;
  state.removedIndex = -1;
  ui.renderQuestion(question);
  startTimer();
}

function answer(value, timedOut) {
  if (state.locked || !state.running || !state.current) return;
  state.locked = true;
  stopTimer();

  const question = state.current;
  const isQuiz = state.mode === 'quiz';
  const timeRatio = state.timeLimit ? state.timeLeft / state.timeLimit : 0;
  let kind = 'wrong';
  let points = 0;
  let feedbackKey = 'feedback.wrong';
  let feedbackClass = 'bad';

  if (timedOut) {
    kind = 'wrong';
    state.streak = 0;
    state.lives--;
    feedbackKey = 'feedback.timeout';
    feedbackClass = 'bad';
  } else if (isQuiz) {
    const correct = value === question.correctIndex;
    ui.markAnswers(question.correctIndex, value);
    if (correct) {
      kind = 'correct';
      points = questionPoints(question.tier, state.streak, timeRatio, 'quiz', true);
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      feedbackKey = 'feedback.correct';
      feedbackClass = 'good';
    } else {
      state.streak = 0;
      state.lives--;
    }
  } else if (value === 'know') {
    kind = 'correct';
    points = questionPoints(question.tier, state.streak, timeRatio, 'classic', true);
    state.streak++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    feedbackKey = 'feedback.correct';
    feedbackClass = 'good';
  } else {
    kind = 'skip';
    points = questionPoints(question.tier, 0, 0, 'classic', false);
    state.streak = 0;
    feedbackKey = 'feedback.skipped';
    feedbackClass = 'info';
  }

  state.score = Math.max(0, state.score + points);
  state.history.push({
    title: question.article.title,
    url: question.article.url,
    tier: question.tier,
    kind,
    points
  });
  ui.updateHUD();
  ui.showFeedback(feedbackClass, t(feedbackKey) + (points > 0 ? '  +' + points : ''));

  setTimeout(() => {
    state.round++;
    if (state.lives <= 0 || state.round >= state.deck.length) endGame();
    else showQuestion();
  }, 950);
}

function useHint(type) {
  if (state.locked || !state.running || state.mode !== 'quiz' || !state.current) return;
  const question = state.current;
  const cost = hintCost(question.tier);

  if (type === 'first') {
    if (state.hintFirst) return;
    state.hintFirst = true;
    state.score = Math.max(0, state.score - cost);
    const correct = question.options[question.correctIndex];
    ui.applyHintFirst((correct.title || '?').charAt(0));
  } else {
    if (state.removedIndex >= 0) return;
    const wrong = question.options.map((_, i) => i).filter(i => i !== question.correctIndex);
    if (!wrong.length) return;
    const index = wrong[Math.floor(Math.random() * wrong.length)];
    state.removedIndex = index;
    state.score = Math.max(0, state.score - cost);
    ui.applyHintEliminate(index);
  }
  state.hintsUsed++;
  ui.updateHUD();
}

function endGame() {
  stopTimer();
  state.running = false;
  state.ended = true;

  const correct = state.history.filter(h => h.kind === 'correct').length;
  const wrong = state.history.filter(h => h.kind === 'wrong').length;
  const skipped = state.history.filter(h => h.kind === 'skip').length;
  const isNew = saveRecord(state.mode, state.preset, state.score, state.deck.length);

  ui.showResults({
    score: state.score,
    isNew,
    rank: rankFor(state.score, state.deck.length),
    history: state.history,
    correct,
    wrong,
    skipped
  });
}

function toMenu() {
  stopTimer();
  state.running = false;
  state.current = null;
  ui.showMenu();
}

ui.initUI({
  onStart: startGame,
  onAgain: startGame,
  onAnswer: answer,
  onHint: useHint,
  onMenu: toMenu,
  getBest: (mode, preset) => getRecord(mode, preset)
});
