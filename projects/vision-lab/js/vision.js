/**
 * vision.js — logica pura per Vision Lab.
 * Landmark metrics, blink/smile, head pose, emozioni e analisi dei denti.
 * Nessuna dipendenza dal DOM: testabile in Node.
 */

export const EYE_LEFT = [33, 160, 158, 133, 153, 144];
export const EYE_RIGHT = [362, 385, 387, 263, 373, 380];

export const INNER_LIPS = [
  78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 12, 13, 82, 81, 80, 191
];

export const MOUTH_LEFT = 61;
export const MOUTH_RIGHT = 291;
export const FACE_LEFT = 234;
export const FACE_RIGHT = 454;
export const NOSE_TIP = 1;
export const CHIN = 152;
export const FOREHEAD = 10;

export const EMOTION_EMOJI = {
  neutral: '😐',
  happy: '😄',
  surprised: '😮',
  angry: '😠',
  sad: '🙁',
  wink: '😉'
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function clamp01(value) {
  return clamp(Number(value) || 0, 0, 1);
}

export function toDegrees(radians) {
  return (Number(radians) * 180) / Math.PI;
}

export function blendScores(categories) {
  const out = {};
  if (!Array.isArray(categories)) return out;
  for (const item of categories) {
    if (!item || !item.categoryName) continue;
    out[item.categoryName] = Number(item.score) || 0;
  }
  return out;
}

function point(landmarks, index) {
  const item = landmarks && landmarks[index];
  if (!item) return { x: 0, y: 0, z: 0 };
  return {
    x: Number(item.x) || 0,
    y: Number(item.y) || 0,
    z: Number(item.z) || 0
  };
}

export function eyeAspectRatio(points) {
  if (!points || points.length < 6) return 0;
  const [p1, p2, p3, p4, p5, p6] = points;
  const horizontal = Math.hypot(p1.x - p4.x, p1.y - p4.y);
  if (horizontal < 1e-6) return 0;
  const verticalA = Math.hypot(p2.x - p6.x, p2.y - p6.y);
  const verticalB = Math.hypot(p3.x - p5.x, p3.y - p5.y);
  return (verticalA + verticalB) / (2 * horizontal);
}

export function poseFromMatrix(matrix) {
  if (!matrix || typeof matrix.length !== 'number' || matrix.length < 11) return null;
  const [r00, r10, r20] = [matrix[0], matrix[1], matrix[2]];
  const r21 = matrix[6];
  const r22 = matrix[10];
  return {
    yaw: toDegrees(Math.atan2(r10, r00)),
    pitch: toDegrees(Math.asin(clamp(-r20, -1, 1))),
    roll: toDegrees(Math.atan2(r21, r22))
  };
}

function poseFromLandmarks(landmarks) {
  const leftEye = point(landmarks, 33);
  const rightEye = point(landmarks, 263);
  const nose = point(landmarks, NOSE_TIP);
  const faceLeft = point(landmarks, FACE_LEFT);
  const faceRight = point(landmarks, FACE_RIGHT);
  const mouth = point(landmarks, 13);
  const chin = point(landmarks, CHIN);

  const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
  const faceWidth = Math.hypot(faceRight.x - faceLeft.x, faceRight.y - faceLeft.y);
  const midX = (faceLeft.x + faceRight.x) / 2;
  const yaw = Math.asin(clamp((nose.x - midX) / Math.max(1e-4, faceWidth * 0.7), -1, 1));

  const eyeY = (leftEye.y + rightEye.y) / 2;
  const noseEye = nose.y - eyeY;
  const noseMouth = Math.max(1e-4, mouth.y - nose.y);
  const chinNose = Math.max(1e-4, chin.y - nose.y);
  const pitch = Math.asin(clamp((noseEye / noseMouth - 0.62) / 0.5, -1, 1));

  return {
    yaw: toDegrees(yaw),
    pitch: toDegrees(pitch),
    roll: toDegrees(roll)
  };
}

export function emotionFrom({ smile, brow, blink, jawOpen, blend, wink }) {
  const candidates = [
    ['happy', smile, 0.45],
    ['surprised', Math.min(1, brow + 0.5) * 0.5 + clamp01(jawOpen) * 0.5, 0.55],
    [
      'angry',
      Math.max(blend.browDownLeft || 0, blend.browDownRight || 0) * 0.6 +
        Math.max(blend.mouthFrownLeft || 0, blend.mouthFrownRight || 0) * 0.4,
      0.5
    ],
    [
      'sad',
      Math.max(blend.mouthFrownLeft || 0, blend.mouthFrownRight || 0) * 0.7 + (1 - brow) * 0.3,
      0.5
    ],
    ['wink', wink, 0.6]
  ];
  let emotion = 'neutral';
  let confidence = 0;
  for (const [name, score, threshold] of candidates) {
    const value = Number(score) || 0;
    if (value > confidence) {
      confidence = value;
      emotion = value >= threshold ? name : 'neutral';
    }
  }
  return { emotion, confidence: clamp01(confidence) };
}

/**
 * Metriche facciali a partire da 478 landmark e 52 blendshapes.
 * @returns {{blink:number,smile:number,brow:number,jawOpen:number,blend:object,earL:number,earR:number,pose:{yaw:number,pitch:number,roll:number},emotion:string,emotionConfidence:number}}
 */
export function faceMetrics(landmarks, categories, matrix) {
  const blend = blendScores(categories);
  const left = EYE_LEFT.map((index) => point(landmarks, index));
  const right = EYE_RIGHT.map((index) => point(landmarks, index));
  const earL = eyeAspectRatio(left);
  const earR = eyeAspectRatio(right);

  const blinkBlend = Math.max(blend.eyeBlinkLeft || 0, blend.eyeBlinkRight || 0);
  const blink = clamp01(
    Math.max(blinkBlend, 1 - earL * 3.4, 1 - earR * 3.4)
  );

  const smileBlend = Math.max(blend.mouthSmileLeft || 0, blend.mouthSmileRight || 0);
  const jawOpen = clamp01(blend.jawOpen || 0);
  const faceLeft = point(landmarks, FACE_LEFT);
  const faceRight = point(landmarks, FACE_RIGHT);
  const mouthLeft = point(landmarks, MOUTH_LEFT);
  const mouthRight = point(landmarks, MOUTH_RIGHT);
  const faceWidth = Math.hypot(faceRight.x - faceLeft.x, faceRight.y - faceLeft.y);
  const cornerRatio = faceWidth > 0 ? Math.abs(mouthRight.x - mouthLeft.x) / faceWidth : 0;
  const openGate = Math.min(1, jawOpen * 4);
  const smile = clamp01(
    (smileBlend * 0.7 + (cornerRatio - 0.35) * 0.3) * (0.35 + openGate * 0.65)
  );

  const brow = clamp01(
    (blend.browInnerUp || 0) +
      Math.max(blend.browOuterUpLeft || 0, blend.browOuterUpRight || 0)
  );
  const wink =
    blinkBlend > 0.6 && Math.min(blend.eyeBlinkLeft || 0, blend.eyeBlinkRight || 0) < 0.3
      ? 1
      : 0;

  const pose = poseFromMatrix(matrix) || poseFromLandmarks(landmarks);
  const { emotion, confidence } = emotionFrom({ smile, brow, blink, jawOpen, blend, wink });

  return {
    blink,
    smile,
    brow,
    jawOpen,
    blend,
    earL,
    earR,
    pose,
    emotion,
    emotionConfidence: confidence
  };
}

/** Bounding box della bocca in pixel, con margine e clamp. */
export function mouthBox(landmarks, width, height, indices = INNER_LIPS, padding = 6) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  if (!Array.isArray(landmarks) || !w || !h) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const index of indices) {
    const item = point(landmarks, index);
    const x = item.x * w;
    const y = item.y * h;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  if (!Number.isFinite(minX)) return null;
  const box = {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    w: Math.max(0, maxX - minX + padding * 2),
    h: Math.max(0, maxY - minY + padding * 2)
  };
  box.w = Math.min(box.w, w - box.x);
  box.h = Math.min(box.h, h - box.y);
  if (box.w < 4 || box.h < 3) return null;
  return box;
}

