(function () {
  'use strict';

  var PARTICLE_COLORS = ['#f4b860', '#68c2b1'];
  var MAX_PARTICLES = 40;

  function init(container) {
    if (!container) return;
    var particles = [];
    var running = true;
    var w = container.offsetWidth || window.innerWidth;
    var h = container.offsetHeight || window.innerHeight;

    function createParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        r: 2 + Math.random() * 2,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        alpha: Math.random() * 0.6 + 0.1,
        dAlpha: (Math.random() - 0.5) * 0.008
      };
    }

    for (var i = 0; i < MAX_PARTICLES; i++) {
      particles.push(createParticle());
    }

    function animate() {
      if (!running) return;

      var existing = container.querySelector('.particle');
      if (!existing) {
        var layer = document.createElement('div');
        layer.className = 'particle-layer';
        layer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;';
        container.appendChild(layer);
      }

      var layer = container.querySelector('.particle-layer');
      if (!layer) return;

      layer.innerHTML = '';

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.dAlpha;

        if (p.alpha >= 0.7 || p.alpha <= 0.05) {
          p.dAlpha = -p.dAlpha;
        }

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        var dot = document.createElement('div');
        dot.style.cssText =
          'position:absolute;border-radius:50%;pointer-events:none;' +
          'width:' + (p.r * 2) + 'px;height:' + (p.r * 2) + 'px;' +
          'left:' + (p.x - p.r) + 'px;top:' + (p.y - p.r) + 'px;' +
          'background:' + p.color + ';opacity:' + p.alpha + ';';
        layer.appendChild(dot);
      }

      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', function () {
      w = container.offsetWidth || window.innerWidth;
      h = container.offsetHeight || window.innerHeight;
    });

    return {
      stop: function () { running = false; }
    };
  }

  window.Particles = { init: init };

  document.addEventListener('DOMContentLoaded', function () {
    var el = document.getElementById('particles');
    if (el) init(el);
  });
})();
