/* Privacy Audit — read-only inspection of local browser data */

export const APP_LS_PREFIX = 'pa:';
export const APP_COOKIE_PREFIX = 'pa_';
export const APP_DB_NAME = 'PrivacyAuditDB';
export const OTHER_PREFIXES = ['oes:', 'ol:', 'site_lang', 'lang', 'index_scroll', 'spotify'];

function byteSize(value) {
  try { return new Blob([String(value)]).size; }
  catch (e) { return String(value).length * 2; }
}

function parseCookies() {
  if (!document.cookie) return [];
  return document.cookie.split(';').map(part => {
    const index = part.indexOf('=');
    const name = (index < 0 ? part : part.slice(0, index)).trim();
    const value = index < 0 ? '' : part.slice(index + 1).trim();
    return { name, value };
  }).filter(c => c.name);
}

function inspectDb(info) {
  return new Promise(resolve => {
    const result = { name: info.name, version: info.version || null, stores: [], error: null };
    if (!info.name) { resolve(result); return; }
    let req;
    try { req = indexedDB.open(info.name); }
    catch (e) { result.error = String(e); resolve(result); return; }
    const timer = setTimeout(() => {
      try { if (req.result) req.result.close(); } catch (e) { /* ignore */ }
      result.error = 'timeout';
      resolve(result);
    }, 2000);

    req.onsuccess = () => {
      const db = req.result;
      const names = Array.from(db.objectStoreNames || []);
      if (!names.length) {
        clearTimeout(timer); db.close(); resolve(result); return;
      }
      let tx;
      try { tx = db.transaction(names, 'readonly'); }
      catch (e) { clearTimeout(timer); db.close(); result.error = String(e); resolve(result); return; }
      Promise.all(names.map(name => new Promise(done => {
        const q = tx.objectStore(name).count();
        q.onsuccess = () => done({ name, count: q.result });
        q.onerror = () => done({ name, count: null });
      }))).then(stores => {
        clearTimeout(timer); db.close(); result.stores = stores; resolve(result);
      });
    };
    req.onerror = () => { clearTimeout(timer); result.error = 'open failed'; resolve(result); };
    req.onblocked = () => { clearTimeout(timer); result.error = 'blocked'; resolve(result); };
  });
}

async function permissionState(name) {
  if (!navigator.permissions || !navigator.permissions.query) return 'unsupported';
  try {
    const result = await navigator.permissions.query({ name });
    return result.state || 'unknown';
  } catch (e) {
    return 'unsupported';
  }
}

export class Audit {
  async snapshot() {
    const cookies = parseCookies();
    const lsItems = [];
    let lsBytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key) || '';
        const size = byteSize(value);
        lsBytes += size + byteSize(key);
        lsItems.push({ key, size, prefix: this.scopeOf(key), rawValue: value });
      }
    } catch (e) { /* storage may be unavailable */ }

    let idbDbs = [];
    let idbError = null;
    try {
      if (indexedDB.databases) {
        const infos = await indexedDB.databases();
        idbDbs = await Promise.all(infos.map(inspectDb));
      } else {
        idbError = 'unsupported';
      }
    } catch (e) {
      idbError = String(e);
    }

    const [notif, geolocation] = await Promise.all([
      permissionState('notifications'),
      permissionState('geolocation')
    ]);

    const swSupported = 'serviceWorker' in navigator;
    let swControlled = false;
    let swRegistration = false;
    if (swSupported) {
      swControlled = !!navigator.serviceWorker.controller;
      try { swRegistration = !!(await navigator.serviceWorker.getRegistration()); }
      catch (e) { /* ignore */ }
    }

    return {
      timestamp: new Date().toISOString(),
      origin: location.origin,
      secure: window.isSecureContext,
      userAgent: navigator.userAgent,
      cookies: {
        items: cookies.map(c => ({ ...c, prefix: this.scopeOf(c.name, true) })),
        total: cookies.length,
        note: 'HttpOnly cookies are invisible to JavaScript and are not counted.'
      },
      localStorage: { items: lsItems, total: lsItems.length, bytes: lsBytes },
      indexedDb: {
        dbs: idbDbs,
        totalDbs: idbDbs.length,
        totalRecords: idbDbs.reduce((sum, db) => sum + db.stores.reduce((s, store) => s + (store.count || 0), 0), 0),
        error: idbError
      },
      permissions: { notifications: notif, geolocation },
      pwa: {
        swSupported,
        swRegistration,
        swControlled,
        standalone: window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
      }
    };
  }

  scopeOf(name, isCookie = false) {
    const prefix = isCookie ? APP_COOKIE_PREFIX : APP_LS_PREFIX;
    if (String(name).startsWith(prefix)) return 'app';
    if (OTHER_PREFIXES.some(p => String(name).startsWith(p))) return 'other';
    return 'unknown';
  }

  appScoped(snapshot) {
    return {
      lsKeys: snapshot.localStorage.items.filter(i => i.prefix === 'app').map(i => i.key),
      cookies: snapshot.cookies.items.filter(i => i.prefix === 'app').map(i => i.name),
      idbNames: snapshot.indexedDb.dbs.filter(db => db.name === APP_DB_NAME).map(db => db.name)
    };
  }
}
