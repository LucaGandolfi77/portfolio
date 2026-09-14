(function () {
  'use strict';

  var STORAGE_KEY = 'arcade_analytics';
  var MAX_EVENTS = 500;

  function loadEvents() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function persist(events) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {}
  }

  function trackEvent(name, params) {
    var events = loadEvents();
    events.push({
      name: name,
      params: params || {},
      timestamp: Date.now()
    });
    if (events.length > MAX_EVENTS) {
      events = events.slice(events.length - MAX_EVENTS);
    }
    persist(events);
  }

  function exportEvents() {
    return JSON.stringify(loadEvents(), null, 2);
  }

  function clearEvents() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getEventCount() {
    return loadEvents().length;
  }

  window.Analytics = {
    trackEvent: trackEvent,
    exportEvents: exportEvents,
    clearEvents: clearEvents,
    getEventCount: getEventCount
  };
})();
