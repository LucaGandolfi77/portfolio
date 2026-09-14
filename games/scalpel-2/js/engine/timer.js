/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Precise Timer Engine
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Timer = (function() {
  'use strict';

  var timers = {};
  var nextId = 1;

  /* ─── Timer Class ─── */
  function Timer(duration, options) {
    this.id = nextId++;
    this.duration = duration;
    this.remaining = duration;
    this.startTime = null;
    this.paused = false;
    this.finished = false;
    this.options = options || {};
    this.onTick = this.options.onTick || null;
    this.onComplete = this.options.onComplete || null;
    this.onWarning = this.options.onWarning || null;
    this.onDanger = this.options.onDanger || null;
    this.warningThreshold = this.options.warningThreshold || 0.3;
    this.dangerThreshold = this.options.dangerThreshold || 0.1;
    this.tickInterval = null;
    this._warned = false;
    this._dangered = false;
  }

  Timer.prototype.start = function() {
    if (this.finished) return;
    this.startTime = performance.now();
    this.paused = false;
    this._warned = false;
    this._dangered = false;
    this._startTick();
  };

  Timer.prototype._startTick = function() {
    var self = this;
    this.tickInterval = setInterval(function() {
      if (self.paused || self.finished) return;
      self._tick();
    }, 50);
  };

  Timer.prototype._tick = function() {
    if (this.paused || this.finished) return;

    var now = performance.now();
    var elapsed = now - this.startTime;
    this.remaining = Math.max(0, this.duration - elapsed);

    var pct = this.remaining / this.duration;

    if (this.onTick) {
      this.onTick(this.remaining, pct);
    }

    if (!this._warned && pct <= this.warningThreshold) {
      this._warned = true;
      if (this.onWarning) this.onWarning(this.remaining);
    }

    if (!this._dangered && pct <= this.dangerThreshold) {
      this._dangered = true;
      if (this.onDanger) this.onDanger(this.remaining);
    }

    if (this.remaining <= 0) {
      this.finished = true;
      clearInterval(this.tickInterval);
      if (this.onComplete) this.onComplete();
    }
  };

  Timer.prototype.pause = function() {
    if (this.paused || this.finished) return;
    this.paused = true;
    this._pausedRemaining = this.remaining;
    clearInterval(this.tickInterval);
  };

  Timer.prototype.resume = function() {
    if (!this.paused || this.finished) return;
    this.paused = false;
    this.startTime = performance.now() - (this.duration - this._pausedRemaining);
    this._startTick();
  };

  Timer.prototype.addTime = function(ms) {
    this.duration += ms;
    this.remaining += ms;
    if (this.startTime && !this.paused) {
      this.startTime -= ms;
    }
  };

  Timer.prototype.getRemaining = function() {
    if (this.paused) return this._pausedRemaining;
    if (this.finished) return 0;
    return this.remaining;
  };

  Timer.prototype.getProgress = function() {
    return 1 - (this.getRemaining() / this.duration);
  };

  Timer.prototype.getSeconds = function() {
    return Math.ceil(this.getRemaining() / 1000);
  };

  Timer.prototype.stop = function() {
    this.finished = true;
    clearInterval(this.tickInterval);
  };

  Timer.prototype.reset = function(newDuration) {
    this.duration = newDuration || this.duration;
    this.remaining = this.duration;
    this.startTime = null;
    this.paused = false;
    this.finished = false;
    this._warned = false;
    this._dangered = false;
    clearInterval(this.tickInterval);
  };

  /* ─── Factory Functions ─── */
  function create(duration, options) {
    var timer = new Timer(duration, options);
    timers[timer.id] = timer;
    return timer;
  }

  function createStepTimer(duration) {
    return create(duration, {
      warningThreshold: 0.3,
      dangerThreshold: 0.1,
      onWarning: function() {
        S2.Audio.play('timer_warn');
      },
      onDanger: function() {
        S2.Audio.play('timer_danger');
      }
    });
  }

  function createCountdown(seconds, onTick, onComplete) {
    var timer = create(seconds * 1000, {
      onTick: function(remaining, pct) {
        var secs = Math.ceil(remaining / 1000);
        if (onTick) onTick(secs, pct);
      },
      onComplete: onComplete
    });
    return timer;
  }

  /* ─── Management ─── */
  function getAll() {
    return timers;
  }

  function getById(id) {
    return timers[id] || null;
  }

  function stopAll() {
    for (var id in timers) {
      if (timers.hasOwnProperty(id)) {
        timers[id].stop();
      }
    }
    timers = {};
  }

  function pauseAll() {
    for (var id in timers) {
      if (timers.hasOwnProperty(id)) {
        timers[id].pause();
      }
    }
  }

  function resumeAll() {
    for (var id in timers) {
      if (timers.hasOwnProperty(id)) {
        timers[id].resume();
      }
    }
  }

  /* ─── Utility ─── */
  function formatTime(ms) {
    var secs = Math.ceil(ms / 1000);
    var mins = Math.floor(secs / 60);
    secs = secs % 60;
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  function formatTimeShort(ms) {
    return Math.ceil(ms / 1000) + 's';
  }

  return {
    create: create,
    createStepTimer: createStepTimer,
    createCountdown: createCountdown,
    getAll: getAll,
    getById: getById,
    stopAll: stopAll,
    pauseAll: pauseAll,
    resumeAll: resumeAll,
    formatTime: formatTime,
    formatTimeShort: formatTimeShort
  };

})();

window.S2 = window.S2 || {};
window.S2.Timer = S2.Timer;
