/* Refined stylized 3D basketball figure + avatar viewer (Three.js r160) */

import * as THREE from 'three';
import { shade } from '../core/theme.js';

function mat(color, roughness = 0.6, metalness = 0.05) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness, metalness });
}

function mesh(geometry, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  return m;
}

function numberTexture(number) {
  const c = document.createElement('canvas');
  c.width = c.height = 192;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(255,255,255,.96)';
  ctx.font = '900 148px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number), 96, 102);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* Reusable procedural player figure (also used on the 3D court). */
export function buildFigure(player, team) {
  const color = (team && team.color) || '#00d4ff';
  const skin = mat(player.skin || '#c68642', 0.85);
  const jersey = mat(color, 0.55, 0.05);
  const accent = mat(shade(color, 0.55), 0.5);
  const shorts = mat(shade(color, -0.35), 0.75);
  const hair = mat(player.hairColor || '#1c1410', 0.95);
  const shoe = mat('#f3f5ff', 0.45);
  const eyeWhite = mat('#ffffff', 0.4);
  const eyeDark = mat('#101521', 0.35);

  const height = player.heightCm || 200;
  const weight = player.weightKg || 100;
  const sy = height / 200;
  const sx = 0.85 + Math.max(-0.17, Math.min(0.3, (weight - 95) / 130));
  const group = new THREE.Group();
  group.userData = { sy, sx, color };

  group.add(mesh(new THREE.CapsuleGeometry(0.34 * sx, 0.62 * sy, 8, 16), jersey, 0, 1.32 * sy, 0));
  group.add(mesh(new THREE.CylinderGeometry(0.36 * sx, 0.33 * sx, 0.3 * sy, 20), shorts, 0, 0.82 * sy, 0));

  [-1, 1].forEach(side => {
    group.add(mesh(new THREE.CapsuleGeometry(0.12 * sx, 0.55 * sy, 6, 12), shorts, side * 0.2 * sx, 0.4 * sy, 0));
    const sneaker = mesh(new THREE.SphereGeometry(0.17 * sx, 14, 10), shoe, side * 0.2 * sx, 0.12, 0.07);
    sneaker.scale.set(1, 0.55, 1.5);
    group.add(sneaker);
    const arm = mesh(new THREE.CapsuleGeometry(0.085 * sx, 0.55 * sy, 6, 12), skin, side * 0.47 * sx, 1.35 * sy, 0);
    arm.rotation.z = side * 0.16;
    group.add(arm);
    group.add(mesh(new THREE.SphereGeometry(0.13 * sx, 12, 10), jersey, side * 0.35 * sx, 1.68 * sy, 0));
  });

  group.add(mesh(new THREE.BoxGeometry(0.06, 0.62 * sy, 0.02), accent, 0, 1.33 * sy, 0.33 * sx));
  group.add(mesh(new THREE.PlaneGeometry(0.4, 0.4),
    new THREE.MeshBasicMaterial({ map: numberTexture(player.jersey == null ? 1 : player.jersey), transparent: true, depthWrite: false }),
    0, 1.45 * sy, 0.35 * sx));

  const face = player.faceShape || 'oval';
  const shape = { oval: [1, 1.12, 0.94], round: [1.08, 0.98, 1], square: [1.12, 0.96, 1.05], long: [0.94, 1.24, 0.9] }[face] || [1, 1.12, 0.94];
  const head = mesh(new THREE.SphereGeometry(0.28, 22, 18), skin, 0, 2.04 * sy, 0);
  head.scale.set(shape[0], shape[1], shape[2]);
  group.add(head);
  [-1, 1].forEach(side => {
    group.add(mesh(new THREE.SphereGeometry(0.055, 10, 8), skin, side * 0.28 * shape[0], 2.02 * sy, 0));
    const white = mesh(new THREE.SphereGeometry(0.045, 12, 10), eyeWhite, side * 0.1, 2.06 * sy, 0.255 * shape[2]);
    white.scale.set(1, 0.62, 0.5);
    group.add(white);
    group.add(mesh(new THREE.SphereGeometry(0.022, 10, 8), eyeDark, side * 0.1, 2.06 * sy, 0.275 * shape[2]));
    const brow = mesh(new THREE.BoxGeometry(0.1, 0.018, 0.02), hair, side * 0.1, 2.115 * sy, 0.265 * shape[2]);
    brow.rotation.z = side * 0.08;
    group.add(brow);
  });
  const nose = mesh(new THREE.ConeGeometry(0.035, 0.09, 8), skin, 0, 2.0 * sy, 0.29 * shape[2]);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);
  group.add(mesh(new THREE.BoxGeometry(0.12, 0.018, 0.02), mat('#6b3b32', 0.8), 0, 1.93 * sy, 0.27 * shape[2]));

  const style = player.hairStyle || 'short';
  if (style !== 'bald') {
    const cap = mesh(new THREE.SphereGeometry(0.292, 20, 16, 0, Math.PI * 2, 0, Math.PI * (style === 'buzz' ? 0.46 : 0.62)), hair, 0, 2.045 * sy, 0);
    cap.scale.set(shape[0] * 1.03, shape[1] * 1.04, shape[2] * 1.05);
    group.add(cap);
    if (style === 'braids' || style === 'curly') {
      for (let i = -2; i <= 2; i++) group.add(mesh(new THREE.SphereGeometry(0.05, 9, 8), hair, i * 0.082, 2.16 * sy, 0.22));
    }
    if (style === 'long') {
      const back = mesh(new THREE.SphereGeometry(0.26, 16, 12), hair, 0, 1.94 * sy, -0.1);
      back.scale.set(1, 1.15, 0.75);
      group.add(back);
    }
  }
  return group;
}

