import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import {
  buildMatrix,
  buildShapes,
  drawCanvas,
  svgString,
  matrixVersion,
  normalizeStyle,
  normalizeSize,
  sanitizeColor
} from '../js/qr-render.js';

const require = createRequire(import.meta.url);
const qrcodeFactory = require('../js/vendor/qrcode-generator.js');
const jsQR = require('../js/vendor/jsQR.js');

function parseColor(hex) {
  let value = hex.replace('#', '');
  if (value.length === 3) value = value.split('').map((c) => c + c).join('');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
    255
  ];
}

function insideRoundRect(px, py, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  const cx = Math.max(x + radius, Math.min(px, x + w - radius));
  const cy = Math.max(y + radius, Math.min(py, y + h - radius));
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function insideCornerRadii(px, py, x, y, w, h, radii) {
  if (px < x || px > x + w || py < y || py > y + h) return false;
  const [tl, tr, br, bl] = radii;
  if (tl && px < x + tl && py < y + tl) {
    return (px - (x + tl)) ** 2 + (py - (y + tl)) ** 2 <= tl * tl;
  }
  if (tr && px > x + w - tr && py < y + tr) {
    return (px - (x + w - tr)) ** 2 + (py - (y + tr)) ** 2 <= tr * tr;
  }
  if (br && px > x + w - br && py > y + h - br) {
    return (px - (x + w - br)) ** 2 + (py - (y + h - br)) ** 2 <= br * br;
  }
  if (bl && px < x + bl && py > y + h - bl) {
    return (px - (x + bl)) ** 2 + (py - (y + h - bl)) ** 2 <= bl * bl;
  }
  return true;
}

/**
 * Rasterizza le forme in un buffer RGBA. È il ponte che permette di testare
 * il rendering senza canvas: la stessa geometria usata da canvas e SVG.
 */
function rasterize(shapeResult, size, fg = '#0a0d16', bg = '#ffffff') {
  const { total, shapes } = shapeResult;
  const scale = size / total;
  const data = new Uint8ClampedArray(size * size * 4);
  const bgColor = parseColor(bg);
  const fgColor = parseColor(fg);

  for (let i = 0; i < size * size; i += 1) {
    data[i * 4] = bgColor[0];
    data[i * 4 + 1] = bgColor[1];
    data[i * 4 + 2] = bgColor[2];
    data[i * 4 + 3] = 255;
  }

  function setPixel(x, y) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const index = (y * size + x) * 4;
    data[index] = fgColor[0];
    data[index + 1] = fgColor[1];
    data[index + 2] = fgColor[2];
    data[index + 3] = 255;
  }

  function fillBBox(x0, y0, x1, y1, predicate) {
    const startX = Math.max(0, Math.floor(x0 * scale));
    const endX = Math.min(size - 1, Math.ceil(x1 * scale));
    const startY = Math.max(0, Math.floor(y0 * scale));
    const endY = Math.min(size - 1, Math.ceil(y1 * scale));
    for (let y = startY; y <= endY; y += 1) {
      const py = (y + 0.5) / scale;
      for (let x = startX; x <= endX; x += 1) {
        const px = (x + 0.5) / scale;
        if (predicate(px, py)) setPixel(x, y);
      }
    }
  }

  for (const shape of shapes) {
    switch (shape.kind) {
      case 'rect':
        fillBBox(shape.x, shape.y, shape.x + shape.w, shape.y + shape.h, (px, py) =>
          shape.radii
            ? insideCornerRadii(px, py, shape.x, shape.y, shape.w, shape.h, shape.radii)
            : insideRoundRect(px, py, shape.x, shape.y, shape.w, shape.h, shape.rx || 0)
        );
        break;
      case 'circle':
        fillBBox(
          shape.cx - shape.r,
          shape.cy - shape.r,
          shape.cx + shape.r,
          shape.cy + shape.r,
          (px, py) => (px - shape.cx) ** 2 + (py - shape.cy) ** 2 <= shape.r ** 2
        );
        break;
      case 'ringRect': {
        const t = shape.thickness;
        fillBBox(shape.x, shape.y, shape.x + shape.w, shape.y + shape.h, (px, py) => {
          const outer = insideRoundRect(
            px,
            py,
            shape.x,
            shape.y,
            shape.w,
            shape.h,
            shape.rx || 0
          );
          if (!outer) return false;
          const inner = insideRoundRect(
            px,
            py,
            shape.x + t,
            shape.y + t,
            shape.w - t * 2,
            shape.h - t * 2,
            Math.max(0, (shape.rx || 0) - t)
          );
          return !inner;
        });
        break;
      }
      case 'ringCircle': {
        const t = shape.thickness;
        fillBBox(
          shape.cx - shape.r,
          shape.cy - shape.r,
          shape.cx + shape.r,
          shape.cy + shape.r,
          (px, py) => {
            const d2 = (px - shape.cx) ** 2 + (py - shape.cy) ** 2;
            return d2 <= shape.r ** 2 && d2 >= (shape.r - t) ** 2;
          }
        );
        break;
      }
      default:
        break;
    }
  }

  return { data, width: size, height: size };
}

