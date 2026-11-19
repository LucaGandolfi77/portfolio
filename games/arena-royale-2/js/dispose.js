/* Arena Royale 2 — GPU resource cleanup (prevents leaks across matches) */

import * as THREE from 'three';

function disposeMaterial(material) {
  if (!material) return;
  const materials = Array.isArray(material) ? material : [material];
  for (const mat of materials) {
    for (const value of Object.values(mat)) {
      if (value && value.isTexture) value.dispose();
    }
    if (typeof mat.dispose === 'function') mat.dispose();
  }
}

export function disposeObject(object) {
  if (!object) return;
  object.traverse(child => {
    if (child.geometry && typeof child.geometry.dispose === 'function') child.geometry.dispose();
    if (child.material) disposeMaterial(child.material);
  });
  if (object.parent) object.parent.remove(object);
}

export function disposeArray(list, key = 'grp') {
  for (const item of list) disposeObject(item[key] || item.mesh);
  list.length = 0;
}

export function disposeMesh(mesh) { disposeObject(mesh); }

export { THREE };
