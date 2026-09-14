/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — State Machine Engine
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.StateMachine = (function() {
  'use strict';

  var currentState = null;
  var previousState = null;
  var stateData = {};
  var listeners = [];
  var transitions = {};

  /* ─── State Definitions ─── */
  var STATES = {
    BOOT: 'boot',
    LOADING: 'loading',
    TITLE: 'title',
    CHAPTER_SELECT: 'chapter_select',
    BRIEFING: 'briefing',
    SURGERY: 'surgery',
    STEP_COMPLETE: 'step_complete',
    COMPLICATION: 'complication',
    SURGERY_COMPLETE: 'surgery_complete',
    RESULTS: 'results',
    PAUSED: 'paused',
    DIALOGUE: 'dialogue',
    SANDBOX_SELECT: 'sandbox_select',
    SANDBOX: 'sandbox',
    DAILY_SELECT: 'daily_select',
    DAILY: 'daily',
    SPEED_SELECT: 'speed_select',
    SPEED: 'speed',
    TUTORIAL: 'tutorial',
    JOURNAL: 'journal'
  };

  /* ─── Valid Transitions ─── */
  transitions[STATES.BOOT] = [STATES.LOADING];
  transitions[STATES.LOADING] = [STATES.TITLE];
  transitions[STATES.TITLE] = [STATES.CHAPTER_SELECT, STATES.SANDBOX_SELECT, STATES.DAILY_SELECT, STATES.SPEED_SELECT, STATES.TUTORIAL, STATES.JOURNAL];
  transitions[STATES.CHAPTER_SELECT] = [STATES.BRIEFING, STATES.TITLE];
  transitions[STATES.BRIEFING] = [STATES.SURGERY, STATES.CHAPTER_SELECT];
  transitions[STATES.SURGERY] = [STATES.STEP_COMPLETE, STATES.COMPLICATION, STATES.SURGERY_COMPLETE, STATES.DIALOGUE, STATES.PAUSED];
  transitions[STATES.STEP_COMPLETE] = [STATES.SURGERY, STATES.SURGERY_COMPLETE];
  transitions[STATES.COMPLICATION] = [STATES.SURGERY];
  transitions[STATES.SURGERY_COMPLETE] = [STATES.RESULTS];
  transitions[STATES.RESULTS] = [STATES.CHAPTER_SELECT, STATES.TITLE];
  transitions[STATES.PAUSED] = [STATES.SURGERY, STATES.TITLE];
  transitions[STATES.DIALOGUE] = [STATES.SURGERY];
  transitions[STATES.SANDBOX_SELECT] = [STATES.SANDBOX, STATES.TITLE];
  transitions[STATES.SANDBOX] = [STATES.SANDBOX_SELECT, STATES.TITLE];
  transitions[STATES.DAILY_SELECT] = [STATES.DAILY, STATES.TITLE];
  transitions[STATES.DAILY] = [STATES.SURGERY, STATES.TITLE];
  transitions[STATES.SPEED_SELECT] = [STATES.SPEED, STATES.TITLE];
  transitions[STATES.SPEED] = [STATES.SURGERY, STATES.TITLE];
  transitions[STATES.TUTORIAL] = [STATES.TITLE];
  transitions[STATES.JOURNAL] = [STATES.TITLE];

  /* ─── Public API ─── */
  function getState() {
    return currentState;
  }

  function getPreviousState() {
    return previousState;
  }

  function getData() {
    return stateData;
  }

  function setData(key, value) {
    stateData[key] = value;
  }

  function canTransition(newState) {
    if (!currentState) return true;
    var valid = transitions[currentState];
    return valid && valid.indexOf(newState) !== -1;
  }

  function transition(newState, data) {
    if (!canTransition(newState)) {
      console.warn('[StateMachine] Invalid transition: ' + currentState + ' -> ' + newState);
      return false;
    }

    previousState = currentState;
    currentState = newState;

    if (data) {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          stateData[key] = data[key];
        }
      }
    }

    notifyListeners(previousState, currentState, stateData);
    return true;
  }

  function forceTransition(newState, data) {
    previousState = currentState;
    currentState = newState;

    if (data) {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          stateData[key] = data[key];
        }
      }
    }

    notifyListeners(previousState, currentState, stateData);
    return true;
  }

  function onTransition(callback) {
    if (typeof callback === 'function') {
      listeners.push(callback);
    }
    return function() {
      var idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }

  function notifyListeners(from, to, data) {
    for (var i = 0; i < listeners.length; i++) {
      try {
        listeners[i](from, to, data);
      } catch (e) {
        console.error('[StateMachine] Listener error:', e);
      }
    }
  }

  function reset() {
    currentState = null;
    previousState = null;
    stateData = {};
  }

  /* ─── Expose ─── */
  return {
    STATES: STATES,
    getState: getState,
    getPreviousState: getPreviousState,
    getData: getData,
    setData: setData,
    canTransition: canTransition,
    transition: transition,
    forceTransition: forceTransition,
    onTransition: onTransition,
    reset: reset
  };

})();

/* ─── Global alias ─── */
window.S2 = window.S2 || {};
window.S2.StateMachine = S2.StateMachine;
