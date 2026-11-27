/**
 * PWA lifecycle helper: service worker registration, install prompt capture,
 * iOS detection, wake lock, and haptic feedback.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let wakeLock: WakeLockSentinel | null = null;
const installListeners = new Set<(available: boolean) => void>();

export function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isStandalone(): boolean {
  return matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function canInstall(): boolean {
  return deferredPrompt !== null || (isIOS() && !isStandalone());
}

export function onInstallChange(cb: (available: boolean) => void): () => void {
  installListeners.add(cb);
  cb(canInstall());
  return () => installListeners.delete(cb);
}

export async function triggerInstall(): Promise<'prompted' | 'ios' | 'unavailable'> {
  if (deferredPrompt) {
    await deferredPrompt.prompt();
    const res = await deferredPrompt.userChoice;
    if (res.outcome === 'accepted') deferredPrompt = null;
    installListeners.forEach((cb) => cb(canInstall()));
    return 'prompted';
  }
  if (isIOS() && !isStandalone()) return 'ios';
  return 'unavailable';
}

export function registerPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    installListeners.forEach((cb) => cb(canInstall()));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installListeners.forEach((cb) => cb(false));
  });

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
    });
  }
}

export async function requestWakeLock() {
  if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
  } catch {
    // Ignore when battery saver or permission blocks wake lock.
  }
}

export async function releaseWakeLock() {
  if (!wakeLock) return;
  try {
    await wakeLock.release();
  } catch {
    // Ignore release errors.
  }
  wakeLock = null;
}

export function vibrate(pattern: number | number[]) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore on unsupported browsers.
    }
  }
}
