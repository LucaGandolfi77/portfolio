import * as THREE from 'three';

/*
 * Procedural textures, painted on canvases at start-up (no image files).
 * Facades are almost neutral: every building tints them with its own vertex
 * colour, so a handful of textures covers the whole town. Each facade has a
 * matching emissive map with some windows lit, faded in at night.
 *
 * Layout of the facade textures: one bay (4 m) wide, one floor (3 m) high,
 * repeated across the wall. The ground-floor textures are one bay wide and
 * 3.6 m high.
 */

let seed = 1337;
const rand = (): number => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return [c, ctx];
}

function noise(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, size = 2): void {
  for (let i = 0; i < (w * h) / (size * size * 3); i++) {
    const v = rand() < 0.5 ? 0 : 255;
    ctx.fillStyle = `rgba(${v},${v},${v},${rand() * amount})`;
    ctx.fillRect(Math.floor(rand() * w), Math.floor(rand() * h), size, size);
  }
}

function grime(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(0,0,0,0.0)');
  g.addColorStop(0.8, 'rgba(40,30,20,0.06)');
  g.addColorStop(1, 'rgba(40,30,20,0.16)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function finish(c: HTMLCanvasElement, repeat = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

export type FacadeStyle = 'historic' | 'block' | 'modern';

export interface FacadeTextures {
  map: THREE.CanvasTexture;
  emissive: THREE.CanvasTexture;
}

/** One bay x one floor of an upper storey. */
function facade(style: FacadeStyle): FacadeTextures {
  const W = 128;
  const H = 96;
  const [c, ctx] = canvas(W, H);
  const [e, ectx] = canvas(W, H);
  ctx.fillStyle = '#efe9df';
  ctx.fillRect(0, 0, W, H);
  noise(ctx, W, H, 0.08);
  grime(ctx, W, H);
  ectx.fillStyle = '#000';
  ectx.fillRect(0, 0, W, H);

  if (style === 'historic') {
    /* Tall window with green shutters and a stone sill. */
    const wx = 46, wy = 22, ww = 36, wh = 54;
    ctx.fillStyle = '#d9cbb2';
    ctx.fillRect(wx - 5, wy - 5, ww + 10, wh + 9);
    ctx.fillStyle = '#2a3236';
    ctx.fillRect(wx, wy, ww, wh);
    ctx.fillStyle = '#4a5a5e';
    ctx.fillRect(wx + 2, wy + 2, ww / 2 - 3, wh - 4);
    ctx.fillStyle = '#3f6b45';
    ctx.fillRect(wx - 20, wy, 16, wh);
    ctx.fillRect(wx + ww + 4, wy, 16, wh);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = wy + 3; y < wy + wh; y += 5) {
      ctx.fillRect(wx - 19, y, 14, 1);
      ctx.fillRect(wx + ww + 5, y, 14, 1);
    }
    ctx.fillStyle = '#cfc2a8';
    ctx.fillRect(wx - 8, wy + wh, ww + 16, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, H - 4, W, 4);
    ectx.fillStyle = '#ffcf7a';
    ectx.fillRect(wx + 1, wy + 1, ww - 2, wh - 2);
  } else if (style === 'block') {
    /* Post-war apartment block: wide window, balcony slab, roller shutter box. */
    const wx = 22, wy = 20, ww = 84, wh = 44;
    ctx.fillStyle = '#2b3337';
    ctx.fillRect(wx, wy, ww, wh);
    ctx.fillStyle = '#56656a';
    ctx.fillRect(wx + 3, wy + 3, ww / 2 - 5, wh - 6);
    ctx.fillRect(wx + ww / 2 + 2, wy + 3, ww / 2 - 5, wh - 6);
    ctx.fillStyle = '#b9ad98';
    ctx.fillRect(wx - 2, wy - 8, ww + 4, 8);
    ctx.fillStyle = '#d8cfbf';
    ctx.fillRect(8, wy + wh, W - 16, 8);
    ctx.fillStyle = 'rgba(30,30,30,0.5)';
    for (let x = 10; x < W - 10; x += 6) ctx.fillRect(x, wy + wh + 8, 2, 18);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(8, wy + wh + 26, W - 16, 2);
    ectx.fillStyle = '#ffd98f';
    ectx.fillRect(wx + 2, wy + 2, ww - 4, wh - 4);
  } else {
    /* Modern: horizontal band window. */
    ctx.fillStyle = '#334047';
    ctx.fillRect(0, 26, W, 40);
    ctx.fillStyle = 'rgba(160,190,205,0.45)';
    ctx.fillRect(0, 28, W, 14);
    ctx.fillStyle = '#9aa1a3';
    for (let x = 0; x < W; x += 32) ctx.fillRect(x, 26, 3, 40);
    ectx.fillStyle = '#e8f0ff';
    ectx.fillRect(0, 28, W, 36);
  }
  return { map: finish(c), emissive: finish(e) };
}

/** Ground floor: shopfront with awning, or a plain door bay. */
function shopfront(): FacadeTextures {
  const W = 128;
  const H = 116;
  const [c, ctx] = canvas(W, H);
  const [e, ectx] = canvas(W, H);
  ctx.fillStyle = '#e6dccb';
  ctx.fillRect(0, 0, W, H);
  noise(ctx, W, H, 0.1);
  /* Stone plinth. */
  ctx.fillStyle = '#b8aa92';
  ctx.fillRect(0, H - 14, W, 14);
  /* Shop window and door. */
  ctx.fillStyle = '#20282c';
  ctx.fillRect(12, 34, 104, 68);
  ctx.fillStyle = '#3d4a50';
  ctx.fillRect(16, 38, 60, 60);
  ctx.fillStyle = '#5a3a26';
  ctx.fillRect(84, 38, 28, 64);
  /* Striped awning. */
  for (let x = 6; x < W - 6; x += 12) {
    ctx.fillStyle = (x / 12) % 2 < 1 ? '#a8432f' : '#efe3c8';
    ctx.beginPath();
    ctx.moveTo(x, 14);
    ctx.lineTo(x + 12, 14);
    ctx.lineTo(x + 14, 32);
    ctx.lineTo(x - 2, 32);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(6, 32, W - 12, 3);
  ectx.fillStyle = '#000';
  ectx.fillRect(0, 0, W, H);
  ectx.fillStyle = '#ffd38a';
  ectx.fillRect(16, 38, 60, 60);
  ectx.fillStyle = '#ffb35c';
  ectx.fillRect(10, 16, W - 20, 14);
  return { map: finish(c), emissive: finish(e) };
}

function tiles(): THREE.CanvasTexture {
  /* Coppi: rows of curved clay tiles, neutral so the roof colour tints them. */
  const [c, ctx] = canvas(128, 128);
  ctx.fillStyle = '#d8d2c8';
  ctx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 16) {
    for (let x = (y / 16) % 2 ? 0 : 8; x < 136; x += 16) {
      const g = ctx.createLinearGradient(x - 8, 0, x + 8, 0);
      g.addColorStop(0, 'rgba(0,0,0,0.28)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.18)');
      g.addColorStop(1, 'rgba(0,0,0,0.28)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 8, y, 16, 16);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(x - 8, y + 14, 16, 2);
    }
  }
  noise(ctx, 128, 128, 0.12);
  return finish(c);
}

function concrete(): THREE.CanvasTexture {
  const [c, ctx] = canvas(128, 128);
  ctx.fillStyle = '#c9c4bb';
  ctx.fillRect(0, 0, 128, 128);
  noise(ctx, 128, 128, 0.14, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(0, 63, 128, 2);
  ctx.fillRect(63, 0, 2, 128);
  return finish(c);
}

/** Asphalt across the road: u along the road (one tile = 8 m), v across. */
function asphalt(): THREE.CanvasTexture {
  const [c, ctx] = canvas(128, 128);
  ctx.fillStyle = '#4a4a4c';
  ctx.fillRect(0, 0, 128, 128);
  noise(ctx, 128, 128, 0.22, 2);
  /* Patches and cracks. */
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.06 + rand() * 0.08})`;
    ctx.fillRect(rand() * 128, rand() * 128, 10 + rand() * 30, 6 + rand() * 18);
  }
  /* Edge lines (top and bottom of v) and a dashed centre line. */
  ctx.fillStyle = 'rgba(235,232,220,0.85)';
  ctx.fillRect(0, 4, 128, 3);
  ctx.fillRect(0, 121, 128, 3);
  ctx.fillRect(0, 63, 64, 3);
  return finish(c);
}

function pavers(): THREE.CanvasTexture {
  const [c, ctx] = canvas(64, 64);
  ctx.fillStyle = '#b7ab96';
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  for (let i = 0; i < 64; i += 16) {
    ctx.fillRect(0, i, 64, 1);
    for (let x = (i / 16) % 2 ? 8 : 0; x < 64; x += 16) ctx.fillRect(x, i, 1, 16);
  }
  noise(ctx, 64, 64, 0.1);
  return finish(c);
}

function grass(): THREE.CanvasTexture {
  const [c, ctx] = canvas(128, 128);
  ctx.fillStyle = '#6f7d45';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = rand() < 0.5 ? 'rgba(40,60,20,0.25)' : 'rgba(170,180,100,0.2)';
    ctx.fillRect(rand() * 128, rand() * 128, 2, 3);
  }
  return finish(c);
}

function dirt(): THREE.CanvasTexture {
  const [c, ctx] = canvas(128, 128);
  ctx.fillStyle = '#8f8063';
  ctx.fillRect(0, 0, 128, 128);
  noise(ctx, 128, 128, 0.2, 3);
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = 'rgba(80,100,40,0.18)';
    ctx.fillRect(rand() * 128, rand() * 128, 3, 2);
  }
  return finish(c);
}

/** Soft round glow for street-lamp pools and headlights (no repeat). */
function glow(): THREE.CanvasTexture {
  const [c, ctx] = canvas(64, 64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return finish(c, false);
}

export interface TextureSet {
  facades: Record<FacadeStyle, FacadeTextures>;
  shop: FacadeTextures;
  tiles: THREE.CanvasTexture;
  concrete: THREE.CanvasTexture;
  asphalt: THREE.CanvasTexture;
  pavers: THREE.CanvasTexture;
  grass: THREE.CanvasTexture;
  dirt: THREE.CanvasTexture;
  glow: THREE.CanvasTexture;
}

export function createTextures(): TextureSet {
  seed = 1337;
  return {
    facades: { historic: facade('historic'), block: facade('block'), modern: facade('modern') },
    shop: shopfront(),
    tiles: tiles(),
    concrete: concrete(),
    asphalt: asphalt(),
    pavers: pavers(),
    grass: grass(),
    dirt: dirt(),
    glow: glow()
  };
}
