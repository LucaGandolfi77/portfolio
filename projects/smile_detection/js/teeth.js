/**
 * teeth.js — stima giocosa di bianchezza e allineamento (pura, LAB).
 */

export const INNER_LIPS = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 12, 13, 82, 81, 80, 191];
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
export const clamp01 = (value) => clamp(value, 0, 1);

export function rgbToLab(r, g, b) {
  const srgb = [r, g, b].map((value) => {
    const channel = (Number(value) || 0) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const x = (srgb[0] * 0.4124 + srgb[1] * 0.3576 + srgb[2] * 0.1805) / 0.95047;
  const y = srgb[0] * 0.2126 + srgb[1] * 0.7152 + srgb[2] * 0.0722;
  const z = (srgb[0] * 0.0193 + srgb[1] * 0.1192 + srgb[2] * 0.9505) / 1.08883;
  const f = (value) => value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
  const fx = f(x), fy = f(y), fz = f(z);
  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/** Box delle labbra interne in pixel. */
export function mouthBox(landmarks, width, height, indices = INNER_LIPS, padding = 4) {
  if (!Array.isArray(landmarks) || !width || !height) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const index of indices) {
    const point = landmarks[index];
    if (!point) continue;
    const x = point.x * width, y = point.y * height;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  if (!Number.isFinite(minX)) return null;
  const box = {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    w: Math.min(width - Math.max(0, minX - padding), maxX - minX + padding * 2),
    h: Math.min(height - Math.max(0, minY - padding), maxY - minY + padding * 2)
  };
  return box.w >= 6 && box.h >= 4 ? box : null;
}

/**
 * Analizza i pixel del crop della bocca (RGBA).
 * @returns {{whiteness:number, alignment:number, teethRatio:number, quality:number}}
 */
export function analyzeTeeth(pixels, width, height) {
  const total = width * height;
  if (!pixels || pixels.length < total * 4 || !total) {
    return { whiteness: 0, alignment: 0, teethRatio: 0, quality: 0 };
  }
  const luminance = new Float32Array(total);
  const chroma = new Float32Array(total);
  let sum = 0;
  for (let i = 0; i < total; i += 1) {
    const at = i * 4;
    const lab = rgbToLab(pixels[at], pixels[at + 1], pixels[at + 2]);
    luminance[i] = lab.l;
    chroma[i] = Math.hypot(lab.a, lab.b);
    sum += lab.l;
  }
  const meanL = sum / total;
  const threshold = Math.min(96, meanL * 1.35);
  let teeth = 0, lightSum = 0, chromaSum = 0;
  const teethLine = new Float32Array(width).fill(-1);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      if (luminance[i] > threshold && chroma[i] < 32) {
        teeth += 1;
        lightSum += luminance[i];
        chromaSum += chroma[i];
        if (teethLine[x] < 0) teethLine[x] = y / height;
      }
    }
  }
  const ratio = teeth / total;
  const quality = clamp01(ratio / 0.1);
  if (teeth < Math.max(12, total * 0.015)) {
    return { whiteness: 0, alignment: 0, teethRatio: ratio, quality: 0 };
  }
  const averageL = lightSum / teeth;
  const averageChroma = chromaSum / teeth;
  const whiteness = clamp01(((averageL - 55) / 40) * 0.8 + (1 - clamp01(averageChroma / 30)) * 0.2);

  const points = [];
  for (let x = 0; x < width; x += 1) if (teethLine[x] >= 0) points.push({ x, y: teethLine[x] });
  let alignment = 0;
  if (points.length > 4) {
    const meanX = points.reduce((acc, point) => acc + point.x, 0) / points.length;
    const meanY = points.reduce((acc, point) => acc + point.y, 0) / points.length;
    let numerator = 0, denominator = 0;
    for (const point of points) {
      numerator += (point.x - meanX) * (point.y - meanY);
      denominator += (point.x - meanX) ** 2;
    }
    const slope = denominator > 0 ? numerator / denominator : 0;
    const intercept = meanY - slope * meanX;
    const residual = points.reduce((acc, point) => acc + (point.y - (slope * point.x + intercept)) ** 2, 0) / points.length;
    alignment = clamp01(1 - Math.sqrt(residual) * 7);
  }
  return { whiteness, alignment, teethRatio: ratio, quality };
}
