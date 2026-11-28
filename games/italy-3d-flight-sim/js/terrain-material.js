/* Italy 3D Flight Sim — ground shader: sea, shallows, foam, beaches, fields and peaks
 *
 * Colours are chosen per pixel from the coastline field, so shores stay sharp
 * however coarse the distant terrain is.
 */

import * as THREE from '../../_vendor/three.module.js';
import { WORLD } from './config.js';
import { coastGrid } from './coast.js';

export const PALETTES = {
  happy: {
    deep: '#1479b8', shallow: '#45d6d0', foam: '#ffffff', wet: '#d8bd7e', sand: '#ffe6a3',
    grass: '#79c955', field: '#c4d665', forest: '#3f9a47', rock: '#a99572', snow: '#ffffff'
  },
  natural: {
    deep: '#134e76', shallow: '#2f9fa8', foam: '#e4f6f6', wet: '#b39d6c', sand: '#dfc98f',
    grass: '#5d8a4a', field: '#98975a', forest: '#33603a', rock: '#7f7260', snow: '#e9eef2'
  },
  map: {
    deep: '#1a6fb0', shallow: '#5cc0e0', foam: '#ffffff', wet: '#cdb477', sand: '#f0d896',
    grass: '#6fa860', field: '#8cb96a', forest: '#4a7b4e', rock: '#8a7a66', snow: '#f2f5f8'
  }
};

function coastTexture() {
  const { cols, rows, distance } = coastGrid();
  const data = new Uint8Array(cols * rows);
  for (let k = 0; k < data.length; k++) data[k] = Math.max(0, Math.min(255, Math.round(distance[k]) + 128));
  const texture = new THREE.DataTexture(data, cols, rows, THREE.RedFormat, THREE.UnsignedByteType);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;
  return texture;
}

