/* RAVE — sorgenti GLSL (modulo ES) */

export const VERT_SRC = `
attribute vec2 a_pos;
attribute vec2 a_uv;
varying vec2 v_uv;
void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const HEAD = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform float u_intensity;
uniform float u_time;
uniform vec2 u_resolution;
`;

const FRAG_NONE = HEAD + `
void main() { gl_FragColor = texture2D(u_tex, v_uv); }`;

const FRAG_VANGOGH = HEAD + `
vec2 swirl(vec2 uv, vec2 center, float radius, float strength) {
  vec2 d = uv - center;
  float dist = length(d);
  float angle = dist / radius * strength;
  float s = sin(angle), c = cos(angle);
  return center + vec2(d.x * c - d.y * s, d.x * s + d.y * c);
}
void main() {
  vec2 center = vec2(0.5 + 0.15 * sin(u_time * 0.3), 0.5 + 0.15 * cos(u_time * 0.4));
  vec2 uv = swirl(v_uv, center, 0.4, 2.5);
  vec4 orig = texture2D(u_tex, v_uv);
  vec4 col = texture2D(u_tex, uv);
  float gray = dot(col.rgb, vec3(0.299, 0.587, 0.114));
  vec3 sat = mix(vec3(gray), col.rgb, 1.4);
  sat *= vec3(1.15, 1.05, 0.85);
  float vig = 1.0 - 0.3 * length(v_uv - 0.5);
  gl_FragColor = vec4(mix(orig.rgb, sat * vig, u_intensity), 1.0);
}`;

const FRAG_PICASSO = HEAD + `
float quantize(float v, float levels) { return floor(v * levels) / levels; }
void main() {
  vec2 uv = v_uv;
  float tileX = 8.0 + 4.0 * sin(u_time * 0.2);
  float tileY = 6.0 + 3.0 * cos(u_time * 0.25);
  vec2 tile = floor(uv * vec2(tileX, tileY));
  float offset = mod(tile.x + tile.y, 2.0);
  vec4 orig = texture2D(u_tex, uv);
  vec4 col = texture2D(u_tex, uv + (offset - 0.5) * 0.02);
  float q = 6.0 - 2.0 * sin(u_time * 0.15);
  col.rgb = vec3(quantize(col.r, q), quantize(col.g, q), quantize(col.b, q));
  col.rgb += length(col.rgb - orig.rgb) * 2.0;
  col.r *= 1.1; col.b *= 0.9;
  gl_FragColor = vec4(mix(orig.rgb, col.rgb, u_intensity), 1.0);
}`;

const FRAG_MONET = HEAD + `
vec4 blur9(sampler2D tex, vec2 uv, vec2 res) {
  vec2 texel = 1.0 / res;
  vec4 sum = vec4(0.0);
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      sum += texture2D(tex, uv + vec2(float(x), float(y)) * texel * 1.5);
    }
  }
  return sum / 9.0;
}
void main() {
  vec4 orig = texture2D(u_tex, v_uv);
  vec4 blurred = blur9(u_tex, v_uv, u_resolution);
  vec3 pastel = blurred.rgb;
  float lum = dot(pastel, vec3(0.299, 0.587, 0.114));
  pastel = mix(pastel, vec3(lum), 0.25);
  pastel *= vec3(1.05, 1.02, 1.15);
  pastel = mix(vec3(lum), pastel, 0.6);
  pastel *= 0.8 + 0.2 * sin(u_time * 0.5);
  gl_FragColor = vec4(mix(orig.rgb, pastel, u_intensity), 1.0);
}`;

