/* Italy 3D Flight Sim — extrude real OSM building footprints into 3D meshes */

import * as THREE from '../../_vendor/three.module.js';
import { WORLD } from './config.js';
import { geoToWorld, terrainHeight } from './geo.js';

const BUILD_SCALE = 0.34;
let data = null;

export function initBuildingsData(json) { data = json; }
export function buildingsData() { return data; }

export function realCityCenters() {
  return data ? data.cities.map(c => [c.lon, c.lat]) : [];
}

export function buildRealBuildings(group, quality = 'high') {
  if (!data) return null;
  const maxCities = quality === 'low' ? 6 : 12;
  const perCity = quality === 'low' ? 600 : 1800;
  const made = [];
  for (const city of data.cities.slice(0, maxCities)) {
    const positions = [], normals = [], colors = [];
    const count = Math.min(perCity, city.buildings.length);
    const shade = new THREE.Color();
    for (let b = 0; b < count; b++) {
      const [ring, height] = city.buildings[b];
      if (!ring || ring.length < 4) continue;
      const pts = ring.slice(0, -1).map(([lon, lat]) => geoToWorld(lon, lat));
      if (pts.length < 3) continue;
      let cx = 0, cz = 0;
      for (const p of pts) { cx += p.x; cz += p.z; }
      cx /= pts.length; cz /= pts.length;
      const base = terrainHeight(cx, cz);
      const top = base + Math.max(2, height * BUILD_SCALE);
      const contour = pts.map(p => new THREE.Vector2(p.x, p.z));
      let faces = [];
      try { faces = THREE.ShapeUtils.triangulateShape(contour, []); } catch (e) { continue; }
      const roofColors = ['#ff9e80', '#9be7c4', '#ffe082', '#b3d9ff', '#f8bbd0', '#d0bfff'];
      shade.set(roofColors[(b + city.name.length) % roofColors.length]);
      for (const face of faces) {
        for (const idx of face) {
          const p = pts[idx];
          positions.push(p.x, top, p.z);
          normals.push(0, 1, 0);
          colors.push(shade.r, shade.g, shade.b);
        }
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], c = pts[(i + 1) % pts.length];
        const nx = -(c.z - a.z), nz = c.x - a.x;
        const len = Math.hypot(nx, nz) || 1;
        const n = [nx / len, 0, nz / len];
        const quad = [
          [a.x, base, a.z], [c.x, base, c.z], [c.x, top, c.z],
          [a.x, base, a.z], [c.x, top, c.z], [a.x, top, a.z]
        ];
        for (const v of quad) {
          positions.push(v[0], v[1], v[2]);
          normals.push(n[0], n[1], n[2]);
          colors.push(shade.r * 0.82, shade.g * 0.82, shade.b * 0.82);
        }
      }
    }
    if (!positions.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }));
    mesh.userData.city = city.name;
    mesh.userData.center = geoToWorld(city.lon, city.lat);
    group.add(mesh);
    made.push(mesh);
  }
  return made;
}
