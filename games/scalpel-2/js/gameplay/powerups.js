/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Power-ups System
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Powerups = (function() {
  'use strict';

  var active = [];
  var inventory = [];

  var POWERUP_TYPES = [
    {
      id: 'extra_time',
      name: 'Extra Time',
      icon: '⏱️',
      desc: 'Adds 5 seconds to current step',
      rarity: 'common',
      effect: function() {
        return { timeBonus: 5000 };
      }
    },
    {
      id: 'score_boost',
      name: 'Score Boost',
      icon: '⭐',
      desc: 'Doubles score for next step',
      rarity: 'common',
      effect: function() {
        return { scoreMultiplier: 2 };
      }
    },
    {
      id: 'accuracy_shield',
      name: 'Accuracy Shield',
      icon: '🛡️',
      desc: 'Protects accuracy from complications',
      rarity: 'rare',
      effect: function() {
        return { accuracyShield: true };
      }
    },
    {
      id: 'combo_freeze',
      name: 'Combo Freeze',
      icon: '❄️',
      desc: 'Freezes combo for 3 steps',
      rarity: 'rare',
      effect: function() {
        return { comboFreeze: 3 };
      }
    },
    {
      id: 'heal',
      name: 'Heal',
      icon: '💚',
      desc: 'Removes active complication',
      rarity: 'epic',
      effect: function() {
        return { removeComplication: true };
      }
    }
  ];

  function getRandomPowerup(difficulty) {
    var rarity = 'common';
    var roll = Math.random();

    if (roll < 0.05) rarity = 'epic';
    else if (roll < 0.2) rarity = 'rare';

    var possible = POWERUP_TYPES.filter(function(p) {
      return p.rarity === rarity;
    });

    if (possible.length === 0) return null;
    return possible[Math.floor(Math.random() * possible.length)];
  }

  function add(powerup) {
    if (!powerup) return;
    inventory.push(powerup);
    updateDisplay();
  }

  function use(powerupId) {
    var idx = -1;
    for (var i = 0; i < inventory.length; i++) {
      if (inventory[i].id === powerupId) {
        idx = i;
        break;
      }
    }

    if (idx === -1) return null;

    var powerup = inventory.splice(idx, 1)[0];
    var effect = powerup.effect();

    active.push({ powerup: powerup, effect: effect, stepsLeft: 3 });

    S2.Audio.play('powerup');
    S2.Toast.success('Used ' + powerup.icon + ' ' + powerup.name);
    updateDisplay();

    return effect;
  }

  function tickStep() {
    for (var i = active.length - 1; i >= 0; i--) {
      active[i].stepsLeft--;
      if (active[i].stepsLeft <= 0) {
        active.splice(i, 1);
      }
    }
    updateDisplay();
  }

  function getActiveEffect(effectName) {
    for (var i = 0; i < active.length; i++) {
      if (active[i].effect[effectName] !== undefined) {
        return active[i].effect[effectName];
      }
    }
    return null;
  }

  function updateDisplay() {
    var display = active.map(function(a) {
      return { icon: a.powerup.icon, name: a.powerup.name };
    });
    S2.HUD.showPowerups(display);
  }

  function getInventory() {
    return inventory;
  }

  function getActive() {
    return active;
  }

  function reset() {
    active = [];
    inventory = [];
    updateDisplay();
  }

  return {
    getRandomPowerup: getRandomPowerup,
    add: add,
    use: use,
    tickStep: tickStep,
    getActiveEffect: getActiveEffect,
    getInventory: getInventory,
    getActive: getActive,
    reset: reset,
    POWERUP_TYPES: POWERUP_TYPES
  };

})();

window.S2 = window.S2 || {};
window.S2.Powerups = S2.Powerups;
