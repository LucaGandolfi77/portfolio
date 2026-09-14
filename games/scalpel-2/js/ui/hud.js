/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — HUD System
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.HUD = (function() {
  'use strict';

  var hud, score, combo, accuracy, timerBar, timerFill, timerText;
  var instrumentBar, powerupBar;
  var visible = false;

  function init() {
    hud = document.getElementById('hud');
    score = document.getElementById('hud-score');
    combo = document.getElementById('hud-combo');
    accuracy = document.getElementById('hud-accuracy');
    timerBar = document.getElementById('timer-bar');
    timerFill = document.getElementById('timer-fill');
    timerText = document.getElementById('timer-text');
    instrumentBar = document.getElementById('instrument-bar');
    powerupBar = document.getElementById('powerup-bar');
  }

  function show() {
    if (hud) hud.classList.remove('hidden');
    visible = true;
  }

  function hide() {
    if (hud) hud.classList.add('hidden');
    if (timerBar) timerBar.classList.add('hidden');
    if (instrumentBar) instrumentBar.classList.add('hidden');
    if (powerupBar) powerupBar.classList.add('hidden');
    visible = false;
  }

  function updateScore(value) {
    if (score) score.textContent = value;
  }

  function updateCombo(value) {
    if (combo) {
      combo.textContent = 'x' + value;
      if (value > 1) {
        combo.style.animation = 'comboPulse 0.3s ease';
        setTimeout(function() { combo.style.animation = ''; }, 300);
      }
    }
  }

  function updateAccuracy(value) {
    if (accuracy) {
      accuracy.textContent = value + '%';
      if (value >= 80) accuracy.style.color = '#27ae60';
      else if (value >= 50) accuracy.style.color = '#f39c12';
      else accuracy.style.color = '#e74c3c';
    }
  }

  function showTimer(remaining, total) {
    if (timerBar) timerBar.classList.remove('hidden');
    updateTimer(remaining, total);
  }

  function hideTimer() {
    if (timerBar) timerBar.classList.add('hidden');
  }

  function updateTimer(remaining, total) {
    var pct = (remaining / total) * 100;
    if (timerFill) timerFill.style.width = pct + '%';
    if (timerText) timerText.textContent = Math.ceil(remaining / 1000) + 's';
  }

  function buildInstrumentBar(instruments, activeInstrument) {
    if (!instrumentBar) return;
    instrumentBar.classList.remove('hidden');

    var html = '';
    for (var i = 0; i < instruments.length; i++) {
      var inst = S2.Instruments[instruments[i]];
      if (!inst) continue;

      var classes = ['instrument-btn'];
      if (activeInstrument === inst.id) classes.push('active');

      html += '<button class="' + classes.join(' ') + '" data-instrument="' + inst.id + '">';
      html += '<span class="instrument-icon">' + inst.icon + '</span>';
      html += '<span class="instrument-label">' + inst.name.substring(0, 4) + '</span>';
      html += '</button>';
    }

    instrumentBar.innerHTML = html;

    var buttons = instrumentBar.querySelectorAll('.instrument-btn');
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].addEventListener('click', function() {
        var instId = this.getAttribute('data-instrument');
        S2.Audio.play('click');
        S2.Audio.hapticTap();
        setActiveInstrument(instId);
        if (typeof S2.Steps !== 'undefined' && S2.Steps.onInstrumentSelect) {
          S2.Steps.onInstrumentSelect(instId);
        }
      });
    }
  }

  function setActiveInstrument(instrumentId) {
    var buttons = instrumentBar.querySelectorAll('.instrument-btn');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      if (btn.getAttribute('data-instrument') === instrumentId) {
        btn.classList.add('active');
        btn.classList.remove('wrong');
      } else {
        btn.classList.remove('active');
      }
    }
  }

  function showWrongInstrument(instrumentId) {
    var buttons = instrumentBar.querySelectorAll('.instrument-btn');
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('data-instrument') === instrumentId) {
        buttons[i].classList.add('wrong');
        setTimeout(function() { buttons[i].classList.remove('wrong'); }, 500);
      }
    }
  }

  function showPowerups(powerups) {
    if (!powerupBar) return;
    if (!powerups || powerups.length === 0) {
      powerupBar.classList.add('hidden');
      return;
    }
    powerupBar.classList.remove('hidden');
    var html = '';
    for (var i = 0; i < powerups.length; i++) {
      html += '<div class="powerup-chip">' + powerups[i].icon + ' ' + powerups[i].name + '</div>';
    }
    powerupBar.innerHTML = html;
  }

  function showAccuracy(text, type) {
    var indicator = document.getElementById('accuracy-indicator');
    if (!indicator) return;
    indicator.textContent = text;
    indicator.className = 'show ' + type;
    setTimeout(function() {
      indicator.className = '';
    }, 800);
  }

  return {
    init: init,
    show: show,
    hide: hide,
    updateScore: updateScore,
    updateCombo: updateCombo,
    updateAccuracy: updateAccuracy,
    showTimer: showTimer,
    hideTimer: hideTimer,
    updateTimer: updateTimer,
    buildInstrumentBar: buildInstrumentBar,
    setActiveInstrument: setActiveInstrument,
    showWrongInstrument: showWrongInstrument,
    showPowerups: showPowerups,
    showAccuracy: showAccuracy
  };

})();

window.S2 = window.S2 || {};
window.S2.HUD = S2.HUD;
