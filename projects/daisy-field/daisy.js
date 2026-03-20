/* ============================================================
   Daisy Field — daisy.js
   SVG daisy factory with spatial grid collision awareness.
   
   Each daisy is an inline SVG with:
     • 8 radial ellipse petals (white/cream, occasional pink/yellow)
     • Yellow center with radial gradient
     • Green stem + small leaf
     • Random size/rotation/sway variation
   ============================================================ */

/* ---- Spatial grid for collision-aware placement ---- */
const _grid = {
  cells: new Map(),
  cellSize: 50,                         // px per grid cell

  /** Return the cell key for a point */
  key(x, y) {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  },

  /** Register a placed daisy's center */
  add(x, y, r) {
    const k = this.key(x, y);
    if (!this.cells.has(k)) this.cells.set(k, []);
    this.cells.get(k).push({ x, y, r });
  },

  /**
   * Check whether (x, y) with radius r overlaps any existing daisy
   * by more than 60 % of the smaller radius (allows partial overlap
   * for density, prevents exact stacking).
   */
  overlaps(x, y, r) {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const entries = this.cells.get(`${cx + dx},${cy + dy}`);
        if (!entries) continue;
        for (const e of entries) {
          const dist = Math.hypot(e.x - x, e.y - y);
          const minR = Math.min(r, e.r);
          if (dist < minR * 0.6) return true;
        }
      }
    }
    return false;
  },

  /** Reset grid for a new session */
  clear() { this.cells.clear(); }
};

/* ---- Color variants ---- */
const PETAL_COLORS = {
  white:  { petal: '#FFFDE7', tint: '#F8E0E0' },
  pink:   { petal: '#F48FB1', tint: '#F06292' },
  yellow: { petal: '#FFF176', tint: '#FDD835' }
};

/**
 * Pick a random petal colour:
 * 80 % white, 10 % pink, 10 % yellow.
 */
function _pickColor() {
  const r = Math.random();
  if (r < 0.10) return PETAL_COLORS.pink;
  if (r < 0.20) return PETAL_COLORS.yellow;
  return PETAL_COLORS.white;
}

/* ---- Flower type configuration ---- */
let _selectedFlower = 'daisy';
let _customText = '';

function setCustomText(text) { _customText = text; }
function getCustomText() { return _customText; }

const FLOWER_COLORS = {
  rose: [
    { outer: '#E53935', mid: '#D32F2F', inner: '#C62828', deep: '#B71C1C' },
    { outer: '#EC407A', mid: '#E91E63', inner: '#C2185B', deep: '#880E4F' },
    { outer: '#FF5252', mid: '#FF1744', inner: '#D50000', deep: '#B71C1C' },
  ],
  sunflower: { petal: '#FFD54F', tint: '#FFB300', center1: '#795548', center2: '#4E342E' },
  tulip: [
    { outer: '#E53935', inner: '#EF5350', highlight: '#FFCDD2' },
    { outer: '#AB47BC', inner: '#CE93D8', highlight: '#F3E5F5' },
    { outer: '#FF7043', inner: '#FFAB91', highlight: '#FBE9E7' },
    { outer: '#EC407A', inner: '#F48FB1', highlight: '#FCE4EC' },
  ],
  cherry: { petal: '#F8BBD0', tint: '#F48FB1', center: '#FFEE58', stamen: '#E91E63' },
  rosette: [
    { outer: '#FF6F00', mid: '#E65100', inner: '#BF360C', center: '#FFCC80' },
    { outer: '#D50000', mid: '#B71C1C', inner: '#880E4F', center: '#FFCDD2' },
    { outer: '#FF6D00', mid: '#E65100', inner: '#DD2C00', center: '#FFE0B2' },
  ],
  hyacinth: [
    { outer: '#7E57C2', mid: '#5E35B1', inner: '#4527A0', tip: '#D1C4E9' },
    { outer: '#5C6BC0', mid: '#3949AB', inner: '#283593', tip: '#C5CAE9' },
    { outer: '#AB47BC', mid: '#8E24AA', inner: '#6A1B9A', tip: '#E1BEE7' },
  ],
  hibiscus: [
    { outer: '#E53935', inner: '#FFCDD2', stamen: '#FFEE58', pistil: '#F44336' },
    { outer: '#EC407A', inner: '#FCE4EC', stamen: '#FFF176', pistil: '#E91E63' },
    { outer: '#FF7043', inner: '#FBE9E7', stamen: '#FFF9C4', pistil: '#FF5722' },
  ],
  mushroom: [
    { cap: '#E53935', dots: '#FFFFFF', stem: '#FFF8E1', base: '#D7CCC8' },
    { cap: '#8D6E63', dots: '#EFEBE9', stem: '#FFF8E1', base: '#BCAAA4' },
    { cap: '#FF8F00', dots: '#FFF8E1', stem: '#FFFDE7', base: '#D7CCC8' },
  ],
};

