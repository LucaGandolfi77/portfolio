/* ============================================================
   Ultimo Colore — a small WebGL painter for the figures
   ------------------------------------------------------------
   One transparent canvas over the painted map. The camera looks
   down at the lagoon from the south, tipped by ELEVATION; where
   a figure stands on screen is exactly where it stands on the
   map. Buildings write depth only, so whoever walks behind them
   is hidden (the party shows through as a soft shape).
   ============================================================ */
import { STRIDE } from './geom.js';
import { solve, MAX_BONES } from './rig.js';

export const ELEVATION = (40 * Math.PI) / 180;
/** Depth gained per unit walked south, so ground and height agree. */
export const DEPTH_PER_Y = 1 / Math.tan(ELEVATION);
const RANGE = 4000;
const LIGHT = (() => { const v = [-0.42, 0.76, 0.5], l = Math.hypot(...v); return v.map((x) => x / l); })();

const VERT = `
attribute vec3 aPos, aNormal, aSwell, aColor;
attribute float aBone, aMat;
uniform mat4 uBones[${MAX_BONES}];
uniform mat4 uModel;
// shared with the fragment shader, so both must name the same precision
uniform mediump vec4 uCam;      // cos E, sin E, depth per map unit, depth range
uniform vec3 uAnchor;   // screen x, screen y, depth of the feet
uniform vec4 uView;     // width, height, zoom, centre of the view (map y)
uniform vec2 uOrigin;
uniform mediump vec3 uLight;
uniform mediump float uPass;
uniform float uOutline;
varying vec3 vNormal, vColor;
varying float vY, vMat;
void main() {
  vec2 screen;
  float depth;
  if (uPass > 3.5) {
    // a building: already flat on the map, with one depth
    screen = (aPos.xy - uOrigin) * uView.z;
    depth = (aPos.z - uView.w) * uCam.z;
    vNormal = vec3(0.0, 1.0, 0.0); vColor = vec3(0.0); vY = 1.0; vMat = 0.0;
  } else {
    mat4 bone = uBones[int(aBone + 0.5)];
    vec4 at = bone * vec4(aPos, 1.0);
    if (uPass > 0.5 && uPass < 1.5) at.xyz += normalize(mat3(bone[0].xyz, bone[1].xyz, bone[2].xyz) * aSwell) * uOutline;
    vec3 p = (uModel * at).xyz;
    vec3 n = mat3(bone[0].xyz, bone[1].xyz, bone[2].xyz) * aNormal;
    vNormal = mat3(uModel[0].xyz, uModel[1].xyz, uModel[2].xyz) * n;
    vColor = aColor; vMat = aMat; vY = p.y;
    if (uPass > 1.5 && uPass < 2.5) p -= uLight * (max(p.y, 0.0) / uLight.y);
    screen = uAnchor.xy + vec2(p.x, -(p.y * uCam.x - p.z * uCam.y)) * uView.z;
    depth = uAnchor.z + p.y * uCam.y + p.z * uCam.x;
    if (uPass > 1.5 && uPass < 2.5) depth += 1.5;
  }
  gl_Position = vec4(screen.x / uView.x * 2.0 - 1.0, 1.0 - screen.y / uView.y * 2.0, -depth / uCam.w, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform mediump vec4 uCam;
uniform mediump vec3 uLight;
uniform mediump float uPass;
uniform float uClip, uAlpha, uTime, uDrain;
uniform vec4 uTint;
varying vec3 vNormal, vColor;
varying float vY, vMat;
vec3 drain(vec3 c) {
  // once green has died it leaves the figures too
  float green = smoothstep(0.02, 0.16, c.g - c.r);
  return mix(c, vec3(dot(c, vec3(0.299, 0.587, 0.114))), green * uDrain);
}
void main() {
  if (uPass > 3.5) { gl_FragColor = vec4(0.0); return; }
  if (vY < uClip) discard;
  if (uPass > 2.5) { gl_FragColor = vec4(1.0, 0.78, 0.45, 1.0) * 0.42 * uAlpha; return; }
  if (uPass > 1.5) { gl_FragColor = vec4(0.02, 0.04, 0.08, 1.0) * 0.34 * uAlpha; return; }
  if (uPass > 0.5) {
    vec3 ink = vMat > 0.5 && vMat < 1.5 ? vec3(0.03, 0.17, 0.11) : vec3(0.09, 0.055, 0.045);
    gl_FragColor = vec4(drain(ink), 1.0) * uAlpha;
    return;
  }
  vec3 n = normalize(vNormal);
  vec3 eye = vec3(0.0, uCam.y, uCam.x);
  float facing = dot(n, uLight);
  float lit = smoothstep(-0.08, 0.16, facing);
  float high = smoothstep(0.6, 0.74, facing);
  float rim = pow(1.0 - max(dot(n, eye), 0.0), 3.0);
  float shine = max(dot(reflect(-uLight, n), eye), 0.0);
  vec3 c;
  if (vMat > 1.5 && vMat < 2.5) {
    c = vColor * (1.06 + 0.12 * sin(uTime * 5.0 + vY * 0.2));
  } else if (vMat > 0.5 && vMat < 1.5) {
    c = vColor * (0.66 + 0.34 * lit + 0.22 * high) + rim * vec3(0.5, 0.85, 0.68) + pow(shine, 16.0) * 0.75;
  } else {
    vec3 shade = mix(vec3(0.64, 0.64, 0.78), vec3(1.16, 1.08, 0.98), lit) + high * vec3(0.14, 0.1, 0.05);
    c = vColor * shade * mix(0.82, 1.0, clamp(vY / 30.0, 0.0, 1.0)) + rim * vec3(0.42, 0.32, 0.2) * (0.45 + 0.55 * lit);
    if (vMat > 2.5) c += pow(shine, 10.0) * 0.5;
  }
  c = mix(drain(c), uTint.rgb, uTint.a);
  gl_FragColor = vec4(c, 1.0) * uAlpha;
}`;

