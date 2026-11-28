/* ============================================================
   Ultimo Colore — when a colour dies, it leaves the pictures
   ------------------------------------------------------------
   fadePixels is pure; fadedURL redraws a painting with one hue
   drained to grey.
   ============================================================ */

/** Hue ranges in degrees, with a soft edge on both sides. */
export const HUES = { green: [55, 185] };
const SOFT = 20;

function hueOf(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d < 6) return -1;
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

/** 0 outside the range, 1 well inside it. */
export function weight(h, [lo, hi]) {
  if (h < 0) return 0;
  if (h < lo - SOFT || h > hi + SOFT) return 0;
  if (h < lo) return (h - (lo - SOFT)) / SOFT;
  if (h > hi) return (hi + SOFT - h) / SOFT;
  return 1;
}

/** Drains the colour from RGBA pixels in place. amount 0…1. */
export function fadePixels(data, colour = 'green', amount = 1) {
  const range = HUES[colour];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const k = weight(hueOf(r, g, b), range) * amount;
    if (!k) continue;
    const grey = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i] = r + (grey - r) * k;
    data[i + 1] = g + (grey - g) * k;
    data[i + 2] = b + (grey - b) * k;
  }
  return data;
}

const cache = new Map();

/** A faded copy of an image, as a URL. Falls back to the original. */
export function fadedURL(src, colour = 'green') {
  const key = `${colour}:${src}`;
  if (!cache.has(key)) {
    cache.set(key, new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          const ctx = c.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          const d = ctx.getImageData(0, 0, c.width, c.height);
          fadePixels(d.data, colour);
          ctx.putImageData(d, 0, 0);
          c.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : src), 'image/webp', 0.85);
        } catch (e) { resolve(src); }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    }));
  }
  return cache.get(key);
}
