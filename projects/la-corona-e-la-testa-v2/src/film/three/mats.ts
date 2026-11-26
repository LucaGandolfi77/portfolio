/*
 * Materials and the textures painted for them at start-up (no image files):
 * marble, mosaic, stone, brick, wood, plaster, cloth, earth, water.
 * Everything is cached, so a material is shared by every mesh that uses it.
 */
import * as THREE from 'three';
import { hash } from '../util';

const textures = new Map<string, THREE.Texture>();
const materials = new Map<string, THREE.Material>();

type Paint = (g: CanvasRenderingContext2D, size: number) => void;

function canvasTexture(key: string, size: number, paint: Paint, repeat = 1, color = true): THREE.Texture {
  const id = `${key}:${repeat}`;
  const cached = textures.get(id);
  if (cached) return cached;
  const base = textures.get(`${key}:base`);
  let tex: THREE.Texture;
  if (base) {
    tex = base.clone();
  } else {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d')!;
    paint(g, size);
    tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    if (color) tex.colorSpace = THREE.SRGBColorSpace;
    textures.set(`${key}:base`, tex);
  }
  tex.repeat.set(repeat, repeat);
  tex.needsUpdate = true;
  textures.set(id, tex);
  return tex;
}

/** Soft value noise painted in a few octaves, the base of most surfaces. */
function noise(g: CanvasRenderingContext2D, size: number, seed: number, alpha: number, cells = [4, 8, 16, 32, 64]): void {
  cells.forEach((n, o) => {
    const step = size / n;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const v = hash(seed + x * 13.1 + y * 71.7 + o * 1000);
        g.fillStyle = `rgba(${v > 0.5 ? 255 : 0},${v > 0.5 ? 255 : 0},${v > 0.5 ? 255 : 0},${Math.abs(v - 0.5) * alpha * (0.7 / (o + 1) + 0.3)})`;
        g.fillRect(x * step, y * step, step + 1, step + 1);
      }
  });
}

