/* ============================================================
   Agente Zero — the player, seen from behind
   ------------------------------------------------------------
   A pose is a set of joints in metres from the spot between the
   feet (x right, y up). Poses blend into each other, so no
   sprites are needed.
   ============================================================ */
import { drawBallAt } from './hoop.js';
import { BALL_R } from '../physics.js';

export const SKINS = { s1: '#f1c7a3', s2: '#d99b6c', s3: '#a86b44', s4: '#6a3f28' };
export const HAIRS = { black: '#17120f', brown: '#4a2d1a', blond: '#d6ac55', ginger: '#a9481f' };
export const JERSEYS = {
  classic: { main: '#d3182f', dark: '#9d0f21', trim: '#ffffff' },
  stripes: { main: '#d3182f', dark: '#9d0f21', trim: '#ffffff', stripes: true },
  retro: { main: '#c8102e', dark: '#8d0a1f', trim: '#fff6e0', yoke: true },
  night: { main: '#6e0b1c', dark: '#450612', trim: '#ffffff' },
  rival: { main: '#2f3a8f', dark: '#1b235c', trim: '#ffd24a', name: 'KAPPA', letter: 'K' },
};
export const SHOES = {
  classic: { top: '#ffffff', sole: '#d3182f' },
  red: { top: '#d3182f', sole: '#ffffff' },
  black: { top: '#1d1b22', sole: '#ffffff' },
  gold: { top: '#f2c33d', sole: '#8a5b06' },
};

const base = {
  hip: [0, 0.96], neck: [0, 1.52], head: [0, 1.71],
  sL: [-0.23, 1.46], sR: [0.23, 1.46],
  eL: [-0.36, 1.19], hL: [-0.4, 0.93], eR: [0.38, 1.2], hR: [0.44, 0.96],
  kL: [-0.18, 0.52], kR: [0.18, 0.52], fL: [-0.22, 0.05], fR: [0.22, 0.05],
  jump: 0, ball: null,
};
const P = (o) => ({ ...base, ...o });

const crouched = { hip: [0, 0.82], neck: [0, 1.37], head: [0, 1.56], sL: [-0.23, 1.31], sR: [0.23, 1.31], kL: [-0.26, 0.45], kR: [0.26, 0.45], fL: [-0.24, 0.05], fR: [0.24, 0.05] };

export const POSES = ['idle', 'ready', 'gather', 'shoot', 'follow', 'land', 'sad', 'fist', 'zero', 'flex', 'dance', 'bow'];
export const POSE_TIME = { fist: 1.6, zero: 1.8, flex: 1.8, dance: 2.4, bow: 2, sad: 1.5 };

