/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Pandemic Mode
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Pandemic = (function() {
  'use strict';

  var difficulty = 1;
  var patientsServed = 0;
  var combo = 0;
  var maxCombo = 0;
  var score = 0;
  var infectionRate = 0;

  var PATIENT_NAMES = [
    'Patient Zero', 'Infected Civilian', 'Quarantined Worker',
    'Exposed Doctor', 'Sick Traveler', 'Isolated Nurse',
    'Contaminated Pilot', 'Infected Student', 'Sick Elderly',
    'Exposed Child', 'Contaminated Guard', 'Infected Chef'
  ];

  var CONDITIONS = [
    'COVID-19', 'Avian Flu', 'SARS', 'MERS',
    'Ebola', 'Marburg', 'Zika', 'Dengue',
    'Typhoid', 'Cholera', 'Plague', 'Smallpox'
  ];

  var EMOJIS = ['🤒', '🤕', '😷', '🤒', '🤢', '🤮', '🥵', '🥶', '🥴', '😵'];

  var PANDEMIC_TOOLS = ['scalpel', 'forceps', 'gauze', 'catheter', 'scope', 'needle'];

  function showSelect() {
    S2.StateMachine.transition(S2.StateMachine.STATES.SANDBOX_SELECT);

    var html = '<h1>🦠 PANDEMIC</h1>';
    html += '<h2>Stop the outbreak before it spreads!</h2>';
    html += '<div class="results-card">';
    html += '<div class="detail">Infected patients are overwhelming the hospital.<br>Treat them before the infection spreads!</div>';
    html += '</div>';

    html += S2.Overlay.buildButton({ icon: '▶', label: 'START PANDEMIC', type: 'primary', action: 'navigate', target: 'S2.Pandemic.startPandemic' });
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);
  }

  function startPandemic() {
    difficulty = 1;
    patientsServed = 0;
    combo = 0;
    maxCombo = 0;
    score = 0;
    infectionRate = 0;

    S2.StateMachine.transition(S2.StateMachine.STATES.SANDBOX, {
      mode: 'pandemic'
    });

    generatePatient();
  }

  function generatePatient() {
    var nameIdx = Math.floor(Math.random() * PATIENT_NAMES.length);
    var condIdx = Math.floor(Math.random() * CONDITIONS.length);
    var emojiIdx = Math.floor(Math.random() * EMOJIS.length);

    var patient = {
      id: 'pandemic_' + patientsServed,
      name: PATIENT_NAMES[nameIdx],
      age: Math.floor(Math.random() * 60) + 10,
      emoji: EMOJIS[emojiIdx],
      condition: CONDITIONS[condIdx],
      desc: 'Infected patient requiring treatment.',
      vitals: {
        hr: 70 + Math.floor(Math.random() * 50),
        bp: '100/' + (60 + Math.floor(Math.random() * 20)),
        temp: 37.5 + Math.random() * 2.5,
        o2: 85 + Math.floor(Math.random() * 15)
      }
    };

    var chapterIdx = Math.min(patientsServed, S2.Chapters.length - 1);
    var baseChapter = S2.Chapters[chapterIdx];

    var chapter = {
      id: 4000 + patientsServed,
      title: 'Patient ' + (patientsServed + 1) + ' - ' + patient.condition,
      subtitle: 'Infected',
      patient: patient.id,
      organ: baseChapter.organ,
      instruments: PANDEMIC_TOOLS.slice(),
      difficulty: difficulty <= 3 ? 'easy' : (difficulty <= 6 ? 'medium' : 'hard'),
      timeLimit: Math.max(20000, 35000 - difficulty * 1500),
      steps: Math.min(8, 4 + Math.floor(difficulty / 2)),
      briefing: [
        { speaker: 'DR. CHEN', text: '🦠 PANDEMIC ALERT!' },
        { speaker: 'DR. CHEN', text: 'Patient: ' + patient.name + '. Virus: ' + patient.condition + '.' }
      ],
      debriefing: [
        { speaker: 'DR. CHEN', text: patient.name + ' treated! Infection rate: ' + infectionRate + '%' }
      ]
    };

    S2.Patients[patient.id] = patient;
    S2.Chapters.push(chapter);
    S2.Procedures['chapter' + chapter.id] = generateProcedure(baseChapter, difficulty);

    S2.Story.startChapter(chapter.id);
  }

  function generateProcedure(baseChapter, diff) {
    var baseProc = S2.Procedures['chapter' + baseChapter.id];
    if (!baseProc) return S2.Procedures.chapter1;

    var proc = [];
    var stepsCount = Math.min(8, 4 + Math.floor(diff / 2));

    for (var i = 0; i < stepsCount; i++) {
      var baseStep = baseProc[i % baseProc.length];
      proc.push({
        type: baseStep.type,
        instrument: baseStep.instrument,
        path: baseStep.path,
        points: baseStep.points + 75,
        desc: 'Step ' + (i + 1),
        timeLimit: Math.max(3000, baseStep.timeLimit - diff * 250)
      });
    }

    return proc;
  }

  function onPatientComplete(results) {
    patientsServed++;
    difficulty = Math.floor(patientsServed / 2) + 1;

    if (results.accuracy >= 70) {
      combo++;
      if (combo > maxCombo) maxCombo = combo;
      infectionRate = Math.max(0, infectionRate - 10);
    } else {
      combo = 0;
      infectionRate = Math.min(100, infectionRate + 15);
    }

    score += results.score + combo * 100;

    if (infectionRate >= 100) {
      showGameOver();
      return;
    }

    S2.Toast.success('Patient treated!');

    setTimeout(function() {
      generatePatient();
    }, 1500);
  }

  function showGameOver() {
    S2.HUD.hide();

    var html = '<h1>🦠 PANDEMIC SPREAD</h1>';
    html += '<div class="results-card">';
    html += '<div class="grade" style="color:#e74c3c">🦠</div>';
    html += '<div class="score">' + score + ' pts</div>';
    html += '<div class="detail">Infection rate reached 100%!<br>Patients treated: ' + patientsServed + '<br>Max combo: ' + maxCombo + '</div>';
    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '🔄', label: 'TRY AGAIN', type: 'primary', action: 'navigate', target: 'S2.Pandemic.startPandemic' });
    html += S2.Overlay.buildButton({ icon: '🏠', label: 'MAIN MENU', action: 'navigate', target: 'S2.Menu.showTitle' });

    S2.Overlay.show(html);
  }

  function showResults() {
    S2.HUD.hide();

    var html = '<h1>🦠 PANDEMIC CONTAINED</h1>';
    html += '<div class="results-card">';
    html += '<div class="grade" style="color:#2ecc71">🦠</div>';
    html += '<div class="score">' + score + ' pts</div>';
    html += '<div class="detail">Patients treated: ' + patientsServed + '<br>Max combo: ' + maxCombo + '<br>Final infection rate: ' + infectionRate + '%</div>';
    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '🔄', label: 'PLAY AGAIN', type: 'primary', action: 'navigate', target: 'S2.Pandemic.startPandemic' });
    html += S2.Overlay.buildButton({ icon: '🏠', label: 'MAIN MENU', action: 'navigate', target: 'S2.Menu.showTitle' });

    S2.Overlay.show(html);
  }

  return {
    showSelect: showSelect,
    startPandemic: startPandemic,
    onPatientComplete: onPatientComplete,
    showResults: showResults,
    showGameOver: showGameOver
  };

})();

window.S2 = window.S2 || {};
window.S2.Pandemic = S2.Pandemic;