function setFlowerType(type) { _selectedFlower = type; }
function getFlowerType() { return _selectedFlower; }

/* ---- Unique IDs for SVG gradients ---- */
let _gradId = 0;

/* ============================================================
   createDaisy(options)
   Returns an absolutely-positioned <div class="daisy"> wrapping
   an inline SVG.

   options:
     x, y        — CSS left / top in px (required)
     size        — base scale multiplier, default 1
     rotation    — base rotation in deg, default random
     color       — { petal, tint } or auto-picked
   ============================================================ */
function createDaisy(options = {}) {
  const size     = options.size     ?? (0.8 + Math.random() * 0.4);   // ±20 %
  const rotation = options.rotation ?? (Math.random() * 30 - 15);     // ±15 deg
  const color    = options.color    ?? _pickColor();
  const x        = options.x ?? 0;
  const y        = options.y ?? 0;

  const id = `dg${_gradId++}`;

  /* SVG viewBox is 70×84 — petals centred at (30, 32), stem below, with padding */
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2 70 84" width="70" height="84">
  <defs>
    <radialGradient id="${id}">
      <stop offset="0%"   stop-color="#FDD835"/>
      <stop offset="100%" stop-color="#F9A825"/>
    </radialGradient>
  </defs>

  <!-- Stem -->
  <line x1="30" y1="44" x2="30" y2="74" stroke="#388E3C" stroke-width="3" stroke-linecap="round"/>
  <!-- Leaf -->
  <ellipse cx="38" cy="60" rx="7" ry="3.5" fill="#43A047" transform="rotate(-25 38 60)"/>

  <!-- 8 petals arranged radially -->
  ${Array.from({ length: 8 }, (_, i) => {
    const angle = i * 45;
    return `<ellipse cx="30" cy="14" rx="7" ry="15"
      fill="${color.petal}" stroke="${color.tint}" stroke-width="0.5"
      transform="rotate(${angle} 30 32)"/>`;
  }).join('\n  ')}

  <!-- Center -->
  <circle cx="30" cy="32" r="8" fill="url(#${id})"/>
</svg>`;

  /* Wrapper element */
  const el = document.createElement('div');
  el.className = 'daisy';
  el.innerHTML = svg;
  el.setAttribute('aria-hidden', 'true');

  /* Position & variation */
  const pxSize = 60 * size;
  el.style.left   = `${x - pxSize / 2}px`;
  el.style.top    = `${y - pxSize * 1.1}px`;   // anchor at stem base
  el.style.width  = `${pxSize}px`;
  el.style.height = `${pxSize * (84 / 70)}px`;

  el.style.setProperty('--base-rot', `${rotation}deg`);
  el.style.setProperty('--sway-dur', `${3 + Math.random() * 3}s`);
  el.style.setProperty('--sway-delay', `${-Math.random() * 4}s`);

  /* Scale the inner SVG to fill wrapper */
  const svgEl = el.querySelector('svg');
  svgEl.style.width  = '100%';
  svgEl.style.height = '100%';

  return { el, cx: x, cy: y, r: pxSize / 2 };
}

/* ---- Common flower wrapper ---- */
function _wrapFlower(svgContent, options) {
  const size     = options.size     ?? (0.8 + Math.random() * 0.4);
  const rotation = options.rotation ?? (Math.random() * 30 - 15);
  const x        = options.x ?? 0;
  const y        = options.y ?? 0;

  const el = document.createElement('div');
  el.className = 'daisy';
  el.innerHTML = svgContent;
  el.setAttribute('aria-hidden', 'true');

  const pxSize = 60 * size;
  el.style.left   = `${x - pxSize / 2}px`;
  el.style.top    = `${y - pxSize * 1.1}px`;
  el.style.width  = `${pxSize}px`;
  el.style.height = `${pxSize * (84 / 70)}px`;

  el.style.setProperty('--base-rot', `${rotation}deg`);
  el.style.setProperty('--sway-dur', `${3 + Math.random() * 3}s`);
  el.style.setProperty('--sway-delay', `${-Math.random() * 4}s`);

  const svgEl = el.querySelector('svg');
  svgEl.style.width  = '100%';
  svgEl.style.height = '100%';

  return { el, cx: x, cy: y, r: pxSize / 2 };
}

/* ---- Rose ---- */
function _createRose(options = {}) {
  const cols = FLOWER_COLORS.rose;
  const col = cols[Math.floor(Math.random() * cols.length)];
  const id = `dg${_gradId++}`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2 70 84" width="70" height="84">
  <defs>
    <radialGradient id="${id}">
      <stop offset="0%" stop-color="${col.deep}"/>
      <stop offset="100%" stop-color="${col.outer}"/>
    </radialGradient>
  </defs>
  <line x1="30" y1="46" x2="30" y2="74" stroke="#388E3C" stroke-width="3" stroke-linecap="round"/>
  <line x1="30" y1="55" x2="35" y2="51" stroke="#2E7D32" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="30" y1="63" x2="25" y2="59" stroke="#2E7D32" stroke-width="1.5" stroke-linecap="round"/>
  <ellipse cx="38" cy="62" rx="7" ry="3.5" fill="#43A047" transform="rotate(-25 38 62)"/>
  ${Array.from({ length: 6 }, (_, i) => `<ellipse cx="30" cy="20" rx="9" ry="14" fill="${col.outer}" opacity="0.85" transform="rotate(${i * 60} 30 32)"/>`).join('\n  ')}
  ${Array.from({ length: 6 }, (_, i) => `<ellipse cx="30" cy="23" rx="7" ry="11" fill="${col.mid}" opacity="0.9" transform="rotate(${i * 60 + 30} 30 32)"/>`).join('\n  ')}
  ${Array.from({ length: 4 }, (_, i) => `<ellipse cx="30" cy="26" rx="5" ry="8" fill="${col.inner}" transform="rotate(${i * 90 + 15} 30 32)"/>`).join('\n  ')}
  <circle cx="30" cy="32" r="4" fill="url(#${id})"/>
</svg>`;

  return _wrapFlower(svg, options);
}

