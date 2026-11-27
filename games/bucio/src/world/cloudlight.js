import * as THREE from 'three';

/**
 * Ombre delle nuvole: macchie morbide che scorrono sul paese col vento.
 *
 * Non sono un piano scuro steso sopra il terreno: ogni materiale illuminato
 * (terreno, mare, marciapiedi, oggetti procedurali e kit di Blender) riceve
 * lo stesso rumore in coordinate del mondo e abbassa SOLO la luce diretta
 * del sole. La luce del cielo resta, come sotto una nuvola vera, e una
 * macchia che passa su un palazzo lo scurisce insieme alla strada.
 *
 * Le uniform sono condivise: un solo valore di tempo muove tutto.
 */
export const cloudUniforms = {
  uCloudTime: { value: 0 },
  uCloudStrength: { value: 0 },
  uCloudScale: { value: 0.026 }, // macchie di ~20 m, una ogni ~40
  uCloudWind: { value: new THREE.Vector2(2.1, 0.7) },
};

const PARS = /* glsl */ `
uniform float uCloudTime;
uniform float uCloudStrength;
uniform float uCloudScale;
uniform vec2 uCloudWind;
varying vec3 vCloudW;
float cloudHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float cloudNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(cloudHash(i), cloudHash(i + vec2(1.0, 0.0)), u.x),
             mix(cloudHash(i + vec2(0.0, 1.0)), cloudHash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float cloudShadow(vec2 xz) {
  if (uCloudStrength <= 0.0) return 0.0;
  vec2 p = (xz - uCloudWind * uCloudTime) * uCloudScale;
  float n = cloudNoise(p) * 0.55 + cloudNoise(p * 2.13 + 7.1) * 0.3 + cloudNoise(p * 4.7 - 3.3) * 0.15;
  return smoothstep(0.5, 0.72, n) * uCloudStrength;
}
`;

/** Da chiamare dentro onBeforeCompile di un materiale Lambert/Standard. */
export function patchCloudShader(shader) {
  Object.assign(shader.uniforms, cloudUniforms);
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vCloudW;')
    .replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      vec4 cloudW = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        cloudW = instanceMatrix * cloudW;
      #endif
      vCloudW = (modelMatrix * cloudW).xyz;`
    );
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>\n${PARS}`)
    .replace(
      '#include <lights_fragment_end>',
      '#include <lights_fragment_end>\nreflectedLight.directDiffuse *= 1.0 - cloudShadow(vCloudW.xz);'
    );
}

/** Aggiunge le ombre delle nuvole a un materiale (una volta sola). */
export function withCloudShadows(material) {
  if (material.userData.clouds) return material;
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    prev?.call(material, shader, renderer);
    patchCloudShader(shader);
  };
  const key = material.customProgramCacheKey.bind(material);
  material.customProgramCacheKey = () => `${key()}|clouds`;
  material.userData.clouds = true;
  return material;
}
