(function () {
  'use strict';

  var deferredPrompt = null;

  function preventDoubleClick() {
    document.addEventListener('dblclick', function (e) {
      e.preventDefault();
    });
    var lastTouch = 0;
    document.addEventListener('touchend', function (e) {
      var now = Date.now();
      if (now - lastTouch < 300) {
        e.preventDefault();
      }
      lastTouch = now;
    }, { passive: false });
  }

  function preventPullToRefresh() {
    document.body.style.overscrollBehavior = 'none';
    document.addEventListener('touchmove', function (e) {
      if (e.touches.length > 1) return;
      var el = e.target;
      while (el && el !== document.body) {
        if (el.scrollHeight > el.clientHeight) return;
        el = el.parentElement;
      }
      if (e.target === document.body || e.target === document.documentElement) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  function hapticFeedback(type) {
    if (!navigator.vibrate) return;
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(50);
        break;
      case 'error':
        navigator.vibrate([30, 50, 30]);
        break;
      case 'success':
        navigator.vibrate([10, 30, 10, 30, 10]);
        break;
      default:
        navigator.vibrate(15);
    }
  }

  function handleInstallPrompt() {
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredPrompt = e;
    });
  }

  function promptInstall() {
    if (!deferredPrompt) return Promise.resolve(null);
    deferredPrompt.prompt();
    return deferredPrompt.userChoice.then(function (result) {
      deferredPrompt = null;
      return result;
    });
  }

  preventDoubleClick();
  preventPullToRefresh();
  handleInstallPrompt();

  window.Touch = {
    preventDoubleClick: preventDoubleClick,
    preventPullToRefresh: preventPullToRefresh,
    hapticFeedback: hapticFeedback,
    promptInstall: promptInstall
  };
})();
