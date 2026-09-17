/**
 * Accesso a localStorage a prova di Safari iOS.
 *
 * Safari in navigazione privata può lanciare eccezioni su setItem e in alcuni
 * contesti `localStorage` non è nemmeno definito: qui non crasha mai l'app.
 */

function getStore(): Storage | null {
  try {
    const store = window.localStorage;
    const probe = '__verso17_probe__';
    store.setItem(probe, '1');
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
}

export function safeReadJson<T>(key: string, fallback: T): T {
  const store = getStore();
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeWriteJson(key: string, value: unknown): void {
  const store = getStore();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* quota piena o storage bloccato: l'app continua a funzionare in memoria */
  }
}

export function safeReadString(key: string): string | null {
  const store = getStore();
  if (!store) return null;
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function safeWriteString(key: string, value: string): void {
  const store = getStore();
  if (!store) return;
  try {
    store.setItem(key, value);
  } catch {
    /* ignora */
  }
}
