/* Kinetic — WebGL2 point-sprite renderer with a lean Canvas2D fallback */

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]
];

const POINT_VS = `#version 300 es
precision mediump float;
in vec2 a_pos; in float a_size; in vec4 a_color;
uniform vec2 u_res;
out vec4 v_color;
void main() {
  vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = a_size;
  v_color = a_color;
}`;

const POINT_FS = `#version 300 es
precision mediump float;
in vec4 v_color;
out vec4 outColor;
void main() {
  float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
  float core = smoothstep(0.42, 0.0, d);
  float glow = smoothstep(1.0, 0.1, d) * 0.45;
  float a = (core + glow) * v_color.a;
  outColor = vec4(v_color.rgb * (core + glow), a);
}`;

const LINE_VS = `#version 300 es
precision mediump float;
in vec2 a_pos; in vec4 a_color;
uniform vec2 u_res;
out vec4 v_color;
void main() {
  vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  v_color = a_color;
}`;

const LINE_FS = `#version 300 es
precision mediump float;
in vec4 v_color;
out vec4 outColor;
void main() { outColor = v_color; }`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function program(gl, vs, fs) {
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return null;
  const p = gl.createProgram();
  gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
  gl.deleteShader(v); gl.deleteShader(f);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { gl.deleteProgram(p); return null; }
  return p;
}

function hsl(hue, a) {
  const h = ((hue % 360) + 360) % 360;
  const c = 1, x = 1 - Math.abs((h / 60) % 2 - 1);
  const seg = Math.floor(h / 60) % 6;
  const rgb = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][seg];
  return [rgb[0], rgb[1], rgb[2], a];
}

function buildFrames(game, hands, now) {
  const points = [];
  const colors = [];
  const lines = [];
  const lineColors = [];
  const push = (x, y, size, color) => { points.push(x, y, size); colors.push(...color); };
  const line = (x1, y1, x2, y2, color) => { lines.push(x1, y1, x2, y2); lineColors.push(...color, ...color); };

  const t = now / 1000;
  (hands || []).forEach((hand, hi) => {
    const pts = hand.points || [];
    const hue = hi === 0 ? 188 : 266;
    const col = hsl(hue, 0.95);
    for (const [a, b] of HAND_CONNECTIONS) {
      if (pts[a] && pts[b]) line(pts[a].x, pts[a].y, pts[b].x, pts[b].y, hsl(hue, 0.7));
    }
    for (const p of pts) push(p.x, p.y, 9, [0.9, 1, 1, 1]);
    const idx = pts[8] || pts[0];
    if (idx) {
      const pulse = 1 + Math.sin(t * 5 + hi) * 0.08;
      push(idx.x, idx.y, 58 * pulse, hsl(hue, 0.8));
      push(idx.x, idx.y, 9, [1, 1, 1, 1]);
    }
  });

  for (const o of game.targets) {
    const appear = Math.min(1, o.age * 5);
    const r = o.r * appear;
    push(o.x, o.y, r * 3.6, hsl(o.hue, 0.55));
    push(o.x, o.y, r * 2, hsl(o.hue, 0.95));
    push(o.x, o.y, r * 0.55, [1, 1, 1, 0.9]);
  }
  for (const p of game.particles) {
    const a = Math.max(0, p.life / p.maxLife);
    push(p.x, p.y, p.size * (1 + a) * 4, hsl(p.hue, a * 0.8));
  }
  return {
    points: new Float32Array(points), colors: new Float32Array(colors),
    lines: new Float32Array(lines), lineColors: new Float32Array(lineColors)
  };
}

