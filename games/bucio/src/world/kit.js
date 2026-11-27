import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { withCloudShadows } from './cloudlight.js';

/**
 * I kit modellati in Blender (blender/build_kit.py → public/models/kit-<tema>.glb):
 * ogni ambientazione ha il suo file, con gli oggetti cotti nei colori di quel
 * tema, spigoli smussati e occlusione ambientale nei colori dei vertici.
 *
 * Sono facoltativi, ed è questo il backup: finché il kit non arriva, se non
 * si carica o se un oggetto non c'è, il prop usa la sua geometria procedurale
 * (props.js, props-extra.js, props-new.js). Il gioco funziona sempre.
 */
const kits = new Map(); // tema → Map(id → BufferGeometry)
const loading = new Map(); // tema → Promise<boolean>

/** Copia un attributo in float semplici (il kit è quantizzato). */
function floats(a) {
  const out = new Float32Array(a.count * a.itemSize);
  for (let i = 0; i < a.count; i++) {
    for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
  }
  return new THREE.BufferAttribute(out, a.itemSize);
}

function readParts(gltf) {
  const parts = new Map();
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
    if (!col) return; // senza colori cotti l'oggetto resta procedurale
    // L'alfa del colore cotto dice cosa brilla di luce propria (lampade,
    // neon, finestre accese): 1 = normale, 0.5 = luminoso.
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
    // gltfpack tiene i nomi sui nodi e chiama le mesh mesh_N
    const name = !o.name || /^mesh_\d+$/.test(o.name) ? o.parent?.name ?? '' : o.name;
    parts.set(name, geo);
  });
  return parts;
}

/** Carica il kit di un'ambientazione (una volta sola). Risolve sempre: true se c'è. */
export function loadKit(themeId) {
  let p = loading.get(themeId);
  if (!p) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const url = new URL(`models/kit-${themeId}.glb`, document.baseURI).href;
    p = loader
      .loadAsync(url)
      .then((gltf) => {
        const parts = readParts(gltf);
        kits.set(themeId, parts);
        return parts.size > 0;
      })
      .catch((err) => {
        console.warn(`[bucio] kit "${themeId}" non caricato, uso i modelli procedurali:`, err);
        loading.delete(themeId); // si riprova la prossima volta (es. tornati online)
        return false;
      });
    loading.set(themeId, p);
  }
  return p;
}

/** Aspetta il kit al massimo `ms`: oltre, si parte con il backup procedurale. */
export function kitReady(themeId, ms = 4000) {
  return Promise.race([loadKit(themeId), new Promise((ok) => setTimeout(() => ok(false), ms))]);
}

/** Quanti oggetti del kit sono pronti per un tema (lo legge anche il test E2E). */
export function kitSize(themeId) {
  return kits.get(themeId)?.size ?? 0;
}

/** La geometria scolpita di un prop in un tema, se il kit c'è. */
export function kitGeometry(id, themeId) {
  return kits.get(themeId)?.get(id);
}

let material = null;
/**
 * Ombreggiatura morbida (le normali del kit arrivano già divise sugli spigoli
 * vivi) più l'emissione dei vertici marcati `glow`: di notte lampioni, neon e
 * finestre restano accesi.
 */
export function kitMaterial() {
  if (!material) {
    material = new THREE.MeshLambertMaterial({ vertexColors: true });
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float glow;\nvarying float vGlow;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlow = glow;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vGlow;')
        .replace(
          '#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vColor.rgb * vGlow * 1.25;'
        );
    };
    material.customProgramCacheKey = () => 'bucio-kit-glow';
    withCloudShadows(material);
  }
  return material;
}
