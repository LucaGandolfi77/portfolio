import * as THREE from 'three';

/*
 * Sky, sun, moon, stars, fog and light for a 24-hour cycle. Colours are keyed
 * at a few hours and blended; `night` (0..1) drives lit windows, street
 * lamps and headlights.
 */

interface Key {
  h: number;
  top: number;
  horizon: number;
  fog: number;
  sun: number;
  sunI: number;
  hemiSky: number;
  hemiGround: number;
  hemiI: number;
  night: number;
}

const KEYS: Key[] = [
  { h: 0, top: 0x060a1c, horizon: 0x1c2240, fog: 0x161a30, sun: 0x6f7fb0, sunI: 0.35, hemiSky: 0x5a6a9a, hemiGround: 0x2c2630, hemiI: 1.0, night: 1 },
  { h: 5, top: 0x0d1430, horizon: 0x3c3350, fog: 0x2c2a40, sun: 0x8a8ab8, sunI: 0.35, hemiSky: 0x5c6890, hemiGround: 0x2e2a32, hemiI: 1.0, night: 0.9 },
  { h: 6.5, top: 0x4a6aa0, horizon: 0xf0a070, fog: 0xd8a07c, sun: 0xffb27a, sunI: 1.4, hemiSky: 0xffc8a0, hemiGround: 0x5a4a40, hemiI: 1.0, night: 0.35 },
  { h: 9, top: 0x5f9ad8, horizon: 0xd8e2e4, fog: 0xc9d2cf, sun: 0xfff2dc, sunI: 2.6, hemiSky: 0xdde8f0, hemiGround: 0x7a6a52, hemiI: 1.3, night: 0 },
  { h: 15, top: 0x5a92d0, horizon: 0xe4dcc8, fog: 0xd6ccb4, sun: 0xfff0d6, sunI: 2.8, hemiSky: 0xf0e8d8, hemiGround: 0x7d6a50, hemiI: 1.3, night: 0 },
  /* Late afternoon smog: the warm orange haze over the plain. */
  { h: 18.5, top: 0x7a86b0, horizon: 0xf2a85c, fog: 0xe0a066, sun: 0xffa45a, sunI: 2.2, hemiSky: 0xffc88e, hemiGround: 0x6a5240, hemiI: 1.15, night: 0.1 },
  { h: 20, top: 0x2c2c5a, horizon: 0xc0605a, fog: 0x7a4c58, sun: 0xff7a50, sunI: 0.8, hemiSky: 0x9a7a9a, hemiGround: 0x3a3038, hemiI: 1.1, night: 0.7 },
  { h: 21.5, top: 0x0a0e24, horizon: 0x2a2646, fog: 0x1e1c34, sun: 0x7080b0, sunI: 0.4, hemiSky: 0x5a6a9a, hemiGround: 0x2c2630, hemiI: 1.0, night: 1 },
  { h: 24, top: 0x060a1c, horizon: 0x1c2240, fog: 0x161a30, sun: 0x6f7fb0, sunI: 0.35, hemiSky: 0x5a6a9a, hemiGround: 0x2c2630, hemiI: 1.0, night: 1 }
];

const ca = new THREE.Color();
const cb = new THREE.Color();
function mix(a: number, b: number, t: number, out: THREE.Color): THREE.Color {
  return out.copy(ca.set(a)).lerp(cb.set(b), t);
}

export interface Environment {
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  night: number;
  /** Current sky colours (for the wet-street reflections). */
  skyTop: THREE.Color;
  skyHorizon: THREE.Color;
  /** cloud 0..1 dims the sun; fog 0..1 pulls the fog in and greys it. */
  update(hours: number, centre: THREE.Vector3, weather?: { cloud: number; fog: number }): void;
}