/* ---- Sunflower ---- */
function _createSunflower(options = {}) {
  const col = FLOWER_COLORS.sunflower;
  const id = `dg${_gradId++}`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2 70 84" width="70" height="84">
  <defs>
    <radialGradient id="${id}">
      <stop offset="0%" stop-color="${col.center2}"/>
      <stop offset="100%" stop-color="${col.center1}"/>
    </radialGradient>
  </defs>
  <line x1="30" y1="44" x2="30" y2="74" stroke="#33691E" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="40" cy="58" rx="10" ry="5" fill="#558B2F" transform="rotate(-30 40 58)"/>
  <ellipse cx="20" cy="66" rx="9" ry="4.5" fill="#558B2F" transform="rotate(25 20 66)"/>
  ${Array.from({ length: 18 }, (_, i) => `<ellipse cx="30" cy="14" rx="4.5" ry="14" fill="${col.petal}" stroke="${col.tint}" stroke-width="0.5" transform="rotate(${i * 20} 30 32)"/>`).join('\n  ')}
  <circle cx="30" cy="32" r="11" fill="url(#${id})"/>
  ${Array.from({ length: 8 }, (_, i) => { const a = i * 45 * Math.PI / 180; return `<circle cx="${(30 + Math.cos(a) * 5).toFixed(1)}" cy="${(32 + Math.sin(a) * 5).toFixed(1)}" r="1" fill="#3E2723" opacity="0.4"/>`; }).join('\n  ')}
</svg>`;

  return _wrapFlower(svg, options);
}

/* ---- Tulip ---- */
function _createTulip(options = {}) {
  const cols = FLOWER_COLORS.tulip;
  const col = cols[Math.floor(Math.random() * cols.length)];
  const id = `dg${_gradId++}`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2 70 84" width="70" height="84">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${col.inner}"/>
      <stop offset="100%" stop-color="${col.outer}"/>
    </linearGradient>
  </defs>
  <line x1="30" y1="42" x2="30" y2="74" stroke="#388E3C" stroke-width="3" stroke-linecap="round"/>
  <path d="M30,60 Q18,50 22,40" stroke="#43A047" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="22" cy="28" rx="10" ry="18" fill="url(#${id})" transform="rotate(-8 22 28)"/>
  <ellipse cx="38" cy="28" rx="10" ry="18" fill="url(#${id})" transform="rotate(8 38 28)"/>
  <ellipse cx="30" cy="26" rx="9" ry="20" fill="${col.inner}"/>
  <ellipse cx="30" cy="28" rx="5" ry="12" fill="${col.highlight}" opacity="0.35"/>
</svg>`;

  return _wrapFlower(svg, options);
}

