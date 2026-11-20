/* Caricamento lazy delle librerie con mirror, timeout e cache in memoria */

import { LIBRARIES, LOCAL_MODULES } from './config.js';

const cache = new Map();

export function isOnline() {
  return navigator.onLine !== false;
}

function injectScript(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    let done = false;
    const script = document.createElement('script');
    script.src = url;
    script.crossOrigin = 'anonymous';
    script.async = true;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      script.remove();
      reject(new Error('timeout: ' + url));
    }, timeoutMs || 12000);
    script.onload = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      script.remove();
      reject(new Error('network error: ' + url));
    };
    (document.head || document.body).appendChild(script);
  });
}

async function loadFirst(urls, globalName, timeout) {
  if (window[globalName]) return;
  let lastError = null;
  for (const url of urls) {
    try {
      await injectScript(url, timeout);
      if (window[globalName]) return;
      throw new Error('global missing: ' + globalName);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('no source for ' + globalName);
}

export async function ensureLibrary(id, onProgress) {
  const def = LIBRARIES[id];
  if (!def) return;
  if (window[def.global]) return;
  if (cache.has(id)) return cache.get(id);

  const task = (async () => {
    if (!isOnline()) throw new Error('offline');
    await loadFirst(def.urls, def.global, 12000);
    if (onProgress) onProgress(id);
  })();

  cache.set(id, task);
  try {
    await task;
  } catch (error) {
    cache.delete(id);
    throw error;
  }
}

export async function ensureModule(id, onProgress) {
  const def = LOCAL_MODULES[id];
  if (!def) return;
  if (window[def.global]) return;
  if (cache.has(id)) return cache.get(id);

  const task = (async () => {
    await loadFirst([def.url], def.global, 9000);
    if (onProgress) onProgress(id);
  })();

  cache.set(id, task);
  try {
    await task;
  } catch (error) {
    cache.delete(id);
    throw error;
  }
}

/** Carica tutte le dipendenze di un filtro, una alla volta. */
export async function ensureFilterDeps(filter, onProgress) {
  for (const dep of filter.deps) {
    if (LIBRARIES[dep]) await ensureLibrary(dep, onProgress);
    else if (LOCAL_MODULES[dep]) await ensureModule(dep, onProgress);
  }
}

export function clearLoaderCache() {
  cache.clear();
}
