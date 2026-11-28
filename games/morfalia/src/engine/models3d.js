/* ===== MORFALIA 3D · Detailed Procedural Cozy Sculptures ===== */
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

function addEyes(group, y, z, spacing = 0.11, size = 0.042, eyeColor = 0x1f152e) {
  const eyeMat = getMat(eyeColor, { roughness: 0.15 });
  const hiMat = getMat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.45, roughness: 0.1 });
  const cheekMat = getMat(0xff9ac2, { roughness: 0.5, opacity: 0.85 });
  const eyeGeo = new THREE.SphereGeometry(size, 10, 8);
  const hiGeo = new THREE.SphereGeometry(size * 0.36, 6, 6);
  const cheekGeo = new THREE.SphereGeometry(size * 0.85, 8, 6);

  for (const s of [-1, 1]) {
    addPart(group, eyeGeo, eyeMat, s * spacing, y, z, 0, 0, 0, false);
    addPart(group, hiGeo, hiMat, s * spacing - 0.012, y + 0.015, z + size * 0.75, 0, 0, 0, false);
    const ch = addPart(group, cheekGeo, cheekMat, s * (spacing + 0.08), y - 0.055, z - 0.015, 0, 0, 0, false);
    ch.scale.set(1.25, 0.65, 0.5);
  }
}

