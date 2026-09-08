/* ═══════════════ TOUCH OPTIMIZATION ═══════════════ */
/* Prevent zoom, overscroll, haptics, safe areas, PWA install */

(function () {
  'use strict';

  /* ─── Prevent double-tap zoom ─── */
  function preventDoubleClick() {
    let lastTap = 0;
    document.addEventListener('touchend', function (e) {
      const now = Date.now();
      if (now - lastTap < 300) e.preventDefault();
      lastTap = now;
    }, { passive: false });
  }

  /* ─── Prevent pull-to-refresh / overscroll ─── */
  function preventPullToRefresh() {
    document.body.addEventListener('touchmove', function (e) {
      if (e.touches.length > 1) return;
      const el = e.target;
      if (el.closest && (el.closest('#game-area') || el.closest('.concept-box') || el.closest('#story-overlay'))) return;
      if (document.scrollingElement.scrollTop <= 0 && e.touches[0].clientY > 0) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  /* ─── Haptic feedback wrapper ─── */
  function hapticFeedback(type) {
    if (!navigator.vibrate) return;
    var patterns = {
      light:  [10],
      medium: [20],
      heavy:  [40]
    };
    navigator.vibrate(patterns[type] || patterns.light);
  }

  /* ─── Safe area inset detection ─── */
  function detectSafeAreas() {
    var root = document.documentElement;
    var areas = { top: 0, right: 0, bottom: 0, left: 0 };
    try {
      var style = getComputedStyle(root);
      ['top', 'right', 'bottom', 'left'].forEach(function (side) {
        var val = style.getPropertyValue('env(safe-area-inset-' + side + ')');
        areas[side] = val ? parseInt(val) : 0;
      });
    } catch (e) { /* env() not supported */ }
    return areas;
  }

  /* ─── PWA install prompt ─── */
  var deferredInstallPrompt = null;

  function initInstallHandler() {
    var banner = document.getElementById('install-banner');
    var installBtn = document.getElementById('install-btn');
    var dismissBtn = document.getElementById('install-dismiss');

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (banner) banner.style.display = 'flex';
    });

    if (installBtn) {
      installBtn.addEventListener('click', function () {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(function (choice) {
          if (choice.outcome === 'accepted') hapticFeedback('medium');
          deferredInstallPrompt = null;
          if (banner) banner.style.display = 'none';
        });
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        if (banner) banner.style.display = 'none';
      });
    }

    window.addEventListener('appinstalled', function () {
      deferredInstallPrompt = null;
      if (banner) banner.style.display = 'none';
    });
  }

  /* ─── Apply all touch fixes ─── */
  function touchOptimize() {
    preventDoubleClick();
    preventPullToRefresh();
    detectSafeAreas();
    initInstallHandler();
  }

  /* ─── Expose module ─── */
  window.Touch = {
    preventDoubleClick: preventDoubleClick,
    preventPullToRefresh: preventPullToRefresh,
    hapticFeedback: hapticFeedback,
    detectSafeAreas: detectSafeAreas,
    touchOptimize: touchOptimize
  };

  document.addEventListener('DOMContentLoaded', touchOptimize);
})();
