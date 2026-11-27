/* ===== MORFALIA 3D · Procedural Low-Poly Cozy Sculptures ===== */
import * as THREE from '../../vendor/three.module.js';
import { CROPS } from '../data/items.js';

const matCache = new Map();
export function getMat(color, opts = {}) {
  const key = `${color}|${opts.roughness ?? 0.65}|${opts.metalness ?? 0.05}|${opts.emissive ?? 0}|${opts.emissiveIntensity ?? 0}|${opts.opacity ?? 1}`;
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.65,
    metalness: opts.metalness ?? 0.05,
    emissive: opts.emissive ? new THREE.Color(opts.emissive) : new THREE.Color(0x000000),
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: opts.opacity !== undefined && opts.opacity < 1,
    opacity: opts.opacity ?? 1
  });
  matCache.set(key, m);
  return m;
}

function addPart(group, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, cast = true) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function addEyes(group, y, z, spacing = 0.11, size = 0.042) {
  const eyeMat = getMat(0x1f152e, { roughness: 0.15 });
  const hiMat = getMat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.4, roughness: 0.1 });
  const cheekMat = getMat(0xff9ac2, { roughness: 0.5, opacity: 0.85 });
  const eyeGeo = new THREE.SphereGeometry(size, 10, 8);
  const hiGeo = new THREE.SphereGeometry(size * 0.34, 6, 6);
  const cheekGeo = new THREE.SphereGeometry(size * 0.85, 8, 6);

  for (const s of [-1, 1]) {
    addPart(group, eyeGeo, eyeMat, s * spacing, y, z, 0, 0, 0, false);
    addPart(group, hiGeo, hiMat, s * spacing - 0.012, y + 0.015, z + size * 0.72, 0, 0, 0, false);
    const ch = addPart(group, cheekGeo, cheekMat, s * (spacing + 0.085), y - 0.055, z - 0.02, 0, 0, 0, false);
    ch.scale.set(1.25, 0.65, 0.5);
  }
}

/* ===== MIMO (Shapeshifter Protagonist) ===== */
export function createMimoMesh() {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xd0a8f7,
    roughness: 0.32,
    metalness: 0.06
  });

  // Soft plump pear-like blob body
  const torso = addPart(bodyGroup, new THREE.SphereGeometry(0.32, 18, 14), bodyMat, 0, 0.34, 0);
  torso.scale.set(1.04, 1.15, 0.96);

  // Cute stubby arms & feet
  const armGeo = new THREE.SphereGeometry(0.11, 10, 8);
  const leftArm = addPart(bodyGroup, armGeo, bodyMat, -0.32, 0.34, 0.04);
  leftArm.scale.set(1.1, 0.8, 0.8);
  const rightArm = addPart(bodyGroup, armGeo, bodyMat, 0.32, 0.34, 0.04);
  rightArm.scale.set(1.1, 0.8, 0.8);

  const footGeo = new THREE.SphereGeometry(0.105, 10, 8);
  const leftFoot = addPart(bodyGroup, footGeo, bodyMat, -0.14, 0.09, 0.04);
  leftFoot.scale.set(1, 0.7, 1.2);
  const rightFoot = addPart(bodyGroup, footGeo, bodyMat, 0.14, 0.09, 0.04);
  rightFoot.scale.set(1, 0.7, 1.2);

  // Twin leaf sprout on top of head
  const stemMat = getMat(0x459c52, { roughness: 0.5 });
  const leafMat = getMat(0x7be87f, { roughness: 0.45 });
  addPart(bodyGroup, new THREE.CylinderGeometry(0.022, 0.028, 0.15, 6), stemMat, 0, 0.72, 0);
  const leafGeo = new THREE.SphereGeometry(0.11, 10, 8);
  const l1 = addPart(bodyGroup, leafGeo, leafMat, -0.1, 0.8, 0, 0, 0, 0.45);
  l1.scale.set(1.25, 0.42, 0.7);
  const l2 = addPart(bodyGroup, leafGeo, leafMat, 0.1, 0.8, 0, 0, 0, -0.45);
  l2.scale.set(1.25, 0.42, 0.7);

  // Expressive dot eyes & blush
  addEyes(bodyGroup, 0.42, 0.27, 0.105, 0.04);

  // Cute smile arc
  const smile = addPart(
    bodyGroup,
    new THREE.TorusGeometry(0.055, 0.013, 6, 12, Math.PI),
    getMat(0x1f152e),
    0, 0.34, 0.285, 0, 0, Math.PI, false
  );
  smile.scale.set(1.1, 0.85, 1);

  // Morph elemental aura (hidden unless casting Mimic Power)
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0x79e087,
    transparent: true,
    opacity: 0.34,
    wireframe: false
  });
  const aura = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 12), auraMat);
  aura.position.y = 0.42;
  aura.visible = false;
  root.add(aura);

  root.userData = { bodyGroup, bodyMat, leftArm, rightArm, leftFoot, rightFoot, aura, auraMat };
  return root;
}

