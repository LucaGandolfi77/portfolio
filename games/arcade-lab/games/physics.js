window.Games = window.Games || {};
window.Games.physics = function (ctx) {
  var stage = ctx.stage;

  ctx.head('07', 'Physics Toybox', 'physics',
    'Aim and launch a ball. Gravity and bounce are simulated on a canvas.',
    '<canvas class="canvas-game" id="phys-canvas" width="900" height="280"></canvas>' +
    '<div class="controls">' +
      '<button class="button primary" id="phys-launch">Launch</button>' +
      '<button class="button" id="phys-reset">Reset</button>' +
      '<span class="tag" id="phys-score">bounces 0</span>' +
    '</div>'
  );

  var c = document.getElementById('phys-canvas');
  var x = c.getContext('2d');
  var ball = { x: 60, y: 220, vx: 4, vy: -10 };
  var bounces = 0, running = false;

  function frame() {
    x.fillStyle = '#0b1014';
    x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#68c2b1';
    x.fillRect(0, 250, c.width, 4);
    x.fillStyle = '#f4b860';
    x.beginPath();
    x.arc(ball.x, ball.y, 16, 0, Math.PI * 2);
    x.fill();
    if (running) {
      ball.vy += 0.3;
      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.y > 234) {
        ball.y = 234;
        ball.vy *= -0.75;
        bounces++;
        document.getElementById('phys-score').textContent = 'bounces ' + bounces;
        if (ctx.Audio) ctx.Audio.tap();
      }
      if (ball.x > c.width + 20) {
        running = false;
        if (ctx.Save) ctx.Save.addScore('physics', bounces);
        if (ctx.Session) ctx.Session.trackComplete('physics', bounces, bounces > 0);
      }
    }
    requestAnimationFrame(frame);
  }

  document.getElementById('phys-launch').onclick = function () {
    ball = { x: 60, y: 220, vx: 4 + Math.random() * 4, vy: -10 };
    bounces = 0;
    running = true;
    if (ctx.Session) ctx.Session.trackStart('physics');
  };

  document.getElementById('phys-reset').onclick = function () {
    running = false;
    ball = { x: 60, y: 220, vx: 4, vy: -10 };
    bounces = 0;
    document.getElementById('phys-score').textContent = 'bounces 0';
  };

  frame();
};
