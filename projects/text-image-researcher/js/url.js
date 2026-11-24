/**
 * url.js — utility URL pure per il researcher.
 */

export function isValidUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) { return false; }
}

export function normalizeUrl(value) {
  let raw = String(value || '').trim();
  if (!raw) return '';
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  try {
    const url = new URL(raw);
    url.hash = '';
    return url.href;
  } catch (e) { return ''; }
}

export function resolveUrl(href, base) {
  if (!href) return '';
  const value = String(href).trim();
  if (/^(javascript:|mailto:|tel:|data:|#)/i.test(value)) return '';
  try { return new URL(value, base).href; }
  catch (e) { return ''; }
}

export function sameOrigin(url, base) {
  try { return new URL(url).origin === new URL(base).origin; }
  catch (e) { return false; }
}

export function isAssetUrl(url) {
  return /\.(jpe?g|png|gif|svg|webp|avif|pdf|zip|mp3|mp4|css|js|ico|woff2?|ttf|eot)(\?.*)?$/i.test(String(url || ''));
}

export function dedupeUrls(list) {
  const seen = new Set();
  return (Array.isArray(list) ? list : []).filter((url) => {
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

export function hostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch (e) { return ''; }
}

export function displayUrl(url, max = 72) {
  const value = String(url || '');
  if (value.length <= max) return value;
  return value.slice(0, max - 1) + '…';
}
