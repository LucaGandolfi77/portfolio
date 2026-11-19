/* Privacy Audit — local report generation (values redacted by default) */

function redact(value) {
  const length = Math.max(4, Math.min(12, String(value == null ? '' : value).length));
  return '•'.repeat(length);
}

function reportObject(snapshot, includeValues) {
  return {
    generatedAt: snapshot.timestamp,
    origin: snapshot.origin,
    secureContext: snapshot.secure,
    userAgent: snapshot.userAgent,
    summary: {
      readableCookies: snapshot.cookies.total,
      localStorageKeys: snapshot.localStorage.total,
      localStorageBytes: snapshot.localStorage.bytes,
      indexedDbDatabases: snapshot.indexedDb.totalDbs,
      indexedDbRecords: snapshot.indexedDb.totalRecords,
      notifications: snapshot.permissions.notifications
    },
    cookies: snapshot.cookies.items.map(c => ({
      name: c.name,
      value: includeValues ? c.value : redact(c.value),
      scope: c.prefix
    })),
    localStorage: snapshot.localStorage.items.map(i => ({
      key: i.key,
      size: i.size,
      value: includeValues ? (i.rawValue ?? redact('')) : redact(''),
      scope: i.prefix
    })),
    indexedDb: snapshot.indexedDb.dbs.map(db => ({
      name: db.name,
      version: db.version,
      error: db.error,
      stores: db.stores
    })),
    permissions: snapshot.permissions,
    pwa: snapshot.pwa,
    notes: [
      snapshot.cookies.note,
      'HttpOnly cookies cannot be read or deleted from JavaScript.',
      includeValues ? 'Values were included intentionally.' : 'Values are redacted by default.'
    ]
  };
}

export function buildReport(snapshot, { includeValues = false, format = 'json' } = {}) {
  const report = reportObject(snapshot, includeValues);
  if (format === 'txt') {
    const lines = [
      'PRIVACY AUDIT REPORT',
      '====================',
      `Generated: ${report.generatedAt}`,
      `Origin: ${report.origin}`,
      `Secure context: ${report.secureContext}`,
      '',
      'SUMMARY',
      `  Readable cookies: ${report.summary.readableCookies}`,
      `  localStorage keys: ${report.summary.localStorageKeys} (${report.summary.localStorageBytes} bytes)`,
      `  IndexedDB databases: ${report.summary.indexedDbDatabases}`,
      `  IndexedDB records: ${report.summary.indexedDbRecords}`,
      `  Notifications: ${report.summary.notifications}`,
      '',
      'COOKIES',
      ...report.cookies.map(c => `  ${c.name} = ${c.value} [${c.scope}]`),
      '',
      'LOCAL STORAGE',
      ...report.localStorage.map(i => `  ${i.key} (${i.size} bytes) = ${i.value} [${i.scope}]`),
      '',
      'INDEXEDDB',
      ...report.indexedDb.flatMap(db => [
        `  ${db.name} v${db.version || '?'}${db.error ? ' ERROR: ' + db.error : ''}`,
        ...db.stores.map(s => `    ${s.name}: ${s.count == null ? '?' : s.count} records`)
      ]),
      '',
      'NOTES',
      ...report.notes.map(n => `  - ${n}`)
    ];
    return lines.join('\n');
  }
  return JSON.stringify(report, null, 2);
}

export function downloadReport(snapshot, options = {}) {
  const format = options.format === 'txt' ? 'txt' : 'json';
  const content = buildReport(snapshot, { ...options, format });
  const blob = new Blob([content], {
    type: format === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `privacy-audit-${new Date().toISOString().slice(0, 10)}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
