import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const kits = new Map<string, Map<string, THREE.BufferGeometry>>();
const loading = new Map<string, Promise<boolean>>();

function floats(a: THREE.BufferAttribute | THREE.InterleavedBufferAttribute): THREE.BufferAttribute {
  const out = new Float32Array(a.count * a.itemSize);
  for (let i = 0; i < a.count; i++) {
    for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
  }
  return new THREE.BufferAttribute(out, a.itemSize);
}

function readParts(gltf: { scene: THREE.Group }): Map<string, THREE.BufferGeometry> {
  const parts = new Map<string, THREE.BufferGeometry>();
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const src = mesh.geometry;
    const geo = new THREE.BufferGeometry();
    for (const name of ['position', 'normal', 'color'] as const) {
      const a = src.getAttribute(name);
      if (a) geo.setAttribute(name, floats(a));
    }
    if (src.index) geo.setIndex(src.index.clone());
    geo.applyMatrix4(mesh.matrixWorld);
    const col = geo.getAttribute('color');
    if (!col) return;
    const glow = new Float32Array(col.count);
    if (col.itemSize === 4) {
      const rgb = new Float32Array(col.count * 3);
      for (let i = 0; i < col.count; i++) {
        rgb[i * 3] = col.getX(i);
        rgb[i * 3 + 1] = col.getY(i);
        rgb[i * 3 + 2] = col.getZ(i);
        glow[i] = col.getW(i) < 0.75 ? 1 : 0;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(rgb, 3));
    }
    geo.setAttribute('glow', new THREE.BufferAttribute(glow, 1));
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    const name = !o.name || /^mesh_\d+$/.test(o.name) ? o.parent?.name ?? '' : o.name;
    if (name) parts.set(name, geo);
  });
  return parts;
}

/** Lazy-loads a compressed Blender GLB kit; falls back gracefully when absent/offline. */
export function loadKit(packId: string): Promise<boolean> {
  let p = loading.get(packId);
  if (!p) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const url = new URL(`models/kit-${packId}.glb`, document.baseURI).href;
    p = loader
      .loadAsync(url)
      .then((gltf) => {
        const parts = readParts(gltf);
        kits.set(packId, parts);
        return parts.size > 0;
      })
      .catch(() => {
        loading.delete(packId);
        return false;
      });
    loading.set(packId, p);
  }
  return p;
}

export function kitReady(packId: string, ms = 4000): Promise<boolean> {
  return Promise.race([loadKit(packId), new Promise<boolean>((ok) => setTimeout(() => ok(false), ms))]);
}

export function kitSize(packId: string): number {
  return kits.get(packId)?.size ?? 0;
}

export function kitGeometry(id: string, packId: string): THREE.BufferGeometry | undefined {
  return kits.get(packId)?.get(id);
}

let material: THREE.MeshStandardMaterial | null = null;
export function kitMaterial(): THREE.MeshStandardMaterial {
  if (!material) {
    material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0.08 });
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float glow;\nvarying float vGlow;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlow = glow;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vGlow;')
        .replace(
          '#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vColor.rgb * vGlow * 1.5;'
        );
    };
    material.customProgramCacheKey = () => 'after-dusk-kit-glow';
  }
  return material;
}