function addPaws(group, mat, rx = 0.14, rz = 0.12, y = 0.06, r = 0.065) {
  const g = new THREE.SphereGeometry(r, 8, 6);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const p = addPart(group, g, mat, sx * rx, y, sz * rz);
      p.scale.set(0.95, 0.72, 1.25);
    }
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

  const torso = addPart(bodyGroup, new THREE.SphereGeometry(0.32, 18, 14), bodyMat, 0, 0.34, 0);
  torso.scale.set(1.04, 1.15, 0.96);

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

  const stemMat = getMat(0x459c52, { roughness: 0.5 });
  const leafMat = getMat(0x7be87f, { roughness: 0.45 });
  addPart(bodyGroup, new THREE.CylinderGeometry(0.022, 0.028, 0.15, 6), stemMat, 0, 0.72, 0);
  const leafGeo = new THREE.SphereGeometry(0.11, 10, 8);
  const l1 = addPart(bodyGroup, leafGeo, leafMat, -0.1, 0.8, 0, 0, 0, 0.45);
  l1.scale.set(1.25, 0.42, 0.7);
  const l2 = addPart(bodyGroup, leafGeo, leafMat, 0.1, 0.8, 0, 0, 0, -0.45);
  l2.scale.set(1.25, 0.42, 0.7);

  addEyes(bodyGroup, 0.42, 0.27, 0.105, 0.04);

  const smile = addPart(
    bodyGroup,
    new THREE.TorusGeometry(0.055, 0.013, 6, 12, Math.PI),
    getMat(0x1f152e),
    0, 0.34, 0.285, 0, 0, Math.PI, false
  );
  smile.scale.set(1.1, 0.85, 1);

  const auraMat = new THREE.MeshBasicMaterial({
    color: 0x79e087,
    transparent: true,
    opacity: 0.34
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

  const scarf = addPart(root, new THREE.TorusGeometry(0.34, 0.075, 8, 18), scarfMat, 0, 0.28, 0, Math.PI / 2, 0, 0);
  scarf.scale.set(1.05, 1.05, 0.9);

  const glassGeo = new THREE.TorusGeometry(0.095, 0.016, 8, 16);
  addPart(root, glassGeo, goldMat, -0.115, 0.5, 0.36, 0, 0, 0, false);
  addPart(root, glassGeo, goldMat, 0.115, 0.5, 0.36, 0, 0, 0, false);
  addPart(root, new THREE.CylinderGeometry(0.012, 0.012, 0.06, 6), goldMat, 0, 0.5, 0.36, 0, 0, Math.PI / 2, false);
  addEyes(root, 0.5, 0.35, 0.115, 0.036);

  const beacon = new THREE.Group();
  const beaconMat = getMat(0xffe066, { emissive: 0xffc833, emissiveIntensity: 0.7, roughness: 0.2 });
  addPart(beacon, new THREE.OctahedronGeometry(0.14, 0), beaconMat, 0, 1.25, 0, 0, 0, 0, false);
  root.add(beacon);

  root.userData = { beacon };
  return root;
}

/* ===== 56 DETAILED SPECIES-ACCURATE BIOMINI 3D SCULPTURES ===== */
export function createBiominoMesh(bio) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const id = bio.id;
  const mainMat = getMat(bio.bodyColor, { roughness: 0.42 });
  const accMat = getMat(bio.accentColor, { roughness: 0.42 });
  const creamMat = getMat(0xf7efe0, { roughness: 0.55 });
  const darkMat = getMat(0x282130, { roughness: 0.4 });

  // --- 1. GRACEFUL STAGS & DEER (Astralio, Cerbiatto, Capriolo) ---
  if (id === 'astralio' || id === 'cerbiatto' || id === 'capriolo') {
    const torso = addPart(body, new THREE.SphereGeometry(0.24, 14, 12), mainMat, 0, 0.34, -0.04);
    torso.scale.set(0.85, 0.88, 1.38);
    addPaws(body, accMat, 0.13, 0.18, 0.12, 0.055);
    // Neck & Head
    addPart(body, new THREE.CylinderGeometry(0.09, 0.12, 0.26, 10), mainMat, 0, 0.52, 0.18, -0.35, 0, 0);
    const head = addPart(body, new THREE.SphereGeometry(0.17, 14, 12), mainMat, 0, 0.64, 0.24);
    head.scale.set(0.95, 0.9, 1.12);
    // Ears
    addPart(body, new THREE.ConeGeometry(0.05, 0.15, 6), accMat, -0.14, 0.74, 0.19, 0, 0, 0.65);
    addPart(body, new THREE.ConeGeometry(0.05, 0.15, 6), accMat, 0.14, 0.74, 0.19, 0, 0, -0.65);
    // Antlers / Horns
    const hornMat = id === 'astralio' ? getMat(bio.accentColor, { emissive: bio.accentColor, emissiveIntensity: 0.45 }) : accMat;
    for (const s of [-1, 1]) {
      addPart(body, new THREE.CylinderGeometry(0.022, 0.032, 0.3, 6), hornMat, s * 0.09, 0.86, 0.22, -0.2, 0, -s * 0.3);
      if (id !== 'capriolo') {
        addPart(body, new THREE.CylinderGeometry(0.016, 0.022, 0.18, 6), hornMat, s * 0.17, 0.94, 0.2, 0, 0, -s * 0.75);
      }
    }
    if (id === 'astralio') {
      addPart(body, new THREE.OctahedronGeometry(0.08, 0), hornMat, 0, 0.42, 0.22, 0, 0, 0, false);
    }
    addPart(body, new THREE.SphereGeometry(0.075, 8, 6), creamMat, 0, 0.38, -0.35);
    addEyes(body, 0.66, 0.39, 0.075, 0.03);
  }
  // --- 2. FOXES, SQUIRRELS & ELECTRIC PUPS (Cristallino, Volpombra, Voltacchio, Scintillino, Ghirino) ---
  else if (id === 'cristallino' || id === 'volpombra' || id === 'voltacchio' || id === 'scintillino' || id === 'ghirino') {
    const torso = addPart(body, new THREE.SphereGeometry(0.24, 14, 12), mainMat, 0, 0.28, -0.02);
    torso.scale.set(0.95, 0.9, 1.25);
    addPaws(body, accMat, 0.14, 0.14, 0.07, 0.06);
    // Head & pointed muzzle
    addPart(body, new THREE.SphereGeometry(0.2, 14, 12), mainMat, 0, 0.48, 0.14);
    const snout = addPart(body, new THREE.ConeGeometry(0.09, 0.16, 10), creamMat, 0, 0.44, 0.34, Math.PI / 2, 0, 0);
    addPart(body, new THREE.SphereGeometry(0.032, 6, 6), darkMat, 0, 0.45, 0.41);
    // Pointed Fox/Squirrel Ears
    for (const s of [-1, 1]) {
      addPart(body, new THREE.ConeGeometry(0.08, 0.24, 8), mainMat, s * 0.13, 0.68, 0.12, -0.1, 0, -s * 0.25);
      addPart(body, new THREE.ConeGeometry(0.045, 0.16, 6), accMat, s * 0.13, 0.67, 0.15, -0.1, 0, -s * 0.25, false);
    }
    // Fluffy curled tail
    const tail = addPart(body, new THREE.SphereGeometry(0.16, 12, 10), mainMat, 0, 0.38, -0.34);
    tail.scale.set(0.85, 1.35, 1.15);
    addPart(body, new THREE.SphereGeometry(0.11, 10, 8), accMat, 0, 0.54, -0.36);
    addEyes(body, 0.52, 0.31, 0.09, 0.032);
  }
  // --- 3. TURTLES & BEAVER (Tartamar, Fornacino, Castorino) ---
  else if (id === 'tartamar' || id === 'fornacino' || id === 'castorino') {
    const shell = addPart(body, new THREE.SphereGeometry(0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), mainMat, 0, 0.14, -0.02);
    shell.scale.set(1.05, 0.92, 1.2);
    addPart(body, new THREE.TorusGeometry(0.31, 0.05, 8, 18), accMat, 0, 0.15, -0.02, Math.PI / 2, 0, 0);
    addPaws(body, accMat, 0.22, 0.18, 0.07, 0.075);
    // Head
    addPart(body, new THREE.SphereGeometry(0.16, 12, 10), id === 'castorino' ? mainMat : accMat, 0, 0.28, 0.34);
    // Tail (flat paddle for castorino, fiery tip for fornacino)
    const tail = addPart(body, new THREE.BoxGeometry(0.18, 0.05, 0.28), darkMat, 0, 0.12, -0.44);
    if (id !== 'castorino') tail.scale.set(0.45, 1.2, 0.7);
    addEyes(body, 0.32, 0.47, 0.07, 0.028);
  }
  // --- 4. MARINE SWIMMERS (Ondolina, Delfinello) ---
  else if (id === 'ondolina' || id === 'delfinello') {
    const sleek = addPart(body, new THREE.SphereGeometry(0.24, 16, 12), mainMat, 0, 0.26, 0);
    sleek.scale.set(0.92, 0.9, 1.45);
    addPart(body, new THREE.SphereGeometry(0.18, 12, 10), mainMat, 0, 0.42, 0.22);
    // Flippers
    for (const s of [-1, 1]) {
      const fl = addPart(body, new THREE.SphereGeometry(0.12, 8, 6), accMat, s * 0.26, 0.16, 0.08, 0, 0, -s * 0.35);
      fl.scale.set(1.3, 0.35, 0.75);
    }
    // Tail fluke
    const fluke = addPart(body, new THREE.SphereGeometry(0.15, 8, 6), accMat, 0, 0.2, -0.38);
    fluke.scale.set(1.5, 0.25, 0.75);
    if (id === 'delfinello') {
      addPart(body, new THREE.ConeGeometry(0.06, 0.2, 8), mainMat, 0, 0.44, -0.02, -0.4, 0, 0);
      addPart(body, new THREE.ConeGeometry(0.065, 0.16, 8), mainMat, 0, 0.39, 0.42, Math.PI / 2, 0, 0);
    } else {
      addPart(body, new THREE.TorusGeometry(0.18, 0.05, 8, 16), accMat, 0, 0.34, 0.16, Math.PI / 2, 0, 0);
    }
    addEyes(body, 0.45, 0.37, 0.08, 0.03);
  }
  // --- 5. FLOWER & CLOVER CREATURES (Solaris, Papavero, Fogliolo, Trifoglino) ---
  else if (id === 'solaris' || id === 'papavero' || id === 'fogliolo' || id === 'trifoglino') {
    const base = addPart(body, new THREE.SphereGeometry(0.25, 16, 12), mainMat, 0, 0.28, 0);
    base.scale.set(1.02, 0.95, 0.96);
    addPaws(body, accMat, 0.13, 0.06, 0.06, 0.065);
    if (id === 'solaris' || id === 'papavero') {
      const petals = id === 'solaris' ? 10 : 6;
      const pMat = id === 'solaris' ? mainMat : mainMat;
      for (let i = 0; i < petals; i++) {
        const a = (i / petals) * Math.PI * 2;
        const p = addPart(body, new THREE.SphereGeometry(0.11, 8, 6), pMat, Math.cos(a) * 0.28, 0.36 + Math.sin(a) * 0.28, -0.04);
        p.scale.set(1.2, 0.75, 0.45);
      }
      addPart(body, new THREE.SphereGeometry(0.2, 12, 10), accMat, 0, 0.36, 0.04);
      addEyes(body, 0.38, 0.23, 0.085, 0.03);
    } else {
      // Fogliolo & Trifoglino twin/quad clover crown
      addPart(body, new THREE.CylinderGeometry(0.025, 0.03, 0.18, 6), accMat, 0, 0.56, 0);
      const leaves = id === 'trifoglino' ? 4 : 2;
      for (let i = 0; i < leaves; i++) {
        const a = (i / leaves) * Math.PI * 2;
        const lf = addPart(body, new THREE.SphereGeometry(0.11, 8, 6), accMat, Math.cos(a) * 0.13, 0.65, Math.sin(a) * 0.13);
        lf.scale.set(1.25, 0.38, 0.9);
      }
      addEyes(body, 0.33, 0.22, 0.09, 0.034);
    }
  }
  // --- 6. OWLS & BIRDS (Ombraluce, Piumavento, Falchetto, Gabbianello, Celestino) ---
  else if (id === 'ombraluce' || id === 'piumavento' || id === 'falchetto' || id === 'gabbianello' || id === 'celestino') {
    const torso = addPart(body, new THREE.SphereGeometry(0.25, 14, 12), mainMat, 0, 0.38, 0);
    torso.scale.set(0.95, 1.1, 0.95);
    addPart(body, new THREE.SphereGeometry(0.18, 12, 10), creamMat, 0, 0.34, 0.1, 0, 0, 0, false);
    // Beak
    addPart(body, new THREE.ConeGeometry(0.055, 0.13, 6), getMat(0xffb83d), 0, 0.42, 0.28, Math.PI / 2, 0, 0);
    // Tail feathers
    addPart(body, new THREE.BoxGeometry(0.18, 0.05, 0.22), accMat, 0, 0.24, -0.28, 0.35, 0, 0);
    // Articulated Wings
    const wingGeo = new THREE.SphereGeometry(0.17, 10, 8);
    const lw = addPart(body, wingGeo, accMat, -0.28, 0.42, -0.02, 0, 0, 0.35);
    lw.scale.set(1.25, 0.35, 0.85);
    const rw = addPart(body, wingGeo, accMat, 0.28, 0.42, -0.02, 0, 0, -0.35);
    rw.scale.set(1.25, 0.35, 0.85);
    if (id === 'ombraluce') {
      // Owl ear tufts & glowing amber spectacles
      addPart(body, new THREE.ConeGeometry(0.06, 0.14, 6), accMat, -0.14, 0.64, 0.08, 0, 0, 0.35);
      addPart(body, new THREE.ConeGeometry(0.06, 0.14, 6), accMat, 0.14, 0.64, 0.08, 0, 0, -0.35);
      addEyes(body, 0.48, 0.22, 0.09, 0.04, 0xffcc33);
    } else {
      addEyes(body, 0.47, 0.22, 0.085, 0.032);
    }
    body.userData.wings = [lw, rw];
  }
  // --- 7. BUTTERFLIES, MOTHS, BEES & AURORA (Luminella, Falena, Pollinello, Lucciolina, Aurorina) ---
  else if (bio.shape === 'winged') {
    const torso = addPart(body, new THREE.SphereGeometry(0.22, 14, 12), mainMat, 0, 0.4, 0);
    torso.scale.set(0.85, 1.15, 0.85);
    // Upper + Lower twin wings
    const uwGeo = new THREE.SphereGeometry(0.22, 10, 8);
    const lw = addPart(body, uwGeo, accMat, -0.3, 0.5, -0.06, 0, 0, 0.35);
    lw.scale.set(1.25, 0.28, 0.95);
    const rw = addPart(body, uwGeo, accMat, 0.3, 0.5, -0.06, 0, 0, -0.35);
    rw.scale.set(1.25, 0.28, 0.95);
    addPart(body, uwGeo, mainMat, -0.24, 0.32, -0.08, 0, 0, 0.2).scale.set(0.95, 0.24, 0.75);
    addPart(body, uwGeo, mainMat, 0.24, 0.32, -0.08, 0, 0, -0.2).scale.set(0.95, 0.24, 0.75);
    // Antennae
    addPart(body, new THREE.CylinderGeometry(0.015, 0.015, 0.16, 5), darkMat, -0.06, 0.65, 0.08, 0.3, 0, 0.25);
    addPart(body, new THREE.CylinderGeometry(0.015, 0.015, 0.16, 5), darkMat, 0.06, 0.65, 0.08, 0.3, 0, -0.25);
    if (id === 'aurorina' || id === 'lucciolina') {
      addPart(body, new THREE.TorusGeometry(0.18, 0.025, 6, 16), getMat(bio.accentColor, { emissive: bio.accentColor, emissiveIntensity: 0.65 }), 0, 0.75, 0, Math.PI / 2, 0, 0, false);
    }
    addEyes(body, 0.45, 0.19, 0.08, 0.032);
    body.userData.wings = [lw, rw];
  }
  // --- 8. CRABS & BEETLES (Sabbietta, Ferrotto) ---
  else if (bio.shape === 'crab') {
    const shell = addPart(body, new THREE.SphereGeometry(0.29, 14, 10), mainMat, 0, 0.22, 0);
    shell.scale.set(1.25, 0.72, 0.95);
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        addPart(body, new THREE.CylinderGeometry(0.028, 0.022, 0.22, 6), accMat, s * 0.32, 0.1, -0.14 + i * 0.14, 0, 0, s * 0.75);
      }
      // Pincers
      addPart(body, new THREE.SphereGeometry(0.11, 8, 8), accMat, s * 0.3, 0.3, 0.22);
    }
    addEyes(body, 0.32, 0.22, 0.1, 0.032);
  }
  // --- 9. MUSHROOM SPIRIT (Lumifungo) ---
  else if (bio.shape === 'mushroom') {
    addPart(body, new THREE.CylinderGeometry(0.16, 0.21, 0.32, 12), creamMat, 0, 0.16, 0);
    addPaws(body, creamMat, 0.12, 0.05, 0.05, 0.055);
    const capMat = getMat(bio.bodyColor, { emissive: bio.bodyColor, emissiveIntensity: 0.35, roughness: 0.35 });
    const cap = addPart(body, new THREE.SphereGeometry(0.36, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), capMat, 0, 0.28, 0);
    cap.scale.set(1.06, 0.85, 1.06);
    for (const [sx, sy, sz] of [[-0.16, 0.48, 0.14], [0.17, 0.45, 0.1], [0, 0.54, -0.15]]) {
      addPart(body, new THREE.SphereGeometry(0.075, 8, 6), accMat, sx, sy, sz);
    }
    addEyes(body, 0.2, 0.18, 0.075, 0.03);
  }
  // --- 10. GOLEMS & ROCK SPIRITS (Ciotolino, Gemmoro, Quarzo, Lingottino, Siderio) ---
  else if (bio.shape === 'golem') {
    const torso = addPart(body, new THREE.DodecahedronGeometry(0.3, 0), mainMat, 0, 0.34, 0);
    torso.scale.set(1.08, 0.96, 0.9);
    addPart(body, new THREE.BoxGeometry(0.15, 0.32, 0.16), accMat, -0.34, 0.28, 0.04, 0, 0, 0.15);
    addPart(body, new THREE.BoxGeometry(0.15, 0.32, 0.16), accMat, 0.34, 0.28, 0.04, 0, 0, -0.15);
    addPaws(body, accMat, 0.15, 0.05, 0.07, 0.075);
    const crown = addPart(body, new THREE.OctahedronGeometry(0.15, 0), getMat(bio.accentColor, { emissive: bio.accentColor, emissiveIntensity: 0.3 }), 0, 0.65, 0);
    crown.scale.set(0.85, 1.25, 0.85);
    addEyes(body, 0.38, 0.25, 0.1, 0.034);
  }
  // --- 11. JELLYFISH, DROPS & PRISMS (Medusella, Gocciolino, Zefirino, Linfino, Prisma) ---
  else if (bio.shape === 'drop') {
    if (id === 'medusella') {
      const bell = addPart(body, new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), getMat(bio.bodyColor, { opacity: 0.85, emissive: bio.bodyColor, emissiveIntensity: 0.25 }), 0, 0.36, 0);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        addPart(body, new THREE.CylinderGeometry(0.025, 0.015, 0.28, 6), accMat, Math.cos(a) * 0.14, 0.22, Math.sin(a) * 0.14);
      }
      addEyes(body, 0.44, 0.22, 0.085, 0.032);
    } else if (id === 'prisma') {
      const pr = addPart(body, new THREE.OctahedronGeometry(0.3, 0), getMat(bio.bodyColor, { emissive: bio.accentColor, emissiveIntensity: 0.35, roughness: 0.15 }), 0, 0.38, 0);
      pr.scale.set(0.9, 1.25, 0.9);
      addEyes(body, 0.38, 0.22, 0.08, 0.03);
    } else {
      addPart(body, new THREE.SphereGeometry(0.26, 14, 12), mainMat, 0, 0.28, 0);
      addPart(body, new THREE.ConeGeometry(0.21, 0.32, 12), mainMat, 0, 0.52, 0);
      addPart(body, new THREE.SphereGeometry(0.085, 8, 8), accMat, 0, 0.67, 0);
      addEyes(body, 0.32, 0.23, 0.09, 0.034);
    }
  }
  // --- 12. FLAMES & SUN (Bracino, Magmino, Solstizio) ---
  else if (bio.shape === 'flame') {
    const fMat = getMat(bio.bodyColor, { emissive: bio.bodyColor, emissiveIntensity: 0.4, roughness: 0.3 });
    addPart(body, new THREE.SphereGeometry(0.27, 14, 12), fMat, 0, 0.3, 0);
    addPart(body, new THREE.ConeGeometry(0.18, 0.34, 10), getMat(bio.accentColor, { emissive: bio.accentColor, emissiveIntensity: 0.6 }), 0, 0.58, 0);
    if (id === 'solstizio') {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        addPart(body, new THREE.ConeGeometry(0.06, 0.18, 6), accMat, Math.cos(a) * 0.32, 0.32 + Math.sin(a) * 0.32, 0, 0, 0, a - Math.PI / 2);
      }
    }
    addEyes(body, 0.33, 0.24, 0.09, 0.034);
  }
  // --- 13. STARS & COMETS (Corallina, Stellamar, Cometa) ---
  else if (bio.shape === 'star') {
    addPart(body, new THREE.SphereGeometry(0.24, 14, 10), mainMat, 0, 0.36, 0);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
      addPart(body, new THREE.ConeGeometry(0.1, 0.25, 8), accMat, Math.cos(a) * 0.24, 0.36 + Math.sin(a) * 0.24, 0, 0, 0, a - Math.PI / 2);
    }
    addEyes(body, 0.38, 0.22, 0.08, 0.032);
  }
  // --- 14. HEDGEHOGS, MOLES, CLOUD SHEEP, FROGS & PEARL (Muschietto, Talpino, Tuonino, Riccioforo, Nubolino, Nebulina, Rugiadina, Perletta) ---
  else {
    addPart(body, new THREE.SphereGeometry(0.28, 16, 12), mainMat, 0, 0.3, 0);
    addPaws(body, accMat, 0.14, 0.08, 0.06, 0.06);
    if (id === 'nubolino') {
      // Fluffy wool puffs around body
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        addPart(body, new THREE.SphereGeometry(0.15, 10, 8), mainMat, Math.cos(a) * 0.2, 0.34, Math.sin(a) * 0.2);
      }
      addPart(body, new THREE.SphereGeometry(0.16, 12, 10), darkMat, 0, 0.32, 0.22);
      addEyes(body, 0.35, 0.35, 0.075, 0.03, 0xffffff);
    } else if (id === 'rugiadina') {
      // Frog with lilypad hat
      addPart(body, new THREE.CylinderGeometry(0.26, 0.26, 0.04, 14), getMat(0x52bd60), 0, 0.56, 0);
      addPart(body, new THREE.SphereGeometry(0.085, 8, 8), mainMat, -0.12, 0.52, 0.14);
      addPart(body, new THREE.SphereGeometry(0.085, 8, 8), mainMat, 0.12, 0.52, 0.14);
      addEyes(body, 0.52, 0.21, 0.12, 0.032);
    } else if (bio.shape === 'spiky') {
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        addPart(body, new THREE.ConeGeometry(0.08, 0.22, 6), accMat, Math.cos(a) * 0.2, 0.4, Math.sin(a) * 0.2 - 0.06, Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6);
      }
      addEyes(body, 0.34, 0.25, 0.095, 0.034);
    } else {
      addPart(body, new THREE.SphereGeometry(0.1, 10, 8), accMat, -0.18, 0.55, 0);
      addPart(body, new THREE.SphereGeometry(0.1, 10, 8), accMat, 0.18, 0.55, 0);
      addEyes(body, 0.34, 0.25, 0.095, 0.034);
    }
  }

  // Floating Gift Box indicator when creature has a passive gift
  const giftBox = new THREE.Group();
  addPart(giftBox, new THREE.BoxGeometry(0.22, 0.22, 0.22), getMat(0xffdf6b, { emissive: 0xffb833, emissiveIntensity: 0.45 }), 0, 1.05, 0, 0, 0, 0, false);
  addPart(giftBox, new THREE.BoxGeometry(0.24, 0.06, 0.07), getMat(0xff6b8b), 0, 1.05, 0, 0, 0, 0, false);
  giftBox.visible = false;
  root.add(giftBox);

  root.userData = { body, giftBox };
  return root;
}

