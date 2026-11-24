/* Streaming — liquid glass: CSS layer everywhere, SVG refraction in Chromium */

export function isChromium() {
  return navigator.userAgentData?.brands?.some(b => /chromium/i.test(b.brand)) ?? false;
}

function sdf(x, y, w, h, r) {
  const qx = Math.abs(x - w / 2) - (w / 2 - r);
  const qy = Math.abs(y - h / 2) - (h / 2 - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

export function displacementMap(w, h, radius = 30, bezel = 22, scale = 28) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const d = sdf(x, y, canvas.width, canvas.height, Math.min(radius, Math.min(w, h) / 2));
      const inset = -d;
      let dx = 0, dy = 0;
      if (inset > 0 && inset < bezel) {
        const nx = sdf(x + 1, y, canvas.width, canvas.height, radius) - sdf(x - 1, y, canvas.width, canvas.height, radius);
        const ny = sdf(x, y + 1, canvas.width, canvas.height, radius) - sdf(x, y - 1, canvas.width, canvas.height, radius);
        const len = Math.hypot(nx, ny) || 1;
        const falloff = Math.pow(1 - inset / bezel, 2);
        dx = nx / len * falloff;
        dy = ny / len * falloff;
      }
      const i = (y * canvas.width + x) * 4;
      img.data[i] = 128 + dx * scale;
      img.data[i + 1] = 128 + dy * scale;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}

export function mountFilter() {
  if (document.getElementById('lg-filter')) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'lg-filter';
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML = `<filter id="lg-refract" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feImage id="lg-map" x="0" y="0" preserveAspectRatio="none" result="map"/>
    <feDisplacementMap in="SourceGraphic" in2="map" scale="26" xChannelSelector="R" yChannelSelector="G"/>
  </filter>`;
  document.body.appendChild(svg);
}

export function enableRefraction(el, radius = 30, bezel = 22) {
  if (!el || !isChromium()) return false;
  mountFilter();
  let timer = null;
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
  const debounced = () => { clearTimeout(timer); timer = setTimeout(apply, 180); };
  new ResizeObserver(debounced).observe(el);
  return true;
}
