/* ═══════════════ TOUCH OPTIMIZATION ═══════════════ */
/* Mobile touch helpers & PWA install prompt */

/* ─── Prevent double-tap zoom ─── */
export function preventDoubleTapZoom() {
  let lastTap = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) e.preventDefault();
    lastTap = now;
  }, { passive: false });
}

/* ─── Prevent pull-to-refresh ─── */
export function preventPullToRefresh() {
  document.body.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) return;
    if (document.scrollingElement.scrollTop === 0 && e.touches[0].clientY > 0) {
      e.preventDefault();
    }
  }, { passive: false });
}

/* ─── Haptic feedback wrapper ─── */
export function haptic(ms = 10) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

/* ─── Safe area insets ─── */
export function applySafeAreas() {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const env = (v) => {
    const m = v.match(/env\(\s*safe-area-inset-(\w+)\s*\)/);
    return m ? parseInt(style.getPropertyValue(`--sat-${m[1]}`) || '0') : 0;
  };
}

/* ─── PWA install prompt ─── */
let deferredPrompt = null;

export function trackInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('install-banner');
    if (banner) banner.hidden = false;
  });

  const installBtn = document.getElementById('install-btn');
  const dismissBtn = document.getElementById('install-dismiss');
  const banner = document.getElementById('install-banner');

  if (installBtn) {
    installBtn.addEventListener('click', () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        if (banner) banner.hidden = true;
      });
    });
  }

  if (dismissBtn && banner) {
    dismissBtn.addEventListener('click', () => { banner.hidden = true; });
  }

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (banner) banner.hidden = true;
  });
}

export function dismissInstallPrompt() {
  const banner = document.getElementById('install-banner');
  if (banner) banner.hidden = true;
  deferredPrompt = null;
}

/* ─── Init all touch handlers ─── */
export function initTouch() {
  preventDoubleTapZoom();
  preventPullToRefresh();
  applySafeAreas();
  trackInstallPrompt();
}

/* Auto-init when loaded as standalone script */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTouch);
  } else {
    initTouch();
  }
}
