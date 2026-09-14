/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Particle System Engine
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Particles = (function() {
  'use strict';

  var particles = [];
  var maxParticles = 500;
  var enabled = true;

  /* ─── Particle Class ─── */
  function Particle(config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.ax = config.ax || 0;
    this.ay = config.ay || 0.1;
    this.size = config.size || 4;
    this.sizeEnd = config.sizeEnd !== undefined ? config.sizeEnd : 0;
    this.color = config.color || '#ecf0f1';
    this.alpha = config.alpha !== undefined ? config.alpha : 1;
    this.alphaEnd = config.alphaEnd !== undefined ? config.alphaEnd : 0;
    this.life = config.life || 60;
    this.maxLife = this.life;
    this.shape = config.shape || 'circle';
    this.rotation = config.rotation || 0;
    this.rotationSpeed = config.rotationSpeed || 0;
    this.gravity = config.gravity !== undefined ? config.gravity : 0.1;
    this.friction = config.friction || 1;
    this.alive = true;
  }

  Particle.prototype.update = function() {
    if (!this.alive) return;

    this.life--;
    if (this.life <= 0) {
      this.alive = false;
      return;
    }

    this.vx += this.ax;
    this.vy += this.ay + this.gravity;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    var progress = 1 - (this.life / this.maxLife);
    this.currentAlpha = this.alpha + (this.alphaEnd - this.alpha) * progress;
    this.currentSize = this.size + (this.sizeEnd - this.size) * progress;
  };

  Particle.prototype.draw = function(ctx) {
    if (!this.alive || this.currentAlpha <= 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.currentAlpha;
    ctx.fillStyle = this.color;

    switch (this.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, this.currentSize, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(-this.currentSize / 2, -this.currentSize / 2, this.currentSize, this.currentSize);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -this.currentSize);
        ctx.lineTo(-this.currentSize, this.currentSize);
        ctx.lineTo(this.currentSize, this.currentSize);
        ctx.closePath();
        ctx.fill();
        break;
      case 'star':
        drawStar(ctx, 0, 0, 5, this.currentSize, this.currentSize / 2);
        break;
      case 'line':
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this.currentSize, 0);
        ctx.lineTo(this.currentSize, 0);
        ctx.stroke();
        break;
    }

    ctx.restore();
  };

  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    var rot = Math.PI / 2 * 3;
    var step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (var i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  /* ─── Emitter Presets ─── */
  var PRESETS = {
    blood: function(x, y) {
      return {
        x: x, y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 - 1,
        size: Math.random() * 4 + 2,
        color: '#e74c3c',
        life: 30 + Math.random() * 20,
        gravity: 0.15
      };
    },
    spark: function(x, y) {
      return {
        x: x, y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 3 + 1,
        color: '#f39c12',
        life: 15 + Math.random() * 10,
        gravity: 0,
        shape: 'circle'
      };
    },
    smoke: function(x, y) {
      return {
        x: x, y: y,
        vx: (Math.random() - 0.5) * 1,
        vy: -Math.random() * 2 - 0.5,
        size: Math.random() * 10 + 5,
        sizeEnd: Math.random() * 20 + 10,
        color: '#7f8c8d',
        alpha: 0.4,
        alphaEnd: 0,
        life: 40 + Math.random() * 20,
        gravity: -0.02,
        shape: 'circle'
      };
    },
    heal: function(x, y) {
      return {
        x: x, y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        size: Math.random() * 4 + 2,
        color: '#27ae60',
        life: 30 + Math.random() * 15,
        gravity: -0.05,
        shape: 'star'
      };
    },
    confetti: function(x, y) {
      var colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
      return {
        x: x, y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: -Math.random() * 8 - 2,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 60 + Math.random() * 30,
        gravity: 0.2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        shape: 'square'
      };
    },
    defib: function(x, y) {
      return {
        x: x, y: y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        size: Math.random() * 3 + 1,
        color: '#f39c12',
        life: 10 + Math.random() * 8,
        gravity: 0,
        friction: 0.95,
        shape: 'line'
      };
    }
  };

  /* ─── Emission Functions ─── */
  function emit(x, y, preset, count) {
    if (!enabled) return;
    count = count || 10;
    var configFn = PRESETS[preset];
    if (!configFn) return;

    for (var i = 0; i < count; i++) {
      if (particles.length >= maxParticles) {
        var oldest = particles.shift();
      }
      var config = configFn(x, y);
      particles.push(new Particle(config));
    }
  }

  function emitAt(x, y, preset) {
    emit(x, y, preset, 1);
  }

  function emitBurst(x, y, preset, count) {
    emit(x, y, preset, count || 20);
  }

  function emitTrail(x1, y1, x2, y2, preset, count) {
    count = count || 5;
    for (var i = 0; i < count; i++) {
      var t = i / count;
      var px = x1 + (x2 - x1) * t;
      var py = y1 + (y2 - y1) * t;
      emitAt(px, py, preset);
    }
  }

  /* ─── Update & Draw ─── */
  function update() {
    for (var i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      if (!particles[i].alive) {
        particles.splice(i, 1);
      }
    }
  }

  function draw(ctx) {
    for (var i = 0; i < particles.length; i++) {
      particles[i].draw(ctx);
    }
  }

  /* ─── Management ─── */
  function clear() {
    particles = [];
  }

  function setEnabled(isEnabled) {
    enabled = isEnabled;
    if (!isEnabled) clear();
  }

  function isEnabled() {
    return enabled;
  }

  function getCount() {
    return particles.length;
  }

  function setMaxParticles(max) {
    maxParticles = max;
  }

  return {
    emit: emit,
    emitAt: emitAt,
    emitBurst: emitBurst,
    emitTrail: emitTrail,
    update: update,
    draw: draw,
    clear: clear,
    setEnabled: setEnabled,
    isEnabled: isEnabled,
    getCount: getCount,
    setMaxParticles: setMaxParticles,
    PRESETS: PRESETS
  };

})();

window.S2 = window.S2 || {};
window.S2.Particles = S2.Particles;
