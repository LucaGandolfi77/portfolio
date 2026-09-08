(function() {
  'use strict';

  const BUFFER_KEY = 'esposta_analytics';
  const MAX_EVENTS = 500;

  function loadEvents() {
    try {
      const raw = localStorage.getItem(BUFFER_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveEvents(events) {
    try {
      localStorage.setItem(BUFFER_KEY, JSON.stringify(events));
    } catch (e) {}
  }

  window.Analytics = {
    trackEvent(name, params) {
      const events = loadEvents();
      const event = {
        name,
        params: params || {},
        timestamp: new Date().toISOString()
      };
      events.push(event);
      if (events.length > MAX_EVENTS) {
        events.splice(0, events.length - MAX_EVENTS);
      }
      saveEvents(events);
      console.log(`[Analytics] ${name}`, params || '');
    },

    flush() {
      const events = loadEvents();
      if (events.length === 0) return;
      console.log(`[Analytics] Flushing ${events.length} events`, events);
      // Placeholder: would POST to a server endpoint
      // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(events) });
    },

    exportEvents() {
      return JSON.stringify(loadEvents(), null, 2);
    },

    clearEvents() {
      localStorage.removeItem(BUFFER_KEY);
    },

    getEventCount() {
      return loadEvents().length;
    },

    getEventsByName(name) {
      return loadEvents().filter(e => e.name === name);
    }
  };
})();
