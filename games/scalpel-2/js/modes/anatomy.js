/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Anatomy Viewer Mode
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Anatomy = (function() {
  'use strict';

  var organs = [
    {
      id: 'heart',
      name: 'Heart',
      emoji: '❤️',
      color: '#e74c3c',
      description: 'The heart pumps blood through the circulatory system. It beats about 100,000 times per day.',
      facts: [
        'Pumps 2,000 gallons of blood daily',
        'Beats 100,000 times per day',
        'Creates enough pressure to spray blood 30 feet',
        'A healthy resting heart rate is 60-100 bpm',
        'The heart has its own electrical system'
      ],
      quiz: [
        { q: 'How many chambers does the heart have?', a: ['4', '2', '6', '3'], correct: 0 },
        { q: 'What is the largest artery?', a: ['Aorta', 'Pulmonary', 'Carotid', 'Femoral'], correct: 0 },
        { q: 'What does the right ventricle pump to?', a: ['Lungs', 'Body', 'Brain', 'Liver'], correct: 0 }
      ]
    },
    {
      id: 'brain',
      name: 'Brain',
      emoji: '🧠',
      color: '#9b59b6',
      description: 'The brain controls the body. It contains ~86 billion neurons and uses 20% of body oxygen.',
      facts: [
        'Contains ~86 billion neurons',
        'Uses 20% of body oxygen',
        'Weighs about 3 pounds',
        'Can survive only 4-6 minutes without oxygen',
        'Generates enough electricity to power a lightbulb'
      ],
      quiz: [
        { q: 'How many lobes does each hemisphere have?', a: ['4', '3', '5', '6'], correct: 0 },
        { q: 'What is the largest part of the brain?', a: ['Cerebrum', 'Cerebellum', 'Brainstem', 'Thalamus'], correct: 0 },
        { q: 'What percentage of oxygen does the brain use?', a: ['20%', '10%', '30%', '5%'], correct: 0 }
      ]
    },
    {
      id: 'lungs',
      name: 'Lungs',
      emoji: '🫁',
      color: '#3498db',
      description: 'The lungs exchange oxygen and carbon dioxide. You breathe about 20,000 times per day.',
      facts: [
        'Total surface area equals a tennis court',
        'You breathe 20,000 times per day',
        'Right lung is slightly larger than left',
        'Lungs contain about 300 million alveoli',
        'At rest, you inhale about 500ml of air per breath'
      ],
      quiz: [
        { q: 'How many lobes does the right lung have?', a: ['3', '2', '4', '5'], correct: 0 },
        { q: 'What is the smallest unit of the lung?', a: ['Alveolus', 'Bronchus', 'Lobule', 'Acinus'], correct: 0 },
        { q: 'Which lung has 2 lobes?', a: ['Left', 'Right', 'Both', 'Neither'], correct: 0 }
      ]
    },
    {
      id: 'stomach',
      name: 'Stomach',
      emoji: '🫃',
      color: '#f39c12',
      description: 'The stomach breaks down food with acid and enzymes. It can expand to hold 1 liter of food.',
      facts: [
        'Produces 2-3 liters of gastric juice daily',
        'Can hold up to 1 liter of food',
        'Food stays in stomach for 2-5 hours',
        'Stomach acid has pH of 1.5-3.5',
        'The stomach lining replaces itself every 3-4 days'
      ],
      quiz: [
        { q: 'What is the pH of stomach acid?', a: ['1.5-3.5', '5-7', '7-8', '0-1'], correct: 0 },
        { q: 'How long does food stay in the stomach?', a: ['2-5 hours', '30 minutes', '8-10 hours', '1-2 hours'], correct: 0 },
        { q: 'How much gastric juice is produced daily?', a: ['2-3 liters', '500 ml', '5 liters', '100 ml'], correct: 0 }
      ]
    },
    {
      id: 'bones',
      name: 'Skeleton',
      emoji: '🦴',
      color: '#bdc3c7',
      description: 'The skeleton supports the body and protects organs. Adults have 206 bones.',
      facts: [
        'Adults have 206 bones',
        'Bones produce blood cells',
        'Bones are stronger than steel',
        'The smallest bone is in the ear',
        'Bones constantly remodel themselves'
      ],
      quiz: [
        { q: 'How many bones does an adult have?', a: ['206', '300', '186', '250'], correct: 0 },
        { q: 'What is the smallest bone?', a: ['Stapes', 'Phalanx', 'Malleus', 'Incus'], correct: 0 },
        { q: 'Where are blood cells produced?', a: ['Bone marrow', 'Liver', 'Spleen', 'Heart'], correct: 0 }
      ]
    },
    {
      id: 'liver',
      name: 'Liver',
      emoji: '🟤',
      color: '#8b4513',
      description: 'The liver processes nutrients and filters blood. It performs over 500 functions.',
      facts: [
        'Performs over 500 functions',
        'Weighs about 3 pounds',
        'Can regenerate lost tissue',
        'Filters 1.4 liters of blood per minute',
        'Produces bile to help digest fats'
      ],
      quiz: [
        { q: 'How many functions does the liver perform?', a: ['500+', '100', '1000', '50'], correct: 0 },
        { q: 'What does the liver produce?', a: ['Bile', 'Insulin', 'Hemoglobin', 'Urine'], correct: 0 },
        { q: 'Can the liver regenerate?', a: ['Yes', 'No', 'Only partially', 'Only in children'], correct: 0 }
      ]
    },
    {
      id: 'kidney',
      name: 'Kidneys',
      emoji: '🫘',
      color: '#8b4513',
      description: 'The kidneys filter blood and produce urine. They filter about 180 liters of blood daily.',
      facts: [
        'Filter 180 liters of blood daily',
        'Produce 1-2 liters of urine daily',
        'Each kidney is about the size of a fist',
        'Kidneys regulate blood pressure',
        'They balance electrolytes in the body'
      ],
      quiz: [
        { q: 'How many kidneys does a person have?', a: ['2', '1', '3', '4'], correct: 0 },
        { q: 'How much blood do kidneys filter daily?', a: ['180 liters', '50 liters', '500 liters', '10 liters'], correct: 0 },
        { q: 'What do kidneys produce?', a: ['Urine', 'Bile', 'Blood', 'Enzymes'], correct: 0 }
      ]
    },
    {
      id: 'eye',
      name: 'Eye',
      emoji: '👁️',
      color: '#2980b9',
      description: 'The eye converts light into electrical signals. It can distinguish about 10 million colors.',
      facts: [
        'Can distinguish 10 million colors',
        'The retina has 120 million rods',
        'Eyes can process 36,000 bits per hour',
        'The cornea has no blood supply',
        'Eyes move 80,000 times per day'
      ],
      quiz: [
        { q: 'How many color receptors do we have?', a: ['3', '4', '2', '5'], correct: 0 },
        { q: 'What part of the eye focuses light?', a: ['Lens', 'Cornea', 'Retina', 'Pupil'], correct: 0 },
        { q: 'What is the outer layer of the eye?', a: ['Sclera', 'Cornea', 'Retina', 'Choroid'], correct: 0 }
      ]
    }
  ];

  var currentOrgan = null;
  var quizIndex = 0;
  var quizScore = 0;

  function showSelect() {
    S2.StateMachine.transition(S2.StateMachine.STATES.SANDBOX_SELECT);

    var html = '<h1>ANATOMY VIEWER</h1>';
    html += '<h2>Explore 8 human organs</h2>';
    html += '<div class="chapter-list">';

    for (var i = 0; i < organs.length; i++) {
      var organ = organs[i];

      html += '<div class="chapter-card" data-organ="' + organ.id + '">';
      html += '<div class="ch-icon">' + organ.emoji + '</div>';
      html += '<div class="ch-info">';
      html += '<div class="ch-title">' + organ.name + '</div>';
      html += '<div class="ch-sub">' + organ.description.substring(0, 40) + '...</div>';
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
        showOrgan(organId);
      });
    }
  }

  function showOrgan(organId) {
    currentOrgan = organs.find(function(o) { return o.id === organId; });
    if (!currentOrgan) return;

    S2.StateMachine.transition(S2.StateMachine.STATES.SANDBOX);

    var html = '<h1>' + currentOrgan.emoji + ' ' + currentOrgan.name + '</h1>';
    html += '<div class="results-card">';
    html += '<p>' + currentOrgan.description + '</p>';
    html += '</div>';

    html += '<h3>FACTS</h3>';
    html += '<div class="results-card">';
    for (var i = 0; i < currentOrgan.facts.length; i++) {
      html += '<div class="detail">• ' + currentOrgan.facts[i] + '</div>';
    }
    html += '</div>';

    html += '<h3>INTERACTIVE QUIZ</h3>';
    html += '<div class="results-card">';
    html += '<div class="detail">Test your knowledge!</div>';
    html += '</div>';

    html += S2.Overlay.buildButton({ icon: '🎯', label: 'START QUIZ', type: 'primary', action: 'navigate', target: 'S2.Anatomy.startQuiz' });
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);
  }

  function startQuiz() {
    quizIndex = 0;
    quizScore = 0;
    showQuestion();
  }

  function showQuestion() {
    if (quizIndex >= currentOrgan.quiz.length) {
      showQuizResults();
      return;
    }

    var q = currentOrgan.quiz[quizIndex];

    var html = '<h1>QUESTION ' + (quizIndex + 1) + '/' + currentOrgan.quiz.length + '</h1>';
    html += '<div class="results-card">';
    html += '<div class="detail" style="font-size:1.1em">' + q.q + '</div>';
    html += '</div>';

    for (var i = 0; i < q.a.length; i++) {
      var isCorrect = i === q.correct;
      html += S2.Overlay.buildButton({
        label: q.a[i],
        action: 'navigate',
        target: 'S2.Anatomy.checkAnswer',
        args: [isCorrect]
      });
    }

    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);
  }

  function checkAnswer(isCorrect) {
    if (isCorrect) {
      quizScore++;
      S2.Toast.success('Correct!');
      S2.Audio.play('heal');
    } else {
      S2.Toast.error('Incorrect!');
      S2.Audio.play('fail');
    }

    quizIndex++;
    setTimeout(showQuestion, 1000);
  }

  function showQuizResults() {
    var total = currentOrgan.quiz.length;
    var pct = Math.round((quizScore / total) * 100);

    var html = '<h1>QUIZ COMPLETE!</h1>';
    html += '<div class="results-card">';
    html += '<div class="grade" style="color:' + (pct >= 80 ? '#2ecc71' : pct >= 50 ? '#f39c12' : '#e74c3c') + '">' + quizScore + '/' + total + '</div>';
    html += '<div class="score">' + pct + '%</div>';
    html += '</div>';

    html += S2.Overlay.buildButton({ icon: '🔄', label: 'TRY AGAIN', type: 'primary', action: 'navigate', target: 'S2.Anatomy.startQuiz' });
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'navigate', target: 'S2.Anatomy.showSelect' });

    S2.Overlay.show(html);
  }

  return {
    showSelect: showSelect,
    showOrgan: showOrgan,
    startQuiz: startQuiz,
    checkAnswer: checkAnswer,
    organs: organs
  };

})();

window.S2 = window.S2 || {};
window.S2.Anatomy = S2.Anatomy;
