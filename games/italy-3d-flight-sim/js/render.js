/* Italy 3D Flight Sim — Three.js scene, cameras, lighting and weather */

import * as THREE from '../../_vendor/three.module.js';
import { WORLD } from './config.js';
import { terrainHeight } from './geo.js';
import { createWorld, terrainColor } from './terrain.js';
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

function makeClouds(scene, quality) {
  const count = quality === 'low' ? 24 : 60;
  const tex = cloudTexture();
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.75 });
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

export function createRenderer(canvas, quality = 'high', imageryTexture = null) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality === 'high', powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#8cc3e8');
  scene.fog = new THREE.FogExp2('#a9c9dc', 0.00085);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / Math.max(1, window.innerHeight), 1, 7000);
  const hemi = new THREE.HemisphereLight('#cfe9ff', '#4c6b50', 1.1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff2d5', 1.8);
  sun.position.set(400, 800, -300);
  scene.add(sun);

  const world = createWorld(scene, quality, imageryTexture);
  const clouds = makeClouds(scene, quality);
  let planeMesh = null;
  let trafficMeshes = [];
  let sunTime = 0.3;
  let mapMode = false;
  let imageryOn = true;
  const tempV = new THREE.Vector3();
  const tempLook = new THREE.Vector3();

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
    sun.intensity = 0.5 + day * 1.6;
    hemi.intensity = 0.35 + day * 0.9;
    scene.background.setHSL(0.57, 0.55, 0.16 + day * 0.45);
    scene.fog.color.copy(scene.background);
    sun.position.set(Math.cos(sunTime * Math.PI * 2) * 700, 200 + day * 800, -400);

    clouds.rotation.y += dt * 0.002;

    if (!s) { renderer.render(scene, camera); return; }
    if (!planeMesh) setPlane(game.plane);
    planeMesh.position.set(s.x, s.y, s.z);
    planeMesh.rotation.set(s.pitch, -s.heading, -s.roll);
    animatePlane(planeMesh, time, s.boosting);

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

  function setImagery(enabled) {
    imageryOn = !!enabled;
    if (!imageryTexture) return;
    const mat = world.terrain.material;
    mat.map = imageryOn && !mapMode ? imageryTexture : null;
    mat.color.set(imageryOn && !mapMode ? '#ffffff' : '#6f9a78');
    mat.needsUpdate = true;
  }

  function setMapMode(enabled) {
    mapMode = !!enabled;
    const geo = world.terrain.geometry;
    const colors = geo.attributes.color;
    const pos = geo.attributes.position;
    for (let i = 0; i < colors.count; i++) {
      const c = mapMode ? terrainColor(pos.getY(i)) : null;
      const src = mapMode ? null : geo.userData.satColors;
      if (c) colors.setXYZ(i, c.r, c.g, c.b);
      else if (src) colors.setXYZ(i, src[i * 3], src[i * 3 + 1], src[i * 3 + 2]);
    }
    colors.needsUpdate = true;
    const mat = world.terrain.material;
    mat.map = mapMode || !imageryOn || !imageryTexture ? null : imageryTexture;
    mat.color.set(imageryOn || mapMode ? '#ffffff' : '#6f9a78');
    mat.needsUpdate = true;
    world.sea.material.color.set(mapMode ? '#1a86c9' : '#1b6b93');
    for (const mesh of world.coast || []) mesh.material.opacity = mapMode ? 0.9 : 0.55;
  }

  function resize(w, h) {
    renderer.setSize(w, h);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }

  return { renderer, scene, camera, world, setPlane, setTraffic, setImagery, setMapMode, update, resize };
}

function L_COCKPIT(plane) { return Math.max(2, plane.length * 0.16); }
