/* Streaming — Internet Archive API clients (pure, DOM-free) */
import { API, METADATA, DOWNLOAD, DETAILS, PAGE_SIZE } from './config.js';

export function buildQuery(terms, opts = {}) {
  const clean = String(terms || '').replace(/["']/g, '').trim();
  const parts = [];
  if (clean) parts.push(clean.split(/\s+/).filter(Boolean).map(t => `(${t})`).join(' AND '));
  if (opts.category) parts.push(`collection:${opts.category}`);
  else parts.push('mediatype:movies');
  if (opts.publicDomain) parts.push('licenseurl:*publicdomain*');
  if (opts.yearFrom) parts.push(`year:[${opts.yearFrom} TO ${opts.yearTo || null}]`);
  return parts.join(' AND ');
}

export function searchUrl(query, opts = {}) {
  const u = new URL(API);
  u.searchParams.set('q', query);
  u.searchParams.set('sort[]', opts.sort || 'week desc');
  ['identifier','title','description','creator','date','downloads','licenseurl','mediatype','subject']
    .forEach(field => u.searchParams.append('fl[]', field));
  u.searchParams.set('rows', String(opts.rows || PAGE_SIZE));
  u.searchParams.set('page', String(opts.page || 1));
  u.searchParams.set('output', 'json');
  return u.toString();
}

export function normalizeDoc(doc) {
  return {
    id: doc.identifier || '',
    title: doc.title || doc.identifier || '',
    description: String(doc.description || '').slice(0, 400),
    creator: Array.isArray(doc.creator) ? doc.creator[0] : (doc.creator || ''),
    year: String(doc.date || '').slice(0, 4),
    downloads: Number(doc.downloads) || 0,
    publicDomain: /publicdomain|creativecommons\.org\/licenses\/publicdomain/i.test(doc.licenseurl || ''),
    license: doc.licenseurl || '',
    subjects: Array.isArray(doc.subject) ? doc.subject.slice(0, 4) : [],
    source: 'archive',
    thumb: doc.identifier ? `https://archive.org/services/img/${encodeURIComponent(doc.identifier)}` : ''
  };
}

async function json(url, opts = {}) {
  const ctrl = opts.signal || (typeof AbortController !== 'undefined' ? new AbortController() : null);
  let timer = null;
  if (!opts.signal && ctrl) timer = setTimeout(() => ctrl.abort(), opts.timeout || 20000);
  try {
    const res = await (opts.fetchImpl || fetch)(url, { signal: ctrl?.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally { if (timer) clearTimeout(timer); }
}

export async function search(query, opts = {}) {
  const data = await json(searchUrl(query, opts), opts);
  const docs = data?.response?.docs || [];
  return { items: docs.map(normalizeDoc), total: Number(data?.response?.numFound) || 0 };
}

export function metadataUrl(id) { return METADATA + encodeURIComponent(id); }
export function fileUrl(id, name) {
  return DOWNLOAD + encodeURIComponent(id) + '/' + name.split('/').map(encodeURIComponent).join('/');
}
export function detailsUrl(id) { return DETAILS + encodeURIComponent(id); }

export function selectVideo(files = [], maxBytes = 300 * 1024 * 1024) {
  const videos = files.filter(f => {
    const name = String(f.name || '').toLowerCase();
    return /\.(mp4|m4v|webm|ogv|ogg|mov)$/.test(name) || /mpeg4|h\.264|webm/i.test(f.format || '');
  });
  if (!videos.length) return null;
  const bySize = videos.filter(f => Number(f.size) > 0).sort((a, b) => Number(a.size) - Number(b.size));
  const small = bySize.find(f => Number(f.size) < 80 * 1024 * 1024);
  const medium = bySize.find(f => Number(f.size) < maxBytes);
  return small || medium || bySize[0] || videos[0];
}

export async function getVideo(id, opts = {}) {
  const data = await json(metadataUrl(id), opts);
  const file = selectVideo(data.files || []);
  if (!file) return null;
  return {
    id, name: file.name,
    url: fileUrl(id, file.name),
    size: Number(file.size) || 0,
    format: file.format || '',
    duration: file.length || '',
    thumb: `https://archive.org/services/img/${encodeURIComponent(id)}`,
    license: data.metadata?.licenseurl || ''
  };
}

export function ytIdOf(url) {
  const s = String(url || '');
  let m;
  m = s.match(/[?&]v=([\w-]{6,})/); if (m) return m[1];
  m = s.match(/youtu\.be\/([\w-]{6,})/); if (m) return m[1];
  m = s.match(/youtube\.com\/(?:shorts|embed|live)\/([\w-]{6,})/); if (m) return m[1];
  return null;
}
export function isYoutube(url) { return /youtube\.com|youtu\.be/i.test(String(url || '')); }
export function isDirectVideo(url) {
  return /\.(mp4|m4v|webm|ogv|ogg|mov)(\?|#|$)/i.test(String(url || ''));
}
