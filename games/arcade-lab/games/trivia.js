window.Games = window.Games || {};
window.Games.trivia = function (ctx) {
  var stage = ctx.stage;
  var best = 0;
  if (ctx.Save) {
    var scores = ctx.Save.getHighScores('trivia');
    if (scores.length > 0) best = scores[0].score;
  }

  ctx.head('05', 'Fake Answer', 'trivia',
    'Choose the real answer. The other choices are generated locally to sound plausible.',
    '<div class="stat-row">' +
      '<div class="stat"><span>question</span><strong id="triv-q">1/5</strong></div>' +
      '<div class="stat"><span>score</span><strong id="triv-score">0</strong></div>' +
      '<div class="stat"><span>best</span><strong>' + best + '</strong></div>' +
      '<div class="stat"><span>status</span><strong id="triv-status">ready</strong></div>' +
    '</div>' +
    '<div class="notice" id="triv-prompt"></div>' +
    '<div class="choice-grid" id="triv-choices"></div>'
  );

  var questions = [
    ['Which browser API stores small key/value preferences?', 'localStorage', ['sessionCanvas', 'browserMemory', 'pageCache']],
    ['Which API plays generated tones?', 'Web Audio API', ['Web Pixel API', 'Sound DOM', 'Audio CSS']],
    ['Which protocol supports peer-to-peer data channels?', 'WebRTC', ['WebCSV', 'PeerSQL', 'HTTP-P2P']],
    ['Which format describes a PWA install?', 'Web App Manifest', ['Page Schema', 'App CSS', 'Install XML']],
    ['Which element draws pixels?', 'canvas', ['bitmap', 'pixelbox', 'surface']]
  ];

  var n = 0, s = 0;

  function show() {
    var q = questions[n];
    document.getElementById('triv-q').textContent = (n + 1) + '/5';
    document.getElementById('triv-prompt').textContent = q[0];
    var options = [q[1]].concat(q[2]).sort(function () { return Math.random() - 0.5; });
    var w = document.getElementById('triv-choices');
    w.innerHTML = options.map(function (o) {
      return '<button class="choice">' + o + '</button>';
    }).join('');
    w.querySelectorAll('button').forEach(function (b) {
      b.onclick = function () {
        w.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
        if (b.textContent === q[1]) {
          b.classList.add('correct');
          s++;
          if (ctx.Audio) ctx.Audio.tap();
        } else {
          b.classList.add('wrong');
          var correct = Array.prototype.slice.call(w.children).find(function (x) { return x.textContent === q[1]; });
          if (correct) correct.classList.add('correct');
          if (ctx.Audio) ctx.Audio.fail();
        }
        document.getElementById('triv-score').textContent = s;
        setTimeout(function () {
          n++;
          if (n < 5) {
            show();
          } else {
            document.getElementById('triv-status').textContent = 'complete';
            var score = s * 20;
            if (ctx.Save) ctx.Save.addScore('trivia', score);
            if (ctx.Session) ctx.Session.trackComplete('trivia', score, s >= 3);
          }
        }, 500);
      };
    });
  }

  if (ctx.Session) ctx.Session.trackStart('trivia');
  show();
};
