/* Neural Style Studio — pure image/tensor helpers (DOM-free, Node-testable) */

export const clamp = (v, min = 0, max = 255) => Math.max(min, Math.min(max, v));

export function rgbToYcc(r, g, b) {
  return [0.299 * r + 0.587 * g + 0.114 * b, b - r, r - g];
}

export function yccToRgb(y, cb, cr) {
  return [y + cr, y - (0.344136 * cb + 0.714136 * cr), y + 1.772 * cb];
}

export function imageStats(rgba) {
  const n = rgba.length / 4;
  const sum = [0, 0, 0];
  const sq = [0, 0, 0];
  for (let i = 0; i < rgba.length; i += 4) {
    const [y, cb, cr] = rgbToYcc(rgba[i], rgba[i + 1], rgba[i + 2]);
    sum[0] += y; sum[1] += cb; sum[2] += cr;
    sq[0] += y * y; sq[1] += cb * cb; sq[2] += cr * cr;
  }
  const mean = sum.map(v => v / n);
  const std = mean.map((m, i) => Math.sqrt(Math.max(1, sq[i] / n - m * m)));
  return { mean, std };
}

export function buildTransfer(content, style) {
  return (y, cb, cr) => {
    const a = [
      (y - content.mean[0]) / content.std[0] * style.std[0] + style.mean[0],
      (cb - content.mean[1]) / content.std[1] * style.std[1] + style.mean[1],
      (cr - content.mean[2]) / content.std[2] * style.std[2] + style.mean[2]
    ];
    return yccToRgb(a[0], a[1], a[2]);
  };
}

export function applyColorTransfer(rgba, transfer, strength = 1) {
  const out = new Uint8ClampedArray(rgba.length);
  const t = Math.max(0, Math.min(1, strength));
  for (let i = 0; i < rgba.length; i += 4) {
    const [r, g, b] = transfer(rgba[i], rgba[i + 1], rgba[i + 2]);
    out[i] = clamp(rgba[i] + (r - rgba[i]) * t);
    out[i + 1] = clamp(g + (g - rgba[i + 1]) * t);
    out[i + 2] = clamp(b + (b - rgba[i + 2]) * t);
    out[i + 3] = rgba[i + 3];
  }
  return out;
}

export function coverCrop(sw, sh, size) {
  const scale = Math.max(size / sw, size / sh);
  const w = sw * scale;
  const h = sh * scale;
  return { sx: (w - size) / 2 / scale, sy: (h - size) / 2 / scale, sw: size / scale, sh: size / scale };
}

/* Uint8ClampedArray RGBA -> Float32Array [1,3,H,W] in [0,255] */
export function toNchw(rgba, size) {
  const out = new Float32Array(3 * size * size);
  const plane = size * size;
  for (let i = 0, p = 0; i < rgba.length; i += 4, p++) {
    out[p] = rgba[i];
    out[plane + p] = rgba[i + 1];
    out[2 * plane + p] = rgba[i + 2];
  }
  return out;
}

/* Float32Array [1,3,H,W] -> Uint8ClampedArray RGBA */
export function fromNchw(data, size) {
  const out = new Uint8ClampedArray(size * size * 4);
  const plane = size * size;
  for (let p = 0; p < plane; p++) {
    out[p * 4] = clamp(data[p]);
    out[p * 4 + 1] = clamp(data[plane + p]);
    out[p * 4 + 2] = clamp(data[2 * plane + p]);
    out[p * 4 + 3] = 255;
  }
  return out;
}

export function blendMask(base, overlay, mask, strength = 1) {
  const out = new Uint8ClampedArray(base.length);
  for (let i = 0, p = 0; i < base.length; i += 4, p++) {
    const a = (mask[p * 4] / 255) * strength;
    out[i] = base[i] + (overlay[i] - base[i]) * a;
    out[i + 1] = base[i + 1] + (overlay[i + 1] - base[i + 1]) * a;
    out[i + 2] = base[i + 2] + (overlay[i + 2] - base[i + 2]) * a;
    out[i + 3] = 255;
  }
  return out;
}

export function mixWeight(a, b, t) {
  const w = Math.max(0, Math.min(1, t));
  return a * (1 - w) + b * w;
}
