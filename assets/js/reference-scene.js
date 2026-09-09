/* ============================================================
   Reference scenes — moving starfield background + "dotted"
   point-cloud imagery (wireframe cube + constellations).
   Vanilla JS, canvas-2D, no dependencies.
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var docEl = document.documentElement;
  var canvasStore = [];

  function isLight() {
    return docEl.getAttribute("data-theme") === "light";
  }
  function accent() {
    var v = getComputedStyle(docEl).getPropertyValue("--accent").trim();
    return v || "#b3e836";
  }
  function accentRGB() {
    var a = accent().replace("#", "");
    if (a.length === 3) a = a[0] + a[0] + a[1] + a[1] + a[2] + a[2];
    var n = parseInt(a, 16);
    return (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255);
  }
  function hexToRgb(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, ((n >> 8) & 255), n & 255];
  }

  /* ---------------- helpers ---------------- */
  function makeCanvas(cls) {
    var c = document.createElement("canvas");
    c.className = cls;
    return c;
  }
  function sizeTo(canvas, ctx) {
    var w = canvas.clientWidth || 100;
    var h = canvas.clientHeight || 100;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return [w, h];
  }

  /* ---------------- starfield (moving stars) ---------------- */
  function initStarfield() {
    var canvas = document.createElement("canvas");
    canvas.id = "starfield";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext("2d");
    var stars = [];
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function build() {
      stars = [];
      var n = Math.round(Math.min(220, Math.max(120, (W * H) / 6500)));
      var rgb = hexToRgb(accent());
      var greenish = rgb.map(function (v) { return v; });
      for (var i = 0; i < n; i++) {
        var acc = Math.random() < 0.35;             // ~35% green, rest white
        var color = acc ? "rgba(" + accentRGB() + "," : "rgba(232,238,230,";
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 0.4 + Math.random() * 1.4,
          base: 0.25 + Math.random() * 0.55,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.9,        // px / frame
          vx: -0.06 + Math.random() * 0.12,
          color: color
        });
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var light = isLight();
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        if (!reduced) {
          s.y += s.speed;
          s.x += s.vx * s.speed;
          if (s.y > H + 2) { s.y = -2; s.x = Math.random() * W; }
          if (s.x > W + 2) s.x = -2;
          if (s.x < -2) s.x = W + 2;
        }
        var tw = reduced ? 1 : (0.55 + 0.45 * Math.sin(t / 900 + s.phase));
        var a = Math.min(0.9, s.base * tw) * (light ? 0.5 : 1);
        ctx.beginPath();
        ctx.fillStyle = s.color + a.toFixed(3) + ")";
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    resize();
    build();
    window.addEventListener("resize", function () {
      resize();
      build();
    });
    canvasStore.push({ draw: draw });
  }

  /* ---------------- point-cloud scenes ---------------- */
  function buildCubePoints() {
    var p = [
      [-1,-1,-1],[ 1,-1,-1],[ 1, 1,-1],[-1, 1,-1],
      [-1,-1, 1],[ 1,-1, 1],[ 1, 1, 1],[-1, 1, 1]
    ];
    var edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    var pts = [];
    for (var e = 0; e < edges.length; e++) {
      var a = p[edges[e][0]], b = p[edges[e][1]];
      var num = 20;
      for (var k = 0; k <= num; k++) {
        var t = k / num;
        pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
      }
    }
    // extra interior cloud for depth
    for (var i = 0; i < 120; i++) {
      pts.push([(Math.random()*2-1)*0.9, (Math.random()*2-1)*0.9, (Math.random()*2-1)*0.9]);
    }
    return { pts: pts, corners: p, edges: edges };
  }

  function rotate(p, ang) {
    var cy = Math.cos(ang), sy = Math.sin(ang);
    var cx = Math.cos(ang * 0.7), sx = Math.sin(ang * 0.7);
    var x = p[0] * cy - p[2] * sy;
    var z = p[0] * sy + p[2] * cy;
    var y = p[1] * cx - z * sx;
    z = p[1] * sx + z * cx;
    return [x, y, z];
  }

  function initCubeScene(container) {
    var canvas = makeCanvas("dot-scene-canvas");
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var cube = buildCubePoints();
    sceneLoop.push(function (t) {
      var w = sizeTo(canvas, ctx)[0], h = sizeTo(canvas, ctx)[1];
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2, ang = t / 2600;
      var persp = 3.4, scale = Math.min(w, h) * 0.24;
      ctx.lineWidth = 1;
      // edges
      var projEdges = cube.edges.map(function (ed) {
        return ed.map(function (i) {
          var r = rotate(cube.corners[i], ang);
          var s = persp / (persp - r[2]);
          return [cx + r[0] * scale * s, cy + r[1] * scale * s];
        });
      });
      ctx.strokeStyle = "rgba(" + accentRGB() + ",0.16)";
      projEdges.forEach(function (ed) {
        ctx.beginPath();
        ctx.moveTo(ed[0][0], ed[0][1]);
        ctx.lineTo(ed[1][0], ed[1][1]);
        ctx.stroke();
      });
      // dotted points
      for (var i = 0; i < cube.pts.length; i++) {
        var r = rotate(cube.pts[i], ang);
        var s = persp / (persp - r[2]);
        var d = Math.min(1, Math.abs(0.75 - r[2]) * 0.9 + 0.3);
        ctx.fillStyle = "rgba(" + accentRGB() + "," + (0.25 + (1 - Math.abs(r[2]) / 3) * 0.55).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(cx + r[0] * scale * s, cy + r[1] * scale * s, (1.1 + d) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function initFieldScene(container) {
    var canvas = makeCanvas("dot-scene-canvas");
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var pts = [];
    function seed(w, h) {
      pts = [];
      var n = Math.min(90, Math.round((w * h) / 4500));
      for (var i = 0; i < n; i++) {
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 });
      }
    }
    sceneLoop.push(function (t) {
      var w = sizeTo(canvas, ctx)[0], h = sizeTo(canvas, ctx)[1];
      if (!pts.length) seed(w, h);
      ctx.clearRect(0, 0, w, h);
      // links
      ctx.strokeStyle = "rgba(" + accentRGB() + ",0.10)";
      ctx.lineWidth = 1;
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i];
        for (var j = i + 1; j < pts.length; j++) {
          var b = pts[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 62 * 62) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // dots
      for (var k = 0; k < pts.length; k++) {
        var p = pts[k];
        if (!reduced) { p.x += p.vx; p.y += p.vy; }
        if (p.x < 0) p.x += w; if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h; if (p.y > h) p.y -= h;
        ctx.fillStyle = "rgba(" + accentRGB() + ",0.4)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  /* ---------------- rich scenes: wave / rings / galaxy ---------------- */
  function initWaveScene(container) {
    var canvas = makeCanvas("dot-scene-canvas");
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    sceneLoop.push(function (t) {
      var w = sizeTo(canvas, ctx)[0], h = sizeTo(canvas, ctx)[1];
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(" + accentRGB() + ",0.6)";
      var spacing = 20;
      for (var y = spacing / 2; y < h; y += spacing) {
        var ph = y * 0.02 + t / 620;
        for (var x = spacing / 2; x < w; x += spacing) {
          var yy = y + Math.sin(ph + x * 0.03) * 11;
          var a = 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(ph + x * 0.03));
          ctx.fillStyle = "rgba(" + accentRGB() + "," + a.toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(x, yy, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }

  function initRingsScene(container) {
    var canvas = makeCanvas("dot-scene-canvas");
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    sceneLoop.push(function (t) {
      var w = sizeTo(canvas, ctx)[0], h = sizeTo(canvas, ctx)[1];
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2;
      var base = Math.min(w, h);
      for (var r = 0; r < 6; r++) {
        var radius = (r + 1.4) * (base / 16);
        var n = Math.max(12, 46 - r * 4);
        var rot = t / (1500 + r * 320);
        var a = Math.max(0.08, 0.34 - r * 0.045);
        ctx.fillStyle = "rgba(" + accentRGB() + "," + a.toFixed(3) + ")";
        for (var i = 0; i < n; i++) {
          var ang = rot + (i / n) * Math.PI * 2;
          var x = cx + Math.cos(ang) * radius;
          var y = cy + Math.sin(ang) * radius * (r % 2 ? 0.55 : 0.85);
          ctx.beginPath();
          ctx.arc(x, y, 1.15 + (r === 0 ? 1.0 : 0), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }

  function initGalaxyScene(container) {
    var canvas = makeCanvas("dot-scene-canvas");
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    sceneLoop.push(function (t) {
      var w = sizeTo(canvas, ctx)[0], h = sizeTo(canvas, ctx)[1];
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2;
      var arms = 3, perArm = 80;
      var rot = t / 1600;
      for (var arm = 0; arm < arms; arm++) {
        for (var i = 0; i < perArm; i++) {
          var p = i / perArm;
          var rad = p * p * Math.min(w, h) * 0.5;
          var ang = rot + (arm * Math.PI * 2) / arms + p * 4.6;
          var x = cx + Math.cos(ang) * rad;
          var y = cy + Math.sin(ang) * rad;
          var a = 0.08 + 0.62 * (1 - p);
          ctx.fillStyle = "rgba(" + accentRGB() + "," + a.toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(x, y, 0.9 + (1 - p) * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // bright hub
      ctx.fillStyle = "rgba(" + accentRGB() + ",0.9)";
      ctx.beginPath();
      ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ---------------- bootstrap scenes ---------------- */
  var sceneLoop = [];

  function initDotScenes() {
    var containers = document.querySelectorAll("[data-dot-scene]");
    for (var i = 0; i < containers.length; i++) {
      var kind = containers[i].getAttribute("data-dot-scene");
      if (kind === "field") initFieldScene(containers[i]);
      else if (kind === "wave") initWaveScene(containers[i]);
      else if (kind === "rings") initRingsScene(containers[i]);
      else if (kind === "galaxy") initGalaxyScene(containers[i]);
      else initCubeScene(containers[i]);
    }
    // inject dotted imagery into showcase cards (no HTML change)
    var cards = document.querySelectorAll(".showcase-card");
    for (var c = 0; c < cards.length; c++) {
      if (cards[c].querySelector(".card-dots")) continue;
      var wrapper = makeCanvas("card-dots");
      cards[c].insertBefore(wrapper, cards[c].firstChild);
      initFieldInto(cards[c], wrapper);
    }
  }

  function initFieldInto(card, canvas) {
    var ctx = canvas.getContext("2d");
    var pts = [];
    function seed(w, h) {
      pts = [];
      var n = Math.min(70, Math.round((w * h) / 5200));
      for (var i = 0; i < n; i++) {
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25 });
      }
    }
    sceneLoop.push(function (t) {
      var w = sizeTo(canvas, ctx)[0], h = sizeTo(canvas, ctx)[1];
      if (!pts.length) seed(w, h);
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i];
        for (var j = i + 1; j < pts.length; j++) {
          var b = pts[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          if (dx * dx + dy * dy < 56 * 56) {
            ctx.strokeStyle = "rgba(" + accentRGB() + ",0.12)";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (var k = 0; k < pts.length; k++) {
        var p = pts[k];
        if (!reduced) { p.x += p.vx; p.y += p.vy; }
        if (p.x < 0) p.x += w; if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h; if (p.y > h) p.y -= h;
        ctx.fillStyle = "rgba(" + accentRGB() + ",0.5)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function loop(t) {
    for (var i = 0; i < sceneLoop.length; i++) sceneLoop[i](t);
    for (var j = 0; j < canvasStore.length; j++) canvasStore[j].draw(t);
  }

  function start() {
    initStarfield();
    initDotScenes();
    if (reduced) {
      loop(0);          // single static frame
      return;
    }
    function frame(t) { loop(t); requestAnimationFrame(frame); }
    requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
