/* WebGL2 court renderer: procedural hardwood + point-sprite players/ball */

const COURT_VS = `#version 300 es
out vec2 v_uv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  v_uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const COURT_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform float u_time;
uniform vec3 u_home;
uniform vec3 u_away;

float line(float d, float w) { return 1.0 - smoothstep(w, w + 0.004, abs(d)); }
float rect(vec2 uv, vec2 c, vec2 s, float w) {
  vec2 d = abs(uv - c) - s;
  return 1.0 - smoothstep(w, w + 0.004, max(d.x, d.y));
}

void main() {
  vec2 uv = v_uv;
  float planks = sin(uv.x * 220.0) * 0.018 + sin(uv.x * 61.0) * 0.01;
  vec3 wood = mix(vec3(0.24, 0.13, 0.06), vec3(0.42, 0.24, 0.11), uv.y * 0.65 + planks);
  float grain = sin(uv.y * 380.0 + uv.x * 12.0) * 0.012;
  wood += grain;

  float lines = 0.0;
  lines = max(lines, rect(uv, vec2(0.5), vec2(0.46, 0.44), 0.004));
  lines = max(lines, line(uv.x - 0.5, 0.003));
  lines = max(lines, 1.0 - smoothstep(0.082, 0.086, abs(distance(uv, vec2(0.5)) - 0.079)));
  lines = max(lines, rect(uv, vec2(0.18, 0.5), vec2(0.09, 0.20), 0.004));
  lines = max(lines, rect(uv, vec2(0.82, 0.5), vec2(0.09, 0.20), 0.004));
  lines = max(lines, 1.0 - smoothstep(0.11, 0.115, abs(distance(uv, vec2(0.27, 0.5)) - 0.11)));
  lines = max(lines, 1.0 - smoothstep(0.11, 0.115, abs(distance(uv, vec2(0.73, 0.5)) - 0.11)));
  vec3 col = mix(wood, vec3(0.92, 0.94, 0.98), lines * 0.75);

  float glowL = exp(-length((uv - vec2(0.06, 0.5)) * vec2(1.0, 1.6)) * 9.0);
  float glowR = exp(-length((uv - vec2(0.94, 0.5)) * vec2(1.0, 1.6)) * 9.0);
  col += u_home * glowL * 0.28 + u_away * glowR * 0.28;
  col *= 1.0 - length(uv - 0.5) * 0.22;
  outColor = vec4(col, 1.0);
}`;

const DOT_VS = `#version 300 es
in vec2 a_pos;
in float a_size;
in vec4 a_color;
out vec4 v_color;
void main() {
  gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = a_size;
  v_color = a_color;
}`;

const DOT_FS = `#version 300 es
precision mediump float;
in vec4 v_color;
out vec4 outColor;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float core = smoothstep(0.45, 0.0, d);
  float halo = smoothstep(1.0, 0.15, d) * 0.5;
  outColor = vec4(v_color.rgb * (core + halo), (core + halo) * v_color.a);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src); gl.compileShader(sh);
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
}
function prog(gl, vs, fs) {
  const v = compile(gl, gl.VERTEX_SHADER, vs), f = compile(gl, gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return null;
  const p = gl.createProgram();
  gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}
function hex(h) {
  const s = String(h || '#00d4ff').replace('#', '');
  return [parseInt(s.slice(0, 2), 16) / 255, parseInt(s.slice(2, 4), 16) / 255, parseInt(s.slice(4, 6), 16) / 255];
}

export function createCourtGL(canvas) {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'high-performance' });
  if (!gl) return null;
  const court = prog(gl, COURT_VS, COURT_FS);
  const dots = prog(gl, DOT_VS, DOT_FS);
  if (!court || !dots) return null;
  const buf = gl.createBuffer();
  const loc = {
    home: gl.getUniformLocation(court, 'u_home'), away: gl.getUniformLocation(court, 'u_away'),
    time: gl.getUniformLocation(court, 'u_time'),
    pos: gl.getAttribLocation(dots, 'a_pos'), size: gl.getAttribLocation(dots, 'a_size'),
    color: gl.getAttribLocation(dots, 'a_color')
  };
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  const POS = { PG: [0.24, 0.5], SG: [0.34, 0.24], SF: [0.34, 0.76], PF: [0.46, 0.38], C: [0.5, 0.6] };

  function resize(w, h, dpr) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function draw(state, now) {
    gl.useProgram(court);
    gl.uniform3fv(loc.home, hex(state.homeColor));
    gl.uniform3fv(loc.away, hex(state.awayColor));
    gl.uniform1f(loc.time, now / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const data = [];
    const t = now / 1000;
    const sides = [['home', state.home], ['away', state.away]];
    for (const [side, team] of sides) {
      const list = (state.players || []).filter(p => p.side === side);
      list.forEach((p, i) => {
        const base = POS[p.pos] || POS.SF;
        const x = side === 'away' ? 1 - base[0] : base[0];
        const y = side === 'away' ? 1 - base[1] : base[1];
        const wob = Math.sin(t * 2 + i) * 0.006;
        data.push(x + wob, y, 22, ...(side === 'home' ? hex(state.homeColor) : hex(state.awayColor)), 0.95);
      });
    }
    const ball = state.ball || { x: 0.5, y: 0.5 };
    data.push(ball.x, ball.y, 13, 1, 0.72, 0.25, 1);
    if (!data.length) return;
    gl.useProgram(dots);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
    const stride = 7 * 4;
    gl.enableVertexAttribArray(loc.pos); gl.vertexAttribPointer(loc.pos, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(loc.size); gl.vertexAttribPointer(loc.size, 1, gl.FLOAT, false, stride, 8);
    gl.enableVertexAttribArray(loc.color); gl.vertexAttribPointer(loc.color, 4, gl.FLOAT, false, stride, 12);
    gl.drawArrays(gl.POINTS, 0, data.length / 7);
  }

  return { kind: 'webgl2', resize, draw, dispose() { gl.deleteBuffer(buf); } };
}
