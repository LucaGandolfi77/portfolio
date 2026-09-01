(function () {
  'use strict';

  const engine = window.QuoteSmith;
  let database = [];
  const state = {
    lang: localStorage.getItem('quotesmith.lang') || 'en',
    categories: [],
    difficulty: 'easy',
    round: [],
    questionIndex: 0,
    score: 0,
    streak: 0,
    bestRoundStreak: 0,
    answered: false,
    answers: [],
    bestScore: 0,
    bestStreak: 0,
  };

  const T = {
    en: {
      hintEmpty: 'Pick one or more worlds — the round mixes them.',
      hintOne: '1 world · {n} quotes',
      hintMany: '{m} worlds · {n} quotes',
      all: 'All',
      none: 'None',
    },
    it: {
      hintEmpty: 'Scegli uno o più mondi: il round li mescola.',
      hintOne: '1 mondo · {n} citazioni',
      hintMany: '{m} mondi · {n} citazioni',
      all: 'Tutti',
      none: 'Nessuno',
    },
  };

  const $ = (id) => document.getElementById(id);
  const screens = { setup: $('screen-setup'), game: $('screen-game'), results: $('screen-results') };

  function loadBest() {
    try {
      const best = JSON.parse(localStorage.getItem('quotesmith.best') || '{}');
      state.bestScore = Number(best.score) || 0;
      state.bestStreak = Number(best.streak) || 0;
    } catch (error) { state.bestScore = 0; state.bestStreak = 0; }
  }

  function saveBest() {
    state.bestScore = Math.max(state.bestScore, state.score);
    state.bestStreak = Math.max(state.bestStreak, state.bestRoundStreak);
    try { localStorage.setItem('quotesmith.best', JSON.stringify({ score: state.bestScore, streak: state.bestStreak })); } catch (error) { /* private mode */ }
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, screen]) => {
      const active = key === name;
      screen.hidden = !active;
      screen.classList.toggle('is-active', active);
    });
    window.scrollTo(0, 0);
  }

  function renderLanguages() {
    const wrapper = $('language-choices');
    wrapper.innerHTML = '';
    engine.LANGUAGES.forEach((language) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-button language-choice' + (state.lang === language.key ? ' selected' : '');
      button.innerHTML = `<strong>${language.flag}</strong><span>${language.label}</span>`;
      button.setAttribute('aria-pressed', String(state.lang === language.key));
      button.addEventListener('click', () => {
        state.lang = language.key;
        localStorage.setItem('quotesmith.lang', state.lang);
        renderSetup();
      });
      wrapper.appendChild(button);
    });
  }

  function renderCategories() {
    const wrapper = $('category-choices');
    wrapper.innerHTML = '';
    engine.CATEGORIES.forEach((category) => {
      const count = engine.filterQuotes(database, { category: [category.key], lang: state.lang }).length;
      const selected = state.categories.indexOf(category.key) !== -1;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'category-choice' + (selected ? ' selected' : '');
      button.innerHTML = `<span class="category-icon" aria-hidden="true">${category.icon}</span><span class="category-name">${category.name[state.lang]}</span><span class="category-count">${count} ${state.lang === 'it' ? 'citazioni' : 'quotes'}</span>`;
      button.setAttribute('aria-pressed', String(selected));
      button.addEventListener('click', () => {
        const index = state.categories.indexOf(category.key);
        if (index === -1) state.categories.push(category.key);
        else state.categories.splice(index, 1);
        renderCategories();
        updateStart();
      });
      wrapper.appendChild(button);
    });

    const allButton = $('categories-all');
    const noneButton = $('categories-none');
    if (allButton && noneButton) {
      allButton.textContent = T[state.lang].all;
      noneButton.textContent = T[state.lang].none;
      allButton.disabled = state.categories.length === engine.CATEGORIES.length;
      noneButton.disabled = state.categories.length === 0;
    }
  }

  function categoryHint() {
    const t = T[state.lang];
    if (state.categories.length === 0) return t.hintEmpty;
    const total = engine.filterQuotes(database, { category: state.categories, lang: state.lang, difficulty: state.difficulty }).length;
    const count = state.categories.length;
    const n = total.toLocaleString(state.lang === 'it' ? 'it-IT' : 'en-US');
    return state.categories.length === 1 ? t.hintOne.replace('{n}', n) : t.hintMany.replace('{m}', count).replace('{n}', n);
  }

  function renderDifficulties() {
    const wrapper = $('difficulty-choices');
    wrapper.innerHTML = '';
    engine.DIFFICULTIES.forEach((difficulty) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'difficulty-choice' + (state.difficulty === difficulty.key ? ' selected' : '');
      button.innerHTML = `<strong>${difficulty.name[state.lang]}</strong><span>${difficulty.hint[state.lang]}</span>`;
      button.setAttribute('aria-pressed', String(state.difficulty === difficulty.key));
      button.addEventListener('click', () => { state.difficulty = difficulty.key; renderDifficulties(); });
      wrapper.appendChild(button);
    });
  }

  function renderSetup() {
    renderLanguages();
    renderCategories();
    renderDifficulties();
    updateStart();
    $('language-toggle').textContent = state.lang.toUpperCase();
    $('personal-best').textContent = state.bestScore || state.bestStreak
      ? `Personal best ${state.bestScore}/10 · best streak ${state.bestStreak}`
      : 'No record yet. Make the first one.';
  }

  function updateStart() {
    $('start-button').disabled = state.categories.length === 0;
    const hint = $('category-hint');
    if (hint) hint.textContent = categoryHint();
  }

  function startRound() {
    const selected = state.categories.length
      ? state.categories.slice()
      : engine.CATEGORIES.map((category) => category.key);
    state.round = engine.buildRound(database, { category: selected, lang: state.lang, difficulty: state.difficulty, count: engine.ROUND_SIZE });
    state.questionIndex = 0;
    state.score = 0;
    state.streak = 0;
    state.bestRoundStreak = 0;
    state.answers = [];
    showScreen('game');
    renderQuestion();
  }

  function renderQuestion() {
    const question = state.round[state.questionIndex];
    if (!question) return finishRound();
    state.answered = false;
    $('progress-label').textContent = `${state.questionIndex + 1} / ${state.round.length}`;
    $('progress-bar').style.width = `${((state.questionIndex + 1) / state.round.length) * 100}%`;
    $('question-category').textContent = engine.categoryName(question.category, state.lang);
    $('question-difficulty').textContent = engine.difficultyName(question.difficulty, state.lang);
    $('question-title').textContent = question.text;
    $('feedback').hidden = true;
    $('next-button').hidden = true;
    $('streak').hidden = state.streak < 2;
    $('streak').textContent = `${state.streak} streak`;

    const wrapper = $('answer-choices');
    wrapper.innerHTML = '';
    question.options.forEach((author, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-choice';
      button.textContent = author;
      button.addEventListener('click', () => answerQuestion(index));
      wrapper.appendChild(button);
    });
  }

  function answerQuestion(index) {
    if (state.answered) return;
    state.answered = true;
    const question = state.round[state.questionIndex];
    const correct = index === question.correct;
    state.answers[state.questionIndex] = correct;
    if (correct) {
      state.score += 1;
      state.streak += 1;
      state.bestRoundStreak = Math.max(state.bestRoundStreak, state.streak);
      if (navigator.vibrate) navigator.vibrate(25);
    } else {
      state.streak = 0;
      if (navigator.vibrate) navigator.vibrate([35, 30, 35]);
    }
    document.querySelectorAll('.answer-choice').forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === question.correct) button.classList.add('correct');
      else if (buttonIndex === index) button.classList.add('incorrect');
      else button.classList.add('muted-answer');
    });
    const feedback = $('feedback');
    feedback.hidden = false;
    feedback.className = `feedback ${correct ? 'is-correct' : 'is-incorrect'}`;
    feedback.textContent = correct ? `Correct · ${question.author}` : `The answer was ${question.author}`;
    $('next-button').hidden = false;
    $('streak').hidden = state.streak < 2;
    $('streak').textContent = `${state.streak} streak`;
  }

  function nextQuestion() { state.questionIndex += 1; renderQuestion(); }

  function finishRound() {
    saveBest();
    $('result-score').textContent = state.score;
    $('result-streak').textContent = state.bestRoundStreak;
    $('result-best').textContent = `${state.bestScore}/10`;
    $('result-rating').textContent = engine.scoreLabel(state.score, state.round.length, state.lang);
    const wrapper = $('review-list');
    wrapper.innerHTML = '';
    state.round.forEach((question, index) => {
      const item = document.createElement('div');
      item.className = `review-item ${state.answers[index] ? 'correct' : 'incorrect'}`;
      item.innerHTML = `<span class="review-mark" aria-hidden="true">${state.answers[index] ? '✓' : '×'}</span><span><strong>${question.text}</strong><small>${question.author}</small></span>`;
      wrapper.appendChild(item);
    });
    showScreen('results');
    if (state.score >= 8) celebrate();
  }

  function celebrate() {
    const layer = $('confetti-layer');
    layer.innerHTML = '';
    ['#e9c46a', '#2a9d8f', '#e76f51', '#f4f1de', '#6d9dc5'].forEach((color, colorIndex) => {
      for (let i = 0; i < 12; i += 1) {
        const piece = document.createElement('i');
        piece.style.setProperty('--color', color);
        piece.style.setProperty('--x', `${(colorIndex * 20) + Math.random() * 20}%`);
        piece.style.setProperty('--delay', `${Math.random() * 0.3}s`);
        layer.appendChild(piece);
      }
    });
    window.setTimeout(() => { layer.innerHTML = ''; }, 2400);
  }

  function listen() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance($('question-title').textContent);
    utterance.lang = state.lang === 'it' ? 'it-IT' : 'en-US';
    window.speechSynthesis.speak(utterance);
  }

  function init() {
    loadBest();
    // Quotes now live in quotes.json, loaded asynchronously by data.js.
    window.QUOTESMITH_READY
      .then((db) => { database = (db && db.QUOTES) || []; })
      .catch(() => { database = []; })
      .then(() => {
        renderSetup();
        $('start-button').addEventListener('click', startRound);
        $('categories-all').addEventListener('click', () => {
          state.categories = engine.CATEGORIES.map((category) => category.key);
          renderCategories();
          updateStart();
        });
        $('categories-none').addEventListener('click', () => {
          state.categories = [];
          renderCategories();
          updateStart();
        });
        $('next-button').addEventListener('click', nextQuestion);
        $('listen-button').addEventListener('click', listen);
        $('quit-button').addEventListener('click', () => { showScreen('setup'); renderSetup(); });
        $('retry-button').addEventListener('click', startRound);
        $('results-menu-button').addEventListener('click', () => { showScreen('setup'); renderSetup(); });
        $('language-toggle').addEventListener('click', () => {
          state.lang = state.lang === 'en' ? 'it' : 'en';
          localStorage.setItem('quotesmith.lang', state.lang);
          renderSetup();
        });
        if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
        window.__quoteSmithState = state;
      });
  }

  document.addEventListener('DOMContentLoaded', init);
}());
