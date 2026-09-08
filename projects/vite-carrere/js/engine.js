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
      totalTime: 0,
      achievements: [],
      stats: {
        chaptersCompleted: 0,
        minigamesCompleted: 0,
        minigamesSkipped: 0,
        wordsCollected: 0,
        breathCycles: 0,
        puzzlesSolved: 0,
        towerCleared: 0,
        fragmentsPerfect: 0,
        swipePerfect: 0,
        listeningPerfect: 0,
        totalMoves: 0
      }
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
      state.stats.chaptersCompleted++;
    }
    state.stats.minigamesCompleted++;
    if (result.skipped) state.stats.minigamesSkipped++;

    // Track specific minigame stats
    if (result.moves) state.stats.totalMoves += result.moves;
    if (result.collected) state.stats.wordsCollected += result.collected;
    if (result.cycles) state.stats.breathCycles += result.cycles;
    if (result.correct === result.total) state.stats.swipePerfect++;
    if (result.removed && result.removed >= 7) state.stats.towerCleared++;
    if (result.correct === true) state.stats.fragmentsPerfect++;
    if (result.answer === "Memoria" || result.answer === "Memory") state.stats.listeningPerfect++;

    var nextIdx = state.currentChapter + 1;
    if (nextIdx < DATA.CHAPTERS.length && !state.unlockedChapters.includes(nextIdx)) {
      state.unlockedChapters.push(nextIdx);
    }
    emit("minigameComplete", { chapterId: ch.id, result: result });
    checkAchievements();
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

  var ACHIEVEMENTS = [
    { id: "first_chapter", icon: "📖", title: { it: "Primo Capitolo", en: "First Chapter" }, desc: { it: "Completa il primo capitolo", en: "Complete the first chapter" } },
    { id: "all_chapters", icon: "📚", title: { it: "Lettore Completo", en: "Complete Reader" }, desc: { it: "Completa tutti gli 8 capitoli", en: "Complete all 8 chapters" } },
    { id: "all_quotes", icon: "📓", title: { it: "Quaderno Pieno", en: "Full Notebook" }, desc: { it: "Raccogli tutte le citazioni", en: "Collect all quotes" } },
    { id: "finale", icon: "🏁", title: { it: "Il Finale", en: "The Finale" }, desc: { it: "Arriva al finale", en: "Reach the finale" } },
    { id: "no_skip", icon: "🎯", title: { it: "Nessuna Scorciatoia", en: "No Shortcuts" }, desc: { it: "Completa un minigioco senza saltare", en: "Complete a minigame without skipping" } },
    { id: "all_no_skip", icon: "🏆", title: { it: "Perfezionista", en: "Perfectionist" }, desc: { it: "Completa tutti i minigiochi senza saltare", en: "Complete all minigames without skipping" } },
    { id: "puzzle_pro", icon: "🧩", title: { it: "Puzzle Master", en: "Puzzle Master" }, desc: { it: "Completa il puzzle in meno di 20 mosse", en: "Complete the puzzle in under 20 moves" } },
    { id: "tower_clear", icon: "🗼", title: { it: "Cacciatore di Bugie", en: "Lie Hunter" }, desc: { it: "Rimuovi tutte le bugie dalla torre", en: "Remove all lies from the tower" } },
    { id: "fragments_perfect", icon: "📜", title: { it: "Reconstructore", en: "Reconstructor" }, desc: { it: "Ricostruisci i frammenti senza errori", en: "Reconstruct fragments without errors" } },
    { id: "swipe_king", icon: "🃏", title: { it: "Reale o Fittizio", en: "Real or Fictional" }, desc: { it: "Rispondi correttamente a tutte le carte swipe", en: "Answer all swipe cards correctly" } },
    { id: "breath_master", icon: "🧘", title: { it: "Maestro del Respiro", en: "Breath Master" }, desc: { it: "Completa tutti i cicli di respirazione", en: "Complete all breathing cycles" } },
    { id: "gentle_collector", icon: "✨", title: { it: "Collezionista di Luce", en: "Light Collector" }, desc: { it: "Raccogli più di 10 parole nel gioco gentle", en: "Collect more than 10 words in the gentle game" } },
    { id: "multilingual", icon: "🌍", title: { it: "Bilingue", en: "Bilingual" }, desc: { it: "Cambia lingua almeno una volta", en: "Change language at least once" } },
    { id: "dark_mode", icon: "🌙", title: { it: "Notturno", en: "Night Owl" }, desc: { it: "Attiva la modalità scura", en: "Activate dark mode" } },
    { id: "bookworm", icon: "🐛", title: { it: "Vorace", en: "Bookworm" }, desc: { it: "Completa 5 capitoli in una sessione", en: "Complete 5 chapters in one session" } }
  ];

  function checkAchievements() {
    var newAchievements = [];

    function earn(id) {
      if (!state.achievements.includes(id)) {
        state.achievements.push(id);
        newAchievements.push(id);
      }
    }

    if (state.completedChapters.length >= 1) earn("first_chapter");
    if (state.completedChapters.length >= DATA.CHAPTERS.length) earn("all_chapters");
    if (state.collectedQuotes.length >= DATA.CHAPTERS.length) earn("all_quotes");
    if (state.finaleDone) earn("finale");
    if (state.stats.minigamesCompleted > 0 && state.stats.minigamesSkipped === 0) earn("no_skip");
    if (state.stats.minigamesCompleted >= 8 && state.stats.minigamesSkipped === 0) earn("all_no_skip");
    if (state.stats.totalMoves > 0 && state.stats.totalMoves < 20) earn("puzzle_pro");
    if (state.stats.towerCleared > 0) earn("tower_clear");
    if (state.stats.fragmentsPerfect > 0) earn("fragments_perfect");
    if (state.stats.swipePerfect > 0) earn("swipe_king");
    if (state.stats.breathCycles >= 5) earn("breath_master");
    if (state.stats.wordsCollected > 10) earn("gentle_collector");
    if (state.stats.chaptersCompleted >= 5) earn("bookworm");

    if (newAchievements.length > 0) {
      emit("achievementEarned", newAchievements);
    }
  }

  function earnAchievement(id) {
    if (!state.achievements.includes(id)) {
      state.achievements.push(id);
      emit("achievementEarned", [id]);
      save();
    }
  }

  function getAchievements() {
    return ACHIEVEMENTS.map(function (a) {
      return {
        id: a.id,
        icon: a.icon,
        title: a.title[I18n ? I18n.get() : "it"],
        desc: a.desc[I18n ? I18n.get() : "it"],
        earned: state.achievements.includes(a.id)
      };
    });
  }

  function getStats() {
    return state.stats;
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
    earnAchievement: earnAchievement,
    getAchievements: getAchievements,
    getStats: getStats,
    save: save,
    reset: reset,
    NUM_CHAPTERS: DATA.CHAPTERS.length
  };

})();