/* ---- Cherry Blossom ---- */
function _createCherry(options = {}) {
  const col = FLOWER_COLORS.cherry;
  const variants = [
    { petal: '#F8BBD0', tint: '#F48FB1' },
    { petal: '#FCE4EC', tint: '#F8BBD0' },
    { petal: '#F48FB1', tint: '#EC407A' },
  ];
  const pc = variants[Math.floor(Math.random() * variants.length)];

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2 70 84" width="70" height="84">
  <path d="M30,44 Q28,55 30,74" stroke="#795548" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M29,54 Q22,50 18,52" stroke="#795548" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  ${Array.from({ length: 5 }, (_, i) => { const angle = i * 72 - 90; const rad = angle * Math.PI / 180; const px = (30 + Math.cos(rad) * 12).toFixed(1); const py = (30 + Math.sin(rad) * 12).toFixed(1); return `<ellipse cx="${px}" cy="${py}" rx="8" ry="10" fill="${pc.petal}" stroke="${pc.tint}" stroke-width="0.5" transform="rotate(${angle} ${px} ${py})"/>`; }).join('\n  ')}
  <circle cx="30" cy="30" r="4" fill="${col.center}"/>
  ${Array.from({ length: 5 }, (_, i) => { const a = (i * 72 + 36) * Math.PI / 180; const ex = (30 + Math.cos(a) * 6.5).toFixed(1); const ey = (30 + Math.sin(a) * 6.5).toFixed(1); return `<line x1="30" y1="30" x2="${ex}" y2="${ey}" stroke="${col.stamen}" stroke-width="0.8" opacity="0.7"/><circle cx="${ex}" cy="${ey}" r="1.2" fill="${col.stamen}" opacity="0.8"/>`; }).join('\n  ')}
</svg>`;

  return _wrapFlower(svg, options);
}

/* ---- Rosette ---- */
function _createRosette(options = {}) {
  const cols = FLOWER_COLORS.rosette;
  const col = cols[Math.floor(Math.random() * cols.length)];
  const id = `dg${_gradId++}`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2 70 84" width="70" height="84">
  <defs>
    <radialGradient id="${id}">
      <stop offset="0%" stop-color="${col.center}"/>
      <stop offset="100%" stop-color="${col.mid}"/>
    </radialGradient>
  </defs>
  <line x1="30" y1="46" x2="30" y2="74" stroke="#388E3C" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="38" cy="60" rx="7" ry="3.5" fill="#43A047" transform="rotate(-25 38 60)"/>
  ${Array.from({ length: 10 }, (_, i) => `<ellipse cx="30" cy="18" rx="8" ry="12" fill="${col.outer}" opacity="0.9" transform="rotate(${i * 36} 30 32)"/>`).join('\n  ')}
  ${Array.from({ length: 10 }, (_, i) => `<ellipse cx="30" cy="22" rx="6" ry="9" fill="${col.mid}" opacity="0.85" transform="rotate(${i * 36 + 18} 30 32)"/>`).join('\n  ')}
  ${Array.from({ length: 5 }, (_, i) => `<ellipse cx="30" cy="26" rx="4" ry="6" fill="${col.inner}" transform="rotate(${i * 72 + 10} 30 32)"/>`).join('\n  ')}
  <circle cx="30" cy="32" r="5" fill="url(#${id})"/>
</svg>`;

  return _wrapFlower(svg, options);
}

