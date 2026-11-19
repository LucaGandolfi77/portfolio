/* Privacy Audit — explicitly scoped actions with an activity log */

const LOG_KEY = 'pa:log';

function cookiePaths() {
  const paths = new Set(['/']);
  const segments = location.pathname.split('/').filter(Boolean);
  while (segments.length) {
    paths.add('/' + segments.join('/'));
    segments.pop();
  }
  return [...paths];
}

function deleteCookie(name) {
  cookiePaths().forEach(path => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
  });
}

function deleteDatabase(name) {
  return new Promise(resolve => {
    if (!name) { resolve(true); return; }
    const req = indexedDB.deleteDatabase(name);
    req.onsuccess = () => resolve(true);
    req.onerror = () => resolve(false);
    req.onblocked = () => resolve(false);
  });
}

export class Actions {
  constructor(onLog = () => {}) {
    this.onLog = onLog;
  }

  loadLog() {
    try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); }
    catch (e) { return []; }
  }

  log(action, detail, status = 'ok') {
    const entry = { time: new Date().toISOString(), action, detail, status };
    const list = this.loadLog();
    list.unshift(entry);
    try { localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(0, 50))); }
    catch (e) { /* ignore */ }
    this.onLog(list.slice(0, 50));
    return entry;
  }

  clearLog() {
    try { localStorage.removeItem(LOG_KEY); } catch (e) { /* ignore */ }
    this.onLog([]);
  }

  clearCookies(scope, snapshot) {
    const items = scope === 'all'
      ? snapshot.cookies.items
      : snapshot.cookies.items.filter(i => i.prefix === 'app');
    items.forEach(i => deleteCookie(i.name));
    return this.log(
      'cookies',
      `${items.length} ${scope === 'all' ? 'readable cookies' : 'app cookies'} (HttpOnly not affected)`,
      items.length ? 'ok' : 'empty'
    );
  }

  clearLocalStorage(scope, snapshot) {
    if (scope === 'all') {
      localStorage.clear();
      return this.log('localStorage', 'all site keys removed', 'ok');
    }
    const keys = snapshot.localStorage.items.filter(i => i.prefix === 'app').map(i => i.key);
    keys.forEach(key => localStorage.removeItem(key));
    return this.log('localStorage', `${keys.length} app keys removed`, keys.length ? 'ok' : 'empty');
  }

  async clearIndexedDb(scope, snapshot) {
    const names = scope === 'all'
      ? snapshot.indexedDb.dbs.map(db => db.name)
      : snapshot.indexedDb.dbs.filter(db => db.name === 'PrivacyAuditDB').map(db => db.name);
    const results = await Promise.all(names.map(deleteDatabase));
    const ok = results.filter(Boolean).length;
    return this.log('indexedDB', `${ok}/${names.length} databases deleted (${scope})`, ok ? 'ok' : 'failed');
  }

  notificationGuidance() {
    return this.log('notifications', 'opened browser-settings guidance (no API to revoke)', 'info');
  }
}