export function createEnvironment(scene: THREE.Scene, farDistance: number): Environment {
  const uniforms = {
    top: { value: new THREE.Color() },
    horizon: { value: new THREE.Color() },
    sunDir: { value: new THREE.Vector3(0, 1, 0) },
    sunColor: { value: new THREE.Color() },
    night: { value: 0 }
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(farDistance * 0.95, 24, 12),
    new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 top; uniform vec3 horizon; uniform vec3 sunDir; uniform vec3 sunColor; uniform float night;
        varying vec3 vDir;
        float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }
        void main(){
          float h = clamp(vDir.y, -0.2, 1.0);
          vec3 col = mix(horizon, top, pow(max(h, 0.0), 0.55));
          float d = max(dot(vDir, sunDir), 0.0);
          col += sunColor * (pow(d, 400.0) * 1.6 + pow(d, 12.0) * 0.25);
          vec3 cell = floor(vDir * 220.0);
          float star = step(0.9965, hash(cell)) * smoothstep(0.05, 0.4, h) * smoothstep(0.55, 1.0, night);
          col += vec3(star);
          gl_FragColor = vec4(col, 1.0);
        }`
    })
  );
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);

  const moon = new THREE.Mesh(new THREE.CircleGeometry(14, 16), new THREE.MeshBasicMaterial({ color: 0xe8e6d8, fog: false, transparent: true }));
  moon.frustumCulled = false;
  scene.add(moon);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(sun);
  scene.add(sun.target);
  scene.fog = new THREE.Fog(0xffffff, farDistance * 0.35, farDistance * 0.92);

  const env: Environment = {
    sun,
    hemi,
    night: 0,
    skyTop: uniforms.top.value,
    skyHorizon: uniforms.horizon.value,
    update(hours: number, centre: THREE.Vector3, weather = { cloud: 0, fog: 0 }) {
      const h = ((hours % 24) + 24) % 24;
      let i = 0;
      while (i < KEYS.length - 2 && KEYS[i + 1].h <= h) i++;
      const a = KEYS[i];
      const b = KEYS[i + 1];
      const t = (h - a.h) / (b.h - a.h || 1);
      mix(a.top, b.top, t, uniforms.top.value);
      mix(a.horizon, b.horizon, t, uniforms.horizon.value);
      const fog = scene.fog as THREE.Fog;
      mix(a.fog, b.fog, t, fog.color);
      mix(a.sun, b.sun, t, sun.color);
      mix(a.sun, b.sun, t, uniforms.sunColor.value);
      sun.intensity = THREE.MathUtils.lerp(a.sunI, b.sunI, t);
      mix(a.hemiSky, b.hemiSky, t, hemi.color);
      mix(a.hemiGround, b.hemiGround, t, hemi.groundColor);
      hemi.intensity = THREE.MathUtils.lerp(a.hemiI, b.hemiI, t);
      env.night = THREE.MathUtils.lerp(a.night, b.night, t);
      /* Weather: overcast skies flatten the light; fog greys and closes in. */
      const grey = new THREE.Color(0x8a8c90).multiplyScalar(1 - env.night * 0.75);
      const cloud = weather.cloud;
      sun.intensity *= 1 - cloud * 0.75;
      hemi.intensity *= 1 - cloud * 0.25;
      uniforms.top.value.lerp(grey, cloud * 0.75);
      uniforms.horizon.value.lerp(grey, cloud * 0.6);
      uniforms.sunColor.value.multiplyScalar(1 - cloud);
      fog.color.lerp(grey, Math.max(cloud * 0.5, weather.fog * 0.85));
      fog.near = farDistance * (0.35 - weather.fog * 0.34);
      fog.far = farDistance * (0.92 - weather.fog * 0.78);
      if (cloud > 0.5) env.night = Math.max(env.night, (cloud - 0.5) * 0.6);
      uniforms.night.value = env.night;
      /* Sun arc: rises east (+x) at 6, sets west at 20. */
      const day = (h - 6) / 14;
      const angle = day * Math.PI;
      const dir = new THREE.Vector3(Math.cos(angle), Math.sin(angle) * 0.85 + 0.05, 0.35).normalize();
      const light = dir.y > 0 ? dir : new THREE.Vector3(-dir.x, 0.6, -0.3).normalize();
      uniforms.sunDir.value.copy(dir);
      sun.position.copy(centre).addScaledVector(light, 200);
      sun.target.position.copy(centre);
      sky.position.copy(centre);
      const moonDir = new THREE.Vector3(-dir.x, Math.abs(dir.y) * 0.8 + 0.25, -0.4).normalize();
      moon.position.copy(centre).addScaledVector(moonDir, farDistance * 0.85);
      moon.lookAt(centre);
      (moon.material as THREE.MeshBasicMaterial).opacity = env.night;
    }
  };
  return env;
}
