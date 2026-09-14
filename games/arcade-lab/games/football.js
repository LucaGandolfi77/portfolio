window.Games = window.Games || {};
window.Games.football = function (ctx) {
  var stage = ctx.stage;

  ctx.head('10', 'Mini Football', 'simulation',
    'Set a formation, choose an approach, and simulate one match with a seeded-feeling local model.',
    '<div class="controls">' +
      '<div class="field"><label>Formation</label>' +
        '<select class="button" id="foot-form">' +
          '<option>4-3-3</option>' +
          '<option>3-5-2</option>' +
          '<option>5-4-1</option>' +
        '</select>' +
      '</div>' +
      '<div class="field"><label>Approach</label>' +
        '<select class="button" id="foot-style">' +
          '<option>Balanced</option>' +
          '<option>Press high</option>' +
          '<option>Counter</option>' +
        '</select>' +
      '</div>' +
      '<button class="button primary" id="foot-play">Play match</button>' +
    '</div>' +
    '<div class="stat-row">' +
      '<div class="stat"><span>score</span><strong id="foot-score">-</strong></div>' +
      '<div class="stat"><span>possession</span><strong id="foot-pos">-</strong></div>' +
      '<div class="stat"><span>shots</span><strong id="foot-shots">-</strong></div>' +
      '<div class="stat"><span>result</span><strong id="foot-result">ready</strong></div>' +
    '</div>' +
    '<div class="notice" id="foot-log">Pick your plan, then simulate the match.</div>'
  );

  document.getElementById('foot-play').onclick = function () {
    if (ctx.Session) ctx.Session.trackStart('football');

    var style = document.getElementById('foot-style').value;
    var bonus = style === 'Press high' ? 3 : style === 'Counter' ? 2 : 1;
    var goals = Math.floor(Math.random() * 3) + bonus % 2;
    var against = Math.floor(Math.random() * 3);
    var pos = Math.min(72, 48 + bonus * 5 + Math.floor(Math.random() * 10));
    var shots = 7 + bonus + Math.floor(Math.random() * 8);

    document.getElementById('foot-score').textContent = goals + ' - ' + against;
    document.getElementById('foot-pos').textContent = pos + '%';
    document.getElementById('foot-shots').textContent = shots;

    var won = goals > against;
    var drawn = goals === against;
    document.getElementById('foot-result').textContent = won ? 'win' : drawn ? 'draw' : 'loss';

    var formation = document.getElementById('foot-form').value;
    document.getElementById('foot-log').textContent =
      'Your ' + formation + ' created ' + shots + ' shots. The ' + style.toLowerCase() +
      ' plan ' + (won ? 'worked.' : 'needs another match.');

    var score = won ? 50 : drawn ? 20 : 5;
    if (ctx.Save) ctx.Save.addScore('football', score);
    if (ctx.Session) ctx.Session.trackComplete('football', score, won);
    if (ctx.Audio) {
      if (won) ctx.Audio.success();
      else if (drawn) ctx.Audio.tap();
      else ctx.Audio.fail();
    }
  };
};
