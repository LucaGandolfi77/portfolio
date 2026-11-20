/* Miraggio Pass — Bridge opzionale per i giochi del portfolio.
   Aggiungi UNA riga in qualsiasi gioco:
   <script src="../miraggio-pass/js/bridge.js"></script>
   (per i giochi in games/; per quelli in projects/ usa ../../games/miraggio-pass/js/bridge.js)

   Il bridge:
   - espone Miraggio.emit() per eventi espliciti
   - intercetta localStorage.setItem e notifica automaticamente i cambiamenti
     dei punteggi, anche senza modifiche al codice del gioco
   - espone Miraggio.getProfile() per leggerelivello/XP/titolo dal pass
   Tutto resta sul dispositivo: nessuna rete, nessun cookie. */
(function(){
  'use strict';
  if(window.__miraggioBridgeLoaded) return;
  window.__miraggioBridgeLoaded = true;

  var QUEUE_KEY = 'miraggio_events';
  var MAX = 60;

  function readQueue(){
    try { var a = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); return Array.isArray(a) ? a : []; }
    catch(e){ return []; }
  }
  function writeQueue(a){
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(a.slice(-MAX))); } catch(e){}
  }
  function push(ev){
    try {
      var q = readQueue();
      var last = q[q.length - 1];
      if(last && last.key === ev.key && last.value === ev.value && (ev.ts - last.ts) < 4000) return;
      q.push(ev);
      writeQueue(q);
      window.dispatchEvent(new CustomEvent('miraggio:event', { detail: ev }));
    } catch(e){}
  }

  var Miraggio = {
    emit: function(type, data){
      var ev = { type: type || 'custom', ts: Date.now(), page: location.pathname };
      if(data) for(var k in data) ev[k] = data[k];
      push(ev);
    },
    getProfile: function(){
      try {
        var s = JSON.parse(localStorage.getItem('miraggio_pass_v1') || 'null');
        if(!s) return null;
        return { level: s.level || 1, xp: s.xp || 0, title: s.title || '', streak: s.streak || 0,
                 badges: Object.keys(s.badges || {}).length };
      } catch(e){ return null; }
    },
    on: function(fn){
      window.addEventListener('miraggio:event', function(e){ fn(e.detail); });
    }
  };
  window.Miraggio = Miraggio;

  /* Auto-instrumentazione: intercetta i salvataggi dei record. */
  try {
    var orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value){
      orig.call(this, key, value);
      try {
        if(key && key.indexOf('miraggio_') !== 0 && String(value).length < 2000){
          push({ type: 'storage', key: String(key), value: String(value), ts: Date.now(), page: location.pathname });
        }
      } catch(e){}
    };
  } catch(e){}

  /* Pageview: dice al pass che il gioco è stato aperto. */
  try {
    window.addEventListener('load', function(){
      Miraggio.emit('pageview', { title: document.title || location.pathname });
    });
  } catch(e){}
})();
