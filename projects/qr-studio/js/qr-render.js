/**
 * qr-render.js — rendering di matrici QR.
 *
 * Le forme vengono generate una volta sola (`buildShapes`) e poi disegnate su
 * canvas oppure serializzate in SVG. Il formato intermedio è volutamente
 * semplice: rect, circle, ringRect, ringCircle. Questo permette di testare la
 * geometria senza browser (rasterizzando le forme in un buffer RGBA).
 *
 * Dipende dal global `qrcode` (qrcode-generator, vendorizzato).
 */

export const DEFAULT_MARGIN = 4;
export const DEFAULT_SIZE = 1024;

const STYLES = new Set(['square', 'round', 'dot']);

const svgEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
};

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => svgEscapes[ch]);
}

export function sanitizeColor(value, fallback) {
  return typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value) ? value : fallback;
}

export function normalizeStyle(value) {
  return STYLES.has(value) ? value : 'square';
}

export function normalizeSize(value) {
  const size = Number(value);
  if (!Number.isFinite(size)) return DEFAULT_SIZE;
  return Math.min(4096, Math.max(256, Math.round(size)));
}

export function normalizeMargin(value) {
  const margin = Number(value);
  if (!Number.isFinite(margin)) return DEFAULT_MARGIN;
  return Math.min(16, Math.max(0, Math.round(margin)));
}

/**
 * Costruisce la matrice QR. La factory è iniettabile per i test.
 * @returns {{ count:number, modules:boolean[][] }}
 */
export function buildMatrix(text, ec = 'M', factory = globalThis.qrcode) {
  const data = String(text == null ? '' : text);
  if (!data) {
    const err = new Error('Empty QR payload');
    err.code = 'EMPTY';
    throw err;
  }
  if (typeof factory !== 'function') {
    const err = new Error('QR library not loaded');
    err.code = 'QR_LIB_UNAVAILABLE';
    throw err;
  }

  // qrcode-generator di default usa Latin-1: attiviamo UTF-8 una volta sola.
  try {
    if (factory.stringToBytesFuncs && factory.stringToBytesFuncs['UTF-8']) {
      factory.stringToBytes = factory.stringToBytesFuncs['UTF-8'];
    }
  } catch {
    /* la factory potrebbe essere congelata: si prosegue */
  }

  let qr;
  try {
    qr = factory(0, ec);
    qr.addData(data);
    qr.make();
  } catch (cause) {
    const err = new Error('QR payload too long');
    err.code = 'CAPACITY';
    err.cause = cause;
    throw err;
  }

  const count = qr.getModuleCount();
  const modules = [];
  for (let row = 0; row < count; row += 1) {
    const line = [];
    for (let col = 0; col < count; col += 1) line.push(qr.isDark(row, col));
    modules.push(line);
  }
  return { count, modules };
}

function finderZones(count) {
  // Angoli reali: alto-sinistra, alto-destra, basso-sinistra.
  return [
    { row: 0, col: 0, size: 7 },
    { row: 0, col: count - 7, size: 7 },
    { row: count - 7, col: 0, size: 7 }
  ];
}

