/**
 * storage.js — accesso a localStorage a prova di Safari iOS.
 *
 * Safari in navigazione privata può lanciare eccezioni su setItem e in alcuni
 * contesti `localStorage` non è nemmeno definito: qui non crasha mai l'app.
 */

function getStore() {
  try {
    const store = window.localStorage;
    const probe = '__rtp_probe__';
    store.setItem(probe, '1');
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
}

export function readJson(key, fallback) {
  const store = getStore();
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  const store = getStore();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* quota piena o storage bloccato: l'app continua a funzionare in memoria */
  }
}

export function readString(key) {
  const store = getStore();
  if (!store) return null;
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key, value) {
  const store = getStore();
  if (!store) return;
  try {
    store.setItem(key, value);
  } catch {
    /* ignora */
  }
}
