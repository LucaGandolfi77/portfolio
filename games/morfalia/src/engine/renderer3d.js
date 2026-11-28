/* ===== MORFALIA 3D · Cozy Three.js Diorama Renderer ===== */
import * as THREE from '../../vendor/three.module.js';
import { MAP_W, MAP_H, TILES, POWERS, getTimePeriod, getHarmonyLevel } from '../data/config.js';
import { BIOMINI_BY_ID } from '../data/biomini.js';
import { createMimoMesh, createProfessorMesh, createBiominoMesh, createObjectMesh, getMat } from './models3d.js';

function makeGrainTexture(hexA, hexB, pattern = 'speckle') {
  const cv = document.createElement('canvas');
  cv.width = 64;
  cv.height = 64;
  const c = cv.getContext('2d');
  c.fillStyle = hexA;
  c.fillRect(0, 0, 64, 64);

  if (pattern === 'planks') {
    c.fillStyle = hexB;
    for (let y = 0; y < 64; y += 16) c.fillRect(0, y, 64, 3);
    c.fillStyle = 'rgba(0,0,0,0.12)';
    for (let y = 14; y < 64; y += 16) c.fillRect(0, y, 64, 2);
  } else if (pattern === 'soil') {
    c.fillStyle = hexB;
    for (let y = 6; y < 64; y += 14) c.fillRect(4, y, 56, 6);
  } else if (pattern === 'path') {
    c.fillStyle = hexB;
    for (let i = 0; i < 12; i++) {
      c.fillRect((i * 19) % 52 + 3, (i * 29) % 52 + 3, 12, 9);
    }
  } else {
    c.fillStyle = hexB;
    for (let i = 0; i < 36; i++) {
      const x = (i * 37) % 60;
      const y = (i * 53) % 60;
      c.fillRect(x, y, 4, 4);
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

export class WorldRenderer3D {
  constructor(canvas, overlayCanvas) {
    this.canvas = canvas;
    this.overlayCanvas = overlayCanvas;
    this.octx = overlayCanvas ? overlayCanvas.getContext('2d') : null;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.time = 0;

    // Camera orbit angles (4 cozy diorama views)
    this.camAngleIndex = 0;
    this.camYaw = 0;
    this.targetCamYaw = 0;
    this.camDist = 11.2;
    this.camHeight = 9.4;

    // Three.js core
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#6ca87d');
    this.scene.fog = new THREE.FogExp2('#6ca87d', 0.017);

    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.2, 95);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    // Lighting
    this.hemiLight = new THREE.HemisphereLight(0xfff8e6, 0x3b5944, 0.85);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff4d9, 1.45);
    this.sunLight.position.set(14, 22, 12);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 55;
    const d = 21;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0008;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Pooled warm dynamic lights for dusk/night campfires, lanterns, sanctuaries
    this.pointLights = Array.from({ length: 5 }, () => {
      const pl = new THREE.PointLight(0xffcb78, 0, 7.5, 1.8);
      pl.visible = false;
      this.scene.add(pl);
      return pl;
    });

    // Raycaster & invisible ground plane at y = 0
    this.raycaster = new THREE.Raycaster();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Tile materials with procedural textures
    this.tileMaterials = this.buildTileMaterials();
    this.tileGeo = new THREE.BoxGeometry(1, 0.45, 1);

    // Scene groups
    this.terrainGroup = new THREE.Group();
    this.decoGroup = new THREE.Group();
    this.objectGroup = new THREE.Group();
    this.residentGroup = new THREE.Group();
    this.fxGroup = new THREE.Group();
    this.scene.add(this.terrainGroup, this.decoGroup, this.objectGroup, this.residentGroup, this.fxGroup);

    // Diorama island base skirt
    const skirt = new THREE.Mesh(
      new THREE.BoxGeometry(MAP_W + 0.6, 1.6, MAP_H + 0.6),
      getMat(0x4a3d33, { roughness: 0.9 })
    );
    skirt.position.set(MAP_W / 2, -1.03, MAP_H / 2);
    skirt.receiveShadow = true;
    this.scene.add(skirt);

    // Shimmering animated water surface sheet
    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x3ea2cf,
      roughness: 0.16,
      metalness: 0.15,
      transparent: true,
      opacity: 0.84
    });
    this.waterPlane = new THREE.Mesh(new THREE.PlaneGeometry(MAP_W, MAP_H), this.waterMat);
    this.waterPlane.rotation.x = -Math.PI / 2;
    this.waterPlane.position.set(MAP_W / 2, -0.14, MAP_H / 2);
    this.waterPlane.receiveShadow = true;
    this.scene.add(this.waterPlane);

    // Core actors
    this.mimoMesh = createMimoMesh();
    this.scene.add(this.mimoMesh);
    this.profMesh = createProfessorMesh();
    this.scene.add(this.profMesh);

    // Target tile glowing reticle & walk target marker
    this.reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.36, 0.46, 4),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    );
    this.reticle.rotation.x = -Math.PI / 2;
    this.reticle.rotation.z = Math.PI / 4;
    this.reticle.position.y = 0.03;
    this.scene.add(this.reticle);

    this.walkRing = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.28, 18),
      new THREE.MeshBasicMaterial({ color: 0xffe680, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    this.walkRing.rotation.x = -Math.PI / 2;
    this.walkRing.position.y = 0.04;
    this.walkRing.visible = false;
    this.scene.add(this.walkRing);

    // Caches for incremental syncing
    this.currentRegionId = null;
    this.tileInstanced = {};
    for (const [id, mat] of Object.entries(this.tileMaterials)) {
      const im = new THREE.InstancedMesh(this.tileGeo, mat, MAP_W * MAP_H);
      im.receiveShadow = true;
      im.count = 0;
      im.frustumCulled = false;
      this.terrainGroup.add(im);
      this.tileInstanced[id] = im;
    }
    this.tileStateGrid = [];
    this.tilesDirty = false;
    this._dummy = new THREE.Object3D();
    this.tileDecoMap = new Map();
    this.objMeshes = new Map(); // key -> { sig, mesh }
    this.resMeshes = new Map(); // resId -> mesh
    this.ringMeshes = new Map();
    this.particlePool = [];
    this.weatherGroup = new THREE.Group();
    this.scene.add(this.weatherGroup);
    this.weatherDrops = [];
    this.initWeather3D();

    this.camLookAt = new THREE.Vector3(MAP_W / 2, 0, MAP_H / 2);
    this.resize();
  }

  buildTileMaterials() {
    const out = {};
    for (const [id, info] of Object.entries(TILES)) {
      const pat = id === 'bridge' || id === 'wood_floor' ? 'planks' : id === 'soil' ? 'soil' : id === 'path' ? 'path' : 'speckle';
      const tex = makeGrainTexture(info.colors[0], info.colors[1], pat);
      out[id] = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: id === 'crystal_floor' ? 0.3 : 0.82,
        metalness: id === 'crystal_floor' ? 0.2 : 0.02
      });
    }
    return out;
  }

  initWeather3D() {
    const geo = new THREE.SphereGeometry(0.055, 6, 6);
    for (let i = 0; i < 48; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }));
      m.position.set(Math.random() * MAP_W, 1 + Math.random() * 8, Math.random() * MAP_H);
      this.weatherGroup.add(m);
      this.weatherDrops.push({ mesh: m, spd: 1.5 + Math.random() * 2.5, phase: Math.random() * Math.PI * 2 });
    }
  }

  rotateCamera() {
    this.camAngleIndex = (this.camAngleIndex + 1) % 4;
    this.targetCamYaw = (this.camAngleIndex * Math.PI) / 2;
  }

  getCameraYaw() {
    return this.camYaw;
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.width, this.height, false);

    if (this.overlayCanvas && this.octx) {
      this.overlayCanvas.width = Math.floor(this.width * dpr);
      this.overlayCanvas.height = Math.floor(this.height * dpr);
      this.octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  screenToWorld(sx, sy) {
    const ndc = new THREE.Vector2(
      (sx / this.width) * 2 - 1,
      -(sy / this.height) * 2 + 1
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const hit = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.groundPlane, hit)) {
      return { x: hit.x, y: hit.z };
    }
    return { x: 13, y: 11 };
  }

  projectToScreen(wx, wy, wz) {
    const v = new THREE.Vector3(wx, wy, wz);
    v.project(this.camera);
    if (v.z > 1) return null;
    return {
      x: (v.x * 0.5 + 0.5) * this.width,
      y: (-v.y * 0.5 + 0.5) * this.height
    };
  }

  rebuildRegionScene(region) {
    this.currentRegionId = region.id;
    while (this.decoGroup.children.length) this.decoGroup.remove(this.decoGroup.children[0]);
    while (this.objectGroup.children.length) this.objectGroup.remove(this.objectGroup.children[0]);
    while (this.residentGroup.children.length) this.residentGroup.remove(this.residentGroup.children[0]);
    this.tileStateGrid = [];
    this.tileDecoMap.clear();
    this.objMeshes.clear();
    this.resMeshes.clear();

    // Update water color for Floating Islands (cloud sea!) vs ocean/pond
    if (region.id === 'isole') {
      this.waterMat.color.setHex(0x88b0de);
      this.waterMat.opacity = 0.72;
    } else {
      this.waterMat.color.setHex(0x3ba0cf);
      this.waterMat.opacity = 0.84;
    }

    for (let y = 0; y < MAP_H; y++) {
      this.tileStateGrid[y] = [];
      for (let x = 0; x < MAP_W; x++) {
        this.tileStateGrid[y][x] = '';
        this.applyTileVisual(x, y, region.tiles[y][x]);
      }
    }
    this.syncTerrainInstances(region);
  }

  syncTerrainInstances(region) {
    const counts = {};
    for (const id of Object.keys(this.tileInstanced)) counts[id] = 0;

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tid = region.tiles[y][x];
        const im = this.tileInstanced[tid] || this.tileInstanced.withered;
        const key = this.tileInstanced[tid] ? tid : 'withered';
        const idx = counts[key]++;
        let ty = -0.225;
        if (tid === 'water') ty = -0.52;
        else if (tid === 'bridge') ty = -0.18;
        else if (tid === 'soil') ty = -0.25;
        this._dummy.position.set(x + 0.5, ty, y + 0.5);
        this._dummy.updateMatrix();
        im.setMatrixAt(idx, this._dummy.matrix);
      }
    }
    for (const [id, im] of Object.entries(this.tileInstanced)) {
      im.count = counts[id];
      im.instanceMatrix.needsUpdate = true;
    }
    this.tilesDirty = false;
  }

  applyTileVisual(x, y, tid) {
    if (this.tileStateGrid[y][x] === tid) return;
    this.tileStateGrid[y][x] = tid;
    this.tilesDirty = true;

    // Remove old tile deco if any
    const dk = `${x},${y}`;
    if (this.tileDecoMap.has(dk)) {
      this.decoGroup.remove(this.tileDecoMap.get(dk));
      this.tileDecoMap.delete(dk);
    }

    // Add 3D swaying grass tufts, wildflowers, or spore mist puffs
    if (tid === 'tall_grass') {
      const g = new THREE.Group();
      const bm = getMat(0x3b8c47, { roughness: 0.7 });
      const bladeGeo = new THREE.ConeGeometry(0.06, 0.34, 4);
      for (let i = 0; i < 4; i++) {
        const b = new THREE.Mesh(bladeGeo, bm);
        b.position.set(x + 0.22 + (i % 2) * 0.52, 0.16, y + 0.22 + Math.floor(i / 2) * 0.52);
        g.add(b);
      }
      this.decoGroup.add(g);
      this.tileDecoMap.set(dk, g);
    } else if (tid === 'flowers') {
      const g = new THREE.Group();
      const cols = [0xffe46b, 0xff9ec4, 0x8ce8ff, 0xfff6e0];
      const fGeo = new THREE.SphereGeometry(0.075, 6, 6);
      for (let i = 0; i < 4; i++) {
        const f = new THREE.Mesh(fGeo, getMat(cols[(x + y + i) % cols.length]));
        f.position.set(x + 0.24 + (i % 2) * 0.48, 0.08, y + 0.24 + Math.floor(i / 2) * 0.48);
        g.add(f);
      }
      this.decoGroup.add(g);
      this.tileDecoMap.set(dk, g);
    } else if (tid === 'mist') {
      const g = new THREE.Group();
      const mm = getMat(0x9a70c9, { opacity: 0.55, roughness: 0.8 });
      const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), mm);
      s1.position.set(x + 0.38, 0.28, y + 0.42);
      const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mm);
      s2.position.set(x + 0.68, 0.34, y + 0.62);
      g.add(s1, s2);
      this.decoGroup.add(g);
      this.tileDecoMap.set(dk, g);
    }
  }

  syncObjects(region) {
    const activeKeys = new Set();
    for (const [k, obj] of Object.entries(region.objects)) {
      activeKeys.add(k);
      const sig = `${obj.type}|${!!obj.repaired}|${!!obj.read}|${!!obj.lit}|${!!obj.powered}|${obj.stage ?? ''}|${obj.cropId ?? ''}`;
      const existing = this.objMeshes.get(k);
      if (!existing || existing.sig !== sig) {
        if (existing) this.objectGroup.remove(existing.mesh);
        const mesh = createObjectMesh(obj);
        mesh.position.set(obj.x + 0.5, 0, obj.y + 0.5);
        this.objectGroup.add(mesh);
        this.objMeshes.set(k, { sig, mesh, obj });
      } else {
        existing.obj = obj;
      }
    }
    for (const [k, entry] of this.objMeshes.entries()) {
      if (!activeKeys.has(k)) {
        this.objectGroup.remove(entry.mesh);
        this.objMeshes.delete(k);
      }
    }
  }

  syncResidents(region) {
    const activeIds = new Set();
    for (const res of region.residents) {
      activeIds.add(res.id);
      if (!this.resMeshes.has(res.id)) {
        const bio = BIOMINI_BY_ID[res.id];
        if (!bio) continue;
        const mesh = createBiominoMesh(bio);
        this.residentGroup.add(mesh);
        this.resMeshes.set(res.id, mesh);
      }
      const mesh = this.resMeshes.get(res.id);
      const bob = Math.abs(Math.sin(this.time * 4.5 + res.x)) * 0.08;
      mesh.position.set(res.x, bob, res.y);
      const dx = res.targetX - res.x;
      const dy = res.targetY - res.y;
      if (Math.hypot(dx, dy) > 0.08) {
        mesh.rotation.y = Math.atan2(dx, dy);
      }
      if (mesh.userData.giftBox) {
        mesh.userData.giftBox.visible = !!res.hasGift;
        mesh.userData.giftBox.rotation.y = this.time * 2.2;
      }
      if (mesh.userData.body?.userData?.wings) {
        const flap = Math.sin(this.time * 12) * 0.35;
        mesh.userData.body.userData.wings[0].rotation.z = 0.35 + flap;
        mesh.userData.body.userData.wings[1].rotation.z = -0.35 - flap;
      }
    }
    for (const [id, mesh] of this.resMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.residentGroup.remove(mesh);
        this.resMeshes.delete(id);
      }
    }
  }

  updateAtmosphere(state, region) {
    const period = getTimePeriod(state.timeOfDay);
    const harm = getHarmonyLevel(region.harmony).level;
    const lushRatio = (harm - 1) / 4; // 0..1

    const daySky = new THREE.Color('#8ec7b0').lerp(new THREE.Color('#86cef5'), lushRatio);
    let sky = daySky.clone();
    let sunIntensity = 1.45;
    let hemiIntensity = 0.85;
    let sunColor = new THREE.Color(0xfff5dc);

    if (period.id === 'alba') {
      sky.lerp(new THREE.Color('#f0b68c'), 0.45);
      sunColor.setHex(0xffcca3);
      sunIntensity = 1.15;
    } else if (period.id === 'sera') {
      sky.lerp(new THREE.Color('#d98468'), 0.55);
      sunColor.setHex(0xffa673);
      sunIntensity = 1.05;
    } else if (period.id === 'notte') {
      sky.setHex(0x1b2747);
      sunColor.setHex(0x88a8ff);
      sunIntensity = 0.45;
      hemiIntensity = 0.48;
    }

    this.scene.background.copy(sky);
    this.scene.fog.color.copy(sky);
    this.sunLight.color.copy(sunColor);
    this.sunLight.intensity = sunIntensity;
    this.hemiLight.intensity = hemiIntensity;

    // Position pooled warm PointLights on nearest emissive structures at dusk/night
    const showLights = period.id === 'notte' || period.id === 'sera';
    let idx = 0;
    if (showLights) {
      const p = state.player;
      const emitters = [];
      for (const entry of this.objMeshes.values()) {
        const o = entry.obj;
        if (o.lit || o.powered || o.type === 'mushroom_lamp' || o.type === 'crystal_pillar' || (o.type === 'sanctuary' && o.repaired) || o.type === 'prof_greenhouse') {
          emitters.push({ o, dist: Math.hypot(o.x - p.x, o.y - p.y) });
        }
      }
      emitters.sort((a, b) => a.dist - b.dist);
      for (const em of emitters.slice(0, this.pointLights.length)) {
        const pl = this.pointLights[idx++];
        pl.visible = true;
        pl.position.set(em.o.x + 0.5, 1.1, em.o.y + 0.5);
        pl.color.setHex(em.o.type === 'mushroom_lamp' ? 0x70f5bc : em.o.type === 'crystal_pillar' ? 0xc29eff : 0xffc773);
        pl.intensity = period.id === 'notte' ? 2.6 : 1.4;
      }
    }
    while (idx < this.pointLights.length) {
      this.pointLights[idx++].visible = false;
    }
  }

  updateWeather3D(weather, periodId, dt) {
    const active = weather === 'rain' || weather === 'breeze' || weather === 'aurora' || periodId === 'notte';
    this.weatherGroup.visible = active;
    if (!active) return;

    for (const d of this.weatherDrops) {
      const m = d.mesh;
      if (weather === 'rain') {
        m.material.color.setHex(0xa8dbff);
        m.scale.set(0.5, 3.2, 0.5);
        m.position.y -= d.spd * dt * 4.5;
        if (m.position.y < 0) m.position.y = 8;
      } else if (weather === 'breeze') {
        m.material.color.setHex(0xffeeb5);
        m.scale.set(1.2, 0.4, 0.9);
        m.position.x += d.spd * dt * 0.9;
        m.position.y = 1.6 + Math.sin(this.time * 2 + d.phase) * 0.6;
        if (m.position.x > MAP_W) m.position.x = 0;
      } else {
        // Fireflies / Aurora
        m.material.color.setHex(0xa8ffbe);
        m.scale.set(0.85, 0.85, 0.85);
        m.position.y += dt * 0.35;
        m.position.x += Math.sin(this.time * 1.5 + d.phase) * dt * 0.3;
        if (m.position.y > 5.5) m.position.y = 0.4;
      }
    }
  }

  syncFx3D(sim) {
    // Sync 3D particle bursts from simulation
    while (this.particlePool.length < sim.particles.length) {
      const pm = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })
      );
      this.fxGroup.add(pm);
      this.particlePool.push(pm);
    }
    for (let i = 0; i < this.particlePool.length; i++) {
      const pm = this.particlePool[i];
      if (i < sim.particles.length) {
        const pt = sim.particles[i];
        pm.visible = true;
        pm.position.set(pt.x, Math.max(0.15, (pt.life / pt.maxLife) * 1.15), pt.y);
        pm.material.color.set(pt.color);
        pm.material.opacity = Math.max(0, pt.life / pt.maxLife);
        const sc = 0.5 + (pt.size / 7);
        pm.scale.setScalar(sc);
      } else {
        pm.visible = false;
      }
    }

    // Sync expanding Habitat golden rings
    for (const [hr, mesh] of this.ringMeshes.entries()) {
      if (!sim.habitatRings.includes(hr)) {
        this.fxGroup.remove(mesh);
        this.ringMeshes.delete(hr);
      }
    }
    for (const hr of sim.habitatRings) {
      if (!this.ringMeshes.has(hr)) {
        const rm = new THREE.Mesh(
          new THREE.RingGeometry(0.82, 1.0, 28),
          new THREE.MeshBasicMaterial({ color: hr.color, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
        );
        rm.rotation.x = -Math.PI / 2;
        rm.position.set(hr.x, 0.08, hr.y);
        this.fxGroup.add(rm);
        this.ringMeshes.set(hr, rm);
      }
      const rm = this.ringMeshes.get(hr);
      rm.scale.setScalar(Math.max(0.2, hr.r));
      rm.material.opacity = Math.max(0, Math.min(1, hr.life));
    }
  }

  renderOverlay2D(sim, joystick) {
    if (!this.octx) return;
    const ctx = this.octx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Subtle crisp floating nameplates for Prof. Intreccio & Biomini
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.textAlign = 'center';

    const drawTag = (wx, wy, wz, text, fill = '#fff5d1') => {
      const p = this.projectToScreen(wx, wy, wz);
      if (!p || p.x < -60 || p.x > this.width + 60 || p.y < 0 || p.y > this.height) return;
      ctx.fillStyle = 'rgba(15, 24, 19, 0.65)';
      const w = ctx.measureText(text).width + 12;
      ctx.beginPath();
      ctx.roundRect(p.x - w / 2, p.y - 11, w, 16, 8);
      ctx.fill();
      ctx.fillStyle = fill;
      ctx.fillText(text, p.x, p.y + 1);
    };

    drawTag(sim.profPos.x, 1.05, sim.profPos.y, 'Prof. Intreccio', '#ffe89c');
    for (const res of sim.region.residents) {
      const bio = BIOMINI_BY_ID[res.id];
      if (bio) drawTag(res.x, 0.85, res.y, res.hasGift ? `🎁 ${bio.name}` : bio.name, '#eef7e6');
    }

    // Floating combat/gather texts
    ctx.font = 'bold 14px -apple-system, sans-serif';
    for (const ft of sim.floatingTexts) {
      const p = this.projectToScreen(ft.x, 1.1 + (1 - ft.life / ft.maxLife) * 0.9, ft.y);
      if (!p) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.fillStyle = 'rgba(12, 20, 16, 0.78)';
      ctx.fillText(ft.text, p.x + 1, p.y + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, p.x, p.y);
      ctx.restore();
    }

    // Virtual joystick overlay when dragging
    if (joystick && joystick.active) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(joystick.originX, joystick.originY, 44, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20, 34, 27, 0.38)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(186, 232, 198, 0.52)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(joystick.curX, joystick.curY, 19, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(126, 227, 155, 0.78)';
      ctx.fill();
      ctx.restore();
    }
  }

  render(sim, dt, joystick = null) {
    this.time += dt;
    const state = sim.state;
    const region = sim.region;
    const player = state.player;

    // 1. Rebuild terrain on region change, otherwise incremental tile sync
    if (this.currentRegionId !== region.id) {
      this.rebuildRegionScene(region);
    } else {
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          this.applyTileVisual(x, y, region.tiles[y][x]);
        }
      }
      if (this.tilesDirty) this.syncTerrainInstances(region);
    }

    // 2. Sync objects, residents & 3D FX
    this.syncObjects(region);
    this.syncResidents(region);
    this.syncFx3D(sim);

    // 3. Animate Mimo (squash-stretch hop, facing yaw, morph aura)
    const moving = Math.hypot(player.facingX, player.facingY) > 0.01 && (sim.walkTarget || (joystick && joystick.active));
    const hop = Math.abs(Math.sin(this.time * 9)) * (moving ? 0.14 : 0.025);
    this.mimoMesh.position.set(player.x, hop, player.y);
    const targetYaw = Math.atan2(player.facingX, player.facingY);
    this.mimoMesh.rotation.y = targetYaw;

    const ud = this.mimoMesh.userData;
    const pMeta = player.morphPower ? POWERS.find((p) => p.id === player.morphPower) : null;
    if (pMeta) {
      ud.bodyMat.color.set(pMeta.color);
      ud.aura.visible = true;
      ud.auraMat.color.set(pMeta.color);
      ud.aura.scale.setScalar(1 + Math.sin(this.time * 16) * 0.12);
    } else {
      ud.bodyMat.color.setHex(0xd0a8f7);
      ud.aura.visible = false;
    }

    // 4. Animate Prof. Intreccio
    this.profMesh.position.set(sim.profPos.x, Math.sin(this.time * 2.5) * 0.04, sim.profPos.y);
    this.profMesh.rotation.y = Math.atan2(player.x - sim.profPos.x, player.y - sim.profPos.y);
    if (this.profMesh.userData.beacon) {
      this.profMesh.userData.beacon.visible = !!sim.getCurrentQuest();
      this.profMesh.userData.beacon.rotation.y = this.time * 2;
    }

    // 5. Animate dynamic objects (windmills, campfires, floating crystals, water)
    this.waterPlane.position.y = -0.14 + Math.sin(this.time * 2.2) * 0.025;
    for (const entry of this.objMeshes.values()) {
      const m = entry.mesh;
      if (m.userData.rotor) m.userData.rotor.rotation.z -= dt * 2.2;
      if (m.userData.floatPart) {
        m.userData.floatPart.rotation.y += dt * 1.5;
        m.userData.floatPart.position.y += Math.sin(this.time * 3 + entry.obj.x) * 0.0018;
      }
      if (m.userData.flames) {
        const s = 0.88 + Math.sin(this.time * 14 + entry.obj.x) * 0.16;
        m.userData.flames[0].scale.set(1, s, 1);
        m.userData.flames[1].scale.set(1, 1.85 - s, 1);
      }
    }

    // 6. Reticle & Walk Ring
    const len = Math.hypot(player.facingX, player.facingY) || 1;
    const fx = Math.floor(player.x + (player.facingX / len) * 0.95);
    const fy = Math.floor(player.y + (player.facingY / len) * 0.95);
    if (fx >= 0 && fy >= 0 && fx < MAP_W && fy < MAP_H) {
      this.reticle.visible = true;
      this.reticle.position.set(fx + 0.5, 0.04, fy + 0.5);
      this.reticle.material.color.setHex(state.buildItemId ? 0x86f7a4 : 0xffffff);
      this.reticle.material.opacity = state.buildItemId ? 0.85 : 0.42;
    } else {
      this.reticle.visible = false;
    }

    if (sim.walkTarget) {
      this.walkRing.visible = true;
      this.walkRing.position.set(sim.walkTarget.x, 0.05, sim.walkTarget.y);
      this.walkRing.scale.setScalar(0.9 + Math.sin(this.time * 7) * 0.15);
    } else {
      this.walkRing.visible = false;
    }

    // 7. Smooth Camera Orbit Follow + Shadow Sun Tracking
    let diff = this.targetCamYaw - this.camYaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.camYaw += diff * Math.min(1, dt * 7);

    const k = Math.min(1, dt * 7);
    this.camLookAt.x += (player.x - this.camLookAt.x) * k;
    this.camLookAt.z += (player.y - this.camLookAt.z) * k;

    this.camera.position.set(
      this.camLookAt.x + Math.sin(this.camYaw) * this.camDist,
      this.camHeight,
      this.camLookAt.z + Math.cos(this.camYaw) * this.camDist
    );
    this.camera.lookAt(this.camLookAt.x, 0.2, this.camLookAt.z);

    this.sunLight.position.set(this.camLookAt.x + 10, 19, this.camLookAt.z + 9);
    this.sunLight.target.position.set(this.camLookAt.x, 0, this.camLookAt.z);

    // 8. Atmosphere & Weather
    const period = getTimePeriod(state.timeOfDay);
    this.updateAtmosphere(state, region);
    this.updateWeather3D(state.weather, period.id, dt);

    // 9. Render 3D scene + 2D HUD overlay
    this.renderer.render(this.scene, this.camera);
    this.renderOverlay2D(sim, joystick);
  }
}
