import * as THREE from 'three';

const VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform float uStars;
uniform float uTime;
varying vec3 vDir;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  float h = clamp(vDir.y, 0.0, 1.0);
  vec3 col = mix(uHorizon, uZenith, pow(h, 0.52));

  // Soft moon disc
  vec3 moonDir = normalize(vec3(-0.42, 0.56, -0.71));
  float mDot = dot(normalize(vDir), moonDir);
  float moon = smoothstep(0.9975, 0.9988, mDot);
  float halo = pow(max(0.0, mDot), 28.0) * 0.25;
  col += vec3(0.84, 0.9, 1.0) * (moon * 0.95 + halo) * uStars;

  // Procedural twinkling stars
  if (h > 0.08 && uStars > 0.05) {
    vec3 cell = floor(vDir * 140.0);
    float n = hash(cell);
    if (n > 0.992) {
      float tw = 0.65 + 0.35 * sin(uTime * 2.2 + n * 80.0);
      col += vec3(0.85, 0.9, 1.0) * tw * uStars * smoothstep(0.08, 0.35, h);
    }
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

/** Procedural GLSL sky dome transitioning smoothly from 19:30 Dusk -> Night -> 06:00 Dawn. */
export class SkyDome {
  readonly mesh: THREE.Mesh;
  private mat: THREE.ShaderMaterial;

  constructor(scene: THREE.Scene) {
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uZenith: { value: new THREE.Color(0x0b1020) },
        uHorizon: { value: new THREE.Color(0x141d30) },
        uStars: { value: 0.7 },
        uTime: { value: 0 },
      },
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(95, 24, 16), this.mat);
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }

  update(time: number, hour: number, cameraPos: THREE.Vector3) {
    this.mesh.position.copy(cameraPos);
    this.mat.uniforms.uTime.value = time;

    // Normalize hour into 19.5 .. 30.0
    const h = hour < 12 ? hour + 24 : hour;
    const z = this.mat.uniforms.uZenith.value as THREE.Color;
    const hor = this.mat.uniforms.uHorizon.value as THREE.Color;

    if (h < 21.0) {
      // Dusk 19:30 -> 21:00
      const t = Math.max(0, Math.min(1, (h - 19.5) / 1.5));
      z.setHex(0x1e2544).lerp(new THREE.Color(0x05070e), t);
      hor.setHex(0xd97d54).lerp(new THREE.Color(0x0e1628), t);
      this.mat.uniforms.uStars.value = 0.15 + t * 0.85;
    } else if (h < 28.5) {
      // Deep Night 21:00 -> 04:30
      z.setHex(0x05070e);
      hor.setHex(0x0d1526);
      this.mat.uniforms.uStars.value = 1.0;
    } else {
      // Dawn 04:30 -> 06:00
      const t = Math.max(0, Math.min(1, (h - 28.5) / 1.5));
      z.setHex(0x05070e).lerp(new THREE.Color(0x2c3f6b), t);
      hor.setHex(0x0d1526).lerp(new THREE.Color(0xe6a17c), t);
      this.mat.uniforms.uStars.value = 1.0 - t * 0.85;
    }
  }
}