const mercator = lat => (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2;

const PARS = `
uniform sampler2D coastMap;
uniform sampler2D imageryMap;
uniform float useImagery;
uniform float seaTime;
uniform vec2 worldSize;
uniform vec2 coastSize;
uniform vec4 geoRange;
uniform vec2 mercRange;
uniform vec3 cDeep, cShallow, cFoam, cWet, cSand, cGrass, cField, cForest, cRock, cSnow;
varying vec3 vWorld;
varying vec3 vSlope;

float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}

vec3 groundColor() {
  vec2 p = vWorld.xz;
  vec2 t = clamp(p / worldSize + 0.5, 0.0, 1.0);
  float shore = texture2D(coastMap, (t * (coastSize - 1.0) + 0.5) / coastSize).r * 255.0 - 128.0;
  shore += (vnoise(p * 0.045) - 0.5) * 9.0 + (vnoise(p * 0.013) - 0.5) * 8.0;
  float h = vWorld.y;

  vec3 satellite = vec3(0.0);
  if (useImagery > 0.5) {
    float lat = geoRange.z + (1.0 - t.y) * (geoRange.w - geoRange.z);
    float rad = radians(lat);
    float merc = (1.0 - log(tan(rad) + 1.0 / cos(rad)) / 3.14159265) * 0.5;
    float v = (merc - mercRange.x) / (mercRange.y - mercRange.x);
    satellite = texture2D(imageryMap, vec2(t.x, 1.0 - v)).rgb;
  }

  if (shore < 0.0) {
    float depth = smoothstep(2.0, 105.0, -shore);
    vec3 water = mix(cShallow, cDeep, depth);
    float swell = vnoise(p * 0.055 + vec2(seaTime * 0.55, seaTime * 0.3)) * vnoise(p * 0.019 - vec2(seaTime * 0.2, seaTime * 0.12));
    float broad = vnoise(p * 0.0035 + vec2(3.7, 1.3));
    water *= 0.9 + swell * 0.28 + broad * 0.1;
    float surf = smoothstep(7.0, 0.0, -shore) * (0.55 + 0.45 * sin(shore * 1.1 + seaTime * 2.4 + vnoise(p * 0.08) * 6.0));
    water = mix(water, cFoam, clamp(surf, 0.0, 1.0));
    if (useImagery > 0.5) water = mix(water, satellite, 0.18 * depth);
    return water;
  }

  /* Patchwork of fields, then woods, bare rock and snow with height. */
  vec2 turned = mat2(0.86, -0.5, 0.5, 0.86) * p;
  vec2 cell = floor(turned / vec2(62.0, 44.0));
  float plot = hash21(cell);
  vec3 ground = mix(cGrass, cField, step(0.62, plot) * (1.0 - smoothstep(6.0, 12.0, h)));
  ground *= 0.9 + 0.2 * hash21(cell + 17.0);
  float woods = smoothstep(0.52, 0.68, vnoise(p * 0.011) * 0.7 + vnoise(p * 0.05) * 0.3 + smoothstep(5.0, 18.0, h) * 0.24);
  ground = mix(ground, cForest, woods);
  float rough = vnoise(p * 0.03);
  ground = mix(ground, cRock, smoothstep(23.0, 36.0, h + rough * 7.0));
  float crag = vnoise(p * 0.085) - 0.5;
  ground = mix(ground, cSnow, smoothstep(44.0, 49.0, h + (rough - 0.5) * 9.0 + crag * 7.0));
  ground *= 0.93 + 0.14 * vnoise(p * 0.14);
  if (useImagery > 0.5) ground = satellite;

  /* Beach: wet at the water's edge, dry above, breaking up into the vegetation. */
  float width = 24.0 + vnoise(p * 0.006) * 22.0;
  float sandiness = 1.0 - smoothstep(width - 5.0, width + 4.0, shore + (vnoise(p * 0.11) - 0.5) * 6.0);
  sandiness *= 1.0 - smoothstep(12.0, 18.0, h);
  vec3 sand = mix(cWet, cSand, smoothstep(2.0, 9.0, shore)) * (0.94 + 0.12 * vnoise(p * 0.35));
  ground = mix(ground, sand, sandiness);

  /* The relief is gentle, so it is shaded a little more strongly than the sun alone would. */
  ground *= clamp(1.0 + (vSlope.x * 1.1 - vSlope.z * 0.8) * 4.5, 0.6, 1.28);
  return ground;
}
`;

export function createTerrainMaterial() {
  const { cols, rows } = coastGrid();
  const uniforms = {
    coastMap: { value: coastTexture() },
    imageryMap: { value: null },
    useImagery: { value: 0 },
    seaTime: { value: 0 },
    worldSize: { value: new THREE.Vector2(WORLD.width, WORLD.depth) },
    coastSize: { value: new THREE.Vector2(cols, rows) },
    geoRange: { value: new THREE.Vector4(WORLD.minLon, WORLD.maxLon, WORLD.minLat, WORLD.maxLat) },
    mercRange: { value: new THREE.Vector2(mercator(WORLD.maxLat), mercator(WORLD.minLat)) }
  };
  const colorKey = name => 'c' + name[0].toUpperCase() + name.slice(1);
  for (const [name, value] of Object.entries(PALETTES.happy)) uniforms[colorKey(name)] = { value: new THREE.Color(value) };

  const material = new THREE.MeshStandardMaterial({ roughness: 0.96, metalness: 0 });
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWorld;\nvarying vec3 vSlope;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvSlope = objectNormal;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${PARS}`)
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = groundColor();');
  };
  material.customProgramCacheKey = () => 'italy-ground';

  return {
    material,
    uniforms,
    setPalette(name) {
      for (const [key, value] of Object.entries(PALETTES[name] || PALETTES.happy)) uniforms[colorKey(key)].value.set(value);
    },
    setImagery(texture) {
      uniforms.imageryMap.value = texture;
      uniforms.useImagery.value = texture ? 1 : 0;
    }
  };
}
