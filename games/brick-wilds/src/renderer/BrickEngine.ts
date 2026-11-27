import * as THREE from 'three';

export interface BrickInstanceSpec {
  x: number;
  y: number;
  z: number;
  sx?: number;
  sy?: number;
  sz?: number;
  ry?: number;
  color: number;
}

/**
 * Procedural ABS glossy toy-block engine.
 * Caches shared geometries and PBR clearcoat materials so entire diorama worlds
 * render in < 45 draw calls via THREE.InstancedMesh.
 */
export class BrickEngine {
  private readonly matCache = new Map<string, THREE.MeshPhysicalMaterial>();
  private readonly boxGeo = new THREE.BoxGeometry(1, 1, 1);
  private readonly studGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.18, 10);
  private readonly cylGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 12);
  private readonly slopeGeo: THREE.BufferGeometry;
  private readonly instancedMaterial: THREE.MeshPhysicalMaterial;
  private readonly instancedEmissiveMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.slopeGeo = this.createSlopeGeometry();
    this.instancedMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.24,
      metalness: 0.04,
      clearcoat: 0.65,
      clearcoatRoughness: 0.16,
    });
    this.instancedEmissiveMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveIntensity: 0.45,
    });
  }

  private createSlopeGeometry(): THREE.BufferGeometry {
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, -0.5);
    shape.lineTo(0.5, -0.5);
    shape.lineTo(0.5, 0.5);
    shape.lineTo(-0.5, -0.5);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
    geo.translate(0, 0, -0.5);
    geo.computeVertexNormals();
    return geo;
  }

  getMaterial(color: number, options?: { emissive?: boolean; emissiveIntensity?: number; transparent?: boolean; opacity?: number }): THREE.MeshPhysicalMaterial {
    const emissive = options?.emissive ?? false;
    const emissiveIntensity = options?.emissiveIntensity ?? (emissive ? 0.75 : 0);
    const transparent = options?.transparent ?? false;
    const opacity = options?.opacity ?? 1;
    const key = `${color}-${emissive}-${emissiveIntensity.toFixed(2)}-${transparent}-${opacity.toFixed(2)}`;
    const existing = this.matCache.get(key);
    if (existing) return existing;

    const mat = new THREE.MeshPhysicalMaterial({
      color,
      roughness: emissive ? 0.18 : 0.24,
      metalness: 0.05,
      clearcoat: transparent ? 0.9 : 0.68,
      clearcoatRoughness: 0.15,
      emissive: emissive ? color : 0x000000,
      emissiveIntensity,
      transparent,
      opacity,
    });
    this.matCache.set(key, mat);
    return mat;
  }

  getBoxGeo(): THREE.BoxGeometry {
    return this.boxGeo;
  }

  getStudGeo(): THREE.CylinderGeometry {
    return this.studGeo;
  }

  getCylGeo(): THREE.CylinderGeometry {
    return this.cylGeo;
  }

  getSlopeGeo(): THREE.BufferGeometry {
    return this.slopeGeo;
  }

  /**
   * Creates a single glossy snap-block mesh with optional top connector pips.
   */
  createBrick(
    w: number,
    h: number,
    d: number,
    color: number,
    options?: { studs?: boolean; emissive?: boolean; transparent?: boolean; opacity?: number; shape?: 'box' | 'cylinder' | 'slope' },
  ): THREE.Group {
    const group = new THREE.Group();
    const mat = this.getMaterial(color, options);
    const shape = options?.shape ?? 'box';

    const geo = shape === 'cylinder' ? this.cylGeo : shape === 'slope' ? this.slopeGeo : this.boxGeo;
    const body = new THREE.Mesh(geo, mat);
    body.scale.set(w, h, d);
    body.castShadow = !options?.transparent;
    body.receiveShadow = true;
    group.add(body);

    if ((options?.studs ?? true) && shape === 'box') {
      const cols = Math.max(1, Math.min(4, Math.round(w)));
      const rows = Math.max(1, Math.min(4, Math.round(d)));
      const stepX = w / cols;
      const stepZ = d / rows;
      for (let ix = 0; ix < cols; ix++) {
        for (let iz = 0; iz < rows; iz++) {
          const stud = new THREE.Mesh(this.studGeo, mat);
          stud.position.set(
            -w / 2 + stepX * (ix + 0.5),
            h / 2 + 0.08,
            -d / 2 + stepZ * (iz + 0.5),
          );
          const studScale = Math.min(stepX, stepZ) * 0.9;
          stud.scale.set(studScale, 1, studScale);
          stud.receiveShadow = true;
          group.add(stud);
        }
      }
    }

    return group;
  }

  /**
   * Batches hundreds of static bricks + top pips into 2 InstancedMeshes (2 draw calls total).
   */
  createInstancedBatch(
    specs: BrickInstanceSpec[],
    options?: { includeStuds?: boolean; emissive?: boolean; castShadow?: boolean },
  ): THREE.Group {
    const group = new THREE.Group();
    if (specs.length === 0) return group;

    const mat = options?.emissive ? this.instancedEmissiveMaterial : this.instancedMaterial;
    const bodies = new THREE.InstancedMesh(this.boxGeo, mat, specs.length);
    bodies.castShadow = options?.castShadow ?? true;
    bodies.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const col = new THREE.Color();

    let totalStuds = 0;
    const includeStuds = options?.includeStuds ?? true;
    if (includeStuds) {
      for (const s of specs) {
        const cx = Math.max(1, Math.min(3, Math.round(s.sx ?? 1)));
        const cz = Math.max(1, Math.min(3, Math.round(s.sz ?? 1)));
        totalStuds += cx * cz;
      }
    }

    const studs = includeStuds && totalStuds > 0
      ? new THREE.InstancedMesh(this.studGeo, mat, totalStuds)
      : null;
    if (studs) {
      studs.receiveShadow = true;
    }

    let studIdx = 0;
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i];
      const sx = s.sx ?? 1;
      const sy = s.sy ?? 1;
      const sz = s.sz ?? 1;
      const ry = s.ry ?? 0;

      dummy.position.set(s.x, s.y, s.z);
      dummy.rotation.set(0, ry, 0);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      bodies.setMatrixAt(i, dummy.matrix);
      col.setHex(s.color);
      bodies.setColorAt(i, col);

      if (studs) {
        const cx = Math.max(1, Math.min(3, Math.round(sx)));
        const cz = Math.max(1, Math.min(3, Math.round(sz)));
        const stepX = sx / cx;
        const stepZ = sz / cz;
        const cosR = Math.cos(ry);
        const sinR = Math.sin(ry);
        const studScale = Math.min(stepX, stepZ) * 0.85;

        for (let ix = 0; ix < cx; ix++) {
          for (let iz = 0; iz < cz; iz++) {
            const lx = -sx / 2 + stepX * (ix + 0.5);
            const lz = -sz / 2 + stepZ * (iz + 0.5);
            const wx = s.x + lx * cosR - lz * sinR;
            const wz = s.z + lx * sinR + lz * cosR;
            dummy.position.set(wx, s.y + sy / 2 + 0.08, wz);
            dummy.rotation.set(0, ry, 0);
            dummy.scale.set(studScale, 1, studScale);
            dummy.updateMatrix();
            studs.setMatrixAt(studIdx, dummy.matrix);
            studs.setColorAt(studIdx, col);
            studIdx++;
          }
        }
      }
    }

    bodies.instanceMatrix.needsUpdate = true;
    if (bodies.instanceColor) bodies.instanceColor.needsUpdate = true;
    group.add(bodies);

    if (studs) {
      studs.instanceMatrix.needsUpdate = true;
      if (studs.instanceColor) studs.instanceColor.needsUpdate = true;
      group.add(studs);
    }

    return group;
  }

  dispose(): void {
    this.boxGeo.dispose();
    this.studGeo.dispose();
    this.cylGeo.dispose();
    this.slopeGeo.dispose();
    this.instancedMaterial.dispose();
    this.instancedEmissiveMaterial.dispose();
    for (const mat of this.matCache.values()) {
      mat.dispose();
    }
    this.matCache.clear();
  }
}
