window.Games = window.Games || {};
window.Games.memory = function (ctx) {
  var stage = ctx.stage;
  var best = 0;
  if (ctx.Save) {
    var scores = ctx.Save.getHighScores('memory');
    if (scores.length > 0) best = scores[0].score;
  }

  ctx.head('02', 'Memory Grid', 'memory',
    'Find every pair with the fewest turns. The board changes on every run.',
    '<div class="stat-row">' +
      '<div class="stat"><span>moves</span><strong id="mem-moves">0</strong></div>' +
      '<div class="stat"><span>pairs</span><strong id="mem-pairs">0/8</strong></div>' +
      '<div class="stat"><span>best</span><strong>' + best + '</strong></div>' +
      '<div class="stat"><span>status</span><strong id="mem-status">ready</strong></div>' +
    '</div>' +
    '<div class="memory-grid" id="mem-grid"></div>' +
    '<div class="controls">' +
      '<button class="button primary" id="mem-new">New board</button>' +
    '</div>'
  );

  var symbols = ['◆', '●', '▲', '✚', '★', '■', '◉', '✦'];
  var grid = document.getElementById('mem-grid');
  var cards = [], open = [], moves = 0, pairs = 0;

  function init() {
    cards = symbols.concat(symbols).sort(function () { return Math.random() - 0.5; });
    open = [];
    moves = 0;
    pairs = 0;
    document.getElementById('mem-moves').textContent = 0;
    document.getElementById('mem-pairs').textContent = '0/8';
    document.getElementById('mem-status').textContent = 'playing';
    grid.innerHTML = cards.map(function (s, i) {
      return '<button class="memory-card" data-i="' + i + '">?</button>';
    }).join('');
    grid.querySelectorAll('button').forEach(function (b) {
      b.onclick = function () { flip(Number(b.dataset.i)); };
    });
  }

  function flip(i) {
    if (open.indexOf(i) !== -1 || open.length === 2 || grid.children[i].classList.contains('matched')) return;
    open.push(i);
    grid.children[i].textContent = cards[i];
    grid.children[i].classList.add('open');
    if (open.length === 2) {
      moves++;
      document.getElementById('mem-moves').textContent = moves;
      var a = open[0], b = open[1];
      if (cards[a] === cards[b]) {
        grid.children[a].classList.add('matched');
        grid.children[b].classList.add('matched');
        pairs++;
        open = [];
        document.getElementById('mem-pairs').textContent = pairs + '/8';
        if (ctx.Audio) ctx.Audio.tap();
        if (pairs === 8) {
          document.getElementById('mem-status').textContent = 'complete';
          var score = Math.max(1, 100 - moves);
          if (ctx.Save) ctx.Save.addScore('memory', score);
          if (ctx.Session) ctx.Session.trackComplete('memory', score, true);
          if (ctx.Audio) ctx.Audio.success();
        }
      } else {
        if (ctx.Audio) ctx.Audio.fail();
        setTimeout(function () {
          [a, b].forEach(function (x) {
            grid.children[x].textContent = '?';
            grid.children[x].classList.remove('open');
          });
          open = [];
        }, 650);
      }
    }
  }

  document.getElementById('mem-new').onclick = init;
  init();
};
