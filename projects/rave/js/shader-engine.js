/**
 * shader-engine.js — motore WebGL di RAVE: stili, crossfade e before/after.
 */

import { VERT_SRC, SHADERS, MIX_FRAG, COMPOSITE_FRAG } from '../shaders.js';

const QUAD = new Float32Array([
  -1, -1, 0, 1,
   1, -1, 1, 1,
  -1,  1, 0, 0,
   1,  1, 1, 0
]);
// Stesso quad con la v invertita: usato per scrivere nei framebuffer intermedi.
// Senza questo, il FBO memorizza il frame capovolto e la ricomposizione lo
// mostra a testa in giu' (su qualunque camera, il Mac lo notava di piu').
const QUAD_FBO = new Float32Array([
  -1, -1, 0, 0,
   1, -1, 1, 0,
  -1,  1, 0, 1,
   1,  1, 1, 1
]);

export class ShaderEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = null;
    this.ready = false;
    this.intensity = 1;
    this.split = 1;
    this.time = 0;
    this.style = 'none';
    this.previous = null;
    this.transitionStart = 0;
    this.transitionDuration = 420;
    this.programs = new Map();
    this.width = 0;
    this.height = 0;
    this.fboA = null;
    this.fboB = null;
  }

  init() {
    const gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) return false;
    this.gl = gl;

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
    this.fboBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.fboBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD_FBO, gl.STATIC_DRAW);

    this.videoTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.videoTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([8, 12, 24, 255]));

    this.mixProgram = this._makeProgram(MIX_FRAG, { texA: 'u_texA', texB: 'u_texB', mix: 'u_mix' });
    this.compositeProgram = this._makeProgram(COMPOSITE_FRAG, { styled: 'u_styled', original: 'u_original', split: 'u_split' });
    if (!this.mixProgram || !this.compositeProgram) return false;

    this.getProgram('none');
    this.ready = true;
    return true;
  }

  _compile(source, type) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[RAVE] shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  _makeProgram(fragment, uniformNames = {}) {
    const gl = this.gl;
    const vert = this._compile(VERT_SRC, gl.VERTEX_SHADER);
    const frag = this._compile(fragment, gl.FRAGMENT_SHADER);
    if (!vert || !frag) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.deleteShader(vert); gl.deleteShader(frag);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[RAVE] link:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    const uniforms = {};
    for (const [key, name] of Object.entries(uniformNames)) uniforms[key] = gl.getUniformLocation(program, name);
    return {
      program,
      aPos: gl.getAttribLocation(program, 'a_pos'),
      aUv: gl.getAttribLocation(program, 'a_uv'),
      uTex: gl.getUniformLocation(program, 'u_tex'),
      uIntensity: gl.getUniformLocation(program, 'u_intensity'),
      uTime: gl.getUniformLocation(program, 'u_time'),
      uResolution: gl.getUniformLocation(program, 'u_resolution'),
      uniforms
    };
  }

  getProgram(name) {
    if (this.programs.has(name)) return this.programs.get(name);
    const compiled = this._makeProgram(SHADERS[name] || SHADERS.none);
    if (compiled) this.programs.set(name, compiled);
    return compiled;
  }

  _makeFbo() {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { texture, framebuffer };
  }

  _ensureSize(video) {
    const width = Math.max(2, video.videoWidth || 640);
    const height = Math.max(2, video.videoHeight || 480);
    if (width === this.width && height === this.height) return;
    const gl = this.gl;
    this.width = width; this.height = height;
    this.canvas.width = width; this.canvas.height = height;
    [this.fboA, this.fboB].forEach((fbo) => {
      if (!fbo) return;
      gl.deleteTexture(fbo.texture);
      gl.deleteFramebuffer(fbo.framebuffer);
    });
    this.fboA = this._makeFbo();
    this.fboB = this._makeFbo();
  }

  _bindQuad(program, buffer = this.buffer) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    if (program.aPos >= 0) {
      gl.enableVertexAttribArray(program.aPos);
      gl.vertexAttribPointer(program.aPos, 2, gl.FLOAT, false, 16, 0);
    }
    if (program.aUv >= 0) {
      gl.enableVertexAttribArray(program.aUv);
      gl.vertexAttribPointer(program.aUv, 2, gl.FLOAT, false, 16, 8);
    }
  }

  _renderStyle(name, target) {
    const gl = this.gl;
    const program = this.getProgram(name) || this.getProgram('none');
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(program.program);
    this._bindQuad(program, this.fboBuffer);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.videoTexture);
    if (program.uTex) gl.uniform1i(program.uTex, 0);
    if (program.uIntensity) gl.uniform1f(program.uIntensity, this.intensity);
    if (program.uTime) gl.uniform1f(program.uTime, this.time);
    if (program.uResolution) gl.uniform2f(program.uResolution, this.width, this.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  _drawMix(from, to, amount) {
    const gl = this.gl;
    const program = this.mixProgram;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(program.program);
    this._bindQuad(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, from.texture);
    gl.uniform1i(program.uniforms.texA, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, to.texture);
    gl.uniform1i(program.uniforms.texB, 1);
    gl.uniform1f(program.uniforms.mix, amount);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  _drawComposite(styled) {
    const gl = this.gl;
    const program = this.compositeProgram;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(program.program);
    this._bindQuad(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, styled.texture);
    gl.uniform1i(program.uniforms.styled, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.videoTexture);
    gl.uniform1i(program.uniforms.original, 1);
    gl.uniform1f(program.uniforms.split, this.split);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  setStyle(name, animate = true) {
    if (!this.ready) return;
    const previous = this.style;
    this.style = name;
    if (!animate || previous === name || !this.fboA) { this.previous = null; return; }
    this.getProgram(previous);
    this.getProgram(name);
    this.previous = previous;
    this.transitionStart = performance.now();
  }

  setIntensity(value) { this.intensity = Math.max(0, Math.min(1, Number(value) || 0)); }
  setSplit(value) { this.split = Math.max(0, Math.min(1, Number(value) || 1)); }

  render(video) {
    if (!this.ready || !video || video.readyState < 2) return;
    this._ensureSize(video);
    const gl = this.gl;
    this.time += 1 / 60;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.videoTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

    if (this.previous) {
      const amount = Math.min(1, (performance.now() - this.transitionStart) / this.transitionDuration);
      this._renderStyle(this.previous, this.fboB);
      this._renderStyle(this.style, this.fboA);
      if (amount >= 1) { this._drawComposite(this.fboA); this.previous = null; }
      else this._drawMix(this.fboB, this.fboA, amount);
      return;
    }
    this._renderStyle(this.style, this.fboA);
    this._drawComposite(this.fboA);
  }

  destroy() {
    if (!this.gl) return;
    this.programs.forEach((item) => this.gl.deleteProgram(item.program));
    this.gl.deleteProgram(this.mixProgram.program);
    this.gl.deleteProgram(this.compositeProgram.program);
    [this.fboA, this.fboB].forEach((fbo) => {
      if (!fbo) return;
      this.gl.deleteTexture(fbo.texture);
      this.gl.deleteFramebuffer(fbo.framebuffer);
    });
    this.gl.deleteTexture(this.videoTexture);
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteBuffer(this.fboBuffer);
    this.ready = false;
  }
}
