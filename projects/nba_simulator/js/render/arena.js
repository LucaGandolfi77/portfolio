/* 3D broadcast arena with animated crowd, figures, ball and camera modes */

import * as THREE from 'three';
import { buildFigure, disposeFigure } from './avatar.js';
import { shade } from '../core/theme.js';

const POS = {
  PG: [0.24, 0.5], SG: [0.34, 0.24], SF: [0.34, 0.76], PF: [0.46, 0.38], C: [0.5, 0.6]
};

const CAMERAS = {
  broadcast: { pos: [0, 7.5, 11], look: [0, 0.6, 0] },
  overhead: { pos: [0, 14, 0.01], look: [0, 0, 0] },
  baseline: { pos: [11, 3.5, 0], look: [0, 0.6, 0] }
};

function woodTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#b4753a');
  g.addColorStop(1, '#8a5426');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.05)';
    ctx.fillRect(0, i * 20, 512, 10);
  }
  for (let i = 0; i < 90; i++) {
    ctx.strokeStyle = 'rgba(70,35,12,.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, i * 6);
    ctx.bezierCurveTo(170, i * 6 + 4, 340, i * 6 - 4, 512, i * 6);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function ledTexture(text, color) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#07101f';
  ctx.fillRect(0, 0, 1024, 64);
  ctx.fillStyle = color;
  ctx.font = '900 34px Inter, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 20, 34);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function line(scene, w, h, x, z, color = 0xffffff) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.01, h),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 })
  );
  m.position.set(x, 0.015, z);
  scene.add(m);
  return m;
}