/* ---- Hyacinth ---- */
function _createHyacinth(options = {}) {
  const cols = FLOWER_COLORS.hyacinth;
  const col = cols[Math.floor(Math.random() * cols.length)];

  const florets = [];
  for (let row = 0; row < 5; row++) {
    const cy = 12 + row * 7;
    const count = row < 2 ? 3 : 4;
    const offset = row % 2 === 0 ? 0 : 3;
    for (let j = 0; j < count; j++) {
      const cx = 22 + offset + j * 5;
      const c = Math.random() < 0.3 ? col.tip : (Math.random() < 0.5 ? col.outer : col.mid);
      florets.push(`<circle cx="${cx}" cy="${cy}" r="3.5" fill="${c}" opacity="0.9"/>`);
      florets.push(`<circle cx="${cx}" cy="${cy}" r="1.5" fill="${col.inner}" opacity="0.4"/>`);
    }
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2 70 84" width="70" height="84">
  <line x1="30" y1="44" x2="30" y2="74" stroke="#388E3C" stroke-width="3" stroke-linecap="round"/>
  <path d="M30,58 Q20,52 16,56" stroke="#43A047" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="16" cy="56" rx="6" ry="3" fill="#43A047" transform="rotate(-15 16 56)"/>
  ${florets.join('\n  ')}
</svg>`;

  return _wrapFlower(svg, options);
}

/* ---- Hibiscus ---- */
function _createHibiscus(options = {}) {
  const cols = FLOWER_COLORS.hibiscus;
  const col = cols[Math.floor(Math.random() * cols.length)];
  const id = `dg${_gradId++}`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2 70 84" width="70" height="84">
  <defs>
    <radialGradient id="${id}">
      <stop offset="0%" stop-color="${col.inner}"/>
      <stop offset="100%" stop-color="${col.outer}"/>
    </radialGradient>
  </defs>
  <line x1="30" y1="46" x2="30" y2="74" stroke="#388E3C" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="22" cy="58" rx="7" ry="4" fill="#43A047" transform="rotate(-30 22 58)"/>
  ${Array.from({ length: 5 }, (_, i) => {
    const a = i * 72 - 90;
    const rad = a * Math.PI / 180;
    const px = (30 + Math.cos(rad) * 11).toFixed(1);
    const py = (30 + Math.sin(rad) * 11).toFixed(1);
    return `<ellipse cx="${px}" cy="${py}" rx="10" ry="13" fill="url(#${id})" transform="rotate(${a} ${px} ${py})"/>`;
  }).join('\n  ')}
  ${Array.from({ length: 5 }, (_, i) => {
    const a = i * 72 - 90;
    const rad = a * Math.PI / 180;
    const px = (30 + Math.cos(rad) * 7).toFixed(1);
    const py = (30 + Math.sin(rad) * 7).toFixed(1);
    return `<line x1="30" y1="30" x2="${px}" y2="${py}" stroke="${col.inner}" stroke-width="1" opacity="0.4"/>`;
  }).join('\n  ')}
  <line x1="30" y1="30" x2="30" y2="16" stroke="${col.pistil}" stroke-width="2" stroke-linecap="round"/>
  ${Array.from({ length: 4 }, (_, i) => {
    const a = (i * 90 + 45) * Math.PI / 180;
    const ex = (30 + Math.cos(a) * 4).toFixed(1);
    const ey = (16 + Math.sin(a) * 2).toFixed(1);
    return `<circle cx="${ex}" cy="${ey}" r="1.5" fill="${col.stamen}"/>`;
  }).join('\n  ')}
  <circle cx="30" cy="14" r="2" fill="${col.pistil}"/>
</svg>`;

  return _wrapFlower(svg, options);
}

/* ---- Mushroom ---- */
function _createMushroom(options = {}) {
  const cols = FLOWER_COLORS.mushroom;
  const col = cols[Math.floor(Math.random() * cols.length)];
  const id = `dg${_gradId++}`;

  const dots = [];
  const dotPositions = [
    [30, 22], [22, 28], [38, 28], [26, 18], [34, 18], [30, 32], [20, 34], [40, 34]
  ];
  for (const [dx, dy] of dotPositions) {
    if (Math.random() < 0.6) {
      dots.push(`<circle cx="${dx + (Math.random() * 2 - 1).toFixed(1)}" cy="${dy + (Math.random() * 2 - 1).toFixed(1)}" r="${(1.5 + Math.random() * 1.5).toFixed(1)}" fill="${col.dots}" opacity="0.85"/>`);
    }
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -2 70 84" width="70" height="84">
  <defs>
    <radialGradient id="${id}" cx="0.5" cy="0.3">
      <stop offset="0%" stop-color="${col.cap}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${col.cap}"/>
    </radialGradient>
  </defs>
  <!-- Stem -->
  <path d="M25,40 Q24,55 22,68 L38,68 Q36,55 35,40 Z" fill="${col.stem}" stroke="${col.base}" stroke-width="0.5"/>
  <!-- Stem ring -->
  <ellipse cx="30" cy="52" rx="8" ry="2.5" fill="${col.stem}" stroke="${col.base}" stroke-width="0.5"/>
  <!-- Cap -->
  <ellipse cx="30" cy="40" rx="22" ry="5" fill="${col.base}"/>
  <path d="M8,40 Q8,12 30,10 Q52,12 52,40 Z" fill="url(#${id})"/>
  <!-- Dots -->
  ${dots.join('\n  ')}
  <!-- Ground tuft -->
  <ellipse cx="22" cy="70" rx="4" ry="2" fill="#66BB6A" opacity="0.6"/>
  <ellipse cx="38" cy="70" rx="3" ry="1.5" fill="#81C784" opacity="0.5"/>
</svg>`;

  return _wrapFlower(svg, options);
}

/* ---- Custom text renderer ---- */
function _createCustomText(options = {}) {
  const size     = options.size     ?? (0.8 + Math.random() * 0.4);
  const rotation = options.rotation ?? (Math.random() * 30 - 15);
  const x        = options.x ?? 0;
  const y        = options.y ?? 0;
  const text     = _customText || '✨';

  const el = document.createElement('div');
  el.className = 'daisy custom-text-item';
  el.setAttribute('aria-hidden', 'true');

  const span = document.createElement('span');
  span.className = 'custom-text-content';
  span.textContent = text;
  el.appendChild(span);

  const pxSize = 60 * size;
  const fontSize = Math.max(14, pxSize * 0.4);
  el.style.left   = `${x - pxSize / 2}px`;
  el.style.top    = `${y - pxSize / 2}px`;
  el.style.width  = `${pxSize}px`;
  el.style.height = `${pxSize}px`;
  el.style.fontSize = `${fontSize}px`;

  el.style.setProperty('--base-rot', `${rotation}deg`);
  el.style.setProperty('--sway-dur', `${3 + Math.random() * 3}s`);
  el.style.setProperty('--sway-delay', `${-Math.random() * 4}s`);

  /* Random warm hue */
  const hues = [0, 30, 60, 120, 200, 280, 330];
  const hue = hues[Math.floor(Math.random() * hues.length)];
  span.style.color = `hsl(${hue}, 70%, 35%)`;
  span.style.textShadow = `0 1px 3px rgba(0,0,0,.15)`;

  return { el, cx: x, cy: y, r: pxSize / 2 };
}

/* ---- Flower type dispatcher ---- */
function createFlower(options = {}) {
  switch (_selectedFlower) {
    case 'rose':      return _createRose(options);
    case 'sunflower': return _createSunflower(options);
    case 'tulip':     return _createTulip(options);
    case 'cherry':    return _createCherry(options);
    case 'rosette':   return _createRosette(options);
    case 'hyacinth':  return _createHyacinth(options);
    case 'hibiscus':  return _createHibiscus(options);
    case 'mushroom':  return _createMushroom(options);
    case 'custom':    return _createCustomText(options);
    default:          return createDaisy(options);
  }
}

/* ---- Bouquet helpers ---- */
function _pickBouquetColor() {
  switch (_selectedFlower) {
    case 'rose':
      return FLOWER_COLORS.rose[Math.floor(Math.random() * FLOWER_COLORS.rose.length)];
    case 'sunflower':
      return FLOWER_COLORS.sunflower;
    case 'tulip':
      return FLOWER_COLORS.tulip[Math.floor(Math.random() * FLOWER_COLORS.tulip.length)];
    case 'cherry':
      return FLOWER_COLORS.cherry;
    case 'rosette':
      return FLOWER_COLORS.rosette[Math.floor(Math.random() * FLOWER_COLORS.rosette.length)];
    case 'hyacinth':
      return FLOWER_COLORS.hyacinth[Math.floor(Math.random() * FLOWER_COLORS.hyacinth.length)];
    case 'hibiscus':
      return FLOWER_COLORS.hibiscus[Math.floor(Math.random() * FLOWER_COLORS.hibiscus.length)];
    case 'mushroom':
      return FLOWER_COLORS.mushroom[Math.floor(Math.random() * FLOWER_COLORS.mushroom.length)];
    case 'custom':
      return PETAL_COLORS.white;
    default: {
      const r = Math.random();
      if (r < 0.15) return PETAL_COLORS.pink;
      if (r < 0.30) return PETAL_COLORS.yellow;
      return PETAL_COLORS.white;
    }
  }
}

function _renderBouquetHead(col, sz) {
  switch (_selectedFlower) {
    case 'rose': {
      const outer = Array.from({ length: 6 }, (_, j) =>
        `<ellipse cx="0" cy="${-sz*0.4}" rx="${sz*0.28}" ry="${sz*0.45}" fill="${col.outer}" opacity="0.85" transform="rotate(${j * 60})"/>`
      ).join('');
      const inner = Array.from({ length: 4 }, (_, j) =>
        `<ellipse cx="0" cy="${-sz*0.25}" rx="${sz*0.2}" ry="${sz*0.35}" fill="${col.mid}" opacity="0.9" transform="rotate(${j * 90 + 30})"/>`
      ).join('');
      return `${outer}${inner}<circle r="${sz*0.15}" fill="${col.deep}"/>`;
    }
    case 'sunflower': {
      const petals = Array.from({ length: 16 }, (_, j) =>
        `<ellipse cx="0" cy="${-sz*0.6}" rx="${sz*0.15}" ry="${sz*0.5}" fill="${col.petal}" stroke="${col.tint}" stroke-width="0.3" transform="rotate(${j * 22.5})"/>`
      ).join('');
      return `${petals}<circle r="${sz*0.35}" fill="${col.center1}"/>`;
    }
    case 'tulip':
      return `<ellipse cx="${-sz*0.2}" cy="${-sz*0.25}" rx="${sz*0.3}" ry="${sz*0.55}" fill="${col.outer}" transform="rotate(-8)"/>
        <ellipse cx="${sz*0.2}" cy="${-sz*0.25}" rx="${sz*0.3}" ry="${sz*0.55}" fill="${col.outer}" transform="rotate(8)"/>
        <ellipse cx="0" cy="${-sz*0.3}" rx="${sz*0.25}" ry="${sz*0.6}" fill="${col.inner}"/>`;
    case 'cherry': {
      const petals = Array.from({ length: 5 }, (_, j) => {
        const a = j * 72 - 90;
        const rad = a * Math.PI / 180;
        const px = Math.cos(rad) * sz * 0.35;
        const py = Math.sin(rad) * sz * 0.35;
        return `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${sz*0.25}" ry="${sz*0.28}" fill="${col.petal}" stroke="${col.tint}" stroke-width="0.3"/>`;
      }).join('');
      return `${petals}<circle r="${sz*0.12}" fill="${col.center}"/>`;
    }
    case 'rosette': {
      const outer = Array.from({ length: 10 }, (_, j) =>
        `<ellipse cx="0" cy="${-sz*0.5}" rx="${sz*0.25}" ry="${sz*0.4}" fill="${col.outer}" opacity="0.9" transform="rotate(${j * 36})"/>`
      ).join('');
      const inner = Array.from({ length: 5 }, (_, j) =>
        `<ellipse cx="0" cy="${-sz*0.3}" rx="${sz*0.18}" ry="${sz*0.3}" fill="${col.mid}" opacity="0.85" transform="rotate(${j * 72 + 18})"/>`
      ).join('');
      return `${outer}${inner}<circle r="${sz*0.18}" fill="${col.center}"/>`;
    }
    case 'hyacinth': {
      const florets = [];
      for (let row = 0; row < 3; row++) {
        const count = 3;
        for (let j = 0; j < count; j++) {
          const cx = (j - 1) * sz * 0.2;
          const cy = -(sz * 0.3) + row * sz * 0.25;
          const c = Math.random() < 0.4 ? col.tip : col.outer;
          florets.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${sz*0.12}" fill="${c}" opacity="0.9"/>`);
        }
      }
      return florets.join('');
    }
    case 'hibiscus': {
      const petals = Array.from({ length: 5 }, (_, j) => {
        const a = j * 72 - 90;
        const rad = a * Math.PI / 180;
        const px = Math.cos(rad) * sz * 0.3;
        const py = Math.sin(rad) * sz * 0.3;
        return `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${sz*0.3}" ry="${sz*0.35}" fill="${col.outer}" opacity="0.85"/>`;
      }).join('');
      return `${petals}<circle r="${sz*0.1}" fill="${col.stamen}"/>`;
    }
    case 'mushroom': {
      const capW = sz * 0.8, capH = sz * 0.5;
      return `<ellipse rx="${(sz*0.2).toFixed(1)}" ry="${(sz*0.5).toFixed(1)}" fill="${col.stem}"/>
        <ellipse cy="${(-sz*0.25).toFixed(1)}" rx="${capW.toFixed(1)}" ry="${capH.toFixed(1)}" fill="${col.cap}"/>
        <circle cx="${(-sz*0.15).toFixed(1)}" cy="${(-sz*0.3).toFixed(1)}" r="${(sz*0.08).toFixed(1)}" fill="${col.dots}" opacity="0.8"/>
        <circle cx="${(sz*0.2).toFixed(1)}" cy="${(-sz*0.35).toFixed(1)}" r="${(sz*0.06).toFixed(1)}" fill="${col.dots}" opacity="0.8"/>`;
    }
    case 'custom':
      return `<text text-anchor="middle" dy=".35em" font-size="${sz*0.7}" font-family="Nunito,sans-serif" font-weight="800" fill="${col.petal}">✏️</text>`;
    default: {
      const petals = Array.from({ length: 8 }, (_, j) =>
        `<ellipse cx="0" cy="${-sz * 0.65}" rx="${sz * 0.3}" ry="${sz * 0.55}" fill="${col.petal}" stroke="${col.tint}" stroke-width="0.5" transform="rotate(${j * 45})"/>`
      ).join('');
      return `${petals}<circle r="${sz * 0.3}" fill="#FDD835"/>`;
    }
  }
}

