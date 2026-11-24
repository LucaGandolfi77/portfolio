/* CelloOS — tiny event bus */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};
  var listeners = {};
  O.bus = {
    on: function (event, fn) {
      (listeners[event] = listeners[event] || []).push(fn);
      return function () { O.bus.off(event, fn); };
    },
    off: function (event, fn) {
      listeners[event] = (listeners[event] || []).filter(function (f) { return f !== fn; });
    },
    emit: function (event, data) {
      (listeners[event] || []).slice().forEach(function (fn) {
        try { fn(data || {}); } catch (e) { console.error('[CelloOS bus]', event, e); }
      });
    }
  };
}());
