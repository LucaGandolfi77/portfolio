/* RAVE — WebGL Shader Engine for Real-Time Style Transfer */

const VERT_SRC = `
  attribute vec2 a_pos;
  attribute vec2 a_uv;
  varying vec2 v_uv;
  void main() {
    v_uv = a_uv;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAG_NONE = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_tex;
  uniform float u_intensity;
  void main() {
    vec4 c = texture2D(u_tex, v_uv);
    gl_FragColor = c;
  }
`;

const FRAG_VANGOGH = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_tex;
  uniform float u_intensity;
  uniform float u_time;

  vec2 swirl(vec2 uv, vec2 center, float radius, float strength) {
    vec2 d = uv - center;
    float dist = length(d);
    float angle = dist / radius * strength;
    float s = sin(angle);
    float c = cos(angle);
    return center + vec2(d.x * c - d.y * s, d.x * s + d.y * c);
  }

  void main() {
    vec2 uv = v_uv;
    vec2 center = vec2(0.5 + 0.15 * sin(u_time * 0.3), 0.5 + 0.15 * cos(u_time * 0.4));
    uv = swirl(uv, center, 0.4, 2.5);

    vec4 orig = texture2D(u_tex, v_uv);
    vec4 col = texture2D(u_tex, uv);

    /* warm saturation boost */
    float gray = dot(col.rgb, vec3(0.299, 0.587, 0.114));
    vec3 sat = mix(vec3(gray), col.rgb, 1.4);
    sat.r *= 1.15;
    sat.g *= 1.05;
    sat.b *= 0.85;

    /* slight vignette */
    float vig = 1.0 - 0.3 * length(v_uv - 0.5);

    vec3 result = mix(orig.rgb, sat * vig, u_intensity);
    gl_FragColor = vec4(result, 1.0);
  }
`;

const FRAG_PICASSO = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_tex;
  uniform float u_intensity;
  uniform float u_time;

  float quantize(float v, float levels) {
    return floor(v * levels) / levels;
  }

  void main() {
    vec2 uv = v_uv;
    float tileX = 8.0 + 4.0 * sin(u_time * 0.2);
    float tileY = 6.0 + 3.0 * cos(u_time * 0.25);

    vec2 tile = floor(uv * vec2(tileX, tileY));
    float offset = mod(tile.x + tile.y, 2.0);
    vec2 distorted = uv + (offset - 0.5) * 0.02;

    vec4 orig = texture2D(u_tex, uv);
    vec4 col = texture2D(u_tex, distorted);

    /* color quantization */
    float q = 6.0 - 2.0 * sin(u_time * 0.15);
    col.r = quantize(col.r, q);
    col.g = quantize(col.g, q);
    col.b = quantize(col.b, q);

    /* edge emphasis via contrast */
    float edge = length(col.rgb - orig.rgb);
    col.rgb += edge * 2.0;

    /* warm shift */
    col.r *= 1.1;
    col.b *= 0.9;

    vec3 result = mix(orig.rgb, col.rgb, u_intensity);
    gl_FragColor = vec4(result, 1.0);
  }
`;

const FRAG_MONET = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_tex;
  uniform float u_intensity;
  uniform float u_time;

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
    vec2 uv = v_uv;
    vec2 res = vec2(1280.0, 720.0);

    vec4 orig = texture2D(u_tex, uv);
    vec4 blurred = blur9(u_tex, uv, res);

    /* pastel tint: shift toward soft blue/yellow */
    vec3 pastel = blurred.rgb;
    float lum = dot(pastel, vec3(0.299, 0.587, 0.114));
    pastel = mix(pastel, vec3(lum), 0.25);
    pastel.r *= 1.05;
    pastel.g *= 1.02;
    pastel.b *= 1.15;

    /* desaturate slightly */
    pastel = mix(vec3(lum), pastel, 0.6);

    /* soft glow */
    float glow = 0.8 + 0.2 * sin(u_time * 0.5);
    pastel *= glow;

    vec3 result = mix(orig.rgb, pastel, u_intensity);
    gl_FragColor = vec4(result, 1.0);
  }
