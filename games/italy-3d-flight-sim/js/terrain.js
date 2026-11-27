/* Italy 3D Flight Sim — real-data Three.js world (terrain, water, cities, airports) */

import * as THREE from '../../_vendor/three.module.js';
import { WORLD } from './config.js';
import { RUNWAY, airfields, onAirfield } from './airfields.js';
import { elevationAt, geoToWorld, terrainHeight, vectorData, worldPolygon, insideItaly } from './geo.js';
import { seededRandom } from '../../_kit/core.js';
import { buildRealBuildings, buildCityLights, realCityCenters } from './buildings.js';

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

export function happyColor(h) {
  if (h > 300) return new THREE.Color('#ffffff');
  if (h > 230) return new THREE.Color('#dfe7d2');
  if (h > 150) return new THREE.Color('#8fca79');
  if (h > 40) return new THREE.Color('#71c45a');
  return new THREE.Color('#82d16a');
}

function buildTerrain(quality, imageryTexture, visual) {
  const seg = quality === 'low' ? 160 : 256;
  const geo = new THREE.PlaneGeometry(WORLD.width, WORLD.depth, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = terrainHeight(x, z);
    pos.setY(i, h);
    const c = visual === 'happy' ? happyColor(h) : imageryTexture
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
  const happy = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const c = happyColor(pos.getY(i));
    happy[i * 3] = c.r; happy[i * 3 + 1] = c.g; happy[i * 3 + 2] = c.b;
  }
  geo.userData.happyColors = happy;
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

function rippleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.strokeStyle = 'rgba(255,255,255,0.32)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const y = (i / 14) * 128;
    ctx.beginPath();
    for (let x = 0; x <= 128; x += 4) ctx.lineTo(x, y + Math.sin(x * 0.12 + i) * 3);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(26, 26);
  return tex;
}

function buildWater(vectors, group, visual) {
  const happy = visual === 'happy';
  const seaGeo = new THREE.PlaneGeometry(4200, 3800);
  seaGeo.rotateX(-Math.PI / 2);
  const shimmer = rippleTexture();
  const seaMat = new THREE.MeshStandardMaterial({
    color: happy ? '#3fc3d6' : '#1b6b93', roughness: 0.28, metalness: 0.08,
    transparent: true, opacity: 0.94, map: happy ? shimmer : null
  });
  const sea = new THREE.Mesh(seaGeo, seaMat);
  sea.position.y = 0;
  sea.userData.shimmer = shimmer;
  group.add(sea);

  const lakeMat = new THREE.MeshStandardMaterial({ color: happy ? '#54cfe0' : '#2e8fb5', roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide });
  for (const ring of vectors.lakes) {
    const pts = worldPolygon(ring);
    let cy = 0;
    for (const p of pts) cy += terrainHeight(p.x, p.z);
    cy = Math.max(2, cy / pts.length - 1);
    group.add(new THREE.Mesh(shapeFromRing(ring, cy), lakeMat));
  }
  const riverMat = new THREE.MeshStandardMaterial({ color: happy ? '#5dd3e3' : '#3b9ac2', roughness: 0.4 });
  for (const line of vectors.rivers) {
    const pts = worldPolygon(line).map(p => new THREE.Vector3(p.x, terrainHeight(p.x, p.z) + 2.5, p.z));
    if (pts.length < 2) continue;
    const curve = new THREE.CatmullRomCurve3(pts);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, Math.min(120, pts.length * 2), 1.8, 5, false), riverMat));
  }
  return sea;
}

function buildCoastline(group, vectors, visual) {
  const happy = visual === 'happy';
  const shallow = new THREE.MeshBasicMaterial({
    color: happy ? '#9ce8d8' : '#54c4d8', transparent: true, opacity: happy ? 0.75 : 0.55,
    side: THREE.DoubleSide, depthWrite: false
  });
  const foam = new THREE.LineBasicMaterial({ color: happy ? '#ffffff' : '#d8fbff', transparent: true, opacity: 0.9 });
  const sand = new THREE.MeshBasicMaterial({ color: '#f6e2a8', side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
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
    if (happy) {
      const inner = pts.map((p, i) => ({
        x: p.x - (outer[i].x - p.x) * 0.55,
        z: p.z - (outer[i].z - p.z) * 0.55
      }));
      const sandPos = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        const ai = inner[i], bi = inner[(i + 1) % pts.length];
        sandPos.push(a.x, 2.6, a.z, ai.x, 2.7, ai.z, b.x, 2.6, b.z);
        sandPos.push(b.x, 2.6, b.z, ai.x, 2.7, ai.z, bi.x, 2.7, bi.z);
      }
      const sandGeo = new THREE.BufferGeometry();
      sandGeo.setAttribute('position', new THREE.Float32BufferAttribute(sandPos, 3));
      group.add(new THREE.Mesh(sandGeo, sand));
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, 3.2, p.z)));
    group.add(new THREE.LineLoop(lineGeo, foam));
  }
  return meshes;
}