/**
 * spawnDaisy(container)
 * Creates a daisy at a random non-overlapping position inside `container`,
 * injects it into the DOM, and plays a GSAP bloom animation.
 * Returns null if no suitable position could be found after a few retries.
 */
function spawnDaisy(container) {
  const W = container.clientWidth;
  const H = container.clientHeight;
  const size = 0.8 + Math.random() * 0.4;
  const r = (60 * size) / 2;

  /* Try up to 8 random positions to avoid heavy overlap */
  let x, y, tries = 0;
  do {
    x = r + Math.random() * (W - 2 * r);
    y = r + Math.random() * (H - 2 * r);
    tries++;
  } while (_grid.overlaps(x, y, r) && tries < 8);

  _grid.add(x, y, r);

  const daisy = createFlower({ x, y, size });
  container.appendChild(daisy.el);

  /* Bloom animation via GSAP */
  if (typeof gsap !== 'undefined') {
    gsap.from(daisy.el, {
      scale: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
      onComplete() { daisy.el.classList.add('sway'); }
    });
  } else {
    daisy.el.classList.add('sway');
  }

  return daisy.el;
}

/**
 * createBouquet()
 * Returns a self-contained SVG element depicting a gathered bouquet
 * of ~8 daisies with leaves and a pink ribbon.
 */