/* ===== WORLD OBJECTS, LANDMARKS, FURNITURE, CROPS & NODES ===== */
export function createObjectMesh(obj) {
  const g = new THREE.Group();
  const type = obj.type;

  if (type === 'sanctuary') {
    const rep = !!obj.repaired;
    const stone = getMat(rep ? 0xf2ebd9 : 0x7b7870, { roughness: 0.6 });
    const roof = getMat(rep ? 0x56c77d : 0x5c5953, { roughness: 0.45 });
    const crys = getMat(rep ? 0xffe46b : 0x999287, {
      emissive: rep ? 0xffd24d : 0x000000,
      emissiveIntensity: rep ? 0.75 : 0,
      roughness: 0.2
    });
    addPart(g, new THREE.BoxGeometry(1.4, 0.22, 1.4), stone, 0, 0.11, 0);
    for (const sx of [-0.5, 0.5]) {
      for (const sz of [-0.5, 0.5]) {
        addPart(g, new THREE.CylinderGeometry(0.11, 0.13, 0.95, 8), stone, sx, 0.65, sz);
      }
    }
    const dome = addPart(g, new THREE.SphereGeometry(0.76, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), roof, 0, 1.05, 0);
    dome.scale.set(1.05, 0.72, 1.05);
    const orb = addPart(g, new THREE.OctahedronGeometry(0.24, 0), crys, 0, 0.72, 0);
    g.userData.floatPart = orb;
    return g;
  }

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

  if (type === 'terrarium') {
    addPart(g, new THREE.CylinderGeometry(0.42, 0.48, 0.18, 14), getMat(0x7c858c), 0, 0.09, 0);
    addPart(g, new THREE.SphereGeometry(0.4, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), getMat(0xa8ebff, { opacity: 0.45, roughness: 0.1 }), 0, 0.16, 0);
    addPart(g, new THREE.SphereGeometry(0.12, 8, 8), getMat(0x76d67a), 0, 0.24, 0);
    return g;
  }

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
