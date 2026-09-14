window.Games = window.Games || {};
window.Games.rogue = function (ctx) {
  var stage = ctx.stage;

  ctx.head('06', 'Pocket Roguelike', 'strategy',
    'A whole run in three decisions. Balance health, supplies and risk across a tiny procedural expedition.',
    '<div class="stat-row">' +
      '<div class="stat"><span>health</span><strong id="rogue-hp">10</strong></div>' +
      '<div class="stat"><span>supplies</span><strong id="rogue-sup">5</strong></div>' +
      '<div class="stat"><span>floor</span><strong id="rogue-floor">1</strong></div>' +
      '<div class="stat"><span>status</span><strong id="rogue-status">choose</strong></div>' +
    '</div>' +
    '<div class="choice-grid" id="rogue-choices"></div>' +
    '<div class="notice">Every choice changes the next run. Refreshing creates no server state.</div>'
  );

  var hp = 10, sup = 5, floor = 1;

  function show() {
    if (hp <= 0 || sup < 0) {
      document.getElementById('rogue-status').textContent = 'run over';
      if (ctx.Save) ctx.Save.addScore('rogue', floor);
      if (ctx.Session) ctx.Session.trackComplete('rogue', floor, false);
      if (ctx.Audio) ctx.Audio.fail();
      return;
    }
    if (floor > 7) {
      document.getElementById('rogue-status').textContent = 'escaped';
      var score = floor * 10;
      if (ctx.Save) ctx.Save.addScore('rogue', score);
      if (ctx.Session) ctx.Session.trackComplete('rogue', score, true);
      if (ctx.Audio) ctx.Audio.success();
      return;
    }
    var choices = [
      ['Explore', 'hp', -2],
      ['Forage', 'sup', 2],
      ['Fight', 'hp', -3],
      ['Rest', 'hp', 2]
    ].sort(function () { return Math.random() - 0.5; });

    document.getElementById('rogue-choices').innerHTML = choices.slice(0, 3).map(function (c) {
      return '<button class="choice"><strong>' + c[0] + '</strong><br><small>' +
        (c[1] === 'hp' ? (c[2] > 0 ? '+' : '') + c[2] + ' health' : (c[2] > 0 ? '+' : '') + c[2] + ' supplies') +
        '</small></button>';
    }).join('');

    document.querySelectorAll('#rogue-choices .choice').forEach(function (b, i) {
      b.onclick = function () {
        var c = choices[i];
        if (c[1] === 'hp') hp += c[2]; else sup += c[2];
        floor++;
        document.getElementById('rogue-hp').textContent = hp;
        document.getElementById('rogue-sup').textContent = sup;
        document.getElementById('rogue-floor').textContent = floor;
        if (ctx.Audio) ctx.Audio.tap();
        show();
      };
    });
  }

  if (ctx.Session) ctx.Session.trackStart('rogue');
  show();
};
