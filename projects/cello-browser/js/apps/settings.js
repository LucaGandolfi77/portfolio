/* CelloOS — Control Panel */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};
  var WALLS = [
    ['teal', 'Verde acqua'], ['storm', 'Tempesta'], ['sand', 'Sabbia'],
    ['stars', 'Stellato'], ['green', 'Prato']
  ];
  function create(root) {
    var s = O.state.get();
    root.innerHTML = '<div class="app-pad"><h2 style="font-size:15px;margin-bottom:10px">Impostazioni di sistema</h2>' +
      '<div class="setting-row"><label for="os-wall">Sfondo</label><select id="os-wall">' +
        WALLS.map(function (w) { return '<option value="' + w[0] + '"' + (s.wallpaper === w[0] ? ' selected' : '') + '>' + w[1] + '</option>'; }).join('') +
      '</select></div>' +
      '<div class="setting-row"><label for="os-theme">Tema</label><select id="os-theme">' +
        ['classic', 'blue', 'dark'].map(function (t) { return '<option value="' + t + '"' + (s.theme === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') +
      '</select></div>' +
      '<div class="setting-row"><label for="os-sound">Suoni di sistema</label><input type="checkbox" id="os-sound"' + (s.sound ? ' checked' : '') + '></div>' +
      '<div class="setting-row"><label for="os-clock">Orologio 24 ore</label><input type="checkbox" id="os-clock"' + (s.clock24 ? ' checked' : '') + '></div>' +
      '<div class="setting-row"><label for="os-motion">Riduci animazioni</label><input type="checkbox" id="os-motion"' + (s.reducedMotion ? ' checked' : '') + '></div>' +
      '<div class="setting-row"><label for="os-icons">Icone desktop</label><input type="checkbox" id="os-icons"' + (s.showDesktopIcons ? ' checked' : '') + '></div>' +
      '<div style="margin-top:14px;display:flex;gap:6px"><button class="os-btn primary" id="os-reset">Ripristina default</button></div>' +
      '<p style="margin-top:16px;font-size:11px;color:#555">Le preferenze sono salvate in questo browser. Nessun account, nessun server.</p></div>';
    root.querySelector('#os-wall').onchange = function (e) { O.state.set({ wallpaper: e.target.value }); };
    root.querySelector('#os-theme').onchange = function (e) { O.state.set({ theme: e.target.value }); };
    root.querySelector('#os-sound').onchange = function (e) { O.state.set({ sound: e.target.checked }); };
    root.querySelector('#os-clock').onchange = function (e) { O.state.set({ clock24: e.target.checked }); O.bus.emit('clock:tick'); };
    root.querySelector('#os-motion').onchange = function (e) { O.state.set({ reducedMotion: e.target.checked }); };
    root.querySelector('#os-icons').onchange = function (e) {
      O.state.set({ showDesktopIcons: e.target.checked });
      var d = document.getElementById('desktop-icons'); if (d) d.classList.toggle('hidden', !e.target.checked);
    };
    root.querySelector('#os-reset').onclick = function () { O.state.reset(); O.bus.emit('notify', { text: 'Impostazioni ripristinate', kind: 'ok' }); };
    return {};
  }
  O.wm.register('settings', { title: 'Impostazioni', icon: '⚙', create: create });
}());
