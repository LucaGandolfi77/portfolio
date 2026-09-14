window.Games = window.Games || {};
window.Games.rhythm = function (ctx) {
  var stage = ctx.stage;
  var best = 0;
  if (ctx.Save) {
    var scores = ctx.Save.getHighScores('rhythm');
    if (scores.length > 0) best = scores[0].score;
  }

  ctx.head('08', 'Music Memory', 'audio',
    'Tap the four beats in the same rhythm. The game uses Web Audio when your browser permits it.',
    '<div class="stat-row">' +
      '<div class="stat"><span>round</span><strong id="rh-round">0</strong></div>' +
      '<div class="stat"><span>best</span><strong>' + best + '</strong></div>' +
      '<div class="stat"><span>status</span><strong id="rh-status">ready</strong></div>' +
      '<div class="stat"><span>beats</span><strong id="rh-input">0</strong></div>' +
    '</div>' +
    '<div class="controls">' +
      '<button class="button primary" id="rh-start">Hear pattern</button>' +
      '<button class="button" data-beat="0">1</button>' +
      '<button class="button" data-beat="1">2</button>' +
      '<button class="button" data-beat="2">3</button>' +
      '<button class="button" data-beat="3">4</button>' +
    '</div>' +
    '<div class="notice">A deliberately tiny audio memory game. Use headphones if you want the tones to be clearer.</div>'
  );

  var pattern = [], input = 0, round = 0;

  function tone(i) {
    if (ctx.Audio) {
      ctx.Audio.beat(i);
    } else {
      var ac = window.AudioContext ? new AudioContext() : null;
      if (ac) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.frequency.value = 180 + i * 100;
        o.connect(g).connect(ac.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
        o.stop(ac.currentTime + 0.22);
      }
    }
  }

  function hear() {
    pattern.push(Math.floor(Math.random() * 4));
    input = 0;
    document.getElementById('rh-input').textContent = 0;
    document.getElementById('rh-status').textContent = 'listen';
    pattern.forEach(function (v, i) {
      setTimeout(function () { tone(v); }, i * 360);
    });
    setTimeout(function () {
      document.getElementById('rh-status').textContent = 'your turn';
    }, pattern.length * 360 + 200);
  }

  document.getElementById('rh-start').onclick = function () {
    pattern = [];
    round = 0;
    document.getElementById('rh-round').textContent = 0;
    if (ctx.Session) ctx.Session.trackStart('rhythm');
    hear();
  };

  document.querySelectorAll('[data-beat]').forEach(function (b) {
    b.onclick = function () {
      var v = Number(b.dataset.beat);
      tone(v);
      if (document.getElementById('rh-status').textContent === 'listen') return;
      if (v !== pattern[input]) {
        document.getElementById('rh-status').textContent = 'missed';
        if (ctx.Save) ctx.Save.addScore('rhythm', round);
        if (ctx.Session) ctx.Session.trackComplete('rhythm', round, false);
        if (ctx.Audio) ctx.Audio.fail();
        return;
      }
      input++;
      document.getElementById('rh-input').textContent = input;
      if (input === pattern.length) {
        round++;
        document.getElementById('rh-round').textContent = round;
        if (ctx.Audio) ctx.Audio.tap();
        setTimeout(hear, 500);
      }
    };
  });
};
