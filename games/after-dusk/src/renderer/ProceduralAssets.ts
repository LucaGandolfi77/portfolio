import * as THREE from 'three';

function canvas(size = 512): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')!];
}

function texture(c: HTMLCanvasElement, repeatX = 1, repeatY = 1, srgb = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 4;
  return t;
}

function grain(ctx: CanvasRenderingContext2D, size: number, amount: number, alpha = 0.05) {
  for (let i = 0; i < amount; i++) {
    const v = (Math.random() * 255) | 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${alpha})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

export function woodTexture(repeat = 3): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const [c, ctx] = canvas(512);
  const [b, bctx] = canvas(512);
  ctx.fillStyle = '#5e4332';
  ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 512, 512);

  for (let y = 0; y < 512; y += 48) {
    ctx.fillStyle = (y / 48) % 2 ? 'rgba(205,162,122,.09)' : 'rgba(18,10,6,.10)';
    ctx.fillRect(0, y, 512, 48);
    ctx.fillStyle = '#241610';
    ctx.fillRect(0, y, 512, 2);
    bctx.fillStyle = '#202020';
    bctx.fillRect(0, y, 512, 3);
    for (let g = 5; g < 48; g += 5) {
      ctx.strokeStyle = `rgba(34,20,12,${0.16 + Math.random() * 0.22})`;
      bctx.strokeStyle = `rgba(155,155,155,${0.18 + Math.random() * 0.2})`;
      ctx.lineWidth = 1;
      bctx.lineWidth = 1;
      ctx.beginPath();
      bctx.beginPath();
      for (let x = 0; x <= 512; x += 12) {
        const yy = y + g + Math.sin(x * 0.02 + g * 0.6 + y) * 2.1;
        x === 0 ? (ctx.moveTo(x, yy), bctx.moveTo(x, yy)) : (ctx.lineTo(x, yy), bctx.lineTo(x, yy));
      }
      ctx.stroke();
      bctx.stroke();
    }
  }
  grain(ctx, 512, 3200, 0.035);
  return { map: texture(c, repeat, repeat, true), bump: texture(b, repeat, repeat, false) };
}

export function wallTexture(repeat = 2): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const [c, ctx] = canvas(512);
  const [b, bctx] = canvas(512);
  ctx.fillStyle = '#beb5a6';
  ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 110; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 14 + Math.random() * 44;
    const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, Math.random() < 0.5 ? 'rgba(255,250,235,.07)' : 'rgba(90,78,66,.06)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    bctx.fillStyle = Math.random() < 0.5 ? 'rgba(200,200,200,0.06)' : 'rgba(60,60,60,0.06)';
    bctx.beginPath();
    bctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
    bctx.fill();
  }
  grain(ctx, 512, 8000, 0.04);
  grain(bctx, 512, 8000, 0.08);
  return { map: texture(c, repeat, repeat, true), bump: texture(b, repeat, repeat, false) };
}

export function brickTexture(repeatX = 3, repeatY = 2): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const [c, ctx] = canvas(512);
  const [b, bctx] = canvas(512);
  ctx.fillStyle = '#2d333d';
  ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#303030';
  bctx.fillRect(0, 0, 512, 512);

  const bh = 32;
  const bw = 64;
  for (let row = 0; row < 16; row++) {
    const off = (row % 2) * (bw / 2);
    for (let col = -1; col < 9; col++) {
      const x = col * bw + off;
      const y = row * bh;
      const shade = 44 + Math.floor(Math.random() * 18);
      ctx.fillStyle = `rgb(${shade + 12},${shade + 4},${shade + 8})`;
      ctx.fillRect(x + 2, y + 2, bw - 4, bh - 4);
      bctx.fillStyle = '#b8b8b8';
      bctx.fillRect(x + 2, y + 2, bw - 4, bh - 4);
    }
  }
  grain(ctx, 512, 5000, 0.04);
  return { map: texture(c, repeatX, repeatY, true), bump: texture(b, repeatX, repeatY, false) };
}

export function wetAsphaltTexture(repeat = 8): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const [c, ctx] = canvas(512);
  ctx.fillStyle = '#151a23';
  ctx.fillRect(0, 0, 512, 512);
  grain(ctx, 512, 14000, 0.065);

  const [r, rctx] = canvas(512);
  rctx.fillStyle = '#d4d4d4';
  rctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 22; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const rad = 28 + Math.random() * 60;
    const grd = rctx.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, 'rgba(28,28,28,0.9)');
    grd.addColorStop(1, 'rgba(210,210,210,0)');
    rctx.fillStyle = grd;
    rctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  return { map: texture(c, repeat, repeat, true), roughnessMap: texture(r, repeat, repeat, false) };
}

