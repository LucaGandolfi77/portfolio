/**
 * tech.js — overlay Three.js e HUD di telemetria (modalità Tech).
 */

import * as THREE from 'three';
import { CHAINS, M68, clamp, lerp, chainOf } from './metrics.js';

let renderer = null, scene = null, camera = null;
let points = null, pointGeo = null, lines = null, lineGeo = null, axes = null;
const linePairs = [];
const pulse = { blink: 0, smile: 0, brow: 0 };

const VERT = `attribute float aSize;attribute vec3 aColor;uniform float uPR;uniform float uTime;
varying vec3 vColor;
void main(){
  vColor=aColor;
  vec4 mv=modelViewMatrix*vec4(position,1.0);
  gl_PointSize=aSize*uPR*(10.0/max(0.1,-mv.z));
  gl_PointSize+=sin(uTime*4.0+aSize*9.0)*1.6;
  gl_Position=projectionMatrix*mv;
}`;
const FRAG = `varying vec3 vColor;
void main(){
  vec2 c=gl_PointCoord-0.5;float d=length(c);
  float a=smoothstep(0.5,0.02,d);
  vec3 core=mix(vColor,vec3(1.0),smoothstep(0.3,0.06,d));
  gl_FragColor=vec4(core*a*1.6,a*0.95);
}`;

export function buildLinePairs() {
  linePairs.length = 0;
  for (const key of Object.keys(CHAINS)) {
    if (key === 'connectors') continue;
    const chain = CHAINS[key];
    for (let i = 0; i < chain.length - 1; i += 1) linePairs.push([chain[i], chain[i + 1]]);
  }
  for (const [a, b] of CHAINS.connectors) linePairs.push([a, b]);
}

export function initTech(canvas) {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.z = 10;

  pointGeo = new THREE.BufferGeometry();
  pointGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(68 * 3), 3));
  pointGeo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(68 * 3), 3));
  pointGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(68), 1));
  const material = new THREE.ShaderMaterial({
    uniforms: { uPR: { value: Math.min(devicePixelRatio || 1, 2) }, uTime: { value: 0 } },
    vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  });
  points = new THREE.Points(pointGeo, material);
  scene.add(points);

  lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePairs.length * 6), 3));
  const colors = new Float32Array(linePairs.length * 6).fill(0.3);
  lineGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(lines);

  const makeAxis = (color, end) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, end[0], end[1], end[2]]), 3));
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
  };
  axes = new THREE.Group();
  axes.add(makeAxis(0xff5f6d, [0.25, 0, 0]));
  axes.add(makeAxis(0x52ff9e, [0, 0.25, 0]));
  axes.add(makeAxis(0x3ee6ff, [0, 0, 0.25]));
  axes.visible = false;
  scene.add(axes);

  resizeTech();
}

export function resizeTech() {
  if (!renderer) return;
  const w = innerWidth, h = innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.left = -w / 2; camera.right = w / 2;
  camera.top = h / 2; camera.bottom = -h / 2;
  camera.updateProjectionMatrix();
  if (points) points.material.uniforms.uPR.value = Math.min(devicePixelRatio || 1, 2);
}

export function setTechVisible(visible) {
  if (renderer && renderer.domElement) renderer.domElement.style.display = visible ? 'block' : 'none';
}

export function renderTech(now, metrics) {
  if (!renderer) return;
  pulse.blink = lerp(pulse.blink, metrics ? metrics.blink : 0, 0.35);
  pulse.smile = lerp(pulse.smile, metrics ? metrics.smile : 0, 0.35);
  pulse.brow = lerp(pulse.brow, metrics ? metrics.brow : 0, 0.35);
  renderer.render(scene, camera);
  if (points) points.material.uniforms.uTime.value = now / 1000;
}

