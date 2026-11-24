/* Pixel Studio — pure image filters (no dependencies) */

function clamp(v) { return Math.max(0, Math.min(255, v)); }

export function adjust(data, opts = {}) {
  const b = opts.brightness || 0, c = opts.contrast || 0, s = opts.saturation || 0;
  const h = (opts.hue || 0) * Math.PI / 180;
  const gray = opts.grayscale || 0, sepia = opts.sepia || 0, invert = opts.invert || 0;
  const cf = (259 * (c + 255)) / (255 * (259 - c));
  const cos = Math.cos(h), sin = Math.sin(h);
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], bl = data[i + 2], a = data[i + 3];
    r = cf * (r - 128) + 128 + b;
    g = cf * (g - 128) + 128 + b;
    bl = cf * (bl - 128) + 128 + b;
    if (s || h) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * bl;
      r = lum + (r - lum) * (1 + s / 100);
      g = lum + (g - lum) * (1 + s / 100);
      bl = lum + (bl - lum) * (1 + s / 100);
      if (h) {
        const nr = cos * r - sin * g, ng = sin * r + cos * g;
        r = nr; g = ng;
      }
    }
    if (gray) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * bl;
      r = r + (lum - r) * gray / 100;
      g = g + (lum - g) * gray / 100;
      bl = bl + (lum - bl) * gray / 100;
    }
    if (sepia) {
      const sr = 0.393 * r + 0.769 * g + 0.189 * bl;
      const sg = 0.349 * r + 0.686 * g + 0.168 * bl;
      const sb = 0.272 * r + 0.534 * g + 0.131 * bl;
      r += (sr - r) * sepia / 100; g += (sg - g) * sepia / 100; bl += (sb - bl) * sepia / 100;
    }
    if (invert) { r = r + (255 - r - r) * invert / 100; g = g + (255 - g - g) * invert / 100; bl = bl + (255 - bl - bl) * invert / 100; }
    out[i] = clamp(r); out[i + 1] = clamp(g); out[i + 2] = clamp(bl); out[i + 3] = a;
  }
  return out;
}

export function boxBlur(data, w, h, radius = 2) {
  if (radius < 1) return new Uint8ClampedArray(data);
  const r = Math.min(8, Math.round(radius));
  const out = new Uint8ClampedArray(data.length);
  const tmp = new Uint8ClampedArray(data.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = [0, 0, 0, 0], n = 0;
      for (let k = -r; k <= r; k++) {
        const xx = Math.max(0, Math.min(w - 1, x + k));
        const i = (y * w + xx) * 4;
        sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2]; sum[3] += data[i + 3];
        n++;
      }
      const o = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) tmp[o + c] = sum[c] / n;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = [0, 0, 0, 0], n = 0;
      for (let k = -r; k <= r; k++) {
        const yy = Math.max(0, Math.min(h - 1, y + k));
        const i = (yy * w + x) * 4;
        sum[0] += tmp[i]; sum[1] += tmp[i + 1]; sum[2] += tmp[i + 2]; sum[3] += tmp[i + 3];
        n++;
      }
      const o = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) out[o + c] = sum[c] / n;
    }
  }
  return out;
}

export function sharpen(data, w, h, amount = 30) {
  const blurred = boxBlur(data, w, h, 1);
  const out = new Uint8ClampedArray(data.length);
  const k = amount / 100;
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) out[i + c] = clamp(data[i + c] + (data[i + c] - blurred[i + c]) * k);
    out[i + 3] = data[i + 3];
  }
  return out;
}

export function pixelate(data, w, h, block = 6) {
  const out = new Uint8ClampedArray(data.length);
  const b = Math.max(2, Math.round(block));
  for (let by = 0; by < h; by += b) {
    for (let bx = 0; bx < w; bx += b) {
      let sum = [0, 0, 0, 0], n = 0;
      for (let y = by; y < Math.min(h, by + b); y++) {
        for (let x = bx; x < Math.min(w, bx + b); x++) {
          const i = (y * w + x) * 4;
          sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2]; sum[3] += data[i + 3]; n++;
        }
      }
      for (let y = by; y < Math.min(h, by + b); y++) {
        for (let x = bx; x < Math.min(w, bx + b); x++) {
          const i = (y * w + x) * 4;
          for (let c = 0; c < 4; c++) out[i + c] = sum[c] / n;
        }
      }
    }
  }
  return out;
}

export function applyToContext(ctx, fn) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const img = ctx.getImageData(0, 0, w, h);
  img.data.set(fn(img.data, w, h));
  ctx.putImageData(img, 0, 0);
}
