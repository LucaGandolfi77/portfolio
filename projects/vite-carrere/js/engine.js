"use strict";

var Engine = (function () {

  var SAVE_KEY = "vite-carrere-save-v1";
  var AUTOSAVE_MS = 5000;

  var state = null;
  var saveInterval = null;
  var listeners = {};

  function on(evt, fn) {
    if (!listeners[evt]) listeners[evt] = [];
    listeners[evt].push(fn);
  }

  function emit(evt, data) {
    (listeners[evt] || []).forEach(function (fn) { fn(data); });
  }

  function createDefault() {
    return {
      screen: "title",
      currentChapter: -1,
      unlockedChapters: [0],
      completedChapters: [],
      collectedQuotes: [],
      minigameResults: {},
      narrativeIndex: 0,
      narrativeDone: false,
      minigameDone: false,
      finaleDone: false,
      totalTime: 0
    };
  }

  function init() {
    var saved = load();
    state = saved || createDefault();
    startAutoSave();
    emit("init", state);
  }

  function startAutoSave() {
    if (saveInterval) clearInterval(saveInterval);
    saveInterval = setInterval(function () { save(); }, AUTOSAVE_MS);
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) { }
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function reset() {
    localStorage.removeItem(SAVE_KEY);
    state = createDefault();
    emit("stateChange", state);
  }

  function getState() {
    return state;
  }

  function setScreen(screen) {
    state.screen = screen;
    emit("stateChange", state);
  }

  function openChapter(index) {
    if (index < 0 || index >= DATA.CHAPTERS.length) return;
    if (!state.unlockedChapters.includes(index)) return;
    state.currentChapter = index;
    state.narrativeIndex = 0;
    state.narrativeDone = false;
    state.minigameDone = false;
    state.screen = "chapter";
    emit("stateChange", state);
  }

  function advanceNarrative() {
    var ch = DATA.CHAPTERS[state.currentChapter];
    if (!ch) return false;
    if (state.narrativeIndex < ch.narrative.length - 1) {
      state.narrativeIndex++;
      emit("narrativeAdvance", state.narrativeIndex);
      return true;
    }
    state.narrativeDone = true;
    emit("narrativeComplete", {});
    return false;
  }

  function skipNarrative() {
    var ch = DATA.CHAPTERS[state.currentChapter];
    if (!ch) return;
    state.narrativeIndex = ch.narrative.length - 1;
    state.narrativeDone = true;
    emit("narrativeComplete", {});
  }

  function completeMinigame(result) {
    state.minigameDone = true;
    var ch = DATA.CHAPTERS[state.currentChapter];
    if (!ch) return;
    state.minigameResults[ch.id] = result;
    if (!state.collectedQuotes.includes(ch.id)) {
      state.collectedQuotes.push(ch.id);
      emit("quoteCollected", ch);
    }
    if (!state.completedChapters.includes(state.currentChapter)) {
      state.completedChapters.push(state.currentChapter);
    }
    var nextIdx = state.currentChapter + 1;
    if (nextIdx < DATA.CHAPTERS.length && !state.unlockedChapters.includes(nextIdx)) {
      state.unlockedChapters.push(nextIdx);
    }
    emit("minigameComplete", { chapterId: ch.id, result: result });
    save();
  }

  function finishChapter() {
    state.screen = "map";
    state.currentChapter = -1;
    emit("stateChange", state);
  }

  function showQuaderno() {
    state.screen = "quaderno";
    emit("stateChange", state);
  }

  function showFinale() {
    if (state.completedChapters.length < DATA.CHAPTERS.length) return;
    state.screen = "finale";
    state.finaleDone = true;
    emit("stateChange", state);
    save();
  }

  function allChaptersDone() {
    return state.completedChapters.length >= DATA.CHAPTERS.length;
  }

  return {
    init: init,
    on: on,
    getState: getState,
    setScreen: setScreen,
    openChapter: openChapter,
    advanceNarrative: advanceNarrative,
    skipNarrative: skipNarrative,
    completeMinigame: completeMinigame,
    finishChapter: finishChapter,
    showQuaderno: showQuaderno,
    showFinale: showFinale,
    allChaptersDone: allChaptersDone,
    save: save,
    reset: reset,
    NUM_CHAPTERS: DATA.CHAPTERS.length
  };

})();