/* ===== PROF. INTRECCIO (Botanical Vine Mentor) ===== */
export function createProfessorMesh() {
  const root = new THREE.Group();
  const vineDark = getMat(0x2f6b43, { roughness: 0.7 });
  const vineMid = getMat(0x4a945f, { roughness: 0.65 });
  const vineBright = getMat(0x74c27c, { roughness: 0.55 });
  const scarfMat = getMat(0xe0a54a, { roughness: 0.6 });
  const goldMat = getMat(0xffe680, { roughness: 0.25, metalness: 0.5 });

  // Layered vine body
  addPart(root, new THREE.SphereGeometry(0.4, 16, 14), vineDark, 0, 0.44, 0);
  const tufts = [
    [-0.28, 0.62, 0.08, 0.19, vineMid],
    [0.28, 0.62, 0.08, 0.19, vineMid],
    [0, 0.78, -0.05, 0.22, vineBright],
    [-0.24, 0.32, -0.22, 0.18, vineMid],
    [0.24, 0.32, -0.22, 0.18, vineMid],
    [0, 0.52, -0.3, 0.2, vineDark]
  ];
  for (const [x, y, z, r, m] of tufts) {
    addPart(root, new THREE.SphereGeometry(r, 10, 8), m, x, y, z);
  }

  // Warm botanist scarf
  const scarf = addPart(root, new THREE.TorusGeometry(0.34, 0.075, 8, 18), scarfMat, 0, 0.28, 0, Math.PI / 2, 0, 0);
  scarf.scale.set(1.05, 1.05, 0.9);

  // Cute round spectacles
  const glassGeo = new THREE.TorusGeometry(0.095, 0.016, 8, 16);
  addPart(root, glassGeo, goldMat, -0.115, 0.5, 0.36, 0, 0, 0, false);
  addPart(root, glassGeo, goldMat, 0.115, 0.5, 0.36, 0, 0, 0, false);
  addPart(root, new THREE.CylinderGeometry(0.012, 0.012, 0.06, 6), goldMat, 0, 0.5, 0.36, 0, 0, Math.PI / 2, false);
  addEyes(root, 0.5, 0.35, 0.115, 0.036);

  // Floating golden quest beacon (!)
  const beacon = new THREE.Group();
  const beaconMat = getMat(0xffe066, { emissive: 0xffc833, emissiveIntensity: 0.7, roughness: 0.2 });
  addPart(beacon, new THREE.OctahedronGeometry(0.14, 0), beaconMat, 0, 1.25, 0, 0, 0, 0, false);
  root.add(beacon);

  root.userData = { beacon };
  return root;
}

