/* ============================================================
   Shake Me — glasses, tools, people, drawn as SVG strings
   ============================================================ */
import { BY_ID } from '../data/ingredients.js';
import { GLASSES, GARNISH } from '../data/bar.js';
import { colourOf, mlOf } from '../workbench.js';

/**
 * Glass shapes in a 100 × 140 box: the outline, and the inside as a
 * polygon from the rim (y0) to the bottom (y1) for the liquid.
 */
const SHAPES = {
  cocktail: { out: 'M10 22 L90 22 L54 74 L54 118 L72 126 L28 126 L46 118 L46 74 Z', in: [[13, 24], [87, 24], [50, 70]], stem: true },
  rocks: { out: 'M18 50 L82 50 L78 126 L22 126 Z', in: [[20, 52], [80, 52], [76, 120], [24, 120]] },
  highball: { out: 'M28 14 L72 14 L69 128 L31 128 Z', in: [[30, 16], [70, 16], [67, 122], [33, 122]] },
  flute: { out: 'M38 10 L62 10 L58 84 L52 92 L52 120 L64 126 L36 126 L48 120 L48 92 L42 84 Z', in: [[40, 12], [60, 12], [56, 82], [44, 82]], stem: true },
  wine: { out: 'M22 18 L78 18 C84 62 66 82 54 84 L54 118 L70 126 L30 126 L46 118 L46 84 C34 82 16 62 22 18 Z', in: [[24, 20], [76, 20], [72, 60], [50, 80], [28, 60]], stem: true },
  goblet: { out: 'M16 40 L84 40 C84 72 70 86 54 88 L54 116 L70 126 L30 126 L46 116 L46 88 C30 86 16 72 16 40 Z', in: [[18, 42], [82, 42], [74, 74], [50, 84], [26, 74]], stem: true },
  mule: { out: 'M22 40 L78 40 L80 126 L20 126 Z M78 58 C98 58 98 102 78 102 L78 94 C88 94 88 66 78 66 Z', in: [[24, 42], [76, 42], [78, 120], [22, 120]], copper: true },
  irish: { out: 'M24 26 L76 26 L70 92 L54 98 L54 116 L68 126 L32 126 L46 116 L46 98 L30 92 Z M74 40 C90 40 90 72 72 74 L72 66 C82 66 82 48 74 48 Z', in: [[26, 28], [74, 28], [68, 88], [32, 88]], stem: true },
  julep: { out: 'M22 30 L78 30 L74 116 L26 116 L28 126 L72 126 L74 116 Z', in: [[24, 32], [76, 32], [72, 112], [28, 112]], copper: false, metal: true },
  tiki: { out: 'M24 12 L76 12 L80 126 L20 126 Z', in: [[26, 14], [74, 14], [77, 120], [23, 120]], tiki: true },
};

const poly = (pts) => pts.map((p) => p.join(',')).join(' ');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Height range of the inside polygon. */
const span = (pts) => [Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))];

/**
 * opts: {pours, ice, rim, garnish, uid, empty?}
 * The liquid rises with the volume; dense last pours sit at the bottom,
 * floats sit on top as their own layer.
 */
