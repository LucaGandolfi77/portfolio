window.Games = window.Games || {};
window.Games.sequence = function (ctx) {
  var stage = ctx.stage;
  var best = 0;
  if (ctx.Save) {
    var scores = ctx.Save.getHighScores('sequence');
    if (scores.length > 0) best = scores[0].score;
  }

  ctx.head('03', 'Sound Sequence', 'memory',
    'Watch the pads, then repeat the sequence. Each round adds one more tone.',
    '<div class="stat-row">' +
      '<div class="stat"><span>round</span><strong id="seq-round">0</strong></div>' +
      '<div class="stat"><span>best</span><strong>' + best + '</strong></div>' +
      '<div class="stat"><span>status</span><strong id="seq-status">ready</strong></div>' +
      '<div class="stat"><span>input</span><strong id="seq-input">0</strong></div>' +
    '</div>' +
    '<div class="sequence-grid" id="seq-grid">' +
      [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) {
        return '<button class="sequence-pad" data-i="' + i + '"></button>';
      }).join('') +
    '</div>' +
    '<div class="controls">' +
      '<button class="button primary" id="seq-start">Start sequence</button>' +
    '</div>'
  );

  var pads = Array.prototype.slice.call(document.querySelectorAll('.sequence-pad'));
  var pattern = [], input = 0, round = 0, playing = false;

  function flash(i) {
    pads[i].classList.add('lit');
    if (ctx.Audio) {
      ctx.Audio.pattern(i);
    } else {
      var ac = window.AudioContext ? new AudioContext() : null;
      if (ac) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.frequency.value = 220 + i * 55;
        o.connect(g).connect(ac.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
        o.stop(ac.currentTime + 0.2);
      }
    }
    setTimeout(function () { pads[i].classList.remove('lit'); }, 230);
  }

  function show() {
    playing = true;
    input = 0;
    document.getElementById('seq-input').textContent = 0;
    document.getElementById('seq-status').textContent = 'watch';
    pattern.forEach(function (v, i) {
      setTimeout(function () { flash(v); }, i * 420);
    });
    setTimeout(function () {
      playing = false;
      document.getElementById('seq-status').textContent = 'your turn';
    }, pattern.length * 420 + 250);
  }

  function next() {
    pattern.push(Math.floor(Math.random() * 9));
    round++;
    document.getElementById('seq-round').textContent = round;
    show();
  }

  pads.forEach(function (p) {
    p.onclick = function () {
      if (playing) return;
      var i = Number(p.dataset.i);
      flash(i);
      if (i !== pattern[input]) {
        document.getElementById('seq-status').textContent = 'missed';
        if (ctx.Save) ctx.Save.addScore('sequence', round);
        if (ctx.Session) ctx.Session.trackComplete('sequence', round, false);
        if (ctx.Audio) ctx.Audio.fail();
        return;
      }
      input++;
      document.getElementById('seq-input').textContent = input;
      if (input === pattern.length) {
        if (ctx.Audio) ctx.Audio.tap();
        setTimeout(next, 500);
      }
    };
  });

  document.getElementById('seq-start').onclick = function () {
    pattern = [];
    round = 0;
    document.getElementById('seq-round').textContent = 0;
    if (ctx.Session) ctx.Session.trackStart('sequence');
    next();
  };
};