function decode(result, size = 480) {
  const { data, width, height } = rasterize(result, size);
  return jsQR(data, width, height, { inversionAttempts: 'dontInvert' });
}

test('buildMatrix genera una matrice quadrata e gestisce UTF-8', () => {
  const matrix = buildMatrix('Caffè, città — 日本語', 'M', qrcodeFactory);
  assert.ok(matrix.count >= 21);
  assert.equal(matrix.modules.length, matrix.count);
  assert.equal(matrix.modules[0].length, matrix.count);
  assert.equal(matrix.modules[0][0], true);
  assert.equal(typeof matrix.modules[3][3], 'boolean');
});

test('buildMatrix segnala payload vuoto e troppo lungo', () => {
  assert.throws(() => buildMatrix('', 'M', qrcodeFactory), /Empty QR payload/);
  assert.throws(
    () => buildMatrix('x'.repeat(8000), 'M', qrcodeFactory),
    (err) => err.code === 'CAPACITY'
  );
  assert.throws(
    () => buildMatrix('test', 'M', null),
    (err) => err.code === 'QR_LIB_UNAVAILABLE'
  );
});

test('buildShapes produce forme coerenti per i tre stili', () => {
  const matrix = buildMatrix('https://example.com', 'M', qrcodeFactory);
  const square = buildShapes(matrix, { style: 'square', margin: 4 });
  assert.equal(square.total, matrix.count + 8);
  assert.ok(square.shapes.length > 0);
  assert.ok(square.shapes.every((s) => s.kind === 'rect' && s.h === 1));

  const round = buildShapes(matrix, { style: 'round', margin: 4 });
  assert.equal(round.shapes.filter((s) => s.kind === 'ringRect').length, 3);
  const liquid = round.shapes.filter((s) => s.kind === 'rect' && s.radii);
  assert.ok(liquid.length > 0);
  assert.ok(liquid.some((s) => s.radii.some((r) => r > 0)), 'bordi esterni arrotondati');
  assert.ok(liquid.some((s) => s.radii.every((r) => r === 0)), 'giunzioni interne piene');

  const dot = buildShapes(matrix, { style: 'dot', margin: 4 });
  assert.equal(dot.shapes.filter((s) => s.kind === 'ringCircle').length, 3);
  assert.equal(dot.shapes.filter((s) => s.kind === 'circle' && s.r === 1.5).length, 3);
  assert.ok(dot.shapes.filter((s) => s.kind === 'circle' && s.r === 0.6).length > 3);
});

