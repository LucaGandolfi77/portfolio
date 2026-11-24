/* Neon Kart — liquid glass: universal CSS layer + Chromium refraction */
export function isChromium() {
  return navigator.userAgentData?.brands?.some(b => /chromium/i.test(b.brand)) ?? false;
}
function sdf(x, y, w, h, r) {
  const qx = Math.abs(x - w / 2) - (w / 2 - r), qy = Math.abs(y - h / 2) - (h / 2 - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
export function displacementMap(w, h, radius = 24, bezel = 18, scale = 22) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w)); canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext('2d'), img = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const d = sdf(x, y, canvas.width, canvas.height, Math.min(radius, Math.min(w, h) / 2));
    const inset = -d;
    let dx = 0, dy = 0;
    if (inset > 0 && inset < bezel) {
      const nx = sdf(x + 1, y, canvas.width, canvas.height, radius) - sdf(x - 1, y, canvas.width, canvas.height, radius);
      const ny = sdf(x, y + 1, canvas.width, canvas.height, radius) - sdf(x, y - 1, canvas.width, canvas.height, radius);
      const len = Math.hypot(nx, ny) || 1, fall = (1 - inset / bezel) ** 2;
      dx = nx / len * fall; dy = ny / len * fall;
    }
    const i = (y * canvas.width + x) * 4;
    img.data[i] = 128 + dx * scale; img.data[i + 1] = 128 + dy * scale;
    img.data[i + 2] = 128; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}
export function enable(el, radius = 24, bezel = 18) {
  if (!el || !isChromium()) return false;
  if (!document.getElementById('lg-filter')) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'lg-filter'; svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    svg.innerHTML = `<filter id="lg-refract" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feImage id="lg-map" x="0" y="0" preserveAspectRatio="none" result="map"/>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="20" xChannelSelector="R" yChannelSelector="G"/>
    </filter>`;
    document.body.appendChild(svg);
  }
  let timer;
  const apply = () => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const map = document.getElementById('lg-map');
    map.setAttribute('width', String(Math.round(r.width)));
    map.setAttribute('height', String(Math.round(r.height)));
    map.setAttribute('href', displacementMap(r.width, r.height, radius, bezel));
    el.classList.add('is-refracting');
  };
  apply();
  new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(apply, 200); }).observe(el);
  return true;
}
