/* Privacy Audit — interface, dialogs, themes, i18n and toasts */

const DICT = {
  en: {
    back: 'Portfolio', tagline: 'Local data transparency · zero server',
    tabOverview: 'Overview', tabDetails: 'Details', tabControls: 'Controls', tabExport: 'Export', tabLog: 'Activity',
    overviewTitle: 'Local data detected', refresh: 'Refresh',
    detailsTitle: 'Item-by-item detail', cookiesSection: 'Cookies', lsSection: 'localStorage',
    idbSection: 'IndexedDB', permSection: 'Permissions', pwaSection: 'PWA status',
    controlsTitle: 'Granular controls', clearCookies: 'Clear cookies', clearLs: 'Clear localStorage',
    clearIdb: 'Clear IndexedDB', notifTitle: 'Notifications', notifHint: 'Browsers do not expose an API to revoke notification permission. Open your browser\'s site settings to change it.',
    notifBtn: 'How to revoke', exportTitle: 'Export audit', exportHint: 'Download a local report. Values are hidden by default.',
    formatLabel: 'Format', includeValues: 'Include raw values', downloadJson: 'Download JSON', downloadTxt: 'Download TXT',
    logTitle: 'Activity log', logEmpty: 'No actions yet', offlineReady: 'Offline ready',
    dangerTitle: 'Confirm action', dangerPhrase: 'Type', cancel: 'Cancel', confirm: 'Confirm',
    summary: 'At a glance', risk: 'Privacy surface', secure: 'Secure context', insecure: 'Insecure context',
    readableOnly: 'readable by JS', databases: 'databases', records: 'records', keys: 'keys', entries: 'entries',
    bytes: 'bytes', noCookies: 'No readable cookies', noKeys: 'No localStorage keys', noDbs: 'No IndexedDB databases',
    granted: 'granted', denied: 'denied', defaultState: 'default', unsupported: 'unsupported',
    swActive: 'Service worker active', swInactive: 'Service worker inactive', standalone: 'Installed app',
    browser: 'Browser tab', appOnly: 'App only', wholeSite: 'Whole site', warningAll: 'This deletes data belonging to other apps on this site.',
    scopeApp: 'App data only', scopeAll: 'All site data', done: 'done', failed: 'failed', info: 'info', empty: 'nothing to remove',
    exported: 'Report downloaded', language: 'Language', theme: 'Theme', clearLog: 'Clear log',
    name: 'Name', size: 'Size', value: 'Value', scope: 'Scope', version: 'Version', stores: 'Stores',
    noPermission: 'Permission API unavailable', httpOnlyNote: 'HttpOnly cookies are not visible to JavaScript.',
    lastScan: 'Last scan',
    clearConfirmCookie: 'all readable cookies will be deleted. HttpOnly cookies cannot be removed from JavaScript.',
    clearConfirmLs: 'all site keys will be removed, including preferences and other apps.',
    clearConfirmIdb: 'all IndexedDB databases on this origin will be deleted, including other apps\' data.',
    phraseAll: 'DELETE ALL'
  },
  it: {
    back: 'Portfolio', tagline: 'Trasparenza dati locali · zero server',
    tabOverview: 'Panoramica', tabDetails: 'Dettagli', tabControls: 'Controlli', tabExport: 'Esporta', tabLog: 'Attività',
    overviewTitle: 'Dati locali rilevati', refresh: 'Aggiorna',
    detailsTitle: 'Dettaglio per voce', cookiesSection: 'Cookie', lsSection: 'localStorage',
    idbSection: 'IndexedDB', permSection: 'Permessi', pwaSection: 'Stato PWA',
    controlsTitle: 'Controlli granulari', clearCookies: 'Cancella cookie', clearLs: 'Cancella localStorage',
    clearIdb: 'Cancella IndexedDB', notifTitle: 'Notifiche', notifHint: 'I browser non espongono API per revocare il permesso notifiche. Apri le impostazioni del sito nel browser per cambiarlo.',
    notifBtn: 'Come revocare', exportTitle: 'Esporta audit', exportHint: 'Scarica un report locale. I valori sono nascosti di default.',
    formatLabel: 'Formato', includeValues: 'Includi valori grezzi', downloadJson: 'Scarica JSON', downloadTxt: 'Scarica TXT',
    logTitle: 'Registro attività', logEmpty: 'Nessuna azione', offlineReady: 'Pronto offline',
    dangerTitle: 'Conferma azione', dangerPhrase: 'Digita', cancel: 'Annulla', confirm: 'Conferma',
    summary: 'In sintesi', risk: 'Superficie privacy', secure: 'Contesto sicuro', insecure: 'Contesto non sicuro',
    readableOnly: 'leggibili da JS', databases: 'database', records: 'voci', keys: 'chiavi', entries: 'voci',
    bytes: 'byte', noCookies: 'Nessun cookie leggibile', noKeys: 'Nessuna chiave localStorage', noDbs: 'Nessun database IndexedDB',
    granted: 'concesso', denied: 'negato', defaultState: 'predefinito', unsupported: 'non supportato',
    swActive: 'Service worker attivo', swInactive: 'Service worker inattivo', standalone: 'App installata',
    browser: 'Scheda browser', appOnly: 'Solo app', wholeSite: 'Tutto il sito', warningAll: 'Questa azione cancella dati di altre app su questo sito.',
    scopeApp: 'Solo dati app', scopeAll: 'Tutti i dati del sito', done: 'riuscita', failed: 'fallita', info: 'info', empty: 'nulla da rimuovere',
    exported: 'Report scaricato', language: 'Lingua', theme: 'Tema', clearLog: 'Cancella registro',
    name: 'Nome', size: 'Dimensione', value: 'Valore', scope: 'Ambito', version: 'Versione', stores: 'Store',
    noPermission: 'API permessi non disponibile', httpOnlyNote: 'I cookie HttpOnly non sono visibili a JavaScript.',
    lastScan: 'Ultima scansione',
    clearConfirmCookie: 'verranno cancellati tutti i cookie leggibili. I cookie HttpOnly non possono essere rimossi da JavaScript.',
    clearConfirmLs: 'verranno rimosse tutte le chiavi del sito, incluse preferenze e dati di altre app.',
    clearConfirmIdb: 'verranno cancellati tutti i database IndexedDB di questo sito, inclusi dati di altre app.',
    phraseAll: 'DELETE ALL'
  }
};

