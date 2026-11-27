/* ============================================================
   Agente Zero — the drink scene: drop the shot, knock it back
   ------------------------------------------------------------
   Amaro Nebbia and the Fulmine energy drink are invented.
   Drawn on top of the dimmed court.
   ============================================================ */
import { CATCH, FALL } from '../bomb.js';
import { SKINS, HAIRS, JERSEYS } from './player.js';

const SWING = 150;              // shot glass travel, in scene units
const FIZZ = '#e8b93a';
const AMARO = '#3d2410';

const lerp = (a, b, k) => a + (b - a) * k;

function bolt(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  [[4, -30], [-16, 4], [-2, 4], [-8, 30], [16, -8], [2, -8], [12, -30]].forEach(([a, b], i) => (i ? ctx.lineTo(x + a * s, y + b * s) : ctx.moveTo(x + a * s, y + b * s)));
  ctx.closePath();
  ctx.fill();
}

function label(ctx, text, x, y, size, color, stroke = 'rgba(15,8,22,.9)') {
  ctx.font = `900 ${size}px "Arial Black", Impact, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.18;
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function can(ctx, x, y, u, name) {
  ctx.fillStyle = '#17224d';
  ctx.beginPath(); ctx.roundRect(x - 30 * u, y - 112 * u, 60 * u, 112 * u, 10 * u); ctx.fill();
  ctx.fillStyle = '#c9d2e0';
  ctx.fillRect(x - 26 * u, y - 117 * u, 52 * u, 7 * u);
  ctx.fillRect(x - 30 * u, y - 14 * u, 60 * u, 5 * u);
  bolt(ctx, x, y - 66 * u, u, '#ffe034');
  label(ctx, name, x, y - 26 * u, 10 * u, '#ffffff', '#17224d');
}

function bottle(ctx, x, y, u) {
  ctx.fillStyle = '#233326';
  ctx.beginPath(); ctx.roundRect(x - 26 * u, y - 96 * u, 52 * u, 96 * u, 12 * u); ctx.fill();
  ctx.fillRect(x - 9 * u, y - 130 * u, 18 * u, 40 * u);
  ctx.fillStyle = '#b9a06a';
  ctx.fillRect(x - 11 * u, y - 138 * u, 22 * u, 12 * u);
  ctx.fillStyle = '#e8e1cf';
  ctx.fillRect(x - 22 * u, y - 70 * u, 44 * u, 36 * u);
  label(ctx, 'AMARO', x, y - 59 * u, 8.5 * u, '#233326', '#e8e1cf');
  label(ctx, 'NEBBIA', x, y - 45 * u, 8.5 * u, '#233326', '#e8e1cf');
}

/** A small glass of amaro, centred on (x, y). */
function shotGlass(ctx, x, y, u, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const path = () => { ctx.beginPath(); ctx.moveTo(-23 * u, -28 * u); ctx.lineTo(23 * u, -28 * u); ctx.lineTo(17 * u, 28 * u); ctx.lineTo(-17 * u, 28 * u); ctx.closePath(); };
  path(); ctx.fillStyle = 'rgba(220,240,255,.3)'; ctx.fill();
  ctx.save(); path(); ctx.clip(); ctx.fillStyle = AMARO; ctx.fillRect(-25 * u, -12 * u, 50 * u, 38 * u); ctx.restore();
  path(); ctx.strokeStyle = '#eef8ff'; ctx.lineWidth = 3 * u; ctx.stroke();
  ctx.restore();
}

const GLASS = [[-62, -200], [62, -200], [48, 0], [-48, 0]];

function bigGlass(ctx, x, y, u, fill, color, t) {
  const path = () => { ctx.beginPath(); GLASS.forEach(([a, b], i) => (i ? ctx.lineTo(x + a * u, y + b * u) : ctx.moveTo(x + a * u, y + b * u))); ctx.closePath(); };
  path(); ctx.fillStyle = 'rgba(220,240,255,.16)'; ctx.fill();
  ctx.save(); path(); ctx.clip();
  const top = y - 200 * u * fill;
  ctx.fillStyle = color;
  ctx.fillRect(x - 70 * u, top, 140 * u, y - top);
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  for (let i = 0; i < 22; i++) {
    const phase = (t * (0.35 + (i % 5) * 0.09) + i * 0.137) % 1;
    ctx.beginPath(); ctx.arc(x + Math.sin(i * 12.9) * 46 * u, y - phase * 200 * u * fill, (1.5 + (i % 3)) * u, 0, 7); ctx.fill();
  }
  ctx.fillStyle = '#fff4cf';
  ctx.fillRect(x - 70 * u, top, 140 * u, 7 * u);
  ctx.restore();
  path(); ctx.strokeStyle = '#eef8ff'; ctx.lineWidth = 4 * u; ctx.stroke();
}

function splash(ctx, x, y, u, t, color, spread) {
  ctx.fillStyle = color;
  for (let i = 0; i < 18; i++) {
    const a = -Math.PI * (0.15 + 0.7 * ((i * 0.618) % 1));
    const v = (120 + (i % 5) * 45) * spread;
    const px = x + Math.cos(a) * v * t * u, py = y + (Math.sin(a) * v * t + 420 * t * t) * u;
    ctx.globalAlpha = Math.max(0, 1 - t * 1.4);
    ctx.beginPath(); ctx.arc(px, py, (3 + (i % 3) * 1.6) * u, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function mix(a, b, k) {
  const n = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const p = n(a), q = n(b);
  return `rgb(${p.map((v, i) => Math.round(lerp(v, q[i], k))).join(',')})`;
}

function mouthTime(ctx, cx, cy, u, bomb, look, t) {
  const skin = SKINS[look.skin] || SKINS.s2, hair = HAIRS[look.hairColor] || HAIRS.black;
  const kit = JERSEYS[look.jersey] || JERSEYS.classic;
  const burp = bomb.step !== 'drink';
  // shoulders and jersey
  ctx.fillStyle = kit.main;
  ctx.beginPath(); ctx.roundRect(cx - 130 * u, cy + 105 * u, 260 * u, 190 * u, 60 * u); ctx.fill();
  ctx.strokeStyle = kit.trim; ctx.lineWidth = 9 * u;
  ctx.beginPath(); ctx.arc(cx, cy + 104 * u, 42 * u, 0.15, Math.PI - 0.15); ctx.stroke();
  ctx.lineWidth = 14 * u;
  ctx.beginPath(); ctx.ellipse(cx, cy + 208 * u, 24 * u, 36 * u, 0, 0, 7); ctx.stroke();
  ctx.fillStyle = skin;
  ctx.fillRect(cx - 28 * u, cy + 60 * u, 56 * u, 56 * u);
  // hair behind, head, ears
  if (look.hair === 'afro') { ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(cx, cy - 30 * u, 112 * u, 0, 7); ctx.fill(); }
  ctx.fillStyle = skin;
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + d * 80 * u, cy, 17 * u, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.ellipse(cx, cy, 82 * u, 92 * u, 0, 0, 7); ctx.fill();
  ctx.fillStyle = hair;
  ctx.globalAlpha = look.hair === 'buzz' ? 0.7 : 1;
  ctx.beginPath(); ctx.ellipse(cx, cy - 18 * u, 84 * u, 80 * u, 0, Math.PI * 1.04, Math.PI * 1.96); ctx.quadraticCurveTo(cx, cy - 66 * u, cx - 82 * u, cy - 28 * u); ctx.fill();
  ctx.globalAlpha = 1;
  if (look.hair === 'braids') {
    ctx.strokeStyle = hair; ctx.lineWidth = 11 * u; ctx.lineCap = 'round';
    for (const d of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(cx + d * (66 + i * 8) * u, cy - 40 * u); ctx.quadraticCurveTo(cx + d * (100 + i * 10) * u, cy, cx + d * (84 + i * 12) * u, cy + (55 - i * 8) * u); ctx.stroke(); }
  }
  if (look.band !== 'none') {
    ctx.strokeStyle = look.band === 'white' ? '#fff' : '#d3182f'; ctx.lineWidth = 17 * u; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(cx - 79 * u, cy - 34 * u); ctx.quadraticCurveTo(cx, cy - 66 * u, cx + 79 * u, cy - 34 * u); ctx.stroke();
  }
  // face
  const drunk = bomb.level / 100;
  ctx.fillStyle = `rgba(230,50,60,${0.18 + drunk * 0.45})`;
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + d * 47 * u, cy + 20 * u, 20 * u, 12 * u, 0, 0, 7); ctx.fill(); }
  ctx.strokeStyle = '#1c1014'; ctx.lineWidth = 6 * u; ctx.lineCap = 'round';
  for (const d of [-1, 1]) {
    const ex = cx + d * 33 * u, ey = cy - 8 * u;
    ctx.beginPath();
    if (burp) { ctx.moveTo(ex - 14 * u, ey - d * 5 * u); ctx.lineTo(ex + 14 * u, ey + d * 5 * u); }
    else ctx.arc(ex, ey - 5 * u, 13 * u, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  ctx.fillStyle = '#4a1520';
  ctx.beginPath(); ctx.ellipse(cx, cy + 46 * u, (burp ? 22 : 15) * u, (burp ? 24 : 9) * u, 0, 0, 7); ctx.fill();
  if (burp) return;
  // the glass tips up as it empties; the liquid stays level
  const angle = 0.55 + bomb.progress * 1.75;
  const px = cx, py = cy + 48 * u;
  const dir = [Math.sin(angle), Math.cos(angle)], side = [dir[1], -dir[0]];
  const pt = (across, down) => [px + (side[0] * across + dir[0] * down) * u, py + (side[1] * across + dir[1] * down) * u];
  const shape = [pt(-12, 0), pt(80, 0), pt(66, 160), pt(0, 160)];
  const path = () => { ctx.beginPath(); shape.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath(); };
  path(); ctx.fillStyle = 'rgba(220,240,255,.22)'; ctx.fill();
  const ys = shape.map((p) => p[1]);
  const lo = Math.max(...ys), hi = Math.min(...ys);
  const level = lo - (lo - hi) * 0.82 * (1 - bomb.progress) + Math.sin(t * 9) * 2 * u * (bomb.rate ? 1 : 0);
  ctx.save(); path(); ctx.clip();
  ctx.fillStyle = mix(FIZZ, AMARO, bomb.clean ? 0.45 : 0.25);
  if (bomb.progress < 1) ctx.fillRect(0, level, px * 2 + 400 * u, lo - level + 2);
  ctx.restore();
  path(); ctx.strokeStyle = '#eef8ff'; ctx.lineWidth = 4 * u; ctx.stroke();
  const hand = pt(76, 92);
  ctx.fillStyle = skin;
  for (let i = 0; i < 4; i++) { const f = pt(74 - i * 2, 70 + i * 19); ctx.beginPath(); ctx.arc(f[0], f[1], 13 * u, 0, 7); ctx.fill(); }
  ctx.strokeStyle = skin; ctx.lineWidth = 30 * u;
  ctx.beginPath(); ctx.moveTo(hand[0] + 6 * u, hand[1]); ctx.quadraticCurveTo(cx + 190 * u, cy + 120 * u, cx + 118 * u, cy + 190 * u); ctx.stroke();
}

/** words: {clean, spill, burp, can} */
export function drawBombScene(ctx, w, h, bomb, look, words, t) {
  const u = Math.min(w, h * 0.62, 520) / 390;
  const cx = w / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(14,8,24,.82)';
  ctx.fillRect(0, 0, w, h);
  ctx.lineCap = 'round';
  if (bomb.step === 'swing' || bomb.step === 'fall') {
    const base = h * 0.78, mouth = base - 200 * u, start = h * 0.34;
    ctx.fillStyle = '#4a3427';
    ctx.fillRect(0, base, w, 12 * u);
    bottle(ctx, cx - 135 * u, base, u);
    can(ctx, cx + 140 * u, base, u, words.can);
    const landed = bomb.step === 'fall' ? Math.min(1, bomb.t / (FALL * 0.7)) : 0;
    const sx = cx + bomb.x * SWING * u;
    if (bomb.step === 'swing') {
      // the target above the glass
      ctx.strokeStyle = Math.abs(bomb.x) <= CATCH ? '#6ee7a0' : 'rgba(255,255,255,.35)';
      ctx.setLineDash([6 * u, 8 * u]); ctx.lineWidth = 3 * u;
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + d * CATCH * SWING * u, start + 40 * u); ctx.lineTo(cx + d * CATCH * SWING * u, mouth - 8 * u); ctx.stroke(); }
      ctx.setLineDash([]);
    }
    const dark = bomb.clean && landed >= 1;
    bigGlass(ctx, cx, base, u, dark ? 0.72 : 0.6, dark ? mix(FIZZ, AMARO, 0.45) : FIZZ, t);
    const fall = landed * landed;
    if (bomb.step === 'swing') {
      ctx.strokeStyle = SKINS[look.skin] || SKINS.s2; ctx.lineWidth = 17 * u;
      ctx.beginPath(); ctx.moveTo(sx + 40 * u, start - 110 * u); ctx.lineTo(sx + 17 * u, start - 22 * u); ctx.moveTo(sx - 22 * u, start - 80 * u); ctx.lineTo(sx - 19 * u, start - 20 * u); ctx.stroke();
      shotGlass(ctx, sx, start, u, bomb.x * 0.18);
    } else if (bomb.clean) {
      shotGlass(ctx, lerp(sx, cx, fall), lerp(start, base - 34 * u, fall), u, fall * 0.25);
      if (landed >= 1) {
        const after = bomb.t - FALL * 0.7;
        splash(ctx, cx, mouth + 50 * u, u, after * 1.4, '#fff0b8', 0.6);
        label(ctx, words.clean, cx, mouth - 40 * u, 44 * u, '#ffd24a');
      }
    } else {
      const away = Math.sign(bomb.x || 1);
      const after = Math.max(0, bomb.t - FALL * 0.7);
      shotGlass(ctx, sx + away * after * 360 * u, lerp(start, mouth - 20 * u, fall) + after * after * 1400 * u, u, away * (fall * 0.6 + after * 9));
      if (landed >= 1) { splash(ctx, sx, mouth, u, after * 1.6, '#c98a28', 1.3); label(ctx, words.spill, cx, mouth - 44 * u, 36 * u, '#ff6b6b'); }
    }
  } else {
    const cy = h * 0.43;
    mouthTime(ctx, cx, cy, u, bomb, look, t);
    if (bomb.step === 'drink') {
      // under the face, clear of the score boxes
      const bw = 240 * u, by = Math.min(h * 0.835, h - 92);
      ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.roundRect(cx - bw / 2, by, bw, 16 * u, 8 * u); ctx.fill();
      ctx.fillStyle = '#ffd24a'; ctx.beginPath(); ctx.roundRect(cx - bw / 2, by, Math.max(16 * u, bw * bomb.progress), 16 * u, 8 * u); ctx.fill();
      label(ctx, `${Math.round(bomb.progress * 100)}%`, cx, by - 22 * u, 24 * u, '#fff');
    } else {
      label(ctx, words.burp, cx + Math.sin(t * 30) * 3 * u, cy - 150 * u, 52 * u, '#ffd24a');
    }
  }
  ctx.restore();
}
