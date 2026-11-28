/* ============================================================
   Ultimo Colore — people and creatures as SVG strings
   ------------------------------------------------------------
   Flat paint with a charcoal line, to sit on the painted places.
   Heroes are people drained of colour except their own.
   ============================================================ */

const INK = '#1a1210';

const svg = (box, body, cls = '', label = '') =>
  `<svg viewBox="${box}" class="${cls}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>${body}</svg>`;

const LOOK = {
  ilario: { coat: '#55504c', accent: '#e8862c', skin: '#c9ab94', hair: '#8c8782' },
  nora: { coat: '#4a4a56', accent: '#f2c230', skin: '#d2b09a', hair: '#2a1c16' },
  tecla: { coat: '#6a6664', accent: '#c8323c', skin: '#cdb9ad', hair: '#4a4644' },
  bastiano: { coat: '#6e5a34', accent: '#b88a3a', skin: '#c4a28a', hair: '#e6e2da' },
};

function head(id, c) {
  const face = `<ellipse cx="50" cy="34" rx="15" ry="17" fill="${c.skin}" stroke="${INK}" stroke-width="2"/>
    <path d="M42 33 h4 M54 33 h4" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (id === 'ilario') return `${face}<path d="M37 41 Q50 56 63 41 Q58 46 50 45 Q42 46 37 41 Z" fill="${c.hair}" stroke="${INK}" stroke-width="1.5"/>
    <path d="M30 24 Q50 14 70 24 L68 28 Q50 22 32 28 Z" fill="#35302c" stroke="${INK}" stroke-width="2"/><path d="M36 23 Q38 8 50 8 Q62 8 64 23 Z" fill="#35302c" stroke="${INK}" stroke-width="2"/><path d="M37 20 Q50 15 63 20" stroke="${c.accent}" stroke-width="3.5" fill="none"/>`;
  if (id === 'nora') return `<path d="M32 36 Q28 12 50 14 Q72 12 68 36 L72 54 Q64 46 63 34 Q56 24 42 25 Q36 30 36 44 L28 54 Z" fill="${c.hair}" stroke="${INK}" stroke-width="2"/>${face}<path d="M35 30 Q40 18 54 20 Q64 22 65 30 Q52 24 35 30 Z" fill="${c.hair}"/><path d="M45 43 Q50 46 55 42" stroke="${INK}" stroke-width="1.8" fill="none"/>`;
  if (id === 'tecla') return `${face}<path d="M34 32 Q32 14 50 15 Q68 14 66 32 Q58 22 50 22 Q40 23 34 32 Z" fill="${c.hair}" stroke="${INK}" stroke-width="2"/><circle cx="50" cy="13" r="7" fill="${c.hair}" stroke="${INK}" stroke-width="2"/>
    <g fill="none" stroke="${INK}" stroke-width="1.5"><circle cx="44" cy="33" r="6"/><circle cx="56" cy="33" r="6"/></g><path d="M46 44 h8" stroke="${INK}" stroke-width="1.8"/>`;
  return `${face}<path d="M35 38 Q36 62 50 62 Q64 62 65 38 Q58 48 50 47 Q42 48 35 38 Z" fill="${c.hair}" stroke="${INK}" stroke-width="2"/><path d="M36 28 Q34 20 42 18 M64 28 Q66 20 58 18" stroke="${c.hair}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M38 27 h9 M53 27 h9" stroke="${c.hair}" stroke-width="3"/>`;
}

function weapon(id, c) {
  if (id === 'ilario') return `<path d="M78 12 L70 142" stroke="#3a2c20" stroke-width="5" stroke-linecap="round"/><g transform="translate(79 14)"><path d="M-9 0 Q-11 18 0 20 Q11 18 9 0 Q0 -5 -9 0 Z" fill="${c.accent}" stroke="${INK}" stroke-width="2"/><circle cy="8" r="17" fill="${c.accent}" opacity=".22"/></g>`;
  if (id === 'nora') return `<path d="M76 92 L94 62 L88 88 Z" fill="#d8d4cc" stroke="${INK}" stroke-width="1.6"/><path d="M24 92 L6 66 L14 90 Z" fill="#d8d4cc" stroke="${INK}" stroke-width="1.6"/>`;
  if (id === 'tecla') return `<path d="M74 70 L90 138" stroke="#b9a46a" stroke-width="3" stroke-linecap="round"/><path d="M74 70 L66 136" stroke="#b9a46a" stroke-width="3" stroke-linecap="round"/><circle cx="74" cy="70" r="5" fill="#b9a46a" stroke="${INK}" stroke-width="1.5"/>`;
  return `<path d="M80 66 L82 130" stroke="#3a2c20" stroke-width="6" stroke-linecap="round"/><path d="M68 56 Q70 34 82 34 Q94 34 96 56 L100 66 L64 66 Z" fill="${c.accent}" stroke="${INK}" stroke-width="2"/><circle cx="82" cy="70" r="4" fill="#6a5020"/>`;
}

export function heroSVG(id, { portrait = false, label = '' } = {}) {
  if (id === 'ombra') return dogSVG();
  if (id === 'vela') return velaSVG();
  if (id === 'ada') return statueSVG();
  const c = LOOK[id];
  if (!c) return '';
  const body = `
    <path d="M38 118 L34 144 L44 144 L48 120 Z M62 118 L66 144 L56 144 L52 120 Z" fill="#2c2826" stroke="${INK}" stroke-width="2"/>
    <path d="M36 50 Q50 44 64 50 L${id === 'bastiano' ? '80 122 L20 122' : '74 122 L26 122'} Z" fill="${c.coat}" stroke="${INK}" stroke-width="2.4"/>
    <path d="M40 52 Q50 62 60 52 L${id === 'nora' ? '66 84 L56 66' : '54 76 L46 76'} Z" fill="${c.accent}" stroke="${INK}" stroke-width="1.6"/>
    <path d="M36 56 Q24 70 24 92 M64 56 Q76 68 76 90" stroke="${c.coat}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <circle cx="24" cy="93" r="5" fill="${c.skin}" stroke="${INK}" stroke-width="1.5"/><circle cx="76" cy="91" r="5" fill="${c.skin}" stroke="${INK}" stroke-width="1.5"/>
    ${head(id, c)}`;
  return portrait ? svg('14 2 72 72', body, 'portrait', label) : svg('0 0 104 150', weapon(id, c) + body, 'hero', label);
}

export function dogSVG() {
  return svg('0 0 100 80', `<path d="M20 44 Q14 28 22 20" stroke="#14100f" stroke-width="7" fill="none" stroke-linecap="round"/>
    <ellipse cx="46" cy="52" rx="28" ry="18" fill="#1c1816" stroke="#000" stroke-width="2"/>
    <path d="M30 62 v14 M44 68 v9 M58 68 v9 M68 60 v16" stroke="#14100f" stroke-width="7" stroke-linecap="round"/>
    <circle cx="74" cy="36" r="15" fill="#1c1816" stroke="#000" stroke-width="2"/><path d="M64 28 L60 12 L72 23 Z M82 24 L90 10 L88 30 Z" fill="#1c1816" stroke="#000" stroke-width="2"/>
    <ellipse cx="86" cy="41" rx="8" ry="6" fill="#2a2422"/><circle cx="78" cy="33" r="2.6" fill="#ffd27a"/>`, 'dog portrait');
}

export function velaSVG() {
  return svg('14 2 72 72', `<path d="M30 36 Q26 8 50 10 Q76 8 70 38 L76 74 L62 46 L38 46 L24 74 Z" fill="#dedbd3" stroke="#8f8c86" stroke-width="2"/>
    <path d="M30 72 Q34 54 50 54 Q66 54 70 72 Z" fill="#e9e6df" stroke="#8f8c86" stroke-width="2"/>
    <ellipse cx="50" cy="34" rx="15" ry="17" fill="#efece6" stroke="#8f8c86" stroke-width="2"/>
    <circle cx="44" cy="33" r="3" fill="#6a6660"/><circle cx="56" cy="33" r="3" fill="#6a6660"/><path d="M46 44 Q50 42 54 44" stroke="#6a6660" stroke-width="1.6" fill="none"/>
    <path d="M58 18 L54 26 L60 30" stroke="#8f8c86" stroke-width="1.4" fill="none"/>`, 'portrait');
}

function statueSVG() {
  return svg('14 2 72 72', `<path d="M26 74 Q30 50 50 50 Q70 50 74 74 Z" fill="#e4e0d8" stroke="#9a968e" stroke-width="2"/>
    <ellipse cx="50" cy="34" rx="15" ry="17" fill="#ece8e0" stroke="#9a968e" stroke-width="2"/><path d="M33 30 Q36 12 50 13 Q64 12 67 30 Q50 20 33 30 Z" fill="#dcd8d0" stroke="#9a968e" stroke-width="2"/>
    <path d="M41 33 q3 -3 6 0 M53 33 q3 -3 6 0 M45 43 q5 3 10 0" stroke="#8a867e" stroke-width="1.6" fill="none"/>
    <ellipse cx="50" cy="66" rx="14" ry="8" fill="#d8d0c0" stroke="#9a968e" stroke-width="2"/>`, 'portrait');
}

/* ---------- the Faded ---------- */

const glass = (d, fill = '#46c878', o = 0.85) => `<path d="${d}" fill="${fill}" opacity="${o}" stroke="#0c3a22" stroke-width="2" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#d8ffe8" stroke-width=".7" opacity=".7" transform="translate(2 2)"/>`;
const eyes = (x1, x2, y, c = '#f4ffd8') => `<circle cx="${x1}" cy="${y}" r="3.4" fill="${c}"/><circle cx="${x2}" cy="${y}" r="3.4" fill="${c}"/>`;

const FOES = {
  cocci: () => svg('0 0 120 120', `${glass('M34 108 L18 70 L46 62 Z', '#2f9e5a')}${glass('M44 110 L38 52 L66 40 L72 104 Z')}${glass('M70 106 L80 58 L104 76 L96 108 Z', '#2a8a50')}${glass('M46 56 L52 18 L70 44 Z', '#6ee09a')}${glass('M64 46 L88 28 L78 62 Z', '#3ab46a')}${eyes(50, 64, 68)}`, 'foe'),
  granchio: () => svg('0 0 140 120', `<g stroke="#1e3a20" stroke-width="7" fill="none" stroke-linecap="round"><path d="M34 86 L14 108 M50 94 L40 112 M90 94 L100 112 M106 86 L126 108"/></g>
    <path d="M22 70 Q6 52 18 38 Q30 36 32 50 L24 52 Q18 56 30 64 Z M118 70 Q134 52 122 38 Q110 36 108 50 L116 52 Q122 56 110 64 Z" fill="#4a7a3a" stroke="#132a12" stroke-width="2.5"/>
    <ellipse cx="70" cy="74" rx="46" ry="28" fill="#3a6a34" stroke="#132a12" stroke-width="2.5"/>
    <path d="M34 62 q6 -22 12 -4 q5 -26 14 -6 q6 -30 14 -4 q8 -24 14 2 q8 -16 12 8" fill="#7ab84a" stroke="#2a5a1e" stroke-width="2"/>
    ${eyes(56, 84, 76, '#ffe8a0')}<path d="M58 90 Q70 96 82 90" stroke="#132a12" stroke-width="2.5" fill="none"/>`, 'foe'),
  spenta: () => svg('0 0 110 140', `<path d="M55 108 Q40 122 52 136 M55 108 Q72 120 62 134 M42 100 Q22 112 30 128" stroke="#4a5a52" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>
    <path d="M55 4 v14" stroke="#1a1210" stroke-width="3"/><rect x="38" y="16" width="34" height="9" rx="3" fill="#2a2420" stroke="#000" stroke-width="1.5"/>
    <path d="M30 28 Q12 60 30 96 L80 96 Q98 62 80 28 Z" fill="#8a9a8a" stroke="#1a241c" stroke-width="2.5"/>
    <path d="M42 28 Q32 62 44 96 M55 28 V96 M68 28 Q78 62 66 96" stroke="#1a241c" stroke-width="1.4" fill="none" opacity=".6"/>
    <path d="M66 40 L78 52 L68 58 L80 70 L64 68 L66 54 Z" fill="#0c1410"/><ellipse cx="48" cy="60" rx="10" ry="13" fill="#0c1410"/><circle cx="48" cy="62" r="4" fill="#b8ffc8"/>
    <rect x="36" y="95" width="38" height="9" rx="3" fill="#2a2420" stroke="#000" stroke-width="1.5"/>`, 'foe'),
  alga: () => svg('0 0 130 130', `<g fill="none" stroke-linecap="round"><path d="M30 126 Q4 90 34 70 Q10 50 28 24" stroke="#1e5a30" stroke-width="11"/><path d="M100 126 Q130 92 98 66 Q122 44 108 18" stroke="#1e5a30" stroke-width="11"/><path d="M52 126 Q30 80 58 56 Q40 34 54 6" stroke="#2e7a40" stroke-width="13"/><path d="M78 126 Q102 86 74 58 Q92 38 80 10" stroke="#3a8a48" stroke-width="13"/></g>
    <path d="M32 104 Q20 56 65 50 Q112 56 98 104 Q66 122 32 104 Z" fill="#245a2c" stroke="#0c2610" stroke-width="2.5"/>
    <path d="M40 100 q10 -20 20 0 q8 -24 18 -2 q8 -18 14 -2" stroke="#7ac86a" stroke-width="3" fill="none"/>${eyes(52, 78, 76, '#eaff9a')}`, 'foe'),
  airone: () => svg('0 0 140 180', `<path d="M66 128 L60 174 L48 176 M78 126 L86 150 L74 156" stroke="#1c7a54" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${glass('M30 108 Q40 70 84 80 Q120 90 132 130 Q96 118 82 132 Q50 138 30 108 Z', '#3ec890', 0.82)}
    ${glass('M58 96 Q86 84 124 118 Q92 108 70 114 Z', '#88f0c0', 0.7)}
    <path d="M46 94 Q16 76 36 52 Q52 36 44 22" stroke="#3ec890" stroke-width="13" fill="none" stroke-linecap="round" opacity=".92"/><path d="M46 94 Q16 76 36 52 Q52 36 44 22" stroke="#d8ffe8" stroke-width="2" fill="none"/>
    ${glass('M32 20 Q42 6 56 18 L50 32 Z', '#5ae0a8', 0.95)}${glass('M36 18 L2 40 L40 28 Z', '#e0d070', 0.95)}<circle cx="44" cy="19" r="3.5" fill="#fff8c0"/>`, 'foe boss'),
  cervo: () => svg('0 0 220 220', `<circle cx="110" cy="96" r="86" fill="#40e890" opacity=".1"/>
    <g stroke="#a8ffd0" stroke-width="5" fill="none" stroke-linecap="round"><path d="M92 62 Q70 48 66 22 L52 6 M66 22 L82 4 M74 44 L44 34 L30 14 M44 34 L22 40"/><path d="M128 62 Q150 48 154 22 L168 6 M154 22 L138 4 M146 44 L176 34 L190 14 M176 34 L198 40"/></g>
    ${glass('M66 150 L54 214 L70 214 L88 160 Z', '#237a50')}${glass('M154 150 L166 214 L150 214 L132 160 Z', '#237a50')}
    ${glass('M58 122 Q70 98 110 100 Q150 98 162 122 L150 166 Q110 190 70 166 Z', '#2cae6c', 0.86)}
    ${glass('M88 168 L84 216 L100 216 L104 172 Z', '#2f9a64')}${glass('M132 168 L136 216 L120 216 L116 172 Z', '#2f9a64')}
    ${glass('M92 110 L88 66 L110 54 L132 66 L128 110 L110 132 Z', '#52dc98', 0.9)}
    ${glass('M90 68 L66 60 L88 82 Z', '#7cf0b4')}${glass('M130 68 L154 60 L132 82 Z', '#7cf0b4')}
    <path d="M96 82 L104 86 M124 82 L116 86" stroke="#fbffd0" stroke-width="5" stroke-linecap="round"/><path d="M102 118 L110 124 L118 118" stroke="#0c3a22" stroke-width="3" fill="none"/>
    <path d="M110 54 L104 84 L116 100 L108 128 M80 130 L100 150 L92 168" stroke="#e8fff2" stroke-width="1.2" fill="none" class="crack"/>`, 'foe boss'),
};

export const foeSVG = (type) => (FOES[type] || FOES.cocci)();
export const SPRITE_SCALE = { cocci: 0.85, granchio: 1, spenta: 0.82, alga: 0.95, airone: 1.35, cervo: 1.7 };
