/* Cozy Coloring Book — canvas engine, line art and view transform */

import { FIGURES, getFigure } from './figures.js';

export const ART_W = 900;
export const ART_H = 600;
const SCALE = 1.5;

export const engine = {
  art: null,
  ctx: null,
  template: null,
  tctx: null,
  figure: null,
  zoom: 1,
  panX: 0,
  panY: 0
};

export function initEngine(canvas) {
  engine.art = canvas;
  canvas.width = ART_W;
  canvas.height = ART_H;
  engine.ctx = canvas.getContext('2d', { willReadFrequently: true });
  engine.template = document.createElement('canvas');
  engine.template.width = ART_W;
  engine.template.height = ART_H;
  engine.tctx = engine.template.getContext('2d', { willReadFrequently: true });
}

function drawLineArt(ctx, figure) {
  ctx.save();
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.strokeStyle = '#3b322b';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  figure.draw(ctx);
  ctx.restore();
}

export function loadFigure(figureOrId) {
  const figure = typeof figureOrId === 'string' ? getFigure(figureOrId) : figureOrId;
  engine.figure = figure;
  const ctx = engine.ctx;
  const tctx = engine.tctx;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#fffdf8';
  ctx.fillRect(0, 0, ART_W, ART_H);
  drawLineArt(ctx, figure);

  tctx.setTransform(1, 0, 0, 1, 0, 0);
  tctx.fillStyle = '#fffdf8';
  tctx.fillRect(0, 0, ART_W, ART_H);
  drawLineArt(tctx, figure);
  return figure;
}

export function artFromDataUrl(url) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => {
      const ctx = engine.ctx;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ART_W, ART_H);
      ctx.drawImage(image, 0, 0, ART_W, ART_H);
      resolve();
    };
    image.onerror = () => resolve();
    image.src = url;
  });
}

export function screenToArt(clientX, clientY) {
  const rect = engine.art.getBoundingClientRect();
  return {
    x: (clientX - rect.left) / rect.width * ART_W,
    y: (clientY - rect.top) / rect.height * ART_H
  };
}

export function setZoom(value) {
  engine.zoom = Math.max(0.6, Math.min(4, value));
  applyView();
  return engine.zoom;
}

export function zoomBy(delta, originX = null, originY = null) {
  const previous = engine.zoom;
  const next = setZoom(previous + delta);
  if (originX !== null && next !== previous) {
    const rect = engine.art.getBoundingClientRect();
    const cx = originX - rect.left;
    const cy = originY - rect.top;
    engine.panX -= (cx - rect.width / 2) * (next / previous - 1);
    engine.panY -= (cy - rect.height / 2) * (next / previous - 1);
    applyView();
  }
  return next;
}

export function panBy(dx, dy) {
  engine.panX += dx;
  engine.panY += dy;
  applyView();
}

export function resetView() {
  engine.zoom = 1;
  engine.panX = 0;
  engine.panY = 0;
  applyView();
}

export function applyView() {
  const paper = document.getElementById('paper');
  if (!paper) return;
  paper.style.transform = `translate(${engine.panX}px, ${engine.panY}px) scale(${engine.zoom})`;
}

export function allFigures() { return FIGURES; }
