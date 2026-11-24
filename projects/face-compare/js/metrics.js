/**
 * metrics.js — matematica pura per Face Compare.
 * Nessun DOM, nessun MediaPipe: tutto testabile in Node.
 * Le coordinate dei landmark sono normalizzate (0..1) come in MediaPipe.
 */

export const LANDMARK_COUNT = 478;
export const EYE_L = 33;
export const EYE_R = 263;
export const NOSE = 1;
export const CHIN = 152;
export const FACE_L = 234;
export const FACE_R = 454;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}
export function clamp01(value) {
  return clamp(value, 0, 1);
}
export function toDegrees(radians) {
  return (Number(radians) * 180) / Math.PI;
}

export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length || !a.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    const x = Number(a[i]) || 0;
    const y = Number(b[i]) || 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na <= 0 || nb <= 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function normalizeVector(values) {
  if (!values || !values.length) return new Float32Array(0);
  let norm = 0;
  for (const value of values) norm += (Number(value) || 0) ** 2;
  if (norm <= 0) return new Float32Array(values.length);
  const scale = 1 / Math.sqrt(norm);
  return Float32Array.from(values, (v) => (Number(v) || 0) * scale);
}

function point(landmarks, index) {
  const item = landmarks && landmarks[index];
  return item ? { x: Number(item.x) || 0, y: Number(item.y) || 0, z: Number(item.z) || 0 } : null;
}

/** Centro occhi, distanza interoculare e angolo della linea occhi. */
export function faceFrame(landmarks) {
  const left = point(landmarks, EYE_L);
  const right = point(landmarks, EYE_R);
  if (!left || !right) return null;
  const dx = right.x - left.x;
  const dy = right.y - left.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 1e-5) return null;
  return {
    cx: (left.x + right.x) / 2,
    cy: (left.y + right.y) / 2,
    distance,
    angle: Math.atan2(dy, dx)
  };
}

/**
 * Trasformazione di similarità che porta il frame del volto in posa canonica.
 * @returns {{scale:number, angle:number, cx:number, cy:number, size:number}}
 */
export function canonicalTransform(landmarks, size = 256, targetEyeY = 0.38, targetEyeSpan = 0.34) {
  const frame = faceFrame(landmarks);
  if (!frame) return null;
  return {
    scale: (size * targetEyeSpan) / frame.distance,
    angle: frame.angle,
    cx: frame.cx,
    cy: frame.cy,
    size,
    targetX: size / 2,
    targetY: size * targetEyeY
  };
}

/**
 * Descrittore geometrico: landmark 3D ruotati e riscalati sul frame canonico.
 * Invariante a traslazione, scala e (per costruzione) alla posa in piano.
 */
