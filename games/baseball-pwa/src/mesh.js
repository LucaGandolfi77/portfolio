/*
 * DIAMOND & OVAL POLY '99 · Upgraded 3D Low-Poly Meshes & Articulated Players
 * ---------------------------------------------------------------------------
 * Flat-shaded 3D polygon meshes with per-face normals for Baseball & Cricket
 * players, bats, stumps/bails, bases, foul poles, and stadium scenery.
 */

export function boxMesh(w, d, h, color) {
  const x = w / 2, y = d / 2, z = h / 2;
  const v = [
    [-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],
    [-x, -y, z],  [x, -y, z],  [x, y, z],  [-x, y, z]
  ];
  const f = [
    { idx: [4, 5, 6, 7], n: [0, 0, 1],  c: color, tone: 1.12 }, // top
    { idx: [0, 1, 5, 4], n: [0, -1, 0], c: color, tone: 0.96 }, // front
    { idx: [1, 2, 6, 5], n: [1, 0, 0],  c: color, tone: 0.88 }, // right
    { idx: [3, 0, 4, 7], n: [-1, 0, 0], c: color, tone: 0.80 }, // left
    { idx: [2, 3, 7, 6], n: [0, 1, 0],  c: color, tone: 0.72 }  // back
  ];
  return { v, f };
}

export function prismMesh(sides, rBottom, rTop, h, color) {
  const v = [];
  const f = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const ca = Math.cos(a), sa = Math.sin(a);
    v.push([ca * rBottom, sa * rBottom, 0]);
    v.push([ca * rTop, sa * rTop, h]);
  }
  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    const mid = ((i + 0.5) / sides) * Math.PI * 2;
    f.push({
      idx: [i * 2, j * 2, j * 2 + 1, i * 2 + 1],
      n: [Math.cos(mid), Math.sin(mid), 0.2],
      c: color,
      tone: 0.95
    });
  }
  const topRing = [];
  for (let i = 0; i < sides; i++) topRing.push(i * 2 + 1);
  f.push({ idx: topRing, n: [0, 0, 1], c: color, tone: 1.12 });
  return { v, f };
}

export function transformMesh(mesh, dx, dy, dz, rotZ = 0, rotX = 0) {
  const cz = Math.cos(rotZ), sz = Math.sin(rotZ);
  const cx = Math.cos(rotX), sx = Math.sin(rotX);
  const v = mesh.v.map((p) => {
    let x = p[0], y = p[1], z = p[2];
    if (rotX !== 0) {
      const ny = y * cx - z * sx;
      const nz = y * sx + z * cx;
      y = ny; z = nz;
    }
    if (rotZ !== 0) {
      const nx = x * cz - y * sz;
      const ny = x * sz + y * cz;
      x = nx; y = ny;
    }
    return [x + dx, y + dy, z + dz];
  });
  const f = mesh.f.map((face) => {
    let nx = face.n[0], ny = face.n[1], nz = face.n[2];
    if (rotX !== 0) {
      const rny = ny * cx - nz * sx;
      const rnz = ny * sx + nz * cx;
      ny = rny; nz = rnz;
    }
    if (rotZ !== 0) {
      const rnx = nx * cz - ny * sz;
      const rny = nx * sz + ny * cz;
      nx = rnx; ny = rny;
    }
    return { idx: face.idx.slice(), n: [nx, ny, nz], c: face.c, tone: face.tone };
  });
  return { v, f };
}

export function mergeMeshes(list) {
  const v = [];
  const f = [];
  let offset = 0;
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    for (let j = 0; j < m.v.length; j++) v.push(m.v[j]);
    for (let j = 0; j < m.f.length; j++) {
      const face = m.f[j];
      f.push({
        idx: face.idx.map((k) => k + offset),
        n: face.n,
        c: face.c,
        tone: face.tone
      });
    }
    offset += m.v.length;
  }
  return { v, f };
}

