/* People Simulator — local GeoJSON loading and map rendering */
import { ACTIVITIES, TIMEZONES } from './config.js';

const ACT_COLORS = Object.fromEntries(ACTIVITIES.map(a => [a.id, a.color]));

export function loadTopology(us, projection, pathGen) {
  const topojson = window.topojson;
  const features = topojson.feature(us, us.objects.states).features.filter(f => pathGen(f));
  return features.map(f => ({ ...f, id: f.properties.name, path: pathGen(f) }));
}

export function mixColor(mix, fallback = '#141d33') {
  let best = 'home', value = -1;
  Object.entries(mix).forEach(([k, v]) => { if (v > value) { value = v; best = k; } });
  const color = ACT_COLORS[best] || fallback;
  const t = Math.min(1, Math.sqrt(value / 70) * 0.85 + 0.15);
  return blendHex(fallback, color, t);
}

function blendHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const mix = (shift) => {
    const av = (pa >> shift) & 255, bv = (pb >> shift) & 255;
    return Math.round(av + (bv - av) * t).toString(16).padStart(2, '0');
  };
  return '#' + mix(16) + mix(8) + mix(0);
}

export function svgPath(features, selected, onSelect) {
  return features.map(f => `
    <path class="state${selected === f.id ? ' selected' : ''}" data-name="${f.id.replace(/"/g, '&quot;')}"
      d="${f.path}" fill="${f.fill || '#141d33'}"></path>`).join('');
}

export function flows(origin, destinations, viewBox) {
  const [w, h] = viewBox;
  return destinations.map(d => {
    const x1 = w / 2 + (Math.random() - 0.5) * w * 0.3;
    const y1 = h / 2 + (Math.random() - 0.5) * h * 0.3;
    const x2 = Math.random() * w, y2 = Math.random() * h;
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 - 40;
    return `<path d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}" fill="none" stroke="#4de8ff" stroke-opacity=".25" stroke-width="1.5"/>`;
  }).join('');
}