const painters: Record<string, Paint> = {
  grain(g, s) {
    g.fillStyle = '#808080';
    g.fillRect(0, 0, s, s);
    noise(g, s, 3, 0.5, [16, 32, 64, 128]);
  },
  cloth(g, s) {
    g.fillStyle = '#e8e8e8';
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < s; i += 2) {
      g.fillStyle = `rgba(0,0,0,${0.05 + hash(i) * 0.06})`;
      g.fillRect(0, i, s, 1);
      g.fillStyle = `rgba(0,0,0,${0.04 + hash(i + 99) * 0.05})`;
      g.fillRect(i, 0, 1, s);
    }
    noise(g, s, 11, 0.18, [8, 16, 32]);
  },
  marble(g, s) {
    g.fillStyle = '#ece6da';
    g.fillRect(0, 0, s, s);
    noise(g, s, 5, 0.12);
    g.lineCap = 'round';
    for (let v = 0; v < 9; v++) {
      g.strokeStyle = `rgba(120,108,96,${0.12 + hash(v) * 0.2})`;
      g.lineWidth = 0.6 + hash(v + 3) * 2.2;
      g.beginPath();
      let x = hash(v + 10) * s;
      let y = 0;
      g.moveTo(x, y);
      while (y < s) {
        x += (hash(x + y + v) - 0.5) * 30;
        y += 10 + hash(y + v) * 18;
        g.lineTo(x, y);
      }
      g.stroke();
    }
  },
  porphyry(g, s) {
    g.fillStyle = '#5a1e2a';
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 2400; i++) {
      g.fillStyle = hash(i) > 0.7 ? 'rgba(230,200,190,0.5)' : 'rgba(20,4,8,0.4)';
      g.fillRect(hash(i * 3.1) * s, hash(i * 7.7) * s, 1 + hash(i) * 2, 1 + hash(i * 2) * 2);
    }
    noise(g, s, 21, 0.14);
  },
  mosaic(g, s) {
    /* Gold tesserae with a meander border, as in a late-Roman apse. */
    const n = 64;
    const step = s / n;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const v = hash(x * 3.3 + y * 17.1);
        const border = y % 32 < 3 || y % 32 > 28;
        const r = border ? 70 + v * 30 : 200 + v * 50;
        const gg = border ? 24 + v * 10 : 150 + v * 40;
        const b = border ? 40 + v * 20 : 50 + v * 30;
        g.fillStyle = `rgb(${r},${gg},${b})`;
        g.fillRect(x * step + 0.6, y * step + 0.6, step - 1.2, step - 1.2);
      }
  },
  floorMosaic(g, s) {
    /* Black and white geometric floor of the palace. */
    g.fillStyle = '#d8ccb4';
    g.fillRect(0, 0, s, s);
    const n = 48;
    const step = s / n;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const cx = (x % 16) - 7.5;
        const cy = (y % 16) - 7.5;
        const d = Math.abs(cx) + Math.abs(cy);
        const ring = Math.floor(d) % 4 === 0 || Math.max(Math.abs(cx), Math.abs(cy)) > 7;
        const v = hash(x * 5.3 + y * 9.1) * 30;
        g.fillStyle = ring ? `rgb(${50 + v},${30 + v},${30 + v})` : `rgb(${210 + v},${196 + v},${170 + v})`;
        if (d < 2.2) g.fillStyle = `rgb(${150 + v},${50},${40})`;
        g.fillRect(x * step + 0.5, y * step + 0.5, step - 1, step - 1);
      }
  },
  stone(g, s) {
    /* Squared blocks of a wall. */
    g.fillStyle = '#9a9184';
    g.fillRect(0, 0, s, s);
    const rows = 8;
    const h = s / rows;
    for (let r = 0; r < rows; r++) {
      const off = r % 2 ? h : 0;
      for (let x = -off; x < s; x += h * 2) {
        const v = hash(r * 31 + x) * 40 - 20;
        g.fillStyle = `rgb(${150 + v},${142 + v},${128 + v})`;
        g.fillRect(x + 2, r * h + 2, h * 2 - 4, h - 4);
      }
    }
    noise(g, s, 7, 0.2);
  },
  brick(g, s) {
    g.fillStyle = '#6a4a3a';
    g.fillRect(0, 0, s, s);
    const rows = 16;
    const h = s / rows;
    for (let r = 0; r < rows; r++) {
      const off = r % 2 ? h * 1.5 : 0;
      for (let x = -off; x < s; x += h * 3) {
        const v = hash(r * 17 + x * 0.3) * 36 - 18;
        g.fillStyle = `rgb(${172 + v},${92 + v * 0.6},${62 + v * 0.4})`;
        g.fillRect(x + 1.5, r * h + 1.5, h * 3 - 3, h - 3);
      }
    }
    noise(g, s, 17, 0.16);
  },
  wood(g, s) {
    g.fillStyle = '#7a5434';
    g.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      const v = Math.sin(x * 0.21 + Math.sin(x * 0.037) * 4) * 0.5 + 0.5;
      g.fillStyle = `rgba(40,20,8,${0.08 + v * 0.18})`;
      g.fillRect(x, 0, 1, s);
    }
    noise(g, s, 23, 0.1, [4, 8, 16]);
  },
  plaster(g, s) {
    g.fillStyle = '#d8c8a8';
    g.fillRect(0, 0, s, s);
    noise(g, s, 31, 0.22);
  },
  earth(g, s) {
    g.fillStyle = '#7a6a4c';
    g.fillRect(0, 0, s, s);
    noise(g, s, 41, 0.3);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(${hash(i) > 0.5 ? '40,34,24' : '180,170,140'},0.35)`;
      g.fillRect(hash(i * 1.3) * s, hash(i * 2.9) * s, 2, 2);
    }
  },
  grass(g, s) {
    g.fillStyle = '#5c6e34';
    g.fillRect(0, 0, s, s);
    noise(g, s, 51, 0.3);
    for (let i = 0; i < 3000; i++) {
      const v = hash(i * 1.7);
      g.strokeStyle = `rgba(${60 + v * 80},${90 + v * 70},${30 + v * 30},0.6)`;
      const x = hash(i * 3.3) * s;
      const y = hash(i * 5.1) * s;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (v - 0.5) * 4, y - 3 - v * 5);
      g.stroke();
    }
  },
  paving(g, s) {
    /* Big square stones of the piazza. */
    g.fillStyle = '#3a3634';
    g.fillRect(0, 0, s, s);
    const n = 4;
    const step = s / n;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const v = hash(x * 11 + y * 7) * 30 - 15;
        g.fillStyle = `rgb(${150 + v},${140 + v},${126 + v})`;
        g.fillRect(x * step + 3, y * step + 3, step - 6, step - 6);
      }
    noise(g, s, 61, 0.18);
  },
  cobble(g, s) {
    g.fillStyle = '#4a4238';
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 260; i++) {
      const v = hash(i) * 40;
      g.fillStyle = `rgb(${120 + v},${110 + v},${96 + v})`;
      g.beginPath();
      g.ellipse(hash(i * 1.9) * s, hash(i * 3.7) * s, 7 + hash(i * 5) * 6, 6 + hash(i * 7) * 5, hash(i) * 3, 0, Math.PI * 2);
      g.fill();
    }
  },
  roof(g, s) {
    g.fillStyle = '#7a3a24';
    g.fillRect(0, 0, s, s);
    const rows = 12;
    const h = s / rows;
    for (let r = 0; r < rows; r++)
      for (let x = 0; x < s; x += h * 0.8) {
        const v = hash(r * 13 + x) * 40 - 20;
        g.fillStyle = `rgb(${170 + v},${84 + v * 0.5},${52 + v * 0.3})`;
        g.beginPath();
        g.ellipse(x + (r % 2) * h * 0.4, r * h + h * 0.5, h * 0.38, h * 0.55, 0, 0, Math.PI * 2);
        g.fill();
      }
  },
  water(g, s) {
    /* A height field drawn as a normal map: soft overlapping ripples. */
    const img = g.createImageData(s, s);
    for (let y = 0; y < s; y++)
      for (let x = 0; x < s; x++) {
        const u = (x / s) * Math.PI * 2;
        const v = (y / s) * Math.PI * 2;
        const dx = Math.cos(u * 3 + v * 2) * 0.5 + Math.cos(u * 7 - v * 3) * 0.3 + Math.cos(u * 13 + v * 11) * 0.15;
        const dy = Math.sin(v * 4 + u) * 0.5 + Math.sin(v * 9 - u * 5) * 0.3 + Math.sin(v * 15 + u * 7) * 0.15;
        const i = (y * s + x) * 4;
        img.data[i] = 128 + dx * 60;
        img.data[i + 1] = 128 + dy * 60;
        img.data[i + 2] = 255;
        img.data[i + 3] = 255;
      }
    g.putImageData(img, 0, 0);
  },
};

export function tex(name: keyof typeof painters, repeat = 1, color = true): THREE.Texture {
  return canvasTexture(name, name === 'water' ? 256 : 512, painters[name], repeat, color);
}

export interface MatOpts {
  color?: string;
  rough?: number;
  metal?: number;
  map?: keyof typeof painters;
  bump?: keyof typeof painters;
  bumpScale?: number;
  repeat?: number;
  emissive?: string;
  emissiveIntensity?: number;
  side?: THREE.Side;
  transparent?: boolean;
  opacity?: number;
  flat?: boolean;
}

/** A shared standard material. */
export function mat(o: MatOpts): THREE.MeshStandardMaterial {
  const key = JSON.stringify(o);
  const cached = materials.get(key);
  if (cached) return cached as THREE.MeshStandardMaterial;
  const m = new THREE.MeshStandardMaterial({
    color: o.color ?? '#ffffff',
    roughness: o.rough ?? 0.8,
    metalness: o.metal ?? 0,
    side: o.side ?? THREE.FrontSide,
    transparent: o.transparent ?? false,
    opacity: o.opacity ?? 1,
    flatShading: o.flat ?? false,
  });
  if (o.map) m.map = tex(o.map, o.repeat ?? 1);
  if (o.bump) {
    m.bumpMap = tex(o.bump, o.repeat ?? 1, false);
    m.bumpScale = o.bumpScale ?? 1;
  }
  if (o.emissive) {
    m.emissive = new THREE.Color(o.emissive);
    m.emissiveIntensity = o.emissiveIntensity ?? 1;
  }
  materials.set(key, m);
  return m;
}

/** An unlit, glowing material (flames, windows at night, halos). */
export function glowMat(color: string, opacity = 1, additive = true): THREE.MeshBasicMaterial {
  const key = `glow:${color}:${opacity}:${additive}`;
  const cached = materials.get(key);
  if (cached) return cached as THREE.MeshBasicMaterial;
  const m = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    toneMapped: false,
    fog: false,
  });
  materials.set(key, m);
  return m;
}

let glowTexture: THREE.Texture | null = null;
/** A soft round spot, for sprites of light. */
export function spotTexture(): THREE.Texture {
  if (glowTexture) return glowTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  glowTexture = new THREE.CanvasTexture(c);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  return glowTexture;
}

export function glowSprite(color: string, size: number, opacity = 1): THREE.Sprite {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: spotTexture(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false }),
  );
  s.scale.set(size, size, size);
  return s;
}

/** Materials of a shot that is carved in stone: every figure part becomes this. */
export const STONE = (): THREE.MeshStandardMaterial => mat({ color: '#d6c4a4', rough: 0.92, bump: 'grain', bumpScale: 1.2, repeat: 2 });
