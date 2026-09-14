/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Menu System
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Menu = (function() {
  'use strict';

  function showTitle() {
    S2.StateMachine.transition(S2.StateMachine.STATES.TITLE);

    var html = S2.Overlay.buildMenu('SCALPEL', 'Surgical Stories', [
      {
        title: '📖 STORY MODE',
        buttons: [
          { icon: '▶', label: 'NEW SURGEON', type: 'primary', action: 'navigate', target: 'S2.Menu.showChapterSelect' },
          { icon: '↻', label: 'CONTINUE', action: 'navigate', target: 'S2.Menu.showChapterSelect' },
          { icon: '📅', label: 'DAILY SURGERY', action: 'navigate', target: 'S2.Daily.showDaily' }
        ]
      },
      {
        title: '⚡ CHALLENGE MODE',
        buttons: [
          { icon: '⚡', label: 'SPEED RUN', action: 'navigate', target: 'S2.Speed.showSelect' },
          { icon: '💀', label: 'BOSS RUSH', action: 'navigate', target: 'S2.BossRush.showSelect' },
          { icon: '♾️', label: 'ENDLESS MODE', action: 'navigate', target: 'S2.Endless.showSelect' },
          { icon: '🧟', label: 'ZOMBIE OUTBREAK', action: 'navigate', target: 'S2.Zombie.showSelect' },
          { icon: '👽', label: 'ALIEN SURGERY', action: 'navigate', target: 'S2.Alien.showSelect' },
          { icon: '🦠', label: 'PANDEMIC', action: 'navigate', target: 'S2.Pandemic.showSelect' }
        ]
      },
      {
        title: '🧪 PRACTICE & LEARN',
        buttons: [
          { icon: '🧪', label: 'SANDBOX', action: 'navigate', target: 'S2.Sandbox.showSelect' },
          { icon: '🐄', label: 'VETERINARY', action: 'navigate', target: 'S2.Veterinary.showSelect' },
          { icon: '🫀', label: 'ANATOMY VIEWER', action: 'navigate', target: 'S2.Anatomy.showSelect' },
          { icon: '🎓', label: 'TUTORIAL', action: 'navigate', target: 'S2.Tutorial.showTutorial' }
        ]
      }
    ]);

    S2.Overlay.show(html);
  }

  function showChapterSelect() {
    S2.StateMachine.transition(S2.StateMachine.STATES.CHAPTER_SELECT);

    var chapters = S2.Chapters;
    var save = S2.Save.load();
    var html = '<h1>SELECT CHAPTER</h1>';
    html += '<div class="chapter-list">';

    for (var i = 0; i < chapters.length; i++) {
      var ch = chapters[i];
      var unlocked = i === 0 || (save.completed && save.completed[ch.id - 1]);
      var completed = save.completed && save.completed[ch.id];
      var patient = S2.Patients[ch.patient];

      var classes = ['chapter-card'];
      if (!unlocked) classes.push('locked');
      if (completed) classes.push('completed');

      html += '<div class="' + classes.join(' ') + '" data-chapter="' + ch.id + '">';
      html += '<div class="ch-icon">' + (patient ? patient.emoji : '🏥') + '</div>';
      html += '<div class="ch-info">';
      html += '<div class="ch-title">Chapter ' + ch.id + ': ' + ch.title + '</div>';
      html += '<div class="ch-sub">' + ch.subtitle + ' · ' + ch.difficulty + '</div>';
      html += '</div>';
      html += '<div class="ch-status">' + (completed ? '✅' : (unlocked ? '▶' : '🔒')) + '</div>';
      html += '</div>';
    }

    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);

    var cards = document.querySelectorAll('.chapter-card:not(.locked)');
    for (var j = 0; j < cards.length; j++) {
      cards[j].addEventListener('click', function() {
        var chapterId = parseInt(this.getAttribute('data-chapter'));
        S2.Audio.play('click');
        S2.Audio.hapticTap();
        S2.Story.startChapter(chapterId);
      });
    }
  }

  function showBriefing(chapter) {
    S2.StateMachine.transition(S2.StateMachine.STATES.BRIEFING);

    var patient = S2.Patients[chapter.patient];
    var html = '';

    if (patient) {
      html += S2.Overlay.buildPatientCard(patient, chapter.instruments);
    }

    html += S2.Overlay.buildButton({ icon: '▶', label: 'START SURGERY', type: 'primary', action: 'navigate', target: 'S2.Story.startSurgery' });
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);
  }

  function showResults(data) {
    S2.StateMachine.transition(S2.StateMachine.STATES.RESULTS);

    var grade = S2.Difficulty.getGrade(data.accuracy);

    var html = '<h1>SURGERY COMPLETE</h1>';
    html += S2.Overlay.buildResultsCard({
      grade: grade.letter,
      gradeColor: grade.color,
      score: data.score,
      detail: grade.label,
      accuracy: data.accuracy,
      combo: data.maxCombo,
      time: data.time
    });

    html += S2.Overlay.buildButton({ icon: '→', label: 'CONTINUE', type: 'primary', action: 'navigate', target: 'S2.Menu.showChapterSelect' });
    html += S2.Overlay.buildButton({ icon: '🏠', label: 'MAIN MENU', action: 'navigate', target: 'S2.Menu.showTitle' });

    S2.Overlay.show(html);
  }

  function showPause() {
    S2.StateMachine.transition(S2.StateMachine.STATES.PAUSED);

    var html = '<h1>PAUSED</h1>';
    html += S2.Overlay.buildButton({ icon: '▶', label: 'RESUME', type: 'primary', action: 'navigate', target: 'S2.Story.resumeSurgery' });
    html += S2.Overlay.buildButton({ icon: '🏠', label: 'QUIT', type: 'danger', action: 'navigate', target: 'S2.Menu.showTitle' });

    S2.Overlay.show(html);
  }

  return {
    showTitle: showTitle,
    showChapterSelect: showChapterSelect,
    showBriefing: showBriefing,
    showResults: showResults,
    showPause: showPause
  };

})();

window.S2 = window.S2 || {};
window.S2.Menu = S2.Menu;