function webglRenderer(canvas, opts) {
  const gl = canvas.getContext('webgl2', {
    alpha: true, antialias: false, premultipliedAlpha: true,
    powerPreference: 'high-performance', preserveDrawingBuffer: false
  });
  if (!gl) return null;
  const pointProgram = program(gl, POINT_VS, POINT_FS);
  const lineProgram = program(gl, LINE_VS, LINE_FS);
  if (!pointProgram || !lineProgram) return null;

  const buffers = {
    pos: gl.createBuffer(), size: gl.createBuffer(), color: gl.createBuffer(),
    lpos: gl.createBuffer(), lcolor: gl.createBuffer()
  };
  const loc = {
    pPos: gl.getAttribLocation(pointProgram, 'a_pos'),
    pSize: gl.getAttribLocation(pointProgram, 'a_size'),
    pColor: gl.getAttribLocation(pointProgram, 'a_color'),
    pRes: gl.getUniformLocation(pointProgram, 'u_res'),
    lPos: gl.getAttribLocation(lineProgram, 'a_pos'),
    lColor: gl.getAttribLocation(lineProgram, 'a_color'),
    lRes: gl.getUniformLocation(lineProgram, 'u_res')
  };
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  let width = 1, height = 1;
  function resize(w, h) {
    width = Math.max(1, w); height = Math.max(1, h);
    canvas.width = Math.round(width * opts.dpr);
    canvas.height = Math.round(height * opts.dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function draw(game, hands, now) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const f = buildFrames(game, hands, now);

    gl.useProgram(lineProgram);
    gl.uniform2f(loc.lRes, width, height);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.lpos);
    gl.bufferData(gl.ARRAY_BUFFER, f.lines, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(loc.lPos);
    gl.vertexAttribPointer(loc.lPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.lcolor);
    gl.bufferData(gl.ARRAY_BUFFER, f.lineColors, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(loc.lColor);
    gl.vertexAttribPointer(loc.lColor, 4, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, f.lines.length / 2);

    const count = f.points.length / 3;
    if (!count) return;
    gl.useProgram(pointProgram);
    gl.uniform2f(loc.pRes, width, height);
    const stride = 3 * 4;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.pos);
    gl.bufferData(gl.ARRAY_BUFFER, f.points, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(loc.pPos);
    gl.vertexAttribPointer(loc.pPos, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(loc.pSize);
    gl.vertexAttribPointer(loc.pSize, 1, gl.FLOAT, false, stride, 8);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.bufferData(gl.ARRAY_BUFFER, f.colors, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(loc.pColor);
    gl.vertexAttribPointer(loc.pColor, 4, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, count);
  }

  function dispose() {
    Object.values(buffers).forEach(b => gl.deleteBuffer(b));
    gl.deleteProgram(pointProgram);
    gl.deleteProgram(lineProgram);
  }
  return { kind: 'webgl2', resize, draw, dispose, gl };
}

function canvasRenderer(canvas, opts) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  let width = 1, height = 1;

  function resize(w, h) {
    width = Math.max(1, w); height = Math.max(1, h);
    canvas.width = Math.round(width * opts.dpr);
    canvas.height = Math.round(height * opts.dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(opts.dpr, 0, 0, opts.dpr, 0, 0);
  }

  function glow(x, y, r, hue, alpha) {
    const color = `hsla(${hue},100%,62%,`;
    ctx.fillStyle = color + (alpha * 0.16) + ')';
    ctx.beginPath(); ctx.arc(x, y, r * 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color + (alpha * 0.34) + ')';
    ctx.beginPath(); ctx.arc(x, y, r * 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color + alpha + ')';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  function draw(game, hands, now) {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    (hands || []).forEach((hand, hi) => {
      const pts = hand.points || [];
      const hue = hi === 0 ? 188 : 266;
      ctx.strokeStyle = `hsla(${hue},100%,72%,.85)`;
      ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      for (const [a, b] of HAND_CONNECTIONS) {
        if (!pts[a] || !pts[b]) continue;
        ctx.moveTo(pts[a].x, pts[a].y);
        ctx.lineTo(pts[b].x, pts[b].y);
      }
      ctx.stroke();
      for (const p of pts) glow(p.x, p.y, 3, hue, 0.9);
      const idx = pts[8] || pts[0];
      if (idx) {
        const pulse = 1 + Math.sin(now / 200 + hi) * 0.08;
        ctx.strokeStyle = `hsla(${hue},100%,72%,.7)`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(idx.x, idx.y, 26 * pulse, 0, Math.PI * 2); ctx.stroke();
      }
    });
    for (const o of game.targets) {
      const r = o.r * Math.min(1, o.age * 5);
      glow(o.x, o.y, r, o.hue, 0.95);
      ctx.strokeStyle = 'rgba(255,255,255,.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, Math.PI * 2); ctx.stroke();
    }
    for (const p of game.particles) {
      glow(p.x, p.y, p.size, p.hue, Math.max(0, p.life / p.maxLife));
    }
    ctx.restore();
  }

  return { kind: '2d', resize, draw, dispose() {}, ctx };
}

export function createRenderer(canvas, opts = {}) {
  const settings = { dpr: opts.dpr || 1 };
  const prefer2d = opts.prefer2d || false;
  let renderer = prefer2d ? null : webglRenderer(canvas, settings);
  if (!renderer) renderer = canvasRenderer(canvas, settings);
  if (!renderer) throw new Error('no canvas context');
  const impl = renderer;
  return {
    kind: impl.kind,
    gl: impl.gl || null,
    resize(w, h, dpr) {
      if (dpr && dpr !== settings.dpr) settings.dpr = dpr;
      return impl.resize(w, h);
    },
    draw: (game, hands, now) => impl.draw(game, hands, now),
    dispose: () => impl.dispose(),
    setDpr: dpr => { settings.dpr = dpr; }
  };
}

export const RendererFallback = createRenderer;
