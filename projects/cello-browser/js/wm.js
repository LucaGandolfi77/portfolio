/* CelloOS — window manager */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};
  var layer, z = 100, uid = 0;
  var windows = {};
  var apps = {};
  var activeId = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function register(id, def) { apps[id] = def; }

  function geometry(id) {
    var small = window.innerWidth < 700;
    var w = small ? Math.max(280, window.innerWidth - 16) : Math.min(760, window.innerWidth - 120);
    var h = small ? Math.max(320, window.innerHeight - 110) : Math.min(520, window.innerHeight - 130);
    var offset = (Object.keys(windows).length % 6) * 24;
    return {
      x: small ? 8 : Math.max(8, Math.round((window.innerWidth - w) / 2) - 60 + offset),
      y: small ? 8 : Math.max(8, 40 + offset),
      w: w, h: h
    };
  }

  function setGeom(win, g) {
    win.el.style.left = g.x + 'px';
    win.el.style.top = g.y + 'px';
    win.el.style.width = g.w + 'px';
    win.el.style.height = g.h + 'px';
    win.x = g.x; win.y = g.y; win.w = g.w; win.h = g.h;
  }

  function focus(id) {
    var win = windows[id];
    if (!win || win.minimized) return;
    Object.keys(windows).forEach(function (k) { windows[k].el.classList.toggle('active', k === id); });
    win.el.style.zIndex = ++z;
    activeId = id;
    O.bus.emit('wm:focus', { id: id });
  }

  function openApp(id, ctx) {
    var def = apps[id];
    if (!def) { O.bus.emit('notify', { text: 'Programma non trovato: ' + id, kind: 'error' }); return null; }
    var existing = Object.keys(windows).filter(function (k) { return windows[k].appId === id; })[0];
    if (existing) {
      windows[existing].minimized = false;
      windows[existing].el.classList.remove('minimized');
      focus(existing);
      return windows[existing].instance;
    }

    var winId = id + '-' + (++uid);
    var g = geometry(id);
    var w = el('section', 'os-window');
    w.dataset.appId = id;
    w.dataset.winId = winId;
    w.setAttribute('role', 'dialog');
    w.setAttribute('aria-label', def.title || id);

    var bar = el('div', 'os-titlebar');
    var icon = el('span', 'os-title-icon', def.icon || '▣');
    var title = el('span', 'os-title-text', ctx && ctx.title ? ctx.title : (def.title || id));
    var controls = el('div', 'os-controls');
    function ctl(label, symbol, fn) {
      var b = el('button', 'os-control', symbol);
      b.type = 'button'; b.title = label; b.setAttribute('aria-label', label);
      b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      b.addEventListener('click', function (e) { e.stopPropagation(); fn(); });
      controls.appendChild(b);
      return b;
    }
    ctl('Minimizza', '_', function () { minimize(winId); });
    ctl('Massimizza', '□', function () { toggleMax(winId); });
    ctl('Chiudi', '✕', function () { close(winId); });
    bar.appendChild(icon); bar.appendChild(title); bar.appendChild(controls);

    var body = el('div', 'os-body');
    var status = el('div', 'os-status');
    var resize = el('div', 'os-resize');
    resize.setAttribute('aria-hidden', 'true');
    w.appendChild(bar); w.appendChild(body); w.appendChild(status); w.appendChild(resize);
    setGeom(w, g);
    layer.appendChild(w);

    var win = {
      id: winId, appId: id, el: w, bar: bar, body: body, status: status,
      titleEl: title, x: g.x, y: g.y, w: g.w, h: g.h,
      minimized: false, maximized: false, instance: null, prev: null, ctx: ctx || {}
    };
    windows[winId] = win;

    try { win.instance = def.create(body, win); }
    catch (e) { body.innerHTML = '<div class="app-pad"><h3>Errore</h3><p>' + String(e.message || e) + '</p></div>'; }

    bindDrag(win);
    focus(winId);
    O.bus.emit('wm:open', { id: winId, appId: id, title: win.titleEl.textContent });
    return win.instance;
  }

  function bindDrag(win) {
    var mode = null, sx = 0, sy = 0, ox = 0, oy = 0, ow = 0, oh = 0;
    function start(e, m) {
      if (win.maximized) return;
      mode = m; sx = e.clientX; sy = e.clientY;
      ox = win.x; oy = win.y; ow = win.w; oh = win.h;
      e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault(); focus(win.id);
    }
    function move(e) {
      if (!mode) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      var maxW = window.innerWidth, maxH = window.innerHeight - 40;
      if (mode === 'move') {
        win.x = Math.max(0, Math.min(maxW - 80, ox + dx));
        win.y = Math.max(0, Math.min(maxH - 30, oy + dy));
      } else {
        win.w = Math.max(280, Math.min(maxW - win.x, ow + dx));
        win.h = Math.max(180, Math.min(maxH - win.y, oh + dy));
      }
      setGeom(win, { x: win.x, y: win.y, w: win.w, h: win.h });
    }
    function end() { mode = null; }
    win.bar.addEventListener('pointerdown', function (e) { if (e.target.closest('.os-control')) return; start(e, 'move'); });
    win.bar.addEventListener('pointermove', move);
    win.bar.addEventListener('pointerup', end);
    win.bar.addEventListener('pointercancel', end);
    win.el.querySelector('.os-resize').addEventListener('pointerdown', function (e) { start(e, 'resize'); });
    win.el.querySelector('.os-resize').addEventListener('pointermove', move);
    win.el.querySelector('.os-resize').addEventListener('pointerup', end);
    win.el.addEventListener('pointerdown', function () { focus(win.id); }, true);
  }

  function close(id) {
    var win = windows[id];
    if (!win) return;
    try { win.instance && win.instance.destroy && win.instance.destroy(); } catch (e) {}
    win.el.remove(); delete windows[id];
    if (activeId === id) activeId = null;
    O.bus.emit('wm:close', { id: id });
    var next = Object.keys(windows).filter(function (k) { return !windows[k].minimized; }).pop();
    if (next) focus(next);
  }
  function minimize(id) {
    var win = windows[id];
    if (!win) return;
    win.minimized = true;
    win.el.classList.add('minimized');
    O.bus.emit('wm:minimize', { id: id });
  }
  function toggleMax(id) {
    var win = windows[id];
    if (!win) return;
    if (!win.maximized) {
      win.prev = { x: win.x, y: win.y, w: win.w, h: win.h };
      setGeom(win, { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - 40 });
      win.maximized = true;
    } else {
      setGeom(win, win.prev || { x: 20, y: 30, w: 700, h: 480 });
      win.maximized = false;
    }
    focus(id);
  }
  function cycle() {
    var ids = Object.keys(windows).filter(function (k) { return !windows[k].minimized; });
    if (ids.length < 2) return;
    var i = ids.indexOf(activeId);
    focus(ids[(i + 1) % ids.length]);
  }
  function tile() {
    var ids = Object.keys(windows).filter(function (k) { return !windows[k].minimized; });
    if (!ids.length) return;
    var half = Math.floor(window.innerWidth / 2), h = window.innerHeight - 46;
    ids.forEach(function (id, i) {
      var win = windows[id]; win.maximized = false;
      setGeom(win, { x: i % 2 ? half : 0, y: 0, w: half, h: h });
    });
  }
  function cascade() {
    Object.keys(windows).forEach(function (id, i) {
      var win = windows[id]; win.maximized = false;
      setGeom(win, { x: 20 + i * 24, y: 20 + i * 24, w: Math.min(700, window.innerWidth - 60), h: Math.min(480, window.innerHeight - 90) });
      focus(id);
    });
  }
  function list() { return Object.keys(windows).map(function (id) { return windows[id]; }); }
  function get(id) { return windows[id]; }
  function setTitle(id, text) { if (windows[id]) windows[id].titleEl.textContent = text; }

  function init() {
    layer = document.getElementById('windows');
    window.addEventListener('resize', function () {
      list().forEach(function (win) {
        if (win.maximized) setGeom(win, { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - 40 });
        else setGeom(win, {
          x: Math.min(win.x, Math.max(0, window.innerWidth - 100)),
          y: Math.min(win.y, Math.max(0, window.innerHeight - 80)),
          w: Math.min(win.w, window.innerWidth), h: Math.min(win.h, window.innerHeight - 40)
        });
      });
    });
  }

  O.wm = { init: init, register: register, openApp: openApp, close: close, minimize: minimize,
    toggleMax: toggleMax, focus: focus, cycle: cycle, tile: tile, cascade: cascade,
    list: list, get: get, setTitle: setTitle, apps: apps, active: function () { return activeId; } };
}());
