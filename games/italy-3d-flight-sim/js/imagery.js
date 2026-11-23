/* Italy 3D Flight Sim — assemble EOX Sentinel-2 tiles into one terrain texture */

import * as THREE from '../../_vendor/three.module.js';

let texture = null;

export function loadImagery(onProgress = () => {}) {
  const manifestPromise = fetch('./data/imagery-manifest.json').then(r => r.json());
  return manifestPromise.then(async manifest => {
    const size = 4096;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#8aa9b8';
    ctx.fillRect(0, 0, size, size);
    const tiles = manifest.tiles;
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const url = tile.path;
      try {
        const img = new Image();
        img.src = url;
        await img.decode();
        const x = tile.u0 * size, y = tile.v0 * size;
        const w = (tile.u1 - tile.u0) * size + 1, h = (tile.v1 - tile.v0) * size + 1;
        ctx.drawImage(img, x, y, w, h);
      } catch (e) { /* tile optional — background colour shows through */ }
      if (i % 24 === 0 || i === tiles.length - 1) onProgress((i + 1) / tiles.length);
    }
    texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  });
}

export function getImagery() { return texture; }