export function glassSVG(id, opts = {}) {
  const shape = SHAPES[id] || SHAPES.rocks;
  const cap = (GLASSES.find((g) => g.id === id) || { cap: 300 }).cap;
  const uid = opts.uid || 'g';
  const pours = opts.pours || [];
  const total = pours.reduce((n, p) => n + mlOf(p), 0) + (opts.extraMl || 0);
  const [top, bottom] = span(shape.in);
  const fill = Math.min(0.94, total / cap + (opts.ice === 'crushed' ? 0.08 : opts.ice === 'cubes' ? 0.05 : 0));
  const level = bottom - (bottom - top) * fill;
  // layers: the last pours of dense liqueurs sink, other last pours float
  const lastN = Math.max(-1, ...pours.map((p) => p.n ?? -1));
  const tail = pours.filter((p) => p.layer);
  const body = pours.filter((p) => !p.layer);
  const bodyColour = colourOf(body) || colourOf(pours);
  let layers = '';
  if (total > 0 && bodyColour) {
    layers += `<rect x="0" y="${level}" width="100" height="${bottom - level + 2}" fill="${bodyColour}" opacity=".9"/>`;
    for (const p of tail) {
      const h = Math.max(3, ((bottom - top) * mlOf(p)) / cap);
      const c = BY_ID[p.id].color;
      if (BY_ID[p.id].dense) layers += `<rect x="0" y="${bottom - h}" width="100" height="${h + 2}" fill="${c}" opacity=".95"/>`;
      else layers += `<rect x="0" y="${level}" width="100" height="${h}" fill="${c}" opacity=".95"/>`;
    }
    if (pours.some((p) => BY_ID[p.id].fizzy)) {
      for (let i = 0; i < 9; i++) layers += `<circle cx="${30 + ((i * 37) % 40)}" cy="${level + 4 + ((i * 23) % Math.max(4, bottom - level - 6))}" r="1.3" fill="#fff" opacity=".7"><animate attributeName="cy" values="${bottom};${level}" dur="${1.4 + (i % 3) * 0.5}s" repeatCount="indefinite"/></circle>`;
    }
    if (pours.some((p) => p.id === 'egg-white' || p.id === 'cream') || opts.foam) layers += `<rect x="0" y="${level - 1}" width="100" height="5" fill="#fffaf0" opacity=".85"/>`;
  }
  let ice = '';
  if (opts.ice === 'cubes') for (let i = 0; i < 4; i++) ice += `<rect x="${30 + (i % 2) * 20 + (i > 1 ? 6 : 0)}" y="${Math.max(top + 4, bottom - 22 - i * 13)}" width="17" height="15" rx="3" fill="#e9f7ff" opacity=".55" stroke="#fff" stroke-width=".8"/>`;
  if (opts.ice === 'crushed') for (let i = 0; i < 26; i++) ice += `<rect x="${22 + ((i * 29) % 56)}" y="${top + 6 + ((i * 47) % Math.max(10, bottom - top - 10))}" width="6" height="5" rx="1.5" fill="#f1fbff" opacity=".6"/>`;
  const glassFill = shape.copper ? '#c8733a' : shape.metal ? '#c9ced6' : 'rgba(220,240,255,.16)';
  const opaque = shape.copper || shape.metal;
  const rim = opts.rim ? `<line x1="${shape.in[0][0]}" y1="${top - 1}" x2="${shape.in[1][0]}" y2="${top - 1}" stroke="#fff" stroke-width="3" stroke-dasharray="1.5 1.6" stroke-linecap="round"/>` : '';
  const garnish = (opts.garnish || []).slice(0, 4).map((g, i) => `<text x="${shape.in[1][0] - 6 - i * 13}" y="${top + 2}" font-size="15" text-anchor="middle">${GARNISH[g]?.icon || ''}</text>`).join('');
  return `<svg viewBox="0 0 100 140" class="glass-svg" role="img" aria-label="${esc(opts.label || id)}">
    <defs><clipPath id="${uid}-in"><polygon points="${poly(shape.in)}"/></clipPath></defs>
    <path d="${shape.out}" fill="${glassFill}" stroke="${opaque ? '#7a4a2a' : '#e8f4ff'}" stroke-width="2" stroke-linejoin="round"/>
    ${opaque ? `<polygon points="${poly(shape.in)}" fill="#3a2418" opacity=".55"/>` : ''}
    <g clip-path="url(#${uid}-in)">${layers}${ice}</g>
    ${opaque ? '' : `<path d="${shape.out}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1"/>`}
    ${shape.tiki ? '<g fill="none" stroke="#7a4a2a" stroke-width="2.5" opacity=".75"><path d="M34 54 h10 M56 54 h10 M44 78 q6 6 12 0"/></g>' : ''}
    ${rim}${garnish}
  </svg>`;
}