const FRAG_HOKUSAI = HEAD + `
float luminance(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
void main() {
  vec2 uv = v_uv;
  vec2 texel = 1.0 / u_resolution;
  vec4 orig = texture2D(u_tex, uv);
  float tl = luminance(texture2D(u_tex, uv + texel * vec2(-1.0, -1.0)).rgb);
  float t  = luminance(texture2D(u_tex, uv + texel * vec2( 0.0, -1.0)).rgb);
  float tr = luminance(texture2D(u_tex, uv + texel * vec2( 1.0, -1.0)).rgb);
  float l  = luminance(texture2D(u_tex, uv + texel * vec2(-1.0,  0.0)).rgb);
  float r  = luminance(texture2D(u_tex, uv + texel * vec2( 1.0,  0.0)).rgb);
  float bl = luminance(texture2D(u_tex, uv + texel * vec2(-1.0,  1.0)).rgb);
  float b  = luminance(texture2D(u_tex, uv + texel * vec2( 0.0,  1.0)).rgb);
  float br = luminance(texture2D(u_tex, uv + texel * vec2( 1.0,  1.0)).rgb);
  float gx = -tl - 2.0 * l - bl + tr + 2.0 * r + br;
  float gy = -tl - 2.0 * t - tr + bl + 2.0 * b + br;
  float edge = sqrt(gx * gx + gy * gy);
  float lum = luminance(orig.rgb);
  vec3 mapped = mix(vec3(0.15, 0.35, 0.65), vec3(0.85, 0.9, 0.95), lum);
  mapped = mix(mapped, vec3(0.02, 0.05, 0.12), smoothstep(0.3, 0.8, edge));
  mapped = pow(mapped, vec3(0.85));
  mapped += (0.5 + 0.5 * sin(uv.y * 20.0 + u_time * 2.0)) * 0.03;
  gl_FragColor = vec4(mix(orig.rgb, mapped, u_intensity), 1.0);
}`;

const FRAG_WARHOL = HEAD + `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec4 orig = texture2D(u_tex, v_uv);
  float lum = dot(orig.rgb, vec3(0.299, 0.587, 0.114));
  float steps = 4.0;
  float q = floor(lum * steps) / (steps - 1.0);
  vec3 poster = q < 0.34 ? vec3(0.05, 0.12, 0.28)
              : q < 0.67 ? vec3(0.96, 0.25, 0.55)
              : q < 1.0  ? vec3(1.0, 0.82, 0.1) : vec3(0.1, 0.85, 0.85);
  vec2 cell = floor(gl_FragCoord.xy / 9.0);
  float dotMask = step(0.55, fract(hash(cell) + u_time * 0.05));
  poster = mix(poster * 0.82, poster, dotMask);
  gl_FragColor = vec4(mix(orig.rgb, poster, u_intensity), 1.0);
}`;

const FRAG_KLIMT = HEAD + `
float hash(vec2 p) { return fract(sin(dot(p, vec2(41.7, 289.3))) * 43758.5453); }
void main() {
  vec2 tiles = floor(v_uv * vec2(48.0, 32.0));
  vec2 sampleUv = (tiles + 0.5) / vec2(48.0, 32.0);
  vec4 orig = texture2D(u_tex, v_uv);
  vec4 cell = texture2D(u_tex, sampleUv);
  float lum = dot(cell.rgb, vec3(0.299, 0.587, 0.114));
  float shimmer = 0.5 + 0.5 * sin(u_time * 1.5 + hash(tiles) * 6.28);
  vec3 gold = mix(vec3(0.36, 0.22, 0.03), vec3(1.0, 0.85, 0.28), lum);
  gold += shimmer * 0.12 * vec3(1.0, 0.8, 0.35);
  float rim = step(0.86, fract(hash(tiles) * 7.0));
  gold = mix(gold, vec3(0.95, 0.75, 0.3), rim * 0.4);
  gl_FragColor = vec4(mix(orig.rgb, gold, u_intensity), 1.0);
}`;

const FRAG_MATISSE = HEAD + `
void main() {
  vec2 blocks = floor(v_uv * vec2(9.0, 13.0)) / vec2(9.0, 13.0);
  vec4 orig = texture2D(u_tex, v_uv);
  vec4 flat = texture2D(u_tex, blocks + 0.05);
  float lum = dot(flat.rgb, vec3(0.299, 0.587, 0.114));
  vec3 cut = lum > 0.66 ? vec3(0.98, 0.94, 0.86)
           : lum > 0.4  ? vec3(0.14, 0.55, 0.78)
           : lum > 0.2  ? vec3(0.92, 0.25, 0.2) : vec3(0.08, 0.12, 0.2);
  vec2 local = fract(v_uv * vec2(9.0, 13.0));
  float border = step(0.94, max(local.x, local.y));
  cut = mix(cut, vec3(0.05), border * 0.5);
  gl_FragColor = vec4(mix(orig.rgb, cut, u_intensity), 1.0);
}`;