export function carpetTexture(repeat = 4): THREE.CanvasTexture {
  const [c, ctx] = canvas(256);
  ctx.fillStyle = '#5c4944';
  ctx.fillRect(0, 0, 256, 256);
  grain(ctx, 256, 15000, 0.08);
  ctx.strokeStyle = 'rgba(225,195,155,.09)';
  ctx.lineWidth = 1;
  for (let i = -256; i < 256; i += 24) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 256, 256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(i + 256, 0); ctx.lineTo(i, 256); ctx.stroke();
  }
  return texture(c, repeat, repeat);
}

export function tileTexture(repeat = 4): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const [c, ctx] = canvas(256);
  const [b, bctx] = canvas(256);
  ctx.fillStyle = '#859296';
  ctx.fillRect(0, 0, 256, 256);
  bctx.fillStyle = '#c0c0c0';
  bctx.fillRect(0, 0, 256, 256);
  for (let ty = 0; ty < 4; ty++) {
    for (let tx = 0; tx < 4; tx++) {
      const shade = 132 + Math.floor(Math.random() * 20);
      ctx.fillStyle = `rgb(${shade - 10},${shade},${shade + 3})`;
      ctx.fillRect(tx * 64 + 2, ty * 64 + 2, 60, 60);
    }
  }
  ctx.strokeStyle = '#566264';
  ctx.lineWidth = 3;
  bctx.strokeStyle = '#303030';
  bctx.lineWidth = 4;
  for (let i = 0; i <= 256; i += 64) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
    bctx.beginPath(); bctx.moveTo(i, 0); bctx.lineTo(i, 256); bctx.stroke();
    bctx.beginPath(); bctx.moveTo(0, i); bctx.lineTo(256, i); bctx.stroke();
  }
  return { map: texture(c, repeat, repeat, true), bump: texture(b, repeat, repeat, false) };
}

export function fabricTexture(color: string, repeat = 2): THREE.CanvasTexture {
  const [c, ctx] = canvas(256);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 3) {
    ctx.fillStyle = 'rgba(255,255,255,.045)';
    ctx.fillRect(i, 0, 1, 256);
    ctx.fillStyle = 'rgba(0,0,0,.035)';
    ctx.fillRect(0, i, 256, 1);
  }
  grain(ctx, 256, 3000, 0.03);
  return texture(c, repeat, repeat);
}

export function photoTexture(seed: number): THREE.CanvasTexture {
  const [c, ctx] = canvas(128);
  ctx.fillStyle = '#c9bda6';
  ctx.fillRect(0, 0, 128, 128);
  const hue = 20 + (Math.abs(Math.floor(seed)) * 37) % 60;
  const sky = ctx.createLinearGradient(0, 8, 0, 96);
  sky.addColorStop(0, `hsl(${hue},35%,68%)`);
  sky.addColorStop(1, `hsl(${hue + 20},25%,42%)`);
  ctx.fillStyle = sky;
  ctx.fillRect(8, 8, 112, 88);
  for (let i = 0; i < 3; i++) {
    const x = 30 + i * 32;
    ctx.fillStyle = `rgba(30,25,25,${0.48 + i * 0.12})`;
    ctx.beginPath(); ctx.arc(x, 52 + (i % 2) * 6, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 11, 62 + (i % 2) * 6, 22, 34);
  }
  ctx.strokeStyle = 'rgba(240,230,200,.6)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(58, 45); ctx.lineTo(66, 58); ctx.stroke();
  ctx.fillStyle = '#efe6d3';
  ctx.fillRect(0, 100, 128, 28);
  ctx.fillStyle = '#6b6154';
  ctx.font = '10px sans-serif';
  ctx.fillText(['SUMMER 1998', 'MOM & DAD', 'EMMA, AGE 9', 'THE OLD HOUSE'][Math.abs(Math.floor(seed)) % 4], 9, 118);
  return texture(c);
}

export interface Materials {
  wall: THREE.MeshStandardMaterial;
  brick: THREE.MeshStandardMaterial;
  floorWood: THREE.MeshStandardMaterial;
  carpet: THREE.MeshStandardMaterial;
  tile: THREE.MeshStandardMaterial;
  darkWood: THREE.MeshStandardMaterial;
  warmWood: THREE.MeshStandardMaterial;
  fabricBlue: THREE.MeshStandardMaterial;
  fabricRed: THREE.MeshStandardMaterial;
  fabricSage: THREE.MeshStandardMaterial;
  fabricCream: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
  ceramic: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  mirror: THREE.MeshStandardMaterial;
  plastic: THREE.MeshStandardMaterial;
  paper: THREE.MeshStandardMaterial;
  screen: THREE.MeshStandardMaterial;
  bulb: THREE.MeshStandardMaterial;
  neonAmber: THREE.MeshStandardMaterial;
  neonPink: THREE.MeshStandardMaterial;
  shadow: THREE.MeshStandardMaterial;
  eye: THREE.MeshStandardMaterial;
  grass: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  concrete: THREE.MeshStandardMaterial;
  asphalt: THREE.MeshStandardMaterial;
}

