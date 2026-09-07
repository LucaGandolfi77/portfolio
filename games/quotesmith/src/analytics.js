/* QuoteSmith — Analytics Module
   Lightweight event tracking with localStorage buffer. */
'use strict';

const QuoteSmithAnalytics = (() => {
  const KEY = 'quotesmith_analytics_v1';
  const MAX_EVENTS = 500;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function flush(events) {
    try {
      localStorage.setItem(KEY, JSON.stringify(events));
    } catch (e) {
      console.warn('[QuoteSmithAnalytics] Write failed:', e);
    }
  }

  function track(event, data) {
    const events = load();
    events.push({
      event: event,
      data: data || {},
      ts: Date.now(),
    });
    if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
    flush(events);
  }

  function exportEvents() {
    return JSON.stringify(load(), null, 2);
  }

  function clearEvents() {
    flush([]);
  }

  function getEventCount() {
    return load().length;
  }

  return { track, exportEvents, clearEvents, getEventCount };
})();
