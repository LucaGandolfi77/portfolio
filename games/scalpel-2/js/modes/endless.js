/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Endless Mode
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Endless = (function() {
  'use strict';

  var difficulty = 1;
  var patientsServed = 0;
  var combo = 0;
  var maxCombo = 0;
  var score = 0;

  var CONDITIONS = [
    'Appendicitis', 'Foreign Body', 'Heart Failure', 'Brain Tumor',
    'Fracture', 'Anaphylaxis', 'Decompression', 'C-Section',
    'Stroke', 'Kidney Stones', 'Gallstones', 'ACL Tear'
  ];

  var PATIENT_NAMES = [
    'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Quinn',
    'Avery', 'Parker', 'Sage', 'Dakota', 'Reese', 'Finley'
  ];

  var EMOJIS = ['👨', '👩', '🧑', '👴', '👵', '👦', '👧', '👶'];

  function showSelect() {
    S2.StateMachine.transition(S2.StateMachine.STATES.ENDLESS_SELECT);

    var html = '<h1>ENDLESS MODE</h1>';
    html += '<h2>How many patients can you save?</h2>';
    html += '<div class="results-card">';
    html += '<div class="detail">Procedurally generated patients.<br>Difficulty increases over time.</div>';
    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '▶', label: 'START ENDLESS', type: 'primary', action: 'navigate', target: 'S2.Endless.startEndless' });
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);
  }

  function startEndless() {
    difficulty = 1;
    patientsServed = 0;
    combo = 0;
    maxCombo = 0;
    score = 0;

    S2.StateMachine.transition(S2.StateMachine.STATES.ENDLESS, {
      difficulty: difficulty
    });

    generatePatient();
  }

  function generatePatient() {
    var condIdx = Math.floor(Math.random() * CONDITIONS.length);
    var nameIdx = Math.floor(Math.random() * PATIENT_NAMES.length);
    var emojiIdx = Math.floor(Math.random() * EMOJIS.length);

    var patient = {
      id: 'endless_' + patientsServed,
      name: PATIENT_NAMES[nameIdx],
      age: Math.floor(Math.random() * 60) + 10,
      emoji: EMOJIS[emojiIdx],
      condition: CONDITIONS[condIdx],
      desc: 'Endless mode patient requiring treatment.',
      vitals: {
        hr: 80 + Math.floor(Math.random() * 40),
        bp: '120/' + (70 + Math.floor(Math.random() * 20)),
        temp: 36.5 + Math.random() * 1.5,
        o2: 90 + Math.floor(Math.random() * 10)
      }
    };

    var chapterIdx = Math.min(patientsServed, S2.Chapters.length - 1);
    var baseChapter = S2.Chapters[chapterIdx];

    var chapter = {
      id: 100 + patientsServed,
      title: 'Patient ' + (patientsServed + 1),
      subtitle: patient.condition,
      patient: patient.id,
      organ: baseChapter.organ,
      instruments: baseChapter.instruments.slice(),
      difficulty: difficulty <= 5 ? 'easy' : (difficulty <= 10 ? 'medium' : 'hard'),
      timeLimit: Math.max(25000, 50000 - difficulty * 2000),
      steps: Math.min(12, 6 + Math.floor(difficulty / 2)),
      briefing: [
        { speaker: 'DR. CHEN', text: 'Doctor, we have a new patient: ' + patient.name + '.' },
        { speaker: 'DR. CHEN', text: 'Condition: ' + patient.condition + '. Difficulty: Level ' + difficulty + '.' }
      ],
      debriefing: [
        { speaker: 'DR. CHEN', text: 'Patient ' + patient.name + ' treated successfully!' }
      ]
    };

    S2.Patients[patient.id] = patient;
    S2.Chapters.push(chapter);

    var procedure = generateProcedure(baseChapter, difficulty);
    S2.Procedures['chapter' + chapter.id] = procedure;

    S2.Story.startChapter(chapter.id);
  }

  function generateProcedure(baseChapter, diff) {
    var baseProc = S2.Procedures['chapter' + baseChapter.id];
    if (!baseProc) return S2.Procedures.chapter1;

    var proc = [];
    var stepsCount = Math.min(12, 6 + Math.floor(diff / 2));

    for (var i = 0; i < stepsCount; i++) {
      var baseStep = baseProc[i % baseProc.length];
      proc.push({
        type: baseStep.type,
        instrument: baseStep.instrument,
        path: baseStep.path,
        points: baseStep.points,
        desc: baseStep.desc,
        timeLimit: Math.max(4000, baseStep.timeLimit - diff * 200)
      });
    }

    return proc;
  }

  function onPatientComplete(results) {
    patientsServed++;
    difficulty = Math.floor(patientsServed / 3) + 1;

    if (results.accuracy >= 80) {
      combo++;
      if (combo > maxCombo) maxCombo = combo;
    } else {
      combo = 0;
    }

    score += results.score + combo * 100;

    S2.Toast.success('Patient ' + patientsServed + ' treated!');

    setTimeout(function() {
      generatePatient();
    }, 1500);
  }

  function showResults() {
    S2.HUD.hide();

    var html = '<h1>ENDLESS MODE</h1>';
    html += '<div class="results-card">';
    html += '<div class="grade" style="color:#3498db">' + patientsServed + '</div>';
    html += '<div class="score">' + score + ' pts</div>';
    html += '<div class="detail">Patients served: ' + patientsServed + '<br>Max combo: ' + maxCombo + '<br>Final difficulty: ' + difficulty + '</div>';
    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '🔄', label: 'PLAY AGAIN', type: 'primary', action: 'navigate', target: 'S2.Endless.startEndless' });
    html += S2.Overlay.buildButton({ icon: '🏠', label: 'MAIN MENU', action: 'navigate', target: 'S2.Menu.showTitle' });

    S2.Overlay.show(html);
  }

  return {
    showSelect: showSelect,
    startEndless: startEndless,
    onPatientComplete: onPatientComplete,
    showResults: showResults
  };

})();

window.S2 = window.S2 || {};
window.S2.Endless = S2.Endless;