function luma(data, index) {
  return data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
}

/**
 * Analizza i pixel della bocca (RGBA) per bianchezza e allineamento.
 * @returns {{whiteness:number,alignment:number,teethRatio:number,teethPixels:number}}
 */
export function analyzeTeethPixels(data, width, height) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const total = w * h;
  if (!data || data.length < total * 4 || total === 0) {
    return { whiteness: 0, alignment: 0, teethRatio: 0, teethPixels: 0 };
  }

  let brightnessSum = 0;
  for (let index = 0; index < data.length; index += 4) {
    brightnessSum += luma(data, index);
  }
  const average = brightnessSum / total;
  const threshold = average * 1.2;

  const columnBrightness = new Float32Array(w);
  const teethLine = new Float32Array(w);
  teethLine.fill(-1);
  let teethPixels = 0;
  let teethSum = 0;

  for (let x = 0; x < w; x += 1) {
    let columnSum = 0;
    for (let y = 0; y < h; y += 1) {
      const index = (y * w + x) * 4;
      const value = luma(data, index);
      columnSum += value;
      if (value > threshold) {
        teethPixels += 1;
        teethSum += value;
        if (teethLine[x] < 0) teethLine[x] = y / h;
      }
    }
    columnBrightness[x] = columnSum / h;
  }

  const teethRatio = teethPixels / total;
  if (teethPixels < Math.max(20, total * 0.02) || teethRatio < 0.02) {
    return { whiteness: 0, alignment: 0, teethRatio, teethPixels };
  }

  const teethAverage = teethSum / teethPixels;
  const whiteness = clamp(((teethAverage - 120) / (255 - 120)) * 100, 0, 100);

  const valid = [];
  for (let x = 0; x < w; x += 1) {
    if (teethLine[x] >= 0) valid.push({ x, y: teethLine[x] });
  }
  if (valid.length < 6) {
    return { whiteness, alignment: 0, teethRatio, teethPixels };
  }

  const meanX = valid.reduce((sum, item) => sum + item.x, 0) / valid.length;
  const meanY = valid.reduce((sum, item) => sum + item.y, 0) / valid.length;
  let numerator = 0;
  let denominator = 0;
  for (const item of valid) {
    numerator += (item.x - meanX) * (item.y - meanY);
    denominator += (item.x - meanX) ** 2;
  }
  const slope = denominator > 0 ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;

  let residual = 0;
  for (const item of valid) {
    residual += (item.y - (slope * item.x + intercept)) ** 2;
  }
  const rms = Math.sqrt(residual / valid.length);
  const straightness = clamp(100 - rms * 800, 0, 100);

  const columnAverage = columnBrightness.reduce((sum, value) => sum + value, 0) / w;
  const gapThreshold = columnAverage * 1.15;
  const gaps = [];
  for (let x = 2; x < w - 2; x += 1) {
    if (
      columnBrightness[x] < columnBrightness[x - 1] &&
      columnBrightness[x] < columnBrightness[x + 1] &&
      columnBrightness[x] < gapThreshold
    ) {
      gaps.push(x);
    }
  }

  let gapRegularity = 50;
  if (gaps.length >= 2) {
    const spacings = [];
    for (let index = 1; index < gaps.length; index += 1) {
      spacings.push(gaps[index] - gaps[index - 1]);
    }
    const mean = spacings.reduce((sum, value) => sum + value, 0) / spacings.length;
    const variance = spacings.reduce((sum, value) => sum + (value - mean) ** 2, 0) / spacings.length;
    const coefficient = Math.sqrt(variance) / (mean || 1);
    gapRegularity = clamp(100 - coefficient * 80, 0, 100);
  }

  return {
    whiteness,
    alignment: clamp(straightness * 0.6 + gapRegularity * 0.4, 0, 100),
    teethRatio,
    teethPixels
  };
}

