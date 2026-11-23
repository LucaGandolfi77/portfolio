/* Italy 3D Flight Sim — real Italian landmarks as procedural 3D models */

import * as THREE from '../../_vendor/three.module.js';
import { geoToWorld, terrainHeight } from './geo.js';

const SCALE = 0.34;
let data = null;

export function initLandmarks(json) { data = json; }
export function landmarksData() { return data; }

function label(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 320; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(8,30,24,0.78)';
  ctx.fillRect(0, 0, 320, 64);
  ctx.font = '700 26px ui-monospace, monospace';
  ctx.fillStyle = '#ffd86b';
  ctx.textAlign = 'center';
  ctx.fillText(text.toUpperCase(), 160, 42);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthTest: false }));
  sprite.scale.set(86, 18, 1);
  return sprite;
}

function modelFor(kind, height, color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
  const light = new THREE.MeshStandardMaterial({ color: '#f5efe2', roughness: 0.85 });
  const h = Math.min(70, height * SCALE);
  if (kind === 'volcano') {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(46, 34, 12), new THREE.MeshStandardMaterial({ color: '#6b6058', roughness: 1 }));
    cone.position.y = 17; g.add(cone);
    const crater = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 2, 12), new THREE.MeshBasicMaterial({ color: '#ff7b42' }));
    crater.position.y = 34; g.add(crater);
    return g;
  }
  if (kind === 'colosseum' || kind === 'arena') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(h * 0.7, h * 0.2, 6, 18), mat);
    ring.rotation.x = Math.PI / 2; ring.position.y = h * 0.55; g.add(ring);
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2;
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(h * 0.12, h, h * 0.12), light);
      pillar.position.set(Math.cos(a) * h * 0.7, h * 0.5, Math.sin(a) * h * 0.7);
      g.add(pillar);
    }
    return g;
  }
  if (kind === 'leaning') {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.14, h * 0.16, h * 1.7, 10), light);
    tower.position.y = h * 0.85; tower.rotation.z = 0.12; g.add(tower);
    return g;
  }
  if (kind === 'square') {
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(h * 0.7, h * (0.5 + i * 0.12), h * 0.5), i % 2 ? mat : light);
      b.position.set((i - 1.5) * h * 0.8, b.geometry.parameters.height / 2, (i % 2) * h * 0.5);
      g.add(b);
    }
    const tower = new THREE.Mesh(new THREE.BoxGeometry(h * 0.18, h * 1.6, h * 0.18), mat);
    tower.position.set(-h * 1.5, h * 0.8, 0); g.add(tower);
    return g;
  }
  const body = new THREE.Mesh(new THREE.BoxGeometry(h * 0.9, h, h * 0.7), light);
  body.position.y = h * 0.5; g.add(body);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(h * 0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
  dome.position.y = h; g.add(dome);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(h * 0.07, h * 0.5, 6), mat);
  spire.position.y = h * 1.45; g.add(spire);
  return g;
}

export function createLandmarks(group) {
  if (!data) return [];
  const made = [];
  const colors = ['#e8c9a0', '#d9b48f', '#efd9b0', '#caa47e'];
  for (const lm of data.landmarks) {
    const p = geoToWorld(lm.lon, lm.lat);
    const node = modelFor(lm.kind, lm.height, colors[made.length % colors.length]);
    node.position.set(p.x, terrainHeight(p.x, p.z), p.z);
    node.userData.landmark = lm;
    group.add(node);
    const tag = label(lm.name.en);
    tag.position.set(p.x, terrainHeight(p.x, p.z) + Math.min(70, lm.height * SCALE) + 32, p.z);
    group.add(tag);
    made.push(node);
  }
  return made;
}
