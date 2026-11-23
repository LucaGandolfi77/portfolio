/* Italy 3D Flight Sim — Three.js scene, cameras, lighting and weather */

import * as THREE from '../../_vendor/three.module.js';
import { WORLD } from './config.js';
import { terrainHeight } from './geo.js';
import { createWorld, terrainColor, happyColor } from './terrain.js';
import { createPlaneMesh, animatePlane } from './planes.js';

function cloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 32, 4, 64, 32, 62);
  g.addColorStop(0, 'rgba(255,255,255,0.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 64);
  return new THREE.CanvasTexture(canvas);
}

function makeClouds(scene, quality, happy) {
  const count = quality === 'low' ? 24 : 70;
  const tex = cloudTexture();
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: happy ? 0.95 : 0.75 });
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const s = new THREE.Sprite(mat);
    s.position.set((Math.random() - 0.5) * WORLD.width * 1.4, 550 + Math.random() * 700, (Math.random() - 0.5) * WORLD.depth * 1.4);
    const scale = 120 + Math.random() * 180;
    s.scale.set(scale, scale * 0.45, 1);
    group.add(s);
  }
  scene.add(group);
  return group;
}

export function createRenderer(canvas, quality = 'high', imageryTexture = null, visual = 'happy') {
  let happyMode = visual === 'happy';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality === 'high', powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(happyMode ? '#8fdcf5' : '#8cc3e8');
  scene.fog = new THREE.FogExp2(happyMode ? '#c4ecf7' : '#a9c9dc', 0.00075);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / Math.max(1, window.innerHeight), 1, 7000);
  const hemi = new THREE.HemisphereLight('#e6f8ff', happyMode ? '#7fc46a' : '#4c6b50', happyMode ? 1.5 : 1.1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff6d8', happyMode ? 2.1 : 1.8);
  sun.position.set(400, 800, -300);
  scene.add(sun);

  const world = createWorld(scene, quality, imageryTexture, visual);
  const clouds = makeClouds(scene, quality, happyMode);
  let planeMesh = null;
  let trafficMeshes = [];
  let sunTime = 0.3;
  let mapMode = false;
  let imageryOn = true;
  const tempV = new THREE.Vector3();
  const tempLook = new THREE.Vector3();

  // Cheerful boost confetti.
  const confettiCount = quality === 'low' ? 60 : 160;
  const confettiGeo = new THREE.BufferGeometry();
  const confettiPos = new Float32Array(confettiCount * 3);
  const confettiColors = new Float32Array(confettiCount * 3);
  const confettiPalette = ['#ff6b8a', '#ffd166', '#69db7c', '#4dabf7', '#b197fc', '#ffffff'];
  for (let i = 0; i < confettiCount; i++) {
    const c = new THREE.Color(confettiPalette[i % confettiPalette.length]);
    confettiColors[i * 3] = c.r; confettiColors[i * 3 + 1] = c.g; confettiColors[i * 3 + 2] = c.b;
  }
  confettiGeo.setAttribute('position', new THREE.BufferAttribute(confettiPos, 3));
  confettiGeo.setAttribute('color', new THREE.BufferAttribute(confettiColors, 3));
  const confetti = new THREE.Points(confettiGeo, new THREE.PointsMaterial({
    size: 4, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false
  }));
  confetti.visible = false;
  scene.add(confetti);

  function setPlane(plane) {
    if (planeMesh) scene.remove(planeMesh);
    planeMesh = createPlaneMesh(plane);
    planeMesh.rotation.order = 'YXZ';
    scene.add(planeMesh);
  }

  function setTraffic(traffic) {
    for (const mesh of trafficMeshes) scene.remove(mesh);
    trafficMeshes = traffic.map(t => {
      const g = new THREE.Group();
      const m = new THREE.Mesh(new THREE.ConeGeometry(2.2, 12, 5), new THREE.MeshStandardMaterial({ color: t.color }));
      m.rotation.x = -Math.PI / 2;
      g.add(m);
      g.add(new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 2), new THREE.MeshStandardMaterial({ color: t.color })));
      g.rotation.order = 'YXZ';
      scene.add(g);
      return g;
    });
  }

  function update(game, dt, time) {
    const s = game.state;
    sunTime = (sunTime + dt * 0.004) % 1;
    const day = 0.5 + 0.5 * Math.sin(sunTime * Math.PI * 2 - Math.PI / 2);
    sun.intensity = happyMode ? 1.5 + day * 0.7 : 0.5 + day * 1.6;
    hemi.intensity = happyMode ? 1.1 + day * 0.45 : 0.35 + day * 0.9;
    if (!happyMode) {
      scene.background.setHSL(0.57, 0.55, 0.16 + day * 0.45);
      scene.fog.color.copy(scene.background);
    }
    sun.position.set(Math.cos(sunTime * Math.PI * 2) * 700, 200 + day * 800, -400);

    clouds.rotation.y += dt * 0.002;

    if (!s) { renderer.render(scene, camera); return; }
    if (!planeMesh) setPlane(game.plane);
    planeMesh.position.set(s.x, s.y, s.z);
    planeMesh.rotation.set(s.pitch, -s.heading, -s.roll);
    animatePlane(planeMesh, time, s.boosting);

    if (happyMode) {
      const shimmer = world.sea.userData.shimmer;
      if (shimmer) { shimmer.offset.x = time * 0.01; shimmer.offset.y = Math.sin(time * 0.2) * 0.02; }
      for (const bird of world.happy?.userData.birds?.children || []) {
        bird.position.x += bird.userData.speed * dt;
        if (bird.position.x > WORLD.width / 2) bird.position.x = -WORLD.width / 2;
        bird.rotation.z = Math.sin(time * 4 + bird.position.z) * 0.2;
      }
      confetti.visible = !!s.boosting;
      if (confetti.visible) {
        for (let i = 0; i < confettiCount; i++) {
          const t = ((time * 1.6 + i * 0.037) % 1);
          const spread = 6 + t * 24;
          const a = i * 2.399;
          confettiPos[i * 3] = s.x - Math.sin(s.heading) * t * 40 + Math.cos(a) * spread;
          confettiPos[i * 3 + 1] = s.y + Math.sin(a) * spread * 0.5 + t * 8;
          confettiPos[i * 3 + 2] = s.z + Math.cos(s.heading) * t * 40 + Math.sin(a) * spread;
        }
        confettiGeo.attributes.position.needsUpdate = true;
      }
    } else confetti.visible = false;

    for (let i = 0; i < trafficMeshes.length; i++) {
      const t = game.traffic[i];
      if (!t) continue;
      trafficMeshes[i].position.set(t.x, t.y, t.z);
      trafficMeshes[i].rotation.set(0, -t.heading, 0);
    }

    // Real city buildings are only drawn near the aircraft.
    const range = quality === 'low' ? 480 : 760;
    for (const mesh of world.realBuildings || []) {
      const c = mesh.userData.center;
      mesh.visible = !!c && Math.hypot(s.x - c.x, s.z - c.z) < range;
    }

    const forward = tempV.set(Math.sin(s.heading) * Math.cos(s.pitch), Math.sin(s.pitch), -Math.cos(s.heading) * Math.cos(s.pitch));
    if (game.view === 'overview') {
      camera.fov = 55;
      tempLook.set(0, 0, 0);
      camera.position.lerp(new THREE.Vector3(0, 950, 820), Math.min(1, dt * 3));
      camera.lookAt(tempLook);
    } else if (game.view === 'cockpit') {
      camera.fov = 78;
      tempLook.copy(planeMesh.position).add(forward.clone().multiplyScalar(160)).add(new THREE.Vector3(0, 8, 0));
      camera.position.lerp(planeMesh.position.clone().add(forward.clone().multiplyScalar(L_COCKPIT(game.plane))).add(new THREE.Vector3(0, 3, 0)), Math.min(1, dt * 12));
      camera.lookAt(tempLook);
    } else {
      camera.fov = 70;
      const behind = planeMesh.position.clone().add(forward.clone().multiplyScalar(-52)).add(new THREE.Vector3(0, 20, 0));
      camera.position.lerp(behind, Math.min(1, dt * 4));
      tempLook.copy(planeMesh.position).add(forward.clone().multiplyScalar(45)).add(new THREE.Vector3(0, 7, 0));
      camera.lookAt(tempLook);
    }
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  function applyVisual() {
    const geo = world.terrain.geometry;
    const colors = geo.attributes.color;
    const pos = geo.attributes.position;
    const source = happyMode ? geo.userData.happyColors : geo.userData.satColors;
    for (let i = 0; i < colors.count; i++) {
      if (mapMode && !happyMode) {
        const c = terrainColor(pos.getY(i));
        colors.setXYZ(i, c.r, c.g, c.b);
      } else if (source) {
        colors.setXYZ(i, source[i * 3], source[i * 3 + 1], source[i * 3 + 2]);
      }
    }
    colors.needsUpdate = true;
    const mat = world.terrain.material;
    mat.map = !happyMode && !mapMode && imageryOn ? imageryTexture : null;
    mat.color.set('#ffffff');
    mat.needsUpdate = true;

    world.sea.material.color.set(happyMode ? '#3fc3d6' : mapMode ? '#1a86c9' : '#1b6b93');
    world.sea.material.map = happyMode ? world.sea.userData.shimmer : null;
    world.sea.material.opacity = 1;
    world.sea.material.needsUpdate = true;
    scene.background.set(happyMode ? '#8fdcf5' : '#8cc3e8');
    scene.fog.color.set(happyMode ? '#c4ecf7' : '#a9c9dc');
    hemi.groundColor.set(happyMode ? '#7fc46a' : '#4c6b50');
    hemi.intensity = happyMode ? 1.5 : 1.1;
    sun.intensity = happyMode ? 2.1 : 1.8;
    if (world.happy) world.happy.visible = happyMode;
    for (const mesh of world.coast || []) {
      mesh.material.color.set(happyMode ? '#9ce8d8' : '#54c4d8');
      mesh.material.opacity = happyMode ? 0.75 : mapMode ? 0.9 : 0.55;
    }
    for (const cloud of clouds.children) cloud.material.opacity = happyMode ? 0.95 : 0.75;
  }

  function setHappy(enabled) {
    happyMode = !!enabled;
    if (happyMode) { mapMode = false; imageryOn = false; }
    applyVisual();
  }

  function setImagery(enabled) {
    imageryOn = !!enabled;
    if (imageryOn) happyMode = false;
    applyVisual();
  }

  function setMapMode(enabled) {
    mapMode = !!enabled;
    if (mapMode) happyMode = false;
    applyVisual();
  }

  function resize(w, h) {
    renderer.setSize(w, h);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }

  return { renderer, scene, camera, world, setPlane, setTraffic, setHappy, setImagery, setMapMode, update, resize };
}

function L_COCKPIT(plane) { return Math.max(2, plane.length * 0.16); }
