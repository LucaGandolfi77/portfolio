/* CelloOS — File Manager */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};

  function create(root) {
    var path = '/';
    root.innerHTML =
      '<div class="cello-app"><div class="app-toolbar">' +
      '<button class="os-btn small" data-a="up">↑ Su</button>' +
      '<button class="os-btn small" data-a="newfolder">+ Cartella</button>' +
      '<button class="os-btn small" data-a="newfile">+ File</button>' +
      '<button class="os-btn small" data-a="refresh">⟳ Aggiorna</button>' +
      '<span style="flex:1"></span><span id="fs-info" style="font-size:11px"></span></div>' +
      '<div class="pathbar" id="fs-path"></div>' +
      '<div class="vfs-list" id="fs-list"></div></div>';
    var list = root.querySelector('#fs-list'), pathEl = root.querySelector('#fs-path');

    function render() {
      pathEl.textContent = 'Cello:' + path;
      list.innerHTML = '';
      O.vfs.ls(path).forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'vfs-row';
        row.dataset.name = item.name;
        row.dataset.type = item.type;
        row.innerHTML = '<span class="ico">' + (item.type === 'dir' ? '📁' : (/\.html?$/i.test(item.name) ? '🌐' : '📄')) + '</span>' +
          '<span style="flex:1">' + item.name + '</span>' +
          '<span style="font-size:10px;color:#555">' + (item.type === 'dir' ? 'Cartella' : item.size + ' B') + '</span>';
        list.appendChild(row);
      });
      root.querySelector('#fs-info').textContent = O.vfs.files().length + ' file';
    }
    function open(row) {
      var full = O.vfs.norm(path + '/' + row.dataset.name);
      if (row.dataset.type === 'dir') { path = full; render(); return; }
      if (/\.html?$/i.test(full)) {
        O.wm.openApp('browser');
        O.bus.emit('browser:navigate', { path: full });
      } else {
        O.wm.openApp('notepad', { path: full, title: row.dataset.name });
      }
    }
    root.addEventListener('dblclick', function (e) {
      var row = e.target.closest('.vfs-row'); if (row) open(row);
    });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return;
      var a = b.dataset.a;
      if (a === 'up') { var p = path.split('/').filter(Boolean); p.pop(); path = '/' + p.join('/'); render(); }
      else if (a === 'refresh') render();
      else if (a === 'newfolder' || a === 'newfile') {
        var def = a === 'newfolder' ? 'NUOVA_CARTELLA' : 'NUOVO_FILE.TXT';
        if (a === 'newfolder') O.vfs.mkdir(path + '/' + def);
        else O.vfs.write(path + '/' + def, '');
        notify(a === 'newfolder' ? 'Cartella creata' : 'File creato');
        render();
      }
    });
    function notify(t) { O.bus.emit('notify', { text: t, kind: 'ok' }); }
    O.bus.on('vfs:change', render);
    render();
    return { path: function () { return path; } };
  }
  O.wm.register('files', { title: 'Esplora file', icon: '📁', create: create });
}());