export function updateTech(lm, metrics, layout, mirror = true, visible = true) {
  if (!renderer || !lm) return;
  for (let i = 0; i < 68; i += 1) {
    const idx = M68[i];
    const x = mirror ? 1 - lm[idx].x : lm[idx].x;
    pointGeo.attributes.position.array[i * 3] = (layout.offX + x * layout.drawW) - innerWidth / 2;
    pointGeo.attributes.position.array[i * 3 + 1] = -(layout.offY + lm[idx].y * layout.drawH) + innerHeight / 2;
    pointGeo.attributes.position.array[i * 3 + 2] = lm[idx].z * 0.02;
  }
  pointGeo.attributes.position.needsUpdate = true;

  const colors = pointGeo.attributes.aColor.array;
  const sizes = pointGeo.attributes.aSize.array;
  for (let i = 0; i < 68; i += 1) {
    const chain = chainOf(i);
    let color = [0.55, 0.85, 1];
    if (chain === 'eyeL' || chain === 'eyeR') color = [1, 0.75, 0.85];
    else if (chain === 'mouthOuter' || chain === 'mouthInner') color = [1, 0.6, 0.9];
    else if (chain === 'browL' || chain === 'browR') color = [0.75, 0.9, 1];
    else if (chain === 'nose' || chain === 'noseL') color = [0.6, 1, 0.85];
    let size = 5;
    if ((chain === 'eyeL' || chain === 'eyeR') && pulse.blink > 0.4) size += pulse.blink * 9;
    if ((chain === 'mouthOuter' || chain === 'mouthInner') && pulse.smile > 0.4) size += pulse.smile * 6;
    if ((chain === 'browL' || chain === 'browR') && pulse.brow > 0.4) size += pulse.brow * 5;
    colors[i * 3] = color[0]; colors[i * 3 + 1] = color[1]; colors[i * 3 + 2] = color[2];
    sizes[i] = size;
  }
  pointGeo.attributes.aColor.needsUpdate = true;
  pointGeo.attributes.aSize.needsUpdate = true;

  for (let i = 0; i < linePairs.length; i += 1) {
    const [a, b] = linePairs[i];
    const ia = M68[a], ib = M68[b];
    const ax = layout.offX + lm[ia].x * layout.drawW, ay = layout.offY + lm[ia].y * layout.drawH;
    const bx = layout.offX + lm[ib].x * layout.drawW, by = layout.offY + lm[ib].y * layout.drawH;
    lineGeo.attributes.position.array[i * 6] = ax - innerWidth / 2;
    lineGeo.attributes.position.array[i * 6 + 1] = -(ay - innerHeight / 2);
    lineGeo.attributes.position.array[i * 6 + 2] = lm[ia].z * 0.02;
    lineGeo.attributes.position.array[i * 6 + 3] = bx - innerWidth / 2;
    lineGeo.attributes.position.array[i * 6 + 4] = -(by - innerHeight / 2);
    lineGeo.attributes.position.array[i * 6 + 5] = lm[ib].z * 0.02;
  }
  lineGeo.attributes.position.needsUpdate = true;

  const noseX = layout.offX + lm[1].x * layout.drawW;
  const noseY = layout.offY + lm[1].y * layout.drawH;
  axes.position.set(noseX - innerWidth / 2, -(noseY - innerHeight / 2), 0);
  if (metrics) axes.rotation.set(-metrics.pose.pitch, metrics.pose.yaw, metrics.pose.roll);
  axes.visible = visible;
}

export function hideTechFaces() {
  if (!pointGeo) return;
  pointGeo.attributes.aSize.array.fill(0);
  pointGeo.attributes.aSize.needsUpdate = true;
  if (axes) axes.visible = false;
}

const $ = (id) => document.getElementById(id);
const EMOJI = { happy: '😁', surprised: '😮', angry: '😠', sad: '😢', wink: '😉', neutral: '😐' };

export function updateHUD(metrics, blinkCount, faces) {
  if (!metrics) return;
  const bar = (id, value) => {
    const el = $(id);
    if (!el) return;
    el.style.width = Math.round(clamp(value, 0, 1) * 100) + '%';
    const label = $('v' + id.slice(1));
    if (label) label.textContent = Math.round(clamp(value, 0, 1) * 100) + '%';
  };
  bar('hudBlink', metrics.blink);
  bar('hudSmile', metrics.smile);
  bar('hudBrow', metrics.brow);
  $('hudBlinkCount').textContent = blinkCount;
  $('hudFaces').textContent = faces;
  $('hudNose').textContent = metrics.mNose.toFixed(2);
  $('hudPose').textContent = Math.round(metrics.pose.yaw * 57.3) + '° / ' + Math.round(metrics.pose.pitch * 57.3) + '° / ' + Math.round(metrics.pose.roll * 57.3) + '°';
  $('hudEmoji').textContent = EMOJI[metrics.emotion] || '😐';
  $('hudEmotion').textContent = metrics.emotion;
  drawPoseWidget(metrics.pose);
}

function drawPoseWidget(pose) {
  const canvas = $('poseWidget');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2 + 6, r = 30;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(138,146,200,.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
  ctx.save();
  ctx.translate(cx + pose.yaw * r * 0.8, cy - pose.pitch * r * 0.8);
  ctx.rotate(pose.roll);
  ctx.strokeStyle = '#3ee6ff'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(0, 0, r * 0.42, r * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ff5f9e';
  ctx.beginPath(); ctx.arc(0, 0, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