const ATTRS = [['aPos', 3, 0], ['aNormal', 3, 3], ['aSwell', 3, 6], ['aColor', 3, 9], ['aBone', 1, 12], ['aMat', 1, 13]];
const UNIFORMS = ['uBones[0]', 'uModel', 'uCam', 'uAnchor', 'uView', 'uOrigin', 'uLight', 'uPass', 'uOutline', 'uClip', 'uAlpha', 'uTime', 'uDrain', 'uTint'];

/** Turn about y, stretch by s, then move to (tx, ty, tz). */
function place(out, heading, s, tx, ty, tz) {
  const c = Math.cos(heading) * s, a = Math.sin(heading) * s;
  out.set([c, 0, -a, 0, 0, s, 0, 0, a, 0, c, 0, tx, ty, tz, 1]);
  return out;
}

/** Returns null when the device cannot do it; the map then uses flat drawings. */
export function createRenderer(canvas) {
  let gl = null;
  try {
    gl = canvas.getContext('webgl', { alpha: true, antialias: true, stencil: true, premultipliedAlpha: true });
  } catch (_) { /* no WebGL */ }
  if (!gl) return null;

  let program, loc, buffers, occluder = null, occluderData = null, lost = false;
  const model = new Float32Array(16), bones = new Float32Array(MAX_BONES * 16);

  function setup() {
    const make = (type, source) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, source); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    program = gl.createProgram();
    gl.attachShader(program, make(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, make(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    loc = {};
    for (const [name] of ATTRS) { loc[name] = gl.getAttribLocation(program, name); gl.enableVertexAttribArray(loc[name]); }
    for (const name of UNIFORMS) loc[name] = gl.getUniformLocation(program, name);
    buffers = new Map();
    occluder = null;
  }

  try { setup(); } catch (e) { console.warn('3D unavailable:', e.message); return null; }
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; });
  canvas.addEventListener('webglcontextrestored', () => { try { setup(); lost = false; } catch (_) { /* stay flat */ } });

  function bind(buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    for (const [name, size, offset] of ATTRS) gl.vertexAttribPointer(loc[name], size, gl.FLOAT, false, STRIDE * 4, offset * 4);
  }

  function upload(data) {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return b;
  }

  /**
   * polygons: [{ points: [[x, y], …], depthY }] in map units; each is
   * convex and hides what stands further north than depthY.
   */
  function setOccluders(polygons) {
    const data = [];
    for (const { points, depthY } of polygons) {
      for (let i = 1; i < points.length - 1; i++) {
        for (const [x, y] of [points[0], points[i], points[i + 1]]) data.push(x, y, depthY, ...Array(STRIDE - 3).fill(0));
      }
    }
    occluderData = new Float32Array(data);
    occluder = null;
  }

  function resize(width, height) {
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  }

  /**
   * view: { x, y, w, h (css px), zoom, time, drain }
   * actors: { model, x, y, heading, pose, scale, lift, offset, base, clip, alpha, tint, shadow, xray }
   */
  function render(view, actors) {
    if (lost) return false;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.depthMask(true); gl.colorMask(true, true, true, true); gl.stencilMask(0xff);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const centre = view.y + view.h / view.zoom / 2;
    gl.uniform4f(loc.uCam, Math.cos(ELEVATION), Math.sin(ELEVATION), DEPTH_PER_Y, RANGE);
    gl.uniform4f(loc.uView, view.w, view.h, view.zoom, centre);
    gl.uniform2f(loc.uOrigin, view.x, view.y);
    gl.uniform3f(loc.uLight, ...LIGHT);
    gl.uniform1f(loc.uTime, view.time || 0);
    gl.uniform1f(loc.uDrain, view.drain || 0);

    for (const a of actors) a.palette = solve(a.model, a.pose, a.palette);

    const draw = (a, pass) => {
      let buffer = buffers.get(a.model);
      if (!buffer) buffers.set(a.model, (buffer = upload(a.model.data)));
      bind(buffer);
      const scale = (a.scale ?? 1) * (a.model.size ?? 1);
      const [ox, oy, oz] = a.offset || [0, 0, 0], turn = a.base || 0;
      place(model, a.heading || 0, scale, ox * Math.cos(turn) + oz * Math.sin(turn), oy + (a.lift || 0), -ox * Math.sin(turn) + oz * Math.cos(turn));
      gl.uniformMatrix4fv(loc.uModel, false, model);
      bones.set(a.palette);
      gl.uniformMatrix4fv(loc['uBones[0]'], false, bones);
      gl.uniform3f(loc.uAnchor, (a.x - view.x) * view.zoom, (a.y - view.y) * view.zoom, (a.y - centre) * DEPTH_PER_Y);
      gl.uniform1f(loc.uPass, pass);
      // the ink line stays visible on small screens
      gl.uniform1f(loc.uOutline, Math.max(0.85, 1.1 / view.zoom) / scale);
      gl.uniform1f(loc.uClip, a.clip ?? -1000);
      gl.uniform1f(loc.uAlpha, a.alpha ?? 1);
      gl.uniform4f(loc.uTint, ...(a.tint || [0, 0, 0, 0]));
      gl.drawArrays(gl.TRIANGLES, 0, a.model.count);
    };

    // 1. buildings: depth only
    if (occluderData?.length) {
      if (!occluder) occluder = upload(occluderData);
      bind(occluder);
      gl.disable(gl.CULL_FACE);
      gl.colorMask(false, false, false, false);
      gl.uniform1f(loc.uPass, 4);
      gl.drawArrays(gl.TRIANGLES, 0, occluderData.length / STRIDE);
      gl.colorMask(true, true, true, true);
    }
    // 2. shadows, each pixel darkened once
    gl.depthMask(false);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.STENCIL_TEST);
    gl.stencilFunc(gl.EQUAL, 0, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
    gl.depthFunc(gl.LEQUAL);
    for (const a of actors) if (a.shadow !== false) draw(a, 2);
    // 3. the party seen through walls
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.depthFunc(gl.GREATER);
    for (const a of actors) if (a.xray) draw(a, 3);
    // 4. the figures: ink hull, then paint
    gl.disable(gl.STENCIL_TEST);
    gl.depthMask(true);
    gl.depthFunc(gl.LESS);
    for (const a of actors) {
      gl.cullFace(gl.FRONT); draw(a, 1);
      gl.cullFace(gl.BACK); draw(a, 0);
    }
    return true;
  }

  return { render, resize, setOccluders, get lost() { return lost; }, gl };
}
