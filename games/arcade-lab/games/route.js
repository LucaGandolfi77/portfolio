window.Games = window.Games || {};
window.Games.route = function (ctx) {
  var stage = ctx.stage;

  ctx.head('04', 'Star Route', 'strategy',
    'Pick nodes on a route. Supplies fall as you travel; reach the beacon before they run out.',
    '<div class="stat-row">' +
      '<div class="stat"><span>fuel</span><strong id="route-fuel">8</strong></div>' +
      '<div class="stat"><span>distance</span><strong id="route-distance">0</strong></div>' +
      '<div class="stat"><span>status</span><strong id="route-status">choose</strong></div>' +
      '<div class="stat"><span>beacon</span><strong>20</strong></div>' +
    '</div>' +
    '<div class="route-grid" id="route-grid"></div>' +
    '<div class="controls">' +
      '<button class="button primary" id="route-new">New route</button>' +
    '</div>'
  );

  var grid = document.getElementById('route-grid');
  var fuel = 8, distance = 0, current = 0;

  function init() {
    fuel = 8;
    distance = 0;
    current = 0;
    grid.innerHTML = Array.from({ length: 20 }, function (_, i) {
      var label = i === 0 ? 'ship' : i === 19 ? 'beacon' : (['fuel', 'storm', 'quiet', 'fuel'][i % 4]);
      return '<button class="route-node ' + (i === 0 ? 'current' : '') + '" data-i="' + i + '">' + label + '</button>';
    }).join('');
    grid.querySelectorAll('button').forEach(function (b) {
      b.onclick = function () { move(Number(b.dataset.i)); };
    });
    document.getElementById('route-fuel').textContent = fuel;
    document.getElementById('route-distance').textContent = distance;
    document.getElementById('route-status').textContent = 'choose';
  }

  function move(i) {
    if (i <= current || i > current + 5 || fuel <= 0) return;
    current = i;
    distance += i - current + 1;
    fuel--;
    document.getElementById('route-fuel').textContent = fuel;
    document.getElementById('route-distance').textContent = current;
    grid.children[i].classList.add('visited');
    grid.children[i].classList.add('current');
    if (grid.children[i].textContent === 'fuel') {
      fuel = Math.min(8, fuel + 2);
      document.getElementById('route-fuel').textContent = fuel;
      if (ctx.Audio) ctx.Audio.tap();
    }
    if (current === 19) {
      document.getElementById('route-status').textContent = 'home';
      var score = fuel * 10 + distance;
      if (ctx.Save) ctx.Save.addScore('route', score);
      if (ctx.Session) ctx.Session.trackComplete('route', score, true);
      if (ctx.Audio) ctx.Audio.success();
    } else if (!fuel) {
      document.getElementById('route-status').textContent = 'lost';
      if (ctx.Save) ctx.Save.addScore('route', distance);
      if (ctx.Session) ctx.Session.trackComplete('route', distance, false);
      if (ctx.Audio) ctx.Audio.fail();
    }
  }

  document.getElementById('route-new').onclick = init;
  init();
};