test('svgString è autonomo, colorato e gestisce lo sfondo trasparente', () => {
  const matrix = buildMatrix('ciao', 'M', qrcodeFactory);
  const svg = svgString(matrix, { size: 512, fg: '#112233', bg: '#ffffff' });
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /width="512"/);
  assert.match(svg, /viewBox="0 0 \d+ \d+"/);
  assert.match(svg, /<rect width="\d+" height="\d+" fill="#ffffff"\/>/);
  assert.match(svg, /#112233/);

  const transparent = svgString(matrix, { transparent: true, bg: '#ffffff' });
  assert.doesNotMatch(transparent, /fill="#ffffff"/);
});

test('le forme sono decodificabili in tutti gli stili (square, round, dot)', () => {
  const payloads = [
    'https://example.com/qr-studio?test=1',
    'Caffè e città — prova UTF-8'
  ];

  for (const payload of payloads) {
    for (const style of ['square', 'round', 'dot']) {
      const matrix = buildMatrix(payload, 'M', qrcodeFactory);
      const shapes = buildShapes(matrix, { style, margin: 4 });
      const decoded = decode(shapes, 520);
      assert.ok(decoded, `decode fallito: ${style} / ${payload}`);
      assert.equal(decoded.data, payload, `payload errato: ${style}`);
    }
  }
});

test('drawCanvas disegna su un canvas minimale', () => {
  const calls = [];
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    lineJoin: '',
    clearRect: (...args) => calls.push(['clearRect', ...args]),
    fillRect: (...args) => calls.push(['fillRect', ...args]),
    beginPath: () => calls.push(['beginPath']),
    rect: () => calls.push(['rect']),
    roundRect: () => calls.push(['roundRect']),
    moveTo: () => calls.push(['moveTo']),
    lineTo: () => calls.push(['lineTo']),
    arcTo: () => calls.push(['arcTo']),
    quadraticCurveTo: () => calls.push(['quadraticCurveTo']),
    closePath: () => calls.push(['closePath']),
    arc: (...args) => calls.push(['arc', ...args]),
    fill: (...args) => calls.push(['fill', ...args]),
    stroke: (...args) => calls.push(['stroke', ...args])
  };
  const canvas = { width: 0, height: 0, getContext: () => ctx };
  const matrix = buildMatrix('https://example.com', 'M', qrcodeFactory);
  const info = drawCanvas(canvas, matrix, { size: 640, style: 'round', transparent: true });
  assert.equal(canvas.width, 640);
  assert.equal(canvas.height, 640);
  assert.equal(info.size, 640);
  assert.ok(calls.some(([name]) => name === 'fill'));
  assert.ok(calls.some(([name, rule]) => name === 'fill' && rule === 'evenodd'));
  assert.ok(!calls.some(([name]) => name === 'fillRect'), 'trasparente: nessun fondo');

  // I moduli devono cadere su pixel interi: l'antialiasing sui bordi rende
  // il QR più difficile da decodificare (verificato con jsQR in Chromium).
  for (const [name, ...args] of calls) {
    if (['rect', 'roundRect', 'fillRect', 'clearRect', 'moveTo', 'lineTo', 'arcTo'].includes(name)) {
      for (const arg of args) {
        if (typeof arg === 'number') {
          assert.ok(Number.isInteger(arg), `${name} con coordinata non intera: ${arg}`);
        }
      }
    }
    if (name === 'arc') {
      for (const arg of args.slice(0, 3)) {
        assert.ok(Number.isInteger(arg), `arc con coordinata non intera: ${arg}`);
      }
    }
  }
});

test('utility di normalizzazione', () => {
  assert.equal(normalizeStyle('dot'), 'dot');
  assert.equal(normalizeStyle('boh'), 'square');
  assert.equal(normalizeSize(100), 256);
  assert.equal(normalizeSize(9999), 4096);
  assert.equal(normalizeSize('x'), 1024);
  assert.equal(sanitizeColor('#0af', '#fff'), '#0af');
  assert.equal(sanitizeColor('red', '#fff'), '#fff');
  assert.equal(matrixVersion(21), 1);
  assert.equal(matrixVersion(177), 40);
  assert.equal(matrixVersion(30), 3);
});
