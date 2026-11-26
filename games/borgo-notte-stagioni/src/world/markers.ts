import * as THREE from 'three';

/* Glowing columns for jobs and checkpoints, visible from far away. */
export class Marker {
  readonly group = new THREE.Group();
  private ring: THREE.Mesh;
  private beam: THREE.Mesh;

  constructor(color: number, radius = 3.2) {
    const beamMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
    this.beam = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 26, 18, 1, true).translate(0, 13, 0), beamMat);
    const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide });
    this.ring = new THREE.Mesh(new THREE.RingGeometry(radius * 0.8, radius, 28).rotateX(-Math.PI / 2), ringMat);
    this.ring.position.y = 0.15;
    this.beam.renderOrder = 4;
    this.ring.renderOrder = 4;
    this.group.add(this.beam, this.ring);
  }

  at(x: number, z: number): this {
    this.group.position.set(x, 0, z);
    return this;
  }

  update(t: number): void {
    const s = 1 + Math.sin(t * 4) * 0.06;
    this.ring.scale.set(s, 1, s);
    (this.beam.material as THREE.MeshBasicMaterial).opacity = 0.22 + Math.sin(t * 3) * 0.08;
  }
}
