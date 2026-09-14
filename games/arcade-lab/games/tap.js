window.Games = window.Games || {};
window.Games.tap = function (ctx) {
  var stage = ctx.stage;
  var best = 0;
  if (ctx.Save) {
    var scores = ctx.Save.getHighScores('tap');
    if (scores.length > 0) best = scores[0].score;
  }

  ctx.head('01', 'Tap Rush', 'reaction',
    'Hit the target as many times as possible before the 20-second clock runs out.',
    '<div class="stat-row">' +
      '<div class="stat"><span>time</span><strong id="tap-time">20</strong></div>' +
      '<div class="stat"><span>hits</span><strong id="tap-score">0</strong></div>' +
      '<div class="stat"><span>best</span><strong>' + best + '</strong></div>' +
      '<div class="stat"><span>mode</span><strong>local</strong></div>' +
    '</div>' +
    '<div class="playfield" id="tap-field">' +
      '<button class="target" id="tap-target" hidden>+</button>' +
    '</div>' +
    '<div class="controls">' +
      '<button class="button primary" id="tap-start">Start run</button>' +
    '</div>' +
    '<div class="notice" id="tap-note">The target moves after every hit.</div>'
  );

  var running = false, s = 0, t = 20, timer;
  var target = document.getElementById('tap-target');
  var field = document.getElementById('tap-field');

  function move() {
    target.style.left = Math.random() * (field.clientWidth - 50) + 'px';
    target.style.top = Math.random() * (field.clientHeight - 50) + 'px';
  }

  target.onclick = function () {
    if (!running) return;
    s++;
    document.getElementById('tap-score').textContent = s;
    if (ctx.Audio) ctx.Audio.tap();
    move();
  };

  document.getElementById('tap-start').onclick = function () {
    running = true;
    s = 0;
    t = 20;
    target.hidden = false;
    move();
    clearInterval(timer);
    if (ctx.Session) ctx.Session.trackStart('tap');
    timer = setInterval(function () {
      t--;
      document.getElementById('tap-time').textContent = t;
      if (t <= 0) {
        clearInterval(timer);
        running = false;
        target.hidden = true;
        if (ctx.Save) ctx.Save.addScore('tap', s);
        if (ctx.Session) ctx.Session.trackComplete('tap', s, s > 0);
        if (ctx.Audio) ctx.Audio.score();
        document.getElementById('tap-note').textContent = 'Run complete: ' + s + ' hits.';
      }
    }, 1000);
  };
};