function readLang() {
  try { return localStorage.getItem('site_lang') || localStorage.getItem('lang') || 'en'; }
  catch (e) { return 'en'; }
}

function esc(value) {
  return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export class UI {
  constructor(handlers = {}) {
    this.handlers = handlers;
    this.lang = readLang().slice(0, 2) === 'it' ? 'it' : 'en';
    this._pendingDanger = null;
    this._toastTimer = 0;
    this.el = {};
    [
      'lang-btn', 'theme-btn', 'btn-refresh', 'audit-time', 'score-ring', 'score-value',
      'stat-cookies', 'stat-ls', 'stat-idb', 'stat-notif', 'secure-pill', 'sw-pill',
      'details-content', 'pwa-content', 'btn-clear-cookies', 'btn-clear-cookies-all',
      'btn-clear-ls', 'btn-clear-ls-all', 'btn-clear-idb', 'btn-clear-idb-all',
      'btn-notif', 'notif-status', 'fmt-json', 'fmt-txt', 'include-values',
      'btn-export', 'log-list', 'btn-clear-log', 'toast',
      'danger-dialog', 'danger-text', 'danger-input', 'notif-dialog'
    ].forEach(id => { this.el[id] = document.getElementById(id); });
  }

  t(key) { return (DICT[this.lang] && DICT[this.lang][key]) || DICT.en[key] || key; }

  init() {
    this.applyLang(this.lang, true);
    const h = this.handlers;
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });
    this.el['lang-btn'].addEventListener('click', h.onLang);
    this.el['theme-btn'].addEventListener('click', h.onTheme);
    this.el['btn-refresh'].addEventListener('click', h.onRefresh);

    this.el['btn-clear-cookies'].addEventListener('click', () => this.askDanger('clearConfirmCookie', 'app', h.onClearCookies));
    this.el['btn-clear-cookies-all'].addEventListener('click', () => this.askDanger('clearConfirmCookie', 'all', h.onClearCookies));
    this.el['btn-clear-ls'].addEventListener('click', () => this.askDanger('clearConfirmLs', 'app', h.onClearLocalStorage));
    this.el['btn-clear-ls-all'].addEventListener('click', () => this.askDanger('clearConfirmLs', 'all', h.onClearLocalStorage));
    this.el['btn-clear-idb'].addEventListener('click', () => this.askDanger('clearConfirmIdb', 'app', h.onClearIndexedDb));
    this.el['btn-clear-idb-all'].addEventListener('click', () => this.askDanger('clearConfirmIdb', 'all', h.onClearIndexedDb));
    this.el['btn-notif'].addEventListener('click', h.onNotif);
    this.el['btn-export'].addEventListener('click', () => h.onExport({
      format: this.el['fmt-txt'].checked ? 'txt' : 'json',
      includeValues: this.el['include-values'].checked
    }));
    this.el['btn-clear-log'].addEventListener('click', h.onClearLog);

    const dialog = this.el['danger-dialog'];
    dialog.addEventListener('close', () => {
      if (dialog.returnValue !== 'ok' || !this._pendingDanger) return;
      const phrase = this.el['danger-input'].value.trim();
      const expected = this._pendingDanger.scope === 'all' ? this.t('phraseAll') : 'OK';
      const pending = this._pendingDanger;
      this._pendingDanger = null;
      if (phrase === expected) pending.handler(pending.scope);
      else this.toast(this.t('confirm') + ': ' + expected);
    });

    document.addEventListener('change', e => {
      if (e.target && e.target.id === 'siteLangSelect') this.applyLang(e.target.value);
    });
    window.addEventListener('storage', e => {
      if (e.key === 'site_lang' || e.key === 'lang') this.applyLang(readLang(), true);
    });
  }

  applyLang(value, silent = false) {
    const lang = String(value || 'en').slice(0, 2) === 'it' ? 'it' : 'en';
    if (lang === this.lang && !silent) return;
    this.lang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(node => {
      node.textContent = this.t(node.getAttribute('data-i18n'));
    });
    this.el['lang-btn'].textContent = lang === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
    this.el['theme-btn'].setAttribute('aria-label', this.t('theme'));
    if (!silent) this.toast(this.t('language') + ': ' + lang.toUpperCase());
  }

  applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#f5f2ea' : '#141824';
    this.el['theme-btn'].textContent = theme === 'light' ? '🌙' : '☀️';
  }

  switchTab(name) {
    document.querySelectorAll('.tab').forEach(t => {
      const on = t.dataset.tab === name;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.pane').forEach(p => p.classList.toggle('active', p.id === 'tab-' + name));
  }

  renderOverview(s) {
    this.el['audit-time'].textContent = new Date(s.timestamp).toLocaleTimeString();
    this.el['stat-cookies'].textContent = s.cookies.total;
    this.el['stat-ls'].textContent = s.localStorage.total;
    this.el['stat-idb'].textContent = s.indexedDb.totalRecords;
    this.el['stat-notif'].textContent = this.permissionLabel(s.permissions.notifications);
    this.el['secure-pill'].textContent = this.t(s.secure ? 'secure' : 'insecure');
    this.el['secure-pill'].classList.toggle('bad', !s.secure);
    this.el['sw-pill'].textContent = this.t(s.pwa.swRegistration ? 'swActive' : 'swInactive');
    this.el['sw-pill'].classList.toggle('good', !!s.pwa.swRegistration);

    const surface = s.cookies.total + s.localStorage.total + s.indexedDb.totalRecords;
    const score = Math.max(0, 100 - surface * 3);
    this.el['score-value'].textContent = score;
    const circle = this.el['score-ring'];
    const circumference = 2 * Math.PI * 46;
    circle.style.strokeDasharray = String(circumference);
    circle.style.strokeDashoffset = String(circumference * (1 - score / 100));
    circle.classList.toggle('warn', score < 60);

    this.el['notif-status'].textContent = this.permissionLabel(s.permissions.notifications);
    this.renderDetails(s);
    this.renderPwa(s);
  }

  permissionLabel(state) {
    const map = { granted: 'granted', denied: 'denied', default: 'defaultState', unsupported: 'unsupported' };
    return this.t(map[state] || 'unsupported');
  }

  renderDetails(s) {
    const cookieRows = s.cookies.items.length
      ? s.cookies.items.map(c => `<div class="detail-row"><span>${esc(c.name)}</span>
          <span class="tag ${c.prefix}">${this.t(c.prefix === 'app' ? 'appOnly' : 'scopeAll')}</span></div>`).join('')
      : `<p class="muted">${this.t('noCookies')}</p>`;
    const lsRows = s.localStorage.items.length
      ? s.localStorage.items.map(i => `<div class="detail-row"><span>${esc(i.key)}</span>
          <span class="tag ${i.prefix}">${i.size} ${this.t('bytes')}</span></div>`).join('')
      : `<p class="muted">${this.t('noKeys')}</p>`;
    const idbRows = s.indexedDb.dbs.length
      ? s.indexedDb.dbs.map(db => `<div class="detail-card"><b>${esc(db.name)}</b>
          <small>v${db.version || '?'} · ${db.stores.length} ${this.t('stores')}</small>
          ${db.stores.map(st => `<div class="detail-row"><span>${esc(st.name)}</span>
            <span class="tag">${st.count == null ? '?' : st.count} ${this.t('records')}</span></div>`).join('')}
          </div>`).join('')
      : `<p class="muted">${this.t('noDbs')}</p>`;

    this.el['details-content'].innerHTML = `
      <details open><summary>${this.t('cookiesSection')} <span class="count">${s.cookies.total}</span></summary>
        <p class="muted small">${this.t('httpOnlyNote')}</p>${cookieRows}</details>
      <details open><summary>${this.t('lsSection')} <span class="count">${s.localStorage.total}</span></summary>${lsRows}</details>
      <details><summary>${this.t('idbSection')} <span class="count">${s.indexedDb.totalDbs}</span></summary>${idbRows}</details>
      <details><summary>${this.t('permSection')}</summary>
        <div class="detail-row"><span>Notifications</span><span class="tag">${this.permissionLabel(s.permissions.notifications)}</span></div>
        <div class="detail-row"><span>Geolocation</span><span class="tag">${this.permissionLabel(s.permissions.geolocation)}</span></div>
      </details>`;
  }

  renderPwa(s) {
    const item = (label, ok) => `<div class="pwa-item ${ok ? 'good' : ''}"><span class="dot"></span><span>${label}</span><b>${ok ? '✓' : '—'}</b></div>`;
    this.el['pwa-content'].innerHTML = [
      item(this.t(s.secure ? 'secure' : 'insecure'), s.secure),
      item(this.t('swActive'), s.pwa.swRegistration),
      item(this.t('standalone'), s.pwa.standalone)
    ].join('');
  }

  renderLog(log) {
    this.el['log-list'].innerHTML = log.length ? log.map(entry => `
      <li class="log-item ${esc(entry.status)}">
        <span class="log-time">${new Date(entry.time).toLocaleTimeString()}</span>
        <b>${esc(entry.action)}</b><span>${esc(entry.detail)}</span>
      </li>`).join('') : `<li class="muted">${this.t('logEmpty')}</li>`;
  }

  showNotifGuide() {
    if (this.el['notif-dialog']) this.el['notif-dialog'].showModal();
  }

  askDanger(messageKey, scope, handler) {
    this._pendingDanger = { scope, handler };
    this.el['danger-text'].textContent = this.t(messageKey) + ' ' + this.t('dangerPhrase') + ' “' + this.t(scope === 'all' ? 'phraseAll' : 'OK') + '”.';
    if (scope === 'all') this.el['danger-text'].textContent += ' ' + this.t('warningAll');
    this.el['danger-input'].value = '';
    this.el['danger-dialog'].showModal();
    setTimeout(() => this.el['danger-input'].focus(), 0);
  }

  toast(msg) {
    const el = this.el.toast;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('on'), 2200);
  }
}
