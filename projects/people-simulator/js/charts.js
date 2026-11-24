/* People Simulator — SVG charts */
import { ACTIVITIES } from './config.js';
import { dominant } from './model.js';

const COLORS = Object.fromEntries(ACTIVITIES.map(a => [a.id, a.color]));
export function activityBars(mix, lang = 'en') {
  return Object.entries(mix)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => {
      const a = ACTIVITIES.find(x => x.id === k);
      return `<div class="bar-row" data-k="${k}">
        <span class="bar-ico">${a?.icon || '•'}</span>
        <span class="bar-name">${a ? a[lang] : k}</span>
        <div class="bar-track"><i style="width:${v}%;background:${COLORS[k] || '#4de8ff'}"></i></div>
        <b class="bar-val">${v}%</b></div>`;
    }).join('');
}

export function donut(mix, size = 120) {
  const r = size / 2 - 10, c = size / 2, circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = Object.entries(mix).filter(([, v]) => v > 0).map(([k, v]) => {
    const len = circ * v / 100;
    const el = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${COLORS[k] || '#4de8ff'}"
      stroke-width="14" stroke-dasharray="${len} ${circ - len}" stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${c} ${c})"/>`;
    offset += len;
    return el;
  }).join('');
  const d = dominant(mix);
  return `<svg viewBox="0 0 ${size} ${size}" class="donut" aria-label="Activity mix">
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="14"/>
    ${arcs}<text x="${c}" y="${c + 5}" text-anchor="middle" class="donut-label">${d} ${mix[d]}%</text></svg>`;
}

export function sparkline(series, key = 'work', w = 260, h = 48) {
  const vals = series.map(s => s.metrics[key] || s.mix[key] || 0);
  const max = Math.max(1, ...vals), min = Math.min(0, ...vals);
  const pts = vals.map((v, i) => {
    const x = i / Math.max(1, vals.length - 1) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" class="spark" preserveAspectRatio="none">
    <polyline points="${pts}" fill="none" stroke="#4de8ff" stroke-width="2"/>
    <polygon points="0,${h} ${pts} ${w},${h}" fill="rgba(77,232,255,.1)"/></svg>`;
}

export function dayStrip(series, lang = 'en') {
  return series.map((s, i) => {
    const a = ACTIVITIES.find(x => x.id === s.dominant);
    return `<div class="day-cell" data-h="${s.hour}" title="${s.hour}:00">
      <b>${String(s.hour).padStart(2, '0')}</b>
      <span style="color:${COLORS[s.dominant] || '#fff'}">${a?.icon || '•'}</span>
      <small>${s.dominant}</small></div>`;
  }).join('');
}