function buildVegetation(group, quality, visual) {
  const rng = seededRandom(9911);
  const happy = visual === 'happy';
  const count = quality === 'low' ? (happy ? 700 : 450) : (happy ? 2800 : 1600);
  const geo = new THREE.ConeGeometry(happy ? 3.2 : 2.6, happy ? 11 : 9, happy ? 7 : 5);
  geo.translate(0, happy ? 5.5 : 4.5, 0);
  const mat = new THREE.MeshStandardMaterial({ color: happy ? '#ffffff' : '#204f34', roughness: 1 });
  const treeColors = ['#3fa34d', '#57b85a', '#2f8f45', '#74c96a', '#46a658'];
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  let placed = 0;
  for (let tries = 0; tries < count * 12 && placed < count; tries++) {
    const x = (rng() - 0.5) * WORLD.width * 0.94;
    const z = (rng() - 0.5) * WORLD.depth * 0.94;
    const { lon, lat } = { lon: WORLD.minLon + (x + WORLD.width / 2) / WORLD.width * (WORLD.maxLon - WORLD.minLon), lat: WORLD.minLat - (z - WORLD.depth / 2) / WORLD.depth * (WORLD.maxLat - WORLD.minLat) };
    if (!insideItaly(lon, lat)) continue;
    const h = elevationAt(lon, lat);
    if (h < 80 || h > 1700 || onAirfield(x, z)) continue;
    dummy.position.set(x, terrainHeight(x, z), z);
    dummy.rotation.y = rng() * Math.PI;
    const s = 0.6 + rng() * 0.9;
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    mesh.setMatrixAt(placed, dummy.matrix);
    if (happy) mesh.setColorAt(placed, new THREE.Color(treeColors[placed % treeColors.length]));
    placed++;
  }
  mesh.count = placed;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  group.add(mesh);
}

function buildHappyDetails(group, quality) {
  const rng = seededRandom(7788);
  const happy = new THREE.Group();
  group.add(happy);

  const flowerCount = quality === 'low' ? 900 : 3200;
  const flowerGeo = new THREE.SphereGeometry(1.3, 5, 4);
  flowerGeo.translate(0, 1.3, 0);
  const flowers = new THREE.InstancedMesh(flowerGeo, new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 }), flowerCount);
  const palette = ['#ff6b8a', '#ffd166', '#8ce99a', '#b197fc', '#ffffff', '#ffa8a8'];
  const dummy = new THREE.Object3D();
  let placed = 0;
  for (let tries = 0; tries < flowerCount * 15 && placed < flowerCount; tries++) {
    const x = (rng() - 0.5) * WORLD.width * 0.95;
    const z = (rng() - 0.5) * WORLD.depth * 0.95;
    const lon = WORLD.minLon + (x + WORLD.width / 2) / WORLD.width * (WORLD.maxLon - WORLD.minLon);
    const lat = WORLD.minLat - (z - WORLD.depth / 2) / WORLD.depth * (WORLD.maxLat - WORLD.minLat);
    if (!insideItaly(lon, lat)) continue;
    if (elevationAt(lon, lat) < 5 || elevationAt(lon, lat) > 320 || onAirfield(x, z)) continue;
    dummy.position.set(x, terrainHeight(x, z), z);
    const s = 0.6 + rng() * 0.8;
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    flowers.setMatrixAt(placed, dummy.matrix);
    flowers.setColorAt(placed, new THREE.Color(palette[placed % palette.length]));
    placed++;
  }
  flowers.count = placed;
  if (flowers.instanceColor) flowers.instanceColor.needsUpdate = true;
  happy.add(flowers);

  const birds = new THREE.Group();
  const birdMat = new THREE.LineBasicMaterial({ color: '#2b4d6b', transparent: true, opacity: 0.75 });
  for (let i = 0; i < 10; i++) {
    const pts = [new THREE.Vector3(-4, 0, 0), new THREE.Vector3(0, 2, 0), new THREE.Vector3(4, 0, 0)];
    const bird = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), birdMat);
    bird.position.set((rng() - 0.5) * WORLD.width, 280 + rng() * 260, (rng() - 0.5) * WORLD.depth);
    bird.userData.speed = 12 + rng() * 18;
    birds.add(bird);
  }
  happy.add(birds);
  happy.userData.birds = birds;

  const rainbowColors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'];
  const rainbow = new THREE.Group();
  rainbowColors.forEach((color, i) => {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(70 + i * 5, 2.2, 5, 48, Math.PI),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 })
    );
    arc.rotation.z = 0;
    rainbow.add(arc);
  });
  rainbow.position.set(-WORLD.width * 0.38, 220, -WORLD.depth * 0.32);
  happy.add(rainbow);
  return happy;
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
      if (onAirfield(x, z)) continue;
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

