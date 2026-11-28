/* Italy 3D Flight Sim — real-data Three.js world (streamed terrain, sea, rivers, cities, airports) */

import * as THREE from '../../_vendor/three.module.js';
import { WORLD } from './config.js';
import { RUNWAY, airfields, onAirfield } from './airfields.js';
import { COAST, coastDistance, waterLevel } from './coast.js';
import { geoToWorld, isWater, pointInRing, terrainHeight, vectorData, worldPolygon } from './geo.js';
import { COLS, ROWS, RANGE, SEGMENTS, chunkData, chunkDistance, chunkLevel, chunkOrigin, CHUNK, hasAirfield, isOpenWater } from './terrain-grid.js';
import { createTerrainMaterial, PALETTES } from './terrain-material.js';
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
  /* A constant size on screen, so a tag never fills the view as you pass it. */
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, sizeAttenuation: false }));
  sprite.scale.set(0.15, 0.037, 1);
  return sprite;
}

/* Trees, and flowers in happy mode, are grown only on chunks close to the aircraft. */
function createDecorator(group, quality) {
  const treeGeo = new THREE.ConeGeometry(1.7, 5.6, 6);
  treeGeo.translate(0, 2.8, 0);
  const flowerGeo = new THREE.SphereGeometry(0.75, 5, 4);
  flowerGeo.translate(0, 0.75, 0);
  const treeMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 });
  const flowerMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 });
  const palettes = {
    happy: ['#3fa34d', '#57b85a', '#2f8f45', '#74c96a', '#46a658'].map(c => new THREE.Color(c)),
    natural: ['#204f34', '#2b5a39', '#1c4630', '#355f3a', '#244f33'].map(c => new THREE.Color(c))
  };
  const blossom = ['#ff6b8a', '#ffd166', '#b197fc', '#ffffff', '#ffa8a8'].map(c => new THREE.Color(c));
  const dummy = new THREE.Object3D();
  let happy = true;

  function scatter(geo, mat, col, row, seed, count, clusters, spread, colors, fits) {
    const rng = seededRandom(seed + row * COLS + col);
    const o = chunkOrigin(col, row);
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const centres = Array.from({ length: clusters }, () => ({ x: o.x + rng() * CHUNK.width, z: o.z + rng() * CHUNK.depth }));
    let placed = 0;
    for (let tries = 0; tries < count * 3 && placed < count; tries++) {
      const centre = centres[tries % clusters];
      const x = centre.x + (rng() - 0.5) * spread, z = centre.z + (rng() - 0.5) * spread;
      const size = 0.6 + rng() * 0.8, turn = rng() * Math.PI;
      if (coastDistance(x, z) < COAST.beach + 8 || onAirfield(x, z)) continue;
      const h = terrainHeight(x, z);
      if (!fits(h)) continue;
      dummy.position.set(x, h - 0.15, z);
      dummy.rotation.y = turn;
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      mesh.setMatrixAt(placed, dummy.matrix);
      mesh.setColorAt(placed, colors[placed % colors.length]);
      placed++;
    }
    mesh.count = placed;
    mesh.computeBoundingSphere();
    group.add(mesh);
    return mesh;
  }

  return {
    grow(chunk) {
      const dense = quality !== 'low';
      const trees = scatter(treeGeo, treeMat, chunk.col, chunk.row, 9911, dense ? 220 : 80, 14, 90,
        palettes[happy ? 'happy' : 'natural'], h => h < 34);
      const flowers = scatter(flowerGeo, flowerMat, chunk.col, chunk.row, 7788, dense ? 140 : 40, 9, 55, blossom, h => h < 18);
      flowers.visible = happy;
      chunk.decor = { trees, flowers };
    },
    clear(chunk) {
      for (const mesh of Object.values(chunk.decor)) { group.remove(mesh); mesh.dispose(); }
      chunk.decor = null;
    },
    setHappy(value, chunks) {
      happy = value;
      for (const chunk of chunks) {
        if (!chunk.decor) continue;
        chunk.decor.flowers.visible = happy;
        const colors = palettes[happy ? 'happy' : 'natural'];
        for (let i = 0; i < chunk.decor.trees.count; i++) chunk.decor.trees.setColorAt(i, colors[i % colors.length]);
        if (chunk.decor.trees.instanceColor) chunk.decor.trees.instanceColor.needsUpdate = true;
      }
    }
  };
}

/* Chunks are rebuilt a few per frame as the aircraft moves; a long jump, such as
 * a respawn, rebuilds everything near the new position at once. */
