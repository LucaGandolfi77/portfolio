/* ============================================================
   Seba — the rig: a layered SVG creature built from strings
   ------------------------------------------------------------
   A lemon-orange fur ball with a punk crest, a moustache, a
   bartender vest and a bow tie that tilts with his mood.
   Self-contained SVG, so the same markup works on screen, in
   postcards and in the app icon. CSS only adds the movement.
   ============================================================ */
import { itemById, COLORS } from '../wardrobe.js';

export const EXPRESSIONS = ['happy', 'hype', 'tipsy', 'drunk', 'hangover', 'sleepy', 'sleeping',
  'bored', 'hungry', 'disgusted', 'cough', 'love', 'after', 'chew', 'gulp', 'puff'];

const FUR = '#ffa63d', FUR_DARK = '#e0742a', FUR_LIGHT = '#ffd27a', INK = '#2a1410';
const CREST = '#ff3f81';

/* A spiky circle: deterministic tufts, so every render is identical. */
function furPath(cx, cy, r, n = 34, spike = 7) {
  const pt = (a, rr) => [(cx + Math.cos(a) * rr).toFixed(1), (cy + Math.sin(a) * rr * 0.96).toFixed(1)];
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    const bump = spike * (0.55 + 0.45 * Math.abs(Math.sin(i * 2.7)));
    const [x0, y0] = pt(a0, r), [mx, my] = pt((a0 + a1) / 2 + 0.035, r + bump), [x1, y1] = pt(a1, r);
    if (!i) d += `M${x0} ${y0}`;
    d += `Q${mx} ${my} ${x1} ${y1}`;
  }
  return d + 'Z';
}
const BODY = furPath(120, 150, 84);

