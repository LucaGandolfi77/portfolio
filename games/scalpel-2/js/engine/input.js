/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Input Handler Engine
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Input = (function() {
  'use strict';

  var active = false;
  var touchData = {
    type: null,
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    active: false,
    pathProgress: 0,
    swipeProgress: 0,
    drawPoints: [],
    timingPosition: 0
  };

  var handlers = {
    start: [],
    move: [],
    end: [],
    tap: [],
    swipe: [],
    draw: []
  };

  var canvas = null;

  /* ─── Initialize ─── */
  function init(canvasEl) {
    canvas = canvasEl;

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
  }

  function setActive(isActive) {
    active = isActive;
    if (!isActive) {
      touchData.active = false;
      touchData.type = null;
    }
  }

  /* ─── Touch Events ─── */
  function onTouchStart(e) {
    if (!active) return;
    e.preventDefault();
    var touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }

  function onTouchMove(e) {
    if (!active) return;
    e.preventDefault();
    var touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }

  function onTouchEnd(e) {
    if (!active) return;
    e.preventDefault();
    handleEnd();
  }

  /* ─── Mouse Events ─── */
  function onMouseDown(e) {
    if (!active) return;
    handleStart(e.clientX, e.clientY);
  }

  function onMouseMove(e) {
    if (!active) return;
    handleMove(e.clientX, e.clientY);
  }

  function onMouseUp(e) {
    if (!active) return;
    handleEnd();
  }

  /* ─── Core Handlers ─── */
  function handleStart(x, y) {
    touchData.startX = x;
    touchData.startY = y;
    touchData.x = x;
    touchData.y = y;
    touchData.active = true;
    touchData.drawPoints = [{ x: x, y: y }];

    notifyHandlers('start', { x: x, y: y });
  }

  function handleMove(x, y) {
    if (!touchData.active) return;

    touchData.x = x;
    touchData.y = y;
    touchData.drawPoints.push({ x: x, y: y });

    var dx = x - touchData.startX;
    var dy = y - touchData.startY;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10 && !touchData.type) {
      touchData.type = 'swipe';
    }

    if (touchData.type === 'swipe') {
      notifyHandlers('swipe', { x: x, y: y, startX: touchData.startX, startY: touchData.startY });
    }

    notifyHandlers('move', { x: x, y: y });
  }

  function handleEnd() {
    if (!touchData.active) return;

    var dx = touchData.x - touchData.startX;
    var dy = touchData.y - touchData.startY;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10 || !touchData.type) {
      touchData.type = 'tap';
      notifyHandlers('tap', { x: touchData.x, y: touchData.y });
    } else if (touchData.type === 'swipe') {
      notifyHandlers('swipe', {
        x: touchData.x,
        y: touchData.y,
        startX: touchData.startX,
        startY: touchData.startY,
        endX: touchData.x,
        endY: touchData.y,
        distance: dist
      });
    }

    if (touchData.drawPoints.length > 10) {
      notifyHandlers('draw', { points: touchData.drawPoints.slice() });
    }

    notifyHandlers('end', {
      x: touchData.x,
      y: touchData.y,
      type: touchData.type,
      drawPoints: touchData.drawPoints.slice()
    });

    touchData.active = false;
    touchData.type = null;
    touchData.drawPoints = [];
  }

  /* ─── Event Registration ─── */
  function onStart(callback) {
    handlers.start.push(callback);
    return function() {
      var idx = handlers.start.indexOf(callback);
      if (idx !== -1) handlers.start.splice(idx, 1);
    };
  }

  function onMove(callback) {
    handlers.move.push(callback);
    return function() {
      var idx = handlers.move.indexOf(callback);
      if (idx !== -1) handlers.move.splice(idx, 1);
    };
  }

  function onEnd(callback) {
    handlers.end.push(callback);
    return function() {
      var idx = handlers.end.indexOf(callback);
      if (idx !== -1) handlers.end.splice(idx, 1);
    };
  }

  function onTap(callback) {
    handlers.tap.push(callback);
    return function() {
      var idx = handlers.tap.indexOf(callback);
      if (idx !== -1) handlers.tap.splice(idx, 1);
    };
  }

  function onSwipe(callback) {
    handlers.swipe.push(callback);
    return function() {
      var idx = handlers.swipe.indexOf(callback);
      if (idx !== -1) handlers.swipe.splice(idx, 1);
    };
  }

  function onDraw(callback) {
    handlers.draw.push(callback);
    return function() {
      var idx = handlers.draw.indexOf(callback);
      if (idx !== -1) handlers.draw.splice(idx, 1);
    };
  }

  function notifyHandlers(type, data) {
    var list = handlers[type];
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      try {
        list[i](data);
      } catch (e) {
        console.error('[Input] Handler error:', e);
      }
    }
  }

  /* ─── Utility ─── */
  function getTouchData() {
    return touchData;
  }

  function isActive() {
    return active;
  }

  function clearAll() {
    handlers.start = [];
    handlers.move = [];
    handlers.end = [];
    handlers.tap = [];
    handlers.swipe = [];
    handlers.draw = [];
  }

  return {
    init: init,
    setActive: setActive,
    isActive: isActive,
    getTouchData: getTouchData,
    onStart: onStart,
    onMove: onMove,
    onEnd: onEnd,
    onTap: onTap,
    onSwipe: onSwipe,
    onDraw: onDraw,
    clearAll: clearAll
  };

})();

window.S2 = window.S2 || {};
window.S2.Input = S2.Input;