function createTerrain(group, material, quality) {
  const segments = SEGMENTS[quality] || SEGMENTS.high;
  const detail = (RANGE[quality] || RANGE.high).detail;
  const decorator = createDecorator(group, quality);
  const chunks = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      chunks.push({ col, row, sea: isOpenWater(col, row), airfield: hasAirfield(col, row), level: null, mesh: null, decor: null });
    }
  }

  function build(chunk, level) {
    const data = chunkData(chunk.col, chunk.row, chunk.sea ? 1 : segments[level]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(data.normals, 3));
    geo.setIndex(new THREE.BufferAttribute(data.index, 1));
    geo.computeBoundingSphere();
    if (chunk.mesh) {
      chunk.mesh.geometry.dispose();
      chunk.mesh.geometry = geo;
    } else {
      chunk.mesh = new THREE.Mesh(geo, material);
      chunk.mesh.matrixAutoUpdate = false;
      group.add(chunk.mesh);
    }
    chunk.level = level;
  }

  for (const chunk of chunks) build(chunk, 2);

  let queue = [];
  let last = null;
  function plan(x, z) {
    queue = [];
    for (const chunk of chunks) {
      const distance = chunkDistance(chunk.col, chunk.row, x, z);
      const level = chunk.sea ? 2 : chunkLevel(distance, quality, chunk.level, chunk.airfield);
      const wantDecor = !chunk.sea && distance < detail + (chunk.decor ? 150 : 0);
      if (level !== chunk.level || wantDecor !== !!chunk.decor) queue.push({ chunk, level, wantDecor, distance });
    }
    queue.sort((a, b) => a.distance - b.distance);
  }

  function apply({ chunk, level, wantDecor }) {
    if (level !== chunk.level) build(chunk, level);
    if (wantDecor && !chunk.decor) decorator.grow(chunk);
    else if (!wantDecor && chunk.decor) decorator.clear(chunk);
  }

  return {
    update(x, z, budget = 2) {
      const jumped = !last || Math.hypot(x - last.x, z - last.z) > 600;
      if (jumped || Math.hypot(x - last.x, z - last.z) > 60) { plan(x, z); last = { x, z }; }
      let left = jumped ? Infinity : budget;
      while (queue.length && left > 0) {
        const job = queue.shift();
        apply(job);
        /* Far chunks and cleanups cost little, so several fit in one frame. */
        left -= job.level === 2 && !job.wantDecor ? 0.25 : 1;
      }
    },
    setHappy(value) { decorator.setHappy(value, chunks); },
    chunks
  };
}

/* Land and sea carried on past the edges of the mapped area, up to the horizon:
 * the ground material repeats whatever it finds along each border. */
function buildSurround(group, material) {
  const reach = 40000;
  const plane = (w, d, x, z) => {
    const geo = new THREE.PlaneGeometry(w, d);
    geo.rotateX(-Math.PI / 2);
    geo.translate(x, -0.05, z);
    group.add(new THREE.Mesh(geo, material));
  };
  plane(WORLD.width + reach * 2, reach, 0, -WORLD.depth / 2 - reach / 2);
  plane(WORLD.width + reach * 2, reach, 0, WORLD.depth / 2 + reach / 2);
  plane(reach, WORLD.depth, -WORLD.width / 2 - reach / 2, 0);
  plane(reach, WORLD.depth, WORLD.width / 2 + reach / 2, 0);
}

/* Rivers are ribbons laid on the ground, sampled finely enough to follow it. */
function buildRivers(group, vectors) {
  const material = new THREE.MeshStandardMaterial({ color: PALETTES.happy.shallow, roughness: 0.5, side: THREE.DoubleSide });
  const half = 4;
  for (const line of vectors.rivers) {
    const pts = worldPolygon(line).map(p => new THREE.Vector3(p.x, 0, p.z));
    if (pts.length < 2) continue;
    const curve = new THREE.CatmullRomCurve3(pts);
    const steps = Math.max(2, Math.ceil(curve.getLength() / 16));
    const positions = [], index = [];
    let open = false;
    for (let i = 0; i <= steps; i++) {
      const p = curve.getPointAt(i / steps), t = curve.getTangentAt(i / steps);
      if (isWater(p.x, p.z) && waterLevel(p.x, p.z) === 0) { open = false; continue; }
      const length = Math.hypot(t.x, t.z) || 1;
      const nx = -t.z / length * half, nz = t.x / length * half;
      const n = positions.length / 3;
      for (const side of [1, -1]) {
        const x = p.x + nx * side, z = p.z + nz * side;
        positions.push(x, terrainHeight(x, z) + 0.5, z);
      }
      if (open) index.push(n - 2, n - 1, n, n - 1, n + 1, n);
      open = true;
    }
    if (!index.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(index);
    geo.computeVertexNormals();
    group.add(new THREE.Mesh(geo, material));
  }
  return material;
}

function buildHappyDetails(group, quality) {
  const rng = seededRandom(7788);
  const happy = new THREE.Group();
  group.add(happy);

  const birds = new THREE.Group();
  const birdMat = new THREE.LineBasicMaterial({ color: '#2b4d6b', transparent: true, opacity: 0.75 });
  for (let i = 0; i < (quality === 'low' ? 8 : 16); i++) {
    const pts = [new THREE.Vector3(-4, 0, 0), new THREE.Vector3(0, 2, 0), new THREE.Vector3(4, 0, 0)];
    const bird = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), birdMat);
    bird.position.set((rng() - 0.5) * 1800, 90 + rng() * 260, (rng() - 0.5) * 1800);
    bird.userData.speed = 12 + rng() * 18;
    birds.add(bird);
  }
  happy.add(birds);
  happy.userData.birds = birds;

  const rainbowColors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'];
  const rainbow = new THREE.Group();
  rainbowColors.forEach((color, i) => {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(260 + i * 14, 6, 5, 64, Math.PI),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 })
    );
    rainbow.add(arc);
  });
  const sky = geoToWorld(10.3, 41.0);
  rainbow.position.set(sky.x, 20, sky.z);
  happy.add(rainbow);
  return happy;
}

