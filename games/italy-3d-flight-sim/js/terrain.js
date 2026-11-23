/* Italy 3D Flight Sim — real-data Three.js world (terrain, water, cities, airports) */

import * as THREE from '../../_vendor/three.module.js';
import { AIRPORTS, WORLD } from './config.js';
import { elevationAt, geoToWorld, terrainHeight, vectorData, worldPolygon, insideItaly } from './geo.js';
import { seededRandom } from '../../_kit/core.js';
import { buildRealBuildings, realCityCenters } from './buildings.js';

function labelSprite(text, color = '#eaf6ff') {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(6,22,40,0.75)';
  ctx.roundRect?.(0, 0, 256, 64, 12);
  ctx.fillRect(0, 0, 256, 64);
  ctx.font = '700 30px ui-monospace, monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, 128, 42);
  const tex = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(70, 17, 1);
  return sprite;
}

export function terrainColor(h) {
  if (h > 300) return new THREE.Color('#e8eef2');
  if (h > 230) return new THREE.Color('#8a8f96');
  if (h > 150) return new THREE.Color('#5b6b54');
  if (h > 40) return new THREE.Color('#4a7b4e');
  return new THREE.Color('#5f8a5a');
}

function buildTerrain(quality, imageryTexture) {
  const seg = quality === 'low' ? 160 : 256;
  const geo = new THREE.PlaneGeometry(WORLD.width, WORLD.depth, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = terrainHeight(x, z);
    pos.setY(i, h);
    const c = imageryTexture
      ? new THREE.Color().setRGB(0.9 + Math.min(0.1, h / 6000), 0.92 + Math.min(0.08, h / 8000), 0.9)
      : terrainColor(h);
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  if (imageryTexture) {
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.userData.satColors = new Float32Array(colors);
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.95, metalness: 0,
    map: imageryTexture || null,
    color: imageryTexture ? '#ffffff' : '#ffffff'
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return mesh;
}

function shapeFromRing(ring, y) {
  const pts = worldPolygon(ring).map(p => new THREE.Vector2(p.x, -p.z));
  const shape = new THREE.Shape(pts);
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  const positions = geo.attributes.position;
  for (let i = 0; i < positions.count; i++) positions.setY(i, y);
  geo.computeVertexNormals();
  return geo;
}

function buildWater(vectors, group) {
  const seaGeo = new THREE.PlaneGeometry(4200, 3800);
  seaGeo.rotateX(-Math.PI / 2);
  const seaMat = new THREE.MeshStandardMaterial({
    color: '#1b6b93', roughness: 0.35, metalness: 0.15, transparent: true, opacity: 0.94
  });
  const sea = new THREE.Mesh(seaGeo, seaMat);
  sea.position.y = 0;
  group.add(sea);

  const lakeMat = new THREE.MeshStandardMaterial({ color: '#2e8fb5', roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide });
  for (const ring of vectors.lakes) {
    const pts = worldPolygon(ring);
    let cy = 0;
    for (const p of pts) cy += terrainHeight(p.x, p.z);
    cy = Math.max(2, cy / pts.length - 1);
    group.add(new THREE.Mesh(shapeFromRing(ring, cy), lakeMat));
  }
  const riverMat = new THREE.MeshStandardMaterial({ color: '#3b9ac2', roughness: 0.4 });
  for (const line of vectors.rivers) {
    const pts = worldPolygon(line).map(p => new THREE.Vector3(p.x, terrainHeight(p.x, p.z) + 2.5, p.z));
    if (pts.length < 2) continue;
    const curve = new THREE.CatmullRomCurve3(pts);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, Math.min(120, pts.length * 2), 1.8, 5, false), riverMat));
  }
  return sea;
}

function buildCoastline(group, vectors) {
  const shallow = new THREE.MeshBasicMaterial({
    color: '#54c4d8', transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false
  });
  const foam = new THREE.LineBasicMaterial({ color: '#d8fbff', transparent: true, opacity: 0.85 });
  const meshes = [];
  for (const ring of vectors.coastline) {
    const pts = worldPolygon(ring);
    if (pts.length < 3) continue;
    let cx = 0, cz = 0;
    for (const p of pts) { cx += p.x; cz += p.z; }
    cx /= pts.length; cz /= pts.length;
    const outer = pts.map((p, i) => {
      const prev = pts[(i - 1 + pts.length) % pts.length];
      const next = pts[(i + 1) % pts.length];
      const tx = next.x - prev.x, tz = next.z - prev.z;
      let nx = -tz, nz = tx;
      const len = Math.hypot(nx, nz) || 1;
      nx /= len; nz /= len;
      if (nx * (p.x - cx) + nz * (p.z - cz) < 0) { nx = -nx; nz = -nz; }
      return { x: p.x + nx * 16, z: p.z + nz * 16 };
    });
    const positions = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const ao = outer[i], bo = outer[(i + 1) % pts.length];
      positions.push(a.x, 2.4, a.z, ao.x, 2.2, ao.z, b.x, 2.4, b.z);
      positions.push(b.x, 2.4, b.z, ao.x, 2.2, ao.z, bo.x, 2.2, bo.z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mesh = new THREE.Mesh(geo, shallow);
    group.add(mesh);
    meshes.push(mesh);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, 3.2, p.z)));
    group.add(new THREE.LineLoop(lineGeo, foam));
  }
  return meshes;
}

