/*
 * DIAMOND & OVAL POLY '99 · Upgraded 3D Low-Poly Stadium Renderer (Baseball + Cricket)
 * ------------------------------------------------------------------------------------
 * Features:
 *   - iPhone Portrait-optimized camera framing & horizon offset
 *   - Atmospheric skies (sun/moon bloom, drifting low-poly clouds, starfield, floodlight beams)
 *   - Full 3D Baseball Diamond + 3D Cricket Oval (22-yard pitch, creases, 3D stumps & bails)
 *   - Live-updating 3D Jumbotron Scoreboard & animated cheering crowd
 *   - Contact hit-flash, screen shake, fiery trails, and live tactical field radar
 */
import CONFIG from "./config.js";
import { buildPlayerMesh, buildStumpsMesh, buildTreeMesh, boxMesh } from "./mesh.js";
import { BASE_COORDS, wallDistAtAngle, lerpBasePos, lerpCricketCreasePos } from "./physics.js";

let canvas = null;
let ctx = null;
let W = 0, H = 0, dpr = 1;

const cam = {
  x: 0, y: -5.2, z: 2.35,
  tx: 0, ty: 18.4, tz: 1.25,
  fov: 54
};

const rgbCache = {};
function hexToRgb(hex) {
  if (rgbCache[hex]) return rgbCache[hex];
  const clean = String(hex || "#ffffff").replace("#", "");
  const n = parseInt(clean.length === 3 ? clean[0]+clean[0]+clean[1]+clean[1]+clean[2]+clean[2] : clean, 16) || 0xffffff;
  const out = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  rgbCache[hex] = out;
  return out;
}

function shadeHex(hex, factor) {
  const c = hexToRgb(hex);
  const r = Math.min(255, Math.max(0, (c[0] * factor) | 0));
  const g = Math.min(255, Math.max(0, (c[1] * factor) | 0));
  const b = Math.min(255, Math.max(0, (c[2] * factor) | 0));
  return `rgb(${r},${g},${b})`;
}

// Pre-seeded deterministic stars & clouds so there's zero flicker
const STARS = Array.from({ length: 65 }, (_, i) => ({
  u: ((i * 73 + 19) % 100) / 100,
  v: ((i * 41 + 7) % 38) / 100,
  r: (i % 3 === 0 ? 1.8 : 1.1),
  phase: i * 0.9
}));

const CLOUDS = [
  { u: 0.16, v: 0.13, w: 72, speed: 0.004 },
  { u: 0.52, v: 0.09, w: 94, speed: 0.003 },
  { u: 0.84, v: 0.16, w: 66, speed: 0.005 }
];

const CROWD_PALETTE = ["#f8fafc", "#38bdf8", "#fbbf24", "#ef4444", "#22c55e", "#f472b6", "#a855f7"];

export function initRenderer(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext("2d");
  resizeRenderer();
  window.addEventListener("resize", resizeRenderer);
}