function runwayNumber(heading) {
  const n = Math.round(((heading * 180 / Math.PI) % 360 + 360) % 360 / 10) || 36;
  return String(n).padStart(2, '0');
}

function numberDecal(text) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.font = '700 84px ui-monospace, monospace';
  ctx.fillStyle = '#f4f7fb';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 64);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(12, 12),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false }));
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

/* Runways run along local -Z (the stored heading) and are returned with their PAPI lamps. */
function buildAirports(group) {
  const runwayMat = new THREE.MeshStandardMaterial({ color: '#3b4550', roughness: 1 });
  const markMat = new THREE.MeshBasicMaterial({ color: '#f4f7fb' });
  const terminalMat = new THREE.MeshStandardMaterial({ color: '#8fa7b8' });
  const lampGeo = new THREE.SphereGeometry(0.9, 8, 6);
  const edgeMat = new THREE.PointsMaterial({ color: '#fff2b0', size: 2.4 });
  const half = RUNWAY.half, width = RUNWAY.width;
  const papi = [];
  const flat = (w, l, x, z, y = 0.5) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, l), markMat);
    m.position.set(x, y, z);
    return m;
  };
  for (const f of airfields()) {
    const g = new THREE.Group();
    g.position.set(f.x, f.elevation, f.z);
    g.rotation.y = -f.heading;
    const rwy = new THREE.Mesh(new THREE.BoxGeometry(width, 0.5, half * 2), runwayMat);
    rwy.position.y = 0.2;
    g.add(rwy);
    for (let z = -half + 34; z <= half - 34; z += 14) g.add(flat(0.7, 7, 0, z));
    const edge = [];
    for (let z = -half; z <= half; z += 12) edge.push(-width / 2 - 0.6, 0.9, z, width / 2 + 0.6, 0.9, z);
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edge, 3));
    g.add(new THREE.Points(edgeGeo, edgeMat));
    for (const end of [1, -1]) {
      // end = 1 is approached heading along the runway heading, from local +Z.
      for (let x = -7; x <= 7; x += 2.8) if (Math.abs(x) > 1) g.add(flat(1.2, 8, x, end * (half - 6)));
      const number = numberDecal(runwayNumber(f.heading + (end > 0 ? 0 : Math.PI)));
      number.position.set(0, 0.6, end * (half - 19));
      number.rotation.z = end > 0 ? 0 : Math.PI;
      g.add(number);
      for (const side of [-1, 1]) g.add(flat(2.2, 9, side * 4.5, end * (half - RUNWAY.aim - 8)));
      const lamps = [];
      for (let i = 0; i < 4; i++) {
        const lamp = new THREE.Mesh(lampGeo, new THREE.MeshBasicMaterial({ color: '#ff4040' }));
        lamp.position.set(-end * (width / 2 + 4 + i * 3), 1, end * (half - RUNWAY.aim));
        g.add(lamp);
        lamps.push(lamp);
      }
      papi.push({ code: f.code, end, lamps });
    }
    const terminal = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 26), terminalMat);
    terminal.position.set(26, 3, 20);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.6, 16, 8), terminalMat);
    tower.position.set(26, 8, -4);
    g.add(terminal, tower);
    group.add(g);
    const label = labelSprite(f.code, '#ffd166');
    label.scale.set(44, 11, 1);
    label.position.set(f.x, f.elevation + 55, f.z);
    group.add(label);
  }
  return papi;
}

export function createWorld(scene, quality = 'high', imageryTexture = null, visual = 'happy') {
  const group = new THREE.Group();
  scene.add(group);
  const terrain = buildTerrain(quality, imageryTexture, visual);
  group.add(terrain);
  const vectors = vectorData();
  const sea = buildWater(vectors, group, visual);
  const coast = buildCoastline(group, vectors, visual);
  buildVegetation(group, quality, visual);
  const happy = visual === 'happy' ? buildHappyDetails(group, quality) : null;
  buildCities(group, vectors, quality);
  const realBuildings = buildRealBuildings(group, quality);
  const cityLights = buildCityLights(group);
  const papi = buildAirports(group);
  return { group, terrain, sea, coast, happy, realBuildings, cityLights, papi };
}
