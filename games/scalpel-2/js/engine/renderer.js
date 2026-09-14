/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Canvas Renderer Engine
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Renderer = (function() {
  'use strict';

  var canvas, ctx;
  var ecgCanvas, ecgCtx;
  var dpr = 1;
  var width = 0;
  var height = 0;
  var frame = 0;
  var running = false;
  var animId = null;
  var renderCallbacks = [];

  /* ─── Colors ─── */
  var COLORS = {
    bg: '#0a1628',
    tissue: '#1a3a5c',
    tissueLight: '#2a5a8c',
    blood: '#e74c3c',
    bloodDark: '#c0392b',
    heal: '#27ae60',
    warning: '#f39c12',
    blue: '#3498db',
    purple: '#9b59b6',
    text: '#ecf0f1',
    muted: '#5a6a80'
  };

  /* ─── Initialize ─── */
  function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    ecgCanvas = document.getElementById('ecg-mini');
    ecgCtx = ecgCanvas ? ecgCanvas.getContext('2d') : null;

    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (ecgCanvas) {
      ecgCanvas.width = 100 * dpr;
      ecgCanvas.height = 40 * dpr;
      ecgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function start() {
    if (running) return;
    running = true;
    frame = 0;
    tick();
  }

  function stop() {
    running = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function tick() {
    if (!running) return;
    frame++;
    clear();
    renderCallbacks.forEach(function(cb) {
      try { cb(ctx, width, height, frame); } catch(e) { console.error(e); }
    });
    animId = requestAnimationFrame(tick);
  }

  function clear() {
    ctx.clearRect(0, 0, width, height);
  }

  function onRender(callback) {
    renderCallbacks.push(callback);
    return function() {
      var idx = renderCallbacks.indexOf(callback);
      if (idx !== -1) renderCallbacks.splice(idx, 1);
    };
  }

  function getFrame() {
    return frame;
  }

  /* ─── Drawing Primitives ─── */
  function drawCircle(cx, cy, radius, color, alpha) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha !== undefined ? alpha : 1;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawCircleStroke(cx, cy, radius, color, lineWidth, alpha) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 2;
    ctx.globalAlpha = alpha !== undefined ? alpha : 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawRect(x, y, w, h, color, alpha) {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha !== undefined ? alpha : 1;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
  }

  function drawRoundRect(x, y, w, h, radius, color, alpha) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha !== undefined ? alpha : 1;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawLine(x1, y1, x2, y2, color, lineWidth, alpha) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 2;
    ctx.globalAlpha = alpha !== undefined ? alpha : 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawDashedLine(x1, y1, x2, y2, color, lineWidth, dashLen, alpha) {
    ctx.beginPath();
    ctx.setLineDash([dashLen || 5, dashLen || 5]);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 2;
    ctx.globalAlpha = alpha !== undefined ? alpha : 1;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  function drawPath(points, color, lineWidth, closed, alpha) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    if (closed) ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 2;
    ctx.globalAlpha = alpha !== undefined ? alpha : 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawText(text, x, y, color, size, align, alpha) {
    ctx.fillStyle = color;
    ctx.font = (size || 14) + 'px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = alpha !== undefined ? alpha : 1;
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
  }

  function drawEmoji(emoji, x, y, size) {
    ctx.font = (size || 24) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, x, y);
  }

  /* ─── Gradient ─── */
  function drawRadialGradient(cx, cy, radius, colors) {
    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    for (var i = 0; i < colors.length; i++) {
      grad.addColorStop(colors[i].stop, colors[i].color);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  }

  /* ─── Surgical Field ─── */
  function drawSurgicalField(cx, cy, radius) {
    drawRadialGradient(cx, cy, radius, [
      { stop: 0, color: '#1a3a5c' },
      { stop: 0.5, color: '#0d2137' },
      { stop: 1, color: '#0a1628' }
    ]);
  }

  /* ─── ECG ─── */
  function drawECG(hr) {
    if (!ecgCtx) return;
    ecgCtx.clearRect(0, 0, 100, 40);
    ecgCtx.strokeStyle = '#27ae60';
    ecgCtx.lineWidth = 1.5;
    ecgCtx.beginPath();

    var offset = (frame * 0.5) % 100;
    for (var x = 0; x < 100; x++) {
      var phase = (x + offset) / 100;
      var beatPhase = (phase * (hr / 60)) % 1;
      var y = ecgWave(beatPhase) * 15 + 20;
      if (x === 0) ecgCtx.moveTo(x, y);
      else ecgCtx.lineTo(x, y);
    }
    ecgCtx.stroke();
  }

  function ecgWave(t) {
    if (t < 0.1) return 0;
    if (t < 0.15) return (t - 0.1) / 0.05 * 0.3;
    if (t < 0.2) return 0.3 - (t - 0.15) / 0.05 * 0.3;
    if (t < 0.25) return 0;
    if (t < 0.3) return -(t - 0.25) / 0.05 * 0.2;
    if (t < 0.35) return -0.2 + (t - 0.3) / 0.05 * 1.0;
    if (t < 0.4) return 0.8 - (t - 0.35) / 0.05 * 0.8;
    if (t < 0.45) return 0;
    if (t < 0.55) return (t - 0.45) / 0.1 * 0.4;
    if (t < 0.7) return 0.4 - (t - 0.55) / 0.15 * 0.4;
    return 0;
  }

  /* ─── Utility ─── */
  function getWidth() { return width; }
  function getHeight() { return height; }
  function getCtx() { return ctx; }
  function getCanvas() { return canvas; }
  function getDPR() { return dpr; }
  function getColors() { return COLORS; }

  return {
    init: init,
    resize: resize,
    start: start,
    stop: stop,
    onRender: onRender,
    getFrame: getFrame,
    getWidth: getWidth,
    getHeight: getHeight,
    getCtx: getCtx,
    getCanvas: getCanvas,
    getDPR: getDPR,
    getColors: getColors,
    drawCircle: drawCircle,
    drawCircleStroke: drawCircleStroke,
    drawRect: drawRect,
    drawRoundRect: drawRoundRect,
    drawLine: drawLine,
    drawDashedLine: drawDashedLine,
    drawPath: drawPath,
    drawText: drawText,
    drawEmoji: drawEmoji,
    drawRadialGradient: drawRadialGradient,
    drawSurgicalField: drawSurgicalField,
    drawECG: drawECG,
    clear: clear
  };

})();

window.S2 = window.S2 || {};
window.S2.Renderer = S2.Renderer;
