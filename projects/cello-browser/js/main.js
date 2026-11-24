/* CelloOS — boot */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};

  function boot() {
    O.state.apply();
    O.wm.init();
    O.shell.init();
    O.wm.openApp('browser');
    O.bus.emit('notify', { text: 'Benvenuto nel World-Wide Web (1994).', kind: 'ok' });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}());
