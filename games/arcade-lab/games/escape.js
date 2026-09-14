window.Games = window.Games || {};
window.Games.escape = function (ctx) {
  var stage = ctx.stage;

  ctx.head('09', 'Local Escape Room', 'pass-and-play',
    'One player reads the clue, another solves it. The answer stays on this device.',
    '<div class="stat-row">' +
      '<div class="stat"><span>clue</span><strong id="esc-count">1/3</strong></div>' +
      '<div class="stat"><span>solved</span><strong id="esc-score">0</strong></div>' +
      '<div class="stat"><span>timer</span><strong id="esc-time">60</strong></div>' +
      '<div class="stat"><span>mode</span><strong>local</strong></div>' +
    '</div>' +
    '<div class="notice" id="esc-clue"></div>' +
    '<div class="choice-grid" id="esc-choices"></div>' +
    '<div class="controls">' +
      '<button class="button primary" id="esc-start">Start room</button>' +
    '</div>'
  );

  var qs = [
    ['I have keys but open no locks. What am I?', 'keyboard', ['window', 'map', 'door']],
    ['I speak without a mouth and hear without ears. What am I?', 'echo', ['radio', 'shadow', 'clock']],
    ['I get wetter as I dry. What am I?', 'towel', ['sponge', 'cloud', 'rain']]
  ];

  var n = 0, s = 0, t = 60, timer;

  function show() {
    var q = qs[n];
    document.getElementById('esc-count').textContent = (n + 1) + '/3';
    document.getElementById('esc-clue').textContent = q[0];
    var os = [q[1]].concat(q[2]).sort(function () { return Math.random() - 0.5; });
    document.getElementById('esc-choices').innerHTML = os.map(function (o) {
      return '<button class="choice">' + o + '</button>';
    }).join('');
    document.querySelectorAll('#esc-choices .choice').forEach(function (b) {
      b.onclick = function () {
        document.querySelectorAll('#esc-choices .choice').forEach(function (x) { x.disabled = true; });
        if (b.textContent === q[1]) {
          b.classList.add('correct');
          s++;
          document.getElementById('esc-score').textContent = s;
          if (ctx.Audio) ctx.Audio.tap();
        } else {
          b.classList.add('wrong');
          if (ctx.Audio) ctx.Audio.fail();
        }
        setTimeout(function () {
          n++;
          if (n < 3) {
            show();
          } else {
            clearInterval(timer);
            var score = s * 30;
            if (ctx.Save) ctx.Save.addScore('escape', score);
            if (ctx.Session) ctx.Session.trackComplete('escape', score, s === 3);
          }
        }, 450);
      };
    });
  }

  document.getElementById('esc-start').onclick = function () {
    n = 0;
    s = 0;
    t = 60;
    clearInterval(timer);
    if (ctx.Session) ctx.Session.trackStart('escape');
    timer = setInterval(function () {
      t--;
      document.getElementById('esc-time').textContent = t;
      if (!t) clearInterval(timer);
    }, 1000);
    show();
  };
};