/** The tool on the bench, with what is inside. */
export function toolSVG(id, pours, ice, uid = 't') {
  if (!id || id === 'glass') return '';
  const total = pours.reduce((n, p) => n + mlOf(p), 0);
  const col = colourOf(pours) || 'transparent';
  const frac = Math.min(0.85, total / 300);
  if (id === 'shaker') {
    const top = 128 - 84 * frac;
    return `<svg viewBox="0 0 100 140" class="tool-svg" role="img" aria-label="shaker">
      <defs><clipPath id="${uid}"><path d="M26 44 L74 44 L68 128 L32 128 Z"/></clipPath></defs>
      <path d="M26 44 L74 44 L68 128 L32 128 Z" fill="#cfd6de" stroke="#8a96a2" stroke-width="2"/>
      <g clip-path="url(#${uid})" opacity=".55"><rect x="0" y="${top}" width="100" height="140" fill="${col}"/>${ice ? '<rect x="38" y="100" width="12" height="11" rx="2" fill="#fff"/><rect x="52" y="108" width="12" height="11" rx="2" fill="#fff"/>' : ''}</g>
      <path d="M30 44 L36 18 L64 18 L70 44 Z" fill="#b9c2cc" stroke="#8a96a2" stroke-width="2"/>
      <rect x="42" y="8" width="16" height="11" rx="3" fill="#a9b3be" stroke="#8a96a2" stroke-width="2"/>
      <path d="M33 60 L67 60" stroke="#fff" stroke-width="2" opacity=".6"/>
    </svg>`;
  }
  if (id === 'mixing') {
    const top = 126 - 80 * frac;
    return `<svg viewBox="0 0 100 140" class="tool-svg" role="img" aria-label="mixing glass">
      <defs><clipPath id="${uid}"><path d="M24 40 L76 40 L72 126 L28 126 Z"/></clipPath></defs>
      <g clip-path="url(#${uid})"><rect x="0" y="${top}" width="100" height="140" fill="${col}" opacity=".85"/>${ice ? '<rect x="34" y="96" width="13" height="12" rx="2" fill="#eef9ff" opacity=".7"/><rect x="52" y="104" width="13" height="12" rx="2" fill="#eef9ff" opacity=".7"/>' : ''}</g>
      <path d="M24 40 L76 40 L72 126 L28 126 Z" fill="rgba(220,240,255,.18)" stroke="#e8f4ff" stroke-width="2"/>
      <path d="M24 40 L18 34 L30 34" fill="none" stroke="#e8f4ff" stroke-width="2"/>
      <line x1="62" y1="12" x2="54" y2="118" stroke="#c9ced6" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }
  const top = 104 - 70 * frac;
  return `<svg viewBox="0 0 100 140" class="tool-svg" role="img" aria-label="blender">
    <defs><clipPath id="${uid}"><path d="M28 22 L72 22 L66 104 L34 104 Z"/></clipPath></defs>
    <g clip-path="url(#${uid})"><rect x="0" y="${top}" width="100" height="140" fill="${col}" opacity=".85"/>${ice ? '<g fill="#fff" opacity=".7"><rect x="40" y="90" width="7" height="6"/><rect x="52" y="86" width="7" height="6"/><rect x="46" y="96" width="7" height="6"/></g>' : ''}</g>
    <path d="M28 22 L72 22 L66 104 L34 104 Z" fill="rgba(220,240,255,.2)" stroke="#e8f4ff" stroke-width="2"/>
    <path d="M72 30 C88 30 88 70 70 74" fill="none" stroke="#e8f4ff" stroke-width="3"/>
    <rect x="26" y="14" width="48" height="9" rx="3" fill="#3a3f48"/>
    <path d="M30 104 L70 104 L76 132 L24 132 Z" fill="#3a3f48"/>
    <circle cx="50" cy="119" r="5" fill="#d23a3a"/>
  </svg>`;
}

/** A face for the customers and Tobia. */
export function personSVG({ color = '#c8734a', hair = '#2b1b14', beard = false, glasses = false, mood = 'smile', cardigan = '#7a3a2e' } = {}) {
  const mouth = mood === 'sad' ? 'M42 80 Q50 74 58 80' : mood === 'wow' ? 'M46 77 Q50 84 54 77 Z' : 'M41 76 Q50 85 59 76';
  return `<svg viewBox="0 0 100 110" class="person" aria-hidden="true">
    <path d="M14 110 C16 88 30 82 50 82 C70 82 84 88 86 110 Z" fill="${cardigan}"/>
    <path d="M44 84 L50 98 L56 84" fill="#f4efe6"/>
    <circle cx="50" cy="52" r="27" fill="${color}"/>
    <path d="M23 50 C22 24 40 18 52 19 C68 20 80 30 77 50 C72 36 60 31 50 34 C38 31 28 38 23 50 Z" fill="${hair}"/>
    ${beard ? `<path d="M28 62 C32 86 68 86 72 62 C66 72 34 72 28 62 Z" fill="${hair}"/>` : ''}
    <circle cx="40" cy="55" r="3" fill="#1c1210"/><circle cx="60" cy="55" r="3" fill="#1c1210"/>
    ${glasses ? '<g fill="none" stroke="#2a2a2a" stroke-width="2"><circle cx="40" cy="55" r="8"/><circle cx="60" cy="55" r="8"/><path d="M48 55 h4"/></g>' : ''}
    <path d="${mouth}" fill="${mood === 'wow' ? '#5a1a1a' : 'none'}" stroke="#5a1a1a" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

export const TOBIA = { color: '#e2a77e', hair: '#e8e4dc', beard: true, glasses: true, cardigan: '#2f5a4a' };
