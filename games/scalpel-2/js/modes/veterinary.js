/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Veterinary Mode (16 Animals)
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Veterinary = (function() {
  'use strict';

  var animals = [
    { id: 1, name: 'Golden Retriever', type: 'Dog', emoji: '🐕', organ: 'stomach', condition: 'Ingestion', desc: 'Swallowed toy' },
    { id: 2, name: 'Persian Cat', type: 'Cat', emoji: '🐈', organ: 'airway', condition: 'Blockage', desc: 'Hairball lodged in throat' },
    { id: 3, name: 'Austrian Parrot', type: 'Bird', emoji: '🦜', organ: 'airway', condition: 'Aspiration', desc: 'Seed in airway' },
    { id: 4, name: 'Holland Lop Rabbit', type: 'Rabbit', emoji: '🐇', organ: 'stomach', condition: 'GI Stasis', desc: 'Intestinal blockage' },
    { id: 5, name: 'Mini Horse', type: 'Horse', emoji: '🐴', organ: 'leg', condition: 'Laminitis', desc: 'Laminitis' },
    { id: 6, name: 'Miniature Pig', type: 'Pig', emoji: '🐖', organ: 'stomach', condition: 'Overeating', desc: 'Gastric dilation' },
    { id: 7, name: 'Border Collie', type: 'Dog', emoji: '🐕', organ: 'leg', condition: 'ACL Tear', desc: 'Torn cruciate ligament' },
    { id: 8, name: 'Siamese Cat', type: 'Cat', emoji: '🐈', organ: 'kidney', condition: 'Stones', desc: 'Urinary blockage' },
    { id: 9, name: 'African Grey', type: 'Bird', emoji: '🦜', organ: 'airway', condition: 'Infection', desc: 'Aspergillosis' },
    { id: 10, name: 'Belgian Shepherd', type: 'Dog', emoji: '🐕', organ: 'stomach', condition: 'Bloat', desc: 'Gastric torsion' },
    { id: 11, name: 'Maine Coon', type: 'Cat', emoji: '🐈', organ: 'heart', condition: 'HCM', desc: 'Hypertrophic cardiomyopathy' },
    { id: 12, name: 'English Bulldog', type: 'Dog', emoji: '🐕', organ: 'airway', condition: 'BOAS', desc: 'Brachycephalic obstruction' },
    { id: 13, name: 'Cockatiel', type: 'Bird', emoji: '🦜', organ: 'stomach', condition: 'Egg Binding', desc: 'Bound egg' },
    { id: 14, name: 'Flemish Giant', type: 'Rabbit', emoji: '🐇', organ: 'stomach', condition: 'Trichobezoar', desc: 'Hairball' },
    { id: 15, name: 'Quarter Horse', type: 'Horse', emoji: '🐴', organ: 'leg', condition: 'Colic', desc: 'Intestinal impaction' },
    { id: 16, name: 'Labrador Retriever', type: 'Dog', emoji: '🐕', organ: 'stomach', condition: 'Foreign Body', desc: 'Swallowed rock' }
  ];

  function showSelect() {
    S2.StateMachine.transition(S2.StateMachine.STATES.SANDBOX_SELECT);

    var html = '<h1>VETERINARY MODE</h1>';
    html += '<h2>Operate on 16 different animals</h2>';
    html += '<div class="chapter-list">';

    for (var i = 0; i < animals.length; i++) {
      var animal = animals[i];

      html += '<div class="chapter-card" data-animal="' + animal.id + '">';
      html += '<div class="ch-icon">' + animal.emoji + '</div>';
      html += '<div class="ch-info">';
      html += '<div class="ch-title">' + animal.name + '</div>';
      html += '<div class="ch-sub">' + animal.type + ' · ' + animal.condition + '</div>';
      html += '</div></div>';
    }

    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);

    var cards = document.querySelectorAll('.chapter-card');
    for (var j = 0; j < cards.length; j++) {
      cards[j].addEventListener('click', function() {
        var animalId = parseInt(this.getAttribute('data-animal'));
        S2.Audio.play('click');
        S2.Audio.hapticTap();
        startSurgery(animalId);
      });
    }
  }

  function startSurgery(animalId) {
    var animal = animals.find(function(a) { return a.id === animalId; });
    if (!animal) return;

    var patient = {
      id: 'vet_' + animal.id,
      name: animal.name,
      age: 3,
      emoji: animal.emoji,
      condition: animal.condition,
      desc: animal.desc,
      vitals: {
        hr: 80 + Math.floor(Math.random() * 40),
        bp: '120/' + (70 + Math.floor(Math.random() * 20)),
        temp: 37.5 + Math.random() * 1.0,
        o2: 92 + Math.floor(Math.random() * 8)
      }
    };

    var chapter = {
      id: 1000 + animal.id,
      title: animal.name,
      subtitle: animal.condition,
      patient: patient.id,
      organ: animal.organ,
      instruments: getDefaultInstruments(animal),
      difficulty: 'medium',
      timeLimit: 35000,
      briefing: [
        { speaker: 'DR. CHEN', text: 'Doctor, we have a ' + animal.type + ': ' + animal.name + '.' },
        { speaker: 'DR. CHEN', text: 'Condition: ' + animal.condition + '. ' + animal.desc + '.' }
      ],
      debriefing: [
        { speaker: 'DR. CHEN', text: animal.name + ' treated successfully!' }
      ]
    };

    S2.Patients[patient.id] = patient;
    S2.Chapters.push(chapter);
    S2.Procedures['chapter' + chapter.id] = generateProcedure(animal);

    S2.Story.startChapter(chapter.id);
  }

  function getDefaultInstruments(animal) {
    var base = ['scalpel', 'gauze', 'suture'];
    if (animal.organ === 'stomach') base.push('retractor', 'clamp');
    if (animal.organ === 'airway') base.push('forceps', 'dilator');
    if (animal.organ === 'leg') base.push('saw', 'drill');
    if (animal.organ === 'heart') base.push('retractor', 'catheter');
    if (animal.organ === 'kidney') base.push('clamp', 'forceps');
    return base;
  }

  function generateProcedure(animal) {
    var proc = [];
    var steps = 8;

    for (var i = 0; i < steps; i++) {
      var type = 'swipe';
      var instrument = 'scalpel';

      if (i === 0) { type = 'tap'; instrument = 'scalpel'; }
      else if (i === 1) { type = 'swipe'; instrument = 'scalpel'; }
      else if (i === 2) { type = 'tap'; instrument = 'retractor'; }
      else if (i === 3) { type = 'stitch'; instrument = 'clamp'; }
      else if (i === 4) { type = 'tap'; instrument = 'forceps'; }
      else if (i === 5) { type = 'timing'; instrument = 'suture'; }
      else if (i === 6) { type = 'swipe'; instrument = 'gauze'; }
      else { type = 'stitch'; instrument = 'suture'; }

      proc.push({
        type: type,
        instrument: instrument,
        path: generatePath(type),
        points: 100 + Math.floor(Math.random() * 100),
        desc: 'Step ' + (i + 1),
        timeLimit: 5000
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
    return [{ x: 0.5, y: 0.5 }];
  }

  return {
    showSelect: showSelect,
    startSurgery: startSurgery,
    animals: animals
  };

})();

window.S2 = window.S2 || {};
window.S2.Veterinary = S2.Veterinary;
