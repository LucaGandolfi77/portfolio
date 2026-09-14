/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Audio Engine (Web Audio API)
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Audio = (function() {
  'use strict';

  var ctx = null;
  var enabled = true;
  var initialized = false;
  var masterVolume = null;

  /* ─── Sound Definitions ─── */
  var SOUNDS = {
    click:      { freq:800,  dur:0.05, type:'sine',     vol:0.15 },
    hit:        { freq:440,  dur:0.10, type:'square',   vol:0.15 },
    miss:       { freq:200,  dur:0.15, type:'sawtooth', vol:0.12 },
    success:    { freq:523,  dur:0.20, type:'sine',     vol:0.18 },
    fanfare:    { freq:659,  dur:0.40, type:'sine',     vol:0.20 },
    scalpel:    { freq:1200, dur:0.08, type:'sawtooth', vol:0.10 },
    sutures:    { freq:900,  dur:0.06, type:'triangle', vol:0.10 },
    clamp:      { freq:600,  dur:0.08, type:'square',   vol:0.12 },
    defib:      { freq:300,  dur:0.30, type:'sawtooth', vol:0.25 },
    laser:      { freq:1500, dur:0.15, type:'sawtooth', vol:0.12 },
    endoscope:  { freq:700,  dur:0.10, type:'sine',     vol:0.08 },
    forceps:    { freq:800,  dur:0.06, type:'triangle', vol:0.10 },
    heartbeat:  { freq:80,   dur:0.15, type:'sine',     vol:0.15 },
    complication:{ freq:200, dur:0.25, type:'sawtooth', vol:0.18 },
    alert:      { freq:1000, dur:0.15, type:'square',   vol:0.15 },
    powerup:    { freq:880,  dur:0.15, type:'sine',     vol:0.20 },
    timer_warn: { freq:440,  dur:0.10, type:'square',   vol:0.12 },
    timer_danger:{ freq:660, dur:0.08, type:'square',   vol:0.15 },
    level_up:   { freq:523,  dur:0.30, type:'sine',     vol:0.18 },
    achievement:{ freq:784,  dur:0.40, type:'sine',     vol:0.20 },
    bone_saw:   { freq:150,  dur:0.20, type:'sawtooth', vol:0.15 },
    cast:       { freq:500,  dur:0.12, type:'triangle', vol:0.12 },
    epi:        { freq:1100, dur:0.10, type:'sine',     vol:0.15 },
    ultrasound: { freq:2000, dur:0.15, type:'sine',     vol:0.08 }
  };

  /* ─── Initialize ─── */
  function init() {
    if (initialized) return;
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
      masterVolume = ctx.createGain();
      masterVolume.gain.value = 0.5;
      masterVolume.connect(ctx.destination);
      initialized = true;
    } catch(e) {
      console.warn('[Audio] Web Audio not supported');
    }
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  /* ─── Play Sound ─── */
  function play(name) {
    if (!enabled || !initialized || !ctx) return;
    resume();

    var sound = SOUNDS[name];
    if (!sound) {
      console.warn('[Audio] Unknown sound:', name);
      return;
    }

    try {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = sound.type;
      osc.frequency.setValueAtTime(sound.freq, ctx.currentTime);

      if (sound.freqEnd) {
        osc.frequency.exponentialRampToValueAtTime(sound.freqEnd, ctx.currentTime + sound.dur);
      } else {
        osc.frequency.exponentialRampToValueAtTime(sound.freq * 0.8, ctx.currentTime + sound.dur);
      }

      gain.gain.setValueAtTime(sound.vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + sound.dur);

      osc.connect(gain);
      gain.connect(masterVolume);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + sound.dur);
    } catch(e) {
      console.error('[Audio] Play error:', e);
    }
  }

  /* ─── Haptic Feedback ─── */
  function vibrate(pattern) {
    if (!navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch(e) {}
  }

  function hapticTap() { vibrate(10); }
  function hapticSuccess() { vibrate([20, 30, 20]); }
  function hapticFail() { vibrate([50, 50, 50]); }
  function hapticComplication() { vibrate([100, 50, 100]); }
  function hapticAchievement() { vibrate([30, 50, 30, 50, 30]); }

  /* ─── Controls ─── */
  function setEnabled(isEnabled) {
    enabled = isEnabled;
    try {
      localStorage.setItem('scalpel2_sound', JSON.stringify(enabled));
    } catch(e) {}
  }

  function isEnabled() {
    return enabled;
  }

  function toggle() {
    setEnabled(!enabled);
    return enabled;
  }

  function setVolume(vol) {
    if (masterVolume) {
      masterVolume.gain.value = Math.max(0, Math.min(1, vol));
    }
  }

  return {
    init: init,
    resume: resume,
    play: play,
    vibrate: vibrate,
    hapticTap: hapticTap,
    hapticSuccess: hapticSuccess,
    hapticFail: hapticFail,
    hapticComplication: hapticComplication,
    hapticAchievement: hapticAchievement,
    setEnabled: setEnabled,
    isEnabled: isEnabled,
    toggle: toggle,
    setVolume: setVolume,
    SOUNDS: SOUNDS
  };

})();

window.S2 = window.S2 || {};
window.S2.Audio = S2.Audio;
