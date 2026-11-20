/* Filtri canvas e overlay AI */

let buffer = null;
let bufferCtx = null;

function ensureBuffer(width, height) {
  if (!buffer) {
    buffer = document.createElement('canvas');
    bufferCtx = buffer.getContext('2d', { willReadFrequently: true });
  }
  if (buffer.width !== width || buffer.height !== height) {
    buffer.width = width;
    buffer.height = height;
  }
  return bufferCtx;
}

function drawSource(ctx, video, width, height, opts) {
  ctx.save();
  if (opts.mirror) { ctx.translate(width, 0); ctx.scale(-1, 1); }
  if (opts.digitalZoom && opts.digitalZoom > 1) {
    const z = opts.digitalZoom;
    ctx.translate(width / 2, height / 2);
    ctx.scale(z, z);
    ctx.translate(-width / 2, -height / 2);
  }
  ctx.drawImage(video, 0, 0, width, height);
  ctx.restore();
}

function luminance(r, g, b) { return 0.299 * r + 0.587 * g + 0.114 * b; }

function pixelFilter(ctx, width, height, id, value, segmentation, mirror) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;

  if (id === 'segment' && segmentation && segmentation.data) {
    const mask = segmentation.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const maskX = mirror ? width - 1 - x : x;
        if (mask[y * width + maskX] === 0) {
          const p = i * 4;
          data[p] = 8; data[p + 1] = 14; data[p + 2] = 26;
        }
      }
    }
    ctx.putImageData(image, 0, 0);
    return;
  }

  if (id === 'bw') {
    for (let i = 0; i < data.length; i += 4) {
      const v = luminance(data[i], data[i + 1], data[i + 2]);
      data[i] = v; data[i + 1] = v; data[i + 2] = v;
    }
  } else if (id === 'contrast') {
    const factor = Math.max(0.1, value / 20);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = factor * (data[i] - 128) + 128;
      data[i + 1] = factor * (data[i + 1] - 128) + 128;
      data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }
  } else if (id === 'invert') {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]; data[i + 1] = 255 - data[i + 1]; data[i + 2] = 255 - data[i + 2];
    }
  } else if (id === 'sepia') {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = r * 0.393 + g * 0.769 + b * 0.189;
      data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
      data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
    }
  } else if (id === 'thermal') {
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.max(0, Math.min(255, luminance(data[i], data[i + 1], data[i + 2]) * 1.4 - 30));
      const t = v / 255;
      let r, g, b;
      if (t < 0.33) { const k = t / 0.33; r = 0; g = 80 * k; b = 255 * k; }
      else if (t < 0.66) { const k = (t - 0.33) / 0.33; r = 255 * k; g = 160 + 60 * k; b = 255 - 255 * k; }
      else { const k = (t - 0.66) / 0.34; r = 255; g = 220 - 200 * k; b = 0; }
      data[i] = r; data[i + 1] = g; data[i + 2] = b;
    }
  } else if (id === 'colorsplash') {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const keep = r > g * 1.35 && r > b * 1.35 && r > 70;
      if (!keep) {
        const v = luminance(r, g, b);
        data[i] = v; data[i + 1] = v; data[i + 2] = v;
      }
    }
  } else if (id === 'edges' || id === 'sketch' || id === 'cartoon') {
    const input = new Uint8ClampedArray(data);
    const threshold = id === 'cartoon' ? 40 : Math.max(8, 110 - value);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        const right = (y * width + x + 1) * 4;
        const down = ((y + 1) * width + x) * 4;
        const diff = Math.abs(input[i] - input[right]) + Math.abs(input[i] - input[down]);
        const edge = diff * 2 > threshold;
        if (id === 'edges') {
          data[i] = 6; data[i + 1] = edge ? 255 : 10; data[i + 2] = edge ? 180 : 14;
        } else if (id === 'sketch') {
          const v = luminance(input[i], input[i + 1], input[i + 2]);
          const out = edge ? 25 : 200 + v * 0.2;
          data[i] = out; data[i + 1] = out; data[i + 2] = out;
        } else {
          if (edge) { data[i] *= 0.25; data[i + 1] *= 0.25; data[i + 2] *= 0.25; }
          else {
            const levels = Math.max(2, Math.round(value / 18));
            for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] / (255 / levels)) * (255 / levels);
          }
        }
      }
    }
  }

  if (id === 'vignette') {
    const cx = width / 2, cy = height / 2;
    const max = Math.hypot(cx, cy);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const d = Math.hypot(x - cx, y - cy) / max;
        const f = Math.max(0, 1 - Math.pow(d, 2.2) * 1.1);
        const i = (y * width + x) * 4;
        data[i] *= f; data[i + 1] *= f; data[i + 2] *= f;
      }
    }
  }

  ctx.putImageData(image, 0, 0);
}

