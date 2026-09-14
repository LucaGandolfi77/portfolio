/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Story Mode
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Story = (function() {
  'use strict';

  var currentChapter = null;
  var currentProcedure = null;
  var surgeryStartTime = 0;
  var paused = false;

  function startChapter(chapterId) {
    var chapter = S2.Chapters.find(function(c) { return c.id === chapterId; });
    if (!chapter) {
      S2.Toast.error('Chapter not found');
      return;
    }

    currentChapter = chapter;
    currentProcedure = S2.Procedures['chapter' + chapterId];

    if (!currentProcedure) {
      S2.Toast.error('Procedure not found');
      return;
    }

    S2.Menu.showBriefing(chapter);
  }

  function startSurgery() {
    if (!currentChapter || !currentProcedure) return;

    S2.StateMachine.transition(S2.StateMachine.STATES.BRIEFING, {
      chapter: currentChapter
    });

    var dialogue = currentChapter.briefing;
    if (dialogue && dialogue.length > 0) {
      S2.Dialogue.show(dialogue, function() {
        beginProcedure();
      });
    } else {
      beginProcedure();
    }
  }

  function beginProcedure() {
    S2.StateMachine.transition(S2.StateMachine.STATES.SURGERY, {
      chapter: currentChapter
    });

    S2.Scoring.reset();
    S2.Complications.reset();
    S2.Powerups.reset();

    S2.HUD.show();
    S2.HUD.updateScore(0);
    S2.HUD.updateCombo(0);
    S2.HUD.updateAccuracy(100);
    S2.HUD.buildInstrumentBar(currentChapter.instruments, currentChapter.instruments[0]);

    var organ = S2.Organs[currentChapter.organ];
    if (organ) {
      S2.Renderer.onRender(function(ctx, w, h, frame) {
        S2.Renderer.drawSurgicalField(w / 2, h / 2, Math.min(w, h) * 0.4);
        organ.render(ctx, w / 2, h / 2, Math.min(w, h) * 0.3, frame);
      });
    }

    surgeryStartTime = performance.now();
    paused = false;

    S2.Steps.startSteps(
      currentProcedure,
      onStepComplete,
      onAllStepsComplete
    );
  }

  function onStepComplete(step, index, total) {
    var accuracy = step.accuracy;
    var timeBonus = 0;

    var comp = S2.Complications.checkForComplication(accuracy, S2.Difficulty.getDifficulty(currentChapter.id));
    if (comp) {
      accuracy = Math.max(0, accuracy - S2.Complications.getAccuracyPenalty());
      timeBonus = -S2.Complications.getTimePenalty();
    }

    S2.Scoring.addStepScore(accuracy, timeBonus);
    S2.Powerups.tickStep();

    setTimeout(function() {
      S2.Steps.advanceStep();
    }, 800);
  }

  function onAllStepsComplete(results) {
    var elapsed = performance.now() - surgeryStartTime;
    var timeStr = S2.Timer.formatTime(elapsed);

    var finalResults = S2.Scoring.getResults(timeStr);
    finalResults.accuracy = Math.max(0, finalResults.accuracy - S2.Complications.getAccuracyPenalty());

    S2.Progression.completeChapter(currentChapter.id, finalResults);

    S2.HUD.hide();
    S2.Renderer.clear();
    S2.Particles.clear();

    setTimeout(function() {
      var dialogue = currentChapter.debriefing;
      if (dialogue && dialogue.length > 0) {
        S2.Dialogue.show(dialogue, function() {
          showResults(finalResults);
        });
      } else {
        showResults(finalResults);
      }
    }, 500);
  }

  function showResults(results) {
    S2.Menu.showResults(results);

    if (results.accuracy >= 90) {
      S2.Particles.emitBurst(
        S2.Renderer.getWidth() / 2,
        S2.Renderer.getHeight() / 3,
        'confetti',
        30
      );
      S2.Audio.play('fanfare');
      S2.Audio.hapticAchievement();
    }
  }

  function resumeSurgery() {
    if (paused) {
      paused = false;
      S2.StateMachine.forceTransition(S2.StateMachine.STATES.SURGERY);
      S2.Overlay.hide();
    }
  }

  function pauseSurgery() {
    if (!paused) {
      paused = true;
      S2.StateMachine.transition(S2.StateMachine.STATES.PAUSED);
      S2.Menu.showPause();
    }
  }

  function startSandbox() {
    S2.StateMachine.transition(S2.StateMachine.STATES.SANDBOX);

    var chapter = S2.Chapters[0];
    currentChapter = chapter;
    currentProcedure = S2.Procedures['chapter1'];

    S2.Menu.showBriefing(chapter);
  }

  function getCurrentChapter() {
    return currentChapter;
  }

  return {
    startChapter: startChapter,
    startSurgery: startSurgery,
    resumeSurgery: resumeSurgery,
    pauseSurgery: pauseSurgery,
    startSandbox: startSandbox,
    getCurrentChapter: getCurrentChapter
  };

})();

window.S2 = window.S2 || {};
window.S2.Story = S2.Story;
