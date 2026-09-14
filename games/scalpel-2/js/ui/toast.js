/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Toast Notification System
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Toast = (function() {
  'use strict';

  var container = null;
  var queue = [];
  var showing = false;

  function init() {
    container = document.getElementById('toast-container');
  }

  function show(message, type, duration) {
    type = type || 'info';
    duration = duration || 2000;

    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;

    container.appendChild(toast);
    showing = true;

    setTimeout(function() {
      toast.classList.add('fade-out');
      setTimeout(function() {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        showing = false;
      }, 300);
    }, duration);
  }

  function success(message) {
    show(message, 'success');
  }

  function error(message) {
    show(message, 'error');
  }

  function warning(message) {
    show(message, 'warning');
  }

  function info(message) {
    show(message, 'info');
  }

  function clear() {
    if (container) {
      container.innerHTML = '';
    }
    showing = false;
  }

  return {
    init: init,
    show: show,
    success: success,
    error: error,
    warning: warning,
    info: info,
    clear: clear
  };

})();

window.S2 = window.S2 || {};
window.S2.Toast = S2.Toast;