function createBouquet() {
  const W = 240, H = 320;
  const stems = [];
  const flowers = [];

  /* Place ~8 daisy heads in a fan arrangement */
  const count = 8;
  for (let i = 0; i < count; i++) {
    const angle = -35 + (70 / (count - 1)) * i;      // fan span
    const rad   = (angle * Math.PI) / 180;
    const dist  = 80 + Math.random() * 30;
    const fx    = W / 2 + Math.sin(rad) * dist;
    const fy    = H / 2 - 50 - Math.cos(rad) * dist + Math.random() * 20;
    const col   = _pickBouquetColor();
    const sz    = 18 + Math.random() * 6;
    const rot   = angle + (Math.random() * 10 - 5);

    stems.push(`<line x1="${W / 2}" y1="${H - 60}" x2="${fx}" y2="${fy + sz}"
      stroke="#388E3C" stroke-width="4" stroke-linecap="round"/>`);

    const head = _renderBouquetHead(col, sz);
    flowers.push(`<g transform="translate(${fx},${fy}) rotate(${rot})">${head}</g>`);
  }

  /* A few leaves along the stems */
  const leaves = [
    `<ellipse cx="${W / 2 - 18}" cy="${H - 110}" rx="14" ry="6" fill="#43A047" transform="rotate(-30 ${W / 2 - 18} ${H - 110})"/>`,
    `<ellipse cx="${W / 2 + 20}" cy="${H - 130}" rx="14" ry="6" fill="#66BB6A" transform="rotate(25 ${W / 2 + 20} ${H - 130})"/>`,
    `<ellipse cx="${W / 2 - 10}" cy="${H - 160}" rx="12" ry="5" fill="#43A047" transform="rotate(-20 ${W / 2 - 10} ${H - 160})"/>`
  ];

  /* Ribbon */
  const ribbon = `
    <path d="M${W / 2 - 20},${H - 65} Q${W / 2},${H - 45} ${W / 2 + 20},${H - 65}
             L${W / 2 + 24},${H - 50} Q${W / 2},${H - 30} ${W / 2 - 24},${H - 50} Z"
          fill="#FF80AB"/>
    <path d="M${W / 2 - 8},${H - 48} Q${W / 2 - 18},${H - 20} ${W / 2 - 28},${H - 10}" 
          stroke="#FF80AB" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M${W / 2 + 8},${H - 48} Q${W / 2 + 18},${H - 20} ${W / 2 + 28},${H - 10}" 
          stroke="#FF80AB" stroke-width="5" fill="none" stroke-linecap="round"/>`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('aria-label', 'A bouquet of daisies');
  svg.innerHTML = `
    ${stems.join('\n')}
    ${leaves.join('\n')}
    ${ribbon}
    ${flowers.join('\n')}`;

  return svg;
}

/**
 * clearMeadow()
 * Reset the spatial grid so the next session starts fresh.
 */
function clearMeadow() {
  _grid.clear();
  _gradId = 0;
}

/* ---- Public API ---- */
window.DaisyFactory = { createDaisy, createFlower, spawnDaisy, createBouquet, clearMeadow, setFlowerType, getFlowerType, setCustomText, getCustomText };