function isInsideFinder(row, col, zones) {
  for (const zone of zones) {
    if (
      row >= zone.row &&
      row < zone.row + zone.size &&
      col >= zone.col &&
      col < zone.col + zone.size
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Converte una matrice in forme geometriche, in unità modulo (0..total).
 * Le forme "ring" hanno i bounds esterni e uno spessore: il painter disegna
 * il tratto centrato a `thickness / 2` dall'esterno.
 */
export function buildShapes(matrix, options = {}) {
  const style = normalizeStyle(options.style);
  const margin = normalizeMargin(options.margin);
  const { count, modules } = matrix;
  const total = count + margin * 2;
  const shapes = [];

  if (style === 'square') {
    for (let row = 0; row < count; row += 1) {
      let start = -1;
      for (let col = 0; col <= count; col += 1) {
        const dark = col < count && modules[row][col];
        if (dark && start < 0) start = col;
        if (!dark && start >= 0) {
          shapes.push({
            kind: 'rect',
            x: margin + start,
            y: margin + row,
            w: col - start,
            h: 1,
            rx: 0
          });
          start = -1;
        }
      }
    }
    return { total, shapes };
  }

  const zones = finderZones(count);
  for (const zone of zones) {
    const x = margin + zone.col;
    const y = margin + zone.row;
    if (style === 'dot') {
      const cx = x + 3.5;
      const cy = y + 3.5;
      shapes.push({ kind: 'ringCircle', cx, cy, r: 3.5, thickness: 1 });
      shapes.push({ kind: 'circle', cx, cy, r: 1.5 });
    } else {
      shapes.push({ kind: 'ringRect', x, y, w: 7, h: 7, rx: 1.5, thickness: 1 });
      shapes.push({ kind: 'rect', x: x + 2, y: y + 2, w: 3, h: 3, rx: 0.7 });
    }
  }

  const dark = (row, col) =>
    row >= 0 && col >= 0 && row < count && col < count && modules[row][col];

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!modules[row][col] || isInsideFinder(row, col, zones)) continue;
      if (style === 'dot') {
        // r = 0.6: i cerchi si toccano quasi, mantenendo abbastanza nero per
        // i lettori. Sotto 0.58 jsQR fatica su alcune risoluzioni (test).
        shapes.push({
          kind: 'circle',
          cx: margin + col + 0.5,
          cy: margin + row + 0.5,
          r: 0.6
        });
      } else {
        // Stile "liquido": copertura piena del modulo, arrotondamento solo
        // dove il modulo non ha vicini. I tagli interni romperebbero i pattern
        // di allineamento e la lettura.
        const radii = [
          dark(row - 1, col) || dark(row, col - 1) ? 0 : 0.5,
          dark(row - 1, col) || dark(row, col + 1) ? 0 : 0.5,
          dark(row + 1, col) || dark(row, col + 1) ? 0 : 0.5,
          dark(row + 1, col) || dark(row, col - 1) ? 0 : 0.5
        ];
        shapes.push({
          kind: 'rect',
          x: margin + col,
          y: margin + row,
          w: 1,
          h: 1,
          radii
        });
      }
    }
  }

  return { total, shapes };
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  if (!radius) {
    ctx.rect(x, y, w, h);
    return;
  }
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
    return;
  }
  const k = radius * 0.5522847498;
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function cornerRadiiPath(ctx, x, y, w, h, radii) {
  const [tl, tr, br, bl] = radii.map((r) => Math.max(0, Math.min(r, w / 2, h / 2)));
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  if (tr) ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  if (br) ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  if (bl) ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  if (tl) ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}

