/* T-SNE 3D — pure shareable URL hash codec */
export function b64url(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function b64durl(s) {
  return decodeURIComponent(escape(atob(String(s).replace(/-/g, '+').replace(/_/g, '/'))));
}
export function encodeHash({ sample, data, perplexity, exaggeration, label, view, level, k }) {
  const p = new URLSearchParams();
  if (sample) p.set('s', sample);
  else if (data) p.set('d', b64url(data));
  p.set('p', String(perplexity));
  p.set('e', String(exaggeration));
  if (label != null) p.set('l', String(label));
  if (view) p.set('v', view);
  if (level != null) p.set('t', String(level));
  if (k) p.set('k', String(k));
  return p.toString();
}
export function decodeHash(hash) {
  try {
    const p = new URLSearchParams(String(hash || '').replace(/^#/, ''));
    const known = ['s','d','p','e','l','v','t','k'];
    if (![...p.keys()].some(k => known.includes(k))) return null;
    return {
      sample: p.get('s') || null,
      data: p.get('d') ? b64durl(p.get('d')) : null,
      perplexity: +(p.get('p') || 30),
      exaggeration: +(p.get('e') || 12),
      label: p.has('l') ? +p.get('l') : null,
      view: p.get('v') || 'cloud',
      level: p.has('t') ? +p.get('t') : 1,
      k: p.has('k') ? +p.get('k') : 0
    };
  } catch (e) { return null; }
}