export function createMaterials(): Materials {
  const std = (opts: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(opts);
  const wood = woodTexture(5);
  const darkW = woodTexture(2);
  const wall = wallTexture(2);
  const brick = brickTexture(3, 2);
  const tile = tileTexture(4);
  const asphaltTex = wetAsphaltTexture(10);

  return {
    wall: std({ map: wall.map, bumpMap: wall.bump, bumpScale: 0.015, roughness: 0.94 }),
    brick: std({ map: brick.map, bumpMap: brick.bump, bumpScale: 0.03, roughness: 0.9 }),
    floorWood: std({ map: wood.map, bumpMap: wood.bump, bumpScale: 0.018, roughness: 0.72 }),
    carpet: std({ map: carpetTexture(), roughness: 1 }),
    tile: std({ map: tile.map, bumpMap: tile.bump, bumpScale: 0.012, roughness: 0.42 }),
    darkWood: std({ map: darkW.map, bumpMap: darkW.bump, bumpScale: 0.014, color: 0x7c5a44, roughness: 0.62 }),
    warmWood: std({ map: darkW.map, color: 0xb5865d, roughness: 0.58 }),
    fabricBlue: std({ map: fabricTexture('#3a5064'), roughness: 0.95 }),
    fabricRed: std({ map: fabricTexture('#753642'), roughness: 0.95 }),
    fabricSage: std({ map: fabricTexture('#46615a'), roughness: 0.95 }),
    fabricCream: std({ map: fabricTexture('#d9cfc0'), roughness: 0.95 }),
    metal: std({ color: 0x9aa6b0, metalness: 0.85, roughness: 0.28 }),
    brass: std({ color: 0xd9b066, metalness: 0.88, roughness: 0.25 }),
    ceramic: std({ color: 0xe9e6df, roughness: 0.22, metalness: 0.05 }),
    glass: std({ color: 0xa4cde0, transparent: true, opacity: 0.2, roughness: 0.06, metalness: 0.15, side: THREE.DoubleSide }),
    mirror: std({ color: 0x7a8d9e, metalness: 0.92, roughness: 0.08 }),
    plastic: std({ color: 0x1c2128, roughness: 0.52, metalness: 0.14 }),
    paper: std({ color: 0xe6dfd0, roughness: 0.95 }),
    screen: std({ color: 0x0a1b26, emissive: 0x2a7692, emissiveIntensity: 0.9, roughness: 0.18 }),
    bulb: std({ color: 0xfff0cc, emissive: 0xffd592, emissiveIntensity: 2.1 }),
    neonAmber: std({ color: 0xffd48a, emissive: 0xffa63d, emissiveIntensity: 2.4 }),
    neonPink: std({ color: 0xff94b8, emissive: 0xff4284, emissiveIntensity: 2.4 }),
    shadow: std({ color: 0x040508, roughness: 1, metalness: 0, emissive: 0x080d14, emissiveIntensity: 0.42 }),
    eye: std({ color: 0x330008, emissive: 0xff2e46, emissiveIntensity: 4.2 }),
    grass: std({ color: 0x1b2b20, roughness: 1 }),
    foliage: std({ color: 0x223828, roughness: 0.92 }),
    concrete: std({ color: 0x454c54, roughness: 0.9 }),
    asphalt: std({ map: asphaltTex.map, roughnessMap: asphaltTex.roughnessMap, roughness: 0.72, metalness: 0.12 }),
  };
}

export function createPhoneModel(materials: Materials): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.162, 0.011), materials.plastic);
  g.add(body);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.166, 0.008), materials.metal);
  g.add(rim);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.146), materials.screen.clone());
  screen.position.z = 0.0062;
  g.add(screen);
  const cam = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.003, 10), materials.metal);
  cam.rotation.x = Math.PI / 2;
  cam.position.set(0.025, 0.069, 0.0095);
  g.add(cam);
  g.userData.screen = screen;
  return g;
}

export function createFlashlightModel(materials: Materials): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.14, 14), materials.metal);
  body.rotation.x = Math.PI / 2;
  g.add(body);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.023, 0.07, 14), materials.plastic);
  grip.rotation.x = Math.PI / 2;
  grip.position.z = 0.015;
  g.add(grip);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.02, 0.038, 14), materials.plastic);
  head.rotation.x = Math.PI / 2;
  head.position.z = -0.082;
  g.add(head);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.027, 16), materials.bulb);
  lens.position.z = -0.102;
  lens.rotation.y = Math.PI;
  g.add(lens);
  return g;
}
