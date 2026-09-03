(function () {
  'use strict';
  var SC = window.SCARLIUS = (window.SCARLIUS || {});
  var ctx = null;
  var master = null;
  var muted = false;

  function ensure() {
    if (!ctx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.5;
        master.connect(ctx.destination);
      } catch (e) { return null; }
    }
    if (ctx && ctx.state === 'suspended') { ctx.resume().catch(function () { }); }
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    var c = ensure();
    if (!c) return;
    var t0 = c.currentTime;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol) {
    if (muted) return;
    var c = ensure();
    if (!c) return;
    var t0 = c.currentTime;
    var len = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var ch = buf.getChannelData(0);
    for (var i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource();
    src.buffer = buf;
    var g = c.createGain();
    g.gain.value = vol || 0.2;
    var f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 900;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0);
  }

  function tap() { tone(720, 0.06, 'triangle', 0.25); }
  function good() { tone(560, 0.1, 'sine', 0.2, 840); }
  function perfect() { tone(880, 0.08, 'triangle', 0.22, 1320); tone(1320, 0.12, 'sine', 0.14); }
  function miss() { noise(0.12, 0.18); tone(160, 0.18, 'sawtooth', 0.12, 90); }
  function win() { tone(523, 0.12, 'triangle', 0.2); setTimeout(function () { tone(659, 0.12, 'triangle', 0.2); }, 110); setTimeout(function () { tone(784, 0.2, 'triangle', 0.22); }, 220); }
  function lose() { tone(300, 0.2, 'sawtooth', 0.12, 180); setTimeout(function () { tone(220, 0.3, 'sawtooth', 0.12, 120); }, 180); }
  function pop() { tone(440, 0.05, 'square', 0.08, 660); }
  function slide() { tone(300, 0.04, 'sine', 0.06, 380); }
  function locked() { tone(660, 0.05, 'square', 0.12); tone(880, 0.05, 'square', 0.12); }
  function door() { noise(0.08, 0.14); tone(200, 0.12, 'sine', 0.16, 120); }
  function cheer() {
    [523, 659, 784, 1047].forEach(function (f, i) {
      setTimeout(function () { tone(f, 0.25, 'triangle', 0.2); }, i * 120);
    });
    setTimeout(function () { noise(0.5, 0.12); }, 60);
  }

  function bgmBeats() {
    if (muted) return;
    var c = ensure();
    if (!c) return;
    var step = 0;
    var iv = setInterval(function () {
      if (!ctx || ctx.state === 'suspended') return;
      step++;
      if (step % 2 === 1) { tone(90, 0.16, 'sine', 0.16, 55); }
      else { tone(70, 0.1, 'triangle', 0.1, 50); }
      if (step % 4 === 2) tone(660, 0.05, 'square', 0.04);
      if (step % 8 === 0) tone(440, 0.09, 'sine', 0.08, 880);
    }, 320);
    SC._bgmTimer = iv;
  }
  function stopBgm() {
    if (SC._bgmTimer) { clearInterval(SC._bgmTimer); SC._bgmTimer = null; }
  }

  function setMuted(m) {
    muted = m;
    if (master) master.gain.value = m ? 0 : 0.5;
  }
  function isMuted() { return muted; }

  SC.sfx = {
    tap: tap, good: good, perfect: perfect, miss: miss,
    win: win, lose: lose, pop: pop, slide: slide,
    locked: locked, door: door, cheer: cheer,
    bgmBeats: bgmBeats, stopBgm: stopBgm,
    ensure: ensure, setMuted: setMuted, isMuted: isMuted
  };
})();