const FRAG_SKETCH = HEAD + `
float lum(vec2 uv) { return dot(texture2D(u_tex, uv).rgb, vec3(0.299, 0.587, 0.114)); }
void main() {
  vec2 texel = 1.0 / u_resolution;
  float gx = -lum(v_uv + texel * vec2(-1.0, -1.0)) - 2.0 * lum(v_uv + texel * vec2(-1.0, 0.0))
             - lum(v_uv + texel * vec2(-1.0, 1.0)) + lum(v_uv + texel * vec2(1.0, -1.0))
             + 2.0 * lum(v_uv + texel * vec2(1.0, 0.0)) + lum(v_uv + texel * vec2(1.0, 1.0));
  float gy = -lum(v_uv + texel * vec2(-1.0, -1.0)) - 2.0 * lum(v_uv + texel * vec2(0.0, -1.0))
             - lum(v_uv + texel * vec2(1.0, -1.0)) + lum(v_uv + texel * vec2(-1.0, 1.0))
             + 2.0 * lum(v_uv + texel * vec2(0.0, 1.0)) + lum(v_uv + texel * vec2(1.0, 1.0));
  float edge = clamp(sqrt(gx * gx + gy * gy), 0.0, 1.0);
  float hatch = 0.5 + 0.5 * sin((v_uv.x + v_uv.y) * 420.0);
  float paper = 0.96 - edge * 0.75 + hatch * edge * 0.18;
  vec4 orig = texture2D(u_tex, v_uv);
  gl_FragColor = vec4(mix(orig.rgb, vec3(paper), u_intensity), 1.0);
}`;

const FRAG_CYBER = HEAD + `
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 shift = vec2(0.006 + 0.004 * sin(u_time * 2.0), 0.0);
  vec4 orig = texture2D(u_tex, v_uv);
  float r = texture2D(u_tex, v_uv + shift).r;
  float g = orig.g;
  float b = texture2D(u_tex, v_uv - shift).b;
  vec3 col = vec3(r, g, b);
  col = mix(col, vec3(dot(col, vec3(0.3, 0.59, 0.11))) * vec3(0.4, 0.9, 1.2), 0.35);
  float scan = 0.82 + 0.18 * sin(v_uv.y * u_resolution.y * 0.35 + u_time * 6.0);
  float glitch = step(0.985, hash(vec2(floor(v_uv.y * 40.0), floor(u_time * 8.0))));
  col += glitch * vec3(0.9, 0.1, 0.6) * 0.3;
  col *= scan;
  gl_FragColor = vec4(mix(orig.rgb, col, u_intensity), 1.0);
}`;

const FRAG_WATERCOLOR = HEAD + `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec4 softBlur(vec2 uv) {
  vec2 texel = 1.5 / u_resolution;
  vec4 sum = vec4(0.0);
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      sum += texture2D(u_tex, uv + vec2(float(x), float(y)) * texel);
    }
  }
  return sum / 9.0;
}
void main() {
  vec4 orig = texture2D(u_tex, v_uv);
  vec4 wash = softBlur(v_uv + vec2(sin(u_time * 0.3) * 0.002, 0.0));
  float grain = hash(floor(v_uv * u_resolution / 3.0));
  vec3 col = wash.rgb * 1.06;
  col = mix(col, vec3(0.96, 0.94, 0.88), 0.12 + grain * 0.05);
  col = mix(vec3(dot(col, vec3(0.3, 0.59, 0.11))), col, 0.72);
  gl_FragColor = vec4(mix(orig.rgb, col, u_intensity), 1.0);
}`;

export const SHADERS = {
  none: FRAG_NONE,
  vangogh: FRAG_VANGOGH,
  picasso: FRAG_PICASSO,
  monet: FRAG_MONET,
  hokusai: FRAG_HOKUSAI,
  warhol: FRAG_WARHOL,
  klimt: FRAG_KLIMT,
  matisse: FRAG_MATISSE,
  sketch: FRAG_SKETCH,
  cyber: FRAG_CYBER,
  watercolor: FRAG_WATERCOLOR
};

export const MIX_FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texA;
uniform sampler2D u_texB;
uniform float u_mix;
void main() {
  gl_FragColor = mix(texture2D(u_texA, v_uv), texture2D(u_texB, v_uv), u_mix);
}`;

export const COMPOSITE_FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_styled;
uniform sampler2D u_original;
uniform float u_split;
void main() {
  vec3 styled = texture2D(u_styled, v_uv).rgb;
  if (u_split < 0.999) {
    float line = 0.0035;
    if (abs(v_uv.x - u_split) < line) { gl_FragColor = vec4(1.0); return; }
    vec3 original = texture2D(u_original, v_uv).rgb;
    gl_FragColor = vec4(v_uv.x < u_split ? original : styled, 1.0);
  } else {
    gl_FragColor = vec4(styled, 1.0);
  }
}`;
