/**
 * metrics.js — logica pura per Face Lab (nessun DOM, testabile in Node).
 * Mappa 68 punti, catene, EAR/blink, head pose, emozioni e box del volto.
 */

export const M68 = [
  162, 127, 234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379,
  70, 63, 105, 66, 107, 336, 296, 334, 293, 300,
  168, 197, 5, 4, 237, 6, 195, 3, 64,
  33, 160, 158, 133, 153, 144, 362, 385, 387, 263, 373, 380,
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409,
  78, 95, 88, 178, 87, 14, 317, 402
];

export const CHAINS = {
  jaw: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  browL: [17, 18, 19, 20, 21], browR: [22, 23, 24, 25, 26],
  nose: [27, 28, 29, 30], noseL: [31, 32, 33, 34, 35], noseSide: [27, 31], nose2: [30, 35],
  eyeL: [36, 37, 38, 39, 40, 41, 36], eyeR: [42, 43, 44, 45, 46, 47, 42],
  mouthOuter: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 48],
  mouthInner: [60, 61, 62, 63, 64, 65, 66, 67, 60],
  connectors: [[21, 17], [26, 22], [36, 17], [42, 26], [30, 48], [27, 33], [33, 50], [33, 58], [8, 57], [8, 51]]
};

export const BLINK_EYE = [33, 160, 158, 133, 153, 144];
export const BLINK_EYER = [362, 385, 387, 263, 373, 380];
export const EYE_L = [33, 133];
export const EYE_R = [362, 263];
export const NOSE_TIP = 1;
export const MOUTH_TOP = 13;
export const MOUTH_BOT = 14;
export const LIP_CENTER = 0;
export const FACE_LEFT = 234;
export const FACE_RIGHT = 454;

/** Specchio globale: determina il verso delle x nelle funzioni di proiezione. */
export let mirrorEnabled = true;
export function setMirror(value) { mirrorEnabled = !!value; }

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const clamp01 = (v) => clamp(Number(v) || 0, 0, 1);
export const lerp = (a, b, t) => a + (b - a) * t;
const mathMax1 = (v) => Math.max(1e-4, v);

export function blendScore(categories, name) {
  if (!Array.isArray(categories) || !categories.length) return 0;
  const item = categories.find((c) => c && c.categoryName === name);
  return item ? Number(item.score) || 0 : 0;
}

export function eyeAspectRatio(points) {
  if (!points || points.length < 6) return 0;
  const [a, b, c, d, e, f] = points;
  const top = Math.hypot(b[0] - f[0], b[1] - f[1]) + Math.hypot(c[0] - e[0], c[1] - e[1]);
  const bottom = 2 * Math.hypot(a[0] - d[0], a[1] - d[1]);
  return bottom > 0 ? top / bottom : 0;
}

export function blinkScore(earL, earR, blend = 0) {
  return clamp01(Math.max(blend, 1 - earL * 3.4, 1 - earR * 3.4));
}

export function classifyEmotion(scores) {
  const candidates = [
    ['happy', scores.smile, 0.45],
    ['surprised', Math.min(1, scores.brow + 0.5) * 0.5 + (scores.jawOpen || 0) * 0.5, 0.55],
    ['angry', scores.browDown * 0.6 + scores.frown * 0.4, 0.5],
    ['sad', scores.frown * 0.7 + (1 - scores.brow) * 0.3, 0.5],
    ['wink', scores.wink ? 1 : 0, 0.6]
  ];
  let emotion = 'neutral', best = 0;
  for (const [name, value] of candidates) {
    if (value > best) { best = value; emotion = name; }
  }
  if (best < 0.45) emotion = 'neutral';
  return { emotion, confidence: clamp01(best) };
}