export function landmarkDescriptor(landmarks, length = LANDMARK_COUNT) {
  const frame = faceFrame(landmarks);
  if (!frame) return new Float32Array(length * 3);
  const out = new Float32Array(length * 3);
  const cos = Math.cos(frame.angle);
  const sin = Math.sin(frame.angle);
  const list = Array.isArray(landmarks) ? landmarks : [];
  for (let i = 0; i < Math.min(list.length, length); i += 1) {
    const p = list[i] || { x: 0, y: 0, z: 0 };
    const x = ((Number(p.x) || 0) - frame.cx) / frame.distance;
    const y = ((Number(p.y) || 0) - frame.cy) / frame.distance;
    const z = (Number(p.z) || 0) / frame.distance;
    out[i * 3] = cos * x + sin * y;
    out[i * 3 + 1] = -sin * x + cos * y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/**
 * Griglia di luminanza del volto allineato, standardizzata per luce/contrasto.
 * @param {Uint8ClampedArray|Array} pixels RGBA
 */
export function gridDescriptor(pixels, width, height, grid = 16) {
  const total = width * height;
  if (!pixels || pixels.length < total * 4 || !grid) return new Float32Array(0);
  const cells = new Float32Array(grid * grid);
  const counts = new Float32Array(grid * grid);
  for (let y = 0; y < height; y += 1) {
    const gy = Math.min(grid - 1, Math.floor((y / height) * grid));
    for (let x = 0; x < width; x += 1) {
      const gx = Math.min(grid - 1, Math.floor((x / width) * grid));
      const i = (y * width + x) * 4;
      cells[gy * grid + gx] += pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
      counts[gy * grid + gx] += 1;
    }
  }
  for (let i = 0; i < cells.length; i += 1) cells[i] /= counts[i] || 1;
  let mean = 0;
  for (const value of cells) mean += value;
  mean /= cells.length;
  let variance = 0;
  for (const value of cells) variance += (value - mean) ** 2;
  variance /= cells.length;
  const std = Math.sqrt(variance);
  if (std < 1e-4) return new Float32Array(cells.length);
  for (let i = 0; i < cells.length; i += 1) cells[i] = (cells[i] - mean) / std;
  return cells;
}

/** Estende un coseno grezzo (spesso 0.5..0.95) in un punteggio 0..1 leggibile. */
export function stretchSimilarity(value, low = 0.45, high = 0.95) {
  return clamp01(((Number(value) || 0) - low) / (high - low));
}

export function scoreFromSimilarities(geometry, appearance, geometryWeight = 0.55) {
  const g = stretchSimilarity(geometry);
  const a = stretchSimilarity(appearance);
  const weight = clamp(geometryWeight, 0, 1);
  return clamp01(g * weight + a * (1 - weight));
}

export function confidenceBand(score, medium = 55, high = 75) {
  const value = clamp01((Number(score) || 0) / 100);
  if (value * 100 >= high) return { key: 'high', min: high };
  if (value * 100 >= medium) return { key: 'medium', min: medium };
  return { key: 'low', min: 0 };
}

/** Deviazione standard della luminanza normalizzata (0..1): misura di contrasto. */
export function estimateContrast(pixels, width, height) {
  const total = width * height;
  if (!pixels || pixels.length < total * 4 || !total) return 0;
  let sum = 0, sumSq = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const luma = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
    sum += luma;
    sumSq += luma * luma;
  }
  const mean = sum / total;
  return clamp01(Math.sqrt(Math.max(0, sumSq / total - mean * mean)) / 64);
}

/** Varianza del laplaciano normalizzata: misura di nitidezza (0..1). */
export function estimateSharpness(pixels, width, height) {
  if (!pixels || width < 3 || height < 3) return 0;
  const luma = new Float32Array(width * height);
  for (let i = 0, p = 0; i < pixels.length && p < luma.length; i += 4, p += 1) {
    luma[p] = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
  }
  let sum = 0, sumSq = 0, n = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const lap = 4 * luma[i] - luma[i - 1] - luma[i + 1] - luma[i - width] - luma[i + width];
      sum += lap;
      sumSq += lap * lap;
      n += 1;
    }
  }
  if (!n) return 0;
  const variance = Math.max(0, sumSq / n - (sum / n) ** 2);
  return clamp01(variance / 1200);
}

export function estimateBrightness(pixels, width, height) {
  const total = width * height;
  if (!pixels || pixels.length < total * 4 || !total) return 0;
  let sum = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    sum += pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
  }
  return clamp01(sum / total / 255);
}

/** Stima yaw/pitch/roll dai landmark (gradi). */
export function poseFromLandmarks(landmarks) {
  const frame = faceFrame(landmarks);
  if (!frame) return { yaw: 0, pitch: 0, roll: 0 };
  const nose = point(landmarks, NOSE);
  const chin = point(landmarks, CHIN);
  const left = point(landmarks, FACE_L);
  const right = point(landmarks, FACE_R);
  if (!nose || !chin || !left || !right) return { yaw: 0, pitch: 0, roll: 0 };
  const width = Math.hypot(right.x - left.x, right.y - left.y) || frame.distance * 2;
  const yaw = toDegrees(Math.asin(clamp((nose.x - frame.cx) / (width * 0.6), -1, 1)));
  const eyeToNose = Math.max(1e-4, nose.y - frame.cy);
  const noseToChin = Math.max(1e-4, chin.y - nose.y);
  const pitch = toDegrees(Math.asin(clamp((eyeToNose / noseToChin - 0.62) / 0.6, -1, 1)));
  return { yaw, pitch, roll: toDegrees(frame.angle) };
}

/**
 * Qualità del campione: punteggio 0..1 e codici di avviso.
 * I codici sono stabili e tradotti lato UI.
 */
export function qualityScore({ faceCount = 0, sizeRatio = 0, sharpness = 0, brightness = 0, pose = null } = {}) {
  const flags = [];
  let score = 1;
  if (faceCount === 0) { flags.push('noFace'); score = 0; }
  else {
    if (faceCount > 1) { flags.push('multipleFaces'); score -= 0.25; }
    if (sizeRatio < 0.04) { flags.push('tooSmall'); score -= 0.25; }
    if (sharpness < 0.18) { flags.push('blurry'); score -= 0.2; }
    if (brightness < 0.18) { flags.push('dark'); score -= 0.15; }
    else if (brightness > 0.9) { flags.push('overexposed'); score -= 0.15; }
    if (pose && Math.abs(pose.yaw) > 30) { flags.push('profile'); score -= 0.2; }
  }
  return { score: clamp01(score), flags };
}

export function ema(previous, value, alpha = 0.25) {
  const a = clamp01(alpha);
  if (!Number.isFinite(previous)) return Number(value) || 0;
  return previous * (1 - a) + (Number(value) || 0) * a;
}

export function median(values) {
  if (!Array.isArray(values) || !values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