export function resizeRenderer() {
  if (!canvas || !ctx) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

let basis = {
  rx: 1, ry: 0, rz: 0,
  ux: 0, uy: 0, uz: 1,
  fx: 0, fy: 1, fz: 0,
  focal: 500,
  centerY: 0.5
};

function updateCameraBasis(shakeX = 0, shakeY = 0) {
  const isPortrait = H > W * 1.12;
  let fx = cam.tx - cam.x;
  let fy = cam.ty - cam.y;
  let fz = cam.tz - cam.z;
  const fl = Math.hypot(fx, fy, fz) || 1;
  fx /= fl; fy /= fl; fz /= fl;

  let rx = fy;
  let ry = -fx;
  let rz = 0;
  const rl = Math.hypot(rx, ry, rz) || 1;
  rx /= rl; ry /= rl; rz /= rl;

  const ux = ry * fz - rz * fy;
  const uy = rz * fx - rx * fz;
  const uz = rx * fy - ry * fx;

  const fovRad = (cam.fov * Math.PI) / 180;
  // On portrait iPhones, blend width and height so the stadium fills the tall screen richly!
  const refDim = isPortrait ? (W * 0.78 + H * 0.22) : Math.min(W, H);
  const focal = (refDim * 0.54) / Math.tan(fovRad * 0.5);

  basis = {
    rx, ry, rz, ux, uy, uz, fx, fy, fz,
    focal,
    centerX: W * 0.5 + shakeX,
    centerY: (isPortrait ? H * 0.44 : H * 0.50) + shakeY
  };
}

export function project3D(wx, wy, wz) {
  const dx = wx - cam.x;
  const dy = wy - cam.y;
  const dz = wz - cam.z;

  const cz = dx * basis.fx + dy * basis.fy + dz * basis.fz;
  if (cz <= 0.15) return null;

  const cx = dx * basis.rx + dy * basis.ry + dz * basis.rz;
  const cy = dx * basis.ux + dy * basis.uy + dz * basis.uz;

  const scale = basis.focal / cz;
  return {
    sx: basis.centerX + cx * scale,
    sy: basis.centerY - cy * scale,
    depth: cz,
    scale
  };
}

function drawPolygon3D(pts3D, fillStyle, strokeStyle = null, lineWidth = 1) {
  const proj = [];
  for (let i = 0; i < pts3D.length; i++) {
    const p = project3D(pts3D[i][0], pts3D[i][1], pts3D[i][2]);
    if (!p) return;
    proj.push(p);
  }
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(proj[0].sx, proj[0].sy);
  for (let i = 1; i < proj.length; i++) ctx.lineTo(proj[i].sx, proj[i].sy);
  ctx.closePath();
  ctx.fill();
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawLine3D(a, b, strokeStyle, lineWidth = 2) {
  const p0 = project3D(a[0], a[1], a[2]);
  const p1 = project3D(b[0], b[1], b[2]);
  if (!p0 || !p1) return;
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(p0.sx, p0.sy);
  ctx.lineTo(p1.sx, p1.sy);
  ctx.stroke();
}

function drawMesh3D(mesh, wx, wy, wz, heading, sky) {
  const c = Math.cos(heading), s = Math.sin(heading);
  const worldV = mesh.v.map((p) => [
    wx + p[0] * c - p[1] * s,
    wy + p[0] * s + p[1] * c,
    wz + p[2]
  ]);

  const facesToDraw = [];
  for (let i = 0; i < mesh.f.length; i++) {
    const face = mesh.f[i];
    const pts = [];
    let avgDepth = 0;
    let clipped = false;
    for (let k = 0; k < face.idx.length; k++) {
      const vp = worldV[face.idx[k]];
      const pr = project3D(vp[0], vp[1], vp[2]);
      if (!pr) { clipped = true; break; }
      pts.push(pr);
      avgDepth += pr.depth;
    }
    if (clipped) continue;
    avgDepth /= face.idx.length;

    const nx = face.n[0] * c - face.n[1] * s;
    const ny = face.n[0] * s + face.n[1] * c;
    const nz = face.n[2];
    const dot = Math.max(0, nx * sky.sun[0] + ny * sky.sun[1] + nz * sky.sun[2]);
    const light = (sky.ambient + (1 - sky.ambient) * dot) * (face.tone || 1);

    facesToDraw.push({
      pts,
      depth: avgDepth,
      color: shadeHex(face.c, light),
      edge: shadeHex(face.c, light * 0.68)
    });
  }

  facesToDraw.sort((a, b) => b.depth - a.depth);
  for (let i = 0; i < facesToDraw.length; i++) {
    const f = facesToDraw[i];
    ctx.fillStyle = f.color;
    ctx.strokeStyle = f.edge;
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(f.pts[0].sx, f.pts[0].sy);
    for (let k = 1; k < f.pts.length; k++) ctx.lineTo(f.pts[k].sx, f.pts[k].sy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawShadow(wx, wy, radius, altitude = 0) {
  const p = project3D(wx, wy, 0.02);
  if (!p) return;
  const altScale = Math.max(0.45, 1 - altitude * 0.025);
  const alpha = Math.max(0.12, 0.38 - altitude * 0.012);
  const rx = Math.max(2, radius * altScale * p.scale);
  const ry = Math.max(1, rx * 0.42);
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha.toFixed(2)})`;
  ctx.beginPath();
  ctx.ellipse(p.sx, p.sy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

/* Draw Sky Dome, Sun/Moon Bloom, Stars & Low-Poly Drifting Clouds */
function drawSkyBackdrop(sky, clock) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.62);
  skyGrad.addColorStop(0, sky.top);
  skyGrad.addColorStop(0.55, sky.mid);
  skyGrad.addColorStop(1, sky.horizon);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // Twinkling starfield at night
  if (sky.stars) {
    for (let i = 0; i < STARS.length; i++) {
      const st = STARS[i];
      const tw = 0.45 + 0.55 * Math.sin(clock * 2.1 + st.phase);
      ctx.fillStyle = `rgba(241, 245, 249, ${(tw * 0.8).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(st.u * W, st.v * H, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Sun / Moon disc with atmospheric bloom
  const sx = sky.sunPos[0] * W;
  const sy = sky.sunPos[1] * H;
  const bloomR = Math.min(W, H) * 0.24;
  const bloom = ctx.createRadialGradient(sx, sy, 4, sx, sy, bloomR);
  bloom.addColorStop(0, sky.sunColor);
  bloom.addColorStop(0.22, sky.stars ? "rgba(226,232,240,0.35)" : "rgba(254,240,138,0.42)");
  bloom.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(sx, sy, bloomR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = sky.sunColor;
  ctx.beginPath();
  ctx.arc(sx, sy, sky.stars ? 13 : 16, 0, Math.PI * 2);
  ctx.fill();

  // Drifting low-poly faceted clouds (day & sunset)
  if (sky.clouds) {
    ctx.fillStyle = sky.beamAlpha > 0 ? "rgba(254, 215, 170, 0.22)" : "rgba(255, 255, 255, 0.26)";
    CLOUDS.forEach((c) => {
      const cx = ((c.u + clock * c.speed) % 1.25 - 0.12) * W;
      const cy = c.v * H;
      ctx.beginPath();
      ctx.moveTo(cx - c.w * 0.55, cy + 10);
      ctx.lineTo(cx - c.w * 0.25, cy - 12);
      ctx.lineTo(cx + c.w * 0.15, cy - 16);
      ctx.lineTo(cx + c.w * 0.55, cy + 10);
      ctx.closePath();
      ctx.fill();
    });
  }

  // Ground horizon backdrop
  ctx.fillStyle = sky.turfB;
  ctx.fillRect(0, basis.centerY - 24, W, H - basis.centerY + 40);
}

/* Draw glowing floodlight tower & optional volumetric light cone */
function drawLightTower(lx, ly, sky) {
  const topP = project3D(lx, ly, 28);
  const botP = project3D(lx, ly, 12);
  if (!topP || !botP) return;

  // Steel pylon
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = Math.max(1.8, 3.2 * topP.scale * 0.04);
  ctx.beginPath();
  ctx.moveTo(botP.sx, botP.sy);
  ctx.lineTo(topP.sx, topP.sy);
  ctx.stroke();

  // Light bank housing
  const bw = Math.max(8, 22 * topP.scale * 0.04);
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(topP.sx - bw * 0.5, topP.sy - 3, bw, 6);

  // Volumetric light beam cone at dusk/night
  if (sky.beamAlpha > 0) {
    const beamGrad = ctx.createLinearGradient(topP.sx, topP.sy, W * 0.5, H * 0.72);
    beamGrad.addColorStop(0, `rgba(254, 249, 195, ${sky.beamAlpha})`);
    beamGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(topP.sx - bw * 0.4, topP.sy);
    ctx.lineTo(topP.sx + bw * 0.4, topP.sy);
    ctx.lineTo(topP.sx + (W * 0.5 - topP.sx) * 0.75 + 90, H * 0.75);
    ctx.lineTo(topP.sx + (W * 0.5 - topP.sx) * 0.75 - 90, H * 0.75);
    ctx.closePath();
    ctx.fill();
  }

  // Glowing halo
  const haloR = sky.beamAlpha > 0 ? 40 : 26;
  const g = ctx.createRadialGradient(topP.sx, topP.sy, 1, topP.sx, topP.sy, haloR);
  g.addColorStop(0, "rgba(255, 252, 230, 0.95)");
  g.addColorStop(0.35, "rgba(56, 189, 248, 0.28)");
  g.addColorStop(1, "rgba(56, 189, 248, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(topP.sx, topP.sy, haloR, 0, Math.PI * 2);
  ctx.fill();
}

/* Draw live 3D Jumbotron Scoreboard with real match score */
function drawJumbotron(cx, cy, zBot, zTop, halfW, state) {
  drawPolygon3D(
    [[cx - halfW, cy, zBot], [cx + halfW, cy, zBot], [cx + halfW, cy, zTop], [cx - halfW, cy, zTop]],
    "#070c16",
    "#38bdf8",
    2
  );
  // Support legs
  drawLine3D([cx - halfW * 0.6, cy, 0], [cx - halfW * 0.6, cy, zBot], "#334155", 3);
  drawLine3D([cx + halfW * 0.6, cy, 0], [cx + halfW * 0.6, cy, zBot], "#334155", 3);

  const centerP = project3D(cx, cy, (zBot + zTop) * 0.5);
  const leftP = project3D(cx - halfW, cy, (zBot + zTop) * 0.5);
  if (!centerP || !leftP) return;

  const pxW = Math.abs(centerP.sx - leftP.sx) * 2;
  if (pxW < 28) return;

  const fontSize = Math.max(8, Math.min(15, pxW * 0.14));
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${fontSize}px ui-monospace, SFMono-Regular, monospace`;

  const celebrate = state.phase === "homerun" || state.crowdExcite > 0.2;
  if (celebrate) {
    ctx.fillStyle = Math.floor(state.clock * 8) % 2 === 0 ? "#fbbf24" : "#38bdf8";
    ctx.fillText(state.sport === "cricket" ? "BOUNDARY!" : "HOME RUN!", centerP.sx, centerP.sy - fontSize * 0.45);
  } else {
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(state.sport === "cricket" ? "OVAL POLY '99" : "DIAMOND POLY '99", centerP.sx, centerP.sy - fontSize * 0.52);
  }

  ctx.fillStyle = "#fbbf24";
  ctx.font = `900 ${Math.max(8, fontSize * 1.05)}px ui-monospace, SFMono-Regular, monospace`;
  if (state.sport === "cricket") {
    ctx.fillText(`${state.cricketRuns}/${state.cricketWickets}  OV ${Math.floor(state.cricketBalls / 6)}.${state.cricketBalls % 6}`, centerP.sx, centerP.sy + fontSize * 0.55);
  } else {
    ctx.fillText(`YOU ${state.homeRuns} - ${state.awayRuns} OPP`, centerP.sx, centerP.sy + fontSize * 0.55);
  }
  ctx.restore();
}

/* ===================== BASEBALL STADIUM ===================== */
function drawBaseballStadium(state, sky) {
  // 1. Mowed Radial + Checkerboard Outfield Turf
  const radialBands = 9;
  const angleSlices = 14;
  for (let r = radialBands - 1; r >= 0; r--) {
    const r0 = (r / radialBands) * 124;
    const r1 = ((r + 1) / radialBands) * 124;
    for (let s = 0; s < angleSlices; s++) {
      const a0 = -Math.PI * 0.34 + (s / angleSlices) * (Math.PI * 0.68);
      const a1 = -Math.PI * 0.34 + ((s + 1) / angleSlices) * (Math.PI * 0.68);
      const p0 = [Math.sin(a0) * r0, Math.cos(a0) * r0, 0];
      const p1 = [Math.sin(a1) * r0, Math.cos(a1) * r0, 0];
      const p2 = [Math.sin(a1) * r1, Math.cos(a1) * r1, 0];
      const p3 = [Math.sin(a0) * r1, Math.cos(a0) * r1, 0];
      const isTrack = r === radialBands - 1;
      const shade = isTrack ? sky.dirt : ((r + s) % 2 === 0 ? sky.turfA : sky.turfB);
      drawPolygon3D([p0, p1, p2, p3], shade);
    }
  }

  // 2. Outfield Wall, Yellow HR Line, Grandstands & Animated Crowd Dots
  const wallSegs = 16;
  const bounce = state.crowdExcite > 0 ? Math.abs(Math.sin(state.clock * 12)) * 1.1 : 0;
  for (let i = 0; i < wallSegs; i++) {
    const a0 = -Math.PI * 0.28 + (i / wallSegs) * (Math.PI * 0.56);
    const a1 = -Math.PI * 0.28 + ((i + 1) / wallSegs) * (Math.PI * 0.56);
    const d0 = wallDistAtAngle(a0);
    const d1 = wallDistAtAngle(a1);
    const x0 = Math.sin(a0) * d0, y0 = Math.cos(a0) * d0;
    const x1 = Math.sin(a1) * d1, y1 = Math.cos(a1) * d1;

    // Padded outfield fence
    drawPolygon3D(
      [[x0, y0, 0], [x1, y1, 0], [x1, y1, 4.2], [x0, y0, 4.2]],
      i % 2 === 0 ? "#0f2942" : "#163554",
      "#fbbf24",
      1.3
    );

    // Bleacher Tier
    const bx0 = Math.sin(a0) * (d0 + 24), by0 = Math.cos(a0) * (d0 + 24);
    const bx1 = Math.sin(a1) * (d1 + 24), by1 = Math.cos(a1) * (d1 + 24);
    drawPolygon3D(
      [[x0, y0, 4.4], [x1, y1, 4.4], [bx1, by1, 17.5], [bx0, by0, 17.5]],
      i % 2 === 0 ? sky.standA : sky.standB,
      "rgba(255,255,255,0.10)",
      0.8
    );

    // Low-poly spectator clusters in the bleachers
    const midA = (a0 + a1) * 0.5;
    for (let row = 0; row < 2; row++) {
      const dist = (d0 + d1) * 0.5 + 7 + row * 9;
      const cz = 7.5 + row * 4.2 + ((i + row) % 2 === 0 ? bounce : bounce * 0.6);
      const sp = project3D(Math.sin(midA) * dist, Math.cos(midA) * dist, cz);
      if (sp) {
        ctx.fillStyle = CROWD_PALETTE[(i * 3 + row * 2) % CROWD_PALETTE.length];
        const r = Math.max(1.6, 0.9 * sp.scale);
        ctx.beginPath();
        ctx.arc(sp.sx, sp.sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Tall Yellow Foul Poles at Left & Right Field corners
  [-Math.PI / 4, Math.PI / 4].forEach((ang) => {
    const d = CONFIG.field.fenceCorner;
    const fx = Math.sin(ang) * d;
    const fy = Math.cos(ang) * d;
    drawLine3D([fx, fy, 0], [fx, fy, 17], "#facc15", 3.5);
  });

  // Outer Skyline Trees behind bleachers
  const treeMesh = buildTreeMesh(2.4);
  [-0.26, -0.18, 0.18, 0.26].forEach((ang) => {
    const d = wallDistAtAngle(ang) + 34;
    drawMesh3D(treeMesh, Math.sin(ang) * d, Math.cos(ang) * d, 0, ang, sky);
  });

  // Live 3D Jumbotron Scoreboard in Center Field
  drawJumbotron(0, 130, 5.2, 20.5, 17, state);

  // 4 Floodlight Towers
  [-0.24, -0.10, 0.10, 0.24].forEach((ang) => {
    const d = wallDistAtAngle(ang) + 20;
    drawLightTower(Math.sin(ang) * d, Math.cos(ang) * d, sky);
  });

  // 3. Infield Dirt Diamond, Inner Grass, Pitcher's Mound, Chalk Lines & Batter's Boxes
  const B = 19.40;
  drawPolygon3D(
    [[0, -3.0, 0.01], [B + 3.6, B, 0.01], [0, B * 2 + 4.2, 0.01], [-B - 3.6, B, 0.01]],
    sky.dirt
  );
  drawPolygon3D(
    [[0, 4.2, 0.02], [B - 4.2, B, 0.02], [0, B * 2 - 4.2, 0.02], [-B + 4.2, B, 0.02]],
    sky.turfA
  );

  // Pitcher's Mound + Rubber
  const moundPts = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    moundPts.push([Math.cos(a) * 2.75, 18.44 + Math.sin(a) * 2.75, 0.04]);
  }
  drawPolygon3D(moundPts, sky.dirtLight);
  drawPolygon3D([[-0.45, 18.35, 0.07], [0.45, 18.35, 0.07], [0.45, 18.55, 0.07], [-0.45, 18.55, 0.07]], "#ffffff");

  // Chalk Foul Lines
  const foulR = CONFIG.field.fenceCorner;
  drawLine3D([0, 0, 0.03], [Math.sin(Math.PI / 4) * foulR, Math.cos(Math.PI / 4) * foulR, 0.03], "rgba(255,255,255,0.82)", 2);
  drawLine3D([0, 0, 0.03], [-Math.sin(Math.PI / 4) * foulR, Math.cos(Math.PI / 4) * foulR, 0.03], "rgba(255,255,255,0.82)", 2);

  // Batter's boxes around Home Plate
  [-1, 1].forEach((side) => {
    const x0 = side * 0.58, x1 = side * 1.48;
    drawPolygon3D([[x0, -0.7, 0.03], [x1, -0.7, 0.03], [x1, 0.9, 0.03], [x0, 0.9, 0.03]], "rgba(255,255,255,0.03)", "rgba(255,255,255,0.55)", 1.3);
  });

  // 3D Low-Poly Base Bags
  for (let b = 0; b <= 3; b++) {
    const bc = BASE_COORDS[b];
    const bagMesh = boxMesh(b === 0 ? 0.56 : 0.68, b === 0 ? 0.56 : 0.68, 0.12, "#ffffff");
    drawMesh3D(bagMesh, bc[0], bc[1], 0.06, Math.PI / 4, sky);
  }
}

/* ===================== CRICKET OVAL STADIUM ===================== */
function drawCricketStadium(state, sky) {
  const centerY = CONFIG.cricketField.pitchLength * 0.5;
  const R = CONFIG.cricketField.boundaryRadius;
  const rings = 7;
  const segs = 24;

  // 1. 360° Striped Oval Outfield Grass
  for (let r = rings - 1; r >= 0; r--) {
    const r0 = (r / rings) * (R + 6);
    const r1 = ((r + 1) / rings) * (R + 6);
    for (let s = 0; s < segs; s++) {
      const a0 = (s / segs) * Math.PI * 2;
      const a1 = ((s + 1) / segs) * Math.PI * 2;
      const p0 = [Math.sin(a0) * r0, centerY + Math.cos(a0) * r0, 0];
      const p1 = [Math.sin(a1) * r0, centerY + Math.cos(a1) * r0, 0];
      const p2 = [Math.sin(a1) * r1, centerY + Math.cos(a1) * r1, 0];
      const p3 = [Math.sin(a0) * r1, centerY + Math.cos(a0) * r1, 0];
      const shade = (r % 2 === 0) ? sky.turfA : sky.turfB;
      drawPolygon3D([p0, p1, p2, p3], shade);
    }
  }

  // 30-yard Fielding Circle (dashed white oval marker)
  for (let s = 0; s < segs; s += 2) {
    const a0 = (s / segs) * Math.PI * 2;
    const a1 = ((s + 1) / segs) * Math.PI * 2;
    drawLine3D(
      [Math.sin(a0) * 28, centerY + Math.cos(a0) * 28, 0.03],
      [Math.sin(a1) * 28, centerY + Math.cos(a1) * 28, 0.03],
      "rgba(255,255,255,0.42)",
      1.5
    );
  }

  // 2. Boundary Rope, Ad Boards & 360° Oval Grandstands
  const bounce = state.crowdExcite > 0 ? Math.abs(Math.sin(state.clock * 12)) * 1.1 : 0;
  for (let s = 0; s < segs; s++) {
    const a0 = (s / segs) * Math.PI * 2;
    const a1 = ((s + 1) / segs) * Math.PI * 2;
    const x0 = Math.sin(a0) * R, y0 = centerY + Math.cos(a0) * R;
    const x1 = Math.sin(a1) * R, y1 = centerY + Math.cos(a1) * R;

    // Bright Boundary Rope / Cushion
    drawLine3D([x0, y0, 0.18], [x1, y1, 0.18], s % 2 === 0 ? "#ffffff" : "#f97316", 3.2);

    // Outer Ad Perimeter & Oval Stands (only render forward-facing half richly)
    if (y0 > -15 || y1 > -15) {
      const adR = R + 4.5;
      const ax0 = Math.sin(a0) * adR, ay0 = centerY + Math.cos(a0) * adR;
      const ax1 = Math.sin(a1) * adR, ay1 = centerY + Math.cos(a1) * adR;
      drawPolygon3D(
        [[ax0, ay0, 0], [ax1, ay1, 0], [ax1, ay1, 2.2], [ax0, ay0, 2.2]],
        s % 2 === 0 ? "#0f172a" : "#1e3a5f",
        "#38bdf8",
        1
      );

      const stR = R + 24;
      const sx0 = Math.sin(a0) * stR, sy0 = centerY + Math.cos(a0) * stR;
      const sx1 = Math.sin(a1) * stR, sy1 = centerY + Math.cos(a1) * stR;
      drawPolygon3D(
        [[ax0, ay0, 2.3], [ax1, ay1, 2.3], [sx1, sy1, 14.5], [sx0, sy0, 14.5]],
        s % 2 === 0 ? sky.standA : sky.standB,
        "rgba(255,255,255,0.09)",
        0.7
      );

      // Cheering oval crowd dots
      const midA = (a0 + a1) * 0.5;
      const cd = R + 12;
      const cp = project3D(Math.sin(midA) * cd, centerY + Math.cos(midA) * cd, 6.8 + (s % 2 === 0 ? bounce : bounce * 0.5));
      if (cp) {
        ctx.fillStyle = CROWD_PALETTE[(s * 5) % CROWD_PALETTE.length];
        ctx.beginPath();
        ctx.arc(cp.sx, cp.sy, Math.max(1.5, 0.85 * cp.scale), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Tall White Sight Screen behind the bowler!
  drawPolygon3D(
    [[-6.5, centerY + R + 2, 0.5], [6.5, centerY + R + 2, 0.5], [6.5, centerY + R + 2, 8.5], [-6.5, centerY + R + 2, 8.5]],
    sky.stars ? "#1e293b" : "#f8fafc",
    "#94a3b8",
    1.5
  );

  // Live 3D Cricket Scoreboard
  drawJumbotron(24, centerY + R + 6, 4.5, 16.5, 14, state);

  // 4 Floodlight Towers around the Oval
  [-0.58, -0.22, 0.22, 0.58].forEach((ang) => {
    const d = R + 18;
    drawLightTower(Math.sin(ang) * d, centerY + Math.cos(ang) * d, sky);
  });

  // 3. 22-Yard Clay Cricket Pitch Strip
  const pLen = CONFIG.cricketField.pitchLength;
  drawPolygon3D(
    [[-1.65, -2.0, 0.02], [1.65, -2.0, 0.02], [1.65, pLen + 2.0, 0.02], [-1.65, pLen + 2.0, 0.02]],
    sky.pitchClay,
    "rgba(255,255,255,0.22)",
    1
  );
  // Subtle pitch wear patches near good-length zones
  drawPolygon3D([[-0.75, 2.6, 0.025], [0.75, 2.6, 0.025], [0.75, 6.2, 0.025], [-0.75, 6.2, 0.025]], sky.pitchWear);
  drawPolygon3D([[-0.75, pLen - 5.2, 0.025], [0.75, pLen - 5.2, 0.025], [0.75, pLen - 2.2, 0.025], [-0.75, pLen - 2.2, 0.025]], sky.pitchWear);

  // Crisp White Creases (Striker's End & Bowler's End)
  // Striker's bowling crease (y=0) & popping crease (y=1.22)
  drawLine3D([-1.32, 0, 0.035], [1.32, 0, 0.035], "#ffffff", 2);
  drawLine3D([-1.65, 1.22, 0.035], [1.65, 1.22, 0.035], "#ffffff", 2.4);
  drawLine3D([-1.32, -1.2, 0.035], [-1.32, 1.22, 0.035], "#ffffff", 1.8);
  drawLine3D([1.32, -1.2, 0.035], [1.32, 1.22, 0.035], "#ffffff", 1.8);

  // Bowler's bowling crease (y=pLen) & popping crease (y=pLen-1.22)
  drawLine3D([-1.32, pLen, 0.035], [1.32, pLen, 0.035], "#ffffff", 1.8);
  drawLine3D([-1.65, pLen - 1.22, 0.035], [1.65, pLen - 1.22, 0.035], "#ffffff", 2);

  // 3D Wooden Stumps & Bails at both ends!
  drawMesh3D(buildStumpsMesh(state.stumpsBroken), 0, 0, 0.02, 0, sky);
  drawMesh3D(buildStumpsMesh(false), 0, pLen, 0.02, 0, sky);
}

/* ===================== LIVE TACTICAL FIELD RADAR (in_play) ===================== */
function drawFieldRadar(state) {
  if (state.phase !== "in_play") return;
  const isPortrait = H > W * 1.12;
  const size = isPortrait ? 86 : 104;
  const rx = W - size - 12;
  const ry = isPortrait ? 104 : 84;
  const cx = rx + size * 0.5;
  const cy = ry + size * 0.5;

  ctx.save();
  ctx.fillStyle = "rgba(7, 16, 28, 0.76)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(rx, ry, size, size, 14);
  ctx.fill();
  ctx.stroke();

  if (state.sport === "cricket") {
    // Oval radar
    const rad = size * 0.41;
    ctx.strokeStyle = "rgba(34, 197, 94, 0.55)";
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();
    // Pitch strip
    ctx.fillStyle = "#e2c08d";
    ctx.fillRect(cx - 2.5, cy - 8, 5, 16);

    const scale = rad / CONFIG.cricketField.boundaryRadius;
    const midY = CONFIG.cricketField.pitchLength * 0.5;
    // Fielders
    ctx.fillStyle = "#ef4444";
    state.fielders.forEach((f) => {
      const fx = cx + f.x * scale;
      const fy = cy - (f.y - midY) * scale;
      ctx.beginPath();
      ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
    // Ball
    if (state.ball.visible) {
      const bx = cx + state.ball.x * scale;
      const by = cy - (state.ball.y - midY) * scale;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Baseball diamond radar
    const originX = cx;
    const originY = ry + size * 0.84;
    const scale = (size * 0.72) / 122;

    // Outfield arc
    ctx.strokeStyle = "rgba(34, 197, 94, 0.55)";
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.arc(originX, originY, 108 * scale, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.closePath();
    ctx.stroke();

    // Diamond bases
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    BASE_COORDS.slice(0, 4).forEach((b, i) => {
      const bx = originX + b[0] * scale;
      const by = originY - b[1] * scale;
      if (i === 0) ctx.moveTo(bx, by); else ctx.lineTo(bx, by);
    });
    ctx.closePath();
    ctx.stroke();

    // Fielders
    ctx.fillStyle = "#ef4444";
    state.fielders.forEach((f) => {
      ctx.beginPath();
      ctx.arc(originX + f.x * scale, originY - f.y * scale, 2.1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Runners
    ctx.fillStyle = "#22c55e";
    state.runners.forEach((r) => {
      const rp = lerpBasePos(r.progress);
      ctx.beginPath();
      ctx.arc(originX + rp[0] * scale, originY - rp[1] * scale, 2.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Ball
    if (state.ball.visible) {
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(originX + state.ball.x * scale, originY - state.ball.y * scale, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/* ===================== MAIN FRAME RENDERER ===================== */
export function renderFrame(state, dt) {
  if (!canvas || !ctx) return;
  const sky = CONFIG.skies[state.skyKey] || CONFIG.skies.day;
  const isPortrait = H > W * 1.12;
  const isCricket = state.sport === "cricket";

  // Decay screen shake & impact flash
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 28);
  if (state.hitFlash > 0) state.hitFlash = Math.max(0, state.hitFlash - dt * 4.5);
  if (state.crowdExcite > 0) state.crowdExcite = Math.max(0, state.crowdExcite - dt * 0.55);

  const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;
  const shakeY = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;

  // Dynamic Camera Selection (Portrait-aware!)
  let targetCam;
  if (state.phase === "in_play" || state.phase === "homerun") {
    const bx = state.ball.x || 0;
    const by = state.ball.y || 20;
    const bz = Math.max(0, state.ball.z || 0);
    if (isCricket) {
      targetCam = {
        x: bx * 0.22,
        y: isPortrait ? -28.0 : -24.0,
        z: isPortrait ? 24.0 : 19.0,
        tx: bx * 0.42,
        ty: 14.0 + Math.max(-12, by * 0.28),
        tz: Math.min(10, bz * 0.30),
        fov: isPortrait ? 58 : 52
      };
    } else {
      targetCam = {
        x: bx * 0.18,
        y: isPortrait ? -29.0 : -25.0,
        z: isPortrait ? 23.0 : 19.5,
        tx: bx * 0.35,
        ty: 21.0 + Math.max(8, by) * 0.22,
        tz: Math.min(10, bz * 0.25),
        fov: isPortrait ? 56 : 52
      };
    }
  } else {
    // Batter's Eye Camera (behind home plate / striker's stumps)
    if (isCricket) {
      targetCam = {
        x: 0.05,
        y: isPortrait ? -5.85 : -5.25,
        z: isPortrait ? 2.48 : 2.35,
        tx: 0,
        ty: 19.5,
        tz: isPortrait ? 1.10 : 1.18,
        fov: isPortrait ? 52 : 48
      };
    } else {
      targetCam = {
        x: 0,
        y: isPortrait ? -5.65 : -5.15,
        z: isPortrait ? 2.36 : 2.28,
        tx: 0,
        ty: 18.44,
        tz: isPortrait ? 1.12 : 1.18,
        fov: isPortrait ? 52 : 50
      };
    }
  }

  const lerp = Math.min(1, dt * 5.8);
  cam.x += (targetCam.x - cam.x) * lerp;
  cam.y += (targetCam.y - cam.y) * lerp;
  cam.z += (targetCam.z - cam.z) * lerp;
  cam.tx += (targetCam.tx - cam.tx) * lerp;
  cam.ty += (targetCam.ty - cam.ty) * lerp;
  cam.tz += (targetCam.tz - cam.tz) * lerp;
  cam.fov += (targetCam.fov - cam.fov) * lerp;

  updateCameraBasis(shakeX, shakeY);

  // 1. Sky + Atmosphere
  drawSkyBackdrop(sky, state.clock);

  // 2. Stadium Field Architecture
  if (isCricket) {
    drawCricketStadium(state, sky);
  } else {
    drawBaseballStadium(state, sky);
  }

  // 3. Depth-sorted 3D Characters (Fielders, Pitcher/Bowler, Runners, Batter)
  const entities = [];
  const teamList = isCricket ? CONFIG.cricketTeams : CONFIG.teams;
  const oppTeam = teamList.find((t) => t.id === state.oppTeamId) || teamList[0];
  const windupArm = state.phase === "windup" ? Math.sin(state.clock * 11) * 1.35 : 0;

  // Fielders
  state.fielders.forEach((f) => {
    if (state.phase !== "in_play" && (f.role === "C" || f.role === "WK")) return;
    const isThrower = f.role === "P" || f.role === "BWL";
    entities.push({
      x: f.x,
      y: f.y,
      z: 0,
      heading: f.heading || Math.PI,
      mesh: buildPlayerMesh({
        jersey: oppTeam.primary,
        accent: oppTeam.secondary,
        pants: isCricket ? oppTeam.primary : "#e2e8f0",
        cap: oppTeam.primary,
        stride: f.Moving || (isThrower && state.phase === "windup") ? state.clock * 15 : 0,
        armRaise: isThrower ? windupArm : 0,
        isCricket
      })
    });
  });

  // Active Runners
  if (isCricket) {
    // Non-striker at bowler's end (always visible during batting & running)
    const nsPos = state.phase === "in_play" && state.runners.length
      ? lerpCricketCreasePos(state.runners[0].progress, true)
      : [-1.15, CONFIG.cricketField.pitchLength - 1.1, 0];
    entities.push({
      x: nsPos[0],
      y: nsPos[1],
      z: 0,
      heading: Math.PI,
      mesh: buildPlayerMesh({
        jersey: "#22c55e",
        accent: "#fbbf24",
        pants: "#f8fafc",
        cap: "#15803d",
        hasPads: true,
        isCricket: true,
        stride: state.phase === "in_play" ? state.clock * 18 : 0
      })
    });

    if (state.phase === "in_play" && state.runners.length) {
      const r = state.runners[0];
      const rp = lerpCricketCreasePos(r.progress, false);
      const batSpec = CONFIG.cricketBats.find((b) => b.id === state.batId) || CONFIG.cricketBats[0];
      entities.push({
        x: rp[0],
        y: rp[1],
        z: 0,
        heading: Math.floor(r.progress) % 2 === 0 ? 0 : Math.PI,
        label: r.sliding ? "DIVE!" : null,
        mesh: buildPlayerMesh({
          jersey: "#22c55e",
          accent: "#fbbf24",
          pants: "#ffffff",
          cap: "#15803d",
          hasPads: true,
          isCricket: true,
          batColor: batSpec.color,
          gripColor: batSpec.grip,
          stride: state.clock * 19,
          sliding: r.sliding
        })
      });
    }
  } else {
    state.runners.forEach((r) => {
      const pos = lerpBasePos(r.progress);
      const nextIdx = Math.min(4, Math.floor(r.progress) + 1);
      const nextPos = BASE_COORDS[nextIdx];
      const heading = Math.atan2(nextPos[0] - pos[0], nextPos[1] - pos[1]);
      entities.push({
        x: pos[0],
        y: pos[1],
        z: 0,
        heading,
        label: r.sliding ? "SLIDE!" : null,
        mesh: buildPlayerMesh({
          jersey: "#22c55e",
          accent: "#fbbf24",
          pants: "#ffffff",
          cap: "#15803d",
          stride: state.clock * 18,
          sliding: r.sliding
        })
      });
    });
  }

  // Batter at Home Plate / Striker's Crease
  if (state.phase !== "in_play") {
    const batList = isCricket ? CONFIG.cricketBats : CONFIG.bats;
    const batSpec = batList.find((b) => b.id === state.batId) || batList[0];
    const coil = state.charging ? -0.28 : 0;
    entities.push({
      x: isCricket ? -0.68 : -0.78,
      y: isCricket ? 1.15 : 0.15,
      z: 0,
      heading: 0.35 + coil + state.swingAnim * 2.35,
      mesh: buildPlayerMesh({
        jersey: "#22c55e",
        accent: "#fbbf24",
        pants: "#f8fafc",
        cap: "#15803d",
        hasPads: isCricket,
        isCricket,
        batColor: batSpec.color,
        gripColor: batSpec.grip,
        swingAngle: -0.65 + coil + state.swingAnim * 2.75
      })
    });
  }

  entities.forEach((e) => {
    const pr = project3D(e.x, e.y, e.z);
    e.depth = pr ? pr.depth : 999;
  });
  entities.sort((a, b) => b.depth - a.depth);

  entities.forEach((e) => {
    drawShadow(e.x, e.y, 0.48, 0);
    drawMesh3D(e.mesh, e.x, e.y, e.z, e.heading, sky);
    if (e.label) {
      const lp = project3D(e.x, e.y, 1.45);
      if (lp) {
        ctx.font = "900 12px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(e.label, lp.sx, lp.sy);
      }
    }
  });

  // 4. Strike Zone (Baseball) OR Pitch Bounce & Crease Zone (Cricket) + Aim Reticle
  if (state.phase === "ready" || state.phase === "windup" || state.phase === "pitch") {
    if (isCricket) {
      // Cricket Pitch Bounce Marker on the 22-yard strip!
      if (state.phase === "pitch" && state.currentDelivery) {
        const d = state.currentDelivery;
        const bp = project3D(d.bounceX, d.bounceY, 0.04);
        if (bp) {
          const u = Math.max(0, Math.min(1, d.elapsed / d.flightTime));
          const ringR = Math.max(5, 16 * bp.scale * 0.04);
          ctx.strokeStyle = d.spec.color || "#38bdf8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(bp.sx, bp.sy, ringR * 1.4, ringR * 0.55, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Crease arrival timing ring
          const tp = project3D(d.targetX, 1.15, d.targetZ);
          if (tp && u > 0.22) {
            const tRing = Math.max(8, (1 - u) * 50 + 10);
            const inSweet = u > 0.80 && u < 1.05;
            ctx.strokeStyle = inSweet ? "#22c55e" : "rgba(56, 189, 248, 0.7)";
            ctx.lineWidth = inSweet ? 3.2 : 1.8;
            ctx.beginPath();
            ctx.arc(tp.sx, tp.sy, tRing, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      // Subtle Crease Hit Window box
      const czCorners = [
        [-0.52, 1.15, 0.24],
        [0.52,  1.15, 0.24],
        [0.52,  1.15, 1.40],
        [-0.52, 1.15, 1.40]
      ].map((c) => project3D(c[0], c[1], c[2]));
      if (czCorners.every(Boolean)) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 1.4;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(czCorners[0].sx, czCorners[0].sy);
        czCorners.slice(1).forEach((p) => ctx.lineTo(p.sx, p.sy));
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else {
      // Baseball 3x3 Glassmorphic Strike Zone
      const szCorners = [
        [-0.44, 0, 0.56],
        [0.44,  0, 0.56],
        [0.44,  0, 1.42],
        [-0.44, 0, 1.42]
      ].map((c) => project3D(c[0], c[1], c[2]));

      if (szCorners.every(Boolean)) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.36)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(szCorners[0].sx, szCorners[0].sy);
        szCorners.slice(1).forEach((p) => ctx.lineTo(p.sx, p.sy));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Subtle 3x3 inner grid lines
        ctx.strokeStyle = "rgba(255,255,255,0.14)";
        ctx.lineWidth = 1;
        for (let k = 1; k <= 2; k++) {
          const f = k / 3;
          const x = -0.44 + 0.88 * f;
          const z = 0.56 + 0.86 * f;
          drawLine3D([x, 0, 0.56], [x, 0, 1.42], "rgba(255,255,255,0.14)", 1);
          drawLine3D([-0.44, 0, z], [0.44, 0, z], "rgba(255,255,255,0.14)", 1);
        }
      }

      // Pitch Landing Preview Ring
      if (state.phase === "pitch" && state.currentPitch) {
        const tp = project3D(state.currentPitch.targetX, 0, state.currentPitch.targetZ);
        const u = Math.max(0, Math.min(1, state.currentPitch.elapsed / state.currentPitch.flightTime));
        if (tp && u > 0.16) {
          const ringR = Math.max(8, (1 - u) * 52 + 10);
          const inSweet = u > 0.84 && u < 1.06;
          ctx.strokeStyle = inSweet ? "#22c55e" : "rgba(56, 189, 248, 0.7)";
          ctx.lineWidth = inSweet ? 3.2 : 1.8;
          ctx.beginPath();
          ctx.arc(tp.sx, tp.sy, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Batter Sweet-Spot Aim Reticle (slightly larger & clearer on iPhone!)
    const aimY = isCricket ? 1.15 : 0;
    const aimP = project3D(state.aimX, aimY, state.aimZ);
    if (aimP) {
      const wide = state.stance === "contact" || state.stance === "drive" || state.stance === "bunt" || state.stance === "sweep";
      const rRadius = wide ? 30 : 23;
      ctx.save();
      ctx.strokeStyle = state.charging ? "#fde047" : "rgba(251, 191, 36, 0.88)";
      ctx.lineWidth = state.charging ? 3 : 2.3;
      ctx.beginPath();
      ctx.arc(aimP.sx, aimP.sy, rRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner sweet dot
      ctx.fillStyle = state.charging ? "rgba(253, 224, 71, 0.35)" : "rgba(251, 191, 36, 0.15)";
      ctx.beginPath();
      ctx.arc(aimP.sx, aimP.sy, rRadius * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(aimP.sx - rRadius - 7, aimP.sy);
      ctx.lineTo(aimP.sx - rRadius + 5, aimP.sy);
      ctx.moveTo(aimP.sx + rRadius - 5, aimP.sy);
      ctx.lineTo(aimP.sx + rRadius + 7, aimP.sy);
      ctx.moveTo(aimP.sx, aimP.sy - rRadius - 7);
      ctx.lineTo(aimP.sx, aimP.sy - rRadius + 5);
      ctx.moveTo(aimP.sx, aimP.sy + rRadius - 5);
      ctx.lineTo(aimP.sx, aimP.sy + rRadius + 7);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 5. 3D Ball, Dynamic Altitude Shadow, Glowing Comet Trail & Seam Details
  if (state.ball.visible) {
    drawShadow(state.ball.x, state.ball.y, 0.28, state.ball.z);

    if (state.ball.trail && state.ball.trail.length > 1) {
      for (let i = 1; i < state.ball.trail.length; i++) {
        const p0 = project3D(state.ball.trail[i - 1][0], state.ball.trail[i - 1][1], state.ball.trail[i - 1][2]);
        const p1 = project3D(state.ball.trail[i][0], state.ball.trail[i][1], state.ball.trail[i][2]);
        if (p0 && p1) {
          const frac = i / state.ball.trail.length;
          const alpha = frac * 0.72;
          ctx.strokeStyle = state.ball.isHomer
            ? `rgba(251, 191, 36, ${alpha.toFixed(2)})`
            : isCricket
              ? `rgba(248, 113, 113, ${alpha.toFixed(2)})`
              : `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
          ctx.lineWidth = Math.max(1.5, frac * (state.ball.isHomer ? 8 : 6));
          ctx.beginPath();
          ctx.moveTo(p0.sx, p0.sy);
          ctx.lineTo(p1.sx, p1.sy);
          ctx.stroke();
        }
      }
    }

    const bp = project3D(state.ball.x, state.ball.y, state.ball.z);
    if (bp) {
      const br = Math.max(4.5, Math.min(18, 0.145 * bp.scale));
      // Ball sphere gradient
      const ballFill = isCricket
        ? (sky.stars ? "#f8fafc" : "#dc2626") // White ball for Night T20, Crimson leather for Day/Sunset!
        : "#ffffff";
      const seamCol = isCricket
        ? (sky.stars ? "#ef4444" : "#fef08a")
        : "#ef4444";

      ctx.fillStyle = ballFill;
      ctx.beginPath();
      ctx.arc(bp.sx, bp.sy, br, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.beginPath();
      ctx.arc(bp.sx - br * 0.28, bp.sy - br * 0.28, br * 0.34, 0, Math.PI * 2);
      ctx.fill();

      // Seam ring
      ctx.strokeStyle = seamCol;
      ctx.lineWidth = Math.max(1.1, br * 0.20);
      ctx.beginPath();
      ctx.arc(bp.sx, bp.sy, br * 0.72, -0.5, 2.2);
      ctx.stroke();
    }
  }

  // 6. Barrel Contact Impact Flash Ring
  if (state.hitFlash > 0 && state.hitPos) {
    const hp = project3D(state.hitPos[0], state.hitPos[1], state.hitPos[2]);
    if (hp) {
      const r = (1 - state.hitFlash) * 70 + 14;
      ctx.strokeStyle = `rgba(253, 224, 71, ${(state.hitFlash * 0.85).toFixed(2)})`;
      ctx.lineWidth = 4 * state.hitFlash;
      ctx.beginPath();
      ctx.arc(hp.sx, hp.sy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // 7. 3D Low-Poly Particles (Dirt puffs, Stump splinters, Stadium Fireworks!)
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const pt = state.particles[i];
    pt.life -= dt;
    if (pt.life <= 0) {
      state.particles.splice(i, 1);
      continue;
    }
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.z += pt.vz * dt;
    pt.vz -= 6.5 * dt;
    const pp = project3D(pt.x, pt.y, Math.max(0.05, pt.z));
    if (pp) {
      const sz = Math.max(2, pt.size * (pt.life / pt.maxLife));
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.moveTo(pp.sx, pp.sy - sz);
      ctx.lineTo(pp.sx + sz * 0.9, pp.sy + sz * 0.7);
      ctx.lineTo(pp.sx - sz * 0.9, pp.sy + sz * 0.7);
      ctx.closePath();
      ctx.fill();
    }
  }

  // 8. Tactical Field Radar during live play
  drawFieldRadar(state);
}
