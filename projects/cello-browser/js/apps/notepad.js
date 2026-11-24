/* CelloOS — Notepad with VFS autosave */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};
  var timers = {};

  function create(root, win) {
    var path = (win.ctx && win.ctx.path) || '/Cello/Documents/NOTE.TXT';
    root.innerHTML =
      '<div class="cello-app"><div class="app-toolbar">' +
      '<button class="os-btn small" data-a="save">💾 Salva</button>' +
      '<button class="os-btn small" data-a="as">Salva con nome…</button>' +
      '<input class="cello-location" data-el="path" style="max-width:280px">' +
      '<span style="flex:1"></span><span data-el="status" style="font-size:11px"></span></div>' +
      '<textarea class="note-area" data-el="text" spellcheck="false"></textarea>' +
      '<div class="note-foot"><span data-el="count">0 caratteri · 0 righe</span></div></div>';
    var area = root.querySelector('[data-el="text"]');
    var pathEl = root.querySelector('[data-el="path"]');
    var status = root.querySelector('[data-el="status"]');
    var count = root.querySelector('[data-el="count"]');
    pathEl.value = path;
    area.value = O.vfs.read(path) || '';

    function updateCount() {
      var text = area.value;
      count.textContent = text.length + ' caratteri · ' + (text.split('\n').length) + ' righe';
    }
    function save() {
      path = O.vfs.norm(pathEl.value || path);
      if (O.vfs.write(path, area.value)) {
        win.titleEl.textContent = path.split('/').pop();
        status.textContent = 'Salvato ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else status.textContent = 'Errore di salvataggio';
    }
    area.addEventListener('input', function () {
      updateCount(); status.textContent = 'Modifiche…';
      clearTimeout(timers[win.id]);
      timers[win.id] = setTimeout(save, 600);
    });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'save') save();
      if (b.dataset.a === 'as') { pathEl.focus(); pathEl.select(); status.textContent = 'Modifica il percorso e premi Salva'; }
    });
    updateCount();
    return { save: save, destroy: function () { clearTimeout(timers[win.id]); save(); } };
  }
  O.wm.register('notepad', { title: 'Blocco note', icon: '📝', create: create });
}());
