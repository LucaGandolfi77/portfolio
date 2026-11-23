/* Procedural 3D gacha chest with rarity beam and particles (Three.js r160) */

import * as THREE from 'three';
import { fxFor } from '../data/chest-fx.js';

export function createChest(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.set(0, 2.6, 6.4);
  camera.lookAt(0, 0.7, 0);
  scene.add(new THREE.HemisphereLight(0xdce9ff, 0x1a2033, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 6, 4);
  scene.add(key);
  const glowLight = new THREE.PointLight(0x4de8ff, 0, 12);
  glowLight.position.set(0, 1.4, 1.2);
  scene.add(glowLight);

  const chest = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x3a2415, roughness: 0.6 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xd9b45b, roughness: 0.32, metalness: 0.75 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 1.5), wood);
  body.position.y = 0.62;
  chest.add(body);
  [-0.85, 0.85].forEach(x => {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.25, 1.56), metal);
    band.position.set(x, 0.62, 0);
    chest.add(band);
  });
  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.16), metal);
  lock.position.set(0, 0.85, 0.8);
  chest.add(lock);

  const lid = new THREE.Group();
  const lidTop = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.5, 1.54), wood);
  lidTop.position.set(0, 0.25, 0);
  lid.add(lidTop);
  const lidBand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.55, 1.58), metal);
  [-0.85, 0.85].forEach(x => { const b = lidBand.clone(); b.position.set(x, 0.25, 0); lid.add(b); });
  lid.position.set(0, 1.22, -0.75);
  chest.add(lid);

  const seam = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.12), new THREE.MeshBasicMaterial({ color: 0x4de8ff, transparent: true, opacity: 0.9 }));
  seam.position.set(0, 1.24, 0.76);
  chest.add(seam);
  scene.add(chest);

  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 1.3, 6, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x4de8ff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  beam.position.set(0, 3.2, 0);
  scene.add(beam);

  const count = 260;
  const positions = new Float32Array(count * 3);
  const velocities = [];
  for (let i = 0; i < count; i++) {
    positions[i * 3] = 0; positions[i * 3 + 1] = -50; positions[i * 3 + 2] = 0;
    velocities.push({ x: 0, y: 0, z: 0 });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x4de8ff, size: 0.12, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(particles);

  let tier = 'common';
  let phase = 'idle';
  let phaseProgress = 0;
  let burst = false;
  let lastBurst = 0;

  function setRarity(next) {
    tier = next;
    const fx = fxFor(tier);
    seam.material.color.set(fx.beam);
    beam.material.color.set(fx.beam);
    particles.material.color.set(fx.color);
    glowLight.color.set(fx.beam);
    burst = false;
  }

  function setPhase(next, progress = 0) {
    phase = next;
    phaseProgress = Math.max(0, Math.min(1, progress));
    if (next === 'beam' && !burst) { burst = true; lastBurst = performance.now(); spawnParticles(); }
    if (next === 'idle') burst = false;
  }

  function spawnParticles() {
    const fx = fxFor(tier);
    const total = Math.min(count, fx.particles);
    for (let i = 0; i < count; i++) {
      if (i >= total) { positions[i * 3 + 1] = -50; continue; }
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.6;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = 0.9 + Math.random() * 0.4;
      positions[i * 3 + 2] = Math.sin(a) * r;
      velocities[i] = {
        x: Math.cos(a) * (0.6 + Math.random()) * fx.particleSpeed,
        y: (1.4 + Math.random() * 2.2) * fx.particleSpeed,
        z: Math.sin(a) * (0.6 + Math.random()) * fx.particleSpeed
      };
    }
    geo.attributes.position.needsUpdate = true;
  }

  function resize(w, h, dpr) {
    const width = Math.max(1, w || canvas.clientWidth || 480);
    const height = Math.max(1, h || canvas.clientHeight || 360);
    renderer.setPixelRatio(Math.min(1.5, dpr || 1));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render(now) {
    const fx = fxFor(tier);
    let shake = 0;
    if (phase === 'shake') shake = Math.sin(now / 18) * 0.06 * (1 - phaseProgress);
    chest.position.x = shake;
    chest.position.y = Math.sin(now / 700) * 0.05;
    lid.rotation.x = phase === 'idle' || phase === 'shake' ? 0 : -Math.min(1.25, phaseProgress * 1.4);
    if (phase === 'open' || phase === 'beam' || phase === 'card' || phase === 'celebrate') lid.rotation.x = -1.15;

    const beamOn = ['beam', 'card', 'celebrate'].includes(phase);
    beam.material.opacity = beamOn ? 0.14 + Math.sin(now / 180) * 0.04 : 0;
    beam.scale.y = beamOn ? 0.6 + Math.min(1, (now - lastBurst) / 600) * 0.5 : 0.01;
    glowLight.intensity = beamOn ? 2.2 : 0.2;
    seam.material.opacity = beamOn ? 1 : 0.85;

    if (burst) {
      const dt = Math.min(0.05, (now - (render.last || now)) / 1000);
      render.last = now;
      for (let i = 0; i < count; i++) {
        if (positions[i * 3 + 1] < -40) continue;
        const v = velocities[i];
        positions[i * 3] += v.x * dt;
        positions[i * 3 + 1] += v.y * dt;
        positions[i * 3 + 2] += v.z * dt;
        v.y -= 2.6 * dt;
        if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = -50;
      }
      geo.attributes.position.needsUpdate = true;
    } else render.last = now;

    renderer.render(scene, camera);
  }

  function dispose() {
    scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => m.dispose());
      }
    });
    renderer.dispose();
  }

  return { setRarity, setPhase, resize, render, dispose, ok: true, kind: 'webgl' };
}
