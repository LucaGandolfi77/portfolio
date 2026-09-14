/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Sandbox Mode
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Sandbox = (function() {
  'use strict';

  var selectedOrgan = null;
  var selectedInstrument = null;

  var ORGANS = [
    { id: 'appendix', name: 'Appendix', emoji: '🔴' },
    { id: 'esophagus', name: 'Esophagus', emoji: '🟤' },
    { id: 'heart', name: 'Heart', emoji: '❤️' },
    { id: 'brain', name: 'Brain', emoji: '🧠' },
    { id: 'alien_lungs', name: 'Alien Lungs', emoji: '👽' }
  ];

  function showSelect() {
    S2.StateMachine.transition(S2.StateMachine.STATES.SANDBOX_SELECT);

    var html = '<h1>SANDBOX</h1>';
    html += '<h2>Select an organ to practice</h2>';
    html += '<div class="chapter-list">';

    for (var i = 0; i < ORGANS.length; i++) {
      var organ = ORGANS[i];
      html += '<div class="chapter-card" data-organ="' + organ.id + '">';
      html += '<div class="ch-icon">' + organ.emoji + '</div>';
      html += '<div class="ch-info">';
      html += '<div class="ch-title">' + organ.name + '</div>';
      html += '<div class="ch-sub">Practice mode · No timer</div>';
      html += '</div></div>';
    }

    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);

    var cards = document.querySelectorAll('.chapter-card');
    for (var j = 0; j < cards.length; j++) {
      cards[j].addEventListener('click', function() {
        var organId = this.getAttribute('data-organ');
        S2.Audio.play('click');
        S2.Audio.hapticTap();
        startPractice(organId);
      });
    }
  }

  function startPractice(organId) {
    selectedOrgan = ORGANS.find(function(o) { return o.id === organId; });
    if (!selectedOrgan) return;

    var chapter = S2.Chapters.find(function(c) { return c.organ === organId; });
    if (chapter) {
      currentProcedure = S2.Procedures['chapter' + chapter.id];
      currentChapter = chapter;
    } else {
      currentProcedure = S2.Procedures.chapter1;
      currentChapter = S2.Chapters[0];
    }

    S2.StateMachine.transition(S2.StateMachine.STATES.SANDBOX);

    S2.HUD.show();
    S2.HUD.updateScore(0);
    S2.HUD.updateCombo(0);
    S2.HUD.updateAccuracy(100);
    S2.HUD.buildInstrumentBar(currentChapter.instruments, currentChapter.instruments[0]);

    var organ = S2.Organs[organId];
    if (organ) {
      S2.Renderer.onRender(function(ctx, w, h, frame) {
        S2.Renderer.drawSurgicalField(w / 2, h / 2, Math.min(w, h) * 0.4);
        organ.render(ctx, w / 2, h / 2, Math.min(w, h) * 0.3, frame);
      });
    }

    S2.Scoring.reset();
    S2.Complications.reset();
    S2.Powerups.reset();

    S2.Steps.startSteps(
      currentProcedure,
      function(step, index, total) {
        S2.Scoring.addStepScore(step.accuracy, 0);
        setTimeout(function() {
          S2.Steps.advanceStep();
        }, 600);
      },
      function(results) {
        S2.HUD.hide();
        S2.Renderer.clear();
        var finalResults = S2.Scoring.getResults('0:00');
        S2.Menu.showResults(finalResults);
      }
    );
  }

  var currentProcedure = null;
  var currentChapter = null;

  return {
    showSelect: showSelect,
    startPractice: startPractice
  };

})();

window.S2 = window.S2 || {};
window.S2.Sandbox = S2.Sandbox;