`;

const FRAG_HOKUSAI = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_tex;
  uniform float u_intensity;
  uniform float u_time;

  float luminance(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    vec2 uv = v_uv;
    vec2 texel = 1.0 / vec2(1280.0, 720.0);

    vec4 orig = texture2D(u_tex, uv);

    /* Sobel edge detection */
    float tl = luminance(texture2D(u_tex, uv + texel * vec2(-1, -1)).rgb);
    float t  = luminance(texture2D(u_tex, uv + texel * vec2( 0, -1)).rgb);
    float tr = luminance(texture2D(u_tex, uv + texel * vec2( 1, -1)).rgb);
    float l  = luminance(texture2D(u_tex, uv + texel * vec2(-1,  0)).rgb);
    float r  = luminance(texture2D(u_tex, uv + texel * vec2( 1,  0)).rgb);
    float bl = luminance(texture2D(u_tex, uv + texel * vec2(-1,  1)).rgb);
    float b  = luminance(texture2D(u_tex, uv + texel * vec2( 0,  1)).rgb);
    float br = luminance(texture2D(u_tex, uv + texel * vec2( 1,  1)).rgb);

    float gx = -tl - 2.0*l - bl + tr + 2.0*r + br;
    float gy = -tl - 2.0*t - tr + bl + 2.0*b + br;
    float edge = sqrt(gx*gx + gy*gy);

    /* blue-dominant palette remap */
    vec3 col = orig.rgb;
    float lum = luminance(col);
    vec3 ink = vec3(0.02, 0.05, 0.12);
    vec3 water = vec3(0.15, 0.35, 0.65);
    vec3 foam = vec3(0.85, 0.9, 0.95);

    vec3 mapped = mix(water, foam, lum);
    mapped = mix(mapped, ink, smoothstep(0.3, 0.8, edge));

    /* high contrast */
    mapped = pow(mapped, vec3(0.85));

    /* subtle wave animation */
    float wave = 0.5 + 0.5 * sin(uv.y * 20.0 + u_time * 2.0);
    mapped += wave * 0.03;

    vec3 result = mix(orig.rgb, mapped, u_intensity);
    gl_FragColor = vec4(result, 1.0);
  }
`;

/* Shader source map */
const SHADERS = {
  none:     FRAG_NONE,
  vangogh:  FRAG_VANGOGH,
  picasso:  FRAG_PICASSO,
  monet:    FRAG_MONET,
  hokusai:  FRAG_HOKUSAI,
};

class ShaderEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = null;
    this.program = null;
    this.texture = null;
    this.uTex = null;
    this.uIntensity = null;
    this.uTime = null;
    this.intensity = 1.0;
    this.currentStyle = 'none';
    this.time = 0;
    this.ready = false;
  }

  init() {
    const gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) {
      console.error('WebGL not supported');
      return false;
    }
    this.gl = gl;

    /* quad geometry */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  0, 1,
       1, -1,  1, 1,
      -1,  1,  0, 0,
       1,  1,  1, 0,
    ]), gl.STATIC_DRAW);

    this.buf = buf;

    /* texture */
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.setStyle('none');
    this.ready = true;
    return true;
  }

  _compileShader(src, type) {
    const gl = this.gl;
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  _createProgram(fragSrc) {
    const gl = this.gl;
    const vert = this._compileShader(VERT_SRC, gl.VERTEX_SHADER);
    const frag = this._compileShader(fragSrc, gl.FRAGMENT_SHADER);
    if (!vert || !frag) return null;

    const prog = gl.createProgram();
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
      return null;
    }
    return prog;
  }

  setStyle(name) {
    if (!SHADERS[name]) name = 'none';
    this.currentStyle = name;

    const gl = this.gl;
    if (this.program) gl.deleteProgram(this.program);

    this.program = this._createProgram(SHADERS[name]);
    if (!this.program) {
      this.program = this._createProgram(SHADERS[name = 'none']);
    }

    gl.useProgram(this.program);

    /* attributes */
    const aPos = gl.getAttribLocation(this.program, 'a_pos');
    const aUv = gl.getAttribLocation(this.program, 'a_uv');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    if (aUv >= 0) {
      gl.enableVertexAttribArray(aUv);
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);
    }

    /* uniforms */
    this.uTex = gl.getUniformLocation(this.program, 'u_tex');
    this.uIntensity = gl.getUniformLocation(this.program, 'u_intensity');
    this.uTime = gl.getUniformLocation(this.program, 'u_time');

    gl.uniform1i(this.uTex, 0);
    if (this.uIntensity) gl.uniform1f(this.uIntensity, this.intensity);
  }

  setIntensity(v) {
    this.intensity = Math.max(0, Math.min(1, v));
    if (this.gl && this.program && this.uIntensity) {
      this.gl.useProgram(this.program);
      this.gl.uniform1f(this.uIntensity, this.intensity);
    }
  }

  render(video) {
    if (!this.ready || !video || video.readyState < 2) return;
    const gl = this.gl;

    /* resize canvas to match video */
    if (this.canvas.width !== video.videoWidth || this.canvas.height !== video.videoHeight) {
      this.canvas.width = video.videoWidth || 640;
      this.canvas.height = video.videoHeight || 480;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    gl.useProgram(this.program);

    this.time += 0.016;
    if (this.uTime) gl.uniform1f(this.uTime, this.time);

    /* upload video frame as texture */
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

    /* draw */
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  destroy() {
    if (this.gl) {
      this.gl.deleteProgram(this.program);
      this.gl.deleteTexture(this.texture);
    }
  }
}
