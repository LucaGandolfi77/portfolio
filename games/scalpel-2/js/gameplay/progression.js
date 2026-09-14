/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Progression System
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Progression = (function() {
  'use strict';

  var save = null;

  function load() {
    save = S2.Save.load();
    return save;
  }

  function completeChapter(chapterId, results) {
    if (!save) load();

    if (!save.completed) save.completed = {};
    if (!save.scores) save.scores = {};
    if (!save.bestGrades) save.bestGrades = {};

    save.completed[chapterId] = true;

    if (!save.scores[chapterId] || results.score > save.scores[chapterId]) {
      save.scores[chapterId] = results.score;
    }

    var currentBest = save.bestGrades[chapterId] || 'D';
    var grades = ['D', 'C', 'B', 'A', 'S'];
    if (grades.indexOf(results.grade) > grades.indexOf(currentBest)) {
      save.bestGrades[chapterId] = results.grade;
    }

    S2.Save.save(save);
  }

  function isChapterUnlocked(chapterId) {
    if (!save) load();
    if (chapterId === 1) return true;
    return save.completed && save.completed[chapterId - 1];
  }

  function getChapterScore(chapterId) {
    if (!save) load();
    return save.scores ? save.scores[chapterId] : 0;
  }

  function getChapterGrade(chapterId) {
    if (!save) load();
    return save.bestGrades ? save.bestGrades[chapterId] : null;
  }

  function getCompletedCount() {
    if (!save) load();
    if (!save.completed) return 0;
    return Object.keys(save.completed).length;
  }

  function getTotalScore() {
    if (!save) load();
    if (!save.scores) return 0;
    var total = 0;
    for (var key in save.scores) {
      total += save.scores[key];
    }
    return total;
  }

  return {
    load: load,
    completeChapter: completeChapter,
    isChapterUnlocked: isChapterUnlocked,
    getChapterScore: getChapterScore,
    getChapterGrade: getChapterGrade,
    getCompletedCount: getCompletedCount,
    getTotalScore: getTotalScore
  };

})();

window.S2 = window.S2 || {};
window.S2.Progression = S2.Progression;