/* Articulated Low-Poly Baseball or Cricket Player */
export function buildPlayerMesh(opts) {
  const jersey = opts.jersey || "#3b82f6";
  const accent = opts.accent || "#f8fafc";
  const pants = opts.pants || "#f1f5f9";
  const cap = opts.cap || jersey;
  const skin = opts.skin || "#f1c27d";
  const stride = opts.stride || 0;
  const slide = opts.sliding || false;
  const batColor = opts.batColor || null;
  const gripColor = opts.gripColor || "#1e293b";
  const swingAng = opts.swingAngle || 0;
  const isCricket = !!opts.isCricket;
  const hasPads = !!opts.hasPads;
  const armRaise = opts.armRaise || 0; // pitcher/bowler windup arm angle

  if (slide) {
    const slideParts = [
      transformMesh(boxMesh(0.52, 1.15, 0.34, jersey), 0, 0, 0.25),
      transformMesh(boxMesh(0.42, 0.85, 0.28, hasPads ? "#f8fafc" : pants), 0, -0.85, 0.22),
      transformMesh(prismMesh(6, 0.22, 0.20, 0.36, skin), 0, 0.68, 0.22),
      transformMesh(prismMesh(6, 0.24, 0.18, 0.18, cap), 0, 0.68, 0.52)
    ];
    if (batColor && isCricket) {
      // Extended bat reaching for the crease!
      slideParts.push(transformMesh(boxMesh(0.14, 0.85, 0.06, batColor), 0.18, 1.25, 0.16));
    }
    return mergeMeshes(slideParts);
  }

  const legL = Math.sin(stride) * 0.28;
  const legR = -legL;
  const legColor = hasPads ? "#ffffff" : pants;
  const legW = hasPads ? 0.26 : 0.21;

  const parts = [
    // Cleats
    transformMesh(boxMesh(0.22, 0.30, 0.14, "#0f172a"), -0.17, legL + 0.03, 0.07),
    transformMesh(boxMesh(0.22, 0.30, 0.14, "#0f172a"),  0.17, legR + 0.03, 0.07),
    // Legs / Cricket Batting Pads
    transformMesh(boxMesh(legW, 0.24, 0.68, legColor), -0.17, legL, 0.44),
    transformMesh(boxMesh(legW, 0.24, 0.68, legColor),  0.17, legR, 0.44),
    // Belt / Waist trim
    transformMesh(boxMesh(0.58, 0.36, 0.10, "#1e293b"), 0, 0, 0.78),
    // Torso (faceted jersey)
    transformMesh(prismMesh(6, 0.30, 0.37, 0.76, jersey), 0, 0, 0.80),
    // Chest accent stripe
    transformMesh(boxMesh(0.46, 0.36, 0.14, accent), 0, 0.04, 1.24),
    // Left arm
    transformMesh(boxMesh(0.17, 0.17, 0.54, jersey), -0.39, -legL * 0.55, 1.18),
    // Right arm (raises during pitch/bowl windup!)
    transformMesh(
      boxMesh(0.17, 0.17, 0.54, jersey),
      0.39,
      legL * 0.55 + Math.sin(armRaise) * 0.25,
      1.18 + Math.max(0, Math.sin(armRaise)) * 0.42,
      0,
      armRaise
    ),
    // Hands / Batting gloves
    transformMesh(boxMesh(0.14, 0.14, 0.14, batColor ? "#f8fafc" : skin), -0.39, -legL * 0.55, 0.88),
    transformMesh(boxMesh(0.14, 0.14, 0.14, batColor ? "#f8fafc" : skin),  0.39,  legL * 0.55, 0.88 + Math.max(0, Math.sin(armRaise)) * 0.42),
    // Head
    transformMesh(prismMesh(6, 0.21, 0.21, 0.34, skin), 0, 0, 1.56),
    // Helmet / Cap
    transformMesh(prismMesh(6, 0.25, 0.19, 0.22, cap), 0, 0, 1.84),
    // Visor
    transformMesh(boxMesh(0.28, 0.22, 0.06, cap), 0, 0.20, 1.85)
  ];

  // Cricket Helmet Protective Grille
  if (isCricket && batColor) {
    parts.push(transformMesh(boxMesh(0.26, 0.12, 0.14, "#64748b"), 0, 0.22, 1.68));
  }

  if (batColor) {
    if (isCricket) {
      // Authentic Flat Willow Cricket Bat: handle + wide flat blade
      const handle = prismMesh(6, 0.032, 0.034, 0.34, gripColor);
      const blade = boxMesh(0.14, 0.055, 0.66, batColor);
      const cricketBat = mergeMeshes([
        transformMesh(handle, 0, 0, 0),
        transformMesh(blade, 0, 0, 0.64)
      ]);
      parts.push(transformMesh(cricketBat, 0.34, 0.22, 1.10, swingAng, 1.48));
    } else {
      // Tapered 3D Baseball Bat: grip + barrel
      const grip = prismMesh(6, 0.035, 0.044, 0.38, gripColor);
      const barrel = prismMesh(6, 0.046, 0.088, 0.80, batColor);
      const baseballBat = mergeMeshes([
        transformMesh(grip, 0, 0, 0),
        transformMesh(barrel, 0, 0, 0.36)
      ]);
      parts.push(transformMesh(baseballBat, 0.36, 0.18, 1.25, swingAng, 1.15));
    }
  }

  return mergeMeshes(parts);
}

/* 3D Cricket Stumps & Bails (3 vertical wooden poles + 2 horizontal bails) */
export function buildStumpsMesh(broken = false) {
  const wood = "#f5d08a";
  const bail = "#ef4444";
  if (broken) {
    // Scattered stumps when BOWLED!
    return mergeMeshes([
      transformMesh(prismMesh(5, 0.025, 0.025, 0.72, wood), -0.14, -0.18, 0.06, 0.4, 1.25),
      transformMesh(prismMesh(5, 0.025, 0.025, 0.72, wood),  0.02, -0.34, 0.08, -0.3, 1.45),
      transformMesh(prismMesh(5, 0.025, 0.025, 0.72, wood),  0.16, -0.10, 0.05, 0.15, 0.65)
    ]);
  }
  return mergeMeshes([
    transformMesh(prismMesh(5, 0.024, 0.024, 0.74, wood), -0.11, 0, 0),
    transformMesh(prismMesh(5, 0.024, 0.024, 0.74, wood),  0.00, 0, 0),
    transformMesh(prismMesh(5, 0.024, 0.024, 0.74, wood),  0.11, 0, 0),
    // Two bails on top
    transformMesh(boxMesh(0.11, 0.032, 0.032, bail), -0.055, 0, 0.755),
    transformMesh(boxMesh(0.11, 0.032, 0.032, bail),  0.055, 0, 0.755)
  ]);
}

/* Low-Poly Pine Tree for outer stadium skyline */
export function buildTreeMesh(scale = 1.0) {
  const trunk = prismMesh(5, 0.35 * scale, 0.25 * scale, 2.2 * scale, "#5c3a21");
  const tier1 = prismMesh(6, 2.1 * scale, 0.3 * scale, 3.6 * scale, "#14532d");
  const tier2 = prismMesh(6, 1.6 * scale, 0.15 * scale, 3.0 * scale, "#166534");
  return mergeMeshes([
    trunk,
    transformMesh(tier1, 0, 0, 1.8 * scale),
    transformMesh(tier2, 0, 0, 4.0 * scale)
  ]);
}
