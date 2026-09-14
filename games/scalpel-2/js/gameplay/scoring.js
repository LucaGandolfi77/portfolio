/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Scoring System
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Scoring = (function() {
  'use strict';

  var score = 0;
  var combo = 0;
  var maxCombo = 0;
  var totalAccuracy = 0;
  var stepCount = 0;

  function reset() {
    score = 0;
    combo = 0;
    maxCombo = 0;
    totalAccuracy = 0;
    stepCount = 0;
  }

  function addStepScore(accuracy, timeBonus) {
    stepCount++;
    totalAccuracy += accuracy;

    if (accuracy >= 80) {
      combo++;
      if (combo > maxCombo) maxCombo = combo;
    } else {
      combo = 0;
    }

    var baseScore = accuracy * 10;
    var comboBonus = combo * 50;
    var timeBonusVal = timeBonus || 0;

    var stepScore = baseScore + comboBonus + timeBonusVal;
    score += stepScore;

    S2.HUD.updateScore(score);
    S2.HUD.updateCombo(combo);

    return stepScore;
  }

  function getScore() {
    return score;
  }

  function getCombo() {
    return combo;
  }

  function getMaxCombo() {
    return maxCombo;
  }

  function getAccuracy() {
    if (stepCount === 0) return 0;
    return Math.round(totalAccuracy / stepCount);
  }

  function getGrade() {
    return S2.Difficulty.getGrade(getAccuracy());
  }

  function getResults(timeStr) {
    return {
      score: score,
      accuracy: getAccuracy(),
      combo: combo,
      maxCombo: maxCombo,
      grade: getGrade().letter,
      gradeColor: getGrade().color,
      time: timeStr || '0:00'
    };
  }

  return {
    reset: reset,
    addStepScore: addStepScore,
    getScore: getScore,
    getCombo: getCombo,
    getMaxCombo: getMaxCombo,
    getAccuracy: getAccuracy,
    getGrade: getGrade,
    getResults: getResults
  };

})();

window.S2 = window.S2 || {};
window.S2.Scoring = S2.Scoring;