/** Target joints for a named pose at time t (seconds). */
export function poseAt(name, t) {
  switch (name) {
    case 'idle': {
      const b = Math.abs(Math.sin(t * 5.2));
      const breath = Math.sin(t * 2.6) * 0.008;
      return P({
        hip: [0, 0.9 + breath], neck: [0.02, 1.45 + breath], head: [0.02, 1.64 + breath], sL: [-0.22, 1.39 + breath], sR: [0.25, 1.38 + breath],
        kL: [-0.22, 0.49], kR: [0.22, 0.49], fL: [-0.27, 0.05], fR: [0.25, 0.05],
        eR: [0.48, 1.12 + b * 0.05], hR: [0.6, 0.8 + b * 0.14], ball: [0.64, 0.12 + b * 0.55],
      });
    }
    case 'ready': return P({ ...crouched, hip: [0, 0.88], neck: [0, 1.43], head: [0, 1.62], sL: [-0.23, 1.37], sR: [0.23, 1.37], eL: [-0.36, 1.1], hL: [0.14, 1.14], eR: [0.5, 1.1], hR: [0.44, 1.22], ball: [0.36, 1.26] });
    case 'gather': return P({ ...crouched, eL: [-0.4, 1.3], hL: [-0.06, 1.63], eR: [0.46, 1.3], hR: [0.32, 1.64], ball: [0.2, 1.74] });
    case 'shoot': return P({ hip: [0, 1], neck: [0, 1.57], head: [0, 1.76], sL: [-0.23, 1.52], sR: [0.23, 1.52], eL: [-0.36, 1.79], hL: [-0.12, 2.01], eR: [0.34, 1.82], hR: [0.18, 2.11], kL: [-0.16, 0.55], kR: [0.17, 0.56], fL: [-0.18, 0.04], fR: [0.2, 0.09], jump: 0.24, ball: [0.1, 2.24] });
    case 'follow': return P({ hip: [0, 0.99], neck: [0, 1.56], head: [0, 1.75], sL: [-0.23, 1.5], sR: [0.23, 1.5], eL: [-0.42, 1.62], hL: [-0.3, 1.84], eR: [0.3, 1.86], hR: [0.14, 2.14], kL: [-0.17, 0.55], kR: [0.18, 0.55], jump: 0.18 });
    case 'land': return P({ ...crouched, eL: [-0.46, 1.1], hL: [-0.5, 0.88], eR: [0.34, 1.55], hR: [0.22, 1.82] });
    case 'sad': return P({ neck: [0, 1.46], head: [0, 1.62], sL: [-0.23, 1.4], sR: [0.23, 1.4], eL: [-0.46, 1.62], hL: [-0.16, 1.74], eR: [0.46, 1.62], hR: [0.16, 1.74] });
    case 'fist': {
      const k = Math.abs(Math.sin(t * 7));
      return P({ ...crouched, eR: [0.48, 1.22 + k * 0.16], hR: [0.4, 1.5 + k * 0.28], eL: [-0.42, 1.08], hL: [-0.3, 0.9] });
    }
    case 'zero': {
      const k = Math.sin(t * 3) * 0.03;
      return P({ eR: [0.48, 1.72 + k], hR: [0.1, 2.12 + k], eL: [-0.48, 1.72 + k], hL: [-0.1, 2.12 + k] });
    }
    case 'flex': {
      const k = Math.sin(t * 6) * 0.04;
      return P({ eL: [-0.56, 1.45], hL: [-0.46 - k, 1.78], eR: [0.56, 1.45], hR: [0.46 + k, 1.78] });
    }
    case 'dance': {
      const s = Math.sin(t * 8), c = Math.cos(t * 4);
      return P({
        hip: [s * 0.1, 0.9], neck: [-s * 0.04, 1.45], head: [-s * 0.07 + c * 0.03, 1.64], sL: [-0.23 - s * 0.03, 1.39 + s * 0.07], sR: [0.23 - s * 0.03, 1.39 - s * 0.07],
        eL: [-0.5, 1.28 + s * 0.2], hL: [-0.56, 1.58 + s * 0.35], eR: [0.5, 1.28 - s * 0.2], hR: [0.56, 1.58 - s * 0.35],
        kL: [-0.24 + s * 0.08, 0.5], kR: [0.24 + s * 0.08, 0.5], jump: Math.max(0, Math.sin(t * 16)) * 0.05,
      });
    }
    case 'bow': {
      const k = Math.sin(Math.min(1, t / 1.4) * Math.PI);
      return P({ neck: [0, 1.52 - k * 0.4], head: [0, 1.71 - k * 0.55], sL: [-0.23, 1.46 - k * 0.38], sR: [0.23, 1.46 - k * 0.38], eL: [-0.56, 1.2 - k * 0.1], hL: [-0.8, 1.05 + k * 0.2], eR: [0.42, 1.1 - k * 0.2], hR: [0.1, 0.98 - k * 0.1] });
    }
    default: return P({});
  }
}

const mix = (a, b, k) => a + (b - a) * k;

/** Moves pose `from` toward `to` by k (0…1). The ball is not blended in from nothing. */
export function blend(from, to, k) {
  if (!from) return to;
  const out = {};
  for (const key of Object.keys(base)) {
    const a = from[key], b = to[key];
    if (key === 'jump') out.jump = mix(a, b, k);
    else if (!b) out[key] = null;
    else if (!a) out[key] = b;
    else out[key] = [mix(a[0], b[0], k), mix(a[1], b[1], k)];
  }
  return out;
}

/**
 * Draws the player with the spot between the feet at (x, y) and s pixels per metre.
 * opts: {ball: show the held ball, spin, fire, shadow}
 */
