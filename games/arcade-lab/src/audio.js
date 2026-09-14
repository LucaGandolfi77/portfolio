(function () {
  'use strict';

  var ctx = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
  }

  function playTone(freq, duration, type, startDelay) {
    var c = getCtx();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, c.currentTime + (startDelay || 0));
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (startDelay || 0) + (duration || 0.2));
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + (startDelay || 0));
    osc.stop(c.currentTime + (startDelay || 0) + (duration || 0.2));
  }

  function noise(duration, startDelay) {
    var c = getCtx();
    var bufferSize = c.sampleRate * (duration || 0.15);
    var buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    var src = c.createBufferSource();
    src.buffer = buffer;
    var gain = c.createGain();
    gain.gain.setValueAtTime(0.2, c.currentTime + (startDelay || 0));
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (startDelay || 0) + (duration || 0.15));
    src.connect(gain);
    gain.connect(c.destination);
    src.start(c.currentTime + (startDelay || 0));
  }

  function click() {
    playTone(1200, 0.03, 'square');
  }

  function success() {
    playTone(523, 0.15, 'sine', 0);
    playTone(659, 0.15, 'sine', 0.15);
    playTone(784, 0.2, 'sine', 0.3);
  }

  function fail() {
    playTone(659, 0.15, 'sine', 0);
    playTone(523, 0.2, 'sine', 0.15);
  }

  function score() {
    playTone(523, 0.08, 'sine', 0);
    playTone(659, 0.08, 'sine', 0.08);
    playTone(784, 0.08, 'sine', 0.16);
    playTone(1047, 0.15, 'sine', 0.24);
  }

  function transition() {
    noise(0.15);
  }

  function tap() {
    playTone(800, 0.04, 'triangle');
  }

  function pattern(i) {
    var base = 262;
    playTone(base + i * 55, 0.2, 'sine');
  }

  function beat(i) {
    var base = 262;
    playTone(base + i * 100, 0.12, 'square');
  }

  window.Audio = {
    click: click,
    success: success,
    fail: fail,
    score: score,
    transition: transition,
    tap: tap,
    pattern: pattern,
    beat: beat
  };
})();
