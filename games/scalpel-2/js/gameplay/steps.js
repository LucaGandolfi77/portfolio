/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Step Engine
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Steps = (function() {
  'use strict';

  var currentStep = null;
  var stepIndex = 0;
  var steps = [];
  var activeInstrument = null;
  var stepTimer = null;
  var stepResults = [];
  var onStepCompleteCallback = null;
  var onAllCompleteCallback = null;

  /* ─── Step Types ─── */
  var STEP_TYPES = {
    tap: TapStep,
    swipe: SwipeStep,
    stitch: StitchStep,
    navigate: NavigateStep,
    timing: TimingStep,
    draw: DrawStep
  };

  /* ─── Base Step Class ─── */
  function BaseStep(config) {
    this.config = config;
    this.type = config.type;
    this.instrument = config.instrument;
    this.desc = config.desc || '';
    this.timeLimit = config.timeLimit || 10000;
    this.completed = false;
    this.failed = false;
    this.accuracy = 0;
    this.targets = [];
    this.interacted = false;
  }

  BaseStep.prototype.start = function() {
    activeInstrument = this.instrument;
    S2.HUD.setActiveInstrument(this.instrument);
    S2.HUD.showTimer(this.timeLimit, this.timeLimit);
    S2.Input.setActive(true);

    var self = this;
    stepTimer = S2.Timer.create(this.timeLimit, {
      onTick: function(remaining, pct) {
        S2.HUD.updateTimer(remaining, self.timeLimit);
      },
      onDanger: function() {
        S2.Toast.warning('Time running out!');
      },
      onComplete: function() {
        self.fail();
      }
    });
    stepTimer.start();
  };

  BaseStep.prototype.complete = function(accuracy) {
    this.completed = true;
    this.accuracy = Math.round(accuracy);
    S2.Input.setActive(false);
    if (stepTimer) stepTimer.stop();
    S2.HUD.hideTimer();

    stepResults.push({
      type: this.type,
      instrument: this.instrument,
      accuracy: this.accuracy,
      completed: true
    });

    S2.Audio.play('success');
    S2.Audio.hapticSuccess();
    S2.HUD.showAccuracy('+' + this.accuracy + '%', accuracy >= 90 ? 'perfect' : 'good');

    S2.Particles.emitBurst(
      S2.Renderer.getWidth() / 2,
      S2.Renderer.getHeight() / 2,
      'heal',
      15
    );

    if (onStepCompleteCallback) {
      onStepCompleteCallback(this, stepIndex, steps.length);
    }
  };

  BaseStep.prototype.fail = function() {
    this.failed = true;
    this.accuracy = 0;
    S2.Input.setActive(false);
    if (stepTimer) stepTimer.stop();
    S2.HUD.hideTimer();

    stepResults.push({
      type: this.type,
      instrument: this.instrument,
      accuracy: 0,
      completed: false
    });

    S2.Audio.play('miss');
    S2.Audio.hapticFail();
    S2.HUD.showAccuracy('MISS', 'miss');

    if (onStepCompleteCallback) {
      onStepCompleteCallback(this, stepIndex, steps.length);
    }
  };

  /* ─── Tap Step ─── */
  function TapStep(config) {
    BaseStep.call(this, config);
    this.pointsNeeded = config.points || 1;
    this.pointsHit = 0;
    this.hitRadius = config.hitRadius || 40;
  }

  TapStep.prototype = Object.create(BaseStep.prototype);

  TapStep.prototype.start = function() {
    BaseStep.prototype.start.call(this);
    this.generateTargets();

    var self = this;
    this._tapHandler = function(data) {
      self.onTap(data.x, data.y);
    };
    S2.Input.onTap(this._tapHandler);
  };

  TapStep.prototype.generateTargets = function() {
    var w = S2.Renderer.getWidth();
    var h = S2.Renderer.getHeight();
    var cx = w / 2;
    var cy = h / 2;

    this.targets = [];
    for (var i = 0; i < this.pointsNeeded; i++) {
      var angle = (i / this.pointsNeeded) * Math.PI * 2 - Math.PI / 2;
      var r = Math.min(w, h) * 0.25;
      this.targets.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        hit: false
      });
    }

    this._removeRender = S2.Renderer.onRender(function(ctx, w, h, frame) {
      for (var i = 0; i < self.targets.length; i++) {
        var t = self.targets[i];
        if (t.hit) continue;
        var pulse = Math.sin(frame * 0.1) * 5 + 20;
        S2.Renderer.drawCircle(t.x, t.y, pulse, 'rgba(52, 152, 219, 0.3)');
        S2.Renderer.drawCircleStroke(t.x, t.y, 20, '#3498db', 2, 0.8);
      }
    });
    var self = this;
  };

  TapStep.prototype.onTap = function(x, y) {
    if (this.completed || this.failed) return;

    for (var i = 0; i < this.targets.length; i++) {
      var t = this.targets[i];
      if (t.hit) continue;

      var dx = x - t.x;
      var dy = y - t.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.hitRadius) {
        t.hit = true;
        this.pointsHit++;
        S2.Audio.play('hit');
        S2.Particles.emitBurst(t.x, t.y, 'spark', 8);

        if (this.pointsHit >= this.pointsNeeded) {
          this.complete(100);
        }
        return;
      }
    }

    S2.Audio.play('miss');
    this.interacted = true;
  };

  TapStep.prototype.cleanup = function() {
    if (this._removeRender) this._removeRender();
    S2.Input.clearAll();
  };

  /* ─── Swipe Step ─── */
  function SwipeStep(config) {
    BaseStep.call(this, config);
    this.pathType = config.path || 'straight';
    this.pathPoints = [];
    this.pathProgress = 0;
  }

  SwipeStep.prototype = Object.create(BaseStep.prototype);

  SwipeStep.prototype.start = function() {
    BaseStep.prototype.start.call(this);
    this.generatePath();

    var self = this;
    this._moveHandler = function(data) {
      self.onSwipeMove(data.x, data.y);
    };
    this._endHandler = function(data) {
      self.onSwipeEnd(data);
    };
    S2.Input.onMove(this._moveHandler);
    S2.Input.onEnd(this._endHandler);
  };

  SwipeStep.prototype.generatePath = function() {
    var w = S2.Renderer.getWidth();
    var h = S2.Renderer.getHeight();
    var cx = w / 2;
    var cy = h / 2;

    this.pathPoints = [];
    var count = 30;

    for (var i = 0; i < count; i++) {
      var t = i / (count - 1);
      var x, y;

      switch (this.pathType) {
        case 'straight':
          x = cx - w * 0.3 + t * w * 0.6;
          y = cy + Math.sin(t * Math.PI * 2) * 20;
          break;
        case 'curve':
          x = cx - w * 0.3 + t * w * 0.6;
          y = cy + Math.sin(t * Math.PI) * h * 0.2;
          break;
        case 'zigzag':
          x = cx - w * 0.3 + t * w * 0.6;
          y = cy + Math.sin(t * Math.PI * 4) * 30;
          break;
        default:
          x = cx - w * 0.3 + t * w * 0.6;
          y = cy;
      }

      this.pathPoints.push({ x: x, y: y });
    }

    var self = this;
    this._removeRender = S2.Renderer.onRender(function(ctx, w, h, frame) {
      if (self.pathPoints.length < 2) return;

      S2.Renderer.drawDashedLine(
        self.pathPoints[0].x, self.pathPoints[0].y,
        self.pathPoints[self.pathPoints.length - 1].x,
        self.pathPoints[self.pathPoints.length - 1].y,
        'rgba(52, 152, 219, 0.3)', 2, 5
      );

      var progressIdx = Math.floor(self.pathProgress * (self.pathPoints.length - 1));
      for (var i = 0; i <= progressIdx; i++) {
        S2.Renderer.drawCircle(self.pathPoints[i].x, self.pathPoints[i].y, 3, '#3498db', 0.8);
      }

      var pulse = Math.sin(frame * 0.1) * 3 + 8;
      S2.Renderer.drawCircle(self.pathPoints[0].x, self.pathPoints[0].y, pulse, 'rgba(39, 174, 96, 0.5)');
    });
  };

  SwipeStep.prototype.onSwipeMove = function(x, y) {
    if (this.completed || this.failed) return;

    var closest = this.findClosestPoint(x, y);
    if (closest > this.pathProgress) {
      this.pathProgress = closest;
    }
  };

  SwipeStep.prototype.onSwipeEnd = function(data) {
    if (this.completed || this.failed) return;

    var accuracy = this.pathProgress * 100;
    if (accuracy >= 80) {
      this.complete(accuracy);
    } else if (accuracy >= 50) {
      this.complete(accuracy);
    } else {
      this.complete(accuracy);
    }
  };

  SwipeStep.prototype.findClosestPoint = function(x, y) {
    var closest = 0;
    var minDist = Infinity;

    for (var i = 0; i < this.pathPoints.length; i++) {
      var p = this.pathPoints[i];
      var dx = x - p.x;
      var dy = y - p.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 50 && dist < minDist) {
        minDist = dist;
        closest = i / (this.pathPoints.length - 1);
      }
    }

    return closest;
  };

  SwipeStep.prototype.cleanup = function() {
    if (this._removeRender) this._removeRender();
    S2.Input.clearAll();
  };

  /* ─── Stitch Step ─── */
  function StitchStep(config) {
    BaseStep.call(this, config);
    this.pointsNeeded = config.points || 5;
    this.pointsHit = 0;
    this.currentSide = 0;
  }

  StitchStep.prototype = Object.create(BaseStep.prototype);

  StitchStep.prototype.start = function() {
    BaseStep.prototype.start.call(this);
    this.generateTargets();

    var self = this;
    this._tapHandler = function(data) {
      self.onTap(data.x, data.y);
    };
    S2.Input.onTap(this._tapHandler);
  };

  StitchStep.prototype.generateTargets = function() {
    var w = S2.Renderer.getWidth();
    var h = S2.Renderer.getHeight();
    var cx = w / 2;
    var cy = h / 2;

    this.targets = [];
    for (var i = 0; i < this.pointsNeeded; i++) {
      var side = i % 2 === 0 ? -1 : 1;
      var yOff = (i - this.pointsNeeded / 2) * 30;
      this.targets.push({
        x: cx + side * 40,
        y: cy + yOff,
        side: side,
        hit: false
      });
    }

    var self = this;
    this._removeRender = S2.Renderer.onRender(function(ctx, w, h, frame) {
      S2.Renderer.drawLine(cx - 40, cy - 60, cx - 40, cy + 60, '#e74c3c', 2, 0.5);
      S2.Renderer.drawLine(cx + 40, cy - 60, cx + 40, cy + 60, '#e74c3c', 2, 0.5);

      for (var i = 0; i < self.targets.length; i++) {
        var t = self.targets[i];
        if (t.hit) continue;
        var pulse = Math.sin(frame * 0.1 + i) * 3 + 12;
        S2.Renderer.drawCircle(t.x, t.y, pulse, 'rgba(243, 156, 18, 0.3)');
        S2.Renderer.drawCircleStroke(t.x, t.y, 10, '#f39c12', 2, 0.8);
      }
    });
  };

  StitchStep.prototype.onTap = function(x, y) {
    if (this.completed || this.failed) return;

    for (var i = 0; i < this.targets.length; i++) {
      var t = this.targets[i];
      if (t.hit) continue;

      var dx = x - t.x;
      var dy = y - t.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 40 && t.side === this.currentSide) {
        t.hit = true;
        this.pointsHit++;
        this.currentSide = this.currentSide === 0 ? 1 : 0;
        S2.Audio.play('sutures');
        S2.Particles.emitBurst(t.x, t.y, 'spark', 5);

        if (this.pointsHit >= this.pointsNeeded) {
          this.complete(100);
        }
        return;
      }
    }

    S2.Audio.play('miss');
  };

  StitchStep.prototype.cleanup = function() {
    if (this._removeRender) this._removeRender();
    S2.Input.clearAll();
  };

  /* ─── Navigate Step ─── */
  function NavigateStep(config) {
    BaseStep.call(this, config);
    this.pathType = config.path || 'straight';
    this.progress = 0;
  }

  NavigateStep.prototype = Object.create(BaseStep.prototype);

  NavigateStep.prototype.start = function() {
    BaseStep.prototype.start.call(this);
    this.generatePath();

    var self = this;
    this._moveHandler = function(data) {
      self.onMove(data.x, data.y);
    };
    this._endHandler = function(data) {
      self.onEnd(data);
    };
    S2.Input.onMove(this._moveHandler);
    S2.Input.onEnd(this._endHandler);
  };

  NavigateStep.prototype.generatePath = function() {
    var w = S2.Renderer.getWidth();
    var h = S2.Renderer.getHeight();
    var cx = w / 2;
    var cy = h / 2;

    this.pathPoints = [];
    var count = 40;

    for (var i = 0; i < count; i++) {
      var t = i / (count - 1);
      var x, y;

      switch (this.pathType) {
        case 'throat':
          x = cx + Math.sin(t * Math.PI * 3) * 30;
          y = cy - h * 0.4 + t * h * 0.8;
          break;
        case 'esophagus':
          x = cx + Math.sin(t * Math.PI * 2) * 20;
          y = cy - h * 0.3 + t * h * 0.6;
          break;
        default:
          x = cx;
          y = cy - h * 0.3 + t * h * 0.6;
      }

      this.pathPoints.push({ x: x, y: y });
    }

    var self = this;
    this._removeRender = S2.Renderer.onRender(function(ctx, w, h, frame) {
      if (self.pathPoints.length < 2) return;

      for (var i = 0; i < self.pathPoints.length - 1; i++) {
        var alpha = i <= Math.floor(self.progress * self.pathPoints.length) ? 0.8 : 0.2;
        S2.Renderer.drawLine(
          self.pathPoints[i].x, self.pathPoints[i].y,
          self.pathPoints[i + 1].x, self.pathPoints[i + 1].y,
          '#9b59b6', 3, alpha
        );
      }

      var headIdx = Math.min(Math.floor(self.progress * self.pathPoints.length), self.pathPoints.length - 1);
      var head = self.pathPoints[headIdx];
      var pulse = Math.sin(frame * 0.1) * 3 + 6;
      S2.Renderer.drawCircle(head.x, head.y, pulse, 'rgba(155, 89, 182, 0.5)');
    });
  };

  NavigateStep.prototype.onMove = function(x, y) {
    if (this.completed || this.failed) return;

    var newProgress = this.findProgress(x, y);
    if (newProgress > this.progress) {
      this.progress = Math.min(newProgress, 1);
    }

    if (this.progress >= 0.9) {
      this.complete(this.progress * 100);
    }
  };

  NavigateStep.prototype.onEnd = function(data) {
    if (this.completed || this.failed) return;

    if (this.progress >= 0.5) {
      this.complete(this.progress * 100);
    }
  };

  NavigateStep.prototype.findProgress = function(x, y) {
    var closest = 0;
    var minDist = Infinity;

    for (var i = 0; i < this.pathPoints.length; i++) {
      var p = this.pathPoints[i];
      var dx = x - p.x;
      var dy = y - p.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 60 && dist < minDist) {
        minDist = dist;
        closest = i / (this.pathPoints.length - 1);
      }
    }

    return closest;
  };

  NavigateStep.prototype.cleanup = function() {
    if (this._removeRender) this._removeRender();
    S2.Input.clearAll();
  };

  /* ─── Timing Step ─── */
  function TimingStep(config) {
    BaseStep.call(this, config);
    this.target = config.target || 0.5;
    this.markerPos = 0;
    this.markerSpeed = config.speed || 0.02;
    this.markerDir = 1;
  }

  TimingStep.prototype = Object.create(BaseStep.prototype);

  TimingStep.prototype.start = function() {
    BaseStep.prototype.start.call(this);

    var self = this;
    this._tapHandler = function() {
      self.onTap();
    };
    S2.Input.onTap(this._tapHandler);

    this._removeRender = S2.Renderer.onRender(function(ctx, w, h, frame) {
      var barW = w * 0.6;
      var barH = 20;
      var barX = (w - barW) / 2;
      var barY = h * 0.4;

      S2.Renderer.drawRoundRect(barX, barY, barW, barH, 4, 'rgba(255, 255, 255, 0.1)');

      var targetX = barX + self.target * barW;
      S2.Renderer.drawRoundRect(targetX - 15, barY, 30, barH, 4, 'rgba(39, 174, 96, 0.4)');

      var markerX = barX + self.markerPos * barW;
      S2.Renderer.drawCircle(markerX, barY + barH / 2, 8, '#f39c12');
    });

    this._updateInterval = setInterval(function() {
      self.markerPos += self.markerSpeed * self.markerDir;
      if (self.markerPos >= 1 || self.markerPos <= 0) {
        self.markerDir *= -1;
      }
    }, 16);
  };

  TimingStep.prototype.onTap = function() {
    if (this.completed || this.failed) return;

    var diff = Math.abs(this.markerPos - this.target);
    var accuracy = Math.max(0, 100 - diff * 200);

    if (diff < 0.15) {
      this.complete(accuracy);
    } else if (diff < 0.3) {
      this.complete(accuracy);
    } else {
      this.complete(accuracy);
    }
  };

  TimingStep.prototype.cleanup = function() {
    if (this._removeRender) this._removeRender();
    if (this._updateInterval) clearInterval(this._updateInterval);
    S2.Input.clearAll();
  };

  /* ─── Draw Step ─── */
  function DrawStep(config) {
    BaseStep.call(this, config);
    this.drawPoints = [];
  }

  DrawStep.prototype = Object.create(BaseStep.prototype);

  DrawStep.prototype.start = function() {
    BaseStep.prototype.start.call(this);

    var self = this;
    this._drawHandler = function(data) {
      self.onDraw(data.points);
    };
    this._endHandler = function() {
      self.onEnd();
    };
    S2.Input.onDraw(this._drawHandler);
    S2.Input.onEnd(this._endHandler);

    this._removeRender = S2.Renderer.onRender(function(ctx, w, h, frame) {
      var cx = w / 2;
      var cy = h / 2;
      S2.Renderer.drawCircleStroke(cx, cy, 60, 'rgba(155, 89, 182, 0.3)', 2);

      if (self.drawPoints.length > 1) {
        S2.Renderer.drawPath(self.drawPoints, '#9b59b6', 3, false, 0.8);
      }
    });
  };

  DrawStep.prototype.onDraw = function(points) {
    this.drawPoints = points || [];
  };

  DrawStep.prototype.onEnd = function() {
    if (this.completed || this.failed) return;

    if (this.drawPoints.length > 10) {
      var accuracy = Math.min(100, 70 + Math.random() * 30);
      this.complete(accuracy);
    } else {
      this.fail();
    }
  };

  DrawStep.prototype.cleanup = function() {
    if (this._removeRender) this._removeRender();
    S2.Input.clearAll();
  };

  /* ─── Step Management ─── */
  function startSteps(procedureSteps, onStepComplete, onAllComplete) {
    steps = procedureSteps.slice();
    stepIndex = 0;
    stepResults = [];
    onStepCompleteCallback = onStepComplete;
    onAllCompleteCallback = onAllComplete;

    startNextStep();
  }

  function startNextStep() {
    if (stepIndex >= steps.length) {
      if (onAllCompleteCallback) {
        onAllCompleteCallback(stepResults);
      }
      return;
    }

    var config = steps[stepIndex];
    var StepClass = STEP_TYPES[config.type];

    if (!StepClass) {
      console.error('[Steps] Unknown step type:', config.type);
      stepIndex++;
      startNextStep();
      return;
    }

    currentStep = new StepClass(config);
    currentStep.start();
  }

  function onInstrumentSelect(instrumentId) {
    if (currentStep && !currentStep.completed && !currentStep.failed) {
      if (instrumentId !== currentStep.instrument) {
        S2.Audio.play('miss');
        S2.HUD.showWrongInstrument(instrumentId);
      }
    }
  }

  function advanceStep() {
    if (currentStep) {
      currentStep.cleanup();
    }
    stepIndex++;
    startNextStep();
  }

  function getStepIndex() {
    return stepIndex;
  }

  function getStepCount() {
    return steps.length;
  }

  function getResults() {
    return stepResults;
  }

  return {
    startSteps: startSteps,
    advanceStep: advanceStep,
    onInstrumentSelect: onInstrumentSelect,
    getStepIndex: getStepIndex,
    getStepCount: getStepCount,
    getResults: getResults,
    STEP_TYPES: STEP_TYPES
  };

})();

window.S2 = window.S2 || {};
window.S2.Steps = S2.Steps;