const PIXEL_FILTERS = new Set([
  'bw', 'contrast', 'edges', 'invert', 'sepia', 'vignette',
  'sketch', 'cartoon', 'thermal', 'colorsplash', 'segment'
]);

/** Disegna il frame con il filtro richiesto. */
export function renderFrame(ctx, video, canvas, filterId, options) {
  const opts = options || {};
  const width = canvas.width;
  const height = canvas.height;
  const mirror = !!opts.mirror;
  const value = opts.slider || 50;
  ctx.clearRect(0, 0, width, height);

  if (filterId === 'blur' || filterId === 'pixelate') {
    const amount = filterId === 'blur' ? 1 - (value / 100) * 0.92 : Math.max(0.04, value / 100);
    const sw = Math.max(2, Math.round(width * amount));
    const sh = Math.max(2, Math.round(height * amount));
    const bctx = ensureBuffer(sw, sh);
    drawSource(bctx, video, sw, sh, opts);
    ctx.save();
    ctx.imageSmoothingEnabled = filterId === 'blur';
    ctx.drawImage(bctx.canvas, 0, 0, sw, sh, 0, 0, width, height);
    ctx.restore();
    return;
  }

  const bctx = ensureBuffer(width, height);
  drawSource(bctx, video, width, height, opts);
  if (PIXEL_FILTERS.has(filterId)) {
    pixelFilter(bctx, width, height, filterId, value, opts.segmentation, mirror);
  }
  ctx.drawImage(bctx.canvas, 0, 0);
}

function labelBox(ctx, x, y, w, h, text, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, Math.round(ctx.canvas.width / 400));
  ctx.strokeRect(x, y, w, h);
  ctx.font = 'bold ' + Math.max(13, Math.round(ctx.canvas.width / 60)) + 'px Inter, sans-serif';
  const tw = ctx.measureText(text).width;
  const bh = Math.max(20, Math.round(ctx.canvas.width / 48));
  const ly = y > bh ? y - bh : y;
  ctx.fillStyle = color;
  ctx.fillRect(x, ly, tw + 10, bh);
  ctx.fillStyle = '#04121f';
  ctx.fillText(text, x + 5, ly + bh - 5);
}

function mirrorX(x, width, bboxWidth, mirror) {
  return mirror ? width - x - bboxWidth : x;
}

/** Overlay di detection e sottotitoli, disegnati sul canvas finale. */
export function renderOverlay(ctx, canvas, filterId, results, options) {
  const opts = options || {};
  const width = canvas.width;
  const height = canvas.height;
  const mirror = !!opts.mirror;
  ctx.save();

  if (filterId === 'objects' && Array.isArray(results)) {
    results.forEach(p => {
      const [x, y, w, h] = p.bbox;
      labelBox(ctx, mirrorX(x, width, w, mirror), y, w, h,
        p.class + ' ' + Math.round(p.score * 100) + '%', '#38bdf8');
    });
  } else if (filterId === 'tracker' && results) {
    (results.all || []).forEach(p => {
      if (!window.AITracker || !window.AITracker.targetEmbedding) {
        const [x, y, w, h] = p.bbox;
        ctx.strokeStyle = 'rgba(255,255,255,.45)';
        ctx.lineWidth = 2;
        ctx.strokeRect(mirrorX(x, width, w, mirror), y, w, h);
      }
    });
    if (results.tracked && results.tracked.bbox) {
      const [x, y, w, h] = results.tracked.bbox;
      labelBox(ctx, mirrorX(x, width, w, mirror), y, w, h,
        'TRACKING: ' + results.tracked.class, '#f87171');
    } else if (!window.AITracker || !window.AITracker.targetEmbedding) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold ' + Math.max(16, width / 45) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.tapText || 'Tap an object', width / 2, height - 90);
      ctx.textAlign = 'left';
    }
  } else if (filterId === 'face' && window.FaceTracker) {
    if (mirror) { ctx.translate(width, 0); ctx.scale(-1, 1); }
    window.FaceTracker.draw(ctx, results || []);
  } else if (filterId === 'hands' && window.HandTracker) {
    if (mirror) { ctx.translate(width, 0); ctx.scale(-1, 1); }
    window.HandTracker.draw(ctx, width, height);
  }

  if (opts.subtitle) {
    const text = opts.subtitle;
    const size = Math.max(20, Math.round(width / 26));
    ctx.font = 'bold ' + size + 'px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const tw = ctx.measureText(text).width;
    const x = width / 2;
    const y = height - height * 0.09;
    ctx.fillStyle = 'rgba(2,8,18,.72)';
    ctx.fillRect(x - tw / 2 - 14, y - size - 16, tw + 28, size + 26);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(text, x, y);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();
}
