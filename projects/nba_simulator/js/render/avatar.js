/* Procedural low-poly 3D basketball player avatar (Three.js r160, no external models) */

import * as THREE from 'three';

function material(color, roughness = 0.75) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness, flatShading: true });
}

function box(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

function numberTexture(number, color) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 96px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number), 64, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  void color;
  return tex;
}

export function createAvatar(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 1.45, 4.1);
  camera.lookAt(0, 1.15, 0);
  scene.add(new THREE.HemisphereLight(0xdce9ff, 0x30364a, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7cc8ff, 0.5);
  rim.position.set(-3, 2, -3);
  scene.add(rim);

  let figure = null;
  let dragX = null;
  let spin = true;

  function disposeFigure() {
    if (!figure) return;
    figure.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(m => {
        if (!m) return;
        if (m.map) m.map.dispose();
        m.dispose();
      });
    });
    scene.remove(figure);
    figure = null;
  }

  function setPlayer(player, team) {
    disposeFigure();
    if (!player) return;
    const jersey = team && team.color ? team.color : '#00d4ff';
    const skin = player.skin || '#c68642';
    const hairColor = player.hairColor || '#1c1410';
    const height = player.heightCm || 200;
    const weight = player.weightKg || 100;
    const sy = height / 200;
    const sx = 0.85 + Math.max(-0.18, Math.min(0.28, (weight - 95) / 140));
    const shirt = material(jersey, 0.6);
    const shorts = material(jersey, 0.85);
    const skinMat = material(skin, 0.9);
    const hairMat = material(hairColor, 0.95);
    const shoeMat = material('#f3f5ff', 0.6);

    const group = new THREE.Group();
    group.add(box(0.82 * sx, 0.95 * sy, 0.44 * sx, shirt, 0, 1.35 * sy, 0));
    group.add(box(0.78 * sx, 0.32 * sy, 0.44 * sx, shorts, 0, 0.82 * sy, 0));

    [-1, 1].forEach(side => {
      group.add(box(0.22 * sx, 0.78 * sy, 0.25 * sx, shorts, side * 0.22 * sx, 0.35 * sy, 0));
      group.add(box(0.26 * sx, 0.16 * sy, 0.36 * sx, shoeMat, side * 0.22 * sx, 0.07, 0.05));
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * sx, 0.1 * sx, 0.72 * sy, 7), skinMat);
      arm.position.set(side * 0.52 * sx, 1.34 * sy, 0);
      arm.rotation.z = side * 0.18;
      group.add(arm);
    });

    const face = player.faceShape || 'oval';
    const shape = {
      oval: [1, 1.12, 0.94], round: [1.08, 0.98, 1],
      square: [1.12, 0.96, 1.05], long: [0.94, 1.25, 0.9]
    }[face] || [1, 1.12, 0.94];
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), skinMat);
    head.position.set(0, 2.02 * sy, 0);
    head.scale.set(shape[0], shape[1], shape[2]);
    group.add(head);

    const style = player.hairStyle || 'short';
    if (style !== 'bald') {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.29, 12, 10, 0, Math.PI * 2, 0, Math.PI * (style === 'buzz' ? 0.48 : 0.6)), hairMat);
      hair.position.copy(head.position);
      hair.position.y += style === 'long' ? 0.02 : 0.035;
      hair.scale.set(shape[0] * 1.03, shape[1] * 1.04, shape[2] * 1.05);
      group.add(hair);
      if (style === 'braids' || style === 'curly') {
        for (let i = -2; i <= 2; i++) {
          const strand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 7, 6), hairMat);
          strand.position.set(i * 0.085, 2.12 * sy, 0.23);
          group.add(strand);
        }
      }
    }

    const eyeMat = material('#101521', 0.4);
    [-1, 1].forEach(side => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), eyeMat);
      eye.position.set(side * 0.1, 2.04 * sy, 0.265 * shape[2]);
      group.add(eye);
      const brow = box(0.1, 0.018, 0.02, hairMat, side * 0.1, 2.09 * sy, 0.27 * shape[2]);
      group.add(brow);
    });
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 6), skinMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 1.99 * sy, 0.29 * shape[2]);
    group.add(nose);
    group.add(box(0.12, 0.02, 0.02, material('#5a2f2a', 0.8), 0, 1.93 * sy, 0.27 * shape[2]));

    const tex = numberTexture(player.jersey == null ? 1 : player.jersey, jersey);
    const num = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.42),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    num.position.set(0, 1.4 * sy, 0.225 * sx);
    group.add(num);

    group.scale.setScalar(0.95);
    scene.add(group);
    figure = group;
  }

  function resize(w, h, dpr) {
    const width = Math.max(1, w || canvas.clientWidth || 320);
    const height = Math.max(1, h || canvas.clientHeight || 380);
    renderer.setPixelRatio(Math.min(1.5, dpr || 1));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render(now) {
    if (!figure) return;
    if (spin && dragX === null) figure.rotation.y = (now / 2600) % (Math.PI * 2) - Math.PI;
    renderer.render(scene, camera);
  }

  function rotate(delta) {
    if (!figure) return;
    spin = false;
    figure.rotation.y += delta * 0.01;
  }

  function endDrag() { dragX = null; }
  function startDrag() { dragX = true; }
  function autoSpin(value) { spin = !!value; }

  function dispose() {
    disposeFigure();
    renderer.dispose();
  }

  return { setPlayer, resize, render, rotate, startDrag, endDrag, autoSpin, dispose, ok: true };
}
