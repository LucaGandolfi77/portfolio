/* CelloOS — persisted settings */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};
  var KEY = 'cello.os.settings';
  var defaults = {
    wallpaper: 'teal', theme: 'classic', sound: true,
    clock24: true, reducedMotion: false, showDesktopIcons: true
  };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var saved = raw ? JSON.parse(raw) : {};
      var out = {};
      Object.keys(defaults).forEach(function (k) { out[k] = saved[k] === undefined ? defaults[k] : saved[k]; });
      return out;
    } catch (e) { return Object.assign({}, defaults); }
  }
  var settings = load();

  function apply() {
    document.body.dataset.wallpaper = settings.wallpaper;
    document.body.dataset.theme = settings.theme;
    document.body.dataset.reduced = settings.reducedMotion ? '1' : '0';
    var sound = document.getElementById('tray-sound');
    if (sound) sound.textContent = settings.sound ? '♪' : '✕';
    O.bus.emit('settings:change', settings);
  }
  function set(patch) {
    Object.keys(patch || {}).forEach(function (k) { settings[k] = patch[k]; });
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) {}
    apply();
  }

  O.settings = settings;
  O.state = { get: function () { return settings; }, set: set, apply: apply, reset: function () { set(defaults); } };
}());
