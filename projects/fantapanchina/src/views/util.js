export const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function sparkline(values, w = 72, h = 22) {
  const v = (values || []).slice(-8);
  if (v.length < 2) return `<svg class="spark" viewBox="0 0 ${w} ${h}"><path d="M0 ${h} L${w} ${h}" stroke="rgba(255,255,255,.15)" fill="none"/></svg>`;
  const min = Math.min(...v), max = Math.max(...v), span = Math.max(0.1, max - min);
  const pts = v.map((n, i) => `${(i / (v.length - 1) * w).toFixed(1)},${(h - 2 - (n - min) / span * (h - 4)).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function voteColor(v) {
  if (v >= 8) return 'var(--green)';
  if (v >= 7) return 'var(--cyan)';
  if (v >= 6) return 'var(--gold)';
  if (v >= 5) return 'var(--orange)';
  return 'var(--red)';
}
