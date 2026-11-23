/* Neural Style Studio — GPU preview pipeline (WebGPU -> WebGL2 -> Canvas2D) */

const GL_VERT = `#version 300 es
out vec2 v_uv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  v_uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const GL_FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_content, u_styleA, u_styleB, u_mask;
uniform vec2 u_res;
uniform vec3 u_cmean, u_cstd, u_amean, u_astd, u_bmean, u_bstd;
uniform float u_strength, u_mix, u_split, u_time, u_quality;

vec3 toYcc(vec3 c) { return vec3(dot(c, vec3(.299,.587,.114)), c.b - c.r, c.r - c.g); }
vec3 fromYcc(vec3 y) { return vec3(y.x + y.z, y.x - (.344136*y.y + .714136*y.z), y.x + 1.772*y.y); }
vec3 transfer(vec3 c, vec3 cm, vec3 cs, vec3 sm, vec3 ss) {
  vec3 y = (toYcc(c) - cm) / max(cs, vec3(.02)) * ss + sm;
  return clamp(fromYcc(y), 0.0, 1.0);
}

void main() {
  vec2 uv = v_uv;
  vec3 content = texture(u_content, uv).rgb;
  vec3 sa = texture(u_styleA, uv).rgb;
  vec3 sb = texture(u_styleB, uv).rgb;
  vec3 sm = mix(u_amean, u_bmean, u_mix);
  vec3 ss = mix(u_astd, u_bstd, u_mix);
  vec3 shifted = transfer(content, u_cmean, u_cstd, sm, ss);

  float lum = dot(content, vec3(.299,.587,.114));
  vec2 warp = uv + vec2(sin(lum * 18.0 + u_time * 0.4), cos(lum * 15.0)) * 0.012 * u_quality;
  vec3 stroke = mix(texture(u_styleA, warp).rgb, texture(u_styleB, warp).rgb, u_mix);
  vec3 stylized = mix(shifted, mix(shifted, stroke, 0.42), u_strength);

  float mask = texture(u_mask, uv).r * u_strength;
  vec3 color = mix(content, stylized, clamp(mask, 0.0, 1.0));
  if (u_split >= 0.0 && gl_FragCoord.x / u_res.x < u_split) color = content;

  float d = distance(uv, vec2(.5));
  color *= 1.0 - d * d * 0.28;
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453) - 0.5;
  color += grain * 0.018;
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

const WGSL = `
struct Params {
  res: vec4f,
  ctrl: vec4f,
  cmean: vec4f, cstd: vec4f,
  amean: vec4f, astd: vec4f,
  bmean: vec4f, bstd: vec4f
};
@group(0) @binding(0) var<uniform> p: Params;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var contentTex: texture_2d<f32>;
@group(0) @binding(3) var styleATex: texture_2d<f32>;
@group(0) @binding(4) var styleBTex: texture_2d<f32>;
@group(0) @binding(5) var maskTex: texture_2d<f32>;

@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  let x = f32((i << 1u) & 2u);
  let y = f32(i & 2u);
  return vec4f(x * 2.0 - 1.0, y * 2.0 - 1.0, 0.0, 1.0);
}

fn toYcc(c: vec3f) -> vec3f { return vec3f(dot(c, vec3f(.299,.587,.114)), c.b - c.r, c.r - c.g); }
fn fromYcc(y: vec3f) -> vec3f { return vec3f(y.x + y.z, y.x - (.344136*y.y + .714136*y.z), y.x + 1.772*y.y); }
fn transfer(c: vec3f, cm: vec3f, cs: vec3f, sm: vec3f, ss: vec3f) -> vec3f {
  let y = (toYcc(c) - cm) / max(cs, vec3f(.02)) * ss + sm;
  return clamp(fromYcc(y), vec3f(0.0), vec3f(1.0));
}