function buildCities(group, vectors, quality, labels) {
  const rng = seededRandom(4242);
  const realCenters = realCityCenters();
  const urban = vectors.urban.filter(u => {
    if (u.pop <= 30000) return false;
    const clon = u.ring.reduce((s, p) => s + p[0], 0) / u.ring.length;
    const clat = u.ring.reduce((s, p) => s + p[1], 0) / u.ring.length;
    return !realCenters.some(([lon, lat]) => Math.abs(lon - clon) < 0.055 && Math.abs(lat - clat) < 0.055);
  });
  const most = quality === 'low' ? 140 : 480;
  const geo = new THREE.BoxGeometry(5, 1, 5);
  geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8, metalness: 0.05 });
  const walls = ['#f4e3c8', '#e8c4a8', '#d9dfe4', '#f2d0b0', '#cfd8c4'].map(c => new THREE.Color(c));
  const dummy = new THREE.Object3D();
  const cities = [];
  for (const area of urban) {
    const pts = worldPolygon(area.ring);
    const xs = pts.map(p => p.x), zs = pts.map(p => p.z);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs);
    const flat = pts.map(p => [p.x, p.z]);
    const total = Math.max(24, Math.min(most, Math.round((maxX - minX) * (maxZ - minZ) / 220)));
    const mesh = new THREE.InstancedMesh(geo, mat, total);
    const scale = Math.min(1.6, 0.6 + Math.log10(area.pop + 10) / 6);
    let n = 0;
    for (let tries = 0; tries < total * 3 && n < total; tries++) {
      const x = minX + rng() * (maxX - minX);
      const z = minZ + rng() * (maxZ - minZ);
      const h = (1.8 + rng() * rng() * 9) * scale;
      const turn = rng() * Math.PI, wide = 0.7 + rng() * 0.9, deep = 0.7 + rng() * 0.9;
      if (!pointInRing(x, z, flat) || coastDistance(x, z) < 12 || onAirfield(x, z)) continue;
      dummy.position.set(x, terrainHeight(x, z) - 0.2, z);
      dummy.scale.set(wide, h, deep);
      dummy.rotation.y = turn;
      dummy.updateMatrix();
      mesh.setMatrixAt(n, dummy.matrix);
      mesh.setColorAt(n, walls[n % walls.length]);
      n++;
    }
    if (!n) continue;
    mesh.count = n;
    mesh.computeBoundingSphere();
    mesh.userData.center = { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 };
    group.add(mesh);
    cities.push(mesh);
  }

  for (const city of vectors.cities.slice(0, quality === 'low' ? 10 : 22)) {
    const p = geoToWorld(city.lon, city.lat);
    const label = labelSprite(city.name.toUpperCase());
    label.position.set(p.x, terrainHeight(p.x, p.z) + 70, p.z);
    group.add(label);
    labels.push({ sprite: label, range: 3200 });
  }
  return cities;
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
function buildAirports(group, labels) {
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
    label.scale.set(0.1, 0.025, 1);
    label.position.set(f.x, f.elevation + 55, f.z);
    group.add(label);
    labels.push({ sprite: label, range: 5000 });
  }
  return papi;
}

export function createWorld(scene, quality = 'high') {
  const group = new THREE.Group();
  scene.add(group);
  const vectors = vectorData();
  const ground = createTerrainMaterial();
  const terrain = createTerrain(group, ground.material, quality);
  buildSurround(group, ground.material);
  const rivers = buildRivers(group, vectors);
  const happy = buildHappyDetails(group, quality);
  /* Name tags are drawn over everything, so only nearby ones are shown. */
  const labels = [];
  const cities = buildCities(group, vectors, quality, labels);
  const realBuildings = buildRealBuildings(group, quality);
  const cityLights = buildCityLights(group);
  const papi = buildAirports(group, labels);

  /* `mode` is 'happy', 'natural' or 'map'; `imagery` a satellite texture or null. */
  function setLook(mode, imagery = null) {
    ground.setPalette(mode);
    ground.setImagery(imagery);
    rivers.color.set(PALETTES[mode].shallow);
    terrain.setHappy(mode === 'happy');
    happy.visible = mode === 'happy';
  }

  return { group, terrain, ground, setLook, happy, cities, labels, realBuildings, cityLights, papi };
}
