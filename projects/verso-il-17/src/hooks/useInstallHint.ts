import { useEffect, useState } from 'react';
import { safeReadString, safeWriteString } from '../utils/storage';

const DISMISS_KEY = 'verso17.installHintDismissed.v1';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  const ua = window.navigator.userAgent;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ si presenta come Mac: lo distinguiamo dal touch.
  const iPadOs = ua.includes('Macintosh') && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOs;
}

/**
 * Suggerimento di installazione, non invadente:
 *  - su iOS spiega il percorso Condividi -> "Aggiungi a Home" (Safari non ha prompt nativo);
 *  - su Android/desktop Chrome usa l'evento `beforeinstallprompt` con un vero pulsante;
 *  - se l'app è già installata o l'utente lo ha chiuso, non compare più.
 */
export function useInstallHint() {
  const [platform, setPlatform] = useState<'ios' | 'chromium' | 'none'>('none');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => safeReadString(DISMISS_KEY) === '1');
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setPlatform('none');
      return;
    }

    if (isIos()) {
      setPlatform('ios');
      setCanInstall(true);
      return;
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setPlatform('chromium');
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dismiss = () => {
    safeWriteString(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') dismiss();
    setDeferredPrompt(null);
  };

  return {
    visible: canInstall && !dismissed && platform !== 'none',
    platform,
    dismiss,
    install,
  };
}