export function overallStars(score) {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 55) return 3;
  if (score >= 30) return 2;
  return 1;
}

/**
 * Combina metriche facciali e risultato pixel dei denti in un punteggio Smile Lab.
 */
export function smileResult(metrics, teeth = null) {
  const smile = Math.round((metrics ? metrics.smile : 0) * 100);
  const open = Boolean(metrics && metrics.jawOpen > 0.03 && teeth);
  const whiteness = open ? Math.round(teeth.whiteness) : 0;
  const alignment = open ? Math.round(teeth.alignment) : 0;
  const overall = clamp(Math.round(smile * 0.4 + whiteness * 0.3 + alignment * 0.3), 0, 100);
  return {
    smile,
    whiteness,
    alignment,
    overall,
    stars: overallStars(overall),
    teethRatio: teeth ? teeth.teethRatio : 0
  };
}

/** Variante comoda per test e chiamate complete. */
export function analyzeSmile({ landmarks, categories, matrix, pixels, width, height }) {
  const metrics = faceMetrics(landmarks, categories, matrix);
  const box = pixels && width && height ? mouthBox(landmarks, width, height) : null;
  const teeth = box ? analyzeTeethPixels(pixels, width, height) : null;
  return { ...smileResult(metrics, teeth), box, metrics };
}
