/**
 * qr-logic.js — funzioni pure di QR Studio.
 * Importabile da Node (`node --test`) senza DOM.
 */

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeUrl(value) {
  const raw = String(value == null ? '' : value).trim();
  if (!raw) return '';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) return raw;
  if (/\s/.test(raw)) return raw;
  if (raw.includes('.') || /^localhost(?::\d+)?(?:\/|$)/i.test(raw)) {
    return 'https://' + raw;
  }
  return raw;
}

export function escapeWifi(value) {
  return String(value == null ? '' : value).replace(/([\\;,:"])/g, '\\$1');
}

export function buildWifiPayload(values = {}) {
  const ssid = String(values.ssid || '').trim();
  if (!ssid) return '';
  const security = values.security === 'nopass' ? 'nopass' : (values.security || 'WPA');
  let out = 'WIFI:T:' + security + ';S:' + escapeWifi(ssid) + ';';
  if (security !== 'nopass' && values.password) {
    out += 'P:' + escapeWifi(values.password) + ';';
  }
  if (values.hidden) out += 'H:true;';
  return out + ';';
}

export function escapeVCard(value) {
  return String(value == null ? '' : value)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

export function buildVCard(values = {}) {
  const first = String(values.firstName || '').trim();
  const last = String(values.lastName || '').trim();
  const org = String(values.org || '').trim();
  const phone = String(values.phone || '').trim();
  const email = String(values.email || '').trim();
  const url = normalizeUrl(values.url || '');
  const fn = [first, last].filter(Boolean).join(' ') || org;
  if (!fn && !phone && !email) return '';

  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  lines.push('N:' + escapeVCard(last) + ';' + escapeVCard(first) + ';;;');
  if (fn) lines.push('FN:' + escapeVCard(fn));
  if (org) lines.push('ORG:' + escapeVCard(org));
  if (phone) lines.push('TEL;TYPE=CELL:' + escapeVCard(phone));
  if (email) lines.push('EMAIL:' + escapeVCard(email));
  if (url) lines.push('URL:' + escapeVCard(url));
  lines.push('END:VCARD');
  return lines.join('\n');
}

export function buildEmailPayload(values = {}) {
  const to = String(values.to || '').trim();
  if (!to) return '';
  const params = new URLSearchParams();
  if (values.subject) params.set('subject', String(values.subject));
  if (values.body) params.set('body', String(values.body));
  const query = params.toString();
  return 'mailto:' + to + (query ? '?' + query : '');
}

export function buildSmsPayload(values = {}) {
  const phone = String(values.phone || '').trim();
  if (!phone) return '';
  const body = String(values.message || '');
  return 'sms:' + phone.replace(/[^\d+]/g, '') + (body ? '?body=' + encodeURIComponent(body) : '');
}

export function buildPhonePayload(value) {
  const phone = String(value || '').trim();
  if (!phone) return '';
  return 'tel:' + phone.replace(/[^\d+]/g, '');
}

export function buildGeoPayload(values = {}) {
  // Accetta sia "45.46" sia "45,46" (tastiera italiana).
  const lat = Number(String(values.lat ?? '').replace(',', '.'));
  const lng = Number(String(values.lng ?? '').replace(',', '.'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '';
  const label = String(values.label || '').trim();
  return 'geo:' + lat + ',' + lng + '?q=' + lat + ',' + lng + (label ? '(' + encodeURIComponent(label) + ')' : '');
}

export function formatIcsDate(value) {
  const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return m ? m[1] + m[2] + m[3] + 'T' + m[4] + m[5] + '00' : '';
}

export function escapeIcs(value) {
  return String(value == null ? '' : value)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function buildEventPayload(values = {}) {
  const title = String(values.title || '').trim();
  if (!title) return '';
  const start = formatIcsDate(values.start);
  if (!start) return '';
  const end = formatIcsDate(values.end);
  const lines = ['BEGIN:VEVENT', 'SUMMARY:' + escapeIcs(title)];
  if (values.location) lines.push('LOCATION:' + escapeIcs(values.location));
  lines.push('DTSTART:' + start);
  if (end) lines.push('DTEND:' + end);
  if (values.description) lines.push('DESCRIPTION:' + escapeIcs(values.description));
  lines.push('END:VEVENT');
  return lines.join('\n');
}

export function buildPayload(type, values = {}) {
  switch (type) {
    case 'link':
      return normalizeUrl(values.url);
    case 'text':
      return String(values.text || '');
    case 'wifi':
      return buildWifiPayload(values);
    case 'contact':
      return buildVCard(values);
    case 'email':
      return buildEmailPayload(values);
    case 'sms':
      return buildSmsPayload(values);
    case 'phone':
      return buildPhonePayload(values.phone);
    case 'geo':
      return buildGeoPayload(values);
    case 'event':
      return buildEventPayload(values);
    default:
      return '';
  }
}

export function detectPayloadType(text) {
  const t = String(text || '').trim();
  if (!t) return 'text';
  if (/^WIFI:/i.test(t)) return 'wifi';
  if (/^BEGIN:VCARD/i.test(t)) return 'vcard';
  if (/^BEGIN:VEVENT/i.test(t)) return 'event';
  if (/^geo:/i.test(t)) return 'geo';
  if (/^mailto:/i.test(t)) return 'email';
  if (/^(?:smsto:|sms:)/i.test(t)) return 'sms';
  if (/^tel:/i.test(t)) return 'tel';
  if (/^https?:\/\//i.test(t)) return 'url';
  if (/^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:[/:?#]|$)/i.test(t) && !/\s/.test(t)) return 'url';
  return 'text';
}

export function getVCardField(data, field) {
  // Supporta parametri tipo `TEL;TYPE=CELL:` e `EMAIL;TYPE=WORK:`.
  const re = new RegExp('^' + field + '(?:;[^:\\r\\n]*)?:(.*)$', 'im');
  const m = String(data || '').match(re);
  return m ? m[1].trim() : '';
}

function unescapeVCard(value) {
  return String(value == null ? '' : value).replace(/\\([\\;,nN])/g, (match, ch) =>
    ch === 'n' || ch === 'N' ? '\n' : ch
  );
}

function unescapeIcs(value) {
  return String(value == null ? '' : value).replace(/\\([\\;,nN])/g, (match, ch) =>
    ch === 'n' || ch === 'N' ? '\n' : ch
  );
}

function icsDateToLocal(value) {
  const m = String(value || '').match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}` : '';
}

/**
 * Inverso di buildPayload: estrae i campi del form da un payload esistente.
 * Usato da “Riusa” in cronologia e da “Crea QR” sui risultati della scansione.
 */
export function valuesFromPayload(type, data) {
  const text = String(data || '');
  switch (type) {
    case 'url':
      return { url: text };
    case 'text':
      return { text };
    case 'wifi': {
      const rawSecurity = (text.match(/^WIFI:T:([^;]*)/i) || [])[1] || 'WPA';
      const security = rawSecurity.toUpperCase() === 'NOPASS'
        ? 'nopass'
        : rawSecurity.toUpperCase() === 'WEP'
          ? 'WEP'
          : 'WPA';
      return {
        ssid: getWifiField(text, 'S'),
        security,
        password: getWifiField(text, 'P'),
        hidden: /(?:^|;)H:true(?:;|$)/i.test(text)
      };
    }
    case 'vcard': {
      const n = unescapeVCard(getVCardField(text, 'N'));
      const parts = n.split(';');
      return {
        firstName: parts[1] || '',
        lastName: parts[0] || '',
        org: unescapeVCard(getVCardField(text, 'ORG')),
        phone: unescapeVCard(getVCardField(text, 'TEL')),
        email: unescapeVCard(getVCardField(text, 'EMAIL')),
        url: unescapeVCard(getVCardField(text, 'URL'))
      };
    }
    case 'email': {
      try {
        const url = new URL(text);
        return {
          to: decodeURIComponent(url.pathname || ''),
          subject: url.searchParams.get('subject') || '',
          body: url.searchParams.get('body') || ''
        };
      } catch {
        return { to: text.replace(/^mailto:/i, '') };
      }
    }
    case 'sms': {
      const [head, query = ''] = text.replace(/^sms(to)?:/i, '').split('?');
      const params = new URLSearchParams(query);
      return { phone: head, message: params.get('body') || '' };
    }
    case 'tel':
      return { phone: text.replace(/^tel:/i, '') };
    case 'geo': {
      const [coords, query = ''] = text.replace(/^geo:/i, '').split('?');
      const [lat = '', lng = ''] = coords.split(',');
      const label = query.match(/[qQ]=[^(]*\(([^)]*)\)/);
      return {
        lat,
        lng,
        label: label ? decodeURIComponent(label[1]) : ''
      };
    }
    case 'event':
      return {
        title: unescapeIcs(getVCardField(text, 'SUMMARY')),
        start: icsDateToLocal(getVCardField(text, 'DTSTART')),
        end: icsDateToLocal(getVCardField(text, 'DTEND')),
        location: unescapeIcs(getVCardField(text, 'LOCATION')),
        description: unescapeIcs(getVCardField(text, 'DESCRIPTION'))
      };
    default:
      return { text };
  }
}

export function getWifiField(data, field) {
  const m = String(data || '').match(new RegExp('(?:^|;)' + field + ':((?:\\\\.|[^;])*)', 'i'));
  return m ? m[1].replace(/\\([\\;,:"])/g, '$1').trim() : '';
}

export function payloadLabel(type, data) {
  const text = String(data || '');
  switch (type) {
    case 'wifi': {
      const ssid = getWifiField(text, 'S');
      return ssid || 'Wi-Fi';
    }
    case 'vcard': {
      const fn = getVCardField(text, 'FN');
      return fn || 'Contact';
    }
    case 'event': {
      const title = getVCardField(text, 'SUMMARY');
      return title || 'Event';
    }
    case 'url': {
      try { return new URL(text).hostname.replace(/^www\./, '') || text; } catch { return truncate(text, 42); }
    }
    case 'email':
      return text.replace(/^mailto:/i, '').split('?')[0] || 'Email';
    case 'sms':
      return text.replace(/^sms(to)?:/i, '').split('?')[0] || 'SMS';
    case 'tel':
      return text.replace(/^tel:/i, '') || 'Phone';
    case 'geo':
      return text.replace(/^geo:/i, '').split('?')[0] || 'Location';
    default:
      return truncate(text.replace(/\s+/g, ' ').trim(), 48) || 'Text';
  }
}

export function truncate(value, max) {
  const text = String(value == null ? '' : value);
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

export function isSafeToOpen(type, data) {
  const text = String(data || '').trim();
  switch (type) {
    case 'url':
      return /^https?:\/\//i.test(text);
    case 'email':
      return /^mailto:/i.test(text);
    case 'sms':
      return /^sms(to)?:/i.test(text);
    case 'tel':
      return /^tel:/i.test(text);
    case 'geo':
      return /^geo:/i.test(text);
    default:
      return false;
  }
}

export function fileNameForData(data, size, extension) {
  const base = String(data || 'qr')
    .replace(/^https?:\/\//i, '')
    .replace(/[^\w\u00C0-\uFFFF-]+/g, '-')
    .slice(0, 40)
    .replace(/^-+|-+$/g, '') || 'qr';
  return 'qr-' + base + '-' + (size || 1024) + '.' + (extension || 'png');
}
