import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

/**
 * Il kit modellato in Blender (blender/build_kit.py → public/models/kit.glb):
 * i 35 oggetti di Portomarina rifatti con spigoli smussati e occlusione
 * ambientale cotta nei colori dei vertici.
 *
 * È facoltativo: finché non arriva, se non si carica o con un'altra
 * ambientazione, ogni prop usa la sua geometria procedurale di props.js.
 */
const parts = new Map();
let loading = null;

/** Copia un attributo in float semplici (il kit è quantizzato). */
function floats(a) {
  const out = new Float32Array(a.count * a.itemSize);
  for (let i = 0; i < a.count; i++) {
    for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
  }
  return new THREE.BufferAttribute(out, a.itemSize);
}

export function loadKit(url = new URL('models/kit.glb', document.baseURI).href) {
  if (!loading) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loading = loader
      .loadAsync(url)
      .then((gltf) => {
        gltf.scene.updateMatrixWorld(true);
        gltf.scene.traverse((o) => {
          if (!o.isMesh) return;
          const src = o.geometry;
          const geo = new THREE.BufferGeometry();
          for (const name of ['position', 'normal', 'color']) {
            const a = src.getAttribute(name);
            if (a) geo.setAttribute(name, floats(a));
          }
          if (src.index) geo.setIndex(src.index.clone());
          geo.applyMatrix4(o.matrixWorld);
          const col = geo.getAttribute('color');
          if (col && col.itemSize === 4) {
            const rgb = new Float32Array(col.count * 3);
            for (let i = 0; i < col.count; i++) {
              rgb[i * 3] = col.getX(i);
              rgb[i * 3 + 1] = col.getY(i);
              rgb[i * 3 + 2] = col.getZ(i);
            }
            geo.setAttribute('color', new THREE.BufferAttribute(rgb, 3));
          }
          if (!geo.getAttribute('color')) return;
          geo.computeBoundingBox();
          geo.computeBoundingSphere();
          // gltfpack tiene i nomi sui nodi e chiama le mesh mesh_N
          const name = !o.name || /^mesh_\d+$/.test(o.name) ? o.parent?.name ?? '' : o.name;
          parts.set(name, geo);
        });
        // Per i test end-to-end: quanti oggetti del kit sono pronti.
        document.documentElement.dataset.kit = String(parts.size);
        return parts.size > 0;
      })
      .catch((err) => {
        console.warn('[bucio] kit Blender non caricato, uso i modelli procedurali:', err);
        document.documentElement.dataset.kit = '0';
        return false;
      });
  }
  return loading;
}

/** La geometria scolpita di un prop, se il kit c'è e copre quell'ambientazione. */
export function kitGeometry(id, themeId) {
  if (themeId !== 'portomarina') return undefined;
  return parts.get(id);
}

let material = null;
/** Ombreggiatura morbida: le normali del kit arrivano già divise sugli spigoli vivi. */
export function kitMaterial() {
  if (!material) material = new THREE.MeshLambertMaterial({ vertexColors: true });
  return material;
}
