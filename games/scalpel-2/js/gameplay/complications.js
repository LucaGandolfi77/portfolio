/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Complications System
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Complications = (function() {
  'use strict';

  var active = null;
  var complications = [];

  var COMPLICATION_TYPES = [
    {
      id: 'bleeding',
      name: 'Bleeding',
      icon: '🩸',
      desc: 'Excessive bleeding detected',
      cause: ['low_accuracy', 'wrong_instrument'],
      severity: 1,
      effects: { timePenalty: 3000, accuracyPenalty: 10 }
    },
    {
      id: 'infection',
      name: 'Infection',
      icon: '🦠',
      desc: 'Risk of infection detected',
      cause: ['slow_speed', 'wrong_instrument'],
      severity: 2,
      effects: { timePenalty: 0, accuracyPenalty: 20 }
    },
    {
      id: 'allergic',
      name: 'Allergic Reaction',
      icon: '🤧',
      desc: 'Patient having allergic reaction',
      cause: ['wrong_instrument'],
      severity: 2,
      effects: { timePenalty: 5000, accuracyPenalty: 15 }
    },
    {
      id: 'nerve_damage',
      name: 'Nerve Damage',
      icon: '⚡',
      desc: 'Nerve damage detected',
      cause: ['too_fast', 'low_accuracy'],
      severity: 3,
      effects: { timePenalty: 0, accuracyPenalty: 25 }
    },
    {
      id: 'embolism',
      name: 'Embolism',
      icon: '💨',
      desc: 'Blood clot detected',
      cause: ['wrong_instrument', 'slow_speed'],
      severity: 4,
      effects: { timePenalty: 8000, accuracyPenalty: 30 }
    },
    {
      id: 'perforation',
      name: 'Perforation',
      icon: '⚠️',
      desc: 'Organ perforation detected',
      cause: ['low_accuracy', 'too_fast'],
      severity: 3,
      effects: { timePenalty: 5000, accuracyPenal: 25 }
    }
  ];

  function checkForComplication(stepAccuracy, difficulty) {
    if (active) return null;

    var chance = difficulty.compChance || 0;
    if (Math.random() > chance) return null;

    var cause = 'low_accuracy';
    if (stepAccuracy < 50) cause = 'low_accuracy';
    else if (stepAccuracy < 70) cause = 'wrong_instrument';

    var possible = COMPLICATION_TYPES.filter(function(c) {
      return c.cause.indexOf(cause) !== -1;
    });

    if (possible.length === 0) return null;

    var comp = possible[Math.floor(Math.random() * possible.length)];
    trigger(comp);
    return comp;
  }

  function trigger(complication) {
    active = complication;
    complications.push(complication);

    S2.Audio.play('complication');
    S2.Audio.hapticComplication();
    S2.Toast.error(complication.icon + ' ' + complication.name);

    if (complication.effects.timePenalty > 0) {
      S2.Toast.warning('Time penalty: +' + (complication.effects.timePenalty / 1000) + 's');
    }

    return complication;
  }

  function getActive() {
    return active;
  }

  function resolve() {
    if (!active) return null;

    var resolved = active;
    active = null;
    return resolved;
  }

  function getAccuracyPenalty() {
    if (!active) return 0;
    return active.effects.accuracyPenalty || 0;
  }

  function getTimePenalty() {
    if (!active) return 0;
    return active.effects.timePenalty || 0;
  }

  function getAll() {
    return complications;
  }

  function reset() {
    active = null;
    complications = [];
  }

  return {
    checkForComplication: checkForComplication,
    trigger: trigger,
    getActive: getActive,
    resolve: resolve,
    getAccuracyPenalty: getAccuracyPenalty,
    getTimePenalty: getTimePenalty,
    getAll: getAll,
    reset: reset,
    COMPLICATION_TYPES: COMPLICATION_TYPES
  };

})();

window.S2 = window.S2 || {};
window.S2.Complications = S2.Complications;
