import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/*
 * Ultra preset (desktop): bloom on the bright things (lit windows, lamps,
 * headlights, fire) and a colour grade of our own — a slightly washed-out
 * Po valley haze: lifted blacks, a little less saturation, warm highlights
 * and cool shadows, a vignette and fine grain. Loaded on demand, so phones
 * never download it.
 */

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    time: { value: 0 },
    saturation: { value: 0.86 },
    contrast: { value: 1.08 },
    lift: { value: 0.018 },
    warm: { value: new THREE.Vector3(1.04, 1.0, 0.94) },
    cool: { value: new THREE.Vector3(0.94, 0.99, 1.06) },
    vignette: { value: 0.34 },
    grain: { value: 0.03 },
    wet: { value: 0 }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float time, saturation, contrast, lift, vignette, grain, wet;
    uniform vec3 warm, cool;
    varying vec2 vUv;
    float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 col = c.rgb;
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      /* Split toning: cool shadows, warm highlights. */
      col *= mix(cool, warm, smoothstep(0.08, 0.7, l));
      col = mix(vec3(l), col, saturation - wet * 0.12);
      col = (col - 0.18) * contrast + 0.18;
      col = col * (1.0 - lift) + lift;
      vec2 d = vUv - 0.5;
      col *= 1.0 - vignette * smoothstep(0.25, 0.85, length(d) * 1.35);
      col += (rand(vUv * 917.0 + time) - 0.5) * grain;
      gl_FragColor = vec4(max(col, 0.0), c.a);
    }`
};

export class PostFx {
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private grade: ShaderPass;
  private t = 0;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    const size = renderer.getSize(new THREE.Vector2());
    const target = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(renderer, target);
    this.composer.addPass(new RenderPass(scene, camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.4, 0.45, 0.9);
    this.composer.addPass(this.bloom);
    this.grade = new ShaderPass(GradeShader);
    this.composer.addPass(this.grade);
    this.composer.addPass(new OutputPass());
  }

  setSize(w: number, h: number, pixelRatio: number): void {
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(w, h);
  }

  /** night 0..1 drives the bloom; wet greys the image a touch. */
  render(dt: number, night: number, wet: number): void {
    this.t += dt;
    this.bloom.strength = 0.16 + night * 0.34;
    this.bloom.threshold = 0.94 - night * 0.16;
    this.grade.uniforms.time.value = this.t % 100;
    this.grade.uniforms.wet.value = wet;
    this.composer.render(dt);
  }

  dispose(): void {
    this.composer.dispose();
  }
}