const star = (x, y, r, fill) => {
  let d = '';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.4 : r;
    d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`;
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
};
const heart = (x, y, s, fill) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 8C-14 -2 -9 -14 0 -6C9 -14 14 -2 0 8Z" fill="${fill}"/>`;

const line = (d, w = 4, c = INK) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

/* ---------------- face ---------------- */

function eye(x, { r = 19, px = 0, py = 0, pr = 9.5, lid = 0, tilt = 0 } = {}, uid, side) {
  const clip = `${uid}-eye${side}`;
  const lidY = 128 - r + lid * r * 2;
  return `<clipPath id="${clip}"><circle cx="${x}" cy="128" r="${r}"/></clipPath>
  <circle cx="${x}" cy="128" r="${r}" fill="#fffaf0"/>
  <g clip-path="url(#${clip})"><circle cx="${x + px}" cy="${128 + py}" r="${pr}" fill="${INK}"/>
  <circle cx="${x + px + pr * 0.38}" cy="${128 + py - pr * 0.38}" r="${pr * 0.34}" fill="#fff"/>
  ${lid > 0 ? `<path d="M${x - r - 4} ${128 - r - 4}H${x + r + 4}V${lidY - tilt}L${x - r - 4} ${lidY + tilt}Z" fill="${FUR_DARK}"/>${line(`M${x - r - 2} ${lidY + tilt}L${x + r + 2} ${lidY - tilt}`, 3)}` : ''}</g>
  <circle cx="${x}" cy="128" r="${r}" fill="none" stroke="${INK}" stroke-width="3"/>`;
}

function eyes(expr, uid) {
  const L = 94, R = 146;
  const pair = (a, b = a) => eye(L, a, uid, 'l') + eye(R, b, uid, 'r');
  const arcs = (up) => [L, R].map((x) => line(`M${x - 15} ${up ? 133 : 126}Q${x} ${up ? 114 : 142} ${x + 15} ${up ? 133 : 126}`, 5)).join('');
  switch (expr) {
    case 'hype': return pair({ r: 21, pr: 13, py: -1 });
    case 'tipsy': return pair({ lid: 0.38, px: 4, py: 3 }, { lid: 0.22, px: -3, py: 1 });
    case 'drunk': return [L, R].map((x, i) => `<circle cx="${x}" cy="128" r="19" fill="#fffaf0" stroke="${INK}" stroke-width="3"/>` +
      line(`M${x} 128c${i ? -6 : 6} -2 ${i ? -6 : 6} 8 0 8c${i ? 11 : -11} 0 ${i ? 11 : -11} -17 0 -17c${i ? -17 : 17} 0 ${i ? -17 : 17} 25 0 25`, 3)).join('');
    case 'hangover': return pair({ lid: 0.55, pr: 6, py: 6, tilt: -5 }, { lid: 0.55, pr: 6, py: 6, tilt: 5 }) +
      [L, R].map((x) => line(`M${x - 14} 153q14 9 28 0`, 3, '#8a4a8f')).join('');
    case 'sleepy': return pair({ lid: 0.68, py: 6 });
    case 'sleeping': return arcs(false);
    case 'bored': return pair({ lid: 0.46, pr: 7, py: 3, px: 6 });
    case 'hungry': return pair({ r: 20, pr: 12, py: 6, tilt: 0 });
    case 'disgusted': return pair({ lid: 0.55, tilt: -6, pr: 7 }, { lid: 0.15, pr: 7 });
    case 'cough': return line(`M${L - 13} 117L${L + 11} 128L${L - 13} 139`, 5) + line(`M${R + 13} 117L${R - 11} 128L${R + 13} 139`, 5);
    case 'love': return [L, R].map((x) => `<circle cx="${x}" cy="128" r="20" fill="#fffaf0" stroke="${INK}" stroke-width="3"/>${heart(x, 130, 1.25, '#ff2d6f')}`).join('');
    case 'after': return arcs(true) + [L, R].map((x) => line(`M${x - 13} 146q13 8 26 0`, 3, '#8a4a8f')).join('');
    case 'chew': case 'gulp': return arcs(true);
    case 'puff': return pair({ lid: 0.5, px: 5, py: 2 });
    default: return pair({ py: 1 });
  }
}

function brows(expr) {
  const b = (y1, y2, y3, y4) => line(`M76 ${y1}L108 ${y2}`, 6) + line(`M132 ${y3}L164 ${y4}`, 6);
  switch (expr) {
    case 'hype': return b(100, 94, 94, 100);
    case 'hungry': case 'sleepy': return b(108, 98, 98, 108);
    case 'hangover': case 'disgusted': return b(100, 110, 110, 100);
    case 'drunk': return b(96, 104, 112, 98);
    case 'cough': return b(104, 110, 110, 104);
    default: return '';
  }
}

function mouth(expr) {
  const open = (d) => `<path d="${d}" fill="#5a1220" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
  const tongue = (x, y, rx = 12, ry = 7) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#ff6b81"/>`;
  switch (expr) {
    case 'hype': case 'love': return open('M96 165Q120 172 144 165Q138 196 120 196Q102 196 96 165Z') + tongue(120, 189) + `<path d="M101 167Q120 173 139 167L137 172Q120 177 103 172Z" fill="#fff"/>`;
    case 'after': return open('M94 164Q120 174 146 164Q140 192 120 192Q100 192 94 164Z') + tongue(120, 186);
    case 'tipsy': return line('M100 172q10 12 20 3t22 -6', 4.5) + tongue(137, 175, 7, 8);
    case 'drunk': return open('M101 172q8 -10 19 -2t20 -4q-2 22 -19 22t-20 -16Z') + tongue(130, 187, 10, 9);
    case 'hangover': return line('M100 182q7 -9 13 -2t13 -2t14 3', 4.5);
    case 'sleepy': case 'bored': return line('M105 178h30', 4.5);
    case 'sleeping': return `<ellipse cx="120" cy="178" rx="8" ry="9" fill="#5a1220" stroke="${INK}" stroke-width="3"/>`;
    case 'hungry': return line('M101 182q19 -16 38 0', 4.5) + `<path d="M133 179q9 12 3 18q-8 -4 -3 -18Z" fill="#9bd8ff"/>`;
    case 'disgusted': return line('M101 180q10 -11 19 -3t20 -5', 4.5) + tongue(112, 186, 9, 7);
    case 'cough': return open('M107 170q13 -7 26 0q3 20 -13 20t-13 -20Z');
    case 'chew': return open('M103 170Q120 164 137 170Q135 187 120 187Q105 187 103 170Z') + `<circle cx="147" cy="170" r="3" fill="#e8c48a"/><circle cx="92" cy="180" r="2.5" fill="#e8c48a"/>`;
    case 'gulp': return open('M104 166q16 -4 32 0q-2 26 -16 26t-16 -26Z') + tongue(120, 185);
    case 'puff': return `<ellipse cx="120" cy="177" rx="9" ry="8" fill="#5a1220" stroke="${INK}" stroke-width="3"/>`;
    default: return line('M97 169q23 22 46 0', 5);
  }
}

const moustache = `<path d="M120 160C112 153 99 155 93 163C88 169 80 167 78 161C79 173 91 177 101 171C109 167 115 166 120 166C125 166 131 167 139 171C149 177 161 173 162 161C160 167 152 169 147 163C141 155 128 153 120 160Z" fill="#6a2a14"/>`;

/* ---------------- clothes ---------------- */

const hex = (item) => COLORS[item.color].hex;

function topLayer(item, uid) {
  if (!item) return '';
  const c = hex(item);
  const clip = (inner) => `<g clip-path="url(#${uid}-body)">${inner}</g>`;
  switch (item.shape) {
    case 'gilet': return clip(`<path d="M30 168L84 178L116 214L120 245H30Z M210 168L156 178L124 214L120 245H210Z" fill="${c}"/>${line('M84 178L116 214L120 245', 2.5, '#00000055')}${line('M156 178L124 214', 2.5, '#00000055')}
      <circle cx="127" cy="220" r="3" fill="#f4c24b"/><circle cx="127" cy="231" r="3" fill="#f4c24b"/>`);
    case 'rete': {
      let mesh = '';
      for (let x = 20; x < 320; x += 13) mesh += `M${x} 184L${x - 70} 250 M${x - 100} 184L${x - 30} 250 `;
      return clip(`<path d="M30 182Q120 208 210 182V250H30Z" fill="${c}" opacity=".22"/><path d="${mesh}" stroke="${c}" stroke-width="2" fill="none"/>${line('M34 183Q120 209 206 183', 5, c)}`);
    }
    case 'hawaii': {
      const f = [[52, 200], [78, 222], [162, 214], [192, 196], [150, 236], [96, 238], [60, 226], [184, 224]]
        .map(([x, y], i) => [0, 72, 144, 216, 288].map((a) => `<ellipse cx="${x}" cy="${y - 6}" rx="4" ry="6" fill="${i % 2 ? '#fff4d6' : '#ffd23f'}" transform="rotate(${a} ${x} ${y})"/>`).join('') + `<circle cx="${x}" cy="${y}" r="3" fill="#ff7b00"/>`).join('');
      return clip(`<path d="M30 172L88 184L120 216L152 184L210 172V250H30Z" fill="${c}"/>${f}${line('M120 216V248', 2.5, '#00000055')}`);
    }
    case 'giacca': return clip(`<path d="M30 164L88 182L112 204V250H30Z M210 164L152 182L128 204V250H210Z" fill="${c}"/><path d="M30 208H112V219H30Z M128 208H210V219H128Z" fill="#e8f4ff"/><path d="M30 224H112V228H30Z M128 224H210V228H128Z" fill="#e8f4ff"/>`);
    case 'mantello': return `${line('M58 190Q120 214 182 190', 7, c)}<circle cx="120" cy="203" r="8" fill="#f4c24b" stroke="${INK}" stroke-width="2"/>`;
    default: return '';
  }
}

const capeBack = (item) => (item && item.shape === 'mantello'
  ? `<path d="M60 130Q8 190 18 246Q50 232 74 248Q98 234 120 250Q142 234 166 248Q190 232 222 246Q232 190 180 130Z" fill="${hex(item)}" stroke="${INK}" stroke-width="3"/>` : '');

function neckLayer(item, tilt) {
  if (!item) return '';
  const c = hex(item);
  switch (item.shape) {
    case 'papillon': return `<g transform="rotate(${tilt} 120 204)"><path d="M120 204L94 191Q88 204 94 217Z M120 204L146 191Q152 204 146 217Z" fill="${c}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><rect x="113" y="197" width="14" height="14" rx="4" fill="${c}" stroke="${INK}" stroke-width="3"/></g>`;
    case 'foulard': return `<path d="M72 190Q120 214 168 190L124 232Z" fill="${c}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="104" cy="204" r="2.5" fill="#fff8"/><circle cx="132" cy="212" r="2.5" fill="#fff8"/>`;
    case 'catena': return `<path d="M70 188Q120 244 170 188" fill="none" stroke="${c}" stroke-width="7" stroke-dasharray="7 3" stroke-linecap="round"/><circle cx="120" cy="219" r="12" fill="${c}" stroke="${INK}" stroke-width="2.5"/><path d="M125 214q-10 -4 -9 2t7 5t-8 4" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
    default: return '';
  }
}

function hatLayer(item) {
  if (!item) return '';
  const c = hex(item);
  const s = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"`;
  switch (item.shape) {
    case 'cappellino': return `<path d="M70 84Q74 38 120 38Q166 38 170 84Q120 70 70 84Z" fill="${c}" ${s}/><path d="M150 76Q196 66 208 86Q180 90 160 84Z" fill="${c}" ${s}/><circle cx="120" cy="39" r="5" fill="#fff" ${s}/>`;
    case 'pescatore': return `<path d="M82 74L92 38Q120 30 148 38L158 74Z" fill="${c}" ${s}/><path d="M60 88Q120 60 180 88Q150 70 120 72Q90 70 60 88Z" fill="${c}" ${s}/>`;
    case 'cilindro': return `<path d="M90 70V12Q120 4 150 12V70Z" fill="${c}" ${s}/><path d="M90 56Q120 64 150 56V68Q120 76 90 68Z" fill="#e5384f"/><ellipse cx="120" cy="72" rx="52" ry="10" fill="${c}" ${s}/>`;
    case 'corona': return `<path d="M82 76L76 30L100 50L120 20L140 50L164 30L158 76Q120 66 82 76Z" fill="${c}" ${s}/><circle cx="120" cy="56" r="5" fill="#ff3f81"/><circle cx="99" cy="62" r="3.5" fill="#2fd1ff"/><circle cx="141" cy="62" r="3.5" fill="#2fd18a"/>`;
    case 'cuffie': return `<path d="M44 128Q40 50 120 50Q200 50 196 128" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M44 128Q40 50 120 50Q200 50 196 128" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/><rect x="28" y="108" width="26" height="46" rx="12" fill="${c}" ${s}/><rect x="186" y="108" width="26" height="46" rx="12" fill="${c}" ${s}/>`;
    default: return '';
  }
}

function glassesLayer(item) {
  if (!item) return '';
  const c = hex(item);
  switch (item.shape) {
    case 'goccia': return [94, 146].map((x) => `<path d="M${x - 24} 114Q${x} 106 ${x + 24} 114Q${x + 22} 150 ${x} 150Q${x - 22} 150 ${x - 24} 114Z" fill="${c}" fill-opacity=".82" stroke="#d8c070" stroke-width="3"/>${line(`M${x - 13} 120l9 -3`, 3, '#fff9')}`).join('') + line('M116 115q4 -5 8 0', 3, '#d8c070');
    case 'barra': return `<path d="M62 114Q120 104 178 114L172 142Q146 148 130 136Q120 130 110 136Q94 148 68 142Z" fill="${c}" fill-opacity=".88" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>${line('M74 120l28 -4', 3.5, '#fff9')}`;
    case 'cuore': return [94, 146].map((x) => `<path transform="translate(${x} 130) scale(2.1)" d="M0 10C-17 -2 -11 -15 0 -7C11 -15 17 -2 0 10Z" fill="${c}" fill-opacity=".8" stroke="${INK}" stroke-width="1.5"/>`).join('') + line('M112 124q8 -5 16 0', 3);
    case 'tondi': return [94, 146].map((x) => `<circle cx="${x}" cy="128" r="22" fill="#bfe8ff22" stroke="${c}" stroke-width="5"/>`).join('') + line('M116 126q4 -4 8 0', 4, c);
    default: return '';
  }
}

function accLayer(item) {
  if (!item) return '';
  const c = hex(item);
  switch (item.shape) {
    case 'braccialetti': return [[38, 180, -30], [202, 180, 30]].map(([x, y, r]) => [0, 8].map((o) => `<ellipse cx="${x}" cy="${y - 8 + o}" rx="17" ry="5" fill="none" stroke="${c}" stroke-width="4" transform="rotate(${r} ${x} ${y})"/>`).join('')).join('');
    case 'fischietto': return `${line('M80 190Q96 226 154 224', 2.5, '#fff')}<rect x="150" y="216" width="26" height="14" rx="6" fill="${c}" stroke="${INK}" stroke-width="2.5"/><circle cx="157" cy="223" r="3" fill="${INK}"/>`;
    case 'shaker': return `<g transform="rotate(18 208 170)"><path d="M196 150H222L218 198H200Z" fill="${c}" stroke="${INK}" stroke-width="3"/><path d="M198 150Q209 130 220 150Z" fill="#c9ced8" stroke="${INK}" stroke-width="3"/>${line('M202 158l2 30', 3, '#fff8')}</g>`;
    case 'glowstick': return `${line('M26 200L52 130', 13, c + '55')}${line('M26 200L52 130', 7, c)}`;
    default: return '';
  }
}

/* ---------------- effects ---------------- */

function effects(expr) {
  const t = (x, y, size, txt, fill = '#fff') => `<text x="${x}" y="${y}" font-family="Arial Black, Arial, sans-serif" font-size="${size}" font-weight="900" fill="${fill}" stroke="${INK}" stroke-width="1.2">${txt}</text>`;
  const puff = (x, y, r, o = 0.7, fill = '#e8e4ee') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${o}"/>`;
  switch (expr) {
    case 'sleeping': return t(184, 74, 20, 'z') + t(200, 52, 26, 'Z') + t(216, 28, 32, 'Z');
    case 'drunk': return [[198, 90, 9], [214, 66, 6], [32, 86, 7], [20, 60, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#bfe8ff55" stroke="#fff" stroke-width="2"/>`).join('') + t(184, 38, 18, 'hic!', '#ffe14d');
    case 'tipsy': return `<ellipse cx="68" cy="158" rx="14" ry="9" fill="#ff4f6f" opacity=".6"/><ellipse cx="172" cy="158" rx="14" ry="9" fill="#ff4f6f" opacity=".6"/>` + t(196, 82, 24, '♪', '#ffe14d');
    case 'hangover': return line('M26 84l22 10M22 112h24M214 84l-22 10M218 112h-24', 4, '#c9a2ff');
    case 'hype': return star(30, 70, 14, '#ffe14d') + star(206, 54, 18, '#fff') + star(220, 118, 9, '#ffe14d');
    case 'love': return heart(34, 80, 1.5, '#ff2d6f') + heart(204, 56, 2, '#ff2d6f') + heart(220, 110, 1, '#ff7aa8');
    case 'disgusted': return puff(34, 110, 18, 0.55, '#8fd14f') + puff(20, 88, 11, 0.45, '#8fd14f') + puff(206, 100, 15, 0.55, '#8fd14f') + puff(220, 78, 8, 0.45, '#8fd14f');
    case 'hungry': return line('M186 214q8 -9 14 0t14 0', 3.5, '#fff') + line('M190 228q8 -9 14 0t14 0', 3.5, '#fff');
    case 'cough': return puff(172, 190, 12) + puff(194, 182, 16, 0.55) + puff(218, 194, 10, 0.4) + t(176, 150, 17, 'coff!');
    case 'bored': return t(182, 76, 34, '…');
    case 'sleepy': return `<path d="M178 88q14 20 0 26q-14 -6 0 -26Z" fill="#9bd8ff"/>`;
    case 'after': return star(34, 76, 11, '#ff9ad5') + star(204, 64, 13, '#8ff5ff') + t(190, 40, 18, '5:47', '#ffe14d');
    case 'puff': return puff(190, 128, 9, 0.8) + puff(206, 104, 14, 0.6) + puff(214, 70, 19, 0.45);
    default: return '';
  }
}

/* ---------------- assembly ---------------- */

const TILT = { drunk: 28, tipsy: 14, hangover: -16, sleepy: -9, sleeping: -12, hype: 0, bored: -7, love: 8, after: 20 };

export function sebaSVG({ expr = 'happy', outfit = {}, uid = 's', fx = true, label = 'Seba' } = {}) {
  const get = (slot) => (outfit[slot] ? itemById(outfit[slot]) : null);
  const top = get('top'), neck = get('neck'), hat = get('hat'), glasses = get('glasses'), acc = get('acc');
  const crestItem = get('crest');
  const crest = crestItem ? hex(crestItem) : CREST;
  const droop = ['hangover', 'sleepy', 'sleeping', 'bored'].includes(expr);
  const smoking = expr === 'puff';
  const paws = ['hype', 'love', 'after'].includes(expr)
    ? [[34, 108, 34], [206, 108, -34]] : [[38, 180, 30], [202, 180, -30]];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 260" class="seba e-${expr}" role="img" aria-label="${label}">
<defs><clipPath id="${uid}-body"><path d="${BODY}"/></clipPath>
<radialGradient id="${uid}-fur" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${FUR_LIGHT}"/><stop offset=".55" stop-color="${FUR}"/><stop offset="1" stop-color="${FUR_DARK}"/></radialGradient></defs>
<ellipse cx="120" cy="248" rx="76" ry="9" fill="#000" opacity=".28"/>
<g class="s-all">
${capeBack(top)}
<ellipse cx="88" cy="237" rx="24" ry="12" fill="${FUR_DARK}" stroke="${INK}" stroke-width="3.5"/>
<ellipse cx="152" cy="237" rx="24" ry="12" fill="${FUR_DARK}" stroke="${INK}" stroke-width="3.5"/>
<g class="s-body">
<g class="s-crest"><path d="${droop
    ? 'M86 80Q66 52 40 62Q62 66 66 84Q78 40 46 38Q82 28 96 70Q104 30 84 14Q122 22 120 66Q140 36 168 40Q144 52 148 78Z'
    : 'M82 84Q66 54 54 40Q82 44 90 58Q88 30 94 8Q110 24 114 46Q124 18 142 6Q144 30 138 48Q160 30 184 34Q166 54 160 84Z'}" fill="${crest}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></g>
<path d="${BODY}" fill="url(#${uid}-fur)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<ellipse cx="120" cy="194" rx="48" ry="36" fill="${FUR_LIGHT}" opacity=".55"/>
${topLayer(top, uid)}
<g transform="translate(0 9)">${neckLayer(neck, TILT[expr] || 0)}</g>
<ellipse cx="68" cy="158" rx="11" ry="7" fill="#ff6a4d" opacity=".45"/><ellipse cx="172" cy="158" rx="11" ry="7" fill="#ff6a4d" opacity=".45"/>
${expr === 'disgusted' || expr === 'hangover' ? `<path d="${BODY}" fill="#6fbf5a" opacity=".16"/>` : ''}
<g class="s-eyes">${eyes(expr, uid)}</g>
${brows(expr)}
<g transform="translate(0 8)">${mouth(expr)}</g>
<g transform="translate(0 -3)">${moustache}</g>
${expr === 'sleeping' ? '' : glassesLayer(glasses)}
${hatLayer(hat)}
${smoking ? `<g transform="rotate(14 128 180)"><rect x="124" y="174" width="52" height="9" rx="2" fill="#fff" stroke="${INK}" stroke-width="2"/><rect x="124" y="174" width="13" height="9" fill="#e59b3a"/><rect x="170" y="174" width="8" height="9" fill="#ff5a1f"/></g>` : ''}
</g>
${paws.map(([x, y, r]) => `<g class="s-paw"><ellipse cx="${x}" cy="${y}" rx="17" ry="23" fill="${FUR}" stroke="${INK}" stroke-width="3.5" transform="rotate(${r} ${x} ${y})"/></g>`).join('')}
${accLayer(acc)}
</g>
${fx ? `<g class="s-fx">${effects(expr)}</g>` : ''}
</svg>`;
}