export function disposeFigure(group) {
  if (!group) return;
  group.traverse(child => {
    if (child.geometry) child.geometry.dispose();
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach(m => { if (!m) return; if (m.map) m.map.dispose(); m.dispose(); });
  });
  if (group.parent) group.parent.remove(group);
}

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
  g.addColorStop(0, 'rgba(0,0,0,.55)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function createAvatar(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 1.5, 4.3);
  camera.lookAt(0, 1.12, 0);
  scene.add(new THREE.HemisphereLight(0xdce9ff, 0x242a3d, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3.5, 5.5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7cc8ff, 0.65);
  rim.position.set(-3, 2.5, -3.5);
  scene.add(rim);
  const teamLight = new THREE.PointLight(0x00d4ff, 1.1, 9);
  teamLight.position.set(0.8, 2.2, 2.2);
  scene.add(teamLight);

  const pedestal = new THREE.Group();
  pedestal.add(mesh(new THREE.CylinderGeometry(0.82, 0.88, 0.09, 40), mat('#0b1224', 0.5, 0.3), 0, 0.045, 0));
  const ring = mesh(new THREE.TorusGeometry(0.79, 0.025, 10, 48), new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 1.4 }), 0, 0.095, 0);
  ring.rotation.x = Math.PI / 2;
  pedestal.add(ring);
  const shadow = mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }), 0, 0.105, 0);
  shadow.rotation.x = -Math.PI / 2;
  pedestal.add(shadow);
  scene.add(pedestal);

  let figure = null;
  let spin = true;
  let dragging = false;

  function setPlayer(player, team) {
    if (figure) disposeFigure(figure);
    if (!player) return;
    const color = (team && team.color) || '#00d4ff';
    teamLight.color = new THREE.Color(color);
    ring.material.color = new THREE.Color(color);
    ring.material.emissive = new THREE.Color(color);
    figure = buildFigure(player, team);
    figure.scale.setScalar(0.94);
    scene.add(figure);
    spin = true;
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
    if (spin && !dragging) figure.rotation.y = (now / 3200) % (Math.PI * 2) - Math.PI;
    figure.position.y = Math.sin(now / 620) * 0.012;
    renderer.render(scene, camera);
  }

  function rotate(delta) { if (figure) { spin = false; figure.rotation.y += delta * 0.01; } }
  function startDrag() { dragging = true; }
  function endDrag() { dragging = false; }
  function autoSpin(value) { spin = !!value; }
  function dispose() {
    if (figure) disposeFigure(figure);
    pedestal.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) { if (child.material.map) child.material.map.dispose(); child.material.dispose(); }
    });
    scene.remove(pedestal);
    renderer.dispose();
  }

  return { setPlayer, resize, render, rotate, startDrag, endDrag, autoSpin, dispose, ok: true };
}