export function createArena(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  renderer.setClearColor(0x050a16, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050a16, 18, 42);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
  camera.position.set(...CAMERAS.broadcast.pos);
  camera.lookAt(...CAMERAS.broadcast.look);

  scene.add(new THREE.HemisphereLight(0xdce9ff, 0x1b2238, 1.05));
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(6, 12, 7);
  scene.add(sun);
  const homeLight = new THREE.PointLight(0x00d4ff, 1.2, 26);
  homeLight.position.set(-6, 7, 2);
  scene.add(homeLight);
  const awayLight = new THREE.PointLight(0x7c5cff, 1.2, 26);
  awayLight.position.set(6, 7, -2);
  scene.add(awayLight);

  // Floor and markings
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(15, 9), new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.55 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  line(scene, 14, 0.035, 0, 4.2); line(scene, 14, 0.035, 0, -4.2);
  line(scene, 0.035, 8.4, 6.9, 0); line(scene, 0.035, 8.4, -6.9, 0);
  line(scene, 0.035, 8.4, 0, 0);
  const circle = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.18, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
  circle.rotation.x = -Math.PI / 2;
  circle.position.y = 0.016;
  scene.add(circle);
  [-1, 1].forEach(side => {
    const key = line(scene, 2.6, 3.6, side * 5.6, 0);
    key.material.transparent = true;
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 20), new THREE.MeshStandardMaterial({ color: 0xff7b00, emissive: 0x662200, roughness: 0.4 }));
    hoop.rotation.x = Math.PI / 2;
    hoop.position.set(side * 6.2, 1.35, 0);
    scene.add(hoop);
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 1.5), new THREE.MeshStandardMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.45 }));
    board.position.set(side * 6.55, 1.5, 0);
    scene.add(board);
  });

  // LED ribbon
  const led = new THREE.Mesh(
    new THREE.BoxGeometry(15.2, 0.5, 9.2),
    [new THREE.MeshBasicMaterial({ map: ledTexture('NBA SIM • LIVE', '#00d4ff') }),
     new THREE.MeshBasicMaterial({ map: ledTexture('NBA SIM • LIVE', '#00d4ff') }),
     new THREE.MeshBasicMaterial({ color: 0x07101f }),
     new THREE.MeshBasicMaterial({ color: 0x07101f }),
     new THREE.MeshBasicMaterial({ map: ledTexture('NBA SIM • LIVE', '#00d4ff') }),
     new THREE.MeshBasicMaterial({ map: ledTexture('NBA SIM • LIVE', '#7c5cff') })]
  );
  led.position.y = -0.3;
  scene.add(led);

  // Crowd
  const crowdCount = 360;
  const crowd = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.11, 5, 4),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
    crowdCount
  );
  const dummy = new THREE.Object3D();
  const crowdData = [];
  const palette = [0x4de8ff, 0xa78bfa, 0xffd166, 0xff7b9c, 0xeaf3ff];
  for (let i = 0; i < crowdCount; i++) {
    const side = i % 4;
    let x, z;
    if (side === 0) { x = -8.4 - (i % 5) * 0.35; z = (i / crowdCount - 0.5) * 12; }
    else if (side === 1) { x = 8.4 + (i % 5) * 0.35; z = (i / crowdCount - 0.5) * 12; }
    else if (side === 2) { x = (i / crowdCount - 0.5) * 18; z = -5.6 - (i % 4) * 0.35; }
    else { x = (i / crowdCount - 0.5) * 18; z = 5.6 + (i % 4) * 0.35; }
    crowdData.push({ x, z, base: 0.5 + (i % 6) * 0.12, phase: i * 0.13, color: new THREE.Color(palette[i % palette.length]) });
    crowd.setColorAt(i, crowdData[i].color);
  }
  scene.add(crowd);

  // Ball + trail
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshStandardMaterial({ color: 0xff9f1c, emissive: 0x552200, roughness: 0.5 }));
  ball.position.set(0, 0.2, 0);
  scene.add(ball);
  const trail = [];
  for (let i = 0; i < 8; i++) {
    const t = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb703, transparent: true, opacity: 0.35 - i * 0.035 }));
    scene.add(t);
    trail.push(t);
  }

  const figures = new Map();
  let cameraMode = 'broadcast';
  let targetPos = new THREE.Vector3(...CAMERAS.broadcast.pos);
  let targetLook = new THREE.Vector3(...CAMERAS.broadcast.look);
  let currentLook = targetLook.clone();
  let shot = null;
  let lastShotKey = '';
  let crowdFrame = 0;

  function worldPos(p, side) {
    const base = POS[p] || POS.SF;
    const nx = side === 'away' ? 1 - base[0] : base[0];
    const nz = side === 'away' ? 1 - base[1] : base[1];
    return { x: (nx - 0.5) * 12, z: (nz - 0.5) * 7 };
  }

  function setState(state, now) {
    if (!state) return;
    if (state.homeColor) {
      homeLight.color.set(state.homeColor);
      awayLight.color.set(state.awayColor || '#7c5cff');
    }
    const seen = new Set();
    for (const p of state.players || []) {
      const key = p.id || `${p.side}-${p.pos}`;
      seen.add(key);
      let fig = figures.get(key);
      if (!fig) {
        fig = buildFigure(p, { color: p.side === 'home' ? state.homeColor : state.awayColor });
        fig.scale.setScalar(0.42);
        scene.add(fig);
        figures.set(key, fig);
      }
      const wp = worldPos(p.pos, p.side);
      const wobble = Math.sin(now / 800 + key.length) * 0.06;
      fig.position.set(wp.x + wobble, 0.02, wp.z);
      fig.rotation.y = p.side === 'away' ? Math.PI : 0;
      fig.position.y = Math.abs(Math.sin(now / 300 + key.length)) * 0.02;
    }
    for (const [key, fig] of figures) {
      if (!seen.has(key)) { disposeFigure(fig); figures.delete(key); }
    }

    const s = state.lastShot;
    if (s && s.key !== lastShotKey) {
      lastShotKey = s.key;
      const shooter = (state.players || []).find(p => p.id === s.player);
      const wp = worldPos(shooter ? shooter.pos : 'SG', s.side);
      shot = {
        start: new THREE.Vector3(wp.x, 1.2, wp.z),
        end: new THREE.Vector3(s.side === 'home' ? 6.2 : -6.2, 1.5, 0),
        t: 0, made: s.made, trail: []
      };
    }
    if (shot) {
      shot.t = Math.min(1, shot.t + 0.022);
      const k = shot.t;
      ball.position.lerpVectors(shot.start, shot.end, k);
      ball.position.y += Math.sin(k * Math.PI) * 2.3;
      shot.trail.unshift(ball.position.clone());
      if (shot.trail.length > trail.length) shot.trail.pop();
      trail.forEach((t, i) => {
        const p = shot.trail[i];
        t.position.copy(p || ball.position);
        t.material.opacity = p ? 0.32 - i * 0.035 : 0;
      });
      if (shot.t >= 1) shot = null;
    } else {
      ball.position.set(Math.sin(now / 900) * 0.4, 0.2, Math.cos(now / 1100) * 0.3);
      trail.forEach(t => { t.material.opacity = 0; });
    }
  }

  function setCamera(mode) {
    if (!CAMERAS[mode]) return;
    cameraMode = mode;
    targetPos.set(...CAMERAS[mode].pos);
    targetLook.set(...CAMERAS[mode].look);
  }

  function resize(w, h, dpr) {
    const width = Math.max(1, w || canvas.clientWidth || 640);
    const height = Math.max(1, h || canvas.clientHeight || 400);
    renderer.setPixelRatio(Math.min(1.5, dpr || 1));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render(now) {
    camera.position.lerp(targetPos, 0.06);
    currentLook.lerp(targetLook, 0.08);
    camera.lookAt(currentLook);
    if (crowdFrame++ % 3 === 0) {
      for (let i = 0; i < crowdCount; i++) {
        const d = crowdData[i];
        dummy.position.set(d.x, d.base + Math.max(0, Math.sin(now / 380 + d.phase)) * 0.22, d.z);
        dummy.updateMatrix();
        crowd.setMatrixAt(i, dummy.matrix);
      }
      crowd.instanceMatrix.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }

  function dispose() {
    for (const fig of figures.values()) disposeFigure(fig);
    figures.clear();
    scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
      }
    });
    renderer.dispose();
  }

  return { kind: 'arena', canvas, setTeams() {}, setState, setCamera, get cameraMode() { return cameraMode; }, resize, render, dispose, ok: true };
}
