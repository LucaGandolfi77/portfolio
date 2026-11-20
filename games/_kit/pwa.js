/* Game Kit — service worker registration */

export function registerSW(path = './sw.js') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(path).catch(() => {});
  }
}

export function setupCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  let dpr = 1, w = 0, h = 0;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h, dpr };
  }
  resize();
  window.addEventListener('resize', resize);
  return { ctx, resize, get w() { return w; }, get h() { return h; }, get dpr() { return dpr; } };
}
