/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Zombie Outbreak Mode
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Zombie = (function() {
  'use strict';

  var difficulty = 1;
  var patientsServed = 0;
  var combo = 0;
  var maxCombo = 0;
  var score = 0;
  var wave = 1;

  var ZOMBIE_NAMES = [
    'Infected Zombie', 'Rotting Walker', 'Frenzied Biter',
    'Decaying Corpse', 'Shambling Horror', 'Mindless Drone',
    'Bloodthirsty Ghoul', 'Undead Patient', 'Cursed Zombie',
    'Plague Carrier', 'Rotting Monster', 'Flesh Eater'
  ];

  var CONDITIONS = [
    'Bite Wounds', 'Infection', 'Rabies', 'Fungal Infection',
    'Parasitic Infestation', 'Toxic Exposure', 'Necrotic Tissue',
    'Viral Mutation', 'Bacterial Invasion', 'Immune Collapse'
  ];

  var EMOJIS = ['🧟', '🧟‍♂️', '🧟‍♀️', '💀', '☠️', '👿'];

  var INFECTION_TOOLS = ['scalpel', 'forceps', 'gauze', 'clamp', 'suture', 'drill'];

  function showSelect() {
    S2.StateMachine.transition(S2.StateMachine.STATES.SANDBOX_SELECT);

    var html = '<h1>🧟 ZOMBIE OUTBREAK</h1>';
    html += '<h2>Treat infected zombies before they turn!</h2>';
    html += '<div class="results-card">';
    html += '<div class="detail">Zombie patients are infecting your hospital.<br>Operate quickly to prevent outbreaks!</div>';
    html += '</div>';

    html += S2.Overlay.buildButton({ icon: '▶', label: 'START OUTBREAK', type: 'primary', action: 'navigate', target: 'S2.Zombie.startOutbreak' });
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);
  }

  function startOutbreak() {
    difficulty = 1;
    patientsServed = 0;
    combo = 0;
    maxCombo = 0;
    score = 0;
    wave = 1;

    S2.StateMachine.transition(S2.StateMachine.STATES.SANDBOX, {
      mode: 'zombie'
    });

    generateZombie();
  }

  function generateZombie() {
    var nameIdx = Math.floor(Math.random() * ZOMBIE_NAMES.length);
    var condIdx = Math.floor(Math.random() * CONDITIONS.length);
    var emojiIdx = Math.floor(Math.random() * EMOJIS.length);

    var zombie = {
      id: 'zombie_' + patientsServed,
      name: ZOMBIE_NAMES[nameIdx],
      age: Math.floor(Math.random() * 50) + 20,
      emoji: EMOJIS[emojiIdx],
      condition: CONDITIONS[condIdx],
      desc: 'Infected zombie requiring surgery.',
      vitals: {
        hr: 50 + Math.floor(Math.random() * 30),
        bp: '90/' + (50 + Math.floor(Math.random() * 20)),
        temp: 38.5 + Math.random() * 2.0,
        o2: 85 + Math.floor(Math.random() * 10)
      }
    };

    var chapterIdx = Math.min(patientsServed, S2.Chapters.length - 1);
    var baseChapter = S2.Chapters[chapterIdx];

    var chapter = {
      id: 2000 + patientsServed,
      title: 'Wave ' + wave + ' - ' + zombie.name,
      subtitle: zombie.condition,
      patient: zombie.id,
      organ: baseChapter.organ,
      instruments: INFECTION_TOOLS.slice(),
      difficulty: difficulty <= 3 ? 'easy' : (difficulty <= 6 ? 'medium' : 'hard'),
      timeLimit: Math.max(20000, 40000 - difficulty * 2000),
      steps: Math.min(10, 5 + Math.floor(difficulty / 2)),
      briefing: [
        { speaker: 'DR. CHEN', text: '🧟 ZOMBIE INCOMING!' },
        { speaker: 'DR. CHEN', text: 'Patient: ' + zombie.name + '. Condition: ' + zombie.condition + '.' }
      ],
      debriefing: [
        { speaker: 'DR. CHEN', text: zombie.name + ' neutralized! Wave ' + wave + ' cleared!' }
      ]
    };

    S2.Patients[zombie.id] = zombie;
    S2.Chapters.push(chapter);
    S2.Procedures['chapter' + chapter.id] = generateProcedure(baseChapter, difficulty);

    S2.Story.startChapter(chapter.id);
  }

  function generateProcedure(baseChapter, diff) {
    var baseProc = S2.Procedures['chapter' + baseChapter.id];
    if (!baseProc) return S2.Procedures.chapter1;

    var proc = [];
    var stepsCount = Math.min(10, 5 + Math.floor(diff / 2));

    for (var i = 0; i < stepsCount; i++) {
      var baseStep = baseProc[i % baseProc.length];
      proc.push({
        type: baseStep.type,
        instrument: baseStep.instrument,
        path: baseStep.path,
        points: baseStep.points + 50,
        desc: 'Step ' + (i + 1),
        timeLimit: Math.max(3000, baseStep.timeLimit - diff * 300)
      });
    }

    return proc;
  }

  function onPatientComplete(results) {
    patientsServed++;
    difficulty = Math.floor(patientsServed / 2) + 1;

    if (patientsServed % 5 === 0) {
      wave++;
      S2.Toast.warning('WAVE ' + wave + ' INCOMING!');
    }

    if (results.accuracy >= 70) {
      combo++;
      if (combo > maxCombo) maxCombo = combo;
    } else {
      combo = 0;
    }

    score += results.score + combo * 150;

    S2.Toast.success('Zombie neutralized!');

    setTimeout(function() {
      generateZombie();
    }, 1500);
  }

  function showResults() {
    S2.HUD.hide();

    var html = '<h1>🧟 OUTBREAK CONTAINED</h1>';
    html += '<div class="results-card">';
    html += '<div class="grade" style="color:#2ecc71">🧟</div>';
    html += '<div class="score">' + score + ' pts</div>';
    html += '<div class="detail">Zombies treated: ' + patientsServed + '<br>Max combo: ' + maxCombo + '<br>Final wave: ' + wave + '</div>';
    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '🔄', label: 'PLAY AGAIN', type: 'primary', action: 'navigate', target: 'S2.Zombie.startOutbreak' });
    html += S2.Overlay.buildButton({ icon: '🏠', label: 'MAIN MENU', action: 'navigate', target: 'S2.Menu.showTitle' });

    S2.Overlay.show(html);
  }

  return {
    showSelect: showSelect,
    startOutbreak: startOutbreak,
    onPatientComplete: onPatientComplete,
    showResults: showResults
  };

})();

window.S2 = window.S2 || {};
window.S2.Zombie = S2.Zombie;
