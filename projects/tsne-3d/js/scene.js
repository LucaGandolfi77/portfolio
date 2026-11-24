/* T-SNE 3D — Three.js scene, shaders, views and interaction helpers */
import * as THREE from '../vendor/three.module.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { PALETTE } from './config.js';

const VERT = `
attribute float aSize; attribute vec3 aColor; attribute float aDim;
varying vec3 vColor; varying float vDim;
void main(){
  vColor=aColor; vDim=aDim;
  vec4 mv=modelViewMatrix*vec4(position,1.0);
  gl_PointSize=aSize*(300.0/-mv.z);
  gl_Position=projectionMatrix*mv;
}`;
const FRAG = `
varying vec3 vColor; varying float vDim;
void main(){
  vec2 c=gl_PointCoord-0.5;
  float d=length(c);
  if(d>0.5) discard;
  float a=smoothstep(0.5,0.0,d);
  float core=smoothstep(0.18,0.0,d);
  vec3 col=mix(vColor,vec3(1.0),core*0.75);
  gl_FragColor=vec4(col,a*(1.0-vDim*0.78));
}`;

export function hexRGB(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

export class Scene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#05070f');
    this.scene.fog = new THREE.FogExp2('#05070f', 0.045);
    this.camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
    this.camera.position.set(0, 1.2, 7);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.autoRotateSpeed = 0.6;
    this.points = null;
    this.ghost = null;
    this.stars = null;
    this.nebula = [];
    this.wires = [];
    this.group = new THREE.Group();
    this.scene.add(this.group);
    addEventListener('resize', () => this.resize());
  }
  resize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  }
  buildStars(n = 700) {
    if (this.stars) this.scene.remove(this.stars);
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 18 + Math.random() * 30, a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(b) * Math.cos(a);
      pos[i * 3 + 1] = r * Math.cos(b);
      pos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xa8c8ff, size: 0.06, transparent: true, opacity: 0.75 }));
    this.scene.add(this.stars);
  }
  makeMaterial() {
    return new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
  }
  buildPoints(Y, N, labels, focused = -1) {
    if (this.points) { this.group.remove(this.points); this.points.geometry.dispose(); }
    const g = new THREE.BufferGeometry();
    const col = new Float32Array(N * 3), size = new Float32Array(N), dim = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const rgb = hexRGB(PALETTE[(labels?.[i] || 0) % PALETTE.length]);
      col.set(rgb, i * 3);
      size[i] = 8 + (i % 7 === 0 ? 6 : 0);
      dim[i] = focused >= 0 && labels && labels[i] !== focused ? 0.8 : 0;
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(Y), 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aDim', new THREE.BufferAttribute(dim, 1));
    this.points = new THREE.Points(g, this.makeMaterial());
    this.group.add(this.points);
  }
  updatePositions(Y) {
    if (!this.points) return;
    const a = this.points.geometry.getAttribute('position');
    a.array.set(Y); a.needsUpdate = true;
    this.points.geometry.computeBoundingSphere();
  }
  buildGhost(Y, N) {
    if (this.ghost) { this.group.remove(this.ghost); this.ghost.geometry.dispose(); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(Y), 3));
    const c = new Float32Array(N * 3).fill(0.35);
    const s = new Float32Array(N).fill(5), d = new Float32Array(N).fill(0.6);
    g.setAttribute('aColor', new THREE.BufferAttribute(c, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(s, 1));
    g.setAttribute('aDim', new THREE.BufferAttribute(d, 1));
    this.ghost = new THREE.Points(g, this.makeMaterial());
    this.group.add(this.ghost);
  }
  setView(mode) {
    this.group.rotation.set(0, 0, 0);
    this.group.scale.setScalar(1);
    if (mode === 'planet') this.group.scale.setScalar(0.8);
    if (mode === 'plane') this.group.rotation.x = -Math.PI / 2;
    if (mode === 'map') this.group.rotation.x = -Math.PI / 2 + 0.01;
  }
  flyTo(x, y, z, duration = 800) {
    const from = this.controls.target.clone();
    const to = new THREE.Vector3(x, y, z);
    const t0 = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      this.controls.target.lerpVectors(from, to, e);
      this.camera.position.lerp(new THREE.Vector3(to.x + 1.5, to.y + 1, to.z + 3.5), e * 0.06);
      if (t < 1) requestAnimationFrame(step);
    };
    step();
  }
  resetCamera() {
    this.camera.position.set(0, 1.2, 7);
    this.controls.target.set(0, 0, 0);
  }
  render() { this.controls.update(); this.renderer.render(this.scene, this.camera); }
  project(x, y, z) {
    const v = new THREE.Vector3(x, y, z);
    this.group.localToWorld(v);
    v.project(this.camera);
    return { x: (v.x + 1) / 2 * innerWidth, y: (-v.y + 1) / 2 * innerHeight };
  }
  pick(px, py, Y, N, threshold = 18) {
    let best = -1, bd = threshold * threshold;
    for (let i = 0; i < N; i++) {
      const p = this.project(Y[i * 3], Y[i * 3 + 1], Y[i * 3 + 2]);
      const dx = p.x - px, dy = p.y - py, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
}