export function drawPlayer(ctx, x, y, s, pose, look, opts = {}) {
  const j = pose.jump || 0;
  const q = ([a, b], lift = j) => [x + a * s, y - (b + lift) * s];
  const skin = SKINS[look.skin] || SKINS.s2;
  const hair = HAIRS[look.hairColor] || HAIRS.black;
  const kit = JERSEYS[look.jersey] || JERSEYS.classic;
  const shoe = SHOES[look.shoes] || SHOES.classic;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const seg = (a, b, w, color) => { ctx.strokeStyle = color; ctx.lineWidth = w * s; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };
  const disc = (c, r, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(c[0], c[1], r * s, 0, Math.PI * 2); ctx.fill(); };
  const shape = (pts, color) => { ctx.fillStyle = color; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); };

  if (opts.shadow !== false) {
    ctx.fillStyle = `rgba(0,0,0,${0.34 - j * 0.5})`;
    ctx.beginPath(); ctx.ellipse(x, y, (0.46 - j * 0.3) * s, 0.1 * s, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (opts.fire) {
    const c = q(pose.neck);
    const g = ctx.createRadialGradient(c[0], c[1] + 0.2 * s, 0.1 * s, c[0], c[1] + 0.2 * s, 1.25 * s);
    g.addColorStop(0, 'rgba(255,150,20,.5)'); g.addColorStop(1, 'rgba(255,40,0,0)');
    ctx.fillStyle = g; ctx.fillRect(c[0] - 1.3 * s, c[1] - 1.1 * s, 2.6 * s, 2.6 * s);
  }
  const heldBall = opts.ball !== false && pose.ball;
  const ballXY = heldBall ? q(pose.ball) : null;
  // a ball beside the body but low is behind the arm, so it goes first
  const hip = q(pose.hip), neck = q(pose.neck), head = q(pose.head);
  const sL = q(pose.sL), sR = q(pose.sR);

  // legs, socks and shoes
  for (const side of ['L', 'R']) {
    const dir = side === 'L' ? -1 : 1;
    const h = [hip[0] + dir * 0.12 * s, hip[1] + 0.02 * s];
    const k = q(pose['k' + side]), f = q(pose['f' + side]);
    seg(h, k, 0.17, skin);
    seg(k, f, 0.115, skin);
    const sockTop = [mix(k[0], f[0], 0.45), mix(k[1], f[1], 0.45)];
    seg(sockTop, [f[0], f[1] - 0.04 * s], 0.12, '#f7f5f0');
    seg([mix(sockTop[0], f[0], 0.05) - 0.055 * s, mix(sockTop[1], f[1], 0.08)], [mix(sockTop[0], f[0], 0.05) + 0.055 * s, mix(sockTop[1], f[1], 0.08)], 0.022, kit.main);
    ctx.fillStyle = shoe.sole;
    ctx.beginPath(); ctx.ellipse(f[0], f[1] + 0.02 * s, 0.105 * s, 0.062 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shoe.top;
    ctx.beginPath(); ctx.ellipse(f[0], f[1] - 0.012 * s, 0.092 * s, 0.062 * s, 0, 0, Math.PI * 2); ctx.fill();
    seg([f[0], f[1] - 0.055 * s], [f[0], f[1] + 0.01 * s], 0.026, shoe.sole);
  }

  // shorts
  const knee = (side) => q(pose['k' + side]);
  const hem = (side, dir) => { const k = knee(side); const h = [hip[0] + dir * 0.12 * s, hip[1]]; return [mix(h[0], k[0], 0.74), mix(h[1], k[1], 0.74)]; };
  const hemL = hem('L', -1), hemR = hem('R', 1);
  shape([[hip[0] - 0.2 * s, hip[1] - 0.1 * s], [hip[0] + 0.2 * s, hip[1] - 0.1 * s], [hemR[0] + 0.13 * s, hemR[1]], [hemR[0] - 0.1 * s, hemR[1] + 0.02 * s], [hip[0], hip[1] + 0.15 * s], [hemL[0] + 0.1 * s, hemL[1] + 0.02 * s], [hemL[0] - 0.13 * s, hemL[1]]], kit.main);
  seg([hip[0] - 0.19 * s, hip[1] - 0.07 * s], [hemL[0] - 0.105 * s, hemL[1] - 0.015 * s], 0.035, kit.trim);
  seg([hip[0] + 0.19 * s, hip[1] - 0.07 * s], [hemR[0] + 0.105 * s, hemR[1] - 0.015 * s], 0.035, kit.trim);
  seg([hip[0], hip[1] - 0.04 * s], [hip[0], hip[1] + 0.12 * s], 0.012, kit.dark);

  // torso
  const torso = () => {
    ctx.beginPath();
    ctx.moveTo(sL[0] - 0.01 * s, sL[1] - 0.05 * s);
    ctx.quadraticCurveTo(neck[0], neck[1] - 0.04 * s, sR[0] + 0.01 * s, sR[1] - 0.05 * s);
    ctx.quadraticCurveTo(sR[0] - 0.02 * s, sR[1] + 0.12 * s, sR[0] + 0.03 * s, sR[1] + 0.2 * s);
    ctx.quadraticCurveTo(hip[0] + 0.17 * s, (sR[1] + hip[1]) / 2, hip[0] + 0.2 * s, hip[1] - 0.08 * s);
    ctx.lineTo(hip[0] - 0.2 * s, hip[1] - 0.08 * s);
    ctx.quadraticCurveTo(hip[0] - 0.17 * s, (sL[1] + hip[1]) / 2, sL[0] - 0.03 * s, sL[1] + 0.2 * s);
    ctx.quadraticCurveTo(sL[0] + 0.02 * s, sL[1] + 0.12 * s, sL[0] - 0.01 * s, sL[1] - 0.05 * s);
    ctx.closePath();
  };
  disc([sL[0], sL[1] + 0.03 * s], 0.09, skin);
  disc([sR[0], sR[1] + 0.03 * s], 0.09, skin);
  torso(); ctx.fillStyle = kit.main; ctx.fill();
  ctx.save(); torso(); ctx.clip();
  if (kit.stripes) for (let i = -5; i <= 5; i++) seg([neck[0] + i * 0.085 * s, neck[1] - 0.2 * s], [hip[0] + i * 0.085 * s, hip[1]], 0.011, 'rgba(255,255,255,.55)');
  if (kit.yoke) { seg([sL[0] - 0.1 * s, sL[1] + 0.04 * s], [sR[0] + 0.1 * s, sR[1] + 0.04 * s], 0.085, kit.trim); seg([sL[0] - 0.1 * s, sL[1] + 0.12 * s], [sR[0] + 0.1 * s, sR[1] + 0.12 * s], 0.022, kit.trim); }
  seg([hip[0] - 0.21 * s, hip[1] - 0.09 * s], [hip[0] + 0.21 * s, hip[1] - 0.09 * s], 0.05, kit.trim);
  ctx.restore();
  torso(); ctx.strokeStyle = kit.trim; ctx.lineWidth = 0.025 * s; ctx.stroke();
  // name and the number zero
  const chest = [mix(neck[0], hip[0], 0.5), mix(neck[1], hip[1], 0.5)];
  const squash = Math.min(1.15, Math.max(0.6, (hip[1] - neck[1]) / (0.56 * s)));
  ctx.save();
  ctx.translate(chest[0], chest[1]);
  ctx.rotate(Math.atan2(neck[0] - hip[0], hip[1] - neck[1]));
  ctx.scale(1, squash);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = kit.trim;
  ctx.font = `900 ${Math.max(5, 0.082 * s)}px "Arial Black", Impact, system-ui, sans-serif`;
  ctx.fillText(kit.name || 'ZERO', 0, -0.13 * s);
  if (kit.letter) {
    ctx.font = `900 ${Math.max(6, 0.23 * s)}px "Arial Black", Impact, system-ui, sans-serif`;
    ctx.fillText(kit.letter, 0, 0.06 * s);
  } else {
    ctx.strokeStyle = kit.trim; ctx.lineWidth = 0.056 * s;
    ctx.beginPath(); ctx.ellipse(0, 0.055 * s, 0.071 * s, 0.105 * s, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = kit.dark; ctx.lineWidth = Math.max(0.5, 0.008 * s);
    for (const [rx, ry] of [[0.101, 0.135], [0.041, 0.075]]) { ctx.beginPath(); ctx.ellipse(0, 0.055 * s, rx * s, ry * s, 0, 0, Math.PI * 2); ctx.stroke(); }
  }
  ctx.restore();

  if (heldBall && pose.ball[1] < 1) drawBallAt(ctx, ballXY[0], ballXY[1], BALL_R * s, opts.spin || 0, look.ball, opts.fire);

  // arms
  for (const side of ['L', 'R']) {
    const sh = side === 'L' ? sL : sR, e = q(pose['e' + side]), h = q(pose['h' + side]);
    seg(sh, e, 0.12, skin);
    seg(e, h, 0.092, skin);
    disc(h, 0.062, skin);
    if (side === 'R') seg([mix(e[0], h[0], 0.78), mix(e[1], h[1], 0.78)], [mix(e[0], h[0], 0.86), mix(e[1], h[1], 0.86)], 0.098, '#f7f5f0');
  }

  // neck and head
  seg([neck[0], neck[1]], [head[0], head[1] + 0.06 * s], 0.11, skin);
  disc([head[0] - 0.125 * s, head[1] + 0.012 * s], 0.032, skin);
  disc([head[0] + 0.125 * s, head[1] + 0.012 * s], 0.032, skin);
  disc(head, 0.128, skin);
  drawHair(ctx, head, s, look.hair, hair);
  if (look.band !== 'none') {
    const bandColor = look.band === 'white' ? '#ffffff' : '#d3182f';
    const by = head[1] - 0.025 * s;
    const w = look.hair === 'afro' ? 0.17 : 0.13;
    ctx.strokeStyle = bandColor; ctx.lineWidth = 0.045 * s;
    ctx.beginPath(); ctx.moveTo(head[0] - w * s, by); ctx.quadraticCurveTo(head[0], by + 0.045 * s, head[0] + w * s, by); ctx.stroke();
    if (look.band === 'stripes') { ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.012 * s; ctx.stroke(); }
    // the knot ends
    seg([head[0] + 0.01 * s, by + 0.025 * s], [head[0] + 0.05 * s, by + 0.1 * s], 0.022, bandColor);
    seg([head[0] - 0.01 * s, by + 0.025 * s], [head[0] - 0.035 * s, by + 0.09 * s], 0.022, bandColor);
  }

  if (heldBall && pose.ball[1] >= 1) drawBallAt(ctx, ballXY[0], ballXY[1], BALL_R * s, opts.spin || 0, look.ball, opts.fire);
  ctx.restore();
}

function drawHair(ctx, head, s, style, color) {
  const [x, y] = head;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  if (style === 'afro') {
    ctx.beginPath(); ctx.arc(x, y - 0.045 * s, 0.17 * s, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 0.16 * s, y - 0.045 * s + Math.sin(a) * 0.16 * s, 0.035 * s, 0, Math.PI * 2); ctx.fill(); }
  } else if (style === 'buzz') {
    ctx.globalAlpha *= 0.72;
    ctx.beginPath(); ctx.arc(x, y - 0.006 * s, 0.127 * s, Math.PI * 0.86, Math.PI * 2.14); ctx.quadraticCurveTo(x, y + 0.11 * s, x - 0.114 * s, y + 0.05 * s); ctx.fill();
    ctx.globalAlpha /= 0.72;
  } else {
    ctx.beginPath(); ctx.arc(x, y - 0.018 * s, 0.137 * s, Math.PI * 0.84, Math.PI * 2.16); ctx.quadraticCurveTo(x, y + 0.13 * s, x - 0.12 * s, y + 0.05 * s); ctx.fill();
    if (style === 'braids') {
      ctx.lineWidth = 0.032 * s;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath(); ctx.moveTo(x + i * 0.034 * s, y + 0.02 * s);
        ctx.quadraticCurveTo(x + i * 0.05 * s, y + 0.12 * s, x + i * 0.046 * s, y + (0.2 - Math.abs(i) * 0.012) * s);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 0.008 * s;
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(x + i * 0.045 * s, y - 0.14 * s); ctx.quadraticCurveTo(x + i * 0.06 * s, y - 0.04 * s, x + i * 0.04 * s, y + 0.04 * s); ctx.stroke(); }
    }
  }
}
