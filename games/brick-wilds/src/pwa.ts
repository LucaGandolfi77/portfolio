interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Registers the relative Service Worker (`sw.js`, scope `./`),
 * wires the PWA install prompt, and manages Screen Wake Lock + visibility pause.
 */
export function setupPwaLifecycle(callbacks: {
  onInstallReady: (trigger: () => Promise<void>) => void;
  onVisibilityChange: (hidden: boolean) => void;
}): void {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => {
        // Ignore SW errors in unsupported contexts
      });
    });
  }

  let deferredPrompt: BeforeInstallPromptEvent | null = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    callbacks.onInstallReady(async () => {
      if (!deferredPrompt) return;
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    });
  });

  // Request Screen Wake Lock while playing on mobile/tablet
  let wakeLock: WakeLockSentinel | null = null;
  const acquireWakeLock = async () => {
    try {
      if ('wakeLock' in navigator && document.visibilityState === 'visible') {
        wakeLock = await navigator.wakeLock.request('screen');
      }
    } catch {
      // Ignore unsupported or denied wake lock
    }
  };
  window.addEventListener('pointerdown', () => void acquireWakeLock(), { once: true });

  document.addEventListener('visibilitychange', () => {
    const hidden = document.visibilityState === 'hidden';
    callbacks.onVisibilityChange(hidden);
    if (!hidden && wakeLock === null) {
      void acquireWakeLock();
    }
  });
}
