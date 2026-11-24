/* CelloOS — desktop shell: icons, taskbar, Start menu, tray, notifications */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};
  var startOpen = false, notifyHistory = [];
  var $ = function (id) { return document.getElementById(id); };

  var DESKTOP_ICONS = [
    { app: 'browser', icon: '🌐', label: 'Cello Browser' },
    { app: 'files', icon: '📁', label: 'Esplora file' },
    { app: 'notepad', icon: '📝', label: 'Blocco note' },
    { app: 'terminal', icon: '▮', label: 'Terminale' },
    { app: 'calc', icon: '🧮', label: 'Calcolatrice' },
    { app: 'settings', icon: '⚙', label: 'Impostazioni' },
    { app: 'about', icon: 'ℹ️', label: 'Informazioni' }
  ];

  function notify(text, kind) {
    notifyHistory.unshift({ text: text, kind: kind || 'info', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    if (notifyHistory.length > 30) notifyHistory.pop();
    var toast = $('os-toast');
    toast.textContent = text;
    toast.classList.remove('hidden');
    clearTimeout(notify._t);
    notify._t = setTimeout(function () { toast.classList.add('hidden'); }, 2600);
    var badge = $('notify-badge');
    badge.textContent = notifyHistory.length;
    badge.classList.remove('hidden');
    renderNotifications();
  }

  function renderNotifications() {
    var list = $('notify-list');
    if (!list) return;
    list.innerHTML = notifyHistory.length
      ? notifyHistory.map(function (n) {
          return '<div class="notify-row"><b>' + (n.kind === 'error' ? '⚠ ' : '• ') + '</b>' + n.text + '<time>' + n.time + '</time></div>';
        }).join('')
      : '<div class="notify-row">Nessuna notifica.</div>';
  }

  function renderIcons() {
    var box = $('desktop-icons');
    box.innerHTML = DESKTOP_ICONS.map(function (it) {
      return '<div class="desktop-icon" data-app="' + it.app + '" tabindex="0" role="button" aria-label="' + it.label + '">' +
        '<span class="ico">' + it.icon + '</span>' + it.label + '</div>';
    }).join('');
    box.classList.toggle('hidden', !O.state.get().showDesktopIcons);
    box.addEventListener('dblclick', function (e) {
      var el = e.target.closest('[data-app]'); if (el) O.wm.openApp(el.dataset.app);
    });
    box.addEventListener('keydown', function (e) {
      var el = e.target.closest('[data-app]');
      if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); O.wm.openApp(el.dataset.app); }
    });
    box.addEventListener('click', function (e) {
      var el = e.target.closest('[data-app]');
      box.querySelectorAll('.desktop-icon').forEach(function (x) { x.classList.toggle('selected', x === el); });
    });
  }

  function renderStart() {
    $('start-apps').innerHTML = Object.keys(O.wm.apps).map(function (id) {
      var def = O.wm.apps[id];
      return '<button class="start-item" data-app="' + id + '"><i>' + (def.icon || '▣') + '</i>' + (def.title || id) + '</button>';
    }).join('');
    var docs = O.vfs.files().filter(function (p) { return /\.txt$/i.test(p); }).slice(0, 5);
    $('start-docs').innerHTML = docs.length
      ? docs.map(function (p) { return '<button class="start-item" data-doc="' + p + '"><i>📄</i>' + p.split('/').pop() + '</button>'; }).join('')
      : '<div style="font-size:11px;color:#555;padding:6px">Nessun documento</div>';
  }

  function setStart(open) {
    startOpen = open;
    $('start-menu').classList.toggle('hidden', !open);
    $('start-btn').setAttribute('aria-expanded', String(open));
    if (open) renderStart();
  }

  function renderTasks() {
    var box = $('task-buttons');
    box.innerHTML = '';
    O.wm.list().forEach(function (win) {
      var b = document.createElement('button');
      b.className = 'task-btn' + (O.wm.active() === win.id && !win.minimized ? ' active' : '');
      b.dataset.win = win.id;
      b.innerHTML = '<span>' + (O.wm.apps[win.appId]?.icon || '▣') + '</span><span>' + win.titleEl.textContent + '</span>';
      box.appendChild(b);
    });
  }

  function tickClock() {
    var d = new Date();
    var opts = O.state.get().clock24 ? { hour: '2-digit', minute: '2-digit', hour12: false } : { hour: '2-digit', minute: '2-digit', hour12: true };
    $('clock').textContent = d.toLocaleTimeString([], opts);
  }

  function modal(title, text, actions) {
    $('os-modal-title').textContent = title;
    $('os-modal-text').textContent = text;
    var box = $('os-modal-actions');
    box.innerHTML = '';
    (actions || [{ label: 'OK' }]).forEach(function (a, i) {
      var b = document.createElement('button');
      b.className = 'os-btn' + (a.primary ? ' primary' : '');
      b.textContent = a.label;
      b.onclick = function () { $('os-modal').classList.add('hidden'); a.fn && a.fn(); };
      box.appendChild(b);
    });
    $('os-modal').classList.remove('hidden');
  }

  function shutdown() {
    setStart(false);
    $('lock-screen').classList.remove('hidden');
  }

  function init() {
    renderIcons();
    renderTasks();
    tickClock();

    ['wm:open', 'wm:close', 'wm:focus', 'wm:minimize'].forEach(function (ev) { O.bus.on(ev, renderTasks); });
    O.bus.on('notify', function (d) { notify(d.text, d.kind); });
    O.bus.on('vfs:change', function () { if (startOpen) renderStart(); });
    O.bus.on('clock:tick', tickClock);
    O.bus.on('settings:change', function () {
      renderIcons();
      var icon = $('tray-sound'); if (icon) icon.textContent = O.state.get().sound ? '♪' : '✕';
      tickClock();
    });
    O.bus.on('browser:navigate', function (d) {
      var inst = O.wm.list().filter(function (w) { return w.appId === 'browser'; })[0];
      if (inst && inst.instance && inst.instance.navigate) inst.instance.navigate(d.path, { load: true });
    });

    $('start-btn').addEventListener('click', function (e) { e.stopPropagation(); setStart(!startOpen); });
    $('start-menu').addEventListener('click', function (e) {
      var app = e.target.closest('[data-app]');
      if (app) { setStart(false); O.wm.openApp(app.dataset.app); return; }
      var doc = e.target.closest('[data-doc]');
      if (doc) { setStart(false); O.wm.openApp('notepad', { path: doc.dataset.doc }); return; }
      var cmd = e.target.closest('[data-cmd]');
      if (cmd) {
        setStart(false);
        if (cmd.dataset.cmd === 'settings') O.wm.openApp('settings');
        if (cmd.dataset.cmd === 'about') O.wm.openApp('about');
        if (cmd.dataset.cmd === 'shutdown') shutdown();
      }
    });
    document.addEventListener('pointerdown', function (e) {
      if (startOpen && !e.target.closest('#start-menu') && !e.target.closest('#start-btn')) setStart(false);
      if (!$('notify-panel').classList.contains('hidden') && !e.target.closest('#notify-panel') && !e.target.closest('#tray-notify')) {
        $('notify-panel').classList.add('hidden');
      }
    });
    $('task-buttons').addEventListener('click', function (e) {
      var b = e.target.closest('[data-win]'); if (!b) return;
      var win = O.wm.get(b.dataset.win); if (!win) return;
      if (O.wm.active() === win.id && !win.minimized) O.wm.minimize(win.id);
      else { win.minimized = false; win.el.classList.remove('minimized'); O.wm.focus(win.id); }
    });
    $('tray-sound').addEventListener('click', function () {
      O.state.set({ sound: !O.state.get().sound });
      notify(O.state.get().sound ? 'Suoni attivati' : 'Suoni disattivati');
    });
    $('tray-notify').addEventListener('click', function (e) {
      e.stopPropagation();
      $('notify-panel').classList.toggle('hidden');
      $('notify-badge').classList.add('hidden');
    });
    $('notify-clear').addEventListener('click', function () { notifyHistory = []; renderNotifications(); });
    $('lock-on').addEventListener('click', function () { $('lock-screen').classList.add('hidden'); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setStart(false); $('notify-panel').classList.add('hidden'); $('os-modal').classList.add('hidden'); }
      if (e.key === 'Meta' || (e.ctrlKey && e.key === 'Escape')) { e.preventDefault(); setStart(!startOpen); }
      if (e.altKey && e.key === 'Tab') { e.preventDefault(); O.wm.cycle(); }
      if (e.altKey && (e.key === 'F4' || e.key === 'w')) { e.preventDefault(); var a = O.wm.active(); if (a) O.wm.close(a); }
      if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); O.bus.emit('browser:nav', { delta: -1 }); }
      if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); O.bus.emit('browser:nav', { delta: 1 }); }
      if (e.ctrlKey && e.key.toLowerCase() === 'l') { e.preventDefault(); var w = O.wm.active(); if (w) O.wm.get(w).body.querySelector('.cello-location')?.focus(); }
    });

    setInterval(tickClock, 20000);
    $('boot').classList.add('hidden');
    $('desktop').classList.remove('hidden');
    $('taskbar').classList.remove('hidden');
    notify('CelloOS avviato. 640K di memoria OK.', 'ok');
  }

  O.shell = { init: init, notify: notify, modal: modal, setStart: setStart, renderTasks: renderTasks };
}());