function buildVegetation(group, quality) {
  const rng = seededRandom(9911);
  const count = quality === 'low' ? 450 : 1600;
  const geo = new THREE.ConeGeometry(2.6, 9, 5);
  geo.translate(0, 4.5, 0);
  const mat = new THREE.MeshStandardMaterial({ color: '#204f34', roughness: 1 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  let placed = 0;
  for (let tries = 0; tries < count * 12 && placed < count; tries++) {
    const x = (rng() - 0.5) * WORLD.width * 0.94;
    const z = (rng() - 0.5) * WORLD.depth * 0.94;
    const { lon, lat } = { lon: WORLD.minLon + (x + WORLD.width / 2) / WORLD.width * (WORLD.maxLon - WORLD.minLon), lat: WORLD.minLat - (z - WORLD.depth / 2) / WORLD.depth * (WORLD.maxLat - WORLD.minLat) };
    if (!insideItaly(lon, lat)) continue;
    const h = elevationAt(lon, lat);
    if (h < 80 || h > 1700) continue;
    dummy.position.set(x, terrainHeight(x, z), z);
    dummy.rotation.y = rng() * Math.PI;
    const s = 0.6 + rng() * 0.9;
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    mesh.setMatrixAt(placed++, dummy.matrix);
  }
  mesh.count = placed;
  group.add(mesh);
}

function buildCities(group, vectors, quality) {
  const rng = seededRandom(4242);
  const realCenters = realCityCenters();
  const urban = vectors.urban.filter(u => {
    if (u.pop <= 30000) return false;
    const clon = u.ring.reduce((s, p) => s + p[0], 0) / u.ring.length;
    const clat = u.ring.reduce((s, p) => s + p[1], 0) / u.ring.length;
    return !realCenters.some(([lon, lat]) => Math.abs(lon - clon) < 0.055 && Math.abs(lat - clat) < 0.055);
  }).slice(0, quality === 'low' ? 30 : 70);
  const perCity = quality === 'low' ? 12 : 34;
  const geo = new THREE.BoxGeometry(5, 1, 5);
  geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ color: '#c9d4da', roughness: 0.8, metalness: 0.05 });
  const total = urban.length * perCity;
  const mesh = new THREE.InstancedMesh(geo, mat, total);
  const dummy = new THREE.Object3D();
  let n = 0;
  for (const area of urban) {
    const pts = worldPolygon(area.ring);
    const xs = pts.map(p => p.x), zs = pts.map(p => p.z);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs);
    const base = Math.min(...pts.map(p => terrainHeight(p.x, p.z)));
    const scale = Math.min(1.6, 0.6 + Math.log10(area.pop + 10) / 6);
    for (let i = 0; i < perCity; i++) {
      const x = minX + rng() * (maxX - minX);
      const z = minZ + rng() * (maxZ - minZ);
      const h = (6 + rng() * 46) * scale;
      dummy.position.set(x, terrainHeight(x, z), z);
      dummy.scale.set(0.7 + rng() * 0.9, h, 0.7 + rng() * 0.9);
      dummy.rotation.y = rng() * Math.PI;
      dummy.updateMatrix();
      mesh.setMatrixAt(n++, dummy.matrix);
    }
  }
  mesh.count = n;
  group.add(mesh);

  for (const city of vectors.cities.slice(0, quality === 'low' ? 8 : 18)) {
    const p = geoToWorld(city.lon, city.lat);
    const label = labelSprite(city.name.toUpperCase());
    label.position.set(p.x, terrainHeight(p.x, p.z) + 95, p.z);
    group.add(label);
  }
}

function buildAirports(group) {
  const runwayMat = new THREE.MeshStandardMaterial({ color: '#3b4550', roughness: 1 });
  const markMat = new THREE.MeshBasicMaterial({ color: '#f4f7fb' });
  for (const a of AIRPORTS) {
    const p = geoToWorld(a.lon, a.lat);
    const y = terrainHeight(p.x, p.z) + 1.2;
    const angle = a.rwy * Math.PI / 180;
    const g = new THREE.Group();
    g.position.set(p.x, y, p.z);
    g.rotation.y = -angle;
    const rwy = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, 120), runwayMat);
    g.add(rwy);
    for (let i = -4; i <= 4; i++) {
      const mark = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 8), markMat);
      mark.position.set(0, 0.8, i * 12);
      g.add(mark);
    }
    const terminal = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 16), new THREE.MeshStandardMaterial({ color: '#8fa7b8' }));
    terminal.position.set(24, 4, -30);
    g.add(terminal);
    group.add(g);
    const label = labelSprite(a.code, '#ffd166');
    label.scale.set(44, 11, 1);
    label.position.set(p.x, y + 55, p.z);
    group.add(label);
  }
}

export function createWorld(scene, quality = 'high', imageryTexture = null) {
  const group = new THREE.Group();
  scene.add(group);
  const terrain = buildTerrain(quality, imageryTexture);
  group.add(terrain);
  const vectors = vectorData();
  const sea = buildWater(vectors, group);
  const coast = buildCoastline(group, vectors);
  buildVegetation(group, quality);
  buildCities(group, vectors, quality);
  const realBuildings = buildRealBuildings(group, quality);
  buildAirports(group);
  return { group, terrain, sea, coast, realBuildings };
}