function paintShape(ctx, shape, scale) {
  const snap = (value) => Math.round(value * scale);
  const snapSize = (value) => Math.max(1, Math.round(value * scale));

  switch (shape.kind) {
    case 'rect': {
      const x = snap(shape.x);
      const y = snap(shape.y);
      const w = Math.max(1, snap(shape.x + shape.w) - x);
      const h = Math.max(1, snap(shape.y + shape.h) - y);
      ctx.beginPath();
      if (shape.radii) {
        cornerRadiiPath(ctx, x, y, w, h, shape.radii.map((radius) => snap(radius)));
      } else {
        roundRectPath(ctx, x, y, w, h, snap(shape.rx || 0));
      }
      ctx.fill();
      break;
    }
    case 'circle': {
      ctx.beginPath();
      ctx.arc(snap(shape.cx), snap(shape.cy), snapSize(shape.r), 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'ringRect': {
      const x = snap(shape.x);
      const y = snap(shape.y);
      const w = Math.max(1, snap(shape.x + shape.w) - x);
      const h = Math.max(1, snap(shape.y + shape.h) - y);
      const thickness = Math.min(snapSize(shape.thickness), Math.floor(Math.min(w, h) / 2));
      if (thickness <= 0) break;
      const radius = Math.max(0, snap(shape.rx || 0));
      ctx.beginPath();
      roundRectPath(ctx, x, y, w, h, Math.min(radius, Math.floor(Math.min(w, h) / 2)));
      roundRectPath(
        ctx,
        x + thickness,
        y + thickness,
        Math.max(1, w - thickness * 2),
        Math.max(1, h - thickness * 2),
        Math.max(0, radius - thickness)
      );
      ctx.fill('evenodd');
      break;
    }
    case 'ringCircle': {
      const cx = snap(shape.cx);
      const cy = snap(shape.cy);
      const radius = snapSize(shape.r);
      const thickness = Math.min(snapSize(shape.thickness), radius);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.arc(cx, cy, Math.max(0, radius - thickness), 0, Math.PI * 2, true);
      ctx.fill('evenodd');
      break;
    }
    default:
      break;
  }
}

/**
 * Disegna su canvas. `canvas.width` e `canvas.height` vengono impostati a
 * `size` (default 1024). Per l'anteprima passare size 720 e lasciare che il CSS
 * ridimensioni il canvas.
 */
export function drawCanvas(canvas, matrix, options = {}) {
  if (!canvas || typeof canvas.getContext !== 'function') {
    throw new Error('Canvas non disponibile');
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Contesto 2D non disponibile');

  const size = normalizeSize(options.size);
  const fg = sanitizeColor(options.fg, '#0a0d16');
  const bg = sanitizeColor(options.bg, '#ffffff');
  const transparent = Boolean(options.transparent);
  const { total, shapes } = buildShapes(matrix, options);
  const scale = size / total;

  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);
  if (!transparent) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
  }
  ctx.fillStyle = fg;
  ctx.strokeStyle = fg;
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'round';
  for (const shape of shapes) paintShape(ctx, shape, scale);
  return { size, total, shapeCount: shapes.length };
}

function rectPathData(x, y, w, h, radii) {
  const [tl, tr, br, bl] = radii;
  let d = `M${round(x + tl)} ${round(y)}`;
  d += `H${round(x + w - tr)}`;
  if (tr) d += `A${round(tr)} ${round(tr)} 0 0 1 ${round(x + w)} ${round(y + tr)}`;
  d += `V${round(y + h - br)}`;
  if (br) d += `A${round(br)} ${round(br)} 0 0 1 ${round(x + w - br)} ${round(y + h)}`;
  d += `H${round(x + bl)}`;
  if (bl) d += `A${round(bl)} ${round(bl)} 0 0 1 ${round(x)} ${round(y + h - bl)}`;
  d += `V${round(y + tl)}`;
  if (tl) d += `A${round(tl)} ${round(tl)} 0 0 1 ${round(x + tl)} ${round(y)}`;
  return d + 'Z';
}

function shapeToSvg(shape) {
  switch (shape.kind) {
    case 'rect': {
      if (shape.radii) {
        return `<path d="${rectPathData(shape.x, shape.y, shape.w, shape.h, shape.radii)}"/>`;
      }
      const rx = shape.rx ? ` rx="${round(shape.rx)}"` : '';
      return `<rect x="${round(shape.x)}" y="${round(shape.y)}" width="${round(shape.w)}" height="${round(shape.h)}"${rx}/>`;
    }
    case 'circle':
      return `<circle cx="${round(shape.cx)}" cy="${round(shape.cy)}" r="${round(shape.r)}"/>`;
    case 'ringRect': {
      const inset = shape.thickness / 2;
      return `<rect x="${round(shape.x + inset)}" y="${round(shape.y + inset)}" width="${round(shape.w - shape.thickness)}" height="${round(shape.h - shape.thickness)}" rx="${round(Math.max(0, (shape.rx || 0) - inset))}" fill="none" stroke-width="${round(shape.thickness)}"/>`;
    }
    case 'ringCircle':
      return `<circle cx="${round(shape.cx)}" cy="${round(shape.cy)}" r="${round(shape.r - shape.thickness / 2)}" fill="none" stroke-width="${round(shape.thickness)}"/>`;
    default:
      return '';
  }
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

/**
 * Restituisce un documento SVG autonomo, dimensionato in pixel ma scalabile.
 */
export function svgString(matrix, options = {}) {
  const size = normalizeSize(options.size);
  const fg = sanitizeColor(options.fg, '#0a0d16');
  const bg = sanitizeColor(options.bg, '#ffffff');
  const transparent = Boolean(options.transparent);
  const { total, shapes } = buildShapes(matrix, options);
  const body = shapes.map(shapeToSvg).join('');
  const background = transparent
    ? ''
    : `<rect width="${total}" height="${total}" fill="${bg}"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
    `viewBox="0 0 ${total} ${total}" role="img" aria-label="QR code">` +
    background +
    `<g fill="${fg}" stroke="${fg}" stroke-width="0">${body}</g>` +
    `</svg>`
  );
}

export function canvasToBlob(canvas, type = 'image/png') {
  return new Promise((resolve, reject) => {
    if (!canvas || typeof canvas.toBlob !== 'function') {
      reject(new Error('Canvas non esportabile'));
      return;
    }
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Esportazione non riuscita'));
    }, type);
  });
}

/** Suggerisce la versione QR dalla dimensione della matrice. */
export function matrixVersion(count) {
  const version = Math.round((count - 17) / 4);
  return version >= 1 && version <= 40 ? version : 0;
}