/* ===== 24 ORIGINAL BIOMINI 3D SCULPTURES ===== */
export function createBiominoMesh(bio) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const mainMat = getMat(bio.bodyColor, { roughness: 0.45 });
  const accMat = getMat(bio.accentColor, { roughness: 0.45 });

  if (bio.shape === 'drop') {
    const base = addPart(body, new THREE.SphereGeometry(0.27, 14, 12), mainMat, 0, 0.28, 0);
    base.scale.set(1, 0.95, 1);
    addPart(body, new THREE.ConeGeometry(0.22, 0.34, 12), mainMat, 0, 0.52, 0);
    addPart(body, new THREE.SphereGeometry(0.08, 8, 8), accMat, 0, 0.68, 0);
    addEyes(body, 0.32, 0.24, 0.09, 0.034);
  } else if (bio.shape === 'golem') {
    addPart(body, new THREE.BoxGeometry(0.5, 0.46, 0.44), mainMat, 0, 0.32, 0);
    addPart(body, new THREE.BoxGeometry(0.14, 0.3, 0.16), accMat, -0.32, 0.26, 0);
    addPart(body, new THREE.BoxGeometry(0.14, 0.3, 0.16), accMat, 0.32, 0.26, 0);
    addPart(body, new THREE.OctahedronGeometry(0.14, 0), accMat, 0, 0.62, 0);
    addEyes(body, 0.36, 0.23, 0.11, 0.036);
  } else if (bio.shape === 'mushroom') {
    addPart(body, new THREE.CylinderGeometry(0.16, 0.2, 0.3, 12), getMat(0xf5ead6, { roughness: 0.6 }), 0, 0.16, 0);
    const capMat = getMat(bio.bodyColor, { emissive: bio.bodyColor, emissiveIntensity: 0.35, roughness: 0.35 });
    const cap = addPart(body, new THREE.SphereGeometry(0.34, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), capMat, 0, 0.28, 0);
    cap.scale.set(1.05, 0.85, 1.05);
    addPart(body, new THREE.SphereGeometry(0.07, 8, 6), accMat, -0.14, 0.48, 0.12);
    addPart(body, new THREE.SphereGeometry(0.06, 8, 6), accMat, 0.16, 0.44, 0.1);
    addEyes(body, 0.2, 0.18, 0.07, 0.03);
  } else if (bio.shape === 'winged') {
    addPart(body, new THREE.SphereGeometry(0.26, 14, 12), mainMat, 0, 0.42, 0);
    const wingGeo = new THREE.SphereGeometry(0.18, 10, 8);
    const lw = addPart(body, wingGeo, accMat, -0.32, 0.48, -0.04, 0, 0, 0.35);
    lw.scale.set(1.2, 0.35, 0.75);
    const rw = addPart(body, wingGeo, accMat, 0.32, 0.48, -0.04, 0, 0, -0.35);
    rw.scale.set(1.2, 0.35, 0.75);
    addEyes(body, 0.45, 0.23, 0.09, 0.034);
    body.userData.wings = [lw, rw];
  } else if (bio.shape === 'flame') {
    const fMat = getMat(bio.bodyColor, { emissive: bio.bodyColor, emissiveIntensity: 0.35, roughness: 0.3 });
    addPart(body, new THREE.SphereGeometry(0.27, 14, 12), fMat, 0, 0.28, 0);
    addPart(body, new THREE.ConeGeometry(0.18, 0.34, 10), getMat(bio.accentColor, { emissive: bio.accentColor, emissiveIntensity: 0.5 }), 0, 0.56, 0);
    addEyes(body, 0.32, 0.24, 0.09, 0.034);
  } else if (bio.shape === 'horned') {
    const torso = addPart(body, new THREE.SphereGeometry(0.28, 14, 12), mainMat, 0, 0.34, 0);
    torso.scale.set(0.95, 1.1, 1.15);
    addPart(body, new THREE.ConeGeometry(0.06, 0.24, 8), accMat, -0.14, 0.65, 0.02, 0, 0, 0.28);
    addPart(body, new THREE.ConeGeometry(0.06, 0.24, 8), accMat, 0.14, 0.65, 0.02, 0, 0, -0.28);
    addEyes(body, 0.38, 0.28, 0.095, 0.034);
  } else if (bio.shape === 'crab') {
    const shell = addPart(body, new THREE.SphereGeometry(0.29, 14, 10), mainMat, 0, 0.24, 0);
    shell.scale.set(1.2, 0.75, 0.95);
    addPart(body, new THREE.SphereGeometry(0.11, 8, 8), accMat, -0.34, 0.28, 0.16);
    addPart(body, new THREE.SphereGeometry(0.11, 8, 8), accMat, 0.34, 0.28, 0.16);
    addEyes(body, 0.32, 0.23, 0.1, 0.032);
  } else if (bio.shape === 'star') {
    addPart(body, new THREE.SphereGeometry(0.24, 12, 10), mainMat, 0, 0.34, 0);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      addPart(body, new THREE.ConeGeometry(0.09, 0.22, 6), accMat, Math.cos(a) * 0.24, 0.34 + Math.sin(a) * 0.24, 0, 0, 0, a - Math.PI / 2);
    }
    addEyes(body, 0.36, 0.22, 0.08, 0.032);
  } else {
    // round_leaf, round_ear, spiky, frog
    addPart(body, new THREE.SphereGeometry(0.28, 16, 12), mainMat, 0, 0.3, 0);
    if (bio.shape === 'round_ear' || bio.shape === 'frog') {
      addPart(body, new THREE.SphereGeometry(0.1, 10, 8), accMat, -0.18, 0.56, 0);
      addPart(body, new THREE.SphereGeometry(0.1, 10, 8), accMat, 0.18, 0.56, 0);
    } else if (bio.shape === 'spiky') {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        addPart(body, new THREE.ConeGeometry(0.08, 0.2, 6), accMat, Math.cos(a) * 0.2, 0.44, Math.sin(a) * 0.2, Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
      }
    } else {
      const lf = new THREE.SphereGeometry(0.11, 10, 8);
      const a = addPart(body, lf, accMat, -0.1, 0.6, 0, 0, 0, 0.4);
      a.scale.set(1.2, 0.4, 0.7);
      const b = addPart(body, lf, accMat, 0.1, 0.6, 0, 0, 0, -0.4);
      b.scale.set(1.2, 0.4, 0.7);
    }
    addEyes(body, 0.34, 0.25, 0.095, 0.034);
  }

  // Floating Gift Box indicator when creature has a passive gift!
  const giftBox = new THREE.Group();
  addPart(giftBox, new THREE.BoxGeometry(0.22, 0.22, 0.22), getMat(0xffdf6b, { emissive: 0xffb833, emissiveIntensity: 0.45 }), 0, 0.96, 0, 0, 0, 0, false);
  addPart(giftBox, new THREE.BoxGeometry(0.24, 0.06, 0.07), getMat(0xff6b8b), 0, 0.96, 0, 0, 0, 0, false);
  giftBox.visible = false;
  root.add(giftBox);

  root.userData = { body, giftBox };
  return root;
}

