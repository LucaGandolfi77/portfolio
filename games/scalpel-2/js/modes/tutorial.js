/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Tutorial System
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Tutorial = (function() {
  'use strict';

  var G = {
    INSTRUMENTS: [
      { id: 'scalpel', name: 'Scalpel', uses: 'Incisions, cutting', stepType: 'swipe', chapters: [1], tip: 'Swipe precisely along the cut line.' },
      { id: 'forceps', name: 'Forceps', uses: 'Tissue manipulation', stepType: 'tap', chapters: [2], tip: 'Tap on the exact target location.' },
      { id: 'clamp', name: 'Clamp', uses: 'Blood vessel control', stepType: 'stitch', chapters: [2, 3], tip: 'Stitch along the vessel edges.' },
      { id: 'suture', name: 'Suture', uses: 'Wound closure', stepType: 'stitch', chapters: [3], tip: 'Keep stitches even and tight.' },
      { id: 'retractor', name: 'Retractor', uses: 'Hold incision open', stepType: 'tap', chapters: [4], tip: 'Pull back gently to expose.' },
      { id: 'scissors', name: 'Scissors', uses: 'Cutting tissue', stepType: 'swipe', chapters: [5], tip: 'Cut along the marked line.' },
      { id: 'gauze', name: 'Gauze', uses: 'Absorb blood', stepType: 'swipe', chapters: [1, 2], tip: 'Swipe to dab and clean area.' },
      { id: 'drill', name: 'Drill', uses: 'Bone penetration', stepType: 'timing', chapters: [6], tip: 'Time your clicks precisely.' },
      { id: 'saw', name: 'Bone Saw', uses: 'Cutting bone', stepType: 'swipe', chapters: [6], tip: 'Cut steadily along the bone.' },
      { id: 'catheter', name: 'Catheter', uses: 'Fluid management', stepType: 'navigate', chapters: [7], tip: 'Navigate the catheter tip.' },
      { id: 'defibrillator', name: 'Defibrillator', uses: 'Heart rhythm control', stepType: 'timing', chapters: [8], tip: 'Charge and shock at the right time.' },
      { id: 'scope', name: 'Endoscope', uses: 'Internal viewing', stepType: 'navigate', chapters: [9], tip: 'Guide the scope carefully.' },
      { id: 'clamp_large', name: 'Large Clamp', uses: 'Major vessel control', stepType: 'stitch', chapters: [10], tip: 'Clamp firmly on the vessel.' },
      { id: 'dilator', name: 'Dilator', uses: 'Opening狭窄 passages', stepType: 'tap', chapters: [11], tip: 'Tap to expand gradually.' },
      { id: 'needle', name: 'Needle', uses: 'Injection, drainage', stepType: 'swipe', chapters: [12], tip: 'Insert at the correct angle.' },
      { id: 'probe', name: 'Probe', uses: 'Exploration', stepType: 'navigate', chapters: [13], tip: 'Explore gently without damage.' }
    ],
    STEP_TYPES: [
      { id: 'tap', name: 'Tap', desc: 'Tap on the exact target. Quick and precise.', icon: '👆' },
      { id: 'swipe', name: 'Swipe', desc: 'Swipe along the marked line. Smooth and steady.', icon: '👆➡️' },
      { id: 'stitch', name: 'Stitch', desc: 'Tap alternating points. Even spacing.', icon: '🪡' },
      { id: 'navigate', name: 'Navigate', desc: 'Drag instrument through the path. Avoid walls.', icon: '🧭' },
      { id: 'timing', name: 'Timing', desc: 'Tap when indicators overlap. Rhythm matters.', icon: '⏱️' },
      { id: 'draw', name: 'Draw', desc: 'Trace a shape freehand. Accuracy counts.', icon: '✏️' }
    ],
    QUIZ: [
      { q: 'What does a scalpel do?', a: ['Cuts tissue', 'Holds tissue', 'Sews tissue', 'Absorbs blood'], correct: 0 },
      { q: 'Which step type uses alternating taps?', a: ['Stitch', 'Tap', 'Swipe', 'Navigate'], correct: 0 },
      { q: 'What is a retractor used for?', a: ['Hold incision open', 'Cut bone', 'Inject fluid', 'Absorb blood'], correct: 0 },
      { q: 'When should you use a defibrillator?', a: ['Irregular heartbeat', 'Bleeding', 'Infection', 'Fracture'], correct: 0 },
      { q: 'What is the best way to close a wound?', a: ['Suture', 'Clamp', 'Drill', 'Scope'], correct: 0 },
      { q: 'Which instrument explores inside?', a: ['Probe', 'Scalpel', 'Clamp', 'Gauze'], correct: 0 },
      { q: 'What does gauze do?', a: ['Absorbs blood', 'Cuts tissue', 'Holds bones', 'Injects medicine'], correct: 0 },
      { q: 'What is a catheter for?', a: ['Fluid management', 'Cutting', 'Sewing', 'Holding'], correct: 0 },
      { q: 'Which is used on bone?', a: ['Drill', 'Suture', 'Forceps', 'Gauze'], correct: 0 },
      { q: 'What does a clamp do?', a: ['Controls vessels', 'Cuts tissue', 'Absorbs blood', 'Injects fluid'], correct: 0 },
      { q: 'How many step types are there?', a: ['6', '4', '8', '10'], correct: 0 },
      { q: 'What is timing step type for?', a: ['Rhythm-based clicks', 'Cutting', 'Sewing', 'Holding'], correct: 0 },
      { q: 'What is a scope?', a: ['Internal camera', 'Cutting tool', 'Holding tool', 'Absorbing tool'], correct: 0 },
      { q: 'What is a dilator for?', a: ['Opening狭窄 passages', 'Cutting', 'Holding', 'Sewing'], correct: 0 },
      { q: 'Which step type is freehand?', a: ['Draw', 'Tap', 'Swipe', 'Navigate'], correct: 0 }
    ]
  };

  var quizIndex = 0;
  var quizScore = 0;
  var savedQuiz = {};

  function showTutorial() {
    S2.StateMachine.transition(S2.StateMachine.STATES.SANDBOX_SELECT);

    var html = '<h1>TUTORIAL</h1>';
    html += '<h2>Learn the basics</h2>';

    html += S2.Overlay.buildButton({ icon: '🔪', label: 'INSTRUMENTS', type: 'primary', action: 'navigate', target: 'S2.Tutorial.showInstrumentGuide' });
    html += S2.Overlay.buildButton({ icon: '📋', label: 'STEP TYPES', action: 'navigate', target: 'S2.Tutorial.showStepTypesGuide' });
    html += S2.Overlay.buildButton({ icon: '🎯', label: 'SURGICAL QUIZ', action: 'navigate', target: 'S2.Tutorial.showQuiz' });
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);
  }

  function showInstrumentGuide() {
    var html = '<h1>INSTRUMENT GUIDE</h1>';
    html += '<div class="chapter-list">';

    for (var i = 0; i < G.INSTRUMENTS.length; i++) {
      var inst = G.INSTRUMENTS[i];
      var stepType = G.STEP_TYPES.find(function(s) { return s.id === inst.stepType; });

      html += '<div class="chapter-card" data-inst="' + inst.id + '">';
      html += '<div class="ch-icon">🔪</div>';
      html += '<div class="ch-info">';
      html += '<div class="ch-title">' + inst.name + '</div>';
      html += '<div class="ch-sub">' + inst.uses + '</div>';
      html += '</div></div>';
    }

    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'navigate', target: 'S2.Tutorial.showTutorial' });

    S2.Overlay.show(html);

    var cards = document.querySelectorAll('.chapter-card');
    for (var j = 0; j < cards.length; j++) {
      cards[j].addEventListener('click', function() {
        var instId = this.getAttribute('data-inst');
        S2.Audio.play('click');
        S2.Audio.hapticTap();
        showInstrumentDetail(instId);
      });
    }
  }

  function showInstrumentDetail(instId) {
    var inst = G.INSTRUMENTS.find(function(i) { return i.id === instId; });
    if (!inst) return;

    var stepType = G.STEP_TYPES.find(function(s) { return s.id === inst.stepType; });

    var html = '<h1>🔪 ' + inst.name + '</h1>';
    html += '<div class="results-card">';
    html += '<div class="detail">Used for: ' + inst.uses + '</div>';
    html += '<div class="detail">Step type: ' + (stepType ? stepType.icon + ' ' + stepType.name : inst.stepType) + '</div>';
    html += '<div class="detail">Appears in: Chapter ' + inst.chapters.join(', ') + '</div>';
    html += '<div class="detail" style="margin-top:12px;color:#f1c40f">💡 ' + inst.tip + '</div>';
    html += '</div>';

    html += S2.Overlay.buildButton({ icon: '→', label: 'NEXT', action: 'navigate', target: 'S2.Tutorial.showInstrumentDetail', args: [getNextInstrument(instId)] });
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'navigate', target: 'S2.Tutorial.showInstrumentGuide' });

    S2.Overlay.show(html);
  }

  function getNextInstrument(currentId) {
    var idx = G.INSTRUMENTS.findIndex(function(i) { return i.id === currentId; });
    return G.INSTRUMENTS[(idx + 1) % G.INSTRUMENTS.length].id;
  }

  function showStepTypesGuide() {
    var html = '<h1>STEP TYPES</h1>';
    html += '<div class="chapter-list">';

    for (var i = 0; i < G.STEP_TYPES.length; i++) {
      var st = G.STEP_TYPES[i];

      html += '<div class="chapter-card">';
      html += '<div class="ch-icon">' + st.icon + '</div>';
      html += '<div class="ch-info">';
      html += '<div class="ch-title">' + st.name + '</div>';
      html += '<div class="ch-sub">' + st.desc + '</div>';
      html += '</div></div>';
    }

    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'navigate', target: 'S2.Tutorial.showTutorial' });

    S2.Overlay.show(html);
  }

  function showQuiz() {
    loadQuiz();
    quizIndex = 0;
    quizScore = 0;
    showQuizQuestion();
  }

  function showQuizQuestion() {
    if (quizIndex >= G.QUIZ.length) {
      showQuizResults();
      return;
    }

    var q = G.QUIZ[quizIndex];

    var html = '<h1>SURGICAL QUIZ</h1>';
    html += '<div class="results-card">';
    html += '<div class="detail">Question ' + (quizIndex + 1) + '/' + G.QUIZ.length + '</div>';
    html += '<div class="detail" style="font-size:1.1em;margin-top:12px">' + q.q + '</div>';
    html += '</div>';

    for (var i = 0; i < q.a.length; i++) {
      var isCorrect = i === q.correct;
      html += S2.Overlay.buildButton({
        label: q.a[i],
        action: 'navigate',
        target: 'S2.Tutorial.checkQuizAnswer',
        args: [isCorrect]
      });
    }

    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'navigate', target: 'S2.Tutorial.showTutorial' });

    S2.Overlay.show(html);
  }

  function checkQuizAnswer(isCorrect) {
    if (isCorrect) {
      quizScore++;
      S2.Toast.success('Correct!');
      S2.Audio.play('heal');
    } else {
      S2.Toast.error('Incorrect!');
      S2.Audio.play('fail');
    }

    quizIndex++;
    setTimeout(showQuizQuestion, 1000);
  }

  function showQuizResults() {
    var total = G.QUIZ.length;
    var pct = Math.round((quizScore / total) * 100);

    var html = '<h1>QUIZ COMPLETE!</h1>';
    html += '<div class="results-card">';
    html += '<div class="grade" style="color:' + (pct >= 80 ? '#2ecc71' : pct >= 50 ? '#f39c12' : '#e74c3c') + '">' + quizScore + '/' + total + '</div>';
    html += '<div class="score">' + pct + '%</div>';
    html += '</div>';

    saveQuiz(quizScore);
    showQuizScores();

    html += S2.Overlay.buildButton({ icon: '🔄', label: 'TRY AGAIN', type: 'primary', action: 'navigate', target: 'S2.Tutorial.showQuiz' });
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'navigate', target: 'S2.Tutorial.showTutorial' });

    S2.Overlay.show(html);
  }

  function showQuizScores() {
    var scores = getSavedQuizScores();
    if (scores.length === 0) return;

    var html = '<h1>YOUR SCORES</h1>';
    html += '<div class="results-card">';

    for (var i = 0; i < scores.length; i++) {
      html += '<div class="detail">' + scores[i].score + '/' + scores[i].total + ' (' + scores[i].pct + '%) - ' + scores[i].date + '</div>';
    }

    html += '</div>';

    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'navigate', target: 'S2.Tutorial.showTutorial' });

    S2.Overlay.show(html);
  }

  function loadQuiz() {
    try {
      var data = localStorage.getItem('scalpel2_quiz');
      savedQuiz = data ? JSON.parse(data) : { scores: [] };
    } catch (e) {
      savedQuiz = { scores: [] };
    }
  }

  function saveQuiz(score) {
    var total = G.QUIZ.length;
    var pct = Math.round((score / total) * 100);
    var date = new Date().toLocaleDateString();

    savedQuiz.scores.push({ score: score, total: total, pct: pct, date: date });

    try {
      localStorage.setItem('scalpel2_quiz', JSON.stringify(savedQuiz));
    } catch (e) {}
  }

  function getSavedQuizScores() {
    return savedQuiz.scores || [];
  }

  return {
    showTutorial: showTutorial,
    showInstrumentGuide: showInstrumentGuide,
    showInstrumentDetail: showInstrumentDetail,
    showStepTypesGuide: showStepTypesGuide,
    showQuiz: showQuiz,
    checkQuizAnswer: checkQuizAnswer,
    showQuizResults: showQuizResults,
    showQuizScores: showQuizScores,
    G: G
  };

})();

window.S2 = window.S2 || {};
window.S2.Tutorial = S2.Tutorial;