export function poseFromLandmarks(lm, matrix) {
  if (!lm || !lm.length) return { yaw: 0, pitch: 0, roll: 0 };
  let yaw = Math.asin(clamp01((lm[1].x - (lm[FACE_LEFT].x + lm[FACE_RIGHT].x) / 2) /
    (mathMax1(Math.hypot(lm[FACE_RIGHT].x - lm[FACE_LEFT].x, lm[FACE_RIGHT].y - lm[FACE_LEFT].y)) * 0.7)) * 2 - 1);
  const eyeY = (lm[33].y + lm[263].y) / 2;
  const noseEye = lm[1].y - eyeY;
  const mouthNoseY = lm[13].y - lm[1].y;
  let pitch = Math.asin(clamp((noseEye / mathMax1(mouthNoseY) - 0.62) / 0.5, -1, 1));
  let roll = Math.atan2(lm[263].y - lm[33].y, lm[263].x - lm[33].x);
  if (matrix && matrix.length >= 11) {
    yaw = Math.atan2(matrix[1], matrix[0]);
    pitch = Math.asin(clamp(-matrix[2], -1, 1));
    roll = Math.atan2(matrix[6], matrix[10]);
  }
  return { yaw, pitch, roll };
}

/** Calcola tutte le metriche da landmark, blendshape e matrice (coordinate raw). */
export function faceMetrics(lm, categories, matrix) {
  if (!lm || !lm.length) {
    return { blink: 0, smile: 0, brow: 0, jawOpen: 0, mNose: 0, pose: { yaw: 0, pitch: 0, roll: 0 }, emotion: 'neutral', earL: 0, earR: 0 };
  }
  const b = (name) => blendScore(categories, name);
  const earL = eyeAspectRatio(BLINK_EYE.map((i) => [lm[i].x, lm[i].y]));
  const earR = eyeAspectRatio(BLINK_EYER.map((i) => [lm[i].x, lm[i].y]));
  const blinkBlend = Math.max(b('eyeBlinkLeft'), b('eyeBlinkRight'));
  const blink = blinkScore(earL, earR, blinkBlend);
  const smile = clamp01(Math.max(b('mouthSmileLeft'), b('mouthSmileRight')));
  const brow = clamp01(b('browInnerUp') + Math.max(b('browOuterUpLeft'), b('browOuterUpRight')));
  const jawOpen = clamp01(b('jawOpen'));
  const faceW = mathMax1(Math.hypot(lm[FACE_LEFT].x - lm[FACE_RIGHT].x, lm[FACE_LEFT].y - lm[FACE_RIGHT].y));
  const mNose = Math.abs(lm[13].y - lm[1].y) / faceW;
  const wink = blinkBlend > 0.6 && Math.min(b('eyeBlinkLeft'), b('eyeBlinkRight')) < 0.3;
  const { emotion } = classifyEmotion({
    smile, brow, jawOpen, wink,
    browDown: Math.max(b('browDownLeft'), b('browDownRight')),
    frown: Math.max(b('mouthFrownLeft'), b('mouthFrownRight'))
  });
  return { blink, smile, brow, jawOpen, mNose, pose: poseFromLandmarks(lm, matrix), emotion, earL, earR };
}

/** Box normalizzato del volto con margine, rispettando lo specchio. */
export function faceBox(lm, mirror = mirrorEnabled, count = 478) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < Math.min(count, lm.length); i += 1) {
    const x = mirror ? 1 - lm[i].x : lm[i].x;
    const y = lm[i].y;
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  if (!Number.isFinite(minX)) return { cx: 0.5, cy: 0.5, w: 0.3, h: 0.4 };
  return {
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    w: Math.max(0.02, (maxX - minX) * 1.25),
    h: Math.max(0.02, (maxY - minY) * 1.3)
  };
}

/** Converte il box normalizzato in pixel CSS usando il layout del viewfinder. */
export function boxToScreen(box, layout) {
  const { offX, offY, drawW, drawH } = layout;
  const w = box.w * drawW, h = box.h * drawH;
  return {
    x: offX + box.cx * drawW - w / 2,
    y: offY + box.cy * drawH - h / 2,
    w, h,
    cx: offX + box.cx * drawW,
    cy: offY + box.cy * drawH
  };
}

export function chainOf(index) {
  for (const key of Object.keys(CHAINS)) {
    if (key !== 'connectors' && CHAINS[key].includes(index)) return key;
  }
  return 'jaw';
}

/** Punto di un landmark in coordinate schermo. */
export function lmToScreen(lm, index, layout, mirror = mirrorEnabled) {
  const x = mirror ? 1 - lm[index].x : lm[index].x;
  return { x: layout.offX + x * layout.drawW, y: layout.offY + lm[index].y * layout.drawH };
}