/* ===== WORLD OBJECTS, LANDMARKS, FURNITURE, CROPS & NODES ===== */
export function createObjectMesh(obj) {
  const g = new THREE.Group();
  const type = obj.type;

  // 1. Sanctuary Landmark
  if (type === 'sanctuary') {
    const rep = !!obj.repaired;
    const stone = getMat(rep ? 0xf2ebd9 : 0x7b7870, { roughness: 0.6 });
    const roof = getMat(rep ? 0x56c77d : 0x5c5953, { roughness: 0.45 });
    const crys = getMat(rep ? 0xffe46b : 0x999287, {
      emissive: rep ? 0xffd24d : 0x000000,
      emissiveIntensity: rep ? 0.75 : 0,
      roughness: 0.2
    });
    // Stepped plinth
    addPart(g, new THREE.BoxGeometry(1.4, 0.22, 1.4), stone, 0, 0.11, 0);
    // 4 pillars
    for (const sx of [-0.5, 0.5]) {
      for (const sz of [-0.5, 0.5]) {
        addPart(g, new THREE.CylinderGeometry(0.11, 0.13, 0.95, 8), stone, sx, 0.65, sz);
      }
    }
    // Domed pavilion roof
    const dome = addPart(g, new THREE.SphereGeometry(0.76, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), roof, 0, 1.05, 0);
    dome.scale.set(1.05, 0.72, 1.05);
    // Floating central crystal
    const orb = addPart(g, new THREE.OctahedronGeometry(0.24, 0), crys, 0, 0.72, 0);
    g.userData.floatPart = orb;
    return g;
  }

  // 2. Custodian Lore Capsule
  if (type === 'lore_capsule') {
    const m = getMat(obj.read ? 0x87a4b8 : 0xffdf66, {
      emissive: obj.read ? 0x3a5b73 : 0xffbd33,
      emissiveIntensity: obj.read ? 0.25 : 0.75,
      roughness: 0.2
    });
    addPart(g, new THREE.CylinderGeometry(0.22, 0.28, 0.14, 10), getMat(0x636b73), 0, 0.07, 0);
    const gem = addPart(g, new THREE.OctahedronGeometry(0.24, 0), m, 0, 0.52, 0);
    gem.scale.set(0.85, 1.3, 0.85);
    g.userData.floatPart = gem;
    return g;
  }

  // 3. Cracked Glass Terrarium
  if (type === 'terrarium') {
    addPart(g, new THREE.CylinderGeometry(0.42, 0.48, 0.18, 14), getMat(0x7c858c), 0, 0.09, 0);
    addPart(g, new THREE.SphereGeometry(0.4, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), getMat(0xa8ebff, { opacity: 0.45, roughness: 0.1 }), 0, 0.16, 0);
    addPart(g, new THREE.SphereGeometry(0.12, 8, 8), getMat(0x76d67a), 0, 0.24, 0);
    return g;
  }

  // 4. Crops (3 growth stages)
  if (type === 'crop') {
    const crop = CROPS[obj.cropId] || CROPS.turnip;
    const leafM = getMat(0x55bf5e, { roughness: 0.55 });
    const fruitM = getMat(crop.color, { roughness: 0.35, emissive: obj.stage >= 2 ? crop.color : 0x000000, emissiveIntensity: obj.stage >= 2 ? 0.25 : 0 });
    if (obj.stage === 0) {
      addPart(g, new THREE.SphereGeometry(0.1, 8, 6), leafM, -0.08, 0.1, 0);
      addPart(g, new THREE.SphereGeometry(0.1, 8, 6), leafM, 0.08, 0.12, 0.05);
    } else if (obj.stage === 1) {
      addPart(g, new THREE.SphereGeometry(0.22, 10, 8), leafM, 0, 0.18, 0);
      addPart(g, new THREE.SphereGeometry(0.14, 8, 8), leafM, 0.14, 0.24, -0.08);
    } else {
      addPart(g, new THREE.SphereGeometry(0.26, 10, 8), leafM, 0, 0.2, 0);
      addPart(g, new THREE.SphereGeometry(0.14, 10, 8), fruitM, -0.14, 0.34, 0.1);
      addPart(g, new THREE.SphereGeometry(0.13, 10, 8), fruitM, 0.14, 0.32, -0.08);
      addPart(g, new THREE.SphereGeometry(0.12, 10, 8), fruitM, 0, 0.42, 0.04);
    }
    return g;
  }

  // 5. Natural Obstacles
  if (type === 'dead_tree') {
    const bark = getMat(0x6b503a, { roughness: 0.85 });
    addPart(g, new THREE.CylinderGeometry(0.12, 0.18, 0.95, 8), bark, 0, 0.48, 0);
    addPart(g, new THREE.CylinderGeometry(0.05, 0.08, 0.48, 6), bark, -0.18, 0.78, 0, 0, 0, 0.7);
    addPart(g, new THREE.CylinderGeometry(0.05, 0.08, 0.45, 6), bark, 0.18, 0.82, 0.06, 0.2, 0, -0.65);
    return g;
  }
  if (type === 'boulder') {
    const rk = getMat(0x7c7a82, { roughness: 0.85 });
    const main = addPart(g, new THREE.DodecahedronGeometry(0.42, 0), rk, 0, 0.32, 0);
    main.scale.set(1.1, 0.82, 0.95);
    addPart(g, new THREE.DodecahedronGeometry(0.22, 0), getMat(0x94919c, { roughness: 0.8 }), 0.24, 0.18, 0.2);
    return g;
  }
  if (type === 'bramble') {
    const br = getMat(0x4f3c4a, { roughness: 0.85 });
    const th = getMat(0x9c5772, { roughness: 0.6 });
    addPart(g, new THREE.DodecahedronGeometry(0.28, 0), br, -0.16, 0.22, 0.08);
    addPart(g, new THREE.DodecahedronGeometry(0.26, 0), br, 0.18, 0.2, -0.05);
    addPart(g, new THREE.DodecahedronGeometry(0.25, 0), br, 0, 0.36, 0);
    addPart(g, new THREE.SphereGeometry(0.07, 6, 6), th, -0.14, 0.38, 0.18);
    addPart(g, new THREE.SphereGeometry(0.07, 6, 6), th, 0.18, 0.32, 0.14);
    return g;
  }

  // 6. Craftable Structures & Furniture
  if (type === 'campfire') {
    const rk = getMat(0x7d7973, { roughness: 0.85 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      addPart(g, new THREE.SphereGeometry(0.11, 7, 6), rk, Math.cos(a) * 0.32, 0.08, Math.sin(a) * 0.32);
    }
    const log = getMat(0x6b4528, { roughness: 0.8 });
    addPart(g, new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), log, 0, 0.12, 0, 0, 0.4, Math.PI / 2);
    addPart(g, new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), log, 0, 0.14, 0, 0, -0.8, Math.PI / 2);
    if (obj.lit !== false) {
      const fl1 = addPart(g, new THREE.ConeGeometry(0.2, 0.44, 8), getMat(0xff793b, { emissive: 0xff5a1f, emissiveIntensity: 0.8 }), 0, 0.34, 0, 0, 0, 0, false);
      const fl2 = addPart(g, new THREE.ConeGeometry(0.11, 0.3, 8), getMat(0xffe46b, { emissive: 0xffcc33, emissiveIntensity: 0.9 }), 0, 0.3, 0, 0, 0, 0, false);
      g.userData.flames = [fl1, fl2];
    }
    return g;
  }
  if (type === 'log_bench') {
    const wd = getMat(0x8c5d37, { roughness: 0.8 });
    addPart(g, new THREE.CylinderGeometry(0.16, 0.16, 0.78, 10), wd, 0, 0.2, 0, 0, 0, Math.PI / 2);
    addPart(g, new THREE.BoxGeometry(0.12, 0.18, 0.24), getMat(0x613e22), -0.26, 0.09, 0);
    addPart(g, new THREE.BoxGeometry(0.12, 0.18, 0.24), getMat(0x613e22), 0.26, 0.09, 0);
    return g;
  }
  if (type === 'flower_bed') {
    addPart(g, new THREE.BoxGeometry(0.72, 0.2, 0.56), getMat(0x9e6c45), 0, 0.1, 0);
    addPart(g, new THREE.BoxGeometry(0.62, 0.08, 0.46), getMat(0x523622), 0, 0.2, 0);
    const cols = [0xff8db5, 0xffe46b, 0x8be4ff, 0xff9d73];
    for (let i = 0; i < 4; i++) {
      addPart(g, new THREE.SphereGeometry(0.11, 8, 6), getMat(cols[i]), -0.2 + i * 0.13, 0.34 + (i % 2) * 0.05, (i % 2 ? 0.08 : -0.08));
    }
    return g;
  }
  if (type === 'workbench') {
    const wd = getMat(0xa87648);
    addPart(g, new THREE.BoxGeometry(0.82, 0.1, 0.56), wd, 0, 0.48, 0);
    for (const sx of [-0.32, 0.32]) {
      for (const sz of [-0.2, 0.2]) {
        addPart(g, new THREE.BoxGeometry(0.09, 0.46, 0.09), getMat(0x78502e), sx, 0.23, sz);
      }
    }
    addPart(g, new THREE.BoxGeometry(0.24, 0.08, 0.14), getMat(0x95a5b5, { metalness: 0.4 }), -0.18, 0.56, 0);
    return g;
  }
  if (type === 'furnace') {
    addPart(g, new THREE.CylinderGeometry(0.32, 0.4, 0.68, 10), getMat(0x9e5942, { roughness: 0.8 }), 0, 0.34, 0);
    addPart(g, new THREE.CylinderGeometry(0.12, 0.15, 0.3, 8), getMat(0x7d4534), 0, 0.78, 0);
    addPart(g, new THREE.SphereGeometry(0.15, 8, 8), getMat(0xff943d, { emissive: 0xff6a1a, emissiveIntensity: 0.8 }), 0, 0.22, 0.3, 0, 0, 0, false);
    return g;
  }
  if (type === 'kitchen') {
    addPart(g, new THREE.BoxGeometry(0.8, 0.52, 0.56), getMat(0xb88b5a), 0, 0.26, 0);
    addPart(g, new THREE.CylinderGeometry(0.18, 0.16, 0.18, 10), getMat(0x474f59, { metalness: 0.5 }), -0.14, 0.6, 0);
    addPart(g, new THREE.SphereGeometry(0.1, 8, 6), getMat(0xff7b7b), 0.2, 0.58, 0.05);
    return g;
  }
  if (type === 'lantern') {
    addPart(g, new THREE.CylinderGeometry(0.05, 0.07, 0.7, 6), getMat(0x5c422c), 0, 0.35, 0);
    addPart(g, new THREE.BoxGeometry(0.24, 0.28, 0.24), getMat(0xffe78f, { emissive: 0xffc94d, emissiveIntensity: 0.85, roughness: 0.2 }), 0, 0.76, 0);
    addPart(g, new THREE.ConeGeometry(0.22, 0.16, 4), getMat(0x473322), 0, 0.96, 0, 0, Math.PI / 4, 0);
    return g;
  }
  if (type === 'street_lamp') {
    addPart(g, new THREE.CylinderGeometry(0.05, 0.08, 1.25, 8), getMat(0x4e5966, { metalness: 0.4 }), 0, 0.62, 0);
    const glow = obj.powered || obj.lit;
    addPart(g, new THREE.SphereGeometry(0.18, 12, 10), getMat(0xfff4b0, { emissive: 0xffe46b, emissiveIntensity: glow ? 1.0 : 0.25 }), 0, 1.28, 0);
    return g;
  }
  if (type === 'generator') {
    addPart(g, new THREE.BoxGeometry(0.68, 0.52, 0.56), getMat(0x5b6c7d, { metalness: 0.35 }), 0, 0.26, 0);
    addPart(g, new THREE.CylinderGeometry(0.12, 0.12, 0.34, 8), getMat(0xffe059, { emissive: 0xffd026, emissiveIntensity: obj.powered ? 0.9 : 0.25 }), 0, 0.64, 0);
    return g;
  }
  if (type === 'windmill') {
    addPart(g, new THREE.CylinderGeometry(0.2, 0.34, 1.35, 10), getMat(0xd9ccb4), 0, 0.68, 0);
    addPart(g, new THREE.ConeGeometry(0.26, 0.28, 10), getMat(0xba594c), 0, 1.48, 0);
    const rotor = new THREE.Group();
    rotor.position.set(0, 1.22, 0.24);
    const sailMat = getMat(0xfff5de, { roughness: 0.5 });
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 0.03), sailMat);
      blade.position.y = 0.32;
      const pivot = new THREE.Group();
      pivot.rotation.z = (i * Math.PI) / 2;
      pivot.add(blade);
      rotor.add(pivot);
    }
    g.add(rotor);
    g.userData.rotor = rotor;
    return g;
  }
  if (type === 'fountain') {
    const st = getMat(0xcfd6d9, { roughness: 0.5 });
    addPart(g, new THREE.CylinderGeometry(0.46, 0.42, 0.24, 14), st, 0, 0.12, 0);
    addPart(g, new THREE.CylinderGeometry(0.38, 0.38, 0.05, 14), getMat(0x5ec6f2, { roughness: 0.15 }), 0, 0.24, 0);
    addPart(g, new THREE.CylinderGeometry(0.12, 0.16, 0.45, 10), st, 0, 0.44, 0);
    const jet = addPart(g, new THREE.SphereGeometry(0.16, 10, 8), getMat(0x9be6ff, { opacity: 0.85, emissive: 0x4db8e8, emissiveIntensity: 0.25 }), 0, 0.72, 0);
    g.userData.floatPart = jet;
    return g;
  }
  if (type === 'mushroom_lamp') {
    addPart(g, new THREE.CylinderGeometry(0.1, 0.14, 0.58, 10), getMat(0xe8dec8), 0, 0.29, 0);
    addPart(g, new THREE.SphereGeometry(0.36, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), getMat(0x6ff5bd, { emissive: 0x3ce8a3, emissiveIntensity: 0.75 }), 0, 0.54, 0);
    return g;
  }
  if (type === 'crystal_pillar') {
    addPart(g, new THREE.CylinderGeometry(0.28, 0.34, 0.2, 8), getMat(0x8899b5), 0, 0.1, 0);
    const cr = addPart(g, new THREE.OctahedronGeometry(0.32, 0), getMat(0xc8a6ff, { emissive: 0x9b70ff, emissiveIntensity: 0.7, roughness: 0.15 }), 0, 0.68, 0);
    cr.scale.set(0.72, 1.85, 0.72);
    g.userData.floatPart = cr;
    return g;
  }
  if (type === 'wood_house') {
    addPart(g, new THREE.BoxGeometry(0.95, 0.68, 0.85), getMat(0xc7905b), 0, 0.34, 0);
    const roof = addPart(g, new THREE.ConeGeometry(0.82, 0.55, 4), getMat(0xba5349), 0, 0.94, 0, 0, Math.PI / 4, 0);
    roof.scale.set(1.05, 1, 0.96);
    addPart(g, new THREE.BoxGeometry(0.24, 0.34, 0.06), getMat(0x634024), 0, 0.17, 0.44);
    addPart(g, new THREE.BoxGeometry(0.2, 0.2, 0.06), getMat(0xffe88c, { emissive: 0xffd24d, emissiveIntensity: 0.7 }), 0.28, 0.42, 0.44);
    return g;
  }
  if (type === 'prof_greenhouse') {
    addPart(g, new THREE.BoxGeometry(1.15, 0.18, 1.0), getMat(0xd9ceb8), 0, 0.09, 0);
    addPart(g, new THREE.BoxGeometry(1.05, 0.72, 0.9), getMat(0xb0f5e6, { opacity: 0.45, roughness: 0.1 }), 0, 0.52, 0);
    addPart(g, new THREE.CylinderGeometry(0.45, 0.45, 1.06, 12, 1, false, 0, Math.PI), getMat(0xc4fff0, { opacity: 0.48, roughness: 0.1 }), 0, 0.88, 0, 0, 0, Math.PI / 2);
    // Lush plants inside!
    addPart(g, new THREE.SphereGeometry(0.24, 10, 8), getMat(0x52c468), -0.22, 0.4, 0);
    addPart(g, new THREE.SphereGeometry(0.22, 10, 8), getMat(0x7be882), 0.22, 0.44, 0.1);
    addPart(g, new THREE.SphereGeometry(0.14, 8, 8), getMat(0xffe46b, { emissive: 0xffcc33, emissiveIntensity: 0.5 }), 0, 0.58, -0.1);
    return g;
  }
  if (type === 'picnic_table') {
    const wd = getMat(0xb5804e);
    addPart(g, new THREE.BoxGeometry(0.84, 0.08, 0.54), wd, 0, 0.4, 0);
    addPart(g, new THREE.BoxGeometry(0.76, 0.07, 0.18), wd, 0, 0.22, 0.36);
    addPart(g, new THREE.BoxGeometry(0.76, 0.07, 0.18), wd, 0, 0.22, -0.36);
    addPart(g, new THREE.BoxGeometry(0.1, 0.4, 0.46), getMat(0x825732), -0.28, 0.2, 0);
    addPart(g, new THREE.BoxGeometry(0.1, 0.4, 0.46), getMat(0x825732), 0.28, 0.2, 0);
    return g;
  }
  if (type === 'moss_statue') {
    addPart(g, new THREE.BoxGeometry(0.48, 0.18, 0.48), getMat(0x7c827b), 0, 0.09, 0);
    addPart(g, new THREE.CylinderGeometry(0.2, 0.24, 0.52, 8), getMat(0x8a9188), 0, 0.42, 0);
    addPart(g, new THREE.SphereGeometry(0.22, 10, 8), getMat(0x5ea867), 0, 0.72, 0);
    return g;
  }
  if (type === 'shell_arch') {
    addPart(g, new THREE.TorusGeometry(0.42, 0.1, 10, 18, Math.PI), getMat(0xffb5c8, { roughness: 0.35 }), 0, 0.12, 0);
    addPart(g, new THREE.SphereGeometry(0.12, 8, 8), getMat(0xfff0c4, { emissive: 0xffe49e, emissiveIntensity: 0.3 }), 0, 0.56, 0);
    return g;
  }
  if (type === 'beach_umbrella') {
    addPart(g, new THREE.CylinderGeometry(0.04, 0.04, 0.95, 6), getMat(0xd9c29c), 0, 0.48, 0);
    addPart(g, new THREE.ConeGeometry(0.55, 0.28, 8), getMat(0xff7d6b), 0, 0.96, 0);
    return g;
  }
  if (type === 'cozy_tent') {
    addPart(g, new THREE.ConeGeometry(0.54, 0.72, 5), getMat(0x72b88c), 0, 0.36, 0);
    addPart(g, new THREE.ConeGeometry(0.2, 0.36, 3), getMat(0x2d4536), 0, 0.18, 0.32);
    return g;
  }
  if (type === 'botanic_shelf') {
    addPart(g, new THREE.BoxGeometry(0.76, 0.82, 0.32), getMat(0x8f623a), 0, 0.41, 0);
    addPart(g, new THREE.SphereGeometry(0.11, 8, 6), getMat(0x76de7d), -0.2, 0.62, 0.14);
    addPart(g, new THREE.SphereGeometry(0.11, 8, 6), getMat(0xff99bf), 0.18, 0.62, 0.14);
    addPart(g, new THREE.SphereGeometry(0.1, 8, 6), getMat(0xffe066), 0, 0.34, 0.14);
    return g;
  }

  // 7. Natural Collectible Resource Nodes (chunky colorful 3D pickups!)
  const nodeConfigs = {
    node_wood: () => {
      addPart(g, new THREE.CylinderGeometry(0.08, 0.09, 0.56, 7), getMat(0x8c5c34), 0, 0.12, 0, 0, 0.4, Math.PI / 2);
      addPart(g, new THREE.CylinderGeometry(0.07, 0.08, 0.46, 7), getMat(0xa36e40), 0.05, 0.2, 0.08, 0, -0.5, Math.PI / 2);
    },
    node_stone: () => {
      addPart(g, new THREE.DodecahedronGeometry(0.22, 0), getMat(0x9699a1), -0.1, 0.16, 0);
      addPart(g, new THREE.DodecahedronGeometry(0.16, 0), getMat(0xb2b5bd), 0.14, 0.12, 0.1);
    },
    node_clay: () => {
      addPart(g, new THREE.SphereGeometry(0.22, 10, 8), getMat(0xc47b56), 0, 0.15, 0);
      addPart(g, new THREE.SphereGeometry(0.14, 8, 6), getMat(0xd68f69), 0.16, 0.1, 0.08);
    },
    node_berry: () => {
      addPart(g, new THREE.SphereGeometry(0.28, 10, 8), getMat(0x479651), 0, 0.24, 0);
      for (const [bx, by, bz] of [[-0.14, 0.32, 0.18], [0.14, 0.34, 0.14], [0, 0.42, -0.1]]) {
        addPart(g, new THREE.SphereGeometry(0.08, 8, 6), getMat(0x6488ff), bx, by, bz);
      }
    },
    node_herb: () => {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const lf = addPart(g, new THREE.ConeGeometry(0.09, 0.34, 6), getMat(0x6bd475), Math.cos(a) * 0.12, 0.18, Math.sin(a) * 0.12, Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4);
        lf.scale.set(1, 1, 0.5);
      }
    },
    node_sand: () => {
      addPart(g, new THREE.ConeGeometry(0.32, 0.28, 10), getMat(0xe8d39b), 0, 0.14, 0);
    },
    node_shell: () => {
      const sh = addPart(g, new THREE.SphereGeometry(0.22, 10, 8), getMat(0xffd0dc, { roughness: 0.3 }), 0, 0.16, 0);
      sh.scale.set(1.2, 0.65, 1);
    },
    node_iron: () => {
      addPart(g, new THREE.DodecahedronGeometry(0.26, 0), getMat(0x6f7a8a, { metalness: 0.45, roughness: 0.4 }), 0, 0.2, 0);
      addPart(g, new THREE.BoxGeometry(0.14, 0.14, 0.14), getMat(0xd99b52, { metalness: 0.6 }), 0.12, 0.3, 0.1);
    },
    node_spark: () => {
      const sp = addPart(g, new THREE.OctahedronGeometry(0.2, 0), getMat(0xffe659, { emissive: 0xffd026, emissiveIntensity: 0.75 }), 0, 0.3, 0);
      g.userData.floatPart = sp;
    },
    node_mushroom: () => {
      addPart(g, new THREE.CylinderGeometry(0.07, 0.09, 0.2, 8), getMat(0xf0e6d2), 0, 0.1, 0);
      addPart(g, new THREE.SphereGeometry(0.22, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), getMat(0x6bf5b8, { emissive: 0x3ce69c, emissiveIntensity: 0.55 }), 0, 0.19, 0);
    },
    node_pollen: () => {
      const fl = addPart(g, new THREE.DodecahedronGeometry(0.2, 0), getMat(0xffe059, { emissive: 0xffc833, emissiveIntensity: 0.4 }), 0, 0.26, 0);
      g.userData.floatPart = fl;
    },
    node_crystal: () => {
      const cr = addPart(g, new THREE.OctahedronGeometry(0.24, 0), getMat(0xb5d4ff, { emissive: 0x9980ff, emissiveIntensity: 0.65, roughness: 0.15 }), 0, 0.32, 0);
      cr.scale.set(0.75, 1.5, 0.75);
      g.userData.floatPart = cr;
    }
  };

  if (nodeConfigs[type]) {
    nodeConfigs[type]();
  } else {
    addPart(g, new THREE.BoxGeometry(0.45, 0.45, 0.45), getMat(0x9be3a8), 0, 0.22, 0);
  }
  return g;
}
