/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Speed Run Mode
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Speed = (function() {
  'use strict';

  var startTime = 0;
  var splits = [];

  function showSelect() {
    S2.StateMachine.transition(S2.StateMachine.STATES.SPEED_SELECT);

    var html = '<h1>SPEED RUN</h1>';
    html += '<h2>Complete surgeries as fast as possible</h2>';
    html += '<div class="chapter-list">';

    var chapters = S2.Chapters;
    for (var i = 0; i < chapters.length; i++) {
      var ch = chapters[i];
      var patient = S2.Patients[ch.patient];

      html += '<div class="chapter-card" data-chapter="' + ch.id + '">';
      html += '<div class="ch-icon">' + (patient ? patient.emoji : '🏥') + '</div>';
      html += '<div class="ch-info">';
      html += '<div class="ch-title">' + ch.title + '</div>';
      html += '<div class="ch-sub">' + ch.subtitle + '</div>';
      html += '</div></div>';
    }

    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);

    var cards = document.querySelectorAll('.chapter-card');
    for (var j = 0; j < cards.length; j++) {
      cards[j].addEventListener('click', function() {
        var chapterId = parseInt(this.getAttribute('data-chapter'));
        S2.Audio.play('click');
        S2.Audio.hapticTap();
        startSpeedRun(chapterId);
      });
    }
  }

  function startSpeedRun(chapterId) {
    var chapter = S2.Chapters.find(function(c) { return c.id === chapterId; });
    if (!chapter) return;

    S2.StateMachine.transition(S2.StateMachine.STATES.SPEED, {
      chapter: chapter
    });

    startTime = performance.now();
    splits = [];

    S2.Story.startChapter(chapterId);
  }

  function recordSplit(name) {
    splits.push({
      name: name,
      time: performance.now() - startTime
    });
  }

  function getElapsed() {
    return performance.now() - startTime;
  }

  function getSplits() {
    return splits;
  }

  function getMultiplier(elapsedMs) {
    var secs = elapsedMs / 1000;
    if (secs <= 30) return 3.0;
    if (secs <= 60) return 2.0;
    if (secs <= 90) return 1.5;
    if (secs <= 120) return 1.2;
    return 1.0;
  }

  return {
    showSelect: showSelect,
    startSpeedRun: startSpeedRun,
    recordSplit: recordSplit,
    getElapsed: getElapsed,
    getSplits: getSplits,
    getMultiplier: getMultiplier
  };

})();

window.S2 = window.S2 || {};
window.S2.Speed = S2.Speed;
