/* ============================================================
   Seba — the places, painted in SVG
   ------------------------------------------------------------
   400×700, anchored at the bottom: the floor line sits near
   y=560, where Seba stands.
   ============================================================ */
import { cityById } from './cities.js';

const wrap = (inner, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>${defs}</defs>${inner}</svg>`;
const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const rect = (x, y, w, h, f, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${extra}/>`;
const circle = (x, y, r, f, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${extra}/>`;
const path = (d, f, extra = '') => `<path d="${d}" fill="${f}" ${extra}/>`;
const range = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join('');
const rnd = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

function floor(color, line, y = 540) {
  return rect(0, y, 400, 700 - y, color) + range(9, (i) => `<path d="M${200 + (i - 4) * 46} ${y}L${200 + (i - 4) * 150} 700" stroke="${line}" stroke-width="2"/>`) +
    range(3, (i) => rect(0, y + 22 + i * i * 22, 400, 2, line));
}

function neon(x, y, text, color, size = 30) {
  const t = (extra) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="${size}" ${extra}>${text}</text>`;
  return t(`fill="none" stroke="${color}" stroke-width="9" opacity=".22"`) + t(`fill="#fff" stroke="${color}" stroke-width="1.5"`);
}

function bottle(x, y, h, color) {
  return rect(x, y - h, 14, h, color, 'rx="4"') + rect(x + 4, y - h - 10, 6, 12, color) + rect(x + 2, y - h * 0.6, 10, h * 0.28, '#fff', 'opacity=".55" rx="2"') + rect(x + 2, y - h + 4, 2.5, h - 10, '#fff', 'opacity=".35"');
}

export function barScene() {
  const colors = ['#2fd18a', '#e5384f', '#f4c24b', '#4aa3ff', '#b46cff', '#ff8a3d', '#e8f4ff'];
  const r = rnd(7);
  const shelves = [210, 290].map((y) => rect(34, y, 332, 9, '#8a5a34', 'rx="3"') + range(13, (i) => bottle(46 + i * 24.5, y, 28 + r() * 24, colors[Math.floor(r() * colors.length)]))).join('');
  return wrap(
    rect(0, 0, 400, 700, 'url(#w)') + '<g transform="translate(0 56)">' + rect(22, 130, 356, 190, '#1a0f24', 'rx="14"') + shelves +
    neon(200, 112, 'BAR SEBA', '#ff3f81', 34) + '</g>' +
    range(3, (i) => `<path d="M${90 + i * 110} 0V${38}" stroke="#222" stroke-width="3"/>` + path(`M${66 + i * 110} 62Q${90 + i * 110} 22 ${114 + i * 110} 62Z`, '#f4c24b') + circle(90 + i * 110, 66, 46, 'url(#glow)')) +
    rect(0, 396, 400, 24, '#c98a4b') + rect(0, 396, 400, 7, '#eab878') + rect(0, 420, 400, 130, '#6a3d22') +
    range(6, (i) => rect(10 + i * 66, 434, 52, 102, '#7d4a2a', 'rx="6"')) + floor('#2a1a2e', '#3d2844'),
    grad('w', '#3a1d55', '#5a2a52') + '<radialGradient id="glow"><stop offset="0" stop-color="#ffdc8a" stop-opacity=".5"/><stop offset="1" stop-color="#ffdc8a" stop-opacity="0"/></radialGradient>');
}

export function kitchenScene() {
  return wrap(
    rect(0, 0, 400, 700, '#2f6a6a') + range(9, (i) => range(8, (j) => rect(j * 52 - 6, 80 + i * 44, 48, 40, (i + j) % 2 ? '#3d8581' : '#448f8a', 'rx="4"'))) +
    rect(250, 190, 120, 360, '#e8eef0', 'rx="16"') + rect(250, 322, 120, 6, '#b8c4c8') + rect(264, 244, 8, 58, '#9aa8ae', 'rx="4"') + rect(264, 346, 8, 88, '#9aa8ae', 'rx="4"') +
    rect(300, 215, 40, 30, '#ffe14d', 'rx="3" transform="rotate(-6 320 230)"') + circle(335, 285, 13, '#ff3f81') + rect(292, 368, 46, 46, '#fff', 'rx="3" transform="rotate(8 315 390)" stroke="#c0c8cc"') +
    rect(26, 150, 180, 96, '#7a4a2e', 'rx="10"') + rect(34, 158, 78, 80, '#935c3a', 'rx="6"') + rect(120, 158, 78, 80, '#935c3a', 'rx="6"') +
    rect(14, 420, 214, 20, '#d9b48a', 'rx="4"') + rect(24, 440, 194, 110, '#8a5a38') + circle(70, 408, 22, '#30343a') + rect(86, 402, 40, 8, '#30343a', 'rx="4"') +
    path('M150 420q0 -40 24 -40t24 40Z', '#e5384f') + rect(168, 370, 12, 10, '#222') + floor('#c7a27a', '#ab875f'));
}

export function bathScene() {
  return wrap(
    rect(0, 0, 400, 700, '#8fc9e8') + range(13, (i) => range(9, (j) => rect(j * 46 - 4, i * 42, 43, 39, (i * 3 + j) % 5 ? '#a9d9f2' : '#c4e8fb', 'rx="5"'))) +
    rect(250, 150, 110, 150, '#7a4a2e', 'rx="55"') + rect(260, 160, 90, 130, 'url(#m)', 'rx="45"') + path('M275 200l30 -26M278 232l52 -44', 'none', 'stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"') +
    path('M40 120h70q16 0 16 18v10', 'none', 'stroke="#b8c4c8" stroke-width="10" stroke-linecap="round"') + path('M104 148h44l-6 20h-32Z', '#cfd8dc') +
    rect(236, 316, 140, 16, '#fff', 'rx="7"') + rect(262, 282, 20, 34, '#ff62c0', 'rx="6"') + rect(290, 270, 18, 46, '#2fd18a', 'rx="6"') + rect(318, 292, 30, 24, '#ffe14d', 'rx="5"') +
    path('M14 470h372q0 100 -90 100H104q-90 0 -90 -100Z', '#fff') + rect(4, 458, 392, 22, '#eef6fa', 'rx="11"') + circle(70, 590, 12, '#f4c24b') + circle(330, 590, 12, '#f4c24b') + floor('#5a8fb0', '#4b7b98', 596),
    grad('m', '#dff4ff', '#8fb8d8'));
}

export function sofaScene(dark = false) {
  const r = rnd(11);
  return wrap(
    rect(0, 0, 400, 700, dark ? '#0f0c24' : '#6a3f6e') + range(12, (i) => rect(i * 36 + 4, 0, 4, 540, dark ? '#16123a' : '#7a4c7c')) +
    rect(40, 130, 130, 160, '#2a1a10', 'rx="8"') + rect(48, 138, 114, 144, dark ? '#0b1440' : '#7ec6ff') +
    (dark ? circle(120, 180, 20, '#fff3c4') + circle(130, 172, 18, '#0b1440') + range(18, () => circle(52 + r() * 104, 142 + r() * 134, 1 + r(), '#fff')) : circle(122, 182, 22, '#ffe14d') + path('M48 282V240q30 -22 56 0t58 -8v50Z', '#4aa060')) +
    rect(103, 138, 4, 144, '#2a1a10') +
    rect(236, 150, 110, 130, '#f4efe6', 'rx="4"') + neon(291, 210, 'AFTER', '#2fd1ff', 24) + neon(291, 248, '4EVER', '#ff3f81', 22) +
    path('M20 420q0 -40 40 -40h280q40 0 40 40v100H20Z', dark ? '#3a1f48' : '#c8466a') + rect(8, 450, 50, 108, dark ? '#2d1839' : '#a83454', 'rx="22"') + rect(342, 450, 50, 108, dark ? '#2d1839' : '#a83454', 'rx="22"') +
    rect(48, 500, 304, 56, dark ? '#45265a' : '#e05c7e', 'rx="16"') + rect(70, 428, 70, 60, '#ffe14d', `rx="16" transform="rotate(-10 105 458)" opacity="${dark ? 0.45 : 1}"`) +
    floor(dark ? '#17102a' : '#7a5238', dark ? '#221838' : '#634029') + (dark ? rect(0, 0, 400, 700, '#05030f', 'opacity=".38"') : ''));
}

/* ---------------- skylines ---------------- */

function landmark(kind) {
  const r = rnd(kind.length * 977 + 3);
  const dark = '#150f26';
  const windows = (x, y, w, h, c = '#ffd36b') => range(Math.floor((w * h) / 520), () => rect(x + 4 + r() * (w - 10), y + 6 + r() * (h - 14), 4, 6, c, `opacity="${0.35 + r() * 0.6}"`));
  const blocks = (y0, hMin, hMax, color = dark) => { let x = -10, out = ''; while (x < 410) { const w = 34 + r() * 40, h = hMin + r() * (hMax - hMin); out += rect(x, y0 - h, w, h, color) + windows(x, y0 - h, w, h); x += w + 2; } return out; };
  const water = (c) => rect(0, 500, 400, 56, c) + range(22, () => rect(r() * 380, 506 + r() * 44, 14 + r() * 26, 2.5, '#fff', 'opacity=".25"'));
  switch (kind) {
    case 'duomo': return blocks(500, 50, 120, '#2a1c3c') + range(9, (i) => { const h = 120 + (4 - Math.abs(4 - i)) * 34; return path(`M${92 + i * 25} 500V${500 - h}l9 -34l9 34V500Z`, '#e9d6c8') + circle(101 + i * 25, 500 - h - 38, 3, '#f4c24b'); }) + rect(86, 420, 236, 80, '#d8c2b4') + range(5, (i) => path(`M${108 + i * 42} 500v-34q12 -22 24 0v34Z`, '#5a3a52')) + water('#34567a');
    case 'riviera': return `<g stroke="#fff" stroke-width="3" fill="none">${circle(290, 370, 92, 'none')}${range(8, (i) => { const a = (i * Math.PI) / 8; return `<path d="M${290 - Math.cos(a) * 92} ${370 - Math.sin(a) * 92}L${290 + Math.cos(a) * 92} ${370 + Math.sin(a) * 92}"/>`; })}<path d="M290 370L240 500M290 370L340 500"/></g>` + range(10, (i) => { const a = (i / 10) * Math.PI * 2; return circle(290 + Math.cos(a) * 92, 370 + Math.sin(a) * 92, 8, ['#ff3f81', '#ffe14d', '#2fd1ff'][i % 3]); }) + rect(0, 470, 400, 40, '#2a8ab0') + rect(0, 500, 400, 56, '#e8c88a') + range(5, (i) => rect(38 + i * 72, 490, 4, 46, '#fff') + path(`M${8 + i * 72} 496q32 -38 64 0Z`, i % 2 ? '#e5384f' : '#2f6bff'));
    case 'canals': return range(7, (i) => { const x = i * 58 - 4, h = 150 + r() * 80, c = ['#7a2f2a', '#3a4a6a', '#b4643c', '#4a2f55', '#2f5a4a'][i % 5]; return path(`M${x} 500V${500 - h}h8v-12h8v-12h8v-12h8v12h8v12h8v12h6V500Z`, c) + range(3, (j) => rect(x + 10, 500 - h + 16 + j * 40, 13, 22, '#ffe9b0') + rect(x + 32, 500 - h + 16 + j * 40, 13, 22, '#ffe9b0')); }) + water('#25465a') + path('M60 520q70 -52 140 0', 'none', 'stroke="#e8d8c0" stroke-width="10"');
    case 'tower': return blocks(520, 60, 170) + rect(268, 150, 9, 370, '#b8b8c8') + circle(272, 210, 30, '#c8c8d8') + rect(244, 206, 57, 6, '#ff3f81') + rect(270, 108, 5, 50, '#e5384f') + rect(40, 360, 120, 160, '#24242e') + range(4, (i) => rect(52 + i * 28, 380, 16, 60, '#b46cff', 'opacity=".8"'));
    case 'tram': return path('M0 520V380L110 300L220 380L320 290L400 350V520Z', '#7a4a52') + range(26, () => { const x = r() * 370, y = 370 + r() * 100; return rect(x, y, 30, 34, ['#fff0d8', '#ffd0a0', '#ffb8a0', '#c8e0e8'][Math.floor(r() * 4)]) + path(`M${x - 3} ${y}l18 -14l18 14Z`, '#c05038'); }) + rect(0, 500, 400, 56, '#8a6a5a') + rect(122, 440, 150, 74, '#ffd23f', 'rx="14"') + range(4, (i) => rect(134 + i * 34, 452, 26, 26, '#4a3a2a', 'rx="4"')) + circle(150, 520, 12, '#222') + circle(244, 520, 12, '#222') + path('M197 440l22 -44', 'none', 'stroke="#222" stroke-width="3"');
    case 'beach': return circle(200, 420, 74, '#fff0a0') + rect(0, 430, 400, 90, '#d85a78', 'opacity=".75"') + range(12, (i) => rect(150 + r() * 90 - i * 3, 436 + i * 6, 20 + r() * 60, 3, '#fff0a0', 'opacity=".7"')) + path('M0 505q200 -30 400 6V560H0Z', '#7a3a52') + palm(56, 520, 1.1) + palm(350, 526, 0.85);
    case 'temple': return blocks(500, 40, 90, '#2a1238') + [[110, 1], [290, 0.75]].map(([x, s]) => `<g transform="translate(${x} 500) scale(${s})">` + range(4, (i) => path(`M${-90 + i * 18} ${-i * 56}Q${-60 + i * 12} ${-26 - i * 56} ${-56 + i * 14} ${-44 - i * 56}H${56 - i * 14}Q${60 - i * 12} ${-26 - i * 56} ${90 - i * 18} ${-i * 56}Z`, i % 2 ? '#e5384f' : '#f4c24b')) + path('M-6 -212L0 -300L6 -212Z', '#f4c24b') + '</g>').join('') + rect(0, 498, 400, 58, '#4a2040') + range(9, (i) => circle(22 + i * 45, 478 + (i % 2) * 8, 10, '#ff8a3d'));
    case 'pyramid': return circle(320, 190, 40, '#ffe9b0') + path('M20 520L150 300L280 520Z', '#a8603a') + path('M150 300L280 520H190Z', '#8a4a2c') + range(8, (i) => rect(50 + i * 6, 500 - i * 22, 200 - i * 24, 3, '#c88050')) + path('M240 520L320 390L400 520Z', '#7a3c28') + rect(0, 505, 400, 51, '#6a3430') + range(14, (i) => path(`M${i * 30} 150q15 ${18 + (i % 2) * 6} 30 0l-15 28Z`, ['#ff3f81', '#2fd18a', '#ffe14d', '#2fd1ff'][i % 4]));
    case 'neon': return blocks(520, 130, 300, '#0c0a24') + [['ラ', 54, 240, '#ff3f81'], ['酒', 130, 330, '#2fd1ff'], ['歌', 298, 260, '#ffe14d'], ['夜', 352, 360, '#2fd18a']].map(([ch, x, y, c]) => rect(x - 22, y - 34, 44, 48, '#0c0a24', `stroke="${c}" stroke-width="3" rx="6"`) + neon(x, y + 2, ch, c, 28)).join('') + rect(0, 505, 400, 51, '#1a1438') + range(10, (i) => rect(i * 42, 528, 24, 5, '#fff', 'opacity=".5"'));
    case 'factory': return range(4, (i) => rect(30 + i * 100, 220 + (i % 2) * 60, 22, 220, '#24303a') + range(4, (j) => circle(41 + i * 100 + j * 12, 200 + (i % 2) * 60 - j * 24, 14 + j * 6, '#8a9aaa', `opacity="${0.35 - j * 0.07}"`))) + path('M0 520V420l60 -40v40l60 -40v40l60 -40v40h80v-60h140V520Z', '#161c24') + range(10, (i) => rect(14 + i * 39, 450, 22, 30, i % 3 ? '#ffb347' : '#2a3440')) + rect(0, 505, 400, 51, '#202830');
    case 'skyline': return blocks(520, 120, 260, '#151c3a') + rect(172, 150, 56, 370, '#1c2650') + windows(172, 150, 56, 360) + rect(184, 120, 32, 34, '#1c2650') + rect(198, 66, 4, 56, '#c8d0e8') + rect(0, 505, 400, 51, '#20243c') + rect(46, 490, 92, 34, '#ffd23f', 'rx="10"') + circle(66, 526, 9, '#111') + circle(118, 526, 9, '#111');
    case 'palms': return circle(200, 250, 54, '#ffd36b') + path('M0 500q100 -50 200 -10t200 -20V560H0Z', '#2a6a4a') + palm(48, 500, 1.35) + palm(130, 516, 0.8) + palm(330, 498, 1.2) + range(26, () => circle(r() * 400, 330 + r() * 190, 2 + r() * 3, ['#ff3f81', '#8ff5ff', '#d8ff4a'][Math.floor(r() * 3)]));
    case 'sugarloaf': return path('M-20 520Q60 420 110 470Q150 230 230 300Q262 340 276 520Z', '#16503e') + path('M200 520Q290 380 420 460V520Z', '#1f6a4a') + path('M168 294L338 380', 'none', 'stroke="#fff" stroke-width="2"') + rect(244, 330, 26, 16, '#ff3f81', 'rx="5"') + rect(0, 495, 400, 61, '#2a9ab0') + path('M0 530q200 -24 400 8V560H0Z', '#f0d890') + range(16, () => circle(r() * 400, 150 + r() * 130, 3, ['#ffe14d', '#ff3f81', '#2fd18a'][Math.floor(r() * 3)]));
    case 'aurora': return range(4, (i) => path(`M${-40 + i * 20} ${200 + i * 36}C${80 + i * 10} ${70 + i * 40} ${200 - i * 10} ${320 - i * 6} ${440} ${110 + i * 50}`, 'none', `stroke="${['#3dffb0', '#2fd1ff', '#b46cff', '#8fffd0'][i]}" stroke-width="${34 - i * 5}" opacity="${0.34 - i * 0.04}" stroke-linecap="round"`)) + range(40, () => circle(r() * 400, r() * 300, 0.7 + r(), '#fff')) + path('M0 520L70 380L130 470L220 340L310 480L360 420L400 470V520Z', '#1a2a44') + path('M70 380l22 34l-16 -6l-12 14ZM220 340l34 50l-22 -10l-14 16Z', '#e8f4ff') + rect(0, 505, 400, 51, '#d8e8f4') + rect(60, 520, 280, 26, '#6ae0d8', 'rx="13" opacity=".85"');
    default: return blocks(520, 80, 220);
  }
}

function palm(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${path('M-5 0Q-14 -80 8 -150L16 -148Q-2 -80 8 0Z', '#3a2430')}${[[-70, -140, -30, -190], [-60, -182, -6, -196], [20, -200, 66, -176], [50, -180, 84, -128]].map(([ex, ey, cx, cy]) => path(`M12 -150Q${cx} ${cy} ${ex} ${ey}Q${cx} ${cy + 26} 12 -146Z`, '#1f6a4a')).join('')}</g>`;
}

/** A city at a given moment: 'dusk' to arrive, 'dawn' for the after. */
export function cityScene(cityId, time = 'dusk') {
  const c = cityById(cityId);
  const sky = time === 'dawn' ? ['#6a7fd0', '#ffb8a0'] : c.sky;
  const r = rnd(c.id.length * 131 + 5);
  return wrap(
    rect(0, 0, 400, 560, 'url(#sky)') + (time === 'dawn' ? circle(80, 330, 46, '#fff2c0') : range(26, () => circle(r() * 400, r() * 230, 0.6 + r(), '#fff', 'opacity=".7"'))) +
    landmark(c.scene) + floor('#2a2038', '#3a2c4c', 552),
    grad('sky', sky[0], sky[1]));
}

export function balconyScene(cityId, hour = 20) {
  const dawn = hour >= 5 && hour < 11;
  const city = cityScene(cityId, dawn ? 'dawn' : 'dusk').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return wrap(city + rect(0, 556, 400, 144, '#4a3448') + rect(0, 468, 400, 14, '#16101c', 'rx="7"') + range(14, (i) => rect(10 + i * 29, 480, 7, 84, '#16101c', 'rx="3"')) +
    rect(318, 524, 46, 40, '#c05a38', 'rx="6"') + path('M341 524q-34 -18 -22 -56q22 14 22 40q2 -34 28 -44q8 34 -28 60Z', '#3a9a5a'));
}
