/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Alien Surgery Mode
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Alien = (function() {
  'use strict';

  var difficulty = 1;
  var patientsServed = 0;
  var combo = 0;
  var maxCombo = 0;
  var score = 0;

  var ALIEN_NAMES = [
    'Zorg', 'Xenomorph', 'C\'thulhu Spawn', 'Plasmoid',
    'Chrono Beast', 'Void Walker', 'Nebula Drifter',
    'Stellar Larva', 'Quantum Entity', 'Dark Matter Form'
  ];

  var CONDITIONS = [
    'Crystalline Growth', 'Energy Imbalance', 'Quantum Displacement',
    'Temporal Rift', 'Bioluminescent Tumor', 'Membrane Perforation',
    'Plasma Leakage', 'Antimatter Contamination', 'Neural Network Failure',
    'Gravitational Anomaly'
  ];

  var EMOJIS = ['👽', '👾', '🛸', '🌟', '⚡', '🔮', '🌀', '💫', '✨', '🎆'];

  var ALIEN_TOOLS = ['scalpel', 'forceps', 'gauze', 'catheter', 'scope', 'drill', 'defibrillator', 'needle'];

  var ALIEN_ORGANS = ['lungs', 'heart', 'brain', 'stomach', 'kidney'];

  function showSelect() {
    S2.StateMachine.transition(S2.StateMachine.STATES.SANDBOX_SELECT);

    var html = '<h1>👽 ALIEN SURGERY</h1>';
    html += '<h2>Operate on extraterrestrial beings</h2>';
    html += '<div class="results-card">';
    html += '<div class="detail">Aliens have unique anatomy.<br>Adapt your surgical techniques!</div>';
    html += '</div>';

    html += S2.Overlay.buildButton({ icon: '▶', label: 'START SURGERY', type: 'primary', action: 'navigate', target: 'S2.Alien.startAlien' });
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);
  }

  function startAlien() {
    difficulty = 1;
    patientsServed = 0;
    combo = 0;
    maxCombo = 0;
    score = 0;

    S2.StateMachine.transition(S2.StateMachine.STATES.SANDBOX, {
      mode: 'alien'
    });

    generateAlien();
  }

  function generateAlien() {
    var nameIdx = Math.floor(Math.random() * ALIEN_NAMES.length);
    var condIdx = Math.floor(Math.random() * CONDITIONS.length);
    var emojiIdx = Math.floor(Math.random() * EMOJIS.length);
    var organIdx = Math.floor(Math.random() * ALIEN_ORGANS.length);

    var alien = {
      id: 'alien_' + patientsServed,
      name: ALIEN_NAMES[nameIdx],
      age: Math.floor(Math.random() * 1000) + 100,
      emoji: EMOJIS[emojiIdx],
      condition: CONDITIONS[condIdx],
      desc: 'Alien requiring specialized surgery.',
      vitals: {
        hr: 40 + Math.floor(Math.random() * 60),
        bp: '80/' + (40 + Math.floor(Math.random() * 30)),
        temp: 35.0 + Math.random() * 4.0,
        o2: 80 + Math.floor(Math.random() * 20)
      }
    };

    var chapter = {
      id: 3000 + patientsServed,
      title: 'Alien ' + alien.name,
      subtitle: alien.condition,
      patient: alien.id,
      organ: ALIEN_ORGANS[organIdx],
      instruments: ALIEN_TOOLS.slice(),
      difficulty: difficulty <= 3 ? 'easy' : (difficulty <= 6 ? 'medium' : 'hard'),
      timeLimit: Math.max(25000, 45000 - difficulty * 2000),
      steps: Math.min(10, 5 + Math.floor(difficulty / 2)),
      briefing: [
        { speaker: 'DR. CHEN', text: '👽 ALIEN PATIENT DETECTED!' },
        { speaker: 'DR. CHEN', text: 'Species: ' + alien.name + '. Condition: ' + alien.condition + '.' }
      ],
      debriefing: [
        { speaker: 'DR. CHEN', text: alien.name + ' treated successfully!' }
      ]
    };

    S2.Patients[alien.id] = alien;
    S2.Chapters.push(chapter);
    S2.Procedures['chapter' + chapter.id] = generateProcedure(difficulty);

    S2.Story.startChapter(chapter.id);
  }

  function generateProcedure(diff) {
    var proc = [];
    var stepsCount = Math.min(10, 5 + Math.floor(diff / 2));

    var types = ['tap', 'swipe', 'stitch', 'navigate', 'timing', 'draw'];

    for (var i = 0; i < stepsCount; i++) {
      var type = types[i % types.length];
      var instrument = ALIEN_TOOLS[i % ALIEN_TOOLS.length];

      proc.push({
        type: type,
        instrument: instrument,
        path: generatePath(type),
        points: 120 + Math.floor(Math.random() * 80),
        desc: 'Step ' + (i + 1),
        timeLimit: Math.max(4000, 6000 - diff * 300)
      });
    }

    return proc;
  }

  function generatePath(type) {
    if (type === 'swipe') {
      return [
        { x: 0.3, y: 0.5 }, { x: 0.5, y: 0.3 }, { x: 0.7, y: 0.5 },
        { x: 0.5, y: 0.7 }, { x: 0.3, y: 0.5 }
      ];
    }
    if (type === 'navigate') {
      return [
        { x: 0.2, y: 0.5 }, { x: 0.4, y: 0.3 }, { x: 0.6, y: 0.5 },
        { x: 0.8, y: 0.5 }
      ];
    }
    return [{ x: 0.5, y: 0.5 }];
  }

  function onPatientComplete(results) {
    patientsServed++;
    difficulty = Math.floor(patientsServed / 2) + 1;

    if (results.accuracy >= 70) {
      combo++;
      if (combo > maxCombo) maxCombo = combo;
    } else {
      combo = 0;
    }

    score += results.score + combo * 120;

    S2.Toast.success('Alien treated successfully!');

    setTimeout(function() {
      generateAlien();
    }, 1500);
  }

  function showResults() {
    S2.HUD.hide();

    var html = '<h1>👽 ALIEN MISSION COMPLETE</h1>';
    html += '<div class="results-card">';
    html += '<div class="grade" style="color:#9b59b6">👽</div>';
    html += '<div class="score">' + score + ' pts</div>';
    html += '<div class="detail">Aliens treated: ' + patientsServed + '<br>Max combo: ' + maxCombo + '</div>';
    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '🔄', label: 'PLAY AGAIN', type: 'primary', action: 'navigate', target: 'S2.Alien.startAlien' });
    html += S2.Overlay.buildButton({ icon: '🏠', label: 'MAIN MENU', action: 'navigate', target: 'S2.Menu.showTitle' });

    S2.Overlay.show(html);
  }

  return {
    showSelect: showSelect,
    startAlien: startAlien,
    onPatientComplete: onPatientComplete,
    showResults: showResults
  };

})();

window.S2 = window.S2 || {};
window.S2.Alien = S2.Alien;
