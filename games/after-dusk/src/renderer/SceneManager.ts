import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { CONFIG } from '../game/GameConfig';
import type { Quality } from '../data/types';

const HorrorPostShader = {
  uniforms: {
    tDiffuse: { value: null },
    uPanic: { value: 0 },
    uProximity: { value: 0 },
    uTime: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uPanic;
    uniform float uProximity;
    uniform float uTime;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      float ca = uProximity * 0.0045 + uPanic * 0.0015;
      float r = texture2D(tDiffuse, uv + vec2(ca, 0.0)).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - vec2(ca, 0.0)).b;
      vec3 col = vec3(r, g, b);

      // Subtle nocturnal film grain
      float grain = (rand(uv + fract(uTime)) - 0.5) * (0.025 + uPanic * 0.03);
      col += grain;

      // Panic + proximity radial vignette
      float d = distance(uv, vec2(0.5));
      float vig = smoothstep(0.75 - uPanic * 0.28, 0.25, d);
      col *= mix(0.28, 1.0, vig);

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export class SceneManager {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private horrorPass: ShaderPass;
  private quality: Quality = 'high';
  private baseDpr = 1.4;

  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    const q = CONFIG.quality[this.quality];
    this.baseDpr = Math.min(window.devicePixelRatio, q.pixelRatio);
    this.renderer.setPixelRatio(this.baseDpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = q.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.22;
    container.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color(0x05070c);
    this.scene.fog = new THREE.FogExp2(0x080b12, 0.018);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.06, 130);
    this.camera.rotation.order = 'YXZ';
    this.camera.position.set(0, CONFIG.eyeHeight, 0);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.44,
      0.38,
      0.84
    );
    this.composer.addPass(this.bloomPass);
    this.horrorPass = new ShaderPass(HorrorPostShader);
    this.composer.addPass(this.horrorPass);

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 250));
  }

  setAtmosphere(sky: number, fog: number) {
    (this.scene.background as THREE.Color).setHex(sky);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(fog);
      this.scene.fog.density = 0.018;
    }
  }

  setQuality(q: Quality) {
    this.quality = q;
    const c = CONFIG.quality[q];
    this.baseDpr = Math.min(window.devicePixelRatio, c.pixelRatio);
    this.renderer.setPixelRatio(this.baseDpr);
    this.renderer.shadowMap.enabled = c.shadows;
    this.bloomPass.enabled = c.postFx;
    this.horrorPass.enabled = c.postFx;
    if (this.scene.fog instanceof THREE.FogExp2) this.scene.fog.density = 0.032 - (c.fogFar / 2500);
    this.resize();
  }

  /** Adaptive FPS governor hook to trim DPR slightly if frame rate dips. */
  scaleResolution(factor: number) {
    const dpr = Math.max(0.7, this.baseDpr * factor);
    this.renderer.setPixelRatio(dpr);
    this.composer.setPixelRatio(dpr);
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  }

  render(time = 0, panic01 = 0, proximity = 0) {
    if (CONFIG.quality[this.quality].postFx) {
      this.horrorPass.uniforms.uTime.value = time;
      this.horrorPass.uniforms.uPanic.value = panic01;
      this.horrorPass.uniforms.uProximity.value = proximity;
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  get shadowSize() { return CONFIG.quality[this.quality].shadowSize; }
  get maxLights() { return CONFIG.quality[this.quality].lights; }
  get drawCalls() { return this.renderer.info.render.calls; }
}
