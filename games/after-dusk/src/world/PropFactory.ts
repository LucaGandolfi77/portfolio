import * as THREE from 'three';
import type { Materials } from '../renderer/ProceduralAssets';

/**
 * Multi-part procedural prop factory: crafts detailed furniture, streetlamps,
 * vehicles, trees, appliances, and architectural dressings so every scene feels
 * rich and handcrafted even without external GLBs.
 */
export class PropFactory {
  constructor(private m: Materials) {}

  private addBox(g: THREE.Group, mat: THREE.Material, x: number, y: number, z: number, w: number, h: number, d: number, cast = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  }

  private addCyl(g: THREE.Group, mat: THREE.Material, x: number, y: number, z: number, rt: number, rb: number, h: number, seg = 12) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  }

  sofa(): THREE.Group {
    const g = new THREE.Group();
    // Wooden legs
    for (const x of [-1.08, 1.08]) for (const z of [-0.36, 0.36]) this.addCyl(g, this.m.darkWood, x, 0.08, z, 0.03, 0.02, 0.16, 8);
    // Base frame & 3 seat cushions
    this.addBox(g, this.m.darkWood, 0, 0.19, 0, 2.36, 0.08, 0.92);
    for (const x of [-0.72, 0, 0.72]) {
      this.addBox(g, this.m.fabricBlue, x, 0.34, 0.04, 0.7, 0.22, 0.82);
      this.addBox(g, this.m.fabricBlue, x, 0.7, -0.32, 0.7, 0.56, 0.22);
    }
    // Armrests
    this.addBox(g, this.m.fabricBlue, -1.14, 0.46, 0, 0.18, 0.46, 0.9);
    this.addBox(g, this.m.fabricBlue, 1.14, 0.46, 0, 0.18, 0.46, 0.9);
    // Throw pillows
    const p1 = this.addBox(g, this.m.fabricRed, -0.82, 0.58, -0.14, 0.36, 0.34, 0.14);
    p1.rotation.set(-0.2, 0.25, 0.12);
    const p2 = this.addBox(g, this.m.fabricCream, 0.82, 0.56, -0.14, 0.34, 0.32, 0.14);
    p2.rotation.set(-0.2, -0.22, -0.1);
    return g;
  }

  coffeeTable(): THREE.Group {
    const g = new THREE.Group();
    this.addBox(g, this.m.warmWood, 0, 0.38, 0, 1.28, 0.06, 0.72);
    this.addBox(g, this.m.darkWood, 0, 0.14, 0, 1.12, 0.03, 0.56);
    for (const x of [-0.56, 0.56]) for (const z of [-0.28, 0.28]) this.addBox(g, this.m.darkWood, x, 0.19, z, 0.05, 0.38, 0.05);
    // Book & mug on top
    this.addBox(g, this.m.fabricRed, -0.25, 0.43, 0.05, 0.24, 0.035, 0.18);
    this.addCyl(g, this.m.ceramic, 0.26, 0.46, -0.06, 0.045, 0.04, 0.1, 10);
    return g;
  }

  bookshelf(): THREE.Group {
    const g = new THREE.Group();
    this.addBox(g, this.m.darkWood, -0.52, 0.95, 0, 0.06, 1.9, 0.36);
    this.addBox(g, this.m.darkWood, 0.52, 0.95, 0, 0.06, 1.9, 0.36);
    this.addBox(g, this.m.darkWood, 0, 0.95, -0.16, 1.04, 1.9, 0.04);
    const bookMats = [this.m.fabricRed, this.m.fabricBlue, this.m.fabricSage, this.m.fabricCream, this.m.warmWood];
    for (let s = 0; s < 5; s++) {
      const y = 0.14 + s * 0.42;
      this.addBox(g, this.m.darkWood, 0, y, 0, 1.0, 0.04, 0.34);
      if (s < 4) {
        for (let b = 0; b < 7; b++) {
          const bh = 0.22 + ((s * 7 + b) % 3) * 0.045;
          this.addBox(g, bookMats[(s + b) % bookMats.length], -0.38 + b * 0.12, y + 0.02 + bh / 2, 0.02, 0.08, bh, 0.22, false);
        }
      }
    }
    return g;
  }

  tvConsole(): { group: THREE.Group; screen: THREE.Mesh } {
    const g = new THREE.Group();
    this.addBox(g, this.m.darkWood, 0, 0.28, 0, 1.72, 0.48, 0.42);
    this.addBox(g, this.m.warmWood, -0.45, 0.28, 0.215, 0.72, 0.36, 0.02);
    this.addBox(g, this.m.warmWood, 0.45, 0.28, 0.215, 0.72, 0.36, 0.02);
    // TV stand + slim bezel + screen
    this.addBox(g, this.m.plastic, 0, 0.56, 0, 0.44, 0.04, 0.24);
    this.addBox(g, this.m.plastic, 0, 0.64, 0, 0.08, 0.16, 0.06);
    this.addBox(g, this.m.plastic, 0, 1.08, 0, 1.52, 0.88, 0.06);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.78), this.m.screen.clone());
    screen.position.set(0, 1.08, 0.035);
    g.add(screen);
    return { group: g, screen };
  }

  bed(): THREE.Group {
    const g = new THREE.Group();
    // Wooden frame + tall paneled headboard
    this.addBox(g, this.m.darkWood, 0, 0.22, 0, 2.02, 0.32, 2.16);
    this.addBox(g, this.m.darkWood, 0, 0.72, -1.04, 2.04, 1.15, 0.09);
    // Mattress + folded duvet
    this.addBox(g, this.m.fabricCream, 0, 0.46, 0, 1.9, 0.22, 2.02);
    this.addBox(g, this.m.fabricRed, 0, 0.54, 0.22, 1.94, 0.16, 1.54);
    // Two soft pillows
    for (const x of [-0.46, 0.46]) {
      const p = this.addBox(g, this.m.paper, x, 0.64, -0.74, 0.72, 0.14, 0.42);
      p.rotation.x = 0.15;
    }
    return g;
  }

  bedsideLamp(): THREE.Group {
    const g = new THREE.Group();
    this.addCyl(g, this.m.brass, 0, 0.04, 0, 0.09, 0.11, 0.08, 12);
    this.addCyl(g, this.m.brass, 0, 0.18, 0, 0.018, 0.022, 0.24, 10);
    const shade = this.addCyl(g, this.m.bulb, 0, 0.34, 0, 0.11, 0.17, 0.2, 16);
    shade.castShadow = false;
    return g;
  }

  kettle(): THREE.Group {
    const g = new THREE.Group();
    this.addCyl(g, this.m.plastic, 0, 0.015, 0, 0.11, 0.12, 0.03, 14);
    this.addCyl(g, this.m.metal, 0, 0.13, 0, 0.085, 0.105, 0.2, 16);
    this.addCyl(g, this.m.plastic, 0, 0.24, 0, 0.08, 0.085, 0.025, 14);
    // Handle & glowing power LED
    this.addBox(g, this.m.plastic, 0.11, 0.14, 0, 0.03, 0.14, 0.03);
    this.addBox(g, this.m.neonAmber, -0.095, 0.06, 0, 0.02, 0.03, 0.02, false);
    return g;
  }

  fridge(): THREE.Group {
    const g = new THREE.Group();
    this.addBox(g, this.m.ceramic, 0, 0.92, 0, 0.82, 1.84, 0.78);
    this.addBox(g, this.m.plastic, 0, 1.24, 0.392, 0.8, 0.02, 0.01);
    this.addCyl(g, this.m.metal, -0.32, 1.48, 0.43, 0.014, 0.014, 0.26, 8);
    this.addCyl(g, this.m.metal, -0.32, 0.92, 0.43, 0.014, 0.014, 0.34, 8);
    return g;
  }

  pottedPlant(): THREE.Group {
    const g = new THREE.Group();
    this.addCyl(g, this.m.fabricRed, 0, 0.16, 0, 0.16, 0.12, 0.32, 12);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const stem = this.addCyl(g, this.m.foliage, Math.cos(a) * 0.07, 0.42, Math.sin(a) * 0.07, 0.012, 0.015, 0.34, 6);
      stem.rotation.z = Math.cos(a) * 0.32;
      stem.rotation.x = Math.sin(a) * 0.32;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), this.m.foliage);
      leaf.scale.set(1.2, 0.3, 0.85);
      leaf.position.set(Math.cos(a) * 0.18, 0.56 + (i % 2) * 0.1, Math.sin(a) * 0.18);
      leaf.rotation.y = -a;
      g.add(leaf);
    }
    return g;
  }

  trashBag(): THREE.Group {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26, 1), this.m.plastic);
    body.scale.set(1.05, 1.2, 1.0);
    body.position.y = 0.26;
    body.castShadow = true;
    g.add(body);
    this.addCyl(g, this.m.plastic, 0, 0.52, 0, 0.085, 0.045, 0.11, 8);
    // Glowing amber tie & subtle floor ring so the errand is unmistakable
    this.addCyl(g, this.m.neonAmber, 0, 0.48, 0, 0.068, 0.068, 0.03, 10);
    // Generous invisible hitbox so raycast catches it easily from standing eye height
    const hit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 1.15, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hit.position.y = 0.58;
    g.add(hit);
    return g;
  }

  /** Grounding contact-shadow disc placed under furniture to eliminate floating look. */
  contactShadow(rx: number, rz: number): THREE.Mesh {
    const m = new THREE.Mesh(
      new THREE.CircleGeometry(1, 20),
      new THREE.MeshBasicMaterial({ color: 0x05060a, transparent: true, opacity: 0.34, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    m.scale.set(rx, rz, 1);
    m.position.y = 0.028;
    return m;
  }

  /** Cozy standing floor lamp with warm amber pleated shade. */
  floorLamp(): THREE.Group {
    const g = new THREE.Group();
    this.addCyl(g, this.m.brass, 0, 0.03, 0, 0.16, 0.19, 0.06, 14);
    this.addCyl(g, this.m.brass, 0, 0.85, 0, 0.02, 0.025, 1.62, 10);
    const shade = this.addCyl(g, this.m.bulb, 0, 1.68, 0, 0.16, 0.25, 0.32, 18);
    shade.castShadow = false;
    return g;
  }

  /** Warm glowing fairy string lights hung along a wall span. */
  fairyLights(span = 3.6, bulbs = 11): THREE.Group {
    const g = new THREE.Group();
    for (let i = 0; i < bulbs; i++) {
      const t = i / (bulbs - 1);
      const x = (t - 0.5) * span;
      const sag = -Math.sin(t * Math.PI) * 0.24;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), this.m.bulb);
      b.position.set(x, sag, 0);
      g.add(b);
    }
    return g;
  }

  /** Cozy decorative hearth / electric fireplace with glowing embers. */
  fireplace(): THREE.Group {
    const g = new THREE.Group();
    this.addBox(g, this.m.brick, 0, 0.65, 0, 1.6, 1.3, 0.45);
    this.addBox(g, this.m.darkWood, 0, 1.34, 0.04, 1.78, 0.1, 0.54);
    // Firebox opening
    this.addBox(g, this.m.plastic, 0, 0.42, 0.18, 0.96, 0.72, 0.14, false);
    // Glowing logs & warm embers
    const log1 = this.addCyl(g, this.m.darkWood, -0.06, 0.22, 0.18, 0.06, 0.06, 0.56, 8);
    log1.rotation.z = Math.PI / 2 - 0.15;
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), this.m.neonAmber);
    ember.scale.set(1.5, 0.7, 0.7);
    ember.position.set(0, 0.25, 0.21);
    g.add(ember);
    return g;
  }

  /** Wooden dining chair. */
  chair(): THREE.Group {
    const g = new THREE.Group();
    for (const x of [-0.18, 0.18]) for (const z of [-0.18, 0.18]) this.addBox(g, this.m.darkWood, x, 0.22, z, 0.04, 0.44, 0.04);
    this.addBox(g, this.m.warmWood, 0, 0.45, 0, 0.44, 0.045, 0.44);
    this.addBox(g, this.m.darkWood, -0.18, 0.72, -0.18, 0.04, 0.52, 0.04);
    this.addBox(g, this.m.darkWood, 0.18, 0.72, -0.18, 0.04, 0.52, 0.04);
    this.addBox(g, this.m.warmWood, 0, 0.84, -0.18, 0.42, 0.22, 0.035);
    return g;
  }

  /** Hallway wooden coat rack with draped scarf. */
  coatRack(): THREE.Group {
    const g = new THREE.Group();
    this.addCyl(g, this.m.darkWood, 0, 0.04, 0, 0.18, 0.24, 0.08, 10);
    this.addCyl(g, this.m.darkWood, 0, 0.9, 0, 0.03, 0.04, 1.72, 10);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const hook = this.addCyl(g, this.m.brass, Math.cos(a) * 0.1, 1.62, Math.sin(a) * 0.1, 0.012, 0.012, 0.2, 6);
      hook.rotation.z = Math.cos(a) * 0.8;
      hook.rotation.x = Math.sin(a) * 0.8;
    }
    this.addBox(g, this.m.fabricRed, 0.09, 1.32, 0.05, 0.14, 0.52, 0.12);
    return g;
  }

  /** Curbside outdoor trash bin placed right outside the front porch. */
  outdoorTrashBin(): THREE.Group {
    const g = new THREE.Group();
    this.addBox(g, this.m.fabricSage, 0, 0.48, 0, 0.58, 0.96, 0.56);
    this.addBox(g, this.m.plastic, 0, 0.99, 0, 0.64, 0.08, 0.62);
    this.addBox(g, this.m.neonAmber, 0, 0.84, 0.29, 0.34, 0.06, 0.02, false);
    const hit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 1.3, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hit.position.y = 0.65;
    g.add(hit);
    return g;
  }

  /** Framed warm art painting for cozy walls. */
  wallPainting(accentHex = 0xd98a5f): THREE.Group {
    const g = new THREE.Group();
    this.addBox(g, this.m.darkWood, 0, 0, 0, 0.82, 0.62, 0.035);
    this.addBox(g, this.m.paper, 0, 0, 0.015, 0.72, 0.52, 0.01, false);
    const artMat = new THREE.MeshStandardMaterial({ color: accentHex, roughness: 0.7 });
    this.addBox(g, artMat, 0, 0, 0.022, 0.58, 0.38, 0.01, false);
    return g;
  }

  ceilingLamp(): THREE.Group {
    const g = new THREE.Group();
    this.addCyl(g, this.m.plastic, 0, -0.14, 0, 0.012, 0.012, 0.28, 8);
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.16, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x262d38, side: THREE.DoubleSide, roughness: 0.6 })
    );
    shade.position.y = -0.32;
    g.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), this.m.bulb);
    bulb.position.y = -0.36;
    g.add(bulb);
    return g;
  }

  streetlamp(): THREE.Group {
    const g = new THREE.Group();
    this.addCyl(g, this.m.plastic, 0, 0.22, 0, 0.14, 0.18, 0.44, 10);
    this.addCyl(g, this.m.plastic, 0, 1.9, 0, 0.055, 0.085, 3.4, 10);
    // Curved neck arm
    this.addBox(g, this.m.plastic, 0, 3.58, -0.32, 0.06, 0.06, 0.68);
    // Lantern hood + glowing diffuser
    this.addCyl(g, this.m.plastic, 0, 3.52, -0.62, 0.06, 0.22, 0.12, 10);
    const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.18, 12), this.m.bulb);
    bulb.position.set(0, 3.38, -0.62);
    g.add(bulb);
    return g;
  }

  parkedCar(tintHex = 0x232d3b): THREE.Group {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: tintHex, metalness: 0.45, roughness: 0.35 });
    // Chassis + cabin
    this.addBox(g, bodyMat, 0, 0.48, 0, 3.2, 0.56, 1.56);
    this.addBox(g, bodyMat, -0.15, 0.94, 0, 1.65, 0.42, 1.36);
    // Windshields
    this.addBox(g, this.m.glass, 0.66, 0.92, 0, 0.06, 0.36, 1.28, false);
    this.addBox(g, this.m.glass, -0.96, 0.92, 0, 0.06, 0.36, 1.28, false);
    this.addBox(g, this.m.glass, -0.15, 0.92, 0.69, 1.4, 0.34, 0.04, false);
    this.addBox(g, this.m.glass, -0.15, 0.92, -0.69, 1.4, 0.34, 0.04, false);
    // 4 Wheels + rims
    for (const x of [-1.02, 1.02]) {
      for (const z of [-0.76, 0.76]) {
        const w = this.addCyl(g, this.m.plastic, x, 0.26, z, 0.26, 0.26, 0.18, 14);
        w.rotation.x = Math.PI / 2;
        const rim = this.addCyl(g, this.m.metal, x, 0.26, z + Math.sign(z) * 0.06, 0.13, 0.13, 0.08, 10);
        rim.rotation.x = Math.PI / 2;
      }
    }
    // Headlights & taillights
    for (const z of [-0.52, 0.52]) {
      this.addBox(g, this.m.bulb, 1.61, 0.52, z, 0.04, 0.12, 0.24, false);
      this.addBox(g, this.m.eye, -1.61, 0.52, z, 0.04, 0.12, 0.26, false);
    }
    return g;
  }

  tree(h = 3.4): THREE.Group {
    const g = new THREE.Group();
    this.addCyl(g, this.m.darkWood, 0, h * 0.42, 0, 0.13, 0.22, h * 0.84, 9);
    const layers = [
      { y: h * 0.82, r: 1.35, h: 1.8 },
      { y: h * 1.15, r: 1.05, h: 1.6 },
      { y: h * 1.42, r: 0.68, h: 1.2 },
    ];
    for (const l of layers) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(l.r, l.h, 8), this.m.foliage);
      cone.position.y = l.y;
      cone.castShadow = true;
      g.add(cone);
    }
    return g;
  }

  parkBench(): THREE.Group {
    const g = new THREE.Group();
    for (const x of [-0.62, 0.62]) {
      this.addBox(g, this.m.plastic, x, 0.24, 0, 0.06, 0.48, 0.48);
      this.addBox(g, this.m.plastic, x, 0.64, -0.22, 0.06, 0.44, 0.05);
    }
    this.addBox(g, this.m.warmWood, 0, 0.46, 0.08, 1.5, 0.05, 0.18);
    this.addBox(g, this.m.warmWood, 0, 0.46, -0.12, 1.5, 0.05, 0.18);
    this.addBox(g, this.m.warmWood, 0, 0.72, -0.2, 1.5, 0.22, 0.05);
    return g;
  }

  chargerKiosk(): THREE.Group {
    const g = new THREE.Group();
    this.addBox(g, this.m.plastic, 0, 0.65, 0, 0.38, 1.3, 0.26);
    this.addBox(g, this.m.screen, 0, 0.96, 0.135, 0.28, 0.34, 0.02, false);
    this.addBox(g, this.m.neonAmber, 0, 1.22, 0.135, 0.24, 0.05, 0.02, false);
    return g;
  }

  barCounter(): THREE.Group {
    const g = new THREE.Group();
    this.addBox(g, this.m.darkWood, 0, 0.54, 0, 6.8, 1.08, 0.78);
    this.addBox(g, this.m.warmWood, 0, 1.1, 0.06, 7.0, 0.08, 0.94);
    this.addCyl(g, this.m.brass, 0, 0.18, 0.46, 0.02, 0.02, 6.6, 8).rotation.z = Math.PI / 2;
    // Neon sign behind bar
    this.addBox(g, this.m.neonPink, 0, 2.25, -0.5, 2.4, 0.26, 0.06, false);
    return g;
  }

  headstone(): THREE.Group {
    const g = new THREE.Group();
    this.addBox(g, this.m.concrete, 0, 0.1, 0, 0.74, 0.2, 0.34);
    this.addBox(g, this.m.concrete, 0, 0.56, 0, 0.58, 0.78, 0.18);
    const top = this.addCyl(g, this.m.concrete, 0, 0.94, 0, 0.29, 0.29, 0.18, 12);
    top.rotation.x = Math.PI / 2;
    return g;
  }

  boat(): THREE.Group {
    const g = new THREE.Group();
    this.addBox(g, this.m.fabricCream, 0, 0.42, 0, 4.4, 0.72, 1.65);
    this.addBox(g, this.m.fabricBlue, 0, 0.56, 0, 4.46, 0.14, 1.7);
    this.addBox(g, this.m.darkWood, -0.6, 1.12, 0, 1.35, 0.85, 1.2);
    this.addBox(g, this.m.glass, 0.09, 1.2, 0, 0.04, 0.42, 1.0, false);
    return g;
  }

  /** Glowing beacon pedestal for objective / errand / clue props in city zones. */
  objectiveProp(colorHex: number, isFlat: boolean): THREE.Group {
    const g = new THREE.Group();
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x161d28,
      emissive: colorHex,
      emissiveIntensity: 1.15,
      roughness: 0.3,
    });
    this.addBox(g, this.m.darkWood, 0, 0.42, 0, 0.52, 0.84, 0.52);
    this.addBox(g, glowMat, 0, 0.94, 0, isFlat ? 0.38 : 0.26, isFlat ? 0.06 : 0.22, isFlat ? 0.3 : 0.2);
    return g;
  }
}
