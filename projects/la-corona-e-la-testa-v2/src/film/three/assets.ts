/*
 * The sculpted kit made in Blender (blender/build_kit.py → public/models/kit.glb):
 * heads, hands, feet, robes and cloaks for the actors, columns, the throne,
 * amphorae and braziers for the sets. Ambient occlusion is baked into the
 * vertex colours.
 *
 * Loading is optional: until the kit arrives, or if it fails, every builder
 * falls back to its own primitive shapes, so the film always plays.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export type KitPart =
  | 'head' | 'hand' | 'foot' | 'torso' | 'sleeve' | 'forearm' | 'skirt_50' | 'skirt_75' | 'skirt_100' | 'cape'
  | 'beard_short' | 'beard_full' | 'hair_short' | 'hair_curly' | 'hair_long' | 'hair_bun' | 'hair_fringe'
  | 'horse_body' | 'horse_saddle' | 'horse_neck' | 'horse_head' | 'horse_mane' | 'horse_fore' | 'horse_hind' | 'horse_shin' | 'horse_tail'
  | 'col_base' | 'col_shaft' | 'col_cap' | 'throne_gold' | 'throne_cloth' | 'amphora' | 'brazier';

const parts = new Map<string, THREE.BufferGeometry>();
let loading: Promise<boolean> | null = null;

/** Copies an attribute into plain floats (the kit is quantised). */
function floats(a: THREE.BufferAttribute | THREE.InterleavedBufferAttribute): THREE.BufferAttribute {
  const out = new Float32Array(a.count * a.itemSize);
  for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
  return new THREE.BufferAttribute(out, a.itemSize);
}

export function loadKit(url = new URL('models/kit.glb', document.baseURI).href): Promise<boolean> {
  if (!loading) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loading = loader
      .loadAsync(url)
      .then((gltf) => {
        gltf.scene.updateMatrixWorld(true);
        gltf.scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const src = mesh.geometry;
          const geo = new THREE.BufferGeometry();
          for (const name of ['position', 'normal', 'uv', 'color'] as const) {
            const a = src.getAttribute(name);
            if (a) geo.setAttribute(name, floats(a));
          }
          if (src.index) geo.setIndex(src.index.clone());
          geo.applyMatrix4(mesh.matrixWorld);
          const color = geo.getAttribute('color');
          if (color && color.itemSize === 4) {
            /* Keep RGB only: the alpha of baked AO is always one. */
            const rgb = new Float32Array(color.count * 3);
            for (let i = 0; i < color.count; i++) {
              rgb[i * 3] = color.getX(i);
              rgb[i * 3 + 1] = color.getY(i);
              rgb[i * 3 + 2] = color.getZ(i);
            }
            geo.setAttribute('color', new THREE.BufferAttribute(rgb, 3));
          }
          geo.computeBoundingSphere();
          /* gltfpack keeps the names on the nodes and calls the meshes mesh_N. */
          const name = !mesh.name || /^mesh_\d+$/.test(mesh.name) ? mesh.parent?.name ?? '' : mesh.name;
          parts.set(name, geo);
        });
        /* Exposed for the end-to-end test: how many parts the film can use. */
        document.documentElement.dataset.kit = String(parts.size);
        return parts.size > 0;
      })
      .catch(() => false);
  }
  return loading;
}

export function kit(name: KitPart): THREE.BufferGeometry | undefined {
  return parts.get(name);
}

/** The same material, multiplied by the baked occlusion of the kit. */
const withAoCache = new WeakMap<THREE.Material, THREE.Material>();
export function withAO<M extends THREE.Material>(m: M): M {
  let c = withAoCache.get(m) as M | undefined;
  if (!c) {
    c = m.clone() as M;
    (c as unknown as THREE.MeshStandardMaterial).vertexColors = true;
    withAoCache.set(m, c);
  }
  return c;
}

/** A shadowed mesh from the kit, or undefined when it is not loaded. */
export function kitMesh(name: KitPart, m: THREE.Material): THREE.Mesh | undefined {
  const g = kit(name);
  if (!g) return undefined;
  /* Without baked colours the AO material would render black. */
  const o = new THREE.Mesh(g, g.getAttribute('color') ? withAO(m) : m);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}
