/* Italy 3D Flight Sim — Three.js scene, cameras, lighting and weather */

import * as THREE from '../../_vendor/three.module.js';
import { GLIDE_SLOPE, RUNWAY, airfields, runwayCoords } from './airfields.js';
import { createWorld } from './terrain.js';
import { createPlaneMesh, animatePlane } from './planes.js';
import { createLandmarks } from './landmarks.js';

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

/* Clouds drift in a square that travels with the aircraft. */
const CLOUD_SPAN = 7000;
const FOG = { clear: 0.00024, cloudy: 0.00048, fog: 0.0016 };
const wrapAround = (value, centre, span) => value - Math.round((value - centre) / span) * span;

function makeClouds(scene, quality, happy) {
  const count = quality === 'low' ? 36 : 110;
  const tex = cloudTexture();
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: happy ? 0.95 : 0.75 });
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const s = new THREE.Sprite(mat);
    s.position.set((Math.random() - 0.5) * CLOUD_SPAN, 550 + Math.random() * 700, (Math.random() - 0.5) * CLOUD_SPAN);
    const scale = 120 + Math.random() * 180;
    s.scale.set(scale, scale * 0.45, 1);
    group.add(s);
  }
  scene.add(group);
  return group;
}

export function createRenderer(canvas, quality = 'high', initialTexture = null, visual = 'happy') {
  let imageryTexture = initialTexture;
  let happyMode = visual === 'happy';
  /* A logarithmic depth buffer keeps distant shores and runways from flickering. */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality === 'high', powerPreference: 'high-performance', logarithmicDepthBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(happyMode ? '#8fdcf5' : '#8cc3e8');
  scene.fog = new THREE.FogExp2(happyMode ? '#c4ecf7' : '#a9c9dc', FOG.clear);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / Math.max(1, window.innerHeight), 1, 60000);
  const hemi = new THREE.HemisphereLight('#e6f8ff', happyMode ? '#7fc46a' : '#4c6b50', happyMode ? 1.5 : 1.1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff6d8', happyMode ? 2.1 : 1.8);
  sun.position.set(400, 800, -300);
  scene.add(sun);

  const world = createWorld(scene, quality);
  /* Behind the menus, look out over the coast west of Rome. */
  const home = airfields().find(f => f.code === 'FCO');
  camera.position.set(home.x + 520, 240, home.z + 420);
  camera.lookAt(home.x - 200, 0, home.z - 80);
  /* Seen from the overview, the aircraft itself is far too small to find. */
  const marker = new THREE.Mesh(new THREE.ConeGeometry(110, 330, 4), new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false }));
  marker.geometry.rotateX(-Math.PI / 2);
  marker.visible = false;
  scene.add(marker);
  const clouds = makeClouds(scene, quality, happyMode);
  let planeMesh = null;
  let landmarks = [];
  let trafficMeshes = [];
  let sunTime = 0.3;
  let mapMode = false;
  let imageryOn = true;
  let timeMode = 'cycle';
  let weather = 'clear';
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
    if (timeMode === 'cycle') sunTime = (sunTime + dt * 0.004) % 1;
    const day = 0.5 + 0.5 * Math.sin(sunTime * Math.PI * 2 - Math.PI / 2);
    sun.intensity = happyMode ? 0.4 + day * 1.8 : 0.25 + day * 1.9;
    hemi.intensity = happyMode ? 0.5 + day * 1.0 : 0.2 + day * 1.2;
    if (world.cityLights) world.cityLights.visible = day < 0.38;
    if (happyMode) {
      if (day < 0.25) scene.background.set(weather === 'fog' ? '#2a3d5c' : '#162b4d');
      else scene.background.set(weather === 'fog' ? '#a9c5cf' : '#8fdcf5');
      scene.fog.color.copy(scene.background);
    } else {
      scene.background.setHSL(0.57, 0.55, 0.14 + day * 0.46);
      scene.fog.color.copy(scene.background);
    }
    sun.position.set(Math.cos(sunTime * Math.PI * 2) * 700, 200 + day * 800, -400);

    const focus = s || camera.position;
    for (const cloud of clouds.children) {
      cloud.position.x = wrapAround(cloud.position.x + dt * 6, focus.x, CLOUD_SPAN);
      cloud.position.z = wrapAround(cloud.position.z, focus.z, CLOUD_SPAN);
    }
    world.ground.uniforms.seaTime.value = time % 1000;
    world.terrain.update(focus.x, focus.z, quality === 'low' ? 1 : 2);
    const overview = !!s && game.view === 'overview';
    scene.fog.density = overview ? 0 : FOG[weather];
    clouds.visible = !overview;
    marker.visible = overview;
    for (const { sprite, range: reach } of world.labels) {
      sprite.visible = !overview && Math.hypot(focus.x - sprite.position.x, focus.z - sprite.position.z) < reach;
    }
    for (const mesh of world.cities) {
      const c = mesh.userData.center;
      mesh.visible = !overview && Math.hypot(focus.x - c.x, focus.z - c.z) < (quality === 'low' ? 2000 : 3600);
    }
    for (const node of landmarks) {
      const near = !overview && Math.hypot(focus.x - node.position.x, focus.z - node.position.z) < 3000;
      node.visible = near;
      node.userData.tag.visible = near && Math.hypot(focus.x - node.position.x, focus.z - node.position.z) < 1500;
    }

    if (!s) { renderer.render(scene, camera); return; }
    if (!planeMesh) setPlane(game.plane);
    planeMesh.position.set(s.x, s.y, s.z);
    planeMesh.rotation.set(s.pitch, -s.heading, -s.roll);
    animatePlane(planeMesh, time, s.boosting);

    if (happyMode) {
      for (const bird of world.happy.userData.birds.children) {
        bird.position.x = wrapAround(bird.position.x + bird.userData.speed * dt, s.x, 1800);
        bird.position.z = wrapAround(bird.position.z, s.z, 1800);
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

    updatePapi(s);

    // Real city buildings are only drawn near the aircraft.
    const range = quality === 'low' ? 1400 : 2600;
    for (const mesh of world.realBuildings || []) {
      const c = mesh.userData.center;
      mesh.visible = !!c && Math.hypot(s.x - c.x, s.z - c.z) < range;
    }

    const forward = tempV.set(Math.sin(s.heading) * Math.cos(s.pitch), Math.sin(s.pitch), -Math.cos(s.heading) * Math.cos(s.pitch));
    // In the realistic model the cockpit view banks with the aircraft.
    const banked = game.view === 'cockpit' && s.model === 'real';
    camera.up.set(0, 1, 0);
    if (banked) camera.up.applyQuaternion(planeMesh.quaternion);
    // The eye sits inside the airframe there, so the external model would block the view.
    planeMesh.visible = !banked;
    if (game.view === 'overview') {
      camera.fov = 55;
      tempLook.set(0, 0, 400);
      camera.position.lerp(new THREE.Vector3(0, 11800, 8600), Math.min(1, dt * 3));
      camera.lookAt(tempLook);
      marker.position.set(s.x, 400, s.z);
      marker.rotation.y = -s.heading;
    } else if (game.view === 'cockpit') {
      camera.fov = 78;
      tempLook.copy(planeMesh.position).add(forward.clone().multiplyScalar(160)).addScaledVector(camera.up, 8);
      const eye = planeMesh.position.clone().add(forward.clone().multiplyScalar(L_COCKPIT(game.plane))).addScaledVector(camera.up, 3);
      // A banking cockpit is fixed to the airframe; smoothing it would make it swim.
      if (banked) camera.position.copy(eye);
      else camera.position.lerp(eye, Math.min(1, dt * 12));
      camera.lookAt(tempLook);
    } else {
      camera.fov = 70;
      const behind = planeMesh.position.clone().add(forward.clone().multiplyScalar(-52)).add(new THREE.Vector3(0, 20, 0));
      /* Cut straight there after a jump, such as a new flight or a respawn. */
      if (camera.position.distanceTo(behind) > 200) camera.position.copy(behind);
      else camera.position.lerp(behind, Math.min(1, dt * 4));
      tempLook.copy(planeMesh.position).add(forward.clone().multiplyScalar(45)).add(new THREE.Vector3(0, 7, 0));
      camera.lookAt(tempLook);
    }
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  /* PAPI: more red lamps the lower you are, two red and two white on the path. */
  function updatePapi(s) {
    for (const set of world.papi || []) {
      const field = airfields().find(f => f.code === set.code);
      const distance = RUNWAY.aim - RUNWAY.half - runwayCoords(field, s.x, s.z).along * set.end;
      if (distance < 5 || distance > 700) continue;
      const ratio = (s.y - field.elevation - 1.5) / (distance * GLIDE_SLOPE);
      const white = [0.72, 0.9, 1.1, 1.3].filter(limit => ratio > limit).length;
      set.lamps.forEach((lamp, i) => lamp.material.color.set(i < white ? '#ffffff' : '#ff4040'));
    }
  }

  function applyVisual() {
    const satellite = !happyMode && !mapMode && imageryOn ? imageryTexture : null;
    world.setLook(happyMode ? 'happy' : mapMode ? 'map' : 'natural', satellite);
    scene.background.set(happyMode ? '#8fdcf5' : '#8cc3e8');
    scene.fog.color.set(happyMode ? '#c4ecf7' : '#a9c9dc');
    hemi.groundColor.set(happyMode ? '#7fc46a' : '#4c6b50');
    hemi.intensity = happyMode ? 1.5 : 1.1;
    sun.intensity = happyMode ? 2.1 : 1.8;
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

  function setTimeMode(mode) {
    timeMode = ['cycle', 'day', 'dusk', 'night'].includes(mode) ? mode : 'cycle';
    if (timeMode === 'day') sunTime = 0.5;
    if (timeMode === 'dusk') sunTime = 0.25;
    if (timeMode === 'night') sunTime = 0;
  }

  function setWeather(preset) {
    weather = ['clear', 'cloudy', 'fog'].includes(preset) ? preset : 'clear';
    for (const cloud of clouds.children) cloud.material.opacity = weather === 'fog' ? 0.25 : weather === 'cloudy' ? 0.9 : happyMode ? 0.95 : 0.75;
  }

  function addLandmarks() { landmarks = createLandmarks(world.group); return landmarks; }

  function setImageryTexture(tex) {
    imageryTexture = tex;
    applyVisual();
  }

  function resize(w, h) {
    renderer.setSize(w, h);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }

  return { renderer, scene, camera, world, setPlane, setTraffic, addLandmarks, setHappy, setImagery, setImageryTexture, setMapMode, setTimeMode, setWeather, update, resize };
}

function L_COCKPIT(plane) { return Math.max(2, plane.length * 0.16); }
