/* CelloOS — System information */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};
  function create(root) {
    root.innerHTML = '<div class="app-pad" style="text-align:center">' +
      '<div style="font-size:46px">🖥️</div>' +
      '<h2 style="font-size:20px;margin:8px 0">CelloOS <span style="color:#000080">1.0</span></h2>' +
      '<p style="font-size:12px;line-height:1.7">Un sistema operativo desktop ricreato nel browser, ispirato ai computer del 1994.<br>Il browser Cello naviga in un web inventato e può connettersi al mondo reale via modem.</p>' +
      '<table style="margin:18px auto;border-collapse:collapse;font-size:11px;text-align:left">' +
      '<tr><td style="padding:4px 12px"><b>Versione</b></td><td>1.0 (1994 Edition)</td></tr>' +
      '<tr><td style="padding:4px 12px"><b>Memoria</b></td><td>640K OK</td></tr>' +
      '<tr><td style="padding:4px 12px"><b>Modem</b></td><td>28.8 kbps virtuale</td></tr>' +
      '<tr><td style="padding:4px 12px"><b>Pagine web</b></td><td>' + (O.pages || []).length + ' offline</td></tr>' +
      '<tr><td style="padding:4px 12px"><b>File system</b></td><td>' + O.vfs.files().length + ' file</td></tr>' +
      '</table>' +
      '<p style="font-size:11px;color:#555">Nessuna libreria esterna · funziona offline · i dati restano sul dispositivo</p></div>';
    return {};
  }
  O.wm.register('about', { title: 'Informazioni di sistema', icon: 'ℹ️', create: create });
}());
