const gid = id => document.getElementById(id);
const App = {
  init() {
    this.setupTabs();
    this.refresh();
    gid('btn-clear-cookies').addEventListener('click', () => { document.cookie.split(';').forEach(c => { const [k,v] = c.split('='); document.cookie = k.trim() + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; }); this.refresh(); gid('audit-msg').textContent = 'Cookie cancellati.'; });
    gid('btn-clear-idb').addEventListener('click', async () => { const dbs = await indexedDB.databases(); dbs.forEach(d => { if (d.name) indexedDB.deleteDatabase(d.name); }); this.refresh(); gid('audit-msg').textContent = 'IndexedDB cancellato.'; });
    gid('btn-clear-ls').addEventListener('click', () => { localStorage.clear(); this.refresh(); gid('audit-msg').textContent = 'localStorage cancellato.'; });
    gid('btn-revoke-notif').addEventListener('click', () => { if ('Notification' in window && Notification.permission === 'granted') Notification.requestPermission().then(p => { if (p === 'denied') gid('audit-msg').textContent = 'Notifiche revocate.'; }); });
    gid('btn-export').addEventListener('click', () => { const b = new Blob([JSON.stringify({ cookies: document.cookie, ls: Object.keys(localStorage).length, idb: 'audit', notif: Notification.permission })], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'privacy-audit.txt'; a.click(); });
    setInterval(() => this.refresh(), 5000);
  },
  setupTabs() { document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => { document.querySelectorAll('.tab').forEach(x => x.classList.remove('active')); t.classList.add('active'); document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active')); gid('tab-' + t.dataset.tab).classList.add('active'); })); },
  async refresh() { gid('audit-cookies').textContent = document.cookie ? document.cookie.split(';').length : '0'; gid('audit-ls').textContent = localStorage.length; gid('audit-notif').textContent = ('Notification' in window) ? Notification.permission : 'N/A'; try { const dbs = await indexedDB.databases(); gid('audit-idb').textContent = dbs ? dbs.length : '0'; } catch { gid('audit-idb').textContent = '0'; } }
};
document.addEventListener('DOMContentLoaded', () => App.init());