@fragment fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let uv = pos.xy / p.res.xy;
  let content = textureSample(contentTex, samp, uv).rgb;
  let sa = textureSample(styleATex, samp, uv).rgb;
  let sb = textureSample(styleBTex, samp, uv).rgb;
  let sm = mix(p.amean.xyz, p.bmean.xyz, p.ctrl.y);
  let ss = mix(p.astd.xyz, p.bstd.xyz, p.ctrl.y);
  let shifted = transfer(content, p.cmean.xyz, p.cstd.xyz, sm, ss);
  let stroke = mix(sa, sb, p.ctrl.y);
  var color = mix(content, mix(shifted, stroke, 0.38), p.ctrl.x * textureSample(maskTex, samp, uv).r);
  if (p.ctrl.z >= 0.0 && uv.x < p.ctrl.z) { color = content; }
  let d = distance(uv, vec2f(.5));
  return vec4f(color * (1.0 - d * d * 0.25), 1.0);
}`;

function statsToVec(s) {
  return [s.mean[0], s.mean[1], s.mean[2], 0];
}

function glShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { gl.deleteShader(sh); return null; }
  return sh;
}

class GLPreview {
  constructor(canvas) {
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('no webgl2');
    this.gl = gl;
    const vs = glShader(gl, gl.VERTEX_SHADER, GL_VERT);
    const fs = glShader(gl, gl.FRAGMENT_SHADER, GL_FRAG);
    if (!vs || !fs) throw new Error('shader error');
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link error');
    this.prog = prog;
    this.vao = gl.createVertexArray();
    this.tex = {};
    for (const name of ['content', 'styleA', 'styleB', 'mask']) {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (name === 'mask') {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
      }
      this.tex[name] = t;
    }
    this.loc = {};
    for (const name of ['u_content', 'u_styleA', 'u_styleB', 'u_mask', 'u_res', 'u_cmean', 'u_cstd',
      'u_amean', 'u_astd', 'u_bmean', 'u_bstd', 'u_strength', 'u_mix', 'u_split', 'u_time', 'u_quality']) {
      this.loc[name] = gl.getUniformLocation(prog, name);
    }
    this.kind = 'webgl2';
  }

  upload(name, source) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + ['content', 'styleA', 'styleB', 'mask'].indexOf(name));
    gl.bindTexture(gl.TEXTURE_2D, this.tex[name]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  resize(w, h, dpr) {
    const gl = this.gl;
    gl.canvas.width = Math.round(w * dpr);
    gl.canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }

  render(p) {
    const gl = this.gl;
    gl.useProgram(this.prog);
    gl.bindVertexArray(this.vao);
    ['content', 'styleA', 'styleB', 'mask'].forEach((name, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, this.tex[name]);
      gl.uniform1i(this.loc['u_' + name], i);
    });
    gl.uniform2f(this.loc.u_res, gl.canvas.width, gl.canvas.height);
    const v3 = (loc, arr) => gl.uniform3fv(loc, arr);
    v3(this.loc.u_cmean, p.cStats.mean); v3(this.loc.u_cstd, p.cStats.std);
    v3(this.loc.u_amean, p.aStats.mean); v3(this.loc.u_astd, p.aStats.std);
    v3(this.loc.u_bmean, p.bStats.mean); v3(this.loc.u_bstd, p.bStats.std);
    gl.uniform1f(this.loc.u_strength, p.strength);
    gl.uniform1f(this.loc.u_mix, p.mix);
    gl.uniform1f(this.loc.u_split, p.split ?? -1);
    gl.uniform1f(this.loc.u_time, p.time || 0);
    gl.uniform1f(this.loc.u_quality, p.quality || 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose() { const gl = this.gl; Object.values(this.tex).forEach(t => gl.deleteTexture(t)); gl.deleteProgram(this.prog); }
}

class GPUPreview {
  static async create(canvas) {
    if (!navigator.gpu) throw new Error('no webgpu');
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) throw new Error('no adapter');
    const device = await adapter.requestDevice();
    const ctx = canvas.getContext('webgpu');
    if (!ctx) throw new Error('no webgpu context');
    const format = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format, alphaMode: 'opaque' });
    return new GPUPreview(canvas, device, ctx, format);
  }

  constructor(canvas, device, ctx, format) {
    this.device = device; this.ctx = ctx; this.canvas = canvas;
    this.module = device.createShaderModule({ code: WGSL });
    this.pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: { module: this.module, entryPoint: 'vs' },
      fragment: { module: this.module, entryPoint: 'fs', targets: [{ format }] },
      primitive: { topology: 'triangle-list' }
    });
    this.uniform = device.createBuffer({ size: 144, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
    this.textures = {};
    this.bind = null;
    this.kind = 'webgpu';
  }

  upload(name, source) {
    const device = this.device;
    if (this.textures[name]) this.textures[name].destroy();
    const tex = device.createTexture({
      size: [source.width || source.videoWidth || 1, source.height || source.videoHeight || 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    });
    device.queue.copyExternalImageToTexture({ source }, { texture: tex }, [source.width || tex.width, source.height || tex.height]);
    this.textures[name] = tex;
    this.buildBind();
  }

  buildBind() {
    if (!this.textures.content || !this.textures.styleA || !this.textures.styleB || !this.textures.mask) return;
    this.bind = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniform } },
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: this.textures.content.createView() },
        { binding: 3, resource: this.textures.styleA.createView() },
        { binding: 4, resource: this.textures.styleB.createView() },
        { binding: 5, resource: this.textures.mask.createView() }
      ]
    });
  }

  resize(w, h, dpr) {
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
  }

  render(p) {
    if (!this.bind) return;
    const a = new Float32Array(36);
    a.set([this.canvas.width, this.canvas.height, 0, 0], 0);
    a.set([p.strength, p.mix, p.split ?? -1, p.time || 0], 4);
    a.set(statsToVec(p.cStats), 8); a.set(statsToVec({ ...p.cStats, mean: p.cStats.std }), 12);
    a.set(statsToVec(p.aStats), 16); a.set(statsToVec({ ...p.aStats, mean: p.aStats.std }), 20);
    a.set(statsToVec(p.bStats), 24); a.set(statsToVec({ ...p.bStats, mean: p.bStats.std }), 28);
    this.device.queue.writeBuffer(this.uniform, 0, a);
    const enc = this.device.createCommandEncoder();
    const pass = enc.beginRenderPass({
      colorAttachments: [{
        view: this.ctx.getCurrentTexture().createView(),
        clearValue: { r: 0.03, g: 0.05, b: 0.1, a: 1 },
        loadOp: 'clear', storeOp: 'store'
      }]
    });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bind);
    pass.draw(3);
    pass.end();
    this.device.queue.submit([enc.finish()]);
  }

  dispose() { Object.values(this.textures).forEach(t => t.destroy()); this.uniform.destroy(); }
}

class CanvasPreview {
  constructor(canvas) { this.ctx = canvas.getContext('2d'); this.kind = '2d'; this.images = {}; }

  upload(name, source) { this.images[name] = source; }

  resize(w, h, dpr) {
    const c = this.ctx.canvas;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    c.style.width = w + 'px'; c.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w; this.h = h;
  }

  render(p) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    const content = this.images.content;
    if (content) ctx.drawImage(content, 0, 0, this.w, this.h);
    const style = p.mix < 0.5 ? this.images.styleA : this.images.styleB;
    if (style && p.strength > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.7, p.strength * 0.6);
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(style, 0, 0, this.w, this.h);
      ctx.restore();
    }
  }

  dispose() {}
}

export async function createPreview(canvas) {
  // WebGL2 is the default everywhere; WebGPU is an explicit opt-in upgrade (?webgpu=1).
  if (/[?&]webgpu=1/.test(location.search)) {
    try { return await GPUPreview.create(canvas); }
    catch (e) { console.warn('[NST] WebGPU unavailable, using WebGL2', e); }
  }
  try { return new GLPreview(canvas); }
  catch (e) { /* fall through */ }
  return new CanvasPreview(canvas);
}
